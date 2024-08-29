import axios from 'axios'
import io from 'socket.io-client'
import check from './check.svg'
import cross from './cross.svg'

import ExitModal from './ExitModal'
import QueueDisplay from './QueueDisplay'

import { useEffect, useRef, useState } from 'react'
import './App.css'

const adr = 'http://localhost:6969'
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
      console.error('Error adding to queue:', err.message)
    })
  }

  const removeFromQueue = user => {
    console.log(timestamp(), 'Removing ' + user + ' from queue')
    axios.post(adr + '/remove', { value: user })
  }

  const inputRef = useRef()

  function enterQueue() {
    if (inputRef.current.value === '') {
      return
    } else if (inputRef.current.value.length > 7) {
      inputRef.current.value = ''
      inputRef.current.placeholder = 'For mange tegn!'
      inputRef.current.className = 'textinput wronginput'
      return
    }

    inputRef.current.placeholder = 'Dine initialer'
    inputRef.current.className = 'textinput'

    addToQueue(inputRef.current.value)

    inputRef.current.value = ''
  }

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

  const handleKeyPress = event => {
    if (event.key === 'Enter' && inputRef.current.value !== '') {
      enterQueue()
    }
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
      {queue.length === 0 ? (
        ''
      ) : (
        <div className='queueContainer'>
          <QueueDisplay items={queue} leaveQueueFunction={displayExitModal} />
        </div>
      )}
      <div className='queueForm'>
        <input
          type='text'
          placeholder='Dine initialer'
          className='textinput'
          ref={inputRef}
          onKeyUp={handleKeyPress}
        ></input>
        <br></br>
        <button className='button' onClick={enterQueue}>
          {queue.length === 0 ? 'Overta' : 'Gå i kø'}
        </button>
        <br></br>
        {queue.length === 0 ? (
          ''
        ) : (
          <div className='contextInfo'>(Når du er ferdig, trykk på ditt ikon for å fjerne deg selv fra køen)</div>
        )}
      </div>
      {!displayModal ? (
        ''
      ) : (
        <ExitModal displayItem={queue[currentModalUserIndex]} closeModalFunction={closeExitModal} />
      )}
    </div>
  )
}
