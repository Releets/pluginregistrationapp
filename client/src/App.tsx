import { FormEvent, useEffect, useRef, useState } from 'react'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { AudioMode, defaultSettings, UserSettings } from '../../models/UserSettings'
import {
  addToQueue as apiAddToQueue,
  getSocket,
  getTabs as apiGetTabs,
  registerIdentity,
  removeFromQueue as apiRemoveFromQueue,
  switchSocketTab,
  TabConfig,
} from './api/queueApi'
import { LanguageProvider } from './context/LanguageContext'
import { languages } from './locales'
import { detectPreferredLocale } from './utils/detectPreferredLocale'
import { intlLocaleTag } from './utils/intlLocale'
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
const LAST_ACTIVE_TAB_STORAGE_KEY = 'lastActiveTab'

function getInitialAppSettings(): UserSettings {
  const stored = loadUserSettingsFromStorage()
  if (stored) return stored
  return { ...defaultSettings, language: detectPreferredLocale() }
}

export default function App() {
  const [tabs, setTabs] = useState<TabConfig[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [modalEntryId, setModalEntryId] = useState<string | null>(null)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState<UserSettings>(getInitialAppSettings)
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
  appSettingsRef.current = appSettings

  const t = languages[appSettings.language]

  useEffect(() => {
    appSettingsRef.current = appSettings
  }, [appSettings])

  useEffect(() => {
    document.documentElement.lang = intlLocaleTag(appSettings.language)
    document.title = t.main.title
  }, [appSettings.language, t.main.title])

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
        alert(languages[appSettingsRef.current.language].alerts.tabsLoadFailed)
      }
    }

    loadTabs()
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
    switchSocketTab(activeTab)
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

    socket.on('stateUpdate', handleStateUpdate)
    return () => {
      socket.off('stateUpdate', handleStateUpdate)
    }
  }, [activeTab])

  const addToQueue = (queueEntry: QueueEntry) => {
    if (!activeTab) return
    void apiAddToQueue(queueEntry, activeTab).catch(() => {
      alert(languages[appSettingsRef.current.language].alerts.addToQueueFailed)
    })
  }

  const removeFromQueue = async (user: QueueEntry) => {
    const messages = languages[appSettingsRef.current.language]
    if (!activeTab) throw new Error(messages.errors.activeTabRequired)
    currentHolderRef.current = undefined
    if (!identity?.privateKey) throw new Error(messages.errors.mustBeLoggedInToLeave)

    const legacyPrivateKey = localStorage.getItem('privateKey')
    const privateKeyToSubmit = user.id === legacyPrivateKey ? legacyPrivateKey : identity.privateKey
    if (!privateKeyToSubmit) throw new Error(messages.errors.missingPrivateKey)

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
        const message = err instanceof Error ? err.message : ''
        const lang = languages[appSettingsRef.current.language]
        alert(message || lang.alerts.removeFromQueueFailed)
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
    <LanguageProvider locale={appSettings.language} t={t} setLocale={next => setOptions('language', next)}>
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
            <div className='banner'>{t.banner}</div>
            {displaySpinner ? (
              <Spinner />
            ) : (
              <div>
                <div className='availabilityIcon'>
                  <img
                    className='icon'
                    src={queue.length === 0 ? check : cross}
                    alt={queue.length === 0 ? t.availability.available : t.availability.unavailable}
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
                <select className='textinput selectinput' ref={timeInputRef} defaultValue='1'>
                  {t.queue.durationOptions.map((label, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {label}
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
                  const buttonLabel = isCurrent(userEntry) ? t.queue.imDone : t.queue.leaveQueue
                  return (
                    <button className='button' type='button' onClick={() => displayExitModal(userEntry.id)}>
                      {buttonLabel}
                    </button>
                  )
                }

                const buttonLabel = queue.length === 0 ? t.queue.takeOver : t.queue.joinQueue
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
                displayItem={activeModalEntry.username ?? t.exitModal.fallbackUser}
                closeModalFunction={closeExitModal}
              />
            )}

            {!appSettings['hideLog'] && <HistoryDisplay data={data} />}
          </>
        ) : (
          <div className='loginPrompt'>
            <p>{t.login.title}</p>
            <form
              onSubmit={async e => {
                e.preventDefault()
                setLoginError(null)
                const name = loginName.trim()
                if (!name) return
                if (name.length > 50) {
                  setLoginError(t.errors.nameTooLong)
                  return
                }

                try {
                  const { userId, privateKey } = await registerIdentity()
                  const next = { name, userId, privateKey }
                  setStoredIdentity(next)
                  setIdentity(next)
                } catch (err) {
                  const message = err instanceof Error ? err.message : t.errors.loginFailed
                  setLoginError(message)
                }
              }}
            >
              <input
                type='text'
                placeholder={t.login.namePlaceholder}
                className='textinput'
                value={loginName}
                maxLength={50}
                onChange={e => setLoginName(e.target.value)}
              />
              <button className='button' type='submit'>
                {t.login.submit}
              </button>
            </form>
            {loginError && <div className='loginError'>{loginError}</div>}
          </div>
        )}
      </div>
    </LanguageProvider>
  )
}
