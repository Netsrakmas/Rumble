// manifest.js — THE asset contract. Game code refers to logical sprite names
// only; every frame rect, pivot and fps lives here. Drop a PNG matching a
// sheet's exact geometry into src/assets/art/ and the game re-skins itself
// with zero code edits (see art/README.md and tools/export-sheets.html).

function grid(x0, y0, w, h, n, dx = w) {
  const out = [];
  for (let i = 0; i < n; i++) out.push([x0 + i * dx, y0, w, h]);
  return out;
}

export const MANIFEST = {
  sheets: {
    player:  { src: 'src/assets/art/player.png',  w: 240, h: 72 },
    tiles:   { src: 'src/assets/art/tiles.png',   w: 256, h: 32 },
    props:   { src: 'src/assets/art/props.png',   w: 160, h: 64 },
    enemies: { src: 'src/assets/art/enemies.png', w: 160, h: 24 },
    boss:    { src: 'src/assets/art/boss.png',    w: 384, h: 32 },
  },

  sprites: {
    // ---- player (24×24 cells, pivot = feet center) ----
    'player.idle':    { sheet: 'player', frames: grid(0, 0, 24, 24, 4),   fps: 8,  pivot: [12, 23], loop: true },
    'player.run':     { sheet: 'player', frames: grid(96, 0, 24, 24, 6),  fps: 12, pivot: [12, 23], loop: true },
    'player.rise':    { sheet: 'player', frames: grid(0, 24, 24, 24, 1),  fps: 1,  pivot: [12, 23] },
    'player.apex':    { sheet: 'player', frames: grid(24, 24, 24, 24, 1), fps: 1,  pivot: [12, 23] },
    'player.fall':    { sheet: 'player', frames: grid(48, 24, 24, 24, 1), fps: 1,  pivot: [12, 23] },
    'player.wall':    { sheet: 'player', frames: grid(72, 24, 24, 24, 1), fps: 1,  pivot: [12, 23] },
    'player.crawl':   { sheet: 'player', frames: grid(96, 24, 24, 24, 2), fps: 8,  pivot: [12, 23], loop: true },
    'player.roll':    { sheet: 'player', frames: grid(144, 24, 24, 24, 4),fps: 16, pivot: [12, 23], loop: true },
    'player.hurt':    { sheet: 'player', frames: grid(0, 48, 24, 24, 1),  fps: 1,  pivot: [12, 23] },
    'player.melee':   { sheet: 'player', frames: grid(24, 48, 24, 24, 2), fps: 16, pivot: [12, 23] },
    'player.gunjump': { sheet: 'player', frames: grid(72, 48, 24, 24, 2), fps: 16, pivot: [12, 23] },

    // ---- tiles (16×16; drawn by world.js on the grid, pivots unused) ----
    'tiles.soil':    { sheet: 'tiles', frames: grid(0, 0, 16, 16, 16), fps: 1, pivot: [0, 0] },
    'tiles.soilVar': { sheet: 'tiles', frames: grid(0, 16, 16, 16, 2), fps: 1, pivot: [0, 0] },
    'tiles.oneway':  { sheet: 'tiles', frames: grid(32, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.thorns':  { sheet: 'tiles', frames: grid(48, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.vineTop': { sheet: 'tiles', frames: grid(64, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.vineMid': { sheet: 'tiles', frames: grid(80, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.vineEnd': { sheet: 'tiles', frames: grid(96, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.flower':  { sheet: 'tiles', frames: grid(112, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.tuft':    { sheet: 'tiles', frames: grid(128, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.rock':    { sheet: 'tiles', frames: grid(144, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },
    'tiles.dewdrop': { sheet: 'tiles', frames: grid(160, 16, 16, 16, 1), fps: 1, pivot: [0, 0] },

    // ---- props (pivot = bottom center) ----
    'props.checkpoint': { sheet: 'props', frames: grid(0, 0, 16, 24, 4), fps: 6, pivot: [8, 23], loop: true },
    'props.vending':    { sheet: 'props', frames: [[64, 0, 24, 32]], fps: 1, pivot: [12, 31] },
    'props.door':       { sheet: 'props', frames: [[88, 0, 16, 32]], fps: 1, pivot: [8, 31] },
    'props.doorOpen':   { sheet: 'props', frames: [[32, 32, 16, 32]], fps: 1, pivot: [8, 31] },
    'props.pedestal':   { sheet: 'props', frames: [[104, 0, 16, 16]], fps: 1, pivot: [8, 15] },
    'props.gun':        { sheet: 'props', frames: [[120, 0, 16, 16]], fps: 1, pivot: [8, 15] },
    'props.ticket':     { sheet: 'props', frames: [[136, 0, 8, 8]], fps: 1, pivot: [4, 7] },
    'props.hat':        { sheet: 'props', frames: [[136, 8, 12, 8]], fps: 1, pivot: [6, 7] },
    'props.sign':       { sheet: 'props', frames: [[0, 32, 16, 16]], fps: 1, pivot: [8, 15] },
    'props.trophy':     { sheet: 'props', frames: [[16, 32, 16, 16]], fps: 1, pivot: [8, 15] },

    // ---- enemies & projectiles (pivot = feet/bottom center) ----
    'enemy.spitter.idle':   { sheet: 'enemies', frames: grid(0, 0, 16, 24, 2), fps: 4, pivot: [8, 23], loop: true },
    'enemy.spitter.windup': { sheet: 'enemies', frames: grid(32, 0, 16, 24, 1), fps: 1, pivot: [8, 23] },
    'enemy.spitter.spit':   { sheet: 'enemies', frames: grid(48, 0, 16, 24, 1), fps: 1, pivot: [8, 23] },
    'enemy.weevil': { sheet: 'enemies', frames: grid(64, 8, 16, 16, 2), fps: 6,  pivot: [8, 15], loop: true },
    'enemy.gnat':   { sheet: 'enemies', frames: grid(96, 8, 16, 16, 2), fps: 12, pivot: [8, 15], loop: true },
    'fx.pellet': { sheet: 'enemies', frames: [[128, 0, 6, 6]],  fps: 1, pivot: [3, 3] },
    'fx.charge': { sheet: 'enemies', frames: [[136, 0, 10, 10]], fps: 1, pivot: [5, 5] },
    'fx.spore':  { sheet: 'enemies', frames: [[148, 0, 8, 8]],  fps: 1, pivot: [4, 4] },

    // ---- boss: Bullhorn Beetle (48×32 cells, pivot = feet center) ----
    'boss.idle':   { sheet: 'boss', frames: grid(0, 0, 48, 32, 2, 48),   fps: 4,  pivot: [24, 31], loop: true },
    'boss.scrape': { sheet: 'boss', frames: grid(96, 0, 48, 32, 2, 48),  fps: 8,  pivot: [24, 31], loop: true },
    'boss.charge': { sheet: 'boss', frames: grid(192, 0, 48, 32, 2, 48), fps: 10, pivot: [24, 31], loop: true },
    'boss.stun':   { sheet: 'boss', frames: grid(288, 0, 48, 32, 1)  ,   fps: 1,  pivot: [24, 31] },
    'boss.hop':    { sheet: 'boss', frames: grid(336, 0, 48, 32, 1),     fps: 1,  pivot: [24, 31] },
  },
};
