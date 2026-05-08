'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Users,
  ScanLine,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowRight,
  PlusCircle,
} from 'lucide-react'
import { organiserService, type OrgDashboardStats, type OrgEvent } from '@/services/organiser.service'
import ChartCard from '@/components/charts/ChartCard'

const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), { ssr: false })

export default function OrganiserDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<OrgDashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<OrgEvent[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [eventComparison, setEventComparison] = useState<{
    eventName: string; scans: number; leads: number; consentRate: number
  }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsData, eventsData, orgData] = await Promise.all([
        organiserService.getDashboardStats(),
        organiserService.listEvents(),
        organiserService.getOrganisation(),
      ])
      setStats(statsData)
      setRecentEvents(eventsData.slice(0, 5))
      setOrgId(orgData.id)

      // Fetch event comparison
      const comparison = await organiserService.getOrgEventComparison(orgData.id)
      setEventComparison(
        comparison.events.slice(0, 8).map((e) => ({
          eventName: e.eventName,
          scans: e.scans,
          leads: e.leads,
          consentRate: e.consentRate,
        }))
      )
    } catch {
      setStats({
        total_events: 0,
        active_events: 0,
        total_vendors: 0,
        total_scans: 0,
        total_leads: 0,
        total_attendees_opted_in: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = stats
    ? [
        { label: 'Total Events', value: stats.total_events, icon: CalendarDays, color: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' },
        { label: 'Active Events', value: stats.active_events, icon: Zap, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
        { label: 'Total Vendors', value: stats.total_vendors, icon: Users, color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
        { label: 'Total Scans', value: stats.total_scans, icon: ScanLine, color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
        { label: 'Leads Captured', value: stats.total_leads, icon: TrendingUp, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
        { label: 'Attendees Opted In', value: stats.total_attendees_opted_in, icon: BarChart3, color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
      ]
    : []

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    draft: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    completed: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
  }

  return (
    <div className="px-5 pt-1 lg:px-8 space-y-5 pb-8 max-w-6xl">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Overview of your events and performance</p>
        </div>
        <button
          onClick={() => router.push('/organiser/events/create')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 transition-colors"
        >
          <PlusCircle size={16} />
          Create Event
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-5 shadow-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Events</h2>
          <button
            onClick={() => router.push('/organiser/events')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CalendarDays size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No events yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first event to get started</p>
            <button
              onClick={() => router.push('/organiser/events/create')}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => router.push(`/organiser/events/detail?id=${event.id}`)}
                className="w-full flex items-center gap-4 px-5 py-4 active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{event.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{event.city}</span>
                    <span>{formatDate(event.event_start_date)} – {formatDate(event.event_end_date)}</span>
                  </div>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{event.total_vendors}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Vendors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{event.total_leads}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Leads</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Event Performance Chart */}
      {eventComparison.length > 0 && (
        <ChartCard
          title="Event Performance"
          subtitle="Scans vs leads across your events"
          icon={<BarChart3 size={15} className="text-brand-500" />}
          action={
            <button
              onClick={() => router.push('/organiser/analytics')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400"
            >
              Full Analytics
            </button>
          }
        >
          <AnalyticsBarChart
            data={eventComparison.map((e) => ({ name: e.eventName, Scans: e.scans, Leads: e.leads }))}
            series={[
              { key: 'Scans', label: 'Scans', color: '#818cf8' },
              { key: 'Leads', label: 'Leads', color: '#34d399' },
            ]}
            labelKey="name"
            height={200}
            barSize={14}
            emptyMessage="No event data yet"
          />
        </ChartCard>
      )}
    </div>
  )
}
