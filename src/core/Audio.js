import { Save } from './Save.js';
import { MAIN_THEME, loadLocalTheme } from './localTheme.js';

export const MUSIC = ['menu', 'map', 'campus', 'library', 'water', 'garden', 'archive', 'tower', 'boss', 'treasury', 'office', 'boss2', 'ending', 'nature'];
export const SFX = ['jump', 'coffee', 'special', 'hurt', 'cast', 'stomp', 'thud', 'stampno', 'stampyes', 'achieve', 'fanfare', 'secret', 'summon', 'vanish', 'checkpoint', 'splash', 'cooked', 'boing', 'rumble', 'laser', 'confetti', 'typing',
  'step', 'land', 'break', 'book', 'page', 'bookopen', 'bookclose', 'door', 'creak', 'coins', 'cloth', 'metal', 'pot', 'move', 'ok', 'back', 'tick', 'text', 'error', 'glitch', 'switch', 'open', 'close', 'pluck', 'glass', 'bong', 'question'];
const GAIN = { step: 0.16, land: 0.4, text: 0.3, typing: 0.5, coffee: 0.55, jump: 0.45, tick: 0.6, cast: 0.6, move: 0.7 };

/** Independent music / sfx volume, lazy-loaded tracks and cross-fades. */
class AudioMan {
  init(game) { this.game = game; this.cur = null; this.want = null; this.last = {}; this.pos = 0; this.local = loadLocalTheme(game).then((ok) => { this.localReady = true; this.localTheme = ok; }); }
  sfx(k, o = {}) {
    if (!this.game || !this.game.cache.audio.exists(`s_${k}`)) return;
    const now = performance.now(); if (now - (this.last[k] || 0) < 35) return; this.last[k] = now;
    this.game.sound.play(`s_${k}`, { volume: Save.settings.sfx * (GAIN[k] ?? 0.85) * (o.v ?? 1), rate: o.rate ?? 1 });
  }
  music(scene, k, fade = 900) {
    if (this.want === k) return; this.want = k;
    const start = () => { if (this.want === k) this.swap(k, fade); };
    if (!k) return this.swap(null, fade);
    if (k === MAIN_THEME && !this.localReady) { this.local.then(() => { if (this.want === k) { this.want = null; if (scene.sys.isActive()) this.music(scene, k, fade); } }); return; }
    if (this.game.cache.audio.exists(`m_${k}`)) return start();
    scene.load.audio(`m_${k}`, `assets/audio/music/${k}.mp3`); scene.load.once(`filecomplete-audio-m_${k}`, start); scene.load.start();
    scene.events.once('shutdown', () => { if (this.want === k && !(this.cur && this.cur.key === `m_${k}`) && !this.game.cache.audio.exists(`m_${k}`)) this.want = null; }); // left before it loaded: let the next scene ask again
  }
  swap(k, fade) {
    const old = this.cur; this.cur = null; const main = `m_${MAIN_THEME}`; if (old && old.key === main) this.pos = old.seek; // the main theme resumes where it stopped
    if (old) this.ramp(old, 0, fade, () => { old.stop(); old.destroy(); });
    if (k) { const s = this.game.sound.add(`m_${k}`, { loop: true, volume: 0 }); s.play({ loop: true, volume: 0, seek: s.key === main ? this.pos : 0 }); this.cur = s; this.ramp(s, Save.settings.music, fade); }
  }
  ramp(s, to, ms, done) {
    const from = s.volume; const t0 = performance.now(); clearInterval(s._ramp);
    s._ramp = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
      try { s.setVolume(from + (to - from) * p); } catch { clearInterval(s._ramp); return; }
      if (p >= 1) { clearInterval(s._ramp); done && done(); }
    }, 40);
  }
  duck(on) { if (this.cur) this.ramp(this.cur, Save.settings.music * (on ? 0.25 : 1), 250); }
  refresh() { if (this.cur) { clearInterval(this.cur._ramp); this.cur.setVolume(Save.settings.music); } }
}
export const Audio = new AudioMan();
