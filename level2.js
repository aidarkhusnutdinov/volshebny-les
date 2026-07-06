// ===== УРОВЕНЬ 2: ТЁМНЫЙ ЛЕС =====
// Открывается после победы над Калином. Мрачная чаща: говорящие деревья,
// утопленницы, красные тени, Чёрные, навьи; боссы — Шурале, Лоно, Босая Нога,
// Великан; в конце — ЯМА, изрыгающая мертвецов. Подключается после game.js.
'use strict';

// ---------- новые звери (приручаемые) ----------
Object.assign(ANIMALS, {
  bear: {
    name: 'Медведь', hp: 160, dmg: 22, speed: 140, tame: 0.2, draw: 'quad',
    s: 1.35, body: '#5e4228', head: '#5e4228', snout: '#8a6a48', legC: '#4a3420', tailW: 3,
  },
  gbat: { name: 'Гигантская летучая мышь', hp: 70, dmg: 10, speed: 190, tame: 0.3, draw: 'gbat', s: 1.2 },
  badger: {
    name: 'Барсук', hp: 55, dmg: 9, speed: 120, tame: 0.5, draw: 'quad',
    s: 0.7, body: '#6d6a64', head: '#e8e4da', snout: '#2b2b28', legC: '#3a3835', tailW: 3,
  },
  tvar: { name: 'ТВАРЬ', hp: 120, dmg: 16, speed: 150, tame: 0.12, draw: 'tvar', s: 1.1 },
  wolverine: {
    name: 'Росомаха', hp: 90, dmg: 14, speed: 150, tame: 0.25, draw: 'quad',
    s: 0.85, body: '#3d3128', head: '#3d3128', snout: '#8a6a48', legC: '#2b221a', tailW: 5,
  },
  fox: {
    name: 'Лиса', hp: 45, dmg: 7, speed: 185, tame: 0.45, draw: 'quad',
    s: 0.72, body: '#c96a2e', head: '#c96a2e', snout: '#e8e4da', legC: '#8a4520', tailW: 6, tailC: '#c96a2e',
  },
  tiger: {
    name: 'Тигр', hp: 150, dmg: 20, speed: 175, tame: 0.15, draw: 'quad',
    s: 1.25, body: '#d6822e', head: '#d6822e', snout: '#e8e4da', legC: '#b06a24', tailW: 4, tigerStripes: true,
  },
});
Object.assign(PREDATORS, { bear: 1, tiger: 1, wolverine: 1, tvar: 1 });

// сколько кого бродит по тёмному лесу (белый олень — через переокраску deer);
// в чаще гнездятся и драконы — приручишь огромного, будет жечь нечисть с неба
const L2_ANIMAL_COUNTS = {
  horse: 4, bear: 3, gbat: 3, badger: 4, tvar: 2, wolverine: 3, fox: 4,
  tiger: 2, kikimora: 3, zhopa: 2, deer: 4, wolf: 4, drakonB: 2, drakonH: 2,
};

// ---------- дикие враги тёмного леса ----------
const L2_WILD = {
  derevo: { name: 'Дерево-морок', hp: 160, dmg: 14, speed: 42, xp: 45, n: 9 },
  spider: { name: 'Паук', hp: 70, dmg: 10, speed: 160, xp: 30, n: 7 },
  redshadow: { name: 'Красная тень', hp: 55, dmg: 16, speed: 195, xp: 40, n: 5 },
  nav: { name: 'Навья', hp: 65, dmg: 12, speed: 185, xp: 40, n: 5 },
  utopl: { name: 'Утопленница', hp: 95, dmg: 15, speed: 185, xp: 45, n: 5 },
  cherny: { name: 'Чёрный', hp: 130, dmg: 13, speed: 120, xp: 45, n: 5 },
  bat: { name: 'Летучая мышь', hp: 30, dmg: 6, speed: 210, xp: 15, n: 8 },
  croc: { name: 'Крокодил', hp: 140, dmg: 18, speed: 130, xp: 50, n: 5 },
  vodyanoy: { name: 'Водяной', hp: 110, dmg: 12, speed: 90, xp: 50, n: 3 },
  likho: { name: 'Лихо Одноглазое', hp: 9999, dmg: 16, speed: 72, xp: 0, n: 2 },
  suka: { name: 'Сука', hp: 85, dmg: 14, speed: 170, xp: 35, n: 5 },
  chert: { name: 'Чёрт', hp: 65, dmg: 7, speed: 175, xp: 25, n: 6 },
  chudo: { name: 'Чудо-юдо', hp: 500, dmg: 24, speed: 55, xp: 120, n: 2 },
  lesnoy: { name: 'Лесной разбойник', hp: 75, dmg: 12, speed: 125, xp: 35, n: 6, weapon: 'club' },
};

const L2_BOSSES = {
  // живучесть — среднее между первой (слишком злой) и урезанной (слишком лёгкой) версиями;
  // урон оставлен урезанным, зато звери ранят боссов вполсилы (см. hurtEnemy)
  shurale: { name: 'Шурале', hp: 490, dmg: 16, speed: 115, weapon: null, xp: 300 },
  lono: { name: 'Лоно', hp: 430, dmg: 12, speed: 80, weapon: null, xp: 300 },
  noga: { name: 'БОСАЯ НОГА', hp: 630, dmg: 22, speed: 90, weapon: null, xp: 300 },
  velikan: { name: 'Великан', hp: 585, dmg: 20, speed: 85, weapon: null, xp: 300 },
  yama: { name: 'ЯМА', hp: 925, dmg: 0, speed: 0, weapon: null, xp: 900 },
};

Object.assign(ENCOUNTER, {
  derevo: 'дерево с гримасой — говорит и душит ветвями',
  spider: 'мохнатый душегуб, вяжет паутиной',
  redshadow: 'тощий сгусток алой мглы, мерцает и режет',
  nav: 'белая полупрозрачная птица мёртвых',
  utopl: 'мёртвая невеста идёт к тебе, вытянув руки',
  cherny: 'существо из нефти и грязи, след чернее ночи',
  bat: 'кожаное крыло ночи',
  croc: 'выполз из чёрной реки, пасть — капкан',
  vodyanoy: 'хозяин омута, тиной пахнет беда',
  lesnoy: 'лихой человек — переманивает твоих зверей!',
  shurale: 'лесной дух — защекочет до смерти',
  lono: 'розовая погибель на ножках, воет убийственно',
  noga: 'босая нога размером с дом — растопчет',
  velikan: 'исполин, чьё зловоние валит с ног',
  yama: 'дыра в преисподнюю, изрыгает мертвецов',
  zombie: 'вылез из ямы, смердит и голоден',
  ruka: 'ползёт сама и хватает за ноги',
  golova: 'летит и щёлкает мёртвыми зубами',
});

// ---------- генерация тёмного леса ----------
function generateWorld2(seed) {
  const rnd = mulberry32(seed);
  const elevN = makeNoise(seed * 7 + 1), forestN = makeNoise(seed * 13 + 5), ravN = makeNoise(seed * 29 + 11);
  const terrain = new Uint8Array(MAP_W * MAP_H);
  const idx = (x, y) => y * MAP_W + x;

  // чаща сплошная, реки чёрные, оврагов больше
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const e = elevN(x / 26, y / 26), f = forestN(x / 18, y / 18), rv = ravN(x / 21, y / 21);
    let t = T.FOREST;
    if (e < 0.34) t = T.WATER;
    else if (e < 0.42) t = T.SWAMP; // вокруг чёрной воды — топи, в них вязнешь
    else if (Math.abs(rv - 0.5) < 0.028 && e > 0.45) t = T.RAVINE;
    else if (f < 0.34) t = T.GRASS; // редкие поляны
    terrain[idx(x, y)] = t;
  }

  const world = {
    seed, terrain, W: MAP_W, H: MAP_H,
    trees: [], props: [], buildings: [], camps: [], villages: [],
    spawn: null, castle: null, level: 2,
  };
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) ? T.WATER : terrain[idx(x, y)];
  const landOK = (x, y) => { const t = tileAt(x, y); return t !== T.WATER && t !== T.RAVINE; };
  function areaLand(cx, cy, r) {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++)
      if (x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2) return false;
    let bad = 0;
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++)
      if (!landOK(x, y)) bad++;
    return bad <= r;
  }

  let sx = MAP_W >> 1, sy = MAP_H >> 1;
  for (let tries = 0; tries < 500; tries++) {
    const x = (MAP_W >> 1) + Math.floor((rnd() - 0.5) * 30), y = (MAP_H >> 1) + Math.floor((rnd() - 0.5) * 30);
    if (areaLand(x, y, 3)) { sx = x; sy = y; break; }
  }
  for (let y = sy - 2; y <= sy + 2; y++) for (let x = sx - 2; x <= sx + 2; x++) terrain[idx(x, y)] = T.DIRT;
  world.spawn = { x: (sx + 0.5) * TILE, y: (sy + 0.5) * TILE };

  const pois = [];
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
  function carvePath(tx, ty) {
    let x = sx, y = sy, guard = 0;
    while ((x !== tx || y !== ty) && guard++ < 3000) {
      const dx = Math.sign(tx - x), dy = Math.sign(ty - y);
      if (rnd() < 0.5 && dx !== 0) x += dx; else if (dy !== 0) y += dy; else if (dx !== 0) x += dx;
      if (rnd() < 0.12) { const jx = x + (rnd() < 0.5 ? 1 : -1); if (jx > 1 && jx < MAP_W - 2) x = jx; }
      for (const [px, py] of [[x, y], [x + 1, y]]) {
        if (px < 1 || py < 1 || px >= MAP_W - 1 || py >= MAP_H - 1) continue;
        const t = terrain[idx(px, py)];
        if (t === T.WATER || t === T.SAND || t === T.SWAMP) terrain[idx(px, py)] = T.BRIDGE_W;
        else if (t === T.RAVINE) terrain[idx(px, py)] = T.BRIDGE_R;
        else if (t === T.GRASS || t === T.FOREST) terrain[idx(px, py)] = T.DIRT;
      }
    }
  }

  // --- ЯМА: провал в преисподнюю на дальней поляне ---
  const pitSpot = pickSpot(50, 66, 8, 30) || pickSpot(38, 66, 7, 20) || { x: sx + 42, y: sy };
  {
    const { x, y } = pitSpot;
    for (let yy = y - 6; yy <= y + 6; yy++) for (let xx = x - 6; xx <= x + 6; xx++) {
      const d = Math.hypot(xx - x, yy - y);
      if (xx < 1 || yy < 1 || xx >= MAP_W - 1 || yy >= MAP_H - 1) continue;
      if (d < 2.6) terrain[idx(xx, yy)] = T.RAVINE; // сам провал — не пройти
      else if (d < 6) terrain[idx(xx, yy)] = T.STONE;
    }
    world.pit = { tx: x, ty: y, x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, r: 2.6 * TILE };
    // у края — могилы тех, кто дошёл
    for (let g = 0; g < 3; g++)
      world.props.push({ type: 'grave', x: (x - 4 + g * 4 + rnd()) * TILE, y: (y + 6.6) * TILE, used: false });
    carvePath(x, y + 7);
  }

  // --- логова четырёх боссов ---
  for (const kind of ['shurale', 'lono', 'noga', 'velikan']) {
    const spot = pickSpot(24, 55, 5, 24) || pickSpot(15, 60, 4, 12);
    if (!spot) continue;
    const { x, y } = spot;
    for (let yy = y - 3; yy <= y + 3; yy++) for (let xx = x - 3; xx <= x + 3; xx++)
      if (Math.hypot(xx - x, yy - y) < 3.4 && landOK(xx, yy)) terrain[idx(xx, yy)] = T.DIRT;
    carvePath(x, y);
    world.camps.push({ kind, tx: x, ty: y, x: (x + 0.5) * TILE, y: (y + 0.5) * TILE, hostages: 0, treasure: rnd() < 0.8 });
  }

  // --- скиты лесных жителей (отшельник, колдун, монах, грибничок) ---
  world.huts = [];
  for (const npcType of ['otshelnik', 'koldun', 'monah', 'gribnik']) {
    const spot = pickSpot(12, 46, 3, 16);
    if (!spot) continue;
    const { x, y } = spot;
    for (let yy = y - 2; yy <= y + 2; yy++) for (let xx = x - 2; xx <= x + 2; xx++)
      if (landOK(xx, yy)) terrain[idx(xx, yy)] = T.DIRT;
    carvePath(x, y);
    const b = { x: (x + 0.5) * TILE, y: (y - 0.6) * TILE, w: 78, h: 62, type: 'izba', burnt: false, people: false };
    world.buildings.push(b);
    world.props.push({ type: 'campfire', x: (x + 1.6) * TILE, y: (y + 1.2) * TILE });
    world.huts.push({ npcType, x: (x + 0.5) * TILE, y: (y + 0.8) * TILE });
  }

  // --- гарантия проходимости: недостижимых карманов суши быть не должно ---
  // Волна от спавна по проходимым тайлам; зона плевка ЯМЫ считается преградой,
  // чтобы за ней не пряталось «мешков», куда героя можно зашвырнуть без выхода.
  // Всё, куда волна не дошла, обрушиваем в овраг или заливаем водой.
  {
    const pitBlockR = world.pit.r + 90;
    const blockedT = (x, y) => {
      const t = tileAt(x, y);
      if (t === T.WATER || t === T.RAVINE) return true;
      return Math.hypot((x + 0.5) * TILE - world.pit.x, (y + 0.5) * TILE - world.pit.y) < pitBlockR;
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

  // --- деревья: тёмные ели да кривые дубы, гуще обычного ---
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
    const t = terrain[idx(x, y)];
    if (t === T.SWAMP) {
      // на топях растёт клюква
      if (rnd() < 0.03)
        world.props.push({ type: 'kljukva', x: (x + 0.2 + rnd() * 0.6) * TILE, y: (y + 0.2 + rnd() * 0.6) * TILE, used: false });
      continue;
    }
    if (t !== T.GRASS && t !== T.FOREST) continue;
    const f = forestN(x / 18, y / 18);
    const dense = t === T.FOREST;
    const chance = dense ? 0.5 : (f > 0.4 ? 0.08 : 0.02);
    if (rnd() < chance) {
      const r = rnd();
      // чаща из кривых чёрных деревьев и мёртвых остовов, редкие ели
      const kind = r < 0.5 ? 'dark' : (r < 0.75 ? 'deadtree' : 'spruce');
      world.trees.push({
        x: (x + 0.15 + rnd() * 0.7) * TILE, y: (y + 0.15 + rnd() * 0.7) * TILE,
        kind, size: 0.9 + rnd() * 0.6, bend: 0, bendV: 0, phase: rnd() * 6.28, alive: true, watered: 0,
      });
      // всё завешано паутиной
      if (rnd() < 0.16)
        world.props.push({
          type: 'web', x: (x + 0.3 + rnd() * 0.4) * TILE, y: (y + 0.7) * TILE,
          s: 0.8 + rnd() * 0.9, rot: (rnd() - 0.5) * 0.8,
        });
    } else if (rnd() < 0.018) {
      const r = rnd();
      world.props.push({
        type: r < 0.24 ? 'mushroom' : r < 0.38 ? 'gnilushka' : r < 0.5 ? 'grave' : r < 0.62 ? 'stone' : r < 0.76 ? 'bush' : r < 0.9 ? 'stump' : 'bones',
        x: (x + 0.2 + rnd() * 0.6) * TILE, y: (y + 0.2 + rnd() * 0.6) * TILE, used: false,
      });
    }
  }
  world.trees.sort((a, b) => a.y - b.y);

  for (let c = 0; c < 5; c++) {
    const spot = pickSpot(16, 60, 2, 10);
    if (spot) world.props.push({ type: 'chest', x: (spot.x + 0.5) * TILE, y: (spot.y + 0.5) * TILE, used: false });
  }
  for (let c = 0; c < 3; c++) {
    const spot = pickSpot(14, 62, 2, 14);
    if (spot) world.props.push({ type: 'spring', x: (spot.x + 0.5) * TILE, y: (spot.y + 0.5) * TILE, used: false });
  }

  world.gateOpen = true; // замка нет — вся логика ворот спит
  world.kalinLockdown = false;
  world.tileAt = tileAt;
  world.passable = (px, py) => {
    const t = tileAt(Math.floor(px / TILE), Math.floor(py / TILE));
    if (t === T.WATER || t === T.RAVINE || t === T.WALL) return false;
    for (const b of world.buildings)
      if (Math.abs(px - b.x) < b.w / 2 + 8 && Math.abs(py - b.y) < b.h / 2 + 6) return false;
    return true;
  };
  world.rnd = rnd;
  return world;
}

