'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Save, Store, Bell, CreditCard, Truck, Globe } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { api } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

// ─── Service (inline, no new file needed) ──────────────────────
const settingsService = {
  get: (): Promise<Record<string, unknown>> =>
    api(() => apiClient.get<{ success: true; data: Record<string, unknown> }>('/admin/settings')),
  save: (data: Record<string, unknown>): Promise<string> =>
    api(() => apiClient.patch<{ success: true; data: string; message?: string }>('/admin/settings', data)),
}

// ─── Section tabs ───────────────────────────────────────────────
const TABS = [
  { id: 'store',     label: 'Store',         icon: Store      },
  { id: 'shipping',  label: 'Shipping',       icon: Truck      },
  { id: 'payments',  label: 'Payments',       icon: CreditCard },
  { id: 'notifications', label: 'Alerts',     icon: Bell       },
  { id: 'seo',       label: 'SEO',            icon: Globe      },
] as const

type TabId = typeof TABS[number]['id']

const DEFAULT_SETTINGS: Record<string, unknown> = {
  // Store
  storeName:        '',
  storeEmail:       '',
  storePhone:       '',
  storeAddress:     '',
  currency:         'USD',
  timezone:         'UTC',
  // Shipping
  freeShippingThreshold: 50,
  defaultShippingRate:   5.99,
  expressShippingRate:   14.99,
  // Payments
  stripeEnabled:    true,
  codEnabled:       false,
  // Notifications
  notifyNewOrder:   true,
  notifyLowStock:   true,
  lowStockThreshold: 5,
  adminEmail:       '',
  // SEO
  metaTitle:        '',
  metaDescription:  '',
}

export default function AdminSettingsPage() {
  const toast = useToast()
  const qc    = useQueryClient()
  const [tab, setTab] = React.useState<TabId>('store')
  const [form, setForm] = React.useState<Record<string, unknown>>(DEFAULT_SETTINGS)

  const { isLoading, data: settingsData } = useQuery<Record<string, unknown>>({
    queryKey: ['admin-settings'],
    queryFn:  settingsService.get,
  })

  React.useEffect(() => {
    if (settingsData) {
      setForm(prev => ({ ...DEFAULT_SETTINGS, ...prev, ...settingsData }))
    }
  }, [settingsData])

  const { mutate: save, isPending: saving } = useMutation<string, Error, void>({
    mutationFn: () => settingsService.save(form),
    onSuccess:  () => {
      toast.success('Settings saved successfully')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function Field({
    label, name, type = 'text', hint, placeholder,
  }: {
    label: string; name: string; type?: string; hint?: string; placeholder?: string
  }) {
    return (
      <Input
        label={label}
        type={type}
        value={String(form[name] ?? '')}
        onChange={e => set(name, type === 'number' ? Number(e.target.value) : e.target.value)}
        hint={hint}
        placeholder={placeholder}
      />
    )
  }

  function Toggle({ label, name, description }: { label: string; name: string; description?: string }) {
    return (
      <label className="flex cursor-pointer items-start gap-3">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            className="sr-only"
            checked={Boolean(form[name])}
            onChange={e => set(name, e.target.checked)}
          />
          <div className={cn(
            'h-5 w-9 rounded-full transition-colors',
            form[name] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
          )}>
            <div className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              form[name] ? 'translate-x-4' : 'translate-x-0.5',
            )} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </label>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Configure your store preferences</p>
        </div>
        <Button
          icon={<Save size={16} />}
          onClick={() => save()}
          loading={saving}
          disabled={isLoading}
        >
          Save Changes
        </Button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:w-48 shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors w-full text-left',
                tab === t.id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
              )}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
        >
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <>
              {tab === 'store' && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-gray-900 dark:text-white">Store Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Store Name"    name="storeName"    placeholder="My Supplement Store" />
                    <Field label="Contact Email" name="storeEmail"   type="email" placeholder="hello@store.com" />
                    <Field label="Phone Number"  name="storePhone"   placeholder="+1 555 000 0000" />
                    <Field label="Currency"      name="currency"     placeholder="USD" />
                  </div>
                  <Field label="Store Address" name="storeAddress" placeholder="123 Main St, City, Country" />
                  <Field label="Timezone" name="timezone" placeholder="UTC" hint="e.g. America/New_York" />
                </div>
              )}

              {tab === 'shipping' && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-gray-900 dark:text-white">Shipping Rates</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Free Shipping Threshold ($)"
                      name="freeShippingThreshold"
                      type="number"
                      hint="Orders above this amount get free shipping"
                    />
                    <Field
                      label="Standard Shipping Rate ($)"
                      name="defaultShippingRate"
                      type="number"
                    />
                    <Field
                      label="Express Shipping Rate ($)"
                      name="expressShippingRate"
                      type="number"
                    />
                  </div>
                </div>
              )}

              {tab === 'payments' && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
                  <div className="space-y-4">
                    <Toggle
                      label="Stripe (Credit / Debit Card)"
                      name="stripeEnabled"
                      description="Accept card payments via Stripe"
                    />
                    <Toggle
                      label="Cash on Delivery"
                      name="codEnabled"
                      description="Allow customers to pay when they receive their order"
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Stripe API keys are configured in your server environment variables.
                  </p>
                </div>
              )}

              {tab === 'notifications' && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-gray-900 dark:text-white">Alert Preferences</h2>
                  <Field
                    label="Admin Notification Email"
                    name="adminEmail"
                    type="email"
                    hint="Where to send order and stock alerts"
                    placeholder="admin@yourstore.com"
                  />
                  <div className="space-y-4 pt-2">
                    <Toggle
                      label="New Order Alerts"
                      name="notifyNewOrder"
                      description="Get notified whenever a new order is placed"
                    />
                    <Toggle
                      label="Low Stock Alerts"
                      name="notifyLowStock"
                      description="Get notified when product inventory runs low"
                    />
                  </div>
                  <Field
                    label="Low Stock Threshold"
                    name="lowStockThreshold"
                    type="number"
                    hint="Alert when inventory drops below this quantity"
                  />
                </div>
              )}

              {tab === 'seo' && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-gray-900 dark:text-white">SEO & Meta</h2>
                  <Field label="Default Page Title" name="metaTitle" placeholder="Best Supplements Online | MyStore" />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={String(form.metaDescription ?? '')}
                      onChange={e => set('metaDescription', e.target.value)}
                      placeholder="Premium quality supplements delivered to your door..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">{String(form.metaDescription ?? '').length}/160 characters</p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
