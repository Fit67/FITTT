'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingBag, Truck, Shield } from 'lucide-react'
import { storeConfig } from '@/config/store'
import { useTranslation } from '@/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services'
import { formatPrice } from '@/lib/utils'

const EASE = [0.0, 0.0, 0.2, 1.0] as const

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.10, delayChildren: 0.12 } } },
  item: {
    initial: { opacity: 0, y: 22, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE } },
  },
}

// ─── Products data (from design direction) ─────────────────────
export function getTopSellers(t: any) {
  return [
    { num: '01', name: t('productWhey'),   price: '480 ج.م.' },
    { num: '02', name: t('productRage'),     price: '220 ج.م.' },
    { num: '03', name: t('productBcaa'),     price: '255 ج.م.' },
    { num: '04', name: t('productOmega'),        price: '150 ج.م.' },
  ];
}

export function getMetrics(t: any) {
  return [
    { val: '12k+', label: t('heroAthletesServed') },
    { val: '4.9',  label: t('heroAverageRating')  },
    { val: '24h',  label: t('heroCairoDelivery')  },
  ];
}

export function HeroSection() {
  return <EditorialHero />
}

function EditorialHero() {
  const { t } = useTranslation()

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['top-sellers'],
    queryFn: () => productService.getTopSellers(4),
  })
  
  const products = Array.isArray(featuredData) ? featuredData : []

  return (
    <section className="relative pt-[62px] overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-300">

      {/* ── Subtle grid background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Dark mode grid */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Two-column hero ── */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[520px] md:min-h-[480px]">

        {/* LEFT: Headline + CTAs */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="flex flex-col justify-between px-6 md:px-8 py-14 md:py-16 md:border-r border-b border-gray-100 dark:border-[#1e1e1e]"
        >
          <div>
            {/* Eyebrow */}
            <motion.div variants={stagger.item} className="flex items-center gap-2.5 mb-8">
              <div className="h-px w-6 bg-gray-300 dark:bg-[#555]" />
              <span className="text-[11px] font-light uppercase tracking-[0.14em] text-gray-400 dark:text-[#555]">
                {t('heroEyebrow')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={stagger.item}
              className="font-display text-[clamp(44px,6vw,68px)] font-normal leading-[1.0] text-gray-900 dark:text-[#e8e0d4] tracking-[-0.02em] mb-0"
            >
              {t('heroHeadlineFuel')}<br />
              <em className="italic text-primary-600 dark:text-[#c8822a]">{t('heroHeadlineWork')}</em>
              <span className="block ml-8 md:ml-10">{t('heroHeadlineMatters')}</span>
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p
            variants={stagger.item}
            className="text-[13px] font-light text-gray-500 dark:text-[#666] leading-[1.8] max-w-[280px] border-l-2 border-primary-500 dark:border-[#c8822a] pl-4 mt-8"
          >
            {t('heroSubtext2')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-5 mt-8">
            <Link href="/shop/products">
              <button className="text-[11px] font-medium uppercase tracking-[0.12em] bg-primary-600 dark:bg-[#c8822a] text-white px-6 py-3 hover:opacity-90 transition-opacity">
                {t('shopNow')}
              </button>
            </Link>
            <Link href="/shop/products?onSale=true" className="flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.12em] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] transition-colors">
              {t('todaysDeals')}
              <span className="text-primary-600 dark:text-[#c8822a]">→</span>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.div variants={stagger.item} className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-[#1e1e1e]">
            {[
              { icon: Truck,   label: t('freeShipping') },
              { icon: Shield,  label: t('qualityGuarantee') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-[#555]">
                <Icon size={14} className="text-primary-500 dark:text-[#c8822a] shrink-0" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT: Products + Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
          className="flex flex-col justify-between px-6 md:px-8 py-14 md:py-16 border-b border-gray-100 dark:border-[#1e1e1e]"
        >
          {/* Tag */}
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary-600 dark:text-[#c8822a] mb-6">
            {t('heroFeaturedThisWeek')}
          </div>

          {/* Product stack */}
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-[#444] mb-3 font-light">
              {t('heroWhatsSelling')}
            </div>

            {isLoading && (
              <div className="text-gray-400 text-xs py-4 font-light tracking-wide animate-pulse">Loading products...</div>
            )}

            {!isLoading && products.length > 0 && products.slice(0, 4).map((product, i) => (
              <Link href={`/shop/products/${product.slug}`} key={product._id} className="block">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, ease: EASE, duration: 0.4 }}
                  className="flex items-center justify-between py-[14px] border-b border-gray-100 dark:border-[#1e1e1e] group cursor-pointer first:border-t"
                >
                  <span className="text-[10px] text-gray-300 dark:text-[#444] font-light w-6">0{i + 1}</span>
                  <span className="flex-1 text-[13px] font-light text-gray-500 dark:text-[#888] group-hover:text-gray-900 dark:group-hover:text-[#e8e0d4] transition-colors tracking-[0.01em]">
                    {product.name}
                  </span>
                  <span className="font-display text-[14px] italic text-primary-600 dark:text-[#c8822a]">
                    {formatPrice(product.price)}
                  </span>
                </motion.div>
              </Link>
            ))}

            {!isLoading && products.length === 0 && getTopSellers(t).map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07, ease: EASE, duration: 0.4 }}
                className="flex items-center justify-between py-[14px] border-b border-gray-100 dark:border-[#1e1e1e] group cursor-pointer first:border-t"
              >
                <span className="text-[10px] text-gray-300 dark:text-[#444] font-light w-6">{item.num}</span>
                <span className="flex-1 text-[13px] font-light text-gray-500 dark:text-[#888] group-hover:text-gray-900 dark:group-hover:text-[#e8e0d4] transition-colors tracking-[0.01em]">
                  {item.name}
                </span>
                <span className="font-display text-[14px] italic text-primary-600 dark:text-[#c8822a]">
                  {item.price}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Metrics row */}
          <div className="flex items-end justify-between pt-7 border-t border-gray-100 dark:border-[#1e1e1e] mt-6">
            {getMetrics(t).map(({ val, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-display text-[28px] italic text-gray-900 dark:text-[#e8e0d4] leading-none">
                  {val}
                </span>
                <span className="text-[10px] font-light uppercase tracking-[0.1em] text-gray-400 dark:text-[#555]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Ticker ── */}
      <div className="border-t border-b border-gray-100 dark:border-[#1e1e1e] py-[10px] overflow-hidden">
        <div className="ticker-track">
          {[
            t('freeShipping'),
            t('qualityGuarantee'),
            t('heroWhatsApp'),
            t('easyReturns'),
            t('hero1on1'),
            t('freeShipping'),
            t('qualityGuarantee'),
            t('heroWhatsApp'),
            t('easyReturns'),
            t('hero1on1'),
          ].map((item, i) => (
            <span
              key={i}
              className="text-[11px] font-light uppercase tracking-[0.1em] text-gray-400 dark:text-[#555] whitespace-nowrap flex items-center gap-3"
            >
              <span className="text-primary-500 dark:text-[#c8822a] text-[8px]">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
