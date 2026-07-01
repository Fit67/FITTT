import 'dotenv/config'
import mongoose from 'mongoose'
import { Product } from '../models/Product'
import { Category } from '../models/index'

async function restore() {
  await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/doctorfit')
  
  const category = await Category.findOne()
  if (!category) {
    console.log("No category found!")
    process.exit(1)
  }

  const newProducts = [
    {
      name: 'Red Rex Premium Protein',
      slug: 'red-rex-whey',
      description: 'The highest quality protein formula designed for maximum muscle recovery and growth.',
      shortDescription: 'Premium Protein',
      price: 1500,
      sku: 'RED-REX-01',
      category: category._id,
      status: 'active',
      images: [{ url: '/images/product-1.png', alt: 'Red Rex', isPrimary: true }],
      inventory: { quantity: 100, reserved: 0, lowStockThreshold: 5, trackInventory: true, allowBackorder: false }
    },
    {
      name: 'Muscle Add Whey',
      slug: 'muscle-add-whey',
      description: 'Advanced whey protein isolate for serious athletes.',
      shortDescription: 'Whey Protein',
      price: 1200,
      sku: 'MUSCLE-ADD-01',
      category: category._id,
      status: 'active',
      images: [{ url: '/images/product-2.png', alt: 'Muscle Add', isPrimary: true }],
      inventory: { quantity: 50, reserved: 0, lowStockThreshold: 5, trackInventory: true, allowBackorder: false }
    },
    {
      name: 'ON Gold Standard Whey',
      slug: 'on-gold-standard-whey',
      description: 'The gold standard of whey protein. Proven results.',
      shortDescription: 'Gold Standard Whey',
      price: 2000,
      sku: 'ON-GOLD-01',
      category: category._id,
      status: 'active',
      images: [{ url: '/images/product-3.png', alt: 'ON Gold Standard', isPrimary: true }],
      inventory: { quantity: 200, reserved: 0, lowStockThreshold: 5, trackInventory: true, allowBackorder: false }
    }
  ]

  // Upsert to not duplicate if already there
  for (const p of newProducts) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true })
  }
  
  console.log('Restored 3 products successfully!')
  process.exit(0)
}

restore().catch(console.error)
