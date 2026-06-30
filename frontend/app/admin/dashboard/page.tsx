'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, AlertTriangle,
  DollarSign, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboardStats } from '@/hooks/useQueries'
import { formatPrice, formatDate, getOrderStatusLabel, orderStatusColors } from '@/lib/utils'
import { Badge } from '@/components/ui/primitives'
import { Skeleton } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const statCards = stats
    ? [
        {
          label:  'Total Revenue',
          value:  formatPrice(stats.revenue.total),
          growth: stats.revenue.growth,
          icon:   DollarSign,
          color:  'text-emerald-600',
          bg:     'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
          label:  'Total Orders',
          value:  stats.orders.total.toLocaleString(),
          growth: stats.orders.growth,
          icon:   ShoppingBag,
          color:  'text-blue-600',
          bg:     'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          label:  'Customers',
          value:  stats.customers.total.toLocaleString(),
          growth: stats.customers.growth,
          icon:   Users,
          color:  'text-violet-600',
          bg:     'bg-violet-50 dark:bg-violet-900/20',
        },
        {
          label:  'Products',
          value:  stats.products.total.toLocaleString(),
          growth: null,
          badge:  stats.products.lowStock > 0 ? `${stats.products.lowStock} low stock` : null,
          icon:   Package,
          color:  'text-amber-600',
          bg:     'bg-amber-50 dark:bg-amber-900/20',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-card" />
            ))
          : statCards.map(card => (
              <motion.div
                key={card.label}
                variants={fadeUp}
                className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                  <div className={cn('rounded-xl p-2.5', card.bg)}>
                    <card.icon size={20} className={card.color} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {card.growth !== null && card.growth !== undefined ? (
                    <>
                      {card.growth >= 0 ? (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <ArrowUpRight size={13} /> {card.growth}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
                          <ArrowDownRight size={13} /> {Math.abs(card.growth)}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">vs last month</span>
                    </>
                  ) : card.badge ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle size={12} /> {card.badge}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Revenue Chart */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="lg:col-span-2 rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
              Revenue (Last 7 Days)
            </h2>
            <Badge variant="success" dot>Live</Badge>
          </div>

          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.revenue.chartData ?? []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="rgb(22,163,74)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(22,163,74)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip
                  formatter={(v: number) => [formatPrice(v), 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(22,163,74)"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Orders Pending */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
        >
          <h2 className="mb-5 font-display text-base font-semibold text-gray-900 dark:text-white">
            Order Status
          </h2>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Pending',    value: stats?.orders.byStatus?.pending    ?? 0, color: 'bg-amber-400' },
                { label: 'Processing', value: (stats?.orders.byStatus?.processing ?? 0) + (stats?.orders.byStatus?.confirmed ?? 0), color: 'bg-violet-400' },
                { label: 'Delivered',  value: stats?.orders.byStatus?.delivered   ?? 0, color: 'bg-emerald-400' },
                { label: 'Cancelled',  value: stats?.orders.byStatus?.cancelled   ?? 0, color: 'bg-red-400' },
              ].map(item => {
                const pct = (stats && stats.orders.total > 0) ? (item.value / stats.orders.total) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={cn('h-full rounded-full', item.color)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="rounded-card border border-gray-100 bg-surface shadow-card dark:border-gray-800 dark:bg-surface-raised overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
          <a href="/admin/orders" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            View all
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-surface-raised dark:bg-surface-overlay">
                {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : stats?.recentOrders.map(order => (
                    <tr
                      key={order._id}
                      className="hover:bg-surface-raised dark:hover:bg-surface-overlay transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {(order.user as { name: string })?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(order.user as { email: string })?.email || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center rounded-badge px-2.5 py-1 text-xs font-medium',
                          orderStatusColors[order.status],
                        )}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(order.createdAt.toString())}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
