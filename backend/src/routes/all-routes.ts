// =============================================================
// ALL ROUTE DEFINITIONS
// All imports MUST be at the top — TypeScript/CommonJS requirement
// =============================================================

import { Router }                              from 'express'
import type { Request, Response, NextFunction } from 'express'
import Stripe                                  from 'stripe'

import { authenticate, authorize, optionalAuth, requireUser } from '../middleware/auth'
import { AppError }      from '../middleware/errorHandler'
import * as productCtrl  from '../controllers/productController'
import * as orderCtrl    from '../controllers/orderController'
import { upload }        from '../middleware/upload'

// Model imports — all at top level
import { Category } from '../models/index'
import { Review   } from '../models/index'
import { Coupon   } from '../models/index'
import { Banner   } from '../models/index'

// ─── Products ──────────────────────────────────────────────────
export const productRouter = Router()

productRouter.get ('/',          optionalAuth, productCtrl.getProducts)
productRouter.get ('/search',                  productCtrl.searchProducts)
productRouter.get ('/featured',                productCtrl.getFeaturedProducts)
productRouter.get ('/top-sellers',             productCtrl.getTopSellersProducts)
productRouter.get ('/new',                     productCtrl.getNewProducts)
productRouter.get ('/:slug',     optionalAuth, productCtrl.getProductBySlug)
productRouter.get ('/:id/related',             productCtrl.getRelatedProducts)

// ─── Categories ────────────────────────────────────────────────
export const categoryRouter = Router()

categoryRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
    res.json({ success: true, data: cats })
  } catch (err) { next(err) }
})

categoryRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true }).lean()
    if (!cat) return next(new AppError('Category not found', 404))
    res.json({ success: true, data: cat })
  } catch (err) { next(err) }
})

// ─── Orders ────────────────────────────────────────────────────
export const orderRouter = Router()
orderRouter.use(authenticate)

orderRouter.post ('/',            orderCtrl.createOrder)
orderRouter.get  ('/me',          orderCtrl.getMyOrders)
orderRouter.get  ('/:id',         orderCtrl.getOrderById)
orderRouter.patch('/:id/cancel',  orderCtrl.cancelOrder)

// ─── Reviews ──────────────────────────────────────────────────
// Mount at /api (not /api/reviews) so paths resolve correctly:
//   GET  /api/products/:productId/reviews
//   POST /api/products/:productId/reviews
//   DELETE /api/reviews/:id
export const reviewRouter = Router()

reviewRouter.get(
  '/products/:productId/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Number(req.query.page ?? 1)
      const limit = 10
      const skip  = (page - 1) * limit
      const total = await Review.countDocuments({
        product:    req.params.productId,
        isApproved: true,
      })
      const reviews = await Review.find({
        product:    req.params.productId,
        isApproved: true,
      })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      res.json({
        success: true,
        data:    reviews,
        pagination: {
          page, limit, total,
          pages:   Math.ceil(total / limit),
          hasNext: skip + reviews.length < total,
          hasPrev: page > 1,
        },
      })
    } catch (err) { next(err) }
  },
)

reviewRouter.post(
  '/products/:productId/reviews',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId } = requireUser(req)
      const review = await Review.create({
        product: req.params.productId,
        user:    userId,
        ...req.body,
      })
      await review.populate('user', 'name avatar')
      res.status(201).json({ success: true, data: review })
    } catch (err) { next(err) }
  },
)

reviewRouter.delete(
  '/reviews/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId, role } = requireUser(req)
      const review = await Review.findById(req.params.id)
      if (!review) return next(new AppError('Review not found', 404))
      if (review.user.toString() !== userId && role === 'customer') {
        return next(new AppError('Not authorized', 403))
      }
      await review.deleteOne()
      res.json({ success: true, message: 'Review deleted' })
    } catch (err) { next(err) }
  },
)

// ─── Coupons ───────────────────────────────────────────────────
export const couponRouter = Router()

couponRouter.post(
  '/validate',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, subtotal } = req.body as { code: string; subtotal: number }
      const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

      if (!coupon) return next(new AppError('Invalid coupon code', 400))
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return next(new AppError('Coupon has expired', 400))
      }
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return next(new AppError(`Minimum order $${coupon.minOrderAmount} required`, 400))
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return next(new AppError('Coupon usage limit reached', 400))
      }

      let discount = 0
      if (coupon.type === 'percentage')    discount = subtotal * (coupon.value / 100)
      if (coupon.type === 'fixed')         discount = Math.min(coupon.value, subtotal)
      if (coupon.type === 'free_shipping') discount = 4.99

      res.json({ success: true, data: { coupon, discount } })
    } catch (err) { next(err) }
  },
)

// ─── Banners ───────────────────────────────────────────────────
export const bannerRouter = Router()

bannerRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now     = new Date()
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now }      },
      ],
      $and: [
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    }).sort({ sortOrder: 1 }).lean()
    res.json({ success: true, data: banners })
  } catch (err) { next(err) }
})

// ─── Payments ──────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')

export const paymentRouter = Router()

paymentRouter.post(
  '/create-intent',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency = 'usd' } = req.body as { amount: number; currency?: string }
      const { id: userId }               = requireUser(req)
      const intent = await stripe.paymentIntents.create({
        amount:   Math.round(amount * 100),
        currency,
        metadata: { userId },
      })
      res.json({ success: true, data: { clientSecret: intent.client_secret } })
    } catch (err) { next(err) }
  },
)

