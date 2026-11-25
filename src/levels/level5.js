import { kit, T, TOAST, Audio } from './kit.js';
import { BIG } from '../config/text.js';
import { wtxt, pick } from '../core/util.js';
import { warnStamp } from './level3.js';

const F1 = 80; const F2 = 63; const F3 = 46;
export default {
  id: 5, name: 'Bureaucracy: The Final Form', sub: 'Please complete Form 1 to request Form 1.', w: 112, h: 86, spawn: { x: 3, y: F1 },
  hudItems: [['s_blue', 'stamp_blue'], ['s_red', 'stamp_red'], ['s_gold', 'stamp_gold']],
  tiles(b) {
    b.zone({ id: 'boss', x: 0, y: 0, w: 112, h: 18, theme: 'office', music: 'boss2' });
    b.zone({ id: 'main', x: 0, y: 20, w: 112, h: 66, theme: 'office', music: 'office', shade: [0x202040, 0.08] });
    b.fill(0, 20, 1, 66); b.fill(111, 20, 1, 66);
    // floor 1 (rightwards)
    b.fill(0, F1, 112, 6); b.cut(34, F1, 14, 3); b.haz(34, F1 + 2, 14); b.fill(0, F2, 112, 5); b.cut(76, F2, 5, 5); b.fill(84, F2 + 5, 27, 12); // wall off right side
    b.plat(52, 76, 3); b.plat(56, 73, 4); b.brk(62, 76, 1, 4); b.fill(62, F2 + 5, 1, 8);
    // floor 2 (leftwards)
    b.fill(0, F3, 112, 5); b.cut(4, F3, 5, 5); b.fill(84, F3 + 5, 27, 12); b.fill(63, F3 + 5, 2, 12); b.plat(34, 59, 3); b.plat(38, 56, 4); b.cut(40, F2, 8, 2); b.haz(40, F2 + 1, 8);
    // floor 3 (rightwards)
    b.fill(0, 20, 112, 9); b.cut(32, F3, 26, 2); b.haz(32, F3 + 1, 26); b.fill(70, 38, 6, 1); b.fill(96, 29, 15, 17); b.plat(66, 42, 3);
    // boss corridor
    b.fill(0, 15, 112, 3); b.fill(0, 0, 1, 18); b.fill(111, 0, 1, 18); b.cut(30, 15, 5, 3); b.cut(56, 15, 5, 3); b.cut(78, 15, 6, 3); b.plat(14, 11, 3); b.plat(44, 11, 3); b.plat(66, 11, 3);
  },
  wall(k, L, x, y, color, flag, o = {}) {
    const w = k.barrier(x, y, `wall_${color}`, { flag: `w_${flag}`, tall: 160, hp: o.hp ?? 14, locked: o.need ? () => !L.flag(o.need) : null, lockedMsg: TOAST.wallStamp, onHit: () => { if (!w.said) { w.said = true; L.toast(pick(TOAST.wallRed)); } }, onBreak: () => L.toast(TOAST.wallOpen) });
    if (w.dead) return w; const t = wtxt(L, w.x, w.y - 104, BIG.wall, 9, color === 'gold' ? '#fff0a0' : color === 'blue' ? '#b8d0ff' : '#ffb0a8', { depth: 14, st: 3 }); w.label = t;
    if (o.need) { w.ra = false; const ic = L.add.image(w.x, w.y - 48, 'atlas', `${o.icon}/0`).setDepth(13).setScale(1.2); L.ents.push({ update: () => { if (w.dead) { ic.destroy(); ic.setVisible && ic.active && ic.setVisible(false); } else if (L.flag(o.need) && L.near(w.x, w.y - 40, 60) && !w.op) { w.op = true; L.stampSlam('ink_app', w.x, w.y - 50, { scale: 0.45, from: 1.6, hold: 600, done: () => w.shatter() }); } } }); }
    return w;
  },
  build(b, L) {
    const k = kit(L);
    for (let i = 0; i < 18; i++) { const y = [F1, F2, F3][i % 3]; const x = 4 + ((i * 29) % 78); if ((y === F1 && x > 32 && x < 49) || (y === F2 && x > 38 && x < 50) || (y === F3 && x > 30)) continue; k.prop(x, y, i % 2 ? 'b_desk' : 'shelf_small', { d: 1 }); }
    [[10, F1], [30, F1], [54, F1], [70, F1], [24, F2], [56, F2], [74, F2], [12, F3], [24, F3], [64, F3], [84, F3]].forEach(([x, y]) => k.prop(x, y, 'b_tall', { f: 7, d: 3, glow: 'w', gy: 0.85 })); [[16, 70], [44, 70], [66, 70], [14, 54], [44, 53], [72, 54], [20, 35], [50, 33], [84, 34]].forEach(([x, y]) => k.prop(x, y, 'b_clockface', { oy: 0.5, d: 1 })); [[26, F1], [58, F2], [18, F3], [80, F3]].forEach(([x, y]) => k.prop(x, y, 'inbox', { d: 3 }));
    const stamp = (id, x, y) => k.item(x, y, `stamp_${id}`, { flag: `s_${id}`, onGet: () => { L.toast(TOAST.stamp[id]); L.stampSlam('ink_app', L.player.x, L.player.y - 60, { scale: 0.5, from: 1.5, hold: 700 }); } });
    // ------------------------------------------------ floor 1
    k.sign(6, F1, 'f1'); k.row(8, F1 - 1, 3); this.wall(k, L, 14, F1, 'red', 'a'); L.trigger(10, F1 - 10, 2, 10.2, () => { if (!L.flag('w_a')) { L.toast(pick(TOAST.wallRed), { title: BIG.denied, color: '#ff9a8a' }); Audio.sfx('stampno', { v: 0.6 }); } });
    k.gremlin(19, F1); k.conveyor(21, F1 - 0.85, 10, -1, 64); k.crusher(26, F1 - 6.4, 5.6, { period: 3000 }); k.row(22, F1 - 2.4, 5, 1.8); k.sign(18, F1, 'email', { range: 26 }); k.machine(32.4, F1);
    k.mover(36.4, F1 - 1, 'plat_cab', { dy: -2, ms: 3600, solid: true, bh: 30 }); k.mover(41, F1 - 2.4, 'plat_cab', { dy: 1.6, ms: 3200, solid: true, bh: 30 }); k.mover(45.4, F1 - 1, 'plat_cab', { dy: -2, ms: 4000, solid: true, bh: 30 }); k.arc(36, F1 - 5, 10, 1.2, 1.05); k.citation(41, F1 - 8, { range: 40 });
    stamp('blue', 58, F1 - 8.6); k.row(52.6, F1 - 5.4, 3); k.gremlin(55, F1); k.special(64, F1 - 1); this.wall(k, L, 69, F1, 'blue', 'blue', { need: 's_blue', icon: 'stamp_blue' }); k.machine(72.4, F1);
    k.mover(78.6, F1 - 0.4, 'plat_lift', { dy: -(F1 - F2) + 0.4, ms: 8200 }); k.mover(81.8, F1 - 3, 'plat_lift', { dy: -8, ms: 6200, phase: 0.3 }); k.row(78.6, 70, 1); k.coffee([78.6, 74], [78.6, 66]); k.arrow(78.6, F1 - 4);
    // ------------------------------------------------ floor 2
    k.machine(74, F2); k.sign(72.4, F2, 'f2', { range: 24 });
    const loop = () => L.toast(pick(TOAST.roomLoop)); k.door(70.4, F2, { label: 'Room 7B', to: { x: 67, y: F2 }, onEnter: loop }); k.door(67, F2, { label: 'Room 7-B', to: { x: 59.6, y: F2 }, onEnter: () => L.toast(TOAST.roomOk) }); k.door(82, F2, { label: 'Room B7', to: { x: 73, y: F2 }, onEnter: loop });
    k.door(60.4, F2, { label: 'Room 7-B', to: { x: 68, y: F2 } }); k.sw(56.4, F2, 'ticket', { range: 18, on: (s) => { s.n = (s.n || 47) + 1; L.float(s.x, s.y - 46, `Now serving: ${s.n}`, '#ff9a8a'); Audio.sfx('bong'); if (s.n > 51 && !s.gift) { s.gift = true; L.toast('Queue abandoned. Coffee awarded.'); k.special(55, F2 - 1.2); } } }); k.sign(57.8, F2, 'queue', { range: 20 });
    k.crusher(52.4, F2 - 6.4, 6.4, { period: 2600 }); k.format(50.4, F2); k.mover(46, F2 - 0.6, 'plat_cab', { dx: -3.6, ms: 4200, solid: true, bh: 30 }); k.coffee([45, F2 - 4], [42, F2 - 4]); k.gremlin(37, F2); k.row(38.6, F2 - 8.4, 3); stamp('red', 40, F2 - 9);
    k.machine(33, F2); this.wall(k, L, 29, F2, 'red', 'red', { need: 's_red', icon: 'stamp_red' }); k.conveyor(14, F2 - 0.85, 12, 1, 60); k.crusher(22, F2 - 6.4, 5.6, { period: 2700 }); k.crusher(17, F2 - 6.4, 5.6, { period: 2700, phase: 0.5 }); k.stress(26, F2 - 5); k.sign(12, F2, 'who', { range: 26 });
    k.mover(6.4, F2 - 0.4, 'plat_lift', { dy: -(F2 - F3) + 0.4, ms: 8200 }); k.coffee([6.4, 58], [6.4, 54], [6.4, 50]); k.machine(10.4, F2);
    // ------------------------------------------------ floor 3
    k.sign(11.4, F3, 'f3', { range: 24 }); k.machine(13.6, F3); k.writers(20, F3, { flag: 'writers5', tall: 260 }); k.barrier(27, F3, 'barrier_admin', { flag: 'admin5', tall: 260 }); k.gremlin(24, F3);
    k.machine(30.4, F3); k.mover(34.4, F3 - 0.6, 'plat_lift', { dx: 4, ms: 4600 }); k.cell(42, F3 - 1.4, 'a'); k.cell(45.2, F3 - 2.2, 'b'); k.cell(48.4, F3 - 1.6, 'a'); k.mover(51.6, F3 - 0.6, 'plat_lift', { dx: 4, ms: 4400, phase: 0.4 }); k.tracked(45, F3 - 7, { range: 6 }); k.arc(41.4, F3 - 4, 8, 1.2);
    k.machine(60, F3); const gate = k.gate(70.5, F3, 'sluice', { flag: 'mech' }); const gate2 = k.gate(70.5, F3 - 4, 'sluice', { flag: 'mech2' }); let pulled = 0; const pull = () => { pulled++; L.float(L.player.x, L.player.y - 36, pulled < 2 ? 'Approval mechanism: 1/2' : 'Approval mechanism: 2/2', '#c8ffd8'); if (pulled >= 2) { gate.open(); gate2.open(true); } };
    k.sw(63, F3, 'lever', { once: true, on: pull }); k.sw(67.4, 42, 'lever', { once: true, on: pull }); if (L.flag('mech')) pulled = 2; k.gremlin(65, F3); stamp('gold', 73, 36); k.mover(77.8, F3 - 0.6, 'plat_lift', { dy: -7.6, ms: 4600 }); k.row(71, 36.8, 4); k.special(75.4, 36.6); k.gremlin(74, F3);
    this.wall(k, L, 86, F3, 'gold', 'gold', { need: 's_gold', icon: 'stamp_gold' }); k.machine(89.6, F3); k.door(93.4, F3, { label: 'Office of Offices', tint: 0xffd0a0, to: { x: 4, y: 15 } });
    this.boss(k, L);
  },
  boss(k, L) {
    const END = 104; k.machine(6, 15); [[12, 15], [24, 15], [38, 15], [50, 15], [64, 15], [74, 15], [90, 15]].forEach(([x, y], i) => k.prop(x, y, i % 2 ? 'shelf_small' : 'b_tall', { f: i % 2 ? 0 : 7, d: 1 }));
    k.mover(32.5, 13.4, 'plat_lift', { dy: 1.4, ms: 2600 }); k.mover(58.5, 13.6, 'plat_lift', { dy: 1.2, ms: 2400 }); k.mover(81, 13.6, 'plat_lift', { dx: 0, dy: 1.2, ms: 2200 }); k.conveyor(40, 14.15, 12, -1, 50); k.conveyor(86, 14.15, 8, -1, 46); k.row(14.6, 9.6, 3); k.row(44.6, 9.6, 3); k.row(66.6, 9.6, 3); k.machine(53.6, 15); k.special(67.4, 9.6);
    k.mover(22, 13.1, 'plat_cab', { dx: 5, ms: 3400, solid: true, bh: 30 }); k.mover(70, 13.1, 'plat_cab', { dx: 4, ms: 3000, solid: true, bh: 30 });
    [[36.6, 0], [47, 0.5], [63, 0.3], [77, 0.7], [92, 0.4]].forEach(([x, p]) => { // temporary administrative barriers
      const s = L.add.image(x * T, 15 * T, 'atlas', 'wall_red/0').setOrigin(0.5, 1).setDepth(9); const z = L.add.zone(x * T, 15 * T - 48, 28, 96); L.physics.add.existing(z, true); L.solids.add(z); L.ents.push({ update: () => { const q = ((L.clock / 3600) + p) % 1; const h = q < 0.45 ? 0 : q < 0.55 ? (q - 0.45) * 10 : q < 0.9 ? 1 : (1 - q) * 10; s.setScale(1, Math.max(0.02, h)); z.body.enable = h > 0.5; if (h > 0.5 && h < 1 && Math.abs(L.player.x - z.x) < 20 && L.player.y > 9 * T) L.player.x += L.player.x < z.x ? -2 : 2; } });
    });
    const g = L.add.sprite(20 * T, 6 * T, 'atlas', 'boss_stamp/0').setOrigin(0.5, 1).setDepth(16).play('boss_stamp').setVisible(false); const letter = k.item(END + 2, 13.4, 'letter_ok', { glow: 'w', onGet: () => win() }); L.fx.glow((END + 2) * T, 13.2 * T, 'w', 1.8, 8, 0.5); k.prop(END + 2, 15, 'b_lectern', { d: 8, s: 1.2 });
    const S = { on: false, done: false, t: 2600, t2: 1500, state: 0, st: 0 }; L.bossState = S;
    L.trigger(8, 0, 4, 15.2, () => { if (S.on) return; S.on = true; g.setVisible(true).setPosition(L.player.x + 160, -20); L.hud.banner(TOAST.bossStamp, TOAST.bossStampSub, { color: '#ff9a8a' }); Audio.sfx('rumble'); L.cameras.main.shake(700, 0.008); });
    const bits = [];
    L.bossTick = (dt) => {
      if (!S.on || S.done || L.zone.id !== 'boss' || L.cinematic) return; const p = L.player; S.t -= dt; S.t2 -= dt; const prog = Math.min(1, p.x / (END * T));
      if (S.state === 0) { // hover ahead of Léo
        const gx = Math.min(END * T - 60, p.x + 70 + Math.sin(L.clock / 700) * 60); g.x += (gx - g.x) * 0.045; g.y += (9.2 * T + Math.sin(L.clock / 300) * 6 - g.y) * 0.06; if (S.t <= 0 && p.alive) { S.state = 1; S.st = 780; g.anims.stop(); g.setFrame('boss_stamp/3'); Audio.sfx('question'); L.tweens.add({ targets: g, y: 8 * T, duration: 350 }); S.sh = L.add.image(g.x, 15 * T - 2, 'atlas', 'ring/0').setTint(0xff5050).setScale(1.9, 0.3).setDepth(12); }
      } else if (S.state === 1) { S.st -= dt; if (S.sh) { S.sh.setAlpha(0.5 + 0.5 * Math.sin(S.st / 40)); } if (S.st <= 0) { S.state = 2; g.setFrame('boss_stamp/4'); L.tweens.add({ targets: g, y: 15 * T, duration: 150, ease: 'Quad.in', onUpdate: () => hit(), onComplete: () => { Audio.sfx('thud'); L.cameras.main.shake(240, 0.012); for (let i = -2; i <= 2; i++) L.fx.dust(g.x + i * 24, 15 * T); L.fx.burst('bit', g.x, 14.5 * T, 18, 180); hit(); S.st = 900; S.state = 3; } }); } } else if (S.state === 3) { S.st -= dt; if (S.st <= 0) { S.state = 0; S.t = 2500 - prog * 700; g.play('boss_stamp'); if (S.sh) { S.sh.destroy(); S.sh = null; } } }
      if (S.t2 <= 0 && p.alive) { S.t2 = 1250 - prog * 350; const x = p.x + (Math.random() - 0.25) * 200; if (Math.random() < 0.3) warnStamp(L, Math.max(3 * T, Math.min(END * T - 40, x)), 15 * T); else { const s = L.add.sprite(x, L.cameras.main.worldView.y - 12, 'atlas', 'gremlin_dead/0').setDepth(17); bits.push({ s, v: 70 }); } }
      for (const q of bits) { q.v = Math.min(150, q.v + dt * 0.1); q.s.y += (q.v * dt) / 1000; q.s.angle += dt * 0.15; if (!q.gone && Math.hypot(p.x - q.s.x, p.body.center.y - q.s.y) < 15) { p.hurt(q.s.x); q.gone = true; } if (q.s.y > 15 * T) q.gone = true; if (q.gone) { L.fx.burst('bit', q.s.x, q.s.y, 5, 80); q.s.destroy(); } } for (let i = bits.length - 1; i >= 0; i--) if (bits[i].gone) bits.splice(i, 1);
    };
    const hit = () => { const p = L.player; if (Math.abs(p.x - g.x) < 50 && p.body.bottom > g.y - 110 && p.body.y < g.y - 4) p.hurt(g.x); };
    L.script = (dt) => L.bossTick && L.bossTick(dt);
    this.onRespawn = () => { S.state = 0; S.t = 2600; if (S.sh) { S.sh.destroy(); S.sh = null; } g.play('boss_stamp'); bits.forEach((q) => q.s.destroy()); bits.length = 0; };
    const win = () => {
      S.done = true; L.lock(true); L.player.inv = 99999; L.tweens.killTweensOf(g); if (S.sh) S.sh.destroy(); bits.forEach((q) => q.s.destroy()); Audio.music(L, null, 200); L.player.forceAnim = 'leo_idle'; L.cameras.main.stopFollow(); L.cameras.main.pan((END - 1) * T, 9 * T, 800, 'Sine.easeInOut'); g.anims.stop(); g.setFrame('boss_stamp/3'); const lx = (END - 3) * T;
      L.tweens.add({ targets: g, x: lx, y: 9 * T, duration: 900, ease: 'Sine.inOut' }); const doc = L.add.image(lx, 14 * T, 'atlas', 'letter_ok/0').setDepth(15).setScale(1.4);
      L.wait(1200, () => { L.tweens.add({ targets: g, y: 7.4 * T, duration: 1500, ease: 'Sine.out' }); Audio.sfx('rumble', { v: 0.5 }); });
      L.wait(4300, () => { // dramatic silence, then...
        g.setFrame('boss_stamp/4'); L.tweens.add({ targets: g, y: 14.8 * T, duration: 120, ease: 'Quad.in', onComplete: () => {
          L.cameras.main.shake(700, 0.026); Audio.sfx('thud'); L.hitStop(120); L.hud.white(1100, 0xffe9a0); L.fx.ring(lx, 14 * T, 0xfff0a0, 7); L.fx.burst('bit', lx, 13 * T, 30, 240);
          L.wait(500, () => { g.setFrame('boss_stamp/5'); L.tweens.add({ targets: g, y: 12 * T, duration: 500, ease: 'Back.out' }); Audio.sfx('stampyes'); Audio.sfx('fanfare'); const gold = L.fx.glow(lx, 9 * T, 'w', 6, 7, 0).setTint(0xffd070); L.tweens.add({ targets: gold, alpha: 0.6, duration: 600 }); L.hud.big([BIG.approved, BIG.approvedVi], { y: 120, size: 110, color: '#8fffb0', ms: 4200 }); L.fx.rain(5200); L.celebrate(); doc.setDepth(30); L.tweens.add({ targets: doc, x: L.player.x, y: L.player.y - 46, duration: 900, ease: 'Back.out' }); L.unlock('letter'); for (let i = 0; i < 6; i++) L.wait(i * 350, () => { L.fx.confetti(lx + (Math.random() - 0.5) * 240, (4 + Math.random() * 6) * T, 30); Audio.sfx('confetti', { v: 0.5 }); }); L.wait(5200, () => L.finish()); });
        } });
      });
    }; void letter;
  },
};
