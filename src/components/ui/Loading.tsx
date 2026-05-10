'use client'

export function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center h-full bg-surface-secondary bg-mesh">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo ring */}
        <div className="relative w-16 h-16">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-100 dark:border-brand-800 animate-spin-slow" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 animate-pulse-soft shadow-glow" />
        </div>
        {/* Loading text with shimmer */}
        <p className="text-caption text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin text-brand-600 ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
