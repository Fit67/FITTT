'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/slices/authStore'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/primitives'
import { storeConfig } from '@/config/store'
import { useTranslation } from '@/hooks/useTranslation'

const loginSchema = z.object({
  email:      z.string().email('Please enter a valid email'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
}

export default function LoginPage() {
  const { t } = useTranslation()
  const router         = useRouter()
  const { login }      = useAuthStore()
  const toast          = useToast()
  const [showPw, setShowPw] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    try {
      await login(data)
      toast.success('Welcome back!', 'You have been signed in.')
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Invalid email or password.'
      toast.error('Sign in failed', msg)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel (decorative) ────────────────────────── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-primary-600">
        <div className="absolute inset-0 bg-noise opacity-[0.04]" />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-500/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary-800/60 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <span className="font-display font-bold text-white text-lg">
                {storeConfig.name.charAt(0)}
              </span>
            </div>
            <span className="font-display text-xl font-bold text-white">
              {storeConfig.name}
            </span>
          </Link>

          <div>
            <blockquote className="font-display text-3xl font-semibold text-white leading-tight max-w-sm">
              "{t('authSlogan')}"
            </blockquote>
            <p className="mt-4 text-primary-200 text-sm max-w-xs">
              {t('authSubSlogan')} {storeConfig.name}.
            </p>

          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ─────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-surface dark:bg-gray-950">
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div variants={stagger.item} className="mb-8 flex items-center gap-3 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <span className="font-display font-bold text-white">{storeConfig.name.charAt(0)}</span>
              </div>
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white">{storeConfig.name}</span>
            </Link>
          </motion.div>

          <motion.div variants={stagger.item}>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{t('welcomeBack')}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('signInToAccount')}</p>
          </motion.div>

          <motion.form
            variants={stagger.item}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
          >
            <Input
              label={t('emailAddress')}
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              leading={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('password')}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              leading={<Lock size={16} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="h-4 w-4 rounded accent-primary-600" {...register('rememberMe')} />
                {t('rememberMe')}
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              iconRight={<ArrowRight size={16} />}
            >
              {t('signIn')}
            </Button>
          </motion.form>

          <motion.div variants={stagger.item} className="mt-6">
            <Divider label="or" />
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('dontHaveAccount')}{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('signUpFree')}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
