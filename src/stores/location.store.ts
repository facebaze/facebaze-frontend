'use client'

import { create } from 'zustand'
import { locationService, type LocationInfo } from '@/services/location.service'

interface LocationState {
  location: LocationInfo | null
  isLoading: boolean
  error: string | null
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown'
  requestLocation: () => Promise<void>
  setManualCity: (city: string, lat: number, lng: number) => void
  initialize: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  isLoading: false,
  error: null,
  permissionState: 'unknown',

  initialize: () => {
    // Load saved location from localStorage on startup
    const saved = locationService.loadSavedLocation()
    if (saved && saved.city && saved.city !== 'Unknown') {
      set({ location: saved })
    }
    // Check permission state and auto-detect if no saved location
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        set({ permissionState: result.state as any })

        // Listen for permission changes (user grants after prompt)
        result.addEventListener('change', () => {
          set({ permissionState: result.state as any })
          if (result.state === 'granted') {
            const current = get()
            if (!current.location || current.location.city === 'Unknown') {
              get().requestLocation()
            }
          }
        })

        // Auto-detect if granted or prompt (no saved valid location)
        const current = get()
        if (!current.location || current.location.city === 'Unknown') {
          if (result.state === 'granted' || result.state === 'prompt') {
            get().requestLocation()
          }
        }
      }).catch(() => {
        // Fallback: try to auto-detect anyway if no valid location
        const current = get()
        if (!current.location || current.location.city === 'Unknown') {
          get().requestLocation()
        }
      })
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      // No permissions API, just try
      const current = get()
      if (!current.location || current.location.city === 'Unknown') {
        get().requestLocation()
      }
    }
  },

  requestLocation: async () => {
    set({ isLoading: true, error: null })
    try {
      const pos = await locationService.getCurrentPosition()
      const info = await locationService.reverseGeocode(pos.lat, pos.lng)
      locationService.saveLocation(info)
      set({ location: info, isLoading: false, permissionState: 'granted' })
      // Persist to backend (non-blocking)
      locationService.persistLocationToProfile(info.lat, info.lng, info.city)
    } catch (err: any) {
      const errorMsg =
        err?.code === 1
          ? 'Location permission denied'
          : 'Unable to get location'
      set({
        isLoading: false,
        error: errorMsg,
        permissionState: err?.code === 1 ? 'denied' : 'unknown',
      })
    }
  },

  setManualCity: (city: string, lat: number, lng: number) => {
    const info: LocationInfo = { lat, lng, city, area: city, state: '', country: '' }
    locationService.saveLocation(info)
    set({ location: info, error: null })
    // Persist to backend (non-blocking)
    locationService.persistLocationToProfile(lat, lng, city)
  },
}))
