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

---

# Iteration 2 — fresh-eyes verdict (2026-08-07) and response

**Overall: 6.5/10** (blind re-review, up from 3.5). Reachability audit clean;
front-half teaching praised (Descent 7, Terraces 7.5); headline gap: the
signature verb went silent after the boots purchase — Ascent (5) climbable by
wall-jump alone, and the level's back half demanded zero gun-jumps.

## Response (directives 1-9, all implemented)
1. Summit checkpoint added in Ascent at (22,5) — kills the boss-death commute.
2. Ascent recombination exam: the chimney's middle six rows now open into the
   **bloom chamber** — an 11-wide bulge where both walls fall away. Pure
   wall-jumping tops out 11px below the full-width oneway shelf at r10
   (verified empirically: stuck at feet 162-165 vs plane 160, two trials);
   wall-jump + one chained down-shot lands the shelf and exits in ~3s. The
   climb is now the wall-jump + gun-jump combination PROMPT.md promised.
   (Two intermediate shapes were tested and rejected: a 4-6 wide chimney —
   pure wall-jumps still climb any gap ≤ ~10 tiles; and a floating pod —
   its side faces are themselves wall-jumpable.) Summit spitter moved to
   (12,5) overlooking the chimney mouth.
3. Cellar checkpoint added at (38,9), after the roll corridor — a Grotto
   death no longer replays the Terraces exam plus the whole Cellar.
4. Boss thorn strip widened 4 → 5 tiles (cols 16-20): roll i-frames
   (~3.5 tiles) can no longer cheese it; crossing is a committed jump or a
   chain — the signature verb enters the boss fight. (6 would have collided
   with the 9-tile wake radius from the left approach.)
5. Descent mastery tease: ledge at (31-32, r10-11) with ticket — a rise-7
   3-chain, the level's only one, visible from the gun pedestal; doubles as
   a mastery skip lane over the door wall (checklist 15).
6. Second weevil at (26,9) inside the roll corridor — sniping both from
   outside is slow; rolling is the elegant answer.
7. Terraces gnat moved (28,9) → (36,8): out of checkpoint aggro, now
   pressures the tier exam instead.
8. Pre-boots Atrium door-B peek: ACCEPTED as a mastery peek (the Ascent
   base rest is rise 9, unclimbable bootless; the sign explains the gate).
9. Stale "4-tall" comment fixed to 3-tall.
Engine fix from the reviewer's open question: weevils now treat thorns ahead
as a turn condition (they patrol between hazard strips instead of strolling
across them).

Verification: 44/44 harness (14a now proves the chimney NEEDS chained shots)
+ 3x consecutive playthrough PASS (deaths=0, ~57-59s).
