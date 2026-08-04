// main.js — boot: load assets, fixed-timestep loop (60 Hz accumulator,
// Fiedler pattern), integer-scaled presentation, test hooks.

import { C } from './constants.js';
import { loadAssets } from './engine/sprites.js';
import { Input } from './engine/input.js';
import { initAudio } from './engine/audio.js';
import { Game } from './game/game.js';

const screen = document.getElementById('screen');
const view = document.createElement('canvas');
view.width = C.VIEW_W; view.height = C.VIEW_H;
const vctx = view.getContext('2d');
vctx.imageSmoothingEnabled = false;
const sctx = screen.getContext('2d');

function fit() {
  // fill as much of the window as possible while keeping 16:9; backing store
  // in device pixels so phones (dpr 2-3) stay crisp under pixelated scaling
  const scale = Math.max(1, Math.min(innerWidth / C.VIEW_W, innerHeight / C.VIEW_H));
  const cssW = Math.floor(C.VIEW_W * scale), cssH = Math.floor(C.VIEW_H * scale);
  const dpr = window.devicePixelRatio || 1;
  screen.style.width = cssW + 'px';
  screen.style.height = cssH + 'px';
  screen.width = Math.round(cssW * dpr);
  screen.height = Math.round(cssH * dpr);
  sctx.imageSmoothingEnabled = false;
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 100));
document.addEventListener('fullscreenchange', () => setTimeout(fit, 100));
fit();

// fullscreen button (shown on touch devices via CSS) — needs a user gesture,
// and gamepad input doesn't count as one, so it has to be a tap target
const fsbtn = document.getElementById('fsbtn');
fsbtn.addEventListener('click', async () => {
  try {
    const wrap = document.getElementById('wrap');
    await (wrap.requestFullscreen?.() ?? wrap.webkitRequestFullscreen?.());
    await screen_orientation_lock();
  } catch { /* iOS Safari: no element fullscreen — Add to Home Screen instead */ }
});
async function screen_orientation_lock() {
  try { await window.screen.orientation?.lock?.('landscape'); } catch { /* unsupported */ }
}

const input = new Input(() => initAudio());

let game = null;
let acc = 0, last = performance.now();
let stepCount = 0;

function frame(now) {
  requestAnimationFrame(frame);
  if (!game) return;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25; // background-tab clamp
  acc += dt;
  while (acc >= C.DT) {
    game.step(C.DT);
    stepCount++;
    acc -= C.DT;
  }
  vctx.imageSmoothingEnabled = false;
  game.render(vctx);
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(view, 0, 0, screen.width, screen.height);
}

loadAssets().then(() => {
  game = new Game(input);

  // ---- test interface (Playwright harness; PROMPT.md acceptance criteria) ----
  window.game = game;
  window.__test = {
    ready: true,
    steps: () => stepCount,
    state: () => ({
      state: game.state,
      room: game.room?.id,
      level: game.levelId,
      x: game.player?.body.x, y: game.player?.body.y,
      vx: game.player?.body.vx, vy: game.player?.body.vy,
      grounded: game.player?.grounded,
      hp: game.player?.hp,
      tickets: game.tickets,
      charges: game.player?.gunjumpCharges,
      flags: { ...game.flags },
      bossHp: game.boss?.hp ?? null,
      bossAwake: game.boss?.awake ?? false,
      enemies: game.enemies?.length,
      particles: game.particles.list.length,
    }),
    start: () => { if (game.state === 'title') game.startNew(); },
    teleport: (room, tx, ty) => {
      game.enterRoom(room, { x: tx * C.TILE + 4, y: ty * C.TILE + 1 });
    },
    grant: (flag) => { game.flags[flag] = true; },
    setTickets: (n) => { game.tickets = n; },
    setHp: (n) => { game.player.hp = n; },
    key: (code, down) => {
      dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true, cancelable: true }));
    },
  };

  requestAnimationFrame((t) => { last = t; requestAnimationFrame(frame); });
}).catch(err => {
  console.error('BOOT FAILURE:', err);
  document.body.innerHTML = `<pre style="color:#e83b3b;background:#2e222f;padding:20px;font-size:14px">BOOT FAILURE\n${err.stack || err}</pre>`;
});
