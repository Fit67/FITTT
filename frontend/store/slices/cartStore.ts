import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Cart, CartItem, Coupon, Product, ProductVariant } from '@/types'
import { storeConfig } from '@/config/store'

interface CartStore extends Cart {
  addItem:       (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem:    (productId: string, variantId?: string) => void
  updateQty:     (productId: string, quantity: number, variantId?: string) => void
  applyCoupon:   (coupon: Coupon) => void
  removeCoupon:  () => void
  clearCart:     () => void
  itemCount:     number
  hasItem:       (productId: string, variantId?: string) => boolean
  getItemQty:    (productId: string, variantId?: string) => number
}

function sanitizeItems(items: unknown = []) {
  if (!Array.isArray(items)) return []

  return items.filter((item): item is CartItem =>
    item?.product?._id &&
    typeof item.product._id === 'string' &&
    typeof item.product.name === 'string' &&
    typeof item.product.slug === 'string' &&
    Number.isFinite(item.product.price) &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0,
  ).map(item => ({
    ...item,
    quantity: Math.min(Math.floor(item.quantity), 99),
  }))
}

function calcTotals(items: unknown, coupon?: Coupon) {
  const safeItems = sanitizeItems(items)
  const subtotal = safeItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const { freeDeliveryThreshold, standardDeliveryFee } = storeConfig.delivery
  const rawDelivery = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : standardDeliveryFee

  let discount = 0
  if (coupon) {
    if (coupon.type === 'percentage')    discount = subtotal * (coupon.value / 100)
    if (coupon.type === 'fixed')         discount = Math.min(coupon.value, subtotal)
    if (coupon.type === 'free_shipping') discount = rawDelivery
  }

  const deliveryFee = coupon?.type === 'free_shipping' ? 0 : rawDelivery
  const tax         = 0
  const total       = Math.max(subtotal - discount + deliveryFee + tax, 0)

  return { subtotal, deliveryFee, discount, tax, total }
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId
}

/**
 * SSR-safe localStorage storage.
 *
 * BUG FIXED: Zustand persist with createJSONStorage(() => localStorage) crashes
 * during SSR / Next.js static generation because `localStorage` is undefined
 * on the server. This wrapper guards against that by checking typeof window first,
 * falling back to a no-op memory store on the server.
 *
 * Without this fix, any page that reads from the cart store on the server
 * (including product pages and the cart page itself) would throw a
 * ReferenceError, crash the render, and show a blank white page.
 */
const ssrSafeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(name, value)
    } catch {
      // Storage full or restricted — fail silently
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      // Fail silently
    }
  },
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      items:       [] as CartItem[],
      coupon:      undefined as Coupon | undefined,
      subtotal:    0,
      discount:    0,
      deliveryFee: 0,
      tax:         0,
      total:       0,
      itemCount:   0,

      addItem(product, variant, qty = 1) {
        if (!product?._id || !Number.isFinite(product.price) || !Number.isFinite(qty)) return
        set(state => {
          const key      = itemKey(product._id, variant?._id)
          state.items = sanitizeItems(state.items) as typeof state.items
          const existing = state.items.find(
            i => itemKey(i.product._id, i.variant?._id) === key,
          )
          if (existing) {
            existing.quantity = Math.min(existing.quantity + qty, 99)
          } else {
            state.items.push({ product, variant, quantity: qty } as CartItem)
          }
          const totals    = calcTotals(state.items, state.coupon)
          Object.assign(state, totals)
          state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
        })
      },

      removeItem(productId, variantId) {
        set(state => {
          const key   = itemKey(productId, variantId)
          state.items = sanitizeItems(state.items).filter(
            i => itemKey(i.product._id, i.variant?._id) !== key,
          ) as typeof state.items
          const totals    = calcTotals(state.items, state.coupon)
          Object.assign(state, totals)
          state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
        })
      },

      updateQty(productId, quantity, variantId) {
        set(state => {
          if (quantity < 1) return
          const key  = itemKey(productId, variantId)
          state.items = sanitizeItems(state.items) as typeof state.items
          const item = state.items.find(
            i => itemKey(i.product._id, i.variant?._id) === key,
          )
          if (item) item.quantity = Math.min(quantity, 99)
          const totals    = calcTotals(state.items, state.coupon)
          Object.assign(state, totals)
          state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
        })
      },

      applyCoupon(coupon) {
        set(state => {
          state.coupon = coupon
          const totals = calcTotals(state.items, coupon)
          Object.assign(state, totals)
        })
      },

      removeCoupon() {
        set(state => {
          state.coupon = undefined
          const totals = calcTotals(state.items)
          Object.assign(state, totals)
        })
      },

      clearCart() {
        set(state => {
          state.items       = []
          state.coupon      = undefined
          state.subtotal    = 0
          state.discount    = 0
          state.deliveryFee = 0
          state.tax         = 0
          state.total       = 0
          state.itemCount   = 0
        })
      },

      hasItem: (productId, variantId) => {
        const key = itemKey(productId, variantId)
        return sanitizeItems(get().items).some(i => itemKey(i.product._id, i.variant?._id) === key)
      },

      getItemQty: (productId, variantId) => {
        const key = itemKey(productId, variantId)
        return sanitizeItems(get().items).find(i => itemKey(i.product._id, i.variant?._id) === key)?.quantity ?? 0
      },
    })),
    {
      name:    'doctorfit-cart',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: state => ({ items: sanitizeItems(state.items), coupon: state.coupon }),
      onRehydrateStorage: () => state => {
        if (!state) return
        state.items = sanitizeItems(state.items) as typeof state.items
        const totals    = calcTotals(state.items, state.coupon)
        Object.assign(state, totals)
        state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
      },
    },
  ),
)
