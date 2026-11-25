import { open, sleep } from './lib.mjs';
const full = { d: { v: 1, started: true, unlocked: 5, done: { 1: true, 2: true, 3: true }, ach: { ra: 1, margreet: 1, donna: 1, star: 1, q1: 1, caffeine: 1, rabbit: 1 }, assistant: true, mapAt: 4, stats: { coffee: 12, summons: 0, letters: 0, cooked: 0 }, run: null, future: {} }, settings: { music: 0, sfx: 0, touch: 'auto' } };
const jobs = [['title', ''], ['intro', 'scene=Intro'], ['map', 'scene=Map'], ['cv', 'scene=CV'], ['l1', 'level=1'], ['l2', 'level=2'], ['l3', 'level=3'], ['l4', 'level=4'], ['l5', 'level=5'], ['l6', 'level=6'], ['ending', 'scene=Ending'], ['ending2', 'scene=Ending2'], ['l7', 'level=7'], ['defence', 'scene=Defence'], ['summit', 'scene=Summit'], ['letter', 'scene=Letter'], ['oracle', 'scene=Oracle']];
const only = process.argv.slice(2);
for (const [n, q] of jobs) {
  if (only.length && !only.includes(n)) continue;
  const g = await open(q, { save: full }); await sleep(n === 'title' ? 2600 : 3000); await g.shot(n); console.log(n, g.errors.length ? g.errors.slice(0, 4) : 'ok'); await g.browser.close();
}
