import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ToastContainer } from '@/components/ui/Toast'
import { SearchModal } from '@/modules/search/SearchModal'
import { NavigationProgress } from '@/components/ui/NavigationProgress'
import { storeConfig } from '@/config/store'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase:  new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title:         { default: storeConfig.seo.title, template: `%s | ${storeConfig.name}` },
  description:   storeConfig.seo.description,
  keywords:      storeConfig.seo.keywords,
  openGraph: {
    title:       storeConfig.seo.title,
    description: storeConfig.seo.description,
    images:      [storeConfig.seo.ogImage],
    type:        'website',
  },
  twitter: {
    card:  'summary_large_image',
    title: storeConfig.seo.title,
  },
  icons: { icon: storeConfig.favicon },
}

import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { ThemeApplier } from '@/components/providers/ThemeApplier'
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={storeConfig.language} dir={storeConfig.direction} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body bg-surface text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300"
        style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
      >
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {/* ThemeApplier syncs CSS vars + body classes on every page, every theme change */}
            <ThemeApplier />
            <QueryProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              {children}
              <Analytics />
              <SpeedInsights />
              <ToastContainer />
              <SearchModal />
            </QueryProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

