/**
 * Organiser Service — API calls for event organisers.
 * Covers: organisation profile, event CRUD, vendor management,
 * consent configuration, attendee management, and analytics.
 */

import { apiClient } from './api.client'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Organisation {
  id: string
  name: string
  email: string
  plan: 'free' | 'event' | 'enterprise'
  logo_url: string | null
  website: string | null
  phone: string | null
  address: string | null
  city: string | null
  description: string | null
  created_at: string
}

export interface OrgEvent {
  id: string
  name: string
  description: string | null
  location: string
  city: string
  event_start_date: string
  event_end_date: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  logo_url: string | null
  cover_image_url: string | null
  category: string | null
  expected_attendees: number | null
  consent_config: {
    consent_copy?: string
    consent_language?: string
  }
  total_vendors: number
  total_scans: number
  total_leads: number
  total_opted_in?: number
  created_at: string
}

export interface OrgEventVendor {
  id: string
  vendor_id: string
  business_name: string
  contact_name: string
  email: string
  booth_name: string | null
  status: string
  leads_count: number
  scans_count: number
  active: boolean
  assigned_at: string
}

export interface OrgAttendee {
  id: string
  user_id: string
  full_name: string
  email: string
  opted_in: boolean
  opted_in_at: string | null
  revoked_at: string | null
}

export interface EventAnalyticsSummary {
  totalScans: number
  scansWithConsent: number
  scansWithoutConsent: number
  uniqueAttendees: number
  consentRate: number
  timestamp: string
}

export interface VendorSearchResult {
  id: string
  email: string
  business_name: string
  contact_name: string
  approved: boolean
  industry: string | null
  logo_url: string | null
}

export interface VendorPerformance {
  vendorId: string
  vendorName: string
  totalScans: number
  leadsApproved: number
  leadsDenied: number
  uniqueUsers: number
  consentRate: number
  avgMatchConfidence: number
}

export interface TimelinePoint {
  timestamp: string
  scanCount: number
  leadsApproved: number
}

export interface OrgDashboardStats {
  total_events: number
  active_events: number
  total_vendors: number
  total_scans: number
  total_leads: number
  total_attendees_opted_in: number
}

// ─── API Calls ──────────────────────────────────────────────────────────────

