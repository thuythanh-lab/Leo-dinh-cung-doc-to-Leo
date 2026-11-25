import { kit, T, TOAST, Audio } from './kit.js';
import { BIG } from '../config/text.js';
import { CONFERENCE } from '../config/balance.js';

export default {
  id: 4, name: 'The Funding Hunger Games', sub: 'May the budget line be ever in your favour.', w: 214, h: 60, spawn: { x: 3, y: 26 },
  hudItems: [['c_proposal', 'comp_proposal'], ['c_budget', 'comp_budget'], ['c_just', 'comp_just']],
  tiles(b) {
    b.zone({ id: 'main', x: 0, y: 0, w: 214, h: 36, theme: 'treasury', music: 'treasury', shade: [0x0a2a20, 0.1] });
    b.zone({ id: 'buffet', x: 0, y: 38, w: 32, h: 18, theme: 'library', bg: 'library', music: 'map', deadly: false });
    const g = (a, c, y) => b.ground(a, c, y, 36);
    b.fill(0, 0, 1, 36); g(0, 24, 26); g(25, 41, 31); // lower vault under the fake funding bridge
    b.fill(42, 10, 0, 0); g(60, 68, 24); b.fill(67, 10, 1, 0);
    g(69, 74, 24); g(93, 99, 19); g(110, 124, 17); g(125, 136, 19); b.fill(137, 5, 2, 31);
    g(139, 152, 11); b.fill(139, 0, 1, 7); b.fill(153, 5, 2, 19); g(153, 161, 24); g(172, 180, 19); g(181, 213, 17); b.fill(213, 0, 1, 36);
    b.brk(64, 20, 3); b.brk(113, 13, 2); b.plat(140, 8, 4);
    // buffet room
    b.room(0, 38, 32, 18, 1); b.fill(1, 53, 30, 2); b.plat(5, 50, 4); b.plat(14, 48, 5); b.plat(24, 50, 4); b.plat(9, 46, 3); b.plat(21, 46, 3);
  },
  build(b, L) {
    const k = kit(L); this.L = L;
    [[6, 26], [20, 26], [30, 31], [38, 31], [62, 24], [72, 24], [96, 19], [113, 17], [122, 17], [143, 11], [157, 24], [176, 19], [186, 17], [206, 17]].forEach(([x, y], i) => k.prop(x, y + 0.1, 'coinpile', { d: i % 2 ? 2 : 7, s: i % 3 ? 1 : 0.8 })); [[10, 26], [66, 24], [98, 19], [118, 17], [184, 17], [202, 17]].forEach(([x, y]) => k.prop(x, y, 'b_tall', { f: 7, d: 3, glow: 'w', gy: 0.8 })); [[13, 26], [116, 17], [192, 17]].forEach(([x, y]) => k.prop(x, y, 'b_banner', { d: 1, s: 1.5 })); k.prop(146, 11, 'b_gcrystal', { d: 2, anim: false }); k.prop(95, 19, 'b_gcrystal', { d: 2, anim: false });
    for (let i = 0; i < 16; i++) { const c = L.add.sprite((8 + i * 12.6) * T, (9 + ((i * 7) % 8)) * T, 'atlas', 'coin/0').setDepth(1).setAlpha(0.8).setScale(1.4).play('coin'); L.tweens.add({ targets: c, y: c.y + 14, yoyo: true, repeat: -1, duration: 1500 + i * 60, ease: 'Sine.inOut' }); }
    // --- act 0: the stable bridge
    k.sign(5, 26, 'vibes'); k.sign(21, 26, 'direct'); k.row(8, 25, 4); k.gremlin(15, 26);
    const golds = []; for (let i = 0; i < 9; i++) golds.push(k.collapse(26.6 + i * 3.4, 26, 'plat_gold')); const fake = k.prop(60, 24, 'portal', { d: 2 }); fake.setVisible(!L.flag('rej'));
    if (L.flag('rej')) golds.forEach((g) => { g.setSolid(false); g.setVisible(false); });
    else { fake.setPosition(58.8 * T, 26 * T);
      L.trigger(35, 18, 3, 14, () => { L.lock(true); L.setFlag('rej'); const x = L.player.x; L.stampSlam('ink_rej', x, 20 * T, { scale: 1.5, hold: 2000 }); L.wait(260, () => { L.toast(TOAST.fundingNo, { title: BIG.rejFund, color: '#ff9a8a' }); golds.forEach((g, i) => g.collapse(160 + i * 70)); L.tweens.add({ targets: fake, alpha: 0, scaleX: 0, duration: 700 }); Audio.sfx('glitch'); }); L.wait(1500, () => L.lock(false)); }); }
    // --- act 1: spreadsheets (Research Proposal)
    k.sign(31, 31, 'impact'); k.machine(27, 31); k.row(33, 30, 4); k.gremlin(34, 31); k.sign(38.5, 31, 'sheet');
    [[43.4, 29.4, 'a'], [46.4, 28.2, 'b'], [49.4, 27.2, 'a'], [52.4, 26.6, 'b'], [55.2, 25.8, 'a'], [58, 25, 'b']].forEach(([x, y, q]) => { k.cell(x, y, q); k.coffee([x, y - 1.6]); });
    k.mover(45, 32.4, 'plat_gold', { dx: 12, ms: 9000 }); k.mover(59, 31, 'plat_gold', { dy: -6.4, ms: 5600 }); // slow safety net back up
    const comp = (id, x, y, fl, gate) => k.item(x, y, `comp_${id}`, { flag: fl, onGet: () => { L.toast(TOAST.comp[id]); L.fx.confetti(L.player.x, L.player.y - 20, 20); gate && gate.open(); } });
    k.machine(61.6, 24); const g1 = k.gate(70, 24, 'golddoor', { flag: 'gd1', }); L.ents.push({ update: () => { if (L.flag('c_proposal')) g1.open(true); } }); comp('proposal', 65, 22.4, 'c_proposal', g1); k.special(65.5, 18.6);
    // --- act 2: bouncing coins + balance scales (Budget)
    k.sign(72.6, 24, 'excellent', { range: 34 }); k.bounce(76.6, 26, 'bouncer', 560); k.plat(80, 18.4, 'plat_gold'); k.plat(83, 18.4, 'plat_gold'); k.row(76, 20, 2); k.arc(77, 17, 4, 1.4);
    const s1 = k.linked(86.5, 18.4, 'plat_gold', { lift: 2.2, sink: 2.2, thread: 0xfff0a0 }); const s2 = k.linked(90.2, 20.4, 'plat_gold', { lift: 2.2, sink: 0.8, thread: 0xfff0a0 }); s1.partner = s2; s2.partner = s1; k.prop(88.4, 17.4, 'b_pendulum', { d: 3, oy: 1 });
    k.coffee([86.5, 17], [90.2, 17]); k.machine(95.5, 19); k.gremlin(97, 19); k.bounce(102, 22, 'bouncer', 530); k.bounce(107, 21, 'bouncer', 540); k.row(101, 16.4, 3); k.row(106, 15.4, 3); k.plat(102, 21.9, 'plat_gold'); k.plat(107, 20.9, 'plat_gold'); k.plat(76.6, 25.9, 'plat_gold'); k.plat(74.8, 26, 'plat_gold');
    k.citation(104.5, 13, { range: 40 });
    const g2 = k.gate(124, 17, 'golddoor', { flag: 'gd2' }); L.ents.push({ update: () => { if (L.flag('c_budget')) g2.open(true); } }); comp('budget', 119, 15.2, 'c_budget', g2); k.machine(112, 17); k.gremlin(117, 17); k.special(113.8, 11.6);
    // --- act 3: rejection stampers, portals (Justification)
    k.conveyor(126, 19, 4, -1, 46); k.conveyor(131, 19, 4, -1, 46); k.crusher(128, 13.6, 5.4, { period: 2900 }); k.crusher(133, 13.6, 5.4, { period: 2900, phase: 0.5 }); k.sign(125.4, 19, 'closed', { range: 20 });
    k.portal(136.2, 19, { x: 141.5, y: 11 }); k.portal(151.8, 11, { x: 155.5, y: 24 }); k.sign(149.4, 11, 'open', { range: 26 }); k.portal(146, 11, { x: 135, y: 19 }, TOAST.roomLoop); k.sign(144.4, 11, 'closed', { range: 20 }); k.arc(144.4, 9.4, 5, 1.6); k.row(140.2, 6.8, 1);
    // secret: the Conference Buffet
    k.barrier(141.2, 8, 'barrier_rev', { flag: 'buffetWall', onBreak: () => k.secretRoom('buffetFound') }); k.door(140.3, 8, { to: { x: 4, y: 53 }, depth: 3, sprite: 'door' });
    k.machine(157, 24); k.sign(159.5, 24, 'impact', { range: 24 }); k.mover(163.4, 23.6, 'plat_gold', { dx: 2, ms: 3600 }); k.mover(168.4, 22, 'plat_gold', { dy: -3.6, ms: 3800 }); k.citation(166, 18.6, { range: 30 }); k.coffee([164.5, 22], [168.4, 19], [168.4, 17]);
    comp('just', 176, 17.2, 'c_just', null); k.letter && (L.lt4 = 2000);
    // --- finale: the funding portal
    k.machine(183, 17); k.row(186, 15.6, 5); const portal = k.prop(202, 17, 'portal', { d: 4, s: 1.4 }); const gl = L.fx.glow(202 * T, 12.4 * T, 'c', 2.2, 3, 0.4); const need = { c_proposal: 'Research Proposal', c_budget: 'Budget', c_just: 'Justification' };
    L.trigger(199.6, 8, 4, 9.2, () => {
      if (L.finished || L.cinematic) return; const miss = Object.keys(need).filter((f) => !L.flag(f)); if (miss.length) { if (L.clock - (L.missT || -9e9) > 4000) { L.missT = L.clock; L.toast(TOAST.compNeed + miss.map((m) => need[m]).join(', ')); Audio.sfx('error'); } return; }
      L.lock(true); L.player.forceAnim = 'leo_idle'; L.player.face = 1; Audio.music(L, null, 500); L.cameras.main.stopFollow(); L.cameras.main.pan(202 * T, 12 * T, 700, 'Sine.easeInOut');
      ['comp_proposal', 'comp_budget', 'comp_just'].forEach((n, i) => { const o = L.add.image(L.player.x, L.player.y - 30, 'atlas', `${n}/0`).setDepth(30); L.tweens.add({ targets: o, x: 202 * T, y: 12 * T, angle: 360, scale: 0.2, delay: 400 + i * 380, duration: 700, ease: 'Quad.in', onComplete: () => { o.destroy(); Audio.sfx('laser'); L.fx.ring(202 * T, 12 * T, 0xfff0a0, 2); } }); });
      const a = L.add.image(202 * T, 9 * T, 'atlas', 'ink_app/0').setDepth(31).setVisible(false); const r = L.add.image(202 * T, 9 * T, 'atlas', 'ink_rej/0').setDepth(31).setVisible(false);
      L.wait(2500, () => { let n = 0; const flick = () => { const yes = n % 2 === 0; a.setVisible(yes); r.setVisible(!yes); gl.setTint(yes ? 0x8fffb0 : 0xff8080); Audio.sfx('tick', { rate: yes ? 1.2 : 0.8 }); n++; if (n < 18) L.wait(90 + n * n * 1.6, flick); else { a.setVisible(false); r.setVisible(false); gl.setTint(0xffffff); L.wait(1500, win); } }; flick(); });
      const win = () => { a.setVisible(true).setScale(1.2).setY(13 * T).setAngle(-6); L.hud.white(700); Audio.sfx('stampyes'); Audio.sfx('fanfare'); L.cameras.main.shake(350, 0.012); L.hud.big([BIG.funded], { y: 96, size: 78, color: '#8fffb0', ms: 3600 }); L.celebrate(); for (let i = 0; i < 14; i++) L.wait(i * 230, () => { const x = (194 + Math.random() * 16) * T; const y = (5 + Math.random() * 7) * T; L.fx.burst('coin', 202 * T, 13 * T, 12, 210); L.fx.confetti(x, y, 24); L.fx.ring(x, y, [0xfff0a0, 0xff9ad0, 0x8fe6ff][i % 3], 1.6); Audio.sfx(i % 2 ? 'coins' : 'confetti', { v: 0.6 }); }); L.unlock('fund'); L.unlock('uncooked'); L.wait(4400, () => L.finish()); };
    }, false); void portal;
    // --- buffet room
    k.door(2.6, 53, { to: { x: 142.4, y: 11 } }); k.prop(10, 53, 'buffet', { d: 3 }); k.prop(22, 53, 'buffet', { d: 3 }); k.prop(28, 53, 'b_tall', { f: 8, d: 2 }); k.prop(16, 39, 'b_chandelier', { oy: 0, glow: 'w', gy: 0, gs: 1.6 }); [[6, 43], [26, 43]].forEach(([x, y]) => k.prop(x, y, 'b_portrait', { f: 3 }));
    let run = false; L.trigger(1, 40, 8, 13.2, () => {
      if (run || L.flag('buffetDone')) return; run = true; L.toast(TOAST.buffet); Audio.music(L, 'office'); let got = 0; const all = []; const spots = [[7, 48.8], [15.5, 46.6], [17.5, 46.6], [25, 48.8], [27, 48.8], [10, 44.6], [22, 44.6], [8, 51.6], [12, 51.6], [16, 51.6], [20, 51.6], [24, 51.6], [5.5, 48.8], [29, 51.6], [14, 42.6], [18, 42.6]];
      spots.forEach(([x, y], i) => all.push(k.item(x, y, i % 4 === 3 ? 'coffee' : `food_${i % 4}`, { onGet: () => { got++; Audio.sfx('coffee', { rate: 1 + got * 0.03 }); } }))); let left = CONFERENCE.seconds * 1000; const t = L.hud.add.text(480, 80, '', { fontFamily: '"VT323"', fontSize: '40px', color: '#fff0a0', stroke: '#1c1428', strokeThickness: 6 }).setOrigin(0.5);
      const ent = { update: (dt) => { if (ent.dead) return; left -= L.cinematic ? 0 : dt; t.setText(`${Math.max(0, left / 1000).toFixed(1)}s   ${got}/${spots.length}`); if (left <= 0 || got >= spots.length) { ent.dead = true; t.destroy(); all.forEach((i) => { if (!i.dead) { i.gl.destroy(); i.kill(); } }); L.setFlag('buffetDone'); Audio.music(L, 'map'); L.player.heal(3); L.unlock('buffet'); } } }; L.ents.push(ent);
    });
  },
};
