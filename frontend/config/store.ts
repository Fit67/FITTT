import type { StoreConfig } from '@/types'

// ============================================================
// MASTER STORE CONFIGURATION
// Change this file to completely rebrand the entire platform
// ============================================================

export const storeConfig: StoreConfig = {
  name: 'DoctorFit',
  tagline: 'Premium fitness products, delivered fast.',
  logo: '/images/logo.svg',
  favicon: '/favicon.ico',

  // ─── Business Type ─────────────────────────────────────────
  // Options: 'supermarket' | 'pharmacy' | 'restaurant' | 'gym'
  //          | 'electronics' | 'fashion' | 'pet' | 'cosmetics'
  businessType: 'gym',

  // ─── Localization ──────────────────────────────────────────
  currency: 'EGP',
  language: 'en',
  direction: 'ltr',

  // ─── Theme ─────────────────────────────────────────────────
  // Corresponds to a file in /themes/
  theme: 'default',
  primaryColor: '#d97706',   // login orange / amber-600
  accentColor: '#f59e0b',    // login orange / amber-500

  // ─── Hero Section ──────────────────────────────────────────
  // Options: 'fullscreen' | 'split' | 'minimal' | 'video' | 'carousel'
  heroStyle: 'split',

  // ─── Feature Flags ─────────────────────────────────────────
  enableWishlist: true,
  enableReviews: true,
  enableCoupons: true,
  enableLoyalty: true,

  // ─── Delivery ──────────────────────────────────────────────
  delivery: {
    minOrderAmount: 10,
    freeDeliveryThreshold: 2000,
    standardDeliveryFee: 80,
    expressDeliveryFee: 120,
    estimatedTime: { min: 30, max: 60, unit: 'min' },
    zones: ['Downtown', 'Uptown', 'Suburbs', 'North District'],
    cashOnDelivery: true,
  },

  // ─── Social ────────────────────────────────────────────────
  social: {
    instagram: 'https://instagram.com/doctorfit',
    facebook: 'https://facebook.com/doctorfit',
    tiktok: 'https://tiktok.com/@doctorfit',
    whatsapp: 'https://chat.whatsapp.com/invite-link', // WhatsApp Group link
  },

  // ─── Contact ───────────────────────────────────────────────
  contact: {
    email: 'doctorfit@gmail.com',
    phone: '+20 103 040 9766',
    address: '5th Settlement',
    city: 'CAIRO',
    country: 'EGYPT',
    workingHours: '24/7',
  },

  // ─── SEO ───────────────────────────────────────────────────
  seo: {
    title: 'DoctorFit - Premium Fitness Products',
    description: 'Shop premium supplements and fitness essentials with fast delivery to your door.',
    keywords: ['fitness', 'supplements', 'gym', 'protein', 'online shopping'],
    ogImage: '/images/og-image.jpg',
  },
}

// ─── Business-type adaptations ─────────────────────────────────
export const businessTypeConfig = {
  supermarket: {
    productCardStyle: 'grocery',
    enableCalories: false,
    enableDosage: false,
    enableNutrition: false,
    enableMealCustomization: false,
    categoryGridCols: 6,
    heroHeadline: 'Fresh Groceries, Delivered Fast',
    heroSubtext: 'Shop thousands of products with same-day delivery.',
    accentLabels: ['Fresh Pick', 'Best Value', 'Bulk Deal'],
    filterShowBrands: true,
    filterShowWeight: true,
  },
  pharmacy: {
    productCardStyle: 'medicine',
    enableCalories: false,
    enableDosage: true,
    enableNutrition: false,
    enableMealCustomization: false,
    categoryGridCols: 4,
    heroHeadline: 'Your Health, Our Priority',
    heroSubtext: 'Trusted medications and health essentials delivered to your door.',
    accentLabels: ['OTC', 'Prescription', 'Natural'],
    filterShowBrands: true,
    filterShowWeight: false,
  },
  restaurant: {
    productCardStyle: 'food',
    enableCalories: true,
    enableDosage: false,
    enableNutrition: true,
    enableMealCustomization: true,
    categoryGridCols: 4,
    heroHeadline: 'Crave It. Order It. Love It.',
    heroSubtext: 'Restaurant-quality meals delivered hot and fresh.',
    accentLabels: ['Chef\'s Pick', 'New', 'Popular'],
    filterShowBrands: false,
    filterShowWeight: false,
  },
  gym: {
    productCardStyle: 'supplement',
    enableCalories: true,
    enableDosage: true,
    enableNutrition: true,
    enableMealCustomization: false,
    categoryGridCols: 4,
    heroHeadline: 'Fuel Your Performance',
    heroSubtext: 'Premium supplements for serious athletes.',
    accentLabels: ['Best Seller', 'New Formula', 'Stacked'],
    filterShowBrands: true,
    filterShowWeight: true,
  },
  electronics: {
    productCardStyle: 'tech',
    enableCalories: false,
    enableDosage: false,
    enableNutrition: false,
    enableMealCustomization: false,
    categoryGridCols: 5,
    heroHeadline: 'Next-Level Technology',
    heroSubtext: 'The latest gadgets, appliances, and accessories.',
    accentLabels: ['New Arrival', 'Trending', 'Deal'],
    filterShowBrands: true,
    filterShowWeight: false,
  },
  fashion: {
    productCardStyle: 'apparel',
    enableCalories: false,
    enableDosage: false,
    enableNutrition: false,
    enableMealCustomization: false,
    categoryGridCols: 4,
    heroHeadline: 'Wear What Moves You',
    heroSubtext: 'Curated styles for every occasion.',
    accentLabels: ['New In', 'Sale', 'Limited'],
    filterShowBrands: true,
    filterShowWeight: false,
  },
  pet: {
    productCardStyle: 'grocery',
    enableCalories: true,
    enableDosage: false,
    enableNutrition: true,
    enableMealCustomization: false,
    categoryGridCols: 5,
    heroHeadline: 'The Best for Your Pet',
    heroSubtext: 'Food, treats, accessories — everything your furry friend needs.',
    accentLabels: ['Vet Approved', 'Natural', 'New'],
    filterShowBrands: true,
    filterShowWeight: true,
  },
  cosmetics: {
    productCardStyle: 'beauty',
    enableCalories: false,
    enableDosage: false,
    enableNutrition: false,
    enableMealCustomization: false,
    categoryGridCols: 5,
    heroHeadline: 'Beauty Redefined',
    heroSubtext: 'Premium skincare, makeup, and wellness essentials.',
    accentLabels: ['Clean Beauty', 'Cruelty-Free', 'New'],
    filterShowBrands: true,
    filterShowWeight: false,
  },
} as const

export type BusinessTypeConfig = typeof businessTypeConfig
export const currentBusiness = businessTypeConfig[storeConfig.businessType]
