import Phaser from 'phaser';
import { TITLE, UI, LEVELS, FUTURE, P_MUSIC as PM, P3 } from '../config/text.js';
import { Save } from '../core/Save.js';
import { Audio, SFX } from '../core/Audio.js';
import { txt, panel, makeAnims, fadeTo, clamp, onKey } from '../core/util.js';
import { isOk, onScene, freshState } from '../core/stability.js';
import { THEMES } from '../levels/Builder.js';
import { LEVEL_DEFS } from '../levels/index.js';

const W = 960; const H = 540;
const THEMES_BG = ['campus', 'library', 'water', 'garden', 'archive', 'tower', 'treasury', 'office', 'sunset', 'field', 'manuscript'];

// ------------------------------------------------------------------ boot
export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.failed = []; this.load.on('loaderror', (f) => { if (f.type !== 'audio') this.failed.push(f.key); }); const t = this.add.text(W / 2, H / 2, 'Brewing coffee...', { fontFamily: 'VT323, monospace', fontSize: '30px', color: '#fff0c0' }).setOrigin(0.5); this.load.on('progress', (p) => t.setText(`Brewing coffee... ${Math.round(p * 100)}%`));
    const A = 'assets/art/'; this.load.atlas('atlas', `${A}atlas.png`, `${A}atlas.json`); this.load.json('atlasmeta', `${A}atlas.json`); this.load.json('leoSheet', 'assets/characters/leo.json'); this.load.spritesheet('leo', 'assets/characters/leo.png', { frameWidth: 32, frameHeight: 36 });
    THEMES.forEach((n) => this.load.image(`tiles_${n}`, `${A}tiles_${n}.png`));
    const layers = { campus: ['sky', 'far', 'clouds', 'mid', 'near'], tower: ['sky', 'far', 'clouds', 'mid', 'near'], field: ['sky', 'far', 'clouds', 'mid', 'near'], sunset: ['sky', 'far', 'clouds', 'mid', 'near'] }; THEMES_BG.forEach((n) => (layers[n] || ['sky', 'far', 'mid', 'near']).forEach((l) => this.load.image(`bg_${n}_${l}`, `${A}bg_${n}_${l}.png`)));
    ['title_mountain', 'title_town', 'worldmap', 'notebook', 'clouds_big', 'fieldscape', 'vista', 'horizon'].forEach((n) => this.load.image(n, `${A}${n}.png`)); SFX.forEach((s) => this.load.audio(`s_${s}`, `assets/audio/sfx/${s}.mp3`)); this.load.audio('m_menu', 'assets/audio/music/menu.mp3');
  }
  async create() {
    if (this.failed.length) { this.add.text(W / 2, H / 2, 'The coffee spilled (connection problem).\nTap or press any key to try again.', { fontFamily: 'VT323, monospace', fontSize: '30px', color: '#fff0c0', align: 'center' }).setOrigin(0.5); const again = () => this.scene.restart(); this.input.once('pointerdown', again); this.input.keyboard.once('keydown', again); return; }
    makeAnims(this); Audio.init(this.game);
    try { await Promise.race([Promise.all(['400 24px VT323', '700 40px Handjet'].map((f) => document.fonts.load(f, 'LÉO ĐỈNH CÙNG ĐỐC TỜ ễ'))), new Promise((r) => setTimeout(r, 2500))]); } catch { /* fallback font */ }
    const q = new URLSearchParams(location.search); if (q.get('level')) this.scene.start('Level', { level: +q.get('level') }); else if (q.get('scene')) this.scene.start(q.get('scene')); else this.scene.start('Title');
  }
}

/** Open the device file picker and import the chosen MP3. done(message, isProblem, isPlaying). Must run inside a click or key press. */
function pickMp3(start, done) {
  document.getElementById('leo-song')?.remove(); const el = document.createElement('input'); el.type = 'file'; el.accept = '.mp3,audio/mpeg,audio/mp3'; el.id = 'leo-song'; el.style.display = 'none'; document.body.appendChild(el);
  el.onchange = () => { const f = el.files[0]; el.remove(); if (!f) return; start(); Audio.choose(f).then((ok) => done(ok ? PM.saved : PM.unsaved, !ok, true), (e) => done(Object.values(PM).includes(e.message) ? e.message : PM.failed, true, false)); }; el.click();
}

