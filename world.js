// ===== Генерация мира: Русь XIII века. Каждый запуск — новая случайная карта. =====
'use strict';
const TILE = 40;
const MAP_W = 150, MAP_H = 150;
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

  // --- базовый ландшафт: поля, леса, озёра-реки, овраги ---
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const e = elevN(x / 26, y / 26), f = forestN(x / 18, y / 18), rv = ravN(x / 21, y / 21);
    let t = T.GRASS;
    if (e < 0.36) t = T.WATER;
    else if (e < 0.40) t = T.SAND;
    else if (Math.abs(rv - 0.5) < 0.022 && e > 0.45) t = T.RAVINE;
    else if (f > 0.58) t = T.FOREST;
    // край карты — непроходимая чаща/вода не нужна, просто стена леса за границей рисуется
    terrain[idx(x, y)] = t;
  }

  const world = {
    seed, terrain, W: MAP_W, H: MAP_H,
    trees: [], props: [], buildings: [], camps: [], villages: [],
    spawn: null, castle: null,
  };
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) ? T.WATER : terrain[idx(x, y)];
  const landOK = (x, y) => { const t = tileAt(x, y); return t !== T.WATER && t !== T.RAVINE; };

  // область целиком на суше?
  function areaLand(cx, cy, r) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++)
      if (x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2) return false;
    let bad = 0;
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++)
      if (!landOK(x, y)) bad++;
    return bad <= r; // допускаем чуть-чуть воды — зальём
  }

  // --- точка старта: близко к центру, на суше ---
  let sx = MAP_W >> 1, sy = MAP_H >> 1;
  for (let tries = 0; tries < 500; tries++) {
    const x = (MAP_W >> 1) + Math.floor((rnd() - 0.5) * 30), y = (MAP_H >> 1) + Math.floor((rnd() - 0.5) * 30);
    if (areaLand(x, y, 3)) { sx = x; sy = y; break; }
  }
  for (let y = sy - 2; y <= sy + 2; y++) for (let x = sx - 2; x <= sx + 2; x++) terrain[idx(x, y)] = T.DIRT;
  world.spawn = { x: (sx + 0.5) * TILE, y: (sy + 0.5) * TILE };

  const pois = []; // для минимальных дистанций между точками интереса
  function pickSpot(minD, maxD, clearR, minApart) {
    for (let tries = 0; tries < 4000; tries++) {
      const ang = rnd() * Math.PI * 2, d = minD + rnd() * (maxD - minD);
      const x = Math.round(sx + Math.cos(ang) * d), y = Math.round(sy + Math.sin(ang) * d);
      if (!areaLand(x, y, clearR)) continue;
      let ok = true;
      for (const p of pois) if (Math.hypot(p.x - x, p.y - y) < minApart) { ok = false; break; }
      if (ok) { pois.push({ x, y }); return { x, y }; }
    }
    return null;
  }

  // --- дорога от старта до точки: по пути через воду — мост, через овраг — мостки ---
  function carvePath(tx, ty) {
    let x = sx, y = sy;
    let guard = 0;
    while ((x !== tx || y !== ty) && guard++ < 3000) {
      const dx = Math.sign(tx - x), dy = Math.sign(ty - y);
      if (rnd() < 0.5 && dx !== 0) x += dx; else if (dy !== 0) y += dy; else if (dx !== 0) x += dx;
      if (rnd() < 0.12) { // лёгкая извилистость
        const jx = x + (rnd() < 0.5 ? 1 : -1);
        if (jx > 1 && jx < MAP_W - 2) x = jx;
      }
      for (const [px, py] of [[x, y], [x + 1, y]]) {
        if (px < 1 || py < 1 || px >= MAP_W - 1 || py >= MAP_H - 1) continue;
        const t = terrain[idx(px, py)];
        if (t === T.WATER || t === T.SAND) terrain[idx(px, py)] = T.BRIDGE_W;
        else if (t === T.RAVINE) terrain[idx(px, py)] = T.BRIDGE_R;
        else if (t === T.GRASS || t === T.FOREST) terrain[idx(px, py)] = T.DIRT;
      }
    }
  }

  // --- замок Калина-царя ---
  const CW = 21, CH = 15;
  (function placeCastle() {
    let spot = pickSpot(52, 66, 13, 30) || pickSpot(40, 66, 11, 20) || { x: sx + 45, y: sy };
    const cx = spot.x, cy = spot.y;
    const x0 = cx - (CW >> 1), y0 = cy - (CH >> 1);
    for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CW; x++)
      if (x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1) terrain[idx(x, y)] = T.STONE;
    for (let x = x0; x < x0 + CW; x++) { terrain[idx(x, y0)] = T.WALL; terrain[idx(x, y0 + CH - 1)] = T.WALL; }
    for (let y = y0; y < y0 + CH; y++) { terrain[idx(x0, y)] = T.WALL; terrain[idx(x0 + CW - 1, y)] = T.WALL; }
    const gx = x0 + (CW >> 1);
    // ворота шире — приручённым зверям, идущим следом, есть куда протиснуться
    for (let d = -2; d <= 2; d++) terrain[idx(gx + d, y0 + CH - 1)] = T.STONE;
    const gy = y0 + CH - 1;
    world.castle = {
      x0, y0, w: CW, h: CH, gate: { x: gx, y: gy },
      // пиксельная зона ворот — пока закрыты (или заперты Калином), через неё нельзя пройти
      gatePx: { x0: (gx - 2) * TILE, x1: (gx + 3) * TILE, y0: gy * TILE, y1: (gy + 1) * TILE },
      cx: (x0 + CW / 2) * TILE, cy: (y0 + CH / 2 - 1) * TILE,
    };
    world.gateOpen = false; // откроются, когда все воеводы повержены
    world.kalinLockdown = false; // запираются заново, когда герой входит к Калину живому
    carvePath(gx, y0 + CH + 1);
  })();

  // --- лагеря воевод (боссов) ---
  const bossKinds = ['solovey', 'polovets', 'rosomaha', 'koschei'];
  for (const kind of bossKinds) {
    const spot = pickSpot(24, 55, 5, 22) || pickSpot(15, 60, 4, 12);
    if (!spot) continue;
    const { x, y } = spot;
    for (let yy = y - 3; yy <= y + 3; yy++) for (let xx = x - 3; xx <= x + 3; xx++)
      if (Math.hypot(xx - x, yy - y) < 3.4 && landOK(xx, yy)) terrain[idx(xx, yy)] = T.DIRT;
    carvePath(x, y);
    const nHost = kind === 'koschei' ? 1 : 1 + Math.floor(rnd() * 2);
    world.camps.push({ kind, tx: x, ty: y, x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, hostages: nHost, treasure: rnd() < 0.7 });
  }

  // --- деревни ---
  for (let v = 0; v < 3; v++) {
    const spot = pickSpot(14, 48, 5, 18);
    if (!spot) continue;
    const { x, y } = spot;
    for (let yy = y - 4; yy <= y + 4; yy++) for (let xx = x - 4; xx <= x + 4; xx++)
      if (Math.hypot(xx - x, yy - y) < 4.3 && landOK(xx, yy)) terrain[idx(xx, yy)] = T.DIRT;
    carvePath(x, y);
    const nHuts = 3 + Math.floor(rnd() * 3);
    const village = { tx: x, ty: y, huts: [] };
    for (let h = 0; h < nHuts; h++) {
      const ang = (h / nHuts) * Math.PI * 2 + rnd() * 0.6;
      const hx = (x + Math.cos(ang) * 2.7 + 0.5) * TILE, hy = (y + Math.sin(ang) * 2.7 + 0.5) * TILE;
      // people: в избе кто-то живёт (стук, окно и хлеб ведут себя согласованно)
      const b = { x: hx, y: hy, w: 78, h: 62, type: 'izba', burnt: rnd() < 0.25, people: rnd() < 0.72 };
      world.buildings.push(b); village.huts.push(b);
    }
    world.props.push({ type: 'well', x: (x + 0.5) * TILE, y: (y + 0.5) * TILE });
    world.villages.push(village);
  }

  // --- гарантия проходимости: недостижимых карманов суши быть не должно ---
  // (отброшенный свистом или ЯМОЙ герой не должен попадать в западню без выхода)
  // Волна от спавна по проходимым тайлам; внутрь замка она заходит через проём ворот.
  // Всё, куда волна не дошла, обрушиваем в овраг или заливаем водой.
  {
    const blockedT = (x, y) => {
      const t = tileAt(x, y);
      return t === T.WATER || t === T.RAVINE || t === T.WALL;
    };
    const seen = new Uint8Array(MAP_W * MAP_H);
    const queue = [idx(sx, sy)];
    seen[queue[0]] = 1;
    while (queue.length) {
      const c = queue.pop(), cx = c % MAP_W, cy = (c / MAP_W) | 0;
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
        const n = idx(nx, ny);
        if (seen[n] || blockedT(nx, ny)) continue;
        seen[n] = 1;
        queue.push(n);
      }
    }
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      if (seen[idx(x, y)] || blockedT(x, y)) continue;
      let waterN = 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])
        if (tileAt(nx, ny) === T.WATER) waterN++;
      terrain[idx(x, y)] = waterN ? T.WATER : T.RAVINE;
    }
  }

  // --- деревья (после дорог, чтобы дороги были чистые) ---
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
    } else if (rnd() < 0.012) {
      const r = rnd();
      world.props.push({
        type: r < 0.28 ? 'stone' : r < 0.52 ? 'bush' : r < 0.72 ? 'mushroom' : r < 0.87 ? 'flowers' : r < 0.96 ? 'stump' : 'hive',
        x: (x + 0.2 + rnd() * 0.6) * TILE, y: (y + 0.2 + rnd() * 0.6) * TILE, used: false,
      });
    }
  }
  world.trees.sort((a, b) => a.y - b.y);

  // --- сундуки-клады в глуши ---
  for (let c = 0; c < 4; c++) {
    const spot = pickSpot(18, 60, 2, 10);
    if (spot) world.props.push({ type: 'chest', x: (spot.x + 0.5) * TILE, y: (spot.y + 0.5) * TILE, used: false });
  }

  // --- родники с живой водой (+макс. здоровье) ---
  for (let c = 0; c < 3; c++) {
    const spot = pickSpot(16, 62, 2, 14);
    if (spot) world.props.push({ type: 'spring', x: (spot.x + 0.5) * TILE, y: (spot.y + 0.5) * TILE, used: false });
  }

  world.tileAt = tileAt;
  world.passable = (px, py) => {
    const t = tileAt(Math.floor(px / TILE), Math.floor(py / TILE));
    if (t === T.WATER || t === T.RAVINE || t === T.WALL) return false;
    // закрытые ворота замка — как стена, пока не повержены все воеводы,
    // либо заперты заново, пока герой бьётся с живым Калином внутри
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
