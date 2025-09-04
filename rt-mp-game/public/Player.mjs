import Collectible from './Collectible.mjs';
import * as constants from './constants.mjs';

class Player {
  // Constructor sets up player based on passed in params
  constructor({x, y, score, id}) {
    this.x = x <= constants.GAME_MIN_WIDTH || x >= constants.GAME_MAX_WIDTH ? constants.GAME_MIN_WIDTH : x;
    this.y = y <= constants.GAME_MIN_HEIGHT || y >= constants.GAME_MAX_HEIGHT ? constants.GAME_MIN_HEIGHT : y;
    this.score = score;
    this.id = id;
  }

  // Handles player movement
  // If movement would result in player going out of bounds than movement doesn't happen
  movePlayer(dir, speed) {
    if (dir === "up" && this.y - speed > constants.GAME_MIN_HEIGHT) {
      this.y -= speed;
    }
    if (dir === "down" && this.y + speed < constants.GAME_MAX_HEIGHT) {
      this.y += speed;
    }
    if (dir === "left" && this.x - speed > constants.GAME_MIN_WIDTH) {
      this.x -= speed;
    }
    if (dir === "right" && this.x - speed < constants.GAME_MAX_WIDTH) {
      this.x += speed;
    }
  }

  // Test if player collides with an item
  collision(item) {
    // Begin and end points for player
    let pxBegin = this.x;
    let pxEnd = this.x + constants.PLAYER_WIDTH;
    let pyBegin = this.y;
    let pyEnd = this.y + constants.PLAYER_HEIGHT;

    // Begin and end points for item
    // Item could be a player or collectible
    // Thanks https://javascript.info/instanceof for instanceof
    let ixBegin = item.x;
    let ixEnd = item.x + (item instanceof Collectible ? constants.COLLECTIBLE_WIDTH : constants.PLAYER_WIDTH);
    let iyBegin = item.y;
    let iyEnd = item.y + (item instanceof Collectible ? constants.COLLECTIBLE_HEIGHT : constants.PLAYER_HEIGHT);
    
    // The reference point (this.x, this.y) is the top left of the player, likewise (item.x, item.y) is the top left of the item
    // So check if the top left of the player is between the top left and top right of the item, then do the same check but for top right of the player, then do the same checks for the item
    if ((pxBegin >= ixBegin && pxBegin <= ixEnd) || (pxEnd >= ixBegin && pxEnd <= ixEnd) || (ixBegin >= pxBegin && ixBegin <= pxEnd) || (ixEnd >= pxBegin && ixEnd <= pxEnd)) {
      // Same concept as x but for y/height
      if ((pyBegin >= iyBegin && pyBegin <= iyEnd) || (pyEnd >= iyBegin && pyEnd <= iyEnd) || (iyBegin >= pyBegin && iyBegin <= pyEnd) || (iyEnd >= pyBegin && iyEnd <= pyEnd)) {
        return true;
      }
    }

    return false;
  }

  // Return rank string for player
  calculateRank(arr) {
    // Sort arr in ascending order by score
    let sorted = arr.sort((a, b) => b.score - a.score);
    
    // Return its index, out of total players
    return `Rank: ${sorted.indexOf(this) + 1} / ${arr.length}`;
  }
}

export default Player;
