require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const noCache = require('nocache');
const Player = require('./public/Player.mjs').default;
const {PLAYER_SPEED} = require('./public/constants.mjs');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// Security functionality for fCC tests 16-19
app.use(helmet());
// Thanks https://stackoverflow.com/a/9840285 for setting X-Powered-By header
app.use((req, res, next) => {
  res.header("X-Powered-By", "PHP 7.4.3");
  next();
});
app.use(noCache());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Thanks https://www.geeksforgeeks.org/node-js/introduction-to-sockets-io-in-node-js/ for Socket.io connections
const io = socket(server);

// Holds game state
let state = {
  players: {

  }
};

// Handle user connection
io.on('connection', c => {
  // Create a new player
  let x = 0;
  let y = 0;
  let score = 0;
  let id = c.id;
  state.players[id] = new Player({x, y, score, id});

  // Tell client to add player
  io.emit('update', state);

  // Handle direction
  c.on('up', () => {
    state.players[id].movePlayer("up", PLAYER_SPEED);
    io.emit('update', state);
  });

  c.on('down', () => {
    state.players[id].movePlayer("down", PLAYER_SPEED);
    io.emit('update', state);
  });

  c.on('left', () => {
    state.players[id].movePlayer("left", PLAYER_SPEED);
    io.emit('update', state);
  });

  c.on('right', () => {
    state.players[id].movePlayer("right", PLAYER_SPEED);
    io.emit('update', state);
  });

  // Handle user disconnection by removing player
  c.on('disconnect', () => {
    delete state.players[id];
    io.emit('update', state);
  });
});

module.exports = app; // For testing
