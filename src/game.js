/* ===== game.js : 상태, 무리, 하루, 입력 ===== */
var G = null;
var cv = document.getElementById('cv'), g = cv.getContext('2d');
var VW = 0, VH = 0, DPR = 1, Z = 1;
var $ = function (id) { return document.getElementById(id); };
function rnd(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

var BUSHES = [[17.0, 12.4], [19.6, 12.6], [21.0, 12.2], [22.5, 12.8], [24.0, 12.3], [25.5, 12.9]];
var WOODS = [[23.5, 22.5], [25.8, 24.2], [27.2, 21.6], [24.6, 26.8], [28.4, 25.2], [22.4, 27.6]];
var TREES = [[23, 21], [24.6, 23.2], [26.4, 22.6], [27.8, 24], [25.4, 25.6], [23.6, 25], [29, 22], [26.8, 27], [28.6, 27.8], [24.2, 28.6], [30, 25.5], [21.6, 29.4], [30.6, 29], [27.6, 30], [10.5, 28], [8.4, 30], [12.6, 30.2], [31, 14.5], [32, 18.5], [29.6, 8.6], [25, 7.6], [20, 6.8], [11, 7.2], [32.2, 11]];
var TRAPS = [[10.6, 23.4], [12.4, 24.8], [9.6, 25.6]];
var HERBS = [[7.4, 20.4], [8.2, 21.8], [7.2, 23.2]];
var TENTS = [[18.6, 13.4], [13.4, 14.4], [12.6, 18.6]];
var SLAB = { i: 18.1, j: 18.0 };
var RALLY = { i: 25.6, j: 17.4 };

function newGame() {
  G = {
    t: 0, speed: 1, running: false, over: false,
    day: 1, clock: 0, phase: 'dawn', frozen: true,
    food: { fresh: 18, dried: 0 }, fuel: 70,
    smoking: false, spear: false, attempts: { spear: 0, smoke: 0 }, huntWins: 0,
    stage: 1, tut: 0, designer: false, gloom: 0, hungryStreak: 0,
    stats: { shares: 0, hungryDays: 0, playerHungry: 0, feasts: 0, songs: [], huntOk: 0, huntFail: 0, disc: [], comforts: 0, declines: 0 },
    people: [], bushes: BUSHES.map(function (b) { return { i: b[0], j: b[1], n: 4, max: 4 }; }),
    woods: WOODS.map(function (w) { return { i: w[0], j: w[1], n: 3 }; }),
    traps: TRAPS.map(function (t) { return { i: t[0], j: t[1], state: 'empty' }; }),
    herbs: HERBS.map(function (h) { return { i: h[0], j: h[1], n: 1 }; }),
    bison: [], wolves: [], gazes: [], pulses: [], sparks: [], floaters: [], snow: [],
    inv: [null, null, null, null, null], learnUntil: 0, hunt: null, warnLog: [], lonelyT: 0, lastComfort: -99,
    song: null, consent: null, cut: null, wheelFor: null, hintEl: null
  };
  buildMap(false);
  var me = mkPerson(PLAYER_LOOK, 17.6, 18.2, true); me.scale = 0.8; me.pose = 'sit'; me.emo = 'sleepy'; G.me = me; G.people.push(me);
  BAND.forEach(function (b) { var p = mkPerson(b, b.home[0], b.home[1], false); p.trust = b.trust; p.role = b.role; p.pose = 'lie'; if (b.age === 'child') p.scale = 0.8; G.people.push(p); });
  var neoul = byId('neoul'); neoul.i = 18.6; neoul.j = 17.4; neoul.pose = 'stand'; neoul.face = -1; setEmo(neoul, 'warm', 999); neoul.picto = { keys: ['follow'], until: 9999 };
  G.pulses.push({ who: neoul, until: 9999, c: '244,178,102' });
  for (var s = 0; s < 90; s++) G.snow.push({ x: Math.random(), y: Math.random(), v: rnd(0.04, 0.09), r: rnd(0.8, 2.2) });
  updateSeatTargets();
}
function mkPerson(look, i, j, isMe) {
  return { id: look.id, name: look.name, look: look, i: i, j: j, path: null, speed: isMe ? 3.1 : 2.5, face: 1, pose: 'stand', arm: 'side', carry: null, emo: 'calm', emoUntil: 0, motion: 'idle', emote: null, picto: null, scale: 1, seed: Math.random() * 10, isMe: isMe, trust: 0.3, role: '', task: null, follow: null, injured: false, declines: 0, lockDay: 0, apart: false, lastDials: null, help: 0 };
}
function byId(id) { for (var k = 0; k < G.people.length; k++) if (G.people[k].id === id) return G.people[k]; return null; }
function npcs() { return G.people.filter(function (p) { return !p.isMe; }); }

/* ===== 감정 ===== */
var MOTION = { joy: 'hop', sing: 'bounce', eureka: 'hop', pride: 'hop', relief: 'hop', fear: 'tremble', anxious: 'tremble', rage: 'tremble', anger: 'stomp', dejected: 'slump', pessimism: 'slump', despair: 'slump', disappoint: 'slump', frustrated: 'slump', shame: 'slump', sad: 'slump' };
var EMOTE_OF = { joy: 'spark', moved: 'heart', relief: 'heart', sing: 'note', surprise: 'excl', fear: 'sweat', anxious: 'sweat', worried: 'dots', frustrated: 'sweat', disappoint: 'dots', dejected: 'gloom', pessimism: 'gloom', despair: 'tear', sad: 'tear', anger: 'anger', rage: 'anger', annoyed: 'anger', embarrassed: 'sweat', shame: 'gloom', jealous: 'eye', hurt: 'dots', lonely: 'dots', eureka: 'spark', pride: 'spark', sleepy: 'zz', grievance: 'storm' };
function setEmo(p, key, dur, opts) {
  opts = opts || {};
  p.emo = key; p.emoUntil = G.t + (dur || 6); p.motion = MOTION[key] || 'idle';
  if (opts.dials) p.lastDials = opts.dials;
  if (opts.emote !== false && EMOTE_OF[key]) p.emote = { key: opts.emote || EMOTE_OF[key], until: G.t + Math.min(4, dur || 4) };
  if (p.isMe) refreshMyFace();
}
function feel(p, dials, dur, opts) { var k = appraise(dials); opts = opts || {}; opts.dials = dials; setEmo(p, k, dur, opts); return k; }
function decayEmo(p) {
  if (G.t > p.emoUntil && p.emo !== 'calm') {
    var base = p.injured ? 'sad' : (G.phase === 'night' ? 'warm' : 'calm');
    if (G.gloom >= 2 && !p.isMe) base = 'pessimism';
    p.emo = base; p.motion = MOTION[base] || 'idle'; if (p.isMe) refreshMyFace();
  }
}

/* ===== 이동 ===== */
function goTo(p, i, j, then) {
  var path = findPath(p.i, p.j, i, j);
  if (!path) { p.path = null; if (then) then(); return false; }
  path[path.length - 1] = [i, j];
  path.shift();
  p.path = path; p.onArrive = then || null; return true;
}
function stepMove(p, dt) {
  p.moving = false;
  if (!p.path || !p.path.length) return;
  var sp = p.speed * (p.isMe && p.hungry ? 0.78 : 1) * (p.follow && p.follow.hold ? 0.9 : 1);
  var tgt = p.path[0], dx = tgt[0] - p.i, dy = tgt[1] - p.j, d = Math.hypot(dx, dy), mv = sp * dt;
  if (Math.abs(dx - dy) > 0.01) p.face = (dx - dy) > 0 ? 1 : -1;
  p.moving = true; if (p.pose !== 'stand') p.pose = 'stand';
  if (d <= mv) { p.i = tgt[0]; p.j = tgt[1]; p.path.shift(); if (!p.path.length) { p.path = null; p.moving = false; var cb = p.onArrive; p.onArrive = null; if (cb) cb(); } }
  else { p.i += dx / d * mv; p.j += dy / d * mv; }
}
function near(a, b, r) { return Math.hypot(a.i - b.i, a.j - b.j) <= r; }
function faceTo(p, q) { var dx = q.i - p.i, dy = q.j - p.j; if (Math.abs(dx - dy) > 0.05) p.face = (dx - dy) > 0 ? 1 : -1; }

/* ===== 자리 ===== */
var SEAT_ANG = { neoul: 2.9, dallae: 4.3, maru: 5.1, bawi: 1.7, nuri: 2.3, yeoul: 5.8, sol: 4.0 };
var SEAT_R = { neoul: 1.4, dallae: 1.7, maru: 2.0, bawi: 2.1, nuri: 2.2, yeoul: 2.0, sol: 1.5 };
function myTier() { var a = 0, n = 0; npcs().forEach(function (p) { a += p.trust; n++; }); a /= n; return a >= 0.45 ? 0 : (a >= 0.31 ? 1 : 2); }
function seatOf(p) {
  if (p.isMe) { var r = [1.35, 2.1, 3.0][myTier()]; return { i: FIRE.i + Math.cos(0.75) * r, j: FIRE.j + Math.sin(0.75) * r }; }
  var a = SEAT_ANG[p.id], rr = SEAT_R[p.id]; return { i: FIRE.i + Math.cos(a) * rr, j: FIRE.j + Math.sin(a) * rr };
}
var lastTier = 2;
function updateSeatTargets() { var t = myTier(); if (t < lastTier && G.running) { floatText(G.me, '자리가 한 칸 안으로', '#FFD9A0'); SND.chime(true); G.pulses.push({ i: seatOf(G.me).i, j: seatOf(G.me).j, until: G.t + 6, c: '255,211,107' }); } lastTier = t; }

/* ===== 소지품 ===== */
function invAdd(item) { for (var k = 0; k < 5; k++) if (!G.inv[k]) { G.inv[k] = item; renderInv(); G.me.carry = G.inv[0] || G.inv[1]; return true; } floatText(G.me, '손이 가득 찼다', '#CFC4B2'); return false; }
function invTake(pred) { for (var k = 4; k >= 0; k--) if (G.inv[k] && pred(G.inv[k])) { var it = G.inv[k]; G.inv[k] = null; compactInv(); return it; } return null; }
function compactInv() { var a = G.inv.filter(Boolean); G.inv = [0, 1, 2, 3, 4].map(function (k) { return a[k] || null; }); renderInv(); G.me.carry = G.inv[0]; }
function invCount(item) { return G.inv.filter(function (x) { return x === item; }).length; }
var FOODV = { berry: 1, meat: 2 };

/* ===== 시간 ===== */
function phaseOf(c) { if (c < 8) return 'dawn'; if (c < 8 + RULES.dayLen) return 'day'; if (c < 8 + RULES.dayLen + RULES.duskLen) return 'dusk'; return 'night'; }
function seasonName() { return G.day >= RULES.winterFrom ? '겨울' : '가을'; }
var DAYNAME = ['', '첫날', '둘째 날', '셋째 날', '넷째 날', '다섯째 날', '여섯째 날', '일곱째 날'];

function tickClock(dt) {
  if (G.frozen || G.song || G.over) return;
  var dayEnd = 8 + RULES.dayLen;
  if (G.day === 1 && G.tut < 4 && G.clock > dayEnd * 0.8) return;
  G.clock += dt;
  var ph = phaseOf(G.clock);
  if (ph !== G.phase) { var old = G.phase; G.phase = ph; onPhase(old, ph); }
  if (G.phase === 'night' && !G.song && !G.nightDone) startNight();
}
function onPhase(old, ph) {
  if (ph === 'day') { npcs().forEach(function (p) { if (p.pose === 'lie' && !p.injured) p.pose = 'stand'; }); planDay(); }
  if (ph === 'dusk') { if (G.hunt && G.hunt.phase === 'gather') resolveHunt(); npcs().forEach(function (p) { if (p.yieldLeft) { G.food.fresh += p.yieldLeft; p.yieldLeft = 0; p.carry = null; } if (p.injured) return; p.task = null; p.follow = null; var s = seatOf(p); goTo(p, s.i, s.j, function () { p.pose = 'sit'; faceTo(p, FIRE); }); }); if (!G.me.path) { /* 플레이어는 직접 */ } showHint(null); G.pulses.push({ i: seatOf(G.me).i, j: seatOf(G.me).j, until: G.t + 30, c: '255,211,107' }); }
}

/* ===== 하루 계획 ===== */
function isHuntDay() { return G.day >= 2; }
function planDay() {
  G.nightDone = false;
  var winter = G.day >= RULES.winterFrom;
  npcs().forEach(function (p) {
    p.task = null; p.yieldLeft = 0;
    if (p.injured) { p.pose = 'lie'; return; }
    if (G.day === 1 && G.tut < 3 && p.id === 'dallae') { var s = seatOf(p); p.i = s.i; p.j = s.j; p.pose = 'sit'; return; }
    if (G.day === 1 && G.tut < 4 && p.id === 'neoul') return;
    startRole(p);
  });
  if (isHuntDay()) setupHunt();
  G.bushes.forEach(function (b) { b.max = winter ? 2 : 4; b.n = Math.min(b.max, b.n + (winter ? 1 : 2)); });
  G.woods.forEach(function (w) { w.n = Math.min(3, w.n + 1); });
  G.herbs.forEach(function (h) { h.n = 1; });
  G.traps.forEach(function (t) { if (t.state === 'set' && Math.random() < 0.55) t.state = 'caught'; });
}
function startRole(p) {
  var winter = G.day >= RULES.winterFrom, R = winter ? RULES.gatherWinter : RULES.gatherAutumn;
  if (p.role === 'gather' || (p.role === 'hunt' && !isHuntDay())) { p.task = { kind: 'gather', trips: 2, yieldPer: rnd(R[0], R[1]) / 2 * (p.role === 'hunt' ? 0.6 : 1) }; nextTrip(p); }
  else if (p.role === 'child') { p.task = { kind: 'gather', trips: 2, yieldPer: 0.6 }; nextTrip(p); }
  else if (p.role === 'trap') { p.task = { kind: 'trap' }; goTo(p, 11.4, 24.2, guard(p, function () { p.arm = 'reach'; setTimeout2(2.5, guard(p, function () { p.arm = 'side'; var y = Math.round(rnd(RULES.trap[0], RULES.trap[1])); p.carry = y > 0 ? 'meat' : null; p.yieldLeft = y; returnToFire(p, guard(p, function () { woodLoop(p); })); })); })); }
  else if (p.role === 'tend') { p.task = { kind: 'tend', nextWood: G.t + 20, woodLeft: 3 }; var s = seatOf(p); goTo(p, s.i + 0.4, s.j - 0.2); }
}
function guard(p, fn) { var T = p.task; return function () { if (p.task === T) fn.apply(null, arguments); }; }
function nextTrip(p) {
  if (!p.task || p.task.trips <= 0) { p.task = { kind: 'idle' }; var s = seatOf(p); goTo(p, s.i, s.j, function () { p.pose = 'sit'; }); return; }
  p.task.trips--;
  var spot = Math.random() < 0.5 ? [rnd(27, 31), rnd(11.6, 12.8)] : [rnd(10, 12.5), rnd(12.2, 13)];
  if (p.role === 'child') { var d = byId('dallae'); if (d) spot = [d.task && d.task.spot ? d.task.spot[0] + 0.8 : spot[0], d.task && d.task.spot ? d.task.spot[1] + 0.6 : spot[1]]; }
  p.task.spot = spot;
  goTo(p, spot[0], spot[1], guard(p, function () {
    p.arm = 'reach'; p.face = 1;
    setTimeout2(5, guard(p, function () { p.arm = 'side'; p.carry = 'berry'; p.yieldLeft = p.task ? p.task.yieldPer : 0; returnToFire(p, guard(p, function () { nextTrip(p); })); }));
  }));
}
function returnToFire(p, then) {
  goTo(p, FIRE.i + rnd(-1.6, 1.6), FIRE.j + 1.9 + rnd(-0.3, 0.3), function () {
    if (p.yieldLeft) { G.food.fresh += p.yieldLeft; floatAt(FIRE, '+' + Math.max(1, Math.round(p.yieldLeft)), '#FFD9A0'); }
    p.yieldLeft = 0; p.carry = null; if (then) then();
  });
}
function woodLoop(p) {
  if (G.phase !== 'day') return;
  var w = G.woods.filter(function (x) { return x.n > 0; })[Math.floor(Math.random() * 3)] || G.woods[0];
  goTo(p, w.i + 0.6, w.j + 0.6, guard(p, function () {
    p.arm = 'reach'; setTimeout2(2, guard(p, function () { p.arm = 'side'; if (w.n > 0) w.n--; p.carry = 'wood';
      goTo(p, FIRE.i - 1.6, FIRE.j + 0.8, guard(p, function () { p.carry = null; G.fuel = Math.min(100, G.fuel + 10); SND.crackle(); setTimeout2(6, guard(p, function () { woodLoop(p); })); }));
    }));
  }));
}
var TIMERS = [];
function setTimeout2(sec, fn) { TIMERS.push({ at: G.t + sec, fn: fn }); }
function runTimers() { var now = G.t; var due = TIMERS.filter(function (x) { return x.at <= now; }); TIMERS = TIMERS.filter(function (x) { return x.at > now; }); due.forEach(function (x) { try { x.fn(); } catch (e) { console.error(e); } }); }

/* ===== 사냥 ===== */
function setupHunt() {
  G.bison = [{ i: 29.0, j: 17.0, face: -1, graze: true }, { i: 30.2, j: 18.4, face: -1, graze: true }, { i: 29.8, j: 15.8, face: -1, graze: true }];
  G.hunt = { phase: 'gather', resolveAt: G.t + 62, gaze: 0, joined: false };
  var maru = byId('maru');
  setTimeout2(4, function () {
    if (!maru || maru.injured) return;
    maru.picto = { keys: ['bison', 'go'], until: G.t + 6 }; setEmo(maru, 'determined', 8);
    ['maru', 'bawi', 'nuri', 'yeoul'].forEach(function (id, k) { var p = byId(id); if (!p || p.injured) return; p.task = { kind: 'hunt' }; p.spear = true; var a = k * 1.4; setTimeout2(1 + k * 0.6, function () { goTo(p, RALLY.i + Math.cos(a) * 1.1, RALLY.j + Math.sin(a) * 1.1, function () { p.face = 1; setEmo(p, 'determined', 30, { emote: false }); }); }); });
  });
  G.pulses.push({ i: RALLY.i, j: RALLY.j, until: G.t + 70, c: '244,178,102', r: 2.2, rally: true });
}
function huntParticipants() {
  var list = G.people.filter(function (p) { return !p.injured && near(p, RALLY, 2.8); });
  return list;
}
function huntChance(n) {
  if (n < 4) return 0;
  var c = Math.min(RULES.huntMax, RULES.huntBase + (n - 4) * RULES.huntPer);
  if (G.spear) c += RULES.spearBonus;
  if (G.hunt && G.hunt.gaze) c += RULES.gazeBonus;
  return Math.min(0.85, c);
}
function resolveHunt() {
  var H = G.hunt; if (!H || H.phase !== 'gather') return;
  H.phase = 'strike';
  var who = huntParticipants(), n = who.length, meIn = who.indexOf(G.me) >= 0;
  var ch = huntChance(n), ok = Math.random() < ch;
  if (G.forceHunt != null) { ok = G.forceHunt; }
  H.result = { n: n, chance: ch, ok: ok, meIn: meIn };
  who.forEach(function (p) { faceTo(p, G.bison[0]); p.arm = 'spear'; setEmo(p, 'determined', 3, { emote: false }); });
  G.bison.forEach(function (b) { b.graze = false; b.alert = true; b.rear = true; });
  for (var s = 0; s < n; s++) (function (p, k) { setTimeout2(0.3 + k * 0.25, function () { G.floaters.push({ spear: true, from: { i: p.i, j: p.j }, to: { i: G.bison[0].i, j: G.bison[0].j }, t0: G.t, dur: 0.8 }); }); })(who[s], s);
  setTimeout2(2.4, function () {
    G.bison.forEach(function (b) { b.rear = false; });
    if (ok) {
      G.huntWins++; G.stats.huntOk++;
      G.bison[0].down = true; G.bison.slice(1).forEach(function (b) { b.run = true; b.face = 1; });
      who.forEach(function (p) { feel(p, { goal: 0.9, inten: 0.8, target: 'group', agent: p.isMe ? 'self' : 'nature' }, 6); p.arm = 'side'; });
      if (meIn) { feel(G.me, { goal: 0.9, norm: 0.6, target: 'self', aud: 0.8, inten: 0.8, agent: 'self' }, 6); showCutin(byId('maru'), 'joy', G.me, G.me.emo); SND.voice('cheer', G.me.look.pitch, 1); }
      setTimeout2(3, function () {
        var firstNpc = who.filter(function (q) { return !q.isMe; })[0]; who.forEach(function (p) { if (p.isMe) return; p.carry = 'meat'; p.yieldLeft = p === firstNpc ? RULES.bison : 0; p.task = { kind: 'carry' }; returnToFire(p, function () { p.task = null; p.spear = false; if (G.phase === 'day') startRole(p); }); });
        if (!who.some(function (p) { return !p.isMe; })) { G.food.fresh += RULES.bison; }
        if (meIn) invAdd('meat');
        G.bison = G.bison.filter(function (b) { return b.down; });
        setTimeout2(14, function () { G.bison = []; });
      });
    } else {
      G.stats.huntFail++;
      G.bison.forEach(function (b) { b.run = true; b.face = 1; b.alert = true; });
      who.forEach(function (p) { if (!p.isMe) feel(p, { goal: -0.5, power: 0.5, inten: 0.6, agent: 'nature' }, 6); p.arm = 'side'; });
      if (meIn) {
        feel(G.me, { norm: -0.4, target: 'self', aud: 0.5, inten: 0.5, agent: 'self' }, 7);
        var m = byId('maru'); if (m && near(m, G.me, 5)) { setEmo(m, 'joy', 3, { emote: 'note' }); }
        showCutin(m, 'warm', G.me, G.me.emo);
        setTimeout2(2.5, function () { comfortRoutine('hunt'); });
      }
      setTimeout2(4, function () { G.bison = []; who.forEach(function (p) { if (p.isMe) return; p.spear = false; p.task = null; if (G.phase === 'day') startRole(p); }); });
    }
    H.phase = 'done';
    setTimeout2(5, function () { G.pulses = G.pulses.filter(function (q) { return !q.rally; }); });
  });
}
function stepBison(dt) {
  G.bison.forEach(function (b) { if (b.run && !b.down) { b.i += dt * 3.2; b.j -= dt * 0.6; } });
  if (G.hunt && G.hunt.phase === 'gather' && G.t > G.hunt.resolveAt) resolveHunt();
}

/* ===== 발견 ===== */
function slabNeeds() {
  if (!G.spear && G.day >= 2) return { key: 'spear', name: '투창기', need: ['maru', 'bawi'], att: G.attempts.spear, succeedAt: 3 };
  if (!G.smoking && G.huntWins > 0) return { key: 'smoke', name: '훈제', need: ['dallae', 'neoul'], att: G.attempts.smoke, succeedAt: 2 };
  return null;
}
function tryDiscovery() {
  var D = slabNeeds(); if (!D || G.discBusy) return;
  var miss = D.need.filter(function (id) { var p = byId(id); return !p || !near(p, SLAB, 4.2); });
  if (miss.length || !near(G.me, SLAB, 2.4)) { G.me.picto = { keys: ['band', 'help'], until: G.t + 3 }; return; }
  G.discBusy = true;
  var team = [G.me].concat(D.need.map(byId));
  team.forEach(function (p) { faceTo(p, SLAB); p.arm = 'reach'; setEmo(p, 'determined', 4, { emote: false }); });
  setTimeout2(3, function () {
    G.discBusy = false; team.forEach(function (p) { p.arm = 'side'; });
    if (D.key === 'spear') G.attempts.spear++; else G.attempts.smoke++;
    var att = D.key === 'spear' ? G.attempts.spear : G.attempts.smoke;
    if (att >= D.succeedAt) {
      if (D.key === 'spear') G.spear = true; else G.smoking = true;
      G.stats.disc.push(D.name);
      G.people.forEach(function (p) { if (!p.injured) setEmo(p, 'eureka', 5); });
      team.forEach(function (p) { if (!p.isMe) p.trust = clamp(p.trust + 0.1, 0, 1); });
      showCutin(team[1], 'eureka', G.me, 'eureka', D.name + ' 발견');
      SND.chime(true); updateSeatTargets();
      for (var k = 0; k < 24; k++) G.sparks.push({ i: SLAB.i, j: SLAB.j, z: 10, vz: rnd(30, 70), vx: rnd(-1, 1), vy: rnd(-1, 1), life: 1.6, c: '#FFD36B' });
    } else {
      team.forEach(function (p) { feel(p, { goal: -0.4, power: 0.5, inten: 0.5, agent: 'nature' }, 4); });
      floatAt(SLAB, '실패한 시도 ' + att + '번', '#CFC4B2');
    }
  });
}

/* ===== 밤 ===== */
function startNight() {
  if (G.song || G.nightDone) return;
  var s = seatOf(G.me);
  if (!near(G.me, s, 0.6)) { goTo(G.me, s.i, s.j, function () { G.me.pose = 'sit'; faceTo(G.me, FIRE); beginSong(); }); G.frozen = true; return; }
  G.me.pose = 'sit'; beginSong();
}
function feastTonight() { return G.smoking && (G.food.fresh + G.food.dried) >= RULES.need * 8 * RULES.feastDays; }
function beginSong() {
  G.frozen = true;
  var feast = feastTonight();
  var band = npcs().filter(function (p) { return !p.injured; }).sort(function (a, b) { return b.trust - a.trust; }).slice(0, 4);
  G.nightDone = true; closeVoice(); closePicto(); closeWheel();
  G.song = { feast: feast, beats: feast ? 24 : 16, bpm: feast ? 92 : 80, start: null, taps: [], npc: band.map(function (p) { return { p: p, sd: 0.22, hits: [] }; }), idx: 0, done: false };
  npcs().forEach(function (p) { if (p.pose !== 'lie') { p.pose = 'sit'; faceTo(p, FIRE); } });
  openSong();
}
function endSong() {
  var S = G.song, beatLen = 60 / S.bpm;
  var synced = 0;
  for (var b = 0; b < S.beats; b++) {
    var mine = S.taps[b], all = mine != null && Math.abs(mine) < 0.09;
    S.npc.forEach(function (n) { if (Math.abs(n.hits[b] || 1) > 0.09) all = false; });
    if (all) synced++;
  }
  var sync = synced / S.beats;
  G.stats.songs.push(sync);
  G.fuel = Math.min(100, G.fuel + 6 + sync * 30);
  npcs().forEach(function (p) { if (sync > 0.4) p.trust = clamp(p.trust + 0.025, 0, 1); });
  G.people.forEach(function (p) { if (!p.injured) setEmo(p, sync > 0.4 || S.feast ? 'sing' : 'warm', 6); });
  closeSong();
  G.song = null;
  setTimeout2(2.5, nightResults);
}
function nightResults() {
  var people = G.people.length, need = people * RULES.need;
  var have = G.food.fresh + G.food.dried, feast = feastTonight();
  if (feast) { G.stats.feasts++; G.food.fresh = Math.max(0, G.food.fresh - 8); for (var k = 0; k < 40; k++) G.sparks.push({ i: FIRE.i, j: FIRE.j, z: 30, vz: rnd(40, 100), vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), life: 2.2, c: k % 2 ? '#FFD36B' : '#E0605A' }); }
  var short = Math.max(0, need - have);
  var useF = Math.min(G.food.fresh, need); G.food.fresh -= useF; G.food.dried = Math.max(0, G.food.dried - (need - useF));
  var hungry = Math.ceil(short / RULES.need);
  if (hungry > 0) {
    G.stats.hungryDays++; G.hungryStreak++;
    var friend = npcs().filter(function (p) { return p.trust > 0.5 && !p.injured; })[0];
    G.me.hungry = hungry >= 4 || !friend;
    if (G.me.hungry) G.stats.playerHungry++;
    else if (friend) { friend.helpedMe = G.t; showCutin(friend, 'warm', G.me, 'moved', friend.name + '이(가) 몫을 나눠 줬다'); friend.trust = clamp(friend.trust + 0.03, 0, 1); }
  } else { G.hungryStreak = 0; G.me.hungry = false; }
  G.gloom = G.hungryStreak;
  if (!G.smoking) G.food.fresh = 0;
  var report = { feast: feast, hungry: hungry, short: short };
  // 늑대
  if (G.fuel < 26 && G.day >= 2) {
    report.wolves = true;
    G.wolves = [{ i: 29, j: 29, face: -1 }, { i: 30, j: 27.5, face: -1 }];
    G.people.forEach(function (p) { feel(p, { nov: 0.9, val: -0.7, goal: -0.2, power: 0.2, inten: 0.9 }, 5); });
    setTimeout2(3.5, function () {
      G.food.fresh = Math.floor(G.food.fresh * 0.6);
      var vic = npcs().filter(function (p) { return p.role === 'hunt' && !p.injured; })[0];
      if (vic) { vic.injured = true; vic.pose = 'lie'; setEmo(vic, 'sad', 999); }
      G.wolves = [];
    });
  }
  G.nightReport = report;
  showNightCard(report);
}
function sleepAndNext() {
  hideNightCard();
  if (G.day >= RULES.days) { endGame(); return; }
  fade(true);
  setTimeout2(1.0, function () {
    G.day++; G.clock = 0; G.phase = 'dawn'; G.nightDone = false; G.frozen = false;
    if (G.day === RULES.winterFrom) { buildMap(true); G.food.dried += RULES.winterGift; showCutin(byId('neoul'), 'warm', G.me, 'surprise', '너울이 말린 고기를 꺼냈다'); }
    if (G.day === 2) { G.me.scale = 0.92; G.me.speed = 3.2; }
    if (G.day >= 2 && G.stage < 2 && G.stats.shares > 0) { G.stage = 2; flashPicto(); }
    if (G.day >= RULES.winterFrom && G.stage < 3) { G.stage = 3; flashPicto(); }
    G.people.forEach(function (p) {
      if (p.injured) return;
      var s = seatOf(p); p.i = s.i; p.j = s.j; p.pose = 'stand'; p.path = null; p.task = null; p.follow = null; p.spear = false; p.carry = null;
      if (G.hungryStreak >= 2) feel(p, { goal: -0.6, power: 0.2, inten: 0.6, time: 'lasting' }, 30);
      else if (G.hungryStreak === 1 && (!p.isMe || G.me.hungry)) feel(p, { goal: -0.6, power: 0.2, inten: 0.6 }, 20);
      else setEmo(p, 'calm', 1, { emote: false });
    });
    G.bison = []; G.hunt = null;
    G.pulses = G.pulses.filter(function (q) { return q.who && q.who.id === 'neoul' && false; });
    fade(false);
    renderHUD(true);
  });
}

