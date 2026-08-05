// game.js — orchestrator: states (title/play/shop/dead/transition/levelToast),
// room loading + door transitions, combat resolution, persistence, ambient FX.

import { C, PAL } from '../constants.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Camera } from '../engine/camera.js';
import { Particles } from '../engine/particles.js';
import { Projectiles } from './projectiles.js';
import { makeEnemy } from './enemies.js';
import { BullhornBeetle } from './boss.js';
import { Ticket, GunPickup, Checkpoint, Vending, Sign, Door, Trophy, DewHeal } from './entities.js';
import { drawBackground, drawForeground } from './background.js';
import { drawSprite, drawTile } from '../engine/sprites.js';
import { drawHud, drawShop } from './hud.js';
import { drawText } from '../engine/text.js';
import { loadSave, writeSave, clearSave, getSettings, setSetting } from '../engine/save.js';
import { overlaps } from '../engine/physics.js';
import { sfx, playMusic, applyAudioSettings } from '../engine/audio.js';
import { LEVELS } from '../levels/index.js';

export class Game {
  constructor(input) {
    this.input = input;
    this.state = 'title';
    this.camera = new Camera();
    this.particles = new Particles();
    this.projectiles = new Projectiles();

    this.flags = { gun: false, burrBoots: false, hat: false, trophy: false };
    this.tickets = 0;
    this.collected = new Set();   // "level:room:key" for one-time pickups
    this.bossesDead = new Set();
    this.checkpoint = null;       // {id, level, room, x, y}

    this.hitstopT = 0;
    this.time = 0;
    this.hpFlashT = 0;      // HUD: flash the just-lost pip
    this.ticketBounceT = 0; // HUD: bounce the counter on pickup
    this._prevHp = C.playerHP;
    this.message = null; this.messageT = 0;
    this.levelToast = ''; this.levelToastT = 0;
    this.transitionT = 0; this.transitionPhase = null; this.pendingDoor = null;
    this.deathT = 0;
    this.shop = null; this.shopSel = 0;
    this.paused = false;
    this.pauseSel = 0;
    this.moteT = 0;
    this.titleSel = 0;
    this.hasSave = !!loadSave();
    this.stats = { deaths: 0, playT: 0 };
    this.introT = 0;        // opening tumble cinematic
    this.visited = new Set();
    this.roomToast = ''; this.roomToastT = 0;
    this.critters = [];
    // completion totals from level data (for the demo-end screen)
    this.totalTickets = 0;
    for (const lvl of Object.values(LEVELS)) {
      for (const r of lvl.rooms) for (const row of r.map) this.totalTickets += (row.match(/\*/g) || []).length;
    }
    playMusic('title'); // queued until the first input unlocks audio
  }

  // ---------- level / room management ----------
  startNew() {
    clearSave();
    this.flags = { gun: false, burrBoots: false, hat: false, trophy: false };
    this.tickets = 0;
    this.collected = new Set();
    this.bossesDead = new Set();
    this.checkpoint = null;
    this.stats = { deaths: 0, playT: 0 };
    this.visited = new Set();
    this.loadLevel('level1');
    this.state = 'play';
    this.transitionT = 0.25; this.transitionPhase = 'in'; // fade in from the title
    // opening cinematic: Rumble tumbles in from above, feathers trailing
    this.introT = 1.1;
    this.player.body.vy = 60;
  }

  continueRun() {
    const s = loadSave();
    if (!s) return this.startNew();
    this.flags = s.flags;
    this.tickets = s.tickets;
    this.collected = new Set(s.collected);
    this.bossesDead = new Set(s.bossesDead);
    this.checkpoint = s.checkpoint;
    this.stats = s.stats || { deaths: 0, playT: 0 };
    this.visited = new Set(s.visited || []);
    this.loadLevel(s.checkpoint?.level || 'level1');
    if (this.checkpoint && this.checkpoint.level === this.levelId) {
      this.enterRoom(this.checkpoint.room, { x: this.checkpoint.x, y: this.checkpoint.y });
    }
    this.state = 'play';
  }

