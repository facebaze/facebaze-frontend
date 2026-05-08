'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconDownload, IconTrash, IconAlertTriangle } from '@tabler/icons-react'
import { privacyService, type PrivacySettings, type ConsentRecord, type ActiveConsent } from '@/services/privacy.service'
import { eventService } from '@/services/event.service'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const PERMISSION_MODES = [
  { value: 'always_ask', label: 'Always Ask', desc: 'Asks for your approval on every scan' },
  { value: 'auto_allow', label: 'Auto-Allow at Events', desc: 'Automatically shares your profile at opted-in events' },
  { value: 'do_not_scan', label: 'Do Not Scan', desc: 'Hides you from all scans entirely' },
] as const

export default function PrivacyPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [activeConsents, setActiveConsents] = useState<ActiveConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'face' | 'account' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([
      privacyService.getSettings().catch(() => null),
      privacyService.getConsentRecords().catch(() => []),
      privacyService.getActiveConsents().catch(() => []),
    ]).then(([s, c, a]) => {
      if (s) setSettings(s)
      setConsents(c)
      setActiveConsents(a)
      setLoading(false)
    })
  }, [])

  const handleModeChange = async (mode: PrivacySettings['permission_mode']) => {
    setSettings((prev) => (prev ? { ...prev, permission_mode: mode } : prev))
    try {
      await privacyService.updateSettings({ permission_mode: mode })
    } catch {
      // Revert on error would go here
    }
  }

  const handleRevokeEvent = async (eventId: string) => {
    try {
      await eventService.optOut(eventId)
      setActiveConsents((prev) => prev.filter((c) => c.event_id !== eventId))
    } catch {}
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await privacyService.requestDataExport()
      alert('Data export requested. You will receive an email with a download link.')
    } catch {}
    finally { setExporting(false) }
  }

  const handleDeleteFace = async () => {
    setDeleting(true)
    try {
      await privacyService.deleteFaceData()
      setModal(null)
      alert('Face deletion scheduled. You can cancel within 30 days.')
    } catch {}
    finally { setDeleting(false) }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await privacyService.deleteAccount()
      setModal(null)
      router.replace('/auth/welcome')
    } catch {}
    finally { setDeleting(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 px-5 pt-safe-top pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <IconArrowLeft size={22} className="text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-body font-semibold text-slate-900 dark:text-white">Privacy & Data</h1>
      </div>

      {/* Permission mode */}
      <section className="mb-6">
        <h2 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Scan Settings
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700 overflow-hidden">
          {PERMISSION_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700"
            >
              <div className="flex-1 text-left">
                <p className="text-caption font-medium text-slate-700 dark:text-slate-300">{mode.label}</p>
                <p className="text-tiny text-slate-400">{mode.desc}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  settings?.permission_mode === mode.value
                    ? 'border-brand-600 bg-brand-600'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {settings?.permission_mode === mode.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Active consents */}
      {activeConsents.length > 0 && (
        <section className="mb-6">
          <h2 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Active Consents
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700 overflow-hidden">
            {activeConsents.map((c) => (
              <div key={c.event_id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 text-caption font-medium text-slate-700 dark:text-slate-300">{c.event_name}</span>
                <button
                  onClick={() => handleRevokeEvent(c.event_id)}
                  className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-error" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Your data */}
      <section className="mb-6">
        <h2 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Your Data
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700 overflow-hidden">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700 disabled:opacity-50"
          >
            <IconDownload size={18} className="text-brand-600" />
            <span className="flex-1 text-left text-caption font-medium text-slate-700 dark:text-slate-300">
              {exporting ? 'Requesting...' : 'Export My Data'}
            </span>
          </button>
          <button
            onClick={() => setModal('face')}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-red-50"
          >
            <IconTrash size={18} className="text-error" />
            <span className="flex-1 text-left text-caption font-medium text-error">
              Delete Face Data
            </span>
          </button>
          <button
            onClick={() => setModal('account')}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-red-50"
          >
            <IconTrash size={18} className="text-error" />
            <span className="flex-1 text-left text-caption font-medium text-error">
              Delete Account
            </span>
          </button>
        </div>
      </section>

      {/* Consent records */}
      {consents.length > 0 && (
        <section className="mb-6">
          <h2 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Consent Records
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700 overflow-hidden">
            {consents.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <p className="text-caption font-medium text-slate-700 dark:text-slate-300">
                  {c.event_name || `Platform consent v${c.version}`}
                </p>
                <p className="text-tiny text-slate-400">
                  Agreed: {new Date(c.agreed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Delete modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl px-6 pt-6 pb-safe-bottom"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <IconAlertTriangle size={20} className="text-error" />
              </div>
              <h3 className="text-subheading text-slate-900 dark:text-white">
                {modal === 'face' ? 'Delete Face Data?' : 'Delete Account?'}
              </h3>
            </div>
            <p className="text-caption text-slate-600 dark:text-slate-400 mb-6">
              {modal === 'face'
                ? "This removes your face from all scans. You'll need to re-register to be scannable again. This action takes effect in 30 days."
                : 'This will permanently delete your account and all associated data after a 30-day grace period. This cannot be undone.'}
            </p>
            <div className="flex gap-3 mb-4">
              <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">
                Cancel
              </Button>
              <button
                onClick={modal === 'face' ? handleDeleteFace : handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-error text-white text-caption font-semibold active:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
