'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconFileText,
  IconShield,
  IconScale,
  IconEye,
  IconTrash,
  IconDownload,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'terms', label: 'Terms', icon: IconScale },
  { id: 'privacy', label: 'Privacy', icon: IconShield },
] as const

type Tab = typeof TABS[number]['id']

export default function VendorTermsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('terms')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Legal</h1>
        </div>

        {/* Tab toggle */}
        <div className="px-4 pb-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 active:text-slate-700',
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}

        {/* Last updated */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 pt-2">
          Last updated: January 1, 2026
        </p>
      </div>
    </div>
  )
}

function TermsContent() {
  return (
    <>
      <SectionCard icon={<IconScale size={16} />} title="Terms of Service">
        <p>
          Welcome to FaceBase. By using our platform as a vendor, you agree to the following terms and conditions.
          These terms govern your use of the FaceBase vendor portal, scanning services, and lead management tools.
        </p>
      </SectionCard>

      <SectionCard icon={<IconFileText size={16} />} title="1. Service Description">
        <p>
          FaceBase provides a face recognition-based event networking platform. As a vendor, you can:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Set up booth scanning using tablet devices</li>
          <li>Capture and manage leads from event attendees</li>
          <li>Access analytics and lead scoring data</li>
          <li>Export lead data for CRM integration</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconFileText size={16} />} title="2. Vendor Responsibilities">
        <ul className="list-disc list-inside space-y-1">
          <li>Maintain accurate business information in your profile</li>
          <li>Use scanning features only with attendee awareness</li>
          <li>Safeguard tablet tokens and authentication credentials</li>
          <li>Handle captured lead data in compliance with applicable data protection laws</li>
          <li>Not use the platform for unauthorised surveillance or tracking</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconFileText size={16} />} title="3. Data Usage">
        <p>
          Lead data captured through FaceBase scanning remains your responsibility. You agree to:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Use lead data only for legitimate business follow-up</li>
          <li>Respect attendee privacy preferences and consent revocations</li>
          <li>Delete lead data when requested by the attendee</li>
          <li>Not sell or share raw lead data with third parties</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconFileText size={16} />} title="4. Account Termination">
        <p>
          FaceBase reserves the right to suspend or terminate vendor accounts that violate these terms.
          Upon termination, all associated data will be deleted within 30 days.
          You may request account deletion at any time by contacting support.
        </p>
      </SectionCard>
    </>
  )
}

function PrivacyContent() {
  return (
    <>
      <SectionCard icon={<IconShield size={16} />} title="Privacy Policy">
        <p>
          FaceBase is committed to protecting the privacy of all users, including vendors and event attendees.
          This policy explains how we collect, use, and protect your data.
        </p>
      </SectionCard>

      <SectionCard icon={<IconEye size={16} />} title="1. Data We Collect">
        <p>As a vendor, we collect:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>Account data:</strong> Business name, contact person, email, phone</li>
          <li><strong>Event data:</strong> Events participated, booth assignments, tablet tokens</li>
          <li><strong>Scan data:</strong> Face recognition logs, lead captures, interaction timestamps</li>
          <li><strong>Usage data:</strong> App usage patterns, analytics interactions</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconShield size={16} />} title="2. How We Use Your Data">
        <ul className="list-disc list-inside space-y-1">
          <li>Provide scanning and lead management services</li>
          <li>Generate analytics and lead scoring insights</li>
          <li>Send notifications about events and platform updates</li>
          <li>Improve platform features and user experience</li>
          <li>Enforce terms of service and prevent abuse</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconShield size={16} />} title="3. Face Recognition Data">
        <p>
          FaceBase uses AWS Rekognition for face matching. Important details:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Face vectors are stored encrypted and never shared with third parties</li>
          <li>Attendees must explicitly consent to face recognition</li>
          <li>Attendees can revoke consent and delete face data at any time</li>
          <li>Face data is automatically purged 30 days after consent revocation</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconTrash size={16} />} title="4. Data Deletion">
        <p>
          You can request complete data deletion by contacting support@facebase.dev.
          We will delete all your data within 30 calendar days, including:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Vendor profile and business information</li>
          <li>All captured leads and scan history</li>
          <li>Tablet tokens and authentication records</li>
          <li>Analytics and usage data</li>
        </ul>
      </SectionCard>

      <SectionCard icon={<IconDownload size={16} />} title="5. Data Export">
        <p>
          Under GDPR and Indian DPDP Act provisions, you have the right to export your data.
          Use the Leads → Export feature to download your lead data as CSV.
          For a complete data export, contact support@facebase.dev.
        </p>
      </SectionCard>
    </>
  )
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}
