// Convenience wrappers shared by every level file.
import { T } from '../core/util.js';
import * as E from '../entities/things.js';
import * as PL from '../entities/platforms.js';
import { TOAST, SIGNS } from '../config/text.js';
import { Audio } from '../core/Audio.js';

export function kit(L) {
  const k = {
    coffee: (...pts) => pts.forEach(([x, y]) => new E.Coffee(L, x, y)),
    row: (x, y, n, step = 1) => { for (let i = 0; i < n; i++) new E.Coffee(L, x + i * step, y); },
    arc: (x, y, n, h = 2, step = 1) => { for (let i = 0; i < n; i++) new E.Coffee(L, x + i * step, y - Math.sin((i / Math.max(1, n - 1)) * Math.PI) * h); },
    special: (x, y) => new E.Special(L, x, y), item: (x, y, n, o) => new E.Item(L, x, y, n, o),
    sign: (x, y, key, o) => new E.Sign(L, x, y, key, o), npc: (x, y, who, talk, o) => new E.NPC(L, x, y, who, talk, o), machine: (x, y) => new E.Machine(L, x, y),
    door: (x, y, o) => new E.Door(L, x, y, o), portal: (x, y, to, msg) => new E.MiniPortal(L, x, y, to, msg), sw: (x, y, kind, o) => new E.Switch(L, x, y, kind, o), bounce: (x, y, n, v) => new E.Bouncer(L, x, y, n, v),
    barrier: (x, y, n, o) => new E.Barrier(L, x, y, n, o), writers: (x, y, o) => new E.Writers(L, x, y, o), gate: (x, y, n, o) => new E.Gate(L, x, y, n, o), spinner: (x, y, r, n) => new E.Spinner(L, x, y, r, n), crusher: (x, y, d, o) => new E.Crusher(L, x, y, d, o),
    gremlin: (x, y, o) => new E.Gremlin(L, x, y, o), format: (x, y, o) => new E.Format(L, x, y, o), citation: (x, y, o) => new E.Citation(L, x, y, o), tracked: (x, y, o) => new E.Tracked(L, x, y, o), stress: (x, y) => new E.Stress(L, x, y),
    letter: (x, y, vx, vy, o) => new E.Letter(L, x, y, vx, vy, o), use: (x, y, n, o) => new E.Interact(L, x, y, n, o),
    plat: (x, y, n = 'plat_wood', o) => new PL.Plat(L, x, y, n, o), mover: (x, y, n, o) => new PL.Mover(L, x, y, n, o), spoke: (...a) => new PL.Spoke(L, ...a), fragile: (x, y, n) => new PL.Fragile(L, x, y, n), leaf: (x, y, o) => new PL.Leaf(L, x, y, o), linked: (x, y, n, o) => new PL.Linked(L, x, y, n, o), cell: (x, y, g) => new PL.Cell(L, x, y, g), infra: (x, y, o) => new PL.Infra(L, x, y, o), conveyor: (x, y, w, d, s) => new PL.Conveyor(L, x, y, w, d, s), raft: (x) => new PL.Raft(L, x), beetle: (x, y, o) => new PL.Beetle(L, x, y, o), collapse: (x, y, n, o) => new PL.Collapse(L, x, y, n, o),
    /** scenery sprite, bottom-centred on tile coords */
    prop: (x, y, n, o = {}) => { const s = L.add.sprite(x * T, y * T, 'atlas', `${n}/${o.f || 0}`).setOrigin(0.5, o.oy ?? 1).setDepth(o.d ?? 2).setFlipX(!!o.flip).setScale(o.s || 1); if (o.a !== undefined) s.setAlpha(o.a); if (o.tint) s.setTint(o.tint); else if (n.startsWith('bld_')) s.setTint(0xdfe4f4); else if ((o.d ?? 2) <= 2 && /shelf|b_/.test(n)) s.setTint({ library: 0x8478a8, office: 0x9aa0bc, archive: 0x8088c0 }[(L.b.zoneAt(Math.floor(x), Math.floor(y - 1)) || {}).theme] || 0xd0d0d8); if (o.anim !== false && L.anims.exists(n)) s.play({ key: n, startFrame: 0, delay: (x * 137) % 900 }); if (o.glow) L.fx.glow(x * T, y * T - s.height * (o.gy ?? 0.75), o.glow, o.gs || 0.8, (o.d ?? 2) + 1, o.ga ?? 0.45); return s; },
    tree: (x, y, i = 0, o = {}) => k.prop(x, y + 0.2, `tree_${i}`, { d: 2, ...o }),
    fall: (x, y, w, h, d = 1) => { const t = L.add.tileSprite(x * T, y * T, w * T, h * T, 'atlas', 'waterfall/0').setOrigin(0, 0).setDepth(d).setAlpha(0.92); L.ents.push({ update: (dt) => { t.tilePositionY -= dt * 0.12; } }); const foam = L.add.particles(x * T, (y + h) * T, 'atlas', { frame: 'drop/0', x: { min: 0, max: w * T }, speedY: { min: -60, max: -20 }, speedX: { min: -25, max: 25 }, gravityY: 180, lifespan: 600, frequency: 60, scale: { start: 1, end: 0.3 }, alpha: { start: 0.8, end: 0 } }).setDepth(d + 1); t.foam = foam; return t; },
    arrow: (x, y) => { const s = L.add.sprite(x * T, y * T, 'atlas', 'arrowdn/0').setDepth(12); L.tweens.add({ targets: s, y: s.y - 5, duration: 420, yoyo: true, repeat: -1 }); return s; },
    secretRoom: (flagKey) => { if (!L.flag(flagKey)) { L.setFlag(flagKey); Audio.sfx('secret'); L.hud.toast(TOAST.secret, { color: '#ffd0f0' }); } },
    /** bubble platform drop: a stamp falls from above onto a world point */
    dropStamp: (name, x, y, done) => { const s = L.add.sprite(x, y - 260, 'atlas', `${name}/0`).setOrigin(0.5, 1).setDepth(32).setScale(1.5); L.tweens.add({ targets: s, y, duration: 420, ease: 'Quad.in', onComplete: () => { Audio.sfx('stampno'); L.cameras.main.shake(380, 0.014); L.fx.ring(x, y, 0xff8080, 3); L.fx.burst('bit', x, y, 24, 190); done && done(); L.tweens.add({ targets: s, y: y - 300, delay: 500, duration: 700, ease: 'Quad.in', onComplete: () => s.destroy() }); } }); },
  };
  return k;
}
export { E, PL, T, TOAST, SIGNS, Audio };
