'use client'

import { useMemo, useEffect } from 'react'
import {
  IconMail, IconPhone, IconWorld, IconBuilding,
  IconBrandLinkedin, IconBrandTwitter, IconBrandInstagram, IconBrandFacebook,
  IconMapPin, IconBriefcase, IconExternalLink,
} from '@tabler/icons-react'
import {
  Mail, Phone, Globe, Building2,
  Linkedin, Twitter, Instagram, Facebook,
  MapPin, Briefcase, ExternalLink,
} from 'lucide-react'
import { type VendorBranding, DEFAULT_BRANDING } from '@/services/vendor.service'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BusinessCardData {
  business_name: string
  contact_name: string
  email?: string | null
  phone?: string | null
  tagline?: string | null
  industry?: string | null
  logo_url?: string | null
  website?: string | null
  social_links?: Record<string, string>
  business_description?: string | null
  products_services?: Array<{ name: string; description?: string; image_url?: string }>
}

export interface BusinessCardProps {
  data: BusinessCardData
  branding?: Partial<VendorBranding>
  size?: 'full' | 'compact' | 'mini'
  className?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getHeaderBackground(b: VendorBranding): string {
  switch (b.color_mode) {
    case 'solid':
      return b.primary_color
    case 'two-tone':
      return `linear-gradient(${b.gradient_angle}deg, ${b.primary_color} 50%, ${b.secondary_color || b.primary_color} 50%)`
    case 'gradient':
      return `linear-gradient(${b.gradient_angle}deg, ${b.primary_color}, ${b.secondary_color || b.primary_color})`
    default:
      return b.primary_color
  }
}

function getTextColor(b: VendorBranding): string {
  if (b.text_color === 'light') return '#ffffff'
  if (b.text_color === 'dark') return '#1e293b'
  // Auto: check primary color luminance
  const hex = b.primary_color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const blue = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * blue) / 255
  return luminance > 0.5 ? '#1e293b' : '#ffffff'
}

function getBorderRadius(b: VendorBranding): string {
  switch (b.card_style) {
    case 'sharp': return '4px'
    case 'pill': return '24px'
    case 'rounded':
    default: return '16px'
  }
}

