// boss.js — Bullhorn Beetle: bull-like charger with READABLE WIND-UPS
// (research-mandated fix to the original's no-telegraph complaint).
// Dance: bait the charge with a gun-jump, punish the wall-slam stun.

import { C, PAL } from '../constants.js';
import { Body, moveX, moveY } from '../engine/physics.js';
import { drawSprite, Anim } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';

const MAX_HP = 12;

export class BullhornBeetle {
  constructor(x, y) {
    this.body = new Body(x, y, 40, 26);
    this.hp = MAX_HP;
    this.maxHp = MAX_HP;
    this.dead = false;
    this.awake = false;
    this.state = 'sleep';
    this.timer = 0;
    this.dir = -1; // sprite faces left
    this.flashT = 0;
    this.contactDmg = 1;
    this.anim = new Anim('boss.idle');
    this.chargedOnce = false;
  }
  get cx() { return this.body.cx; }
  get cy() { return this.body.y + this.body.h / 2; }
  hitbox() { return this.body.rect(); }
  get enraged() { return this.hp <= this.maxHp / 2; }
  get windup() { return this.enraged ? 0.45 : 0.6; }

  wake(game) {
    if (this.awake) return;
    this.awake = true;
    this.state = 'roar'; this.timer = 1.0;
    game.camera.addTrauma(0.6);
    game.hitstop(0.08);
    sfx.bossRoar();
  }

  onHit(game, dmg, fromX) {
    if (this.dead || !this.awake) return;
    this.hp -= dmg;
    this.flashT = 0.1;
    game.particles.burst(this.cx, this.cy, 6, { speed: 100, color: PAL.enemy, life: 0.3 });
    sfx.bossHit();
    if (this.hp <= 0) this.die(game);
  }

  die(game) {
    this.dead = true;
    this.state = 'dying'; this.timer = 1.2;
    game.hitstop(0.1);
    game.camera.addTrauma(0.9);
    sfx.bossDie();
    for (let i = 0; i < 3; i++) {
      game.particles.burst(this.cx + (i - 1) * 12, this.cy, 16, { speed: 150, color: PAL.enemy, life: 0.5 });
    }
    game.onBossDefeated(this);
  }

  update(dt, game) {
    if (this.dead) return;
    this.flashT -= dt;
    const b = this.body;
    const p = game.player;
    const room = game.room;

    // gravity always
    b.vy = Math.min(b.vy + C.gravity * dt, C.maxFall);

    switch (this.state) {
      case 'sleep':
        this.anim.set('boss.idle');
        break;
      case 'roar':
        this.timer -= dt;
        this.anim.set('boss.idle');
        if (this.timer <= 0) this.pickAttack(game);
        break;
      case 'idle':
        this.timer -= dt;
        this.anim.set('boss.idle');
        this.dir = Math.sign(p.cx - this.cx) || this.dir;
        if (this.timer <= 0) this.pickAttack(game);
        break;
      case 'scrape': // charge telegraph — paw the ground
        this.timer -= dt;
        this.anim.set('boss.scrape');
        if (Math.random() < 0.4) game.particles.spawn({ x: this.cx - this.dir * 18, y: b.bottom, vx: -this.dir * 40, vy: -30, size: 2, color: PAL.ui, life: 0.3, g: 200 });
        if (this.timer <= 0) {
          this.state = 'charge';
          this.anim.set('boss.charge', true);
          sfx.bossRoar();
        }
        break;
      case 'charge': {
        this.anim.set('boss.charge');
        const hitWall = moveX(b, this.dir * 260 * dt, room);
        if (Math.random() < 0.5) game.particles.spawn({ x: this.cx - this.dir * 20, y: b.bottom - 2, vx: -this.dir * 30, vy: -20, size: 2, color: PAL.ui, life: 0.25, g: 100 });
        if (hitWall) {
          // WALL SLAM — the punish window
          this.state = 'stun'; this.timer = this.enraged && !this.chargedOnce ? 0.6 : 1.2;
          game.camera.addTrauma(0.6);
          game.hitstop(0.06);
          sfx.bossHit();
          game.particles.burst(this.cx + this.dir * 20, this.cy, 12, { speed: 140, color: PAL.ui, life: 0.4 });
        }
        break;
      }
      case 'stun':
        this.timer -= dt;
        this.anim.set('boss.stun');
        if (this.timer <= 0) {
          if (this.enraged && !this.chargedOnce) { // double charge when enraged
            this.chargedOnce = true;
            this.dir = Math.sign(p.cx - this.cx) || this.dir;
            this.state = 'scrape'; this.timer = this.windup;
          } else {
            this.chargedOnce = false;
            this.state = 'idle'; this.timer = 0.6;
          }
        }
        break;
      case 'hopWind': // hop telegraph — crouch
        this.timer -= dt;
        this.anim.set('boss.scrape');
        if (this.timer <= 0) {
          this.state = 'hop';
          this.anim.set('boss.hop', true);
          b.vy = -330;
          this.hopVx = Math.sign(p.cx - this.cx) * Math.min(180, Math.abs(p.cx - this.cx) * 1.2);
        }
        break;
      case 'hop': {
        moveX(b, this.hopVx * dt, room);
        break;
      }
      case 'dying':
        this.timer -= dt;
        break;
    }

    const hitG = moveY(b, b.vy * dt, room);
    if (hitG > 0) {
      if (this.state === 'hop') { // LAND SLAM
        this.state = 'idle'; this.timer = this.enraged ? 0.5 : 0.9;
        game.camera.addTrauma(0.5);
        game.hitstop(0.05);
        sfx.bossHit();
        game.particles.landDust(this.cx, b.bottom, true);
        // ground shockwave pellets both ways
        game.enemyProjectile(this.cx - 20, b.bottom - 4, -140, -60, 'shock');
        game.enemyProjectile(this.cx + 20, b.bottom - 4, 140, -60, 'shock');
      }
      b.vy = 0;
    }
    this.anim.update(dt);
  }

  pickAttack(game) {
    const p = game.player;
    this.dir = Math.sign(p.cx - this.cx) || this.dir;
    // above me or far → hop; otherwise mostly charge
    const above = p.cy < this.body.y - 20;
    if (above || Math.random() < 0.35) {
      this.state = 'hopWind'; this.timer = 0.5;
    } else {
      this.state = 'scrape'; this.timer = this.windup;
    }
  }

  render(ctx, cam) {
    if (this.dead && this.timer <= 0) return;
    const flip = this.dir > 0; // art faces left
    drawSprite(ctx, this.anim.name, this.anim.frame(), this.cx - cam.ox(), this.body.bottom - cam.oy(), { flip, white: this.flashT > 0 });
  }
}
