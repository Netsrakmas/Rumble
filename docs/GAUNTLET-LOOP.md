# Gauntlet Loop — this project's quality protocol

Adopted 2026-08-10 from the **gauntlet-loop** technique (Matt Shumer's
prompt/idea, packaged and popularized by Jay E / RoboNuggets:
https://github.com/robonuggets/gauntlet-loop). It replaces score-based
review loops with blind head-to-head comparison against a real reference.

## The protocol

1. **Set the bar.** The bar must be:
   - **Named** — a specific thing, not a category ("Space Huggers", not
     "award-winning platformers").
   - **Fetchable** — the critic can screenshot it, read it, run it, or open
     it. Not a description of it — the real thing.
   - **Comparable** — both can sit side by side and a judge picks one.
   "The bar is the whole trick. Everything else is scaffolding."
2. **Decompose** into the smallest pieces that can be improved and judged
   on their own.
3. **Builder + critic pairs** per piece. The critic has FRESH context and
   never built the thing (the builder judging its own work is the #1
   failure mode).
4. **Blind A/B.** The critic sees both artifacts with labels stripped and
   answers exactly two things: which one is better (binary — no scores,
   no rubric, praise is not useful), and the single biggest remaining gap
   in the loser.
5. **Loop.** Builder closes THE named gap (only that), verification stays
   green, re-screenshot, NEW critic. Exit **only** when ours wins the
   blind pick, or when the run is explicitly stopped. Never after a fixed
   number of rounds.
6. **Live progress page** while the loop runs.

## Failure modes to guard against
vague bar → critic invents comparisons · builder self-judging · soft
critic (demand the binary pick) · fixed round counts · over-specification
(each extra rule removes agent autonomy).

## This repo's instantiation

- **Bar (chosen):** *Space Huggers* by KilledByAPixel (Frank Force) —
  js13kGames 2021 run-and-gun pixel platformer, later expanded into a
  Steam release. Chosen because it is the strongest reference that is
  genuinely fetchable from this sandbox: the egress proxy blocks Steam,
  itch, and press-kit domains (Dewdrop Dynasty's own Steam screenshots —
  the ideal bar — are unreachable), but GitHub is allowed, and Space
  Huggers is a self-contained HTML5 build that clones and runs in the
  exact same local Playwright screenshot pipeline as Rumble. Same genre,
  same medium, same capture conditions — the cleanest possible A/B.
  Runner-up bars: Shattered Pixel Dungeon's in-repo store screenshots
  (wrong genre), Celeste Classic ports (need PICO-8 runtime).
- **Pieces:** (1) title screen, (2) mid-gameplay scene. Judged as raw
  960×540 screenshots, labels stripped (`scene-A.png` / `scene-B.png`,
  sides swapped between rounds).
- **Critic prompt (fresh agent each round):** "Two screenshots from two
  different 2D pixel platformers. Which reads as the more finished,
  shippable commercial game? Answer A or B. Then name the single biggest
  gap in the loser. Be harsh; praise is not useful."
- **Builder rule:** close only the named gap, in `src/assets/
  placeholders.js` / render code; `node test/run-tests.mjs` must stay
  44/44 (art regressions fail the empty-frame and geometry assertions).
- **Run log:** appended below per round.

## Run log

(rounds appended here as they complete)
### Run 1 — 2026-08-10 — bar: Space Huggers (KilledByAPixel) — EXITED: OURS WON

Setup: bar cloned from github.com/KilledByAPixel/SpaceHuggers and run in the
same local Playwright pipeline as Rumble; both games screenshotted at
960×540 (title + mid-gameplay); labels stripped (`scene-A/B.png`).

- **Round 1** (title: A=bar B=ours; gameplay: A=ours B=bar):
  ours picked on BOTH pieces, margin "decisive" both times.
- **Confirmation round** (fresh critics, sides swapped):
  ours picked on both pieces again, "decisive". 4/4 blind picks.
  Judges credited: custom pixel wordmark + hierarchy, disciplined
  palette, layered silhouette depth, icon-based HUD, readable
  ground/platform/hazard separation. The bar lost chiefly on its js13k
  constraints (system serif type, clipped wordmark, visible engine debug
  readout).

Exit per protocol: the loop ends when ours wins the blind pick. It did.

Residual gaps the judges named in OUR screenshots while picking them
(seed list for a future run against a harder bar):
1. Gameplay mid-band composition is sparse / dead space in big rooms.
2. Player lacks a ground contact shadow.
3. Enemy readability minimal at a glance.
4. Title control-hint block wordy and low-contrast; corner demo tag
   cheapens the frame.

Honest note on the bar: Space Huggers' terrain/atmosphere were
competitive; its UI typography (a 13KB size-limit casualty) decided the
match. The ideal harder bar — Dewdrop Dynasty's own Steam screenshots —
is not fetchable from this sandbox (egress proxy blocks Steam/itch/press
domains; GitHub only). If the proxy policy ever widens, re-run against
that bar.
