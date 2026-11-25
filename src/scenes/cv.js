import Phaser from 'phaser';
import { UI } from '../config/text.js';
import { ACHIEVEMENTS, FUTURE_SLOTS } from '../config/achievements.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { txt, panel, fadeTo, onKey } from '../core/util.js';

const W = 960; const H = 540;

// ------------------------------------------------------------------ Academic CV
export class CV extends Phaser.Scene {
  constructor() { super('CV'); }
  init(d) { this.back = (d && d.back) || 'Title'; }
  create() {
    this._leaving = false; this.add.image(0, 0, 'notebook').setOrigin(0, 0).setScale(2); const ink = '#4a2c22'; const O = { st: 0, ox: 0 }; txt(this, 108, 52, UI.cvTitle, 40, '#8f3848', { ...O, head: true }); txt(this, 108, 84, `${UI.cvName} · ${UI.cvHint}`, 19, ink, O); txt(this, 512, 52, UI.cvSecret, 32, '#2f6b6b', { ...O, head: true });
    const main = ACHIEVEMENTS.filter((a) => a.main); const sec = ACHIEVEMENTS.filter((a) => !a.main); this.cells = []; const cell = (a, x, y, big) => { const on = Save.has(a.id); const s = this.add.sprite(x, y, 'atlas', on ? `icon_${a.icon}/0` : 'icon_locked/0').setScale(big ? 1.15 : 1.35).setInteractive({ useHandCursor: true }); if (!on) s.setAlpha(0.75); const t = txt(this, x + 36, y - 11, on ? a.title : big ? a.title : UI.cvLocked, 23, on ? ink : '#b09a78', O); const u = txt(this, x + 36, y + 11, on ? a.sub : big ? UI.cvLocked : a.hint, 19, on ? '#8a6a4a' : '#b09a78', O); [t, u].forEach((q) => { const mx = big ? 300 : 366; if (q.width > mx) q.setScale(mx / q.width); }); const k = this.cells.length; this.cells.push({ a, s, on }); s.on('pointerover', () => this.sel(k)); s.on('pointerup', () => { this.sel(k); if (on) this.stamp(s); }); if (on && big) { const st = this.add.image(x + 326, y + 10, 'atlas', 'ink_app/0').setScale(0.36).setAngle(-8).setAlpha(0.8); st.setScale(1.2).setAlpha(0); this.tweens.add({ targets: st, scale: 0.3, alpha: 0.75, delay: 200 + k * 130, duration: 180, ease: 'Quad.in', onComplete: () => Audio.sfx('book', { v: 0.4 }) }); } };
    main.forEach((a, i) => cell(a, 122, 124 + i * 42, true)); sec.forEach((a, i) => cell(a, 536, 102 + i * 46, false)); for (let i = 0; i < FUTURE_SLOTS; i++) this.add.sprite(536 + i * 52, 434, 'atlas', 'icon_locked/0').setScale(1.1).setAlpha(0.45); txt(this, 744, 434, UI.cvFuture, 16, '#b09a78', O); this.note = txt(this, 512, 474, '', 22, '#2f5a80', { ...O, wrap: 330, align: 'left' });
    const b = panel(this, W / 2, H - 22, 150, 38, 'panel_btn').setInteractive({ useHandCursor: true }); txt(this, W / 2, H - 25, UI.back, 24); b.on('pointerup', () => this.leave()); this.k = 0; this.box = this.add.rectangle(0, 0, 58, 58).setStrokeStyle(3, 0xc8484f); this.sel(0, true); this.add.sprite(884, 120, 'leo').setScale(2).play('leo_glasses').setVisible(false);
   
    onKey(this, (e) => { const n = this.cells.length; if (e.key === 'ArrowDown') this.sel((this.k + 1) % n); else if (e.key === 'ArrowUp') this.sel((this.k + n - 1) % n); else if (e.key === 'ArrowRight') this.sel(Math.min(n - 1, this.k < main.length ? this.k + main.length : this.k)); else if (e.key === 'ArrowLeft') this.sel(this.k >= main.length ? this.k - main.length : this.k); else if (['Enter', ' ', 'x'].includes(e.key)) { const c = this.cells[this.k]; if (c.on) this.stamp(c.s); } else if (e.key === 'Escape' || e.key === 'Backspace') this.leave(); }); Audio.sfx('bookopen'); this.cameras.main.fadeIn(350, 20, 14, 30);
  }
  sel(k, q) { if (k === this.k && !q) return; this.k = k; const c = this.cells[k]; this.box.setPosition(c.s.x, c.s.y); this.note.setText(c.on ? `✎ ${c.a.note || c.a.sub}` : `✎ ${c.a.hint || 'Not yet earned. Keep climbing.'}`); if (!q) Audio.sfx('page', { v: 0.3 }); }
  stamp(s) { Audio.sfx('coffee'); this.tweens.add({ targets: s, scale: { from: 2, to: s.scale }, angle: { from: -20, to: 0 }, duration: 350, ease: 'Back.out' }); }
  leave() { Audio.sfx('bookclose'); if (this.back === 'Pause') { this.scene.stop(); this.scene.wake('Pause'); const p = this.scene.get('Pause'); p.menu.enabled = true; } else fadeTo(this, this.back); }
}
