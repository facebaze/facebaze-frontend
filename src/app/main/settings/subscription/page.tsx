'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconStar, IconCheck, IconBolt } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Plan {
  id: 'free' | 'pro' | 'business'
  name: string
  price: string
  period: string
  badge?: string
  features: string[]
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: [
      '10 scans/month',
      'Basic profile',
      'Event opt-in',
      'Push notifications',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$7.99',
    period: '/mo',
    badge: '⭐',
    highlight: true,
    features: [
      'Unlimited scans',
      'Priority matching',
      'Verified badge ✓',
      'Advanced privacy',
      'Contact export',
      'No ads',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$19.99',
    period: '/mo',
    features: [
      'Everything in Pro',
      'Team accounts (5)',
      'CRM integration',
      'API access',
      'Priority support',
    ],
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [currentPlan] = useState<'free' | 'pro' | 'business'>('free')
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business'>(currentPlan)

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Mock usage stats
  const scansUsed = 5
  const scanLimit = 10

  const handleUpgrade = () => {
    setUpgradeModalOpen(true)
  }

  return (
    <div className="flex-1 px-5 pt-safe-top pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <IconArrowLeft size={22} className="text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-body font-semibold text-slate-900 dark:text-white">Subscription</h1>
      </div>

      {/* Current usage */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-caption text-slate-500 dark:text-slate-400">Current Plan: <span className="font-semibold text-slate-900 dark:text-white capitalize">{currentPlan}</span></p>
        </div>
        <p className="text-tiny text-slate-400 mb-2">
          {scansUsed} of {scanLimit} scans used this month
        </p>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              scansUsed / scanLimit > 0.8 ? 'bg-error' : 'bg-brand-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${(scansUsed / scanLimit) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Plan cards */}
      <div className="space-y-3 mb-6">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={cn(
              'w-full text-left rounded-2xl p-5 border-2 transition-all active:scale-[0.99]',
              selectedPlan === plan.id
                ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/30 shadow-card'
                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-body font-bold text-slate-900 dark:text-white">
                  {plan.name} {plan.badge}
                </h3>
                {plan.highlight && (
                  <span className="text-tiny font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-heading text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-tiny text-slate-400">{plan.period}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-caption text-slate-600 dark:text-slate-400">
                    <IconCheck size={14} className="text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {/* Radio indicator */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4',
                  selectedPlan === plan.id
                    ? 'border-brand-600 bg-brand-600'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                {selectedPlan === plan.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Upgrade CTA */}
      {selectedPlan !== currentPlan && (
        <Button onClick={handleUpgrade} icon={<IconBolt size={16} />}>
          Upgrade to {PLANS.find((p) => p.id === selectedPlan)?.name}
        </Button>
      )}

      <p className="text-center text-tiny text-slate-400 mt-4">
        Cancel anytime. Billed monthly.
      </p>

      {/* Upgrade coming-soon overlay */}
      {upgradeModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setUpgradeModalOpen(false)}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full mx-auto mb-4">
              <IconStar size={24} className="text-brand-600" />
            </div>
            <h3 className="text-body font-bold text-center text-slate-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-caption text-center text-slate-500 dark:text-slate-400 mb-5">
              Premium plans with in-app purchase will be available soon. We&apos;ll notify you when upgrades are ready.
            </p>
            <Button onClick={() => setUpgradeModalOpen(false)}>
              Got it
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
