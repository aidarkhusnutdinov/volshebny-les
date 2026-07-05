// ===== Тестовая настройка для test-kalin.html =====
// Догоняет героя до 11 уровня, даёт хорошее оружие и приручает 12 зверей
// (по одному каждого вида) сразу у ворот замка. Срабатывает при каждом
// newGame() — в том числе после смерти/победы, — чтобы после "Новый поход"
// не приходилось прокачиваться заново вручную.
'use strict';
(function () {
  const LEVEL = 11;
  const WEAPON = 'mace'; // булава — весомое стартовое оружие

  function boostPlayer() {
    // повторяем формулы роста из gainXP(), просто одним прыжком до 11 уровня
    const levels = LEVEL - player.level;
    player.level = LEVEL;
    player.maxHp = 120 + 18 * (LEVEL - 1);
    player.hp = player.maxHp;
    player.speed = Math.min(255, 150 + 7 * (LEVEL - 1));
    player.dmgMul = 1 + 0.09 * (LEVEL - 1);
    player.dodge = Math.min(0.35, 0.05 + 0.035 * (LEVEL - 1));
    player.xpNeed = Math.round(110 * Math.pow(1.25, player.level - 1));
    player.xp = 0;
    player.weapon = WEAPON;
    player.smek = 5; // немного смекалки — не мешает тестам
  }

  let petCount = 12; // сколько зверей в отряде — задаётся полем на стартовом экране

  function readPetCount() {
    const inp = document.getElementById('petCountInput');
    if (!inp) return; // после смерти/победы оверлей перерисован без поля — берём прошлое значение
    const v = parseInt(inp.value, 10);
    if (!isNaN(v)) petCount = Math.max(0, Math.min(60, v));
  }

  function spawnEscort() {
    // убираем прежний эскорт (setup может выполняться повторно — при старте и после newGame)
    for (let i = animals.length - 1; i >= 0; i--)
      if (animals[i].testEscort) animals.splice(i, 1);
    player.pets = [];
    const kinds = Object.keys(ANIMALS); // 12 видов — идут по кругу
    for (let i = 0; i < petCount; i++) {
      const sp = kinds[i % kinds.length];
      const ang = (i / Math.max(1, petCount)) * Math.PI * 2;
      const a = {
        sp,
        ...JSON.parse(JSON.stringify(ANIMALS[sp])),
        x: player.x + Math.cos(ang) * 90,
        y: player.y + Math.sin(ang) * 90,
        face: 1,
        walk: false,
        phase: Math.random() * 6,
        wanderT: Math.random() * 3,
        dir: Math.random() * 6.283,
        tamed: true,
        tameBonus: 1,
        scared: 0,
        cd: 0,
        maxHp: ANIMALS[sp].hp,
        homeX: player.x,
        homeY: player.y,
        testEscort: true,
      };
      animals.push(a);
      player.pets.push(a);
    }
  }

  function positionAtGate() {
    if (!world.castle) return;
    player.x = world.castle.cx;
    player.y = world.castle.cy + ((world.castle.h / 2) * TILE) + 60;
  }

  function setupTestScenario() {
    readPetCount();
    positionAtGate();
    boostPlayer();
    spawnEscort();
    addLog(
      '[ТЕСТ] Герой на ' + LEVEL + ' уровне, при оружии, с ' + player.pets.length + ' зверями. Только Калин и замок.',
      '#9fd08a',
    );
  }

  const origNewGame = newGame;
  newGame = function () {
    origNewGame();
    setupTestScenario();
  };

  // при нажатии «В ПУТЬ» пере-применяем настройку: игрок мог поменять число зверей
  const origStartGame = startGame;
  startGame = function () {
    origStartGame();
    setupTestScenario();
  };
  document.getElementById('startBtn').onclick = startGame; // кнопка была привязана к старому startGame

  // newGame() из game.js уже отработал один раз при загрузке скрипта —
  // применяем настройку сразу же, не дожидаясь следующего вызова.
  setupTestScenario();
})();
