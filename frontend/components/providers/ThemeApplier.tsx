'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { applyTheme } from '@/themes'
import { storeConfig } from '@/config/store'

export function ThemeApplier() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const isDark = resolvedTheme === 'dark'

    // Apply custom CSS variables from theme
    applyTheme(storeConfig.theme, isDark)

    // Ensure the .dark class is properly set on <html> for all pages
    // next-themes sets it on <html>, but we double-enforce for reliability
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }

    // Force body background update immediately
    document.body.style.backgroundColor = isDark
      ? 'rgb(10, 10, 10)'
      : 'rgb(250, 251, 255)'
    document.body.style.color = isDark
      ? 'rgb(232, 224, 212)'
      : 'rgb(17, 24, 39)'

  }, [resolvedTheme])

  return null
}
