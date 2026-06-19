// ============================================================
// CORE PLATFORM TYPES
// ============================================================

// ─── Store / Business ────────────────────────────────────────
export type BusinessType =
  | 'supermarket'
  | 'pharmacy'
  | 'restaurant'
  | 'gym'
  | 'electronics'
  | 'fashion'
  | 'pet'
  | 'cosmetics'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'SAR' | 'AED'
export type Language = 'en' | 'ar' | 'fr' | 'de'
export type Direction = 'ltr' | 'rtl'

export interface StoreConfig {
  name: string
  tagline: string
  logo: string
  favicon: string
  businessType: BusinessType
  currency: Currency
  language: Language
  direction: Direction
  theme: string
  primaryColor: string
  accentColor: string
  heroStyle: 'fullscreen' | 'split' | 'minimal' | 'video' | 'carousel'
  enableWishlist: boolean
  enableReviews: boolean
  enableCoupons: boolean
  enableLoyalty: boolean
  delivery: DeliveryConfig
  social: SocialLinks
  contact: ContactInfo
  seo: SEOConfig
}

export interface DeliveryConfig {
  minOrderAmount: number
  freeDeliveryThreshold: number
  standardDeliveryFee: number
  expressDeliveryFee: number
  estimatedTime: { min: number; max: number; unit: 'min' | 'hours' | 'days' }
  zones: string[]
  cashOnDelivery: boolean
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  whatsapp?: string
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  city: string
  country: string
  workingHours: string
}

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  ogImage: string
}

// ─── User ────────────────────────────────────────────────────
export type UserRole = 'customer' | 'admin' | 'manager' | 'staff'

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  addresses: Address[]
  wishlist: string[]
  loyaltyPoints: number
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  _id: string
  label: 'home' | 'work' | 'other'
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault: boolean
}

// ─── Auth ─────────────────────────────────────────────────────
export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  message: string
}

// ─── Product ──────────────────────────────────────────────────
export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  images: ProductImage[]
  price: number
  comparePrice?: number
  cost?: number
  sku: string
  barcode?: string
  category: Category
  subcategory?: string
  tags: string[]
  attributes: ProductAttribute[]
  variants: ProductVariant[]
  inventory: Inventory
  ratings: ProductRatings
  status: ProductStatus
  isFeatured: boolean
  isTopSeller: boolean
  isNew: boolean
  metadata: ProductMetadata
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductAttribute {
  name: string
  value: string
  unit?: string
}

export interface ProductVariant {
  _id: string
  name: string
  options: VariantOption[]
  price: number
  comparePrice?: number
  sku: string
  inventory: number
  image?: string
}

export interface VariantOption {
  name: string   // e.g. "Color", "Size"
  value: string  // e.g. "Red", "XL"
}

export interface Inventory {
  quantity: number
  reserved: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorder: boolean
}

export interface ProductRatings {
  average: number
  count: number
  distribution: { [star: number]: number }
}

// Business-type specific metadata
export interface ProductMetadata {
  // Restaurant
  calories?: number
  prepTime?: number
  ingredients?: string[]
  allergens?: string[]
  dietary?: string[]
  spiceLevel?: number
  // Pharmacy
  dosage?: string
  warnings?: string[]
  sideEffects?: string[]
  prescription?: boolean
  // Gym
  servingSize?: string
  servingsPerContainer?: number
  nutritionFacts?: Record<string, string>
  flavorOptions?: string[]
  // General
  brand?: string
  weight?: number
  dimensions?: { l: number; w: number; h: number }
  color?: string
  material?: string
  careInstructions?: string[]
}

// ─── Category ─────────────────────────────────────────────────
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  color?: string
  parent?: string
  children?: Category[]
  productCount: number
  isActive: boolean
  sortOrder: number
}

// ─── Cart ──────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
  notes?: string
}

export interface Cart {
  items: CartItem[]
  coupon?: Coupon
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
}

// ─── Order ─────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'cash_on_delivery' | 'wallet' | 'instapay'

export interface Order {
  _id: string
  orderNumber: string
  user: Pick<User, '_id' | 'name' | 'email' | 'phone'>
  items: OrderItem[]
  shippingAddress: Address
  billing: BillingInfo
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId?: string
  paymentProofImage?: string
  paymentProofFileName?: string
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  coupon?: Coupon
  notes?: string
  timeline: OrderTimeline[]
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product?: Pick<Product, '_id' | 'name' | 'images' | 'slug'> | string
  variant?: string
  name?: string
  image?: string
  quantity: number
  price: number
  total: number
}

export interface BillingInfo {
  name: string
  email: string
  phone: string
}

export interface OrderTimeline {
  status: OrderStatus
  message: string
  timestamp: string
}

// ─── Review ────────────────────────────────────────────────────
export interface Review {
  _id: string
  product: string
  user: Pick<User, '_id' | 'name' | 'avatar'>
  rating: number
  title: string
  body: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
}

// ─── Coupon ────────────────────────────────────────────────────
export type DiscountType = 'percentage' | 'fixed' | 'free_shipping'

export interface Coupon {
  _id: string
  code: string
  type: DiscountType
  value: number
  minOrderAmount?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  applicableCategories?: string[]
  applicableProducts?: string[]
  isActive: boolean
}

// ─── Banner / Promotion ────────────────────────────────────────
export interface Banner {
  _id: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  image: string
  mobileImage?: string
  position: 'hero' | 'middle' | 'sidebar' | 'popup'
  isActive: boolean
  startDate?: string
  endDate?: string
  sortOrder: number
}

// ─── API Response ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── Filters ───────────────────────────────────────────────────
export interface ProductFilters {
  search?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  tags?: string[]
  ratings?: number
  inStock?: boolean
  isNew?: boolean
  onSale?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  limit?: number
}

// ─── Analytics ─────────────────────────────────────────────────
export interface DashboardStats {
  revenue:   { total: number; growth: number; chartData: ChartPoint[] }
  orders:    {
    total: number; growth: number; pending: number
    byStatus: Record<string, number>
  }
  customers: { total: number; growth: number; newToday: number }
  products:  { total: number; lowStock: number; outOfStock: number }
  topProducts: TopProduct[]
  recentOrders: Order[]
}

export interface ChartPoint {
  label: string
  value: number
}

export interface TopProduct {
  product: Pick<Product, '_id' | 'name' | 'images' | 'price'>
  sold: number
  revenue: number
}

export interface CategorySales {
  category: string
  revenue: number
  percentage: number
}

// ─── UI State ──────────────────────────────────────────────────
export interface ToastOptions {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface ModalState {
  isOpen: boolean
  type: string | null
  data?: unknown
}
