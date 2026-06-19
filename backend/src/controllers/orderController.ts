import type { Request, Response, NextFunction } from 'express'
import { Order }   from '../models/Order'
import { Product } from '../models/Product'
import { Coupon }  from '../models/index'      // ← fixed: was '../models/Coupon' (doesn't exist)
import { AppError } from '../middleware/errorHandler'
import { requireUser } from '../middleware/auth'

// ─── POST /orders ──────────────────────────────────────────────
export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      items, shippingAddress, paymentMethod, couponCode, notes, paymentProofImage, paymentProofFileName,
    } = req.body as {
      items: Array<{ productId: string; variantId?: string; quantity: number }>
      shippingAddress: Record<string, string>
      paymentMethod:   string
      couponCode?:     string
      notes?:          string
      paymentProofImage?: string
      paymentProofFileName?: string
    }

    const allowedPaymentMethods = ['instapay', 'cash_on_delivery', 'stripe', 'wallet']
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return next(new AppError('Invalid payment method', 400))
    }

    if (!paymentProofImage) {
      return next(new AppError('Payment proof screenshot is required for all orders', 400))
    }

    if (
      paymentProofImage &&
      (!paymentProofImage.startsWith('data:image/') || paymentProofImage.length > 8_000_000)
    ) {
      return next(new AppError('Invalid payment proof image', 400))
    }

    const lineItems: Array<{
      product:  unknown
      variant?: string
      name:     string
      image:    string
      price:    number
      quantity: number
      total:    number
    }> = []
    let subtotal = 0

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item', 400))
    }

    const requiredAddressFields = ['street', 'city', 'country']
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return next(new AppError('Shipping address is required', 400))
    }
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]?.trim()) {
        return next(new AppError(`Shipping address is missing required field: ${field}`, 400))
      }
    }

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
        return next(new AppError('Item quantity must be a whole number between 1 and 999', 400))
      }
    }

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) return next(new AppError(`Product ${item.productId} not found`, 404))
      if (product.status !== 'active') {
        return next(new AppError(`${product.name} is no longer available`, 400))
      }
      if (
        product.inventory.trackInventory &&
        product.inventory.quantity < item.quantity &&
        !product.inventory.allowBackorder
      ) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400))
      }

      // Use .find() instead of .id() — Mongoose .id() not typed in v8 generics
      const matchedVariant = item.variantId
        ? product.variants.find(v => v._id.toString() === item.variantId)
        : undefined

      const price     = matchedVariant ? matchedVariant.price : product.price
      const lineTotal = price * item.quantity
      subtotal       += lineTotal

      lineItems.push({
        product:  product._id,
        variant:  item.variantId,
        name:     product.name,
        image:    product.images.find(i => i.isPrimary)?.url ?? product.images[0]?.url ?? '',
        price,
        quantity: item.quantity,
        total:    lineTotal,
      })
    }

    // ─── Coupon validation ──────────────────────────────────────
    let discountAmt = 0
    let couponDoc: typeof Coupon.prototype | null = null

    if (couponCode) {
      // Validate basic fields first (no DB write yet)
      const rawCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
      if (!rawCoupon) return next(new AppError('Invalid coupon code', 400))
      if (rawCoupon.expiresAt && new Date(rawCoupon.expiresAt) < new Date()) {
        return next(new AppError('Coupon has expired', 400))
      }
      if (rawCoupon.minOrderAmount && subtotal < rawCoupon.minOrderAmount) {
        return next(new AppError(`Minimum order of $${rawCoupon.minOrderAmount} required`, 400))
      }
      // Enforce product/category restrictions
      if (rawCoupon.applicableProducts?.length) {
        const allowedIds = rawCoupon.applicableProducts.map((id: unknown) => id!.toString())
        const allAllowed = lineItems.every(i => allowedIds.includes(i.product!.toString()))
        if (!allAllowed) {
          return next(new AppError('This coupon is not valid for one or more items in your cart', 400))
        }
      }
      if (rawCoupon.applicableCategories?.length) {
        const allowedCatIds = rawCoupon.applicableCategories.map((id: unknown) => id!.toString())
        const productIds    = lineItems.map(i => i.product)
        const products      = await Product.find({ _id: { $in: productIds } }).select('category').lean()
        const allAllowed    = products.every(p => allowedCatIds.includes((p.category as unknown as { toString(): string })?.toString()))
        if (!allAllowed) {
          return next(new AppError('This coupon is only valid for specific categories', 400))
        }
      }
      // Atomically reserve one usage slot — prevents race condition on maxUses
      const claimed = await Coupon.findOneAndUpdate(
        {
          _id:      rawCoupon._id,
          isActive: true,
          $or: [
            { maxUses: { $exists: false } },
            { maxUses: null },
            { $expr: { $lt: ['$usedCount', '$maxUses'] } },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true },
      )
      if (!claimed) return next(new AppError('Coupon usage limit reached', 400))
      couponDoc = claimed
      if (couponDoc.type === 'percentage') {
        const pct = Math.min(couponDoc.value, 100) // cap at 100%
        discountAmt = Math.min(subtotal * (pct / 100), subtotal)
      }
      if (couponDoc.type === 'fixed')         discountAmt = Math.min(couponDoc.value, subtotal)
      if (couponDoc.type === 'free_shipping') discountAmt = subtotal >= 2000 ? 0 : 80
    }

    const deliveryFee = (subtotal >= 2000 || couponDoc?.type === 'free_shipping') ? 0 : 80
    const tax         = (subtotal - discountAmt) * 0.08
    const total       = Math.max(subtotal - discountAmt + deliveryFee + tax, 0)

    const order = await Order.create({
      user:            requireUser(req).id,
      items:           lineItems,
      shippingAddress,
      paymentMethod,
      coupon:          couponDoc?._id,
      couponCode:      couponCode?.toUpperCase(),
      subtotal,
      discount:        discountAmt,
      deliveryFee,
      tax,
      total,
      notes,
      paymentProofImage,
      paymentProofFileName,
      paymentStatus:   paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
    })

    // Reserve inventory atomically — prevents oversell race condition
    for (const item of lineItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          $or: [
            { 'inventory.trackInventory': false },
            { 'inventory.allowBackorder': true },
            { 'inventory.quantity': { $gte: item.quantity } },
          ],
        },
        { $inc: { 'inventory.quantity': -item.quantity } },
      )
      if (!updated) {
        // Rollback already-decremented items
        const idx = lineItems.indexOf(item)
        for (const prev of lineItems.slice(0, idx)) {
          await Product.findByIdAndUpdate(prev.product, {
            $inc: { 'inventory.quantity': prev.quantity },
          })
        }
        await Order.findByIdAndDelete(order._id)
        // Rollback coupon usage slot claimed atomically earlier
        if (couponDoc) {
          await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: -1 } })
        }
        return next(new AppError(`"${item.name}" just sold out. Please update your cart.`, 409))
      }
    }

    res.status(201).json({ success: true, data: order, message: 'Order placed successfully' })
  } catch (err) { next(err) }
}

