// input.js — keyboard + gamepad → virtual buttons. pressed() is edge-triggered
// per fixed step. Gamepad layout mirrors the original Dewdrop Dynasty scheme:
// A jump, B roll, X shoot, Y melee; d-pad or left stick to move.

const MAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  KeyZ: 'jump', Space: 'jump',
  KeyX: 'shoot', KeyJ: 'shoot',
  KeyC: 'melee', KeyK: 'melee',
  ShiftLeft: 'roll', ShiftRight: 'roll', KeyL: 'roll',
  Escape: 'pause', KeyP: 'pause',
  Enter: 'confirm',
};

// standard-mapping gamepad buttons → virtual buttons
const PAD_BTN = {
  0: 'jump',    // A
  1: 'roll',    // B  (original DD scheme)
  2: 'shoot',   // X
  3: 'melee',   // Y
  9: 'pause',   // Menu/Start
  12: 'up', 13: 'down', 14: 'left', 15: 'right', // d-pad
};
const STICK_DEADZONE = 0.35;

export class Input {
  constructor(onFirstInput) {
    this.held = new Set();      // keyboard-held
    this.padHeld = new Set();   // gamepad-held (rebuilt every step)
    this.edge = new Set();      // filled by events + pad polling, drained per step
    this.pressedSet = new Set();
    this.gamepadActive = false; // true once any pad input is seen (for UI hints)
    this._first = onFirstInput;
    addEventListener('keydown', (e) => {
      const b = MAP[e.code];
      if (!b) return;
      e.preventDefault();
      this._firstInput();
      if (!this.held.has(b)) this.edge.add(b);
      this.held.add(b);
    });
    addEventListener('keyup', (e) => {
      const b = MAP[e.code];
      if (!b) return;
      e.preventDefault();
      this.held.delete(b);
    });
    // pointer taps count too — unlocks audio on mobile before any key/pad press
    addEventListener('pointerdown', () => this._firstInput());
    addEventListener('blur', () => this.held.clear());
  }

  _firstInput() {
    if (this._first) { this._first(); this._first = null; }
  }

  _pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const next = new Set();
    for (const pad of pads) {
      if (!pad || !pad.connected) continue;
      for (const [idx, b] of Object.entries(PAD_BTN)) {
        if (pad.buttons[idx]?.pressed) next.add(b);
      }
      const ax = pad.axes[0] ?? 0, ay = pad.axes[1] ?? 0;
      if (ax < -STICK_DEADZONE) next.add('left');
      if (ax > STICK_DEADZONE) next.add('right');
      if (ay < -STICK_DEADZONE) next.add('up');
      if (ay > STICK_DEADZONE) next.add('down');
    }
    // edges: buttons that are down now but weren't last step
    for (const b of next) {
      if (!this.padHeld.has(b)) this.edge.add(b);
    }
    if (next.size) { this.gamepadActive = true; this._firstInput(); }
    this.padHeld = next;
  }

  // call once at the START of each fixed step
  beginStep() {
    this._pollGamepad();
    this.pressedSet = this.edge;
    this.edge = new Set();
  }

  down(b) { return this.held.has(b) || this.padHeld.has(b); }
  pressed(b) { return this.pressedSet.has(b); }
}
