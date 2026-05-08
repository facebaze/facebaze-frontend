'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconScan,
  IconDeviceTablet,
  IconCopy,
  IconCheck,
  IconRefresh,
  IconDownload,
  IconExternalLink,
} from '@tabler/icons-react'
import { vendorService, type VendorEvent, type TabletToken } from '@/services/vendor.service'

function EventDetailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const eventId = params.get('id') ?? ''

  const [event, setEvent] = useState<VendorEvent | null>(null)
  const [token, setToken] = useState<TabletToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    if (!eventId) return
    try {
      const data = await vendorService.getEventDetail(eventId)
      setEvent(data)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerateToken = async () => {
    if (!eventId) return
    setTokenLoading(true)
    try {
      const t = await vendorService.generateTabletToken(eventId)
      setToken(t)
    } catch { /* ignore */ } finally {
      setTokenLoading(false)
    }
  }

  const handleRotateToken = async () => {
    if (!eventId) return
    setTokenLoading(true)
    try {
      const t = await vendorService.rotateTabletToken(eventId)
      setToken(t)
    } catch { /* ignore */ } finally {
      setTokenLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCSV = async () => {
    if (!eventId) return
    try {
      const blob = await vendorService.exportLeadsCSV(eventId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${eventId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Event not found</p>
      </div>
    )
  }

  const statusBadge = {
    active: { label: 'Live', color: 'bg-emerald-100 text-emerald-700' },
    draft: { label: 'Upcoming', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  }[event.event_status] ?? { label: event.event_status, color: 'bg-slate-100 dark:bg-slate-700 text-slate-600' }

  const activeToken = token?.token ?? event.tablet_token

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 pt-safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center active:bg-slate-200"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {event.event_name}
            </h1>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4">
        {/* Event Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Event Details</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <IconCalendar size={15} className="text-slate-400" />
              {formatDate(event.event_start)} – {formatDate(event.event_end)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <IconMapPin size={15} className="text-slate-400" />
              {event.event_venue}, {event.event_city}
            </div>
            {event.booth_name && (
              <div className="flex items-center gap-2 text-sm text-brand-600 font-medium">
                <IconExternalLink size={15} className="text-brand-400" />
                Booth: {event.booth_name}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-2">
              <IconUsers size={18} className="text-brand-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{event.leads_count}</p>
            <p className="text-xs text-slate-500">Leads Captured</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <IconScan size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{event.scans_count}</p>
            <p className="text-xs text-slate-500">Total Scans</p>
          </div>
        </div>

        {/* Tablet Token */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <IconDeviceTablet size={15} />
              Tablet Authentication
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {activeToken ? (
              <>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500 mb-1 font-medium">TOKEN</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-slate-700 break-all">
                      {activeToken.slice(0, 32)}...
                    </code>
                    <button
                      onClick={() => handleCopy(activeToken)}
                      className="shrink-0 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:bg-slate-700"
                    >
                      {copied ? (
                        <IconCheck size={14} className="text-emerald-500" />
                      ) : (
                        <IconCopy size={14} className="text-slate-500 dark:text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleRotateToken}
                  disabled={tokenLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 active:bg-slate-50 dark:active:bg-slate-700 disabled:opacity-50"
                >
                  <IconRefresh size={14} className={tokenLoading ? 'animate-spin' : ''} />
                  Rotate Token
                </button>
              </>
            ) : (
              <button
                onClick={handleGenerateToken}
                disabled={tokenLoading}
                className="w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-50"
              >
                {tokenLoading ? 'Generating...' : 'Generate Tablet Token'}
              </button>
            )}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use this token to authenticate your tablet device for this event. 
              Rotating invalidates the previous token.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/vendor/leads?eventId=${event.event_id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700"
          >
            <IconUsers size={16} />
            View Leads for This Event
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
          >
            <IconDownload size={16} />
            Export Leads CSV
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VendorEventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  )
}
