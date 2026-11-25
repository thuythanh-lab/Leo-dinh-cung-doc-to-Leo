// Optional local-only replacement for the main theme. The file is never bundled or published:
// vite.config.js serves it from /assets/audio on this computer only, and the public site never asks for it.
export const THEME = 'theme'; // cache key m_theme
// Every track heard during normal play (and the world map between levels). With the local theme these all become one
// continuous soundtrack. Not listed, so unchanged: menu, ending (cinematics), boss, boss2. 'nature' is wind and birds: it is layered.
export const GAMEPLAY = new Set(['map', 'campus', 'library', 'water', 'garden', 'archive', 'tower', 'treasury', 'office', 'nature']);

/** The whole song, minus inaudible silence at either end, loudness-matched, with 8 ms edges so the loop never clicks. */
export function makeLoop(ctx, src) {
  const sr = src.sampleRate; const ch = Array.from({ length: src.numberOfChannels }, (_, i) => src.getChannelData(i)); let a = 0; let b = src.length - 1;
  const loud = (i) => ch.some((c) => Math.abs(c[i]) > 0.002); while (a < b && !loud(a)) a++; while (b > a && !loud(b)) b--;
  const n = b - a + 1; const e = Math.floor(0.008 * sr); const out = ctx.createBuffer(ch.length, n, sr); let sq = 0; let peak = 0;
  for (let i = a; i <= b; i++) for (const c of ch) { sq += c[i] * c[i]; peak = Math.max(peak, Math.abs(c[i])); }
  const g = Math.min(0.13 / (Math.sqrt(sq / (n * ch.length)) || 1), 0.9 / (peak || 1));
  ch.forEach((c, k) => { const o = out.getChannelData(k); for (let i = 0; i < n; i++) o[i] = c[a + i] * g * Math.min(1, i / e, (n - 1 - i) / e); });
  out.trimmed = [a / sr, (src.length - 1 - b) / sr]; return out;
}

/** Resolves true when the local theme is in the audio cache; false means "use the licensed track". */
export async function loadLocalTheme(game) {
  try {
    if (!['localhost', '127.0.0.1'].includes(location.hostname) || !game.sound.context) return false;
    const r = await fetch('local-music/main-theme'); if (!r.ok || !/audio/.test(r.headers.get('content-type') || '')) return false;
    const buf = await game.sound.context.decodeAudioData(await r.arrayBuffer()); game.cache.audio.add(`m_${THEME}`, makeLoop(game.sound.context, buf)); return true;
  } catch { return false; }
}
