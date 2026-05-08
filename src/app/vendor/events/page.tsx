'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconScan,
  IconChevronRight,
  IconDeviceTablet,
  IconCopy,
  IconCheck,
  IconMail,
  IconCircleCheck,
  IconCircleX,
  IconSearch,
  IconCompass,
  IconX,
  IconAdjustmentsHorizontal,
  IconMicrophone,
  IconUsersGroup,
  IconCode,
  IconHandGrab,
  IconTool,
  IconBuilding,
  IconChartBar,
} from '@tabler/icons-react'
import { vendorService, type VendorEvent } from '@/services/vendor.service'
import { useLocationStore } from '@/stores/location.store'
import { eventService, EVENT_CATEGORIES, type EventItem } from '@/services/event.service'
import LocationPicker from '@/components/ui/LocationPicker'
import { cn } from '@/lib/utils'

type Tab = 'events' | 'invites' | 'discover'
type Filter = 'all' | 'active' | 'upcoming' | 'completed'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  conference: <IconMicrophone size={16} />,
  meetup: <IconUsersGroup size={16} />,
  exhibition: <IconBuilding size={16} />,
  networking: <IconHandGrab size={16} />,
  workshop: <IconTool size={16} />,
  hackathon: <IconCode size={16} />,
  other: <IconCalendar size={16} />,
}

interface Invite {
  id: string
  event_id: string
  event_name: string
  event_start: string
  event_end: string
  event_city: string
  event_venue: string
  organiser_name?: string
  status?: string
  booth_name?: string | null
  invited_at: string
}

