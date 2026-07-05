// ===== БОГАТЫРЬ — игровая логика =====
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let VW = 0,
  VH = 0;
function resize() {
  VW = canvas.width = window.innerWidth;
  VH = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---------- данные ----------
const WEAPONS = {
  sword: { name: "Меч булатный", dmg: 14, cd: 0.45, range: 60 },
  saber: { name: "Сабля половецкая", dmg: 12, cd: 0.3, range: 58 },
  sekira: { name: "Секира", dmg: 21, cd: 0.65, range: 66 },
  mace: { name: "Булава", dmg: 27, cd: 0.85, range: 56 },
  axe: { name: "Топор Росомахи", dmg: 16, cd: 0.42, range: 60 },
  club: { name: "Дубина разбойничья", dmg: 10, cd: 0.55, range: 52 },
  bigclub: { name: "Дубина людоедова", dmg: 34, cd: 1.05, range: 72 },
  knife: { name: "Нож трофейный", dmg: 9, cd: 0.22, range: 46 },
};

// дикие лютые враги — бродят по всей карте, могут повторяться
const WILD_ENEMIES = {
  meat: { name: "Мясо", hp: 90, dmg: 12, speed: 140, xp: 35, n: 3 }, // человек без кожи, раны затягиваются
  govno: { name: "Говённый человек", hp: 70, dmg: 9, speed: 95, xp: 30, n: 2 }, // капает, отравляя землю
  leshy: {
    name: "Леший",
    hp: 120,
    dmg: 10,
    speed: 90,
    xp: 45,
    n: 2,
    weapon: "staff",
  },
  kot: { name: "Кот-баюн", hp: 110, dmg: 30, speed: 150, xp: 55, n: 2 }, // мурлычет и резко бросается
  eagle: { name: "Орёл-стервятник", hp: 60, dmg: 12, speed: 190, xp: 35, n: 3 }, // терзает до крови
  fascist: {
    name: "Фашист",
    hp: 80,
    dmg: 13,
    speed: 125,
    xp: 30,
    n: 3,
    weapon: "knife",
  },
  archer: {
    name: "Лучник",
    hp: 55,
    dmg: 11,
    speed: 115,
    xp: 30,
    n: 4,
    weapon: "bow",
  },
  likho: { name: "Лихо Одноглазое", hp: 9999, dmg: 16, speed: 72, xp: 0, n: 1 }, // НЕУБИВАЕМО, парализует
  ogre: {
    name: "Людоед",
    hp: 220,
    dmg: 30,
    speed: 80,
    xp: 60,
    n: 2,
    weapon: "bigclub",
  },
  chudo: { name: "Чудо-юдо", hp: 500, dmg: 24, speed: 55, xp: 120, n: 1 },
  chert: { name: "Чёрт", hp: 65, dmg: 7, speed: 175, xp: 25, n: 4 }, // вертлявый
  suka: { name: "Сука", hp: 85, dmg: 14, speed: 170, xp: 35, n: 3 }, // костлявая, с пёсьей головой
};
const CHERT_COLORS = [
  "#8c1f16",
  "#2e5c8e",
  "#3d7a3d",
  "#5e3d7a",
  "#1c1c1c",
  "#8a5e1a",
];

// предметы в котомке (пункт меню кладёт их сюда, клавиши 1-6 используют)
const ITEM_DEFS = [
  { id: "berries", key: "1", icon: "🫐", name: "Ягоды" },
  { id: "mushroom", key: "2", icon: "🍄", name: "Гриб" },
  { id: "fish", key: "3", icon: "🐟", name: "Щука" },
  { id: "honey", key: "4", icon: "🍯", name: "Мёд" },
  { id: "bouquet", key: "5", icon: "💐", name: "Букет" },
  { id: "meat", key: "6", icon: "🥩", name: "Припасы" },
  { id: "kljukva", key: "7", icon: "🔴", name: "Клюква болотная" },
  { id: "gnilushka", key: "8", icon: "🟢", name: "Гнилушка" },
];

// огненное дыхание драконов: чем больше дракон, тем дальше и больнее
const DRAGON_FIRE = {
  drakonS: { range: 200, dmg: 10, speed: 260 },
  drakonB: { range: 280, dmg: 16, speed: 290 },
  drakonH: { range: 380, dmg: 26, speed: 320 },
};

// хищники: могут огрызнуться на поглаживание и мстят за удар
const PREDATORS = {
  wolf: 1,
  oboroten: 1,
  tur: 1,
  drakonS: 1,
  drakonB: 1,
  drakonH: 1,
};

// подпись при первой встрече с врагом (крупно на экран)
const ENCOUNTER = {
  bandit: "лихой человек с большой дороги",
  solovey: "воевода, чей свист гнёт деревья",
  polovets: "воевода, мастер сабельной мясорубки",
  rosomaha: "воевода, мечет топоры и наводит ужас",
  koschei: "воевода на ковре-самолёте, манит перстом",
  kalin: "царь-людоед, пожиратель земли русской",
  meat: "человек без кожи, раны затягиваются сами",
  govno: "смердит и отравляет землю под собой",
  leshy: "хозяин леса с волшебным посохом",
  kot: "мурлычет — и бросается насмерть",
  eagle: "терзает когтями до крови",
  fascist: "нечисть из чужого века",
  archer: "бьёт стрелой издалека",
  likho: "НЕУБИВАЕМО! Взгляд его каменит — беги!",
  ogre: "людоед с огромной дубиной",
  chudo: "исполинская чёрная туша",
  chert: "вертлявый бес, не поймать",
  suka: "костлявая тварь с пёсьей головой",
};

const BOSS_DATA = {
  solovey: {
    name: "Соловей-разбойник",
    hp: 230,
    dmg: 14,
    speed: 105,
    weapon: "club",
    xp: 200,
  },
  polovets: {
    name: "Половец Кончак",
    hp: 270,
    dmg: 12,
    speed: 125,
    weapon: "saber",
    xp: 200,
  },
  rosomaha: {
    name: "Росомаха в капюшоне",
    hp: 210,
    dmg: 11,
    speed: 120,
    weapon: "axe",
    xp: 200,
  },
  koschei: {
    name: "Кощей на ковре-самолёте",
    hp: 250,
    dmg: 10,
    speed: 95,
    weapon: null,
    xp: 220,
  },
  kalin: {
    name: "КАЛИН-ЦАРЬ",
    hp: 800,
    dmg: 24,
    speed: 95,
    weapon: "mace",
    xp: 500,
  },
};

const ANIMALS = {
  pigalica: {
    name: "Пигалица",
    hp: 22,
    dmg: 3,
    speed: 165,
    tame: 0.65,
    draw: "bird",
    s: 1.1,
  },
  wolf: {
    name: "Волк",
    hp: 60,
    dmg: 10,
    speed: 165,
    tame: 0.35,
    draw: "quad",
    s: 0.85,
    body: "#84868a",
    head: "#84868a",
    snout: "#b9bbbf",
    legC: "#6d6f73",
    tailW: 4,
  },
  deer: {
    name: "Олень",
    hp: 55,
    dmg: 8,
    speed: 175,
    tame: 0.45,
    draw: "quad",
    s: 0.95,
    body: "#a5744a",
    head: "#a5744a",
    snout: "#c99b6e",
    horns: "antler",
  },
  los: {
    name: "Лось",
    hp: 95,
    dmg: 13,
    speed: 130,
    tame: 0.3,
    draw: "quad",
    s: 1.25,
    body: "#5e4a33",
    head: "#5e4a33",
    snout: "#7a634a",
    horns: "moose",
  },
  tur: {
    name: "Тур",
    hp: 130,
    dmg: 15,
    speed: 120,
    tame: 0.25,
    draw: "quad",
    s: 1.3,
    body: "#3d3128",
    head: "#3d3128",
    snout: "#5e4d3d",
    horns: "bull",
  },
  horse: {
    name: "Дикий конь",
    hp: 85,
    dmg: 9,
    speed: 200,
    tame: 0.35,
    draw: "quad",
    s: 1.15,
    body: "#8a5a2e",
    head: "#8a5a2e",
    snout: "#a5744a",
    mane: "#3d2c14",
    tailC: "#3d2c14",
    tailW: 4,
  },
  kikimora: {
    name: "Кикимора",
    hp: 50,
    dmg: 8,
    speed: 105,
    tame: 0.3,
    draw: "kikimora",
    s: 1,
  },
  oboroten: {
    name: "Оборотень",
    hp: 115,
    dmg: 17,
    speed: 155,
    tame: 0.16,
    draw: "quad",
    s: 1.1,
    body: "#4a4440",
    head: "#4a4440",
    snout: "#6d6560",
    legC: "#3a3430",
    tailW: 5,
  },
  drakonS: {
    name: "Дракон малый",
    hp: 70,
    dmg: 13,
    speed: 145,
    tame: 0.3,
    draw: "dragon",
    s: 0.62,
    body: "#4a7a4e",
    belly: "#c9d6a0",
    wing: "#3a5e3d",
    crest: "#e8622a",
  },
  drakonB: {
    name: "Дракон большой",
    hp: 170,
    dmg: 22,
    speed: 125,
    tame: 0.14,
    draw: "dragon",
    s: 1.05,
    body: "#7a3e3e",
    belly: "#d6b09a",
    wing: "#5e2e2e",
    crest: "#e8b23a",
  },
  drakonH: {
    name: "Дракон огромный",
    hp: 340,
    dmg: 38,
    speed: 105,
    tame: 0.06,
    draw: "dragon",
    s: 1.7,
    body: "#3d3d5e",
    belly: "#a0a8c9",
    wing: "#2c2c46",
    crest: "#c23bd6",
  },
  zhopa: {
    name: "Жопа с ушами",
    hp: 65,
    dmg: 6,
    speed: 140,
    tame: 0.5,
    draw: "zhopa",
    s: 1,
  },
};

// ---------- состояние ----------
let world,
  player,
  enemies,
  animals,
  hostages,
  wanderers,
  groundItems,
  projectiles,
  particles,
  floaters;
let camps,
  seen,
  fogCanvas,
  fogCtx,
  fogFrame,
  fogFrameCtx,
  mapMini,
  mapMiniCtx,
  chunkCache;
let camX = 0,
  camY = 0,
  shake = 0,
  gameTime = 0,
  running = false,
  gameOver = false,
  victory = false;
let totalHostages = 0,
  freedHostages = 0,
  kalinDead = false,
  kalinRef = null;
let birdTimer = 5,
  windTimer = 15,
  fogTimer = 0,
  miniTimer = 0;
let pools = []; // отравленные лужи говённого человека
let alarmOn = false,
  gateHintT = 0; // тревога в замке и напоминание о запертых вратах
let kalinAlerted = false; // раз включившись при входе в замок, держится до смерти Калина
// смерть Калина/Ямы: цепочка взрывов на месте + крупная надпись в центре экрана
let kalinBoomT = 0,
  kalinBoomTick = 0,
  kalinBannerT = 0,
  kalinBoomX = 0,
  kalinBoomY = 0,
  kalinBannerText = "",
  kalinBannerSub = "";
let level = 1; // 1 — Русь, 2 — Тёмный лес (level2.js)
let metKinds; // какие виды врагов уже встречены (для подписи при первой встрече)
let playerName = localStorage.getItem("bogatyr_name") || "Добрыня";
const keys = {};
let mouseX = 0,
  mouseY = 0;

const logEl = document.getElementById("log");
const toastEl = document.getElementById("toast");
const bannerEl = document.getElementById("banner");
let toastTimer = null,
  bannerTimer = null;
function toast(msg, color) {
  toastEl.textContent = msg;
  toastEl.style.color = color || "#f5e6b8";
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}
function logLine(msg, color) {
  // повтор той же строки не плодит новых — наращивает счётчик (×N)
  const last = logEl.lastChild;
  if (last && last.dataset && last.dataset.msg === msg) {
    last.dataset.n = (+last.dataset.n || 1) + 1;
    last.textContent = msg + " (×" + last.dataset.n + ")";
    return;
  }
  const d = document.createElement("div");
  d.textContent = msg;
  d.dataset.msg = msg;
  if (color) d.style.color = color;
  logEl.appendChild(d);
  while (logEl.children.length > 6) logEl.removeChild(logEl.firstChild);
}
function addLog(msg, color) {
  logLine(msg, color);
  toast(msg, color); // обычное событие дублируется тостом внизу по центру
}
// ВАЖНОЕ событие — крупно вверху экрана (освобождение, боссы, реплики, первая встреча)
function announce(msg, color) {
  logLine(msg, color);
  bannerEl.textContent = msg;
  bannerEl.style.color = color || "#ffd76e";
  bannerEl.classList.add("show");
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => bannerEl.classList.remove("show"), 3400);
}
// лечение всегда показывает «+N здоровья» над героем
function healPlayer(n) {
  const before = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + n);
  const got = Math.round(player.hp - before);
  if (got > 0) {
    floater(player.x, player.y - 72, "+" + got + " здоровья", "#8fd06a", 15);
    burst(player.x, player.y, "#8fd06a", 6, 55, -50, 0.9);
  } else floater(player.x, player.y - 72, "здоровье полное", "#cbb87f", 12);
}
function floater(x, y, text, color = "#fff", size = 14) {
  floaters.push({ x, y, text, color, size, t: 1.4, vy: -34 });
}
function burst(x, y, color, n = 8, spd = 90, grav = 160, life = 0.6) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283,
      v = spd * (0.4 + Math.random() * 0.8);
    particles.push({
      x,
      y: y - 10,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 40,
      life: life * (0.6 + Math.random() * 0.7),
      maxLife: life,
      color,
      size: 2 + Math.random() * 2.5,
      grav,
    });
  }
}
function hearts(x, y, n = 5) {
  for (let i = 0; i < n; i++)
    particles.push({
      x: x + (Math.random() - 0.5) * 26,
      y: y - 20 - Math.random() * 14,
      vx: (Math.random() - 0.5) * 20,
      vy: -35 - Math.random() * 25,
      life: 1.1,
      maxLife: 1.1,
      color: "#e85a7a",
      size: 4,
      grav: -8,
      heart: true,
    });
}

