import Phaser from 'phaser';
import { P3, UI } from '../config/text.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { txt, panel, fadeTo, onKey, pick } from '../core/util.js';

const W = 960; const H = 540;
const img = (s, x, y, n, f = 0, k = 1) => s.add.sprite(x, y, 'atlas', `${n}/${f}`).setScale(k);
const button = (s, x, y, label, go, w = 360) => { const p = panel(s, x, y, w, 50, 'panel_btn').setInteractive({ useHandCursor: true }); const t = txt(s, x, y - 3, label, 28, '#fff6e0', { st: 4 }); p.on('pointerover', () => p.setFrame('panel_hot/0')); p.on('pointerout', () => p.setFrame('panel_btn/0')); p.on('pointerup', () => p.visible && go()); return { p, t, go, show(v) { p.setVisible(v); t.setVisible(v); }, label(l) { t.setText(l); } }; };
const confetti = (s, x, y, n = 30, sp = 260, depth = 60) => { for (let i = 0; i < n; i++) { const q = s.add.sprite(x, y, 'atlas', `${pick(['conf_a', 'conf_b', 'conf_c', 'conf_d', 'conf_e', 'star'])}/0`).setScale(2).setDepth(depth); const a = Math.random() * 6.28; const d = Math.random() * sp; s.tweens.add({ targets: q, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.7, duration: 700, ease: 'Quad.out' }); s.tweens.add({ targets: q, y: `+=${140 + Math.random() * 120}`, alpha: 0, angle: 300, delay: 650, duration: 1100, onComplete: () => q.destroy() }); } };
const skip = (s, go) => { const t = txt(s, W - 20, H - 26, UI.skip, 26, '#c8bce0', { ox: 1 }).setInteractive().setDepth(99); t.on('pointerup', go); onKey(s, (e) => e.key === 'Escape' && go()); return t; };
const leave = (s, key, d) => fadeTo(s, key, d || {}, 600);

