'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  ScanLine,
  Activity,
  Trash2,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  AlertTriangle,
} from 'lucide-react'
import {
  adminService,
  type AdminEventDetail,
  type EventVendorAssignment,
} from '@/services/admin.service'

type EventStatus = 'active' | 'draft' | 'completed' | 'cancelled'

function EventDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('id')

  const [event, setEvent] = useState<AdminEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    action: () => Promise<void>
    variant: 'danger' | 'warning' | 'success'
  } | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!eventId) return
    try {
      const data = await adminService.getEventDetail(eventId)
      setEvent(data)
    } catch {
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    completed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  }

  const vendorStatusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    accepted: 'bg-blue-100 text-blue-700',
    invited: 'bg-amber-100 text-amber-700',
    requested: 'bg-purple-100 text-purple-700',
    approved: 'bg-teal-100 text-teal-700',
    rejected: 'bg-red-100 text-red-600',
    declined: 'bg-slate-100 text-slate-600',
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const handleStatusChange = (newStatus: EventStatus) => {
    const labels: Record<EventStatus, string> = {
      active: 'Activate',
      draft: 'Deactivate (Draft)',
      completed: 'Mark as Completed',
      cancelled: 'Cancel Event',
    }
    const variants: Record<EventStatus, 'danger' | 'warning' | 'success'> = {
      active: 'success',
      draft: 'warning',
      completed: 'warning',
      cancelled: 'danger',
    }

    setConfirmDialog({
      open: true,
      title: `${labels[newStatus]}?`,
      message: `Are you sure you want to change this event's status to "${newStatus}"? This will affect all vendors assigned to this event.`,
      variant: variants[newStatus],
      action: async () => {
        setActionLoading('status')
        try {
          const updated = await adminService.updateEventStatus(eventId!, newStatus)
          setEvent((prev) => prev ? { ...prev, status: updated.status } : prev)
        } catch {
          setError('Failed to update event status')
        } finally {
          setActionLoading(null)
          setConfirmDialog(null)
        }
      },
    })
  }

  const handleApproveVendor = (vendor: EventVendorAssignment) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Vendor?',
      message: `Approve "${vendor.business_name}" for this event? They will be able to scan attendees.`,
      variant: 'success',
      action: async () => {
        setActionLoading(vendor.vendor_id)
        try {
          await adminService.approveEventVendor(eventId!, vendor.vendor_id)
          await fetchEvent()
        } catch {
          setError('Failed to approve vendor')
        } finally {
          setActionLoading(null)
          setConfirmDialog(null)
        }
      },
    })
  }

  const handleRemoveVendor = (vendor: EventVendorAssignment) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Vendor?',
      message: `Remove "${vendor.business_name}" from this event? Their tablet token will be revoked.`,
      variant: 'danger',
      action: async () => {
        setActionLoading(vendor.vendor_id)
        try {
          await adminService.removeEventVendor(eventId!, vendor.vendor_id)
          await fetchEvent()
        } catch {
          setError('Failed to remove vendor')
        } finally {
          setActionLoading(null)
          setConfirmDialog(null)
        }
      },
    })
  }

  if (!eventId) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-slate-500">No event ID provided</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="p-5 lg:p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center py-16">
          <AlertTriangle size={36} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  const availableStatusTransitions: { status: EventStatus; label: string; icon: React.ReactNode }[] = []
  if (event.status !== 'active') {
    availableStatusTransitions.push({ status: 'active', label: 'Activate', icon: <Power size={14} /> })
  }
  if (event.status === 'active') {
    availableStatusTransitions.push({ status: 'draft', label: 'Deactivate', icon: <PowerOff size={14} /> })
  }
  if (event.status !== 'completed' && event.status !== 'cancelled') {
    availableStatusTransitions.push({ status: 'completed', label: 'Complete', icon: <CheckCircle2 size={14} /> })
  }
  if (event.status !== 'cancelled') {
    availableStatusTransitions.push({ status: 'cancelled', label: 'Cancel', icon: <XCircle size={14} /> })
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/events')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{event.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{event.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Event info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CalendarDays size={12} /> Dates
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatDate(event.event_start_date)}
          </p>
          <p className="text-xs text-slate-400">to {formatDate(event.event_end_date)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <MapPin size={12} /> Location
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.city}</p>
          <p className="text-xs text-slate-400 truncate">{event.location}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Users size={12} /> Vendors
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.vendors.length}</p>
          <p className="text-xs text-slate-400">{event.vendors.filter(v => v.active).length} active</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ScanLine size={12} /> Scans
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.total_scans}</p>
          <p className="text-xs text-slate-400">{event.total_leads} leads</p>
        </div>
      </div>

      {/* Status controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity size={14} /> Event Controls
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableStatusTransitions.map((t) => (
            <button
              key={t.status}
              onClick={() => handleStatusChange(t.status)}
              disabled={actionLoading === 'status'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                t.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : t.status === 'cancelled'
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={14} /> Assigned Vendors ({event.vendors.length})
          </h2>
        </div>

        {event.vendors.length === 0 ? (
          <div className="text-center py-10">
            <Users size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No vendors assigned to this event</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {event.vendors.map((vendor) => (
              <div key={vendor.assignment_id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {vendor.business_name}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${vendorStatusColors[vendor.status] || 'bg-slate-100 text-slate-600'}`}>
                      {vendor.status}
                    </span>
                    {vendor.has_tablet_token && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        tablet
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{vendor.email}</span>
                    {vendor.booth_name && <span>Booth: {vendor.booth_name}</span>}
                    <span>{vendor.scans_count} scans</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {vendor.status !== 'active' && vendor.status !== 'rejected' && (
                    <button
                      onClick={() => handleApproveVendor(vendor)}
                      disabled={actionLoading === vendor.vendor_id}
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-40"
                      title="Approve"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {vendor.status !== 'rejected' && (
                    <button
                      onClick={() => handleRemoveVendor(vendor)}
                      disabled={actionLoading === vendor.vendor_id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.action}
                disabled={!!actionLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmDialog.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminEventDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EventDetailContent />
    </Suspense>
  )
}
