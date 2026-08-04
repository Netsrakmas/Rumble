# RESEARCH.md — Dewdrop Dynasty-style Level 1

Compiled 2026-08-04 from three parallel research passes. Addenda are appended, never overwritten.

---

# Addendum 1 (2026-08-04) — Style Dossier

# Style Dossier: "Dewdrop Dynasty"-style Pixel-Art Metroidvania

Research date: 2026-08-04. Sources cited inline. Note on access: many primary pages (Steam, Kickstarter, Lospec, firith.studio) returned 403 through the sandbox proxy; where a page could not be fetched directly, findings come from search-result excerpts of that page and are marked accordingly.

## 0. Correction up front: Dewdrop Dynasty is NOT a Roblox game

Every source found identifies **Dewdrop Dynasty** as a **PC (Steam/Mac/Linux) pixel-art metroidvania built in Godot** by solo dev **Goodgis (Firith Studio)**, released **July 21, 2026** after ~6 years of YouTube-devlogged development. No Roblox version exists in any source. The real game is already a stylized 2D pixel-art game, so a pixel-art HTML5 recreation is on-model, not a translation from 3D.

- Steam: https://store.steampowered.com/app/1444080/Dewdrop_Dynasty/
- Kickstarter ("A Whimsical Neo-Retro Metroidvania"): https://www.kickstarter.com/projects/firithstudio/dewdrop-dynasty-a-whimsical-neo-retro-metroidvania
- Press page: https://www.firith.studio/dewdropdynasty/press.php
- Launch coverage: https://www.techtimes.com/articles/321159/20260721/dewdrop-dynasty-launches-gun-jump-mechanic-redefines-lighthearted-metroidvania.htm

## 1. How Dewdrop Dynasty actually looks (verified)