paymentRouter.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string
    try {
      const event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? '',
      )
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent
        const { Order } = await import('../models/Order')
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          {
            paymentStatus: 'paid',
            status:        'confirmed',
            $push: {
              timeline: {
                status:    'confirmed',
                message:   'Payment received',
                timestamp: new Date(),
              },
            },
          },
        )
      }
      res.json({ received: true })
    } catch {
      res.status(400).json({ error: 'Webhook signature verification failed' })
    }
  },
)

// ─── Admin ─────────────────────────────────────────────────────
export const adminRouter = Router()
adminRouter.use(authenticate, authorize('admin', 'manager'))

// Dashboard stats
adminRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { Order: OrderModel }   = await import('../models/Order')
    const { Product: ProductModel } = await import('../models/Product')
    const { User: UserModel }     = await import('../models/User')

    const [
      totalRevenue, totalOrders, totalCustomers,
      totalProducts, lowStock, pendingOrders, recentOrders,
    ] = await Promise.all([
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).then((r: Array<{ total?: number }>) => r[0]?.total ?? 0),
      OrderModel.countDocuments(),
      UserModel.countDocuments({ role: 'customer' }),
      ProductModel.countDocuments({ status: 'active' }),
      ProductModel.countDocuments({
        status: 'active',
        $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
      }),
      OrderModel.countDocuments({ status: 'pending' }),
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .lean(),
    ])

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const revenueChart = await OrderModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'paid' } },
      {
        $group: {
          _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          value: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { label: '$_id', value: 1, _id: 0 } },
    ])

    res.json({
      success: true,
      data: {
        revenue:   { total: totalRevenue,   growth: 12.5, chartData: revenueChart },
        orders:    { total: totalOrders,    growth: 8.2,  pending: pendingOrders, chartData: [] },
        customers: { total: totalCustomers, growth: 5.1,  newToday: 0 },
        products:  { total: totalProducts,  lowStock, outOfStock: 0 },
        recentOrders,
        topProducts: [],
        salesByCategory: [],
      },
    })
  } catch (err) { next(err) }
})

// Admin: Products
adminRouter.post  ('/products',     upload.single('image'), productCtrl.createProduct)
adminRouter.patch ('/products/:id', upload.single('image'), productCtrl.updateProduct)
adminRouter.delete('/products/:id', productCtrl.deleteProduct)

// Admin: Categories
adminRouter.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await Category.find().sort({ sortOrder: 1 }).lean()
    res.json({ success: true, data: cats })
  } catch (err) { next(err) }
})
adminRouter.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await Category.create(req.body)
    res.status(201).json({ success: true, data: cat })
  } catch (err) { next(err) }
})
adminRouter.patch('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!cat) return next(new AppError('Category not found', 404))
    res.json({ success: true, data: cat })
  } catch (err) { next(err) }
})
adminRouter.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Category deleted' })
  } catch (err) { next(err) }
})

adminRouter.post('/categories/recalculate-counts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { Product } = await import('../models/Product')
    const cats = await Category.find().select('_id').lean()
    await Promise.all(cats.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id, status: 'active' })
      await Category.findByIdAndUpdate(cat._id, { productCount: count })
    }))
    res.json({ success: true, message: `Recalculated counts for ${cats.length} categories` })
  } catch (err) { next(err) }
})

// Admin: Orders
adminRouter.get   ('/orders',            orderCtrl.adminGetOrders)
adminRouter.patch ('/orders/:id/status', orderCtrl.adminUpdateOrderStatus)

// Admin: Coupons
adminRouter.get('/coupons', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, data: coupons })
  } catch (err) { next(err) }
})
adminRouter.post('/coupons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await Coupon.create(req.body)
    res.status(201).json({ success: true, data: c })
  } catch (err) { next(err) }
})
adminRouter.patch('/coupons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!c) return next(new AppError('Coupon not found', 404))
    res.json({ success: true, data: c })
  } catch (err) { next(err) }
})
adminRouter.delete('/coupons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Coupon deleted' })
  } catch (err) { next(err) }
})

// Admin: Banners
adminRouter.get('/banners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1 }).lean()
    res.json({ success: true, data: banners })
  } catch (err) { next(err) }
})
adminRouter.post('/banners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await Banner.create(req.body)
    res.status(201).json({ success: true, data: b })
  } catch (err) { next(err) }
})
adminRouter.patch('/banners/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!b) return next(new AppError('Banner not found', 404))
    res.json({ success: true, data: b })
  } catch (err) { next(err) }
})
adminRouter.delete('/banners/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Banner.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Banner deleted' })
  } catch (err) { next(err) }
})

// Admin: Users
adminRouter.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { User: UserModel } = await import('../models/User')
    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const skip  = (page - 1) * limit
    const total = await UserModel.countDocuments()
    const users = await UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    res.json({
      success: true,
      data:    users,
      pagination: {
        page, limit, total,
        pages:   Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1,
      },
    })
  } catch (err) { next(err) }
})
adminRouter.patch('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { User: UserModel } = await import('../models/User')
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) return next(new AppError('User not found', 404))
    res.json({ success: true, data: user })
  } catch (err) { next(err) }
})
adminRouter.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { User: UserModel } = await import('../models/User')
    await UserModel.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'User deactivated' })
  } catch (err) { next(err) }
})
