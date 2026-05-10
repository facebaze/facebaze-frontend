'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconSend, IconPhone } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from '@/stores/toast.store'

const COUNTRY_CODES = [
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇺🇸', code: '+1', name: 'US' },
  { flag: '🇬🇧', code: '+44', name: 'UK' },
  { flag: '🇸🇬', code: '+65', name: 'Singapore' },
  { flag: '🇦🇪', code: '+971', name: 'UAE' },
]

export default function PhonePage() {
  const router = useRouter()
  const sendOtp = useAuthStore((s) => s.sendOtp)

  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Strip leading zeros, spaces; validate exactly 10 raw digits
  const rawDigits = phone.replace(/[\s\-]/g, '')
  const isValid = /^\d{10}$/.test(rawDigits)
  const fullPhone = `${countryCode}${rawDigits.replace(/^0+/, '')}`

  const handleSend = async () => {
    if (!isValid) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const result = await sendOtp(fullPhone)
      // Dev/mock: backend returns mockOtp → show as toast
      if (result.mockOtp) {
        toast.otp(result.mockOtp)
      }
      router.push(`/auth/otp?phone=${encodeURIComponent(fullPhone)}`)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="flex-1 flex flex-col py-4 px-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl flex items-center justify-center -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <IconArrowLeft size={20} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
      </button>

      {/* Header */}
      <div className="mt-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-3">
          <IconPhone size={22} className="text-brand-600" stroke={1.5} />
        </div>
        <h1 className="text-heading text-slate-900 dark:text-white mb-1">Enter your number</h1>
        <p className="text-body text-slate-500 dark:text-slate-400">We'll send a 6-digit code to verify it's you</p>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Phone input row */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Phone Number
          </label>
          <div className="flex gap-2">
            {/* Country code */}
            <div className="relative flex-shrink-0">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-[50px] appearance-none pl-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                width="12" height="8" viewBox="0 0 12 8" fill="none"
              >
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Number */}
            <input
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phone}
              autoFocus
              maxLength={12}
              onChange={(e) => {
                setError(null)
                const cleaned = e.target.value.replace(/[^\d\s\-]/g, '')
                // Prevent more than 10 digits
                if (cleaned.replace(/[\s\-]/g, '').length <= 10) {
                  setPhone(cleaned)
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && isValid) handleSend() }}
              className="flex-1 h-[50px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            {rawDigits.length > 0 ? (
              <>
                <span className={rawDigits.length === 10 ? 'text-emerald-600 font-medium' : ''}>
                  {rawDigits.length}/10 digits
                </span>
                {' · '}
              </>
            ) : null}
            We'll send a code to{' '}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {isValid ? fullPhone : '—'}
            </span>
          </p>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4 pb-2 space-y-3">
          <Button onClick={handleSend} loading={isLoading} disabled={!isValid} icon={<IconSend size={18} stroke={1.5} />}>
            Send OTP
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Standard SMS rates may apply.{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-brand-600 font-medium"
            >
              Use email instead
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
