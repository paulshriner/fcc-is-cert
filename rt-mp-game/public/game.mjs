import * as constants from './constants.mjs';

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

    // Draw the collectibles
    for (const collectible in state.collectibles) {
        context.fillStyle = constants.COLLECTIBLE_BASE;
        context.fillRect(state.collectibles[collectible].x, state.collectibles[collectible].y, constants.COLLECTIBLE_WIDTH, constants.COLLECTIBLE_HEIGHT);
        context.fillStyle = constants.COLLECTIBLE_TOP;
        context.fillRect(state.collectibles[collectible].x, state.collectibles[collectible].y, constants.COLLECTIBLE_WIDTH, constants.COLLECTIBLE_HEIGHT / 4);
    }

    // Draw the players
    Object.keys(state.players).forEach(id => {
        context.fillStyle = socket.id === id ? constants.PLAYER_COLOR : constants.OPPONENT_COLOR;
        context.fillRect(state.players[id].x, state.players[id].y, constants.PLAYER_WIDTH, constants.PLAYER_HEIGHT);
    });

    // Draw player rank
    if (state.rank[socket.id]) {
        context.fillStyle = constants.FONT_COLOR;
        context.font = `24px ${constants.FONT_FAMILY}`;
        context.fillText(state.rank[socket.id], 510, 35);
    }
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
    context.fillStyle = constants.BG_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Draw HUD with control text and title
    // rank isn't constant so that needs added with state update
    context.fillStyle = constants.HUD_COLOR;
    context.fillRect(0, 0, canvas.clientWidth, constants.HUD_HEIGHT);
    context.fillStyle = constants.FONT_COLOR;
    // Thanks https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text for drawing text
    context.font = `24px ${constants.FONT_FAMILY}`;
    context.fillText("Controls: WASD", 10, 35);
    context.font = `bold 24px ${constants.FONT_FAMILY}`;
    context.fillText("Charge Race", 270, 35);

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
