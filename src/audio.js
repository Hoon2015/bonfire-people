/* ===== audio.js : 단어 없는 발성과 북소리 (WebAudio 합성) ===== */
var SND = (function () {
  var ac = null, master = null, on = true;
  function init() {
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) { ac = null; }
  }
  function noiseBuf() {
    var b = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  var NB = null;
  function voiced(t0, dur, f0, f1, amp, type, formant, vib) {
    var o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter();
    o.type = type || 'sawtooth';
    o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f1, t0 + dur);
    if (vib) { var l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vib; lg.gain.value = f0 * 0.03; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05); }
    bp.type = 'bandpass'; bp.frequency.value = formant || 900; bp.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(amp, t0 + Math.min(0.05, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(bp); bp.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function breath(t0, dur, f, amp, hp) {
    if (!NB) NB = noiseBuf();
    var s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
    s.buffer = NB; fl.type = hp ? 'highpass' : 'bandpass'; fl.frequency.value = f; fl.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(amp, t0 + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  function voice(kind, base, len, pitchShift) {
    if (!ac || !on) return;
    var t = ac.currentTime + 0.01, b = base * Math.pow(2, (pitchShift || 0) / 12), L = Math.max(0.3, len || 1);
    if (kind === 'laugh') { var n = Math.max(3, Math.round(L * 4)); for (var i = 0; i < n; i++) voiced(t + i * 0.16, 0.12, b * (1.5 - i * 0.05), b * (1.35 - i * 0.05), 0.22, 'sawtooth', 1100); }
    else if (kind === 'call') { voiced(t, L * 0.4, b, b, 0.2, 'triangle', 800, 5); voiced(t + L * 0.48, L * 0.5, b * 1.5, b * 1.55, 0.22, 'triangle', 900, 5); }
    else if (kind === 'warn') { voiced(t, 0.22, b * 2.1, b * 2.2, 0.3, 'square', 1400); voiced(t + 0.3, 0.26, b * 2.3, b * 2.2, 0.3, 'square', 1400); }
    else if (kind === 'hum') { var notes = [1, 1.122, 1, 1.26, 1]; for (var k = 0; k < notes.length; k++) voiced(t + k * L / notes.length, L / notes.length + 0.05, b * notes[k], b * notes[k], 0.12, 'triangle', 600, 4); }
    else if (kind === 'sigh') { breath(t, L * 1.2, 900, 0.18); voiced(t, L, b * 0.9, b * 0.6, 0.05, 'sine', 500); }
    else if (kind === 'soothe') { breath(t, L * 1.3, 3500, 0.12, true); }
    else if (kind === 'wow') { voiced(t, L, b, b * 1.6, 0.2, 'sawtooth', 1000); }
    else if (kind === 'gasp') { breath(t, 0.25, 1800, 0.25); }
    else if (kind === 'cheer') { voiced(t, L, b * 1.3, b * 2, 0.22, 'sawtooth', 1200, 6); }
    else if (kind === 'growl') { voiced(t, L, b * 0.5, b * 0.45, 0.25, 'sawtooth', 300, 22); }
  }
  function drum(acc) {
    if (!ac || !on) return;
    var t = ac.currentTime + 0.005, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(acc ? 120 : 90, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(acc ? 0.6 : 0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
    breath(t, 0.08, 2500, 0.06);
  }
  function chime(up) {
    if (!ac || !on) return;
    var t = ac.currentTime + 0.01; [1, 1.25, 1.5].forEach(function (r, i) { voiced(t + i * 0.09, 0.4, 520 * r * (up ? 1 : 0.8), 520 * r * (up ? 1 : 0.8), 0.08, 'triangle', 2000); });
  }
  function pick() { if (!ac || !on) return; var t = ac.currentTime; voiced(t, 0.08, 880, 1200, 0.08, 'triangle', 2000); }
  function crackle() { if (!ac || !on) return; breath(ac.currentTime, 0.12, 1500, 0.08); }
  return { init: init, voice: voice, drum: drum, chime: chime, pick: pick, crackle: crackle, setOn: function (v) { on = v; }, isOn: function () { return on; }, ready: function () { return !!ac; } };
})();
