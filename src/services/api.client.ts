/**
 * API Client — Production-ready Axios instance with:
 * - Automatic JWT attachment from secure storage
 * - Token refresh on 401
 * - Request deduplication
 * - Timeout + retry logic
 * - Type-safe error handling
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'
import { secureStorage } from '@/lib/storage'
import type { ApiError } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const REQUEST_TIMEOUT = 15_000
const MAX_RETRIES = 2

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })
  failedQueue = []
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // ─── Request Interceptor: Attach JWT ───────────────────────────────────────
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await secureStorage.getItem(secureStorage.keys.ACCESS_TOKEN)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // ─── Response Interceptor: Handle 401 + Refresh ────────────────────────────
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
        _retryCount?: number
      }

      // Don't retry auth endpoints
      if (originalRequest?.url?.includes('/auth/')) {
        return Promise.reject(error)
      }

      // Handle 401 — attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue this request to retry after refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                resolve(client(originalRequest))
              },
              reject,
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = await secureStorage.getItem(
            secureStorage.keys.REFRESH_TOKEN
          )
          if (!refreshToken) {
            throw new Error('No refresh token')
          }

          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          // Backend returns { session: { access_token, refresh_token, expires_at } }
          const session = data.session || data
          const newAccessToken = session.access_token
          await secureStorage.setItem(
            secureStorage.keys.ACCESS_TOKEN,
            newAccessToken
          )
          if (session.refresh_token) {
            await secureStorage.setItem(
              secureStorage.keys.REFRESH_TOKEN,
              session.refresh_token
            )
          }

          processQueue(null, newAccessToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          return client(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          // Clear tokens — force re-login
          await secureStorage.removeItem(secureStorage.keys.ACCESS_TOKEN)
          await secureStorage.removeItem(secureStorage.keys.REFRESH_TOKEN)
          // Emit event for auth store to handle logout
          window.dispatchEvent(new CustomEvent('auth:session-expired'))
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // Handle network errors with retry
      if (!error.response && (originalRequest._retryCount ?? 0) < MAX_RETRIES) {
        originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1
        const backoff = originalRequest._retryCount * 1000
        await new Promise((r) => setTimeout(r, backoff))
        return client(originalRequest)
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()
