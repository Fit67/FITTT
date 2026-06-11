'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { useAuthStore } from '@/store/slices/authStore'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { storeConfig } from '@/config/store'
import { type TranslationKey, useTranslation } from '@/hooks/useTranslation'

type AuthMode = 'login' | 'register'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const panelTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 32,
  mass: 0.72,
} as const

const contentTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 34,
  mass: 0.65,
} as const

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: contentTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.1 } },
}

export function AuthSwitcher({ initialMode }: { initialMode: AuthMode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const toast = useToast()
  const { login, register: registerUser } = useAuthStore()
  const [mode, setMode] = React.useState<AuthMode>(initialMode)
  const [showLoginPw, setShowLoginPw] = React.useState(false)
  const [showRegisterPw, setShowRegisterPw] = React.useState(false)

  const isRegister = mode === 'register'
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) return
    setMode(nextMode)
  }

  async function onLogin(data: LoginForm) {
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

  async function onRegister(data: RegisterForm) {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone })
      toast.success('Account created!', 'Welcome to ' + storeConfig.name)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Something went wrong. Please try again.'
      toast.error('Registration failed', msg)
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-[#0B0F19] dark:text-white lg:p-6">
      <Link
        href="/"
        className="absolute left-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 backdrop-blur-md transition-colors hover:bg-gray-200 hover:text-gray-900 dark:bg-white/8 dark:text-white/75 dark:hover:bg-white/14 dark:hover:text-white"
        aria-label="Back to home"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="relative grid min-h-screen w-full overflow-hidden bg-white dark:bg-[#0B0F19] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2 lg:rounded-[28px] lg:shadow-[0_28px_90px_rgba(0,0,0,.45)]">
        <motion.section
          layout
          transition={panelTransition}
          className="relative z-10 flex items-center justify-center px-6 py-20 lg:px-12"
          style={{ gridColumn: isRegister ? 2 : 1, gridRow: 1 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'login' ? (
              <LoginFormPanel
                key="login-form"
                t={t}
                form={loginForm}
                showPw={showLoginPw}
                setShowPw={setShowLoginPw}
                onSubmit={onLogin}
                onSwitch={() => switchMode('register')}
              />
            ) : (
              <RegisterFormPanel
                key="register-form"
                t={t}
                form={registerForm}
                showPw={showRegisterPw}
                setShowPw={setShowRegisterPw}
                onSubmit={onRegister}
                onSwitch={() => switchMode('login')}
              />
            )}
          </AnimatePresence>
        </motion.section>

        <motion.aside
          layout
          transition={panelTransition}
          className="hidden overflow-hidden bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#0B0F19] lg:flex"
          style={{ gridColumn: isRegister ? 1 : 2, gridRow: 1 }}
        >
          <div className="relative flex h-full w-full items-center justify-center px-12 text-center">
            <motion.div
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-45 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.28),transparent_48%)] bg-[length:220%_220%]"
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 18, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-36 top-10 h-[440px] w-[440px] rounded-full bg-white/12 blur-[90px]"
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: isRegister ? -28 : 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? 28 : -28 }}
                transition={contentTransition}
                className="relative z-10 max-w-lg"
              >
                <h2 className="font-display text-5xl font-bold tracking-tight">
                  {isRegister ? t('authWelcomeBackTitle') : t('authNewHereTitle')}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-white/82">
                  {isRegister ? t('authWelcomeBackBody') : t('authNewHereBody')}
                </p>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className="mt-10 h-12 px-10 bg-white/10 text-base font-semibold text-white border-2 border-white/40 backdrop-blur-md hover:bg-white hover:text-primary-600"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}

function LoginFormPanel({
  t,
  form,
  showPw,
  setShowPw,
  onSubmit,
  onSwitch,
}: {
  t: (key: TranslationKey) => string
  form: ReturnType<typeof useForm<LoginForm>>
  showPw: boolean
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (data: LoginForm) => Promise<void>
  onSwitch: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  return (
    <motion.div {...fadeUp} className="w-full max-w-[390px] text-gray-900 dark:text-white">
      <MobileLogo />
      <div className="mb-10 text-center lg:text-left">
        <h1 className="font-display text-4xl font-bold tracking-tight">{t('welcomeBack')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('signInToAccount')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <Input
            label={t('emailAddress')}
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            leading={<Mail size={18} />}
            error={errors.email?.message}
            className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
            {...register('email')}
          />
          <Input
            label={t('password')}
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            leading={<Lock size={18} />}
            trailing={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            error={errors.password?.message}
            className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 bg-transparent accent-primary-600 dark:border-gray-700" {...register('rememberMe')} />
            {t('rememberMe')}
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2 h-12 text-base font-semibold shadow-[0_0_20px_rgba(var(--color-primary-500),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-500),0.5)]">
          {t('signIn')}
        </Button>

        <button type="button" onClick={onSwitch} className="w-full text-center text-sm font-medium text-primary-600 transition-colors hover:text-primary-500 lg:hidden">
          {t('authNewHereMobile')}
        </button>
      </form>
    </motion.div>
  )
}

function RegisterFormPanel({
  t,
  form,
  showPw,
  setShowPw,
  onSubmit,
  onSwitch,
}: {
  t: (key: TranslationKey) => string
  form: ReturnType<typeof useForm<RegisterForm>>
  showPw: boolean
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (data: RegisterForm) => Promise<void>
  onSwitch: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  return (
    <motion.div {...fadeUp} className="w-full max-w-[390px] text-gray-900 dark:text-white">
      <MobileLogo />
      <div className="mb-8 text-center lg:text-left">
        <h1 className="font-display text-4xl font-bold tracking-tight">{t('createAccount')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('joinUs')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label={t('fullName')} placeholder="" leading={<User size={18} />} error={errors.name?.message} className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]" {...register('name')} />
        <Input label={t('emailAddress')} type="email" placeholder="" leading={<Mail size={18} />} error={errors.email?.message} className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]" {...register('email')} />
        <Input label={t('phoneOptional')} type="tel" placeholder="" leading={<Phone size={18} />} error={errors.phone?.message} className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]" {...register('phone')} />
        <Input
          label={t('password')}
          type={showPw ? 'text' : 'password'}
          placeholder=""
          leading={<Lock size={18} />}
          trailing={
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          error={errors.password?.message}
          className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
          {...register('password')}
        />
        <Input label={t('confirmPassword')} type="password" placeholder="" leading={<Lock size={18} />} error={errors.confirm?.message} className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]" {...register('confirm')} />

        <p className="pb-2 pt-1 text-xs text-gray-500 dark:text-gray-400">{t('termsAndPrivacy')}</p>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2 h-12 text-base font-semibold shadow-[0_0_20px_rgba(var(--color-primary-500),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-500),0.5)]">
          {t('createAccount')}
        </Button>

        <button type="button" onClick={onSwitch} className="w-full text-center text-sm font-medium text-primary-600 transition-colors hover:text-primary-500 lg:hidden">
          {t('authAlreadyMemberMobile')}
        </button>
      </form>
    </motion.div>
  )
}

function MobileLogo() {
  return (
    <div className="mb-10 flex justify-center lg:hidden">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
        <span className="font-display text-xl font-bold text-white">{storeConfig.name.charAt(0)}</span>
      </div>
    </div>
  )
}
