import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, ToastOptions, ModalState } from '@/types'

// ─── Wishlist Store ────────────────────────────────────────────
interface WishlistStore {
  items:      Product[]
  addItem:    (product: Product) => void
  removeItem: (productId: string) => void
  toggle:     (product: Product) => boolean   // true = added, false = removed
  hasItem:    (productId: string) => boolean
  clear:      () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product) {
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
        return !has   // true = now in wishlist, false = removed
      },

      hasItem: (productId) => get().items.some(i => i._id === productId),

      clear: () => set({ items: [] }),
    }),
    { name: 'zeno-wishlist', storage: createJSONStorage(() => localStorage) },
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
        set({
          products: [
            product,
            ...get().products.filter(p => p._id !== product._id),
          ].slice(0, MAX_RECENT),
        })
      },

      clear: () => set({ products: [] }),
    }),
    { name: 'zeno-recently-viewed', storage: createJSONStorage(() => localStorage) },
  ),
)
