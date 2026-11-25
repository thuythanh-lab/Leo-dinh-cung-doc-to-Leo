// node tests/playthrough.mjs [level ...]  : plays levels with real inputs. --mortal disables bot invulnerability.
import fs from 'node:fs';
import { open, sleep } from './lib.mjs';
import { RUN } from './routes.mjs';
const bot = fs.readFileSync(new URL('./bot.js', import.meta.url), 'utf8');
const args = process.argv.slice(2); const which = args.filter((a) => /^\d$/.test(a)).map(Number); const shots = args.includes('--shots');
const save = (n) => ({ d: { v: 1, started: true, unlocked: n, done: {}, ach: {}, assistant: n > 1, mapAt: n, stats: { coffee: 0, summons: 0, letters: 0, cooked: 0 }, run: null, future: {} }, settings: { music: 0, sfx: 0, touch: 'off' } });

for (const n of which.length ? which : [1, 2, 3, 4, 5, 6, 7]) {
  const g = await open(`level=${n}`, { save: save(n) }); await g.page.evaluate(bot); await g.page.evaluate((m) => { Bot.god = !m; }, args.includes('--mortal')); if (args.includes('--detour')) await g.page.evaluate(() => { window.detour = true; }); const t0 = Date.now(); let k = 0; const tm = shots ? setInterval(() => g.shot(`play${n}_${String(k++).padStart(3, '0')}`).catch(() => {}), 2500) : null;
  let res; try { await g.page.evaluate(`(${RUN[n].toString()})()`); res = 'COMPLETED'; } catch (e) { res = 'FAILED ' + e.message.split('\n')[0]; await g.shot(`fail${n}`); console.log(await g.page.evaluate(() => JSON.stringify(window.notes || null))); }
  if (tm) clearInterval(tm); if (res === 'COMPLETED') { await sleep(1500); await g.shot(`done${n}`); await sleep(8000); }
  const st = await g.page.evaluate(() => ({ s: JSON.parse(localStorage.getItem('leo-doc-to-save-v1')).d, ra: window.raTotal, raMs: window.raMs, buffet: window.buffet, err: window.lastErr, hearts: window.__L && window.__L.player && window.__L.player.hearts, scenes: window.__game.scene.scenes.filter((s) => s.sys.isActive()).map((s) => s.sys.settings.key) })).catch((e) => e.message);
  console.log(`L${n}: ${res} in ${((Date.now() - t0) / 1000).toFixed(0)}s`, JSON.stringify({ ach: Object.keys(st.s?.ach || {}), done: st.s?.done, unlocked: st.s?.unlocked, coffee: st.s?.stats.coffee, cooked: st.s?.stats.cooked, raTotal: st.ra, buffet: st.buffet, err: st.err, hearts: st.hearts, scenes: st.scenes, cp: st.s?.run?.cp })); if (g.errors.length) console.log([...new Set(g.errors)].slice(0, 5)); await g.browser.close();
}
