'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconMapPin,
  IconCurrentLocation,
  IconSearch,
  IconX,
  IconArrowLeft,
  IconClock,
  IconLoader2,
  IconMapPinFilled,
  IconBuilding,
} from '@tabler/icons-react'
import { locationService, type LocationSearchResult } from '@/services/location.service'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationResult {
  id: string
  name: string          // primary display (e.g. "Westin Hotel")
  address: string       // secondary line (e.g. "Koregaon Park, Pune, Maharashtra")
  city: string
  state: string
  country: string
  lat: number
  lng: number
  type: 'gps' | 'search' | 'recent' | 'popular'
}

interface LocationSearchProps {
  /** Currently selected location (for display) */
  value?: LocationResult | null
  /** Callback with full location result */
  onSelect: (location: LocationResult) => void
  /** Placeholder text */
  placeholder?: string
  /** Display mode: 'compact' (inline chip), 'field' (form input), 'full' (full-width bar) */
  variant?: 'compact' | 'field' | 'full'
  /** Allow GPS detection */
  showGPS?: boolean
  /** Show recent locations */
  showRecent?: boolean
  /** Additional className */
  className?: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const POPULAR_CITIES: LocationResult[] = [
  { id: 'mumbai', name: 'Mumbai', address: 'Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777, type: 'popular' },
  { id: 'bangalore', name: 'Bangalore', address: 'Karnataka, India', city: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946, type: 'popular' },
  { id: 'pune', name: 'Pune', address: 'Maharashtra, India', city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567, type: 'popular' },
  { id: 'delhi', name: 'Delhi', address: 'Delhi NCR, India', city: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209, type: 'popular' },
  { id: 'hyderabad', name: 'Hyderabad', address: 'Telangana, India', city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.385, lng: 78.4867, type: 'popular' },
  { id: 'chennai', name: 'Chennai', address: 'Tamil Nadu, India', city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707, type: 'popular' },
  { id: 'kolkata', name: 'Kolkata', address: 'West Bengal, India', city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639, type: 'popular' },
  { id: 'ahmedabad', name: 'Ahmedabad', address: 'Gujarat, India', city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714, type: 'popular' },
]

const RECENT_KEY = 'facebase_recent_locations'
const MAX_RECENT = 5

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getRecents(): LocationResult[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecent(location: LocationResult) {
  try {
    const existing = getRecents().filter((l) => l.id !== location.id)
    const updated = [{ ...location, type: 'recent' as const }, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {}
}

// Search via backend proxy (Google Places / Nominatim fallback)
async function searchLocations(query: string, lat?: number, lng?: number): Promise<LocationResult[]> {
  if (!query || query.length < 2) return []
  try {
    const results = await locationService.searchPlaces(query, lat, lng)
    return results.map((r: LocationSearchResult) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      city: r.city,
      state: r.state,
      country: r.country,
      lat: r.lat,
      lng: r.lng,
      type: 'search' as const,
    }))
  } catch {
    return []
  }
}

// Reverse geocode via backend proxy
async function reverseGeocode(lat: number, lng: number): Promise<LocationResult> {
  try {
    const result = await locationService.reverseGeocodeApi(lat, lng)
    if (result) {
      return {
        id: result.id,
        name: result.name,
        address: result.address,
        city: result.city,
        state: result.state,
        country: result.country,
        lat: result.lat,
        lng: result.lng,
        type: 'gps',
      }
    }
  } catch {}
  return {
    id: `gps_${lat}_${lng}`,
    name: 'Current Location',
    address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: 'Unknown',
    state: '',
    country: '',
    lat,
    lng,
    type: 'gps',
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LocationSearch({
  value,
  onSelect,
  placeholder = 'Search location...',
  variant = 'compact',
  showGPS = true,
  showRecent = true,
  className,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [searching, setSearching] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [recents, setRecents] = useState<LocationResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load recents when opening
  useEffect(() => {
    if (open && showRecent) {
      setRecents(getRecents())
    }
  }, [open, showRecent])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q || q.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchLocations(q, value?.lat, value?.lng)
      setResults(res)
      setSearching(false)
    }, 400)
  }, [value?.lat, value?.lng])

  // GPS detection
  const handleGPS = async () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })
      const location = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      saveRecent(location)
      onSelect(location)
      setOpen(false)
    } catch {
      // silent fail
    } finally {
      setGpsLoading(false)
    }
  }

  // Select a result
  const handleSelect = (location: LocationResult) => {
    saveRecent(location)
    onSelect(location)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  // ─── Trigger ──────────────────────────────────────────────────────────────────

  const Trigger = () => {
    if (variant === 'compact') {
      return (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-1.5 active:opacity-70 transition-opacity',
            className,
          )}
        >
          <IconMapPin size={14} className="text-brand-500 shrink-0" stroke={2} />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
            {value?.city || value?.name || 'Set Location'}
          </span>
          <svg className="w-2.5 h-2.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )
    }

    if (variant === 'field') {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors hover:border-brand-300 focus:border-brand-400',
            className,
          )}
        >
          <IconMapPin size={16} className="text-brand-500 shrink-0" stroke={1.5} />
          <span className={cn(
            'text-sm flex-1 truncate',
            value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400',
          )}>
            {value ? `${value.name}${value.address ? `, ${value.address}` : ''}` : placeholder}
          </span>
          <IconSearch size={14} className="text-slate-400 shrink-0" />
        </button>
      )
    }

    // variant === 'full'
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'w-full flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left active:scale-[0.99] transition-transform',
          className,
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
          <IconMapPin size={18} className="text-brand-500" stroke={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {value?.name || 'Select Location'}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {value?.address || 'Search for a venue, city or address'}
          </p>
        </div>
        <IconSearch size={16} className="text-slate-400 shrink-0" />
      </button>
    )
  }

  // ─── Full-screen search overlay ────────────────────────────────────────────────

  return (
    <>
      <Trigger />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] bg-white dark:bg-slate-900 flex flex-col"
            >
            {/* Search header */}
            <div className="flex items-center gap-3 px-4 pt-safe-top border-b border-slate-100 dark:border-slate-800">
              <div className="pt-4 pb-3 flex items-center gap-3 w-full">
              <button
                onClick={() => { setOpen(false); setQuery(''); setResults([]) }}
                className="p-2 -ml-2 rounded-xl active:bg-slate-100 dark:active:bg-slate-800"
              >
                <IconArrowLeft size={20} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
              </button>
              <div className="flex-1 relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <IconX size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* GPS button */}
              {showGPS && (
                <button
                  onClick={handleGPS}
                  disabled={gpsLoading}
                  className="w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    gpsLoading ? 'bg-brand-100 dark:bg-brand-900' : 'bg-brand-50 dark:bg-brand-950',
                  )}>
                    {gpsLoading ? (
                      <IconLoader2 size={20} className="text-brand-500 animate-spin" stroke={1.5} />
                    ) : (
                      <IconCurrentLocation size={20} className="text-brand-500" stroke={1.5} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {gpsLoading ? 'Detecting your location...' : 'Use current location'}
                    </p>
                    <p className="text-xs text-slate-400">Using GPS</p>
                  </div>
                </button>
              )}

              {/* Search results */}
              {searching && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <IconLoader2 size={16} className="text-slate-400 animate-spin" />
                  <span className="text-sm text-slate-400">Searching...</span>
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="py-2">
                  <p className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Search Results
                  </p>
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-start gap-3 px-5 py-3 active:bg-slate-50 dark:active:bg-slate-800 transition-colors text-left"
                    >
                      <IconMapPinFilled size={18} className="text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{item.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && query.length >= 2 && results.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <IconMapPin size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No locations found</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Try a different search term</p>
                </div>
              )}

              {/* Recent locations */}
              {!query && showRecent && recents.length > 0 && (
                <div className="py-2">
                  <p className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Recent
                  </p>
                  {recents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-start gap-3 px-5 py-3 active:bg-slate-50 dark:active:bg-slate-800 transition-colors text-left"
                    >
                      <IconClock size={16} className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{item.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular cities */}
              {!query && (
                <div className="py-2">
                  <p className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Popular Cities
                  </p>
                  <div className="grid grid-cols-2 gap-2 px-5 py-2">
                    {POPULAR_CITIES.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelect(city)}
                        className={cn(
                          'flex items-center gap-2.5 p-3 rounded-xl border transition-colors text-left',
                          value?.city === city.city
                            ? 'border-brand-300 bg-brand-50 dark:bg-brand-950 dark:border-brand-700'
                            : 'border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800',
                        )}
                      >
                        <IconBuilding size={16} className={cn(
                          value?.city === city.city ? 'text-brand-500' : 'text-slate-400',
                        )} stroke={1.5} />
                        <span className={cn(
                          'text-sm font-medium truncate',
                          value?.city === city.city
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-700 dark:text-slate-300',
                        )}>
                          {city.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  )
}
