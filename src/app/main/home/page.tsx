'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconScan,
  IconChevronRight,
  IconBell,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconCircleCheck,
  IconBuilding,
  IconSparkles,
  IconMicrophone,
  IconCode,
  IconUsersGroup,
  IconBriefcase,
  IconPalette,
  IconRocket,
  IconFlame,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLocationStore } from '@/stores/location.store'
import { scanService, type QuickStats } from '@/services/scan.service'
import { eventService, type EventItem } from '@/services/event.service'
import { notificationService } from '@/services/notification.service'
import { profileService } from '@/services/profile.service'
import { formatDistance } from '@/services/location.service'
import { Avatar, Skeleton } from '@/components/ui'
import LocationPicker from '@/components/ui/LocationPicker'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

const CATEGORIES = [
  { id: 'conference', label: 'Conference', icon: IconMicrophone, color: 'from-violet-500 to-purple-600' },
  { id: 'meetup', label: 'Meetup', icon: IconUsersGroup, color: 'from-blue-500 to-cyan-500' },
  { id: 'hackathon', label: 'Hackathon', icon: IconCode, color: 'from-emerald-500 to-green-600' },
  { id: 'networking', label: 'Networking', icon: IconBriefcase, color: 'from-amber-500 to-orange-500' },
  { id: 'workshop', label: 'Workshop', icon: IconPalette, color: 'from-pink-500 to-rose-600' },
  { id: 'exhibition', label: 'Exhibition', icon: IconRocket, color: 'from-red-500 to-brand-600' },
]

