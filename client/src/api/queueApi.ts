import axios, { AxiosError } from 'axios'
import io, { type Socket } from 'socket.io-client'
import type { QueueEntry } from '../../../models/QueueEntry'
import { timestamp } from '../utils/logger'

export type TabConfig = {
  id: string
  label: string
}

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

let socketInstance: Socket | null = null
let socketTabId: string | null = null

export function getBackendUrl(): string {
  const adr = import.meta.env.VITE_BACKEND_URL
  if (!adr) throw new Error('VITE_BACKEND_URL environment variable not set')
  return adr
}

function ensureAxiosBaseUrl(): void {
  const adr = getBackendUrl()
  if (!axios.defaults.baseURL) {
    axios.defaults.baseURL = adr
    console.log(timestamp(), 'Connecting to server at', adr)
  }
}

export function getSocket(): Socket {
  ensureAxiosBaseUrl()
  if (!socketInstance) {
    const adr = getBackendUrl()
    // Allow long-polling fallback when websocket upgrades fail (seen in some browsers/dev setups).
    socketInstance = io(adr, { transports: ['polling', 'websocket'] })
    socketInstance.on('connect_error', err => {
      console.warn(timestamp(), 'Socket connection error:', err.message)
    })
  }
  return socketInstance
}

export function switchSocketTab(tabId: string): void {
  const socket = getSocket()
  if (socketTabId === tabId) return
  socket.emit('switchTab', tabId)
  socketTabId = tabId
}

export async function getTabs(): Promise<TabConfig[]> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  const response = await axios.get<TabConfig[]>(adr + '/tabs')
  return response.data
}

export async function getUptimeSummary(): Promise<UptimeSummary> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  const response = await axios.get<UptimeSummary>(adr + '/uptime')
  return response.data
}

export async function addToQueue(queueEntry: QueueEntry, tab: string): Promise<void> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  console.log(timestamp(), `Adding ${queueEntry.username} to queue '${tab}'`)
  try {
    await axios.post(adr + '/add', { value: queueEntry, tab })
  } catch (e) {
    console.warn(timestamp(), e)
    const message =
      e &&
      typeof e === 'object' &&
      'response' in e &&
      e.response &&
      typeof e.response === 'object' &&
      'data' in e.response
        ? String((e.response as { data: unknown }).data)
        : 'Request failed'
    throw new Error(message)
  }
}

export async function registerIdentity(): Promise<{ userId: string; privateKey: string }> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  try {
    const res = await axios.post(adr + '/register')
    const { userId, privateKey } = res.data as { userId: string; privateKey: string }
    if (typeof userId !== 'string' || typeof privateKey !== 'string')
      throw new Error('Invalid register response: ' + JSON.stringify(res.data, null, 2))
    return { userId, privateKey }
  } catch (e) {
    console.warn(timestamp(), e)
    throw e
  }
}

export async function removeFromQueue(
  user: QueueEntry,
  privateKey: string,
  tab: string,
  godmodePassword?: string
): Promise<void> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  console.log(timestamp(), `Removing ${user.username} from queue '${tab}'`)
  try {
    await axios.post(adr + '/remove', {
      value: user,
      privateKey,
      godmodePassword,
      tab,
    })
  } catch (e) {
    if (!(e instanceof AxiosError)) throw e
    console.warn(timestamp(), e)
    const data = e.response?.data
    throw new Error(typeof data === 'string' ? data : 'Request failed')
  }
}
