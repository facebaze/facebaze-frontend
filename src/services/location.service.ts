/**
 * Location Service — Geolocation, reverse geocoding, distance calculation.
 */

import { apiClient } from './api.client'

export interface GeoPosition {
  lat: number
  lng: number
}

export interface LocationInfo extends GeoPosition {
  city: string
  area: string
  state: string
  country: string
}

const STORAGE_KEY = 'facebase_last_location'

/**
 * Haversine distance between two points in km.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Format distance for display
 */
export function formatDistance(km: number | null | undefined): string {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)}m away`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export const locationService = {
  /**
   * Get current position from browser Geolocation API.
   */
  async getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      )
    })
  },

  /**
   * Reverse geocode coordinates to city/area/state.
   * Uses BigDataCloud free API (no key needed).
   */
  async reverseGeocode(lat: number, lng: number): Promise<LocationInfo> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      )
      const data = await res.json()
      return {
        lat,
        lng,
        city: data.city || data.locality || 'Unknown',
        area: data.locality || data.principalSubdivision || '',
        state: data.principalSubdivision || '',
        country: data.countryName || '',
      }
    } catch {
      return { lat, lng, city: 'Unknown', area: '', state: '', country: '' }
    }
  },

  /**
   * Persist last location to localStorage.
   */
  saveLocation(location: LocationInfo): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    } catch {}
  },

  /**
   * Load last saved location from localStorage.
   */
  loadSavedLocation(): LocationInfo | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  /**
   * Search locations via backend proxy (Google Places / Nominatim fallback).
   * Requires auth token.
   */
  async searchPlaces(query: string, lat?: number, lng?: number): Promise<LocationSearchResult[]> {
    try {
      const params = new URLSearchParams({ q: query })
      if (lat != null) params.set('lat', String(lat))
      if (lng != null) params.set('lng', String(lng))
      const { data } = await apiClient.get<LocationSearchResult[]>(`/location/autocomplete?${params}`)
      return data
    } catch {
      return []
    }
  },

  /**
   * Reverse geocode via backend proxy (Google Geocoding / Nominatim fallback).
   * Requires auth token.
   */
  async reverseGeocodeApi(lat: number, lng: number): Promise<LocationSearchResult | null> {
    try {
      const { data } = await apiClient.get<LocationSearchResult>(`/location/reverse?lat=${lat}&lng=${lng}`)
      return data
    } catch {
      return null
    }
  },

  /**
   * Save user location to backend profile (non-blocking).
   */
  async persistLocationToProfile(lat: number, lng: number, city: string): Promise<void> {
    try {
      await apiClient.put('/profiles/me', { latitude: lat, longitude: lng, location: city })
    } catch {
      // Non-blocking — don't break UX
    }
  },
}

/** Result from backend /location/autocomplete and /location/reverse */
export interface LocationSearchResult {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  lat: number
  lng: number
  type: 'search' | 'gps'
}
