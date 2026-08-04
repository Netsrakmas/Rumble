// player.js — Rumble. Full verb set: run, jump (coyote/buffer/variable/corner-
// correction), gun-jump, shoot, charge shot, pistol-whip, roll, crawl,
// wall slide/jump (Burr Boots). All numbers from constants.js (LOCKED).

import { C, PAL } from '../constants.js';
import { Body, moveX, moveY, cornerCorrectUp } from '../engine/physics.js';
import { drawSprite, Anim } from '../engine/sprites.js';
import { sfx } from '../engine/audio.js';

const STAND_H = 14, CRAWL_H = 8, HB_W = 8;

export class Player {
  constructor(x, y) {
    this.body = new Body(x, y, HB_W, STAND_H);
    this.facing = 1;
    this.grounded = false;
    this.hp = C.playerHP;
    this.dead = false;

    // timers
    this.coyoteT = 0; this.bufferT = 0; this.varJumpT = 0;
    this.shotCd = 0; this.chargeT = 0; this.charging = false;
    this.meleeCd = 0; this.meleeT = 0;
    this.rollT = 0; this.rollCd = 0;
    this.iframesT = 0; this.hurtT = 0;
    this.wallLockT = 0; this.wallLockDir = 0;
    this.crawling = false;
    this.gunjumpCharges = C.gunjumpCharges;
    this.dropT = 0; // oneway drop-through window

    // presentation
    this.anim = new Anim('player.idle');
    this.sqX = 1; this.sqY = 1;
    this.gunjumpFlashT = 0;
    this.wallDir = 0;
  }

  get cx() { return this.body.cx; }
  get cy() { return this.body.y + this.body.h / 2; }
  get vy() { return this.body.vy; }
  get vx() { return this.body.vx; }

  hurtbox() { return this.body.rect(); }

  squash(x, y) { this.sqX = x; this.sqY = y; }

  // ---- verbs ----
  tryJump(game) {
    this.body.vy = C.jumpVy;
    this.varJumpT = C.varJumpTime;
    this.coyoteT = 0; this.bufferT = 0;
    this.body.vx += Math.sign(this.body.vx) !== 0 ? Math.sign(this.body.vx) * 0 : 0;
    this.squash(...C.squashJump);
    game.particles.landDust(this.cx, this.body.bottom);
    sfx.jump();
  }

  wallJump(dir, game) { // dir = away from wall
    this.body.vy = C.wallJumpVy;
    this.body.vx = C.wallJumpVx * dir;
    this.wallLockT = C.wallJumpLock; this.wallLockDir = dir;
    this.varJumpT = 0; this.bufferT = 0; this.coyoteT = 0;
    this.facing = dir;
    this.squash(...C.squashJump);
    game.particles.burst(this.cx - dir * 4, this.cy, 4, { speed: 50, g: 60, color: PAL.ui, life: 0.25 });
    sfx.jump();
  }

  gunjump(game, charged) {
    this.gunjumpCharges--;
    this.body.vy = C.gunjumpVy * (charged ? C.gunjumpChargeMult : 1);
    game.fireProjectile(this.cx, this.body.bottom - 2, 0, charged ? C.chargeShotSpeed : C.shotSpeed, charged);
    game.hitstop(C.gunjumpFreeze);
    game.camera.addTrauma(charged ? 0.3 : 0.18);
    this.squash(0.8, 1.25);
    this.gunjumpFlashT = 0.1;
    game.particles.burst(this.cx, this.body.bottom, 5, { speed: 70, g: -100, spread: 0.7, angle: Math.PI / 2, color: PAL.beeAccent, life: 0.2, add: true });
    sfx.gunjump();
  }

  shoot(game, charged) {
    const up = game.input.down('up');
    let vx = 0, vy = 0;
    const sp = charged ? C.chargeShotSpeed : C.shotSpeed;
    if (up) { vy = -sp; } else { vx = this.facing * sp; }
    const oy = up ? this.body.y : this.body.y + 5;
    const ox = up ? this.cx : this.cx + this.facing * 6;
    game.fireProjectile(ox, oy, vx, vy, charged);
    this.shotCd = C.shotCooldown;
    if (charged) { game.camera.addTrauma(0.25); game.hitstop(0.03); sfx.chargeShot(); }
    else sfx.shoot();
    this.gunjumpFlashT = 0.08;
    // tiny recoil
    if (!up) this.body.vx -= this.facing * (charged ? 40 : 12);
  }