/** Keyboard + pointer vertical menu. */
class Menu {
  constructor(scene, x, y, items, o = {}) {
    this.s = scene; this.items = items.filter(Boolean); this.i = this.items.findIndex((t) => !t.off); this.enabled = true; const gap = o.gap || 54;
    this.rows = this.items.map((it, k) => { const mx = it.x ?? x; const my = it.y ?? y + k * gap; const p = panel(scene, mx, my, it.w || o.w || 340, o.h || 46, 'panel_btn'); const t = txt(scene, mx, my - 3, it.label, 30, it.off ? '#7a7494' : '#fff6e0', { st: 4 }); if (it.off) p.setAlpha(0.55); p.setInteractive({ useHandCursor: !it.off }); p.on('pointerover', () => { if (!it.off && this.enabled) { this.i = k; this.draw(); } }); p.on('pointerup', () => { if (this.enabled && !it.off) { this.i = k; this.draw(); this.go(); } }); return { p, t }; });
    const kb = scene.input.keyboard; const mv = (d) => { if (!this.enabled) return; let n = this.i; for (let g = 0; g < this.items.length; g++) { n = (n + d + this.items.length) % this.items.length; if (!this.items[n].off) break; } if (n !== this.i) { this.i = n; Audio.sfx('move'); this.draw(); } };
    this.h = (e) => { if (!this.enabled || !scene.scene.isActive()) return; if (['ArrowUp', 'KeyW'].includes(e.code)) mv(-1); else if (['ArrowDown', 'KeyS'].includes(e.code)) mv(1); else if (['ArrowLeft', 'KeyA'].includes(e.code)) this.side(-1); else if (['ArrowRight', 'KeyD'].includes(e.code)) this.side(1); else if (isOk(e)) this.go(); };
    const bound = onKey(scene, this.h); scene.events.once('shutdown', () => kb.off('keydown', bound)); this.draw();
  }
  side(d) { const it = this.items[this.i]; it.side && it.side(d); }
  go() { const it = this.items[this.i]; if (!it || it.off) return; Audio.sfx('ok'); it.go && it.go(); }
  draw() { this.rows.forEach(({ p, t }, k) => { const on = k === this.i && !this.items[k].off; p.setFrame(on ? 'panel_hot/0' : 'panel_btn/0'); t.setScale(on ? 1.06 : 1); if (!this.items[k].off) t.setColor(on ? '#fff0a0' : '#fff6e0'); }); }
  label(k, s) { this.rows[k].t.setText(s); }
  hide(v = true) { this.enabled = !v; this.rows.forEach(({ p, t }) => { p.setVisible(!v); t.setVisible(!v); }); }
}

export function titleScape(s) { // returns update(dt); zoom-2 world 480x270 centred at 480,270
  const cam = s.cameras.main; cam.setZoom(2); const x0 = 240; const y0 = 135; const sky = s.add.image(480, 270, 'bg_campus_sky').setDisplaySize(490, 300).setFlipX(true); s.add.rectangle(480, 440, 700, 90, 0x16402f); const mt = s.add.image(x0, y0 - 14, 'title_mountain').setOrigin(0, 0); const c1 = s.add.tileSprite(480, y0 + 46, 480, 110, 'clouds_big').setTilePosition(0, 0).setAlpha(0.95); const c2 = s.add.tileSprite(480, y0 + 20, 480, 130, 'bg_campus_clouds').setAlpha(0.8); const town = s.add.image(x0, y0 - 26, 'title_town').setOrigin(0, 0); const wind = [];
  for (let i = 0; i < 16; i++) { const g = s.add.image(x0 + 20 + ((i * 89) % 440), y0 + 170 + ((i * 37) % 60), 'atlas', 'glow_w/0').setBlendMode('ADD').setScale(0.28).setAlpha(0.3); s.tweens.add({ targets: g, alpha: 0.08, yoyo: true, repeat: -1, duration: 900 + i * 130 }); wind.push(g); }
  const birds = []; for (let i = 0; i < 6; i++) { const b = s.add.sprite(x0 - 60 - i * 22, y0 + 60 + ((i * 31) % 50), 'atlas', 'bird/0').play({ key: 'bird', startFrame: i % 4 }).setScale(0.8); b.v = 16 + (i % 3) * 4; birds.push(b); }
  return { sky, mt, town, c1, c2, update(dt) { c1.tilePositionX += dt * 0.006; c2.tilePositionX += dt * 0.011; birds.forEach((b) => { b.x += (b.v * dt) / 1000; b.y += Math.sin(b.x / 18) * 0.12; if (b.x > x0 + 520) b.x = x0 - 40; }); } };
}

