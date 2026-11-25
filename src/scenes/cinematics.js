import Phaser from 'phaser';
import { INTRO, QUEST1, UI, ENDING } from '../config/text.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { txt, fadeTo, onKey } from '../core/util.js';
import { isOk, onUpdate } from '../core/stability.js';
import { titleScape } from './menus.js';

const W = 960; const H = 540;

// ------------------------------------------------------------------ opening cinematic
export class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }
  create() {
    this._leaving = false; Audio.music(this, 'menu'); this.sc = titleScape(this); const cam = this.cameras.main; cam.fadeIn(800, 20, 14, 30); const leo = this.add.sprite(228, 391, 'leo').setOrigin(0.5, 1).play('leo_run'); leo.anims.timeScale = 0.55; const pack = this.add.sprite(0, 0, 'atlas', 'barrier_books/0').setOrigin(0.5, 1).setScale(0.6).setDepth(-0.1); leo.setDepth(1); onUpdate(this, () => { pack.setPosition(leo.x - 9, leo.y - 4); pack.setFlipX(false); });
    this.tweens.add({ targets: leo, x: 470, duration: 15500, onComplete: () => leo.play('leo_stare') }); cam.setZoom(2.5); cam.centerOn(436, 326); this.tweens.add({ targets: cam, zoom: 2, scrollX: 0, scrollY: 30, duration: 15000, ease: 'Sine.inOut' });
    this.scene.launch('IntroUI'); this.events.once('shutdown', () => this.scene.stop('IntroUI'));
  }
  update(t, dt) { this.sc.update(dt); }
}
export class IntroUI extends Phaser.Scene {
  constructor() { super('IntroUI'); }
  create() {
    this.add.rectangle(W / 2, 0, W, 64, 0x140e20).setOrigin(0.5, 0); this.add.rectangle(W / 2, H, W, 64, 0x140e20).setOrigin(0.5, 1); const t = txt(this, W / 2, 150, '', 36, '#fff6e0', { st: 8, wrap: 860 }); let at = 700; this.done = false;
    INTRO.forEach((l) => { this.time.delayedCall(at, () => { t.setText(l.t).setAlpha(0).setFontSize(l.big ? 72 : 36).setColor(l.big ? '#ffd24a' : '#fff6e0'); this.tweens.add({ targets: t, alpha: 1, duration: 350 }); if (l.big) { Audio.sfx('thud'); this.scene.get('Intro').cameras.main.shake(250, 0.006); } }); at += l.ms; this.time.delayedCall(at - 300, () => this.tweens.add({ targets: t, alpha: 0, duration: 250 })); });
    this.time.delayedCall(at, () => { Audio.sfx('fanfare'); const a = txt(this, W / 2, 190, QUEST1.title, 58, '#ffd24a', { head: true, st: 12 }).setScale(1.6).setAlpha(0); const b = txt(this, W / 2, 252, QUEST1.sub, 32).setAlpha(0); this.tweens.add({ targets: a, alpha: 1, scale: 1, duration: 420, ease: 'Back.out' }); this.tweens.add({ targets: b, alpha: 1, delay: 700, duration: 400 }); }); this.time.delayedCall(at + 3600, () => this.end());
    const sk = txt(this, W - 20, H - 32, UI.skip, 26, '#c8bce0', { ox: 1 }).setInteractive(); sk.on('pointerup', () => this.end()); onKey(this, (e) => { if (isOk(e) || e.code === 'Escape') this.end(); }); this.cameras.main.fadeIn(600, 20, 14, 30);
  }
  end() { if (this.done) return; this.done = true; this.cameras.main.fadeOut(600, 20, 14, 30); fadeTo(this.scene.get('Intro'), 'Level', { level: 1 }, 600); }
}

