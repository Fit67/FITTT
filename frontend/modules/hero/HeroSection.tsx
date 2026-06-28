'use client'

import { motion } from 'framer-motion'
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

// ─── Fallback data ─────────────────────────────────────────
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
  return <VITRAPROHero />
}

function VITRAPROHero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden">
      {/* ── Dark gradient background ── */}
      <div className="hero-dark-gradient min-h-[calc(100vh-36px)] md:h-[calc(100vh-36px)] relative">
        {/* Subtle red glow */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center h-full px-6 md:px-8 pt-24 md:pt-28 pb-8 md:pb-12">

          {/* LEFT: Headline + CTAs */}
          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="py-4 md:py-6 z-10"
          >
            {/* Eyebrow pill */}
            <motion.div variants={stagger.item}>
              <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-red-600/20 text-red-400 rounded-full border border-red-600/30 mb-6">
                {t('heroPureProtein')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={stagger.item}
              className="font-display text-[clamp(36px,5.5vw,56px)] font-extrabold leading-[1.05] text-white tracking-tight mb-4"
            >
              {t('heroEverydayPerformance')}<br />
              {t('heroBeginsWith')} <span className="text-red-500">{t('heroProteinWord')}</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={stagger.item}
              className="text-base text-gray-400 leading-relaxed max-w-[380px] mb-8"
            >
              {t('heroSubtextDescription')}
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-4">
              <Link href="/shop/products">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30 uppercase tracking-wide">
                  {t('heroBuyNow')}
                </button>
              </Link>
              <Link href="/shop/products?onSale=true" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {t('todaysDeals')}
                <span className="text-red-400">→</span>
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div variants={stagger.item} className="flex flex-wrap gap-6 mt-10 pt-6 border-t border-white/10">
              {[
                { icon: Truck,   label: t('freeShipping') },
                { icon: Shield,  label: t('qualityGuarantee') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
                  <Icon size={16} className="text-red-400 shrink-0" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Product hero image */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="relative hidden md:flex items-center justify-center py-4 h-full"
          >
            <motion.img
              src="/images/home/clipsnap-edit-6-19-2026.png"
              alt="Premium Protein & Creatine Supplements"
              className="w-full max-w-[640px] max-h-[60vh] lg:max-h-[72vh] object-contain drop-shadow-2xl"
              animate={{
                y: [0, -18, 0],
                x: [0, 10, -10, 0],
                rotate: [0, 1.5, -1.5, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            {/* Glow behind products */}
            <div className="absolute inset-0 bg-gradient-radial from-red-600/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-3 overflow-hidden">
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
              className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap flex items-center gap-3"
            >
              <span className="text-red-500 text-[8px]">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
