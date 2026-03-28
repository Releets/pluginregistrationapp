import { createContext, useMemo, useState, type ReactNode } from 'react'
import '../styles/App.css'
import type { StoredIdentity } from '../../../models/AppSettings'
import { registerIdentity } from '../api/queueApi'
import useLanguage from './useLanguage'

const STORAGE_KEY = 'userIdentity'

const emptyIdentity = (): StoredIdentity => ({
  name: '',
  userId: '',
  privateKey: '',
})

function isStoredIdentity(v: unknown): v is StoredIdentity {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return typeof o.name === 'string' && typeof o.userId === 'string' && typeof o.privateKey === 'string'
}

function storeIdentity(identity: StoredIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
}

function retrieveIdentity(): StoredIdentity {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (isStoredIdentity(parsed)) return parsed
    } catch {
      // ignore
    }
  }

  return emptyIdentity()
}

export type IdentityContextValue = {
  identity: StoredIdentity
  setName: (name: string) => void
}

export const IdentityContext = createContext<IdentityContextValue | undefined>(undefined)

export function IdentityProvider({ children }: Readonly<{ children: ReactNode }>) {
  const t = useLanguage()
  const [identity, setIdentity] = useState<StoredIdentity>(retrieveIdentity)
  const [nameInput, setNameInput] = useState(identity.name)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const isLoggedIn = Boolean(identity.name && identity.userId && identity.privateKey)

  function setNameHandler(name: string): void {
    setNameInput(name)
    setIdentity({ ...identity, name })
    storeIdentity({ ...identity, name })
  }

  const context = useMemo(() => ({ identity, setName: setNameHandler }), [identity])

  async function loginHandler(name: string): Promise<void> {
    setIsLoggingIn(true)
    try {
      const { userId, privateKey } = await registerIdentity()
      setIdentity({ name, userId, privateKey })
      storeIdentity({ name, userId, privateKey })
    } catch (err) {
      const message = err instanceof Error ? err.message : t.errors.loginFailed
      setLoginError(message)
    }
    setIsLoggingIn(false)
  }

  if (!isLoggedIn) {
    return (
      <div className='App'>
        <div className='loginPrompt'>
          <form
            onSubmit={e => {
              e.preventDefault()
              loginHandler(nameInput)
            }}
          >
            <input
              type='text'
              placeholder={t.login.namePlaceholder}
              className='textinput'
              value={nameInput}
              minLength={2}
              maxLength={8}
              onChange={e => setNameInput(e.target.value)}
            />
            <button className='button' type='submit' disabled={isLoggingIn}>
              {isLoggingIn ? t.login.loggingIn : t.login.submit}
            </button>
          </form>
          {loginError && <div className='loginError'>{loginError}</div>}
        </div>
      </div>
    )
  }

  return <IdentityContext.Provider value={context}>{children}</IdentityContext.Provider>
}
