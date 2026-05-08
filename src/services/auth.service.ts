/**
 * Auth Service — Handles all authentication API calls.
 * Integrates directly with our backend JWT system.
 * Backend provides mock OTP in dev mode (NODE_ENV !== 'production').
 */

import { apiClient } from './api.client'
import { secureStorage } from '@/lib/storage'
import type { AuthResponse, LoginResponse, ConsentPayload, VendorSignupResponse } from '@/types'

// Current consent document version
export const CONSENT_VERSION = '2.1'

export const authService = {
  /**
   * Sign in with Google OAuth — placeholder for future implementation.
   */
  async signInWithGoogle(): Promise<void> {
    throw new Error('Google sign-in not yet configured. Use email or phone login.')
  },

  /**
   * Send OTP to a phone number.
   * DEV: backend returns `mockOtp` in the response so the frontend can show a toast.
   * PROD: `mockOtp` is undefined — actual SMS is sent via MSG91.
   */
  async sendOtp(phone: string): Promise<{ sent: boolean; mockOtp?: string }> {
    const { data } = await apiClient.post<{ sent: boolean; mockOtp?: string }>('/auth/otp/send', { phone })
    // Security: never expose mock OTP in production builds
    if (process.env.NODE_ENV === 'production') {
      delete data.mockOtp
    }
    return data
  },

  /**
   * Verify OTP and authenticate.
   * Creates a new account if this phone has never been seen before.
   */
  async verifyOtp(phone: string, otp: string): Promise<AuthResponse & { isNewUser: boolean }> {
    const { data } = await apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/otp/verify', { phone, otp })
    await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, data.session.access_token)
    await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, data.session.refresh_token)
    await secureStorage.setItem(secureStorage.keys.USER_ID, data.user.id)
    return data
  },

  /**
   * Sign in with email/password.
   * For customer roles: returns full JWT directly.
   * For vendor/admin/organizer: returns { requiresOtp: true } — caller must
   * then call verifyLoginOtp() with the email OTP.
   */
  async signInWithEmail(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    // If OTP is required, don't store tokens yet — wait for step 2
    if (data.requiresOtp) {
      return data
    }

    await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, data.session.access_token)
    await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, data.session.refresh_token)
    await secureStorage.setItem(secureStorage.keys.USER_ID, data.user.id)

    return data
  },

  /**
   * Verify email OTP — step 2 of login for vendor/admin/organizer roles.
   */
  async verifyLoginOtp(email: string, otp: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login/verify-otp', {
      email,
      otp,
    })

    await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, data.session.access_token)
    await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, data.session.refresh_token)
    await secureStorage.setItem(secureStorage.keys.USER_ID, data.user.id)

    return data
  },

  /**
   * Register new account via backend directly.
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      password,
      fullName,
    })

    await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, data.session.access_token)
    await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, data.session.refresh_token)
    await secureStorage.setItem(secureStorage.keys.USER_ID, data.user.id)

    return data
  },

  /**
   * Register as a vendor (pending admin approval).
   * If invite_token is provided, the backend returns it in the response so the
   * caller can immediately accept the event invite via the events API.
   */
  async vendorSignup(params: {
    business_name: string
    contact_name: string
    email: string
    password: string
    phone: string
    business_description?: string
    industry?: string
    website?: string
    invite_token?: string
  }): Promise<VendorSignupResponse> {
    const { data } = await apiClient.post<VendorSignupResponse>('/auth/vendor/signup', params)
    return data
  },

  /**
   * Verify email OTP after vendor signup (step 2).
   */
  async verifyVendorSignupOtp(email: string, otp: string): Promise<AuthResponse & { invite_token?: string }> {
    const { data } = await apiClient.post<AuthResponse & { invite_token?: string }>('/auth/vendor/signup/verify-otp', {
      email,
      otp,
    })

    await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, data.session.access_token)
    await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, data.session.refresh_token)
    await secureStorage.setItem(secureStorage.keys.USER_ID, data.user.id)

    return data
  },

  /**
   * Fetch vendor invite details by token (public — no auth required).
   * Used by the signup page to show event context when arriving via invite link.
   */
  async getVendorInvite(token: string): Promise<{
    valid: boolean
    invited_email: string
    booth_name: string | null
    expires_at: string
    status: string
    event: {
      id: string
      name: string
      event_start_date: string
      location: string
      city: string
      cover_image_url: string | null
    } | null
    org_name: string | null
  }> {
    const { data } = await apiClient.get(`/events/vendor-invite/${token}`)
    return data
  },

  /**
   * Record platform consent agreement.
   */
  async recordConsent(): Promise<void> {
    const payload: ConsentPayload = {
      consent_type: 'platform_terms',
      version: CONSENT_VERSION,
      agreed_at: new Date().toISOString(),
    }
    await apiClient.post('/auth/consent', payload)
  },

  /**
   * Sign out — clear all stored tokens.
   */
  async signOut(): Promise<void> {
    await secureStorage.clear()
  },

  /**
   * Check if there's an existing valid session.
   */
  async getExistingSession(): Promise<AuthResponse | null> {
    const token = await secureStorage.getItem(secureStorage.keys.ACCESS_TOKEN)
    if (!token) return null

    try {
      const { data } = await apiClient.get<AuthResponse>('/auth/me')
      return data
    } catch {
      // Token invalid or expired — refresh handled by interceptor
      return null
    }
  },
}
