'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Truck, Shield, Star } from 'lucide-react'
import { storeConfig, currentBusiness } from '@/config/store'
import { Button } from '@/components/ui/Button'
import { AmbientParticles, GlowOrbs } from '@/components/ui/AmbientParticles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

// ─── Animation config ──────────────────────────────────────────
const EASE_ENTER = [0.0, 0.0, 0.2, 1.0] as const

const stagger = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.12,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 22, filter: 'blur(4px)' },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.55, ease: EASE_ENTER },
    },
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
  const prefersReduced = useReducedMotion()

  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-surface pt-16 transition-colors duration-500 dark:bg-[#0B0F19]">
      {/* Ambient background layers */}
      <GlowOrbs />
      <AmbientParticles count={14} mode="hero" />

      {/* Premium Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Subtle gold shimmer line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:py-18 md:grid-cols-2 md:gap-8 md:px-6 md:py-20">

        {/* ── Text side ───────────────────────────────────────── */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-5"
        >
          {/* Live badge */}
          <motion.div variants={stagger.item}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              {t('nowDelivering')}
            </span>
          </motion.div>

          {/* Headline with animated gradient on key word */}
          <motion.h1
            variants={stagger.item}
            className="font-display text-4xl font-bold leading-[1.08] text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t('heroHeadline').split(' ').map((word: string, i: number) => (
              <span
                key={i}
                className={cn(
                  'inline-block mr-3',
                  i === 1 && 'animate-text-shimmer',
                )}
              >
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

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Link href="/shop/products" className="w-full sm:w-auto">
              <Button size="lg" icon={<ShoppingBag size={18} />} className="w-full sm:w-auto ripple-effect glow-gold">
                {t('shopNow')}
              </Button>
            </Link>
            <Link href="/shop/products?onSale=true" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" iconRight={<ArrowRight size={16} />} className="w-full sm:w-auto">
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
              { icon: Truck,  label: t('freeShipping') },
              { icon: Shield, label: t('qualityGuarantee') },
            ].map(({ icon: Icon, label }) => (
              <div key={label as string} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={15} className="text-primary-500" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Visual side ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.75, ease: EASE_ENTER, delay: 0.18 }}
          className="relative"
        >
          <motion.div
            animate={prefersReduced ? {} : {
              y: [-12, 12, -12],
              rotateZ: [-0.8, 0.8, -0.8],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-[300px] w-full sm:h-[380px] lg:h-[480px]"
            style={{ willChange: 'transform' }}
          >
            {/* Main glass card */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white/45 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-primary-500/20 shadow-2xl">
              {/* Inner glow */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-200/50 dark:bg-primary-800/15 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-amber-100/60 dark:bg-orange-900/15 blur-3xl" />

              {/* Scanline overlay */}
              <div className="absolute inset-0 premium-scanline opacity-30 dark:opacity-50 pointer-events-none" />
              <div className="absolute inset-0 premium-grid pointer-events-none" />

              {/* Hero image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-primary-300 dark:text-primary-700">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="mt-3 text-sm font-medium">Hero Image Here</p>
                </div>
              </div>
            </div>

            {/* Floating stat card — delivery */}
            <motion.div
              animate={prefersReduced ? {} : { y: [-4, 4, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-3 top-1/4 flex items-center gap-3 rounded-xl border border-white/50 bg-white/88 p-3 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/85 sm:-left-8 sm:p-4"
              style={{ willChange: 'transform' }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                <Truck size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('deliveryTime')}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t('within3Days') as string}</p>
              </div>
            </motion.div>

            {/* Floating stat card — rating */}
            <motion.div
              animate={prefersReduced ? {} : { y: [4, -4, 4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -right-2 bottom-1/4 flex items-center gap-2.5 rounded-xl border border-white/50 bg-white/88 px-3 py-2.5 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/85 sm:-right-6"
              style={{ willChange: 'transform' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star size={14} className="fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">4.9★</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">2k+ reviews</p>
              </div>
            </motion.div>
          </motion.div>
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
      <GlowOrbs />
      <AmbientParticles count={20} mode="hero" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: EASE_ENTER }}
        className="relative z-10 mx-auto max-w-4xl px-4 text-center"
      >
        <h1 className="font-display text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
          {heroHeadline}
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-xl mx-auto">{heroSubtext}</p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/shop/products">
            <Button size="xl" className="ripple-effect glow-gold">Shop Now</Button>
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
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: EASE_ENTER }}
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
