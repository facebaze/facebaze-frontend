/**
 * Privacy Service — API calls for privacy settings, data exports, and account deletion.
 */

import { apiClient } from './api.client'

export interface PrivacySettings {
  permission_mode: 'always_ask' | 'auto_allow' | 'do_not_scan'
  do_not_scan: boolean
}

export interface ConsentRecord {
  id: string
  consent_type: string
  version: string
  agreed_at: string
  event_name: string | null
}

export interface ActiveConsent {
  event_id: string
  event_name: string
  opted_in_at: string
}

export const privacyService = {
  async getSettings(): Promise<PrivacySettings> {
    const { data } = await apiClient.get<PrivacySettings>('/profiles/privacy')
    return data
  },

  async updateSettings(settings: Partial<PrivacySettings>): Promise<void> {
    await apiClient.put('/profiles/settings', settings)
  },

  async getConsentRecords(): Promise<ConsentRecord[]> {
    const { data } = await apiClient.get<ConsentRecord[]>('/profiles/consent-records')
    return data
  },

  async getActiveConsents(): Promise<ActiveConsent[]> {
    const { data } = await apiClient.get<ActiveConsent[]>('/profiles/active-consents')
    return data
  },

  async requestDataExport(): Promise<void> {
    await apiClient.post('/profiles/export-data')
  },

  async deleteFaceData(): Promise<void> {
    await apiClient.delete('/profiles/face-data')
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/profiles')
  },
}
