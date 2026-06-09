'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
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
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-gray-950 px-4 py-12">
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <motion.div variants={stagger.item} className="mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
              <span className="font-display font-bold text-white">{storeConfig.name.charAt(0)}</span>
            </div>
            <span className="font-display text-lg font-bold text-gray-900 dark:text-white">{storeConfig.name}</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{t('createAccount')}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('joinUs')}</p>
        </motion.div>

        <motion.form
          variants={stagger.item}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Input
            label={t('fullName')} placeholder="John Doe"
            leading={<User size={16} />}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={t('emailAddress')} type="email" placeholder="you@email.com"
            leading={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('phoneOptional')} type="tel" placeholder="+1 (555) 000-0000"
            leading={<Phone size={16} />}
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label={t('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"
            leading={<Lock size={16} />}
            trailing={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label={t('confirmPassword')} type="password" placeholder="••••••••"
            leading={<Lock size={16} />}
            error={errors.confirm?.message}
            {...register('confirm')}
          />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('termsAndPrivacy')}
          </p>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} iconRight={<ArrowRight size={16} />}>
            {t('createAccount')}
          </Button>
        </motion.form>

        <motion.div variants={stagger.item} className="mt-6">
          <Divider label="or" />
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/auth/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
