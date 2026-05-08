'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { IconArrowRight } from '@tabler/icons-react'

import { Button, Input } from '@/components/ui'
import { quickProfileSchema, type QuickProfileFormData } from '@/lib/validators'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { profileService } from '@/services/profile.service'

export default function QuickProfilePage() {
  const router = useRouter()
  const { markProfileCreated, nextStep } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickProfileFormData>({
    resolver: zodResolver(quickProfileSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: QuickProfileFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      await profileService.updateQuickProfile(data)
      markProfileCreated()
      nextStep()
      router.push('/onboarding/permission-mode')
    } catch (err: any) {
      setApiError('Could not save your profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-heading text-slate-900 dark:text-white mb-1">Tell us about yourself</h1>
          <p className="text-body text-slate-500 dark:text-slate-400">
            This is what others see when they scan you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Priya"
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={50}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Last Name"
                placeholder="Sharma"
                autoComplete="family-name"
                autoCapitalize="words"
                maxLength={50}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              label="Designation"
              placeholder="e.g. Founder & CEO"
              autoComplete="organization-title"
              autoCapitalize="words"
              maxLength={100}
              error={errors.designation?.message}
              {...register('designation')}
            />

            <Input
              label="Company"
              placeholder="e.g. TechCo Solutions"
              autoComplete="organization"
              autoCapitalize="words"
              maxLength={100}
              error={errors.company_name?.message}
              {...register('company_name')}
            />

            <Input
              label="City (optional)"
              placeholder="e.g. Pune"
              autoComplete="address-level2"
              autoCapitalize="words"
              maxLength={50}
              hint="Helps vendors know your region"
              error={errors.location?.message}
              {...register('location')}
            />

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

          {/* CTA */}
          <div className="pt-6 pb-2 space-y-2">
            <Button type="submit" loading={isLoading} iconRight={<IconArrowRight size={18} stroke={1.5} />}>
              Continue
            </Button>
            <p className="text-tiny text-slate-400 text-center">
              You can add more details later in your profile.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
