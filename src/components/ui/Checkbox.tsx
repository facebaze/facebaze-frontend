'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function Checkbox({ checked, onChange, label, disabled = false, className = '' }: CheckboxProps) {
  return (
    <label
      className={[
        'flex items-start gap-3 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      {/* Box */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          checked
            ? 'bg-brand-600 border-brand-600'
            : 'bg-white border-slate-300 hover:border-brand-400 dark:bg-slate-800 dark:border-slate-600',
        ].join(' ')}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <IconCheck size={12} strokeWidth={3} className="text-white" />
        </motion.div>
      </button>

      {/* Label */}
      {label && (
        <span
          onClick={() => !disabled && onChange(!checked)}
          className="text-caption text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          {label}
        </span>
      )}
    </label>
  )
}
