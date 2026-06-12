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
  email:      z.string().email('Please enter a valid email'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email'),
  phone:    z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
})

type LoginForm    = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

const fadeUp = {
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.0, 0.0, 0.2, 1.0] } },
  exit:    { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.1 } },
}

export function AuthSwitcher({ initialMode }: { initialMode: AuthMode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const toast = useToast()
  const { login, register: registerUser } = useAuthStore()
  const [mode, setMode] = React.useState<AuthMode>(initialMode)
  const [showLoginPw, setShowLoginPw]       = React.useState(false)
  const [showRegisterPw, setShowRegisterPw] = React.useState(false)

  const isRegister = mode === 'register'
  const loginForm    = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onLogin(data: LoginForm) {
    try {
      await login(data)
      toast.success('Welcome back!', 'You have been signed in.')
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password.'
      toast.error('Sign in failed', msg)
    }
  }

  async function onRegister(data: RegisterForm) {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone })
      toast.success('Account created!', 'Welcome to ' + storeConfig.name)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong.'
      toast.error('Registration failed', msg)
    }
  }

  return (
    <main className="relative flex min-h-screen bg-white dark:bg-[#0a0a0a]">

      {/* Back arrow */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-30 flex h-8 w-8 items-center justify-center border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] hover:border-gray-400 dark:hover:border-[#555] transition-all"
        aria-label="Back to home"
      >
        <ArrowLeft size={16} />
      </Link>

      {/* ── Grid ── */}
      <div className="grid min-h-screen w-full lg:grid-cols-2">

        {/* Form side */}
        <motion.section
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.72 }}
          className="relative z-10 flex items-center justify-center px-6 py-20 lg:px-14"
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
                onSwitch={() => setMode('register')}
              />
            ) : (
              <RegisterFormPanel
                key="register-form"
                t={t}
                form={registerForm}
                showPw={showRegisterPw}
                setShowPw={setShowRegisterPw}
                onSubmit={onRegister}
                onSwitch={() => setMode('login')}
              />
            )}
          </AnimatePresence>
        </motion.section>

        {/* Brand side — adapts to light and dark mode */}
        <motion.aside
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.72 }}
          className="hidden lg:flex flex-col relative overflow-hidden border-l border-gray-100 dark:border-[#1e1e1e]
                     bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900
                     dark:bg-none dark:from-transparent dark:via-transparent dark:to-transparent"
          style={{
            gridColumn: isRegister ? 1 : 2,
            gridRow: 1,
          }}
        >
          {/* Dark mode: dark gradient overlay */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)' }}
          />

          {/* Light mode: subtle pattern overlay */}
          <div className="absolute inset-0 dark:hidden pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Dark mode: subtle grid */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Light mode: white glow blob */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none dark:hidden"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)' }}
          />

          {/* Dark mode: gold glow blob */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none hidden dark:block"
            style={{ background: 'radial-gradient(circle, #c8822a 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col justify-between h-full px-12 py-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex items-center justify-center bg-white/20 dark:bg-[#c8822a]">
                <span className="text-white font-display font-semibold text-sm">{storeConfig.name.charAt(0)}</span>
              </div>
              <span className="font-display text-[18px] text-white dark:text-[#e8e0d4]">
                Doctor<em className="italic text-white/80 dark:text-[#c8822a]">Fit</em>
              </span>
            </div>

            {/* Centre copy */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: isRegister ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? 24 : -24 }}
                transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-white/30 dark:bg-[#2a2a2a]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/60 dark:text-[#555]">
                    {isRegister ? 'Welcome back' : 'New here'}
                  </span>
                </div>
                <h2 className="font-display text-[clamp(32px,3vw,44px)] font-normal text-white dark:text-[#e8e0d4] leading-[1.1] tracking-[-0.02em] mb-5">
                  {isRegister ? t('authWelcomeBackTitle') : t('authNewHereTitle')}
                </h2>
                <p className="text-[13px] font-light text-white/70 dark:text-[#666] leading-[1.9] max-w-[280px] mb-8">
                  {isRegister ? t('authWelcomeBackBody') : t('authNewHereBody')}
                </p>
                <button
                  type="button"
                  onClick={() => setMode(isRegister ? 'login' : 'register')}
                  className="text-[11px] font-medium uppercase tracking-[0.12em]
                             border border-white/40 text-white/80 px-6 py-3
                             hover:border-white hover:text-white
                             dark:border-[#3a3a3a] dark:text-[#888]
                             dark:hover:border-[#c8822a] dark:hover:text-[#c8822a]
                             transition-all"
                >
                  {isRegister ? 'Sign In' : 'Create Account'}
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Bottom metrics */}
            <div className="flex gap-8 pt-8 border-t border-white/20 dark:border-[#1e1e1e]">
              {[
                { val: '12k+', label: 'Active athletes' },
                { val: '4.9★', label: 'Rating' },
                { val: '24h',  label: 'Delivery' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="font-display text-[20px] italic text-white dark:text-[#c8822a]">{val}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-white/50 dark:text-[#444] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  )
}

// ─── Login form ────────────────────────────────────────────────
function LoginFormPanel({ t, form, showPw, setShowPw, onSubmit, onSwitch }: {
  t: (key: TranslationKey) => string
  form: ReturnType<typeof useForm<LoginForm>>
  showPw: boolean
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (data: LoginForm) => Promise<void>
  onSwitch: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  return (
    <motion.div {...fadeUp} className="w-full max-w-[360px]">
      <MobileLogo />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gray-200 dark:bg-[#2a2a2a]" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-[#555]">Account</span>
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] text-gray-900 dark:text-[#e8e0d4] leading-[1.1]">
          {t('welcomeBack')}
        </h1>
        <p className="mt-2 text-[12px] font-light text-gray-400 dark:text-[#555]">{t('signInToAccount')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label={t('emailAddress')} type="email" placeholder="you@email.com" autoComplete="email"
          leading={<Mail size={14} />} error={errors.email?.message} {...register('email')} />
        <Input label={t('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
          leading={<Lock size={14} />}
          trailing={
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-300 dark:text-[#444] hover:text-gray-600 dark:hover:text-[#888] transition-colors">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] font-light text-gray-500 dark:text-[#666]">
            <input type="checkbox" className="h-3.5 w-3.5 border-gray-300 dark:border-[#3a3a3a] accent-primary-600 dark:accent-[#c8822a]" {...register('rememberMe')} />
            {t('rememberMe')}
          </label>
          <Link href="/auth/forgot-password" className="text-[11px] font-light text-primary-600 dark:text-[#c8822a] hover:opacity-70 transition-opacity">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
          {t('signIn')}
        </Button>

        <button type="button" onClick={onSwitch} className="w-full text-center text-[11px] font-light text-primary-600 dark:text-[#c8822a] hover:opacity-70 transition-opacity lg:hidden">
          {t('authNewHereMobile')}
        </button>
      </form>
    </motion.div>
  )
}

// ─── Register form ─────────────────────────────────────────────
function RegisterFormPanel({ t, form, showPw, setShowPw, onSubmit, onSwitch }: {
  t: (key: TranslationKey) => string
  form: ReturnType<typeof useForm<RegisterForm>>
  showPw: boolean
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (data: RegisterForm) => Promise<void>
  onSwitch: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  return (
    <motion.div {...fadeUp} className="w-full max-w-[360px]">
      <MobileLogo />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-6 bg-gray-200 dark:bg-[#2a2a2a]" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-[#555]">New account</span>
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] text-gray-900 dark:text-[#e8e0d4] leading-[1.1]">
          {t('createAccount')}
        </h1>
        <p className="mt-2 text-[12px] font-light text-gray-400 dark:text-[#555]">{t('joinUs')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('fullName')} placeholder="" leading={<User size={14} />} error={errors.name?.message} {...register('name')} />
        <Input label={t('emailAddress')} type="email" placeholder="" leading={<Mail size={14} />} error={errors.email?.message} {...register('email')} />
        <Input label={t('phoneOptional')} type="tel" placeholder="" leading={<Phone size={14} />} error={errors.phone?.message} {...register('phone')} />
        <Input label={t('password')} type={showPw ? 'text' : 'password'} placeholder=""
          leading={<Lock size={14} />}
          trailing={
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-300 dark:text-[#444] hover:text-gray-600 dark:hover:text-[#888] transition-colors">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input label={t('confirmPassword')} type="password" placeholder="" leading={<Lock size={14} />} error={errors.confirm?.message} {...register('confirm')} />

        <p className="text-[11px] font-light text-gray-400 dark:text-[#555] pb-1">{t('termsAndPrivacy')}</p>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          {t('createAccount')}
        </Button>

        <button type="button" onClick={onSwitch} className="w-full text-center text-[11px] font-light text-primary-600 dark:text-[#c8822a] hover:opacity-70 transition-opacity lg:hidden">
          {t('authAlreadyMemberMobile')}
        </button>
      </form>
    </motion.div>
  )
}

function MobileLogo() {
  return (
    <div className="mb-10 flex justify-center lg:hidden">
      <div className="flex h-10 w-10 items-center justify-center bg-primary-600 dark:bg-[#c8822a]">
        <span className="font-display text-lg font-semibold text-white">{storeConfig.name.charAt(0)}</span>
      </div>
    </div>
  )
}
