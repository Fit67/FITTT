'use client'

import dynamic from 'next/dynamic'

// Stripe's useStripe/useElements hooks crash during SSR prerendering.
// Using dynamic import with ssr:false ensures they only run client-side.
const CheckoutPage = dynamic(() => import('./_checkout'), { ssr: false })

export default function CheckoutPageWrapper() {
  return <CheckoutPage />
}
