'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconUsers,
  IconScan,
  IconTrendingUp,
  IconCalendar,
  IconArrowRight,
  IconBolt,
  IconBuilding,
  IconPencil,
  IconMail,
  IconPhone,
  IconExternalLink,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconChartBar,
} from '@tabler/icons-react'
import { vendorService, type VendorDashboardStats, type RecentLead, type VendorProfile, type VendorEvent } from '@/services/vendor.service'
import LocationPicker from '@/components/ui/LocationPicker'
import ChartCard from '@/components/charts/ChartCard'

const AnalyticsBarChart = dynamic(() => import('@/components/charts/AnalyticsBarChart'), { ssr: false })
const AnalyticsDonutChart = dynamic(() => import('@/components/charts/AnalyticsDonutChart'), { ssr: false })

const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669', A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#ef4444',
}

export default function VendorDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<VendorDashboardStats | null>(null)
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [activeEvents, setActiveEvents] = useState<VendorEvent[]>([])
  const [eventPerf, setEventPerf] = useState<{
    eventName: string; totalScans: number; leads: number; consentRate: number; topGrade: string | null
  }[]>([])
  const [allGrades, setAllGrades] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsData, leadsData, profileData, eventsData] = await Promise.all([
        vendorService.getDashboardStats(),
        vendorService.getRecentLeads(5),
        vendorService.getProfile(),
        vendorService.getAssignedEvents(),
      ])
      setStats(statsData)
      setRecentLeads(leadsData)
      setProfile(profileData)
      setActiveEvents(eventsData.filter(e => e.event_status === 'active' || e.event_status === 'draft').slice(0, 3))

      // Vendor analytics
      const perfData = await vendorService.getVendorPerformance(profileData.id)
      const evts = perfData.events.slice(0, 8)
      setEventPerf(evts.map((e) => ({
        eventName: e.eventName,
        totalScans: e.totalScans,
        leads: e.leads,
        consentRate: e.consentRate,
        topGrade: e.topGrade,
      })))

      // Aggregate grades across all events
      const gradeCount: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0 }
      evts.forEach((e) => {
        if (e.topGrade && e.topGrade in gradeCount) gradeCount[e.topGrade] += e.leads
      })
      setAllGrades(
        Object.entries(gradeCount)
          .filter(([, v]) => v > 0)
          .map(([g, v]) => ({ name: `Grade ${g}`, value: v, color: GRADE_COLORS[g] ?? '#94a3b8' }))
      )
    } catch {
      setStats({
        total_leads: 0,
        total_scans: 0,
        match_rate: 0,
        opt_in_rate: 0,
        active_events: 0,
        leads_today: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const statCards = stats
    ? [
        {
          label: 'Total Leads',
          value: stats.total_leads,
          icon: IconUsers,
          color: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
        },
        {
          label: 'Total Scans',
          value: stats.total_scans,
          icon: IconScan,
          color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Match Rate',
          value: `${stats.match_rate}%`,
          icon: IconTrendingUp,
          color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        },
        {
          label: 'Active Events',
          value: stats.active_events,
          icon: IconCalendar,
          color: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-br from-brand-600 to-brand-700 pt-safe-top">
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-200 text-sm font-medium">Vendor Dashboard</p>
              <h1 className="text-white text-2xl font-bold mt-1">
                {profile ? profile.business_name : 'Welcome back'}
              </h1>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1.5 [&_span]:!text-white/80 [&_svg]:!text-white/70">
              <LocationPicker compact />
            </div>
          </div>
          {stats && stats.leads_today > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 w-fit">
              <IconBolt size={16} className="text-amber-300" />
              <span className="text-white text-sm font-medium">
                {stats.leads_today} leads captured today
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="px-5 -mt-2 space-y-5 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-card"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
                <card.icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Active Events</h2>
              <button
                onClick={() => router.push('/vendor/events')}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 active:text-brand-700"
              >
                View All
                <IconArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {activeEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/vendor/events/detail?id=${event.event_id}`)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          event.event_status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {event.event_status === 'active' ? 'Live' : 'Upcoming'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {event.event_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {event.event_city} · {event.booth_name || 'No booth'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-lg font-bold text-brand-600">{event.leads_count}</p>
                      <p className="text-[10px] text-slate-400">leads</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Business Card Preview */}
        {profile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your Business Card</h2>
              <button
                onClick={() => router.push('/vendor/settings/business-card')}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 active:text-brand-700"
              >
                <IconPencil size={12} />
                Edit
              </button>
            </div>
            <button
              onClick={() => router.push('/vendor/settings/business-card')}
              className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* Card header gradient */}
              <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-4 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
                <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-white/5 rounded-full" />
                <div className="relative flex items-start gap-3.5">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Logo"
                      className="w-14 h-14 rounded-2xl object-cover bg-white/10 border-2 border-white/20 shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border-2 border-white/10 shrink-0">
                      <IconBuilding size={24} className="text-white/60" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {profile.business_name}
                    </h3>
                    {profile.tagline ? (
                      <p className="text-xs text-white/70 mt-0.5 line-clamp-2">{profile.tagline}</p>
                    ) : (
                      <p className="text-xs text-white/40 mt-0.5 italic">+ Add a tagline</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {profile.industry && (
                        <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-white/90">
                          {profile.industry}
                        </span>
                      )}
                      <span className="text-[10px] text-white/50">{profile.contact_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact + Social row */}
              <div className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <IconMail size={11} className="text-slate-400" />
                    {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <IconPhone size={11} className="text-slate-400" />
                      {profile.phone}
                    </span>
                  )}
                  {profile.website && (
                    <span className="flex items-center gap-1.5 text-[11px] text-brand-600 dark:text-brand-400">
                      <IconExternalLink size={11} />
                      {profile.website.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
                {/* Social icons */}
                {Object.values(profile.social_links ?? {}).some(v => v) && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {profile.social_links?.linkedin && (
                      <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                        <IconBrandLinkedin size={14} className="text-[#0A66C2]" />
                      </div>
                    )}
                    {profile.social_links?.twitter && (
                      <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                        <IconBrandX size={14} className="text-slate-700 dark:text-slate-300" />
                      </div>
                    )}
                    {profile.social_links?.instagram && (
                      <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                        <IconBrandInstagram size={14} className="text-[#E4405F]" />
                      </div>
                    )}
                    {profile.social_links?.facebook && (
                      <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                        <IconBrandFacebook size={14} className="text-[#1877F2]" />
                      </div>
                    )}
                  </div>
                )}
                {/* Products preview */}
                {profile.products_services?.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.products_services.slice(0, 4).map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[10px] font-medium">
                          {p.name}
                        </span>
                      ))}
                      {profile.products_services.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                          +{profile.products_services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-750 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-1">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  Tap to edit your card
                </span>
                <IconArrowRight size={10} className="text-slate-400" />
              </div>
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            <button
              onClick={() => router.push('/vendor/scan')}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                <IconScan size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Start Scanning</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Open tablet scanner</p>
              </div>
              <IconArrowRight size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => router.push('/vendor/leads')}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <IconUsers size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">View All Leads</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Browse and export</p>
              </div>
              <IconArrowRight size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => router.push('/vendor/events')}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                <IconCalendar size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">My Events</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage assignments & tokens</p>
              </div>
              <IconArrowRight size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* ── Analytics Charts ─────────────────────────────────── */}
        {eventPerf.length > 0 && (
          <div className="space-y-4">
            {/* Leads per event bar chart */}
            <ChartCard
              title="Leads per Event"
              subtitle="Your lead capture across events"
              icon={<IconChartBar size={15} className="text-brand-500" />}
            >
              <AnalyticsBarChart
                data={eventPerf.map((e) => ({
                  name: e.eventName,
                  Scans: e.totalScans,
                  Leads: e.leads,
                }))}
                series={[
                  { key: 'Scans', label: 'Scans', color: '#818cf8' },
                  { key: 'Leads', label: 'Leads', color: '#34d399' },
                ]}
                labelKey="name"
                height={200}
                barSize={16}
                emptyMessage="No event data yet"
              />
            </ChartCard>

            {/* Bottom row: grade donut + consent bar */}
            <div className="grid grid-cols-1 gap-4">
              {allGrades.length > 0 && (
                <ChartCard
                  title="Lead Quality"
                  subtitle="Grade distribution across all events"
                  icon={<IconTrendingUp size={15} className="text-emerald-500" />}
                >
                  <AnalyticsDonutChart
                    data={allGrades}
                    centerLabel="Total Leads"
                    centerValue={allGrades.reduce((s, d) => s + d.value, 0)}
                    height={220}
                    emptyMessage="No graded leads yet"
                  />
                </ChartCard>
              )}

              <ChartCard
                title="Consent Rate by Event"
                subtitle="% of scans that converted to leads"
                icon={<IconScan size={15} className="text-violet-500" />}
              >
                <AnalyticsBarChart
                  data={eventPerf.map((e) => ({
                    name: e.eventName,
                    'Consent %': e.consentRate,
                  }))}
                  series={[{ key: 'Consent %', label: 'Consent Rate %', color: '#6366f1' }]}
                  labelKey="name"
                  height={180}
                  layout="vertical"
                  barSize={14}
                  emptyMessage="No data yet"
                />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Recent Leads */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Leads</h2>
            {recentLeads.length > 0 && (
              <button
                onClick={() => router.push('/vendor/leads')}
                className="text-xs font-semibold text-brand-600"
              >
                View All
              </button>
            )}
          </div>

          {recentLeads.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <IconUsers size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No leads captured yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Start scanning at your next event
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => router.push(`/vendor/leads/detail?id=${lead.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    {lead.attendee_photo_url ? (
                      <img
                        src={lead.attendee_photo_url}
                        alt={lead.attendee_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {lead.attendee_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {lead.attendee_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {lead.attendee_designation ?? lead.event_name}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatTimeAgo(lead.captured_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