function getPatternCSS(b: VendorBranding): string {
  if (!b.show_pattern || b.pattern_type === 'none') return 'none'
  const opacity = '0.1'
  switch (b.pattern_type) {
    case 'dots':
      return `radial-gradient(circle, rgba(255,255,255,${opacity}) 1px, transparent 1px)`
    case 'lines':
      return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,${opacity}) 10px, rgba(255,255,255,${opacity}) 11px)`
    case 'waves':
      return `repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(255,255,255,${opacity}) 14px, rgba(255,255,255,${opacity}) 16px)`
    case 'grid':
      return `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`
    default:
      return 'none'
  }
}

function getPatternSize(type: string): string {
  switch (type) {
    case 'dots': return '20px 20px'
    case 'grid': return '20px 20px'
    default: return 'auto'
  }
}

// ─── Abstract Background Shapes ─────────────────────────────────────────────
// Each template gets unique decorative shapes rendered in the header area

function AbstractShapes({ template, color }: { template: string; color: string }) {
  const c = color
  switch (template) {
    case 'classic':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border-4" style={{ borderColor: c, opacity: 0.08 }} />
          <div className="absolute bottom-3 left-6 w-10 h-10 rounded-full" style={{ backgroundColor: c, opacity: 0.07 }} />
          <div className="absolute top-4 right-20 w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.15 }} />
          <div className="absolute top-1/2 left-0 w-16 h-px" style={{ backgroundColor: c, opacity: 0.1, transform: 'rotate(-15deg)' }} />
          <div className="absolute bottom-4 right-10 w-5 h-5 rotate-45" style={{ backgroundColor: c, opacity: 0.06 }} />
          <svg className="absolute bottom-0 right-0 w-20 h-20" viewBox="0 0 80 80" fill="none"><circle cx="60" cy="60" r="30" stroke={c} strokeWidth="1" opacity="0.06" /><circle cx="65" cy="65" r="15" stroke={c} strokeWidth="1" opacity="0.08" /></svg>
        </div>
      )
    case 'modern':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full border-[6px]" style={{ borderColor: c, opacity: 0.06 }} />
          <div className="absolute top-6 right-8 w-4 h-4 rounded-full" style={{ backgroundColor: c, opacity: 0.12 }} />
          <div className="absolute bottom-12 right-16 w-6 h-6 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
          <div className="absolute top-1/3 right-0 w-20 h-20 rounded-full" style={{ backgroundColor: c, opacity: 0.04 }} />
          <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.18 }} />
          <svg className="absolute top-2 right-4 w-16 h-16" viewBox="0 0 64 64" fill="none"><polygon points="32,4 60,56 4,56" stroke={c} strokeWidth="1" opacity="0.06" /></svg>
          <div className="absolute top-0 right-1/4 w-px h-12" style={{ backgroundColor: c, opacity: 0.06 }} />
        </div>
      )
    case 'minimal':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full border" style={{ borderColor: c, opacity: 0.06 }} />
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
          <div className="absolute top-8 left-8 w-3 h-3 rotate-45" style={{ borderColor: c, borderWidth: 1, opacity: 0.06 }} />
          <svg className="absolute bottom-0 right-0 w-12 h-12" viewBox="0 0 48 48" fill="none"><line x1="0" y1="48" x2="48" y2="0" stroke={c} strokeWidth="0.5" opacity="0.06" /></svg>
        </div>
      )
    case 'bold':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full" style={{ backgroundColor: c, opacity: 0.06 }} />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full" style={{ backgroundColor: c, opacity: 0.05 }} />
          <div className="absolute top-8 right-12 w-8 h-8 rounded-full border-2" style={{ borderColor: c, opacity: 0.1 }} />
          <div className="absolute bottom-12 left-16 w-4 h-4 rounded-full" style={{ backgroundColor: c, opacity: 0.12 }} />
          <svg className="absolute top-4 left-1/3 w-20 h-20" viewBox="0 0 80 80" fill="none"><rect x="20" y="20" width="40" height="40" rx="8" stroke={c} strokeWidth="1.5" opacity="0.06" transform="rotate(15 40 40)" /></svg>
          <div className="absolute top-1/4 right-6 w-12 h-12 rotate-45 rounded-lg" style={{ backgroundColor: c, opacity: 0.04 }} />
          <div className="absolute bottom-4 right-1/3 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.15 }} />
        </div>
      )
    case 'elegant':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2" style={{ borderColor: c, opacity: 0.08 }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full border" style={{ borderColor: c, opacity: 0.06 }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-45 border" style={{ borderColor: c, opacity: 0.08 }} />
          <svg className="absolute top-2 left-4 w-8 h-8" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="6" stroke={c} strokeWidth="0.5" opacity="0.1" /><circle cx="16" cy="16" r="12" stroke={c} strokeWidth="0.5" opacity="0.06" /></svg>
          <div className="absolute bottom-6 right-8 w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
        </div>
      )
    case 'creative':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-8 w-16 h-16 rounded-full border-2" style={{ borderColor: c, opacity: 0.08 }} />
          <div className="absolute -bottom-4 left-12 w-20 h-20 rounded-full" style={{ backgroundColor: c, opacity: 0.04 }} />
          <svg className="absolute top-12 right-4 w-12 h-12" viewBox="0 0 48 48" fill="none"><polygon points="24,4 44,40 4,40" stroke={c} strokeWidth="1" opacity="0.08" /></svg>
          <div className="absolute top-0 left-1/3 w-px h-full" style={{ backgroundColor: c, opacity: 0.04, transform: 'rotate(20deg)' }} />
          <div className="absolute top-8 left-8 w-3 h-3 rotate-45" style={{ backgroundColor: c, opacity: 0.1 }} />
          <div className="absolute bottom-16 right-20 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.12 }} />
        </div>
      )
    case 'geometric':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute -top-4 -right-4 w-32 h-32" viewBox="0 0 128 128" fill="none">
            <polygon points="64,8 120,40 120,88 64,120 8,88 8,40" stroke={c} strokeWidth="1.5" opacity="0.08" />
            <polygon points="64,24 104,48 104,80 64,104 24,80 24,48" stroke={c} strokeWidth="1" opacity="0.05" />
          </svg>
          <svg className="absolute bottom-2 left-4 w-16 h-16" viewBox="0 0 64 64" fill="none">
            <polygon points="32,4 60,56 4,56" stroke={c} strokeWidth="1" opacity="0.08" />
          </svg>
          <div className="absolute top-6 left-12 w-6 h-6 rotate-45 border" style={{ borderColor: c, opacity: 0.1 }} />
          <div className="absolute bottom-8 right-8 w-4 h-4 rotate-12 border" style={{ borderColor: c, opacity: 0.08 }} />
          <svg className="absolute top-1/2 right-1/4 w-8 h-8" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" stroke={c} strokeWidth="1" opacity="0.06" transform="rotate(15 16 16)" /></svg>
          <div className="absolute top-3 left-1/3 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.15 }} />
          <div className="absolute bottom-4 left-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.1 }} />
        </div>
      )
    case 'wave':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: c, opacity: 0.06 }} />
          <div className="absolute -top-4 right-12 w-20 h-20 rounded-full" style={{ backgroundColor: c, opacity: 0.05 }} />
          <div className="absolute bottom-8 -right-6 w-28 h-28 rounded-full" style={{ backgroundColor: c, opacity: 0.04 }} />
          <div className="absolute bottom-4 left-8 w-10 h-10 rounded-full" style={{ backgroundColor: c, opacity: 0.07 }} />
          <div className="absolute top-1/3 left-1/2 w-6 h-6 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
          <svg className="absolute bottom-0 left-0 w-full h-12" viewBox="0 0 200 48" fill="none" preserveAspectRatio="none">
            <path d="M0,24 C30,8 70,40 100,24 C130,8 170,40 200,24" stroke={c} strokeWidth="1" opacity="0.08" fill="none" />
            <path d="M0,32 C30,16 70,48 100,32 C130,16 170,48 200,32" stroke={c} strokeWidth="1" opacity="0.05" fill="none" />
          </svg>
        </div>
      )
    case 'neon':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-8 w-16 h-16 rounded-full border" style={{ borderColor: c, opacity: 0.15, boxShadow: `0 0 15px ${c}30` }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border" style={{ borderColor: c, opacity: 0.1, boxShadow: `0 0 20px ${c}25` }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.3, boxShadow: `0 0 8px ${c}` }} />
          <div className="absolute bottom-8 right-16 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c, opacity: 0.25, boxShadow: `0 0 6px ${c}` }} />
          <div className="absolute top-0 left-1/4 w-px h-full" style={{ background: `linear-gradient(to bottom, transparent, ${c}15, transparent)` }} />
          <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: `linear-gradient(to right, transparent, ${c}10, transparent)` }} />
          <svg className="absolute top-6 left-6 w-10 h-10" viewBox="0 0 40 40" fill="none"><polygon points="20,2 38,30 2,30" stroke={c} strokeWidth="0.5" opacity="0.12" /></svg>
        </div>
      )
    case 'glass':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full" style={{ background: `radial-gradient(circle, ${c}18, transparent)` }} />
          <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full" style={{ background: `radial-gradient(circle, ${c}14, transparent)` }} />
          <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, ${c}10, transparent)` }} />
          <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full" style={{ backgroundColor: c, opacity: 0.04 }} />
          <div className="absolute top-8 right-8 w-4 h-4 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
          <div className="absolute bottom-6 left-10 w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.06 }} />
        </div>
      )
    case 'retro':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 right-6 w-12 h-12 rounded-full border-2" style={{ borderColor: c, opacity: 0.12 }} />
          <div className="absolute -bottom-2 left-8 w-16 h-16 rounded-full" style={{ backgroundColor: c, opacity: 0.06 }} />
          <svg className="absolute top-8 left-6 w-10 h-10" viewBox="0 0 40 40" fill="none"><polygon points="20,2 38,32 2,32" fill={c} opacity="0.06" /></svg>
          <svg className="absolute bottom-4 right-4 w-8 h-8" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" fill={c} opacity="0.05" transform="rotate(20 16 16)" /></svg>
          <div className="absolute top-1/2 left-4 w-8 h-1.5 rounded-full" style={{ backgroundColor: c, opacity: 0.08 }} />
          <svg className="absolute top-3 left-1/2 w-6 h-6" viewBox="0 0 24 24" fill="none"><line x1="4" y1="4" x2="20" y2="20" stroke={c} strokeWidth="2" opacity="0.08" /><line x1="20" y1="4" x2="4" y2="20" stroke={c} strokeWidth="2" opacity="0.08" /></svg>
          <div className="absolute bottom-10 left-1/3 w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.1 }} />
          <div className="absolute top-12 right-1/3 w-2 h-2 rotate-45" style={{ backgroundColor: c, opacity: 0.12 }} />
        </div>
      )
    case 'corporate':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-2 -right-2 w-20 h-20 rotate-45" style={{ borderColor: c, borderWidth: 1, opacity: 0.06 }} />
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="200" y2="200" stroke={c} strokeWidth="0.5" opacity="0.04" />
            <line x1="40" y1="0" x2="200" y2="160" stroke={c} strokeWidth="0.5" opacity="0.03" />
            <line x1="0" y1="40" x2="160" y2="200" stroke={c} strokeWidth="0.5" opacity="0.03" />
          </svg>
          <div className="absolute top-4 left-4 w-3 h-3 rotate-45" style={{ borderColor: c, borderWidth: 1, opacity: 0.08 }} />
          <div className="absolute bottom-4 right-8 w-6 h-6 rotate-45" style={{ borderColor: c, borderWidth: 1, opacity: 0.06 }} />
          <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: c, opacity: 0.1 }} />
        </div>
      )
    default:
      return null
  }
}

