/**
 * Format UTC timestamps (ms since epoch) in the client's local timezone.
 * Backend sends/stores all dates as UTC; these helpers display in user TZ.
 */

/**
 * Format time only (e.g. "14:30") in client timezone.
 */
export function formatTime(utcMs: number): string {
  return new Date(utcMs).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date and time (e.g. "17. mar | 14:30") in client timezone.
 */
export function formatDateTime(utcMs: number): string {
  const date = new Date(utcMs)
  const datePart = date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart} | ${timePart}`
}
