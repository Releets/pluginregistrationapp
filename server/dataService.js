import { readFileSync, writeFileSync } from 'fs'

const timestamp = () => new Date().toISOString()
const DATA_FILE = './data/data.json'

function isEqual(a, b) {
  return a.username === b.username && a.entrytime === b.entrytime
}

export function loadData() {
  try {
    const rawData = readFileSync(DATA_FILE)
    return JSON.parse(rawData)
  } catch (err) {
    console.log(timestamp(), 'Initializing data file')
    writeFileSync(DATA_FILE, '[]', { flag: 'w' })
    return []
  }
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
}

export function enterQueue(user) {
  const data = loadData()
  const queue = data.filter(entry => !entry.queueExitTime)

  if (queue.length >= 5) throw new Error('Køen er full')
  if (queue.length === 0) user = { ...user, entrytime: Date.now() }

  data.push(user)

  saveData(data)
  console.log(timestamp(), 'Added ' + user.username + ' to queue')
  return data
}

export function exitQueue(toRemove, privateKey, force = false) {
  const data = loadData()
  const queue = data.filter(entry => !entry.queueExitTime)

  // Get the index of the user to remove
  const i = data.findIndex(entry => isEqual(entry, toRemove))
  if (i === null) throw new Error(`Brukeren '${toRemove.username}' ble ikke funnet i køen`)

  const item = data[i]

  if (!force && item.queueExitTime) throw new Error(`Brukeren '${toRemove.username}' er ikke i køen lenger`)
  if (!force && item.privateKey !== privateKey) throw new Error('Du kan bare slette deg selv fra køen')

  const isFirst = queue.length > 0 && isEqual(queue[0], toRemove)
  const hasNext = queue.length > 1

  if (!isFirst) {
    // If the user is not first in queue, just remove them
    data.splice(i, 1)
    saveData(data)
    return data
  }

  // Set the exit time of the user
  data[i] = { ...item, queueExitTime: Date.now() }

  if (isFirst && hasNext) {
    // Update the estimated finish time of the next person in queue
    const next = data[i + 1]
    data[i + 1] = { ...next, entrytime: Date.now() }
  }

  saveData(data)
  console.log(new Date(data[i].queueExitTime).toISOString(), 'Removed ' + toRemove.username + ' from queue')
  return data
}

export function removeOldEntries() {
  const data = loadData()
  const queue = data.filter(entry => !entry.queueExitTime)

  const currentTime = new Date(Date.now())

  queue.forEach(entry => {
    const kickTime = new Date(entry.entrytime + entry.estimated * 60 * 60 * 1000)
    if (kickTime < currentTime) {
      try {
        exitQueue(entry, undefined, true)
      } catch (err) {
        console.error(timestamp(), err.message)
      }
    }
  })

  return loadData()
}
