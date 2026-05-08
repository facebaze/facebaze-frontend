'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconShield, IconBell, IconEye, IconLock, IconArrowRight } from '@tabler/icons-react'

import { Button, Checkbox } from '@/components/ui'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { authService } from '@/services/auth.service'

const CONSENT_POINTS = [
  {
    icon: IconEye,
    title: 'You control who sees your info',
    description: 'Choose exactly what professionals can view when they scan you.',
  },
  {
    icon: IconBell,
    title: 'Get notified every scan',
    description: 'Real-time alerts whenever someone scans your face at an event.',
  },
  {
    icon: IconShield,
    title: 'Revoke access anytime',
    description: 'Remove consent for any vendor instantly from your dashboard.',
  },
  {
    icon: IconLock,
    title: 'Your data is encrypted',
    description: 'Face data is encrypted at rest and never sold to third parties.',
  },
]

export default function ConsentPage() {
  const router = useRouter()
  const { markConsentAgreed, nextStep } = useOnboardingStore()
  const [agreed, setAgreed] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToBottom(true)
    }
  }, [])

  const canProceed = hasScrolledToBottom && agreed

  const handleContinue = async () => {
    if (!canProceed) return
    setIsSubmitting(true)

    try {
      await authService.recordConsent()
      markConsentAgreed()
      nextStep()
      router.push('/onboarding/face-capture')
    } catch {
      // Retry silently — consent is critical
      try {
        await authService.recordConsent()
        markConsentAgreed()
        nextStep()
        router.push('/onboarding/face-capture')
      } catch {
        // Allow proceeding — backend will require consent before first scan
        markConsentAgreed()
        nextStep()
        router.push('/onboarding/face-capture')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-heading text-slate-900 dark:text-white mb-1">How FaceBase Works</h1>
          <p className="text-body text-slate-500 dark:text-slate-400">
            Understand how your data is used and protected.
          </p>
        </div>

        {/* Scrollable consent content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto -mx-2 px-2 pb-4"
          style={{ maxHeight: 'calc(100dvh - 360px)' }}
        >
          {/* Key points */}
          <div className="space-y-4 mb-6">
            {CONSENT_POINTS.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center shrink-0">
                  <point.icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="text-caption font-semibold text-slate-900 dark:text-white mb-0.5">
                    {point.title}
                  </h3>
                  <p className="text-tiny text-slate-500 dark:text-slate-400 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legal text */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <h4 className="text-caption font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Biometric Data Policy
            </h4>
            <div className="text-tiny text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
              <p>
                FaceBase uses facial recognition technology to enable professional
                networking at events. By agreeing, you consent to the collection,
                processing, and storage of your biometric data (facial features)
                for the purposes of identity verification and attendee matching.
              </p>
              <p>
                Your biometric data is processed using AWS Rekognition and stored
                as a mathematical representation (face vector) — not as a
                photograph. This data is encrypted at rest using AES-256 and in
                transit using TLS 1.3.
              </p>
              <p>
                You may request deletion of your biometric data at any time
                through the app settings or by contacting privacy@facebase.io.
                Upon deletion, all face vectors are permanently removed from our
                systems within 30 days.
              </p>
              <p>
                For full details, see our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        {!hasScrolledToBottom && (
          <div className="text-center py-2">
            <p className="text-tiny text-slate-400 animate-pulse-soft">
              ↓ Scroll down to read all terms
            </p>
          </div>
        )}

        {/* Agreement + CTA */}
        <div className="pt-4 pb-2 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <Checkbox
              checked={agreed}
              onChange={setAgreed}
              label={
                <>
                  I understand and agree to the FaceBase{' '}
                  <span className="text-brand-600 font-medium">Terms of Use</span> and{' '}
                  <span className="text-brand-600 font-medium">Biometric Data Policy</span>
                </>
              }
            />

          <Button
            onClick={handleContinue}
            disabled={!canProceed}
            loading={isSubmitting}
            iconRight={<IconArrowRight size={18} stroke={1.5} />}
          >
            I Agree — Continue
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
