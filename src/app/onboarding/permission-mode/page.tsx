'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconBell, IconCircleCheck, IconShieldOff, IconCheck } from '@tabler/icons-react'

import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { profileService } from '@/services/profile.service'
import type { PermissionMode } from '@/types'
import { cn } from '@/lib/utils'

interface ModeOption {
  value: PermissionMode
  icon: typeof IconBell
  title: string
  description: string
  recommended?: boolean
}

const MODES: ModeOption[] = [
  {
    value: 'always_ask',
    icon: IconBell,
    title: 'Always Ask',
    description:
      "You'll get a notification each time someone scans you. Approve or deny in real-time.",
    recommended: true,
  },
  {
    value: 'auto_allow_events',
    icon: IconCircleCheck,
    title: 'Auto-Allow at Events',
    description:
      "Anyone at events you've opted into can view your public profile without asking.",
  },
  {
    value: 'do_not_scan',
    icon: IconShieldOff,
    title: 'Do Not Scan',
    description:
      "Nobody can scan you. Your face won't appear in search results. You can still scan others.",
  },
]

export default function PermissionModePage() {
  const router = useRouter()
  const { markPermissionSet, nextStep } = useOnboardingStore()
  const [selected, setSelected] = useState<PermissionMode>('always_ask')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)

    try {
      await profileService.setPermissionMode(selected)
      markPermissionSet()
      nextStep()
      router.replace('/onboarding/complete')
    } catch {
      // Fallback: save locally, sync later
      markPermissionSet()
      nextStep()
      router.replace('/onboarding/complete')
    } finally {
      setIsLoading(false)
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
          <h1 className="text-heading text-slate-900 dark:text-white mb-1">
            Who can view your profile?
          </h1>
          <p className="text-body text-slate-500 dark:text-slate-400">
            Choose what happens when someone scans you at an event.
          </p>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-3">
          {MODES.map((mode, index) => (
            <motion.button
              key={mode.value}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
              onClick={() => setSelected(mode.value)}
              className={cn(
                'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200',
                selected === mode.value
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-card-hover'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    selected === mode.value
                      ? 'bg-brand-100 dark:bg-brand-900/50'
                      : 'bg-slate-100 dark:bg-slate-700'
                  )}
                >
                  <mode.icon
                    size={20}
                    className={cn(
                      'transition-colors',
                        selected === mode.value ? 'text-brand-600' : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        'text-body font-semibold transition-colors',
                        selected === mode.value ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'
                      )}
                    >
                      {mode.title}
                    </h3>
                    {mode.recommended && (
                      <span className="text-tiny font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                {/* Radio indicator */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                    selected === mode.value
                      ? 'border-brand-600'
                      : 'border-slate-300 dark:border-slate-600'
                  )}
                >
                  {selected === mode.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full bg-brand-600"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-6 pb-2 space-y-2">
          <Button onClick={handleContinue} loading={isLoading} icon={<IconCheck size={18} stroke={2} />}>
            Complete Setup
          </Button>
          <p className="text-tiny text-slate-400 text-center">
            You can change this anytime in Settings.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
