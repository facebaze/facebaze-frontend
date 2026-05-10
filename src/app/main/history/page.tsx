'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconArrowLeft,
  IconHistory,
  IconScan,
  IconUser,
  IconBuilding,
} from '@tabler/icons-react'
import { scanService, type ScanHistoryItem } from '@/services/scan.service'
import { Avatar, Skeleton } from '@/components/ui'
import { cn, formatRelativeTime } from '@/lib/utils'

type Direction = 'incoming' | 'outgoing' | 'vendor'

const TABS: { value: Direction; label: string; icon: typeof IconScan }[] = [
  { value: 'incoming', label: 'Incoming', icon: IconScan },
  { value: 'outgoing', label: 'Outgoing', icon: IconUser },
  { value: 'vendor', label: 'Vendor', icon: IconBuilding },
]

export default function HistoryPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Direction>('incoming')
  const [items, setItems] = useState<ScanHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    scanService
      .getHistory(tab)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab])

  const handleRevoke = async (scanId: string) => {
    try {
      await scanService.revokeConsent(scanId)
      setItems((prev) => prev.filter((i) => i.id !== scanId))
    } catch {}
  }

  return (
    <div className="flex-1 pt-safe-top pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-2">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-card flex items-center justify-center active:scale-95 transition-transform -ml-1"
        >
          <IconArrowLeft size={18} className="text-slate-600 dark:text-slate-300" stroke={1.5} />
        </button>
        <div>
          <h1 className="text-body font-bold text-slate-900 dark:text-white">Scan History</h1>
          <p className="text-tiny text-slate-400 dark:text-slate-500">Your scan activity log</p>
        </div>
      </div>

      {/* ─── Segmented Control ─── */}
      <div className="px-5 mt-4 mb-5">
        <div className="relative flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          {TABS.map((t) => {
            const isActive = tab === t.value
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  'relative flex-1 py-2.5 text-caption font-semibold rounded-xl transition-colors z-10',
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="history-tab"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── List ─── */}
      {loading ? (
        <div className="px-5 space-y-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-card">
              <Skeleton className="w-11 h-11 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28 rounded-lg mb-1.5" />
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-10 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 rounded-2xl bg-white dark:bg-slate-800 shadow-card p-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <IconHistory size={28} className="text-slate-300 dark:text-slate-500" stroke={1.5} />
          </div>
          <p className="text-caption font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No scan history
          </p>
          <p className="text-tiny text-slate-400 dark:text-slate-500">
            {tab === 'incoming'
              ? 'People who scan you will show here'
              : tab === 'outgoing'
                ? 'People you scan will show here'
                : 'Vendor scans will show here'}
          </p>
        </motion.div>
      ) : (
        <div className="px-5 space-y-2.5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-3.5"
            >
              <Avatar
                src={item.scanner_photo}
                name={item.scanner_name || 'Unknown'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {item.scanner_name || 'Unknown'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.event_name && (
                    <span className="text-tiny text-slate-400 dark:text-slate-500 truncate">
                      {item.event_name}
                    </span>
                  )}
                  {item.event_name && <span className="text-slate-300 dark:text-slate-600">·</span>}
                  {item.consent === true && (
                    <span className="text-tiny font-bold text-emerald-500">Allowed</span>
                  )}
                  {item.consent === false && (
                    <span className="text-tiny font-bold text-red-400">Denied</span>
                  )}
                  {item.consent === null && (
                    <span className="text-tiny font-bold text-amber-500">Pending</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-tiny text-slate-400 dark:text-slate-500">
                  {formatRelativeTime(item.scanned_at)}
                </p>
                {tab === 'incoming' && item.consent === true && (
                  <button
                    onClick={() => handleRevoke(item.id)}
                    className="text-tiny font-bold text-red-400 mt-0.5 active:opacity-70"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