/* ===== 위로 · 외로움 · 접촉 동의 ===== */
var NEG = { embarrassed: 1, sad: 1, dejected: 1, lonely: 1, frustrated: 1, hurt: 1, shame: 1, disappoint: 1, pessimism: 1, fear: 1 };
function comfortRoutine(reason) {
  if (G.consent || G.t - G.lastComfort < 25 || G.song) return;
  var c = npcs().filter(function (p) { return !p.injured && !p.apart && !(p.task && p.task.kind === 'hunt' && G.hunt && G.hunt.phase === 'gather') && p.trust >= 0.3; }).sort(function (a, b) { return b.trust - a.trust; })[0];
  if (!c) return;
  G.lastComfort = G.t;
  c.task = { kind: 'comfort' };
  setEmo(c, 'worried', 10);
  goTo(c, G.me.i + 0.7, G.me.j + 0.4, function () {
    faceTo(c, G.me); c.arm = 'pat';
    askConsent(c, '토닥이기', function (ok) {
      c.arm = 'side';
      if (ok) { c.helpedMe = G.t; G.stats.comforts++; feel(G.me, { goal: 0.6, agent: 'other', target: 'you', inten: 0.6 }, 6); setEmo(c, 'warm', 5); c.trust = clamp(c.trust + 0.05, 0, 1); SND.voice('soothe', c.look.pitch, 0.8); showCutin(c, 'warm', G.me, G.me.emo); }
      else { setEmo(c, 'calm', 3, { emote: false }); c.picto = { keys: ['wait'], until: G.t + 2 }; }
      c.task = null; if (G.phase === 'day') setTimeout2(2, function () { if (!c.task) startRole(c); });
      updateSeatTargets();
    });
  });
}
function checkLonely(dt) {
  if (G.phase !== 'day' || G.song || G.day === 1 && G.tut < 4) { G.lonelyT = 0; return; }
  var any = npcs().some(function (p) { return !p.apart && near(p, G.me, 5); });
  G.lonelyT = any ? 0 : G.lonelyT + dt;
  if (G.lonelyT > 35 && G.me.emo !== 'lonely') { feel(G.me, { lack: 'contact', time: 'lasting', inten: 0.4 }, 20); var d = byId('dallae'); if (d) d.emote = { key: 'q', until: G.t + 3 }; setTimeout2(4, function () { comfortRoutine('lonely'); }); }
}

