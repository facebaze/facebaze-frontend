'use client'

import { motion } from 'framer-motion'
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconBuilding,
  IconCircleCheck,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { formatDistance } from '@/services/location.service'
import type { EventItem } from '@/services/event.service'

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}`
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

const CATEGORY_COLORS: Record<string, string> = {
  conference: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  meetup: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  exhibition: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  networking: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  workshop: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  hackathon: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

// ─── Large card (for featured/hero) ─────────────────────────────────────────

export function EventCardLarge({
  event,
  onClick,
  index = 0,
}: {
  event: EventItem
  onClick: () => void
  index?: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="w-[280px] shrink-0 text-left rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-card active:scale-[0.97] transition-transform snap-start"
    >
      {/* Cover image or gradient */}
      <div className="relative h-32 w-full bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden">
        {event.cover_image_url && (
          <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        {/* Date badge overlay */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-center">
          <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">
            {new Date(event.event_start_date).toLocaleDateString('en-US', { month: 'short' })}
          </p>
          <p className="text-body font-bold text-slate-900 dark:text-white -mt-0.5">
            {new Date(event.event_start_date).getDate()}
          </p>
        </div>
        {/* Distance badge */}
        {event.distance_km != null && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
            {formatDistance(event.distance_km)}
          </div>
        )}
        {/* Opted in indicator */}
        {event.opted_in && (
          <div className="absolute bottom-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <IconCircleCheck size={11} />
            Joined
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="text-caption font-bold text-slate-900 dark:text-white truncate">
          {event.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <IconMapPin size={12} className="text-slate-400 shrink-0" />
          <span className="text-tiny text-slate-500 dark:text-slate-400 truncate">
            {event.city || event.location || 'TBA'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            {event.category && (
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other,
              )}>
                {event.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <IconUsers size={12} className="text-slate-400" />
            <span className="text-tiny text-slate-500">
              {event.vendor_count}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Compact card (for horizontal scroll rows) ─────────────────────────────

export function EventCardCompact({
  event,
  onClick,
  index = 0,
}: {
  event: EventItem
  onClick: () => void
  index?: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      className="w-[160px] shrink-0 text-left rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-card active:scale-[0.97] transition-transform snap-start"
    >
      <div className="relative h-20 w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600">
        {event.cover_image_url && (
          <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        {event.status === 'active' && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            Live
          </div>
        )}
        {event.distance_km != null && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
            {formatDistance(event.distance_km)}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h4 className="text-tiny font-bold text-slate-900 dark:text-white truncate">
          {event.name}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {formatDateRange(event.event_start_date, event.event_end_date)}
        </p>
      </div>
    </motion.button>
  )
}

// ─── List card (for vertical event lists) ───────────────────────────────────

export function EventCardList({
  event,
  onClick,
  index = 0,
  showOptIn = false,
}: {
  event: EventItem
  onClick: () => void
  index?: number
  showOptIn?: boolean
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="flex">
        {/* Side image/color strip */}
        <div className={cn(
          'w-24 shrink-0 relative bg-gradient-to-br',
          event.opted_in ? 'from-emerald-400 to-teal-500' :
          event.status === 'active' ? 'from-blue-400 to-indigo-500' :
          'from-brand-400 to-brand-600',
        )}>
          {event.cover_image_url && (
            <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
          )}
          {!event.cover_image_url && (
            <div className="w-full h-full flex items-center justify-center">
              <IconCalendar size={24} className="text-white/70" />
            </div>
          )}
          {event.distance_km != null && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
              {formatDistance(event.distance_km)}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 p-3.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-caption font-bold text-slate-900 dark:text-white truncate">
              {event.name}
            </h3>
            {event.opted_in && (
              <IconCircleCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            )}
          </div>
          <div className="space-y-1 mt-1.5">
            <p className="text-tiny text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <IconCalendar size={12} className="text-slate-400 shrink-0" />
              {formatDateRange(event.event_start_date, event.event_end_date)}
            </p>
            {(event.city || event.location) && (
              <p className="text-tiny text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <IconMapPin size={12} className="text-slate-400 shrink-0" />
                {event.city || event.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            {event.category && (
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other,
              )}>
                {event.category}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <IconBuilding size={11} className="text-slate-400" />
              <span className="text-tiny text-slate-400">{event.vendor_count}</span>
            </div>
            {event.expected_attendees && (
              <div className="flex items-center gap-1">
                <IconUsers size={11} className="text-slate-400" />
                <span className="text-tiny text-slate-400">{event.expected_attendees}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}