// Icon mapper based on icon_style
function getIcons(style: VendorBranding['icon_style']) {
  if (style === 'lucide') {
    return {
      mail: Mail, phone: Phone, globe: Globe, building: Building2,
      linkedin: Linkedin, twitter: Twitter, instagram: Instagram, facebook: Facebook,
      mapPin: MapPin, briefcase: Briefcase, external: ExternalLink,
    }
  }
  // Default: tabler (also for 'minimal' and 'filled')
  return {
    mail: IconMail, phone: IconPhone, globe: IconWorld, building: IconBuilding,
    linkedin: IconBrandLinkedin, twitter: IconBrandTwitter, instagram: IconBrandInstagram, facebook: IconBrandFacebook,
    mapPin: IconMapPin, briefcase: IconBriefcase, external: IconExternalLink,
  }
}

function getSocialIcon(platform: string, icons: ReturnType<typeof getIcons>) {
  const key = platform.toLowerCase()
  if (key.includes('linkedin')) return icons.linkedin
  if (key.includes('twitter') || key.includes('x.com')) return icons.twitter
  if (key.includes('instagram')) return icons.instagram
  if (key.includes('facebook')) return icons.facebook
  return icons.globe
}

// ─── Google Font Loader ─────────────────────────────────────────────────────

function useFontLoader(fontFamily: string, headingFont?: string | null) {
  useEffect(() => {
    const fonts = [fontFamily, headingFont].filter(Boolean) as string[]
    fonts.forEach((font) => {
      const id = `gfont-${font.replace(/\s+/g, '-').toLowerCase()}`
      if (document.getElementById(id)) return
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700&display=swap`
      document.head.appendChild(link)
    })
  }, [fontFamily, headingFont])
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function BusinessCard({ data, branding: brandingOverride, size = 'full', className = '' }: BusinessCardProps) {
  const b = useMemo(() => ({ ...DEFAULT_BRANDING, ...brandingOverride }), [brandingOverride])

  useFontLoader(b.font_family, b.heading_font)

  const icons = useMemo(() => getIcons(b.icon_style), [b.icon_style])
  const headerBg = useMemo(() => getHeaderBackground(b), [b])
  const textColor = useMemo(() => getTextColor(b), [b])
  const borderRadius = useMemo(() => getBorderRadius(b), [b])
  const pattern = useMemo(() => getPatternCSS(b), [b])
  const patternSize = useMemo(() => getPatternSize(b.pattern_type), [b.pattern_type])

  const headingFontFamily = b.heading_font || b.font_family
  const bodyFontFamily = b.font_family

  const socials = Object.entries(data.social_links || {}).filter(([, url]) => url)

  if (size === 'mini') {
    return <MiniCard data={data} b={b} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} headingFontFamily={headingFontFamily} className={className} />
  }

  switch (b.template) {
    case 'classic':
      return <ClassicLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'modern':
      return <ModernLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'minimal':
      return <MinimalLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'bold':
      return <BoldLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'elegant':
      return <ElegantLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'creative':
      return <CreativeLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'geometric':
      return <GeometricLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'wave':
      return <WaveLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'neon':
      return <NeonLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'glass':
      return <GlassLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'retro':
      return <RetroLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    case 'corporate':
      return <CorporateLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
    default:
      return <ModernLayout data={data} b={b} icons={icons} headerBg={headerBg} textColor={textColor} borderRadius={borderRadius} pattern={pattern} patternSize={patternSize} headingFont={headingFontFamily} bodyFont={bodyFontFamily} socials={socials} size={size} className={className} />
  }
}

// ─── Mini Card (used on dashboards) ─────────────────────────────────────────

interface MiniCardProps {
  data: BusinessCardData
  b: VendorBranding
  headerBg: string
  textColor: string
  borderRadius: string
  headingFontFamily: string
  className: string
}

function MiniCard({ data, headerBg, textColor, borderRadius, headingFontFamily, className }: MiniCardProps) {
  return (
    <div className={`overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius }}>
      <div className="h-12 flex items-center gap-2.5 px-3" style={{ background: headerBg, color: textColor }}>
        {data.logo_url ? (
          <img src={data.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <IconBuilding size={16} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ fontFamily: headingFontFamily }}>{data.business_name}</p>
          {data.tagline && <p className="text-[10px] opacity-80 truncate">{data.tagline}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Shared Layout Props ────────────────────────────────────────────────────

interface LayoutProps {
  data: BusinessCardData
  b: VendorBranding
  icons: ReturnType<typeof getIcons>
  headerBg: string
  textColor: string
  borderRadius: string
  pattern: string
  patternSize: string
  headingFont: string
  bodyFont: string
  socials: [string, string][]
  size: 'full' | 'compact'
  className: string
}

// ─── Template 1: Classic ────────────────────────────────────────────────────
// Logo top-left beside name, color band (30%), vertical icon-list contacts, pill socials

function ClassicLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Header - 30% */}
      <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '16px' : '24px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="classic" color={textColor} />
        <div className="relative flex items-center gap-3">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl object-cover ring-2 ring-white/20`} />
          ) : (
            <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl bg-white/20 flex items-center justify-center`}>
              <IconBuilding size={compact ? 20 : 28} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold truncate`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
            {data.tagline && <p className={`${compact ? 'text-xs' : 'text-sm'} opacity-80 truncate`}>{data.tagline}</p>}
            {data.industry && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20 backdrop-blur-sm">{data.industry}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'p-3 space-y-2' : 'p-5 space-y-4'}`}>
        {/* Contact - vertical icon list */}
        <div className="space-y-1.5">
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <icons.briefcase size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.phone size={14} className="text-slate-400 flex-shrink-0" />
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.globe size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {/* Description */}
        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{data.business_description}</p>
        )}

        {/* Social - pill badges */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  style={{ borderColor: b.accent_color || undefined }}>
                  <Icon size={12} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {/* Products - stacked list */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products & Services</p>
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                {p.description && <span className="text-slate-500 dark:text-slate-400"> — {p.description}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 2: Modern ─────────────────────────────────────────────────────
// Centered logo overlapping curved header, 2-col contacts, circle socials, scroll products

function ModernLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Header - 40% with curved bottom */}
      <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '20px 16px 28px' : '32px 24px 40px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="modern" color={textColor} />
        <div className="relative text-center">
          <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
          {data.tagline && <p className={`${compact ? 'text-xs' : 'text-sm'} opacity-80 mt-1`}>{data.tagline}</p>}
        </div>
        {/* Curved edge */}
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-white dark:bg-slate-800" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </div>

      {/* Logo - overlapping */}
      <div className="relative -mt-8 flex justify-center z-10">
        {data.logo_url ? (
          <img src={data.logo_url} alt="" className={`${compact ? 'w-14 h-14' : 'w-18 h-18'} rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg`} style={{ width: compact ? 56 : 72, height: compact ? 56 : 72 }} />
        ) : (
          <div className={`rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-4 ring-white dark:ring-slate-800 shadow-lg`} style={{ width: compact ? 56 : 72, height: compact ? 56 : 72 }}>
            <IconBuilding size={compact ? 24 : 32} className="text-slate-400" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'px-3 pb-3 pt-2 space-y-2' : 'px-5 pb-5 pt-3 space-y-4'}`}>
        {/* Industry badge */}
        {data.industry && (
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs rounded-full" style={{ backgroundColor: `${b.primary_color}15`, color: b.primary_color }}>{data.industry}</span>
          </div>
        )}

        {/* Contact - 2-column grid */}
        <div className={`grid ${compact ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-2'}`}>
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <icons.briefcase size={13} className="text-slate-400" />
              <span className="truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.mail size={13} className="text-slate-400" />
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.phone size={13} className="text-slate-400" />
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <icons.globe size={13} className="text-slate-400" />
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {/* Description */}
        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center line-clamp-3">{data.business_description}</p>
        )}

        {/* Social - circle icon buttons */}
        {socials.length > 0 && (
          <div className="flex justify-center gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: `${b.primary_color}15`, color: b.primary_color }}>
                  <Icon size={14} />
                </a>
              )
            })}
          </div>
        )}

        {/* Products - horizontal scroll cards */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Products & Services</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {data.products_services.slice(0, 5).map((p, i) => (
                <div key={i} className="flex-shrink-0 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 min-w-[120px]">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                  {p.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 3: Minimal ────────────────────────────────────────────────────
// Small logo top-right, NO header (thin accent line), single-col typography, text socials

function MinimalLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 relative ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Thin accent line */}
      <div className="h-1" style={{ background: headerBg }} />
      <AbstractShapes template="minimal" color={b.primary_color} />

      <div className={`relative ${compact ? 'p-3' : 'p-6'}`}>
        {/* Top row: Name + small logo */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-slate-900 dark:text-white`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
            {data.tagline && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{data.tagline}</p>}
          </div>
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <IconBuilding size={18} className="text-slate-400" />
            </div>
          )}
        </div>

        {/* Industry */}
        {data.industry && (
          <p className="text-xs text-slate-500 mt-2" style={{ color: b.primary_color }}>{data.industry}</p>
        )}

        {/* Spacer */}
        <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

        {/* Contact - single column, typography driven */}
        <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {data.contact_name && (
            <p className="text-slate-700 dark:text-slate-300 font-medium">{data.contact_name}</p>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{data.email}</a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{data.phone}</a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{data.website}</a>
          )}
        </div>

        {/* Description */}
        {!compact && data.business_description && (
          <>
            <div className="my-4 border-t border-slate-100 dark:border-slate-700" />
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data.business_description}</p>
          </>
        )}

        {/* Social - underlined text links */}
        {socials.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-100 dark:border-slate-700" />
            <div className="space-y-1">
              {socials.map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="block text-sm underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors capitalize">
                  {platform}
                </a>
              ))}
            </div>
          </>
        )}

        {/* Products - comma text */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-100 dark:border-slate-700" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.products_services.map(p => p.name).join(' · ')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Template 4: Bold ───────────────────────────────────────────────────────
// Large centered logo in hero, full-bleed color (50%), chip contacts, large socials, grid products

function BoldLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Hero - 50% */}
      <div className="relative flex flex-col items-center justify-center" style={{ background: headerBg, color: textColor, padding: compact ? '24px 16px' : '40px 24px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="bold" color={textColor} />
        <div className="relative text-center">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl object-cover mx-auto ring-4 ring-white/20 shadow-lg mb-3`} />
          ) : (
            <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3`}>
              <IconBuilding size={compact ? 28 : 36} />
            </div>
          )}
          <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
          {data.tagline && <p className={`${compact ? 'text-xs' : 'text-sm'} opacity-80 mt-1`}>{data.tagline}</p>}

          {/* Contact chips overlaid */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {data.email && (
              <a href={`mailto:${data.email}`} className="px-2.5 py-1 text-[11px] rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors truncate max-w-[180px]">{data.email}</a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} className="px-2.5 py-1 text-[11px] rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">{data.phone}</a>
            )}
            {data.industry && (
              <span className="px-2.5 py-1 text-[11px] rounded-full bg-white/20 backdrop-blur-sm">{data.industry}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'p-3 space-y-2' : 'p-5 space-y-4'}`}>
        {/* Description */}
        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{data.business_description}</p>
        )}

        {/* Social - large icon buttons with labels */}
        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: `${b.primary_color}10`, color: b.primary_color }}>
                  <Icon size={14} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {/* Products - grid tiles */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl text-center" style={{ backgroundColor: `${b.primary_color}08` }}>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                {p.description && <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Website */}
        {data.website && (
          <div className="text-center">
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: b.primary_color }}>
              <icons.globe size={12} />
              {data.website}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 5: Elegant ────────────────────────────────────────────────────
// Centered framed logo, ornamental dividers, centered contacts, dot-separated socials, shadow cards

function ElegantLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Header - subtle gradient, 35% */}
      <div className="relative text-center" style={{ background: headerBg, color: textColor, padding: compact ? '20px 16px' : '28px 24px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="elegant" color={textColor} />
        <div className="relative">
          {/* Framed logo */}
          {data.logo_url ? (
            <div className="inline-block p-1 rounded-full border-2 border-white/30 mb-2">
              <img src={data.logo_url} alt="" className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover`} />
            </div>
          ) : (
            <div className={`inline-flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-2 border-white/30 bg-white/10 mb-2`}>
              <IconBuilding size={compact ? 20 : 28} />
            </div>
          )}
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
          {data.tagline && <p className="text-xs opacity-80 mt-1 italic">{data.tagline}</p>}
        </div>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center justify-center py-2 bg-white dark:bg-slate-800">
        <div className="h-px w-12 bg-slate-200 dark:bg-slate-600" />
        <div className="w-1.5 h-1.5 rounded-full mx-2" style={{ backgroundColor: b.primary_color }} />
        <div className="h-px w-12 bg-slate-200 dark:bg-slate-600" />
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'px-3 pb-3 space-y-3' : 'px-6 pb-6 space-y-4'}`}>
        {/* Industry */}
        {data.industry && (
          <p className="text-center text-xs tracking-widest uppercase text-slate-500">{data.industry}</p>
        )}

        {/* Contact - centered, one per line */}
        <div className="text-center space-y-1.5">
          {data.contact_name && (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.contact_name}</p>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">{data.email}</a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">{data.phone}</a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">{data.website}</a>
          )}
        </div>

        {/* Description */}
        {!compact && data.business_description && (
          <>
            <div className="flex items-center justify-center">
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-600" />
              <div className="w-1 h-1 rounded-full mx-2" style={{ backgroundColor: b.primary_color }} />
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-600" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center italic leading-relaxed">{data.business_description}</p>
          </>
        )}

        {/* Social - inline with dots */}
        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-1 text-sm">
            {socials.map(([platform, url], i) => (
              <span key={platform} className="flex items-center">
                {i > 0 && <span className="mx-1.5 text-slate-300">·</span>}
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors capitalize">{platform}</a>
              </span>
            ))}
          </div>
        )}

        {/* Products - bordered shadow cards */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="space-y-2 pt-2">
            {data.products_services.slice(0, 3).map((p, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 6: Creative ───────────────────────────────────────────────────
// Diagonal color slice, floating logo, staggered contacts, angled socials, masonry products

function CreativeLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 relative ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Diagonal color slice */}
      <div className="absolute top-0 left-0 right-0 h-full" style={{ background: headerBg, clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 55%)' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="creative" color={textColor} />
      </div>

      {/* Content */}
      <div className={`relative ${compact ? 'p-4' : 'p-6'}`}>
        {/* Top section on colored area */}
        <div className="flex items-start gap-3" style={{ color: textColor }}>
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover ring-2 ring-white/30 shadow-lg rotate-3`} />
          ) : (
            <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl bg-white/20 flex items-center justify-center rotate-3`}>
              <IconBuilding size={compact ? 22 : 28} />
            </div>
          )}
          <div className="min-w-0 pt-1">
            <h3 className={`${compact ? 'text-base' : 'text-xl'} font-black`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
            {data.tagline && <p className="text-xs opacity-80 mt-0.5">{data.tagline}</p>}
            {data.industry && (
              <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] rounded bg-white/20 backdrop-blur-sm">{data.industry}</span>
            )}
          </div>
        </div>

        {/* Staggered contacts */}
        <div className={`${compact ? 'mt-8 space-y-1.5' : 'mt-14 space-y-2'}`}>
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 ml-2">
              <icons.briefcase size={13} className="text-slate-400" />
              <span>{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors ml-6">
              <icons.mail size={13} className="text-slate-400" />
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors ml-4">
              <icons.phone size={13} className="text-slate-400" />
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors ml-8">
              <icons.globe size={13} className="text-slate-400" />
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {/* Description */}
        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 pl-2 border-l-2" style={{ borderColor: b.primary_color }}>{data.business_description}</p>
        )}

        {/* Social - angled badges */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {socials.map(([platform, url], i) => {
              const Icon = getSocialIcon(platform, icons)
              const rotation = i % 2 === 0 ? '-1deg' : '1deg'
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: `${b.primary_color}12`, color: b.primary_color, transform: `rotate(${rotation})` }}>
                  <Icon size={12} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {/* Products - masonry style */}
        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className={`p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 ${i === 0 ? 'col-span-2' : ''}`} style={{ backgroundColor: i === 0 ? `${b.primary_color}06` : undefined }}>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                {p.description && <p className="text-[10px] text-slate-500 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 7: Geometric ──────────────────────────────────────────────────
// Angular design with floating polygons, hexagonal accents, contact boxes

function GeometricLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Angular header with clipped bottom */}
      <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '20px 16px 32px' : '28px 24px 44px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="geometric" color={textColor} />
        <div className="relative flex items-center gap-3">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} object-cover shadow-lg`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          ) : (
            <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-white/20 flex items-center justify-center`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <IconBuilding size={compact ? 20 : 28} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`${compact ? 'text-base' : 'text-xl'} font-black tracking-tight`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
            {data.tagline && <p className={`${compact ? 'text-xs' : 'text-sm'} opacity-80`}>{data.tagline}</p>}
          </div>
        </div>
        {/* Angular cut */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white dark:bg-slate-800" style={{ clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)' }} />
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'px-3 pb-3 space-y-2' : 'px-5 pb-5 space-y-3'}`}>
        {data.industry && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4" style={{ backgroundColor: b.primary_color }} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{data.industry}</span>
          </div>
        )}

        {/* Contact in colored boxes */}
        <div className={`grid ${compact ? 'grid-cols-1 gap-1.5' : 'grid-cols-2 gap-2'}`}>
          {data.contact_name && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: `${b.primary_color}08` }}>
              <icons.briefcase size={14} style={{ color: b.primary_color }} />
              <span className="text-slate-700 dark:text-slate-300 truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:shadow-sm transition-shadow" style={{ backgroundColor: `${b.primary_color}08` }}>
              <icons.mail size={14} style={{ color: b.primary_color }} />
              <span className="text-slate-700 dark:text-slate-300 truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:shadow-sm transition-shadow" style={{ backgroundColor: `${b.primary_color}08` }}>
              <icons.phone size={14} style={{ color: b.primary_color }} />
              <span className="text-slate-700 dark:text-slate-300">{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:shadow-sm transition-shadow" style={{ backgroundColor: `${b.primary_color}08` }}>
              <icons.globe size={14} style={{ color: b.primary_color }} />
              <span className="text-slate-700 dark:text-slate-300 truncate">{data.website}</span>
            </a>
          )}
        </div>

        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{data.business_description}</p>
        )}

        {/* Hexagonal social icons */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: `${b.primary_color}12`, color: b.primary_color, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <Icon size={14} />
                </a>
              )
            })}
          </div>
        )}

        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4" style={{ backgroundColor: b.primary_color }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Services</span>
            </div>
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm pl-3">
                <div className="w-1.5 h-1.5 rotate-45 mt-1.5 flex-shrink-0" style={{ backgroundColor: b.primary_color }} />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                  {p.description && <span className="text-slate-500 dark:text-slate-400"> — {p.description}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 8: Wave ───────────────────────────────────────────────────────
// Organic flowing shapes, layered wave separators, floating orbs, bubble socials

function WaveLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Header with wave bottom */}
      <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '20px 16px 36px' : '28px 24px 48px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="wave" color={textColor} />
        <div className="relative text-center">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-14 h-14' : 'w-18 h-18'} rounded-full object-cover mx-auto ring-4 ring-white/20 shadow-xl mb-3`} style={{ width: compact ? 56 : 72, height: compact ? 56 : 72 }} />
          ) : (
            <div className="rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3" style={{ width: compact ? 56 : 72, height: compact ? 56 : 72 }}>
              <IconBuilding size={compact ? 24 : 32} />
            </div>
          )}
          <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
          {data.tagline && <p className="text-xs opacity-80 mt-1">{data.tagline}</p>}
        </div>
        {/* Wave separator */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 400 32" preserveAspectRatio="none" style={{ height: 24 }}>
          <path d="M0,16 C100,0 150,32 200,16 C250,0 300,32 400,16 L400,32 L0,32 Z" className="fill-white dark:fill-slate-800" />
          <path d="M0,20 C80,8 160,28 240,16 C320,4 360,24 400,16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
        </svg>
      </div>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'px-3 pb-3 space-y-3' : 'px-5 pb-5 space-y-4'}`}>
        {data.industry && (
          <div className="text-center">
            <span className="inline-block px-4 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: `${b.primary_color}10`, color: b.primary_color }}>{data.industry}</span>
          </div>
        )}

        {/* Contact in rounded containers */}
        <div className="space-y-1.5">
          {data.contact_name && (
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${b.primary_color}10` }}>
                <icons.briefcase size={13} style={{ color: b.primary_color }} />
              </div>
              <span className="truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${b.primary_color}10` }}>
                <icons.mail size={13} style={{ color: b.primary_color }} />
              </div>
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${b.primary_color}10` }}>
                <icons.phone size={13} style={{ color: b.primary_color }} />
              </div>
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${b.primary_color}10` }}>
                <icons.globe size={13} style={{ color: b.primary_color }} />
              </div>
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {!compact && data.business_description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed">{data.business_description}</p>
        )}

        {/* Bubble socials */}
        {socials.length > 0 && (
          <div className="flex justify-center gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  style={{ backgroundColor: `${b.primary_color}12`, color: b.primary_color }}>
                  <Icon size={14} />
                </a>
              )
            })}
          </div>
        )}

        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {data.products_services.slice(0, 5).map((p, i) => (
              <div key={i} className="flex-shrink-0 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 min-w-[110px]">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                {p.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 9: Neon ───────────────────────────────────────────────────────
// Dark theme, glowing accents, neon borders, futuristic tech feel

function NeonLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  const glowColor = b.primary_color
  return (
    <div className={`overflow-hidden shadow-elevated ${className}`} style={{ borderRadius, fontFamily: bodyFont, border: `1px solid ${glowColor}25`, boxShadow: `0 0 20px ${glowColor}15, 0 4px 24px rgba(0,0,0,0.2)` }}>
      {/* Dark header with glow */}
      <div className="relative" style={{ background: `linear-gradient(135deg, #0f172a, #1e293b)`, color: '#e2e8f0', padding: compact ? '20px 16px' : '28px 24px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize, opacity: 0.5 }} />
        )}
        <AbstractShapes template="neon" color={glowColor} />
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }} />
        <div className="relative flex items-center gap-3">
          {data.logo_url ? (
            <img src={data.logo_url} alt="" className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover`} style={{ boxShadow: `0 0 15px ${glowColor}40`, border: `1px solid ${glowColor}30` }} />
          ) : (
            <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl flex items-center justify-center`} style={{ background: `${glowColor}15`, border: `1px solid ${glowColor}30`, boxShadow: `0 0 15px ${glowColor}20` }}>
              <IconBuilding size={compact ? 20 : 28} style={{ color: glowColor }} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`${compact ? 'text-base' : 'text-xl'} font-black`} style={{ fontFamily: headingFont, color: glowColor, textShadow: `0 0 20px ${glowColor}60` }}>{data.business_name}</h3>
            {data.tagline && <p className="text-xs text-slate-400 mt-0.5">{data.tagline}</p>}
            {data.industry && (
              <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] rounded-md" style={{ backgroundColor: `${glowColor}15`, color: glowColor, border: `1px solid ${glowColor}25` }}>{data.industry}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body - dark */}
      <div className={`${compact ? 'p-3 space-y-2' : 'p-5 space-y-3'}`} style={{ background: '#0f172a' }}>
        {/* Contact with neon accent */}
        <div className="space-y-1.5">
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <icons.briefcase size={14} style={{ color: glowColor }} />
              <span className="truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <icons.mail size={14} style={{ color: glowColor }} />
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <icons.phone size={14} style={{ color: glowColor }} />
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <icons.globe size={14} style={{ color: glowColor }} />
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {!compact && data.business_description && (
          <>
            <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}20, transparent)` }} />
            <p className="text-sm text-slate-400 leading-relaxed">{data.business_description}</p>
          </>
        )}

        {/* Neon social buttons */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all hover:scale-105"
                  style={{ backgroundColor: `${glowColor}10`, color: glowColor, border: `1px solid ${glowColor}20`, boxShadow: `0 0 8px ${glowColor}15` }}>
                  <Icon size={12} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: glowColor }}>Services</p>
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className="px-3 py-2 rounded-lg" style={{ backgroundColor: `${glowColor}06`, border: `1px solid ${glowColor}10` }}>
                <p className="text-xs font-medium text-slate-200">{p.name}</p>
                {p.description && <p className="text-[10px] text-slate-500 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Bottom glow line */}
        <div className="h-px -mx-5" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}30, transparent)` }} />
      </div>
    </div>
  )
}

