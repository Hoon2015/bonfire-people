/* ===== world.js : 계곡 지도, 길찾기, 그리기 ===== */
var N = 34, TW = 64, TH = 32, CLIFF_H = 66;
var FIRE = { i: 16.5, j: 16.5 };
function iso(i, j) { return [(i - j) * TW / 2, (i + j) * TH / 2]; }
function rj(i) { return 9.6 + Math.sin(i * 0.45) * 0.8; }
function hash2(i, j) { var s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); }
function dist(a, b) { var dx = a.i - b.i, dy = a.j - b.j; return Math.sqrt(dx * dx + dy * dy); }

var MAP = { type: [], walk: [], winter: false, img: null, ox: 0, oy: 0, scale: 1 };
function tileType(i, j, winter) {
  var r = rj(i);
  if (i < 6) return 'rock';
  var cj = j + 0.5;
  if (cj >= r - 0.9 && cj < r + 0.9) return (i === 13 || i === 14) ? 'ford' : 'water';
  var df = Math.hypot(i + 0.5 - FIRE.i, j + 0.5 - FIRE.j);
  if (df < 2.6) return 'dirt';
  if (cj >= r + 0.9 && cj < r + 1.8) return winter ? 'snowbank' : 'sand';
  if (i >= 22 && j >= 20) return winter ? 'snowforest' : 'forest';
  if (cj < r - 0.9) return winter ? 'snow' : 'meadow';
  if (winter) return 'snow';
  return 'grass';
}
var TCOL = {
  rock: ['#4E443C', '#544A41', '#4A4038'], water: ['#2F6A84', '#357591', '#2B627B'], ford: ['#6E7A7E', '#7A8488'], dirt: ['#6B5440', '#735B45', '#664F3B'],
  sand: ['#8A7A5C', '#94836A'], snowbank: ['#B9C6D0', '#C3CED8'], forest: ['#34482A', '#3A4F2E', '#30452A'], snowforest: ['#9AA8B4', '#A6B3BE'],
  meadow: ['#55703C', '#5C7842'], snow: ['#C9D3DD', '#D3DCE5', '#BCC7D2', '#DCE3EA'], grass: ['#4E6435', '#567040', '#49602F', '#52693A']
};
var TCOL_W = { rock: ['#AEB9C4', '#B8C2CC', '#A6B2BD'], water: ['#8FB3C6', '#9DC0D1', '#86AABD'] };

function buildMap(winter) {
  MAP.winter = winter; MAP.type = []; MAP.walk = [];
  for (var i = 0; i < N; i++) {
    MAP.type[i] = []; MAP.walk[i] = [];
    for (var j = 0; j < N; j++) { var t = tileType(i, j, winter); MAP.type[i][j] = t; MAP.walk[i][j] = !(t === 'rock' || t === 'water'); }
  }
  // 천막과 바위는 막는다
  [[18, 13], [13, 14], [12, 18]].forEach(function (p) { MAP.walk[p[0]][p[1]] = false; });
  renderMapImage();
}

function renderMapImage() {
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var w = N * TW + 120, h = N * TH + CLIFF_H + 200;
  MAP.ox = N * TW / 2 + 60; MAP.oy = CLIFF_H + 80; MAP.scale = dpr;
  var c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  var g = c.getContext('2d'); g.scale(dpr, dpr); g.translate(MAP.ox, MAP.oy);
  var W = MAP.winter;
  function poly(cx, cy, col) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + TW / 2, cy + TH / 2); g.lineTo(cx, cy + TH); g.lineTo(cx - TW / 2, cy + TH / 2); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1; g.stroke(); }
  for (var s = 0; s < 2 * N; s++) {
    for (var i = 0; i < N; i++) {
      var j = s - i; if (j < 0 || j >= N) continue;
      var t = MAP.type[i][j], p = iso(i, j), h0 = hash2(i, j);
      var pal = (W && TCOL_W[t]) || TCOL[t];
      var col = pal[Math.floor(h0 * pal.length) % pal.length];
      if (t === 'rock') { poly(p[0], p[1] - CLIFF_H, col); continue; }
      poly(p[0], p[1], col);
      if (t === 'ford') { g.fillStyle = '#9AA3A8'; g.beginPath(); g.ellipse(p[0] - 8, p[1] + 14, 7, 3.5, 0, 0, 7); g.ellipse(p[0] + 10, p[1] + 18, 6, 3, 0, 0, 7); g.fill(); }
      if ((t === 'grass' || t === 'meadow') && h0 > 0.7) { g.strokeStyle = 'rgba(160,190,110,0.35)'; g.beginPath(); g.moveTo(p[0] - 6, p[1] + 18); g.lineTo(p[0] - 4, p[1] + 12); g.moveTo(p[0] + 4, p[1] + 20); g.lineTo(p[0] + 6, p[1] + 13); g.stroke(); }
    }
    // 절벽 면: i=6 경계
    if (s >= 6) {
      var jj = s - 6;
      if (jj >= 0 && jj < N) {
        var a = iso(6, jj), b = iso(6, jj + 1);
        g.beginPath(); g.moveTo(a[0], a[1] - CLIFF_H); g.lineTo(b[0], b[1] - CLIFF_H); g.lineTo(b[0], b[1]); g.lineTo(a[0], a[1]); g.closePath();
        g.fillStyle = W ? '#5A5450' : '#3E332B'; g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.moveTo(a[0], a[1] - CLIFF_H * 0.35); g.lineTo(b[0], b[1] - CLIFF_H * 0.35); g.moveTo(a[0], a[1] - CLIFF_H * 0.7); g.lineTo(b[0], b[1] - CLIFF_H * 0.7); g.stroke();
        if (jj === 15 || jj === 16) { g.fillStyle = '#0A0705'; g.beginPath(); g.moveTo(a[0] + 6, a[1] - 3); g.lineTo(a[0] + 6, a[1] - 34); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 62, b[0] - 4, b[1] - 34); g.lineTo(b[0] - 4, b[1] - 3); g.closePath(); g.fill(); }
      }
    }
  }
  MAP.img = c;
}

