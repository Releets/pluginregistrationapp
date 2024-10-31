import cors from 'cors'
import express, { Express, json, Request, Response } from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { enterQueue, exitQueue, loadData, removeOldEntries } from './dataService.ts'
import process from 'node:process'

const correctGodmodePassword = process.env.GODMODE
if (!correctGodmodePassword) throw new Error('GODMODE environment variable not set')

const app: Express = express()
const server = createServer(app)
const io = new Server(server)

const port = 6969

app.use(cors())
app.use(json())
app.options('*', cors()) // Enable pre-flight across-the-board

const timestamp = () => new Date().toISOString()

// API to append the queue
app.post('/add', (req: Request, res: Response) => {
  try {
    const updatedQueue = enterQueue(req.body.value)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error adding to queue:', err.message)
    res.status(500).send(err.message)
  }
})

// API to remove from the queue
app.post('/remove', (req: Request, res: Response) => {
  try {
    const { value, privateKey, godmodePassword } = req.body
    console.debug(timestamp(), 'Received remove request:', req.body)

    const updatedQueue = exitQueue(value, privateKey, godmodePassword === correctGodmodePassword)
    io.emit('stateUpdate', updatedQueue) // Broadcast the updated state to all clients
    res.sendStatus(200)
  } catch (err) {
    if (!(err instanceof Error)) throw err
    console.error(timestamp(), 'Error removing from queue:', err.message)
    res.status(500).send(err.message)
  }
})

io.on('connection', socket => {
  console.debug(timestamp(), 'Connected', socket.id)
  socket.emit('stateUpdate', loadData()) // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.debug(timestamp(), 'Disconnected', socket.id)
  })
})

server.listen(port, () => {
  console.log(timestamp(), 'Server is running on port', port)

  // Throwing people out of queue every minute
  setInterval(() => {
    console.debug(timestamp(), 'Checking for old entries')

    const newState = removeOldEntries()
    if (newState) {
      console.debug(timestamp(), 'Removed entries, broadcasting new state')
      io.emit('stateUpdate', newState)
    } else {
      console.debug(timestamp(), 'No entries were removed')
    }
  }, 1000 * 60)
})
