import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { storeConfig } from '@/config/store'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: `Shipping information for ${storeConfig.name} orders.`,
}

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-14 pt-6 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100 sm:pb-20 sm:pt-8">
        <article className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Policy</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Shipping Policy</h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
            This policy explains how {storeConfig.name} handles delivery for orders placed through our website.
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Delivery Area</h2>
            <p>
              We currently deliver within Egypt, with primary service in Cairo and surrounding areas. If your
              address is outside our active delivery area, our team may contact you before confirming the order.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Delivery Time</h2>
            <p>
              Standard delivery is usually completed within 1 to 3 business days after order confirmation and
              payment proof review. Delivery timing may change during holidays, high-demand periods, or if order
              details need confirmation.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Delivery Fees</h2>
            <p>
              Delivery fees are shown at checkout before you place your order. Orders may qualify for free
              delivery when they meet the minimum order threshold shown on the website.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Order Confirmation</h2>
            <p>
              Orders are confirmed after we receive the required order details and payment proof. If we cannot
              reach you using the contact information provided, the order may be delayed or cancelled.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Need Help?</h2>
            <p>
              Contact us at <a className="text-red-600 hover:underline" href={`mailto:${storeConfig.contact.email}`}>{storeConfig.contact.email}</a>
              {' '}or call {storeConfig.contact.phone}. You can also return to the <Link className="text-red-600 hover:underline" href="/">homepage</Link>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
