// placeholders.js — procedural sprite sheets, generated when a PNG is missing.
// These are real little sprites (silhouette + palette + outline), not rects,
// so game feel and readability are testable before painted art exists.
// Geometry MUST match manifest.js exactly — the export tool relies on it.

import { PAL } from '../constants.js';

function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

// ---------------------------------------------------------------- player ----
// 24×24 cells, feet line y=23, centered on x=12.
// pose: {bob, legPhase, air:-1/0/1, crawl, roll, wall, hurt, melee, gun, gunDown}
function drawRumble(g, ox, oy, p = {}) {
  g.save();
  g.translate(ox, oy);
  const bob = p.bob || 0;

  if (p.roll != null) { // curled ball, 4 rotation phases
    const cx = 12, cy = 16;
    R(g, cx - 6, cy - 6, 12, 12, PAL.outline);
    R(g, cx - 5, cy - 5, 10, 10, PAL.bee);
    const ph = p.roll % 4;
    if (ph === 0) R(g, cx - 5, cy - 2, 10, 3, PAL.outline);
    if (ph === 1) R(g, cx - 2, cy - 5, 3, 10, PAL.outline);
    if (ph === 2) R(g, cx - 5, cy - 1, 10, 3, PAL.outline);
    if (ph === 3) R(g, cx - 1, cy - 5, 3, 10, PAL.outline);
    R(g, cx + 1, cy - 4, 2, 2, '#ffffff');
    g.restore();
    return;
  }

  if (p.crawl != null) { // low profile
    const step = p.crawl % 2;
    R(g, 2, 15 + bob, 20, 8, PAL.outline);
    R(g, 3, 16 + bob, 18, 6, PAL.bee);
    R(g, 8, 16 + bob, 3, 6, PAL.outline);   // stripe
    R(g, 14, 16 + bob, 3, 6, PAL.outline);  // stripe
    R(g, 17, 17 + bob, 3, 3, '#ffffff'); R(g, 18, 18 + bob, 1, 1, PAL.outline); // eye
    R(g, 4 + step, 22, 3, 2, PAL.outline); R(g, 12 - step, 22, 3, 2, PAL.outline); // legs
    R(g, 20, 14 + bob, 1, 2, PAL.outline); // antenna
    g.restore();
    return;
  }

  // ---- standing family ----
  const air = p.air || 0;
  const hy = 3 + bob + (air === 1 ? 1 : 0);   // head top y
  const by = 11 + bob;                        // body top y

  // wings stubs (lost wings — tiny nubs, the story beat)
  R(g, 6, by + 1, 2, 3, PAL.outline);

  // body 10×9 with stripes
  R(g, 6, by, 12, 10, PAL.outline);
  R(g, 7, by + 1, 10, 8, PAL.bee);
  R(g, 9, by + 1, 2, 8, PAL.outline);
  R(g, 13, by + 1, 2, 8, PAL.outline);

  // legs
  if (p.legPhase != null) {
    const s = p.legPhase % 2 ? 2 : -2;
    R(g, 8 + s, 21, 3, 3, PAL.outline);
    R(g, 13 - s, 21, 3, 3, PAL.outline);
  } else if (air !== 0) {
    R(g, 8, 20, 3, 3, PAL.outline);
    R(g, 13, 21, 3, 3, PAL.outline);
  } else {
    R(g, 8, 21, 3, 3, PAL.outline);
    R(g, 13, 21, 3, 3, PAL.outline);
  }

  // head 12×10, big — >=50% of silhouette
  R(g, 5, hy, 14, 11, PAL.outline);
  R(g, 6, hy + 1, 12, 9, PAL.bee);
  // face
  const ey = hy + 3;
  if (p.hurt) {
    R(g, 9, ey, 2, 2, PAL.outline); R(g, 14, ey, 2, 2, PAL.outline); // squint
    R(g, 10, ey + 4, 4, 2, PAL.outline); // frown
  } else {
    R(g, 9, ey, 3, 4, '#ffffff'); R(g, 10, ey + 1, 2, 2, PAL.outline);
    R(g, 14, ey, 3, 4, '#ffffff'); R(g, 15, ey + 1, 2, 2, PAL.outline);
    R(g, 12, ey + 2, 1, 1, PAL.beeAccent); // blush pixel
  }
  // antennae, lag with bob
  R(g, 8, hy - 2 - bob, 1, 3, PAL.outline); R(g, 7, hy - 3 - bob, 1, 2, PAL.outline);
  R(g, 14, hy - 2 - bob, 1, 3, PAL.outline); R(g, 15, hy - 3 - bob, 1, 2, PAL.outline);

  // scarf — the facing/velocity read
  const sw = p.wall ? -3 : air ? -2 : (p.legPhase != null ? -1 : 0);
  R(g, 6, by - 1, 8, 2, PAL.beeAccent);
  R(g, 2 + sw, by, 5, 2, PAL.beeAccent);

  // Pea-Popper (if owned): held at right side; gunDown aims it down
  if (p.gun) {
    if (p.gunDown) {
      R(g, 17, by + 4, 3, 6, PAL.outline);
      R(g, 17, by + 8, 3, 3, PAL.leafMid);
      if (p.flash) { R(g, 16, by + 11, 5, 3, '#ffffff'); R(g, 17, by + 13, 3, 2, PAL.beeAccent); }
    } else if (p.melee) {
      const ph = p.melee % 2;
      R(g, 17, by + 1 - ph * 3, 6, 3, PAL.outline);
      R(g, 19, by + 1 - ph * 3, 4, 2, PAL.leafMid);
    } else {
      R(g, 17, by + 2, 6, 3, PAL.outline);
      R(g, 20, by + 2, 3, 2, PAL.leafMid);
      R(g, 22, by + 2, 1, 2, PAL.beeAccent);
      if (p.flash) R(g, 23, by + 1, 1, 4, '#ffffff');
    }
  }
  g.restore();
}

