import Phaser from 'phaser';
// Pickups, interactables, obstacles and enemies.
import { OBSTACLE as O, PLAYER as P } from '../config/balance.js';
import { Audio } from '../core/Audio.js';
import { Save } from '../core/Save.js';
import { T, pick, wtxt, isTouch } from '../core/util.js';
import { TOAST, SIGNS, TALK } from '../config/text.js';
import { COFFEE } from '../config/balance.js';

const bodyOf = (s) => s.getBounds();
const overlap = (a, b, pad = 0) => a.x < b.right + pad && a.right > b.x - pad && a.y < b.bottom + pad && a.bottom > b.y - pad;

class Ent extends Phaser.GameObjects.Sprite {
  constructor(L, tx, ty, name, frame = 0, depth = 10, oy = 1) { super(L, tx * T, ty * T, 'atlas', `${name}/${frame}`); this.setOrigin(0.5, oy).setDepth(depth); L.add.existing(this); this.L = L; this.nm = name; L.ents.push(this); }
  fr(i) { this.setFrame(`${this.nm}/${i}`); return this; }
  hits(pad = 0) { return overlap(bodyOf(this), this.L.player.body, pad); }
  update() {}
  kill() { this.dead = true; this.destroy(); }
}
export { Ent, overlap };

// ------------------------------------------------------------------ pickups
export class Coffee extends Ent {
  constructor(L, tx, ty) { super(L, tx, ty, 'coffee', 0, 10, 0.5); this.play({ key: 'coffee', startFrame: (tx * 3) % 4 | 0 }); }
  update() {
    if (this.dead || !this.L.player.alive || !this.hits(-2)) return; const s = Save.d.stats; s.coffee++; Audio.sfx('coffee', { rate: 1 + ((this.L.combo = this.L.clock - (this.L.comboT || 0) < 900 ? Math.min(8, (this.L.combo || 0) + 1) : 0) * 0.04) }); this.L.comboT = this.L.clock;
    this.L.fx.spark(this.x, this.y); if (s.coffee >= COFFEE.caffeineGoal) this.L.unlock('caffeine'); this.L.hud.refresh(); this.kill();
  }
}
export class Special extends Ent {
  constructor(L, tx, ty) { super(L, tx, ty, 'special', 0, 10, 0.5); this.play('special'); this.gl = L.fx.glow(this.x, this.y, 'w', 0.5, 9, 0.6); }
  update() { if (this.dead) return; this.gl.setScale(0.5 + Math.sin(this.L.clock / 200) * 0.06); if (this.hits()) { this.L.player.heal(1); Audio.sfx('special'); this.L.float(this.x, this.y - 10, TOAST.sanity, '#ffd0d8'); this.L.fx.sparkle(this.x, this.y, 6, 14); this.gl.destroy(); this.kill(); } }
}
/** Generic quest item. o: {flag, onGet, glow} */
export class Item extends Ent {
  constructor(L, tx, ty, name, o = {}) { super(L, tx, ty, name, 0, 12, 0.5); this.o = o; if (L.anims.exists(name)) this.play(name); this.hy = this.y; this.gl = L.fx.glow(this.x, this.y, o.glow || 'w', 0.6, 9, 0.6); if (o.flag && L.flag(o.flag)) { this.gl.destroy(); this.kill(); } }
  update() { if (this.dead) return; this.y = this.hy + Math.sin(this.L.clock / 350) * 3; this.gl.setPosition(this.x, this.y); if (this.hits(1) && !this.L.cinematic && this.L.player.alive) { if (this.o.flag) this.L.setFlag(this.o.flag); this.L.fx.sparkle(this.x, this.y, 8, 18); this.L.fx.ring(this.x, this.y, 0xfff0a0, 1.2); Audio.sfx('special'); this.gl.destroy(); const f = this.o.onGet; this.kill(); f && f(); } }
}

