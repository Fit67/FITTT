import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Home, ShoppingBag, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        <div className="max-w-lg">
          {/* Giant 404 */}
          <div className="relative mb-8 inline-block">
            <span className="font-display text-[160px] font-black leading-none text-gray-100 dark:text-gray-800 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🛒</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button icon={<Home size={16} />}>Go Home</Button>
            </Link>
            <Link href="/shop/products">
              <Button variant="outline" icon={<ShoppingBag size={16} />}>
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Popular categories</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Fruits & Vegetables',
                'Dairy & Eggs',
                'Bakery',
                'Beverages',
                'Snacks',
              ].map(cat => (
                <Link
                  key={cat}
                  href={`/shop/products?category=${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