function genPlayer(def) {
  const c = document.createElement('canvas');
  c.width = def.w; c.height = def.h;
  const g = c.getContext('2d');
  // idle 4 (x 0..72, y0): bob + blink
  drawRumble(g, 0, 0,  { bob: 0, gun: 1 });
  drawRumble(g, 24, 0, { bob: 0, gun: 1 });
  drawRumble(g, 48, 0, { bob: 1, gun: 1 });
  drawRumble(g, 72, 0, { bob: 1, gun: 1 });
  // run 6 (x 96..216, y0)
  for (let i = 0; i < 6; i++)
    drawRumble(g, 96 + i * 24, 0, { bob: i % 3 === 1 ? 1 : 0, legPhase: i, gun: 1 });
  // rise/apex/fall/wall/crawl0/crawl1/roll0-3 (y24)
  drawRumble(g, 0, 24,  { air: -1, gun: 1 });
  drawRumble(g, 24, 24, { air: 1, gun: 1 });
  drawRumble(g, 48, 24, { air: 1, bob: 1, gun: 1 });
  drawRumble(g, 72, 24, { wall: 1, air: -1, gun: 1 });
  drawRumble(g, 96, 24, { crawl: 0 });
  drawRumble(g, 120, 24, { crawl: 1 });
  for (let i = 0; i < 4; i++) drawRumble(g, 144 + i * 24, 24, { roll: i });
  // hurt / melee0 / melee1 / gunjump0 / gunjump1 (y48)
  drawRumble(g, 0, 48,  { hurt: 1, air: 1, gun: 1 });
  drawRumble(g, 24, 48, { melee: 0, gun: 1 });
  drawRumble(g, 48, 48, { melee: 1, gun: 1 });
  drawRumble(g, 72, 48, { air: -1, gun: 1, gunDown: 1, flash: 1 });
  drawRumble(g, 96, 48, { air: -1, gun: 1, gunDown: 1 });
  return c;
}