// ---------- создание мира ----------
function newGame() {
  level = 1;
  if (AudioSys.droneStop) AudioSys.droneStop(); // вой Тёмного леса остаётся в лесу
  world = generateWorld((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  enemies = [];
  animals = [];
  hostages = [];
  wanderers = [];
  groundItems = [];
  projectiles = [];
  particles = [];
  floaters = [];
  pools = [];
  chunkCache = new Map();
  gameOver = false;
  victory = false;
  kalinDead = false;
  freedHostages = 0;
  gameTime = 0;
  alarmOn = false;
  AudioSys.alarmStop();
  kalinAlerted = false;
  kalinBoomT = kalinBannerT = 0;
  gateHintT = 0;
  logEl.innerHTML = "";

  player = {
    x: world.spawn.x,
    y: world.spawn.y,
    hp: 120,
    maxHp: 120,
    level: 1,
    xp: 0,
    xpNeed: 110,
    speed: 150,
    dmgMul: 1,
    dodge: 0.05,
    smek: 0,
    weapon: "sword",
    face: 1,
    walk: false,
    phase: 0,
    swing: 0,
    cd: 0,
    forced: 0,
    forcedSrc: null,
    feared: 0,
    hurtT: 0,
    pets: [],
    wood: 0,
    rage: 0,
    items: { berries: 0, mushroom: 0, fish: 0, honey: 0, bouquet: 0, meat: 0, kljukva: 0, gnilushka: 0 },
    stepT: 0,
    paralyzed: 0,
    rooted: 0,
    bleedT: 0,
    bleedTick: 0,
    poisonCd: 0,
    forged: 0, // ковка у костра: +25% урона оружия за раз, до трёх раз
    weakT: 0, // зловоние Великана: слабость
    tickled: 0, // щекотка Шурале
    mount: null, // зверь под седлом (конь/медведь)
  };
  metKinds = new Set();
  document.getElementById("heroName").textContent = "Богатырь " + playerName;

  const rnd = world.rnd;
  camps = world.camps;

  // --- воеводы и их лагеря ---
  for (const camp of camps) {
    const bd = BOSS_DATA[camp.kind];
    const boss = mkEnemy(camp.kind, camp.x, camp.y - 30, bd, true);
    boss.camp = camp;
    enemies.push(boss);
    camp.guards = [boss];
    const nBandits = 2 + Math.floor(rnd() * 2);
    for (let i = 0; i < nBandits; i++) {
      const b = mkEnemy(
        "bandit",
        camp.x + (rnd() - 0.5) * 140,
        camp.y + (rnd() - 0.5) * 140,
        {
          name: "Разбойник",
          hp: 45,
          dmg: 8,
          speed: 110,
          weapon: rnd() < 0.5 ? "club" : "saber",
          xp: 25,
        },
      );
      b.camp = camp;
      enemies.push(b);
      camp.guards.push(b);
    }
    world.props.push({ type: "campfire", x: camp.x + 45, y: camp.y + 35 });
    if (camp.treasure)
      world.props.push({
        type: "chest",
        x: camp.x - 55,
        y: camp.y + 40,
        used: false,
      });
    for (let h = 0; h < camp.hostages; h++) {
      const hx = camp.x - 30 + h * 42,
        hy = camp.y - 70;
      world.props.push({ type: "pole", x: hx, y: hy });
      const r = rnd();
      hostages.push({
        x: hx + 6,
        y: hy + 4,
        type: r < 0.4 ? "child" : r < 0.8 ? "woman" : "monk",
        pretty: rnd() < 0.5, // краса писаная — коса, кокошник, румянец
        camp,
        freed: false,
        gone: false,
        leaveT: 0,
        phase: rnd() * 6,
      });
    }
  }

  // --- Калин-царь в замке ---
  const ca = world.castle;
  world.props.push({ type: "table", x: ca.cx, y: ca.cy + 10 });
  kalinRef = mkEnemy("kalin", ca.cx, ca.cy - 34, BOSS_DATA.kalin, true);
  kalinRef.home = { x: ca.cx, y: ca.cy - 34 };
  enemies.push(kalinRef);
  const castleCamp = { kind: "castle", x: ca.cx, y: ca.cy, guards: [kalinRef] };
  camps.push(castleCamp);
  for (let g = 0; g < 2; g++) {
    const e = mkEnemy("bandit", ca.cx - 90 + g * 180, ca.cy + 80, {
      name: "Стражник Калина",
      hp: 70,
      dmg: 12,
      speed: 115,
      weapon: "sekira",
      xp: 40,
    });
    e.camp = castleCamp;
    enemies.push(e);
    castleCamp.guards.push(e);
  }
  // пленники в замке
  for (let h = 0; h < 2; h++) {
    const hx = ca.cx - 130 + h * 260,
      hy = ca.cy + 60;
    world.props.push({ type: "pole", x: hx, y: hy });
    hostages.push({
      x: hx + 6,
      y: hy + 4,
      type: h ? "woman" : "monk",
      pretty: true,
      camp: castleCamp,
      freed: false,
      gone: false,
      leaveT: 0,
      phase: rnd() * 6,
    });
  }
  totalHostages = hostages.length;

  // --- звери ---
  const species = Object.keys(ANIMALS);
  const spawnCounts = {
    pigalica: 6,
    wolf: 5,
    deer: 5,
    los: 3,
    tur: 3,
    horse: 4,
    kikimora: 3,
    oboroten: 2,
    drakonS: 3,
    drakonB: 2,
    drakonH: 1,
    zhopa: 2,
  };
  for (const sp of species) {
    for (let i = 0; i < spawnCounts[sp]; i++) {
      for (let tries = 0; tries < 60; tries++) {
        const x = (2 + rnd() * (MAP_W - 4)) * TILE,
          y = (2 + rnd() * (MAP_H - 4)) * TILE;
        if (!world.passable(x, y)) continue;
        if (Math.hypot(x - world.castle.cx, y - world.castle.cy) < 520)
          continue;
        animals.push({
          sp,
          ...JSON.parse(JSON.stringify(ANIMALS[sp])),
          x,
          y,
          face: 1,
          walk: false,
          phase: rnd() * 6,
          wanderT: rnd() * 3,
          dir: rnd() * 6.283,
          tamed: false,
          tameBonus: 0,
          scared: 0,
          cd: 0,
          maxHp: ANIMALS[sp].hp,
          homeX: x,
          homeY: y,
        });
        break;
      }
    }
  }

  // --- дикие лютые враги по всей карте (могут повторяться) ---
  for (const kind of Object.keys(WILD_ENEMIES)) {
    const wd = WILD_ENEMIES[kind];
    for (let i = 0; i < wd.n; i++) {
      for (let tries = 0; tries < 80; tries++) {
        const x = (2 + rnd() * (MAP_W - 4)) * TILE,
          y = (2 + rnd() * (MAP_H - 4)) * TILE;
        if (!world.passable(x, y)) continue;
        if (Math.hypot(x - world.spawn.x, y - world.spawn.y) < 850) continue; // не у старта
        if (Math.hypot(x - world.castle.cx, y - world.castle.cy) < 480)
          continue;
        const e = mkEnemy(kind, x, y, {
          name: wd.name,
          hp: wd.hp,
          dmg: wd.dmg,
          speed: wd.speed,
          weapon: wd.weapon || null,
          xp: wd.xp,
        });
        e.wild = true;
        e.wanderT = rnd() * 4;
        if (kind === "chert")
          e.tint = CHERT_COLORS[Math.floor(rnd() * CHERT_COLORS.length)];
        if (kind === "ogre") {
          // вокруг логова людоеда валяются обглоданные кости
          for (let b = 0; b < 3 + Math.floor(rnd() * 3); b++)
            world.props.push({
              type: "bones",
              x: x + (rnd() - 0.5) * 220,
              y: y + (rnd() - 0.5) * 180,
              used: false,
            });
        }
        enemies.push(e);
        break;
      }
    }
  }

  // --- странники ---
  for (let i = 0; i < 3; i++) {
    for (let tries = 0; tries < 60; tries++) {
      const x = (10 + rnd() * (MAP_W - 20)) * TILE,
        y = (10 + rnd() * (MAP_H - 20)) * TILE;
      if (
        !world.passable(x, y) ||
        Math.hypot(x - player.x, y - player.y) > 2200
      )
        continue;
      wanderers.push({
        x,
        y,
        face: 1,
        walk: false,
        phase: rnd() * 6,
        wanderT: 2,
        dir: rnd() * 6.283,
      });
      break;
    }
  }

  // --- туман войны ---
  seen = new Uint8Array(MAP_W * MAP_H);
  fogCanvas = document.createElement("canvas");
  fogCanvas.width = MAP_W;
  fogCanvas.height = MAP_H;
  fogCtx = fogCanvas.getContext("2d");
  fogCtx.fillStyle = "#06070a";
  fogCtx.fillRect(0, 0, MAP_W, MAP_H);
  fogFrame = document.createElement("canvas");
  fogFrameCtx = fogFrame.getContext("2d");
  mapMini = document.createElement("canvas");
  mapMini.width = MAP_W;
  mapMini.height = MAP_H;
  mapMiniCtx = mapMini.getContext("2d");
  mapMiniCtx.fillStyle = "#0a0c08";
  mapMiniCtx.fillRect(0, 0, MAP_W, MAP_H);
  updateFog(true);
  updateObjective();
  addLog("Ты вышел в путь. Освободи пленников и срази Калина-царя!", "#ffd76e");
}

function mkEnemy(kind, x, y, d, isBoss = false) {
  return {
    kind,
    name: d.name,
    x,
    y,
    hp: d.hp,
    maxHp: d.hp,
    dmg: d.dmg,
    speed: d.speed,
    weapon: d.weapon,
    xpVal: d.xp,
    isBoss,
    face: 1,
    walk: false,
    phase: Math.random() * 6,
    swing: 0,
    cd: 1 + Math.random(),
    spCd: 3 + Math.random() * 3,
    dead: false,
    home: { x, y },
    hurtT: 0,
    grinding: 0,
    summoned: false,
    prefPlayer: Math.random() < 0.4, // эти рвутся к герою сквозь орду зверей
  };
}

function loseXP(n, reason) {
  player.xp = Math.max(0, player.xp - n);
  floater(player.x, player.y - 72, "-" + n + " опыта", "#ff8a7a", 14);
  if (reason) addLog(reason, "#ff8a7a");
}

// ---------- опыт и уровни ----------
function gainXP(n, x, y) {
  player.xp += n;
  if (x !== undefined) floater(x, y - 30, "+" + n + " опыта", "#ffd76e", 13);
  while (player.xp >= player.xpNeed) {
    player.xp -= player.xpNeed;
    player.level++;
    player.xpNeed = Math.round(110 * Math.pow(1.25, player.level - 1));
    player.maxHp += 18;
    player.hp = player.maxHp;
    player.speed = Math.min(255, player.speed + 7);
    player.dmgMul += 0.09;
    player.dodge = Math.min(0.35, player.dodge + 0.035);
    AudioSys.levelup();
    burst(player.x, player.y, "#ffd76e", 22, 130, -30, 1.1);
    announce("⭐ УРОВЕНЬ " + player.level + "! Богатырь окреп.", "#ffe89a");
    if (player.level % 3 === 0)
      gainSmek(1, "С годами странствий приходит и смекалка.");
  }
}

// смекалка: повышает шанс приручения и удачу (грибы, рыбалка, клады, пчёлы)
function gainSmek(n, msg) {
  player.smek += n;
  floater(player.x, player.y - 86, "+" + n + " смекалки", "#a0e8ff", 14);
  if (msg) addLog(msg + " Смекалка: " + player.smek + ".", "#a0e8ff");
}

function updateObjective() {
  if (level === 2 && typeof l2Objective === "function") return l2Objective();
  const bossesLeft = enemies
    ? enemies.filter((e) => e.isBoss && e.kind !== "kalin" && !e.dead).length
    : 4;
  document.getElementById("objective").innerHTML =
    '<b style="color:#ffd76e">ЗАДАНИЕ</b><br>Пленники: ' +
    freedHostages +
    " / " +
    totalHostages +
    "<br>Воеводы: " +
    (4 - bossesLeft) +
    " / 4" +
    "<br>Врата замка: " +
    (world && world.gateOpen
      ? '<span style="color:#8fd06a">открыты</span>'
      : '<span style="color:#ff8a7a">заперты</span>') +
    "<br>Калин-царь: " +
    (kalinDead
      ? '<span style="color:#8fd06a">повержен ⚔</span>'
      : '<span style="color:#ff8a7a">пирует в замке</span>');
}

// ---------- урон ----------
function hurtPlayer(dmg, srcX, srcY) {
  if (gameOver || victory) return;
  if (Math.random() < player.dodge) {
    AudioSys.dodge();
    floater(player.x, player.y - 55, "увернулся!", "#a0e8ff", 13);
    return;
  }
  player.hp -= dmg;
  player.hurtT = 0.25;
  shake = Math.max(shake, 6);
  AudioSys.playerHurt();
  burst(player.x, player.y - 20, "#c23b30", 6, 80);
  if (srcX !== undefined) {
    const d = Math.hypot(player.x - srcX, player.y - srcY) || 1;
    tryMove(player, ((player.x - srcX) / d) * 14, ((player.y - srcY) / d) * 14);
  }
  if (player.hp <= 0) {
    player.hp = 0;
    doGameOver();
  }
}

function hurtEnemy(e, dmg, fromPet) {
  if (e.dead) return;
  if (e.kind === "likho") {
    // Лихо Одноглазое убить нельзя — только убежать
    floater(e.x, e.y - 70, "ЛИХО НЕ УБИТЬ!", "#c9a0e8", 14);
    AudioSys.hitMetal();
    return;
  }
  if (e.invuln) {
    // спящая ЯМА и прочее временно неуязвимое
    floater(e.x, e.y - 70, e.invulnMsg || "НЕУЯЗВИМО", "#c9a0e8", 13);
    AudioSys.hitMetal();
    return;
  }
  e.hp -= dmg;
  e.hurtT = 0.18;
  floater(
    e.x + (Math.random() - 0.5) * 20,
    e.y - 55,
    "-" + Math.round(dmg),
    fromPet ? "#9fd08a" : "#fff",
    14,
  );
  burst(e.x, e.y - 20, "#c23b30", 5, 70);
  AudioSys.hitFlesh();
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e) {
  e.dead = true;
  burst(e.x, e.y, "#c23b30", 14, 110);
  burst(e.x, e.y, "#3d3128", 8, 60);
  // на втором уровне боссы и ЯМА объявляют смерть по-своему
  const l2Handled =
    level === 2 && typeof l2OnKill === "function" && l2OnKill(e);
  if (l2Handled) {
    // xp, оружие и задание — как у всех
  } else if (e.kind === "kalin") {
    kalinDead = true;
    alarmOn = false;
    AudioSys.alarmStop(); // тревога смолкает...
    world.kalinLockdown = false; // ...ворота больше не заперты
    AudioSys.bossDie();
    AudioSys.fanfare(); // ...и звучит короткая победная
    addLog("☠ КАЛИН-ЦАРЬ ПОВЕРЖЕН! Земля вздохнула свободно.", "#8fd06a");
    // царь взрывается снопом искр; надпись рисуется крупно в центре экрана (в draw)
    kalinBoomX = e.x;
    kalinBoomY = e.y;
    kalinBoomT = 1.5;
    kalinBoomTick = 0;
    kalinBannerT = 4.2;
    kalinBannerText = "☠ КАЛИН-ЦАРЬ ПОВЕРЖЕН!";
    kalinBannerSub = "Земля вздохнула свободно";
    burst(e.x, e.y - 20, "#ffd76e", 40, 260, 60, 1.2);
    burst(e.x, e.y - 20, "#ff6a30", 30, 210, 60, 1.0);
    burst(e.x, e.y - 20, "#c23bd6", 22, 160, 60, 1.4);
    shake = 24;
  } else if (e.isBoss) {
    AudioSys.bossDie();
    announce("☠ " + e.name + " повержен!", "#8fd06a");
    shake = 9;
    checkGateOpen();
  } else if (e.kind === "chudo" || e.kind === "ogre") {
    AudioSys.bossDie();
    announce(
      "☠ " + e.name + (e.kind === "chudo" ? " издохло!" : " повержен!"),
      "#8fd06a",
    );
    shake = 8;
  } else {
    AudioSys.enemyDie();
    // о каждом поверженном враге — строка в лог (раньше многие умирали молча)
    addLog("Повержен: " + e.name + " (+" + e.xpVal + " опыта).", "#cbb87f");
  }
  if (e.weapon && WEAPONS[e.weapon] && e.weapon !== "club") {
    groundItems.push({ x: e.x + 14, y: e.y + 8, kind: e.weapon });
    addLog(
      "Выпало оружие: " + WEAPONS[e.weapon].name + ". Подойди и нажми E.",
      "#a0e8ff",
    );
  }
  gainXP(e.xpVal, e.x, e.y);
  updateObjective();
  checkVictory();
}

// врата замка отворяются, лишь когда все четыре воеводы повержены
function checkGateOpen() {
  if (world.gateOpen) return;
  const alive = enemies.some(
    (en) => en.isBoss && en.kind !== "kalin" && !en.dead,
  );
  if (!alive) {
    world.gateOpen = true;
    AudioSys.gate();
    announce("🏰 Все воеводы пали! Врата замка отворяются...", "#ffd76e");
    updateObjective();
  }
}

function campCleared(camp) {
  return camp.guards.every((g) => g.dead);
}

function checkVictory() {
  if (kalinBannerT > 0) return; // сначала взрыв и надпись в центре, потом победный экран
  if (level === 2) return; // победу в Тёмном лесу объявляет l2Victory (level2.js)
  if (!victory && kalinDead && freedHostages === totalHostages) {
    victory = true;
    running = false;
    AudioSys.victory();
    showOverlay(
      "ПОБЕДА!",
      "Слава богатырю " + playerName + "!",
      "<p>Все пленники свободны, Калин-царь повержен, воеводы его разбиты. " +
        "Гусляры сложат песни о подвиге " +
        playerName +
        ", а берёзы будут шуметь о нём века.</p>" +
        "<p>Но с полуночи тянет гнилью: за оврагами чернеет ТЁМНЫЙ ЛЕС, " +
        "и оттуда не вернулся ещё ни один. Богатырская дорога зовёт дальше.</p>" +
        '<p style="text-align:center;color:#ffd76e">Уровень ' +
        player.level +
        " · соратников: " +
        player.pets.length +
        "</p>",
      "В ТЁМНЫЙ ЛЕС",
    );
  }
}

function doGameOver() {
  gameOver = true;
  running = false;
  if (AudioSys.droneStop) AudioSys.droneStop();
  AudioSys.gameover();
  showOverlay(
    "БОГАТЫРЬ ПАЛ",
    "Но песня о нём не кончена...",
    "<p>Враги одолели. Освобождено пленников: " +
      freedHostages +
      " из " +
      totalHostages +
      (kalinDead
        ? ". Калин-царь был повержен, но некому донести весть."
        : ". Калин-царь всё ещё пирует.") +
      "</p>",
    "ВОССТАТЬ ВНОВЬ",
  );
}

function showOverlay(h1, h2, html, btnText) {
  const ov = document.getElementById("overlay");
  ov.style.display = "flex";
  ov.querySelector(".box").innerHTML =
    "<h1>" +
    h1 +
    "</h1><h2>" +
    h2 +
    "</h2>" +
    html +
    '<button id="startBtn">' +
    btnText +
    "</button>";
  document.getElementById("startBtn").onclick = startGame;
}

function startGame() {
  const nameInp = document.getElementById("nameInput");
  if (nameInp && nameInp.value.trim()) {
    playerName = nameInp.value.trim();
    localStorage.setItem("bogatyr_name", playerName);
  }
  document.getElementById("overlay").style.display = "none";
  AudioSys.init();
  if (victory && level === 1 && typeof startLevel2 === "function") {
    startLevel2(); // Русь освобождена — дальше Тёмный лес
  } else if (gameOver && level === 2 && typeof restartLevel2 === "function") {
    restartLevel2(); // пал в лесу — восстаёт у его кромки, каким вошёл
  } else if (gameOver || victory || !world) {
    newGame();
  }
  document.getElementById("heroName").textContent = "Богатырь " + playerName;
  running = true;
}

// есть ли стена (или закрытые ворота) между двумя точками — сквозь неё нельзя ни бить, ни стрелять
function wallBetween(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0),
    steps = Math.max(2, Math.ceil(d / (TILE / 2)));
  for (let i = 1; i < steps; i++) {
    const px = x0 + ((x1 - x0) * i) / steps,
      py = y0 + ((y1 - y0) * i) / steps;
    if (world.tileAt(Math.floor(px / TILE), Math.floor(py / TILE)) === T.WALL)
      return true;
    if (!world.gateOpen || world.kalinLockdown) {
      const g = world.castle.gatePx;
      if (px >= g.x0 && px < g.x1 && py >= g.y0 && py < g.y1) return true;
    }
  }
  return false;
}

// ---------- атака игрока ----------
function playerAttack(tx, ty) {
  if (player.cd > 0 || player.forced > 0 || player.paralyzed > 0 || !running)
    return;
  const wp = WEAPONS[player.weapon];
  player.cd = wp.cd;
  player.swing = 1;
  const ang = Math.atan2(ty - player.y, tx - player.x);
  player.face = Math.cos(ang) >= 0 ? 1 : -1;
  AudioSys.swing();
  let hit = false;
  for (const e of enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < wp.range + 14 + (e.r || 0)) {
      // у ЯМЫ e.r — бьём её, стоя у края
      if (wallBetween(player.x, player.y - 20, e.x, e.y - 20)) continue; // сквозь стену не достать
      const ea = Math.atan2(e.y - player.y, e.x - player.x);
      let da = Math.abs(ea - ang);
      if (da > Math.PI) da = 6.283 - da;
      if (da < 1.25 || d < 30) {
        hurtEnemy(
          e,
          (wp.dmg * (1 + 0.25 * (player.forged || 0)) + player.level) *
            player.dmgMul *
            (0.85 + Math.random() * 0.3) *
            (1 + player.rage) *
            (player.weakT > 0 ? 0.5 : 1), // в зловонии рука слабеет
        );
        // верхом бьём вдвоём: зверь кусает ту же цель
        if (player.mount && !e.dead && player.mount.hp > 0) {
          hurtEnemy(
            e,
            player.mount.dmg * (0.85 + Math.random() * 0.3),
            true,
          );
        }
        hit = true;
      }
    }
  }
  if (hit) return;

  // удар по зверю — зверь даст сдачи или сбежит, а с убитого выпадут припасы
  for (const a of animals) {
    if (a.hp <= 0 || a === player.mount) continue; // своего скакуна не зашибёшь
    const d = Math.hypot(a.x - player.x, a.y - player.y);
    if (d < wp.range + 10 * (a.s || 1)) {
      const ea = Math.atan2(a.y - player.y, a.x - player.x);
      let da = Math.abs(ea - ang);
      if (da > Math.PI) da = 6.283 - da;
      if (da < 1.25 || d < 30) {
        hurtAnimal(a, (wp.dmg + player.level) * player.dmgMul);
        return;
      }
    }
  }
  // удар по пленнику — позор богатырю
  for (const h of hostages) {
    if (h.gone || h.freed) continue;
    if (Math.hypot(h.x - player.x, h.y - player.y) < wp.range) {
      loseXP(15, "ПОЗОР! Бить пленных — не богатырское дело (-15 опыта).");
      announce("Пленник плачет: «За что, богатырь?..»", "#ff8a7a");
      return;
    }
  }
  // удар по страннику — получишь посохом и проклятие
  for (const wn of wanderers) {
    if (Math.hypot(wn.x - player.x, wn.y - player.y) < wp.range) {
      hurtPlayer(6, wn.x, wn.y);
      if (player.smek > 0) {
        player.smek--;
        floater(player.x, player.y - 86, "-1 смекалки", "#ff8a7a", 14);
      }
      announce("Странник огрел посохом: «Ума лишился, витязь?!»", "#ff8a7a");
      return;
    }
  }
  // крушим предметы — не все поддаются с первого удара
  for (const p of world.props) {
    if (Math.hypot(p.x - player.x, p.y - player.y) < wp.range) {
      if (smashProp(p)) return;
    }
  }
  // рубим дерево ударами — три удара, и повалится
  for (const tr of world.trees) {
    if (!tr.alive) continue;
    if (Math.hypot(tr.x - player.x, tr.y - player.y) < wp.range) {
      tr.bendV += tr.x > player.x ? 5 : -5;
      AudioSys.chop();
      burst(tr.x, tr.y - 40, "#94c25a", 4, 60);
      tr.chops = (tr.chops || 0) + 1;
      if (tr.chops >= 3) {
        tr.alive = false;
        player.wood++;
        setTimeout(() => AudioSys.treeFall(), 250);
        burst(tr.x, tr.y - 30, "#94c25a", 14, 100);
        shake = 4;
        gainXP(4, tr.x, tr.y);
        addLog("Дерево повалено ударами! Брёвен: " + player.wood + ".");
      }
      break;
    }
  }
}

// разбить предмет ударом; возвращает true, если удар пришёлся по предмету
const PROP_HP = {
  stone: 3,
  bush: 1,
  mushroom: 1,
  flowers: 1,
  stump: 2,
  hive: 2,
  chest: 2,
  bones: 1,
};
function smashProp(p) {
  const maxHits = PROP_HP[p.type];
  if (!maxHits) {
    // колодцы, столбы и прочее ударом не взять
    if (p.type === "well" || p.type === "pole" || p.type === "table") {
      AudioSys.hitMetal();
      burst(p.x, p.y - 8, "#c9a94f", 3, 50);
      return true;
    }
    return false;
  }
  p.hits = (p.hits || 0) + 1;
  AudioSys.crack();
  burst(p.x, p.y - 8, p.type === "stone" ? "#8d8f88" : "#94c25a", 5, 70);
  if (p.hits < maxHits) {
    addLog("Хрясь! Ещё держится.", "#cbb87f");
    return true;
  }
  // предмет разбит
  world.props.splice(world.props.indexOf(p), 1);
  shake = Math.max(shake, 3);
  switch (p.type) {
    case "stone":
      if (Math.random() < 0.3 + player.smek * 0.02) {
        gainXP(8, p.x, p.y);
        addLog("Разнёс камень — под ним кремень да монеты!", "#ffd76e");
      } else addLog("Разнёс камень в крошку.");
      break;
    case "bush":
      if (!p.used) {
        player.items.berries++;
        addLog("Куст в щепки, ягоды — в котомку (клавиша 1).", "#8fd06a");
      } else addLog("Разметал куст.");
      break;
    case "mushroom":
      addLog("Гриб разлетелся в труху.");
      break;
    case "flowers":
      addLog("Цветы полегли под ударом. Зря ты так.", "#cbb87f");
      break;
    case "stump":
      if (Math.random() < 0.3) {
        addLog("Из-под пня выскочила кикимора!", "#c9a0e8");
        animals.push({
          sp: "kikimora",
          ...JSON.parse(JSON.stringify(ANIMALS.kikimora)),
          x: p.x + 20,
          y: p.y + 10,
          face: 1,
          walk: false,
          phase: 0,
          wanderT: 1,
          dir: 0,
          tamed: false,
          tameBonus: 0,
          scared: 0,
          cd: 0,
          maxHp: 50,
          homeX: p.x,
          homeY: p.y,
          angry: 4,
        });
      } else addLog("Разнёс пень в щепу.");
      break;
    case "hive":
      if (!p.used) {
        player.items.honey++;
        hurtPlayer(6);
        addLog(
          "Улей вдребезги! Мёд твой (клавиша 4), но пчёлы искусали (-6).",
          "#ff9d7a",
        );
      } else addLog("Пустой улей разлетелся.");
      break;
    case "chest":
      if (!p.used) {
        p.used = false;
        world.props.push(p);
        openChest(p);
      } // вскрыл силой
      else addLog("Разломал пустой сундук.");
      break;
    case "bones":
      addLog("Кости разлетелись. Упокой их, Господи.", "#cbb87f");
      break;
  }
  return true;
}

// ---------- контекстное меню ----------
const menuEl = document.getElementById("ctxmenu");
let menuTarget = null,
  menuOptions = [],
  menuSel = 0;
function closeMenu() {
  menuEl.style.display = "none";
  menuTarget = null;
  menuOptions = [];
  // невидимый input не должен держать фокус — иначе все клавиши «съедаются»
  if (
    document.activeElement &&
    document.activeElement.tagName === "INPUT" &&
    document.activeElement.id === "ctxinput"
  ) {
    document.activeElement.blur();
  }
}
document.addEventListener("mousedown", (e) => {
  if (!menuEl.contains(e.target)) closeMenu();
});

function menuHighlight() {
  menuEl
    .querySelectorAll(".opt")
    .forEach((el, i) => el.classList.toggle("sel", i === menuSel));
}
function menuMove(dir) {
  if (!menuOptions.length) return;
  menuSel = (menuSel + dir + menuOptions.length) % menuOptions.length;
  AudioSys.menu();
  menuHighlight();
}
function menuChoose() {
  if (!menuOptions.length) return;
  const o = menuOptions[menuSel];
  closeMenu();
  o.fn();
}

function openMenu(clientX, clientY, title, options, target) {
  AudioSys.menu();
  menuTarget = target;
  menuOptions = options;
  menuSel = 0;
  let html = '<div class="title">' + title + "</div>";
  options.forEach((o, i) => {
    html += '<div class="opt" data-i="' + i + '">' + o.label + "</div>";
  });
  html +=
    '<input type="text" placeholder="…или впиши своё слово" id="ctxinput">';
  menuEl.innerHTML = html;
  menuEl.style.display = "block";
  menuEl.style.left = Math.min(clientX, VW - 230) + "px";
  menuEl.style.top = Math.min(clientY, VH - 60 - options.length * 34) + "px";
  menuEl.querySelectorAll(".opt").forEach((el) => {
    el.onclick = () => {
      const o = options[+el.dataset.i];
      closeMenu();
      o.fn();
    };
    el.onmouseenter = () => {
      menuSel = +el.dataset.i;
      menuHighlight();
    };
  });
  menuHighlight();
  const inp = document.getElementById("ctxinput");
  inp.onkeydown = (ev) => {
    ev.stopPropagation();
    // стрелки ходят по пунктам, пробел/Enter выбирают (если слово не набрано)
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      menuMove(1);
      return;
    }
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      menuMove(-1);
      return;
    }
    if (ev.key === "Enter") {
      if (inp.value.trim()) {
        const w = inp.value.trim();
        closeMenu();
        customWord(w, target, title);
      } else menuChoose();
      return;
    }
    if (ev.key === " " && !inp.value.trim()) {
      ev.preventDefault();
      menuChoose();
      return;
    }
    if (ev.key === "Escape") closeMenu();
  };
  inp.onmousedown = (ev) => ev.stopPropagation();
  setTimeout(() => inp.focus(), 30);
}

