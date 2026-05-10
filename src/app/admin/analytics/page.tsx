'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import {
  BarChart3,
  Users,
  ShieldCheck,
  CalendarDays,
  ScanLine,
  TrendingUp,
  Award,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { adminService, type PlatformAnalytics, type AdminDashboardSummary } from '@/services/admin.service'
import ChartCard from '@/components/charts/ChartCard'

const AnalyticsLineChart = dynamic(() => import('@/components/charts/AnalyticsLineChart'), { ssr: false })
const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), { ssr: false })
const AnalyticsDonutChart = dynamic(() => import('@/components/charts/AnalyticsDonutChart'), { ssr: false })

const ROLE_COLORS: Record<string, string> = {
  customer: '#3b82f6',
  vendor: '#8b5cf6',
  organiser: '#10b981',
  admin: '#f59e0b',
  super_admin: '#ef4444',
  unknown: '#94a3b8',
}

const VENDOR_STATUS_COLORS = ['#10b981', '#f59e0b']

const EVENT_STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  draft: '#94a3b8',
  completed: '#3b82f6',
  cancelled: '#ef4444',
  upcoming: '#8b5cf6',
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, analyticsData] = await Promise.allSettled([
        adminService.getDashboardSummary(),
        adminService.getPlatformAnalytics(),
      ])
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value)
      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value)
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

  const kpis = summary
    ? [
        { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
        { label: 'Total Vendors', value: summary.totalVendors, icon: ShieldCheck, color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
        { label: 'Active Events', value: summary.activeEvents, icon: CalendarDays, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
        { label: 'Total Scans', value: summary.totalScans, icon: ScanLine, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
        { label: 'Consent Rate', value: `${analytics?.consentRate ?? 0}%`, icon: CheckCircle2, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
        { label: 'Pending Vendors', value: summary.pendingVendors, icon: Activity, color: summary.pendingVendors > 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
      ]
    : []

  // Prepare chart data
  const userRoleData = (analytics?.userRoles || []).map((r) => ({
    name: r.name.replace('_', ' '),
    value: r.value,
    color: ROLE_COLORS[r.name] || '#94a3b8',
  }))

  const vendorStatusData = (analytics?.vendorStatus || []).map((v, i) => ({
    name: v.name,
    value: v.value,
    color: VENDOR_STATUS_COLORS[i] || '#94a3b8',
  }))

  const eventStatusData = (analytics?.eventStatuses || []).map((e) => ({
    name: e.name,
    value: e.value,
    color: EVENT_STATUS_COLORS[e.name] || '#94a3b8',
  }))

  const dailyScanData = (analytics?.dailyScans || []).map((d) => ({
    timestamp: d.date.slice(5), // MM-DD
    Scans: d.scans,
    Leads: d.leads,
  }))

  const topEventData = (analytics?.topEvents || []).map((e) => ({
    name: e.eventName,
    Scans: e.totalScans,
    Leads: e.leads,
  }))

  const topVendorData = (analytics?.topVendors || []).map((v) => ({
    name: v.vendorName,
    Scans: v.totalScans,
    Leads: v.leads,
  }))

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 size={24} className="text-brand-500" />
          Platform Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide metrics and performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {kpis.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-5 shadow-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Daily Scans Timeline (large) */}
      {dailyScanData.length > 0 && (
        <ChartCard
          title="Scan Activity (Last 30 Days)"
          subtitle="Daily scans and lead conversions across the platform"
          icon={<TrendingUp size={15} className="text-brand-500" />}
        >
          <AnalyticsLineChart
            data={dailyScanData}
            series={[
              { key: 'Scans', label: 'Total Scans', color: '#3b82f6' },
              { key: 'Leads', label: 'Leads Captured', color: '#10b981' },
            ]}
            height={260}
            emptyMessage="No scan data in the last 30 days"
          />
        </ChartCard>
      )}

      {/* Row 2: Donut trio — User Roles, Vendor Status, Event Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartCard
          title="User Roles"
          subtitle="Breakdown by account type"
          icon={<Users size={15} className="text-blue-500" />}
        >
          <AnalyticsDonutChart
            data={userRoleData}
            centerLabel="Users"
            centerValue={userRoleData.reduce((s, d) => s + d.value, 0)}
            height={200}
            emptyMessage="No user data"
          />
        </ChartCard>

        <ChartCard
          title="Vendor Status"
          subtitle="Approved vs pending"
          icon={<ShieldCheck size={15} className="text-violet-500" />}
        >
          <AnalyticsDonutChart
            data={vendorStatusData}
            centerLabel="Vendors"
            centerValue={analytics?.totalVendors ?? 0}
            height={200}
            emptyMessage="No vendor data"
          />
        </ChartCard>

        <ChartCard
          title="Event Status"
          subtitle="Distribution by lifecycle stage"
          icon={<CalendarDays size={15} className="text-emerald-500" />}
        >
          <AnalyticsDonutChart
            data={eventStatusData}
            centerLabel="Events"
            centerValue={eventStatusData.reduce((s, d) => s + d.value, 0)}
            height={200}
            emptyMessage="No event data"
          />
        </ChartCard>
      </div>

      {/* Row 3: Top Events + Top Vendors bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topEventData.length > 0 && (
          <ChartCard
            title="Top Events"
            subtitle="By total scan volume"
            icon={<CalendarDays size={15} className="text-brand-500" />}
          >
            <AnalyticsBarChart
              data={topEventData}
              series={[
                { key: 'Scans', label: 'Scans', color: '#3b82f6' },
                { key: 'Leads', label: 'Leads', color: '#10b981' },
              ]}
              labelKey="name"
              height={220}
              barSize={14}
              emptyMessage="No event data"
            />
          </ChartCard>
        )}

        {topVendorData.length > 0 && (
          <ChartCard
            title="Top Vendors"
            subtitle="By total scan volume"
            icon={<Award size={15} className="text-amber-500" />}
          >
            <AnalyticsBarChart
              data={topVendorData}
              series={[
                { key: 'Scans', label: 'Scans', color: '#8b5cf6' },
                { key: 'Leads', label: 'Leads', color: '#10b981' },
              ]}
              labelKey="name"
              height={220}
              barSize={14}
              emptyMessage="No vendor data"
            />
          </ChartCard>
        )}
      </div>

      {/* Row 4: Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Events Table */}
        {(analytics?.topEvents?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <CalendarDays size={15} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Event Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-500">#</th>
                    <th className="text-left px-2 py-2.5 text-xs font-medium text-slate-500">Event</th>
                    <th className="text-right px-2 py-2.5 text-xs font-medium text-slate-500">Scans</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-slate-500">Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {analytics!.topEvents.map((e, i) => (
                    <tr key={e.eventId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className="text-xs font-bold text-slate-400">{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</span>
                      </td>
                      <td className="px-2 py-2.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{e.eventName}</td>
                      <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-400 tabular-nums">{e.totalScans}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-emerald-600 tabular-nums">{e.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Vendors Table */}
        {(analytics?.topVendors?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <Award size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Vendor Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-500">#</th>
                    <th className="text-left px-2 py-2.5 text-xs font-medium text-slate-500">Vendor</th>
                    <th className="text-right px-2 py-2.5 text-xs font-medium text-slate-500">Scans</th>
                    <th className="text-right px-2 py-2.5 text-xs font-medium text-slate-500">Leads</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-slate-500">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {analytics!.topVendors.map((v, i) => (
                    <tr key={v.vendorId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className="text-xs font-bold text-slate-400">{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</span>
                      </td>
                      <td className="px-2 py-2.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{v.vendorName}</td>
                      <td className="px-2 py-2.5 text-right text-slate-600 dark:text-slate-400 tabular-nums">{v.totalScans}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-emerald-600 tabular-nums">{v.leads}</td>
                      <td className="px-5 py-2.5 text-right text-slate-500 tabular-nums">{v.eventsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
