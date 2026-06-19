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

// VITRAPRO pill buttons — rounded-full, red-600 primary, clean uppercase
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ' +
    'shadow-sm hover:shadow-md hover:shadow-red-600/20 ' +
    'transition-all duration-200',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 ' +
    'dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ' +
    'transition-colors duration-200',
  outline:
    'border border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50 ' +
    'dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 ' +
    'transition-colors duration-200',
  ghost:
    'text-gray-600 hover:text-gray-900 hover:bg-gray-100 ' +
    'dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 ' +
    'transition-colors duration-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 ' +
    'transition-colors duration-200',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 ' +
    'transition-colors duration-200',
}

const sizeClasses: Record<Size, string> = {
  xs:  'h-7  px-3   text-[10px] gap-1   tracking-wide uppercase rounded-full',
  sm:  'h-8  px-4   text-xs     gap-1.5 tracking-wide uppercase rounded-full',
  md:  'h-10 px-5   text-sm     gap-2   font-semibold rounded-full',
  lg:  'h-11 px-6   text-sm     gap-2   font-bold     rounded-full',
  xl:  'h-12 px-8   text-sm     gap-2.5 font-bold     rounded-full',
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
