import * as React from 'react'

// ─── useDebounce ───────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── useLocalStorage ───────────────────────────────────────────
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initial
    } catch {
      return initial
    }
  })

  const set = React.useCallback(
    (v: T | ((prev: T) => T)) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(value) : v
      setValue(next)
      localStorage.setItem(key, JSON.stringify(next))
    },
    [key, value],
  )

  const remove = React.useCallback(() => {
    setValue(initial)
    localStorage.removeItem(key)
  }, [key, initial])

  return [value, set, remove] as const
}

// ─── useMediaQuery ─────────────────────────────────────────────
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile  = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet  = () => useMediaQuery('(max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

// ─── useIntersectionObserver ───────────────────────────────────
export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
) {
  const ref = React.useRef<HTMLElement>(null)
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isIntersecting }
}

// ─── useClickOutside ───────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
) {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])

  return ref
}

// ─── useScrollLock ─────────────────────────────────────────────
export function useScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (locked) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top      = `-${scrollY}px`
      document.body.style.width    = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.width    = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [locked])
}

// ─── useCountdown ──────────────────────────────────────────────
export function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = React.useState({ d: 0, h: 0, m: 0, s: 0 })

  React.useEffect(() => {
    function tick() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000)  / 60_000),
        s: Math.floor((diff % 60_000)     / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

// ─── usePagination ─────────────────────────────────────────────
export function usePagination(total: number, perPage = 20) {
  const [page, setPage] = React.useState(1)
  const pages    = Math.ceil(total / perPage)
  const hasNext  = page < pages
  const hasPrev  = page > 1

  return {
    page,
    pages,
    hasNext,
    hasPrev,
    next:  () => hasNext && setPage(p => p + 1),
    prev:  () => hasPrev && setPage(p => p - 1),
    goto:  (p: number) => setPage(Math.min(Math.max(1, p), pages)),
    reset: () => setPage(1),
  }
}
