import { createContext, useMemo, useState, type ReactNode } from 'react'
import { defaultSettings, type AppSettings } from '../../../models/AppSettings'

const STORAGE_KEY = 'userSettings'

function retrieveSettings(): AppSettings {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultSettings
  try {
    const settings = JSON.parse(stored) as Partial<AppSettings>
    return { ...defaultSettings, ...settings }
  } catch {
    return defaultSettings
  }
}

function storeSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

type SettingHandler<T extends keyof AppSettings> = {
  value: AppSettings[T]
  set: (value: AppSettings[T]) => void
}

export type AppSettingsContextValue = {
  [K in keyof AppSettings]: SettingHandler<K>
}

export const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined)

export function AppSettingsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [appSettings, setAppSettings] = useState(retrieveSettings)

  function createSettingHandler<T extends keyof AppSettings>(key: T): SettingHandler<T> {
    return {
      value: appSettings[key],
      set: (value: AppSettings[T]) => {
        setAppSettings(prev => {
          const next = { ...prev, [key]: value }
          storeSettings(next)
          console.debug(`Set '${String(key)}' to:`, value)
          return next
        })
      },
    }
  }

  const context = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(appSettings).map(key => [key, createSettingHandler(key as keyof AppSettings)])
      ) as AppSettingsContextValue,
    [appSettings]
  )

  return <AppSettingsContext.Provider value={context}>{children}</AppSettingsContext.Provider>
}
