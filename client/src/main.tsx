import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'
import { languages } from './locales'
import type { AppLocale, UserSettings } from '../../models/UserSettings'
import { defaultSettings } from '../../models/UserSettings'
import { detectPreferredLocale } from './utils/detectPreferredLocale'
import { loadUserSettingsFromStorage, saveUserSettingsToStorage } from './utils/settings'
import './styles/main.css'

function getInitialAppSettings(): UserSettings {
  const stored = loadUserSettingsFromStorage()
  if (stored) return stored
  return { ...defaultSettings, language: detectPreferredLocale() }
}

export function Root() {
  const [appSettings, setAppSettings] = useState(getInitialAppSettings)
  const t = languages[appSettings.language]
  const setLocale = useCallback((next: AppLocale) => {
    setAppSettings(prev => {
      const newSettings = { ...prev, language: next }
      saveUserSettingsToStorage(newSettings)
      return newSettings
    })
  }, [])

  return (
    <LanguageProvider locale={appSettings.language} t={t} setLocale={setLocale}>
      <App appSettings={appSettings} setAppSettings={setAppSettings} />
    </LanguageProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
