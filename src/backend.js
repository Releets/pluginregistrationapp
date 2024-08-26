const express = require('express');
const e = express();
const http = require('http').Server(e);
const io = require('socket.io')(http);

const cors = require('cors');
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,
    optionSuccessStatus:200
}
e.use(cors(corsOptions));

let state = {
  isFree: true, 
  queue: [] 
};

e.use(express.json());

// API to get the current state (isFree and queue)
e.get('/data', (req, res) => {
  res.json(state);
});

// API to update availability state
e.post('/isFree', (req, res) => {
  state.isFree = req.body.value; 
  io.emit('stateUpdate', state); // Broadcast the updated state to all clients
  res.sendStatus(200);
});

// API to update the queue
e.post('/queue', (req, res) => {
  state.queue = req.body.queue; 
  io.emit('stateUpdate', state); // Broadcast the updated state to all clients
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('stateUpdate', state); // Send the current state to newly connected client
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(3001, () => {
  console.log('Server is running on port 3001');
});
