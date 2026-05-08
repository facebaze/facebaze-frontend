'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Branded splash screen — shown during app cold start.
 * Features animated logo, gradient background, and pulsing ring.
 */
export function SplashScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-950',
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-400/20 blur-3xl animate-pulse-soft" />
        {/* Abstract diagonal lines */}
        <div className="absolute inset-0 bg-lines opacity-40" />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Pulsing ring */}
        <motion.div
          className="absolute w-28 h-28 rounded-full border-2 border-white/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo container */}
        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-glow-lg">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="text-white"
          >
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <circle cx="15" cy="17" r="1.5" fill="currentColor" />
            <circle cx="25" cy="17" r="1.5" fill="currentColor" />
            <path
              d="M14 25c0 0 3 3.5 6 3.5s6-3.5 6-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 14C8 14 12 8 20 8s12 6 12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            FaceBase
          </h1>
        </motion.div>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
