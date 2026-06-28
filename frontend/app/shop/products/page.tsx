'use client'

import * as React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid3x3, LayoutList, X, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard, ProductCardSkeleton } from '@/modules/product-card/ProductCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/primitives'
import { useProducts } from '@/hooks/useQueries'
import { useCategories } from '@/hooks/useQueries'
import { cn, formatPrice } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import type { ProductFilters } from '@/types'

export default function ProductsPage() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const pathname      = usePathname()
  const { t, dir }    = useTranslation()
  const [gridCols, setGridCols]     = React.useState<3 | 4>(4)
  const [sidebarOpen, setSidebar]   = React.useState(false)

  const SORT_OPTIONS = [
    { value: 'popular',    label: t('productsSortPopular') },
    { value: 'newest',     label: t('productsSortNewest') },
    { value: 'price_asc',  label: t('productsSortPriceAsc') },
    { value: 'price_desc', label: t('productsSortPriceDesc') },
    { value: 'rating',     label: t('productsSortRating') },
  ]

  const filters: ProductFilters = {
    search:   searchParams.get('search')   ?? undefined,
    category: searchParams.get('category') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    onSale:   searchParams.get('onSale') === 'true' || undefined,
    isNew:    searchParams.get('isNew')  === 'true' || undefined,
    sortBy:   (searchParams.get('sortBy') as ProductFilters['sortBy']) ?? 'popular',
    page:     Number(searchParams.get('page') ?? '1'),
    limit:    24,
  }

  const { data, isLoading } = useProducts(filters)
  const { data: categories } = useCategories()

  function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    // Delete page parameter if we are changing filters (not explicitly changing page)
    if (!('page' in updates)) {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const activeFilterCount = [
    filters.category, filters.minPrice, filters.maxPrice,
    filters.onSale, filters.isNew,
  ].filter(Boolean).length

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-4 sm:pt-6" dir={dir}>
        <div className="container-page py-5 sm:py-8">

          {/* ── Page Header ──────────────────────────────────── */}
          <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {filters.search ? `${t('productsResultsFor')} "${filters.search}"` :
                 filters.category ? (categories?.find(c => c.slug === filters.category)?.name ?? t('productsAllProducts')) :
                 t('productsAllProducts')}
              </h1>
              {data && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {data.pagination.total.toLocaleString()} {t('productsProductsFound')}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-start">
              {/* Sort */}
              <div className="relative hidden sm:block">
                <select
                  value={filters.sortBy ?? 'popular'}
                  onChange={e => setParams({ sortBy: e.target.value })}
                  className="appearance-none rounded-full border border-gray-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Grid toggle */}
              <div className="hidden md:flex gap-1 rounded-full border border-gray-200 dark:border-gray-700 p-1">
                {([3, 4] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setGridCols(n)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                      gridCols === n
                        ? 'bg-red-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                  >
                    {n === 3 ? <LayoutList size={14} /> : <Grid3x3 size={14} />}
                  </button>
                ))}
              </div>

              {/* Filter button (mobile) */}
              <Button
                variant="outline"
                size="sm"
                icon={<SlidersHorizontal size={14} />}
                onClick={() => setSidebar(true)}
              >
                {t('productsFilters')}
                {activeFilterCount > 0 && (
                  <Badge variant="primary" size="sm">{activeFilterCount}</Badge>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* ── Sidebar Filters (desktop) ─────────────────── */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-6">
              <FilterPanel
                filters={filters}
                categories={categories ?? []}
                onApply={setParams}
                onClear={() => router.push(pathname)}
                t={t}
              />
            </aside>

            {/* ── Product Grid ──────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {filters.category && (
                    <FilterChip
                      label={categories?.find(c => c.slug === filters.category)?.name ?? filters.category}
                      onRemove={() => setParams({ category: null })}
                    />
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <FilterChip
                      label={`${filters.minPrice ? formatPrice(filters.minPrice) : ''}–${filters.maxPrice ? formatPrice(filters.maxPrice) : '∞'}`}
                      onRemove={() => setParams({ minPrice: null, maxPrice: null })}
                    />
                  )}
                  {filters.onSale && <FilterChip label={t('productsOnSale')}  onRemove={() => setParams({ onSale: null })} />}
                  {filters.isNew  && <FilterChip label={t('productsNewOnly')} onRemove={() => setParams({ isNew: null })} />}
                  <button onClick={() => router.push(pathname)} className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                    {t('productsClearAll')}
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn('grid gap-3 sm:gap-4', gridCols === 3 ? 'grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4')}
                  >
                    {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </motion.div>
                ) : data?.data.length === 0 ? (
                  <EmptyState onReset={() => router.push(pathname)} t={t} />
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn('grid gap-3 sm:gap-4', gridCols === 3 ? 'grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4')}
                  >
                    {data?.data.map((product, i) => (
                      <ProductCard key={product._id} product={product} priority={i < 4} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {data && data.pagination.pages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10">
                  <Button
                    variant="outline" size="sm"
                    disabled={!data.pagination.hasPrev}
                    onClick={() => setParams({ page: String((filters.page ?? 1) - 1) })}
                  >
                    {t('productsPrevious')}
                  </Button>
                  <span className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-400 sm:px-4">
                    {t('productsPage')} {data.pagination.page} {t('productsOf')} {data.pagination.pages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    disabled={!data.pagination.hasNext}
                    onClick={() => setParams({ page: String((filters.page ?? 1) + 1) })}
                  >
                    {t('productsNext')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden" dir={dir}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebar(false)}
            />
            <motion.aside
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className={cn(
                "relative z-10 h-full w-[min(88vw,20rem)] overflow-y-auto bg-surface p-4 dark:bg-surface-raised sm:p-5",
                dir === 'rtl' ? 'ml-auto' : ''
              )}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 dark:text-white">{t('productsFilters')}</h2>
                <button onClick={() => setSidebar(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                categories={categories ?? []}
                onApply={(updates) => { setParams(updates); setSidebar(false) }}
                onClear={() => { router.push(pathname); setSidebar(false) }}
                t={t}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  )
}

// ─── Filter Panel ──────────────────────────────────────────────
interface FilterPanelProps {
  filters:    ProductFilters
  categories: Array<{ _id: string; name: string; slug: string }>
  onApply:    (updates: Record<string, string | null>) => void
  onClear:    () => void
  t:          (key: any) => string
}

function FilterPanel({ filters, categories, onApply, onClear, t }: FilterPanelProps) {
  const { dir } = useTranslation()
  const [localCategory, setLocalCategory] = React.useState<string | null>(filters.category ?? null)
  const [priceMin, setPriceMin] = React.useState(filters.minPrice?.toString() ?? '')
  const [priceMax, setPriceMax] = React.useState(filters.maxPrice?.toString() ?? '')
  const [onSale, setOnSale] = React.useState(filters.onSale ?? false)
  const [isNew, setIsNew] = React.useState(filters.isNew ?? false)

  React.useEffect(() => {
    setLocalCategory(filters.category ?? null)
    setPriceMin(filters.minPrice?.toString() ?? '')
    setPriceMax(filters.maxPrice?.toString() ?? '')
    setOnSale(filters.onSale ?? false)
    setIsNew(filters.isNew ?? false)
  }, [filters])

  function handleApply() {
    onApply({
      category: localCategory,
      minPrice: priceMin || null,
      maxPrice: priceMax || null,
      onSale:   onSale ? 'true' : null,
      isNew:    isNew  ? 'true' : null,
    })
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('productsCategory')}</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setLocalCategory(null)}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-sm transition-colors',
              dir === 'rtl' ? 'text-right' : 'text-left',
              !localCategory
                ? 'bg-red-50 font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {t('productsAllCategories')}
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setLocalCategory(cat.slug)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-sm transition-colors',
                dir === 'rtl' ? 'text-right' : 'text-left',
                localCategory === cat.slug
                  ? 'bg-red-50 font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('productsPriceRange')}</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={t('productsPriceMin')}
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            min={0}
            placeholder={t('productsPriceMax')}
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('productsQuickFilters')}</h3>
        <div className="space-y-2">
          {[
            { key: 'onSale', label: t('productsOnSale'), state: onSale, setState: setOnSale },
            { key: 'isNew',  label: t('productsNewArrivals'), state: isNew, setState: setIsNew },
          ].map(({ key, label, state, setState }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={state}
                onChange={e => setState(e.target.checked)}
                className="h-4 w-4 rounded accent-red-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button size="sm" fullWidth onClick={handleApply}>
          {t('productsApplyFilters')}
        </Button>
        <button
          onClick={onClear}
          className="text-sm py-2 text-gray-500 hover:text-red-500 dark:text-gray-400 transition-colors"
        >
          {t('productsClearAll')}
        </button>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <X size={12} />
      </button>
    </span>
  )
}

function EmptyState({ onReset, t }: { onReset: () => void; t: (key: any) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">{t('productsNoProducts')}</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs">
        {t('productsNoProductsHint')}
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        {t('productsClearFilters')}
      </Button>
    </motion.div>
  )
}
