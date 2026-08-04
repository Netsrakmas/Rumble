// enemies.js — Level-1 roster: Weevil (walker), Gnat (flyer), Sporespitter
// (telegraphing turret). Generous telegraphs per research (fix, not copy).

import { C, PAL } from '../constants.js';
import { Body, moveX, moveY, overlaps } from '../engine/physics.js';
import { drawSprite, Anim } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';

class EnemyBase {
  constructor(x, y, w, h, hp) {
    this.body = new Body(x, y, w, h);
    this.hp = hp;
    this.dead = false;
    this.flashT = 0;
    this.contactDmg = 1;
  }
  get cx() { return this.body.cx; }
  get cy() { return this.body.y + this.body.h / 2; }
  hitbox() { return this.body.rect(); }

  onHit(game, dmg, fromX, knock = 60) {
    if (this.dead) return;
    this.hp -= dmg;
    this.flashT = 0.1;
    this.body.vx = Math.sign(this.cx - fromX) * knock;
    game.particles.burst(this.cx, this.cy, 5, { speed: 90, color: PAL.enemy, life: 0.25 });
    if (this.hp <= 0) this.die(game);
    else sfx.bossHit();
  }

  die(game) {
    this.dead = true;
    game.hitstop(C.killHitstop);
    game.camera.addTrauma(0.15);
    game.particles.burst(this.cx, this.cy, 14, { speed: 130, color: PAL.enemy, life: 0.4 });
    game.particles.burst(this.cx, this.cy, 6, { speed: 60, color: PAL.ui, life: 0.3 });
    sfx.kill();
  }
}

export class Weevil extends EnemyBase {
  constructor(x, y) {
    super(x, y, 12, 12, 2);
    this.dir = -1;
    this.speed = 30;
    this.anim = new Anim('enemy.weevil');
  }
  update(dt, game) {
    const room = game.room;
    const b = this.body;
    this.flashT -= dt;
    // knockback decay
    if (Math.abs(b.vx) > this.speed) b.vx -= Math.sign(b.vx) * 300 * dt;
    else b.vx = this.dir * this.speed;
    // turn at walls
    if (moveX(b, b.vx * dt, room)) { this.dir *= -1; b.vx = this.dir * this.speed; }
    // gravity + floor
    b.vy = Math.min(b.vy + C.gravity * dt, C.maxFall);
    if (moveY(b, b.vy * dt, room) > 0) b.vy = 0;
    // turn at ledges (only when grounded)
    const ahead = { x: b.x + (this.dir > 0 ? b.w : -2), y: b.y + b.h + 1, w: 2, h: 2 };
    if (b.vy === 0 && !room.solidRect(ahead) && !room.onewayStop({ ...ahead, y: ahead.y }, ahead.y)) this.dir *= -1;
    this.anim.update(dt);
  }
  render(ctx, cam) {
    drawSprite(ctx, 'enemy.weevil', this.anim.frame(), this.cx - cam.ox(), this.body.bottom - cam.oy() - 1, { flip: this.dir > 0, white: this.flashT > 0 });
  }
}

export class Gnat extends EnemyBase {
  constructor(x, y, radius = 3) {
    super(x, y, 10, 8, 1);
    this.home = { x, y };
    this.radius = radius * C.TILE;
    this.t = Math.random() * 10;
    this.anim = new Anim('enemy.gnat');
  }
  update(dt, game) {
    this.t += dt;
    this.flashT -= dt;
    const b = this.body;
    const p = game.player;
    const dx = p.cx - this.cx, dy = p.cy - this.cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 6 * C.TILE && !p.dead) {
      // drift toward player
      b.vx += (dx / (dist || 1)) * 220 * dt;
      b.vy += (dy / (dist || 1)) * 220 * dt;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 46) { b.vx *= 46 / sp; b.vy *= 46 / sp; }
    } else {
      // lazy sine hover around home
      const hx = this.home.x + Math.sin(this.t * 0.7) * this.radius;
      const hy = this.home.y + Math.sin(this.t * 1.3) * 8;
      b.vx += (hx - b.x) * 2 * dt * 10;
      b.vy += (hy - b.y) * 2 * dt * 10;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 30) { b.vx *= 30 / sp; b.vy *= 30 / sp; }
    }
    if (moveX(b, b.vx * dt, game.room)) b.vx *= -0.6;
    if (moveY(b, b.vy * dt, game.room) !== 0) b.vy *= -0.6;
    this.anim.update(dt);
  }
  render(ctx, cam) {
    drawSprite(ctx, 'enemy.gnat', this.anim.frame(), this.cx - cam.ox(), this.body.bottom - cam.oy() + 3, { flip: this.body.vx > 0, white: this.flashT > 0 });
  }
}

export class Sporespitter extends EnemyBase {
  constructor(x, y) {
    super(x, y, 12, 20, 3);
    this.state = 'idle';
    this.timer = 1 + Math.random();
    this.anim = new Anim('enemy.spitter.idle');
  }
  update(dt, game) {
    this.flashT -= dt;
    this.timer -= dt;
    const p = game.player;
    const dist = Math.abs(p.cx - this.cx);
    if (this.state === 'idle') {
      this.anim.set('enemy.spitter.idle');
      if (this.timer <= 0 && dist < 8 * C.TILE && !p.dead) {
        this.state = 'windup'; this.timer = 0.4; // readable telegraph
        this.anim.set('enemy.spitter.windup', true);
      }
    } else if (this.state === 'windup') {
      if (this.timer <= 0) {
        this.state = 'spit'; this.timer = 0.25;
        this.anim.set('enemy.spitter.spit', true);
        // lob a spore toward the player in an arc
        const dir = Math.sign(p.cx - this.cx) || 1;
        const dx = Math.min(Math.abs(p.cx - this.cx), 7 * C.TILE);
        game.enemyProjectile(this.cx, this.body.y + 2, dir * (40 + dx * 0.55), -170, 'spore');
        game.particles.burst(this.cx, this.body.y + 2, 4, { speed: 40, color: PAL.enemy, life: 0.3, g: -40 });
      }
    } else if (this.state === 'spit') {
      if (this.timer <= 0) { this.state = 'idle'; this.timer = 2.2; }
    }
    this.anim.update(dt);
  }
  render(ctx, cam) {
    drawSprite(ctx, this.anim.name, this.anim.frame(), this.cx - cam.ox(), this.body.bottom - cam.oy(), { white: this.flashT > 0 });
  }
}

export function makeEnemy(e, px, py) {
  switch (e.type) {
    case 'weevil': return new Weevil(px, py);
    case 'gnat': return new Gnat(px, py, e.radius);
    case 'spitter': return new Sporespitter(px, py);
    default: return null;
  }
}
export { overlaps };
