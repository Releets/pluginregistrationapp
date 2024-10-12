import { readFileSync, writeFileSync } from 'node:fs'
import { isCurrent, isExited, isPending, isSame, QueueEntry } from '../models/QueueEntry.ts'

const timestamp = () => new Date().toISOString()
const DATA_FILE = '../data/data.json'

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
  if (queue.length === 0) entry = { ...entry, entered: Date.now() }

  data.push(entry)

  saveData(data)
  console.log(timestamp(), 'Added ' + entry.username + ' to queue')
  return data
}

export function exitQueue(toRemove: QueueEntry, privateKey: string | undefined, force = false) {
  const data = loadData()
  const queue = data.filter(entry => isPending(entry))

  // Get the index of the user to remove
  const i = data.findIndex(entry => isSame(entry, toRemove))
  if (i === null) throw new Error(`Brukeren '${toRemove.username}' ble ikke funnet i køen`)

  let item = data[i]

  if (!force && item.exited) throw new Error(`Brukeren '${toRemove.username}' er ikke i køen lenger`)
  if (!force && item.id !== privateKey) throw new Error('Du kan bare slette deg selv fra køen')

  // Set the exit time of the user
  item = { ...item, exited: Date.now() }
  data[i] = item
  if (!isExited(item)) throw new Error('Failed to exit queue')

  const hasNext = queue.length > 1

  if (hasNext) {
    // Update the estimated finish time of the next person in queue
    const next = data[i + 1]
    data[i + 1] = { ...next, entered: Date.now() }
  }

  saveData(data)
  console.log(new Date(item.exited).toISOString(), 'Removed ' + toRemove.username + ' from queue')
  return data
}

export function removeOldEntries() {
  loadData()
    .filter(entry => isCurrent(entry))
    .forEach(entry => {
      const kickTime = entry.entered + entry.estimated * 60 * 60 * 1000
      if (kickTime < Date.now()) {
        try {
          console.debug(timestamp(), 'Auto-kicking', entry.username)
          exitQueue(entry, undefined, true)
        } catch (err) {
          if (!(err instanceof Error)) throw err
          console.error(timestamp(), err.message)
        }
      }
    })

  return loadData()
}