function customWord(word, target, title) {
  const w = word.toLowerCase();
  // из слов нельзя доить опыт и здоровье бесконечно
  const rewardOk = !player.wordAt || gameTime - player.wordAt > 25;
  const reward = (fn) => {
    if (rewardOk) {
      player.wordAt = gameTime;
      fn();
    }
  };
  const px = target && target.x !== undefined ? target.x : player.x;
  const py = target && target.y !== undefined ? target.y : player.y;
  if (/поцел|обня|любл/.test(w)) {
    hearts(px, py, 7);
    AudioSys.pet();
    addLog("Ты " + word.toLowerCase() + " — и на душе теплее.", "#e8a0b4");
    reward(() => gainXP(2));
  } else if (/подж|сжеч|сожг|огонь/.test(w))
    addLog("Богатырь не жжёт родную землю. Не бывать тому.", "#ff9d7a");
  else if (/удар|бей|руби|круши/.test(w)) {
    burst(px, py - 10, "#c9a94f", 6, 80);
    AudioSys.hitMetal();
    addLog("Хрясь! Аж искры полетели.", "#e8d9a8");
  } else if (/молит|перекрест|господ/.test(w)) {
    burst(player.x, player.y - 40, "#fff8d0", 10, 40, -60, 1.3);
    if (rewardOk) healPlayer(10);
    player.wordAt = gameTime;
    addLog(
      rewardOk
        ? "Помолился. На сердце легче, раны затянулись (+10 здоровья)."
        : "Помолился ещё раз. Бог слышал и в первый.",
      "#fff0b0",
    );
  } else if (/спой|пой|песн/.test(w)) {
    AudioSys.birds();
    addLog("Ты затянул песню. " + title + " слушает, разинув рот.", "#a0e8ff");
    reward(() => gainXP(3));
  } else if (/съес|съеш|куша|жри/.test(w))
    addLog("Это в рот не лезет. Богатырь брезгливо поморщился.", "#cbb87f");
  else {
    const resp = [
      "Ты попробовал «" + word + "» — вышло не очень, зато смешно.",
      title + " не понимает слова «" + word + "», но уважает попытку.",
      "Сделано! Никто не знает, что это было, но выглядело лихо.",
      "«" + word + "»? Такого и в былинах не писали.",
    ];
    addLog(resp[Math.floor(Math.random() * resp.length)], "#cbb87f");
    gainXP(1);
    gainSmek(1); // выдумка — мать смекалки
  }
}

function tryContext(clientX, clientY) {
  const wx = clientX + camX,
    wy = clientY + camY;
  const near = (o, r) => Math.hypot(o.x - wx, o.y - wy) < r;
  const reach = (o) => Math.hypot(o.x - player.x, o.y - player.y) < 170;
  const far = () => {
    addLog("Далековато. Подойди ближе.", "#cbb87f");
  };

  // выбираем БЛИЖАЙШИЙ к клику объект среди всех — чтобы толпа зверей
  // не заслоняла сундуки и пленников; свои звери получают штраф к близости
  const cands = [];
  for (const h of hostages)
    if (!h.gone && !h.freed) {
      const d = Math.hypot(h.x - wx, h.y - wy);
      if (d < 40)
        cands.push({
          d: d - 10,
          o: h,
          open: () => hostageMenu(h, clientX, clientY),
        });
    }
  for (const a of animals)
    if (a.hp > 0) {
      const as = a.s || 1;
      // радиус клика растёт с размером зверя, центр поднят к туловищу (баг с лосем)
      const d = Math.min(
        Math.hypot(a.x - wx, a.y - 20 * as - wy) - 16 - (as - 1) * 20,
        Math.hypot(a.x - wx, a.y - wy) - 25,
      );
      if (d < 20)
        cands.push({
          d: d + (a.tamed ? 18 : 0),
          o: a,
          open: () => animalMenu(a, clientX, clientY),
        });
    }
  for (const e of enemies)
    if (!e.dead) {
      const d = Math.hypot(e.x - wx, e.y - 24 - wy);
      if (d < 48)
        cands.push({
          d: d - 6,
          o: e,
          open: () => enemyMenu(e, clientX, clientY),
        });
    }
  for (const wn of wanderers) {
    const d = Math.hypot(wn.x - wx, wn.y - 20 - wy);
    // со странником заговорить важнее, чем ткнуть в дерево за его спиной
    if (d < 46)
      cands.push({
        d: d - 16,
        o: wn,
        open: () => wandererMenu(wn, clientX, clientY),
      });
  }
  for (const p of world.props) {
    const d = Math.hypot(p.x - wx, p.y - wy);
    if (d < 42)
      cands.push({ d, o: p, open: () => propMenu(p, clientX, clientY) });
  }
  for (const tr of world.trees)
    if (tr.alive) {
      const d = Math.hypot(tr.x - wx, tr.y - wy);
      if (d < 40)
        cands.push({
          d: d + 6,
          o: tr,
          open: () => treeMenu(tr, clientX, clientY),
        });
    }
  if (cands.length) {
    cands.sort((c1, c2) => c1.d - c2.d);
    const c = cands[0];
    if (!reach(c.o)) return far();
    return c.open();
  }
  for (const b of world.buildings)
    if (Math.abs(wx - b.x) < 60 && Math.abs(wy - b.y) < 60) {
      if (Math.hypot(b.x - player.x, b.y - player.y) > 200) return far();
      if (b.burnt)
        return openMenu(
          clientX,
          clientY,
          "Сожжённая изба",
          [
            {
              label: "👁 Осмотреть пепелище",
              fn: () => {
                addLog(
                  "Здесь жили люди... Ярость закипает в груди (+1% силы).",
                  "#ff9d7a",
                );
                player.dmgMul += 0.01;
                gainXP(6);
              },
            },
          ],
          b,
        );
      // в избе либо живут (стук, окно и хлеб об этом согласно говорят), либо она пуста
      return openMenu(
        clientX,
        clientY,
        "Изба",
        [
          {
            label: "✊ Постучать",
            fn: () => {
              AudioSys.hitMetal();
              addLog(
                b.people
                  ? Math.random() < 0.5
                    ? "Из-за двери: «Уходи, батюшка, боязно нам!»"
                    : "Шёпот за дверью: «Кто там? Лихие времена, не откроем...»"
                  : "Тишина. Изба пуста — хозяева ушли или сгинули.",
              );
            },
          },
          {
            label: "👁 Заглянуть в окно",
            fn: () =>
              addLog(
                b.people
                  ? "За окном лучина горит, детишки к печи жмутся."
                  : "Темно и пусто. Лавки перевёрнуты, зола остыла.",
                "#cbb87f",
              ),
          },
          {
            label: "🍞 Попросить хлеба",
            fn: () => {
              if (!b.people)
                return addLog(
                  "Никто не отозвался. В пустой избе хлеба не допросишься.",
                );
              if (!b.gave) {
                b.gave = true;
                healPlayer(20);
                AudioSys.eat();
                addLog(
                  "Хозяйка приоткрыла дверь и вынесла краюху хлеба (+20 здоровья). Добрые люди!",
                  "#8fd06a",
                );
              } else addLog("«Прости, батюшка, сами голодуем».");
            },
          },
          {
            label: "🥩 Попросить припасов в дорогу",
            fn: () => {
              if (!b.people) return addLog("Пусто. Припасов тут не найти.");
              if (!b.gaveMeat) {
                b.gaveMeat = true;
                player.items.meat++;
                AudioSys.pickup();
                addLog(
                  "Собрали узелок вяленого мяса (клавиша 6 — жарить у костра).",
                  "#8fd06a",
                );
              } else addLog("«Всё отдали, батюшка, не обессудь».");
            },
          },
        ],
        b,
      );
    }
  const tt = world.tileAt(Math.floor(wx / TILE), Math.floor(wy / TILE));
  if (tt === T.WATER) {
    if (Math.hypot(wx - player.x, wy - player.y) > 170) return far();
    return openMenu(
      clientX,
      clientY,
      "Река",
      [
        {
          label: "💧 Испить воды",
          fn: () => {
            healPlayer(10);
            AudioSys.splash();
            addLog("Студёная водица (+10 здоровья).", "#8fd06a");
          },
        },
        {
          label: "🐟 Порыбачить",
          fn: () => {
            AudioSys.splash();
            if (Math.random() < 0.5 + player.smek * 0.02) {
              player.items.fish++;
              AudioSys.pickup();
              addLog("Поймал щуку! В котомку (клавиша 3 — съесть).", "#8fd06a");
            } else addLog("Сорвалась, зараза...", "#cbb87f");
          },
        },
        {
          label: "🫧 Умыться",
          fn: () => {
            AudioSys.splash();
            addLog("Умылся. Борода блестит, дух бодр.");
          },
        },
      ],
      { x: wx, y: wy },
    );
  }
  // пустое место — просто земля
  if (Math.hypot(wx - player.x, wy - player.y) < 170) {
    const groundOpts = [
      {
        label: "👂 Припасть ухом",
        fn: () =>
          addLog(
            Math.random() < 0.4
              ? "Земля гудит — где-то скачет конница!"
              : "Тихо. Только черви возятся.",
            "#cbb87f",
          ),
      },
      {
        label: "✋ Взять горсть земли",
        fn: () => {
          addLog("Горсть родной земли — за пазуху. Оберег.", "#8fd06a");
          gainXP(2);
        },
      },
    ];
    if (player.wood >= 1 && world.passable(wx, wy))
      groundOpts.unshift({
        label: "🔥 Сложить костёр (1 бревно)",
        fn: () => {
          player.wood--;
          world.props.push({ type: "campfire", x: wx, y: wy });
          AudioSys.chop();
          setTimeout(() => AudioSys.eat(), 300);
          burst(wx, wy - 10, "#e8622a", 10, 70, -40);
          addLog(
            "Костёр сложен и горит! Тут можно греться и жарить припасы. Брёвен: " +
              player.wood +
              ".",
            "#ffd76e",
          );
        },
      });
    return openMenu(clientX, clientY, "Сыра земля", groundOpts, {
      x: wx,
      y: wy,
    });
  }
  far();
}

function hostageMenu(h, cx, cy) {
  const who =
    h.type === "child"
      ? "Пленный ребёнок"
      : h.type === "monk"
        ? "Пленный монах"
        : h.pretty
          ? "Пленная красавица"
          : "Пленница";
  openMenu(
    cx,
    cy,
    who,
    [
      { label: "⛓ Освободить", fn: () => freeHostage(h) },
      {
        label: "🤲 Утешить",
        fn: () => {
          hearts(h.x, h.y);
          AudioSys.pet();
          announce("«Держись, скоро вызволю», — шепчет богатырь.", "#e8a0b4");
        },
      },
    ],
    h,
  );
}

function animalMenu(a, cx, cy) {
  const opts = a.tamed
    ? [
        // на коне или медведе можно ездить верхом — бьётесь вдвоём
        ...(a.sp === "horse" || a.sp === "bear"
          ? [
              player.mount === a
                ? {
                    label: "🐎 Спешиться",
                    fn: () => {
                      player.mount = null;
                      addLog("Ты спешился. " + a.name + " идёт рядом.", "#9fd08a");
                    },
                  }
                : {
                    label: "🐎 Сесть верхом",
                    fn: () => {
                      player.mount = a;
                      AudioSys.pet();
                      announce(
                        "Ты в седле! " + a.name + " несёт быстрее ветра — и бьётесь вы теперь вдвоём.",
                        "#9fd08a",
                      );
                    },
                  },
            ]
          : []),
        { label: "🤚 Погладить", fn: () => petAnimal(a) },
        { label: "👋 Отпустить на волю", fn: () => releaseAnimal(a) },
      ]
    : [
        { label: "🤚 Погладить", fn: () => petAnimal(a) },
        { label: "🐾 Приручить", fn: () => tameAnimal(a) },
        {
          label: "❗ Прогнать",
          fn: () => {
            a.scared = 3;
            addLog(a.name + " удирает прочь.", "#cbb87f");
          },
        },
      ];
  openMenu(cx, cy, a.name + (a.tamed ? " (соратник)" : ""), opts, a);
}

function enemyMenu(e, cx, cy) {
  openMenu(
    cx,
    cy,
    e.name,
    [
      {
        label: "👁 Осмотреть",
        fn: () =>
          addLog(
            e.name +
              ": здоровье " +
              Math.ceil(e.hp) +
              "/" +
              e.maxHp +
              (e.weapon
                ? ", вооружён (" +
                  (WEAPONS[e.weapon] ? WEAPONS[e.weapon].name : e.weapon) +
                  ")"
                : "") +
              ".",
            "#a0e8ff",
          ),
      },
      {
        label: "🗯 Оскорбить",
        fn: () => {
          player.rage = 0.25;
          setTimeout(() => (player.rage = 0), 5000);
          announce(
            "«Выходи биться, погань!» Ярость: +25% урона на 5 сек.",
            "#ff9d7a",
          );
          AudioSys.snarl();
        },
      },
    ],
    e,
  );
}

