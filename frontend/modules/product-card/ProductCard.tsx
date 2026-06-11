'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Clock, Flame, Zap } from 'lucide-react'
import { cn, formatPrice, calcDiscountPercent, getProductImage } from '@/lib/utils'
import { Badge } from '@/components/ui/primitives'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useToast } from '@/components/ui/Toast'
import { storeConfig, currentBusiness } from '@/config/store'
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
  const outOfStock   = product.inventory.quantity === 0
  const businessType = storeConfig.businessType

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (outOfStock) return
    addItem(product)
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
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className={cn(
        'group relative flex flex-col rounded-card overflow-hidden',
        // Premium glassmorphism
        'bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl',
        'border border-white/40 dark:border-gray-800/60 shadow-sm',
        // Hover glows and transitions
        'transition-all duration-500 ease-out',
        'hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(var(--color-primary-500),0.1)]',
        'hover:border-primary-500/30 dark:hover:border-primary-500/40',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'md:col-span-2 md:flex-row',
        className,
      )}
    >
      {/* ── Image ───────────────────────────────────────── */}
      <Link href={`/shop/products/${product.slug}`} className={cn(
        'relative overflow-hidden bg-surface-overlay',
        variant === 'featured' ? 'md:w-1/2 h-60 md:h-auto' : 'aspect-square',
      )}>
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        )}
        <img
          src={image}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-700 ease-out',
            'group-hover:scale-110',
            !imgLoaded && 'opacity-0',
          )}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge variant="primary" size="sm">New</Badge>
          )}
          {discountPct > 0 && (
            <Badge variant="error" size="sm">−{discountPct}%</Badge>
          )}
          {outOfStock && (
            <Badge variant="neutral" size="sm">Out of Stock</Badge>
          )}
          {/* Business-type labels */}
          {businessType === 'restaurant' && product.metadata?.prepTime && (
            <Badge variant="warning" size="sm">
              <Clock size={10} className="mr-0.5" />
              {product.metadata.prepTime}m
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        {storeConfig.enableWishlist && (
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute right-3 top-3 rounded-full p-2',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              'transition-all duration-200',
              'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100',
              wishlisted && '!opacity-100 !scale-100',
              'dark:bg-gray-900/90',
            )}
          >
            <Heart
              size={15}
              className={cn(
                'transition-colors',
                wishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-500 dark:text-gray-400',
              )}
            />
          </button>
        )}
      </Link>

      {/* ── Content ─────────────────────────────────────── */}
      <div className={cn('flex flex-1 flex-col gap-2 p-4', variant === 'featured' && 'md:p-6')}>
        {/* Category */}
        {product.category?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link
          href={`/shop/products/${product.slug}`}
          className="font-body text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {product.name}
        </Link>

        {/* Business-type metadata */}
        {businessType === 'restaurant' && product.metadata?.calories && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <Flame size={11} className="inline mr-1 text-orange-400" />
            {product.metadata.calories} kcal
          </span>
        )}
        {businessType === 'pharmacy' && product.metadata?.dosage && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Dosage: {product.metadata.dosage}
          </span>
        )}
        {businessType === 'gym' && product.metadata?.servingSize && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <Zap size={11} className="inline mr-1 text-amber-400" />
            {product.metadata.servingSize} per serving
          </span>
        )}

        {/* Rating */}
        {storeConfig.enableReviews && product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({product.ratings.count})</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="font-body text-base font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={outOfStock}
            whileTap={outOfStock ? undefined : { scale: 0.94 }}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-button',
              'shadow-sm transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              inCart
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/25 hover:shadow-primary-500/40'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white dark:bg-primary-900/40 dark:text-primary-400 dark:hover:bg-primary-500 dark:hover:text-white',
            )}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Horizontal variant (for cart / order summary) ─────────────
function HorizontalCard({ product }: { product: Product }) {
  const image = getProductImage(product.images)

  return (
    <div className="flex gap-4 rounded-card border border-gray-100 p-4 dark:border-gray-800">
      <Link href={`/shop/products/${product.slug}`} className="shrink-0">
        <img
          src={image}
          alt={product.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <Link href={`/shop/products/${product.slug}`}
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-primary-600">
          {product.name}
        </Link>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(product.price)}
        </span>
      </div>
    </div>
  )
}

// ─── Skeleton Card ─────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-card overflow-hidden border border-gray-100 dark:border-gray-800 bg-surface dark:bg-surface-raised">
      <div className="aspect-square animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-16 animate-shimmer rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        <div className="h-4 w-full animate-shimmer rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        <div className="h-4 w-3/4 animate-shimmer rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        <div className="flex justify-between pt-1">
          <div className="h-5 w-16 animate-shimmer rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
          <div className="h-9 w-9 animate-shimmer rounded-button bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        </div>
      </div>
    </div>
  )
}
