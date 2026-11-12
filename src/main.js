/* ===== main.js : 그리기 루프, 화면 UI, 입력 ===== */
var CAM = { x: 0, y: 0 };
var LAST = 0;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = cv.clientWidth; VH = cv.clientHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  Z = clamp(Math.min(VW / 760, VH / 640) * 1.05, 0.62, 1.5);
}
window.addEventListener('resize', resize);

function frame(ts) {
  var raw = Math.min(0.05, (ts - LAST) / 1000 || 0); LAST = ts;
  if (G && G.running) {
    var dt = raw * G.speed;
    G.t += dt;
    tickClock(dt); runTimers(); stepFuel(dt); stepBison(dt);
    stepPlayer(dt);
    G.people.forEach(function (p) { if (!p.isMe) stepNPC(p, dt); });
    checkLonely(dt);
    stepSong();
    stepFx(dt);
    var mp = iso(G.me.i, G.me.j); CAM.x += (mp[0] - CAM.x) * Math.min(1, raw * 4); CAM.y += (mp[1] - 30 - CAM.y) * Math.min(1, raw * 4);
    render();
    renderHUD(false);
    placeHint();
  } else if (G) render();
  requestAnimationFrame(frame);
}
function stepPlayer(dt) {
  var me = G.me; decayEmo(me);
  if (me.follow && me.follow.leader) { var L = me.follow.leader; if ((!me.path || !me.path.length) && Math.hypot(me.i - L.i, me.j - L.j) > 1.3) goTo(me, L.i - 0.7, L.j + 0.7); }
  stepMove(me, dt);
}
function stepFx(dt) {
  G.sparks = G.sparks.filter(function (s) { s.life -= dt; s.z += s.vz * dt; s.vz -= 40 * dt; s.i += s.vx * dt; s.j += s.vy * dt; return s.life > 0 && s.z > -2; });
  if (G.phase !== 'day' && Math.random() < dt * 8 && G.fuel > 5) G.sparks.push({ i: FIRE.i + rnd(-0.2, 0.2), j: FIRE.j + rnd(-0.2, 0.2), z: 40, vz: rnd(20, 50), vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), life: 1.4, c: '#FFD36B' });
  G.floaters = G.floaters.filter(function (f) { return G.t - f.t0 < (f.dur || 1.6); });
  G.gazes = G.gazes.filter(function (q) { return G.t < q.until; });
  G.pulses = G.pulses.filter(function (q) { return G.t < q.until; });
  G.wolves.forEach(function (w) { var dx = FIRE.i + 3 - w.i, dy = FIRE.j + 3 - w.j, d = Math.hypot(dx, dy); if (d > 0.5) { w.i += dx / d * dt * 2.6; w.j += dy / d * dt * 2.6; } });
}

