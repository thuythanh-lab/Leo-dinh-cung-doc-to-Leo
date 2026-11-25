import Phaser from 'phaser';
import { PLAYER as P } from '../config/balance.js';
import { Controls as C } from '../core/Input.js';
import { Audio } from '../core/Audio.js';
import { Save } from '../core/Save.js';
import { pick } from '../core/util.js';
import { TOAST } from '../config/text.js';

const H = 25; const HS = 13; const FW = 32; const FH = 36;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(L, x, y) {
    super(L, x, y, 'leo', 0); L.add.existing(this); L.physics.add.existing(this);
    this.L = L; this.setDepth(20); this.setOrigin(0.5, 1); this.body.setMaxVelocity(400, P.maxFall); this.setHeight2(H);
    const orig = this.body.updateBounds; // squash & stretch must never change the hitbox
    this.body.updateBounds = function () { const g = this.gameObject; const x = g._scaleX; const y0 = g._scaleY; g._scaleX = 1; g._scaleY = 1; orig.call(this); g._scaleX = x; g._scaleY = y0; };
    this.hearts = P.hearts; this.face = 1; this.coyote = 0; this.buffer = 0; this.inv = 0; this.castCd = 0; this.castT = 0; this.slideT = 0; this.slideCd = 0; this.stun = 0;
    this.idle = 0; this.joke = null; this.landT = 0; this.jumping = false; this.climbing = false; this.locked = false; this.ride = null; this.belt = 0; this.stressT = 0; this.inWater = false; this.drop = 0; this.wasFloor = true; this.safe = { x, y }; this.safeT = 0; this.forceAnim = null; this.alive = true; this.launch = 0; this.vyLast = 0;
  }
  setHeight2(h) { this.body.setSize(12, h, false); this.body.setOffset((FW - 12) / 2, FH - h); this.bh = h; }
  get floor() { return this.body.blocked.down || this.body.touching.down; }
  get speedMul() { return this.stressT > 0 ? P.stressSlow : 1; }

  update(dt) {
    const b = this.body; const s = dt / 1000;
    for (const k of ['inv', 'castCd', 'castT', 'slideCd', 'stun', 'drop', 'landT', 'launch']) this[k] = Math.max(0, this[k] - dt);
    if (this.stressT > 0) { this.stressT -= dt; if (this.stressT <= 0) this.L.toast(TOAST.stressGone); }
    this.setAlpha(this.inv > 0 && Math.floor(this.inv / 80) % 2 ? 0.35 : 1);
    if (!this.alive) return;
    const floor = this.floor; const ctl = !this.locked && this.stun <= 0;
    // water
    const w = this.L.waterAt(this.x, b.center.y - 2); const was = this.inWater; this.inWater = w !== null;
    if (this.inWater !== was && Math.abs(b.velocity.y) > 60) { Audio.sfx('splash', { v: 0.5 }); this.L.fx.burst('drop', this.x, b.center.y, 8, 70); }
    // timers
    this.coyote = floor ? P.coyoteMs : Math.max(0, this.coyote - dt);
    this.buffer = ctl && C.just('jump') ? P.bufferMs : Math.max(0, this.buffer - dt);
    const ax = ctl ? (C.held('right') ? 1 : 0) - (C.held('left') ? 1 : 0) : 0;
    // ladders
    const lad = this.L.ladderAt(this.x, b.center.y) || this.L.ladderAt(this.x, b.bottom + 2);
    if (ctl && !this.climbing && lad && this.slideT <= 0 && ((C.held('up') && this.L.ladderAt(this.x, b.center.y)) || (C.held('down') && this.L.ladderAt(this.x, b.bottom + 3) && !this.L.ladderAt(this.x, b.center.y)))) { this.climbing = true; this.buffer = 0; this.x = lad.x; }
    if (this.climbing) {
      const here = this.L.ladderAt(this.x, b.center.y) || this.L.ladderAt(this.x, b.bottom - 2);
      if (!here || !ctl) this.climbing = false;
      else {
        b.setAllowGravity(false); const ay = (C.held('down') ? 1 : 0) - (C.held('up') ? 1 : 0); b.setVelocity(ax * 40, ay * P.climbSpeed);
        if (floor && ay > 0) this.climbing = false;
        if (C.just('jump') && !C.held('up')) { this.climbing = false; b.setVelocityY(-P.jumpSpeed * 0.75); Audio.sfx('jump'); }
        this.play('leo_climb', true); if (!ay && !ax) this.anims.pause(); else this.anims.resume();
        if (ax) this.face = ax; this.setFlipX(this.face < 0); this.drop = 60; return;
      }
    }
    // slide
    if (ctl && floor && C.just('down') && Math.abs(b.velocity.x) > 60 && this.slideCd <= 0 && this.slideT <= 0) { this.slideT = P.slideMs; this.setHeight2(HS); Audio.sfx('cloth'); this.L.fx.dust(this.x, this.y); }
    if (this.slideT > 0) {
      this.slideT -= dt; const ceil = this.L.solidAt(this.x - 5, this.y - H + 1) || this.L.solidAt(this.x + 5, this.y - H + 1);
      if (this.slideT <= 0 && ceil) this.slideT = 40;
      if (this.slideT <= 0) { this.setHeight2(H); this.slideCd = P.slideCooldownMs; }
      else { b.setVelocityX(this.face * P.slideSpeed * (0.55 + 0.45 * Math.min(1, this.slideT / P.slideMs + 0.2)) * this.speedMul); if (b.blocked.left || b.blocked.right) this.face *= ceil ? -1 : 1; }
    } else if (this.bh !== H) this.setHeight2(H);
    // run
    if (this.slideT <= 0 && this.stun <= 0) {
      const max = P.runSpeed * this.speedMul * (this.inWater ? P.waterDrag : 1); const target = ax * max;
      let a = ax ? (floor ? P.accel : P.airAccel) : floor ? P.decel : P.airDecel;
      if (ax && Math.sign(ax) !== Math.sign(b.velocity.x) && b.velocity.x) a *= P.turnBoost;
      if (this.launch > 0 && !ax) a = 60;
      const v = b.velocity.x - this.beltApplied; const nv = v < target ? Math.min(target, v + a * s) : Math.max(target, v - a * s);
      this.beltApplied = floor ? this.belt : 0; b.setVelocityX(nv + this.beltApplied);
      if (ax) { this.face = ax; this.idle = 0; this.joke = null; }
    } else this.beltApplied = 0;
    this.belt = 0;
    // jump
    if (this.buffer > 0 && ctl) {
      const under = this.slideT > 0 && this.L.solidAt(this.x, this.y - H + 1);
      if (C.held('down') && floor && this.L.onOneWay) { this.drop = 220; this.buffer = 0; this.y += 2; }
      else if (this.coyote > 0 && !under) this.jump(P.jumpSpeed);
      else if (this.inWater) { this.buffer = 0; b.setVelocityY(-P.waterHop); this.jumping = true; Audio.sfx('splash', { v: 0.3 }); }
    }
    if (this.jumping && !C.held('jump') && b.velocity.y < 0 && ctl && this.launch <= 0) { b.velocity.y *= P.jumpCut; this.jumping = false; }
    if (b.velocity.y >= 0) this.jumping = false;
    // gravity
    b.setAllowGravity(false);
    if (this.inWater) {
      const depth = b.center.y - w; const lift = Math.max(-P.waterRise, Math.min(60, -(depth - 3) * 14));
      if (!this.jumping) b.velocity.y += (b.velocity.y < lift ? 1 : -1) * Math.min(Math.abs(b.velocity.y - lift), 620 * s);
      else b.velocity.y += 300 * s;
    } else if (!this.frozen) {
      let g = b.velocity.y < 0 ? P.gravityUp : P.gravityDown; if (Math.abs(b.velocity.y) < 45 && (this.jumping || C.held('jump'))) g *= P.apexBoost;
      b.velocity.y = Math.min(P.maxFall, b.velocity.y + g * s);
    }
    if (this.ride && floor && this.ride.body && this.ride.body.velocity.y > 0 && b.velocity.y >= 0) b.velocity.y = Math.max(b.velocity.y, this.ride.body.velocity.y + 30);
    // land
    if (floor && !this.wasFloor && this.vyLast > 150) { this.landT = 110; Audio.sfx('land', { v: Math.min(1, this.vyLast / 400) }); this.L.fx.dust(this.x - 5, this.y); this.L.fx.dust(this.x + 5, this.y); this.squash(1.18, 0.84); }
    this.wasFloor = floor; this.vyLast = b.velocity.y;
    if (floor && !this.ride && !this.inWater) { this.safeT += dt; if (this.safeT > 140 && this.L.isSafe(this.x, this.y)) { this.safe = { x: this.x, y: this.y }; } } else this.safeT = 0;
    // cast / interact
    if (ctl && C.just('cast')) { if (this.L.interactTarget) { C.eat('cast'); this.L.interactTarget.use(); } else this.cast(); }
    if (ctl && C.just('assist')) this.L.assistant.summon();
    this.animate(dt, ax, floor);
    this.ride = null;
  }
  jump(v) { const b = this.body; b.setVelocityY(-v); this.coyote = 0; this.buffer = 0; this.jumping = true; if (this.slideT > 0) { this.slideT = 0; this.setHeight2(H); } Audio.sfx('jump'); this.squash(0.84, 1.16); this.L.fx.dust(this.x, this.y); this.idle = 0; this.joke = null; }
  bounce(v) { this.body.setVelocityY(-v); this.launch = v > 360 ? 500 : 0; this.jumping = v <= 360; this.squash(0.82, 1.2); }
  squash(sx, sy) { this.setScale(sx, sy); this.L.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 150, ease: 'Quad.out' }); }
  cast() {
    if (this.castCd > 0) return; this.castCd = P.castCooldownMs; this.castT = 230; this.idle = 0; this.joke = null; Audio.sfx('cast', { rate: 0.94 + Math.random() * 0.12 });
    this.L.spawnBolt(this.x + this.face * 13, this.body.center.y - 1, this.face);
  }
  hurt(fromX, amount = 1) {
    if (this.inv > 0 || !this.alive || this.locked || this.L.cinematic) return false;
    this.hearts -= amount; this.inv = P.invulnMs; this.stun = 260; this.slideT = 0; this.setHeight2(H); this.climbing = false; this.L.tookDamage = true;
    const d = fromX === undefined ? -this.face : this.x < fromX ? -1 : 1; this.body.setVelocity(d * P.knockX, -P.knockY); Audio.sfx('hurt'); this.L.cameras.main.shake(140, 0.006); this.L.fx.burst('bit', this.x, this.body.center.y, 7, 100); this.L.hud?.refresh();
    if (this.hearts <= 0) this.L.cooked();
    return true;
  }
  heal(n = 1) { this.hearts = Math.min(P.hearts, this.hearts + n); this.L.hud?.refresh(); }
  animate(dt, ax, floor) {
    const b = this.body; this.setFlipX(this.face < 0);
    if (this.forceAnim) { this.play(this.forceAnim, true); return; }
    let a;
    if (this.stun > 0) a = 'hurt';
    else if (this.slideT > 0) a = 'slide';
    else if (this.castT > 0) a = 'cast';
    else if (!floor && !this.inWater) a = b.velocity.y < 0 ? 'jump' : 'fall';
    else if (this.inWater && !floor) a = Math.abs(b.velocity.x) > 20 ? 'run' : 'fall';
    else if (this.landT > 0 && Math.abs(b.velocity.x) < 30) a = 'land';
    else if (Math.abs(b.velocity.x - this.beltApplied) > 14) a = 'run';
    else {
      this.idle += dt;
      if (this.idle > P.idleJokeMs) {
        if (!this.joke) { this.joke = this.hearts === 1 ? 'sit' : pick(['glasses', 'email', 'coffee', 'stare', 'sit']); this.jokeT = this.joke === 'sit' || this.joke === 'stare' ? 4200 : 3800; }
        this.jokeT -= dt; if (this.jokeT <= 0) { this.joke = null; this.idle = 1200; }
      }
      a = this.joke || 'idle';
    }
    if (this.anims.currentAnim?.key !== `leo_${a}` || (!this.anims.isPlaying && a !== 'cast' && a !== 'jump' && a !== 'land' && !this.joke)) this.play(`leo_${a}`, true);
    if (a === 'run') { this.anims.timeScale = Math.max(0.5, Math.abs(b.velocity.x) / P.runSpeed); this.stepT = (this.stepT || 0) + dt; if (this.stepT > 235 && floor) { this.stepT = 0; Audio.sfx('step', { rate: 0.9 + Math.random() * 0.2 }); } } else this.anims.timeScale = 1;
  }
}
Player.prototype.beltApplied = 0;
export { Save };
