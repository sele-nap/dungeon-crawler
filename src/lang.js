const VOWELS = /^[AEIOUÀÂÉÈÊËÎÏÔÙÛÜaeiouàâéèêëîïôùûü]/;
const art = name => VOWELS.test(name) ? "l'" : 'le ';
const Art = name => VOWELS.test(name) ? "L'" : 'Le ';

const en = {
  statsLabel:  ' Stats ',
  logLabel:    ' Log ',
  floor:       'Floor',
  hp:          '♥ HP',
  xp:          '✦ XP',
  level:       'Level',
  attack:      'Attack',
  defense:     'Defense',
  potions:     '! Potions',
  controls: [
    '↑↓←→ / WASD   move',
    'P              potion',
    '>              stairs',
    'R              restart',
    'Esc            quit',
  ],

  msgEnter:      'You enter the depths...',
  msgControls:   'Arrows/WASD: move  P: potion  >: stairs',
  msgFloor:      (n)                   => `Floor ${n}. The darkness deepens...`,
  msgPickPotion: 'You pick up a healing potion.',
  msgLevelUp:    (n)                   => `Level ${n}! You feel stronger.`,
  msgKill:       (name, xp)            => `You slay the ${name}. (+${xp} XP)`,
  msgHit:        (name, dmg, hp, max)  => `You hit the ${name} for ${dmg} dmg. [${hp}/${max}]`,
  msgEnemyHit:   (name, dmg)           => `The ${name} hits you for ${dmg} damage.`,
  msgDeath:      'You died.  [R] to restart.',
  msgNoPotion:   'No more potions!',
  msgFullHp:     'Already at full HP.',
  msgHeal:       (n)                   => `You drink a potion and recover ${n} HP.`,
  msgVictory:    'You seize the Legendary Artifact. Victory!',

  bannerVictory: '★  VICTORY!  You conquered the dungeon.  ★',
  bannerDeath:   '†  YOU DIED  †   [R] restart  [Q] quit',

  enemies: {
    goblin: 'Goblin',
    orc:    'Orc',
    troll:  'Troll',
  },
};

const fr = {
  statsLabel:  ' Stats ',
  logLabel:    ' Journal ',
  floor:       'Étage',
  hp:          '♥ PV',
  xp:          '✦ XP',
  level:       'Niveau',
  attack:      'Attaque',
  defense:     'Défense',
  potions:     '! Potions',
  controls: [
    '↑↓←→ / ZQSD   déplacer',
    'P              potion',
    '>              escaliers',
    'R              rejouer',
    'Échap          quitter',
  ],

  msgEnter:      'Vous pénétrez dans les profondeurs...',
  msgControls:   'Flèches/ZQSD: déplacer  P: potion  >: escaliers',
  msgFloor:      (n)                   => `Étage ${n}. L'obscurité s'épaissit...`,
  msgPickPotion: 'Vous ramassez une potion de soin.',
  msgLevelUp:    (n)                   => `Niveau ${n} ! Vous vous sentez plus fort.`,
  msgKill:       (name, xp)            => `Vous tuez ${art(name)}${name}. (+${xp} XP)`,
  msgHit:        (name, dmg, hp, max)  => `Vous frappez ${art(name)}${name} pour ${dmg} dégâts. [${hp}/${max}]`,
  msgEnemyHit:   (name, dmg)           => `${Art(name)}${name} vous frappe pour ${dmg} dégâts.`,
  msgDeath:      'Vous êtes mort.  [R] pour recommencer.',
  msgNoPotion:   'Plus de potions !',
  msgFullHp:     'Vous êtes déjà au maximum.',
  msgHeal:       (n)                   => `Vous buvez une potion et récupérez ${n} PV.`,
  msgVictory:    "Vous saisissez l'Artefact Légendaire. Victoire !",

  bannerVictory: '★  VICTOIRE !  Vous avez conquis le donjon.  ★',
  bannerDeath:   '†  VOUS ÊTES MORT  †   [R] rejouer  [Q] quitter',

  enemies: {
    goblin: 'Gobelin',
    orc:    'Orc',
    troll:  'Troll',
  },
};

module.exports = { en, fr };