  melee(game) {
    this.meleeCd = C.meleeCooldown;
    this.meleeT = 0.12;
    this.anim.set('player.melee', true);
    sfx.melee();
  }

  meleeBox() {
    if (this.meleeT <= 0) return null;
    return { x: this.facing > 0 ? this.body.x + this.body.w : this.body.x - C.meleeRange, y: this.body.y - 4, w: C.meleeRange, h: this.body.h + 8 };
  }

  hurt(game, fromX, dmg = 1) {
    if (this.iframesT > 0 || this.dead) return false;
    this.hp -= dmg;
    this.iframesT = C.hurtIFrames;
    this.hurtT = 0.25;
    this.rollT = 0; this.crawlSet(false, game);
    this.body.vy = -180;
    this.body.vx = Math.sign(this.cx - fromX) * 160 || -this.facing * 160;
    game.hitstop(C.hurtHitstop);
    game.camera.addTrauma(0.5);
    game.particles.burst(this.cx, this.cy, 8, { speed: 120, color: PAL.beeAccent, life: 0.3 });
    sfx.hurt();
    if (this.hp <= 0) this.die(game);
    return true;
  }

  die(game) {
    this.dead = true;
    game.onPlayerDeath();
  }

  crawlSet(on, game) {
    if (on === this.crawling) return true;
    const b = this.body;
    if (on) {
      b.y += STAND_H - CRAWL_H; b.h = CRAWL_H;
      this.crawling = true;
    } else {
      // need headroom to stand
      const test = { x: b.x, y: b.y - (STAND_H - CRAWL_H), w: b.w, h: STAND_H };
      if (game.room.solidRect(test)) return false;
      b.y -= STAND_H - CRAWL_H; b.h = STAND_H;
      this.crawling = false;
    }
    return true;
  }

