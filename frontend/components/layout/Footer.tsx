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
    { label: 'FAQ',              href: '/faq'          },
    { label: 'Shipping Policy',  href: '/shipping'     },
    { label: 'Returns',          href: '/returns'      },
    { label: 'Track Order',      href: '/shop/orders'  },
    { label: 'Contact Us',       href: '/contact'      },
  ],
  Company: [
    { label: 'About Us', href: '/about'   },
    { label: 'Blog',     href: '/blog'    },
    { label: 'Careers',  href: '/careers' },
    { label: 'Privacy',  href: '/privacy' },
    { label: 'Terms',    href: '/terms'   },
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
    <footer className="relative mt-0 border-t border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#0a0a0a]">

      {/* ── Newsletter Strip ── */}
      <div className="border-b border-gray-100 dark:border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6 bg-gray-200 dark:bg-[#2a2a2a]" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-[#555]">
                  Stay in the loop
                </span>
              </div>
              <h3 className="font-display text-[22px] italic text-gray-900 dark:text-[#e8e0d4] leading-tight">
                Exclusive offers, before anyone else.
              </h3>
              <p className="mt-1.5 text-[12px] font-light text-gray-400 dark:text-[#555] leading-relaxed max-w-xs">
                New drops, seasonal deals, and training tips. Unsubscribe anytime.
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-[12px] text-primary-600 dark:text-[#c8822a] font-light"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center border border-primary-300 dark:border-[#c8822a] text-[10px]">✓</span>
                You're subscribed — check your inbox.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 border border-gray-200 dark:border-[#2a2a2a] bg-transparent px-4 py-3 text-[12px] text-gray-700 dark:text-[#ccc] placeholder:text-gray-300 dark:placeholder:text-[#444] outline-none focus:border-primary-400 dark:focus:border-[#c8822a] transition-colors font-light"
                />
                <button
                  type="submit"
                  className="flex h-[46px] w-12 shrink-0 items-center justify-center bg-primary-600 dark:bg-[#c8822a] text-white hover:opacity-90 transition-opacity"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center bg-primary-600 dark:bg-[#c8822a]">
                <span className="text-white font-display font-semibold text-sm">
                  {storeConfig.name.charAt(0)}
                </span>
              </div>
              <span className="font-display text-[18px] font-normal text-gray-900 dark:text-[#e8e0d4]">
                Doctor<em className="italic text-primary-600 dark:text-[#c8822a]">Fit</em>
              </span>
            </Link>

            <p className="text-[12px] font-light text-gray-400 dark:text-[#555] leading-[1.9] max-w-[200px] mb-6">
              {storeConfig.tagline}
            </p>

            {/* Contact */}
            <ul className="space-y-2.5 mb-6">
              {[
                { icon: MapPin, text: `${contact.address}, ${contact.city}` },
                { icon: Phone,  text: contact.phone                         },
                { icon: Mail,   text: contact.email                         },
                { icon: Clock,  text: contact.workingHours                  },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-[11px] font-light text-gray-400 dark:text-[#555]">
                  <Icon size={12} className="mt-0.5 shrink-0 text-primary-500 dark:text-[#c8822a]" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="flex gap-2.5">
              {Object.entries(social).map(([platform, url]) => {
                const Icon = socialIcons[platform]
                if (!Icon || !url) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center border border-gray-200 dark:border-[#2a2a2a] text-gray-400 dark:text-[#555] hover:border-primary-600 dark:hover:border-[#c8822a] hover:text-primary-600 dark:hover:text-[#c8822a] transition-all duration-200"
                  >
                    <Icon size={13} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-900 dark:text-[#ccc]">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] font-light text-gray-400 dark:text-[#555] hover:text-primary-600 dark:hover:text-[#c8822a] transition-colors"
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
      <div className="border-t border-gray-100 dark:border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 py-5">
          <p className="text-[11px] font-light text-gray-300 dark:text-[#444]">
            © {new Date().getFullYear()} DoctorFit. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-[11px] font-light text-gray-300 dark:text-[#444] hover:text-gray-600 dark:hover:text-[#888] transition-colors"
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
