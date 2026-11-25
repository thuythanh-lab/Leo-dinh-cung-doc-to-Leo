import Phaser from 'phaser';
import { ASSISTANT } from '../config/balance.js';
import { NAMES, UI, FICTION_NOTE } from '../config/text.js';
import { byId } from '../config/achievements.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { Controls as C } from '../core/Input.js';
import { txt, panel, isTouch, onKey } from '../core/util.js';

const W = 960; const H = 540;

/** Screen-space UI over a level: hearts, coffee, assistant timer, toasts, dialogue, achievements, touch controls. */
export default class HUD extends Phaser.Scene {
  constructor() { super('HUD'); }
  init(d) { this.L = d.level; }
  create() {
    this.talking = false; this.ready = true; this.q = []; this.aq = []; this.showing = false; this.achShowing = false; this.pending = this.pending || [];
    this.hearts = [0, 1, 2].map((i) => this.add.sprite(34 + i * 42, 34, 'atlas', 'heart/0').setScale(3));
    this.cup = this.add.sprite(34, 78, 'atlas', 'hud_coffee/0').setScale(2); this.cupT = txt(this, 56, 76, '0', 28, '#fff6e0', { ox: 0 });
    this.raIcon = this.add.sprite(190, 48, 'atlas', 'hud_ra/0').setScale(2.2); this.raG = this.add.graphics(); this.raT = txt(this, 190, 94, '', 22, '#c8ffd8'); this.raKey = txt(this, 214, 70, 'E', 20, '#fff0a0');
    this.itemIcons = this.L.hudItems.map(([f, n], i) => ({ f, s: this.add.sprite(W / 2 - (this.L.hudItems.length - 1) * 26 + i * 52, 34, 'atlas', `${n}/0`).setScale(1.7) }));
    this.promptT = txt(this, 0, 0, '', 24, '#fff0a0').setVisible(false);
    this.bang = this.add.sprite(0, 0, 'atlas', 'arrowdn/0').setScale(2).setVisible(false);
    this.makeTouch(); this.makeTop(); this.refresh();
    this.input.addPointer(3);
    const p = this.pending; this.pending = []; p.forEach((f) => f());
    onKey(this, (e) => { if (this.talking && ['Enter', ' ', 'x', 'j', 'z', 'X', 'J', 'Z'].includes(e.key) && !e.repeat) this.advance(); if (this.onKey && ['Enter', ' ', 'x', 'j'].includes(e.key)) this.onKey(); });
    this.input.on('pointerdown', () => { if (this.talking) this.advance(); else if (this.onKey) this.onKey(); });
    this.scale.on('resize', this.layoutTouch, this); this.events.once('shutdown', () => { this.scale.off('resize', this.layoutTouch, this); this.ready = false; this.talking = false; });
  }
  later(f) { if (this.ready && this.hearts) return f(); (this.pending = this.pending || []).push(f); }
  refresh() {
    if (!this.ready || !this.hearts || !this.L.player) return; const h = this.L.player.hearts; this.hearts.forEach((s, i) => { const f = `heart/${i < h ? 0 : 1}`; if (s.frame.name !== f) { s.setFrame(f); this.tweens.add({ targets: s, scale: { from: 4.2, to: 3 }, duration: 220 }); } });
    const c = `${Save.d.stats.coffee}`; if (this.cupT.text !== c) { this.cupT.setText(c); this.tweens.add({ targets: this.cup, scale: { from: 2.6, to: 2 }, duration: 160 }); }
    const ra = Save.d.assistant; [this.raIcon, this.raT].forEach((o) => o.setVisible(ra)); this.raKey.setVisible(ra && !this.touchOn); this.itemIcons.forEach(({ f, s }) => { const on = this.L.flag(f); if (on && s.tintTopLeft !== 0xffffff) this.tweens.add({ targets: s, scale: { from: 2.6, to: 1.7 }, duration: 300 }); on ? s.clearTint().setAlpha(1) : s.setTintFill(0xd8d0f0).setAlpha(0.28); });
    if (this.btn && this.btn.assist) this.btn.assist.setVisible(ra && this.touchOn);
  }
  tick() {
    const a = this.L.assistant; if (!this.ready || !a || !this.raG) return; this.raG.clear(); if (Save.d.assistant) {
      const on = a.active; const k = on ? a.left / ASSISTANT.durationMs : a.cd > 0 ? 1 - a.cd / ASSISTANT.cooldownMs : 1; this.raIcon.setTint(on || a.cd <= 0 ? 0xffffff : 0x70708a); this.raG.lineStyle(6, on ? 0x8ff0c0 : a.cd > 0 ? 0x8070b8 : 0xf0c44c, 1); this.raG.beginPath(); this.raG.arc(190, 48, 37, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k, false); this.raG.strokePath();
      this.raT.setText(on ? (a.left / 1000).toFixed(1) : a.cd > 0 ? `${Math.ceil(a.cd / 1000)}s` : '').setColor(on ? '#c8ffd8' : '#b0a8c8'); if (on) this.raIcon.setScale(2.2 + Math.sin(a.left / 90) * 0.08);
    }
  }
  toScreen(x, y) { const v = this.L.cameras.main; return { x: (x - v.worldView.x) * v.zoom, y: (y - v.worldView.y) * v.zoom }; }
  prompt(t) { if (!this.ready || !this.bang) return; if (!t) { this.bang.setVisible(false); this.promptT.setVisible(false); return; } const p = this.toScreen(t.x, t.y - t.height - 8); this.bang.setVisible(true).setPosition(p.x, p.y + Math.sin(this.time.now / 160) * 4); this.promptT.setVisible(!this.touchOn).setPosition(p.x, p.y - 28).setText('X'); }

