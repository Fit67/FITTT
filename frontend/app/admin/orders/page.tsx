'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Package } from 'lucide-react'
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useQueries'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge, Skeleton, Avatar } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate, getOrderStatusLabel, orderStatusColors, cn } from '@/lib/utils'
import type { Order } from '@/types'

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'refunded',
] as const

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = React.useState('')
  const [page, setPage]                 = React.useState(1)
  const [selected, setSelected]         = React.useState<Order | null>(null)

  const { data, isLoading }    = useAdminOrders({ status: filterStatus || undefined, page })
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const toast = useToast()

  function handleStatusChange(orderId: string, status: string) {
    updateStatus(
      { id: orderId, status },
      {
        onSuccess: () => {
          toast.success('Order updated', `Status changed to ${getOrderStatusLabel(status)}`)
          if (selected?._id === orderId) {
            setSelected(prev => prev ? { ...prev, status: status as Order['status'] } : null)
          }
        },
        onError: () => toast.error('Update failed'),
      },
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {data?.pagination.total ?? 0} total orders
          </p>
        </div>
      </div>

      {/* ── Status Filter Tabs ───────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => { setFilterStatus(''); setPage(1) }}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
            !filterStatus
              ? 'bg-primary-600 text-white'
              : 'bg-surface-raised text-gray-600 hover:bg-surface-overlay dark:bg-surface-overlay dark:text-gray-400',
          )}
        >
          All
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              filterStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-surface-raised text-gray-600 hover:bg-surface-overlay dark:bg-surface-overlay dark:text-gray-400',
            )}
          >
            {getOrderStatusLabel(s)}
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="rounded-card border border-gray-100 bg-surface shadow-card dark:border-gray-800 dark:bg-surface-raised overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-surface-raised dark:bg-surface-overlay">
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
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
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      ))}
                    </tr>
                  ))
                : data?.data.map(order => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface-raised dark:hover:bg-surface-overlay transition-colors cursor-pointer"
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={(order.user as { name: string }).name}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                              {(order.user as { name: string }).name}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {(order.user as { email: string }).email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'}
                          size="sm"
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          'inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium',
                          orderStatusColors[order.status],
                        )}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(order.createdAt.toString())}
                      </td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <StatusDropdown
                          current={order.status}
                          onUpdate={status => handleStatusChange(order._id, status)}
                          loading={isPending}
                        />
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && data?.data.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Package size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-medium text-gray-500 dark:text-gray-400">No orders found</p>
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

      {/* ── Order Detail Modal ───────────────────────────────── */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Order ${selected.orderNumber}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center rounded-badge px-3 py-1 text-sm font-medium',
                orderStatusColors[selected.status],
              )}>
                {getOrderStatusLabel(selected.status)}
              </span>
              <StatusDropdown
                current={selected.status}
                onUpdate={status => handleStatusChange(selected._id, status)}
                loading={isPending}
              />
            </div>

            {/* Customer */}
            <div className="rounded-xl bg-surface-raised dark:bg-surface-overlay p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Customer</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{(selected.user as { name: string }).name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{(selected.user as { email: string }).email}</p>
            </div>

            {/* Shipping */}
            <div className="rounded-xl bg-surface-raised dark:bg-surface-overlay p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Shipping Address</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selected.shippingAddress.fullName}<br />
                {selected.shippingAddress.phone}<br />
                {selected.shippingAddress.street}<br />
                {selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.zipCode}<br />
                {selected.shippingAddress.country}
              </p>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Items</p>
              <div className="space-y-3">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image || '/images/placeholder.png'} alt={item.name || 'Product'} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-xl bg-surface-raised dark:bg-surface-overlay p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
              {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>−{formatPrice(selected.discount)}</span></div>}
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery</span><span>{formatPrice(selected.deliveryFee)}</span></div>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
            </div>

            {(selected.paymentProofImage || selected.notes) && (
              <div className="rounded-xl bg-surface-raised dark:bg-surface-overlay p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Payment Proof</p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Method: {selected.paymentMethod.replace(/_/g, ' ')}
                  </p>
                  {selected.notes && (
                    <p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">{selected.notes}</p>
                  )}
                  {selected.paymentProofImage && (
                    <a href={selected.paymentProofImage} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={selected.paymentProofImage}
                        alt={selected.paymentProofFileName ?? 'Payment screenshot'}
                        className="max-h-80 rounded-lg object-contain"
                      />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Timeline</p>
              <div className="space-y-2">
                {selected.timeline.map((event, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                      {i < selected.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />}
                    </div>
                    <div className="pb-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{event.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(event.timestamp.toString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Status dropdown ───────────────────────────────────────────
function StatusDropdown({
  current,
  onUpdate,
  loading,
}: {
  current: string
  onUpdate: (status: string) => void
  loading?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const nextStatuses    = ORDER_STATUSES.filter(s => s !== current)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-button border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        disabled={loading}
      >
        Update <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-card bg-surface border border-gray-100 dark:bg-surface-raised dark:border-gray-800 shadow-modal overflow-hidden py-1">
            {nextStatuses.map(s => (
              <button
                key={s}
                onClick={() => { onUpdate(s); setOpen(false) }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-surface-raised dark:hover:bg-surface-overlay transition-colors"
              >
                → {getOrderStatusLabel(s)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
