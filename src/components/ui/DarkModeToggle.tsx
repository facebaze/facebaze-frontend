'use client'

import { IconSun, IconMoon, IconSunMoon } from '@tabler/icons-react'
import { useThemeStore } from '@/stores/theme.store'
import { cn } from '@/lib/utils'

type ThemeMode = 'light' | 'dark' | 'auto'

const OPTIONS: { mode: ThemeMode; icon: typeof IconSun; label: string }[] = [
  { mode: 'light', icon: IconSun, label: 'Light' },
  { mode: 'dark', icon: IconMoon, label: 'Dark' },
  { mode: 'auto', icon: IconSunMoon, label: 'Auto' },
]

/**
 * Dark mode toggle — 3-way: Light / Dark / Auto.
 * Auto switches based on time of day (dark 7PM–6AM).
 */
export function DarkModeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useThemeStore()

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800', className)}>
      {OPTIONS.map((opt) => {
        const isActive = mode === opt.mode
        const Icon = opt.icon
        return (
          <button
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-tiny font-medium transition-all duration-200',
              isActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
            aria-label={`Set theme to ${opt.label}`}
          >
            <Icon size={16} stroke={1.5} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
