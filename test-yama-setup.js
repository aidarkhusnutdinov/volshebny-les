// ===== Тестовая настройка для test-yama.html =====
// Сразу бой с ЯМОЙ: четверо хозяев леса считаются поверженными, ЯМА пробуждена.
// Герой 15-го уровня с булавой, конём и медведем стоит у самого провала,
// в котомке снедь, за плечами брёвна для ковки.
// После смерти/победы «В ПУТЬ» пересоздаёт лес и настраивает всё заново.
'use strict';
(function () {
  const LEVEL = 15;
  const WEAPON = 'mace';

  function boostPlayer() {
    player.level = LEVEL;
    player.maxHp = 120 + 18 * (LEVEL - 1);
    player.hp = player.maxHp;
    player.speed = Math.min(255, 150 + 7 * (LEVEL - 1));
    player.dmgMul = 1 + 0.09 * (LEVEL - 1);
    player.dodge = Math.min(0.35, 0.05 + 0.035 * (LEVEL - 1));
    player.xpNeed = Math.round(110 * Math.pow(1.22, LEVEL - 1));
    player.xp = Math.round(player.xpNeed * 0.4); // запас опыта — до 16-го рукой подать
    player.weapon = WEAPON;
    player.smek = 8;
    player.wood = 3; // на все три закалки у костра
    player.forged = 0;
    player.items = {
      berries: 4, mushroom: 1, fish: 0, honey: 2,
      bouquet: 2, meat: 2, kljukva: 4, gnilushka: 3,
    };
    // конь и медведь пройдут в лес через снапшот (snapshotHero берёт sp из pets)
    player.pets = [
      { sp: 'horse', hp: 1 },
      { sp: 'bear', hp: 1 },
    ];
    player.mount = null;
  }

  function setupTest() {
    boostPlayer();
    l2HeroSnap = null; // снапшот пересоберётся из прокачанного героя
    startLevel2();

    // четверо хозяев леса считаются поверженными — убираем их, ЯМА пробуждается
    enemies = enemies.filter((e) => !(e.isBoss && e.kind !== 'yama'));
    yamaRef.invuln = false;
    yamaRef.awake = true;

    // героя со зверями — на дорогу у южного края провала (там могилы дошедших)
    player.x = world.pit.x;
    player.y = world.pit.y + world.pit.r + 320;
    unstickPlayer();
    player.pets.forEach((a, i) => {
      a.x = player.x + (i ? 70 : -70);
      a.y = player.y + 50;
      a.homeX = a.x;
      a.homeY = a.y;
    });

    announce('ЯМА ПРОБУЖДЕНА — иди и изведи её!', '#c9a0e8');
    addLog(
      '[ТЕСТ] Хозяева леса повержены. Герой ' + LEVEL + '-го уровня у самого провала.',
      '#9fd08a',
    );
  }

  // «В ПУТЬ» (и после смерти, и после победы) всегда пересоздаёт тестовый бой
  startGame = function () {
    const nameInp = document.getElementById('nameInput');
    if (nameInp && nameInp.value.trim()) {
      playerName = nameInp.value.trim();
      localStorage.setItem('bogatyr_name', playerName);
    }
    document.getElementById('overlay').style.display = 'none';
    AudioSys.init();
    if (gameOver || victory || level !== 2) setupTest();
    document.getElementById('heroName').textContent = 'Богатырь ' + playerName;
    running = true;
  };
  document.getElementById('startBtn').onclick = startGame;

  // game.js при загрузке уже создал мир 1 уровня — сразу к ЯМЕ
  setupTest();
})();
