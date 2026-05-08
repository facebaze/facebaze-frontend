/**
 * Storage Service — Upload files via the backend API.
 * Backend handles Supabase Storage interaction using the service key.
 *
 * Endpoint: POST /uploads/image (multipart/form-data)
 * Endpoint: DELETE /uploads/image
 *
 * Folder structure (server-side):
 *   uploads/
 *     events/{eventId}/banner.{ext}
 *     events/{eventId}/logo.{ext}
 *     vendors/{vendorId}/logo.{ext}
 *     vendors/{vendorId}/products/{filename}.{ext}
 *     profiles/{userId}/avatar.{ext}
 *     temp/{timestamp}_{filename}.{ext}
 */

import { apiClient } from './api.client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  url: string
  path: string
}

export interface UploadOptions {
  /** Folder path inside bucket, e.g. "events/abc-123" */
  folder: string
  /** File name (without extension), e.g. "banner" */
  fileName?: string
  /** Max file size in bytes (default 5MB) */
  maxSize?: number
  /** Allowed MIME types (default: common image types) */
  allowedTypes?: string[]
}

export const storageService = {
  /**
   * Upload a single image file via the backend.
   * Returns the public URL of the uploaded file.
   */
  async uploadImage(file: File, options: UploadOptions): Promise<UploadResult> {
    const maxSize = options.maxSize ?? MAX_FILE_SIZE
    const allowedTypes = options.allowedTypes ?? ALLOWED_IMAGE_TYPES

    // Client-side validation (fail fast before network request)
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type "${file.type}". Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
      )
    }

    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(1)
      throw new Error(`File too large. Maximum size is ${maxMB}MB.`)
    }

    // Build multipart form data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', options.folder)
    if (options.fileName) {
      formData.append('fileName', options.fileName)
    }

    const { data } = await apiClient.post<UploadResult & { uploadedBy: string }>(
      '/uploads/image',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30_000, // 30s for uploads
      },
    )

    return { url: data.url, path: data.path }
  },

  /**
   * Delete a file from storage via the backend.
   */
  async deleteFile(path: string): Promise<void> {
    await apiClient.delete('/uploads/image', { data: { path } })
  },

  /**
   * Upload event banner image.
   * Path: events/{eventId}/banner.{ext}
   */
  async uploadEventBanner(file: File, eventId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: `events/${eventId}`,
      fileName: 'banner',
    })
  },

  /**
   * Upload event logo image.
   * Path: events/{eventId}/logo.{ext}
   */
  async uploadEventLogo(file: File, eventId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: `events/${eventId}`,
      fileName: 'logo',
    })
  },

  /**
   * Upload vendor logo.
   * Path: vendors/{vendorId}/logo.{ext}
   */
  async uploadVendorLogo(file: File, vendorId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: `vendors/${vendorId}`,
      fileName: 'logo',
    })
  },

  /**
   * Upload vendor product image.
   * Path: vendors/{vendorId}/products/{name}_{timestamp}.{ext}
   */
  async uploadProductImage(file: File, vendorId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: `vendors/${vendorId}/products`,
    })
  },

  /**
   * Upload user profile avatar.
   * Path: profiles/{userId}/avatar.{ext}
   */
  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: `profiles/${userId}`,
      fileName: 'avatar',
    })
  },

  /**
   * Generic upload for temporary/draft images (before entity is created).
   * Path: temp/{timestamp}_{filename}.{ext}
   */
  async uploadTemp(file: File): Promise<UploadResult> {
    return this.uploadImage(file, {
      folder: 'temp',
    })
  },
}
