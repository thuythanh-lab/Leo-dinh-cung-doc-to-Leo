import { T } from '../core/util.js';

export const THEMES = ['campus', 'library', 'water', 'garden', 'archive', 'tower', 'treasury', 'office'];
const PER = 80; const SP = 64; // special row starts at index 64

/** Tile-space level authoring. Symbols: # solid, - one-way, = bridge, B breakable, K book block, H ladder, ^ hazard */
export default class Builder {
  constructor(L, w, h) { this.L = L; this.w = w; this.h = h; this.g = Array.from({ length: h }, () => new Array(w).fill('.')); this.zones = []; this.decorSkip = new Set(); this.backs = []; }
  /** darkened wall behind caves and shafts */
  back(x, y, w, h) { this.backs.push([x, y, w, h]); return this; }
  zone(o) { this.zones.push({ deadly: true, ...o }); return this; }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = c; }
  get(x, y) { return x < 0 || x >= this.w ? '#' : y < 0 || y >= this.h ? '.' : this.g[y][x]; }
  fill(x, y, w, h, c = '#') { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); return this; }
  cut(x, y, w, h) { return this.fill(x, y, w, h, '.'); }
  /** ground column block from x0..x1 (inclusive) with its surface at row y, down to `bot` */
  ground(x0, x1, y, bot) { return this.fill(x0, y, x1 - x0 + 1, bot - y); }
  plat(x, y, w = 3) { return this.fill(x, y, w, 1, '-'); }
  bridge(x, y, w) { return this.fill(x, y, w, 1, '='); }
  brk(x, y, w = 1, h = 1) { return this.fill(x, y, w, h, 'B'); }
  books(x, y, w = 1, h = 1) { return this.fill(x, y, w, h, 'K'); }
  ladder(x, y, h) { this.fill(x, y, 1, h, 'H'); this.set(x, y, 'T'); return this; }
  haz(x, y, w = 1) { return this.fill(x, y, w, 1, '^'); }
  room(x, y, w, h, t = 1) { this.fill(x, y, w, h); this.cut(x + t, y + t, w - 2 * t, h - 2 * t); return this; }
  themeAt(x, y) { const z = this.zoneAt(x, y); return THEMES.indexOf(z ? z.tiles || z.theme : this.zones[0].theme); }
  zoneAt(x, y) { return this.zones.find((z) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h); }

  make() {
    const L = this.L; const map = L.make.tilemap({ tileWidth: T, tileHeight: T, width: this.w, height: this.h });
    const sets = THEMES.map((t, i) => map.addTilesetImage(t, `tiles_${t}`, T, T, 0, 0, i * PER));
    const layer = map.createBlankLayer('main', sets).setDepth(5); const deco = map.createBlankLayer('deco', sets).setDepth(6); const lad = map.createBlankLayer('ladder', sets).setDepth(4);
    const bk = map.createBlankLayer('back', sets).setDepth(1);
    for (const [x, y, w, h] of this.backs) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { const t = bk.putTileAt(this.themeAt(i, j) * PER + 15 + 16 * ((i % 2) + 2 * (j % 2)), i, j); t.tint = 0x6a5568; }
    const sol = (c) => c === '#';
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.g[y][x]; if (c === '.') continue; const base = this.themeAt(x, y) * PER;
        const z = this.zoneAt(x, y); const inZ = (i, j) => !z || (i >= z.x && i < z.x + z.w && j >= z.y && j < z.y + z.h);
        const S = (i, j) => !inZ(i, j) || sol(this.get(i, j));
        if (c === '#') {
          const m = (S(x, y - 1) ? 1 : 0) | (S(x + 1, y) ? 2 : 0) | (S(x, y + 1) ? 4 : 0) | (S(x - 1, y) ? 8 : 0);
          layer.putTileAt(base + m + 16 * ((x % 2) + 2 * (y % 2)), x, y);
          if (!S(x, y - 1) && this.get(x, y - 1) === '.' && !this.decorSkip.has(`${x}`) && (x * 7919 + y * 104729) % 100 < (['campus', 'garden'].includes(THEMES[base / PER]) ? 40 : 10)) deco.putTileAt(base + SP + 10 + ((x * 31 + y * 17) % 4), x, y - 1);
        } else if (c === '-') { const l = this.get(x - 1, y) === '-'; const r = this.get(x + 1, y) === '-'; layer.putTileAt(base + SP + (l && r ? 1 : l ? 2 : r ? 0 : 3), x, y); } else if (c === '=') layer.putTileAt(base + SP + 14, x, y);
        else if (c === 'B') layer.putTileAt(base + SP + 8, x, y);
        else if (c === 'K') layer.putTileAt(base + SP + 9, x, y);
        else if (c === 'H' || c === 'T') { lad.putTileAt(base + SP + 4, x, y); if (c === 'T') layer.putTileAt(base + SP + 3, x, y); }
        else if (c === '^') layer.putTileAt(base + SP + 6, x, y);
      }
    }
    this.layer = layer; this.deco = deco; this.lad = lad; this.map = map;
    layer.forEachTile((t) => {
      if (t.index < 0) return; const k = t.index % PER; t.kind = k < SP ? 'solid' : k - SP < 4 ? 'oneway' : k - SP === 14 ? 'oneway' : k - SP === 8 ? 'break' : k - SP === 9 ? 'book' : 'haz';
      if (t.kind === 'oneway') t.setCollision(false, false, true, false); else if (t.kind === 'haz') t.setCollision(false); else t.setCollision(true);
    });
    layer.calculateFacesWithin();
    layer.forEachTile((t) => { if (t.kind === 'oneway') { t.faceTop = true; t.faceBottom = t.faceLeft = t.faceRight = false; } });
    return { map, layer, deco, lad };
  }
}
