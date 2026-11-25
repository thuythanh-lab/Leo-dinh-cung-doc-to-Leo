// In-page bot: drives the real controls (no teleporting) to prove that levels are completable.
window.Bot = (function () {
  const L = () => window.__L; const T = 16; const frame = () => new Promise((r) => { const t = setTimeout(r, 400); L().events.once('postupdate', () => { clearTimeout(t); r(); }); });
  const set = (o) => { const t = window.__C.touch; for (const k of ['left', 'right', 'up', 'down', 'jump', 'cast', 'assist']) t[k] = !!o[k]; };
  const p = () => L().player; const tx = () => p().x / T; const ty = () => p().y / T;
  const talkSkip = () => { const h = L().hud; if (h.talking) h.advance(); if (h.onKey) h.onKey(); };
  const tick = async (o) => { set(o || {}); talkSkip(); if (Bot.god && !L().finished) { const t = L().tileAt(p().x, p().y - 4); p().hearts = 3; if (t && t.kind === 'haz') p().inv = 0; else { p().inv = Math.max(p().inv, 100); p().stun = 0; } } await frame(); };
  const fail = (m) => { throw new Error(`${m} @ ${tx().toFixed(1)},${ty().toFixed(1)} zone ${L().zone.id}`); };
  const free = async () => { let n = 0; while (L().cinematic || L().teleporting || !p().alive) { if (L().finished) return; await tick(); if (++n > 1500) fail('stuck in cinematic'); } };
  const solid = (x, y) => L().solidAt(x, y, true) || L().ents.some((e) => e.solid && e.body && e.body.enable && Math.abs(e.x - x) < e.body.width / 2 && y > e.body.y - 4 && y < e.body.y + 18);
  const at = (t) => (typeof t === 'function' ? t() : t);
  // walk/jump to x (tiles); auto-jumps walls, gaps and spikes
  async function go(x, o = {}) {
    let n = 0; let stuck = 0; let lx = 0; let hold = 0; await free();
    while (Math.abs(tx() - x) > (o.tol || 0.35)) {
      const d = x > tx() ? 1 : -1; const b = p().body; const floor = p().floor; let jump = hold > 0; hold--;
      if (floor && hold <= 0) {
        const wall = L().solidAt(p().x + d * 14, p().y - 6) || L().solidAt(p().x + d * 14, p().y - 20) || (d > 0 ? b.blocked.right : b.blocked.left);
        const gap = !solid(p().x + d * 13, p().y + 6) && !solid(p().x + d * 13, p().y + 22) && !solid(p().x + d * 13, p().y + 40);
        const haz = [12, 20, 28].some((q) => { const t = L().tileAt(p().x + d * q, p().y - 4); return t && t.kind === 'haz'; });
        if (!o.nojump && (wall || (gap && !o.fall) || haz)) { await tick({}); hold = 26; jump = true; }
      }
      await tick({ left: d < 0, right: d > 0, jump, cast: o.cast && n % 22 === 0 }); n++;
      if (Math.abs(tx() - lx) < 0.02) stuck++; else stuck = 0; lx = tx(); if (stuck > (o.patience || 240) || n > 4000) fail(`go(${x}) stuck`); if (L().finished) return;
      if (L().teleporting) { await free(); await tick(); return; } if (L().cinematic) await free();
    }
    await tick();
  }
  // one jump that lands at (x,y) tiles; target may be a function/entity
  async function hop(t, o = {}) {
    for (let a = 0; a < (o.tries || 6); a++) {
      await free(); const g = at(t); const e = g.body && g.topY !== undefined ? g : null; const pos = () => { const q = at(t); return q.topY !== undefined ? { x: q.x / T, y: q.topY / T } : { x: q[0], y: q[1] }; };
      let n = 0; if (e) while (n++ < 900) { const q = pos(); const rx = o.rx || 4.2; const up = ty() - q.y; const dx = Math.abs(q.x - tx()); if (e.solid !== false && dx < rx && up < (o.up || 3.6) - (dx > 3.4 ? 0.4 : 0) && up > -(o.down || 5)) break; const wd = q.x > tx() ? 1 : -1; const edge = p().floor && dx > rx * 0.7 && solid(p().x + wd * 9, p().y + 5) && !L().solidAt(p().x + wd * 12, p().y - 8); await tick({ left: edge && wd < 0, right: edge && wd > 0 }); }
      if (Bot.log) console.warn('hop', tx().toFixed(1), ty().toFixed(1), '->', JSON.stringify(pos())); if (n >= 900) { if (o.once) return; fail(`hop wait ${JSON.stringify(pos())}`); }
      n = 0; let left = false; let rel = false; while (n++ < 150) {
        const q = pos(); const dx = q.x - tx(); const v = p().body.velocity.x; const stop = (v * Math.abs(v)) / (2 * (p().floor ? 1000 : 430)) / T; const d = Math.abs(dx) < 0.25 ? 0 : Math.abs(dx - stop) < 0.2 ? 0 : dx > stop ? 1 : -1; const rising = ty() > q.y - 0.6 || n < 9 || (Math.abs(dx) > 2.4 && n < 24);
        await tick({ left: d < 0, right: d > 0, jump: n > 1 && !rel && (n < 4 || rising) && n < 36 }); if (n > 4 && !rising) rel = true; if (!p().floor) left = true; if (left && p().floor && n > 6) break; if (L().cinematic || L().finished) break;
      }
      await tick(); const q = pos(); if (L().finished || (Math.abs(tx() - q.x) < (o.tol || (e ? e.width / 32 + 0.5 : 2.2)) && Math.abs(ty() - q.y) < 0.8)) return; if (o.once) return; if (o.back) await o.back();
      if (a === (o.tries || 6) - 1) fail(`hop to ${q.x.toFixed(1)},${q.y.toFixed(1)}`);
    }
  }
  const plat = (x, y) => { let b = null; let d = 1e9; for (const e of L().ents) if (e.topY !== undefined && e.hx) { const q = Math.hypot(e.hx / T - x, (e.hy - e.height / 2 + 1) / T - y); if (q < d) { d = q; b = e; } } if (d > 1.5) fail(`no plat ${x},${y} best ${d}`); return b; };
  const thing = (nm, x) => { let b = null; let d = 1e9; for (const e of L().ents) if (e.nm === nm && !e.dead) { const q = Math.abs(e.x / T - x); if (q < d) { d = q; b = e; } } return b; };
  const wait = async (ms) => { const t = L().clock + ms; while (L().clock < t) await tick(); };
  const until = async (f, m = 'until', lim = 1500, o) => { let n = 0; while (!f()) { await tick(o && at(o)); if (n++ > lim) fail(m); } };
  const tap = async (k) => { await free(); await tick({ [k]: true }); await tick({ [k]: true }); await tick(); await tick(); };
  const use = async (x) => { if (x !== undefined) await go(x, { tol: 0.3 }); await wait(250); await tap('cast'); await wait(200); await free(); };
  const smash = async (b, dir) => { let n = 0; await free(); while (!b.dead) { p().face = dir; await tick({ cast: n % 24 === 0 }); if (n++ > 1500) fail('smash'); } };
  const drop = async () => { await tick({ down: true }); await tick({ down: true, jump: true }); await tick({ down: true, jump: true }); await wait(250); await until(() => p().floor, 'drop', 200); };
  const climb = async (x, y) => { await go(x, { tol: 0.2, nojump: true }); let n = 0; while (ty() > y + 0.1) { await tick({ up: true }); if (n++ > 700) fail('climb'); } };
  return { go, hop, plat, thing, wait, until, tap, use, smash, climb, drop, free, tick, tx, ty, p, L, god: true };
})();
