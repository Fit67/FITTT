'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen:       boolean
  onClose:      () => void
  title?:       string
  description?: string
  size?:        ModalSize
  children:     React.ReactNode
  footer?:      React.ReactNode
  hideClose?:   boolean
  className?:   string
}

const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[96vw]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size     = 'md',
  children,
  footer,
  hideClose = false,
  className,
}: ModalProps) {
  // Lock body scroll while open
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else         document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 10  }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative z-10 w-full flex flex-col',
              'rounded-card bg-surface shadow-modal',
              'dark:bg-surface-raised dark:border dark:border-gray-800',
              'max-h-[90vh]',
              sizeMap[size],
              className,
            )}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                <div>
                  {title && (
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

// ─── Drawer variant ────────────────────────────────────────────
interface DrawerProps extends Omit<ModalProps, 'size'> {
  side?: 'left' | 'right'
}

export function Drawer({ isOpen, onClose, title, children, footer, side = 'right', hideClose, className }: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else         document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={cn(
              'relative z-10 flex flex-col h-full w-full max-w-sm',
              'bg-surface shadow-modal dark:bg-surface-raised',
              side === 'right' ? 'ml-auto' : 'mr-auto',
              className,
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                {title && <h2 className="font-display text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
                {!hideClose && (
                  <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
