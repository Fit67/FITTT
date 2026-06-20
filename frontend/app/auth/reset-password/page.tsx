'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { storeConfig } from '@/config/store'
import { authService } from '@/services'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const toast = useToast()

  const [mounted, setMounted] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [showPw, setShowPw] = React.useState(false)
  const [showConfirmPw, setShowConfirmPw] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!token) {
      toast.error('Invalid link', 'No reset token found in URL.')
      return
    }
    try {
      await authService.resetPassword(token, data.password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3500)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
      const msg = data?.error || data?.message || 'Failed to reset password.'
      toast.error('Reset failed', msg)
    }
  }

  // Hydration guard
  if (!mounted) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.0, 0.0, 0.2, 1.0] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center bg-primary-600 rounded-lg">
            <span className="font-display font-bold text-white">
              {storeConfig.name.charAt(0)}
            </span>
          </div>
          <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
            {storeConfig.name}
          </span>
        </Link>

        {!success ? (
          <>
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
                Reset Password
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Please enter your new password below.
              </p>
            </div>

            {!token ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm mb-6 border border-red-100 dark:border-red-900/30">
                ⚠️ Invalid reset link. The reset token is missing from the URL. Please request a new link.
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="New Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                leading={<Lock size={16} />}
                trailing={
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="••••••••"
                leading={<Lock size={16} />}
                trailing={
                  <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.confirm?.message}
                {...register('confirm')}
              />

              <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!token}>
                Reset Password
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
              Password Reset
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Your password has been reset successfully. Redirecting you to login...
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
