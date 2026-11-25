import Phaser from 'phaser';
import { OBSTACLE as O } from '../config/balance.js';
import { Audio } from '../core/Audio.js';
import { T, clamp } from '../core/util.js';

/** Base for anything Léo can stand on that is not a tile. One-way by default. x,y = tile coords of the TOP CENTRE. */
export class Plat extends Phaser.Physics.Arcade.Sprite {
  constructor(L, tx, ty, name, o = {}) {
    const f = L.textures.getFrame('atlas', `${name}/0`);
    super(L, tx * T, ty * T + f.height / 2 - 1, 'atlas', `${name}/0`); L.add.existing(this); L.physics.add.existing(this); this.L = L; this.name2 = name; this.setDepth(o.depth ?? 8);
    const b = this.body; b.setAllowGravity(false); b.setImmovable(true); b.pushable = false; b.setSize(f.width - 4, Math.min(f.height - 2, o.bh ?? 10), false); b.setOffset(2, 1); this.solidAll = !!o.solid; b.friction.set(0, 0);
    if (!this.solidAll) { b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false; }
    L.platGroup.add(this); b.setAllowGravity(false); b.setImmovable(true); L.ents.push(this); this.hx = this.x; this.hy = this.y; this.rider = false; this.solid = true;
  }
  get topY() { return this.y - this.height / 2 + 1; }
  moveTo(x, y, dt) { const s = Math.max(0.001, dt / 1000); this.body.setVelocity(clamp((x - this.x) / s, -400, 400), clamp((y - this.y) / s, -400, 400)); }
  setSolid(v) { this.solid = v; this.body.checkCollision.up = v; this.body.checkCollision.none = !v; }
  touched() { this.rider = true; }
  update() { this.rider = false; }
}

/** Ping-pong mover. o: {dx,dy (tiles), ms, phase} */
export class Mover extends Plat {
  constructor(L, tx, ty, name, o) { super(L, tx, ty, name, o); this.o = { dx: 0, dy: 0, ms: 4000, phase: 0, ...o }; this.t = this.o.phase * this.o.ms; this.active2 = o.active ?? true; }
  update(dt) {
    if (this.active2) this.t += dt; const p = (1 - Math.cos((this.t / this.o.ms) * Math.PI * 2)) / 2;
    this.moveTo(this.hx + this.o.dx * T * p, this.hy + this.o.dy * T * p, dt); this.rider = false;
  }
}

/** A platform riding on a wheel. */
export class Spoke extends Plat {
  constructor(L, cx, cy, r, a, name, o) { super(L, cx + Math.cos(a) * r, cy + Math.sin(a) * r, name, o); this.c = [cx * T, cy * T, r * T, a]; this.o = { ms: 9000, ...o }; this.t = 0; this.running = o.running ?? true; this.sp = this.running ? 1 : 0; }
  update(dt) { this.sp += ((this.running ? 1 : 0) - this.sp) * 0.02; this.t += dt * this.sp; const [x, y, r, a] = this.c; const q = a + (this.t / this.o.ms) * Math.PI * 2 * (this.o.dir || 1); this.moveTo(x + Math.cos(q) * r, y + Math.sin(q) * r, dt); this.rider = false; }
}

/** Crumbles after being stood on, then reforms. */
export class Fragile extends Plat {
  constructor(L, tx, ty, name = 'plat_fragile', o = {}) { super(L, tx, ty, name, o); this.k = 0; this.st = 0; }
  breakNow() { if (this.st === 2) return; this.st = 2; this.k = O.fragileRespawnMs; this.setSolid(false); this.setVisible(false); this.L.fx.burst('bit', this.x, this.y, 10, 80); Audio.sfx('page'); }
  update(dt) {
    if (this.st === 0 && this.rider) { this.st = 1; this.k = O.fragileMs; Audio.sfx('creak', { v: 0.5 }); }
    if (this.st === 1) { this.k -= dt; this.setAngle(Math.sin(this.k / 22) * 1.6); if (this.k <= 0) this.breakNow(); }
    if (this.st === 2) { this.k -= dt; if (this.k <= 0) { this.st = 0; this.setAngle(0); this.setVisible(true).setAlpha(0); this.setSolid(true); this.L.tweens.add({ targets: this, alpha: 1, duration: 250 }); } }
    this.rider = false;
  }
}

