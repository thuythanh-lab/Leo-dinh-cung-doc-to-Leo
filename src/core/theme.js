// The gameplay soundtrack: one continuous song, played exactly as recorded.
// 1. the MP3 the player imported (kept in this browser's IndexedDB, never uploaded)
// 2. the bundled main theme, available to every player
// If the theme cannot load, the existing level tracks play.
import { P_MUSIC } from '../config/text.js';
export const THEME = 'theme'; // cache key m_theme
// Every track heard during normal play (and the world map between levels). These all become one
// continuous soundtrack. Not listed, so unchanged: menu, ending (cinematics), boss, boss2. 'nature' is wind and birds: it is layered.
export const GAMEPLAY = new Set(['map', 'campus', 'library', 'water', 'garden', 'archive', 'tower', 'treasury', 'office', 'nature']);

const MAX_MB = 60; const MAX_MIN = 20;
const db = () => new Promise((ok, no) => { const r = indexedDB.open('leo-soundtrack', 1); r.onupgradeneeded = () => r.result.createObjectStore('music'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('blocked')); });
const tx = async (mode, fn) => { const d = await db(); try { return await new Promise((ok, no) => { const t = d.transaction('music', mode); const q = fn(t.objectStore('music')); t.oncomplete = () => ok(q.result); t.onerror = t.onabort = () => no(t.error || new Error('storage')); }); } finally { d.close(); } };
export const stored = () => tx('readonly', (s) => s.get('custom'));
export const store = (v) => tx('readwrite', (s) => s.put(v, 'custom'));
export const forget = () => tx('readwrite', (s) => s.delete('custom'));

/** The published default soundtrack, or null if unavailable. */
export async function defaultSong(game) {
  if (!game.sound.context) return null;
  try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 180000); const r = await fetch('assets/audio/music/main-theme.mp3', { signal: c.signal }); r.ok || clearTimeout(t); if (!r.ok || !/audio/.test(r.headers.get('content-type') || '')) return null; const b = await r.arrayBuffer(); clearTimeout(t); return await game.sound.context.decodeAudioData(b); } catch { return null; }
}
/** {buffer, name} or null for "use the licensed tracks". name is set only for an imported MP3. */
export async function loadTheme(game) {
  if (!game.sound.context) return null;
  try { const c = await stored(); if (c && c.bytes) return { buffer: await game.sound.context.decodeAudioData(c.bytes.slice(0)), name: c.name }; } catch { /* storage blocked or damaged */ }
  const buffer = await defaultSong(game); return buffer && { buffer, name: null };
}
/** Validate a picked file. Throws an Error whose message can be shown. */
export async function readPicked(game, file) {
  if (!game.sound.context) throw new Error(P_MUSIC.unsupported);
  if (!/\.mp3$/i.test(file.name) && !/^audio\/(mpeg|mp3)$/.test(file.type)) throw new Error(P_MUSIC.notMp3);
  if (file.size > MAX_MB * 1048576) throw new Error(P_MUSIC.tooBig);
  const bytes = await file.arrayBuffer(); let raw; try { raw = await game.sound.context.decodeAudioData(bytes.slice(0)); } catch { throw new Error(P_MUSIC.bad); }
  if (raw.duration < 5) throw new Error(P_MUSIC.bad); if (raw.duration > MAX_MIN * 60) throw new Error(P_MUSIC.tooBig);
  return { bytes, buffer: raw, name: file.name.replace(/\.mp3$/i, '').slice(0, 60) };
}