export class Title extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    this._leaving = false; Audio.music(this, 'menu'); this.sc = titleScape(this); const leo = this.add.sprite(556, 384, 'leo').setOrigin(0.5, 1).play('leo_idle'); this.time.addEvent({ delay: 5200, loop: true, callback: () => { const a = Phaser.Utils.Array.GetRandom(['glasses', 'coffee', 'stare', 'email']); leo.play(`leo_${a}`); this.time.delayedCall(3000, () => leo.play('leo_idle')); } });
    this.scene.launch('TitleUI'); this.events.once('shutdown', () => this.scene.stop('TitleUI')); this.cameras.main.fadeIn(600, 20, 14, 30);
  }
  update(t, dt) { this.sc.update(dt); }
}
export class TitleUI extends Phaser.Scene {
  constructor() { super('TitleUI'); }
  create() {
    const t1 = txt(this, W / 2, 84, TITLE.line1, 82, '#fff6d8', { head: true, st: 14, stroke: '#3a2148' }); const t2 = txt(this, W / 2, 168, TITLE.line2, 94, '#ffd24a', { head: true, st: 16, stroke: '#5a1f2a' }); [t1, t2].forEach((t, i) => { t.setShadow(0, 7, '#1c1428', 0, true, false); const y = t.y; t.y = -90; this.tweens.add({ targets: t, y, duration: 900, delay: 200 + i * 220, ease: 'Bounce.out', onComplete: () => this.tweens.add({ targets: t, y: y - 5, yoyo: true, repeat: -1, duration: 1700, delay: i * 300, ease: 'Sine.inOut' }) }); });
    const sub = txt(this, W / 2, 238, TITLE.sub, 30, '#ffffff', { st: 6 }).setAlpha(0); this.tweens.add({ targets: sub, alpha: 1, delay: 1400, duration: 500 });
    const go = (k, d) => { this.menu.enabled = false; const t = this.scene.get('Title'); fadeTo(t, k, d, 500); this.cameras.main.fadeOut(500, 20, 14, 30); };
    const start = () => (Audio.ready && !Audio.theme ? this.askSong(begin) : begin()); /* never wait on a music download */ const begin = () => { if (this.begun) return; this.begun = true; Save.reset(); Save.d.started = true; Save.save(); go('Intro'); }; const prog = Save.hasProgress(); const cv = Object.keys(Save.d.ach).length > 0;
    this.menu = new Menu(this, 250, 304, [{ label: TITLE.start, go: () => (prog ? this.confirm(start) : start()) }, { label: TITLE.cont, off: !prog, go: () => (Save.d.run && Save.d.run.cp ? go('Level', { level: Save.d.run.level }) : go('Map')) }, { label: TITLE.cv, off: !cv, go: () => go('CV', { back: 'Title' }) }, { label: TITLE.settings, go: () => { this.menu.enabled = false; this.scene.launch('Settings', { back: 'TitleUI' }); this.scene.bringToTop('Settings'); } }, { label: PM.title, go: () => { this.hint.setText(''); pickMp3(() => this.hint.setText(PM.loading), (m, bad) => { if (!this.sys.isActive()) return; this.hint.setText(m).setColor(bad ? '#ffb0a8' : '#c8ffd8'); this.songLabel(); }); } }, ...(Save.d.complete ? [{ label: P3.menuLetter, x: 806, y: 400, w: 276, go: () => go('Letter', { again: true }) }, { label: P3.menuOracle, x: 806, y: 447, w: 276, go: () => go('Oracle') }] : [])], { gap: 47, h: 42 }); this.songLabel(); Audio.loading.then(() => this.sys.isActive() && this.songLabel()); if (prog) { this.menu.i = 1; this.menu.draw(); }
    onScene(this, 'resumeMenu', () => { if (this.scene.isActive()) { this.menu.enabled = true; this.songLabel(); } }); this.hint = txt(this, W - 12, H - 16, TITLE.hint, 20, '#e8f0ff', { ox: 1 }); this.cameras.main.fadeIn(600, 20, 14, 30);
  }
  songLabel() { this.menu.label(4, Audio.customName ? PM.titleMine : PM.title); }
  /** Before the first level: offer to import a soundtrack. */
  askSong(begin) {
    this.menu.hide(); const els = [panel(this, W / 2, 392, 760, 238, 'panel_dark'), txt(this, W / 2, 306, PM.ask, 34, '#fff0a0'), txt(this, W / 2, 342, PM.askSub, 24)]; const msg = txt(this, W / 2, 490, '', 22, '#c8ffd8'); els.push(msg); let busy = false;
    const m = new Menu(this, W / 2, 392, [{ label: PM.askPick, go: () => { if (busy) return; pickMp3(() => { busy = true; msg.setText(PM.loading).setColor('#c8ffd8'); }, (s, bad, playing) => { busy = false; if (!this.sys.isActive()) return; msg.setText(s).setColor(bad ? '#ffb0a8' : '#c8ffd8'); if (playing) { m.enabled = false; this.time.delayedCall(1200, begin); } }); } }, { label: PM.askSkip, go: () => { if (busy) return; m.enabled = false; begin(); } }], { gap: 52 }); m.enabled = false; this.time.delayedCall(150, () => { m.enabled = true; });
  }
  confirm(yes) { this.menu.hide(); const els = [panel(this, W / 2, 372, 720, 190, 'panel_dark'), txt(this, W / 2, 316, TITLE.confirmNew, 28)]; const m = new Menu(this, W / 2, 372, [{ label: TITLE.no, go: () => { m.hide(); els.forEach((e) => e.destroy()); this.menu.hide(false); } }, { label: TITLE.yes, go: () => { m.hide(); els.forEach((e) => e.destroy()); yes(); } }], { gap: 52 }); m.enabled = false; this.time.delayedCall(150, () => { m.enabled = true; }); }
}

