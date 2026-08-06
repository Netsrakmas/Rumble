// placeholders.js — procedural sprite sheets, generated when a PNG is missing.
// These are real little sprites (silhouette + palette + outline), not rects,
// so game feel and readability are testable before painted art exists.
// Geometry MUST match manifest.js exactly — the export tool relies on it.

import { PAL } from '../constants.js';

function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
// rounded rect (1px corner cut) — the single cheapest trick for cute silhouettes
function RR(g, x, y, w, h, c) {
  g.fillStyle = c;
  g.fillRect(x + 1, y, w - 2, h);
  g.fillRect(x, y + 1, w, h - 2);
}

// ---------------------------------------------------------------- player ----
// 24×24 cells, feet line y=23, centered on x=12.
// pose: {bob, legPhase, air:-1/0/1, crawl, roll, wall, hurt, melee, gun, gunDown}
function drawRumble(g, ox, oy, p = {}) {
  g.save();
  g.translate(ox, oy);
  const bob = p.bob || 0;

  if (p.roll != null) { // curled ball, 4 rotation phases
    const cx = 12, cy = 16;
    const ph = p.roll % 4;
    RR(g, cx - 7, cy - 7, 14, 14, PAL.outline);
    RR(g, cx - 6, cy - 6, 12, 12, PAL.bee);
    // rotating stripe band + scarf tip whipping around
    if (ph === 0) { RR(g, cx - 6, cy - 2, 12, 3, PAL.outline); R(g, cx - 8, cy - 1, 2, 2, PAL.beeAccent); }
    if (ph === 1) { RR(g, cx - 2, cy - 6, 3, 12, PAL.outline); R(g, cx - 1, cy - 9, 2, 2, PAL.beeAccent); }
    if (ph === 2) { RR(g, cx - 6, cy - 1, 12, 3, PAL.outline); R(g, cx + 6, cy - 1, 2, 2, PAL.beeAccent); }
    if (ph === 3) { RR(g, cx - 1, cy - 6, 3, 12, PAL.outline); R(g, cx - 1, cy + 7, 2, 2, PAL.beeAccent); }
    R(g, cx + 1, cy - 4, 2, 2, '#ffffff');           // shine
    R(g, cx - 4, cy + 3, 5, 1, PAL.beeAccent);        // warm under-shadow
    g.restore();
    return;
  }

  if (p.crawl != null) { // low profile
    const step = p.crawl % 2;
    RR(g, 2, 14 + bob, 20, 9, PAL.outline);
    RR(g, 3, 15 + bob, 18, 7, PAL.bee);
    R(g, 7, 15 + bob, 3, 7, PAL.outline);             // stripes
    R(g, 12, 15 + bob, 3, 7, PAL.outline);
    R(g, 4, 20 + bob, 12, 1, PAL.beeAccent);          // warm belly shading
    R(g, 16, 16 + bob, 3, 4, '#ffffff');              // big eye
    R(g, 17, 17 + bob, 2, 2, PAL.outline);            // pupil
    R(g, 19, 20 + bob, 1, 1, PAL.beeAccent);          // blush
    R(g, 4 + step, 22, 3, 2, PAL.outline); R(g, 12 - step, 22, 3, 2, PAL.outline); // legs
    R(g, 20, 13 + bob, 1, 2, PAL.outline); R(g, 21, 12 + bob, 1, 1, PAL.outline);  // antenna swept back
    g.restore();
    return;
  }

  // ---- standing family ----
  const air = p.air || 0;
  const hy = 2 + bob + (air === 1 ? 1 : 0);   // head top y
  const by = 12 + bob;                        // body top y

  // legs first (under the body): rounded little feet
  const foot = (x, y) => { RR(g, x, y, 3, 3, PAL.outline); };
  if (p.legPhase != null) {
    const s = p.legPhase % 2 ? 2 : -2;
    foot(8 + s, 21); foot(13 - s, 21);
  } else if (air !== 0) {
    foot(8, 20); foot(13, 21);                // tucked/askew in the air
  } else {
    foot(8, 21); foot(13, 21);
  }

  // wing stubs (the lost wings — story beat), glassy mint nubs on the back
  R(g, 4, by + 1, 2, 3, PAL.outline);
  R(g, 4, by + 1, 2, 2, PAL.dewHalo);
  R(g, 5, by + 4, 1, 2, PAL.outline);

  // body: rounded, striped, warm-shaded underside
  RR(g, 6, by, 12, 10, PAL.outline);
  RR(g, 7, by + 1, 10, 8, PAL.bee);
  R(g, 9, by + 1, 2, 8, PAL.outline);               // stripe
  R(g, 13, by + 1, 2, 8, PAL.outline);              // stripe
  R(g, 8, by + 8, 8, 1, PAL.beeAccent);             // under-shadow
  R(g, 8, by + 1, 6, 1, PAL.ui);                    // top sheen

  // scarf — the facing/velocity read (drawn under the head, over the body)
  const sw = p.wall ? -3 : air ? -2 : (p.legPhase != null ? -1 : 0);
  R(g, 6, by - 1, 9, 2, PAL.beeAccent);
  R(g, 6, by + 1, 9, 1, PAL.outline);               // knot shadow
  R(g, 2 + sw, by + (air ? -2 : 0), 5, 2, PAL.beeAccent);
  R(g, 1 + sw, by + 1 + (air ? -2 : 0), 3, 2, PAL.beeAccent);

  // head: big, ROUND, over half the silhouette
  RR(g, 4, hy, 15, 12, PAL.outline);
  RR(g, 5, hy + 1, 13, 10, PAL.bee);
  R(g, 6, hy + 1, 8, 1, PAL.ui);                    // dawn top-light
  // face
  const ey = hy + 4;
  if (p.hurt) {
    R(g, 8, ey, 3, 1, PAL.outline); R(g, 9, ey - 1, 1, 1, PAL.outline);   // >< eyes
    R(g, 14, ey, 3, 1, PAL.outline); R(g, 15, ey - 1, 1, 1, PAL.outline);
    R(g, 8, ey + 1, 3, 1, PAL.outline); R(g, 14, ey + 1, 3, 1, PAL.outline);
    R(g, 11, ey + 4, 3, 2, PAL.outline);            // open frown
  } else {
    R(g, 8, ey - 1, 3, 5, '#ffffff');               // eyes: tall, bright
    R(g, 14, ey - 1, 3, 5, '#ffffff');
    const px = air === 1 ? 0 : 1;                   // pupils look ahead, up at apex
    R(g, 9 + px, ey + (air === -1 ? 0 : 1), 2, 2, PAL.outline);
    R(g, 15 + px, ey + (air === -1 ? 0 : 1), 2, 2, PAL.outline);
    R(g, 7, ey + 4, 1, 1, PAL.beeAccent);           // blushes
    R(g, 17, ey + 4, 1, 1, PAL.beeAccent);
    R(g, 12, ey + 5, 2, 1, PAL.outline);            // little smile
  }
  // antennae with knobs, lagging the bob
  R(g, 8, hy - 2 - bob, 1, 3, PAL.outline); R(g, 7, hy - 3 - bob, 2, 2, PAL.outline);
  R(g, 14, hy - 2 - bob, 1, 3, PAL.outline); R(g, 15, hy - 3 - bob, 2, 2, PAL.outline);

  // Pea-Popper (if owned): a chunky pea-pod pistol
  if (p.gun) {
    if (p.gunDown) {                                 // aimed straight down
      RR(g, 16, by + 3, 4, 8, PAL.outline);
      R(g, 17, by + 4, 2, 5, PAL.leafMid);
      R(g, 17, by + 4, 1, 2, PAL.leafHi);
      R(g, 17, by + 9, 2, 1, PAL.beeAccent);         // muzzle
      if (p.flash) {
        R(g, 15, by + 11, 6, 2, '#ffffff');
        R(g, 16, by + 13, 4, 2, PAL.beeAccent);
        R(g, 17, by + 15, 2, 1, PAL.beeAccent);
      }
    } else if (p.melee) {                            // whipping the pod in an arc
      const ph = p.melee % 2;
      RR(g, 17, by - ph * 4, 7, 4, PAL.outline);
      R(g, 18, by + 1 - ph * 4, 5, 2, PAL.leafMid);
      R(g, 18, by + 1 - ph * 4, 2, 1, PAL.leafHi);
      R(g, 22, by + 4 - ph * 6, 1, 3, PAL.ui);       // swoosh
      R(g, 23, by + 2 - ph * 6, 1, 3, PAL.ui);
    } else {                                         // held level
      RR(g, 17, by + 2, 6, 4, PAL.outline);
      R(g, 18, by + 3, 4, 2, PAL.leafMid);
      R(g, 18, by + 3, 2, 1, PAL.leafHi);            // pod glint
      R(g, 22, by + 3, 1, 2, PAL.beeAccent);         // muzzle
      R(g, 18, by + 6, 2, 2, PAL.outline);           // grip
      if (p.flash) { R(g, 23, by + 2, 1, 4, '#ffffff'); R(g, 23, by + 3, 2, 2, PAL.beeAccent); }
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
  // 3-tone depth: lit face, packed-leaf midtone, dark buried lower body.
  // Shading only on EXPOSED edges so joined tiles read as one mass.
  // NOTE: all drawing stays inside the 16×16 cell (sheet-bleed rule).
  R(g, ox, oy, 16, 16, PAL.leafMid);
  // brick-packed leaf texture: offset rows of leaf-edge dashes
  for (let ry = 2; ry < 15; ry += 3) {
    const off = ((ry / 3) | 0) % 2 ? 3 : 0;
    for (let rx = off; rx < 15; rx += 6) {
      const rr = h2(ox + rx * 3 + variant * 17, oy + ry * 5 + mask);
      if (rr > 0.35) R(g, ox + rx + 1, oy + ry, 3, 1, PAL.leafDark);
      if (rr > 0.82) R(g, ox + rx + 1, oy + ry - 1, 2, 1, PAL.leafLight); // catchlight
      if (rr < 0.12 && N) R(g, ox + rx + 2, oy + ry + 1, 1, 1, PAL.farFoliage); // buried depth
    }
  }
  if (variant > 0) { // buried pebble / root knot
    const px = 4 + variant * 4, py = 6 + variant * 2;
    R(g, ox + px, oy + py, 4, 3, PAL.farFoliage);
    R(g, ox + px + 1, oy + py, 2, 1, PAL.bgLight);
    R(g, ox + px, oy + py + 2, 4, 1, PAL.outline);
  }
  if (!W) { // exposed left: shade + root nubs
    R(g, ox, oy, 2, 16, PAL.leafDark);
    R(g, ox + 2, oy + Math.floor(h2(ox, mask) * 10) + 3, 1, 2, PAL.leafDark);
    R(g, ox, oy + Math.floor(h2(ox, mask + 5) * 12) + 2, 1, 1, PAL.farFoliage);
  }
  if (!E) {
    R(g, ox + 14, oy, 2, 16, PAL.leafDark);
    R(g, ox + 13, oy + Math.floor(h2(oy, mask) * 10) + 3, 1, 2, PAL.leafDark);
    R(g, ox + 15, oy + Math.floor(h2(oy, mask + 5) * 12) + 2, 1, 1, PAL.farFoliage);
  }
  if (!S) { // exposed underside: dark belly + hanging moss fringe
    R(g, ox, oy + 14, 16, 2, PAL.leafDark);
    R(g, ox, oy + 13, 16, 1, PAL.farFoliage);
    for (let i = 1; i < 16; i += 3) {
      if (h2(i, mask + 31) > 0.4) R(g, ox + i, oy + 12 - (h2(i, mask) > 0.7 ? 1 : 0), 1, 2, PAL.farFoliage);
    }
  }
  if (!N) { // grass lip — mandatory on every exposed top, now with blades
    R(g, ox, oy, 16, 1, PAL.outline);
    R(g, ox, oy + 1, 16, 2, PAL.leafLight);
    for (let i = 0; i < 16; i += 2) {
      const rr = h2(i, mask);
      if (rr > 0.45) R(g, ox + i, oy, 1, 2, PAL.leafLight);          // blade tips over the outline
      if (rr > 0.8) R(g, ox + i, oy + 3, 1, 1, PAL.leafLight);       // blade drooping over the edge
      if (h2(i, mask + 99) > 0.7) R(g, ox + i, oy + 1, 1, 1, PAL.leafHi); // dawn sparkle
    }
    R(g, ox + 2, oy + 3, 3, 1, PAL.leafDark);                        // shadow under the lip
    R(g, ox + 9, oy + 3, 4, 1, PAL.leafDark);
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
  // oneway leaf platform: plush broad leaf with center vein & drooping ends
  R(g, 32, 16, 16, 1, PAL.outline);
  R(g, 32, 17, 16, 3, PAL.leafLight);
  R(g, 33, 20, 14, 2, PAL.leafMid);
  R(g, 32, 20, 1, 2, PAL.leafMid); R(g, 47, 20, 1, 2, PAL.leafMid); // drooping tips
  R(g, 33, 22, 3, 1, PAL.leafDark); R(g, 44, 22, 3, 1, PAL.leafDark);
  R(g, 39, 17, 2, 5, PAL.leafMid);                                   // center vein
  R(g, 34, 18, 1, 1, PAL.leafHi); R(g, 44, 18, 1, 1, PAL.leafHi);   // dew glints
  // thorns — bright bramble; must read instantly as danger. NOTE: the frame
  // rect is (48,16)-(64,32); earlier versions drew into row 0 by mistake,
  // which left this tile fully transparent (the "invisible spikes" bug).
  R(g, 48, 29, 16, 3, PAL.outline);                 // bramble base
  R(g, 49, 28, 4, 2, PAL.outline); R(g, 58, 28, 5, 2, PAL.outline);
  for (let i = 0; i < 4; i++) {
    const bx = 48 + i * 4;
    R(g, bx, 24, 4, 6, PAL.outline);                // spike body outline
    R(g, bx + 1, 20, 2, 10, PAL.hazard);            // tall red spike
    R(g, bx + 1, 18, 1, 3, PAL.hazard);
    R(g, bx + 1, 17, 1, 2, '#f57d4a');              // hot tip
    R(g, bx + 2, 21, 1, 2, '#ffffff');              // glint
  }
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
  // sporespitter 16×24 ×4: idle0 idle1 windup spit — grumpy mushroom turret
  for (let f = 0; f < 4; f++) {
    const x = f * 16;
    const puff = f === 2 ? 2 : 0;               // windup inflate
    R(g, x + 6, 13, 4, 10, PAL.outline);         // stem
    R(g, x + 7, 14, 2, 9, PAL.ui);               // pale stalk
    RR(g, x + 4, 20, 8, 3, PAL.leafDark);        // mossy base
    // cap: rounded, spotted
    RR(g, x + 1 - puff / 2, 5 - puff, 14 + puff, 10 + puff, PAL.outline);
    RR(g, x + 2 - puff / 2, 6 - puff, 12 + puff, 8 + puff, PAL.enemy);
    R(g, x + 3, 6 - puff, 8, 1, '#e8a4b8');      // cap sheen
    R(g, x + 4, 8 - puff, 2, 2, PAL.ui);         // spots
    R(g, x + 10, 10 - puff, 2, 2, PAL.ui);
    R(g, x + 7, 7 - puff, 1, 1, PAL.ui);
    // grumpy face on the cap rim
    R(g, x + 5, 11 - puff, 2, 2, PAL.outline);   // eyes
    R(g, x + 9, 11 - puff, 2, 2, PAL.outline);
    R(g, x + 5, 10 - puff, 2, 1, PAL.outline);   // angry brows
    R(g, x + 9, 10 - puff, 2, 1, PAL.outline);
    if (f === 3) { // spit puff
      R(g, x + 6, 1, 4, 3, PAL.enemy); R(g, x + 7, 0, 2, 2, '#e8a4b8');
      R(g, x + 5, 3, 1, 1, PAL.enemy); R(g, x + 10, 2, 1, 1, PAL.enemy);
      R(g, x + 7, 12, 2, 2, PAL.outline);        // mouth open
    }
    if (f === 1) R(g, x + 2, 4, 12, 1, PAL.outline); // idle cap tilt
  }
  // weevil 16×16 ×2 at (64,8) — round chubby shell, cute snout
  for (let f = 0; f < 2; f++) {
    const x = 64 + f * 16, s = f ? 1 : 0;
    RR(g, x + 3, 7, 12, 8, PAL.outline);          // shell
    RR(g, x + 4, 8, 10, 6, PAL.enemy);
    R(g, x + 5, 8, 7, 1, '#e8a4b8');              // shell sheen
    R(g, x + 8, 9, 1, 5, PAL.outline);            // shell seam
    R(g, x + 11, 12, 3, 2, '#a34d63');            // rump shade
    R(g, x + 1, 9, 4, 3, PAL.outline);            // snout
    R(g, x + 1, 10, 2, 1, PAL.enemy);
    R(g, x + 0, 10, 1, 1, PAL.outline);           // nose tip
    R(g, x + 5, 9, 3, 3, '#ffffff');              // eye
    R(g, x + 6, 10, 2, 2, PAL.outline);           // pupil
    R(g, x + 3, 6 - s, 1, 2, PAL.outline);        // antenna bobs with step
    foot6(g, x, s);
  }
  // gnat 16×16 ×2 at (96,8) — round pest with shimmering wings
  for (let f = 0; f < 2; f++) {
    const x = 96 + f * 16;
    const wy = f ? 5 : 8;
    R(g, x + 3, wy, 4, 3, PAL.dewHalo); R(g, x + 9, wy, 4, 3, PAL.dewHalo);
    R(g, x + 4, wy, 2, 1, '#ffffff'); R(g, x + 10, wy, 2, 1, '#ffffff'); // wing shine
    RR(g, x + 4, 9, 8, 6, PAL.outline);
    RR(g, x + 5, 10, 6, 4, PAL.enemy);
    R(g, x + 6, 10, 3, 1, '#e8a4b8');             // sheen
    R(g, x + 9, 11, 2, 2, '#ffffff');             // eye
    R(g, x + 10, 12, 1, 1, PAL.outline);
    R(g, x + 3, 12, 1, 1, PAL.outline);           // stinger tail
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

// six stubby legs for the weevil, alternating with step phase
function foot6(g, x, s) {
  R(g, x + 4 + s, 14, 2, 2, PAL.outline);
  R(g, x + 7 - s, 14, 2, 2, PAL.outline);
  R(g, x + 10 + s, 14, 2, 2, PAL.outline);
  R(g, x + 13 - s, 14, 2, 2, PAL.outline);
}

// ------------------------------------------------------------------ boss ----
// Bullhorn Beetle 48×32: idle0 idle1 scrape0 scrape1 charge0 charge1 stun hop
function drawBull(g, ox, p = {}) {
  g.save(); g.translate(ox, 0);
  // clip to the 48×32 cell so the horn can never bleed into the next frame,
  // then shift right so the horn fits inside the cell
  g.beginPath(); g.rect(0, 0, 48, 32); g.clip();
  g.translate(8, 0);
  const bob = p.bob || 0, lean = p.lean || 0;
  const by = 9 + bob;
  // legs first (under the body): sturdy hooves
  const s = p.step ? 2 : 0;
  RR(g, 10 + s, 27, 5, 5, PAL.outline);
  RR(g, 18 - s, 27, 5, 5, PAL.outline);
  RR(g, 27 + s, 27, 5, 5, PAL.outline);
  RR(g, 33 - s, 27, 5, 5, PAL.outline);
  // body: big rounded shell with plates and shading
  RR(g, 6 - lean, by, 34, 19, PAL.outline);
  RR(g, 7 - lean, by + 1, 32, 17, PAL.enemy);
  R(g, 9 - lean, by + 1, 27, 2, '#e8a4b8');        // top sheen
  R(g, 8 - lean, by + 15, 30, 2, '#a34d63');       // belly shade
  // plate seams with rivet dots
  for (const px of [13, 22, 31]) {
    R(g, px - lean, by + 1, 2, 16, PAL.outline);
    R(g, px - lean, by + 3, 1, 1, PAL.ui);
  }
  // head: lowered, mean (faces left)
  RR(g, -1 - lean, by + 3, 11, 14, PAL.outline);
  RR(g, 0 - lean, by + 4, 9, 12, PAL.enemy);
  R(g, 1 - lean, by + 4, 6, 1, '#e8a4b8');
  if (p.stun) {
    // dizzy X eye + lolling tongue
    R(g, 2 - lean, by + 7, 1, 1, PAL.outline); R(g, 4 - lean, by + 7, 1, 1, PAL.outline);
    R(g, 3 - lean, by + 8, 1, 1, PAL.outline);
    R(g, 2 - lean, by + 9, 1, 1, PAL.outline); R(g, 4 - lean, by + 9, 1, 1, PAL.outline);
    R(g, 1 - lean, by + 14, 3, 2, PAL.beeAccent);  // tongue
  } else {
    R(g, 1 - lean, by + 6, 4, 1, PAL.outline);     // angry brow
    R(g, 2 - lean, by + 7, 3, 3, '#ffffff');       // eye
    R(g, 2 - lean, by + 8, 2, 2, PAL.outline);     // glaring pupil
    R(g, 0 - lean, by + 12, 2, 1, PAL.outline);    // nostril
    if (p.scrape || p.lean > 2) R(g, -2 - lean, by + 12, 2, 2, PAL.ui); // snort puff
  }
  // THE bullhorn: big sweeping curve with highlight
  R(g, -3 - lean, by + 3, 5, 3, PAL.outline);
  R(g, -6 - lean, by + 1, 5, 3, PAL.outline);
  R(g, -8 - lean, by - 2, 4, 3, PAL.outline);
  R(g, -7 - lean, by - 1, 2, 1, PAL.ui);
  R(g, -5 - lean, by + 1, 3, 1, PAL.ui);           // horn shine
  if (p.stun) { // dizzy sparks orbiting
    R(g, 2, by - 6, 2, 2, PAL.dewHalo); R(g, 12, by - 9, 2, 2, PAL.dewHalo);
    R(g, 22, by - 6, 2, 2, PAL.dewHalo); R(g, 7, by - 4, 1, 1, '#ffffff');
  }
  if (p.scrape) { // dust kicked at the front hoof
    R(g, 4, 29, 3, 2, PAL.ui); R(g, 0, 30, 3, 2, PAL.ui); R(g, 7, 28, 2, 1, PAL.ui);
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