// ─── GET /orders/me ────────────────────────────────────────────
export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 10)
    const skip  = (page - 1) * limit

    const total  = await Order.countDocuments({ user: requireUser(req).id })
    const orders = await Order.find({ user: requireUser(req).id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    res.json({
      success: true,
      data:    orders,
      pagination: {
        page, limit, total,
        pages:   Math.ceil(total / limit),
        hasNext: skip + orders.length < total,
        hasPrev: page > 1,
      },
    })
  } catch (err) { next(err) }
}

// ─── GET /orders/:id ───────────────────────────────────────────
export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .lean()
    if (!order) return next(new AppError('Order not found', 404))

    const { id: userId, role } = requireUser(req)
    const orderUserId = (order.user as any)?._id?.toString() || (order.user as any)?.toString()
    if (role === 'customer' && orderUserId !== userId) {
      return next(new AppError('Not authorized', 403))
    }

    res.json({ success: true, data: order })
  } catch (err) { next(err) }
}

// ─── PATCH /orders/:id/cancel ──────────────────────────────────
export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return next(new AppError('Order not found', 404))

    const { id: userId, role } = requireUser(req)
    if (role === 'customer' && order.user.toString() !== userId && (order.user as any)?._id?.toString() !== userId) {
      return next(new AppError('Not authorized', 403))
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return next(new AppError(`Cannot cancel an order with status "${order.status}"`, 400))
    }

    // Prevent cancelling a paid Stripe order without a refund
    if (order.paymentStatus === 'paid' && order.paymentMethod === 'stripe') {
      return next(new AppError('Paid orders must be refunded by an admin before cancellation', 400))
    }

    order.status = 'cancelled'
    order.timeline.push({
      status:    'cancelled',
      message:   'Order cancelled by customer',
      timestamp: new Date(),
    })
    await order.save()

    // Restock inventory in a single bulk operation — reduces partial-update window
    await Product.bulkWrite(
      order.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { 'inventory.quantity': item.quantity } },
        },
      }))
    )

    res.json({ success: true, data: order, message: 'Order cancelled' })
  } catch (err) { next(err) }
}

