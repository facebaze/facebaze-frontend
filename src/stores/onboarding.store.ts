/**
 * Onboarding Store — Tracks multi-step onboarding progress.
 * Persists current step to survive app kills during onboarding.
 */

import { create } from 'zustand'
import { secureStorage } from '@/lib/storage'

export type OnboardingStep = 'consent' | 'face-capture' | 'quick-profile' | 'permission-mode' | 'complete'

const STEP_ORDER: OnboardingStep[] = [
  'consent',
  'face-capture',
  'quick-profile',
  'permission-mode',
  'complete',
]

interface OnboardingState {
  // State
  currentStep: OnboardingStep
  stepIndex: number
  totalSteps: number
  consentAgreed: boolean
  faceCaptured: boolean
  profileCreated: boolean
  permissionSet: boolean
  capturedFaceBase64: string | null

  // Actions
  initialize: () => Promise<void>
  setStep: (step: OnboardingStep) => void
  nextStep: () => void
  markConsentAgreed: () => void
  setFaceCapture: (base64: string) => void
  markFaceCaptured: () => void
  markProfileCreated: () => void
  markPermissionSet: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'consent',
  stepIndex: 0,
  totalSteps: 4, // Don't count 'complete' as a step
  consentAgreed: false,
  faceCaptured: false,
  profileCreated: false,
  permissionSet: false,
  capturedFaceBase64: null,

  initialize: async () => {
    const savedStep = await secureStorage.getItem(secureStorage.keys.ONBOARDING_STEP)
    if (savedStep && STEP_ORDER.includes(savedStep as OnboardingStep)) {
      const step = savedStep as OnboardingStep
      set({
        currentStep: step,
        stepIndex: STEP_ORDER.indexOf(step),
      })
    }
  },

  setStep: (step) => {
    const index = STEP_ORDER.indexOf(step)
    set({ currentStep: step, stepIndex: index })
    secureStorage.setItem(secureStorage.keys.ONBOARDING_STEP, step)
  },

  nextStep: () => {
    const { stepIndex } = get()
    const nextIndex = Math.min(stepIndex + 1, STEP_ORDER.length - 1)
    const nextStep = STEP_ORDER[nextIndex]
    set({ currentStep: nextStep, stepIndex: nextIndex })
    secureStorage.setItem(secureStorage.keys.ONBOARDING_STEP, nextStep)
  },

  markConsentAgreed: () => set({ consentAgreed: true }),

  setFaceCapture: (base64) => set({ capturedFaceBase64: base64 }),

  markFaceCaptured: () => set({ faceCaptured: true, capturedFaceBase64: null }),

  markProfileCreated: () => set({ profileCreated: true }),

  markPermissionSet: () => set({ permissionSet: true }),

  reset: () => {
    set({
      currentStep: 'consent',
      stepIndex: 0,
      consentAgreed: false,
      faceCaptured: false,
      profileCreated: false,
      permissionSet: false,
      capturedFaceBase64: null,
    })
    secureStorage.removeItem(secureStorage.keys.ONBOARDING_STEP)
  },
}))
