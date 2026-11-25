// Phase 2 additions: small subclasses of the existing entities.
import { Audio } from '../core/Audio.js';
import { PLAYER as P } from '../config/balance.js';
import { P2 } from '../config/text.js';
import { T, pick, wtxt } from '../core/util.js';
import { Ent, Stress } from './things.js';

/** A stress cloud that rains on Léo. The pen (3 hits) or the Research Assistant can disperse it. */
export class StormCloud extends Stress {
  constructor(L, tx, ty) { super(L, tx, ty); this.ra = true; this.hp = 3; this.dt = 0; this.setScale(1.5); L.hittable.push(this); }
  update(dt) {
    if (this.dead) return; const was = this.mode; const p = this.L.player;
    // same follow logic as Phase 1, with its own line and rain
    if (was === 0) { this.y = this.hy + Math.sin(this.L.clock / 500) * 6; if (Math.hypot(p.x - this.x, p.body.center.y - this.y) < 76) { this.mode = 1; this.left = P.stressMs; p.stressT = P.stressMs; this.L.toast(P2.stress); Audio.sfx('rumble', { v: 0.6 }); } return; }
    if (was !== 1) return;
    this.x += (p.x - this.x) * 0.07; this.y += (p.body.y - 30 - this.y) * 0.07; this.left -= dt; this.dt -= dt; this.setAngle(Math.sin(this.L.clock / 120) * 4);
    if (this.dt <= 0) { this.dt = 60; const r = this.L.add.image(this.x + (Math.random() - 0.5) * 44, this.y + 18, 'atlas', 'rain/0').setDepth(15); this.L.tweens.add({ targets: r, y: r.y + 46, alpha: 0, duration: 330, onComplete: () => r.destroy() }); }
    if (this.left <= 0 || p.stressT <= 0) this.leave();
  }
  leave() { this.mode = 2; this.L.tweens.add({ targets: this, alpha: 0, y: this.y - 40, duration: 600 }); }
  hit(d = 1, by) { if (this.mode === 2 || this.dead) return; this.hp -= d; Audio.sfx('break'); this.L.fx.burst('drop', this.x, this.y, 6, 110); if (this.hp > 0) return; if (this.mode === 1) { this.L.player.stressT = 0; } this.L.toast(by === 'ra' ? P2.stressHit : P2.stressGone); this.L.fx.sparkle(this.x, this.y, 8, 20); this.dead = true; this.L.tweens.add({ targets: this, alpha: 0, scale: 2.4, duration: 300 }); }
  reset() { if (this.dead) return; this.L.tweens.killTweensOf(this); this.hp = 3; this.setScale(1.5).setAngle(0); super.reset(); }
}

/** Writer's Block: a giant blinking cursor. Solid until Léo carries an idea. */
export class Cursor extends Ent {
  constructor(L, tx, ty, o) {
    super(L, tx, ty, 'cursor', 0, 11); this.o = o; this.play('cursor'); const z = L.add.zone(this.x, this.y - 200, 26, 400); L.physics.add.existing(z, true); L.solids.add(z); this.z = z; this.lt = 0; L.hittable.push(this); this.hy = this.y;
    if (L.flag(o.flag)) { z.destroy(); this.kill(); }
  }
  hit() { const s = pick(['thus|', 'hence|', 'idk|', 'asdf|']); const t = wtxt(this.L, this.x - 12, this.y - 20 - Math.random() * 60, s, 11, '#ff9a8a', { ox: 1, depth: 14 }); Audio.sfx('typing'); this.L.tweens.add({ targets: t, alpha: 0, x: t.x - 30, duration: 800, onComplete: () => t.destroy() }); }
  update() {
    if (this.dead) return; const p = this.L.player; const d = Math.abs(p.x - this.x);
    if (d < 34 && Math.abs(p.y - this.y) < 170 && !this.L.flag('insp') && this.L.clock - this.lt > 5000) { this.lt = this.L.clock; this.L.toast(P2.block); Audio.sfx('typing'); }
    if (this.L.flag('insp') && d < 90 && Math.abs(p.y - this.y) < 60) this.crack();
  }
  crack() {
    if (this.dead) return; const L = this.L; const { x, y } = this; L.setFlag(this.o.flag); this.z.destroy(); this.dead = true; Audio.sfx('summon'); L.hud.white(500); L.cameras.main.shake(350, 0.01);
    L.tweens.add({ targets: this, scaleX: 3, scaleY: 0, alpha: 0, duration: 420, ease: 'Back.in', onComplete: () => this.setVisible(false) });
    for (let i = 0; i < 22; i++) { const s = L.add.image(x, y - Math.random() * 150, 'atlas', `word/${i % 5}`).setDepth(31); L.tweens.add({ targets: s, x: x + (Math.random() - 0.35) * 320, y: y - 40 - Math.random() * 150, angle: (Math.random() - 0.5) * 200, alpha: 0, duration: 1300, ease: 'Quad.out', onComplete: () => s.destroy() }); }
    L.fx.confetti(x, y - 80, 40); Audio.sfx('fanfare'); L.toast(P2.blockDone); this.o.onBreak && this.o.onBreak();
  }
}

/** Harmless wanderer (chicken). */
export class Critter extends Ent {
  constructor(L, tx, ty, range = 2) { super(L, tx, ty, 'chicken', 0, 9); this.play('chicken'); this.sx = this.x; this.r = range * T; this.v = 22; this.hop = 0; this.fy = this.y; }
  update(dt) {
    const p = this.L.player; const near = Math.abs(p.x - this.x) < 34 && Math.abs(p.y - this.fy) < 30; if (near && this.hop <= 0) { this.hop = 480; this.v = p.x < this.x ? 60 : -60; if (Math.random() < 0.6) Audio.sfx('pluck', { v: 0.5, rate: 1.4 }); }
    this.hop -= dt; if (this.hop <= 0) this.v = Math.sign(this.v) * 22; this.x += (this.v * dt) / 1000; if (Math.abs(this.x - this.sx) > this.r) { this.x = this.sx + Math.sign(this.x - this.sx) * this.r; this.v *= -1; }
    this.y = this.fy - (this.hop > 0 ? Math.abs(Math.sin(this.hop / 70)) * 10 : 0); this.setFlipX(this.v < 0);
  }
}
