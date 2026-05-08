'use client'

import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

/**
 * Glassmorphism card — backdrop-blur with semi-transparent background.
 * Great for cards overlaying animated/gradient backgrounds.
 */
export function GlassCard({ children, className, interactive, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl p-6 border border-white/30 dark:border-slate-700/30',
        'backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 shadow-glass',
        'transition-all duration-200',
        interactive && 'cursor-pointer active:scale-[0.98] hover:bg-white/75 dark:hover:bg-slate-900/75 hover:shadow-elevated',
        className
      )}
    >
      {children}
    </div>
  )
}
