// run-tests.mjs — headless verification harness for RUMBLE.
// Serves the build, drives real keyboard input, asserts game state via the
// deliberate window.__test hook, screenshots key moments, samples frame rate.
// Any console error fails the run. Usage: node test/run-tests.mjs

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8123;
const shots = join(root, 'test', 'screenshots');
mkdirSync(shots, { recursive: true });

const results = [];
let failures = 0;
function report(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: root, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));

  const browser = await chromium.launch({
    executablePath: process.env.RUMBLE_CHROMIUM || '/opt/pw-browsers/chromium',
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  const S = () => page.evaluate(() => window.__test.state());
  const step = (fn, ...args) => page.evaluate(([f, a]) => window.__test[f](...a), [fn, args]);
  async function settle(ms = 150) { await page.waitForTimeout(ms); }
  async function key(k, ms) { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); }

  try {
    // ---------- 1. boot ----------
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__test?.ready, { timeout: 15000 });
    report('boot: assets load, test hook ready', true);
    let s = await S();
    report('boot: title state', s.state === 'title', `state=${s.state}`);
    await page.screenshot({ path: join(shots, '01-title.png') });

    // ---------- 2. start ----------
    await step('start');
    await settle();
    s = await S();
    report('start: play state in descent', s.state === 'play' && s.room === 'descent', `${s.state}/${s.room}`);
    await page.screenshot({ path: join(shots, '02-descent.png') });

    // ---------- 3. run right ----------
    const x0 = s.x;
    await key('ArrowRight', 500);
    s = await S();
    report('movement: running right moves player', s.x > x0 + 30, `dx=${(s.x - x0).toFixed(1)}`);

    // ---------- 3b. gamepad: stub the Gamepad API, drive with a fake pad ----------
    const pad = await page.evaluate(async () => {
      const fake = { connected: true, buttons: Array.from({ length: 17 }, () => ({ pressed: false })), axes: [0, 0] };
      const orig = navigator.getGamepads?.bind(navigator);
      Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [fake] });
      window.__test.teleport('descent', 17, 10); // open floor, clear run-up
      await new Promise(r => setTimeout(r, 400));
      const xa = window.__test.state().x;
      fake.buttons[15].pressed = true;             // d-pad right
      await new Promise(r => setTimeout(r, 400));
      const xb = window.__test.state().x;
      fake.buttons[15].pressed = false;
      fake.buttons[0].pressed = true;              // A = jump (edge)
      await new Promise(r => setTimeout(r, 100));
      const vy = window.__test.state().vy;
      fake.buttons[0].pressed = false;
      await new Promise(r => setTimeout(r, 600));
      Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: orig || (() => []) });
      return { moved: xb - xa, vy };
    });
    report('gamepad: d-pad moves player', pad.moved > 20, `dx=${pad.moved.toFixed(1)}`);
    report('gamepad: A button jumps', pad.vy < -100, `vy=${pad.vy?.toFixed(0)}`);

    // ---------- 4. variable jump: tap vs hold ----------
    async function jumpHeight(holdMs) {
      await step('teleport', 'descent', 4, 10);
      await settle(400); // land + settle
      const y0 = (await S()).y;
      const minY = await page.evaluate(async (hold) => {
        return await new Promise(res => {
          let min = 1e9;
          window.__test.key('KeyZ', true);
          setTimeout(() => window.__test.key('KeyZ', false), hold);
          const t0 = performance.now();
          (function poll() {
            const st = window.__test.state();
            min = Math.min(min, st.y);
            if (performance.now() - t0 > 900) res(min);
            else requestAnimationFrame(poll);
          })();
        });
      }, holdMs);
      return y0 - minY;
    }
    const tapH = await jumpHeight(50);
    const holdH = await jumpHeight(350);
    report('feel: variable jump (hold > tap)', holdH > tapH + 8, `tap=${tapH.toFixed(0)}px hold=${holdH.toFixed(0)}px`);
    report('feel: full jump ≈ 2.6 tiles (36-48px)', holdH >= 36 && holdH <= 50, `hold=${holdH.toFixed(0)}px`);

    // ---------- 5. coyote time: run off spawn ledge, jump 80ms later ----------
    const coyoteOk = await page.evaluate(async () => {
      window.__test.teleport('descent', 2, 3);
      await new Promise(r => setTimeout(r, 500)); // land on spawn ledge
      window.__test.key('ArrowRight', true);
      // wait until airborne (walked off ledge edge)
      const t0 = performance.now();
      await new Promise(res => (function poll() {
        if (!window.__test.state().grounded || performance.now() - t0 > 2000) res();
        else requestAnimationFrame(poll);
      })());
      window.__test.key('ArrowRight', false);
      await new Promise(r => setTimeout(r, 80)); // 80ms after leaving ground
      window.__test.key('KeyZ', true);
      await new Promise(r => setTimeout(r, 60));
      const vy = window.__test.state().vy;
      window.__test.key('KeyZ', false);
      return vy < -200; // jumped despite being airborne
    });
    report('feel: coyote time (jump 80ms after ledge)', coyoteOk);

    // ---------- 6. jump buffer: press 80ms before landing ----------
    const bufferOk = await page.evaluate(async () => {
      window.__test.teleport('descent', 4, 6); // in the air, will fall to floor
      await new Promise(r => setTimeout(r, 30));
      // wait until close to ground (floor top = 192; feet = y+14)
      const t0 = performance.now();
      await new Promise(res => (function poll() {
        const st = window.__test.state();
        if (st.y + 14 > 176 || performance.now() - t0 > 2000) res();
        else requestAnimationFrame(poll);
      })());
      window.__test.key('KeyZ', true); // buffered press before touchdown
      await new Promise(r => setTimeout(r, 250));
      const st = window.__test.state();
      window.__test.key('KeyZ', false);
      return st.vy < -50 || !st.grounded; // re-launched off the buffer
    });
    report('feel: jump buffering (press before landing)', bufferOk);

    // ---------- 7. gun pickup + gun-jump economy ----------
    await step('grant', 'gun');
    await step('teleport', 'descent', 4, 10);
    await settle(300);
    const gunjump = await page.evaluate(async () => {
      const out = { vys: [], charges: [] };
      window.__test.key('KeyZ', true); // jump
      await new Promise(r => setTimeout(r, 120));
      window.__test.key('KeyZ', false);
      window.__test.key('ArrowDown', true);
      for (let i = 0; i < 4; i++) { // 4 attempts, only 3 charges
        window.__test.key('KeyX', true);
        await new Promise(r => setTimeout(r, 40));
        window.__test.key('KeyX', false);
        const st = window.__test.state();
        out.vys.push(st.vy); out.charges.push(st.charges);
        await new Promise(r => setTimeout(r, 180));
      }
      window.__test.key('ArrowDown', false);
      // land, charges should reset
      await new Promise(r => setTimeout(r, 900));
      out.afterLand = window.__test.state().charges;
      return out;
    });
    const liftCount = gunjump.vys.filter(v => v < -180).length;
    report('gun-jump: exactly 3 recoil lifts per airtime', liftCount === 3 && gunjump.charges[3] === 0,
      `lifts=${liftCount} charges=${gunjump.charges.join(',')}`);
    report('gun-jump: charges reset on landing', gunjump.afterLand === 3, `after=${gunjump.afterLand}`);

    // ---------- 8. door transition descent -> terraces ----------
    await step('teleport', 'descent', 35, 10);
    await settle(200);
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => window.__test.state().room === 'terraces', { timeout: 5000 }).catch(() => {});
    await page.keyboard.up('ArrowRight');
    s = await S();
    report('doors: descent -> terraces transition', s.room === 'terraces', `room=${s.room}`);
    await settle(900); // long settle: an unarmed-door bug would bounce us back
    s = await S();
    report('doors: no instant re-trigger on arrival', s.room === 'terraces' && s.state === 'play', `room=${s.room}`);
    await page.screenshot({ path: join(shots, '03-terraces.png') });

    // ---------- 9. checkpoint + damage + death + respawn (tickets kept) ----------
    await step('teleport', 'terraces', 35, 11); // at checkpoint ledge
    await settle(600); // checkpoint activates on overlap
    s = await S();
    const cpActive = await page.evaluate(() => window.game.checkpoint?.room === 'terraces');
    report('checkpoint: activates on touch + heals', cpActive && s.hp === 4);
    await step('setTickets', 7);
    await step('setHp', 1);
    // walk into thorns at x23-25 (from ledge, drop left into pit)
    const died = await page.evaluate(async () => {
      window.__test.teleport('terraces', 24, 12); // right above thorns
      const t0 = performance.now();
      return await new Promise(res => (function poll() {
        const st = window.__test.state();
        if (st.state === 'dead') res(true);
        else if (performance.now() - t0 > 3000) res(false);
        else requestAnimationFrame(poll);
      })());
    });
    report('damage: thorns kill at 1hp -> death state', died);
    await page.waitForFunction(() => window.__test.state().state === 'play', { timeout: 5000 });
    await settle(200);
    s = await S();
    report('respawn: back at checkpoint, hp full, tickets kept',
      s.room === 'terraces' && s.hp === 4 && s.tickets === 7, `room=${s.room} hp=${s.hp} tkt=${s.tickets}`);

    // ---------- 10. enemies present + pellet kills weevil ----------
    s = await S();
    const enemyKill = await page.evaluate(async () => {
      window.__test.teleport('terraces', 20, 12);
      await new Promise(r => setTimeout(r, 300));
      const n0 = window.__test.state().enemies;
      // fire left and right a bunch
      for (let i = 0; i < 14; i++) {
        window.__test.key('KeyX', true);
        await new Promise(r => setTimeout(r, 30));
        window.__test.key('KeyX', false);
        await new Promise(r => setTimeout(r, 160));
        if (i === 6) window.__test.key('ArrowLeft', true), await new Promise(r => setTimeout(r, 60)), window.__test.key('ArrowLeft', false);
      }
      const n1 = window.__test.state().enemies;
      return { n0, n1 };
    });
    report('combat: pellets kill enemies', enemyKill.n1 < enemyKill.n0, `${enemyKill.n0} -> ${enemyKill.n1}`);
    const drops = await page.evaluate(() =>
      window.game.entities.filter(e => e.constructor.name === 'Ticket' && !e.key).length);
    report('combat: kills drop tickets (renewable income)', drops > 0, `${drops} drops`);

    // ---------- 11. shop: buy Burr Boots ----------
    await step('setTickets', 20);
    await step('teleport', 'atrium', 19, 18);
    await settle(500);
    await key('ArrowUp', 80);
    await settle(200);
    s = await S();
    report('shop: vending opens', s.state === 'shop', `state=${s.state}`);
    await page.screenshot({ path: join(shots, '04-shop.png') });
    await key('x', 60); // buy selected (Burr Boots)
    await settle(200);
    s = await S();
    report('shop: Burr Boots purchased', s.flags.burrBoots === true && s.tickets === 10, `tkt=${s.tickets}`);
    await key('Escape', 60);
    await settle(150);
    s = await S();
    report('shop: closes back to play', s.state === 'play');

    // ---------- 12. wall slide + wall jump in the shaft ----------
    const wall = await page.evaluate(async () => {
      window.__test.teleport('atrium', 26, 6); // inside shaft, near right wall
      await new Promise(r => setTimeout(r, 100));
      window.__test.key('ArrowRight', true); // press into right wall while falling
      await new Promise(r => setTimeout(r, 450));
      const sliding = window.__test.state();
      window.__test.key('KeyZ', true); // wall jump
      await new Promise(r => setTimeout(r, 80));
      const jumped = window.__test.state();
      window.__test.key('KeyZ', false);
      window.__test.key('ArrowRight', false);
      return { slideVy: sliding.vy, jumpVx: jumped.vx, jumpVy: jumped.vy };
    });
    report('wall: slide caps fall speed <= 115', wall.slideVy > 0 && wall.slideVy <= 115, `vy=${wall.slideVy?.toFixed(0)}`);
    report('wall: wall jump kicks away+up', wall.jumpVx < -100 && wall.jumpVy < -150, `vx=${wall.jumpVx?.toFixed(0)} vy=${wall.jumpVy?.toFixed(0)}`);

    // ---------- 14a. route: the ascent chimney is actually climbable ----------
    // scripted wall-jump climb (regression guard for level-geometry edits)
    const climb = await page.evaluate(async () => {
      window.__test.grant('burrBoots');
      window.__test.teleport('ascent', 14, 22);
      await new Promise(r => setTimeout(r, 400));
      const p = window.game.player;
      let dir = 'ArrowRight';
      window.__test.key(dir, true);
      window.__test.key('KeyZ', true);
      await new Promise(r => setTimeout(r, 150));
      window.__test.key('KeyZ', false);
      let jumps = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < 15000) {
        await new Promise(r => setTimeout(r, 40));
        const st = window.__test.state();
        if (st.grounded && st.y + 14 <= 100) break; // standing on a chimney-top mass
        if (p.wallDir !== 0) {
          window.__test.key('KeyZ', true);
          await new Promise(r => setTimeout(r, 80));
          window.__test.key('KeyZ', false);
          window.__test.key(dir, false);
          dir = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
          window.__test.key(dir, true);
          jumps++;
        }
      }
      window.__test.key(dir, false);
      await new Promise(r => setTimeout(r, 300));
      const st = window.__test.state();
      window.__test.setHp(4); // undo any chip damage taken during the climb
      return { jumps, topReached: st.y + 14 <= 100 };
    });
    report('route: ascent chimney climbable via wall jumps', climb.topReached, `${climb.jumps} wall jumps`);


    // ---------- 13. roll + crawl ----------
    const verbs = await page.evaluate(async () => {
      window.__test.setHp(4);
      window.__test.teleport('descent', 4, 10);
      // wait until alive, in play state, and actually grounded (roll needs all three)
      const t0 = performance.now();
      await new Promise(res => (function poll() {
        const st = window.__test.state();
        if ((st.state === 'play' && st.grounded) || performance.now() - t0 > 4000) res();
        else requestAnimationFrame(poll);
      })());
      await new Promise(r => setTimeout(r, 100));
      window.__test.key('ShiftLeft', true);
      await new Promise(r => setTimeout(r, 100));
      const rolling = Math.abs(window.__test.state().vx);
      window.__test.key('ShiftLeft', false);
      await new Promise(r => setTimeout(r, 500));
      window.__test.key('ArrowDown', true);
      await new Promise(r => setTimeout(r, 150));
      const crawl = window.game.player.crawling;
      window.__test.key('ArrowDown', false);
      return { rolling, crawl };
    });
    report('roll: burst of speed', verbs.rolling > 180, `vx=${verbs.rolling?.toFixed(0)}`);
    report('crawl: hitbox drops on down-hold', verbs.crawl === true);

    // ---------- 14. boss: wake, fight flow, trophy, exit ----------
    await step('setHp', 4); // enter the fight at full health
    await step('teleport', 'bossHollow', 4, 7);
    await settle(300);
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => window.__test.state().bossAwake, { timeout: 5000 }).catch(() => {});
    await page.keyboard.up('ArrowRight');
    s = await S();
    report('boss: wakes on approach', s.bossAwake === true);
    const doorsLocked = await page.evaluate(() => window.game.room.extraSolids.length > 0);
    report('boss: arena doors lock', doorsLocked);
    await page.screenshot({ path: join(shots, '05-boss.png') });
    // hurt it once via a real pellet
    const bossHp0 = (await S()).bossHp;
    await page.evaluate(async () => {
      for (let i = 0; i < 8; i++) {
        window.__test.key('KeyX', true);
        await new Promise(r => setTimeout(r, 30));
        window.__test.key('KeyX', false);
        await new Promise(r => setTimeout(r, 170));
      }
    });
    const bossHp1 = (await S()).bossHp;
    report('boss: takes pellet damage', bossHp1 < bossHp0, `${bossHp0} -> ${bossHp1}`);

    // ---------- performance: sampled DURING the boss fight (busiest scene) ----------
    const perf = await page.evaluate(() => new Promise(res => {
      const frames = [];
      let lastT = performance.now();
      const t0 = lastT;
      (function poll(t) {
        frames.push(t - lastT); lastT = t;
        if (t - t0 < 3000) requestAnimationFrame(poll);
        else {
          frames.shift();
          const mean = frames.reduce((a, b) => a + b, 0) / frames.length;
          res({ fps: 1000 / mean, worst: Math.max(...frames) });
        }
      })(lastT);
    }));
    report('perf: ~60fps mean during boss fight', perf.fps > 55, `${perf.fps.toFixed(1)} fps`);
    report('perf: worst frame < 50ms', perf.worst < 50, `worst=${perf.worst.toFixed(1)}ms`);
    // finish the fight (direct damage to keep the harness fast + deterministic)
    await page.evaluate(() => { const g = window.game; while (g.boss && !g.boss.dead) g.boss.onHit(g, 1, 0); });
    await settle(400);
    const afterBoss = await page.evaluate(() => ({
      unlocked: window.game.room.extraSolids.length === 0,
      trophy: window.game.entities.some(e => e.constructor.name === 'Trophy'),
      tickets: window.game.tickets,
    }));
    report('boss: defeat unlocks doors + spawns trophy + 15 tickets',
      afterBoss.unlocked && afterBoss.trophy && afterBoss.tickets >= 15, JSON.stringify(afterBoss));
    // collect trophy — teleport re-enters the room, which respawns the trophy
    // at the boss pedestal (tile 23) per the no-softlock rule; land on it there
    await step('teleport', 'bossHollow', 23, 7);
    await settle(900);
    s = await S();
    report('trophy: collected -> flag set', s.flags.trophy === true);
    // walk to exit door B (x34) -> level2
    await step('teleport', 'bossHollow', 31, 7);
    await settle(200);
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => window.__test.state().level === 'level2', { timeout: 6000 }).catch(() => {});
    await page.keyboard.up('ArrowRight');
    s = await S();
    report('exit: level 2 loads through the garden gate', s.level === 'level2' && s.room === 'mineEntry', `${s.level}/${s.room}`);
    await settle(800);
    await page.screenshot({ path: join(shots, '06-level2.png') });

    // ---------- 14b. ticket economy: boots affordable before the shaft ----------
    const economy = await page.evaluate(async () => {
      const { LEVELS } = await import('/src/levels/index.js');
      const pre = ['descent', 'terraces', 'cellar', 'atrium'];
      let n = 0;
      for (const r of LEVELS.level1.rooms) {
        if (!pre.includes(r.id)) continue;
        for (const row of r.map) n += (row.match(/\*/g) || []).length;
      }
      const boots = LEVELS.level1.rooms.find(r => r.id === 'atrium')
        .entities.find(e => e.type === 'vending').items.find(i => i.id === 'burrBoots');
      return { tickets: n, cost: boots.cost };
    });
    report('economy: pre-boss tickets comfortably cover Burr Boots', economy.tickets >= economy.cost + 6,
      `${economy.tickets} placed vs ${economy.cost} cost`);

    // ---------- 15. level loader validation ----------
    const loaderThrows = await page.evaluate(async () => {
      const { World } = await import('/src/game/world.js');
      const bad = { id: 'bad', start: { room: 'r', x: 1, y: 1 }, rooms: [{ id: 'r', map: ['###', '#.#Q', '###'] }] };
      try { new World(bad); return null; } catch (e) { return String(e.message || e); }
    });
    report('loader: bad map throws with location', !!loaderThrows && /row|col|length|char/i.test(loaderThrows), loaderThrows ?? 'no throw');

    // ---------- 16. separated assets: PNG sheets exist at manifest geometry,
    // and the procedural fallback still works (the drop-in re-skin contract) ----------
    const assets = await page.evaluate(async () => {
      const { MANIFEST } = await import('/src/assets/manifest.js');
      const { generateSheet } = await import('/src/assets/placeholders.js');
      const out = { pngOk: true, sizes: [], fallbackOk: true };
      for (const [name, def] of Object.entries(MANIFEST.sheets)) {
        const r = await fetch('/' + def.src);
        if (r.status !== 200) { out.pngOk = false; out.sizes.push(`${name}:${r.status}`); continue; }
        const blob = await r.blob();
        const bmp = await createImageBitmap(blob);
        if (bmp.width !== def.w || bmp.height !== def.h) out.sizes.push(`${name}:${bmp.width}x${bmp.height}!=${def.w}x${def.h}`);
        const c = generateSheet(name, def);
        if (c.width !== def.w || c.height !== def.h) out.fallbackOk = false;
      }
      return out;
    });
    report('assets: all PNG sheets present at exact manifest geometry', assets.pngOk && assets.sizes.length === 0, assets.sizes.join(','));
    report('assets: procedural fallback generators still valid', assets.fallbackOk);

    // every manifest sprite frame must contain actual pixels — catches frames
    // drawn at wrong sheet coordinates (the invisible-thorns bug class)
    const emptyFrames = await page.evaluate(async () => {
      const { MANIFEST } = await import('/src/assets/manifest.js');
      const { generateSheet } = await import('/src/assets/placeholders.js');
      const bad = [];
      const sheets = {};
      for (const [name, def] of Object.entries(MANIFEST.sheets)) sheets[name] = generateSheet(name, def);
      for (const [sname, s] of Object.entries(MANIFEST.sprites)) {
        const g = sheets[s.sheet].getContext('2d');
        s.frames.forEach(([fx, fy, fw, fh], i) => {
          const data = g.getImageData(fx, fy, fw, fh).data;
          let opaque = 0;
          for (let p = 3; p < data.length; p += 4) if (data[p] > 0) opaque++;
          if (opaque < fw * fh * 0.05) bad.push(`${sname}#${i}`);
        });
      }
      return bad;
    });
    report('assets: no empty/misplaced sprite frames', emptyFrames.length === 0, emptyFrames.join(', '));

    // ---------- 17. phone-landscape fit: canvas fills the screen ----------
    await page.setViewportSize({ width: 851, height: 393 }); // typical phone landscape
    await settle(300);
    const fitCheck = await page.evaluate(() => {
      const c = document.getElementById('screen');
      return {
        cw: c.clientWidth, ch: c.clientHeight,
        vw: innerWidth, vh: innerHeight,
        fsbtn: !!document.getElementById('fsbtn'),
      };
    });
    const fills = fitCheck.ch >= fitCheck.vh * 0.95 || fitCheck.cw >= fitCheck.vw * 0.95;
    report('mobile: canvas fills landscape phone screen', fills,
      `canvas ${fitCheck.cw}x${fitCheck.ch} in ${fitCheck.vw}x${fitCheck.vh}`);
    report('mobile: fullscreen button present', fitCheck.fsbtn);
    await page.setViewportSize({ width: 960, height: 540 });
    await settle(200);

    // ---------- 18. console clean ----------
    report('console: zero errors across entire run', errors.length === 0, errors.slice(0, 3).join(' | '));

  } catch (err) {
    report('HARNESS CRASH', false, String(err).slice(0, 300));
  } finally {
    await browser.close();
    server.kill();
  }

  console.log(`\n${results.length - failures}/${results.length} passed`);
  process.exit(failures ? 1 : 0);
}

main();