// ------------------------------------------------------------------ interactables
/** Anything with use(): shows a prompt when Léo is near. */
export class Interact extends Ent {
  constructor(L, tx, ty, name, o = {}) { super(L, tx, ty, name, o.frame || 0, o.depth ?? 9); this.o = o; this.range = o.range ?? 22; L.interacts.push(this); }
  can() { return !this.dead && !(this.o.disabled && this.o.disabled()); }
  use() { this.o.use && this.o.use(this); }
}
export class Sign extends Ent {
  constructor(L, tx, ty, key, o = {}) { super(L, tx, ty, o.sprite || 'sign', 0, 8); this.key = key; this.t = null; this.r = o.range ?? 44; this.raw = o.raw; }
  update() {
    const near = Math.abs(this.L.player.x - this.x) < this.r && Math.abs(this.L.player.y - this.y) < 60;
    if (near && !this.t) {
      const s = this.raw || SIGNS[this.key]; const t = wtxt(this.L, this.x, this.y - this.height - 8, s, 11, '#3a2418', { st: 0, oy: 1, depth: 41, ls: -2 }); const w = Math.max(t.width + 18, 40); const h = t.height + 6;
      const bg = this.L.add.nineslice(this.x, t.y + 4, 'atlas', 'panel_paper/0', w, Math.max(h, 26), 12, 12, 12, 12).setOrigin(0.5, 1).setDepth(40);
      t.y = bg.y - bg.height / 2 + t.height / 2 - 2; this.t = [t, bg]; this.t.forEach((q) => { q.setAlpha(0); this.L.tweens.add({ targets: q, alpha: 1, duration: 160 }); }); Audio.sfx('page', { v: 0.4 });
    } else if (!near && this.t) { const q = this.t; this.t = null; this.L.tweens.add({ targets: q, alpha: 0, duration: 160, onComplete: () => q.forEach((z) => z.destroy()) }); }
  }
}
export class NPC extends Interact {
  constructor(L, tx, ty, who, talk, o = {}) { super(L, tx, ty, `${who}_idle`, { ...o, use: () => this.talk() }); this.who = who; this.lines = TALK[talk]; this.play(`${who}_idle`); this.setFlipX(o.flip ?? true); }
  talk() { this.setFlipX(this.L.player.x < this.x); if (this.L.anims.exists(`${this.who}_talk`)) this.play(`${this.who}_talk`); this.L.say(this.lines, () => { if (!this.dead) this.play(`${this.who}_idle`); this.o.after && this.o.after(); }); }
}
export class Machine extends Ent {
  constructor(L, tx, ty) { super(L, tx, ty, 'machine', 0, 8); this.lit = false; this.gl = L.fx.glow(this.x, this.y - 24, 'g', 0.8, 7, 0); L.machines.push(this); }
  activate(silent) {
    if (this.lit) return; this.L.machines.forEach((m) => { if (m.lit) { m.lit = false; m.anims.stop(); m.fr(0); m.gl.setAlpha(0); } });
    this.lit = true; this.play('machine'); this.gl.setAlpha(0.6); this.L.setCheckpoint(this.x, this.y);
    if (!silent) { Audio.sfx('checkpoint'); this.L.float(this.x, this.y - 44, TOAST.checkpoint, '#c8ffd8'); this.L.fx.sparkle(this.x, this.y - 20, 7, 18); if (this.L.player.hearts < P.hearts) this.L.player.heal(1); }
  }
  update() { if (!this.lit && this.hits(4)) this.activate(); }
}
/** Teleport door. o: {to:{x,y} tiles, locked(), label} */
export class Door extends Interact {
  constructor(L, tx, ty, o) { super(L, tx, ty, o.sprite || 'door', { range: 18, depth: 7, ...o, use: () => this.go() }); if (o.label) wtxt(L, this.x, this.y - this.height - 6, o.label, 10, '#fff0c0', { depth: 9 }); if (o.tint) this.setTint(o.tint); this.auto = o.auto; }
  go() {
    if (this.o.locked && this.o.locked()) { Audio.sfx('error'); if (this.o.lockedMsg) this.L.toast(this.o.lockedMsg); return; }
    if (this.nm === 'door') this.fr(1); Audio.sfx('door'); this.L.teleport(this.o.to.x, this.o.to.y, () => { if (!this.dead && this.nm === 'door') this.fr(0); this.o.onEnter && this.o.onEnter(); });
  }
  update() { if (this.auto && !this.L.cinematic && !this.L.teleporting && this.hits(-10)) this.go(); }
}
export class MiniPortal extends Ent {
  constructor(L, tx, ty, to, msg) { super(L, tx, ty, 'miniportal', 0, 9); this.play('miniportal'); this.to = to; this.msg = msg; L.fx.glow(this.x, this.y - 20, 'p', 0.7, 7, 0.5); this.cd = 0; }
  update(dt) { this.cd -= dt; const b = this.L.player.body; if (this.cd <= 0 && !this.L.teleporting && Math.abs(this.L.player.x - this.x) < 10 && Math.abs(b.center.y - (this.y - 20)) < 22) { this.cd = 1500; Audio.sfx('laser'); this.L.fx.ring(this.x, this.y - 20, 0xf08ad0, 1.4); this.L.teleport(this.to.x, this.to.y, () => this.msg && this.L.toast(pick([].concat(this.msg))), 160); } }
}
/** Hit by pen, stomp or use. o:{kind:'pod'|'lever'|'valve'|'terminal'|'mushsw'|'ticket', on()} */
export class Switch extends Interact {
  constructor(L, tx, ty, kind, o) { super(L, tx, ty, kind, { range: 24, ...o, use: () => this.trigger() }); this.kind = kind; this.state = 0; this.cd = 0; this.L.hittable.push(this); if (kind === 'mushsw') this.o.disabled = () => true; }
  hit() { this.trigger(); }
  trigger() {
    if (this.cd > 0 || (this.o.once && this.state)) return; this.cd = 500; this.state = 1; Audio.sfx(this.kind === 'valve' ? 'metal' : this.kind === 'terminal' ? 'open' : 'switch');
    if (this.kind === 'valve') { let i = 0; this.L.time.addEvent({ delay: 60, repeat: 12, callback: () => { i++; this.fr(i % 4); } }); } else if (this.L.textures.getFrame('atlas', `${this.kind}/1`).name === `${this.kind}/1`) this.fr(1);
    this.L.fx.sparkle(this.x, this.y - 18, 5, 12); this.o.on && this.o.on(this);
  }
  reset() { this.state = 0; if (this.kind !== 'valve') this.fr(0); }
  update(dt) {
    this.cd -= dt;
    if (this.kind === 'mushsw') { const p = this.L.player; if (p.body.velocity.y > 40 && Math.abs(p.x - this.x) < 20 && p.y > this.y - this.height && p.y < this.y - this.height + 16) { p.bounce(330); Audio.sfx('boing'); this.setScale(1.15, 0.8); this.L.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 250, ease: 'Back.out' }); this.trigger(); } }
  }
}
/** Bouncy pad. */
export class Bouncer extends Ent {
  constructor(L, tx, ty, name, v) { super(L, tx, ty, name, 0, 9); this.v = v; this.top = this.height; }
  update() { const p = this.L.player; if (p.body.velocity.y > 20 && Math.abs(p.x - this.x) < this.width / 2 && p.y > this.y - this.top - 2 && p.y < this.y - this.top + 16) { p.y = this.y - this.top; p.bounce(this.v); Audio.sfx('boing'); this.setScale(1.2, 0.7); this.L.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.out' }); this.L.fx.burst('coin', this.x, this.y - this.top, 4, 90); } }
}

// ------------------------------------------------------------------ obstacles
/** Solid breakable wall. The RA shreds it; Léo's pen can slowly chip it. */
export class Barrier extends Ent {
  constructor(L, tx, ty, name, o = {}) {
    super(L, tx, ty, name, 0, 11); this.o = o; this.hp = this.max = o.hp ?? O.barrierHp; const z = L.add.zone(this.x, this.y - this.height / 2, this.width - 4, this.height); L.physics.add.existing(z, true); L.solids.add(z); this.z = z; this.ra = o.ra ?? true; this.L.hittable.push(this); this.sh = 0;
    if (o.tall) { z.body.setSize(this.width - 4, this.height + o.tall); z.body.setOffset(0, -o.tall); }
    if (o.flag && L.flag(o.flag)) { z.destroy(); this.kill(); }
  }
  hit(dmg = 1, by) {
    if (this.dead) return; if (this.o.locked && this.o.locked()) { if (this.L.clock - (this.mt || -9e9) > 2500) { this.mt = this.L.clock; this.L.toast(this.o.lockedMsg); } return; }
    this.hp -= dmg; this.sh = 160; Audio.sfx('break', { rate: 0.9 + Math.random() * 0.3 }); this.fr(1); this.L.time.delayedCall(60, () => !this.dead && this.fr(0)); this.L.fx.burst(this.nm === 'barrier_books' ? 'brick' : 'bit', this.x, this.y - this.height / 2, 5, 120);
    this.o.onHit && this.o.onHit(); if (this.hp <= 0) this.shatter(by);
  }
  shatter() { if (this.dead) return; const n = 26; for (let i = 0; i < 4; i++) this.L.fx.burst(i % 2 ? 'bit' : 'brick', this.x + (Math.random() - 0.5) * this.width, this.y - Math.random() * this.height, n / 4, 190); Audio.sfx('thud'); this.L.cameras.main.shake(180, 0.007); this.L.hitStop(50); if (this.o.flag) this.L.setFlag(this.o.flag); const f = this.o.onBreak; if (this.label) this.label.destroy(); this.z.destroy(); this.kill(); f && f(); }
  update(dt) { if (this.sh > 0) { this.sh -= dt; this.x = this.z.x + Math.sin(this.sh / 12) * 2; } else this.x = this.z.x; }
}
export class Writers extends Barrier {
  constructor(L, tx, ty, o = {}) { super(L, tx, ty, 'writers', { hp: O.writersHp, ...o }); this.lines = []; if (this.dead) return; /* already broken in this save */ this.play('writers'); this.o.onBreak = () => { L.toast(TOAST.writersDone); o.onBreak && o.onBreak(); }; }
  fr() { return this; }
  hit(d, by) { if (this.dead) return; const n = this.max - this.hp; const x = this.x - 10; const y = this.y - 50 + n * 9; const t = wtxt(this.L, x, y, pick(['thus', 'hence', 'etc.', 'we', 'data', 'idk']), 9, '#2c2038', { st: 0, ox: 0, depth: 12 }); this.lines.push(t); Audio.sfx('typing'); super.hit(d, by); if (this.dead) this.lines.forEach((q) => q.destroy()); }
}
/** Sliding door opened by script. */
export class Gate extends Ent {
  constructor(L, tx, ty, name, o = {}) { super(L, tx, ty, name, 0, 9); const z = L.add.zone(this.x, this.y - this.height / 2, this.width, this.height); L.physics.add.existing(z, true); L.solids.add(z); this.z = z; this.o = o; if (o.flag && L.flag(o.flag)) { z.destroy(); this.kill(); } }
  open(quiet) { if (this.dead || this.opening) return; this.opening = true; if (this.o.flag) this.L.setFlag(this.o.flag); this.z.destroy(); if (!quiet) { Audio.sfx('creak'); this.L.cameras.main.shake(160, 0.004); } this.L.tweens.add({ targets: this, scaleY: 0, alpha: 0.2, duration: 700, ease: 'Quad.in', onComplete: () => this.kill() }); this.L.fx.burst('brick', this.x, this.y - 10, 6, 70); }
}
export class Spinner {
  constructor(L, tx, ty, r = 3, n = 6) { this.L = L; L.ents.push(this); this.cx = tx * T; this.cy = ty * T; this.r = r * T; this.d = []; for (let i = 0; i < n; i++) this.d.push(L.add.image(0, 0, 'atlas', 'dot/0').setDepth(12).setScale(1 - i * 0.07)); }
  update() { this.d.forEach((s, i) => { const a = this.L.clock / 900 - i * 0.42; s.setPosition(this.cx + Math.cos(a) * this.r, this.cy + Math.sin(a) * this.r).setAlpha(1 - i * 0.1); const p = this.L.player; if (Math.hypot(p.x - s.x, p.body.center.y - s.y) < 12) p.hurt(s.x); }); }
}
/** Ceiling stamp that slams periodically. */
export class Crusher extends Ent {
  constructor(L, tx, ty, drop, o = {}) { super(L, tx, ty, o.name || 'stamp_rej', 0, 13); this.hy = this.y; this.dropPx = drop * T; this.period = o.period || 2600; this.t = o.phase ? o.phase * this.period : 0; this.sh = L.add.image(this.x, this.y + this.dropPx - 2, 'atlas', 'ring/0').setDepth(6).setScale(1, 0.18).setTint(0x1c1428).setAlpha(0.4); this.setScale(o.scale || 1); this.slammed = false; }
  update(dt) {
    this.t = (this.t + dt) % this.period; const q = this.t / this.period; let y = 0;
    if (q < 0.5) { y = 0; this.slammed = false; } else if (q < 0.62) y = Math.sin(((q - 0.5) / 0.12) * 20) * 1.5; else if (q < 0.68) y = this.dropPx * ((q - 0.62) / 0.06) ** 2; else if (q < 0.8) { y = this.dropPx; if (!this.slammed) { this.slammed = true; if (this.L.near(this.x, this.y, 240)) { Audio.sfx('thud', { v: 0.6 }); this.L.cameras.main.shake(90, 0.003); this.L.fx.dust(this.x - 24, this.hy + this.dropPx); this.L.fx.dust(this.x + 24, this.hy + this.dropPx); } } } else y = this.dropPx * (1 - (q - 0.8) / 0.2);
    this.y = this.hy + y; this.sh.setAlpha(q > 0.45 && q < 0.8 ? 0.7 : 0.25);
    const p = this.L.player; const b = p.body; const hw = 30 * this.scaleX; if (q > 0.63 && q < 0.8 && Math.abs(p.x - this.x) < hw && b.bottom > this.y - 60 * this.scaleY && b.y < this.y - 2) p.hurt(this.x);
  }
}

// ------------------------------------------------------------------ enemies
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(L, tx, ty, name, o = {}) { super(L, tx * T, ty * T, 'atlas', `${name}/0`); L.add.existing(this); L.physics.add.existing(this); this.L = L; this.nm = name; this.o = o; this.setDepth(14).setOrigin(0.5, 1); this.hp = o.hp ?? 1; this.sx = this.x; this.sy = this.y; L.enemies.push(this); L.ents.push(this); L.hittable.push(this); this.ra = true; this.body.setAllowGravity(false); this.play(name); this.stompable = o.stompable ?? true; this.dieT = 0; }
  hit(d = 1) { if (this.dead) return; this.hp -= d; this.setTintFill(0xffffff); this.L.time.delayedCall(70, () => !this.gone && this.clearTint()); Audio.sfx('stomp'); if (this.hp <= 0) this.die(); }
  die(flat) { if (this.dead) return; this.dead = true; this.body.enable = false; this.L.fx.burst('bit', this.x, this.y - 10, 9, 110); if (flat && this.nm === 'gremlin') { this.anims.stop(); this.setTexture('atlas', 'gremlin_dead/0'); } this.L.tweens.add({ targets: this, alpha: 0, y: this.y + (flat ? 0 : 14), angle: flat ? 0 : 90, duration: 420, delay: flat ? 160 : 0, onComplete: () => this.setVisible(false) }); }
  respawn() { if (!this.dead) return; this.dead = false; this.hp = this.o.hp ?? 1; this.setPosition(this.sx, this.sy).setAlpha(1).setAngle(0).setVisible(true).clearTint(); this.body.enable = true; this.body.reset(this.sx, this.sy); this.play(this.nm); }
  touch() {
    const p = this.L.player; const b = p.body; if (this.dead || !this.L.physics.overlap(p, this)) return;
    if (this.stompable && b.velocity.y > 30 && b.bottom - this.body.y < 14) { p.bounce(P.stompBounce); Audio.sfx('stomp'); this.L.hitStop(40); this.hp = 0; this.die(true); } else p.hurt(this.x);
  }
  preUpdate(t, d) { super.preUpdate(t, d); }
}
export class Gremlin extends Enemy {
  constructor(L, tx, ty, o) { super(L, tx, ty, 'gremlin', o); this.body.setSize(16, 18).setOffset(4, 5); this.body.setAllowGravity(true); this.body.setGravityY(800); this.dir = -1; L.physics.add.collider(this, L.layer); L.physics.add.collider(this, L.solids); }
  update() { if (this.dead) return; const b = this.body; if (b.blocked.left || b.touching.left) this.dir = 1; if (b.blocked.right || b.touching.right) this.dir = -1; if (b.blocked.down && !this.L.solidAt(this.x + this.dir * 11, this.y + 6, true)) this.dir *= -1; b.setVelocityX(this.dir * 34); this.setFlipX(this.dir > 0); this.touch(); }
}
export class Format extends Enemy {
  constructor(L, tx, ty, o) { super(L, tx, ty, 'format', { hp: 2, ...o }); this.body.setSize(16, 26).setOffset(6, 5); this.body.setAllowGravity(true); this.body.setGravityY(800); L.physics.add.collider(this, L.layer); this.t = 900; }
  update(dt) { if (this.dead) return; this.t -= dt; const b = this.body; if (b.blocked.down) { b.setVelocityX(0); if (this.t <= 0) { this.t = 1500; let d = this.L.player.x < this.x ? -1 : 1; if (!this.L.solidAt(this.x + d * 34, this.y + 6, true)) d *= -1; if (this.L.solidAt(this.x + d * 34, this.y + 6, true)) { b.setVelocity(d * 62, -230); this.setFlipX(d < 0); } } } this.touch(); }
}
export class Citation extends Enemy {
  constructor(L, tx, ty, o = {}) { super(L, tx, ty, o.sprite || 'citation', o); this.body.setSize(18, 16).setOffset(7, 5); this.t = tx; }
  update(dt) { if (this.dead) return; this.t += dt / 1000; this.x = this.sx + Math.sin(this.t * 1.1) * (this.o.range ?? 36); this.y = this.sy + Math.sin(this.t * 2.3) * 12; this.setFlipX(Math.cos(this.t * 1.1) < 0); this.touch(); }
}
export class Tracked extends Enemy {
  constructor(L, tx, ty, o = {}) { super(L, tx, ty, 'tracked', o); this.body.setSize(24, 10).setOffset(8, 5); this.dir = 1; }
  update(dt) { if (this.dead) return; const r = (this.o.range ?? 5) * T; this.x += this.dir * 0.062 * dt; if (Math.abs(this.x - this.sx) > r) { this.dir = this.x > this.sx ? -1 : 1; } this.y = this.sy + Math.sin(this.L.clock / 260) * 5; this.setFlipX(this.dir < 0); this.touch(); }
}
/** Rejection letter: flies across, breaks fragile platforms. */
export class Letter extends Enemy {
  constructor(L, x, y, vx, vy = 0, o = {}) { super(L, x / T, y / T, 'letter', { hp: 1, ...o }); this.body.setSize(24, 16).setOffset(8, 7); this.vx = vx; this.vy = vy; this.life = o.life || 5200; this.setFlipX(vx < 0); this.hitP = false; this.close = false; this.setDepth(15); }
  update(dt) {
    if (this.gone) return; if (this.dead) { this.life -= dt; if (this.life < -800 || !this.visible) { this.gone = true; this.L.drop(this); } else this.life -= dt; return; }
    this.life -= dt; this.x += (this.vx * dt) / 1000; this.y += (this.vy * dt) / 1000 + Math.sin(this.L.clock / 130) * 0.4; const p = this.L.player;
    if (Math.abs(p.x - this.x) < 60 && Math.abs(p.y - this.y) < 60) this.close = true;
    for (const f of this.L.ents) if (f.breakNow && f.st !== 2 && Math.abs(f.x - this.x) < 34 && Math.abs(f.y - (this.y - 14)) < 14) f.breakNow();
    if (this.L.physics.overlap(p, this)) {
      if (p.body.velocity.y > 60 && p.body.bottom - this.body.y < 12) { p.bounce(P.stompBounce); Audio.sfx('stomp'); this.survived(); this.die(); return; }
      if (p.hurt(this.x)) { this.L.letterMsg(); this.survived(true); this.die(); return; }
    }
    if (this.life <= 0) { if (this.close) this.survived(); this.gone = true; this.L.drop(this); }
  }
  respawn() {}
  survived() { if (this.counted) return; this.counted = true; if (this.L.player.hearts > 0) { Save.d.stats.letters++; if (Save.d.stats.letters >= COFFEE.rejectionGoal) this.L.unlock('ghosted'); } }
}
export class Stress extends Ent {
  constructor(L, tx, ty) { super(L, tx, ty, 'stress', 0, 16, 0.5); this.play('stress'); this.mode = 0; this.hx = this.x; this.hy = this.y; this.left = 0; L.stress.push(this); }
  update(dt) {
    const p = this.L.player; const ty = p.body.y - 26;
    if (this.mode === 0) { this.y = this.hy + Math.sin(this.L.clock / 500) * 6; if (Math.hypot(p.x - this.x, p.body.center.y - this.y) < 70) { this.mode = 1; this.left = P.stressMs; p.stressT = P.stressMs; this.L.toast(TOAST.stress); Audio.sfx('rumble', { v: 0.5 }); } } else if (this.mode === 1) { this.x += (p.x - this.x) * 0.06; this.y += (ty - this.y) * 0.06; this.left -= dt; if (this.left <= 0 || p.stressT <= 0) { this.mode = 2; this.L.tweens.add({ targets: this, alpha: 0, y: this.y - 40, duration: 700 }); } }
  }
  reset() { this.mode = 0; this.setPosition(this.hx, this.hy).setAlpha(1); }
}
export { isTouch };
