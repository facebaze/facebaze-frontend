'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  keyId: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
}

const variants = {
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
  },
  left: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
  },
  right: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 12 },
  },
  fade: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
}

/**
 * Smooth page transitions — supports multiple directions.
 * Respects prefers-reduced-motion via framer-motion defaults.
 */
export function PageTransition({ children, keyId, direction = 'up' }: PageTransitionProps) {
  const v = variants[direction]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