// ---------- вход на уровень 2 ----------
let yamaRef = null, l2Waves = [], l2HeroSnap = null;

function snapshotHero() {
  return {
    level: player.level, maxHp: player.maxHp, speed: player.speed,
    dmgMul: player.dmgMul, dodge: player.dodge, smek: player.smek,
    weapon: player.weapon, xp: player.xp, xpNeed: player.xpNeed,
    wood: player.wood, forged: player.forged || 0,
    items: { ...player.items },
    pets: player.pets.filter((p) => p.hp > 0).map((p) => p.sp),
  };
}

function applyHeroSnap(s) {
  Object.assign(player, {
    level: s.level, maxHp: s.maxHp, hp: s.maxHp, speed: s.speed,
    dmgMul: s.dmgMul, dodge: s.dodge, smek: s.smek, weapon: s.weapon,
    xp: s.xp, xpNeed: s.xpNeed, wood: s.wood, forged: s.forged,
    items: { ...s.items },
  });
}

// тёмная заставка перед входом в Тёмный лес (после победного экрана 1 уровня)
function showL2Intro() {
  overlayScene('dark');
  const ov = document.getElementById('overlay');
  ov.style.display = 'flex';
  ov.querySelector('.box').innerHTML =
    '<h1>ТЁМНЫЙ ЛЕС</h1>' +
    '<h2>Русь, год 1243. Беды не кончились…</h2>' +
    '<p>Трудно жилось людям на Руси в XIII веке: одну беду одолеешь — другая уже у порога. ' +
    'Нечисть, что уцелела после Калиновой погибели, бежала за овраги — в соседний лес, ' +
    'что был Волшебному родным братом. Чёрным словом и гнилым дыханием испортила она его ' +
    'до самого корня: погасли светляки, почернели берёзы, пересохли родники — ' +
    'и опустилась на чащу ночь без рассвета.</p>' +
    '<p>В сердце той чащи отворилась <span class="goldword">ЯМА</span> — дыра в преисподнюю, ' +
    'и стерегут её сон четыре новых хозяина леса. Одолей их, изведи ЯМУ — и верни лесу свет. ' +
    'Ищи в чаще скиты лесных жителей: их свет — подмога. ' +
    'А сгинешь во тьме — восстанешь у кромки леса таким, каким вошёл.</p>' +
    '<button id="startBtn">ШАГНУТЬ ВО ТЬМУ</button>';
  document.getElementById('startBtn').onclick = () => {
    ov.style.display = 'none';
    startLevel2();
    running = true;
  };
}

function startLevel2() {
  l2HeroSnap = snapshotHero(); // погибнет — вернётся сюда таким же
  newGame2();
}

function restartLevel2() {
  newGame2();
}

function newGame2() {
  level = 2;
  world = generateWorld2((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  enemies = []; animals = []; hostages = []; wanderers = [];
  groundItems = []; projectiles = []; particles = []; floaters = [];
  pools = []; l2Waves = []; l2Falls = []; l2EventT = 16; l2Eyes = []; l2Wisps = [];
  l2Lights = []; l2Double = null; l2DoubleT = 50; l2BellT = 14; l2LightT = 8;
  chunkCache = new Map();
  gameOver = false; victory = false; kalinDead = true;
  freedHostages = 0; totalHostages = 0;
  gameTime = 0; alarmOn = false; AudioSys.alarmStop();
  kalinAlerted = false; kalinBoomT = kalinBannerT = 0;
  gateHintT = 0;
  logEl.innerHTML = '';
  metKinds = new Set();

  // герой приходит из первого уровня (или из снапшота после гибели)
  const snap = l2HeroSnap || snapshotHero();
  player.x = world.spawn.x; player.y = world.spawn.y;
  player.pets = []; player.mount = null;
  player.forced = 0; player.feared = 0; player.paralyzed = 0; player.rooted = 0;
  player.forgeReadyAt = 0; player.sinceHurt = 0; // gameTime начинается заново
  player.restedAt = -999; player.fishAt = -999; player.wordAt = 0; // и таймеры отдыха с ним
  player.bleedT = 0; player.poisonCd = 0; player.rage = 0; player.weakT = 0; player.tickled = 0;
  applyHeroSnap(snap);

  const rnd = world.rnd;
  camps = world.camps;

  // герой приходит прокачанным с первого уровня — нечисть леса растёт под стать
  // (ур. 11 даёт ×1.6 к здоровью и урону всей нечисти и боссам);
  // опыт за убийство растёт тем же множителем — иначе трудные враги не окупались
  const scale = 1 + 0.06 * Math.max(0, player.level - 1);
  world.l2Scale = scale;

  // питомцы первого уровня приходят следом за героем
  snap.pets.forEach((sp, i) => {
    if (!ANIMALS[sp]) return;
    const ang = (i / Math.max(1, snap.pets.length)) * Math.PI * 2;
    const a = mkL2Animal(sp, player.x + Math.cos(ang) * 80, player.y + Math.sin(ang) * 80, rnd);
    a.tamed = true; a.tameBonus = 1; a.homeX = player.x; a.homeY = player.y;
    animals.push(a); player.pets.push(a);
  });

  // --- боссы в логовах ---
  for (const camp of camps) {
    const bd = {
      ...L2_BOSSES[camp.kind],
      hp: Math.round(L2_BOSSES[camp.kind].hp * scale),
      dmg: Math.round(L2_BOSSES[camp.kind].dmg * scale),
      xp: Math.round(L2_BOSSES[camp.kind].xp * scale),
    };
    const boss = mkEnemy(camp.kind, camp.x, camp.y - 30, bd, true);
    boss.camp = camp;
    if (camp.kind === 'noga') boss.barOy = 112;
    if (camp.kind === 'velikan') boss.barOy = 128;
    if (camp.kind === 'lono') boss.barOy = 70;
    enemies.push(boss);
    camp.guards = [boss];
    // свита: у каждого хозяина леса — свои слуги
    const RETINUE = {
      shurale: ['spider', 'spider', 'spider'],
      lono: ['utopl', 'utopl', 'nav'],
      noga: ['chert', 'chert', 'chert'],
      velikan: ['lesnoy', 'lesnoy', 'suka'],
    };
    for (const gk of RETINUE[camp.kind] || []) {
      const gw = L2_WILD[gk];
      const g = mkEnemy(gk === 'lesnoy' ? 'bandit' : gk,
        camp.x + (rnd() - 0.5) * 180, camp.y + 40 + (rnd() - 0.5) * 120, {
          name: gw.name,
          hp: Math.round(gw.hp * scale),
          dmg: Math.round(gw.dmg * scale),
          speed: gw.speed,
          weapon: gw.weapon || null,
          xp: Math.round(gw.xp * scale),
        });
      g.camp = camp;
      if (gk === 'lesnoy') g.lure = true;
      if (gk === 'chert') g.tint = CHERT_COLORS[Math.floor(rnd() * CHERT_COLORS.length)];
      enemies.push(g);
      camp.guards.push(g);
    }
    world.props.push({ type: 'campfire', x: camp.x + 45, y: camp.y + 35 });
    world.props.push({ type: 'bones', x: camp.x - 60, y: camp.y + 30, used: false });
    if (camp.treasure) world.props.push({ type: 'chest', x: camp.x - 55, y: camp.y - 50, used: false });
  }

  // --- ЯМА (спит, пока живы четыре босса) ---
  yamaRef = mkEnemy(
    'yama',
    world.pit.x,
    world.pit.y,
    { ...L2_BOSSES.yama, hp: Math.round(L2_BOSSES.yama.hp * scale), xp: Math.round(L2_BOSSES.yama.xp * scale) },
    true,
  );
  yamaRef.invuln = true;
  yamaRef.invulnMsg = 'ЯМА СПИТ — сначала одолей четырёх хозяев леса';
  yamaRef.r = world.pit.r;
  yamaRef.barOy = 30;
  yamaRef.spawnT = 4;
  yamaRef.groanT = 5;
  enemies.push(yamaRef);

  // --- дикая нечисть ---
  const nearWater = (kind) => kind === 'croc' || kind === 'vodyanoy';
  for (const kind of Object.keys(L2_WILD)) {
    const wd = L2_WILD[kind];
    for (let i = 0; i < wd.n; i++) {
      for (let tries = 0; tries < 120; tries++) {
        const x = (2 + rnd() * (MAP_W - 4)) * TILE, y = (2 + rnd() * (MAP_H - 4)) * TILE;
        if (!world.passable(x, y)) continue;
        if (Math.hypot(x - world.spawn.x, y - world.spawn.y) < 800) continue;
        if (Math.hypot(x - world.pit.x, y - world.pit.y) < 420) continue;
        if (nearWater(kind)) {
          // крокодилы и водяные выползают из рек — ищем берег
          const tx2 = Math.floor(x / TILE), ty2 = Math.floor(y / TILE);
          let shore = false;
          for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]])
            if (world.tileAt(tx2 + ox, ty2 + oy) === T.WATER) { shore = true; break; }
          if (!shore) continue;
        }
        const e = mkEnemy(kind === 'lesnoy' ? 'bandit' : kind, x, y, {
          name: wd.name,
          hp: Math.round(wd.hp * scale),
          dmg: Math.round(wd.dmg * scale),
          speed: wd.speed,
          weapon: wd.weapon || null, xp: Math.round(wd.xp * scale),
        });
        e.wild = true;
        e.wanderT = rnd() * 4;
        if (kind === 'lesnoy') e.lure = true; // переманивает зверей
        if (kind === 'utopl') e.prefPlayer = true; // идёт именно к тебе
        if (kind === 'chert') e.tint = CHERT_COLORS[Math.floor(rnd() * CHERT_COLORS.length)];
        enemies.push(e);
        break;
      }
    }
  }

  // --- звери ---
  for (const sp of Object.keys(L2_ANIMAL_COUNTS)) {
    for (let i = 0; i < L2_ANIMAL_COUNTS[sp]; i++) {
      for (let tries = 0; tries < 60; tries++) {
        const x = (2 + rnd() * (MAP_W - 4)) * TILE, y = (2 + rnd() * (MAP_H - 4)) * TILE;
        if (!world.passable(x, y)) continue;
        if (Math.hypot(x - world.pit.x, y - world.pit.y) < 480) continue;
        animals.push(mkL2Animal(sp, x, y, rnd));
        break;
      }
    }
  }

  // --- лесные жители у скитов + пара странников ---
  for (const hut of world.huts) {
    wanderers.push({
      x: hut.x, y: hut.y, face: 1, walk: false, phase: rnd() * 6,
      wanderT: 2, dir: rnd() * 6.283, type: hut.npcType, talkIdx: 0, gifted: false,
      homeX: hut.x, homeY: hut.y,
    });
  }
  for (let i = 0; i < 2; i++) {
    for (let tries = 0; tries < 60; tries++) {
      const x = (10 + rnd() * (MAP_W - 20)) * TILE, y = (10 + rnd() * (MAP_H - 20)) * TILE;
      if (!world.passable(x, y) || Math.hypot(x - player.x, y - player.y) > 2200) continue;
      wanderers.push({ x, y, face: 1, walk: false, phase: rnd() * 6, wanderT: 2, dir: rnd() * 6.283 });
      break;
    }
  }

  // --- туман войны ---
  seen = new Uint8Array(MAP_W * MAP_H);
  fogCanvas = document.createElement('canvas');
  fogCanvas.width = MAP_W; fogCanvas.height = MAP_H;
  fogCtx = fogCanvas.getContext('2d');
  fogCtx.fillStyle = '#030308';
  fogCtx.fillRect(0, 0, MAP_W, MAP_H);
  fogFrame = document.createElement('canvas');
  fogFrameCtx = fogFrame.getContext('2d');
  mapMini = document.createElement('canvas');
  mapMini.width = MAP_W; mapMini.height = MAP_H;
  mapMiniCtx = mapMini.getContext('2d');
  mapMiniCtx.fillStyle = '#05060a';
  mapMiniCtx.fillRect(0, 0, MAP_W, MAP_H);
  updateFog(true);
  updateObjective();
  AudioSys.droneStart(); // постоянный фоновый вой тёмного леса
  document.getElementById('heroName').textContent = 'Богатырь ' + playerName;
  announce('ТЁМНЫЙ ЛЕС. Здесь Русь кончается...', '#c9a0e8');
  addLog('Одолей четырёх хозяев леса — тогда пробудится ЯМА. Изведи её.', '#c9a0e8');
  addLog('В чаще живут отшельники и колдуны — ищи их скиты, они помогут.', '#a0e8ff');
}

