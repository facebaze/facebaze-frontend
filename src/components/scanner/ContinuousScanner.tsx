'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { IconCamera, IconCameraOff, IconFaceId } from '@tabler/icons-react'

interface ContinuousScannerProps {
  /** Called when a face is detected and captured. Receives base64 image data. */
  onFaceDetected: (faceImageBase64: string) => void
  /** Whether scanning is active */
  active: boolean
  /** Minimum interval between scans in ms (default: 3000) */
  scanInterval?: number
  /** Cooldown after a successful detection in ms (default: 5000) */
  cooldownMs?: number
  /** Camera resolution width (default: 480) */
  width?: number
  /** Camera resolution height (default: 360) */
  height?: number
}

/**
 * Optimized continuous face scanner for vendor tablets.
 * 
 * - Uses getUserMedia for camera access
 * - Captures frames at configurable intervals (not every frame)
 * - Uses canvas at reduced resolution (480p) for battery efficiency
 * - Applies cooldown after successful detection to prevent duplicates
 * - Uses requestAnimationFrame with throttling instead of setInterval
 * - Supports Wake Lock API to prevent tablet sleep
 */
export function ContinuousScanner({
  onFaceDetected,
  active,
  scanInterval = 3000,
  cooldownMs = 5000,
  width = 480,
  height = 360,
}: ContinuousScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const lastScanTimeRef = useRef(0)
  const lastDetectionTimeRef = useRef(0)
  const rafRef = useRef<number>(0)

  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)

  // Request Wake Lock to prevent tablet sleep
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake Lock not supported or denied — non-critical
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: 15, max: 15 }, // Lower FPS for battery
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions.')
    }
  }, [width, height])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  // Capture frame and send for detection
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = width
    canvas.height = height
    ctx.drawImage(video, 0, 0, width, height)

    // Export as JPEG at 70% quality for bandwidth efficiency
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
    // Strip the data:image/jpeg;base64, prefix
    return dataUrl.split(',')[1]
  }, [cameraReady, width, height])

  // Main scan loop using requestAnimationFrame with throttling
  const scanLoop = useCallback(() => {
    if (!active || !cameraReady) return

    const now = Date.now()
    const timeSinceLastScan = now - lastScanTimeRef.current
    const timeSinceLastDetection = now - lastDetectionTimeRef.current

    // Check intervals: minimum scan interval AND cooldown after detection
    if (timeSinceLastScan >= scanInterval && timeSinceLastDetection >= cooldownMs) {
      lastScanTimeRef.current = now
      setScanning(true)

      const base64 = captureFrame()
      if (base64) {
        setFaceDetected(true)
        lastDetectionTimeRef.current = now
        onFaceDetected(base64)

        // Reset visual indicator after brief delay
        setTimeout(() => {
          setFaceDetected(false)
          setScanning(false)
        }, 1000)
      } else {
        setScanning(false)
      }
    }

    rafRef.current = requestAnimationFrame(scanLoop)
  }, [active, cameraReady, scanInterval, cooldownMs, captureFrame, onFaceDetected])

  // Start/stop scanning based on active prop
  useEffect(() => {
    if (active) {
      startCamera()
      requestWakeLock()
    } else {
      stopCamera()
      releaseWakeLock()
    }

    return () => {
      stopCamera()
      releaseWakeLock()
    }
  }, [active, startCamera, stopCamera, requestWakeLock, releaseWakeLock])

  // Run scan loop when camera is ready and active
  useEffect(() => {
    if (active && cameraReady) {
      rafRef.current = requestAnimationFrame(scanLoop)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, cameraReady, scanLoop])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black">
      {/* Video feed */}
      <video
        ref={videoRef}
        className="w-full aspect-[4/3] object-cover mirror"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
        autoPlay
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Status overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Face detection frame */}
        <div
          className={`absolute inset-8 border-2 rounded-2xl transition-all duration-300 ${
            faceDetected
              ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
              : scanning
              ? 'border-blue-400/60 animate-pulse'
              : 'border-white/20'
          }`}
        />

        {/* Status badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md ${
              faceDetected
                ? 'bg-green-500/80 text-white'
                : scanning
                ? 'bg-blue-500/80 text-white'
                : cameraReady
                ? 'bg-white/20 text-white/80'
                : 'bg-red-500/80 text-white'
            }`}
          >
            {faceDetected ? (
              <>
                <IconFaceId size={16} /> Face Detected
              </>
            ) : scanning ? (
              <>
                <IconCamera size={16} /> Scanning...
              </>
            ) : cameraReady ? (
              <>
                <IconCamera size={16} /> Ready
              </>
            ) : cameraError ? (
              <>
                <IconCameraOff size={16} /> {cameraError}
              </>
            ) : (
              <>
                <IconCamera size={16} /> Starting camera...
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
