import type { Language } from '../locales/en'

/**
 * Localized "N hour(s)" for queue estimates using Intl.PluralRules and translation strings.
 */
export function formatHourEstimate(n: number, intlLocale: string, t: Language): string {
  const pr = new Intl.PluralRules(intlLocale)
  const cat = pr.select(n)
  const key = cat === 'one' ? 'one' : 'other'
  return t.queueDisplay.hourEstimate[key].replace('{{n}}', String(n))
}
