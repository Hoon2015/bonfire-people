/* ===== data.js : 규칙 수치, 인물, 그림말, 얼굴 ===== */
var RULES = {
  need: 2,                 // 1명이 하루에 먹는 양
  bison: 50,               // 들소 1마리
  huntBase: 0.20,          // 4명일 때
  huntPer: 0.05,           // 1명 늘 때마다
  huntMax: 0.60,
  spearBonus: 0.15,        // 투창기
  gazeBonus: 0.05,         // 함께 바라보기
  gatherAutumn: [2, 3],
  gatherWinter: [1, 2],
  trap: [0, 2],
  feastDays: 2,            // 이틀 치 이상 쌓이면 잔치
  winterGift: 16,          // 첫 겨울 원로의 말린 고기
  days: 7, winterFrom: 4,
  dayLen: 120, duskLen: 14, // 초 (1배속)
  touchDeclineLock: 3,     // 하루 3번 거절되면 잠김
  warnMisuse: 3            // 위험 없이 경고 3번
};

var BAND = [
  { id: 'neoul', name: '너울', role: 'tend', age: 'elder', skin: '#B98260', hair: '#E4DCCF', style: 'long', fur: '#7A5A3E', trim: '#E4DCCF', shells: true, trust: 0.5, pitch: 180, home: [14.6, 15.2] },
  { id: 'dallae', name: '달래', role: 'gather', age: 'adult', skin: '#C18A62', hair: '#3A2416', style: 'long', fur: '#6B4A33', trim: '#E8D9BE', braid: true, beads: true, trust: 0.34, pitch: 300, home: [17.6, 15.0] },
  { id: 'maru', name: '마루', role: 'hunt', age: 'adult', skin: '#A8714C', hair: '#1C130E', style: 'short', fur: '#5C4330', trim: '#CDBFA8', band: true, trust: 0.24, pitch: 150, home: [18.2, 17.0] },
  { id: 'bawi', name: '바위', role: 'hunt', age: 'adult', skin: '#9E6A48', hair: '#2A1A10', style: 'short', fur: '#574030', trim: '#CDBFA8', trust: 0.2, pitch: 120, home: [15.0, 18.2] },
  { id: 'nuri', name: '누리', role: 'trap', age: 'adult', skin: '#B47C58', hair: '#2B1D14', style: 'messy', fur: '#4E3A2A', trim: '#D8C7A6', trust: 0.22, pitch: 210, home: [13.8, 16.6] },
  { id: 'yeoul', name: '여울', role: 'gather', age: 'adult', skin: '#C48A5E', hair: '#3A2416', style: 'long', fur: '#7A6248', trim: '#E8D9BE', trust: 0.26, pitch: 260, home: [16.6, 18.6] },
  { id: 'sol', name: '솔', role: 'child', age: 'child', skin: '#CC9670', hair: '#3A2416', style: 'tuft', fur: '#8A6A4A', trim: '#E8D9BE', trust: 0.3, pitch: 380, home: [17.2, 14.2] }
];
var PLAYER_LOOK = { id: 'me', name: '가람', skin: '#C99069', hair: '#2B1D14', style: 'messy', fur: '#9A7448', trim: '#E8D9BE', pitch: 240 };