  // ---------------------------------------------------------------- toasts & banners
  toast(s, o = {}) { this.later(() => { if (this.q.length > 3) this.q.shift(); this.q.push({ s, o }); this.nextToast(); }); }
  nextToast() {
    if (this.showing || !this.q.length) return; this.showing = true; const { s, o } = this.q.shift(); const els = [];
    if (o.title) els.push(txt(this, W / 2, 118, o.title, 38, o.color || '#ff9a8a', { head: true, st: 6 }));
    els.push(txt(this, W / 2, o.title ? 154 : 128, s, 30, o.title ? '#fff6e0' : o.color || '#fff0c0', { wrap: 820, st: 6 })); const c = this.add.container(0, 0, els).setAlpha(0); c.y = -16;
    this.tweens.add({ targets: c, alpha: 1, y: 0, duration: 200, ease: 'Back.out' }); this.tweens.add({ targets: c, alpha: 0, y: -10, delay: o.ms || 1500 + s.length * 22, duration: 260, onComplete: () => { c.destroy(); this.showing = false; this.nextToast(); } });
  }
  banner(a, b, o = {}) { this.later(() => { const bar = this.add.rectangle(W / 2, H / 2 - 60, W, 124, 0x1c1428, 0.72).setScale(1, 0); const t = txt(this, W / 2, H / 2 - 80, a, 52, o.color || '#fff0a0', { head: true, st: 8 }).setAlpha(0); const s = txt(this, W / 2, H / 2 - 32, b, 26, '#e8dcf8').setAlpha(0); this.tweens.add({ targets: bar, scaleY: 1, duration: 260 }); this.tweens.add({ targets: [t, s], alpha: 1, x: { from: W / 2 - 40, to: W / 2 }, duration: 420, ease: 'Quad.out' }); this.tweens.add({ targets: [t, s, bar], alpha: 0, delay: o.ms || 2400, duration: 420, onComplete: () => [t, s, bar].forEach((q) => q.destroy()) }); }); }
  big(lines, o = {}) { // centred ceremony text
    const out = []; let d = 0; lines.forEach((l, i) => { const t = txt(this, W / 2, (o.y || 170) + i * (i === 0 ? 0 : 44) + (i ? 24 : 0), l, i === 0 ? o.size || 62 : 32, i === 0 ? o.color || '#fff0a0' : '#fff6e0', { head: i === 0, st: i === 0 ? 10 : 6 }).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, scale: { from: i ? 1 : 1.7, to: 1 }, delay: d, duration: 320, ease: 'Back.out' }); if (i) this.time.delayedCall(d, () => Audio.sfx('tick')); d += i === 0 ? 650 : 520; out.push(t); });
    const ms = o.ms || d + 1700; this.tweens.add({ targets: out, alpha: 0, delay: ms, duration: 400, onComplete: () => { out.forEach((t) => t.destroy()); o.done && o.done(); } });
  }
  white(ms = 600, color = 0xfff6d0) { const r = this.add.rectangle(W / 2, H / 2, W, H, color, 1); this.tweens.add({ targets: r, alpha: 0, duration: ms, onComplete: () => r.destroy() }); }
  death(a, b) { this.dd = [this.add.rectangle(W / 2, H / 2, W, H, 0x1c1428, 0.66).setAlpha(0), txt(this, W / 2, H / 2 - 24, a, 58, '#ff9a8a', { head: true, st: 8 }).setScale(1.6), txt(this, W / 2, H / 2 + 34, b, 26, '#d8d0e8')]; this.tweens.add({ targets: this.dd[0], alpha: 1, duration: 300 }); this.tweens.add({ targets: this.dd[1], scale: 1, duration: 260, ease: 'Back.out' }); }
  deathEnd() { (this.dd || []).forEach((d) => d.destroy()); this.dd = null; }
  complete(clean, done) {
    const bar = this.add.rectangle(W / 2, 210, W, 180, 0x1c1428, 0.75).setScale(1, 0); this.tweens.add({ targets: bar, scaleY: 1, duration: 250 }); const t = txt(this, W / 2, 176, UI.complete, 70, '#fff0a0', { head: true, st: 10 }).setScale(0); this.tweens.add({ targets: t, scale: 1, duration: 420, ease: 'Back.out' }); txt(this, W / 2, 234, `${this.L.def.name}${clean ? '   ·   no sanity lost (suspicious)' : ''}`, 28); const n = txt(this, W / 2, 276, '', 22, '#c8bce0');
    let ok = false; const go = () => { if (!ok || this.gone2) return; if (this.achShowing || this.aq.length) return; this.gone2 = true; this.onKey = null; done(); }; this.time.delayedCall(1500, () => { ok = true; n.setText('▸ press jump / tap'); this.onKey = go; }); this.gone2 = false;
    this.time.addEvent({ delay: 500, loop: true, callback: () => { if (ok && this.time.now > this.autoAt) go(); } }); this.autoAt = this.time.now + 6500;
  }

  // ---------------------------------------------------------------- achievements
  achievement(id) { this.later(() => { this.aq.push(id); this.nextAch(); }); }
  nextAch() {
    if (this.achShowing || !this.aq.length) return; const a = byId[this.aq.shift()]; this.achShowing = true; const main = a.main; const w = main ? 640 : 480; const h = main ? 130 : 96; const x = W / 2; const y = H - (main ? 110 : 80);
    const c = this.add.container(x, H + 120).setDepth(50); const p = panel(this, 0, 0, w, h, main ? 'panel_hot' : 'panel_dark'); const ic = this.add.sprite(-w / 2 + (main ? 74 : 56), 0, 'atlas', `icon_${a.icon}/0`).setScale(main ? 2.6 : 2);
    const l = -w / 2 + (main ? 136 : 106); const t0 = txt(this, l, main ? -40 : -30, 'ACHIEVEMENT UNLOCKED', main ? 20 : 18, '#fff0a0', { ox: 0 }); const t1 = txt(this, l, main ? -8 : -4, a.head || a.title, main ? (a.head && a.head.length > 30 ? 28 : 32) : 26, '#ffffff', { ox: 0, head: true, st: 5 }); const t2 = txt(this, l, main ? 30 : 26, a.sub, main ? 25 : 21, '#ffe0f0', { ox: 0 }); c.add([p, ic, t0, t1, t2]); const maxW = w - (main ? 160 : 124); [t1, t2].forEach((q) => { if (q.width > maxW) q.setScale(maxW / q.width); });
    Audio.sfx(main ? 'achieve' : 'secret');
    if (main) { const rays = this.add.graphics(); for (let i = 0; i < 12; i++) { const q = (i * Math.PI) / 6; rays.fillStyle(0xfff0a0, 0.2); rays.fillTriangle(0, 0, Math.cos(q) * 130, Math.sin(q) * 130, Math.cos(q + 0.22) * 130, Math.sin(q + 0.22) * 130); } rays.setPosition(ic.x, 0); c.addAt(rays, 1); this.tweens.add({ targets: rays, angle: 360, duration: 9000, repeat: -1 }); }
    this.tweens.add({ targets: c, y, duration: 420, ease: 'Back.out' }); ic.setScale(0); this.tweens.add({ targets: ic, scale: main ? 2.6 : 2, angle: { from: -180, to: 0 }, delay: 260, duration: 480, ease: 'Back.out' });
    this.time.delayedCall(500, () => { for (let i = 0; i < 14; i++) { const s = this.add.sprite(x + ic.x, y, 'atlas', 'star/0').setScale(1.5).setDepth(51); const q = Math.random() * 6.28; this.tweens.add({ targets: s, x: s.x + Math.cos(q) * 130, y: s.y + Math.sin(q) * 90, alpha: 0, angle: 200, duration: 700, onComplete: () => s.destroy() }); } });
    this.tweens.add({ targets: c, y: H + 130, delay: main ? 3300 : 2600, duration: 360, ease: 'Quad.in', onComplete: () => { c.destroy(true); this.achShowing = false; this.nextAch(); } });
  }

  // ---------------------------------------------------------------- dialogue
  say(lines, done) { this.later(() => { this.lines = lines.slice(); this.sayDone = done; this.talking = true; if (!this.box) { this.box = this.add.container(W / 2, H - 92).setDepth(40); const p = panel(this, 0, 0, 800, 140, 'panel_paper'); this.pf = panel(this, -324, 0, 104, 104, 'panel_dark'); this.face = this.add.sprite(-324, 0, 'atlas', 'face_leo/0').setScale(3.6); this.nameT = txt(this, -254, -44, '', 24, '#8f3848', { ox: 0, st: 0, head: true }); this.sayT = txt(this, -254, -24, '', 28, '#3a2418', { ox: 0, oy: 0, align: 'left', st: 0, wrap: 620, ls: -4 }); this.arrow = this.add.sprite(368, 48, 'atlas', 'arrowdn/0').setScale(1.6); this.noteT = txt(this, 384, 80, FICTION_NOTE, 16, '#e8dcc8', { ox: 1 }); this.box.add([p, this.pf, this.face, this.nameT, this.sayT, this.arrow, this.noteT]); } this.box.setVisible(true).setScale(1, 0.1); this.tweens.add({ targets: this.box, scaleY: 1, duration: 160 }); Audio.sfx('bookopen', { v: 0.5 }); this.line(); }); }
  line() { const [who, s] = this.lines.shift(); this.face.play(`face_${who}`); this.nameT.setText(NAMES[who] || who); this.noteT.setVisible(['margreet', 'donna', 'star'].includes(who)); this.full = s; this.n = 0; this.sayT.setText(''); this.arrow.setVisible(false); clearInterval(this.ty); this.lineAt = this.time.now; this.tyEv && this.tyEv.remove(); this.tyEv = this.time.addEvent({ delay: 24, repeat: s.length - 1, callback: () => { this.n++; this.sayT.setText(s.slice(0, this.n)); if (this.n % 2) Audio.sfx('text'); if (this.n >= s.length) this.arrow.setVisible(true); } }); }
  advance() { if (!this.talking || this.time.now - this.lineAt < 120) return; if (this.n < this.full.length) { this.tyEv.remove(); this.n = this.full.length; this.sayT.setText(this.full); this.arrow.setVisible(true); return; } if (this.lines.length) { Audio.sfx('page', { v: 0.4 }); this.line(); } else { this.talking = false; this.box.setVisible(false); Audio.sfx('bookclose', { v: 0.4 }); C.clear(); const d = this.sayDone; this.sayDone = null; d && d(); } }

  // ---------------------------------------------------------------- top-right + touch
  makeTop() {
    const b = this.add.sprite(W - 36, 36, 'atlas', 'btn_pause/0').setScale(1.05).setInteractive().setAlpha(0.85); b.on('pointerdown', (p, x, y, e) => { e.stopPropagation(); this.L.pause(); });
    const f = this.add.sprite(W - 92, 36, 'atlas', 'btn_full/0').setScale(1.05).setInteractive().setAlpha(0.85); f.on('pointerup', () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); });
  }
  makeTouch() {
    const m = Save.settings.touch; this.touchOn = m === 'on' || (m === 'auto' && isTouch()); this.btn = {};
    const defs = { left: ['btn_left', 74, H - 74, 'left'], right: ['btn_right', 188, H - 74, 'right'], down: ['btn_down', 131, H - 30, 'down'], up: ['btn_up', 131, H - 120, 'up'], jump: ['btn_jump', W - 76, H - 76, 'jump'], cast: ['btn_cast', W - 186, H - 60, 'cast'], assist: ['btn_ra', W - 96, H - 186, 'assist'] };
    this.holds = {};
    for (const [k, [n, x, y]] of Object.entries(defs)) { const s = this.add.sprite(x, y, 'atlas', `${n}/0`).setScale(k === 'up' || k === 'down' ? 1.35 : k === 'jump' ? 2.2 : 1.9).setAlpha(0.72).setInteractive({ useHandCursor: false }).setVisible(this.touchOn).setDepth(30); s.input.hitArea.setTo(-8, -8, s.width + 16, s.height + 16); this.btn[k] = s; }
    const upd = () => { // supports sliding a thumb between buttons
      if (!this.touchOn) return; const on = {}; for (const p of this.input.manager.pointers) { if (!p.isDown) continue; for (const [k, s] of Object.entries(this.btn)) { if (!s.visible) continue; const r = (s.displayWidth / 2) * 1.18; if (Math.hypot(p.x - s.x, p.y - s.y) < r) on[k] = true; } }
      for (const k of Object.keys(this.btn)) { C.touch[k] = !!on[k]; this.btn[k].setAlpha(on[k] ? 1 : 0.72); } if (on.up) C.touch.up = true;
    };
    this.events.on('update', upd);
  }
  layoutTouch() {}
}
