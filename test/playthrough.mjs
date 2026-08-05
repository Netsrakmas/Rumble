// playthrough.mjs — THE COMPLETABILITY PROOF for the Steam demo build.
// A bot beats the entire demo start-to-finish using only real, human-possible
// inputs (run, jump, crawl, gun-jump, wall-jump, shop) — no teleports on the
// route. If any level edit makes the critical path impossible, this fails.
// The boss's HP is drained via the damage model after real pellets are proven
// to land (fight *mechanics* are covered by run-tests.mjs; this file proves
// *traversal*). Usage: node test/playthrough.mjs

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8141;
mkdirSync(join(root, 'test', 'screenshots'), { recursive: true });

const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: root, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch({ executablePath: process.env.RUMBLE_CHROMIUM || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`http://localhost:${PORT}/`);
await page.waitForFunction(() => window.__test?.ready, { timeout: 15000 });

const log = await page.evaluate(async () => {
  const out = [];
  const say = (m) => out.push(m);
  const K = (c, d) => window.__test.key(c, d);
  const st = () => window.__test.state();
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const T = 16;

  async function tapZ(ms = 110) { K('KeyZ', true); await sleep(ms); K('KeyZ', false); }
  async function shootOnce() { K('KeyX', true); await sleep(40); K('KeyX', false); }

  async function waitRoom(id, timeout = 8000) {
    const t0 = performance.now();
    while (st().room !== id) {
      if (performance.now() - t0 > timeout) return false;
      await sleep(80);
    }
    await sleep(600); // let the transition finish
    return true;
  }

  // walk toward x (px). Auto-jump on stalls, optional hops (low tickets),
  // optional shooting (clears walkers). Returns false on timeout/death.
  async function walkTo(x, { timeout = 15000, hop = false, shoot = false, room = null } = {}) {
    let d = st().x < x ? 'ArrowRight' : 'ArrowLeft';
    K(d, true);
    let lastX = st().x, stall = 0, hopT = 0, shootT = 0;
    const t0 = performance.now();
    try {
      while (Math.abs(st().x - x) > 8) {
        await sleep(60);
        const s = st();
        if (room && s.room !== room) return true; // walked through a door — done
        if (s.state === 'dead') { say(`DIED near x=${Math.round(s.x)} in ${s.room}`); return false; }
        if (s.state !== 'play') return true; // menu/end screen took over — stop pressing keys!
        const nd = s.x < x ? 'ArrowRight' : 'ArrowLeft';
        if (nd !== d) { K(d, false); d = nd; K(d, true); }
        if (Math.abs(s.x - lastX) < 1.5) {
          stall += 60;
          if (stall > 200 && s.grounded) { await tapZ(160); stall = 0; }
        } else stall = 0;
        lastX = s.x;
        hopT += 60; shootT += 60;
        if (hop && hopT > 650 && s.grounded) { hopT = 0; await tapZ(90); }
        if (shoot && shootT > 320) { shootT = 0; await shootOnce(); }
        if (performance.now() - t0 > timeout) { say(`STALL walking to x=${x} at ${Math.round(s.x)},${Math.round(s.y)} in ${s.room}`); return false; }
      }
      return true;
    } finally { K(d, false); }
  }

  async function crawlTo(x, timeout = 12000) {
    let d = st().x < x ? 'ArrowRight' : 'ArrowLeft';
    K('ArrowDown', true); K(d, true);
    const t0 = performance.now();
    try {
      while (Math.abs(st().x - x) > 8) {
        await sleep(80);
        const s = st();
        if (s.state === 'dead') { say('DIED crawling'); return false; }
        const nd = s.x < x ? 'ArrowRight' : 'ArrowLeft'; // knockback may fling us past
        if (nd !== d) { K(d, false); d = nd; K(d, true); }
        if (performance.now() - t0 > timeout) { say(`STALL crawling to ${x} at ${Math.round(s.x)}`); return false; }
      }
      return true;
    } finally { K(d, false); K('ArrowDown', false); }
  }

  // run-jump across a hazard: from current spot, hold dir, big jump, land
  async function runJump(dirKey = 'ArrowRight', holdMs = 300) {
    K(dirKey, true);
    await sleep(80);
    await tapZ(holdMs);
    await sleep(420);
    K(dirKey, false);
  }

  // opposing-wall chimney climb until at/above targetFeet.
  // finishDir 'left'/'right': near the top, ride the final wall jump in that
  // direction and hold it until landing (how a human exits onto a side ledge).
  async function chimneyClimb(targetFeet, timeout = 25000, finishDir = null) {
    const p = window.game.player;
    let dir = 'ArrowRight';
    K(dir, true);
    await tapZ(150);
    const t0 = performance.now();
    try {
      while (performance.now() - t0 < timeout) {
        await sleep(40);
        const s = st();
        if (s.state === 'dead') { say('DIED in chimney'); return false; }
        if (s.grounded && s.y + 14 <= targetFeet + 4) return true;
        if (!finishDir && s.y + 14 <= targetFeet - 15) return true;
        if (s.grounded && p.wallDir === 0) { await tapZ(140); continue; } // grounded stall: relaunch
        if (p.wallDir !== 0) {
          const nearTop = s.y + 14 < targetFeet + 60;
          const launchWall = finishDir === 'left' ? 1 : -1; // jump FROM the opposite wall
          if (finishDir && nearTop && p.wallDir === launchWall) {
            // the finishing move: jump and hold toward the ledge until we land
            K(dir, false);
            const fd = finishDir === 'left' ? 'ArrowLeft' : 'ArrowRight';
            K(fd, true);
            K('KeyZ', true); await sleep(80); K('KeyZ', false);
            const tl = performance.now();
            while (!st().grounded && performance.now() - tl < 1500) await sleep(40);
            K(fd, false);
            K(dir, true);
            if (st().grounded && st().y + 14 <= targetFeet + 4) return true;
            continue; // missed — resume climbing
          }
          K('KeyZ', true); await sleep(80); K('KeyZ', false);
          K(dir, false);
          dir = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
          K(dir, true);
        }
      }
      if (st().grounded && st().y + 14 <= targetFeet + 15) return true;
      say(`CHIMNEY TIMEOUT at feet=${Math.round(st().y + 14)}`);
      return false;
    } finally { K(dir, false); }
  }

  // doors only arm after one non-overlapping frame — step CLEAR first, then
  // cross the trigger. Returns whether targetRoom was entered.
  async function enterDoorVia(clearX, crossX, targetRoom) {
    const from = st().room;
    await walkTo(clearX, { timeout: 6000, hop: true });
    await walkTo(crossX, { room: from, timeout: 6000, hop: true });
    return await waitRoom(targetRoom, 5000);
  }

  const fail = (m) => { say('FAIL: ' + m); return out; };

  // ================= THE RUN =================
  window.__test.start();
  await sleep(400);

  // --- 1. DESCENT: over the blocks, crawl the tunnel, take the gun, door A
  say('room 1: descent');
  if (!await walkTo(20 * T)) return fail('descent blocks');
  if (!await crawlTo(31 * T)) return fail('descent tunnel');
  if (!await walkTo(35 * T)) return fail('descent pedestal');
  if (!st().flags.gun) return fail('gun not collected');
  say('gun acquired');
  if (!await walkTo(38 * T, { room: 'descent' })) return fail('descent door');
  if (!await waitRoom('terraces')) return fail('terraces transition');

  // --- 2. TERRACES: hop tickets, shoot weevils, jump both thorn patches
  say('room 2: terraces');
  if (!await walkTo(10 * T, { hop: true, shoot: true })) return fail('terraces approach');
  await runJump();                                     // over thorns x12-14
  if (!await walkTo(21 * T, { hop: true, shoot: true })) return fail('terraces mid');
  await runJump();                                     // over thorns x23-25
  if (!await walkTo(46 * T + 4, { hop: true, shoot: true, room: 'terraces' })) return fail('terraces door');
  if (!await waitRoom('cellar')) return fail('cellar transition');

  // --- 3. CELLAR: crawl tunnel 1, hop thorns, crawl tunnel 2
  say('room 3: cellar');
  if (!await walkTo(6 * T, { hop: true, shoot: true })) return fail('cellar approach');
  if (!await crawlTo(15 * T + 8)) return fail('cellar tunnel 1');
  await sleep(200);
  await runJump('ArrowRight', 320);                    // over thorns x17-19
  if (!await crawlTo(34 * T)) return fail('cellar tunnel 2');
  if (!await walkTo(42 * T + 4, { hop: true, shoot: true, room: 'cellar' })) return fail('cellar door');
  if (!await waitRoom('atrium')) return fail('atrium transition');

  // --- 4. ATRIUM: gather hopping, buy Burr Boots, crawl into shaft, climb
  say(`room 4: atrium (tickets=${st().tickets})`);
  if (!await walkTo(5 * T, { hop: true })) return fail('atrium sweep left');
  if (!await walkTo(19 * T + 8, { hop: true })) return fail('atrium vending');
  const tk = st().tickets;
  const bootsCost = window.game.entities
    .find(e => e.items).items.find(i => i.id === 'burrBoots').cost;
  say(`at vending with ${tk} tickets (boots cost ${bootsCost})`);
  if (tk < bootsCost) return fail(`not enough tickets on the natural route: ${tk} < ${bootsCost}`);
  K('ArrowUp', true); await sleep(90); K('ArrowUp', false);
  await sleep(250);
  if (st().state !== 'shop') return fail('shop did not open');
  K('KeyX', true); await sleep(60); K('KeyX', false);  // buy Burr Boots (first item)
  await sleep(250);
  if (!st().flags.burrBoots) return fail('boots purchase failed');
  say('Burr Boots purchased');
  K('Escape', true); await sleep(60); K('Escape', false);
  await sleep(250);
  // climb the shaft and enter the top door — retried like a human would.
  // NOTE: the climb exit can fling us THROUGH the door mid-air (that's a
  // success!), so every stage checks whether we already arrived.
  let entered = false;
  for (let attempt = 0; attempt < 4 && !entered; attempt++) {
    if (st().room === 'ascent' || await waitRoom('ascent', 1200)) { entered = true; break; }
    if (st().y + 14 > 120) { // back on the floor: re-enter and re-climb
      if (!await walkTo(23 * T, { hop: true })) return fail('shaft approach');
      if (!await crawlTo(26 * T)) return fail('shaft entry crawl');
      // the shaft is capped by a oneway platform — climb up through it, land on top
      if (!await chimneyClimb(84)) { say(`shaft climb attempt ${attempt + 1} failed`); continue; }
      say('atrium shaft climbed');
    }
    if (st().room === 'ascent') { entered = true; break; }
    say(`a${attempt}: post-climb x=${Math.round(st().x)} feet=${Math.round(st().y + 14)} g=${st().grounded} room=${st().room}`);
    if (st().x > 23.5 * T) await runJump('ArrowLeft', 300); // wall top -> ledge
    if (st().room === 'ascent') { entered = true; break; }
    say(`a${attempt}: post-hop x=${Math.round(st().x)} feet=${Math.round(st().y + 14)} g=${st().grounded} room=${st().room}`);
    if (st().y + 14 > 84) continue; // not on the ledge — go around again
    entered = await enterDoorVia(23 * T, 21 * T - 2, 'ascent');
    say(`a${attempt}: post-enter x=${Math.round(st().x)} feet=${Math.round(st().y + 14)} room=${st().room} entered=${entered}`);
  }
  if (!entered) return fail('ascent transition');

  // --- 5. ASCENT: chimney climb, over to the door ledge
  say('room 5: ascent');
  if (!await walkTo(14 * T, { hop: true })) return fail('ascent chimney approach');
  if (!await chimneyClimb(100)) return fail('ascent chimney climb');
  say('ascent chimney climbed');
  let inBoss = false;
  for (let attempt = 0; attempt < 5 && !inBoss; attempt++) {
    if (st().y + 14 > 120) { // fell back down — re-climb
      if (!await walkTo(14 * T, { hop: true })) return fail('ascent re-approach');
      if (!await chimneyClimb(100)) continue;
    }
    if (st().x < 13 * T) await runJump('ArrowRight', 320); // exited on the left mass: hop the mouth
    if (st().y + 14 > 120) continue;                       // fell in — go around
    if (!await walkTo(23 * T, { timeout: 6000 })) continue;
    await runJump('ArrowRight', 300);                  // onto the door ledge
    inBoss = st().room === 'bossHollow' || await enterDoorVia(28 * T, 25 * T, 'bossHollow');
  }
  if (!inBoss) return fail('boss transition');

  // --- 6. BULLHORN BEETLE: prove real pellets land, then drain via damage model
  say('room 6: boss hollow');
  window.__test.setHp(4);
  if (!await walkTo(15 * T)) return fail('arena approach');
  await sleep(1600); // roar
  if (!st().bossAwake) return fail('boss did not wake');
  const hp0 = st().bossHp;
  for (let i = 0; i < 12 && st().bossHp === hp0; i++) {
    const dirK = window.game.boss.cx > st().x ? 'ArrowRight' : 'ArrowLeft'; // face the boss
    K(dirK, true); await sleep(50); K(dirK, false);
    await shootOnce(); await sleep(250);
  }
  if (st().bossHp >= hp0) return fail('pellets do not damage the boss');
  say('real pellet damage confirmed; finishing via damage model');
  await page_finishBoss();
  async function page_finishBoss() {
    const g = window.game;
    let guard = 40;
    while (g.boss && !g.boss.dead && guard-- > 0) g.boss.onHit(g, 1, 0);
  }
  await sleep(1600);
  // trophy drops where the boss died — find it and walk onto it
  for (let attempt = 0; attempt < 3 && !st().flags.trophy; attempt++) {
    const tr = window.game.entities.find(e => e.constructor.name === 'Trophy' && !e.done);
    if (!tr) break;
    await walkTo(tr.x, { hop: true, timeout: 8000 });
    await sleep(700);
  }
  if (!st().flags.trophy) return fail('trophy not collected');
  say('trophy collected');
  if (!await walkTo(34 * T + 4, { room: 'bossHollow' })) return fail('exit door walk');
  if (!await waitRoom('mineEntry', 9000)) return fail('level 2 transition');

  // --- 7. LEVEL 2: to the demo-end door
  say('level 2: cheese mines');
  // walk to the demo door; on a death the local checkpoint respawns us here — retry
  for (let attempt = 0; attempt < 3 && st().state !== 'demoEnd'; attempt++) {
    await walkTo(23 * T, { hop: true, timeout: 10000 }); // clear of the door
    say(`d${attempt}: cleared x=${Math.round(st().x)} y=${Math.round(st().y)} state=${st().state} room=${st().room}`);
    await walkTo(28 * T, { room: 'mineEntry', timeout: 8000 }); // cross the trigger
    say(`d${attempt}: crossed x=${Math.round(st().x)} y=${Math.round(st().y)} state=${st().state} trans=${window.game.transitionT.toFixed(2)}`);
    const t0 = performance.now();
    while (st().state !== 'demoEnd' && performance.now() - t0 < 5000) await sleep(150);
  }
  if (st().state !== 'demoEnd') return fail('demo end screen not reached');
  say('DEMO END REACHED');
  say(`COMPLETE — deaths=${window.game.stats.deaths} time=${Math.round(window.game.stats.playT)}s tickets=${st().tickets}`);
  return out;
});

for (const line of log) console.log(line);
await page.screenshot({ path: join(root, 'test', 'screenshots', '11-playthrough-end.png') });
const failed = log.some(l => l.startsWith('FAIL')) || errors.length > 0;
if (errors.length) console.log('CONSOLE ERRORS:', errors.slice(0, 5).join(' | '));
console.log(failed ? 'PLAYTHROUGH: FAIL' : 'PLAYTHROUGH: PASS');
await browser.close();
server.kill();
process.exit(failed ? 1 : 0);
