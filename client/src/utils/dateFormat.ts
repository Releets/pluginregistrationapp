/**
 * Format UTC timestamps (ms since epoch) in the client's local timezone.
 * Backend sends/stores all dates as UTC; these helpers display in user TZ.
 */

import { intlLocaleTag, type LanguageCode } from '../locales'

const timeFormatters = new Map<string, Intl.DateTimeFormat>()
const datePartFormatters = new Map<string, Intl.DateTimeFormat>()

function timeFormatterFor(intlLocale: string): Intl.DateTimeFormat {
  let f = timeFormatters.get(intlLocale)
  if (!f) {
    f = new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', minute: '2-digit' })
    timeFormatters.set(intlLocale, f)
  }
  return f
}

function datePartFormatterFor(intlLocale: string): Intl.DateTimeFormat {
  let f = datePartFormatters.get(intlLocale)
  if (!f) {
    f = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short' })
    datePartFormatters.set(intlLocale, f)
  }
  return f
}

/**
 * Format time only (e.g. "14:30") in client timezone for the given app locale.
 */
export function formatTime(utcMs: number, locale: LanguageCode): string {
  const tag = intlLocaleTag(locale)
  return timeFormatterFor(tag).format(new Date(utcMs))
}

/**
 * Format date and time in client timezone for the given app locale.
 */
export function formatDateTime(utcMs: number, locale: LanguageCode): string {
  const tag = intlLocaleTag(locale)
  const d = new Date(utcMs)
  const datePart = datePartFormatterFor(tag).format(d)
  const timePart = timeFormatterFor(tag).format(d)
  return `${datePart} | ${timePart}`
}
