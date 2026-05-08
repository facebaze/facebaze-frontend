'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconScan,
  IconTrendingUp,
  IconChartBar,
  IconUserPlus,
  IconTrash,
  IconPlayerPlay,
  IconCircleX,
  IconMail,
  IconUserCheck,
  IconUserX,
  IconCheck,
  IconSearch,
  IconBuildingStore,
  IconInfoCircle,
  IconLoader2,
  IconX,
  IconShieldCheck,
  IconClock,
  IconCategory,
} from '@tabler/icons-react'
import {
  organiserService,
  type OrgEvent,
  type OrgEventVendor,
  type OrgAttendee,
  type VendorSearchResult,
} from '@/services/organiser.service'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'vendors' | 'attendees'

// ─── Vendor Invite Panel ─────────────────────────────────────────────────────

function VendorInvitePanel({
  eventId,
  onInvited,
  onClose,
}: {
  eventId: string
  onInvited: () => void
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [booth, setBooth] = useState('')
  const [searchResults, setSearchResults] = useState<VendorSearchResult[]>([])
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchDone, setSearchDone] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{
    type: 'existing_vendor' | 'email_sent'
    message: string
    inviteUrl?: string
  } | null>(null)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEmailChange = (val: string) => {
    setEmail(val)
    setSelectedVendor(null)
    setInviteResult(null)
    setError('')
    setSearchDone(false)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        setSearching(true)
        try {
          const results = await organiserService.searchVendors(val)
          setSearchResults(results)
        } catch {
          setSearchResults([])
        } finally {
          setSearching(false)
          setSearchDone(true)
        }
      }, 350)
    } else {
      setSearchResults([])
      setSearchDone(false)
    }
  }

  const handleSelectVendor = (v: VendorSearchResult) => {
    setSelectedVendor(v)
    setEmail(v.email)
    setSearchResults([])
    setError('')
  }

  const handleInvite = async () => {
    if (!email) return
    setInviting(true)
    setError('')
    try {
      const result = await organiserService.inviteVendor(eventId, email, booth || undefined)
      setInviteResult({
        type: result.type,
        message: result.type === 'existing_vendor'
          ? `Invite sent to ${result.business_name}'s inbox`
          : `Registration email sent to ${result.email}`,
        inviteUrl: result.inviteUrl,
      })
      if (result.type === 'existing_vendor') {
        setTimeout(() => {
          onInvited()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send invite'
      setError(msg)
    } finally {
      setInviting(false)
    }
  }

  const isEmailValid = email.includes('@') && email.length >= 5
  const noResults = searchDone && !searching && searchResults.length === 0 && !selectedVendor

  const inputCls =
    'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow'

  // Success state
  if (inviteResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6"
      >
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            inviteResult.type === 'existing_vendor'
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {inviteResult.type === 'existing_vendor'
              ? <IconCheck size={28} className="text-emerald-600 dark:text-emerald-400" />
              : <IconMail size={28} className="text-blue-600 dark:text-blue-400" />
            }
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{inviteResult.message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {inviteResult.type === 'existing_vendor'
              ? 'They\'ll see the invite in their Events → Invites tab.'
              : 'They\'ll receive an email with a registration link pre-linked to this event.'}
          </p>
          {/* Dev-only: show invite URL for testing */}
          {inviteResult.inviteUrl && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-left">
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1">DEV — Registration Link</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 break-all font-mono">{inviteResult.inviteUrl}</p>
            </div>
          )}
          {inviteResult.type === 'email_sent' && (
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <IconUserPlus size={16} className="text-brand-500" />
          Invite Vendor
        </h3>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <IconX size={16} />
        </button>
      </div>

      {/* Email field with autocomplete */}
      <div className="relative">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
          Vendor Email <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Type vendor email to search..."
            className={cn(inputCls, 'pl-9')}
            autoFocus
          />
          {searching && (
            <IconLoader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 animate-spin" />
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && !selectedVendor && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden max-h-48 overflow-y-auto"
            >
              {searchResults.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVendor(v)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{v.business_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{v.business_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{v.email}</p>
                  </div>
                  {v.approved ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Not Approved
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "Not on FaceBase" info — shown when search returns no results */}
      <AnimatePresence>
        {noResults && isEmailValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
              <IconMail size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Not on FaceBase yet</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  A registration email will be sent with a link to create their vendor account. They'll be pre-enrolled in this event on signup.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected vendor card */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{selectedVendor.business_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">{selectedVendor.business_name}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400">{selectedVendor.contact_name} · {selectedVendor.email}</p>
                {selectedVendor.industry && (
                  <p className="text-[11px] text-brand-500/70 dark:text-brand-400/60 mt-0.5">{selectedVendor.industry}</p>
                )}
              </div>
              <IconCheck size={18} className="text-brand-600 dark:text-brand-400 shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booth name */}
      <div>
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
          Booth Name <span className="text-slate-400 dark:text-slate-500">(optional)</span>
        </label>
        <input
          type="text"
          value={booth}
          onChange={(e) => setBooth(e.target.value)}
          placeholder="e.g. Hall A - Booth 12"
          className={inputCls}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
          <IconInfoCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={handleInvite}
          disabled={!isEmailValid || inviting}
          className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {inviting ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <IconMail size={14} />
              {noResults && isEmailValid ? 'Send Registration Email' : 'Send Invite'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Status badge helpers ────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: 'Live', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  draft: { label: 'Draft', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  completed: { label: 'Completed', bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const VENDOR_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  invited: { label: 'Invited', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  accepted: { label: 'Accepted', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  declined: { label: 'Declined', cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  requested: { label: 'Requested', cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' },
}

// ─── Main Component ──────────────────────────────────────────────────────────

function EventDetailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const eventId = params.get('id') ?? ''

  const [event, setEvent] = useState<OrgEvent | null>(null)
  const [vendors, setVendors] = useState<OrgEventVendor[]>([])
  const [attendees, setAttendees] = useState<OrgAttendee[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [showInvitePanel, setShowInvitePanel] = useState(false)

  const fetchData = useCallback(async () => {
    if (!eventId) return
    try {
      const [eventData, vendorData, attendeeData] = await Promise.all([
        organiserService.getEvent(eventId),
        organiserService.getEventVendors(eventId),
        organiserService.getEventAttendees(eventId),
      ])
      setEvent(eventData)
      setVendors(vendorData)
      setAttendees(attendeeData)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleActivate = async () => {
    if (!eventId) return
    try {
      await organiserService.activateEvent(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'active' } : prev)
    } catch { /* ignore */ }
  }

  const handleCancel = async () => {
    if (!eventId || !confirm('Are you sure you want to cancel this event?')) return
    try {
      await organiserService.cancelEvent(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
    } catch { /* ignore */ }
  }

  const handleRemoveVendor = async (vendorId: string) => {
    if (!eventId || !confirm('Remove this vendor from the event?')) return
    try {
      await organiserService.removeVendor(eventId, vendorId)
      setVendors((prev) => prev.filter((v) => v.vendor_id !== vendorId))
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-5 lg:p-8 text-center py-16">
        <p className="text-slate-500 dark:text-slate-400">Event not found</p>
      </div>
    )
  }

  const optedInCount = attendees.filter((a) => a.opted_in).length
  const status = STATUS_STYLES[event.status] ?? STATUS_STYLES.draft

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <IconChartBar size={15} /> },
    { id: 'vendors', label: 'Vendors', icon: <IconBuildingStore size={15} />, count: vendors.length },
    { id: 'attendees', label: 'Attendees', icon: <IconUsers size={15} />, count: optedInCount },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 pt-1 lg:px-8 pb-8">
      {/* ─── Cover + Header ─── */}
      {event.cover_image_url && (
        <div className="relative -mx-4 lg:-mx-8 h-36 lg:h-48 overflow-hidden">
          <img
            src={event.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <IconArrowLeft size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* ─── Header Card ─── */}
      <div className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 lg:p-5',
        event.cover_image_url ? '-mt-12 relative z-10 mx-1 shadow-lg' : 'mt-4',
      )}>
        <div className="flex items-start gap-3">
          {!event.cover_image_url && (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5"
            >
              <IconArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
          )}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {event.logo_url && (
              <img src={event.logo_url} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">{event.name}</h1>
                <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', status.bg, status.text)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                  {status.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <IconCalendar size={12} />
                  {formatDate(event.event_start_date)} – {formatDate(event.event_end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <IconMapPin size={12} />
                  {event.location}, {event.city}
                </span>
                {event.category && (
                  <span className="flex items-center gap-1">
                    <IconCategory size={12} />
                    <span className="capitalize">{event.category.replace(/_/g, ' ')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {event.status === 'draft' && (
            <button
              onClick={handleActivate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700 transition-colors"
            >
              <IconPlayerPlay size={13} /> Go Live
            </button>
          )}
          {(event.status === 'draft' || event.status === 'active') && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-semibold active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
            >
              <IconCircleX size={13} /> Cancel Event
            </button>
          )}
          {event.status === 'active' && (
            <button
              onClick={() => router.push(`/organiser/analytics?eventId=${event.id}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold active:bg-brand-700 transition-colors"
            >
              <IconChartBar size={13} /> View Analytics
            </button>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mt-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 active:text-slate-700',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                activeTab === tab.id
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="mt-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: <IconBuildingStore size={18} />, value: event.total_vendors, label: 'Vendors', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
                { icon: <IconScan size={18} />, value: event.total_scans, label: 'Scans', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: <IconTrendingUp size={18} />, value: event.total_leads, label: 'Leads', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                { icon: <IconUserCheck size={18} />, value: optedInCount, label: 'Opted In', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', stat.bg)}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Consent Config */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <IconShieldCheck size={13} /> Consent Configuration
              </h3>
              <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                    {event.consent_config?.consent_language || 'English'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {event.consent_config?.consent_copy || 'Default consent copy'}
                </p>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Event Details</h3>
              <div className="space-y-2.5">
                {event.expected_attendees && (
                  <div className="flex items-center gap-3 text-sm">
                    <IconUsers size={15} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{event.expected_attendees.toLocaleString()} expected attendees</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <IconClock size={15} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">Created {new Date(event.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'vendors' && (
          <>
            {/* Invite vendor header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Event Vendors
              </h2>
              <button
                onClick={() => setShowInvitePanel(!showInvitePanel)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors',
                  showInvitePanel
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    : 'bg-brand-600 text-white active:bg-brand-700',
                )}
              >
                <IconUserPlus size={13} />
                {showInvitePanel ? 'Close' : 'Invite Vendor'}
              </button>
            </div>

            {/* Invite panel */}
            <AnimatePresence>
              {showInvitePanel && (
                <VendorInvitePanel
                  eventId={eventId}
                  onInvited={fetchData}
                  onClose={() => setShowInvitePanel(false)}
                />
              )}
            </AnimatePresence>

            {/* Vendor list */}
            {vendors.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <IconBuildingStore size={24} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No vendors yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Invite vendors to start setting up booths</p>
                {!showInvitePanel && (
                  <button
                    onClick={() => setShowInvitePanel(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold active:bg-brand-700"
                  >
                    <IconUserPlus size={13} className="inline mr-1.5 -mt-0.5" />
                    Invite First Vendor
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                {vendors.map((v) => {
                  const vs = VENDOR_STATUS_STYLES[v.status] ?? VENDOR_STATUS_STYLES.invited
                  return (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-bold">
                          {(v.business_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {v.business_name || 'Unknown Vendor'}
                          </p>
                          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', vs.cls)}>
                            {vs.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{v.email || '—'}</p>
                        {v.booth_name && (
                          <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">📍 {v.booth_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex gap-3">
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{v.leads_count}</p>
                            <p className="text-[10px] text-slate-400">Leads</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{v.scans_count}</p>
                            <p className="text-[10px] text-slate-400">Scans</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveVendor(v.vendor_id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove vendor"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'attendees' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendees
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
                  {optedInCount} opted in / {attendees.length} total
                </span>
              </h2>
            </div>

            {attendees.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <IconUserCheck size={24} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No attendees yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  Attendees opt in via the FaceBase app when they arrive at your event
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                {attendees.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      a.opted_in
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-slate-100 dark:bg-slate-700',
                    )}>
                      {a.opted_in ? (
                        <IconUserCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <IconUserX size={15} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{a.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{a.email || '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        a.opted_in
                          ? a.revoked_at
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                      )}>
                        {a.opted_in ? (a.revoked_at ? 'Revoked' : 'Opted In') : 'Pending'}
                      </span>
                      {a.opted_in_at && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(a.opted_in_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function OrganiserEventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  )
}
