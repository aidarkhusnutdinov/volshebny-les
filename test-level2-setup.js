// ===== Тестовая настройка для test-level2.html =====
// Начинает игру сразу со второго уровня (Тёмный лес): герой 11-го уровня
// с булавой и небольшим отрядом (конь и медведь — чтобы проверить верховую езду).
// После смерти/победы «В ПУТЬ» пересоздаёт лес и настраивает всё заново.
'use strict';
(function () {
  const LEVEL = 11;
  const WEAPON = 'mace';

  function boostPlayer() {
    player.level = LEVEL;
    player.maxHp = 120 + 18 * (LEVEL - 1);
    player.hp = player.maxHp;
    player.speed = Math.min(255, 150 + 7 * (LEVEL - 1));
    player.dmgMul = 1 + 0.09 * (LEVEL - 1);
    player.dodge = Math.min(0.35, 0.05 + 0.035 * (LEVEL - 1));
    player.xpNeed = Math.round(110 * Math.pow(1.25, LEVEL - 1));
    player.xp = 0;
    player.weapon = WEAPON;
    player.smek = 5;
    player.wood = 2; // пара брёвен — сразу проверить ковку у костра
    player.pets = [];
    player.mount = null;
  }

  function setupTest() {
    boostPlayer();
    l2HeroSnap = null; // снапшот пересоберётся из прокачанного героя
    startLevel2();
    // зверей не даём — как в настоящей игре: приручай лесных (конь/медведь — под седло)
    addLog('[ТЕСТ] Тёмный лес: герой на ' + LEVEL + ' уровне, зверей приручай сам.', '#9fd08a');
  }

  // «В ПУТЬ» (и после смерти, и после победы) всегда пересоздаёт тестовый лес
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

  // game.js при загрузке уже создал мир 1 уровня — сразу переходим в лес
  setupTest();
})();
