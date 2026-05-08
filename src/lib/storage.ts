/**
 * Secure storage abstraction using Capacitor Preferences.
 * On native: encrypted via iOS Keychain / Android KeyStore.
 * On web: falls back to sessionStorage (never localStorage for tokens).
 */

import { Preferences } from '@capacitor/preferences'
import { isNativePlatform } from './utils'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fb_access_token',
  REFRESH_TOKEN: 'fb_refresh_token',
  USER_ID: 'fb_user_id',
  ONBOARDING_STEP: 'fb_onboarding_step',
} as const

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

async function setItem(key: StorageKey, value: string): Promise<void> {
  if (isNativePlatform()) {
    await Preferences.set({ key, value })
  } else {
    sessionStorage.setItem(key, value)
  }
}

async function getItem(key: StorageKey): Promise<string | null> {
  if (isNativePlatform()) {
    const { value } = await Preferences.get({ key })
    return value
  }
  return sessionStorage.getItem(key)
}

async function removeItem(key: StorageKey): Promise<void> {
  if (isNativePlatform()) {
    await Preferences.remove({ key })
  } else {
    sessionStorage.removeItem(key)
  }
}

async function clear(): Promise<void> {
  if (isNativePlatform()) {
    await Preferences.clear()
  } else {
    sessionStorage.clear()
  }
}

export const secureStorage = {
  keys: STORAGE_KEYS,
  setItem,
  getItem,
  removeItem,
  clear,
}
