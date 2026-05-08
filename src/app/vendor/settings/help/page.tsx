'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconChevronDown,
  IconMail,
  IconPhone,
  IconMessageCircle,
  IconBrandWhatsapp,
  IconExternalLink,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I set up my booth for scanning?',
        answer:
          'Go to Settings → Tablet Tokens, generate a token for your event, then open the scan URL on your tablet device. Enter the token to authenticate and start scanning attendees at your booth.',
      },
      {
        question: 'How does face recognition scanning work?',
        answer:
          'When an attendee visits your booth, point the tablet camera at them. FaceBase uses AWS Rekognition to match their face against registered profiles, instantly pulling up their contact details and preferences.',
      },
      {
        question: 'What if an attendee hasn\'t registered their face?',
        answer:
          'You can still capture a lead manually. The scan page has a "Manual Entry" option where you can type in their details. The lead will be saved to your dashboard just like any scanned lead.',
      },
    ],
  },
  {
    title: 'Leads & Events',
    items: [
      {
        question: 'How do I export my leads?',
        answer:
          'Go to the Leads tab and tap the download icon in the top-right corner. Your leads will be exported as a CSV file that you can open in Excel, Google Sheets, or import into your CRM.',
      },
      {
        question: 'Can I join events I wasn\'t invited to?',
        answer:
          'Yes! Go to the Events tab, switch to "Discover", and browse public events in your area. You can request to join any event — the organiser will review and approve your request.',
      },
      {
        question: 'How is the lead score calculated?',
        answer:
          'Lead scores are based on engagement signals: booth visit duration, follow-up status, tags, and notes. Higher engagement = higher score, helping you prioritise your best leads.',
      },
    ],
  },
  {
    title: 'Account & Billing',
    items: [
      {
        question: 'How do I upgrade my plan?',
        answer:
          'Go to Settings → Billing & Plan to view available plans. Plan upgrades with payment processing will be available in an upcoming release. Currently all vendors are on the free Starter plan.',
      },
      {
        question: 'Can I change my business details?',
        answer:
          'Yes, go to Settings → Company Profile. You can update your business name, contact person, phone, industry, and description. Your email address cannot be changed.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Contact our support team at support@facebase.dev to request account deletion. All your data, including leads and scan history, will be permanently removed within 30 days.',
      },
    ],
  },
]

export default function VendorHelpPage() {
  const router = useRouter()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

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
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Help & FAQ</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Support card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-base font-bold mb-1">Need help?</h2>
            <p className="text-sm text-white/70 mb-4">
              Our support team is available Monday – Saturday, 9 AM – 7 PM IST.
            </p>
            <div className="flex gap-2">
              <a
                href="mailto:support@facebase.dev"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-xs font-semibold active:bg-white/25 transition-colors"
              >
                <IconMail size={14} />
                Email
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-xs font-semibold active:bg-white/25 transition-colors"
              >
                <IconBrandWhatsapp size={14} />
                WhatsApp
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-xs font-semibold active:bg-white/25 transition-colors"
              >
                <IconPhone size={14} />
                Call
              </a>
            </div>
          </div>
        </div>

        {/* FAQ sections */}
        {FAQ_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {section.items.map((item) => {
                const key = `${section.title}-${item.question}`
                const isOpen = openItems.has(key)
                return (
                  <div key={item.question}>
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <IconMessageCircle size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <p className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                        {item.question}
                      </p>
                      <IconChevronDown
                        size={16}
                        className={cn(
                          'text-slate-300 dark:text-slate-600 transition-transform duration-200 shrink-0',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-14">
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Feedback card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <IconExternalLink size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Got feedback?</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Help us improve FaceBase</p>
            </div>
            <a
              href="mailto:feedback@facebase.dev?subject=FaceBase Vendor Feedback"
              className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-semibold active:bg-brand-100 dark:active:bg-brand-900/50 transition-colors"
            >
              Send
            </a>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 pt-2">
          FaceBase v1.0.0 · Build 2026.05
        </p>
      </div>
    </div>
  )
}
