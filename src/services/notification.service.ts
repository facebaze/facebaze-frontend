/**
 * Notification Service — API calls for notifications.
 */

import { apiClient } from './api.client'

export interface NotificationItem {
  id: string
  type: 'consent_request' | 'scan_received' | 'profile_saved' | 'event_reminder' | 'consent_revoked' | 'system_announcement'
  title: string
  body: string
  data: Record<string, string>
  read: boolean
  action_required: boolean
  created_at: string
}

export const notificationService = {
  /**
   * Get paginated notifications.
   */
  async list(limit = 20, offset = 0): Promise<NotificationItem[]> {
    const { data } = await apiClient.get<NotificationItem[]>('/notifications/in-app', {
      params: { limit, offset },
    })
    // Map backend format to our format
    return data.map((item: any) => ({
      id: item.id,
      type: item.data?.type || 'system_announcement',
      title: item.title,
      body: item.message,
      data: item.data || {},
      read: item.status === 'read',
      action_required: item.data?.action_required === 'true',
      created_at: item.created_at,
    }))
  },

  /**
   * Mark a notification as read.
   */
  async markRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/in-app/${notificationId}/read`)
  },

  /**
   * Mark all as read.
   */
  async markAllRead(): Promise<void> {
    // Backend doesn't have bulk read-all; mark individually
    const items = await notificationService.list(100)
    const unread = items.filter(n => !n.read)
    await Promise.all(unread.map(n => notificationService.markRead(n.id)))
  },

  /**
   * Get unread count.
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<any[]>('/notifications/in-app', {
      params: { status: 'sent', limit: 100 },
    })
    return data.length
  },

  /**
   * Register push token with backend.
   */
  async registerPushToken(token: string, platform: string): Promise<void> {
    await apiClient.put('/profiles/push-token', { token, platform })
  },
}
