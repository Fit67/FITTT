# DoctorFit - Modular E-Commerce Platform

A production-ready, fully customizable e-commerce platform built as a real SaaS product.
Switch between **Supermarket, Pharmacy, Restaurant, Gym, Electronics, Fashion, Pet, Cosmetics** store types by changing a single config file.

---

## 🏗 Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Frontend       | Next.js 14 (App Router) + TypeScript            |
| Styling        | Tailwind CSS + CSS Variables (theme system)     |
| Animations     | Framer Motion                                   |
| State          | Zustand (cart, auth, wishlist, UI)              |
| Data Fetching  | TanStack Query (React Query v5)                 |
| HTTP Client    | Axios with interceptors + token refresh         |
| Forms          | React Hook Form + Zod validation                |
| Backend        | Node.js + Express.js + TypeScript               |
| Database       | MongoDB + Mongoose                              |
| Auth           | JWT (access + refresh tokens) + HttpOnly cookie |
| Payments       | Stripe + Cash on Delivery                       |
| Images         | Cloudinary                                      |
| Deployment     | Vercel (frontend) + Railway/Render (backend)    |

---

## 📁 Project Structure

```
ecommerce-platform/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout (providers, meta)
│   │   ├── globals.css         # Global styles + CSS variables
│   │   ├── auth/               # Login, Register, Forgot Password
│   │   ├── shop/               # Products, Cart, Checkout, Orders, Profile, Wishlist
│   │   └── admin/              # Dashboard, Products, Orders, Users, Coupons, Banners
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── ui/                 # Button, Input, Modal, Toast, primitives
│   │   └── providers/          # QueryProvider, ThemeApplier
│   ├── modules/
│   │   ├── hero/               # HeroSection (split, fullscreen, minimal)
│   │   ├── product-card/       # ProductCard, FeaturedProducts
│   │   ├── categories/         # CategoriesGrid
│   │   ├── banners/            # PromoBanners, DeliveryStripeBanner
│   │   ├── search/             # SearchModal
│   │   └── testimonials/       # TestimonialsSection
│   ├── hooks/                  # useQueries (React Query), useDebounce, etc.
│   ├── services/               # API service layer (all endpoints)
│   ├── store/slices/           # cartStore, authStore, uiStore (Zustand)
│   ├── config/
│   │   └── store.ts            # ← MAIN CONFIG FILE (change store type here)
│   ├── themes/                 # default, pharmacy, restaurant, gym themes
│   ├── types/                  # All TypeScript interfaces
│   └── lib/                    # utils.ts, api-client.ts
│
└── backend/
    └── src/
        ├── index.ts            # Express server + middleware
        ├── config/             # Database connection
        ├── models/             # User, Product, Order, Category, Coupon, Review, Banner
        ├── controllers/        # Auth, Product, Order controllers
        ├── routes/             # All API routes
        ├── middleware/         # auth.ts (JWT), errorHandler.ts
        └── utils/              # seeder.ts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### 1. Clone and install

```bash
git clone https://github.com/your-org/ecommerce-platform.git
cd ecommerce-platform

# Install frontend
cd frontend && npm install

# Install backend
cd ../backend && npm install
```

### 2. Configure environment

```bash
# Frontend
cd frontend
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Backend
cd ../backend
cp .env.example .env
# Fill in: MONGODB_URI, JWT secrets, STRIPE_SECRET_KEY, CLOUDINARY credentials
```

### 3. Seed the database

```bash
cd backend
npm run seed
# Creates admin user, sample categories, products, coupons, and banners
# Admin: admin@doctorfit.com / Admin123!
```

### 4. Run development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open **http://localhost:3000**

---

## 🎨 Customizing Your Store

### Change Store Type

Edit **`frontend/config/store.ts`**:

```typescript
export const storeConfig: StoreConfig = {
  name:         'My Pharmacy',
  tagline:      'Your health, our priority.',
  businessType: 'pharmacy',   // 'supermarket' | 'pharmacy' | 'restaurant' | 'gym' | ...
  theme:        'pharmacy',   // matches a file in /themes/
  primaryColor: '#2563eb',
  heroStyle:    'split',      // 'fullscreen' | 'split' | 'minimal'
  currency:     'USD',
  language:     'en',
  ...
}
```

**That's it.** The entire UI — product cards, category layout, hero text, metadata fields, filters, color palette — adapts automatically.

### Add a New Theme

Create **`frontend/themes/mystore.ts`**:

```typescript
export const mystoreTheme = {
  id: 'mystore',
  colors: {
    primary: { 600: '99 102 241', ... },   // RGB values
    accent: '244 63 94',
    ...
  },
  fonts: { display: '"Outfit", sans-serif', body: '"Inter", sans-serif', ... },
  radius: { card: '20px', button: '12px', badge: '100px' },
  shadows: { card: '0 4px 20px rgba(0,0,0,.08)', ... },
  ...
}
```

Register it in **`frontend/themes/index.ts`**:
```typescript
import { mystoreTheme } from './mystore'
export const themes = { ..., mystore: mystoreTheme }
```

### Change Currency / Language

```typescript
// config/store.ts
currency: 'EGP',   // USD | EUR | GBP | EGP | SAR | AED
language: 'ar',    // en | ar | fr | de
direction: 'rtl',  // ltr | rtl
```

---

## 🔒 Authentication Flow

```
Client                    Server
  │── POST /auth/login ──►  │
  │◄── accessToken (15m) ── │
  │◄── refreshToken cookie  │  (HttpOnly, Secure, SameSite=Strict)
  │
  │── Request + Bearer ───► │  (access token in header)
  │
  │── 401 received ────────►  token expired
  │── POST /auth/refresh ──► read cookie
  │◄── new accessToken ───── │
  │── retry original req ──► │
