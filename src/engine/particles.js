// particles.js — pooled rect particles. Types per style bible.

import { PAL } from '../constants.js';

const MAX = 500;

export class Particles {
  constructor() { this.list = []; }

  spawn(p) {
    if (this.list.length >= MAX) this.list.shift();
    this.list.push({
      x: p.x, y: p.y,
      vx: p.vx || 0, vy: p.vy || 0,
      g: p.g || 0, drag: p.drag || 0,
      size: p.size || 2, color: p.color || PAL.ui,
      life: p.life || 0.3, t: 0,
      alpha: p.alpha ?? 1, fade: p.fade ?? true,
      add: p.add || false,
    });
  }

  burst(x, y, n, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = (opts.angle ?? Math.random() * Math.PI * 2) + (Math.random() - 0.5) * (opts.spread ?? Math.PI * 2);
      const sp = (opts.speed ?? 80) * (0.5 + Math.random() * 0.8);
      this.spawn({
        x: x + (Math.random() - 0.5) * (opts.jx || 4),
        y: y + (Math.random() - 0.5) * (opts.jy || 4),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        g: opts.g ?? 300, drag: opts.drag ?? 2,
        size: opts.size ?? (1 + (Math.random() * 2 | 0)),
        color: opts.color ?? PAL.ui,
        life: (opts.life ?? 0.35) * (0.7 + Math.random() * 0.6),
        add: opts.add,
      });
    }
  }

  landDust(x, y, big = false) {
    this.burst(x, y, big ? 6 : 4, { speed: 40, g: -30, drag: 4, life: 0.3, spread: 0.9, angle: Math.PI, jx: 8, jy: 2, color: PAL.ui });
  }

  update(dt) {
    const l = this.list;
    for (let i = l.length - 1; i >= 0; i--) {
      const p = l[i];
      p.t += dt;
      if (p.t >= p.life) { l.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.vx -= p.vx * p.drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  // cam is optional: world rendering passes the camera; screen-space callers
  // (title screen) omit it
  render(ctx, cam = null) {
    const ox = cam ? cam.ox() : 0, oy = cam ? cam.oy() : 0;
    for (const p of this.list) {
      const a = p.fade ? p.alpha * (1 - p.t / p.life) : p.alpha;
      ctx.globalAlpha = a;
      if (p.add) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - ox), Math.round(p.y - oy), p.size, p.size);
      if (p.add) ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }
}
