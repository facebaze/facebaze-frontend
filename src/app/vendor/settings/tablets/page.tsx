'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconDeviceTablet,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconClock,
} from '@tabler/icons-react'
import { vendorService, type TabletToken, type VendorEvent } from '@/services/vendor.service'

export default function VendorTabletsPage() {
  const router = useRouter()
  const [tokens, setTokens] = useState<TabletToken[]>([])
  const [events, setEvents] = useState<VendorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [t, e] = await Promise.all([
        vendorService.getTabletTokens(),
        vendorService.getAssignedEvents('active'),
      ])
      setTokens(t)
      setEvents(e)
    } catch {
      setTokens([])
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerate = async (eventId: string) => {
    setGeneratingFor(eventId)
    try {
      const t = await vendorService.generateTabletToken(eventId)
      setTokens((prev) => [...prev.filter((x) => x.event_id !== eventId), t])
    } catch { /* ignore */ } finally {
      setGeneratingFor(null)
    }
  }

  const handleRotate = async (eventId: string) => {
    setGeneratingFor(eventId)
    try {
      const t = await vendorService.rotateTabletToken(eventId)
      setTokens((prev) => prev.map((x) => (x.event_id === eventId ? t : x)))
    } catch { /* ignore */ } finally {
      setGeneratingFor(null)
    }
  }

  const handleRevoke = async (eventId: string) => {
    try {
      await vendorService.revokeTabletToken(eventId)
      setTokens((prev) => prev.filter((x) => x.event_id !== eventId))
    } catch { /* ignore */ }
  }

  const handleCopy = async (token: string, eventId: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedId(eventId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  // Events that don't have a token yet
  const eventsWithoutToken = events.filter(
    (e) => !tokens.find((t) => t.event_id === e.event_id)
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tablet Tokens</h1>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active tokens */}
            {tokens.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                  Active Tokens
                </h2>
                {tokens.map((t) => (
                  <div key={t.event_id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.event_name}</h3>
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>

                    {/* Token */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[11px] font-mono text-slate-600 break-all leading-relaxed">
                          {t.token.slice(0, 40)}...
                        </code>
                        <button
                          onClick={() => handleCopy(t.token, t.event_id)}
                          className="shrink-0 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:bg-slate-700"
                        >
                          {copiedId === t.event_id ? (
                            <IconCheck size={12} className="text-emerald-500" />
                          ) : (
                            <IconCopy size={12} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <IconCalendar size={11} />
                        Expires: {formatDate(t.expires_at)}
                      </span>
                      {t.last_used_at && (
                        <span className="flex items-center gap-1">
                          <IconClock size={11} />
                          Last used: {formatDate(t.last_used_at)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRotate(t.event_id)}
                        disabled={generatingFor === t.event_id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 active:bg-slate-50 dark:active:bg-slate-700 disabled:opacity-50"
                      >
                        <IconRefresh size={12} className={generatingFor === t.event_id ? 'animate-spin' : ''} />
                        Rotate
                      </button>
                      <button
                        onClick={() => handleRevoke(t.event_id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-xs font-medium text-red-600 active:bg-red-50"
                      >
                        <IconTrash size={12} />
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate for events without tokens */}
            {eventsWithoutToken.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
                  Generate Token
                </h2>
                {eventsWithoutToken.map((ev) => (
                  <div key={ev.event_id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{ev.event_name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{ev.event_city}</p>
                      </div>
                      <button
                        onClick={() => handleGenerate(ev.event_id)}
                        disabled={generatingFor === ev.event_id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold active:bg-brand-700 disabled:opacity-50"
                      >
                        <IconPlus size={12} />
                        Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tokens.length === 0 && eventsWithoutToken.length === 0 && (
              <div className="text-center py-16">
                <IconDeviceTablet size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-base font-semibold text-slate-600">No active events</p>
                <p className="text-sm text-slate-400 mt-1">
                  Tokens can be generated once you&apos;re assigned to an active event
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>About Tablet Tokens:</strong> Each token authenticates a tablet device
                for a specific event. Rotating a token immediately invalidates the previous one
                — the tablet will need to be re-authenticated. Tokens expire automatically
                24 hours after the event ends.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
