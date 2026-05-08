'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCircleCheck, IconCircleX, IconInfoCircle, IconX, IconCopy, IconCheck } from '@tabler/icons-react'
import { useToastStore, type ToastItem } from '@/stores/toast.store'

// ─── OTP Toast ───────────────────────────────────────────────────────────────

function OtpToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(item.duration / 1000))

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const handleCopy = async () => {
    if (!item.message) return
    await navigator.clipboard.writeText(item.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const digits = item.message?.split('') ?? []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center text-base">
              🔐
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">OTP Code (Dev)</p>
              <p className="text-[11px] text-slate-400 leading-tight">Mock mode — won't appear in production</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <IconX size={14} />
          </button>
        </div>

        {/* Digit boxes */}
        <div className="px-4 py-3 flex items-center justify-center gap-2">
          {digits.map((d, i) => (
            <div
              key={i}
              className="w-10 h-13 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center"
              style={{ height: '52px' }}
            >
              <span className="text-xl font-bold text-brand-400 font-mono tracking-tight">{d}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="text-xs text-slate-500">Expires in {secondsLeft}s</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-semibold hover:bg-brand-500/30 transition-colors"
          >
            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {copied ? 'Copied!' : 'Copy code'}
          </button>
        </div>

        {/* Countdown bar */}
        <motion.div
          className="h-[3px] bg-brand-500 origin-left"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: item.duration / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Regular Toast ────────────────────────────────────────────────────────────

function RegularToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const styles: Record<string, { wrap: string; icon: React.ReactNode }> = {
    success: {
      wrap: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800',
      icon: <IconCircleCheck size={18} className="text-emerald-500 flex-shrink-0" />,
    },
    error: {
      wrap: 'bg-red-50 border-red-200 dark:bg-red-950/80 dark:border-red-800',
      icon: <IconCircleX size={18} className="text-red-500 flex-shrink-0" />,
    },
    info: {
      wrap: 'bg-blue-50 border-blue-200 dark:bg-blue-950/80 dark:border-blue-800',
      icon: <IconInfoCircle size={18} className="text-blue-500 flex-shrink-0" />,
    },
  }

  const s = styles[item.type] ?? styles.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
    >
      <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg ${s.wrap}`}>
        <div className="mt-0.5">{s.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{item.title}</p>
          {item.message && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{item.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          <IconX size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Toaster (portal renderer — add to providers) ─────────────────────────────

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return createPortal(
    <div
      className="fixed top-0 inset-x-0 z-[9999] flex flex-col gap-2 px-4 pointer-events-none"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm mx-auto">
            {t.type === 'otp' ? (
              <OtpToast item={t} onDismiss={() => dismiss(t.id)} />
            ) : (
              <RegularToast item={t} onDismiss={() => dismiss(t.id)} />
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
