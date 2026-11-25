import { kit, T, TOAST, Audio } from './kit.js';
import { BIG } from '../config/text.js';
import { OBSTACLE as O } from '../config/balance.js';

export default {
  id: 3, name: 'The Q1 Publication Tower', sub: 'Estimated review time: geological.', w: 34, h: 112, spawn: { x: 4, y: 108 },
  tiles(b) {
    b.zone({ id: 'boss', x: 0, y: 0, w: 34, h: 18, theme: 'tower', music: 'boss', deadly: false });
    b.zone({ id: 'tower', x: 0, y: 19, w: 34, h: 93, theme: 'tower', music: 'tower', deadly: false });
    b.fill(0, 19, 2, 93); b.fill(32, 19, 2, 93); b.fill(0, 108, 34, 4); b.fill(0, 19, 34, 3);
    b.plat(5, 105, 6); b.plat(13, 102, 5); b.plat(20, 99, 5); b.fill(17, 92, 8, 2);
    b.fill(19, 79, 13, 2); b.plat(22, 73, 3); b.plat(25, 76, 3); b.fill(6, 68, 10, 2); b.plat(5, 65, 3); b.plat(2, 62, 4); b.fill(8, 54, 3, 9);
    b.plat(18, 66, 4); b.plat(24, 64, 4); b.plat(28, 61, 4); b.plat(25, 58, 3); b.fill(2, 51, 10, 2);
    b.plat(21, 43, 4); b.fill(13, 34, 12, 2); b.plat(9, 31, 3); b.plat(4, 28, 4); b.fill(9, 25, 14, 2);
    // boss arena
    b.fill(0, 15, 34, 3); b.fill(0, 0, 1, 18); b.fill(33, 0, 1, 18);
  },
  build(b, L) {
    const k = kit(L); const gearsAt = [[6, 98], [28, 88], [5, 78], [29, 70], [15, 60], [27, 48], [7, 42], [29, 30]]; gearsAt.forEach(([x, y], i) => { const s = k.prop(x, y, i % 2 ? 'gearsm' : 'gearbig', { oy: 0.5, d: 0, a: 0.9 }); L.ents.push({ update: (dt) => { s.rotation += dt * (i % 2 ? -0.0009 : 0.0005); } }); });
    k.prop(30, 108, 'b_engine', { d: 1, s: 1 }); k.prop(22, 92, 'b_clock', { d: 2 }); k.prop(27, 79, 'shelf_small', { d: 1 }); k.prop(4, 51, 'b_tall', { f: 4, d: 2 }); k.prop(23, 34, 'b_clockface', { d: 1 }); k.prop(20, 25, 'b_banner', { d: 1 }); k.prop(11, 25, 'b_banner', { d: 1 }); k.prop(12, 108, 'b_lectern', { d: 3 });
    for (let i = 0; i < 12; i++) { const s = L.add.image((6 + ((i * 11) % 24)) * T, (104 - i * 7) * T, 'atlas', 'page/0').setDepth(1).setAlpha(0.7); L.tweens.add({ targets: s, y: s.y - 30, x: s.x + 24, angle: 25, yoyo: true, repeat: -1, duration: 3000 + i * 170, ease: 'Sine.inOut' }); }
    // --- section 1
    k.sign(8, 108, 'under1'); k.gremlin(18, 108); k.row(6, 103.6, 4); k.row(14, 100.6, 3); k.row(21, 97.6, 3); k.mover(28, 99.5, 'plat_press', { dy: -7, ms: 5200 }); k.coffee([28, 96], [28, 93.5]); k.format(25, 108);
    // --- section 2: rejection letters + fragile manuscripts
    k.machine(19, 92); k.sign(21.5, 92, 'under2'); [[14.5, 90.4], [10.2, 88.4], [5.6, 86.4], [9.8, 83.8], [14.4, 82]].forEach(([x, y]) => k.fragile(x, y)); k.fragile(17.6, 80.4); k.coffee([14.5, 88.6], [10.2, 86.6], [5.6, 84.6], [9.8, 82], [14.4, 80.2]);
    let lt = 1400; L.letterZones = [[92, 79.5], [51, 35]];
    // --- section 3: major revision
    k.machine(25, 79); k.sign(22.6, 79, 'revise'); const spots = [[15.8, 77.2], [11, 75.2], [5.8, 73.4], [3.4, 71]]; const pages = spots.map(([x, y]) => k.collapse(x, y, 'plat_page')); let restored = 0;
    const getPage = (i) => { L.setFlag(`pg${i}`); pages[restored].restore(spots[restored][0] * T, pages[restored].hy); restored++; Audio.sfx('page'); L.float(L.player.x, L.player.y - 34, `${restored}/4`, '#fff0a0'); if (restored === 4) { L.toast(TOAST.revisionDone); Audio.sfx('fanfare'); } };
    const scatter = () => { [[26, 74.8], [23, 71.8], [20.5, 77.8], [30.5, 77.6]].forEach(([x, y], i) => { const it = k.item(x, y, 'page', { onGet: () => getPage(i), glow: 'w' }); it.hy = y * T; }); k.barrier(28, 79, 'barrier_rev', { flag: 'rev1' }); };
    if (L.flag('revised')) { pages.forEach((p) => p.setSolid(true)); } else {
      L.trigger(18.9, 73, 4, 6.1, () => {
        L.lock(true); L.player.face = -1; const cx = 11 * T; L.cameras.main.pan(cx, 74 * T, 500, 'Quad.easeOut'); L.cameras.main.stopFollow();
        L.wait(550, () => k.dropStamp('stamp_rev', cx, 75 * T, () => { L.stampSlam('ink_rev', cx, 73 * T, { scale: 0.9, from: 2.4 }); pages.forEach((p, i) => p.collapse(i * 90)); L.setFlag('revBroken'); }));
        L.wait(2300, () => { L.toast(TOAST.revision[1]); L.cameras.main.startFollow(L.player, true, 0.14, 0.12); scatter(); L.lock(false); });
      });
      L.ents.push({ update: () => { if (restored === 4 && !L.flag('revised')) L.setFlag('revised'); } });
    }
    // --- section 4: paywall
    k.machine(7.6, 68); k.sign(6, 68, 'pay'); const pw = k.gate(9.5, 68, 'paywall', { flag: 'paywall' }); k.sign(5.6, 65, 'login', { range: 26 }); k.sw(3.2, 62, 'lever', { once: true, on: () => { L.toast(TOAST.paywallOpen); pw.open(); } }); L.trigger(6.6, 63, 2, 5.1, () => { if (!L.flag('paywall')) { L.toast(TOAST.paywall); Audio.sfx('error'); } });
    k.sign(14, 68, 'under3'); k.spinner(22, 63.4, 2.6, 5); k.row(18.6, 64.6, 3); k.row(24.6, 62.6, 3); k.tracked(26, 59.6, { range: 4 });
    for (let i = 0; i < 4; i++) k.spoke(18, 53.5, 4.2, (i / 4) * Math.PI * 2, 'plat_page', { ms: 10500, dir: -1 }); k.prop(18, 53.5, 'gearbig', { oy: 0.5, d: 3 }); k.coffee([18, 48], [22.5, 55], [13.5, 52]);
    k.format(8, 51); k.machine(3.4, 51);
    // --- section 5
    k.fragile(13.6, 48.4); k.fragile(17.6, 46); k.row(21.6, 41.6, 3); k.mover(28.4, 42, 'plat_press', { dy: -7.6, ms: 5000 }); k.coffee([28.4, 38], [28.4, 35]); k.machine(20, 34); k.citation(16, 31.4, { range: 34 }); k.row(9.5, 29.6, 3); k.row(4.6, 26.6, 3); k.tracked(14, 22.8, { range: 4 }); k.special(21.5, 23.6);
    k.door(17, 25, { to: { x: 4, y: 15 }, label: 'Editorial Office', tint: 0xffe0a0, onEnter: () => {} });
    L.killBelowFn = () => { L.killBelow = L.zone && L.zone.id === 'tower' && L.cp ? L.cp.y + 6 * T : null; };
    this.boss(k, L);
    L.script = (dt) => {
      L.killBelowFn(); const ty = L.player.y / T; lt -= dt; if (L.zone.id === 'tower' && !L.cinematic && lt <= 0 && L.letterZones.some(([a, c]) => ty < a && ty > c)) { lt = O.letterEveryMs; const dir = Math.random() < 0.5 ? 1 : -1; const v = L.cameras.main.worldView; k.letter(dir > 0 ? v.x - 10 : v.right + 10, L.player.y + 2, dir * O.letterSpeed); Audio.sfx('laser', { v: 0.5 }); }
      L.bossTick && L.bossTick(dt);
    };
  },
  boss(k, L) {
    k.plat(7, 11.6, 'plat_page'); k.plat(27, 11.6, 'plat_page'); const mv = [k.mover(10, 8.5, 'plat_page', { dx: 3, ms: 4200 }), k.mover(21, 8.5, 'plat_page', { dx: 3, ms: 4200, phase: 0.5 })]; void mv; k.plat(5, 5.8, 'plat_page'); k.plat(29, 5.8, 'plat_page');
    const m = L.add.sprite(17 * T, 15 * T, 'atlas', 'boss_machine/0').setOrigin(0.5, 1).setDepth(4).play('boss_machine'); L.fx.glow(17 * T, 11 * T, 'w', 2, 3, 0.25);
    const st = [k.use(3, 15, 'revstation', { disabled: () => true }), k.use(31, 15, 'revstation', { disabled: () => true })]; const arrows = [k.arrow(3, 11.6), k.arrow(31, 11.6)]; arrows.forEach((a) => a.setVisible(false));
    const S = { on: false, phase: 0, carry: false, t: 2000, t2: 3500, item: null, done: false, target: 0 }; L.bossState = S; const drops = [[5, 4.4], [29, 4.4], [17, 5.2]]; k.plat(17, 6.4, 'plat_page');
    const spawn = () => { S.carry = false; const [x, y] = drops[S.phase]; S.item = k.item(x, y, 'comp_proposal', { glow: 'w', onGet: () => { S.carry = true; S.item = null; S.target = S.phase % 2 === 0 ? 1 : 0; arrows[S.target].setVisible(true); st[S.target].setTint(0xc8ffd8); L.toast(TOAST.deliver, { ms: 900 }); } }); L.fx.sparkle(x * T, y * T, 10, 20); };
    L.trigger(1, 0, 32, 15.2, () => { if (S.on) return; S.on = true; L.hud.banner(TOAST.bossMachine, TOAST.bossMachineSub, { color: '#ff9a8a' }); Audio.sfx('rumble'); L.cameras.main.shake(700, 0.008); L.wait(1600, spawn); });
    const icon = L.add.image(0, 0, 'atlas', 'comp_proposal/0').setDepth(26).setScale(0.8).setVisible(false);
    L.bossTick = (dt) => {
      if (!S.on || S.done || L.zone.id !== 'boss') return; const p = L.player; icon.setVisible(S.carry && p.alive).setPosition(p.x, p.y - 42); if (L.cinematic || !p.alive) return;
      S.t -= dt; S.t2 -= dt; const rage = 1 + S.phase * 0.22;
      if (S.t <= 0) { S.t = 2600 / rage; const a = Math.atan2(p.body.center.y - 11.5 * T, p.x - 14 * T); const sp = 92 + S.phase * 12; k.letter(14 * T, 11.8 * T, Math.cos(a) * sp, Math.sin(a) * sp, { life: 3600 }); Audio.sfx('laser', { v: 0.6 }); m.setScale(1.05, 0.95); L.tweens.add({ targets: m, scaleX: 1, scaleY: 1, duration: 220 }); }
      if (S.t2 <= 0) { S.t2 = 3600 / rage; const x = Math.max(3 * T, Math.min(31 * T, p.x)); warnStamp(L, x, 15 * T); }
      if (S.carry) { const s = st[S.target]; if (Math.abs(p.x - s.x) < 26 && p.y > 13 * T) deliver(s); }
    };
    const deliver = (s) => { S.carry = false; icon.setVisible(false); arrows.forEach((a) => a.setVisible(false)); s.clearTint(); s.fr(1); L.wait(1600, () => s.fr(0)); Audio.sfx('stampyes'); L.fx.confetti(s.x, s.y - 30, 24); L.hitStop(80); L.cameras.main.shake(300, 0.008); m.setTintFill(0xffffff); L.wait(90, () => m.clearTint()); S.phase++; L.float(s.x, s.y - 50, `${S.phase}/3`, '#c8ffd8'); if (S.phase < 3) { L.wait(1300, spawn); } else win(); };
    const win = () => {
      S.done = true; L.lock(true); L.enemies.filter((e) => e.vx !== undefined).forEach((e) => { e.gone = true; L.drop(e); }); Audio.music(L, null, 300); m.anims.stop(); m.setFrame('boss_machine/4'); L.cameras.main.stopFollow(); L.cameras.main.pan(17 * T, 9 * T, 700, 'Sine.easeInOut');
      L.wait(2600, () => { m.setFrame('boss_machine/5'); L.hud.white(800); Audio.sfx('fanfare'); Audio.sfx('stampyes'); L.cameras.main.shake(400, 0.012); L.fx.ring(m.x, m.y - 50, 0xfff0a0, 6); L.hud.big([BIG.accepted], { y: 130, color: '#8fffb0', size: 84, ms: 3400 }); L.fx.rain(5200); for (let i = 0; i < 8; i++) L.wait(i * 260, () => { L.fx.confetti(m.x + (Math.random() - 0.5) * 300, m.y - 60 - Math.random() * 90, 40); L.fx.burst('coin', m.x + (Math.random() - 0.5) * 200, m.y - 70, 8, 150); Audio.sfx('confetti', { v: 0.6 }); }); L.celebrate(); L.unlock('q1'); L.wait(4600, () => L.finish()); });
    };
    this.onRespawn = () => { if (S.on && !S.done && S.carry) { S.carry = false; arrows.forEach((a) => a.setVisible(false)); st.forEach((s) => s.clearTint()); spawn(); } if (L.zone.id !== 'boss') { /* walk back in: progress is kept */ } };
  },
};

export function warnStamp(L, x, y, name = 'stamp_rej') {
  const sh = L.add.image(x, y - 2, 'atlas', 'ring/0').setDepth(12).setTint(0xff5050).setScale(1.1, 0.25).setAlpha(0); L.tweens.add({ targets: sh, alpha: 0.9, yoyo: true, repeat: 3, duration: 130 });
  const s = L.add.sprite(x, y - 260, 'atlas', `${name}/0`).setOrigin(0.5, 1).setDepth(27);
  L.tweens.add({ targets: s, y: y - 210, duration: 200 });
  L.wait(1000, () => L.tweens.add({ targets: s, y, duration: 170, ease: 'Quad.in', onUpdate: () => { const p = L.player; if (Math.abs(p.x - x) < 32 && p.body.bottom > s.y - 40 && p.body.y < s.y - 4) p.hurt(x); }, onComplete: () => { Audio.sfx('thud'); L.cameras.main.shake(160, 0.007); L.fx.dust(x - 26, y); L.fx.dust(x + 26, y); sh.destroy(); L.tweens.add({ targets: s, y: y - 300, delay: 380, duration: 500, ease: 'Quad.in', onComplete: () => s.destroy() }); } }));
}
