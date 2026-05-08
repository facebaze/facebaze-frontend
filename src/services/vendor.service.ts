/**
 * Vendor Service — API calls for vendor dashboard, leads, events, and tablet management.
 */

import { apiClient } from './api.client'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VendorBranding {
  template: 'classic' | 'modern' | 'minimal' | 'bold' | 'elegant' | 'creative' | 'geometric' | 'wave' | 'neon' | 'glass' | 'retro' | 'corporate'
  color_mode: 'solid' | 'two-tone' | 'gradient'
  primary_color: string
  secondary_color: string | null
  gradient_angle: number
  text_color: 'light' | 'dark' | 'auto'
  accent_color: string | null
  font_family: string
  heading_font: string | null
  card_style: 'rounded' | 'sharp' | 'pill'
  show_pattern: boolean
  pattern_type: 'dots' | 'lines' | 'waves' | 'grid' | 'none'
  icon_style: 'tabler' | 'lucide' | 'minimal' | 'filled'
}

export const DEFAULT_BRANDING: VendorBranding = {
  template: 'modern',
  color_mode: 'gradient',
  primary_color: '#1e40af',
  secondary_color: '#7c3aed',
  gradient_angle: 135,
  text_color: 'light',
  accent_color: null,
  font_family: 'Inter',
  heading_font: null,
  card_style: 'rounded',
  show_pattern: false,
  pattern_type: 'none',
  icon_style: 'tabler',
}

export interface VendorProfile {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  business_description: string | null
  industry: string | null
  logo_url: string | null
  website: string | null
  tagline: string | null
  social_links: Record<string, string>
  products_services: Array<{ name: string; description?: string; image_url?: string }>
  branding: VendorBranding
  status: 'active' | 'inactive' | 'suspended'
  approved: boolean
}

export interface VendorEvent {
  id: string
  event_id: string
  event_name: string
  event_start: string
  event_end: string
  event_city: string
  event_venue: string
  event_status: 'draft' | 'active' | 'completed' | 'cancelled'
  booth_name: string | null
  tablet_token: string | null
  leads_count: number
  scans_count: number
  active: boolean
  distance_km?: number | null
}

export interface VendorLead {
  id: string
  attendee_name: string
  attendee_designation: string | null
  attendee_company: string | null
  attendee_email: string | null
  attendee_phone: string | null
  attendee_photo_url: string | null
  attendee_tags: string[]
  event_name: string
  event_id: string
  match_confidence: number
  consent: boolean
  follow_up_status: 'none' | 'contacted' | 'qualified' | 'closed'
  notes: string | null
  captured_at: string
  profile_snapshot: Record<string, any> | null
}

export interface VendorDashboardStats {
  total_leads: number
  total_scans: number
  match_rate: number
  opt_in_rate: number
  active_events: number
  leads_today: number
}

export interface RecentLead {
  id: string
  attendee_name: string
  attendee_designation: string | null
  attendee_company: string | null
  attendee_photo_url: string | null
  captured_at: string
  event_name: string
}

export interface TabletToken {
  token: string
  event_id: string
  event_name: string
  issued_at: string
  expires_at: string
  last_used_at: string | null
}

// ─── API Calls ──────────────────────────────────────────────────────────────

