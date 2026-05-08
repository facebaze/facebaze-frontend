'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconShield,
  IconCreditCard,
  IconHistory,
  IconLogout,
  IconChevronRight,
  IconUser,
  IconBell,
  IconHelp,
  IconMail,
  IconStar,
  IconTrash,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { profileService } from '@/services/profile.service'
import { Avatar, DarkModeToggle } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: IconUser, label: 'Edit Profile', desc: 'Name, bio, photo', href: '/main/profile/edit' },
      { icon: IconBell, label: 'Notifications', desc: 'Push & digest preferences', href: '/main/settings/notifications' },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: IconShield, label: 'Privacy & Data', desc: 'Scan permissions, data export', href: '/main/settings/privacy' },
      { icon: IconHistory, label: 'Scan History', desc: 'Who scanned you', href: '/main/history' },
    ],
  },
  {
    title: 'Subscription',
    items: [
      { icon: IconCreditCard, label: 'Manage Plan', desc: 'Free plan', href: '/main/settings/subscription', badge: 'Free' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: IconHelp, label: 'Help & FAQ', desc: 'Get support', href: '/main/settings/help' },
      { icon: IconMail, label: 'Contact Us', desc: 'Send us feedback', href: '/main/settings/contact' },
      { icon: IconStar, label: 'Rate FaceBase', desc: 'Share your experience', href: '/main/settings/rate' },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    profileService.getMyProfile().then(setProfile).catch(() => {})
  }, [])

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    await logout()
    router.replace('/auth/welcome')
  }

  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="flex-1 overflow-y-auto pt-safe-top pb-8">
      <div className="px-5 pt-8 pb-3">
        <h1 className="text-heading text-slate-900 dark:text-white">Settings</h1>
      </div>

      {/* ─── Profile Summary Card ─── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => router.push('/main/profile')}
        className="mx-5 mt-3 w-[calc(100%-2.5rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
      >
        <Avatar
          src={profile?.profile_photo_url}
          name={fullName}
          size="lg"
        />
        <div className="flex-1 text-left min-w-0">
          <h2 className="text-body font-bold text-slate-900 dark:text-white truncate">
            {fullName}
          </h2>
          <p className="text-tiny text-slate-400 dark:text-slate-500 truncate">
            {user?.email || 'View your profile'}
          </p>
          {profile?.designation && (
            <p className="text-tiny text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {profile.designation}
              {profile.company_name && ` · ${profile.company_name}`}
            </p>
          )}
        </div>
        <IconChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0" stroke={1.5} />
      </motion.button>

      {/* ─── Theme Toggle ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-5 mt-5"
      >
        <h2 className="text-tiny font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
          Appearance
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption font-semibold text-slate-700 dark:text-slate-200">Theme</span>
            <span className="text-tiny text-slate-400 dark:text-slate-500">Auto = dark at night</span>
          </div>
          <DarkModeToggle />
        </div>
      </motion.div>

      {/* ─── Menu Sections ─── */}
      {MENU_SECTIONS.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sectionIndex * 0.05 }}
          className="mx-5 mt-5"
        >
          <h2 className="text-tiny font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 px-1">
            {section.title}
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card divide-y divide-slate-50 dark:divide-slate-700/50 overflow-hidden">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-slate-500 dark:text-slate-400" stroke={1.5} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-caption font-semibold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </p>
                    {item.desc && (
                      <p className="text-tiny text-slate-400 dark:text-slate-500 truncate">
                        {item.desc}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {'badge' in item && item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                        {item.badge}
                      </span>
                    )}
                    <IconChevronRight size={16} className="text-slate-300 dark:text-slate-600" stroke={1.5} />
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* ─── Danger Zone ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-5 mt-8"
      >
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-3.5 px-4 py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-card active:bg-red-50 dark:active:bg-red-950/20 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <IconLogout size={18} className="text-red-500" stroke={1.5} />
          </div>
          <span className="flex-1 text-left text-caption font-bold text-red-500">
            Log Out
          </span>
        </button>
      </motion.div>

      <p className="text-center text-tiny text-slate-300 dark:text-slate-700 mt-8">
        FaceBase v1.0.0
      </p>

      {/* ─── Sign Out Confirmation Dialog ─── */}
      {showLogoutDialog && (
        <div className="fixed inset-0 flex items-center justify-center px-6" style={{ zIndex: 99999 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
                <IconLogout size={28} className="text-red-500" stroke={1.5} />
              </div>
              <h3 className="text-heading text-slate-900 dark:text-white mb-1.5">Sign Out?</h3>
              <p className="text-caption text-slate-500 dark:text-slate-400">
                You'll need to sign in again to access your account and scan history.
              </p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 py-4 text-caption font-semibold text-slate-600 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <div className="w-px bg-slate-100 dark:bg-slate-700" />
              <button
                onClick={handleLogout}
                className="flex-1 py-4 text-caption font-bold text-red-500 active:bg-red-50 dark:active:bg-red-950/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
