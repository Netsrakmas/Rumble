// world.js — parses level data (ASCII maps + entities) into rooms, computes
// autotile indices + decorations once at load, serves collision queries.
// Levels are PURE DATA (src/levels/) — this file never needs edits for content.

import { C } from '../constants.js';
import { drawTile } from '../engine/sprites.js';

export const T = { EMPTY: 0, SOLID: 1, ONEWAY: 2, THORNS: 3, WATER: 4 };

// base legend shared by all levels; levels may extend per-room with `legend`
const BASE_LEGEND = {
  '#': 'solid', '-': 'oneway', '^': 'thorns', '.': 'empty',
  'P': 'spawn', '*': 'ticket', '+': 'heal', '~': 'water',
};
const DOOR_CHARS = 'ABCDEFGH';

function fail(roomId, msg) { throw new Error(`[level:${roomId}] ${msg}`); }

// deterministic hash for deco placement
function h2(x, y) { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

export class Room {
  constructor(def, levelId) {
    this.id = def.id;
    this.def = def;
    this.levelId = levelId;
    const map = def.map;
    if (!Array.isArray(map) || map.length === 0) fail(def.id, 'map missing/empty');
    this.h = map.length;
    this.w = map[0].length;
    this.pxW = this.w * C.TILE;
    this.pxH = this.h * C.TILE;

    const legend = { ...BASE_LEGEND, ...(def.legend || {}) };
    const doorEnts = (def.entities || []).filter(e => e.type === 'door');
    for (const d of doorEnts) {
      if (!DOOR_CHARS.includes(d.char)) fail(def.id, `door char '${d.char}' must be one of ${DOOR_CHARS}`);
    }

    this.grid = new Uint8Array(this.w * this.h);
    this.tickets = [];       // {tx,ty}
    this.heals = [];         // {tx,ty} — respawn every room entry (not persisted)
    this.spawn = null;       // {tx,ty}
    this.doors = new Map();  // char -> {tx,ty,def}
    this.extraSolids = [];   // dynamic blockers (locked doors etc), rects

    for (let y = 0; y < this.h; y++) {
      const row = map[y];
      if (row.length !== this.w) fail(def.id, `row ${y} length ${row.length} != ${this.w} (map must be rectangular)`);
      for (let x = 0; x < this.w; x++) {
        const ch = row[x];
        if (DOOR_CHARS.includes(ch)) {
          const d = doorEnts.find(e => e.char === ch);
          if (!d) fail(def.id, `door char '${ch}' at ${x},${y} has no entities entry`);
          this.doors.set(ch, { tx: x, ty: y, def: d });
          continue;
        }
        const kind = legend[ch];
        if (kind === undefined) fail(def.id, `unknown char '${ch}' at row ${y}, col ${x}`);
        switch (kind) {
          case 'solid': this.grid[y * this.w + x] = T.SOLID; break;
          case 'oneway': this.grid[y * this.w + x] = T.ONEWAY; break;
          case 'thorns': this.grid[y * this.w + x] = T.THORNS; break;
          case 'spawn': this.spawn = { tx: x, ty: y }; break;
          case 'ticket': this.tickets.push({ tx: x, ty: y }); break;
          case 'heal': this.heals.push({ tx: x, ty: y }); break;
          case 'water': this.grid[y * this.w + x] = T.WATER; break;
          case 'empty': break;
          default: fail(def.id, `legend kind '${kind}' not supported`);
        }
      }
    }
    for (const d of doorEnts) {
      if (!this.doors.has(d.char)) fail(def.id, `door entity '${d.char}' has no matching char in map`);
    }

    this._computeAutotile();
    this._computeDeco();
  }

  tile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return T.SOLID; // OOB = solid walls
    return this.grid[ty * this.w + tx];
  }
  isSolidTile(tx, ty) {
    // OOB counts as solid for autotile continuity, and for collision walls
    if (tx < 0 || tx >= this.w) return true;
    if (ty < 0 || ty >= this.h) return true;
    return this.grid[ty * this.w + tx] === T.SOLID;
  }

  _computeAutotile() {
    this.autotile = new Int16Array(this.w * this.h).fill(-1);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.grid[y * this.w + x] !== T.SOLID) continue;
      const m = (this.isSolidTile(x, y - 1) ? 1 : 0) | (this.isSolidTile(x + 1, y) ? 2 : 0)
              | (this.isSolidTile(x, y + 1) ? 4 : 0) | (this.isSolidTile(x - 1, y) ? 8 : 0);
      let v = m;
      if (m === 15) {
        const r = h2(x * 31 + y, y * 17 + x);
        if (r > 0.85) v = 16;       // variant 0 (tiles.soilVar frame 0)
        else if (r > 0.7) v = 17;   // variant 1
      }
      this.autotile[y * this.w + x] = v;
    }
  }

  _computeDeco() {
    // decoration pass — visual only, never colliding
    this.deco = []; // {name, frame, tx, ty}
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.grid[y * this.w + x] !== T.SOLID) continue;
      // tops
      if (!this.isSolidTile(x, y - 1) && this.tile(x, y - 1) === T.EMPTY) {
        const r = h2(x * 7 + 1, y * 13 + this.id.length);
        if (r > 0.78) {
          const pick = r > 0.965 ? 'tiles.dewdrop' : r > 0.93 ? 'tiles.flower' : r > 0.87 ? 'tiles.rock' : 'tiles.tuft';
          this.deco.push({ name: pick, tx: x, ty: y - 1 });
        }
      }
      // hanging vines under ceilings
      if (!this.isSolidTile(x, y + 1) && this.tile(x, y + 1) === T.EMPTY) {
        const r = h2(x * 11 + 3, y * 5 + 7);
        if (r > 0.92) {
          const len = 2 + Math.floor(r * 100) % 3;
          for (let i = 0; i < len; i++) {
            if (this.tile(x, y + 1 + i) !== T.EMPTY) break;
            const name = i === 0 ? 'tiles.vineTop' : i === len - 1 ? 'tiles.vineEnd' : 'tiles.vineMid';
            this.deco.push({ name, tx: x, ty: y + 1 + i, sway: x });
          }
        }
      }
    }
  }

  // ---- collision interface (used by physics.js) ----
  solidRect(r) {
    const x0 = Math.floor(r.x / C.TILE), x1 = Math.floor((r.x + r.w - 1) / C.TILE);
    const y0 = Math.floor(r.y / C.TILE), y1 = Math.floor((r.y + r.h - 1) / C.TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (this.isSolidTile(tx, ty) && this.tile(tx, ty) !== T.EMPTY) {
        if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h || this.grid[ty * this.w + tx] === T.SOLID) return true;
      }
    }
    for (const s of this.extraSolids) {
      if (r.x < s.x + s.w && r.x + r.w > s.x && r.y < s.y + s.h && r.y + r.h > s.y) return true;
    }
    return false;
  }

  onewayStop(r, prevBottom) {
    const newBottom = r.y + r.h;
    const row = Math.floor((newBottom - 1) / C.TILE);
    const top = row * C.TILE;
    if (prevBottom > top) return false; // was already below the surface
    const x0 = Math.floor(r.x / C.TILE), x1 = Math.floor((r.x + r.w - 1) / C.TILE);
    for (let tx = x0; tx <= x1; tx++) {
      if (tx >= 0 && tx < this.w && row >= 0 && row < this.h && this.grid[row * this.w + tx] === T.ONEWAY) return true;
    }
    return false;
  }

  thornsRect(r) {
    const x0 = Math.floor(r.x / C.TILE), x1 = Math.floor((r.x + r.w - 1) / C.TILE);
    const y0 = Math.floor(r.y / C.TILE), y1 = Math.floor((r.y + r.h - 1) / C.TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
      if (this.grid[ty * this.w + tx] !== T.THORNS) continue;
      // hazard hitbox inset (forbidden list #5): 12×10 in the tile's lower half
      const hx = tx * C.TILE + 2, hy = ty * C.TILE + 6, hw = 12, hh = 10;
      if (r.x < hx + hw && r.x + r.w > hx && r.y < hy + hh && r.y + r.h > hy) return true;
    }
    return false;
  }

  waterRect(r) {
    const x0 = Math.floor(r.x / C.TILE), x1 = Math.floor((r.x + r.w - 1) / C.TILE);
    const y0 = Math.floor(r.y / C.TILE), y1 = Math.floor((r.y + r.h - 1) / C.TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
      if (this.grid[ty * this.w + tx] === T.WATER) return true;
    }
    return false;
  }

  groundedOn(r) { // standing check: solid or oneway directly below
    if (this.solidRect({ x: r.x, y: r.y + 1, w: r.w, h: r.h })) return true;
    return this.onewayStop({ x: r.x, y: r.y + 1, w: r.w, h: r.h }, r.y + r.h);
  }

  // ---- render ----
  draw(ctx, cam, t) {
    const ox = cam.ox(), oy = cam.oy();
    const x0 = Math.max(0, Math.floor(ox / C.TILE)), x1 = Math.min(this.w - 1, Math.floor((ox + C.VIEW_W) / C.TILE));
    const y0 = Math.max(0, Math.floor(oy / C.TILE)), y1 = Math.min(this.h - 1, Math.floor((oy + C.VIEW_H) / C.TILE));
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const g = this.grid[ty * this.w + tx];
      const px = tx * C.TILE - ox, py = ty * C.TILE - oy;
      if (g === T.SOLID) {
        const a = this.autotile[ty * this.w + tx];
        if (a >= 16) drawTile(ctx, 'tiles.soilVar', a - 16, px, py);
        else drawTile(ctx, 'tiles.soil', a, px, py);
      } else if (g === T.ONEWAY) {
        drawTile(ctx, 'tiles.oneway', 0, px, py);
      } else if (g === T.THORNS) {
        drawTile(ctx, 'tiles.thorns', 0, px, py);
        // pulsing hazard shimmer — thorns must never be missable (playtest fix)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.10 + 0.06 * Math.sin(t * 3 + tx);
        ctx.fillStyle = '#e83b3b';
        ctx.fillRect(px, py + 4, C.TILE, 12);
        ctx.restore();
      } else if (g === T.WATER) {
        // dew pool — the style bible's "jewelry": teal body, shimmering
        // sine surface line, sparse sparkle pixels
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#30e1b9';
        ctx.fillRect(px, py + 6, C.TILE, 10);
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#8ff8e2';
        for (let sx = 0; sx < C.TILE; sx += 4) {
          const dy = Math.round(Math.sin(t * 2.4 + (tx * C.TILE + sx) * 0.22));
          ctx.fillRect(px + sx, py + 5 + dy, 4, 1);
        }
        if (((tx * 7 + ty) % 5) === 0) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + tx * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + (tx * 5) % 12 + 2, py + 8, 1, 1);
        }
        ctx.restore();
      }
    }
    // deco (sway via 1px offset on a slow, per-instance-offset clock)
    for (const d of this.deco) {
      if (d.tx < x0 - 1 || d.tx > x1 + 1 || d.ty < y0 - 1 || d.ty > y1 + 1) continue;
      let sx = 0;
      if (d.sway != null) sx = Math.round(Math.sin(t * 1.5 + d.sway * 1.7) * 0.8);
      drawTile(ctx, d.name, 0, d.tx * C.TILE - ox + sx, d.ty * C.TILE - oy);
    }
  }
}

export class World {
  constructor(levelDef) {
    this.levelDef = levelDef;
    this.rooms = new Map();
    for (const rd of levelDef.rooms) {
      if (this.rooms.has(rd.id)) fail(rd.id, 'duplicate room id');
      this.rooms.set(rd.id, new Room(rd, levelDef.id));
    }
    // validate doors both ways
    for (const room of this.rooms.values()) {
      for (const [ch, d] of room.doors) {
        const to = d.def.to;
        if (to.startsWith('level:')) continue; // cross-level exit
        const target = this.rooms.get(to);
        if (!target) fail(room.id, `door '${ch}' targets unknown room '${to}'`);
        if (!target.doors.has(d.def.toDoor)) fail(room.id, `door '${ch}' targets '${to}:${d.def.toDoor}' which does not exist`);
      }
    }
    if (!levelDef.start || !this.rooms.has(levelDef.start.room)) {
      throw new Error(`[level:${levelDef.id}] start.room missing or unknown`);
    }
  }
  room(id) { return this.rooms.get(id); }
}
