'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconCircleCheck, IconSparkles, IconArrowRight } from '@tabler/icons-react'

import { Button } from '@/components/ui'

export default function OnboardingCompletePage() {
  const router = useRouter()

  // Auto-redirect after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't auto-redirect — let user enjoy the moment
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative mb-8"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-success/20 blur-2xl scale-150" />

        <div className="relative w-24 h-24 rounded-full bg-success flex items-center justify-center">
          <IconCircleCheck size={48} className="text-white" stroke={1.5} />
        </div>

        {/* Sparkle decorations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <IconSparkles size={20} className="text-warning" stroke={1.5} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute -bottom-1 -left-3"
        >
          <IconSparkles size={16} className="text-brand-400" stroke={1.5} />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <h1 className="text-display text-slate-900 dark:text-white mb-3">You're all set!</h1>
        <p className="text-body text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto text-balance">
          Your face is registered. You're ready to network smarter at events.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm"
      >
        <Button onClick={() => router.replace('/main/home')} iconRight={<IconArrowRight size={18} stroke={1.5} />}>
          Explore FaceBase
        </Button>
      </motion.div>
    </div>
  )
}
