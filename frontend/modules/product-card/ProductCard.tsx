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
    // scalePop variant is set by the StaggerContainer parent
    <motion.article
      variants={scalePop}
      className={cn(
        'group relative flex flex-col overflow-hidden bg-surface-raised transition-colors hover:bg-surface-overlay',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'md:col-span-2 md:flex-row',
        className,
      )}
    >
      {/* ── Image ───────────────────────────────────────── */}
      <Link href={`/shop/products/${product.slug}`} className={cn(
        'relative overflow-hidden bg-surface-overlay flex items-center justify-center border-b border-gray-200 dark:border-[#1a1a1a]',
        variant === 'featured' ? 'md:w-1/2 h-60 md:h-auto' : 'aspect-square',
      )}>
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%]" />
        )}

        <img
          src={image}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-transform duration-700 ease-out',
            'group-hover:scale-[1.07]',
            !imgLoaded && 'opacity-0'
          )}
        />

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          {discountPct > 0 && (
            <span className="bg-accent text-gray-900 text-[9px] font-medium tracking-widest uppercase px-2 py-1">−{discountPct}%</span>
          )}
          {product.isNew && (
            <span className="border border-gray-600 text-gray-500 text-[9px] font-medium tracking-widest uppercase px-2 py-1">New In</span>
          )}
          {outOfStock && (
            <span className="bg-gray-800 text-gray-300 text-[9px] font-medium tracking-widest uppercase px-2 py-1">
              {storeConfig.language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        {storeConfig.enableWishlist && (
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 text-gray-400 hover:text-accent transition-colors',
              wishlisted && 'text-red-500 hover:text-red-600'
            )}
          >
            <Heart size={16} className={wishlisted ? 'fill-red-500' : ''} />
          </button>
        )}
      </Link>

      {/* ── Content ─────────────────────────────────────── */}
      <div className={cn('flex flex-col p-4 flex-1', variant === 'featured' && 'md:p-6')}>
        <div className="text-[9px] font-medium tracking-widest uppercase text-gray-500 mb-1.5">
          {product.category?.name || 'Brand'}
        </div>
        
        <Link
          href={`/shop/products/${product.slug}`}
          className="text-[13px] font-light text-gray-800 dark:text-[#ccc] leading-[1.4] mb-3 line-clamp-2 hover:text-accent dark:hover:text-accent transition-colors"
        >
          {product.name}
        </Link>
        
        <div className="flex-1" />
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {product.comparePrice && product.comparePrice > product.price ? (
              <span className="text-[10px] text-gray-500 line-through leading-none">
                {formatPrice(product.comparePrice)}
              </span>
            ) : <span className="text-[10px] leading-none text-transparent select-none">0</span>}
            <span className="font-display text-[18px] text-gray-900 dark:text-[#e8e0d4] italic leading-none mt-1">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              "w-7 h-7 border border-gray-300 dark:border-[#2a2a2a] bg-transparent flex items-center justify-center text-gray-500 transition-all duration-200",
              outOfStock ? "opacity-50 cursor-not-allowed" : "hover:border-accent hover:text-accent",
              inCart && "border-accent text-accent bg-accent/10"
            )}
            aria-label="Add to cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Horizontal variant (for cart / order summary) ─────────────
function HorizontalCard({ product }: { product: Product }) {
  const image = getProductImage(product.images)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="flex gap-4 rounded-card border border-gray-100 p-4 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
    >
      <Link href={`/shop/products/${product.slug}`} className="shrink-0">
        <img
          src={image}
          alt={product.name}
          className="h-16 w-16 rounded-lg object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <Link href={`/shop/products/${product.slug}`}
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-primary-600 transition-colors duration-200">
          {product.name}
        </Link>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(product.price)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Skeleton Card — with staggered shimmer timing ────────────
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex flex-col rounded-card overflow-hidden border border-gray-100 dark:border-gray-800 bg-surface dark:bg-surface-raised"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-16 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.1}s` }} />
        <div className="h-4 w-full skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.15}s` }} />
        <div className="h-4 w-3/4 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.2}s` }} />
        <div className="flex justify-between pt-1">
          <div className="h-5 w-16 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.25}s` }} />
          <div className="h-9 w-9 skeleton rounded-button" style={{ animationDelay: `${index * 0.06 + 0.3}s` }} />
        </div>
      </div>
    </div>
  )
}
