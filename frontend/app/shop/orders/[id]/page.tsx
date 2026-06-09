'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Package, Truck, MapPin,
  CreditCard, CheckCircle2, XCircle, Clock,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Badge, Skeleton } from '@/components/ui/primitives'
import { Button } from '@/components/ui/Button'
import { useOrder } from '@/hooks/useQueries'
import { useCreateOrder } from '@/hooks/useQueries'
import { orderService } from '@/services'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { QK } from '@/hooks/useQueries'
import {
  formatPrice, formatDate, getOrderStatusLabel,
  orderStatusColors, cn,
} from '@/lib/utils'
import type { OrderStatus } from '@/types'

const statusIcons: Partial<Record<OrderStatus, React.ElementType>> = {
  pending:          Clock,
  confirmed:        CheckCircle2,
  processing:       Package,
  shipped:          Truck,
  out_for_delivery: Truck,
  delivered:        CheckCircle2,
  cancelled:        XCircle,
  refunded:         XCircle,
}

const timelineSteps: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered',
]

interface Props { params: { id: string } }

export default function OrderDetailPage({ params }: Props) {
  const { id }                = params
  const { data: order, isLoading } = useOrder(id)
  const toast                 = useToast()
  const qc                    = useQueryClient()

  async function handleCancel() {
    try {
      await orderService.cancel(id)
      qc.invalidateQueries({ queryKey: QK.order(id) })
      qc.invalidateQueries({ queryKey: QK.myOrders(1) })
      toast.success('Order cancelled', 'A refund will be processed if applicable.')
    } catch {
      toast.error('Cannot cancel order', 'This order may already be processing.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page max-w-4xl">

          {/* Back */}
          <Link
            href="/shop/orders"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={14} /> Back to orders
          </Link>

          {isLoading ? (
            <div className="space-y-5">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-48 rounded-card" />
              <Skeleton className="h-48 rounded-card" />
            </div>
          ) : !order ? (
            <div className="text-center py-16">
              <Package size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Order not found</h2>
              <Link href="/shop/orders" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline">
                ← Back to orders
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                    Order {order.orderNumber}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Placed {formatDate(order.createdAt.toString())}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'inline-flex items-center rounded-badge px-3 py-1.5 text-sm font-medium',
                    orderStatusColors[order.status],
                  )}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                  {['pending', 'confirmed'].includes(order.status) && (
                    <Button variant="danger" size="sm" onClick={handleCancel}>
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress timeline */}
              {!['cancelled', 'refunded'].includes(order.status) && (
                <div className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                  <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-6">
                    Order Progress
                  </h2>
                  <div className="relative flex items-start justify-between">
                    {/* Connector line */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 dark:bg-gray-800" />
                    <div
                      className="absolute top-4 left-4 h-0.5 bg-primary-500 transition-all duration-700"
                      style={{
                        width: `${(timelineSteps.indexOf(order.status as OrderStatus) / (timelineSteps.length - 1)) * 100}%`,
                      }}
                    />

                    {timelineSteps.map((step, i) => {
                      const currentIdx = timelineSteps.indexOf(order.status as OrderStatus)
                      const isPast     = i < currentIdx
                      const isCurrent  = i === currentIdx
                      const Icon       = statusIcons[step] ?? Package

                      return (
                        <div key={step} className="relative flex flex-col items-center gap-2 flex-1">
                          <div className={cn(
                            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                            isPast    ? 'border-primary-500 bg-primary-500 text-white' :
                            isCurrent ? 'border-primary-500 bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400' :
                                        'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 text-gray-300 dark:text-gray-600',
                          )}>
                            {isPast ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                          </div>
                          <span className={cn(
                            'text-[10px] font-medium text-center capitalize hidden sm:block',
                            isCurrent ? 'text-primary-600 dark:text-primary-400' :
                            isPast    ? 'text-gray-500 dark:text-gray-400' :
                                        'text-gray-300 dark:text-gray-600',
                          )}>
                            {getOrderStatusLabel(step)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Items */}
                <div className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                  <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Items Ordered
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <img
                          src={item.image || '/images/placeholder.png'}
                          alt={item.name}
                          className="h-14 w-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span><span>−{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Delivery</span>
                      <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax</span><span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <span>Total</span><span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  {/* Delivery address */}
                  <div className="rounded-card border border-gray-100 bg-surface p-5 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      <MapPin size={15} className="text-primary-500" /> Delivery Address
                    </h3>
                    <address className="not-italic text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}<br />
                      <span className="font-medium">{order.shippingAddress.phone}</span>
                    </address>
                  </div>

                  {/* Payment */}
                  <div className="rounded-card border border-gray-100 bg-surface p-5 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      <CreditCard size={15} className="text-primary-500" /> Payment
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {order.paymentMethod.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'error' : 'warning'}
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="rounded-card border border-gray-100 bg-surface p-5 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
                    <div className="space-y-3">
                      {[...order.timeline].reverse().map((event, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-primary-400" />
                            {i < order.timeline.length - 1 && (
                              <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 my-1" />
                            )}
                          </div>
                          <div className="pb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.message}</p>
                            <p className="text-xs text-gray-400">{formatDate(event.timestamp.toString())}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
