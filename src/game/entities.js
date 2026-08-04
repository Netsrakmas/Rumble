// entities.js — interactive world objects: tickets, gun pedestal, checkpoints,
// vending machine, signs, doors, trophies. All placed by level data.

import { C, PAL } from '../constants.js';
import { drawSprite, Anim } from '../engine/sprites.js';
import { drawText } from '../engine/text.js';
import { sfx } from '../engine/audio.js';
import { overlaps } from '../engine/physics.js';

export class Ticket {
  constructor(tx, ty, key) {
    this.x = tx * C.TILE + 8; this.y = ty * C.TILE + 8;
    this.key = key; // persistence id "room:tx,ty"
    this.t = (tx * 7 + ty * 3) % 10;
    this.done = false;
  }
  rect() { return { x: this.x - 5, y: this.y - 5, w: 10, h: 10 }; }
  update(dt, game) {
    this.t += dt;
    if (!this.done && overlaps(this.rect(), game.player.hurtbox())) {
      this.done = true;
      game.collect(this.key);
      game.tickets++;
      game.particles.burst(this.x, this.y, 7, { speed: 70, g: -60, color: PAL.dewHalo, life: 0.35, add: true });
      sfx.ticket();
    }
  }
  render(ctx, cam) {
    const bob = Math.round(Math.sin(this.t * 3) * 1.5);
    drawSprite(ctx, 'props.ticket', 0, this.x - cam.ox(), this.y + 4 + bob - cam.oy());
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.1 + Math.sin(this.t * 4) * 0.05;
    ctx.fillStyle = PAL.dewHalo;
    ctx.fillRect(this.x - 6 - cam.ox(), this.y - 6 + bob - cam.oy(), 12, 12);
    ctx.restore();
  }
}

export class GunPickup {
  constructor(tx, ty) {
    this.x = tx * C.TILE + 8; this.y = ty * C.TILE + 16;
    this.t = 0; this.done = false;
  }
  rect() { return { x: this.x - 8, y: this.y - 24, w: 16, h: 24 }; }
  update(dt, game) {
    this.t += dt;
    if (!this.done && overlaps(this.rect(), game.player.hurtbox())) {
      this.done = true;
      game.flags.gun = true;
      game.hitstop(0.12);
      game.camera.addTrauma(0.35);
      game.showMessage('THE PEA-POPPER!\nX: SHOOT  HOLD X: CHARGE\nAIM DOWN IN AIR: GUN-JUMP!', 4.5);
      game.particles.burst(this.x, this.y - 10, 18, { speed: 100, color: PAL.leafHi, life: 0.5, add: true });
      game.saveState();
      sfx.unlock();
    }
  }
  render(ctx, cam) {
    drawSprite(ctx, 'props.pedestal', 0, this.x - cam.ox(), this.y - 1 - cam.oy());
    if (!this.done) {
      const bob = Math.round(Math.sin(this.t * 2.5) * 2);
      drawSprite(ctx, 'props.gun', 0, this.x - cam.ox(), this.y - 10 + bob - cam.oy());
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.15 + Math.sin(this.t * 3) * 0.06;
      const g = ctx.createRadialGradient(this.x - cam.ox(), this.y - 14 - cam.oy(), 2, this.x - cam.ox(), this.y - 14 - cam.oy(), 12);
      g.addColorStop(0, PAL.leafHi); g.addColorStop(1, 'rgba(205,223,108,0)');
      ctx.fillStyle = g;
      ctx.fillRect(this.x - 14 - cam.ox(), this.y - 28 - cam.oy(), 28, 28);
      ctx.restore();
    }
  }
}

export class Checkpoint {
  constructor(tx, ty, id) {
    this.x = tx * C.TILE + 8; this.y = (ty + 1) * C.TILE;
    this.id = id;
    this.anim = new Anim('props.checkpoint');
    this.active = false;
    this.flashT = 0;
  }
  rect() { return { x: this.x - 10, y: this.y - 26, w: 20, h: 26 }; }
  update(dt, game) {
    this.anim.update(dt);
    this.flashT -= dt;
    this.active = game.checkpoint && game.checkpoint.id === this.id;
    if (!this.active && overlaps(this.rect(), game.player.hurtbox())) {
      game.setCheckpoint(this);
      this.flashT = 0.3;
      game.player.hp = C.playerHP;
      game.particles.burst(this.x, this.y - 14, 8, { speed: 60, g: -80, color: PAL.dewHalo, life: 0.5, add: true });
      sfx.checkpoint();
    }
  }
  render(ctx, cam) {
    drawSprite(ctx, 'props.checkpoint', this.anim.frame(), this.x - cam.ox(), this.y - 1 - cam.oy(), { white: this.flashT > 0 });
    if (this.active) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.18;
      const cx = this.x - cam.ox(), cy = this.y - 13 - cam.oy();
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      g.addColorStop(0, PAL.dewHalo); g.addColorStop(1, 'rgba(143,248,226,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - 14, cy - 14, 28, 28);
      ctx.restore();
    }
  }
}

