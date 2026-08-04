# Rumble — Dewdrop Dynasty-style metroidvania, Level 1

**Phase:** 4 — test: DONE (ready for 5 — ship, on request)
**Stack:** plain Canvas 2D, vanilla ES modules, zero deps, zero build step, 320×180 internal res
**Repo:** github.com/Netsrakmas/Rumble
**Live:** not deployed
**Updated:** 2026-08-04

## One-liner
A finished, polished Level 1 of a 2D pixel-art metroidvania with the mechanics of Dewdrop Dynasty (small insect hero, tight platforming, dash/wall/combat abilities), built with fully separated swappable assets and a data-driven level format so more levels can be added later.

## Phase log
- 0 idee — skipped: user explicitly decided to build ("create a finished level 1"). Verdict recorded: build.
- 1 plan — done. See PROMPT.md (master spec, 6 milestones) + RESEARCH.md (3 addenda: style, architecture, mechanics). Key finding: Dewdrop Dynasty is Goodgis's Steam metroidvania (not Roblox); signature mechanic = downward-shot recoil "gun-jump" (Downwell anchor).
- 2 build — done. All 6 milestones in PROMPT.md ticked. Full verb set (run/jump/gun-jump/charge/melee/roll/crawl/wall-jump), systems (hp/checkpoints/tickets/shop/gates), Level 1 (6 rooms) + boss + Level 2 stub, juice pass (shake/hit-stop/particles/parallax/squash/WebAudio SFX).
- 3 art — placeholder-quality done: 5 PNG sheets committed in src/assets/art/ (generated from placeholders.js via tools/export-art.mjs), fully swappable via manifest indirection. A hand-painted pass (art skill / ComfyUI+Aseprite) remains open as a future upgrade.
- 4 test — done. Playwright harness test/run-tests.mjs: 35/35, four consecutive green runs. Covers boot, feel (coyote/buffer/variable jump), gun-jump economy, doors (incl. re-trigger regression), damage/death/respawn, shop, wall verbs, roll/crawl, boss flow, level exit, loader validation, asset contract, perf (60 fps, worst frame 16.8 ms), console cleanliness. Not covered: audio output correctness (WebAudio not assertable headless), long-session soak.
- 5 ship — not started (deploy to GitHub Pages on request via ship skill)

## Open questions
- (none — spec locked)

## Decisions locked
- User requirements: (1) finished Level 1 with all Dewdrop Dynasty mechanics, (2) assets fully separated from game code so they can be adapted/replaced afterwards, (3) level system must support creating more levels afterwards.
- Game identity: "Rumble" — original homage (hero Rumble the wingless bumblebee, Pea-Popper gun-jump), not an asset copy of Dewdrop Dynasty.
- Stack: plain Canvas 2D, zero deps/build; ASCII level maps; asset manifest + procedural placeholder fallback + drop-in `assets/art/*.png` re-skin path.
- Style bible: "Dew-Dawn Garden 16" palette (Resurrect-64 subset) — see PROMPT.md; do not re-litigate mid-build.
- Physics/juice constants LOCKED in PROMPT.md / src/constants.js.
- Work happens on branch `claude/dewdrop-dynasty-level-1-8pobp4`, pushed there when complete.
