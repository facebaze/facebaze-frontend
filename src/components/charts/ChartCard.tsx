'use client'

import React from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export default function ChartCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  noPad = false,
}: ChartCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="text-brand-500 shrink-0">{icon}</div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 ml-3">{action}</div>}
      </div>
      <div className={noPad ? '' : 'px-5 py-4'}>{children}</div>
    </div>
  )
}
