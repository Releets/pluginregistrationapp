import axios from 'axios'
import io from 'socket.io-client'
import check from './check.svg'
import cross from './cross.svg'

import ExitModal from './ExitModal'
import QueueDisplay from './QueueDisplay'

import { useEffect, useRef, useState } from 'react'
import './App.css'

const adr = process.env.REACT_APP_SERVER_URL || 'http://localhost:6969'
if (!adr) throw new Error('REACT_APP_SERVER_URL environment variable not set')

console.log('Connecting to server at', adr)

axios.defaults.baseURL = adr

const socket = io(adr, {
  transports: ['websocket'],
})

export default function App() {
  const [queue, setQueue] = useState([])
  const [isFree, setIsFree] = useState(true)
  const [displayModal, setDisplayModal] = useState(false)
  const [currentModalUserIndex, setCurrentModalUserIndex] = useState(0)

  useEffect(() => {
    // Fetch initial data from the backend
    axios.get('/data').then(response => {
      setIsFree(response.data.isFree)
      setQueue(response.data.queue)
    })

    // Listen for updates from the backend
    socket.on('stateUpdate', data => {
      console.log('Socket:', data)
      setIsFree(data.isFree)
      setQueue(data.queue)
    })

    return () => {
      socket.off('stateUpdate')
    }
  }, [])

  const passIsFreeToBackend = e => {
    console.log('Sending isFree to backend:', e)
    axios.post(adr + '/isFree', { value: e })
  }

  const passQueueToBackend = e => {
    console.log('Sending queue to backend:', e)
    axios.post(adr + '/queue', { value: e })
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

    setQueue([...queue, inputRef.current.value])
    console.log(new Date().toISOString(), 'Adding ' + inputRef.current.value + 'to queue')
    setIsFree(false)

    passIsFreeToBackend(false)
    passQueueToBackend([...queue, inputRef.current.value])

    inputRef.current.value = ''
  }

  function leaveQueue(index) {
    let arr = [...queue]
    console.log(new Date().toISOString(), 'Dropping ' + arr[index] + 'from queue')
    arr.splice(index, 1)
    setQueue(arr)
    console.log(new Date().toISOString(), 'New queue: ' + arr)
    let queueIsEmpty = false
    if (arr.length === 0) {
      queueIsEmpty = true
    }
    setIsFree(queueIsEmpty)

    passIsFreeToBackend(queueIsEmpty)
    passQueueToBackend(arr)
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
        <img className='icon' src={isFree ? check : cross} alt={isFree ? 'Available' : 'Unavailable'}></img>
      </div>
      {isFree ? (
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
          {isFree ? 'Overta' : 'Gå i kø'}
        </button>
        <br></br>
        {isFree ? (
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
