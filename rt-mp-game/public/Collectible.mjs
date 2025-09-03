import * as constants from './constants.mjs';

class Collectible {
  // Constructor sets up collectible based on passed in params
  constructor({x, y, value, id}) {
    this.x = x <= constants.GAME_MIN_WIDTH || x >= constants.GAME_MAX_WIDTH ? constants.GAME_MIN_WIDTH : x;
    this.y = y <= constants.GAME_MIN_HEIGHT || y >= constants.GAME_MAX_HEIGHT ? constants.GAME_MIN_HEIGHT : y;
    this.value = value;
    this.id = id;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
