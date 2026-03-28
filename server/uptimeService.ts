import { readFileSync, writeFileSync } from 'node:fs'

const UPTIME_FILE = '../data/uptime.json'
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const WINDOW_DAYS = 30
const WINDOW_MS = WINDOW_DAYS * DAY_MS

export type UptimeDayStatus = 'green' | 'yellow' | 'red'

export type UptimeDay = {
  date: string
  expected: number
  actual: number
  status: UptimeDayStatus
}

export type UptimeSummary = {
  uptimePercentage: number
  totalExpected: number
  totalActual: number
  days: UptimeDay[]
}

function timestamp() {
  return new Date().toISOString()
}

function nowMs() {
  return Date.now()
}

function loadRawLogs(): number[] {
  try {
    const raw = readFileSync(UPTIME_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Invalid uptime format')
    return parsed.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry))
  } catch (_) {
    writeFileSync(UPTIME_FILE, '[]', { flag: 'w' })
    return []
  }
}

function saveRawLogs(logs: number[]) {
  writeFileSync(UPTIME_FILE, JSON.stringify(logs), { flag: 'w' })
}

function getWindowStartMs(now = nowMs()) {
  return now - WINDOW_MS
}

function pruneLogs(logs: number[], now = nowMs()): number[] {
  const cutoff = getWindowStartMs(now)
  return logs.filter(log => log >= cutoff && log <= now).sort((a, b) => a - b)
}

function asUtcDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function recordUptimeHeartbeat(now = nowMs()): void {
  const logs = loadRawLogs()
  logs.push(now)
  const pruned = pruneLogs(logs, now)
  saveRawLogs(pruned)
  console.debug(timestamp(), 'Recorded uptime heartbeat')
}

export function pruneUptimeLogs(now = nowMs()): void {
  const pruned = pruneLogs(loadRawLogs(), now)
  saveRawLogs(pruned)
}

export function getUptimeSummary(now = nowMs()): UptimeSummary {
  const logs = pruneLogs(loadRawLogs(), now)

  // Count one successful uptime check per hour slot.
  const slotToTimestamp = new Map<number, number>()
  for (const log of logs) {
    const slot = Math.floor(log / HOUR_MS)
    if (!slotToTimestamp.has(slot)) slotToTimestamp.set(slot, log)
  }

  const days: UptimeDay[] = []
  let totalExpected = 0
  let totalActual = 0

  const currentDayStart = Date.UTC(
    new Date(now).getUTCFullYear(),
    new Date(now).getUTCMonth(),
    new Date(now).getUTCDate()
  )

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset--) {
    const dayStart = currentDayStart - offset * DAY_MS
    const dayEnd = dayStart + DAY_MS
    const date = asUtcDate(dayStart)

    const expected = offset === 0 ? new Date(now).getUTCHours() + 1 : 24

    let actual = 0
    for (const log of slotToTimestamp.values()) {
      if (log >= dayStart && log < dayEnd) actual++
    }
    if (actual > expected) actual = expected

    const status: UptimeDayStatus = actual === 0 ? 'red' : actual === expected ? 'green' : 'yellow'

    days.push({ date, expected, actual, status })
    totalExpected += expected
    totalActual += actual
  }

  const uptimePercentage = totalExpected > 0 ? Number(((totalActual / totalExpected) * 100).toFixed(2)) : 0

  return {
    uptimePercentage,
    totalExpected,
    totalActual,
    days,
  }
}
