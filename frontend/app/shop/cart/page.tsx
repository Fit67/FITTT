'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react'
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
import { useTranslation } from '@/hooks/useTranslation'

/**
 * BUGS FIXED:
 *
 * 1. Hydration mismatch → blank page
 *    The cart store reads from localStorage on mount. On the server, localStorage
 *    doesn't exist, so the store hydrates with empty items=[]. On the client the
 *    store rehydrates with real items. This mismatch caused React hydration to fail
 *    and the page to blank out. Fixed by deferring render until after hydration
 *    via the `mounted` state pattern.
 *
 * 2. Null-safe item access
 *    item.product could be undefined if localStorage had stale/corrupted data
 *    from a previous session (e.g. the product was deleted from the backend).
 *    Added a safety filter before rendering.
 *
 * 3. Coupon form doesn't use <form> — avoids accidental page navigation
 *    on Enter key and HTML form nesting issues.
 */

export default function CartPage() {
  const {
    items: rawItems, subtotal, discount, deliveryFee, total,
    coupon, updateQty, removeItem, applyCoupon, removeCoupon, clearCart,
  } = useCartStore()
  const { t } = useTranslation()

  // Hydration guard: don't render until client-side store has rehydrated
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  const [couponCode, setCouponCode] = React.useState('')
  const { mutate: validateCoupon, isPending: validatingCoupon } = useValidateCoupon()
  const toast = useToast()

  // Safety filter: skip any item where the product object is missing/corrupt
  const items = React.useMemo(
    () => (rawItems ?? []).filter(item => item?.product?._id),
    [rawItems],
  )

  function handleApplyCoupon() {
    if (!couponCode.trim()) return
    validateCoupon(
      { code: couponCode.trim().toUpperCase(), subtotal },
      {
        onSuccess: ({ coupon: c, discount: serverDiscount }) => {
          applyCoupon(c)
          toast.success('Coupon applied!', `You saved ${formatPrice(serverDiscount)}`)
          setCouponCode('')
        },
        onError: () => toast.error('Invalid coupon', 'This code is not valid or has expired.'),
      },
    )
  }

  // Show skeleton while hydrating to avoid layout flash
  if (!mounted) return <CartSkeleton />

  if (items.length === 0) return <EmptyCart />

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-10 pt-4 sm:pb-16 sm:pt-6">
        <div className="container-page">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] }}
            className="mb-5 font-display text-2xl font-bold text-gray-900 dark:text-white sm:mb-8 sm:text-3xl">
            {t('cartYourCart')}
            <Badge variant="primary" className="ms-3 translate-y-[-2px]">{items.length}</Badge>
          </motion.h1>

          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">

            {/* ── Cart Items ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence initial={false}>
                {items.map(item => (
                  <motion.div
                    key={`${item.product._id}-${item.variant?._id ?? 'base'}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-card transition-all hover:shadow-card-hover min-[420px]:flex-row sm:gap-4 sm:p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Image */}
                    <Link href={`/shop/products/${item.product.slug}`} className="shrink-0">
                      <img
                        src={getProductImage(item.product.images ?? [])}
                        alt={item.product.name}
                        className="h-24 w-full rounded-lg object-cover transition-transform duration-300 hover:scale-105 min-[420px]:h-20 min-[420px]:w-20 sm:h-24 sm:w-24"
                        onError={(e) => { ;(e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <Link
                        href={`/shop/products/${item.product.slug}`}
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(item.variant.options ?? []).map((o: { name: string; value: string }) => `${o.name}: ${o.value}`).join(' · ')}
                        </p>
                      )}
                      {item.product.category?.name && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {item.product.category.name}
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => updateQty(item.product._id, item.quantity - 1, item.variant?._id)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const maxStock = item.variant
                                ? (item.variant.inventory ?? 999)
                                : (item.product.inventory?.quantity ?? 999)
                              updateQty(item.product._id, Math.min(item.quantity + 1, maxStock), item.variant?._id)
                            }}
                            disabled={item.quantity >= (item.variant ? (item.variant.inventory ?? 999) : (item.product.inventory?.quantity ?? 999))}
                            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        {(() => {
                          const maxStock = item.variant
                            ? (item.variant.inventory ?? 999)
                            : (item.product.inventory?.quantity ?? 999)
                          if (item.quantity >= maxStock && maxStock < 999) {
                            return <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('cartMaxStockReached')}</p>
                          }
                          return null
                        })()}

                        {/* Price + delete */}
                        <div className="ms-auto flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(((item.variant?.price != null && Number.isFinite(item.variant.price)) ? item.variant.price : item.product.price) * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product._id, item.variant?._id)}
                            className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex flex-col gap-2 pt-2 min-[420px]:flex-row min-[420px]:justify-between">
                <Link href="/shop/products">
                  <Button variant="ghost" size="sm">{t('cartContinueShopping')}</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} className="me-1.5" /> {t('cartClearCart')}
                </Button>
              </div>
            </div>

            {/* ── Order Summary ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, ease: [0.0, 0.0, 0.2, 1.0], delay: 0.08 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card sm:p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('cartOrderSummary')}
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{t('cartSubtotal')}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{t('cartDiscount')} {coupon && `(${coupon.code})`}</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{t('cartDelivery')}</span>
                    <span>{deliveryFee === 0 ? '🎉 Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>{t('cartTotal')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {getDeliveryLabel(subtotal)}
                </p>

                <Link href="/shop/checkout" className="mt-5 block">
                  <Button fullWidth size="lg" iconRight={<ArrowRight size={16} />}>
                    {t('cartProceedCheckout')}
                  </Button>
                </Link>
              </div>

              {/* Coupon — no <form> tag to avoid hydration mismatch */}
              {storeConfig.enableCoupons && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card sm:p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <Tag size={14} /> {t('cartCouponCode')}
                  </h3>

                  {coupon ? (
                    <div className="flex items-center justify-between rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
                      <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {coupon.code}
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        {t('cartRemove')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 min-[420px]:flex-row">
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="ENTER CODE"
                        maxLength={20}
                        className="flex-1 rounded-s-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-mono uppercase outline-none focus:border-red-500 transition-colors"
                      />
                      <Button
                        size="sm"
                        onClick={handleApplyCoupon}
                        loading={validatingCoupon}
                        disabled={!couponCode.trim()}
                      >
                        {t('cartApply')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Empty state ───────────────────────────────────────────────
function EmptyCart() {
  const { t } = useTranslation()
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.0, 0.0, 0.2, 1.0] }}
          className="text-center px-4"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <ShoppingCart size={40} className="text-red-300 dark:text-red-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{t('cartEmptyTitle')}</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            {t('cartEmptyText')}
          </p>
          <Link href="/shop/products" className="mt-8 inline-flex">
            <Button size="lg" icon={<ShoppingBag size={18} />}>{t('cartStartShopping')}</Button>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </>
  )
}

// ─── Loading skeleton (shown during hydration) ─────────────────
function CartSkeleton() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page">
          <div className="h-9 w-40 skeleton rounded-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex gap-4 rounded-card border border-gray-100 dark:border-gray-800 p-4">
                  <div className="h-20 w-20 skeleton rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 skeleton rounded-full" />
                    <div className="h-3 w-1/3 skeleton rounded-full" />
                    <div className="h-8 w-28 skeleton rounded-button mt-4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 skeleton rounded-card" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
