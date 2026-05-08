'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandLinkedin,
  IconCalendar,
  IconScan,
  IconEdit,
  IconCheck,
  IconTrash,
} from '@tabler/icons-react'
import { vendorService, type VendorLead } from '@/services/vendor.service'

const FOLLOW_UP_OPTIONS = [
  { value: 'none', label: 'New', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'closed', label: 'Closed', color: 'bg-violet-100 text-violet-700' },
]

function LeadDetailContent() {
  const router = useRouter()
  const params = useSearchParams()
  const leadId = params.get('id') ?? ''

  const [lead, setLead] = useState<VendorLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchLead = useCallback(async () => {
    if (!leadId) return
    try {
      const data = await vendorService.getLeadDetail(leadId)
      setLead(data)
      setNotes(data.notes ?? '')
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  const handleUpdateStatus = async (status: string) => {
    if (!leadId) return
    setSaving(true)
    try {
      await vendorService.updateLead(leadId, { follow_up_status: status })
      setLead((prev) => prev ? { ...prev, follow_up_status: status as VendorLead['follow_up_status'] } : prev)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!leadId) return
    setSaving(true)
    try {
      await vendorService.updateLead(leadId, { notes })
      setLead((prev) => prev ? { ...prev, notes } : prev)
      setEditingNotes(false)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Lead not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="bg-gradient-to-br from-brand-600 to-brand-700 pt-safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/15 flex items-center justify-center"
          >
            <IconArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Lead Detail</h1>
        </div>

        {/* Profile card */}
        <div className="px-5 pb-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800/20 flex items-center justify-center shrink-0">
            {lead.attendee_photo_url ? (
              <img
                src={lead.attendee_photo_url}
                alt={lead.attendee_name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {lead.attendee_name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{lead.attendee_name}</h2>
            {lead.attendee_designation && (
              <p className="text-sm text-brand-200 truncate">{lead.attendee_designation}</p>
            )}
            {lead.attendee_company && (
              <p className="text-sm text-brand-200/80">{lead.attendee_company}</p>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 -mt-2 space-y-4 pb-8">
        {/* Follow-up status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Follow-up Status</h3>
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleUpdateStatus(opt.value)}
                disabled={saving}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  lead.follow_up_status === opt.value
                    ? opt.color + ' ring-2 ring-offset-1 ring-brand-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 active:bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {lead.follow_up_status === opt.value && <IconCheck size={10} className="inline mr-1" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contact Information</h3>

          {lead.attendee_email && (
            <a
              href={`mailto:${lead.attendee_email}`}
              className="flex items-center gap-3 py-2 active:opacity-70"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <IconMail size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{lead.attendee_email}</p>
              </div>
            </a>
          )}

          {lead.attendee_phone && (
            <a
              href={`tel:${lead.attendee_phone}`}
              className="flex items-center gap-3 py-2 active:opacity-70"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <IconPhone size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm text-slate-700">{lead.attendee_phone}</p>
              </div>
            </a>
          )}

          {!lead.attendee_email && !lead.attendee_phone && (
            <p className="text-sm text-slate-400 py-2">No contact info shared</p>
          )}
        </div>

        {/* Tags */}
        {lead.attendee_tags.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Expertise Tags</h3>
            <div className="flex flex-wrap gap-2">
              {lead.attendee_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Capture info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Capture Details</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <IconCalendar size={14} className="text-slate-400" />
            {new Date(lead.captured_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <IconScan size={14} className="text-slate-400" />
            Match confidence: {Math.round(lead.match_confidence * 100)}%
          </div>
          <div className="text-sm text-slate-600">
            Event: <span className="font-medium">{lead.event_name}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notes</h3>
            {!editingNotes && (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-xs font-medium text-brand-600 flex items-center gap-1"
              >
                <IconEdit size={12} />
                Edit
              </button>
            )}
          </div>

          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add notes about this lead..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingNotes(false); setNotes(lead.notes ?? '') }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {lead.notes || 'No notes added yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VendorLeadDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeadDetailContent />
    </Suspense>
  )
}