function wandererMenu(wn, cx, cy) {
  // лесные жители Тёмного леса говорят дольше и дарят артефакты
  if (wn.type && typeof l2WandererMenu === "function")
    return l2WandererMenu(wn, cx, cy);
  const wisdom = [
    "«Гладь волка супротив шерсти — авось приручишь».",
    "«Калин-царь боится того, кто пленных вызволяет».",
    "«За оврагами клады зарыты, да мосты ищи»",
    "«Кощея голыми руками не возьмёшь — но и он смертен».",
    "«Жопу с ушами видал? Гладь смело, она добрая».",
    "«Дракона приручишь — огнём твоих врагов пожжёт».",
    "«Увидишь Лихо Одноглазое — беги, не оглядываясь».",
  ];
  openMenu(
    cx,
    cy,
    "Странник",
    [
      {
        label: "💬 Поговорить",
        fn: () => {
          announce(
            "Странник: " + wisdom[Math.floor(Math.random() * wisdom.length)],
            "#a0e8ff",
          );
          if (!wn.talked) {
            wn.talked = true;
            gainSmek(1, "Мудрое слово запало в душу.");
          }
        },
      },
      {
        label: "🙇 Поклониться",
        fn: () => {
          addLog("Странник кланяется в ответ. Добро помнится.", "#cbb87f");
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

function treeMenu(tr, cx, cy) {
  const tname =
    tr.kind === "birch"
      ? "Берёза"
      : tr.kind === "spruce"
        ? "Ель"
        : tr.kind === "dark"
          ? "Чёрное дерево"
          : tr.kind === "deadtree"
            ? "Мёртвое дерево"
            : "Дуб";
  const tnameAcc = {
    "Берёза": "берёзу",
    "Ель": "ель",
    "Дуб": "дуб",
    "Чёрное дерево": "чёрное дерево",
    "Мёртвое дерево": "мёртвое дерево",
  }[tname];
  openMenu(
    cx,
    cy,
    tname,
    [
      {
        label: "🪓 Срубить",
        fn: () => {
          tr.alive = false;
          player.wood++;
          AudioSys.chop();
          setTimeout(() => AudioSys.treeFall(), 250);
          burst(tr.x, tr.y - 30, "#94c25a", 14, 100);
          shake = 4;
          gainXP(4, tr.x, tr.y);
          addLog(tname + " срублена. Брёвен: " + player.wood + ".");
        },
      },
      {
        label: "✊ Сломать ветку",
        fn: () => {
          tr.bendV += 6;
          AudioSys.chop();
          burst(tr.x, tr.y - 50, "#94c25a", 6, 70);
          addLog("Хрусть! Ветка на память.");
        },
      },
      {
        label: "💧 Полить",
        fn: () => {
          tr.watered = 40;
          burst(tr.x, tr.y - 40, "#7db3d6", 8, 50, -40);
          AudioSys.splash();
          addLog(tname + " напоена — листва заблестела.", "#8fd06a");
          gainXP(2);
        },
      },
      {
        label: "🤗 Обнять",
        fn: () => {
          hearts(tr.x, tr.y - 30);
          healPlayer(3);
          addLog(
            "Обнял " + tname.toLowerCase() + "у. Русь-матушка сил даёт (+3).",
            "#8fd06a",
          );
        },
      },
    ],
    tr,
  );
}

function propMenu(p, cx, cy) {
  const M = {
    stone: [
      "Камень",
      [
        {
          label: "💥 Разбить",
          fn: () => {
            world.props.splice(world.props.indexOf(p), 1);
            AudioSys.hitMetal();
            burst(p.x, p.y - 8, "#8d8f88", 12, 100);
            shake = 3;
            if (Math.random() < 0.3 + player.smek * 0.02) {
              gainXP(8, p.x, p.y);
              addLog("Под камнем — кремень да пяток монет!", "#ffd76e");
            } else addLog("Разбил. Крошка каменная летит.");
          },
        },
        {
          label: "🪑 Присесть",
          fn: () => {
            healPlayer(8);
            addLog("Посидел на камушке, дух перевёл (+8).", "#8fd06a");
          },
        },
      ],
    ],
    bush: [
      "Куст",
      [
        {
          label: "🫐 Собрать ягоды",
          fn: () => {
            if (!p.used) {
              p.used = true;
              player.items.berries++;
              AudioSys.pickup();
              addLog(
                "Земляника — в котомку (клавиша 1 — съесть, +12).",
                "#8fd06a",
              );
            } else addLog("Ягод больше нет.");
          },
        },
        {
          label: "🫣 Спрятаться",
          fn: () =>
            addLog("Присел за кустом. Богатырь в кусте виден весь.", "#cbb87f"),
        },
      ],
    ],
    kljukva: [
      "Клюквенная кочка",
      [
        {
          label: "🔴 Собрать клюкву",
          fn: () => {
            if (!p.used) {
              p.used = true;
              player.items.kljukva++;
              AudioSys.pickup();
              addLog(
                "Клюква болотная — в котомку (клавиша 7 — съесть, +14).",
                "#8fd06a",
              );
            } else addLog("Кочка обобрана дочиста.");
          },
        },
      ],
    ],
    gnilushka: [
      "Трухлявый пень",
      [
        {
          label: "🟢 Взять гнилушку",
          fn: () => {
            if (!p.used) {
              p.used = true;
              player.items.gnilushka++;
              AudioSys.pickup();
              addLog(
                "Светящаяся гнилушка — в котомку (клавиша 8 — вспышка, пугает нечисть).",
                "#8cf0aa",
              );
            } else addLog("Пень давно потух.");
          },
        },
        {
          label: "👁 Осмотреть",
          fn: () =>
            addLog(
              "Гнилое дерево светится мертвенным светом. Нечисть его боится.",
              "#8cf0aa",
            ),
        },
      ],
    ],
    grave: [
      "Могилка",
      [
        {
          label: "🪦 Прочесть надпись",
          fn: () => {
            const eps = [
              "«Пошёл за грибами. Не вернулся».",
              "«Не верьте шёпоту» — и всё, дальше стёрто.",
              "«Здесь лежит Фрол. Дошёл до ЯМЫ».",
              "«Услышишь смех — беги». Свежая могила.",
              "«Любил этот лес. Зря».",
              "Крест без надписи. Только царапины, будто когтями.",
            ];
            addLog(eps[Math.floor(Math.random() * eps.length)], "#c9a0e8");
            if (!p.read) {
              p.read = true;
              gainXP(3);
            }
          },
        },
        {
          label: "🙏 Перекреститься",
          fn: () => addLog("Упокой душу, Господи. В лесу будто тише стало.", "#cbb87f"),
        },
      ],
    ],
    web: [
      "Паутина",
      [
        {
          label: "👁 Осмотреть",
          fn: () =>
            addLog(
              "Паутина в руку толщиной. Хозяин где-то рядом...",
              "#c9a0e8",
            ),
        },
      ],
    ],
    mushroom: [
      "Гриб",
      [
        {
          label: "🍄 Съесть на месте",
          fn: () => {
            if (p.used) return addLog("Уже съеден.");
            p.used = true;
            eatMushroom();
          },
        },
        {
          label: "👜 Сорвать в котомку",
          fn: () => {
            if (p.used) return addLog("Гриба уже нет.");
            p.used = true;
            player.items.mushroom++;
            AudioSys.pickup();
            addLog(
              "Гриб в котомке (клавиша 2). Боровик или мухомор — как повезёт.",
              "#cbb87f",
            );
          },
        },
        {
          label: "🦶 Пнуть",
          fn: () => {
            p.used = true;
            burst(p.x, p.y - 5, "#c23b30", 6, 70);
            addLog("Гриб разлетелся в труху.");
          },
        },
      ],
    ],
    flowers: [
      "Полевые цветы",
      [
        {
          label: "👃 Понюхать",
          fn: () => {
            hearts(p.x, p.y, 3);
            healPlayer(2);
            addLog("Пахнет летом и мёдом (+2).", "#8fd06a");
          },
        },
        {
          label: "💐 Сорвать букет",
          fn: () => {
            world.props.splice(world.props.indexOf(p), 1);
            player.items.bouquet++;
            AudioSys.pickup();
            addLog(
              "Букет за пояс (клавиша 5 — подарить зверю, доверие вырастет).",
              "#e8a0b4",
            );
            gainXP(2);
          },
        },
      ],
    ],
    spring: [
      "Родник",
      [
        {
          label: "✨ Испить живой воды",
          fn: () => {
            if (p.used) return addLog("Родник иссяк. Сила его ушла в землю.");
            p.used = true;
            player.maxHp += 15;
            healPlayer(15);
            AudioSys.freed();
            burst(player.x, player.y - 30, "#6ac4e8", 16, 90, -50, 1.2);
            floater(
              player.x,
              player.y - 90,
              "+15 к наибольшему здоровью!",
              "#6ac4e8",
              16,
            );
            addLog(
              "Живая вода! Тело окрепло навсегда: наибольшее здоровье выросло на 15.",
              "#6ac4e8",
            );
          },
        },
        {
          label: "🫧 Умыться",
          fn: () => {
            AudioSys.splash();
            healPlayer(5);
            addLog("Студёная родниковая вода бодрит (+5).", "#8fd06a");
          },
        },
      ],
    ],
    hive: [
      "Дикий улей",
      [
        {
          label: "🍯 Достать мёд",
          fn: () => {
            if (p.used) return addLog("Улей пуст.");
            p.used = true;
            if (Math.random() < Math.max(0.05, 0.3 - player.smek * 0.02)) {
              hurtPlayer(6);
              addLog(
                "Пчёлы искусали (-6)! Но мёд добыт — в котомку (клавиша 4).",
                "#ff9d7a",
              );
            } else {
              addLog(
                "Ловко выкурил пчёл! Дикий мёд в котомке (клавиша 4, +30).",
                "#ffd76e",
              );
            }
            player.items.honey++;
            AudioSys.pickup();
          },
        },
        {
          label: "👂 Послушать",
          fn: () =>
            addLog(
              p.used ? "Тихо. Пчёлы улетели." : "Гудят вовсю — мёда полно!",
              "#cbb87f",
            ),
        },
      ],
    ],
    stump: [
      "Пень",
      [
        {
          label: "🪑 Присесть отдохнуть",
          fn: () => {
            healPlayer(15);
            addLog("Отдохнул на пеньке (+15).", "#8fd06a");
          },
        },
        {
          label: "✊ Постучать по пню",
          fn: () => {
            AudioSys.chop();
            if (Math.random() < 0.3) {
              addLog("Из-под пня выскочила кикимора!", "#c9a0e8");
              animals.push({
                sp: "kikimora",
                ...JSON.parse(JSON.stringify(ANIMALS.kikimora)),
                x: p.x + 20,
                y: p.y + 10,
                face: 1,
                walk: false,
                phase: 0,
                wanderT: 1,
                dir: 0,
                tamed: false,
                tameBonus: 0.2,
                scared: 0,
                cd: 0,
                maxHp: 50,
                homeX: p.x,
                homeY: p.y,
              });
            } else addLog("Тук-тук. Никого.");
          },
        },
      ],
    ],
    well: [
      "Колодец",
      [
        {
          label: "💧 Испить",
          fn: () => {
            healPlayer(25);
            AudioSys.splash();
            addLog("Колодезная вода — что живая (+25)!", "#8fd06a");
          },
        },
        {
          label: "🪙 Бросить монетку",
          fn: () => {
            AudioSys.splash();
            addLog("Дзынь... буль. На удачу.");
            gainXP(3);
          },
        },
      ],
    ],
    chest: [
      "Сундук",
      [
        { label: "🗝 Открыть", fn: () => openChest(p) },
        {
          label: "👂 Потрясти",
          fn: () =>
            addLog(
              p.used ? "Пусто гремит." : "Внутри что-то звенит!",
              "#ffd76e",
            ),
        },
      ],
    ],
    campfire: [
      "Костёр",
      [
        {
          label: "🔥 Погреться",
          fn: () => {
            if (p.warmedAt && gameTime - p.warmedAt < 30)
              return addLog("Ты уже согрелся. Посиди, но сил больше не прибудет.", "#cbb87f");
            p.warmedAt = gameTime;
            healPlayer(6);
            addLog("Тепло... (+6)", "#8fd06a");
          },
        },
        {
          label: "🥩 Пожарить припасы",
          fn: () => {
            if (!player.items.meat)
              return addLog(
                "Жарить нечего. Припасы дают охота на зверя да добрые люди в избах.",
                "#cbb87f",
              );
            player.items.meat--;
            healPlayer(25);
            AudioSys.eat();
            addLog("Зажарил мясо на углях — сила вернулась (+25)!", "#8fd06a");
          },
        },
        {
          label: "⚒ Ковать оружие (бревно)",
          fn: () => {
            if (player.forged >= 3)
              return addLog(
                "Оружие прокалено трижды — больше металл не возьмёт.",
                "#cbb87f",
              );
            if (!player.wood)
              return addLog(
                "Для ковки нужно бревно — сруби дерево.",
                "#cbb87f",
              );
            player.wood--;
            player.forged++;
            AudioSys.hitMetal();
            setTimeout(() => AudioSys.hitMetal(), 220);
            setTimeout(() => AudioSys.hitMetal(), 440);
            burst(p.x, p.y - 20, "#ffd76e", 14, 120);
            announce(
              "⚒ Оружие проковано на углях! Урон +25% (закалка " +
                player.forged +
                "/3).",
              "#ffd76e",
            );
          },
        },
      ],
    ],
    bones: [
      "Обглоданные кости",
      [
        {
          label: "👁 Осмотреть",
          fn: () =>
            addLog(
              "Кости человечьи, обглоданы дочиста... Логово людоеда близко!",
              "#ff9d7a",
            ),
        },
        {
          label: "🙏 Помянуть",
          fn: () => {
            if (p.mourned)
              return addLog("Эти души уже помянуты. Покойтесь с миром.", "#cbb87f");
            p.mourned = true;
            addLog(
              "Упокой, Господи, души невинные. На сердце тяжко, в руке — твёрдость.",
              "#cbb87f",
            );
            gainXP(4);
          },
        },
      ],
    ],
    pole: [
      "Столб с верёвками",
      [
        {
          label: "👁 Осмотреть",
          fn: () => addLog("К такому столбу лиходеи вяжут пленных.", "#cbb87f"),
        },
      ],
    ],
    table: [
      "Пиршественный стол Калина",
      [
        {
          label: "👁 Осмотреть",
          fn: () =>
            addLog(
              "На блюдах — руки, ноги и головы человечьи. Зверство!",
              "#ff9d7a",
            ),
        },
        {
          label: "💥 Перевернуть",
          fn: () => {
            AudioSys.stomp();
            shake = 6;
            addLog(
              "Ты перевернул поганый стол! Калин-царь взревел.",
              "#ff9d7a",
            );
            if (kalinRef && !kalinRef.dead) kalinRef.spCd = 0.1;
            if (!p.flipped) {
              p.flipped = true;
              gainXP(10);
            }
          },
        },
      ],
    ],
  };
  const m = M[p.type];
  if (m) openMenu(cx, cy, m[0], m[1], p);
}

function openChest(p) {
  if (p.used) return addLog("Сундук пуст.");
  p.used = true;
  AudioSys.pickup();
  const r = Math.random();
  if (r < 0.3) {
    const ws = ["sekira", "mace", "saber"];
    const k = ws[Math.floor(Math.random() * 3)];
    groundItems.push({ x: p.x + 20, y: p.y + 8, kind: k });
    addLog(
      "В сундуке — " + WEAPONS[k].name + "! Нажми E чтобы взять.",
      "#ffd76e",
    );
  } else if (r < 0.6) {
    healPlayer(40);
    addLog("Мёд хмельной да сало! (+40 здоровья)", "#8fd06a");
  } else if (r < 0.85) {
    gainXP(40, p.x, p.y);
    addLog("Грамоты воинские! Опыта прибыло.", "#ffd76e");
  } else {
    addLog("Засада! Из-за сундука выскочил разбойник!", "#ff9d7a");
    const b = mkEnemy("bandit", p.x + 30, p.y + 20, {
      name: "Разбойник из засады",
      hp: 45,
      dmg: 8,
      speed: 115,
      weapon: "club",
      xp: 25,
    });
    enemies.push(b);
  }
}

// ---------- котомка ----------
function eatMushroom() {
  if (Math.random() < 0.55 + player.smek * 0.02) {
    healPlayer(15);
    AudioSys.eat();
    addLog("Боровик! Наваристо (+15).", "#8fd06a");
  } else {
    hurtPlayer(8);
    addLog("МУХОМОР! В глазах кикиморы пляшут (-8)...", "#ff9d7a");
  }
}

function useItem(id) {
  if (!running || !player.items[id]) {
    if (running) addLog("В котомке этого нет.", "#cbb87f");
    return;
  }
  switch (id) {
    case "berries":
      player.items.berries--;
      healPlayer(12);
      AudioSys.eat();
      addLog("Съел горсть земляники (+12).", "#8fd06a");
      break;
    case "mushroom":
      player.items.mushroom--;
      eatMushroom();
      break;
    case "fish":
      player.items.fish--;
      healPlayer(15);
      AudioSys.eat();
      addLog("Съел щуку (+15).", "#8fd06a");
      break;
    case "honey":
      player.items.honey--;
      healPlayer(30);
      AudioSys.eat();
      addLog("Дикий мёд — сила! (+30)", "#8fd06a");
      break;
    case "kljukva":
      player.items.kljukva--;
      healPlayer(14);
      AudioSys.eat();
      addLog("Кислющая болотная клюква — аж скулы свело (+14).", "#8fd06a");
      break;
    case "gnilushka": {
      // светящаяся гнилушка: вспышка мертвенного света — нечисть шарахается
      player.items.gnilushka--;
      burst(player.x, player.y - 30, "#8cf0aa", 26, 180, -20, 1.1);
      AudioSys.magic();
      let scaredN = 0;
      for (const e of enemies) {
        if (e.dead || e.isBoss || e.kind === "likho") continue;
        if (Math.hypot(e.x - player.x, e.y - player.y) < 320) {
          e.fleeT = Math.max(e.fleeT || 0, 2.2);
          scaredN++;
        }
      }
      addLog(
        scaredN
          ? "Гнилушка вспыхнула мертвенным светом — нечисть шарахнулась прочь!"
          : "Гнилушка вспыхнула и истлела. Вокруг никого не было.",
        "#8cf0aa",
      );
      break;
    }
    case "meat": {
      // сырое не едят — жарим, если рядом костёр
      let fire = null;
      for (const p of world.props)
        if (
          p.type === "campfire" &&
          Math.hypot(p.x - player.x, p.y - player.y) < 90
        ) {
          fire = p;
          break;
        }
      if (!fire) {
        addLog(
          "Сырое мясо богатырь не ест. Найди или сложи костёр (бревно + ПКМ по земле).",
          "#cbb87f",
        );
        return;
      }
      player.items.meat--;
      healPlayer(25);
      AudioSys.eat();
      addLog("Зажарил мясо на углях — сила вернулась (+25)!", "#8fd06a");
      break;
    }
    case "bouquet": {
      // подарить букет ближайшему неприручённому зверю — доверие сильно растёт
      let best = null,
        bd = 110;
      for (const a of animals) {
        if (a.hp <= 0 || a.tamed) continue;
        const d = Math.hypot(a.x - player.x, a.y - player.y);
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
      if (!best) {
        addLog("Некому дарить — рядом нет дикого зверя.", "#cbb87f");
        return;
      }
      player.items.bouquet--;
      best.tameBonus = Math.min(0.6, best.tameBonus + 0.25);
      hearts(best.x, best.y, 8);
      AudioSys.pet();
      const ch = Math.min(
        0.95,
        best.tame + best.tameBonus + player.level * 0.01 + player.smek * 0.02,
      );
      floater(
        best.x,
        best.y - 55,
        "доверие " + Math.round(ch * 100) + "%",
        "#e8a0b4",
        14,
      );
      addLog(
        best.name + " нюхает букет и тает. Доверие сильно выросло!",
        "#e8a0b4",
      );
      break;
    }
  }
}

// ---------- звери ----------
function tameChance(a) {
  return Math.min(
    0.95,
    a.tame + a.tameBonus + player.level * 0.01 + player.smek * 0.02,
  );
}
function petAnimal(a) {
  if (!a.tamed) {
    // зверь — не игрушка: может шарахнуться, а хищник — и цапнуть
    const r = Math.random();
    if (PREDATORS[a.sp] && r < 0.1) {
      hurtPlayer(a.dmg * 0.6, a.x, a.y);
      AudioSys.snarl();
      addLog(a.name + " цапнул за руку! Осторожнее с хищником.", "#ff9d7a");
      return;
    }
    if (r < 0.22) {
      a.scared = 1.5;
      AudioSys.tameFail();
      addLog(a.name + " шарахнулся в сторону. Не даётся.", "#cbb87f");
      return;
    }
  }
  hearts(a.x, a.y, 5);
  if (a.sp === "zhopa") AudioSys.zhopa();
  else AudioSys.pet();
  a.tameBonus = Math.min(0.45, a.tameBonus + 0.15);
  const lines = {
    zhopa: "Жопа с ушами блаженно хлопает ушами.",
    kikimora: "Кикимора мурлычет болотную песенку.",
    drakonH: "Огромный дракон прикрыл глаза. Земля дрожит от урчания.",
  };
  addLog(
    lines[a.sp] || a.name + " довольно жмурится. Доверие растёт.",
    "#8fd06a",
  );
  if (!a.tamed)
    floater(
      a.x,
      a.y - 55 * (a.s || 1),
      "доверие " + Math.round(tameChance(a) * 100) + "%",
      "#9fd08a",
      13,
    );
  gainXP(2);
}
function tameAnimal(a) {
  const chance = tameChance(a);
  if (PREDATORS[a.sp] && Math.random() < 0.12) {
    hurtPlayer(a.dmg * 0.6, a.x, a.y);
    a.angry = 4;
    AudioSys.snarl();
    addLog(a.name + " взвился и кинулся в ответ! Дикий нрав.", "#ff9d7a");
    return;
  }
  if (Math.random() < chance) {
    a.tamed = true;
    player.pets.push(a);
    AudioSys.tame();
    hearts(a.x, a.y, 9);
    floater(a.x, a.y - 50, "ПРИРУЧЁН!", "#9fd08a", 16);
    addLog(a.name + " теперь твой соратник! Будет биться за тебя.", "#8fd06a");
    gainXP(15, a.x, a.y);
  } else {
    a.scared = 2.5;
    AudioSys.tameFail();
    // строптивых (оборотень, туры, драконы) надо гладить много раз — доверие копится
    addLog(
      a.name +
        " вырывается (доверие было " +
        Math.round(chance * 100) +
        "%). Гладь ещё, дари букеты — и зверь поддастся.",
      "#cbb87f",
    );
  }
}
function releaseAnimal(a) {
  a.tamed = false;
  if (player.mount === a) player.mount = null;
  player.pets = player.pets.filter((x) => x !== a);
  hearts(a.x, a.y, 3);
  addLog(a.name + " уходит на волю. Прощай, друг.", "#cbb87f");
}

// удар героя по зверю: соратник уходит, хищник мстит, добыча — припасы
function hurtAnimal(a, dmg) {
  a.hp -= dmg;
  burst(a.x, a.y - 12, "#c23b30", 5, 70);
  AudioSys.hitFlesh();
  floater(a.x, a.y - 50 * (a.s || 1), "-" + Math.round(dmg), "#fff", 13);
  if (a.tamed) {
    // ударил друга — он уходит, не оборачиваясь
    a.tamed = false;
    player.pets = player.pets.filter((x) => x !== a);
    a.scared = 4;
    announce(a.name + " не ждал удара от друга... Ушёл навсегда.", "#ff8a7a");
  }
  if (a.hp <= 0) {
    AudioSys.enemyDie();
    burst(a.x, a.y, "#c23b30", 10, 90);
    const chunks = (a.s || 1) >= 1.2 ? 2 : 1; // с крупного зверя — больше мяса
    for (let i = 0; i < chunks; i++)
      groundItems.push({ x: a.x + i * 18 - 8, y: a.y + 6, kind: "meat" });
    addLog(
      a.name + " убит. Выпали припасы — подбери на E и жарь у костра.",
      "#cbb87f",
    );
    gainXP(5, a.x, a.y);
  } else if (PREDATORS[a.sp]) {
    a.angry = 6; // хищник кидается в ответ
    AudioSys.snarl();
    addLog(a.name + " рассвирепел и кидается на тебя!", "#ff9d7a");
  } else {
    a.scared = 3;
  }
}

// ---------- заложники ----------
function freeHostage(h) {
  if (!campCleared(h.camp))
    return addLog("Охрана рядом! Сначала перебей лиходеев лагеря.", "#ff9d7a");
  h.freed = true;
  h.leaveT = 5;
  freedHostages++;
  AudioSys.freed();
  hearts(h.x, h.y, 8);
  const thanks =
    h.type === "child"
      ? "«Спасибо, дяденька богатырь!»"
      : h.type === "monk"
        ? "«Спаси тебя Христос, воине! Благословляю»."
        : h.pretty
          ? "«Век не забуду, витязь!» — красавица целует в щёку."
          : "Румяная красавица кланяется в пояс: «Век не забуду!»";
  announce("⛓ Пленник свободен! " + thanks, "#8fd06a");
  // благословение спасённого закаляет богатыря
  player.maxHp += 5;
  floater(player.x, player.y - 90, "+5 к наибольшему здоровью", "#8fd06a", 13);
  if (h.type === "monk") {
    healPlayer(20);
    addLog("Молитва монаха затянула раны (+20).", "#8fd06a");
  }
  gainXP(120, h.x, h.y);
  updateObjective();
  checkVictory();
}

// ---------- ввод ----------
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  // при открытом меню клавиши управляют меню, а не героем
  if (menuEl.style.display === "block") {
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      e.preventDefault();
      menuMove(1);
    } else if (e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      menuMove(-1);
    } else if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      menuChoose();
    } else if (e.code === "Escape") closeMenu();
    return;
  }
  keys[e.code] = true;
  if (e.code === "Space") {
    e.preventDefault();
    const t = nearestEnemy(300);
    playerAttack(t ? t.x : player.x + player.face * 50, t ? t.y : player.y);
  }
  if (e.code === "KeyE") interact();
  if (e.code === "KeyM") {
    const m = AudioSys.toggleMute();
    addLog(m ? "Звук выключен." : "Звук включён.");
  }
  if (e.code === "Escape") closeMenu();
  if (/^Digit[1-8]$/.test(e.code)) {
    const it = ITEM_DEFS[+e.code.slice(5) - 1];
    if (it) useItem(it.id);
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    closeMenu();
    playerAttack(e.clientX + camX, e.clientY + camY);
  }
});
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (running) tryContext(e.clientX, e.clientY);
});

function nearestEnemy(r) {
  let best = null,
    bd = r;
  for (const e of enemies) {
    if (e.dead) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best;
}

function interact() {
  for (let i = 0; i < groundItems.length; i++) {
    const it = groundItems[i];
    if (Math.hypot(it.x - player.x, it.y - player.y) < 55) {
      if (it.kind === "meat") {
        // припасы — в котомку
        groundItems.splice(i, 1);
        player.items.meat++;
        AudioSys.pickup();
        addLog("Припасы в котомке (клавиша 6 — жарить у костра).", "#8fd06a");
        return;
      }
      const old = player.weapon;
      player.weapon = it.kind;
      groundItems.splice(i, 1);
      groundItems.push({ x: player.x + 20, y: player.y + 10, kind: old });
      AudioSys.pickup();
      addLog(
        "Взял: " +
          WEAPONS[it.kind].name +
          " (урон " +
          WEAPONS[it.kind].dmg +
          ").",
        "#ffd76e",
      );
      return;
    }
  }
  for (const h of hostages)
    if (!h.freed && !h.gone && Math.hypot(h.x - player.x, h.y - player.y) < 70)
      return freeHostage(h);
  // E рядом со странником/жителем: разговор важнее деревьев и грибов вокруг
  for (const wn of wanderers)
    if (Math.hypot(wn.x - player.x, wn.y - player.y) < 90)
      return wandererMenu(wn, wn.x - camX, wn.y - 30 - camY);
  // E рядом со зверем: пока доверие мало — гладит, как доверие накопится — приручает
  for (const a of animals)
    if (
      a.hp > 0 &&
      !a.tamed &&
      !(a.angry > 0) &&
      Math.hypot(a.x - player.x, a.y - player.y) < 60 * (a.s || 1)
    ) {
      if (a.tameBonus >= 0.3) return tameAnimal(a);
      return petAnimal(a);
    }
  // E — универсальная: открывает меню ближайшего объекта (гриб, изба, костёр...)
  let best = null,
    bd = 110;
  const consider = (x, y) => {
    const d = Math.hypot(x - player.x, y - player.y);
    if (d < bd) {
      bd = d;
      return true;
    }
    return false;
  };
  for (const p of world.props)
    if (p.type !== "web" && consider(p.x, p.y)) best = p; // паутина — декор, E не для неё
  for (const tr of world.trees)
    if (
      tr.alive &&
      Math.hypot(tr.x - player.x, tr.y - player.y) < 60 &&
      consider(tr.x, tr.y)
    )
      best = tr; // дерево — только если оно прямо под рукой
  for (const b of world.buildings) if (consider(b.x, b.y + 40)) best = b;
  for (const a of animals)
    if (a.hp > 0 && a.tamed && a !== player.mount && consider(a.x, a.y))
      best = a; // скакун под седлом меню не перехватывает
  if (best) {
    // открываем то же меню, что и ПКМ по объекту
    tryContext(best.x - camX, best.y - 10 - camY);
  } else if (player.mount) {
    // E в чистом поле верхом — спешиться
    const m = player.mount;
    player.mount = null;
    addLog("Ты спешился. " + m.name + " идёт рядом.", "#9fd08a");
  }
}

// ---------- обновление ----------
function tryMove(o, dx, dy) {
  // если объект уже в непроходимом месте — выпускаем в любую сторону, чтобы не застревал
  const stuck = !world.passable(o.x, o.y);
  if (dx && (stuck || world.passable(o.x + dx, o.y))) o.x += dx;
  if (dy && (stuck || world.passable(o.x, o.y + dy))) o.y += dy;
  o.x = Math.max(TILE, Math.min((MAP_W - 1) * TILE, o.x));
  o.y = Math.max(TILE, Math.min((MAP_H - 1) * TILE, o.y));
}

// страховка: если героя всё же занесло в стену/избу/овраг — мягко выталкиваем к ближайшему проходу
function unstickPlayer() {
  if (world.passable(player.x, player.y)) return;
  for (let r = 1; r <= 12; r++) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * 6.283;
      const nx = player.x + Math.cos(ang) * r * TILE * 0.5;
      const ny = player.y + Math.sin(ang) * r * TILE * 0.5;
      if (world.passable(nx, ny)) {
        player.x = nx;
        player.y = ny;
        floater(player.x, player.y - 60, "выбрался!", "#a0e8ff", 13);
        return;
      }
    }
  }
}

// прямой урон (яд, кровь) — без увёртливости и отбрасывания
function directDamage(n, color, label) {
  if (gameOver || victory) return;
  player.hp -= n;
  player.hurtT = Math.max(player.hurtT, 0.12);
  floater(
    player.x + (Math.random() - 0.5) * 16,
    player.y - 66,
    "-" + n + (label ? " " + label : ""),
    color,
    12,
  );
  if (player.hp <= 0) {
    player.hp = 0;
    doGameOver();
  }
}

