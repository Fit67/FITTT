import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthState, User, LoginPayload, RegisterPayload } from '@/types'
import apiClient from '@/lib/api-client'
import { useWishlistStore } from './uiStore'
import Cookies from 'js-cookie'

// ─── Cookie sync helpers ───────────────────────────────────────
// The Edge middleware reads this cookie to fast-gate /admin routes.
// It is NOT used for API authentication (Bearer token from sessionStorage is).
function syncTokenCookie(token: string) {
  if (typeof window === 'undefined') return
  try {
    Cookies.set('accessToken', token, {
      sameSite: 'strict',
      secure:   window.location.protocol === 'https:',
      path:     '/',
    })
  } catch { /* fail silently */ }
}

function removeTokenCookie() {
  if (typeof window === 'undefined') return
  try {
    Cookies.remove('accessToken', { path: '/' })
  } catch { /* fail silently */ }
}

interface AuthStore extends AuthState {
  login:       (payload: LoginPayload) => Promise<void>
  register:    (payload: RegisterPayload) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  logout:      () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser:  (data: Partial<User>) => void
  setToken:    (token: string) => void
}

/**
 * BUG FIXED: sessionStorage is undefined during SSR.
 * The authStore was reading sessionStorage directly in the request interceptor
 * and here in login/register without a typeof window guard. On the server this
 * throws a ReferenceError that crashes the render silently (blank page).
 */
const ssrSafeSessionStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    try { return sessionStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    try { sessionStorage.setItem(name, value) } catch { /* fail silently */ }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    try { sessionStorage.removeItem(name) } catch { /* fail silently */ }
  },
}

function isUserLike(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false
  const user = value as Partial<User>
  return (
    typeof user._id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string'
  )
}

function sanitizeAuthState(state: Partial<AuthState>) {
  const user = isUserLike(state.user) ? state.user : null
  const accessToken = typeof state.accessToken === 'string' && state.accessToken.length > 0
    ? state.accessToken
    : null

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken && state.isAuthenticated),
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      isAuthenticated: false,
      isLoading:       false,

      async login(payload) {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post<{
            success: boolean
            data: { user: User; accessToken: string }
          }>('/auth/login', payload)

          const { user, accessToken } = data.data
          ssrSafeSessionStorage.setItem('accessToken', accessToken)
          syncTokenCookie(accessToken)

          if (user.wishlist) {
            useWishlistStore.getState().setItems(user.wishlist as any)
          }

          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      async googleLogin(credential) {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post<{
            success: boolean
            data: { user: User; accessToken: string }
          }>('/auth/google', { credential })

          const { user, accessToken } = data.data
          ssrSafeSessionStorage.setItem('accessToken', accessToken)
          syncTokenCookie(accessToken)

          if (user.wishlist) {
            useWishlistStore.getState().setItems(user.wishlist as any)
          }

          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      async register(payload) {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post<{
            success: boolean
            data: { user: User; accessToken: string }
          }>('/auth/register', payload)

          const { user, accessToken } = data.data
          ssrSafeSessionStorage.setItem('accessToken', accessToken)
          syncTokenCookie(accessToken)

          if (user.wishlist) {
            useWishlistStore.getState().setItems(user.wishlist as any)
          }

          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      async logout() {
        try {
          await apiClient.post('/auth/logout')
        } catch {
          // Proceed even if backend logout fails
        } finally {
          ssrSafeSessionStorage.removeItem('accessToken')
          removeTokenCookie()
          useWishlistStore.getState().clear()
          set({ user: null, accessToken: null, isAuthenticated: false })
        }
      },

      async refreshUser() {
        try {
          const { data } = await apiClient.get<{ success: boolean; data: User }>('/auth/me')
          set({ user: data.data })
        } catch {
          // Token expired or network error — leave state as-is
        }
      },

      updateUser(data) {
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },

      setToken(token) {
        ssrSafeSessionStorage.setItem('accessToken', token)
        syncTokenCookie(token)
        set({ accessToken: token, isAuthenticated: true })
      },
    }),
    {
      name:    'doctorfit-auth',
      storage: createJSONStorage(() => ssrSafeSessionStorage),
      partialize: state => ({
        ...sanitizeAuthState(state),
      }),
      onRehydrateStorage: () => state => {
        if (!state) return
        const safeState = sanitizeAuthState(state)
        state.user = safeState.user
        state.accessToken = safeState.accessToken
        state.isAuthenticated = safeState.isAuthenticated
        state.isLoading = false

        // Sync cookie on rehydration so middleware stays in sync
        if (safeState.accessToken) {
          syncTokenCookie(safeState.accessToken)
        } else {
          removeTokenCookie()
        }
      },
    },
  ),
)
