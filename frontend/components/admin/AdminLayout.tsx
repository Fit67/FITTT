'use client'

import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
        {children}
      </main>
    </div>
  )
}