  loadLevel(id) {
    const def = LEVELS[id];
    if (!def) throw new Error(`Unknown level: ${id}`);
    this.levelId = id;
    this.world = new World(def);
    this.levelToast = def.name;
    this.levelToastT = 3;
    playMusic(def.music || 'garden');
    const start = def.start;
    this.enterRoom(start.room, { x: start.x * C.TILE + 4, y: start.y * C.TILE + 2 });
  }

  enterRoom(roomId, pos, doorChar) {
    this.room = this.world.room(roomId);
    if (!this.room) throw new Error(`Unknown room: ${roomId}`);
    this.room.extraSolids = [];

    // spawn point
    let px = pos?.x, py = pos?.y;
    if (doorChar) {
      const d = this.room.doors.get(doorChar);
      px = d.tx * C.TILE + 4;
      py = (d.ty + 1) * C.TILE - 15;
    }
    if (this.player) {
      this.player.body.x = px; this.player.body.y = py;
      this.player.body.vx = 0;
      this.player.body.vy = Math.min(this.player.body.vy, 0);
    } else {
      this.player = new Player(px, py);
    }

    // build entities from data
    this.enemies = [];
    this.entities = [];
    this.boss = null;
    this.projectiles.list.length = 0;
    this.particles.list.length = 0;

    const rd = this.room.def;
    for (const t of this.room.tickets) {
      const key = `${this.levelId}:${roomId}:t${t.tx},${t.ty}`;
      if (!this.collected.has(key)) this.entities.push(new Ticket(t.tx, t.ty, key));
    }
    for (const h of this.room.heals) this.entities.push(new DewHeal(h.tx, h.ty));
    for (const [ch, d] of this.room.doors) {
      this.entities.push(new Door(d.tx, d.ty, d.def));
    }
    for (const e of (rd.entities || [])) {
      if (e.type === 'door') continue;
      const px2 = e.x * C.TILE, py2 = e.y * C.TILE;
      switch (e.type) {
        case 'weevil': case 'gnat': case 'spitter': {
          const en = makeEnemy(e, px2 + 2, py2 + 2);
          if (en) this.enemies.push(en);
          break;
        }
        case 'checkpoint':
          this.entities.push(new Checkpoint(e.x, e.y, `${this.levelId}:${roomId}:cp${e.x},${e.y}`));
          break;
        case 'gunPickup': {
          const gp = new GunPickup(e.x, e.y);
          gp.done = this.flags.gun; // pedestal stays, gun only if not yet taken
          this.entities.push(gp);
          break;
        }
        case 'vending':
          this.entities.push(new Vending(e.x, e.y, e.items));
          break;
        case 'sign':
          this.entities.push(new Sign(e.x, e.y, e.text));
          break;
        case 'boss': {
          const bossKey = `${this.levelId}:${roomId}`;
          if (!this.bossesDead.has(bossKey)) {
            this.boss = new BullhornBeetle(px2, py2);
            this.boss.roomKey = bossKey;
          } else if (!this.flags.trophy) {
            // boss beaten but trophy never collected — respawn it (no softlock)
            this.entities.push(new Trophy(px2 + 20, py2 + 16));
          }
          break;
        }
        default:
          throw new Error(`[${roomId}] unknown entity type '${e.type}'`);
      }
    }

    // boss room: lock doors while boss alive
    if (this.boss) {
      for (const ent of this.entities) if (ent instanceof Door) {
        ent.locked = false; // locks when boss wakes
      }
    }

    // room-name toast on first visit (metroidvania orientation)
    const visitKey = `${this.levelId}:${roomId}`;
    if (!this.visited.has(visitKey)) {
      this.visited.add(visitKey);
      if (rd.name && this.levelToastT <= 1) { this.roomToast = rd.name; this.roomToastT = 2.2; }
    }

    // ambient critters: butterflies in bright rooms, fireflies in dark ones
    this.critters = [];
    const n = Math.min(3, 1 + (this.room.w * this.room.h > 500 ? 2 : 1));
    for (let i = 0; i < n; i++) {
      this.critters.push({
        x: (0.2 + 0.6 * ((i * 2654435761 + roomId.length) % 100) / 100) * this.room.pxW,
        y: 40 + (i * 37) % 80,
        t: i * 2.7,
        firefly: (rd.dark || 0) > 0.2,
      });
    }
    this.camera.jumpTo(this.playerCamTarget(), this.room);
  }

