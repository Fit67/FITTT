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

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 ' +
    'dark:bg-primary-500 dark:hover:bg-primary-600 focus-visible:ring-primary-400',
  secondary:
    'bg-surface-raised text-gray-900 border border-gray-200 shadow-sm hover:bg-surface-overlay ' +
    'dark:bg-surface-raised dark:text-gray-100 dark:border-gray-700 dark:hover:bg-surface-overlay ' +
    'focus-visible:ring-gray-400',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 ' +
    'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950 ' +
    'focus-visible:ring-primary-400',
  ghost:
    'text-gray-700 hover:bg-gray-100 active:bg-gray-200 ' +
    'dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 ' +
    'focus-visible:ring-gray-400',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 ' +
    'focus-visible:ring-red-400',
  success:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 ' +
    'focus-visible:ring-emerald-400',
}

const sizeClasses: Record<Size, string> = {
  xs:  'h-7  px-2.5 text-xs  gap-1   rounded-[calc(var(--radius-button)-2px)]',
  sm:  'h-8  px-3   text-sm  gap-1.5 rounded-[calc(var(--radius-button)-1px)]',
  md:  'h-10 px-4   text-sm  gap-2   rounded-button',
  lg:  'h-11 px-5   text-base gap-2  rounded-button',
  xl:  'h-13 px-7   text-base gap-2.5 rounded-button',
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
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center font-body font-medium',
          'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'transition-colors duration-150 select-none cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="absolute inset-0 m-auto animate-spin" size={16} />
        )}
        <span className={cn('flex items-center gap-inherit', loading && 'invisible')}>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </span>
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
