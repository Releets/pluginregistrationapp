import cors from 'cors'
import express, { Express, json, Request, Response } from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { register } from './authService.ts'
import { enterQueue, exitQueue, loadData, removeOldEntries } from './dataService.ts'
import { getUptimeSummary, pruneUptimeLogs, recordUptimeHeartbeat } from './uptimeService.ts'
import process from 'node:process'
import { QueueEntry } from '../models/QueueEntry.ts'

const correctGodmodePassword = process.env.GODMODE
if (!correctGodmodePassword) throw new Error('GODMODE environment variable not set')

type TabConfig = {
  id: string
  label: string
}

function parseTabsEnv(rawTabs: string | undefined): TabConfig[] {
  if (!rawTabs) throw new Error('TABS environment variable not set')

  const tabMap = new Map<string, TabConfig>()
  for (const rawLabel of rawTabs.split(',')) {
    const label = rawLabel.trim()
    if (!label) continue
    const id = label.toLowerCase()
    if (!tabMap.has(id)) {
      tabMap.set(id, { id, label })
    }
  }

  const tabs = Array.from(tabMap.values())
  if (tabs.length === 0) throw new Error('TABS environment variable does not contain any valid tab labels')
  return tabs
}

const tabs = parseTabsEnv(process.env.TABS)
const tabIds = new Set(tabs.map(tab => tab.id))

function normalizeTabId(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const tabId = input.trim().toLowerCase()
  return tabIds.has(tabId) ? tabId : null
}

function getTabIdFromBody(req: Request): string {
  const tabId = normalizeTabId(req.body?.tab)
  if (!tabId) throw new Error('Missing or invalid tab')
  return tabId
}

const app: Express = express()
const server = createServer(app)
const io = new Server(server)

const port = 6969

app.use(cors())
app.use(json())
app.options('*', cors()) // Enable pre-flight across-the-board

const timestamp = () => new Date().toISOString()

app.get('/tabs', (_req: Request, res: Response) => {
  res.status(200).json(tabs)
})

app.get('/uptime', (_req: Request, res: Response) => {
  try {
    pruneUptimeLogs()
    res.status(200).json(getUptimeSummary())
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error reading uptime data:', err.message)
    res.status(500).send(err.message)
  }
})

// API to register a new user (returns userId + privateKey for client to store)
app.post('/register', (_req: Request, res: Response) => {
  try {
    const { userId, privateKey } = register()
    res.status(200).json({ userId, privateKey })
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error registering:', err.message)
    res.status(500).send(err.message)
  }
})

// API to append the queue
app.post('/add', (req: Request, res: Response) => {
  try {
    const tabId = getTabIdFromBody(req)
    const updatedQueue = enterQueue(tabId, req.body.value as QueueEntry)
    io.to(tabId).emit('stateUpdate', updatedQueue) // Broadcast only within tab room
    res.sendStatus(200)
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error adding to queue:', err.message)
    res.status(500).send(err.message)
  }
})

// API to remove from the queue
app.post('/remove', (req: Request, res: Response) => {
  try {
    const tabId = getTabIdFromBody(req)
    const { value, privateKey, godmodePassword } = req.body
    console.debug(timestamp(), 'Received remove request:', req.body)

    const updatedQueue = exitQueue(tabId, value as QueueEntry, privateKey, godmodePassword === correctGodmodePassword)
    io.to(tabId).emit('stateUpdate', updatedQueue) // Broadcast only within tab room
    res.sendStatus(200)
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error removing from queue:', err.message)
    res.status(500).send(err.message)
  }
})

io.on('connection', socket => {
  console.debug(timestamp(), 'Connected', socket.id)
  let activeTabId: string | null = null

  const switchTab = (rawTabId: unknown) => {
    const tabId = normalizeTabId(rawTabId)
    if (!tabId) {
      socket.emit('error', 'Missing or invalid tab')
      return
    }
    if (activeTabId === tabId) return

    if (activeTabId) {
      socket.leave(activeTabId)
    }
    activeTabId = tabId
    socket.join(tabId)
    socket.emit('stateUpdate', loadData(tabId)) // Send tab state to socket after room switch
  }

  // Keep compatibility with older clients that still pass `tab` on handshake.
  switchTab(socket.handshake.query.tab)

  socket.on('switchTab', switchTab)

  socket.on('disconnect', () => {
    console.debug(timestamp(), 'Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log(timestamp(), 'Server is running on port', port)

  // Heartbeat for uptime monitoring.
  recordUptimeHeartbeat()
  setInterval(() => {
    recordUptimeHeartbeat()
  }, 1000 * 60 * 60)

  // Throwing people out of queue every minute
  setInterval(() => {
    console.debug(timestamp(), 'Checking for old entries')

    let didRemoveAny = false
    for (const tab of tabs) {
      const newState = removeOldEntries(tab.id)
      if (!newState) continue
      didRemoveAny = true
      console.debug(timestamp(), `Removed entries, broadcasting new state for tab '${tab.id}'`)
      io.to(tab.id).emit('stateUpdate', newState)
    }

    if (!didRemoveAny) {
      console.debug(timestamp(), 'No entries were removed')
    }
  }, 1000 * 60)
})
