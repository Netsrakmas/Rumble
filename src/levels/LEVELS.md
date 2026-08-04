# Level authoring guide

**Adding a level = one new data file here + one line in `index.js`. Nothing else.**
(That contract is an acceptance criterion — if you ever need to touch engine
code to add content, file a bug.)

## File shape

```js
export default {
  id: 'level3',                 // unique, used in door targets: 'level:level3'
  name: 'THE COMPOST HEAP',     // shown as the level toast
  start: { room: 'entry', x: 3, y: 8 },   // tile coords of first spawn
  rooms: [ { id, map, entities, legend? }, ... ],
};
```

## Maps

One string per tile row, all rows the same length (the loader throws with
row/col if not). One char = one 16 px tile:

| Char | Meaning |
|---|---|
| `#` | solid terrain (autotiled, grass lip added automatically) |
| `-` | one-way platform (jump through, stand on, down+jump to drop) |
| `^` | thorns (1 damage + bounce; hitbox is inset, feet-brushing is forgiven) |
| `.` | empty |
| `*` | ticket pickup (persists collected across deaths/saves) |
| `P` | decorative spawn marker (actual spawn = `start` / doors / checkpoints) |
| `A`–`H` | door markers — each needs a matching `door` entity |

Decorations (grass tufts, flowers, vines, rocks, dew) are generated
deterministically from the map shape — no need to place them.

## Entities

Coordinates are tile units. `y` is the tile the entity STANDS ON minus its
height, i.e. for something standing on a floor whose top surface is row R,
use `y: R-1`.

```js
{ type: 'door', char: 'A', to: 'otherRoom', toDoor: 'B' }        // room link
{ type: 'door', char: 'B', to: 'level:level2' }                   // level exit
{ type: 'door', char: 'C', to: 'x', toDoor: 'A',
  requires: 'burrBoots', denyText: 'LOCKED...' }                  // ability gate
{ type: 'checkpoint', x: 9, y: 19 }
{ type: 'gunPickup', x: 34, y: 11 }
{ type: 'vending', x: 19, y: 19, items: [
  { id: 'flag', name: 'NAME', desc: 'DESC', cost: 12, unlockText: '...' } ] }
{ type: 'sign', x: 5, y: 11, text: 'LINE1\nLINE2' }
{ type: 'weevil', x: 8, y: 12 }          // ground patroller, turns at edges
{ type: 'gnat', x: 12, y: 4, radius: 3 } // hovering chaser
{ type: 'spitter', x: 41, y: 8 }         // telegraphed arcing turret
{ type: 'boss', x: 22, y: 7 }            // Bullhorn Beetle; locks room doors
```

The loader validates everything at load and **throws loudly** (map
rectangularity, unknown chars, door pairs resolving in both directions).
Test a new level quickly with `window.__test.teleport('roomId', tx, ty)`
in the browser console, or point `start` at it temporarily.

## Design notes (from RESEARCH.md)

- The geometry is the tutorial: put ledges just beyond single-jump reach to
  teach gun-jumping; 1-tile passages teach crawl; wall shafts need Burr Boots.
- Jump ≈ 2.6 tiles. Each gun-jump adds ≈ 1.7 tiles, max 3 per airtime.
- Budget tickets so required purchases are affordable on the forward path
  (Level 1 places ~16 before the 12-ticket Burr Boots).
- Every room: 3–8 dew "jewels", a few vines/tufts (automatic), one landmark.