  playerCamTarget() {
    const p = this.player;
    return { cx: p.cx, cy: p.cy, facing: p.facing, grounded: p.grounded, vy: p.vy, forceCamY: this.transitionT > 0 };
  }

  // ---------- helpers used by entities/player ----------
  hitstop(t) { this.hitstopT = Math.max(this.hitstopT, t); }
  showMessage(text, dur = 2.5) { this.message = text; this.messageT = dur; }
  collect(key) { this.collected.add(key); }

  fireProjectile(x, y, vx, vy, charged) {
    this.projectiles.fire(x, y, vx, vy, {
      friendly: true,
      dmg: charged ? 3 : 1,
      pierce: charged,
      sprite: charged ? 'fx.charge' : 'fx.pellet',
      size: charged ? 8 : 4,
    });
  }
  enemyProjectile(x, y, vx, vy, kind) {
    this.projectiles.fire(x, y, vx, vy, {
      friendly: false, dmg: 1,
      sprite: 'fx.spore', size: 5,
      g: kind === 'spore' ? 400 : (kind === 'shock' ? 500 : 0),
      life: 2.5,
    });
  }

  setCheckpoint(cp) {
    this.checkpoint = { id: cp.id, level: this.levelId, room: this.room.id, x: cp.x - 4, y: cp.y - 16 };
    this.saveState();
  }

  saveState() {
    writeSave({
      flags: this.flags,
      tickets: this.tickets,
      collected: [...this.collected],
      bossesDead: [...this.bossesDead],
      checkpoint: this.checkpoint,
      stats: this.stats,
      visited: [...this.visited],
    });
  }

  onPlayerDeath() {
    this.stats.deaths++;
    this.hitstop(0.12);
    this.camera.addTrauma(1);
    this.particles.burst(this.player.cx, this.player.cy, 26, { speed: 160, color: PAL.bee, life: 0.6 });
    this.particles.burst(this.player.cx, this.player.cy, 10, { speed: 90, color: PAL.beeAccent, life: 0.5 });
    sfx.hurt(); sfx.kill();
    this.state = 'dead';
    this.deathT = 1.1;
  }

  playerHitHazard() {
    this.player.hurt(this, this.player.cx + (Math.random() - 0.5), 1);
    // bounce off thorns
    if (!this.player.dead) this.player.body.vy = Math.min(this.player.body.vy, -220);
  }

  respawn() {
    const cp = this.checkpoint;
    this.player.dead = false;
    this.player.hp = C.playerHP;
    this.player.iframesT = 1.2;
    this.player.body.vx = 0; this.player.body.vy = 0;
    if (cp && cp.level === this.levelId) {
      this.enterRoom(cp.room, { x: cp.x, y: cp.y });
    } else if (cp && cp.level !== this.levelId) {
      this.loadLevel(cp.level);
      this.enterRoom(cp.room, { x: cp.x, y: cp.y });
    } else {
      const s = this.world.levelDef.start;
      this.enterRoom(s.room, { x: s.x * C.TILE + 4, y: s.y * C.TILE + 2 });
    }
    this.state = 'play';
  }

  enterDoor(door) {
    const to = door.def.to;
    this.transitionT = 0.5; this.transitionPhase = 'out';
    this.pendingDoor = door;
    sfx.door();
  }

  finishTransition() {
    const door = this.pendingDoor;
    const to = door.def.to;
    if (to === 'level:demoEnd') {
      this.state = 'demoEnd';
      this.saveState();
      playMusic('title');
    } else if (to.startsWith('level:')) {
      this.loadLevel(to.slice(6));
    } else {
      this.enterRoom(to, null, door.def.toDoor);
    }
    this.pendingDoor = null;
  }

