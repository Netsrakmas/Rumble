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
