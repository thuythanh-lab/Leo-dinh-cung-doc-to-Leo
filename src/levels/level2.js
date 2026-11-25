import { kit, T, TOAST, Audio } from './kit.js';
import { TALK, BIG } from '../config/text.js';

const HUB = { x: 23, y: 17 };
const GARDEN_LEDGE = 11; // reachable from the nearby leaf without the full timed lift sequence
export default {
  id: 2, name: 'The Hall of Legendary Scholars', sub: 'Please be quiet. The theory is sleeping.', w: 150, h: 56, spawn: { x: 4, y: 17 },
  hudItems: [['em_water', 'emblem_water'], ['em_ent', 'emblem_ent'], ['em_infra', 'emblem_infra']],
  tiles(b) {
    b.zone({ id: 'hub', x: 0, y: 0, w: 62, h: 20, theme: 'library', music: 'library', shade: [0x2a1040, 0.12] });
    b.zone({ id: 'water', x: 64, y: 0, w: 48, h: 28, theme: 'water', music: 'water', shade: [0x0a3048, 0.14] });
    b.zone({ id: 'rabbit', x: 116, y: 0, w: 32, h: 18, theme: 'library', music: 'library', deadly: false, shade: [0x1c1040, 0.2] });
    b.zone({ id: 'garden', x: 0, y: 30, w: 72, h: 20, theme: 'garden', music: 'garden', shade: [0x401060, 0.08] });
    b.zone({ id: 'archive', x: 74, y: 30, w: 60, h: 22, theme: 'archive', music: 'archive', shade: [0x0a1040, 0.12] });
    // --- hub
    b.fill(0, 17, 62, 3); b.fill(0, 0, 1, 20); b.fill(61, 0, 1, 20); b.plat(3, 12, 14); b.plat(17, 14, 3); b.plat(40, 14, 3); b.plat(43, 12, 14); b.plat(20, 11, 3); b.plat(37, 11, 3); b.plat(23, 8, 14); b.fill(27, 16, 7, 1);
    // --- water observatory (offset 64,0)
    const W = 64; b.fill(W, 0, 48, 1); b.fill(W, 0, 1, 28); b.fill(W + 47, 0, 1, 28); b.fill(W, 25, 48, 3); b.fill(W + 1, 12, 8, 13); b.ladder(W + 9, 12, 13);
    b.fill(W + 28, 12, 19, 13); b.cut(W + 28, 21, 15, 4); b.cut(W + 40, 8, 3, 14); b.fill(W + 43, 9, 4, 16);
    b.fill(W + 25, 4, 10, 1); b.cut(W + 28, 25, 0, 0);
    // --- garden (offset 0,30)
    const G = 30; b.fill(0, G, 1, 20); b.fill(71, G, 1, 20); b.ground(1, 13, G + 14, 50); b.ground(14, 25, G + 18, 50); b.haz(14, G + 17, 12); b.ground(26, 34, G + 14, 50); b.ground(35, 53, G + 18, 50); b.haz(35, G + 17, 19); b.ground(54, 58, G + 14, 50); b.ground(59, 63, G + 15, 50); b.ground(64, 71, G + GARDEN_LEDGE, 50); b.fill(64, G, 8, 1);
    // --- archives (offset 74,30)
    const A = 74; b.fill(A, 30, 1, 22); b.fill(A + 59, 30, 1, 22); b.ground(A + 1, A + 9, 42, 52); b.ground(A + 21, A + 27, 42, 52); b.ground(A + 33, A + 39, 37, 52); b.ground(A + 51, A + 59, 40, 52);
    // --- rabbit hole
    b.room(116, 0, 32, 18, 1); b.fill(117, 15, 30, 2); b.plat(122, 12, 4); b.plat(130, 10, 4); b.plat(138, 12, 4);
  },
  build(b, L) {
    const k = kit(L);
    this.hub(k, L); this.water(k, L); this.garden(k, L); this.archive(k, L); this.rabbit(k, L);
  },
  encounter(k, L, o) { // shared scholar encounter
    const s = k.prop(o.x, o.y, o.who, { d: 17 }); const gl = L.fx.glow(o.x * T, (o.y - 1.5) * T, o.glow, 1.2, 8, 0.5); if (o.flip) s.setFlipX(true);
    if (o.emerge && !L.flag(o.flag)) s.setAlpha(0);
    const done = () => L.flag(o.flag);
    const door = k.door(o.dx, o.dy, { to: { x: HUB.x, y: HUB.y }, disabled: () => !done(), label: undefined }); door.setAlpha(done() ? 1 : 0.15);
    L.trigger(o.tx, o.ty, o.tw, o.th, () => {
      if (done()) return; L.player.face = s.x > L.player.x ? 1 : -1; const talk = () => L.say(TALK[o.talk], () => {
        L.setFlag(o.flag); L.unlock(o.who); L.fx.ring(s.x, s.y - 22, 0xfff0a0, 3); L.fx.sparkle(s.x, s.y - 24, 18, 34); Audio.sfx('special'); door.setAlpha(1);
        const e = L.add.image(s.x, s.y - 40, 'atlas', `${o.emblem}/0`).setDepth(30).setScale(0.2); L.tweens.add({ targets: e, scale: 1.4, y: s.y - 60, duration: 600, ease: 'Back.out' }); L.tweens.add({ targets: e, x: L.player.x, y: L.player.y - 20, scale: 0.2, alpha: 0.2, delay: 1300, duration: 500, onComplete: () => { e.destroy(); Audio.sfx('checkpoint'); } });
      });
      if (o.emerge) { L.lock(true); for (let i = 0; i < 26; i++) { const p = L.add.sprite(s.x + (Math.random() - 0.5) * 200, s.y - Math.random() * 130, 'atlas', 'paper/0').setDepth(18).setAlpha(0.9); L.tweens.add({ targets: p, x: s.x, y: s.y - 20, angle: 360, alpha: 0, delay: i * 30, duration: 900, ease: 'Quad.in', onComplete: () => p.destroy() }); } Audio.sfx('book'); L.wait(900, () => { L.tweens.add({ targets: s, alpha: 0.95, duration: 500 }); Audio.sfx('summon'); L.fx.ring(s.x, s.y - 20, 0xc8beff, 3); }); L.wait(1600, talk); } else talk();
    });
    return { s, gl };
  },
  hub(k, L) {
    k.prop(8, 17, 'shelf_big', { d: 1 }); k.prop(20, 17, 'shelf_big', { d: 1 }); k.prop(41, 17, 'shelf_big', { d: 1 }); k.prop(48, 17, 'shelf_small', { d: 1 }); [[6, 12], [13, 12], [48, 12], [56, 12], [27, 8], [35, 8]].forEach(([x, y]) => k.prop(x, y, 'shelf_small', { d: 1, a: 0.95 }));
    [[14, 4], [30, 2.5], [46, 4]].forEach(([x, y]) => k.prop(x, y, 'b_chandelier', { oy: 0, d: 3, glow: 'w', gy: 0, gs: 1.4 })); [[2.5, 15], [24.5, 15], [36.5, 15], [59.5, 14]].forEach(([x, y]) => k.prop(x, y, 'b_torch', { d: 3, glow: 'w', gy: 0.5, gs: 0.7 }));
    for (let i = 0; i < 8; i++) k.prop(5 + i * 7, 5 + (i % 2), 'b_portrait', { f: i, d: 1 }); [[26, 17], [35, 17], [16, 12], [44, 12]].forEach(([x, y], i) => k.prop(x, y, 'b_founder', { f: i * 2, d: 2 })); k.prop(18.5, 17, 'b_lectern', { d: 3 }); k.prop(43, 17, 'b_armillary', { d: 3 }); k.prop(53, 12, 'b_tall', { f: 4, d: 2 });
    k.sign(7, 17, 'quiet'); k.machine(12, 17); k.row(17.6, 13, 3); k.row(40.6, 13, 3); k.row(20.6, 10, 3); k.row(37.6, 10, 3); k.row(24, 7, 5, 2.6);
    k.citation(30, 12.4, { range: 60 }); k.gremlin(46, 17);
    k.door(9, 12, { to: { x: 67, y: 12 }, tint: 0x9fe0ff, label: 'Water & Power' }); k.door(51, 12, { to: { x: 3, y: 44 }, tint: 0xb8f0a0, label: 'Entangled Worlds' }); k.door(30, 8, { to: { x: 77, y: 42 }, tint: 0xc0b8ff, label: 'Invisible Infrastructure' });
    L.wait(2600, () => L.toast(TOAST.hall));
    // dais
    const ped = k.prop(30.5, 16.1, 'b_lectern', { d: 3, s: 1.2 }); const gl = L.fx.glow(30.5 * T, 13 * T, 'p', 1, 7, 0.2); let ready = false;
    const orbit = ['emblem_water', 'emblem_ent', 'emblem_infra'].map((n) => L.add.image(0, 0, 'atlas', `${n}/0`).setDepth(16).setAlpha(0)); const flags = ['em_water', 'em_ent', 'em_infra'];
    L.ents.push({ update: () => { orbit.forEach((o, i) => { const on = L.flag(flags[i]); const a = L.clock / 900 + i * 2.094; o.setPosition(30.5 * T + Math.cos(a) * 26, 12.6 * T + Math.sin(a) * 9).setAlpha(on && !L.flag('fw') ? 0.95 : 0); }); const all = flags.every((f) => L.flag(f)); if (all && !ready) { ready = true; gl.setAlpha(0.8); } if (all && !L.flag('toldDais') && L.zone.id === 'hub' && !L.cinematic && !L.teleporting) { L.setFlag('toldDais'); L.toast(TOAST.dais); Audio.sfx('bong'); } } });
    L.trigger(28, 10, 5, 7, () => {
      if (!flags.every((f) => L.flag(f)) || L.flag('fw') || L.cinematic) return; L.setFlag('fw'); L.lock(true); L.player.forceAnim = 'leo_idle'; orbit.forEach((o) => { o.setAlpha(1); }); Audio.sfx('rumble'); L.cameras.main.shake(900, 0.004);
      const c = { x: 30.5 * T, y: 11 * T }; flags.forEach((f, i) => { const o = L.add.image(c.x + Math.cos(i * 2.094) * 70, c.y + Math.sin(i * 2.094) * 40, 'atlas', `${['emblem_water', 'emblem_ent', 'emblem_infra'][i]}/0`).setDepth(30); L.tweens.add({ targets: o, x: c.x, y: c.y, scale: 1.6, duration: 1300, ease: 'Back.in', onComplete: () => o.destroy() }); });
      L.wait(1300, () => { L.hud.white(700); Audio.sfx('fanfare'); const f = L.add.sprite(c.x, c.y, 'atlas', 'framework/0').setDepth(31).setScale(0.1).play('framework'); L.fx.glow(c.x, c.y, 'w', 2.4, 29, 0.7); L.tweens.add({ targets: f, scale: 1.5, duration: 600, ease: 'Back.out' }); L.tweens.add({ targets: f, y: c.y - 5, delay: 600, yoyo: true, repeat: -1, duration: 900 }); L.fx.ring(c.x, c.y, 0xfff0a0, 5); L.fx.confetti(c.x, c.y, 60); L.hud.big(BIG.framework, { y: 96, size: 52, ms: 5200, done: () => L.finish() }); });
    }, false);
    // rabbit hole, behind suspicious overdue books
    k.sign(52, 17, 'books', { range: 30 }); k.barrier(55, 17, 'barrier_books', { flag: 'rabbitWall', onBreak: () => k.secretRoom('rabbitFound') }); k.door(58.5, 17, { sprite: 'rabbithole', to: { x: 119, y: 15 }, depth: 6, onEnter: () => {} }); void ped;
  },
  water(k, L) {
    const X = 64; const TAU = Math.PI * 2; L.levels = { low: 24.6, mid: 17, high: 11 };
    const W = L.addWater({ x: X + 9, y: 1, w: 38, h: 24, level: L.flag('wHigh') ? 11 : L.flag('wLow') ? 24.6 : 17 });
    const set = (n) => { W.want = L.levels[n] * T; L.setFlag('wHigh', n === 'high'); L.setFlag('wLow', n === 'low'); L.toast(n === 'low' ? TOAST.waterLow : n === 'mid' ? TOAST.waterMid : TOAST.waterHigh); Audio.sfx('rumble', { v: 0.7 }); Audio.sfx('splash'); L.cameras.main.shake(500, 0.004); };
    k.fall(X + 11, 1, 2, 23, 1); k.fall(X + 36, 1, 1.5, 11, 1); k.prop(X + 5, 12, 'b_founder', { f: 1, d: 2 }); k.prop(X + 2, 12, 'b_torch', { d: 3, glow: 'c', gy: 0.5, oy: 1 });
    k.door(X + 3, 12, { to: { x: 9, y: 12 } }); k.sign(X + 5.2, 12, 'water', { range: 24 }); k.sw(X + 7.5, 12, 'valve', { on: () => set(L.flag('wLow') ? 'mid' : 'low') });
    k.sign(X + 25, 25, 'water2'); k.sw(X + 38, 25, 'valve', { on: () => set('high') }); k.row(X + 29.5, 24, 6, 1.3); k.gremlin(X + 20, 25); k.arc(X + 10.5, 20, 5, 1); [[X + 41.5, 20], [X + 41.5, 17], [X + 41.5, 14]].forEach(([x, y]) => k.coffee([x, y]));
    k.raft(X + 12); k.raft(X + 26); k.machine(X + 31, 12);
    // the wheel
    const cx = X + 19; const cy = 8.5; const r = 4.5; const wh = L.add.image(cx * T, cy * T, 'atlas', 'bigwheel/0').setDepth(3); const sp = []; for (let i = 0; i < 4; i++) sp.push(k.spoke(cx, cy, r, (i / 4) * TAU, 'plat_paddle', { ms: 11000, running: L.flag('wheelOn') }));
    const fall = k.fall(cx - 0.8, 1, 1.6, 3.2, 2); const vis = (v) => { fall.setVisible(v); fall.foam.setVisible(v); }; vis(L.flag('wheelOn'));
    k.sw(X + 45.4, 9, 'lever', { once: true, on: () => { L.setFlag('wheelOn'); sp.forEach((s) => { s.running = true; }); vis(true); L.toast(TOAST.wheel); Audio.sfx('creak'); L.cameras.main.shake(300, 0.005); } }); k.arrow(X + 45.4, 7);
    L.ents.push({ update: (dt) => { wh.rotation += (dt / 11000) * TAU * sp[0].sp; } });
    k.coffee([X + 23.6, 4], [X + 24.6, 2.8]); k.row(X + 27, 3, 4);
    this.encounter(k, L, { who: 'margreet', talk: 'margreet', flag: 'em_water', emblem: 'emblem_water', x: X + 33, y: 4, flip: true, glow: 'c', tx: X + 29, ty: 0, tw: 5, th: 4.1, dx: X + 27.5, dy: 4 });
  },
  garden(k, L) {
    const G = 30; k.prop(6, G + 14.2, 'shroom_1', { d: 1 }); k.prop(31, G + 14.2, 'shroom_0', { d: 1 }); k.prop(12, G + 14.2, 'tree_p', { d: 1 }); k.prop(57, G + 14.2, 'tree_p', { d: 1 }); k.prop(69, G + GARDEN_LEDGE + 0.2, 'tree_p', { d: 1 }); k.prop(28, G + 14, 'shroom_2', { d: 2 }); k.prop(50, G + 18, 'shroom_1', { d: 1 }); k.prop(40, G + 18, 'shroom_0', { d: 1 });
    [[9, 8], [20, 5], [38, 6], [47, 4], [60, 4]].forEach(([x, y], i) => { const s = k.prop(x, G + y, i % 2 ? 'gearbig' : 'gearsm', { oy: 0.5, d: 0, a: 0.75 }); L.ents.push({ update: (dt) => { s.rotation += dt * (i % 2 ? 0.0004 : -0.0007); } }); }); [[4, 10], [18, 12], [33, 9], [45, 10], [62, 8]].forEach(([x, y]) => { const m = k.prop(x, G + y, 'b_moth', { d: 12, oy: 0.5 }); L.tweens.add({ targets: m, x: m.x + 50, y: m.y - 26, yoyo: true, repeat: -1, duration: 3200 + x * 40, ease: 'Sine.inOut' }); });
    k.door(2.5, G + 14, { to: { x: 51, y: 12 } }); k.sign(6, G + 14, 'garden');
    // 1: pods -> leaves
    const leaves = [[16, 13.5], [19.8, 12.5], [23.4, 13.5]].map(([x, y]) => k.leaf(x, G + y)); const pods = []; const grow = () => { leaves.forEach((l, i) => L.wait(i * 130, () => l.grow())); pods.forEach((p) => p.fr(1)); Audio.sfx('boing'); L.toast(TOAST.podGrow, { ms: 900 }); L.wait(6500, () => pods.forEach((p) => p.reset())); };
    pods.push(k.sw(11.5, G + 14, 'pod', { on: grow }), k.sw(27.5, G + 14, 'pod', { on: grow })); k.coffee([16, G + 11.6], [19.8, G + 10.6], [23.4, G + 11.6]); k.citation(20, G + 8, { range: 50 });
    // 2: mushroom -> beetle -> roots -> gate
    const gate = k.gate(56.5, G + 14, 'vinegate', { flag: 'rootGate' }); b2(); function b2() {
      const root = k.prop(51, G + 17.4, 'rootplate', { d: 9 }); const beetle = k.beetle(37.5, G + 13.2, { dist: 13.5, onEnd: () => { root.setFrame('rootplate/1'); if (!gate.dead && !gate.opening) { L.toast(TOAST.root); Audio.sfx('switch'); gate.open(); } } }); root.y = (G + 16.4) * T;
      k.sw(31, G + 14, 'mushsw', { on: () => { beetle.wake(); if (!L.flag('beetle')) { L.setFlag('beetle'); L.toast(TOAST.beetle); } } }); if (L.flag('beetle')) beetle.wake(); k.arrow(31, G + 10.6); k.arc(37, G + 11, 8, 1, 1.7); k.prop(51, G + 18, 'fl_shroom', { f: 2 });
    }
    k.machine(34, G + 14);
    // 3: entangled platforms
    const a = k.linked(60, G + 14, 'plat_leaf', { thread: 0xff9ad0, sink: 0.6 }); const bb = k.linked(62.4, G + 13.6, 'plat_leaf', { lift: 2.6, thread: 0xff9ad0, sink: 0.5 }); const c = k.linked(60, G + 13, 'plat_leaf', { lift: 4.8, thread: 0x8ff0ff, sink: 0.4, lifter: bb }); a.partner = bb; bb.partner = a; c.partner = null; c.hx = 59.9 * T; c.x = c.hx;
    k.coffee([62.4, G + 9.5], [60, G + 6.8]);
    this.encounter(k, L, { who: 'donna', talk: 'donna', flag: 'em_ent', emblem: 'emblem_ent', x: 69, y: G + GARDEN_LEDGE, flip: true, glow: 'g', tx: 65, ty: G + GARDEN_LEDGE - 6, tw: 5, th: 6.2, dx: 66.3, dy: G + GARDEN_LEDGE });
  },
  archive(k, L) {
    const A = 74; k.door(A + 3, 42, { to: { x: 30, y: 8 } }); k.sign(A + 5.4, 42, 'archive'); [[A + 8, 42], [A + 22, 42], [A + 35, 37], [A + 55, 40]].forEach(([x, y]) => k.prop(x, y, 'b_console', { d: 2 }));
    const groups = { 1: [], 2: [], 3: [] }; const wires = L.add.graphics().setDepth(3); const extra = [];
    const reveal = (n) => { if (L.flag(`inf${n}`) && groups[n][0]?.shown) return; L.setFlag(`inf${n}`); groups[n].forEach((p, i) => L.wait(i * 160, () => { p.reveal(); Audio.sfx('tick'); })); L.toast(TOAST.reveal[n - 1]); L.fx.ring(L.player.x, L.player.y - 14, 0x93b4ff, 5); draw(n); if (n === 3) extra.forEach((f) => f()); };
    const draw = (n) => { wires.lineStyle(1, 0x5f7ce0, 0.5); groups[n].forEach((p) => { wires.strokePoints([{ x: p.hx, y: p.hy }, { x: p.hx, y: p.hy + 60 }, { x: p.hx + 40, y: p.hy + 60 }, { x: p.hx + 40, y: p.hy + 180 }], false); wires.fillStyle(0x93b4ff, 0.8); wires.fillRect(p.hx - 2, p.hy + 58, 4, 4); wires.fillRect(p.hx + 38, p.hy + 120, 4, 4); }); };
    const add = (g, x, y, o) => groups[g].push(k.infra(A + x, y, o));
    add(1, 11.8, 42); add(1, 15.2, 41); add(1, 18.6, 42); add(2, 30, 42, { dy: -5, ms: 5200 }); add(2, 24.5, 38.6); add(3, 41.5, 37, { dx: 3, ms: 4200 }); add(3, 47.5, 38.5, { dy: 2.5, ms: 3600 }); add(3, 44.5, 34);
    k.sw(A + 7.5, 42, 'terminal', { once: true, on: () => reveal(1) }); k.sw(A + 25.5, 42, 'terminal', { once: true, on: () => reveal(2) }); k.sw(A + 37.5, 37, 'terminal', { once: true, on: () => reveal(3) }); k.machine(A + 23, 42);
    extra.push(() => { k.spinner(A + 44.5, 39.6, 2, 4); L.fx.sparkle((A + 44.5) * T, 39.6 * T, 8, 30); });
    k.arc(A + 11, 39.5, 8, 1); k.coffee([A + 24.5, 37], [A + 30, 36], [A + 44.5, 32.6]); k.tracked(A + 16, 38, { range: 4 }); k.citation(A + 35, 33, { range: 30 });
    [1, 2, 3].forEach((n) => { if (L.flag(`inf${n}`)) { groups[n].forEach((p) => p.reveal()); draw(n); if (n === 3) extra.forEach((f) => f()); } });
    this.encounter(k, L, { who: 'star', talk: 'star', flag: 'em_infra', emblem: 'emblem_infra', emerge: true, x: A + 56, y: 40, flip: true, glow: 'p', tx: A + 52, ty: 34, tw: 4, th: 6.2, dx: A + 53, dy: 40 });
  },
  rabbit(k, L) {
    k.door(118.5, 15, { to: { x: 57, y: 17 } }); for (let i = 0; i < 5; i++) k.prop(123 + i * 5, 15, i % 2 ? 'shelf_big' : 'shelf_small', { d: 1 }); k.prop(132, 2, 'b_chandelier', { oy: 0, glow: 'w', gy: 0, gs: 1.6 }); k.prop(145, 15, 'b_orrery', { d: 2 });
    if (L.flag('rabbitDone')) return; let alive = 0; let got = 0; const spots = [[124, 11], [132, 9], [140, 11], [120, 14], [128, 14], [136, 14], [144, 14], [126, 8], [134, 6], [142, 8], [122, 14], [130, 13], [138, 14], [132, 14], [140, 9], [124, 14], [136, 9]]; let n = 0;
    const spawn = (x, y) => { alive++; k.item(x, y, 'paper', { onGet: () => { alive--; got++; Audio.sfx('page'); if (got < 9) { for (let i = 0; i < 2 && n < spots.length; i++) { const s = spots[n++]; spawn(s[0], s[1]); } } else if (alive <= 0 || got >= 12) end(); L.float(L.player.x, L.player.y - 34, `${got} read, ${alive} to read`, '#fff0c0', 900); if (alive <= 0 && got >= 9) end(); } }); };
    let over = false; const end = () => { if (over) return; over = true; L.setFlag('rabbitDone'); L.unlock('rabbit'); L.toast(TOAST.rabbit, { ms: 4200 }); L.fx.confetti(L.player.x, L.player.y - 30, 40); };
    spawn(122, 13.6); L.trigger(117, 5, 4, 11, () => L.toast(TOAST.rabbitStart));
  },
};
