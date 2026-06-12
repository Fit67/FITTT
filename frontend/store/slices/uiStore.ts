import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, ToastOptions, ModalState } from '@/types'
import apiClient from '@/lib/api-client'

/**
 * SSR-safe localStorage wrapper.
 *
 * BUG FIXED: Same issue as cartStore — calling localStorage in a Zustand
 * persist store crashes during SSR because localStorage doesn't exist on
 * the server. This wrapper guards against it.
 *
 * Affected stores: wishlist, recentlyViewed.
 */
const ssrSafeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(name, value) } catch { /* storage full */ }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(name) } catch { /* fail silently */ }
  },
}

function isProductLike(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false
  const product = value as Partial<Product>
  return (
    typeof product._id === 'string' &&
    product._id.length > 0 &&
    typeof product.name === 'string' &&
    typeof product.slug === 'string' &&
    Number.isFinite(product.price)
  )
}

function sanitizeProducts(products: unknown): Product[] {
  if (!Array.isArray(products)) return []
  const seen = new Set<string>()

  return products.filter((product): product is Product => {
    if (!isProductLike(product) || seen.has(product._id)) return false
    seen.add(product._id)
    return true
  })
}

// ─── Wishlist Store ────────────────────────────────────────────
interface WishlistStore {
  items:      Product[]
  addItem:    (product: Product) => void
  removeItem: (productId: string) => void
  toggle:     (product: Product) => boolean
  hasItem:    (productId: string) => boolean
  clear:      () => void
  setItems:   (items: Product[]) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product) {
        if (!isProductLike(product)) return
        if (get().hasItem(product._id)) return
        set(state => ({ items: [...state.items, product] }))
      },

      removeItem(productId) {
        set(state => ({ items: state.items.filter(i => i._id !== productId) }))
      },

      toggle(product): boolean {
        const has = get().hasItem(product._id)
        if (has) {
          get().removeItem(product._id)
        } else {
          get().addItem(product)
        }

        // Optimistically sync with backend if user is logged in
        if (typeof window !== 'undefined' && sessionStorage.getItem('accessToken')) {
          apiClient.post('/auth/wishlist/toggle', { productId: product._id }).catch(console.error)
        }

        return !has
      },

      hasItem: (productId) => get().items.some(i => i._id === productId),
      clear:   () => set({ items: [] }),
      setItems:(items) => set({ items: sanitizeProducts(items) }),
    }),
    {
      name: 'doctorfit-wishlist',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: state => ({ items: sanitizeProducts(state.items) }),
      onRehydrateStorage: () => state => {
        if (!state) return
        state.items = sanitizeProducts(state.items)
      },
    },
  ),
)

// ─── Toast Store ───────────────────────────────────────────────
interface ToastStore {
  toasts: ToastOptions[]
  push:   (toast: Omit<ToastOptions, 'id'>) => void
  remove: (id: string) => void
  clear:  () => void
}

let _toastId = 0

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  push(toast) {
    const id       = `toast-${++_toastId}`
    const duration = toast.duration ?? 4000
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
    if (duration > 0) {
      setTimeout(
        () => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
        duration,
      )
    }
  },

  remove: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  clear:  ()   => set({ toasts: [] }),
}))

// ─── UI / Modal Store ──────────────────────────────────────────
interface UIStore {
  modal:          ModalState
  isSidebarOpen:  boolean
  isSearchOpen:   boolean
  openModal:      (type: string, data?: unknown) => void
  closeModal:     () => void
  toggleSidebar:  () => void
  openSearch:     () => void
  closeSearch:    () => void
}

export const useUIStore = create<UIStore>()((set) => ({
  modal:          { isOpen: false, type: null },
  isSidebarOpen:  false,
  isSearchOpen:   false,

  openModal:     (type, data) => set({ modal: { isOpen: true, type, data } }),
  closeModal:    ()           => set({ modal: { isOpen: false, type: null } }),
  toggleSidebar: ()           => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
  openSearch:    ()           => set({ isSearchOpen: true }),
  closeSearch:   ()           => set({ isSearchOpen: false }),
}))

// ─── Recently Viewed Store ─────────────────────────────────────
interface RecentlyViewedStore {
  products:   Product[]
  addProduct: (product: Product) => void
  clear:      () => void
}

const MAX_RECENT = 12

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct(product) {
        if (!isProductLike(product)) return
        set({
          products: [
            product,
            ...sanitizeProducts(get().products).filter(p => p._id !== product._id),
          ].slice(0, MAX_RECENT),
        })
      },

      clear: () => set({ products: [] }),
    }),
    {
      name: 'doctorfit-recently-viewed',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: state => ({ products: sanitizeProducts(state.products).slice(0, MAX_RECENT) }),
      onRehydrateStorage: () => state => {
        if (!state) return
        state.products = sanitizeProducts(state.products).slice(0, MAX_RECENT)
      },
    },
  ),
)
