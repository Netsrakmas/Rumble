// projectiles.js — player pellets/charge shots + enemy spores/shockwaves.

import { PAL } from '../constants.js';
import { drawSprite } from '../engine/sprites.js';

export class Projectiles {
  constructor() { this.list = []; }

  fire(x, y, vx, vy, opts = {}) {
    this.list.push({
      x, y, vx, vy,
      friendly: opts.friendly ?? true,
      dmg: opts.dmg ?? 1,
      pierce: opts.pierce ?? false,
      g: opts.g ?? 0,
      sprite: opts.sprite ?? 'fx.pellet',
      w: opts.size ?? 4, h: opts.size ?? 4,
      life: opts.life ?? 1.2,
    });
  }

  update(dt, game) {
    const room = game.room;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const rect = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
      if (p.life <= 0 || room.solidRect(rect)) {
        if (p.life > 0) {
          game.particles.burst(p.x, p.y, 4, {
            speed: 60, life: 0.2,
            color: p.friendly ? PAL.leafLight : PAL.enemy,
          });
        }
        this.list.splice(i, 1);
        continue;
      }
      p.hit = rect; // cached for game collision pass
    }
  }

  remove(p) {
    const i = this.list.indexOf(p);
    if (i >= 0) this.list.splice(i, 1);
  }

  render(ctx, cam) {
    for (const p of this.list) {
      drawSprite(ctx, p.sprite, 0, p.x - cam.ox(), p.y - cam.oy());
      // additive glow: green trail on player shots, rose halo on enemy shots
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (p.friendly) {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = PAL.leafHi;
        ctx.fillRect(Math.round(p.x - p.vx * 0.012 - cam.ox()) - 1, Math.round(p.y - p.vy * 0.012 - cam.oy()) - 1, 2, 2);
      } else {
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = PAL.enemy;
        ctx.fillRect(Math.round(p.x - cam.ox()) - 4, Math.round(p.y - cam.oy()) - 4, 8, 8);
      }
      ctx.restore();
    }
  }
}