/* 그림말: 24 viewBox 선 아이콘. f:true 는 채움 */
var PICTO = {
  follow: { t: '따라와', d: 'M8 4c1.6 0 2.2 2.2 2.2 4.4S9 12 8 12s-2.2-1.4-2.2-3.6S6.4 4 8 4z M15.5 11c1.6 0 2.2 2.2 2.2 4.4S16.5 19 15.5 19s-2.2-1.4-2.2-3.6.6-4.4 2.2-4.4z' },
  wait: { t: '기다려', d: 'M7 12.5V7a1.3 1.3 0 0 1 2.6 0v4.5M9.6 11V5.2a1.3 1.3 0 0 1 2.6 0V11M12.2 11V6a1.3 1.3 0 0 1 2.6 0v6M14.8 12V9a1.3 1.3 0 0 1 2.6 0v5.5c0 3.5-2.5 6-6 6-2.6 0-4.4-1.6-5.6-3.6L4 14c-.6-1.2.9-2.2 1.9-1.2L7 14' },
  help: { t: '도와줘', d: 'M12 3.5a2 2 0 1 0 .01 0M12 7.5v7M12 14.5l-3 5.5M12 14.5l3 5.5M5 5.5l7 4.5 7-4.5' },
  eat: { t: '먹자', d: 'M3.5 11h17a8.5 8.5 0 0 1-17 0zM9 7.5c0-2 2-2 2-4M13.5 7.5c0-2 2-2 2-4' },
  go: { t: '가자', d: 'M4 12h14M13 6l6 6-6 6' },
  thanks: { t: '고마워', d: 'M10 3.5a2 2 0 1 0 .01 0M10 6.5c3.5.8 6 3.5 6.5 7M10 6.5l-2.5 6.5h7M9 13l-2 7.5M13 13l2 7.5' },
  fire: { t: '불', f: true, d: 'M12 2c2.5 4.5 7 6.5 7 12a7 7 0 0 1-14 0c0-3.5 2.2-5.6 3.4-7.8.2 2.2 1.4 3.4 2.6 3.4-.4-3 .4-5 1-7.6z' },
  danger: { t: '위험', d: 'M12 3l10 18H2zM12 10v5M12 18v.6' },
  joy: { t: '기쁨', d: 'M12 3a9 9 0 1 0 .01 0zM7.5 13.5c2.2 3.6 6.8 3.6 9 0M8.5 9.5v.6M15.5 9.5v.6' },
  sad: { t: '슬픔', d: 'M12 3a9 9 0 1 0 .01 0zM8 16.5c2.2-2.6 5.8-2.6 8 0M8.5 9.5v.6M15.5 9.5v.6M16 11.5c-.6 1-.8 1.8 0 2.4' },
  fear: { t: '무서움', d: 'M12 3a9 9 0 1 0 .01 0zM8 16l1.3-1.3L10.7 16l1.3-1.3L13.3 16l1.3-1.3L16 16M8.5 9a1 1 0 1 0 .01 0M15.5 9a1 1 0 1 0 .01 0' },
  love: { t: '사랑', f: true, d: 'M12 20.5S3.5 15.3 3.5 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.3c0 6-8.5 11.2-8.5 11.2z' },
  bison: { t: '들소', f: true, d: 'M2.5 15c0-4 3-7 8.5-7 3 0 5 1 7 2 2 0 3.5 1.5 3.5 3.5S20 17 18.5 17v3.5h-2V17h-8v3.5h-2v-3.8C4 16.3 2.5 15.8 2.5 15z' },
  deer: { t: '순록', d: 'M12 21v-6M8 10C5 9 4 6 4 3M8 10c1-2 1-4 0-6M16 10c3-1 4-4 4-7M16 10c-1-2-1-4 0-6M8 10h8l-1 5H9z' },
  rabbit: { t: '토끼', d: 'M9.5 3c-1.2 3-.4 6 .8 8M14.5 3c1.2 3 .4 6-.8 8M7 16a5 4 0 1 0 10 0 5 4 0 1 0-10 0z' },
  fish: { t: '물고기', d: 'M2.5 12c4-5.5 10-5.5 14.5 0-4.5 5.5-10.5 5.5-14.5 0zM17 12l4.5-3.5v7z' },
  cave: { t: '동굴', d: 'M3 20h18M5 20v-8a7 7 0 0 1 14 0v8M9.5 20v-4.5a2.5 2.5 0 0 1 5 0V20' },
  river: { t: '강', d: 'M2 8c3-2 5 2 8 0s5-2 8 0 3 1 4 0M2 14c3-2 5 2 8 0s5-2 8 0 3 1 4 0' },
  forest: { t: '숲', d: 'M7 3l-4.5 8.5h9zM7 11.5V16M17 6l-4.5 8.5h9zM17 14.5V19M2 20h20' },
  berry: { t: '열매', d: 'M8 13a3 3 0 1 0 .01 0zM15 12a3 3 0 1 0 .01 0zM11.5 18a3 3 0 1 0 .01 0zM12 4c0 3 1 5 3 6M12 4c-1.5 1.5-2 3.5-1 6' },
  wood: { t: '장작', d: 'M3.5 15.5l14-6M6 19.5l14-6M17.5 9.5a1.5 1.5 0 1 0 .01 0' },
  spear: { t: '창', d: 'M4 20L17.5 6.5M15 4.5l5-.8-.8 5z' },
  you: { t: '너', d: 'M12 4a2.5 2.5 0 1 0 .01 0M7 20c0-4 2.2-7.5 5-7.5s5 3.5 5 7.5M18.5 9l2.5-2.5' },
  me: { t: '나', d: 'M12 4a2.5 2.5 0 1 0 .01 0M7 20c0-4 2.2-7.5 5-7.5s5 3.5 5 7.5M12 12.5v3' },
  band: { t: '우리', d: 'M6 7a2 2 0 1 0 .01 0M12 5a2 2 0 1 0 .01 0M18 7a2 2 0 1 0 .01 0M3 19c0-3.5 1.5-6 3-6M21 19c0-3.5-1.5-6-3-6M8 20c0-4 1.8-7 4-7s4 3 4 7' },
  song: { t: '노래', d: 'M9 18V5l10-2v13M6.5 18a2.5 2.5 0 1 0 .01 0M16.5 16a2.5 2.5 0 1 0 .01 0' },
  sleep: { t: '자자', d: 'M15 3.5a8.5 8.5 0 1 0 5.5 11A6.5 6.5 0 0 1 15 3.5zM15 6h3l-3 3h3' },
  good: { t: '좋아', d: 'M12 8a2 2 0 1 0 .01 0M12 11v5.5M12 16.5l-3 4M12 16.5l3 4M12 12l-5-7M12 12l5-7' },
  bad: { t: '싫어', d: 'M5 5l14 14M19 5L5 19' },
  hurt: { t: '아파', d: 'M4 14L14 4l6 6-10 10zM9 9l1.2 1.2M11.5 11.5l1.2 1.2M12 7l1.2 1.2' },
  sun: { t: '해', d: 'M12 8a4 4 0 1 0 .01 0zM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8' },
  moon: { t: '달', f: true, d: 'M15 3.5a8.5 8.5 0 1 0 5.5 11A6.5 6.5 0 0 1 15 3.5z' }
};
var PICTO_STAGE = [
  ['follow', 'wait', 'help', 'eat', 'go', 'thanks', 'fire', 'danger', 'joy', 'sad', 'fear', 'love'],
  ['bison', 'deer', 'rabbit', 'fish', 'cave', 'river', 'forest', 'berry', 'wood', 'spear', 'you', 'me', 'band', 'song', 'sleep', 'good', 'bad', 'hurt'],
  ['sun', 'moon']
];