function mkL2Animal(sp, x, y, rnd) {
  const a = {
    sp,
    ...JSON.parse(JSON.stringify(ANIMALS[sp])),
    x, y, face: 1, walk: false, phase: rnd() * 6, wanderT: rnd() * 3,
    dir: rnd() * 6.283, tamed: false, tameBonus: 0, scared: 0, cd: 0,
    maxHp: ANIMALS[sp].hp, homeX: x, homeY: y,
  };
  // зверьё тёмного леса растёт под стать нечисти (и чуть крепче —
  // иначе соратники мёрли от пары ударов раскачанных врагов)
  const sc = world.l2Scale || 1;
  a.maxHp = a.hp = Math.round(ANIMALS[sp].hp * sc * 1.25);
  a.dmg = Math.round(ANIMALS[sp].dmg * sc);
  if (!sp.startsWith('drakon'))
    a.tame *= 0.55; // тёмный лес: зверьё пуганое, доверие даётся трудно (драконам тут дом)
  if (sp === 'deer') {
    // в тёмном лесу олени белые — как призраки
    a.name = 'Белый олень';
    a.body = '#e8e8ee'; a.head = '#e8e8ee'; a.snout = '#c9c9d4';
  }
  return a;
}

// ---------- ИИ уровня 2 ----------
// L2AI[kind](e, target, td, pd, dt) → true, если поведение полностью обработано
const L2AI = {
  yama(e, target, td, pd, dt) {
    e.walk = false;
    // голоса из глубины: чем ближе подходишь, тем громче и чаще
    e.groanT -= dt;
    if (e.groanT <= 0 && pd < 1100) {
      const near = 1 - pd / 1100; // 0 — на пределе слышимости, 1 — у края
      e.groanT = 4 + Math.random() * 5 + (1 - near) * 5;
      AudioSys.yamaVoice(0.2 + near * 0.8);
      if (pd < 500)
        toastMinor('Из ямы доносятся стоны и шёпот...', '#c9a0e8');
    }
    // изрыгает нечисть: спящая — изредка, пробуждённая — постоянно
    e.spawnT -= dt;
    const cap = e.invuln ? 2 : 5;
    if (e.spawnT <= 0 && pd < 900) {
      e.spawnT = e.invuln ? 9 + Math.random() * 6 : 3.2 + Math.random() * 2;
      const alive = enemies.filter((n) => !n.dead && n.fromYama).length;
      if (alive < cap) {
        const r = Math.random();
        const kind = r < 0.45 ? 'zombie' : r < 0.75 ? 'ruka' : 'golova';
        const sc = world.l2Scale || 1;
        const stats = kind === 'zombie'
          ? { name: 'Зелёный мертвец', hp: Math.round(60 * sc), dmg: Math.round(11 * sc), speed: 95, xp: Math.round(20 * sc) }
          : kind === 'ruka'
            ? { name: 'Отрубленная рука', hp: Math.round(25 * sc), dmg: Math.round(7 * sc), speed: 175, xp: Math.round(10 * sc) }
            : { name: 'Мёртвая голова', hp: Math.round(35 * sc), dmg: Math.round(9 * sc), speed: 160, xp: Math.round(15 * sc) };
        const ang = Math.random() * 6.283;
        const sp = mkEnemy(kind, e.x + Math.cos(ang) * (e.r + 20), e.y + Math.sin(ang) * (e.r * 0.5 + 20), stats);
        sp.fromYama = true;
        enemies.push(sp);
        burst(sp.x, sp.y, '#5e8a3d', 10, 90);
        AudioSys.zombiePull();
        if (!e.invuln) floater(e.x, e.y - 50, 'яма изрыгает нечисть!', '#8fd06a', 13);
      }
    }
    return true; // яма не ходит и не бьёт — она яма
  },
  golova(e, target, td, pd, dt) {
    // летит по кривой, щёлкая зубами
    const wob = Math.sin(gameTime * 5 + e.phase) * 30;
    const d = td || 1;
    e.x += ((target.x - e.x) / d) * e.speed * dt + Math.cos(gameTime * 3 + e.phase) * 20 * dt;
    e.y += ((target.y - 20 - e.y) / d) * e.speed * dt + wob * dt;
    e.face = target.x > e.x ? 1 : -1;
    e.walk = true;
    if (td < 40 && e.cd <= 0) {
      e.cd = 1;
      strikeTarget(target, e.dmg, e.x, e.y);
    }
    return true;
  },
  derevo(e, target, td, pd, dt) {
    if (td > 260) { e.walk = false; return true; } // стоит как обычное дерево
    e.sayT = (e.sayT || 0) - dt;
    if (e.sayT <= 0) {
      e.sayT = 3 + Math.random() * 3;
      const says = ['УХОДИ...', 'ТВОЯ КОЖА СТАНЕТ КОРОЙ', 'КОРНИ ГОЛОДНЫ', 'ОСТАНЬСЯ С НАМИ НАВЕКИ'];
      floater(e.x, e.y - 96, says[Math.floor(Math.random() * says.length)], '#8fd06a', 13);
    }
    return false; // дальше — обычное медленное преследование и удары ветвями
  },
  spider(e, target, td, pd, dt) {
    if (e.lungeT > 0) {
      e.lungeT -= dt;
      const d = td || 1;
      tryMove(e, ((target.x - e.x) / d) * e.speed * 2.6 * dt, ((target.y - e.y) / d) * e.speed * 2.6 * dt);
      e.walk = true;
      if (d < 45) {
        strikeTarget(target, e.dmg, e.x, e.y);
        if (target === player) {
          player.rooted = Math.max(player.rooted, 1.0);
          addLog('Паук оплёл ноги паутиной!', '#c9a0e8');
        }
        e.lungeT = 0;
      }
      return true;
    }
    if (e.spCd <= 0 && td < 240 && td > 55) {
      e.spCd = 5;
      e.lungeT = 0.4;
      AudioSys.snarl();
    }
    return false;
  },
  redshadow(e, target, td, pd, dt) {
    if (e.spCd <= 0 && td < 300 && td > 90) {
      // мерцнула — и уже рядом
      e.spCd = 4;
      burst(e.x, e.y - 20, '#8c1f16', 10, 80);
      const d = td || 1;
      const nx = e.x + ((target.x - e.x) / d) * Math.min(110, d - 40);
      const ny = e.y + ((target.y - e.y) / d) * Math.min(110, d - 40);
      if (world.passable(nx, ny)) { e.x = nx; e.y = ny; }
      burst(e.x, e.y - 20, '#c23b30', 12, 90);
      AudioSys.magic();
    }
    return false;
  },
  nav(e, target, td, pd, dt) {
    // белая птица мёртвых: кружит и пикирует, как стервятник
    if (e.swoopT > 0) {
      e.swoopT -= dt;
      const d = td || 1;
      e.x += ((target.x - e.x) / d) * e.speed * 2.2 * dt;
      e.y += ((target.y - e.y) / d) * e.speed * 2.2 * dt;
      e.walk = true;
      if (d < 42) {
        strikeTarget(target, e.dmg, e.x, e.y);
        if (target === player) player.feared = Math.max(player.feared, 0.6); // могильный холод
        e.swoopT = 0;
        e.fleeT = 1.4;
      }
      return true;
    }
    if (e.spCd <= 0 && td < 380) {
      e.spCd = 6;
      e.swoopT = 1.1;
      AudioSys.eagleCry();
      floater(e.x, e.y - 60, 'воет и пикирует!', '#e8e8f5', 12);
      return true;
    }
    const ca = gameTime * 0.9 + e.phase;
    const gx = target.x + Math.cos(ca) * 180, gy = target.y + Math.sin(ca) * 140;
    const d2 = Math.hypot(gx - e.x, gy - e.y) || 1;
    e.x += ((gx - e.x) / d2) * Math.min(e.speed, d2 * 2) * dt;
    e.y += ((gy - e.y) / d2) * Math.min(e.speed, d2 * 2) * dt;
    e.walk = true;
    e.face = target.x > e.x ? 1 : -1;
    return true;
  },
  bat(e, target, td, pd, dt) {
    // мечется вокруг и кусает
    const ca = gameTime * 2.2 + e.phase;
    const gx = target.x + Math.cos(ca) * 60, gy = target.y - 30 + Math.sin(ca * 1.7) * 50;
    const d2 = Math.hypot(gx - e.x, gy - e.y) || 1;
    e.x += ((gx - e.x) / d2) * Math.min(e.speed, d2 * 3) * dt;
    e.y += ((gy - e.y) / d2) * Math.min(e.speed, d2 * 3) * dt;
    e.face = target.x > e.x ? 1 : -1;
    e.walk = true;
    if (td < 45 && e.cd <= 0) {
      e.cd = 1.1;
      strikeTarget(target, e.dmg, e.x, e.y);
    }
    return true;
  },
  cherny(e, target, td, pd, dt) {
    // оставляет чёрный нефтяной след
    e.dripT = (e.dripT || 0) - dt;
    if (e.walk && e.dripT <= 0 && pools.length < 60) {
      e.dripT = 0.4;
      pools.push({ x: e.x, y: e.y + 4, r: 22, t: 12, max: 12, kind: 'oil' });
    }
    return false;
  },
  croc(e, target, td, pd, dt) {
    if (e.lungeT > 0) {
      e.lungeT -= dt;
      const d = td || 1;
      tryMove(e, ((target.x - e.x) / d) * e.speed * 3 * dt, ((target.y - e.y) / d) * e.speed * 3 * dt);
      e.walk = true;
      if (d < 50) {
        strikeTarget(target, e.dmg, e.x, e.y);
        if (target === player) player.bleedT = Math.max(player.bleedT, 3);
        e.lungeT = 0;
      }
      return true;
    }
    if (e.spCd <= 0 && td < 200 && td > 50) {
      e.spCd = 4.5;
      e.lungeT = 0.35;
      AudioSys.snarl();
      floater(e.x, e.y - 40, 'бросок!', '#8fd06a', 12);
    }
    return false;
  },
  vodyanoy(e, target, td, pd, dt) {
    // держится поодаль и швыряет тёмную воду
    if (td < 150) {
      const d = td || 1;
      e.walk = true;
      tryMove(e, ((e.x - target.x) / d) * e.speed * dt, ((e.y - target.y) / d) * e.speed * dt);
    } else e.walk = false;
    e.face = target.x > e.x ? 1 : -1;
    if (e.spCd <= 0 && td < 400 && !wallBetween(e.x, e.y - 20, target.x, target.y - 20)) {
      e.spCd = 3.8;
      e.swing = 1;
      AudioSys.splash();
      const d = td || 1;
      projectiles.push({
        x: e.x, y: e.y - 26,
        vx: ((target.x - e.x) / d) * 300, vy: ((target.y - 20 - e.y + 26) / d) * 300,
        dmg: e.dmg, life: 1.6, kind: 'magic', spin: 0,
      });
    }
    return true;
  },
  bandit(e, target, td, pd, dt) {
    if (!e.lure) return false; // обычные разбойники дерутся как раньше
    if (e.spCd <= 0) {
      // высматривает, кого из твоих зверей переманить
      let best = null, bd = 170;
      for (const pet of player.pets) {
        if (pet.hp <= 0 || pet === player.mount) continue;
        const d = Math.hypot(pet.x - e.x, pet.y - e.y);
        if (d < bd) { bd = d; best = pet; }
      }
      if (best) {
        e.spCd = 9;
        if (Math.random() < 0.5) {
          best.tamed = false;
          best.tameBonus = 0;
          // переметнулся насовсем: обратно не приручить и отныне дерётся против героя
          best.grudge = true;
          best.feral = true;
          best.angry = 6;
          const i = player.pets.indexOf(best);
          if (i >= 0) player.pets.splice(i, 1);
          announce('Разбойник свистнул — ' + best.name + ' ушёл к лихим людям и теперь дерётся против тебя!', '#ff8a7a');
          AudioSys.whistle();
        } else {
          floater(best.x, best.y - 50, best.name + ' не поддался!', '#9fd08a', 12);
        }
      }
    }
    return false;
  },
  // --- боссы ---
  shurale(e, target, td, pd, dt) {
    if (e.spCd <= 0 && pd < 85) {
      e.spCd = 6;
      e.swing = 1;
      player.paralyzed = Math.max(player.paralyzed, 1.4);
      player.tickled = 1.4;
      AudioSys.purr();
      directDamage(Math.round(14 * (world.l2Scale || 1)), '#ff9dc9', 'щекотка');
      announce('Шурале ЩЕКОЧЕТ длинными пальцами! Не вырваться!', '#ff9dc9');
    }
    return false;
  },
  lono(e, target, td, pd, dt) {
    if (e.spCd <= 0 && td < 430) {
      e.spCd = 4.2;
      l2Waves.push({ x: e.x, y: e.y - 14, r: 16, dmg: Math.round(16 * (world.l2Scale || 1)), hit: new Set() });
      AudioSys.paralyze();
      floater(e.x, e.y - 70, 'ВОЕТ!', '#c23bd6', 15);
    }
    return false;
  },
  noga(e, target, td, pd, dt) {
    if (e.spCd <= 0 && td < 170) {
      e.spCd = 5.5;
      e.swing = 1;
      AudioSys.stomp();
      shake = 15;
      addLog('БОСАЯ НОГА ТОПАЕТ — земля ходит ходуном!', '#ff9d7a');
      burst(e.x, e.y, '#6b4a1e', 22, 150);
      if (Math.hypot(player.x - e.x, player.y - e.y) < 190) hurtPlayer(e.dmg, e.x, e.y);
      for (const pet of player.pets)
        if (pet.hp > 0 && Math.hypot(pet.x - e.x, pet.y - e.y) < 190)
          hurtPet(pet, (pet.s || 1) < 1 ? 200 : e.dmg + 6); // мелких зверей затаптывает разом
    }
    return false;
  },
  velikan(e, target, td, pd, dt) {
    if (e.spCd <= 0 && td < 280) {
      e.spCd = 8;
      AudioSys.fart();
      pools.push({ x: e.x, y: e.y, r: 150, t: 6, max: 6, kind: 'fart' });
      burst(e.x, e.y - 30, '#7a9a3d', 24, 120, 20, 1.4);
      announce('Великан ИСПОРТИЛ ВОЗДУХ — зловоние валит с ног!', '#7a9a3d');
    }
    return false;
  },
};

