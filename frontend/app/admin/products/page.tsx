'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Package, AlertCircle } from 'lucide-react'
import { useCategories } from '@/hooks/useQueries'
import { productService, categoryService } from '@/services'
import { QK } from '@/hooks/useQueries'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, Skeleton } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, getProductImage } from '@/lib/utils'
import type { Product, PaginatedResponse } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [search,     setSearch]     = React.useState('')
  const [status,     setStatus]     = React.useState('')
  const [page,       setPage]       = React.useState(1)
  const [modal,      setModal]      = React.useState<{ type: 'create' | 'edit' | 'delete'; product?: Product } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, status, page] as const,
    queryFn:  (): Promise<PaginatedResponse<Product>> =>
      productService.adminGetAll({ search: search || undefined, status: status || undefined, page, limit: 20 }),
  })
  const { data: categories } = useCategories()
  const toast = useToast()
  const qc    = useQueryClient()

  async function handleToggle(product: Product) {
    try {
      await productService.toggle(product._id)
      const next = product.status === 'active' ? 'hidden' : 'visible'
      toast.success(`Product ${next}`, product.name)
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    } catch {
      toast.error('Failed to update product visibility')
    }
  }

  async function handleDelete(product: Product) {
    try {
      await productService.delete(product._id)
      toast.success('Product archived', product.name)
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setModal(null)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {data?.pagination.total ?? 0} total products
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal({ type: 'create' })}>
          Add Product
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            leading={<Search size={15} />}
          />
        </div>
        <Select
          options={[
            { value: '',         label: 'All Status' },
            { value: 'active',   label: 'Active'     },
            { value: 'draft',    label: 'Draft'      },
            { value: 'archived', label: 'Archived'   },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-40"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="rounded-card border border-gray-100 bg-surface shadow-card dark:border-gray-800 dark:bg-surface-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-surface-raised dark:bg-surface-overlay">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Rating', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><Skeleton className="h-4 w-32" /></div></td>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      ))}
                      <td className="px-5 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                : (Array.isArray(data?.data) ? data.data : Array.isArray((data as any)?.data?.data) ? (data as any).data.data : []).map((product: Product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-raised dark:hover:bg-surface-overlay transition-colors"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product.images)}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {product.category?.name ?? '—'}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="ml-1.5 text-xs text-gray-400 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span className={cn(
                          'text-sm font-medium',
                          (product.inventory?.quantity || 0) <= 0 ? 'text-red-500' :
                          (product.inventory?.quantity || 0) <= (product.inventory?.lowStockThreshold || 5) ? 'text-amber-500' :
                          'text-gray-700 dark:text-gray-300',
                        )}>
                          {(product.inventory?.quantity || 0) <= 0
                            ? <span className="flex items-center gap-1"><AlertCircle size={13} /> Out</span>
                            : product.inventory?.quantity || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : 'neutral'}
                          size="sm"
                        >
                          {product.status}
                        </Badge>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        {product.ratings?.count > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            ⭐ {product.ratings.average.toFixed(1)} ({product.ratings.count})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/shop/products/${product.slug}`} target="_blank">
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors">
                              <Eye size={15} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleToggle(product)}
                            title={product.status === 'active' ? 'Hide product' : 'Show product'}
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                              product.status === 'active'
                                ? 'text-gray-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-900/20'
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                            )}
                          >
                            {product.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => setModal({ type: 'edit', product })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setModal({ type: 'delete', product })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!isLoading && data?.data.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Package size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">No products found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-5 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}>
                Prev
              </Button>
              <Button variant="outline" size="xs" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      <Modal
        isOpen={modal?.type === 'delete'}
        onClose={() => setModal(null)}
        title="Archive Product"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => modal?.product && handleDelete(modal.product)}>
              Archive
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to archive{' '}
          <strong className="text-gray-900 dark:text-gray-100">&quot;{modal?.product?.name}&quot;</strong>?
          It will no longer appear in the store.
        </p>
      </Modal>

      {/* ── Create/Edit Modal placeholder ────────────────────── */}
      <Modal
        isOpen={modal?.type === 'create' || modal?.type === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Add New Product' : 'Edit Product'}
        size="xl"
      >
        <ProductForm
          product={modal?.product}
          categories={categories ?? []}
          onClose={() => setModal(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['products'] })
            qc.invalidateQueries({ queryKey: ['featured'] })
            qc.invalidateQueries({ queryKey: ['top-sellers'] })
            setModal(null)
            toast.success(modal?.type === 'create' ? 'Product created!' : 'Product updated!')
          }}
        />
      </Modal>
    </div>
  )
}

// ─── Product form ──────────────────────────────────────────────
function ProductForm({
  product,
  categories,
  onClose,
  onSuccess,
}: {
  product?:   Product
  categories: Array<{ _id: string; name: string }>
  onClose:    () => void
  onSuccess:  () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [creatingCat, setCreatingCat] = React.useState(false)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string>(product?.images?.[0]?.url || '')
  
  const qc = useQueryClient()
  const toast = useToast()

  const [form, setForm] = React.useState({
    name:             product?.name             ?? '',
    shortDescription: product?.shortDescription ?? '',
    description:      product?.description      ?? '',
    price:            product?.price?.toString() ?? '',
    comparePrice:     product?.comparePrice?.toString() ?? '',
    sku:              product?.sku              ?? '',
    category:         product?.category?._id   ?? '',
    status:           product?.status          ?? 'active',
    isFeatured:       product?.isFeatured       ?? false,
    isTopSeller:      product?.isTopSeller      ?? false,
    quantity:         product?.inventory?.quantity?.toString() ?? '0',
  })

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    setCreatingCat(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const res = await categoryService.create({ name, slug })
      if (res && res._id) {
        toast.success('Category created')
        qc.invalidateQueries({ queryKey: QK.categories() })
        set('category', res._id)
        setIsCreatingCategory(false)
        setNewCategoryName('')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: unknown) {
      console.error(err)
      const msg = (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error
        || (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Failed to create category'
      toast.error(msg)
    } finally {
      setCreatingCat(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      fd.append('slug', slug)
      if (imageFile) {
        fd.append('image', imageFile)
      }
      
      const { productService } = await import('@/services')
      if (product) {
        await productService.update(product._id, fd)
      } else {
        await productService.create(fd)
      }
      onSuccess()
    } catch (err: unknown) {
      console.error(err)
      const msg = (err as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error
        || (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Failed to save product'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Image</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  setImagePreview(URL.createObjectURL(file))
                }
              }}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <Input label="Product Name" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <Input label="Short Description" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={4}
            className="w-full rounded-button border border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-raised px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 resize-none"
          />
        </div>
        <Input label="Price ($)" type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} required />
        <Input label="Compare Price ($)" type="number" step="0.01" min="0" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} />
        <Input label="SKU" value={form.sku} onChange={e => set('sku', e.target.value)} required />
        <Input label="Stock Quantity" type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Category"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              options={categories.map(c => ({ value: c._id, label: c.name }))}
              placeholder="Select category"
              required
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsCreatingCategory(true)}
            className="px-3"
            style={{ height: '42px' }}
          >
            <Plus size={16} />
          </Button>
        </div>

        <Select
          label="Status"
          value={form.status}
          onChange={e => set('status', e.target.value)}
          options={[
            { value: 'active',   label: 'Active'   },
            { value: 'draft',    label: 'Draft'    },
            { value: 'archived', label: 'Archived' },
          ]}
        />
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Featured product (Carousel)</label>
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="topSeller" checked={form.isTopSeller} onChange={e => set('isTopSeller', e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
          <label htmlFor="topSeller" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">What&apos;s Selling (Hero Section)</label>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isCreatingCategory}
        onClose={() => setIsCreatingCategory(false)}
        title="Create New Category"
        size="sm"
      >
        <div className="space-y-4 pt-4">
          <Input 
            label="Category Name" 
            value={newCategoryName} 
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="e.g. Electronics"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateCategory()
              }
            }}
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCreatingCategory(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} loading={creatingCat}>Create</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
