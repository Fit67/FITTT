import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { storeConfig } from '@/config/store'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${storeConfig.name}.`,
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-14 pt-6 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100 sm:pb-20 sm:pt-8">
        <article className="container-page max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Policy</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
            This policy explains what information {storeConfig.name} collects and how we use it to process orders
            and support customers.
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
            <p>
              We may collect your name, email address, phone number, delivery address, order details, payment
              proof images, and account information when you use our website or contact us.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">How We Use Information</h2>
            <p>
              We use your information to create and manage your account, process orders, arrange delivery,
              verify payment, respond to support requests, prevent fraud, and improve our service.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Sharing Information</h2>
            <p>
              We do not sell customer personal information. We may share necessary order and delivery details
              with service providers such as delivery partners, payment processors, hosting providers, or
              support tools when needed to operate the store.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
            <p>
              We use reasonable technical and organizational safeguards to protect customer information. No
              online service can guarantee absolute security, so please use a strong password and contact us
              if you notice suspicious activity.
            </p>

            <h2 className="pt-4 font-display text-xl font-semibold text-gray-900 dark:text-white">Contact</h2>
            <p>
              For privacy questions, contact us at <a className="text-red-600 hover:underline" href={`mailto:${storeConfig.contact.email}`}>{storeConfig.contact.email}</a>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
