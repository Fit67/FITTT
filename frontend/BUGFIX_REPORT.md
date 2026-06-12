# Blank White Screen — Root Cause Analysis & Fix Report

## Summary

The blank white screen on `/shop/products/[slug]` and `/shop/cart` was caused by
**5 distinct bugs**, all silent — no console error was shown to the user, just
a white page. They interact: any one of them triggers the error boundary, and
the broken error boundary made all of them appear as a blank screen.

---

## Bug 1 — `app/error.tsx` had `<html>` and `<body>` tags  ← PRIMARY CAUSE

**File:** `app/error.tsx`  
**Severity:** Critical — makes every other error invisible

```tsx
// BEFORE (broken)
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">        // ← WRONG in error.tsx
      <body>                // ← WRONG in error.tsx
        ...
      </body>
    </html>
  )
}
```

**What happened:** When any error was thrown on a shop page, Next.js replaced
the page content with the error boundary component. Because that component
output `<html><body>` tags *inside* an already-existing `<html><body>`, the
browser received malformed HTML and rendered nothing — a blank white page.

The `<html>` and `<body>` tags are only valid in `app/global-error.tsx`
(which catches crashes in the root layout itself). `app/error.tsx` renders
*inside* the existing layout and must not include them.

**Fix:** Removed `<html>/<body>` from `app/error.tsx`. Created a separate
`app/global-error.tsx` with those tags for true root-level crashes.

---

## Bug 2 — No shop-level error boundary

**File:** `app/shop/error.tsx` — **did not exist**  
**Severity:** High

Without `app/shop/error.tsx`, any error thrown inside `/shop/*` pages bubbled
all the way up to the broken `app/error.tsx`, which compounded Bug 1.

Even after fixing Bug 1, having a shop-level boundary means errors are caught
closer to the source and show a contextual recovery UI ("Back to Shop") instead
of a generic app-level message.

**Fix:** Created `app/shop/error.tsx` with a shop-specific recovery UI.

---

## Bug 3 — Zustand localStorage stores crash during SSR

**Files:** `store/slices/cartStore.ts`, `store/slices/uiStore.ts`  
**Severity:** High — blank page on first load / navigation

```ts
// BEFORE (broken)
storage: createJSONStorage(() => localStorage),
//                                ^ throws ReferenceError on the server
```

Next.js renders pages on the server before sending HTML to the browser.
`localStorage` does not exist in the Node.js environment. When Zustand tried
to initialize with `localStorage` during server-side rendering, it threw a
`ReferenceError`. This silently crashed the render and showed a blank page.

**Fix:** Replaced `() => localStorage` with an `ssrSafeStorage` wrapper that
checks `typeof window === 'undefined'` before accessing storage, and wraps
all calls in try-catch for additional safety.

```ts
// AFTER (fixed)
const ssrSafeStorage = {
  getItem:    (name) => typeof window === 'undefined' ? null : localStorage.getItem(name),
  setItem:    (name, value) => { if (typeof window !== 'undefined') localStorage.setItem(name, value) },
  removeItem: (name) => { if (typeof window !== 'undefined') localStorage.removeItem(name) },
}
```

---

## Bug 4 — Cart page hydration mismatch

**File:** `app/shop/cart/page.tsx`  
**Severity:** High — blank page when navigating to cart

The cart page reads from the cart store. On the server, the store starts empty
(localStorage doesn't exist). On the client, it rehydrates from localStorage
with the real items. React detected this SSR/CSR content mismatch, threw a
hydration error, and unmounted the entire tree — blank page.

**Fix:** Added a `mounted` state gate that renders a skeleton on the first
pass (server + initial client render), then swaps to the real cart content
after `useEffect` fires (client-only, after hydration is complete).

```tsx
const [mounted, setMounted] = React.useState(false)
React.useEffect(() => { setMounted(true) }, [])

if (!mounted) return <CartSkeleton />
```

---

## Bug 5 — Product page `isError` state not handled

**File:** `app/shop/products/[slug]/page.tsx`  
**Severity:** Medium — blank page when API returns an error

```tsx
// BEFORE (broken)
const { data: product, isLoading } = useProduct(slug)
// isError never checked — if API call fails, isLoading=false and product=undefined
// The page fell through to render nothing (no Navbar, no Footer, no content)
```

When the API returned an error (network issue, 404, 500), `isLoading` became
`false` and `product` remained `undefined`. The component skipped the loading
skeleton and the not-found state, and rendered an empty fragment — blank page.

**Fix:** Added explicit `isError` handling that shows a retry screen.

Also fixed **null-safe guards** on `product.images`, `product.variants`,
`product.tags`, `product.ratings`, and `product.inventory` — all of which
could be `undefined` if the API returned a partial product object, causing
runtime crashes on `.length` or nested property access.

---

## Bug 6 — `sessionStorage` accessed without SSR guard in authStore + api-client

**Files:** `store/slices/authStore.ts`, `lib/api-client.ts`  
**Severity:** Medium — crashes pages that load while authenticated

Similar to Bug 3 but for `sessionStorage`. The auth store's persist config
and the Axios request interceptor both accessed `sessionStorage` directly.
On the server this throws a `ReferenceError`.

**Fix:** Added `ssrSafeSessionStorage` wrapper and try-catch blocks.

---

## Files changed

| File | Change |
|------|--------|
| `app/error.tsx` | Removed `<html>/<body>` tags (primary blank-page cause) |
| `app/global-error.tsx` | Created — true root error boundary with `<html>/<body>` |
| `app/shop/error.tsx` | Created — shop-level error boundary (was missing) |
| `app/shop/cart/page.tsx` | Added hydration guard + null-safe item filter |
| `app/shop/products/[slug]/page.tsx` | Added `isError` state + null-safe guards + Next.js 15 params compat |
| `store/slices/cartStore.ts` | SSR-safe localStorage storage |
| `store/slices/uiStore.ts` | SSR-safe localStorage for wishlist + recentlyViewed |
| `store/slices/authStore.ts` | SSR-safe sessionStorage + full logout implementation |
| `lib/api-client.ts` | SSR-safe sessionStorage in request interceptor |

---

## How to verify the fixes

1. **Hard reload** `/shop/cart` — should show skeleton briefly, then cart or empty state
2. **Navigate** from any product listing → product detail → "Add to Cart" → cart icon
3. **Open DevTools → Console** — no hydration warnings, no ReferenceErrors
4. **Open DevTools → Network → offline mode** — product page should show "Failed to load" retry screen instead of blank
5. **Throw a test error** by temporarily adding `throw new Error('test')` inside CartPage — should show the shop error boundary UI, not a blank page
