'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconUsers,
  IconAdjustmentsHorizontal,
  IconDownload,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconMapPin,
  IconX,
  IconCalendar,
  IconCircleCheck,
  IconMessageCircle,
  IconStar,
  IconArchive,
} from '@tabler/icons-react'
import { vendorService, type VendorLead, type VendorEvent } from '@/services/vendor.service'
import { cn } from '@/lib/utils'

function LeadsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const presetEventId = params.get('eventId') ?? ''

  const [leads, setLeads] = useState<VendorLead[]>([])
  const [events, setEvents] = useState<VendorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState(presetEventId)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await vendorService.getLeads({
        eventId: eventFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      })
      setLeads(data)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [eventFilter, statusFilter, search])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    vendorService.getAssignedEvents().then(setEvents).catch(() => {})
  }, [])

  const handleExportCSV = async () => {
    try {
      const blob = await vendorService.exportLeadsCSV(eventFilter || 'all')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-export.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  const followUpColors: Record<string, string> = {
    none: 'bg-slate-100 dark:bg-slate-700 text-slate-600',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-violet-100 text-violet-700',
  }

  const activeFilterCount = (eventFilter ? 1 : 0) + (statusFilter ? 1 : 0)

  const STATUS_OPTIONS = [
    { id: '', label: 'All', icon: <IconUsers size={16} /> },
    { id: 'none', label: 'New', icon: <IconStar size={16} /> },
    { id: 'contacted', label: 'Contacted', icon: <IconMessageCircle size={16} /> },
    { id: 'qualified', label: 'Qualified', icon: <IconCircleCheck size={16} /> },
    { id: 'closed', label: 'Closed', icon: <IconArchive size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
            >
              <IconDownload size={16} />
            </button>
          </div>
        </div>

        {/* Search + Filter Row */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads by name, company..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-800"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
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
      </header>

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
            <div className="px-4 py-4 space-y-4">
              {/* Event filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event</p>
                  {eventFilter && (
                    <button onClick={() => setEventFilter('')} className="text-xs font-medium text-brand-600 active:text-brand-700">Clear</button>
                  )}
                </div>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev.event_id} value={ev.event_id}>
                      {ev.event_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter — grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Follow-up Status</p>
                  {statusFilter && (
                    <button onClick={() => setStatusFilter('')} className="text-xs font-medium text-brand-600 active:text-brand-700">Clear</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const isActive = statusFilter === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStatusFilter(isActive && s.id !== '' ? '' : s.id)}
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
                          {s.icon}
                        </span>
                        <span className="text-[11px] font-semibold leading-tight">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {(eventFilter || statusFilter) && !showFilters && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {eventFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <IconCalendar size={12} />
              {events.find(e => e.event_id === eventFilter)?.event_name || 'Event'}
              <button onClick={() => setEventFilter('')} className="ml-0.5"><IconX size={12} /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {STATUS_OPTIONS.find(s => s.id === statusFilter)?.icon}
              {STATUS_OPTIONS.find(s => s.id === statusFilter)?.label}
              <button onClick={() => setStatusFilter('')} className="ml-0.5"><IconX size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Leads count */}
      <div className="px-4 py-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
          {eventFilter && ' for this event'}
        </p>
      </div>

      {/* Leads list */}
      <div className="px-4 space-y-2 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <IconUsers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No leads found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {search ? 'Try a different search term' : 'Start scanning to capture leads'}
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => router.push(`/vendor/leads/detail?id=${lead.id}`)}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                  {lead.attendee_photo_url ? (
                    <img
                      src={lead.attendee_photo_url}
                      alt={lead.attendee_name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-white text-lg font-bold">
                      {lead.attendee_name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {lead.attendee_name}
                    </h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${followUpColors[lead.follow_up_status]}`}>
                      {lead.follow_up_status === 'none' ? 'New' : lead.follow_up_status}
                    </span>
                  </div>
                  {lead.attendee_designation && (
                    <p className="text-xs text-slate-500 truncate">
                      {lead.attendee_designation}
                      {lead.attendee_company ? ` · ${lead.attendee_company}` : ''}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-slate-400">{lead.event_name}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatTimeAgo(lead.captured_at)}
                    </span>
                  </div>
                </div>

                <IconChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>

              {/* Tags */}
              {lead.attendee_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-15">
                  {lead.attendee_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[10px] font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {lead.attendee_tags.length > 3 && (
                    <span className="text-[10px] text-slate-400">
                      +{lead.attendee_tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default function VendorLeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
