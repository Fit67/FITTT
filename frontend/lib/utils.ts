import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { storeConfig } from '@/config/store'

// ─── Class name helper ─────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency formatting ───────────────────────────────────────
const currencyLocaleMap: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  EGP: 'en-US',   // western numerals — shows as "EGP 120.00"
  SAR: 'en-US',
  AED: 'en-US',
}

// Custom symbol overrides (shown instead of ISO code)
const currencySymbolMap: Record<string, string> = {
  EGP: 'ج.م.',
  SAR: 'ر.س.',
  AED: 'د.إ.',
}

export function formatPrice(
  amount: number,
  currency = storeConfig.currency,
): string {
  const customSymbol = currencySymbolMap[currency]
  if (customSymbol) {
    // e.g. "120.00 ج.م."
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
    return `${formatted} ${customSymbol}`
  }
  const locale = currencyLocaleMap[currency] ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calcDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

// ─── Date formatting ───────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(dateStr)
}

// ─── String helpers ────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len).trimEnd() + '…' : str
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Image helpers ─────────────────────────────────────────────
export function getProductImage(images: { url: string; isPrimary?: boolean }[]): string {
  return images.find(i => i.isPrimary)?.url ?? images[0]?.url ?? '/images/placeholder.png'
}

// ─── Array / object helpers ────────────────────────────────────
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key])
      acc[k]  = acc[k] ?? []
      acc[k].push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter(item => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ─── Validation helpers ────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,15}$/.test(phone)
}

// ─── Storage helpers ───────────────────────────────────────────
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

// ─── Delivery helpers ──────────────────────────────────────────
export function getDeliveryLabel(subtotal: number): string {
  const { freeDeliveryThreshold, standardDeliveryFee, estimatedTime } = storeConfig.delivery
  const { min, max, unit } = estimatedTime
  if (subtotal >= freeDeliveryThreshold) {
    return `Free delivery • ${min}–${max} ${unit}`
  }
  return `${formatPrice(standardDeliveryFee)} delivery • ${min}–${max} ${unit}`
}

// ─── Order status helpers ──────────────────────────────────────
export const orderStatusColors: Record<string, string> = {
  pending:           'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  confirmed:         'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  processing:        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  shipped:           'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  out_for_delivery:  'bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-400',
  delivered:         'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  cancelled:         'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  refunded:          'bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400',
}

export function getOrderStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
