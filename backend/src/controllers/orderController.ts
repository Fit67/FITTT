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
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
      if (!couponDoc) return next(new AppError('Invalid coupon code', 400))
      if (couponDoc.expiresAt && new Date(couponDoc.expiresAt) < new Date()) {
        return next(new AppError('Coupon has expired', 400))
      }
      if (couponDoc.minOrderAmount && subtotal < couponDoc.minOrderAmount) {
        return next(new AppError(`Minimum order of $${couponDoc.minOrderAmount} required`, 400))
      }
      if (couponDoc.maxUses && couponDoc.usedCount >= couponDoc.maxUses) {
        return next(new AppError('Coupon usage limit reached', 400))
      }
      if (couponDoc.type === 'percentage') discountAmt = subtotal * (couponDoc.value / 100)
      if (couponDoc.type === 'fixed')      discountAmt = Math.min(couponDoc.value, subtotal)
    }

    const deliveryFee = subtotal >= 50 ? 0 : 4.99
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

    // Reserve inventory
    for (const item of lineItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.quantity': -item.quantity },
      })
    }

    // Increment coupon usage
    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } })
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
    if (role === 'customer' && order.user.toString() !== userId) {
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
    if (role === 'customer' && order.user.toString() !== userId) {
      return next(new AppError('Not authorized', 403))
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return next(new AppError(`Cannot cancel an order with status "${order.status}"`, 400))
    }

    order.status = 'cancelled'
    order.timeline.push({
      status:    'cancelled',
      message:   'Order cancelled by customer',
      timestamp: new Date(),
    })
    await order.save()

    // Release reserved inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.quantity': item.quantity },
      })
    }

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

    await order.save()
    res.json({ success: true, data: order, message: 'Order status updated' })
  } catch (err) { next(err) }
}
