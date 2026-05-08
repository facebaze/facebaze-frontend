'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { type Icon } from '@tabler/icons-react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Empty state — shown when there's no data to display.
 * Animated entrance with icon, title, description, and optional CTA.
 */
export function EmptyState({ icon: IconComponent, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Icon container with subtle gradient bg */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900 flex items-center justify-center mb-4">
        <IconComponent size={28} className="text-brand-500" stroke={1.5} />
      </div>

      <h3 className="text-subheading text-slate-800 dark:text-slate-100 mb-1">{title}</h3>

      {description && (
        <p className="text-caption text-slate-500 max-w-[260px] text-balance">
          {description}
        </p>
      )}

      {action && <div className="mt-6 w-full max-w-[240px]">{action}</div>}
    </motion.div>
  )
}
