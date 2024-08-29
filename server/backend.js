import { mkdir, mkdirSync, readFileSync, writeFileSync } from 'fs'
import express, { json } from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

const app = express()
const server = createServer(app)
const io = new Server(server)

const port = 6969
if (!port) throw new Error('SERVER_PORT environment variable not set')

app.use(cors())
app.use(json())
app.options('*', cors()) // Enable pre-flight across-the-board
const DATA_FILE = './data/data.json'

function getData() {
  try {
    const rawData = readFileSync(DATA_FILE)
    console.log('Read data file', JSON.parse(rawData))
    return JSON.parse(rawData)
  } catch (err) {
    console.warn('Initializing data file')
    mkdirSync('./data')
    writeFileSync(DATA_FILE, JSON.stringify([]))
    return []
  }
}

function addToQueue(initials) {
  const data = getData()
  if (data.includes(initials)) throw new Error('Initials already in queue')
  data.push(initials)
  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
  console.log('Added %s to queue', initials)
  return data
}

function removeFromQueue(initials) {
  const data = getData()
  if (!data.includes(initials)) throw new Error('Initials not in queue')
  data.splice(data.indexOf(initials), 1)
  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
  console.log('Removed %s from queue', initials)
  return data
}

// API to append the queue
app.post('/add', (req, res) => {
  try {
    const updatedQueue = addToQueue(req.body.value)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    console.error('Error adding to queue:', err.message)
    res.status(500).send(err.message)
  }
})

// API to remove from the queue
app.post('/remove', (req, res) => {
  try {
    const updatedQueue = removeFromQueue(req.body.value)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    console.error('Error removing from queue:', err.message)
    res.status(500).send(err.message)
  }
})

io.on('connection', socket => {
  console.log('Connected', socket.id)
  socket.emit('stateUpdate', getData()) // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.log('Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log('Server is running on port', port)
})
