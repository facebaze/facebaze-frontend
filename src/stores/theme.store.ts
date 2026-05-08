/**
 * Theme Store — Manages dark/light mode with auto-scheduling.
 * Modes: 'light' | 'dark' | 'auto'
 * Auto mode switches based on time: dark from 7PM to 6AM.
 */

import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  initialize: () => void
}

const STORAGE_KEY = 'facebase-theme'
const NIGHT_START = 19 // 7 PM
const NIGHT_END = 6   // 6 AM

function getAutoTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return (hour >= NIGHT_START || hour < NIGHT_END) ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') return getAutoTheme()
  return mode
}

function applyThemeToDOM(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'auto',
  resolvedTheme: 'light',

  setMode: (mode) => {
    const resolved = resolveTheme(mode)
    applyThemeToDOM(resolved)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {}
    set({ mode, resolvedTheme: resolved })
  },

  initialize: () => {
    let mode: ThemeMode = 'auto'
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        mode = stored
      }
    } catch {}

    const resolved = resolveTheme(mode)
    applyThemeToDOM(resolved)
    set({ mode, resolvedTheme: resolved })

    // If auto mode, check every minute for time-based switches
    if (mode === 'auto') {
      const interval = setInterval(() => {
        const current = get()
        if (current.mode === 'auto') {
          const newResolved = getAutoTheme()
          if (newResolved !== current.resolvedTheme) {
            applyThemeToDOM(newResolved)
            set({ resolvedTheme: newResolved })
          }
        }
      }, 60_000)

      // Cleanup on page unload
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => clearInterval(interval), { once: true })
      }
    }
  },
}))
