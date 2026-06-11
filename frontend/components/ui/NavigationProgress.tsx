'use client'

/**
 * NavigationProgress.tsx
 *
 * A thin gold progress bar that appears at the top of the screen
 * during route transitions — the same pattern used by YouTube,
 * GitHub, and Linear. It signals "something is happening" instantly,
 * eliminating the perceived freeze between page clicks.
 *
 * How it works:
 * 1. On routeChangeStart → animate width 0 → 85% (fast, then slows)
 * 2. On routeChangeComplete → snap to 100% then fade out
 * 3. On routeChangeError → turn red, then fade
 *
 * Uses Next.js router events + Framer Motion for GPU-composited animation.
 */

import * as React from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const controls      = useAnimation()
  const [visible, setVisible] = React.useState(false)
  const prevPath      = React.useRef<string>('')
  const timerRef      = React.useRef<ReturnType<typeof setTimeout>>()

  const currentPath = `${pathname}?${searchParams.toString()}`

  React.useEffect(() => {
    if (prevPath.current === '' ) {
      prevPath.current = currentPath
      return
    }

    if (prevPath.current !== currentPath) {
      prevPath.current = currentPath
      // Navigation completed — finish bar
      controls.start({
        scaleX: 1,
        opacity: 1,
        transition: { duration: 0.18, ease: [0.0, 0.0, 0.2, 1.0] },
      }).then(() => {
        timerRef.current = setTimeout(() => {
          controls.start({
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeOut' },
          }).then(() => {
            setVisible(false)
            controls.set({ scaleX: 0, opacity: 1 })
          })
        }, 100)
      })
    }
  }, [currentPath, controls])

  // Listen for clicks on internal links to start the bar
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return

      clearTimeout(timerRef.current)
      setVisible(true)
      controls.set({ scaleX: 0, opacity: 1 })
      controls.start({
        scaleX: 0.75,
        transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1.0] },
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [controls])

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-progress"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={controls}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2.5px',
            transformOrigin: 'left center',
            zIndex: 99999,
            background: 'linear-gradient(90deg, rgb(217,119,6) 0%, rgb(245,158,11) 40%, rgb(251,191,36) 70%, rgb(250,204,21) 100%)',
            boxShadow: '0 0 8px rgba(245,158,11,0.6), 0 0 20px rgba(245,158,11,0.3)',
            borderRadius: '0 2px 2px 0',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}
