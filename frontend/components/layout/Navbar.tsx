'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Sun, Moon, Menu, Globe, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/slices/cartStore'
import { useAuthStore } from '@/store/slices/authStore'
import { useUIStore } from '@/store/slices/uiStore'
import { useTheme } from 'next-themes'
import { useTranslation } from '@/hooks/useTranslation'
import { storeConfig } from '@/config/store'

export function Navbar() {
  const { t, lang, setLang } = useTranslation()
  const pathname = usePathname()
  const { itemCount } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { openSearch } = useUIStore()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  const navLinks = [
    { label: t('shop'),   href: '/shop/products' },
    { label: t('deals'),  href: '/shop/products?onSale=true' },
    { label: t('newIn'),  href: '/shop/products?isNew=true' },
    { label: t('about') || 'About',  href: '/about' },
  ]

  return (
    <>
      <nav className="flex items-center justify-between px-7 py-4 border-b border-gray-200 dark:border-gray-800 bg-surface sticky top-0 z-50">
        {/* Logo */}
        <Link href="/" className="font-display text-[20px] tracking-wide text-gray-900 dark:text-gray-100">
          Doctor<em className="italic text-accent">Fit</em>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[12px] font-light tracking-widest uppercase transition-colors duration-200',
                  isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/shop/cart" className="hidden md:flex items-center gap-2 group">
            <span className="text-[11px] font-light tracking-wider text-gray-500 dark:text-gray-400 uppercase">
              {t('cart')} (<span className="text-accent">{itemCount}</span>)
            </span>
          </Link>
          
          <button onClick={openSearch} className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-accent hover:text-accent transition-colors">
            <Search size={15} />
          </button>
          
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hidden md:flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-accent hover:text-accent transition-colors">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="hidden md:flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-accent hover:text-accent transition-colors">
            <Globe size={15} />
          </button>
          
          <Link href={isAuthenticated ? "/shop/profile" : "/auth/login"} className="hidden md:flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-accent hover:text-accent transition-colors">
            <User size={15} />
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex md:hidden h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:border-accent hover:text-accent transition-colors">
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-surface border-b border-gray-200 dark:border-gray-800 sticky top-[67px] z-40"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-sm tracking-widest uppercase text-gray-600 dark:text-gray-300">
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/shop/cart" className="text-sm tracking-widest uppercase text-gray-600 dark:text-gray-300">
                  {t('cart')} (<span className="text-accent">{itemCount}</span>)
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500">
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                  <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500">
                    <Globe size={15} />
                  </button>
                  <Link href={isAuthenticated ? "/shop/profile" : "/auth/login"} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500">
                    <User size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
