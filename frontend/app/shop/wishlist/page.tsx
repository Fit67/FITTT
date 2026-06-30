'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/modules/product-card/ProductCard'
import { Button } from '@/components/ui/Button'
import { useWishlistStore } from '@/store/slices/uiStore'

export default function WishlistPage() {
  const { items, clear } = useWishlistStore()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 sm:pt-40 pb-20 bg-white">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
            <div>
              <span className="font-mono text-xs font-black text-[#B91C1C] tracking-widest uppercase">YOUR FAVORITES</span>
              <h1 className="font-sans font-black text-3xl md:text-4xl text-black uppercase mt-1 tracking-tight">Wishlist</h1>
              <p className="mt-1 text-gray-500 font-bold text-sm uppercase tracking-wider">{items.length} saved items</p>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clear} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Clear All
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-24 text-center"
            >
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200">
                <Heart size={40} className="text-gray-300" />
              </div>
              <h3 className="font-sans font-black text-2xl text-black uppercase tracking-tight">Your wishlist is empty</h3>
              <p className="mt-2 text-gray-500 max-w-sm font-medium">
                Save items you love by tapping the heart icon on any product.
              </p>
              <Link href="/shop/products" className="mt-8 inline-flex">
                <Button>Browse Products</Button>
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {items.map(product => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
