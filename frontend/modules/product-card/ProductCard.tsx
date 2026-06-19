'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Clock, Flame, Zap, Plus } from 'lucide-react'
import { cn, formatPrice, calcDiscountPercent, getProductImage } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useToast } from '@/components/ui/Toast'
import { storeConfig } from '@/config/store'
import { scalePop } from '@/lib/motion'
import type { Product } from '@/types'

interface ProductCardProps {
  product:   Product
  variant?:  'default' | 'compact' | 'horizontal' | 'featured'
  className?: string
  priority?:  boolean
}

export function ProductCard({
  product,
  variant   = 'default',
  className,
  priority  = false,
}: ProductCardProps) {
  const { addItem, hasItem }   = useCartStore()
  const { toggle, hasItem: inWishlist } = useWishlistStore()
  const toast = useToast()
  const [imgLoaded, setImgLoaded] = React.useState(false)

  const image        = getProductImage(product.images)
  const inCart       = hasItem(product._id)
  const wishlisted   = inWishlist(product._id)
  const discountPct  = calcDiscountPercent(product.price, product.comparePrice ?? 0)
  const availableStock = Math.max(0, (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0))
  const outOfStock   = availableStock === 0
  const lowStock     = !outOfStock && availableStock <= (product.inventory?.lowStockThreshold ?? 5)
  const businessType = storeConfig.businessType

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (outOfStock) return
    addItem(product, undefined, 1)
    toast.success('Added to cart', product.name)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    const added = toggle(product)
    toast[added ? 'success' : 'info'](
      added ? 'Added to wishlist' : 'Removed from wishlist',
      product.name,
    )
  }

  if (variant === 'horizontal') return <HorizontalCard product={product} />

  return (
    <motion.article
      variants={scalePop}
      className={cn(
        'group relative flex flex-col overflow-hidden cursor-pointer',
        'bg-gray-50 dark:bg-gray-900',
        'rounded-xl',
        'border border-gray-100 dark:border-gray-800',
        'hover:border-red-200 dark:hover:border-red-900/50',
        'transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'md:col-span-2 md:flex-row',
        className,
      )}
    >
      {/* ── Image ── */}
      <Link href={`/shop/products/${product.slug}`} className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        'rounded-t-xl',
        variant === 'featured' ? 'md:w-1/2 h-60 md:h-auto md:rounded-l-xl md:rounded-tr-none' : 'aspect-square',
      )}>
        {/* Skeleton */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          imgLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
          'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
          'bg-[length:200%_100%]',
          !imgLoaded && 'animate-[shimmer_1.6s_ease-in-out_infinite]',
        )} />

        <img
          src={image}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Badges — VITRAPRO rounded pill style */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discountPct > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 bg-red-600 text-white rounded-full">
              {discountPct}% Off
            </span>
          )}
          {product.isNew && !discountPct && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              New
            </span>
          )}
          {outOfStock && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
              Sold Out
            </span>
          )}
          {lowStock && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
              {availableStock === 1 ? 'Last piece' : `Only ${availableStock} left`}
            </span>
          )}
        </div>

        {/* Wishlist */}
        {storeConfig.enableWishlist && (
          <motion.button
            onClick={handleWishlist}
            initial={false}
            animate={wishlisted ? { opacity: 1 } : { opacity: 0 }}
            className={cn(
              'absolute right-3 top-3 p-2',
              'bg-white/90 dark:bg-black/70 backdrop-blur-sm',
              'rounded-full shadow-sm',
              !wishlisted && 'group-hover:opacity-100',
            )}
            style={{ willChange: 'opacity' }}
          >
            <Heart
              size={16}
              className={cn(
                'transition-colors duration-200',
                wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400',
              )}
            />
          </motion.button>
        )}
      </Link>

      {/* ── Content ── */}
      <div className={cn('flex flex-1 flex-col gap-1.5 p-4', variant === 'featured' && 'md:p-6')}>
        {/* Category */}
        {product.category?.name && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {product.category.name}
          </span>
        )}

        {/* Product name */}
        <Link
          href={`/shop/products/${product.slug}`}
          className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors leading-snug"
        >
          {product.name}
        </Link>

        {/* Business metadata */}
        {businessType === 'gym' && product.metadata?.servingSize && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <Zap size={10} className="inline mr-1 text-red-500" />
            {product.metadata.servingSize} per serving
          </span>
        )}

        {/* Rating */}
        {storeConfig.enableReviews && product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({product.ratings.count})</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={outOfStock}
            whileTap={outOfStock ? undefined : { scale: 0.88 }}
            whileHover={outOfStock ? undefined : { scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              'transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              inCart
                ? 'bg-red-600 dark:bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500',
            )}
            aria-label="Add to cart"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Horizontal variant ────────────────────────────────────────
function HorizontalCard({ product }: { product: Product }) {
  const image = getProductImage(product.images)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="flex gap-4 border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 rounded-xl"
    >
      <Link href={`/shop/products/${product.slug}`} className="shrink-0">
        <img
          src={image}
          alt={product.name}
          className="h-16 w-16 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <Link href={`/shop/products/${product.slug}`}
          className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          {product.name}
        </Link>
        <span className="text-base font-bold text-gray-900 dark:text-white">
          {formatPrice(product.price)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="aspect-square skeleton rounded-t-xl" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-14 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.1}s` }} />
        <div className="h-3.5 w-full skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.15}s` }} />
        <div className="h-3.5 w-3/4 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.2}s` }} />
        <div className="flex justify-between pt-1">
          <div className="h-5 w-14 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.25}s` }} />
          <div className="h-9 w-9 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.3}s` }} />
        </div>
      </div>
    </div>
  )
}
