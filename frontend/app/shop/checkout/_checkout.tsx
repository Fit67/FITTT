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
import { useTranslation } from '@/hooks/useTranslation'
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

// ─── Inner checkout ────────────────────────────────────────────
interface CheckoutInnerProps {
  stripeInstance?: ReturnType<typeof useStripe>
  elementsInstance?: ReturnType<typeof useElements>
}

function CheckoutInner({ stripeInstance, elementsInstance }: CheckoutInnerProps) {
  const { t, lang } = useTranslation()
  const router = useRouter()
  const { items, subtotal, discount, deliveryFee, total, coupon, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()
  const toast = useToast()

  const [step,             setStep]           = React.useState<Step>('address')
  const [paymentMethod,    setPayment]        = React.useState<PaymentMethod>('instapay')
  const [mounted,          setMounted]        = React.useState(false)
  const [proofFile,        setProofFile]      = React.useState<File | null>(null)
  const [proofPreview,     setProofPreview]   = React.useState<string>('')
  const [successOrderNum,  setSuccessOrderNum] = React.useState<string | null>(null)
  const [useNewAddress,    setUseNewAddress]  = React.useState(false)
  const [stripeProcessing, setStripeProcessing] = React.useState(false)
  // BUG #3 FIX: null = "use first saved address from user profile" (resolved at submit time)
  // non-null = user explicitly picked a different saved address
  const [selectedAddress,  setSelectedAddress] = React.useState<AddressForm | null>(null)

  // If user has no saved addresses, always use the new address form
  const hasSavedAddresses = (user?.addresses?.length ?? 0) > 0
  const isUsingNewAddress = useNewAddress || !hasSavedAddresses

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
    let addr: AddressForm | null = null
    if (isUsingNewAddress) {
      const valid = await new Promise<boolean>(resolve => {
        handleSubmit(
          data => { addr = data; resolve(true) },
          ()   => resolve(false),
        )()
      })
      if (!valid || !addr) { toast.error('Please fill in all address fields'); return }
    } else {
      addr = selectedAddress ?? (user?.addresses?.[0] ?? null)
    }
    if (!addr) {
      toast.error('Please provide a delivery address', 'Select a saved address or enter a new one')
      setStep('address')
      return
    }

    // BUG #2 FIX: proof required for ALL payment methods
    if (!proofPreview) {
      toast.error('Payment screenshot required', 'Please upload your payment proof screenshot before placing the order.')
      setStep('payment')
      return
    }

    // BUG #1 FIX: stock check before submitting
    for (const item of safeItems) {
      const maxStock = item.variant
        ? (item.variant.inventory ?? 999)
        : (item.product.inventory?.quantity ?? 999)
      if (item.quantity > maxStock) {
        toast.error(
          'Stock changed',
          `Only ${maxStock} unit${maxStock === 1 ? '' : 's'} of "${item.product.name}" available. Please update your cart.`,
        )
        return
      }
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
        if (!stripeInstance || !elementsInstance) {
          toast.error('Stripe not loaded', 'Please refresh the page and try again.')
          return
        }
        setStripeProcessing(true)
        try {
          const intentData  = await paymentService.createPaymentIntent(orderId)
          const cardElement = elementsInstance.getElement(CardElement)
          if (!cardElement) throw new Error('Card element not found')
          const { error: stripeError } = await stripeInstance.confirmCardPayment(intentData.clientSecret, {
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
      <main className="min-h-screen pb-10 pt-4 sm:pb-16 sm:pt-6">
        <div className="container-page">
          <nav className="mb-5 flex max-w-full items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-xs text-gray-500 dark:text-gray-400 sm:mb-6 sm:text-sm">
            <span>{t('checkoutStepCart')}</span>
            <ChevronRight size={14} />
            <span className={step === 'address' ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>{t('checkoutStepAddress')}</span>
            <ChevronRight size={14} />
            <span className={step === 'payment' ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>{t('checkoutStepPayment')}</span>
            <ChevronRight size={14} />
            <span className={step === 'review'  ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}>{t('checkoutStepReview')}</span>
          </nav>
 
          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === 'address' && (
                  <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-gray-900 dark:text-white sm:mb-5 sm:text-lg">
                      <MapPin size={18} className="text-red-600" /> {t('checkoutDeliveryAddress')}
                    </h2>
                    {hasSavedAddresses && (
                      <div className="mb-4 space-y-2">
                        {(user?.addresses ?? []).map((a: AddressForm & { _id?: string }) => (
                          <button key={a._id} onClick={() => { setSelectedAddress(a); setUseNewAddress(false) }}
                            className={cn('w-full rounded-xl border-2 p-3 text-start text-sm transition-colors',
                              !useNewAddress && (selectedAddress ?? user?.addresses?.[0]) === a
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{a.fullName}</p>
                            <p className="break-words text-gray-500 dark:text-gray-400">{a.street}, {a.city}, {a.country}</p>
                          </button>
                        ))}
                        <button onClick={() => setUseNewAddress(true)}
                          className={cn('w-full rounded-xl border-2 p-3 text-start text-sm transition-colors',
                            useNewAddress ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                          {t('checkoutUseNewAddress')}
                        </button>
                      </div>
                    )}
                    {isUsingNewAddress && (
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
                    <Button fullWidth className="mt-5 sm:mt-6" onClick={() => {
                      if (isUsingNewAddress) {
                        handleSubmit(() => setStep('payment'), () => {
                          toast.error('Please fill in all address fields')
                          toast.error(t('checkoutFillAddressFields'))
                        })()
                      } else {
                        setStep('payment')
                      }
                    }}>
                      {t('checkoutContinuePayment')}
                    </Button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('checkoutSelectPaymentMethod')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('checkoutDeliveryTimeNote')}</p>

                    <div className="space-y-3">
                      {([
                        { id: 'instapay' as const, icon: Smartphone,
                          label: t('checkoutInstapayLabel'),
                          sub:   t('checkoutInstapaySub') },
                        ...(storeConfig.delivery.cashOnDelivery ? [{
                          id: 'cash_on_delivery' as const, icon: Banknote,
                          label: t('checkoutCodLabel'),
                          sub:   t('checkoutCodSub') }] : []),
                        ...(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? [{
                          id: 'stripe' as const, icon: CreditCard,
                          label: t('checkoutCardLabel'), sub: t('checkoutCardSub') }] : []),
                      ] as Array<{ id: PaymentMethod; icon: React.ElementType; label: string; sub: string }>).map(m => (
                        <button key={m.id} onClick={() => setPayment(m.id)}
                          className={cn('flex w-full items-start gap-3 rounded-xl border-2 p-3 text-start transition-colors sm:items-center sm:gap-4 sm:p-4',
                            paymentMethod === m.id ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                   : 'border-gray-200 hover:border-gray-300 dark:border-gray-700')}>
                          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                            paymentMethod === m.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800')}>
                            <m.icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium leading-relaxed text-gray-900 dark:text-gray-100">{m.label}</p>
                            <p className="break-words text-xs leading-relaxed text-gray-500 dark:text-gray-400">{m.sub}</p>
                          </div>
                          {paymentMethod === m.id && <Check size={16} className="shrink-0 text-red-600" />}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'cash_on_delivery' && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                        <p className="font-semibold">{t('checkoutCodAdvanceNoteEn')}</p>
                        <p className="mt-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('checkoutCodAdvanceNoteAr')}</p>
                      </div>
                    )}

                    {paymentMethod === 'stripe' && (
                      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('checkoutCardDetails')}</p>
                        <CardElement options={{ style: { base: { fontSize: '15px', color: '#111', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }} />
                      </div>
                    )}

                    {paymentMethod === 'instapay' && (
                      <div className="mt-5 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3" dir="rtl">
                          <div className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-bold text-white">InstaPay</div>
                          <div className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Vodafone Cash</div>
                          <div className="w-full font-mono text-sm font-bold text-gray-900 dark:text-gray-100 sm:w-auto sm:text-base" dir="ltr">{TRANSFER_NUMBER}</div>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{t('checkoutTransferNote')}</p>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t('checkoutUploadScreenshot')} <span className="text-red-500">*</span>
                      </p>
                      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                        {paymentMethod === 'cash_on_delivery'
                          ? t('checkoutUploadScreenshotSubCod')
                          : t('checkoutUploadScreenshotSubDefault')}
                      </p>
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center transition-colors hover:border-red-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-red-700 sm:p-5">
                        <input type="file" accept="image/*" className="sr-only" onChange={handleProofChange} />
                        {proofPreview ? (
                          <div className="w-full">
                            <img src={proofPreview} alt="Payment screenshot preview" className="mx-auto max-h-56 rounded-lg object-contain" />
                            <p className="mt-3 break-words text-sm font-medium text-gray-900 dark:text-gray-100">{proofFile?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'ar' ? 'انقر لاستبدال لقطة الشاشة' : 'Click to replace screenshot'}</p>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-red-650" />
                            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('checkoutUploadButtonLabel')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('checkoutUploadButtonLimits')}</p>
                          </>
                        )}
                      </label>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('address')}>{t('checkoutBack')}</Button>
                      <Button fullWidth onClick={() => setStep('review')}>{t('checkoutReviewOrder')}</Button>
                    </div>
                  </motion.div>
                )}
 
                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                    <h2 className="mb-4 font-display text-base font-semibold text-gray-900 dark:text-white sm:mb-5 sm:text-lg">{t('checkoutReviewYourOrderTitle')}</h2>
                    <div className="space-y-3 mb-6">
                      {safeItems.map(item => (
                        <div key={item.product._id} className="flex gap-3 sm:gap-4">
                          <img src={getProductImage(item.product.images)} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                          <div className="flex min-w-0 flex-1 flex-col gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t('checkoutQty')}: {item.quantity}</p>
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
                        <ImageIcon size={16} className="text-red-650 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{t('checkoutPaymentScreenshotLabel')}</p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{proofFile?.name ?? t('checkoutNoScreenshotUploaded')}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('payment')}>{t('checkoutBack')}</Button>
                      <Button fullWidth loading={isPending || stripeProcessing} onClick={placeOrder} size="lg" className="px-4">
                        {lang === 'ar' ? 'تأكيد الطلب — ' : 'Place Order — '}{formatPrice(total)}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-fit lg:sticky lg:top-24">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">{t('cartOrderSummary')}</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-400">
                    <span>{t('cartSubtotal')} ({safeItems.length} {t('items')})</span>
                    <span className="shrink-0">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{t('cartDiscount')}</span><span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{t('cartDelivery')}</span>
                    <span className="shrink-0">{deliveryFee === 0 ? (lang === 'ar' ? 'مجاناً' : 'Free') : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between gap-4 text-base font-bold text-gray-900 dark:text-gray-100">
                    <span>{t('cartTotal')}</span><span className="shrink-0">{formatPrice(total)}</span>
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

// ─── Bridge: reads Stripe hooks inside Elements, passes as props ─
function CheckoutWithStripe() {
  const stripe   = useStripe()
  const elements = useElements()
  return <CheckoutInner stripeInstance={stripe ?? undefined} elementsInstance={elements ?? undefined} />
}

// ─── Root export: only mount Elements when Stripe is configured ─
export default function CheckoutPage() {
  if (!stripePromise) {
    // No Stripe configured — render without Elements (no Stripe hooks called)
    return <CheckoutInner />
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutWithStripe />
    </Elements>
  )
}

function OrderSuccess({ orderNumber }: { orderNumber: string }) {
  const { t } = useTranslation()
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-3 pb-10 pt-4 sm:px-4 sm:pb-16 sm:pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 text-center shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Check size={30} />
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('checkoutSuccessTitle')}</h1>
          {orderNumber && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {t('orderLabel')} <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{orderNumber}</span> {t('checkoutSuccessConfirmed')}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('checkoutSuccessMessage')}</p>
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
      <main className="min-h-screen pb-10 pt-4 sm:pb-16 sm:pt-6">
        <div className="container-page">
          <div className="mb-5 h-8 w-36 skeleton rounded-full sm:mb-8 sm:w-40" />
          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-6 lg:col-span-2">
              <div className="h-6 w-48 skeleton rounded-full mb-5" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 skeleton rounded-lg" />
                ))}
              </div>
            </div>
            <div className="h-64 skeleton rounded-xl" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