// ------------------------------------------------------------------ world map
const NODES = [[58, 226], [136, 196], [212, 208], [278, 164], [352, 146], [428, 112], [446, 54]]; const FN = []; const LAST = NODES.length; // last playable level
export class Map_ extends Phaser.Scene {
  constructor() { super('Map'); }
  init(d) { freshState(this); this.from = d && d.from; }
  create() {
    this._leaving = false; Audio.music(this, 'map'); this.add.image(0, 0, 'worldmap').setOrigin(0, 0).setScale(2); this.clouds = this.add.tileSprite(W / 2, 60, W, 260, 'clouds_big').setAlpha(0.55).setTileScale(2); this.add.tileSprite(W / 2, 10, W, 120, 'clouds_big').setTileScale(2).setAlpha(0.95);
    const S = (p) => [p[0] * 2, p[1] * 2]; this.S = S; this.nodes = NODES.map((p, i) => { const [x, y] = S(p); const id = i + 1; const st = Save.d.done[id] ? 'node_done' : id <= Save.d.unlocked ? 'node_open' : 'node_lock'; const n = this.add.sprite(x, y, 'atlas', `${st}/0`).setScale(2).setInteractive({ useHandCursor: true }); n.on('pointerup', () => this.pickNode(i)); if (Save.d.done[id]) this.add.sprite(x + 18, y - 4, 'atlas', 'flag/0').setScale(1.6).setOrigin(0.2, 1); if (st === 'node_open') this.tweens.add({ targets: n, scale: 2.2, yoyo: true, repeat: -1, duration: 600 }); return n; });
    FN.forEach((p, i) => { const [x, y] = S(p); const n = this.add.sprite(x, y, 'atlas', 'node_lock/0').setScale(2).setInteractive(); if (Save.d.phase2) n.setTint(0xffd0a0); n.on('pointerup', () => this.pickNode(LAST + i)); this.add.sprite(x, y - 14, 'atlas', 'icon_locked/0').setScale(0.8); });
    this.add.rectangle(W / 2, H - 46, W, 92, 0x1c1428, 0.82); this.nameT = txt(this, W / 2, H - 64, '', 40, '#fff0a0', { head: true }); this.subT = txt(this, W / 2, H - 26, '', 24, '#e0d8f0'); this.leo = this.add.sprite(0, 0, 'leo').setOrigin(0.5, 1).setScale(2).play('leo_idle').setDepth(5); this.sh = this.add.ellipse(0, 0, 30, 8, 0x1c1428, 0.4).setDepth(4);
    this.at = clamp((this.from || Save.d.mapAt || 1) - 1, 0, LAST - 1); this.place(this.at); this.busy = false; this.info();
    const bt = (x, l, f) => { const p = panel(this, x, 34, 176, 44, 'panel_btn').setInteractive({ useHandCursor: true }); txt(this, x, 31, l, 26); p.on('pointerup', () => { Audio.sfx('ok'); f(); }); }; bt(104, UI.cv, () => fadeTo(this, 'CV', { back: 'Map' })); bt(292, UI.title, () => fadeTo(this, 'Title')); bt(480, UI.settings, () => { this.scene.launch('Settings', { back: 'Map' }); this.scene.bringToTop('Settings'); this.busy = true; }); onScene(this, 'resumeMenu', () => { this.busy = false; });
    onKey(this, (e) => { if (this.busy) return; if (['ArrowRight', 'ArrowUp', 'KeyD', 'KeyW'].includes(e.code)) this.step(1); else if (['ArrowLeft', 'ArrowDown', 'KeyA', 'KeyS'].includes(e.code)) this.step(-1); else if (isOk(e)) this.enter(); else if (e.code === 'KeyC') fadeTo(this, 'CV', { back: 'Map' }); else if (e.key === 'Escape') fadeTo(this, 'Title'); });
    this.cameras.main.fadeIn(500, 20, 14, 30); if (this.from && this.from < LAST && Save.d.unlocked > this.from) { this.busy = true; this.time.delayedCall(700, () => { if (this._leaving) return; Audio.sfx('checkpoint'); const n = this.nodes[this.from]; for (let i = 0; i < 8; i++) { const s = this.add.sprite(n.x, n.y, 'atlas', 'star/0').setScale(1.4); const a = i * 0.785; this.tweens.add({ targets: s, x: n.x + Math.cos(a) * 60, y: n.y + Math.sin(a) * 40, alpha: 0, duration: 800, onComplete: () => s.destroy() }); } this.busy = false; this.step(1); }); }
  }
  place(i) { const [x, y] = this.S(NODES[i]); this.leo.setPosition(x, y); this.sh.setPosition(x, y); }
  info(i = this.at) { if (!LEVELS[i] && !FUTURE[i - LAST]) return; const l = i < LAST ? LEVELS[i] : FUTURE[i - LAST]; const open = i < LAST && i + 1 <= Save.d.unlocked; this.nameT.setText(i < LAST ? `${l.id}. ${l.name}` : l.name); this.subT.setText(i >= LAST ? (Save.d.phase2 ? l.soon : l.locked) : open ? `${l.sub}   ·   ${UI.mapHint}` : l.locked || 'Locked. Finish the previous existential crisis first.'); }
  step(d) { const n = this.at + d; if (this.busy || n < 0) return; if (n >= LAST || n + 1 > Save.d.unlocked) { Audio.sfx('error', { v: 0.5 }); if (n < LAST) this.info(n); return; } this.walk(n); }
  walk(n, done) { this.busy = true; const [x, y] = this.S(NODES[n]); this.leo.setFlipX(x < this.leo.x).play('leo_run'); Audio.sfx('step'); this.tweens.add({ targets: [this.leo, this.sh], x, y, duration: 750, ease: 'Sine.inOut', onComplete: () => { this.busy = false; this.at = n; Save.d.mapAt = n + 1; Save.save(); this.leo.play('leo_idle').setFlipX(false); this.info(); done && done(); } }); }
  pickNode(i) { if (this.busy) return; if (i >= LAST || i + 1 > Save.d.unlocked) { Audio.sfx('error', { v: 0.5 }); this.info(i); return; } if (i === this.at) this.enter(); else this.walk(i); }
  enter() { if (this.busy || this._leaving || !LEVEL_DEFS[this.at + 1]) return; Audio.sfx('ok'); this.leo.play('leo_celebrate'); fadeTo(this, 'Level', { level: this.at + 1 }, 500); }
  update(t, dt) { this.clouds.tilePositionX += dt * 0.008; }
}

