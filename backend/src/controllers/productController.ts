import type { Request, Response, NextFunction } from 'express'
import mongoose, { SortOrder } from 'mongoose'
import { Product }  from '../models/Product'
import { Category } from '../models/index'
import { AppError } from '../middleware/errorHandler'
import { uploadImageBuffer } from '../utils/cloudinary'

const toBool = (val: any) => val === 'true' || val === true

// ─── GET /products ─────────────────────────────────────────────
export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search, category, subcategory,
      minPrice, maxPrice, brands, tags,
      inStock, isNew, onSale,
      sortBy = 'popular',
      page   = 1,
      limit  = 24,
    } = req.query as Record<string, string | undefined>

    const filter: Record<string, unknown> = { status: 'active' }

    if (search)           filter.$text       = { $search: search }
    if (subcategory)      filter.subcategory = subcategory
    if (inStock === 'true') filter['inventory.quantity'] = { $gt: 0 }
    
    if (category) {
      const catDoc = await Category.findOne({ slug: category }).select('_id').lean()
      if (!catDoc) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0, hasNext: false, hasPrev: false }
        })
      }
      filter.category = catDoc._id
    }
    if (isNew   === 'true') filter.newArrival = true        // field renamed from isNew
    if (onSale  === 'true') filter.comparePrice = { $exists: true }

    if (brands) {
      const brandList = Array.isArray(brands) ? brands : [brands]
      filter['metadata.brand'] = { $in: brandList }
    }
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags]
      filter.tags = { $in: tagList }
    }
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      }
    }

    // Strongly-typed sort map — cast values as SortOrder for Mongoose compatibility
    const sortMap: Record<string, Record<string, SortOrder>> = {
      popular:    { 'ratings.count':   -1 },
      newest:     { createdAt:         -1 },
      price_asc:  { price:              1 },
      price_desc: { price:             -1 },
      rating:     { 'ratings.average': -1 },
    }
    const sort = sortMap[sortBy] ?? sortMap.popular

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(filter)

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    res.json({
      success: true,
      data:    products,
      pagination: {
        page:    Number(page),
        limit:   Number(limit),
        total,
        pages:   Math.ceil(total / Number(limit)),
        hasNext: skip + products.length < total,
        hasPrev: Number(page) > 1,
      },
    })
  } catch (err) { next(err) }
}

// ─── GET /products/search ──────────────────────────────────────
export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, limit = '10' } = req.query as { q?: string; limit?: string }
    if (!q || q.trim().length < 2) return res.json({ success: true, data: [] })

    const products = await Product.find(
      { $text: { $search: q }, status: 'active' },
      { score: { $meta: 'textScore' } },
    )
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit))
      .lean()

    res.json({ success: true, data: products })
  } catch (err) { next(err) }
}

// ─── GET /products/featured ────────────────────────────────────
export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '8' } = req.query as { limit?: string }
    const products = await Product.find({ isFeatured: true, status: 'active' })
      .populate('category', 'name slug')
      .sort({ 'ratings.average': -1 as SortOrder })
      .limit(Number(limit))
      .lean()
    res.json({ success: true, data: products })
  } catch (err) { next(err) }
}

// ─── GET /products/top-sellers ─────────────────────────────────
export async function getTopSellersProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '4' } = req.query as { limit?: string }
    const products = await Product.find({ isTopSeller: true, status: 'active' })
      .populate('category', 'name slug')
      .sort({ 'ratings.average': -1 as SortOrder })
      .limit(Number(limit))
      .lean()
    res.json({ success: true, data: products })
  } catch (err) { next(err) }
}

// ─── GET /products/new ─────────────────────────────────────────
export async function getNewProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '8' } = req.query as { limit?: string }
    const products = await Product.find({ newArrival: true, status: 'active' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 as SortOrder })
      .limit(Number(limit))
      .lean()
    res.json({ success: true, data: products })
  } catch (err) { next(err) }
}

// ─── GET /products/:slug ───────────────────────────────────────
export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category', 'name slug')
      .lean()
    if (!product) return next(new AppError('Product not found', 404))
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
}

// ─── GET /products/:id/related ─────────────────────────────────
export async function getRelatedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '6' } = req.query as { limit?: string }
    const product = await Product.findById(req.params.id).lean()
    if (!product) return next(new AppError('Product not found', 404))

    const related = await Product.find({
      _id:      { $ne: product._id },
      category: product.category,
      status:   'active',
    })
      .populate('category', 'name slug')
      .limit(Number(limit))
      .lean()

    res.json({ success: true, data: related })
  } catch (err) { next(err) }
}

// ─── Admin: Create product ─────────────────────────────────────
export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[createProduct] req.body:', req.body)
    console.log('[createProduct] req.file:', req.file ? 'File attached' : 'No file')
    
    const productData = { ...req.body }
    if (productData.isFeatured !== undefined) productData.isFeatured = toBool(productData.isFeatured)
    if (productData.isTopSeller !== undefined) productData.isTopSeller = toBool(productData.isTopSeller)
    if (productData.newArrival !== undefined) productData.newArrival = toBool(productData.newArrival)

    if (productData.inventory && typeof productData.inventory === 'string') {
      try { productData.inventory = JSON.parse(productData.inventory) } catch (e) {}
    } else if (productData.quantity) {
      productData.inventory = { quantity: Number(productData.quantity), inStock: Number(productData.quantity) > 0 }
    }

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer)
      productData.images = [{ url: uploadResult.secure_url, alt: productData.name, isPrimary: true }]
    }

    const product = await Product.create(productData)
    res.status(201).json({ success: true, data: product, message: 'Product created' })
  } catch (err) { next(err) }
}

// ─── Admin: Update product ─────────────────────────────────────
export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[updateProduct] req.body:', req.body)
    console.log('[updateProduct] req.file:', req.file ? 'File attached' : 'No file')

    const productData = { ...req.body }
    if (productData.isFeatured !== undefined) productData.isFeatured = toBool(productData.isFeatured)
    if (productData.isTopSeller !== undefined) productData.isTopSeller = toBool(productData.isTopSeller)
    if (productData.newArrival !== undefined) productData.newArrival = toBool(productData.newArrival)

    if (productData.inventory && typeof productData.inventory === 'string') {
      try { productData.inventory = JSON.parse(productData.inventory) } catch (e) {}
    } else if (productData.quantity !== undefined) {
      productData.inventory = { quantity: Number(productData.quantity), inStock: Number(productData.quantity) > 0 }
    }

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer)
      productData.images = [{ url: uploadResult.secure_url, alt: productData.name, isPrimary: true }]
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true, runValidators: true,
    }).populate('category', 'name slug')
    if (!product) return next(new AppError('Product not found', 404))
    res.json({ success: true, data: product, message: 'Product updated' })
  } catch (err) { next(err) }
}

// ─── Admin: Archive product ────────────────────────────────────
export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { status: 'archived' }, { new: true },
    )
    if (!product) return next(new AppError('Product not found', 404))
    res.json({ success: true, message: 'Product archived' })
  } catch (err) { next(err) }
}
