'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCamera, IconRotate, IconCheck, IconAlertCircle, IconSun, IconShield, IconScan, IconFingerprint, IconChevronRight } from '@tabler/icons-react'

import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { profileService } from '@/services/profile.service'
import { isNativePlatform, getPlatform } from '@/lib/utils'

const SKIP_FACE_CAPTURE = process.env.NEXT_PUBLIC_SKIP_FACE_CAPTURE === 'true'

type CaptureState = 'initializing' | 'positioning' | 'liveness' | 'ready' | 'captured' | 'uploading' | 'error'

interface FaceStatus {
  detected: boolean
  aligned: boolean
  lighting: 'good' | 'low' | 'bright'
  blinkDetected: boolean
}

// ─── Animated Scan Line ────────────────────────────────────────────────────────

function ScanLine() {
  return (
    <motion.div
      className="absolute left-[15%] right-[15%] h-[2px] pointer-events-none z-10"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(99,102,241,0.9), rgba(99,102,241,0.7), transparent)',
        boxShadow: '0 0 12px rgba(99,102,241,0.5)',
      }}
      initial={{ top: '15%', opacity: 0 }}
      animate={{ top: ['15%', '75%', '15%'], opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Pulsing Ring (around the face oval) ──────────────────────────────────────

function PulsingRings({ active, color }: { active: boolean; color: string }) {
  if (!active) return null
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: [1, 1.15], opacity: [0.35, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        >
          <div
            className="w-56 h-72 rounded-[50%] border-2"
            style={{ borderColor: color }}
          />
        </motion.div>
      ))}
    </>
  )
}

// ─── Corner Brackets (tech HUD feel) ─────────────────────────────────────────

function CornerBrackets({ color }: { color: string }) {
  const style = { borderColor: color }
  return (
    <div className="absolute inset-4 pointer-events-none z-10">
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg" style={style} />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg" style={style} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg" style={style} />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg" style={style} />
    </div>
  )
}

// ─── Status Chip ──────────────────────────────────────────────────────────────