  onBossDefeated(boss) {
    this.bossesDead.add(boss.roomKey);
    playMusic(this.world.levelDef.music || 'garden');
    this.tickets += 15;
    for (const ent of this.entities) if (ent instanceof Door) ent.locked = false;
    this.entities.push(new Trophy(boss.cx, boss.body.y));
    this.showMessage('+15 TICKETS!', 2.5);
    this.saveState();
  }

  openShop(vending) {
    this.shop = vending;
    this.shopSel = 0;
    this.state = 'shop';
  }

  buyItem(item) {
    if (this.flags[item.id]) { sfx.deny(); return; }
    if (this.tickets < item.cost) { sfx.deny(); this.showMessage('NOT ENOUGH TICKETS!', 1.5); return; }
    this.tickets -= item.cost;
    this.flags[item.id] = true;
    sfx.purchase();
    this.showMessage(item.unlockText || `GOT ${item.name}!`, 3);
    this.saveState();
  }

  // ---------- fixed-step update ----------
  step(dt) {
    this.input.beginStep();
    this.time += dt;
    this.messageT -= dt;
    this.levelToastT -= dt;
    this.hpFlashT -= dt;
    this.ticketBounceT -= dt;
    this.roomToastT -= dt;
    if (this.player) {
      if (this.player.hp < this._prevHp) this.hpFlashT = 0.5;
      this._prevHp = this.player.hp;
    }

    switch (this.state) {
      case 'title': this.stepTitle(dt); break;
      case 'play': this.stepPlay(dt); break;
      case 'shop': this.stepShop(dt); break;
      case 'dead': this.stepDead(dt); break;
      case 'demoEnd': this.stepDemoEnd(dt); break;
    }
  }

  stepDemoEnd(dt) {
    this.particles.update(dt);
    // confetti drizzle in the palette
    if (Math.random() < 0.35) {
      const colors = [PAL.bee, PAL.beeAccent, PAL.dewHalo, PAL.leafLight, PAL.enemy];
      this.particles.spawn({
        x: Math.random() * C.VIEW_W + this.camera.x, y: this.camera.y - 4,
        vx: (Math.random() - 0.5) * 30, vy: 30 + Math.random() * 40, g: 20, drag: 0.5,
        size: 2, color: colors[(Math.random() * colors.length) | 0], life: 3.5, alpha: 0.9,
      });
    }
    if (this.input.pressed('confirm') || this.input.pressed('shoot') || this.input.pressed('jump')) {
      this.hasSave = true;
      this.titleSel = 0;
      this.state = 'title';
    }
  }

  stepTitle(dt) {
    this.particles.update(dt);
    const opts = this.hasSave ? 2 : 1;
    if (this.input.pressed('down') || this.input.pressed('up')) {
      this.titleSel = (this.titleSel + 1) % opts;
    }
    if (this.input.pressed('jump') || this.input.pressed('confirm') || this.input.pressed('shoot')) {
      if (this.hasSave && this.titleSel === 0) this.continueRun();
      else this.startNew();
    }
  }

  stepShop(dt) {
    if (this.input.pressed('down')) { this.shopSel = (this.shopSel + 1) % this.shop.items.length; sfx.ticket(); }
    if (this.input.pressed('up')) { this.shopSel = (this.shopSel + this.shop.items.length - 1) % this.shop.items.length; sfx.ticket(); }
    if (this.input.pressed('shoot') || this.input.pressed('jump') || this.input.pressed('confirm')) {
      this.buyItem(this.shop.items[this.shopSel]);
    }
    if (this.input.pressed('pause') || this.input.pressed('melee')) {
      this.state = 'play';
      this.shop = null;
    }
  }

  stepDead(dt) {
    this.hitstopT -= dt;
    if (this.hitstopT > 0) return;
    this.deathT -= dt;
    this.particles.update(dt);
    this.camera.update(this.playerCamTarget(), this.room, dt);
    if (this.deathT <= 0) this.respawn();
  }

