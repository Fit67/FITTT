import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { storeConfig } from '@/config/store'

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: `Return and refund information for ${storeConfig.name}.`,
}

export default function ReturnRefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-14 pt-6 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100 sm:pb-20 sm:pt-8">
        <article className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Policy</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Return & Refund Policy</h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
            We want your order to arrive correctly and safely. Please review the policy below before ordering.
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Eligible Returns</h2>
            <p>
              Unopened and unused products may be eligible for return within 24 hours of delivery. The product
              must be in its original packaging with seals intact. For health and safety reasons, opened
              supplements, food items, or personal-use products cannot be returned unless they arrived damaged
              or incorrect.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Damaged or Incorrect Items</h2>
            <p>
              If your order arrives damaged or incorrect, contact us as soon as possible with your order number
              and clear photos of the product and packaging. We will review the case and arrange a replacement,
              store credit, or refund when appropriate.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Refunds</h2>
            <p>
              Approved refunds are processed using the original payment method where possible. Processing time
              depends on the payment provider or bank. Delivery fees may be non-refundable unless the issue was
              caused by an error from our side.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">How to Request Support</h2>
            <p>
              Email <a className="text-red-600 hover:underline" href={`mailto:${storeConfig.contact.email}`}>{storeConfig.contact.email}</a>
              {' '}or call {storeConfig.contact.phone}. Include your order number, product name, and issue details.
            </p>

            <p className="pt-2">
              For delivery information, see our <Link className="text-red-600 hover:underline" href="/shipping-policy">Shipping Policy</Link>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
