'use client'

import { useState, useEffect } from 'react'
import { IconChevronDown, IconChevronUp, IconScan, IconSearch } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { LoadingSpinner, EmptyState } from '@/components/ui'
import { scanService, type VendorConnectionGroup } from '@/services/scan.service'
import BusinessCard from '@/components/vendor/BusinessCard'

export default function ConnectionsPage() {
  const [groups, setGroups] = useState<VendorConnectionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      const data = await scanService.getVendorConnections()
      setGroups(data)
      // Auto-expand first event
      if (data.length > 0) setExpandedEvent(data[0].event_id)
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-3">
        <h1 className="text-heading text-slate-900 dark:text-white">Contacts</h1>
        <p className="text-tiny text-slate-500 dark:text-slate-400">
          {groups.reduce((sum, g) => sum + g.vendors.length, 0)} vendor cards collected
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mt-2 mb-3">
        <div className="relative">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-caption text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={IconScan}
          title="No connections yet"
          description="Visit vendor booths at events and scan your face to collect business cards here."
        />
      ) : (
        <div className="px-4 py-4 space-y-4">
          {groups
            .map((group) => {
              const filteredVendors = search
                ? group.vendors.filter((v) => {
                    const s = search.toLowerCase()
                    return (
                      v.business_card?.business_name?.toLowerCase().includes(s) ||
                      v.business_card?.contact_name?.toLowerCase().includes(s) ||
                      v.business_card?.industry?.toLowerCase().includes(s)
                    )
                  })
                : group.vendors
              if (search && filteredVendors.length === 0) return null
              return { ...group, vendors: filteredVendors }
            })
            .filter((g): g is VendorConnectionGroup => g !== null)
            .map((group) => (
            <div key={group.event_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Event header */}
              <button
                onClick={() =>
                  setExpandedEvent(expandedEvent === group.event_id ? null : group.event_id)
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">{group.event_name || 'Event'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {group.vendors.length} vendor{group.vendors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {expandedEvent === group.event_id ? (
                  <IconChevronUp size={18} className="text-slate-400" />
                ) : (
                  <IconChevronDown size={18} className="text-slate-400" />
                )}
              </button>

              {/* Vendor cards */}
              <AnimatePresence>
                {expandedEvent === group.event_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {group.vendors.map((vendor) => {
                        const card = vendor.business_card
                        const isExpanded = expandedVendor === vendor.scan_id

                        return (
                          <div key={vendor.scan_id}>
                            {/* Collapsed: mini card */}
                            {!isExpanded ? (
                              <button
                                onClick={() => setExpandedVendor(vendor.scan_id)}
                                className="w-full text-left"
                              >
                                <BusinessCard
                                  data={card}
                                  branding={card.branding}
                                  size="mini"
                                  className="hover:shadow-card-hover transition-shadow cursor-pointer"
                                />
                              </button>
                            ) : (
                              <div>
                                <BusinessCard
                                  data={card}
                                  branding={card.branding}
                                  size="compact"
                                />
                                <div className="flex items-center justify-between mt-1.5 px-1">
                                  <p className="text-[10px] text-slate-400">
                                    Scanned {new Date(vendor.scanned_at).toLocaleDateString()}
                                  </p>
                                  <button
                                    onClick={() => setExpandedVendor(null)}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 font-medium"
                                  >
                                    Collapse
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
