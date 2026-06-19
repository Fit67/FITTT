'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Instagram, Facebook, Twitter, Youtube,
  MapPin, Phone, Mail, Clock, Send,
  ArrowRight,
} from 'lucide-react'
import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { useTranslation } from '@/hooks/useTranslation'

const Tiktok = ({ size = 18, className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const footerLinks = {
  Shop: [
    { label: 'All Products',   href: '/shop/products'                },
    { label: 'New Arrivals',   href: '/shop/products?isNew=true'     },
    { label: 'Best Sellers',   href: '/shop/products?sortBy=popular' },
    { label: 'Deals & Offers', href: '/shop/products?onSale=true'    },
  ],
  Help: [
    { label: 'Track Order',      href: '/shop/orders'                },
    { label: 'My Account',       href: '/shop/profile'               },
    { label: 'My Wishlist',      href: '/shop/wishlist'               },
    { label: 'Shopping Cart',    href: '/shop/cart'                   },
  ],
  Categories: [
    { label: 'Protein',       href: '/shop/products?category=protein'    },
    { label: 'Creatine',      href: '/shop/products?category=creatine'   },
    { label: 'Pre-Workout',   href: '/shop/products?category=pre-workout'},
    { label: 'Vitamins',      href: '/shop/products?category=vitamins'   },
  ],
}

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook:  Facebook,
  twitter:   Twitter,
  youtube:   Youtube,
  tiktok:    Tiktok,
}

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)
  const { social, contact } = storeConfig

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="relative mt-0 bg-gray-900 dark:bg-black text-gray-300">

      {/* ── Newsletter Strip ── */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 text-xs font-medium border border-gray-600 rounded-full text-gray-400 mb-4">
                Newsletter
              </span>
              <h3 className="font-display text-2xl font-bold text-white leading-tight">
                Get exclusive deals & fitness tips
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm">
                New products, seasonal offers, and training tips. Unsubscribe anytime.
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-sm text-green-400 font-medium"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center bg-green-900/30 rounded-full text-green-400">✓</span>
                You&apos;re subscribed — check your inbox.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 border border-gray-700 bg-gray-800/50 rounded-l-full px-5 py-3.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="submit"
                  className="flex h-[50px] px-6 shrink-0 items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-r-full transition-colors font-medium text-sm gap-2"
                >
                  <Send size={14} />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center bg-red-600 rounded-lg">
                <span className="text-white font-display font-bold text-base">D</span>
              </div>
              <span className="font-display text-xl font-bold text-white tracking-wider">
                DoctorFit
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-[240px] mb-6">
              {storeConfig.tagline}
            </p>

            {/* Contact */}
            <ul className="space-y-3 mb-6">
              {[
                { icon: MapPin, text: `${contact.address}, ${contact.city}` },
                { icon: Phone,  text: contact.phone                         },
                { icon: Mail,   text: contact.email                         },
                { icon: Clock,  text: contact.workingHours                  },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-400">
                  <Icon size={14} className="mt-0.5 shrink-0 text-red-400" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="flex gap-3">
              {Object.entries(social).map(([platform, url]) => {
                const Icon = socialIcons[platform]
                if (!Icon || !url) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-full transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 py-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DoctorFit. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/shop/products" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Products</Link>
            <Link href="/shop/orders" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Orders</Link>
            <Link href="/shop/profile" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
