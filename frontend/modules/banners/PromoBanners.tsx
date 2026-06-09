'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Truck, Shield, Star } from 'lucide-react'

// All imports at the top — no bottom-of-file imports
import { useFeaturedProducts, useCategories, useBanners, useProducts } from '@/hooks/useQueries'
import { ProductCard, ProductCardSkeleton } from '@/modules/product-card/ProductCard'
import { useTranslation } from '@/hooks/useTranslation'
import { Skeleton } from '@/components/ui/primitives'
import { formatPrice } from '@/lib/utils'
import { storeConfig, currentBusiness } from '@/config/store'
import { cn } from '@/lib/utils'

// ─── Section Header helper ─────────────────────────────────────
function SectionHeader({
  label, title, href,
}: { label: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">
          {label}
        </p>
        <h2 className="section-heading">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:gap-2 transition-all whitespace-nowrap"
        >
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

// ─── Featured Products ─────────────────────────────────────────────
export function FeaturedProducts() {
  const { t } = useTranslation()
  // Show isFeatured products; if none exist yet, fall back to latest products
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProducts(10)
  const { data: latestData,   isLoading: latestLoading   } = useProducts({ limit: 10, sortBy: 'newest' })

  const hasFeatured = (featuredData?.length ?? 0) > 0
  const isLoading   = hasFeatured ? featuredLoading : latestLoading
  const products    = hasFeatured ? featuredData    : latestData?.data

  const label = hasFeatured ? t('featuredProducts') : t('latestProducts')

  return (
    <section className="section container-page">
      <SectionHeader
        label={t('handPicked')}
        title={label}
        href="/shop/products"
      />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products?.map((product, i) => (
              <ProductCard key={product._id} product={product} priority={i < 4} />
            ))}
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
    <section className="section container-page">
      <SectionHeader label={t('browse')} title={t('shopByCategory')} href="/shop/products" />
      <div className={cn(
        'mt-8 grid gap-4',
        cols === 6 ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'
        : cols === 5 ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      )}>
        {isLoading
          ? Array.from({ length: cols }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-card" />
            ))
          : categories?.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/shop/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-card border border-gray-100 bg-surface p-5 text-center shadow-card hover:shadow-card-hover hover:border-primary-200 dark:border-gray-800 dark:bg-surface-raised dark:hover:border-primary-800 transition-all duration-300"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color ?? '#16a34a'}20` }}
                  >
                    {cat.icon ?? '🛒'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {cat.productCount} {t('items')}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
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
    <section className="section container-page">
      <div className={cn(
        'grid gap-5',
        middleBanners.length === 1 ? 'grid-cols-1'
        : middleBanners.length === 2 ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-3',
      )}>
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-card" />)
          : middleBanners.map((banner, i) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={banner.ctaLink ?? '/shop/products'}>
                  <div className="relative h-52 overflow-hidden rounded-card bg-gray-100 dark:bg-gray-800">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center px-6">
                      {banner.subtitle && (
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                          {banner.subtitle}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-xl font-bold text-white">{banner.title}</h3>
                      {banner.ctaText && (
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                          {banner.ctaText} <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
      className="group block border-y border-primary-500/20 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
    >
      <div className="container-page py-4 flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="fill-primary-500">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="font-display font-bold text-lg md:text-xl text-primary-500 group-hover:text-primary-400 transition-colors">
          لمتابعة أخر العروض و الخصومات، انضم لجروب الواتساب الخاص بنا من هنا!
        </span>
      </div>
    </a>
  )
}


// ─── Testimonials ──────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Sarah M.',  role: 'Regular customer',    body: 'The freshest produce delivered right to my door. Never going back to the grocery store!', rating: 5, avatar: 'SM' },
  { name: 'James K.',  role: 'Monthly subscriber',  body: 'Incredible selection and the app makes it so easy to reorder my favorites.',              rating: 5, avatar: 'JK' },
  { name: 'Priya L.',  role: 'New customer',         body: 'Fast delivery, everything was exactly as pictured. Will definitely order again.',          rating: 5, avatar: 'PL' },
  { name: 'Daniel R.', role: 'Weekly shopper',       body: 'The quality is consistently great and the prices are very competitive.',                   rating: 5, avatar: 'DR' },
]

export function TestimonialsSection() {
  const { t } = useTranslation()

  return (
    <section className="section bg-surface-raised dark:bg-gray-950">
      <div className="container-page">
        <SectionHeader label={t('whatCustomersSay')} title={t('lovedByThousands')} />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                "{t.body}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
