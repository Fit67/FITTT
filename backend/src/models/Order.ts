import mongoose, { Schema, type Document } from 'mongoose'

export type OrderStatus = 'pending'|'confirmed'|'processing'|'shipped'|'out_for_delivery'|'delivered'|'cancelled'|'refunded'
export type PaymentStatus = 'pending'|'paid'|'failed'|'refunded'
export type PaymentMethod = 'stripe'|'cash_on_delivery'|'wallet'|'instapay'

export interface IOrder extends Document {
  orderNumber:         string
  user:                mongoose.Types.ObjectId
  items: Array<{
    product:  mongoose.Types.ObjectId
    variant?: string
    name:     string
    image:    string
    price:    number
    quantity: number
    total:    number
  }>
  shippingAddress: {
    fullName: string; phone: string; street: string
    city: string; state: string; country: string; zipCode: string
  }
  status:        OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId?: string
  paymentProofImage?: string
  paymentProofFileName?: string
  subtotal:    number
  discount:    number
  deliveryFee: number
  tax:         number
  total:       number
  coupon?:     mongoose.Types.ObjectId
  couponCode?: string
  notes?:      string
  timeline: Array<{ status: string; message: string; timestamp: Date }>
  estimatedDelivery?: Date
  deliveredAt?:       Date
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },

    items: [{
      product:  { type: Schema.Types.ObjectId, ref: 'Product' },
      variant:  String,
      name:     { type: String, required: true },
      image:    { type: String, default: '' },
      price:    { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      total:    { type: Number, required: true },
    }],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      country:  { type: String, required: true },
      zipCode:  { type: String, required: true },
    },

    status: {
      type:    String,
      enum:    ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['stripe','cash_on_delivery','wallet','instapay'], required: true },
    stripePaymentIntentId: String,
    paymentProofImage: String,
    paymentProofFileName: String,

    subtotal:    { type: Number, required: true, min: 0 },
    discount:    { type: Number, default: 0,     min: 0 },
    deliveryFee: { type: Number, default: 0,     min: 0 },
    tax:         { type: Number, default: 0,     min: 0 },
    total:       { type: Number, required: true, min: 0 },

    coupon:     { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: String,
    notes:      String,

    timeline: [{
      status:    { type: String, required: true },
      message:   { type: String, required: true },
      timestamp: { type: Date,   default: Date.now },
    }],

    estimatedDelivery: Date,
    deliveredAt:       Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform(_doc: unknown, ret: Record<string, unknown>) { ret.__v = undefined; return ret } },
  },
)

// ─── Auto-generate order number ────────────────────────────────
OrderSchema.pre('save', async function (this: IOrder, next: (err?: Error) => void) {
  if ((this as { isNew?: boolean }).isNew) {
    const count = await (this.constructor as typeof mongoose.Model).countDocuments()
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`
    this.timeline.push({
      status:    'pending',
      message:   'Order placed successfully',
      timestamp: new Date(),
    })
  }
  next()
})

// ─── Indexes ───────────────────────────────────────────────────
OrderSchema.index({ user:        1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ status:      1 })
OrderSchema.index({ createdAt:  -1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
