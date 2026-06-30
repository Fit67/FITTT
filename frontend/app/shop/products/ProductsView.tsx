'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Star, ShoppingBag, Heart, X, Award, Flame, Dumbbell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getProductImage, formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useToast } from '@/components/ui/Toast'
import type { Product } from '@/types'

// Map ID to a consistent theme
const THEMES = ['red', 'black-gold', 'blue-white', 'green', 'purple', 'amber', 'dark-grey'] as const
function getTheme(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return THEMES[Math.abs(hash) % THEMES.length]
}

export function ProductsView({ products }: { products: Product[] }) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toggle, hasItem: inWishlist } = useWishlistStore()
  const toast = useToast()

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('popular')
  const [onlyInStock, setOnlyInStock] = useState(false)

  // Categories list based on actual data
  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach(p => cats.add(p.category?.name || 'Uncategorized'))
    return ['All', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.metadata?.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesCategory = selectedCategory === 'All' || p.category?.name === selectedCategory
        const inStock = p.inventory?.quantity > 0
        const matchesStock = !onlyInStock || inStock

        return matchesSearch && matchesCategory && matchesStock
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return (b.ratings?.average || 0) - (a.ratings?.average || 0)
        if (sortBy === 'popular') return (b.isTopSeller ? 1 : 0) - (a.isTopSeller ? 1 : 0)
        return 0
      })
  }, [products, searchQuery, selectedCategory, sortBy, onlyInStock])

  const featuredProducts = useMemo(() => filteredProducts.slice(0, 4), [filteredProducts])

  function handleAddToCart(p: Product, qty = 1) {
    addItem(p, undefined, qty)
    toast.success('Added to Cart', p.name)
  }

  function handleToggleFav(p: Product) {
    const added = toggle(p)
    toast[added ? 'success' : 'info'](added ? 'Added to Wishlist' : 'Removed from Wishlist', p.name)
  }

  // Helper to get normalized product properties
  const np = (p: Product) => ({
    brand: p.metadata?.brand || 'DOCTORFIT',
    flavor: p.metadata?.flavorOptions?.[0] || 'Premium',
    theme: getTheme(p._id),
    rating: p.ratings?.average || 5.0,
    inStock: p.inventory?.quantity > 0,
    isPopular: p.isTopSeller || p.isFeatured
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative z-10 select-none font-sans">
      


      {/* Interactive Filtering bar */}
      <div className="bg-white/90 border border-neutral-200 rounded-[24px] p-4 mb-8 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sticky top-4 z-30 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search supplements, flavors, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#B91C1C] transition-colors font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#B91C1C]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-full">
            <SlidersHorizontal size={14} className="text-[#B91C1C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-black font-bold focus:outline-none border-none pr-2 cursor-pointer"
            >
              <option value="popular">Sort by: Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Sort by: Rating</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-full">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-200 rounded-full relative peer-checked:bg-[#B91C1C] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
            <span className="text-xs text-black font-bold">In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-sans font-extrabold text-xs tracking-wider uppercase transition-all duration-200 shrink-0 whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-[#B91C1C] text-white border-[#B91C1C] shadow-sm'
                : 'bg-white text-gray-400 hover:text-[#B91C1C] hover:border-[#B91C1C] border-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 text-left">
        <p className="text-xs font-mono text-gray-500 font-bold uppercase">
          SHOWING {filteredProducts.length} OF {products.length} PREMIUM PRODUCTS
        </p>
      </div>

      {/* Featured Products Section */}
      {!searchQuery && selectedCategory === 'All' && !onlyInStock && featuredProducts.length > 0 && (
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 text-left border-b border-neutral-100 pb-4">
            <div>
              <span className="font-mono text-xs font-black text-[#B91C1C] tracking-widest uppercase">
                HAND-PICKED ELITE STAPLES
              </span>
              <h2 className="font-sans font-black text-2xl md:text-3xl text-black uppercase mt-1 tracking-tight">
                FEATURED SUPREME ITEMS
              </h2>
            </div>
            
            <button
              onClick={() => document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-4 md:mt-0 px-6 py-2.5 bg-black text-white hover:bg-[#B91C1C] rounded-full font-sans font-black text-xs tracking-widest uppercase transition-colors flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>ALL PRODUCTS</span>
              <span className="text-xs">↓</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* HERO PRODUCT */}
            {featuredProducts[0] && (() => {
              const heroProd = featuredProducts[0]
              const p = np(heroProd)
              const isFav = inWishlist(heroProd._id)
              return (
                <div
                  onClick={() => router.push(`/shop/products/${heroProd.slug}`)}
                  className="xl:col-span-6 bg-gradient-to-br from-[#B91C1C] via-[#991B1B] to-black text-white rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all duration-300 border border-red-700 cursor-pointer relative overflow-hidden text-left"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(#fff/0.05_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFav(heroProd); }}
                    className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10 bg-white/10 backdrop-blur-md border ${
                      isFav ? 'border-white text-white bg-white/10' : 'border-white/20 text-white/70 hover:text-white'
                    }`}
                  >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  <div className="flex-1 flex flex-col justify-between h-full relative z-10 min-w-0">
                    <div>
                      <span className="bg-white/25 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-white/10 w-fit">
                        ★ TOP FEATURED HERO
                      </span>
                      <h3 className="font-sans font-black text-2xl md:text-3xl lg:text-4xl text-white mt-4 uppercase leading-tight line-clamp-2">
                        {heroProd.name}
                      </h3>
                      <p className="font-mono text-xs text-red-200 mt-2 uppercase tracking-wider font-extrabold">
                        {p.brand} • {heroProd.category?.name}
                      </p>
                      <p className="text-white/80 text-xs md:text-sm mt-4 font-medium leading-relaxed line-clamp-3">
                        {heroProd.shortDescription || heroProd.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">STRIKING PRICE</span>
                        <p className="font-sans font-black text-3xl text-white mt-1">{formatPrice(heroProd.price)}</p>
                      </div>

                      {p.inStock ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(heroProd); }}
                          className="bg-white text-black hover:bg-black hover:text-white px-6 py-3 rounded-full font-sans font-black text-xs tracking-widest uppercase transition-all duration-200 shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                          <span>ADD TO CART</span>
                        </button>
                      ) : (
                        <span className="text-xs font-black text-white/50 uppercase tracking-wider">SOLD OUT</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative z-10 w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
                    <img src={getProductImage(heroProd.images)} alt={heroProd.name} className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
              )
            })()}

            {/* SECONDARY FEATURED PRODUCTS */}
            <div className="xl:col-span-6 flex flex-col gap-4 justify-between">
              {featuredProducts.slice(1, 4).map((fProd) => {
                const p = np(fProd)
                const isFav = inWishlist(fProd._id)
                return (
                  <div
                    key={fProd._id}
                    onClick={() => router.push(`/shop/products/${fProd.slug}`)}
                    className="group bg-white border border-neutral-200 hover:border-[#B91C1C] rounded-[24px] p-4 sm:p-5 flex items-center gap-4 sm:gap-6 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden text-left"
                  >
                    <div className="absolute top-4 left-4 bg-black text-white text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase z-10">
                      FEATURED
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFav(fProd); }}
                      className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 bg-neutral-50 border ${
                        isFav ? 'border-[#B91C1C] text-[#B91C1C] bg-[#B91C1C]/10' : 'border-neutral-200 text-gray-400 hover:text-black'
                      }`}
                    >
                      <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <div className="w-24 sm:w-28 flex-shrink-0 flex items-center justify-center bg-white rounded-2xl p-1 overflow-hidden h-28 sm:h-32 border border-neutral-100">
                      <img src={getProductImage(fProd.images)} alt={fProd.name} className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-full">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-black text-[#B91C1C] tracking-wider uppercase">
                            {p.brand}
                          </span>
                        </div>
                        <h4 className="font-sans font-black text-xs sm:text-sm md:text-base text-black group-hover:text-[#B91C1C] transition-colors mt-1 uppercase leading-snug line-clamp-2">
                          {fProd.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-neutral-50 text-neutral-500 text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-200 truncate uppercase max-w-[120px] sm:max-w-none">
                            {p.flavor}
                          </span>
                          <div className="flex items-center gap-0.5 text-[#B91C1C] font-bold text-xs">
                            <Star size={11} fill="currentColor" />
                            <span>{p.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 sm:pt-3 border-t border-neutral-100">
                        <span className="font-sans font-black text-black text-sm sm:text-base">{formatPrice(fProd.price)}</span>
                        {p.inStock ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(fProd); }}
                            className="bg-black text-white hover:bg-[#B91C1C] p-2 sm:px-4 sm:py-2 rounded-full font-sans font-black text-[9px] sm:text-[10px] tracking-widest uppercase transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            <span className="hidden xs:inline">ADD TO CART</span>
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 uppercase">SOLD OUT</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ALL PRODUCTS GRID */}
      <div id="all-products-section" className="scroll-mt-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-neutral-200 rounded-[24px]">
            <Dumbbell className="mx-auto w-12 h-12 text-gray-300 mb-4 animate-bounce" />
            <h3 className="font-sans font-bold text-lg text-black">No products found</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const p = np(product)
              const isFav = inWishlist(product._id)
              return (
                <div
                  key={product._id}
                  onClick={() => router.push(`/shop/products/${product.slug}`)}
                  className="group bg-white border border-neutral-200 rounded-[20px] p-4 flex flex-col justify-between hover:border-[#B91C1C] hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden text-left"
                >
                  {p.isPopular && (
                    <div className="absolute top-3 left-3 bg-[#B91C1C] text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase z-10 flex items-center gap-1">
                      <Flame size={10} />
                      <span className="hidden xs:inline">POPULAR</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFav(product); }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 bg-neutral-50 border ${
                      isFav ? 'border-[#B91C1C] text-[#B91C1C] bg-[#B91C1C]/10' : 'border-neutral-200 text-gray-400 hover:text-[#B91C1C]'
                    }`}
                  >
                    <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  <div className="w-full flex justify-center p-1 sm:p-2 h-52 bg-white group-hover:scale-110 transition-transform duration-300">
                    <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>

                  <div className="mt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[8px] font-black text-[#B91C1C] tracking-wider uppercase">
                        {p.brand}
                      </span>
                      <h3 className="font-sans font-black text-xs sm:text-sm text-black group-hover:text-[#B91C1C] transition-colors mt-0.5 uppercase leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-1.5">
                        <span className="bg-neutral-50 text-black/80 text-[8px] font-bold px-2 py-0.5 rounded-full border border-neutral-200 truncate uppercase w-fit max-w-full">
                          {p.flavor}
                        </span>
                        <div className="flex items-center gap-0.5 text-[#B91C1C] font-bold text-[10px]">
                          <Star size={10} fill="currentColor" />
                          <span>{p.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200">
                      <span className="font-sans font-black text-black text-xs sm:text-base">{formatPrice(product.price)}</span>
                      
                      {p.inStock ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="bg-black text-white p-2 sm:p-2.5 rounded-full hover:bg-[#B91C1C] transition-colors duration-200 flex items-center justify-center shadow-sm active:scale-90 cursor-pointer"
                        >
                          <ShoppingBag size={12} />
                        </button>
                      ) : (
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">SOLD OUT</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