// ------------------------------------------------------------------ phase 1 ending
export class Ending extends Phaser.Scene {
  constructor() { super('Ending'); }
  create() {
    this._leaving = false; Audio.music(this, 'ending', 1500); const cam = this.cameras.main; const X = 480; const Y = 270;
    // deep landscape, revealed as the camera pulls back
    const sky = this.add.graphics(); { const C = [0x2f2a6a, 0x6a3f8c, 0xc85a88, 0xff9a6a, 0xffd88a, 0xfff2c0].map((c) => Phaser.Display.Color.IntegerToColor(c)); for (let i = 0; i < 48; i++) { const q = (i / 47) * 5; const a = Math.min(4, Math.floor(q)); const m = Phaser.Display.Color.Interpolate.ColorWithColor(C[a], C[a + 1], 100, (q - a) * 100); sky.fillStyle(Phaser.Display.Color.GetColor(m.r, m.g, m.b), 1).fillRect(-160, Y - 300 + i * 9, 1300, 9); } } const far = this.add.tileSprite(X, Y - 70, 1100, 300, 'bg_sunset_far').setTint(0xffe0e8); const far2 = this.add.tileSprite(X, Y - 34, 1100, 300, 'bg_sunset_mid').setTilePosition(200, 0).setTint(0xe8c0d8); this.cl = this.add.tileSprite(X, Y - 120, 1100, 300, 'bg_sunset_clouds'); const mid = this.add.tileSprite(X, Y - 4, 1100, 300, 'bg_sunset_mid'); this.add.image(560, Y + 128, 'fieldscape').setOrigin(0, 1);
    // unexplored fields + trail
    const g = this.add.graphics(); g.fillStyle(0x2f3456, 1).fillRect(-100, Y + 118, 1200, 420); const tiles = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 80, height: 14 }); const ts = tiles.addTilesetImage('campus', 'tiles_campus', 16, 16); const lay = tiles.createBlankLayer('g', ts, -160, Y + 74); for (let x = 0; x < 80; x++) { const top = x < 44 ? 0 : x < 52 ? 1 : x < 60 ? 2 : 3; for (let y = top; y < 14; y++) lay.putTileAt((y === top ? 14 : 15) + 16 * ((x % 2) + 2 * (y % 2)), x, y); } lay.setTint && lay.forEachTile((t) => { t.tint = 0xc890a0; });
    const gy = Y + 74; const pr = (x, y, n, s = 1) => this.add.sprite(x, y, 'atlas', `${n}/0`).setOrigin(0.5, 1).setScale(s).setTint(0xe8b8b0); [['bld_hall', 250, 1], ['bld_a', 90, 1], ['bld_b', 350, 1], ['bld_b', -10, 1.1], ['bld_hall', -100, 1]].forEach(([n, x, s]) => pr(x, gy + 3, n, s)); [[180, 'tree_0'], [390, 'tree_1'], [20, 'tree_2'], [700, 'tree_0'], [790, 'tree_2'], [900, 'tree_1']].forEach(([x, n]) => pr(x, gy + 3 + (x > 600 ? 48 : 0), n).setTint(0xc88a98)); const lamp = pr(330, gy + 2, 'lamp'); this.add.image(lamp.x, lamp.y - 54, 'atlas', 'glow_w/0').setBlendMode('ADD').setAlpha(0.6); this.add.sprite(470, gy + 3, 'atlas', 'mtgate/0').setOrigin(0.5, 1).setTint(0xffd8c8);
    const ra = this.add.sprite(405, gy + 1, 'atlas', 'ra_idle/0').setOrigin(0.5, 1).play('ra_wave'); const leo = this.add.sprite(340, gy + 1, 'leo').setOrigin(0.5, 1).play('leo_run'); leo.anims.timeScale = 0.7; const letter = this.add.sprite(0, 0, 'atlas', 'letter_ok/0').setScale(0.42); const coin = this.add.sprite(0, 0, 'atlas', 'comp_budget/0').setScale(0.42); onUpdate(this, () => { letter.setPosition(leo.x + 12, leo.y - 11); coin.setPosition(leo.x - 12, leo.y - 14); });
    cam.setZoom(2.6); cam.centerOn(410, gy - 50); cam.fadeIn(1200, 20, 14, 30); this.tweens.add({ targets: leo, x: 560, duration: 14000, onUpdate: () => { leo.y = gy + 1 + (leo.x > 546 ? 16 : 0); } }); this.tweens.add({ targets: cam, scrollX: cam.scrollX + 110, duration: 14000, ease: 'Sine.inOut' }); this.time.delayedCall(14000, () => leo.play('leo_stare')); void sky; void far; void far2; void mid; void ra;
    this.pull = () => { this.tweens.add({ targets: cam, zoom: 1.02, scrollX: 0, scrollY: -50, duration: 9000, ease: 'Sine.inOut' }); }; this.scene.launch('EndingUI'); this.events.once('shutdown', () => this.scene.stop('EndingUI'));
  }
  update(t, dt) { this.cl.tilePositionX += dt * 0.006; }
}
export class EndingUI extends Phaser.Scene {
  constructor() { super('EndingUI'); }
  create() {
    this.add.rectangle(W / 2, 0, W, 60, 0x140e20).setOrigin(0.5, 0); this.add.rectangle(W / 2, H, W, 60, 0x140e20).setOrigin(0.5, 1); const t = txt(this, W / 2, 130, '', 36, '#fff6e0', { st: 8, wrap: 860 }); let at = 1800; const end = this.scene.get('Ending');
    ENDING.lines.forEach((l) => { if (l === null) { at += 1300; return; } this.time.delayedCall(at, () => { t.setText(l).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 400 }); }); at += 2900; this.time.delayedCall(at - 350, () => this.tweens.add({ targets: t, alpha: 0, duration: 300 })); }); at += 200; this.time.delayedCall(at, () => { t.setText(ENDING.bro).setAlpha(1).setFontSize(120).setColor('#ffd24a'); Audio.sfx('thud'); end.cameras.main.shake(300, 0.008); }); at += 1800; this.time.delayedCall(at, () => { this.tweens.add({ targets: t, alpha: 0, duration: 300 }); end.pull(); }); at += 7000; this.time.delayedCall(at, () => this.card()); this.finished = false;
    Save.d.phase1 = true; Save.d.mapAt = 5; Save.save(); const sk = txt(this, W - 20, H - 30, UI.skip, 26, '#c8bce0', { ox: 1 }).setInteractive(); sk.on('pointerup', () => this.card()); this.sk = sk; onKey(this, (e) => { if (e.key === 'Escape') this.card(); else if (this.ok && isOk(e)) this.out(); }); this.input.on('pointerdown', () => this.ok && this.out());
  }
  card() { if (this.finished) return; this.finished = true; this.time.removeAllEvents(); this.sk.setVisible(false); Audio.sfx('achieve'); this.add.rectangle(W / 2, H / 2, W, H, 0x140e20, 0.55); const a = txt(this, W / 2, 110, ENDING.card[0], 76, '#ffd24a', { head: true, st: 12 }).setScale(1.5); this.tweens.add({ targets: a, scale: 1, duration: 450, ease: 'Back.out' }); txt(this, W / 2, 172, ENDING.card[1], 38, '#fff6e0', { head: true }); ENDING.stats.forEach((s, i) => { const l = txt(this, W / 2, 232 + i * 38, s, 30).setAlpha(0); this.time.delayedCall(700 + i * 600, () => { Audio.sfx('tick'); this.tweens.add({ targets: l, alpha: 1, duration: 250 }); }); }); this.time.delayedCall(3500, () => { const n = txt(this, W / 2, 412, ENDING.next[0], 36, '#8ff0c0', { head: true }).setAlpha(0); const m = txt(this, W / 2, 452, ENDING.next[1], 28).setAlpha(0); this.tweens.add({ targets: [n, m], alpha: 1, duration: 500 }); Audio.sfx('checkpoint'); }); this.time.delayedCall(5000, () => { this.ok = true; txt(this, W / 2, H - 28, '▸', 30); }); }
  out() { if (this.gone) return; this.gone = true; this.cameras.main.fadeOut(600, 20, 14, 30); fadeTo(this.scene.get('Ending'), 'Map', { from: 5 }, 600); }
}
EndingUI.prototype.init = function init() { this.gone = false; this.ok = false; this.finished = false; };
