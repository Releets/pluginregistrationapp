import type { UserSettings } from '../../../models/UserSettings'
import { defaultSettings } from '../../../models/UserSettings'

const STORAGE_KEY = 'userSettings'

export function loadUserSettingsFromStorage(): UserSettings | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored) as Partial<UserSettings>
    return { ...defaultSettings, ...parsed }
  } catch {
    return null
  }
}

export function saveUserSettingsToStorage(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
