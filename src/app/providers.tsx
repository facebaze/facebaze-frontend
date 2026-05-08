'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useSocketStore } from '@/stores/socket.store'
import { useThemeStore } from '@/stores/theme.store'
import { Toaster } from '@/components/ui'

// Single QueryClient instance — optimized for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min — reduce unnecessary refetches
      gcTime: 30 * 60 * 1000,           // 30 min garbage collection
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,       // Mobile: no window focus events
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const initialize = useAuthStore((s) => s.initialize)
  const initOnboarding = useOnboardingStore((s) => s.initialize)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const connectSocket = useSocketStore((s) => s.connect)
  const disconnectSocket = useSocketStore((s) => s.disconnect)
  const initTheme = useThemeStore((s) => s.initialize)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initialize()
      initOnboarding()
      initTheme()
    }
  }, [initialize, initOnboarding, initTheme])

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated, connectSocket, disconnectSocket])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
