import { kit, T, TOAST, Audio } from './kit.js';
import { ASSIST, BIG } from '../config/text.js';
import { Save } from '../core/Save.js';
import { wtxt, isTouch } from '../core/util.js';

export default {
  id: 1, name: 'Welcome to Academia', sub: 'Delulu: maximum.', w: 216, h: 54, spawn: { x: 3, y: 28 },
  tiles(b) {
    b.zone({ id: 'main', x: 0, y: 0, w: 216, h: 35, theme: 'campus', music: 'campus' });
    b.zone({ id: 'crisis', x: 0, y: 36, w: 30, h: 17, theme: 'library', bg: 'library', music: 'nature', deadly: false });
    const g = (a, c, y) => b.ground(a, c, y, 35);
    g(0, 20, 28); g(21, 27, 27); g(28, 33, 26); g(37, 46, 26); b.plat(39, 23, 4); b.bridge(47, 26, 4); g(51, 62, 25); g(63, 77, 25); b.fill(75, 23, 3, 2); g(78, 86, 22);
    b.brk(80, 18, 2); b.brk(83, 18, 2);
    g(87, 91, 28); b.ladder(87, 22, 6); b.plat(88, 21, 3); g(92, 104, 22); b.cut(92, 25, 9, 3); b.back(87, 23, 5, 5); b.back(92, 25, 9, 3); // shaft + tunnel
    b.plat(95, 19, 4); b.plat(100, 16, 4);
    b.plat(106, 15, 3); g(113, 124, 20); b.plat(114, 17, 3);
    g(127, 150, 18); b.plat(131, 15, 3); b.brk(146, 14, 3);
    g(159, 173, 14); b.plat(164, 11, 3); b.plat(175, 13, 2); g(178, 190, 12); b.books(184, 8, 2); g(191, 215, 10);
    // crisis room
    b.room(0, 36, 30, 17, 1); b.fill(1, 50, 28, 2);
    b.fill(0, 0, 0, 0);
  },
  build(b, L) {
    const k = kit(L);
    // --- scenery
    k.prop(10, 28.2, 'bld_a', { d: 0, a: 0.96 }); k.prop(24, 27.2, 'bld_b', { d: 0 }); k.prop(57, 25.3, 'bld_hall', { d: 0 }); k.prop(98, 22.3, 'bld_hall', { d: 0 }); k.prop(118, 20.3, 'bld_b', { d: 0 }); k.prop(135, 18.3, 'bld_a', { d: 0 }); k.prop(182, 12.3, 'bld_b', { d: 0 }); k.prop(204, 10.3, 'bld_hall', { d: 0 });
    k.prop(16, 28.1, 'fountain', { d: 3 }); [[2, 28, 1], [7, 28, 0], [30, 26, 2], [44, 26, 0], [52, 25, 1], [70, 25, 0], [79, 22, 2], [104, 22, 0], [122, 20, 1], [140, 18, 0], [148, 18, 2], [161, 14, 1], [170, 14, 0], [188, 12, 2], [194, 10, 1]].forEach(([x, y, i]) => k.tree(x, y, i));
    [[12, 28], [33, 26], [60, 25], [86, 22], [117, 20], [143, 18], [172, 14], [197, 10]].forEach(([x, y]) => k.prop(x, y, 'lamp', { d: 3, glow: 'w', gy: 0.85, gs: 0.9 }));
    [[19.5, 28], [54, 25], [94, 22], [132, 18], [168, 14]].forEach(([x, y]) => k.prop(x, y, 'bench', { d: 3 })); [[25, 27], [62, 25], [102, 22], [166, 14]].forEach(([x, y]) => k.prop(x, y, 'bike', { d: 3 }));
    [[5, 28], [22.5, 27], [40, 26], [73, 25], [115, 20], [137, 18], [180, 12], [201, 10]].forEach(([x, y], i) => k.prop(x, y + 0.1, i % 2 ? 'fl_berry' : 'fl_bush', { d: 7 }));
    k.prop(49.5, 30, 'watertop', { d: 1, a: 0 }); k.prop(64, 25, 'notice', { d: 3 });
    k.fall(151, 18, 1.5, 17, 4); k.fall(36.2, 26, 0.8, 9, 4); k.fall(174, 14, 1, 21, 4);
    // --- route
    k.sign(8, 28, 'lol'); k.arc(12.5, 25, 6, 1.5); k.row(22, 25, 3); k.sign(31, 26, 'delulu'); k.arc(33.8, 23.5, 4, 1.5); k.row(39.5, 21.8, 4); k.gremlin(43, 26);
    k.npc(53, 25, 'prof', 'prof', { range: 18 }); k.row(47.5, 24.6, 4);
    // Research Assistant recruitment
    if (!L.flag('raDone')) {
      const ra = k.prop(61, 25, 'ra_idle', { d: 18, flip: true }); const bang = k.arrow(61, 22.4);
      L.trigger(58, 20, 3, 5.1, () => {
        if (L.flag('raDone')) return; L.player.face = 1; bang.destroy(); ra.play('ra_shrug');
        L.say(ASSIST.intro, () => {
          L.setFlag('raDone'); Save.d.assistant = true; Save.save(); L.unlock('ra'); Audio.sfx('summon'); L.fx.ring(ra.x, ra.y - 16, 0x8ff0c0, 2.4); L.fx.sparkle(ra.x, ra.y - 16, 14, 26); ra.play('ra_wave');
          L.tweens.add({ targets: ra, alpha: 0, scaleX: 0.1, scaleY: 1.6, delay: 1500, duration: 300, onComplete: () => ra.destroy() }); L.assistant.cd = 0; L.hud.refresh();
          const t = wtxt(L, 66 * T, 18.4 * T, isTouch() ? '[ assistant button ]' : '[ E ]', 13, '#c8ffd8', { depth: 40 }); L.tweens.add({ targets: t, y: t.y - 4, yoyo: true, repeat: -1, duration: 400 }); L.raHint = t;
        });
      });
    }
    k.barrier(68.5, 25, 'barrier_paper', { flag: 'paper1', tall: 200, onBreak: () => { L.raHint && L.raHint.destroy(); for (let i = 0; i < 6; i++) L.wait(i * 60, () => Audio.sfx('page')); } });
    k.row(71, 24, 3); k.machine(74, 25);
    k.special(82, 15.5); k.gremlin(82, 22); k.arc(87.5, 19.6, 5, 1.2);
    // secret 1: the Emergency Existential Crisis Room
    k.sign(89.5, 28, 'books', { range: 30 }); k.barrier(93.6, 28, 'barrier_books', { flag: 'crisisWall', onBreak: () => k.secretRoom('crisisFound') }); k.door(98, 28, { to: { x: 4, y: 50 }, onEnter: () => {} }); k.coffee([95, 27], [96, 27]);
    // rooftops over the gap
    k.row(95.6, 17.6, 3); k.row(100.6, 14.6, 3); k.row(106.4, 13.6, 3); k.mover(106.5, 20.5, 'plat_book', { dx: 5, ms: 4600 }); k.citation(109, 15.5, { range: 24 });
    k.sign(114, 20, 'stress'); k.stress(118, 15); k.gremlin(119, 20);
    k.sign(120, 20, 'writers', { range: 30 }); k.writers(123.6, 20, { flag: 'writers1', tall: 160 });
    k.arc(124.8, 16.5, 4, 1.2);
    k.machine(130, 18); k.row(131.4, 13.6, 3); k.gremlin(141, 18);
    k.prop(138, 18.1, 'coffeestand', { d: 3 }); k.sign(134.5, 18, 'coffee', { range: 36 }); k.row(135.6, 16.6, 6, 0.9); k.npc(144, 18, 'student', 'student', { range: 18 });
    k.coffee([147.5, 12.6]); k.mover(154, 18, 'plat_wood', { dy: -4, ms: 4200 }); k.mover(156.6, 15, 'plat_wood', { dy: -1, ms: 3000 }); k.coffee([154, 13], [154, 15]);
    k.gremlin(166, 14); k.gremlin(170, 14); k.row(164.5, 9.6, 3); k.sign(162, 14, 'keep'); k.arc(173.6, 10.8, 5, 1.5);
    k.citation(184, 9.5, { range: 40 }); k.special(184.6, 6.6); k.row(179, 10.6, 3); k.row(193, 8.6, 5);
    k.sign(199, 10, 'lib'); const door = k.prop(205.5, 10.1, 'door', { d: 4, s: 1.3 }); L.fx.glow(205.5 * T, 8 * T, 'w', 1.4, 4, 0.5);
    L.trigger(204.6, 4, 2, 6.2, () => { door.setFrame('door/1'); Audio.sfx('door'); L.finish(); });
    // crisis room interior
    k.prop(17, 46.6, 'bigwindow', { d: 1 }); k.prop(6, 50, 'b_tall', { f: 3, d: 2 }); k.prop(26, 50, 'b_tall', { f: 8, d: 2 }); k.prop(23, 50, 'shelf_small', { d: 2 }); k.prop(8.5, 43, 'b_portrait', { f: 2 });
    k.door(3, 50, { to: { x: 97, y: 28 } }); L.fx.glow(17 * T, 44 * T, 'w', 2.2, 2, 0.35);
    let sat = false; k.use(17, 50, 'chair', { range: 18, disabled: () => sat, use: () => { sat = true; L.lock(true); const p = L.player; p.setPosition(17 * T, 50 * T); p.face = -1; p.setFlipX(true); p.forceAnim = 'leo_sit'; Audio.music(L, 'nature'); L.wait(1200, () => L.hud.big([TOAST.crisis], { y: 150, size: 52, color: '#d8ffd0', ms: 3600, done: () => { p.heal(1); Audio.sfx('special'); L.fx.sparkle(p.x, p.y - 14, 8, 18); p.forceAnim = null; L.lock(false); } })); } });
    k.prop(17, 51, 'ring', { a: 0 });
  },
};
export { BIG };
