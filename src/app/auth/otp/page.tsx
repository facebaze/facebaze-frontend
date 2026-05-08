'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowLeft, IconMessageChatbot } from '@tabler/icons-react'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { toast } from '@/stores/toast.store'

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function OtpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const phone = params.get('phone') ?? ''

  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const sendOtp = useAuthStore((s) => s.sendOtp)

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendSeconds, setResendSeconds] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown
  useEffect(() => {
    if (resendSeconds <= 0) return
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendSeconds])

  // Auto-verify when all 6 filled
  useEffect(() => {
    const code = digits.join('')
    if (code.length === 6 && digits.every(Boolean)) {
      handleVerify(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits])

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setError(null)
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
    }
  }

  const handleVerify = async (code: string) => {
    if (isLoading || code.length < 6) return
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyOtp(phone, code)
      toast.success('Phone verified!', "You're now signed in.")
      if (result?.isNewUser) {
        router.replace('/onboarding/consent')
      } else {
        // Existing user — skip onboarding entirely
        useOnboardingStore.getState().setStep('complete')
        router.replace('/')
      }
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 400) {
        setError(err?.response?.data?.message ?? 'OTP expired or too many attempts. Request a new one.')
      } else {
        setError('Incorrect OTP. Please check and try again.')
      }
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (isResending) return
    setIsResending(true)
    try {
      const result = await sendOtp(phone)
      if (result.mockOtp) toast.otp(result.mockOtp)
      setResendSeconds(60)
      setDigits(['', '', '', '', '', ''])
      setError(null)
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } catch {
      toast.error('Failed to resend', 'Please try again.')
    } finally {
      setIsResending(false)
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
      <div className="mt-6 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
          <IconMessageChatbot size={22} className="text-brand-600" stroke={1.5} />
        </div>
        <h1 className="text-heading text-slate-900 dark:text-white mb-1">Enter the code</h1>
        <p className="text-body text-slate-500 dark:text-slate-400">
          Sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{phone}</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {/* 6-digit input boxes */}
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={digit}
              autoFocus={i === 0}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={[
                'w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-white dark:bg-slate-800 outline-none transition-all font-mono select-none',
                digit
                  ? 'border-brand-500 text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/50'
                  : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white',
                error ? '!border-red-400 !bg-red-50 dark:!bg-red-950/50' : '',
                'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Resend */}
        <div className="mt-6 text-center">
          {resendSeconds > 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resend in{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{resendSeconds}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors"
            >
              {isResending ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>

        {/* Verify button */}
        <div className="mt-auto pt-6 pb-4">
          <Button
            onClick={() => handleVerify(digits.join(''))}
            loading={isLoading}
            disabled={digits.filter(Boolean).length < 6}
            icon={<IconMessageChatbot size={18} stroke={1.5} />}
          >
            Verify &amp; Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page (wraps OtpForm in Suspense for static export) ──────────────────────

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OtpForm />
    </Suspense>
  )
}
