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
  success: 'bg-white border-neutral-200 dark:bg-[#111] dark:border-neutral-800 hover:border-[#B91C1C] dark:hover:border-[#B91C1C]',
  error:   'bg-white border-neutral-200 dark:bg-[#111] dark:border-neutral-800 hover:border-[#B91C1C] dark:hover:border-[#B91C1C]',
  warning: 'bg-white border-neutral-200 dark:bg-[#111] dark:border-neutral-800 hover:border-[#B91C1C] dark:hover:border-[#B91C1C]',
  info:    'bg-white border-neutral-200 dark:bg-[#111] dark:border-neutral-800 hover:border-[#B91C1C] dark:hover:border-[#B91C1C]',
}

const iconColors: Record<ToastOptions['type'], string> = {
  success: 'text-[#B91C1C]',
  error:   'text-[#B91C1C]',
  warning: 'text-[#B91C1C]',
  info:    'text-[#B91C1C]',
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
        'group relative flex w-[360px] items-start gap-4 overflow-hidden',
        'border rounded-[20px] p-4 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer',
        containerStyles[toast.type],
      )}
    >
      <Icon size={24} strokeWidth={2.5} className={cn('shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110', iconColors[toast.type])} />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-sans font-black text-black dark:text-white uppercase leading-snug tracking-wide group-hover:text-[#B91C1C] transition-colors">
          {toast.title}
        </h3>
        {toast.message && (
          <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-3 bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white transition-colors duration-200 w-fit"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); remove(toast.id!); }}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-gray-400 hover:text-[#B91C1C] hover:border-[#B91C1C] transition-all duration-200"
      >
        <X size={14} strokeWidth={2.5} />
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
