import { useContext } from 'react'
import { Language } from '../locales'
import { LanguageContext } from './LanguageContext'

export default function useLanguage(): Language {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within an LanguageProvider')
  }
  return ctx
}
