// Optional local-only replacement for the main theme. The file is never bundled or published:
// vite.config.js serves it from /assets/audio on this computer only, and the public site never asks for it.
export const MAIN_THEME = 'map'; // world map + conference break: the track that recurs between levels
const FADE = 2.5; // seconds of tail blended into the head so the loop has no seam

/** Trim silence, match the loudness of the other tracks and blend the tail into the head. */
export function makeLoop(ctx, src) {
  const sr = src.sampleRate; const ch = Array.from({ length: src.numberOfChannels }, (_, i) => src.getChannelData(i)); let a = 0; let b = src.length - 1;
  const loud = (i) => ch.some((c) => Math.abs(c[i]) > 0.004); while (a < b && !loud(a)) a++; while (b > a && !loud(b)) b--;
  const n = b - a + 1; const f = Math.min(Math.floor(FADE * sr), Math.floor(n / 4)); const out = ctx.createBuffer(ch.length, n - f, sr); let sq = 0; let peak = 0;
  for (let i = a; i <= b; i++) for (const c of ch) { sq += c[i] * c[i]; peak = Math.max(peak, Math.abs(c[i])); }
  const rms = Math.sqrt(sq / (n * ch.length)); const g = Math.min(0.13 / (rms || 1), 0.9 / (peak || 1));
  ch.forEach((c, k) => { const o = out.getChannelData(k); for (let i = 0; i < n - f; i++) { let v = c[a + i]; if (i < f) { const t = (i / f) * Math.PI * 0.5; v = v * Math.sin(t) + c[a + n - f + i] * Math.cos(t); } o[i] = Math.max(-1, Math.min(1, v * g)); } });
  return out;
}

/** Resolves true when the local theme is in the audio cache; false means "use the licensed track". */
export async function loadLocalTheme(game) {
  try {
    if (!['localhost', '127.0.0.1'].includes(location.hostname) || !game.sound.context) return false;
    const r = await fetch('local-music/main-theme'); if (!r.ok || !/audio/.test(r.headers.get('content-type') || '')) return false;
    const buf = await game.sound.context.decodeAudioData(await r.arrayBuffer()); game.cache.audio.add(`m_${MAIN_THEME}`, makeLoop(game.sound.context, buf)); return true;
  } catch { return false; }
}
