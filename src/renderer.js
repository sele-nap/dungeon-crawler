const blessed = require('blessed');
const { MAP_W, MAP_H } = require('./config');
const { fr } = require('./lang');

const ENEMY_COLORS = {
  goblin: 'green',
  orc:    '#ff6600',
  troll:  'magenta',
};

class Renderer {
  constructor(lang = fr) {
    this.lang = lang;

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Dungeon Crawler',
      fullUnicode: true,
      forceUnicode: true,
    });

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

    this.statsBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: MAP_W + 2,
      width: 28,
      height: MAP_H + 2,
      border: { type: 'line', fg: '#333' },
      style: { bg: '#0d0d0d', fg: 'white' },
      tags: true,
      label: ` {#888888-fg}${lang.statsLabel.trim()}{/} `,
    });

    this.logBox = blessed.box({
      parent: this.screen,
      top: MAP_H + 2,
      left: 0,
      width: MAP_W + 2 + 28,
      height: 10,
      border: { type: 'line', fg: '#333' },
      style: { bg: '#080808', fg: '#666' },
      tags: true,
      label: ` {#888888-fg}${lang.logLabel.trim()}{/} `,
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
    const lines = [];

    for (let y = 0; y < MAP_H; y++) {
      let line = '';
      for (let x = 0; x < MAP_W; x++) {
        const key = `${x},${y}`;
        const isVisible  = visible.has(key);
        const isExplored = map.explored.has(key);

        if (!isExplored) { line += ' '; continue; }

        const tile = map.tiles[key];

        if (isVisible) {
          if (x === player.x && y === player.y) {
            line += '{bright-white-fg}@{/}'; continue;
          }
          const enemy = enemies.find(e => e.alive && e.x === x && e.y === y);
          if (enemy) {
            line += `{${ENEMY_COLORS[enemy.type] || 'red'}-fg}${enemy.char}{/}`; continue;
          }
          const item = items.find(i => i.x === x && i.y === y);
          if (item) {
            line += `{${item.color}-fg}${item.char}{/}`; continue;
          }
          line += tile === 'wall' ? '{#555555-fg}#{/}' : '{#3a3a3a-fg}\u00b7{/}';
        } else {
          line += tile === 'wall' ? '{#222222-fg}#{/}' : '{#181818-fg}\u00b7{/}';
        }
      }
      lines.push(line);
    }

    this.mapBox.setContent(lines.join('\n'));
  }

  renderStats(player, floor) {
    const t    = this.lang;
    const hpBar = this.progressBar(player.hp,  player.maxHp,  14, 'red',      '#800000');
    const xpBar = this.progressBar(player.xp,  player.xpNext, 14, '#4488ff',  '#002244');

    const lines = [
      `{bold}{#aaaaaa-fg}⚔  DUNGEON CRAWLER{/}`,
      ``,
      `{#888888-fg}${t.floor}{/}  {yellow-fg}${floor} / 5{/}`,
      ``,
      `{red-fg}${t.hp}{/}  {white-fg}${player.hp}/${player.maxHp}{/}`,
      hpBar,
      ``,
      `{#4488ff-fg}${t.xp}{/}  {white-fg}${player.xp}/${player.xpNext}{/}`,
      xpBar,
      ``,
      `{#888888-fg}${t.level}{/}   {white-fg}${player.level}{/}`,
      `{#888888-fg}${t.attack}{/}  {white-fg}${player.atk}{/}`,
      `{#888888-fg}${t.defense}{/} {white-fg}${player.def}{/}`,
      ``,
      `{#ff44ff-fg}${t.potions}{/} {white-fg}${player.potions}{/}`,
      ``,
      `{#333333-fg}────────────────{/}`,
      ...t.controls.map(c => `{#444444-fg}${c}{/}`),
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
        ? `{yellow-fg}{bold}${this.lang.bannerVictory}{/}`
        : `{red-fg}{bold}${this.lang.bannerDeath}{/}`;
      lines = [banner, '', ...lines];
    }

    this.logBox.setContent(lines.join('\n'));
  }

  pickLanguage() {
    return new Promise(resolve => {
      const box = blessed.box({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: 54,
        height: 13,
        border: { type: 'line', fg: '#555' },
        style: { bg: '#0d0d0d' },
        tags: true,
      });

      const options = ['en', 'fr'];
      const labels  = ['[ EN ]  English', '[ FR ]  Français'];
      const subtitles = ['Choose your language', 'Choisissez votre langue'];
      const hints     = [
        '↑↓ navigate  •  Enter confirm  •  Esc quit',
        '↑↓ choisir   •  Entrée confirmer  •  Échap quitter',
      ];

      const render = (sel) => {
        box.setContent([
          ``,
          `{center}{bold}{#aaaaaa-fg}⚔  DUNGEON CRAWLER{/}{/center}`,
          ``,
          `{center}{#555555-fg}${subtitles[sel]}{/}{/center}`,
          ``,
          ...labels.map((l, i) =>
            i === sel
              ? `{center}{bold}{white-fg}►  ${l}  ◄{/}{/center}`
              : `{center}{#555555-fg}   ${l}   {/}{/center}`
          ),
          ``,
          `{center}{#444444-fg}${hints[sel]}{/}{/center}`,
        ].join('\n'));
        this.screen.render();
      };

      let sel = 1;
      render(sel);

      const handler = (ch, key) => {
        if (key.name === 'up'   || key.name === 'down') {
          sel = sel === 0 ? 1 : 0;
          render(sel);
        }
        if (key.name === 'enter') {
          this.screen.unkey(['up', 'down', 'enter', 'escape'], handler);
          box.destroy();
          this.screen.render();
          resolve(options[sel]);
        }
        if (key.name === 'escape') {
          this.screen.unkey(['up', 'down', 'enter', 'escape'], handler);
          box.destroy();
          process.exit(0);
        }
      };

      this.screen.key(['up', 'down', 'enter', 'escape'], handler);
    });
  }
}

module.exports = { Renderer };