/* ===== 그림말 응답 ===== */
function sendPicto(keys) {
  G.me.picto = { keys: keys.slice(), until: G.t + 4 };
  var has = function (k) { return keys.indexOf(k) >= 0; };
  var near6 = npcs().filter(function (p) { return !p.apart && near(p, G.me, 7) && !p.injured; }).sort(function (a, b) { return Math.hypot(a.i - G.me.i, a.j - G.me.j) - Math.hypot(b.i - G.me.i, b.j - G.me.j); });
  var first = near6[0];
  setTimeout2(0.8, function () {
    if (has('danger')) { warnCall(); return; }
    if ((has('bison') && has('go')) || (has('go') && has('band'))) {
      if (G.hunt && G.hunt.phase === 'gather') { near6.slice(0, 3).forEach(function (p) { if (p.trust >= 0.25) { p.picto = { keys: ['good'], until: G.t + 3 }; p.task = { kind: 'hunt' }; p.spear = true; goTo(p, RALLY.i + rnd(-1, 1), RALLY.j + rnd(-1, 1)); } else p.emote = { key: 'q', until: G.t + 3 }; }); }
      else if (first) first.emote = { key: 'q', until: G.t + 3 };
      return;
    }
    if (has('follow') && first) { if (first.trust >= 0.25) { startFollow(first, 40); first.picto = { keys: ['good'], until: G.t + 2 }; } else first.picto = { keys: ['wait'], until: G.t + 2 }; return; }
    if (has('help') && first) { goTo(first, G.me.i + 0.8, G.me.j + 0.6); first.picto = { keys: ['good'], until: G.t + 2 }; return; }
    if (has('fire') || has('wood')) { var n = byId('nuri'); if (n && !n.injured) { n.picto = { keys: ['good'], until: G.t + 2 }; G.fuel = Math.min(100, G.fuel + 6); } return; }
    if (has('joy') || has('good')) { contagion('joy'); return; }
    if (has('sad') || has('hurt') || has('fear')) { feel(G.me, { goal: -0.4, power: 0.3, inten: 0.4 }, 6); comfortRoutine('sad'); return; }
    if (has('thanks') && first) { setEmo(first, 'warm', 4); first.trust = clamp(first.trust + 0.01, 0, 1); return; }
    if (has('love') && first) { setEmo(first, first.trust > 0.45 ? 'moved' : 'shy', 4); return; }
    if (has('song')) { contagion('sing'); return; }
    if (has('eat') && near(G.me, FIRE, 4)) { near6.forEach(function (p) { p.emote = { key: 'heart', until: G.t + 2 }; }); return; }
    if (first) { first.emote = { key: 'q', until: G.t + 3 }; first.picto = { keys: keys.length > 1 ? ['good'] : ['wait'], until: G.t + 2 }; }
  });
}
function contagion(kind) {
  npcs().forEach(function (p) {
    if (p.apart || p.injured) return;
    var d = Math.hypot(p.i - G.me.i, p.j - G.me.j); if (d > 8) return;
    setTimeout2(0.3 + d * 0.3, function () { setEmo(p, kind === 'sing' ? 'sing' : 'joy', 3.5, { emote: kind === 'sing' ? 'note' : 'spark' }); if (kind !== 'sing') SND.voice('laugh', p.look.pitch, 0.6); p.trust = clamp(p.trust + 0.004, 0, 1); });
  });
}
function startFollow(p, sec, hold) { p.follow = { until: G.t + sec, hold: !!hold }; p.task = { kind: 'follow' }; }
function warnCall() {
  var danger = G.wolves.length || (G.bison.length && G.bison[0].alert);
  G.warnLog = G.warnLog.filter(function (t) { return G.t - t < 120; }); if (!danger) G.warnLog.push(G.t);
  var damp = G.warnLog.length > RULES.warnMisuse;
  if (!damp) G.pulses.push({ i: G.me.i, j: G.me.j, until: G.t + 1.6, c: '224,96,90', r: 3, warn: true });
  npcs().forEach(function (p) { if (near(p, G.me, 10) && !p.apart) { feel(p, { nov: 0.8, val: -0.3, goal: 0, power: danger ? 0.3 : 0.6, inten: 0.6 }, 2.5); } });
}

