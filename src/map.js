const ROT = require('rot-js');
const { MAP_W, MAP_H } = require('./config');

class GameMap {
  constructor() {
    this.tiles = {};
    this.explored = new Set();
    this.rooms = [];
    this.generate();
  }

  generate() {
    // Fill everything with walls first
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.tiles[`${x},${y}`] = 'wall';
      }
    }

    const digger = new ROT.Map.Digger(MAP_W, MAP_H, {
      roomWidth: [5, 12],
      roomHeight: [4, 8],
      corridorLength: [2, 6],
      dugPercentage: 0.3,
    });

    digger.create((x, y, wall) => {
      this.tiles[`${x},${y}`] = wall ? 'wall' : 'floor';
    });

    this.rooms = digger.getRooms();
  }

  isWalkable(x, y) {
    return this.tiles[`${x},${y}`] === 'floor';
  }

  explore(x, y) {
    this.explored.add(`${x},${y}`);
  }
}

module.exports = { GameMap };
