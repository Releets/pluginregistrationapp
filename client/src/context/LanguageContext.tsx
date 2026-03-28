import { createContext, useEffect, useMemo, type ReactNode } from 'react'
import { Language, LanguageCode, languages } from '../locales'
import useAppSettings from './useAppSettings'

export type LanguageContextValue = Language

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function detectPreferredLocale(): LanguageCode | undefined {
  for (const language of navigator.languages) {
    for (const supportedLanguage of Object.values(languages)) {
      if (supportedLanguage.metadata.codes.includes(language)) {
        return supportedLanguage.metadata.code as LanguageCode
      }
    }
  }
}

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { language: langSetting } = useAppSettings()
  const language = useMemo(() => languages[langSetting.value], [langSetting.value])

  useEffect(
    function updateLanguage() {
      if (langSetting.value) return
      const detected = detectPreferredLocale()
      if (detected) langSetting.set(detected)
    },
    [langSetting]
  )

  useEffect(
    function updateDocumentTitle() {
      document.title = language.main.title
    },
    [language]
  )

  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
}
