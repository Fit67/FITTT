'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, Star } from 'lucide-react'
import { storeConfig, currentBusiness } from '@/config/store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.12 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
}

export function HeroSection() {
  const { heroStyle } = storeConfig

  switch (heroStyle) {
    case 'split':       return <SplitHero />
    case 'fullscreen':  return <FullscreenHero />
    case 'minimal':     return <MinimalHero />
    default:            return <SplitHero />
  }
}

// ─── Split Hero (default) ──────────────────────────────────────
function SplitHero() {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-primary-900/5 dark:from-primary-900/40 via-surface to-surface pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 md:grid-cols-2 md:gap-8 md:px-6">

        {/* Text */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-5"
        >
          <motion.div variants={stagger.item}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              {t('nowDelivering')}
            </span>
          </motion.div>

          <motion.h1
            variants={stagger.item}
            className="font-display text-5xl font-bold leading-[1.1] text-gray-900 dark:text-white md:text-6xl lg:text-7xl"
          >
            {t('heroHeadline').split(' ').map((word, i) => (
              <span key={i} className={cn(
                'inline-block mr-3',
                i === 1 ? 'text-primary-600 dark:text-primary-400' : '',
              )}>
                {word}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={stagger.item}
            className="max-w-md text-lg text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            {t('heroSubtext')}
          </motion.p>

          <motion.div variants={stagger.item} className="flex flex-wrap gap-3 pt-2">
            <Link href="/shop/products">
              <Button size="lg" icon={<ShoppingBag size={18} />}>
                {t('shopNow')}
              </Button>
            </Link>
            <Link href="/shop/products?onSale=true">
              <Button size="lg" variant="outline" iconRight={<ArrowRight size={16} />}>
                {t('todaysDeals')}
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={stagger.item}
            className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4"
          >
            {[
              { icon: Truck,    label: t('freeShipping') },
              { icon: Shield,   label: t('qualityGuarantee') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={15} className="text-primary-500" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1,   x: 0  }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="relative"
        >
          {/* Floating product cards */}
          <div className="relative h-[480px] w-full">
            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-800/10 dark:from-primary-800/40 to-surface border border-primary-500/20">
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-200/60 dark:bg-primary-800/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent-light/60 dark:bg-orange-900/20 blur-3xl" />

              {/* Main image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-primary-300 dark:text-primary-700">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="mt-3 text-sm font-medium">Hero Image Here</p>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-8 top-1/4 rounded-2xl bg-white dark:bg-surface-raised shadow-card p-4 flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                <Truck size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('deliveryTime')}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t('within3Days') as string}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Fullscreen Hero ───────────────────────────────────────────
function FullscreenHero() {
  const { heroHeadline, heroSubtext } = currentBusiness

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 pt-16">
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center"
      >
        <h1 className="font-display text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
          {heroHeadline}
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-xl mx-auto">{heroSubtext}</p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/shop/products">
            <Button size="xl">Shop Now</Button>
          </Link>
          <Link href="/shop/products?onSale=true">
            <Button size="xl" variant="outline">See Deals</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Minimal Hero ──────────────────────────────────────────────
function MinimalHero() {
  const { heroHeadline, heroSubtext } = currentBusiness

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          className="max-w-2xl"
        >
          <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
            {heroHeadline}
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{heroSubtext}</p>
          <Link href="/shop/products" className="mt-8 inline-flex">
            <Button size="lg" iconRight={<ArrowRight size={16} />}>Browse Products</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
