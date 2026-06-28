'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'

import { useFeaturedProducts, useCategories, useBanners, useProducts } from '@/hooks/useQueries'
import { ProductCard, ProductCardSkeleton } from '@/modules/product-card/ProductCard'
import { useTranslation } from '@/hooks/useTranslation'
import { Skeleton } from '@/components/ui/primitives'
import { formatPrice } from '@/lib/utils'
import { storeConfig, currentBusiness } from '@/config/store'
import { cn } from '@/lib/utils'

// ─── Section header with pill label ────────────────────────────
function SectionHeader({ label, title, href, actions }: { label: string; title: string; href?: string; actions?: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center text-center gap-3 w-full mb-10">
      <span className="pill-label">{label}</span>
      <h2 className="section-title">{title}</h2>
      <div className="flex items-center gap-4 mt-2">
        {actions}
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            {t('bestSellersViewAll')} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Categories Grid (Essentials Collection) ──────────────────
export function CategoriesGrid() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useCategories()

  const getCategoryImage = (slug: string) => {
    const s = slug.toLowerCase()
    if (s.includes('protein')) return '/images/home/category-protein.png'
    if (s.includes('creatine')) return '/images/home/category-creatine.png'
    if (s.includes('preworkout') || s.includes('pre-workout') || s.includes('pre workout')) return '/images/home/category-preworkout.png'
    if (s.includes('vitamin') || s.includes('health') || s.includes('bar')) return '/images/home/category-vitamins.png'
    return '/images/home/category-protein.png'
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader label={t('categoriesCollection')} title={t('categoriesLivingJourney')} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            : (categories ?? []).slice(0, 4).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/shop/products?category=${cat.slug}`}
                    className="group block relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-[3/4] hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={getCategoryImage(cat.slug)}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      <span className="flex h-8 w-8 items-center justify-center bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-red-600 transition-colors">
                        <ArrowUpRight size={14} className="text-white" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
          }
          {/* Fallback if no categories from API */}
          {!isLoading && (!categories || categories.length === 0) && (
            <>
              {[
                { name: 'Protein Boosters', img: '/images/home/category-protein.png' },
                { name: 'Creatine Power', img: '/images/home/category-creatine.png' },
                { name: 'Pre-Workout', img: '/images/home/category-preworkout.png' },
                { name: 'Vitamins & Health', img: '/images/home/category-vitamins.png' },
              ].map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href="/shop/products"
                    className="group block relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-[3/4] hover:shadow-lg transition-all duration-300"
                  >
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      <span className="flex h-8 w-8 items-center justify-center bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-red-600 transition-colors">
                        <ArrowUpRight size={14} className="text-white" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Premium Experience ────────────────────────────────────────
export function PremiumExperience() {
  const { t } = useTranslation()

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: overlapping images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
              <img
                src="/images/home/community-banner.png"
                alt="Premium supplements"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Right: text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="pill-label mb-4 inline-block">{t('premiumDailyGains')}</span>
            <h2 className="section-title mb-4">
              {t('premiumBuildStrengthTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              {t('premiumBuildStrengthDesc')}
            </p>
            <Link href="/shop/products?category=whey-protein">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30">
                {t('premiumGrabYours')}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Featured Products ─────────────────────────────────────────
export function FeaturedProducts() {
  const { t } = useTranslation()
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProducts(10)
  const { data: latestData, isLoading: latestLoading }     = useProducts({ limit: 10, sortBy: 'newest' })

  const hasFeatured = (featuredData?.length ?? 0) > 0
  const isLoading   = hasFeatured ? featuredLoading : latestLoading
  const products    = hasFeatured ? featuredData    : latestData?.data
  const label       = hasFeatured ? 'Best Sellers' : 'Latest Products'

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 320
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  const actions = (
    <div className="flex gap-2 hidden md:flex">
      <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 focus:outline-none">
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 focus:outline-none">
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  )

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader label={t('footerLinkBestSellers')} title={t('bestRatedTitle')} href="/shop/products" actions={actions} />

        {/* Product Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 items-stretch"
          style={{ scrollBehavior: 'smooth' }}
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[280px] sm:w-[300px] shrink-0 snap-start flex">
                  <div className="w-full h-full">
                    <ProductCardSkeleton index={i} />
                  </div>
                </div>
              ))
            : products?.map((product, i) => (
                <div key={product._id} className="w-[280px] sm:w-[300px] shrink-0 snap-start flex">
                  <div className="w-full h-full">
                    <ProductCard product={product} priority={i < 4} className="h-full" />
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </section>
  )
}

// ─── Flash Deal Banner with Countdown ──────────────────────────
export function FlashDealBanner() {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = React.useState({ days: 142, hours: 19, mins: 46, secs: 6 })

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, mins, secs } = prev
        secs--
        if (secs < 0) { secs = 59; mins-- }
        if (mins < 0) { mins = 59; hours-- }
        if (hours < 0) { hours = 23; days-- }
        if (days < 0) return prev
        return { days, hours, mins, secs }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 p-10 md:p-14 text-center">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-red-600/10 blur-[80px] pointer-events-none" />

          <h2 className="relative font-display text-xl md:text-2xl font-bold text-white uppercase tracking-wider mb-3">
            {t('flashDealUpgradeTitle')}
          </h2>
          <p className="relative text-sm text-gray-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {t('flashDealUpgradeDesc')}
          </p>

          <Link href="/shop/products?onSale=true">
            <button className="relative inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all mb-8">
              {t('flashDealClaim')}
            </button>
          </Link>

          {/* Countdown */}
          <div className="relative flex items-center justify-center gap-3 md:gap-4">
            {[
              { val: timeLeft.days, label: t('countdownDays') },
              { val: timeLeft.hours, label: t('countdownHours') },
              { val: timeLeft.mins, label: t('countdownMins') },
              { val: timeLeft.secs, label: t('countdownSecs') },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <span className="text-white/30 text-xl font-bold">:</span>}
                <div className="countdown-box bg-white/10 backdrop-blur-sm rounded-xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center">
                  <span className="text-xl md:text-2xl font-bold text-white">{String(item.val).padStart(2, '0')}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Promo Banners ─────────────────────────────────────────────
export function PromoBanners() {
  const { data: banners, isLoading } = useBanners()
  const middleBanners = banners?.filter(b => b.position === 'middle') ?? []
  if (!isLoading && middleBanners.length === 0) return null

  return (
    <section className="py-14 md:py-20 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className={cn(
          'grid gap-6',
          middleBanners.length === 1 ? 'grid-cols-1'
          : middleBanners.length === 2 ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-3',
        )}>
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
            : middleBanners.map((banner, i) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={banner.ctaLink ?? '/shop/products'}>
                    <div className="relative h-52 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 group">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center px-6">
                        {banner.subtitle && (
                          <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-2">
                            {banner.subtitle}
                          </p>
                        )}
                        <h3 className="font-display text-xl font-bold text-white">{banner.title}</h3>
                        {banner.ctaText && (
                          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/80">
                            {banner.ctaText} <ArrowRight size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
          }
        </div>
      </div>
    </section>
  )
}

// ─── WhatsApp Stripe Banner ────────────────────────────────────
export function DeliveryStripeBanner() {
  const { t } = useTranslation()
  const { storeConfig } = require('@/config/store')

  return (
    <a
      href={storeConfig?.social?.whatsapp || '#'}
      target="_blank"
      rel="noreferrer"
      className="group block bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors border-b border-red-100 dark:border-red-900/30"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="fill-red-500 dark:fill-red-400 shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="font-display font-semibold text-[14px] md:text-[16px] text-red-600 dark:text-red-400 group-hover:opacity-90 transition-opacity">
          {t('heroWhatsApp')}
        </span>
      </div>
    </a>
  )
}

// ─── Testimonials ──────────────────────────────────────────────
export function TestimonialsSection() {
  return null
}
