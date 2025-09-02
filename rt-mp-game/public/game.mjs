import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import {PLAYER_COLOR, BG_COLOR, PLAYER_SIZE} from './constants.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// https://www.seangoedecke.com/socket-io-game/ discusses building a game using Socket.io and HTML Canvas along with sample code, this was a massive help for this project

// Holds current input state
let input = {
    up: false,
    down: false,
    left: false,
    right: false
}

// Happens when server sends an update (such as player moved, another connection)
socket.on('update', state => {
    init();

    // Draw the players
    Object.keys(state.players).forEach(id => {
        context.fillStyle = PLAYER_COLOR;
        context.fillRect(state.players[id].x, state.players[id].y, PLAYER_SIZE, PLAYER_SIZE);
    });
});

// Handles button presses
const handleInput = (key, value) => {
    if (key === "ArrowUp" || key === "w") {
        input.up = value;
    }
    if (key === "ArrowDown" || key === "s") {
        input.down = value;
    }
    if (key === "ArrowLeft" || key === "a") {
        input.left = value;
    }
    if (key === "ArrowRight" || key === "d") {
        input.right = value;
    }
}

// Perfoms movement based on current input state
const move = () => {
    input.up && socket.emit("up");
    input.down && socket.emit("down");
    input.left && socket.emit("left");
    input.right && socket.emit("right");

    requestAnimationFrame(move);
}

// Initial tasks to set up the game
const init = () => {
    // Draw canvas background
    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Add event listener for movement
    // Need to do both keydown and keyup in order to handle diagonal movement
    // Thanks https://stackoverflow.com/a/51457938 for general idea
    // Thanks https://www.w3schools.com/jsref/met_win_requestanimationframe.asp for requestAnimationFrame,
    // without this there would be too many update calls due to key repeat
    document.addEventListener("keydown", e => {
        handleInput(e.key, true);
    });
    document.addEventListener("keyup", e => {
        handleInput(e.key, false);
    });
}

init();
requestAnimationFrame(move);
