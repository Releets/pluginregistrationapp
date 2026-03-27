import { FormEvent, useEffect, useRef, useState } from 'react'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { AudioMode, defaultSettings, UserSettings } from '../../models/UserSettings'
import {
  addToQueue as apiAddToQueue,
  getSocket,
  getTabs as apiGetTabs,
  getUptimeSummary as apiGetUptimeSummary,
  registerIdentity,
  removeFromQueue as apiRemoveFromQueue,
  switchSocketTab,
  TabConfig,
  UptimeSummary,
} from './api/queueApi'
import { playAudio } from './utils/audio'
import { loadUserSettingsFromStorage, saveUserSettingsToStorage } from './utils/settings'
import { getSoundToPlayForStateUpdate } from './utils/stateUpdateSound'
import { type StoredIdentity, getStoredIdentity, getUserId, setStoredIdentity } from './utils/identity'
import './styles/App.css'
import ExitModal from './ExitModal'
import HistoryDisplay from './HistoryDisplay'
import NavMenu from './NavMenu'
import QueueDisplay from './QueueDisplay'
import Spinner from './Spinner'
import UptimeDisplay from './UptimeDisplay'
import queueFreeSound from './audio/queue_free.mp3'
import queueFreeSoundTob from './audio/queue_free_tob.mp3'
import queueKickSound from './audio/queue_kick.mp3'
import queueKickSoundTob from './audio/queue_kick_tob.mp3'
import check from './icons/check.svg'
import cross from './icons/cross.svg'

let counter = 0
const LAST_ACTIVE_TAB_STORAGE_KEY = 'lastActiveTab'

