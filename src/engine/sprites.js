// sprites.js — asset loader (PNG-first, procedural fallback) + sprite drawing.
// The manifest is the only source of geometry; see src/assets/manifest.js.

import { MANIFEST } from '../assets/manifest.js';
import { generateSheet } from '../assets/placeholders.js';

const sheets = new Map(); // name -> drawable (Image or canvas)

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export async function loadAssets() {
  await Promise.all(Object.entries(MANIFEST.sheets).map(async ([name, def]) => {
    try {
      const img = await loadImage(def.src);
      // normalize onto a canvas of manifest size so partial art still aligns
      const c = document.createElement('canvas');
      c.width = def.w; c.height = def.h;
      c.getContext('2d').drawImage(img, 0, 0);
      sheets.set(name, c);
    } catch {
      sheets.set(name, generateSheet(name, def));
    }
  }));
}

export function sheet(name) { return sheets.get(name); }
export function spriteDef(name) {
  const d = MANIFEST.sprites[name];
  if (!d) throw new Error(`Unknown sprite: ${name}`);
  return d;
}

// x,y = world position of the pivot. opts: flip, sx, sy (squash), alpha, white
const whiteCache = new Map();
function whiteFrame(name, idx) {
  const key = `${name}#${idx}`;
  let c = whiteCache.get(key);
  if (c) return c;
  const d = spriteDef(name);
  const [fx, fy, fw, fh] = d.frames[idx];
  c = document.createElement('canvas');
  c.width = fw; c.height = fh;
  const g = c.getContext('2d');
  g.drawImage(sheets.get(d.sheet), fx, fy, fw, fh, 0, 0, fw, fh);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, fw, fh);
  whiteCache.set(key, c);
  return c;
}

export function drawSprite(ctx, name, frameIdx, x, y, opts = {}) {
  const d = spriteDef(name);
  const idx = Math.min(frameIdx | 0, d.frames.length - 1);
  const [fx, fy, fw, fh] = d.frames[idx];
  const [px, py] = d.pivot;
  const sx = opts.sx ?? 1, sy = opts.sy ?? 1;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (opts.flip) ctx.scale(-1, 1);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  const src = opts.white ? whiteFrame(name, idx) : sheets.get(d.sheet);
  if (opts.white) ctx.drawImage(src, 0, 0, fw, fh, -px, -py, fw, fh);
  else ctx.drawImage(src, fx, fy, fw, fh, -px, -py, fw, fh);
  ctx.restore();
}

// draw a raw tile frame on the grid (no pivot logic)
export function drawTile(ctx, name, frameIdx, x, y) {
  const d = spriteDef(name);
  const [fx, fy, fw, fh] = d.frames[Math.min(frameIdx | 0, d.frames.length - 1)];
  ctx.drawImage(sheets.get(d.sheet), fx, fy, fw, fh, Math.round(x), Math.round(y), fw, fh);
}

export class Anim {
  constructor(name) { this.name = name; this.t = 0; }
  set(name, restart = false) {
    if (this.name !== name || restart) { this.name = name; this.t = 0; }
  }
  update(dt) { this.t += dt; }
  frame() {
    const d = spriteDef(this.name);
    const i = Math.floor(this.t * d.fps);
    return d.loop ? i % d.frames.length : Math.min(i, d.frames.length - 1);
  }
  done() {
    const d = spriteDef(this.name);
    return !d.loop && this.t * d.fps >= d.frames.length;
  }
}
