'use client'

import { useState, useEffect } from 'react'
import { IconShieldCheck, IconShieldX, IconBuilding, IconMapPin } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui'

interface ConsentRequestData {
  scan_log_id: string
  vendor_id: string
  vendor_name: string
  vendor_logo?: string
  vendor_tagline?: string
  vendor_industry?: string
  event_id: string
  event_name?: string
  timeout: number
}

interface ConsentDialogProps {
  request: ConsentRequestData | null
  onApprove: (scanLogId: string) => void
  onDecline: (scanLogId: string) => void
}

/**
 * Customer consent dialog — shown when a vendor scans the customer's face.
 * Displays vendor business card preview with approve/decline actions.
 * Auto-declines after timeout.
 */
export function ConsentDialog({ request, onApprove, onDecline }: ConsentDialogProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!request) return
    setTimeLeft(request.timeout)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onDecline(request.scan_log_id)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [request, onDecline])

  if (!request) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Dialog */}
        <motion.div
          className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Timeout bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / request.timeout) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                {request.vendor_logo ? (
                  <img
                    src={request.vendor_logo}
                    alt={request.vendor_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <IconBuilding size={32} className="text-blue-600" stroke={1.5} />
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-slate-900 text-center mb-1">
              Share Your Info?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-4">
              <span className="font-medium text-slate-700">{request.vendor_name}</span> scanned your face and wants to connect
            </p>

            {/* Vendor card preview */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <IconBuilding size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{request.vendor_name}</p>
                  {request.vendor_tagline && (
                    <p className="text-xs text-slate-500 truncate">{request.vendor_tagline}</p>
                  )}
                  {request.vendor_industry && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {request.vendor_industry}
                    </span>
                  )}
                </div>
              </div>
              {request.event_name && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200">
                  <IconMapPin size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-500">at {request.event_name}</span>
                </div>
              )}
            </div>

            {/* What gets shared */}
            <div className="text-xs text-slate-500 mb-5 px-2">
              <p className="font-medium text-slate-600 mb-1">What gets shared:</p>
              <ul className="space-y-0.5 list-disc list-inside text-slate-400">
                <li>Your name and profile photo</li>
                <li>Email and phone (if on your profile)</li>
                <li>Company and designation</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => onDecline(request.scan_log_id)}
              >
                <IconShieldX size={18} />
                Decline
              </Button>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => onApprove(request.scan_log_id)}
              >
                <IconShieldCheck size={18} />
                Share
              </Button>
            </div>

            <p className="text-xs text-center text-slate-400 mt-3">
              Auto-declines in {timeLeft}s · You can revoke anytime
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
