import type { Language } from './en'
import { language as en } from './en'
import { language as nl } from './nl'
import { language as no } from './no'
import type { AppLocale } from '../../../models/UserSettings'
import type { LocaleMetadata } from './types'

export type { Language } from './en'
export type { AppLocale } from '../../../models/UserSettings'
export type { LocaleMetadata } from './types'

export const languages: Record<AppLocale, Language> = {
  en,
  no,
  nl,
}

/** Built from each locale file’s `language.metadata`. */
export const localeMetadataByLocale: Record<AppLocale, LocaleMetadata> = {
  en: en.metadata,
  no: no.metadata,
  nl: nl.metadata,
}
