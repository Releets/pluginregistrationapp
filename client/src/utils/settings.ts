import type { UserSettings } from '../../../models/UserSettings'

const STORAGE_KEY = 'userSettings'

export function loadUserSettingsFromStorage(): UserSettings | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as UserSettings
  } catch {
    return null
  }
}

export function saveUserSettingsToStorage(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
