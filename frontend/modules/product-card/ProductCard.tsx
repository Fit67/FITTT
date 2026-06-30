'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Flame } from 'lucide-react'
import { cn, formatPrice, calcDiscountPercent, getProductImage } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useToast } from '@/components/ui/Toast'
import { storeConfig } from '@/config/store'
import { scalePop } from '@/lib/motion'
import { useTranslation } from '@/hooks/useTranslation'
import type { Product } from '@/types'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const { addItem, hasItem }   = useCartStore()
  const { toggle, hasItem: inWishlist } = useWishlistStore()
  const toast = useToast()
  const { t, lang } = useTranslation()

  const image        = getProductImage(product.images)
  const wishlisted   = inWishlist(product._id)
  const availableStock = Math.max(0, (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0))
  const outOfStock   = availableStock === 0

  const brand = product.metadata?.brand || 'DOCTORFIT'
  const flavor = product.metadata?.flavorOptions?.[0] || 'Premium'
  const rating = product.ratings?.average || 5.0
  const isPopular = product.isTopSeller || product.isFeatured

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem(product, undefined, 1)
    toast.success(t('productCardAddedToCart'), product.name)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const added = toggle(product)
    toast[added ? 'success' : 'info'](
      added ? t('productCardAddedToWishlist') : t('productCardRemovedFromWishlist'),
      product.name,
    )
  }

  if (variant === 'horizontal') return <HorizontalCard product={product} />

  return (
    <motion.article
      variants={scalePop}
      onClick={() => router.push(`/shop/products/${product.slug}`)}
      className={cn(
        'group bg-white border border-neutral-200 rounded-[20px] p-4 flex flex-col justify-between hover:border-[#B91C1C] hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden text-left h-full',
        variant === 'compact' && 'p-3 rounded-2xl',
        className
      )}
    >
      {isPopular && (
        <div className="absolute top-3 left-3 bg-[#B91C1C] text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase z-10 flex items-center gap-1">
          <Flame size={10} />
          <span className="hidden xs:inline">POPULAR</span>
        </div>
      )}

      <button
        onClick={handleWishlist}
        className={cn(
          'absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 bg-neutral-50 border',
          wishlisted ? 'border-[#B91C1C] text-[#B91C1C] bg-[#B91C1C]/10' : 'border-neutral-200 text-gray-400 hover:text-[#B91C1C]'
        )}
      >
        <Heart size={12} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <div className={cn(
        'w-full flex justify-center bg-white group-hover:scale-110 transition-transform duration-300',
        variant === 'compact' ? 'p-1 h-36' : 'p-1 sm:p-2 h-52'
      )}>
        <img src={image} alt={product.name} className="w-full h-full object-contain drop-shadow-lg" loading={priority ? 'eager' : 'lazy'} />
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="font-mono text-[8px] font-black text-[#B91C1C] tracking-wider uppercase line-clamp-1">
            {brand}
          </span>
          <h3 className={cn(
            'font-sans font-black text-black group-hover:text-[#B91C1C] transition-colors mt-0.5 uppercase leading-snug line-clamp-2',
            variant === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'
          )}>
            {product.name}
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-1.5">
            <span className="bg-neutral-50 text-black/80 text-[8px] font-bold px-2 py-0.5 rounded-full border border-neutral-200 truncate uppercase w-fit max-w-full">
              {flavor}
            </span>
            <div className="flex items-center gap-0.5 text-[#B91C1C] font-bold text-[10px]">
              <Star size={10} fill="currentColor" />
              <span>{rating}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200">
          <span className={cn(
            'font-sans font-black text-black',
            variant === 'compact' ? 'text-sm' : 'text-xs sm:text-base'
          )}>
            {formatPrice(product.price)}
          </span>
          
          {!outOfStock ? (
            <button
              onClick={handleAddToCart}
              className="bg-black text-white p-2 sm:p-2.5 rounded-full hover:bg-[#B91C1C] transition-colors duration-200 flex items-center justify-center shadow-sm active:scale-90 cursor-pointer"
            >
              <ShoppingBag size={12} />
            </button>
          ) : (
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">SOLD OUT</span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

// ─── Horizontal variant ────────────────────────────────────────
function HorizontalCard({ product }: { product: Product }) {
  const image = getProductImage(product.images)
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      onClick={() => router.push(`/shop/products/${product.slug}`)}
      className="flex gap-4 border border-neutral-200 hover:border-[#B91C1C] transition-colors p-4 bg-white rounded-[20px] cursor-pointer group shadow-sm"
    >
      <div className="shrink-0 bg-neutral-50 p-1 rounded-xl flex items-center justify-center border border-neutral-100 group-hover:scale-110 transition-transform">
        <img
          src={image}
          alt={product.name}
          className="h-20 w-20 object-contain drop-shadow-md"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between py-1 min-w-0">
        <div>
          <span className="font-mono text-[8px] font-black text-[#B91C1C] tracking-wider uppercase">
            {product.metadata?.brand || 'DOCTORFIT'}
          </span>
          <h4 className="text-sm font-sans font-black uppercase text-black group-hover:text-[#B91C1C] transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h4>
        </div>
        <span className="text-sm font-black text-black">
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
      className="flex flex-col h-full border border-neutral-200 bg-white rounded-[20px] p-4"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="h-48 w-full skeleton rounded-xl mb-4" />
      <div className="space-y-3 flex-1 flex flex-col">
        <div>
          <div className="h-2 w-16 skeleton rounded-full mb-2" style={{ animationDelay: `${index * 0.06 + 0.1}s` }} />
          <div className="h-4 w-full skeleton rounded-full mb-1" style={{ animationDelay: `${index * 0.06 + 0.15}s` }} />
          <div className="h-4 w-3/4 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.2}s` }} />
        </div>
        <div className="mt-auto pt-3 border-t border-neutral-100 flex justify-between items-center">
          <div className="h-5 w-16 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.25}s` }} />
          <div className="h-8 w-8 skeleton rounded-full" style={{ animationDelay: `${index * 0.06 + 0.3}s` }} />
        </div>
      </div>
    </div>
  )
}
