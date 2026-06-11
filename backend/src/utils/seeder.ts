/**
 * Database seeder — run with: npm run seed
 * Creates: admin user, categories, sample products, banners, coupons
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { User }     from '../models/User'
import { Product }  from '../models/Product'
import { Category, Coupon, Banner } from '../models/index'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ecommerce')
  console.log('🌱  Seeding database…')

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
  ])

  // ─── Admin user ─────────────────────────────────────────────
  const admin = await User.create({
    name:       'Admin User',
    email:      'admin@doctorfit.com',
    password:   'Admin123!',
    role:       'admin',
    isVerified: true,
  })
  console.log('✅  Admin created:', admin.email)

  // ─── Categories ──────────────────────────────────────────────
  const catData = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥦', color: '#16a34a', sortOrder: 1 },
    { name: 'Dairy & Eggs',        slug: 'dairy-eggs',        icon: '🥛', color: '#0ea5e9', sortOrder: 2 },
    { name: 'Bakery',              slug: 'bakery',            icon: '🍞', color: '#f97316', sortOrder: 3 },
    { name: 'Meat & Seafood',      slug: 'meat-seafood',      icon: '🥩', color: '#ef4444', sortOrder: 4 },
    { name: 'Pantry',              slug: 'pantry',            icon: '🥫', color: '#eab308', sortOrder: 5 },
    { name: 'Beverages',           slug: 'beverages',         icon: '🧃', color: '#8b5cf6', sortOrder: 6 },
    { name: 'Snacks',              slug: 'snacks',            icon: '🍪', color: '#ec4899', sortOrder: 7 },
    { name: 'Frozen',              slug: 'frozen',            icon: '🧊', color: '#06b6d4', sortOrder: 8 },
  ]
  const categories = await Category.insertMany(catData)
  console.log('✅  Categories created:', categories.length)

  // ─── Products ─────────────────────────────────────────────────
  const catMap = Object.fromEntries(categories.map((c: { slug: string; _id: unknown }) => [c.slug, c._id]))

  const productData = [
    {
      name: 'Organic Avocado',
      slug: 'organic-avocado',
      description: 'Fresh organic avocados sourced from certified farms. Rich in healthy fats and nutrients.',
      shortDescription: 'Creamy organic avocados, perfect for guacamole.',
      images: [{ url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600', alt: 'Organic Avocado', isPrimary: true }],
      price: 2.49, comparePrice: 3.49, sku: 'VEG-001',
      category: catMap['fruits-vegetables'],
      tags: ['organic', 'fresh', 'vegan'],
      inventory: { quantity: 100, reserved: 0, lowStockThreshold: 10, trackInventory: true, allowBackorder: false },
      ratings: { average: 4.8, count: 245 },
      status: 'active', isFeatured: true, newArrival: false,
    },
    {
      name: 'Free-Range Eggs (12)',
      slug: 'free-range-eggs-12',
      description: 'Farm-fresh free-range eggs from happy hens. Higher in omega-3 and vitamins.',
      shortDescription: 'Fresh dozen free-range eggs.',
      images: [{ url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600', alt: 'Free-Range Eggs', isPrimary: true }],
      price: 5.99, sku: 'DAIRY-001',
      category: catMap['dairy-eggs'],
      tags: ['free-range', 'protein', 'breakfast'],
      inventory: { quantity: 80, reserved: 0, lowStockThreshold: 15, trackInventory: true, allowBackorder: false },
      ratings: { average: 4.9, count: 412 },
      status: 'active', isFeatured: true, newArrival: false,
    },
    {
      name: 'Whole Grain Sourdough',
      slug: 'whole-grain-sourdough',
      description: 'Artisan whole grain sourdough bread baked fresh daily. Rich, tangy flavor with a perfect crust.',
      shortDescription: 'Artisan sourdough baked fresh daily.',
      images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', alt: 'Sourdough Bread', isPrimary: true }],
      price: 6.49, sku: 'BAK-001',
      category: catMap['bakery'],
      tags: ['artisan', 'whole-grain', 'fresh'],
      inventory: { quantity: 30, reserved: 0, lowStockThreshold: 5, trackInventory: true, allowBackorder: false },
      ratings: { average: 4.7, count: 183 },
      status: 'active', isFeatured: false, newArrival: true,
    },
    {
      name: 'Organic Whole Milk (1 Gallon)',
      slug: 'organic-whole-milk-gallon',
      description: 'USDA certified organic whole milk from grass-fed cows. Creamy, rich, and full of nutrients.',
      shortDescription: 'USDA organic milk from grass-fed cows.',
      images: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600', alt: 'Organic Milk', isPrimary: true }],
      price: 7.29, comparePrice: 8.99, sku: 'DAIRY-002',
      category: catMap['dairy-eggs'],
      tags: ['organic', 'dairy', 'grass-fed'],
      inventory: { quantity: 60, reserved: 0, lowStockThreshold: 12, trackInventory: true, allowBackorder: false },
      ratings: { average: 4.6, count: 289 },
      status: 'active', isFeatured: true, newArrival: false,
    },
    {
      name: 'Atlantic Salmon Fillet',
      slug: 'atlantic-salmon-fillet',
      description: 'Premium Atlantic salmon fillets, sustainably sourced. Rich in omega-3 fatty acids.',
      shortDescription: 'Fresh Atlantic salmon, sustainably sourced.',
      images: [{ url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600', alt: 'Salmon Fillet', isPrimary: true }],
      price: 14.99, sku: 'MEAT-001',
      category: catMap['meat-seafood'],
      tags: ['seafood', 'omega-3', 'protein'],
      inventory: { quantity: 25, reserved: 0, lowStockThreshold: 5, trackInventory: true, allowBackorder: false },
      ratings: { average: 4.8, count: 156 },
      status: 'active', isFeatured: true, newArrival: false,
    },
    {
      name: 'Mixed Berry Granola',
      slug: 'mixed-berry-granola',
      description: 'Crunchy granola packed with mixed berries, nuts, and honey. Perfect for breakfast or snacking.',
      shortDescription: 'Crunchy granola with mixed berries and honey.',
      images: [{ url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600', alt: 'Granola', isPrimary: true }],
      price: 8.49, comparePrice: 10.99, sku: 'SNACK-001',
      category: catMap['snacks'],
      tags: ['breakfast', 'granola', 'healthy'],
      inventory: { quantity: 75, reserved: 0, lowStockThreshold: 10, trackInventory: true, allowBackorder: true },
      ratings: { average: 4.5, count: 321 },
      status: 'active', isFeatured: false, newArrival: true,
    },
  ]

  const products = await Product.insertMany(productData)
  console.log('✅  Products created:', products.length)

  // Update category product counts
  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat._id, status: 'active' })
    await Category.findByIdAndUpdate(cat._id, { productCount: count })
  }

  // ─── Coupons ──────────────────────────────────────────────────
  await Coupon.insertMany([
    {
      code:      'WELCOME10',
      type:      'percentage',
      value:     10,
      minOrderAmount: 20,
      maxUses:   1000,
      isActive:  true,
    },
    {
      code:      'FREESHIP',
      type:      'free_shipping',
      value:     4.99,
      minOrderAmount: 30,
      isActive:  true,
    },
    {
      code:      'SAVE5',
      type:      'fixed',
      value:     5,
      minOrderAmount: 40,
      maxUses:   500,
      isActive:  true,
    },
  ])
  console.log('✅  Coupons created')

  // ─── Banners ──────────────────────────────────────────────────
  await Banner.insertMany([
    {
      title:    'Fresh Picks This Week',
      subtitle: 'Limited Time',
      ctaText:  'Shop Now',
      ctaLink:  '/shop/products?isNew=true',
      image:    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
      position: 'middle',
      isActive: true,
      sortOrder: 1,
    },
    {
      title:    'Up to 30% Off Dairy',
      subtitle: 'Weekend Deal',
      ctaText:  'Grab the Deal',
      ctaLink:  '/shop/products?category=dairy-eggs&onSale=true',
      image:    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200',
      position: 'middle',
      isActive: true,
      sortOrder: 2,
    },
  ])
  console.log('✅  Banners created')

  console.log('\n🎉  Seeding complete!')
  console.log('   Admin: admin@doctorfit.com / Admin123!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
