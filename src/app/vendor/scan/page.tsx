'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconScan,
  IconUserCheck,
  IconClock,
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
} from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { ContinuousScanner } from '@/components/scanner/ContinuousScanner'
import { vendorService, type VendorEvent } from '@/services/vendor.service'
import { useSocketStore } from '@/stores/socket.store'

interface LiveLead {
  id: string
  status: 'consent_pending' | 'consent_granted' | 'consent_denied' | 'already_captured'
  confidence: number
  message: string
  timestamp: Date
  attendee_name?: string
  attendee_company?: string
}

export default function VendorScanPage() {
  const router = useRouter()
  const socket = useSocketStore((s) => s.socket)

  const [events, setEvents] = useState<VendorEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<VendorEvent | null>(null)
  const [scanning, setScanning] = useState(false)
  const [leads, setLeads] = useState<LiveLead[]>([])
  const [loading, setLoading] = useState(true)
  const [scanCount, setScanCount] = useState(0)
  const processingRef = useRef(false)

  // Load assigned events
  useEffect(() => {
    const load = async () => {
      try {
        const evts = await vendorService.getAssignedEvents('active')
        setEvents(evts.filter((e) => e.active && e.tablet_token))
        if (evts.length === 1) setSelectedEvent(evts[0])
      } catch {
        // handled
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Listen for real-time consent responses and lead captures
  useEffect(() => {
    if (!socket) return

    const handleConsentResponse = (data: {
      scan_log_id: string
      approved: boolean
      user_id?: string
    }) => {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === data.scan_log_id
            ? {
                ...lead,
                status: data.approved ? 'consent_granted' : 'consent_denied',
                message: data.approved ? 'Consent granted!' : 'Consent denied',
              }
            : lead
        )
      )
    }

    const handleLeadCaptured = (data: {
      scan_log_id: string
      attendee_name: string
      attendee_company?: string
      match_confidence: number
    }) => {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === data.scan_log_id
            ? {
                ...lead,
                status: 'consent_granted',
                attendee_name: data.attendee_name,
                attendee_company: data.attendee_company,
                message: `Lead captured: ${data.attendee_name}`,
              }
            : lead
        )
      )
    }

    socket.on('consent-response', handleConsentResponse)
    socket.on('lead-captured', handleLeadCaptured)

    return () => {
      socket.off('consent-response', handleConsentResponse)
      socket.off('lead-captured', handleLeadCaptured)
    }
  }, [socket])

  // Handle face detection from continuous scanner
  const handleFaceDetected = useCallback(
    async (faceImageBase64: string) => {
      if (!selectedEvent || processingRef.current) return
      processingRef.current = true

      try {
        const result = await vendorService.tabletScan(
          faceImageBase64,
          selectedEvent.id // tabletDeviceId — we use event ID as device identifier
        )

        setScanCount((prev) => prev + 1)

        if (result.matched && result.leadId) {
          const newLead: LiveLead = {
            id: result.leadId,
            status: result.deduplicated
              ? 'already_captured'
              : (result.status as LiveLead['status']) || 'consent_pending',
            confidence: result.confidence,
            message: result.message || 'Waiting for consent...',
            timestamp: new Date(),
          }
          setLeads((prev) => [newLead, ...prev].slice(0, 50))
        }
      } catch {
        // Silently handle — don't disrupt scanning
      } finally {
        processingRef.current = false
      }
    },
    [selectedEvent]
  )

  // Event selection screen
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <header className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/10 flex items-center justify-center"
          >
            <IconArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Select Event</h1>
        </header>

        <div className="flex-1 px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <IconScan size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                No active events with tablet tokens found.
              </p>
              <p className="text-white/40 text-xs mt-2">
                Generate a tablet token from your Events page first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-4">
                Choose an event to start scanning faces
              </p>
              {events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800/10 backdrop-blur-sm text-left hover:bg-white dark:bg-slate-800/15 transition-colors"
                >
                  <p className="font-semibold text-white">{evt.event_name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {evt.event_city} · {new Date(evt.event_start).toLocaleDateString()}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-slate-500">{evt.scans_count} scans</span>
                    <span className="text-xs text-slate-500">{evt.leads_count} leads</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main scanner view
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Scanner section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setScanning(false)
                setSelectedEvent(null)
              }}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/10 flex items-center justify-center"
            >
              <IconArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                {selectedEvent.event_name}
              </p>
              <p className="text-xs text-slate-400">{selectedEvent.booth_name || 'Scanner'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-xs text-slate-400">Scans</p>
              <p className="text-sm font-bold text-white">{scanCount}</p>
            </div>
            <button
              onClick={() => setScanning(!scanning)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                scanning ? 'bg-red-500/80' : 'bg-emerald-500/80'
              }`}
            >
              {scanning ? (
                <IconPlayerPause size={20} className="text-white" />
              ) : (
                <IconPlayerPlay size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Camera */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <ContinuousScanner
              onFaceDetected={handleFaceDetected}
              active={scanning}
              scanInterval={3000}
              cooldownMs={5000}
              width={480}
              height={360}
            />
            {!scanning && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setScanning(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live lead feed sidebar */}
      <div className="w-full lg:w-96 bg-slate-800/80 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Live Lead Feed</h2>
          <p className="text-xs text-slate-400">{leads.length} scans this session</p>
        </div>

        <div className="overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-60px)]">
          {leads.length === 0 ? (
            <div className="py-12 text-center">
              <IconScan size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Leads will appear here as faces are scanned
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-3 flex items-start gap-3"
                  >
                    {/* Status icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        lead.status === 'consent_granted'
                          ? 'bg-emerald-500/20'
                          : lead.status === 'consent_denied'
                          ? 'bg-red-500/20'
                          : lead.status === 'already_captured'
                          ? 'bg-amber-500/20'
                          : 'bg-blue-500/20'
                      }`}
                    >
                      {lead.status === 'consent_granted' ? (
                        <IconUserCheck size={16} className="text-emerald-400" />
                      ) : lead.status === 'consent_denied' ? (
                        <IconX size={16} className="text-red-400" />
                      ) : lead.status === 'already_captured' ? (
                        <IconUserCheck size={16} className="text-amber-400" />
                      ) : (
                        <IconClock size={16} className="text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {lead.attendee_name || lead.message}
                      </p>
                      {lead.attendee_company && (
                        <p className="text-xs text-slate-400 truncate">{lead.attendee_company}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            lead.status === 'consent_granted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : lead.status === 'consent_denied'
                              ? 'bg-red-500/20 text-red-400'
                              : lead.status === 'already_captured'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {lead.status === 'consent_granted'
                            ? 'Captured'
                            : lead.status === 'consent_denied'
                            ? 'Declined'
                            : lead.status === 'already_captured'
                            ? 'Duplicate'
                            : 'Pending'}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {Math.round(lead.confidence * 100)}% match
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-600 flex-shrink-0">
                      {lead.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