// ------------------------------------------------------------------ settings + pause
export class Settings extends Phaser.Scene {
  constructor() { super('Settings'); }
  init(d) { freshState(this); this.back = d.back; }
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x140e20, 0.8).setInteractive(); panel(this, W / 2, H / 2, 640, 440); txt(this, W / 2, 92, UI.settings, 48, '#fff0a0'); const S = Save.settings; const bar = (v) => `${'▮'.repeat(Math.round(v * 10))}${'▯'.repeat(10 - Math.round(v * 10))}`; const pct = (v) => `${Math.round(v * 100)}%`; void bar;
    const lab = () => [`${UI.music}:  ◂ ${pct(S.music)} ▸`, `${UI.sfx}:  ◂ ${pct(S.sfx)} ▸`, `${UI.touch}:  ${UI[S.touch]}`, UI.full, short(Audio.customName ? PM.mine(Audio.customName) : PM.pick), PM.reset, UI.back]; const short = (t) => (t.length > 40 ? `${t.slice(0, 39)}…` : t); const upd = () => { lab().forEach((l, i) => this.menu.label(i, l)); Audio.refresh(); Save.save(); }; const vol = (k) => (d) => { S[k] = clamp(Math.round((S[k] + d * 0.1) * 10) / 10, 0, 1); upd(); Audio.sfx('coffee'); }; const cyc = (k) => () => { S[k] = S[k] >= 0.99 ? 0 : Math.round((S[k] + 0.1) * 10) / 10; upd(); Audio.sfx('coffee'); };
    const l = lab(); this.menu = new Menu(this, W / 2, 138, [{ label: l[0], go: cyc('music'), side: vol('music') }, { label: l[1], go: cyc('sfx'), side: vol('sfx') }, { label: l[2], go: () => { S.touch = { auto: 'on', on: 'off', off: 'auto' }[S.touch]; upd(); } }, { label: l[3], go: () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); } }, { label: l[4], go: () => this.pickSong() }, { label: l[5], go: () => this.resetSong() }, { label: l[6], go: () => this.close() }], { w: 500, gap: 43, h: 40 }); this.upd = upd; this.showReset(); this.msg = txt(this, W / 2, 427, '', 22, '#8ff0c0', { wrap: 600 }); txt(this, W / 2, 458, UI.controls, 18, '#c8bce0'); onKey(this, (e) => e.key === 'Escape' && this.close());
  }
  showReset() { const i = 5; const on = !!Audio.customName; this.menu.items[i].off = !on; const { p, t } = this.menu.rows[i]; p.setAlpha(on ? 1 : 0.4); t.setAlpha(on ? 1 : 0.4); if (!on && this.menu.i === i) this.menu.i = 4; this.menu.draw(); }
  say(s, bad) { if (this.msg && this.msg.active) this.msg.setText(s).setColor(bad ? '#ff9a8a' : '#8ff0c0'); }
  done(s, bad) { this.busySong = false; if (!this.sys.isActive()) return; this.upd(); this.showReset(); this.say(s, bad); }
  pickSong() { if (this.busySong) return; pickMp3(() => { this.busySong = true; this.say(PM.loading); }, (m, bad) => this.done(m, bad)); }
  resetSong() { if (this.busySong) return; this.busySong = true; this.say(PM.loading); Audio.unchoose().then(() => this.done(PM.back), () => this.done(PM.failed, true)); }
  close() { if (this.closed) return; this.closed = true; const b = this.scene.get(this.back); this.scene.stop(); setTimeout(() => { if (b.menu) b.menu.enabled = true; b.events.emit('resumeMenu'); }, 120); }
}
export class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }
  init(d) { freshState(this); this.level = d.level; }
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x140e20, 0.72).setInteractive(); txt(this, W / 2, 90, UI.paused, 64, '#fff0a0', { head: true, st: 10 }); txt(this, W / 2, 140, UI.pausedSub, 26, '#d8d0e8'); const L = this.scene.get('Level'); const out = (f) => { Audio.duck(false); this.scene.stop(); this.scene.stop('HUD'); f(); };
    this.menu = new Menu(this, W / 2, 204, [{ label: UI.resume, go: () => this.resume() }, { label: UI.restart, go: () => out(() => { Save.clearRun(); this.scene.stop('Level'); this.scene.start('Level', { level: this.level }); }) }, { label: UI.cv, go: () => { this.menu.enabled = false; this.scene.sleep(); this.scene.launch('CV', { back: 'Pause' }); this.scene.bringToTop('CV'); } }, { label: UI.settings, go: () => { this.menu.enabled = false; this.scene.launch('Settings', { back: 'Pause' }); this.scene.bringToTop('Settings'); } }, { label: UI.map, go: () => out(() => { this.scene.stop('Level'); this.scene.start('Map'); }) }, { label: UI.unstick, go: () => out(() => { Save.save(); this.scene.stop('Level'); this.scene.start('Level', { level: this.level }); }) }], { gap: 52 }); this.time.delayedCall(150, () => onKey(this, (e) => e.key === 'Escape' && this.menu.enabled && this.resume())); void L;
  }
  resume() { if (this.gone) return; this.gone = true; Audio.sfx('close'); Audio.duck(false); this.scene.stop(); this.scene.resume('Level'); this.scene.resume('HUD'); }
}
