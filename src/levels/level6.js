// Phase 2: the field (top half of the map) flows into the dissertation (bottom half).
import { kit, T, Audio } from './kit.js';
import { P2 } from '../config/text.js';
import { StormCloud, Cursor, Critter } from '../entities/phase2.js';
import { wtxt } from '../core/util.js';

const D = 72; // dissertation base floor
const FINDS = [1, 2, 3, 4, 5]; const CH = [1, 2, 3, 4, 5];
export default {
  id: 6, name: 'The Fieldwork Survival Era', sub: P2.intro[1], w: 186, h: 84, spawn: { x: 3, y: 36 },
  hudItems: [...FINDS.map((i) => [`f${i}`, 'finding', 'field']), ...CH.map((i) => [`ch${i}`, 'page', 'doc'])],
  tiles(b, L) {
    b.zone({ id: 'field', x: 0, y: 0, w: 186, h: 46, theme: 'field', music: 'water' });
    b.zone({ id: 'doc', x: 0, y: 48, w: 186, h: 34, theme: 'manuscript', music: 'archive' });
    const g = (a, c, y) => b.ground(a, c, y, 46);
    // ---- river
    g(0, 18, 36); g(19, 27, 35); g(28, 36, 33); b.plat(22, 32, 4); g(37, 58, 44); b.bridge(37, 33, 4); b.bridge(55, 31, 4);
    b.back(37, 34, 22, 10); b.back(140, 39, 19, 3);
    // ---- village, landslide
    g(59, 92, 31); b.plat(63, 28, 5); b.plat(69, 25, 4); b.plat(78, 28, 3);
    // ---- brambles + buffalo
    g(93, 114, 34); b.haz(93, 33, 22); g(115, 126, 31);
    // ---- terraces, rope bridge, gorge
    g(127, 132, 28); g(133, 139, 25); g(140, 158, 42); b.plat(142, 37, 4); b.plat(146, 34, 3); b.plat(150, 31, 3); b.plat(154, 28, 2); b.bridge(155, 25, 4); g(159, 185, 22); b.fill(184, 8, 2, 14);
    // ================= dissertation
    const d = (a, c, y) => b.ground(a, c, y, 82);
    d(0, 15, D); d(27, 45, D - 2); b.plat(33, D - 5, 4); d(46, 52, D); b.haz(48, D - 1, 2);
    // writer's block
    d(53, 71, D - 2); b.plat(56, D - 5, 3); b.plat(60, D - 8, 4); d(86, 99, D - 2);
    // supervisor feedback 1 (gap 100-120)
    d(121, 136, D - 2); b.haz(125, D - 3, 1);
    // supervisor feedback 2: the floor goes, the basement stays
    d(137, 158, D + 5); b.fill(137, D - 2, 22, 2); if (!L.flag('rw2')) b.brk(139, D - 2, 5, 2); else b.cut(139, D - 2, 5, 2);
    b.fill(147, 50, 4, 20); d(159, 185, D - 1); b.fill(159, D - 1, 27, 12); b.cut(155, D - 2, 4, 2); b.plat(155, D + 2, 2); b.plat(157, D - 1, 2); b.fill(184, 50, 2, 21);
  },
  build(b, L) { const k = kit(L); this.field(k, L); this.doc(k, L); },

  // ------------------------------------------------------------------ 1. INTO THE FIELD
  field(k, L) {
    const find = (i, x, y) => k.item(x, y, 'finding', { flag: `f${i}`, glow: 'g', onGet: () => L.toast(P2.finding[i - 1]) });
    // scenery
    k.prop(10, 36.1, 'stilt', { d: 2 }); k.prop(68, 31.1, 'stilt', { d: 2 }); k.prop(74.6, 31.1, 'stilt', { f: 1, d: 2, flip: true }); k.prop(86, 31.1, 'stilt', { f: 1, d: 2 }); k.prop(122, 31.1, 'stilt', { d: 2 }); k.prop(164, 22.1, 'stilt', { f: 1, d: 2 });
    [[2, 36, 1], [17, 36, 0], [25, 35, 2], [61, 31, 2], [80.5, 31, 0], [90, 31, 1], [117, 31, 2], [130, 28, 0], [136.5, 25, 2], [161, 22, 1], [179, 22, 0]].forEach(([x, y, i]) => k.tree(x, y, i));
    [[6, 36], [21, 35], [64, 31], [78, 31], [88, 31], [119, 31], [128.6, 28], [168, 22]].forEach(([x, y], i) => k.prop(x, y + 0.1, i % 2 ? 'fl_berry' : 'fl_bush', { d: 7 }));
    [[13.6, 36], [71, 31], [124.4, 31]].forEach(([x, y]) => k.prop(x, y, 'basket', { d: 7 })); [[8, 36], [15, 36], [66, 31], [73, 31], [87.6, 31], [121, 31]].forEach(([x, y]) => new Critter(L, x, y, 2.4));
    k.fall(35.6, 33, 1.4, 8, 4); k.fall(139.9, 25, 1.5, 14, 4); k.fall(157.4, 22, 1.5, 17, 4); k.prop(172, 22.1, 'tent', { d: 3 });
    const river = L.addWater({ x: 37, y: 31, w: 22, h: 13, level: L.flag('flood') ? 33.5 : 40.6 }); L.addWater({ x: 140, y: 34, w: 19, h: 8, level: 39 });
    // 1. the plan meets the river
    k.sign(5, 36, 'p2plan', { sprite: 'fieldsign' }); k.row(8, 35, 3); k.arc(19, 33, 6, 1.4); k.citation(26, 31.4, { sprite: 'mosquito', range: 26 }); find(1, 24, 30.6); k.machine(30, 33); k.sign(33, 33, 'p2bridge');
    [44.5, 49, 53.2].forEach((x) => k.raft(x)); k.arc(43, 31, 5, 1, 1); find(2, 49, 30.6); k.coffee([53, 31], [46, 36], [51, 36]);
    const flood = () => { if (L.flag('flood')) return; L.setFlag('flood'); river.want = 33.5 * T; L.toast(P2.flood); Audio.sfx('rumble'); L.cameras.main.shake(1200, 0.005); for (let i = 0; i < 12; i++) L.wait(i * 160, () => { L.fx.burst('drop', (38 + Math.random() * 20) * T, river.px, 6, 120); Audio.sfx('splash', { v: 0.3 }); }); };
    L.trigger(35, 30, 6, 4, flood); L.ents.push({ update: () => { if (!L.flag('flood') && L.player.x > 37 * T && L.player.x < 59 * T && L.player.y > 35 * T) flood(); } });
    // 2. village: goat, rooftops, landslide
    k.machine(60.4, 31); k.row(63.4, 26.8, 4); k.row(69.5, 23.6, 3); find(3, 71, 22.2); const goat = k.prop(80, 31, 'goat', { d: 9 }); k.sign(77, 31, 'p2goat', { range: 26 }); L.trigger(77, 26, 3, 5.2, () => { L.float(goat.x, goat.y - 36, P2.goat, '#fff0c0', 2600); Audio.sfx('page'); L.tweens.add({ targets: goat, y: goat.y - 10, yoyo: true, repeat: 2, duration: 160 }); L.fx.burst('bit', goat.x + 12, goat.y - 18, 10, 90); });
    const rock = (fall) => { const r = k.barrier(84, 31, 'barrier_rock', { flag: 'rock', hp: 12 }); if (fall && !r.dead) { const y = r.y; r.y = y - 190; L.tweens.add({ targets: r, y, duration: 520, ease: 'Bounce.out' }); } return r; };
    if (L.flag('slide')) rock(); else L.trigger(80.2, 26, 2.2, 5.2, () => { L.setFlag('slide'); L.toast(P2.slide); Audio.sfx('rumble'); L.cameras.main.shake(700, 0.01); L.player.inv = Math.max(L.player.inv, 600); for (let i = 0; i < 9; i++) { const s = L.add.image((83 + Math.random() * 4) * T, 19 * T, 'atlas', 'boulder/0').setDepth(13).setScale(0.5 + Math.random() * 0.6); L.tweens.add({ targets: s, y: 30.4 * T, angle: 300, duration: 420 + i * 70, ease: 'Quad.in', onComplete: () => { L.fx.dust(s.x, 31 * T); s.destroy(); } }); } L.wait(260, () => rock(true)); L.wait(800, () => { Audio.sfx('thud'); for (let i = 0; i < 5; i++) L.fx.dust((82 + i) * T, 31 * T); }); });
    k.arc(81.6, 25.6, 5, 1.2, 1.1); k.machine(90.6, 31);
    // 3. local transport
    k.sign(88, 31, 'p2bus', { range: 30 }); const bus = k.beetle(96.4, 31.4, { name: 'buffalo', dist: 14.4, speed: 78, oy: 8 }); bus.body.setSize(52, 22, false); bus.body.setOffset(8, 8); bus.touched = () => { bus.rider = true; if (!bus.awake) { bus.wake(); L.toast(P2.buffalo); Audio.sfx('boing', { rate: 0.6 }); } };
    k.row(99, 29, 12, 1); k.citation(105, 26.4, { sprite: 'mosquito', range: 44 }); k.machine(116.6, 31); k.arc(125, 27.5, 5, 1.4); k.citation(130, 24.4, { sprite: 'mosquito', range: 24 }); k.coffee([134.5, 24], [136, 24]);
    // 4. rope bridge
    k.machine(134, 25); k.sign(137, 25, 'p2rope'); const planks = []; for (let i = 0; i < 5; i++) planks.push(k.collapse(141.5 + i * 3.1, 25 + Math.sin((i + 0.5) / 5 * Math.PI) * 0.6, 'plat_rope')); L.bridge = planks;
    const snap = () => { L.toast(P2.bridge); Audio.sfx('creak'); L.cameras.main.shake(500, 0.006); planks.forEach((p, i) => p.collapse(500 + i * 260)); }; let gone = false;
    planks.slice(2).forEach((p) => { p.touched = () => { p.rider = true; if (!gone) { gone = true; snap(); } }; }); L.resetBridge = () => { gone = false; planks.forEach((p) => p.fallen && p.restore()); };
    k.arc(143, 23.6, 12, -0.4, 1.2); k.row(142.6, 36, 3); k.coffee([151.4, 30], [155, 27]); find(4, 148.4, 31.4); // the detour has its own data
    // 5. field station: touch grass
    k.machine(162, 22); k.sign(165.6, 22, 'p2station'); k.row(167, 21, 4); k.citation(170, 17.4, { sprite: 'mosquito', range: 30 }); find(5, 170, 20.6);
    const portal = k.prop(181, 22.2, 'portal', { d: 8 }); portal.setVisible(L.flag('fieldDone'));
    const toDoc = () => L.teleport(3, D, () => { L.hud.banner(...P2.zone2); L.setCheckpoint(L.player.x, L.player.y); }, 450);
    L.trigger(174, 14, 7, 8.2, () => {
      if (L.flag('fieldDone')) return; L.lock(true); L.player.forceAnim = 'leo_stare'; const p = L.player; L.toast(P2.findings(FINDS.filter((i) => L.flag(`f${i}`)).length));
      L.wait(1500, () => { p.forceAnim = 'leo_sit'; Audio.sfx('cloth'); L.fx.burst('leaf', p.x, p.y - 4, 14, 70); L.float(p.x, p.y - 40, '*touches grass*', '#d8ffb0', 2200); });
      L.wait(3600, () => { p.forceAnim = null; L.celebrate(); L.setFlag('fieldDone'); L.unlock('fieldwork'); Audio.sfx('fanfare'); L.hud.big(P2.grass, { y: 120, size: 60, ms: 3200 }); L.fx.rain(3200, ['leaf', 'petal', 'conf_c', 'conf_b']); L.fx.ring(p.x, p.y - 16, 0xc8ff90, 5); for (let i = 0; i < 5; i++) L.wait(i * 400, () => L.fx.sparkle(p.x + (Math.random() - 0.5) * 160, p.y - 50, 5, 20)); });
      L.wait(7200, () => { portal.setVisible(true).setScale(0); L.tweens.add({ targets: portal, scale: 1, duration: 700, ease: 'Back.out' }); Audio.sfx('summon'); for (let i = 0; i < 16; i++) { const s = L.add.image(p.x, p.y - 20, 'atlas', 'page/0').setDepth(31); L.tweens.add({ targets: s, x: portal.x + Math.sin(i) * 20, y: portal.y - 50, angle: 360, scale: 0.4, delay: i * 70, duration: 800, onComplete: () => s.destroy() }); } });
      L.wait(8900, () => { p.forceAnim = null; L.lock(false); });
    });
    L.ents.push({ update: () => { if (L.flag('fieldDone') && portal.visible && !L.cinematic && !L.teleporting && L.zone.id === 'field' && Math.abs(L.player.x - portal.x) < 16 && L.player.y > 15 * T && L.player.y < 24 * T) { Audio.sfx('laser'); toDoc(); } } });
  },

  // ------------------------------------------------------------------ 2. THE DISSERTATION ERA
  doc(k, L) {
    const chap = (i, x, y) => k.item(x, y, 'page', { flag: `ch${i}`, glow: 'w', onGet: () => { L.toast(P2.chapter[i - 1]); Audio.sfx('page'); } });
    [[6, D], [38, D - 2], [66, D - 2], [94, D - 2], [131, D - 2], [165, D - 1], [183, D - 1]].forEach(([x, y], i) => k.prop(x, y, i % 2 ? 'shelf_small' : 'b_tall', { f: i % 2 ? 0 : 4, d: 1, tint: 0xe0c0d0 })); [[12, D], [58, D - 2], [90, D - 2], [170, D - 1]].forEach(([x, y]) => k.prop(x, y, 'b_lectern', { d: 3 }));
    for (let i = 0; i < 22; i++) { const s = L.add.image((4 + i * 8.3) * T, (56 + (i * 5) % 9) * T, 'atlas', i % 3 ? 'page/0' : 'plat_para/0').setDepth(1).setAlpha(0.6).setAngle((i * 37) % 50 - 25); L.tweens.add({ targets: s, y: s.y - 18, angle: s.angle + 14, yoyo: true, repeat: -1, duration: 2600 + i * 140, ease: 'Sine.inOut' }); }
    // ---- floating paragraphs, chapter 1
    k.machine(8, D); k.sign(5.4, D, 'p2doc'); k.row(9, D - 1, 3); k.mover(18.4, D - 1, 'plat_para', { dy: -1.6, ms: 3600 }); k.mover(23, D - 1.8, 'plat_para', { dy: 1.6, ms: 4000 }); k.arc(17, D - 5, 7, 1.2); chap(1, 23, D - 5.4);
    // ---- stress
    k.machine(28.4, D - 2); k.sign(30.4, D - 2, 'p2cloud'); new StormCloud(L, 36, D - 5); k.gremlin(42, D - 2); k.row(33.4, D - 6.2, 4); k.tracked(40, D - 5.4, { range: 4 }); k.coffee([46.6, D - 3], [48.6, D - 4], [50.6, D - 3]);
    // ---- writer's block
    k.machine(54, D - 2); k.sign(64.6, D - 2, 'p2block', { range: 30 }); k.coffee([57, D - 6], [58, D - 6]); chap(2, 61.4, D - 9.4); if (!L.flag('insp')) k.arrow(63, D - 11.6); k.item(63, D - 9.6, 'bulb', { flag: 'insp', onGet: () => { L.toast(P2.bulb); Audio.sfx('achieve'); L.fx.ring(L.player.x, L.player.y - 20, 0xfff0a0, 4); L.fx.sparkle(L.player.x, L.player.y - 20, 12, 30); } });
    const words = [[74.5, D - 3], [78.6, D - 4], [82.8, D - 3]].map(([x, y]) => { const p = k.collapse(x, y, 'plat_para'); p.fallen = true; p.setSolid(false); p.setAlpha(0); return p; }); const build = (q) => words.forEach((p, i) => (q ? p.restore() : L.wait(250 + i * 260, () => { p.restore(); Audio.sfx('book'); })));
    if (L.flag('cursor')) build(true); new Cursor(L, 70, D - 2, { flag: 'cursor', onBreak: () => build() }); k.arc(73, D - 6, 10, 0.8, 1.1);
    // ---- supervisor feedback, round 1: the straight road is destroyed
    k.machine(87.6, D - 2); k.sign(90.6, D - 2, 'p2super'); k.gremlin(93, D - 2); chap(3, 97, D - 3.2);
    k.machine(98, D - 2); // save at chapter 3, immediately before the feedback platform gap
    const run = [0, 1, 2, 3, 4].map((i) => k.collapse(102.4 + i * 4.2, D - 2, 'plat_para')); const alt = [[101.6, D - 4.4], [105.6, D - 6.8], [110.4, D - 7.6], [115, D - 6.4], [118.6, D - 4.2]].map(([x, y]) => { const p = k.collapse(x, y, 'plat_track'); p.fallen = true; p.setSolid(false); p.setAlpha(0); return p; });
    const showAlt = (q) => alt.forEach((p, i) => (q ? p.restore() : L.wait(i * 160, () => { p.restore(); Audio.sfx('typing'); }))); k.row(103, D - 8, 14, 1.1);
    if (L.flag('rw1')) { run.forEach((p) => { p.fallen = true; p.setSolid(false); p.setVisible(false); }); showAlt(true); } else {
      L.trigger(94, D - 8, 6.4, 6.2, () => {
        L.lock(true); L.player.face = 1; L.setFlag('rw1'); const cx = 110.5 * T; L.cameras.main.stopFollow(); L.cameras.main.pan(106 * T, (D - 5) * T, 600, 'Sine.easeInOut'); Audio.sfx('question');
        L.wait(800, () => k.dropStamp('stamp_rewrite', cx, (D - 2) * T, () => { L.stampSlam('ink_rewrite', 108 * T, (D - 6) * T, { scale: 0.9, from: 2.4, hold: 1500 }); run.forEach((p, i) => p.collapse(i * 80)); L.hud.toast(P2.rewrite, { color: '#ff9a8a' }); for (let i = 0; i < 4; i++) L.fx.burst('bit', (102 + i * 5) * T, (D - 2) * T, 10, 160); }));
        L.wait(2900, () => { L.toast(P2.rewriteAlt); showAlt(); }); L.wait(3800, () => { L.cameras.main.startFollow(L.player, true, 0.14, 0.12); L.lock(false); });
      });
    }
    // ---- round 2: "one more small thing"
    k.machine(122.6, D - 2); k.sign(128, D - 2, 'p2super2'); k.crusher(132.5, D - 8.4, 6.4, { name: 'stamp_rewrite', period: 3000, scale: 0.55 }); k.row(130.6, D - 3, 4, 1.2); k.tracked(127, D - 5, { range: 3 });
    if (!L.flag('rw2')) L.trigger(141, D - 7, 2, 5.1, () => {
      L.setFlag('rw2'); L.lock(true); L.player.inv = 2500; Audio.sfx('question'); const cx = 141.5 * T;
      L.wait(500, () => k.dropStamp('stamp_rewrite', cx, (D - 2) * T - 30, () => { L.stampSlam('ink_rewrite', cx, (D - 8) * T, { scale: 0.8, from: 2.2, hold: 1200 }); for (let x = 139; x < 144; x++) for (let y = D - 2; y < D; y++) { const t = L.layer.getTileAt(x, y); if (t) { L.layer.removeTileAt(x, y); L.fx.burst('brick', x * T + 8, y * T + 8, 4, 130); } } Audio.sfx('break'); L.toast(P2.rewrite2); }));
      L.wait(2000, () => { L.toast(P2.crushed); L.lock(false); });
    });
    k.sign(145, D + 5, 'p2last', { range: 24 }); k.machine(142.4, D + 5); k.row(146, D + 4, 3); k.barrier(150, D + 5, 'barrier_rev', { flag: 'rev2', tall: 120 }); chap(4, 153, D + 3.6); k.coffee([156, D + 1], [158, D - 2.2]); L.trigger(159, D - 8, 2, 7.2, () => L.toast(P2.corridor));
    // ---- last page and assembly
    k.machine(161, D - 1); k.row(163, D - 2, 5); k.format(168, D - 1); chap(5, 172, D - 3); const END = 177; k.prop(END, D - 1, 'framework', { d: 1, a: 0, anim: false }); L.fx.glow(END * T, (D - 4) * T, 'w', 2, 3, 0.5);
    L.trigger(END - 3, D - 8, 7, 7.2, () => this.assemble(L, END, CH.filter((i) => L.flag(`ch${i}`)).length));
  },
  assemble(L, END, n) {
    if (L.asm) return; L.asm = true; const p = L.player; L.lock(true); p.inv = 99999; p.face = 1; p.forceAnim = 'leo_stare'; Audio.music(L, null, 600); const cx = END * T; const cy = (D - 6.2) * T; L.cameras.main.stopFollow(); L.cameras.main.pan(cx - 30, (D - 4.6) * T, 900, 'Sine.easeInOut'); if (n < 5) L.toast(P2.backup);
    const gl = L.fx.glow(cx, cy, 'w', 0.4, 28, 0); L.tweens.add({ targets: gl, scale: 2, alpha: 0.5, duration: 4200 }); const pages = [];
    for (let i = 0; i < 24; i++) { const s = L.add.image(p.x, p.y - 20, 'atlas', 'page/0').setDepth(30).setScale(0); const q = { a: i * 0.52, r: 0 }; pages.push(s); L.tweens.add({ targets: s, scale: 1, delay: i * 60, duration: 250 }); L.tweens.add({ targets: q, a: q.a + 9.4, r: 78, delay: i * 60, duration: 2300, ease: 'Sine.out', onUpdate: () => s.setPosition(cx + Math.cos(q.a) * q.r, cy + Math.sin(q.a) * q.r * 0.6).setAngle(q.a * 40), onComplete: () => L.tweens.add({ targets: s, x: cx, y: cy, scale: 0.5, duration: 520, ease: 'Back.in', onComplete: () => { s.destroy(); Audio.sfx('book', { v: 0.6 }); } }) }); }
    L.wait(700, () => Audio.sfx('summon')); [1, 2, 3, 4, 5].forEach((i) => L.wait(1000 + i * 520, () => { Audio.sfx('tick'); const t = wtxt(L, cx + (i - 3) * 34, cy + 64, `Ch. ${i}`, 12, '#fff0a0', { depth: 45 }); L.tweens.add({ targets: t, y: t.y - 14, duration: 300 }); L.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 400, onComplete: () => t.destroy() }); }));
    L.wait(4700, () => {
      L.tweens.add({ targets: gl, alpha: 0.15, delay: 600, duration: 900 }); const th = L.add.image(cx, cy, 'atlas', 'thesis/0').setDepth(34).setScale(0.1); L.tweens.add({ targets: th, scale: 1.5, angle: 360, duration: 600, ease: 'Back.out' }); L.hud.white(900, 0xfff0c0); L.cameras.main.shake(500, 0.015); Audio.sfx('stampyes'); Audio.sfx('fanfare'); L.fx.ring(cx, cy, 0xfff0a0, 7); L.fx.confetti(cx, cy, 60, 220); L.fx.rain(6000); L.hud.big(P2.assembled, { y: 120, size: 64, ms: 4200 }); L.celebrate(); Audio.music(L, 'ending', 400); L.unlock('chapters'); for (let i = 0; i < 6; i++) L.wait(i * 380, () => { L.fx.confetti(cx + (Math.random() - 0.5) * 220, cy + (Math.random() - 0.5) * 80, 26); Audio.sfx('confetti', { v: 0.5 }); });
      L.wait(1500, () => L.tweens.add({ targets: th, x: p.x, y: p.y - 50, scale: 0.8, duration: 900, ease: 'Sine.inOut' })); L.wait(5000, () => L.finish());
    }); void pages;
  },
  onRespawn(L) { L.resetBridge && L.resetBridge(); },
};