// ----------------------------------------------------------------- tiles ----
// deterministic tiny hash for speckle placement
function h2(x, y) { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

function drawSoilTile(g, ox, oy, mask, variant = 0) {
  // mask bits: 1=N present, 2=E, 4=S, 8=W (neighbor solid)
  const N = mask & 1, E = mask & 2, S = mask & 4, W = mask & 8;
  R(g, ox, oy, 16, 16, PAL.leafDark);
  R(g, ox + 1, oy + 1, 14, 14, PAL.leafMid);
  if (N && E && S && W) R(g, ox, oy, 16, 16, PAL.leafMid);
  // interior speckle
  for (let i = 0; i < 4; i++) {
    const rx = Math.floor(h2(mask * 7 + i, variant * 13 + i) * 12) + 2;
    const ry = Math.floor(h2(variant * 5 + i, mask * 11 + i) * 12) + 2;
    R(g, ox + rx, oy + ry, 1, 1, variant === 1 && i < 2 ? PAL.farFoliage : PAL.leafDark);
  }
  if (!W) R(g, ox, oy, 1, 16, PAL.leafDark);
  if (!E) R(g, ox + 15, oy, 1, 16, PAL.leafDark);
  if (!S) { R(g, ox, oy + 15, 16, 1, PAL.leafDark); R(g, ox + 2, oy + 13, 12, 1, PAL.leafDark); }
  if (!N) { // grass lip — mandatory on every exposed top
    R(g, ox, oy, 16, 1, PAL.outline);
    R(g, ox, oy + 1, 16, 2, PAL.leafLight);
    for (let i = 0; i < 16; i += 2) {
      if (h2(i, mask) > 0.5) R(g, ox + i, oy, 1, 2, PAL.leafLight);
      if (h2(i, mask + 99) > 0.72) R(g, ox + i, oy + 1, 1, 1, PAL.leafHi); // dawn sparkle
    }
  }
}

function genTiles(def) {
  const c = document.createElement('canvas');
  c.width = def.w; c.height = def.h;
  const g = c.getContext('2d');
  for (let m = 0; m < 16; m++) drawSoilTile(g, m * 16, 0, m);
  // variants of fully-surrounded
  drawSoilTile(g, 0, 16, 15, 1);
  drawSoilTile(g, 16, 16, 15, 2);
  // oneway leaf platform (top half)
  R(g, 32, 16, 16, 1, PAL.outline);
  R(g, 32, 17, 16, 3, PAL.leafLight);
  R(g, 33, 20, 14, 2, PAL.leafMid);
  R(g, 34, 22, 3, 1, PAL.leafDark); R(g, 43, 22, 3, 1, PAL.leafDark);
  // thorns
  for (let i = 0; i < 4; i++) {
    const bx = 48 + i * 4;
    R(g, bx + 1, 10, 2, 6, PAL.outline);
    R(g, bx + 1, 8, 2, 4, PAL.hazard);
    R(g, bx + 1, 6, 1, 2, PAL.hazard);
    R(g, bx + 1, 5, 1, 1, '#f57d4a');
  }
  R(g, 48, 15, 16, 1, PAL.outline);
  // vine top / mid / end
  const vine = (x, cap) => {
    R(g, x + 7, 16, 2, 16, PAL.leafDark);
    R(g, x + 7, 16, 1, 16, PAL.leafMid);
    R(g, x + 4, 20, 3, 2, PAL.leafMid); R(g, x + 9, 26, 3, 2, PAL.leafMid);
    if (cap) { R(g, x + 6, 28, 4, 3, PAL.leafMid); R(g, x + 7, 30, 2, 1, PAL.dew); }
  };
  vine(64); vine(80); vine(96, true);
  // flower bell
  R(g, 119, 22, 2, 10, PAL.leafMid);
  R(g, 116, 18, 8, 5, PAL.outline);
  R(g, 117, 19, 6, 3, PAL.beeAccent);
  R(g, 118, 22, 4, 2, PAL.leafHi);
  R(g, 119, 17, 2, 2, PAL.leafHi);
  // grass tuft
  for (let i = 0; i < 5; i++) {
    const bx = 129 + i * 3, bh = 3 + Math.floor(h2(i, 7) * 4);
    R(g, bx, 32 - bh, 1, bh, i % 2 ? PAL.leafLight : PAL.leafMid);
  }
  R(g, 132, 27, 1, 1, PAL.leafHi);
  // rock
  R(g, 146, 24, 12, 8, PAL.outline);
  R(g, 147, 25, 10, 6, PAL.farFoliage);
  R(g, 148, 26, 4, 2, PAL.bgLight);
  // dewdrop jewelry
  R(g, 165, 22, 6, 8, PAL.outline);
  R(g, 166, 21, 4, 9, PAL.outline);
  R(g, 166, 23, 4, 6, PAL.dew);
  R(g, 167, 22, 2, 7, PAL.dew);
  R(g, 167, 23, 1, 2, '#ffffff');
  return c;
}

// ----------------------------------------------------------------- props ----
function genProps(def) {
  const c = document.createElement('canvas');
  c.width = def.w; c.height = def.h;
  const g = c.getContext('2d');
  // checkpoint: dewdrop on leaf pedestal, 4-frame shimmer
  for (let f = 0; f < 4; f++) {
    const x = f * 16;
    R(g, x + 3, 20, 10, 3, PAL.leafDark);        // pedestal base
    R(g, x + 2, 19, 12, 2, PAL.leafMid);         // leaf
    R(g, x + 1, 18, 14, 1, PAL.leafLight);
    const dy = f === 2 ? 1 : 0;                  // drop bobs
    R(g, x + 5, 6 + dy, 6, 12, PAL.outline);
    R(g, x + 4, 8 + dy, 8, 9, PAL.outline);
    R(g, x + 5, 8 + dy, 6, 9, PAL.dew);
    R(g, x + 6, 7 + dy, 4, 10, PAL.dew);
    const sx = [6, 8, 6, 7][f];                  // roaming specular
    R(g, x + sx, 9 + dy, 2, 3, '#ffffff');
    R(g, x + 7, 15 + dy, 2, 1, PAL.dewHalo);
  }
  // vending machine 24×32 at (64,0)
  R(g, 64, 2, 24, 30, PAL.outline);
  R(g, 65, 3, 22, 28, PAL.bgLight);
  R(g, 67, 5, 13, 12, PAL.bgDeep);               // window
  R(g, 68, 6, 4, 4, PAL.dewHalo);                // glow item
  R(g, 74, 10, 4, 4, PAL.beeAccent);
  R(g, 68, 12, 3, 3, PAL.leafLight);
  R(g, 82, 5, 3, 8, PAL.dew);                    // side lamp
  R(g, 82, 15, 3, 3, PAL.outline);               // knob
  R(g, 67, 20, 13, 2, PAL.bgDeep);               // ticket slot
  R(g, 67, 25, 16, 3, PAL.bgDeep);               // tray
  R(g, 66, 30, 4, 2, PAL.outline); R(g, 82, 30, 4, 2, PAL.outline); // feet
  // door 16×32 at (88,0)
  R(g, 88, 0, 16, 32, PAL.leafDark);
  R(g, 90, 4, 12, 28, PAL.outline);
  R(g, 91, 6, 10, 26, PAL.bgDeep);
  R(g, 92, 6, 8, 3, PAL.bgMid);
  R(g, 89, 2, 14, 2, PAL.leafMid);               // mossy lintel
  R(g, 90, 1, 4, 1, PAL.leafLight);
  // pedestal 16×16 at (104,0)
  R(g, 106, 10, 12, 6, PAL.outline);
  R(g, 107, 11, 10, 4, PAL.farFoliage);
  R(g, 108, 8, 8, 3, PAL.bgLight);
  // Pea-Popper pickup 16×16 at (120,0)
  R(g, 122, 6, 10, 5, PAL.outline);
  R(g, 123, 7, 8, 3, PAL.leafMid);               // pod body
  R(g, 130, 7, 2, 3, PAL.beeAccent);             // muzzle
  R(g, 124, 11, 3, 4, PAL.outline);              // grip
  R(g, 125, 5, 2, 1, PAL.leafHi);
  // ticket 8×8 at (136,0)
  R(g, 136, 1, 8, 6, PAL.outline);
  R(g, 137, 2, 6, 4, PAL.ui);
  R(g, 139, 2, 1, 4, PAL.bgDeep);                // perforation
  R(g, 141, 3, 2, 2, PAL.beeAccent);
  // acorn cap hat 12×8 at (136,8)
  R(g, 137, 11, 10, 3, PAL.outline);
  R(g, 138, 10, 8, 3, '#7a5535');
  R(g, 141, 8, 2, 2, PAL.outline);               // stem
  R(g, 139, 10, 2, 1, PAL.leafHi);
  // sign 16×16 at (0,32)
  R(g, 7, 40, 2, 8, PAL.outline);
  R(g, 1, 34, 14, 8, PAL.outline);
  R(g, 2, 35, 12, 6, '#7a5535');
  R(g, 3, 37, 8, 1, PAL.outline); R(g, 3, 39, 6, 1, PAL.outline);
  // Spore Shroom trophy 16×16 at (16,32)
  R(g, 22, 40, 4, 7, PAL.ui);
  R(g, 18, 34, 12, 7, PAL.outline);
  R(g, 19, 35, 10, 5, PAL.enemy);
  R(g, 21, 36, 2, 2, PAL.ui); R(g, 26, 37, 1, 1, PAL.ui);
  return c;
}

// --------------------------------------------------------------- enemies ----
function genEnemies(def) {
  const c = document.createElement('canvas');
  c.width = def.w; c.height = def.h;
  const g = c.getContext('2d');
  // sporespitter 16×24 ×4: idle0 idle1 windup spit
  for (let f = 0; f < 4; f++) {
    const x = f * 16;
    const puff = f === 2 ? 2 : 0;               // windup inflate
    R(g, x + 6, 14, 4, 10, PAL.leafDark);        // stem
    R(g, x + 5, 20, 6, 2, PAL.leafMid);
    R(g, x + 2 - puff / 2, 6 - puff, 12 + puff, 9 + puff, PAL.outline);
    R(g, x + 3 - puff / 2, 7 - puff, 10 + puff, 7 + puff, PAL.enemy);
    R(g, x + 5, 8 - puff, 2, 2, PAL.ui); R(g, x + 9, 10 - puff, 1, 1, PAL.ui);
    if (f === 3) { R(g, x + 6, 2, 4, 4, PAL.enemy); R(g, x + 7, 1, 2, 2, PAL.ui); } // spit puff
    if (f === 1) R(g, x + 2, 5, 12, 1, PAL.outline);
  }
  // weevil 16×16 ×2 at (64,8)
  for (let f = 0; f < 2; f++) {
    const x = 64 + f * 16, s = f ? 1 : 0;
    R(g, x + 2, 12, 12, 4, PAL.outline);
    R(g, x + 3, 8, 10, 6, PAL.outline);
    R(g, x + 4, 9, 8, 4, PAL.enemy);
    R(g, x + 1, 10, 4, 3, PAL.outline);          // snout
    R(g, x + 2, 11, 2, 1, PAL.enemy);
    R(g, x + 5, 10, 2, 2, PAL.ui); R(g, x + 6, 11, 1, 1, PAL.outline);
    R(g, x + 4 + s, 14, 2, 2, PAL.outline); R(g, x + 8 - s, 14, 2, 2, PAL.outline); R(g, x + 11 + s, 14, 2, 2, PAL.outline);
  }
  // gnat 16×16 ×2 at (96,8)
  for (let f = 0; f < 2; f++) {
    const x = 96 + f * 16;
    R(g, x + 5, 9, 6, 5, PAL.outline);
    R(g, x + 6, 10, 4, 3, PAL.enemy);
    R(g, x + 9, 10, 2, 2, PAL.ui);
    const wy = f ? 6 : 9;
    R(g, x + 3, wy, 4, 2, PAL.dewHalo); R(g, x + 9, wy, 4, 2, PAL.dewHalo);
  }
  // pellet 6×6 at (128,0) — pea!
  R(g, 129, 1, 4, 4, PAL.outline);
  R(g, 129, 1, 3, 3, PAL.leafLight);
  R(g, 129, 1, 1, 1, PAL.leafHi);
  // charge shot 10×10 at (136,0)
  R(g, 137, 1, 8, 8, PAL.outline);
  R(g, 138, 2, 6, 6, PAL.leafLight);
  R(g, 139, 3, 4, 4, PAL.leafHi);
  R(g, 140, 4, 2, 2, '#ffffff');
  // spore 8×8 at (148,0)
  R(g, 149, 1, 6, 6, PAL.outline);
  R(g, 150, 2, 4, 4, PAL.enemy);
  R(g, 151, 3, 1, 1, PAL.ui);
  return c;
}

// ------------------------------------------------------------------ boss ----
// Bullhorn Beetle 48×32: idle0 idle1 scrape0 scrape1 charge0 charge1 stun hop
function drawBull(g, ox, p = {}) {
  g.save(); g.translate(ox, 0);
  const bob = p.bob || 0, lean = p.lean || 0;
  const by = 10 + bob;
  // body
  R(g, 6 - lean, by, 36, 18, PAL.outline);
  R(g, 7 - lean, by + 1, 34, 16, PAL.enemy);
  // shell plates
  R(g, 12 - lean, by + 1, 2, 16, PAL.outline);
  R(g, 22 - lean, by + 1, 2, 16, PAL.outline);
  R(g, 32 - lean, by + 1, 2, 16, PAL.outline);
  R(g, 8 - lean, by + 2, 24, 2, '#e8a4b8');      // top sheen (enemy tint)
  // head + horn (faces left)
  R(g, 0 - lean, by + 4, 10, 12, PAL.outline);
  R(g, 1 - lean, by + 5, 8, 10, PAL.enemy);
  R(g, 2 - lean, by + 7, 3, 3, p.stun ? PAL.outline : '#ffffff'); // eye
  if (!p.stun) R(g, 3 - lean, by + 8, 1, 1, PAL.outline);
  // the bullhorn
  R(g, -4 - lean, by + 2, 6, 3, PAL.outline);
  R(g, -6 - lean, by, 4, 3, PAL.outline);
  R(g, -5 - lean, by + 1, 3, 1, PAL.ui);
  // legs
  const s = p.step ? 2 : 0;
  R(g, 10 + s, 28, 4, 4, PAL.outline);
  R(g, 20 - s, 28, 4, 4, PAL.outline);
  R(g, 30 + s, 28, 4, 4, PAL.outline);
  R(g, 38 - s, 28, 4, 4, PAL.outline);
  if (p.stun) { // dizzy sparks
    R(g, 4, by - 6, 2, 2, PAL.dewHalo); R(g, 12, by - 8, 2, 2, PAL.dewHalo); R(g, 20, by - 5, 2, 2, PAL.dewHalo);
  }
  if (p.scrape) { // dust at front hoof
    R(g, 2, 29, 3, 2, PAL.ui); R(g, -2, 30, 3, 2, PAL.ui);
  }
  g.restore();
}

function genBoss(def) {
  const c = document.createElement('canvas');
  c.width = def.w; c.height = def.h;
  const g = c.getContext('2d');
  drawBull(g, 0,   { bob: 0 });
  drawBull(g, 48,  { bob: 1, step: 1 });
  drawBull(g, 96,  { scrape: 1, lean: -2 });
  drawBull(g, 144, { scrape: 1, lean: -3, step: 1 });
  drawBull(g, 192, { lean: 4, step: 0 });
  drawBull(g, 240, { lean: 4, step: 1 });
  drawBull(g, 288, { stun: 1, bob: 2 });
  drawBull(g, 336, { bob: -2, lean: 2 });
  return c;
}

const GENERATORS = {
  player: genPlayer,
  tiles: genTiles,
  props: genProps,
  enemies: genEnemies,
  boss: genBoss,
};

export function generateSheet(name, def) {
  const gen = GENERATORS[name];
  if (!gen) throw new Error(`No placeholder generator for sheet: ${name}`);
  return gen(def);
}
