import express, { json } from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'
import { enterQueue, exitQueue, loadData } from './dataService.js'

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

const timestamp = () => new Date().toISOString()

// API to append the queue
app.post('/add', (req, res) => {
  try {
    const updatedQueue = enterQueue(req.body.value)
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
    const updatedQueue = exitQueue(value, privateKey)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    console.error(timestamp(), 'Error removing from queue:', err.message)
    res.status(500).send(err.message)
  }
})

io.on('connection', socket => {
  console.log(timestamp(), 'Connected', socket.id)
  socket.emit('stateUpdate', loadData()) // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.log(timestamp(), 'Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log(timestamp(), 'Server is running on port', port)

  // Throwing people out of queue
  setInterval(() => {
    const data = loadData()
    data
      .filter(entry => entry.estimatedFinishTime < Date.now() && !entry.queueExitTime)
      .forEach(entry => {
        try {
          exitQueue(entry, undefined, true)
        } catch (err) {
          console.error(timestamp(), err.message)
        }
      })

    io.emit('stateUpdate', data) // Broadcast the updated state to all clients
  }, 1000 * 60)
})
