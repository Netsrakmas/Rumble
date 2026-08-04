# RUMBLE

A finished **Level 1** of a whimsical pixel-art metroidvania with the full
mechanics of *Dewdrop Dynasty*: you are **Rumble**, a bumblebee who lost their
wings and gets around on the recoil of the **Pea-Popper** — aim down in the
air and shoot to **gun-jump**.

![genre] 2D metroidvania · HTML5 Canvas · zero dependencies · zero build step

## Play

```
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works (GitHub Pages included). No install, no build.

**Controls:** Arrows/WASD move · Z/Space jump · X shoot (hold to charge) ·
C pistol-whip · Shift roll · Down crawl · Down+X in air gun-jump ·
Esc pause. Buy **Burr Boots** at the vending machine to wall-jump.

## Level 1 — The Fallen Garden

Six rooms: learn the verbs, find the Pea-Popper, fight through the Dew
Terraces and Bramble Cellar, buy Burr Boots in the Atrium, climb the Bloom
Ascent, and face the **Bullhorn Beetle**. Tickets are the currency; dewdrop
checkpoints save your run (localStorage).

## Project layout

- `PROMPT.md` — master spec: locked style bible, physics constants, milestones.
- `RESEARCH.md` — the research the spec is built on (mechanics dossier,
  style anchors, architecture recipes — all sourced).
- `src/levels/` — **levels are pure data** (ASCII maps + entity lists).
  Adding a level = one file + one registry line. See `src/levels/LEVELS.md`.
- `src/assets/` — **art is fully separated**: `manifest.js` holds all sprite
  geometry, `placeholders.js` generates the current look procedurally, and
  any PNG dropped into `src/assets/art/` re-skins the game with zero code
  edits. See `src/assets/art/README.md`; artist templates via
  `tools/export-sheets.html`.
- `test/` — Playwright verification harness.

## Testing

```
node test/run-tests.mjs
```

Drives the real game headlessly: movement feel (coyote time, jump buffer,
variable jump), gun-jump charge economy, damage/checkpoint/respawn loop,
shop purchase, boss fight, level exit — and fails on any console error.