export const vendorService = {
  // ─── Profile ────────────────────────────────────────────────

  async getProfile(): Promise<VendorProfile> {
    const { data } = await apiClient.get<VendorProfile>('/vendors/me')
    return data
  },

  async updateProfile(updates: Partial<VendorProfile>): Promise<VendorProfile> {
    const { data } = await apiClient.put<VendorProfile>('/vendors/me', updates)
    return data
  },

  // ─── Dashboard ──────────────────────────────────────────────

  async getDashboardStats(): Promise<VendorDashboardStats> {
    const { data } = await apiClient.get<VendorDashboardStats>('/vendors/me/stats')
    return data
  },

  async getRecentLeads(limit = 10): Promise<RecentLead[]> {
    const { data } = await apiClient.get<RecentLead[]>('/vendors/me/leads/recent', {
      params: { limit },
    })
    return data
  },

  // ─── Events ─────────────────────────────────────────────────

  async getAssignedEvents(status?: string, lat?: number, lng?: number): Promise<VendorEvent[]> {
    const { data } = await apiClient.get<VendorEvent[]>('/vendors/me/events', {
      params: { status, lat, lng },
    })
    return data
  },

  async getEventDetail(eventId: string): Promise<VendorEvent> {
    const { data } = await apiClient.get<VendorEvent>(`/vendors/me/events/${eventId}`)
    return data
  },

  // ─── Leads ──────────────────────────────────────────────────

  async getLeads(params?: {
    eventId?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<VendorLead[]> {
    const { data } = await apiClient.get<VendorLead[]>('/vendors/me/leads', {
      params,
    })
    return data
  },

  async getLeadDetail(leadId: string): Promise<VendorLead> {
    const { data } = await apiClient.get<VendorLead>(`/vendors/me/leads/${leadId}`)
    return data
  },

  async updateLead(leadId: string, updates: {
    follow_up_status?: string
    notes?: string
  }): Promise<void> {
    await apiClient.patch(`/vendors/me/leads/${leadId}`, updates)
  },

  async exportLeadsCSV(eventId: string): Promise<Blob> {
    const { data } = await apiClient.get('/vendors/me/leads/export/csv', {
      params: { eventId },
      responseType: 'blob',
    })
    return data as Blob
  },

  // ─── Tablet ─────────────────────────────────────────────────

  async getTabletTokens(): Promise<TabletToken[]> {
    const { data } = await apiClient.get<TabletToken[]>('/vendors/me/tablet-tokens')
    return data
  },

  async generateTabletToken(eventId: string): Promise<TabletToken> {
    const { data } = await apiClient.post<TabletToken>('/vendors/me/tablet-tokens', {
      event_id: eventId,
    })
    return data
  },

  async rotateTabletToken(eventId: string): Promise<TabletToken> {
    const { data } = await apiClient.put<TabletToken>(`/vendors/me/tablet-tokens/${eventId}`)
    return data
  },

  async revokeTabletToken(eventId: string): Promise<void> {
    await apiClient.delete(`/vendors/me/tablet-tokens/${eventId}`)
  },

  // ─── Tablet Scan ────────────────────────────────────────────

  /**
   * Submit a face scan from the vendor tablet.
   * Uses tablet token auth — vendorId and eventId come from the JWT.
   */
  async tabletScan(faceImageBase64: string, tabletDeviceId: string) {
    const { data } = await apiClient.post('/scan/tablet', {
      faceImageBase64,
      tabletDeviceId,
    })
    return data as {
      matched: boolean
      confidence: number
      status?: 'consent_pending' | 'already_captured'
      leadId?: string
      message?: string
      deduplicated?: boolean
    }
  },

  async captureLead(scanLogId: string, notes?: string) {
    const { data } = await apiClient.post('/scan/tablet/capture-lead', {
      scanLogId,
      notes,
    })
    return data as { success: boolean; leadId: string; profile: Record<string, any> }
  },

  // ─── Invites / Event Participation ──────────────────────────

  async getPendingInvites() {
    const { data } = await apiClient.get('/vendors/me/invites')
    return data as Array<{
      id: string
      event_id: string
      event_name: string
      event_start: string
      event_end: string
      event_city: string
      event_venue: string
      booth_name: string | null
      invited_at: string
    }>
  },

  async acceptInvite(eventVendorId: string) {
    const { data } = await apiClient.post(`/vendors/me/invites/${eventVendorId}/accept`)
    return data as { success: boolean; status: string }
  },

  async declineInvite(eventVendorId: string) {
    const { data } = await apiClient.post(`/vendors/me/invites/${eventVendorId}/decline`)
    return data as { success: boolean; status: string }
  },

  async requestToJoinEvent(eventId: string, boothName?: string) {
    const { data } = await apiClient.post(`/vendors/me/events/${eventId}/request`, {
      booth_name: boothName,
    })
    return data as { success: boolean; id: string; event_name: string; status: string }
  },

  // ─── Business Card ─────────────────────────────────────────

  async getBusinessCard(vendorId: string) {
    const { data } = await apiClient.get(`/vendors/${vendorId}/business-card`)
    return data as {
      id: string
      business_name: string
      contact_name: string
      email: string
      phone: string | null
      tagline: string | null
      industry: string | null
      logo_url: string | null
      website: string | null
      social_links: Record<string, string>
      business_description: string | null
      products_services: Array<{ name: string; description?: string; image_url?: string }>
    }
  },

  // ─── Discover Events ────────────────────────────────────────

  async discoverEvents(params: Record<string, string> = {}) {
    const { data } = await apiClient.get('/vendors/me/events/discover', { params })
    return data as Array<{
      id: string
      name: string
      location: string
      event_start_date: string
      event_end_date: string
      cover_image_url?: string
      category?: string
      distance_km?: number
    }>
  },

  // ─── Analytics ──────────────────────────────────────────────

  async getVendorPerformance(vendorId: string): Promise<{
    events: {
      eventId: string
      eventName: string
      eventStatus: string
      startDate: string
      totalScans: number
      leads: number
      consentRate: number
      avgConfidence: number
      topGrade: string | null
    }[]
  }> {
    const { data } = await apiClient.get(`/analytics/vendor/${vendorId}/performance`)
    return data
  },

  async getVendorEventTimeline(vendorId: string, eventId: string): Promise<{
    dataPoints: { timestamp: string; scanCount: number; leads: number }[]
  }> {
    const { data } = await apiClient.get(`/analytics/vendor/${vendorId}/events/${eventId}/timeline`)
    return data
  },

  async getVendorEventLeadGrades(vendorId: string, eventId: string): Promise<{
    grades: { grade: string; count: number; percentage: number }[]
    total: number
  }> {
    const { data } = await apiClient.get(`/analytics/vendor/${vendorId}/events/${eventId}/lead-grades`)
    return data
  },
}
