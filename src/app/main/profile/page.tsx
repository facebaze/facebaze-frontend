'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconPencil,
  IconEye,
  IconMail,
  IconPhone,
  IconMessageCircle,
  IconBrandLinkedin,
  IconWorld,
  IconBrandTwitter,
  IconPlus,
  IconMapPin,
  IconBriefcase,
  IconBuilding,
  IconShield,
  IconChevronRight,
} from '@tabler/icons-react'
import { profileService } from '@/services/profile.service'
import { Avatar, CircularProgress } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ProfileData {
  id: string
  first_name: string
  last_name: string
  full_name?: string
  designation: string | null
  company_name: string | null
  location: string | null
  bio: string | null
  expertise_tags: string[]
  profile_photo_url: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  linkedin: string | null
  twitter: string | null
  website: string | null
  visibility_map: Record<string, string>
  face_registered?: boolean
  permission_mode?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileService
      .getMyProfile()
      .then((data: any) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const strength = useMemo(() => {
    if (!profile) return { score: 0, suggestions: [] }
    let score = 40
    const suggestions: string[] = []

    if (profile.designation) score += 10
    else suggestions.push('Add designation (+10%)')
    if (profile.company_name) score += 10
    else suggestions.push('Add company (+10%)')
    if (profile.profile_photo_url) score += 10
    else suggestions.push('Add profile photo (+10%)')
    if (profile.phone) score += 5
    else suggestions.push('Add phone number (+5%)')
    if (profile.linkedin) score += 8
    else suggestions.push('Add LinkedIn (+8%)')
    if (profile.bio) score += 7
    else suggestions.push('Add bio (+7%)')
    if ((profile.expertise_tags?.length ?? 0) > 0) score += 5
    else suggestions.push('Add expertise tags (+5%)')
    if (profile.website) score += 5
    else suggestions.push('Add website (+5%)')

    return { score: Math.min(score, 100), suggestions: suggestions.slice(0, 3) }
  }, [profile])

  if (loading) {
    return (
      <div className="flex-1 pt-safe-top">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="px-5">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card overflow-hidden">
            <div className="h-24 bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="px-5 pb-5 pt-2 flex flex-col items-center -mt-12">
              <div className="w-20 h-20 rounded-2xl bg-slate-300 dark:bg-slate-600 animate-pulse mb-3" />
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-caption text-slate-400 dark:text-slate-500 text-center">
          Could not load profile. Pull down to retry.
        </p>
      </div>
    )
  }

  const fullName = profile.full_name || `${profile.first_name} ${profile.last_name}`.trim()
  const hasContactInfo = profile.email || profile.phone || profile.whatsapp || profile.linkedin || profile.website

  const socialLinks = [
    { icon: IconBrandLinkedin, url: profile.linkedin, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { icon: IconBrandTwitter, url: profile.twitter, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950' },
    { icon: IconWorld, url: profile.website, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
  ].filter((l) => l.url)

  return (
    <div className="flex-1 overflow-y-auto pt-safe-top pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-heading text-slate-900 dark:text-white">My Profile</h1>
        <button
          onClick={() => router.push('/main/profile/edit')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-caption font-semibold active:scale-95 transition-transform"
        >
          <IconPencil size={14} />
          Edit
        </button>
      </div>

      {/* ─── Hero Profile Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 bg-white dark:bg-slate-800 rounded-3xl shadow-card overflow-hidden"
      >
        {/* Gradient background */}
        <div className="relative h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/10 -ml-10 -mb-10" />
          </div>
        </div>

        {/* Profile info */}
        <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <Avatar
              src={profile.profile_photo_url}
              name={fullName}
              size="xl"
              badge={strength.score >= 100 ? 'verified' : 'none'}
            />
          </div>
          <h2 className="text-subheading text-slate-900 dark:text-white">{fullName}</h2>
          {(profile.designation || profile.company_name) && (
            <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              {profile.designation && (
                <span className="flex items-center gap-1">
                  <IconBriefcase size={12} className="text-slate-400" />
                  {profile.designation}
                </span>
              )}
              {profile.designation && profile.company_name && <span className="text-slate-300">·</span>}
              {profile.company_name && (
                <span className="flex items-center gap-1">
                  <IconBuilding size={12} className="text-slate-400" />
                  {profile.company_name}
                </span>
              )}
            </p>
          )}
          {profile.location && (
            <p className="text-tiny text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <IconMapPin size={11} />
              {profile.location}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-caption text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-[280px]">
              {profile.bio}
            </p>
          )}

          {/* Social links row */}
          {socialLinks.length > 0 && (
            <div className="flex gap-2 mt-4">
              {socialLinks.map(({ icon: Icon, url, color }) => (
                <a
                  key={url}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform',
                    color
                  )}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Tags ─── */}
      {(profile.expertise_tags?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-5 mt-5"
        >
          <h3 className="text-tiny font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
            Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.expertise_tags.map((tag) => (
              <span
                key={tag}
                className="text-tiny font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-3 py-1.5 rounded-xl"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Profile Strength ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mt-5 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5"
      >
        <div className="flex items-center gap-4">
          <CircularProgress value={strength.score} size={64} strokeWidth={5}>
            <span className={cn(
              'text-caption font-bold',
              strength.score >= 80 ? 'text-emerald-600' : strength.score >= 50 ? 'text-amber-600' : 'text-brand-600'
            )}>
              {strength.score}%
            </span>
          </CircularProgress>
          <div className="flex-1">
            <h3 className="text-caption font-bold text-slate-800 dark:text-slate-200">
              Profile Strength
            </h3>
            <p className="text-tiny text-slate-400 dark:text-slate-500 mt-0.5">
              {strength.score >= 100
                ? 'Your profile is complete!'
                : `${100 - strength.score}% left to complete`}
            </p>
          </div>
        </div>
        {strength.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
            {strength.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => router.push('/main/profile/edit')}
                className="flex items-center gap-2 w-full text-left active:opacity-70"
              >
                <div className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                  <IconPlus size={10} className="text-brand-600" />
                </div>
                <span className="text-tiny font-medium text-brand-600 dark:text-brand-400">{s}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Contact Info ─── */}
      {hasContactInfo && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-5 mt-5"
        >
          <h3 className="text-tiny font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
            Contact Info
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700/50 overflow-hidden">
            {profile.email && (
              <ContactRow
                icon={<IconMail size={16} />}
                label="Email"
                value={profile.email}
                visibility={profile.visibility_map?.email}
                iconBg="bg-blue-50 dark:bg-blue-950 text-blue-500"
              />
            )}
            {profile.phone && (
              <ContactRow
                icon={<IconPhone size={16} />}
                label="Phone"
                value={profile.phone}
                visibility={profile.visibility_map?.phone}
                iconBg="bg-emerald-50 dark:bg-emerald-950 text-emerald-500"
              />
            )}
            {profile.whatsapp && (
              <ContactRow
                icon={<IconMessageCircle size={16} />}
                label="WhatsApp"
                value={profile.whatsapp}
                visibility={profile.visibility_map?.whatsapp}
                iconBg="bg-green-50 dark:bg-green-950 text-green-500"
              />
            )}
            {profile.linkedin && (
              <ContactRow
                icon={<IconBrandLinkedin size={16} />}
                label="LinkedIn"
                value={profile.linkedin}
                visibility={profile.visibility_map?.linkedin}
                iconBg="bg-blue-50 dark:bg-blue-950 text-blue-600"
              />
            )}
            {profile.website && (
              <ContactRow
                icon={<IconWorld size={16} />}
                label="Website"
                value={profile.website}
                visibility={profile.visibility_map?.website}
                iconBg="bg-purple-50 dark:bg-purple-950 text-purple-500"
              />
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Privacy Status ─── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => router.push('/main/settings/privacy')}
        className="mx-5 mt-5 w-[calc(100%-2.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
          <IconShield size={18} className="text-amber-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-caption font-semibold text-slate-800 dark:text-slate-200">Privacy Settings</p>
          <p className="text-tiny text-slate-400 dark:text-slate-500 capitalize">
            {(profile.permission_mode || 'always_ask').replace(/_/g, ' ')}
          </p>
        </div>
        <IconChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
      </motion.button>

      {/* ─── Preview Button ─── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => router.push('/main/profile/preview')}
        className="mx-5 mt-4 w-[calc(100%-2.5rem)] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 flex items-center justify-center gap-2 text-caption font-semibold text-slate-500 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
      >
        <IconEye size={16} />
        Preview as others see you
      </motion.button>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
  visibility,
  iconBg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  visibility?: string
  iconBg: string
}) {
  const visConfig: Record<string, { label: string; bg: string; text: string }> = {
    public: { label: 'Public', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
    trusted: { label: 'Trusted', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400' },
    hidden: { label: 'Hidden', bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-400 dark:text-slate-500' },
  }
  const vis = visConfig[visibility ?? 'hidden'] ?? visConfig.hidden

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-tiny text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-caption font-medium text-slate-800 dark:text-slate-200 truncate">{value}</p>
      </div>
      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', vis.bg, vis.text)}>
        {vis.label}
      </span>
    </div>
  )
}
