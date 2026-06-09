'use client'

import * as React from 'react'
import { useLangStore } from '@/store/slices/langStore'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { lang, dir } = useLangStore()

  React.useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  return <>{children}</>
}