/* ===== 접촉 청하기(플레이어 → NPC) ===== */
function touchRequest(p, kind) {
  if (p.lockDay && G.day < p.lockDay) { p.ghostHint = G.t + 2; return; }
  var need = { hold: 0.45, pat: 0.3 }[kind] || 0.3;
  var negative = NEG[p.emo] || p.injured;
  approach(p, function () {
    G.me.arm = 'pat'; faceTo(G.me, p); faceTo(p, G.me);
    setTimeout2(0.7, function () {
      G.me.arm = 'side';
      var ok = p.trust >= need && !p.apart && (kind !== 'pat' || negative);
      if (kind === 'pat' && !negative) { p.emote = { key: 'q', until: G.t + 2 }; return; }
      if (!ok) {
        p.picto = { keys: ['wait'], until: G.t + 2.5 }; p.declines++; G.stats.declines++;
        if (p.declines >= RULES.touchDeclineLock) { p.lockDay = G.day + 3; }
        return;
      }
      if (kind === 'hold') { startFollow(p, 30, true); setEmo(p, 'warm', 30); feel(G.me, { goal: 0.5, agent: 'other', target: 'you', inten: 0.4 }, 6); p.trust = clamp(p.trust + 0.04, 0, 1); }
      else { feel(p, { goal: 0.6, agent: 'other', target: 'you', inten: 0.6, prior: 'worried' }, 6); p.trust = clamp(p.trust + 0.06, 0, 1); showCutin(p, p.emo, G.me, 'warm'); }
      updateSeatTargets();
    });
  });
}
function approach(p, then) { if (near(G.me, p, 1.2)) { then(); return; } goTo(G.me, p.i + 0.6, p.j + 0.5, then); }

