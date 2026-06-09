'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/slices/uiStore'
import { productService } from '@/services'
import { formatPrice, getProductImage } from '@/lib/utils'
import { Spinner } from '@/components/ui/primitives'
import type { Product } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

const TRENDING = ['Organic milk', 'Protein powder', 'Fresh bread', 'Avocado', 'Greek yogurt']

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query,   setQuery]   = React.useState('')
  const [results, setResults] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(false)
  const [recent,  setRecent]  = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const router   = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  // Focus input when opened
  React.useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      const stored = JSON.parse(localStorage.getItem('recentSearches') ?? '[]') as string[]
      setRecent(stored)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isSearchOpen])

  // Live search
  React.useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    setLoading(true)
    productService.search(debouncedQuery, 6)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Keyboard close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && closeSearch()
    if (isSearchOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSearchOpen, closeSearch])

  function commit(q: string) {
    if (!q.trim()) return
    const updated = [q, ...recent.filter(r => r !== q)].slice(0, 6)
    setRecent(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    closeSearch()
    router.push(`/shop/products?search=${encodeURIComponent(q)}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    commit(query)
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[9500] flex flex-col items-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -20, scale: 0.98  }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-card bg-surface shadow-modal dark:bg-surface-raised"
          >
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Search size={20} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent font-body text-base text-gray-900 placeholder:text-gray-400 outline-none dark:text-gray-100"
              />
              {loading && <Spinner size={18} />}
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 rounded px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 font-mono">
                Esc
              </kbd>
            </form>

            {/* Results / Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-3">
                  <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Products
                  </p>
                  {results.map(product => (
                    <button
                      key={product._id}
                      onClick={() => { closeSearch(); router.push(`/shop/products/${product.slug}`) }}
                      className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-surface-overlay dark:hover:bg-surface-overlay transition-colors text-left"
                    >
                      <img
                        src={getProductImage(product.images)}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category?.name}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => commit(query)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    See all results for "{query}"
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-5">
                  {/* Recent Searches */}
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
                        <Clock size={12} /> Recent
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map(term => (
                          <button
                            key={term}
                            onClick={() => { setQuery(term); commit(term) }}
                            className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  <div>
                    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-gray-400 flex items-center gap-2">
                      <TrendingUp size={12} /> Trending Now
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING.map(term => (
                        <button
                          key={term}
                          onClick={() => { setQuery(term); commit(term) }}
                          className="rounded-full bg-primary-50 dark:bg-primary-900/30 px-3 py-1 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
