import { defaultSettings, type UserSettings } from '../../../models/UserSettings'
import { detectPreferredLocale } from './detectPreferredLocale'

const STORAGE_KEY = 'userSettings'

/** Merge stored JSON with defaults and apply language fallback for older saves without `language`. */
export function normalizeUserSettings(parsed: Partial<UserSettings>): UserSettings {
  return {
    ...defaultSettings,
    ...parsed,
    language: parsed.language ?? detectPreferredLocale(),
  }
}

export function loadUserSettingsFromStorage(): UserSettings | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    return normalizeUserSettings(JSON.parse(stored) as Partial<UserSettings>)
  } catch {
    return null
  }
}

export function saveUserSettingsToStorage(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
