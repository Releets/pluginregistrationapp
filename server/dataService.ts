import { readFileSync, writeFileSync } from 'node:fs'
import { isCurrent, isExited, isPending, isSame, QueueEntry } from '../models/QueueEntry.ts'

/** All stored timestamps (entered, exited) are UTC milliseconds since epoch. */
const timestamp = () => new Date().toISOString()
const DATA_FILE = '../data/data.json'

function nowUtcMs(): number {
  return Date.now()
}

export function loadData(): QueueEntry[] {
  try {
    const rawData = readFileSync(DATA_FILE)
    return JSON.parse(rawData.toString())
  } catch (_) {
    console.log(timestamp(), 'Initializing data file')
    writeFileSync(DATA_FILE, '[]', { flag: 'w' })
    return []
  }
}

function saveData(data: QueueEntry[]) {
  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
}

export function enterQueue(entry: QueueEntry) {
  const data = loadData()
  const queue = data.filter(e => !e.exited)

  if (queue.length >= 5) throw new Error('Køen er full')
  if (queue.length === 0) entry = { ...entry, entered: nowUtcMs() }

  data.push(entry)

  saveData(data)
  console.log(timestamp(), 'Added ' + entry.username + ' to queue')
  return data
}

export function exitQueue(toRemove: QueueEntry, privateKey: string | undefined, force = false) {
  const data = loadData()

  // Get the index of the entry to remove
  const i = data.findIndex(entry => isSame(entry, toRemove) && isPending(entry))
  if (i === null) throw new Error(`Brukeren '${toRemove.username}' ble ikke funnet i køen`)

  let item = data[i]

  console.debug(timestamp(), 'Found item to remove:', item)

  if (!force && item.id !== privateKey) throw new Error('Du kan bare slette deg selv fra køen')

  // Set the exit time of the entry
  item = { ...item, exited: nowUtcMs() }
  data[i] = item
  if (!isExited(item)) throw new Error('Failed to exit queue')

  const indexOfNext = data.slice(i + 1).findIndex(entry => isPending(entry)) + i + 1
  if (!!item.entered && !!indexOfNext) {
    data[indexOfNext] = { ...data[indexOfNext], entered: nowUtcMs() }
    console.debug(timestamp(), 'Updated next item:', data[indexOfNext])
  }

  saveData(data)
  console.log(new Date(item.exited).toISOString(), 'Removed ' + toRemove.username + ' from queue')
  return data
}

export function removeOldEntries() {
  let didKick = false
  loadData().forEach(entry => {
    if (!isCurrent(entry)) return
    const kickTime = entry.entered + entry.estimated * 60 * 60 * 1000
    if (kickTime < nowUtcMs()) {
      try {
        console.debug(timestamp(), 'Auto-kicking', entry.username)
        exitQueue(entry, undefined, true)
        didKick = true
      } catch (err) {
        if (!(err instanceof Error)) throw err
        console.error(timestamp(), err.message)
      }
    }
  })

  return didKick ? loadData() : undefined
}