export default function App() {
  const [tabs, setTabs] = useState<TabConfig[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [modalEntryId, setModalEntryId] = useState<string | null>(null)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState(defaultSettings)
  const [identity, setIdentity] = useState<StoredIdentity | null>(() => getStoredIdentity())
  const [loginName, setLoginName] = useState<string>(() => getStoredIdentity()?.name ?? '')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [uptimeSummary, setUptimeSummary] = useState<UptimeSummary | null>(null)

  const queue = data.filter(e => isPending(e))

  const sounds: Record<AudioMode, { free: HTMLAudioElement; kick: HTMLAudioElement }> = {
    normal: {
      free: new Audio(queueFreeSound),
      kick: new Audio(queueKickSound),
    },
    tobias: {
      free: new Audio(queueFreeSoundTob),
      kick: new Audio(queueKickSoundTob),
    },
  }

  const appSettingsRef = useRef(appSettings)
  const currentHolderRef = useRef<QueueEntryCurrent | undefined>(undefined)
  const soundsRef = useRef(sounds)
  soundsRef.current = sounds

  useEffect(() => {
    appSettingsRef.current = appSettings
  }, [appSettings])

  useEffect(() => {
    const loadTabs = async () => {
      try {
        const configuredTabs = await apiGetTabs()
        setTabs(configuredTabs)
        const availableTabIds = new Set(configuredTabs.map(tab => tab.id))
        const tabFromUrl = new URLSearchParams(globalThis.location.search).get('tab')
        const storedTab = localStorage.getItem(LAST_ACTIVE_TAB_STORAGE_KEY)
        const preferredTab =
          (tabFromUrl && availableTabIds.has(tabFromUrl) && tabFromUrl) ||
          (storedTab && availableTabIds.has(storedTab) && storedTab) ||
          configuredTabs[0]?.id

        setActiveTab(preferredTab)

        if (!preferredTab) return
        const url = new URL(globalThis.location.href)
        if (url.searchParams.get('tab') !== preferredTab) {
          url.searchParams.set('tab', preferredTab)
          globalThis.history.replaceState(null, '', url.toString())
        }
      } catch (err) {
        console.error('Failed to load tabs:', err)
        setDisplaySpinner(false)
        alert('Kunne ikke hente faner fra serveren')
      }
    }

    loadTabs()
  }, [])

  useEffect(() => {
    const loadUptime = async () => {
      try {
        const summary = await apiGetUptimeSummary()
        setUptimeSummary(summary)
      } catch (err) {
        console.error('Failed to load uptime summary:', err)
      }
    }

    void loadUptime()
    const uptimeInterval = setInterval(() => void loadUptime(), 1000 * 60 * 5)
    return () => clearInterval(uptimeInterval)
  }, [])

  useEffect(() => {
    if (!activeTab) return
    localStorage.setItem(LAST_ACTIVE_TAB_STORAGE_KEY, activeTab)
    const url = new URL(globalThis.location.href)
    if (url.searchParams.get('tab') === activeTab) return
    url.searchParams.set('tab', activeTab)
    globalThis.history.replaceState(null, '', url.toString())
  }, [activeTab])

  useEffect(() => {
    if (!activeTab) return
    setDisplaySpinner(true)
    setDisplayModal(false)
    currentHolderRef.current = undefined
    const socket = getSocket()
    const handleStateUpdate = (newState: QueueEntry[]) => {
      const newHolder = newState.find(entry => isCurrent(entry))
      const soundToPlay = getSoundToPlayForStateUpdate(currentHolderRef.current, newState, getUserId())
      if (soundToPlay === 'kick') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].kick)
      } else if (soundToPlay === 'free') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].free)
      }
      currentHolderRef.current = newHolder
      setData(newState)
      setDisplaySpinner(false)
    }

    // Listen before switching to avoid missing an immediate initial update.
    socket.on('stateUpdate', handleStateUpdate)
    switchSocketTab(activeTab)

    return () => {
      socket.off('stateUpdate', handleStateUpdate)
    }
  }, [activeTab])

  useEffect(() => {
    const stored = loadUserSettingsFromStorage()
    if (stored) {
      setAppSettings(stored)
      console.debug('Retrieved settings from storage:', stored)
    } else {
      console.debug('No settings found in storage')
    }
  }, [])

  const addToQueue = (queueEntry: QueueEntry) => {
    if (!activeTab) return
    apiAddToQueue(queueEntry, activeTab)
  }

  const removeFromQueue = async (user: QueueEntry) => {
    if (!activeTab) throw new Error('Mangler aktiv fane for å fjerne deg fra køen')
    currentHolderRef.current = undefined
    if (!identity?.privateKey) throw new Error('Du må være logget inn for å forlate køen')

    // Legacy compatibility: older queue rows used the old `privateKey` as `id`.
    // If the queue entry id matches the legacy privateKey stored under `privateKey`,
    // submit that secret instead of the new identity privateKey.
    const legacyPrivateKey = localStorage.getItem('privateKey')
    const privateKeyToSubmit = user.id === legacyPrivateKey ? legacyPrivateKey : identity.privateKey
    if (!privateKeyToSubmit) throw new Error('Mangler privatnøkkel for fjerning av køplass')

    await apiRemoveFromQueue(user, privateKeyToSubmit, appSettingsRef.current.godmodePassword, activeTab)
  }

  const timeInputRef = useRef<HTMLSelectElement>(null)

  function displayExitModal(id: string) {
    const entry = queue.find(e => e.id === id)
    if (!entry) return
    setModalEntryId(entry.id)
    setDisplayModal(true)
  }

  const activeModalEntry = modalEntryId ? (queue.find(e => e.id === modalEntryId) ?? null) : null

  useEffect(() => {
    if (displayModal && !activeModalEntry) {
      setDisplayModal(false)
      setModalEntryId(null)
    }
  }, [displayModal, activeModalEntry])

  function closeExitModal(userDidConfirm: boolean) {
    if (userDidConfirm && activeModalEntry) {
      void removeFromQueue(activeModalEntry).catch(err => {
        const message = err instanceof Error ? err.message : 'Kunne ikke fjerne deg fra køen'
        alert(message)
        console.error(message, err)
      })
    }
    setDisplayModal(false)
    setModalEntryId(null)
  }

  const handleQueueSubmit = (event: FormEvent) => {
    event.preventDefault()
    const timeInput = timeInputRef.current?.value

    if (!activeTab) return
    if (!identity) return
    if (!timeInput) return

    // Prevent joining again (including legacy privateKey-based queue entries).
    const legacyPrivateKey = localStorage.getItem('privateKey')
    const alreadyInQueue =
      queue.some(e => e.id === identity.userId) ||
      (legacyPrivateKey ? queue.some(e => e.id === legacyPrivateKey) : false)
    if (alreadyInQueue) return

    addToQueue({
      id: identity.userId,
      username: identity.name,
      estimated: parseInt(timeInput ?? '1'),
    })
  }

  const handleMenuClick = () => {
    setIsReversed(!isReversed)
    counter++
  }

  const setOptions = (key: keyof UserSettings, value: UserSettings[typeof key]) => {
    const newSettings = { ...appSettings, [key]: value }
    saveUserSettingsToStorage(newSettings)
    setAppSettings(newSettings)
    console.debug('Updated settings:', newSettings)
  }

  return (
    <div className='App'>
      <NavMenu
        isReversed={isReversed}
        animationKeyCounter={counter}
        handleClick={handleMenuClick}
        handleOption={setOptions}
        userAppSettings={appSettings}
        identity={identity}
        onIdentityChange={next => setIdentity(next)}
      />

      {/* TABS */}
      {tabs.length > 0 && (
        <div className='tabRow'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tabButton ${tab.id === activeTab ? 'activeTab' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type='button'
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      {identity ? (
        <>
          <div className='banner'>Er Plugin Registration ledig?</div>
          <div style={{ flex: 1 }}>
            {displaySpinner ? (
              <Spinner />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  className='icon'
                  src={queue.length === 0 ? check : cross}
                  alt={queue.length === 0 ? 'Available' : 'Unavailable'}
                />

                {queue.length > 0 && (
                  <div className='queueContainer'>
                    <QueueDisplay items={queue} leaveQueueFunction={displayExitModal} />
                  </div>
                )}
              </div>
            )}
          </div>

          <form className='queueForm' onSubmit={handleQueueSubmit}>
            <div>
              <select className='textinput selectinput' ref={timeInputRef}>
                {Array.from({ length: 8 }, (_, i) => i + 1).map(hours => (
                  <option key={hours} value={hours}>
                    {hours} time{hours === 1 ? '' : 'r'}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const legacyPrivateKey = localStorage.getItem('privateKey')
              const userEntry = queue.find(
                e => e.id === identity.userId || (legacyPrivateKey ? e.id === legacyPrivateKey : false)
              )
              if (userEntry) {
                const buttonLabel = isCurrent(userEntry) ? 'Jeg er ferdig' : 'Forlat køen'
                return (
                  <button className='button' type='button' onClick={() => displayExitModal(userEntry.id)}>
                    {buttonLabel}
                  </button>
                )
              }

              const buttonLabel = queue.length === 0 ? 'Overta' : 'Gå i kø'
              return (
                <button className='button' type='submit'>
                  {buttonLabel}
                </button>
              )
            })()}

            <br></br>
          </form>

          {displayModal && activeModalEntry && (
            <ExitModal
              displayItem={activeModalEntry.username ?? 'denne brukeren'}
              closeModalFunction={closeExitModal}
            />
          )}

          {!appSettings.hideLog && <HistoryDisplay data={data} />}
          {appSettings.showUptime && uptimeSummary && <UptimeDisplay uptime={uptimeSummary} />}
        </>
      ) : (
        <div className='loginPrompt'>
          <p>Logg inn</p>
          <form
            onSubmit={async e => {
              e.preventDefault()
              setLoginError(null)
              const name = loginName.trim()
              if (!name) return
              if (name.length > 50) {
                setLoginError('Navn er for langt')
                return
              }

              try {
                const { userId, privateKey } = await registerIdentity()
                const next = { name, userId, privateKey }
                setStoredIdentity(next)
                setIdentity(next)
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Kunne ikke logge inn'
                setLoginError(message)
              }
            }}
          >
            <input
              type='text'
              placeholder='Ditt navn'
              className='textinput'
              value={loginName}
              maxLength={50}
              onChange={e => setLoginName(e.target.value)}
            />
            <button className='button' type='submit'>
              Logg inn
            </button>
          </form>
          {loginError && <div className='loginError'>{loginError}</div>}
        </div>
      )}
    </div>
  )
}