/* ===== 그리기 ===== */
var LIGHT = document.createElement('canvas'), LG = LIGHT.getContext('2d');
function render() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  var winter = MAP.winter;
  g.fillStyle = winter ? '#8E9AA6' : '#2A3320'; g.fillRect(0, 0, cv.width, cv.height);
  var ox = DPR * (VW / 2 - CAM.x * Z), oy = DPR * (VH / 2 - CAM.y * Z);
  g.setTransform(DPR * Z, 0, 0, DPR * Z, ox, oy);
  if (MAP.img) g.drawImage(MAP.img, -MAP.ox, -MAP.oy, MAP.img.width / MAP.scale, MAP.img.height / MAP.scale);
  var t = G.t;
  // 바닥 효과: 자리 고리, 맥박 고리
  if (G.phase === 'dusk' || (G.day === 1 && G.tut >= 3 && G.phase !== 'night')) drawSeatRings();
  G.pulses.forEach(function (q) {
    var pi = q.who ? q.who.i : q.i, pj = q.who ? q.who.j : q.j, c = iso(pi, pj), r = (q.r || 0.7) * 50.9;
    var k = 1 + (Math.sin(t * 4) + 1) * 0.12; g.strokeStyle = 'rgba(' + q.c + ',0.9)'; g.lineWidth = q.warn ? 3.5 : 2.5;
    if (q.rally) g.setLineDash([8, 6]);
    g.beginPath(); g.ellipse(c[0], c[1], r * k, r * 0.5 * k, 0, 0, 7); g.stroke(); g.setLineDash([]);
  });
  // 시선선
  var tally = {};
  G.gazes.forEach(function (q) {
    var a = iso(q.who.i, q.who.j), b = iso(q.i, q.j); g.strokeStyle = 'rgba(255,211,107,0.9)'; g.lineWidth = 2.2; g.setLineDash([6, 5]); g.lineDashOffset = -t * 30;
    g.beginPath(); g.moveTo(a[0] + q.who.face * 20, a[1] - 40); g.lineTo(b[0], b[1] - 20); g.stroke(); g.setLineDash([]);
    var key = Math.round(q.i) + ',' + Math.round(q.j); tally[key] = (tally[key] || 0) + 1;
    if (tally[key] >= 2) { g.fillStyle = 'rgba(255,211,107,0.25)'; g.beginPath(); g.ellipse(b[0], b[1], 60, 30, 0, 0, 7); g.fill(); }
  });
  // 사물과 사람: 깊이 정렬
  var D = [];
  TREES.forEach(function (tr, k) { D.push({ d: tr[0] + tr[1], f: function () { var p = iso(tr[0], tr[1]); drawTree(g, p[0], p[1], winter, t, k); } }); });
  TENTS.forEach(function (tn) { D.push({ d: tn[0] + tn[1], f: function () { var p = iso(tn[0], tn[1]); drawTent(g, p[0], p[1], G.phase === 'day' ? 0.05 : 0.3, winter); } }); });
  G.bushes.forEach(function (b, k) { D.push({ d: b.i + b.j, f: function () { var p = iso(b.i, b.j); var glow = (G.tut === 2 && k === 2) ? 0.5 + Math.sin(t * 5) * 0.4 : 0; drawBush(g, p[0], p[1], b.n, glow, winter); } }); });
  G.woods.forEach(function (w) { D.push({ d: w.i + w.j, f: function () { var p = iso(w.i, w.j); drawWoodPile(g, p[0], p[1], w.n); } }); });
  G.traps.forEach(function (w) { D.push({ d: w.i + w.j, f: function () { var p = iso(w.i, w.j); drawTrap(g, p[0], p[1], w.state); } }); });
  G.herbs.forEach(function (w) { D.push({ d: w.i + w.j, f: function () { var p = iso(w.i, w.j); drawHerb(g, p[0], p[1], w.n); } }); });
  D.push({ d: SLAB.i + SLAB.j, f: function () { var p = iso(SLAB.i, SLAB.j); var nd = slabNeeds(); drawSlab(g, p[0], p[1], nd && near(G.me, SLAB, 3) ? 0.5 + Math.sin(t * 4) * 0.3 : 0); } });
  D.push({ d: FIRE.i + FIRE.j, f: function () { var p = iso(FIRE.i, FIRE.j); drawFire(g, p[0], p[1], G.fuel, t); var pile = Math.min(6, Math.floor((G.food.fresh + G.food.dried) / 8)); for (var k = 0; k < pile; k++) { g.fillStyle = k % 2 ? '#9A5A34' : '#C0503A'; g.beginPath(); g.ellipse(p[0] + 30 + (k % 3) * 7, p[1] + 10 - Math.floor(k / 3) * 5, 5, 3.5, 0, 0, 7); g.fill(); } } });
  G.bison.forEach(function (b) { D.push({ d: b.i + b.j, f: function () { var p = iso(b.i, b.j); drawBison(g, p[0], p[1], b, t); } }); });
  G.wolves.forEach(function (w) { D.push({ d: w.i + w.j, f: function () { var p = iso(w.i, w.j); drawWolf(g, p[0], p[1], w, t); } }); });
  var nightK = G.phase === 'night' ? 1 : G.phase === 'dusk' ? 0.6 : G.phase === 'dawn' ? 0.3 : 0;
  G.people.forEach(function (p) {
    D.push({ d: p.i + p.j, f: function () {
      var s = iso(p.i, p.j);
      var fd = Math.hypot(p.i - FIRE.i, p.j - FIRE.j);
      p.lit = nightK > 0 ? Math.max(0, 0.75 - fd * 0.12) * nightK : 0.2;
      p.ring = p.isMe; p.ghost = p.apart;
      drawPerson(g, s[0], s[1], p, t, 1.35);
    } });
  });
  D.sort(function (a, b) { return a.d - b.d; }); D.forEach(function (x) { x.f(); });
  // 불꽃 가루, 던진 창
  G.sparks.forEach(function (s) { var p = iso(s.i, s.j); g.fillStyle = s.c; g.globalAlpha = Math.min(1, s.life); g.beginPath(); g.arc(p[0], p[1] - s.z, 1.8, 0, 7); g.fill(); g.globalAlpha = 1; });
  G.floaters.forEach(function (f) {
    if (!f.spear) return; var u = clamp((G.t - f.t0) / f.dur, 0, 1); var a = iso(f.from.i, f.from.j), b = iso(f.to.i, f.to.j);
    var x = a[0] + (b[0] - a[0]) * u, y = a[1] - 60 + (b[1] - 40 - (a[1] - 60)) * u - Math.sin(u * Math.PI) * 70;
    var ang = Math.atan2((b[1] - a[1]) - Math.cos(u * Math.PI) * 220, b[0] - a[0]);
    g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = '#6B4E34'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-18, 0); g.lineTo(8, 0); g.stroke(); g.fillStyle = '#C4CBD2'; g.beginPath(); g.moveTo(8, -3); g.lineTo(17, 0); g.lineTo(8, 3); g.fill(); g.restore();
  });
  // 빛
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawLighting(nightK);
  // 눈
  if (winter) { g.fillStyle = 'rgba(242,246,250,0.8)'; G.snow.forEach(function (s) { s.y += s.v * 0.016 * G.speed; s.x += Math.sin(G.t + s.r) * 0.0004; if (s.y > 1) s.y -= 1; g.beginPath(); g.arc(s.x * cv.width, s.y * cv.height, s.r * DPR, 0, 7); g.fill(); }); }
  // 말풍선과 글자(빛 위에)
  g.setTransform(DPR * Z, 0, 0, DPR * Z, ox, oy);
  G.people.forEach(function (p) {
    var s = iso(p.i, p.j), top = s[1] - (p.pose === 'lie' ? 26 : p.pose === 'sit' ? 58 : 70) * p.scale * 1.35;
    if (p.picto && G.t < p.picto.until) drawPictoBubble(g, s[0], top - 6, p.picto.keys);
    else if (p.emote && G.t < p.emote.until) drawEmote(g, s[0] + 18 * p.scale, top + 4, p.emote.key, t);
    if (G.designer && !p.isMe) {
      g.save(); g.font = '700 11px sans-serif'; g.textAlign = 'center';
      g.fillStyle = 'rgba(14,12,12,0.78)'; g.fillRect(s[0] - 40, s[1] + 8, 80, 26);
      g.fillStyle = '#F3E9D7'; g.fillText(p.name + ' · ' + (EMO_LABEL[p.emo] || p.emo), s[0], s[1] + 19);
      g.fillStyle = '#3E3329'; g.fillRect(s[0] - 32, s[1] + 24, 64, 5); g.fillStyle = '#F4B266'; g.fillRect(s[0] - 32, s[1] + 24, 64 * p.trust, 5);
      g.restore();
    }
  });
  G.floaters.forEach(function (f) {
    if (f.spear) return; var u = (G.t - f.t0) / (f.dur || 1.6); var s = iso(f.i, f.j);
    g.save(); g.globalAlpha = 1 - u; g.font = '700 14px "Noto Sans KR", sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(14,12,12,0.6)';
    var w = g.measureText(f.text).width + 14; g.fillRect(s[0] - w / 2, s[1] - 96 - u * 20 - 15, w, 21);
    g.fillStyle = f.c; g.fillText(f.text, s[0], s[1] - 96 - u * 20); g.restore();
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function drawSeatRings() {
  var c = iso(FIRE.i, FIRE.j);
  [[1.35, '224,96,90'], [2.1, '244,178,102'], [3.0, '143,163,200']].forEach(function (r) { g.strokeStyle = 'rgba(' + r[1] + ',0.35)'; g.lineWidth = 1.6; g.setLineDash([4, 7]); g.beginPath(); g.ellipse(c[0], c[1], r[0] * 50.9, r[0] * 25.5, 0, 0, 7); g.stroke(); });
  g.setLineDash([]);
  var s = seatOf(G.me), p = iso(s.i, s.j);
  g.fillStyle = 'rgba(255,211,107,' + (0.35 + Math.sin(G.t * 4) * 0.2) + ')'; g.beginPath(); g.ellipse(p[0], p[1], 14, 7, 0, 0, 7); g.fill();
}
function drawLighting(nightK) {
  var winter = MAP.winter;
  if (nightK <= 0) { if (winter) { g.fillStyle = 'rgba(200,215,235,0.10)'; g.fillRect(0, 0, cv.width, cv.height); } }
  else {
    if (LIGHT.width !== cv.width || LIGHT.height !== cv.height) { LIGHT.width = cv.width; LIGHT.height = cv.height; }
    LG.globalCompositeOperation = 'source-over'; LG.clearRect(0, 0, LIGHT.width, LIGHT.height);
    var col = G.phase === 'dawn' ? '24,35,62' : G.phase === 'dusk' ? '30,18,40' : '6,8,20';
    var a = G.phase === 'dawn' ? 0.45 : G.phase === 'dusk' ? 0.55 : 0.82;
    LG.fillStyle = 'rgba(' + col + ',' + a + ')'; LG.fillRect(0, 0, LIGHT.width, LIGHT.height);
    var f = worldToScreen(FIRE.i, FIRE.j), R = (120 + G.fuel * 3.2) * Z * DPR * (G.song && G.song.feast ? 1.2 : 1);
    LG.globalCompositeOperation = 'destination-out';
    var gr = LG.createRadialGradient(f[0] * DPR, (f[1] - 20 * Z) * DPR, 0, f[0] * DPR, (f[1] - 20 * Z) * DPR, R);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    LG.fillStyle = gr; LG.fillRect(0, 0, LIGHT.width, LIGHT.height);
    g.drawImage(LIGHT, 0, 0);
    g.globalCompositeOperation = 'lighter';
    var gw = g.createRadialGradient(f[0] * DPR, (f[1] - 20 * Z) * DPR, 0, f[0] * DPR, (f[1] - 20 * Z) * DPR, R * 0.7);
    gw.addColorStop(0, 'rgba(255,150,60,' + (0.22 * nightK) + ')'); gw.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = gw; g.fillRect(0, 0, cv.width, cv.height); g.globalCompositeOperation = 'source-over';
  }
  if (G.gloom >= 1) { g.fillStyle = 'rgba(26,34,54,' + Math.min(0.3, G.gloom * 0.12) + ')'; g.fillRect(0, 0, cv.width, cv.height); }
}

/* ===== 화면 UI ===== */
function floatText(p, text, c) { G.floaters.push({ i: p.i, j: p.j, text: text, c: c || '#F3E9D7', t0: G.t }); }
function floatAt(o, text, c) { G.floaters.push({ i: o.i, j: o.j, text: text, c: c || '#F3E9D7', t0: G.t, dur: 2 }); }
var HUDC = {};
function setText(id, v) { if (HUDC[id] !== v) { HUDC[id] = v; $(id).textContent = v; } }
function refreshMyFace() { var el = $('myface'); if (!el || !G) return; el.innerHTML = FACE(PLAYER_LOOK_AGE(), G.me.emo, 52); setText('mylabel', EMO_LABEL[G.me.emo] || ''); }
function PLAYER_LOOK_AGE() { var o = {}; for (var k in PLAYER_LOOK) o[k] = PLAYER_LOOK[k]; o.age = G.day === 1 ? 'child' : 'adult'; return o; }
function renderHUD(force) {
  if (force) HUDC = {};
  var ph = { dawn: '새벽', day: '낮', dusk: '해질녘', night: '밤' }[G.phase];
  setText('dayname', seasonName() + ' · ' + DAYNAME[G.day] + ' · ' + ph);
  var need = G.people.length * RULES.need, have = G.food.fresh + G.food.dried;
  $('foodbar').style.width = Math.min(100, have / (need * 2) * 100) + '%';
  $('fuelbar').style.width = G.fuel + '%';
  $('fuelbar').style.background = G.fuel < 26 ? 'var(--danger)' : 'var(--ember)';
  $('foodmark').style.left = '50%';
  var t = clamp(G.clock / (8 + RULES.dayLen + RULES.duskLen), 0, 1);
  $('sunpos').style.left = (t * 100) + '%';
  $('learn').hidden = !(G.learnUntil > G.t);
  $('picbtn').classList.toggle('glow', !!G.picGlow);
  if (G.designer) {
    setText('dev-food', '먹을 것 ' + have.toFixed(1) + ' / 오늘 밤 ' + need + (G.food.dried ? ' (말린 것 ' + G.food.dried.toFixed(0) + ')' : ''));
    setText('dev-fire', '불 ' + G.fuel.toFixed(0) + ' · 사냥 ' + (G.hunt && G.hunt.phase === 'gather' ? Math.round(huntChance(huntParticipants().length) * 100) + '% (' + huntParticipants().length + '명)' : '-'));
    setText('dev-misc', '발견 ' + (G.stats.disc.join(', ') || '없음') + ' · 자리 ' + ['안쪽', '가운데', '바깥'][myTier()] + ' · 그림말 ' + G.stage + '단계');
  }
}
function renderInv() {
  var el = $('inv'); if (!el) return;
  var ICON = { berry: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="9" cy="13" r="4" fill="#C0503A"/><circle cx="15" cy="12" r="4" fill="#D4664C"/><circle cx="12" cy="17" r="3.4" fill="#B04030"/><path d="M12 5c0 3 1 4 3 5" stroke="#4E6E36" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    wood: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 16l14-6M6 20l14-6" stroke="#7A5638" stroke-width="3.2" stroke-linecap="round"/></svg>',
    meat: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 8c4-5 13-3 13 4 0 5-6 7-10 5z" fill="#9A5A34"/><path d="M8 16l-4 4" stroke="#E4DCCF" stroke-width="2.6" stroke-linecap="round"/></svg>',
    herb: '<svg viewBox="0 0 24 24" width="24" height="24"><ellipse cx="9" cy="12" rx="3" ry="7" transform="rotate(-25 9 12)" fill="#6FA04A"/><ellipse cx="15" cy="12" rx="3" ry="7" transform="rotate(25 15 12)" fill="#4E7A3A"/></svg>' };
  var html = '';
  G.inv.forEach(function (it, k) { html += '<div class="slot' + (k < 2 ? ' hand' : '') + '">' + (it ? ICON[it] : '') + '</div>'; if (k === 1) html += '<div class="slotgap"></div>'; });
  el.innerHTML = html;
}
function showHint(h) { G.hint = h; $('hint').hidden = !h; if (h) $('hint').className = 'hint ' + h.kind; }
function placeHint() {
  var h = G.hint; if (!h) return;
  var o = h.who || h, s = worldToScreen(o.i, o.j);
  var el = $('hint'); el.style.transform = 'translate(' + Math.round(s[0]) + 'px,' + Math.round(s[1] - (h.who ? 60 : 30) * Z) + 'px)';
}
function showCutin(a, ae, b, be, label) {
  var el = $('cutin'); if (!a) return;
  var wa = {}; for (var k in a.look) wa[k] = a.look[k]; if (a.look.age) wa.age = a.look.age;
  el.innerHTML = '<div class="cface">' + FACE(wa, ae, 92) + '<span>' + a.name + ' · ' + (EMO_LABEL[ae] || '') + '</span></div>' +
    (b ? '<svg class="carrow" width="22" height="12" viewBox="0 0 22 12" aria-hidden="true"><path d="M1 6H18M13 1l6 5-6 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="cface me">' + FACE(PLAYER_LOOK_AGE(), be, 92) + '<span>나 · ' + (EMO_LABEL[be] || '') + '</span></div>' : '') +
    (label ? '<p class="clabel">' + label + '</p>' : '');
  el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(showCutin.tm); showCutin.tm = setTimeout(function () { el.hidden = true; }, 2600 / Math.max(1, G.speed * 0.6));
}
function fade(on) { $('fade').classList.toggle('on', on); }
function flashPicto() { G.picGlow = true; }

/* 몸짓 바퀴 */
function openWheel(p, sx, sy) {
  G.wheelFor = p;
  var opts = [];
  if (G.inv.some(function (x) { return x === 'berry' || x === 'meat'; })) opts.push('give');
  opts.push('hold', 'follow', 'teach', 'thanks');
  if (NEG[p.emo] || p.injured) opts.push('pat');
  if (p.injured && invCount('herb')) opts.push('care');
  opts.push('apart');
  var el = $('wheel'), R = 84, html = '<div class="whead">' + p.name + '</div>';
  opts.forEach(function (k, n) {
    var a = -Math.PI / 2 + n * (Math.PI * 2 / opts.length), x = Math.cos(a) * R, y = Math.sin(a) * R;
    var locked = (k === 'hold' || k === 'pat') && p.lockDay && G.day < p.lockDay;
    var label = k === 'apart' && p.apart ? '거리 풀기' : GEST[k].t;
    html += '<button class="wbtn' + (locked ? ' locked' : '') + '" data-g="' + k + '" style="transform:translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)"' + (locked ? ' disabled' : '') + '>' + iconSVG(GEST[k].d, false, 22, 'currentColor') + '<span>' + label + '</span></button>';
  });
  el.innerHTML = html;
  var x = clamp(sx, 110, VW - 110), y = clamp(sy, 130, VH - 140);
  el.style.left = x + 'px'; el.style.top = y + 'px'; el.hidden = false;
  el.querySelectorAll('.wbtn').forEach(function (b) { b.addEventListener('click', function (ev) { ev.stopPropagation(); doGesture(p, b.getAttribute('data-g')); }); });
}
function closeWheel() { $('wheel').hidden = true; G.wheelFor = null; }

/* 그림말 판 */
var COMPOSE = [];
function openPicto() {
  G.picGlow = false; closeVoice(); COMPOSE = [];
  var keys = []; for (var s = 0; s < G.stage; s++) keys = keys.concat(PICTO_STAGE[s]);
  var html = '';
  keys.forEach(function (k) { var P = PICTO[k]; html += '<button class="pk" data-k="' + k + '">' + iconSVG(P.d, P.f, 26, 'currentColor') + '<span>' + P.t + '</span></button>'; });
  $('pgrid').innerHTML = html;
  $('pgrid').querySelectorAll('.pk').forEach(function (b) { b.addEventListener('click', function () { var max = G.stage; if (COMPOSE.length >= max) COMPOSE.shift(); COMPOSE.push(b.getAttribute('data-k')); renderCompose(); }); });
  setText('pstage', G.stage === 1 ? '한 개씩' : G.stage === 2 ? '두 개까지 잇기' : '세 개까지 잇기');
  renderCompose(); $('picto').hidden = false;
}
function renderCompose() {
  var html = ''; for (var k = 0; k < G.stage; k++) { var key = COMPOSE[k]; html += '<div class="cslot">' + (key ? iconSVG(PICTO[key].d, PICTO[key].f, 26, 'currentColor') : '') + '</div>'; if (k < G.stage - 1) html += '<span class="plus">+</span>'; }
  $('compose').innerHTML = html; $('psend').disabled = !COMPOSE.length;
}
function closePicto() { $('picto').hidden = true; }

/* 목소리 */
function openVoice() {
  closePicto();
  var el = $('voices'), html = '';
  VOICES.forEach(function (v) { html += '<button class="vk" data-v="' + v.k + '">' + iconSVG(v.d, false, 22, 'currentColor') + '<span>' + v.t + '</span></button>'; });
  el.innerHTML = html; el.hidden = !el.hidden;
  el.querySelectorAll('.vk').forEach(function (b) {
    var t0 = 0, y0 = 0;
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); t0 = performance.now(); y0 = e.clientY; b.classList.add('down'); });
    b.addEventListener('pointerup', function (e) { if (!t0) return; var len = (performance.now() - t0) / 1000, dy = (y0 - e.clientY) / 12; t0 = 0; b.classList.remove('down'); vocalize(b.getAttribute('data-v'), clamp(len, 0.4, 3), clamp(dy, -6, 8)); });
    b.addEventListener('pointerleave', function () { b.classList.remove('down'); });
  });
}
function closeVoice() { $('voices').hidden = true; }
function vocalize(k, len, pitch) {
  SND.voice(k, G.me.look.pitch, len, pitch);
  G.me.emote = { key: { laugh: 'spark', call: 'excl', warn: 'excl', hum: 'note', sigh: 'dots', soothe: 'heart' }[k], until: G.t + 2 };
  floatText(G.me, { laugh: '하하하', call: '오-이', warn: '헤잇!', hum: '음~', sigh: '하아', soothe: '쉬이' }[k], '#FFD9A0');
  if (k === 'laugh') { setEmo(G.me, 'joy', 3); contagion('joy'); }
  else if (k === 'hum') { setEmo(G.me, 'sing', 3); contagion('sing'); }
  else if (k === 'warn') warnCall();
  else if (k === 'sigh') { feel(G.me, { goal: -0.4, power: 0.5, inten: 0.4 }, 6); setTimeout2(2, function () { comfortRoutine('sigh'); }); }
  else if (k === 'call') { var c = npcs().filter(function (p) { return !p.apart && !p.injured && near(p, G.me, 16); }).sort(function (a, b) { return b.trust - a.trust; })[0]; if (c) { faceTo(c, G.me); setTimeout2(0.6, function () { SND.voice('call', c.look.pitch, 0.8); c.emote = { key: 'excl', until: G.t + 2 }; if (c.trust >= 0.3 && !(c.task && c.task.kind === 'hunt')) { c.task = { kind: 'called' }; goTo(c, G.me.i + 0.8, G.me.j + 0.6, function () { faceTo(c, G.me); setTimeout2(6, function () { if (c.task && c.task.kind === 'called') { c.task = null; if (G.phase === 'day') startRole(c); } }); }); } }); } }
  else if (k === 'soothe') { npcs().forEach(function (p) { if (near(p, G.me, 4) && NEG[p.emo]) feel(p, { goal: 0.5, agent: 'other', target: 'you', prior: 'worried' }, 4); }); }
}

