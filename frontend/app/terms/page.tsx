import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { storeConfig } from '@/config/store'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `Terms and conditions for ${storeConfig.name}.`,
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-14 pt-6 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100 sm:pb-20 sm:pt-8">
        <article className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Policy</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Terms & Conditions</h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
            By using {storeConfig.name}, you agree to the terms below.
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Products and Availability</h2>
            <p>
              Product availability, pricing, descriptions, and offers may change without notice. We try to keep
              information accurate, but errors may happen. If an order is affected by an error or unavailable
              product, we may contact you to confirm changes or cancel the order.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Orders and Payment</h2>
            <p>
              Orders are confirmed after required information and payment proof are reviewed. You are
              responsible for providing accurate contact and delivery information. We may refuse or cancel an
              order if it appears fraudulent, incomplete, or violates these terms.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Health and Product Use</h2>
            <p>
              Supplements and fitness products should be used responsibly and according to their labels. If you
              have a medical condition, allergies, are pregnant, or take medication, consult a qualified
              healthcare professional before using supplements.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Returns, Refunds, and Shipping</h2>
            <p>
              Shipping, returns, and refunds are handled according to our published policies. Please review the
              <Link className="text-red-600 hover:underline" href="/shipping-policy"> Shipping Policy</Link>
              {' '}and <Link className="text-red-600 hover:underline" href="/return-refund-policy">Return & Refund Policy</Link>.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
            <p>
              For questions, contact <a className="text-red-600 hover:underline" href={`mailto:${storeConfig.contact.email}`}>{storeConfig.contact.email}</a>
              {' '}or {storeConfig.contact.phone}.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
