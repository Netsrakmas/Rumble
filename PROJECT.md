# Rumble — Dewdrop Dynasty-style metroidvania, Level 1

**Phase:** 5 — ship: LIVE
**Stack:** plain Canvas 2D, vanilla ES modules, zero deps, zero build step, 320×180 internal res
**Repo:** github.com/Netsrakmas/Rumble
**Live:** https://netsrakmas.github.io/Rumble/
**Updated:** 2026-08-04

## Gap-closing loop vs successful 2D games (2026-08-05)
Iteration 1 (vs Celeste/HK/Shovel Knight demo bar): opening tumble cinematic (input-locked fall, feathers, landing thud — tests skip it via __test.start); ambient critters (butterflies bright rooms / pulsing fireflies dark rooms); room-name toasts on first visit (persisted); completion-aware demo-end stats (tickets X/Y, grotto found/missed/true-ending lines); footstep + wall-slide SFX; red screen-edge sting on damage; mushroom-silhouette parallax in dark rooms; god-ray on the gun pedestal. Verified harness 43/43 ×2 + playthrough ×2.
Next iteration candidates: painted/generated art skin (largest remaining gap), door open/walk-in animations, boss arena environmental detail, key rebinding, desktop wrapper for Steam.

## Polish pass log (2026-08-05, "one level, maximally polished" decision)
- Scope locked: single-level demo. Level 2 is a short epilogue corridor (enemy removed, local checkpoint added) into the demo-end screen.
- Title screen: shadowed floating logo, animated Rumble + wandering weevil on a grass stage, showcase tag, version.
- Feel/HUD: lost-pip flash, ticket-counter bounce, low-HP heartbeat vignette, run dust, checkpoint toast, boss name card.
- Atmosphere: per-room darkness (`dark` field in room data) — cellar/boss darker, per style bible region shifts.
- Secret: the Dew Grotto (hidden high door in cellar, gun-jump chain to reach; 6-ticket cache).
- Route hardening via the bot: shaft exit is now a pass-through oneway cap (trivial, satisfying), ascent door ledge flush with summit, summit harassers relocated, thorn ambush at ascent top removed, boots 10 with floor-line ticket economy (bot collects 14-15 naturally).
- Bot found a UI bug class too: its own key-mash skipped the demo-end screen via title-continue — input helpers now stop when the game leaves play state.
- Verified: playthrough bot 4/4 consecutive PASS, harness 43/43 ×2.

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

- 6 level-design loop (iter 1) — done 2026-08-07. User: "spin up agents to review, redesign, review... keep improving." Critic agent scored the old layout 3.5/10 (zero mandatory gun-jumps). Redesigned every room per its 12 directives (see docs/LEVEL-DESIGN-REVIEW.md): forced verb escalation descent→terraces (1-chain wall, tier, 2-chain door ledge over trench), cellar roll corridor + grotto ticket-trail telegraph, phrased atrium shaft + boots back to spec 12, ascent chimney triptych + base checkpoint, boss thorn strip + asymmetric perches, grotto chain-gap test, mines doorway tease. Bot gained a gunHop primitive (jump held through chains — releasing early cuts lifts via releaseGravMult). 44/44 harness + 3x playthrough PASS, deployed 8a9b0e3. Fresh reviewer scored the redesign 6.5/10 (blind) — iter 2 closed its directives: ascent bloom-chamber recombination exam (wall-jump + chained shot mandatory, empirically gated), summit + cellar checkpoints, wider boss thorn strip, descent 3-chain tease ledge, corridor second weevil, weevil thorn-turning engine fix. 44/44 + 3x playthrough PASS.

## Open questions
- (none — spec locked)

## Decisions locked
- User requirements: (1) finished Level 1 with all Dewdrop Dynasty mechanics, (2) assets fully separated from game code so they can be adapted/replaced afterwards, (3) level system must support creating more levels afterwards.
- Game identity: "Rumble" — original homage (hero Rumble the wingless bumblebee, Pea-Popper gun-jump), not an asset copy of Dewdrop Dynasty.
- Stack: plain Canvas 2D, zero deps/build; ASCII level maps; asset manifest + procedural placeholder fallback + drop-in `assets/art/*.png` re-skin path.
- Style bible: "Dew-Dawn Garden 16" palette (Resurrect-64 subset) — see PROMPT.md; do not re-litigate mid-build.
- Physics/juice constants LOCKED in PROMPT.md / src/constants.js.
- Work happens on branch `claude/dewdrop-dynasty-level-1-8pobp4`, pushed there when complete.
