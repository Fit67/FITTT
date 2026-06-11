'use client'

/**
 * AnimatedSection.tsx
 *
 * Drop-in wrappers that trigger Framer Motion animations when
 * an element enters the viewport. Uses IntersectionObserver via
 * Framer Motion's `whileInView` — no manual hooks needed.
 *
 * Usage:
 *   <FadeUp>  <h2>...</h2>  </FadeUp>
 *   <StaggerGrid>  {items.map(...)}  </StaggerGrid>
 *   <SlideIn direction="left">  <aside>...</aside>  </SlideIn>
 */

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { fadeUp, fadeUpStagger, scalePop, fadeIn, slideFromLeft, slideFromRight, gridStagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

type MotionDivProps = HTMLMotionProps<'div'> & { className?: string; children?: React.ReactNode }

const VIEW_ONCE     = true
const VIEW_MARGIN   = '-5% 0px -5% 0px' // trigger slightly before fully in view

// ─── FadeUp ───────────────────────────────────────────────────
export function FadeUp({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── FadeIn ───────────────────────────────────────────────────
export function FadeIn({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── SlideIn ──────────────────────────────────────────────────
interface SlideInProps extends MotionDivProps {
  direction?: 'left' | 'right'
  delay?: number
}

export function SlideIn({ children, className, direction = 'left', delay = 0, ...props }: SlideInProps) {
  const variants = direction === 'left' ? slideFromLeft : slideFromRight
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      transition={delay ? { delay } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerContainer — parent that staggers children ─────────
interface StaggerContainerProps extends MotionDivProps {
  count?: number
}

export function StaggerContainer({ children, className, count = 8, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      variants={gridStagger(count)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── StaggerItem — child of StaggerContainer ──────────────────
export function StaggerItem({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={scalePop}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── FadeUpGroup — stagger wrapper that fades children up ──────
export function FadeUpGroup({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={fadeUpStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── FadeUpItem — child of FadeUpGroup ────────────────────────
export function FadeUpItem({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ─── AnimatedSection — section with scroll-triggered fade-up ───
interface AnimatedSectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  delay?: number
}

export function AnimatedSection({ children, className, as: Tag = 'section', delay = 0, ...props }: AnimatedSectionProps) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEW_ONCE, margin: VIEW_MARGIN }}
      transition={delay ? { delay } : undefined}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.section>
  )
}

// ─── PageEnter — wraps an entire page with entrance animation ───
export function PageEnter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
      transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}
