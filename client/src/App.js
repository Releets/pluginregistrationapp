import axios from 'axios'
import io from 'socket.io-client'
import check from './check.svg'
import cross from './cross.svg'

import ExitModal from './ExitModal'
import QueueDisplay from './QueueDisplay'

import { useEffect, useRef, useState } from 'react'
import './App.css'

const adr = 'https://pluginreg-api.kallerud.no'
if (!adr) throw new Error('REACT_APP_SERVER_URL environment variable not set')

const timestamp = () => new Date().toISOString()

console.log(timestamp(), 'Connecting to server at', adr)
axios.defaults.baseURL = adr
const socket = io(adr, {
  transports: ['websocket'],
})

export default function App() {
  const [queue, setQueue] = useState([])
  const [displayModal, setDisplayModal] = useState(false)
  const [currentModalUserIndex, setCurrentModalUserIndex] = useState(0)

  useEffect(() => {
    // Listen for updates from the backend
    socket.on('stateUpdate', data => {
      console.log(timestamp(), 'Recieved update from backend:', data)
      setQueue(data)
    })

    return () => {
      socket.off('stateUpdate')
    }
  }, [])

  const addToQueue = user => {
    console.log(timestamp(), 'Adding ' + user + ' to queue')
    axios.post(adr + '/add', { value: user }).catch(err => {
      // TODO: Display error message to user
      console.error(timestamp(), 'Error adding to queue:', err.message)
    })
  }

  const removeFromQueue = user => {
    console.log(timestamp(), 'Removing ' + user + ' from queue')
    axios.post(adr + '/remove', { value: user })
  }

  const initialsInputRef = useRef()
  const timeInputRef = useRef()

  function leaveQueue(index) {
    removeFromQueue(queue[index])
  }

  function displayExitModal(index) {
    setCurrentModalUserIndex(index)
    setDisplayModal(true)
  }

  function closeExitModal(userDidConfirm) {
    if (userDidConfirm) {
      leaveQueue(currentModalUserIndex)
    }
    setDisplayModal(false)
  }

  const handleSubmit = event => {
    event.preventDefault();

    if (!initialsInputRef.current.value) {
      return
    }
    if (initialsInputRef.current.value.length > 7) {
      initialsInputRef.current.value = ''
      timeInputRef.current.value = ''
      initialsInputRef.current.placeholder = 'For mange tegn!'
      initialsInputRef.current.className = 'textinput wronginput'
      return
    }

    if (timeInputRef.current.value > 8) {
      initialsInputRef.current.value = ''
      timeInputRef.current.value = ''
      timeInputRef.current.placeholder = 'Maks 8 timer'
      timeInputRef.current.className = 'textinput wronginput'
      return
    }

    initialsInputRef.current.placeholder = 'Dine initialer'
    initialsInputRef.current.className = 'textinput'
    timeInputRef.current.placeholder = 'Estimert tidsbrukt'
    timeInputRef.current.className = 'textinput'

    const finishTime = Date.now() + (timeInputRef.current.value * 60 * 60 * 1000);
    const entry = {
      username: initialsInputRef.current.value,
      entrytime: Date.now(),
      estimatedFinishTime: finishTime,
    }

    addToQueue(entry)
    initialsInputRef.current.value = ''
    timeInputRef.current.value = ''
  }

  return (
    <div className='App'>
      <div className='banner'>Er Plugin Registration ledig?</div>
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
      <form className='queueForm' onSubmit={handleSubmit}>
        <div>
          <input
            type='text'
            placeholder='Dine initialer'
            className='textinput'
            ref={initialsInputRef}
          />
          <input
            type='number'
            placeholder='Estimert tidsbrukt'
            className='textinput'
            ref={timeInputRef}
          />
        </div>
        <button className='button'>
          {queue.length == 0 ? 'Overta' : 'Gå i kø'}
        </button>
        <br></br>
        {queue.length > 0 && (
          <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>
        )}
      </form>
      {displayModal && (
        <ExitModal displayItem={queue[currentModalUserIndex].username} closeModalFunction={closeExitModal} />
      )}
    </div>
  )
}
