import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  variant?: 'full' | 'mark'
  className?: string
  imageClassName?: string
}

export function BrandLogo({ variant = 'full', className, imageClassName }: BrandLogoProps) {
  const isMark = variant === 'mark'

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src={isMark ? '/images/doctorfit-mark.png' : storeConfig.logo}
        alt={`${storeConfig.name} logo`}
        className={cn(
          isMark ? 'h-9 w-9 object-contain' : 'h-10 w-auto object-contain',
          imageClassName,
        )}
      />
    </span>
  )
}
