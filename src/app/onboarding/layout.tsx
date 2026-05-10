'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconCheck } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'

const STEPS = [
  { key: 'consent', label: 'Consent', description: 'Review data policy' },
  { key: 'face-capture', label: 'Face Setup', description: 'Register your face' },
  { key: 'quick-profile', label: 'Profile', description: 'Your info' },
  { key: 'permission-mode', label: 'Permissions', description: 'Scan preferences' },
]

/**
 * Onboarding layout — progress stepper, requires authentication.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const { stepIndex, currentStep } = useOnboardingStore()
  const pathname = usePathname()

  // Derive step from URL for accurate visual display
  const pathSegment = pathname?.split('/').pop() || ''
  const PATH_STEP_MAP: Record<string, number> = {
    'consent': 0, 'face-capture': 1, 'quick-profile': 2, 'permission-mode': 3, 'complete': 4,
  }
  const displayStepIndex = PATH_STEP_MAP[pathSegment] ?? stepIndex
  const isCompletePage = pathSegment === 'complete'

  useEffect(() => {
    if (!isInitialized) return
    if (!isAuthenticated) {
      router.replace('/auth/welcome')
      return
    }
    // Non-customer roles should never see onboarding
    const skipRoles = ['vendor', 'admin', 'super_admin', 'organizer']
    if (skipRoles.includes(user?.role ?? '')) {
      router.replace('/')
    }
  }, [isAuthenticated, isInitialized, user?.role, router])

  // Route protection — prevent skipping ahead
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || isCompletePage) return
    if (displayStepIndex > stepIndex) {
      router.replace(`/onboarding/${currentStep}`)
    }
  }, [displayStepIndex, stepIndex, isInitialized, isAuthenticated, currentStep, router, isCompletePage])

  if (!isInitialized || !isAuthenticated) return null

  // Don't show stepper on completion page
  if (isCompletePage) {
    return (
      <main className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
        <div className="flex-1 flex flex-col px-6 pb-safe-bottom">
          {children}
        </div>
      </main>
    )
  }

  const progress = ((displayStepIndex + 1) / STEPS.length) * 100
  const canGoBack = displayStepIndex > 0

  const handleBack = () => {
    if (!canGoBack) return
    const prevStep = STEPS[displayStepIndex - 1]
    if (prevStep) {
      router.push(`/onboarding/${prevStep.key}`)
    }
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Stepper Header */}
      <div className="pt-safe-top px-5 pt-4 pb-3 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #b91c1c, #e11d48)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Back button + Step info + Step dots */}
        <div className="flex items-center gap-3">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
              aria-label="Go back"
            >
              <IconArrowLeft size={18} className="text-slate-600 dark:text-slate-400" stroke={1.5} />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              Step {displayStepIndex + 1} of {STEPS.length}
            </p>
            <h2 className="text-caption font-bold text-slate-900 dark:text-white truncate">
              {STEPS[displayStepIndex]?.label}
            </h2>
          </div>

          {/* Compact step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((step, i) => {
              const isCompleted = i < displayStepIndex
              const isActive = i === displayStepIndex
              return (
                <div
                  key={step.key}
                  className={`rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'w-5 h-5 bg-brand-600 flex items-center justify-center'
                      : isActive
                        ? 'w-5 h-5 bg-brand-600 ring-2 ring-brand-200 dark:ring-brand-900 flex items-center justify-center'
                        : 'w-2 h-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  {isCompleted && <IconCheck size={12} className="text-white" strokeWidth={3} />}
                  {isActive && (
                    <span className="text-[9px] font-bold text-white">{i + 1}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-safe-bottom overflow-y-auto">
        {children}
      </div>
    </main>
  )
}
