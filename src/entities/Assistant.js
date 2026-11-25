import { ASSISTANT as A } from '../config/balance.js';
import { ASSIST } from '../config/text.js';
import { COFFEE } from '../config/balance.js';
import { Audio } from '../core/Audio.js';
import { Save } from '../core/Save.js';
import { pick } from '../core/util.js';

/** The Research Assistant: exactly A.durationMs of gameplay time, then a cooldown. Permanent across phases. */
export default class Assistant {
  constructor(L) { this.L = L; this.left = 0; this.cd = 0; this.s = null; this.hitT = 0; this.total = 0; }
  get active() { return this.left > 0; }
  get unlocked() { return Save.d.assistant; }
  summon(free) {
    const L = this.L; if (!this.unlocked || this.active || L.cinematic) return false;
    if (this.cd > 0 && !free) { Audio.sfx('error', { v: 0.5 }); L.float(L.player.x, L.player.y - 40, `${ASSIST.cooldown} ${Math.ceil(this.cd / 1000)}s`, '#c8c0d8'); return false; }
    this.left = A.durationMs; this.total = 0; Save.d.stats.summons++; if (Save.d.stats.summons >= COFFEE.delegatorGoal) L.unlock('delegator'); Save.save();
    const x = L.player.x + L.player.face * 18; const y = L.player.y; Audio.sfx('summon');
    const g = L.add.sprite(x, y - 16, 'atlas', 'sigil/0').setDepth(18).play('sigil').setScale(0.2).setBlendMode('ADD'); L.tweens.add({ targets: g, scale: 1.1, duration: 260, yoyo: true, hold: 260, onComplete: () => g.destroy() }); L.fx.ring(x, y - 16, 0x8ff0c0, 1.8); L.fx.sparkle(x, y - 16, 10, 22);
    this.s = L.add.sprite(x, y, 'atlas', 'ra_idle/0').setOrigin(0.5, 1).setDepth(19).setScale(0.1, 1.6); L.tweens.add({ targets: this.s, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.out' }); this.vy = 0; return true;
  }
  dismiss() {
    const L = this.L; const s = this.s; this.left = 0; this.cd = A.cooldownMs; this.s = null; if (!s) return; Audio.sfx('vanish'); L.float(s.x, s.y - 38, pick(ASSIST.leave), '#c8ffd8', 2600);
    s.play('ra_wave'); L.tweens.add({ targets: s, alpha: 0, scaleX: 0.1, scaleY: 1.6, delay: 700, duration: 260, onComplete: () => { L.fx.sparkle(s.x, s.y - 16, 8, 16); s.destroy(); } }); L.hud.refresh();
  }
  target() {
    const L = this.L; let best = null; let bd = A.reach;
    for (const h of L.hittable) { if (h.dead || !h.ra || (h.o && h.o.locked && h.o.locked())) continue; const d = Math.hypot(h.x - L.player.x, (h.y - L.player.y) * 1.2); if (d < bd) { bd = d; best = h; } }
    return best;
  }
  update(dt) {
    const L = this.L; if (!this.active) { if (this.cd > 0) { this.cd = Math.max(0, this.cd - dt); } return; }
    this.left -= dt; this.total += dt; if (this.left <= 0) { this.dismiss(); return; }
    const s = this.s; const p = L.player; const t = this.target(); this.hitT -= dt;
    let gx = p.x - p.face * 20; let gy = p.y;
    if (t) { gx = t.x + (p.x < t.x ? -1 : 1) * ((t.width || 20) / 2 + 8); gy = t.y; }
    const dx = gx - s.x; const dy = gy - s.y; const step = (A.speed * dt) / 1000; const mx = Math.abs(dx) > 3;
    if (mx) { s.x += Math.sign(dx) * Math.min(step, Math.abs(dx)); s.setFlipX(dx < 0); }
    s.y += Math.sign(dy) * Math.min(step * 1.1, Math.abs(dy)); // determined, slightly levitating
    if (Math.abs(dx) > 320 || Math.abs(dy) > 240) { s.setPosition(p.x, p.y); L.fx.sparkle(s.x, s.y - 12, 4, 10); }
    if (t && Math.abs(dx) < 12 && Math.abs(dy) < 30) {
      s.setFlipX(t.x < s.x); if (this.hitT <= 0) { this.hitT = A.hitEveryMs; s.play('ra_attack', true); L.fx.burst('spark', (s.x + t.x) / 2, s.y - 18, 4, 90); t.hit(A.damage, 'ra'); if (t.dead) L.float(s.x, s.y - 36, ASSIST.nothing, '#e8ffd8'); }
    } else if (!(s.anims.currentAnim?.key === 'ra_attack' && this.hitT > 0)) { if (mx) s.play('ra_run', true); else if (Math.abs(dy) > 6) { s.anims.stop(); s.setFrame('ra_jump/0'); } else s.play('ra_idle', true); }
    s.setAlpha(this.left < 2000 ? 0.65 + 0.35 * Math.sin(this.left / 60) : 1);
  }
}
