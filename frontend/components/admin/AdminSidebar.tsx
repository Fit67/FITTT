'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AdminSidebar() {
  const pathname = usePathname()

  const items = [
    { name: 'Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
  ]

  return (
    <div className="w-64 h-screen border-r bg-white dark:bg-gray-900 p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="space-y-2">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium',
              pathname === item.href
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}