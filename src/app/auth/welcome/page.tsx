'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconScan,
  IconArrowRight,
  IconBuildingStore,
  IconShieldCheck,
  IconBolt,
  IconSparkles,
  IconPhone,
  IconMail,
  IconCalendarEvent,
} from '@tabler/icons-react'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="relative flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Background artwork */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-brand-100/40 dark:bg-brand-900/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-7 pt-safe-top">
        {/* ─── Hero — top section ─── */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <IconScan size={26} className="text-white" stroke={1.5} />
          </div>

          <h1 className="mt-4 text-[22px] font-bold text-slate-900 dark:text-white text-center tracking-tight">
            Welcome to FaceBase
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 text-center max-w-[240px] leading-relaxed">
            Discover events, network instantly, and grow your connections.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-5">
            {[
              { icon: IconBolt, label: 'Instant Scan', color: 'text-amber-500' },
              { icon: IconShieldCheck, label: 'Privacy First', color: 'text-emerald-500' },
              { icon: IconSparkles, label: 'AI Matching', color: 'text-violet-500' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={16} className={color} stroke={2} />
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Bottom section — buttons pinned to bottom ─── */}
        <motion.div
          className="space-y-2.5 pb-safe-bottom"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <button
            onClick={() => router.push('/auth/phone')}
            className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 active:scale-[0.98] transition-all text-left shadow-md shadow-brand-600/20"
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <IconPhone size={18} className="text-white" stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-white">Get Started</h3>
              <p className="text-[10px] text-white/65 mt-0.5">Sign up with phone — takes 30 seconds</p>
            </div>
            <IconArrowRight size={16} className="text-white/50 shrink-0" />
          </button>

          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <IconMail size={18} className="text-slate-500 dark:text-slate-300" stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-slate-700 dark:text-white">Continue with Email</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Use email &amp; password instead</p>
            </div>
            <IconArrowRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          </button>

          {/* Login link */}
          <div className="text-center pt-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-[11px] text-slate-400 dark:text-slate-500"
            >
              Already have an account?{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-400">Log in</span>
            </button>
          </div>

          {/* Vendor / Organiser links */}
          <div className="flex items-center justify-center gap-1 pt-4 pb-4">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">I&apos;m a</span>
            <button
              onClick={() => router.push('/auth/vendor/signup')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 active:scale-95 transition-transform"
            >
              <IconBuildingStore size={12} className="text-amber-600 dark:text-amber-400" stroke={2} />
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Vendor</span>
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">or</span>
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/30 active:scale-95 transition-transform"
            >
              <IconCalendarEvent size={12} className="text-violet-600 dark:text-violet-400" stroke={2} />
              <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400">Organiser</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
