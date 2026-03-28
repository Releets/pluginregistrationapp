import { language as en } from './en'
import { language as nl } from './nl'
import { language as no } from './no'

export type { Language } from './en'

export const languages = {
  en,
  no,
  nl,
}

export type LanguageCode = keyof typeof languages

/** BCP 47 tag for Intl APIs from the active app language key. */
export function intlLocaleTag(code: LanguageCode): string {
  const codes = languages[code].metadata.codes
  return codes.find(c => c.includes('-')) ?? codes[0] ?? 'en-US'
}

export const localeMetadataByLocale = {
  en: languages.en.metadata,
  no: languages.no.metadata,
  nl: languages.nl.metadata,
} as const satisfies Record<LanguageCode, (typeof languages)['en']['metadata']>
