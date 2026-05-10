'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  IconArrowLeft,
  IconScan,
  IconUsers,
  IconActivity,
  IconAward,
  IconTarget,
} from '@tabler/icons-react'
import { vendorService } from '@/services/vendor.service'
import ChartCard from '@/components/charts/ChartCard'

const AnalyticsLineChart = dynamic(() => import('@/components/charts/AnalyticsLineChart'), { ssr: false })
const AnalyticsDonutChart = dynamic(() => import('@/components/charts/AnalyticsDonutChart'), { ssr: false })
const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), { ssr: false })

const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669', A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#ef4444',
}

function VendorEventAnalyticsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const eventId = params.get('eventId') ?? ''
  const eventName = params.get('eventName') ?? 'Event'

  const [vendorId, setVendorId] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<{ timestamp: string; scanCount: number; leads: number }[]>([])
  const [grades, setGrades] = useState<{ name: string; value: number; color: string }[]>([])
  const [summary, setSummary] = useState<{
    totalScans: number; totalLeads: number; consentRate: number; avgConfidence: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!eventId) { setLoading(false); return }
    try {
      // Resolve vendor ID from profile
      const profile = await vendorService.getProfile()
      const vid = profile.id
      setVendorId(vid)

      const [timelineData, gradesData, perfData] = await Promise.allSettled([
        vendorService.getVendorEventTimeline(vid, eventId),
        vendorService.getVendorEventLeadGrades(vid, eventId),
        vendorService.getVendorPerformance(vid),
      ])

      if (timelineData.status === 'fulfilled') {
        setTimeline(timelineData.value.dataPoints)
      }
      if (gradesData.status === 'fulfilled') {
        setGrades(
          gradesData.value.grades
            .filter((g) => g.count > 0)
            .map((g) => ({
              name: `Grade ${g.grade}`,
              value: g.count,
              color: GRADE_COLORS[g.grade] ?? '#94a3b8',
            }))
        )
      }
      if (perfData.status === 'fulfilled') {
        const thisEvent = perfData.value.events.find((e) => e.eventId === eventId)
        if (thisEvent) {
          setSummary({
            totalScans: thisEvent.totalScans,
            totalLeads: thisEvent.leads,
            consentRate: thisEvent.consentRate,
            avgConfidence: thisEvent.avgConfidence,
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => { fetchData() }, [fetchData])

  if (!eventId) {
    return (
      <div className="p-5 text-center py-20">
        <p className="text-slate-500 text-sm">Missing event ID.</p>
        <button onClick={() => router.back()} className="mt-4 text-brand-600 text-sm font-semibold">
          Go Back
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading analytics…</p>
        </div>
      </div>
    )
  }

  const gradeTotal = grades.reduce((s, d) => s + d.value, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3 pt-safe-top">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
              {eventName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your performance at this event</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 space-y-4 pb-safe-bottom">
        {/* KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-2">
                <IconScan size={16} className="text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.totalScans}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Scans</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                <IconUsers size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.totalLeads}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leads Captured</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                <IconTarget size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.consentRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consent Rate</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-2">
                <IconActivity size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.avgConfidence}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Match Score</p>
            </div>
          </div>
        )}

        {/* Scan Timeline */}
        <ChartCard
          title="Scan Timeline"
          subtitle="Your scans and leads by hour"
          icon={<IconActivity size={15} className="text-brand-500" />}
        >
          <AnalyticsLineChart
            data={timeline.map((p) => ({
              timestamp: p.timestamp,
              scanCount: p.scanCount,
              leads: p.leads,
            }))}
            series={[
              { key: 'scanCount', label: 'Scans', color: '#6366f1' },
              { key: 'leads', label: 'Leads', color: '#10b981' },
            ]}
            height={200}
            emptyMessage="No scan data for this event"
          />
        </ChartCard>

        {/* Lead Grade Donut */}
        <ChartCard
          title="Lead Grades"
          subtitle="Quality breakdown of your leads"
          icon={<IconAward size={15} className="text-emerald-500" />}
        >
          <AnalyticsDonutChart
            data={grades}
            centerLabel="Graded Leads"
            centerValue={gradeTotal}
            height={240}
            emptyMessage="No graded leads at this event yet"
          />
        </ChartCard>

        {/* Grade bar chart */}
        {grades.length > 0 && (
          <ChartCard
            title="Grade Breakdown"
            subtitle="Number of leads per grade"
            icon={<IconAward size={15} className="text-amber-500" />}
          >
            <AnalyticsBarChart
              data={grades.map((g) => ({ grade: g.name.replace('Grade ', ''), count: g.value }))}
              series={[{ key: 'count', label: 'Leads', color: '#6366f1' }]}
              labelKey="grade"
              height={180}
              barSize={32}
              emptyMessage=""
            />
          </ChartCard>
        )}

        {/* Empty state */}
        {!summary && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <IconActivity size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
            <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">No data yet</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
              Analytics will appear after your first scan at this event.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VendorEventAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VendorEventAnalyticsContent />
    </Suspense>
  )
}