  pauseItems() {
    const s = getSettings();
    return [
      { label: 'RESUME', act: () => { this.paused = false; } },
      { label: `MUSIC: ${Math.round(s.music * 100)}`, adj: (d) => { setSetting('music', Math.min(1, Math.max(0, s.music + d * 0.25))); applyAudioSettings(); } },
      { label: `SFX: ${Math.round(s.sfx * 100)}`, adj: (d) => { setSetting('sfx', Math.min(1, Math.max(0, s.sfx + d * 0.25))); applyAudioSettings(); } },
      { label: `SCREEN SHAKE: ${s.shake ? 'ON' : 'OFF'}`, adj: () => { setSetting('shake', s.shake ? 0 : 1); }, act: () => { setSetting('shake', s.shake ? 0 : 1); } },
      { label: 'RESTART AT CHECKPOINT', act: () => { this.paused = false; this.respawn(); } },
      { label: 'QUIT TO TITLE', act: () => { this.paused = false; this.hasSave = true; this.titleSel = 0; this.state = 'title'; playMusic('title'); } },
    ];
  }

  stepPause() {
    const items = this.pauseItems();
    if (this.input.pressed('down')) { this.pauseSel = (this.pauseSel + 1) % items.length; sfx.ticket(); }
    if (this.input.pressed('up')) { this.pauseSel = (this.pauseSel + items.length - 1) % items.length; sfx.ticket(); }
    const it = items[this.pauseSel];
    if (this.input.pressed('left') && it.adj) { it.adj(-1); sfx.ticket(); }
    if (this.input.pressed('right') && it.adj) { it.adj(1); sfx.ticket(); }
    if ((this.input.pressed('confirm') || this.input.pressed('jump') || this.input.pressed('shoot')) && it.act) { it.act(); sfx.pickup(); }
    if (this.input.pressed('pause')) this.paused = false;
  }

  stepPlay(dt) {
    if (this.input.pressed('pause') && !this.paused) { this.paused = true; this.pauseSel = 0; return; }
    if (this.paused) { this.stepPause(); return; }
    this.stats.playT += dt;

    // transition freeze
    if (this.transitionT > 0) {
      this.transitionT -= dt;
      if (this.transitionPhase === 'out' && this.transitionT <= 0.25) {
        this.transitionPhase = 'in';
        this.finishTransition();
      }
      if (this.transitionT <= 0) this.transitionPhase = null;
      this.particles.update(dt);
      return;
    }

    // hit-stop: world freezes, UI continues
    this.hitstopT -= dt;
    if (this.hitstopT > 0) return;

    // opening cinematic: input locked, feathers spiral down around Rumble
    if (this.introT > 0) {
      this.introT -= dt;
      if (Math.random() < 0.4) {
        this.particles.spawn({
          x: this.player.cx + (Math.random() - 0.5) * 26, y: this.player.body.y - 12,
          vx: (Math.random() - 0.5) * 26, vy: 16 + Math.random() * 14, g: -6, drag: 1.2,
          size: 2, color: Math.random() < 0.5 ? PAL.beeAccent : PAL.ui, life: 1.6, alpha: 0.85,
        });
      }
      if (this.introT <= 0 && this.player.grounded) {
        this.particles.landDust(this.player.cx, this.player.body.bottom, true);
        this.camera.addTrauma(0.35);
        sfx.land();
      }
    }

    // ambient critters
    for (const c of this.critters) {
      c.t += dt;
      c.x += Math.sin(c.t * (c.firefly ? 0.5 : 1.1)) * (c.firefly ? 8 : 22) * dt;
      c.y += Math.cos(c.t * (c.firefly ? 0.7 : 1.7)) * (c.firefly ? 6 : 14) * dt;
    }

    const p = this.player;
    p.update(dt, this);

    // enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this);
      if (e.dead) { this.enemies.splice(i, 1); continue; }
      if (!p.dead && overlaps(e.hitbox(), p.hurtbox())) p.hurt(this, e.cx, e.contactDmg);
      const mb = p.meleeBox();
      if (mb && !e._meleeTag && overlaps(mb, e.hitbox())) {
        e._meleeTag = true;
        e.onHit(this, 1, p.cx, C.meleeKnockback);
        this.hitstop(0.03);
      }
      if (!mb) e._meleeTag = false;
    }

