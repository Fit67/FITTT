'use client'

/**
 * app/shop/error.tsx — Shop segment error boundary
 *
 * Catches any unhandled error inside /shop/* pages (cart, products, checkout, etc.)
 * WITHOUT the html/body mistake that was in the root error.tsx.
 *
 * Previously there was NO error boundary here, so errors in shop pages
 * bubbled to the broken root error.tsx and produced a blank white page.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ErrorPageProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function ShopError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ShopError]', error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-white dark:bg-gray-950 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.0, 0.0, 0.2, 1.0] }}
        className="max-w-sm"
      >
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle size={34} className="text-amber-500" />
        </div>

        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
          Page failed to load
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Something went wrong on this page. Your cart and data are safe — this is just a display error.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-xs text-gray-400 dark:text-gray-500">
            Ref: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            icon={<RefreshCw size={15} />}
            size="sm"
          >
            Retry
          </Button>
          <Link href="/shop/products">
            <Button
              variant="outline"
              size="sm"
              icon={<ShoppingBag size={15} />}
            >
              Back to Shop
            </Button>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors">
            <ArrowLeft size={13} /> Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
