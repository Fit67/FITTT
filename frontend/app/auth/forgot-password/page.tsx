'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services'
import { useToast } from '@/components/ui/Toast'
import { storeConfig } from '@/config/store'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const toast = useToast()
  const [sent, setSent] = React.useState(false)
  const [sentTo, setSentTo] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await authService.forgotPassword(data.email)
      setSentTo(data.email)
      setSent(true)
    } catch {
      toast.error('Something went wrong', 'Please try again in a moment.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-gray-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <span className="font-display font-bold text-white">
              {storeConfig.name.charAt(0)}
            </span>
          </div>
          <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
            {storeConfig.name}
          </span>
        </Link>

        {!sent ? (
          <>
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
                Forgot your password?
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                No worries. Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                leading={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              We've sent a password reset link to{' '}
              <strong className="text-gray-900 dark:text-gray-100">{sentTo}</strong>.
              The link expires in 1 hour.
            </p>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              Didn't receive it?{' '}
              <button
                onClick={() => setSent(false)}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Try again
              </button>
            </p>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
