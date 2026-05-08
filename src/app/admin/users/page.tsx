'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  X,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Ban,
  CheckCircle2,
  LogOut,
} from 'lucide-react'
import { adminService, type AdminUser } from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth.store'

type RoleFilter = 'all' | 'attendee' | 'vendor' | 'admin' | 'super_admin'

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Ban confirmation dialog
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)

  // Role change modal
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState('')
  const [roleChanging, setRoleChanging] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getUsers({
        page,
        limit: 20,
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: search || undefined,
      })
      setUsers(res?.data ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, search])

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, search ? 400 : 0)
    return () => clearTimeout(timeout)
  }, [fetchUsers])

  const handleBanToggle = (user: AdminUser) => {
    setBanTarget(user)
  }

  const handleConfirmBan = async () => {
    if (!banTarget) return
    setActioningId(banTarget.id)
    setBanTarget(null)
    try {
      if (banTarget.is_banned) {
        await adminService.unbanUser(banTarget.id)
      } else {
        await adminService.banUser(banTarget.id)
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === banTarget.id ? { ...u, is_banned: !banTarget.is_banned } : u)),
      )
    } catch { /* ignore */ } finally {
      setActioningId(null)
    }
  }

  const handleChangeRole = async () => {
    if (!roleTarget || !newRole) return
    setRoleChanging(true)
    try {
      await adminService.changeUserRole(roleTarget.id, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === roleTarget.id ? { ...u, role: newRole } : u)),
      )
      setRoleTarget(null)
    } catch { /* ignore */ } finally {
      setRoleChanging(false)
    }
  }

  const totalPages = Math.ceil(total / 20)

  const roleColors: Record<string, string> = {
    attendee: 'bg-slate-100 dark:bg-slate-700 text-slate-600',
    vendor: 'bg-violet-100 text-violet-700',
    admin: 'bg-brand-100 text-brand-700',
    super_admin: 'bg-amber-100 text-amber-700',
    organizer: 'bg-emerald-100 text-emerald-700',
    organiser: 'bg-emerald-100 text-emerald-700',
  }

  const filters: { id: RoleFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'attendee', label: 'Users' },
    { id: 'vendor', label: 'Vendors' },
    { id: 'admin', label: 'Admins' },
  ]

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} users registered</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email..."
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
              onClick={() => { setRoleFilter(f.id); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                roleFilter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 active:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
          {/* Mobile: card layout; Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">User</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Role</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 text-center">Status</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 text-center">Face</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Joined</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{user.full_name || user.email}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {user.is_banned ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Banned</span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {user.face_registered ? (
                        <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleBanToggle(user)}
                          disabled={actioningId === user.id}
                          title={user.is_banned ? 'Unban' : 'Ban'}
                          className={`p-1.5 rounded-lg disabled:opacity-40 ${
                            user.is_banned
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {user.is_banned ? <ShieldCheck size={14} /> : <Ban size={14} />}
                        </button>
                        {currentUser?.role === 'super_admin' && (
                          <button
                            onClick={() => { setRoleTarget(user); setNewRole(user.role) }}
                            title="Change role"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <UserCog size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-slate-50 dark:divide-slate-700">
            {users.map((user) => (
              <div key={user.id} className="px-4 py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.full_name || user.email}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleBanToggle(user)}
                      disabled={actioningId === user.id}
                      className={`p-1.5 rounded-lg disabled:opacity-40 ${user.is_banned ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {user.is_banned ? <ShieldCheck size={14} /> : <Ban size={14} />}
                    </button>
                    {currentUser?.role === 'super_admin' && (
                      <button onClick={() => { setRoleTarget(user); setNewRole(user.role) }} className="p-1.5 rounded-lg text-slate-500">
                        <UserCog size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
                    {user.role}
                  </span>
                  {user.is_banned && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Banned</span>
                  )}
                  {user.face_registered && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Face ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Role change modal */}
      {roleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRoleTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Role</h3>
            <p className="text-sm text-slate-500">
              Update role for <strong>{roleTarget.full_name || roleTarget.email}</strong>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRoleTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                disabled={roleChanging || !newRole || newRole === roleTarget?.role}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {roleChanging ? 'Updating…' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban confirmation dialog */}
      {banTarget && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBanTarget(null)} />
          <div className="relative w-full sm:max-w-sm mx-4 mb-safe-bottom sm:mb-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                banTarget.is_banned ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {banTarget.is_banned
                  ? <ShieldCheck size={22} className="text-emerald-600 dark:text-emerald-400" />
                  : <Ban size={22} className="text-red-600 dark:text-red-400" />
                }
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {banTarget.is_banned ? 'Unban user?' : 'Ban user?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {banTarget.is_banned
                  ? `Restore access for ${banTarget.full_name || banTarget.email}?`
                  : `${banTarget.full_name || banTarget.email} will lose access immediately.`
                }
              </p>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2">
              <button
                onClick={handleConfirmBan}
                className={`w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-all ${
                  banTarget.is_banned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {banTarget.is_banned ? 'Yes, restore access' : 'Yes, ban user'}
              </button>
              <button
                onClick={() => setBanTarget(null)}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold active:scale-[0.98] transition-all"
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
