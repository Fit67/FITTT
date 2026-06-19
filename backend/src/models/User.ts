import mongoose, { Schema, type Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAddress {
  _id:       mongoose.Types.ObjectId
  label:     'home' | 'work' | 'other'
  fullName:  string
  phone:     string
  street:    string
  city:      string
  state:     string
  country:   string
  zipCode:   string
  isDefault: boolean
}

export interface IUser extends Document {
  name:          string
  email:         string
  password:      string
  phone?:        string
  avatar?:       string
  role:          'customer' | 'admin' | 'manager' | 'staff'
  addresses:     IAddress[]
  wishlist:      mongoose.Types.ObjectId[]
  loyaltyPoints: number
  isVerified:    boolean
  isActive:      boolean
  googleId?:     string
  authProvider:  'local' | 'google'
  resetPasswordToken?:   string
  resetPasswordExpires?: Date
  comparePassword(candidate: string): Promise<boolean>
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>({
  label:     { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  fullName:  { type: String, required: true },
  phone:     { type: String, required: true },
  street:    { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  country:   { type: String, required: true },
  zipCode:   { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>(
  {
    name:  { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password:      { type: String, required: false, minlength: 6, select: false },
    phone:         { type: String, trim: true },
    avatar:        { type: String },
    role:          { type: String, enum: ['customer', 'admin', 'manager', 'staff'], default: 'customer' },
    addresses:     { type: [AddressSchema], default: [] },
    wishlist:      [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    isVerified:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    googleId:      { type: String, select: false },
    authProvider:  { type: String, enum: ['local', 'google'], default: 'local' },
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        // Use type-safe deletion via assignment
        ret.password             = undefined
        ret.resetPasswordToken   = undefined
        ret.resetPasswordExpires = undefined
        ret.__v                  = undefined
        return ret
      },
    },
  },
)

// ─── Hash password before save ─────────────────────────────────
UserSchema.pre('save', async function (this: mongoose.Document & IUser, next: (err?: Error) => void) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// ─── Compare passwords ─────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string)
}

// ─── Indexes ───────────────────────────────────────────────────
UserSchema.index({ email: 1 })
UserSchema.index({ role:  1 })
UserSchema.index({ createdAt: -1 })

export const User = mongoose.model<IUser>('User', UserSchema)