/* 동의 */
function askConsent(p, what, cb) {
  var el = $('consent');
  var wa = {}; for (var k in p.look) wa[k] = p.look[k];
  $('cface').innerHTML = FACE(wa, 'warm', 64);
  setText('cwho', p.name + '이(가) ' + what + '를 청한다');
  el.hidden = false; G.consent = { cb: cb, until: G.t + 5, p: p };
  $('cbar').style.transition = 'none'; $('cbar').style.width = '100%'; void $('cbar').offsetWidth; $('cbar').style.transition = 'width ' + (5 / G.speed) + 's linear'; $('cbar').style.width = '0%';
  setTimeout2(5, function () { if (G.consent && G.consent.p === p) answerConsent(false); });
}
function answerConsent(ok) { var c = G.consent; if (!c) return; G.consent = null; $('consent').hidden = true; c.cb(ok); }

/* 밤 노래 */
function openSong() {
  var S = G.song, el = $('song');
  setText('stitle', S.feast ? '잔치의 밤 노래' : '밤 모닥불 노래');
  var rows = '<div class="srow"><span>나</span><div class="dots" id="sd-me"></div></div>';
  S.npc.forEach(function (n, k) { rows += '<div class="srow"><span>' + n.p.name + '</span><div class="dots" id="sd-' + k + '"></div></div>'; });
  $('srows').innerHTML = rows;
  el.hidden = false; $('sstart').hidden = false; $('stap').hidden = true;
  var ph = ''; for (var q = 0; q < S.beats; q++) ph += '<i class="d"></i>'; $('sd-me').innerHTML = ph; S.npc.forEach(function (n, k) { $('sd-' + k).innerHTML = ph; });
}
function startBeats() { var S = G.song; if (!S) return; SND.init(); S.start = performance.now() / 1000 + 1.0; $('sstart').hidden = true; $('stap').hidden = false; }
function songTap() {
  var S = G.song; if (!S || S.start == null) return;
  var bl = 60 / S.bpm, now = performance.now() / 1000, x = (now - S.start) / bl, b = Math.round(x);
  if (b < 0 || b >= S.beats || S.taps[b] != null) return;
  var err = (x - b) * bl; S.taps[b] = err; SND.drum(Math.abs(err) < 0.09);
  $('stap').classList.remove('hit'); void $('stap').offsetWidth; $('stap').classList.add('hit');
  var good = Math.abs(err) < 0.09;
  S.npc.forEach(function (n) { n.sd = Math.max(0.025, n.sd * (good ? 0.8 : 0.96)); });
}
function stepSong() {
  var S = G.song; if (!S || S.start == null || S.done) return;
  var bl = 60 / S.bpm, now = performance.now() / 1000, x = (now - S.start) / bl;
  $('sring').style.transform = 'scale(' + (1 + Math.max(0, 1 - Math.abs(x - Math.round(x)) * 4) * 0.25) + ')';
  var b = Math.floor(x + 0.5);
  while (S.idx <= b && S.idx < S.beats) {
    var k = S.idx;
    S.npc.forEach(function (n) { var e = (Math.random() * 2 - 1) * n.sd; n.hits[k] = e; });
    if (k > 0 && S.taps[k - 1] == null) S.npc.forEach(function (n) { n.sd = Math.min(0.25, n.sd * 1.05); });
    SND.drum(false);
    G.people.forEach(function (p) { if (!p.injured) p.motion = 'bounce'; });
    S.idx++;
  }
  // 점 그리기
  var html = function (arr) { var h = ''; for (var q = 0; q < S.beats; q++) { var e = arr[q]; var c = e == null ? '' : (Math.abs(e) < 0.09 ? ' ok' : ' off'); h += '<i class="d' + c + '" style="--o:' + (e == null ? 0 : (e * 60).toFixed(1)) + 'px"></i>'; } return h; };
  if (!S.lastDraw || now - S.lastDraw > 0.1) { S.lastDraw = now; $('sd-me').innerHTML = html(S.taps); S.npc.forEach(function (n, k) { $('sd-' + k).innerHTML = html(n.hits); }); $('sprog').style.width = clamp(x / S.beats, 0, 1) * 100 + '%'; }
  if (x > S.beats + 0.6) { S.done = true; endSong(); }
}
function closeSong() { $('song').hidden = true; }

