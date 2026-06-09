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

const footerLinks = {
  Shop: [
    { label: 'All Products',  href: '/shop/products'               },
    { label: 'New Arrivals',  href: '/shop/products?isNew=true'    },
    { label: 'Best Sellers',  href: '/shop/products?sortBy=popular'},
    { label: 'Deals & Offers',href: '/shop/products?onSale=true'   },
  ],
  Help: [
    { label: 'FAQ',             href: '/faq'          },
    { label: 'Shipping Policy', href: '/shipping'     },
    { label: 'Returns',         href: '/returns'      },
    { label: 'Track Order',     href: '/shop/orders'  },
    { label: 'Contact Us',      href: '/contact'      },
  ],
  Company: [
    { label: 'About Us',     href: '/about'    },
    { label: 'Blog',         href: '/blog'     },
    { label: 'Careers',      href: '/careers'  },
    { label: 'Privacy',      href: '/privacy'  },
    { label: 'Terms',        href: '/terms'    },
  ],
}

const Tiktok = ({ size = 24, className = "" }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
)

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
    <footer className="relative mt-24 border-t border-gray-100 bg-surface-raised dark:border-gray-800 dark:bg-gray-950">

      {/* ── Newsletter Banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden bg-primary-600 dark:bg-primary-800">
        <div className="absolute inset-0 opacity-10 bg-noise" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                {t('exclusiveDeals')}
              </h3>
              <p className="mt-1 text-primary-100 text-sm max-w-xs">
                {t('subscribeText')}
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-white font-medium"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</span>
                {t('youreSubscribed')}
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-button border-0 bg-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/60 outline-none focus:bg-white/20 transition-colors"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-white text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 lg:gap-16">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-white font-display font-bold">
                  {storeConfig.name.charAt(0)}
                </span>
              </div>
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
                {storeConfig.name}
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mb-6">
              {storeConfig.tagline}
            </p>

            {/* Contact */}
            <ul className="space-y-2.5">
              {[
                { icon: MapPin,  text: `${contact.address}, ${contact.city}` },
                { icon: Phone,   text: contact.phone                          },
                { icon: Mail,    text: contact.email                          },
                { icon: Clock,   text: contact.workingHours                   },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                  <Icon size={14} className="mt-0.5 shrink-0 text-primary-500" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {Object.entries(social).map(([platform, url]) => {
                const Icon = socialIcons[platform]
                if (!Icon || !url) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary-900/40 dark:hover:text-primary-400 transition-colors"
                  >
                    <Icon size={15} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                      <ArrowRight
                        size={12}
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────── */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between gap-3 px-4 py-5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} {storeConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
