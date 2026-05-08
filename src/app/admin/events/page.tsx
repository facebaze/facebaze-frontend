'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  CalendarDays,
  MapPin,
  Users,
  ScanLine,
  ChevronRight,
} from 'lucide-react'
import { adminService, type AdminEvent } from '@/services/admin.service'

type StatusFilter = 'all' | 'active' | 'draft' | 'completed' | 'cancelled'

export default function AdminEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getEvents({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      })
      setEvents(res.data)
      setTotal(res.total)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, search ? 400 : 0)
    return () => clearTimeout(timeout)
  }, [fetchEvents])

  const totalPages = Math.ceil(total / 20)

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-amber-100 text-amber-700',
    completed: 'bg-slate-100 dark:bg-slate-700 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Draft' },
    { id: 'completed', label: 'Completed' },
  ]

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} events on the platform</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => { setStatusFilter(f.id); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 active:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No events found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/admin/events/detail?id=${event.id}`)}
              className="px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{event.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      {formatDate(event.event_start_date)} – {formatDate(event.event_end_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {event.city}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0 mt-1" />
              </div>
              <div className="flex gap-5 mt-2">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-brand-500" />
                  <span className="text-xs font-semibold text-slate-700">{event.total_vendors}</span>
                  <span className="text-[10px] text-slate-400">vendors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ScanLine size={12} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">{event.total_scans}</span>
                  <span className="text-[10px] text-slate-400">scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">{event.total_leads}</span>
                  <span className="text-[10px] text-slate-400">leads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
