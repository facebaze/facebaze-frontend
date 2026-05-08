'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft,
  Activity,
  Users,
  ScanLine,
  TrendingUp,
  Target,
  Download,
  Trophy,
  BarChart2,
  Filter,
  Award,
  Clock,
  Briefcase,
} from 'lucide-react'
import {
  organiserService,
  type EventAnalyticsSummary,
  type VendorPerformance,
  type TimelinePoint,
} from '@/services/organiser.service'

// Dynamic imports to avoid SSR issues with Recharts
const AnalyticsLineChart = dynamic(() => import('@/components/charts/AnalyticsLineChart'), { ssr: false })
const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), { ssr: false })
const AnalyticsDonutChart = dynamic(() => import('@/components/charts/AnalyticsDonutChart'), { ssr: false })
const AnalyticsFunnel = dynamic(() => import('@/components/charts/AnalyticsFunnel'), { ssr: false })
const AnalyticsHeatmap = dynamic(() => import('@/components/charts/AnalyticsHeatmap'), { ssr: false })
import ChartCard from '@/components/charts/ChartCard'

// Grade colours
const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669',
  A: '#10b981',
  B: '#6366f1',
  C: '#f59e0b',
  D: '#ef4444',
}

type IntervalKey = '1m' | '5m' | '1h'

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent: string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-5 shadow-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${accent}`}>
        {icon}
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function AnalyticsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const eventId = params.get('eventId') ?? ''

  const [summary, setSummary] = useState<EventAnalyticsSummary | null>(null)
  const [vendors, setVendors] = useState<VendorPerformance[]>([])
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [topVendors, setTopVendors] = useState<{ rank: number; vendorName: string; scanCount: number; leadsCount: number }[]>([])
  const [funnel, setFunnel] = useState<{ stage: string; count: number; color: string }[]>([])
  const [grades, setGrades] = useState<{ grade: string; count: number; percentage: number }[]>([])
  const [heatmap, setHeatmap] = useState<{ hour: number; dayOfWeek: number; count: number }[]>([])
  const [industries, setIndustries] = useState<{ name: string; count: number }[]>([])
  const [selectedInterval, setSelectedInterval] = useState<IntervalKey>('1h')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    if (!eventId) { setLoading(false); return }
    setLoading(true)
    try {
      const [summaryData, vendorData, timelineData, topData, funnelData, gradesData, heatData, profileData] =
        await Promise.allSettled([
          organiserService.getEventAnalytics(eventId),
          organiserService.getVendorBreakdown(eventId),
          organiserService.getTimeline(eventId, selectedInterval),
          organiserService.getTopVendors(eventId, 8),
          organiserService.getEventFunnel(eventId),
          organiserService.getLeadGrades(eventId),
          organiserService.getHourlyHeatmap(eventId),
          organiserService.getAttendeeProfile(eventId),
        ])

      if (summaryData.status === 'fulfilled') setSummary(summaryData.value)
      if (vendorData.status === 'fulfilled') setVendors(vendorData.value.vendors)
      if (timelineData.status === 'fulfilled') setTimeline(timelineData.value.dataPoints)
      if (topData.status === 'fulfilled') setTopVendors(topData.value.vendors)
      if (funnelData.status === 'fulfilled') setFunnel(funnelData.value.funnel)
      if (gradesData.status === 'fulfilled') setGrades(gradesData.value.grades)
      if (heatData.status === 'fulfilled') setHeatmap(heatData.value.data)
      if (profileData.status === 'fulfilled') setIndustries(profileData.value.topIndustries)
    } finally {
      setLoading(false)
    }
  }, [eventId, selectedInterval])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const handleExportCSV = async () => {
    if (!eventId || exporting) return
    setExporting(true)
    try {
      const blob = await organiserService.exportAnalyticsCSV(eventId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${eventId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  if (!eventId) {
    return (
      <div className="p-5 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-sm text-slate-500">Select an event from "My Events" to view analytics.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading analytics…</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const timelineData = timeline.map((p) => ({
    timestamp: p.timestamp,
    scanCount: p.scanCount,
    leadsApproved: p.leadsApproved,
  }))

  const vendorChartData = vendors.slice(0, 8).map((v) => ({
    name: v.vendorName,
    Scans: v.totalScans,
    Leads: v.leadsApproved,
  }))

  const gradeDonutData = grades
    .filter((g) => g.count > 0)
    .map((g) => ({
      name: `Grade ${g.grade}`,
      value: g.count,
      color: GRADE_COLORS[g.grade] ?? '#94a3b8',
    }))

  const industryData = industries.map((ind) => ({
    name: ind.name,
    Count: ind.count,
  }))

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center lg:hidden shrink-0"
          >
            <ArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">All data for this event</p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* ── KPI Summary Cards ──────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<ScanLine size={18} />}
            label="Total Scans"
            value={summary.totalScans.toLocaleString()}
            accent="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Leads Captured"
            value={summary.scansWithConsent.toLocaleString()}
            sub={`${summary.consentRate}% consent rate`}
            accent="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={<Users size={18} />}
            label="Unique Attendees"
            value={summary.uniqueAttendees.toLocaleString()}
            accent="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          />
          <StatCard
            icon={<Target size={18} />}
            label="Consent Rate"
            value={`${summary.consentRate}%`}
            sub={`${summary.scansWithoutConsent} declined`}
            accent="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* ── Row 1: Timeline + Funnel ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Scan Activity"
          subtitle="Scans and leads over time"
          icon={<Activity size={15} />}
          className="lg:col-span-2"
          action={
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-0.5">
              {(['1m', '5m', '1h'] as IntervalKey[]).map((iv) => (
                <button
                  key={iv}
                  onClick={() => setSelectedInterval(iv)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedInterval === iv
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {iv}
                </button>
              ))}
            </div>
          }
        >
          <AnalyticsLineChart
            data={timelineData}
            series={[
              { key: 'scanCount', label: 'Scans', color: '#6366f1' },
              { key: 'leadsApproved', label: 'Leads', color: '#10b981' },
            ]}
            height={220}
            emptyMessage="No scan data for this period"
          />
        </ChartCard>

        <ChartCard
          title="Attendance Funnel"
          subtitle="Expected → leads pipeline"
          icon={<Filter size={15} />}
        >
          <AnalyticsFunnel stages={funnel} className="pt-1" />
        </ChartCard>
      </div>

      {/* ── Row 2: Lead Grades + Vendor Bar ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Lead Grade Distribution"
          subtitle="Quality breakdown of captured leads"
          icon={<Award size={15} />}
        >
          <AnalyticsDonutChart
            data={gradeDonutData}
            centerLabel="Scored Leads"
            centerValue={gradeDonutData.reduce((s, d) => s + d.value, 0)}
            height={260}
            emptyMessage="No graded leads yet"
          />
        </ChartCard>

        <ChartCard
          title="Vendor Comparison"
          subtitle="Scans vs leads per vendor"
          icon={<BarChart2 size={15} />}
          className="lg:col-span-2"
        >
          <AnalyticsBarChart
            data={vendorChartData}
            series={[
              { key: 'Scans', label: 'Scans', color: '#818cf8' },
              { key: 'Leads', label: 'Leads', color: '#34d399' },
            ]}
            labelKey="name"
            height={240}
            emptyMessage="No vendor data yet"
            barSize={14}
          />
        </ChartCard>
      </div>

      {/* ── Row 3: Heatmap + Industries ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Peak Activity Hours"
          subtitle="Scan frequency by day & hour"
          icon={<Clock size={15} />}
        >
          <AnalyticsHeatmap data={heatmap} className="mt-1" />
        </ChartCard>

        <ChartCard
          title="Attendee Industries"
          subtitle="Top industries from consented scans"
          icon={<Briefcase size={15} />}
        >
          <AnalyticsBarChart
            data={industryData}
            series={[{ key: 'Count', label: 'Attendees', color: '#6366f1' }]}
            labelKey="name"
            height={260}
            layout="vertical"
            emptyMessage="No profile data yet — requires consented scans"
          />
        </ChartCard>
      </div>

      {/* ── Top Vendors Leaderboard ───────────────────────────── */}
      {topVendors.length > 0 && (
        <ChartCard
          title="Top Vendors"
          subtitle="Ranked by scan count"
          icon={<Trophy size={15} />}
          noPad
        >
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {topVendors.map((v) => {
              const total = topVendors[0].scanCount || 1
              const pct = (v.scanCount / total) * 100
              return (
                <div key={v.vendorName} className="flex items-center gap-4 px-5 py-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      v.rank === 1
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : v.rank === 2
                        ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200'
                        : v.rank === 3
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {v.rank === 1 ? '🥇' : v.rank === 2 ? '🥈' : v.rank === 3 ? '🥉' : v.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{v.vendorName}</p>
                    <div className="mt-1.5 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{v.scanCount}</p>
                      <p className="text-[10px] text-slate-400">Scans</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{v.leadsCount}</p>
                      <p className="text-[10px] text-slate-400">Leads</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>
      )}

      {/* ── Full Vendor Table ─────────────────────────────────── */}
      {vendors.length > 0 && (
        <ChartCard
          title="Vendor Performance Breakdown"
          subtitle="Detailed metrics per vendor"
          icon={<BarChart2 size={15} />}
          noPad
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Vendor</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Scans</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Leads</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Declined</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Consent</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {vendors.map((v) => (
                  <tr key={v.vendorId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {v.vendorName}
                    </td>
                    <td className="px-3 py-3.5 text-right text-slate-700 dark:text-slate-300">{v.totalScans}</td>
                    <td className="px-3 py-3.5 text-right font-semibold text-emerald-600">{v.leadsApproved}</td>
                    <td className="px-3 py-3.5 text-right text-red-500">{v.leadsDenied}</td>
                    <td className="px-3 py-3.5 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        v.consentRate >= 70
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : v.consentRate >= 40
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      }`}>
                        {v.consentRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-slate-500 dark:text-slate-400">
                      {(v.avgMatchConfidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* Empty state if no data at all */}
      {!summary && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Activity size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">No data yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
            Analytics will appear once attendees are scanned at this event.
          </p>
        </div>
      )}
    </div>
  )
}

export default function OrganiserAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  )
}
