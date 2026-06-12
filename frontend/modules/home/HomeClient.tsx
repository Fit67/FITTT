'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts, useCategories } from '@/hooks/useQueries'
import { ProductCard } from '@/modules/product-card/ProductCard'
import { useTranslation } from '@/hooks/useTranslation'

export function HomeClient() {
  const { t } = useTranslation()
  const { data: categories } = useCategories()
  const [activeCategory, setActiveCategory] = useState<string>('All')
  
  const { data: productsData, isLoading } = useProducts(
    activeCategory !== 'All' ? { category: activeCategory, limit: 8 } : { limit: 8 }
  )

  const products = productsData?.data || []

  // Ensure 'All' is the first category, then map the rest
  const catList = ['All', ...(categories?.map(c => c.name) || [])]

  return (
    <main className="min-h-screen bg-white dark:bg-[#0e0e0e]">
      {/* HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[75vh] border-b border-gray-200 dark:border-[#1e1e1e]">
        <div className="p-10 lg:p-[60px] flex flex-col justify-center items-start bg-white dark:bg-[#0e0e0e]">
          <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.95] mb-6 text-gray-900 dark:text-[#e8e0d4] font-normal" dangerouslySetInnerHTML={{ __html: t('performanceTitle').replace('Redefined.', '<em class="italic text-accent">Redefined.</em>').replace('بمفهوم جديد.', '<em class="italic text-accent">بمفهوم جديد.</em>') }}>
          </h1>
          <p className="text-[14px] text-gray-600 dark:text-[#888] max-w-[320px] leading-[1.6] mb-10">
            {t('performanceSub')}
          </p>
          <button className="text-[11px] font-normal tracking-[0.12em] uppercase text-white dark:text-[#0a0a0a] bg-accent px-6 py-3 cursor-pointer border-none hover:bg-opacity-90 transition-all">
            {t('shopCollection')}
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-[#111] flex items-center justify-center text-[60px] lg:border-l border-gray-200 dark:border-[#1e1e1e] min-h-[300px]">
          📸
        </div>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden whitespace-nowrap py-3 border-b border-gray-200 dark:border-[#1e1e1e] bg-white dark:bg-[#0e0e0e] flex items-center">
        <motion.div 
          className="flex items-center gap-6 text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-[#555]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>{t('tickerShipping')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              <span>{t('tickerDelivery')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              <span>{t('tickerTested')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              <span>{t('tickerShipping')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              <span>{t('tickerDelivery')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
              <span>{t('tickerTested')}</span>
              <span className="w-1 h-1 rounded-full bg-accent"></span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* CATEGORIES */}
      <section className="flex flex-wrap gap-2.5 px-7 py-8 border-b border-gray-200 dark:border-[#1e1e1e] bg-white dark:bg-[#0e0e0e] overflow-x-auto no-scrollbar">
        {catList.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] uppercase tracking-[0.1em] px-4 py-2 border rounded-full transition-colors whitespace-nowrap ${
              activeCategory === cat 
                ? 'border-gray-900 bg-gray-900 text-white dark:border-[#e8e0d4] dark:bg-[#e8e0d4] dark:text-[#0a0a0a]' 
                : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-[#333] dark:text-[#888] dark:hover:border-[#555]'
            }`}
          >
            {cat === 'All' ? t('all') : cat}
          </button>
        ))}
      </section>

      {/* PRODUCTS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-gray-200 dark:bg-[#1e1e1e] gap-px border-b border-gray-200 dark:border-[#1e1e1e]">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface-raised w-full aspect-[3/4] animate-pulse"></div>
          ))
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500 bg-white dark:bg-[#0e0e0e]">
            {t('noProductsFound')}
          </div>
        )}
      </section>

      {/* EDITORIAL / PROMO */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-10 lg:p-[60px] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-[#1e1e1e] bg-white dark:bg-[#0e0e0e]">
          <h2 className="font-display text-[32px] lg:text-[40px] leading-[1.1] mb-4 text-gray-900 dark:text-[#e8e0d4] font-normal">
            {t('exploreStandardTitle')}
          </h2>
          <p className="text-[14px] text-gray-600 dark:text-[#888] mb-8 max-w-[280px]">
            {t('exploreStandardSub')}
          </p>
          <button className="flex items-center gap-2 text-[11px] font-light tracking-[0.12em] uppercase text-gray-600 dark:text-[#666] bg-transparent border-none cursor-pointer hover:text-gray-900 dark:hover:text-[#ccc] transition-colors group">
            {t('learnMore')} <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-[#111] flex items-center justify-center text-[40px] text-gray-300 dark:text-[#333] aspect-video lg:aspect-auto min-h-[300px]">
          📹
        </div>
      </section>
    </main>
  )
}
