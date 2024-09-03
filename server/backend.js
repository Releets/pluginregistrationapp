import { readFileSync, writeFileSync } from 'fs'
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
app.use(function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin', 'X-Requested-With', 'Content-Type')
  next()
})

const DATA_FILE = './data/data.json'

const timestamp = () => new Date().toISOString()

function getData() {
  try {
    const rawData = readFileSync(DATA_FILE)
    return JSON.parse(rawData)
  } catch (err) {
    console.log(timestamp(), 'Initializing data file')
    writeFileSync(DATA_FILE, JSON.stringify([]))
    return []
  }
}

function addToQueue(user) {
  const data = getData()
  data.push(user)
  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
  console.log(timestamp(), 'Added ' + user + ' to queue')
  return data
}

function removeFromQueue(toRemove, privateKey, force = false) {
  const data = getData()
  const i = data.findIndex(entry => toRemove.username === entry.username && toRemove.entrytime === entry.entrytime)
  const item = data[i]

  if (!item) throw new Error(`Brukeren '${toRemove.username}' ble ikke funnet i køen`)
  if (item.queueExitTime) throw new Error(`Brukeren '${toRemove.username}' er ikke i køen lenger`)
  if (item.privateKey !== privateKey || force) throw new Error('Du kan bare slette deg selv fra køen')

  data[i] = { ...item, queueExitTime: Date.now() }

  writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' })
  console.log(new Date(data[i].queueExitTime).toISOString(), 'Removed ' + toRemove.username + ' from queue')
  return data
}

// API to append the queue
app.post('/add', (req, res) => {
  try {
    const updatedQueue = addToQueue(req.body.value)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    console.error(timestamp(), 'Error adding to queue:', err.message)
    res.status(500).send(err.message)
  }
})

// API to remove from the queue
app.post('/remove', (req, res) => {
  try {
    const { value, privateKey } = req.body
    const updatedQueue = removeFromQueue(value, privateKey)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    console.error(timestamp(), 'Error removing from queue:', err.message)
    res.status(500).send(err.message)
  }
})

io.on('connection', socket => {
  console.log(timestamp(), 'Connected', socket.id)
  socket.emit('stateUpdate', getData()) // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.log(timestamp(), 'Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log(timestamp(), 'Server is running on port', port)

  // Throwing people out of queue
  setInterval(() => {
    getData()
      .filter(entry => entry.estimatedFinishTime > Date.now() && !entry.queueExitTime)
      .forEach(entry => {
        try {
          removeFromQueue(entry, undefined, true)
        } catch (err) {
          console.error(timestamp(), err.message)
        }
      })

    io.emit('stateUpdate', getData()) // Broadcast the updated state to all clients
  }, 1000 * 60)
})