/** Grows / withers on command. */
export class Leaf extends Plat {
  constructor(L, tx, ty, o = {}) { super(L, tx, ty, o.name || 'plat_leaf', { bh: 8, ...o }); this.setSolid(false); this.setScale(1, 1); this.setAlpha(0); this.left = 0; this.o = o; this.stem = null; }
  grow(ms = O.leafMs) { this.left = ms; this.setSolid(true); this.L.tweens.add({ targets: this, alpha: 1, duration: 260, ease: 'Back.out' }); this.L.fx.sparkle(this.x, this.y, 4, 16); }
  update(dt) {
    if (this.left > 0) { this.left -= dt; if (this.left < 1400) this.setAlpha(0.45 + 0.5 * Math.abs(Math.sin(this.left / 90))); if (this.left <= 0) { this.setSolid(false); this.L.fx.burst('leaf', this.x, this.y, 6, 40); this.L.tweens.add({ targets: this, alpha: 0, duration: 260 }); } }
    this.rider = false;
  }
}

/** Entangled platforms: standing on one sinks it and raises its partner. */
export class Linked extends Plat {
  constructor(L, tx, ty, name, o = {}) { super(L, tx, ty, name, o); this.o = { sink: 1.2, lift: 3, speed: 46, ...o }; this.partner = null; this.hold = 0; this.g = L.add.graphics().setDepth(7); }
  update(dt) {
    if (this.rider) this.hold = 350; else this.hold -= dt;
    const self = this.hold > 0; const p = this.partner && this.partner.hold > 0; const pp = this.o.lifter && this.o.lifter.hold > 0;
    let ty = this.hy; if (p || pp) ty = this.hy - this.o.lift * T; if (self) ty = this.keep !== undefined ? this.keep + this.o.sink * T : this.hy + this.o.sink * T;
    if (self && this.keep === undefined) this.keep = this.y; if (!self) this.keep = undefined;
    const d = ty - this.y; const sp = self ? this.o.speed * 0.35 : this.o.speed; this.body.setVelocity(0, clamp(d * 4, -sp, sp));
    this.g.clear(); const q = this.o.lifter || this.partner; if (q && this.o.thread) { this.g.lineStyle(2, this.o.thread, 0.75); this.g.beginPath(); const mx = (this.x + q.x) / 2; const my = Math.max(this.y, q.y) + 26; for (let i = 0; i <= 10; i++) { const t = i / 10; const X = (1 - t) * (1 - t) * this.x + 2 * (1 - t) * t * mx + t * t * q.x; const Y = (1 - t) * (1 - t) * this.y + 2 * (1 - t) * t * my + t * t * q.y; i ? this.g.lineTo(X, Y) : this.g.moveTo(X, Y); } this.g.strokePath(); }
    this.rider = false;
  }
}

/** Spreadsheet cell: A and B groups alternate. */
export class Cell extends Plat {
  constructor(L, tx, ty, group) { super(L, tx, ty, `plat_cell_${group}`, {}); this.group = group; this.ghost = L.add.image(this.x, this.y, 'atlas', 'plat_cell_off/0').setDepth(7); }
  update() {
    const t = (this.L.clock / O.cellPeriodMs) % 2; const on = this.group === 'a' ? t < 1.12 || t > 1.94 : t > 0.94 || t < 0.12; const f = this.group === 'a' ? 1.12 - t : 2 - t + 0.12;
    if (on !== this.solid) { this.setSolid(on); this.setVisible(on); if (on && this.L.near(this.x, this.y, 200)) Audio.sfx('tick', { v: 0.25 }); }
    this.setAlpha(on && f > 0 && f < 0.22 ? 0.55 : 1); this.rider = false;
  }
}

