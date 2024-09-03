export function formatDate(date = Date.now()) {
  date = new Date(date)
  return (
    date.getDate() +
    ' ' +
    date.toLocaleString('default', { month: 'short' }) +
    ' | ' +
    date.getHours() +
    ':' +
    String(date.getMinutes()).padStart(2, '0')
  )
}
