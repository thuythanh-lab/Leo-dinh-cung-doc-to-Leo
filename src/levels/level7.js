// Final phase: supervisor approval, then Reviewer #2. Everything after this is cinematic (scenes/finale.js).
import { kit, T, Audio } from './kit.js';
import { P3 } from '../config/text.js';
import { pick, wtxt } from '../core/util.js';
import { Ent } from '../entities/things.js';

const G = 22; const A = 48; // floors: ridge, arena
/** A question Reviewer #2 throws. The pen, a stomp or the Research Assistant can pop it. */
class Question extends Ent {
  constructor(L, x, y, name, frame, text, vx, vy) { super(L, x / T, y / T, name, frame, 17, 0.5); this.vx2 = vx; this.vy2 = vy; this.ra = true; this.life = 9000; L.hittable.push(this); this.t = wtxt(L, x, y - 24, text, 11, '#ffe0dc', { depth: 40, st: 3 }); L.boss.qs.push(this); }
  hit() { if (this.dead) return; Audio.sfx('stomp'); this.pop(); }
  pop() { if (this.dead) return; this.L.fx.burst('bit', this.x, this.y, 8, 110); this.t.destroy(); this.kill(); }
  update(dt) {
    if (this.dead) return; const L = this.L; const p = L.player; this.life -= dt; this.x += (this.vx2 * dt) / 1000; this.y += (this.vy2 * dt) / 1000; if (this.vy2 > 0) { this.vy2 = Math.min(210, this.vy2 + dt * 0.16); this.angle += dt * 0.12; } else this.y += Math.sin(L.clock / 160 + this.vx2) * 0.5;
    const v = L.cameras.main.worldView; this.t.setPosition(Math.max(v.x + this.t.width / 2 + 4, Math.min(v.right - this.t.width / 2 - 4, this.x)), this.y - 24);
    const b = p.body; if (Math.abs(p.x - this.x) < 18 && Math.abs(b.center.y - this.y) < 22 && p.alive) { if (b.velocity.y > 60 && b.bottom < this.y + 4) { p.bounce(260); this.hit(); return; } p.hurt(this.x); this.pop(); return; }
    if (this.life <= 0 || this.x < 0 || this.x > 33 * T || this.y > A * T - 8) this.pop();
  }
}

