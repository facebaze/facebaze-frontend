import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'otp'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  show: (toast: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: ({ duration = 4000, ...rest }) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { id, duration, ...rest }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// ─── Convenience helpers — call from anywhere ────────────────────────────────

export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().show({ type: 'success', title, message, duration: 4000 }),

  error: (title: string, message?: string) =>
    useToastStore.getState().show({ type: 'error', title, message, duration: 5000 }),

  info: (title: string, message?: string) =>
    useToastStore.getState().show({ type: 'info', title, message, duration: 4000 }),

  /**
   * Special OTP toast — displays large digits + copy button.
   * Stays visible for 30s so the user has time to read and type it.
   */
  otp: (otp: string) =>
    useToastStore.getState().show({
      type: 'otp',
      title: 'Dev OTP Code',
      message: otp,
      duration: 30000,
    }),
}
