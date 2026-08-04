# Drop-in art folder

The game runs with **procedurally generated placeholder sprites** — no PNGs
needed. To re-skin it, drop PNG files into this folder with these exact names
and canvas sizes (from `src/assets/manifest.js`):

| File | Size | Contents |
|---|---|---|
| `player.png` | 240×72 | Rumble: idle×4, run×6 (row 1) · rise, apex, fall, wall, crawl×2, roll×4 (row 2) · hurt, melee×2, gunjump×2 (row 3). 24×24 cells, feet on y=23 of each cell, centered on x=12. |
| `tiles.png` | 256×32 | Row 1: the 16 autotile cases (bitmask N=1 E=2 S=4 W=8 of *present* neighbors, left to right 0–15). Row 2: 2 full-tile variants, oneway platform, thorns, vineTop, vineMid, vineEnd, flower, tuft, rock, dewdrop — all 16×16. |
| `props.png` | 160×64 | checkpoint×4 (16×24), vending (24×32 @64,0), door (16×32 @88,0), pedestal (16×16 @104,0), gun (16×16 @120,0), ticket (8×8 @136,0), hat (12×8 @136,8), sign (16×16 @0,32), trophy (16×16 @16,32). |
| `enemies.png` | 160×24 | spitter idle×2/windup/spit (16×24), weevil×2 (16×16 @64,8), gnat×2 (16×16 @96,8), pellet (6×6 @128,0), charge (10×10 @136,0), spore (8×8 @148,0). |
| `boss.png` | 384×32 | Bullhorn Beetle 48×32 cells: idle×2, scrape×2, charge×2, stun, hop. Faces LEFT. |

**Workflow:** open `tools/export-sheets.html` in a browser and download every
current placeholder sheet as a PNG template at exact geometry — paint over it
in Aseprite (or anything), save it here, reload the game. **Zero code changes.**

Rules that keep art working:
- Keep frame positions/sizes exactly as in the manifest (or update the
  manifest — it is the single source of truth; game code never hardcodes geometry).
- Character pivot = feet center of the cell; art should stand on the cell's
  bottom edge.
- Transparent background. The engine flips sprites horizontally at runtime —
  draw everything facing RIGHT (boss: facing LEFT).
- Palette: see the locked style bible in PROMPT.md ("Dew-Dawn Garden 16").
