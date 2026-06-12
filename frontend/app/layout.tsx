import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ToastContainer } from '@/components/ui/Toast'
import { SearchModal } from '@/modules/search/SearchModal'
import { NavigationProgress } from '@/components/ui/NavigationProgress'
import { storeConfig } from '@/config/store'
import { getGoogleFontsUrl } from '@/themes'
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
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontsUrl = getGoogleFontsUrl(storeConfig.theme)

  return (
    <html lang={storeConfig.language} dir={storeConfig.direction} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-surface text-gray-900 dark:text-gray-100 antialiased">
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <QueryProvider>
              {/* Gold progress bar — shows instantly on link click */}
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              {children}
              <ToastContainer />
              <SearchModal />
            </QueryProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
