/**
 * Event Service — API calls for events, opt-in, search, discovery.
 */

import { apiClient } from './api.client'

export type EventCategory = 'conference' | 'meetup' | 'exhibition' | 'networking' | 'workshop' | 'hackathon' | 'other'

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'conference', label: 'Conference', icon: 'microphone' },
  { value: 'meetup', label: 'Meetup', icon: 'users' },
  { value: 'exhibition', label: 'Exhibition', icon: 'building' },
  { value: 'networking', label: 'Networking', icon: 'handshake' },
  { value: 'workshop', label: 'Workshop', icon: 'tool' },
  { value: 'hackathon', label: 'Hackathon', icon: 'code' },
  { value: 'other', label: 'Other', icon: 'calendar' },
]

export interface EventItem {
  id: string
  name: string
  description: string | null
  location: string | null
  city: string | null
  event_start_date: string
  event_end_date: string
  logo_url: string | null
  cover_image_url: string | null
  category: EventCategory | null
  latitude: number | null
  longitude: number | null
  expected_attendees: number | null
  status: 'upcoming' | 'active' | 'past'
  opted_in: boolean
  vendor_count: number
  attendee_count: number
  distance_km?: number | null
}

export interface EventDetail extends EventItem {
  consent_text: string | null
  organiser_name: string | null
  address: string | null
}

export interface EventSearchParams {
  q?: string
  category?: EventCategory
  city?: string
  lat?: number
  lng?: number
  radius?: number
  sort?: 'date' | 'distance' | 'popularity'
  status?: 'upcoming' | 'active' | 'past'
}

export const eventService = {
  /**
   * List events the user can see.
   */
  async listEvents(status?: 'upcoming' | 'active' | 'past', lat?: number, lng?: number): Promise<EventItem[]> {
    const { data } = await apiClient.get<EventItem[]>('/events', {
      params: { status, lat, lng },
    })
    return data
  },

  /**
   * Search/discover events with filters.
   */
  async searchEvents(params: EventSearchParams): Promise<EventItem[]> {
    const { data } = await apiClient.get<EventItem[]>('/events/discover/search', { params })
    return data
  },

  /**
   * Get nearby events.
   */
  async getNearbyEvents(lat: number, lng: number, radius = 50): Promise<EventItem[]> {
    const { data } = await apiClient.get<EventItem[]>('/events/discover/nearby', {
      params: { lat, lng, radius },
    })
    return data
  },

  /**
   * Get featured/popular events.
   */
  async getFeaturedEvents(): Promise<EventItem[]> {
    const { data } = await apiClient.get<EventItem[]>('/events/discover/featured')
    return data
  },

  /**
   * Get event detail.
   */
  async getEvent(eventId: string): Promise<EventDetail> {
    const { data } = await apiClient.get<EventDetail>(`/events/${eventId}`)
    return data
  },

  /**
   * Opt into an event (consent to be scanned by vendors).
   */
  async optIn(eventId: string): Promise<void> {
    await apiClient.post(`/events/${eventId}/opt-in`)
  },

  /**
   * Opt out of an event.
   */
  async optOut(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/opt-in`)
  },

  /**
   * Bookmark an event.
   */
  async bookmark(eventId: string): Promise<void> {
    await apiClient.post(`/events/${eventId}/bookmark`)
  },

  /**
   * Remove bookmark.
   */
  async removeBookmark(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/bookmark`)
  },
}
