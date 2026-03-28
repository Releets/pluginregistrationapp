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
