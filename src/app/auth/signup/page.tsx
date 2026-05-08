'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react'
import { motion } from 'framer-motion'

import { Button, Input, PasswordStrength } from '@/components/ui'
import { signupSchema, type SignupFormData } from '@/lib/validators'
import { useAuthStore } from '@/stores/auth.store'

export default function SignupPage() {
  const router = useRouter()
  const signUp = useAuthStore((s) => s.signUp)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  })

  const password = watch('password', '')

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      await signUp(data.email, data.password, data.fullName)
      router.replace('/onboarding/consent')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        setApiError('An account with this email already exists')
      } else if (status === 422) {
        setApiError('Please check your details and try again')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
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
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl flex items-center justify-center -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Go back"
      >
        <IconArrowLeft size={20} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
      </button>

      <div className="mt-6 mb-8">
        <h1 className="text-heading text-slate-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-body text-slate-500 dark:text-slate-400">Get started in 2 minutes</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            maxLength={100}
            error={errors.fullName?.message}
            {...register('fullName')}
          />

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

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              maxLength={128}
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            maxLength={128}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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
          <Button type="submit" loading={isLoading} icon={<IconUserPlus size={18} stroke={1.5} />}>
            Create Account
          </Button>

          <p className="text-tiny text-slate-400 text-center leading-relaxed">
            By signing up, you agree to our{' '}
            <button type="button" className="text-brand-600 font-medium underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-brand-600 font-medium underline">
              Privacy Policy
            </button>
          </p>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-caption text-slate-500 dark:text-slate-400"
            >
              Already have an account?{' '}
              <span className="font-semibold text-brand-600">Log in</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