  // ---- fixed update ----
  update(dt, game) {
    if (this.dead) return;
    const input = game.input;
    const room = game.room;
    const b = this.body;

    // timers
    this.coyoteT -= dt; this.bufferT -= dt; this.shotCd -= dt;
    this.meleeCd -= dt; this.meleeT -= dt; this.rollCd -= dt;
    this.iframesT -= dt; this.hurtT -= dt; this.wallLockT -= dt;
    this.gunjumpFlashT -= dt; this.dropT -= dt;

    const rolling = this.rollT > 0;
    const stunned = this.hurtT > 0;

    let ax = 0;
    if (!stunned && !rolling) {
      if (input.down('left')) ax = -1;
      if (input.down('right')) ax = 1;
      if (this.wallLockT > 0) ax = this.wallLockDir; // wall-jump input override
      if (ax !== 0 && !this.crawling) this.facing = ax;
    }

    // ---- crawl enter/exit ----
    if (this.grounded && !rolling && !stunned) {
      if (input.down('down') && !this.crawling && !input.pressed('jump')) this.crawlSet(true, game);
      else if (!input.down('down') && this.crawling) this.crawlSet(false, game);
    }
    // forced crawl under low ceilings persists until headroom exists
    if (this.crawling && !input.down('down')) this.crawlSet(false, game);

    // ---- roll ----
    if (!stunned && !rolling && !this.crawling && this.grounded && this.rollCd <= 0 && input.pressed('roll')) {
      this.rollT = C.rollTime; this.rollCd = C.rollCooldown + C.rollTime;
      this.iframesT = Math.max(this.iframesT, C.rollIFrames);
      b.vx = this.facing * C.rollSpeed;
      game.particles.landDust(this.cx, b.bottom);
      sfx.roll();
      this.anim.set('player.roll', true);
    }
    if (rolling) {
      this.rollT -= dt;
      b.vx = this.facing * C.rollSpeed * (0.6 + 0.4 * (this.rollT / C.rollTime));
    }

    // ---- horizontal movement ----
    if (!rolling) {
      const max = this.crawling ? C.crawlSpeed : C.maxRun;
      const accel = (this.grounded ? C.runAccel : C.runAccel * C.airMult) * dt;
      if (ax !== 0 && !stunned) {
        if (Math.sign(b.vx) !== ax && Math.abs(b.vx) > 0) b.vx += ax * accel * 1.6; // turn boost
        else if (Math.abs(b.vx) < max) b.vx = ax * Math.min(max, Math.abs(b.vx) + accel);
        else b.vx -= Math.sign(b.vx) * C.runReduce * dt; // over max: bleed
      } else {
        const red = (this.grounded ? C.runReduce : C.runReduce * 0.4) * dt;
        b.vx = Math.abs(b.vx) <= red ? 0 : b.vx - Math.sign(b.vx) * red;
      }
    }

    // ---- wall detection (Burr Boots) ----
    this.wallDir = 0;
    if (!this.grounded && !this.crawling && game.flags.burrBoots) {
      const nearL = room.solidRect(b.rect(-2, 0));
      const nearR = room.solidRect(b.rect(2, 0));
      if (nearL && input.down('left')) this.wallDir = -1;
      else if (nearR && input.down('right')) this.wallDir = 1;
    }
    const wallSliding = this.wallDir !== 0 && b.vy > 0;

    // ---- jumping ----
    if (input.pressed('jump')) this.bufferT = C.jumpBuffer;
    if (this.grounded) { this.coyoteT = C.coyote; this.gunjumpCharges = C.gunjumpCharges; }

    if (this.bufferT > 0 && !stunned) {
      if (this.grounded && this.crawling && input.down('down') && room.onewayStop({ x: b.x, y: b.y + 1, w: b.w, h: b.h }, b.bottom) && !room.solidRect(b.rect(0, 1))) {
        // drop through oneway (down+jump)
        this.dropT = 0.25; this.bufferT = 0;
      } else if (input.down('down') && this.grounded && !this.crawling &&
                 room.onewayStop({ x: b.x, y: b.y + 1, w: b.w, h: b.h }, b.bottom) && !room.solidRect(b.rect(0, 1))) {
        this.dropT = 0.25; this.bufferT = 0;
      } else if ((this.grounded || this.coyoteT > 0) && !this.crawling && !rolling) {
        this.tryJump(game);
      } else if (wallSliding || (!this.grounded && game.flags.burrBoots &&
                 (room.solidRect(b.rect(-3, 0)) || room.solidRect(b.rect(3, 0))))) {
        const dir = room.solidRect(b.rect(-3, 0)) ? 1 : -1;
        this.wallJump(dir, game);
      }
    }
    // variable jump: sustain while held (Celeste VarJumpTime pattern)
    if (this.varJumpT > 0) {
      if (input.down('jump')) { b.vy = Math.min(b.vy, C.jumpVy); this.varJumpT -= dt; }
      else this.varJumpT = 0;
    }

    // ---- gravity ----
    let grav = C.gravity;
    if (b.vy > 0) grav *= C.fallGravMult;
    else if (Math.abs(b.vy) < C.apexWindow && input.down('jump')) grav *= C.apexGravMult;
    b.vy += grav * dt;
    let maxFall = input.down('down') && !this.grounded ? C.fastFall : C.maxFall;
    if (wallSliding) {
      if (b.vy > C.wallSlideMax) b.vy = C.wallSlideMax;
      if (Math.random() < 0.3) game.particles.spawn({ x: this.cx + this.wallDir * 4, y: b.y + 2, vx: 0, vy: 30, size: 1, color: PAL.ui, life: 0.2 });
    }
    if (b.vy > maxFall) b.vy = maxFall;

    // ---- shooting / gun-jump / charge ----
    if (game.flags.gun && !stunned && !rolling && !this.crawling) {
      if (input.pressed('shoot') && this.shotCd <= 0) {
        if (!this.grounded && input.down('down') && this.gunjumpCharges > 0) {
          this.gunjump(game, false);
          this.shotCd = C.shotCooldown;
        } else {
          this.shoot(game, false);
        }
        this.chargeT = 0; this.charging = true; this._chargePlayed = false;
      }
      if (input.down('shoot') && this.charging) {
        this.chargeT += dt;
        if (this.chargeT >= C.chargeTime && !this._chargePlayed) { this._chargePlayed = true; sfx.charge(); }
        if (this.chargeT >= C.chargeTime && Math.random() < 0.25) {
          game.particles.spawn({ x: this.cx + this.facing * 8, y: b.y + 5, vx: 0, vy: -20, size: 1, color: PAL.leafHi, life: 0.2, add: true });
        }
      }
      if (!input.down('shoot') && this.charging) {
        if (this.chargeT >= C.chargeTime) {
          if (!this.grounded && input.down('down') && this.gunjumpCharges > 0) this.gunjump(game, true);
          else this.shoot(game, true);
        }
        this.charging = false; this.chargeT = 0;
      }
      if (input.pressed('melee') && this.meleeCd <= 0 && !this.crawling) this.melee(game);
    }

    // ---- integrate: X then Y, pixel-stepped ----
    const hitX = moveX(b, b.vx * dt, room);
    if (hitX) {
      if (rolling) { this.rollT = 0; game.camera.addTrauma(0.1); }
      b.vx = 0;
    }

    const wasGrounded = this.grounded;
    const prevVy = b.vy;
    const hitY = moveY(b, b.vy * dt, room, { drop: this.dropT > 0 });
    if (hitY > 0) { // landed
      if (!wasGrounded) {
        const impact = prevVy;
        if (impact > 150) {
          game.particles.landDust(this.cx, b.bottom, impact > 300);
          const k = Math.min(1, impact / C.maxFall);
          this.squash(1 + 0.35 * k, 1 - 0.35 * k);
          sfx.land();
          if (impact > 380) game.camera.addTrauma(0.2);
        }
      }
      this.grounded = true;
      b.vy = 0;
    } else if (hitY < 0) { // head bonk — corner correction first
      if (b.vy < 0 && cornerCorrectUp(b, room, C.cornerCorrection)) {
        // nudged around the corner, keep rising
      } else {
        b.vy = 0; this.varJumpT = 0;
      }
    }
    if (hitY >= 0) this.grounded = room.groundedOn(b.rect());
    if (!wasGrounded && this.grounded) this.gunjumpCharges = C.gunjumpCharges;
    if (wallSliding) this.gunjumpCharges = C.gunjumpCharges; // wall resets charges too

    // hazards
    if (room.thornsRect(b.rect())) {
      game.playerHitHazard();
    }

    // ---- animation selection ----
    if (this.meleeT > 0) this.anim.set('player.melee');
    else if (rolling) this.anim.set('player.roll');
    else if (this.crawling) this.anim.set('player.crawl');
    else if (stunned) this.anim.set('player.hurt');
    else if (wallSliding) this.anim.set('player.wall');
    else if (!this.grounded) {
      if (this.gunjumpFlashT > 0 && input.down('down')) this.anim.set('player.gunjump');
      else if (b.vy < -40) this.anim.set('player.rise');
      else if (b.vy > 60) this.anim.set('player.fall');
      else this.anim.set('player.apex');
    }
    else if (Math.abs(b.vx) > 10) this.anim.set('player.run');
    else this.anim.set('player.idle');
    this.anim.update(dt);

    // squash ease-back
    const e = 1 - Math.exp(-dt / C.squashEase * 3);
    this.sqX += (1 - this.sqX) * e;
    this.sqY += (1 - this.sqY) * e;
  }

