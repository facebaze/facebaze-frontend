'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  ShieldCheck,
  CalendarDays,
  ScanLine,
  AlertCircle,
  ChevronRight,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { adminService, type AdminDashboardSummary, type SystemHealth } from '@/services/admin.service'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, healthData] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getSystemHealth(),
      ])
      setSummary(summaryData)
      setHealth(healthData)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = summary
    ? [
        { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'bg-brand-50 text-brand-600' },
        { label: 'Total Vendors', value: summary.totalVendors, icon: ShieldCheck, color: 'bg-violet-50 text-violet-600' },
        { label: 'Active Events', value: summary.activeEvents, icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Total Scans', value: summary.totalScans, icon: ScanLine, color: 'bg-amber-50 text-amber-600' },
      ]
    : []

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: Users },
    { label: 'Manage Vendors', href: '/admin/vendors', icon: ShieldCheck },
    { label: 'All Events', href: '/admin/events', icon: CalendarDays },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
  ]

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    return d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor system health and key metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 lg:p-5 shadow-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending vendors alert */}
      {summary && summary.pendingVendors > 0 && (
        <button
          onClick={() => router.push('/admin/vendors')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 active:bg-amber-100 transition-colors text-left"
        >
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {summary.pendingVendors} Vendor{summary.pendingVendors > 1 ? 's' : ''} Pending Approval
            </p>
            <p className="text-xs text-amber-600">Tap to review and approve</p>
          </div>
          <ChevronRight size={16} className="text-amber-400" />
        </button>
      )}

      {/* System health + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System health */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-brand-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">System Health</h2>
          </div>
          {health ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  health.status === 'ok'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {health.status === 'ok' ? 'Healthy' : health.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Database</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  health.database?.status === 'ok'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {health.database?.status === 'ok' ? 'Connected' : 'Error'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Uptime</span>
                <span className="text-xs font-semibold text-slate-700">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Memory</span>
                <span className="text-xs font-semibold text-slate-700">
                  {Math.round(health.memory?.heapUsed / 1024 / 1024)}MB / {Math.round(health.memory?.heapTotal / 1024 / 1024)}MB
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Unable to fetch health data</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl active:bg-slate-50 dark:active:bg-slate-700 transition-colors text-left"
              >
                <link.icon size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 flex-1">{link.label}</span>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
