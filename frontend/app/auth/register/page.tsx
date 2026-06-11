'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/slices/authStore'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Divider } from '@/components/ui/primitives'
import { storeConfig } from '@/config/store'
import { useTranslation } from '@/hooks/useTranslation'

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Please enter a valid email'),
  phone:    z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path:    ['confirm'],
})

type RegisterForm = z.infer<typeof registerSchema>

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  },
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const router        = useRouter()
  const { register: registerUser } = useAuthStore()
  const toast         = useToast()
  const [showPw, setShowPw] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterForm) {
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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Left Panel (Decorative Split) ────────────────────────── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-light dark:from-primary-900 dark:via-primary-800 dark:to-gray-900 items-center justify-center">
        {/* Animated Particles/Orbs */}
        <motion.div 
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] bg-[length:200%_200%]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-white/10 blur-[100px]" 
        />

        <div className="relative z-10 text-center text-white px-12 max-w-lg">
           <h2 className="text-5xl font-bold font-display mb-6 tracking-tight">Welcome Back!</h2>
           <p className="text-lg text-primary-50 dark:text-primary-100 mb-10 leading-relaxed">
             Already have an account? Sign in to access your dashboard and continue your premium shopping experience.
           </p>
           <Link href="/auth/login">
             <Button size="lg" className="h-12 px-10 text-base font-semibold bg-white/10 text-white border-2 border-white/40 hover:bg-white hover:text-primary-600 backdrop-blur-md">
               Sign In
             </Button>
           </Link>
        </div>
      </div>

      {/* ── Right Panel (Form) ─────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-[#0B0F19] relative">
        {/* Back Button */}
        <Link href="/" className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors z-20" aria-label="Back to home">
          <ArrowLeft size={20} />
        </Link>

        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="w-full max-w-[380px] relative z-10"
        >
          {/* Mobile Logo */}
          <motion.div variants={stagger.item} className="mb-10 flex justify-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
              <span className="font-display font-bold text-white text-xl">{storeConfig.name.charAt(0)}</span>
            </div>
          </motion.div>

          <motion.div variants={stagger.item} className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{t('createAccount')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('joinUs')}</p>
          </motion.div>

          <motion.form
            variants={stagger.item}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <Input
              label={t('fullName')} placeholder=""
              leading={<User size={18} />}
              error={errors.name?.message}
              className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
              {...register('name')}
            />
            <Input
              label={t('emailAddress')} type="email" placeholder="you@email.com"
              leading={<Mail size={18} />}
              error={errors.email?.message}
              className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
              {...register('email')}
            />
            <Input
              label={t('phoneOptional')} type="tel" placeholder="+1 (555) 000-0000"
              leading={<Phone size={18} />}
              error={errors.phone?.message}
              className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
              {...register('phone')}
            />
            <Input
              label={t('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"
              leading={<Lock size={18} />}
              trailing={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              error={errors.password?.message}
              className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
              {...register('password')}
            />
            <Input
              label={t('confirmPassword')} type="password" placeholder="••••••••"
              leading={<Lock size={18} />}
              error={errors.confirm?.message}
              className="bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-[#1A2235]"
              {...register('confirm')}
            />

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pb-2">
              {t('termsAndPrivacy')}
            </p>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2 h-12 text-base font-semibold shadow-[0_0_20px_rgba(var(--color-primary-500),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-500),0.5)]">
              {t('createAccount')}
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
