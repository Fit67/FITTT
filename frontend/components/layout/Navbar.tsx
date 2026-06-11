'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, Menu, User, LogOut,
  Sun, Moon, Package, ChevronDown, LayoutDashboard, Facebook, Instagram,
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

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  const navLinks = [
    { label: t('shop'),   href: '/shop/products' },
    { label: t('deals'),  href: '/shop/products?onSale=true' },
    { label: t('newIn'), href: '/shop/products?isNew=true' },
  ]

  return (
    <motion.header
      animate={{ backgroundColor: scrolled ? 'var(--bg)' : 'transparent' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-shadow duration-300',
        scrolled
          ? '[--bg:rgba(255,255,255,0.95)] dark:[--bg:rgba(15,10,0,0.95)] backdrop-blur-md shadow-sm border-b border-gray-100/80 dark:border-primary-900/30'
          : '[--bg:transparent]',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-white font-display font-bold text-sm">
              {storeConfig.name.charAt(0)}
            </span>
          </div>
          <span className="font-display font-bold text-gray-900 dark:text-white hidden sm:block">
            {storeConfig.name}
          </span>
        </Link>

        {/* ── Desktop Nav ────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Social Links (Desktop) */}
          <div className="hidden md:flex items-center gap-2 mr-4 border-r border-gray-200 dark:border-gray-800 pr-4">
            <a href={storeConfig.social?.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
              <Facebook size={18} />
            </a>
            <a href={storeConfig.social?.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
              <Instagram size={18} />
            </a>
            <a href={storeConfig.social?.tiktok} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
              <Tiktok size={18} />
            </a>
          </div>

          {/* Search */}
          <button
            onClick={openSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <Search size={18} />
          </button>

          {/* Wishlist */}
          {storeConfig.enableWishlist && (
            <Link
              href="/shop/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                >
                  {wishlist.length > 9 ? '9+' : wishlist.length}
                </motion.span>
              )}
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/shop/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart size={18} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{   scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Globe size={17} />
          </button>

          {/* Dark mode */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              <AnimatePresence>
                {userOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{    opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-20 w-56 rounded-card bg-surface shadow-modal border border-gray-100 dark:bg-surface-raised dark:border-gray-800 overflow-hidden py-1"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>

                      {[
                        { icon: User,           label: 'My Profile',  href: '/shop/profile'       },
                        { icon: Package,        label: 'My Orders',   href: '/shop/orders'         },
                        { icon: Heart,          label: 'Wishlist',    href: '/shop/wishlist'        },
                        ...(user?.role !== 'customer'
                          ? [{ icon: LayoutDashboard, label: 'Admin Panel', href: '/admin/dashboard' }]
                          : []),
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <item.icon size={15} className="text-gray-400" />
                          {item.label}
                        </Link>
                      ))}

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                        <button
                          onClick={() => { setUserOpen(false); logout() }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 dark:border-gray-800 mt-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <button
                  onClick={() => { setMenuOpen(false); setTheme(theme === 'dark' ? 'light' : 'dark') }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
              
              <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                <button
                  onClick={() => { setMenuOpen(false); setLang(lang === 'en' ? 'ar' : 'en') }}
                  className="flex h-8 items-center justify-center rounded-full bg-gray-100 px-3 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {lang === 'en' ? 'عربي' : 'English'}
                </button>
              </div>
              {!isAuthenticated ? (
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <Link href="/auth/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" fullWidth size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button fullWidth size="sm">Register</Button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); logout() }}
                  className="flex items-center gap-2 px-3 py-2.5 mt-2 text-sm text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-800"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
