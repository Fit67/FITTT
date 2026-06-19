'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, Menu, User, LogOut,
  Sun, Moon, Package, ChevronDown, LayoutDashboard, X,
  Globe, Facebook, Instagram, Youtube, Twitter, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useAuthStore } from '@/store/slices/authStore'
import { useWishlistStore, useUIStore } from '@/store/slices/uiStore'
import { Avatar } from '@/components/ui/primitives'
import { storeConfig } from '@/config/store'
import { useTheme } from 'next-themes'
import { useTranslation } from '@/hooks/useTranslation'

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.7 }

export function Navbar() {
  const { t, lang, setLang } = useTranslation()
  const pathname             = usePathname()
  const { itemCount }        = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items: wishlist }  = useWishlistStore()
  const { openSearch }       = useUIStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const { scrollY } = useScroll()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  React.useEffect(() => {
    setMenuOpen(false)
    setUserOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  const navLinks = [
    { label: lang === 'en' ? 'Home' : 'الرئيسية',           href: '/' },
    { label: lang === 'en' ? 'Products' : 'المنتجات',       href: '/shop/products' },
    { label: lang === 'en' ? 'Whats Included' : 'ماذا تشمل', href: '/shop/products?category=protein' },
    { label: lang === 'en' ? 'Treatmtent +' : 'العلاجات +',   href: '/shop/products?category=creatine' },
    { label: lang === 'en' ? 'Lab Tests' : 'التحاليل',       href: '/shop/products?category=vitamins' },
    { label: lang === 'en' ? 'Contact Us' : 'اتصل بنا',     href: storeConfig.social.whatsapp || '/shop/products' },
  ]

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="bg-[#C0392B] text-white text-[11px] h-9 flex items-center relative z-[51] font-sans">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center justify-between">
          {/* Left: Social Media Icons */}
          <div className="hidden md:flex items-center gap-3 text-white/90">
            <a href={storeConfig.social.facebook || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={12} strokeWidth={2} />
            </a>
            <a href={storeConfig.social.instagram || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={12} strokeWidth={2} />
            </a>
           
            <a href={storeConfig.social.whatsapp || 'https://whatsapp.com'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Notifications">
              <Bell size={12} strokeWidth={2} />
            </a>
          </div>
          {/* Center: Offer text */}
          <div className="flex-1 text-center italic tracking-wide text-white/95">
            DoctorFit is your home store for purchases!
          </div>
          {/* Right: Language / Region selector (toggles language on click) */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hidden md:flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'en' ? 'English' : 'العربية'}</span>
            <ChevronDown size={10} />
          </button>
        </div>
      </div>

      {/* ── Main Header (Sticky/Absolute Overlay to remove gap) ── */}
      <motion.header
        className={cn(
          'left-0 right-0 z-50 bg-transparent transition-all duration-300',
          scrolled
            ? 'fixed top-0'
            : pathname === '/'
              ? 'absolute top-9'
              : 'relative'
        )}
      >
        {/* Floating pill container wrapper */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
          <div className="flex h-[72px] items-center justify-between px-6 rounded-full bg-black/85 dark:bg-black/90 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            
            {/* Logo */}
            <Link href="/" className="font-display font-extrabold text-xl text-white tracking-wider shrink-0">
              DoctorFit
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map(link => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.split('?')[0])
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'relative text-xs font-semibold uppercase tracking-wider py-1 transition-colors duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white',
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"
                        transition={SPRING}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Actions Block */}
            <div className="flex items-center gap-1 text-white">

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Search"
              >
                <Search size={16} />
              </motion.button>

              {/* Wishlist */}
              {storeConfig.enableWishlist && (
                <Link href="/shop/wishlist">
                  <motion.div
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                    className="relative flex h-9 w-9 items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
                  >
                    <Heart size={16} />
                    <AnimatePresence>
                      {wishlist.length > 0 && (
                        <motion.span
                          key="wb"
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          transition={SPRING}
                          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-650 text-[9px] font-bold text-white"
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
                  className="relative flex h-9 w-9 items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
                >
                  <ShoppingCart size={16} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key="cb"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={SPRING}
                        className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-650 text-[9px] font-bold text-white"
                      >
                        {itemCount > 99 ? '99+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Theme toggle */}
              {mounted && (
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="hidden md:flex h-9 w-9 items-center justify-center text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {resolvedTheme === 'dark' ? (
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
              )}

              {/* User menu / Login button */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
                    onClick={() => setUserOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    {user ? (
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
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/95 shadow-xl overflow-hidden z-50 text-gray-200"
                        style={{ transformOrigin: 'top right' }}
                      >
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                        )}
                        <Link href="/shop/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                          <User size={15} /> {t('profile')}
                        </Link>
                        <Link href="/shop/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                          <Package size={15} /> {t('myOrders')}
                        </Link>
                        <div className="border-t border-white/10 mt-1">
                          <button
                            onClick={logout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut size={15} /> {t('logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:inline-flex items-center justify-center px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 uppercase tracking-wider"
                >
                  Log In
                </Link>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} transition={SPRING}
                onClick={() => setMenuOpen(v => !v)}
                className="flex md:hidden h-9 w-9 items-center justify-center text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
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
                className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl md:hidden"
              >
                <div className="flex flex-col px-4 py-4 gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                          pathname === link.href
                            ? 'text-red-500 bg-white/10'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-4">
                    {mounted && (
                      <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="flex h-9 w-9 items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                      >
                        {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                      className="flex h-9 w-9 items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                      <Globe size={16} />
                    </button>
                    {!isAuthenticated && (
                      <Link
                        href="/auth/login"
                        className="ml-auto text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-full transition-colors uppercase tracking-wider"
                      >
                        {t('login')}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {userOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
      )}
    </>
  )
}