function update(dt) {
  gameTime += dt;
  player.cd = Math.max(0, player.cd - dt);
  player.swing = Math.max(0, player.swing - dt / 0.28);
  player.hurtT = Math.max(0, player.hurtT - dt);
  player.feared = Math.max(0, player.feared - dt);
  player.paralyzed = Math.max(0, player.paralyzed - dt);
  player.rooted = Math.max(0, player.rooted - dt);

  // кровотечение от когтей орла и клыков Суки
  if (player.bleedT > 0) {
    player.bleedT -= dt;
    player.bleedTick -= dt;
    if (player.bleedTick <= 0) {
      player.bleedTick = 0.7;
      directDamage(2, "#c23b30", "кровь");
      particles.push({
        x: player.x + (Math.random() - 0.5) * 14,
        y: player.y - 20,
        vx: 0,
        vy: 60,
        life: 0.5,
        maxLife: 0.5,
        color: "#8c1f16",
        size: 2.5,
        grav: 120,
      });
    }
  }

  // отравленные лужи говённого человека
  player.poisonCd = Math.max(0, player.poisonCd - dt);
  for (let i = pools.length - 1; i >= 0; i--) {
    const pl = pools[i];
    pl.t -= dt;
    if (pl.t <= 0) {
      pools.splice(i, 1);
      continue;
    }
    if (
      player.poisonCd <= 0 &&
      Math.hypot(player.x - pl.x, player.y - pl.y) < pl.r
    ) {
      if (pl.kind === "crack") {
        player.poisonCd = 0.7;
        directDamage(6, "#ff6a4a", "трещина"); // земля горит — от dodge не спастись
        burst(player.x, player.y, "#8d8d85", 5, 60);
      } else if (pl.kind === "fart") {
        // зловоние Великана: не ранит, но силы уходят
        player.poisonCd = 0.4;
        player.weakT = 0.9;
        floater(player.x, player.y - 66, "нечем дышать...", "#7a9a3d", 12);
      } else if (pl.kind === "oil") {
        // нефтяной след Чёрного — просто скользкая грязь, не жжётся
        player.poisonCd = 0.4;
      } else {
        player.poisonCd = 0.8;
        directDamage(4, "#7a9a3d", "яд");
        AudioSys.squelch();
      }
    }
  }

  // движение игрока
  let mx = 0,
    my = 0;
  if (player.paralyzed <= 0 && player.rooted <= 0) {
    if (keys.KeyW || keys.ArrowUp) my -= 1;
    if (keys.KeyS || keys.ArrowDown) my += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1;
    if (keys.KeyD || keys.ArrowRight) mx += 1;
  }
  if (
    player.paralyzed <= 0 &&
    player.forced > 0 &&
    player.forcedSrc &&
    !player.forcedSrc.dead
  ) {
    player.forced -= dt;
    const d =
      Math.hypot(
        player.forcedSrc.x - player.x,
        player.forcedSrc.y - player.y,
      ) || 1;
    mx = (player.forcedSrc.x - player.x) / d;
    my = (player.forcedSrc.y - player.y) / d;
    player.walk = true;
    tryMove(player, mx * 70 * dt, my * 70 * dt);
    player.face = mx >= 0 ? 1 : -1;
  } else {
    player.forced = 0;
    const len = Math.hypot(mx, my);
    player.walk = len > 0;
    if (len > 0) {
      // верхом скорость даёт зверь; зловоние Великана вяжет ноги; в болоте вязнешь
      const base = player.mount
        ? Math.max(player.speed, player.mount.speed * 1.15)
        : player.speed;
      const inSwamp =
        world.tileAt(Math.floor(player.x / TILE), Math.floor(player.y / TILE)) ===
        T.SWAMP;
      if (inSwamp) {
        player.swampT = (player.swampT || 0) - dt;
        if (player.swampT <= 0) {
          player.swampT = 0.9;
          AudioSys.squelch();
          burst(player.x, player.y, "#3d4a30", 3, 30, 60, 0.4);
        }
      }
      const spd =
        base *
        (player.feared > 0 ? 0.45 : 1) *
        (player.weakT > 0 ? 0.55 : 1) *
        (inSwamp ? 0.45 : 1);
      tryMove(player, (mx / len) * spd * dt, (my / len) * spd * dt);
      if (mx !== 0) player.face = mx > 0 ? 1 : -1;
    }
  }
  player.weakT = Math.max(0, player.weakT - dt);
  // верхом: зверь несёт седока, а встречных врагов расталкивает грудью
  if (player.mount) {
    const m = player.mount;
    if (m.hp <= 0 || !m.tamed) {
      player.mount = null;
    } else if (player.walk) {
      m.trampleCd = Math.max(0, (m.trampleCd || 0) - dt);
      if (m.trampleCd <= 0) {
        for (const e of enemies) {
          if (e.dead || e.invuln || e.kind === "likho") continue;
          if (Math.hypot(e.x - player.x, e.y - player.y) < 48) {
            m.trampleCd = 0.7;
            hurtEnemy(e, m.dmg * 0.5, true);
            floater(e.x, e.y - 60, "растоптан!", "#9fd08a", 12);
            break;
          }
        }
      }
    }
  }

  // шаги — тихий звук в такт ходьбе
  if (player.walk && player.paralyzed <= 0) {
    player.stepT -= dt;
    if (player.stepT <= 0) {
      player.stepT = 0.33 * (150 / player.speed);
      AudioSys.step();
    }
  } else player.stepT = 0;

  unstickPlayer();

  // логово Калина: внутри стен — красный экран и тревожная музыка, пока царь жив
  // (в Тёмном лесу замка нет)
  if (world.castle) {
    const cca = world.castle;
    // считаем только внутренность (без кольца стен и проёма ворот) — иначе
    // тревога срабатывала, когда герой ещё стоял в арке ворот, ворота
    // захлопывались под ним и выталкивали наружу, а звери успевали забежать внутрь
    const inCastle =
      player.x > (cca.x0 + 1) * TILE &&
      player.x < (cca.x0 + cca.w - 1) * TILE &&
      player.y > (cca.y0 + 1) * TILE &&
      player.y < (cca.y0 + cca.h - 1) * TILE;
    if (inCastle && !kalinDead) kalinAlerted = true;
    if (kalinAlerted && !kalinDead) {
      if (!alarmOn) {
        alarmOn = true;
        world.kalinLockdown = true; // ворота захлопываются — придётся драться до конца
        AudioSys.alarmStart();
        AudioSys.stomp();
        toast("ТЫ В ЛОГОВЕ КАЛИНА-ЦАРЯ!", "#ff5540");
        announce("Ворота замка захлопнулись — придётся драться до конца!", "#ff5540");
      }
    } else if (alarmOn) {
      alarmOn = false;
      AudioSys.alarmStop();
    }
  }

  // Тёмный лес: волны Лона, щекотка, плевки ЯМЫ
  if (level === 2 && typeof l2Update === "function") l2Update(dt);

  // догорающая цепочка взрывов на месте павшего Калина
  if (kalinBoomT > 0) {
    kalinBoomT -= dt;
    kalinBoomTick -= dt;
    if (kalinBoomTick <= 0) {
      kalinBoomTick = 0.13;
      const bx = kalinBoomX + (Math.random() - 0.5) * 130,
        by = kalinBoomY + (Math.random() - 0.5) * 90;
      burst(bx, by, Math.random() < 0.5 ? "#ffd76e" : "#ff6a30", 14, 190, 80, 0.9);
      shake = Math.max(shake, 8);
      if (Math.random() < 0.4) AudioSys.stomp();
    }
  }
  if (kalinBannerT > 0) {
    kalinBannerT -= dt;
    if (kalinBannerT <= 0) {
      // победный экран ждал, пока догорит взрыв
      if (level === 2 && typeof l2Victory === "function") l2Victory();
      else checkVictory();
    }
  }

  // напоминание у запертых врат
  gateHintT = Math.max(0, gateHintT - dt);
  if (world.castle && !world.gateOpen && gateHintT <= 0) {
    const g = world.castle.gatePx;
    if (
      Math.hypot(player.x - (g.x0 + g.x1) / 2, player.y - (g.y0 + g.y1) / 2) <
      220
    ) {
      gateHintT = 7;
      addLog(
        "Врата замка заперты. Одолей всех четырёх воевод — и они отворятся!",
        "#ff9d7a",
      );
    }
  }

  updateEnemies(dt);
  updateAnimals(dt);
  updateWanderers(dt);
  updateHostages(dt);
  updateProjectiles(dt);

  // деревья — пружина изгиба
  for (const tr of world.trees) {
    if (tr.bend !== 0 || tr.bendV !== 0) {
      tr.bend += tr.bendV * dt;
      tr.bendV += (-tr.bend * 9 - tr.bendV * 2.6) * dt;
      if (Math.abs(tr.bend) < 0.001 && Math.abs(tr.bendV) < 0.001) {
        tr.bend = 0;
        tr.bendV = 0;
      }
    }
    if (tr.watered > 0) tr.watered -= dt;
  }

  // частицы и цифры
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.grav || 0) * dt;
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.t -= dt;
    if (f.t <= 0) {
      floaters.splice(i, 1);
      continue;
    }
    f.y += f.vy * dt;
  }

  shake = Math.max(0, shake - dt * 22);

  // камера
  camX = player.x - VW / 2;
  camY = player.y - VH / 2;
  camX = Math.max(0, Math.min(MAP_W * TILE - VW, camX));
  camY = Math.max(0, Math.min(MAP_H * TILE - VH, camY));

  // туман и миникарта
  fogTimer -= dt;
  if (fogTimer <= 0) {
    fogTimer = 0.12;
    updateFog();
  }
  miniTimer -= dt;
  if (miniTimer <= 0) {
    miniTimer = 0.4;
    drawMinimap();
  }

  // атмосфера — редкие тихие птицы и ветер, чтобы не раздражали
  birdTimer -= dt;
  if (birdTimer <= 0) {
    if (level === 2) {
      // в Тёмном лесу птицы не поют — шепоты, уханье, всхлипы, визги и смех
      birdTimer = 9 + Math.random() * 14;
      const r = Math.random();
      if (r < 0.24) AudioSys.whisper();
      else if (r < 0.44) AudioSys.owl();
      else if (r < 0.6) AudioSys.sob();
      else if (r < 0.76) AudioSys.raven();
      else if (r < 0.9) AudioSys.shriek();
      else AudioSys.evilLaugh();
    } else {
      birdTimer = 14 + Math.random() * 20;
      AudioSys.birds();
    }
  }
  windTimer -= dt;
  if (windTimer <= 0) {
    windTimer = 35 + Math.random() * 30;
    AudioSys.wind();
  }

  updateHUD();
}

// удар по цели: игроку или питомцу
function strikeTarget(target, dmg, srcX, srcY) {
  if (target === player) hurtPlayer(dmg, srcX, srcY);
  else hurtPet(target, dmg);
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.dead) continue;
    e.cd -= dt;
    e.spCd -= dt;
    e.hurtT = Math.max(0, e.hurtT - dt);
    e.swing = Math.max(0, (e.swing || 0) - dt / 0.3);
    if (e.grinding > 0) {
      e.grinding -= dt;
    }
    if (e.kind === "meat") e.hp = Math.min(e.maxHp, e.hp + 3 * dt); // мясо затягивает раны
    // укус тигра: враг кровит
    if (e.bleedT > 0) {
      e.bleedT -= dt;
      e.hp -= 6 * dt;
      if (Math.random() < dt * 4) burst(e.x, e.y - 20, "#8c1f16", 2, 40);
      if (e.hp <= 0) {
        killEnemy(e);
        continue;
      }
    }
    // ультразвук гигантской летучей мыши: враг оглушён
    if (e.stunT > 0) {
      e.stunT -= dt;
      e.walk = false;
      if (Math.random() < dt * 3)
        floater(e.x, e.y - 66, "✶", "#c9b4f0", 13);
      continue;
    }

    // цель: игрок или ближайший питомец; ~40% врагов рвутся именно к герою,
    // чтобы толпу нельзя было замкнуть на орду своих зверей
    const pd = Math.hypot(player.x - e.x, player.y - e.y);
    let target = player,
      td = pd;
    const aggro = e.isBoss ? 340 : e.kind === "likho" ? 320 : 260;
    if (!(e.prefPlayer && pd < aggro)) {
      for (const pet of player.pets) {
        if (pet.hp <= 0) continue;
        const d = Math.hypot(pet.x - e.x, pet.y - e.y);
        if (d < td) {
          td = d;
          target = pet;
        }
      }
    }
    // первая встреча — подпись врага крупно на экран
    if (pd < aggro + 80 && !metKinds.has(e.kind)) {
      metKinds.add(e.kind);
      const tag = ENCOUNTER[e.kind];
      if (tag)
        announce(
          "⚔ " + e.name + " — " + tag,
          e.kind === "likho" ? "#c9a0e8" : "#ff9d7a",
        );
    }

    // повадки нечисти Тёмного леса (level2.js); true — ход полностью обработан
    // (ЯМА живёт по своим законам всегда, остальные — только заметив добычу)
    if (
      level === 2 &&
      typeof L2AI !== "undefined" &&
      L2AI[e.kind] &&
      (e.kind === "yama" || td < (e.isBoss ? 340 : 280)) &&
      L2AI[e.kind](e, target, td, pd, dt)
    )
      continue;

    // отскок после броска (кот-баюн, орёл)
    if (e.fleeT > 0) {
      e.fleeT -= dt;
      const d = Math.hypot(e.x - target.x, e.y - target.y) || 1;
      e.walk = true;
      const fx = ((e.x - target.x) / d) * e.speed * 1.6 * dt,
        fy = ((e.y - target.y) / d) * e.speed * 1.6 * dt;
      if (e.kind === "eagle") {
        e.x += fx;
        e.y += fy;
      } else tryMove(e, fx, fy);
      e.face = fx > 0 ? 1 : -1;
      continue;
    }

    if (td < aggro) {
      e.face = target.x > e.x ? 1 : -1;
      const wpRange =
        e.kind === "koschei"
          ? 60
          : e.kind === "ogre"
            ? 66
            : e.kind === "chudo"
              ? 90
              : 52;

      // --- приёмы диких врагов ---
      if (e.kind === "kot") {
        if (e.purrT > 0) {
          // замер и мурлычет — сейчас прыгнет
          e.purrT -= dt;
          e.walk = false;
          if (e.purrT <= 0) {
            e.pounceT = 0.55;
            AudioSys.catScreech();
          }
          continue;
        }
        if (e.pounceT > 0) {
          // молниеносный бросок
          e.pounceT -= dt;
          const d = Math.hypot(target.x - e.x, target.y - e.y) || 1;
          tryMove(
            e,
            ((target.x - e.x) / d) * e.speed * 3.2 * dt,
            ((target.y - e.y) / d) * e.speed * 3.2 * dt,
          );
          e.walk = true;
          if (d < 50) {
            strikeTarget(target, e.dmg, e.x, e.y);
            floater(e.x, e.y - 60, "РАЗОДРАЛ!", "#ff5540", 15);
            e.pounceT = 0;
            e.fleeT = 1.5;
          }
          continue;
        }
        if (e.spCd <= 0 && td < 340 && td > 60) {
          e.spCd = 8;
          e.purrT = 0.85;
          AudioSys.purr();
          addLog(
            "Кот-баюн мурлычет — ужасно, до дрожи. Берегись броска!",
            "#c9a0e8",
          );
          continue;
        }
      }
      if (e.kind === "eagle") {
        if (e.swoopT > 0) {
          // пикирует
          e.swoopT -= dt;
          const d = Math.hypot(target.x - e.x, target.y - e.y) || 1;
          e.x += ((target.x - e.x) / d) * e.speed * 2.2 * dt;
          e.y += ((target.y - e.y) / d) * e.speed * 2.2 * dt;
          e.walk = true;
          if (d < 42) {
            strikeTarget(target, e.dmg, e.x, e.y);
            if (target === player) {
              player.bleedT = 4;
              addLog(
                "Орёл впился когтями — кровь течёт! Рана будет кровить.",
                "#ff9d7a",
              );
            }
            e.swoopT = 0;
            e.fleeT = 1.6;
          }
          continue;
        }
        if (e.spCd <= 0 && td < 380) {
          e.spCd = 6;
          e.swoopT = 1.1;
          AudioSys.eagleCry();
          floater(e.x, e.y - 60, "пикирует!", "#ff9d7a", 12);
          continue;
        }
        // кружит поодаль, паря над землёй
        const ca2 = gameTime * 0.9 + e.phase;
        const gx = target.x + Math.cos(ca2) * 170,
          gy = target.y + Math.sin(ca2) * 140;
        const d2 = Math.hypot(gx - e.x, gy - e.y) || 1;
        e.x += ((gx - e.x) / d2) * Math.min(e.speed, d2 * 2) * dt;
        e.y += ((gy - e.y) / d2) * Math.min(e.speed, d2 * 2) * dt;
        e.walk = true;
        continue;
      }
      if (e.kind === "archer") {
        if (td < 130) {
          // не подпускает — отбегает и стреляет
          const d = td || 1;
          e.walk = true;
          tryMove(
            e,
            ((e.x - target.x) / d) * e.speed * dt,
            ((e.y - target.y) / d) * e.speed * dt,
          );
        } else e.walk = false;
        if (
          e.spCd <= 0 &&
          td < 460 &&
          !wallBetween(e.x, e.y - 20, target.x, target.y - 20)
        ) {
          e.spCd = 2.4;
          e.swing = 1;
          AudioSys.arrow();
          const d = td || 1;
          projectiles.push({
            x: e.x,
            y: e.y - 26,
            vx: ((target.x - e.x) / d) * 420,
            vy: ((target.y - 20 - e.y + 26) / d) * 420,
            dmg: e.dmg,
            life: 1.4,
            kind: "arrow",
            spin: Math.atan2(target.y - 20 - e.y + 26, target.x - e.x),
          });
        }
        continue;
      }
      if (e.kind === "leshy") {
        // держится поодаль и колдует посохом
        if (td < 170) {
          const d = td || 1;
          e.walk = true;
          tryMove(
            e,
            ((e.x - target.x) / d) * e.speed * dt,
            ((e.y - target.y) / d) * e.speed * dt,
          );
        } else if (td > 380) {
          const d = td || 1;
          e.walk = true;
          tryMove(
            e,
            ((target.x - e.x) / d) * e.speed * dt,
            ((target.y - e.y) / d) * e.speed * dt,
          );
        } else e.walk = false;
        if (
          e.spCd <= 0 &&
          td < 420 &&
          !wallBetween(e.x, e.y - 20, target.x, target.y - 20)
        ) {
          e.spCd = 4.5;
          e.swing = 1;
          if (target === player && e.altCast && td < 320) {
            // оплетает корнями
            e.altCast = false;
            AudioSys.root();
            player.rooted = 1.4;
            burst(player.x, player.y, "#4e7a34", 12, 60, 40, 0.9);
            addLog(
              "Леший ударил посохом оземь — корни оплели ноги богатыря!",
              "#8fd06a",
            );
          } else {
            // зелёная волшба
            e.altCast = true;
            AudioSys.magic();
            const d = td || 1;
            projectiles.push({
              x: e.x,
              y: e.y - 30,
              vx: ((target.x - e.x) / d) * 300,
              vy: ((target.y - 20 - e.y + 30) / d) * 300,
              dmg: 13,
              life: 1.8,
              kind: "magic",
              spin: 0,
            });
          }
        }
        continue;
      }
      if (e.kind === "likho" && e.spCd <= 0 && td < 170 && target === player) {
        e.spCd = 7;
        e.pulseT = 0.9;
        AudioSys.paralyze();
        player.paralyzed = 1.5;
        addLog(
          "ЛИХО ГЛЯДИТ В УПОР! Тело каменеет — беги, как отпустит!",
          "#c9a0e8",
        );
        for (const pet of player.pets) pet.scared = 2; // зверьё шарахается
      }
      if (e.kind === "chudo" && e.spCd <= 0 && td < 150) {
        e.spCd = 5;
        AudioSys.stomp();
        shake = 12;
        addLog("Чудо-юдо всей тушей грянуло оземь!", "#ff9d7a");
        burst(e.x, e.y, "#3a3a44", 18, 140);
        if (Math.hypot(player.x - e.x, player.y - e.y) < 180)
          hurtPlayer(e.dmg, e.x, e.y);
        for (const pet of player.pets)
          if (pet.hp > 0 && Math.hypot(pet.x - e.x, pet.y - e.y) < 180)
            hurtPet(pet, e.dmg);
      }
      if (e.kind === "suka" && e.spCd <= 0 && td < 220 && td > 45) {
        e.spCd = 3.2;
        e.lungeT = 0.4;
        AudioSys.snarl();
      }
      if (e.lungeT > 0) {
        // рывок Суки
        e.lungeT -= dt;
        const d = Math.hypot(target.x - e.x, target.y - e.y) || 1;
        tryMove(
          e,
          ((target.x - e.x) / d) * e.speed * 2.8 * dt,
          ((target.y - e.y) / d) * e.speed * 2.8 * dt,
        );
        e.walk = true;
        if (d < 45) {
          strikeTarget(target, e.dmg, e.x, e.y);
          if (target === player) player.bleedT = Math.max(player.bleedT, 2.5);
          e.lungeT = 0;
        }
        continue;
      }
      if (e.kind === "govno") {
        e.dripT = (e.dripT || 0) - dt;
        if (e.dripT <= 0 && pools.length < 50) {
          // капает, отравляя землю
          e.dripT = 1.1;
          pools.push({
            x: e.x + (Math.random() - 0.5) * 12,
            y: e.y + 4,
            r: 32,
            t: 8,
            max: 8,
          });
          particles.push({
            x: e.x + (Math.random() - 0.5) * 14,
            y: e.y - 24,
            vx: 0,
            vy: 40,
            life: 0.5,
            maxLife: 0.5,
            color: "#5e421c",
            size: 3,
            grav: 160,
          });
        }
      }
      if (e.kind === "fascist" && !e.shouted) {
        e.shouted = true;
        floater(e.x, e.y - 66, "«Хальт!»", "#ff9d7a", 13);
        AudioSys.snarl();
      }

      // --- спецприёмы ---
      if (e.kind === "solovey" && e.spCd <= 0 && td < 420) {
        e.spCd = 7;
        AudioSys.whistle();
        addLog("Соловей-разбойник СВИСТИТ! Деревья гнутся к земле!", "#ff9d7a");
        shake = 12;
        e.whistleT = 1.2;
        for (const tr of world.trees) {
          const d = Math.hypot(tr.x - e.x, tr.y - e.y);
          if (d < 550 && tr.alive)
            tr.bendV +=
              (tr.x > e.x ? 1 : -1) *
              (7 - d / 100) *
              (0.7 + Math.random() * 0.5);
        }
        const dd = Math.hypot(player.x - e.x, player.y - e.y) || 1;
        if (dd < 430) {
          hurtPlayer(12);
          const push = 200 * (1 - dd / 460);
          // толчок по шагам с проверкой проходимости — чтобы не впечатать героя в стену или избу
          for (let s = 0; s < 8; s++)
            tryMove(
              player,
              (((player.x - e.x) / dd) * push) / 8,
              (((player.y - e.y) / dd) * push) / 8,
            );
        }
        continue;
      }
      if (e.kind === "polovets" && e.spCd <= 0 && td < 220) {
        e.spCd = 8;
        e.grinding = 1.0;
        AudioSys.grinder();
        addLog("Половец крутит МЯСОРУБКУ — вихрь сабельных ударов!", "#ff9d7a");
      }
      if (e.grinding > 0 && e.kind === "polovets") {
        const d = Math.hypot(target.x - e.x, target.y - e.y) || 1;
        e.x += ((target.x - e.x) / d) * e.speed * 1.8 * dt;
        e.y += ((target.y - e.y) / d) * e.speed * 1.8 * dt;
        e.swing = 1;
        if (d < 65 && e.cd <= 0) {
          e.cd = 0.16;
          if (target === player) hurtPlayer(5, e.x, e.y);
          else hurtPet(target, 5);
        }
        continue;
      }
      if (e.kind === "rosomaha" && e.spCd <= 0) {
        if (
          td > 140 &&
          td < 460 &&
          !wallBetween(e.x, e.y - 20, target.x, target.y - 20)
        ) {
          e.spCd = 4.5;
          AudioSys.axeThrow();
          const d = td || 1;
          projectiles.push({
            x: e.x,
            y: e.y - 30,
            vx: ((target.x - e.x) / d) * 380,
            vy: ((target.y - e.y - 20) / d) * 380,
            dmg: 16,
            life: 1.6,
            kind: "axe",
            spin: 0,
          });
          floater(e.x, e.y - 65, "бросок топора!", "#ff9d7a", 12);
        } else if (td <= 140) {
          e.spCd = 8;
          AudioSys.snarl();
          player.feared = 2.4;
          addLog(
            "Росомаха ОЩЕРИЛАСЬ! Ноги стынут от ужаса (скорость упала)...",
            "#ff9d7a",
          );
          e.snarlT = 0.8;
        }
      }
      if (
        e.kind === "koschei" &&
        e.spCd <= 0 &&
        td < 480 &&
        td > 90 &&
        target === player
      ) {
        e.spCd = 9.5;
        AudioSys.zombiePull();
        player.forced = 1.7;
        player.forcedSrc = e;
        addLog(
          "Кощей манит костлявым перстом — ноги сами несут тебя к нему!",
          "#c9a0e8",
        );
        e.pullT = 1.7;
      }
      if (e.kind === "kalin") {
        const raged = e.hp < e.maxHp * 0.2;
        if (raged && !e.raged) {
          e.raged = true;
          e.speed *= 1.2;
          announce("Калин в ярости!", "#ff3020");
        }
        if (!e.summoned && e.hp < e.maxHp * 0.5) {
          e.summoned = true;
          addLog(
            "Калин-царь ревёт: «Слуги мои, ко мне!» Стража врывается в залу!",
            "#ff9d7a",
          );
          for (let i = 0; i < 3; i++) {
            const g = mkEnemy("bandit", e.x - 80 + i * 80, e.y + 100, {
              name: "Ханский нукер",
              hp: 55,
              dmg: 10,
              speed: 125,
              weapon: "saber",
              xp: 30,
            });
            enemies.push(g);
            e.camp && e.camp.guards && e.camp.guards.push(g);
          }
        }
        if (raged && !e.summoned2) {
          e.summoned2 = true;
          addLog(
            "Калин-царь в ярости зовёт последних верных нукеров!",
            "#ff9d7a",
          );
          for (let i = 0; i < 3; i++) {
            const g = mkEnemy("bandit", e.x - 80 + i * 80, e.y + 100, {
              name: "Ханский нукер",
              hp: 55,
              dmg: 10,
              speed: 125,
              weapon: "saber",
              xp: 30,
            });
            enemies.push(g);
            e.camp && e.camp.guards && e.camp.guards.push(g);
          }
        }
        if (e.spCd <= 0 && td < 150) {
          e.spCd = raged ? 3 : 4.5;
          AudioSys.stomp();
          shake = 11;
          addLog("Калин-царь ТОПАЕТ — каменные плиты трескаются!", "#ff9d7a");
          if (td < 160) {
            hurtPlayer(28, e.x, e.y);
          }
          burst(e.x, e.y, "#8d8d85", 16, 130);
          // трещины остаются на земле и жгут даже того, кто увернулся от самого удара
          for (let c = 0; c < 2; c++) {
            const ca = Math.random() * 6.283;
            pools.push({
              x: e.x + Math.cos(ca) * (40 + Math.random() * 60),
              y: e.y + Math.sin(ca) * (40 + Math.random() * 60),
              r: 40,
              t: 3.5,
              max: 3.5,
              kind: "crack",
            });
          }
        } else if (
          e.spCd <= 0 &&
          td < 450 &&
          !wallBetween(e.x, e.y - 20, target.x, target.y - 20)
        ) {
          e.spCd = raged ? 2.2 : 3.5;
          const baseAng = Math.atan2(target.y - e.y - 30, target.x - e.x);
          const n = raged ? 3 : 2;
          const spread = raged ? 0.55 : 0.22;
          for (let i = 0; i < n; i++) {
            const off = n === 1 ? 0 : spread * (i / (n - 1) - 0.5) * 2;
            const a = baseAng + off;
            projectiles.push({
              x: e.x,
              y: e.y - 40,
              vx: Math.cos(a) * 340,
              vy: Math.sin(a) * 340,
              dmg: 15,
              life: 2.5,
              kind: "bone",
              spin: 0,
              homing: true,
              turnRate: 1.2,
            });
          }
          floater(e.x, e.y - 80, "швыряет кости!", "#ff9d7a", 12);
        }
      }

      // движение и обычный удар
      if (td > wpRange) {
        const d = td || 1;
        e.walk = true;
        let nx = ((target.x - e.x) / d) * e.speed * dt,
          ny = ((target.y - e.y) / d) * e.speed * dt;
        if (e.kind === "chert") {
          // вертлявый — мечется зигзагами
          const wig = Math.sin(gameTime * 9 + e.phase) * 0.9;
          const px2 = -(target.y - e.y) / d,
            py2 = (target.x - e.x) / d;
          nx += px2 * wig * e.speed * dt;
          ny += py2 * wig * e.speed * dt;
        }
        if (e.kind === "koschei") {
          e.x += nx;
          e.y += ny;
        } // ковёр летит над всем
        else tryMove(e, nx, ny);
        if (e.kind === "kalin") {
          // царь не покидает замок — за ворота его не выманить
          const cc = world.castle;
          e.x = Math.max((cc.x0 + 1.4) * TILE, Math.min((cc.x0 + cc.w - 1.4) * TILE, e.x));
          e.y = Math.max((cc.y0 + 1.4) * TILE, Math.min((cc.y0 + cc.h - 1.4) * TILE, e.y));
        }
      } else {
        e.walk = false;
        if (e.cd <= 0) {
          e.cd =
            e.kind === "ogre"
              ? 1.9
              : e.kind === "chert"
                ? 0.6
                : e.kind === "chudo"
                  ? 1.6
                  : 1.1;
          e.swing = 1;
          setTimeout(() => {
            if (e.dead) return;
            const dNow = Math.hypot(target.x - e.x, target.y - e.y);
            if (dNow < wpRange + 22) {
              if (e.kind === "ogre") {
                shake = Math.max(shake, 7);
                AudioSys.stomp();
              }
              if (target === player) hurtPlayer(e.dmg, e.x, e.y);
              else hurtPet(target, e.dmg);
            }
          }, 180);
        }
      }
    } else if (e.wild) {
      // дикий враг без цели — бродит по округе
      e.wanderT -= dt;
      if (e.wanderT <= 0) {
        e.wanderT = 2 + Math.random() * 3.5;
        e.dir = Math.random() * 6.283;
        e.moving = Math.random() < 0.55;
      }
      if (e.moving) {
        e.walk = true;
        const nx = Math.cos(e.dir) * e.speed * 0.35 * dt,
          ny = Math.sin(e.dir) * e.speed * 0.35 * dt;
        if (e.kind === "eagle") {
          e.x += nx;
          e.y += ny;
        } else tryMove(e, nx, ny);
        e.face = Math.cos(e.dir) > 0 ? 1 : -1;
        if (Math.hypot(e.x - e.home.x, e.y - e.home.y) > 600)
          e.dir = Math.atan2(e.home.y - e.y, e.home.x - e.x);
      } else e.walk = false;
    } else {
      // патруль у дома
      e.walk = false;
      const hd = Math.hypot(e.home.x - e.x, e.home.y - e.y);
      if (hd > 30) {
        e.walk = true;
        tryMove(
          e,
          ((e.home.x - e.x) / hd) * e.speed * 0.5 * dt,
          ((e.home.y - e.y) / hd) * e.speed * 0.5 * dt,
        );
        e.face = e.home.x > e.x ? 1 : -1;
      }
    }
    // рассредоточение: враги расталкиваются, не сбиваясь в одну кучу
    for (const o of enemies) {
      if (o === e || o.dead) continue;
      const dx = e.x - o.x,
        dy = e.y - o.y;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) continue;
      const d = Math.hypot(dx, dy);
      if (d < 30 && d > 0.1) tryMove(e, (dx / d) * 34 * dt, (dy / d) * 34 * dt);
    }
    if (e.whistleT) e.whistleT -= dt;
    if (e.snarlT) e.snarlT -= dt;
    if (e.pullT) e.pullT -= dt;
    if (e.pulseT) e.pulseT -= dt;
  }
}

