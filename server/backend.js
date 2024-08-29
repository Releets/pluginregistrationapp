import { existsSync, readFileSync, writeFileSync } from 'fs'
import express, { json } from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(cors())
app.use(json())
app.options('*', cors()) // Enable pre-flight across-the-board
const DATA_FILE = './data/data.json'

function initializeDataFile() {
  if (!existsSync(DATA_FILE)) {
    const initialState = {
      isFree: true,
      queue: [],
    }
    writeFileSync(DATA_FILE, JSON.stringify(initialState, null, 2))
    console.log('Data file created successfully.')
  }
}

function loadData() {
  try {
    const rawData = readFileSync(DATA_FILE)
    console.log(JSON.parse(rawData))
    return JSON.parse(rawData)
  } catch (err) {
    console.error('Error reading data file:', err.message)
    return {
      isFree: false,
      queue: [],
    }
  }
}

function saveData(data) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error saving data file:', err.message)
  }
}

initializeDataFile()
let state = loadData()

// API to get the current state (isFree and queue)
app.get('/data', (req, res) => {
  res.json(state)
})

// API to update availability state
app.post('/isFree', (req, res) => {
  state.isFree = req.body.value
  io.emit('stateUpdate', state) // Broadcast the updated state to all clients
  saveData(state)
  res.sendStatus(200)
})

// API to update the queue
app.post('/queue', (req, res) => {
  state.queue = req.body.value
  io.emit('stateUpdate', state) // Broadcast the updated state to all clients
  saveData(state)
  res.sendStatus(200)
})

io.on('connection', socket => {
  console.log('A user connected')
  socket.emit('stateUpdate', state) // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

io.listen(3001, () => {
  console.log('Server is running on port 3001')
})
