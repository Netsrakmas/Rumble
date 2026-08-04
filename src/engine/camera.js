// camera.js — damped follow + lookahead + platform snapping + room clamp
// + trauma-model screen shake (Eiserloh). Whole-pixel offsets only.

import { C } from '../constants.js';

export class Camera {
  constructor() {
    this.x = 0; this.y = 0;          // top-left, world px
    this.trauma = 0;
    this.lookX = 0;
    this.shakeX = 0; this.shakeY = 0;
    this._noiseT = 0;
  }

  jumpTo(target, room) {
    this.x = target.cx - C.VIEW_W / 2;
    this.y = target.cy - C.VIEW_H / 2;
    this.clamp(room);
  }

  addTrauma(t) { this.trauma = Math.min(1, this.trauma + t); }

  update(target, room, dt) {
    // lookahead eases toward facing direction
    const wantLook = target.facing * C.lookahead;
    this.lookX += (wantLook - this.lookX) * (1 - Math.exp(-3 * dt));

    const tx = target.cx + this.lookX - C.VIEW_W / 2;
    this.x += (tx - this.x) * (1 - Math.exp(-C.camK_x * dt));

    // platform snapping: only track Y when grounded or falling fast — never on jump rise
    if (target.grounded || target.vy > 60 || target.forceCamY) {
      const ty = target.cy - C.VIEW_H / 2 - 10;
      this.y += (ty - this.y) * (1 - Math.exp(-C.camK_y * dt));
    }

    this.clamp(room);

    // shake
    this.trauma = Math.max(0, this.trauma - C.traumaDecay * dt);
    const s = this.trauma * this.trauma;
    this._noiseT += dt * 30;
    if (s > 0.001) {
      this.shakeX = Math.round(C.shakeMax * s * (Math.sin(this._noiseT * 1.3) * 0.6 + Math.sin(this._noiseT * 3.7) * 0.4));
      this.shakeY = Math.round(C.shakeMax * s * (Math.cos(this._noiseT * 1.7) * 0.6 + Math.sin(this._noiseT * 2.9) * 0.4));
    } else { this.shakeX = 0; this.shakeY = 0; }
  }

  clamp(room) {
    const maxX = room.pxW - C.VIEW_W, maxY = room.pxH - C.VIEW_H;
    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
    if (room.pxW <= C.VIEW_W) this.x = (room.pxW - C.VIEW_W) / 2;
    if (room.pxH <= C.VIEW_H) this.y = (room.pxH - C.VIEW_H) / 2;
  }

  // integer render origin incl. shake
  ox() { return Math.round(this.x) + this.shakeX; }
  oy() { return Math.round(this.y) + this.shakeY; }
}
