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
  success: 'bg-emerald-50  dark:bg-emerald-950/60',
  error:   'bg-red-50      dark:bg-red-950/60',
  warning: 'bg-amber-50    dark:bg-amber-950/60',
  info:    'bg-blue-50     dark:bg-blue-950/60',
}

const indicatorColors: Record<ToastOptions['type'], string> = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
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
        'relative flex w-[360px] items-start gap-3.5 overflow-hidden',
        'rounded-2xl p-4 pl-5',
        'shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm',
        colors[toast.type],
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-[4px]', indicatorColors[toast.type])} />

      <Icon size={20} strokeWidth={1.5} className={cn('shrink-0 mt-0.5', iconColors[toast.type])} />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="font-body text-[15px] font-medium text-gray-900 dark:text-gray-100 tracking-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline text-left w-fit"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => remove(toast.id!)}
        className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-0.5"
      >
        <X size={16} strokeWidth={2} />
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
