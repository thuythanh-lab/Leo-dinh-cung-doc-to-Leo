import Phaser from 'phaser';
import { VIEW, PLAYER as P } from '../config/balance.js';
import { DEATH, DEATH_SUB, TOAST, BIG } from '../config/text.js';
import { Save } from '../core/Save.js';
import { Audio } from '../core/Audio.js';
import { Controls as C } from '../core/Input.js';
import { T, backdrop, pick, wtxt, fadeTo, onKey } from '../core/util.js';
import Builder from '../levels/Builder.js';
import { LEVEL_DEFS } from '../levels/index.js';
import Player from '../entities/Player.js';
import Assistant from '../entities/Assistant.js';
import Fx from '../entities/fx.js';
import { Plat } from '../entities/platforms.js';

export default class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(d) { this.levelId = d.level || 1; this._leaving = false; }

  create() {
    const def = LEVEL_DEFS[this.levelId]; this.def = def;
    Object.assign(this, { ents: [], enemies: [], hittable: [], interacts: [], machines: [], stress: [], bolts: [], triggers: [], clock: 0, cinematic: false, teleporting: false, combo: 0, interactTarget: null, hudItems: def.hudItems || [], waters: [], script: null, deadUntil: 0, zone: null, bg: null, killBelow: null, amb: null, onOneWay: false, hazMsg: 0, finished: false, shade: null, stopped: false, run: null, cp: null, lm: -9e9, bossTick: null, killBelowFn: null, raHint: null });
    const resumed = Save.d.run && Save.d.run.level === this.levelId && Save.d.run.cp; this.run = Save.startRun(this.levelId);
    this.physics.world.timeScale = 1; this.physics.world.resume();
    this.fx = new Fx(this); this.platGroup = this.physics.add.group({ allowGravity: false, immovable: true }); this.solids = this.physics.add.staticGroup();
    this.b = new Builder(this, def.w, def.h); def.tiles(this.b, this); Object.assign(this, this.b.make());
    this.player = new Player(this, def.spawn.x * T, def.spawn.y * T); this.assistant = new Assistant(this);
    this.physics.world.setBounds(0, 0, def.w * T, def.h * T + 400);
    this.physics.add.collider(this.player, this.layer, (p, t) => this.onTile(p, t), (p, t) => !(t.kind === 'oneway' && (p.drop > 0 || p.climbing)) && t.kind !== 'haz');
    this.physics.add.collider(this.player, this.solids, (p, z) => { if (z.belt && p.body.touching.down) p.belt = z.belt.v; });
    this.physics.add.collider(this.player, this.platGroup, (p, s) => this.onPlat(p, s), (p, s) => this.platOk(p, s));
    // camera
    const cam = this.cameras.main; cam.setZoom(VIEW.zoom); cam.setRoundPixels(true); cam.startFollow(this.player, true, 0.14, 0.12); cam.setDeadzone(26, 34); this.look = 0;
    // hud first: entities may talk to it
    if (this.scene.isActive('HUD')) this.scene.stop('HUD');
    this.scene.launch('HUD', { level: this }); this.hud = this.scene.get('HUD');
    C.bind(this);
    def.build(this.b, this);
    if (resumed) { this.player.setPosition(this.run.cp.x, this.run.cp.y); const m = this.machines.find((q) => Math.abs(q.x - this.run.cp.x) < 4 && Math.abs(q.y - this.run.cp.y) < 4); m && m.activate(true); this.time.delayedCall(700, () => this.toast(TOAST.resume)); }
    this.player.safe = { x: this.player.x, y: this.player.y }; this.cp = this.run.cp || { x: this.player.x, y: this.player.y };
    this.enterZone(true); cam.centerOn(this.player.x, this.player.y); cam.fadeIn(450, 20, 14, 30);
    onKey(this, (e) => { if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') this.pause(); });
    this.game.events.on('hidden', this.autoPause, this); this.events.once('shutdown', () => this.game.events.off('hidden', this.autoPause, this));
    if (!resumed) this.time.delayedCall(300, () => this.hud.banner(def.name, def.sub));
    if (import.meta.env.DEV || location.search.includes('debug')) window.__L = this;
  }
  autoPause() { if (this.scene.isActive() && !this.cinematic && !location.search.includes('debug')) this.pause(); }
  pause() { if (this.finished || !this.scene.isActive() || this.hud.talking) return; Audio.sfx('open'); Audio.duck(true); C.clear(); this.scene.pause(); this.scene.pause('HUD'); this.scene.launch('Pause', { level: this.levelId }); this.scene.bringToTop('Pause'); }

  // ---------------------------------------------------------------- loop
  update(time, delta) {
    const full = Math.min(delta, 100); C.update(); const n = Math.max(1, Math.ceil(full / 17)); const sub = full / n;
    // deterministic sub-steps: movement feels identical at 20, 60 or 144 fps
    for (let i = 0; i < n; i++) { if (!this.stopped) { this.physics.world.update(time, sub); this.physics.world.postUpdate(); } this.step(sub); C.press = {}; }
    this.bg && this.bg.update(full, this.cameras.main.scrollX, this.ratioY());
    // camera look-ahead
    const pl = this.player; const want = pl.locked ? 0 : -pl.face * 34 * Math.min(1, Math.abs(pl.body.velocity.x) / 100); this.look += (want - this.look) * 0.03; this.cameras.main.setFollowOffset(Math.round(this.look), 46);
    this.hud.tick(full);
  }
  step(dt) {
    this.clock += dt; const p = this.player;
    // prompt target
    this.interactTarget = null; if (!this.cinematic) { let bd = 1e9; for (const i of this.interacts) { if (i.dead || !i.can()) continue; const dx = Math.abs(i.x - p.x); const dy = p.y - i.y; if (dx < i.range + 4 && dy > -44 && dy < 20 && dx < bd) { bd = dx; this.interactTarget = i; } } }
    this.hud.prompt(this.interactTarget);
    p.update(dt); this.onOneWay = false;
    if (!this.cinematic) this.assistant.update(dt);
    for (const e of this.ents) if (!e.dead || e.vx !== undefined) e.update(dt);
    if ((this.cleanT = (this.cleanT || 0) + dt) > 1000) { this.cleanT = 0; const keep = (e) => !(e.dead && !e.respawn) && !e.gone; this.ents = this.ents.filter(keep); this.hittable = this.hittable.filter(keep); this.interacts = this.interacts.filter((e) => !e.dead); }
    this.updateBolts(dt); this.updateWater(dt);
    if (p.alive && !this.teleporting) {
      const b = p.body; const t = this.layer.getTileAtWorldXY(p.x, b.bottom - 4);
      if (t && t.kind === 'haz' && p.hurt()) { if (this.clock - this.hazMsg > 9000) { this.hazMsg = this.clock; this.toast(TOAST.hazard); } if (p.hearts > 0) this.time.delayedCall(260, () => p.alive && this.toSafe()); }
      const z = this.zone; if (z && p.y > (z.y + z.h) * T + 26) this.pit();
      else if (this.killBelow && p.y > this.killBelow) { this.toast(TOAST.tower); this.toSafe(); }
      for (const tr of this.triggers) if (!tr.done && p.floor && p.x > tr.x && p.x < tr.x + tr.w && p.y > tr.y && p.y <= tr.y + tr.h) { tr.done = tr.once; tr.fn(); }
    }
    if (this.script) this.script(dt);
  }
  ratioY() { const z = this.zone; if (!z || z.h * T <= 270) return 1; return Phaser.Math.Clamp((this.cameras.main.worldView.y - z.y * T) / (z.h * T - 270), 0, 1); }

  // ---------------------------------------------------------------- collisions
  onTile(p, t) {
    if (t.kind === 'oneway') this.onOneWay = true;
    if ((t.kind === 'break' || t.kind === 'book') && p.body.blocked.up && t.pixelY + 8 < p.body.y) this.breakTile(t);
  }
  breakTile(t) { if (!t || (t.kind !== 'break' && t.kind !== 'book')) return; const x = t.pixelX + 8; const y = t.pixelY + 8; this.layer.removeTileAt(t.x, t.y); this.fx.burst('brick', x, y, 6, 110); this.fx.burst('bit', x, y, 3, 90); Audio.sfx('break'); if (Math.random() < 0.3 && t.kind === 'break') { const c = this.add.sprite(x, y, 'atlas', 'coffee/0').setDepth(12); this.tweens.add({ targets: c, y: y - 24, alpha: 0, duration: 500, onComplete: () => c.destroy() }); Save.d.stats.coffee++; Audio.sfx('coffee'); if (Save.d.stats.coffee >= 30) this.unlock('caffeine'); this.hud.refresh(); } }
  platOk(p, s) { if (!s.solid) return false; if (s.solidAll) return true; if (p.drop > 0 || p.climbing) return false; return p.body.velocity.y >= s.body.velocity.y - 60 && p.body.prev.y + p.body.height <= s.body.prev.y + 8 + Math.abs(s.body.velocity.y) / 40; }
  onPlat(p, s) { if (p.body.touching.down || p.body.bottom <= s.body.y + 4) { p.ride = s; p.belt = s.body.velocity.x; s.touched(); this.onOneWay = !s.solidAll; } }
  tileAt(x, y) { return this.layer.getTileAtWorldXY(x, y); }
  solidAt(x, y, any) { const t = this.tileAt(x, y); return !!t && (t.kind === 'solid' || t.kind === 'break' || t.kind === 'book' || (any && t.kind === 'oneway')); }
  isSafe(x, y) { for (const o of [-9, 0, 9]) { const t = this.tileAt(x + o, y + 5); if (!t || t.kind === 'haz' || t.kind === 'break') return false; } for (const o of [-20, 20]) { const t = this.tileAt(x + o, y - 4); if (t && t.kind === 'haz') return false; } return true; }
  ladderAt(x, y) { const t = this.lad.getTileAtWorldXY(x, y); return t ? { x: t.pixelX + 8 } : null; }
  near(x, y, r) { return Math.abs(this.player.x - x) < r * 1.4 && Math.abs(this.player.y - y) < r; }

  // ---------------------------------------------------------------- water
  addWater(o) { // {x,y,w,h tiles, level px getter}
    const x = o.x * T; const w = o.w * T; const bottom = (o.y + o.h) * T; const body = this.add.tileSprite(x, 0, w, 10, 'atlas', 'glow_c/0').setVisible(false);
    const g = this.add.rectangle(x, 0, w, 10, 0x2f8fd0, 0.42).setOrigin(0, 0).setDepth(22); const g2 = this.add.rectangle(x, 0, w, 10, 0x0f3f78, 0.22).setOrigin(0, 0).setDepth(22); const top = this.add.group(); for (let i = 0; i < o.w; i += 2) top.add(this.add.sprite(x + i * T, 0, 'atlas', 'watertop/0').setOrigin(0, 0.4).setDepth(23).play('watertop')); body.destroy();
    const W = { ...o, px: o.level * T, want: o.level * T, g, g2, top, bottom, x, w, y0: o.y * T }; this.waters.push(W); return W;
  }
  updateWater(dt) { for (const W of this.waters) { const d = W.want - W.px; W.px += Math.sign(d) * Math.min(Math.abs(d), (dt / 1000) * 46); const h = Math.max(2, W.bottom - W.px); W.g.y = W.px; W.g.setSize(W.w, h); W.g2.y = W.px + 26; W.g2.setSize(W.w, Math.max(1, h - 26)); W.top.getChildren().forEach((s) => { s.y = W.px; }); } }
  waterAt(x, y) { for (const W of this.waters) if (x > W.x && x < W.x + W.w && y > W.px && y < W.bottom) return W.px; return null; }
  waterLevelPx() { return this.waters[0] ? this.waters[0].px : 0; }

  // ---------------------------------------------------------------- magic pen
  spawnBolt(x, y, dir) { const s = this.add.sprite(x, y, 'atlas', 'bolt/0').setDepth(24).setFlipX(dir < 0).setBlendMode('ADD'); s.play('bolt'); this.bolts.push({ s, dir, left: P.boltRange }); this.fx.spark(x, y); }
  updateBolts(dt) {
    for (const b of this.bolts) {
      const d = (P.boltSpeed * dt) / 1000; b.s.x += b.dir * d; b.left -= d; let boom = b.left <= 0;
      const r = new Phaser.Geom.Rectangle(b.s.x - 6, b.s.y - 6, 12, 12);
      for (const h of this.hittable) { if (h.dead || boom) continue; const q = h.body && h.body.enable !== false && h.body.width ? h.body : h.getBounds(); if (r.x < q.right && r.right > q.x && r.y < q.bottom && r.bottom > q.y) { h.hit(1, 'pen'); if (h.survived && h.dead) h.survived(); boom = true; } }
      const t = this.tileAt(b.s.x, b.s.y); if (t && !boom) { if (t.kind === 'break') this.breakTile(t); if (t.kind !== 'oneway' && t.kind !== 'haz') boom = true; }
      for (const e of this.ents) if (e.glimpse && Math.hypot(e.x - b.s.x, e.y - b.s.y) < 70) e.glimpse();
      if (boom) { b.dead = true; this.fx.spark(b.s.x, b.s.y); b.s.destroy(); }
    }
    this.bolts = this.bolts.filter((b) => !b.dead);
  }

  // ---------------------------------------------------------------- zones / travel
  enterZone(instant) {
    const p = this.player; const z = this.b.zoneAt(Math.floor(p.x / T), Math.floor((p.y - 8) / T)) || this.b.zones[0]; if (z === this.zone) return; this.zone = z;
    const cam = this.cameras.main; const vw = VIEW.width / VIEW.zoom; const vh = VIEW.height / VIEW.zoom; let { x, y, w, h } = z; x *= T; y *= T; w *= T; h *= T; if (w < vw) { x -= (vw - w) / 2; w = vw; } if (h < vh) { y -= (vh - h) / 2; h = vh; } cam.setBounds(x, y, w, h);
    const th = z.bg || z.theme; if (!this.bg || this.bg.theme !== th) { this.bg && this.bg.destroy(); this.bg = backdrop(this, th); this.bg.theme = th; }
    if (this.amb) this.amb.destroy(); this.amb = this.fx.ambient(z.theme, z);
    if (z.shade) { if (!this.shade) this.shade = this.add.rectangle(480, 270, 500, 300, 0, 0).setScrollFactor(0).setDepth(25); this.shade.setFillStyle(z.shade[0], z.shade[1]); } else if (this.shade) this.shade.setFillStyle(0, 0);
    if (z.music !== undefined) Audio.music(this, z.music, instant ? 500 : 900);
    z.onEnter && z.onEnter();
  }
  teleport(tx, ty, done, ms = 260) {
    if (this.teleporting) return; this.teleporting = true; const p = this.player; p.locked = true; const cam = this.cameras.main; cam.fadeOut(ms, 20, 14, 30);
    this.time.delayedCall(ms + 30, () => { p.body.reset(tx * T, ty * T); p.safe = { x: p.x, y: p.y }; p.ride = null; this.enterZone(); cam.centerOn(p.x, p.y); if (this.assistant.s) this.assistant.s.setPosition(p.x, p.y); cam.fadeIn(ms, 20, 14, 30); this.teleporting = false; p.locked = this.cinematic; done && done(); });
  }
  trigger(x, y, w, h, fn, once = true) { this.triggers.push({ x: x * T, y: y * T, w: w * T, h: h * T, fn, once }); }
  setCheckpoint(x, y) { this.cp = { x, y }; this.run.cp = { x, y }; Save.save(); }
  flag(k) { return !!this.run.flags[k]; }
  setFlag(k, v = true) { this.run.flags[k] = v; Save.save(); this.hud.refresh(); }
  get tookDamage() { return this.flag('hurt'); }
  set tookDamage(v) { if (v && this.run && !this.run.flags.hurt) this.setFlag('hurt'); }

  // ---------------------------------------------------------------- failure
  toSafe() { const p = this.player; const cam = this.cameras.main; cam.flash(180, 20, 14, 30); p.body.reset(p.safe.x, p.safe.y); p.stun = 0; p.climbing = false; p.inv = Math.max(p.inv, 900); cam.centerOn(p.x, p.y); }
  pit() { const p = this.player; if (!p.alive) return; if (this.zone.deadly === false) { this.toSafe(); return; } p.hearts--; this.tookDamage = true; Audio.sfx('hurt'); this.hud.refresh(); if (p.hearts <= 0) this.cooked(); else { this.toSafe(); p.inv = P.invulnMs; } }
  cooked() {
    const p = this.player; if (!p.alive) return; p.alive = false; p.body.setVelocity(0, -240); p.body.setAllowGravity(true); p.body.setGravityY(700); p.body.checkCollision.none = true; p.play('leo_hurt', true); p.setDepth(60); Audio.sfx('cooked'); Audio.duck(true); Save.d.stats.cooked++; Save.save(); this.assistant.left = Math.min(this.assistant.left, 1);
    this.hud.death(pick(DEATH), DEATH_SUB);
    this.time.delayedCall(1900, () => { this.hud.deathEnd(); this.respawn(); });
  }
  respawn() {
    const p = this.player; Audio.duck(false); p.alive = true; p.hearts = P.hearts; p.stun = 0; p.inv = 900; p.stressT = 0; p.climbing = false; p.slideT = 0; p.setHeight2(25); p.setDepth(20); p.body.checkCollision.none = false; p.body.setAllowGravity(false); p.body.setGravityY(0); p.body.reset(this.cp.x, this.cp.y); p.safe = { ...this.cp }; p.setAngle(0);
    this.enemies.forEach((e) => { if (e.o.boss || e.vx !== undefined) { e.gone = true; e.dead = true; e.setVisible(false); if (e.body) e.body.enable = false; } else e.respawn(); }); this.stress.forEach((s) => s.reset()); this.enterZone(); this.cameras.main.centerOn(p.x, p.y); this.cameras.main.fadeIn(350, 20, 14, 30); this.hud.refresh(); this.def.onRespawn && this.def.onRespawn(this);
    this.enemies = this.enemies.filter((e) => !e.gone); this.ents = this.ents.filter((e) => !e.gone); this.hittable = this.hittable.filter((e) => !e.gone);
  }
  drop(e) { e.dead = true; e.gone = true; this.time.delayedCall(10, () => e.active && e.destroy()); this.enemies = this.enemies.filter((q) => q !== e); }

  // ---------------------------------------------------------------- presentation
  toast(s, o) { this.hud.toast(s, o); }
  float(x, y, s, color = '#fff6e0', ms = 1500) { const t = wtxt(this, x, y, s, 11, color, { depth: 45 }); t.x = Phaser.Math.Clamp(t.x, this.cameras.main.worldView.x + t.width / 2 + 4, this.cameras.main.worldView.right - t.width / 2 - 4); this.tweens.add({ targets: t, y: y - 18, duration: ms, ease: 'Quad.out' }); this.tweens.add({ targets: t, alpha: 0, delay: ms * 0.65, duration: ms * 0.35, onComplete: () => t.destroy() }); }
  letterMsg() { if (this.clock - (this.lm || -9e9) < 6000) return; this.lm = this.clock; this.toast(TOAST.letter[0], { title: BIG.rejLetter, color: '#ff9a8a' }); this.toast(TOAST.letter[1]); }
  unlock(id) { if (Save.unlock(id)) this.hud.achievement(id); }
  hitStop(ms) { if (this.stopped) return; this.stopped = true; this.physics.world.pause(); this.time.delayedCall(ms, () => { this.stopped = false; this.physics.world.resume(); }); }
  lock(v = true) { this.cinematic = v; this.player.locked = v; if (v) { this.player.body.setVelocityX(0); C.clear(); } this.hud.refresh(); }
  say(lines, done) { if (this.hud.talking) return; this.lock(true); this.hud.say(lines, () => { this.lock(false); done && done(); }); }
  wait(ms, fn) { return this.time.delayedCall(ms, fn); }
  stampSlam(ink, x, y, o = {}) { // giant ink stamp slammed on screen-space centre of the world view
    const s = this.add.image(x, y, 'atlas', `${ink}/0`).setDepth(50).setScale(o.from || 4).setAlpha(0).setAngle(o.angle ?? -8); this.tweens.add({ targets: s, scale: o.scale || 1.1, alpha: 1, duration: 200, ease: 'Quad.in', onComplete: () => { Audio.sfx(ink === 'ink_app' ? 'stampyes' : 'stampno'); this.cameras.main.shake(320, 0.014); this.fx.ring(x, y, ink === 'ink_app' ? 0x8fffb0 : 0xff8080, 3); o.done && o.done(); } }); this.tweens.add({ targets: s, alpha: 0, delay: o.hold || 1500, duration: 400, onComplete: () => s.destroy() }); return s;
  }
  celebrate() { this.player.forceAnim = 'leo_celebrate'; this.player.body.setVelocityX(0); }
  finish(extra) {
    if (this.finished) return; this.finished = 1; this.lock(true); this.celebrate(); this.fx.rain(2600); Audio.sfx('fanfare'); if (!this.tookDamage) this.unlock('productive'); Save.complete(this.levelId); const id = this.levelId;
    this.wait(600, () => this.hud.complete(!this.run.flags.hurt, () => { Save.d.mapAt = Math.min(5, id + 1); if (id === 5) { Save.d.mapAt = 5; Save.save(); this.leave('Ending'); } else { Save.save(); this.leave('Map', { from: id }); } })); extra && extra();
  }
  leave(key, data) { if (this._leaving) return; this._leaving = true; this.cameras.main.fadeOut(500, 20, 14, 30); this.time.delayedCall(540, () => { this.scene.stop('HUD'); this.scene.start(key, data); }); }
}
export { Plat, fadeTo };