// ─── Template 10: Glass ─────────────────────────────────────────────────────
// Glassmorphism with frosted panels, blurred orbs, translucent layers

function GlassLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated relative ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Full colored background */}
      <div className="absolute inset-0" style={{ background: headerBg }} />
      {pattern !== 'none' && (
        <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
      )}
      <AbstractShapes template="glass" color={textColor} />

      {/* Content */}
      <div className={`relative ${compact ? 'p-3 space-y-3' : 'p-5 space-y-4'}`} style={{ color: textColor }}>
        {/* Frosted name card */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-3">
            {data.logo_url ? (
              <img src={data.logo_url} alt="" className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover shadow-lg`} style={{ border: '1px solid rgba(255,255,255,0.2)' }} />
            ) : (
              <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl flex items-center justify-center`} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <IconBuilding size={compact ? 20 : 28} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
              {data.tagline && <p className="text-xs opacity-80 mt-0.5">{data.tagline}</p>}
              {data.industry && <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>{data.industry}</span>}
            </div>
          </div>
        </div>

        {/* Frosted contact card */}
        <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm">
              <icons.briefcase size={13} className="opacity-70 flex-shrink-0" />
              <span className="truncate">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity">
              <icons.mail size={13} className="opacity-70 flex-shrink-0" />
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity">
              <icons.phone size={13} className="opacity-70 flex-shrink-0" />
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity">
              <icons.globe size={13} className="opacity-70 flex-shrink-0" />
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {!compact && data.business_description && (
          <p className="text-sm opacity-80 leading-relaxed px-1">{data.business_description}</p>
        )}

        {/* Glass social buttons */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map(([platform, url]) => {
              const Icon = getSocialIcon(platform, icons)
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon size={12} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.products_services.slice(0, 4).map((p, i) => (
              <div key={i} className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-medium truncate">{p.name}</p>
                {p.description && <p className="text-[10px] opacity-60 truncate mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 11: Retro ─────────────────────────────────────────────────────
// Memphis design, bold shapes, playful offsets, colorful accents

function RetroLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border-2 border-slate-200 dark:border-slate-600 relative ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Colored top section with Memphis shapes */}
      <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '20px 16px' : '28px 24px' }}>
        {pattern !== 'none' && (
          <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
        )}
        <AbstractShapes template="retro" color={textColor} />
        <div className="relative">
          <div className="flex items-start gap-3">
            {data.logo_url ? (
              <img src={data.logo_url} alt="" className={`${compact ? 'w-14 h-14' : 'w-18 h-18'} rounded-2xl object-cover shadow-lg border-2 border-white/30`} style={{ width: compact ? 56 : 72, height: compact ? 56 : 72, transform: 'rotate(-3deg)' }} />
            ) : (
              <div className="rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30" style={{ width: compact ? 56 : 72, height: compact ? 56 : 72, transform: 'rotate(-3deg)' }}>
                <IconBuilding size={compact ? 22 : 30} />
              </div>
            )}
            <div className="min-w-0 pt-1">
              <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
              {data.tagline && <p className="text-xs opacity-80 mt-0.5">{data.tagline}</p>}
            </div>
          </div>
          {data.industry && (
            <div className="mt-2 inline-block px-3 py-1 text-xs font-bold rounded-lg bg-white/20 backdrop-blur-sm" style={{ transform: 'rotate(1deg)' }}>{data.industry}</div>
          )}
        </div>
      </div>

      {/* Zigzag separator */}
      <svg className="w-full block -mt-px" viewBox="0 0 400 12" preserveAspectRatio="none" style={{ height: 8 }}>
        <path d="M0,0 L20,12 L40,0 L60,12 L80,0 L100,12 L120,0 L140,12 L160,0 L180,12 L200,0 L220,12 L240,0 L260,12 L280,0 L300,12 L320,0 L340,12 L360,0 L380,12 L400,0 L400,12 L0,12 Z" className="fill-white dark:fill-slate-800" />
      </svg>

      {/* Body */}
      <div className={`bg-white dark:bg-slate-800 ${compact ? 'px-3 pb-3 space-y-2' : 'px-5 pb-5 space-y-3'}`}>
        {/* Contact with playful offsets */}
        <div className="space-y-1.5">
          {data.contact_name && (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.primary_color}15`, transform: 'rotate(-2deg)' }}>
                <icons.briefcase size={12} style={{ color: b.primary_color }} />
              </div>
              <span className="font-medium">{data.contact_name}</span>
            </div>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.primary_color}15`, transform: 'rotate(1deg)' }}>
                <icons.mail size={12} style={{ color: b.primary_color }} />
              </div>
              <span className="truncate">{data.email}</span>
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.primary_color}15`, transform: 'rotate(-1deg)' }}>
                <icons.phone size={12} style={{ color: b.primary_color }} />
              </div>
              <span>{data.phone}</span>
            </a>
          )}
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${b.primary_color}15`, transform: 'rotate(2deg)' }}>
                <icons.globe size={12} style={{ color: b.primary_color }} />
              </div>
              <span className="truncate">{data.website}</span>
            </a>
          )}
        </div>

        {!compact && data.business_description && (
          <div className="p-3 rounded-xl border-2 border-dashed" style={{ borderColor: `${b.primary_color}25` }}>
            <p className="text-sm text-slate-600 dark:text-slate-400">{data.business_description}</p>
          </div>
        )}

        {/* Retro social badges */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {socials.map(([platform, url], i) => {
              const Icon = getSocialIcon(platform, icons)
              const rotation = [-2, 1, -1, 2, 0][i % 5]
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all hover:scale-105 border"
                  style={{ backgroundColor: `${b.primary_color}08`, color: b.primary_color, borderColor: `${b.primary_color}20`, transform: `rotate(${rotation}deg)` }}>
                  <Icon size={12} />
                  <span className="capitalize">{platform}</span>
                </a>
              )
            })}
          </div>
        )}

        {!compact && data.products_services && data.products_services.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.products_services.slice(0, 4).map((p, i) => {
              const rotation = [-1, 1.5, -0.5, 1][i % 4]
              return (
                <div key={i} className="p-2.5 rounded-xl border-2" style={{ borderColor: `${b.primary_color}15`, transform: `rotate(${rotation}deg)` }}>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                  {p.description && <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.description}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template 12: Corporate ─────────────────────────────────────────────────
// Professional split layout, left accent sidebar, structured grid, clean lines

function CorporateLayout({ data, b, icons, headerBg, textColor, borderRadius, pattern, patternSize, headingFont, bodyFont, socials, size, className }: LayoutProps) {
  const compact = size === 'compact'
  return (
    <div className={`overflow-hidden shadow-elevated border border-slate-100 dark:border-slate-700 flex ${className}`} style={{ borderRadius, fontFamily: bodyFont }}>
      {/* Left accent sidebar */}
      <div className="relative w-2 flex-shrink-0" style={{ background: headerBg }}>
        <AbstractShapes template="corporate" color={textColor} />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white dark:bg-slate-800">
        {/* Top banner */}
        <div className="relative" style={{ background: headerBg, color: textColor, padding: compact ? '16px 16px' : '20px 24px' }}>
          {pattern !== 'none' && (
            <div className="absolute inset-0" style={{ backgroundImage: pattern, backgroundSize: patternSize }} />
          )}
          <AbstractShapes template="corporate" color={textColor} />
          <div className="relative flex items-center gap-3">
            {data.logo_url ? (
              <img src={data.logo_url} alt="" className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover ring-2 ring-white/20`} />
            ) : (
              <div className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg bg-white/15 flex items-center justify-center`}>
                <IconBuilding size={compact ? 18 : 24} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold`} style={{ fontFamily: headingFont }}>{data.business_name}</h3>
              {data.tagline && <p className="text-xs opacity-80 truncate">{data.tagline}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className={`${compact ? 'p-3 space-y-2' : 'p-5 space-y-3'}`}>
          {data.industry && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: b.primary_color }} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{data.industry}</span>
            </div>
          )}

          {/* Contact grid */}
          <div className={`grid ${compact ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-x-4 gap-y-1.5'}`}>
            {data.contact_name && (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-700">
                <icons.briefcase size={13} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{data.contact_name}</span>
              </div>
            )}
            {data.email && (
              <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors py-1 border-b border-slate-100 dark:border-slate-700">
                <icons.mail size={13} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{data.email}</span>
              </a>
            )}
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors py-1 border-b border-slate-100 dark:border-slate-700">
                <icons.phone size={13} className="text-slate-400 flex-shrink-0" />
                <span>{data.phone}</span>
              </a>
            )}
            {data.website && (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors py-1 border-b border-slate-100 dark:border-slate-700">
                <icons.globe size={13} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{data.website}</span>
              </a>
            )}
          </div>

          {!compact && data.business_description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data.business_description}</p>
          )}

          {/* Professional social row */}
          {socials.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: b.primary_color }} />
              <div className="flex gap-1.5">
                {socials.map(([platform, url]) => {
                  const Icon = getSocialIcon(platform, icons)
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${b.primary_color}10`, color: b.primary_color }}>
                      <Icon size={13} />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {!compact && data.products_services && data.products_services.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: b.primary_color }} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Services</span>
              </div>
              <div className="space-y-1">
                {data.products_services.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-sm py-0.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: b.primary_color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                    {p.description && <span className="text-slate-500 dark:text-slate-400 text-xs">— {p.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