/* 밤 결과 */
function showNightCard(r) {
  var lines = [];
  var sync = G.stats.songs[G.stats.songs.length - 1] || 0;
  lines.push(['노래', sync > 0.5 ? '박자가 맞아 불이 크게 일었다' : sync > 0.2 ? '조금씩 박자가 맞았다' : '박자가 흩어졌다']);
  if (r.feast) lines.push(['잔치', '이틀 치가 넘게 쌓여 잔치가 열렸다']);
  lines.push(['먹을 것', r.hungry ? (r.hungry + '명 몫이 모자랐다' + (G.me.hungry ? ' · 나도 굶었다' : ' · 누군가 내 몫을 나눠 줬다')) : '모두 배불리 먹었다']);
  if (!G.smoking && !r.hungry) lines.push(['남은 것', '훈제를 몰라 남은 고기는 상했다']);
  if (r.wolves) lines.push(['늑대', '불이 약해 늑대가 다가왔다. 다친 사람이 생겼다']);
  $('nlist').innerHTML = lines.map(function (l) { return '<li><b>' + l[0] + '</b><span>' + l[1] + '</span></li>'; }).join('');
  setText('ntitle', DAYNAME[G.day] + ' 밤');
  $('nnext').textContent = G.day >= RULES.days ? '겨울을 돌아보기' : '잠들기';
  $('night').hidden = false;
}
function hideNightCard() { $('night').hidden = true; }

