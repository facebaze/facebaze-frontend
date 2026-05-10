'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  ClipboardList,
  Activity,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: ShieldCheck },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  { label: 'System Health', href: '/admin/system', icon: Activity },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const logout = useAuthStore((s) => s.logout)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = useCallback(async () => {
    setShowLogoutDialog(false)
    await logout()
    router.replace('/auth/login')
  }, [logout, router])

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login')
      return
    }
    const role = user?.role
    if (role !== 'admin' && role !== 'super_admin') {
      router.replace('/main/home')
    }
  }, [isAuthenticated, user, router])

  // Security: prevent flash of admin content for unauthorized users
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  if (!isAuthenticated || !isAdmin) return null

  const activeItem = useMemo(
    () => navItems.find((item) => pathname.startsWith(item.href))?.href ?? '',
    [pathname],
  )

  const Sidebar = (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo area */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">FaceBase</h2>
          <p className="text-[10px] text-slate-400 font-medium">Admin Panel</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeItem === item.href
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-600 mt-0.5 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-[100dvh] bg-surface-secondary dark:bg-slate-950 bg-mesh-admin relative">
      <div className="absolute inset-0 bg-lines pointer-events-none" />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-slate-800">
        {Sidebar}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full animate-slide-right">{Sidebar}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-surface-primary dark:bg-slate-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <Menu size={18} className="text-slate-700" />
          </button>
          <h1 className="text-base font-bold text-slate-900">Admin</h1>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          />
          <div className="relative w-full sm:max-w-sm mx-4 mb-safe-bottom sm:mb-0 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <LogOut size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sign out?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You&apos;ll need to sign in again to access the admin panel.
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