export default function HomePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const location = useLocationStore((s) => s.location)

  const [stats, setStats] = useState<QuickStats>({ scans_today: 0, saved_contacts: 0, events_opted_in: 0 })
  const [events, setEvents] = useState<EventItem[]>([])
  const [activeEvents, setActiveEvents] = useState<EventItem[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const lat = location?.lat
      const lng = location?.lng
      const [s, upcoming, active, p, n] = await Promise.all([
        scanService.getQuickStats().catch(() => ({ scans_today: 0, saved_contacts: 0, events_opted_in: 0 })),
        eventService.listEvents('upcoming', lat, lng).catch(() => []),
        eventService.listEvents('active' as any, lat, lng).catch(() => []),
        profileService.getMyProfile().catch(() => null),
        notificationService.getUnreadCount().catch(() => 0),
      ])
      setStats(s)
      setEvents(upcoming.slice(0, 6))
      setActiveEvents(active)
      setProfile(p)
      setUnreadCount(n)
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => { loadData() }, [loadData])

  const allEvents = [...activeEvents, ...events]
  const featuredEvent = allEvents[0]
  const restEvents = allEvents.slice(1)
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const totalConnections = stats.saved_contacts + stats.scans_today

  return (
    <div className="flex-1">
      {/* ─── Header ─── */}
      <div className="px-4 pt-safe-top">
        <div className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.push('/main/profile')} className="active:scale-95 transition-transform">
              <Avatar src={profile?.profile_photo_url} name={profile?.full_name || firstName} size="sm" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight font-medium">
                {getGreeting()},
              </p>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">{firstName} 👋</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LocationPicker compact />
            <button
              onClick={() => router.push('/main/notifications')}
              className="relative w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center active:scale-95 transition-transform"
            >
              <IconBell size={15} className="text-slate-600 dark:text-slate-300" stroke={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-3 px-0.5 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Live Activity Bar ─── */}
      {activeEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-2 mb-1"
        >
          <button
            onClick={() => router.push(`/main/events/detail?id=${activeEvents[0].id}`)}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 active:scale-[0.99] transition-transform"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 truncate flex-1 text-left">
              {activeEvents.length} event{activeEvents.length > 1 ? 's' : ''} happening now near you
            </span>
            <IconChevronRight size={13} className="text-emerald-400 shrink-0" />
          </button>
        </motion.div>
      )}

      {/* ─── Quick Actions Row ─── */}
      <div className="px-4 mt-3 flex gap-2">
        <button
          onClick={() => router.push('/main/scan')}
          className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 active:scale-[0.97] transition-transform shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <IconScan size={16} className="text-white" stroke={2} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-white">Scan</p>
            <p className="text-[9px] text-white/60 truncate">Quick connect</p>
          </div>
        </button>
        <button
          onClick={() => router.push('/main/connections')}
          className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 active:scale-[0.97] transition-transform"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <IconUsers size={16} className="text-slate-600 dark:text-slate-300" stroke={1.5} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white">{totalConnections}</p>
            <p className="text-[9px] text-slate-400 truncate">Connections</p>
          </div>
        </button>
        <button
          onClick={() => router.push('/main/events')}
          className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 active:scale-[0.97] transition-transform"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <IconCalendar size={16} className="text-slate-600 dark:text-slate-300" stroke={1.5} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-white">{stats.events_opted_in}</p>
            <p className="text-[9px] text-slate-400 truncate">Events</p>
          </div>
        </button>
      </div>

      {/* ─── Explore Categories ─── */}
      <div className="mt-5 px-4">
        <div className="flex items-center gap-2 mb-3">
          <IconSparkles size={14} className="text-amber-500" stroke={2} />
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Explore</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/main/events?category=${cat.id}`)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 active:scale-95 transition-transform"
            >
              <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', cat.color)}>
                <cat.icon size={16} className="text-white" stroke={1.5} />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Featured Event (Hero) ─── */}
      {!loading && featuredEvent && (
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IconFlame size={14} className="text-orange-500" stroke={2} />
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Featured</h2>
            </div>
            <button
              onClick={() => router.push('/main/events')}
              className="text-[10px] font-semibold text-brand-600 dark:text-brand-400"
            >
              See all →
            </button>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push(`/main/events/detail?id=${featuredEvent.id}`)}
            className="w-full rounded-2xl overflow-hidden active:scale-[0.98] transition-transform shadow-md"
          >
            <div className="relative h-44">
              {featuredEvent.cover_image_url ? (
                <img src={featuredEvent.cover_image_url} alt={featuredEvent.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className={cn(
                  'w-full h-full flex items-center justify-center',
                  featuredEvent.status === 'active'
                    ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600'
                    : 'bg-gradient-to-br from-brand-500 via-rose-500 to-orange-500',
                )}>
                  <IconCalendar size={40} className="text-white/20" stroke={1} />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Badges */}
              {featuredEvent.status === 'active' && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" /><span className="relative rounded-full h-1.5 w-1.5 bg-white" /></span>
                  LIVE
                </div>
              )}
              {featuredEvent.opted_in && (
                <div className="absolute top-3 right-3 bg-white/90 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <IconCircleCheck size={10} /> Joined
                </div>
              )}
              {/* Bottom content on image */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <h3 className="text-sm font-bold text-white leading-tight mb-1">{featuredEvent.name}</h3>
                <div className="flex items-center gap-3 text-[10px] text-white/80">
                  <span className="flex items-center gap-1">
                    <IconCalendar size={10} />
                    {formatDateCompact(featuredEvent.event_start_date, featuredEvent.event_end_date)}
                  </span>
                  {(featuredEvent.city || featuredEvent.location) && (
                    <span className="flex items-center gap-1">
                      <IconMapPin size={10} />
                      {featuredEvent.city || featuredEvent.location}
                    </span>
                  )}
                  {featuredEvent.distance_km != null && (
                    <span className="ml-auto bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-medium">
                      {formatDistance(featuredEvent.distance_km)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* ─── More Events (Compact Cards) ─── */}
      {!loading && restEvents.length > 0 && (
        <div className="mt-5 px-4 pb-8">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Upcoming Near You
          </h2>
          <div className="space-y-2.5">
            {restEvents.map((event, i) => (
              <CompactEventCard key={event.id} event={event} index={i} onClick={() => router.push(`/main/events/detail?id=${event.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Loading State ─── */}
      {loading && (
        <div className="px-4 mt-5 space-y-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-slate-800">
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && allEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-3">
            <IconCalendar size={24} className="text-slate-300 dark:text-slate-500" stroke={1.5} />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">No events nearby</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto">
            Check back soon — events in your area will appear here
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Compact Event Card ─────────────────────────────────────────────────────────

function CompactEventCard({
  event,
  onClick,
  index = 0,
}: {
  event: EventItem
  onClick: () => void
  index?: number
}) {
  const dateStr = formatDateCompact(event.event_start_date, event.event_end_date)
  const isLive = event.status === 'active'

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full flex gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 active:scale-[0.98] transition-transform text-left"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            isLive ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : event.opted_in ? 'bg-gradient-to-br from-blue-400 to-indigo-600'
              : 'bg-gradient-to-br from-brand-400 to-brand-600',
          )}>
            <IconCalendar size={18} className="text-white/40" stroke={1.5} />
          </div>
        )}
        {isLive && (
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">{event.name}</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
          <IconCalendar size={9} className="shrink-0" />
          {dateStr}
          {event.city && (
            <>
              <span className="mx-0.5">·</span>
              <IconMapPin size={9} className="shrink-0" />
              {event.city}
            </>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {event.category && (
            <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded capitalize">
              {event.category}
            </span>
          )}
          {event.opted_in && (
            <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <IconCircleCheck size={9} /> Joined
            </span>
          )}
          {event.distance_km != null && (
            <span className="text-[9px] text-slate-400 ml-auto">
              {formatDistance(event.distance_km)}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDateCompact(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}`
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

