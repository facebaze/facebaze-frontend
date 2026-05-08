'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { adminService, type AdminVendor } from '@/services/admin.service'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'
type ActionType = 'approve' | 'reject' | 'suspend' | 'activate'

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ vendor: AdminVendor; action: ActionType } | null>(null)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const approved =
        filter === 'approved' ? true : filter === 'pending' || filter === 'rejected' ? false : undefined
      const res = await adminService.getVendors({
        page,
        limit: 20,
        approved,
        search: search || undefined,
      })
      setVendors(res.data)
      setTotal(res.total)
    } catch {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => {
    const timeout = setTimeout(fetchVendors, search ? 400 : 0)
    return () => clearTimeout(timeout)
  }, [fetchVendors])

  const handleApprove = (vendor: AdminVendor) => setConfirmAction({ vendor, action: 'approve' })
  const handleReject = (vendor: AdminVendor) => setConfirmAction({ vendor, action: 'reject' })
  const handleSuspend = (vendor: AdminVendor) => setConfirmAction({ vendor, action: 'suspend' })
  const handleActivate = (vendor: AdminVendor) => setConfirmAction({ vendor, action: 'activate' })

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    const { vendor, action } = confirmAction
    setConfirmAction(null)
    setActioningId(vendor.id)
    try {
      if (action === 'approve') {
        await adminService.approveVendor(vendor.id)
        setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, approved: true, status: 'approved' } : v))
      } else if (action === 'reject') {
        await adminService.rejectVendor(vendor.id)
        setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, approved: false, status: 'rejected' } : v))
      } else if (action === 'suspend') {
        await adminService.suspendVendor(vendor.id)
        setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, status: 'suspended' } : v))
      } else if (action === 'activate') {
        await adminService.activateVendor(vendor.id)
        setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, status: 'active', approved: true } : v))
      }
    } catch { /* ignore */ } finally {
      setActioningId(null)
    }
  }

  const totalPages = Math.ceil(total / 20)

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
  ]

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} vendors registered</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 active:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">No vendors found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0">
                <span className="text-white text-base font-bold">{vendor.business_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{vendor.business_name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    vendor.status === 'suspended'
                      ? 'bg-orange-100 text-orange-700'
                      : vendor.approved
                      ? 'bg-emerald-100 text-emerald-700'
                      : vendor.status === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {vendor.status === 'suspended' ? 'Suspended' : vendor.approved ? 'Approved' : vendor.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{vendor.contact_name} • {vendor.email}</p>
                {vendor.industry && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{vendor.industry}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {!vendor.approved && vendor.status !== 'rejected' && (
                  <>
                    <button
                      onClick={() => handleApprove(vendor)}
                      disabled={actioningId === vendor.id}
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                      title="Approve"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(vendor)}
                      disabled={actioningId === vendor.id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-40"
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
                {vendor.approved && vendor.status !== 'suspended' && (
                  <>
                    <ShieldCheck size={18} className="text-emerald-400 mt-2" />
                    <button
                      onClick={() => handleSuspend(vendor)}
                      disabled={actioningId === vendor.id}
                      className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 active:bg-amber-100 disabled:opacity-40"
                      title="Suspend"
                    >
                      <ShieldAlert size={18} />
                    </button>
                  </>
                )}
                {vendor.status === 'suspended' && (
                  <button
                    onClick={() => handleActivate(vendor)}
                    disabled={actioningId === vendor.id}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 disabled:opacity-40"
                    title="Reactivate"
                  >
                    <ShieldCheck size={18} />
                  </button>
                )}
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
    
      {/* Action confirmation dialog */}
      {confirmAction && (() => {
        const { vendor, action } = confirmAction
        const configs = {
          approve: { title: 'Approve vendor?', body: `Grant ${vendor.business_name} access to the platform.`, confirmLabel: 'Yes, approve', icon: <CheckCircle2 size={22} className="text-emerald-600" />, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', btnClass: 'bg-emerald-600 hover:bg-emerald-700' },
          reject: { title: 'Reject vendor?', body: `${vendor.business_name} will be denied platform access.`, confirmLabel: 'Yes, reject', icon: <XCircle size={22} className="text-red-600" />, iconBg: 'bg-red-100 dark:bg-red-900/30', btnClass: 'bg-red-600 hover:bg-red-700' },
          suspend: { title: 'Suspend vendor?', body: `${vendor.business_name} will lose access immediately.`, confirmLabel: 'Yes, suspend', icon: <ShieldAlert size={22} className="text-amber-600" />, iconBg: 'bg-amber-100 dark:bg-amber-900/30', btnClass: 'bg-amber-600 hover:bg-amber-700' },
          activate: { title: 'Reactivate vendor?', body: `Restore full access for ${vendor.business_name}.`, confirmLabel: 'Yes, reactivate', icon: <ShieldCheck size={22} className="text-emerald-600" />, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', btnClass: 'bg-emerald-600 hover:bg-emerald-700' },
        }
        const cfg = configs[action]
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
            <div className="relative w-full sm:max-w-sm mx-4 mb-safe-bottom sm:mb-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${cfg.iconBg}`}>
                  {cfg.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cfg.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cfg.body}</p>
              </div>
              <div className="px-6 pb-6 flex flex-col gap-2">
                <button onClick={handleConfirmAction} className={`w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-all ${cfg.btnClass}`}>
                  {cfg.confirmLabel}
                </button>
                <button onClick={() => setConfirmAction(null)} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold active:scale-[0.98] transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
