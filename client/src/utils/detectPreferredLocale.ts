import type { AppLocale } from '../../../models/UserSettings'

function normalizeBrowserLocale(tag: string): string {
  return tag.toLowerCase().replace(/_/g, '-')
}

/**
 * Map browser language preferences to a supported AppLocale (default: English).
 */
export function detectPreferredLocale(): AppLocale {
  const candidates = [
    ...(typeof navigator !== 'undefined' && navigator.languages ? [...navigator.languages] : []),
    typeof navigator === 'undefined' ? '' : navigator.language,
  ].filter(Boolean)

  for (const raw of candidates) {
    const tag = normalizeBrowserLocale(raw)
    const base = tag.split('-')[0] ?? ''
    if (tag.startsWith('nb') || tag.startsWith('nn') || tag === 'no' || base === 'no') {
      return 'no'
    }
    if (tag.startsWith('nl') || base === 'nl') {
      return 'nl'
    }
    if (tag.startsWith('en') || base === 'en') {
      return 'en'
    }
  }
  return 'en'
}
