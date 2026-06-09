import {
  useQuery, useMutation, useInfiniteQuery, useQueryClient,
} from '@tanstack/react-query'
import {
  productService, categoryService, orderService,
  reviewService, couponService, bannerService, adminService,
} from '@/services'
import type { ProductFilters } from '@/types'

// ─── Query Keys ────────────────────────────────────────────────
export const QK = {
  products:    (filters?: ProductFilters) => ['products', filters ?? {}] as const,
  product:     (slug: string)             => ['product', slug]           as const,
  related:     (id: string)               => ['related', id]             as const,
  featured:    ()                         => ['featured']                as const,
  newProducts: ()                         => ['new-products']            as const,
  categories:  ()                         => ['categories']              as const,
  myOrders:    (page: number)             => ['my-orders', page]         as const,
  order:       (id: string)               => ['order', id]               as const,
  reviews:     (pid: string, page: number)=> ['reviews', pid, page]      as const,
  banners:     ()                         => ['banners']                 as const,
  dashboard:   ()                         => ['dashboard']               as const,
  adminOrders: (p: Record<string, unknown>) => ['admin-orders', p]       as const,
  adminUsers:  (p: Record<string, unknown>) => ['admin-users', p]        as const,
} as const

// ─── Products ──────────────────────────────────────────────────
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: QK.products(filters),
    queryFn:  () => productService.getAll(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey:         ['products-infinite', filters],
    queryFn:          ({ pageParam }) =>
      productService.getAll({ ...filters, page: pageParam as number }),
    initialPageParam: 1 as number,
    getNextPageParam: (last) =>
      last.pagination.hasNext ? last.pagination.page + 1 : undefined,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey:  QK.product(slug),
    queryFn:   () => productService.getBySlug(slug),
    enabled:   Boolean(slug),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: QK.related(productId),
    queryFn:  () => productService.getRelated(productId),
    enabled:  Boolean(productId),
  })
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey:  [...QK.featured(), limit],
    queryFn:   () => productService.getFeatured(limit),
    staleTime: 1000 * 60 * 10,
  })
}

export function useNewProducts() {
  return useQuery({
    queryKey:  QK.newProducts(),
    queryFn:   () => productService.getNew(),
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Categories ────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey:  QK.categories(),
    queryFn:   categoryService.getAll,
    staleTime: 1000 * 60 * 15,
  })
}

// ─── Orders ────────────────────────────────────────────────────
export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: QK.myOrders(page),
    queryFn:  () => orderService.getMyOrders(page),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QK.order(id),
    queryFn:  () => orderService.getById(id),
    enabled:  Boolean(id),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: orderService.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['my-orders'] }),
  })
}

// ─── Reviews ───────────────────────────────────────────────────
export function useReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: QK.reviews(productId, page),
    queryFn:  () => reviewService.getByProduct(productId, page),
    enabled:  Boolean(productId),
  })
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { rating: number; title: string; body: string }) =>
      reviewService.create(productId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.reviews(productId, 1) })
      qc.invalidateQueries({ queryKey: QK.product(productId) })
    },
  })
}

// ─── Coupons ───────────────────────────────────────────────────
export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponService.validate(code, subtotal),
  })
}

// ─── Banners ───────────────────────────────────────────────────
export function useBanners() {
  return useQuery({
    queryKey:  QK.banners(),
    queryFn:   bannerService.getActive,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Admin ─────────────────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey:        QK.dashboard(),
    queryFn:         adminService.getDashboardStats,
    refetchInterval: 1000 * 60 * 5,
  })
}

export function useAdminOrders(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: QK.adminOrders(params),
    queryFn:  () => orderService.getAll(params),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })
}
