# PROMPT.md — RUMBLE — Master Build Spec

A finished, polished **Level 1** of a 2D pixel-art metroidvania with **all the mechanics of Dewdrop Dynasty** (see RESEARCH.md), starring **Rumble, a small bumblebee who lost their wings** and traverses the world on the recoil of the **Pea-Popper** pistol. Whimsical neo-retro tone: Paper Mario charm × Hollow Knight structure × Downwell gun-jump × Celeste forgiveness. This is an homage with original names/art, not an asset copy.

## Mission & hard tech constraints

- **Stack:** plain HTML5 Canvas 2D, vanilla ES modules, **zero dependencies, zero build step, zero binary files**. Runs from `python3 -m http.server` and GitHub Pages as-is.
- **Internal resolution 320×180**, integer-scaled to window, `imageSmoothingEnabled=false`, `image-rendering: pixelated`. All world draws at integer coordinates.
- **Fixed 60 Hz simulation** (accumulator, clamp 0.25 s) decoupled from rAF render. Deterministic: same inputs → same positions.
- **Tiles: 16×16** for art and collision. ASCII string maps.
- Expose `window.game` (state, player, room, flags) + `window.__test` helpers for the Playwright harness.

## Separated-assets contract (LOCKED — this is the point of the project)

1. Game code refers to **logical sprite names only** (`player.run`, `enemy.weevil.walk`, `tiles.soil`). All frame rects, pivots, fps live in `src/assets/manifest.js`.
2. `src/assets/placeholders.js` procedurally draws every sheet listed in the manifest onto offscreen canvases — real sprites (silhouette + palette + outline), not colored rects.
3. Loader tries `assets/art/<sheet>.png` first; on missing file it falls back to the generator. **Dropping a PNG into `assets/art/` re-skins the game with zero JS edits.**
4. `tools/export-sheets.html` renders every generated sheet + grid overlay to downloadable PNGs so an artist can paint over them at exact sizes/pivots.
5. Hitboxes live in entity data/constants, never derived from sprite size.
6. **New level = new file in `src/levels/` + one line in `src/levels/index.js`. New art = new PNG only. If adding content requires engine edits, the architecture has failed.**

## Style bible (LOCKED) — "Dew-Dawn Garden 16" (all hexes from Resurrect-64)

| Role | Hex |
|---|---|
| bg deep plum (FG occluders too) | `#2e222f` |
| bg mid indigo (sky bottom) | `#323353` |
| bg light dawn indigo (sky top) | `#484a77` |
| far foliage teal | `#374e4a` |
| foliage dark | `#165a4c` |
| foliage mid | `#239063` |
| foliage light (grass lip) | `#91db69` |
| foliage highlight (rim) | `#cddf6c` |
| dew/water core | `#30e1b9` |
| dew halo / UI accent | `#8ff8e2` |
| player primary (bee yellow) | `#f9c22b` |
| player accent (scarf/muzzle) | `#f57d4a` |
| outline dark / bee stripes | `#45293f` |
| enemy primary (rose) | `#cf657f` |
| hazard red | `#e83b3b` |
| UI white | `#c7dcd0` |

Grammar (LOCKED): player is the **only** owner of `#f9c22b`; hazards the only owner of `#e83b3b`; backgrounds only use the first 4 rows; `#ffffff` reserved for 1-frame hit flashes. Player, checkpoints, dew get additive halos (Ori rule: player = brightest thing on screen). 4 parallax layers (HK sandwich): L0 occluder silhouettes 1.15× (≤15% coverage), L1 playfield 1.0×, L2 near garden 0.6× (2 colors), L3 sky gradient + canopy 0.3× + drifting mist. Always-on ambient dust motes (8–12), dew "jewelry" 3–8 per screen, vignette ~10%. Solid terrain autotiled (16-case 4-bit bitmask) with mandatory 2–3 px grass lip on top edges + hashed variants. Full drawing/animation specs: RESEARCH.md Addendum 1 §4–5.

## Mechanics spec — the full Dewdrop Dynasty set

Player character **Rumble**: 16×24 sprite cell, hitbox 8×14 (crawl: 8×8). Verbs:

