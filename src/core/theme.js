// The gameplay soundtrack: one continuous song. Source, in order of preference:
// 1. the MP3 the player chose in Settings (stays in this browser's IndexedDB, never uploaded)
// 2. on localhost only, the private MP3 served by vite.config.js (never bundled or published)
// 3. the original orchestral theme shipped with the game
// If all fail, the licensed level tracks play as before.
import { P_MUSIC } from '../config/text.js';
export const THEME = 'theme'; // cache key m_theme
// Every track heard during normal play (and the world map between levels). These all become one
// continuous soundtrack. Not listed, so unchanged: menu, ending (cinematics), boss, boss2. 'nature' is wind and birds: it is layered.
export const GAMEPLAY = new Set(['map', 'campus', 'library', 'water', 'garden', 'archive', 'tower', 'treasury', 'office', 'nature']);

/** The whole song, minus inaudible silence at either end, loudness-matched, with 8 ms edges where needed so the loop never clicks. */
export function makeLoop(ctx, src) {
  const sr = src.sampleRate; const ch = Array.from({ length: src.numberOfChannels }, (_, i) => src.getChannelData(i)); let a = 0; let b = src.length - 1;
  const loud = (i) => ch.some((c) => Math.abs(c[i]) > 0.002); while (a < b && !loud(a)) a++; while (b > a && !loud(b)) b--;
  const n = b - a + 1; const seamless = a === 0 && b === src.length - 1 && ch.every((c) => Math.abs(c[0] - c[b]) < 0.03); const e = Math.floor(0.008 * sr); /* a song that already joins up is left alone */ const out = ctx.createBuffer(ch.length, n, sr); let sq = 0; let peak = 0;
  for (let i = a; i <= b; i++) for (const c of ch) { sq += c[i] * c[i]; peak = Math.max(peak, Math.abs(c[i])); }
  const g = Math.min(0.13 / (Math.sqrt(sq / (n * ch.length)) || 1), 0.9 / (peak || 1));
  ch.forEach((c, k) => { const o = out.getChannelData(k); for (let i = 0; i < n; i++) o[i] = c[a + i] * g * (seamless ? 1 : Math.min(1, i / e, (n - 1 - i) / e)); });
  out.seamless = seamless; out.trimmed = [a / sr, (src.length - 1 - b) / sr]; return out;
}

const MAX_MB = 60; const MAX_MIN = 20;
const db = () => new Promise((ok, no) => { const r = indexedDB.open('leo-soundtrack', 1); r.onupgradeneeded = () => r.result.createObjectStore('music'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('blocked')); });
const tx = async (mode, fn) => { const d = await db(); try { return await new Promise((ok, no) => { const t = d.transaction('music', mode); const q = fn(t.objectStore('music')); t.oncomplete = () => ok(q.result); t.onerror = t.onabort = () => no(t.error || new Error('storage')); }); } finally { d.close(); } };
export const stored = () => tx('readonly', (s) => s.get('custom'));
export const store = (v) => tx('readwrite', (s) => s.put(v, 'custom'));
export const forget = () => tx('readwrite', (s) => s.delete('custom'));

const decode = async (game, bytes) => makeLoop(game.sound.context, await game.sound.context.decodeAudioData(bytes));
const get = async (game, url) => { const r = await fetch(url); if (!r.ok || !/audio|octet/.test(r.headers.get('content-type') || '')) throw new Error('missing'); return decode(game, await r.arrayBuffer()); };

/** The built-in song: the private local file on this computer, the original theme everywhere else. */
export async function builtIn(game) {
  if (['localhost', '127.0.0.1'].includes(location.hostname)) { try { return await get(game, 'local-music/main-theme'); } catch { /* no local file */ } }
  return get(game, 'assets/audio/music/wizard.mp3');
}
/** {buffer, name} or null when nothing could be loaded. name is set only for the player's own MP3. */
export async function loadTheme(game) {
  if (!game.sound.context) return null;
  try { const c = await stored(); if (c && c.bytes) return { buffer: await decode(game, c.bytes.slice(0)), name: c.name }; } catch { /* storage blocked or damaged: use the built-in song */ }
  try { return { buffer: await builtIn(game), name: null }; } catch { return null; }
}
/** Validate a picked file. Throws an Error whose message can be shown. */
export async function readPicked(game, file) {
  if (!game.sound.context) throw new Error(P_MUSIC.unsupported);
  if (!/\.mp3$/i.test(file.name) && !/^audio\/(mpeg|mp3)$/.test(file.type)) throw new Error(P_MUSIC.notMp3);
  if (file.size > MAX_MB * 1048576) throw new Error(P_MUSIC.tooBig);
  const bytes = await file.arrayBuffer(); let raw; try { raw = await game.sound.context.decodeAudioData(bytes.slice(0)); } catch { throw new Error(P_MUSIC.bad); }
  if (raw.duration < 5) throw new Error(P_MUSIC.bad); if (raw.duration > MAX_MIN * 60) throw new Error(P_MUSIC.tooBig);
  return { bytes, buffer: makeLoop(game.sound.context, raw), name: file.name.replace(/\.mp3$/i, '').slice(0, 60) };
}
