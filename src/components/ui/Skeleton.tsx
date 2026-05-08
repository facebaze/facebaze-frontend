'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton — shimmer loading placeholder.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

/**
 * Text skeleton — single line placeholder.
 */
export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4 rounded-lg',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Avatar skeleton — circular placeholder.
 */
export function SkeletonAvatar({ className, size = 48 }: SkeletonProps & { size?: number }) {
  return (
    <div
      className={cn('skeleton rounded-full', className)}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * Card skeleton — full card loading placeholder.
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded-lg" />
          <div className="skeleton h-3 w-1/3 rounded-lg" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-8 w-20 rounded-xl" />
        <div className="skeleton h-8 w-16 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * List skeleton — multiple items loading.
 */
export function SkeletonList({ count = 3, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <SkeletonAvatar size={44} />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/5 rounded-lg" />
            <div className="skeleton h-3 w-2/5 rounded-lg" />
          </div>
          <div className="skeleton h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/**
 * Stat card skeleton — for dashboard number cards.
 */
export function SkeletonStat({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3', className)}>
      <div className="skeleton h-4 w-2/3 rounded-lg" />
      <div className="skeleton h-8 w-1/3 rounded-lg" />
      <div className="skeleton h-3 w-1/2 rounded-lg" />
    </div>
  )
}
