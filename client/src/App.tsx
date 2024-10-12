import axios, { AxiosError } from 'axios'
import { FormEvent, useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import { isPending, QueueEntry } from '../../models/QueueEntry'
import './App.css'
import check from './icons/check.svg'
import cross from './icons/cross.svg'
import ExitModal from './ExitModal'
import HistoryDisplay from './HistoryDisplay'
import QueueDisplay from './QueueDisplay'
import Spinner from './Spinner'
import NavMenu from './NavMenu'
import queueFreeSound from './audio/queue_free.mp3'
import queueKickSound from './audio/queue_kick.mp3'
import queueFreeSoundTob from './audio/queue_free_tob.mp3'
import queueKickSoundTob from './audio/queue_kick_tob.mp3'

const adr = import.meta.env.VITE_BACKEND_URL
if (!adr) throw new Error('VITE_BACKEND_URL environment variable not set')

const timestamp = () => new Date().toISOString()

console.log(timestamp(), 'Connecting to server at', adr)
axios.defaults.baseURL = adr
const socket = io(adr, {
  transports: ['websocket'],
})

let currentHolder = null

export default function App() {
  const [data, setData] = useState(new Array<QueueEntry>())
  const [displayModal, setDisplayModal] = useState(false)
  const [currentModalUserIndex, setCurrentModalUserIndex] = useState(0)
  const [displaySpinner, setDisplaySpinner] = useState(false)
  const [isReversed, setIsReversed] = useState(true)
  const [appSettings, setAppSettings] = useState({})

  const queue = data.filter(e => isPending(e))
  const audioMode = appSettings['audioMode'] ? '-tob' : ''

  let sounds = {
    'free' : new Audio(queueFreeSound),
    'kick' : new Audio(queueKickSound),
    'free-tob' : new Audio(queueFreeSoundTob),
    'kick-tob' : new Audio(queueKickSoundTob)
  }

  useEffect(() => {
    // Listen for updates from the backend
    setDisplaySpinner(true)
    socket.on('stateUpdate', data => {
      console.log(timestamp(), 'Recieved update from backend:', data)
      // If someone is in the queue (and its not the initial data update upon connecting to the site) 
      // AND the user at the front of the queue has changed with this update
      if(currentHolder != null && currentHolder.privateKey != data.filter(e => !e.queueExitTime)[0].privateKey){
        let newHolder = data.filter(e => !e.queueExitTime)[0]
        //Play sound if user overtakes queue
        if (newHolder.privateKey === localStorage.getItem('privateKey')) {
          console.log(timestamp(), 'PluginReg is now yours')
          playAudio(sounds['free'+audioMode])
        } 
        //Play sound if user is kicked from queue
        else if (currentHolder.privateKey === localStorage.getItem('privateKey')){
          console.log(timestamp(), 'Removed from queue due to alloted timeslot')
          playAudio(sounds['kick'+audioMode])
        }
      }
      currentHolder = data.filter(e => !e.queueExitTime).length > 0 ? data.filter(e => !e.queueExitTime)[0] : null;
      setData(data)
      setDisplaySpinner(false)
    })

    return () => {
      socket.off('stateUpdate')
    }
  }, [])

  useEffect(() => {
    let settings = {}
    if(!localStorage.getItem('userSettings')){
      settings = {
        'hideLog' : false,
        'audioMode' : false
      }
      localStorage.setItem(JSON.stringify(settings))
    }else{
      settings = JSON.parse(localStorage.getItem('userSettings'))
    }
    console.log(settings)
    setAppSettings(settings)
  }, [])

  const addToQueue = (queueEntry: QueueEntry) => {
    console.log(timestamp(), 'Adding ' + queueEntry.username + ' to queue')
    axios.post(adr + '/add', { value: queueEntry }).catch(e => {
      console.warn(timestamp(), e)
      alert(e.response.data)
    })
  }

  const removeFromQueue = async (user: QueueEntry) => {
    console.log(timestamp(), 'Removing ' + user.username + ' from queue')
    try {
      await axios.post(adr + '/remove', {
        value: user,
        privateKey: localStorage.getItem('privateKey'),
      })
    } catch (e) {
      if (!(e instanceof AxiosError)) throw e
      console.warn(timestamp(), e)
      alert(e.response?.data)
    }
  }

  const nameInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLSelectElement>(null)

  function leaveQueue(index: number) {
    removeFromQueue(queue[index])
  }

  function displayExitModal(index: number) {
    setCurrentModalUserIndex(index)
    setDisplayModal(true)
  }

  function closeExitModal(userDidConfirm: boolean) {
    if (userDidConfirm) {
      leaveQueue(currentModalUserIndex)
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
      username: nameInputRef.current.value,
      estimated: parseInt(timeInput ?? '1'),
    })

    nameInputRef.current.value = ''
  }

  const playAudio = (sound) => {
    try{
      sound.play()
    }catch(e){
      console.log(timestamp(), 'Cancelled initial audio')
    }
  }

  const handleMenuClick = () => {
    setIsReversed(!isReversed);
  }

  const setOptions = (opt, value) => {
    let settings = {
      'hideLog' : appSettings['hideLog'],
      'audioMode' : appSettings['audioMode']
    }

    settings[opt] = value
    localStorage.setItem('userSettings', JSON.stringify(settings))

    setAppSettings(settings)
    console.log(appSettings)
  }

  return (
    <div className='App'>
      <NavMenu isReversed={isReversed} handleClick={handleMenuClick} handleOptionToggle={setOptions}/>
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

      {!appSettings['hideLog'] &&  <HistoryDisplay data={data}/>}
    </div>
  )
}

function getPrivateKey() {
  let privateKey = localStorage.getItem('privateKey')
  if (!privateKey) {
    privateKey = uuidv4()
    localStorage.setItem('privateKey', privateKey)
  }
  return privateKey
}