/* 끝 */
function endGame() {
  closeVoice(); closePicto();
  G.over = true; G.running = true;
  var best = G.stats.songs.length ? Math.max.apply(null, G.stats.songs) : 0;
  var rel = npcs().sort(function (a, b) { return b.trust - a.trust; }).map(function (p) { var w = {}; for (var k in p.look) w[k] = p.look[k]; return '<div class="rel">' + FACE(w, p.trust > 0.55 ? 'moved' : p.trust > 0.35 ? 'warm' : 'calm', 64) + '<b>' + p.name + '</b><i style="--w:' + Math.round(p.trust * 100) + '%"></i></div>'; }).join('');
  $('erel').innerHTML = rel;
  var st = [['나눔', G.stats.shares + '번'], ['굶주린 밤', G.stats.hungryDays + '번'], ['잔치', G.stats.feasts + '번'], ['사냥', G.stats.huntOk + '번 성공 · ' + G.stats.huntFail + '번 실패'], ['발견', G.stats.disc.join(', ') || '없음'], ['위로받음', G.stats.comforts + '번'], ['가장 잘 맞은 노래', Math.round(best * 100) + '%'], ['모닥불 자리', ['안쪽', '가운데', '바깥'][myTier()]]];
  $('estats').innerHTML = st.map(function (s) { return '<li><span>' + s[0] + '</span><b>' + s[1] + '</b></li>'; }).join('');
  setText('etitle', G.stats.feasts ? '잔치를 열며 첫 겨울을 넘겼다' : G.stats.hungryDays >= 4 ? '배고픈 겨울이었지만 함께 넘겼다' : '첫 겨울을 함께 넘겼다');
  $('end').hidden = false;
}

