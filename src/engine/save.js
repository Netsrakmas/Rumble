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
