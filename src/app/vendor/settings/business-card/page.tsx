'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconBuilding,
  IconTag,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconLink,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconEye,
  IconEyeOff,
  IconBriefcase,
  IconChevronDown,
  IconSparkles,
  IconPalette,
  IconTypography,
  IconLayout,
  IconExternalLink,
  IconBorderRadius,
} from '@tabler/icons-react'
import { vendorService, type VendorBranding, DEFAULT_BRANDING } from '@/services/vendor.service'
import { cn } from '@/lib/utils'
import BusinessCard from '@/components/vendor/BusinessCard'
import TemplatePicker from '@/components/vendor/TemplatePicker'
import ColorSchemeEditor from '@/components/vendor/ColorSchemeEditor'
import FontPicker from '@/components/vendor/FontPicker'
import ImageUpload from '@/components/ui/ImageUpload'

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: IconBrandLinkedin, color: 'text-[#0A66C2]' },
  { key: 'twitter', label: 'X / Twitter', icon: IconBrandX, color: 'text-slate-900 dark:text-white' },
  { key: 'instagram', label: 'Instagram', icon: IconBrandInstagram, color: 'text-[#E4405F]' },
  { key: 'facebook', label: 'Facebook', icon: IconBrandFacebook, color: 'text-[#1877F2]' },
] as const

const INDUSTRIES = [
  'Technology', 'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
  'Marketing', 'Real Estate', 'Manufacturing', 'Retail', 'Food & Beverage',
  'Travel & Hospitality', 'Media & Entertainment', 'Consulting', 'Legal',
  'Logistics', 'Energy', 'Agriculture', 'Automotive', 'Other',
]

const CARD_STYLES: { id: VendorBranding['card_style']; label: string }[] = [
  { id: 'rounded', label: 'Rounded' },
  { id: 'sharp', label: 'Sharp' },
  { id: 'pill', label: 'Pill' },
]

const ICON_STYLES: { id: VendorBranding['icon_style']; label: string }[] = [
  { id: 'tabler', label: 'Outline' },
  { id: 'lucide', label: 'Lucide' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'filled', label: 'Filled' },
]

interface ProductItem {
  name: string
  description?: string
}

