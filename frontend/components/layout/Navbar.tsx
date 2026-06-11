'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, useSpring } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, Menu, User, LogOut,
  Sun, Moon, Package, ChevronDown, LayoutDashboard, Facebook, Instagram, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useAuthStore } from '@/store/slices/authStore'
import { useWishlistStore, useUIStore } from '@/store/slices/uiStore'
import { Avatar } from '@/components/ui/primitives'
import { storeConfig } from '@/config/store'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { Globe } from 'lucide-react'

const Tiktok = ({ size = 18, className = "" }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
)

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.7 }

export function Navbar() {
  const { t, lang, setLang } = useTranslation()
  const pathname              = usePathname()
  const { itemCount }         = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items: wishlist }   = useWishlistStore()
  const { openSearch }        = useUIStore()
  const { theme, setTheme }   = useTheme()
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const { scrollY }           = useScroll()

  // Smooth scroll-linked blur amount
  const rawBlur  = useTransform(scrollY, [0, 60], [0, 12])
  const blurSpring = useSpring(rawBlur, { stiffness: 200, damping: 30 })

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  // Close menu on route change
  React.useEffect(() => {
    setMenuOpen(false)
    setUserOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  const navLinks = [
    { label: t('shop'),   href: '/shop/products' },
    { label: t('deals'),  href: '/shop/products?onSale=true' },
    { label: t('newIn'),  href: '/shop/products?isNew=true' },
  ]

  return (
    <>
      <motion.header
        style={{
          backdropFilter: scrolled ? `blur(${blurSpring.get()}px)` : 'none',
          WebkitBackdropFilter: scrolled ? `blur(${blurSpring.get()}px)` : 'none',
        }}
        animate={{
          backgroundColor: scrolled
            ? 'rgba(255,255,255,0.72)'
            : 'transparent',
          borderBottomColor: scrolled
            ? 'rgba(255,255,255,0.18)'
            : 'transparent',
          boxShadow: scrolled
            ? '0 4px 30px rgba(0,0,0,0.04)'
            : 'none',
        }}
        transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1.0] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b dark:[background-color:transparent]',
          scrolled && 'dark:[background-color:rgba(10,10,11,0.72)]',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.94 }}
              transition={SPRING}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm shadow-primary-500/30"
              style={{ willChange: 'transform' }}
            >
              <span className="text-white font-display font-bold text-sm">
                {storeConfig.name.charAt(0)}
              </span>
            </motion.div>
            <span className="font-display font-bold text-gray-900 dark:text-white hidden sm:block transition-colors">
              {storeConfig.name}
            </span>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href.split('?')[0])
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-colors duration-200',
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  )}
                >
                  {/* Active pill background */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-primary-50 dark:bg-primary-900/30"
                      transition={SPRING}
                    />
                  )}
                  {/* Hover background (not active) */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-gray-800 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* ── Actions ────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Social Links (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-4 border-r border-gray-200 dark:border-gray-800 pr-4">
              {storeConfig.social?.facebook && (
                <motion.a
                  href={storeConfig.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING}
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Facebook size={17} />
                </motion.a>
              )}
              {storeConfig.social?.instagram && (
                <motion.a
                  href={storeConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING}
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Instagram size={17} />
                </motion.a>
              )}
            </div>

            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING}
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
              aria-label="Search"
              style={{ willChange: 'transform' }}
            >
              <Search size={18} />
            </motion.button>

            {/* Wishlist */}
            {storeConfig.enableWishlist && (
              <Link href="/shop/wishlist">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={SPRING}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                  style={{ willChange: 'transform' }}
                >
                  <Heart size={18} />
                  <AnimatePresence>
                    {wishlist.length > 0 && (
                      <motion.span
                        key="wishlist-badge"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
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
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                style={{ willChange: 'transform' }}
              >
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={SPRING}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white shadow-sm shadow-primary-500/40"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
              style={{ willChange: 'transform' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Sun size={17} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Moon size={17} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Language toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING}
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle language"
            >
              <Globe size={17} />
            </motion.button>

            {/* User menu */}
            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {isAuthenticated && user ? (
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="xs"
                  />
                ) : (
                  <User size={17} />
                )}
                <motion.div
                  animate={{ rotate: userOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={13} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.0, 0.0, 0.2, 1.0] }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl dark:border-gray-800 dark:bg-gray-900/95 overflow-hidden"
                    style={{ transformOrigin: 'top right' }}
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150">
                            <LayoutDashboard size={15} />
                            Dashboard
                          </Link>
                        )}
                        <Link href="/shop/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150">
                          <User size={15} />
                          {t('profile')}
                        </Link>
                        <Link href="/shop/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150">
                          <Package size={15} />
                          {t('myOrders')}
                        </Link>
                        <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                          <button
                            onClick={logout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                          >
                            <LogOut size={15} />
                            {t('logout')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150">
                          <User size={15} />
                          {t('login')}
                        </Link>
                        <Link href="/auth/register" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-150 font-medium">
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
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING}
              onClick={() => setMenuOpen(v => !v)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
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

        {/* ── Mobile drawer ──────────────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.0, 0.0, 0.2, 1.0] }}
              className="overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.22 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                        pathname === link.href
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-2 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                  </button>
                  <button
                    onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Globe size={17} />
                  </button>
                  {!isAuthenticated && (
                    <Link href="/auth/login" className="ml-auto">
                      <Button size="sm" variant="outline">{t('login')}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Click-outside overlay for user dropdown */}
      {userOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserOpen(false)}
        />
      )}
    </>
  )
}