/* ===== 몸짓 바퀴 동작 ===== */
function doGesture(p, k) {
  closeWheel();
  if (k === 'give') {
    approach(p, function () {
      var it = invTake(function (x) { return x === 'berry' || x === 'meat'; }); if (!it) return;
      faceTo(G.me, p); faceTo(p, G.me); G.me.arm = 'reach'; setTimeout2(0.6, function () { G.me.arm = 'side'; });
      G.food.fresh += FOODV[it]; G.stats.shares++;
      p.trust = clamp(p.trust + 0.12, 0, 1); p.help = G.t;
      var e = feel(p, { goal: 0.6, agent: 'other', target: 'you', inten: 0.6 }, 6);
      p.picto = { keys: ['thanks'], until: G.t + 3 };
      npcs().forEach(function (q) { if (q !== p && near(q, G.me, 4)) q.trust = clamp(q.trust + 0.03, 0, 1); });
      feel(G.me, { goal: 0.5, norm: 0.4, target: 'self', aud: 0.3, inten: 0.4, agent: 'self' }, 5);
      showCutin(p, e, G.me, G.me.emo); SND.chime(true);
      if (G.day === 1 && G.tut === 3) tutStep(4);
      updateSeatTargets();
    });
  } else if (k === 'hold' || k === 'pat') touchRequest(p, k);
  else if (k === 'follow') { G.me.picto = { keys: ['follow'], until: G.t + 2 }; if (p.trust >= 0.25 && !p.injured) { startFollow(p, 40); p.picto = { keys: ['good'], until: G.t + 2 }; } else p.picto = { keys: ['wait'], until: G.t + 2 }; }
  else if (k === 'teach') { if (near(p, G.me, 4) && (p.role === 'gather' || p.role === 'tend')) { G.learnUntil = G.t + 40; setEmo(p, 'warm', 4); p.trust = clamp(p.trust + 0.02, 0, 1); renderHUD(true); } else p.emote = { key: 'q', until: G.t + 2 }; }
  else if (k === 'thanks') { G.me.picto = { keys: ['thanks'], until: G.t + 2 }; if (G.t - (p.helpedMe || -99) < 90) { setEmo(p, 'warm', 4); p.trust = clamp(p.trust + 0.03, 0, 1); } else setEmo(p, 'shy', 3); }
  else if (k === 'care') {
    approach(p, function () { if (!invTake(function (x) { return x === 'herb'; })) return; G.me.arm = 'pat'; setTimeout2(1.5, function () { G.me.arm = 'side'; p.injured = false; p.pose = 'stand'; feel(p, { goal: 0.7, agent: 'other', target: 'you', inten: 0.7, prior: 'fear' }, 6); p.trust = clamp(p.trust + 0.15, 0, 1); showCutin(p, 'relief', G.me, 'warm'); updateSeatTargets(); if (G.phase === 'day') startRole(p); }); });
  } else if (k === 'apart') { p.apart = !p.apart; if (p.apart) { p.follow = null; } }
}

