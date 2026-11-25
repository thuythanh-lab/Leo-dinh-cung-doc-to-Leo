const KEY = 'leo-doc-to-save-v1';
const fresh = () => ({
  v: 1, started: false, unlocked: 1, done: {}, ach: {}, assistant: false, phase1: false, mapAt: 1,
  stats: { coffee: 0, summons: 0, letters: 0, cooked: 0 },
  run: null,               // { level, cp:{x,y,zone}, flags:{} } : mid-level progress
  future: {},              // reserved for Phase 2 / 3 (letter, fortune ball, summit)
});
class SaveData {
  constructor() { this.d = fresh(); this.settings = { music: 0.6, sfx: 0.8, touch: 'auto' }; this.load(); }
  load() {
    try {
      const r = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (r) { const f = fresh(); this.d = { ...f, ...r.d, stats: { ...f.stats, ...(r.d?.stats || {}) } }; this.settings = { ...this.settings, ...r.settings }; }
    } catch { /* corrupted or blocked storage: play without persistence */ }
  }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ d: this.d, settings: this.settings })); } catch { /* storage blocked */ } }
  reset() { this.d = fresh(); this.save(); }
  hasProgress() { return this.d.started; }
  unlock(id) { if (this.d.ach[id]) return false; this.d.ach[id] = Date.now(); this.save(); return true; }
  has(id) { return !!this.d.ach[id]; }
  startRun(level) { if (!this.d.run || this.d.run.level !== level) this.d.run = { level, cp: null, flags: {} }; this.save(); return this.d.run; }
  clearRun() { this.d.run = null; this.save(); }
  complete(level) { this.d.done[level] = true; this.d.unlocked = Math.max(this.d.unlocked, Math.min(5, level + 1)); this.d.run = null; this.save(); }
}
export const Save = new SaveData();
