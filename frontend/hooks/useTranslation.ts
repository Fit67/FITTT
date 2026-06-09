import { useLangStore } from '@/store/slices/langStore'
import { en } from '@/locales/en'
import { ar } from '@/locales/ar'

const dictionaries = { en, ar }

export type TranslationKey = keyof typeof en

export function useTranslation() {
  const { lang, dir, setLang } = useLangStore()

  const t = (key: TranslationKey): string => {
    return dictionaries[lang][key] || dictionaries['en'][key] || key
  }

  return { t, lang, dir, setLang }
}
