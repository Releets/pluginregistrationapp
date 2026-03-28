import { FormEvent, useEffect, useRef, useState } from 'react'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { AudioMode } from '../../models/AppSettings'
import {
  addToQueue as apiAddToQueue,
  getSocket,
  getTabs as apiGetTabs,
  removeFromQueue as apiRemoveFromQueue,
  switchSocketTab,
  TabConfig,
} from './api/queueApi'
import { playAudio } from './utils/audio'
import { getSoundToPlayForStateUpdate } from './utils/stateUpdateSound'
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
import useLanguage from './context/useLanguage'
import useAppSettings from './context/useAppSettings'
import useIdentity from './context/useIdentity'

let counter = 0
const LAST_ACTIVE_TAB_STORAGE_KEY = 'lastActiveTab'

export default function App() {
  const { identity } = useIdentity()
  const { audioMode, hideLog, godmodePw } = useAppSettings()
  const t = useLanguage()
  const [tabs, setTabs] = useState<TabConfig[]>([])
  const [activeTab, setActiveTab] = useState<string>()
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [modalEntryId, setModalEntryId] = useState<string | null>(null)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)

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

  const currentHolderRef = useRef<QueueEntryCurrent | undefined>(undefined)
  const soundsRef = useRef(sounds)
  soundsRef.current = sounds
  const audioModeRef = useRef(audioMode.value)
  audioModeRef.current = audioMode.value

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
        alert(t.alerts.tabsLoadFailed)
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

    const userId = identity.userId || null

    const handleStateUpdate = (newState: QueueEntry[]) => {
      const newHolder = newState.find(entry => isCurrent(entry))
      const soundToPlay = getSoundToPlayForStateUpdate(currentHolderRef.current, newState, userId)
      const mode = audioModeRef.current
      if (soundToPlay === 'kick') {
        playAudio(soundsRef.current[mode].kick)
      } else if (soundToPlay === 'free') {
        playAudio(soundsRef.current[mode].free)
      }
      currentHolderRef.current = newHolder
      setData(newState)
      setDisplaySpinner(false)
    }

    socket.on('stateUpdate', handleStateUpdate)
    return () => {
      socket.off('stateUpdate', handleStateUpdate)
    }
  }, [activeTab, identity.userId])

  const addToQueue = (queueEntry: QueueEntry) => {
    if (!activeTab) return
    void apiAddToQueue(queueEntry, activeTab).catch(() => {
      alert(t.alerts.addToQueueFailed)
    })
  }

  const removeFromQueue = async (user: QueueEntry) => {
    if (!activeTab) throw new Error(t.errors.activeTabRequired)
    currentHolderRef.current = undefined
    if (!identity.privateKey) throw new Error(t.errors.mustBeLoggedInToLeave)

    const legacyPrivateKey = localStorage.getItem('privateKey')
    const privateKeyToSubmit = user.id === legacyPrivateKey ? legacyPrivateKey : identity.privateKey
    if (!privateKeyToSubmit) throw new Error(t.errors.missingPrivateKey)

    await apiRemoveFromQueue(user, privateKeyToSubmit, activeTab, godmodePw.value || undefined)
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
        const lang = t
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

  return (
    <div className='App'>
      <NavMenu isReversed={isReversed} animationKeyCounter={counter} handleClick={handleMenuClick} />
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

        {!hideLog.value && <HistoryDisplay data={data} />}
      </>
    </div>
  )
}