// ---------- случайные ужасы леса: земля разверзается, с неба падает ----------
let l2EventT = 16,
  l2Falls = [],
  l2Eyes = [], // пары глаз, мигающие в чаще
  l2EyeT = 4,
  l2Wisps = [], // клочья тумана — локальными банками
  l2WispT = 0,
  l2Lights = [], // блуждающие болотные огоньки — заманивают в топь
  l2LightT = 8,
  l2Double = null, // двойник героя в тумане
  l2DoubleT = 50,
  l2BellT = 14; // колокол из-под земли у ЯМЫ

function l2Quake() {
  announce('Земля дрожит и РАЗВЕРЗАЕТСЯ под ногами!', '#ff6a4a');
  AudioSys.stomp();
  AudioSys.crack();
  shake = 16;
  const n = 3 + Math.floor(Math.random() * 3);
  let sx2 = 0, sy2 = 0, placed = 0;
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * 6.283, d = 70 + Math.random() * 230;
    const x = player.x + Math.cos(ang) * d, y = player.y + Math.sin(ang) * d;
    if (!world.passable(x, y)) continue;
    pools.push({ x, y, r: 46, t: 4.5, max: 4.5, kind: 'crack' });
    burst(x, y, '#3d3128', 16, 130);
    burst(x, y, '#ff6a30', 8, 90);
    sx2 = x; sy2 = y; placed++;
  }
  // из разлома выкарабкивается нечисть
  if (placed && Math.random() < 0.65) {
    const sc = world.l2Scale || 1;
    const e = mkEnemy('ruka', sx2, sy2, {
      name: 'Отрубленная рука', hp: Math.round(25 * sc), dmg: Math.round(7 * sc), speed: 175, xp: Math.round(10 * sc),
    });
    e.fromYama = true;
    enemies.push(e);
    AudioSys.zombiePull();
  }
}

function l2SkyFall() {
  toastMinor('С чёрного неба что-то падает...', '#c9a0e8');
  AudioSys.wind();
  const n = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    l2Falls.push({
      x: player.x + (Math.random() - 0.5) * 560,
      y: player.y + (Math.random() - 0.5) * 400,
      h: 380 + Math.random() * 200, // высота падения
      kind: Math.random() < 0.6 ? 'crow' : 'stone',
      spin: Math.random() * 6.283,
    });
  }
}

// ---------- обновление уровня 2 (зовётся из update) ----------
function l2Update(dt) {
  // пары глаз загораются в темноте на краю зрения — и гаснут, если подойти
  l2EyeT -= dt;
  if (l2EyeT <= 0 && l2Eyes.length < 4) {
    l2EyeT = 5 + Math.random() * 7;
    const ang = Math.random() * 6.283, d = 330 + Math.random() * 220;
    const x = player.x + Math.cos(ang) * d, y = player.y + Math.sin(ang) * d;
    if (world.passable(x, y))
      l2Eyes.push({ x, y, t: 4 + Math.random() * 4, blink: Math.random() * 6 });
  }
  for (let i = l2Eyes.length - 1; i >= 0; i--) {
    const ey = l2Eyes[i];
    ey.t -= dt;
    // подошёл ближе — глаза гаснут (и по спине холодок)
    if (ey.t <= 0 || Math.hypot(player.x - ey.x, player.y - ey.y) < 200) {
      if (ey.t > 0) floater(ey.x, ey.y - 30, 'глаза погасли...', '#c9a0e8', 11);
      l2Eyes.splice(i, 1);
    }
  }

  // туман держится банками над топями да у могил — не размазан по всему лесу
  l2WispT -= dt;
  if (l2WispT <= 0 && l2Wisps.length < 3) {
    l2WispT = 3;
    for (let tries = 0; tries < 30; tries++) {
      const ang = Math.random() * 6.283, d = 250 + Math.random() * 550;
      const x = player.x + Math.cos(ang) * d, y = player.y + Math.sin(ang) * d;
      const t = world.tileAt(Math.floor(x / TILE), Math.floor(y / TILE));
      if (t !== T.SWAMP && !(t === T.FOREST && Math.random() < 0.25)) continue;
      l2Wisps.push({
        x, y,
        r: 150 + Math.random() * 130,
        vx: (Math.random() - 0.5) * 9,
        vy: (Math.random() - 0.5) * 4,
        ph: Math.random() * 6.283,
        life: 0, // плавно проявляется и тает
        maxLife: 18 + Math.random() * 14,
      });
      break;
    }
  }
  for (let i = l2Wisps.length - 1; i >= 0; i--) {
    const ws = l2Wisps[i];
    ws.life += dt;
    ws.x += ws.vx * dt;
    ws.y += ws.vy * dt;
    if (ws.life > ws.maxLife || Math.hypot(ws.x - player.x, ws.y - player.y) > 1100)
      l2Wisps.splice(i, 1);
  }

  // блуждающие огоньки: манят вглубь топи и тают со смехом, если догнать
  l2LightT -= dt;
  if (l2LightT <= 0 && l2Lights.length < 2) {
    l2LightT = 9 + Math.random() * 10;
    for (let tries = 0; tries < 30; tries++) {
      const ang = Math.random() * 6.283, d = 220 + Math.random() * 320;
      const x = player.x + Math.cos(ang) * d, y = player.y + Math.sin(ang) * d;
      if (world.tileAt(Math.floor(x / TILE), Math.floor(y / TILE)) !== T.SWAMP) continue;
      l2Lights.push({ x, y, ph: Math.random() * 6.283, t: 0 });
      break;
    }
  }
  for (let i = l2Lights.length - 1; i >= 0; i--) {
    const lt = l2Lights[i];
    lt.t += dt;
    const pd2 = Math.hypot(player.x - lt.x, player.y - lt.y);
    if (pd2 < 300) {
      // отплывает от героя — заманивает глубже в трясину
      const ax = (lt.x - player.x) / (pd2 || 1), ay = (lt.y - player.y) / (pd2 || 1);
      const nx = lt.x + ax * 34 * dt, ny = lt.y + ay * 34 * dt;
      if (world.tileAt(Math.floor(nx / TILE), Math.floor(ny / TILE)) === T.SWAMP) {
        lt.x = nx; lt.y = ny;
      }
    }
    lt.x += Math.sin(gameTime * 0.8 + lt.ph) * 12 * dt;
    lt.y += Math.cos(gameTime * 0.6 + lt.ph) * 8 * dt;
    if (pd2 < 46) {
      toastMinor('Огонёк растаял... а вокруг — трясина. И будто смех вдали.', '#8ac9d6');
      AudioSys.evilLaugh();
      l2Lights.splice(i, 1);
    } else if (lt.t > 40 || pd2 > 800) l2Lights.splice(i, 1);
  }

  // двойник героя мерещится в тумане
  l2DoubleT -= dt;
  if (l2DoubleT <= 0 && !l2Double) {
    l2DoubleT = 70 + Math.random() * 60;
    const ang = Math.random() * 6.283;
    const x = player.x + Math.cos(ang) * 420, y = player.y + Math.sin(ang) * 420;
    if (world.passable(x, y)) {
      l2Double = { x, y, t: 12 };
      toastMinor('Кто-то стоит меж деревьев. Кто-то очень знакомый...', '#c9a0e8');
    }
  }
  if (l2Double) {
    l2Double.t -= dt;
    l2Double.face = player.x > l2Double.x ? 1 : -1; // всегда смотрит на тебя
    const dd = Math.hypot(player.x - l2Double.x, player.y - l2Double.y);
    if (dd < 170 || l2Double.t <= 0) {
      if (dd < 170) {
        toastMinor('Двойник растаял в тумане. По спине — холод.', '#c9a0e8');
        AudioSys.whisper();
        player.feared = Math.max(player.feared, 0.7);
      }
      burst(l2Double.x, l2Double.y - 30, '#3d3050', 10, 50, 20, 0.8);
      l2Double = null;
    }
  }

  // колокол бьёт из-под земли — чем ближе ЯМА, тем слышнее
  if (yamaRef && !yamaRef.dead) {
    l2BellT -= dt;
    const pdPit = Math.hypot(player.x - yamaRef.x, player.y - yamaRef.y);
    if (l2BellT <= 0 && pdPit < 850) {
      l2BellT = 11 + Math.random() * 9;
      AudioSys.bellUnder(0.25 + (1 - pdPit / 850) * 0.75);
      if (pdPit < 400) toastMinor('Из-под земли бьёт колокол. Кто звонит?..', '#c9a0e8');
    }
  }

  // редкие внезапные ужасы — лес живёт своей злой жизнью
  l2EventT -= dt;
  if (l2EventT <= 0) {
    l2EventT = 20 + Math.random() * 22;
    if (Math.random() < 0.5) l2Quake();
    else l2SkyFall();
  }

  // падающее с неба долетает до земли
  for (let i = l2Falls.length - 1; i >= 0; i--) {
    const f = l2Falls[i];
    f.h -= 620 * dt;
    f.spin += dt * 9;
    if (f.h > 0) continue;
    l2Falls.splice(i, 1);
    if (f.kind === 'crow') {
      burst(f.x, f.y, '#1c1620', 10, 80);
      toastMinor('Мёртвый ворон шмякнулся оземь.', '#c9a0e8');
    } else {
      burst(f.x, f.y, '#8d8d85', 12, 110);
      AudioSys.stomp();
      shake = Math.max(shake, 5);
    }
    const dmg = f.kind === 'stone' ? 16 : 8;
    if (Math.hypot(player.x - f.x, player.y - f.y) < 38)
      hurtPlayer(Math.round(dmg * (world.l2Scale || 1)), f.x, f.y);
    for (const pet of player.pets)
      if (pet.hp > 0 && Math.hypot(pet.x - f.x, pet.y - f.y) < 38)
        hurtPet(pet, dmg);
  }

  // убийственные волны Лона
  for (let i = l2Waves.length - 1; i >= 0; i--) {
    const w = l2Waves[i];
    w.r += 175 * dt;
    if (w.r > 440) { l2Waves.splice(i, 1); continue; }
    const dp = Math.hypot(player.x - w.x, player.y - 20 - w.y);
    if (Math.abs(dp - w.r) < 24 && !w.hit.has(player)) {
      w.hit.add(player);
      directDamage(w.dmg, '#c23bd6', 'вой Лона'); // от воя не увернуться
    }
    for (const pet of player.pets) {
      if (pet.hp <= 0 || w.hit.has(pet)) continue;
      if (Math.abs(Math.hypot(pet.x - w.x, pet.y - w.y) - w.r) < 24) {
        w.hit.add(pet);
        hurtPet(pet, 10);
      }
    }
  }

  // щекотка Шурале — хихиканье против воли
  if (player.tickled > 0) {
    player.tickled -= dt;
    player.giggleT = (player.giggleT || 0) - dt;
    if (player.giggleT <= 0) {
      player.giggleT = 0.35;
      floater(player.x + (Math.random() - 0.5) * 30, player.y - 70, 'ХИ-ХИ-ХИ!', '#ff9dc9', 13);
    }
  }

  // ЯМА отплёвывает тех, кто топчется у края — назад, откуда герой пришёл:
  // та дорога точно проходима, героя не зашвырнёт в западню
  if (yamaRef && !yamaRef.dead) {
    const d = Math.hypot(player.x - yamaRef.x, player.y - yamaRef.y);
    if (d < yamaRef.r + 75) {
      player.pitT = (player.pitT || 0) + dt;
      if (player.pitT > 1.4) {
        player.pitT = 0;
        let ax = (player.pitFromX ?? player.x) - player.x;
        let ay = (player.pitFromY ?? player.y) - player.y;
        let al = Math.hypot(ax, ay);
        if (al < 8) {
          // не знаем, откуда пришёл — плюём хотя бы от центра
          ax = player.x - yamaRef.x; ay = player.y - yamaRef.y;
          al = Math.hypot(ax, ay) || 1;
        }
        for (let s = 0; s < 10; s++)
          tryMove(player, (ax / al) * 24, (ay / al) * 24);
        hurtPlayer(8, yamaRef.x, yamaRef.y);
        AudioSys.stomp();
        shake = 8;
        toast('ЯМА ОТПЛЮНУЛА ТЕБЯ!', '#8fd06a');
      }
    } else {
      player.pitT = 0;
      // пока герой вне зоны плевка, помним его последнее «безопасное» место
      player.pitFromX = player.x;
      player.pitFromY = player.y;
    }
  }
}

