const fs = require('fs')

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.options('*', cors()); // Enable pre-flight across-the-board
const DATA_FILE = './data/data.json';

function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialState = {
      booleanValue: true,
      queue: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialState, null, 2));
    console.log('Data file created successfully.');
  }
}

function loadData() {
  try {
    const rawData = fs.readFileSync(DATA_FILE);
    console.log(JSON.parse(rawData))
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading data file:', err.message);
    return {
      isFree: false,
      queue: []
    };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data file:', err.message);
  }
}

initializeDataFile();
let state = loadData();

// API to get the current state (isFree and queue)
app.get('/data', (req, res) => {
  res.json(state);
});

// API to update availability state
app.post('/isFree', (req, res) => {
  state.isFree = req.body.value; 
  io.emit('stateUpdate', state); // Broadcast the updated state to all clients
  saveData(state);
  res.sendStatus(200);
});

// API to update the queue
app.post('/queue', (req, res) => {
  state.queue = req.body.value; 
  io.emit('stateUpdate', state); // Broadcast the updated state to all clients
  saveData(state);
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
