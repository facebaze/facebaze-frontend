/**
 * Profile Service — CRUD operations for user profile.
 */

import { apiClient } from './api.client'
import type {
  UserProfile,
  OnboardingStatus,
  FaceCapturePayload,
  FaceCaptureResponse,
  PermissionMode,
} from '@/types'
import type { QuickProfileFormData } from '@/lib/validators'

export const profileService = {
  /**
   * Get the current user's profile.
   */
  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/profiles/me')
    return data
  },

  /**
   * Get onboarding completion status.
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    const { data } = await apiClient.get<OnboardingStatus>('/profiles/onboarding-status')
    return data
  },

  /**
   * Update profile with quick-profile form data (onboarding step 3).
   */
  async updateQuickProfile(formData: QuickProfileFormData): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>('/profiles/me', {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      designation: formData.designation,
      company_name: formData.company_name,
      location: formData.location || null,
    })
    return data
  },

  /**
   * Upload face capture for registration.
   * Server validates quality + stores in AWS Rekognition.
   */
  async uploadFaceCapture(payload: FaceCapturePayload): Promise<FaceCaptureResponse> {
    const { data } = await apiClient.post<FaceCaptureResponse>(
      '/profiles/face-capture',
      payload
    )
    return data
  },

  /**
   * Set the user's scan permission mode.
   */
  async setPermissionMode(mode: PermissionMode): Promise<void> {
    await apiClient.put('/profiles/me', {
      permission_mode: mode,
    })
  },

  /**
   * Update profile photo URL.
   */
  async updateProfilePhoto(photoUrl: string): Promise<void> {
    await apiClient.put('/profiles/me', {
      profile_photo_url: photoUrl,
    })
  },
}