// ------------------------------------------------------------------ the defence
export class Defence extends Phaser.Scene {
  constructor() { super('Defence'); }
  create() {
    this._leaving = false; if (!Save.d.complete) { Save.d.complete = Date.now(); } Save.d.phase3 = true; Save.d.mapAt = 7; Save.unlock('phd'); Save.save(); Audio.music(this, null, 400); this.cameras.main.fadeIn(800, 20, 14, 30);
    this.add.image(W / 2, H / 2, 'bg_library_sky').setDisplaySize(W, H); ['far', 'mid'].forEach((k) => this.add.tileSprite(W / 2, H / 2 - 30, W / 2, 300, `bg_library_${k}`).setScale(2)); this.add.rectangle(W / 2, 470, W, 150, 0x3a2440); this.add.rectangle(W / 2, 398, W, 6, 0xc98f4a);
    // screen, committee, desk
    this.add.rectangle(250, 180, 320, 190, 0x2a1a30); this.add.rectangle(250, 180, 304, 174, 0xfff8ea); txt(this, 250, 132, P3.slide[0], 26, '#8f3848', { st: 0 }); this.slide = txt(this, 250, 190, '', 22, '#3a2418', { st: 0, wrap: 280 }); const leo = img(this, 250, 402, 'profleo', 0, 4).setOrigin(0.5, 1).setDepth(5); this.leo = leo; const th = img(this, 310, 360, 'thesis', 0, 1.5).setDepth(6);
    const com = ['comm_a', 'comm_b', 'comm_c'].map((n, i) => img(this, 590 + i * 120, 384, n, 0, 3.6).setOrigin(0.5, 1).setFlipX(true).setDepth(4)); this.add.rectangle(712, 392, 420, 70, 0x6b3f24).setDepth(5); this.add.rectangle(712, 358, 432, 10, 0xc58d4c).setDepth(5); txt(this, 712, 396, P3.committee, 26, '#f8e0b0', { st: 3 }).setDepth(6);
    const bar = this.add.graphics().setDepth(8); const pb = { v: 99 }; const draw = () => { bar.clear().fillStyle(0x1c1428, 0.9).fillRect(270, 490, 420, 30).fillStyle(pb.v >= 100 ? 0x6ae08a : 0xf0c44c, 1).fillRect(274, 494, 4.12 * pb.v, 22); this.pt.setText(`${P3.progress}: ${Math.floor(pb.v)}%`); }; this.pt = txt(this, W / 2, 504, '', 22, '#fff6e0', { st: 4 }).setDepth(9); draw();
    const at = (ms, f) => this.time.delayedCall(ms, f); const say = (x, y, s) => { const t = txt(this, x, y, s, 24, '#fff6e0', { st: 5, wrap: 300 }).setDepth(20).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 200 }); this.tweens.add({ targets: t, alpha: 0, delay: 1700, duration: 300, onComplete: () => t.destroy() }); };
    P3.slides.forEach((s, i) => at(900 + i * 1700, () => { this.slide.setText(s); Audio.sfx('page'); leo.setFrame(`profleo/${i % 2}`); this.tweens.add({ targets: leo, y: 396, yoyo: true, duration: 120 }); })); at(6200, () => { say(712, 110, P3.ask); Audio.sfx('question'); }); at(8000, () => say(250, 290, P3.answer));
    at(10000, () => { this.dark = this.add.rectangle(W / 2, H / 2, W, H, 0x0c0816, 0.7).setAlpha(0).setDepth(7); this.tweens.add({ targets: this.dark, alpha: 1, duration: 900 }); }); [10900, 11900, 12900].forEach((t) => at(t, () => { Audio.sfx('tick'); com.forEach((c) => this.tweens.add({ targets: c, y: '-=4', yoyo: true, duration: 90 })); }));
    at(14300, () => {
      this.dark.destroy(); const f = this.add.rectangle(W / 2, H / 2, W, H, 0xfff0c0).setDepth(70); this.tweens.add({ targets: f, alpha: 0, duration: 1100 }); this.cameras.main.shake(700, 0.014); Audio.sfx('stampyes'); Audio.sfx('fanfare'); Audio.music(this, 'ending', 600); com.forEach((c, i) => { c.setFrame(`${['comm_a', 'comm_b', 'comm_c'][i]}/1`); this.tweens.add({ targets: c, y: '-=14', yoyo: true, repeat: -1, duration: 220 + i * 30 }); }); th.setVisible(false);
      const s = txt(this, W / 2, 110, P3.passed, 110, '#8fffb0', { head: true, st: 16 }).setDepth(50).setScale(2.4); this.tweens.add({ targets: s, scale: 1, duration: 420, ease: 'Back.out' }); this.tweens.add({ targets: s, alpha: 0, delay: 2600, duration: 400 }); for (let i = 0; i < 8; i++) at(i * 420, () => { confetti(this, 120 + Math.random() * 720, 80 + Math.random() * 160); Audio.sfx('confetti', { v: 0.5 }); });
    });
    at(17400, () => { Audio.sfx('summon'); this.tweens.add({ targets: leo, x: W / 2, y: 430, scale: 5, duration: 700, ease: 'Sine.inOut' }); this.add.rectangle(W / 2, H / 2, W, H, 0x140e20, 0.55).setDepth(3).setAlpha(0.0); leo.setDepth(52); let n = 0; this.time.addEvent({ delay: 90, repeat: 13, callback: () => { n++; leo.setFrame(n % 2 ? 'grad/0' : 'profleo/0'); leo.setTintFill(n % 2 ? 0xfff0a0 : 0xffffff); } }); });
    at(19000, () => {
      leo.clearTint().setFrame('grad/0'); leo.play('grad_yay'); Audio.sfx('achieve'); const g = img(this, W / 2, 330, 'glow_w', 0, 9).setBlendMode('ADD').setTint(0xffd060).setDepth(51); this.tweens.add({ targets: g, alpha: 0.3, yoyo: true, repeat: -1, duration: 800 }); const f = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff).setDepth(70); this.tweens.add({ targets: f, alpha: 0, duration: 700 });
      const a = txt(this, W / 2, 84, P3.phd[0], 88, '#ffd24a', { head: true, st: 14 }).setDepth(55).setScale(1.8); this.tweens.add({ targets: a, scale: 1, duration: 400, ease: 'Back.out' }); txt(this, W / 2, 152, P3.phd[1], 34, '#fff6e0', { st: 7 }).setDepth(55); this.tweens.add({ targets: pb, v: 100, duration: 1800, delay: 700, onUpdate: draw, onComplete: () => { Audio.sfx('checkpoint'); confetti(this, W / 2, 480, 40, 320); } }); bar.setDepth(56); this.pt.setDepth(57); confetti(this, W / 2, 260, 60, 420);
    });
    at(25200, () => this.out()); skip(this, () => this.out());
  }
  out() { leave(this, 'Summit'); }
}