export default function VendorBusinessCardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const [showSocials, setShowSocials] = useState(false)

  // Active customization section
  const [activeSection, setActiveSection] = useState<string | null>('template')

  // Core fields
  const [businessName, setBusinessName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [tagline, setTagline] = useState('')
  const [website, setWebsite] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})
  const [products, setProducts] = useState<ProductItem[]>([])

  // Branding state
  const [branding, setBranding] = useState<VendorBranding>(DEFAULT_BRANDING)

  const updateBranding = (updates: Partial<VendorBranding>) => {
    setBranding((prev) => ({ ...prev, ...updates }))
  }

  const fetchProfile = useCallback(async () => {
    try {
      const p = await vendorService.getProfile()
      setBusinessName(p.business_name)
      setContactName(p.contact_name)
      setPhone(p.phone ?? '')
      setIndustry(p.industry ?? '')
      setDescription(p.business_description ?? '')
      setEmail(p.email)
      setTagline(p.tagline ?? '')
      setWebsite(p.website ?? '')
      setLogoUrl(p.logo_url ?? '')
      setSocialLinks(p.social_links ?? {})
      const prods = (p.products_services ?? []).map((ps) => ({
        name: ps.name,
        description: ps.description ?? '',
      }))
      setProducts(prods)
      setShowProducts(prods.length > 0)
      setShowSocials(Object.values(p.social_links ?? {}).some((v) => v.trim()))
      // Load branding
      if (p.branding && Object.keys(p.branding).length > 0) {
        setBranding({ ...DEFAULT_BRANDING, ...p.branding })
      }
    } catch { /* */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    if (!businessName.trim() || !contactName.trim()) return
    setSaving(true)
    try {
      const cleaned_products = products
        .filter((p) => p.name.trim())
        .map((p) => ({ name: p.name.trim(), description: p.description?.trim() || undefined }))
      const cleaned_social: Record<string, string> = {}
      for (const [key, val] of Object.entries(socialLinks)) {
        if (val.trim()) cleaned_social[key] = val.trim()
      }
      await vendorService.updateProfile({
        business_name: businessName.trim(),
        contact_name: contactName.trim(),
        phone: phone.trim() || null,
        industry: industry.trim() || null,
        business_description: description.trim() || null,
        tagline: tagline.trim() || null,
        website: website.trim() || null,
        logo_url: logoUrl.trim() || null,
        social_links: cleaned_social,
        products_services: cleaned_products,
        branding,
      } as any)
      router.back()
    } catch { /* */ } finally {
      setSaving(false)
    }
  }

  const updateSocial = (key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }))
  }

  const addProduct = () => setProducts((prev) => [...prev, { name: '', description: '' }])
  const updateProduct = (idx: number, field: keyof ProductItem, value: string) => {
    setProducts((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }
  const removeProduct = (idx: number) => setProducts((prev) => prev.filter((_, i) => i !== idx))

  // Completion score
  const filledFields = [
    businessName, contactName, tagline, logoUrl, website, phone, industry, description,
    Object.values(socialLinks).some((v) => v.trim()) ? 'yes' : '',
    products.some((p) => p.name.trim()) ? 'yes' : '',
  ].filter(Boolean).length
  const completionPct = Math.round((filledFields / 10) * 100)

  // Card data for preview
  const cardData = {
    business_name: businessName || 'Company Name',
    contact_name: contactName || 'Your Name',
    email,
    phone: phone || null,
    tagline: tagline || null,
    industry: industry || null,
    logo_url: logoUrl || null,
    website: website || null,
    social_links: socialLinks,
    business_description: description || null,
    products_services: products.filter((p) => p.name.trim()),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <IconLoader2 size={28} className="animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/50 dark:border-slate-800/50 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
            >
              <IconArrowLeft size={18} className="text-slate-700 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Business Card</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Customize your digital identity</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !businessName.trim() || !contactName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold active:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <IconDeviceFloppy size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Completion bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  completionPct === 100 ? 'bg-emerald-500' : completionPct >= 60 ? 'bg-brand-500' : 'bg-amber-500'
                )}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className={cn(
              'text-[11px] font-bold',
              completionPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
            )}>
              {completionPct}%
            </span>
          </div>
        </div>
      </header>

      {/* Live Preview Toggle */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <IconSparkles size={16} className="text-brand-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Live Preview</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
            {showPreview ? <><IconEyeOff size={14} /> Hide</> : <><IconEye size={14} /> Show</>}
          </div>
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="px-4 pt-3">
          <BusinessCard data={cardData} branding={branding} size="full" />
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
            This is what attendees see after scanning at your booth
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4 pb-8">

        {/* ═══ CUSTOMIZATION SECTIONS ═══ */}

        {/* Template Picker */}
        <CollapsibleSection
          icon={<IconLayout size={14} />}
          label="Card Template"
          subtitle={`${branding.template.charAt(0).toUpperCase()}${branding.template.slice(1)} layout`}
          color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          isOpen={activeSection === 'template'}
          onToggle={() => setActiveSection(activeSection === 'template' ? null : 'template')}
        >
          <TemplatePicker
            value={branding.template}
            onChange={(template) => updateBranding({ template })}
            primaryColor={branding.primary_color}
          />
        </CollapsibleSection>

        {/* Color Scheme */}
        <CollapsibleSection
          icon={<IconPalette size={14} />}
          label="Colors & Branding"
          subtitle={`${branding.color_mode} · ${branding.primary_color}`}
          color="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
          isOpen={activeSection === 'colors'}
          onToggle={() => setActiveSection(activeSection === 'colors' ? null : 'colors')}
        >
          <ColorSchemeEditor
            colorMode={branding.color_mode}
            primaryColor={branding.primary_color}
            secondaryColor={branding.secondary_color}
            gradientAngle={branding.gradient_angle}
            textColor={branding.text_color}
            accentColor={branding.accent_color}
            onChange={updateBranding}
          />
        </CollapsibleSection>

        {/* Typography */}
        <CollapsibleSection
          icon={<IconTypography size={14} />}
          label="Typography"
          subtitle={branding.font_family}
          color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          isOpen={activeSection === 'fonts'}
          onToggle={() => setActiveSection(activeSection === 'fonts' ? null : 'fonts')}
        >
          <FontPicker
            value={branding.font_family}
            headingFont={branding.heading_font}
            onChange={(font) => updateBranding({ font_family: font })}
            onHeadingFontChange={(font) => updateBranding({ heading_font: font })}
          />
        </CollapsibleSection>

        {/* Card Style & Pattern */}
        <CollapsibleSection
          icon={<IconBorderRadius size={14} />}
          label="Card Style"
          subtitle={`${branding.card_style} · ${branding.pattern_type === 'none' ? 'no pattern' : branding.pattern_type}`}
          color="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
          isOpen={activeSection === 'style'}
          onToggle={() => setActiveSection(activeSection === 'style' ? null : 'style')}
        >
          <div className="space-y-4">
            {/* Border Radius */}
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Border Shape</p>
              <div className="flex gap-2">
                {CARD_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateBranding({ card_style: style.id })}
                    className={`flex-1 py-2.5 px-3 text-xs font-medium rounded-lg border-2 transition-all ${
                      branding.card_style === style.id
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pattern Overlay</p>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branding.show_pattern}
                    onChange={(e) => updateBranding({ show_pattern: e.target.checked, pattern_type: e.target.checked ? 'dots' : 'none' })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="text-[10px] text-slate-500">Enable</span>
                </label>
              </div>
              {branding.show_pattern && (
                <div className="flex gap-1.5">
                  {(['dots', 'lines', 'waves', 'grid'] as const).map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => updateBranding({ pattern_type: pattern })}
                      className={`flex-1 py-2 text-[10px] font-medium rounded-lg border transition-all capitalize ${
                        branding.pattern_type === pattern
                          ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Icon Style */}
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Icon Style</p>
              <div className="flex gap-1.5">
                {ICON_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateBranding({ icon_style: style.id })}
                    className={`flex-1 py-2 text-[10px] font-medium rounded-lg border transition-all ${
                      branding.icon_style === style.id
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ CONTENT SECTIONS ═══ */}

        {/* Company Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4 space-y-4">
          <SectionHeader icon={<IconBuilding size={14} />} label="Company Info" color="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" />

          <div className="grid grid-cols-1 gap-3">
            <Field label="Company Name *" value={businessName} onChange={setBusinessName} placeholder="Your company name" maxLength={255} />
            <Field label="Contact Person *" value={contactName} onChange={setContactName} placeholder="Full name" maxLength={255} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" maxLength={20} type="tel" />
              {/* Industry Dropdown */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
            <Field label="Email" value={email} disabled placeholder="" onChange={() => {}} note="Email cannot be changed" />
          </div>
        </div>

        {/* Brand Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 p-4 space-y-4">
          <SectionHeader icon={<IconTag size={14} />} label="Brand Identity" color="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={120}
              placeholder="e.g. Empowering events with AI"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{tagline.length}/120</p>
          </div>

          {/* Logo Upload */}
          <ImageUpload
            label="Logo"
            hint="Upload your company logo (max 5MB)"
            value={logoUrl}
            onChange={setLogoUrl}
            uploadOptions={{ folder: 'vendors/logo', fileName: 'logo' }}
            compact
          />

          <Field label="Website" value={website} onChange={setWebsite} placeholder="https://yourcompany.com" type="url" />

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Brief description of your business..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{description.length}/500</p>
          </div>
        </div>

        {/* Social Links — Collapsible */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowSocials(!showSocials)}
            className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <IconLink size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Social Links</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {Object.values(socialLinks).filter(v => v.trim()).length} connected
                </p>
              </div>
            </div>
            <IconChevronDown size={16} className={cn('text-slate-400 transition-transform', showSocials && 'rotate-180')} />
          </button>
          {showSocials && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-3">
              {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Icon size={18} className={color} />
                  </div>
                  <input
                    type="url"
                    value={socialLinks[key] ?? ''}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    placeholder={`${label} URL`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                  {socialLinks[key]?.trim() && (
                    <a
                      href={socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                    >
                      <IconExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products & Services — Collapsible */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <IconBriefcase size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Products & Services</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {products.filter(p => p.name.trim()).length} items · Optional
                </p>
              </div>
            </div>
            <IconChevronDown size={16} className={cn('text-slate-400 transition-transform', showProducts && 'rotate-180')} />
          </button>
          {showProducts && (
            <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-800 pt-3">
              {products.length === 0 ? (
                <button
                  onClick={addProduct}
                  className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center gap-2 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <IconPlus size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Add your first product or service</span>
                </button>
              ) : (
                <div className="space-y-2.5">
                  {products.map((product, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                      <div className="w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">{idx + 1}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                          placeholder="Product or service name"
                          maxLength={100}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                        <input
                          type="text"
                          value={product.description ?? ''}
                          onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                          placeholder="Short description (optional)"
                          maxLength={200}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                      </div>
                      <button
                        onClick={() => removeProduct(idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 mt-0.5"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addProduct}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                  >
                    <IconPlus size={13} />
                    Add another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="bg-brand-50 dark:bg-brand-950/30 rounded-2xl p-4 border border-brand-100 dark:border-brand-900/50">
          <p className="text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
            <strong>Tip:</strong> Cards with a tagline, logo, and at least one social link get <strong>3x more follow-ups</strong> from attendees.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Collapsible Section ─────────────────────────────────────────────────── */

function CollapsibleSection({
  icon, label, subtitle, color, isOpen, onToggle, children,
}: {
  icon: React.ReactNode; label: string; subtitle: string
  color: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-none border border-slate-100/50 dark:border-slate-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}>{icon}</div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>
          </div>
        </div>
        <IconChevronDown size={16} className={cn('text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-800 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Reusable field ─────────────────────────────────────────────────────── */

function Field({
  label, value, onChange, placeholder, maxLength, type = 'text', disabled = false, note,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
  maxLength?: number; type?: string; disabled?: boolean; note?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(
          'w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          disabled
            ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400',
        )}
      />
      {note && <p className="text-[10px] text-slate-400 mt-1">{note}</p>}
    </div>
  )
}

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}>{icon}</div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{label}</h2>
    </div>
  )
}
