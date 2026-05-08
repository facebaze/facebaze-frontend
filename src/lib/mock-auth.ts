/**
 * Mock Auth — Static accounts for local development.
 * Bypasses Supabase + backend API entirely.
 * Enable by setting NEXT_PUBLIC_MOCK_AUTH=true in .env.local
 */

import type { User } from '@/types'

export const MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export interface MockAccount {
  email: string
  password: string
  user: User
  label: string
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'customer@facebase.dev',
    password: 'password123',
    label: 'Customer (Attendee)',
    user: {
      id: '00000000-0000-4000-a000-000000000001',
      email: 'customer@facebase.dev',
      role: 'user',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  {
    email: 'vendor@facebase.dev',
    password: 'password123',
    label: 'Vendor',
    user: {
      id: '00000000-0000-4000-a000-000000000002',
      email: 'vendor@facebase.dev',
      role: 'vendor',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  {
    email: 'organiser@facebase.dev',
    password: 'password123',
    label: 'Organiser',
    user: {
      id: '00000000-0000-4000-a000-000000000003',
      email: 'organiser@facebase.dev',
      role: 'organizer',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  {
    email: 'admin@facebase.dev',
    password: 'password123',
    label: 'Admin',
    user: {
      id: '00000000-0000-4000-a000-000000000004',
      email: 'admin@facebase.dev',
      role: 'admin',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  {
    email: 'superadmin@facebase.dev',
    password: 'password123',
    label: 'Super Admin',
    user: {
      id: '00000000-0000-4000-a000-000000000005',
      email: 'superadmin@facebase.dev',
      role: 'super_admin',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
]

/**
 * Attempt mock login — returns user if credentials match, null otherwise.
 */
export function mockLogin(email: string, password: string): User | null {
  const account = MOCK_ACCOUNTS.find(
    (a) => a.email === email && a.password === password,
  )
  return account?.user ?? null
}

/**
 * Direct mock login by role — skips password check.
 */
export function mockLoginByRole(role: User['role']): User {
  const account = MOCK_ACCOUNTS.find((a) => a.user.role === role)!
  return account.user
}
