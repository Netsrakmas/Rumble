# Level Design Review — principles dossier (agent research, 2026-08-05)

## PRINCIPLES CHECKLIST (audit criteria)
Onboarding: 1) playable <10s; 2) first room threat-free, movement exercised before any hazard; 3) every core verb forced by geometry in first 3 rooms; 4) zero load-bearing tutorial text; 5) a distinctive moment inside minute one.
Teaching: 6) safe intro for every new element; 7) kishotenketsu per idea (intro→develop→twist across 3-5 beats); 8) one new variable per room; 9) misconceptions corrected by geometry; 10) legibility — "the hard part is jumping the pit, not seeing the edge".
Pacing: 11) max 2-3 tense rooms before a breather; 12) checkpoint spacing <=30-60s of lost progress; 13) challenge chunks 5-15s of execution; 14) sawtooth difficulty (each new idea resets near zero then climbs past previous peak); 15) mastery lanes (2-3 skip/shortcut opportunities for skilled play).
Exploration: 16) optional rewards visible-but-costly, ~1 per 2-3 rooms, first within 3 rooms; 17) secrets have 2 tells across 2 channels, first secret discovered by accident (HK geo-rock rule), 2-4 secret spots per level; 18) at least one visible-but-unreachable tease of future abilities; 19) every branch pays off — no empty dead ends, no unpaid backtracking; 20) every room has a memorable silhouette; 2-3 nameable landmark rooms per level.
Climax: 21) final stretch = recombination exam, nothing new; 22) calm beat + readable threshold directly before boss, zero boss-death commute; 23) boss tests the level's curriculum with the level's visual language; 24) end at the peak, CTA within ~30s of the kill; 25) mandatory runtime 10-15 min (median new player) + 5 min of optional secrets.

## Numbers
Rooms per new idea 3-5 · challenge 5-10s between safe ground · Celeste checkpoints every screen; SK ~3/level · collectibles ~1 per 2 screens, first at screen ~2 · HK 3 benches/area, 1 hidden · 3-5 secret walls, first next to a bait object · hook by minute 1-5 · max 2-3 hard rooms consecutively.

## The 5 amateur failures
1. Flat corridors that teach nothing. 2. Text teaching instead of geometry. 3. Difficulty spikes + checkpoint commutes. 4. No setpiece/memorable moment. 5. Branches/backtracking without payoff.

(Full citations in the agent transcript; anchors: GMTK kishotenketsu + Boss Keys, Thorson GDC 2017, HK Crossroads wiki/guides, Yacht Club level-design deep dives, Next Fest demo guides.)

---

# Iteration 1 — critic verdict (agent review, 2026-08-07)

**Overall: 3.5/10.** Headline finding: ZERO gun-jumps were mandatory to finish
the level — the signature verb was never forced. Room scores: Descent 3,
Terraces 4, Cellar 4, Atrium 4, Ascent 2 (bare 3-wide tube), Grotto 2
(reward room with no test), BossHollow 5 (flat box), mineEntry 3.
Defects: boots price drift (10 vs spec 12), gnat spawned inside solid rock
(ascent 20,19), roll/charge/melee never demanded, declining enemy density,
possible pre-boots wall charge-refresh exploit (audited: does NOT exist —
refresh is gated on wallSliding which requires Burr Boots; now pinned by a
harness test).

## Redesign response (all 12 directives implemented)
1. Terraces: door B moved onto a 7-row ledge over a thorn trench; mandatory
   tier ladder — 1-chain onto the tier, 2-chain onto the ledge.
2. Descent: 2-tall root step forces the first jump; after the gun pedestal a
   3-tall wall forces the FIRST gun-jump before door A (4-tall proved
   human-hostile: a 1-chain clears it by only 9px — bot + reach-math audit).
3. Descent rebuilt as three descending plateaus (diagonal ravine silhouette).
4. Cellar: 2-tall × 8-long roll corridor with a weevil inside (jump
   geometrically impossible) replaces tunnel 2; tunnel 1 shortened to 4;
   skilled top-route over the corridor roof (1 gun-jump) with ticket pay.
5. Door C (grotto) telegraphed by a ticket trail arcing up-left.
6. Boots restored to 12 (spec); economy rebalanced — 30 placed pre-boss,
   honest forward yield ~15 (bot measures 15-16 at the vending machine).
7. Atrium shaft phrased: oneway rest mid-climb, thorned ticket bite recessed
   in the right wall, gnat in the upper gallery; exploit test added.
8. Ascent chimney = triptych: bare warm-up, thorn-bitten middle (dare ticket
   above the spike), zigzag inset pinch up top; two oneway rests. (Left-wall
   thorn bite cut after testing: it overlapped the rest platform's landing.)
9. Checkpoint added at ascent base; heal moved to the summit (pre-boss
   breather beat).
10. Boss arena: center thorn strip (spacing footsie), asymmetric perches —
    low one inside hop range, high one safe but needs a 2-chain; in-arena
    heal removed.
11. Grotto: thorn bed + stepping islands + a 7-tile gap only a mid-air chain
    crosses; arc tickets trace the line.
12. mineEntry: sealed doorway-shaped alcove (1×2 notch, ticket inside) in a
    rock mass above the exit — reachable flex, full-game tease.

Verification: 44/44 harness (new exploit-guard test) + full bot playthrough
3× consecutive PASS (deaths=0, ~60-70s, chains performed with human inputs:
jump HELD through chain — releasing early cuts lifts via releaseGravMult).