/* ===== 매 프레임 NPC ===== */
function stepNPC(p, dt) {
  decayEmo(p);
  if (p.injured) { p.pose = 'lie'; return; }
  if (p.follow) {
    if (G.t > p.follow.until) { p.follow = null; p.task = null; if (G.phase === 'day') startRole(p); }
    else if (!p.path || p.path.length === 0) {
      var d = Math.hypot(p.i - G.me.i, p.j - G.me.j), gap = p.follow.hold ? 0.7 : 1.4;
      if (d > gap + 0.4) goTo(p, G.me.i - 0.5 * G.me.face, G.me.j + 0.5);
    } else if (G.me.path && Math.random() < dt * 2) { goTo(p, G.me.i - 0.5 * G.me.face, G.me.j + 0.5); }
  }
  if (p.apart && Math.hypot(p.i - G.me.i, p.j - G.me.j) < 3 && !p.path) { var a = Math.atan2(p.j - G.me.j, p.i - G.me.i); goTo(p, p.i + Math.cos(a) * 2, p.j + Math.sin(a) * 2); }
  if (p.task && p.task.kind === 'tend' && G.phase === 'day') {
    if (G.t > p.task.nextWood && G.fuel < 60 && p.task.woodLeft > 0) { p.task.woodLeft--; p.task.nextWood = G.t + 25; G.fuel = Math.min(100, G.fuel + 8); p.arm = 'reach'; setTimeout2(1, function () { p.arm = 'side'; }); }
    if (G.learnUntil < G.t && near(p, G.me, 3) && G.me.arm === 'reach' && Math.random() < dt * 0.2) { G.learnUntil = G.t + 30; renderHUD(true); }
  }
  stepMove(p, dt);
}
function stepFuel(dt) {
  var rate = G.phase === 'night' ? 0.25 : (G.phase === 'dusk' ? 0.2 : 0.11);
  if (G.day >= RULES.winterFrom) rate *= 1.35;
  if (!G.song) G.fuel = Math.max(0, G.fuel - rate * dt);
}

