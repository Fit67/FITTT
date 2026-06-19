'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User, Dumbbell, Zap, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/slices/authStore'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { storeConfig } from '@/config/store'
import { type TranslationKey, useTranslation } from '@/hooks/useTranslation'
import { useTheme } from 'next-themes'

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
  const { login, register: registerUser, googleLogin } = useAuthStore()
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
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
      const msg = data?.error || data?.message || 'Invalid email or password.'
      toast.error('Sign in failed', msg)
    }
  }

  async function onRegister(data: RegisterForm) {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone })
      toast.success('Account created!', 'Welcome to ' + storeConfig.name)
      router.push('/')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
      const msg = data?.error || data?.message || 'Something went wrong.'
      toast.error('Registration failed', msg)
    }
  }

  async function onGoogleLogin(credential: string) {
    try {
      await googleLogin(credential)
      toast.success('Welcome!', 'Signed in with Google.')
      router.push('/')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
      const msg = data?.error || data?.message || 'Google sign-in failed.'
      toast.error('Sign in failed', msg)
    }
  }

  // Load Google Identity Services script once
  React.useEffect(() => {
    if (document.getElementById('google-gsi-script')) return
    const script = document.createElement('script')
    script.id  = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)
  }, [])

  return (
    <main className="relative min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Back arrow */}
      <Link
        href="/"
        className="absolute left-5 top-5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all bg-white dark:bg-gray-900/80"
        aria-label="Back to home"
      >
        <ArrowLeft size={16} />
      </Link>

      {/* ── Two-col layout ── */}
      <div className="grid min-h-screen w-full lg:grid-cols-2">

        {/* Form side */}
        <motion.section
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.72 }}
          className="relative z-10 flex items-center justify-center px-6 py-20 lg:px-14 bg-white dark:bg-gray-950"
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
                onGoogleLogin={onGoogleLogin}
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

        {/* ── Brand side — DoctorFit dark red ── */}
        <motion.aside
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.72 }}
          className="hidden lg:flex flex-col relative overflow-hidden"
          style={{ gridColumn: isRegister ? 1 : 2, gridRow: 1 }}
        >
          {/* Background: dark red gradient */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #1a0000 0%, #0f0f0f 40%, #1c0505 70%, #0a0a0a 100%)'
          }} />

          {/* Red glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)' }}
          />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          <div className="relative z-10 flex flex-col justify-between h-full px-12 py-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center bg-red-600 rounded-lg">
                <span className="text-white font-display font-bold text-base">D</span>
              </div>
              <span className="font-display text-xl font-bold text-white tracking-wider">
                DoctorFit
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
                <span className="inline-block px-4 py-1.5 text-xs font-medium bg-red-600/20 text-red-400 rounded-full border border-red-600/30 mb-6">
                  {isRegister ? 'Welcome back' : 'Join DoctorFit'}
                </span>
                <h2 className="font-display text-[clamp(32px,3vw,44px)] font-bold text-white leading-[1.1] tracking-tight mb-5">
                  {isRegister ? t('authWelcomeBackTitle') : t('authNewHereTitle')}
                </h2>
                <p className="text-sm font-light text-gray-400 leading-relaxed max-w-[280px] mb-8">
                  {isRegister ? t('authWelcomeBackBody') : t('authNewHereBody')}
                </p>
                <button
                  type="button"
                  onClick={() => setMode(isRegister ? 'login' : 'register')}
                  className="text-sm font-semibold px-6 py-2.5 rounded-full border border-red-600/40 text-red-400 hover:border-red-500 hover:text-red-300 transition-all"
                >
                  {isRegister ? 'Sign In Instead' : 'Create Account'}
                </button>

                {/* Trust badges */}
                <div className="flex flex-col gap-3 mt-10">
                  {[
                    { icon: Shield,   label: '100% Genuine Products' },
                    { icon: Zap,      label: 'Same-Day Cairo Delivery' },
                    { icon: Dumbbell, label: 'Built for Serious Athletes' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex h-7 w-7 items-center justify-center bg-red-600/10 rounded-lg">
                        <Icon size={14} className="text-red-400" />
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom metrics */}
            <div className="flex gap-8 pt-8 border-t border-white/10">
              {[
                { val: '12k+', label: 'Active athletes' },
                { val: '4.9★', label: 'Rating' },
                { val: '24h',  label: 'Delivery' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="font-display text-xl font-bold text-red-400">{val}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">{label}</div>
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
function LoginFormPanel({ t, form, showPw, setShowPw, onSubmit, onSwitch, onGoogleLogin }: {
  t: (key: TranslationKey) => string
  form: ReturnType<typeof useForm<LoginForm>>
  showPw: boolean
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (data: LoginForm) => Promise<void>
  onSwitch: () => void
  onGoogleLogin: (credential: string) => Promise<void>
}) {
  const { resolvedTheme } = useTheme()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const googleBtnRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function initGoogle() {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId || !googleBtnRef.current) return
      const g = (window as unknown as { google?: { accounts?: { id?: { initialize?: (cfg: unknown) => void; renderButton?: (el: HTMLElement, cfg: unknown) => void } } } }).google
      if (!g?.accounts?.id?.initialize || !g?.accounts?.id?.renderButton) return
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setGoogleLoading(true)
          try { await onGoogleLogin(response.credential) }
          finally { setGoogleLoading(false) }
        },
      })
      const parentWidth = googleBtnRef.current?.offsetWidth || 380
      const btnWidth = Math.min(400, Math.max(250, parentWidth))
      g.accounts.id.renderButton(googleBtnRef.current!, {
        theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        width: btnWidth,
        shape: 'pill',
        text: 'signin_with',
      })
    }
    if ((window as unknown as { google?: unknown }).google) {
      initGoogle()
    } else {
      const script = document.getElementById('google-gsi-script')
      script?.addEventListener('load', initGoogle)
      return () => script?.removeEventListener('load', initGoogle)
    }
  }, [onGoogleLogin, resolvedTheme])

  return (
    <motion.div {...fadeUp} className="w-full max-w-[380px]">
      <MobileLogo />

      {/* Header */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
          Account
        </span>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('welcomeBack')}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('signInToAccount')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('emailAddress')} type="email" placeholder="you@email.com" autoComplete="email"
          leading={<Mail size={14} />} error={errors.email?.message} {...register('email')} />
        <Input label={t('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
          leading={<Lock size={14} />}
          trailing={
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <input type="checkbox" className="h-4 w-4 rounded accent-red-600" {...register('rememberMe')} />
            {t('rememberMe')}
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
          {t('signIn')}
        </Button>
      </form>

      {/* Google Sign-In (moved outside form to prevent submit triggers) */}
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <div className="space-y-4 mt-6">
          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex justify-center w-full">
            <div ref={googleBtnRef} style={{ colorScheme: 'light' }} className={`w-full ${googleLoading ? 'pointer-events-none opacity-60' : ''}`} />
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 lg:hidden mt-6">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitch} className="font-medium text-red-600 dark:text-red-400 hover:underline">
          Sign up
        </button>
      </p>
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
    <motion.div {...fadeUp} className="w-full max-w-[380px]">
      <MobileLogo />

      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
          New account
        </span>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('createAccount')}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('joinUs')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('fullName')} placeholder="" leading={<User size={14} />} error={errors.name?.message} {...register('name')} />
        <Input label={t('emailAddress')} type="email" placeholder="" leading={<Mail size={14} />} error={errors.email?.message} {...register('email')} />
        <Input label={t('phoneOptional')} type="tel" placeholder="" leading={<Phone size={14} />} error={errors.phone?.message} {...register('phone')} />
        <Input label={t('password')} type={showPw ? 'text' : 'password'} placeholder=""
          leading={<Lock size={14} />}
          trailing={
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input label={t('confirmPassword')} type="password" placeholder="" leading={<Lock size={14} />} error={errors.confirm?.message} {...register('confirm')} />

        <p className="text-xs text-gray-400 dark:text-gray-500 pb-1">{t('termsAndPrivacy')}</p>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          {t('createAccount')}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 lg:hidden">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} className="font-medium text-red-600 dark:text-red-400 hover:underline">
            Sign in
          </button>
        </p>
      </form>
    </motion.div>
  )
}

function MobileLogo() {
  return (
    <div className="mb-10 flex justify-center lg:hidden">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 flex items-center justify-center bg-red-600 rounded-lg">
          <span className="font-display text-lg font-bold text-white">D</span>
        </div>
        <span className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-wider">
          DoctorFit
        </span>
      </div>
    </div>
  )
}
