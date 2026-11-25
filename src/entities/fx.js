import { pick } from '../core/util.js';

/** Small particle helpers. All sprites come from the atlas. */
export default class Fx {
  constructor(L) { this.L = L; this.pools = {}; }
  em(name, cfg) {
    if (!this.pools[name]) { this.pools[name] = this.L.add.particles(0, 0, 'atlas', { emitting: false, ...cfg }).setDepth(cfg.depth ?? 30); }
    return this.pools[name];
  }
  frames(n) { const c = this.L.cache.json.get('atlasmeta').meta.counts[n] || 1; return Array.from({ length: c }, (_, i) => `${n}/${i}`); }
  burst(n, x, y, count = 8, speed = 110, o = {}) {
    const e = this.em(`b_${n}_${speed}`, { frame: this.frames(n), lifespan: { min: 380, max: 800 }, speedX: { min: -speed, max: speed }, speedY: { min: -speed * 1.5, max: speed * 0.4 }, gravityY: o.g ?? 340, rotate: { min: 0, max: 360 }, scale: { start: 1, end: 0.6 }, depth: 30 });
    e.emitParticleAt(x, y, count);
  }
  dust(x, y) { const d = this.L.add.sprite(x, y - 5, 'atlas', 'dust/0').setDepth(19).play('dust'); d.once('animationcomplete', () => d.destroy()); }
  spark(x, y) { const d = this.L.add.sprite(x, y, 'atlas', 'spark/0').setDepth(31).play('spark'); d.once('animationcomplete', () => d.destroy()); }
  sparkle(x, y, n = 8, r = 20) { for (let i = 0; i < n; i++) this.L.time.delayedCall(i * 45, () => this.L.sys.isActive() && this.spark(x + (Math.random() - 0.5) * r * 2, y + (Math.random() - 0.5) * r * 2)); }
  confetti(x, y, n = 40, speed = 190) { for (const c of 'abcde') this.burst(`conf_${c}`, x, y, Math.ceil(n / 5), speed, { g: 300 }); }
  rain(ms = 3000, names = ['conf_a', 'conf_b', 'conf_c', 'conf_d', 'conf_e']) {
    const L = this.L; const t = L.time.addEvent({ delay: 45, repeat: Math.floor(ms / 45), callback: () => { const v = L.cameras.main.worldView; this.burst(pick(names), v.x + Math.random() * v.width, v.y - 6, 1, 40, { g: 180 }); } }); return t;
  }
  ring(x, y, color = 0xffffff, to = 3) { const r = this.L.add.image(x, y, 'atlas', 'ring/0').setDepth(29).setTint(color).setScale(0.2).setBlendMode('ADD'); this.L.tweens.add({ targets: r, scale: to, alpha: 0, duration: 520, ease: 'Quad.out', onComplete: () => r.destroy() }); }
  glow(x, y, kind = 'w', scale = 1, depth = 7, alpha = 0.5) { return this.L.add.image(x, y, 'atlas', `glow_${kind}/0`).setBlendMode('ADD').setDepth(depth).setScale(scale).setAlpha(alpha); }
  ambient(theme, zone) {
    const c = { campus: ['leaf', 0.5], garden: ['petal', 0.8], library: ['mote', 0.7], water: ['mote', 0.6], archive: ['mote', 0.5], tower: ['bit', 0.5], treasury: ['mote', 0.8], office: ['bit', 0.6], field: ['leaf', 0.4], manuscript: ['bit', 0.7] }[theme]; if (!c) return null;
    const mote = c[0] === 'mote';
    const e = this.L.add.particles(0, 0, 'atlas', { frame: this.frames(c[0]), x: { min: 220, max: 760 }, y: mote ? { min: 135, max: 415 } : 127, lifespan: 6500, speedX: mote ? { min: -8, max: 8 } : { min: -30, max: -8 }, speedY: mote ? { min: -12, max: -3 } : { min: 14, max: 30 }, rotate: mote ? 0 : { min: 0, max: 360 }, alpha: mote ? { start: 0.75, end: 0 } : { start: 0.9, end: 0.2 }, scale: { min: 0.6, max: 1 }, frequency: 420 / c[1], blendMode: mote ? 'ADD' : 'NORMAL' }).setScrollFactor(0).setDepth(zone?.front ? 26 : 3);
    return e;
  }
}
