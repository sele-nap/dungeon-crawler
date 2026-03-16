const blessed = require('blessed');
const { MAP_W, MAP_H } = require('./config');

const ENEMY_COLORS = {
  goblin: 'green',
  orc: '#ff6600',
  troll: 'magenta',
};

class Renderer {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Dungeon Crawler',
      fullUnicode: true,
      forceUnicode: true,
    });

    // Map area
    this.mapBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: MAP_W + 2,
      height: MAP_H + 2,
      border: { type: 'line', fg: '#333' },
      style: { bg: '#0d0d0d' },
      tags: true,
    });

    // Stats panel
    this.statsBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: MAP_W + 2,
      width: 22,
      height: MAP_H + 2,
      border: { type: 'line', fg: '#333' },
      style: { bg: '#0d0d0d', fg: 'white' },
      tags: true,
      label: ' {#888888-fg}Stats{/} ',
    });

    // Message log
    this.logBox = blessed.box({
      parent: this.screen,
      top: MAP_H + 2,
      left: 0,
      width: MAP_W + 2 + 22,
      height: 10,
      border: { type: 'line', fg: '#333' },
      style: { bg: '#080808', fg: '#666' },
      tags: true,
      label: ' {#888888-fg}Journal{/} ',
    });
  }

  render(game) {
    this.renderMap(game);
    this.renderStats(game.player, game.floor);
    this.renderLog(game.messages, game.gameOver, game.won);
    this.screen.render();
  }

  renderMap(game) {
    const { map, player, enemies, items, visible } = game;
    let lines = [];

    for (let y = 0; y < MAP_H; y++) {
      let line = '';
      for (let x = 0; x < MAP_W; x++) {
        const key = `${x},${y}`;
        const isVisible = visible.has(key);
        const isExplored = map.explored.has(key);

        if (!isExplored) {
          line += ' ';
          continue;
        }

        const tile = map.tiles[key];

        if (isVisible) {
          // Player
          if (x === player.x && y === player.y) {
            line += '{bright-white-fg}@{/}';
            continue;
          }
          // Enemy
          const enemy = enemies.find(e => e.alive && e.x === x && e.y === y);
          if (enemy) {
            const c = ENEMY_COLORS[enemy.type] || 'red';
            line += `{${c}-fg}${enemy.char}{/}`;
            continue;
          }
          // Item
          const item = items.find(i => i.x === x && i.y === y);
          if (item) {
            line += `{${item.color}-fg}${item.char}{/}`;
            continue;
          }
          // Tile (lit)
          line += tile === 'wall'
            ? '{#555555-fg}#{/}'
            : '{#3a3a3a-fg}\u00b7{/}';
        } else {
          // Memory (fog)
          line += tile === 'wall'
            ? '{#222222-fg}#{/}'
            : '{#181818-fg}\u00b7{/}';
        }
      }
      lines.push(line);
    }

    this.mapBox.setContent(lines.join('\n'));
  }

  renderStats(player, floor) {
    const hpBar  = this.progressBar(player.hp,  player.maxHp, 14, 'red',  '#800000');
    const xpBar  = this.progressBar(player.xp,  player.xpNext, 14, '#4488ff', '#002244');

    const lines = [
      `{bold}{#aaaaaa-fg}⚔  DUNGEON CRAWLER{/}`,
      ``,
      `{#888888-fg}Étage{/}  {yellow-fg}${floor} / 5{/}`,
      ``,
      `{red-fg}♥ PV{/}  {white-fg}${player.hp}/${player.maxHp}{/}`,
      hpBar,
      ``,
      `{#4488ff-fg}✦ XP{/}  {white-fg}${player.xp}/${player.xpNext}{/}`,
      xpBar,
      ``,
      `{#888888-fg}Niveau{/}  {white-fg}${player.level}{/}`,
      `{#888888-fg}Attaque{/} {white-fg}${player.atk}{/}`,
      `{#888888-fg}Défense{/} {white-fg}${player.def}{/}`,
      ``,
      `{#ff44ff-fg}! Potions{/} {white-fg}${player.potions}{/}`,
      ``,
      `{#333333-fg}────────────────{/}`,
      `{#444444-fg}↑↓←→  déplacer{/}`,
      `{#444444-fg}H     potion{/}`,
      `{#444444-fg}>     escaliers{/}`,
      `{#444444-fg}R     rejouer{/}`,
      `{#444444-fg}Q     quitter{/}`,
    ];

    this.statsBox.setContent(lines.join('\n'));
  }

  progressBar(current, max, width, colorFill, colorEmpty) {
    const filled = Math.round(Math.max(0, Math.min(current / max, 1)) * width);
    const empty  = width - filled;
    return (
      `{${colorFill}-fg}${'█'.repeat(filled)}{/}` +
      `{${colorEmpty}-fg}${'█'.repeat(empty)}{/}`
    );
  }

  renderLog(messages, gameOver, won) {
    let lines = messages.map(m => `{#666666-fg}›{/} {#999999-fg}${m}{/}`);

    if (gameOver) {
      const banner = won
        ? `{yellow-fg}{bold}★  VICTOIRE !  Vous avez conquis le donjon.  ★{/}`
        : `{red-fg}{bold}†  VOUS ÊTES MORT  †   [R] rejouer  [Q] quitter{/}`;
      lines = [banner, '', ...lines];
    }

    this.logBox.setContent(lines.join('\n'));
  }
}

module.exports = { Renderer };