**Format:** Stylized 2D pixel art — "a unique, retro-inspired pixel art style," self-described as **"whimsical neo-retro."** Low-res, chunky, readable sprites; environments described by reviewers as "more on the simple side, with lots of blocky, simplistic environments with **brightly colored objects** to make things more visibly apparent" (Steam Next Fest demo impressions: https://kapodaco.wordpress.com/2022/10/07/thoughts-on-dewdrop-dynasty-steam-next-fest-demo/).

**Mood:** Explicitly the ANTI-Hollow-Knight in tone. "Unlike the gloomy atmospheres of Hollow Knight or Blasphemous, Dewdrop Dynasty is filled with charm, humor, and quirky characters... lighthearted in visual style, humorous in character design, family-friendly" (https://gamerant.com/steam-metroidvania-game-like-silksong-slime-rancher-dewdrop-dynasty/, https://gamelaunchhub.co.uk/dewdrop-dynasty-release-date-gameplay/). One reviewer: it "feels like Hollow Knight and Paper Mario merged together" (Steam community review thread: https://steamcommunity.com/app/1444080/discussions/0/7195113615749194144/).

**Color:** "Bursts with color and character"; "environments distinct across biomes"; "**the lighting and palette shifts mark new regions**." Counter-example inside the game: an underground mine area is "almost nothing but dark browns and blacks and muted colors" — i.e. the game uses per-biome palette identity, saturated in gardens, muted underground.

**Character:** Verified — the hero is **Poe, a small bee warrior who lost his wings**, propelling himself with recoil from a pea-shooter-style gun ("gun-jump" replaces double-jump). Cosmetic **hats** are a feature. Silhouette: small round body, big head/eyes in the Goodgis cute-mascot idiom, stubby limbs.

**Areas:** "Diverse biomes"; only **Mt. Melty** is confirmed by name (https://gamefaqs.gamespot.com/pc/314885-dewdrop-dynasty). The starting area's name/palette is **unverified** — no wiki with area pages surfaced. For the recreation, lean on the "lush overgrown garden at dew-dawn" fantasy and the verified "colorful, charming, bright objects on simple ground" grammar.

**Community palette exists:** Lospec hosts **"Dewdrop Dynasty-40"** (40 colors, by JuhoSprite, "inspired by the indie game Dewdrop Dynasty by Goodgis") and **"Dewdrop Dynasty-96"** (extended with greys and dark/light ramps): https://lospec.com/palette-list/dewdrop-dynasty-40 and https://lospec.com/palette-list/dewdrop-dynasty-96. Exact hexes were not retrievable through the proxy — treat these URLs as the authoritative color reference to check when network access allows; the proposal in §3 uses Resurrect-64 instead (fully known).

## 2. Named style anchors and their visual-grammar rules

**Hollow Knight — atmosphere, parallax, particle language** (https://80.lv/articles/breakdown-hollow-knights-art-style, https://medium.com/3d-environmental-art/the-art-of-hollow-knight-f4c05dda3882, https://www.pcgamer.com/hollow-knights-charming-art-sets-the-bar-for-hand-drawn-games/)
- Screen is a sandwich: **foreground occluder silhouettes** (near-black plants/rocks partially blocking the view) + playfield + **multiple parallaxed background layers** + drifting fog/clouds + constant ambient particles.
- Backgrounds are **desaturated and value-compressed**; the playfield layer holds the contrast. Characters are **silhouette-first**: pale/light bodies against dark grounds.
- Always-on ambient particle layer (motes, spores) sells depth and stillness; **subtle vignette** darkens screen corners and focuses the eye.
- Rule to copy: every scene = 1 foreground silhouette layer, 1 play layer, 2–3 background layers each **darker, bluer, and blurrier** with distance.

**Celeste — game-feel and 8px-tile readability** (https://x.com/maddythorson/status/1238338574220546049, https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs, https://www.celestegame.com/changelog.html)
- Built on **8×8 tiles**; hazards, solids, and pickups are each one unmistakable color family. Player readability beats environment detail every time.
- Input forgiveness is part of the "style": **coyote time (~0.1 s), jump buffering (~0.1 s), corner correction** — Thorson: "everything is fudged a tiny bit in the player's favor."
- Hard numbers from Celeste's shipped tuning (changelog + open-source Player.cs): refill-gem hitstop **0.05 s** (reduced from 0.10 s because 0.10 felt intrusive mid-flow); explosion freeze **0.1 s**; a **50% screenshake** setting was made the default — ship a shake-intensity option.
- Rule to copy: 8px collision grid, chunky 1-colour-ramp tiles, dust puffs on every land/dash, squash-and-stretch on the sprite (scale only, never the hitbox).

**Ori and the Blind Forest — glow** (https://sixwingstories.org/2024/01/07/how-art-direction-is-used-to-create-a-sense-of-atmosphere-in-ori-and-the-blind-forest/, https://www.thegamer.com/ori-and-the-will-of-the-wisps-artists-hand-painted-30000-light-maps/, https://news.xbox.com/en-us/2015/03/17/games-the-artwork-of-ori-and-the-blind-forest/)
- **The player is the brightest thing on screen** — Ori is white and softly glowing so the eye never loses him. Glow color is semantic: cool glow = good/safe, hot/purple glow = danger.
- Lighting is *painted*, layered (90+ unique tree graphics composited into parallax; hand-painted light maps). In pixel terms: additive-blend soft radial sprites behind emissive objects, not full-screen bloom.
- Rule to copy: give the player, save points, and dew/water a 2-step additive halo (bright core + wide faint ring); keep everything else matte.

**Animal Well — dense foliage, moody light** (https://www.gamedeveloper.com/art/animal-well-s-haunting-style-owes-much-to-procedural-animation, https://www.pushsquare.com/news/2023/02/animal-wells-sinister-ps5-pixel-art-aesthetic-is-a-sight-to-behold, https://halfglassgaming.com/2022/06/animal-well-is-a-pixel-art-metroidvania-that-looks-absolutely-incredible/)
- Dense, layered environments that "pulsate and glow": dynamic lighting + normal-mapped backgrounds under pixel art; neon accents against deep darks; optional CRT scanlines; environments inspired by gardens.
- Rule to copy: fill rooms with **overlapping silhouetted plant clutter** at slightly different darkness levels; let a few emissive elements (dew, flowers, eyes) punch through; a light vignette/scanline overlay at low opacity (toggleable) adds the "alive" quality.

## 3. Concrete palette proposal — "Dew-Dawn Garden 16"

Grounded in **Resurrect-64** by Kjell Strand (https://lospec.com/palette-list/resurrect-64) — every hex below is a verbatim Resurrect-64 swatch, so the set is guaranteed internally harmonious. (Cross-check later against the fan-made **Dewdrop Dynasty-40**, §1.) Alternatives: **Apollo** by AdamCYounis (https://lospec.com/palette-list/apollo) skews moodier/HK-like; **Endesga-32** (https://lospec.com/palette-list/endesga-32) skews brighter/arcadey. Resurrect-64 is the best fit: it has the plum-indigo dawn darks AND juicy greens/yellows in one family.

| Role | Hex | Note |
|---|---|---|
| background deep (pre-dawn plum) | `#2e222f` | darkest value; FG occluders too |
| background mid (indigo sky) | `#323353` | sky gradient bottom / layer-3 fill |
| background light (dawn indigo) | `#484a77` | sky gradient top, distant canopy |
| far foliage (desat. teal-green) | `#374e4a` | parallax layer 2 plants |
| foliage dark | `#165a4c` | playfield leaf shadow |
| foliage mid | `#239063` | main leaf/tile body |
| foliage light | `#91db69` | lit leaf, grass-lip top edge |
| foliage highlight | `#cddf6c` | dawn rim-light on grass tips |
| dew/water glow core | `#30e1b9` | water body, dew core |
| dew glow halo / UI accent | `#8ff8e2` | additive halo, sparkle frames |
| player primary (bee yellow) | `#f9c22b` | Poe's body — warmest sat. thing on screen |
| player accent (scarf/blush) | `#f57d4a` | scarf, gun muzzle flash |
| player/outline dark | `#45293f` | bee stripes + universal sprite outline |
| enemy primary (rose) | `#cf657f` | enemy bodies — hue-opposed to foliage |
| hazard (thorn red) | `#e83b3b` | spikes, damage flashes |
| UI / highlight white | `#c7dcd0` | text, health pips, top-light; pure `#ffffff` reserved for 1-frame hit flash |

Grammar rules: backgrounds only ever use rows 1–4; the player is the **only** owner of `#f9c22b`; hazards the only owner of `#e83b3b`. That enforces Celeste-style readability automatically.

## 4. Per-object drawing specs

- **Player (Poe-like bee):** 16×16 sprite cell, actual body ~12×12, hitbox ~8×12 (Celeste's Madeline: 8×11 hitbox in a much larger cell — hitbox smaller than art, always). Silhouette-first: round head ≥ 50% of body, 2px antennae that lag movement, stubby body, scarf as the read for facing/velocity. 1px `#45293f` outline, no internal outlines. Constant 1-step additive halo (radius ~10px, `#8ff8e2` at ~15% alpha) so the player glows Ori-style at dawn.
- **Tiles:** 16×16 art tiles on an 8×8 collision grid. 47-piece autotile (or 16-piece blob minimum) for the garden-soil terrain: `#165a4c` body, `#239063` face, and a mandatory 2–3px **grass lip** (`#91db69` + `#cddf6c` sparkle pixels) on every top edge. Hanging decorations: 1-tile-wide vines (2–4 tiles long, 2-frame sway), drooping flower bells, moss fringe on undersides — placed on a decoration pass, never colliding.
- **Background: 4 parallax layers** (HK sandwich):
  - L0 foreground occluders, scroll 1.15×, pure `#2e222f` silhouettes (giant grass blades, seed heads), ≤15% screen coverage;
  - L1 playfield, 1.0×, full palette;
  - L2 near garden, 0.6×, only `#374e4a`/`#165a4c` (2 colors);
  - L3 far canopy + sky, 0.3×, `#484a77` shapes on `#323353→#484a77` vertical gradient; a slow 0.05× drifting mist band between L2 and L3.
  - Desaturation rule: each step back loses ~30% saturation and shifts toward indigo.
- **Particles:** (a) ambient dust motes — 8–12 alive, 1×1/2×2 px, `#c7dcd0` @ 20–40% alpha, slow Brownian drift, always on (HK's stillness trick); (b) spores — 1px `#8ff8e2` rising near flowers; (c) dew drips — 1×2 px `#30e1b9` falling from leaf tips every 3–7 s with a 3-frame splash; (d) action puffs — 3–5 px `#c7dcd0` circles on land/dash, 0.2 s life (Celeste).
- **Water/dew:** water surface = 1px `#8ff8e2` line with ±1px sine offset over `#30e1b9` body at 60% alpha; standing dewdrops on foliage = 2×3 blobs, `#30e1b9` body + 1px `#c7dcd0` specular top-left + additive halo. These are the "jewelry" of every room — budget 3–8 per screen.
- **Save point:** a large dewdrop on a leaf pedestal (on-theme replacement for HK's benches): 12×20, idle 4-frame shimmer; on save, white flash → ring burst of 8 spore particles + soft chime. Brightest static object in any room.
- **UI:** health = **dewdrop-shaped pips** (7×9 px, `#8ff8e2` fill, `#c7dcd0` rim; empty = outline only), top-left, HK-style; ammo/gun-jump charge as tiny amber pellets `#f9c22b` beneath. Chunky 8px-friendly font, `#c7dcd0` on `#2e222f` panels with 1px rounded corner dithering. Subtle full-screen vignette (~10% `#2e222f` corners, HK) + optional scanline overlay at ≤6% (Animal Well nod).

## 5. Animation specs

Character frame counts (16×16, standard small-res practice):
- **Idle:** 4 frames @ 8 fps — body bob 1px, antennae counter-bob, blink every ~3 s (2-frame).
- **Run:** 6 frames @ 12 fps — 1px vertical bounce, scarf trails 1 frame behind.
- **Jump/fall:** 3 poses (rise / apex / fall), pose-switched by velocity, not timed.
- **Gun-jump/dash:** 2 frames + 2-frame muzzle flash (`#f57d4a`→`#ffffff`) + recoil smear frame.
- **Hit:** 1 frame, whole sprite flashed `#ffffff`, 2 flashes over 0.2 s + knockback pose.

Squash & stretch (scale only, hitbox untouched — Celeste convention, see Player.cs: https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs): jump launch ~(0.7×, 1.3×), hard-land ~(1.4×, 0.6×) scaled by fall speed, recover to (1,1) over ~0.15 s eased.

Game-feel numbers (grounded in Celeste's shipped values — changelog https://www.celestegame.com/changelog.html, Thorson thread https://x.com/maddythorson/status/1238338574220546049):
- Coyote time **100 ms**; jump buffer **100 ms**; corner correction ~4 px.
- Hitstop: pickup/refill **50 ms** (Celeste explicitly reduced from 100 ms — 100 felt intrusive when repeated); enemy kill **30–50 ms**; player damage **80–100 ms** (Celeste explosions freeze 100 ms).
- Screenshake: land/shoot **1–2 px, 50–100 ms**, directional; damage **3–4 px, 150 ms**; ship a 50%/off intensity setting (Celeste made 50% its default).
- Ambient loops: water shimmer 4 frames @ 6 fps; vines 2 frames @ 2 fps offset per-instance so the garden never moves in unison (Animal Well's "always alive" feel, https://www.gamedeveloper.com/art/animal-well-s-haunting-style-owes-much-to-procedural-animation).

## Unverified / gaps
- Starting-area name and exact room palettes of Dewdrop Dynasty: no wiki found; §3–4 lean on the anchors and the verified "colorful biomes, palette shift per region" rule.
- Exact hexes of Lospec's Dewdrop Dynasty-40: page unreachable via proxy (403); URL provided for later verification.
- Any Roblox connection: none found; treat as erroneous.

---

# Addendum 2 (2026-08-04) — Architecture, Physics & Spec-Craft Dossier

## 1. Platformer physics recipes (the canonical numbers)

### 1.1 Fixed timestep
- **Update at a fixed 60 Hz** (`dt = 1/60 s`) with an accumulator loop; render as fast as `requestAnimationFrame` allows. Variable `dt` makes physics non-deterministic and breaks tuned jump arcs; the canonical treatment is Glenn Fiedler's "Fix Your Timestep" (https://gafferongames.com/post/fix_your_timestep/): accumulate frame time, step simulation in fixed slices, optionally interpolate render state.
- Clamp the accumulated frame delta (e.g. max 0.25 s) so a background tab doesn't cause a "spiral of death" or a teleporting player.
- Celeste itself simulates at a locked 60 fps; all its constants below are per-second values applied at 60 Hz (source: Celeste's actual Player.cs, https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs).
- A fixed timestep is also what makes **Playwright testing deterministic**: same inputs → same positions.

### 1.2 Deriving gravity and jump velocity from designer intent
From Kyle Pittman's GDC 2016 talk "Math for Game Programmers: Building a Better Jump" (https://www.youtube.com/watch?v=hG9SzQxaCm8, slides https://media.gdcvault.com/gdc2016/Presentations/Pittman_Kyle_BuildingBetterJump.pdf): never pick gravity and jump velocity by feel-tweaking two coupled numbers. Pick **jump height `h`** and **time-to-apex `t_h`**, then derive:

```
gravity g    = 2h / t_h²
jumpSpeed v0 = 2h / t_h        (equivalently v0 = sqrt(2 g h))
```

Good starting point for a tight metroidvania: `h = 3.5 tiles`, `t_h = 0.30–0.35 s` → with 16 px tiles: `g ≈ 1244 px/s²`, `v0 ≈ 373 px/s`. Anything with `t_h > 0.5 s` reads as floaty.

Pittman's second key idea: **the arc need not be one parabola** — use higher gravity after apex (fall gravity ≈ 1.6–2× rise gravity) so the fall is snappier than the rise.

### 1.3 The Celeste reference constants (real source code)
From NoelFB/Celeste `Player.cs` (verified directly from the repo). Celeste uses **8 px tiles**:

| Constant | Value | In tiles (8 px) | Meaning |
|---|---|---|---|
| `Gravity` | 900 px/s² | 112.5 t/s² | base gravity |
| `HalfGravThreshold` | 40 px/s | — | **apex modifier**: gravity × 0.5 while `|vy| < 40` and jump held |
| `MaxFall` | 160 px/s | 20 t/s | normal terminal velocity |
| `FastMaxFall` | 240 px/s | 30 t/s | fast-fall (holding down) |
| `MaxRun` | 90 px/s | 11.25 t/s | run speed |
| `RunAccel` | 1000 px/s² | — | ground acceleration (0→max in ~0.09 s) |
| `RunReduce` | 400 px/s² | — | deceleration above max speed |
| `AirMult` | 0.65 | — | air control = 65% of ground accel |
| `JumpSpeed` | −105 px/s | 13 t/s | initial jump velocity |
| `JumpHBoost` | 40 px/s | — | horizontal speed added on jump in move direction |
| `VarJumpTime` | 0.2 s | — | **variable jump**: jump speed is *sustained* up to 0.2 s while held |
| `JumpGraceTime` | 0.1 s | — | **coyote time = 100 ms (6 frames)** |
| `UpwardCornerCorrection` | 4 px | — | ceiling corner-correction nudge |
| `DashSpeed` | 240 px/s | 30 t/s | dash velocity |
| `DashTime` | 0.15 s | — | dash duration (15 frames, incl. freeze) |
| `DashCooldown` | 0.2 s | — | before next dash |
| `EndDashSpeed` | 160 px/s | — | speed retained when dash ends |
| `DashCornerCorrection` | 4 px | — | corner nudge while dashing |
| `WallSlideStartMax` | 20 px/s | — | fall speed cap when wall-slide starts |
| `WallSlideTime` | 1.2 s | — | slide cap relaxes over this time |
| `WallJumpHSpeed` | 130 px/s (`MaxRun+JumpHBoost`) | 16.25 t/s | horizontal wall-jump kick |
| `WallJumpForceTime` | 0.16 s | — | input is overridden away from wall for 160 ms |
| `WallJumpCheckDist` | 3 px | — | wall-jump works up to 3 px from wall |

Notes:
- **Variable jump height, Celeste-style**: Celeste *holds* `vy = JumpSpeed` for up to `VarJumpTime = 0.2 s` while the button is held; releasing ends the sustain. The simpler, equally accepted recipe: on early release, multiply gravity by **2–3×** (or cut `vy` in half once). Either works; pick one and lock it.
- **Dash freeze frames**: the 15-frame dash includes **3 freeze frames** of hit-stop at dash start (Celeste Tech wiki, https://celeste.ink/wiki/Tech).
- **Coyote time**: Celeste = 0.1 s; community norm **80–150 ms**. **Jump buffer**: Celeste ≈ 5 frames (~83 ms); norm **80–120 ms**. Both described in Maddy Thorson's "Celeste & Forgiveness" (https://maddythorson.medium.com/celeste-forgiveness-31e4a40399f1).

### 1.4 Recommended locked constants for a 16 px-tile game (Celeste-scaled ×2)
```
TILE=16  UPDATE_HZ=60
maxRun=180 px/s        runAccel=2000   runReduce=800   airMult=0.65
gravity=1800 px/s²     maxFall=320     fastFall=480
jumpSpeed=-360         varJumpTime=0.2 s (or releaseGravMult=2.5)
apexGravMult=0.5 when |vy|<80 px/s
coyoteTime=0.1 s       jumpBuffer=0.1 s      jumpHBoost=80
wallSlideMax=110       wallJump=(±260, -360)  wallJumpLockTime=0.16 s
dashSpeed=480          dashTime=0.15 s        dashCooldown=0.2 s    dashFreeze=3 frames (50 ms)
cornerCorrection=8 px (Celeste's 4 px scaled for 16 px tiles)
```

## 2. Collision: AABB vs tile grid

### 2.1 Core algorithm — axis-separated move-and-slide
Canonical references: Rodrigo Monteiro's "The Guide to Implementing 2D Platformers" (http://higherorderfun.com/blog/2012/05/20/the-guide-to-implementing-2d-platformers/), katyscode's "Collision Detection for Dummies", and Maddy Thorson's "Celeste and TowerFall Physics" (https://maddythorson.medium.com/celeste-and-towerfall-physics-d24bd2ae0fc5):

1. Keep **integer pixel positions** plus a float sub-pixel remainder per axis (Celeste's `MoveH/MoveV` pattern).
2. Each step: **move X first, resolve; then move Y, resolve** — never both at once. Axis separation makes wall-vs-floor decisions unambiguous and eliminates most corner snagging.
3. To move N pixels, **step 1 px at a time**, checking the tile grid each step. At 60 Hz even a 480 px/s dash is 8 px/frame — trivially cheap, and **tunneling becomes impossible by construction** (Celeste's actual approach).
4. On collision: zero that axis's velocity, snap flush to the tile edge.
5. Collision queries = check the tiles overlapping each edge of the AABB (`floor(x/TILE)` math). Never iterate all tiles.

### 2.2 One-way (semi-solid) platforms
- Solid only when: `vy >= 0` **and** the player's feet were at-or-above the platform top on the previous step (`prevBottom <= platTop`). Never collide moving upward or from the side.
- Drop-through: pressing Down+Jump disables that platform's collision for ~0.25 s.

### 2.3 Corner correction (the polish move)
When upward motion is blocked but the ceiling overlap is only a few pixels, **shift the player horizontally (up to 4–8 px) and let the jump continue** instead of bonking. Celeste: `UpwardCornerCorrection = 4 px` at 8 px tiles → use ~8 px with 16 px tiles. Walkthrough: https://amano.games/devlog/how-to-correct-a-corner.

### 2.4 Pitfalls
- **Tunneling**: solved by pixel-stepped movement. Do not trust `pos += vel*dt` teleport-then-resolve.
- **Corner catching / seam snags**: caused by resolving X and Y together, or by checking collision against individual tile rects. Axis separation + treating the grid as a solidity query fixes it.
- **Sticky walls**: don't zero `vx` when merely brushing a wall while airborne unless actually moving into it.
- **Slopes: skip for v1.** Largest complexity jump in tile platformers; rectangles + one-ways read fine.

## 3. Architecture for fully swappable art

### 3.1 Asset manifest pattern
One indirection point: game code refers to **logical names only** (`"player.run"`, `"tiles.rock"`), never to files. A single manifest maps logical name → sheet + frames + pivot + fps (the shape of the TexturePacker "JSON hash" format, https://www.codeandweb.com/texturepacker/documentation):

```jsonc
{
  "sheets": { "player": "art/player.png", "tiles": "art/tiles.png" },
  "sprites": {
    "player.idle": { "sheet": "player", "frames": [[0,0,16,24],[16,0,16,24]], "fps": 4,  "pivot": [8,24], "loop": true },
    "player.run":  { "sheet": "player", "frames": [[0,24,16,24],[16,24,16,24],[32,24,16,24],[48,24,16,24]], "fps": 12, "pivot": [8,24], "loop": true }
  }
}
```
Rules that make art swappable later:
- **Pivot in the manifest, not in code.** Feet-center pivot for characters; render = `draw(frame, x - pivot.x, y - pivot.y)`.
- **Hitboxes are defined in entity data, never derived from sprite size.**
- Animation state machine selects logical names; a later art pass changes frame counts/fps by editing only the manifest.

### 3.2 Procedural-placeholder fallback (zero binary files)
Keep a registry of **draw functions keyed by the same logical names**. The loader tries the PNG from the manifest; on 404 it calls the generator, which draws each frame into an **offscreen canvas** at the exact manifest frame size and hands back the same "sheet" interface (a canvas is a legal `drawImage` source).

```js
async function loadSheet(name, url, fallback) {
  try { return await loadImage(url); }
  catch { const c = document.createElement('canvas'); fallback(c.getContext('2d')); return c; }
}
```
- Placeholders should be **real little sprites** (silhouette + 2–3 colors + outline, distinct per frame), not colored rects — so feel and readability are testable before art exists.
- Because sizes/pivots come from the manifest, final PNGs later **drop in with zero code changes** — the definition of "art/code separation".
- Precedent: js13kGames scene, ZzFX (https://github.com/KilledByAPixel/ZzFX), LittleJS.

### 3.3 Tile atlas + autotiling — recommend 4-bit / 16-tile
Standard schemes (BorisTheBrave "Beyond Basic Autotiling" https://www.boristhebrave.com/2021/09/12/beyond-basic-autotiling/; Red Blob https://www.redblobgames.com/articles/autotile/claude/):
- **4-bit cardinal bitmask (16 tiles)**: `index = N·1 + E·2 + S·4 + W·8`. 16 tiles to draw. No inner corners — slightly blockier.
- **8-bit blob (47 tiles)**: proper inner corners, smoothest, ~3× art cost.

**Recommendation: 16-tile 4-bit for v1** — cheap to generate procedurally, one-liner lookup, already kills the "uniform tile grid" failure mode. Keep the mask function pluggable for a later 47-blob upgrade. Compute autotile indices **once at level load** (levels store only solidity; visuals derive). Add variety: 2–3 alternates for the "fully surrounded" tile picked by hashed position, plus decorative grass/stones on exposed tops.

## 4. Data-driven levels

### 4.1 Format decision
- **Tiled JSON**: industry default, but flat gid arrays are unreadable/undiffable for humans and AI agents, requires the external editor. Wrong default here.
- **ASCII string maps** (one char per tile + legend + entities list): human- and AI-writable, git diffs show level edits *visually*, zero tooling. **Recommended.**

Chars encode *tiles and simple fixed entities*; anything with parameters (doors, gates, enemies with patrol ranges) goes in an `entities` list in tile units. Rooms are the metroidvania unit: the world is a graph of rooms connected by doors; the camera clamps to room bounds (Itay Keren, "Scroll Back", https://www.gamedeveloper.com/design/scroll-back-the-theory-and-practice-of-cameras-in-side-scrollers).

### 4.2 Worked example
```js
// levels/atrium.js — pure data, no logic
export default {
  id: "atrium",
  legend: { "#": "rock", "-": "oneway", "^": "spikes", ".": "empty", "P": "playerSpawn", "*": "gem" },
  map: [
    "################################",
    "#..*...................######..#",
    "#.####......----.......#....^..#",
    "A......P........----...........B",
    "################################",
  ],
  entities: [
    { type: "door", char: "A", to: "westCave",  toDoor: "B" },
    { type: "door", char: "B", to: "bossHall",  toDoor: "A", requires: "doubleJump" },
    { type: "checkpoint", x: 8,  y: 5 },
    { type: "walker", x: 20, y: 6, patrol: [16, 27], speed: 40 },
    { type: "abilityPickup", x: 29, y: 2, grants: "dash" },
  ],
  camera: { bounds: "room" },
}
```
Conventions:
- Loader validates: rectangular map, every char in legend, door targets exist (both directions), spawn exists. **Fail loudly at load, not at play.**
- Doors: entering door `A` spawns you at its tile offset inward; transitions carry velocity.
- Ability gates are doors/obstacles with `requires`; save state = granted ability flags + visited checkpoint.
- **Adding a level = adding one data file + one line in a level index. If a milestone requires touching engine code to add content, the architecture has failed.**

## 5. Engine choice

**Recommendation: plain Canvas 2D, zero dependencies, ES modules, no build step.**
- **Zero-dependency reliability**: no npm/CDN failure class; every line of engine behavior in-repo and greppable. Phaser's Arcade physics would *conflict* with the hand-tuned Celeste-style controller, which we must own anyway.
- **Playwright testability**: expose `window.game` state, drive keydown/keyup, step the deterministic fixed-timestep loop, assert positions/flags, fail on console errors.
- **Performance**: pixel-art renders to a small internal canvas (**320×180**, `imageSmoothingEnabled=false`, integer-scaled up). Hundreds of drawImage calls per frame is comfortably 60 fps; Canvas 2D only loses to WebGL in the many-thousands-of-sprites regime (https://github.com/Shirajuki/js-game-rendering-benchmark).
- Single `index.html` + `<script type="module">` keeps GitHub Pages deployment trivial.

## 6. Game-feel / juice checklist (with numbers)

Sources: JW Nijman (Vlambeer) "The Art of Screenshake" (https://www.youtube.com/watch?v=AJdEqssNZ-U); Squirrel Eiserloh "Juicing Your Cameras With Math" (https://www.youtube.com/watch?v=tu-Qe66AvtY); Keren "Scroll Back".

- **Screen shake — trauma model (Eiserloh)**: scalar `trauma ∈ [0,1]`; events *add* trauma (small hit +0.25, player hurt +0.5, boss slam +0.8); `shake = trauma²`; offset = `maxOffset × shake × noise(t)` per axis. Decay trauma linearly ~**1.3–1.8/s**. At 320×180: `maxOffset = 4–6 px`; whole-pixel offsets keep pixel art clean. Skip rotation for crisp pixels.
- **Hit-stop**: pause the *world* (not UI) **2–3 frames (33–50 ms)** on hit/stomp, **4–6 frames (66–100 ms)** on player damage or kill blow. Celeste freezes **3 frames on every dash**. Implement as a `freezeTimer` that skips fixed updates.
- **Particles** (1–3 px squares): landing dust 4–6 puffs 250–400 ms; jump dust 3–4; run dust 1 puff/~0.15 s at full speed; hit sparks 8–12 at 100–250 px/s with gravity, 300 ms; death burst 20–30; pickup sparkle 6–8 rising. Pool ~500; kill oldest.
- **Squash & stretch** (scale about foot pivot, never the hitbox): jump launch **(0.7, 1.3)**, land **(1.3, 0.7)** scaled by fall speed, dash **(1.4, 0.6)** along dash axis; ease back to (1,1) in **100–150 ms** ease-out.
- **Camera**: horizontal **lookahead 24–32 px** in facing direction via damping; exponential smoothing `pos += (target − pos) × (1 − exp(−k·dt))`, `k ≈ 6–8/s` horizontal, `k ≈ 4` vertical; **platform snapping** — only track Y when grounded or falling fast, never during jump rise; dead-zone ~16×8 px; clamp to room bounds always; on room transition slide camera 200–300 ms eased.
- **Sound with zero binary files — ZzFX** (<1 KB 20-parameter synth; designer https://killedbyapixel.github.io/ZzFX/; music: ZzFXM https://keithclark.github.io/ZzFXM/). Vendor the ~1 KB function. Hand-rolled WebAudio recipes: **jump** = square osc 150→400 Hz over 100 ms, gain exp-decay 150 ms; **hit** = sawtooth 220→60 Hz over 80 ms + white-noise burst; **pickup** = two square blips (880 then 1320 Hz), 60 ms each. Rules: master gain ~0.3; ±5% random pitch per play; create/resume AudioContext on first input (autoplay policy).
- Remaining Vlambeer stack: white flash frame on hits (1–2 frames), enemies knocked back 2–4 px on hit, corpses/permanence.

## 7. Known AI/generic failure modes — the FORBIDDEN list

1. **Floaty jump** — time-to-apex > 0.5 s, symmetric rise/fall. Must be ≤ 0.35 s with fall gravity ≥ 1.6× rise.
2. **No coyote time / no jump buffer** — test: walk off ledge, press jump 80 ms later, must still jump. Fix: 100 ms both.
3. **Fixed jump height** — release must shorten the jump.
4. **Uniform tiles** — every solid tile the same sprite. Fix: 16-case autotile + top decoration + variants.
5. **Hitbox == sprite** — player hitbox narrower than sprite (Celeste: 8×11 under ~16 px art); hazard hitboxes inset ~4 px; hitboxes in data.
6. **Silent game / silent feel** — every player-state change needs at least one feedback channel (sound + particles + shake triad on impacts).
7. **Static or rigid camera** — hard-locked or immobile. Fix: damped follow + lookahead + platform snapping + room clamp.
8. **Frame-rate-dependent physics** — `pos += vel` per rAF tick breaks on 120 Hz monitors. Fix: fixed 60 Hz accumulator.
9. **Corner bonks** — jumps cancelled by 2 px ceiling overlaps. Fix: corner correction.
10. **Teleport collision** — full-velocity move then push-out; tunneling and seam snags. Fix: pixel-stepped axis-separated movement.
11. **Instant-velocity movement** — no accel/decel ramps; no air-control multiplier.
12. **Blurry pixels** — missing `image-rendering: pixelated` / `imageSmoothingEnabled=false`, non-integer scaling, fractional draw coordinates.
13. **Death = teleport** — no death animation, no hit-stop, no respawn transition; respawn losing checkpoint state.
14. **Everything linear** — no easing on camera, UI, transitions, squash recovery.

## 8. Master-prompt / spec craft for AI-built games

Sources: Addy Osmani "How to write a good spec for AI agents" (https://addyosmani.com/blog/good-spec/); Blink agentic-coding best practices.

- **Spec before prompt**: a written contract — in/out scope, edge cases, acceptance criteria — beats any clever prompt.
- **Milestone-gated builds**: numbered milestones, each ends with a *playable build* plus explicit stop-and-verify before the next.
- **Locked constants block**: every physics/juice number in one `constants.js` marked LOCKED; feel regressions come from silent constant drift.
- **Acceptance criteria phrased as executable checks**: "pressing jump 80 ms after walking off a ledge still jumps (Playwright test)", "level file with an unknown char throws at load with row/col", "swapping art/player.png changes visuals with zero JS edits".
- **Include the forbidden list verbatim** as hard constraints — negative constraints catch generic-output regressions.
- **Data/code contract stated explicitly**: "new level = new data file only; new art = new PNG only."
- **One golden reference**: name the target feel ("Celeste-style movement, constants above") rather than adjectives.
- **Verification is part of every milestone**: console-error-free run, deterministic sim test, screenshot review gate before "done".

---

# Addendum 3 (2026-08-04) — Dewdrop Dynasty Mechanics Dossier

## 0. Corrections and constraints
1. **Dewdrop Dynasty is a Steam PC/Mac/Linux game** (app 1444080), released **July 21, 2026**, built in **Godot** by **Goodgis / Firith Studio** over ~6 years of public YouTube devlogs; Kickstarter-funded. Not Roblox.
2. **No fan wiki exists yet** (~2 weeks post-launch), so granular numbers (HP, tile distances, damage) are not publicly documented anywhere. Every unverified item below is flagged and paired with an anchor-game equivalent.
3. Research assembled from ~20 targeted search queries; direct page fetches were blocked by the sandbox proxy.

## 1. What the game is
- **Premise:** You are **Poe, a small bee warrior who lost their wings** and must fight back home to the **Hive**, exploring an interconnected insect-scale world called **Underland** (setting brand: "Dewdrop").
- **Tone:** bright and funny — press kit: "the charm and humor of **Paper Mario**, the tight action of **Hollow Knight**." Marketing promises "cheese mines, power struggles, mecha crabs, and lots and lots of combat."
- **Reception:** 83% positive (184 reviews). Praise: movement feel, soundtrack, art, personality. Criticism: control scheme, boss pacing (no wind-ups), map clarity, backtracking, launch bugs, short length ($19.99 → $11.99 price cut).

## 2. Player mechanics (verification status noted)
| Mechanic | Detail |
|---|---|
| **Run** | Fast-paced, "smooth and fluid". |
| **Jump** | Single jump, deliberately modest ("not substantial") — forces reliance on gun-jump. Anchor: Cave Story short hop, ~2–3 tiles. |
| **Gun-jump (signature)** | Fire the pistol **downward**; recoil launches upward. Replaces double/triple jump — each downward shot gives a modest lift, chainable. Downward shots **also deal damage below** — traversal and combat share one resource. Canonical anchor: **Downwell gunboots** (sharp upward velocity reset per shot, magazine resets on landing). Cap 2–3 boosted lifts per airtime for the "double/triple jump" read. |
| **Pistol-whip** | Close-range melee with the gun ("gun-jumping, pistol-whipping action"). |
| **Charge shot** | Hold fire to charge a stronger shot. |
| **Roll / dodge** | Gamepad B; dodging in combat + movement verb (i-frames unverified). |
| **Crawl** | Confirmed verb — low-tunnel gating. |
| **Dash** | Confirmed verb; possibly the roll under another name. |
| **Wall jump** | Confirmed; original's "feels backwards" complaint → rebuild should use clean Celeste-style wall jump. |
| Unlockables | New guns/items that alter weapons, jump-height item, **hats** (cosmetic, some small stat changes), **Spore Shroom** (boss reward or boss name — conflicting). No official ability list exists. |

## 3. Health, saves, death, currency
- **Currency: "Tickets"** (verified). Collected in world, redeemed at **vending machines** for abilities, consumables, vanity items/hats — headline press-kit feature.
- **Health: unverified.** Anchor: discrete pips top-left (Hollow Knight masks / Cave Story hearts), 3–5 starting HP.
- **Checkpoints exist** (form undocumented). Death = warp to last save, fast enough that speedrunners exploit it ("Death Warp" category); **no evidence of currency loss** — low-punishment respawn.

## 4. Combat
- Pistol shots in aimable directions; **downward fire doubles as the jump** — combat and traversal continuously trade off. Encounters as choreography: "fire to interrupt an animation, gun-jump for height and momentum, string attacks into a short combo before you land."
- Melee pistol-whip, charge shot for burst, roll as defensive verb.
- The gun-jump IS the pogo (Downwell/Cave Story logic, not HK nail-pogo).
- **Boss-design lesson:** players complain bosses have "little to no wind-up time." Rebuild keeps gun-jump choreography but adds **readable wind-ups**.
- Early trash mobs die in 1–3 shots; contact damage ~1 pip.

## 5. Enemies (early game)
- First-area enemies "basic, easy" — patrol-and-contact-damage fodder. **Mecha crabs** = marquee mid-game type. **Bull-like charging creature** = first boss/miniboss (unconfirmed name). Bosses confirmed: **Webulix** (spider), **Bonsai Beetle**, Final Boss.
- Anchor roster for area 1 (HK Crossroads mold): a walker (aphid/weevil), a slow flyer (gnat), a lobbed-projectile plant/mushroom — each 1–3 shots, generous telegraphs.

## 6. World structure
- Interconnected metroidvania, diverse biomes; the land is **Underland**; goal = the **Hive**. First area = green/garden-toned surface zone (from trailer imagery). Map with custom player markers. Standard ability-gating (crawl tunnels, wall-jump shafts, jump-height gates).

## 7. First ~15 minutes (from demo coverage)
1. Intro: Poe loses wings, stranded with a pistol; humor lands immediately.
2. Starting-zone platforming: rooms with "layers and suspended platforms just out of reach for a single jump" — **the level geometry teaches the gun-jump**; no formal tutorial (a complaint — rebuild should add light prompts).
3. Simple enemies throughout; demo climax: one tough boss with a standout theme.
4. Demo ≈ 35 min of content; speedrun 6:37.
5. Complaints to FIX in rebuild: opening difficulty spikes, left/right shoot-jump asymmetry, no coyote/buffer polish.

## 8. Feel consensus (no hard numbers exist publicly)
- "Fast-paced," "movement feels so nice and fluid, the gun mechanic really brings it all together."
- Raw jump ~2–3 tiles (Cave Story anchor); gun-jump lift smaller than jump but chainable (Downwell anchor).
- Feel target: "fluid but slightly loose indie" — but rebuild adds Celeste forgiveness (coyote, buffer, corner correction), because their absence was the original's top feel complaint.

## 9. UI / HUD
- Controls (verified): gamepad A jump / B roll / X shoot; keyboard was J shoot / K dodge, disliked → rebuild with sane defaults (Z/X/C or WASD+JKL) and document them on screen.
- HUD unverified. Anchor: top-left discrete health pips + ticket counter with ticket icon; Downwell-style ammo pips under health; minimal retro pixel font. Inventory screen and pause map exist in original.

## 10. Verification ledger
| Claim | Status |
|---|---|
| Steam game by Goodgis/Firith, Godot, 2026-07-21 | Verified |
| Poe = wingless bee returning to Hive; Underland | Verified |
| Gun-jump = downward recoil lift, ammo/traversal tradeoff | Verified (mechanism); shots-per-airtime unverified → Downwell anchor |
| Roll, crawl, dash, wall jump, charge shot, pistol-whip | Verified as existing |
| Tickets + vending machines + hats | Verified (press kit) |
| Webulix, Bonsai Beetle, Spore Shroom | Names verified, roles partial |
| Health display, save form, HP/damage numbers | Unverifiable — anchors supplied |

