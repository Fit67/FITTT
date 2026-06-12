'use client'

import * as React from 'react'
import { useLangStore } from '@/store/slices/langStore'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { lang, dir } = useLangStore()

  React.useEffect(() => {
    // Update <html> lang and dir so the browser and screen readers respond
    document.documentElement.lang = lang
    document.documentElement.dir = dir

    // Ensure RTL/LTR font rendering adjustments
    if (dir === 'rtl') {
      document.documentElement.style.setProperty('--font-body', "'Noto Sans Arabic', 'DM Sans', system-ui, sans-serif")
    } else {
      document.documentElement.style.setProperty('--font-body', "'DM Sans', system-ui, sans-serif")
    }
  }, [lang, dir])

  return <>{children}</>
}
