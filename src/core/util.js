import Phaser from 'phaser';

export const BODY = '"VT323", monospace';
export const HEAD = '"Handjet", "VT323", monospace';
export const T = 16;
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const clamp = Phaser.Math.Clamp;

/** Crisp text. World-space text passes res:3 because the level camera is zoomed. */
export function txt(scene, x, y, s, size = 24, color = '#fff6e0', o = {}) {
  const t = scene.add.text(x, y, s, {
    fontFamily: o.head ? HEAD : BODY, fontSize: `${size}px`, color, align: o.align || 'center',
    stroke: o.stroke || '#1c1428', strokeThickness: o.st ?? Math.max(2, Math.round(size / 6)),
    wordWrap: o.wrap ? { width: o.wrap } : undefined, lineSpacing: o.ls ?? 0, fontStyle: o.head ? '700' : '400',
    padding: { top: Math.ceil(size * 0.28), bottom: 3, left: 2, right: 2 }, // room for stacked Vietnamese accents
  });
  t.setResolution(o.res || 1).setOrigin(o.ox ?? 0.5, o.oy ?? 0.5);
  if (o.depth !== undefined) t.setDepth(o.depth);
  if (o.fixed) t.setScrollFactor(0);
  if (o.shadow) t.setShadow(0, 4, o.shadow, 0, true, true);
  return t;
}
export const wtxt = (scene, x, y, s, size = 10, color = '#fff6e0', o = {}) => txt(scene, x, y, s, size, color, { res: 3, st: 2, ...o });

export function spr(scene, x, y, name, frame = 0, depth = 0) {
  return scene.add.sprite(x, y, 'atlas', `${name}/${frame}`).setDepth(depth);
}

export function panel(scene, x, y, w, h, kind = 'panel_dark') {
  const f = scene.textures.getFrame('atlas', `${kind}/0`);
  return scene.add.nineslice(x, y, 'atlas', f.name, w, h, 12, 12, 12, 12);
}

/** Register every multi-frame atlas entry as an animation of the same name. */
export function makeAnims(scene) {
  const counts = scene.cache.json.get('atlasmeta').meta.counts;
  const fps = { coffee: 6, special: 7, machine: 5, waterfall: 12, watertop: 6, fountain: 9, portal: 9, miniportal: 10, gremlin: 8, citation: 9, tracked: 12, format: 5, letter: 10, stress: 4, conveyor: 12, beetle: 7, writers: 2, sigil: 8, page: 7, framework: 6, spark: 14, dust: 14, coin: 12, bird: 7, boss_machine: 8, b_torch: 7, b_moth: 6, buffalo: 6, goat: 3, chicken: 6, mosquito: 14, finding: 5, bulb: 6, cursor: 2, grad: 1.2, grad_yay: 4, crystal: 5, wok: 8, nemleo: 5, coolleo: 4, suitleo: 2, q_giant: 5, scope: 8 };
  for (const [n, c] of Object.entries(counts)) {
    if (c < 2 || ['word', 'tc', 'sup', 'q_odd', 'seal', 'flap', 'money', 'hustle', 'plan', 'comm_a', 'comm_b', 'comm_c', 'taxman', 'profleo', 'headleo', 'reviewer2'].includes(n) || scene.anims.exists(n)) continue;
    let end = c - 1; let start = 0;
    if (n === 'boss_machine') end = 3;
    if (n === 'boss_stamp') end = 1;
    if (n === 'machine') start = 1;
    const once = n === 'dust' || n === 'spark';
    scene.anims.create({ key: n, frames: scene.anims.generateFrameNames('atlas', { prefix: `${n}/`, start, end }), frameRate: fps[n] || (n.startsWith('ra_run') ? 14 : n.startsWith('tree') ? 3 : n.startsWith('face') ? 1 : n.startsWith('boss') ? 2 : 4), repeat: once ? 0 : -1 });
  }
  const L = scene.cache.json.get('leoSheet');
  const f2 = { idle: 5, run: 16, jump: 8, fall: 8, land: 14, slide: 8, climb: 9, cast: 16, hurt: 8, talk: 5, celebrate: 8, sit: 2, glasses: 4, email: 1.6, coffee: 3, stare: 1.4, carry: 4 };
  for (const [n, [row, c]] of Object.entries(L.rows)) {
    if (scene.anims.exists(`leo_${n}`)) continue;
    scene.anims.create({ key: `leo_${n}`, frames: scene.anims.generateFrameNumbers('leo', { start: row * L.columns, end: row * L.columns + c - 1 }), frameRate: f2[n] || 6, repeat: ['cast', 'land', 'jump', 'glasses', 'email', 'coffee'].includes(n) ? 0 : -1 });
  }
}

/** Drifting parallax rig for a theme. Returns {update, destroy}. */
export function backdrop(scene, theme, depth = -100) {
  const cx0 = scene.cameras.main.width / 2; const cy0 = scene.cameras.main.height / 2; const w = 520;
  const has = (k) => scene.textures.exists(`bg_${theme}_${k}`);
  const z = []; const sky = scene.add.image(cx0, cy0, `bg_${theme}_sky`).setScrollFactor(0).setDepth(depth).setDisplaySize(w, 300);
  z.push(sky);
  const L = [['far', 0.08, 8], ['clouds', 0.14, 10], ['mid', 0.24, 18], ['near', 0.42, 26]].filter(([k]) => has(k)).map(([k, f, v], i) => {
    const s = scene.add.tileSprite(cx0, cy0, w, 300, `bg_${theme}_${k}`).setScrollFactor(0).setDepth(depth + 1 + i); z.push(s); return { s, f, v, k };
  });
  let drift = 0;
  return {
    objs: z,
    update(dt, cx, ratioY) {
      drift += dt * 0.004;
      for (const l of L) { l.s.tilePositionX = Math.round(cx * l.f + (l.k === 'clouds' ? drift : 0)); l.s.y = cy0 - 11 + Math.round((1 - ratioY) * l.v); }
    },
    setAlpha(a) { z.forEach((o) => o.setAlpha(a)); }, destroy() { z.forEach((o) => o.destroy()); },
  };
}

/** Keyboard listener that never handles one DOM event twice (Phaser can replay its queue at low fps). */
export function onKey(scene, fn) {
  const seen = new WeakSet(); const h = (e) => { if (seen.has(e)) return; seen.add(e); fn(e); };
  scene.input.keyboard.on('keydown', h); return h;
}

/** Fade out, then start a scene exactly once. Finishes on the fade event, or on a real-time timer if the fade stalls. */
export function fadeTo(scene, key, data, ms = 350) {
  if (scene._leaving) return; scene._leaving = true; let gone = false; const cam = scene.cameras.main;
  const stop = () => { clearTimeout(t); scene.events.off('shutdown', stop); };
  const go = () => { if (gone) return; gone = true; stop(); cam.off('camerafadeoutcomplete', go); scene.scene.start(key, data); };
  const t = setTimeout(() => { if (!gone && (scene.sys.isActive() || scene.sys.isPaused())) go(); }, ms + 2500); scene.events.once('shutdown', () => { gone = true; stop(); });
  cam.once('camerafadeoutcomplete', go); cam.fadeOut(ms, 20, 14, 30);
}

export const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