// ------------------------------------------------------------------ beyond the summit
export class Summit extends Phaser.Scene {
  constructor() { super('Summit'); }
  create() {
    this._leaving = false; Audio.music(this, 'ending', 1500); const c = this.cameras.main; c.fadeIn(1500, 255, 244, 220); this.add.image(0, 0, 'horizon').setOrigin(0, 0).setScale(2); this.v = this.add.image(120, 540, 'vista').setOrigin(0, 0); this.top = this.add.rectangle(0, 100, 1400, 441, 0x1f3a7c).setOrigin(0, 0); this.cl = this.add.tileSprite(960, 420, 1920, 300, 'bg_sunset_clouds').setAlpha(0.35); const leo = this.add.sprite(920, 580, 'atlas', 'grad/0').setOrigin(0.5, 1).setScale(0.8).play('grad').setDepth(5); this.leo = leo;
    for (let i = 0; i < 9; i++) { const b = this.add.sprite(700 - i * 34, 470 + (i % 4) * 18, 'atlas', 'bird/0').play({ key: 'bird', startFrame: i % 4 }).setScale(0.8); this.tweens.add({ targets: b, x: b.x + 1500, y: b.y - 260, duration: 42000 + i * 1300 }); } const gl = this.add.image(1280, 500, 'atlas', 'glow_w/0').setScale(9).setBlendMode('ADD').setTint(0xffc890).setAlpha(0.35); this.tweens.add({ targets: gl, alpha: 0.55, yoyo: true, repeat: -1, duration: 3200 });
    const st = { z: 5, x: 920, y: 566 }; const put = () => { c.setZoom(st.z); c.centerOn(st.x, st.y); }; put(); const to = (o) => this.tweens.add({ targets: st, ease: 'Sine.inOut', onUpdate: put, ...o });
    to({ z: 1, x: 600, y: 810, delay: 3800, duration: 9500 }); this.tweens.add({ targets: [this.v, this.top], alpha: 0, delay: 13800, duration: 1600 }); to({ z: 0.5, x: 960, y: 540, delay: 14400, duration: 11000 }); this.tweens.add({ targets: leo, scale: 1.1, delay: 14400, duration: 9000 }); this.time.delayedCall(6000, () => leo.play('grad_yay')); this.time.delayedCall(12000, () => leo.play('grad')); this.scene.launch('SummitUI'); this.events.once('shutdown', () => this.scene.stop('SummitUI'));
  }
  update(t, dt) { this.cl.tilePositionX += dt * 0.008; }
}
export class SummitUI extends Phaser.Scene {
  constructor() { super('SummitUI'); }
  create() {
    this.gone = false; const t = txt(this, W / 2, 92, '', 40, '#fffaf0', { st: 9, wrap: 860 }).setAlpha(0); const show = (at, s, ms) => { this.time.delayedCall(at, () => { t.setText(s); this.tweens.add({ targets: t, alpha: 1, duration: 900 }); }); this.time.delayedCall(at + ms, () => this.tweens.add({ targets: t, alpha: 0, duration: 800 })); };
    show(7600, P3.summit[0], 5600); show(16600, P3.summit[1], 5400); show(24200, P3.summit[2], 5600); this.time.delayedCall(31500, () => this.out()); skip(this, () => this.out());
  }
  out() { if (this.gone) return; this.gone = true; this.cameras.main.fadeOut(900, 255, 244, 220); leave(this.scene.get('Summit'), 'Letter', {}); }
}

