import type { UserSettings } from '../../../models/UserSettings'
import { defaultSettings } from '../../../models/UserSettings'

const STORAGE_KEY = 'userSettings'

export function loadUserSettingsFromStorage(): UserSettings | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored) as Partial<UserSettings> & { showUptime?: boolean }
    const migratedHideUptime =
      typeof parsed.hideUptime === 'boolean'
        ? parsed.hideUptime
        : typeof parsed.showUptime === 'boolean'
          ? !parsed.showUptime
          : defaultSettings.hideUptime
    return { ...defaultSettings, ...parsed, hideUptime: migratedHideUptime }
  } catch {
    return null
  }
}

export function saveUserSettingsToStorage(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
