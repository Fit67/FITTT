'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/primitives'
import { Skeleton } from '@/components/ui/primitives'
import { useMyOrders } from '@/hooks/useQueries'
import { formatPrice, formatDate, getOrderStatusLabel, orderStatusColors } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const { data, isLoading } = useMyOrders()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-card" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-24 text-center"
            >
              <Package size={56} className="text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">No orders yet</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">When you place an order, it will appear here.</p>
              <Link href="/shop/products" className="mt-6 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Start Shopping →
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {data.data.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={`/shop/orders/${order._id}`}
                    className="flex items-center gap-4 rounded-card border border-gray-100 bg-surface p-5 shadow-card hover:shadow-card-hover dark:border-gray-800 dark:bg-surface-raised transition-shadow group"
                  >
                    {/* Order image preview */}
                    <div className="flex -space-x-2 shrink-0">
                      {order.items.slice(0, 3).map((item, j) => (
                        <img
                          key={j}
                          src={item.product?.images?.[0]?.url || '/images/placeholder.png'}
                          alt={item.product?.name || 'Product'}
                          className="h-12 w-12 rounded-lg object-cover border-2 border-white dark:border-gray-800"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </span>
                        <span className={cn(
                          'inline-flex items-center rounded-badge px-2 py-0.5 text-[11px] font-medium',
                          orderStatusColors[order.status],
                        )}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {order.items.length} items · {formatDate(order.createdAt.toString())}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(order.total)}</p>
                      <ChevronRight size={16} className="ml-auto mt-1 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
