// physics.js — pixel-stepped, axis-separated movement vs the tile grid
// (Celeste MoveH/MoveV pattern: integer steps + sub-pixel remainders).
// Tunneling is impossible by construction. See RESEARCH.md Addendum 2 §2.

export class Body {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.rx = 0; this.ry = 0; // sub-pixel remainders
  }
  get cx() { return this.x + this.w / 2; }
  get bottom() { return this.y + this.h; }
  rect(dx = 0, dy = 0) { return { x: this.x + dx, y: this.y + dy, w: this.w, h: this.h }; }
}

// world interface: world.solidRect(rect) -> bool
//                  world.onewayStop(rect, prevBottom) -> bool  (feet crossed a platform top)

export function moveX(body, amount, world) {
  body.rx += amount;
  let move = Math.round(body.rx);
  if (move === 0) return false;
  body.rx -= move;
  const sign = Math.sign(move);
  while (move !== 0) {
    if (world.solidRect(body.rect(sign, 0))) return true; // collided
    body.x += sign;
    move -= sign;
  }
  return false;
}

// opts: { drop:boolean (falling through oneways), onGroundStep:fn }
export function moveY(body, amount, world, opts = {}) {
  body.ry += amount;
  let move = Math.round(body.ry);
  if (move === 0) return 0;
  body.ry -= move;
  const sign = Math.sign(move);
  while (move !== 0) {
    const prevBottom = body.y + body.h;
    if (world.solidRect(body.rect(0, sign))) return sign; // hit solid
    if (sign > 0 && !opts.drop && world.onewayStop(body.rect(0, 1), prevBottom)) return 1;
    body.y += sign;
    move -= sign;
  }
  return 0;
}

// corner correction: moving up and blocked — try nudging horizontally
export function cornerCorrectUp(body, world, maxNudge) {
  for (let n = 1; n <= maxNudge; n++) {
    for (const dir of [1, -1]) {
      if (!world.solidRect(body.rect(dir * n, -1))) {
        body.x += dir * n;
        return true;
      }
    }
  }
  return false;
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
