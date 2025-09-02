import {GAME_MIN_WIDTH, GAME_MIN_HEIGHT, GAME_MAX_WIDTH, GAME_MAX_HEIGHT} from './constants.mjs'

class Player {
  // Constructor sets up player based on passed in params
  constructor({x, y, score, id}) {
    this.x = x <= GAME_MIN_WIDTH || x >= GAME_MAX_WIDTH ? GAME_MIN_WIDTH : x;
    this.y = y <= GAME_MIN_HEIGHT || y >= GAME_MAX_HEIGHT ? GAME_MIN_HEIGHT : y;
    this.score = score;
    this.id = id;
  }

  // Handles player movement
  // If movement would result in player going out of bounds than movement doesn't happen
  movePlayer(dir, speed) {
    if (dir === "up" && this.y - speed > GAME_MIN_HEIGHT) {
      this.y -= speed;
    }
    if (dir === "down" && this.y + speed < GAME_MAX_HEIGHT) {
      this.y += speed;
    }
    if (dir === "left" && this.x - speed > GAME_MIN_WIDTH) {
      this.x -= speed;
    }
    if (dir === "right" && this.x - speed < GAME_MAX_WIDTH) {
      this.x += speed;
    }
  }

  collision(item) {

  }

  calculateRank(arr) {

  }
}

export default Player;