1. **Run** — tight accel, air control 0.65.
2. **Jump** — deliberately modest (~2.6 tiles), variable height, coyote 100 ms, buffer 100 ms, corner correction 8 px, apex gravity 0.5×, fall gravity 1.7× rise.
3. **Gun-jump (signature)** — aim down + fire while airborne: vy set to `GUNJUMP_VY` (Downwell-style velocity reset), fires a real damaging pellet downward, costs 1 of **3 recoil charges** per airtime, charges reset on landing/wall. HUD shows charges as amber pellet pips.
4. **Shoot** — Pea-Popper pellets, 4-way aim (up/down/side), unlimited ammo on ground, muzzle flash, 1 dmg.
5. **Charge shot** — hold fire ≥ 0.45 s: bigger pellet, 3 dmg, pierces, slight self-knockback, screen shake.
6. **Pistol-whip** — melee arc in front, 1 dmg + strong knockback, 0.25 s cooldown; can bounce projectiles later (not v1).
7. **Roll** — ground dodge, 0.3 s, i-frames 0.22 s, speed 260 px/s, passes under low gaps? no — crawl does that; cooldown 0.4 s.
8. **Crawl** — hold down: hitbox 8×8, speed 60 px/s, fits 1-tile tunnels.
9. **Wall slide + wall jump** — slide cap 110 px/s; jump (±260, −340) with 160 ms input override. Clean Celeste scheme (the original's "backwards" walljump was a complaint — we fix it).
10. **Checkpoints** — dewdrop-on-leaf pedestals; heal to full, set respawn, save to localStorage.
11. **Health** — 4 dewdrop pips; contact/hazard = 1 dmg; hurt: hit-stop 80 ms, i-frames 1 s, knockback; death: burst + 600 ms fade, respawn at checkpoint, **tickets kept** (low-punishment, per research).
12. **Tickets** — currency pickups (sparkle), counter in HUD, persist through death.
13. **Vending machine** — in-world shop: stand + up to browse; sells **Burr Boots** (enables wall jump, gates the final ascent — the metroidvania beat) and a cosmetic **hat** (renders on Rumble). Tickets spent.
14. **Ability gating** — doors/obstacles with `requires:` flags; level data drives it.

### LOCKED constants (all in `src/constants.js`; do not retune silently)

```
TILE=16  VIEW_W=320  VIEW_H=180  HZ=60
maxRun=150  runAccel=1600  runReduce=900  airMult=0.65
gravity=1070  fallGravMult=1.7  apexGravMult=0.5  apexWindow=60  maxFall=320  fastFall=440
jumpVy=-300  releaseGravMult=2.5  jumpHBoost=30
coyote=0.100  jumpBuffer=0.100  cornerCorrection=8
gunjumpVy=-260  gunjumpCharges=3  shotSpeed=340  shotCooldown=0.14  chargeTime=0.45
(gunjumpVy retuned -240 → -260 on 2026-08-04 live playtest: practical chain height fell short of placed platforms)
meleeRange=18  meleeCooldown=0.25  meleeKnockback=180
rollSpeed=260  rollTime=0.30  rollIFrames=0.22  rollCooldown=0.40
crawlSpeed=60  wallSlideMax=110  wallJumpVx=260  wallJumpVy=-340  wallJumpLock=0.16
playerHP=4  hurtIFrames=1.0  hurtHitstop=0.08  killHitstop=0.04  pickupHitstop=0.05
shakeMax=5  traumaDecay=1.5  camK_x=7  camK_y=4  lookahead=28
```

Jump math check: h = 300²/(2·1070) ≈ 42 px ≈ 2.6 tiles, t_apex ≈ 0.28 s — modest and snappy per research.

### Enemies (Level 1 roster) + boss

- **Weevil** (walker): patrols ledges, turns at edges/walls, 2 HP, contact 1 dmg.
- **Gnat** (flyer): slow sine hover toward player within 6 tiles, 1 HP.
- **Sporespitter** (turret plant): lobs arcing spore every 2.2 s with 0.4 s wind-up telegraph, 3 HP.
- **Thorns** (hazard tile `^`): 1 dmg + respawn-to-last-ground nudge? No — knockback only, keep flow.
- **Boss: Bullhorn Beetle** — bull-like charger (per research). 12 HP, arena fight. Attacks with **readable wind-ups** (research-mandated fix): paw-scrape 0.6 s → charge (fast, wall-slam self-stun 1.2 s = punish window); hop-slam with 0.5 s shadow telegraph → shockwave pellets. Enraged (<50%): wind-ups 0.45 s, adds double charge. Gun-jumping over charges is the intended dance. Drops **Spore Shroom trophy** + 15 tickets; unlocks exit door.

### Level 1 — "The Fallen Garden" (finished, multi-room arc)

Room graph (each its own ASCII map, doors connect):
1. **Descent** — intro: Rumble tumbles in (no gun), walk right, learn run/jump/crawl; find the **Pea-Popper** on a pedestal (pickup beat + prompt).
2. **Dew Terraces** — platforms "just out of reach of a single jump" teach gun-jump (geometry-as-tutorial, plus light button prompts — research says original lacked them); first weevils; tickets on risky branches; **checkpoint**.
3. **Bramble Cellar** — crawl tunnels, thorns, sporespitter, hidden ticket cache; teaches roll (rolling weevil ambush corridor).
4. **The Atrium** — vertical hub with **vending machine** (Burr Boots 12 tickets, Acorn Cap hat 6); wall-jump shaft gated on Burr Boots; **checkpoint**; gnats.
5. **Bloom Ascent** — wall-jump + gun-jump combined climb, moving hazards, dew jewelry everywhere.
6. **Bullhorn Hollow** — boss arena; door locks until Bullhorn Beetle falls; exit door → Level 2.

Ticket economy: ≥ 20 placed before the Atrium so Burr Boots (12) is affordable on a normal route; hat affordable with thorough exploration. Level 2 ships as a small playable stub ("Cheese Mines" teaser) proving the add-a-level workflow.

## Forbidden list (hard constraints — RESEARCH.md Addendum 2 §7 verbatim)

No floaty jump (apex ≤ 0.35 s, fall ≥ 1.6× rise) · no missing coyote/buffer · no fixed jump height · no uniform tiles (autotile + variants mandatory) · no hitbox==sprite · no silent feel (impact = sound+particles+shake triad) · no static/rigid camera (damped follow + lookahead + platform-snap + room clamp) · no frame-rate-dependent physics · no corner bonks (correction mandatory) · no teleport collision (pixel-stepped, axis-separated) · no instant velocity (accel ramps) · no blurry pixels · no death-as-teleport (animation + transition + checkpoint restore) · nothing linear (ease camera/UI/squash).

## Juice spec (numbers locked, see constants + RESEARCH.md §6)

Trauma-model screen shake (whole-pixel offsets); hit-stop 50/80/40 ms (pickup/hurt/kill), 3 freeze frames on gun-jump ignition; particles (land dust, jump dust, run puffs, muzzle, hit sparks, death burst 20–30, ticket sparkle, ambient motes/spores/dew drips); squash & stretch scale-only (jump 0.7/1.3, land 1.3/0.7, ease-back 120 ms); camera lookahead 28 px, k=7/4, platform snapping, dead-zone 16×8, eased room transitions 250 ms; ZzFX-style vendored synth SFX (jump, gunshot, charge, melee, hurt, kill, pickup, purchase, checkpoint, boss roar) + light generative ambience; ±5% pitch jitter; AudioContext resumes on first input.

## Acceptance criteria (executable)

1. Serve `index.html`, zero console errors/warnings through a full playthrough.
2. Playwright: walk off ledge, jump 80 ms later → jumps (coyote). Press jump 80 ms before landing → jumps (buffer). Hold vs tap jump → different heights.
3. Airborne down-shots: exactly 3 lifts per airtime, resets on landing.
4. Full mechanics reachable: gun pickup, gun-jump, charge shot, melee, roll, crawl, wall jump (post-Burr-Boots), vending purchase, checkpoint respawn with tickets kept, boss kill, level exit → Level 2 loads.
5. Level loader validates maps (rectangular, legend-complete, doors resolve both ways) and throws with row/col on bad data.
6. Dropping any PNG into `assets/art/` re-skins with zero JS edits (manifest indirection verified).
7. 60 fps on the busiest room (boss + particles); render ≤ ~1000 draw calls.
8. `tools/export-sheets.html` downloads every sheet as PNG at manifest-exact geometry.

## Milestones

- [x] **M1 — Vertical slice:** loop, input, collision, full jump feel (coyote/buffer/variable/corner), camera, one test room, placeholder player rendering via manifest. Gate: Playwright movement tests pass, zero console errors. ✅ 2026-08-04
- [x] **M2 — Full verb set:** shoot, gun-jump, charge, melee, roll, crawl, wall slide/jump, projectiles. Gate: criterion 3 + all verbs demonstrable in test room. ✅ 2026-08-04
- [x] **M3 — Systems:** health/damage/i-frames/death/respawn, checkpoints + localStorage, tickets, vending machine, ability flags/gates, enemies (weevil/gnat/sporespitter), HUD. Gate: full loop damage→death→respawn verified. ✅ 2026-08-04
- [x] **M4 — Content:** Level 1's six rooms authored as data, Bullhorn Beetle boss, Level 2 stub, door transitions, level index. Gate: full playthrough start→Level 2, loader validation tests. ✅ 2026-08-04
- [x] **M5 — Polish:** parallax sandwich, all particles, shake/hit-stop everywhere, squash-stretch, audio set, title screen, room-transition easing, vignette, prompts. Gate: forbidden-list audit + screenshot squint test vs style bible. ✅ 2026-08-04 (squint test caught + fixed: door re-trigger bug, per-tile grid framing)
- [x] **M6 — Verification:** full Playwright harness (test skill), perf sample, criteria 1–8 all green. Gate: harness green twice consecutively. ✅ 2026-08-04 — 35/35, four consecutive green runs, 60.2 fps mean / 16.8 ms worst frame during boss fight

**Implementation note (2026-08-04):** variable jump shipped as the early-release
gravity multiplier (`releaseGravMult=2.5`, Pittman model) instead of the
Celeste sustain — the sustain stacked on the ballistic launch and produced a
5.1-tile jump vs the specced 2.6. Verified: full hop = 40 px ≈ 2.5 tiles.
The five sheets in `src/assets/art/*.png` are committed, generated by
`tools/export-art.mjs` from `placeholders.js`; the procedural fallback stays
live for any sheet that is deleted.

## File layout

```
index.html            tools/export-sheets.html
src/constants.js  src/main.js
src/engine/   input.js physics.js camera.js particles.js audio.js save.js sprites.js text.js
src/assets/   manifest.js placeholders.js art/README.md (drop-in PNGs)
src/game/     game.js player.js enemies.js boss.js entities.js projectiles.js hud.js background.js world.js
src/levels/   index.js level1.js level2.js LEVELS.md (authoring guide)
test/         harness (per test skill)
```
