// Safety nets. They limit the damage of an unexpected failure; they are not a substitute for correct code.

/** Scene update listener that is removed when the scene shuts down (scene.events outlives a restart). */
export function onUpdate(scene, fn) { scene.events.on('update', fn); scene.events.once('shutdown', () => scene.events.off('update', fn)); }
/** Any scene event, removed on shutdown. */
export function onScene(scene, ev, fn) { scene.events.on(ev, fn); scene.events.once('shutdown', () => scene.events.off(ev, fn)); }

const OK_CODES = new Set(['Enter', 'NumpadEnter', 'Space', 'KeyX', 'KeyJ', 'KeyZ', 'KeyK', 'KeyF']);
/** Confirm key, by physical key so Caps Lock and Vietnamese input methods cannot break it. */
export const isOk = (e) => !e.repeat && (OK_CODES.has(e.code) || ['Enter', ' '].includes(e.key));

/** Forget everything a previous run left on a reused scene object. Call first in init(). */
export function freshState(scene) {
  if (!scene._base) { scene._base = new Set([...Object.keys(scene), '_base']); return; }
  for (const k of Object.keys(scene)) if (!scene._base.has(k)) delete scene[k];
}

/** Phaser stops its frame loop for good if one callback throws. Keep the loop alive, report the error, and recover if it keeps failing. */
export function guardFrames(game) {
  const raf = game.loop.raf; const start = raf.start.bind(raf); let streak = 0; let quiet = 0; game.faults = 0;
  const wrap = (cb) => (t) => {
    try { cb(t); if (++quiet > 120) streak = 0; } catch (e) {
      quiet = 0; game.faults++; streak++; if (streak <= 3) console.error('[recovered]', e);
      if (streak === 20) recover(game); else if (streak === 80) toMap(game);
    }
  };
  raf.start = (cb, ...a) => start(wrap(cb), ...a);
  if (raf.isRunning) raf.callback = wrap(raf.callback);
}
/** Restart the current level from its last coffee machine. Achievements and checkpoints are already saved. */
export function recover(game) {
  const S = game.scene; const L = S.getScene('Level'); try { if (L && L.levelId && (S.isActive('Level') || S.isPaused('Level'))) { const level = L.levelId; ['Pause', 'Settings', 'CV', 'HUD', 'Level'].forEach((k) => S.stop(k)); S.start('Level', { level }); } else toMap(game); } catch (e) { console.error(e); }
}
function toMap(game) { try { const S = game.scene; S.getScenes(false).forEach((s) => { if (!['Boot', 'Map'].includes(s.sys.settings.key)) S.stop(s.sys.settings.key); }); S.start('Map'); } catch (e) { console.error(e); } }
