// ===== ТЕСТОВЫЙ мир: только замок Калина на маленькой карте. =====
// Форк world.js для файла test-kalin.html — та же логика замка/коллизий,
// но без деревень/лагерей воевод и на маленькой карте, чтобы сразу драться с Калином.
'use strict';
const TILE = 40;
const MAP_W = 60, MAP_H = 60;
const T = { GRASS: 0, FOREST: 1, WATER: 2, RAVINE: 3, BRIDGE_W: 4, BRIDGE_R: 5, DIRT: 6, STONE: 7, WALL: 8, SAND: 9, SWAMP: 10 };

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed) {
  const hash = (x, y) => {
    let h = (x * 374761393 + y * 668265263) ^ seed;
    h = (h ^ (h >>> 13)) * 1274126177;
    return (((h ^ (h >>> 16)) >>> 0) % 100000) / 100000;
  };
  function smooth(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  return (x, y, oct = 3) => {
    let val = 0, amp = 1, freq = 1, norm = 0;
    for (let i = 0; i < oct; i++) { val += smooth(x * freq, y * freq) * amp; norm += amp; amp *= 0.5; freq *= 2.1; }
    return val / norm;
  };
}

function generateWorld(seed) {
  const rnd = mulberry32(seed);
  const elevN = makeNoise(seed * 7 + 1), forestN = makeNoise(seed * 13 + 5), ravN = makeNoise(seed * 29 + 11);
  const terrain = new Uint8Array(MAP_W * MAP_H);
  const idx = (x, y) => y * MAP_W + x;

  // --- базовый ландшафт — та же формула, что и в игре, просто на маленьком поле ---
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const e = elevN(x / 26, y / 26), f = forestN(x / 18, y / 18), rv = ravN(x / 21, y / 21);
    let t = T.GRASS;
    if (e < 0.30) t = T.WATER;
    else if (e < 0.34) t = T.SAND;
    else if (Math.abs(rv - 0.5) < 0.02 && e > 0.45) t = T.RAVINE;
    else if (f > 0.6) t = T.FOREST;
    terrain[idx(x, y)] = t;
  }

  const world = {
    seed, terrain, W: MAP_W, H: MAP_H,
    trees: [], props: [], buildings: [], camps: [], villages: [],
    spawn: null, castle: null,
  };
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) ? T.WATER : terrain[idx(x, y)];

  // --- замок Калина-царя — прямо в центре маленькой карты ---
  const CW = 21, CH = 15;
  const cx = MAP_W >> 1, cy = MAP_H >> 1;
  const x0 = cx - (CW >> 1), y0 = cy - (CH >> 1);
  for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CW; x++)
    if (x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1) terrain[idx(x, y)] = T.STONE;
  for (let x = x0; x < x0 + CW; x++) { terrain[idx(x, y0)] = T.WALL; terrain[idx(x, y0 + CH - 1)] = T.WALL; }
  for (let y = y0; y < y0 + CH; y++) { terrain[idx(x0, y)] = T.WALL; terrain[idx(x0 + CW - 1, y)] = T.WALL; }
  const gx = x0 + (CW >> 1);
  for (let d = -2; d <= 2; d++) terrain[idx(gx + d, y0 + CH - 1)] = T.STONE;
  const gy = y0 + CH - 1;
  world.castle = {
    x0, y0, w: CW, h: CH, gate: { x: gx, y: gy },
    gatePx: { x0: (gx - 2) * TILE, x1: (gx + 3) * TILE, y0: gy * TILE, y1: (gy + 1) * TILE },
    cx: (x0 + CW / 2) * TILE, cy: (y0 + CH / 2 - 1) * TILE,
  };
  // тестовый мир: ворота уже открыты (не нужно гоняться за 4 воеводами, которых тут нет) —
  // но захлопнутся как обычно, когда войдёшь к живому Калину (world.kalinLockdown)
  world.gateOpen = true;
  world.kalinLockdown = false;

  // короткая дорожка от ворот наружу — чисто для вида
  for (let y = gy + 1; y <= gy + 3 && y < MAP_H - 1; y++)
    for (const px of [gx - 1, gx, gx + 1]) terrain[idx(px, y)] = T.DIRT;

  // --- точка старта: прямо перед воротами, чтобы не тратить время на дорогу ---
  const sx = gx, sy = Math.min(MAP_H - 2, gy + 3);
  world.spawn = { x: (sx + 0.5) * TILE, y: (sy + 0.5) * TILE };

  // --- родник рядом — удобно подлечиться между попытками ---
  if (sy + 4 < MAP_H - 1) world.props.push({ type: 'spring', x: (sx + 3.5) * TILE, y: (sy + 4.5) * TILE, used: false });

  // --- немного деревьев для вида (те же правила, что в основной генерации) ---
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
    const t = terrain[idx(x, y)];
    if (t !== T.GRASS && t !== T.FOREST) continue;
    const f = forestN(x / 18, y / 18);
    const dense = t === T.FOREST;
    const chance = dense ? 0.42 : (f > 0.45 ? 0.06 : 0.015);
    if (rnd() < chance) {
      const r = rnd();
      const kind = r < 0.62 ? 'birch' : (r < 0.85 ? 'spruce' : 'oak');
      world.trees.push({
        x: (x + 0.15 + rnd() * 0.7) * TILE, y: (y + 0.15 + rnd() * 0.7) * TILE,
        kind, size: 0.8 + rnd() * 0.5, bend: 0, bendV: 0, phase: rnd() * 6.28, alive: true, watered: 0,
      });
    }
  }
  world.trees.sort((a, b) => a.y - b.y);

  world.tileAt = tileAt;
  world.passable = (px, py) => {
    const t = tileAt(Math.floor(px / TILE), Math.floor(py / TILE));
    if (t === T.WATER || t === T.RAVINE || t === T.WALL) return false;
    if ((!world.gateOpen || world.kalinLockdown) && world.castle) {
      const g = world.castle.gatePx;
      if (px >= g.x0 && px < g.x1 && py >= g.y0 && py < g.y1) return false;
    }
    for (const b of world.buildings)
      if (Math.abs(px - b.x) < b.w / 2 + 8 && Math.abs(py - b.y) < b.h / 2 + 6) return false;
    return true;
  };
  world.rnd = rnd;
  return world;
}
