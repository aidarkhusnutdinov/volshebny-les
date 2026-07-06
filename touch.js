// ===== Управление с сенсорного экрана (телефоны/планшеты) =====
// Подключается ПОСЛЕДНИМ: зовёт глобалы game.js (playerAttack, interact,
// tryContext, useItem, nearestEnemy, closeMenu, menuEl, camX/camY, VW/VH,
// player, running, ITEM_DEFS, AudioSys, resize). На десктопе (IS_TOUCH=false)
// не делает ничего.
"use strict";
(() => {
  if (!window.IS_TOUCH) return;

  // ---------- виртуальный джойстик ----------
  // вектор читает game.js в блоке движения; −1…1 по каждой оси
  window.touchMove = { x: 0, y: 0 };
  const JOY_R = 55; // радиус хода пальца
  const JOY_DEAD = 0.25; // мёртвая зона — против дрожи пальца

  const joyBase = document.createElement("div");
  joyBase.id = "joyBase";
  const joyKnob = document.createElement("div");
  joyKnob.id = "joyKnob";
  document.body.append(joyBase, joyKnob);

  let joyId = null,
    joyOx = 0,
    joyOy = 0;

  function joyShow(on) {
    joyBase.style.display = joyKnob.style.display = on ? "block" : "none";
  }
  function joySet(cx, cy) {
    let dx = cx - joyOx,
      dy = cy - joyOy;
    const len = Math.hypot(dx, dy);
    if (len > JOY_R) {
      dx *= JOY_R / len;
      dy *= JOY_R / len;
    }
    joyKnob.style.left = joyOx + dx + "px";
    joyKnob.style.top = joyOy + dy + "px";
    if (len < JOY_R * JOY_DEAD) {
      window.touchMove.x = window.touchMove.y = 0;
    } else {
      window.touchMove.x = dx / JOY_R;
      window.touchMove.y = dy / JOY_R;
    }
  }
  function joyEnd() {
    joyId = null;
    window.touchMove.x = window.touchMove.y = 0;
    joyShow(false);
  }

  // ---------- тап/долгое нажатие по канвасу ----------
  // короткий тап = удар в точку (как ЛКМ), долгое нажатие = меню (как ПКМ)
  let tapId = null,
    tapX = 0,
    tapY = 0,
    tapT = 0,
    tapMoved = false,
    tapConsumed = false,
    lpTimer = null;

  function tapCancel() {
    tapId = null;
    if (lpTimer) {
      clearTimeout(lpTimer);
      lpTimer = null;
    }
  }

  const cv = document.getElementById("game");
  cv.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // глушит синтетические mouse-события, зум и скролл
      // самовосстановление: если отслеживаемый палец пропал без touchend
      // (бывает на мобильных), не держим слот занятым вечно
      const alive = new Set([...e.touches].map((t) => t.identifier));
      if (joyId !== null && !alive.has(joyId)) joyEnd();
      if (tapId !== null && !alive.has(tapId)) tapCancel();
      // тап мимо открытого меню — закрыть и ничего больше не делать
      if (menuEl.style.display === "block") {
        closeMenu();
        return;
      }
      for (const t of e.changedTouches) {
        if (joyId === null && t.clientX < VW * 0.45) {
          joyId = t.identifier;
          joyOx = t.clientX;
          joyOy = t.clientY;
          joyBase.style.left = joyOx + "px";
          joyBase.style.top = joyOy + "px";
          joyShow(true);
          joySet(t.clientX, t.clientY);
        } else if (tapId === null) {
          tapId = t.identifier;
          tapX = t.clientX;
          tapY = t.clientY;
          tapT = performance.now();
          tapMoved = false;
          tapConsumed = false;
          lpTimer = setTimeout(() => {
            lpTimer = null;
            if (!tapMoved && running) {
              tapConsumed = true;
              tryContext(tapX, tapY);
            }
          }, 450);
        }
      }
    },
    { passive: false },
  );

  cv.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === joyId) joySet(t.clientX, t.clientY);
        else if (t.identifier === tapId) {
          if (Math.hypot(t.clientX - tapX, t.clientY - tapY) > 12) {
            tapMoved = true;
            if (lpTimer) {
              clearTimeout(lpTimer);
              lpTimer = null;
            }
          }
        }
      }
    },
    { passive: false },
  );

  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === joyId) joyEnd();
      else if (t.identifier === tapId) {
        const quick = performance.now() - tapT < 300;
        if (!tapConsumed && !tapMoved && quick) {
          closeMenu();
          playerAttack(t.clientX + camX, t.clientY + camY); // как ЛКМ
        }
        tapCancel();
      }
    }
  }
  cv.addEventListener("touchend", onTouchEnd);
  cv.addEventListener("touchcancel", onTouchEnd);

  // ---------- кнопки и котомка ----------
  const tui = document.createElement("div");
  tui.id = "touchui";
  tui.innerHTML =
    '<div class="tbtn" id="tbAttack">⚔️</div>' +
    '<div class="tbtn" id="tbInteract">✋</div>' +
    '<div class="tbtn" id="tbMute">🔊</div>' +
    '<div id="tbHotbar"></div>';
  document.body.appendChild(tui);

  // кнопка срабатывает на touchstart — мгновенный отклик, как просит UX игры
  function bindBtn(el, onDown, onUp) {
    el.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        el.classList.add("pressed");
        onDown();
      },
      { passive: false },
    );
    const up = () => {
      el.classList.remove("pressed");
      if (onUp) onUp();
    };
    el.addEventListener("touchend", up);
    el.addEventListener("touchcancel", up);
  }

  function doAttack() {
    // тело ветки Space из game.js: бьём ближайшего, иначе перед собой
    const t = nearestEnemy(300);
    playerAttack(t ? t.x : player.x + player.face * 50, t ? t.y : player.y);
  }
  let atkRep = null;
  bindBtn(
    document.getElementById("tbAttack"),
    () => {
      doAttack();
      // удержание = автоповтор; кулдаун оружия внутри playerAttack сам лимитирует
      atkRep = setInterval(doAttack, 280);
    },
    () => {
      clearInterval(atkRep);
      atkRep = null;
    },
  );
  bindBtn(document.getElementById("tbInteract"), () => interact());
  const muteBtn = document.getElementById("tbMute");
  bindBtn(muteBtn, () => {
    const m = AudioSys.toggleMute();
    muteBtn.textContent = m ? "🔇" : "🔊";
    addLog(m ? "Звук выключен." : "Звук включён.");
  });

  // котомка: тапабельные слоты вместо клавиш 1-8
  const hotbar = document.getElementById("tbHotbar");
  let hotSig = "";
  function refreshHotbar() {
    if (typeof player === "undefined" || !player.items) return;
    const sig = ITEM_DEFS.map((d) => player.items[d.id] || 0).join(",");
    if (sig === hotSig) return;
    hotSig = sig;
    hotbar.innerHTML = "";
    for (const d of ITEM_DEFS) {
      const n = player.items[d.id] || 0;
      if (n <= 0) continue;
      const s = document.createElement("div");
      s.className = "tslot";
      s.innerHTML = d.icon + '<span class="tnum">' + n + "</span>";
      bindBtn(s, () => useItem(d.id));
      hotbar.appendChild(s);
    }
  }

  // тач-панель видна только в игре: оверлеи (старт/смерть/победа) её прячут
  const overlayEl = document.getElementById("overlay");
  setInterval(() => {
    tui.style.display = overlayEl.style.display === "none" ? "block" : "none";
    refreshHotbar();
  }, 300);

  // ---------- мелочи платформы ----------
  // разблокировка WebAudio первым касанием (iOS Safari)
  document.addEventListener("touchend", () => AudioSys.init(), {
    once: true,
    passive: true,
  });
  // адресная строка мобильного браузера меняет высоту окна
  if (window.visualViewport)
    window.visualViewport.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () =>
    setTimeout(resize, 300),
  );

  // подсказка повернуть телефон (не блокирует игру, тает сама)
  const rot = document.createElement("div");
  rot.id = "rotateHint";
  rot.textContent = "Поверни телефон набок 🔄";
  document.body.appendChild(rot);
  let rotT = null;
  function rotateHint() {
    if (!matchMedia("(orientation: portrait)").matches) {
      rot.classList.remove("show");
      return;
    }
    rot.classList.add("show");
    clearTimeout(rotT);
    rotT = setTimeout(() => rot.classList.remove("show"), 4000);
  }
  matchMedia("(orientation: portrait)").addEventListener?.("change", () =>
    setTimeout(rotateHint, 400),
  );
  rotateHint();
})();
