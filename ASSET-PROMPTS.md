# ASSET-PROMPTS.md — AI image-generation prompts for RUMBLE's art

Ready-to-paste prompts for ChatGPT (GPT-4o image generation) or similar tools.
Every prompt bakes in the locked style bible from PROMPT.md — do not freestyle
the palette or the mood, consistency is the whole game.

## Read this first: the realistic workflow

Image models **cannot** output a finished sprite sheet (exact 16 px grids,
precise frame rects, true transparency). What they're great at is design:
generate BIG, then shrink and clean. The loop:

1. **Generate large** (one character or one tile, 1024×1024) with a prompt below.
2. **Get ONE sprite approved before generating everything** — redoing a style
   after a full set is the classic way art time gets wasted. Start with Rumble's
   idle pose, decide you love it, then do the rest in the same chat so the
   model keeps the character consistent ("same character, now running").
3. **Downscale + clean** in [Aseprite](https://www.aseprite.org/) (paid) or
   [Photopea](https://photopea.com) (free, browser): scale to the target cell
   size with "nearest neighbor", clamp stray colors to the palette, erase the
   background to true transparency, snap the feet to the cell's bottom edge.
4. **Paint onto the templates.** Open `tools/export-sheets.html` in a browser,
   download the sheet you're replacing — it has every frame in place with a
   toggleable frame grid. Paste your cleaned sprite into the right cells.
5. **Save as `src/assets/art/<sheet>.png`** at the exact original dimensions.
   Reload the game — done, zero code changes. Run `node test/run-tests.mjs`
   to prove nothing broke (it checks sheet geometry and empty frames).

Tip: in ChatGPT, ask for "displayed at large scale with crisp square pixels"
— you want *chunky fake-pixel* output you can faithfully shrink, and a plain
solid background you can delete easily.

---

## Workflow A (RECOMMENDED START): world concept first, then extract

Generate ONE image that contains the whole world — it locks style, lighting
and palette for every asset simultaneously, and every later element is derived
from it in the same chat, which is how you keep everything consistent.
Don't literally crop sprites out of the big image (overlaps, off-grid, mixed
angles) — instead ask ChatGPT to RE-RENDER each element isolated, referencing
the approved concept.

**A1. The master concept — a fake game screenshot** (forces game-correct
side-view, terrain, parallax; this is the image you approve or re-roll):

> [style header from below]
> A complete SCREENSHOT MOCKUP of this 2D pixel-art metroidvania, 16:9,
> side-view platformer perspective, as if captured mid-game. Scene: "The
> Fallen Garden" at dew-dawn. Show, clearly separated and all in the same
> style: RUMBLE the hero (small round bumblebee, huge cute head, big white
> eyes, tiny wing stubs, warm-orange scarf, holding a leaf-green pea-pod
> pistol) standing on leafy terrain tiles with a bright grass lip; a round
> rose-pink weevil enemy with a long snout patrolling; a tiny rose-pink gnat
> with glowing mint wings hovering; a grumpy rose-pink mushroom turret on a
> stem; a patch of tall hazard-red bramble spikes; a big glossy dewdrop
> checkpoint on a leaf pedestal; a cute overgrown vending machine with a
> glowing window; a dark mossy garden door; small pale-mint arcade tickets
> floating as pickups; hanging vines and bell flowers; dawn-indigo sky with
> silhouetted giant plants in the background parallax layers, drifting mist;
> health drops and a ticket counter as UI in the corners. Everything chunky,
> outlined, readable — no element overlapping another.

Re-roll until you LOVE this one image. It becomes the project's visual law.

**A2. The asset-sheet companion** (same chat, right after approval):

> Using exactly the style, palette and character designs of the screenshot
> above, draw an ASSET SHEET: the same elements laid out separately in neat
> rows on a plain solid gray background, each isolated with space around it —
> hero (front-facing idle and running side view), weevil, gnat, mushroom
> turret, boss (a bull-sized rose-pink rhinoceros beetle with a huge pale
> horn), checkpoint dewdrop, vending machine, door, pedestal + pea-pod
> pistol, ticket, acorn-cap hat, sign, thorn patch, one terrain tile shown
> repeated 3x3, vine, bell flower, grass tuft, rock, dewdrop.

**A3. The extraction loop** (one element at a time, same chat):

> From the asset sheet above, re-draw ONLY the [ELEMENT] as a single isolated
> pixel-art game sprite, [W]x[H] pixels displayed at large scale with crisp
> square pixels, same design, same palette, facing [right/left], feet on the
> bottom edge, plain gray background, no anti-aliasing, nothing else in frame.

Target sizes for A3 (from the manifest): hero 24×24 · tiles 16×16 ·
checkpoint 16×24 · vending 24×32 · door 16×32 · ticket 8×8 · weevil/gnat
16×16 · spitter 16×24 · boss 48×32 (facing LEFT).

Then continue at step 3 of the pipeline below (downscale → template → save).
Keep the whole thing in ONE chat session — that's what keeps ChatGPT's
designs consistent between the concept and every extraction.

Bonus: the approved A1 concept is also the perfect style-reference image to
upload to Retro Diffusion or any other tool later — the concept, not the
tool, becomes the source of truth.

---

## The style header — paste this at the top of EVERY prompt

> Pixel art for a whimsical neo-retro metroidvania game, in the spirit of
> Dewdrop Dynasty by Goodgis: cute, chunky, family-friendly, big readable
> shapes, thick dark outlines, no anti-aliasing, crisp square pixels.
> Setting: a lush overgrown garden at dew-dawn.
> STRICT PALETTE — use only these hex colors:
> background/dark plum #2e222f, indigo #323353, dawn indigo #484a77,
> teal green #374e4a, leaf dark #165a4c, leaf mid #239063,
> leaf light #91db69, highlight lime #cddf6c, dew teal #30e1b9,
> dew glow #8ff8e2, bee yellow #f9c22b, warm orange #f57d4a,
> outline plum #45293f, rose pink #cf657f, hazard red #e83b3b,
> pale mint #c7dcd0.
> Rules: bee yellow ONLY for the hero; hazard red ONLY for dangers;
> 1px dark plum outline around every sprite; plain solid gray background
> (#808080) behind the sprite for easy removal; no gradients, no blur,
> no text, no watermark.

---

## 1. Rumble — the hero (DO THIS ONE FIRST, get it approved)

Target: `player.png` — 24×24 cells, feet on the cell's bottom edge.

**1a. Idle (the sign-off sprite):**
> [style header]
> A single 24×24 pixel-art game sprite displayed at large scale: RUMBLE, a
> small round bumblebee warrior who lost their wings (tiny wing stubs on the
> back). Huge cute head (over half the body), two big white eyes with dark
> pupils, tiny blush pixel, two thin antennae, chubby striped bee-yellow body
> with dark plum stripes, a little warm-orange scarf that trails to one side,
> stubby legs. Holding a small leaf-green pea-pod pistol ("the Pea-Popper")
> with a warm-orange muzzle at their right side. Facing right, standing
> relaxed. Feet flat on the bottom edge of the sprite.

**1b. The rest of the set (same chat, after approval):**
> Same character, same palette, same size and style, facing right, feet on
> the bottom edge. Draw [ONE PER REQUEST]:
> - run pose, mid-stride, scarf trailing behind, slight forward lean
> - jump rising pose, legs tucked, scarf up
> - fall pose, arms out, scarf up above the head
> - wall-slide pose, pressed against a wall on the right, dust at fingertips
> - crawl pose, flat and low, body horizontal, one eye visible
> - roll pose, curled into a striped ball
> - hurt pose, squinting X eyes, knocked back
> - melee swing pose, whipping the pistol forward in an arc
> - gun-jump pose, aiming the pistol straight DOWN mid-air, muzzle flash below,
>   recoil pushing the body up
>
> Needed frame counts (paint variations in Aseprite rather than regenerating):
> idle×4 (blink + 1px bob), run×6, rise/apex/fall×1, wall×1, crawl×2, roll×4,
> hurt×1, melee×2, gunjump×2.

## 2. Terrain tiles

Target: `tiles.png` — 16×16 tiles. The 16 autotile edge cases are easiest to
paint directly on the template; generate the *texture idea* first:

> [style header]
> A seamless 16×16 pixel-art terrain tile displayed at large scale, for the
> floor of an overgrown garden: dense packed leafy soil in leaf mid green
> #239063 with leaf dark #165a4c shadows and tiny speckles. On the top edge, a
> bright grass lip: 2–3 pixels of leaf light #91db69 with single sparkle
> pixels of highlight lime #cddf6c, like dew catching dawn light. Show the
> tile alone AND repeated in a 3×3 grid to prove it tiles seamlessly.

**Decorations (one request each, 16×16, on gray):**
> - a hanging vine segment, 2px wide stem with tiny leaf pairs, leaf mid/dark
> - a drooping bell flower in warm orange with a lime highlight, thin stem
> - a tuft of 5 thin grass blades, mixed leaf light and leaf mid
> - a small smooth rock in teal green #374e4a with a pale top edge
> - a single glossy dewdrop in dew teal #30e1b9 with a white specular pixel
>   and a soft dew-glow #8ff8e2 rim
> - a one-way leaf platform: a flat broad leaf seen side-on, bright #91db69
>   top edge, darker underside
> - DANGER thorns: a row of tall bramble spikes in hazard red #e83b3b with
>   warm-orange tips and a white glint, on a dark plum bramble base — must
>   read instantly as "do not touch"

## 3. Props

Target: `props.png`. One request each, feet/base on the bottom edge:

> - CHECKPOINT (16×24): a big glossy dewdrop resting on a leaf pedestal,
>   dew teal body, white specular, dew-glow halo, tiny leaf-mid base — the
>   most magical-looking object in the game
> - VENDING MACHINE (24×32): "the Dew-Drop Dispenser", a cute weathered
>   vending machine overgrown at the corners, indigo body, glowing display
>   window with tiny prizes inside, a ticket slot, a dew-teal side lamp
> - DOOR (16×32): a dark garden archway framed in leaf-dark wood with mossy
>   lintel and a few leaf-light moss pixels, opening into plum darkness
> - PEDESTAL + PEA-POPPER (16×16 each): a small stone pedestal; and the
>   Pea-Popper pistol — a leaf-green pea-pod body, warm-orange muzzle,
>   lime glint, tiny grip
> - TICKET (8×8): a pale mint arcade ticket with a perforation line and a
>   warm-orange stamp
> - ACORN CAP hat (12×8): a jaunty brown acorn beret with stem
> - SIGN (16×16): a small wooden garden signpost with scratched lines
> - SPORE SHROOM trophy (16×16): a cute rose-pink mushroom with pale spots

## 4. Enemies

Target: `enemies.png`. Enemy bodies are rose pink #cf657f — never yellow, never red.

> - WEEVIL (16×16): a round chubby garden weevil, rose-pink shell, long cute
>   snout, big white eye, six stubby legs, thick outline. Two walk poses
>   (legs alternating).
> - GNAT (16×16): a tiny round rose-pink gnat with big white eye and two
>   dew-glow #8ff8e2 wings; two poses, wings up and wings down.
> - SPORESPITTER (16×24): a grumpy rose-pink mushroom turret on a leaf-dark
>   stem: idle, puffed-up windup (cheeks inflated), and spitting pose with a
>   spore puff above.
> - PROJECTILES: a 6×6 bright pea (leaf light + lime glint); a 10×10 charged
>   pea (bigger, white-hot core); an 8×8 rose spore ball with pale spots.

## 5. The boss — Bullhorn Beetle

Target: `boss.png` — 48×32 cells, facing LEFT, feet on the bottom edge.

> [style header]
> A 48×32 pixel-art boss sprite displayed at large scale: the BULLHORN
> BEETLE, a bull-sized rhinoceros beetle in rose pink #cf657f with darker
> plate seams, a huge pale curved horn like a bull, one big angry white eye,
> four sturdy legs, a pale sheen along the shell top. Chunky, more silly-mad
> than scary — a cartoon bull that happens to be a beetle. Facing LEFT.
> Poses (one per request, same character): standing idle; pawing the ground
> with dust, head lowered (charge windup); mid-charge, body leaning hard
> forward; dizzy-stunned with sparkles around the head; crouched pre-hop.

---

## Order of work & budget honestly

1. Rumble idle → **stop, approve the look** (this decides everything else)
2. Rest of Rumble's poses (same chat for consistency)
3. Terrain tile + thorns (the two most-seen images in the game)
4. Enemies → props → boss
5. After each sheet lands in `src/assets/art/`: reload, squint at it in play,
   run `node test/run-tests.mjs`.

Expect to reject a good share of generations — character consistency across
poses is where image models struggle most. When a pose fights you, it is
often faster to hand-edit the approved idle sprite in Aseprite (move the
limbs, redraw the scarf) than to re-roll the generator. Squash-and-stretch,
blinks and bobs are already done in engine code — you only need the key poses,
never in-between frames.

Alternatives if ChatGPT frustrates: [PixelLab](https://www.pixellab.ai/) and
Retro Diffusion are purpose-built for game pixel art and respect grids/palettes
far better; or skip generation and paint directly over the placeholder
templates — they already have correct silhouettes and readable poses.
