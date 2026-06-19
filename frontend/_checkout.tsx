'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, MapPin, Check, ChevronRight, Smartphone, Upload, Image as ImageIcon, CreditCard } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/store/slices/cartStore'
import { useAuthStore } from '@/store/slices/authStore'
import { useCreateOrder } from '@/hooks/useQueries'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, getProductImage } from '@/lib/utils'
import { storeConfig } from '@/config/store'
import { cn } from '@/lib/utils'
import { paymentService } from '@/services'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone:    z.string().min(7),
  street:   z.string().min(5),
  city:     z.string().min(2),
  state:    z.string().min(2),
  country:  z.string().min(2),
  zipCode:  z.string().min(3),
})

type AddressForm = z.infer<typeof addressSchema>
type Step = 'address' | 'payment' | 'review'
type PaymentMethod = 'cash_on_delivery' | 'instapay' | 'stripe'

const TRANSFER_NUMBER = '01044461683'
const COD_ADVANCE_NOTE_EN = 'Delivery fee of 80 EGP must be paid in advance.'
const COD_ADVANCE_NOTE_AR = 'يجب دفع رسوم التوصيل 80 جنيه مصري مقدما.'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// ─── Inner checkout (always inside Elements or standalone) ─────
function CheckoutInner() {
  const router = useRouter()
  const { items, subtotal, discount, deliveryFee, tax, total, coupon, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()
  const toast   = useToast()
  const stripe   = useStripe()
  const elements = useElements()

  const [step,             setStep]           = React.useState<Step>('address')
  const [paymentMethod,    setPayment]        = React.useState<PaymentMethod>('instapay')
  const [mounted,          setMounted]        = React.useState(false)
  const [proofFile,        setProofFile]      = React.useState<File | null>(null)
  const [proofPreview,     setProofPreview]   = React.useState<string>('')
  const [successOrderNum,  setSuccessOrderNum] = React.useState<string | null>(null)
  const [useNewAddress,    setUseNewAddress]  = React.useState(false)
  const [stripeProcessing, setStripeProcessing] = React.useState(false)
  const [selectedAddress,  setSelectedAddress] = React.useState<AddressForm | null>(
    user?.addresses?.[0] ?? null,
  )

  React.useEffect(() => {
    if (!selectedAddress && (user?.addresses?.length ?? 0) > 0) {
      setSelectedAddress(user?.addresses?.[0] ?? null)
    }
  }, [user?.addresses]) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const safeItems = React.useMemo(
    () => (Array.isArray(items) ? items.filter(i => i?.product?._id) : []),
    [items],
  )

  React.useEffect(() => { setMounted(true) }, [])

  async function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Please upload an image under 5MB.')
      return
    }
    setProofFile(file)
    setProofPreview(await fileToDataUrl(file))
  }

  async function placeOrder() {
    const addr = useNewAddress ? getValues() : selectedAddress
    if (!addr) { toast.error('Please provide a delivery address'); return }
    if (!proofPreview && paymentMethod !== 'cash_on_delivery' && paymentMethod !== 'stripe') {
      toast.error('Payment screenshot required', 'Please upload the transfer screenshot before placing the order.')
      setStep('payment')
      return
    }

    try {
      const order = await createOrder({
        items: safeItems.map(i => ({
          productId: i.product._id,
          variantId: i.variant?._id,
          quantity:  i.quantity,
        })),
        shippingAddress:      addr,
        paymentMethod,
        couponCode:           coupon?.code,
        notes:                paymentMethod === 'cash_on_delivery'
          ? `${COD_ADVANCE_NOTE_EN}\n${COD_ADVANCE_NOTE_AR}`
          : undefined,
        paymentProofImage:    proofPreview || undefined,
        paymentProofFileName: proofFile?.name,
      })

      const orderId = (order as { _id?: string })._id

      if (paymentMethod === 'stripe' && orderId) {
        if (!stripe || !elements) {
          toast.error('Stripe not loaded', 'Please refresh the page and try again.')
          return
        }
        setStripeProcessing(true)
        try {
          const intentData  = await paymentService.createPaymentIntent(orderId)
          const cardElement = elements.getElement(CardElement)
          if (!cardElement) throw new Error('Card element not found')
          const { error: stripeError } = await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: { card: cardElement },
          })
          if (stripeError) {
            toast.error('Payment failed', stripeError.message ?? 'Card payment was declined.')
            setStripeProcessing(false)
            return
          }
        } catch {
          toast.error('Payment error', 'Could not process card payment. Please try again.')
          setStripeProcessing(false)
          return
        }
        setStripeProcessing(false)
      }

      const orderNumber = (order as { orderNumber?: string }).orderNumber ?? ''
      setSuccessOrderNum(orderNumber)
      clearCart()
      toast.success('Thank you!', orderNumber ? `Order ${orderNumber} confirmed.` : 'Your order is confirmed.')
      window.setTimeout(() => router.push('/'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error('Order failed', msg ?? 'Please try again.')
    }
  }

  React.useEffect(() => {
    if (mounted && safeItems.length === 0 && successOrderNum === null) router.push('/shop/cart')
  }, [mounted, router, safeItems.length, successOrderNum])

  if (!mounted)               return <CheckoutSkeleton />
  if (successOrderNum !== null) return <OrderSuccess orderNumber={successOrderNum} />

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 sm:pt-24">
        <div className="container-page">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span>Cart</span>
            <ChevronRight size={14} />
            <span className={step === 'address' ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>Address</span>
            <ChevronRight size={14} />
            <span className={step === 'payment' ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>Payment</span>
            <ChevronRight size={14} />
            <span className={step === 'review'  ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>Review</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 'address' && (
                  <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6">
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                      <MapPin size={18} className="text-primary-600" /> Delivery Address
                    </h2>
                    {(user?.addresses?.length ?? 0) > 0 && (
                      <div className="mb-4 space-y-2">
                        {(user?.addresses ?? []).map((a: AddressForm & { _id?: string }) => (
                          <button key={a._id} onClick={() => { setSelectedAddress(a); setUseNewAddress(false) }}
                            className={cn('w-full rounded-xl border-2 p-3 text-left text-sm transition-colors',
                              !useNewAddress && selectedAddress === a
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{a.fullName}</p>
                            <p className="text-gray-500 dark:text-gray-400">{a.street}, {a.city}, {a.country}</p>
                          </button>
                        ))}
                        <button onClick={() => setUseNewAddress(true)}
                          className={cn('w-full rounded-xl border-2 p-3 text-left text-sm transition-colors',
                            useNewAddress ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                          + Use a new address
                        </button>
                      </div>
                    )}
                    {(useNewAddress || !(user?.addresses?.length)) && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
                        <Input label="Phone"     {...register('phone')}    error={errors.phone?.message} />
                        <Input label="Street"    {...register('street')}   error={errors.street?.message}  className="sm:col-span-2" />
                        <Input label="City"      {...register('city')}     error={errors.city?.message} />
                        <Input label="State"     {...register('state')}    error={errors.state?.message} />
                        <Input label="Country"   {...register('country')}  error={errors.country?.message} />
                        <Input label="Zip Code"  {...register('zipCode')}  error={errors.zipCode?.message} />
                      </div>
                    )}
                    <Button fullWidth className="mt-6" onClick={handleSubmit(() => setStep('payment'))}>
                      Continue to Payment
                    </Button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6">
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">اختار طريقة الدفع</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">التوصيل بيتم خلال 3 أيام عمل من تأكيد الطلب 🚚</p>

                    <div className="space-y-3">
                      {([
                        { id: 'instapay' as const, icon: Smartphone,
                          label: 'إنستاباي (الأسهل والأسرع) 🚀',
                          sub:   'حول المبلغ على 01044461683 وابعت سكرين شوت على الواتساب.' },
                        ...(storeConfig.delivery.cashOnDelivery ? [{
                          id: 'cash_on_delivery' as const, icon: Banknote,
                          label: 'كاش عند الاستلام 💵',
                          sub:   'لتأكيد الأوردر، لازم تحول تمن الشحن الأول، وهتدفع تمن المنتج وقت الاستلام.' }] : []),
                        ...(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? [{
                          id: 'stripe' as const, icon: CreditCard,
                          label: 'Credit / Debit Card 💳', sub: 'Secure card payment via Stripe.' }] : []),
                      ] as Array<{ id: PaymentMethod; icon: React.ElementType; label: string; sub: string }>).map(m => (
                        <button key={m.id} onClick={() => setPayment(m.id)}
                          className={cn('flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors sm:items-center sm:gap-4 sm:p-4',
                            paymentMethod === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                   : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl',
                            paymentMethod === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800')}>
                            <m.icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium leading-relaxed text-gray-900 dark:text-gray-100">{m.label}</p>
                            <p className="break-words text-xs leading-relaxed text-gray-500 dark:text-gray-400">{m.sub}</p>
                          </div>
                          {paymentMethod === m.id && <Check size={16} className="text-primary-600" />}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'cash_on_delivery' && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                        <p className="font-semibold">{COD_ADVANCE_NOTE_EN}</p>
                        <p className="mt-1" dir="rtl">{COD_ADVANCE_NOTE_AR}</p>
                      </div>
                    )}

                    {paymentMethod === 'stripe' && (
                      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Card details</p>
                        <CardElement options={{ style: { base: { fontSize: '15px', color: '#111', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }} />
                      </div>
                    )}

                    {paymentMethod === 'instapay' && (
                      <>
                        <div className="mt-5 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3" dir="rtl">
                            <div className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-bold text-white">InstaPay</div>
                            <div className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Vodafone Cash</div>
                            <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base" dir="ltr">{TRANSFER_NUMBER}</div>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100" dir="rtl">كل التحويلات يجب ان تكون علي هذا الرقم</p>
                        </div>
                        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-surface-raised p-5 text-center transition-colors hover:border-primary-300 dark:border-gray-700 dark:bg-surface-overlay dark:hover:border-primary-700">
                          <input type="file" accept="image/*" className="sr-only" onChange={handleProofChange} />
                          {proofPreview ? (
                            <div className="w-full">
                              <img src={proofPreview} alt="Payment screenshot preview" className="mx-auto max-h-56 rounded-lg object-contain" />
                              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">{proofFile?.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Click to replace screenshot</p>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} className="text-primary-600" />
                              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Upload payment screenshot</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WebP up to 5MB</p>
                            </>
                          )}
                        </label>
                      </>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('address')}>Back</Button>
                      <Button fullWidth onClick={() => setStep('review')}>Review Order</Button>
                    </div>
                  </motion.div>
                )}

                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6">
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">Review Your Order</h2>
                    <div className="space-y-3 mb-6">
                      {safeItems.map(item => (
                        <div key={item.product._id} className="flex gap-3 sm:gap-4">
                          <img src={getProductImage(item.product.images)} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(((item.variant?.price != null && Number.isFinite(item.variant.price)) ? item.variant.price : item.product.price) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {paymentMethod === 'instapay' && (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-3 mb-6">
                        <ImageIcon size={16} className="text-primary-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Payment screenshot</p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{proofFile?.name ?? 'No screenshot uploaded yet'}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                      <Button fullWidth loading={isPending || stripeProcessing} onClick={placeOrder} size="lg">
                        Place Order — {formatPrice(total)}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6">
                <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({safeItems.length} items)</span>
                    <span className="shrink-0">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span><span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className="shrink-0">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax (8%)</span><span className="shrink-0">{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>Total</span><span className="shrink-0">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Wrap with Stripe Elements when Stripe is configured ───────
export default function CheckoutPage() {
  if (!stripePromise) {
    return (
      <Elements stripe={null}>
        <CheckoutInner />
      </Elements>
    )
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}

function OrderSuccess({ orderNumber }: { orderNumber: string }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-4 pt-20 pb-10 sm:pt-24 sm:pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-card border border-gray-100 bg-surface p-6 text-center shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Check size={30} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Thank you for your order</h1>
          {orderNumber && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Order <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{orderNumber}</span> is confirmed.
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We are sending you back to the homepage.</p>
        </motion.div>
      </main>
      <Footer />
    </>
  )
}

function CheckoutSkeleton() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page">
          <div className="h-9 w-40 skeleton rounded-full mb-8" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised">
              <div className="h-6 w-48 skeleton rounded-full mb-5" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 skeleton rounded-button" />
                ))}
              </div>
            </div>
            <div className="h-64 skeleton rounded-card" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
