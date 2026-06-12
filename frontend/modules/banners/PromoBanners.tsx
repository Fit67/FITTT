'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Zap, Activity, Sparkles } from 'lucide-react'

import { useFeaturedProducts, useCategories, useBanners, useProducts } from '@/hooks/useQueries'
import { ProductCard, ProductCardSkeleton } from '@/modules/product-card/ProductCard'
import { useTranslation } from '@/hooks/useTranslation'
import { Skeleton } from '@/components/ui/primitives'
import { formatPrice } from '@/lib/utils'
import { storeConfig, currentBusiness } from '@/config/store'
import { cn } from '@/lib/utils'

// ─── Section eyebrow + header ──────────────────────────────────
function SectionHeader({ label, title, href }: { label: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-gray-200 dark:bg-[#2a2a2a]" />
          <span className="text-[10px] font-normal uppercase tracking-[0.18em] text-gray-400 dark:text-[#555]">
            {label}
          </span>
        </div>
        <h2 className="font-display text-[clamp(26px,3.5vw,36px)] font-normal text-gray-900 dark:text-[#e8e0d4] tracking-[-0.02em] leading-tight">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] font-light text-gray-400 dark:text-[#555] hover:text-primary-600 dark:hover:text-[#c8822a] transition-colors whitespace-nowrap"
        >
          View all <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}

// ─── Premium Experience ────────────────────────────────────────
export function PremiumExperience() {
  const { t } = useTranslation()

  const TRUST_ITEMS = [
    {
      num: '01',
      title: 'Genuine products, always',
      sub: 'Every supplement is sourced directly from the manufacturer',
    },
    {
      num: '02',
      title: 'Delivered to your door in Cairo',
      sub: 'Order before 3pm — arrives the same day',
    },
    {
      num: '03',
      title: 'Built for serious athletes',
      sub: 'Not a general-purpose store. Every product earns its place',
    },
  ]

  const STATS = [
    { val: '100%', label: 'Verified formulas' },
    { val: '24h',  label: 'Fast restocks' },
    { val: '1:1',  label: 'Athlete support' },
  ]

  return (
    <section className="border-y border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">

        {/* Left: editorial copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 md:px-8 py-14 md:py-16 border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#1e1e1e]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gray-200 dark:bg-[#2a2a2a]" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-[#555]">
              DoctorFit Performance Lab
            </span>
          </div>

          <h2 className="font-display text-[clamp(28px,3.5vw,38px)] font-normal text-gray-900 dark:text-[#e8e0d4] tracking-[-0.01em] leading-[1.1] mb-5">
            A sharper way<br />to build <em className="italic text-primary-600 dark:text-[#c8822a]">your stack</em>
          </h2>

          <p className="text-[13px] font-light text-gray-500 dark:text-[#666] leading-[1.9] max-w-[340px] mb-8">
            Explore supplements, recovery tools, and athlete essentials through a faster, cleaner shopping experience built for serious training. Every product verified. Every formula tested.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 pb-8 border-b border-gray-100 dark:border-[#1e1e1e] mb-8">
            {STATS.map(({ val, label }) => (
              <div key={label}>
                <div className="font-display text-[32px] italic text-primary-600 dark:text-[#c8822a] leading-none">{val}</div>
                <div className="text-[10px] font-light uppercase tracking-[0.1em] text-gray-400 dark:text-[#555] mt-1">{label}</div>
              </div>
            ))}
          </div>

          <Link href="/shop/products">
            <button className="text-[11px] font-medium uppercase tracking-[0.12em] bg-primary-600 dark:bg-[#c8822a] text-white px-6 py-3 hover:opacity-90 transition-opacity inline-flex items-center gap-2">
              Explore all products <ArrowRight size={14} />
            </button>
          </Link>
        </motion.div>

        {/* Right: trust list */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          {TRUST_ITEMS.map(({ num, title, sub }, i) => (
            <div
              key={num}
              className={cn(
                'flex items-center gap-5 px-6 md:px-8 py-8',
                i < TRUST_ITEMS.length - 1 && 'border-b border-gray-100 dark:border-[#1e1e1e]',
              )}
            >
              <div
                className="font-display text-[42px] italic text-gray-100 dark:text-[#1e1e1e] font-normal leading-none flex-shrink-0"
                style={{ WebkitTextStroke: '1px rgba(0,0,0,0.08)' }}
              >
                {num}
              </div>
              <div>
                <div className="text-[13px] font-normal text-gray-800 dark:text-[#ccc] mb-1 tracking-[0.01em]">{title}</div>
                <div className="text-[11px] font-light text-gray-400 dark:text-[#555] tracking-[0.04em]">{sub}</div>
              </div>
            </div>
          ))}
        </motion.div>
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
  const label       = hasFeatured ? t('featuredProducts') : t('latestProducts')

  return (
    <section className="py-14 md:py-20 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader label={t('handPicked')} title={label} href="/shop/products" />

        {/* Product grid — editorial 1px gap layout */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-100 dark:bg-[#1a1a1a]">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)
            : products?.map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 4} />
              ))
          }
        </div>
      </div>
    </section>
  )
}

// ─── Categories Grid ───────────────────────────────────────────
export function CategoriesGrid() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useCategories()
  const cols = currentBusiness.categoryGridCols

  return (
    <section className="py-14 md:py-20 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader label={t('browse')} title={t('shopByCategory')} href="/shop/products" />

        {/* Category pills — editorial style */}
        <div className={cn(
          'mt-8 flex flex-wrap gap-2',
        )}>
          {isLoading
            ? Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-28" />
              ))
            : categories?.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/shop/products?category=${cat.slug}`}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-[#1e1e1e] text-[11px] font-light uppercase tracking-[0.08em] text-gray-500 dark:text-[#666] hover:border-primary-600 dark:hover:border-[#c8822a] hover:text-primary-600 dark:hover:text-[#c8822a] transition-all duration-200"
                  >
                    <span className="text-base leading-none">{cat.icon ?? '🛒'}</span>
                    {cat.name}
                    {cat.productCount && (
                      <span className="text-gray-300 dark:text-[#444] text-[10px]">({cat.productCount})</span>
                    )}
                  </Link>
                </motion.div>
              ))
          }
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
          'grid gap-px bg-gray-100 dark:bg-[#1e1e1e]',
          middleBanners.length === 1 ? 'grid-cols-1'
          : middleBanners.length === 2 ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-3',
        )}>
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52" />)
            : middleBanners.map((banner, i) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={banner.ctaLink ?? '/shop/products'}>
                    <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-[#111] group">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center px-6">
                        {banner.subtitle && (
                          <p className="text-[10px] font-light uppercase tracking-[0.18em] text-white/60 mb-2">
                            {banner.subtitle}
                          </p>
                        )}
                        <h3 className="font-display text-xl font-normal italic text-white">{banner.title}</h3>
                        {banner.ctaText && (
                          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-white/80">
                            {banner.ctaText} <ArrowRight size={12} />
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
  const { storeConfig } = require('@/config/store')

  return (
    <a
      href={storeConfig?.social?.whatsapp || '#'}
      target="_blank"
      rel="noreferrer"
      className="group block border-y border-primary-100 dark:border-[#1e1e1e] bg-primary-50 dark:bg-[#0e0e0e] hover:bg-primary-100 dark:hover:bg-[#111] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="fill-primary-500 dark:fill-[#c8822a] shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="font-display italic text-[15px] md:text-[17px] text-primary-600 dark:text-[#c8822a] group-hover:opacity-90 transition-opacity">
          لمتابعة أخر العروض و الخصومات، انضم لجروب الواتساب الخاص بنا من هنا!
        </span>
      </div>
    </a>
  )
}

// ─── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah M.',  role: 'Regular customer',   body: 'The freshest produce delivered right to my door. Never going back to the grocery store!', rating: 5, avatar: 'SM' },
  { name: 'James K.',  role: 'Monthly subscriber', body: 'Incredible selection and the app makes it so easy to reorder my favorites.',             rating: 5, avatar: 'JK' },
  { name: 'Priya L.',  role: 'New customer',        body: 'Fast delivery, everything was exactly as pictured. Will definitely order again.',         rating: 5, avatar: 'PL' },
  { name: 'Daniel R.', role: 'Weekly shopper',      body: 'The quality is consistently great and the prices are very competitive.',                  rating: 5, avatar: 'DR' },
]

export function TestimonialsSection() {
  const { t } = useTranslation()

  return (
    <section className="py-14 md:py-20 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader label={t('whatCustomersSay')} title={t('lovedByThousands')} />

        <div className="mt-8 grid grid-cols-1 gap-px bg-gray-100 dark:bg-[#1e1e1e] sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-[#0e0e0e] p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-[13px] font-light text-gray-500 dark:text-[#666] leading-[1.9] mb-5">
                "{item.body}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary-100 dark:bg-[#1e1e1e]">
                  <span className="text-[10px] font-bold text-primary-700 dark:text-[#c8822a]">{item.avatar}</span>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-900 dark:text-[#ccc]">{item.name}</p>
                  <p className="text-[11px] font-light text-gray-400 dark:text-[#555]">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