// туман — поверх всех сущностей (зовётся из draw перед виньеткой, экранные координаты)
function l2DrawOverlay() {
  for (const ws of l2Wisps) {
    const sx2 = ws.x - camX, sy2 = ws.y - camY;
    if (sx2 < -400 || sx2 > VW + 400 || sy2 < -300 || sy2 > VH + 300) continue;
    // плавно проявляется, живёт, тает
    const fade = Math.min(1, ws.life / 5, Math.max(0, (ws.maxLife - ws.life) / 5));
    const breathe = 1 + Math.sin(gameTime * 0.45 + ws.ph) * 0.08;
    // три перекрывающихся мягких радиальных пятна — банка тумана
    for (let k = 0; k < 3; k++) {
      const ox = Math.sin(gameTime * 0.3 + ws.ph + k * 2.1) * ws.r * 0.35 + (k - 1) * ws.r * 0.45;
      const oy = Math.cos(gameTime * 0.22 + ws.ph + k * 1.7) * ws.r * 0.1;
      const rr = ws.r * breathe * (0.75 + k * 0.18);
      const g = ctx.createRadialGradient(sx2 + ox, sy2 + oy, 0, sx2 + ox, sy2 + oy, rr);
      g.addColorStop(0, 'rgba(168,178,205,' + 0.13 * fade + ')');
      g.addColorStop(0.55, 'rgba(160,170,200,' + 0.07 * fade + ')');
      g.addColorStop(1, 'rgba(160,170,200,0)');
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(sx2 + ox, sy2 + oy);
      ctx.scale(1, 0.38); // приплюснут к земле
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
  }
}

// рисуется в мировых координатах (зовётся из draw после луж)
function l2DrawWorld() {
  // блуждающие болотные огоньки — мягкое сине-зелёное свечение
  for (const lt of l2Lights) {
    const fl = 0.7 + Math.sin(gameTime * 5 + lt.ph) * 0.2 + Math.sin(gameTime * 13 + lt.ph) * 0.1;
    const hy = lt.y - 26 + Math.sin(gameTime * 1.6 + lt.ph) * 6;
    const g = ctx.createRadialGradient(lt.x, hy, 0, lt.x, hy, 26);
    g.addColorStop(0, 'rgba(160,240,230,' + 0.5 * fl + ')');
    g.addColorStop(0.3, 'rgba(110,200,210,' + 0.22 * fl + ')');
    g.addColorStop(1, 'rgba(90,180,200,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(lt.x, hy, 26, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(220,255,250,' + 0.85 * fl + ')';
    ctx.beginPath(); ctx.arc(lt.x, hy, 2.6, 0, 6.283); ctx.fill();
  }

  // двойник героя: тёмный, полупрозрачный, смотрит на тебя
  if (l2Double) {
    const a = Math.min(0.5, l2Double.t * 0.3, (12 - l2Double.t) * 1.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    humanoid(ctx, gameTime, {
      x: l2Double.x,
      y: l2Double.y,
      s: 1.05,
      face: l2Double.face || 1,
      walk: false,
      phase: 0,
      skin: '#6d7080',
      shirt: '#3a3d4a',
      pants: '#2c2438',
      boots: '#1c1420',
      hair: '#555a6d',
      beard: '#555a6d',
      belt: '#3d3444',
      headgear: 'helm',
      cloak: '#402030',
      weapon: player.weapon,
    });
    ctx.restore();
  }

  // глаза, мигающие в чаще
  for (const ey of l2Eyes) {
    const blink = Math.sin(gameTime * 2.2 + ey.blink) > -0.75 ? 1 : 0.1; // изредка моргают
    const a = Math.min(1, ey.t) * blink;
    ctx.fillStyle = 'rgba(255,190,60,' + a * 0.9 + ')';
    ctx.beginPath();
    ctx.ellipse(ey.x - 5, ey.y - 30, 2.6, 3.2, 0, 0, 6.283);
    ctx.ellipse(ey.x + 5, ey.y - 30, 2.6, 3.2, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,40,20,' + a * 0.8 + ')';
    ctx.beginPath();
    ctx.arc(ey.x - 5, ey.y - 30, 1.1, 0, 6.283);
    ctx.arc(ey.x + 5, ey.y - 30, 1.1, 0, 6.283);
    ctx.fill();
  }
  // падающее с неба: тень растёт, тушка/камень снижается
  for (const f of l2Falls) {
    const t01 = 1 - Math.min(1, f.h / 500);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.1 + t01 * 0.28) + ')';
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, 5 + t01 * 11, (5 + t01 * 11) * 0.4, 0, 0, 6.283);
    ctx.fill();
    ctx.save();
    ctx.translate(f.x, f.y - f.h);
    ctx.rotate(f.spin);
    if (f.kind === 'crow') {
      // мёртvый ворон — комок перьев, крылья враскид
      ctx.fillStyle = '#1c1620';
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 5, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-16, -6); ctx.lineTo(-7, 3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(15, -7); ctx.lineTo(7, 3); ctx.fill();
      ctx.fillStyle = '#e8b23a';
      ctx.beginPath(); ctx.moveTo(8, -1); ctx.lineTo(12, 0); ctx.lineTo(8, 1.5); ctx.fill();
    } else {
      ctx.fillStyle = '#8d8d85';
      ctx.beginPath();
      ctx.moveTo(-7, 3); ctx.lineTo(-6, -5); ctx.lineTo(0, -8); ctx.lineTo(6, -4); ctx.lineTo(7, 4); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.ellipse(-2, -3, 3, 1.6, -0.3, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  for (const w of l2Waves) {
    const a = Math.max(0, 0.65 - w.r / 600);
    ctx.strokeStyle = 'rgba(194,59,214,' + a + ')';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, w.r, w.r * 0.6, 0, 0, 6.283);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(230,150,240,' + a * 0.6 + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, w.r - 7, (w.r - 7) * 0.6, 0, 0, 6.283);
    ctx.stroke();
  }
}

// ---------- смерть врагов уровня 2 (зовётся из killEnemy; true = объявление своё) ----------
function l2OnKill(e) {
  if (e.kind === 'yama') {
    // финал: яма схлопывается с грохотом
    AudioSys.bossDie();
    AudioSys.fanfare();
    kalinBoomX = e.x; kalinBoomY = e.y;
    kalinBoomT = 1.6; kalinBoomTick = 0;
    kalinBannerT = 4.4;
    kalinBannerText = '☠ ЯМА ИЗВЕДЕНА!';
    kalinBannerSub = 'Тёмный лес выдохнул. Нечисти конец.';
    burst(e.x, e.y, '#8fd06a', 45, 260, 60, 1.3);
    burst(e.x, e.y, '#ffd76e', 30, 200, 60, 1.1);
    shake = 26;
    addLog('☠ ЯМА ИЗВЕДЕНА! Тьма расточилась.', '#8fd06a');
    // выжившая яминская нечисть валится замертво
    for (const n of enemies) if (n.fromYama && !n.dead) { n.dead = true; burst(n.x, n.y, '#5e8a3d', 8, 70); }
    return true;
  }
  if (L2_BOSSES[e.kind]) {
    AudioSys.bossDie();
    const left = enemies.filter((n) => n.isBoss && n.kind !== 'yama' && !n.dead).length;
    if (left > 0) {
      announce('☠ ' + e.name + ' повержен! Хозяев леса осталось: ' + left + '.', '#8fd06a');
    } else {
      announce('☠ ' + e.name + ' повержен! ЯМА ПРОБУДИЛАСЬ — иди и изведи её!', '#c9a0e8');
      if (yamaRef) { yamaRef.invuln = false; yamaRef.awake = true; }
      AudioSys.stomp();
      shake = 12;
    }
    shake = Math.max(shake, 9);
    return true;
  }
  return false;
}

function l2Victory() {
  if (victory) return;
  victory = true;
  running = false;
  AudioSys.droneStop();
  AudioSys.victory();
  overlayScene('light'); // тьма развеяна — лес снова светел
  showOverlay(
    'ТЬМА РАЗВЕЯНА!',
    'Слава богатырю ' + playerName + '!',
    '<p>Хозяева тёмного леса повержены, ЯМА извержена и засыпана. ' +
    'Птицы вернулись в чащу, и белый олень вывел ' + playerName +
    ' обратно к свету. Двум подвигам твоим конца-краю нет — гусляры сложат две песни.</p>' +
    '<p style="text-align:center;color:#ffd76e">Уровень ' + player.level +
    ' · соратников: ' + player.pets.length + '</p>',
    '▶ СМОТРЕТЬ ФИНАЛ',
  );
  // главная кнопка ведёт в финальный мультик; ниже — запасная «новый поход»
  const btn = document.getElementById('startBtn');
  btn.onclick = () => { location.href = 'мультик-финал.html'; };
  const again = document.createElement('button');
  again.textContent = 'НОВЫЙ ПОХОД';
  again.style.cssText = 'display:block;margin:10px auto 0;font-size:14px;padding:8px 24px;opacity:.75;';
  again.onclick = startGame;
  btn.parentNode.appendChild(again);
}

function l2Objective() {
  const bossesLeft = enemies
    ? enemies.filter((e) => e.isBoss && e.kind !== 'yama' && !e.dead).length
    : 4;
  const yamaTxt = yamaRef && yamaRef.dead
    ? '<span style="color:#8fd06a">изведена ⚔</span>'
    : yamaRef && !yamaRef.invuln
      ? '<span style="color:#c9a0e8">ПРОБУДИЛАСЬ!</span>'
      : '<span style="color:#ff8a7a">спит и стонет</span>';
  document.getElementById('objective').innerHTML =
    '<b style="color:#c9a0e8">ТЁМНЫЙ ЛЕС</b><br>Хозяева леса: ' +
    (4 - bossesLeft) + ' / 4<br>ЯМА: ' + yamaTxt +
    '<br><span style="color:#8a8a99">Скиты жителей — свет в чаще</span>';
}

// ---------- лесные жители: долгие разговоры и артефакты ----------
const L2_NPC = {
  otshelnik: {
    title: 'Отшельник',
    lines: [
      '«Тридцать лет я в этой чаще. Лес не был таким — он почернел, когда яма отворилась».',
      '«Четыре хозяина стерегут её сон: щекотун, воющая, нога да смердящий исполин».',
      '«Убьёшь всех четверых — яма проснётся. Тогда бей её у самого края, да не стой долго».',
      '«Прими оберег, витязь. Я его тридцать лет намаливал».',
    ],
    gift() {
      player.maxHp += 25;
      healPlayer(25);
      announce('🧿 Оберег отшельника: +25 к здоровью навсегда!', '#ffd76e');
    },
    after: [
      '«Оберег я тебе уже отдал, второго тридцать лет намаливать».',
      '«Иди, витязь. Молитва моя с тобой, а мне безмолвствовать пора».',
      '«Всё сказано. Теперь дела говорят, не слова».',
    ],
  },
  koldun: {
    title: 'Колдун',
    lines: [
      '«Не бойся, я из тех колдунов, что супротив нечисти. Иначе б ты уже мхом порос».',
      '«Красных теней бойся пуще прочих: мерцнула — и у горла. Бей, не мешкай».',
      '«Разбойники здешние зверей переманивают свистом. Держи своих ближе».',
      '«Вот тебе наговор на оружие — руби, и пусть искры летят».',
    ],
    gift() {
      player.dmgMul += 0.15;
      gainSmek(2, 'Колдовская наука впрок пошла.');
      announce('🔥 Наговор колдуна: сила удара +15%!', '#ffd76e');
    },
    after: [
      '«Два наговора на одно железо не кладут — треснет».',
      '«Чего пришёл? Иди бей нечисть, наговор сам не рубит».',
      '«Надоел. Кыш, а то в жабу... шучу. Или нет».',
    ],
  },
  monah: {
    title: 'Монах-пустынник',
    lines: [
      '«И в самой тёмной чаще свеча горит, коли есть кому её держать».',
      '«Утопленниц не жалей: то не бабы, то тоска их ходит. Упокой — и им легче».',
      '«Яму молитвой не завалить, я пробовал. Но тебе, витязь, сил прибавлю».',
      '«Благословляю. Иди и не оглядывайся».',
    ],
    gift() {
      player.maxHp += 15;
      player.dodge = Math.min(0.5, player.dodge + 0.05);
      healPlayer(999);
      announce('✝ Благословение монаха: +15 здоровья, +5% увёртливости!', '#ffd76e');
    },
    after: [
      '«Благословение не мёд, дважды не мажут. Ступай с Богом».',
      'Монах молча перекрестил тебя и вернулся к молитве.',
      '«Раны душевные лечи делом, телесные — у родника».',
    ],
  },
  gribnik: {
    title: 'Старичок-грибничок',
    lines: [
      '«Грибочки, грибочки... В тёмном лесу и грибы тёмные, а я светлые ищу».',
      '«Ты Босую Ногу видал? Я ей однажды пятку щекотнул. Бежал три дня».',
      '«Возьми-ка грибков моих, беленьких. От них сила и ясность в голове».',
    ],
    gift() {
      player.items.mushroom += 3;
      player.items.berries += 2;
      announce('🍄 Гостинец грибничка: 3 гриба и ягоды в котомку!', '#ffd76e');
    },
    after: [
      '«Всё роздал, милок. Новые грибочки за ночь не растут».',
      '«Сам-то собирай! Вон гнилушки светятся — бери, нечисть пугать».',
      '«Ты ешь-то их не разом, грибочки-то мои...»',
    ],
  },
};

function l2WandererMenu(wn, cx, cy) {
  const npc = L2_NPC[wn.type];
  openMenu(
    cx, cy, npc.title,
    [
      {
        label: '💬 Поговорить',
        fn: () => {
          if (wn.gifted) {
            // подарок отдан — дальше вежливо отнекивается, каждый раз по-своему
            const aft = npc.after[wn.afterIdx % npc.after.length];
            wn.afterIdx = (wn.afterIdx || 0) + 1;
            announce(npc.title + ': ' + aft, '#a0e8ff');
            return;
          }
          const line = npc.lines[Math.min(wn.talkIdx, npc.lines.length - 1)];
          announce(npc.title + ': ' + line, '#a0e8ff');
          wn.talkIdx++;
          if (wn.talkIdx >= npc.lines.length) {
            wn.gifted = true;
            wn.afterIdx = 0;
            AudioSys.pickup();
            npc.gift();
          } else if (wn.talkIdx === 1) {
            gainSmek(1, 'Разговор по душам — уму прибыток.');
          }
        },
      },
      {
        label: '🙇 Поклониться',
        fn: () => {
          addLog(npc.title + ' кланяется в ответ. Добро помнится.', '#cbb87f');
          if (!wn.bowed) {
            wn.bowed = true;
            gainXP(3);
          }
        },
      },
    ],
    wn,
  );
}

function l2DrawWanderer(w) {
  const t = gameTime;
  const o = { x: w.x, y: w.y, face: w.face, walk: w.walk, phase: w.phase, s: 0.95 };
  switch (w.type) {
    case 'otshelnik':
      humanoid(ctx, t, { ...o, skin: '#d8b48f', shirt: '#8a8a80', pants: '#6d6d64', hair: '#d8d8d0', beard: '#d8d8d0', weapon: 'staff' });
      break;
    case 'koldun':
      humanoid(ctx, t, { ...o, skin: '#c9b49a', shirt: '#3d2c5e', pants: '#2c2044', hair: '#4a4a55', beard: '#4a4a55', weapon: 'staff', headgear: 'hood', cloak: '#3d2c5e' });
      break;
    case 'monah':
      humanoid(ctx, t, { ...o, skin: '#d8b48f', shirt: '#2b2b28', pants: '#1c1c1a', beard: '#8a8a80', headgear: 'hood', cloak: '#2b2b28' });
      break;
    case 'gribnik':
      humanoid(ctx, t, { ...o, s: 0.78, skin: '#e0c0a0', shirt: '#6d5a3a', pants: '#4a3e28', hair: '#e8e8e0', beard: '#e8e8e0' });
      // лукошко с грибами
      ctx.fillStyle = '#8a6535';
      ctx.beginPath(); ctx.ellipse(w.x + 14 * w.face, w.y - 10, 7, 4, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#d84a3a';
      ctx.beginPath(); ctx.arc(w.x + 12 * w.face, w.y - 13, 2.2, 0, 6.283); ctx.fill();
      break;
  }
}

// ---------- отрисовка врагов уровня 2 ----------
// L2DRAW[kind](e, common, t) — только новые виды; старые рисует drawEnemy
const L2DRAW = {
  derevo(e, o, t) {
    const s = 1.15;
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 0, 16);
    if (e.face < 0) ctx.scale(-1, 1);
    ctx.scale(s, s);
    const sway = Math.sin(t * 1.6 + e.phase) * 2;
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(10,8,4,0.7)';
    // корни-ноги шевелятся
    ctx.strokeStyle = '#3d2c14'; ctx.lineWidth = 4;
    for (const dx of [-8, 0, 8]) {
      ctx.beginPath(); ctx.moveTo(dx, -6);
      ctx.quadraticCurveTo(dx * 1.6, -2, dx * 1.8 + (e.walk ? Math.sin(t * 8 + dx) * 3 : 0), 1);
      ctx.stroke();
    }
    // ствол
    ctx.fillStyle = e.hurtT ? '#6b4a2e' : '#4a3418';
    ctx.beginPath();
    ctx.moveTo(-11, -4); ctx.quadraticCurveTo(-13 + sway, -40, -8 + sway, -62);
    ctx.lineTo(8 + sway, -62); ctx.quadraticCurveTo(13 + sway, -40, 11, -4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // ветви-руки тянутся
    ctx.strokeStyle = '#4a3418'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(8 + sway, -48);
    ctx.quadraticCurveTo(26 + sway, -52 + Math.sin(t * 3) * 4, 34 + sway, -34);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8 + sway, -50);
    ctx.quadraticCurveTo(-24 + sway, -58 + Math.cos(t * 2.6) * 4, -32 + sway, -40);
    ctx.stroke();
    // крона чёрная
    ctx.fillStyle = '#1c2c14';
    ctx.beginPath(); ctx.ellipse(sway, -72, 20, 13, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // УЖАСНАЯ ГРИМАСА: глаза-дупла и кривой рот
    ctx.fillStyle = '#0a0805';
    ctx.beginPath();
    ctx.ellipse(-4 + sway, -50, 3.4, 4.5, 0.2, 0, 6.283);
    ctx.ellipse(5 + sway, -51, 3.4, 4.5, -0.2, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = '#e8e14a';
    ctx.beginPath();
    ctx.arc(-4 + sway, -49, 1.2, 0, 6.283); ctx.arc(5 + sway, -50, 1.2, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = '#0a0805';
    ctx.beginPath();
    ctx.moveTo(-6 + sway, -38);
    for (let i = 0; i <= 6; i++) ctx.lineTo(-6 + i * 2 + sway, -38 + (i % 2 ? 4 : 0) + Math.sin(t * 4) * 1);
    ctx.lineTo(6 + sway, -34); ctx.lineTo(-6 + sway, -34);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  spider(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 0, 14);
    if (e.face < 0) ctx.scale(-1, 1);
    const w = e.walk ? Math.sin(t * 14 + e.phase) : Math.sin(t * 2) * 0.3;
    ctx.strokeStyle = '#1c1c18'; ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) {
      const lx = -6 + i * 4, ph = w * (i % 2 ? 1 : -1);
      ctx.beginPath(); ctx.moveTo(lx, -12);
      ctx.quadraticCurveTo(lx - 12, -18 + ph * 3, lx - 16, -2 + ph * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx + 2, -12);
      ctx.quadraticCurveTo(lx + 14, -18 - ph * 3, lx + 18, -2 - ph * 2); ctx.stroke();
    }
    ctx.fillStyle = e.hurtT ? '#4a3a3a' : '#26221e';
    ctx.beginPath(); ctx.ellipse(-4, -14, 11, 8, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -12, 6, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#c23b30';
    for (const [ex, ey] of [[6, -15], [10, -15], [7.5, -11], [11, -11]]) {
      ctx.beginPath(); ctx.arc(ex, ey, 1.1, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  },
  redshadow(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y);
    ctx.globalAlpha = 0.45 + Math.abs(Math.sin(t * 7 + e.phase)) * 0.4; // мерцает
    if (e.face < 0) ctx.scale(-1, 1);
    const sway = Math.sin(t * 4 + e.phase) * 3;
    // тощий вытянутый силуэт
    ctx.fillStyle = e.hurtT ? '#d84a3a' : '#8c1f16';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-7 + sway, -40, -3 + sway, -74);
    ctx.quadraticCurveTo(0 + sway, -82, 3 + sway, -74);
    ctx.quadraticCurveTo(7 + sway, -40, 5, 0);
    ctx.closePath(); ctx.fill();
    // длинные руки-лезвия
    ctx.strokeStyle = '#8c1f16'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(2 + sway, -56);
    ctx.quadraticCurveTo(16 + sway, -48 + Math.sin(t * 6) * 6, 24 + sway, -30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2 + sway, -56);
    ctx.quadraticCurveTo(-14 + sway, -46, -20 + sway, -28); ctx.stroke();
    // белые глазки-точки
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffe8e0';
    ctx.beginPath();
    ctx.arc(-1 + sway, -72, 1.3, 0, 6.283); ctx.arc(3 + sway, -72, 1.3, 0, 6.283);
    ctx.fill();
    ctx.restore();
  },
  nav(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 6, 12);
    if (e.face < 0) ctx.scale(-1, 1);
    ctx.globalAlpha = 0.55; // полупрозрачная
    const fl = Math.sin(t * (e.swoopT > 0 ? 18 : 6) + e.phase);
    const hover = e.swoopT > 0 ? 0 : Math.sin(t * 2 + e.phase) * 4;
    ctx.translate(0, -30 + hover);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(200,200,220,0.8)';
    // рваные белые крылья
    ctx.fillStyle = '#e8e8f2';
    for (const dir of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(dir * 3, -4);
      ctx.quadraticCurveTo(dir * 17, -16 - fl * 10, dir * 32, -8 - fl * 13);
      ctx.lineTo(dir * 26, -4 - fl * 8);
      ctx.lineTo(dir * 22, -8 - fl * 6);
      ctx.lineTo(dir * 14, -2 - fl * 2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#f0f0f8';
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // голова-черепок
    ctx.fillStyle = '#f8f8ff';
    ctx.beginPath(); ctx.arc(8, -5, 4.5, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#14100a';
    ctx.beginPath(); ctx.arc(7, -6, 1.3, 0, 6.283); ctx.arc(10.5, -6, 1.3, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -3); ctx.lineTo(16, -2); ctx.lineTo(12, -1); ctx.fill();
    ctx.restore();
  },
  utopl(e, o, t) {
    humanoid(ctx, t, {
      ...o,
      s: 1.0,
      skin: '#a8c9b0',
      shirt: e.hurtT ? '#8a9a8a' : '#5e6d60',
      dress: '#4a5850',
      pants: '#3d4a40',
      barefoot: true,
      hair: '#1c2820',
      armsForward: true, // руки вытянуты к тебе
      drawFace: (c, hs) => {
        c.fillStyle = '#0a0f0a';
        c.beginPath(); c.ellipse(3 * hs, -8 * hs, 2, 2.6, 0, 0, 6.283); c.ellipse(7 * hs, -8 * hs, 2, 2.6, 0, 0, 6.283); c.fill();
        c.strokeStyle = '#2c3a2e'; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(2 * hs, -2 * hs); c.lineTo(8.5 * hs, -2 * hs); c.stroke(); // застывший рот
      },
    });
    // капает вода
    if (Math.sin(t * 3 + e.phase) > 0.7) {
      ctx.fillStyle = 'rgba(120,179,214,0.6)';
      ctx.beginPath(); ctx.arc(e.x + 6, e.y - 20 + (t * 40 % 20), 1.6, 0, 6.283); ctx.fill();
    }
  },
  cherny(e, o, t) {
    // существо из нефти: чёрный лоснящийся блоб-человек
    humanoid(ctx, t, {
      ...o,
      s: 1.1,
      skin: '#0c0c10',
      shirt: e.hurtT ? '#2c2c34' : '#0c0c10',
      pants: '#0c0c10',
      barefoot: true,
      headS: 1.05,
      drawFace: (c, hs) => {
        c.fillStyle = '#e8e8f0';
        c.beginPath(); c.arc(3.5 * hs, -8 * hs, 1.4, 0, 6.283); c.arc(7 * hs, -8 * hs, 1.4, 0, 6.283); c.fill();
      },
    });
    // нефтяной глянец
    ctx.fillStyle = 'rgba(120,120,180,0.25)';
    ctx.beginPath();
    ctx.ellipse(e.x - 3, e.y - 44, 4, 8, 0.4, 0, 6.283);
    ctx.fill();
    // капли грязи
    ctx.fillStyle = '#0c0c10';
    ctx.beginPath();
    ctx.arc(e.x - 6, e.y - 10 + Math.sin(t * 5 + e.phase) * 3, 2, 0, 6.283);
    ctx.fill();
  },
  bat(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y - 34 + Math.sin(t * 3 + e.phase) * 5);
    shadow(ctx, 0, 36, 8);
    if (e.face < 0) ctx.scale(-1, 1);
    const fl = Math.sin(t * 16 + e.phase);
    ctx.fillStyle = e.hurtT ? '#4a3a44' : '#26202a';
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    for (const dir of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(dir * 2, 0);
      ctx.quadraticCurveTo(dir * 10, -8 - fl * 6, dir * 18, -2 - fl * 8);
      ctx.lineTo(dir * 13, 2 - fl * 4);
      ctx.lineTo(dir * 8, 0);
      ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 6, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#26202a';
    ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(-4, -10); ctx.lineTo(-1, -6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(3, -5); ctx.lineTo(4, -10); ctx.lineTo(1, -6); ctx.fill();
    ctx.fillStyle = '#e84a3a';
    ctx.beginPath(); ctx.arc(-1.5, -3, 0.9, 0, 6.283); ctx.arc(1.5, -3, 0.9, 0, 6.283); ctx.fill();
    ctx.restore();
  },
  croc(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 0, 26, 8);
    if (e.face < 0) ctx.scale(-1, 1);
    const w = e.walk ? Math.sin(t * 8 + e.phase) : 0;
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(5,15,5,0.7)';
    // лапы
    ctx.fillStyle = '#3d5c30';
    ctx.fillRect(-18 + w * 2, -6, 5, 6); ctx.fillRect(-4 - w * 2, -6, 5, 6);
    ctx.fillRect(8 + w * 2, -6, 5, 6);
    // длинное тело
    ctx.fillStyle = e.hurtT ? '#6d8a50' : '#4a6d3a';
    ctx.beginPath(); ctx.ellipse(-4, -10, 24, 7.5, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // гребень
    ctx.fillStyle = '#3d5c30';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(-18 + i * 7, -16);
      ctx.lineTo(-15 + i * 7, -21); ctx.lineTo(-12 + i * 7, -16); ctx.fill();
    }
    // хвост
    ctx.strokeStyle = '#4a6d3a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-26, -10);
    ctx.quadraticCurveTo(-38, -8 + Math.sin(t * 4) * 4, -46, -12); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(5,15,5,0.7)';
    // пасть-капкан
    const jaw = e.lungeT > 0 ? 5 : Math.max(0, Math.sin(t * 1.5 + e.phase)) * 2;
    ctx.fillStyle = '#4a6d3a';
    ctx.beginPath(); ctx.ellipse(24, -13 - jaw * 0.6, 12, 3.4, -jaw * 0.05, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(24, -7 + jaw * 0.6, 12, 3, jaw * 0.05, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8e4d0';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(16 + i * 5, -11 - jaw * 0.5);
      ctx.lineTo(17.5 + i * 5, -8); ctx.lineTo(19 + i * 5, -11 - jaw * 0.5); ctx.fill();
    }
    ctx.fillStyle = '#e8e14a';
    ctx.beginPath(); ctx.arc(16, -17 - jaw * 0.6, 1.6, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a';
    ctx.beginPath(); ctx.arc(16, -17 - jaw * 0.6, 0.7, 0, 6.283); ctx.fill();
    ctx.restore();
  },
  vodyanoy(e, o, t) {
    humanoid(ctx, t, {
      ...o,
      s: 1.15,
      skin: '#5e8a70',
      shirt: e.hurtT ? '#5e7a6a' : '#3d5c50',
      pants: '#2c443a',
      barefoot: true,
      belly: true,
      bellyC: '#6d9a80',
      hair: '#2c4434',
      beard: '#2c4434',
      drawFace: (c, hs) => {
        c.fillStyle = '#e8f04a';
        c.beginPath(); c.arc(3 * hs, -8 * hs, 1.7, 0, 6.283); c.arc(7 * hs, -8 * hs, 1.7, 0, 6.283); c.fill();
        c.fillStyle = '#14100a';
        c.beginPath(); c.arc(3 * hs, -8 * hs, 0.7, 0, 6.283); c.arc(7 * hs, -8 * hs, 0.7, 0, 6.283); c.fill();
        c.strokeStyle = '#2c4434'; c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(2 * hs, -3 * hs); c.quadraticCurveTo(5 * hs, -1.5 * hs, 8 * hs, -3 * hs); c.stroke();
      },
    });
    // тина капает
    ctx.strokeStyle = 'rgba(70,110,80,0.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(e.x - 8, e.y - 24);
    ctx.quadraticCurveTo(e.x - 9, e.y - 14, e.x - 8, e.y - 6 + Math.sin(t * 3) * 2); ctx.stroke();
  },
  zombie(e, o, t) {
    humanoid(ctx, t, {
      ...o,
      s: 0.95,
      skin: '#7a9a5e',
      shirt: e.hurtT ? '#8a9a6a' : '#4a5540',
      pants: '#3a4232',
      barefoot: true,
      armsForward: true,
      drawFace: (c, hs) => {
        c.fillStyle = '#e8e8d0';
        c.beginPath(); c.arc(3 * hs, -8 * hs, 1.8, 0, 6.283); c.fill(); // один глаз вытек
        c.fillStyle = '#14100a';
        c.beginPath(); c.arc(3 * hs, -8 * hs, 0.7, 0, 6.283); c.fill();
        c.fillStyle = '#3a4232';
        c.beginPath(); c.ellipse(7 * hs, -8 * hs, 1.8, 2.2, 0, 0, 6.283); c.fill();
        c.fillStyle = '#e8e8d0'; c.fillRect(2 * hs, -3.5 * hs, 6 * hs, 1.8); // зубы
      },
    });
  },
  ruka(e, o, t) {
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 0, 9);
    if (e.face < 0) ctx.scale(-1, 1);
    const w = Math.sin(t * 16 + e.phase);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(40,20,10,0.7)';
    // обрубок с костью
    ctx.fillStyle = '#c9927a';
    ctx.beginPath(); ctx.ellipse(-8, -6, 7, 5, 0.2, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8c1f16';
    ctx.beginPath(); ctx.ellipse(-13, -7, 3, 3.4, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(-15, -8.5, 3.5, 2.6);
    // ладонь
    ctx.fillStyle = e.hurtT ? '#e0a88a' : '#c9927a';
    ctx.beginPath(); ctx.ellipse(2, -6, 7, 5.5, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // пальцы перебирают
    ctx.strokeStyle = '#c9927a'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const fx = 7 + i * 0.5, ph = w * (i % 2 ? 1 : -1);
      ctx.beginPath(); ctx.moveTo(fx, -8 + i * 1.6);
      ctx.quadraticCurveTo(fx + 6, -9 + i * 1.6 + ph * 2, fx + 9, -4 + i * 1.2 + ph); ctx.stroke();
    }
    ctx.restore();
  },
  shurale(e, o, t) {
    // лесной дух: рог, груди до пола, сверхдлинные пальцы
    humanoid(ctx, t, {
      ...o,
      s: 1.3,
      skin: '#a58a5e',
      shirt: e.hurtT ? '#b09a70' : '#8a744e',
      pants: '#6d5a3a',
      barefoot: true,
      hair: '#3d2c14',
      headS: 1.05,
      drawFace: (c, hs, tt) => {
        c.fillStyle = '#e8e14a';
        c.beginPath(); c.arc(3 * hs, -8.5 * hs, 1.8, 0, 6.283); c.arc(7 * hs, -8.5 * hs, 1.8, 0, 6.283); c.fill();
        c.fillStyle = '#14100a';
        c.beginPath(); c.arc(3 * hs, -8.5 * hs, 0.8, 0, 6.283); c.arc(7 * hs, -8.5 * hs, 0.8, 0, 6.283); c.fill();
        // рог во лбу
        c.fillStyle = '#d8c9a0';
        c.beginPath(); c.moveTo(3 * hs, -14 * hs); c.quadraticCurveTo(4 * hs, -22 * hs, 7 * hs, -19 * hs); c.lineTo(6 * hs, -13.5 * hs); c.fill();
        c.strokeStyle = '#3d2c14'; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(1 * hs, -3.5 * hs); c.quadraticCurveTo(5 * hs, -0.5 * hs + Math.sin(tt * 8) * 0.8, 9 * hs, -4 * hs); c.stroke(); // хихикающий рот
      },
    });
    const sway = Math.sin(t * 2.4 + e.phase) * 2;
    // огромные груди, висящие до земли
    ctx.fillStyle = '#a58a5e';
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(30,20,8,0.6)';
    for (const dx of [-7, 7]) {
      ctx.beginPath();
      ctx.ellipse(e.x + dx * 1.3, e.y - 22 + sway, 7, 19, dx > 0 ? -0.08 : 0.08, 0, 6.283);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7a6244';
      ctx.beginPath(); ctx.arc(e.x + dx * 1.3, e.y - 6 + sway, 2, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#a58a5e';
    }
    // сверхдлинные тонкие пальцы-щекотуны
    ctx.strokeStyle = '#a58a5e'; ctx.lineWidth = 2;
    const reach = e.swing > 0 ? 1 : 0;
    for (let i = 0; i < 5; i++) {
      const fy = -40 - i * 2, wig = Math.sin(t * 10 + i) * (3 + reach * 4);
      ctx.beginPath();
      ctx.moveTo(e.x + 14 * e.face, e.y + fy * 0.9);
      ctx.quadraticCurveTo(e.x + (30 + reach * 12) * e.face, e.y + fy + wig, e.x + (44 + reach * 18) * e.face, e.y + fy + 12 + wig);
      ctx.stroke();
    }
  },
  lono(e, o, t) {
    // розовое нечто на ножках, покрытое тиной
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 0, 18);
    if (e.face < 0) ctx.scale(-1, 1);
    const w = e.walk ? Math.sin(t * 10 + e.phase) : 0;
    const pulse = 1 + Math.sin(t * 3.2 + e.phase) * 0.06;
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(60,15,30,0.65)';
    // ножки
    ctx.fillStyle = '#c98a94';
    ctx.save(); ctx.translate(-7, -12); ctx.rotate(w * 0.25); ctx.fillRect(-3, 0, 6, 13); ctx.restore();
    ctx.save(); ctx.translate(7, -12); ctx.rotate(-w * 0.25); ctx.fillRect(-3, 0, 6, 13); ctx.restore();
    // туловище-овал
    ctx.fillStyle = e.hurtT ? '#e89aac' : '#d6798e';
    ctx.beginPath(); ctx.ellipse(0, -34, 16 * pulse, 24 * pulse, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // складка
    ctx.fillStyle = '#a84860';
    ctx.beginPath(); ctx.ellipse(0, -34, 5.5 * pulse, 17 * pulse, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#7a2c40';
    ctx.beginPath(); ctx.ellipse(0, -34, 2 * pulse, 12 * pulse, 0, 0, 6.283); ctx.fill();
    // тина свисает
    ctx.strokeStyle = '#46662c'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 6, -52 + Math.abs(i) * 2);
      ctx.quadraticCurveTo(i * 7, -40, i * 7.5, -28 + Math.sin(t * 3 + i) * 3);
      ctx.stroke();
    }
    ctx.restore();
  },
  noga(e, o, t) {
    // босая нога размером с дом, обрубок с мясом и костью
    ctx.save(); ctx.translate(e.x, e.y);
    shadow(ctx, 0, 2, 46, 13);
    if (e.face < 0) ctx.scale(-1, 1);
    const hop = e.walk ? Math.abs(Math.sin(t * 5 + e.phase)) * 10 : 0;
    ctx.translate(0, -hop);
    ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(40,25,10,0.7)';
    // сама нога-колонна, грязная
    ctx.fillStyle = e.hurtT ? '#d6a888' : '#c9927a';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.quadraticCurveTo(-26, -50, -20, -96);
    ctx.lineTo(24, -96);
    ctx.quadraticCurveTo(30, -50, 34, -14);
    ctx.quadraticCurveTo(44, -12, 48, -6);
    ctx.quadraticCurveTo(48, 0, 40, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // пальцы: большой впереди, остальные убывают по дуге, каждый с грязным ногтем
    for (let i = 0; i < 5; i++) {
      const tx = 45 - i * 6.8,
        ty = -3 - Math.sin(i * 0.55) * 3,
        tr = 6.8 - i * 1.05;
      ctx.fillStyle = e.hurtT ? '#d6a888' : '#c9927a';
      ctx.beginPath();
      ctx.ellipse(tx, ty, tr, tr * 0.85, 0, 0, 6.283);
      ctx.fill(); ctx.stroke();
      // перетяжка у основания пальца
      ctx.strokeStyle = 'rgba(90,60,40,0.45)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(tx - tr * 0.9, ty, tr * 0.7, -0.9, 0.9); ctx.stroke();
      ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(40,25,10,0.7)';
      // жёлтый обломанный ноготь с грязью под ним
      ctx.fillStyle = '#b0a476';
      ctx.beginPath();
      ctx.moveTo(tx + tr * 0.2, ty - tr * 0.55);
      ctx.lineTo(tx + tr * 0.95, ty - tr * 0.35);
      ctx.lineTo(tx + tr * 1.0, ty + tr * 0.15);
      ctx.lineTo(tx + tr * 0.25, ty + tr * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(60,45,25,0.75)';
      ctx.beginPath();
      ctx.ellipse(tx + tr * 0.95, ty - tr * 0.1, tr * 0.18, tr * 0.3, 0, 0, 6.283);
      ctx.fill();
    }
    // грязь
    ctx.fillStyle = 'rgba(90,70,40,0.55)';
    ctx.beginPath(); ctx.ellipse(6, -6, 26, 8, 0.1, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-8, -40, 9, 14, 0.3, 0, 6.283); ctx.fill();
    // верх-обрубок: рваное мясо и обломок кости
    ctx.fillStyle = '#8c1f16';
    ctx.beginPath();
    ctx.moveTo(-20, -96);
    for (let i = 0; i <= 8; i++) ctx.lineTo(-20 + i * 5.5, -96 - (i % 2 ? 9 + Math.sin(t * 2 + i) * 2 : 2));
    ctx.lineTo(24, -96);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b3271d';
    for (const [mx, my] of [[-8, -101], [8, -103], [18, -99]]) {
      ctx.beginPath(); ctx.ellipse(mx, my, 4.5, 3, 0.2, 0, 6.283); ctx.fill();
    }
    ctx.fillStyle = '#efe6cf'; // обломок кости
    ctx.fillRect(-2, -117, 8, 20);
    ctx.beginPath();
    ctx.moveTo(-2, -117); ctx.lineTo(0, -122); ctx.lineTo(4, -118); ctx.lineTo(6, -123); ctx.lineTo(6, -117);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  velikan(e, o, t) {
    humanoid(ctx, t, {
      ...o,
      s: 2.3,
      skin: '#c9a26a',
      shirt: e.hurtT ? '#8a6a4a' : '#5e4a33',
      pants: '#3d3128',
      belly: true,
      bellyC: '#d6b088',
      hairyBelly: true,
      hair: '#2b1d0c',
      beard: '#2b1d0c',
      headS: 0.95,
      weapon: 'bigclub',
    });
    // зелёное марево зловония вокруг
    ctx.fillStyle = 'rgba(122,154,61,' + (0.12 + Math.sin(t * 2 + e.phase) * 0.05) + ')';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y - 40, 55, 62, 0, 0, 6.283);
    ctx.fill();
  },
  yama(e, o, t) {
    // огромная яма: чёрный провал, из которого тянутся руки
    ctx.save(); ctx.translate(e.x, e.y);
    const r = e.r;
    // выброшенная земля по краям
    ctx.fillStyle = '#2c2418';
    ctx.beginPath(); ctx.ellipse(0, 0, r + 26, (r + 26) * 0.55, 0, 0, 6.283); ctx.fill();
    // сам провал
    const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.75, '#0a0805');
    grad.addColorStop(1, '#1c140a');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.55, 0, 0, 6.283); ctx.fill();
    // зелёное свечение пробуждённой ямы
    if (e.awake) {
      ctx.fillStyle = 'rgba(90,140,60,' + (0.1 + Math.sin(t * 2.6) * 0.06) + ')';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.44, 0, 0, 6.283); ctx.fill();
    }
    // кости по краю
    ctx.fillStyle = '#d8ccb0';
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + 0.4;
      const bx = Math.cos(a) * (r + 12), by = Math.sin(a) * (r + 12) * 0.55;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(a);
      ctx.fillRect(-5, -1.4, 10, 2.8);
      ctx.beginPath(); ctx.arc(-5, 0, 2, 0, 6.283); ctx.arc(5, 0, 2, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    // зелёные руки тянутся из глубины
    for (let i = 0; i < 4; i++) {
      const ph = t * 1.4 + i * 1.7;
      const up = Math.max(0, Math.sin(ph)) * 22;
      if (up < 2) continue;
      const hx = Math.cos(i * 1.6 + 0.8) * r * 0.55;
      const hy = Math.sin(i * 1.6 + 0.8) * r * 0.3;
      ctx.strokeStyle = '#5e8a3d'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(hx, hy + 8); ctx.lineTo(hx, hy + 8 - up); ctx.stroke();
      ctx.fillStyle = '#5e8a3d';
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath(); ctx.moveTo(hx, hy + 8 - up);
        ctx.lineTo(hx + f * 4, hy + 2 - up - 5); ctx.lineTo(hx + f * 1.5, hy + 8 - up + 1);
        ctx.fill();
      }
    }
    ctx.restore();
  },
};

// ---------- отрисовка новых зверей (gbat, tvar) ----------
const L2ANIMDRAW = {
  gbat(o, t) {
    ctx.save(); ctx.translate(o.x, o.y - 30 + Math.sin(t * 2.4 + o.phase) * 5);
    shadow(ctx, 0, 32, 12 * o.s);
    if (o.face < 0) ctx.scale(-1, 1);
    ctx.scale(o.s, o.s);
    const fl = Math.sin(t * 12 + o.phase);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(10,5,15,0.7)';
    ctx.fillStyle = '#3d3444';
    for (const dir of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(dir * 3, -2);
      ctx.quadraticCurveTo(dir * 16, -14 - fl * 8, dir * 30, -4 - fl * 12);
      ctx.lineTo(dir * 22, 2 - fl * 6);
      ctx.lineTo(dir * 12, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#4a4054';
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 10, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    // большие уши
    ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(-7, -18); ctx.lineTo(-1, -10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(7, -18); ctx.lineTo(1, -10); ctx.fill();
    ctx.fillStyle = '#e8b23a';
    ctx.beginPath(); ctx.arc(-2, -4, 1.4, 0, 6.283); ctx.arc(2, -4, 1.4, 0, 6.283); ctx.fill();
    // ультразвук — дуги от морды
    if (Math.sin(t * 4 + o.phase) > 0.5) {
      ctx.strokeStyle = 'rgba(200,180,240,0.4)'; ctx.lineWidth = 1.4;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath(); ctx.arc(0, 4, 8 * i, 0.6, 2.5); ctx.stroke();
      }
    }
    ctx.restore();
  },
  tvar(o, t) {
    // ТВАРЬ: бесформенная туша, много глаз, щупальца-ноги
    ctx.save(); ctx.translate(o.x, o.y);
    shadow(ctx, 0, 0, 15 * o.s);
    if (o.face < 0) ctx.scale(-1, 1);
    ctx.scale(o.s, o.s);
    const pulse = Math.sin(t * 2.8 + o.phase) * 2;
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(20,10,20,0.7)';
    // щупальца-ноги
    ctx.strokeStyle = '#4a2c44'; ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const lx = -12 + i * 6, ph = o.walk ? Math.sin(t * 9 + i * 2) * 4 : Math.sin(t * 2 + i) * 1.5;
      ctx.beginPath(); ctx.moveTo(lx, -14);
      ctx.quadraticCurveTo(lx + ph, -6, lx + ph * 1.5, 0); ctx.stroke();
    }
    // туша
    ctx.fillStyle = '#5e3a56';
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.quadraticCurveTo(-20, -30 - pulse, -6, -36 - pulse);
    ctx.quadraticCurveTo(8, -40 - pulse, 16, -28);
    ctx.quadraticCurveTo(20, -16, 14, -12);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(20,10,20,0.7)'; ctx.stroke();
    // глаза — много, разного размера
    for (const [ex, ey, er] of [[-8, -26, 2.6], [0, -31, 3.4], [8, -27, 2.2], [-3, -20, 1.8], [6, -19, 1.5]]) {
      ctx.fillStyle = '#f5d63d';
      ctx.beginPath(); ctx.arc(ex, ey - pulse * 0.5, er, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#14100a';
      ctx.beginPath(); ctx.arc(ex + 0.6, ey - pulse * 0.5, er * 0.45, 0, 6.283); ctx.fill();
    }
    // пасть-щель
    ctx.strokeStyle = '#2c1428'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(2, -14); ctx.quadraticCurveTo(9, -12 + Math.sin(t * 5), 15, -15); ctx.stroke();
    ctx.restore();
  },
};
