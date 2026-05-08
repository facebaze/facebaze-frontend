'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'

const STEP_LABELS = ['Consent', 'Face', 'Profile', 'Permissions']

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
  const { stepIndex, totalSteps } = useOnboardingStore()

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

  if (!isInitialized || !isAuthenticated) return null

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-surface-primary dark:bg-slate-950 bg-mesh safe-padding relative">
      <div className="absolute inset-0 bg-abstract opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-lines pointer-events-none" />
      {/* Stepper */}
      <div className="pt-safe-top px-8 pt-16 pb-6">
        {/* Step counter */}
        <p className="text-center text-xs font-medium text-white/70 mb-4 tracking-wide">
          STEP {stepIndex + 1} OF {totalSteps}
        </p>
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const isCompleted = i < stepIndex
            const isActive = i === stepIndex
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                {/* Connector + Circle row */}
                <div className="flex items-center w-full">
                  {/* Left connector */}
                  {i > 0 && (
                    <div
                      className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                        i <= stepIndex ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}

                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-white text-brand-600 shadow-lg shadow-white/25'
                        : isActive
                          ? 'bg-white text-brand-600 ring-4 ring-white/30 shadow-lg shadow-white/25 scale-110'
                          : 'bg-white/15 text-white/50 backdrop-blur-sm'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Right connector */}
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                        i < stepIndex ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] mt-2 font-semibold tracking-wide transition-all duration-500 ${
                    isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-safe-bottom">
        {children}
      </div>
    </main>
  )
}
