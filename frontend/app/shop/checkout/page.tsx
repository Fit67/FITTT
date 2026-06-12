'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, MapPin, Check, ChevronRight, Smartphone, Upload, Image as ImageIcon } from 'lucide-react'
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
type PaymentMethod = 'cash_on_delivery' | 'instapay'

const TRANSFER_NUMBER = '01044461683'
const COD_ADVANCE_NOTE_EN = 'Delivery fee of 80 EGP must be paid in advance.'
const COD_ADVANCE_NOTE_AR = 'يجب دفع رسوم التوصيل 80 جنيه مصري مقدما.'

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, deliveryFee, tax, total, coupon, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()
  const toast = useToast()
  const [step, setStep]               = React.useState<Step>('address')
  const [paymentMethod, setPayment]   = React.useState<PaymentMethod>('instapay')
  const [mounted, setMounted]         = React.useState(false)
  const [proofFile, setProofFile]     = React.useState<File | null>(null)
  const [proofPreview, setProofPreview] = React.useState<string>('')
  const [successOrderNumber, setSuccessOrderNumber] = React.useState('')
  const [selectedAddress, setAddress] = React.useState(
    user?.addresses?.find(a => a.isDefault) ?? user?.addresses?.[0] ?? null,
  )
  const [useNewAddress, setUseNewAddress] = React.useState(!selectedAddress)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  const steps: { id: Step; label: string }[] = [
    { id: 'address', label: 'Delivery' },
    { id: 'payment', label: 'Payment'  },
    { id: 'review',  label: 'Review'   },
  ]

  React.useEffect(() => { setMounted(true) }, [])

  const safeItems = React.useMemo(
    () => (items ?? []).filter(item => item?.product?._id),
    [items],
  )

  async function handleProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please upload an image screenshot.')
      return
    }
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
    if (!proofPreview) {
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
        shippingAddress: addr,
        paymentMethod,
        couponCode: coupon?.code,
        notes: paymentMethod === 'cash_on_delivery'
          ? `${COD_ADVANCE_NOTE_EN}\n${COD_ADVANCE_NOTE_AR}`
          : undefined,
        paymentProofImage: proofPreview,
        paymentProofFileName: proofFile?.name,
      })

      const orderNumber = (order as { orderNumber?: string }).orderNumber ?? ''

      setSuccessOrderNumber(orderNumber)
      clearCart()
      toast.success('Thank you!', orderNumber ? `Order ${orderNumber} confirmed.` : 'Your order is confirmed.')
      window.setTimeout(() => router.push('/'), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error('Order failed', msg ?? 'Please try again.')
    }
  }

  React.useEffect(() => {
    if (mounted && safeItems.length === 0 && !successOrderNumber) router.push('/shop/cart')
  }, [mounted, router, safeItems.length, successOrderNumber])

  if (!mounted) return <CheckoutSkeleton />

  if (successOrderNumber) return <OrderSuccess orderNumber={successOrderNumber} />

  if (safeItems.length === 0) return <CheckoutSkeleton />

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-10 sm:pt-24 sm:pb-16">
        <div className="container-page">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-5 sm:mb-8 sm:text-3xl">Checkout</h1>

          {/* ── Step Indicator ──────────────────────────────── */}
          <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:flex sm:items-center">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => step !== s.id && i < steps.findIndex(x => x.id === step) && setStep(s.id)}
                  className={cn(
                    'flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:text-sm',
                    s.id === step
                      ? 'bg-primary-600 text-white'
                      : steps.indexOf(s) < steps.findIndex(x => x.id === step)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed',
                  )}
                >
                  {steps.indexOf(s) < steps.findIndex(x => x.id === step) ? (
                    <Check size={14} />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px]">{i + 1}</span>
                  )}
                  <span className="truncate">{s.label}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight size={14} className="hidden text-gray-300 dark:text-gray-600 sm:block" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3">
            {/* ── Left — Step Content ────────────────────── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">

                {/* Step 1: Address */}
                {step === 'address' && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6"
                  >
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">
                      Delivery Address
                    </h2>

                    {/* Saved addresses */}
                    {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
                      <div className="mb-6 space-y-3">
                        {user.addresses.map(addr => (
                          <button
                            key={addr._id}
                            onClick={() => { setAddress(addr); setUseNewAddress(false) }}
                            className={cn(
                              'w-full rounded-xl border-2 p-4 text-left transition-colors',
                              !useNewAddress && selectedAddress?._id === addr._id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <MapPin size={16} className="mt-0.5 text-primary-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{addr.fullName}</p>
                                <p className="break-words text-sm text-gray-500 dark:text-gray-400">
                                  {addr.street}, {addr.city}, {addr.country}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{addr.phone}</p>
                              </div>
                              {!useNewAddress && selectedAddress?._id === addr._id && (
                                <Check size={16} className="ml-auto text-primary-600" />
                              )}
                            </div>
                          </button>
                        ))}

                        <button
                          onClick={() => setUseNewAddress(true)}
                          className={cn(
                            'w-full rounded-xl border-2 p-4 text-left text-sm font-medium transition-colors',
                            useNewAddress
                              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                              : 'border-dashed border-gray-200 text-gray-500 hover:border-primary-300 dark:border-gray-700',
                          )}
                        >
                          + Add new address
                        </button>
                      </div>
                    )}

                    {/* New address form */}
                    {(useNewAddress || !isAuthenticated) && (
                      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
                        <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
                        <Input label="Street Address" className="sm:col-span-2" error={errors.street?.message} {...register('street')} />
                        <Input label="City"    error={errors.city?.message}    {...register('city')} />
                        <Input label="State"   error={errors.state?.message}   {...register('state')} />
                        <Input label="Country" error={errors.country?.message} {...register('country')} />
                        <Input label="ZIP Code" error={errors.zipCode?.message} {...register('zipCode')} />
                      </form>
                    )}

                    <Button
                      className="mt-6"
                      fullWidth
                      onClick={useNewAddress ? handleSubmit(() => setStep('payment')) : () => setStep('payment')}
                    >
                      Continue to Payment
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6"
                  >
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      طريقة الدفع (Payment Method)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                      التوصيل بيتم خلال 3 أيام عمل من تأكيد الطلب 🚚
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          id: 'instapay' as const,
                          icon: Smartphone,
                          label: 'إنستاباي (الأسهل والأسرع) 🚀',
                          sub: 'حول المبلغ على 01044461683 وابعت سكرين شوت على الواتساب.',
                        },
                        ...(storeConfig.delivery.cashOnDelivery
                          ? [{
                              id: 'cash_on_delivery' as const,
                              icon: Banknote,
                              label: 'كاش عند الاستلام 💵',
                              sub: 'لتأكيد الأوردر، لازم تحول تمن الشحن الأول، وهتدفع تمن المنتج وقت الاستلام.',
                            }]
                          : []),
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setPayment(m.id as PaymentMethod)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors sm:items-center sm:gap-4 sm:p-4',
                            paymentMethod === m.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700',
                          )}
                        >
                          <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            paymentMethod === m.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800',
                          )}>
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

                    <div className="mt-5 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3" dir="rtl">
                        <div className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-bold text-white">InstaPay</div>
                        <div className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Vodafone Cash</div>
                        <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base" dir="ltr">
                          {TRANSFER_NUMBER}
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100" dir="rtl">
                        كل التحويلات يجب ان تكون علي هذا الرقم
                      </p>
                    </div>

                    <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-surface-raised p-5 text-center transition-colors hover:border-primary-300 dark:border-gray-700 dark:bg-surface-overlay dark:hover:border-primary-700">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleProofChange}
                      />
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

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('address')}>Back</Button>
                      <Button fullWidth onClick={() => setStep('review')}>Review Order</Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6"
                  >
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">
                      Review Your Order
                    </h2>

                    <div className="space-y-3 mb-6">
                      {safeItems.map(item => (
                        <div key={item.product._id} className="flex gap-3 sm:gap-4">
                          <img
                            src={getProductImage(item.product.images)}
                            alt={item.product.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-3 mb-6">
                      <ImageIcon size={16} className="text-primary-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          Payment screenshot
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {proofFile?.name ?? 'No screenshot uploaded yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                      <Button fullWidth loading={isPending} onClick={placeOrder} size="lg">
                        Place Order — {formatPrice(total)}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Order Summary (sticky) ─────────────────────── */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-card border border-gray-100 bg-surface p-4 shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-6">
                <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4 text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({safeItems.length} items)</span>
                    <span className="shrink-0">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className="shrink-0">{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span className="shrink-0">{formatPrice(total)}</span>
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

function OrderSuccess({ orderNumber }: { orderNumber: string }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-4 pt-20 pb-10 sm:pt-24 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] }}
          className="w-full max-w-md rounded-card border border-gray-100 bg-surface p-6 text-center shadow-card dark:border-gray-800 dark:bg-surface-raised sm:p-8"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Check size={30} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Thank you for your order
          </h1>
          {orderNumber && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Order <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{orderNumber}</span> is confirmed.
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We are sending you back to the homepage.
          </p>
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
