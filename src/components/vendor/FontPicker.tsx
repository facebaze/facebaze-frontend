'use client'

import { useEffect, useState } from 'react'
import { IconCheck } from '@tabler/icons-react'

interface FontPickerProps {
  value: string
  headingFont: string | null
  onChange: (font: string) => void
  onHeadingFontChange: (font: string | null) => void
}

interface FontOption {
  name: string
  category: 'sans-serif' | 'serif' | 'display' | 'monospace'
  weights: string
}

const FONTS: FontOption[] = [
  // Sans-serif
  { name: 'Inter', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Poppins', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Montserrat', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Raleway', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Open Sans', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Nunito', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: '400;500;600;700' },
  { name: 'DM Sans', category: 'sans-serif', weights: '400;500;600;700' },
  // Serif
  { name: 'Playfair Display', category: 'serif', weights: '400;500;600;700' },
  { name: 'Merriweather', category: 'serif', weights: '400;700' },
  { name: 'Lora', category: 'serif', weights: '400;500;600;700' },
  { name: 'Crimson Text', category: 'serif', weights: '400;600;700' },
  // Display
  { name: 'Bebas Neue', category: 'display', weights: '400' },
  { name: 'Oswald', category: 'display', weights: '400;500;600;700' },
  { name: 'Righteous', category: 'display', weights: '400' },
  { name: 'Archivo Black', category: 'display', weights: '400' },
  // Monospace
  { name: 'JetBrains Mono', category: 'monospace', weights: '400;500;600;700' },
  { name: 'Fira Code', category: 'monospace', weights: '400;500;600;700' },
]

const CATEGORIES = [
  { id: 'sans-serif', label: 'Sans-Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'monospace', label: 'Mono' },
] as const

// Load fonts for preview
function useFontPreviewLoader() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (loaded) return
    const families = FONTS.map(f => `family=${encodeURIComponent(f.name)}:wght@${f.weights}`).join('&')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`
    link.id = 'font-picker-preview'
    if (!document.getElementById('font-picker-preview')) {
      document.head.appendChild(link)
    }
    setLoaded(true)
  }, [loaded])
}

export default function FontPicker({ value, headingFont, onChange, onHeadingFontChange }: FontPickerProps) {
  useFontPreviewLoader()
  const [useHeadingFont, setUseHeadingFont] = useState(!!headingFont)
  const [filter, setFilter] = useState<string | null>(null)

  const filteredFonts = filter ? FONTS.filter(f => f.category === filter) : FONTS

  return (
    <div className="space-y-4">
      {/* Body font selection */}
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Body Font</p>

        {/* Category filter */}
        <div className="flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
              !filter ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                filter === cat.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Font grid */}
        <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
          {filteredFonts.map((font) => {
            const isSelected = value === font.name
            return (
              <button
                key={font.name}
                type="button"
                onClick={() => onChange(font.name)}
                className={`relative text-left px-3 py-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-700'
                    : 'border-slate-150 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5">
                    <IconCheck size={10} className="text-green-500" />
                  </div>
                )}
                <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontFamily: `'${font.name}', ${font.category}` }}>
                  {font.name}
                </p>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">{font.category}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-center">
        <p className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: `'${headingFont || value}', sans-serif` }}>
          Your Company Name
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: `'${value}', sans-serif` }}>
          This is how your body text will look
        </p>
      </div>

      {/* Separate heading font toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useHeadingFont}
            onChange={(e) => {
              setUseHeadingFont(e.target.checked)
              if (!e.target.checked) onHeadingFontChange(null)
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
          />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Use different heading font</span>
        </label>

        {useHeadingFont && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {FONTS.filter(f => f.category === 'serif' || f.category === 'display').map((font) => {
              const isSelected = headingFont === font.name
              return (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => onHeadingFontChange(font.name)}
                  className={`text-left px-3 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-700'
                      : 'border-slate-150 dark:border-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontFamily: `'${font.name}', ${font.category}` }}>
                    {font.name}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
