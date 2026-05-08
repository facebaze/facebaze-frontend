/**
 * Scan Service — API calls for scanning, consent, and history.
 */

import { apiClient } from './api.client'

export interface ScanResult {
  status: 'matched' | 'no_match' | 'error'
  consent?: 'granted' | 'pending' | 'denied'
  consent_request_id?: string
  timeout?: number
  profile?: ScannedProfile
  match_confidence?: number
}

export interface ScannedProfile {
  id: string
  full_name: string
  designation: string | null
  company_name: string | null
  location: string | null
  tags: string[]
  email: string | null
  phone: string | null
  linkedin: string | null
  profile_photo_url: string | null
}

export interface ScanHistoryItem {
  id: string
  direction: 'incoming' | 'outgoing' | 'vendor'
  scanner_name: string | null
  scanner_company: string | null
  scanner_photo: string | null
  event_name: string | null
  consent: boolean | null
  scanned_at: string
}

export interface QuickStats {
  scans_today: number
  saved_contacts: number
  events_opted_in: number
}

export interface RecentActivity {
  id: string
  type: 'scan_received' | 'scan_sent' | 'contact_saved' | 'vendor_scan'
  actor_name: string
  event_name: string | null
  consent_status: string
  timestamp: string
}

export const scanService = {
  /**
   * Perform a peer-to-peer face scan.
   */
  async scanPeer(faceImage: string, eventId?: string): Promise<ScanResult> {
    const { data } = await apiClient.post<ScanResult>('/scan/peer', {
      face_image: faceImage,
      event_id: eventId,
    })
    return data
  },

  /**
   * Get scan history.
   */
  async getHistory(
    direction: 'incoming' | 'outgoing' | 'vendor',
    limit = 20,
    offset = 0
  ): Promise<ScanHistoryItem[]> {
    const { data } = await apiClient.get<ScanHistoryItem[]>('/scan/history', {
      params: { direction, limit, offset },
    })
    return data
  },

  /**
   * Revoke consent for a specific scan.
   */
  async revokeConsent(scanId: string): Promise<void> {
    await apiClient.delete(`/scan/${scanId}/consent`)
  },

  /**
   * Get quick stats for home screen.
   */
  async getQuickStats(): Promise<QuickStats> {
    const { data } = await apiClient.get<QuickStats>('/scan/stats')
    return data
  },

  /**
   * Get recent activity feed.
   */
  async getRecentActivity(limit = 5): Promise<RecentActivity[]> {
    const { data } = await apiClient.get<RecentActivity[]>('/scan/activity', {
      params: { limit },
    })
    return data
  },

  /**
   * Save a scanned contact.
   */
  async saveContact(profileId: string): Promise<void> {
    await apiClient.post('/scan/save-contact', { profile_id: profileId })
  },

  /**
   * Get vendor business cards collected by customer, grouped by event.
   */
  async getVendorConnections(): Promise<VendorConnectionGroup[]> {
    const { data } = await apiClient.get<VendorConnectionGroup[]>('/scan/vendor-connections')
    return data
  },
}

export interface VendorConnectionGroup {
  event_id: string
  event_name: string
  vendors: Array<{
    scan_id: string
    vendor_id: string
    scanned_at: string
    match_confidence: number
    saved: boolean
    business_card: {
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
      branding?: Record<string, any>
    }
  }>
}
