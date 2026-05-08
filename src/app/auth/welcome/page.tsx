'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth.store'
import { IconScan, IconArrowRight, IconUsers, IconBuildingStore, IconShieldCheck, IconBolt, IconDeviceMobile } from '@tabler/icons-react'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="relative flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white dark:from-brand-950/30 dark:via-slate-950 dark:to-slate-950" />

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-safe-top">
        {/* Hero */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <IconScan size={32} className="text-white" stroke={1.5} />
            </div>
          </motion.div>

          <motion.h1
            className="mt-6 text-3xl font-bold text-slate-900 dark:text-white text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            FaceBase
          </motion.h1>
          <motion.p
            className="mt-2 text-body text-slate-500 dark:text-slate-400 text-center max-w-[280px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your face is your business card. Network smarter at events.
          </motion.p>

          {/* Benefits row */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: IconBolt, label: '3s Scan' },
              { icon: IconShieldCheck, label: 'Consent First' },
              { icon: IconDeviceMobile, label: 'Mobile Ready' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center">
                  <Icon size={18} className="text-brand-600 dark:text-brand-400" stroke={1.5} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Role selection cards */}
        <motion.div
          className="pb-8 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-4">
            I want to
          </p>

          {/* Attendee card */}
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
              <IconUsers size={22} className="text-blue-600 dark:text-blue-400" stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-caption font-bold text-slate-900 dark:text-white">
                Attend Events
              </h3>
              <p className="text-tiny text-slate-500 dark:text-slate-400 mt-0.5">
                Discover events, scan faces, exchange contacts instantly
              </p>
            </div>
            <IconArrowRight size={18} className="text-slate-400 shrink-0" />
          </button>

          {/* Vendor card */}
          <button
            onClick={() => router.push('/auth/vendor/signup')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
              <IconBuildingStore size={22} className="text-amber-600 dark:text-amber-400" stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-caption font-bold text-slate-900 dark:text-white">
                Exhibit / Vendor
              </h3>
              <p className="text-tiny text-slate-500 dark:text-slate-400 mt-0.5">
                Capture leads with face recognition at your booth
              </p>
            </div>
            <IconArrowRight size={18} className="text-slate-400 shrink-0" />
          </button>

          {/* Login link */}
          <div className="text-center pt-3 pb-safe-bottom">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-caption text-slate-500 dark:text-slate-400"
            >
              Already have an account?{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-400">Log in</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
