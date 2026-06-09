'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Lock, Bell, Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Avatar, Badge } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/slices/authStore'
import { authService } from '@/services'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Address } from '@/types'

type Tab = 'profile' | 'addresses' | 'security'

const profileSchema = z.object({
  name:  z.string().min(2),
  phone: z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const toast                = useToast()
  const [tab, setTab]        = React.useState<Tab>('profile')
  const [addrModal, setAddrModal] = React.useState<{ open: boolean; addr?: Address }>({ open: false })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  async function onProfileSave(data: ProfileForm) {
    try {
      const updated = await authService.updateProfile(data)
      updateUser(updated)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'profile',   icon: User,   label: 'Profile'   },
    { id: 'addresses', icon: MapPin, label: 'Addresses' },
    { id: 'security',  icon: Lock,   label: 'Security'  },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page max-w-4xl">

          {/* ── Profile header ───────────────────────────────── */}
          <div className="mb-8 flex items-center gap-5">
            <Avatar src={user?.avatar} name={user?.name} size="xl" />
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="mt-1.5 flex gap-2">
                <Badge variant="primary" size="sm">{user?.role}</Badge>
                {user?.isVerified && <Badge variant="success" size="sm" dot>Verified</Badge>}
                {user?.loyaltyPoints && user.loyaltyPoints > 0 ? (
                  <Badge variant="warning" size="sm">⭐ {user.loyaltyPoints} pts</Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* ── Sidebar ────────────────────────────────────── */}
            <nav className="md:col-span-1">
              <ul className="space-y-1">
                {tabs.map(t => (
                  <li key={t.id}>
                    <button
                      onClick={() => setTab(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                        tab === t.id
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                      )}
                    >
                      <t.icon size={16} className="shrink-0" />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ── Content ────────────────────────────────────── */}
            <div className="md:col-span-3">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
              >
                {/* Profile Tab */}
                {tab === 'profile' && (
                  <form onSubmit={handleSubmit(onProfileSave)} className="space-y-5">
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input label="Full Name" error={errors.name?.message} {...register('name')} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Email address"
                          value={user?.email ?? ''}
                          disabled
                          hint="Email cannot be changed"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Phone number" type="tel" error={errors.phone?.message} {...register('phone')} />
                      </div>
                    </div>
                    <Button type="submit" loading={isSubmitting}>Save Changes</Button>
                  </form>
                )}

                {/* Addresses Tab */}
                {tab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
                        Saved Addresses
                      </h2>
                      <Button
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={() => setAddrModal({ open: true })}
                      >
                        Add Address
                      </Button>
                    </div>

                    {!user?.addresses?.length ? (
                      <div className="py-10 text-center text-gray-400 dark:text-gray-500">
                        <MapPin size={36} className="mx-auto mb-3 opacity-40" />
                        <p>No addresses saved yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {user.addresses.map(addr => (
                          <div
                            key={addr._id}
                            className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                                  <MapPin size={14} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="capitalize text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                      {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="flex items-center gap-1 text-[10px] font-medium text-primary-600 dark:text-primary-400">
                                        <Check size={10} /> Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{addr.fullName}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {addr.street}, {addr.city}<br />
                                    {addr.state}, {addr.country} {addr.zipCode}<br />
                                    {addr.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => setAddrModal({ open: true, addr })}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={async () => {
                                    await authService.deleteAddress(addr._id)
                                    const updated = await authService.me()
                                    updateUser(updated)
                                    toast.success('Address removed')
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {tab === 'security' && (
                  <ChangePasswordForm />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      <AddressModal
        open={addrModal.open}
        address={addrModal.addr}
        onClose={() => setAddrModal({ open: false })}
        onSave={async (data) => {
          try {
            if (addrModal.addr) {
              await authService.updateAddress(addrModal.addr._id, data)
            } else {
              await authService.addAddress(data as Omit<Address, '_id'>)
            }
            const updated = await authService.me()
            updateUser(updated)
            toast.success(addrModal.addr ? 'Address updated' : 'Address added')
            setAddrModal({ open: false })
          } catch {
            toast.error('Failed to save address')
          }
        }}
      />
      <Footer />
    </>
  )
}

// ─── Change password sub-form ──────────────────────────────────
function ChangePasswordForm() {
  const toast    = useToast()
  const [current, setCurrent] = React.useState('')
  const [next,    setNext]    = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) { toast.error('Passwords do not match'); return }
    if (next.length < 8)  { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authService.changePassword(current, next)
      toast.success('Password changed!')
      setCurrent(''); setNext(''); setConfirm('')
    } catch {
      toast.error('Incorrect current password')
    } finally {
      setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
      <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
      <Input label="Current Password" type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
      <Input label="New Password" type="password" value={next} onChange={e => setNext(e.target.value)} hint="At least 8 characters" required />
      <Input label="Confirm New Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      <Button type="submit" loading={loading}>Update Password</Button>
    </form>
  )
}

// ─── Add/Edit address modal ────────────────────────────────────
function AddressModal({
  open, address, onClose, onSave,
}: {
  open:     boolean
  address?: Address
  onClose:  () => void
  onSave:   (data: Partial<Address>) => Promise<void>
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<Partial<Address>>(address ?? {
    label: 'home', fullName: '', phone: '', street: '',
    city: '', state: '', country: '', zipCode: '', isDefault: false,
  })

  React.useEffect(() => {
    if (address) setForm(address)
    else setForm({ label: 'home', fullName: '', phone: '', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false })
  }, [address, open])

  function set(k: keyof Address, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={address ? 'Edit Address' : 'Add New Address'}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Save Address</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Select
            label="Label"
            value={form.label ?? 'home'}
            onChange={e => set('label', e.target.value)}
            options={[
              { value: 'home',  label: '🏠 Home'  },
              { value: 'work',  label: '💼 Work'  },
              { value: 'other', label: '📍 Other' },
            ]}
          />
        </div>
        <Input label="Full Name" value={form.fullName ?? ''} onChange={e => set('fullName', e.target.value)} required />
        <Input label="Phone" type="tel" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} required />
        <div className="col-span-2">
          <Input label="Street Address" value={form.street ?? ''} onChange={e => set('street', e.target.value)} required />
        </div>
        <Input label="City"    value={form.city    ?? ''} onChange={e => set('city',    e.target.value)} required />
        <Input label="State"   value={form.state   ?? ''} onChange={e => set('state',   e.target.value)} required />
        <Input label="Country" value={form.country ?? ''} onChange={e => set('country', e.target.value)} required />
        <Input label="ZIP"     value={form.zipCode ?? ''} onChange={e => set('zipCode', e.target.value)} required />
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault ?? false}
            onChange={e => set('isDefault', e.target.checked)}
            className="h-4 w-4 rounded accent-primary-600"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Set as default address
          </label>
        </div>
      </div>
    </Modal>
  )
}
