'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Minus, Plus, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Badge, StarRating, Skeleton, Avatar } from '@/components/ui/primitives'
import { ProductCard } from '@/modules/product-card/ProductCard'
import { useProduct, useRelatedProducts, useReviews, useCreateReview } from '@/hooks/useQueries'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/slices/authStore'
import { useRecentlyViewedStore } from '@/store/slices/uiStore'
import { formatPrice, calcDiscountPercent, formatRelativeTime, cn } from '@/lib/utils'
import { storeConfig } from '@/config/store'
import type { ProductVariant } from '@/types'

/**
 * BUG FIXED: Next.js 15 made params a Promise. Using params.slug directly
 * works in Next.js 14 but crashes silently in Next.js 15+ with a blank page.
 * Using React.use() is the forward-compatible approach that works in both.
 *
 * Also added null-safe guards on product fields (ratings, inventory, images,
 * variants, tags) — the API can return partial data and any undefined access
 * on a nested field throws an error that, without the shop error boundary,
 * showed as a blank page.
 */
interface Props {
  params: { slug: string } | Promise<{ slug: string }>
}

export default function ProductPage({ params }: Props) {
  // Works with both Next.js 14 (plain object) and Next.js 15 (Promise)
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const { slug } = resolvedParams

  const { data: product, isLoading, isError } = useProduct(slug)
  const { data: related }                      = useRelatedProducts(product?._id ?? '')
  const { addItem }                            = useCartStore()
  const { toggle, hasItem }                    = useWishlistStore()
  const { addProduct }                         = useRecentlyViewedStore()
  const toast                                  = useToast()

  const [selectedImg,     setSelectedImg]     = React.useState(0)
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null)
  const [qty,             setQty]             = React.useState(1)
  const [activeTab, setActiveTab] = React.useState<'description' | 'details' | 'reviews'>('description')

  const wishlisted  = product ? hasItem(product._id) : false
  const discountPct = product
    ? calcDiscountPercent(product.price, product.comparePrice ?? 0)
    : 0

  React.useEffect(() => {
    if (product) addProduct(product)
  }, [product?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset image index when slug changes (navigating between products)
  React.useEffect(() => {
    setSelectedImg(0)
    setSelectedVariant(null)
    setQty(1)
  }, [slug])

  if (isLoading) return <ProductPageSkeleton />

  // BUG FIXED: isError was not handled — a failed API call left isLoading=false,
  // product=undefined, and the page rendered nothing (blank white screen)
  if (isError) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center px-4">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
              Failed to load product
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Check your connection and try again.
            </p>
            <Button
              className="mt-6"
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-16">
          <div className="text-center px-4">
            <p className="text-6xl mb-4">🔍</p>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
              Product not found
            </h2>
            <Link href="/shop/products" className="mt-4 inline-block text-red-600 dark:text-red-400 hover:underline">
              ← Back to products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // BUG FIXED: null-safe defaults for fields that may be missing from API response
  const images         = product.images ?? []
  const variants       = product.variants ?? []
  const tags           = product.tags ?? []
  const ratings        = product.ratings ?? { average: 0, count: 0 }
  const inventory      = product.inventory ?? { quantity: 0, reserved: 0, lowStockThreshold: 5 }
  const availableStock = selectedVariant
    ? (selectedVariant.inventory ?? 0)
    : Math.max(0, (inventory.quantity ?? 0) - (inventory.reserved ?? 0))
  const outOfStock     = availableStock < 1
  const effectivePrice = selectedVariant ? selectedVariant.price : product.price

  function handleAddToCart() {
    if (!product || outOfStock) return
    const safeQty = Math.min(qty, availableStock)
    addItem(product, selectedVariant ?? undefined, safeQty)
    toast.success('Added to cart!', `${safeQty}× ${product.name}`)
  }

  function handleWishlist() {
    if (!product) return;
    const added = toggle(product)
    toast[added ? 'success' : 'info'](
      added ? 'Saved to wishlist' : 'Removed from wishlist',
      product.name,
    )
  }

  function handleShare() {
    if (!product) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Link copied!', 'Share it with anyone')
      }).catch(() => {})
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 sm:pt-40 pb-20">
        <div className="container-page py-5 sm:py-10">

          {/* Breadcrumb */}
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:mb-8 sm:text-sm">
            <Link href="/" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop/products" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Products</Link>
            {product.category?.name && (
              <>
                <span>/</span>
                <Link
                  href={`/shop/products?category=${product.category.slug}`}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Product Layout */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-2 xl:gap-16"
          >

            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImg}
                    src={images[selectedImg]?.url ?? '/images/placeholder.png'}
                    alt={images[selectedImg]?.alt ?? product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1    }}
                    exit={{    opacity: 0, scale: 0.96  }}
                    transition={{ duration: 0.25 }}
                    className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    onError={(e) => {
                      // BUG FIXED: broken image src crashing the render
                      ;(e.target as HTMLImageElement).src = '/images/placeholder.png'
                    }}
                  />
                </AnimatePresence>

                <div className="absolute left-3 top-3 flex flex-col gap-2 sm:left-4 sm:top-4">
                  {discountPct > 0  && <Badge variant="error">−{discountPct}%</Badge>}
                  {product.isNew    && <Badge variant="primary">New</Badge>}
                  {outOfStock       && <Badge variant="neutral">{storeConfig.language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</Badge>}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white sm:left-3 dark:bg-gray-900/90 dark:text-gray-300"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedImg(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white sm:right-3 dark:bg-gray-900/90 dark:text-gray-300"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={cn(
                        'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20',
                        selectedImg === i
                          ? 'border-red-500 shadow-sm ring-2 ring-red-200 dark:ring-red-800'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600',
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? ''}
                        className="h-full w-full object-cover"
                        onError={(e) => { ;(e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              <div>
                {product.category?.name && (
                  <Link
                    href={`/shop/products?category=${product.category.slug}`}
                    className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="mt-1 font-anton text-4xl sm:text-6xl uppercase tracking-wide leading-none text-gray-900 dark:text-white">
                  {product.name}
                </h1>
              </div>

              {ratings.count > 0 && (
                <div className="flex items-center gap-3">
                  <StarRating value={ratings.average} size={18} showValue count={ratings.count} />
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    See all reviews
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                <span className="font-mono text-4xl font-black text-gray-900 sm:text-5xl dark:text-white">
                  {formatPrice(effectivePrice)}
                </span>
                {product.comparePrice && product.comparePrice > effectivePrice && (
                  <span className="mb-1 text-lg text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {discountPct > 0 && (
                  <Badge variant="error" size="md" className="mb-1">Save {discountPct}%</Badge>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Business-type metadata */}
              {storeConfig.businessType === 'restaurant' && product.metadata?.calories && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <MetaChip emoji="🔥" label="Calories" value={`${product.metadata.calories} kcal`} />
                  {product.metadata.prepTime && (
                    <MetaChip emoji="⏱️" label="Prep Time" value={`${product.metadata.prepTime} min`} />
                  )}
                </div>
              )}
              {storeConfig.businessType === 'pharmacy' && product.metadata?.dosage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">⚕️ Dosage Information</p>
                  <p>{product.metadata.dosage}</p>
                  {product.metadata.warnings?.[0] && (
                    <p className="mt-1 text-xs opacity-80">⚠️ {product.metadata.warnings[0]}</p>
                  )}
                </div>
              )}
              {storeConfig.businessType === 'gym' && product.metadata?.servingSize && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <MetaChip emoji="💪" label="Serving" value={product.metadata.servingSize} />
                </div>
              )}

              {/* Variants */}
              {variants.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(v => (
                      <button
                        key={v._id}
                        onClick={() => setSelectedVariant(v._id === selectedVariant?._id ? null : v)}
                        disabled={v.inventory <= 0}
                        className={cn(
                          'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors',
                          selectedVariant?._id === v._id
                            ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300',
                          v.inventory <= 0 && 'opacity-40 cursor-not-allowed line-through',
                        )}
                      >
                        {v.name}
                        {v.price !== product.price && (
                          <span className="ml-1 text-xs text-gray-500">({formatPrice(v.price)})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + CTA */}
              <div className="flex flex-wrap items-center gap-4 mt-4 p-4 sm:p-6 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={outOfStock || qty <= 1}
                    className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center font-medium tabular-nums text-gray-900 dark:text-gray-100">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(q + 1, availableStock))}
                    disabled={outOfStock || qty >= availableStock}
                    className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <Button
                  fullWidth size="lg"
                  disabled={outOfStock}
                  icon={<ShoppingCart size={18} />}
                  onClick={handleAddToCart}
                  className="order-2 basis-full sm:order-none sm:basis-auto"
                >
                  {outOfStock ? (storeConfig.language === 'ar' ? 'نفذت الكمية' : 'Out of Stock') : 'Add to Cart'}
                </Button>

                {storeConfig.enableWishlist && (
                  <button
                    onClick={handleWishlist}
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      wishlisted
                        ? 'border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20'
                        : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 dark:border-gray-700',
                    )}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={17} />
                </button>
              </div>

              {!outOfStock && availableStock <= (inventory.lowStockThreshold ?? 5) && (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {availableStock === 1 ? '⚠️ Last piece available!' : `⚠️ Only ${availableStock} left in stock`}
                </p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-5 min-[420px]:grid-cols-3 sm:gap-3 dark:border-gray-800">
                {[
                  { icon: Truck,     text: 'Fast delivery', sub: 'within 3 days' },
                  { icon: Shield,    text: 'Quality assured', sub: '100% fresh' },
                  { icon: RotateCcw, text: 'Easy returns', sub: 'Within 24h' },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-left min-[420px]:flex-col min-[420px]:gap-1.5 min-[420px]:text-center dark:bg-gray-800">
                    <Icon size={18} className="text-red-600 dark:text-red-400" />
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{text}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700">
              {(['description', 'details', 'reviews'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'relative px-5 py-3 text-sm font-medium capitalize transition-colors',
                    activeTab === tab
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line max-w-3xl">
                      {product.description}
                    </p>
                    {product.metadata?.ingredients && product.metadata.ingredients.length > 0 && (
                      <div className="mt-6 max-w-3xl">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ingredients</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.metadata.ingredients.join(', ')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="max-w-xl"
                  >
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[
                          { label: 'SKU',      value: product.sku },
                          { label: 'Category', value: product.category?.name },
                          { label: 'Tags',     value: tags.length ? tags.join(', ') : undefined },
                          { label: 'Brand',    value: product.metadata?.brand },
                          { label: 'Weight',   value: product.metadata?.weight ? `${product.metadata.weight}g` : undefined },
                        ].filter(row => Boolean(row.value)).map(row => (
                          <tr key={row.label}>
                            <td className="py-3 pr-8 font-medium text-gray-500 dark:text-gray-400 w-32">{row.label}</td>
                            <td className="py-3 text-gray-900 dark:text-gray-100">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ReviewsSection productId={product._id} ratings={ratings} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products */}
          {related && related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {related.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Reviews sub-component ─────────────────────────────────────
function ReviewsSection({
  productId,
  ratings,
}: {
  productId: string
  ratings: { average: number; count: number }
}) {
  const { data, isLoading }                    = useReviews(productId)
  const { mutate: submitReview, isPending }    = useCreateReview(productId)
  const { isAuthenticated }                    = useAuthStore()
  const toast                                  = useToast()

  const [rating, setRating] = React.useState(0)
  const [title,  setTitle]  = React.useState('')
  const [body,   setBody]   = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating'); return }
    submitReview(
      { rating, title, body },
      {
        onSuccess: () => {
          toast.success('Review submitted!')
          setRating(0); setTitle(''); setBody('')
        },
        onError: () => toast.error('Could not submit review', 'You may have already reviewed this product.'),
      },
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-6">
        <div className="text-center">
          <p className="font-display text-5xl font-bold text-gray-900 dark:text-white">{ratings.average.toFixed(1)}</p>
          <StarRating value={ratings.average} size={16} />
          <p className="mt-1 text-xs text-gray-400">{ratings.count} reviews</p>
        </div>
      </div>

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-gray-100 dark:border-gray-800 py-5 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton lines={2} />
            </div>
          ))
        : (data?.data ?? []).map(review => (
            <div key={review._id} className="border-b border-gray-100 dark:border-gray-800 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={review.user.name} src={review.user.avatar} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.user.name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size={12} />
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{review.title}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
            </div>
          ))}

      {isAuthenticated && (
         <div className="mt-8 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</p>
              <StarRating value={rating} interactive onChange={setRating} size={24} />
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Review title"
              required
               className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-red-500"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share your experience…"
              rows={4}
              required
               className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-red-500 resize-none"
            />
            <Button type="submit" loading={isPending}>Submit Review</Button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────
function MetaChip({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm">
      <span>{emoji}</span>
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}

function ProductPageSkeleton() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-28" />
              <Skeleton lines={3} />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-11 w-32 rounded-full" />
                <Skeleton className="h-11 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
