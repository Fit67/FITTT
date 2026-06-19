import { useEffect, useState } from 'react'
import { useLangStore } from '@/store/slices/langStore'
import { en } from '@/locales/en'
import { ar } from '@/locales/ar'

const dictionaries = { en, ar }

export type TranslationKey = keyof typeof en

export function useTranslation() {
  const { lang, dir, setLang } = useLangStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const t = (key: TranslationKey): string => {
    const activeLang = mounted ? lang : 'en'
    return dictionaries[activeLang][key] || dictionaries['en'][key] || key
  }

  return {
    t,
    lang: mounted ? lang : 'en',
    dir: mounted ? dir : 'ltr',
    setLang,
  }
}
