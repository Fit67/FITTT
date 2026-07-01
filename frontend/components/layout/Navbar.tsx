'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Heart, User, LogOut, Settings, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/slices/cartStore'
import { useWishlistStore } from '@/store/slices/uiStore'
import { useAuthStore } from '@/store/slices/authStore'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCartStore()
  const { items: wishlist } = useWishlistStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mounted, setMounted] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null
  
  const isHome = pathname === '/'
  const textColor = isHome ? 'text-white' : 'text-gray-900 dark:text-white'
  const textShadow = isHome ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'

  return (
    <nav
      className="fixed top-6 left-4 right-4 sm:left-10 sm:right-10 h-16 sm:h-20 flex items-center justify-between px-6 sm:px-8 pointer-events-auto rounded-[2.5rem]"
      style={{
        zIndex: 100,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.4)',
        borderLeft: '1px solid rgba(255,255,255,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Left: Cart & Favorites */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <Link 
          href="/shop/products" 
          className="text-sm font-bold uppercase tracking-wider hover:text-red-600 transition-colors hidden sm:block me-2"
          style={{ textShadow }}
        >
          Shop
        </Link>
        <Link href="/shop/cart" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-blue-900 hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.15)] relative">
          <ShoppingCart size={18} strokeWidth={2} fill="currentColor" />
          {mounted && itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          )}
        </Link>
        <Link href="/shop/wishlist" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-red-600 hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.15)] relative">
          <Heart size={18} strokeWidth={2} fill="currentColor" />
          {mounted && wishlist?.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {wishlist.length}
            </span>
          )}
        </Link>
      </div>

      {/* Center: DoctorFit */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="inline-block group cursor-pointer">
          <h1 
            className="text-base sm:text-lg uppercase tracking-[0.25em] font-bold transition-all duration-300 group-hover:scale-105 flex items-center"
            style={{ textShadow }}
          >
            <span className="text-black">DOCTOR</span><span className={isHome ? "text-white" : "text-red-600"}>FIT</span>
          </h1>
        </Link>
      </div>

      {/* Right: Log In / Profile */}
      <div className="flex items-center relative" ref={dropdownRef}>
        {!isAuthenticated || !mounted ? (
          <Link href="/auth/login" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
            <User size={18} strokeWidth={2} fill="currentColor" />
          </Link>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
            >
              <User size={18} strokeWidth={2} fill="currentColor" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-2 z-50 border border-gray-100 flex flex-col text-black font-sans">
                <Link 
                  href="/shop/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Settings size={16} className="text-gray-500" /> View Profile
                </Link>
                
                {user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-gray-500" /> Admin Panel
                  </Link>
                )}
                
                <Link 
                  href="/shop/orders" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <ShoppingBag size={16} className="text-gray-500" /> Check Orders
                </Link>
                
                <hr className="my-1 border-gray-100" />
                
                <button 
                  onClick={async () => {
                    setIsDropdownOpen(false)
                    await logout()
                    router.push('/auth/login')
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