export default function VendorEventsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('events')
  const [events, setEvents] = useState<VendorEvent[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [discoverEvents, setDiscoverEvents] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [discoverSearch, setDiscoverSearch] = useState('')
  const [discoverCategory, setDiscoverCategory] = useState<string | null>(null)
  const [showDiscoverFilters, setShowDiscoverFilters] = useState(false)
  const location = useLocationStore((s) => s.location)

  const fetchEvents = useCallback(async () => {
    try {
      const data = await vendorService.getAssignedEvents(
        filter === 'all' ? undefined : filter,
        location?.lat,
        location?.lng
      )
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [filter, location?.lat, location?.lng])

  const fetchInvites = useCallback(async () => {
    try {
      const data = await vendorService.getPendingInvites()
      setInvites(data)
    } catch {
      setInvites([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDiscover = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (discoverSearch) params.q = discoverSearch
      if (discoverCategory) params.category = discoverCategory
      if (location?.lat && location?.lng) {
        params.lat = String(location.lat)
        params.lng = String(location.lng)
      }
      const data = await vendorService.discoverEvents(params).catch(() => [] as EventItem[])
      setDiscoverEvents(data)
    } catch {
      setDiscoverEvents([])
    } finally {
      setLoading(false)
    }
  }, [discoverSearch, discoverCategory, location?.lat, location?.lng])

  useEffect(() => {
    setLoading(true)
    if (tab === 'events') fetchEvents()
    else if (tab === 'invites') fetchInvites()
    else {
      const timeout = setTimeout(fetchDiscover, discoverSearch ? 300 : 0)
      return () => clearTimeout(timeout)
    }
  }, [tab, fetchEvents, fetchInvites, fetchDiscover])

  const handleAcceptInvite = async (inviteId: string) => {
    setRespondingId(inviteId)
    try {
      await vendorService.acceptInvite(inviteId)
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
    } finally {
      setRespondingId(null)
    }
  }

  const handleDeclineInvite = async (inviteId: string) => {
    setRespondingId(inviteId)
    try {
      await vendorService.declineInvite(inviteId)
      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">My Events</h1>
          <LocationPicker compact />
        </div>

        {/* Segmented Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {([
              { id: 'events' as Tab, label: 'Events', icon: <IconCalendar size={14} /> },
              { id: 'invites' as Tab, label: 'Invites', icon: <IconMail size={14} />, badge: invites.length },
              { id: 'discover' as Tab, label: 'Discover', icon: <IconCompass size={14} /> },
            ]).map((t) => {
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                    isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="vendor-events-tab"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {t.icon}
                    {t.label}
                    {t.badge && t.badge > 0 ? (
                      <span className="relative w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                        {t.badge}
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Events tab — status filter pills */}
        {tab === 'events' && (
          <div className="px-4 pb-3">
            <div className="flex gap-2">
              {([
                { id: 'all' as Filter, label: 'All Events' },
                { id: 'active' as Filter, label: 'Live' },
                { id: 'upcoming' as Filter, label: 'Upcoming' },
                { id: 'completed' as Filter, label: 'Past' },
              ]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setLoading(true) }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                    filter === f.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Discover tab — search + filter button */}
        {tab === 'discover' && (
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events to exhibit at..."
                  value={discoverSearch}
                  onChange={(e) => setDiscoverSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-800"
                />
                {discoverSearch && (
                  <button
                    onClick={() => setDiscoverSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-200 dark:bg-slate-600"
                  >
                    <IconX size={12} className="text-slate-500 dark:text-slate-300" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDiscoverFilters(!showDiscoverFilters)}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                  showDiscoverFilters || discoverCategory
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500',
                )}
              >
                <IconAdjustmentsHorizontal size={18} />
                {discoverCategory && !showDiscoverFilters && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">1</span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Discover — expandable category filter grid */}
      <AnimatePresence>
        {tab === 'discover' && showDiscoverFilters && (
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
                {discoverCategory && (
                  <button onClick={() => setDiscoverCategory(null)} className="text-xs font-medium text-brand-600 active:text-brand-700">Clear</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_CATEGORIES.map((cat) => {
                  const isActive = discoverCategory === cat.value
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setDiscoverCategory(isActive ? null : cat.value)}
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

      {/* Active discover filter chip */}
      {tab === 'discover' && discoverCategory && !showDiscoverFilters && (
        <div className="px-5 pt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-xs font-semibold text-brand-700 dark:text-brand-300">
            {CATEGORY_ICONS[discoverCategory]}
            {EVENT_CATEGORIES.find(c => c.value === discoverCategory)?.label}
            <button onClick={() => setDiscoverCategory(null)} className="ml-0.5">
              <IconX size={12} />
            </button>
          </span>
        </div>
      )}

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'events' ? (
          events.length === 0 ? (
            <div className="text-center py-16">
              <IconCalendar size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No events found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Events assigned by organisers will appear here
              </p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} router={router} />
            ))
          )
        ) : tab === 'invites' ? (
          invites.length === 0 ? (
            <div className="text-center py-16">
              <IconMail size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No pending invites</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Event invitations from organisers will appear here
              </p>
            </div>
          ) : (
            <>{invites.map((invite) => (
            <div key={invite.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{invite.event_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    by {invite.organiser_name}
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Invited
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <IconCalendar size={13} />
                  {new Date(invite.event_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  {' – '}
                  {new Date(invite.event_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <IconMapPin size={13} />
                  {invite.event_city}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeclineInvite(invite.id)}
                  disabled={respondingId === invite.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 active:bg-slate-50 dark:active:bg-slate-700 disabled:opacity-50"
                >
                  <IconCircleX size={16} /> Decline
                </button>
                <button
                  onClick={() => handleAcceptInvite(invite.id)}
                  disabled={respondingId === invite.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-50"
                >
                  <IconCircleCheck size={16} /> Accept
                </button>
              </div>
            </div>
          ))}</>
          )
        ) : (
          discoverEvents.length === 0 ? (
            <div className="text-center py-16">
              <IconCompass size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No events found</p>
              <p className="text-sm text-slate-400 mt-1">
                {discoverSearch ? 'Try a different search term' : 'New events in your area will appear here'}
              </p>
            </div>
          ) : (
            <>{discoverEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => router.push(`/main/events/detail?id=${event.id}`)}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                  <IconCalendar size={20} className="text-brand-600" stroke={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{event.name}</h3>
                  {event.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <IconMapPin size={12} /> {event.location}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <IconCalendar size={12} />
                    {new Date(event.event_start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                  {(event as any).distance_km && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-500">
                      {(event as any).distance_km < 1 ? `${Math.round((event as any).distance_km * 1000)}m` : `${(event as any).distance_km.toFixed(1)} km`} away
                    </span>
                  )}
                </div>
                <IconChevronRight size={16} className="text-slate-300 shrink-0 mt-2" />
              </div>
            </button>
          ))}</>
          )
        )}
      </div>
    </div>
  )
}

function EventCard({
  event,
  router,
}: {
  event: VendorEvent
  router: ReturnType<typeof useRouter>
}) {
  const [copied, setCopied] = useState(false)

  const statusBadge = {
    active: { label: 'Live', color: 'bg-emerald-100 text-emerald-700' },
    draft: { label: 'Upcoming', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  }[event.event_status] ?? { label: event.event_status, color: 'bg-slate-100 dark:bg-slate-700 text-slate-600' }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  const handleCopyToken = async () => {
    if (!event.tablet_token) return
    await navigator.clipboard.writeText(event.tablet_token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
      {/* Event info */}
      <button
        onClick={() => router.push(`/vendor/events/detail?id=${event.event_id}`)}
        className="w-full text-left px-4 py-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {event.event_name}
            </h3>
            {event.booth_name && (
              <p className="text-xs text-brand-600 font-medium mt-0.5">
                Booth: {event.booth_name}
              </p>
            )}
          </div>
          <IconChevronRight size={18} className="text-slate-400 shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <IconCalendar size={13} />
            {formatDate(event.event_start)} – {formatDate(event.event_end)}
          </span>
          <span className="flex items-center gap-1">
            <IconMapPin size={13} />
            {event.event_city}
          </span>
          {event.distance_km != null && (
            <span className="flex items-center gap-1 text-brand-600 font-medium">
              {event.distance_km < 1 ? `${Math.round(event.distance_km * 1000)}m` : `${event.distance_km.toFixed(1)} km`}
            </span>
          )}
        </div>

        {/* Stats */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <IconUsers size={14} className="text-brand-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.leads_count}</span>
                <span className="text-xs text-slate-500">leads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconScan size={14} className="text-emerald-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.scans_count}</span>
                <span className="text-xs text-slate-500">scans</span>
              </div>
            </div>
            {(event.scans_count > 0 || event.leads_count > 0) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/vendor/events/analytics?eventId=${event.event_id}&eventName=${encodeURIComponent(event.event_name)}`)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-semibold active:bg-brand-100 transition-colors"
              >
                <IconChartBar size={13} />
                Analytics
              </button>
            )}
          </div>
      </button>

      {/* Tablet token section */}
      {event.event_status === 'active' && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconDeviceTablet size={14} className="text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Tablet Token</span>
            </div>
            {event.tablet_token ? (
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                  {event.tablet_token.slice(0, 12)}...
                </code>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyToken() }}
                  className="p-1 rounded-lg active:bg-slate-200 transition-colors"
                >
                  {copied ? (
                    <IconCheck size={14} className="text-emerald-500" />
                  ) : (
                    <IconCopy size={14} className="text-slate-400" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Not generated</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