/* ===== 튜토리얼 ===== */
function tutStep(n) {
  G.tut = n;
  var neoul = byId('neoul');
  if (n === 1) {
    G.frozen = false; G.pulses = G.pulses.filter(function (q) { return q.who !== neoul; });
    G.me.pose = 'stand'; setEmo(G.me, 'surprise', 2);
    neoul.picto = { keys: ['follow'], until: G.t + 3 };
    npcs().forEach(function (p) { if (p.id !== 'neoul' && p.id !== 'dallae') { p.pose = 'stand'; } });
    goTo(neoul, 20.4, 13.6, function () { neoul.face = -1; tutStep(2); });
    startFollow(G.me, 9999); G.me.follow = { leader: neoul, until: G.t + 9999 };
    showHint(null);
  }
  if (n === 2) {
    G.me.follow = null; G.me.path = null;
    neoul.arm = 'reach'; neoul.picto = { keys: ['berry'], until: G.t + 4 }; G.learnUntil = G.t + 60; renderHUD(true);
    setTimeout2(1.2, function () { neoul.arm = 'side'; });
    var b = G.bushes[2]; G.pulses.push({ i: b.i, j: b.j, until: G.t + 40, c: '244,178,102', tut: 2 });
    showHint({ i: b.i, j: b.j, kind: 'tap' });
  }
  if (n === 3) {
    G.pulses = G.pulses.filter(function (q) { return q.tut !== 2; });
    neoul.picto = { keys: ['follow'], until: G.t + 3 };
    var s = seatOf(neoul); goTo(neoul, s.i, s.j, function () { neoul.pose = 'sit'; });
    var d = byId('dallae'); var ds = seatOf(d); d.i = ds.i; d.j = ds.j; d.pose = 'sit'; setEmo(d, 'calm', 1, { emote: false });
    G.pulses.push({ who: d, until: G.t + 999, c: '244,178,102', tut: 3 });
    showHint({ who: d, kind: 'hold' });
  }
  if (n === 4) {
    G.pulses = G.pulses.filter(function (q) { return q.tut !== 3; });
    showHint(null);
    var d2 = byId('dallae'); d2.pose = 'stand'; setTimeout2(4, function () { startRole(d2); });
    neoul.task = null; startRole(neoul);
    G.pulses.push({ i: FIRE.i, j: FIRE.j, until: G.t + 25, c: '255,211,107', r: 1.2 });
    G.pulses.push({ i: G.woods[0].i, j: G.woods[0].j, until: G.t + 25, c: '244,178,102' });
  }
}

