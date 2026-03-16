const ROT = require('rot-js');
const { GameMap } = require('./map');
const { Player, Enemy } = require('./entities');
const { fr } = require('./lang');
const { MAP_W, MAP_H, FOV_RADIUS, MAX_ENEMIES_PER_ROOM, TOTAL_FLOORS } = require('./config');

const ENEMY_POOL = [
  ['goblin', 'goblin', 'goblin', 'orc'],
  ['goblin', 'orc', 'orc', 'troll'],
  ['orc', 'orc', 'troll', 'troll'],
];

class Game {
  constructor(lang = fr) {
    this.lang = lang;
    this.map = null;
    this.player = null;
    this.enemies = [];
    this.items = [];
    this.visible = new Set();
    this.messages = [];
    this.floor = 1;
    this.gameOver = false;
    this.won = false;
  }

  init() {
    this.map = new GameMap();
    this.enemies = [];
    this.items = [];
    this.visible = new Set();

    const [px, py] = this.map.rooms[0].getCenter();
    if (!this.player) {
      this.player = new Player(px, py);
    } else {
      this.player.x = px;
      this.player.y = py;
    }

    const pool = ENEMY_POOL[Math.min(this.floor - 1, ENEMY_POOL.length - 1)];

    this.map.rooms.slice(1).forEach((room, idx) => {
      const isLastRoom = idx === this.map.rooms.length - 2;

      if (isLastRoom) {
        const [sx, sy] = room.getCenter();
        this.items.push({ x: sx, y: sy, type: 'stairs', char: '>', color: 'yellow' });
      }

      const count = Math.floor(ROT.RNG.getUniform() * (MAX_ENEMIES_PER_ROOM + 1));
      for (let i = 0; i < count; i++) {
        const rw = room.getRight() - room.getLeft();
        const rh = room.getBottom() - room.getTop();
        const ex = room.getLeft() + 1 + Math.floor(ROT.RNG.getUniform() * Math.max(1, rw - 1));
        const ey = room.getTop()  + 1 + Math.floor(ROT.RNG.getUniform() * Math.max(1, rh - 1));
        const type = pool[Math.floor(ROT.RNG.getUniform() * pool.length)];
        this.enemies.push(new Enemy(type, ex, ey));
      }

      if (ROT.RNG.getUniform() < 0.3) {
        const [cx, cy] = room.getCenter();
        this.items.push({ x: cx, y: cy, type: 'potion', char: '!', color: '#ff44ff' });
      }
    });

    this.computeFov();

    if (this.floor === 1) {
      this.log(this.lang.msgEnter);
      this.log(this.lang.msgControls);
    } else {
      this.log(this.lang.msgFloor(this.floor));
    }
  }

  log(msg) {
    this.messages.unshift(msg);
    if (this.messages.length > 8) this.messages.pop();
  }

  computeFov() {
    this.visible.clear();
    const fov = new ROT.FOV.PreciseShadowcasting((x, y) => this.map.isWalkable(x, y));
    fov.compute(this.player.x, this.player.y, FOV_RADIUS, (x, y) => {
      const key = `${x},${y}`;
      this.visible.add(key);
      this.map.explore(x, y);
    });
  }

  movePlayer(dx, dy) {
    if (this.gameOver) return;

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    const enemy = this.enemies.find(e => e.alive && e.x === nx && e.y === ny);
    if (enemy) {
      this.attackEnemy(enemy);
      this.enemyTurn();
      return;
    }

    if (!this.map.isWalkable(nx, ny)) return;

    this.player.x = nx;
    this.player.y = ny;
    this.computeFov();
    this.checkItems();
    this.enemyTurn();
  }

  checkItems() {
    const { x, y } = this.player;
    const idx = this.items.findIndex(i => i.x === x && i.y === y);
    if (idx === -1) return;

    const item = this.items[idx];
    if (item.type === 'potion') {
      this.items.splice(idx, 1);
      this.player.potions++;
      this.log(this.lang.msgPickPotion);
    } else if (item.type === 'stairs') {
      this.nextFloor();
    }
  }

  attackEnemy(enemy) {
    const name = this.lang.enemies[enemy.type];
    const roll = Math.floor(ROT.RNG.getUniform() * 4);
    const dmg  = Math.max(1, this.player.atk + roll - 1);
    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      this.player.gainXp(enemy.xp, lvl => this.log(this.lang.msgLevelUp(lvl)));
      this.log(this.lang.msgKill(name, enemy.xp));
    } else {
      this.log(this.lang.msgHit(name, dmg, enemy.hp, enemy.maxHp));
    }
  }

  enemyTurn() {
    for (const enemy of this.enemies.filter(e => e.alive)) {
      if (!this.visible.has(`${enemy.x},${enemy.y}`)) continue;

      const dx = Math.abs(this.player.x - enemy.x);
      const dy = Math.abs(this.player.y - enemy.y);

      if (dx + dy === 1) {
        const name = this.lang.enemies[enemy.type];
        const dmg  = Math.max(1, enemy.atk + Math.floor(ROT.RNG.getUniform() * 3) - this.player.def);
        this.player.hp -= dmg;
        this.log(this.lang.msgEnemyHit(name, dmg));
        if (this.player.hp <= 0) {
          this.player.hp = 0;
          this.gameOver = true;
          this.log(this.lang.msgDeath);
          return;
        }
      } else {
        const passable = (x, y) =>
          this.map.isWalkable(x, y) &&
          !this.enemies.find(e => e.alive && e.x === x && e.y === y);

        const astar = new ROT.Path.AStar(this.player.x, this.player.y, passable, { topology: 4 });
        const path  = [];
        astar.compute(enemy.x, enemy.y, (x, y) => path.push([x, y]));

        if (path.length > 1) {
          [enemy.x, enemy.y] = path[1];
        }
      }
    }
  }

  usePotion() {
    if (this.gameOver) return;
    if (this.player.potions <= 0) {
      this.log(this.lang.msgNoPotion);
      return;
    }
    if (this.player.hp === this.player.maxHp) {
      this.log(this.lang.msgFullHp);
      return;
    }
    this.player.potions--;
    const heal = 15 + Math.floor(ROT.RNG.getUniform() * 10);
    this.player.heal(heal);
    this.log(this.lang.msgHeal(heal));
  }

  nextFloor() {
    this.floor++;
    if (this.floor > TOTAL_FLOORS) {
      this.won      = true;
      this.gameOver = true;
      this.log(this.lang.msgVictory);
      return;
    }
    this.init();
  }

  restart() {
    this.floor    = 1;
    this.gameOver = false;
    this.won      = false;
    this.player   = null;
    this.messages = [];
    this.init();
  }
}

module.exports = { Game };
