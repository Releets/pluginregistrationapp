import axios, { AxiosError } from 'axios'
import io, { type Socket } from 'socket.io-client'
import type { QueueEntry } from '../../../models/QueueEntry'
import { timestamp } from '../utils/logger'

export type TabConfig = {
  id: string
  label: string
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

export function getSocket(tabId: string): Socket {
  ensureAxiosBaseUrl()
  if (!socketInstance || socketTabId !== tabId) {
    socketInstance?.disconnect()
    const adr = getBackendUrl()
    socketInstance = io(adr, { transports: ['websocket'], query: { tab: tabId } })
    socketTabId = tabId
  }
  return socketInstance
}

export async function getTabs(): Promise<TabConfig[]> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  const response = await axios.get<TabConfig[]>(adr + '/tabs')
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
    const message = e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'data' in e.response ? (e.response as { data: unknown }).data : 'Request failed'
    alert(message)
  }
}

export async function removeFromQueue(
  user: QueueEntry,
  privateKey: string,
  godmodePassword: string,
  tab: string
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
    alert(e.response?.data)
  }
}