  render(ctx, cam, game) {
    const x = Math.round(this.cx - cam.ox());
    const y = Math.round(this.body.bottom - cam.oy());

    // i-frame blink
    if (this.iframesT > 0 && this.rollT <= 0 && Math.floor(this.iframesT * 12) % 2 === 0 && this.hurtT <= 0) return;

    // Ori-rule halo: player is the brightest thing on screen
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.13;
    const gr = ctx.createRadialGradient(x, y - 8, 2, x, y - 8, 14);
    gr.addColorStop(0, PAL.dewHalo);
    gr.addColorStop(1, 'rgba(143,248,226,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(x - 14, y - 22, 28, 28);
    ctx.restore();

    const opts = { flip: this.facing < 0, sx: this.sqX, sy: this.sqY, white: this.hurtT > 0.15 };
    drawSprite(ctx, this.anim.name, this.anim.frame(), x, y - 1, opts);

    // hat (cosmetic, from vending machine)
    if (game.flags.hat && this.rollT <= 0 && !this.crawling) {
      const hatY = y - 1 - 20 - (this.anim.name === 'player.run' && this.anim.frame() % 3 === 1 ? 1 : 0);
      drawSprite(ctx, 'props.hat', 0, x + (this.facing < 0 ? -1 : 1), hatY, { flip: this.facing < 0 });
    }

    // charge glow on gun
    if (this.charging && this.chargeT >= C.chargeTime) {
      ctx.fillStyle = PAL.leafHi;
      ctx.fillRect(x + this.facing * 9 - 1, y - 12, 2, 2);
    }
  }
}