function hurtPet(pet, dmg) {
  pet.hp -= dmg;
  burst(pet.x, pet.y - 12, "#c23b30", 4, 60);
  if (pet.hp <= 0) {
    pet.tamed = false;
    player.pets = player.pets.filter((x) => x !== pet);
    addLog(pet.name + " пал в бою... Верный был друг.", "#ff9d7a");
    AudioSys.enemyDie();
  }
}

function updateAnimals(dt) {
  for (let i = animals.length - 1; i >= 0; i--) {
    const a = animals[i];
    if (a.hp <= 0) {
      if (a === player.mount) player.mount = null; // скакун пал — герой на своих двоих
      animals.splice(i, 1);
      continue;
    }
    a.cd = Math.max(0, a.cd - dt);
    if (a === player.mount) {
      // зверь под седлом: несёт героя, своей воли не имеет
      // (y чуть меньше героя — рисуется под ним, герой сидит сверху)
      a.x = player.x;
      a.y = player.y - 3;
      a.face = player.face;
      a.walk = player.walk;
      continue;
    }
    if (a.tamed) {
      // соратник: атакует врагов рядом, иначе идёт за героем
      let target = null,
        bd = 340;
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < bd) {
          bd = d;
          target = e;
        }
      }
      if (target) {
        const d = Math.hypot(target.x - a.x, target.y - a.y) || 1;
        const fire = DRAGON_FIRE[a.sp];
        if (fire && d < fire.range && d > 55 && a.cd <= 0) {
          // дракон-соратник палит огнём с расстояния
          a.cd = 2.2;
          a.face = target.x > a.x ? 1 : -1;
          breatheFire(a, target.x, target.y - 20, fire, true);
        } else if (d > 46 + (target.r || 0)) {
          a.walk = true;
          tryMove(
            a,
            ((target.x - a.x) / d) * a.speed * dt,
            ((target.y - a.y) / d) * a.speed * dt,
          );
          a.face = target.x > a.x ? 1 : -1;
        } else {
          a.walk = false;
          if (a.cd <= 0) {
            a.cd = 1;
            hurtEnemy(target, a.dmg * (0.85 + Math.random() * 0.3), true);
            // повадки зверей Тёмного леса
            if (a.sp === "tiger" && !target.dead) {
              target.bleedT = Math.max(target.bleedT || 0, 3);
              floater(target.x, target.y - 60, "прокушен!", "#c23b30", 12);
            }
            if (a.sp === "gbat" && !target.dead && !target.isBoss) {
              target.stunT = Math.max(target.stunT || 0, 1.2);
              floater(target.x, target.y - 60, "оглушён ультразвуком!", "#c9b4f0", 12);
            }
          }
        }
      } else {
        const idx = player.pets.indexOf(a);
        const ang = 2.6 + idx * 0.9;
        const gx = player.x + Math.cos(ang) * 60,
          gy = player.y + Math.sin(ang) * 55;
        const d = Math.hypot(gx - a.x, gy - a.y);
        if (d > 26) {
          a.walk = true;
          tryMove(
            a,
            ((gx - a.x) / d) * Math.min(a.speed, d * 3) * dt,
            ((gy - a.y) / d) * Math.min(a.speed, d * 3) * dt,
          );
          a.face = gx > a.x ? 1 : -1;
        } else a.walk = false;
      }
      // соратник застрял (упёрся и не движется) или совсем потерялся —
      // прошмыгивает к герою сам: друзей на болоте не бросаем
      const pd2 = Math.hypot(a.x - player.x, a.y - player.y);
      if (a.walk && pd2 > 120) {
        const moved = Math.hypot(a.x - (a.lastX ?? a.x), a.y - (a.lastY ?? a.y));
        a.stuckT = moved < a.speed * dt * 0.3 ? (a.stuckT || 0) + dt : 0;
      } else a.stuckT = 0;
      a.lastX = a.x;
      a.lastY = a.y;
      if (a.stuckT > 2.5 || pd2 > 900) {
        for (let tries = 0; tries < 24; tries++) {
          const ang = Math.random() * 6.283;
          const nx = player.x + Math.cos(ang) * (50 + Math.random() * 45);
          const ny = player.y + Math.sin(ang) * (50 + Math.random() * 45);
          if (!world.passable(nx, ny)) continue;
          burst(a.x, a.y, "#9a9a80", 6, 60, 40, 0.5);
          a.x = nx;
          a.y = ny;
          a.stuckT = 0;
          burst(nx, ny, "#9a9a80", 6, 60, 40, 0.5);
          floater(nx, ny - 40, a.name + " догнал!", "#9fd08a", 11);
          break;
        }
      }
    } else if (a.angry > 0) {
      // разъярённый зверь мстит герою: дракон палит огнём, прочие кусают
      a.angry -= dt;
      const d = Math.hypot(player.x - a.x, player.y - a.y) || 1;
      a.face = player.x > a.x ? 1 : -1;
      const fire = DRAGON_FIRE[a.sp];
      if (fire && d < fire.range && d > 55) {
        a.walk = false;
        if (a.cd <= 0) {
          a.cd = 2.2;
          breatheFire(a, player.x, player.y - 20, fire, false);
        }
      } else if (d > 42) {
        a.walk = true;
        tryMove(
          a,
          ((player.x - a.x) / d) * a.speed * 1.1 * dt,
          ((player.y - a.y) / d) * a.speed * 1.1 * dt,
        );
      } else {
        a.walk = false;
        if (a.cd <= 0) {
          a.cd = 1.1;
          hurtPlayer(a.dmg, a.x, a.y);
        }
      }
      if (d > 700) a.angry = 0; // отстал — успокоился
    } else {
      // дикий: бродит; напуганный — бежит от игрока
      a.wanderT -= dt;
      if (a.wanderT <= 0) {
        a.wanderT = 1.5 + Math.random() * 3.5;
        a.dir = Math.random() * 6.283;
        a.moving = Math.random() < 0.6;
      }
      if (a.scared > 0) {
        a.scared -= dt;
        const d = Math.hypot(a.x - player.x, a.y - player.y) || 1;
        a.walk = true;
        tryMove(
          a,
          ((a.x - player.x) / d) * a.speed * 1.3 * dt,
          ((a.y - player.y) / d) * a.speed * 1.3 * dt,
        );
        a.face = a.x - player.x > 0 ? 1 : -1;
      } else if (a.moving) {
        a.walk = true;
        tryMove(
          a,
          Math.cos(a.dir) * a.speed * 0.35 * dt,
          Math.sin(a.dir) * a.speed * 0.35 * dt,
        );
        a.face = Math.cos(a.dir) > 0 ? 1 : -1;
        if (Math.hypot(a.x - a.homeX, a.y - a.homeY) > 500)
          a.dir = Math.atan2(a.homeY - a.y, a.homeX - a.x);
      } else a.walk = false;
    }
  }
}

function updateWanderers(dt) {
  for (const w of wanderers) {
    w.wanderT -= dt;
    if (w.wanderT <= 0) {
      w.wanderT = 2 + Math.random() * 4;
      w.dir = Math.random() * 6.283;
      w.moving = Math.random() < 0.7;
    }
    if (w.moving) {
      w.walk = true;
      tryMove(w, Math.cos(w.dir) * 45 * dt, Math.sin(w.dir) * 45 * dt);
      w.face = Math.cos(w.dir) > 0 ? 1 : -1;
    } else w.walk = false;
  }
}

function updateHostages(dt) {
  for (const h of hostages) {
    if (h.freed && !h.gone) {
      h.leaveT -= dt;
      h.y += 55 * dt;
      h.walkAway = true;
      if (h.leaveT <= 0) h.gone = true;
    }
  }
}

// дракон выдыхает струю огня в цель; fromPet=true — огонь соратника, жжёт врагов
function breatheFire(a, tx, ty, fire, fromPet) {
  AudioSys.fire();
  const d = Math.hypot(tx - a.x, ty - (a.y - 24)) || 1;
  projectiles.push({
    x: a.x + (tx > a.x ? 20 : -20) * (a.s || 1),
    y: a.y - 24 * (a.s || 1),
    vx: ((tx - a.x) / d) * fire.speed,
    vy: ((ty - (a.y - 24)) / d) * fire.speed,
    dmg: fire.dmg,
    life: fire.range / fire.speed + 0.1,
    kind: "fire",
    spin: 0,
    fromPet,
  });
  floater(a.x, a.y - 60 * (a.s || 1), "ОГОНЬ!", "#e8622a", 13);
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.kind !== "arrow") p.spin += dt * 14; // стрела летит остриём вперёд
    if (p.homing && running) {
      // плавно доворачивает к игроку — уклонение требует манёвра, а не подхода к стене
      const speed = Math.hypot(p.vx, p.vy) || 1;
      const curAng = Math.atan2(p.vy, p.vx);
      const wantAng = Math.atan2(player.y - p.y, player.x - p.x);
      let diff = wantAng - curAng;
      while (diff > Math.PI) diff -= 6.283;
      while (diff < -Math.PI) diff += 6.283;
      const maxTurn = p.turnRate * dt;
      const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
      const newAng = curAng + turn;
      p.vx = Math.cos(newAng) * speed;
      p.vy = Math.sin(newAng) * speed;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === "fire") {
      // огненный след
      particles.push({
        x: p.x + (Math.random() - 0.5) * 10,
        y: p.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        life: 0.35,
        maxLife: 0.35,
        color: Math.random() < 0.5 ? "#e8622a" : "#ffd23a",
        size: 2.5 + Math.random() * 2,
        grav: -30,
      });
    }
    if (p.life <= 0) {
      projectiles.splice(i, 1);
      continue;
    }
    // снаряды вязнут в стенах — сквозь замок не стреляют
    if (
      world.tileAt(Math.floor(p.x / TILE), Math.floor(p.y / TILE)) === T.WALL
    ) {
      burst(p.x, p.y, "#8d8d85", 4, 50);
      projectiles.splice(i, 1);
      continue;
    }
    if (p.fromPet) {
      // огонь соратника жжёт врагов
      let burned = false;
      for (const e of enemies) {
        if (e.dead) continue;
        if (Math.hypot(p.x - e.x, p.y - (e.y - 24)) < 30) {
          hurtEnemy(e, p.dmg, true);
          burst(e.x, e.y - 20, "#e8622a", 8, 80);
          burned = true;
          break;
        }
      }
      if (burned) projectiles.splice(i, 1);
      continue;
    }
    if (Math.hypot(p.x - player.x, p.y - (player.y - 20)) < 26) {
      hurtPlayer(p.dmg, p.x - p.vx, p.y - p.vy);
      if (p.kind === "fire") burst(player.x, player.y - 20, "#e8622a", 10, 90);
      projectiles.splice(i, 1);
    }
  }
}

// ---------- туман войны ----------
function updateFog(force) {
  const ptx = Math.floor(player.x / TILE),
    pty = Math.floor(player.y / TILE);
  const R = 9;
  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++) {
      if (dx * dx + dy * dy > R * R) continue;
      const x = ptx + dx,
        y = pty + dy;
      if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
      const i = y * MAP_W + x;
      if (!seen[i]) {
        seen[i] = 1;
        fogCtx.clearRect(x, y, 1, 1);
        fogCtx.fillStyle = "rgba(6,7,10,0.55)";
        fogCtx.fillRect(x, y, 1, 1);
      }
    }
}

// ---------- миникарта ----------
const MINI_COLORS = [
  "#5f9440",
  "#3f6e2e",
  "#2e5d8e",
  "#4a3f33",
  "#b08a50",
  "#8a7550",
  "#a08050",
  "#8d8d85",
  "#5a5a55",
  "#cbbb87",
  "#3d4a30",
];
function drawMinimap() {
  const mm = document.getElementById("minimap").getContext("2d");
  // обновляем открытые тайлы
  const img = mapMiniCtx;
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      const i = y * MAP_W + x;
      if (seen[i] === 1) {
        seen[i] = 2;
        img.fillStyle = MINI_COLORS[world.terrain[i]] || "#5f9440";
        img.fillRect(x, y, 1, 1);
      }
    }
  mm.fillStyle = "#0a0c08";
  mm.fillRect(0, 0, 180, 180);
  mm.imageSmoothingEnabled = false;
  mm.drawImage(mapMini, 0, 0, 180, 180);
  const sc = 180 / (MAP_W * TILE);
  for (const c of camps) {
    if (!seen[Math.floor(c.y / TILE) * MAP_W + Math.floor(c.x / TILE)])
      continue;
    mm.fillStyle = campCleared(c) ? "#8fd06a" : "#ff5540";
    mm.beginPath();
    mm.arc(c.x * sc, c.y * sc, 3, 0, 6.283);
    mm.fill();
  }
  for (const h of hostages) {
    if (h.gone || h.freed) continue;
    if (!seen[Math.floor(h.y / TILE) * MAP_W + Math.floor(h.x / TILE)])
      continue;
    mm.fillStyle = "#fff";
    mm.fillRect(h.x * sc - 1, h.y * sc - 1, 2, 2);
  }
  for (const pet of player.pets) {
    mm.fillStyle = "#9fd08a";
    mm.fillRect(pet.x * sc - 1, pet.y * sc - 1, 2.5, 2.5);
  }
  mm.fillStyle = "#ffd76e";
  mm.beginPath();
  mm.arc(player.x * sc, player.y * sc, 3.4, 0, 6.283);
  mm.fill();
  mm.strokeStyle = "#000";
  mm.lineWidth = 1;
  mm.stroke();
}

