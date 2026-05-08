'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  pill?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, iconRight, pill, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-brand-600 text-white shadow-button hover:bg-brand-700 hover:shadow-glow active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400',
      secondary: 'bg-white border border-slate-200 text-slate-800 shadow-card hover:border-brand-200 hover:bg-brand-50/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:border-brand-500/30 dark:hover:bg-slate-700',
      ghost: 'bg-transparent text-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-950',
      danger: 'bg-error/10 text-error border border-error/20 hover:bg-error/20 active:bg-error/30 dark:bg-error/20 dark:border-error/30',
    }

    const sizes = {
      xs: 'h-8 px-3 rounded-lg text-tiny gap-1.5',
      sm: 'h-10 px-4 rounded-xl text-caption gap-1.5',
      md: 'h-12 px-5 rounded-xl text-body gap-2',
      lg: 'h-14 px-6 rounded-2xl text-body gap-2',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          pill ? 'rounded-full' : '',
          'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className={cn('animate-spin', size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 flex items-center">{icon}</span>
        ) : null}
        {children}
        {!loading && iconRight ? (
          <span className="shrink-0 flex items-center">{iconRight}</span>
        ) : null}
      </button>
    )
  }
)

Button.displayName = 'Button'
