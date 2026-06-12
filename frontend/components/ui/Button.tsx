'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  icon?:      React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
  children?:  React.ReactNode
}

// Editorial flat buttons — no border-radius, clean uppercase tracking
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:opacity-90 active:opacity-80 ' +
    'dark:bg-[#c8822a] dark:hover:opacity-90 ' +
    'transition-opacity duration-200',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 ' +
    'dark:bg-[#1e1e1e] dark:text-[#ccc] dark:hover:bg-[#2a2a2a] ' +
    'transition-colors duration-200',
  outline:
    'border border-current text-primary-600 hover:bg-primary-50 active:bg-primary-100 ' +
    'dark:text-[#c8822a] dark:hover:bg-[#1e1e1e] ' +
    'transition-colors duration-200',
  ghost:
    'text-gray-600 hover:text-gray-900 hover:bg-gray-100 ' +
    'dark:text-[#888] dark:hover:text-[#e8e0d4] dark:hover:bg-[#1e1e1e] ' +
    'transition-colors duration-200',
  danger:
    'bg-red-600 text-white hover:opacity-90 ' +
    'transition-opacity duration-200',
  success:
    'bg-emerald-600 text-white hover:opacity-90 ' +
    'transition-opacity duration-200',
}

const sizeClasses: Record<Size, string> = {
  xs:  'h-7  px-3   text-[9px]  gap-1   tracking-[0.1em] uppercase',
  sm:  'h-8  px-3.5 text-[10px] gap-1.5 tracking-[0.1em] uppercase',
  md:  'h-10 px-4   text-[11px] gap-2   tracking-[0.1em] uppercase',
  lg:  'h-11 px-5   text-[11px] gap-2   tracking-[0.12em] uppercase',
  xl:  'h-12 px-6   text-[12px] gap-2.5 tracking-[0.12em] uppercase',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      icon,
      iconRight,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center font-body font-medium',
          'outline-none focus-visible:outline-1 focus-visible:outline-primary-600',
          'select-none cursor-pointer',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="absolute inset-0 m-auto animate-spin" size={14} />
        )}
        <span className={cn('flex items-center gap-[inherit]', loading && 'invisible')}>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </span>
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
