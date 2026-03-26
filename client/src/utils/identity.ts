export type StoredIdentity = {
  name: string
  userId: string
  privateKey: string
}

const STORAGE_KEY = 'userIdentity'

export function getStoredIdentity(): StoredIdentity | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredIdentity
    if (
      typeof parsed.name === 'string' &&
      typeof parsed.userId === 'string' &&
      typeof parsed.privateKey === 'string'
    ) {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

export function setStoredIdentity(identity: StoredIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
}

export function getPrivateKey(): string | null {
  return getStoredIdentity()?.privateKey ?? null
}

export function getUserId(): string | null {
  return getStoredIdentity()?.userId ?? null
}

export function getName(): string | null {
  return getStoredIdentity()?.name ?? null
}

export function isLoggedIn(): boolean {
  return getStoredIdentity() != null
}
