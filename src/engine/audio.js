// audio.js — zero-binary WebAudio synth SFX, chiptune music sequencer, and
// soft generative ambience. Recipes per RESEARCH.md Addendum 2 §6.

import { getSettings } from './save.js';

let ac = null, master = null, ambGain = null, musicGain = null;

export function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.25 * getSettings().sfx;
  master.connect(ac.destination);
  musicGain = ac.createGain();
  musicGain.gain.value = 0.12 * getSettings().music;
  musicGain.connect(ac.destination);
  startAmbience();
  if (pendingTheme) { const t = pendingTheme; pendingTheme = null; playMusic(t); }
}

export function applyAudioSettings() {
  const s = getSettings();
  if (master) master.gain.value = 0.25 * s.sfx;
  if (musicGain) musicGain.gain.value = 0.12 * s.music;
}

// ---------------------------------------------------------------- music ----
// 32-step (2 bar) chiptune loops: square lead + triangle bass + noise hats.
// Notes are MIDI numbers, 0 = rest.
const THEMES = {
  title: {
    bpm: 72,
    lead: [60, 0, 64, 0, 67, 0, 71, 0, 72, 0, 0, 0, 71, 0, 67, 0, 64, 0, 67, 0, 72, 0, 76, 0, 74, 0, 0, 0, 0, 0, 0, 0],
    bass: [36, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 0, 0, 0, 0],
    hat: [],
  },
  garden: {
    bpm: 96,
    lead: [72, 0, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 76, 0, 0, 72, 0, 76, 0, 79, 0, 81, 0, 84, 0, 81, 79, 76, 74, 72, 0],
    bass: [48, 0, 0, 0, 55, 0, 0, 0, 45, 0, 0, 0, 52, 0, 0, 0, 48, 0, 0, 0, 55, 0, 0, 0, 50, 0, 0, 0, 55, 0, 53, 0],
    hat: [0, 4, 8, 12, 14, 16, 20, 24, 28, 30],
  },
  boss: {
    bpm: 138,
    lead: [69, 0, 69, 72, 0, 69, 0, 67, 69, 0, 72, 0, 74, 0, 72, 69, 65, 0, 65, 69, 0, 65, 0, 64, 65, 0, 69, 0, 72, 0, 74, 76],
    bass: [45, 45, 0, 45, 45, 0, 45, 0, 45, 45, 0, 45, 45, 0, 45, 0, 41, 41, 0, 41, 41, 0, 41, 0, 43, 43, 0, 43, 43, 0, 43, 0],
    hat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  },
  mines: {
    bpm: 84,
    lead: [67, 0, 0, 70, 0, 67, 0, 0, 65, 0, 0, 63, 0, 65, 0, 0, 67, 0, 0, 70, 0, 72, 0, 0, 70, 0, 67, 0, 65, 0, 63, 0],
    bass: [43, 0, 0, 0, 46, 0, 0, 0, 41, 0, 0, 0, 39, 0, 0, 0, 43, 0, 0, 0, 46, 0, 0, 0, 41, 0, 43, 0, 39, 0, 0, 0],
    hat: [0, 8, 16, 24, 28],
  },
};

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
let musicTimer = null, currentTheme = null, pendingTheme = null;
let stepIdx = 0, nextStepT = 0;

function scheduleNote(type, freq, t, dur, vol) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(musicGain);
  o.start(t); o.stop(t + dur + 0.02);
}

function scheduleHat(t) {
  if (!noiseBuf) return;
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 6000;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  s.connect(f); f.connect(g); g.connect(musicGain);
  s.start(t); s.stop(t + 0.05);
}

export function playMusic(name) {
  if (currentTheme === name) return;
  if (!ac) { pendingTheme = name; return; } // starts on first input
  const hadTheme = !!currentTheme;
  stopMusic();
  const theme = THEMES[name];
  if (!theme) return;
  currentTheme = name;
  ensureNoise();
  // crossfade: dip the bus, then ramp back as the new theme starts
  const target = 0.12 * getSettings().music;
  const now = ac.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  if (hadTheme) {
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    musicGain.gain.linearRampToValueAtTime(target, now + 0.7);
  } else {
    musicGain.gain.setValueAtTime(0.001, now);
    musicGain.gain.linearRampToValueAtTime(target, now + 0.6);
  }
  const stepDur = 60 / theme.bpm / 4;
  stepIdx = 0;
  nextStepT = ac.currentTime + 0.06;
  musicTimer = setInterval(() => {
    while (nextStepT < ac.currentTime + 0.25) {
      const i = stepIdx % 32;
      const lead = theme.lead[i], bass = theme.bass[i];
      if (lead) scheduleNote('square', midi(lead), nextStepT, stepDur * 1.8, 0.5);
      if (bass) scheduleNote('triangle', midi(bass), nextStepT, stepDur * 3.2, 0.9);
      if (theme.hat.includes(i)) scheduleHat(nextStepT);
      nextStepT += stepDur;
      stepIdx++;
    }
  }, 90);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  currentTheme = null;
  pendingTheme = null;
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
function ensureNoise() {
  if (noiseBuf || !ac) return;
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
function noise({ dur = 0.1, vol = 0.5, freq = 1200, delay = 0 }) {
  if (!ac) return;
  ensureNoise();
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
