'use client'

/**
 * AmbientParticles.tsx
 *
 * Renders subtle floating gold particles in the background.
 * - Purely CSS-animated (no JS per-frame cost)
 * - GPU composited: only uses transform + opacity
 * - Randomized positions, sizes, and durations for organic feel
 * - Respects prefers-reduced-motion
 * - Auto-hides on mobile to save battery
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  id: number
  left: string
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateParticles(count: number, seed = 42): Particle[] {
  // Deterministic pseudo-random from seed (consistent SSR/CSR)
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left:     `${rand() * 100}%`,
    size:     rand() * 3 + 1.5,      // 1.5–4.5px
    duration: rand() * 8 + 6,        // 6–14s
    delay:    rand() * -12,           // stagger start times
    opacity:  rand() * 0.4 + 0.15,   // 0.15–0.55
  }))
}

interface AmbientParticlesProps {
  count?: number
  className?: string
  /** 'hero' = bottom-up drift; 'section' = gentle sway */
  mode?: 'hero' | 'section'
}

export function AmbientParticles({
  count = 18,
  className,
  mode = 'hero',
}: AmbientParticlesProps) {
  const particles = React.useMemo(() => generateParticles(count), [count])

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        // Hide on mobile for performance
        'hidden sm:block',
        // Respect reduced motion
        'motion-reduce:hidden',
        className,
      )}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: mode === 'hero' ? '-10px' : '50%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Glow orbs — large soft background glows ──────────────────
interface GlowOrbProps {
  className?: string
}

export function GlowOrbs({ className }: GlowOrbProps) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Primary orb — top right */}
      <div
        className="absolute rounded-full blur-[100px] opacity-[0.18] dark:opacity-[0.12]"
        style={{
          top: '-5%',
          right: '10%',
          width: '45vw',
          height: '45vw',
          maxWidth: 600,
          maxHeight: 600,
          background: 'radial-gradient(circle, rgb(251,191,36) 0%, rgb(245,158,11) 40%, transparent 70%)',
          animation: 'float 18s ease-in-out infinite',
        }}
      />
      {/* Secondary orb — bottom left */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.12] dark:opacity-[0.08]"
        style={{
          bottom: '5%',
          left: '-5%',
          width: '35vw',
          height: '35vw',
          maxWidth: 480,
          maxHeight: 480,
          background: 'radial-gradient(circle, rgb(217,119,6) 0%, transparent 70%)',
          animation: 'float 22s ease-in-out infinite reverse',
          animationDelay: '-8s',
        }}
      />
    </div>
  )
}

// ─── Shimmer line — horizontal light sweep ────────────────────
export function ShimmerLine({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none overflow-hidden', className)}
      style={{ height: '1px' }}
    >
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}
