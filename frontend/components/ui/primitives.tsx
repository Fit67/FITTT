'use client'

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn, initials } from '@/lib/utils'

// ─── Badge ─────────────────────────────────────────────────────
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<'span'> {
  variant?: BadgeVariant
  size?:    BadgeSize
  dot?:     boolean
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary:   'bg-primary-100  text-primary-700  dark:bg-primary-900/40  dark:text-primary-300',
  secondary: 'bg-gray-100     text-gray-700     dark:bg-gray-800        dark:text-gray-300',
  success:   'bg-emerald-100  text-emerald-700  dark:bg-emerald-900/40  dark:text-emerald-300',
  warning:   'bg-amber-100    text-amber-700    dark:bg-amber-900/40    dark:text-amber-300',
  error:     'bg-red-100      text-red-700      dark:bg-red-900/40      dark:text-red-300',
  info:      'bg-blue-100     text-blue-700     dark:bg-blue-900/40     dark:text-blue-300',
  neutral:   'bg-surface-overlay text-gray-600  dark:bg-surface-overlay dark:text-gray-400',
}

export function Badge({
  variant = 'neutral',
  size    = 'md',
  dot,
  className,
  children,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-body font-medium',
        'rounded-badge whitespace-nowrap',
        size === 'sm' ? 'px-2   py-0.5 text-[10px]' : 'px-2.5 py-1   text-xs',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?:  number
  circle?: boolean
}

export function Skeleton({ lines, circle, className, style, ...props }: SkeletonProps) {
  if (lines) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 animate-shimmer rounded-full',
              'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100',
              'bg-[length:200%_100%]',
              'dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
              i === lines - 1 ? 'w-4/5' : 'w-full',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-shimmer',
        'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100',
        'bg-[length:200%_100%]',
        'dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
        circle ? 'rounded-full' : 'rounded-card',
        className,
      )}
      style={style}
      {...props}
    />
  )
}

// ─── Star Rating ───────────────────────────────────────────────
interface StarRatingProps {
  value:         number
  max?:          number
  size?:         number
  interactive?:  boolean
  onChange?:     (rating: number) => void
  showValue?:    boolean
  count?:        number
}

export function StarRating({
  value,
  max         = 5,
  size        = 16,
  interactive = false,
  onChange,
  showValue   = false,
  count,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0)
  const display = interactive && hovered ? hovered : value

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(display)
          const half   = !filled && i < display

          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={interactive ? () => onChange?.(i + 1) : undefined}
              onMouseEnter={interactive ? () => setHovered(i + 1) : undefined}
              onMouseLeave={interactive ? () => setHovered(0)    : undefined}
              className={interactive ? 'cursor-pointer outline-none' : 'pointer-events-none'}
            >
              <Star
                size={size}
                className={cn(
                  'transition-colors',
                  filled ? 'fill-amber-400 text-amber-400' :
                  half   ? 'fill-amber-200 text-amber-400' :
                            'fill-gray-100  text-gray-300 dark:fill-gray-700 dark:text-gray-600',
                )}
              />
            </button>
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}

// ─── Avatar ────────────────────────────────────────────────────
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?:    string
  name?:   string
  size?:   'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const avatarSizes = {
  xs: 'h-6  w-6  text-[10px]',
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const showImg = src && !imgError

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        'bg-primary-100 dark:bg-primary-900',
        avatarSizes[size],
        className,
      )}
      {...props}
    >
      {showImg ? (
        <img
          src={src}
          alt={name ?? ''}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-primary-700 dark:text-primary-300">
          {name ? initials(name) : '?'}
        </span>
      )}
    </div>
  )
}

// ─── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin text-primary-600', className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Divider ───────────────────────────────────────────────────
export function Divider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      {label && (
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}
