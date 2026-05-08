'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconPhone, IconLogin, IconShieldCheck, IconMail } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, Input } from '@/components/ui'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from '@/stores/toast.store'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const verifyLoginOtp = useAuthStore((s) => s.verifyLoginOtp)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)

  const [step, setStep] = useState<Step>('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpRole, setOtpRole] = useState('')

  // OTP input state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // ── Step 1: Email + Password ──────────────────────────────────────────────

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await login(data.email, data.password)

      if (response.requiresOtp) {
        // Show OTP step
        setOtpEmail(response.email)
        setOtpRole(response.role)
        setStep('otp')
        // Dev mode: show mock OTP as toast
        if (response.mockOtp) {
          toast.otp(response.mockOtp)
        }
      } else {
        // Customer role — logged in directly
        router.replace('/')
      }
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        setApiError('Email or password is incorrect')
      } else if (status === 423) {
        setApiError('Account suspended. Contact support.')
      } else if (status === 429) {
        setApiError('Too many attempts. Please try again in 5 minutes.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Email OTP ─────────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setApiError(null)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits filled
    const code = next.join('')
    if (code.length === 6 && next.every(Boolean)) {
      handleVerifyOtp(code)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const arr = pasted.split('')
      setDigits(arr)
      inputRefs.current[5]?.focus()
      handleVerifyOtp(pasted)
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setOtpLoading(true)
    setApiError(null)

    try {
      await verifyLoginOtp(otpEmail, code)
      router.replace('/')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        setApiError('Incorrect OTP. Please try again.')
      } else if (status === 400) {
        setApiError(error?.response?.data?.message || 'OTP expired. Please login again.')
      } else {
        setApiError('Verification failed. Please try again.')
      }
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setOtpLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      setApiError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="flex-1 flex flex-col py-4 px-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <button
        onClick={() => {
          if (step === 'otp') {
            setStep('credentials')
            setDigits(['', '', '', '', '', ''])
            setApiError(null)
          } else {
            router.back()
          }
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <IconArrowLeft size={20} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
      </button>

      <AnimatePresence mode="wait">
        {step === 'credentials' ? (
          <motion.div
            key="credentials"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mt-6 mb-8">
              <h1 className="text-heading text-slate-900 dark:text-white mb-1">Welcome back</h1>
              <p className="text-body text-slate-500 dark:text-slate-400">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  maxLength={254}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  maxLength={128}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-caption text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </button>

                {/* API Error */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900"
                  >
                    <p className="text-caption text-error font-medium">{apiError}</p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6 pb-4">
                <Button type="submit" loading={isLoading} icon={<IconLogin size={18} stroke={1.5} />}>
                  Log In
                </Button>

                <div className="relative flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-tiny text-slate-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  loading={googleLoading}
                  onClick={handleGoogleSignIn}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.8h5.38a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.74 2.98-4.31 2.98-7.32z" fill="#4285F4"/>
                      <path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0010 20z" fill="#34A853"/>
                      <path d="M4.42 11.91A6.01 6.01 0 014.1 10c0-.67.12-1.31.32-1.91V5.51H1.08A9.99 9.99 0 000 10c0 1.61.39 3.14 1.08 4.49l3.34-2.58z" fill="#FBBC05"/>
                      <path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86C14.96.99 12.7 0 10 0A9.99 9.99 0 001.08 5.51l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/auth/phone')}
                  icon={<IconPhone size={18} className="text-slate-600 dark:text-slate-400" stroke={1.5} />}
                >
                  Continue with Phone
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/signup')}
                    className="text-caption text-slate-500 dark:text-slate-400"
                  >
                    Don't have an account?{' '}
                    <span className="font-semibold text-brand-600">Sign up</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mt-6 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                <IconShieldCheck size={22} className="text-brand-600" stroke={1.5} />
              </div>
              <h1 className="text-heading text-slate-900 dark:text-white mb-1">Check your email</h1>
              <p className="text-body text-slate-500 dark:text-slate-400">
                We sent a 6-digit code to{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300">{otpEmail}</span>
              </p>
              {otpRole && (
                <p className="text-xs text-slate-400 mt-1">
                  Email verification required for {otpRole} accounts
                </p>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {/* OTP Input */}
              <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    autoFocus={i === 0}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                ))}
              </div>

              {/* Error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900"
                >
                  <p className="text-caption text-error font-medium text-center">{apiError}</p>
                </motion.div>
              )}

              <p className="mt-4 text-xs text-slate-400 text-center">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials')
                    setDigits(['', '', '', '', '', ''])
                    setApiError(null)
                  }}
                  className="text-brand-600 font-medium"
                >
                  Try logging in again
                </button>
              </p>

              {/* CTA */}
              <div className="mt-auto pt-6 pb-4">
                <Button
                  onClick={() => {
                    const code = digits.join('')
                    if (code.length === 6) handleVerifyOtp(code)
                  }}
                  loading={otpLoading}
                  disabled={digits.join('').length < 6}
                  icon={<IconShieldCheck size={18} stroke={1.5} />}
                >
                  Verify & Log In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