export const organiserService = {
  // ─── Organisation Profile ─────────────────────────────────────

  async getOrganisation(): Promise<Organisation> {
    const { data } = await apiClient.get<Organisation>('/organisations/me')
    return data
  },

  async updateOrganisation(updates: Partial<Organisation>): Promise<Organisation> {
    const { data } = await apiClient.put<Organisation>('/organisations/me', updates)
    return data
  },

  // ─── Dashboard ────────────────────────────────────────────────

  async getDashboardStats(): Promise<OrgDashboardStats> {
    const { data } = await apiClient.get<OrgDashboardStats>('/events/organiser/stats')
    return data
  },

  // ─── Events CRUD ──────────────────────────────────────────────

  async listEvents(status?: string): Promise<OrgEvent[]> {
    const { data } = await apiClient.get<OrgEvent[]>('/events/organiser/my-events', {
      params: { status },
    })
    return data
  },

  async getEvent(eventId: string): Promise<OrgEvent> {
    const { data } = await apiClient.get<OrgEvent>(`/events/${eventId}`)
    return data
  },

  async createEvent(event: {
    name: string
    description?: string
    location: string
    city: string
    event_start_date: string
    event_end_date: string
    latitude?: number
    longitude?: number
    address?: string
    category?: string
    expected_attendees?: number
    cover_image_url?: string
    logo_url?: string
    consent_config?: { consent_copy?: string; consent_language?: string }
  }): Promise<OrgEvent> {
    const { data } = await apiClient.post<OrgEvent>('/events/organiser/create', event)
    return data
  },

  async updateEvent(
    eventId: string,
    updates: Partial<OrgEvent>,
  ): Promise<OrgEvent> {
    const { data } = await apiClient.put<OrgEvent>(`/events/${eventId}`, updates)
    return data
  },

  async activateEvent(eventId: string): Promise<void> {
    await apiClient.put(`/events/${eventId}/activate`)
  },

  async cancelEvent(eventId: string): Promise<void> {
    await apiClient.put(`/events/${eventId}/cancel`)
  },

  // ─── Vendor Management ────────────────────────────────────────

  async getEventVendors(eventId: string): Promise<OrgEventVendor[]> {
    const { data } = await apiClient.get<OrgEventVendor[]>(
      `/events/${eventId}/vendors`,
    )
    return data
  },

  async inviteVendor(
    eventId: string,
    vendorEmail: string,
    boothName?: string,
  ): Promise<{
    type: 'existing_vendor' | 'email_sent'
    message: string
    vendor_id?: string
    business_name?: string
    email: string
    status?: string
    inviteUrl?: string
    inviteToken?: string
  }> {
    const { data } = await apiClient.post(`/events/${eventId}/vendors/invite`, {
      email: vendorEmail,
      booth_name: boothName,
    })
    return data
  },

  /** Accept a vendor invite after signup (frontend calls this right after vendorSignup) */
  async acceptVendorInvite(inviteToken: string): Promise<{
    joined: boolean
    event_id: string
    event_name: string | null
    booth_name: string | null
  }> {
    const { data } = await apiClient.post('/events/vendor-invite/accept', {
      invite_token: inviteToken,
    })
    return data
  },

  async searchVendors(email: string): Promise<VendorSearchResult[]> {
    const { data } = await apiClient.get<VendorSearchResult[]>('/events/vendor-search', {
      params: { email },
    })
    return data
  },

  async removeVendor(eventId: string, vendorId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/vendors/${vendorId}`)
  },

  async updateVendorBooth(
    eventId: string,
    vendorId: string,
    boothName: string,
  ): Promise<void> {
    await apiClient.put(`/events/${eventId}/vendors/${vendorId}`, {
      booth_name: boothName,
    })
  },

  // ─── Attendees / Consent ──────────────────────────────────────

  async getEventAttendees(eventId: string): Promise<OrgAttendee[]> {
    const { data } = await apiClient.get<OrgAttendee[]>(
      `/events/${eventId}/attendees`,
    )
    return data
  },

  // ─── Analytics ────────────────────────────────────────────────

  async getEventAnalytics(eventId: string): Promise<EventAnalyticsSummary> {
    const { data } = await apiClient.get<EventAnalyticsSummary>(
      `/analytics/events/${eventId}/summary`,
    )
    return data
  },

  async getVendorBreakdown(eventId: string): Promise<{
    vendors: VendorPerformance[]
    totalVendors: number
  }> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/vendors`)
    return data
  },

  async getTimeline(
    eventId: string,
    interval: '1m' | '5m' | '1h' = '1h',
  ): Promise<{
    dataPoints: TimelinePoint[]
    totalScans: number
    totalLeads: number
  }> {
    const { data } = await apiClient.get(
      `/analytics/events/${eventId}/timeline`,
      { params: { interval } },
    )
    return data
  },

  async getTopVendors(
    eventId: string,
    limit = 5,
  ): Promise<{
    vendors: { rank: number; vendorId: string; vendorName: string; scanCount: number; leadsCount: number }[]
  }> {
    const { data } = await apiClient.get(
      `/analytics/events/${eventId}/top-vendors`,
      { params: { limit } },
    )
    return data
  },

  async exportAnalyticsCSV(eventId: string): Promise<Blob> {
    const { data } = await apiClient.get(
      `/analytics/events/${eventId}/export/csv`,
      { responseType: 'blob' },
    )
    return data as Blob
  },

  // ─── New Analytics ────────────────────────────────────────────

  async getEventFunnel(eventId: string): Promise<{
    funnel: { stage: string; count: number; color: string }[]
    conversionRate: number
  }> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/funnel`)
    return data
  },

  async getLeadGrades(eventId: string): Promise<{
    grades: { grade: string; count: number; percentage: number }[]
    total: number
  }> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/lead-grades`)
    return data
  },

  async getHourlyHeatmap(eventId: string): Promise<{
    data: { hour: number; dayOfWeek: number; count: number }[]
    peakHour: number | null
  }> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/hourly-heatmap`)
    return data
  },

  async getAttendeeProfile(eventId: string): Promise<{
    topIndustries: { name: string; count: number }[]
    topDesignations: { name: string; count: number }[]
    totalConsented: number
  }> {
    const { data } = await apiClient.get(`/analytics/events/${eventId}/attendee-profile`)
    return data
  },

  async getOrgEventComparison(organisationId: string): Promise<{
    events: {
      eventId: string
      eventName: string
      status: string
      startDate: string
      scans: number
      leads: number
      optedIn: number
      consentRate: number
    }[]
  }> {
    const { data } = await apiClient.get(`/analytics/organisation/${organisationId}/event-comparison`)
    return data
  },
}