// ---------- HUD ----------
function updateHUD() {
  document.getElementById("hpbar").style.width =
    (player.hp / player.maxHp) * 100 + "%";
  document.getElementById("hplabel").textContent =
    Math.ceil(player.hp) + " / " + player.maxHp;
  document.getElementById("xpbar").style.width =
    (player.xp / player.xpNeed) * 100 + "%";
  document.getElementById("xplabel").textContent =
    "опыт " + player.xp + " / " + player.xpNeed;
  document.getElementById("lvl").textContent = "· ур. " + player.level;
  const wp = WEAPONS[player.weapon];
  document.getElementById("weaponline").textContent =
    "🗡 " +
    wp.name +
    " (урон " +
    Math.round(
      (wp.dmg * (1 + 0.25 * (player.forged || 0)) + player.level) *
        player.dmgMul,
    ) +
    ")" +
    (player.forged ? " ⚒" + player.forged : "") +
    (player.mount ? " · 🐎 верхом" : "");
  // соратники группируются (Лось×2), длинный список обрезается — панель не разрастается
  let petTxt = "";
  if (player.pets.length) {
    const counts = {};
    for (const p of player.pets) counts[p.name] = (counts[p.name] || 0) + 1;
    const groups = Object.keys(counts).map((n) => (counts[n] > 1 ? n + "×" + counts[n] : n));
    let s = "";
    let hidden = 0;
    for (let i = 0; i < groups.length; i++) {
      if (s.length + groups[i].length > 58) { hidden = groups.length - i; break; }
      s += (s ? ", " : "") + groups[i];
    }
    petTxt = "🐾 " + player.pets.length + ": " + s + (hidden ? " и ещё " + hidden + "…" : "");
  }
  document.getElementById("petline").textContent = petTxt;
  document.getElementById("stats").innerHTML =
    "Скорость: " +
    Math.round(player.speed) +
    " · Увёртливость: " +
    Math.round(player.dodge * 100) +
    "%" +
    "<br>Сила: ×" +
    player.dmgMul.toFixed(2) +
    " · Смекалка: " +
    player.smek +
    " · Брёвен: " +
    player.wood;
  // котомка: только то, что есть, с клавишей использования
  const inv = ITEM_DEFS.filter((d) => player.items[d.id] > 0)
    .map((d) => "[" + d.key + "] " + d.icon + "×" + player.items[d.id])
    .join("  ");
  document.getElementById("invline").textContent = inv ? "👜 " + inv : "";
  // панели не должны заслонять героя и бой: если герой под ними — тают
  const psx = player.x - camX,
    psy = player.y - camY;
  const underPanels = psx > VW - 260 && psy < 470;
  document.getElementById("minimapPanel").style.opacity = underPanels
    ? 0.15
    : 1;
  document.getElementById("objective").style.opacity = underPanels ? 0.15 : 1;
  const hudEl = document.getElementById("hud");
  const underHud = psx < 340 && psy < hudEl.offsetHeight + 80;
  hudEl.style.opacity = underHud ? 0.15 : 1;
  // полоса босса
  let boss = null,
    bd = 520;
  for (const e of enemies) {
    if (e.dead || !e.isBoss) continue;
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bd) {
      bd = d;
      boss = e;
    }
  }
  const bw = document.getElementById("bossbarWrap");
  if (boss) {
    bw.style.display = "block";
    document.getElementById("bossname").textContent = "☠ " + boss.name;
    document.getElementById("bosshp").style.width =
      (boss.hp / boss.maxHp) * 100 + "%";
  } else bw.style.display = "none";
}

