import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import {PLAYER_COLOR, BG_COLOR, PLAYER_SIZE} from './constants.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// https://www.seangoedecke.com/socket-io-game/ discusses building a game using Socket.io and HTML Canvas along with sample code, this was a massive help for this project

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
const keydown = e => {
    if (e.key === "ArrowUp" || e.key === "w") {
        socket.emit("up");
    }
    if (e.key === "ArrowDown" || e.key === "s") {
        socket.emit("down");
    }
    if (e.key === "ArrowLeft" || e.key === "a") {
        socket.emit("left");
    }
    if (e.key === "ArrowRight" || e.key === "d") {
        socket.emit("right");
    }
}

// Initial tasks to set up the game
const init = () => {
    // Draw canvas background
    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Add event listener for movement
    document.addEventListener("keydown", keydown);
}

init();