// ─── Admin: GET /admin/orders ──────────────────────────────────
export async function adminGetOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, paymentStatus } = req.query as {
      status?: string; paymentStatus?: string
    }
    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const skip  = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (status)        filter.status        = status
    if (paymentStatus) filter.paymentStatus = paymentStatus

    const total  = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    res.json({
      success: true,
      data:    orders,
      pagination: {
        page, limit, total,
        pages:   Math.ceil(total / limit),
        hasNext: skip + orders.length < total,
        hasPrev: page > 1,
      },
    })
  } catch (err) { next(err) }
}

// ─── Admin: PATCH /admin/orders/:id/status ─────────────────────
export async function adminUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, message } = req.body as { status: string; message?: string }
    const order = await Order.findById(req.params.id)
    if (!order) return next(new AppError('Order not found', 404))

    const ALLOWED_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded','returned']
    if (!ALLOWED_STATUSES.includes(status)) {
      return next(new AppError(`Invalid status "${status}"`, 400))
    }
    // Prevent reopening a delivered or refunded order
    if (['delivered','refunded'].includes(order.status) && !['refunded','returned'].includes(status)) {
      return next(new AppError(`Cannot transition from "${order.status}" to "${status}"`, 400))
    }

    const isReturning = ['cancelled', 'refunded', 'returned'].includes(status)
    const wasReturned = ['cancelled', 'refunded', 'returned'].includes(order.status)

    order.status = status as typeof order.status
    order.timeline.push({
      status,
      message: message ?? `Status updated to ${status}`,
      timestamp: new Date(),
    })

    if (isReturning && !wasReturned) {
      // Restock inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'inventory.quantity': item.quantity },
        })
      }
      // Issue Stripe refund if applicable
      if (status === 'refunded' && order.paymentMethod === 'stripe' && order.stripePaymentIntentId) {
        try {
          const Stripe = (await import('stripe')).default
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
          await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId as string })
          order.paymentStatus = 'refunded'
        } catch (stripeErr) {
          // Rollback the inventory restock since refund failed
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { 'inventory.quantity': -item.quantity },
            })
          }
          return next(new AppError('Failed to issue Stripe refund. Please refund manually in Stripe dashboard.', 500))
        }
      }
    } else if (!isReturning && wasReturned) {
      // Re-deduct if admin undoes the cancellation/return
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'inventory.quantity': -item.quantity },
        })
      }
    }

    if (status === 'delivered' && order.paymentMethod === 'cash_on_delivery') {
      order.paymentStatus = 'paid'
      order.deliveredAt   = new Date()
      // Quantity was already deducted at order creation
    }

    // Instapay: mark as paid when admin confirms the order (proof reviewed)
    if (status === 'confirmed' && order.paymentMethod === 'instapay') {
      order.paymentStatus = 'paid'
    }

    await order.save()
    res.json({ success: true, data: order, message: 'Order status updated' })
  } catch (err) { next(err) }
}
