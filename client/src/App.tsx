import { FormEvent, useEffect, useRef, useState } from 'react'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { AudioMode, defaultSettings, UserSettings } from '../../models/UserSettings'
import {
  addToQueue as apiAddToQueue,
  getSocket,
  getTabs as apiGetTabs,
  registerIdentity,
  removeFromQueue as apiRemoveFromQueue,
  TabConfig,
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
import queueFreeSound from './audio/queue_free.mp3'
import queueFreeSoundTob from './audio/queue_free_tob.mp3'
import queueKickSound from './audio/queue_kick.mp3'
import queueKickSoundTob from './audio/queue_kick_tob.mp3'
import check from './icons/check.svg'
import cross from './icons/cross.svg'

let counter = 0

export default function App() {
  const [tabs, setTabs] = useState<TabConfig[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [modalEntry, setModalEntry] = useState<QueueEntry | null>(null)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState(defaultSettings)
  const [identity, setIdentity] = useState<StoredIdentity | null>(() => getStoredIdentity())
  const [loginName, setLoginName] = useState<string>(() => getStoredIdentity()?.name ?? '')
  const [loginError, setLoginError] = useState<string | null>(null)

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
        setActiveTab(configuredTabs[0]?.id)
      } catch (err) {
        console.error('Failed to load tabs:', err)
        setDisplaySpinner(false)
        alert('Kunne ikke hente faner fra serveren')
      }
    }

    loadTabs()
  }, [])

  useEffect(() => {
    if (!activeTab) return
    setDisplaySpinner(true)
    setDisplayModal(false)
    currentHolderRef.current = undefined
    const socket = getSocket(activeTab)
    const handleStateUpdate = (newState: QueueEntry[]) => {
      const newHolder = newState.find(entry => isCurrent(entry))
      const soundToPlay = getSoundToPlayForStateUpdate(
        currentHolderRef.current,
        newState,
        getUserId()
      )
      if (soundToPlay === 'kick') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].kick)
      } else if (soundToPlay === 'free') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].free)
      }
      currentHolderRef.current = newHolder
      setData(newState)
      setDisplaySpinner(false)
    }

    socket.on('stateUpdate', handleStateUpdate)
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
    if (!activeTab) return
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
    setModalEntry(entry)
    setDisplayModal(true)
  }

  function closeExitModal(userDidConfirm: boolean) {
    if (userDidConfirm) {
      if (modalEntry) removeFromQueue(modalEntry)
    }
    setDisplayModal(false)
    setModalEntry(null)
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
      estimated: parseInt(timeInput ?? '1')
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
      {identity ? (
        <>
          <div className='banner'>Er Plugin Registration ledig?</div>
          {displaySpinner ? (
            <Spinner />
          ) : (
            <div>
              <div className='availabilityIcon'>
                <img
                  className='icon'
                  src={queue.length === 0 ? check : cross}
                  alt={queue.length === 0 ? 'Available' : 'Unavailable'}
                ></img>
              </div>

              {queue.length > 0 && (
                <div className='queueContainer'>
                  <QueueDisplay items={queue} leaveQueueFunction={displayExitModal} />
                </div>
              )}
              <div style={{ height: '100%' }} />
            </div>
          )}

          <form className='queueForm' onSubmit={handleQueueSubmit}>
            <div>
              <select className='textinput selectinput' ref={timeInputRef}>
                <option value='1'>1 time</option>
                <option value='2'>2 timer</option>
                <option value='3'>3 timer</option>
                <option value='4'>4 timer</option>
                <option value='5'>5 timer</option>
                <option value='6'>6 timer</option>
                <option value='7'>7 timer</option>
                <option value='8'>8 timer</option>
              </select>
            </div>

            {(() => {
              const legacyPrivateKey = localStorage.getItem('privateKey')
              const userEntry = queue.find(e => e.id === identity.userId || (legacyPrivateKey ? e.id === legacyPrivateKey : false))
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

          {displayModal && modalEntry && (
            <ExitModal displayItem={modalEntry.username} closeModalFunction={closeExitModal} />
          )}

          {!appSettings['hideLog'] && <HistoryDisplay data={data} />}
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
