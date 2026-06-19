'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Image as ImageIcon, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bannerService } from '@/services'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, Skeleton } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types'

export default function AdminBannersPage() {
  const [modal, setModal] = React.useState<{ open: boolean; banner?: Banner }>({ open: false })
  const toast = useToast()
  const qc    = useQueryClient()

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn:  bannerService.getAll,
  })

  async function handleToggle(banner: Banner) {
    try {
      await bannerService.update(banner._id, { isActive: !banner.isActive })
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success(banner.isActive ? 'Banner hidden' : 'Banner shown')
    } catch {
      toast.error('Update failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await bannerService.delete(id)
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Banners</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage homepage banners</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal({ open: true })}>
          Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
        </div>
      ) : banners?.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center rounded-card border border-dashed border-gray-200 dark:border-gray-700">
          <ImageIcon size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No banners yet</p>
          <Button size="sm" className="mt-4" onClick={() => setModal({ open: true })}>
            Add your first banner
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {banners?.map(banner => (
              <motion.div
                key={banner._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'flex items-center gap-4 rounded-card border p-4 shadow-card transition-opacity',
                  banner.isActive
                    ? 'border-gray-100 bg-surface dark:border-gray-800 dark:bg-surface-raised'
                    : 'border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900',
                )}
              >
                {/* Thumbnail */}
                <div className="h-20 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{banner.title}</p>
                    <Badge
                      variant={banner.position === 'hero' ? 'primary' : 'neutral'}
                      size="sm"
                    >
                      {banner.position}
                    </Badge>
                    <Badge variant={banner.isActive ? 'success' : 'neutral'} size="sm" dot>
                      {banner.isActive ? 'Live' : 'Hidden'}
                    </Badge>
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
                  )}
                  {banner.ctaLink && (
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 truncate">
                      → {banner.ctaLink}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(banner)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      banner.isActive
                        ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800'
                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                    )}
                    title={banner.isActive ? 'Hide banner' : 'Show banner'}
                  >
                    {banner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => setModal({ open: true, banner })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.banner ? 'Edit Banner' : 'Add Banner'}
        size="md"
      >
        <BannerForm
          banner={modal.banner}
          onClose={() => setModal({ open: false })}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-banners'] })
            setModal({ open: false })
          }}
        />
      </Modal>
    </div>
  )
}

function BannerForm({
  banner, onClose, onSuccess,
}: {
  banner?:   Banner
  onClose:   () => void
  onSuccess: () => void
}) {
  const toast  = useToast()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    title:     banner?.title     ?? '',
    subtitle:  banner?.subtitle  ?? '',
    ctaText:   banner?.ctaText   ?? '',
    ctaLink:   banner?.ctaLink   ?? '',
    image:     banner?.image     ?? '',
    position:  banner?.position  ?? 'middle',
    isActive:  banner?.isActive  ?? true,
    sortOrder: banner?.sortOrder?.toString() ?? '0',
  })

  function set(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image) { toast.error('Image URL is required'); return }
    setSaving(true)
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) }
      if (banner) {
        await bannerService.update(banner._id, payload)
        toast.success('Banner updated!')
      } else {
        await bannerService.create(payload)
        toast.success('Banner created!')
      }
      onSuccess()
    } catch {
      toast.error('Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Input label="Title" value={form.title} onChange={e => set('title', e.target.value)} required />
      <Input label="Subtitle" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
      <Input label="Image URL" value={form.image} onChange={e => set('image', e.target.value)} required hint="Direct link to image (Cloudinary, Unsplash, etc.)" />
      {form.image && (
        <div className="h-32 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="CTA Text" value={form.ctaText} onChange={e => set('ctaText', e.target.value)} placeholder="Shop Now" />
        <Input label="CTA Link" value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} placeholder="/shop/products" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Position"
          value={form.position}
          onChange={e => set('position', e.target.value)}
          options={[
            { value: 'hero',    label: 'Hero'    },
            { value: 'middle',  label: 'Middle'  },
            { value: 'sidebar', label: 'Sidebar' },
            { value: 'popup',   label: 'Popup'   },
          ]}
        />
        <Input
          label="Sort Order"
          type="number"
          min="0"
          value={form.sortOrder}
          onChange={e => set('sortOrder', e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bannerActive"
          checked={form.isActive}
          onChange={e => set('isActive', e.target.checked)}
          className="h-4 w-4 rounded accent-primary-600"
        />
        <label htmlFor="bannerActive" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Show this banner on the storefront
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={saving}>{banner ? 'Update' : 'Create'} Banner</Button>
      </div>
    </form>
  )
}
