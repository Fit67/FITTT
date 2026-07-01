'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Facebook, Youtube,
  MapPin, Phone, Mail, Clock, Send,
  ArrowRight,
} from 'lucide-react'
import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { BrandLogo } from '@/components/brand/BrandLogo'

const Tiktok = ({ size = 18, className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const Whatsapp = ({ size = 18, className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const footerLinks = {
  Shop: {
    key: 'shop' as const,
    links: [
      { labelKey: 'footerLinkAllProducts' as const,   href: '/shop/products'                },
    ]
  },
  Help: {
    key: 'help' as const,
    links: [
      { labelKey: 'footerLinkTrackOrder' as const,      href: '/shop/orders'                },
      { labelKey: 'footerLinkMyAccount' as const,       href: '/shop/profile'               },
      { labelKey: 'footerLinkMyWishlist' as const,      href: '/shop/wishlist'               },
      { labelKey: 'footerLinkShoppingCart' as const,    href: '/shop/cart'                   },
    ]
  },
}

const socialIcons: Record<string, React.ElementType> = {
  facebook:  Facebook,
  youtube:   Youtube,
  tiktok:    Tiktok,
  whatsapp:  Whatsapp,
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
    <footer 
      className="relative mt-0 text-gray-900 transition-colors duration-700 font-sans"
      style={{
        background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), ${storeConfig.primaryColor}`
      }}
    >

      {/* ── Newsletter Strip ── */}
      <div className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 text-xs font-semibold border border-black/20 rounded-full text-black/70 tracking-wider mb-4">
                {t('footerNewsletter')}
              </span>
              <h3 className="font-anton uppercase tracking-wide text-3xl font-bold text-black leading-tight">
                {t('footerNewsletterTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed max-w-sm">
                {t('footerNewsletterDesc')}
              </p>
            </div>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 text-sm text-green-700 font-medium"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center bg-green-100 rounded-full text-green-700">✓</span>
                {t('footerSubscribedText')}
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0 relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 border border-black/10 bg-white/60 rounded-full px-6 py-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-black/30 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-6 flex shrink-0 items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors font-medium text-sm gap-2 shadow-md"
                >
                  <Send size={14} />
                  {t('footerSubscribeBtn')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="mb-6 flex items-center">
              <BrandLogo imageClassName="h-20 max-w-[190px]" />
            </Link>

            <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-[240px] mb-6">
              {storeConfig.tagline}
            </p>

            {/* Contact */}
            <ul className="space-y-3 mb-6 text-sm text-gray-600 font-medium">
              {[
                { icon: MapPin, text: `${contact.address}, ${contact.city}` },
                { icon: Phone,  text: contact.phone                         },
                { icon: Mail,   text: contact.email                         },
                { icon: Clock,  text: contact.workingHours                  },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={14} className="mt-0.5 shrink-0 text-gray-500" />
                  {text}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-8">
              {Object.entries(social).map(([platform, url]) => {
                const Icon = socialIcons[platform]
                if (!Icon || !url) return null
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center bg-white/80 border border-black/5 hover:bg-black hover:text-white rounded-full transition-all duration-200 shadow-sm text-gray-800"
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([sectionName, sectionData]) => (
            <div key={sectionName}>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-black">
                {t(sectionData.key)}
              </h4>
              <ul className="space-y-4 text-sm text-gray-600 font-medium">
                {sectionData.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-black transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 px-4 md:px-6 py-6">
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} {storeConfig.name}. {t('footerCopyright')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <Link href="/shop/products" className="text-gray-500 hover:text-black transition-colors">Products</Link>
            <Link href="/shop/orders" className="text-gray-500 hover:text-black transition-colors">Orders</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
