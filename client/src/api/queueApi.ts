import axios, { AxiosError } from 'axios'
import io, { type Socket } from 'socket.io-client'
import type { QueueEntry } from '../../../models/QueueEntry'
import { timestamp } from '../utils/logger'

let socketInstance: Socket | null = null

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
    socketInstance = io(adr, { transports: ['websocket'] })
  }
  return socketInstance
}

export async function addToQueue(queueEntry: QueueEntry): Promise<void> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  console.log(timestamp(), 'Adding ' + queueEntry.username + ' to queue')
  try {
    await axios.post(adr + '/add', { value: queueEntry })
  } catch (e) {
    console.warn(timestamp(), e)
    const message = e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'data' in e.response ? (e.response as { data: unknown }).data : 'Request failed'
    alert(message)
  }
}

export async function registerIdentity(): Promise<{ userId: string; privateKey: string }> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  try {
    const res = await axios.post(adr + '/register')
    const { userId, privateKey } = res.data as { userId: string; privateKey: string }
    if (typeof userId !== 'string' || typeof privateKey !== 'string') throw new Error('Invalid register response')
    return { userId, privateKey }
  } catch (e) {
    console.warn(timestamp(), e)
    throw e
  }
}

export async function removeFromQueue(
  user: QueueEntry,
  privateKey: string,
  godmodePassword: string
): Promise<void> {
  ensureAxiosBaseUrl()
  const adr = getBackendUrl()
  console.log(timestamp(), 'Removing ' + user.username + ' from queue')
  try {
    await axios.post(adr + '/remove', {
      value: user,
      privateKey,
      godmodePassword,
    })
  } catch (e) {
    if (!(e instanceof AxiosError)) throw e
    console.warn(timestamp(), e)
    alert(e.response?.data)
  }
}
