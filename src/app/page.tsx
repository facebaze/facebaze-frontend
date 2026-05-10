'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { profileService } from '@/services/profile.service'

/**
 * Root page — smart redirect based on auth + onboarding state.
 */
export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuthStore()
  const { currentStep } = useOnboardingStore()

  useEffect(() => {
    if (!isInitialized) return

    if (!isAuthenticated) {
      router.replace('/auth/welcome')
      return
    }

    const user = useAuthStore.getState().user

    // Non-customer roles skip onboarding entirely
    const skipOnboarding = ['vendor', 'admin', 'super_admin', 'organizer'].includes(user?.role ?? '')

    const routeToApp = () => {
      switch (user?.role) {
        case 'vendor':
          router.replace('/vendor/dashboard')
          break
        case 'admin':
        case 'super_admin':
          router.replace('/admin/dashboard')
          break
        case 'organizer':
          router.replace('/organiser/dashboard')
          break
        default:
          router.replace('/main/home')
      }
    }

    if (skipOnboarding || currentStep === 'complete') {
      routeToApp()
    } else {
      // Check backend profile — if user already has a name, they completed onboarding before
      profileService.getMyProfile().then((profile) => {
        if (profile && profile.full_name && profile.full_name.trim() !== '') {
          // Profile exists with a name — mark onboarding complete and go to app
          useOnboardingStore.getState().setStep('complete')
          routeToApp()
        } else {
          // Truly new user or incomplete profile — go to onboarding
          router.replace(`/onboarding/${currentStep}`)
        }
      }).catch(() => {
        // API error — fallback to onboarding step
        router.replace(`/onboarding/${currentStep}`)
      })
    }
  }, [isAuthenticated, isInitialized, currentStep, router])

  // Splash screen while determining state
  return (
    <div className="flex-1 flex items-center justify-center bg-brand-950 h-full">
      <div className="animate-pulse-soft">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          className="text-white"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M32 16C23.163 16 16 23.163 16 32s7.163 16 16 16 16-7.163 16-16S40.837 16 32 16z"
            fill="currentColor"
            opacity="0.1"
          />
          <circle cx="26" cy="28" r="2" fill="currentColor" />
          <circle cx="38" cy="28" r="2" fill="currentColor" />
          <path
            d="M25 36c0 0 3 4 7 4s7-4 7-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
