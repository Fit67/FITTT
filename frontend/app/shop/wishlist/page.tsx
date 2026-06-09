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
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">{items.length} saved items</p>
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
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                <Heart size={36} className="text-red-300 dark:text-red-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Your wishlist is empty</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs">
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
