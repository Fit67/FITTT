'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { applyTheme } from '@/themes'
import { storeConfig } from '@/config/store'

export function ThemeApplier() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    applyTheme(storeConfig.theme, resolvedTheme === 'dark')
  }, [resolvedTheme])

  return null
}
