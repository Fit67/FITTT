import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  variant?: 'full' | 'mark'
  className?: string
  imageClassName?: string
}

export function BrandLogo({ variant = 'full', className }: BrandLogoProps) {
  const isMark = variant === 'mark'

  if (isMark) {
    return (
      <span className={cn('inline-flex items-center justify-center font-bold tracking-[0.1em]', className)}>
        <span className="text-black dark:text-white">D</span><span className="text-red-600">F</span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className="text-xl md:text-2xl uppercase tracking-[0.2em] font-bold flex items-center whitespace-nowrap">
        <span className="text-black dark:text-white">DOCTOR</span><span className="text-red-600">FIT</span>
      </span>
    </span>
  )
}
