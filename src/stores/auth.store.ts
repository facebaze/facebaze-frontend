/**
 * Auth Store — Global authentication state.
 * Uses Zustand with event-driven session expiry handling.
 * All auth flows go through the backend API. No client-side mocking.
 */

import { create } from 'zustand'
import type { User, LoginResponse } from '@/types'
import { authService } from '@/services/auth.service'
import { secureStorage } from '@/lib/storage'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<LoginResponse>
  verifyLoginOtp: (email: string, otp: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  sendOtp: (phone: string) => Promise<{ sent: boolean; mockOtp?: string }>
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      const session = await authService.getExistingSession()
      if (session) {
        set({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        })
      } else {
        set({ isLoading: false, isInitialized: true })
      }
    } catch {
      set({ isLoading: false, isInitialized: true })
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  login: async (email, password) => {
    const response = await authService.signInWithEmail(email, password)
    // If OTP required, don't set authenticated yet — return so UI can show OTP step
    if (!response.requiresOtp) {
      set({ user: response.user, isAuthenticated: true })
    }
    return response
  },

  verifyLoginOtp: async (email, otp) => {
    const response = await authService.verifyLoginOtp(email, otp)
    set({ user: response.user, isAuthenticated: true })
  },

  signUp: async (email, password, fullName) => {
    const response = await authService.signUp(email, password, fullName)
    set({ user: response.user, isAuthenticated: true })
  },

  loginWithGoogle: async () => {
    await authService.signInWithGoogle()
  },

  sendOtp: async (phone) => {
    return authService.sendOtp(phone)
  },

  verifyOtp: async (phone, otp) => {
    const result = await authService.verifyOtp(phone, otp)
    set({ user: result.user, isAuthenticated: true })
    return { isNewUser: result.isNewUser }
  },

  logout: async () => {
    await authService.signOut()
    set({ user: null, isAuthenticated: false })
  },
}))

// Listen for session expiry events from API interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-expired', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })
}
