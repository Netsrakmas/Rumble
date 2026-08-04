// input.js — keyboard → virtual buttons. pressed() is edge-triggered per fixed step.

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

export class Input {
  constructor(onFirstKey) {
    this.held = new Set();
    this.edge = new Set();     // filled by events, drained into pressedSet each step
    this.pressedSet = new Set();
    this._first = onFirstKey;
    addEventListener('keydown', (e) => {
      const b = MAP[e.code];
      if (!b) return;
      e.preventDefault();
      if (this._first) { this._first(); this._first = null; }
      if (!this.held.has(b)) this.edge.add(b);
      this.held.add(b);
    });
    addEventListener('keyup', (e) => {
      const b = MAP[e.code];
      if (!b) return;
      e.preventDefault();
      this.held.delete(b);
    });
    addEventListener('blur', () => this.held.clear());
  }

  // call once at the START of each fixed step
  beginStep() {
    this.pressedSet = this.edge;
    this.edge = new Set();
  }

  down(b) { return this.held.has(b); }
  pressed(b) { return this.pressedSet.has(b); }
}