export default {
  id: 7, name: 'The Đốc Tờ Era', sub: P3.sub, w: 48, h: 54, spawn: { x: 3, y: G },
  tiles(b) {
    b.zone({ id: 'ridge', x: 0, y: 0, w: 48, h: 28, theme: 'tower', bg: 'sunset', music: 'tower' });
    b.zone({ id: 'arena', x: 0, y: 34, w: 32, h: 18, theme: 'manuscript', music: 'boss' });
    b.ground(0, 47, G, 28); b.fill(47, 4, 1, 18); b.plat(12, G - 3, 4);
    b.fill(0, A, 32, 4); b.fill(0, 34, 1, 14); b.fill(31, 34, 1, 14); b.plat(3, A - 3, 4); b.plat(25, A - 3, 4); b.plat(12, A - 5, 8);
  },
  build(b, L) { const k = kit(L); this.ridge(k, L); this.arena(k, L); },

  // ------------------------------------------------------------------ 1. supervisor approval
  ridge(k, L) {
    [[7, 'b_tall', 4], [20, 'shelf_small', 0], [41, 'shelf_small', 0]].forEach(([x, n, f]) => k.prop(x, G, n, { f, d: 1 })); k.prop(24, G, 'b_lectern', { d: 3 }); k.prop(44, G, 'mtgate', { d: 1 }); [[10, G], [36, G]].forEach(([x, y]) => k.prop(x, y, 'lamp', { d: 2, glow: 'w', gy: 0.85 }));
    k.sign(6, G, 'p3door'); k.machine(9, G); k.row(12.4, G - 4.2, 4); k.row(16, G - 1, 3); const sup = k.prop(31, G, 'sup', { d: 12, anim: false, flip: true }); k.prop(32.6, G, 'b_lectern', { d: 11 });
    const p0 = () => L.player; const th = L.add.image(0, 0, 'atlas', 'thesis/0').setScale(0.5).setDepth(21); L.ents.push({ update: () => { if (!th.held && th.active) th.setPosition(L.player.x + L.player.face * 10, L.player.y - 13); } }); if (L.flag('notbad')) th.setVisible(false);
    const portal = k.prop(42, G + 0.2, 'portal', { d: 8 }).setVisible(L.flag('notbad'));
    L.ents.push({ update: () => { if (portal.visible && p0().alive && !L.cinematic && !L.teleporting && L.zone.id === 'ridge' && Math.abs(L.player.x - portal.x) < 16) { Audio.sfx('laser'); L.teleport(4, A, () => { L.setCheckpoint(L.player.x, L.player.y); }, 350); } } });
    L.trigger(26, G - 8, 18, 8.2, () => {
      if (L.flag('notbad') || L.cinematic) return; const p = L.player; L.lock(true); p.body.reset(28 * T, p.y); p.face = 1; p.forceAnim = 'leo_stare'; L.cameras.main.pan(29.6 * T, (G - 4) * T, 700, 'Sine.easeInOut'); L.cameras.main.stopFollow();
      L.say(P3.supTalk, () => { L.lock(true);
        th.held = true; th.setDepth(30); L.tweens.add({ targets: th, x: sup.x - 12, y: sup.y - 18, duration: 800, ease: 'Sine.inOut' }); Audio.music(L, null, 700); sup.setFrame('sup/1');
        const at = (ms, f) => L.wait(ms, f); P3.reading.forEach((s, i) => at(1500 + i * 1500, () => { L.float(sup.x, sup.y - 54, s, '#e8dcf8', 1300); Audio.sfx('page'); sup.setFrame(`sup/${i % 2 ? 2 : 1}`); if (i > 2) p.forceAnim = 'leo_sit'; }));
        const q = 1500 + P3.reading.length * 1500; at(q, () => { sup.setFrame('sup/0'); L.cameras.main.zoomTo(2.6, 3200, 'Sine.easeInOut'); p.forceAnim = 'leo_stare'; }); [700, 1700, 2700].forEach((d) => at(q + d, () => Audio.sfx('tick')));
        at(q + 4200, () => { sup.setFrame('sup/3'); L.hud.big([P3.notBad], { y: 170, size: 92, color: '#ffffff', ms: 1500 }); Audio.sfx('bookclose'); });
        at(q + 6000, () => this.validation(L, sup, th, portal));
      });
    });
  },
  validation(L, sup, th, portal) {
    const p = L.player; const c = L.cameras.main; c.zoomTo(2, 400, 'Back.easeOut'); c.shake(900, 0.02); L.hud.white(1200, 0xfff0a0); Audio.sfx('thud'); Audio.sfx('fanfare'); Audio.sfx('stampyes'); Audio.music(L, 'triumph', 200); p.forceAnim = 'leo_celebrate'; L.setFlag('notbad'); L.unlock('notbad'); L.hud.big(P3.legend, { y: 96, size: 50, ms: 5600 });
    L.fx.rain(7000, ['coin', 'star', 'conf_a', 'conf_c']); const gold = L.fx.glow(p.x, p.y - 20, 'w', 5, 8, 0.6).setTint(0xffd060); L.tweens.add({ targets: gold, angle: 360, alpha: 0.1, duration: 7500, onComplete: () => gold.destroy() });
    for (let i = 0; i < 34; i++) L.wait(i * 200, () => { const v = c.worldView; const x = v.x + 30 + Math.random() * (v.width - 60); const y = v.y + 20 + Math.random() * 110; L.fx.ring(x, y, pick([0xffd060, 0xff80a0, 0x80e0ff, 0xa0ff90]), 2.6); L.fx.confetti(x, y, 26, 190); L.fx.burst('star', x, y, 8, 160); L.fx.burst('coin', x, y, 8, 200); Audio.sfx('confetti', { v: 0.6 }); if (i % 5 === 0) Audio.sfx('rumble', { v: 0.4 }); });
    L.tweens.add({ targets: sup, y: sup.y - 14, yoyo: true, repeat: 9, duration: 160 }); L.tweens.add({ targets: th, y: th.y - 40, angle: 720, scale: 1, duration: 1400, ease: 'Back.out', onComplete: () => L.tweens.add({ targets: th, alpha: 0, delay: 2200, duration: 400 }) });
    L.wait(8200, () => { p.forceAnim = null; c.startFollow(p, true, 0.14, 0.12); portal.setVisible(true).setScale(0); L.tweens.add({ targets: portal, scale: 1, duration: 600, ease: 'Back.out' }); Audio.sfx('summon'); Audio.music(L, 'tower', 900); L.toast(P3.summoned, { color: '#ff9a8a' }); L.lock(false); });
  },

  // ------------------------------------------------------------------ 2. Reviewer #2 (about 40 seconds)
  arena(k, L) {
    k.machine(4, A); [[8, 'shelf_small'], [23, 'shelf_small']].forEach(([x, n]) => k.prop(x, A, n, { d: 1, tint: 0xd0a8c0 })); k.row(13.5, A - 6.2, 6); k.special(16, A - 8);
    const r = L.add.sprite(26 * T, (A - 9) * T, 'atlas', 'reviewer2/0').setDepth(16).setVisible(false); const B = { on: false, t: 0, q: 0, qs: [], phase: -1, giant: null, item: null, done: false }; L.boss = B; L.bossState = B;
    const clear = () => { B.qs.forEach((q) => q.pop()); B.qs = []; if (B.giant) { B.giant.destroy(); B.giant = null; } if (B.item && !B.item.dead) { B.item.gl.destroy(); B.item.kill(); } B.item = null; };
    L.resetBoss = () => { clear(); if (B.on && !B.done) { B.t = Math.max(0, B.phase) * 11000; B.phase -= 1; B.q = 1500; } };
    L.script = (dt) => {
      if (L.zone.id !== 'arena' || B.done || L.cinematic || L.teleporting || !L.player.alive) return; const p = L.player;
      if (!B.on) { B.on = true; B.q = 2600; r.setVisible(true).setAlpha(0); L.tweens.add({ targets: r, alpha: 1, duration: 600 }); L.hud.banner(...P3.boss, { color: '#ff9a8a' }); Audio.sfx('rumble'); L.cameras.main.shake(500, 0.008); return; }
      B.t += dt; B.q -= dt; const ph = Math.min(2, Math.floor(B.t / 11000)); if (ph !== B.phase) { B.phase = ph; L.toast(P3.phases[ph], { color: '#ffb0a8' }); B.q = Math.max(B.q, 900); if (ph === 2) { B.qs.forEach((q) => q.pop()); B.gt = 0; } }
      const side = Math.sin(L.clock / 2600) > 0 ? 1 : -1; r.x += ((ph === 2 ? 15 : 16 + side * 10) * T - r.x) * 0.02; r.y = (A - 9) * T + Math.sin(L.clock / 420) * 8; r.setFlipX(r.x < p.x); r.setFrame(`reviewer2/${B.q < 350 ? 2 : Math.floor(L.clock / 300) % 2}`);
      if (ph === 0 && B.q <= 0) { B.q = 1750; const d = p.x < r.x ? -1 : 1; new Question(L, r.x + d * 30, Math.min(A * T - 14, r.y + 90), 'q_vague', 0, pick(P3.vague), d * 92, 0); Audio.sfx('question', { v: 0.7 }); }
      if (ph === 1 && B.q <= 0) { B.q = 1150; new Question(L, Math.max(28, Math.min(30 * T, p.x + (Math.random() - 0.5) * 150)), 36 * T, 'q_odd', Math.floor(Math.random() * 3), pick(P3.odd), 0, 46); Audio.sfx('pluck', { rate: 0.7 }); }
      if (ph === 2) {
        B.gt += dt; if (!B.giant) { B.giant = L.add.sprite(29 * T, (A - 4.1) * T, 'atlas', 'q_giant/0').setDepth(15).setScale(0.2).play('q_giant'); L.tweens.add({ targets: B.giant, scale: 1, duration: 500, ease: 'Back.out' }); L.float(24 * T, (A - 10) * T, P3.giant, '#ff9a8a', 4200); Audio.sfx('stampno'); L.cameras.main.shake(500, 0.014); B.hold = 0; }
        B.giant.x = Math.max(8 * T, 28 * T - (B.gt / 1000) * 26 + Math.sin(L.clock / 160) * 2); if (B.gt > 2600 && !B.item) { B.item = k.item(5, A - 4.2, 'scope', { glow: 'g', onGet: () => this.scope(k, L, r, B) }); k.arrow(5, A - 6.4); Audio.sfx('special'); L.toast(P3.grab); }
        const g = B.giant; if (Math.abs(p.x - g.x) < 46 && p.body.bottom > g.y - 56) { p.hurt(g.x); if (p.alive) p.x = Math.max(24, Math.min(p.x, g.x - 50)); }
      }
    };
  },
  scope(k, L, r, B) {
    if (B.done) return; B.done = true; const p = L.player; L.lock(true); p.inv = 99999; p.face = 1; p.forceAnim = 'leo_cast'; B.qs.forEach((q) => q.pop()); Audio.music(L, null, 200); L.hud.big([P3.scope], { y: 120, size: 56, color: '#a0ffd0', ms: 2600 }); Audio.sfx('summon');
    const ring = L.add.image(p.x + 16, p.y - 18, 'atlas', 'scope/0').setDepth(34); L.tweens.add({ targets: ring, x: B.giant.x, y: B.giant.y, scale: 3, angle: 720, delay: 1300, duration: 700, ease: 'Quad.in', onComplete: () => {
      ring.destroy(); const g = B.giant; B.giant = null; L.fx.ring(g.x, g.y, 0xa0ffd0, 6); for (let i = 0; i < 6; i++) L.fx.burst(i % 2 ? 'bit' : 'brick', g.x + (Math.random() - 0.5) * 80, g.y + (Math.random() - 0.5) * 100, 10, 220); g.destroy(); Audio.sfx('thud'); Audio.sfx('break'); L.cameras.main.shake(500, 0.02);
      r.setFrame('reviewer2/3'); L.tweens.add({ targets: r, x: 16 * T, y: (A - 8) * T, duration: 700 }); L.tweens.add({ targets: r, scaleX: 1.35, scaleY: 1.35, yoyo: true, repeat: 5, delay: 700, duration: 120 });
      L.wait(2200, () => { Audio.sfx('stampno'); Audio.sfx('fanfare'); L.hud.white(700, 0xffc0b8); L.cameras.main.shake(700, 0.024); r.setVisible(false); for (let i = 0; i < 46; i++) { const s = L.add.image(r.x, r.y, 'atlas', `tc/${i % 5}`).setDepth(33); const a = Math.random() * 6.28; const d = 60 + Math.random() * 230; L.tweens.add({ targets: s, x: r.x + Math.cos(a) * d, y: r.y + Math.sin(a) * d * 0.7 + 60, angle: (Math.random() - 0.5) * 300, duration: 1500, ease: 'Quad.out' }); L.tweens.add({ targets: s, alpha: 0, y: '+=90', delay: 1400 + Math.random() * 700, duration: 700, onComplete: () => s.destroy() }); } L.fx.ring(r.x, r.y, 0xff8080, 7); L.celebrate(); L.unlock('reviewers'); Audio.music(L, 'triumph', 300); L.fx.rain(5000); });
      L.wait(7200, () => L.finish());
    } });
  },
  onRespawn(L) { L.resetBoss && L.resetBoss(); },
};
