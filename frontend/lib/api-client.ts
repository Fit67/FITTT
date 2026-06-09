import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'

// ─── Create instance ───────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  withCredentials: true, // send HttpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — attach access token ─────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err),
)

// ─── Response interceptor — refresh token on 401 ──────────────
let isRefreshing = false
type FailedRequest = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
let failedQueue: FailedRequest[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  )
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/login' &&
      original.url !== '/auth/refresh-token'
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing     = true

      try {
        const { data } = await apiClient.post<{ accessToken: string }>(
          '/auth/refresh-token',
        )
        const newToken = data.accessToken
        sessionStorage.setItem('accessToken', newToken)
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return apiClient(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        sessionStorage.removeItem('accessToken')
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ─── Typed response extractor ──────────────────────────────────
export async function api<T>(
  fn: () => Promise<AxiosResponse<{ success: boolean; data: T; message?: string }>>,
): Promise<T> {
  const res = await fn()
  return res.data.data
}

export default apiClient