    // boss
    if (this.boss) {
      const b = this.boss;
      if (!b.awake && Math.abs(p.cx - b.cx) < 9 * C.TILE) {
        b.wake(this);
        playMusic('boss');
        this.levelToast = 'BULLHORN BEETLE';
        this.levelToastT = 2.5;
        for (const ent of this.entities) if (ent instanceof Door) ent.locked = true;
        // physical blockers on locked doors
        this.room.extraSolids = this.entities.filter(e => e instanceof Door && e.locked).map(d => d.rect());
      }
      b.update(dt, this);
      if (!b.dead) {
        if (!p.dead && overlaps(b.hitbox(), p.hurtbox())) p.hurt(this, b.cx, b.contactDmg);
        const mb = p.meleeBox();
        if (mb && !b._meleeTag && overlaps(mb, b.hitbox())) { b._meleeTag = true; b.onHit(this, 1, p.cx); }
        if (!mb) b._meleeTag = false;
      } else if (this.room.extraSolids.length) {
        this.room.extraSolids = [];
      }
    }

    // projectiles
    this.projectiles.update(dt, this);
    for (const pr of [...this.projectiles.list]) {
      if (!pr.hit) continue;
      if (pr.friendly) {
        let consumed = false;
        for (const e of this.enemies) {
          if (overlaps(pr.hit, e.hitbox())) {
            e.onHit(this, pr.dmg, pr.x);
            this.hitstop(0.02);
            if (!pr.pierce) { consumed = true; break; }
          }
        }
        if (!consumed && this.boss && !this.boss.dead && overlaps(pr.hit, this.boss.hitbox())) {
          this.boss.onHit(this, pr.dmg, pr.x);
          this.hitstop(0.02);
          if (!pr.pierce) consumed = true;
        }
        if (consumed) this.projectiles.remove(pr);
      } else if (!p.dead && overlaps(pr.hit, p.hurtbox())) {
        if (p.hurt(this, pr.x)) this.projectiles.remove(pr);
      }
    }

    // entities
    for (const ent of this.entities) ent.update(dt, this);

    // ambient motes + spores (style bible: always-on)
    this.moteT -= dt;
    if (this.moteT <= 0) {
      this.moteT = 0.5;
      if (this.particles.list.length < 380) {
        const cam = this.camera;
        this.particles.spawn({
          x: cam.x + Math.random() * C.VIEW_W, y: cam.y + Math.random() * C.VIEW_H,
          vx: (Math.random() - 0.5) * 6, vy: -3 - Math.random() * 5,
          size: 1, color: Math.random() < 0.25 ? PAL.dewHalo : PAL.ui,
          life: 3.5, alpha: 0.3, add: Math.random() < 0.3,
        });
      }
    }

