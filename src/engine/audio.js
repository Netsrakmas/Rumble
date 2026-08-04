// audio.js — zero-binary WebAudio synth SFX + soft generative ambience.
// Recipes per RESEARCH.md Addendum 2 §6. Master gain 0.25, ±5% pitch jitter.

let ac = null, master = null, ambGain = null;

export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.25;
  master.connect(ac.destination);
  startAmbience();
}

function jit(f) { return f * (0.95 + Math.random() * 0.1); }

function tone({ type = 'square', f0 = 440, f1 = f0, dur = 0.1, vol = 1, delay = 0 }) {
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(20, jit(f0)), t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, jit(f1)), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 1.5);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur * 1.6);
}

let noiseBuf = null;
function noise({ dur = 0.1, vol = 0.5, freq = 1200, delay = 0 }) {
  if (!ac) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = ac.currentTime + delay;
  const s = ac.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const f = ac.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = jit(freq); f.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t0); s.stop(t0 + dur + 0.02);
}

function startAmbience() {
  // pre-dawn garden: very soft filtered noise bed
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { // brown-ish noise
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3;
  }
  const s = ac.createBufferSource();
  s.buffer = buf; s.loop = true;
  const f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 400;
  ambGain = ac.createGain();
  ambGain.gain.value = 0.10;
  s.connect(f); f.connect(ambGain); ambGain.connect(master);
  s.start();
  scheduleDrip();
}

function scheduleDrip() {
  if (!ac) return;
  setTimeout(() => {
    // distant dew plink
    tone({ type: 'sine', f0: 1400 + Math.random() * 600, f1: 900, dur: 0.09, vol: 0.05 });
    scheduleDrip();
  }, 3000 + Math.random() * 6000);
}

export const sfx = {
  jump()      { tone({ type: 'square', f0: 150, f1: 400, dur: 0.10, vol: 0.30 }); },
  gunjump()   { tone({ type: 'square', f0: 300, f1: 90, dur: 0.08, vol: 0.35 }); noise({ dur: 0.07, vol: 0.30, freq: 2500 }); },
  shoot()     { tone({ type: 'square', f0: 520, f1: 180, dur: 0.06, vol: 0.25 }); noise({ dur: 0.04, vol: 0.18, freq: 3000 }); },
  charge()    { tone({ type: 'sawtooth', f0: 200, f1: 700, dur: 0.35, vol: 0.12 }); },
  chargeShot(){ tone({ type: 'square', f0: 240, f1: 60, dur: 0.16, vol: 0.40 }); noise({ dur: 0.14, vol: 0.32, freq: 1600 }); },
  melee()     { noise({ dur: 0.07, vol: 0.30, freq: 1800 }); tone({ type: 'triangle', f0: 700, f1: 250, dur: 0.06, vol: 0.22 }); },
  hurt()      { tone({ type: 'sawtooth', f0: 220, f1: 60, dur: 0.16, vol: 0.40 }); noise({ dur: 0.10, vol: 0.28, freq: 900 }); },
  kill()      { noise({ dur: 0.16, vol: 0.30, freq: 700 }); tone({ type: 'triangle', f0: 400, f1: 80, dur: 0.14, vol: 0.28 }); },
  pickup()    { tone({ type: 'square', f0: 880, dur: 0.06, vol: 0.22 }); tone({ type: 'square', f0: 1320, dur: 0.07, vol: 0.22, delay: 0.06 }); },
  ticket()    { tone({ type: 'square', f0: 990, dur: 0.05, vol: 0.18 }); tone({ type: 'square', f0: 1480, dur: 0.06, vol: 0.18, delay: 0.05 }); },
  purchase()  { tone({ type: 'square', f0: 660, dur: 0.07, vol: 0.25 }); tone({ type: 'square', f0: 880, dur: 0.07, vol: 0.25, delay: 0.07 }); tone({ type: 'square', f0: 1320, dur: 0.10, vol: 0.25, delay: 0.14 }); },
  deny()      { tone({ type: 'square', f0: 200, f1: 150, dur: 0.12, vol: 0.25 }); },
  checkpoint(){ tone({ type: 'sine', f0: 780, dur: 0.10, vol: 0.25 }); tone({ type: 'sine', f0: 1170, dur: 0.14, vol: 0.25, delay: 0.09 }); tone({ type: 'sine', f0: 1560, dur: 0.20, vol: 0.20, delay: 0.18 }); },
  wallGrab()  { noise({ dur: 0.04, vol: 0.14, freq: 2200 }); },
  roll()      { noise({ dur: 0.10, vol: 0.16, freq: 1200 }); },
  land()      { noise({ dur: 0.05, vol: 0.16, freq: 600 }); },
  door()      { tone({ type: 'triangle', f0: 300, f1: 500, dur: 0.18, vol: 0.20 }); },
  bossRoar()  { tone({ type: 'sawtooth', f0: 120, f1: 45, dur: 0.5, vol: 0.45 }); noise({ dur: 0.4, vol: 0.30, freq: 300 }); },
  bossHit()   { tone({ type: 'triangle', f0: 300, f1: 100, dur: 0.10, vol: 0.30 }); },
  bossDie()   { tone({ type: 'sawtooth', f0: 200, f1: 30, dur: 0.8, vol: 0.45 }); noise({ dur: 0.7, vol: 0.35, freq: 400 }); },
  unlock()    { tone({ type: 'sine', f0: 520, dur: 0.09, vol: 0.25 }); tone({ type: 'sine', f0: 780, dur: 0.09, vol: 0.25, delay: 0.09 }); tone({ type: 'sine', f0: 1040, dur: 0.16, vol: 0.25, delay: 0.18 }); },
};
