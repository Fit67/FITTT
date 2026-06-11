import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Language = 'en' | 'ar'

interface LangState {
  lang: Language
  dir: 'ltr' | 'rtl'
  setLang: (lang: Language) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      dir: 'ltr',
      setLang: (lang) => set({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr' }),
    }),
    {
      name: 'doctorfit-lang',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