/* A* 8방향 */
function findPath(si, sj, ti, tj) {
  si = Math.floor(si); sj = Math.floor(sj); ti = Math.floor(ti); tj = Math.floor(tj);
  if (ti < 0 || tj < 0 || ti >= N || tj >= N) return null;
  if (!MAP.walk[ti][tj]) { var best = null, bd = 99; for (var di = -2; di <= 2; di++) for (var dj = -2; dj <= 2; dj++) { var a = ti + di, b = tj + dj; if (a >= 0 && b >= 0 && a < N && b < N && MAP.walk[a][b]) { var d = Math.abs(di) + Math.abs(dj); if (d < bd) { bd = d; best = [a, b]; } } } if (!best) return null; ti = best[0]; tj = best[1]; }
  if (si < 0 || sj < 0 || si >= N || sj >= N) return null;
  var key = function (i, j) { return i * N + j; };
  var open = [[si, sj]], g = {}, f = {}, came = {}, closed = {};
  g[key(si, sj)] = 0; f[key(si, sj)] = Math.hypot(ti - si, tj - sj);
  var guard = 0;
  while (open.length && guard++ < 3000) {
    var bi = 0; for (var k = 1; k < open.length; k++) if (f[key(open[k][0], open[k][1])] < f[key(open[bi][0], open[bi][1])]) bi = k;
    var cur = open.splice(bi, 1)[0], ck = key(cur[0], cur[1]);
    if (cur[0] === ti && cur[1] === tj) { var path = []; var kk = ck; while (kk !== undefined) { path.unshift([Math.floor(kk / N) + 0.5, kk % N + 0.5]); kk = came[kk]; } return path; }
    closed[ck] = true;
    for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      var ni = cur[0] + dx, nj = cur[1] + dy; if (ni < 0 || nj < 0 || ni >= N || nj >= N || !MAP.walk[ni][nj]) continue;
      if (dx && dy && (!MAP.walk[cur[0] + dx][cur[1]] || !MAP.walk[cur[0]][cur[1] + dy])) continue;
      var nk = key(ni, nj); if (closed[nk]) continue;
      var ng = g[ck] + (dx && dy ? 1.414 : 1);
      if (g[nk] === undefined || ng < g[nk]) { g[nk] = ng; f[nk] = ng + Math.hypot(ti - ni, tj - nj); came[nk] = ck; if (!open.some(function (o) { return o[0] === ni && o[1] === nj; })) open.push([ni, nj]); }
    }
  }
  return null;
}