export class Vending {
  constructor(tx, ty, items) {
    this.x = tx * C.TILE + 8; this.y = (ty + 1) * C.TILE;
    this.items = items; // [{id, name, desc, cost}]
    this.near = false;
  }
  rect() { return { x: this.x - 14, y: this.y - 32, w: 28, h: 32 }; }
  update(dt, game) {
    this.near = overlaps(this.rect(), game.player.hurtbox());
    if (this.near && game.input.pressed('up')) {
      game.openShop(this);
    }
  }
  render(ctx, cam) {
    drawSprite(ctx, 'props.vending', 0, this.x - cam.ox(), this.y - 1 - cam.oy());
    // lamp glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = PAL.dew;
    ctx.fillRect(this.x + 6 - cam.ox(), this.y - 28 - cam.oy(), 6, 12);
    ctx.restore();
    if (this.near) drawText(ctx, 'UP: SHOP', this.x - cam.ox(), this.y - 40 - cam.oy(), PAL.ui, { align: 'center' });
  }
}

export class Sign {
  constructor(tx, ty, text) {
    this.x = tx * C.TILE + 8; this.y = (ty + 1) * C.TILE;
    this.text = text;
    this.near = false;
  }
  rect() { return { x: this.x - 16, y: this.y - 20, w: 32, h: 20 }; }
  update(dt, game) {
    this.near = overlaps(this.rect(), game.player.hurtbox());
  }
  render(ctx, cam) {
    drawSprite(ctx, 'props.sign', 0, this.x - cam.ox(), this.y - 1 - cam.oy());
    if (this.near) {
      const lines = this.text.split('\n').length;
      drawText(ctx, this.text, this.x - cam.ox(), this.y - 22 - lines * 6 - cam.oy(), PAL.ui, { align: 'center' });
    }
  }
}

export class Trophy {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.t = 0; this.done = false;
    this.vy = -120;
  }
  rect() { return { x: this.x - 8, y: this.y - 14, w: 16, h: 14 }; }
  update(dt, game) {
    this.t += dt;
    // fall to ground
    this.vy = Math.min(this.vy + C.gravity * dt, C.maxFall);
    const step = this.vy * dt;
    if (!game.room.solidRect({ x: this.x - 6, y: this.y + step - 12, w: 12, h: 12 })) this.y += step;
    else this.vy = 0;
    if (!this.done && this.t > 0.5 && overlaps(this.rect(), game.player.hurtbox())) {
      this.done = true;
      game.flags.trophy = true;
      game.hitstop(0.1);
      game.showMessage('GOT THE SPORE SHROOM!\nTHE GARDEN GATE IS OPEN', 3.5);
      game.particles.burst(this.x, this.y - 8, 16, { speed: 90, color: PAL.enemy, life: 0.5 });
      game.saveState();
      sfx.unlock();
    }
  }
  render(ctx, cam) {
    if (this.done) return;
    const bob = this.vy === 0 ? Math.round(Math.sin(this.t * 3) * 1.5) : 0;
    drawSprite(ctx, 'props.trophy', 0, this.x - cam.ox(), this.y - 1 + bob - cam.oy());
  }
}

export class Door {
  constructor(tx, ty, def) {
    // char tile marks the door base; sprite is 16×32 (2 tiles tall)
    this.tx = tx; this.ty = ty;
    this.x = tx * C.TILE + 8; this.y = (ty + 1) * C.TILE;
    this.def = def;
    this.locked = false;   // boss lock
    this.denyT = 0;
    this.armed = false;    // arms once the player is clear — stops instant re-trigger on arrival
  }
  rect() { return { x: this.tx * C.TILE + 2, y: (this.ty - 1) * C.TILE, w: 12, h: 32 }; }
  update(dt, game) {
    this.denyT -= dt;
    if (game.transitionT > 0 || game.player.dead) return;
    if (!overlaps(this.rect(), game.player.hurtbox())) { this.armed = true; return; }
    if (!this.armed || this.locked) return;
    const req = this.def.requires;
    if (req && !game.flags[req]) {
      if (this.denyT <= 0) {
        this.denyT = 1.2;
        game.showMessage(this.def.denyText || "IT WON'T BUDGE...", 2);
        sfx.deny();
        // nudge back
        game.player.body.vx = (game.player.cx < this.x ? -1 : 1) * 120;
      }
      return;
    }
    game.enterDoor(this);
  }
  render(ctx, cam, game) {
    drawSprite(ctx, 'props.door', 0, this.x - cam.ox(), this.y - 1 - cam.oy());
    if (this.locked) { // vine bars while boss lives
      ctx.fillStyle = PAL.leafDark;
      for (let i = 0; i < 3; i++) ctx.fillRect(this.x - 6 - cam.ox(), this.y - 28 + i * 9 - cam.oy(), 12, 3);
    } else if (this.def.requires && !game.flags[this.def.requires]) {
      ctx.fillStyle = PAL.beeAccent;
      ctx.fillRect(this.x - 2 - cam.ox(), this.y - 18 - cam.oy(), 4, 5); // lock blob
    }
  }
}
