'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconCreditCard,
  IconCheck,
  IconRocket,
  IconBolt,
  IconCrown,
  IconChevronRight,
  IconCalendar,
  IconUsers,
  IconDeviceTablet,
  IconChartBar,
} from '@tabler/icons-react'
import { vendorService, type VendorProfile } from '@/services/vendor.service'

interface PlanFeature {
  label: string
  included: boolean
}

const CURRENT_PLAN = {
  name: 'Starter',
  price: 'Free',
  period: 'forever',
  icon: IconRocket,
  gradient: 'from-slate-500 to-slate-700',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    icon: IconRocket,
    gradient: 'from-slate-500 to-slate-700',
    current: true,
    features: [
      { label: 'Up to 3 events', included: true },
      { label: '50 leads / event', included: true },
      { label: '1 tablet per event', included: true },
      { label: 'Basic analytics', included: true },
      { label: 'Priority support', included: false },
      { label: 'Advanced lead scoring', included: false },
    ] as PlanFeature[],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '₹2,999',
    period: '/ month',
    icon: IconBolt,
    gradient: 'from-brand-500 to-brand-700',
    current: false,
    popular: true,
    features: [
      { label: 'Unlimited events', included: true },
      { label: '500 leads / event', included: true },
      { label: '5 tablets per event', included: true },
      { label: 'Advanced analytics', included: true },
      { label: 'Priority support', included: true },
      { label: 'Advanced lead scoring', included: false },
    ] as PlanFeature[],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    icon: IconCrown,
    gradient: 'from-amber-500 to-amber-700',
    current: false,
    features: [
      { label: 'Unlimited events', included: true },
      { label: 'Unlimited leads', included: true },
      { label: 'Unlimited tablets', included: true },
      { label: 'Custom analytics', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Advanced lead scoring', included: true },
    ] as PlanFeature[],
  },
]

export default function VendorBillingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorService
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Usage stats placeholder
  const usage = {
    events: { used: 2, limit: 3 },
    leads: { used: 47, limit: 50 },
    tablets: { used: 1, limit: 1 },
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Billing & Plan</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Current plan card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <IconRocket size={16} className="text-white/70" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Starter</h2>
            <p className="text-sm text-white/60">Free forever</p>
            {profile && (
              <p className="text-xs text-white/50 mt-2">
                Account: {profile.business_name}
              </p>
            )}
          </div>
        </div>

        {/* Usage meters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Usage This Month</h3>
          <div className="space-y-3">
            <UsageMeter
              icon={<IconCalendar size={14} />}
              label="Events"
              used={usage.events.used}
              limit={usage.events.limit}
            />
            <UsageMeter
              icon={<IconUsers size={14} />}
              label="Leads"
              used={usage.leads.used}
              limit={usage.leads.limit}
            />
            <UsageMeter
              icon={<IconDeviceTablet size={14} />}
              label="Tablets"
              used={usage.tablets.used}
              limit={usage.tablets.limit}
            />
          </div>
        </div>

        {/* Plans */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3 px-1">Available Plans</h3>
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border overflow-hidden ${
                    plan.current
                      ? 'border-brand-200 dark:border-brand-800'
                      : 'border-slate-100/50 dark:border-slate-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-brand-500 text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{plan.price}</span>
                            {plan.period && <span className="ml-0.5">{plan.period}</span>}
                          </p>
                        </div>
                      </div>
                      {plan.current && (
                        <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <div key={f.label} className="flex items-center gap-2">
                          <IconCheck
                            size={13}
                            className={f.included ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
                            stroke={2.5}
                          />
                          <span className={`text-xs ${
                            f.included
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-600 line-through'
                          }`}>
                            {f.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!plan.current && (
                      <button
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          plan.popular
                            ? 'bg-brand-600 text-white active:bg-brand-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700'
                        }`}
                      >
                        {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment history */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <IconChartBar size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Payment History</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">No payments yet</p>
            </div>
            <IconChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/50">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>Coming soon:</strong> Plan upgrades, payment processing, and detailed usage analytics will be available in an upcoming release.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Usage progress bar */
function UsageMeter({
  icon,
  label,
  used,
  limit,
}: {
  icon: React.ReactNode
  label: string
  used: number
  limit: number
}) {
  const pct = Math.min((used / limit) * 100, 100)
  const isHigh = pct >= 80

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          {icon}
          {label}
        </div>
        <span className={`text-xs font-semibold ${
          isHigh ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isHigh ? 'bg-amber-500' : 'bg-brand-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
