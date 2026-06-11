/**
 * motion.ts — Central animation configuration for the store
 *
 * All durations are tuned for a perceived 120fps feel:
 *   - Use spring physics (no linear easing) for interactive elements
 *   - Use cubic-bezier for layout transitions (predictable timing)
 *   - GPU-only properties: transform + opacity (no layout triggers)
 */

import type { Variants, Transition } from 'framer-motion'

// ─── Spring presets ────────────────────────────────────────────
// Named after how they "feel" to the user

/** Snappy — for interactive taps, button presses */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.6,
}

/** Smooth — for card hovers, panel slides */
export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.8,
}

/** Gentle — for page entrances, hero elements */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 1.0,
}

/** Floaty — for ambient background elements */
export const springFloaty: Transition = {
  type: 'spring',
  stiffness: 60,
  damping: 14,
  mass: 1.4,
}

// ─── Easing curves ─────────────────────────────────────────────
export const ease = {
  /** Standard decelerate — entering elements */
  enter:    [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
  /** Standard accelerate — exiting elements */
  exit:     [0.4, 0.0, 1.0, 1.0] as [number, number, number, number],
  /** Emphasized — hero, key transitions */
  emphasis: [0.2, 0.0, 0.0, 1.0] as [number, number, number, number],
}

// ─── Page transition variants ──────────────────────────────────
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: ease.enter,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.22,
      ease: ease.exit,
    },
  },
}

// ─── Fade-up — the workhorse scroll-reveal ─────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: ease.emphasis,
    },
  },
}

export const fadeUpStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

// ─── Fade-in (no translate) ────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: ease.enter },
  },
}

// ─── Scale pop — for cards appearing in a grid ─────────────────
export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springSmooth,
    },
  },
}

// ─── Slide from left/right (sidebar, drawer) ───────────────────
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: ease.enter },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.22, ease: ease.exit },
  },
}

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: ease.enter },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.22, ease: ease.exit },
  },
}

// ─── Card hover — lift + glow ──────────────────────────────────
export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    transition: springSmooth,
  },
  hover: {
    y: -6,
    scale: 1.01,
    transition: springSmooth,
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: springSnappy,
  },
}

// ─── Stagger grid — for product grids ─────────────────────────
export function gridStagger(count: number): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: Math.max(0.04, 0.12 - count * 0.004),
        delayChildren: 0.05,
      },
    },
  }
}

// ─── Number counter animation ─────────────────────────────────
export const counterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springSnappy, delay: 0.1 },
  },
}
