// constants.js — LOCKED tunables (see PROMPT.md). Do not retune silently.

export const C = {
  TILE: 16, VIEW_W: 320, VIEW_H: 180, HZ: 60, DT: 1 / 60,

  // run
  maxRun: 150, runAccel: 1600, runReduce: 900, airMult: 0.65,

  // gravity & jump (h ≈ 42 px ≈ 2.6 tiles, t_apex ≈ 0.28 s)
  gravity: 1070, fallGravMult: 1.7, apexGravMult: 0.5, apexWindow: 60,
  maxFall: 320, fastFall: 440,
  jumpVy: -300, varJumpTime: 0.16, jumpHBoost: 30,
  coyote: 0.100, jumpBuffer: 0.100, cornerCorrection: 8,

  // gun-jump & shooting
  gunjumpVy: -240, gunjumpCharges: 3,
  shotSpeed: 340, shotCooldown: 0.14, chargeTime: 0.45,
  chargeShotSpeed: 300, gunjumpChargeMult: 1.25,

  // melee
  meleeRange: 18, meleeCooldown: 0.25, meleeKnockback: 180,

  // roll / crawl / wall
  rollSpeed: 260, rollTime: 0.30, rollIFrames: 0.22, rollCooldown: 0.40,
  crawlSpeed: 60,
  wallSlideMax: 110, wallJumpVx: 260, wallJumpVy: -340, wallJumpLock: 0.16,

  // health & hit feel
  playerHP: 4, hurtIFrames: 1.0,
  hurtHitstop: 0.08, killHitstop: 0.04, pickupHitstop: 0.05,
  gunjumpFreeze: 0.05, // 3 frames

  // camera & shake
  shakeMax: 5, traumaDecay: 1.5, camK_x: 7, camK_y: 4, lookahead: 28,

  // squash & stretch (scale only, never hitbox)
  squashJump: [0.7, 1.3], squashLand: [1.3, 0.7], squashEase: 0.12,
};

// Style bible: "Dew-Dawn Garden 16" — all hexes from Resurrect-64. LOCKED.
export const PAL = {
  bgDeep:   '#2e222f',  // background deep plum, FG occluders
  bgMid:    '#323353',  // indigo sky bottom
  bgLight:  '#484a77',  // dawn indigo sky top
  farFoliage:'#374e4a', // parallax layer-2 plants
  leafDark: '#165a4c',  // tile body / leaf shadow
  leafMid:  '#239063',  // main leaf/tile face
  leafLight:'#91db69',  // grass lip
  leafHi:   '#cddf6c',  // dawn rim-light
  dew:      '#30e1b9',  // water/dew core
  dewHalo:  '#8ff8e2',  // additive halo, UI accent
  bee:      '#f9c22b',  // player primary — player ONLY
  beeAccent:'#f57d4a',  // scarf, muzzle flash
  outline:  '#45293f',  // universal sprite outline, bee stripes
  enemy:    '#cf657f',  // enemy bodies
  hazard:   '#e83b3b',  // hazards ONLY
  ui:       '#c7dcd0',  // text, pips; #ffffff reserved for hit flash
};
