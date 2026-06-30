import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const categorySchema = new mongoose.Schema({}, { strict: false });
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  // Ensure category exists
  let proteinCat = await Category.findOne({ slug: 'proteins' });
  if (!proteinCat) {
    proteinCat = await Category.create({
      name: 'Proteins',
      slug: 'proteins',
      description: 'High quality proteins',
      isActive: true,
      displayOrder: 1
    });
  }

  const products = [
    {
      name: 'RED REX PREMIUM PROTEIN',
      slug: 'red-rex-whey',
      description: 'The highest quality protein formula designed for maximum muscle recovery and growth.',
      shortDescription: 'Premium whey protein',
      images: [{ url: '/images/product-1.png', alt: 'RED REX', isPrimary: true }],
      price: 64.99,
      sku: 'RR-WHEY-01',
      category: proteinCat._id,
      status: 'active',
      inventory: { quantity: 100, trackInventory: true, reserved: 0, lowStockThreshold: 10, allowBackorder: false },
      metadata: { brand: 'BIG RAIAY LABS' }
    },
    {
      name: 'Muscle Add Whey Add',
      slug: 'muscle-add-whey',
      description: 'Advanced muscle building formula.',
      shortDescription: 'Advanced whey',
      images: [{ url: '/images/product-2.png', alt: 'MUSCLE ADD', isPrimary: true }],
      price: 54.99,
      sku: 'MA-WHEY-01',
      category: proteinCat._id,
      status: 'active',
      inventory: { quantity: 100, trackInventory: true, reserved: 0, lowStockThreshold: 10, allowBackorder: false },
      metadata: { brand: 'Muscle Add' }
    },
    {
      name: 'ON Gold Standard 100% Whey',
      slug: 'on-gold-standard-whey',
      description: 'The gold standard of protein powders.',
      shortDescription: 'Gold standard whey',
      images: [{ url: '/images/product-3.png', alt: 'OPTIMUM NUTRITION', isPrimary: true }],
      price: 74.99,
      sku: 'ON-WHEY-01',
      category: proteinCat._id,
      status: 'active',
      inventory: { quantity: 100, trackInventory: true, reserved: 0, lowStockThreshold: 10, allowBackorder: false },
      metadata: { brand: 'Optimum Nutrition' }
    }
  ];

  for (const p of products) {
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      console.log(`Updating ${p.slug}...`);
      await Product.updateOne({ _id: existing._id }, { $set: p });
    } else {
      console.log(`Creating ${p.slug}...`);
      await Product.create(p);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
