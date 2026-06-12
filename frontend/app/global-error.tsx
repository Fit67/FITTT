'use client'

/**
 * app/global-error.tsx — Root-level error boundary
 *
 * This is the ONLY file allowed to have <html> and <body> tags in the error
 * file hierarchy. It catches errors in the root layout itself.
 *
 * Previously, app/error.tsx had html/body tags which caused it to output
 * <html> inside an already-existing <html> — breaking the DOM and rendering
 * a blank page. That file is now fixed. This file handles the true root case.
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <AlertTriangle size={36} color="#ef4444" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', maxWidth: 380, lineHeight: 1.6 }}>
            A critical error occurred. Please refresh or return to the home page.
            {error.digest && (
              <span style={{ display: 'block', marginTop: 8, fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.625rem 1.25rem',
                background: '#d97706', color: '#fff',
                border: 'none', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.625rem 1.25rem',
                background: '#fff', color: '#374151',
                border: '2px solid #e5e7eb', borderRadius: 10,
                fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              <Home size={16} /> Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
