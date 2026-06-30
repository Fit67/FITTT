import React from 'react';
import { Send, Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

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
          <h1 className="text-2xl font-anton uppercase tracking-[0.2em] mb-6 flex items-center">
            <span className="text-black">DOCTOR</span><span className="text-white">FIT</span>
          </h1>
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

          <div className="flex items-center gap-4 mt-8">
            <a href="#" className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm">
              <Twitter size={18} />
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
