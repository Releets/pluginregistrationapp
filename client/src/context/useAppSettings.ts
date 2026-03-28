import { useContext } from 'react'
import { AppSettingsContext, AppSettingsContextValue } from './AppSettingsContext'

export default function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }
  return ctx
}
