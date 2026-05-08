'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Building2, Globe, Mail, Phone, MapPin } from 'lucide-react'
import { organiserService, type Organisation } from '@/services/organiser.service'
import { organiserProfileSchema, FIELD_LIMITS, type OrganiserProfileFormData } from '@/lib/validators'

export default function OrganiserProfilePage() {
  const router = useRouter()
  const [org, setOrg] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrganiserProfileFormData>({
    resolver: zodResolver(organiserProfileSchema),
  })

  const orgName = watch('name', '')

  const fetchOrg = useCallback(async () => {
    try {
      const data = await organiserService.getOrganisation()
      setOrg(data)
      reset({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || '',
        city: data.city || '',
        description: data.description || '',
      })
      setLogoUrl(data.logo_url || '')
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    fetchOrg()
  }, [fetchOrg])

  const onSubmit = async (data: OrganiserProfileFormData) => {
    setSaving(true)
    try {
      await organiserService.updateOrganisation({ ...data, logo_url: logoUrl })
      router.back()
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const fields: { key: keyof OrganiserProfileFormData; label: string; icon: typeof Building2; type?: string; maxLen: number }[] = [
    { key: 'name', label: 'Organisation Name', icon: Building2, maxLen: FIELD_LIMITS.orgName },
    { key: 'email', label: 'Contact Email', icon: Mail, type: 'email', maxLen: FIELD_LIMITS.email },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', maxLen: FIELD_LIMITS.phone },
    { key: 'website', label: 'Website', icon: Globe, type: 'url', maxLen: FIELD_LIMITS.url },
    { key: 'address', label: 'Address', icon: MapPin, maxLen: FIELD_LIMITS.address },
    { key: 'city', label: 'City', icon: MapPin, maxLen: FIELD_LIMITS.city },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center lg:hidden"
          >
            <ArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Organisation Profile</h1>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{orgName.charAt(0) || 'O'}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{orgName || 'Organisation'}</p>
            <p className="text-xs text-slate-400">Update your organisation details below</p>
          </div>
        </div>

        {/* Fields */}
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{field.label}</label>
            <div className="relative">
              <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={field.type || 'text'}
                {...register(field.key)}
                maxLength={field.maxLen}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-400 disabled:opacity-60"
              />
            </div>
            {errors[field.key] && <p className="mt-1 text-xs text-red-500">{errors[field.key]?.message}</p>}
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            maxLength={1000}
            placeholder="Brief description of your organisation..."
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-400 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
