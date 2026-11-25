import Phaser from 'phaser';
import { P2, UI } from '../config/text.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { txt, fadeTo, onKey } from '../core/util.js';

const W = 960; const H = 540;

// ------------------------------------------------------------------ phase 2 ending: the ridge
export class Ending2 extends Phaser.Scene {
  constructor() { super('Ending2'); }
  create() {
    this._leaving = false; Audio.music(this, 'ending', 1200); const cam = this.cameras.main; this.add.image(0, 0, 'vista').setOrigin(0, 0); this.cl = this.add.tileSprite(480, 230, 960, 300, 'bg_field_clouds').setAlpha(0.55); this.cl2 = this.add.tileSprite(480, 110, 960, 150, 'clouds_big').setAlpha(0.35);
    const leo = this.add.sprite(512, 267, 'leo').setOrigin(0.5, 1).setScale(0.75).play('leo_run').setDepth(3); leo.anims.timeScale = 0.6; const th = this.add.image(0, 0, 'atlas', 'thesis/0').setScale(0.34).setDepth(4); this.events.on('update', () => th.setPosition(leo.x + 8, leo.y - 9 + Math.abs(Math.sin(leo.x / 5)) * -1.5));
    this.tweens.add({ targets: leo, x: 600, duration: 7000, onComplete: () => leo.play('leo_stare') });
    for (let i = 0; i < 5; i++) { const b = this.add.sprite(300 - i * 26, 200 + (i % 3) * 14, 'atlas', 'bird/0').play({ key: 'bird', startFrame: i % 4 }).setScale(0.6); this.tweens.add({ targets: b, x: b.x + 760, y: b.y - 70, duration: 30000 + i * 900 }); }
    cam.setZoom(4.2); cam.setBounds(0, 0, 960, 540); cam.centerOn(550, 246); cam.fadeIn(1200, 20, 14, 30); this.tweens.add({ targets: cam, scrollX: cam.scrollX + 45, duration: 7000, ease: 'Sine.inOut' });
    this.leo = leo; this.scene.launch('Ending2UI'); this.events.once('shutdown', () => this.scene.stop('Ending2UI'));
  }
  pull() { const c = this.cameras.main; const s = { z: c.zoom, x: c.midPoint.x, y: c.midPoint.y }; this.tweens.add({ targets: s, z: 1, duration: 9000, ease: 'Sine.inOut', onUpdate: () => { const k = (4.2 - s.z) / 3.2; c.setZoom(s.z); c.centerOn(s.x + (480 - s.x) * k, s.y + (270 - s.y) * k); } }); this.tweens.add({ targets: s, y: 270, duration: 9000 }); this.time.delayedCall(6500, () => this.leo.play('leo_celebrate')); }
  update(t, dt) { this.cl.tilePositionX += dt * 0.006; this.cl2.tilePositionX += dt * 0.004; }
}
export class Ending2UI extends Phaser.Scene {
  constructor() { super('Ending2UI'); }
  init() { this.gone = false; this.ok = false; this.finished = false; }
  create() {
    const sc = this.scene.get('Ending2'); const bars = [this.add.rectangle(W / 2, 0, W, 52, 0x140e20).setOrigin(0.5, 0), this.add.rectangle(W / 2, H, W, 52, 0x140e20).setOrigin(0.5, 1)]; const t = txt(this, W / 2, 118, '', 34, '#fff6e0', { st: 8, wrap: 860 }); let at = 1600;
    P2.endLines.forEach((l, i) => { this.time.delayedCall(at, () => { t.setText(l).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 400 }); if (i === 1) { sc.pull(); this.tweens.add({ targets: bars, scaleY: 0, delay: 5000, duration: 2500 }); } }); at += i ? 5000 : 4600; this.time.delayedCall(at - 350, () => this.tweens.add({ targets: t, alpha: 0, duration: 300 })); });
    this.time.delayedCall(at + 3600, () => this.card()); Save.d.phase2 = true; Save.d.mapAt = 6; Save.save();
    this.sk = txt(this, W - 20, H - 27, UI.skip, 26, '#c8bce0', { ox: 1 }).setInteractive(); this.sk.on('pointerup', () => this.card()); onKey(this, (e) => { if (e.key === 'Escape') this.card(); else if (this.ok && ['Enter', ' ', 'x'].includes(e.key)) this.out(); }); this.input.on('pointerdown', () => this.ok && this.out());
  }
  card() {
    if (this.finished) return; this.finished = true; this.time.removeAllEvents(); this.sk.setVisible(false); Audio.sfx('achieve'); this.add.rectangle(W / 2, H / 2, W, H, 0x140e20, 0.45); const [a, b, c] = P2.endCard; const s = txt(this, W / 2, 140, a, 84, '#ffd24a', { head: true, st: 14 }).setScale(1.6); this.tweens.add({ targets: s, scale: 1, duration: 450, ease: 'Back.out' });
    [b, c].forEach((l, i) => { const q = txt(this, W / 2, 238 + i * 48, l, 36, '#fff6e0', { st: 7 }).setAlpha(0); this.time.delayedCall(900 + i * 900, () => { Audio.sfx('tick'); this.tweens.add({ targets: q, alpha: 1, duration: 250 }); }); });
    this.time.delayedCall(3200, () => { const n = txt(this, W / 2, 378, P2.endNext, 44, '#8ff0c0', { head: true, st: 8 }).setAlpha(0); this.tweens.add({ targets: n, alpha: 1, duration: 600 }); Audio.sfx('checkpoint'); }); this.time.delayedCall(4600, () => { this.ok = true; txt(this, W / 2, H - 27, '▸', 30); });
  }
  out() { if (this.gone) return; this.gone = true; this.cameras.main.fadeOut(600, 20, 14, 30); fadeTo(this.scene.get('Ending2'), 'Map', { from: 6 }, 600); }
}
