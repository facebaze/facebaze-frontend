'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconX,
  IconBolt,
  IconLoader2,
  IconPhone,
  IconMail,
  IconMessageCircle,
  IconBookmark,
  IconExternalLink,
  IconRefresh,
  IconUserOff,
  IconClock,
} from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { scanService, type ScanResult, type ScannedProfile } from '@/services/scan.service'
import { useSocketStore } from '@/stores/socket.store'
import { cn } from '@/lib/utils'

type ScanState =
  | 'camera'
  | 'detecting'
  | 'scanning'
  | 'matched'
  | 'waiting_consent'
  | 'denied'
  | 'no_match'
  | 'error'

export default function ScanPage() {
  const router = useRouter()
  const [state, setState] = useState<ScanState>('camera')
  const [profile, setProfile] = useState<ScannedProfile | null>(null)
  const [consentTimeout, setConsentTimeout] = useState(30)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const socket = useSocketStore((s) => s.socket)

  // ─── Camera Init ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera for scanning others
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('camera')
    } catch {
      setError('Camera access required for scanning.')
      setState('error')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [startCamera])

  // ─── Listen for consent response via WebSocket ────────────────────────────
  useEffect(() => {
    if (!socket || state !== 'waiting_consent') return

    const handleConsentResponse = (data: { granted: boolean; profile?: ScannedProfile }) => {
      if (data.granted && data.profile) {
        setProfile(data.profile)
        setState('matched')
      } else {
        setState('denied')
      }
    }

    socket.on('consent-response', handleConsentResponse)
    return () => {
      socket.off('consent-response', handleConsentResponse)
    }
  }, [socket, state])

  // ─── Consent timeout countdown ────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'waiting_consent') return

    const interval = setInterval(() => {
      setConsentTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setState('denied')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  // ─── Capture + Scan ───────────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    setState('detecting')

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.85)

    setState('scanning')

    try {
      const result = await scanService.scanPeer(base64.split(',')[1])
      handleScanResult(result)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Scan failed. Please try again.')
      setState('error')
    }
  }, [])

  const handleScanResult = (result: ScanResult) => {
    switch (result.status) {
      case 'matched':
        if (result.consent === 'granted' && result.profile) {
          setProfile(result.profile)
          setState('matched')
        } else if (result.consent === 'pending') {
          setConsentTimeout(result.timeout || 30)
          setState('waiting_consent')
        } else {
          setState('denied')
        }
        break
      case 'no_match':
        setState('no_match')
        break
      default:
        setError('Unexpected response.')
        setState('error')
    }
  }

  const handleSaveContact = async () => {
    if (!profile) return
    try {
      await scanService.saveContact(profile.id)
      setSaved(true)
    } catch {
      // Silently fail — non-critical
    }
  }

  const handleReset = () => {
    setProfile(null)
    setError(null)
    setSaved(false)
    setConsentTimeout(30)
    setState('camera')
    startCamera()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-safe-top pt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          aria-label="Close scanner"
        >
          <IconX size={20} className="text-white" stroke={1.5} />
        </button>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <IconBolt size={18} className="text-white" stroke={1.5} />
        </button>
      </div>

      {/* Camera state — scan ring */}
      {(state === 'camera' || state === 'detecting') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              'w-56 h-56 rounded-full border-[3px] transition-all duration-500',
              state === 'detecting'
                ? 'border-brand-400 animate-pulse scale-105'
                : 'border-white/40'
            )}
          />
        </div>
      )}

      {/* Camera hint */}
      {state === 'camera' && (
        <div className="absolute bottom-32 left-0 right-0 text-center">
          <p className="text-white/80 text-body font-medium">
            Point camera at someone's face
          </p>
          <p className="text-white/50 text-caption mt-1">
            to view their profile
          </p>
        </div>
      )}

      {/* Scan button */}
      {(state === 'camera' || state === 'detecting') && (
        <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe-bottom">
          <button
            onClick={handleScan}
            disabled={state === 'detecting'}
            className="w-20 h-20 rounded-full bg-white border-4 border-white/30 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Scan face"
          >
            <div className="w-16 h-16 rounded-full bg-brand-600" />
          </button>
        </div>
      )}

      {/* Scanning state */}
      {state === 'scanning' && (
        <Overlay>
          <IconLoader2 size={40} className="text-white animate-spin mb-4" stroke={1.5} />
          <p className="text-white text-body font-medium">Looking up...</p>
          <div className="w-48 h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '80%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </Overlay>
      )}

      {/* Waiting for consent */}
      {state === 'waiting_consent' && (
        <BottomSheet>
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <IconClock size={40} className="text-brand-500" stroke={1.5} />
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-600 text-white text-tiny font-bold flex items-center justify-center"
                  key={consentTimeout}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                >
                  {consentTimeout}
                </motion.div>
              </div>
            </div>
            <h3 className="text-subheading text-slate-900 dark:text-white mb-1">
              Waiting for approval...
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              They've been notified. Timeout in {consentTimeout}s
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
            <Button variant="ghost" onClick={handleReset} className="mt-6 w-auto px-8">
              Cancel
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* Profile shown (consent granted) */}
      {state === 'matched' && profile && (
        <BottomSheet>
          <div className="py-2">
            {/* Profile header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0 overflow-hidden">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-subheading text-slate-900 dark:text-white truncate">
                  {profile.full_name}
                </h3>
                {profile.designation && (
                  <p className="text-caption text-slate-600 dark:text-slate-400 truncate">
                    {profile.designation}
                    {profile.company_name && `, ${profile.company_name}`}
                  </p>
                )}
                {profile.location && (
                  <p className="text-tiny text-slate-400 dark:text-slate-500">{profile.location}</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3 mb-5">
              {profile.phone && (
                <ActionChip
                  icon={<IconPhone size={16} stroke={1.5} />}
                  label="Call"
                  href={`tel:${profile.phone}`}
                />
              )}
              {profile.email && (
                <ActionChip
                  icon={<IconMail size={16} stroke={1.5} />}
                  label="Email"
                  href={`mailto:${profile.email}`}
                />
              )}
              {profile.phone && (
                <ActionChip
                  icon={<IconMessageCircle size={16} stroke={1.5} />}
                  label="WhatsApp"
                  href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                />
              )}
            </div>

            {/* Tags */}
            {profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-tiny font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleSaveContact}
                disabled={saved}
                icon={<IconBookmark size={18} stroke={1.5} />}
              >
                {saved ? 'Saved ✓' : 'Save Contact'}
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Scan Another
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Consent denied */}
      {state === 'denied' && (
        <BottomSheet>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <IconUserOff size={28} className="text-slate-400" stroke={1.5} />
            </div>
            <h3 className="text-subheading text-slate-900 dark:text-white mb-1">
              Access not granted
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              This person hasn't approved your request.
            </p>
            <Button onClick={handleReset} className="mt-6">
              Scan Another
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* No match */}
      {state === 'no_match' && (
        <BottomSheet>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤷</span>
            </div>
            <h3 className="text-subheading text-slate-900 dark:text-white mb-1">
              No match found
            </h3>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              This person may not be registered on FaceBase.
            </p>
            <Button onClick={handleReset} className="mt-6" icon={<IconRefresh size={16} stroke={1.5} />}>
              Try Again
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* Error */}
      {state === 'error' && (
        <BottomSheet>
          <div className="text-center py-6">
            <p className="text-caption text-error mb-4">{error}</p>
            <Button onClick={handleReset} icon={<IconRefresh size={16} stroke={1.5} />}>
              Try Again
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
    >
      {children}
    </motion.div>
  )
}

function BottomSheet({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 rounded-t-3xl px-6 pb-safe-bottom max-h-[75vh] overflow-y-auto"
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>
      {children}
    </motion.div>
  )
}

function ActionChip({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-colors"
    >
      <span className="text-brand-600">{icon}</span>
      <span className="text-tiny font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </a>
  )
}
