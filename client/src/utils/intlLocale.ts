import type { AppLocale } from '../../../models/UserSettings'

/** BCP 47 tag for Intl APIs and document.documentElement.lang */
export function intlLocaleTag(locale: AppLocale): string {
  switch (locale) {
    case 'en':
      return 'en'
    case 'no':
      return 'nb-NO'
    case 'nl':
      return 'nl-NL'
    default:
      return 'en'
  }
}
