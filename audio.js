// ===== Аудио: все звуки синтезируются через WebAudio — мягкие, без системных звуков macOS =====
'use strict';
const AudioSys = (() => {
  let ctx = null, master = null, muted = false;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function out(vol) {
    const g = ctx.createGain();
    g.gain.value = vol;
    g.connect(master);
    return g;
  }

  function noiseBuf(dur) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // шумовой всплеск через фильтр — свист меча, удары, треск, ветер
  function noiseHit(dur, f0, f1, vol, type = 'bandpass', q = 1.2, delay = 0) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(dur);
    const flt = ctx.createBiquadFilter();
    flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f0, t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(f1, 30), t + dur);
    const g = out(0.001);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(flt); flt.connect(g);
    src.start(t); src.stop(t + dur);
  }

  function tone(type, f0, f1, dur, vol, delay = 0) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const g = out(0.001);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // колокольный удар: основная + неровные обертоны, долгое затухание
  function bell(f, dur, vol, delay = 0) {
    tone('sine', f, f, dur, vol, delay);
    tone('sine', f * 2.02, f * 2.02, dur * 0.6, vol * 0.4, delay);
    tone('sine', f * 2.94, f * 2.94, dur * 0.35, vol * 0.22, delay);
  }

  const S = {
    init: ensure,
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    // --- бой ---
    swing()      { noiseHit(0.16, 2600, 500, 0.3, 'bandpass', 2.5); },
    hitFlesh()   { noiseHit(0.12, 300, 80, 0.7, 'lowpass'); tone('sine', 160, 60, 0.12, 0.4); },
    hitMetal()   { noiseHit(0.1, 3000, 1200, 0.32, 'bandpass', 6); tone('square', 900, 500, 0.07, 0.09); },
    playerHurt() { tone('sawtooth', 220, 90, 0.22, 0.28); noiseHit(0.15, 500, 150, 0.4, 'lowpass'); },
    dodge()      { noiseHit(0.2, 1800, 3400, 0.24, 'bandpass', 3); },
    enemyDie()   { tone('sawtooth', 300, 50, 0.5, 0.32); noiseHit(0.4, 400, 60, 0.5, 'lowpass'); },
    bossDie()    { tone('sawtooth', 200, 30, 1.1, 0.45); noiseHit(0.9, 500, 40, 0.65, 'lowpass'); tone('sine', 110, 40, 1.2, 0.3); },
    // --- спецприёмы злодеев ---
    whistle() {  // свист Соловья: пронзительное глиссандо + шум ветра
      tone('sine', 900, 2600, 0.7, 0.42); tone('sine', 1300, 3400, 0.7, 0.26, 0.06);
      noiseHit(1.4, 900, 2500, 0.32, 'bandpass', 0.8);
    },
    grinder()    { for (let i = 0; i < 6; i++) { noiseHit(0.09, 2800, 900, 0.26, 'bandpass', 4, i * 0.09); tone('square', 700 - i * 60, 300, 0.06, 0.08, i * 0.09); } },
    axeThrow()   { noiseHit(0.5, 1400, 2600, 0.3, 'bandpass', 5); },
    snarl()      { tone('sawtooth', 140, 70, 0.55, 0.42); noiseHit(0.5, 700, 200, 0.45, 'lowpass'); },
    zombiePull() { tone('sine', 70, 180, 1.5, 0.32); tone('sine', 105, 260, 1.5, 0.18, 0.1); noiseHit(1.3, 250, 700, 0.12, 'bandpass', 2); },
    stomp()      { noiseHit(0.35, 200, 40, 0.85, 'lowpass'); tone('sine', 90, 30, 0.35, 0.65); },
    // --- мир ---
    chop()       { noiseHit(0.13, 900, 200, 0.7, 'lowpass'); tone('square', 200, 90, 0.08, 0.12); },
    treeFall()   { noiseHit(1.1, 500, 60, 0.75, 'lowpass'); },
    splash()     { noiseHit(0.5, 1200, 300, 0.45, 'bandpass', 0.9); },
    eat()        { noiseHit(0.14, 800, 300, 0.4, 'lowpass'); noiseHit(0.12, 700, 250, 0.35, 'lowpass', 1.2, 0.16); },
    pet()        { tone('sine', 220, 240, 0.3, 0.2); tone('sine', 330, 350, 0.28, 0.12, 0.12); },
    tame()       { tone('sine', 523, 523, 0.14, 0.24); tone('sine', 659, 659, 0.14, 0.24, 0.12); tone('sine', 784, 784, 0.3, 0.28, 0.24); },
    tameFail()   { tone('sawtooth', 220, 140, 0.3, 0.14); },
    zhopa()      { tone('sine', 320, 90, 0.22, 0.25); tone('sine', 90, 300, 0.22, 0.22, 0.2); },
    pickup()     { tone('triangle', 660, 440, 0.12, 0.22); tone('triangle', 880, 880, 0.1, 0.15, 0.08); },
    freed()      { bell(880, 0.9, 0.2); bell(1174, 0.9, 0.16, 0.18); },
    levelup()    { [392, 523, 659, 784].forEach((f, i) => tone('sine', f, f, 0.22, 0.22, i * 0.1)); bell(1568, 0.7, 0.12, 0.4); },
    menu()       { noiseHit(0.035, 2200, 1400, 0.12, 'bandpass', 4); },
    victory()    { [523, 659, 784, 1046].forEach((f, i) => tone('sine', f, f, 0.32, 0.26, i * 0.22)); bell(1046, 1.6, 0.2, 0.9); bell(1568, 1.4, 0.12, 1.1); },
    gameover()   { tone('sine', 220, 55, 2.0, 0.3); tone('sine', 165, 41, 2.0, 0.2, 0.15); },
    birds()      { const f = 2200 + Math.random() * 1600; tone('sine', f, f * 1.4, 0.09, 0.05); tone('sine', f * 1.2, f * 0.9, 0.08, 0.04, 0.12); tone('sine', f * 0.95, f * 1.5, 0.1, 0.04, 0.26); },
    wind()       { noiseHit(2.5, 400, 900, 0.05, 'bandpass', 0.6); },
    // шаги героя — очень тихие, чуть разные, чтобы не раздражали
    step()       { noiseHit(0.055, 260 + Math.random() * 80, 90, 0.055, 'lowpass'); },
    // --- новые враги ---
    purr()       { for (let i = 0; i < 7; i++) tone('sawtooth', 52 + (i % 2) * 6, 48, 0.09, 0.2, i * 0.09); }, // жуткое мурлыканье кота-баюна
    catScreech() { tone('sawtooth', 900, 1600, 0.28, 0.3); noiseHit(0.25, 2000, 3500, 0.25, 'bandpass', 2); },
    eagleCry()   { tone('sine', 1800, 900, 0.45, 0.22); tone('sine', 2300, 1100, 0.4, 0.12, 0.08); },
    arrow()      { noiseHit(0.22, 2000, 3200, 0.2, 'bandpass', 4); },
    magic()      { tone('sine', 500, 1400, 0.5, 0.16); tone('sine', 740, 1900, 0.45, 0.1, 0.08); noiseHit(0.4, 1800, 3000, 0.1, 'bandpass', 2); },
    root()       { noiseHit(0.5, 300, 80, 0.4, 'lowpass'); tone('sawtooth', 90, 45, 0.5, 0.2); },
    paralyze()   { tone('square', 220, 220, 0.7, 0.12); tone('square', 233, 233, 0.7, 0.12); tone('sine', 55, 40, 0.9, 0.3); }, // диссонанс Лиха
    squelch()    { noiseHit(0.25, 500, 120, 0.35, 'lowpass', 1, 0); noiseHit(0.18, 400, 100, 0.3, 'lowpass', 1, 0.14); }, // хлюпанье говённого
    fire()       { noiseHit(0.55, 800, 2200, 0.3, 'bandpass', 0.7); noiseHit(0.4, 300, 900, 0.22, 'lowpass', 1, 0.08); }, // драконье пламя
    crack()      { noiseHit(0.09, 1200, 300, 0.5, 'lowpass'); tone('square', 300, 120, 0.06, 0.1); }, // треск ломаемого предмета
    // --- Тёмный лес (уровень 2): злая атмосфера ---
    whisper() { // злые шепоты: шипящие обрывки слов из чащи
      for (let i = 0; i < 5; i++)
        noiseHit(0.13 + Math.random() * 0.09, 1500 + Math.random() * 900, 800 + Math.random() * 400, 0.055, 'bandpass', 1.3, i * 0.17 + Math.random() * 0.06);
      tone('sine', 180 + Math.random() * 60, 140, 0.6, 0.03, 0.2);
    },
    owl() { // уханье совы: два мягких низких «у-ху»
      tone('sine', 340, 290, 0.26, 0.13); tone('sine', 310, 250, 0.5, 0.15, 0.34);
    },
    fart() { // пердёж Великана — раскатистый и постыдный
      for (let i = 0; i < 9; i++)
        tone('sawtooth', 72 + Math.random() * 34 - i * 2.5, 52 + Math.random() * 22, 0.1, 0.24, i * 0.07);
      noiseHit(0.8, 140, 55, 0.35, 'lowpass');
      noiseHit(0.4, 220, 90, 0.2, 'lowpass', 1, 0.35);
    },
    sob() { // чьи-то всхлипы в темноте
      tone('sine', 460, 340, 0.2, 0.08); tone('sine', 490, 360, 0.16, 0.07, 0.28);
      tone('sine', 420, 280, 0.3, 0.06, 0.52); noiseHit(0.25, 900, 400, 0.04, 'bandpass', 1, 0.55);
    },
    shriek() { // далёкий визг
      tone('sawtooth', 1300, 2500, 0.18, 0.09); tone('sawtooth', 2500, 800, 0.34, 0.07, 0.14);
    },
    evilLaugh() { // зловещий смех: «ха-ха-ха-ха» всё ниже
      for (let i = 0; i < 4; i++) {
        tone('sawtooth', 185 - i * 18, 135 - i * 13, 0.15, 0.15, i * 0.2);
        noiseHit(0.09, 420, 200, 0.09, 'lowpass', 1, i * 0.2);
      }
    },
    droneStart() { // фоновый вой Тёмного леса: низкий гул + плачущее глиссандо
      ensure();
      if (this._droneId) return;
      const wail = () => {
        if (muted || !ctx) return;
        // пара расстроенных басов — гудят всё время
        tone('sine', 52, 49, 4.6, 0.09);
        tone('sine', 78, 74, 4.6, 0.055, 0.3);
        // воющий голос: медленно съезжает вниз, каждый раз чуть иначе
        const f = 240 + Math.random() * 120;
        tone('sine', f, f * (0.62 + Math.random() * 0.12), 3.8, 0.05, 0.8 + Math.random());
        if (Math.random() < 0.4) tone('sine', f * 1.5, f * 0.9, 3.2, 0.03, 2 + Math.random());
        // ветер в мёртвых кронах
        noiseHit(3.8, 300 + Math.random() * 300, 700, 0.035, 'bandpass', 0.7, Math.random() * 1.5);
      };
      wail();
      this._droneId = setInterval(wail, 4200);
    },
    droneStop() {
      if (this._droneId) { clearInterval(this._droneId); this._droneId = null; }
    },
    yamaVoice(v = 1) { // голос ЯМЫ: стон/всхлип/шёпот/смех; v 0..1 — ближе к яме громче
      const r = Math.random();
      if (r < 0.4) { // утробный стон
        tone('sine', 65, 160, 1.6, 0.34 * v); tone('sine', 98, 240, 1.6, 0.2 * v, 0.12);
        noiseHit(1.4, 240, 650, 0.13 * v, 'bandpass', 2);
      } else if (r < 0.65) { // всхлип
        tone('sine', 460, 340, 0.2, 0.1 * v); tone('sine', 490, 360, 0.16, 0.09 * v, 0.28);
        tone('sine', 420, 280, 0.3, 0.08 * v, 0.52);
      } else if (r < 0.85) { // шёпот мёртвых
        for (let i = 0; i < 5; i++)
          noiseHit(0.14, 1500 + Math.random() * 900, 800, 0.07 * v, 'bandpass', 1.3, i * 0.17);
      } else { // зловещий смех из глубины
        for (let i = 0; i < 4; i++) {
          tone('sawtooth', 185 - i * 18, 135 - i * 13, 0.15, 0.17 * v, i * 0.2);
          noiseHit(0.09, 420, 200, 0.1 * v, 'lowpass', 1, i * 0.2);
        }
      }
    },
    // --- замок Калина ---
    gate()       { noiseHit(1.4, 180, 60, 0.5, 'lowpass'); tone('sawtooth', 65, 40, 1.4, 0.22); bell(392, 1.0, 0.14, 0.9); }, // скрип отворяющихся врат
    fanfare()    { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone('sine', f, f, 0.22, 0.24, i * 0.13)); bell(1568, 1.2, 0.16, 0.8); },
    alarmStart() {
      ensure();
      if (this._alarmId) return;
      let beatN = 0;
      const beat = () => {
        if (muted || !ctx) return;
        tone('sawtooth', 98, 98, 0.42, 0.13);
        tone('sawtooth', 139, 139, 0.42, 0.1, 0.45); // тритон — тревога
        noiseHit(0.12, 150, 50, 0.28, 'lowpass');
        noiseHit(0.1, 150, 50, 0.2, 'lowpass', 1, 0.45);
        if (beatN % 2 === 0) tone('sine', 55, 48, 0.55, 0.22); // зловещий бас-пульс через такт
        beatN++;
      };
      beat();
      this._alarmId = setInterval(beat, 900);
    },
    alarmStop()  { if (this._alarmId) { clearInterval(this._alarmId); this._alarmId = null; } },
  };
  return S;
})();
