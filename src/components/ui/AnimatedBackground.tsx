'use client'

import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  variant?: 'default' | 'vendor' | 'organiser' | 'auth'
  className?: string
  children?: React.ReactNode
}

/**
 * Animated gradient blob background.
 * Uses pure CSS animations for GPU-accelerated performance.
 * Only use on non-scrollable screens (auth, splash, modals).
 */
export function AnimatedBackground({
  variant = 'default',
  className,
  children,
}: AnimatedBackgroundProps) {
  const blobs = {
    default: [
      'bg-brand-400/20',
      'bg-accent-400/15',
      'bg-accent-300/10',
    ],
    vendor: [
      'bg-vendor-500/20',
      'bg-brand-400/15',
      'bg-accent-300/10',
    ],
    organiser: [
      'bg-amber-400/20',
      'bg-orange-300/15',
      'bg-yellow-300/10',
    ],
    auth: [
      'bg-brand-500/25',
      'bg-accent-500/20',
      'bg-brand-400/15',
    ],
  }

  const colors = blobs[variant]

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Blob 1 - Top right */}
      <div
        className={cn(
          'absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-blob',
          colors[0]
        )}
      />
      {/* Blob 2 - Bottom left */}
      <div
        className={cn(
          'absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-blob',
          colors[1]
        )}
        style={{ animationDelay: '2s' }}
      />
      {/* Blob 3 - Center */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl animate-blob',
          colors[2]
        )}
        style={{ animationDelay: '4s' }}
      />
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      {/* Abstract geometric overlay */}
      <div className="absolute inset-0 bg-abstract opacity-60" />
      {/* Diagonal lines overlay */}
      <div className="absolute inset-0 bg-lines" />
      {/* Content overlay */}
      {children && (
        <div className="relative z-10 h-full">{children}</div>
      )}
    </div>
  )
}
