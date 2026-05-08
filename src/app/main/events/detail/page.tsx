'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  IconArrowLeft,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconShield,
  IconCircleCheck,
  IconHandStop,
  IconBuilding,
  IconClock,
  IconCategory,
  IconShare,
  IconExternalLink,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'
import { eventService, type EventDetail } from '@/services/event.service'
import { Button, Checkbox } from '@/components/ui'

function EventDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('id')

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [showFullConsent, setShowFullConsent] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (!eventId) return
    eventService
      .getEvent(eventId)
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [eventId])

  const handleOptIn = async () => {
    if (!event || !consentChecked) return
    setToggling(true)
    try {
      await eventService.optIn(event.id)
      setEvent((prev) => (prev ? { ...prev, opted_in: true } : prev))
    } catch {
      // error handling
    } finally {
      setToggling(false)
    }
  }

  const handleOptOut = async () => {
    if (!event) return
    setToggling(true)
    try {
      await eventService.optOut(event.id)
      setEvent((prev) => (prev ? { ...prev, opted_in: false } : prev))
    } catch {
      // error handling
    } finally {
      setToggling(false)
    }
  }

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center">No event specified.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center">Event not found.</p>
      </div>
    )
  }

  const startDate = new Date(event.event_start_date)
  const endDate = new Date(event.event_end_date)
  const dateStr = formatDateRange(event.event_start_date, event.event_end_date)
  const timeStr = formatTimeRange(startDate, endDate)
  const isLive = event.status === 'active'
  const isPast = event.status === 'past'
  const descLong = (event.description?.length ?? 0) > 200

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      {/* ─── Hero Cover ─── */}
      <div className="relative">
        <div className="h-52 sm:h-64 md:h-72 w-full overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-500 via-brand-600 to-violet-700 flex items-center justify-center">
              <IconCalendar size={56} className="text-white/20" stroke={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>

        {/* Nav overlaid */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe-top">
          <button
            onClick={() => router.back()}
            className="mt-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <IconArrowLeft size={18} className="text-white" stroke={2} />
          </button>
          <button
            className="mt-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: event.name, url: window.location.href })
              }
            }}
          >
            <IconShare size={16} className="text-white" stroke={2} />
          </button>
        </div>

        {/* Status badges */}
        <div className="absolute top-safe-top right-14 mt-4 flex gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              LIVE NOW
            </span>
          )}
          {event.opted_in && (
            <span className="flex items-center gap-1 bg-white/90 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
              <IconCircleCheck size={11} /> Joined
            </span>
          )}
        </div>

        {/* Title + meta on cover bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-3">
            {/* Event logo */}
            {event.logo_url && (
              <img
                src={event.logo_url}
                alt=""
                className="w-12 h-12 rounded-xl object-cover bg-white/10 border-2 border-white/20 shadow-lg shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              {event.category && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-white/20 backdrop-blur-sm text-white/90 mb-1.5">
                  {event.category.replace(/_/g, ' ')}
                </span>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight line-clamp-2">
                {event.name}
              </h1>
              {event.organiser_name && (
                <p className="text-[11px] text-white/70 mt-0.5 flex items-center gap-1">
                  <IconBuilding size={10} />
                  by {event.organiser_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="px-4 mt-4 space-y-4">

        {/* Quick stat pills */}
        <div className="flex flex-wrap gap-2">
          {event.vendor_count > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[11px] font-semibold">
              <IconBuilding size={11} />
              {event.vendor_count} vendor{event.vendor_count > 1 ? 's' : ''}
            </span>
          )}
          {event.attendee_count > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              <IconUsers size={11} />
              {event.attendee_count} joined
            </span>
          )}
          {event.expected_attendees != null && event.expected_attendees > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
              <IconUsers size={11} />
              {event.expected_attendees.toLocaleString()} expected
            </span>
          )}
          {event.distance_km != null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[11px] font-semibold">
              <IconMapPin size={11} />
              {event.distance_km < 1 ? `${Math.round(event.distance_km * 1000)}m` : `${event.distance_km.toFixed(1)}km`} away
            </span>
          )}
        </div>

        {/* ─── Date & Time + Location cards ─── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {/* Date row */}
          <div className="flex items-center gap-3.5 p-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
              <IconCalendar size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{dateStr}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{timeStr}</p>
            </div>
          </div>

          {/* Location row */}
          {(event.location || event.city) && (
            <div className="flex items-center gap-3.5 p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <IconMapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {event.location || event.city}
                </p>
                {event.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{event.address}</p>
                )}
                {event.city && event.location && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.city}</p>
                )}
              </div>
              {event.latitude && event.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconExternalLink size={14} className="text-slate-500 dark:text-slate-400" />
                </a>
              )}
            </div>
          )}

          {/* Category row */}
          {event.category && (
            <div className="flex items-center gap-3.5 p-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <IconCategory size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{event.category.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Event type</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── About ─── */}
        {event.description && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              About this event
            </h3>
            <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line ${!descExpanded && descLong ? 'line-clamp-4' : ''}`}>
              {event.description}
            </p>
            {descLong && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="flex items-center gap-1 mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400"
              >
                {descExpanded ? (
                  <>Show less <IconChevronUp size={12} /></>
                ) : (
                  <>Read more <IconChevronDown size={12} /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* ─── Already opted in ─── */}
        {event.opted_in && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <IconCircleCheck size={18} className="text-emerald-600 dark:text-emerald-400" stroke={1.5} />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">You're opted in</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Vendors at this event can scan you. You'll be notified each time and can approve or decline.
            </p>
            <button
              onClick={handleOptOut}
              disabled={toggling}
              className="mt-3 text-xs font-semibold text-red-500 dark:text-red-400 active:opacity-70 disabled:opacity-50"
            >
              {toggling ? 'Removing...' : 'Opt Out of Event'}
            </button>
          </motion.div>
        )}

        {/* ─── Not opted in — consent flow ─── */}
        {!event.opted_in && !isPast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <IconShield size={16} className="text-brand-600 dark:text-brand-400" stroke={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  What happens when you opt in
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  Vendors at this event can scan your face to exchange contact details
                </li>
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  They'll see your public profile (name, photo, company)
                </li>
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  You'll be notified each time a vendor scans you
                </li>
                <li className="flex gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  You can opt out anytime — your data will be removed
                </li>
              </ul>
              {event.consent_text && (
                <button
                  onClick={() => setShowFullConsent((p) => !p)}
                  className="text-[11px] font-medium text-brand-600 dark:text-brand-400 mt-3"
                >
                  {showFullConsent ? 'Hide consent details ▴' : 'View full consent text ▾'}
                </button>
              )}
              {showFullConsent && event.consent_text && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap leading-relaxed">
                  {event.consent_text}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <Checkbox
                checked={consentChecked}
                onChange={setConsentChecked}
                label="I understand and consent to vendor scanning at this event"
              />
            </div>

            <Button
              onClick={handleOptIn}
              disabled={!consentChecked || toggling}
              loading={toggling}
              icon={<IconHandStop size={18} stroke={1.5} />}
              className="w-full"
            >
              Opt In to Event
            </Button>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              You can opt out at any time from this page or your settings.
            </p>
          </motion.div>
        )}

        {/* Past event notice */}
        {isPast && !event.opted_in && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 text-center">
            <IconClock size={20} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This event has ended</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">You can no longer opt in.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  )
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString('en-US', opts)
  }
  return `${s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', opts)}`
}

function formatTimeRange(start: Date, end: Date): string {
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
  const startTime = start.toLocaleTimeString('en-US', timeOpts)
  const endTime = end.toLocaleTimeString('en-US', timeOpts)
  if (start.toDateString() === end.toDateString()) {
    return `${startTime} – ${endTime}`
  }
  return `Starts ${startTime}`
}
