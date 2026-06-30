import type { Metadata } from 'next'
import { ThemeApplier } from '@/components/providers/ThemeApplier'
import { storeConfig } from '@/config/store'
import { ToonhubHomepage } from '@/components/ToonhubHomepage'

export const metadata: Metadata = {
  title:       storeConfig.seo.title,
  description: storeConfig.seo.description,
}

export default function HomePage() {
  return (
    <>
      <ThemeApplier />
      <main>
        <ToonhubHomepage />
      </main>
    </>
  )
}
