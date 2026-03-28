import { createContext, useMemo, type ReactNode } from 'react'
import type { AppLocale } from '../../../models/UserSettings'
import type { Language } from '../locales/en'

export type LanguageContextValue = {
  locale: AppLocale
  t: Language
  setLocale: (next: AppLocale) => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export type LanguageProviderProps = {
  children: ReactNode
  locale: AppLocale
  t: Language
  setLocale: (next: AppLocale) => void
}

export function LanguageProvider({ children, locale, t, setLocale }: Readonly<LanguageProviderProps>) {
  const context = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale])
  return <LanguageContext.Provider value={context}>{children}</LanguageContext.Provider>
}
