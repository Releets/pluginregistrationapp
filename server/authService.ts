import { readFileSync, writeFileSync } from 'node:fs'

const timestamp = () => new Date().toISOString()
const AUTH_FILE = '../data/auth.json'

export type AuthStore = Record<string, string> // userId -> privateKey

export function loadAuth(): AuthStore {
  try {
    const raw = readFileSync(AUTH_FILE)
    return JSON.parse(raw.toString()) as AuthStore
  } catch (_) {
    console.log(timestamp(), 'Initializing auth file')
    writeFileSync(AUTH_FILE, '{}', { flag: 'w' })
    return {}
  }
}

function saveAuth(store: AuthStore) {
  writeFileSync(AUTH_FILE, JSON.stringify(store), { flag: 'w' })
}

export function register(): { userId: string; privateKey: string } {
  const userId = crypto.randomUUID()
  const privateKey = crypto.randomUUID()
  const store = loadAuth()
  store[userId] = privateKey
  saveAuth(store)
  console.log(timestamp(), 'Registered new user', userId)
  return { userId, privateKey }
}

/**
 * Returns true if the given privateKey is the stored secret for this userId.
 * Used to authorize self-removal from queue (only the client that registered can remove).
 */
export function validatePrivateKey(userId: string, privateKey: string): boolean {
  const store = loadAuth()
  return store[userId] === privateKey
}
