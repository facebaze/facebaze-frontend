'use client'

import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

interface Rule {
  label: string
  test: (pw: string) => boolean
}

const RULES: Rule[] = [
  { label: '8+ characters', test: (pw) => pw.length >= 8 },
  { label: '1 uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: '1 number', test: (pw) => /[0-9]/.test(pw) },
  { label: '1 special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const passedCount = RULES.filter((r) => r.test(password)).length
  const strength = passedCount / RULES.length

  const barColor =
    strength === 0
      ? 'bg-slate-200 dark:bg-slate-700'
      : strength <= 0.25
        ? 'bg-error'
        : strength <= 0.5
          ? 'bg-warning'
          : strength <= 0.75
            ? 'bg-yellow-400'
            : 'bg-success'

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${strength * 100}%` }}
        />
      </div>

      {/* Rules checklist */}
      <div className="space-y-0.5">
        {RULES.map((rule) => {
          const passed = rule.test(password)
          return (
            <div
              key={rule.label}
              className={cn(
                'flex items-center gap-1.5 text-tiny transition-colors duration-200',
                passed ? 'text-success' : 'text-slate-400'
              )}
            >
              <span className="text-xs">
                {passed ? '✓' : '○'}
              </span>
              <span>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
