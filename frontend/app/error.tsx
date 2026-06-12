'use client'

/**
 * app/error.tsx — Segment-level error boundary
 *
 * IMPORTANT: This file must NOT contain <html> or <body> tags.
 * Those belong only in app/global-error.tsx.
 * Having them here caused a blank white page whenever any
 * unhandled error was thrown (malformed HTML: <html> inside <html>).
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ErrorPageProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary]', error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
        className="max-w-md"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle size={36} className="text-red-500" />
        </div>

        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">
          An unexpected error occurred. Please try again.
          {error.digest && (
            <span className="block mt-2 font-mono text-xs text-gray-400 dark:text-gray-500">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} icon={<RefreshCw size={16} />}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" icon={<Home size={16} />} fullWidth>
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
