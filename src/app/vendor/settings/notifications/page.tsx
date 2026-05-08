'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconBell,
  IconMail,
  IconMessageCircle,
  IconDeviceMobile,
  IconClock,
  IconLoader2,
} from '@tabler/icons-react'
import { apiClient } from '@/services/api.client'

type DigestFrequency = 'daily' | 'weekly' | 'never'

interface DigestPreference {
  frequency: DigestFrequency
}

const DIGEST_OPTIONS: { id: DigestFrequency; label: string; description: string }[] = [
  { id: 'daily', label: 'Daily', description: 'Get a summary every morning' },
  { id: 'weekly', label: 'Weekly', description: 'Get a summary every Monday' },
  { id: 'never', label: 'Never', description: 'Don\'t send digest emails' },
]

export default function VendorNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [digestFrequency, setDigestFrequency] = useState<DigestFrequency>('daily')

  // Local toggle states (UI-only for now; no backend endpoints for these)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [scanAlerts, setScanAlerts] = useState(true)
  const [leadAlerts, setLeadAlerts] = useState(true)
  const [eventReminders, setEventReminders] = useState(true)

  const fetchPreferences = useCallback(async () => {
    try {
      const { data } = await apiClient.get<DigestPreference>('/notifications/digest/preference')
      if (data?.frequency) {
        setDigestFrequency(data.frequency)
      }
    } catch {
      // Defaults are fine
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const handleDigestChange = async (freq: DigestFrequency) => {
    setSaving(true)
    const prev = digestFrequency
    setDigestFrequency(freq)
    try {
      await apiClient.put('/notifications/digest/frequency', { frequency: freq })
    } catch {
      setDigestFrequency(prev)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <IconLoader2 size={28} className="animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h1>
          {saving && <IconLoader2 size={16} className="animate-spin text-brand-500 ml-auto" />}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Push & Email master toggles */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Channels</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            <ToggleRow
              icon={<IconDeviceMobile size={16} />}
              label="Push Notifications"
              description="Alerts on your device"
              checked={pushEnabled}
              onChange={setPushEnabled}
            />
            <ToggleRow
              icon={<IconMail size={16} />}
              label="Email Notifications"
              description="Important updates via email"
              checked={emailEnabled}
              onChange={setEmailEnabled}
            />
          </div>
        </div>

        {/* Notification types */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Alert Types</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            <ToggleRow
              icon={<IconBell size={16} />}
              label="New Scan Alerts"
              description="When someone scans at your booth"
              checked={scanAlerts}
              onChange={setScanAlerts}
            />
            <ToggleRow
              icon={<IconMessageCircle size={16} />}
              label="Lead Updates"
              description="New leads & follow-up reminders"
              checked={leadAlerts}
              onChange={setLeadAlerts}
            />
            <ToggleRow
              icon={<IconClock size={16} />}
              label="Event Reminders"
              description="Upcoming events & schedule changes"
              checked={eventReminders}
              onChange={setEventReminders}
            />
          </div>
        </div>

        {/* Digest Frequency */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Email Digest</h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              A summary of your leads and event activity, delivered to your inbox.
            </p>
            {DIGEST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleDigestChange(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  digestFrequency === opt.id
                    ? 'bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent active:bg-slate-100 dark:active:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  digestFrequency === opt.id
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {digestFrequency === opt.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    digestFrequency === opt.id
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/50">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Tip:</strong> Channel toggles are stored locally for now. Digest frequency syncs with the server in real-time.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Reusable toggle row */
function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}
