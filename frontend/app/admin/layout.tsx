'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Image, Settings, LogOut, Menu, X,
  ChevronRight, Sun, Moon, Bell,
} from 'lucide-react'
import { useAuthStore } from '@/store/slices/authStore'
import { useTheme } from 'next-themes'
import { Avatar, Badge } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { storeConfig } from '@/config/store'
import { ThemeApplier } from '@/components/providers/ThemeApplier'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/admin/dashboard' },
  { icon: ShoppingBag,     label: 'Orders',     href: '/admin/orders',   badge: 'pending' },
  { icon: Package,         label: 'Products',   href: '/admin/products'  },
  { icon: Users,           label: 'Customers',  href: '/admin/users'     },
  { icon: Tag,             label: 'Coupons',    href: '/admin/coupons'   },
  { icon: Image,           label: 'Banners',    href: '/admin/banners'   },
  { icon: Settings,        label: 'Settings',   href: '/admin/settings'  },
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()

  return (
    <aside className={cn(
      'flex h-screen flex-col border-r border-gray-100 bg-surface dark:border-gray-800 dark:bg-gray-950',
      'transition-all duration-300',
      collapsed ? 'w-16' : 'w-60',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-xs font-bold text-white">{storeConfig.name.charAt(0)}</span>
            </div>
            <span className="font-display text-sm font-bold text-gray-900 dark:text-white truncate">
              {storeConfig.name}
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={16} className={cn('transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'admin-nav-link',
                active ? 'admin-nav-link-active' : 'admin-nav-link-inactive',
                collapsed && 'justify-center px-2',
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'admin-nav-link admin-nav-link-inactive w-full',
            collapsed && 'justify-center px-2',
          )}
        >
          {theme === 'dark'
            ? <Sun  size={18} className="shrink-0" />
            : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span>Toggle Theme</span>}
        </button>

        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>

        {!collapsed && user && (
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-surface-raised dark:bg-surface-overlay px-3 py-2.5">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed]     = React.useState(false)
  const [mobileOpen, setMobileOpen]   = React.useState(false)
  const [notifOpen, setNotifOpen]     = React.useState(false)
  const notifRef = React.useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn:  () => apiClient.get<{ success: true; data: { notifications: Array<{ id: string; type: string; title: string; message: string; createdAt: string }>; counts: { total: number } } }>('/admin/notifications').then(r => r.data.data),
    refetchInterval: 60_000,
  })

  const notifCount = notifData?.counts.total ?? 0
  const notifications = notifData?.notifications ?? []

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <ThemeApplier />
      <div className="flex h-screen overflow-hidden bg-surface-raised dark:bg-gray-900">

        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
              >
                <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-surface px-4 dark:border-gray-800 dark:bg-gray-950 md:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bell size={16} />
                  {notifCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                      {notifCount > 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          {notifCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                      {notifications.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">No new notifications</p>
                      ) : notifications.map(n => (
                        <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className={cn(
                            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                            n.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                               : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                          )}>
                            {n.type === 'order' ? '📦' : '⚠️'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
                      <Link
                        href="/admin/orders"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        View all orders →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                ← View Store
              </Link>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
