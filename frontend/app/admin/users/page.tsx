'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Search, Users, ShieldCheck, ShieldOff } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, Badge, Skeleton } from '@/components/ui/primitives'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState('')
  const [page,   setPage]   = React.useState(1)
  const toast               = useToast()
  const qc                  = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, search }],
    queryFn:  () => adminService.getUsers({ page, search: search || undefined }),
  })

  async function handleToggleActive(user: User) {
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(
        user.isActive ? 'User deactivated' : 'User reactivated',
        user.name,
      )
    } catch {
      toast.error('Action failed')
    }
  }

  async function handleChangeRole(user: User, role: User['role']) {
    try {
      await adminService.updateUser(user._id, { role })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Role updated', `${user.name} → ${role}`)
    } catch {
      toast.error('Role update failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {data?.pagination.total ?? 0} total users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          leading={<Search size={15} />}
        />
      </div>

      {/* Table */}
      <div className="rounded-card border border-gray-100 bg-surface shadow-card dark:border-gray-800 dark:bg-surface-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-surface-raised dark:bg-surface-overlay">
                {['User', 'Email', 'Role', 'Orders', 'Joined', 'Status', ''].map(h => (
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
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton circle className="h-9 w-9" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </td>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      ))}
                      <td className="px-5 py-4"><Skeleton className="h-7 w-20 ml-auto" /></td>
                    </tr>
                  ))
                : data?.data.map(user => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-raised dark:hover:bg-surface-overlay transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.name} size="sm" />
                          <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{user.email}</td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          onChange={e => handleChangeRole(user, e.target.value as User['role'])}
                          className="rounded-button border border-gray-200 dark:border-gray-700 bg-surface dark:bg-surface-raised px-2 py-1 text-xs outline-none cursor-pointer"
                        >
                          {['customer', 'staff', 'manager', 'admin'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>

                      {/* Orders placeholder */}
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">—</td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          variant={user.isActive ? 'success' : 'error'}
                          size="sm"
                          dot
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-button px-2.5 py-1.5 text-xs font-medium transition-colors',
                            user.isActive
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                          )}
                        >
                          {user.isActive
                            ? <><ShieldOff size={13} /> Deactivate</>
                            : <><ShieldCheck size={13} /> Reactivate</>}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && data?.data.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Users size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}

        {data && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-5 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {data.pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="xs" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
