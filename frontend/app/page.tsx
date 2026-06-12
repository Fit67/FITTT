import type { Metadata } from 'next'
import { Navbar }               from '@/components/layout/Navbar'
import { Footer }               from '@/components/layout/Footer'
import { HomeClient }           from '@/modules/home/HomeClient'
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
      <HomeClient />
      <Footer />
    </>
  )
}
