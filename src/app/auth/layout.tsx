'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Auth layout — centered content, no navigation.
 * Redirects to onboarding/home if already authenticated.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isInitialized, router])

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-200/40 via-transparent to-transparent dark:from-brand-900/20" />
      <div className="relative flex-1 flex flex-col overflow-y-auto">{children}</div>
    </main>
  )
}
