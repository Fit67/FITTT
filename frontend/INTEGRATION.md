# Smooth Animation Upgrade — Integration Guide

## What was changed and why

### 🧠 The core problem
Your site felt "frozen" between pages because:
1. `template.tsx` only animated auth routes (`/register`), not the rest of the app
2. No visual feedback when links were clicked (blank gap before new page loads)
3. `transition-all` on cards was triggering layout recalculations, not just GPU compositing
4. No scroll-reveal — content appeared instantly with no choreography

---

## Files to copy into your project

```
output/
├── app/
│   ├── globals.css          ← Enhanced animations, new keyframes, gold scrollbar
│   ├── layout.tsx           ← Adds <NavigationProgress> to root
│   ├── loading.tsx          ← Premium branded loader
│   └── template.tsx         ← Page transitions for ALL routes (not just auth)
│
├── lib/
│   └── motion.ts            ← NEW: Central animation tokens (springs, easings, variants)
│
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       ← Smooth spring hover, animated nav pill, better dropdown
│   └── ui/
│       ├── AnimatedSection.tsx   ← NEW: Drop-in scroll-reveal wrappers
│       ├── AmbientParticles.tsx  ← NEW: Floating gold particles + glow orbs
│       └── NavigationProgress.tsx ← NEW: Gold bar that appears instantly on link click
│
└── modules/
    ├── hero/
    │   └── HeroSection.tsx  ← Particles + glow orbs, blur-clear headline entrance
    └── product-card/
        └── ProductCard.tsx  ← Stagger-reveal grid, GPU-only transitions, skeleton timing
```

---

## Step-by-step integration

### 1. Copy all files
Replace each file in your `frontend/` directory with the corresponding file from `output/`.

### 2. Use scroll-reveal on your sections

Wrap any section you want to animate in on scroll. Open `PromoBanners.tsx`, `CategoriesGrid.tsx`, etc. and wrap content:

```tsx
// Before
import { FeaturedProducts } from './FeaturedProducts'

// After — product grids use StaggerContainer
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'
import { FadeUp, FadeUpGroup, FadeUpItem } from '@/components/ui/AnimatedSection'

// Wrap your section heading:
<FadeUp>
  <SectionHeader label="Featured" title="Top Picks" />
</FadeUp>

// Wrap your product grid:
<StaggerContainer count={products.length} className="product-grid">
  {products.map(p => (
    <StaggerItem key={p._id}>
      <ProductCard product={p} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### 3. Add ambient particles to any hero/banner section

```tsx
import { AmbientParticles, GlowOrbs, ShimmerLine } from '@/components/ui/AmbientParticles'

// Inside a <section> with position: relative / overflow: hidden
<section className="relative overflow-hidden">
  <GlowOrbs />
  <AmbientParticles count={12} />
  {/* your content */}
</section>
```

### 4. Apply to shop pages (products list, cart, etc.)

Wrap the `<main>` element in each shop page:

```tsx
import { PageEnter } from '@/components/ui/AnimatedSection'

export default function ProductsPage() {
  return (
    <PageEnter>
      <Navbar />
      <main>...</main>
      <Footer />
    </PageEnter>
  )
}
```

### 5. Stagger product grids on the products listing page

In `app/shop/products/page.tsx`, find the grid rendering and update:

```tsx
// Before
<div className="product-grid">
  {isLoading
    ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
    : products.map(p => <ProductCard key={p._id} product={p} />)
  }
</div>

// After
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection'

<StaggerContainer count={products?.length ?? 12} className="product-grid">
  {isLoading
    ? Array.from({ length: 12 }).map((_, i) => (
        <StaggerItem key={i}><ProductCardSkeleton index={i} /></StaggerItem>
      ))
    : products.map(p => (
        <StaggerItem key={p._id}><ProductCard product={p} /></StaggerItem>
      ))
  }
</StaggerContainer>
```

---

## What each change fixes

| Change | What it fixes |
|--------|---------------|
| `template.tsx` rewrite | Freezing between ALL page navigations, not just auth |
| `NavigationProgress` | The "did it register my click?" dead zone — users see instant feedback |
| `motion.ts` spring tokens | Consistent spring physics everywhere → coherent, premium feel |
| `globals.css` transitions | `transition-all` → specific GPU properties, eliminates layout jank |
| `ProductCard` hover | `translateY` + `box-shadow` only (no width/height) → 60fps guaranteed |
| `AnimatedSection` wrappers | Scroll-triggered reveals replace jarring instant appearance |
| `AmbientParticles` | Adds life/depth to hero sections; matches gold/amber brand palette |
| Navbar pill animation | `layoutId` shared animation — nav indicator glides between items |
| Skeleton `index` prop | Staggered shimmer timing → feels alive, not frozen |
| `will-change: transform` | Promotes animated elements to their own compositing layer |

---

## Performance notes

- All animations use **transform + opacity only** — zero layout triggers
- `will-change: transform` is applied only to actively animated elements
- `AmbientParticles` is hidden on mobile (`hidden sm:block`) for battery
- `@media (prefers-reduced-motion: reduce)` disables all animations
- `useReducedMotion()` from Framer Motion is checked in HeroSection
- `viewport={{ once: true }}` means scroll animations fire once, not repeatedly
- Blur filter on page transition is only `6px` max — fast to compute

---

## Quick test checklist

- [ ] Click a nav link — gold bar appears immediately at top
- [ ] New page slides in with blur-clear (0.35s) — no freeze
- [ ] Scroll past the hero — category/product sections fade up in sequence  
- [ ] Hover a product card — lifts 5px with shadow, image scales smoothly
- [ ] Add to cart — button springs with scale bounce
- [ ] Open mobile menu — drawer slides down smoothly
- [ ] Toggle dark mode — sun/moon icon rotates in/out
- [ ] Nav active link — pill animates between items with `layoutId`
