'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { IconLayoutDashboard, IconCalendarEvent, IconScan, IconUsers, IconSettings } from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const VENDOR_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard, href: '/vendor/dashboard' },
  { id: 'events', label: 'Events', icon: IconCalendarEvent, href: '/vendor/events' },
  { id: 'scan', label: 'Scan', icon: IconScan, href: '/vendor/scan' },
  { id: 'leads', label: 'Leads', icon: IconUsers, href: '/vendor/leads' },
  { id: 'settings', label: 'Settings', icon: IconSettings, href: '/vendor/settings' },
] as const

/**
 * Vendor app layout — bottom tab navigation + auth guard.
 * Vendor role verified before rendering.
 */
export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isInitialized, user } = useAuthStore()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/auth/welcome')
    }
    // Redirect non-vendor users
    if (isInitialized && isAuthenticated && user?.role && user.role !== 'vendor') {
      router.replace('/main/home')
    }
  }, [isAuthenticated, isInitialized, user, router])

  // Security: prevent flash of vendor content for unauthorized users
  if (!isInitialized || !isAuthenticated || user?.role !== 'vendor') return null

  // Full-screen for tablet scan
  const isFullScreen = pathname === '/vendor/scan'

  const activeTab = VENDOR_TABS.find((t) => pathname.startsWith(t.href))?.id ?? 'dashboard'

  return (
    <main className="flex flex-col min-h-screen bg-surface-secondary dark:bg-slate-950 bg-mesh-vendor relative">
      <div className="absolute inset-0 bg-lines pointer-events-none" />
      {/* Page content */}
      <div className={cn(
        'flex-1 overflow-y-auto',
        !isFullScreen && 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
      )}>
        {children}
      </div>

      {/* Tab bar — frosted glass */}
      {!isFullScreen && (
        <nav className="fixed bottom-0 left-0 right-0 tab-bar-glass z-50">
          <div className="flex items-center justify-around px-2 pt-2 pb-safe-bottom max-w-lg mx-auto">
            {VENDOR_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.href)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[56px] rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-vendor-600'
                      : 'text-slate-400 active:text-slate-600'
                  )}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={cn(
                    'relative p-1 rounded-xl transition-all duration-200',
                    isActive && 'bg-vendor-50'
                  )}>
                    <Icon
                      size={22}
                      stroke={isActive ? 2 : 1.5}
                      className="transition-all"
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] transition-colors',
                    isActive ? 'font-semibold text-vendor-600' : 'font-medium text-slate-400'
                  )}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </main>
  )
}