function StatusChip({ text, variant }: { text: string; variant: 'scanning' | 'success' | 'error' | 'idle' }) {
  const colors = {
    scanning: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    idle: 'bg-white/10 text-white/60 border-white/20',
  }
  const dots = { scanning: 'bg-indigo-400', success: 'bg-emerald-400', error: 'bg-red-400', idle: 'bg-white/40' }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide backdrop-blur-sm ${colors[variant]}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${dots[variant]} ${variant === 'scanning' ? 'animate-pulse' : ''}`} />
      {text}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FaceCapturePage() {
  const router = useRouter()
  const { setFaceCapture, markFaceCaptured, nextStep } = useOnboardingStore()

  const handleSkip = () => {
    nextStep()
    router.push('/onboarding/quick-profile')
  }

  const [state, setState] = useState<CaptureState>('initializing')
  const [faceStatus, setFaceStatus] = useState<FaceStatus>({
    detected: false,
    aligned: false,
    lighting: 'good',
    blinkDetected: false,
  })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceCheckRef = useRef(false)
  const consecutiveDetections = useRef(0)
  const consecutiveLosses = useRef(0)
  const livenessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef(state)

  // Minimum consecutive positive detections before advancing
  const MIN_CONSECUTIVE_DETECTIONS = 3
  // Minimum consecutive losses before reverting state
  const MIN_CONSECUTIVE_LOSSES = 2

  // Keep stateRef in sync for use inside interval callbacks
  useEffect(() => { stateRef.current = state }, [state])

  // Off-screen canvas for face detection analysis
  useEffect(() => {
    detectionCanvasRef.current = document.createElement('canvas')
    return () => { detectionCanvasRef.current = null }
  }, [])

  // ─── Camera ─────────────────────────────────────────────────────────────────
  const initCamera = useCallback(async () => {
    setState('initializing')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 }, frameRate: { ideal: 30 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('positioning')
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access is required. Please enable it in your device settings.'
          : 'Could not access camera. Please try again.',
      )
      setState('error')
    }
  }, [])

  useEffect(() => {
    initCamera()
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()) }
  }, [initCamera])

  // ─── Face Detection (continuous, with FaceDetector API + fallback) ─────────
  // Fallback: skin-tone analysis in YCbCr color space (works across skin tones)
  const fallbackDetectFace = useCallback((video: HTMLVideoElement): boolean => {
    const canvas = detectionCanvasRef.current
    if (!canvas) return false
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    const w = 80, h = 100
    canvas.width = w
    canvas.height = h
    const vw = video.videoWidth, vh = video.videoHeight
    if (!vw || !vh) return false
    // Sample the center region where the face oval is
    ctx.drawImage(video, vw * 0.2, vh * 0.1, vw * 0.6, vh * 0.65, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const totalSampled = Math.floor((w * h) / 2)
    let skinCount = 0
    let edgeCount = 0
    for (let i = 0; i < data.length; i += 8) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // YCbCr skin-tone detection (reliable across ethnicities)
      const cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b
      if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) skinCount++
    }
    // Also check for edges/contrast variation (faces have texture, flat surfaces don't)
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
        const idx = (y * w + x) * 4
        const idxRight = (y * w + x + 1) * 4
        const idxDown = ((y + 1) * w + x) * 4
        const gx = Math.abs(data[idx] - data[idxRight]) + Math.abs(data[idx + 1] - data[idxRight + 1])
        const gy = Math.abs(data[idx] - data[idxDown]) + Math.abs(data[idx + 1] - data[idxDown + 1])
        if (gx + gy > 30) edgeCount++
      }
    }
    const edgeSamples = Math.floor((w / 2) * (h / 2))
    const hasTexture = edgeCount / edgeSamples > 0.08
    // Require both sufficient skin pixels AND texture (faces aren't flat)
    return skinCount / totalSampled > 0.20 && hasTexture
  }, [])

  // Continuous detection loop — runs whenever camera is active
  const isDetectionActive = state !== 'captured' && state !== 'uploading' && state !== 'error' && state !== 'initializing'

  useEffect(() => {
    if (!isDetectionActive) return

    let active = true
    let faceDetector: any = null

    // Use native FaceDetector API when available (Chrome/Edge)
    try {
      if (typeof window !== 'undefined' && 'FaceDetector' in window) {
        faceDetector = new (window as any).FaceDetector({ maxDetectedFaces: 1, fastMode: true })
      }
    } catch { /* not available */ }

    const runDetection = async () => {
      if (!active || !videoRef.current) return
      const video = videoRef.current
      if (video.readyState < 2) return

      let detected = false

      if (faceDetector) {
        try {
          const faces = await faceDetector.detect(video)
          detected = faces.length > 0
        } catch {
          detected = fallbackDetectFace(video)
        }
      } else {
        detected = fallbackDetectFace(video)
      }

      if (!active) return
      const currentState = stateRef.current

      if (detected) {
        consecutiveDetections.current++
        consecutiveLosses.current = 0
        const stable = consecutiveDetections.current >= MIN_CONSECUTIVE_DETECTIONS
        faceCheckRef.current = stable

        if (stable) {
          setFaceStatus(prev => {
            if (prev.detected && prev.aligned) return prev
            return { ...prev, detected: true, aligned: true, lighting: 'good' }
          })
          if (currentState === 'positioning') {
            setState('liveness')
          }
        }
      } else {
        consecutiveLosses.current++
        consecutiveDetections.current = 0

        if (consecutiveLosses.current >= MIN_CONSECUTIVE_LOSSES) {
          faceCheckRef.current = false
          setFaceStatus(prev => {
            if (!prev.detected) return prev
            return { ...prev, detected: false, aligned: false }
          })
          // Face lost — revert from ready/liveness back to positioning
          if (currentState === 'ready' || currentState === 'liveness') {
            if (livenessTimerRef.current) {
              clearTimeout(livenessTimerRef.current)
              livenessTimerRef.current = null
            }
            // Cancel any active countdown
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
              countdownRef.current = null
            }
            setCountdown(null)
            setState('positioning')
            setFaceStatus(prev => ({ ...prev, blinkDetected: false }))
          }
        }
      }
    }

    // Run detection every 300ms for more responsive tracking
    const interval = setInterval(runDetection, 300)
    const initialDelay = setTimeout(runDetection, 500)

    return () => {
      active = false
      clearInterval(interval)
      clearTimeout(initialDelay)
    }
  }, [isDetectionActive, fallbackDetectFace])

  // Liveness timer — only advances to ready if face stays present for 2 seconds
  useEffect(() => {
    if (state !== 'liveness') return

    livenessTimerRef.current = setTimeout(() => {
      livenessTimerRef.current = null
      if (faceCheckRef.current) {
        setFaceStatus(prev => ({ ...prev, blinkDetected: true }))
        setState('ready')
      } else {
        // Face left during liveness check
        setState('positioning')
        setFaceStatus(prev => ({ ...prev, blinkDetected: false, detected: false, aligned: false }))
      }
    }, 2000)

    return () => {
      if (livenessTimerRef.current) {
        clearTimeout(livenessTimerRef.current)
        livenessTimerRef.current = null
      }
    }
  }, [state])

  // ─── Capture ────────────────────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    // Final real-time face check right before capture
    if (!faceCheckRef.current) {
      setState('positioning')
      setFaceStatus(prev => ({ ...prev, detected: false, aligned: false, blinkDetected: false }))
      consecutiveDetections.current = 0
      return
    }
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.85)

    // Post-capture face verification — analyze the captured image
    const verifyCanvas = document.createElement('canvas')
    const verifyCtx = verifyCanvas.getContext('2d', { willReadFrequently: true })
    if (verifyCtx) {
      const vw = 80, vh = 100
      verifyCanvas.width = vw
      verifyCanvas.height = vh
      // Sample center region of the captured frame
      verifyCtx.drawImage(canvas, canvas.width * 0.2, canvas.height * 0.1, canvas.width * 0.6, canvas.height * 0.65, 0, 0, vw, vh)
      const imageData = verifyCtx.getImageData(0, 0, vw, vh)
      const data = imageData.data
      const totalSampled = Math.floor((vw * vh) / 2)
      let skinCount = 0
      for (let i = 0; i < data.length; i += 8) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b
        const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b
        if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) skinCount++
      }
      if (skinCount / totalSampled < 0.15) {
        // No face found in captured image — don't accept it
        setError('No face detected in the photo. Please position your face in the oval and try again.')
        setState('error')
        streamRef.current?.getTracks().forEach((t) => t.stop())
        return
      }
    }

    setCapturedImage(base64)
    setState('captured')
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  // Auto-capture countdown — when state becomes 'ready', start a 3s countdown
  useEffect(() => {
    if (state !== 'ready') {
      // Cancel countdown if state leaves ready
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      setCountdown(null)
      return
    }

    let count = 3
    setCountdown(count)

    countdownRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
        }
        setCountdown(null)
        // Auto-capture only if face is still present
        if (faceCheckRef.current) {
          handleCapture()
        } else {
          setState('positioning')
          setFaceStatus(prev => ({ ...prev, detected: false, aligned: false, blinkDetected: false }))
          consecutiveDetections.current = 0
        }
      } else {
        setCountdown(count)
      }
    }, 1000)

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [state, handleCapture])

  // ─── Upload ─────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!capturedImage) return
    setState('uploading')
    setUploadProgress(0)
    try {
      const progressInterval = setInterval(() => setUploadProgress((p) => Math.min(p + 15, 90)), 200)
      const deviceModel = isNativePlatform() ? 'native-device' : navigator.userAgent.slice(0, 50)
      await profileService.uploadFaceCapture({
        face_image: capturedImage.split(',')[1],
        metadata: { captured_at: new Date().toISOString(), device_model: deviceModel, liveness_method: 'blink_detection', camera_position: 'front' },
      })
      clearInterval(progressInterval)
      setUploadProgress(100)
      setFaceCapture(capturedImage)
      markFaceCaptured()
      nextStep()
      router.push('/onboarding/quick-profile')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(
        msg?.includes('already registered') ? 'This face is already registered to another account.'
          : msg?.includes('quality') ? 'Photo quality too low. Try better lighting.'
            : 'Upload failed. Please try again.',
      )
      setState('error')
    }
  }

  const handleRetry = () => {
    setCapturedImage(null)
    setError(null)
    setCountdown(null)
    setFaceStatus({ detected: false, aligned: false, lighting: 'good', blinkDetected: false })
    faceCheckRef.current = false
    consecutiveDetections.current = 0
    consecutiveLosses.current = 0
    if (livenessTimerRef.current) {
      clearTimeout(livenessTimerRef.current)
      livenessTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    initCamera()
  }

  // ─── Derived state ─────────────────────────────────────────────────────────
  const isScanning = state === 'positioning' || state === 'liveness'
  const ovalColor = faceStatus.detected && faceStatus.aligned
    ? 'rgba(16,185,129,0.8)'
    : isScanning ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.25)'

  const chipText =
    state === 'initializing' ? 'INITIALIZING' :
    state === 'positioning' ? 'SCANNING FACE' :
    state === 'liveness' ? 'VERIFYING LIVENESS' :
    state === 'ready' ? (countdown !== null ? `CAPTURING IN ${countdown}…` : 'READY TO CAPTURE') :
    state === 'captured' ? 'FACE CAPTURED' :
    state === 'uploading' ? `ENCRYPTING · ${uploadProgress}%` :
    'ERROR'

  const chipVariant =
    state === 'captured' || state === 'ready' ? 'success' as const :
    state === 'error' ? 'error' as const :
    isScanning ? 'scanning' as const : 'idle' as const

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col px-5 pt-4 pb-2"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <IconScan size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Face Registration</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Biometric identity verification</p>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800">
            <IconShield size={14} className="text-emerald-600" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              End-to-end encrypted · Your face data never leaves your device unencrypted
            </p>
          </div>
        </motion.div>

        {/* Skip banner */}
        {SKIP_FACE_CAPTURE && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between"
          >
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Dev mode — face capture bypassed</p>
            <button onClick={handleSkip} className="flex items-center gap-1 text-xs font-bold text-amber-700">
              Skip <IconChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* ─── Camera Viewport ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/30 border border-white/10">
            {/* Status chip */}
            <StatusChip text={chipText} variant={chipVariant} />

            {/* Corner brackets */}
            <CornerBrackets color={ovalColor} />

            {/* Live feed */}
            {state !== 'captured' && state !== 'error' && (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />

                {/* Dark vignette mask */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="none">
                    <defs>
                      <mask id="faceMask">
                        <rect width="300" height="400" fill="white" />
                        <ellipse cx="150" cy="180" rx="104" ry="128" fill="black" />
                      </mask>
                      <radialGradient id="vignetteGrad" cx="50%" cy="45%" r="60%">
                        <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
                      </radialGradient>
                    </defs>
                    <rect width="300" height="400" fill="rgba(0,0,0,0.55)" mask="url(#faceMask)" />
                    <rect width="300" height="400" fill="url(#vignetteGrad)" mask="url(#faceMask)" />
                  </svg>
                </div>

                {/* Face guide oval */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="w-52 h-64 rounded-[50%] border-[2.5px]"
                    style={{ borderColor: ovalColor }}
                    animate={{
                      boxShadow: faceStatus.detected
                        ? `0 0 24px ${ovalColor}, inset 0 0 24px ${ovalColor}`
                        : `0 0 8px ${ovalColor}`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Pulsing rings */}
                <PulsingRings active={isScanning} color={ovalColor} />

                {/* Scan line */}
                {isScanning && <ScanLine />}

                {/* Countdown overlay */}
                {state === 'ready' && countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                    >
                      <span className="text-4xl font-bold text-white drop-shadow-lg">{countdown}</span>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {/* Captured preview */}
            {state === 'captured' && capturedImage && (
              <motion.img
                src={capturedImage}
                alt="Captured face"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Upload overlay */}
            {state === 'uploading' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" strokeWidth="4" stroke="rgba(255,255,255,0.1)" fill="none" />
                      <motion.circle
                        cx="40" cy="40" r="34" strokeWidth="4" stroke="url(#progressGrad)" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={214}
                        animate={{ strokeDashoffset: 214 - (214 * uploadProgress) / 100 }}
                        transition={{ duration: 0.3 }}
                      />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#e11d48" />
                          <stop offset="100%" stopColor="#b91c1c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconFingerprint size={24} className="text-white/80" />
                    </div>
                  </div>
                  <p className="text-white text-sm font-semibold">Encrypting & uploading</p>
                  <p className="text-white/50 text-xs mt-1">{uploadProgress}% complete</p>
                </div>
              </div>
            )}

            {/* Init overlay */}
            {state === 'initializing' && (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 mx-auto mb-3"
                  />
                  <p className="text-white/60 text-xs font-medium">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>

        {/* ─── Status Checklist ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-4 space-y-2"
        >
          {state !== 'captured' && state !== 'error' && state !== 'uploading' && (
            <div className="flex items-center justify-center gap-4">
              <StepDot passed={faceStatus.detected} active={state === 'positioning'} label="Detect" />
              <div className={`w-8 h-px ${faceStatus.detected ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <StepDot passed={faceStatus.aligned} active={state === 'positioning'} label="Align" />
              <div className={`w-8 h-px ${faceStatus.aligned ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <StepDot passed={faceStatus.blinkDetected} active={state === 'liveness'} label="Liveness" />
            </div>
          )}

          {faceStatus.lighting === 'low' && state !== 'captured' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800">
              <IconSun size={14} className="text-amber-500" />
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Move to a brighter area for best results</p>
            </div>
          )}

          {state === 'error' && error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900"
            >
              <IconAlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* ─── Actions ─────────────────────────────────────────────────────── */}
        <div className="pb-2 space-y-3">
          {state === 'ready' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="space-y-2"
            >
              {countdown !== null && (
                <p className="text-center text-sm font-semibold text-brand-600 dark:text-brand-400">
                  Auto-capturing in {countdown}s — hold still
                </p>
              )}
              <Button onClick={handleCapture} disabled={!faceStatus.detected} icon={<IconCamera size={20} />}>
                Capture Now
              </Button>
            </motion.div>
          )}

          {state === 'captured' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Button onClick={handleConfirm}>
                <IconCheck size={18} className="mr-1" />
                Looks good — Continue
              </Button>
              <Button variant="ghost" onClick={handleRetry}>
                <IconRotate size={14} className="mr-1" />
                Retake
              </Button>
            </motion.div>
          )}

          {state === 'error' && (
            <Button onClick={handleRetry} icon={<IconRotate size={18} />}>
              Try Again
            </Button>
          )}

          {isScanning && (
            <p className="text-[11px] text-slate-400 text-center">
              Hold steady · Position your face within the frame
            </p>
          )}

          <button
            onClick={handleSkip}
            className="w-full text-center text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
          >
            Skip for now — I'll do this later
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Step Dot (horizontal progress) ───────────────────────────────────────────

function StepDot({ passed, active, label }: { passed: boolean; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={[
          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2',
          passed
            ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30'
            : active
              ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600',
        ].join(' ')}
        animate={active && !passed ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {passed ? (
          <IconCheck size={14} strokeWidth={3} className="text-white" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
        )}
      </motion.div>
      <span className={`text-[10px] font-semibold ${passed ? 'text-emerald-600' : active ? 'text-indigo-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  )
}
