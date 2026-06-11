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

function calcTotals(items: CartItem[], coupon?: Coupon) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const { freeDeliveryThreshold, standardDeliveryFee } = storeConfig.delivery
  const rawDelivery = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : standardDeliveryFee

  let discount = 0
  if (coupon) {
    if (coupon.type === 'percentage')    discount = subtotal * (coupon.value / 100)
    if (coupon.type === 'fixed')         discount = Math.min(coupon.value, subtotal)
    if (coupon.type === 'free_shipping') discount = rawDelivery
  }

  const deliveryFee = coupon?.type === 'free_shipping' ? 0 : rawDelivery
  const tax         = 0 // No tax required by user
  const total       = Math.max(subtotal - discount + deliveryFee + tax, 0)

  return { subtotal, deliveryFee, discount, tax, total }
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId
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
        set(state => {
          const key      = itemKey(product._id, variant?._id)
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
          state.items = state.items.filter(
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
          state.items      = []
          state.coupon     = undefined
          state.subtotal   = 0
          state.discount   = 0
          state.deliveryFee= 0
          state.tax        = 0
          state.total      = 0
          state.itemCount  = 0
        })
      },

      hasItem: (productId, variantId) => {
        const key = itemKey(productId, variantId)
        return get().items.some(i => itemKey(i.product._id, i.variant?._id) === key)
      },

      getItemQty: (productId, variantId) => {
        const key = itemKey(productId, variantId)
        return get().items.find(i => itemKey(i.product._id, i.variant?._id) === key)?.quantity ?? 0
      },
    })),
    {
      name:    'doctorfit-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ items: state.items, coupon: state.coupon }),
      onRehydrateStorage: () => state => {
        if (!state) return
        const totals    = calcTotals(state.items, state.coupon)
        Object.assign(state, totals)
        state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
      },
    },
  ),
)
