import { apiClient as api } from './api.client'

/* ────────── Types ────────── */

export interface AdminDashboardSummary {
  totalUsers: number
  totalVendors: number
  activeEvents: number
  totalScans: number
  pendingVendors: number
}

export interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  is_banned: boolean
  face_registered: boolean
  profile_completed: boolean
  created_at: string
}

export interface AdminVendor {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  industry: string
  status: string
  approved: boolean
  created_at: string
}

export interface AdminEvent {
  id: string
  name: string
  description: string
  location: string
  city: string
  event_start_date: string
  event_end_date: string
  status: string
  total_vendors: number
  total_scans: number
  total_leads: number
}

export interface AdminEventDetail extends AdminEvent {
  address?: string
  category?: string
  expected_attendees?: number
  logo_url?: string
  cover_image_url?: string
  created_at: string
  updated_at: string
  vendors: EventVendorAssignment[]
}

export interface EventVendorAssignment {
  assignment_id: string
  vendor_id: string
  business_name: string
  email: string
  booth_name: string | null
  status: string
  active: boolean
  has_tablet_token: boolean
  scans_count: number
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  resource_type: string
  resource_id: string
  description: string
  changes: Record<string, unknown>
  ip_address: string
  user_agent: string
  status: string
  created_at: string
  completed_at: string
}

export interface AuditActionSummary {
  action: string
  count: number
}

export interface SystemHealth {
  status: string
  database: { status: string }
  memory: { heapUsed: number; heapTotal: number; rss: number }
  uptime: number
}

/* ────────── Service ────────── */

export const adminService = {
  /* Dashboard */
  getDashboardSummary: () =>
    api.get<AdminDashboardSummary>('/admin/dashboard').then((r) => r.data),

  /* Users */
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const limit = params?.limit || 50
    const offset = ((params?.page || 1) - 1) * limit
    return api
      .get<{ data: AdminUser[]; total: number }>('/admin/users', {
        params: { ...params, page: undefined, limit, offset },
      })
      .then((r) => r.data)
  },

  banUser: (userId: string) => api.put(`/admin/users/${userId}/ban`).then((r) => r.data),

  unbanUser: (userId: string) => api.put(`/admin/users/${userId}/unban`).then((r) => r.data),

  changeUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { newRole: role }).then((r) => r.data),

  /* Vendors */
  getVendors: (params?: { page?: number; limit?: number; approved?: boolean; search?: string }) => {
    const limit = params?.limit || 50
    const offset = ((params?.page || 1) - 1) * limit
    return api
      .get<{ data: AdminVendor[]; total: number }>('/admin/vendors', {
        params: { ...params, page: undefined, limit, offset },
      })
      .then((r) => r.data)
  },

  approveVendor: (vendorId: string) =>
    api.post(`/admin/vendors/${vendorId}/approve`).then((r) => r.data),

  rejectVendor: (vendorId: string) =>
    api.post(`/admin/vendors/${vendorId}/reject`).then((r) => r.data),

  suspendVendor: (vendorId: string) =>
    api.put(`/admin/vendors/${vendorId}/suspend`).then((r) => r.data),

  activateVendor: (vendorId: string) =>
    api.put(`/admin/vendors/${vendorId}/activate`).then((r) => r.data),

  /* Events */
  getEvents: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const limit = params?.limit || 50
    const offset = ((params?.page || 1) - 1) * limit
    return api
      .get<{ data: AdminEvent[]; total: number }>('/admin/events', {
        params: { ...params, page: undefined, limit, offset },
      })
      .then((r) => r.data)
  },

  getEventDetail: (eventId: string) =>
    api.get<AdminEventDetail>(`/admin/events/${eventId}`).then((r) => r.data),

  updateEventStatus: (eventId: string, status: string) =>
    api.put<AdminEvent>(`/admin/events/${eventId}/status`, { status }).then((r) => r.data),

  getEventVendors: (eventId: string) =>
    api.get<EventVendorAssignment[]>(`/admin/events/${eventId}/vendors`).then((r) => r.data),

  approveEventVendor: (eventId: string, vendorId: string) =>
    api.post(`/admin/events/${eventId}/vendors/${vendorId}/approve`).then((r) => r.data),

  removeEventVendor: (eventId: string, vendorId: string) =>
    api.post(`/admin/events/${eventId}/vendors/${vendorId}/remove`).then((r) => r.data),

  /* Audit Logs */
  getAuditLogs: (params?: {
    page?: number
    limit?: number
    adminId?: string
    action?: string
    resourceType?: string
    startDate?: string
    endDate?: string
  }) => {
    const limit = params?.limit || 50
    const offset = ((params?.page || 1) - 1) * limit
    return api
      .get<{ data: AuditLog[]; total: number }>('/admin/audit-logs', {
        params: { ...params, page: undefined, limit, offset },
      })
      .then((r) => r.data)
  },

  exportAuditLogsCSV: (params?: Record<string, string>) =>
    api
      .get('/admin/audit-logs/export/csv', { params, responseType: 'blob' })
      .then((r) => r.data as Blob),

  getActionSummary: () =>
    api.get<AuditActionSummary[]>('/admin/audit-logs/summary').then((r) => r.data),

  /* System Health */
  getSystemHealth: () => api.get<SystemHealth>('/admin/system/health').then((r) => r.data),
}
