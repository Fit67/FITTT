import apiClient, { api } from '@/lib/api-client'
import type {
  Product, Category, Order, User, Coupon, Review,
  ProductFilters, PaginatedResponse, DashboardStats,
  LoginPayload, RegisterPayload, AuthResponse, Address,
  Banner,
} from '@/types'

// ─── Auth ──────────────────────────────────────────────────────
export const authService = {
  login:    (p: LoginPayload) =>
    api(() => apiClient.post<{ success:true; data: AuthResponse }>('/auth/login', p)),

  register: (p: RegisterPayload) =>
    api(() => apiClient.post<{ success:true; data: AuthResponse }>('/auth/register', p)),

  logout:   () => apiClient.post('/auth/logout'),

  refresh:  () =>
    api(() => apiClient.post<{ success:true; data:{ accessToken:string } }>('/auth/refresh-token')),

  me:       () =>
    api(() => apiClient.get<{ success:true; data: User }>('/auth/me')),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  updateProfile: (data: Partial<User>) =>
    api(() => apiClient.patch<{ success:true; data: User }>('/auth/me', data)),

  changePassword: (current: string, newPass: string) =>
    apiClient.post('/auth/change-password', { currentPassword: current, newPassword: newPass }),

  addAddress: (addr: Omit<Address, '_id'>) =>
    api(() => apiClient.post<{ success:true; data: User }>('/auth/addresses', addr)),

  updateAddress: (id: string, addr: Partial<Address>) =>
    api(() => apiClient.patch<{ success:true; data: User }>(`/auth/addresses/${id}`, addr)),

  deleteAddress: (id: string) =>
    api(() => apiClient.delete<{ success:true; data: User }>(`/auth/addresses/${id}`)),
}

// ─── Products ──────────────────────────────────────────────────
export const productService = {
  getAll: (filters: ProductFilters = {}) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params: filters })
      .then(r => r.data),

  getBySlug: (slug: string) =>
    api(() => apiClient.get<{ success:true; data: Product }>(`/products/${slug}`)),

  getRelated: (productId: string, limit = 6) =>
    api(() => apiClient.get<{ success:true; data: Product[] }>(`/products/${productId}/related`, { params: { limit } })),

  getFeatured: (limit = 8) =>
    api(() => apiClient.get<{ success:true; data: Product[] }>('/products/featured', { params: { limit } })),

  getNew: (limit = 8) =>
    api(() => apiClient.get<{ success:true; data: Product[] }>('/products/new', { params: { limit } })),

  search: (q: string, limit = 10) =>
    api(() => apiClient.get<{ success:true; data: Product[] }>('/products/search', { params: { q, limit } })),

  // Admin
  create: (data: FormData) =>
    api(() => apiClient.post<{ success:true; data: Product }>('/admin/products', data, {
      headers: { 'Content-Type': undefined }
    })),

  update: (id: string, data: FormData) =>
    api(() => apiClient.patch<{ success:true; data: Product }>(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': undefined }
    })),

  delete: (id: string) => apiClient.delete(`/admin/products/${id}`),
}

// ─── Categories ────────────────────────────────────────────────
export const categoryService = {
  getAll: () =>
    api(() => apiClient.get<{ success:true; data: Category[] }>('/categories')),

  getBySlug: (slug: string) =>
    api(() => apiClient.get<{ success:true; data: Category }>(`/categories/${slug}`)),

  // Admin
  create: (data: Partial<Category>) =>
    api(() => apiClient.post<{ success:true; data: Category }>('/admin/categories', data)),

  update: (id: string, data: Partial<Category>) =>
    api(() => apiClient.patch<{ success:true; data: Category }>(`/admin/categories/${id}`, data)),

  delete: (id: string) => apiClient.delete(`/admin/categories/${id}`),
}

// ─── Orders ────────────────────────────────────────────────────
export const orderService = {
  create: (data: unknown) =>
    api(() => apiClient.post<{ success:true; data: Order }>('/orders', data)),

  getMyOrders: (page = 1) =>
    apiClient.get<PaginatedResponse<Order>>('/orders/me', { params: { page } })
      .then(r => r.data),

  getById: (id: string) =>
    api(() => apiClient.get<{ success:true; data: Order }>(`/orders/${id}`)),

  cancel: (id: string) =>
    api(() => apiClient.patch<{ success:true; data: Order }>(`/orders/${id}/cancel`)),

  // Admin
  getAll: (params: Record<string, unknown> = {}) =>
    apiClient.get<PaginatedResponse<Order>>('/admin/orders', { params }).then(r => r.data),

  updateStatus: (id: string, status: string) =>
    api(() => apiClient.patch<{ success:true; data: Order }>(`/admin/orders/${id}/status`, { status })),
}

// ─── Reviews ───────────────────────────────────────────────────
export const reviewService = {
  getByProduct: (productId: string, page = 1) =>
    apiClient.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, { params: { page } })
      .then(r => r.data),

  create: (productId: string, data: { rating: number; title: string; body: string }) =>
    api(() => apiClient.post<{ success:true; data: Review }>(`/products/${productId}/reviews`, data)),

  delete: (reviewId: string) => apiClient.delete(`/reviews/${reviewId}`),
}

// ─── Coupons ───────────────────────────────────────────────────
export const couponService = {
  validate: (code: string, subtotal: number) =>
    api(() => apiClient.post<{ success:true; data: { coupon: Coupon; discount: number } }>(
      '/coupons/validate', { code, subtotal },
    )),

  // Admin
  getAll: () =>
    api(() => apiClient.get<{ success:true; data: Coupon[] }>('/admin/coupons')),

  create: (data: Partial<Coupon>) =>
    api(() => apiClient.post<{ success:true; data: Coupon }>('/admin/coupons', data)),

  update: (id: string, data: Partial<Coupon>) =>
    api(() => apiClient.patch<{ success:true; data: Coupon }>(`/admin/coupons/${id}`, data)),

  delete: (id: string) => apiClient.delete(`/admin/coupons/${id}`),
}

// ─── Banners ───────────────────────────────────────────────────
export const bannerService = {
  getActive: () =>
    api(() => apiClient.get<{ success:true; data: Banner[] }>('/banners')),

  // Admin
  getAll: () =>
    api(() => apiClient.get<{ success:true; data: Banner[] }>('/admin/banners')),

  create: (data: FormData) =>
    api(() => apiClient.post<{ success:true; data: Banner }>('/admin/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  update: (id: string, data: Partial<Banner>) =>
    api(() => apiClient.patch<{ success:true; data: Banner }>(`/admin/banners/${id}`, data)),

  delete: (id: string) => apiClient.delete(`/admin/banners/${id}`),
}

// ─── Dashboard (Admin) ─────────────────────────────────────────
export const adminService = {
  getDashboardStats: () =>
    api(() => apiClient.get<{ success:true; data: DashboardStats }>('/admin/dashboard')),

  getUsers: (params: Record<string, unknown> = {}) =>
    apiClient.get<PaginatedResponse<User>>('/admin/users', { params }).then(r => r.data),

  updateUser: (id: string, data: Partial<User>) =>
    api(() => apiClient.patch<{ success:true; data: User }>(`/admin/users/${id}`, data)),

  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),

  // Stripe
  createPaymentIntent: (amount: number, currency: string) =>
    api(() => apiClient.post<{ success:true; data:{ clientSecret:string } }>(
      '/payments/create-intent', { amount, currency },
    )),
}