```

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days (HttpOnly cookie, never exposed to JS)
- Automatic token refresh via Axios response interceptor (no action needed in components)

---

## 🛒 Cart Architecture

Cart state is managed entirely in Zustand with localStorage persistence:

```typescript
const { addItem, removeItem, updateQty, applyCoupon, total } = useCartStore()

// Add to cart
addItem(product, variant?, quantity?)

// Cart auto-recalculates: subtotal, discount, deliveryFee, tax, total
// Free delivery auto-applies when subtotal >= storeConfig.delivery.freeDeliveryThreshold
```

---

## 💳 Payment Flow

**Stripe:**
1. Client calls `POST /api/payments/create-intent` with order total
2. Stripe returns `clientSecret`
3. Client confirms payment with `@stripe/react-stripe-js`
4. Stripe webhook hits `POST /api/payments/webhook`
5. Server marks order as `paid` + `confirmed`

**Cash on Delivery:**
1. Order created with `paymentStatus: 'pending'`
2. Marked `paid` automatically when status changes to `delivered`

---

## 📊 Admin Panel

Access at **/admin/dashboard** (requires `admin` or `manager` role).

| Page      | Features                                          |
|-----------|---------------------------------------------------|
| Dashboard | Revenue chart, order stats, recent orders table   |
| Products  | Full CRUD, search, filter by status, image upload |
| Orders    | Status updates, order detail modal, timeline      |
| Customers | List, deactivate, role management                 |
| Coupons   | Create/edit/delete, percentage/fixed/free-ship    |
| Banners   | Homepage banner management with scheduling        |

---

## 🌐 API Reference

All endpoints return:
```json
{ "success": true, "data": { ... }, "message": "..." }
```

Errors return:
```json
{ "success": false, "error": "Human-readable message" }
```

### Auth
| Method | Endpoint                | Auth | Description           |
|--------|-------------------------|------|-----------------------|
| POST   | /api/auth/register      | —    | Create account        |
| POST   | /api/auth/login         | —    | Login                 |
| POST   | /api/auth/logout        | —    | Logout (clears cookie)|
| POST   | /api/auth/refresh-token | —    | Refresh access token  |
| GET    | /api/auth/me            | ✅   | Current user          |
| PATCH  | /api/auth/me            | ✅   | Update profile        |

### Products
| Method | Endpoint                    | Auth   | Description          |
|--------|-----------------------------|--------|----------------------|
| GET    | /api/products               | —      | List (with filters)  |
| GET    | /api/products/search?q=     | —      | Full-text search     |
| GET    | /api/products/featured      | —      | Featured products    |
| GET    | /api/products/:slug         | —      | Single product       |
| POST   | /api/admin/products         | admin  | Create product       |
| PATCH  | /api/admin/products/:id     | admin  | Update product       |
| DELETE | /api/admin/products/:id     | admin  | Archive product      |

### Orders
| Method | Endpoint                        | Auth   | Description      |
|--------|---------------------------------|--------|------------------|
| POST   | /api/orders                     | ✅     | Place order      |
| GET    | /api/orders/me                  | ✅     | My orders        |
| GET    | /api/orders/:id                 | ✅     | Order detail     |
| PATCH  | /api/orders/:id/cancel          | ✅     | Cancel order     |
| PATCH  | /api/admin/orders/:id/status    | admin  | Update status    |

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
vercel --prod
# Set env vars in Vercel dashboard:
# NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Backend → Railway

```bash
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
```

Set environment variables in Railway dashboard, then push to deploy.

### MongoDB → Atlas

1. Create free cluster at mongodb.com/atlas
2. Set `MONGODB_URI=mongodb+srv://...` in your backend `.env`
3. Whitelist `0.0.0.0/0` in Network Access for production

---

## 📐 Adding a New Store Type

1. Add the type to `BusinessType` in `frontend/types/index.ts`
2. Add config entry in `businessTypeConfig` in `frontend/config/store.ts`
3. Create a theme in `frontend/themes/newtype.ts`
4. Register it in `frontend/themes/index.ts`
5. Add conditional rendering in `ProductCard.tsx` for any unique metadata fields

---

## 🧪 Test Accounts (after seeding)

| Role  | Email                      | Password   |
|-------|----------------------------|------------|
| Admin | admin@doctorfit.com        | Admin123!  |

---

## 📝 License

MIT — free to use commercially. Attribution appreciated.
