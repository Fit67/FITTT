'use client'

import * as React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useProducts } from '@/hooks/useQueries'
import { useTranslation } from '@/hooks/useTranslation'
import { ProductsView } from './ProductsView'
import { Dumbbell } from 'lucide-react'

export default function ProductsPage() {
  const { dir } = useTranslation()
  // Fetch a large batch of products since the new UI filters them locally
  const { data, isLoading } = useProducts({ limit: 100 })

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-white" dir={dir}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Dumbbell className="w-12 h-12 text-gray-300 animate-bounce mb-4" />
            <p className="font-sans font-bold text-gray-500 uppercase tracking-widest text-sm">
              Loading Catalog...
            </p>
          </div>
        ) : (
          <ProductsView products={data?.data || []} />
        )}
      </main>
      <Footer />
    </>
  )
}
