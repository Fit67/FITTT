'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Banknote, MapPin, Check, ChevronRight, Lock, Smartphone } from 'lucide-react'
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

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, deliveryFee, tax, total, coupon, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()
  const toast = useToast()
  const [step, setStep]               = React.useState<Step>('address')
  const [paymentMethod, setPayment]   = React.useState<'stripe' | 'cash_on_delivery' | 'instapay'>('instapay')
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

  async function placeOrder() {
    const addr = useNewAddress ? getValues() : selectedAddress
    if (!addr) { toast.error('Please provide a delivery address'); return }

    try {
      const order = await createOrder({
        items: items.map(i => ({
          productId: i.product._id,
          variantId: i.variant?._id,
          quantity:  i.quantity,
        })),
        shippingAddress: addr,
        paymentMethod,
        couponCode: coupon?.code,
      })

      clearCart()
      toast.success('Order placed!', `Order ${(order as { orderNumber: string }).orderNumber} confirmed.`)
      router.push(`/shop/orders/${(order as { _id: string })._id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error('Order failed', msg ?? 'Please try again.')
    }
  }

  if (!items.length) {
    router.push('/shop/cart')
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-page">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

          {/* ── Step Indicator ──────────────────────────────── */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => step !== s.id && i < steps.findIndex(x => x.id === step) && setStep(s.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
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
                  {s.label}
                </button>
                {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
                    className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
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
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{addr.fullName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
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
                        {
                          id: 'stripe' as const,
                          icon: CreditCard,
                          label: 'دفع أونلاين (كارت بنكي / أبل باي) 💳',
                          sub: 'دفع آمن 100% (Visa, Mastercard, Apple Pay)',
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
                          onClick={() => setPayment(m.id)}
                          className={cn(
                            'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors',
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
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{m.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{m.sub}</p>
                          </div>
                          {paymentMethod === m.id && <Check size={16} className="text-primary-600" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-6">
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
                    className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised"
                  >
                    <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">
                      Review Your Order
                    </h2>

                    <div className="space-y-3 mb-6">
                      {items.map(item => (
                        <div key={item.product._id} className="flex gap-4">
                          <img
                            src={getProductImage(item.product.images)}
                            alt={item.product.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div className="flex flex-1 items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-3 mb-6">
                      <Lock size={14} className="text-primary-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your payment is secured with 256-bit SSL encryption.
                      </p>
                    </div>

                    <div className="flex gap-3">
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
              <div className="rounded-card border border-gray-100 bg-surface p-6 shadow-card dark:border-gray-800 dark:bg-surface-raised">
                <h3 className="font-display text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
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
