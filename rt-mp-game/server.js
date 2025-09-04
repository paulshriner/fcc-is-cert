require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const noCache = require('nocache');
const Player = require('./public/Player.mjs').default;
const Collectible = require('./public/Collectible.mjs').default;
const constants = require('./public/constants.mjs');

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
  players: {},
  collectibles: [],
  rank: {}
};

// Helper function to generate a random int based on range
// Thanks https://www.w3schools.com/JS/js_random.asp for idea
const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Checks if a position is valid for an object in the game
const validPos = (x, y) => {
  // Create a test player, this is not added in the game
  let testScore = 0;
  let testId = 0;
  let testPlayer = new Player({x, y, testScore, testId});

  // Check if this player would collide with existing players
  // A player is an "item" so we can use the same collision method
  for (const id in state.players) {
    if (state.players[id].collision(testPlayer)) {
      return false;
    }
  }

  // Do the same check for collectibles
  for (const collectible in state.collectibles) {
    if (testPlayer.collision(state.collectibles[collectible])) {
      return false;
    }
  }

  return true;
}

// Helper function to convert state.players from JSON to array
const arrOfPlayers = () => {
  let arr = [];

  for (const id in state.players) {
    arr.push(state.players[id]);
  }

  return arr;
}

// Handle user connection
io.on('connection', c => {
  // Create a new player
  let x = 0;
  let y = 0;
  do {
    x = randInt(constants.GAME_MIN_WIDTH, constants.GAME_MAX_WIDTH);
    y = randInt(constants.GAME_MIN_HEIGHT, constants.GAME_MAX_HEIGHT);
  } while (!validPos(x, y));
  let score = 0;
  let id = c.id;
  state.players[id] = new Player({x, y, score, id});

  // Create new collectibles
  while (state.collectibles.length < constants.MAX_COLLECTIBLES) {
    do {
      x = randInt(constants.GAME_MIN_WIDTH, constants.GAME_MAX_WIDTH);
      y = randInt(constants.GAME_MIN_HEIGHT, constants.GAME_MAX_HEIGHT);
    } while (!validPos(x, y));
    value = 1;
    state.collectibles.push(new Collectible({x, y, value, id}));
  }

  // Actions to take each time something changes
  const refresh = () => {
    // See if player has collided with a collectible, if so add score and move collectible
    if (state.players[id]) {
      for (const collectible in state.collectibles) {
        if (state.players[id].collision(state.collectibles[collectible])) {
          state.players[id].score += state.collectibles[collectible].value;
          do {
            x = randInt(constants.GAME_MIN_WIDTH, constants.GAME_MAX_WIDTH);
            y = randInt(constants.GAME_MIN_HEIGHT, constants.GAME_MAX_HEIGHT);
          } while (!validPos(x, y));
          state.collectibles[collectible].x = x;
          state.collectibles[collectible].y = y;
        }
      }
    }

    // update ranks, go through each player as players could've joined/left (which affect rank)
    state.rank = {};
    for (const player in state.players) {
      state.rank[player] = state.players[player].calculateRank(arrOfPlayers())
    }

    io.emit('update', state);
  }

  // Tell client to add player
  refresh();

  // Handle direction
  c.on('up', () => {
    state.players[id].movePlayer("up", constants.PLAYER_SPEED);
    refresh();
  });

  c.on('down', () => {
    state.players[id].movePlayer("down", constants.PLAYER_SPEED);
    refresh();
  });

  c.on('left', () => {
    state.players[id].movePlayer("left", constants.PLAYER_SPEED);
    refresh();
  });

  c.on('right', () => {
    state.players[id].movePlayer("right", constants.PLAYER_SPEED);
    refresh();
  });

  // Handle user disconnection by removing player
  c.on('disconnect', () => {
    delete state.players[id];
    refresh();
  });
});

module.exports = app; // For testing
