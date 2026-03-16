const { Game }     = require('./game');
const { Renderer } = require('./renderer');

const game     = new Game();
const renderer = new Renderer();
const { screen } = renderer;

game.init();

function update() {
  renderer.render(game);
}

// Movement
screen.key(['up',    'k'], () => { game.movePlayer( 0, -1); update(); });
screen.key(['down',  'j'], () => { game.movePlayer( 0,  1); update(); });
screen.key(['left',  'h'], () => { game.movePlayer(-1,  0); update(); });
screen.key(['right', 'l'], () => { game.movePlayer( 1,  0); update(); });

// Wait (skip turn)
screen.key(['.', 'space'], () => { game.enemyTurn(); update(); });

// Potion
screen.key(['H'], () => { game.usePotion(); update(); });

// Restart
screen.key(['r', 'R'], () => {
  if (game.gameOver) { game.restart(); update(); }
});

// Quit
screen.key(['q', 'Q', 'C-c'], () => process.exit(0));

// Initial render
update();
