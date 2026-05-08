'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconArrowLeft, IconCamera, IconX } from '@tabler/icons-react'
import { profileService } from '@/services/profile.service'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { editProfileSchema, FIELD_LIMITS, type EditProfileFormData } from '@/lib/validators'

type Visibility = 'public' | 'trusted' | 'hidden'

const VISIBILITY_OPTIONS: { value: Visibility; icon: string; label: string }[] = [
  { value: 'public', icon: '🌐', label: 'Public' },
  { value: 'trusted', icon: '👥', label: 'Trusted' },
  { value: 'hidden', icon: '🔒', label: 'Hidden' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [visibility, setVisibility] = useState<Record<string, Visibility>>({
    email: 'public',
    phone: 'hidden',
    whatsapp: 'hidden',
    linkedin: 'public',
    twitter: 'public',
    website: 'public',
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
  })

  useEffect(() => {
    profileService
      .getMyProfile()
      .then((data: any) => {
        reset({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          designation: data.designation ?? '',
          company_name: data.company_name ?? '',
          location: data.location ?? '',
          bio: data.bio ?? '',
          email_contact: data.email ?? '',
          phone: data.phone ?? '',
          whatsapp: data.whatsapp ?? '',
          linkedin: data.linkedin ?? '',
          twitter: data.twitter ?? '',
          website: data.website ?? '',
        })
        setTags(data.expertise_tags ?? [])
        if (data.visibility_map) {
          setVisibility((prev) => ({ ...prev, ...data.visibility_map }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reset])

  const addTag = useCallback(() => {
    const trimmed = newTag.trim()
    if (trimmed && tags.length < 5 && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
      setNewTag('')
    }
  }, [newTag, tags])

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const cycleVisibility = (field: string) => {
    setVisibility((prev) => {
      const order: Visibility[] = ['public', 'trusted', 'hidden']
      const current = prev[field] ?? 'hidden'
      const next = order[(order.indexOf(current) + 1) % 3]
      return { ...prev, [field]: next }
    })
  }

  const onSubmit = async (data: EditProfileFormData) => {
    setSaving(true)
    try {
      await profileService.updateQuickProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        designation: data.designation || '',
        company_name: data.company_name || '',
        location: data.location || '',
      })
      router.back()
    } catch {
      // Toast or error state
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 px-5 pt-safe-top pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <IconArrowLeft size={22} className="text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-body font-semibold text-slate-900 dark:text-white">Edit Profile</h1>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="text-caption font-bold text-brand-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Photo */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-brand-100 dark:bg-brand-900 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-lg">
            <IconCamera size={14} className="text-white" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <section>
          <h2 className="text-caption font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Basic Info
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                maxLength={FIELD_LIMITS.name}
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label="Last Name"
                maxLength={FIELD_LIMITS.name}
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
            <Input label="Designation" maxLength={FIELD_LIMITS.designation} {...register('designation')} error={errors.designation?.message} />
            <Input label="Company" maxLength={FIELD_LIMITS.company} {...register('company_name')} error={errors.company_name?.message} />
            <Input label="City" maxLength={FIELD_LIMITS.location} {...register('location')} error={errors.location?.message} />
            <div>
              <label className="block text-caption font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
              <textarea
                {...register('bio')}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-body text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none transition-colors"
                placeholder="Tell people about yourself..."
              />
            </div>
          </div>
        </section>

        {/* Contact fields with visibility toggles */}
        <section>
          <h2 className="text-caption font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Contact Fields
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
            <ContactField
              label="Email"
              fieldRegister={register('email_contact')}
              visibility={visibility.email}
              onToggle={() => cycleVisibility('email')}
            />
            <ContactField
              label="Phone"
              fieldRegister={register('phone')}
              visibility={visibility.phone}
              onToggle={() => cycleVisibility('phone')}
              inputMode="tel"
            />
            <ContactField
              label="WhatsApp"
              fieldRegister={register('whatsapp')}
              visibility={visibility.whatsapp}
              onToggle={() => cycleVisibility('whatsapp')}
              inputMode="tel"
            />
            <ContactField
              label="LinkedIn"
              fieldRegister={register('linkedin')}
              visibility={visibility.linkedin}
              onToggle={() => cycleVisibility('linkedin')}
            />
            <ContactField
              label="Twitter"
              fieldRegister={register('twitter')}
              visibility={visibility.twitter}
              onToggle={() => cycleVisibility('twitter')}
            />
            <ContactField
              label="Website"
              fieldRegister={register('website')}
              visibility={visibility.website}
              onToggle={() => cycleVisibility('website')}
              inputMode="url"
            />
          </div>
        </section>

        {/* Expertise tags */}
        <section>
          <h2 className="text-caption font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Expertise Tags (max 5)
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-tiny font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 pl-3 pr-1.5 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="w-4 h-4 rounded-full hover:bg-brand-200 flex items-center justify-center"
                  >
                    <IconX size={10} />
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-caption bg-slate-50 dark:bg-slate-800/50 dark:text-white focus:border-brand-500 outline-none"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-caption font-semibold active:bg-brand-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </section>
      </form>
    </div>
  )
}

function ContactField({
  label,
  fieldRegister,
  visibility,
  onToggle,
  inputMode,
  maxLength,
}: {
  label: string
  fieldRegister: any
  visibility: Visibility
  onToggle: () => void
  inputMode?: string
  maxLength?: number
}) {
  const vis = VISIBILITY_OPTIONS.find((v) => v.value === visibility)!

  return (
    <div>
      <label className="block text-caption font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          {...fieldRegister}
          inputMode={inputMode}
          maxLength={maxLength}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-caption text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 focus:border-brand-500 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-colors',
            visibility === 'public' && 'bg-success/10',
            visibility === 'trusted' && 'bg-warning/10',
            visibility === 'hidden' && 'bg-slate-100 dark:bg-slate-700'
          )}
          title={vis.label}
        >
          {vis.icon}
        </button>
      </div>
    </div>
  )
}
