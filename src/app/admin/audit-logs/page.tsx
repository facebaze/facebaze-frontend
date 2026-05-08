'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardList,
  Download,
  Search,
  X,
  CalendarDays,
  Filter,
} from 'lucide-react'
import { adminService, type AuditLog, type AuditActionSummary } from '@/services/admin.service'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [summary, setSummary] = useState<AuditActionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit: 30,
        action: actionFilter || undefined,
        resourceType: resourceFilter || undefined,
      })
      setLogs(res?.data ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, resourceFilter])

  const fetchSummary = useCallback(async () => {
    try {
      const data = await adminService.getActionSummary()
      setSummary(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleExport = async () => {
    try {
      const blob = await adminService.exportAuditLogsCSV()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / 30)

  const statusColors: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-600',
    pending: 'bg-amber-100 text-amber-700',
  }

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} audit entries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 active:bg-slate-50 dark:active:bg-slate-700"
          >
            <Filter size={12} />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Action summary chips */}
      {summary.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {summary.slice(0, 8).map((s) => (
            <button
              key={s.action}
              onClick={() => {
                setActionFilter(actionFilter === s.action ? '' : s.action)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                actionFilter === s.action
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
              }`}
            >
              {s.action} ({s.count})
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Action</label>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
              placeholder="e.g. ban_user"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Resource Type</label>
            <input
              type="text"
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
              placeholder="e.g. user, vendor"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
        </div>
      )}

      {/* Logs list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
          {logs.map((log) => (
            <div key={log.id} className="px-5 py-3">
              <div className="flex items-start justify-between mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase">{log.action}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[log.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-3">
                  {formatDateTime(log.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                <span>Resource: <strong className="text-slate-500 dark:text-slate-400">{log.resource_type}</strong></span>
                <span>ID: <strong className="text-slate-500 dark:text-slate-400">{log.resource_id?.slice(0, 8)}...</strong></span>
                {log.ip_address && <span>IP: {log.ip_address}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
