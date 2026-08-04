// background.js — the Hollow Knight "sandwich": sky gradient + L3 canopy
// (0.3×) + mist + L2 near garden (0.6×) behind the playfield, and L0
// foreground occluders (1.15×) + vignette in front. Deterministic per room.

import { C, PAL } from '../constants.js';

function h1(n) { n = (n ^ 61) ^ (n >> 16); n = n + (n << 3); n = n ^ (n >> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >> 15); return (n >>> 0) / 4294967295; }

let vignette = null;
function getVignette() {
  if (vignette) return vignette;
  vignette = document.createElement('canvas');
  vignette.width = C.VIEW_W; vignette.height = C.VIEW_H;
  const g = vignette.getContext('2d');
  const grad = g.createRadialGradient(C.VIEW_W / 2, C.VIEW_H / 2, C.VIEW_H * 0.55, C.VIEW_W / 2, C.VIEW_H / 2, C.VIEW_W * 0.72);
  grad.addColorStop(0, 'rgba(46,34,47,0)');
  grad.addColorStop(1, 'rgba(46,34,47,0.34)');
  g.fillStyle = grad;
  g.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
  return vignette;
}

// sky: banded vertical gradient bgLight (top, dawn) -> bgMid (bottom)
function lerpHex(a, b, t) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function drawBackground(ctx, cam, room, t) {
  const seed = room.id.length * 131 + room.id.charCodeAt(0) * 7;

  // sky bands
  const BANDS = 6;
  for (let i = 0; i < BANDS; i++) {
    ctx.fillStyle = lerpHex(PAL.bgLight, PAL.bgMid, i / (BANDS - 1));
    ctx.fillRect(0, Math.floor(i * C.VIEW_H / BANDS), C.VIEW_W, Math.ceil(C.VIEW_H / BANDS) + 1);
  }

  // L3: far canopy blobs hanging from the top (0.3×)
  const ox3 = cam.x * 0.3;
  ctx.fillStyle = PAL.bgMid;
  const SPACING = 56;
  const first3 = Math.floor(ox3 / SPACING) - 1;
  for (let i = first3; i < first3 + Math.ceil(C.VIEW_W / SPACING) + 2; i++) {
    const r = h1(i * 3 + seed);
    const x = i * SPACING - ox3 + r * 24;
    const w = 40 + r * 50, h = 26 + h1(i * 5 + seed) * 30;
    ctx.beginPath();
    ctx.ellipse(x, -6, w / 2, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // distant stalks
  ctx.fillStyle = PAL.bgLight;
  for (let i = first3; i < first3 + 8; i++) {
    const r = h1(i * 13 + seed + 55);
    if (r < 0.5) continue;
    const x = Math.round(i * SPACING - ox3 + r * 30);
    ctx.fillRect(x, C.VIEW_H - 70 - r * 40, 2, 70 + r * 40);
    ctx.fillRect(x - 2, C.VIEW_H - 72 - r * 40, 6, 4);
  }

  // drifting mist band (0.05×, slow time drift)
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = PAL.ui;
  const mx = (cam.x * 0.05 + t * 6) % (C.VIEW_W * 2);
  for (let i = -1; i <= 1; i++) {
    const bx = i * C.VIEW_W * 2 - mx;
    ctx.beginPath();
    ctx.ellipse(bx + C.VIEW_W / 2, C.VIEW_H * 0.55, C.VIEW_W * 0.7, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // L2: near garden silhouettes (0.6×) — 2 colors only, anchored to bottom
  const ox2 = cam.x * 0.6, oy2 = cam.y * 0.25;
  const SP2 = 42;
  const first2 = Math.floor(ox2 / SP2) - 1;
  for (let i = first2; i < first2 + Math.ceil(C.VIEW_W / SP2) + 2; i++) {
    const r = h1(i * 7 + seed + 17);
    const x = Math.round(i * SP2 - ox2 + r * 18);
    const hgt = 30 + r * 55;
    const col = r > 0.5 ? PAL.farFoliage : PAL.leafDark;
    ctx.fillStyle = col;
    // stem + head silhouette (giant grass / seed heads)
    ctx.fillRect(x, C.VIEW_H - hgt + oy2 * 0, 3, hgt);
    ctx.beginPath();
    ctx.ellipse(x + 1, C.VIEW_H - hgt, 8 + r * 8, 10 + r * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (r > 0.7) { // leaning blade
      ctx.fillRect(x + 6, C.VIEW_H - hgt * 0.6, 2, hgt * 0.6);
    }
  }
}

// L0 foreground occluders (1.15×) + vignette — call AFTER world/entities
export function drawForeground(ctx, cam, room, t) {
  const seed = room.id.length * 31 + room.id.charCodeAt(0);
  const ox = cam.x * 1.15, oy = cam.y * 1.15 - cam.y; // slight vertical drift
  ctx.globalAlpha = 0.8; // translucent so occluders can never fully hide an enemy
  ctx.fillStyle = PAL.bgDeep;
  const SP = 150;
  const first = Math.floor(ox / SP) - 1;
  for (let i = first; i < first + Math.ceil(C.VIEW_W / SP) + 2; i++) {
    const r = h1(i * 19 + seed + 3);
    if (r < 0.45) continue; // sparse — ≤15% coverage
    const x = Math.round(i * SP - ox + r * 40);
    const hgt = 40 + r * 50;
    const sway = Math.sin(t * 0.8 + i * 2.1) * 2;
    // giant grass blade from bottom
    ctx.beginPath();
    ctx.moveTo(x, C.VIEW_H + 2);
    ctx.quadraticCurveTo(x + 4 + sway, C.VIEW_H - hgt * 0.6, x + 2 + sway * 2, C.VIEW_H - hgt - oy);
    ctx.quadraticCurveTo(x + 9 + sway, C.VIEW_H - hgt * 0.5, x + 12, C.VIEW_H + 2);
    ctx.fill();
    if (r > 0.8) { // seed head
      ctx.beginPath();
      ctx.ellipse(x + 2 + sway * 2, C.VIEW_H - hgt - oy - 4, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(getVignette(), 0, 0);
}
