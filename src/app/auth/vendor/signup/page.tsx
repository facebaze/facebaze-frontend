'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconArrowLeft, IconBuilding, IconCheck, IconCalendar, IconMapPin, IconAlertCircle } from '@tabler/icons-react'
import { motion } from 'framer-motion'

import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth.service'
import { organiserService } from '@/services/organiser.service'
import { useAuthStore } from '@/stores/auth.store'

interface VendorFormData {
  business_name: string
  contact_name: string
  email: string
  password: string
  phone: string
  business_description: string
  industry: string
  website: string
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Real Estate',
  'Retail & E-commerce', 'Food & Beverage', 'Media & Entertainment',
  'Manufacturing', 'Marketing & Advertising', 'Consulting', 'Other',
]

type InviteInfo = Awaited<ReturnType<typeof authService.getVendorInvite>>

function VendorSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const setUser = useAuthStore((s) => s.setUser)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ eventName?: string } | null>(null)
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // OTP verification state
  const [otpStep, setOtpStep] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [mockOtp, setMockOtp] = useState<string | null>(null)
  const [savedInviteToken, setSavedInviteToken] = useState<string | null>(null)

  const [form, setForm] = useState<VendorFormData>({
    business_name: '',
    contact_name: '',
    email: '',
    password: '',
    phone: '',
    business_description: '',
    industry: '',
    website: '',
  })

  // Load invite info if token present
  useEffect(() => {
    if (!inviteToken) return
    authService.getVendorInvite(inviteToken)
      .then((info) => {
        setInvite(info)
        if (!info.valid) {
          setInviteError('This invite link has expired or already been used.')
        } else {
          // Pre-fill email from invite (locked)
          setForm((prev) => ({ ...prev, email: info.invited_email }))
        }
      })
      .catch(() => setInviteError('Could not load invite details.'))
      .finally(() => setInviteLoading(false))
  }, [inviteToken])

  const updateField = (field: keyof VendorFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (apiError) setApiError(null)
  }

  const isEmailLocked = !!inviteToken && invite?.valid

  const isValid =
    form.business_name.length >= 2 &&
    form.contact_name.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 6 &&
    form.phone.length >= 10

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await authService.vendorSignup({
        business_name: form.business_name,
        contact_name: form.contact_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        business_description: form.business_description || undefined,
        industry: form.industry || undefined,
        website: form.website || undefined,
        invite_token: inviteToken || undefined,
      })

      // Vendor signup always requires OTP verification
      setOtpEmail(response.email)
      setMockOtp(response.mockOtp || null)
      setSavedInviteToken(response.invite_token || null)
      setOtpStep(true)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        setApiError('An account with this email already exists')
      } else {
        setApiError(error?.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length < 4) return
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await authService.verifyVendorSignupOtp(otpEmail, otpCode)
      setUser(response.user)

      if (savedInviteToken) {
        try {
          const joined = await organiserService.acceptVendorInvite(savedInviteToken)
          setSuccess({ eventName: joined.event_name || undefined })
        } catch {
          setSuccess({})
        }
      } else {
        setSuccess({})
      }

      setTimeout(() => router.replace('/vendor/dashboard'), 2000)
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Incorrect OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (success !== null) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {success.eventName ? `You've joined ${success.eventName}!` : 'Account Created!'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {success.eventName
              ? 'Your vendor account is created and you\'re enrolled in the event.'
              : 'Your account is pending admin review.'}
            <br />Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  // OTP verification step
  if (otpStep) {
    return (
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full max-w-sm">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-5">
            <IconCheck size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
            We sent a verification code to <span className="font-medium text-slate-700 dark:text-slate-200">{otpEmail}</span>
          </p>

          {mockOtp && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-amber-700 dark:text-amber-300">Dev Mode OTP</p>
              <p className="text-lg font-mono font-bold text-amber-900 dark:text-amber-100">{mockOtp}</p>
            </div>
          )}

          <form onSubmit={onVerifyOtp} className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                if (apiError) setApiError(null)
              }}
              maxLength={6}
            />

            {apiError && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                <IconAlertCircle size={14} />
                <span>{apiError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={otpCode.length < 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  // Loading invite info
  if (inviteLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-slate-400 dark:text-slate-500">Loading invite details...</div>
      </div>
    )
  }

  return (
    <motion.div
      className="flex-1 flex flex-col py-4 px-5 sm:px-6 max-w-lg mx-auto w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl flex items-center justify-center -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <IconArrowLeft size={20} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
      </button>

      {/* Header */}
      <div className="mt-5 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
            <IconBuilding size={20} className="text-brand-600 dark:text-brand-400" stroke={1.5} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {inviteToken ? 'Accept Vendor Invite' : 'Register as Vendor'}
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {inviteToken
            ? 'Create your vendor account to accept the event invitation.'
            : 'Create your vendor account to participate in events and capture leads. Your account will be reviewed by an admin before activation.'}
        </p>
      </div>

      {/* Invite Error Banner */}
      {inviteError && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 flex items-start gap-2">
          <IconAlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">{inviteError}</p>
        </div>
      )}

      {/* Event Context Card â€” shown when arriving from invite link */}
      {invite?.valid && invite.event && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700/40 p-4"
        >
          <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
            You're invited to
          </p>
          {invite.event.cover_image_url && (
            <img
              src={invite.event.cover_image_url}
              alt={invite.event.name}
              className="w-full h-20 object-cover rounded-xl mb-3"
            />
          )}
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{invite.event.name}</p>
          {invite.org_name && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">by {invite.org_name}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <IconCalendar size={11} />
              {new Date(invite.event.event_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {(invite.event.city || invite.event.location) && (
              <span className="flex items-center gap-1">
                <IconMapPin size={11} />
                {invite.event.city || invite.event.location}
              </span>
            )}
          </div>
          {invite.booth_name && (
            <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">
              Assigned booth: {invite.booth_name}
            </p>
          )}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Required fields */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Required Information
            </p>

            <Input
              label="Business Name"
              type="text"
              placeholder="Your Company Name"
              value={form.business_name}
              onChange={(e) => updateField('business_name', e.target.value)}
              maxLength={255}
            />

            <Input
              label="Contact Person"
              type="text"
              placeholder="John Doe"
              value={form.contact_name}
              onChange={(e) => updateField('contact_name', e.target.value)}
              maxLength={255}
            />

            <div>
              <Input
                label="Email"
                type="email"
                placeholder="contact@company.com"
                value={form.email}
                onChange={(e) => !isEmailLocked && updateField('email', e.target.value)}
                maxLength={254}
                disabled={isEmailLocked}
              />
              {isEmailLocked && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Email is locked to your invite address
                </p>
              )}
            </div>

            <Input
              label="Phone"
              type="tel"
              placeholder="+919876543210"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              maxLength={20}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                maxLength={128}
              />
              {form.password.length > 0 && form.password.length < 6 && (
                <p className="text-[10px] text-red-500 mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
          </div>

          {/* Optional fields */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Optional Details
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Industry
              </label>
              <select
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <Input
              label="Website"
              type="url"
              placeholder="https://your-company.com"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              maxLength={255}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Business Description
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                rows={3}
                placeholder="Tell us about your business..."
                value={form.business_description}
                onChange={(e) => updateField('business_description', e.target.value)}
                maxLength={1000}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                {form.business_description.length}/1000
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm"
          >
            {apiError}
          </motion.div>
        )}

        {/* Submit */}
        <div className="mt-6 mb-6 space-y-3">
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full"
          >
            {isLoading
              ? 'Creating Account...'
              : inviteToken ? 'Create Account & Accept Invite' : 'Register as Vendor'}
          </Button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Log in
            </button>
          </p>

          {!inviteToken && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              Want a regular account?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                Sign up as user
              </button>
            </p>
          )}
        </div>
      </form>
    </motion.div>
  )
}

export default function VendorSignupPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-slate-400 dark:text-slate-500">Loading...</div>
      </div>
    }>
      <VendorSignupContent />
    </Suspense>
  )
}
