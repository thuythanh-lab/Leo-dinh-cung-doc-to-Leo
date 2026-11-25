const KEY = 'leo-doc-to-save-v1';
const fresh = () => ({
  v: 1, started: false, unlocked: 1, done: {}, ach: {}, assistant: false, phase1: false, mapAt: 1,
  stats: { coffee: 0, summons: 0, letters: 0, cooked: 0 },
  run: null,               // { level, cp:{x,y,zone}, flags:{} } : mid-level progress
  phase2: false, phase3: false, complete: 0,
  future: {},              // reserved for Phase 3 (letter, fortune ball, summit)
});
class SaveData {
  constructor() { this.d = fresh(); this.settings = { music: 0.6, sfx: 0.8, touch: 'auto' }; this.load(); }
  load() {
    try {
      const r = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (r) { const f = fresh(); this.d = { ...f, ...r.d, stats: { ...f.stats, ...(r.d?.stats || {}) } }; this.settings = { ...this.settings, ...r.settings }; if (this.d.done[5]) this.d.unlocked = Math.max(this.d.unlocked, 6); if (this.d.done[6]) this.d.unlocked = Math.max(this.d.unlocked, 7); } // Phase 1 finishers keep everything and gain Phase 2
      if (r) this.repair();
    } catch { /* corrupted or blocked storage: play without persistence */ }
  }
  /** Make any old, edited or half-written save safe to continue from. */
  repair() {
    const d = this.d; const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {}); d.done = obj(d.done); d.ach = obj(d.ach); d.future = obj(d.future); if (d.future.oracle && !(Array.isArray(d.future.oracle.deck) && Array.isArray(d.future.oracle.seen))) delete d.future.oracle;
    const num = (v, lo, hi, f) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.floor(v))) : f); d.unlocked = num(d.unlocked, 1, 7, 1); d.mapAt = num(d.mapAt, 1, 7, 1); for (const k of Object.keys(d.stats)) if (!Number.isFinite(d.stats[k])) d.stats[k] = 0;
    const r = d.run; if (r && !(Number.isInteger(r.level) && r.level >= 1 && r.level <= 7)) d.run = null; else if (r) { r.flags = obj(r.flags); if (r.cp && !(Number.isFinite(r.cp.x) && Number.isFinite(r.cp.y))) r.cp = null; }
    const s = this.settings; for (const k of ['music', 'sfx']) if (!Number.isFinite(s[k])) s[k] = 0.6; if (!['auto', 'on', 'off'].includes(s.touch)) s.touch = 'auto';
  }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ d: this.d, settings: this.settings })); } catch { /* storage blocked */ } }
  reset() { const { complete, future } = this.d; this.d = { ...fresh(), complete, future }; /* the letter and oracle stay earned */ this.save(); }
  hasProgress() { return this.d.started; }
  unlock(id) { if (this.d.ach[id]) return false; this.d.ach[id] = Date.now(); this.save(); return true; }
  has(id) { return !!this.d.ach[id]; }
  startRun(level) { if (!this.d.run || this.d.run.level !== level) this.d.run = { level, cp: null, flags: {} }; this.save(); return this.d.run; }
  clearRun() { this.d.run = null; this.save(); }
  complete(level) { this.d.done[level] = true; this.d.unlocked = Math.max(this.d.unlocked, Math.min(7, level + 1)); this.d.run = null; this.save(); }
}
export const Save = new SaveData();
