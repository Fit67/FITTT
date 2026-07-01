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

const containerStyles: Record<ToastOptions['type'], string> = {
  success: 'bg-gray-900 border-gray-800 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] dark:bg-black dark:border-gray-800',
  error:   'bg-red-600 border-red-500 shadow-lg',
  warning: 'bg-amber-400 border-amber-300 shadow-lg',
  info:    'bg-gray-900 border-gray-800 shadow-lg dark:bg-black dark:border-gray-800',
}

const iconColors: Record<ToastOptions['type'], string> = {
  success: 'text-red-500',
  error:   'text-white',
  warning: 'text-amber-950',
  info:    'text-white',
}

const titleColors: Record<ToastOptions['type'], string> = {
  success: 'text-white',
  error:   'text-white',
  warning: 'text-amber-950',
  info:    'text-white',
}

const msgColors: Record<ToastOptions['type'], string> = {
  success: 'text-gray-400',
  error:   'text-red-100',
  warning: 'text-amber-900',
  info:    'text-gray-400',
}

const actionColors: Record<ToastOptions['type'], string> = {
  success: 'text-red-400 hover:text-red-300',
  error:   'text-white hover:underline',
  warning: 'text-amber-900 hover:underline',
  info:    'text-white hover:underline',
}

const closeColors: Record<ToastOptions['type'], string> = {
  success: 'text-gray-500 hover:text-white',
  error:   'text-red-200 hover:text-white',
  warning: 'text-amber-700 hover:text-amber-950',
  info:    'text-gray-500 hover:text-white',
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
        'rounded-2xl border p-4 pl-5 backdrop-blur-md',
        containerStyles[toast.type],
      )}
    >
      <Icon size={22} strokeWidth={2} className={cn('shrink-0 mt-0.5', iconColors[toast.type])} />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className={cn("font-body text-[15px] font-semibold tracking-tight", titleColors[toast.type])}>
          {toast.title}
        </p>
        {toast.message && (
          <p className={cn("mt-0.5 text-[14px] leading-relaxed", msgColors[toast.type])}>
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn("mt-2 text-sm font-medium text-left w-fit transition-colors", actionColors[toast.type])}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => remove(toast.id!)}
        className={cn("shrink-0 p-1 transition-colors mt-0.5 rounded-full", closeColors[toast.type])}
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
