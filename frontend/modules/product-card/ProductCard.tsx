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
      variants={scalePop}
      className={cn(
        'group relative flex flex-col overflow-hidden cursor-pointer',
        // Editorial card: flat, sharp-edged
        'bg-white dark:bg-[#0e0e0e]',
        'border border-gray-100 dark:border-[#1a1a1a]',
        'hover:border-primary-200 dark:hover:border-[#2a2a2a]',
        'transition-[border-color,box-shadow] duration-300',
        'hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] dark:hover:shadow-[0_8px_24px_rgba(200,130,42,0.1)]',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'md:col-span-2 md:flex-row',
        className,
      )}
    >
      {/* ── Image ── */}
      <Link href={`/shop/products/${product.slug}`} className={cn(
        'relative overflow-hidden bg-gray-50 dark:bg-[#111]',
        variant === 'featured' ? 'md:w-1/2 h-60 md:h-auto' : 'aspect-square',
      )}>
        {/* Skeleton */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          imgLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
          'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-[#111] dark:via-[#1a1a1a] dark:to-[#111]',
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

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges — editorial flat style */}
        <div className="absolute left-0 top-0 flex flex-col">
          {discountPct > 0 && (
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2.5 py-1.5 bg-primary-600 dark:bg-[#c8822a] text-white">
              −{discountPct}%
            </span>
          )}
          {product.isNew && !discountPct && (
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2.5 py-1.5 border border-gray-300 dark:border-[#444] text-gray-500 dark:text-[#888]">
              New in
            </span>
          )}
          {outOfStock && (
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] px-2.5 py-1.5 bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-[#888]">
              Sold out
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
              'absolute right-2 top-2 p-2',
              'bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm',
              'border border-gray-200 dark:border-[#2a2a2a]',
              !wishlisted && 'group-hover:opacity-100',
            )}
            style={{ willChange: 'opacity' }}
          >
            <Heart
              size={14}
              className={cn(
                'transition-colors duration-200',
                wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-[#666]',
              )}
            />
          </motion.button>
        )}
      </Link>

      {/* ── Content ── */}
      <div className={cn('flex flex-1 flex-col gap-2 p-4', variant === 'featured' && 'md:p-6')}>
        {/* Brand / Category */}
        {product.category?.name && (
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-[#555]">
            {product.category.name}
          </span>
        )}

        {/* Product name */}
        <Link
          href={`/shop/products/${product.slug}`}
          className="text-[13px] font-light text-gray-800 dark:text-[#ccc] line-clamp-2 hover:text-primary-600 dark:hover:text-[#e8e0d4] transition-colors leading-[1.4]"
        >
          {product.name}
        </Link>

        {/* Business metadata */}
        {businessType === 'gym' && product.metadata?.servingSize && (
          <span className="text-xs text-gray-400 dark:text-[#555]">
            <Zap size={10} className="inline mr-1 text-primary-500 dark:text-[#c8822a]" />
            {product.metadata.servingSize} per serving
          </span>
        )}

        {/* Rating */}
        {storeConfig.enableReviews && product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-medium text-gray-600 dark:text-[#888]">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-[#555]">({product.ratings.count})</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-gray-400 dark:text-[#444] line-through leading-none mb-1">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            <span className="font-display text-[18px] italic text-gray-900 dark:text-[#e8e0d4] leading-none">
              {formatPrice(product.price)}
            </span>
          </div>

          <motion.button
            onClick={handleAddToCart}
            disabled={outOfStock}
            whileTap={outOfStock ? undefined : { scale: 0.88 }}
            whileHover={outOfStock ? undefined : { scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center',
              'transition-[background-color,border-color,color] duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              inCart
                ? 'bg-primary-600 dark:bg-[#c8822a] text-white border border-transparent'
                : 'bg-transparent text-gray-400 dark:text-[#555] border border-gray-200 dark:border-[#2a2a2a] hover:border-primary-600 dark:hover:border-[#c8822a] hover:text-primary-600 dark:hover:text-[#c8822a]',
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
      className="flex gap-4 border border-gray-100 dark:border-[#1e1e1e] p-4 bg-white dark:bg-[#0e0e0e]"
    >
      <Link href={`/shop/products/${product.slug}`} className="shrink-0">
        <img
          src={image}
          alt={product.name}
          className="h-16 w-16 object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <Link href={`/shop/products/${product.slug}`}
          className="text-sm font-light text-gray-800 dark:text-[#ccc] line-clamp-1 hover:text-primary-600 dark:hover:text-[#e8e0d4] transition-colors">
          {product.name}
        </Link>
        <span className="font-display italic text-[16px] text-gray-900 dark:text-[#e8e0d4]">
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
      className="flex flex-col overflow-hidden border border-gray-100 dark:border-[#1a1a1a] bg-white dark:bg-[#0e0e0e]"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-14 skeleton" style={{ animationDelay: `${index * 0.06 + 0.1}s` }} />
        <div className="h-3.5 w-full skeleton" style={{ animationDelay: `${index * 0.06 + 0.15}s` }} />
        <div className="h-3.5 w-3/4 skeleton" style={{ animationDelay: `${index * 0.06 + 0.2}s` }} />
        <div className="flex justify-between pt-1">
          <div className="h-5 w-14 skeleton" style={{ animationDelay: `${index * 0.06 + 0.25}s` }} />
          <div className="h-8 w-8 skeleton" style={{ animationDelay: `${index * 0.06 + 0.3}s` }} />
        </div>
      </div>
    </div>
  )
}
