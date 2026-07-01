import React from 'react';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';

const Tiktok = ({ size = 18, fill = "#000000", className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="none" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.12-.96 4.16-2.45 5.64-1.62 1.61-3.9 2.53-6.19 2.45-2.44-.09-4.72-1.22-6.17-3.04-1.34-1.69-1.93-3.87-1.74-5.99.2-2.12 1.19-4.11 2.78-5.55 1.63-1.48 3.84-2.26 6.03-2.17 0 1.4-.01 2.8 0 4.2-.97-.04-1.95.14-2.83.6-1.17.61-2.07 1.72-2.31 3.03-.25 1.37.1 2.84.97 3.9 1.05 1.28 2.82 1.8 4.39 1.34 1.54-.45 2.68-1.8 2.88-3.39.04-.32.06-.65.06-.97.02-6.68.01-13.36.01-20.04z"/>
  </svg>
)

const Whatsapp = ({ size = 18, className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#25D366" stroke="none" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const Facebook = ({ size = 18, className = '' }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" stroke="none" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

interface FooterProps {
  activeColor: string;
}

export function Footer({ activeColor }: FooterProps) {
  return (
    <footer 
      className="w-full text-gray-900 py-16 px-6 sm:px-12 md:px-24 flex flex-col font-sans border-t border-black/5 relative z-10 transition-colors duration-700"
      style={{
        background: `linear-gradient(rgba(255, 255, 255, 0.80), rgba(255, 255, 255, 0.80)), ${activeColor}`
      }}
    >
      
      {/* Newsletter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black/10 pb-12 mb-12 gap-8">
        <div className="max-w-md">
          <span className="inline-block border border-black/20 text-xs px-3 py-1 rounded-full mb-4 tracking-wider font-semibold text-black/70">
            Newsletter
          </span>
          <h2 className="text-3xl font-anton uppercase tracking-wide mb-2 text-black">
            Get exclusive deals & fitness tips
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            New products, seasonal offers, and training tips. Unsubscribe anytime.
          </p>
        </div>
        
        <div className="flex w-full md:w-auto relative max-w-md flex-1">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full bg-white/60 border border-black/10 text-gray-900 placeholder:text-gray-500 text-sm px-6 py-4 rounded-full focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
          />
          <button 
            className="absolute right-1 top-1 bottom-1 px-6 rounded-full text-white font-medium text-sm flex items-center gap-2 hover:brightness-110 transition-all duration-500 shadow-md"
            style={{ backgroundColor: activeColor }}
          >
            <Send size={16} />
            Subscribe
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-4 mb-16">
        
        {/* Brand Col */}
        <div className="col-span-1 md:col-span-2">
          <div className="mb-6">
            <BrandLogo />
          </div>
          <p className="text-sm text-gray-600 mb-8 max-w-sm leading-relaxed font-medium">
            Premium fitness products, delivered fast.
          </p>
          
          <ul className="space-y-3 text-sm text-gray-600 font-medium">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-500" />
              5th Settlement, Cairo
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gray-500" />
              +20 103 040 9766
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gray-500" />
              doctorfit@gmail.com
            </li>
            <li className="flex items-center gap-3">
              <Clock size={16} className="text-gray-500" />
              24/7
            </li>
          </ul>

          <div className="flex items-center gap-5 mt-8">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform shadow-sm rounded-full">
              <Facebook size={36} />
            </a>
            <a href="https://tiktok.com/@doctorfit" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-black flex items-center justify-center hover:scale-110 transition-transform shadow-sm rounded-full">
              <Tiktok size={20} fill="#ffffff" />
            </a>
            <a href="https://wa.me/201030409766" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform shadow-sm rounded-full">
              <Whatsapp size={36} />
            </a>
          </div>
        </div>

        {/* Links Cols */}
        <div>
          <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-black">Shop</h3>
          <ul className="space-y-4 text-sm text-gray-600 font-medium">
            <li><Link href="/shop/products" className="hover:text-black transition-colors">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-black">Help</h3>
          <ul className="space-y-4 text-sm text-gray-600 font-medium">
            <li><Link href="/shop/orders" className="hover:text-black transition-colors">Track Order</Link></li>
            <li><Link href="/shop/profile" className="hover:text-black transition-colors">My Account</Link></li>
            <li><Link href="/shop/wishlist" className="hover:text-black transition-colors">My Wishlist</Link></li>
            <li><Link href="/shop/cart" className="hover:text-black transition-colors">Shopping Cart</Link></li>
          </ul>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/10 text-xs text-gray-500 font-medium gap-4">
        <p>© 2026 DoctorFit. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/shop/products" className="hover:text-black transition-colors">Products</Link>
          <Link href="/shop/orders" className="hover:text-black transition-colors">Orders</Link>
        </div>
      </div>
    </footer>
  );
}
