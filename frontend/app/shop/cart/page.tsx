'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/primitives'
import { useCartStore } from '@/store/slices/cartStore'
import { useValidateCoupon } from '@/hooks/useQueries'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, getProductImage, getDeliveryLabel } from '@/lib/utils'
import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const {
    items, subtotal, discount, deliveryFee, tax, total,
    coupon, updateQty, removeItem, applyCoupon, removeCoupon, clearCart,
  } = useCartStore()

  const [couponCode, setCouponCode] = React.useState('')
  const { mutate: validateCoupon, isPending: validatingCoupon } = useValidateCoupon()
  const toast = useToast()

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!couponCode.trim()) return
    validateCoupon(
      { code: couponCode.trim().toUpperCase(), subtotal },
      {
        onSuccess: ({ coupon: c }) => {
          applyCoupon(c)
          toast.success('Coupon applied!', `You saved ${formatPrice(discount)}`)
        },
        onError: () => toast.error('Invalid coupon', 'This code is not valid or has expired.'),
      },
    )
  }

  if (items.length === 0) return <EmptyCart />

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Your Cart
            <Badge variant="primary" className="ml-3 translate-y-[-2px]">{items.length}</Badge>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart Items ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={`${item.product._id}-${item.variant?._id}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex gap-4 rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised"
                  >
                    {/* Image */}
                    <Link href={`/shop/products/${item.product.slug}`} className="shrink-0">
                      <img
                        src={getProductImage(item.product.images)}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <Link
                        href={`/shop/products/${item.product.slug}`}
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.variant.options.map(o => `${o.name}: ${o.value}`).join(' · ')}
                        </p>
                      )}
                      {item.product.category?.name && (
                        <p className="text-xs text-primary-600 dark:text-primary-400">
                          {item.product.category.name}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-4">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-button border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => updateQty(item.product._id, item.quantity - 1, item.variant?._id)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product._id, item.quantity + 1, item.variant?._id)}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price + delete */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product._id, item.variant?._id)}
                            className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-between">
                <Link href="/shop/products">
                  <Button variant="ghost" size="sm">Continue Shopping</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={14} className="mr-1.5" /> Clear Cart
                </Button>
              </div>
            </div>

            {/* ── Order Summary ──────────────────────────────── */}
            <div className="space-y-4">
              <div className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount {coupon && `(${coupon.code})`}</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? '🎉 Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Delivery note */}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {getDeliveryLabel(subtotal)}
                </p>

                <Link href="/shop/checkout" className="mt-5 block">
                  <Button fullWidth size="lg" iconRight={<ArrowRight size={16} />}>
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>

              {/* Coupon */}
              {storeConfig.enableCoupons && (
                <div className="rounded-card border border-gray-100 bg-surface p-5 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <Tag size={14} /> Coupon Code
                  </h3>

                  {coupon ? (
                    <div className="flex items-center justify-between rounded-button bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
                      <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {coupon.code}
                      </span>
                      <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        maxLength={20}
                        className="flex-1 rounded-button border border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-overlay px-3 py-2 text-sm font-mono uppercase outline-none focus:border-primary-500 transition-colors"
                      />
                      <Button size="sm" type="submit" loading={validatingCoupon}>Apply</Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function EmptyCart() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-raised dark:bg-surface-overlay">
            <ShoppingCart size={40} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Looks like you haven't added anything yet. Let's change that!
          </p>
          <Link href="/shop/products" className="mt-8 inline-flex">
            <Button size="lg" icon={<ShoppingBag size={18} />}>Start Shopping</Button>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </>
  )
}