// ------------------------------------------------------------------ the letter
export class Letter extends Phaser.Scene {
  constructor() { super('Letter'); }
  init(d) { this.again = !!(d && d.again); }
  create() {
    this._leaving = false; this.open = false; Audio.music(this, 'ending', 1200); this.cameras.main.fadeIn(700, 255, 244, 220); this.add.image(0, 0, 'horizon').setOrigin(0, 0); this.add.rectangle(W / 2, H / 2, W, H, 0x2a1a38, 0.62);
    for (let i = 0; i < 26; i++) { const q = img(this, Math.random() * W, Math.random() * H, 'mote', 0, 2).setAlpha(0.6).setBlendMode('ADD'); this.tweens.add({ targets: q, y: q.y - 60, alpha: 0, duration: 3000 + Math.random() * 3000, repeat: -1, delay: Math.random() * 3000 }); }
    const c = this.add.container(W / 2, -220).setDepth(10); this.c = c; const back = img(this, 0, 0, 'envelope', 0, 2.2); const flap = img(this, 0, -132, 'flap', 0, 2.2).setOrigin(0.5, 0); const seal = img(this, 0, 14, 'seal', 0, 2.2); const sh = img(this, 0, 14, 'glow_w', 0, 2).setBlendMode('ADD').setTint(0xffd060); c.add([back, flap, sh, seal]); this.tweens.add({ targets: sh, scale: 2.6, alpha: 0.4, yoyo: true, repeat: -1, duration: 700 }); this.tweens.add({ targets: c, y: 270, duration: 1200, ease: 'Bounce.out' }); Audio.sfx('summon'); this.tweens.add({ targets: c, angle: 1.5, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.inOut' });
    const hint = txt(this, W / 2, 486, P3.open, 30, '#fff0a0', { st: 6 }).setAlpha(0); this.tweens.add({ targets: hint, alpha: 1, delay: 1300, duration: 400, yoyo: true, repeat: -1, hold: 500 }); this.hint = hint; back.setInteractive({ useHandCursor: true }); seal.setInteractive({ useHandCursor: true }); const go = () => this.openIt(flap, seal, sh); back.on('pointerup', go); seal.on('pointerup', go); this.input.on('pointerup', (p) => { if (!this.open && Math.abs(p.x - W / 2) < 210 && Math.abs(p.y - 270) < 150) go(); }); this.go = go;
    onKey(this, (e) => { if (['Enter', ' ', 'x'].includes(e.key) && !e.repeat) { if (!this.open) go(); else if (this.btn) this.close(); } else if (e.key === 'Escape' && this.btn) this.close(); });
  }
  openIt(flap, seal, sh) {
    if (this.open) return; this.open = true; this.hint.destroy(); this.tweens.killTweensOf(this.c); this.c.setPosition(W / 2, 270).setAngle(0); sh.setVisible(false); Audio.sfx('glass'); confetti(this, W / 2, 284, 24, 160); const a = img(this, 0, 14, 'seal', 1, 2.2); const b = img(this, 0, 14, 'seal', 2, 2.2); this.c.add([a, b]); seal.setVisible(false); this.tweens.add({ targets: a, x: -70, y: 190, angle: -70, alpha: 0, duration: 900, ease: 'Quad.in' }); this.tweens.add({ targets: b, x: 70, y: 190, angle: 70, alpha: 0, duration: 900, ease: 'Quad.in' });
    this.time.delayedCall(500, () => { Audio.sfx('bookopen'); this.tweens.add({ targets: flap, scaleY: 0, duration: 260, onComplete: () => { flap.setFrame('flap/1').setOrigin(0.5, 1).setY(-128); this.tweens.add({ targets: flap, scaleY: 2.2, duration: 260 }); } }); });
    this.time.delayedCall(1200, () => {
      Audio.sfx('page'); this.tweens.add({ targets: this.c, y: 720, alpha: 0.2, duration: 1000, ease: 'Sine.inOut' }); const p = this.add.container(W / 2, 560).setDepth(20).setScale(0.6); const bg = panel(this, 0, 0, 780, 504, 'panel_paper'); const L = P3.letter; const els = [bg, txt(this, 0, -212, L.head, 46, '#8f3848', { head: true, st: 0 }), txt(this, -348, -166, L.dear, 27, '#3a2418', { st: 0, ox: 0 })]; let y = -134;
      L.body.forEach((s) => { const t = txt(this, -348, y, s, 25, '#3a2418', { st: 0, ox: 0, oy: 0, wrap: 696, align: 'left', ls: -4 }); els.push(t); y += t.height + 1; }); const end = txt(this, 0, y + 22, L.end, 34, '#8f3848', { head: true, st: 0 }); els.push(end, img(this, 320, -196, 'seal', 0, 1.5)); p.add(els); this.paper = p;
      this.tweens.add({ targets: p, y: 264, scale: 1, duration: 1100, ease: 'Back.out', onComplete: () => { confetti(this, W / 2, 120, 40, 420); Audio.sfx('fanfare'); this.time.delayedCall(1500, () => { this.btn = button(this, W / 2, H - 28, P3.closeLetter, () => this.close(), 300); this.btn.p.setDepth(30); this.btn.t.setDepth(31); }); } });
    });
  }
  close() { if (this.closing) return; this.closing = true; Audio.sfx('bookclose'); this.tweens.add({ targets: this.paper, y: 700, scale: 0.5, angle: 12, duration: 600, ease: 'Back.in' }); this.btn.show(false); this.time.delayedCall(500, () => leave(this, this.again ? 'Title' : 'Oracle')); }
  shutdown() { this.closing = false; }
}
Letter.prototype.init = function init(d) { this.again = !!(d && d.again); this.closing = false; this.btn = null; this.open = false; };

// ------------------------------------------------------------------ the academic oracle
export class Oracle extends Phaser.Scene {
  constructor() { super('Oracle'); }
  create() {
    this._leaving = false; this.busy = false; this.timers = []; this.vig = null; Save.d.future.oracle = Save.d.future.oracle || { deck: [], seen: [] }; this.S = Save.d.future.oracle; Audio.music(this, 'oracle', 900); this.cameras.main.fadeIn(800, 12, 6, 30); this.cameras.main.setBackgroundColor('#140a2c');
    for (let i = 0; i < 70; i++) { const s = img(this, Math.random() * W, Math.random() * H, 'mote', 0, 1 + Math.random() * 1.6).setAlpha(Math.random() * 0.8); this.tweens.add({ targets: s, alpha: 0.1, yoyo: true, repeat: -1, duration: 700 + Math.random() * 2200 }); } this.glow = img(this, W / 2, 250, 'glow_p', 0, 6).setBlendMode('ADD').setAlpha(0.6); this.tweens.add({ targets: this.glow, scale: 7, yoyo: true, repeat: -1, duration: 1900, ease: 'Sine.inOut' });
    txt(this, W / 2, 44, P3.oracle[0], 62, '#ffd24a', { head: true, st: 10 }); this.sub = txt(this, W / 2, 88, P3.oracle[1], 27, '#e0c8ff', { st: 5 }); this.ball = img(this, W / 2, 262, 'crystal', 0, 2.2).play('crystal').setDepth(4); this.tweens.add({ targets: this.ball, y: 256, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.inOut' }); this.out = txt(this, W / 2, 396, '', 29, '#fff6e0', { st: 6, wrap: 860 }).setDepth(20); this.count = txt(this, 24, 516, '', 22, '#c8a8f0', { ox: 0, st: 3 }); this.final = txt(this, W / 2, 440, '', 25, '#ffe9a0', { st: 5 }).setDepth(20);
    this.btn = button(this, W / 2, 482, P3.reveal, () => this.reveal(), 400); this.done = button(this, 852, 516, P3.leave, () => this.exit(), 180); this.done.t.setFontSize(22); txt(this, W / 2, 524, P3.disclaimer, 19, '#a890d0', { st: 3 }); this.tick(); onKey(this, (e) => { if (['Enter', ' ', 'x'].includes(e.key) && !e.repeat) this.reveal(); else if (e.key === 'Escape') this.exit(); });
    this.events.once('shutdown', () => Audio.sfx('close'));
  }
  tick() { const n = this.S.seen.length; this.count.setText(n ? `${P3.found}: ${n}/5` : ''); if (n >= 5) this.final.setText(P3.final); }
  next() { if (!this.S.deck.length) { const d = Phaser.Utils.Array.Shuffle([0, 1, 2, 3, 4]); if (d[4] === this.S.last) d.unshift(d.pop()); this.S.deck = d; } const i = this.S.deck.pop(); this.S.last = i; if (!this.S.seen.includes(i)) this.S.seen.push(i); Save.save(); return i; }
  reveal() {
    if (this.busy || this._leaving) return; this.busy = true; this.btn.show(false); this.clear(); this.out.setText(''); this.final.setText(''); this.sub.setVisible(true); this.ball.setVisible(true).setScale(2.2).setAlpha(1); Audio.music(this, 'oracle', 500); Audio.sfx('summon'); const i = this.next(); this.cur = i; this.tweens.add({ targets: this.ball, scale: 2.5, yoyo: true, repeat: 4, duration: 160 }); this.ball.anims.timeScale = 4; this.later(500, () => this.say(pick(P3.gaze))); const isNem = i === 4;
    this.later(1900, () => { this.ball.anims.timeScale = 1; if (isNem) this.nem(); else { const f = this.add.rectangle(W / 2, H / 2, W, H, 0xe8d0ff).setDepth(40); this.tweens.add({ targets: f, alpha: 0, duration: 600, onComplete: () => f.destroy() }); Audio.sfx('achieve'); this.window([this.tax, this.noTax, this.suit, this.hustle][i], ['vg_class', 'vg_money', 'vg_suit', 'vg_hustle'][i]); this.say(P3.fates[i]); this.later(3800, () => this.ready()); } });
  }
  say(s) { this.out.setText(s).setAlpha(0).setScale(1); this.tweens.add({ targets: this.out, alpha: 1, duration: 250 }); }
  ready() { this.busy = false; this.btn.label(P3.reroll); this.btn.show(true); this.tick(); }
  later(ms, f) { this.timers.push(this.time.delayedCall(ms, f)); }
  every(ms, f) { this.timers.push(this.time.addEvent({ delay: ms, loop: true, callback: f })); }
  clear() { this.timers.forEach((t) => t.remove()); this.timers = []; if (this.vig) { this.tweens.killTweensOf(this.vig.list); this.vig.destroy(); this.vig = null; } this.mask2 && this.mask2.destroy(); this.mask2 = null; }
  /** framed 480x260 stage; draw(container) uses coordinates -240..240, -130..130 */
  window(draw, bg) { this.ball.setVisible(false); this.sub.setVisible(false); const c = this.add.container(W / 2, 230).setDepth(10); this.vig = c; const fr = this.add.rectangle(0, 0, 496, 276, 0xf0c44c); const b = img(this, 0, 0, bg, 0, 2); c.add([fr, b]); const g = this.make.graphics().fillRect(W / 2 - 240, 100, 480, 260); this.mask2 = g; const a = this.add.container(0, 0); c.add(a); a.setMask(g.createGeometryMask()); draw.call(this, a); c.setScale(0.1); this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.out' }); return c; }
  put(c, x, y, n, f = 0, k = 2) { const s = img(this, x, y, n, f, k); c.add(s); return s; }
  // 1. the tax collector takes the salary
  tax(c) { const leo = this.put(c, -110, 104, 'profleo', 0, 3).setOrigin(0.5, 1); const tm = this.put(c, 300, 104, 'taxman', 0, 3).setOrigin(0.5, 1).setFlipX(true); const pile = [0, 1, 2, 3, 4].map((i) => this.put(c, -40 + (i % 3) * 26, 92 - (i > 2 ? 20 : 0), 'money', 0, 1.4)); this.tweens.add({ targets: tm, x: 70, duration: 900 }); pile.forEach((m, i) => this.later(1200 + i * 420, () => { if (!c.active) return; Audio.sfx('coins'); tm.setFrame('taxman/1'); this.tweens.add({ targets: m, x: 92, y: 30, scale: 0.5, duration: 380, ease: 'Back.in', onComplete: () => m.setVisible(false) }); leo.setFrame(`profleo/${i % 2}`); this.tweens.add({ targets: leo, angle: i % 2 ? 5 : -5, yoyo: true, duration: 100 }); })); this.later(3500, () => { if (!c.active) return; tm.setFrame('taxman/0').setFlipX(false); this.tweens.add({ targets: tm, x: 320, duration: 900 }); const t = txt(this, 10, -40, '-100%', 40, '#ff6060', { st: 6 }); c.add(t); this.tweens.add({ targets: leo, scaleY: 2.5, duration: 400 }); Audio.sfx('cooked'); }); }
  // 2. sunglasses, surrounded by money
  noTax(c) { const leo = this.put(c, 0, 112, 'profleo', 0, 3.4).setOrigin(0.5, 1); this.later(900, () => { if (!c.active) return; leo.play('coolleo'); Audio.sfx('special'); const g = this.put(c, 14, -10, 'star', 0, 3); this.tweens.add({ targets: g, scale: 0, angle: 180, duration: 500 }); this.tweens.add({ targets: leo, y: 104, yoyo: true, repeat: -1, duration: 260 }); }); this.every(130, () => { if (!c.active) return; const m = this.put(c, -230 + Math.random() * 460, -150, 'money', Math.random() < 0.6 ? 1 : 0, 1.3); this.tweens.add({ targets: m, y: 150, angle: 300, duration: 1600, onComplete: () => m.destroy() }); if (Math.random() < 0.3) Audio.sfx('coins', { v: 0.4 }); }); }
  // 3. the suit
  suit(c) { const leo = this.put(c, 0, 108, 'profleo', 0, 3.4).setOrigin(0.5, 1); let n = 0; this.later(800, () => { if (!c.active) return; Audio.sfx('summon'); this.timers.push(this.time.addEvent({ delay: 90, repeat: 11, callback: () => { if (!leo.active) return; n++; leo.setFrame(n % 2 ? 'suitleo/0' : 'profleo/0'); } })); this.tweens.add({ targets: leo, scaleX: -3.4, yoyo: true, repeat: 2, duration: 180 }); }); this.later(2000, () => { if (!c.active) return; leo.setScale(3.4).play('suitleo'); Audio.sfx('fanfare'); P3.corp.forEach((s, i) => { const t = txt(this, i % 2 ? 150 : -150, -90 + i * 34, s, 20, '#1c2438', { st: 0 }).setAlpha(0); c.add(t); this.tweens.add({ targets: t, alpha: 1, delay: i * 250, duration: 200 }); }); for (let i = 0; i < 8; i++) { const s = this.put(c, Math.random() * 240 - 120, Math.random() * 160 - 100, 'star', 0, 2); this.tweens.add({ targets: s, scale: 0, delay: i * 100, duration: 500 }); } }); }
  // 4. buried in self-help
  hustle(c) { const leo = this.put(c, 0, 116, 'headleo', 0, 3.4).setOrigin(0.5, 1); let n = 0; this.timers.push(this.time.addEvent({ delay: 150, repeat: 24, callback: () => { if (!c.active) return; const row = Math.floor(n / 7); const x = -190 + (n % 7) * 64 + (row % 2) * 24; const hide = row >= 2 && Math.abs(x) < 60; const b = this.put(c, x, -170, n % 6 === 5 ? 'plan' : 'hustle', n % 6 === 5 ? n % 2 : n % 5, 1.7); this.tweens.add({ targets: b, y: 112 - row * 28 - (hide ? 0 : 0), angle: (Math.random() - 0.5) * 16, duration: 420, ease: 'Bounce.out' }); Audio.sfx('book', { v: 0.5 }); n++; if (n > 14) leo.setFrame('headleo/1'); } })); this.tweens.add({ targets: leo, y: 40, delay: 2700, duration: 500, ease: 'Back.out', onStart: () => c.active && c.bringToTop(leo) }); }
  // 5. Master Chi
  nem() {
    Audio.music(this, null, 60); Audio.sfx('glitch'); this.tweens.killTweensOf(this.glow); this.glow.setVisible(false); this.ball.anims.pause(); this.ball.setTint(0x404050); this.out.setText('...'); this.sub.setVisible(false); const b = this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setDepth(30).setAlpha(0); this.tweens.add({ targets: b, alpha: 0.93, duration: 500 });
    const P = P3.nem; const line = (s, size, col) => { const t = txt(this, W / 2, H / 2 - 20, s, size, col, { head: true, st: 10, wrap: 900 }).setDepth(35).setScale(2.2); this.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.out' }); this.cameras.main.shake(260, 0.016); Audio.sfx('thud'); return t; }; let t; this.later(1500, () => { t = line(P[0], 64, '#ffffff'); }); this.later(3000, () => { t.destroy(); t = line(P[1], 64, '#ffd24a'); }); this.later(4200, () => { t.destroy(); t = line(P[2], 96, '#ff5050'); this.cameras.main.shake(900, 0.03); Audio.sfx('stampno'); });
    this.later(5700, () => { t.destroy(); b.destroy(); this.ball.clearTint().anims.resume(); this.glow.setVisible(true); const f = this.add.rectangle(W / 2, H / 2, W, H, 0xff5030).setDepth(40); this.tweens.add({ targets: f, alpha: 0, duration: 500, onComplete: () => f.destroy() }); Audio.music(this, 'nem', 150); Audio.sfx('pot'); Audio.sfx('fanfare'); this.cameras.main.shake(400, 0.012); this.window(this.kitchen, 'vg_nem'); this.say(P3.fates[4]); this.out.setFontSize(26); this.later(3600, () => this.ready()); });
    this.later(1900, () => {});
  }
  kitchen(c) { this.put(c, 70, 112, 'wok', 0, 2.2).setOrigin(0.5, 1).play('wok'); const leo = this.put(c, -80, 118, 'nemleo', 0, 3.6).setOrigin(0.5, 1).play('nemleo'); this.tweens.add({ targets: leo, x: -72, yoyo: true, repeat: -1, duration: 130 }); this.every(420, () => { if (!c.active) return; const n = this.put(c, 40 + Math.random() * 60, 40, 'nem', 0, 2); this.tweens.add({ targets: n, y: -70, angle: 360, yoyo: true, duration: 420, ease: 'Quad.out', onComplete: () => n.destroy() }); if (Math.random() < 0.5) Audio.sfx('pot', { v: 0.35 }); const s = this.put(c, 60 + Math.random() * 40, 20, 'dust', 0, 2).setAlpha(0.6); this.tweens.add({ targets: s, y: -90, alpha: 0, scale: 4, duration: 900, onComplete: () => s.destroy() }); }); const t = txt(this, -80, -92, P3.nemShout, 24, '#c8303c', { st: 5, stroke: '#fff8e8' }); c.add(t); this.tweens.add({ targets: t, scale: 1.15, yoyo: true, repeat: -1, duration: 180 }); }
  exit() { if (this._leaving || this.going) return; this.going = true; this.final.setText(P3.final).setFontSize(30); this.btn.show(false); this.done.show(false); Audio.sfx('achieve'); this.time.delayedCall(2600, () => leave(this, 'Title')); }
}
Oracle.prototype.init = function init() { this.going = false; };
