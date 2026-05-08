'use client'

import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { motion, AnimatePresence } from 'framer-motion'
import { IconPalette, IconDroplet, IconColorSwatch } from '@tabler/icons-react'
import type { VendorBranding } from '@/services/vendor.service'

interface ColorSchemeEditorProps {
  colorMode: VendorBranding['color_mode']
  primaryColor: string
  secondaryColor: string | null
  gradientAngle: number
  textColor: VendorBranding['text_color']
  accentColor: string | null
  onChange: (updates: Partial<Pick<VendorBranding, 'color_mode' | 'primary_color' | 'secondary_color' | 'gradient_angle' | 'text_color' | 'accent_color'>>) => void
}

const COLOR_MODES: { id: VendorBranding['color_mode']; label: string; icon: typeof IconPalette }[] = [
  { id: 'solid', label: 'Solid', icon: IconDroplet },
  { id: 'two-tone', label: 'Two-Tone', icon: IconColorSwatch },
  { id: 'gradient', label: 'Gradient', icon: IconPalette },
]

const PRESET_COLORS = [
  '#1e40af', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#0891b2', '#4f46e5', '#be185d', '#0f766e',
  '#6d28d9', '#1d4ed8',
]

const GRADIENT_PRESETS: { name: string; from: string; to: string; angle: number }[] = [
  { name: 'Sunset', from: '#f97316', to: '#ec4899', angle: 135 },
  { name: 'Ocean', from: '#0ea5e9', to: '#6366f1', angle: 135 },
  { name: 'Forest', from: '#16a34a', to: '#0891b2', angle: 135 },
  { name: 'Royal', from: '#7c3aed', to: '#1e40af', angle: 135 },
  { name: 'Coral', from: '#f43f5e', to: '#fb923c', angle: 135 },
  { name: 'Midnight', from: '#1e293b', to: '#4f46e5', angle: 135 },
]

export default function ColorSchemeEditor({
  colorMode, primaryColor, secondaryColor, gradientAngle, textColor, accentColor, onChange,
}: ColorSchemeEditorProps) {
  const [activePickerTarget, setActivePickerTarget] = useState<'primary' | 'secondary' | 'accent' | null>(null)

  const activeColor = activePickerTarget === 'primary' ? primaryColor
    : activePickerTarget === 'secondary' ? (secondaryColor || '#7c3aed')
    : activePickerTarget === 'accent' ? (accentColor || '#f43f5e')
    : primaryColor

  const handlePickerChange = (color: string) => {
    if (activePickerTarget === 'primary') onChange({ primary_color: color })
    else if (activePickerTarget === 'secondary') onChange({ secondary_color: color })
    else if (activePickerTarget === 'accent') onChange({ accent_color: color })
  }

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700/50 p-1">
        {COLOR_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange({ color_mode: mode.id })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              colorMode === mode.id
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <mode.icon size={14} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Color Targets */}
      <div className="flex gap-3">
        {/* Primary */}
        <button
          type="button"
          onClick={() => setActivePickerTarget(activePickerTarget === 'primary' ? null : 'primary')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
            activePickerTarget === 'primary' ? 'border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-600'
          }`}
        >
          <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: primaryColor }} />
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Primary</span>
        </button>

        {/* Secondary (two-tone / gradient) */}
        {(colorMode === 'two-tone' || colorMode === 'gradient') && (
          <button
            type="button"
            onClick={() => setActivePickerTarget(activePickerTarget === 'secondary' ? null : 'secondary')}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
              activePickerTarget === 'secondary' ? 'border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-600'
            }`}
          >
            <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: secondaryColor || '#7c3aed' }} />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Secondary</span>
          </button>
        )}

        {/* Accent */}
        <button
          type="button"
          onClick={() => setActivePickerTarget(activePickerTarget === 'accent' ? null : 'accent')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
            activePickerTarget === 'accent' ? 'border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-600'
          }`}
        >
          <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: accentColor || '#64748b' }} />
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Accent</span>
        </button>

        {/* Preview strip */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-10 rounded-lg overflow-hidden shadow-inner"
            style={{
              background: colorMode === 'solid'
                ? primaryColor
                : colorMode === 'two-tone'
                ? `linear-gradient(${gradientAngle}deg, ${primaryColor} 50%, ${secondaryColor || '#7c3aed'} 50%)`
                : `linear-gradient(${gradientAngle}deg, ${primaryColor}, ${secondaryColor || '#7c3aed'})`,
            }}
          />
        </div>
      </div>

      {/* Color Picker */}
      <AnimatePresence>
        {activePickerTarget && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 space-y-3">
              <HexColorPicker color={activeColor} onChange={handlePickerChange} style={{ width: '100%', height: 160 }} />

              {/* Hex input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">#</span>
                <input
                  type="text"
                  value={activeColor.replace('#', '')}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                    if (v.length === 6) handlePickerChange(`#${v}`)
                  }}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  maxLength={6}
                />
              </div>

              {/* Preset swatches */}
              <div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Quick picks</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handlePickerChange(color)}
                      className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${activeColor === color ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Presets (only when gradient mode) */}
      {colorMode === 'gradient' && (
        <div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Gradient Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange({
                  primary_color: preset.from,
                  secondary_color: preset.to,
                  gradient_angle: preset.angle,
                })}
                className="group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400 transition-all hover:scale-105"
              >
                <div className="h-8 w-full" style={{ background: `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})` }} />
                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 py-1 text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gradient Angle (two-tone / gradient) */}
      {(colorMode === 'two-tone' || colorMode === 'gradient') && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Angle</p>
            <span className="text-xs text-slate-500 font-mono">{gradientAngle}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={15}
            value={gradientAngle}
            onChange={(e) => onChange({ gradient_angle: Number(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor || '#7c3aed'})`,
            }}
          />
          {/* Quick angle buttons */}
          <div className="flex gap-1 mt-1.5">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onChange({ gradient_angle: angle })}
                className={`flex-1 py-1 text-[10px] rounded transition-all ${
                  gradientAngle === angle
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Color */}
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Header Text</p>
        <div className="flex gap-2">
          {(['light', 'dark', 'auto'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ text_color: mode })}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                textColor === mode
                  ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {mode === 'light' ? '☀️ Light' : mode === 'dark' ? '🌑 Dark' : '🔄 Auto'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