/** Invisible until revealed. */
export class Infra extends Plat {
  constructor(L, tx, ty, o = {}) { super(L, tx, ty, 'plat_infra', o); this.setSolid(false); this.setAlpha(0); this.hint = L.add.image(this.x, this.y, 'atlas', 'plat_hint/0').setDepth(7).setAlpha(0.6); this.o = o; this.shown = false; this.t = 0; this.flash = 0; }
  reveal() { if (this.shown) return; this.shown = true; this.setSolid(true); this.L.tweens.add({ targets: this, alpha: 1, duration: 500 }); this.L.tweens.add({ targets: this.hint, alpha: 0, duration: 300 }); this.L.fx.sparkle(this.x, this.y, 5, 20); }
  glimpse() { if (!this.shown) { this.flash = 900; } }
  update(dt) {
    if (!this.shown) { this.flash = Math.max(0, this.flash - dt); this.setAlpha((this.flash / 900) * 0.6); this.hint.setAlpha(0.35 + 0.3 * Math.sin(this.L.clock / 400 + this.x)); } else if (this.o.dx || this.o.dy) { this.t += dt; const p = (1 - Math.cos((this.t / (this.o.ms || 4200)) * Math.PI * 2)) / 2; this.moveTo(this.hx + (this.o.dx || 0) * T * p, this.hy + (this.o.dy || 0) * T * p, dt); }
    this.rider = false;
  }
}

/** Solid conveyor strip. dir pushes Léo. */
export class Conveyor {
  constructor(L, tx, ty, w, dir, speed = 60) {
    this.L = L; L.ents.push(this); this.v = dir * speed; this.parts = [];
    for (let i = 0; i < w; i += 2) { const s = L.add.sprite((tx + i + 1) * T, ty * T + 7, 'atlas', 'conveyor/0').setDepth(8).play('conveyor'); if (dir < 0) s.setFlipX(true); this.parts.push(s); }
    const z = L.add.zone((tx + w / 2) * T, ty * T + 7, w * T, 14); L.physics.add.existing(z, true); L.solids.add(z); z.belt = this; this.z = z;
  }
  update() {}
}

/** Raft floating at the zone water level. */
export class Raft extends Plat {
  constructor(L, tx, name = 'plat_raft') { super(L, tx, 10, name, { bh: 10 }); }
  update(dt) { const w = this.L.waterLevelPx(); this.moveTo(this.hx + Math.sin(this.L.clock / 1700 + this.hx) * 3, w + 3 + Math.sin(this.L.clock / 600 + this.hx) * 1.5 + (this.rider ? 2 : 0), dt); this.rider = false; }
}

/** Rideable mechanical beetle: waits, then shuttles along its path. */
export class Beetle extends Plat {
  constructor(L, tx, ty, o) { super(L, tx, ty, 'beetle', { bh: 20 }); this.body.setSize(50, 18, false); this.body.setOffset(6, 6); this.o = o; this.awake = false; this.dir = 1; this.wait = 0; this.setDepth(9); }
  wake() { if (this.awake) return; this.awake = true; this.wait = 900; this.play('beetle'); Audio.sfx('boing'); this.L.fx.ring(this.x, this.y, 0x8ff0c0, 1.6); }
  update(dt) {
    if (!this.awake) { this.body.setVelocity(0, 0); this.rider = false; return; }
    if (this.wait > 0) { this.wait -= dt; this.body.setVelocity(0, 0); if (this.wait <= 0) this.play('beetle', true); } else {
      this.body.setVelocity(this.dir * 52, 0); const a = this.hx; const b = this.hx + this.o.dist * T;
      if ((this.dir > 0 && this.x >= b) || (this.dir < 0 && this.x <= a)) { if (this.dir > 0 && this.o.onEnd) this.o.onEnd(); this.dir *= -1; this.wait = 1600; this.setFlipX(this.dir < 0); this.anims.pause(); this.body.setVelocity(0, 0); }
    }
    this.rider = false;
  }
}

/** Platform that falls away (funding collapse, major revision). */
export class Collapse extends Plat {
  constructor(L, tx, ty, name, o = {}) { super(L, tx, ty, name, o); }
  collapse(delay = 0) { if (this.fallen) return; this.fallen = true; this.L.time.delayedCall(delay, () => { this.setSolid(false); this.L.fx.burst('brick', this.x, this.y, 5, 80); this.L.tweens.add({ targets: this, y: this.y + 160, angle: Math.random() * 80 - 40, alpha: 0, duration: 800, ease: 'Quad.in' }); Audio.sfx('break'); }); }
  restore(x = this.hx, y = this.hy) { this.fallen = false; this.L.tweens.killTweensOf(this); this.body.reset(x, y); this.setAngle(0).setAlpha(0).setVisible(true); this.setSolid(true); this.L.tweens.add({ targets: this, alpha: 1, duration: 300 }); this.L.fx.sparkle(x, y, 5, 18); }
}
