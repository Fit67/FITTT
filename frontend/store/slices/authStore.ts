import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthState, User, LoginPayload, RegisterPayload } from '@/types'
import apiClient from '@/lib/api-client'
import { useWishlistStore } from './uiStore'

interface AuthStore extends AuthState {
  login:    (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout:   () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setToken:   (token: string) => void
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
          sessionStorage.setItem('accessToken', accessToken)

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
          sessionStorage.setItem('accessToken', accessToken)

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
        } finally {
          sessionStorage.removeItem('accessToken')
          // Clear user-specific persisted state so it doesn't leak to other accounts
          localStorage.removeItem('doctorfit-wishlist')
          localStorage.removeItem('doctorfit-cart')
          localStorage.removeItem('doctorfit-recently-viewed')
          set({ user: null, accessToken: null, isAuthenticated: false })
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }
      },

      async refreshUser() {
        const { accessToken } = get()
        if (!accessToken) return
        try {
          const { data } = await apiClient.get<{ success: boolean; data: User }>('/auth/me')
          if (data.data?.wishlist) {
            useWishlistStore.getState().setItems(data.data.wishlist as any)
          }
          set({ user: data.data })
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false })
        }
      },

      updateUser(data) {
        set(state => ({ user: state.user ? { ...state.user, ...data } : null }))
      },

      setToken(token) {
        sessionStorage.setItem('accessToken', token)
        set({ accessToken: token })
      },
    }),
    {
      name:    'doctorfit-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