// ---------- отрисовка ландшафта чанками ----------
const CHUNK = 8; // тайлов в чанке
function getChunk(cx, cy) {
  const key = cx + "_" + cy;
  let ch = chunkCache.get(key);
  if (ch) return ch;
  const c = document.createElement("canvas");
  c.width = CHUNK * TILE;
  c.height = CHUNK * TILE;
  const g = c.getContext("2d");
  const rnd = mulberry32(world.seed ^ (cx * 7919 + cy * 104729));
  for (let ty = 0; ty < CHUNK; ty++)
    for (let tx = 0; tx < CHUNK; tx++) {
      const wx = cx * CHUNK + tx,
        wy = cy * CHUNK + ty;
      const t = world.tileAt(wx, wy);
      const px = tx * TILE,
        py = ty * TILE;
      const v = rnd() * 0.08 - 0.04;
      switch (t) {
        case T.GRASS: {
          g.fillStyle = shade("#69a04a", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(45,80,30,0.5)";
          for (let k = 0; k < 4; k++) {
            const gx = px + rnd() * TILE,
              gy = py + rnd() * TILE;
            g.fillRect(gx, gy, 1.6, 4 + rnd() * 3);
          }
          if (rnd() < 0.06) {
            g.fillStyle = "#e8e14a";
            g.fillRect(px + rnd() * 34, py + rnd() * 34, 2.5, 2.5);
          }
          break;
        }
        case T.FOREST: {
          g.fillStyle = shade("#4d7c36", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(30,55,20,0.55)";
          for (let k = 0; k < 5; k++)
            g.fillRect(px + rnd() * TILE, py + rnd() * TILE, 3, 2);
          break;
        }
        case T.WATER: {
          g.fillStyle = shade("#3a6d9c", v);
          g.fillRect(px, py, TILE, TILE);
          g.strokeStyle = "rgba(255,255,255,0.14)";
          g.lineWidth = 1.4;
          const wy2 = py + 8 + rnd() * 22;
          g.beginPath();
          g.moveTo(px + 4, wy2);
          g.quadraticCurveTo(px + 12, wy2 - 3, px + 22, wy2);
          g.stroke();
          break;
        }
        case T.SAND:
          g.fillStyle = shade("#c4b078", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(120,100,60,0.4)";
          for (let k = 0; k < 3; k++)
            g.fillRect(px + rnd() * TILE, py + rnd() * TILE, 2, 2);
          break;
        case T.RAVINE: {
          g.fillStyle = shade("#3a3126", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(0,0,0,0.35)";
          g.fillRect(px, py, TILE, 6);
          g.strokeStyle = "rgba(90,75,55,0.5)";
          g.beginPath();
          g.moveTo(px, py + 14 + rnd() * 10);
          g.lineTo(px + TILE, py + 12 + rnd() * 14);
          g.stroke();
          break;
        }
        case T.BRIDGE_W:
        case T.BRIDGE_R: {
          g.fillStyle = t === T.BRIDGE_W ? "#3a6d9c" : "#3a3126";
          g.fillRect(px, py, TILE, TILE);
          for (let k = 0; k < 5; k++) {
            g.fillStyle = k % 2 ? "#8a6535" : "#7a5a2e";
            g.fillRect(px, py + k * 8 + 1, TILE, 6.5);
          }
          g.fillStyle = "#5e4426";
          g.fillRect(px, py, 3.4, TILE);
          g.fillRect(px + TILE - 3.4, py, 3.4, TILE);
          break;
        }
        case T.DIRT: {
          g.fillStyle = shade("#9c7f4e", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(120,95,55,0.5)";
          for (let k = 0; k < 3; k++)
            g.fillRect(px + rnd() * TILE, py + rnd() * TILE, 4, 2.5);
          break;
        }
        case T.STONE: {
          g.fillStyle = shade("#8d8d85", v);
          g.fillRect(px, py, TILE, TILE);
          g.strokeStyle = "rgba(60,60,55,0.5)";
          g.lineWidth = 1;
          g.strokeRect(px + 1, py + 1, TILE / 2 - 1, TILE / 2 - 1);
          g.strokeRect(
            px + TILE / 2,
            py + TILE / 2,
            TILE / 2 - 1,
            TILE / 2 - 1,
          );
          break;
        }
        case T.WALL:
          g.fillStyle = "#6a6a63";
          g.fillRect(px, py, TILE, TILE);
          break;
        case T.SWAMP: {
          // болото: бурая жижа, ряска, пузыри
          g.fillStyle = shade("#3d4a30", v);
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = "rgba(90,110,60,0.5)";
          for (let k = 0; k < 4; k++) {
            g.beginPath();
            g.ellipse(px + rnd() * TILE, py + rnd() * TILE, 4 + rnd() * 5, 2 + rnd() * 2, 0, 0, 6.283);
            g.fill();
          }
          g.fillStyle = "rgba(30,38,24,0.55)";
          g.beginPath();
          g.ellipse(px + rnd() * TILE, py + rnd() * TILE, 6 + rnd() * 6, 3.5, 0, 0, 6.283);
          g.fill();
          g.fillStyle = "rgba(200,220,180,0.25)";
          g.beginPath();
          g.arc(px + rnd() * TILE, py + rnd() * TILE, 1.4, 0, 6.283);
          g.fill();
          break;
        }
      }
      if (level === 2) {
        // Тёмный лес: вся земля тонет в холодном сумраке
        g.fillStyle = "rgba(14,8,30,0.5)";
        g.fillRect(px, py, TILE, TILE);
      }
    }
  ch = c;
  chunkCache.set(key, ch);
  if (chunkCache.size > 140) {
    const first = chunkCache.keys().next().value;
    chunkCache.delete(first);
  }
  return ch;
}
function shade(hex, d) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + Math.round(d * 255),
    gr = ((n >> 8) & 255) + Math.round(d * 255),
    b = (n & 255) + Math.round(d * 255);
  r = Math.max(0, Math.min(255, r));
  gr = Math.max(0, Math.min(255, gr));
  b = Math.max(0, Math.min(255, b));
  return "rgb(" + r + "," + gr + "," + b + ")";
}

// ---------- отрисовка ----------
function draw() {
  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  ctx.save();
  ctx.translate(-Math.round(camX + sx), -Math.round(camY + sy));

  // чанки земли
  const c0x = Math.floor(camX / (CHUNK * TILE)),
    c0y = Math.floor(camY / (CHUNK * TILE));
  const c1x = Math.floor((camX + VW) / (CHUNK * TILE)),
    c1y = Math.floor((camY + VH) / (CHUNK * TILE));
  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++) {
      if (cx < 0 || cy < 0 || cx * CHUNK >= MAP_W || cy * CHUNK >= MAP_H)
        continue;
      ctx.drawImage(getChunk(cx, cy), cx * CHUNK * TILE, cy * CHUNK * TILE);
    }

  // отравленные лужи/трещины Калина — прямо на земле, под всеми
  for (const pl of pools) {
    const a = Math.min(0.55, (pl.t / pl.max) * 0.7);
    if (pl.kind === "crack") {
      ctx.fillStyle = "rgba(60,20,10," + a + ")";
      ctx.beginPath();
      ctx.ellipse(pl.x, pl.y, pl.r, pl.r * 0.45, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle =
        "rgba(255,110,50," + (a * 0.8 + Math.sin(gameTime * 9 + pl.x) * 0.1) + ")";
      ctx.beginPath();
      ctx.ellipse(
        pl.x + Math.sin(gameTime * 3 + pl.x) * 2,
        pl.y,
        pl.r * 0.5,
        pl.r * 0.2,
        0,
        0,
        6.283,
      );
      ctx.fill();
      continue;
    }
    if (pl.kind === "oil") {
      // чёрный нефтяной след Чёрного
      ctx.fillStyle = "rgba(8,8,14," + Math.min(0.7, a + 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(pl.x, pl.y, pl.r, pl.r * 0.42, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "rgba(90,90,140," + a * 0.25 + ")";
      ctx.beginPath();
      ctx.ellipse(pl.x - 4, pl.y - 2, pl.r * 0.4, pl.r * 0.14, 0.3, 0, 6.283);
      ctx.fill();
      continue;
    }
    if (pl.kind === "fart") {
      // зловонное облако Великана
      const wob = Math.sin(gameTime * 1.8 + pl.x) * 6;
      ctx.fillStyle = "rgba(122,154,61," + a * 0.5 + ")";
      ctx.beginPath();
      ctx.ellipse(pl.x + wob, pl.y - 14, pl.r, pl.r * 0.6, 0, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "rgba(154,180,80," + a * 0.35 + ")";
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.ellipse(
          pl.x + Math.sin(gameTime * 2 + k * 2.1) * pl.r * 0.5,
          pl.y - 20 - k * 10 + Math.cos(gameTime * 1.5 + k) * 6,
          pl.r * 0.35,
          pl.r * 0.2,
          0,
          0,
          6.283,
        );
        ctx.fill();
      }
      continue;
    }
    ctx.fillStyle = "rgba(94,66,28," + a + ")";
    ctx.beginPath();
    ctx.ellipse(pl.x, pl.y, pl.r, pl.r * 0.45, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(122,154,61," + a * 0.7 + ")";
    ctx.beginPath();
    ctx.ellipse(
      pl.x + Math.sin(gameTime * 2 + pl.x) * 3,
      pl.y,
      pl.r * 0.55,
      pl.r * 0.24,
      0,
      0,
      6.283,
    );
    ctx.fill();
  }

  // убийственные волны Лона — кольца по земле (level2.js)
  if (level === 2 && typeof l2DrawWorld === "function") l2DrawWorld();

  // очередь отрисовки по Y (псевдо-3D)
  const q = [];
  const inView = (x, y, m = 120) =>
    x > camX - m && x < camX + VW + m && y > camY - m && y < camY + VH + m;

  for (const tr of world.trees)
    if (inView(tr.x, tr.y))
      q.push({ y: tr.y, f: () => drawTree(ctx, gameTime, tr, 0) });
  for (const p of world.props)
    if (inView(p.x, p.y))
      q.push({ y: p.y, f: () => drawProp(ctx, p, gameTime) });
  for (const b of world.buildings)
    if (inView(b.x, b.y))
      q.push({ y: b.y + b.h / 2, f: () => drawIzba(ctx, b, gameTime) });
  // стены замка как объёмные блоки (в Тёмном лесу замка нет)
  const ca = world.castle;
  if (ca) {
    for (let ty = ca.y0; ty < ca.y0 + ca.h; ty++)
      for (let tx = ca.x0; tx < ca.x0 + ca.w; tx++) {
        if (world.tileAt(tx, ty) !== T.WALL) continue;
        const wx = tx * TILE,
          wy = (ty + 1) * TILE;
        if (!inView(wx, wy)) continue;
        q.push({ y: wy - 2, f: () => drawWallBlock(wx, wy, tx, ty) });
      }
    // запертые врата замка
    if (!world.gateOpen) {
      const g = world.castle.gatePx;
      if (inView((g.x0 + g.x1) / 2, g.y1))
        q.push({ y: g.y1 - 2, f: () => drawGateDoors(g) });
    }
  }
  for (const it of groundItems)
    if (inView(it.x, it.y)) q.push({ y: it.y, f: () => drawGroundItem(it) });
  for (const h of hostages)
    if (!h.gone && inView(h.x, h.y))
      q.push({ y: h.y, f: () => drawHostage(h) });
  for (const w of wanderers)
    if (inView(w.x, w.y)) q.push({ y: w.y, f: () => drawWanderer(w) });
  for (const a of animals)
    if (inView(a.x, a.y)) q.push({ y: a.y, f: () => drawAnimal(a) });
  for (const e of enemies)
    if (!e.dead && inView(e.x, e.y)) q.push({ y: e.y, f: () => drawEnemy(e) });
  q.push({ y: player.y, f: drawPlayer });
  q.sort((a, b) => a.y - b.y);
  for (const it of q) it.f();

  // снаряды
  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === "arrow") {
      ctx.rotate(p.spin);
      ctx.strokeStyle = "#6e4f22";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.fillStyle = "#b8bfc9";
      ctx.beginPath();
      ctx.moveTo(10, -2.5);
      ctx.lineTo(15, 0);
      ctx.lineTo(10, 2.5);
      ctx.fill();
      ctx.fillStyle = "#d8d0b8";
      ctx.beginPath();
      ctx.moveTo(-12, -3);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-12, 3);
      ctx.fill();
    } else if (p.kind === "magic") {
      ctx.fillStyle = "rgba(127,232,106,0.35)";
      ctx.beginPath();
      ctx.arc(0, 0, 10 + Math.sin(gameTime * 12) * 2, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#7fe86a";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#d6ffc9";
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, 6.283);
      ctx.fill();
    } else if (p.kind === "fire") {
      ctx.fillStyle = "rgba(232,98,42,0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, 12 + Math.sin(gameTime * 18) * 3, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#e8622a";
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#ffd23a";
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, 6.283);
      ctx.fill();
    } else {
      ctx.rotate(p.spin);
      drawWeapon(ctx, p.kind === "axe" ? "axe" : "bone", 1.1);
    }
    ctx.restore();
  }

  // частицы
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    if (p.heart) {
      ctx.font = "11px serif";
      ctx.fillText("♥", p.x, p.y);
    } else ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  // всплывающие цифры
  for (const f of floaters) {
    ctx.globalAlpha = Math.min(1, f.t);
    ctx.font = "bold " + f.size + "px Verdana";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 3;
    ctx.strokeText(f.text, f.x - ctx.measureText(f.text).width / 2, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x - ctx.measureText(f.text).width / 2, f.y);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // туман войны
  drawFog();

  // тёплый свет + виньетка
  const vg = ctx.createRadialGradient(
    VW / 2,
    VH / 2,
    VH * 0.42,
    VW / 2,
    VH / 2,
    VH * 0.95,
  );
  vg.addColorStop(0, "rgba(255,235,180,0.05)");
  vg.addColorStop(1, "rgba(10,8,20,0.42)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VW, VH);
  if (player.hurtT > 0) {
    ctx.fillStyle = "rgba(180,20,10," + player.hurtT * 0.9 + ")";
    ctx.fillRect(0, 0, VW, VH);
  }
  if (player.feared > 0) {
    ctx.fillStyle = "rgba(60,10,80,0.12)";
    ctx.fillRect(0, 0, VW, VH);
  }
  if (player.forced > 0) {
    ctx.fillStyle = "rgba(40,120,60,0.10)";
    ctx.fillRect(0, 0, VW, VH);
  }
  if (alarmOn) {
    // логово Калина: пульсирующий багровый экран
    ctx.fillStyle =
      "rgba(140,20,10," + (0.1 + Math.sin(gameTime * 3.2) * 0.05) + ")";
    ctx.fillRect(0, 0, VW, VH);
    const ag = ctx.createRadialGradient(
      VW / 2,
      VH / 2,
      VH * 0.35,
      VW / 2,
      VH / 2,
      VH * 0.85,
    );
    ag.addColorStop(0, "rgba(0,0,0,0)");
    ag.addColorStop(
      1,
      "rgba(120,10,5," + (0.22 + Math.sin(gameTime * 3.2) * 0.08) + ")",
    );
    ctx.fillStyle = ag;
    ctx.fillRect(0, 0, VW, VH);
  }
  if (player.paralyzed > 0) {
    ctx.fillStyle = "rgba(120,120,140,0.16)";
    ctx.fillRect(0, 0, VW, VH);
    ctx.font = "bold 22px Georgia";
    ctx.fillStyle = "#c9c9e0";
    const pt = "ОЦЕПЕНЕНИЕ";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 4;
    ctx.strokeText(pt, VW / 2 - ctx.measureText(pt).width / 2, VH * 0.32);
    ctx.fillText(pt, VW / 2 - ctx.measureText(pt).width / 2, VH * 0.32);
  }
  if (player.rooted > 0) {
    ctx.fillStyle = "rgba(40,90,30,0.10)";
    ctx.fillRect(0, 0, VW, VH);
  }
  if (level === 2 && typeof l2DrawOverlay === "function") l2DrawOverlay();
  if (level === 2) {
    // Тёмный лес: холодный сумрак сгущается к краям экрана
    const vg = ctx.createRadialGradient(
      VW / 2,
      VH / 2,
      VH * 0.3,
      VW / 2,
      VH / 2,
      VH * 0.9,
    );
    vg.addColorStop(0, "rgba(8,4,20,0.1)");
    vg.addColorStop(1, "rgba(3,2,12,0.62)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VW, VH);
  }

  // смерть Калина — крупная надпись прямо в центре экрана, с плавным появлением/уходом
  if (kalinBannerT > 0) {
    const a = Math.max(
      0,
      Math.min(1, kalinBannerT > 3.6 ? (4.2 - kalinBannerT) / 0.6 : kalinBannerT / 1.1),
    );
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = "bold 52px Georgia";
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 8;
    ctx.strokeText(kalinBannerText, VW / 2, VH / 2 - 26);
    ctx.fillStyle = "#ffd76e";
    ctx.fillText(kalinBannerText, VW / 2, VH / 2 - 26);
    ctx.font = "italic 22px Georgia";
    ctx.lineWidth = 5;
    ctx.strokeText(kalinBannerSub, VW / 2, VH / 2 + 18);
    ctx.fillStyle = "#e8d9a8";
    ctx.fillText(kalinBannerSub, VW / 2, VH / 2 + 18);
    ctx.restore();
  }

  // стрелки к врагам за краем экрана — чтобы Соловей не резал соратников невидимкой
  for (const e of enemies) {
    if (e.dead) continue;
    if (Math.hypot(e.x - player.x, e.y - player.y) > 780) continue;
    const sx2 = e.x - camX,
      sy2 = e.y - camY - 30;
    if (sx2 > 30 && sx2 < VW - 30 && sy2 > 30 && sy2 < VH - 30) continue; // враг и так виден
    const ax = Math.max(28, Math.min(VW - 28, sx2)),
      ay = Math.max(28, Math.min(VH - 28, sy2));
    const ang = Math.atan2(sy2 - ay, sx2 - ax);
    const size = e.isBoss ? 13 : 9;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = e.isBoss ? "#c23bd6" : "#ff5540";
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.7, -size * 0.62);
    ctx.lineTo(-size * 0.7, size * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    if (e.isBoss) {
      ctx.font = "bold 11px Verdana";
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#e8b6f0";
      const nm = e.name;
      const tx2 = Math.max(
        6,
        Math.min(
          VW - ctx.measureText(nm).width - 6,
          ax - ctx.measureText(nm).width / 2,
        ),
      );
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText(nm, tx2, ay + (ay < VH / 2 ? 26 : -18));
      ctx.fillText(nm, tx2, ay + (ay < VH / 2 ? 26 : -18));
    }
    ctx.globalAlpha = 1;
  }
}

// запертые дубовые врата замка Калина
function drawGateDoors(g) {
  const w = g.x1 - g.x0,
    cx2 = (g.x0 + g.x1) / 2;
  ctx.save();
  ctx.translate(g.x0, g.y1);
  const H = 62;
  for (const half of [0, 1]) {
    // две створки
    const x0 = (half * w) / 2;
    ctx.fillStyle = half ? "#6e4f26" : "#7a582c";
    ctx.fillRect(x0, -H, w / 2, H);
    ctx.strokeStyle = "rgba(40,25,10,0.7)";
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x0 + (i * w) / 8, -H);
      ctx.lineTo(x0 + (i * w) / 8, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "#3d3128"; // железные полосы
    ctx.fillRect(x0, -H + 12, w / 2, 5);
    ctx.fillRect(x0, -18, w / 2, 5);
  }
  ctx.fillStyle = "#2b2b28"; // клёпки и замок
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(w / 12 + (i * w) / 6, -H + 14.5, 2, 0, 6.283);
    ctx.fill();
  }
  ctx.fillStyle = "#c9a94f";
  ctx.beginPath();
  ctx.arc(w / 2, -30, 5, 0, 6.283);
  ctx.fill();
  ctx.fillStyle = "#3d3128";
  ctx.fillRect(w / 2 - 1.6, -30, 3.2, 8);
  ctx.restore();
  // мерцающая надпись при приближении
  if (Math.hypot(player.x - cx2, player.y - g.y1) < 260) {
    ctx.font = "bold 13px Verdana";
    ctx.fillStyle =
      "rgba(255,157,122," + (0.7 + Math.sin(gameTime * 3) * 0.3) + ")";
    const txt = "🔒 Врата заперты — одолей всех воевод";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 3;
    ctx.strokeText(txt, cx2 - ctx.measureText(txt).width / 2, g.y1 - 78);
    ctx.fillText(txt, cx2 - ctx.measureText(txt).width / 2, g.y1 - 78);
  }
}

function drawFog() {
  if (fogFrame.width !== VW || fogFrame.height !== VH) {
    fogFrame.width = VW;
    fogFrame.height = VH;
  }
  const fc = fogFrameCtx;
  fc.clearRect(0, 0, VW, VH);
  fc.imageSmoothingEnabled = true;
  fc.drawImage(
    fogCanvas,
    camX / TILE,
    camY / TILE,
    VW / TILE,
    VH / TILE,
    0,
    0,
    VW,
    VH,
  );
  // видимый круг вокруг героя
  const px = player.x - camX,
    py = player.y - camY;
  const g = fc.createRadialGradient(px, py, 100, px, py, 330);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  fc.globalCompositeOperation = "destination-out";
  fc.fillStyle = g;
  fc.beginPath();
  fc.arc(px, py, 330, 0, 6.283);
  fc.fill();
  fc.globalCompositeOperation = "source-over";
  ctx.drawImage(fogFrame, 0, 0);
}

function drawWallBlock(wx, wy, tx, ty) {
  ctx.save();
  ctx.translate(wx, wy);
  const H = 58;
  ctx.fillStyle = "#75756d";
  ctx.fillRect(0, -H, TILE, H);
  ctx.fillStyle = "#8d8d85";
  ctx.fillRect(0, -H - 8, TILE, 10);
  ctx.strokeStyle = "rgba(45,45,40,0.6)";
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    ctx.beginPath();
    ctx.moveTo(0, -r * 14 - 6);
    ctx.lineTo(TILE, -r * 14 - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((r % 2) * 20 + 10, -r * 14 - 6);
    ctx.lineTo((r % 2) * 20 + 10, -r * 14 - 20);
    ctx.stroke();
  }
  // зубцы
  ctx.fillStyle = "#8d8d85";
  ctx.fillRect(2, -H - 18, 10, 12);
  ctx.fillRect(TILE - 12, -H - 18, 10, 12);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, -H, TILE, H * 0.35);
  // флаг Калина над случайными зубцами
  if ((tx * 31 + ty * 17) % 11 === 0) {
    ctx.strokeStyle = "#3d2c14";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, -H - 18);
    ctx.lineTo(8, -H - 44);
    ctx.stroke();
    ctx.fillStyle = "#8c1f16";
    const fl = Math.sin(gameTime * 4 + tx) * 3;
    ctx.beginPath();
    ctx.moveTo(8, -H - 44);
    ctx.quadraticCurveTo(24, -H - 42 + fl, 30, -H - 36 + fl);
    ctx.lineTo(8, -H - 32);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGroundItem(it) {
  ctx.save();
  ctx.translate(it.x, it.y);
  const pulse = 3 + Math.sin(gameTime * 3) * 2;
  ctx.fillStyle = "rgba(255,220,110,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 + pulse, 7 + pulse / 2, 0, 0, 6.283);
  ctx.fill();
  if (it.kind === "meat") {
    // кусок мяса на кости
    ctx.strokeStyle = "#e8dcc0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.lineTo(6, -6);
    ctx.stroke();
    ctx.fillStyle = "#e8dcc0";
    ctx.beginPath();
    ctx.arc(-9, 3, 2.5, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "#b3452e";
    ctx.beginPath();
    ctx.ellipse(4, -5, 8, 6, -0.5, 0, 6.283);
    ctx.fill();
    ctx.strokeStyle = "#8c2f1e";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    ctx.rotate(1.2);
    drawWeapon(ctx, it.kind, 1);
  }
  ctx.restore();
}

function drawPlayer() {
  humanoid(ctx, gameTime, {
    x: player.x + (player.mount ? 3 * player.face : 0),
    y: player.y - (player.mount ? 20 : 0), // верхом герой сидит на спине зверя
    riding: !!player.mount,

    s: 1.05,
    face: player.face,
    walk: player.walk,
    phase: 0,
    skin: "#e8b48f",
    shirt: player.hurtT > 0 ? "#d98a80" : "#7a8a99",
    pants: "#4a3a5e",
    boots: "#3d2c14",
    hair: "#c9a26a",
    beard: "#c9a26a",
    belt: "#8a6535",
    mail: true,
    headgear: "helm",
    cloak: "#a8231a",
    shieldBack: true,
    weapon: player.weapon,
    attack: player.swing > 0 ? 1 - player.swing : 0,
    armsForward: player.forced > 0,
  });
  if (player.forced > 0) {
    // зелёное кощеево наваждение
    ctx.fillStyle = "rgba(120,220,120,0.25)";
    ctx.beginPath();
    ctx.arc(player.x, player.y - 40, 14 + Math.sin(gameTime * 8) * 3, 0, 6.283);
    ctx.fill();
  }
}

function drawEnemy(e) {
  const t = gameTime;
  const atk = e.swing > 0 ? 1 - e.swing : 0;
  const common = {
    x: e.x,
    y: e.y,
    face: e.face,
    walk: e.walk,
    phase: e.phase,
    attack: atk,
  };
  // нечисть Тёмного леса рисует level2.js
  if (typeof L2DRAW !== "undefined" && L2DRAW[e.kind]) {
    L2DRAW[e.kind](e, common, t);
  } else
  switch (e.kind) {
    case "bandit":
      humanoid(ctx, t, {
        ...common,
        s: 0.95,
        skin: "#d8a578",
        shirt: e.hurtT ? "#c96a5a" : "#5e4a33",
        pants: "#3d3128",
        hair: "#2b1d0c",
        beard: "#2b1d0c",
        weapon: e.weapon,
      });
      break;
    case "solovey":
      humanoid(ctx, t, {
        ...common,
        s: 1.25,
        skin: "#b98d5e",
        shirt: e.hurtT ? "#a05540" : "#4a3418",
        pants: "#3a2a12",
        headS: 1.15,
        weapon: e.weapon,
        chub: "#14100a",
        drawFace: FACES.solovey,
      });
      if (e.whistleT > 0) {
        // кольца свиста
        for (let r = 0; r < 3; r++) {
          const rr = (1.2 - e.whistleT + r * 0.28) * 380;
          if (rr > 0) {
            ctx.strokeStyle =
              "rgba(220,240,255," + Math.max(0, 0.5 - rr / 800) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y - 40, rr, 0, 6.283);
            ctx.stroke();
          }
        }
      }
      break;
    case "polovets":
      humanoid(ctx, t, {
        ...common,
        s: 1.15,
        skin: "#d8a878",
        shirt: e.hurtT ? "#c96a5a" : "#8a5e30",
        pants: "#4a3320",
        belt: "#c9a94f",
        headgear: "furhat",
        mustache: "#1c1208",
        weapon: e.weapon,
        attack: e.grinding > 0 ? (Math.sin(t * 40) + 1) / 2 : atk,
      });
      if (e.grinding > 0) {
        ctx.strokeStyle = "rgba(220,225,235,0.55)";
        ctx.lineWidth = 2.5;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(
            e.x,
            e.y - 30,
            34 + r * 9,
            t * 14 + r * 2,
            t * 14 + r * 2 + 2.2,
          );
          ctx.stroke();
        }
      }
      break;
    case "rosomaha":
      humanoid(ctx, t, {
        ...common,
        s: 1.1,
        skin: "#c9a26a",
        shirt: e.hurtT ? "#a05540" : "#5e4426",
        pants: "#4a3418",
        cloak: "#6e4f26",
        headgear: "hood",
        headS: 1.05,
        weapon: "axe",
        drawFace: FACES.rosomaha,
      });
      if (e.snarlT > 0) {
        ctx.font = "bold 15px serif";
        ctx.fillStyle = "rgba(255,80,60," + e.snarlT + ")";
        ctx.fillText("РРРР!", e.x - 18, e.y - 78);
      }
      break;
    case "koschei": {
      const hover = Math.sin(t * 2.5 + e.phase) * 5;
      ctx.save();
      ctx.translate(0, -18 + hover);
      drawProp(ctx, { type: "carpet", x: e.x, y: e.y }, t);
      humanoid(ctx, t, {
        ...common,
        y: e.y - 6,
        s: 1.1,
        skin: "#9fb87a",
        shirt: e.hurtT ? "#7a9a5a" : "#2c3a2e",
        pants: "#232d24",
        headS: 1.0,
        drawFace: FACES.koschei,
        armsForward: e.pullT > 0,
      });
      ctx.restore();
      shadow(ctx, e.x, e.y + 4, 22);
      if (e.pullT > 0) {
        // зелёная нить наваждения к герою
        ctx.strokeStyle = "rgba(130,230,130,0.5)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 7]);
        ctx.lineDashOffset = -t * 60;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y - 55);
        ctx.lineTo(player.x, player.y - 30);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;
    }
    case "kalin":
      humanoid(ctx, t, {
        ...common,
        s: 1.65,
        skin: "#d8a878",
        shirt: e.hurtT ? "#c96a5a" : "#7a1f4a",
        pants: "#3d2c14",
        belly: true,
        belt: "#c9a94f",
        headgear: "crown",
        beard: "#1c1208",
        headS: 1.1,
        weapon: "bone",
        drawFace: FACES.kalin,
      });
      break;
    case "meat": // человек без кожи
      humanoid(ctx, t, {
        ...common,
        s: 0.95,
        skin: "#b3271d",
        shirt: e.hurtT ? "#d84a3a" : "#a8231a",
        pants: "#8c3a30",
        boots: "#5e120c",
        stripes: "#7a1210",
        drawFace: FACES.meat,
      });
      break;
    case "govno": // капает и отравляет землю
      humanoid(ctx, t, {
        ...common,
        s: 1.0,
        skin: "#6b4a1e",
        shirt: e.hurtT ? "#8a5e2a" : "#5e421c",
        pants: "#4a3416",
        boots: "#3d2c12",
        drawFace: FACES.govno,
      });
      break;
    case "leshy":
      humanoid(ctx, t, {
        ...common,
        s: 1.15,
        skin: "#7a8a5a",
        shirt: e.hurtT ? "#6a7a4a" : "#4e5c34",
        pants: "#3d4a26",
        hair: "#4e7a34",
        beard: "#4e7a34",
        weapon: "staff",
        drawFace: FACES.leshy,
      });
      break;
    case "kot":
      quadruped(ctx, t, {
        ...common,
        s: 1.05,
        body: e.hurtT ? "#5a4a56" : "#3a3a46",
        head: "#3a3a46",
        snout: "#5a5a66",
        legC: "#2b2b34",
        tailW: 4,
        catFace: true,
      });
      if (e.purrT > 0) {
        // кольца жуткого мурлыканья
        for (let r = 0; r < 3; r++) {
          ctx.strokeStyle = "rgba(201,160,232," + (0.5 - r * 0.14) + ")";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y - 26, 26 + r * 13 + Math.sin(t * 10) * 4, 0, 6.283);
          ctx.stroke();
        }
      }
      break;
    case "eagle":
      drawEagle(ctx, t, { ...common, s: 1.05, swoop: e.swoopT > 0 });
      break;
    case "fascist":
      humanoid(ctx, t, {
        ...common,
        s: 1.0,
        skin: "#e0b890",
        shirt: e.hurtT ? "#6a6d5a" : "#4a4d3f",
        pants: "#3a3d32",
        boots: "#1c1c18",
        belt: "#1c1c18",
        headgear: "stahlhelm",
        mustache: "#1c1208",
        weapon: "knife",
      });
      break;
    case "archer":
      humanoid(ctx, t, {
        ...common,
        s: 0.95,
        skin: "#d8a578",
        shirt: e.hurtT ? "#8a7040" : "#5e5030",
        pants: "#3d3128",
        hair: "#2b1d0c",
        weapon: "bow",
      });
      break;
    case "likho":
      humanoid(ctx, t, {
        ...common,
        s: 1.35,
        skin: "#9a9a92",
        shirt: e.hurtT ? "#5a5a56" : "#3a3a38",
        pants: "#2b2b28",
        headS: 1.2,
        drawFace: FACES.likho,
      });
      if (e.pulseT > 0) {
        // волна оцепенения
        ctx.strokeStyle =
          "rgba(200,200,220," + Math.max(0, e.pulseT * 0.6) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y - 40, (0.9 - e.pulseT) * 200, 0, 6.283);
        ctx.stroke();
      }
      break;
    case "ogre": // лысый, с толстым волосатым животом и огромной дубиной
      humanoid(ctx, t, {
        ...common,
        s: 1.45,
        skin: "#d8a878",
        shirt: e.hurtT ? "#e8b88a" : "#d8a878",
        pants: "#4a3418",
        belly: true,
        bellyC: "#e0b285",
        hairyBelly: true,
        weapon: "bigclub",
      });
      break;
    case "chudo":
      drawChudo(ctx, t, { ...common, s: 1.55 });
      break;
    case "chert": // разных цветов, вертлявый
      humanoid(ctx, t, {
        ...common,
        s: 0.8,
        skin: e.tint || "#8c1f16",
        shirt: e.tint || "#8c1f16",
        pants: e.tint || "#8c1f16",
        barefoot: true,
        headS: 1.1,
        drawFace: FACES.chert,
      });
      // хвост с кисточкой
      ctx.strokeStyle = e.tint || "#8c1f16";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(e.x - 8 * e.face, e.y - 12);
      ctx.quadraticCurveTo(
        e.x - 20 * e.face,
        e.y - 16 + Math.sin(t * 8) * 5,
        e.x - 24 * e.face,
        e.y - 26 + Math.cos(t * 7) * 4,
      );
      ctx.stroke();
      ctx.fillStyle = "#14100a";
      ctx.beginPath();
      ctx.moveTo(e.x - 24 * e.face, e.y - 30 + Math.cos(t * 7) * 4);
      ctx.lineTo(e.x - 28 * e.face, e.y - 24 + Math.cos(t * 7) * 4);
      ctx.lineTo(e.x - 21 * e.face, e.y - 23 + Math.cos(t * 7) * 4);
      ctx.fill();
      break;
    case "suka": // костлявая, с пёсьей головой и кровью из пасти
      quadruped(ctx, t, {
        ...common,
        s: 0.95,
        body: e.hurtT ? "#c9b8a8" : "#b0a89a",
        head: "#b0a89a",
        snout: "#8a8275",
        legC: "#8a8275",
        tailW: 3,
        ribs: true,
        bloodMouth: true,
      });
      break;
  }
  // полоса здоровья над врагом (Лихо неубиваемо — полосы не имеет)
  if (e.hp < e.maxHp && e.kind !== "likho" && !e.invuln) {
    const w = e.isBoss ? 52 : 34,
      hh = e.isBoss ? 6 : 4,
      oy =
        e.barOy ||
        (e.kind === "kalin" ? 118 : e.kind === "chudo" ? 92 : e.isBoss ? 92 : 72);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(e.x - w / 2 - 1, e.y - oy - 1, w + 2, hh + 2);
    ctx.fillStyle = e.isBoss ? "#c23bd6" : "#c23b30";
    ctx.fillRect(e.x - w / 2, e.y - oy, w * Math.max(0, e.hp / e.maxHp), hh);
  }
}

function drawAnimal(a) {
  const t = gameTime;
  const o = {
    x: a.x,
    y: a.y,
    face: a.face,
    walk: a.walk,
    phase: a.phase,
    s: a.s,
    body: a.body,
    head: a.head,
    snout: a.snout,
    legC: a.legC,
    horns: a.horns,
    mane: a.mane,
    tailC: a.tailC,
    tailW: a.tailW,
    belly: a.belly,
    wing: a.wing,
    crest: a.crest,
    tigerStripes: a.tigerStripes,
  };
  // звери Тёмного леса со своей рисовкой (level2.js)
  if (typeof L2ANIMDRAW !== "undefined" && L2ANIMDRAW[a.draw]) {
    L2ANIMDRAW[a.draw](o, t);
  } else
  switch (a.draw) {
    case "bird":
      drawBird(ctx, t, o);
      break;
    case "kikimora":
      drawKikimora(ctx, t, o);
      break;
    case "zhopa":
      drawZhopa(ctx, t, o);
      break;
    case "dragon":
      drawDragon(ctx, t, o);
      break;
    default:
      quadruped(ctx, t, o);
  }
  if (a.tamed) {
    ctx.fillStyle = "#9fd08a";
    ctx.font = "11px Verdana";
    ctx.fillText("●", a.x - 3, a.y - 52 * a.s - 8);
    if (a.hp < a.maxHp) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(a.x - 16, a.y - 50 * a.s, 32, 4);
      ctx.fillStyle = "#8fd06a";
      ctx.fillRect(a.x - 15, a.y - 50 * a.s + 1, 30 * (a.hp / a.maxHp), 2);
    }
  }
}

function drawHostage(h) {
  const t = gameTime;
  if (h.type === "child") {
    humanoid(ctx, t, {
      x: h.x,
      y: h.y,
      s: 0.62,
      face: 1,
      walk: h.walkAway,
      phase: h.phase,
      skin: "#f0c8a0",
      shirt: "#d8d0b8",
      pants: "#b8a888",
      barefoot: true,
      hair: "#f0e8b0",
      headS: 1.2,
      armsForward: !h.freed,
    });
  } else if (h.type === "monk") {
    humanoid(ctx, t, {
      x: h.x,
      y: h.y,
      s: 0.95,
      face: 1,
      walk: h.walkAway,
      phase: h.phase,
      skin: "#e0c09a",
      shirt: "#4a3a26",
      dress: "#3d3020",
      barefoot: true,
      beard: "#b8b0a0",
      armsForward: !h.freed,
    });
    ctx.fillStyle = "#c9a94f"; // наперсный крест
    ctx.fillRect(h.x - 1.5, h.y - 46, 3, 9);
    ctx.fillRect(h.x - 4, h.y - 43, 8, 3);
  } else if (h.pretty) {
    // краса писаная: коса, румянец, алый сарафан в талию
    humanoid(ctx, t, {
      x: h.x,
      y: h.y,
      s: 0.94,
      face: 1,
      walk: h.walkAway,
      phase: h.phase,
      skin: "#f5d2ac",
      shirt: "#d64a72",
      dress: "#c22550",
      barefoot: true,
      hair: "#f0d890",
      headgear: "kokoshnik",
      armsForward: !h.freed,
    });
    const s2 = 0.94;
    ctx.strokeStyle = "#e8c860";
    ctx.lineWidth = 3.5; // длинная коса с перевивами
    ctx.beginPath();
    ctx.moveTo(h.x - 6 * s2, h.y - 52 * s2);
    ctx.quadraticCurveTo(
      h.x - 12 * s2,
      h.y - 38 * s2 + Math.sin(t * 2 + h.phase) * 1.5,
      h.x - 10 * s2,
      h.y - 20 * s2,
    );
    ctx.stroke();
    ctx.strokeStyle = "#c22550";
    ctx.lineWidth = 1.2;
    for (let i = 1; i < 4; i++) {
      const yy = h.y - 52 * s2 + i * 8;
      ctx.beginPath();
      ctx.moveTo(h.x - 8 * s2 - i, yy);
      ctx.lineTo(h.x - 12 * s2 - i * 0.5, yy + 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(232,90,122,0.55)"; // румянец и алые губы
    ctx.beginPath();
    ctx.arc(h.x + 1 * s2, h.y - 52 * s2, 1.7, 0, 6.283);
    ctx.arc(h.x + 8 * s2, h.y - 52 * s2, 1.7, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "#c22540";
    ctx.beginPath();
    ctx.ellipse(h.x + 4.5 * s2, h.y - 49 * s2, 2.2, 1.1, 0, 0, 6.283);
    ctx.fill();
  } else {
    humanoid(ctx, t, {
      x: h.x,
      y: h.y,
      s: 0.92,
      face: 1,
      walk: h.walkAway,
      phase: h.phase,
      skin: "#f0c8a0",
      shirt: "#c46a6a",
      dress: "#a8425e",
      barefoot: true,
      hair: "#e8d080",
      headgear: "kokoshnik",
      armsForward: !h.freed,
    });
  }
  if (!h.freed) {
    // верёвки
    ctx.strokeStyle = "#b09468";
    ctx.lineWidth = 2.5;
    const s = h.type === "child" ? 0.62 : 0.92;
    ctx.beginPath();
    ctx.moveTo(h.x - 10 * s, h.y - 24 * s);
    ctx.lineTo(h.x + 10 * s, h.y - 18 * s);
    ctx.moveTo(h.x - 10 * s, h.y - 16 * s);
    ctx.lineTo(h.x + 10 * s, h.y - 22 * s);
    ctx.stroke();
    if (
      Math.hypot(h.x - player.x, h.y - player.y) < 110 &&
      campCleared(h.camp)
    ) {
      ctx.fillStyle = "#ffd76e";
      ctx.font = "bold 12px Verdana";
      const txt = "E — освободить";
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText(txt, h.x - 45, h.y - 62);
      ctx.fillText(txt, h.x - 45, h.y - 62);
    }
  }
}

function drawWanderer(w) {
  if (w.type && typeof l2DrawWanderer === "function")
    return l2DrawWanderer(w); // лесные жители выглядят по-своему
  humanoid(ctx, gameTime, {
    x: w.x,
    y: w.y,
    s: 0.95,
    face: w.face,
    walk: w.walk,
    phase: w.phase,
    skin: "#e0b890",
    shirt: "#8a8070",
    pants: "#5e5648",
    hair: "#d8d8d0",
    beard: "#d8d8d0",
    weapon: null,
  });
  // посох
  ctx.strokeStyle = "#6e4f26";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w.x + 12 * w.face, w.y - 40);
  ctx.lineTo(w.x + 14 * w.face, w.y);
  ctx.stroke();
}

// ---------- цикл ----------
let lastT = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  if (running) {
    const menuOpen = menuEl.style.display === "block";
    if (!menuOpen) update(dt); // пока меню открыто — мир замирает, никто не подкрадётся
    draw();
    if (menuOpen) {
      ctx.fillStyle = "rgba(5,6,10,0.22)";
      ctx.fillRect(0, 0, VW, VH);
      ctx.font = "bold 15px Georgia";
      ctx.fillStyle = "#e8d9a8";
      const pt = "⏸ мир замер — выбери действие";
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText(pt, VW / 2 - ctx.measureText(pt).width / 2, 64);
      ctx.fillText(pt, VW / 2 - ctx.measureText(pt).width / 2, 64);
    }
  }
  requestAnimationFrame(frame);
}

document.getElementById("startBtn").onclick = startGame;
const nameInputEl = document.getElementById("nameInput");
if (nameInputEl) {
  nameInputEl.value = playerName;
  nameInputEl.onkeydown = (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") startGame();
  };
}
newGame();
draw();
requestAnimationFrame(frame);
