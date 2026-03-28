import { createContext, useMemo, useState, type ReactNode } from 'react'
import { defaultSettings, type UserSettings } from '../../../models/UserSettings'

const STORAGE_KEY = 'userSettings'

function retrieveSettings(): UserSettings {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultSettings
  try {
    const settings = JSON.parse(stored) as Partial<UserSettings>
    return { ...defaultSettings, ...settings }
  } catch {
    return defaultSettings
  }
}

function storeSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

type SettingHandler<T extends keyof UserSettings> = {
  value: UserSettings[T]
  set: (value: UserSettings[T]) => void
}

export type AppSettingsContextValue = {
  [K in keyof UserSettings]: SettingHandler<K>
}

export const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

export function AppSettingsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [appSettings, setAppSettings] = useState(retrieveSettings)

  function createSettingHandler<T extends keyof UserSettings>(key: T): SettingHandler<T> {
    return {
      value: appSettings[key],
      set: (value: UserSettings[T]) => {
        setAppSettings(prev => {
          const next = { ...prev, [key]: value }
          storeSettings(next)
          console.debug(`Set '${key}' to:`, value)
          return next
        })
      },
    }
  }

  const context = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(appSettings).map(key => [key, createSettingHandler(key as keyof UserSettings)])
      ) as AppSettingsContextValue,
    [appSettings]
  )

  return <AppSettingsContext.Provider value={context}>{children}</AppSettingsContext.Provider>
}
