'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconCalendar,
  IconSparkles,
  IconMapPin,
  IconUsers,
  IconBuilding,
  IconCircleCheck,
  IconX,
  IconAdjustmentsHorizontal,
  IconMicrophone,
  IconUsersGroup,
  IconCode,
  IconHandGrab,
  IconTool,
} from '@tabler/icons-react'
import { useLocationStore } from '@/stores/location.store'
import { eventService, type EventItem, EVENT_CATEGORIES, type EventSearchParams } from '@/services/event.service'
import { formatDistance } from '@/services/location.service'
import { Skeleton } from '@/components/ui'
import LocationPicker from '@/components/ui/LocationPicker'
import { cn } from '@/lib/utils'

type Tab = 'upcoming' | 'active' | 'past'

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'upcoming', label: 'Upcoming', icon: <IconCalendar size={14} /> },
  { value: 'active', label: 'Live Now', icon: <IconSparkles size={14} /> },
  { value: 'past', label: 'Past', icon: <IconCalendar size={14} /> },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  conference: <IconMicrophone size={16} />,
  meetup: <IconUsersGroup size={16} />,
  exhibition: <IconBuilding size={16} />,
  networking: <IconHandGrab size={16} />,
  workshop: <IconTool size={16} />,
  hackathon: <IconCode size={16} />,
  other: <IconCalendar size={16} />,
}

export default function EventsPage() {
  const router = useRouter()
  const location = useLocationStore((s) => s.location)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params: EventSearchParams = {
        status: tab,
        sort: location ? 'distance' : 'date',
        ...(search && { q: search }),
        ...(selectedCategory && { category: selectedCategory as any }),
        ...(location?.lat && location?.lng && { lat: location.lat, lng: location.lng }),
      }
      const data = await eventService.searchEvents(params).catch(() =>
        eventService.listEvents(tab, location?.lat, location?.lng)
      )
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [tab, search, selectedCategory, location?.lat, location?.lng])

  useEffect(() => {
    const timeout = setTimeout(loadEvents, search ? 300 : 0)
    return () => clearTimeout(timeout)
  }, [loadEvents])

  const activeFilterCount = (selectedCategory ? 1 : 0)

  return (
    <div className="flex-1 pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50">
        <div className="px-4 pt-safe-top">
          <div className="flex items-center justify-between pt-4 pb-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Events</h1>
            <LocationPicker compact />
          </div>
        </div>

        {/* Search + Filter Row */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search events, venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-800"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); searchRef.current?.focus() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-200 dark:bg-slate-600"
                >
                  <IconX size={12} className="text-slate-500 dark:text-slate-300" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500',
              )}
            >
              <IconAdjustmentsHorizontal size={18} />
              {activeFilterCount > 0 && !showFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {TABS.map((t) => {
              const isActive = tab === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="events-tab"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {t.icon}
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-medium text-brand-600 active:text-brand-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.value
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(isActive ? null : cat.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all text-center',
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-500 text-brand-700 dark:text-brand-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-700',
                      )}
                    >
                      <span className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        isActive ? 'bg-brand-100 dark:bg-brand-800/50 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      )}>
                        {CATEGORY_ICONS[cat.value] || <IconCalendar size={16} />}
                      </span>
                      <span className="text-[11px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chip */}
      {selectedCategory && !showFilters && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {CATEGORY_ICONS[selectedCategory]}
              {EVENT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
              <button onClick={() => setSelectedCategory(null)} className="ml-0.5">
                <IconX size={12} />
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="mt-4 px-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                <Skeleton className="h-36 w-full" />
                <div className="p-3"><Skeleton className="h-4 w-40 rounded-lg mb-2" /><Skeleton className="h-3 w-28 rounded-lg" /></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm p-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <IconSparkles size={26} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {search ? 'No events found' : 'No events'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {search ? 'Try a different search or adjust filters' : 'Check back soon for new events'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {events.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  onClick={() => router.push(`/main/events/detail?id=${event.id}`)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function EventCard({
  event,
  onClick,
  index = 0,
}: {
  event: EventItem
  onClick: () => void
  index?: number
}) {
  const isLive = event.status === 'active'
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* Banner */}
      <div className="relative h-36 w-full">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            event.opted_in ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : isLive ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : 'bg-gradient-to-br from-brand-400 to-brand-700',
          )}>
            <IconCalendar size={36} className="text-white/30" stroke={1.5} />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" /></span>
              Live
            </span>
          )}
          {event.category && (
            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg capitalize">
              {event.category}
            </span>
          )}
        </div>
        {event.opted_in && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <IconCircleCheck size={12} /> Joined
          </div>
        )}
        {event.distance_km != null && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
            {formatDistance(event.distance_km)}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.name}</h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <IconCalendar size={12} className="text-slate-400 shrink-0" />
            {formatDateRange(event.event_start_date, event.event_end_date)}
          </span>
          {(event.city || event.location) && (
            <span className="flex items-center gap-1 truncate">
              <IconMapPin size={12} className="text-slate-400 shrink-0" />
              {event.city || event.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          {event.vendor_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <IconBuilding size={11} /> {event.vendor_count} vendors
            </span>
          )}
          {event.expected_attendees && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <IconUsers size={11} /> {event.expected_attendees}+
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}`
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}
