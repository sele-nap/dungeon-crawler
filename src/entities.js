const ENEMY_TYPES = {
  goblin: { char: 'g', color: 'green',   hp: 10, atk: 3, xp: 5,  name: 'Gobelin' },
  orc:    { char: 'o', color: '#ff6600', hp: 20, atk: 5, xp: 10, name: 'Orque'   },
  troll:  { char: 'T', color: 'magenta', hp: 35, atk: 8, xp: 20, name: 'Troll'   },
};

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.char = '@';
    this.hp = 30;
    this.maxHp = 30;
    this.atk = 5;
    this.def = 2;
    this.level = 1;
    this.xp = 0;
    this.xpNext = 20;
    this.potions = 3;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  gainXp(amount, onLevelUp) {
    this.xp += amount;
    if (this.xp >= this.xpNext) {
      this.level++;
      this.xp -= this.xpNext;
      this.xpNext = Math.floor(this.xpNext * 1.5);
      this.maxHp += 5;
      this.hp = this.maxHp;
      this.atk += 1;
      onLevelUp(this.level);
    }
  }
}

class Enemy {
  constructor(type, x, y) {
    const template = ENEMY_TYPES[type];
    Object.assign(this, template);
    this.maxHp = template.hp;
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
  }
}

module.exports = { Player, Enemy, ENEMY_TYPES };
