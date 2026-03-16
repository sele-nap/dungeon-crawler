const { Game }     = require('./game');
const { Renderer } = require('./renderer');
const { en, fr }   = require('./lang');

const LANGS = { en, fr };

async function main() {
  const renderer = new Renderer();

  const choice = await renderer.pickLanguage();
  const lang   = LANGS[choice];

  renderer.lang = lang;
  renderer.logBox.setLabel(` {#888888-fg}${lang.logLabel.trim()}{/} `);

  const game = new Game(lang);
  const { screen } = renderer;

  game.init();

  function update() {
    renderer.render(game);
  }

  screen.key(['up',    'k', 'w', 'z'], () => { game.movePlayer( 0, -1); update(); });
  screen.key(['down',  'j', 's'],      () => { game.movePlayer( 0,  1); update(); });
  screen.key(['left',  'h', 'a', 'q'], () => { game.movePlayer(-1,  0); update(); });
  screen.key(['right', 'l', 'd'],      () => { game.movePlayer( 1,  0); update(); });
  screen.key(['.', 'space'],           () => { game.enemyTurn();        update(); });
  screen.key(['p'],                    () => { game.usePotion();        update(); });
  screen.key(['r'],                    () => { if (game.gameOver) { game.restart(); update(); } });
  screen.key(['escape', 'C-c'],        () => process.exit(0));

  update();
}

main();
