import Phaser from 'phaser';

const K = Phaser.Input.Keyboard.KeyCodes;
const MAP = { left: [K.LEFT, K.A], right: [K.RIGHT, K.D], up: [K.UP, K.W], down: [K.DOWN, K.S], jump: [K.SPACE, K.Z, K.K, K.UP, K.W], cast: [K.X, K.J, K.F], assist: [K.E], ok: [K.ENTER, K.SPACE, K.X, K.J, K.Z] };

/** Merges keyboard and on-screen touch state into one object with edge detection. */
class InputMan {
  constructor() { this.touch = {}; this.now = {}; this.prev = {}; this.press = {}; this.keys = null; this.block = {}; }
  bind(scene) {
    this.keys = {};
    for (const [n, codes] of Object.entries(MAP)) this.keys[n] = codes.map((c) => scene.input.keyboard.addKey(c, true));
    this.block = {}; this.clear();
  }
  /** Drop all input. Action buttons still held must be released before they count again, so one press never acts twice. */
  clear() { for (const n of ['jump', 'cast', 'assist', 'down', 'ok']) if (this.raw(n)) this.block[n] = true; this.now = {}; this.prev = {}; this.press = {}; this.touch = {}; }
  raw(n) { return !!this.touch[n] || !!(this.keys && this.keys[n] && this.keys[n].some((k) => k.isDown)); }
  /** Keys released while the scene could not hear it (pause, hidden tab) must not stay stuck down. */
  release() { if (this.keys) Object.values(this.keys).flat().forEach((k) => k.reset()); this.block = {}; this.clear(); }
  update() {
    this.prev = this.now; this.now = {};
    for (const n of Object.keys(MAP)) { const r = this.raw(n); if (!r) this.block[n] = false; this.now[n] = r && !this.block[n]; }
    this.press = {}; for (const n of Object.keys(MAP)) this.press[n] = this.now[n] && !this.prev[n];
  }
  held(n) { return !!this.now[n]; }
  just(n) { return !!this.press[n]; }
  eat(n) { this.press[n] = false; }
}
export const Controls = new InputMan();
