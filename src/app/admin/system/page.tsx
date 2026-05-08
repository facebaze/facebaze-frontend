'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, CheckCircle2, AlertTriangle, Database, Cpu, HardDrive, RefreshCw } from 'lucide-react'
import { adminService, type SystemHealth } from '@/services/admin.service'

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.getSystemHealth()
      setHealth(data)
      setLastRefresh(new Date())
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const formatBytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Health</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 active:bg-slate-50 dark:active:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {health && (
        <>
          {/* Overall status */}
          <div className={`rounded-2xl p-5 flex items-center gap-4 ${
            health.status === 'ok'
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {health.status === 'ok' ? (
              <CheckCircle2 size={28} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={28} className="text-red-600 shrink-0" />
            )}
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {health.status === 'ok' ? 'All Systems Operational' : 'System Issues Detected'}
              </p>
              <p className="text-sm text-slate-600">
                Server uptime: {formatUptime(health.uptime)}
              </p>
            </div>
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Database */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database size={18} className="text-brand-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Database</h3>
              </div>
              <div className="flex items-center gap-2">
                {health.database?.status === 'ok' ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-red-700">Error</span>
                  </>
                )}
              </div>
            </div>

            {/* Memory */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={18} className="text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Memory</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Heap Used</span>
                  <span className="font-semibold text-slate-700">{formatBytes(health.memory?.heapUsed)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${Math.min((health.memory?.heapUsed / health.memory?.heapTotal) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Heap Total</span>
                  <span className="font-semibold text-slate-700">{formatBytes(health.memory?.heapTotal)}</span>
                </div>
              </div>
            </div>

            {/* RSS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive size={18} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">RSS Memory</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatBytes(health.memory?.rss)}</p>
              <p className="text-xs text-slate-500 mt-1">Resident set size</p>
            </div>
          </div>

          {/* Uptime detail */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Server Uptime</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.floor(health.uptime / 86400)}</p>
                <p className="text-xs text-slate-500">Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.floor((health.uptime % 86400) / 3600)}</p>
                <p className="text-xs text-slate-500">Hours</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.floor((health.uptime % 3600) / 60)}</p>
                <p className="text-xs text-slate-500">Minutes</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
