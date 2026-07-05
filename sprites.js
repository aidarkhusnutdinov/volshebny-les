// ===== Спрайты: персонажи, звери, деревья, избы. Векторная рисовка на Canvas. =====
'use strict';

function shadow(ctx, x, y, rx, ry = null) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,25,10,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, rx, ry || rx * 0.38, 0, 0, 6.283);
  ctx.fill();
  ctx.restore();
}

// --- оружие (в руке и на земле) ---
function drawWeapon(ctx, kind, s = 1) {
  ctx.save(); ctx.scale(s, s); ctx.lineWidth = 1.2; ctx.strokeStyle = '#1a1408';
  switch (kind) {
    case 'sword':
      ctx.fillStyle = '#cfd6de'; ctx.fillRect(-1.6, -26, 3.2, 22);
      ctx.beginPath(); ctx.moveTo(-1.6, -26); ctx.lineTo(0, -30); ctx.lineTo(1.6, -26); ctx.fill();
      ctx.fillStyle = '#8a6b2c'; ctx.fillRect(-5.5, -5.5, 11, 3);
      ctx.fillStyle = '#5e451c'; ctx.fillRect(-1.7, -2.5, 3.4, 7);
      ctx.fillStyle = '#c9a94f'; ctx.beginPath(); ctx.arc(0, 5.5, 2.4, 0, 6.283); ctx.fill();
      break;
    case 'saber':
      ctx.fillStyle = '#dde3ea'; ctx.beginPath();
      ctx.moveTo(-1.5, -4); ctx.quadraticCurveTo(7, -16, 3, -28); ctx.quadraticCurveTo(10, -17, 2.2, -3.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6b4a1e'; ctx.fillRect(-2.2, -4, 4.4, 8);
      break;
    case 'sekira': // секира
      ctx.fillStyle = '#7a5a2a'; ctx.fillRect(-1.8, -28, 3.6, 30);
      ctx.fillStyle = '#b8bfc9'; ctx.beginPath();
      ctx.moveTo(1, -26); ctx.quadraticCurveTo(14, -24, 12, -12); ctx.quadraticCurveTo(6, -18, 1, -17); ctx.fill(); ctx.stroke();
      break;
    case 'mace': // булава
      ctx.fillStyle = '#7a5a2a'; ctx.fillRect(-1.8, -20, 3.6, 22);
      ctx.fillStyle = '#9aa2ad'; ctx.beginPath(); ctx.arc(0, -22, 6.5, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7a828d';
      for (let i = 0; i < 6; i++) { const a = i * 1.047; ctx.beginPath(); ctx.arc(Math.cos(a) * 7.5, -22 + Math.sin(a) * 7.5, 1.8, 0, 6.283); ctx.fill(); }
      break;
    case 'axe': // топор росомахи
      ctx.fillStyle = '#6e4f22'; ctx.fillRect(-1.5, -22, 3, 24);
      ctx.fillStyle = '#aeb6c0'; ctx.beginPath();
      ctx.moveTo(-1, -21); ctx.quadraticCurveTo(-12, -22, -11, -10); ctx.quadraticCurveTo(-5, -14, -1, -13); ctx.fill(); ctx.stroke();
      break;
    case 'club': // дубина
      ctx.fillStyle = '#8a6535'; ctx.beginPath();
      ctx.moveTo(-2, 2); ctx.lineTo(-4.5, -22); ctx.quadraticCurveTo(0, -28, 4.5, -22); ctx.lineTo(2, 2); ctx.fill(); ctx.stroke();
      break;
    case 'bone': // кость Калина
      ctx.fillStyle = '#efe6cf'; ctx.fillRect(-2, -20, 4, 20);
      ctx.beginPath(); ctx.arc(-3, -21, 3.5, 0, 6.283); ctx.arc(3, -21, 3.5, 0, 6.283); ctx.fill();
      break;
    case 'bigclub': // огромная дубина людоеда
      ctx.fillStyle = '#6e4f22'; ctx.beginPath();
      ctx.moveTo(-2.5, 4); ctx.lineTo(-7, -30); ctx.quadraticCurveTo(0, -40, 7, -30); ctx.lineTo(2.5, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a3416'; // шипы
      for (const [sx2, sy2] of [[-6, -28], [0, -37], [6, -28]]) { ctx.beginPath(); ctx.moveTo(sx2, sy2); ctx.lineTo(sx2 * 1.6, sy2 - 5); ctx.lineTo(sx2 + 2, sy2 + 2); ctx.fill(); }
      break;
    case 'knife': // трофейный нож
      ctx.fillStyle = '#cfd6de'; ctx.fillRect(-1.4, -15, 2.8, 11);
      ctx.beginPath(); ctx.moveTo(-1.4, -15); ctx.lineTo(0, -18); ctx.lineTo(1.4, -15); ctx.fill();
      ctx.fillStyle = '#2e2211'; ctx.fillRect(-1.8, -4, 3.6, 6);
      break;
    case 'bow': // лук
      ctx.strokeStyle = '#6e4f22'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(-3, -22); ctx.quadraticCurveTo(9, -11, -3, 0); ctx.stroke();
      ctx.strokeStyle = '#d8d0b8'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-3, -22); ctx.lineTo(-3, 0); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.strokeStyle = '#1a1408';
      break;
    case 'staff': // волшебный посох лешего
      ctx.fillStyle = '#4a3a1e'; ctx.fillRect(-1.6, -26, 3.2, 30);
      ctx.strokeStyle = '#4a3a1e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(-5, -31, -2, -34); ctx.moveTo(0, -26); ctx.quadraticCurveTo(5, -31, 2, -34); ctx.stroke();
      ctx.fillStyle = '#7fe86a'; ctx.beginPath(); ctx.arc(0, -31, 3.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(127,232,106,0.35)'; ctx.beginPath(); ctx.arc(0, -31, 5.5, 0, 6.283); ctx.fill();
      break;
  }
  ctx.restore();
}

// --- универсальный человек (богатырь, разбойник, половец, царь, пленники...) ---
function humanoid(ctx, time, o) {
  const s = o.s || 1;
  ctx.save();
  ctx.translate(o.x, o.y);
  shadow(ctx, 0, 0, 14 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const w = o.walk ? Math.sin(time * 11 + (o.phase || 0)) : 0;
  const bob = o.walk ? Math.abs(Math.cos(time * 11 + (o.phase || 0))) * 2 : Math.sin(time * 2 + (o.phase || 0)) * 0.7;
  ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(15,10,5,0.65)';

  // ноги
  const legA = w * 7;
  ctx.fillStyle = o.pants || '#4a3a24';
  ctx.save(); ctx.translate(-4, -14); ctx.rotate(legA * 0.05); ctx.fillRect(-3, 0, 6, 15); ctx.restore();
  ctx.save(); ctx.translate(4, -14); ctx.rotate(-legA * 0.05); ctx.fillRect(-3, 0, 6, 15); ctx.restore();
  if (!o.barefoot) {
    ctx.fillStyle = o.boots || '#2e2211';
    ctx.fillRect(-8 + legA * 0.4, -3, 9, 4); ctx.fillRect(0 - legA * 0.4, -3, 9, 4);
  } else {
    ctx.fillStyle = o.skin;
    ctx.fillRect(-7 + legA * 0.4, -3, 7, 3.4); ctx.fillRect(1 - legA * 0.4, -3, 7, 3.4);
  }

  ctx.translate(0, -bob);
  // сарафан/платье вместо ног
  if (o.dress) {
    ctx.fillStyle = o.dress;
    ctx.beginPath(); ctx.moveTo(-11, -2); ctx.quadraticCurveTo(-8, -22, 0, -24); ctx.quadraticCurveTo(8, -22, 11, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // туловище
  ctx.fillStyle = o.shirt;
  ctx.beginPath();
  ctx.moveTo(-9, -13); ctx.quadraticCurveTo(-11, -26, -7, -30);
  ctx.lineTo(7, -30); ctx.quadraticCurveTo(11, -26, 9, -13); ctx.closePath();
  ctx.fill(); ctx.stroke();
  if (o.belly) { ctx.fillStyle = o.bellyC || o.shirt; ctx.beginPath(); ctx.ellipse(0, -18, 12, 10, 0, 0, 6.283); ctx.fill(); ctx.stroke(); }
  if (o.hairyBelly) { // волосатое пузо людоеда
    ctx.strokeStyle = '#3d2c14'; ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) { const hx2 = -9 + (i % 7) * 3, hy2 = -23 + Math.floor(i / 7) * 6; ctx.beginPath(); ctx.moveTo(hx2, hy2); ctx.quadraticCurveTo(hx2 + 1, hy2 + 2.5, hx2 - 0.5, hy2 + 4); ctx.stroke(); }
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(15,10,5,0.65)';
  }
  if (o.stripes) { // мышцы без кожи — у Мяса
    ctx.strokeStyle = o.stripes; ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-7 + i * 3.4, -29); ctx.quadraticCurveTo(-6 + i * 3.4, -22, -7.5 + i * 3.4, -14); ctx.stroke(); }
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(15,10,5,0.65)';
  }
  if (o.mail) { // кольчуга — точки
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let yy = -28; yy < -14; yy += 3) for (let xx = -7; xx < 8; xx += 3) { ctx.beginPath(); ctx.arc(xx + (yy % 2), yy, 0.9, 0, 6.283); ctx.fill(); }
  }
  if (o.belt) { ctx.fillStyle = o.belt; ctx.fillRect(-9.5, -16, 19, 3.4); }
  if (o.cloak) { // плащ-накидка за спиной
    ctx.fillStyle = o.cloak;
    ctx.beginPath(); ctx.moveTo(-8, -30); ctx.quadraticCurveTo(-15, -16, -12 - w, -1);
    ctx.lineTo(-4, -4); ctx.lineTo(-6, -28); ctx.closePath(); ctx.fill();
  }
  if (o.shieldBack) {
    ctx.fillStyle = '#a8231a'; ctx.beginPath(); ctx.ellipse(-10, -21, 6, 9, 0.25, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c9a94f'; ctx.beginPath(); ctx.ellipse(-10, -21, 2.2, 3.4, 0.25, 0, 6.283); ctx.fill();
  }

  // руки
  const atk = o.attack || 0; // 0..1 — анимация удара
  const armSwing = o.armsForward ? 0 : w * 5;
  // задняя рука
  ctx.fillStyle = o.shirt;
  ctx.save(); ctx.translate(-7, -27);
  if (o.armsForward) { ctx.rotate(1.35); }
  else ctx.rotate(-0.5 - armSwing * 0.06);
  ctx.fillRect(-2.5, 0, 5, 14); ctx.strokeRect(-2.5, 0, 5, 14);
  ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(0, 15, 3, 0, 6.283); ctx.fill();
  ctx.restore();
  // передняя рука + оружие
  ctx.save(); ctx.translate(7, -27);
  let armAng;
  if (o.armsForward) armAng = 1.35;
  else if (atk > 0) armAng = -2.4 + atk * 3.6; // замах и рубящий удар
  else armAng = 0.5 + armSwing * 0.06;
  ctx.rotate(armAng);
  ctx.fillStyle = o.shirt; ctx.fillRect(-2.5, 0, 5, 14); ctx.strokeRect(-2.5, 0, 5, 14);
  ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(0, 15, 3.2, 0, 6.283); ctx.fill();
  if (o.weapon) { ctx.translate(0, 15); ctx.rotate(1.5708); drawWeapon(ctx, o.weapon, 1); }
  ctx.restore();

  // голова
  ctx.translate(0, -30);
  const hs = o.headS || 1;
  ctx.fillStyle = o.skin;
  ctx.beginPath(); ctx.arc(0, -7 * hs, 8 * hs, 0, 6.283); ctx.fill(); ctx.stroke();
  if (o.drawFace) o.drawFace(ctx, hs, time);
  else {
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 1.15, 0, 6.283); ctx.arc(7 * hs, -8 * hs, 1.15, 0, 6.283); ctx.fill();
  }
  if (o.beard) {
    ctx.fillStyle = o.beard;
    ctx.beginPath(); ctx.moveTo(-2 * hs, -6 * hs); ctx.quadraticCurveTo(2 * hs, 4 * hs, 8 * hs, -4 * hs);
    ctx.quadraticCurveTo(6 * hs, -9 * hs, -2 * hs, -6 * hs); ctx.fill();
  }
  if (o.mustache) {
    ctx.strokeStyle = o.mustache; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(4 * hs, -4.5 * hs); ctx.quadraticCurveTo(8 * hs, -3 * hs, 9.5 * hs, -6 * hs); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(15,10,5,0.65)';
  }
  if (o.hair) {
    ctx.fillStyle = o.hair;
    ctx.beginPath(); ctx.arc(-1 * hs, -9 * hs, 7.6 * hs, 2.7, 5.9); ctx.quadraticCurveTo(-9 * hs, -2 * hs, -7 * hs, 0); ctx.lineTo(-5 * hs, -4 * hs); ctx.fill();
  }
  if (o.chub) { // чуб-оселедец
    ctx.strokeStyle = o.chub; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -14.5 * hs); ctx.quadraticCurveTo(-7 * hs, -16 * hs, -10 * hs, -9 * hs + Math.sin(time * 3) * 1.5); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(15,10,5,0.65)';
  }
  switch (o.headgear) {
    case 'helm': // шлем-луковка богатыря
      ctx.fillStyle = '#c2cad4';
      ctx.beginPath(); ctx.arc(0, -8 * hs, 8.4 * hs, 3.14, 6.283);
      ctx.quadraticCurveTo(4, -21 * hs, 0, -24 * hs); ctx.quadraticCurveTo(-4, -21 * hs, -8.4 * hs, -8 * hs); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8f99a5'; ctx.fillRect(-8.4 * hs, -9 * hs, 16.8 * hs, 2.4);
      break;
    case 'furhat': // половецкая шапка
      ctx.fillStyle = '#7d5a34';
      ctx.beginPath(); ctx.ellipse(0, -12 * hs, 9 * hs, 5 * hs, 0, 3.14, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a26a'; ctx.beginPath(); ctx.moveTo(-6, -14 * hs); ctx.quadraticCurveTo(0, -24 * hs, 6, -14 * hs); ctx.fill(); ctx.stroke();
      break;
    case 'hood': // капюшон росомахи
      ctx.fillStyle = o.cloak || '#5e4426';
      ctx.beginPath(); ctx.moveTo(9 * hs, -4 * hs);
      ctx.quadraticCurveTo(11 * hs, -18 * hs, 0, -17 * hs);
      ctx.quadraticCurveTo(-12 * hs, -16 * hs, -9 * hs, 2 * hs);
      ctx.lineTo(-5 * hs, 0); ctx.quadraticCurveTo(-7 * hs, -12 * hs, 1, -12 * hs);
      ctx.quadraticCurveTo(8 * hs, -12 * hs, 7 * hs, -4 * hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'crown':
      ctx.fillStyle = '#e8c34d';
      ctx.beginPath(); ctx.moveTo(-8 * hs, -13 * hs); ctx.lineTo(-8 * hs, -20 * hs); ctx.lineTo(-4 * hs, -15 * hs); ctx.lineTo(0, -21 * hs);
      ctx.lineTo(4 * hs, -15 * hs); ctx.lineTo(8 * hs, -20 * hs); ctx.lineTo(8 * hs, -13 * hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c23bd6'; ctx.beginPath(); ctx.arc(0, -16.5 * hs, 1.6, 0, 6.283); ctx.fill();
      break;
    case 'kokoshnik':
      ctx.fillStyle = '#a8231a';
      ctx.beginPath(); ctx.moveTo(-8 * hs, -11 * hs); ctx.quadraticCurveTo(0, -22 * hs, 8 * hs, -11 * hs); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'stahlhelm': // каска фашиста
      ctx.fillStyle = '#4a4d44';
      ctx.beginPath(); ctx.arc(0, -9 * hs, 9 * hs, 3.05, 6.4); ctx.fill(); ctx.stroke();
      ctx.fillRect(-9.5 * hs, -10 * hs, 19 * hs, 3.2); // отогнутый край
      ctx.strokeRect(-9.5 * hs, -10 * hs, 19 * hs, 3.2);
      break;
  }
  ctx.restore();
}

// --- лица-спецэффекты ---
const FACES = {
  solovey(ctx, hs, t) { // морда лесного чудища с монгольскими чертами
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.ellipse(3 * hs, -8.5 * hs, 2.2, 1.1, 0.3, 0, 6.283); ctx.ellipse(7.5 * hs, -8.5 * hs, 2.2, 1.1, -0.3, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#3d2b12'; ctx.beginPath(); ctx.ellipse(5.5 * hs, -5 * hs, 3.4, 2.4, 0, 0, 6.283); ctx.fill(); // широкий нос
    ctx.fillStyle = '#0f0a05'; ctx.beginPath(); ctx.arc(4.5 * hs, -4.8 * hs, 1, 0, 6.283); ctx.arc(6.8 * hs, -4.8 * hs, 1, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2b1d0c'; // лохматые щёки
    ctx.beginPath(); ctx.arc(-2 * hs, -6 * hs, 4.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#2b1d0c'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-4 * hs + i * 2, -2 * hs); ctx.lineTo(-5 * hs + i * 2.2, 2 * hs + Math.sin(t * 4 + i)); ctx.stroke(); }
  },
  rosomaha(ctx, hs) { // лицо-морда росомахи
    ctx.fillStyle = '#4a3418';
    ctx.beginPath(); ctx.ellipse(6 * hs, -6 * hs, 5, 3.4, 0.15, 0, 6.283); ctx.fill(); // вытянутая морда
    ctx.fillStyle = '#0f0a05'; ctx.beginPath(); ctx.arc(10 * hs, -6 * hs, 1.6, 0, 6.283); ctx.fill(); // нос
    ctx.fillStyle = '#e8d59a'; ctx.beginPath(); ctx.moveTo(2 * hs, -9 * hs); ctx.lineTo(9 * hs, -8 * hs); ctx.lineTo(2 * hs, -5 * hs); ctx.fill(); // светлая полоса
    ctx.fillStyle = '#f5d63d';
    ctx.beginPath(); ctx.arc(2.5 * hs, -8.5 * hs, 1.4, 0, 6.283); ctx.arc(6 * hs, -8.5 * hs, 1.4, 0, 6.283); ctx.fill(); // жёлтые глаза
    ctx.fillStyle = '#fff'; // клыки
    ctx.beginPath(); ctx.moveTo(5 * hs, -3.5 * hs); ctx.lineTo(6 * hs, -1 * hs); ctx.lineTo(7 * hs, -3.5 * hs); ctx.fill();
  },
  koschei(ctx, hs) { // Кощей — гримасa Милляра, зеленоватый
    ctx.fillStyle = '#0f0a05';
    ctx.beginPath(); ctx.ellipse(3 * hs, -8.5 * hs, 2.4, 2.8, 0, 0, 6.283); ctx.ellipse(7.5 * hs, -8.5 * hs, 2.4, 2.8, 0, 0, 6.283); ctx.fill(); // впалые глазницы
    ctx.fillStyle = '#d3e04a'; ctx.beginPath(); ctx.arc(3.5 * hs, -8.5 * hs, 0.9, 0, 6.283); ctx.arc(7.9 * hs, -8.5 * hs, 0.9, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#3d4a1e'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(2 * hs, -3 * hs); ctx.quadraticCurveTo(5 * hs, -1 * hs, 8.5 * hs, -3.5 * hs); ctx.stroke(); // злая ухмылка
    ctx.beginPath(); ctx.moveTo(-2 * hs, -12 * hs); ctx.lineTo(9 * hs, -12.5 * hs); ctx.stroke(); // морщины
    ctx.beginPath(); ctx.moveTo(0, -1 * hs); ctx.lineTo(3 * hs, 1.5 * hs); ctx.stroke();
  },
  kalin(ctx, hs) {
    ctx.fillStyle = '#1c1208';
    ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 1.3, 0, 6.283); ctx.arc(7 * hs, -8 * hs, 1.3, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#5e120c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(2 * hs, -3 * hs); ctx.quadraticCurveTo(5.5 * hs, -5.5 * hs, 9 * hs, -3 * hs); ctx.stroke(); // жующий рот
    ctx.fillStyle = '#8c1f16'; ctx.beginPath(); ctx.ellipse(5.5 * hs, -3 * hs, 2, 1.2, 0, 0, 6.283); ctx.fill();
  },
  likho(ctx, hs, t) { // один огромный глаз посреди лба
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(4 * hs, -8 * hs, 4.6, 3.6, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#8c1f16'; ctx.beginPath(); ctx.arc(4 * hs + Math.sin(t * 2) * 1.2, -8 * hs, 2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(4 * hs + Math.sin(t * 2) * 1.2, -8 * hs, 0.9, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#2b2b28'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-1 * hs, -12.5 * hs); ctx.lineTo(9 * hs, -11.5 * hs); ctx.stroke(); // тяжёлая бровь
    ctx.beginPath(); ctx.moveTo(1 * hs, -2.5 * hs); ctx.quadraticCurveTo(5 * hs, -0.5 * hs, 8.5 * hs, -3 * hs); ctx.stroke(); // кривой рот
  },
  meat(ctx, hs) { // лицо без кожи
    ctx.strokeStyle = '#8c1f16'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-3 * hs + i * 3, -13 * hs); ctx.quadraticCurveTo(-2 * hs + i * 3, -7 * hs, -3.5 * hs + i * 3, -2 * hs); ctx.stroke(); }
    ctx.fillStyle = '#f0ede0'; // глаза навыкате без век
    ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 2.1, 0, 6.283); ctx.arc(7.5 * hs, -8 * hs, 2.1, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 0.9, 0, 6.283); ctx.arc(7.5 * hs, -8 * hs, 0.9, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#f0ede0'; // зубы без губ
    ctx.fillRect(1 * hs, -4 * hs, 7 * hs, 2.2);
    ctx.strokeStyle = '#8c1f16'; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(1 * hs + i * 1.8 * hs, -4 * hs); ctx.lineTo(1 * hs + i * 1.8 * hs, -1.8 * hs); ctx.stroke(); }
  },
  chert(ctx, hs, t) { // рожки, жёлтые глазищи, ухмылка
    ctx.fillStyle = '#14100a';
    ctx.beginPath(); ctx.moveTo(-3 * hs, -13 * hs); ctx.quadraticCurveTo(-6 * hs, -20 * hs, -2 * hs, -19 * hs); ctx.lineTo(-1 * hs, -14 * hs); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5 * hs, -14 * hs); ctx.quadraticCurveTo(8 * hs, -21 * hs, 9.5 * hs, -17 * hs); ctx.lineTo(7 * hs, -13 * hs); ctx.fill();
    ctx.fillStyle = '#ffe24a';
    ctx.beginPath(); ctx.arc(3 * hs, -8.5 * hs, 1.8, 0, 6.283); ctx.arc(7 * hs, -8.5 * hs, 1.8, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(3 * hs, -8.5 * hs, 0.8, 0, 6.283); ctx.arc(7 * hs, -8.5 * hs, 0.8, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#14100a'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(1 * hs, -4 * hs); ctx.quadraticCurveTo(5 * hs, -1 * hs + Math.sin(t * 6), 9 * hs, -4.5 * hs); ctx.stroke(); // вертлявая ухмылка
  },
  leshy(ctx, hs) { // глаза-огоньки в мшистой бороде
    ctx.fillStyle = '#7fe86a';
    ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 1.6, 0, 6.283); ctx.arc(7 * hs, -8 * hs, 1.6, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 0.7, 0, 6.283); ctx.arc(7 * hs, -8 * hs, 0.7, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#3d5c26'; ctx.lineWidth = 1.4; // морщины-кора
    ctx.beginPath(); ctx.moveTo(-2 * hs, -12 * hs); ctx.lineTo(9 * hs, -12 * hs); ctx.moveTo(0, -5 * hs); ctx.lineTo(3 * hs, -4 * hs); ctx.stroke();
  },
  govno(ctx, hs, t) { // мухи и тоскливые глаза
    ctx.fillStyle = '#f0ede0';
    ctx.beginPath(); ctx.arc(3 * hs, -8 * hs, 1.7, 0, 6.283); ctx.arc(7 * hs, -8 * hs, 1.7, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(3 * hs, -7.6 * hs, 0.8, 0, 6.283); ctx.arc(7 * hs, -7.6 * hs, 0.8, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(5 * hs + Math.sin(t * 7) * 6, -14 * hs + Math.cos(t * 9) * 4, 0.9, 0, 6.283); ctx.fill(); // муха
    ctx.beginPath(); ctx.arc(2 * hs + Math.cos(t * 8) * 5, -12 * hs + Math.sin(t * 6) * 5, 0.7, 0, 6.283); ctx.fill(); // муха
    ctx.strokeStyle = '#3d2c14'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(2 * hs, -2.5 * hs); ctx.quadraticCurveTo(5 * hs, -4 * hs, 8 * hs, -2.5 * hs); ctx.stroke(); // грустный рот
  },
};

// --- четвероногое (тур, олень, волк, лось, конь, оборотень...) ---
function quadruped(ctx, time, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 0, 18 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const w = o.walk ? Math.sin(time * 10 + (o.phase || 0)) : 0;
  const bob = o.walk ? Math.abs(Math.cos(time * 10)) * 1.5 : Math.sin(time * 1.5 + (o.phase || 0)) * 0.6;
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  // ноги
  ctx.fillStyle = o.legC || o.body;
  ctx.fillRect(-13 + w * 2, -12, 4, 12); ctx.fillRect(-6 - w * 2, -12, 4, 12);
  ctx.fillRect(5 + w * 2, -12, 4, 12); ctx.fillRect(12 - w * 2, -12, 4, 12);
  ctx.translate(0, -bob);
  // тело
  ctx.fillStyle = o.body;
  ctx.beginPath(); ctx.ellipse(0, -17, 17, 9.5, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  if (o.mane) { ctx.fillStyle = o.mane; ctx.beginPath(); ctx.ellipse(8, -22, 9, 5, -0.35, 0, 6.283); ctx.fill(); }
  // хвост
  ctx.strokeStyle = o.tailC || o.body; ctx.lineWidth = o.tailW || 2.5;
  ctx.beginPath(); ctx.moveTo(-16, -20); ctx.quadraticCurveTo(-23, -22 + Math.sin(time * 3) * 3, -21, -12); ctx.stroke();
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  // голова
  ctx.fillStyle = o.head || o.body;
  ctx.beginPath(); ctx.ellipse(17, -25, 7.5, 6, 0.35, 0, 6.283); ctx.fill(); ctx.stroke();
  if (o.snout) { ctx.fillStyle = o.snout; ctx.beginPath(); ctx.ellipse(23, -23, 4.5, 3, 0.35, 0, 6.283); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(18, -27, 1.3, 0, 6.283); ctx.fill();
  // уши
  ctx.fillStyle = o.head || o.body;
  ctx.beginPath(); ctx.moveTo(13, -30); ctx.lineTo(11, -36); ctx.lineTo(16, -32); ctx.fill();
  if (o.horns === 'bull') {
    ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, -30); ctx.quadraticCurveTo(10, -40, 15, -43); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -30); ctx.quadraticCurveTo(24, -39, 20, -43); ctx.stroke();
  } else if (o.horns === 'antler') {
    ctx.strokeStyle = '#b09468'; ctx.lineWidth = 2;
    for (const dx of [14, 19]) {
      ctx.beginPath(); ctx.moveTo(dx, -30); ctx.lineTo(dx - 3, -42);
      ctx.moveTo(dx - 1, -35); ctx.lineTo(dx - 6, -39);
      ctx.moveTo(dx - 2, -39); ctx.lineTo(dx + 2, -43); ctx.stroke();
    }
  } else if (o.horns === 'moose') {
    ctx.fillStyle = '#c0a476';
    ctx.beginPath(); ctx.moveTo(13, -31); ctx.quadraticCurveTo(4, -44, 12, -44); ctx.quadraticCurveTo(9, -37, 16, -33); ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, -31); ctx.quadraticCurveTo(28, -45, 20, -44); ctx.quadraticCurveTo(24, -37, 17, -33); ctx.fill();
  }
  if (o.tigerStripes) { // тигриные полосы по бокам
    ctx.strokeStyle = 'rgba(30,20,10,0.75)'; ctx.lineWidth = 2.2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-11 + i * 5.5, -25); ctx.quadraticCurveTo(-13 + i * 5.5, -17, -10 + i * 5.5, -9); ctx.stroke(); }
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  }
  if (o.ribs) { // проступающие рёбра — у Суки
    ctx.strokeStyle = 'rgba(230,225,210,0.55)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 5, -25); ctx.quadraticCurveTo(-12 + i * 5, -17, -9 + i * 5, -10); ctx.stroke(); }
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  }
  if (o.bloodMouth) { // кровь, текущая из пасти
    ctx.strokeStyle = '#8c1f16'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(24, -21); ctx.quadraticCurveTo(25, -14, 24, -8 + Math.sin(time * 5) * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(21, -20); ctx.lineTo(21.5, -14); ctx.stroke();
    ctx.fillStyle = '#8c1f16'; ctx.beginPath(); ctx.ellipse(23, -21, 3.5, 1.6, 0.35, 0, 6.283); ctx.fill();
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  }
  if (o.catFace) { // морда кота-баюна: светящиеся глаза и усы
    ctx.fillStyle = '#b9e84a';
    ctx.beginPath(); ctx.arc(16, -27, 1.7, 0, 6.283); ctx.arc(20.5, -27, 1.7, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#14100a';
    ctx.beginPath(); ctx.ellipse(16, -27, 0.6, 1.4, 0, 0, 6.283); ctx.ellipse(20.5, -27, 0.6, 1.4, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(230,230,220,0.7)'; ctx.lineWidth = 0.9;
    for (const dy of [-24, -22.5, -21]) { ctx.beginPath(); ctx.moveTo(24, dy); ctx.lineTo(31, dy - 1); ctx.stroke(); }
    ctx.fillStyle = o.body; // острые уши
    ctx.beginPath(); ctx.moveTo(19, -30); ctx.lineTo(21, -37); ctx.lineTo(24, -30); ctx.fill();
    ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.6)';
  }
  ctx.restore();
}

// --- орёл-стервятник (летает) ---
function drawEagle(ctx, time, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 6, 14 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const fl = Math.sin(time * (o.swoop ? 18 : 7) + (o.phase || 0));
  const hover = o.swoop ? 0 : Math.sin(time * 2 + (o.phase || 0)) * 4;
  ctx.translate(0, -26 + hover);
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(15,10,5,0.65)';
  // крылья
  ctx.fillStyle = '#4a3a26';
  for (const dir of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(dir * 3, -4);
    ctx.quadraticCurveTo(dir * 16, -14 - fl * 9, dir * 30, -8 - fl * 12);
    ctx.quadraticCurveTo(dir * 20, -2 + fl * 2, dir * 4, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // тело
  ctx.fillStyle = '#5e4a30';
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  // голова с крючковатым клювом
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath(); ctx.arc(8, -4, 4.5, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e8b23a';
  ctx.beginPath(); ctx.moveTo(12, -5); ctx.quadraticCurveTo(17, -4, 13, -1); ctx.lineTo(11.5, -3); ctx.fill();
  ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(8.5, -5.5, 1.1, 0, 6.283); ctx.fill();
  // когти
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-2, 5); ctx.lineTo(-2, 9); ctx.moveTo(2, 5); ctx.lineTo(2, 9); ctx.stroke();
  ctx.restore();
}

// --- чудо-юдо: огромное чёрное сухопутное нечто вроде кита ---
function drawChudo(ctx, time, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 2, 52 * s, 14 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const breathe = Math.sin(time * 1.6 + (o.phase || 0)) * 2.5;
  const w = o.walk ? Math.sin(time * 6) : 0;
  ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  // ласты-лапы
  ctx.fillStyle = '#14141a';
  ctx.beginPath(); ctx.ellipse(-28 + w * 3, -4, 12, 5, 0.3, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(20 - w * 3, -4, 12, 5, -0.3, 0, 6.283); ctx.fill();
  // туша
  ctx.fillStyle = '#1c1c24';
  ctx.beginPath(); ctx.ellipse(0, -24 - breathe * 0.5, 50, 24 + breathe, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.ellipse(-10, -34 - breathe * 0.5, 30, 10, 0.1, 0, 6.283); ctx.fill();
  // хвост
  ctx.fillStyle = '#1c1c24';
  ctx.beginPath(); ctx.moveTo(-44, -22); ctx.quadraticCurveTo(-62, -28 + Math.sin(time * 2.5) * 6, -66, -14);
  ctx.quadraticCurveTo(-58, -14, -46, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
  // морда: маленькие белёсые глаза и огромная пасть
  ctx.fillStyle = '#d8d8d0';
  ctx.beginPath(); ctx.arc(30, -34, 2.4, 0, 6.283); ctx.arc(40, -30, 2.4, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(30.5, -34, 1, 0, 6.283); ctx.arc(40.5, -30, 1, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(22, -16); ctx.quadraticCurveTo(38, -10, 50, -18); ctx.stroke();
  ctx.fillStyle = '#e8dcc0'; // зубы
  for (let i = 0; i < 5; i++) { const tx2 = 25 + i * 5.5; ctx.beginPath(); ctx.moveTo(tx2, -15 + i * 0.4); ctx.lineTo(tx2 + 2, -10.5 + i * 0.4); ctx.lineTo(tx2 + 4, -15 + i * 0.4); ctx.fill(); }
  // фонтанчик пара из дыхала
  if (Math.sin(time * 1.1 + (o.phase || 0)) > 0.6) {
    ctx.fillStyle = 'rgba(180,180,190,0.3)';
    ctx.beginPath(); ctx.arc(8, -52 - (time * 26 % 12), 4, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}

// --- драконы (малый / большой / огромный — один рисунок, разный масштаб и цвет) ---
function drawDragon(ctx, time, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 4, 22 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const fl = Math.sin(time * 6 + (o.phase || 0));
  const hover = Math.sin(time * 2.2 + (o.phase || 0)) * 3;
  ctx.translate(0, -14 + hover);
  ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(10,15,5,0.7)';
  // крылья
  ctx.fillStyle = o.wing;
  for (const dir of [-1, 1]) {
    ctx.save(); ctx.scale(1, 1);
    ctx.beginPath(); ctx.moveTo(-2, -18);
    ctx.quadraticCurveTo(-14 * dir - 6, -34 - fl * 8, -26 * dir - 4, -22 - fl * 10);
    ctx.quadraticCurveTo(-16 * dir - 4, -18, -2, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // хвост
  ctx.strokeStyle = o.body; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-12, -12); ctx.quadraticCurveTo(-26, -8 + Math.sin(time * 3) * 4, -30, -16); ctx.stroke();
  ctx.fillStyle = o.body;
  ctx.beginPath(); ctx.moveTo(-33, -20); ctx.lineTo(-27, -13); ctx.lineTo(-35, -12); ctx.fill();
  ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(10,15,5,0.7)';
  // тело
  ctx.fillStyle = o.body;
  ctx.beginPath(); ctx.ellipse(0, -12, 15, 10, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = o.belly; ctx.beginPath(); ctx.ellipse(2, -8, 10, 5.5, 0, 0, 6.283); ctx.fill();
  // шея и голова
  ctx.fillStyle = o.body;
  ctx.beginPath(); ctx.moveTo(8, -18); ctx.quadraticCurveTo(16, -30, 14, -34); ctx.lineTo(22, -34); ctx.quadraticCurveTo(20, -24, 14, -14); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(20, -35, 8, 5.5, 0.15, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd76e'; ctx.beginPath(); ctx.arc(21, -37, 1.6, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(21.5, -37, 0.8, 0, 6.283); ctx.fill();
  // рожки и гребень
  ctx.fillStyle = o.crest;
  ctx.beginPath(); ctx.moveTo(15, -39); ctx.lineTo(12, -46); ctx.lineTo(18, -41); ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(2 - i * 6, -21 + i); ctx.lineTo(0 - i * 6, -27 + i); ctx.lineTo(-3 - i * 6, -20 + i); ctx.fill(); }
  // лапы
  ctx.fillStyle = o.body; ctx.fillRect(-8, -4, 5, 6); ctx.fillRect(4, -4, 5, 6);
  // дымок из ноздрей
  if (Math.sin(time * 1.7 + (o.phase || 0)) > 0.55) {
    ctx.fillStyle = 'rgba(200,200,200,0.35)';
    ctx.beginPath(); ctx.arc(28 + Math.sin(time * 5) * 2, -36 - (time * 20 % 8), 2.5, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}

// --- особые звери ---
function drawBird(ctx, time, o) { // пигалица
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 0, 6 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const hop = o.walk ? Math.abs(Math.sin(time * 14)) * 4 : 0;
  ctx.translate(0, -hop);
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(10,10,5,0.6)';
  ctx.strokeStyle = '#3a3226'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-2, 4); ctx.moveTo(2, 0); ctx.lineTo(2, 4); ctx.stroke();
  ctx.fillStyle = '#2e4034';
  ctx.beginPath(); ctx.ellipse(0, -5, 7, 5, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.ellipse(1, -3.4, 4, 2.6, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#26352b'; ctx.beginPath(); ctx.arc(6, -9, 3.4, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e8b23a'; ctx.beginPath(); ctx.moveTo(9, -9); ctx.lineTo(13, -8.2); ctx.lineTo(9, -7.4); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6.8, -9.8, 1, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#14100a'; ctx.beginPath(); ctx.arc(7, -9.8, 0.6, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#26352b'; ctx.lineWidth = 1.6; // хохолок
  ctx.beginPath(); ctx.moveTo(5, -12); ctx.quadraticCurveTo(2, -16, 0, -14); ctx.stroke();
  ctx.restore();
}

function drawKikimora(ctx, time, o) {
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 0, 10 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const sway = Math.sin(time * 3 + (o.phase || 0)) * 2;
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(10,15,5,0.65)';
  ctx.fillStyle = '#5a6b3a'; // тельце-кочка в лохмотьях
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-8 + sway, -22, 0 + sway, -24);
  ctx.quadraticCurveTo(8 + sway, -22, 10, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#46552c'; ctx.lineWidth = 1.6; // висящие водоросли-волосы
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 2.6 + sway, -20); ctx.quadraticCurveTo(i * 3 + sway, -10, i * 3.2, -1 + Math.sin(time * 4 + i)); ctx.stroke(); }
  ctx.fillStyle = '#8fae4f'; // лицо
  ctx.beginPath(); ctx.arc(sway, -19, 6, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e8f04a';
  ctx.beginPath(); ctx.arc(sway - 2, -20, 1.8, 0, 6.283); ctx.arc(sway + 3, -20, 1.8, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#14100a';
  ctx.beginPath(); ctx.arc(sway - 2, -20, 0.8, 0, 6.283); ctx.arc(sway + 3, -20, 0.8, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#3a4a20'; ctx.beginPath(); ctx.moveTo(sway - 2, -15); ctx.quadraticCurveTo(sway + 1, -13.5, sway + 4, -15.5); ctx.stroke();
  ctx.restore();
}

function drawZhopa(ctx, time, o) { // жопа с ушами — легендарный зверь
  const s = o.s || 1;
  ctx.save(); ctx.translate(o.x, o.y);
  shadow(ctx, 0, 0, 11 * s);
  if (o.face < 0) ctx.scale(-1, 1);
  ctx.scale(s, s);
  const waddle = o.walk ? Math.sin(time * 12) * 0.12 : 0;
  ctx.rotate(waddle);
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(60,20,20,0.6)';
  ctx.fillStyle = '#e8a0a0'; // ножки
  ctx.fillRect(-8, -6, 5, 6); ctx.fillRect(3, -6, 5, 6);
  // две розовые половинки
  ctx.fillStyle = '#f0b4b4';
  ctx.beginPath(); ctx.arc(-6, -16, 9.5, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(6, -16, 9.5, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#c07878'; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -8); ctx.stroke();
  // глазки
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-5, -19, 2.6, 0, 6.283); ctx.arc(5, -19, 2.6, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#14100a';
  ctx.beginPath(); ctx.arc(-4.4, -19, 1.2, 0, 6.283); ctx.arc(5.6, -19, 1.2, 0, 6.283); ctx.fill();
  // большие уши
  ctx.fillStyle = '#f0b4b4';
  ctx.beginPath(); ctx.ellipse(-10, -30 + Math.sin(time * 5) * 1.5, 4.5, 8.5, -0.3, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(10, -30 + Math.cos(time * 5) * 1.5, 4.5, 8.5, 0.3, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d88888';
  ctx.beginPath(); ctx.ellipse(-10, -30, 2.2, 5.5, -0.3, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -30, 2.2, 5.5, 0.3, 0, 6.283); ctx.fill();
  ctx.restore();
}

// --- деревья ---
function drawTree(ctx, time, tr, windX) {
  const s = tr.size;
  const sway = Math.sin(time * 1.2 + tr.phase) * 1.6 + tr.bend * 18 + windX;
  ctx.save(); ctx.translate(tr.x, tr.y);
  if (!tr.alive) { // пень от срубленного
    ctx.fillStyle = '#8a6b3f'; ctx.strokeStyle = '#4a3416'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, -3, 7 * s, 4 * s, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c9b68a'; ctx.beginPath(); ctx.ellipse(0, -4.5, 5.5 * s, 3 * s, 0, 0, 6.283); ctx.fill();
    ctx.restore(); return;
  }
  shadow(ctx, 2, 0, 13 * s, 5 * s);
  ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(20,20,10,0.5)';
  if (tr.kind === 'birch') {
    ctx.fillStyle = '#f2f0e8';
    ctx.beginPath(); ctx.moveTo(-3.2 * s, 0); ctx.quadraticCurveTo(-2 * s + sway * 0.4, -30 * s, -1.4 * s + sway, -52 * s);
    ctx.lineTo(1.4 * s + sway, -52 * s); ctx.quadraticCurveTo(2 * s + sway * 0.4, -30 * s, 3.2 * s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2b2b22';
    for (let i = 1; i < 6; i++) { const yy = -i * 8 * s, sw = sway * (i / 6); ctx.fillRect(-2.6 * s + sw * 0.7 + (i % 2), yy, 3 * s, 1.6); }
    const g = tr.watered > 0 ? '#7fc456' : '#94c25a';
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(sway, -58 * s, 15 * s, 13 * s, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,220,0.25)';
    ctx.beginPath(); ctx.ellipse(sway - 4 * s, -62 * s, 8 * s, 6 * s, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = tr.watered > 0 ? '#5da53c' : '#7aa844';
    ctx.beginPath(); ctx.ellipse(sway + 5 * s, -52 * s, 8 * s, 6.5 * s, 0, 0, 6.283); ctx.fill();
  } else if (tr.kind === 'spruce') {
    ctx.fillStyle = '#5e441f';
    ctx.fillRect(-2.2 * s + sway * 0.2, -14 * s, 4.4 * s, 14 * s);
    for (let i = 0; i < 3; i++) {
      const yy = -10 * s - i * 14 * s, ww = (22 - i * 5.5) * s, sw = sway * (0.3 + i * 0.35);
      ctx.fillStyle = i % 2 ? '#2e5c33' : '#38683c';
      ctx.beginPath(); ctx.moveTo(-ww + sw * 0.5, yy); ctx.lineTo(sw, yy - 20 * s); ctx.lineTo(ww + sw * 0.5, yy); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else { // oak
    ctx.fillStyle = '#6b4c22';
    ctx.beginPath(); ctx.moveTo(-4.5 * s, 0); ctx.quadraticCurveTo(-3 * s + sway * 0.5, -25 * s, -2 * s + sway, -40 * s);
    ctx.lineTo(2 * s + sway, -40 * s); ctx.quadraticCurveTo(3 * s + sway * 0.5, -25 * s, 4.5 * s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4e7a34';
    ctx.beginPath(); ctx.ellipse(sway, -48 * s, 19 * s, 15 * s, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5f8f3e';
    ctx.beginPath(); ctx.ellipse(sway - 7 * s, -54 * s, 9 * s, 7 * s, 0, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}

// --- изба ---
function drawIzba(ctx, b, time) {
  ctx.save(); ctx.translate(b.x, b.y);
  const w = b.w, h = b.h;
  ctx.fillStyle = 'rgba(20,25,10,0.3)';
  ctx.beginPath(); ctx.ellipse(0, h / 2, w * 0.62, 9, 0, 0, 6.283); ctx.fill();
  const logC = b.burnt ? '#3a3230' : '#8a6535', logD = b.burnt ? '#28211f' : '#6e4f26';
  for (let i = 0; i < 5; i++) { // сруб-брёвна
    ctx.fillStyle = i % 2 ? logC : logD;
    ctx.fillRect(-w / 2, h / 2 - 10 - i * 9, w, 9);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-w / 2, h / 2 - 10 - i * 9 + 7, w, 2);
  }
  // торцы брёвен
  ctx.fillStyle = b.burnt ? '#4a403c' : '#c9a26a';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-w / 2, h / 2 - 5.5 - i * 9, 4, 0, 6.283); ctx.arc(w / 2, h / 2 - 5.5 - i * 9, 4, 0, 6.283); ctx.fill(); }
  // крыша
  ctx.fillStyle = b.burnt ? '#2e2624' : '#5e4426';
  ctx.beginPath(); ctx.moveTo(-w / 2 - 9, h / 2 - 52); ctx.lineTo(0, h / 2 - 78); ctx.lineTo(w / 2 + 9, h / 2 - 52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = b.burnt ? '#1a1512' : '#3d2c14'; ctx.lineWidth = 2; ctx.stroke();
  if (!b.burnt) {
    ctx.fillStyle = '#c9a26a'; // конёк-резьба
    ctx.beginPath(); ctx.moveTo(-4, h / 2 - 78); ctx.lineTo(0, h / 2 - 86); ctx.lineTo(4, h / 2 - 78); ctx.fill();
    // окно со ставнями
    ctx.fillStyle = '#2b1f10'; ctx.fillRect(-9, h / 2 - 38, 18, 15);
    ctx.fillStyle = '#ffd76e'; ctx.globalAlpha = 0.75 + Math.sin(time * 2 + b.x) * 0.15;
    ctx.fillRect(-7, h / 2 - 36, 14, 11); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#2b1f10'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, h / 2 - 36); ctx.lineTo(0, h / 2 - 25); ctx.moveTo(-7, h / 2 - 30.5); ctx.lineTo(7, h / 2 - 30.5); ctx.stroke();
    ctx.fillStyle = '#7db3d6'; ctx.fillRect(-13, h / 2 - 39, 4, 17); ctx.fillRect(9, h / 2 - 39, 4, 17); // ставни
  } else { // дым от пожарища
    ctx.fillStyle = 'rgba(80,80,80,0.25)';
    const sm = (time * 12) % 30;
    ctx.beginPath(); ctx.arc(6 + Math.sin(time * 2) * 4, h / 2 - 70 - sm, 6 + sm * 0.3, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}

// --- мелкие объекты ---
function drawProp(ctx, p, time) {
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(20,15,5,0.5)';
  switch (p.type) {
    case 'stone':
      shadow(ctx, 0, 0, 11);
      ctx.fillStyle = '#8d8f88'; ctx.beginPath();
      ctx.moveTo(-11, 0); ctx.quadraticCurveTo(-10, -12, -2, -13); ctx.quadraticCurveTo(9, -13, 11, -3); ctx.quadraticCurveTo(11, 0, 8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(-4, -9, 4, 2.5, -0.4, 0, 6.283); ctx.fill();
      break;
    case 'bush':
      shadow(ctx, 0, 0, 10);
      ctx.fillStyle = '#4e7a34';
      ctx.beginPath(); ctx.arc(-5, -6, 6.5, 0, 6.283); ctx.arc(4, -7, 7, 0, 6.283); ctx.arc(0, -3, 6, 0, 6.283); ctx.fill();
      if (!p.used) { ctx.fillStyle = '#c22f3e'; for (const [bx, by] of [[-5, -8], [2, -10], [6, -5], [-1, -4]]) { ctx.beginPath(); ctx.arc(bx, by, 1.7, 0, 6.283); ctx.fill(); } }
      break;
    case 'mushroom':
      ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-2, -7, 4, 7);
      ctx.fillStyle = p.used ? '#8d8f88' : '#c23b30';
      ctx.beginPath(); ctx.ellipse(0, -7, 7, 4.5, 0, 3.14, 6.283); ctx.fill(); ctx.stroke();
      if (!p.used) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-3, -9, 1.2, 0, 6.283); ctx.arc(2, -10, 1.2, 0, 6.283); ctx.fill(); }
      break;
    case 'flowers':
      for (const [fx, fy, c] of [[-6, -2, '#e8e14a'], [0, -5, '#d67ab8'], [6, -1, '#7db3d6'], [3, 2, '#e8e14a']]) {
        ctx.strokeStyle = '#4e7a34'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(fx, fy + 4); ctx.lineTo(fx, fy - 2); ctx.stroke();
        ctx.fillStyle = c;
        for (let i = 0; i < 5; i++) { const a = i * 1.257 + time * 0.4; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 2.4, fy - 3 + Math.sin(a) * 2.4, 1.6, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = '#a8531a'; ctx.beginPath(); ctx.arc(fx, fy - 3, 1.4, 0, 6.283); ctx.fill();
      }
      break;
    case 'stump':
      shadow(ctx, 0, 0, 9);
      ctx.fillStyle = '#8a6b3f'; ctx.beginPath(); ctx.ellipse(0, -3, 8, 5, 0, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9b68a'; ctx.beginPath(); ctx.ellipse(0, -5, 6.5, 3.6, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#8a6b3f'; ctx.beginPath(); ctx.ellipse(0, -5, 3.5, 1.8, 0, 0, 6.283); ctx.stroke();
      break;
    case 'well':
      shadow(ctx, 0, 2, 16);
      ctx.fillStyle = '#7d7f78'; ctx.beginPath(); ctx.ellipse(0, -4, 14, 8, 0, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b3d4a'; ctx.beginPath(); ctx.ellipse(0, -5, 10, 5.5, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#5e4426'; ctx.fillRect(-12, -34, 4, 30); ctx.fillRect(8, -34, 4, 30);
      ctx.beginPath(); ctx.moveTo(-15, -32); ctx.lineTo(0, -44); ctx.lineTo(15, -32); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#3d2c14'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -14); ctx.stroke();
      ctx.fillStyle = '#8a6535'; ctx.fillRect(-3.5, -15, 7, 6);
      break;
    case 'chest':
      shadow(ctx, 0, 0, 13);
      ctx.fillStyle = p.used ? '#5e4a2a' : '#8a6535';
      ctx.fillRect(-12, -13, 24, 13); ctx.strokeRect(-12, -13, 24, 13);
      ctx.beginPath(); ctx.ellipse(0, -13, 12, 5, 0, 3.14, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a94f'; ctx.fillRect(-12, -9, 24, 2.4); ctx.fillRect(-2, -12, 4, 7);
      if (!p.used) { ctx.fillStyle = 'rgba(255,225,120,0.5)'; ctx.beginPath(); ctx.arc(0, -16, 3 + Math.sin(time * 4) * 1.2, 0, 6.283); ctx.fill(); }
      break;
    case 'spring': // родник с живой водой
      shadow(ctx, 0, 2, 15);
      ctx.fillStyle = '#8d8f88'; ctx.beginPath(); ctx.ellipse(0, -2, 15, 8, 0, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.used ? '#4a6a80' : '#6ac4e8';
      ctx.beginPath(); ctx.ellipse(0, -3, 11, 5.5, 0, 0, 6.283); ctx.fill();
      if (!p.used) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 3; i++) { const a = time * 2 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * 6, -3 + Math.sin(a) * 2.5, 1.1, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = 'rgba(120,220,255,' + (0.25 + Math.sin(time * 3) * 0.15) + ')';
        ctx.beginPath(); ctx.ellipse(0, -3, 14, 7, 0, 0, 6.283); ctx.fill(); // сияние живой воды
      }
      break;
    case 'hive': // дикий улей-борть
      shadow(ctx, 0, 0, 8);
      ctx.fillStyle = '#5e4426'; ctx.fillRect(-2.5, -34, 5, 34);
      ctx.fillStyle = p.used ? '#8a7550' : '#c9902e';
      ctx.beginPath(); ctx.ellipse(0, -26, 8, 10, 0, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#8a6220';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -30 + i * 4.5, 7 - i * 0.5, 2, 0, 0, 3.14); ctx.stroke(); }
      ctx.fillStyle = '#2b1f10'; ctx.beginPath(); ctx.arc(0, -22, 2, 0, 6.283); ctx.fill();
      if (!p.used) { // пчёлы
        ctx.fillStyle = '#e8b23a';
        for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * (10 + i), -24 + Math.sin(a * 1.3) * 8, 1.1, 0, 6.283); ctx.fill(); }
      }
      break;
    case 'bones': // обглоданные кости у логова людоеда
      shadow(ctx, 0, 0, 12);
      ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(6, -8); ctx.stroke(); // кость крест-накрест
      ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(7, -2); ctx.stroke();
      ctx.fillStyle = '#e8dcc0';
      for (const [bx, by] of [[-9, -3], [6, -8], [-7, -9], [7, -2]]) { ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, 6.283); ctx.fill(); }
      ctx.beginPath(); ctx.arc(10, -6, 5.5, 0, 6.283); ctx.fill(); ctx.stroke(); // череп
      ctx.fillStyle = '#2b2118';
      ctx.beginPath(); ctx.arc(8.5, -7, 1.3, 0, 6.283); ctx.arc(12, -7, 1.3, 0, 6.283); ctx.fill();
      ctx.fillRect(8, -3.5, 4, 1.6); // зубы
      break;
    case 'pole': // столб с верёвками для пленников
      shadow(ctx, 0, 0, 7);
      ctx.fillStyle = '#5e4426'; ctx.fillRect(-3, -42, 6, 42); ctx.strokeRect(-3, -42, 6, 42);
      ctx.strokeStyle = '#b09468'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4, -26); ctx.lineTo(4, -22); ctx.moveTo(-4, -18); ctx.lineTo(4, -14); ctx.stroke();
      break;
    case 'campfire': {
      shadow(ctx, 0, 0, 10);
      ctx.strokeStyle = '#4a3416'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(8, -5); ctx.moveTo(-7, -6); ctx.lineTo(8, -1); ctx.stroke();
      const f = Math.sin(time * 9 + p.x) * 2;
      ctx.fillStyle = '#e8622a';
      ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-3 + f, -18, 0, -22 + f); ctx.quadraticCurveTo(3 - f, -16, 6, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd23a';
      ctx.beginPath(); ctx.moveTo(-3, -4); ctx.quadraticCurveTo(-1 + f, -12, 0, -14 + f); ctx.quadraticCurveTo(1.5 - f, -10, 3, -4); ctx.closePath(); ctx.fill();
      break;
    }
    case 'table': { // пиршественный стол Калина с человечиной
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 8, 66, 12, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#6e4f26'; ctx.fillRect(-62, -6, 124, 14); ctx.strokeRect(-62, -6, 124, 14);
      ctx.fillStyle = '#8a6535'; ctx.fillRect(-62, -12, 124, 8); ctx.strokeRect(-62, -12, 124, 8);
      ctx.fillStyle = '#5e4426'; ctx.fillRect(-56, 6, 7, 12); ctx.fillRect(49, 6, 7, 12);
      // блюда с руками, ногами и головами
      ctx.fillStyle = '#b8bfc9';
      for (const dx of [-42, 0, 40]) { ctx.beginPath(); ctx.ellipse(dx, -12, 15, 5.5, 0, 0, 6.283); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = '#e8b48f'; // рука
      ctx.save(); ctx.translate(-46, -15); ctx.rotate(-0.2); ctx.fillRect(-8, -2, 18, 5);
      ctx.beginPath(); ctx.arc(11, 0, 3.4, 0, 6.283); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#e8b48f'; // нога
      ctx.save(); ctx.translate(38, -15); ctx.rotate(0.15); ctx.fillRect(-11, -2.5, 20, 6);
      ctx.fillRect(7, -2.5, 7, 4); ctx.restore();
      // голова на блюде
      ctx.fillStyle = '#e8c49a'; ctx.beginPath(); ctx.arc(0, -17, 7, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8e14a'; ctx.beginPath(); ctx.arc(-1, -22, 6, 3.4, 6.0); ctx.fill(); // светлые волосы
      ctx.fillStyle = '#1c1208'; ctx.beginPath(); ctx.arc(-2.5, -18, 0.9, 0, 6.283); ctx.arc(2.5, -18, 0.9, 0, 6.283); ctx.fill();
      // кубки
      ctx.fillStyle = '#c9a94f';
      for (const dx of [-20, 22]) { ctx.fillRect(dx - 2.5, -20, 5, 8); ctx.beginPath(); ctx.ellipse(dx, -20, 4, 1.8, 0, 0, 6.283); ctx.fill(); }
      break;
    }
    case 'carpet': { // ковёр-самолёт Кощея (рисуется под ним)
      ctx.fillStyle = '#8c1f4a';
      const wv = Math.sin(time * 4) * 3;
      ctx.beginPath();
      ctx.moveTo(-26, -6 + wv * 0.5); ctx.quadraticCurveTo(-10, -12 - wv, 12, -7 + wv);
      ctx.quadraticCurveTo(26, -4 - wv * 0.5, 24, 2); ctx.quadraticCurveTo(6, 8 + wv, -16, 4 - wv);
      ctx.quadraticCurveTo(-28, 1, -26, -6 + wv * 0.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8c34d';
      ctx.beginPath(); ctx.ellipse(-1, -2, 13, 4, 0.05, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#8c1f4a'; ctx.beginPath(); ctx.ellipse(-1, -2, 7, 2, 0.05, 0, 6.283); ctx.fill();
      break;
    }
  }
  ctx.restore();
}