/* ===== 입력 ===== */
var PD = null;
cv.addEventListener('pointerdown', function (e) {
  if (!G || !G.running || G.over) return;
  SND.init();
  closeWheel(); closePicto(); closeVoice();
  var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  PD = { x: x, y: y, t: performance.now(), long: false };
  var lp = $('lpress'); lp.style.left = x + 'px'; lp.style.top = y + 'px';
  PD.timer = setTimeout(function () {
    if (!PD) return; PD.long = true; lp.hidden = true;
    var hit = hitTest(PD.x, PD.y);
    if (G.day === 1 && G.tut < 3) return;
    if (hit && hit.kind === 'person' && !hit.p.isMe) { openWheel(hit.p, PD.x, PD.y); if (G.tut === 3) showHint(null); }
    else if (hit && hit.kind === 'bison') pointAt(hit.o.i, hit.o.j, true);
    else if (hit) { var w = screenToWorld(PD.x, PD.y); pointAt(w[0], w[1], false); }
  }, 430);
  setTimeout(function () { if (PD && !PD.long) { lp.hidden = false; lp.classList.remove('run'); void lp.offsetWidth; lp.classList.add('run'); } }, 120);
});
cv.addEventListener('pointermove', function (e) { if (!PD) return; var r = cv.getBoundingClientRect(); if (Math.hypot(e.clientX - r.left - PD.x, e.clientY - r.top - PD.y) > 12) { clearTimeout(PD.timer); $('lpress').hidden = true; PD = null; } });
cv.addEventListener('pointerup', function () { if (!PD) return; clearTimeout(PD.timer); $('lpress').hidden = true; if (!PD.long) tapAt(PD.x, PD.y); PD = null; });
cv.addEventListener('pointercancel', function () { if (PD) clearTimeout(PD.timer); PD = null; $('lpress').hidden = true; });
document.addEventListener('keydown', function (e) { if (e.code === 'Space' && G && G.song && G.song.start != null) { e.preventDefault(); songTap(); } });

