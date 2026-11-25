import { Save } from './Save.js';
import { THEME, GAMEPLAY, loadTheme, defaultSong, readPicked, store, forget } from './theme.js';

export const MUSIC = ['menu', 'map', 'campus', 'library', 'water', 'garden', 'archive', 'tower', 'boss', 'treasury', 'office', 'boss2', 'ending', 'nature'];
export const SFX = ['jump', 'coffee', 'special', 'hurt', 'cast', 'stomp', 'thud', 'stampno', 'stampyes', 'achieve', 'fanfare', 'secret', 'summon', 'vanish', 'checkpoint', 'splash', 'cooked', 'boing', 'rumble', 'laser', 'confetti', 'typing',
  'step', 'land', 'break', 'book', 'page', 'bookopen', 'bookclose', 'door', 'creak', 'coins', 'cloth', 'metal', 'pot', 'move', 'ok', 'back', 'tick', 'text', 'error', 'glitch', 'switch', 'open', 'close', 'pluck', 'glass', 'bong', 'question'];
const FILE = { triumph: 'campus', oracle: 'archive', nem: 'office' }; // cinematic cues that reuse an existing track without becoming the gameplay theme
const GAIN = { step: 0.16, land: 0.4, text: 0.3, typing: 0.5, coffee: 0.55, jump: 0.45, tick: 0.6, cast: 0.6, move: 0.7 };

/** Independent music / sfx volume, lazy-loaded tracks and cross-fades. */
class AudioMan {
  init(game) { this.game = game; this.cur = null; this.want = null; this.last = {}; this.pos = 0; this.customName = null; this.ready = false; this.loading = loadTheme(game).then((t) => { this.ready = true; if (t && !this.theme) { game.cache.audio.add(`m_${THEME}`, t.buffer); this.theme = true; this.customName = t.name; } }); }
  sfx(k, o = {}) {
    if (!this.game || !this.game.cache.audio.exists(`s_${k}`)) return;
    const now = performance.now(); if (now - (this.last[k] || 0) < 35) return; this.last[k] = now;
    this.game.sound.play(`s_${k}`, { volume: Save.settings.sfx * (GAIN[k] ?? 0.85) * (o.v ?? 1), rate: o.rate ?? 1 });
  }
  music(scene, k, fade = 900) {
    this.ask = k; this.askScene = scene;
    if (GAMEPLAY.has(k)) {
      if (!this.ready) { this.loading.then(() => { if (this.ask === k && scene.sys.isActive()) this.music(scene, k, fade); }); return; }
      if (this.theme) { this.ambient(scene, k === 'nature'); k = THEME; }
    } else this.ambient(scene, false);
    if (this.want === k) return; this.want = k;
    const start = () => { if (this.want === k) this.swap(k, fade); };
    if (!k) return this.swap(null, fade);
    if (this.game.cache.audio.exists(`m_${k}`)) return start();
    scene.load.audio(`m_${k}`, `assets/audio/music/${FILE[k] || k}.mp3`); scene.load.once(`filecomplete-audio-m_${k}`, start); scene.load.start();
    scene.events.once('shutdown', () => { if (this.want === k && !(this.cur && this.cur.key === `m_${k}`) && !this.game.cache.audio.exists(`m_${k}`)) this.want = null; }); // left before it loaded: let the next scene ask again
  }
  /** Wind and birds under the theme (Emergency Existential Crisis Room). */
  ambient(scene, on) {
    this.ambOn = on; if (!on) { const a = this.amb; this.amb = null; if (a) this.ramp(a, 0, 600, () => { a.stop(); a.destroy(); }); return; }
    if (this.amb) return; const go = () => { if (!this.ambOn || this.amb) return; this.amb = this.game.sound.add('m_nature', { loop: true, volume: 0 }); this.amb.play(); this.ramp(this.amb, Save.settings.music, 900); };
    if (this.game.cache.audio.exists('m_nature')) return go();
    scene.load.audio('m_nature', 'assets/audio/music/nature.mp3'); scene.load.once('filecomplete-audio-m_nature', go); scene.load.start();
  }
  /** Put a new song in place. If the theme is playing it changes straight away, from the top. */
  setTheme(buffer, name) {
    const key = `m_${THEME}`; const c = this.game.cache.audio; const live = this.want === THEME; const drop = (s) => { if (s) { clearInterval(s._ramp); s.stop(); s.destroy(); } };
    if (live) { drop(this.cur); this.cur = null; } if (this.out && this.out.key === key) { drop(this.out); this.out = null; }
    if (c.exists(key)) c.remove(key); c.add(key, buffer); this.theme = true; this.customName = name; this.pos = 0;
    if (live) this.swap(THEME, 400); else if (GAMEPLAY.has(this.want)) { this.want = THEME; this.swap(THEME, 400); }
  }
  /** Use the player's MP3. Resolves true if it was also remembered for next time. */
  async choose(file) { await this.loading; const p = await readPicked(this.game, file); this.setTheme(p.buffer, p.name); try { await store({ bytes: p.bytes, name: p.name }); navigator.storage?.persist?.().catch(() => {}); return true; } catch { return false; } }
  async unchoose() {
    await forget(); const b = await defaultSong(this.game); if (b) return this.setTheme(b, null);
    const key = `m_${THEME}`; const live = this.want === THEME; this.theme = false; this.customName = null; this.pos = 0; this.ambient(this.askScene, false);
    if (live) { this.want = null; this.swap(null, 300); } if (this.game.cache.audio.exists(key)) this.game.cache.audio.remove(key); if (live) this.music(this.askScene, this.ask, 400);
  }
  swap(k, fade) {
    const old = this.cur; this.cur = null; const back = k && this.out && this.out.key === `m_${k}` ? this.out : null; if (back) this.out = null; const main = `m_${THEME}`; if (old && old.key === main) this.pos = old.seek; // the theme resumes where it stopped
    if (old) { this.out = old; this.ramp(old, 0, fade, () => { if (this.out === old) this.out = null; old.stop(); old.destroy(); }); }
    if (!k) return;
    if (back) { this.cur = back; this.ramp(this.cur, Save.settings.music, fade); return; } // still fading out: bring the same copy back
    const s = this.game.sound.add(`m_${k}`, { loop: true, volume: 0 }); s.play({ loop: true, volume: 0, seek: s.key === main ? this.pos : 0 }); this.cur = s; this.ramp(s, Save.settings.music, fade);
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
  refresh() { if (this.amb) { clearInterval(this.amb._ramp); this.amb.setVolume(Save.settings.music); } if (this.cur) { clearInterval(this.cur._ramp); this.cur.setVolume(Save.settings.music); } }
}
export const Audio = new AudioMan();