/* ===== 그리기 도구 ===== */
var P2 = {};
function p2(d) { return P2[d] || (P2[d] = new Path2D(d)); }
var SPR = {
  calm: ['n', '', 'M3 -36.6 Q4.6 -35.6 6.2 -36.6', 0, 0.1],
  warm: ['h', '', 'M2.4 -37 Q4.6 -34.6 6.8 -37', 0, 0.35],
  joy: ['h', 'M-0.6 -48.6 Q1.6 -50 3.6 -48.6 M5.2 -48.6 Q7.2 -50 9.2 -48.6', 'M2 -37.6 Q4.6 -37.6 7.2 -37.6 Q6.4 -33.6 4.6 -33.6 Q2.8 -33.6 2 -37.6 Z', 1, 0.6],
  sing: ['h', 'M-0.6 -48.6 Q1.6 -50 3.6 -48.6 M5.2 -48.6 Q7.2 -50 9.2 -48.6', 'M3 -36.4 A1.6 2 0 1 0 6.2 -36.4 A1.6 2 0 1 0 3 -36.4 Z', 1, 0.5],
  moved: ['h', 'M-0.6 -46.4 L3.6 -48 M5.2 -48 L9.2 -46.4', 'M2.4 -37 Q4.6 -34.6 6.8 -37', 0, 0.6, 1],
  shy: ['n', 'M-0.6 -46.6 L3.6 -47.8 M5.2 -47.8 L9.2 -46.6', 'M2.6 -36.4 Q3.6 -37.4 4.6 -36.4 Q5.6 -35.4 6.6 -36.4', 0, 0.95],
  surprise: ['w', 'M-0.6 -49.4 Q1.6 -51 3.6 -49.4 M5.2 -49.4 Q7.2 -51 9.2 -49.4', 'M3.4 -36 A1.3 1.8 0 1 0 6 -36 A1.3 1.8 0 1 0 3.4 -36 Z', 1, 0],
  fear: ['w', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M2.6 -36.4 Q3.6 -37.4 4.6 -36.4 Q5.6 -35.4 6.6 -36.4', 0, 0],
  worried: ['n', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M2.6 -35.6 Q4.6 -37.2 6.6 -35.6', 0, 0],
  determined: ['n', 'M-0.6 -48.4 L3.6 -46.4 M5.2 -46.4 L9.2 -48.4', 'M2.6 -36.4 L6.6 -36.4', 0, 0],
  frustrated: ['s', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M2.6 -35.4 Q4.6 -37.4 6.6 -35.4', 0, 0],
  gloom: ['d', 'M-0.6 -47 L3.6 -47 M5.2 -47 L9.2 -47', 'M3 -36 Q4.6 -37 6.2 -36', 0, 0],
  sleepy: ['c', '', 'M3.8 -36.2 A0.9 1.1 0 1 0 5.6 -36.2 A0.9 1.1 0 1 0 3.8 -36.2 Z', 1, 0.2],
  anger: ['g', 'M-0.6 -49 L3.6 -46 M5.2 -46 L9.2 -49', 'M2.4 -37.2 L6.8 -37.2 L6.8 -35.2 L2.4 -35.2 Z', 2, 0],
  jealous: ['g', 'M-0.6 -48.4 L3.6 -46.8 M5.2 -46.8 L9.2 -48.4', 'M2.8 -36.4 L6.4 -36.4', 0, 0],
  embarrassed: ['d', '', 'M2.6 -37 Q4.6 -35.4 6.6 -37', 0, 0.95],
  hurt: ['d', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M2.6 -35.8 Q4.6 -37 6.6 -35.8', 0, 0.1],
  lonely: ['n', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M3 -36.4 L6.2 -36.4', 0, 0],
  shame: ['d', 'M-0.6 -46.4 L3.6 -48.4 M5.2 -48.4 L9.2 -46.4', 'M3 -36.4 L6.2 -36.4', 0, 0.3],
  proud: ['h', '', 'M2.4 -37 Q4.6 -34.6 6.8 -37', 0, 0.3]
};
function sprKey(emo) {
  return { calm: 'calm', warm: 'warm', joy: 'joy', sing: 'sing', moved: 'moved', shy: 'shy', surprise: 'surprise', fear: 'fear', anxious: 'fear', worried: 'worried', determined: 'determined', frustrated: 'frustrated', disappoint: 'frustrated', sad: 'gloom', dejected: 'gloom', pessimism: 'gloom', despair: 'gloom', anger: 'anger', rage: 'anger', annoyed: 'jealous', grievance: 'jealous', embarrassed: 'embarrassed', sheepish: 'embarrassed', shame: 'shame', guilt: 'hurt', pride: 'proud', jealous: 'jealous', envy: 'jealous', hurt: 'hurt', relief: 'moved', bored: 'sleepy', lonely: 'lonely', eureka: 'joy', sleepy: 'sleepy', peace: 'warm', disgust: 'frustrated' }[emo] || 'calm';
}
var ARMS = { side: 'M6 -24 C11 -22 14 -19 16 -16', reach: 'M5 -26 C10 -32 14 -38 18 -44', hold: 'M6 -24 C11 -22 14 -19 16 -16', point: 'M6 -26 C12 -27 18 -28 24 -28', spear: 'M6 -24 C10 -26 13 -28 16 -30', carry: 'M6 -24 C10 -24 13 -21 15 -18', pat: 'M6 -26 C12 -30 18 -30 22 -27', cover: 'M5 -26 C8 -32 8 -38 6 -40' };
var BODY = 'M-11 -10 C-13 -22 -8 -31 0 -32 C8 -31 13 -22 11 -10 Z', FRINGE = 'M-12 -12 L-9 -6 L-6 -12 L-3 -6 L0 -12 L3 -6 L6 -12 L9 -6 L12 -12 Z', SHADE = 'M-11 -10 C-13 -22 -8 -31 0 -32 C-5 -26 -7 -18 -6 -10 Z';
var HAIR = 'M-12 -42 C-13 -57 10 -59 12 -46 C6 -50 -2 -50 -5 -44 C-7 -39 -9 -35 -12 -32 Z', LONGHAIR = 'M-12 -44 C-14 -30 -12 -22 -8 -18 L6 -18 C10 -24 12 -32 11 -44 Z';

function drawPerson(g, x, y, p, t, k) {
  var s = p.scale * k, dir = p.face < 0 ? -1 : 1;
  g.save(); g.translate(x, y);
  if (p.ghost) g.globalAlpha = 0.35;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 1, 14 * s, 5 * s, 0, 0, 7); g.fill();
  if (p.ring) { g.strokeStyle = 'rgba(243,233,215,0.75)'; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, 1, 22 * s, 11 * s, 0, 0, 7); g.stroke(); g.setLineDash([]); }
  g.scale(s * dir, s);
  if (p.pose === 'lie') {
    g.fillStyle = p.look.fur; g.beginPath(); g.ellipse(3, -6, 19, 8, 0, 0, 7); g.fill();
    g.fillStyle = p.look.skin; g.beginPath(); g.arc(-17, -8, 8.5, 0, 7); g.fill();
    g.fillStyle = p.look.hair; g.fill(p2('M-25 -8 C-26 -18 -10 -20 -10 -12 C-14 -14 -20 -12 -22 -6 Z'));
    g.restore(); return;
  }
  var walk = p.moving, bob = walk ? Math.abs(Math.sin(t * 12)) * -2 : Math.sin(t * 2.4 + p.seed) * -0.8;
  var mot = p.motion || 'idle';
  if (mot === 'hop') bob = -Math.abs(Math.sin(t * 7)) * 7;
  if (mot === 'bounce') bob = -Math.abs(Math.sin(t * 9)) * 3.5;
  if (mot === 'slump') bob = 2.4;
  if (mot === 'stomp') bob = -Math.abs(Math.sin(t * 8)) * 4;
  var shake = mot === 'tremble' ? Math.sin(t * 60) * 0.9 : 0;
  g.translate(shake, bob);
  if (p.pose === 'sit') { g.fillStyle = '#2E2118'; g.beginPath(); g.ellipse(3, -3, 14, 5, 0, 0, 7); g.fill(); g.translate(0, 8); }
  else {
    var sw = walk ? Math.sin(t * 12) * 0.35 : 0;
    g.fillStyle = '#2E2118'; g.save(); g.translate(-3.5, -12); g.rotate(sw); g.fillRect(-2.5, 0, 5, 12); g.restore();
    g.fillStyle = '#241A12'; g.save(); g.translate(3.5, -12); g.rotate(-sw); g.fillRect(-2.5, 0, 5, 12); g.restore();
  }
  var L = p.look;
  if (L.style === 'long') { g.fillStyle = L.hair; g.fill(p2(LONGHAIR)); }
  g.fillStyle = L.fur; g.fill(p2(BODY)); g.fill(p2(FRINGE));
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fill(p2(SHADE));
  if (p.lit) { g.fillStyle = 'rgba(255,178,92,' + p.lit + ')'; g.fill(p2('M4 -31 C10 -27 12 -18 11 -10 L7 -10 C8 -18 7 -25 2 -31 Z')); }
  if (L.shells || L.beads) { g.fillStyle = L.shells ? '#EFE3CC' : '#C2703A'; for (var b = 0; b < 4; b++) { g.beginPath(); g.arc(-4.5 + b * 3, -29 + Math.abs(b - 1.5) * 0.6, 1.1, 0, 7); g.fill(); } }
  // 팔
  var arm = ARMS[p.arm || 'side'];
  if (p.arm === 'pat') { g.save(); g.translate(0, Math.sin(t * 10) * 1.5); }
  if (p.spear) { g.strokeStyle = '#6B4E34'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(24, -62); g.lineTo(4, 6); g.stroke(); g.fillStyle = '#C4CBD2'; g.fill(p2('M22 -60 L27 -74 L28 -58 Z')); }
  g.strokeStyle = L.skin; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(p2(arm));
  if (p.arm === 'pat') g.restore();
  var hold = p.carry;
  if (hold) {
    if (hold === 'berry') { g.fillStyle = '#C0503A'; g.beginPath(); g.arc(17, -16, 3.2, 0, 7); g.arc(20, -14, 2.8, 0, 7); g.fill(); }
    else if (hold === 'wood') { g.strokeStyle = '#7A5638'; g.lineWidth = 3.2; g.beginPath(); g.moveTo(10, -14); g.lineTo(24, -22); g.moveTo(11, -18); g.lineTo(25, -16); g.stroke(); }
    else if (hold === 'meat') { g.fillStyle = '#9A5A34'; g.fill(p2('M13 -22 C20 -26 28 -22 26 -14 C24 -8 16 -8 13 -12 Z')); }
    else if (hold === 'herb') { g.fillStyle = '#6FA04A'; g.beginPath(); g.ellipse(18, -18, 3, 6, 0.5, 0, 7); g.ellipse(21, -16, 2.5, 5, -0.4, 0, 7); g.fill(); }
  }
  // 머리
  g.fillStyle = L.skin; g.beginPath(); g.arc(0, -42, 11.5, 0, 7); g.fill();
  g.fillStyle = L.hair; g.fill(p2(HAIR));
  if (L.style === 'tuft') { g.beginPath(); g.arc(-1, -55, 4.5, 0, 7); g.fill(); }
  if (L.band) { g.fillStyle = '#C2703A'; g.fillRect(-11, -50, 22, 2.6); }
  var S = SPR[sprKey(p.emo)] || SPR.calm;
  g.fillStyle = '#E0605A'; g.globalAlpha = (p.ghost ? 0.35 : 1) * S[4]; g.beginPath(); g.ellipse(8.4, -38.2, 2.4, 1.3, 0, 0, 7); g.fill(); g.globalAlpha = p.ghost ? 0.35 : 1;
  g.strokeStyle = '#1C130E'; g.fillStyle = '#1C130E'; g.lineWidth = 1.4; g.lineCap = 'round';
  var e = S[0];
  if (e === 'n') { var bl = ((t + p.seed) % 4) < 0.12 ? 0.3 : 2; g.beginPath(); g.ellipse(1.6, -43, 1.5, bl, 0, 0, 7); g.ellipse(7.2, -43, 1.5, bl, 0, 0, 7); g.fill(); }
  else if (e === 'h') g.stroke(p2('M-0.4 -42.4 Q1.6 -45.6 3.6 -42.4 M5.2 -42.4 Q7.2 -45.6 9.2 -42.4'));
  else if (e === 'c') g.stroke(p2('M-0.4 -43.2 Q1.6 -40.8 3.6 -43.2 M5.2 -43.2 Q7.2 -40.8 9.2 -43.2'));
  else if (e === 's') g.stroke(p2('M0 -45.2 L3 -43 L0 -40.8 M9 -45.2 L6 -43 L9 -40.8'));
  else if (e === 'd') g.stroke(p2('M-0.2 -43.8 Q1.6 -42.4 3.4 -43.8 M5.4 -43.8 Q7.2 -42.4 9 -43.8'));
  else if (e === 'g') { g.stroke(p2('M0 -44.2 L3.4 -43.6 M5.6 -43.6 L9 -44.2')); g.beginPath(); g.arc(2.4, -42.6, 1, 0, 7); g.arc(8, -42.6, 1, 0, 7); g.fill(); }
  else if (e === 'w') { g.fillStyle = '#fff'; g.beginPath(); g.arc(1.6, -43, 2.3, 0, 7); g.arc(7.4, -43, 2.3, 0, 7); g.fill(); g.lineWidth = 0.8; g.stroke(); g.fillStyle = '#1C130E'; g.beginPath(); g.arc(1.8, -43, 1, 0, 7); g.arc(7.6, -43, 1, 0, 7); g.fill(); }
  g.lineWidth = 1.2; g.strokeStyle = L.age === 'elder' ? '#CFC6B8' : '#2B1D14'; if (S[1]) g.stroke(p2(S[1]));
  g.strokeStyle = '#4A2018';
  if (S[3] === 1) { g.fillStyle = '#6B2A22'; g.fill(p2(S[2])); g.stroke(p2(S[2])); }
  else if (S[3] === 2) { g.fillStyle = '#F4EDE2'; g.fill(p2(S[2])); g.stroke(p2(S[2])); }
  else g.stroke(p2(S[2]));
  if (S[5]) { g.fillStyle = '#9FD3EA'; g.beginPath(); g.arc(7, -40 + ((t * 6) % 9), 1.2, 0, 7); g.fill(); }
  if (p.lit) { g.strokeStyle = 'rgba(255,201,138,' + p.lit + ')'; g.lineWidth = 2; g.stroke(p2('M8 -50 C12 -46 12 -38 8 -34')); }
  g.restore();
}

/* 말풍선 아이콘 */
var EMOTE = {
  heart: function (g) { g.fillStyle = '#E0605A'; g.fill(p2('M0 6 C-8 0 -8 -6 -4 -6.5 C-2 -6.8 -0.6 -5.6 0 -4.2 C0.6 -5.6 2 -6.8 4 -6.5 C8 -6 8 0 0 6 Z')); },
  excl: function (g) { g.fillStyle = '#E2771F'; g.fill(p2('M-1.8 -7 H1.8 L1.2 2 H-1.2 Z')); g.beginPath(); g.arc(0, 5, 1.8, 0, 7); g.fill(); },
  q: function (g) { g.strokeStyle = '#4A6FA5'; g.lineWidth = 2.2; g.lineCap = 'round'; g.stroke(p2('M-3.2 -3.5 A3.4 3.4 0 1 1 1.2 -0.4 C0 0.4 0 1.2 0 2.4')); g.fillStyle = '#4A6FA5'; g.beginPath(); g.arc(0, 5.4, 1.6, 0, 7); g.fill(); },
  note: function (g) { g.strokeStyle = '#E2771F'; g.lineWidth = 1.8; g.stroke(p2('M-2 4 V-5 L5 -6.5 V2.5')); g.fillStyle = '#E2771F'; g.beginPath(); g.arc(-3.6, 4.4, 2.2, 0, 7); g.arc(3.4, 3, 2.2, 0, 7); g.fill(); },
  sweat: function (g) { g.fillStyle = '#CBEAF6'; g.strokeStyle = '#5F93AD'; g.lineWidth = 1.2; var q = p2('M0 -7 C-3 -2 -4.5 1 -4.5 2.8 A4.5 4.5 0 0 0 4.5 2.8 C4.5 1 3 -2 0 -7 Z'); g.fill(q); g.stroke(q); },
  tear: function (g) { g.fillStyle = '#9FD3EA'; g.fill(p2('M0 -6 C-2.5 -2 -3.8 0.5 -3.8 2.2 A3.8 3.8 0 0 0 3.8 2.2 C3.8 0.5 2.5 -2 0 -6 Z')); },
  dots: function (g) { g.fillStyle = '#6E6254'; [-4.5, 0, 4.5].forEach(function (x) { g.beginPath(); g.arc(x, 0, 1.8, 0, 7); g.fill(); }); },
  spark: function (g) { g.fillStyle = '#E8A317'; g.fill(p2('M0 -7.5 L2 -2 L7.5 0 L2 2 L0 7.5 L-2 2 L-7.5 0 L-2 -2 Z')); },
  zz: function (g) { g.strokeStyle = '#6E86B8'; g.lineWidth = 1.6; g.stroke(p2('M-5 -4 H1 L-5 2 H1 M2 -6 H6 L2 -2 H6')); },
  storm: function (g) { g.fillStyle = '#4A4458'; g.fill(p2('M-6 0 C-9 0 -9 -4 -6 -5 C-6 -8 -1 -9 0 -6 C1 -9 6 -8 6 -5 C9 -4 9 0 6 0 Z')); g.strokeStyle = '#E8A317'; g.lineWidth = 1.4; g.stroke(p2('M0 0 L-2 4 L1 4 L-1 8')); },
  gloom: function (g) { g.strokeStyle = '#4A4E6A'; g.lineWidth = 1.8; g.lineCap = 'round'; g.stroke(p2('M-6 -6 V4 M-2 -7 V5 M2 -7 V5 M6 -6 V4')); },
  anger: function (g) { g.strokeStyle = '#C0503A'; g.lineWidth = 2; g.lineCap = 'round'; g.stroke(p2('M-5 -2 C-2 -2 -2 -5 -2 -6 M2 -6 C2 -3 2 -2 5 -2 M5 2 C2 2 2 5 2 6 M-2 6 C-2 3 -2 2 -5 2')); },
  eye: function (g) { g.fillStyle = '#fff'; g.strokeStyle = '#1C130E'; g.lineWidth = 1.2; var q = p2('M-7 0 Q0 -6 7 0 Q0 6 -7 0 Z'); g.fill(q); g.stroke(q); g.fillStyle = '#C0503A'; g.beginPath(); g.arc(2.6, 0, 2.2, 0, 7); g.fill(); },
  hand: function (g) { g.strokeStyle = '#6E6254'; g.lineWidth = 1.6; g.lineCap = 'round'; g.stroke(p2(GEST.wait ? PICTO.wait.d : '')); }
};
function drawEmote(g, x, y, key, t) {
  g.save(); g.translate(x, y + Math.sin(t * 4) * 1.5);
  g.fillStyle = '#FFFFFF'; g.strokeStyle = 'rgba(28,19,14,0.25)'; g.lineWidth = 1;
  var q = p2('M-11 0 A11 11 0 1 1 -4 10 L-9 14 L-7 8 A11 11 0 0 1 -11 0 Z'); g.fill(q); g.stroke(q);
  if (key === 'hand') { g.translate(-7.5, -7.5); g.scale(0.62, 0.62); g.strokeStyle = '#6E6254'; g.lineWidth = 2; g.stroke(p2(PICTO.wait.d)); }
  else if (EMOTE[key]) EMOTE[key](g);
  g.restore();
}
function drawPictoBubble(g, x, y, keys) {
  var n = keys.length, w = 22 + n * 26 + (n - 1) * 10;
  g.save(); g.translate(x - w / 2, y - 34);
  g.fillStyle = '#F3E9D7'; g.beginPath(); if (g.roundRect) g.roundRect(0, 0, w, 32, 11); else g.rect(0, 0, w, 32); g.fill();
  g.beginPath(); g.moveTo(w / 2 - 6, 32); g.lineTo(w / 2 + 6, 32); g.lineTo(w / 2, 39); g.fill();
  keys.forEach(function (k, i) {
    var P = PICTO[k] || GEST[k]; if (!P) return;
    g.save(); g.translate(11 + i * 36, 4); g.scale(1, 1);
    if (P.f) { g.fillStyle = '#2A231C'; g.fill(p2(P.d)); } else { g.strokeStyle = '#2A231C'; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(p2(P.d)); }
    g.restore();
    if (i < n - 1) { g.fillStyle = '#9C8F7E'; g.font = '700 13px sans-serif'; g.textAlign = 'center'; g.fillText('+', 11 + i * 36 + 30, 21); }
  });
  g.restore();
}

/* 사물 */
function drawTree(g, x, y, snowy, t, sd) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(8, 2, 24, 9, 0, 0, 7); g.fill();
  g.fillStyle = '#3A2618'; g.fillRect(-3, -15, 6, 15);
  g.rotate(Math.sin(t * 0.9 + sd) * 0.02);
  [['M0 -44 L-27 -11 L0 -15 Z', '#1E3426'], ['M0 -44 L27 -11 L0 -15 Z', '#2E4E36'], ['M0 -66 L-21 -36 L0 -39 Z', '#203828'], ['M0 -66 L21 -36 L0 -39 Z', '#33563C'], ['M0 -88 L-14 -58 L0 -60 Z', '#234030'], ['M0 -88 L14 -58 L0 -60 Z', '#3A6044']].forEach(function (a) { g.fillStyle = a[1]; g.fill(p2(a[0])); });
  if (snowy) { g.fillStyle = '#DDE5EC'; g.fill(p2('M0 -88 L-7 -74 L0 -76 L7 -74 Z M0 -66 L-10 -52 L0 -54 L10 -52 Z M0 -44 L-13 -28 L0 -31 L13 -28 Z')); }
  g.restore();
}
function drawBush(g, x, y, n, glow, winter) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(4, 2, 22, 8, 0, 0, 7); g.fill();
  g.fillStyle = winter ? '#4E5A44' : '#3E5A2C'; g.beginPath(); g.arc(-9, -10, 11, 0, 7); g.fill();
  g.fillStyle = winter ? '#56634B' : '#466632'; g.beginPath(); g.arc(9, -10, 11, 0, 7); g.fill();
  g.fillStyle = winter ? '#5E6B52' : '#4E6E36'; g.beginPath(); g.arc(0, -18, 12, 0, 7); g.fill();
  if (winter) { g.fillStyle = '#DDE5EC'; g.beginPath(); g.ellipse(0, -27, 9, 3.5, 0, 0, 7); g.ellipse(-10, -19, 6, 2.5, 0, 0, 7); g.fill(); }
  var spots = [[-6, -16], [5, -20], [10, -9], [-11, -7], [2, -10], [-2, -24]];
  g.fillStyle = '#C0503A'; for (var i = 0; i < Math.min(n, 6); i++) { g.beginPath(); g.arc(spots[i][0], spots[i][1], 2.8, 0, 7); g.fill(); }
  if (glow) { g.strokeStyle = 'rgba(244,178,102,' + glow + ')'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 2, 26, 12, 0, 0, 7); g.stroke(); }
  g.restore();
}
function drawWoodPile(g, x, y, n) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(0, 2, 16, 6, 0, 0, 7); g.fill();
  g.strokeStyle = '#6B4A30'; g.lineWidth = 4; g.lineCap = 'round';
  for (var i = 0; i < n; i++) { g.beginPath(); g.moveTo(-12 + i * 2, -2 - i * 4); g.lineTo(12 - i * 3, -6 - i * 3); g.stroke(); }
  g.restore();
}
function drawTent(g, x, y, warm, snowy) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(6, 10, 40, 14, 0, 0, 7); g.fill();
  g.strokeStyle = '#3A2618'; g.lineWidth = 2.5; g.lineCap = 'round'; g.stroke(p2('M-7 -94 L3 -70 M7 -94 L-3 -70 M0 -96 L0 -70'));
  g.fillStyle = '#7E5A3E'; g.fill(p2('M0 -76 L-36 0 L0 16 Z')); g.fillStyle = '#5A3F2B'; g.fill(p2('M0 -76 L36 0 L0 16 Z'));
  g.fillStyle = 'rgba(255,178,92,' + warm + ')'; g.fill(p2('M0 -76 L-36 0 L0 16 Z'));
  g.fillStyle = '#140D08'; g.fill(p2('M-6 13 L-16 -26 L-27 5 Z'));
  if (snowy) { g.fillStyle = '#DDE5EC'; g.fill(p2('M0 -76 L-12 -50 L0 -46 L12 -50 Z')); }
  g.restore();
}
function drawFire(g, x, y, fuel, t) {
  var fs = 0.45 + Math.min(1, fuel / 80) * 0.85;
  g.save(); g.translate(x, y);
  g.fillStyle = '#1A120D'; g.beginPath(); g.ellipse(0, 2, 34, 17, 0, 0, 7); g.fill();
  [[-26, 0, '#6A5A50'], [26, 0, '#7A6658'], [-14, 12, '#8A7464'], [14, 12, '#8A7464'], [0, -10, '#5E5048']].forEach(function (s) { g.fillStyle = s[2]; g.beginPath(); g.ellipse(s[0], s[1], 8, 5, 0, 0, 7); g.fill(); });
  g.strokeStyle = '#4A3222'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-18, 6); g.lineTo(18, -6); g.moveTo(-18, -6); g.lineTo(18, 6); g.stroke();
  if (fuel > 1) {
    var fl = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 13.7) * 0.04;
    g.save(); g.scale(fs, fs * fl);
    g.fillStyle = '#E2531B'; g.fill(p2('M0 -54 C14 -36 26 -20 22 -2 C18 10 -18 10 -22 -2 C-26 -18 -10 -26 -8 -38 C-4 -32 -2 -40 0 -54 Z'));
    g.fillStyle = '#F7931E'; g.fill(p2('M1 -40 C12 -26 18 -14 15 -2 C12 6 -12 6 -14 -2 C-16 -12 -6 -18 -4 -28 C-1 -24 0 -30 1 -40 Z'));
    g.fillStyle = '#FFD36B'; g.fill(p2('M1 -24 C7 -16 10 -8 8 -1 C6 4 -6 4 -8 -1 C-9 -7 -3 -11 -2 -17 C0 -15 1 -19 1 -24 Z'));
    g.restore();
  } else { g.fillStyle = '#5A4A40'; g.beginPath(); g.ellipse(0, -2, 10, 4, 0, 0, 7); g.fill(); }
  g.restore();
}
function drawSlab(g, x, y, glow) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#4A4038'; g.fill(p2('M-30 0 L0 14 L0 21 L-30 7 Z')); g.fillStyle = '#3A322C'; g.fill(p2('M0 14 L30 0 L30 7 L0 21 Z'));
  g.fillStyle = '#7A6E62'; g.fill(p2('M-30 0 L0 -14 L30 0 L0 14 Z'));
  g.strokeStyle = '#8A6646'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-18, 1); g.lineTo(15, -6); g.stroke();
  g.fillStyle = '#A9B2BC'; g.fill(p2('M-6 4 L2 -2 L8 5 Z'));
  if (glow) { g.strokeStyle = 'rgba(244,178,102,' + glow + ')'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 2, 40, 20, 0, 0, 7); g.stroke(); }
  g.restore();
}
function drawTrap(g, x, y, state) {
  g.save(); g.translate(x, y);
  g.strokeStyle = '#6B4A30'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-4, -14); g.moveTo(8, 0); g.lineTo(4, -14); g.moveTo(-6, -8); g.lineTo(6, -8); g.stroke();
  if (state === 'set') { g.strokeStyle = 'rgba(216,199,166,0.8)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 8, 4, 0, 0, 7); g.stroke(); }
  if (state === 'caught') { g.fillStyle = '#B8A890'; g.beginPath(); g.ellipse(0, -4, 7, 5, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-4, -11, 1.6, 4, -0.3, 0, 7); g.ellipse(-1, -11, 1.6, 4, 0.2, 0, 7); g.fill(); }
  g.restore();
}
function drawHerb(g, x, y, n) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#4E7A3A';
  for (var i = 0; i < 5; i++) { var a = -1.2 + i * 0.6; g.beginPath(); g.ellipse(Math.cos(a) * 6, -6 + Math.sin(a) * 3, 2.5, 7, a, 0, 7); g.fill(); }
  if (n > 0) { g.fillStyle = '#E8E0A0'; g.beginPath(); g.arc(0, -12, 2.4, 0, 7); g.fill(); }
  g.restore();
}
function drawBison(g, x, y, b, t) {
  g.save(); g.translate(x, y); g.scale(b.face, 1);
  if (b.down) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 4, 56, 14, 0, 0, 7); g.fill(); g.translate(0, 20); g.scale(1, 0.78); }
  else { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 2, 52, 14, 0, 0, 7); g.fill(); }
  var rear = b.rear ? Math.sin(t * 6) * 0.12 - 0.08 : 0;
  g.rotate(rear);
  if (!b.down) { g.fillStyle = '#2A1A10'; [-34, -22, 18, 29].forEach(function (lx, i) { g.fillRect(lx, -24 + (b.run ? Math.sin(t * 14 + i) * 2 : 0), 8, 24); }); }
  g.fillStyle = '#4A3020'; g.fill(p2('M-46 -32 C-48 -52 -32 -64 -8 -66 C12 -68 30 -62 38 -50 C46 -42 46 -28 40 -22 L-40 -20 C-46 -22 -47 -26 -46 -32 Z'));
  g.fillStyle = '#6B4A30'; g.fill(p2('M-32 -56 C-16 -68 12 -70 32 -58 C20 -62 -8 -62 -28 -52 Z'));
  g.fillStyle = '#3A2416'; g.fill(p2('M18 -62 C34 -64 48 -52 48 -36 C46 -26 40 -22 32 -20 C32 -32 28 -46 18 -62 Z'));
  g.save(); if (b.graze) g.translate(0, 8 + Math.sin(t * 1.5) * 2);
  g.fillStyle = '#2E1C12'; g.fill(p2('M42 -48 C54 -50 60 -42 58 -32 C56 -26 50 -24 44 -26 Z'));
  g.strokeStyle = '#D8CDBB'; g.lineWidth = 3; g.lineCap = 'round'; g.stroke(p2('M48 -48 C50 -56 56 -58 60 -54'));
  g.fillStyle = '#0A0705'; g.beginPath(); g.arc(52, -40, b.alert ? 2.4 : 1.6, 0, 7); g.fill();
  g.restore();
  if (MAP.winter) { g.strokeStyle = 'rgba(232,238,244,0.85)'; g.lineWidth = 3.5; g.stroke(p2('M-26 -60 C-10 -66 10 -66 28 -60')); }
  g.restore();
}
function drawWolf(g, x, y, w, t) {
  g.save(); g.translate(x, y); g.scale(w.face, 1);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(0, 2, 26, 7, 0, 0, 7); g.fill();
  g.fillStyle = '#5A5A60'; [-16, -9, 10, 16].forEach(function (lx, i) { g.fillRect(lx, -14 + Math.sin(t * 14 + i) * 1.5, 4, 14); });
  g.fill(p2('M-22 -18 C-20 -28 10 -30 18 -22 C22 -18 20 -12 14 -12 L-18 -12 Z'));
  g.fill(p2('M14 -24 L28 -30 L34 -24 L28 -18 L16 -16 Z')); g.fill(p2('M20 -30 L22 -38 L26 -30 Z'));
  g.strokeStyle = '#5A5A60'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-22, -18); g.quadraticCurveTo(-32, -22, -34, -14); g.stroke();
  g.fillStyle = '#FFD36B'; g.beginPath(); g.arc(27, -26, 1.4, 0, 7); g.fill();
  g.restore();
}