function bindUI() {
  $('startbtn').addEventListener('click', function () { SND.init(); $('start').hidden = true; G.running = true; refreshMyFace(); renderInv(); renderHUD(true); showHint({ who: byId('neoul'), kind: 'tap' }); });
  $('picbtn').addEventListener('click', function (e) { e.stopPropagation(); if ($('picto').hidden) openPicto(); else closePicto(); });
  $('voicebtn').addEventListener('click', function (e) { e.stopPropagation(); openVoice(); });
  $('psend').addEventListener('click', function () { if (!COMPOSE.length) return; sendPicto(COMPOSE.slice()); COMPOSE = []; closePicto(); });
  $('pclear').addEventListener('click', function () { COMPOSE = []; renderCompose(); });
  $('cyes').addEventListener('click', function () { answerConsent(true); });
  $('cno').addEventListener('click', function () { answerConsent(false); });
  $('sstart').addEventListener('click', startBeats);
  $('stap').addEventListener('pointerdown', function (e) { e.preventDefault(); songTap(); });
  $('sskip').addEventListener('click', function () { var S = G.song; if (!S) return; for (var b = 0; b < S.beats; b++) { if (S.taps[b] == null) S.taps[b] = (Math.random() * 2 - 1) * 0.2; } S.npc.forEach(function (n) { for (var b2 = 0; b2 < S.beats; b2++) if (n.hits[b2] == null) n.hits[b2] = (Math.random() * 2 - 1) * 0.15; }); S.done = true; endSong(); });
  $('nnext').addEventListener('click', sleepAndNext);
  $('again').addEventListener('click', function () { $('end').hidden = true; TIMERS = []; newGame(); G.running = true; refreshMyFace(); renderInv(); renderHUD(true); showHint({ who: byId('neoul'), kind: 'tap' }); });
  $('devbtn').addEventListener('click', function () { $('dev').hidden = !$('dev').hidden; });
  document.querySelectorAll('[data-speed]').forEach(function (b) { b.addEventListener('click', function () { G.speed = +b.getAttribute('data-speed'); document.querySelectorAll('[data-speed]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
  $('devview').addEventListener('change', function () { G.designer = this.checked; $('devnums').hidden = !this.checked; renderHUD(true); });
  $('devsound').addEventListener('change', function () { SND.setOn(this.checked); });
  $('devskip').addEventListener('click', function () {
    if (G.over || G.song) return;
    if (G.day === 1 && G.tut < 4) { if (G.tut === 0) tutStep(1); G.me.follow = null; G.inv = ['berry', 'berry', 'berry', null, null]; renderInv(); var d = byId('dallae'); G.tut = 3; doGesture(d, 'give'); return; }
    if (G.phase === 'dawn' || G.phase === 'day') { G.clock = 8 + RULES.dayLen; } else if (G.phase === 'dusk') { G.clock = 8 + RULES.dayLen + RULES.duskLen; }
  });
}

function boot() {
  resize(); newGame(); bindUI();
  var mp = iso(G.me.i, G.me.j); CAM.x = mp[0]; CAM.y = mp[1] - 30;
  renderInv();
  requestAnimationFrame(frame);
}
boot();
