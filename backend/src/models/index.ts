import mongoose, { Schema, type Document } from 'mongoose'

// ─── Coupon ────────────────────────────────────────────────────
export interface ICoupon extends Document {
  code:                  string
  type:                  'percentage' | 'fixed' | 'free_shipping'
  value:                 number
  minOrderAmount?:       number
  maxUses?:              number
  usedCount:             number
  expiresAt?:            Date
  applicableCategories?: mongoose.Types.ObjectId[]
  applicableProducts?:   mongoose.Types.ObjectId[]
  isActive:              boolean
  createdAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code:  { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:  { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount:       { type: Number, min: 0 },
    maxUses:              { type: Number, min: 1 },
    usedCount:            { type: Number, default: 0, min: 0 },
    expiresAt:            { type: Date },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts:   [{ type: Schema.Types.ObjectId, ref: 'Product'  }],
    isActive:             { type: Boolean, default: true },
  },
  { timestamps: true },
)
CouponSchema.index({ code: 1 })
export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema)

// ─── Review ────────────────────────────────────────────────────
export interface IReview extends Document {
  product:           mongoose.Types.ObjectId
  user:              mongoose.Types.ObjectId
  order?:            mongoose.Types.ObjectId
  rating:            number
  title:             string
  body:              string
  images?:           string[]
  isVerifiedPurchase:boolean
  helpfulCount:      number
  isApproved:        boolean
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product:            { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user:               { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    order:              { type: Schema.Types.ObjectId, ref: 'Order' },
    rating:             { type: Number, required: true, min: 1, max: 5 },
    title:              { type: String, required: true, maxlength: 150 },
    body:               { type: String, required: true, maxlength: 2000 },
    images:             [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulCount:       { type: Number,  default: 0, min: 0 },
    isApproved:         { type: Boolean, default: true },
  },
  { timestamps: true },
)
// Prevent duplicate reviews per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })
ReviewSchema.index({ product: 1, isApproved: 1 })

// Update product rating after save/delete — properly async with error swallowing
async function updateProductRating(productId: mongoose.Types.ObjectId): Promise<void> {
  try {
    const stats = await mongoose.model<IReview>('Review').aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': stats[0]?.average ?? 0,
      'ratings.count':   stats[0]?.count   ?? 0,
    })
  } catch (err) {
    console.error('[updateProductRating]', err)
  }
}

// Use async middleware — next() is called after the async work completes
ReviewSchema.post('save', async function (this: IReview) {
  await updateProductRating(this.product)
})
ReviewSchema.post('deleteOne', { document: true, query: false }, async function (this: IReview) {
  await updateProductRating(this.product)
})

export const Review = mongoose.model<IReview>('Review', ReviewSchema)

// ─── Category ──────────────────────────────────────────────────
export interface ICategory extends Document {
  name:         string
  slug:         string
  description?: string
  image?:       string
  icon?:        string
  color?:       string
  parent?:      mongoose.Types.ObjectId
  productCount: number
  isActive:     boolean
  sortOrder:    number
}

const CategorySchema = new Schema<ICategory>(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true },
    description:  { type: String },
    image:        { type: String },
    icon:         { type: String },
    color:        { type: String, default: '#16a34a' },
    parent:       { type: Schema.Types.ObjectId, ref: 'Category' },
    productCount: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
    sortOrder:    { type: Number,  default: 0 },
  },
  {
    timestamps:  true,
    toJSON:      { virtuals: true, transform(_doc: unknown, ret: Record<string, unknown>) { ret.__v = undefined; return ret } },
  },
)
CategorySchema.virtual('children', {
  ref:          'Category',
  localField:   '_id',
  foreignField: 'parent',
})
CategorySchema.index({ slug: 1 })
CategorySchema.index({ sortOrder: 1 })
export const Category = mongoose.model<ICategory>('Category', CategorySchema)

// ─── Banner ────────────────────────────────────────────────────
export interface IBanner extends Document {
  title:        string
  subtitle?:    string
  ctaText?:     string
  ctaLink?:     string
  image:        string
  mobileImage?: string
  position:     'hero' | 'middle' | 'sidebar' | 'popup'
  isActive:     boolean
  startDate?:   Date
  endDate?:     Date
  sortOrder:    number
}

const BannerSchema = new Schema<IBanner>(
  {
    title:       { type: String, required: true },
    subtitle:    { type: String },
    ctaText:     { type: String },
    ctaLink:     { type: String },
    image:       { type: String, required: true },
    mobileImage: { type: String },
    position:    { type: String, enum: ['hero','middle','sidebar','popup'], default: 'hero' },
    isActive:    { type: Boolean, default: true },
    startDate:   { type: Date },
    endDate:     { type: Date },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true },
)
BannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 })
export const Banner = mongoose.model<IBanner>('Banner', BannerSchema)
