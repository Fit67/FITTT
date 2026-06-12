import mongoose, { Schema, type Document } from 'mongoose'

interface IProductImage  { url: string; alt: string; isPrimary: boolean }
interface IAttribute     { name: string; value: string; unit?: string }
interface IVariantOption { name: string; value: string }

export interface IVariant {
  _id:           mongoose.Types.ObjectId
  name:          string
  options:       IVariantOption[]
  price:         number
  comparePrice?: number
  sku:           string
  inventory:     number
  image?:        string
}

interface IInventory {
  quantity:          number
  reserved:          number
  lowStockThreshold: number
  trackInventory:    boolean
  allowBackorder:    boolean
}

interface IProductMetadata {
  // Restaurant
  calories?: number; prepTime?: number; ingredients?: string[]
  allergens?: string[]; dietary?: string[]; spiceLevel?: number
  // Pharmacy
  dosage?: string; warnings?: string[]; sideEffects?: string[]; prescription?: boolean
  // Gym
  servingSize?: string; servingsPerContainer?: number
  nutritionFacts?: Map<string, string>; flavorOptions?: string[]
  // General
  brand?: string; weight?: number
  dimensions?: { l: number; w: number; h: number }
  color?: string; material?: string; careInstructions?: string[]
}

export interface IProduct extends Document {
  name:             string
  slug:             string
  description:      string
  shortDescription: string
  images:           IProductImage[]
  price:            number
  comparePrice?:    number
  cost?:            number
  sku:              string
  barcode?:         string
  category:         mongoose.Types.ObjectId
  subcategory?:     string
  tags:             string[]
  attributes:       IAttribute[]
  variants:         IVariant[]
  inventory:        IInventory
  ratings:          { average: number; count: number }
  status:           'active' | 'draft' | 'archived' | 'out_of_stock'
  isFeatured:       boolean
  isTopSeller:      boolean
  // NOTE: "isNew" is reserved by Mongoose (indicates unsaved document).
  // We store it as "newArrival" in the schema but expose "isNew" via virtual.
  newArrival:       boolean
  metadata:         IProductMetadata
  createdAt:        Date
  updatedAt:        Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true },
    description:      { type: String, required: true },
    shortDescription: { type: String, maxlength: 300 },

    images: [{
      url:       { type: String, required: true },
      alt:       { type: String, default: '' },
      isPrimary: { type: Boolean, default: false },
    }],

    price:        { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    cost:         { type: Number, min: 0 },
    sku:          { type: String, required: true },
    barcode:      { type: String },

    category:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String },
    tags:        [{ type: String, lowercase: true }],

    attributes: [{ name: String, value: String, unit: String }],

    variants: [{
      name:         { type: String },
      options:      [{ name: String, value: String }],
      price:        { type: Number, min: 0 },
      comparePrice: { type: Number },
      sku:          { type: String },
      inventory:    { type: Number, default: 0 },
      image:        { type: String },
    }],

    inventory: {
      quantity:          { type: Number, default: 0,     min: 0 },
      reserved:          { type: Number, default: 0,     min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      trackInventory:    { type: Boolean, default: true  },
      allowBackorder:    { type: Boolean, default: false },
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0, min: 0 },
    },

    status:     { type: String, enum: ['active','draft','archived','out_of_stock'], default: 'active' },
    isFeatured: { type: Boolean, default: false },
    isTopSeller: { type: Boolean, default: false },
    // Stored as "newArrival" to avoid conflict with Mongoose's built-in "isNew" property
    newArrival: { type: Boolean, default: true },

    metadata: {
      calories: Number, prepTime: Number,
      ingredients: [String], allergens: [String], dietary: [String], spiceLevel: Number,
      dosage: String, warnings: [String], sideEffects: [String], prescription: Boolean,
      servingSize: String, servingsPerContainer: Number,
      nutritionFacts: { type: Map, of: String }, flavorOptions: [String],
      brand: String, weight: Number,
      dimensions: { l: Number, w: Number, h: Number },
      color: String, material: String, careInstructions: [String],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc: unknown, ret: Record<string, unknown>) {
        // Expose newArrival as isNew for frontend compatibility
        ret.isNew = ret.newArrival
        ret.__v   = undefined
        return ret
      },
    },
  },
)

// ─── Indexes ───────────────────────────────────────────────────
ProductSchema.index({ slug:       1 })
ProductSchema.index({ category:   1 })
ProductSchema.index({ status:     1 })
ProductSchema.index({ isFeatured: 1 })
ProductSchema.index({ price:      1 })
ProductSchema.index({ newArrival: 1 })
ProductSchema.index({ 'ratings.average': -1 })
ProductSchema.index({ createdAt:  -1 })
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })

// ─── Auto-update category productCount ─────────────────────────
// Runs after every save (create / update) and after delete
async function syncCategoryCount(categoryId: mongoose.Types.ObjectId | undefined | null) {
  if (!categoryId) return
  try {
    const count = await mongoose.model('Product').countDocuments({
      category: categoryId,
      status:   'active',
    })
    await mongoose.model('Category').findByIdAndUpdate(categoryId, { productCount: count })
  } catch (err) {
    console.error('[syncCategoryCount]', err)
  }
}

ProductSchema.post('save', async function (this: IProduct) {
  await syncCategoryCount(this.category as mongoose.Types.ObjectId)
})

// findByIdAndUpdate triggers findOneAndUpdate
ProductSchema.post('findOneAndUpdate', async function () {
  const doc = await this.model.findOne(this.getQuery()).lean<IProduct>()
  if (doc) await syncCategoryCount(doc.category as mongoose.Types.ObjectId)
})

ProductSchema.post('deleteOne', { document: true, query: false }, async function (this: IProduct) {
  await syncCategoryCount(this.category as mongoose.Types.ObjectId)
})

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
