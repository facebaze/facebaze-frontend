'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  CalendarDays,
  MapPin,
  Users,
  ScanLine,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { organiserService, type OrgEvent } from '@/services/organiser.service'

type FilterStatus = 'all' | 'draft' | 'active' | 'completed' | 'cancelled'

export default function OrganiserEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<OrgEvent[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await organiserService.listEvents(
        filter === 'all' ? undefined : filter,
      )
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents = search
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.city.toLowerCase().includes(search.toLowerCase()),
      )
    : events

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Draft' },
    { id: 'completed', label: 'Completed' },
  ]

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-amber-100 text-amber-700',
    completed: 'bg-slate-100 dark:bg-slate-700 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => router.push('/organiser/events/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Create Event</span>
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 active:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-600">No events found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? 'Try a different search' : 'Create your first event'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => router.push(`/organiser/events/detail?id=${event.id}`)}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{event.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0 mt-1" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {formatDate(event.event_start_date)} – {formatDate(event.event_end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {event.city}
                </span>
              </div>

              <div className="flex gap-5">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-brand-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.total_vendors}</span>
                  <span className="text-xs text-slate-400">vendors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ScanLine size={13} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.total_scans}</span>
                  <span className="text-xs text-slate-400">scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.total_leads}</span>
                  <span className="text-xs text-slate-400">leads</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
