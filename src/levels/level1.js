import { kit } from './kit.js';
// temporary test ground
export default { id: 1, name: 'Test ground', sub: 'Please jump.', w: 70, h: 24, spawn: { x: 3, y: 18 },
  tiles(b) { b.zone({ x: 0, y: 0, w: 70, h: 24, theme: 'campus', music: 'campus' }); b.ground(0, 20, 18, 24); b.ground(24, 40, 16, 24); b.ground(46, 69, 16, 24); b.plat(28, 13, 4); b.ladder(38, 11, 5); b.plat(34, 11, 4); b.brk(50, 12, 3); },
  build(b, L) { const k = kit(L); k.arc(19, 15, 6); k.mover(42, 16, 'plat_book', { dx: 2 }); k.gremlin(30, 16); k.machine(48, 16); } };
