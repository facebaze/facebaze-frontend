'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconBell,
  IconChecks,
  IconScan,
  IconCalendar,
  IconShieldCheck,
  IconAlertCircle,
  IconSpeakerphone,
  IconUserCheck,
} from '@tabler/icons-react'
import { notificationService, type NotificationItem } from '@/services/notification.service'
import { useSocketStore } from '@/stores/socket.store'
import { Avatar } from '@/components/ui'
import { cn, formatRelativeTime } from '@/lib/utils'

const NOTIFICATION_CONFIG: Record<string, { icon: typeof IconScan; color: string }> = {
  consent_request: { icon: IconShieldCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950' },
  scan_received: { icon: IconScan, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  profile_saved: { icon: IconUserCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
  event_reminder: { icon: IconCalendar, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  consent_revoked: { icon: IconAlertCircle, color: 'text-red-500 bg-red-50 dark:bg-red-950' },
  system_announcement: { icon: IconSpeakerphone, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const socket = useSocketStore((s) => s.socket)

  const load = useCallback(() => {
    notificationService
      .list(50)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!socket) return
    const handler = () => load()
    socket.on('notification', handler)
    return () => { socket.off('notification', handler) }
  }, [socket, load])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleConsentAction = async (notifId: string, granted: boolean) => {
    const notif = notifications.find((n) => n.id === notifId)
    if (!notif || !socket) return

    socket.emit('consent-response', {
      consentRequestId: notif.data?.consentRequestId,
      granted,
    })

    await notificationService.markRead(notifId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, read: true, action_required: false } : n
      )
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const groups = groupByDay(notifications)

  return (
    <div className="flex-1 overflow-y-auto pt-safe-top pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <h1 className="text-heading text-slate-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-tiny text-slate-400 dark:text-slate-500 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-tiny font-semibold active:scale-95 transition-transform"
          >
            <IconChecks size={14} />
            Read all
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-5 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
              <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-5">
            <IconBell size={36} className="text-slate-300 dark:text-slate-600" stroke={1.5} />
          </div>
          <h3 className="text-subheading text-slate-700 dark:text-slate-200 mb-1">
            You&apos;re all caught up
          </h3>
          <p className="text-caption text-slate-400 dark:text-slate-500 text-center max-w-[260px]">
            When someone scans you or you receive event updates, they&apos;ll appear here
          </p>
        </motion.div>
      ) : (
        <div className="px-5 space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-tiny font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                {group.label}
              </h2>
              <div className="space-y-2">
                <AnimatePresence>
                  {group.items.map((notif, i) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      index={i}
                      onConsent={handleConsentAction}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notif,
  index,
  onConsent,
}: {
  notif: NotificationItem
  index: number
  onConsent: (id: string, granted: boolean) => void
}) {
  const config = NOTIFICATION_CONFIG[notif.type] || NOTIFICATION_CONFIG.system_announcement
  const Icon = config.icon
  const isConsent = notif.action_required && notif.type === 'consent_request'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden transition-all',
        !notif.read && 'ring-1 ring-brand-100 dark:ring-brand-900'
      )}
    >
      <div className="p-4 flex gap-3.5">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.color)}>
          <Icon size={18} stroke={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-caption leading-snug',
                notif.read
                  ? 'text-slate-600 dark:text-slate-300'
                  : 'text-slate-900 dark:text-white font-semibold'
              )}
            >
              {notif.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-brand-500" />
              )}
              <span className="text-tiny text-slate-400 dark:text-slate-500">
                {formatRelativeTime(notif.created_at)}
              </span>
            </div>
          </div>
          <p className="text-tiny text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
            {notif.body}
          </p>

          {/* Consent action buttons */}
          {isConsent && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onConsent(notif.id, false)}
                className="flex-1 px-4 py-2 rounded-xl text-tiny font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 active:scale-95 transition-transform"
              >
                Deny
              </button>
              <button
                onClick={() => onConsent(notif.id, true)}
                className="flex-1 px-4 py-2 rounded-xl text-tiny font-bold text-white bg-gradient-to-r from-brand-500 to-brand-700 active:scale-95 transition-transform shadow-button"
              >
                Allow
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function groupByDay(items: NotificationItem[]) {
  const groups: { label: string; items: NotificationItem[] }[] = []
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  for (const item of items) {
    const day = new Date(item.created_at).toDateString()
    let label = day === today ? 'Today' : day === yesterday ? 'Yesterday' : day
    if (label !== 'Today' && label !== 'Yesterday') {
      label = new Date(item.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    }
    const existing = groups.find((g) => g.label === label)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }

  return groups
}
