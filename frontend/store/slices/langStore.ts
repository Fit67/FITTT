import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Language = 'en' | 'ar'

interface LangState {
  lang: Language
  dir: 'ltr' | 'rtl'
  setLang: (lang: Language) => void
}

const ssrSafeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(name, value) } catch {}
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(name) } catch {}
  },
}

function normalizeLang(value: unknown): Language {
  return value === 'ar' ? 'ar' : 'en'
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
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: state => ({ lang: normalizeLang(state.lang) }),
      onRehydrateStorage: () => state => {
        if (!state) return
        state.lang = normalizeLang(state.lang)
        state.dir = state.lang === 'ar' ? 'rtl' : 'ltr'
      },
    }
  )
)
