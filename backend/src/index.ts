import 'dotenv/config'
import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import compression  from 'compression'
import cookieParser from 'cookie-parser'
import morgan       from 'morgan'
import rateLimit    from 'express-rate-limit'
import path          from 'path'

import { connectDB }       from './config/database'
import { errorHandler }    from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'

import {
  productRouter, categoryRouter, orderRouter,
  reviewRouter,  couponRouter,   bannerRouter,
  paymentRouter, adminRouter,
} from './routes/all-routes'

import authRouter from './routes/auth'

const app  = express()
const PORT = process.env.PORT ?? 5000

// ─── Database ──────────────────────────────────────────────────

// ─── Stripe webhook — MUST use raw body, before express.json() ─
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    req.url = '/webhook'
    paymentRouter(req, res, next)
  },
)

// ─── Security / performance middleware ─────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '30d',
  immutable: true,
}))

// ─── Rate limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, error: 'Too many auth attempts. Please try again later.' },
})

app.use('/api/', globalLimiter)

// ─── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000'
    if (origin === allowedOrigin || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ─── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Health check ──────────────────────────────────────────────
app.get('/health', (_req: import('express').Request, res: import('express').Response) => res.json({ ok: true, ts: new Date().toISOString() }))

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRouter)
app.use('/api/products',   productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/orders',     orderRouter)
app.use('/api',            reviewRouter)     // /products/:id/reviews + /reviews/:id
app.use('/api/coupons',    couponRouter)
app.use('/api/banners',    bannerRouter)
app.use('/api/payments',   paymentRouter)    // excludes /webhook (handled above)
app.use('/api/admin',      adminRouter)

// ─── 404 + global error handler ────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start ─────────────────────────────────────────────────────
async function start() {
  await connectDB()
  app.listen(PORT, () => {
  console.log(`\n🚀  API running on :${PORT}  [${process.env.NODE_ENV ?? 'development'}]`)

  // ─── One-time startup migration: sync all category productCounts ───
  void (async () => {
    try {
      const { Category } = await import('./models/index')
      const { Product }  = await import('./models/Product')
      const cats = await Category.find().select('_id').lean()
      await Promise.all(cats.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, status: 'active' })
        await Category.findByIdAndUpdate(cat._id, { productCount: count })
      }))
      console.log(`📦  Synced productCount for ${cats.length} categories`)
    } catch (err) {
      console.error('❌  Failed to sync category counts:', err)
    }
  })()
  })
}

void start()

export default app
