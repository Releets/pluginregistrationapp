import { FormEvent, useEffect, useRef, useState } from 'react'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { AudioMode, defaultSettings, UserSettings } from '../../models/UserSettings'
import { addToQueue as apiAddToQueue, getSocket, removeFromQueue as apiRemoveFromQueue } from './api/queueApi'
import { playAudio } from './utils/audio'
import { getPrivateKey } from './utils/privateKey'
import { loadUserSettingsFromStorage, saveUserSettingsToStorage } from './utils/settings'
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

let counter = 0

export default function App() {
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [currentModalUserIndex, setCurrentModalUserIndex] = useState(0)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState(defaultSettings)

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
    const socket = getSocket()
    socket.on('stateUpdate', (newState: QueueEntry[]) => {
      const newHolder = newState.find(entry => isCurrent(entry))
      const soundToPlay = getSoundToPlayForStateUpdate(
        currentHolderRef.current,
        newState,
        getPrivateKey()
      )
      if (soundToPlay === 'kick') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].kick)
      } else if (soundToPlay === 'free') {
        playAudio(soundsRef.current[appSettingsRef.current.audioMode].free)
      }
      currentHolderRef.current = newHolder
      setData(newState)
      setDisplaySpinner(false)
    })
    return () => {
      socket.off('stateUpdate')
    }
  }, [])

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
    apiAddToQueue(queueEntry)
  }

  const removeFromQueue = async (user: QueueEntry) => {
    currentHolderRef.current = undefined
    await apiRemoveFromQueue(user, getPrivateKey(), appSettingsRef.current.godmodePassword)
  }

  const nameInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLSelectElement>(null)

  function displayExitModal(index: number) {
    setCurrentModalUserIndex(index)
    setDisplayModal(true)
  }

  function closeExitModal(userDidConfirm: boolean) {
    if (userDidConfirm) {
      removeFromQueue(queue[currentModalUserIndex])
    }
    setDisplayModal(false)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nameInput = nameInputRef.current?.value
    const timeInput = timeInputRef.current?.value

    if (!nameInput || nameInput.length === 0) return

    addToQueue({
      id: getPrivateKey(),
      username: nameInputRef.current!.value,
      estimated: parseInt(timeInput ?? '1'),
    })

    nameInputRef.current!.value = ''
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
      />
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

      <form className='queueForm' onSubmit={handleSubmit}>
        <div>
          <input type='text' placeholder='Ditt navn' className='textinput' ref={nameInputRef} maxLength={7} />
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
        <button className='button'>{queue.length === 0 ? 'Overta' : 'Gå i kø'}</button>
        <br></br>
        {queue.length > 0 && (
          <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>
        )}
      </form>
      {displayModal && (
        <ExitModal displayItem={queue[currentModalUserIndex].username} closeModalFunction={closeExitModal} />
      )}

      {!appSettings['hideLog'] && <HistoryDisplay data={data} />}
    </div>
  )
}
