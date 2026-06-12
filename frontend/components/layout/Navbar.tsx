'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, Menu, User, LogOut,
  Sun, Moon, Package, ChevronDown, LayoutDashboard, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useAuthStore } from '@/store/slices/authStore'
import { useWishlistStore, useUIStore } from '@/store/slices/uiStore'
import { Avatar } from '@/components/ui/primitives'
import { storeConfig } from '@/config/store'
import { useTheme } from 'next-themes'
import { useTranslation } from '@/hooks/useTranslation'
import { Globe } from 'lucide-react'

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.7 }

export function Navbar() {
  const { t, lang, setLang } = useTranslation()
  const pathname             = usePathname()
  const { itemCount }        = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items: wishlist }  = useWishlistStore()
  const { openSearch }       = useUIStore()
  const { theme, setTheme }  = useTheme()
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  React.useEffect(() => {
    setMenuOpen(false)
    setUserOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  const navLinks = [
    { label: t('shop'),  href: '/shop/products' },
    { label: t('deals'), href: '/shop/products?onSale=true' },
    { label: t('newIn'), href: '/shop/products?isNew=true' },
    { label: 'About',   href: '/about' },
  ]

  // ── Light scrolled: white translucent | Dark: #0a0a0a translucent
  const lightBg  = scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0)'
  const darkBg   = scrolled ? 'rgba(10,10,10,0.88)'    : 'rgba(10,10,10,0)'

  return (
    <>
      <motion.header
        animate={{
          borderBottomColor: scrolled ? 'var(--border-default, rgba(0,0,0,.08))' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,.06)' : 'none',
        }}
        transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1.0] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-200',
          'bg-white/0 dark:bg-[rgba(10,10,10,0)] backdrop-blur-md',
          scrolled && 'bg-white/88 dark:bg-[rgba(10,10,10,0.88)]',
        )}
      >
        <div className="mx-auto flex h-[62px] max-w-7xl items-center justify-between px-4 md:px-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center bg-primary-600 dark:bg-[#c8822a]">
              <span className="text-white font-display font-semibold text-sm leading-none">
                {storeConfig.name.charAt(0)}
              </span>
            </div>
            <span className="font-display font-normal text-[18px] text-gray-900 dark:text-[#e8e0d4] hidden sm:block tracking-[0.01em]">
              Doctor<em className="italic text-primary-600 dark:text-[#c8822a] not-italic">Fit</em>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href.split('?')[0])
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-[11px] font-normal uppercase tracking-[0.1em] py-1',
                    'transition-colors duration-200',
                    isActive
                      ? 'text-primary-600 dark:text-[#c8822a]'
                      : 'text-gray-500 hover:text-gray-900 dark:text-[#666] dark:hover:text-[#e8e0d4]',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary-600 dark:bg-[#c8822a]"
                      transition={SPRING}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-0.5">

            {/* Cart count label (desktop) */}
            <span className="hidden md:block text-[11px] font-light tracking-[0.04em] text-gray-400 dark:text-[#666] mr-3">
              Cart (<span className="text-primary-600 dark:text-[#c8822a]">{itemCount}</span>)
            </span>

            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-[#666] dark:hover:text-[#e8e0d4] transition-colors"
              aria-label="Search"
            >
              <Search size={17} />
            </motion.button>

            {/* Wishlist */}
            {storeConfig.enableWishlist && (
              <Link href="/shop/wishlist">
                <motion.div
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                  className="relative flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-[#666] dark:hover:text-[#e8e0d4] transition-colors cursor-pointer"
                >
                  <Heart size={17} />
                  <AnimatePresence>
                    {wishlist.length > 0 && (
                      <motion.span
                        key="wb"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={SPRING}
                        className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                      >
                        {wishlist.length > 9 ? '9+' : wishlist.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )}

            {/* Cart */}
            <Link href="/shop/cart">
              <motion.div
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                className="relative flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-[#666] dark:hover:text-[#e8e0d4] transition-colors cursor-pointer"
              >
                <ShoppingCart size={17} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cb"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={SPRING}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-primary-600 dark:bg-[#c8822a] text-[9px] font-bold text-white"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex h-9 w-9 items-center justify-center text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Sun size={16} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Moon size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Language toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hidden md:flex h-9 w-9 items-center justify-center text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={16} />
            </motion.button>

            {/* User menu */}
            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] transition-colors"
              >
                {isAuthenticated && user ? (
                  <Avatar src={user.avatar} name={user.name} size="xs" />
                ) : (
                  <User size={16} />
                )}
                <motion.div animate={{ rotate: userOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={12} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 w-52 border border-gray-100 bg-white/98 backdrop-blur-xl shadow-xl dark:border-[#1e1e1e] dark:bg-[#0a0a0a]/98 overflow-hidden"
                    style={{ transformOrigin: 'top right' }}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="border-b border-gray-100 dark:border-[#1e1e1e] px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-[#e8e0d4] truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 dark:text-[#555] truncate mt-0.5">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-[#888] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                            <LayoutDashboard size={14} /> Dashboard
                          </Link>
                        )}
                        <Link href="/shop/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-[#888] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                          <User size={14} /> {t('profile')}
                        </Link>
                        <Link href="/shop/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-[#888] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                          <Package size={14} /> {t('myOrders')}
                        </Link>
                        <div className="border-t border-gray-100 dark:border-[#1e1e1e] mt-1">
                          <button
                            onClick={logout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut size={14} /> {t('logout')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-[#888] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                          <User size={14} /> {t('login')}
                        </Link>
                        <Link href="/auth/register" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-[#c8822a] hover:bg-primary-50 dark:hover:bg-[#111] transition-colors">
                          {t('createAccount')}
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} transition={SPRING}
              onClick={() => setMenuOpen(v => !v)}
              className="flex md:hidden h-9 w-9 items-center justify-center text-gray-600 dark:text-[#666] transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={18} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.0, 0.0, 0.2, 1.0] }}
              className="overflow-hidden border-t border-gray-100/60 bg-white/96 backdrop-blur-xl dark:border-[#1e1e1e] dark:bg-[#0a0a0a]/96 md:hidden"
            >
              <div className="flex flex-col px-4 py-3 gap-0.5">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors',
                        pathname === link.href
                          ? 'text-primary-600 dark:text-[#c8822a]'
                          : 'text-gray-600 hover:text-gray-900 dark:text-[#666] dark:hover:text-[#e8e0d4]',
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-2 flex items-center gap-2 border-t border-gray-100 dark:border-[#1e1e1e] pt-3">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex h-9 w-9 items-center justify-center text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#e8e0d4] transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button
                    onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                    className="flex h-9 w-9 items-center justify-center text-gray-500 dark:text-[#666] transition-colors"
                  >
                    <Globe size={16} />
                  </button>
                  {!isAuthenticated && (
                    <Link href="/auth/login" className="ml-auto text-[11px] uppercase tracking-[0.1em] text-primary-600 dark:text-[#c8822a] py-2 px-3 border border-current">
                      {t('login')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {userOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
      )}
    </>
  )
}
