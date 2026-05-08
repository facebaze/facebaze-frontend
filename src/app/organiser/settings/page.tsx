'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconBuilding,
  IconCreditCard,
  IconHelp,
  IconLogout,
  IconBell,
  IconShield,
  IconChevronRight,
  IconUserCog,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { DarkModeToggle } from '@/components/ui'

export default function OrganiserSettingsPage() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    await logout()
    router.replace('/auth/welcome')
  }

  const sections = [
    {
      title: 'Organisation',
      items: [
        { label: 'Organisation Profile', icon: IconBuilding, href: '/organiser/settings/profile' },
        { label: 'Team Members', icon: IconUserCog, href: '/organiser/settings/team', subtitle: 'Manage admins and staff' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: IconBell, href: '/organiser/settings/notifications' },
        { label: 'Billing & Plans', icon: IconCreditCard, href: '/organiser/settings/billing' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Centre', icon: IconHelp, href: '/organiser/settings/help' },
        { label: 'Privacy & Terms', icon: IconShield, href: '/organiser/settings/terms' },
      ],
    },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

      {/* Appearance */}
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 px-1">
          Appearance
        </p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Auto = dark at night</span>
          </div>
          <DarkModeToggle />
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 px-1">
            {section.title}
          </p>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-slate-600 dark:text-slate-400" stroke={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.subtitle}</p>
                    )}
                  </div>
                  <IconChevronRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" stroke={1.5} />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={() => setShowLogoutDialog(true)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 active:bg-red-50 dark:active:bg-red-950/20 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
          <IconLogout size={18} className="text-red-500 dark:text-red-400" stroke={1.5} />
        </div>
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Sign Out</p>
      </button>

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
                You&apos;ll need to sign in again to access your organiser account.
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