/* 몸짓 바퀴 아이콘 */
var GEST = {
  give: { t: '나눠주기', d: 'M3 14h6l3-2h4a2 2 0 0 1 0 4h-3M3 19h9l7-4M16 6a2.5 2.5 0 1 0 .01 0' },
  hold: { t: '손 잡기', d: 'M3 13l4-4 3 3 2-2 2 2 3-3 4 4M7 9v6M17 9v6' },
  follow: { t: '따라와', d: PICTO.follow.d },
  teach: { t: '가르쳐 줘', d: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z' },
  thanks: { t: '고마워', d: PICTO.thanks.d },
  pat: { t: '토닥이기', d: 'M6 14V8.5a1.4 1.4 0 0 1 2.8 0V12M8.8 11V6.5a1.4 1.4 0 0 1 2.8 0V11M11.6 11V7.5a1.4 1.4 0 0 1 2.8 0V12M14.4 12V9.5a1.4 1.4 0 0 1 2.8 0V15c0 3-2.2 5-5 5H11c-2.5 0-4-1.5-5-3M4 4l2 2M9 2.5v2' },
  care: { t: '돌보기', d: 'M12 21c-4-2-7-5.5-7-10 3 0 5.5 1.5 7 4 1.5-2.5 4-4 7-4 0 4.5-3 8-7 10zM12 15V5M12 8l-3-3M12 8l3-3' },
  apart: { t: '거리 두기', d: 'M12 4v16M8 12H3M5.5 9.5L3 12l2.5 2.5M16 12h5M18.5 9.5L21 12l-2.5 2.5' }
};

/* 발성 */
var VOICES = [
  { k: 'laugh', t: '웃음', d: 'M12 3a9 9 0 1 0 .01 0zM7.5 12.5c2.2 4 6.8 4 9 0zM8.5 9h.01M15.5 9h.01' },
  { k: 'call', t: '부르기', d: 'M4 10v4h3l5 4V6L7 10zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11' },
  { k: 'warn', t: '경고', d: 'M12 3l10 18H2zM12 10v5M12 18v.6' },
  { k: 'hum', t: '흥얼', d: 'M9 18V5l10-2v13M6.5 18a2.5 2.5 0 1 0 .01 0M16.5 16a2.5 2.5 0 1 0 .01 0' },
  { k: 'sigh', t: '한숨', d: 'M3 12c3-3 6-3 9 0s6 3 9 0M5 17c2-1.5 4-1.5 6 0' },
  { k: 'soothe', t: '쉬이', d: 'M12 21c-4-3-6-6-6-9a6 6 0 0 1 12 0c0 3-2 6-6 9zM9.5 11.5c1.6 1 3.4 1 5 0' }
];

/* ===== 감정 엔진 2판: 다섯 다이얼 + 맥락 + 입력 넷 ===== */
var EMO_LABEL = { calm: '평온', joy: '기쁨', warm: '흐뭇함', moved: '고마움', shy: '수줍음', surprise: '놀람', fear: '두려움', worried: '걱정', anxious: '불안', determined: '결의', frustrated: '아쉬움', disappoint: '실망', sad: '슬픔', dejected: '낙담', pessimism: '비관', despair: '절망', anger: '분노', rage: '격노', annoyed: '짜증', grievance: '억울함', embarrassed: '당황', sheepish: '민망함', shame: '수치', guilt: '죄책감', pride: '자부', jealous: '질투', envy: '시기', hurt: '서운함', relief: '안도', bored: '지루함', lonely: '외로움', sing: '함께 노래', eureka: '깨달음', sleepy: '졸림', peace: '평화', disgust: '역겨움' };
function appraise(s) {
  var d = { nov: 0, val: 0, goal: 0, power: 0.5, norm: 0, target: 'nature', aud: 0, inten: 0.5, time: 'moment', agent: 'nature', third: '', prior: '', lack: '' };
  for (var k in s) d[k] = s[k];
  if (d.lack === 'contact' && d.time === 'lasting') return 'lonely';
  if (d.lack === 'stim' && d.time === 'lasting') return 'bored';
  if (d.goal > 0.3 && (d.prior === 'fear' || d.prior === 'anxious' || d.prior === 'worried')) return 'relief';
  if (d.goal > 0.3 && d.agent === 'other' && d.target === 'you') return 'moved';
  if (d.goal < -0.3 && d.third === 'love') return 'jealous';
  if (d.goal < -0.3 && d.third === 'gain') return 'envy';
  if (d.goal < -0.3 && d.agent === 'other' && d.power < 0.35) return 'grievance';
  if (d.nov > 0.7 && Math.abs(d.goal) < 0.3) return d.power < 0.4 ? 'fear' : 'surprise';
  if (d.val < -0.6 && d.target === 'thing') return 'disgust';
  if (d.norm < -0.3) {
    if (d.target === 'self') { var x = d.inten * (0.4 + 0.6 * d.aud); return x > 0.6 ? 'shame' : (x > 0.25 ? 'embarrassed' : 'sheepish'); }
    return 'guilt';
  }
  if (d.goal < -0.3) {
    if (d.power >= 0.6) return d.inten > 0.8 ? 'rage' : (d.inten > 0.4 ? 'anger' : 'annoyed');
    if (d.power >= 0.35) return (d.target === 'you' && d.inten <= 0.5) ? 'hurt' : 'disappoint';
    if (d.time === 'lasting') return 'pessimism';
    return d.inten > 0.9 ? 'despair' : 'dejected';
  }
  if (d.goal > 0.3) return (d.norm > 0.3 && d.target === 'self') ? 'pride' : 'joy';
  return 'calm';
}

/* ===== 큰 얼굴(컷인) SVG: 얼굴 컴포넌트를 옮긴 것 ===== */
var FACE = (function () {
  var B = { neutral: 'M90 98 Q100 94 110 97 M130 97 Q140 94 150 98', up: 'M90 91 Q100 84 110 89 M130 89 Q140 84 150 91', sad: 'M90 100 Q100 97 110 90 M130 90 Q140 97 150 100', angry: 'M90 91 Q100 94 110 100 M130 100 Q140 94 150 91', soft: 'M90 98 Q100 95 110 95 M130 95 Q140 95 150 98', furious: 'M88 88 Q100 93 111 103 M129 103 Q140 93 152 88', worried: 'M91 100 Q102 96 110 89 M130 89 Q138 96 149 100', heavy: 'M90 101 Q100 99 110 100 M130 100 Q140 99 150 101', oneUp: 'M90 98 Q100 95 110 97 M130 92 Q140 83 150 88' };
  var M = { neutral: 'M112 147 Q120 149 128 147', smile: 'M106 143 Q120 156 134 143', small: 'M113 147 Q120 152 127 147', frown: 'M108 154 Q120 144 132 154', wobble: 'M106 151 Q110 146 114 151 Q118 156 122 151 Q126 146 130 151 Q132 153 134 151', press: 'M108 148 L132 148', bitter: 'M108 149 Q117 150 125 147 Q130 145 133 141', flat: 'M113 148 L127 148', smileCtl: 'M108 146 Q120 152 132 146', smallFrown: 'M112 151 Q120 146 128 151', pout: 'M112 150 Q116 143 120 146 Q124 143 128 150 Q120 155 112 150' };
  var E = {
    calm: ['normal', 'neutral', 'small', 0.15, [], 'idle'], joy: ['happy', 'up', 'grin', 0.55, ['sparkle'], 'hop'], warm: ['happy', 'soft', 'smile', 0.35, [], 'idle'],
    moved: ['teary', 'sad', 'smile', 0.55, ['tearJoy', 'hearts'], 'sway'], shy: ['normal', 'soft', 'wobble', 0.85, [], 'idle'], surprise: ['wide', 'up', 'o', 0, ['exclaim'], 'jolt'],
    fear: ['wide', 'sad', 'wobble', 0, ['sweat'], 'tremble'], worried: ['normal', 'worried', 'smallFrown', 0, ['dots'], 'idle'], anxious: ['wide', 'worried', 'wobble', 0, ['sweat'], 'tremble'],
    determined: ['det', 'angry', 'grit', 0.1, [], 'idle'], frustrated: ['squeeze', 'sad', 'frown', 0, ['sweat', 'gloom'], 'slump'], disappoint: ['down', 'soft', 'frown', 0, [], 'slump'],
    sad: ['sad', 'sad', 'wobble', 0.2, ['tears', 'gloom'], 'slump'], dejected: ['heavy', 'sad', 'frown', 0, ['gloom'], 'slump'], pessimism: ['heavy', 'heavy', 'flat', 0, ['gloom'], 'slump'],
    despair: ['closed', 'sad', 'wobble', 0.2, ['tears', 'gloom'], 'slump'], anger: ['det', 'furious', 'grit', 0, ['vein'], 'stomp'], rage: ['det', 'furious', 'o', 0, ['vein'], 'tremble'],
    annoyed: ['narrow', 'angry', 'press', 0.1, [], 'idle'], grievance: ['teary', 'sad', 'bite', 0.3, [], 'tremble'], embarrassed: ['down', 'soft', 'smileCtl', 0.8, ['sweat'], 'idle'],
    sheepish: ['closed', 'soft', 'smile', 0.95, [], 'idle'], shame: ['down', 'sad', 'flat', 0.3, ['gloom'], 'slump'], guilt: ['normal', 'sad', 'wobble', 0.1, ['dots'], 'idle'],
    pride: ['happy', 'up', 'smile', 0.3, ['sparkle'], 'hop'], jealous: ['glare', 'angry', 'press', 0, [], 'idle'], envy: ['glare', 'soft', 'bitter', 0, [], 'idle'],
    hurt: ['down', 'sad', 'bitter', 0.15, [], 'idle'], relief: ['teary', 'sad', 'grin', 0.5, ['tears'], 'hop'], bored: ['heavy', 'heavy', 'o', 0, [], 'idle'],
    lonely: ['normal', 'worried', 'flat', 0, ['chill'], 'idle'], sing: ['happy', 'up', 'o', 0.45, ['notes'], 'hop'], eureka: ['wide', 'up', 'grin', 0.4, ['sparkle', 'exclaim'], 'hop'],
    sleepy: ['closed', 'neutral', 'o', 0.2, ['zz'], 'idle'], peace: ['closed', 'soft', 'smile', 0.3, ['tearJoy'], 'idle'], disgust: ['squeeze', 'angry', 'frown', 0, [], 'idle']
  };
  function eyes(k, look, w) {
    var o = '';
    var L = 100 + (look || 0), R = 140 + (look || 0);
    if (k === 'normal') o = '<ellipse cx="' + L + '" cy="114" rx="7" ry="9" fill="#1C130E"><animate attributeName="ry" values="9;9;1;9" keyTimes="0;0.93;0.965;1" dur="4.2s" repeatCount="indefinite"/></ellipse><ellipse cx="' + R + '" cy="114" rx="7" ry="9" fill="#1C130E"><animate attributeName="ry" values="9;9;1;9" keyTimes="0;0.93;0.965;1" dur="4.2s" repeatCount="indefinite"/></ellipse><circle cx="' + (L + 2.5) + '" cy="110" r="2.6" fill="#fff"/><circle cx="' + (R + 2.5) + '" cy="110" r="2.6" fill="#fff"/>';
    else if (k === 'teary') o = '<ellipse cx="100" cy="114" rx="8" ry="10" fill="#1C130E"/><ellipse cx="140" cy="114" rx="8" ry="10" fill="#1C130E"/><circle cx="103" cy="109" r="3.2" fill="#fff"/><circle cx="143" cy="109" r="3.2" fill="#fff"/><path d="M90 122 Q100 127 110 122 M130 122 Q140 127 150 122" stroke="#9FD3EA" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    else if (k === 'happy') o = '<path d="M90 117 Q100 104 110 117 M130 117 Q140 104 150 117" stroke="#1C130E" stroke-width="4" stroke-linecap="round" fill="none"/>';
    else if (k === 'wide') o = '<ellipse cx="100" cy="113" rx="10" ry="11.5" fill="#fff" stroke="#1C130E" stroke-width="2.4"/><ellipse cx="140" cy="113" rx="10" ry="11.5" fill="#fff" stroke="#1C130E" stroke-width="2.4"/><circle cx="100" cy="114" r="4" fill="#1C130E"/><circle cx="140" cy="114" r="4" fill="#1C130E"/>';
    else if (k === 'closed') o = '<path d="M90 113 Q100 121 110 113 M130 113 Q140 121 150 113" stroke="#1C130E" stroke-width="3.6" stroke-linecap="round" fill="none"/>';
    else if (k === 'sad') o = '<ellipse cx="100" cy="116" rx="6.5" ry="7.5" fill="#1C130E"/><ellipse cx="140" cy="116" rx="6.5" ry="7.5" fill="#1C130E"/><path d="M91 108 Q100 105 109 110 M131 110 Q140 105 149 108" stroke="#1C130E" stroke-width="2.6" stroke-linecap="round" fill="none"/>';
    else if (k === 'squeeze') o = '<path d="M92 107 L107 114 L92 121 M148 107 L133 114 L148 121" stroke="#1C130E" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    else if (k === 'det') o = '<ellipse cx="100" cy="116" rx="7" ry="7.5" fill="#1C130E"/><ellipse cx="140" cy="116" rx="7" ry="7.5" fill="#1C130E"/><path d="M90 107 L110 111 M130 111 L150 107" stroke="#1C130E" stroke-width="3.4" stroke-linecap="round"/>';
    else if (k === 'narrow') o = '<ellipse cx="100" cy="116" rx="6" ry="3.6" fill="#1C130E"/><ellipse cx="140" cy="116" rx="6" ry="3.6" fill="#1C130E"/><path d="M89 112 Q100 110 111 112 M129 112 Q140 110 151 112" stroke="#1C130E" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
    else if (k === 'glare') o = '<ellipse cx="100" cy="116" rx="10" ry="6" fill="#fff" stroke="#1C130E" stroke-width="2"/><ellipse cx="140" cy="116" rx="10" ry="6" fill="#fff" stroke="#1C130E" stroke-width="2"/><circle cx="105" cy="116.5" r="4.4" fill="#1C130E"/><circle cx="145" cy="116.5" r="4.4" fill="#1C130E"/><path d="M89 112 L111 111 M129 111 L151 112" stroke="#1C130E" stroke-width="4" stroke-linecap="round"/>';
    else if (k === 'down') o = '<path d="M90 114 Q100 110 110 114 M130 114 Q140 110 150 114" stroke="#1C130E" stroke-width="3.4" stroke-linecap="round" fill="none"/><ellipse cx="' + L + '" cy="119" rx="5" ry="3" fill="#1C130E"/><ellipse cx="' + R + '" cy="119" rx="5" ry="3" fill="#1C130E"/>';
    else if (k === 'heavy') o = '<ellipse cx="100" cy="117" rx="6.5" ry="5.5" fill="#1C130E"/><ellipse cx="140" cy="117" rx="6.5" ry="5.5" fill="#1C130E"/><path d="M89 113 L111 113 M129 113 L151 113" stroke="' + w.skin + '" stroke-width="7" stroke-linecap="round"/><path d="M90 115.5 L110 115.5 M130 115.5 L150 115.5" stroke="#1C130E" stroke-width="2.8" stroke-linecap="round"/>';
    return o;
  }
  function mouth(k) {
    if (M[k]) return '<path d="' + M[k] + '" stroke="#4A2018" stroke-width="3.6" stroke-linecap="round" fill="none"/>';
    if (k === 'grin') return '<path d="M104 142 Q120 144 136 142 Q133 162 120 163 Q107 162 104 142 Z" fill="#6B2A22"/><path d="M106 143 Q120 145 134 143 L133 147 Q120 149 107 147 Z" fill="#F4EDE2"/><ellipse cx="120" cy="157" rx="7" ry="3.6" fill="#D46A5A"/>';
    if (k === 'o') return '<ellipse cx="120" cy="152" rx="7" ry="8" fill="#6B2A22"/>';
    if (k === 'grit') return '<rect x="107" y="143" width="26" height="10" rx="3" fill="#F4EDE2" stroke="#4A2018" stroke-width="2.2"/><path d="M107 148 H133 M116 143 V153 M124 143 V153" stroke="#4A2018" stroke-width="1.4"/>';
    if (k === 'bite') return '<path d="M108 145 Q120 142 132 145" stroke="#4A2018" stroke-width="3" stroke-linecap="round" fill="none"/><rect x="112" y="145" width="16" height="5" rx="1.5" fill="#F4EDE2" stroke="#4A2018" stroke-width="1.4"/><path d="M110 152 Q120 149 130 152" stroke="#B5564A" stroke-width="3.4" stroke-linecap="round" fill="none"/>';
    return '';
  }
  var FX = {
    sweat: '<path d="M170 78 C166 86 164 90 164 94 A6 6 0 0 0 176 94 C176 90 174 86 170 78 Z" fill="#CBEAF6" stroke="#6FA3B8" stroke-width="1.6"><animateTransform attributeName="transform" type="translate" values="0 0;0 7;0 0" dur="1.4s" repeatCount="indefinite"/></path>',
    tears: '<path d="M95 124 C93 136 94 146 96 154 M145 124 C147 136 146 146 144 154" stroke="#9FD3EA" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.9"/>',
    tearJoy: '<path d="M150 120 C147 126 146 129 146 132 A4.5 4.5 0 0 0 155 132 C155 129 153 126 150 120 Z" fill="#BFE4F2"><animateTransform attributeName="transform" type="translate" values="0 0;0 16" dur="2.4s" repeatCount="indefinite"/></path>',
    gloom: '<path d="M86 30 V52 M100 24 V50 M114 22 V48 M128 22 V48 M142 24 V50 M156 30 V52" stroke="#3A3550" stroke-width="3" stroke-linecap="round" opacity="0.45"/>',
    sparkle: '<path fill="#FFD36B" d="M196 52 L200 64 L212 68 L200 72 L196 84 L192 72 L180 68 L192 64 Z"><animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"/></path><path fill="#FFD36B" d="M40 70 L43 78 L51 81 L43 84 L40 92 L37 84 L29 81 L37 78 Z"><animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/></path>',
    notes: '<g fill="none" stroke="#E2771F" stroke-width="3.2" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 10;6 -24" dur="1.8s" repeatCount="indefinite"/><path d="M196 74 V50 L210 46 V70"/><circle cx="193" cy="75" r="4" fill="#E2771F"/><circle cx="207" cy="71" r="4" fill="#E2771F"/></g>',
    hearts: '<path fill="#E0605A" d="M200 70 c-6 -8 -16 -2 -10 6 l10 9 l10 -9 c6 -8 -4 -14 -10 -6 z"><animateTransform attributeName="transform" type="translate" values="0 12;0 -18" dur="2.2s" repeatCount="indefinite"/></path>',
    zz: '<text x="186" y="66" font-size="24" font-weight="700" fill="#8FA3C8">z</text><text x="204" y="44" font-size="18" font-weight="700" fill="#8FA3C8">z</text>',
    exclaim: '<path d="M196 34 L204 34 L202 70 L198 70 Z" fill="#E2771F"/><circle cx="200" cy="80" r="4.5" fill="#E2771F"/>',
    dots: '<g fill="#8A7E70"><circle cx="186" cy="58" r="4"/><circle cx="200" cy="58" r="4"/><circle cx="214" cy="58" r="4"/></g>',
    vein: '<g transform="translate(160 74)"><path d="M-9 -3 C-4 -3 -4 -8 -4 -10 M4 -10 C4 -5 4 -3 9 -3 M9 4 C4 4 4 9 4 11 M-4 11 C-4 6 -4 4 -9 4" stroke="#D0392B" stroke-width="3.6" stroke-linecap="round" fill="none"/></g>',
    chill: '<g stroke="#9FB8E0" stroke-width="3" stroke-linecap="round" fill="none"><path d="M10 116 Q28 106 46 116"/><path d="M6 146 Q24 138 40 146"/></g>'
  };
  var BANGS = {
    messy: 'M64 102 C64 64 90 46 120 46 C152 46 176 64 176 102 C170 90 164 84 156 80 L152 94 L142 78 L132 92 L122 76 L112 92 L102 78 L94 94 L88 82 C78 86 70 92 64 102 Z',
    long: 'M64 106 C64 66 90 46 120 46 C150 46 176 66 176 106 C168 84 150 68 122 66 C96 68 72 82 64 106 Z',
    short: 'M66 98 C68 64 94 48 120 48 C146 48 172 64 174 98 C166 84 150 74 120 74 C92 74 74 84 66 98 Z',
    tuft: 'M66 100 C68 66 94 52 120 52 C146 52 172 66 174 100 C164 86 150 78 136 76 L130 86 L122 74 L112 86 L106 76 C88 80 72 88 66 100 Z'
  };
  return function (w, emo, size) {
    var e = E[emo] || E.calm, child = w.age === 'child', elder = w.age === 'elder';
    var mv = { idle: '0 0;0 -1.5;0 0', hop: '0 0;0 -7;0 0', sway: '0 0;0 -2;0 0', jolt: '0 0;0 -9;0 0', tremble: '-1.6 0;1.6 0;-1.6 0', slump: '0 0;0 5;0 0', stomp: '0 0;0 -5;0 2' }[e[5]];
    var md = { idle: '3.4s', hop: '0.9s', sway: '3s', jolt: '1.6s', tremble: '0.14s', slump: '3s', stomp: '0.9s' }[e[5]];
    var s = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 240 240" aria-hidden="true"><g><animateTransform attributeName="transform" type="translate" values="' + mv + '" dur="' + md + '" repeatCount="indefinite"/>';
    if (w.style === 'long') s += '<path d="M62 102 C56 160 66 204 78 222 L162 222 C174 204 184 160 178 102 C172 62 150 44 120 44 C90 44 68 62 62 102 Z" fill="' + w.hair + '"/>';
    s += '<path d="' + (child ? 'M42 240 C46 204 78 184 120 182 C162 184 194 204 198 240 Z' : 'M22 240 C26 194 64 172 120 170 C176 172 214 194 218 240 Z') + '" fill="' + w.fur + '"/>';
    s += '<path d="' + (child ? 'M80 192 L88 202 L96 192 L104 202 L112 192 L120 202 L128 192 L136 202 L144 192 L152 202 L160 192 C146 184 134 182 120 182 C106 182 94 184 80 192 Z' : 'M70 182 L80 194 L90 182 L100 194 L110 182 L120 194 L130 182 L140 194 L150 182 L160 194 L170 182 C154 174 138 170 120 170 C102 170 86 174 70 182 Z') + '" fill="' + w.trim + '"/>';
    if (w.shells) s += '<g fill="#EFE3CC"><ellipse cx="96" cy="196" rx="5" ry="6"/><ellipse cx="108" cy="201" rx="5" ry="6"/><ellipse cx="120" cy="203" rx="6" ry="7"/><ellipse cx="132" cy="201" rx="5" ry="6"/><ellipse cx="144" cy="196" rx="5" ry="6"/></g>';
    if (w.beads) s += '<g><circle cx="100" cy="196" r="4" fill="#C2703A"/><circle cx="112" cy="200" r="4" fill="#6FA3B8"/><circle cx="124" cy="201" r="4" fill="#C2703A"/><circle cx="136" cy="199" r="4" fill="#6FA3B8"/></g>';
    var fy = child ? 5 : 0, hcy = child ? 112 : 108, hrx = child ? 57 : 54, hry = child ? 58 : 62;
    s += '<path d="M104 148 L104 178 C112 184 128 184 136 178 L136 148 Z" fill="' + w.skin + '"/><ellipse cx="66" cy="' + (child ? 120 : 116) + '" rx="8" ry="12" fill="' + w.skin + '"/><ellipse cx="174" cy="' + (child ? 120 : 116) + '" rx="8" ry="12" fill="' + w.skin + '"/>';
    s += '<ellipse cx="120" cy="' + hcy + '" rx="' + hrx + '" ry="' + hry + '" fill="' + w.skin + '"/>';
    if (elder) s += '<path d="M102 82 Q120 78 138 82 M106 88 Q120 85 134 88" stroke="#5A3A26" stroke-width="1.6" fill="none" opacity="0.45"/>';
    s += '<g transform="translate(0 ' + fy + ')"><ellipse cx="88" cy="134" rx="11" ry="5.5" fill="#E0605A" opacity="' + e[3] + '"/><ellipse cx="152" cy="134" rx="11" ry="5.5" fill="#E0605A" opacity="' + e[3] + '"/>';
    s += eyes(e[0], 0, w);
    s += '<path d="' + B[e[1]] + '" stroke="' + (elder ? '#CFC6B8' : '#2B1D14') + '" stroke-width="4.8" stroke-linecap="round" fill="none"/>';
    s += '<path d="M118 120 Q121 130 117 134" stroke="#000" stroke-opacity="0.22" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
    s += mouth(e[2]) + '</g>';
    s += '<path d="' + BANGS[w.style] + '" fill="' + w.hair + '"/>';
    if (w.style === 'tuft') s += '<circle cx="120" cy="44" r="13" fill="' + w.hair + '"/>';
    if (w.band) s += '<path d="M67 90 C90 80 150 80 173 90 L173 99 C150 90 90 90 67 99 Z" fill="#C2703A"/>';
    if (w.braid) s += '<ellipse cx="172" cy="148" rx="9" ry="11" fill="' + w.hair + '"/><ellipse cx="176" cy="168" rx="8" ry="10" fill="' + w.hair + '"/>';
    e[4].forEach(function (k) { s += FX[k] || ''; });
    return s + '</g></svg>';
  };
})();

function iconSVG(d, filled, size, color) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '" fill="' + (filled ? color : 'none') + '" stroke="' + (filled ? 'none' : color) + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