    this.particles.update(dt);
    this.camera.update(this.playerCamTarget(), this.room, dt);
  }

  // ---------- render ----------
  render(ctx) {
    ctx.fillStyle = PAL.bgDeep;
    ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

    if (this.state === 'title') { this.renderTitle(ctx); return; }

    drawBackground(ctx, this.camera, this.room, this.time);
    this.room.draw(ctx, this.camera, this.time);

    // critters: alive but harmless — drawn behind the actors
    for (const c of this.critters) {
      const cx = Math.round(c.x - this.camera.ox()), cy = Math.round(c.y - this.camera.oy());
      if (cx < -8 || cx > C.VIEW_W + 8 || cy < -8 || cy > C.VIEW_H + 8) continue;
      if (c.firefly) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35 + 0.3 * Math.sin(c.t * 3);
        ctx.fillStyle = PAL.dewHalo;
        ctx.fillRect(cx, cy, 2, 2);
        ctx.globalAlpha = 0.12;
        ctx.fillRect(cx - 2, cy - 2, 6, 6);
        ctx.restore();
      } else {
        const flap = Math.floor(c.t * 10) % 2;
        ctx.fillStyle = PAL.beeAccent;
        ctx.fillRect(cx - 2, cy - flap, 2, 2);
        ctx.fillRect(cx + 1, cy - flap, 2, 2);
        ctx.fillStyle = PAL.outline;
        ctx.fillRect(cx, cy, 1, 2);
      }
    }

    for (const ent of this.entities) ent.render(ctx, this.camera, this);
    for (const e of this.enemies) e.render(ctx, this.camera);
    if (this.boss) this.boss.render(ctx, this.camera);
    if (!this.player.dead && this.state !== 'dead') this.player.render(ctx, this.camera, this);
    this.projectiles.render(ctx, this.camera);
    this.particles.render(ctx, this.camera);

    drawForeground(ctx, this.camera, this.room, this.time);
    drawHud(ctx, this);

    if (this.state === 'shop') drawShop(ctx, this);

    if (this.paused) {
      ctx.fillStyle = 'rgba(46,34,47,0.82)';
      ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
      drawText(ctx, 'PAUSED', C.VIEW_W / 2, 34, PAL.dewHalo, { align: 'center', scale: 2 });
      this.pauseItems().forEach((it, i) => {
        const sel = i === this.pauseSel;
        drawText(ctx, (sel ? '> ' : '') + it.label + (it.adj && sel ? ' <>' : ''), C.VIEW_W / 2, 62 + i * 12,
          sel ? PAL.ui : PAL.bgLight, { align: 'center' });
      });
      drawText(ctx, 'ARROWS: NAVIGATE/ADJUST   Z: SELECT   ESC: RESUME', C.VIEW_W / 2, C.VIEW_H - 16, PAL.bgLight, { align: 'center' });
    }

    if (this.state === 'demoEnd') {
      ctx.fillStyle = 'rgba(46,34,47,0.92)';
      ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
      drawText(ctx, 'DEMO COMPLETE!', C.VIEW_W / 2, 36, PAL.bee, { align: 'center', scale: 3 });
      drawText(ctx, 'THANKS FOR PLAYING RUMBLE', C.VIEW_W / 2, 66, PAL.dewHalo, { align: 'center' });
      const t = Math.floor(this.stats.playT);
      const mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
      drawText(ctx, `TIME: ${mm}:${ss}`, C.VIEW_W / 2, 88, PAL.ui, { align: 'center' });
      drawText(ctx, `TICKETS: ${this.tickets}/${this.totalTickets}   FALLS: ${this.stats.deaths}`, C.VIEW_W / 2, 98, PAL.ui, { align: 'center' });
      const grotto = this.visited.has('level1:dewGrotto');
      const line = !grotto ? 'MISSED: A SECRET GROTTO HIDES IN THE CELLAR...'
        : !this.flags.hat ? 'SECRET FOUND! BUT THE ACORN CAP AWAITS...'
        : 'GROTTO FOUND. HAT ACQUIRED. TRUE ENDING.';
      drawText(ctx, line, C.VIEW_W / 2, 112, PAL.leafHi, { align: 'center' });
      drawText(ctx, 'WISHLIST RUMBLE ON STEAM!', C.VIEW_W / 2, 132, PAL.beeAccent, { align: 'center' });
      drawText(ctx, 'Z: BACK TO TITLE', C.VIEW_W / 2, 152, PAL.bgLight, { align: 'center' });
      // the champions flank the exit prompt, under the confetti
      drawSprite(ctx, 'player.idle', Math.floor(this.time * 8) % 4, C.VIEW_W / 2 - 78, 172);
      drawSprite(ctx, 'props.trophy', 0, C.VIEW_W / 2 + 78, 171);
      this.particles.render(ctx, this.camera);
    }

    // transition fade (eased out/in over 2×250 ms)
    if (this.transitionT > 0) {
      const a = this.transitionPhase === 'out'
        ? 1 - (this.transitionT - 0.25) / 0.25
        : this.transitionT / 0.25;
      ctx.globalAlpha = Math.min(1, Math.max(0, a));
      ctx.fillStyle = PAL.bgDeep;
      ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
      ctx.globalAlpha = 1;
    }
    // death iris wipe closing on the player
    if (this.state === 'dead') {
      const px = Math.round(this.player.cx - this.camera.ox());
      const py = Math.round(this.player.cy - this.camera.oy());
      const r = Math.max(0, this.deathT * 320);
      ctx.save();
      ctx.fillStyle = PAL.bgDeep;
      ctx.beginPath();
      ctx.rect(0, 0, C.VIEW_W, C.VIEW_H);
      ctx.arc(px, py, r, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();
    }
  }

  renderTitle(ctx) {
    // dawn gradient + drifting motes
    drawBackground(ctx, { x: this.time * 8, y: 0, ox: () => 0, oy: () => 0 }, { id: 'title', pxW: 9999, pxH: 180 }, this.time);
    if (Math.random() < 0.1) {
      this.particles.spawn({
        x: Math.random() * C.VIEW_W, y: C.VIEW_H,
        vx: (Math.random() - 0.5) * 8, vy: -8 - Math.random() * 8,
        size: 1, color: PAL.dewHalo, life: 4, alpha: 0.5, add: true,
      });
    }
    this.particles.render(ctx);

    // grass stage with the cast on it
    for (let x = 0; x < C.VIEW_W; x += 16) drawTile(ctx, 'tiles.soil', 14, x, C.VIEW_H - 16);
    const wob = Math.round(Math.sin(this.time * 1.5) * 2);
    drawSprite(ctx, 'player.idle', Math.floor(this.time * 8) % 4, C.VIEW_W / 2 - 92, C.VIEW_H - 17);
    const wx = (this.time * 20) % (C.VIEW_W + 60) - 30; // weevil wanders through
    drawSprite(ctx, 'enemy.weevil', Math.floor(this.time * 6) % 2, wx, C.VIEW_H - 18, { flip: true });

    // logo with drop shadow, floating gently
    drawText(ctx, 'RUMBLE', C.VIEW_W / 2 + 2, 30 + wob + 2, PAL.outline, { align: 'center', scale: 4 });
    drawText(ctx, 'RUMBLE', C.VIEW_W / 2, 30 + wob, PAL.bee, { align: 'center', scale: 4 });
    drawText(ctx, 'A BEE WITHOUT WINGS. A GUN FULL OF PEAS.', C.VIEW_W / 2, 62, PAL.ui, { align: 'center' });
    drawText(ctx, 'STEAM SHOWCASE DEMO', C.VIEW_W / 2, 72, PAL.beeAccent, { align: 'center' });

    let contLabel = 'CONTINUE';
    if (this.hasSave) {
      const s = loadSave();
      if (s?.stats) {
        const t = Math.floor(s.stats.playT || 0);
        contLabel = `CONTINUE (${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}, ${s.tickets ?? 0} TKT)`;
      }
    }
    const opts = this.hasSave ? [contLabel, 'NEW GAME'] : ['START'];
    opts.forEach((o, i) => {
      const sel = i === this.titleSel;
      drawText(ctx, (sel ? '> ' : '') + o, C.VIEW_W / 2, 92 + i * 10, sel ? PAL.dewHalo : PAL.bgLight, { align: 'center' });
    });

    if (this.input.gamepadActive) {
      drawText(ctx, 'GAMEPAD: STICK/D-PAD MOVE  A: JUMP', C.VIEW_W / 2, 122, PAL.bgLight, { align: 'center' });
      drawText(ctx, 'X: SHOOT  Y: MELEE  B: ROLL  DOWN: CRAWL', C.VIEW_W / 2, 132, PAL.bgLight, { align: 'center' });
    } else {
      drawText(ctx, 'MOVE: ARROWS/WASD  JUMP: Z/SPACE  (GAMEPAD OK!)', C.VIEW_W / 2, 122, PAL.bgLight, { align: 'center' });
      drawText(ctx, 'SHOOT: X  MELEE: C  ROLL: SHIFT  CRAWL: DOWN', C.VIEW_W / 2, 132, PAL.bgLight, { align: 'center' });
    }
    drawText(ctx, 'AIM DOWN + SHOOT IN AIR: GUN-JUMP', C.VIEW_W / 2, 144, PAL.leafHi, { align: 'center' });
    drawText(ctx, 'DEMO V1.0', C.VIEW_W - 4, C.VIEW_H - 10, PAL.bgLight, { align: 'right' });
  }
}
