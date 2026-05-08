'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconBuilding,
  IconDeviceTablet,
  IconFileText,
  IconLogout,
  IconChevronRight,
  IconCreditCard,
  IconHelp,
  IconBell,
  IconId,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { vendorService, type VendorProfile } from '@/services/vendor.service'
import { DarkModeToggle } from '@/components/ui'

export default function VendorSettingsPage() {
  const router = useRouter()
  const { logout } = useAuthStore()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    vendorService
      .getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    await logout()
    router.replace('/auth/welcome')
  }

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: IconId,
          label: 'Business Card',
          sub: 'Profile, brand & what attendees see',
          href: '/vendor/settings/business-card',
        },
        {
          icon: IconBell,
          label: 'Notifications',
          sub: 'Email & push preferences',
          href: '/vendor/settings/notifications',
        },
      ],
    },
    {
      title: 'Event Management',
      items: [
        {
          icon: IconDeviceTablet,
          label: 'Tablet Tokens',
          sub: 'Manage device authentication',
          href: '/vendor/settings/tablets',
        },
      ],
    },
    {
      title: 'Subscription',
      items: [
        {
          icon: IconCreditCard,
          label: 'Billing & Plan',
          sub: 'Manage subscription',
          href: '/vendor/settings/billing',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: IconHelp,
          label: 'Help & FAQ',
          sub: 'Get support',
          href: '/vendor/settings/help',
        },
        {
          icon: IconFileText,
          label: 'Terms of Service',
          sub: 'Legal & privacy',
          href: '/vendor/settings/terms',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Vendor profile card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ) : profile ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vendor-500 to-vendor-700 flex items-center justify-center">
                <IconBuilding size={24} className="text-white" stroke={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {profile.business_name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{profile.contact_name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{profile.email}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                profile.status === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {profile.status}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Unable to load profile</p>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Appearance</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Auto = dark at night</span>
          </div>
          <DarkModeToggle />
        </div>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon size={16} className="text-slate-600 dark:text-slate-400" stroke={1.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.sub}</p>
                    </div>
                    <IconChevronRight size={16} className="text-slate-300 dark:text-slate-600" stroke={1.5} />
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm font-semibold active:bg-red-100 dark:active:bg-red-950/40 transition-colors"
        >
          <IconLogout size={16} stroke={1.5} />
          Log Out
        </button>
      </div>

      {/* Sign-out confirmation dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutDialog(false)} />
          <div className="relative w-full sm:max-w-sm mx-4 mb-safe-bottom sm:mb-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <IconLogout size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign out?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You&apos;ll need to sign in again to access your vendor account.
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                Yes, sign out
              </button>
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
