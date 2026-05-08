'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import type { VendorBranding } from '@/services/vendor.service'

interface TemplatePickerProps {
  value: VendorBranding['template']
  onChange: (template: VendorBranding['template']) => void
  primaryColor?: string
}

const TEMPLATES: { id: VendorBranding['template']; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Professional & traditional' },
  { id: 'modern', name: 'Modern', description: 'App-like & trendy' },
  { id: 'minimal', name: 'Minimal', description: 'Clean & whitespace-heavy' },
  { id: 'bold', name: 'Bold', description: 'Impactful & statement' },
  { id: 'elegant', name: 'Elegant', description: 'Refined & luxury' },
  { id: 'creative', name: 'Creative', description: 'Dynamic & edgy' },
  { id: 'geometric', name: 'Geometric', description: 'Angular & sharp' },
  { id: 'wave', name: 'Wave', description: 'Organic & flowing' },
  { id: 'neon', name: 'Neon', description: 'Futuristic & glowing' },
  { id: 'glass', name: 'Glass', description: 'Frosted & translucent' },
  { id: 'retro', name: 'Retro', description: 'Playful & Memphis' },
  { id: 'corporate', name: 'Corporate', description: 'Structured & polished' },
]

export default function TemplatePicker({ value, onChange, primaryColor = '#1e40af' }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {TEMPLATES.map((template) => {
        const isSelected = value === template.id
        return (
          <motion.button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-xl border-2 p-2 transition-all text-left ${
              isSelected
                ? 'border-current shadow-lg'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
            style={isSelected ? { borderColor: primaryColor } : undefined}
          >
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white z-10"
                style={{ backgroundColor: primaryColor }}
              >
                <IconCheck size={12} strokeWidth={3} />
              </motion.div>
            )}

            {/* Mini preview */}
            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <TemplateMiniPreview templateId={template.id} color={primaryColor} />
            </div>

            {/* Label */}
            <div className="mt-2 px-0.5">
              <p className={`text-xs font-semibold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{template.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{template.description}</p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Mini wireframe previews for each template ──────────────────────────────

function TemplateMiniPreview({ templateId, color }: { templateId: string; color: string }) {
  switch (templateId) {
    case 'classic':
      return (
        <div className="w-full h-full flex flex-col">
          {/* 30% color band with logo left */}
          <div className="h-[30%] relative flex items-center gap-1.5 px-2" style={{ backgroundColor: color }}>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full border border-white/15" />
            <div className="absolute bottom-1 right-3 w-1 h-1 rounded-full bg-white/15" />
            <div className="w-4 h-4 rounded bg-white/30" />
            <div className="space-y-0.5">
              <div className="w-12 h-1.5 rounded-full bg-white/70" />
              <div className="w-8 h-1 rounded-full bg-white/40" />
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            <div className="w-14 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            <div className="flex gap-1 mt-2">
              <div className="w-6 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
              <div className="w-6 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      )

    case 'modern':
      return (
        <div className="w-full h-full flex flex-col">
          {/* 40% curved header */}
          <div className="h-[40%] relative flex items-center justify-center" style={{ backgroundColor: color }}>
            <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full border border-white/10" />
            <svg className="absolute top-1 right-1 w-3 h-3" viewBox="0 0 12 12" fill="none"><polygon points="6,1 11,10 1,10" stroke="white" strokeWidth="0.3" opacity="0.15" /></svg>
            <div className="w-12 h-1.5 rounded-full bg-white/70" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white dark:bg-slate-800" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
          </div>
          {/* Overlapping logo */}
          <div className="flex justify-center -mt-2.5 relative z-10">
            <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-600 ring-2 ring-white dark:ring-slate-800" />
          </div>
          {/* Body */}
          <div className="flex-1 p-2 pt-1.5 space-y-1.5 text-center">
            <div className="w-8 h-2 rounded-full mx-auto" style={{ backgroundColor: `${color}20` }} />
            <div className="grid grid-cols-2 gap-1">
              <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
              <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            </div>
            <div className="flex justify-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${color}20` }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${color}20` }} />
            </div>
          </div>
        </div>
      )

    case 'minimal':
      return (
        <div className="w-full h-full flex flex-col">
          {/* Thin accent line */}
          <div className="h-0.5" style={{ backgroundColor: color }} />
          {/* Body */}
          <div className="flex-1 p-2.5 space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <div className="w-14 h-2 rounded-full bg-slate-300 dark:bg-slate-500" />
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>
              <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-600" />
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-700" />
            <div className="space-y-1">
              <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
              <div className="w-14 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
              <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
            </div>
          </div>
        </div>
      )

    case 'bold':
      return (
        <div className="w-full h-full flex flex-col">
          {/* 50% hero */}
          <div className="h-[50%] relative flex flex-col items-center justify-center gap-1 px-2" style={{ backgroundColor: color }}>
            <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-white/5" />
            <div className="absolute bottom-2 right-1 w-3 h-3 rounded-full border border-white/10" />
            <svg className="absolute top-1 left-1/3 w-4 h-4" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="white" strokeWidth="0.3" opacity="0.1" transform="rotate(15 8 8)" /></svg>
            <div className="w-6 h-6 rounded-lg bg-white/20" />
            <div className="w-14 h-2 rounded-full bg-white/70" />
            <div className="flex gap-0.5 mt-0.5">
              <div className="w-8 h-2 rounded-full bg-white/20" />
              <div className="w-6 h-2 rounded-full bg-white/20" />
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5 flex flex-col items-center justify-center">
            <div className="flex gap-1">
              <div className="w-8 h-3 rounded" style={{ backgroundColor: `${color}15` }} />
              <div className="w-8 h-3 rounded" style={{ backgroundColor: `${color}15` }} />
            </div>
            <div className="grid grid-cols-2 gap-1 w-full">
              <div className="h-4 rounded" style={{ backgroundColor: `${color}08` }} />
              <div className="h-4 rounded" style={{ backgroundColor: `${color}08` }} />
            </div>
          </div>
        </div>
      )

    case 'elegant':
      return (
        <div className="w-full h-full flex flex-col">
          {/* 35% header */}
          <div className="h-[35%] relative flex flex-col items-center justify-center gap-1" style={{ backgroundColor: color }}>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full border border-white/10" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-white/8" />
            <svg className="absolute top-1 left-1 w-3 h-3" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2" stroke="white" strokeWidth="0.3" opacity="0.15" /><circle cx="6" cy="6" r="4" stroke="white" strokeWidth="0.3" opacity="0.08" /></svg>
            <div className="w-5 h-5 rounded-full border border-white/30 bg-white/10" />
            <div className="w-10 h-1.5 rounded-full bg-white/70" />
          </div>
          {/* Ornamental divider */}
          <div className="flex items-center justify-center py-1 bg-white dark:bg-slate-800">
            <div className="h-px w-4 bg-slate-200" />
            <div className="w-1 h-1 rounded-full mx-1" style={{ backgroundColor: color }} />
            <div className="h-px w-4 bg-slate-200" />
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1 text-center bg-white dark:bg-slate-800">
            <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto" />
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto" />
            <div className="text-[6px] text-slate-300 mt-1">· · ·</div>
            <div className="w-full h-4 rounded border border-slate-100 dark:border-slate-700 mt-1" />
          </div>
        </div>
      )

    case 'creative':
      return (
        <div className="w-full h-full relative">
          {/* Diagonal slice */}
          <div className="absolute inset-0" style={{ backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 55%)' }} />
          {/* Abstract shapes */}
          <svg className="absolute top-1 right-2 w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="white" strokeWidth="0.5" opacity="0.3" /></svg>
          <div className="absolute top-4 left-12 w-1.5 h-1.5 rotate-45 bg-white/20" />
          {/* Content */}
          <div className="relative p-2.5 h-full flex flex-col">
            <div className="flex items-start gap-1.5">
              <div className="w-5 h-5 rounded bg-white/30 rotate-3" />
              <div className="space-y-0.5 pt-0.5">
                <div className="w-10 h-1.5 rounded-full bg-white/70" />
                <div className="w-7 h-1 rounded-full bg-white/40" />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end space-y-1">
              <div className="w-14 h-1 rounded-full bg-slate-200 dark:bg-slate-600 ml-1" />
              <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600 ml-3" />
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 ml-2" />
              <div className="flex gap-1 mt-1">
                <div className="w-6 h-2.5 rounded -rotate-1" style={{ backgroundColor: `${color}20` }} />
                <div className="w-6 h-2.5 rounded rotate-1" style={{ backgroundColor: `${color}20` }} />
              </div>
            </div>
          </div>
        </div>
      )

    case 'geometric':
      return (
        <div className="w-full h-full flex flex-col">
          {/* Angular header with shapes */}
          <div className="h-[38%] relative flex items-center gap-1.5 px-2" style={{ backgroundColor: color }}>
            <svg className="absolute top-0.5 right-1 w-5 h-5" viewBox="0 0 20 20" fill="none"><polygon points="10,1 19,6 19,14 10,19 1,14 1,6" stroke="white" strokeWidth="0.5" opacity="0.2" /></svg>
            <svg className="absolute bottom-1 left-1 w-3 h-3" viewBox="0 0 12 12" fill="none"><polygon points="6,1 11,10 1,10" stroke="white" strokeWidth="0.5" opacity="0.2" /></svg>
            <div className="w-4 h-4 bg-white/25" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <div className="space-y-0.5">
              <div className="w-10 h-1.5 rounded-full bg-white/70" />
              <div className="w-7 h-1 rounded-full bg-white/40" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white dark:bg-slate-800" style={{ clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)' }} />
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="flex items-center gap-1"><div className="w-0.5 h-2" style={{ backgroundColor: color }} /><div className="w-6 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-3 rounded" style={{ backgroundColor: `${color}10` }} />
              <div className="h-3 rounded" style={{ backgroundColor: `${color}10` }} />
            </div>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5" style={{ backgroundColor: `${color}15`, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
              <div className="w-3.5 h-3.5" style={{ backgroundColor: `${color}15`, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            </div>
          </div>
        </div>
      )

    case 'wave':
      return (
        <div className="w-full h-full flex flex-col">
          {/* Header with orbs and wave */}
          <div className="h-[42%] relative flex flex-col items-center justify-center" style={{ backgroundColor: color }}>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white/8" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/10" />
            <div className="w-5 h-5 rounded-full bg-white/25 ring-2 ring-white/10 mb-1" />
            <div className="w-10 h-1.5 rounded-full bg-white/70" />
            <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" style={{ height: 6 }}>
              <path d="M0,4 C25,0 37,8 50,4 C63,0 75,8 100,4 L100,8 L0,8 Z" className="fill-white dark:fill-slate-800" />
            </svg>
          </div>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5">
            <div className="w-8 h-2 rounded-full mx-auto" style={{ backgroundColor: `${color}15` }} />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${color}12` }} /><div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${color}12` }} /><div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
            </div>
            <div className="flex justify-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: `${color}15` }} />
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: `${color}15` }} />
            </div>
          </div>
        </div>
      )

    case 'neon':
      return (
        <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#0f172a' }}>
          {/* Dark header with glow */}
          <div className="h-[40%] relative flex items-center gap-1.5 px-2" style={{ borderTop: `1px solid ${color}40` }}>
            <div className="absolute top-1 right-2 w-3 h-3 rounded-full" style={{ border: `0.5px solid ${color}`, opacity: 0.3 }} />
            <div className="absolute bottom-2 left-1 w-1 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.5, boxShadow: `0 0 4px ${color}` }} />
            <div className="w-5 h-5 rounded" style={{ border: `0.5px solid ${color}40`, backgroundColor: `${color}15` }} />
            <div className="space-y-0.5">
              <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
              <div className="w-7 h-1 rounded-full bg-slate-600" />
            </div>
          </div>
          {/* Separator */}
          <div className="h-px mx-2" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
          {/* Body */}
          <div className="flex-1 p-2 space-y-1">
            <div className="w-14 h-1 rounded-full bg-slate-700" />
            <div className="w-12 h-1 rounded-full bg-slate-700" />
            <div className="flex gap-1 mt-1.5">
              <div className="w-7 h-2.5 rounded text-center" style={{ backgroundColor: `${color}15`, border: `0.5px solid ${color}20` }} />
              <div className="w-7 h-2.5 rounded" style={{ backgroundColor: `${color}15`, border: `0.5px solid ${color}20` }} />
            </div>
          </div>
        </div>
      )

    case 'glass':
      return (
        <div className="w-full h-full relative" style={{ backgroundColor: color }}>
          {/* Floating orbs */}
          <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full" style={{ background: `radial-gradient(circle, rgba(255,255,255,0.2), transparent)` }} />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full" style={{ background: `radial-gradient(circle, rgba(255,255,255,0.15), transparent)` }} />
          <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-white/10" />
          {/* Frosted cards */}
          <div className="relative p-2 h-full flex flex-col gap-1.5 pt-3">
            <div className="rounded-lg p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-white/20" />
                <div className="space-y-0.5">
                  <div className="w-10 h-1.5 rounded-full bg-white/60" />
                  <div className="w-7 h-1 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
            <div className="rounded-lg p-1.5 space-y-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-1 rounded-full bg-white/40" />
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>
            <div className="flex gap-1 mt-auto">
              <div className="w-6 h-2.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <div className="w-6 h-2.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
            </div>
          </div>
        </div>
      )

    case 'retro':
      return (
        <div className="w-full h-full flex flex-col">
          {/* Header with Memphis shapes */}
          <div className="h-[40%] relative flex items-start gap-1.5 px-2 pt-2" style={{ backgroundColor: color }}>
            <div className="absolute top-1 right-1.5 w-3 h-3 rounded-full border border-white/30" />
            <svg className="absolute bottom-3 left-1 w-3 h-3" viewBox="0 0 12 12" fill="none"><polygon points="6,1 11,10 1,10" fill="white" opacity="0.15" /></svg>
            <div className="absolute top-3 right-4 w-1.5 h-1.5 rotate-45 bg-white/20" />
            <div className="w-5 h-5 rounded-lg bg-white/25 border border-white/20" style={{ transform: 'rotate(-3deg)' }} />
            <div className="space-y-0.5 pt-0.5">
              <div className="w-10 h-2 rounded-full bg-white/70" />
              <div className="w-7 h-1 rounded-full bg-white/40" />
            </div>
          </div>
          {/* Zigzag separator */}
          <svg className="w-full block -mt-px" viewBox="0 0 100 4" preserveAspectRatio="none" style={{ height: 3 }}>
            <path d="M0,0 L5,4 L10,0 L15,4 L20,0 L25,4 L30,0 L35,4 L40,0 L45,4 L50,0 L55,4 L60,0 L65,4 L70,0 L75,4 L80,0 L85,4 L90,0 L95,4 L100,0 L100,4 L0,4 Z" className="fill-white dark:fill-slate-800" />
          </svg>
          {/* Body */}
          <div className="flex-1 p-2 space-y-1.5 bg-white dark:bg-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded" style={{ backgroundColor: `${color}18`, transform: 'rotate(-2deg)' }} /><div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded" style={{ backgroundColor: `${color}18`, transform: 'rotate(1deg)' }} /><div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
            </div>
            <div className="flex gap-1">
              <div className="w-7 h-2.5 rounded border" style={{ borderColor: `${color}25`, transform: 'rotate(-1deg)' }} />
              <div className="w-7 h-2.5 rounded border" style={{ borderColor: `${color}25`, transform: 'rotate(1deg)' }} />
            </div>
          </div>
        </div>
      )

    case 'corporate':
      return (
        <div className="w-full h-full flex">
          {/* Left accent bar */}
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
          {/* Main */}
          <div className="flex-1 flex flex-col">
            {/* Small banner */}
            <div className="h-[28%] relative flex items-center gap-1.5 px-2" style={{ backgroundColor: color }}>
              <svg className="absolute top-1 right-1 w-4 h-4" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" stroke="white" strokeWidth="0.3" opacity="0.15" transform="rotate(15 8 8)" /></svg>
              <div className="w-4 h-4 rounded bg-white/20" />
              <div className="space-y-0.5">
                <div className="w-10 h-1.5 rounded-full bg-white/70" />
                <div className="w-7 h-1 rounded-full bg-white/40" />
              </div>
            </div>
            {/* Body */}
            <div className="flex-1 p-2 space-y-1">
              <div className="flex items-center gap-1"><div className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: color }} /><div className="w-6 h-1 rounded-full bg-slate-200 dark:bg-slate-600" /></div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-600 border-b border-slate-100" />
                <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-600 border-b border-slate-100" />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: `${color}12` }} />
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: `${color}12` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}
