// save.js — localStorage persistence of run state.

const KEY = 'rumble.save.v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function writeSave(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

// ---- settings (music/sfx/shake), separate from the run save ----
const SKEY = 'rumble.settings.v1';
const DEFAULTS = { music: 1, sfx: 1, shake: 1 };
let cached = null;

export function getSettings() {
  if (cached) return cached;
  try { cached = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(SKEY)) || {}) }; }
  catch { cached = { ...DEFAULTS }; }
  return cached;
}

export function setSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch { /* private mode */ }
}
