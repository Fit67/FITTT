'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/slices/uiStore'
import type { ToastOptions } from '@/types'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle2,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}

const colors: Record<ToastOptions['type'], string> = {
  success: 'border-l-emerald-500 bg-emerald-50  dark:bg-emerald-950/60',
  error:   'border-l-red-500    bg-red-50      dark:bg-red-950/60',
  warning: 'border-l-amber-500  bg-amber-50    dark:bg-amber-950/60',
  info:    'border-l-blue-500   bg-blue-50     dark:bg-blue-950/60',
}

const iconColors: Record<ToastOptions['type'], string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

function Toast({ toast }: { toast: ToastOptions }) {
  const { remove } = useToastStore()
  const Icon = icons[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative flex w-[360px] items-start gap-3 overflow-hidden',
        'rounded-card border border-gray-100 border-l-4 p-4',
        'shadow-modal backdrop-blur-sm',
        'dark:border-gray-800',
        colors[toast.type],
      )}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', iconColors[toast.type])} />

      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-gray-900 dark:text-gray-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => remove(toast.id!)}
        className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Convenience hook ──────────────────────────────────────────
export function useToast() {
  const { push } = useToastStore()

  return {
    success: (title: string, message?: string) =>
      push({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      push({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      push({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      push({ type: 'info', title, message }),
    custom: (opts: Omit<ToastOptions, 'id'>) => push(opts),
  }
}
