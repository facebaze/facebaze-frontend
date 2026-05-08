'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCalendar,
  IconMapPin,
  IconFileText,
  IconPhoto,
  IconUsers,
  IconCategory,
  IconClock,
  IconInfoCircle,
  IconChevronDown,
} from '@tabler/icons-react'
import { organiserService } from '@/services/organiser.service'
import { createEventSchema, FIELD_LIMITS, type CreateEventFormData } from '@/lib/validators'
import LocationSearch, { type LocationResult } from '@/components/ui/LocationSearch'
import ImageUpload from '@/components/ui/ImageUpload'
import { cn } from '@/lib/utils'

const EVENT_CATEGORIES = [
  { label: 'Conference', value: 'conference' },
  { label: 'Exhibition', value: 'exhibition' },
  { label: 'Trade Show', value: 'trade_show' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Networking', value: 'networking' },
  { label: 'Summit', value: 'summit' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Meetup', value: 'meetup' },
  { label: 'Job Fair', value: 'job_fair' },
  { label: 'Product Launch', value: 'product_launch' },
  { label: 'Other', value: 'other' },
]

const STEPS = [
  { id: 'basics', label: 'Basics', icon: IconCalendar },
  { id: 'when', label: 'When', icon: IconClock },
  { id: 'where', label: 'Where', icon: IconMapPin },
  { id: 'branding', label: 'Media', icon: IconPhoto },
  { id: 'consent', label: 'Consent', icon: IconFileText },
] as const

type StepId = (typeof STEPS)[number]['id']

// Shared input class
const inputCls =
  'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-shadow'

export default function CreateEventPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<StepId>('basics')
  const [venueLocation, setVenueLocation] = useState<LocationResult | null>(null)
  const [tempId] = useState(() => `draft_${Date.now()}`)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      location: '',
      city: '',
      event_start_date: '',
      event_end_date: '',
      start_time: '',
      end_time: '',
      category: '',
      expected_attendees: undefined,
      cover_image_url: '',
      logo_url: '',
      consent_copy:
        'By opting in, exhibitors and sponsors at this event may scan your face to view your Facebase profile and save your contact details. Only fields you have marked as Public will be shared. You will be notified on every capture and can revoke consent at any time.',
      consent_language: 'English',
    },
  })

  const coverImageUrl = watch('cover_image_url')
  const logoUrl = watch('logo_url')
  const currentIdx = STEPS.findIndex((s) => s.id === step)
  const isFirst = currentIdx === 0
  const isLast = currentIdx === STEPS.length - 1

  const goNext = async () => {
    // Validate current step fields before advancing
    const fieldMap: Record<StepId, (keyof CreateEventFormData)[]> = {
      basics: ['name'],
      when: ['event_start_date', 'event_end_date'],
      where: ['location', 'city'],
      branding: [],
      consent: ['consent_copy'],
    }
    const valid = await trigger(fieldMap[step])
    if (valid && !isLast) setStep(STEPS[currentIdx + 1].id)
  }

  const goPrev = () => {
    if (!isFirst) setStep(STEPS[currentIdx - 1].id)
  }

  const onSubmit = async (data: CreateEventFormData) => {
    setSaving(true)
    try {
      const event = await organiserService.createEvent({
        name: data.name,
        description: data.description || undefined,
        location: venueLocation?.name || data.location,
        city: venueLocation?.city || data.city,
        event_start_date: data.event_start_date,
        event_end_date: data.event_end_date,
        latitude: venueLocation?.lat,
        longitude: venueLocation?.lng,
        address: venueLocation?.address,
        category: data.category || undefined,
        expected_attendees: data.expected_attendees || undefined,
        cover_image_url: data.cover_image_url || undefined,
        logo_url: data.logo_url || undefined,
        consent_config: {
          consent_copy: data.consent_copy,
          consent_language: data.consent_language,
        },
      })
      router.push(`/organiser/events/detail?id=${event.id}`)
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-1 lg:px-8 pb-8">
      {/* ─── Top bar ─── */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <IconArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create Event</h1>
        </div>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
          {currentIdx + 1}/{STEPS.length}
        </span>
      </div>

      {/* ─── Step indicator ─── */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-300',
              i <= currentIdx
                ? 'bg-brand-500'
                : 'bg-slate-200 dark:bg-slate-700',
            )}
          />
        ))}
      </div>

      {/* ─── Step content ─── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Step 1: Basics ── */}
            {step === 'basics' && (
              <div className="space-y-4">
                <StepHeader
                  icon={IconCalendar}
                  title="Event Basics"
                  subtitle="Name your event and set basic details"
                />

                <Field label="Event Name" required error={errors.name?.message}>
                  <input
                    type="text"
                    {...register('name')}
                    maxLength={FIELD_LIMITS.eventName}
                    placeholder="e.g. TechConf Pune 2026"
                    className={inputCls}
                    autoFocus
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    {...register('description')}
                    rows={3}
                    maxLength={FIELD_LIMITS.description}
                    placeholder="Brief description — what attendees and vendors can expect..."
                    className={cn(inputCls, 'resize-none')}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category" icon={IconCategory}>
                    <div className="relative">
                      <select {...register('category')} className={cn(inputCls, 'appearance-none pr-8')}>
                        <option value="">Select...</option>
                        {EVENT_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Expected Attendees" icon={IconUsers}>
                    <input
                      type="number"
                      {...register('expected_attendees', { valueAsNumber: true })}
                      placeholder="e.g. 500"
                      min={1}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* ── Step 2: When ── */}
            {step === 'when' && (
              <div className="space-y-4">
                <StepHeader
                  icon={IconClock}
                  title="Date & Time"
                  subtitle="When does your event start and end?"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" required error={errors.event_start_date?.message}>
                    <input type="date" {...register('event_start_date')} className={inputCls} />
                  </Field>
                  <Field label="End Date" required error={errors.event_end_date?.message}>
                    <input type="date" {...register('event_end_date')} className={inputCls} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Time">
                    <input type="time" {...register('start_time')} className={inputCls} />
                  </Field>
                  <Field label="End Time">
                    <input type="time" {...register('end_time')} className={inputCls} />
                  </Field>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex gap-2.5">
                  <IconInfoCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Events can span multiple days. Times are optional but help attendees plan their visit.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Where ── */}
            {step === 'where' && (
              <div className="space-y-4">
                <StepHeader
                  icon={IconMapPin}
                  title="Venue & Location"
                  subtitle="Where is your event happening?"
                />

                <Field label="Search Venue" required error={!venueLocation ? errors.location?.message : undefined}>
                  <LocationSearch
                    value={venueLocation}
                    onSelect={(loc) => {
                      setVenueLocation(loc)
                      setValue('location', loc.name, { shouldValidate: true })
                      setValue('city', loc.city, { shouldValidate: true })
                    }}
                    variant="field"
                    placeholder="Search for a venue, hotel, or address..."
                    showGPS
                    showRecent
                  />
                </Field>

                {venueLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30"
                  >
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <IconCheck size={12} /> {venueLocation.name}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <IconMapPin size={10} />
                      {venueLocation.address}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 4: Branding ── */}
            {step === 'branding' && (
              <div className="space-y-4">
                <StepHeader
                  icon={IconPhoto}
                  title="Branding & Imagery"
                  subtitle="Add visuals to make your event stand out"
                />

                <ImageUpload
                  label="Cover / Banner Image"
                  hint="Recommended: 1200×400px landscape"
                  value={coverImageUrl || ''}
                  onChange={(url) => setValue('cover_image_url', url)}
                  uploadOptions={{ folder: `events/${tempId}`, fileName: 'banner' }}
                  aspectClass="aspect-[3/1]"
                />

                <ImageUpload
                  label="Event Logo"
                  hint="Square image, shown in event cards"
                  value={logoUrl || ''}
                  onChange={(url) => setValue('logo_url', url)}
                  uploadOptions={{ folder: `events/${tempId}`, fileName: 'logo' }}
                  compact
                />

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex gap-2.5">
                  <IconInfoCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Images are optional. Events without a cover will show a gradient placeholder.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 5: Consent ── */}
            {step === 'consent' && (
              <div className="space-y-4">
                <StepHeader
                  icon={IconFileText}
                  title="Consent Configuration"
                  subtitle="Customize the consent text shown to attendees"
                />

                <Field label="Consent Copy" required error={errors.consent_copy?.message}>
                  <textarea
                    {...register('consent_copy')}
                    rows={5}
                    maxLength={FIELD_LIMITS.consentCopy}
                    className={cn(inputCls, 'resize-none leading-relaxed')}
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Shown to attendees when they opt into vendor scanning.
                  </p>
                </Field>

                <Field label="Consent Language">
                  <div className="relative">
                    <select
                      {...register('consent_language')}
                      className={cn(inputCls, 'appearance-none pr-8')}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Other">Other</option>
                    </select>
                    <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>

                {/* What happens next */}
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 border border-brand-100 dark:border-brand-800/30 flex gap-2.5">
                  <IconInfoCircle size={14} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-brand-800 dark:text-brand-300 mb-0.5">What happens next?</p>
                    <p className="text-[11px] text-brand-700 dark:text-brand-400 leading-relaxed">
                      Your event will be created in <strong>Draft</strong> status.
                      Invite vendors, configure scanning, then activate when ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Navigation buttons ─── */}
        <div className="flex items-center gap-3 mt-6">
          {!isFirst && (
            <button
              type="button"
              onClick={goPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            >
              <IconArrowLeft size={14} />
              Back
            </button>
          )}

          <div className="flex-1" />

          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 active:scale-95 transition-all"
            >
              Next
              <IconArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-40 active:scale-95 transition-all"
            >
              <IconCheck size={14} />
              {saving ? 'Creating...' : 'Create Event'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StepHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<any>
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  icon: Icon,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  icon?: React.ComponentType<any>
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block flex items-center gap-1">
        {Icon && <Icon size={11} className="text-brand-500" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
