import type { Language } from './en'
import { language as en } from './en'
import { language as nl } from './nl'
import { language as no } from './no'
import type { AppLocale } from '../../../models/UserSettings'

export type { Language } from './en'
export type { AppLocale } from '../../../models/UserSettings'

export const languages: Record<AppLocale, Language> = {
  en,
  no,
  nl,
}
