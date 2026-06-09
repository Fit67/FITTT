import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { HeroSection }          from '@/modules/hero/HeroSection'
import { CategoriesGrid }       from '@/modules/categories/CategoriesGrid'
import { FeaturedProducts }     from '@/modules/product-card/FeaturedProducts'
import { PromoBanners }         from '@/modules/banners/PromoBanners'
import { DeliveryStripeBanner } from '@/modules/banners/DeliveryStripeBanner'
import { ThemeApplier }         from '@/components/providers/ThemeApplier'
import { storeConfig }          from '@/config/store'

export const metadata: Metadata = {
  title:       storeConfig.seo.title,
  description: storeConfig.seo.description,
}

export default function HomePage() {
  return (
    <>
      <ThemeApplier />
      <Navbar />
      <main>
        <HeroSection />
        <DeliveryStripeBanner />
        <Suspense fallback={null}>
          <CategoriesGrid />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={null}>
          <PromoBanners />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