/* ===== 플레이어 행동 ===== */
function tapAt(sx, sy) {
  if (G.over || G.song || G.consent) return;
  if (G.phase === 'night' && G.frozen) return;
  var hit = hitTest(sx, sy);
  if (G.day === 1 && G.tut === 0) { if (hit && hit.kind === 'person' && hit.p.id === 'neoul') tutStep(1); return; }
  if (G.me.follow && G.me.follow.leader) return;
  G.me.pickLoop = false;
  if (!hit) return;
  if (hit.kind === 'person') { if (hit.p.isMe) return; approach(hit.p, function () { faceTo(G.me, hit.p); faceTo(hit.p, G.me); if (hit.p.trust > 0.3 && !hit.p.apart) hit.p.emote = { key: 'heart', until: G.t + 1.5 }; }); return; }
  if (hit.kind === 'bush') { goTo(G.me, hit.o.i + 0.5, hit.o.j + 0.7, function () { G.me.pickLoop = true; pickBush(hit.o); }); return; }
  if (hit.kind === 'wood') { goTo(G.me, hit.o.i + 0.6, hit.o.j + 0.6, function () { if (hit.o.n > 0 && invAdd('wood')) { hit.o.n--; G.me.arm = 'reach'; SND.pick(); setTimeout2(0.4, function () { G.me.arm = 'side'; }); } }); return; }
  if (hit.kind === 'herb') { goTo(G.me, hit.o.i + 0.6, hit.o.j + 0.4, function () { if (hit.o.n > 0 && invAdd('herb')) { hit.o.n--; SND.pick(); } }); return; }
  if (hit.kind === 'trap') { goTo(G.me, hit.o.i + 0.5, hit.o.j + 0.5, function () { var t = hit.o; if (t.state === 'empty') { t.state = 'set'; G.me.arm = 'reach'; setTimeout2(0.6, function () { G.me.arm = 'side'; }); } else if (t.state === 'caught') { if (invAdd('meat')) t.state = 'empty'; } }); return; }
  if (hit.kind === 'fire') { goTo(G.me, FIRE.i + 0.9, FIRE.j + 1.4, depositFire); return; }
  if (hit.kind === 'slab') { goTo(G.me, SLAB.i + 0.6, SLAB.j + 0.8, tryDiscovery); return; }
  if (hit.kind === 'bison') {
    if (G.day < 2) return;
    goTo(G.me, RALLY.i - 0.6, RALLY.j + 0.6, function () { faceTo(G.me, hit.o); G.me.spear = true; if (G.hunt && G.hunt.phase === 'gather') { var n = huntParticipants().length; if (n >= 4) resolveHunt(); else { G.me.picto = { keys: ['band', 'help'], until: G.t + 3 }; } } });
    return;
  }
  if (hit.kind === 'ground') goTo(G.me, hit.i, hit.j);
}
function pickBush(b) {
  if (!G.me.pickLoop) return;
  if (b.n <= 0) { G.me.pickLoop = false; return; }
  G.me.arm = 'reach'; faceTo(G.me, b);
  var dur = G.learnUntil > G.t ? 0.45 : 0.9;
  setTimeout2(dur, function () {
    G.me.arm = 'side';
    if (!G.me.pickLoop || Math.hypot(G.me.i - b.i, G.me.j - b.j) > 1.5) return;
    if (b.n > 0 && invAdd('berry')) { b.n--; SND.pick(); floatText(G.me, '+열매', '#F0A49E'); }
    if (G.day === 1 && G.tut === 2 && invCount('berry') >= 3) { G.me.pickLoop = false; tutStep(3); return; }
    if (G.inv.indexOf(null) >= 0 && b.n > 0) pickBush(b); else G.me.pickLoop = false;
  });
}
function depositFire() {
  var food = 0, wood = 0;
  G.inv = G.inv.map(function (x) { if (x === 'berry' || x === 'meat') { food += FOODV[x]; return null; } if (x === 'wood') { wood++; return null; } return x; });
  compactInv();
  if (food) { G.food.fresh += food; floatAt(FIRE, '+' + food + ' 먹을 것', '#FFD9A0'); }
  if (wood) { G.fuel = Math.min(100, G.fuel + wood * 12); floatAt(FIRE, '불 +' + wood, '#FFB25C'); SND.crackle(); }
  if (food || wood) { npcs().forEach(function (q) { if (near(q, G.me, 4)) q.trust = clamp(q.trust + 0.01 * (food + wood), 0, 1); }); updateSeatTargets(); }
}
function pointAt(i, j, bisonTarget) {
  G.me.arm = 'point'; faceTo(G.me, { i: i, j: j });
  G.gazes.push({ who: G.me, i: i, j: j, until: G.t + 4 });
  setTimeout2(4, function () { if (G.me.arm === 'point') G.me.arm = 'side'; });
  var lookers = npcs().filter(function (p) { return !p.apart && !p.injured && p.trust >= 0.25 && near(p, G.me, 9); });
  lookers.slice(0, 3).forEach(function (p, k) { setTimeout2(0.5 + k * 0.4, function () { G.gazes.push({ who: p, i: i, j: j, until: G.t + 3.5 }); faceTo(p, { i: i, j: j }); }); });
  if (bisonTarget && G.hunt && G.hunt.phase === 'gather' && lookers.length) { G.hunt.gaze = 1; setTimeout2(1, function () { floatAt({ i: i, j: j }, '함께 바라봄', '#FFE7A0'); }); }
}

/* ===== 판정 ===== */
function worldToScreen(i, j) { var p = iso(i, j); return [(p[0] - CAM.x) * Z + VW / 2, (p[1] - CAM.y) * Z + VH / 2]; }
function screenToWorld(sx, sy) { var x = (sx - VW / 2) / Z + CAM.x, y = (sy - VH / 2) / Z + CAM.y; return [(x / 32 + y / 16) / 2, (y / 16 - x / 32) / 2]; }
function hitTest(sx, sy) {
  var best = null, bd = 1e9;
  G.people.forEach(function (p) { var s = worldToScreen(p.i, p.j), hx = s[0], hy = s[1] - 38 * p.scale * 1.35 * Z; var d = Math.hypot(sx - hx, sy - hy); if (d < 30 * Z && d < bd) { bd = d; best = { kind: 'person', p: p }; } });
  if (best) return best;
  var objs = [];
  G.bison.forEach(function (b) { objs.push({ kind: 'bison', o: b, r: 46, dy: -34 }); });
  G.bushes.forEach(function (b) { objs.push({ kind: 'bush', o: b, r: 26, dy: -12 }); });
  G.woods.forEach(function (b) { if (b.n > 0) objs.push({ kind: 'wood', o: b, r: 22, dy: -6 }); });
  G.herbs.forEach(function (b) { objs.push({ kind: 'herb', o: b, r: 18, dy: -6 }); });
  G.traps.forEach(function (b) { objs.push({ kind: 'trap', o: b, r: 18, dy: -6 }); });
  objs.push({ kind: 'fire', o: FIRE, r: 40, dy: -16 }); objs.push({ kind: 'slab', o: SLAB, r: 30, dy: 0 });
  objs.forEach(function (h) { var s = worldToScreen(h.o.i, h.o.j); var d = Math.hypot(sx - s[0], sy - (s[1] + h.dy * Z)); if (d < h.r * Z && d < bd) { bd = d; best = h; } });
  if (best) return best;
  var w = screenToWorld(sx, sy); if (w[0] < 0 || w[1] < 0 || w[0] >= N || w[1] >= N) return null;
  return { kind: 'ground', i: w[0], j: w[1] };
}
