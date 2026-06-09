'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api-client'

type Category = {
  _id: string
  name: string
  slug: string
  isActive: boolean
  productCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [modal, setModal] = React.useState<{ type: 'create' | 'edit' | 'delete'; category?: Category } | null>(null)

  const [form, setForm] = React.useState({
    name: '',
    slug: '',
  })

  const [recalculating, setRecalculating] = React.useState(false)
  const toast = useToast()
  const qc = useQueryClient()

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/categories')
      setCategories(res.data?.data || [])
    } catch { setCategories([]) } finally { setLoading(false) }
  }

  React.useEffect(() => {
    fetchCategories()
  }, [])

  async function recalculateCounts() {
    setRecalculating(true)
    try {
      await apiClient.post('/admin/categories/recalculate-counts')
      toast.success('Done!', 'Product counts updated for all categories')
      fetchCategories()
    } catch {
      toast.error('Failed to recalculate counts')
    } finally {
      setRecalculating(false)
    }
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (modal?.type === 'edit') {
        await apiClient.patch(`/admin/categories/${modal.category?._id}`, {
          name: form.name, slug: form.slug || generateSlug(form.name),
        })
      } else {
        await apiClient.post('/admin/categories', {
          name: form.name, slug: form.slug || generateSlug(form.name),
        })
      }
      toast.success(modal?.type === 'edit' ? 'Category updated' : 'Category created')
    } catch {
      toast.error('Failed to save category')
    }
    setModal(null)
    setForm({ name: '', slug: '' })
    fetchCategories()
  }

  async function deleteCategory(id: string) {
    try {
      await apiClient.delete(`/admin/categories/${id}`)
      toast.success('Category deleted')
    } catch { toast.error('Failed to delete category') }
    fetchCategories()
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-2">
          <Button variant="outline" loading={recalculating} onClick={recalculateCounts}>
            🔄 Recalculate Counts
          </Button>
          <Button onClick={() => setModal({ type: 'create' })}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-t">
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.productCount}</td>

                  <td className="flex gap-2">
                    <button onClick={() => {
                      setModal({ type: 'edit', category: cat })
                      setForm({ name: cat.name, slug: cat.slug })
                    }}>
                      Edit
                    </button>

                    <button onClick={() => deleteCategory(cat._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal?.type === 'create' || modal?.type === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Add Category' : 'Edit Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <Input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
          />

          <Button type="submit">
            {modal?.type === 'edit' ? 'Update' : 'Create'}
          </Button>
        </form>
      </Modal>

    </div>
  )
}