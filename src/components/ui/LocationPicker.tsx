'use client'

import { useEffect } from 'react'
import { useLocationStore } from '@/stores/location.store'
import LocationSearch, { type LocationResult } from './LocationSearch'

/**
 * LocationPicker — Drop-in wrapper around LocationSearch that syncs with the global location store.
 * Use this anywhere you need the customer's current city/location context.
 */
export default function LocationPicker({ compact = false }: { compact?: boolean }) {
  const { location, initialize, setManualCity } = useLocationStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const currentValue: LocationResult | null = location
    ? {
        id: `store_${location.city}`,
        name: location.area || location.city,
        address: [location.city, location.state, location.country].filter(Boolean).join(', '),
        city: location.city,
        state: location.state,
        country: location.country,
        lat: location.lat,
        lng: location.lng,
        type: 'gps',
      }
    : null

  const handleSelect = (result: LocationResult) => {
    setManualCity(result.city || result.name, result.lat, result.lng)
  }

  return (
    <LocationSearch
      value={currentValue}
      onSelect={handleSelect}
      variant={compact ? 'compact' : 'compact'}
      placeholder="Search for a city or area..."
      showGPS
      showRecent
    />
  )
}
