import axios, { AxiosError } from 'axios'
import { FormEvent, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { isCurrent, isPending, QueueEntry, QueueEntryCurrent } from '../../models/QueueEntry'
import { UserSettings, AudioMode, defaultSettings } from '../../models/UserSettings'
import {
  getStoredIdentity,
  setStoredIdentity,
  type StoredIdentity,
  getUserId,
  getPrivateKey,
} from './utils/identity'
import './App.css'
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

const adr = import.meta.env.VITE_BACKEND_URL
if (!adr) throw new Error('VITE_BACKEND_URL environment variable not set')

const timestamp = () => new Date().toISOString()

console.log(timestamp(), 'Connecting to server at', adr)
axios.defaults.baseURL = adr
const socket = io(adr, {
  transports: ['websocket'],
})

let currentHolder: QueueEntryCurrent | undefined = undefined
let counter = 0;

export default function App() {
  const [identity, setIdentity] = useState<StoredIdentity | null>(() => getStoredIdentity())
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [currentModalUserIndex, setCurrentModalUserIndex] = useState(0)
  const [displaySpinner, setDisplaySpinner] = useState(true)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState(defaultSettings)
  const [loginName, setLoginName] = useState('')
  const [loginError, setLoginError] = useState('')

  const queue = data.filter(e => isPending(e))
  const currentUserId = identity?.userId ?? null
  const currentUserQueueIndex =
    currentUserId != null ? queue.findIndex(e => e.id === currentUserId) : -1

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

  // Use a useEffect to update the ref whenever userSettings changes
  useEffect(() => {
    appSettingsRef.current = appSettings
  }, [appSettings])

  useEffect(() => {
    // Listen for updates from the backend
    socket.on('stateUpdate', (newState: QueueEntry[]) => {
      console.debug(timestamp(), 'Recieved update from backend')
      const newHolder = newState.find(entry => isCurrent(entry))

      // Skip if you are loading the page
      const userId = getUserId()
      if (currentHolder && userId) {
        // If you are the current holder and someone else replaces you
        if (currentHolder.id === userId && newHolder?.id !== userId) {
          console.log(timestamp(), 'Removed from queue due to alloted timeslot')
          playAudio(sounds[appSettingsRef.current.audioMode].kick)
        }

        // If you are the new current holder and someone else had it before you
        if (newHolder?.id === userId && currentHolder.id !== userId) {
          console.log(timestamp(), 'PluginReg is now yours')
          playAudio(sounds[appSettingsRef.current.audioMode].free)
        }
      }

      currentHolder = newHolder
      setData(newState)
      setDisplaySpinner(false)
    })

    return () => {
      socket.off('stateUpdate')
    }
  }, [])

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings')
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings)
      setAppSettings(parsedSettings)
      console.debug('Retrieved settings from storage:', parsedSettings)
    } else {
      console.debug('No settings found in storage')
    }
  }, [])

  const addToQueue = (queueEntry: QueueEntry) => {
    console.log(timestamp(), 'Adding ' + queueEntry.username + ' to queue')
    axios.post(adr + '/add', { value: queueEntry }).catch(e => {
      console.warn(timestamp(), e)
      alert(e.response.data)
    })
  }

  const removeFromQueue = async (user: QueueEntry) => {
    const key = getPrivateKey()
    if (!key) return
    console.log(timestamp(), 'Removing ' + user.username + ' from queue')
    currentHolder = undefined

    try {
      await axios.post(adr + '/remove', {
        value: user,
        privateKey: key,
        godmodePassword: appSettingsRef.current.godmodePassword,
      })
    } catch (e) {
      if (!(e instanceof AxiosError)) throw e
      console.warn(timestamp(), e)
      alert(e.response?.data)
    }
  }

  const timeInputRef = useRef<HTMLSelectElement>(null)

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const name = loginName.trim()
    if (!name) {
      setLoginError('Skriv inn navnet ditt')
      return
    }
    setLoginError('')
    try {
      const { data: reg } = await axios.post<{ userId: string; privateKey: string }>(adr + '/register', {})
      setStoredIdentity({ name, userId: reg.userId, privateKey: reg.privateKey })
      setIdentity(getStoredIdentity())
    } catch (err) {
      setLoginError('Kunne ikke registrere. Prøv igjen.')
      console.warn(err)
    }
  }

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

  const handleQueueSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!identity) return
    const timeInput = timeInputRef.current?.value
    addToQueue({
      id: identity.userId,
      username: identity.name,
      estimated: parseInt(timeInput ?? '1'),
    })
  }

  const playAudio = async (sound: HTMLAudioElement) => {
    try {
      await sound.play()
    } catch (err) {
      if (err instanceof Error) {
        console.warn(timestamp(), err)
      }
      console.log(timestamp(), 'Cancelled initial audio')
    }
  }

  const handleMenuClick = () => {
    setIsReversed(!isReversed)
    counter++
  }

  const setOptions = (key: keyof UserSettings, value: UserSettings[typeof key]) => {
    const newSettings = { ...appSettings, [key]: value }
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
    setAppSettings(newSettings)
    console.debug(timestamp(), 'Updated settings:', newSettings)
  }

  if (!identity) {
    return (
      <div className='App'>
        <div className='banner'>Plugin Registration Kø</div>
        <div className='loginPrompt'>
          <p>Skriv inn navnet ditt for å bruke køen</p>
          <form className='queueForm' onSubmit={handleLoginSubmit}>
            <input
              type='text'
              placeholder='Ditt navn'
              className={`textinput ${loginError ? 'wronginput' : ''}`}
              value={loginName}
              onChange={e => setLoginName(e.target.value)}
              maxLength={50}
              autoFocus
            />
            {loginError && <p className='loginError'>{loginError}</p>}
            <button type='submit' className='button'>
              Fortsett
            </button>
          </form>
        </div>
      </div>
    )
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
        onIdentityChange={setIdentity}
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
        {currentUserQueueIndex >= 0 ? (
          <button
            type='button'
            className='button'
            onClick={() => displayExitModal(currentUserQueueIndex)}
          >
            Jeg er ferdig / Forlat køen
          </button>
        ) : (
          <button type='submit' className='button'>
            {queue.length === 0 ? 'Overta' : 'Gå i kø'}
          </button>
        )}
        <br></br>
        {queue.length > 0 && (
          <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>
        )}
      </form>
      {displayModal && queue[currentModalUserIndex] && (
        <ExitModal displayItem={queue[currentModalUserIndex].username} closeModalFunction={closeExitModal} />
      )}

      {!appSettings['hideLog'] && <HistoryDisplay data={data} />}
    </div>
  )
}
