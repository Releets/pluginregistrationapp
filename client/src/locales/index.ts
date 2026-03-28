import { language as en } from './en'
import { language as nl } from './nl'
import { language as nb } from './nb'

export type { Language } from './en'

export const languages = {
  en,
  nb,
  nl,
}

export type LanguageCode = keyof typeof languages
