'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconHome, IconScan, IconCalendarEvent, IconAddressBook, IconSettings } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { notificationService } from '@/services/notification.service'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'home', label: 'Explore', icon: IconHome, href: '/main/home' },
  { id: 'events', label: 'Events', icon: IconCalendarEvent, href: '/main/events' },
  { id: 'scan', label: 'Scan', icon: IconScan, href: '/main/scan' },
  { id: 'connections', label: 'Contacts', icon: IconAddressBook, href: '/main/connections' },
  { id: 'settings', label: 'Settings', icon: IconSettings, href: '/main/settings' },
] as const

/**
 * Main app layout — tab navigation + auth guard.
 * Only accessible after authentication + completed onboarding.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isInitialized } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/auth/welcome')
    }
  }, [isAuthenticated, isInitialized, router])

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getUnreadCount().then(setUnreadCount).catch(() => {})
    }
  }, [isAuthenticated, pathname])

  if (!isInitialized || !isAuthenticated) return null

  // Hide tab bar on full-screen pages (scan camera)
  const hideTabBar = pathname === '/main/scan'

  const activeTab = TABS.find((t) => pathname.startsWith(t.href))?.id ?? 'home'

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-700">
      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))] isolate" style={{ zIndex: 0 }}>
        {children}
      </div>

      {/* Tab bar — frosted glass with elevated scan FAB */}
      {!hideTabBar && (
        <nav className="fixed bottom-0 left-0 right-0" style={{ zIndex: 9999 }}>
          {/* Glass background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50" />
          <div className="relative flex items-end justify-around px-2 pt-2 pb-safe-bottom max-w-lg mx-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              const isScan = tab.id === 'scan'

              if (isScan) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className="flex flex-col items-center justify-center -mt-5 relative z-10"
                    aria-label={tab.label}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        'bg-gradient-to-br from-brand-500 to-brand-700',
                        'shadow-[0_4px_20px_rgb(185_28_28/0.4)]',
                      )}
                    >
                      <Icon size={24} className="text-white" stroke={2} />
                    </motion.div>
                    <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-1">
                      {tab.label}
                    </span>
                  </button>
                )
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.href)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px] rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
                  )}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <div className={cn(
                      'p-1.5 rounded-xl transition-all duration-200',
                      isActive && 'bg-brand-50 dark:bg-brand-950'
                    )}>
                      <Icon
                        size={20}
                        stroke={isActive ? 2 : 1.5}
                        className="transition-all"
                      />
                    </div>
                    {/* Active indicator dot */}
                    {tab.id === 'settings' && false && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
