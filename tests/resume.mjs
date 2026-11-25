// Rebuild every level from every saved flag (alone, and all together) and from every coffee machine.
import fs from 'node:fs'; import { open, sleep } from './lib.mjs';
let bad = 0; const g = await open('scene=Map', { save: { d: { v: 1, started: true, unlocked: 7, done: {}, ach: { ra: 1 }, assistant: true, mapAt: 1, stats: { coffee: 1, summons: 0, letters: 0, cooked: 0 }, run: null, future: {} }, settings: { music: 0, sfx: 0, touch: 'off' } } }); const p = g.page;
const run = (l, flags, cp) => p.evaluate(async (lv, f, c) => {
  const G = window.__game; let err = null; const h = (e) => { err = err || `${e.message} ${(e.error?.stack || '').split('\n')[1] || ''}`; }; window.addEventListener('error', h);
  G.scene.getScenes(true).forEach((s) => G.scene.stop(s)); await new Promise((r) => setTimeout(r, 60)); const L0 = G.scene.getScene('Level'); L0.scene.start('Level', { level: lv }); await new Promise((r) => setTimeout(r, 350));
  const L = G.scene.getScene('Level'); L.run.flags = {}; f.forEach((k) => { L.run.flags[k] = true; }); if (c) L.run.cp = c; window.__L = null; L.scene.restart({ level: lv }); await new Promise((r) => setTimeout(r, 600)); window.removeEventListener('error', h);
  const ok = !err && window.__L && window.__L.clock > 0 && G.scene.isActive('HUD'); const z = window.__L && window.__L.zone; return { ok, err, zone: z && z.id, machines: window.__L ? window.__L.machines.map((m) => ({ x: m.x, y: m.y })) : [] };
}, l, flags, cp);
const only = process.argv[2] ? [+process.argv[2]] : [1, 2, 3, 4, 5, 6, 7];
for (const l of only) {
  const src = fs.readFileSync(new URL(`../src/levels/level${l}.js`, import.meta.url), 'utf8'); const flags = new Set(['hurt']); for (const m of src.matchAll(/(?:flag:|flag\(|setFlag\(|secretRoom\()\s*[`'"]([^`'"]+)[`'"]/g)) { if (!m[1].includes('${')) flags.add(m[1]); else for (let i = 0; i <= 5; i++) ['a', 'b', 'blue', 'red', 'gold', i].forEach((v) => flags.add(m[1].replace(/\$\{[^}]+\}/, v))); }
  const F = [...flags]; let n = 0; const fails = []; const first = await run(l, [], null); const ms = first.machines; if (!first.ok) fails.push(['fresh', first.err]);
  for (const f of F) { const r = await run(l, [f], ms[0]); n++; if (!r.ok) fails.push([f, r.err]); } const all = await run(l, F, ms[0]); if (!all.ok) fails.push(['ALL', all.err]);
  for (const m of ms) { const r = await run(l, [], m); n++; if (!r.ok) fails.push([`machine ${Math.round(m.x / 16)},${Math.round(m.y / 16)}`, r.err]); }
  console.log(`${fails.length ? 'FAIL' : 'PASS'}  Level ${l}: ${n} saved states`, fails.slice(0, 12)); bad += fails.length;
}
await g.browser.close(); console.log(bad ? `${bad} PROBLEM(S)` : 'ALL GOOD'); process.exit(bad ? 1 : 0);
