'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconDownload, IconX } from '@tabler/icons-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'facebase-pwa-dismiss'
const DISMISS_DAYS = 7

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as any).standalone) return

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissDate = parseInt(dismissed, 10)
      if (Date.now() - dismissDate < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
    }

    // iOS detection — Safari doesn't support beforeinstallprompt
    const ua = navigator.userAgent
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)

    if (isiOS && isSafari) {
      setIsIOS(true)
      // Delay showing to not interrupt onboarding
      const t = setTimeout(() => setShow(true), 5000)
      return () => clearTimeout(t)
    }

    // Android/Desktop — capture install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-[10000] max-w-lg mx-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200/50 dark:border-slate-700/50 p-4 flex items-start gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
              <IconDownload size={20} className="text-brand-600 dark:text-brand-400" stroke={1.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Install FaceBase
              </p>

              {isIOS ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Tap{' '}
                  <svg className="inline w-4 h-4 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  {' '}then <strong>"Add to Home Screen"</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add to home screen for the best experience
                </p>
              )}

              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="mt-2 h-8 px-4 rounded-lg bg-brand-600 text-white text-xs font-semibold active:scale-[0.97] transition-transform"
                >
                  Install App
                </button>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <IconX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
