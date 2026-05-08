'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconChartBar,
  IconSettings,
  IconCirclePlus,
  IconChevronLeft,
  IconMenu2,
  IconX,
  IconBuilding,
} from '@tabler/icons-react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/organiser/dashboard',
  },
  {
    id: 'events',
    label: 'My Events',
    icon: IconCalendarEvent,
    href: '/organiser/events',
  },
  {
    id: 'create',
    label: 'Create Event',
    icon: IconCirclePlus,
    href: '/organiser/events/create',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: IconChartBar,
    href: '/organiser/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: IconSettings,
    href: '/organiser/settings',
  },
] as const

/**
 * Organiser layout — responsive sidebar navigation.
 * Mobile: bottom sheet drawer. Tablet/Desktop: fixed sidebar.
 */
export default function OrganiserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/auth/welcome')
    }
    if (isInitialized && isAuthenticated && user?.role && !['organizer', 'admin', 'super_admin'].includes(user.role)) {
      router.replace('/main/home')
    }
  }, [isAuthenticated, isInitialized, user, router])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!isInitialized || !isAuthenticated) return null

  const activeItem = NAV_ITEMS.find((item) =>
    pathname.startsWith(item.href)
  )?.id ?? 'dashboard'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
              <IconBuilding size={18} className="text-white" stroke={1.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">FaceBase</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Organiser</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100'
                )}
              >
                <item.icon size={18} stroke={isActive ? 2 : 1.5} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer — org info */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <IconBuilding size={14} className="text-slate-500 dark:text-slate-400" stroke={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {user?.email ?? 'Organiser'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — mobile */}
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 pt-safe-top">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <IconMenu2 size={18} className="text-slate-700 dark:text-slate-300" stroke={1.5} />
            </button>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {NAV_ITEMS.find((i) => i.id === activeItem)?.label ?? 'Organiser'}
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-5 pb-10 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
