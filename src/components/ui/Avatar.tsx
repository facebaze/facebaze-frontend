'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  badge?: 'verified' | 'active' | 'none'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

const GRADIENT_COLORS = [
  'from-rose-400 to-red-600',
  'from-orange-400 to-amber-600',
  'from-emerald-400 to-teal-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-violet-600',
  'from-pink-400 to-fuchsia-600',
]

function getGradient(name: string): string {
  const charCode = (name || 'A').charCodeAt(0)
  return GRADIENT_COLORS[charCode % GRADIENT_COLORS.length]
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export function Avatar({ src, name = '', size = 'md', badge = 'none', className }: AvatarProps) {
  const initials = getInitials(name)
  const gradient = getGradient(name)

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-2xl overflow-hidden ring-2 ring-white dark:ring-slate-900',
          SIZE_MAP[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-br',
              gradient
            )}
          >
            {initials}
          </div>
        )}
      </div>
      {badge === 'verified' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
      {badge === 'active' && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
      )}
    </div>
  )
}
