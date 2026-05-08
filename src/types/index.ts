// Type definitions for the Customer App

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  role: 'user' | 'vendor' | 'organizer' | 'admin' | 'super_admin'
  created_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthResponse {
  user: User
  session: Session
  requiresOtp?: false
}

/** Returned when login requires email OTP as second factor */
export interface LoginOtpRequired {
  requiresOtp: true
  email: string
  role: string
  mockOtp?: string
}

/** Union type for login endpoint response */
export type LoginResponse = AuthResponse | LoginOtpRequired

/** Vendor signup always requires OTP verification */
export interface VendorSignupOtpRequired {
  requiresOtp: true
  email: string
  role: 'vendor'
  mockOtp?: string
  invite_token?: string
}

export type VendorSignupResponse = VendorSignupOtpRequired

// ─── Profile ─────────────────────────────────────────────────────────────────

export type PermissionMode = 'always_ask' | 'auto_allow_events' | 'do_not_scan'

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  designation: string | null
  company_name: string | null
  bio: string | null
  location: string | null
  tags: string[]
  visibility_map: VisibilityMap
  profile_photo_url: string | null
  face_registered: boolean
  is_verified: boolean
  permission_mode: PermissionMode
  profile_completed: boolean
  social_links: SocialLinks | null
  created_at: string
  updated_at: string
}

export interface VisibilityMap {
  email: 'public' | 'connections' | 'hidden'
  phone: 'public' | 'connections' | 'hidden'
  designation: 'public' | 'connections' | 'hidden'
  company: 'public' | 'connections' | 'hidden'
  location: 'public' | 'connections' | 'hidden'
  social_links: 'public' | 'connections' | 'hidden'
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  website?: string
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingStatus {
  consent_agreed: boolean
  face_registered: boolean
  profile_complete: boolean
  permission_set: boolean
}

export interface ConsentPayload {
  consent_type: 'platform_terms'
  version: string
  agreed_at: string
}

export interface FaceCapturePayload {
  face_image: string // base64
  metadata: FaceCaptureMetadata
}

export interface FaceCaptureMetadata {
  captured_at: string
  device_model: string
  liveness_method: 'blink_detection'
  camera_position: 'front'
}

export interface FaceCaptureResponse {
  success: boolean
  face_id: string
  message: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  error?: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}
