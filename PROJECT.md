# Rumble — Dewdrop Dynasty-style metroidvania, Level 1

**Phase:** 5 — ship: LIVE
**Stack:** plain Canvas 2D, vanilla ES modules, zero deps, zero build step, 320×180 internal res
**Repo:** github.com/Netsrakmas/Rumble
**Live:** https://netsrakmas.github.io/Rumble/
**Updated:** 2026-08-04

## Demo-readiness log (2026-08-05, Steam showcase target)
- Completability PROVEN: test/playthrough.mjs bot beats the demo start→end with only human inputs (run/jump/crawl/gun-jump/shop/wall-jump); found+fixed: 3-tall intro block, natural-route ticket famine (floor-line tickets added, boots 12→10), atrium shaft's 1-tile exit gap (ledge now meets the shaft lip).
- Music: 4 chiptune themes (title/garden/boss/mines) via WebAudio step sequencer, switching on level/boss events.
- Pause menu: resume, music/SFX volume, screen-shake toggle (persisted), restart-at-checkpoint, quit-to-title.
- Demo-complete screen: time/tickets/deaths stats + wishlist CTA behind a door in Level 2.
- Dew heal pickups ('+' tile char, respawn per room entry); boss hop buffed to threaten perch cheese.
- Verified: harness 43/43 ×2 + full playthrough ×2 green.

## One-liner
A finished, polished Level 1 of a 2D pixel-art metroidvania with the mechanics of Dewdrop Dynasty (small insect hero, tight platforming, dash/wall/combat abilities), built with fully separated swappable assets and a data-driven level format so more levels can be added later.

## Phase log
- 0 idee — skipped: user explicitly decided to build ("create a finished level 1"). Verdict recorded: build.
- 1 plan — done. See PROMPT.md (master spec, 6 milestones) + RESEARCH.md (3 addenda: style, architecture, mechanics). Key finding: Dewdrop Dynasty is Goodgis's Steam metroidvania (not Roblox); signature mechanic = downward-shot recoil "gun-jump" (Downwell anchor).
- 2 build — done. All 6 milestones in PROMPT.md ticked. Full verb set (run/jump/gun-jump/charge/melee/roll/crawl/wall-jump), systems (hp/checkpoints/tickets/shop/gates), Level 1 (6 rooms) + boss + Level 2 stub, juice pass (shake/hit-stop/particles/parallax/squash/WebAudio SFX).
- 3 art — v2 hand-authored programmatic pass done (2026-08-05): rounded silhouettes, shading, expressive faces on player/enemies/boss, leaf-textured tiles; fixed boss horn drawing outside its sprite cell (now clipped per frame). 5 PNG sheets committed, regenerable via tools/export-art.mjs, swappable via manifest. AI-assisted or hand-painted art can still land via ASSET-PROMPTS.md workflows (RESEARCH.md addendum 4 has the tool verdicts).
- 4 test — done. Playwright harness test/run-tests.mjs: 35/35, four consecutive green runs. Covers boot, feel (coyote/buffer/variable jump), gun-jump economy, doors (incl. re-trigger regression), damage/death/respawn, shop, wall verbs, roll/crawl, boss flow, level exit, loader validation, asset contract, perf (60 fps, worst frame 16.8 ms), console cleanliness. Not covered: audio output correctness (WebAudio not assertable headless), long-session soak.
- 5 ship — done 2026-08-04. Live at https://netsrakmas.github.io/Rumble/ (Pages branch mode serving gh-pages, auto-enabled by the gh-pages push after the Actions enablement path failed on token permissions). pages.yml force-syncs gh-pages from the dev branch on every push. Pre-flight passed: relative paths only, lowercase filenames, no secrets/APIs/dev leftovers, viewport+touch-action set. Verified: GitHub deployment status "success" with environment URL; sandbox egress policy blocks *.github.io so an in-browser load of the live URL was NOT possible from here — user should hard-reload the URL once as the final check. Input: keyboard + gamepad (Gamepad API, DD-style A jump/B roll/X shoot layout; stick + d-pad; tested via stubbed-pad harness assertions). No touch controls yet — on phones a Bluetooth controller is the way to play.

## Open questions
- (none — spec locked)

## Decisions locked
- User requirements: (1) finished Level 1 with all Dewdrop Dynasty mechanics, (2) assets fully separated from game code so they can be adapted/replaced afterwards, (3) level system must support creating more levels afterwards.
- Game identity: "Rumble" — original homage (hero Rumble the wingless bumblebee, Pea-Popper gun-jump), not an asset copy of Dewdrop Dynasty.
- Stack: plain Canvas 2D, zero deps/build; ASCII level maps; asset manifest + procedural placeholder fallback + drop-in `assets/art/*.png` re-skin path.
- Style bible: "Dew-Dawn Garden 16" palette (Resurrect-64 subset) — see PROMPT.md; do not re-litigate mid-build.
- Physics/juice constants LOCKED in PROMPT.md / src/constants.js.
- Work happens on branch `claude/dewdrop-dynasty-level-1-8pobp4`, pushed there when complete.
