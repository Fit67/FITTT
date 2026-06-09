'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Tag, Pencil, Trash2, Copy, CheckCircle2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { couponService } from '@/services'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, Skeleton } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { Coupon } from '@/types'

const couponSchema = z.object({
  code:           z.string().min(3).max(20).toUpperCase(),
  type:           z.enum(['percentage', 'fixed', 'free_shipping']),
  value:          z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUses:        z.coerce.number().min(1).optional(),
  expiresAt:      z.string().optional(),
  isActive:       z.boolean().default(true),
})
type CouponForm = z.infer<typeof couponSchema>

export default function AdminCouponsPage() {
  const [modal, setModal] = React.useState<{ open: boolean; coupon?: Coupon }>({ open: false })
  const [copied, setCopied] = React.useState<string | null>(null)
  const toast = useToast()
  const qc    = useQueryClient()

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn:  couponService.getAll,
  })

  async function handleDelete(id: string, code: string) {
    try {
      await couponService.delete(id)
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted', code)
    } catch {
      toast.error('Delete failed')
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const discountLabel = (c: Coupon) => {
    if (c.type === 'percentage')    return `${c.value}% off`
    if (c.type === 'fixed')         return `${formatPrice(c.value)} off`
    if (c.type === 'free_shipping') return 'Free shipping'
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Manage discount codes
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal({ open: true })}>
          Create Coupon
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-card" />
          ))}
        </div>
      ) : coupons?.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center rounded-card border border-dashed border-gray-200 dark:border-gray-700">
          <Tag size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No coupons yet</p>
          <Button size="sm" className="mt-4" onClick={() => setModal({ open: true })}>
            Create your first coupon
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons?.map(coupon => (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-card border border-gray-100 bg-surface p-5 shadow-card dark:border-gray-800 dark:bg-surface-raised overflow-hidden"
              >
                {/* Decorative dashed left border */}
                <div className="absolute left-0 inset-y-0 w-1 bg-primary-500 rounded-l-card" />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex-1 min-w-0">
                    {/* Code */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="shrink-0 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Copy code"
                      >
                        {copied === coupon.code
                          ? <CheckCircle2 size={14} className="text-emerald-500" />
                          : <Copy size={14} />}
                      </button>
                    </div>

                    {/* Discount */}
                    <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
                      {discountLabel(coupon)}
                    </p>

                    {/* Meta */}
                    <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {coupon.minOrderAmount && (
                        <p>Min. order: {formatPrice(coupon.minOrderAmount)}</p>
                      )}
                      {coupon.maxUses && (
                        <p>Uses: {coupon.usedCount}/{coupon.maxUses}</p>
                      )}
                      {coupon.expiresAt && (
                        <p>Expires: {formatDate(coupon.expiresAt.toString())}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={coupon.isActive ? 'success' : 'neutral'} size="sm" dot>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setModal({ open: true, coupon })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Usage bar */}
                {coupon.maxUses && (
                  <div className="mt-4 pl-2">
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.coupon ? 'Edit Coupon' : 'Create Coupon'}
        size="md"
      >
        <CouponForm
          coupon={modal.coupon}
          onClose={() => setModal({ open: false })}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-coupons'] })
            setModal({ open: false })
          }}
        />
      </Modal>
    </div>
  )
}

// ─── Coupon form ───────────────────────────────────────────────
function CouponForm({
  coupon, onClose, onSuccess,
}: {
  coupon?:   Coupon
  onClose:   () => void
  onSuccess: () => void
}) {
  const toast = useToast()
  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code:           coupon?.code           ?? '',
      type:           coupon?.type           ?? 'percentage',
      value:          coupon?.value          ?? 10,
      minOrderAmount: coupon?.minOrderAmount,
      maxUses:        coupon?.maxUses,
      expiresAt:      coupon?.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
      isActive: coupon?.isActive ?? true,
    },
  })

  const watchType = watch('type')

  async function onSubmit(data: CouponForm) {
    try {
      const payload = {
        ...data,
        code:      data.code.toUpperCase(),
        value:     watchType === 'free_shipping' ? 0 : data.value,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      }
      if (coupon) {
        await couponService.update(coupon._id, payload)
        toast.success('Coupon updated!')
      } else {
        await couponService.create(payload)
        toast.success('Coupon created!')
      }
      onSuccess()
    } catch {
      toast.error('Failed to save coupon')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Coupon Code"
        placeholder="SAVE20"
        error={errors.code?.message}
        className="font-mono uppercase"
        {...register('code')}
      />

      <Select
        label="Discount Type"
        options={[
          { value: 'percentage',    label: '% Percentage Off' },
          { value: 'fixed',         label: '$ Fixed Amount Off' },
          { value: 'free_shipping', label: '🚚 Free Shipping' },
        ]}
        error={errors.type?.message}
        {...register('type')}
      />

      {watchType !== 'free_shipping' && (
        <Input
          label={watchType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
          type="number"
          min="0"
          step={watchType === 'percentage' ? '1' : '0.01'}
          error={errors.value?.message}
          {...register('value')}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min. Order ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0 = no min"
          error={errors.minOrderAmount?.message}
          {...register('minOrderAmount')}
        />
        <Input
          label="Max Uses"
          type="number"
          min="1"
          placeholder="Unlimited"
          error={errors.maxUses?.message}
          {...register('maxUses')}
        />
      </div>

      <Input
        label="Expires At"
        type="date"
        error={errors.expiresAt?.message}
        {...register('expiresAt')}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="h-4 w-4 rounded accent-primary-600"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Active (customers can use this coupon)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>
          {coupon ? 'Update' : 'Create'} Coupon
        </Button>
      </div>
    </form>
  )
}
