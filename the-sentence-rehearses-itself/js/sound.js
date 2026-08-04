/* sound.js — the spectral organism and its melody
 *
 * Four levels, defined before implementation:
 *
 * MATTER      additive partial banks, filtered noise bands, resonant
 *             impulses, breath-shaped bands, unstable difference tones.
 * MORPHOLOGY  events emerge, mature, erode, split, converge, disappear on
 *             different timescales. Not every grammatical event sounds.
 * FORM        over minutes the organism moves among harmonicity, beating,
 *             inharmonicity, sparse noise and silence, according to the
 *             accumulated history of the sentence.
 * MEMORY      interrupted processes become residues; repeated structures
 *             return transformed; abandoned clauses reappear later as
 *             altered spectral families.
 *
 * The visual clock never schedules audio. All timing is taken from
 * AudioContext.currentTime through a lookahead scheduler.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});

  var LIMITS = {
    voices: 8,          // simultaneous scheduled voices
    partials: 11,       // partials per additive voice
    totalPartials: 46,  // across the organism
    melodyVoices: 3,
    lookahead: 0.16,    // seconds scheduled ahead
    tickMs: 25,
    scoreEvents: 260
  };

  var MASTER_CEILING = 0.30;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* ================================================================ melody
     The subject is generated once per seed. It represents the sentence's
     accumulated grammatical identity, not its syllables. */

  function makeSubject(rng, seedHash) {
    var modeRoll = (seedHash % 3);
    var mode = ['harmonic', 'modal', 'stretched'][modeRoll];
    var root = 46 + (seedHash % 9);              // MIDI, low register anchor
    var f0 = mtof(root);
    var field = [];

    if (mode === 'harmonic') {
      // a region of the harmonic series, which is a scale that is also a timbre
      [4, 5, 6, 7, 8, 9, 10, 12].forEach(function (n) { field.push(f0 * n / 4); });
    } else if (mode === 'modal') {
      var steps = rng.pick([[0, 2, 3, 5, 7, 9, 10], [0, 2, 4, 5, 7, 9, 11], [0, 1, 3, 5, 7, 8, 10], [0, 2, 3, 7, 8, 10]]);
      steps.forEach(function (s) { field.push(mtof(root + 12 + s)); });
      field.push(mtof(root + 24 + steps[1]));
    } else {
      var stretch = 1.0 + rng.range(0.015, 0.05);  // octaves that do not close
      for (var i = 0; i < 8; i++) field.push(f0 * 2 * Math.pow(2, (i * 1.7 * stretch) / 12));
    }
    field.sort(function (a, b) { return a - b; });

    var n = rng.int(5, 9);
    var shape = rng.pick(['arch', 'descent', 'wave', 'plateau', 'ascent-with-gap']);
    var idx = [], cur = rng.int(1, Math.max(1, field.length - 3));
    for (var k = 0; k < n; k++) {
      var f = k / (n - 1 || 1);
      var pull;
      if (shape === 'arch') pull = Math.sin(f * Math.PI) * (field.length - 1);
      else if (shape === 'descent') pull = (1 - f) * (field.length - 1);
      else if (shape === 'ascent-with-gap') pull = (f > 0.55 ? f + 0.18 : f) * (field.length - 1);
      else if (shape === 'wave') pull = (0.5 + 0.5 * Math.sin(f * Math.PI * 2.2)) * (field.length - 1);
      else pull = (0.45 + (rng() - 0.5) * 0.2) * (field.length - 1);
      cur = Math.round(cur * 0.35 + pull * 0.65);
      cur = clamp(cur + (rng.chance(0.3) ? (rng.chance(0.5) ? 1 : -1) : 0), 0, field.length - 1);
      idx.push(cur);
    }

    var pulse = rng.range(0.34, 0.56);
    var rhythm = idx.map(function (_, i) {
      var r = rng.weighted([1, 1.5, 2, 3, 0.5], function (v) {
        return v === 1 ? 3 : v === 2 ? 2 : v === 1.5 ? 1.6 : v === 3 ? 1 : 0.8;
      });
      if (i === idx.length - 1) r = Math.max(r, 2);   // shaped ending
      return r * pulse;
    });

    var breath = [];
    for (var b = 1; b < n - 1; b++) if (rng.chance(0.22)) breath.push(b);

    return {
      mode: mode,
      pitchField: field,
      contour: idx.map(function (i) {
        return { i: i, f: field[i], norm: field.length > 1 ? i / (field.length - 1) : 0.5 };
      }),
      rhythm: rhythm,
      breath: breath,
      register: 0,
      missingTones: [],
      harmonicity: mode === 'harmonic' ? 0.92 : mode === 'modal' ? 0.7 : 0.4,
      age: 0,
      fatigue: 0,
      returnHistory: [],
      name: mode + '/' + shape,
      pulse: pulse
    };
  }

  function cloneSubject(s) {
    return {
      mode: s.mode, pitchField: s.pitchField.slice(),
      contour: s.contour.map(function (c) { return { i: c.i, f: c.f, norm: c.norm }; }),
      rhythm: s.rhythm.slice(), breath: s.breath.slice(),
      register: s.register, missingTones: s.missingTones.slice(),
      harmonicity: s.harmonicity, age: s.age, fatigue: s.fatigue,
      returnHistory: s.returnHistory.slice(), name: s.name, pulse: s.pulse
    };
  }

  /* Every transformation has a cause in the reading history. The `cause`
     string travels with the subject so the printed edition can show the
     spectral genealogy. */
  var T = {
    transpose: function (s, semis) {
      var r = Math.pow(2, semis / 12);
      s.pitchField = s.pitchField.map(function (f) { return f * r; });
      s.contour.forEach(function (c) { c.f *= r; });
      return 'transpose ' + (semis > 0 ? '+' : '') + semis;
    },
    invert: function (s) {
      var first = s.contour[0].i;
      s.contour.forEach(function (c) {
        c.i = clamp(2 * first - c.i, 0, s.pitchField.length - 1);
        c.f = s.pitchField[c.i];
        c.norm = c.i / Math.max(1, s.pitchField.length - 1);
      });
      return 'inversion';
    },
    retrograde: function (s) {
      s.contour.reverse(); s.rhythm.reverse();
      return 'retrograde';
    },
    augment: function (s, f) {
      s.rhythm = s.rhythm.map(function (r) { return r * (f || 1.6); });
      return 'augmentation ×' + (f || 1.6).toFixed(2);
    },
    diminish: function (s, f) {
      s.rhythm = s.rhythm.map(function (r) { return Math.max(0.09, r * (f || 0.62)); });
      return 'diminution';
    },
    registerShift: function (s, oct) {
      s.register += oct;
      return 'register ' + (oct > 0 ? '+' : '') + oct;
    },
    rhythmicDisplace: function (s, rng) {
      var i = rng.int(0, s.rhythm.length - 1);
      var d = s.rhythm[i] * 0.4;
      s.rhythm[i] -= d;
      s.rhythm[(i + 1) % s.rhythm.length] += d;
      return 'rhythmic displacement at ' + i;
    },
    ornament: function (s, rng) {
      var i = rng.int(0, s.contour.length - 1);
      var c = s.contour[i];
      var nb = clamp(c.i + (rng.chance(0.5) ? 1 : -1), 0, s.pitchField.length - 1);
      s.contour.splice(i, 0, { i: nb, f: s.pitchField[nb], norm: nb / Math.max(1, s.pitchField.length - 1), grace: true });
      s.rhythm.splice(i, 0, Math.max(0.07, s.rhythm[i] * 0.22));
      s.rhythm[i + 1] = Math.max(0.09, s.rhythm[i + 1] - s.rhythm[i]);
      return 'ornament before ' + i;
    },
    fragment: function (s, rng) {
      var keep = rng.int(2, Math.max(2, Math.floor(s.contour.length / 2)));
      var start = rng.int(0, s.contour.length - keep);
      s.contour = s.contour.slice(start, start + keep);
      s.rhythm = s.rhythm.slice(start, start + keep);
      return 'fragment [' + start + '..' + (start + keep - 1) + ']';
    },
    elide: function (s, rng) {
      if (s.contour.length < 3) return null;
      var i = rng.int(1, s.contour.length - 2);
      s.rhythm[i - 1] += s.rhythm[i];
      s.contour.splice(i, 1); s.rhythm.splice(i, 1);
      return 'elision at ' + i;
    },
    replaceInterval: function (s, rng) {
      if (s.contour.length < 2) return null;
      var i = rng.int(1, s.contour.length - 1);
      var prev = s.contour[i - 1].i;
      var d = s.contour[i].i - prev;
      var ni = clamp(prev - d, 0, s.pitchField.length - 1);   // one interval changes direction
      s.contour[i].i = ni;
      s.contour[i].f = s.pitchField[ni];
      s.contour[i].norm = ni / Math.max(1, s.pitchField.length - 1);
      return 'interval ' + i + ' changes direction';
    },
    omitStructural: function (s, rng) {
      // remove a tone that mattered: first, last, or the highest
      var hi = 0;
      s.contour.forEach(function (c, i) { if (c.i > s.contour[hi].i) hi = i; });
      var choice = rng.pick([0, s.contour.length - 1, hi]);
      if (s.contour.length < 3) return null;
      s.missingTones.push(s.contour[choice].i);
      s.rhythm[choice] = -Math.abs(s.rhythm[choice]);   // negative duration = rest
      return 'structural tone ' + choice + ' withheld';
    },
    interpolateForeign: function (s, rng) {
      var f = s.pitchField[rng.int(0, s.pitchField.length - 1)] * rng.range(1.03, 1.09);
      var i = rng.int(1, Math.max(1, s.contour.length - 1));
      s.contour.splice(i, 0, { i: -1, f: f, norm: 0.5, foreign: true });
      s.rhythm.splice(i, 0, s.pulse * 0.8);
      s.harmonicity = clamp(s.harmonicity - 0.08, 0, 1);
      return 'foreign tone at ' + i;
    },
    reduceToResidue: function (s) {
      if (s.contour.length <= 2) return null;
      s.contour = s.contour.slice(0, 2);
      s.rhythm = [s.rhythm[0], Math.abs(s.rhythm[1]) * 2.4];
      return 'reduced to a two-note residue';
    }
  };

  /* =============================================================== organism */

  function Sound(state) {
    this.state = state;
    this.ctx = null;
    this.running = false;
    this.timer = null;
    this.nextPhraseTime = 0;
    this.nextTextureTime = 0;
    this.voices = 0;
    this.activePartials = 0;
    this.subject = null;
    this.voiceSubjects = [];      // older versions carried by other voices
    this.melodyState = 'intimation';
    this.stateAge = 0;
    this.genealogy = [];
    this.residueSubjects = [];
    this.lastPhraseAt = -999;
    this.phrasesSince = 0;
    this.recognitionDone = false;
    this.withdrawnOnce = false;
    this.anticipated = false;
    this.log = [];
  }

  Sound.prototype.available = function () {
    return !!(window.AudioContext || window.webkitAudioContext);
  };

  Sound.prototype.init = function () {
    if (this.ctx) return this.ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ctx = this.ctx = new AC();

    var master = this.master = ctx.createGain();
    master.gain.value = 0;

    // soft saturation before the limiter: energy-dependent, never a wall
    var shaper = ctx.createWaveShaper();
    var curve = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) {
      var x = (i / 1023) * 2 - 1;
      curve[i] = Math.tanh(x * 1.4) * 0.86;
    }
    shaper.curve = curve;
    shaper.oversample = '2x';

    var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.22;

    this.busMelody = ctx.createGain(); this.busMelody.gain.value = 0.9;
    this.busTexture = ctx.createGain(); this.busTexture.gain.value = 0.55;
    this.busResidue = ctx.createGain(); this.busResidue.gain.value = 0.34;

    this.busMelody.connect(master);
    this.busTexture.connect(master);
    this.busResidue.connect(master);
    master.connect(shaper);
    shaper.connect(limiter);
    limiter.connect(ctx.destination);

    // one noise buffer, reused for every breath and impulse
    var len = Math.floor(ctx.sampleRate * 2.5);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var j = 0; j < len; j++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;      // gently pink
      d[j] = last * 3.2;
    }
    this.noiseBuffer = buf;

    this.subject = makeSubject(this.state.rng, this.state.seedHash);
    this.state.subject = this.subject;
    this.genealogy.push({ t: 0, cause: 'seed ' + this.state.seed, note: this.subject.name });
    return ctx;
  };

  Sound.prototype.start = function () {
    var ctx = this.init();
    if (!ctx) return false;
    var self = this;
    if (ctx.state === 'suspended') ctx.resume();
    this.running = true;
    var now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.linearRampToValueAtTime(MASTER_CEILING, now + 2.4);
    this.nextPhraseTime = now + 1.2;
    this.nextTextureTime = now + 0.6;
    if (!this.timer) this.timer = setInterval(function () { self.tick(); }, LIMITS.tickMs);
    return true;
  };

  Sound.prototype.stop = function () {
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.0001, now + 1.1);
    this.running = false;
    var self = this;
    setTimeout(function () {
      if (!self.running && self.timer) { clearInterval(self.timer); self.timer = null; }
    }, 1300);
  };

  Sound.prototype.destroy = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.running = false;
    if (this.ctx) { try { this.ctx.close(); } catch (e) { } this.ctx = null; }
  };

  /* --------------------------------------------------------- the scheduler */
  Sound.prototype.tick = function () {
    if (!this.running || !this.ctx) return;
    var ctx = this.ctx;
    var horizon = ctx.currentTime + LIMITS.lookahead;
    var guard = 0;
    while (this.nextPhraseTime < horizon && guard++ < 8) {
      this.schedulePhrase(this.nextPhraseTime);
    }
    guard = 0;
    while (this.nextTextureTime < horizon && guard++ < 8) {
      this.scheduleTexture(this.nextTextureTime);
    }
  };

  /* Form: which melodic condition the organism is in. Permeable, not scenes. */
  Sound.prototype.updateMelodicState = function () {
    var mem = this.state.mem;
    var t = mem.t;
    var att = mem.immediateAttention;
    var prev = this.melodyState;
    var s = prev;

    if (t < 42) s = 'intimation';
    else if (t < 95 && prev === 'intimation') s = 'statement';
    else {
      var roll = this.state.rng();
      if (mem.silenceDebt > 0.72) s = 'residue';
      else if (mem.ambiguity > 0.5 && roll < 0.4) s = 'forgetting';
      else if (mem.regime.RETURNING > 0.3 && !this.recognitionDone && t > 220) {
        s = this.falseReturnDone ? 'recognition' : 'falseReturn';
      } else if (mem.regime.BRANCHING > 0.28 && this.voiceSubjects.length) s = 'counterpoint';
      else if (att > 0.55) s = 'statement';
      else if (mem.regime.REPEATING > 0.3) s = 'forgetting';
      else s = 'learning';
    }

    if (s !== prev) {
      this.melodyState = s;
      this.stateAge = 0;
      if (s === 'falseReturn') this.falseReturnDone = true;
      if (s === 'recognition') this.recognitionDone = true;
      this.state.melodyState = s;
      this.genealogy.push({ t: Math.round(mem.t), cause: 'condition', note: s });
      if (this.genealogy.length > 60) this.genealogy.shift();
    } else this.stateAge++;
    this.state.melodyState = this.melodyState;
    return s;
  };

  /* Reading history → melodic consequence. Applied at phrase boundaries so
     the transformation is heard as a change of the tune, not as an effect. */
  Sound.prototype.applyHistory = function () {
    var mem = this.state.mem, rng = this.state.rng, s = this.subject;
    var causes = this.state.pendingCauses || [];
    this.state.pendingCauses = [];
    var applied = [];
    var self = this;

    causes.slice(0, 3).forEach(function (c) {
      var note = null;
      switch (c.kind) {
        case 'roleShift':                       // one defining interval changes direction
          note = T.replaceInterval(s, rng); break;
        case 'refrain':                          // the subject returns in another voice
          self.spawnVoiceSubject('a refrain returned'); note = 'canon'; break;
        case 'abandon':                          // its melody stops unfinished
          note = T.fragment(s, rng);
          self.residueSubjects.push({ s: cloneSubject(s), t: mem.t, cause: 'abandoned ' + (c.what || 'stanza') });
          if (self.residueSubjects.length > 6) self.residueSubjects.shift();
          break;
        case 'revisit':                          // augmentation or another register
          note = rng.chance(0.5) ? T.augment(s, 1.55) : T.registerShift(s, rng.chance(0.5) ? 1 : -1);
          break;
        case 'repeat':                           // repeated notes disappear
          s.fatigue = clamp(s.fatigue + 0.12, 0, 1);
          if (s.fatigue > 0.45 && rng.chance(0.6)) note = T.omitStructural(s, rng);
          break;
        case 'connect':                          // two branches: counterpoint
          self.spawnVoiceSubject('two branches were connected'); note = 'countermelody'; break;
        case 'diagram':                          // contour becomes spatial structure
          note = T.registerShift(s, 1); break;
        case 'attention':                        // clearer and more singable
          s.harmonicity = clamp(s.harmonicity + 0.06, 0, 1);
          if (s.missingTones.length && rng.chance(0.5)) {
            s.missingTones.pop();
            s.rhythm = s.rhythm.map(function (r) { return Math.abs(r); });
            note = 'a withheld tone is restored';
          }
          break;
        case 'ambiguity':
          s.harmonicity = clamp(s.harmonicity - 0.07, 0, 1);
          note = 'beating tones close in'; break;
        case 'residue':
          note = T.interpolateForeign(s, rng); break;
      }
      if (note) {
        applied.push(note);
        self.genealogy.push({ t: Math.round(mem.t), cause: c.kind, note: note });
        if (self.genealogy.length > 60) self.genealogy.shift();
      }
    });

    // slow drift caused by the shape of the whole reading
    s.age += 1;
    if (s.age % 9 === 0) {
      var slope = mem.slopeSeries('insistence');
      if (slope > 0.004) T.diminish(s, 0.9);
      else if (slope < -0.004) T.augment(s, 1.08);
    }
    return applied;
  };

  Sound.prototype.spawnVoiceSubject = function (cause) {
    if (this.voiceSubjects.length >= LIMITS.melodyVoices - 1) this.voiceSubjects.shift();
    var v = cloneSubject(this.subject);
    var rng = this.state.rng;
    var note = rng.chance(0.5) ? T.transpose(v, rng.pick([-5, -7, 5, 7]))
      : rng.chance(0.5) ? T.invert(v) : T.augment(v, 1.5);
    v.cause = cause;
    v.offset = rng.range(0.6, 2.2);       // stretto distance
    this.voiceSubjects.push(v);
    this.genealogy.push({ t: Math.round(this.state.mem.t), cause: cause, note: 'second voice: ' + note });
  };

  /* ------------------------------------------------------------- phrases */
  Sound.prototype.schedulePhrase = function (t0) {
    var mem = this.state.mem, rng = this.state.rng;
    var cond = this.updateMelodicState();
    var applied = this.applyHistory();

    // silence has formal consequences: the organism withdraws and owes nothing
    if (mem.silenceDebt > 0.62 && rng.chance(0.7)) {
      var rest = rng.range(3.5, 9) * (0.6 + mem.silenceDebt);
      this.pushScore(t0, 0.5, 'rest', 0.4);
      this.nextPhraseTime = t0 + rest;
      this.withdrawnOnce = true;
      if (rng.chance(0.35) && this.residueSubjects.length) {
        // an old fragment surfaces alone, without accompaniment
        var r = rng.pick(this.residueSubjects);
        this.playSubject(r.s, t0 + rest * 0.55, { gain: 0.5, bus: this.busResidue, sparse: true });
      }
      return;
    }

    var subj = this.subject;
    var opts = { gain: 0.85, bus: this.busMelody };

    if (cond === 'intimation') {
      opts.only = Math.min(3, Math.max(2, Math.round(1 + mem.t / 20)));
      opts.gain = 0.6;
    } else if (cond === 'forgetting') {
      opts.dropChance = 0.35 + this.subject.fatigue * 0.3;
    } else if (cond === 'falseReturn') {
      subj = cloneSubject(this.subject);
      T.replaceInterval(subj, rng);
      T.transpose(subj, rng.pick([1, -1, 2]));
      opts.gain = 0.9;
    } else if (cond === 'recognition') {
      opts.gain = 1;
      opts.clean = true;
    } else if (cond === 'residue') {
      subj = this.residueSubjects.length ? rng.pick(this.residueSubjects).s : cloneSubject(this.subject);
      opts.gain = 0.45; opts.bus = this.busResidue; opts.sparse = true;
    }

    var dur = this.playSubject(subj, t0, opts);

    // other voices remember older versions; density is never permanent
    if (cond === 'counterpoint' && this.voiceSubjects.length && rng.chance(0.7)) {
      var v = rng.pick(this.voiceSubjects);
      this.playSubject(v, t0 + (v.offset || 1.1), { gain: 0.5, bus: this.busMelody, dropChance: 0.2 });
    } else if (cond !== 'residue' && this.voiceSubjects.length && rng.chance(0.18)) {
      this.playSubject(this.voiceSubjects[0], t0 + rng.range(1.4, 3.2), { gain: 0.34, bus: this.busResidue, sparse: true });
    }

    // resistance to immediate repetition: the breath between phrases is
    // longer than the phrase wants
    var breath = rng.range(1.4, 3.4) * (1 + mem.silenceDebt * 1.6) * (cond === 'intimation' ? 1.6 : 1);
    if (cond === 'recognition') breath *= 1.6;
    this.nextPhraseTime = t0 + dur + breath;
    this.phrasesSince++;
    this.state.melodyApplied = applied;
  };

  /* One melodic phrase. Audible attacks, shaped endings, rests, breath. */
  Sound.prototype.playSubject = function (subj, t0, opts) {
    opts = opts || {};
    var rng = this.state.rng;
    var t = t0, total = 0;
    var n = subj.contour.length;
    var limit = opts.only ? Math.min(opts.only, n) : n;
    var oct = Math.pow(2, subj.register || 0);

    for (var i = 0; i < limit; i++) {
      var c = subj.contour[i];
      var d = subj.rhythm[i] !== undefined ? subj.rhythm[i] : subj.pulse;
      var isRest = d < 0 || subj.breath.indexOf(i) >= 0;
      d = Math.abs(d);
      if (opts.sparse && rng.chance(0.35)) isRest = true;
      if (opts.dropChance && rng.chance(opts.dropChance)) isRest = true;

      if (!isRest && this.voices < LIMITS.voices) {
        var f = c.f * oct;
        var last = i === limit - 1;
        var vel = (c.grace ? 0.45 : 1) * (last ? 0.85 : 1) * (opts.gain || 1);
        this.additive(f, t, Math.max(0.16, d * (last ? 1.5 : 0.92)), {
          bus: opts.bus || this.busMelody,
          gain: vel * 0.4,
          harmonicity: opts.clean ? Math.max(0.8, subj.harmonicity) : subj.harmonicity,
          partials: opts.clean ? 8 : Math.round(4 + subj.harmonicity * 5),
          attack: c.grace ? 0.006 : 0.014 + (1 - subj.harmonicity) * 0.05,
          foreign: c.foreign
        });
        this.pushScore(t, c.norm, last ? 'erode' : 'attack', vel);
      } else if (isRest) {
        this.pushScore(t, c.norm, 'rest', 0.3);
      }
      t += d;
      total += d;
    }
    return total;
  };

  /* -------------------------------------------------------------- matter */

  /* additive bank: partials with independent envelopes, so a tone converges
     or comes apart rather than simply fading */
  Sound.prototype.additive = function (freq, t0, dur, o) {
    if (!this.ctx || !isFinite(freq) || freq < 20 || freq > 9000) return;
    o = o || {};
    var ctx = this.ctx;
    var count = clamp(o.partials || 6, 1, LIMITS.partials);
    if (this.activePartials + count > LIMITS.totalPartials) count = Math.max(1, LIMITS.totalPartials - this.activePartials);
    if (count < 1) return;

    var harm = o.harmonicity == null ? 0.8 : o.harmonicity;
    var stretch = (1 - harm) * 0.16;
    var trace = this.state.mem.spectralTrace;
    var g = ctx.createGain();
    g.gain.value = 0;
    g.connect(o.bus || this.busMelody);

    var self = this;
    this.voices++;
    this.activePartials += count;

    for (var i = 0; i < count; i++) {
      var n = i + 1;
      var pf = freq * Math.pow(n, 1 + stretch);
      if (o.foreign) pf *= 1 + (i % 2 ? 0.006 : -0.004);
      if (pf > ctx.sampleRate * 0.45) break;
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pf, t0);
      // partials converge slowly under sustained attention
      var conv = this.state.mem.immediateAttention;
      osc.frequency.linearRampToValueAtTime(pf * (1 + (1 - conv) * stretch * 0.4), t0 + dur);

      var pg = ctx.createGain();
      var amp = (trace[Math.min(7, i)] || 0.1) / n * (o.gain || 0.3);
      var atk = (o.attack || 0.02) * (1 + i * 0.22);
      var rel = dur * (0.5 + i * 0.09);
      pg.gain.setValueAtTime(0.0001, t0);
      pg.gain.exponentialRampToValueAtTime(Math.max(0.0002, amp), t0 + atk);
      pg.gain.exponentialRampToValueAtTime(0.0001, t0 + atk + rel + 0.05);

      osc.connect(pg); pg.connect(g);
      osc.start(t0);
      osc.stop(t0 + dur + rel + 0.12);
      osc.onended = (function (node, pnode, k) {
        return function () {
          try { node.disconnect(); pnode.disconnect(); } catch (e) { }
          self.activePartials = Math.max(0, self.activePartials - 1);
        };
      })(osc, pg, i);
    }

    g.gain.setValueAtTime(1, t0);
    setTimeout(function () { try { g.disconnect(); } catch (e) { } self.voices = Math.max(0, self.voices - 1); },
      Math.max(200, (t0 - ctx.currentTime + dur * 2 + 0.6) * 1000));
  };

  /* breath-like band: noise through a moving bandpass */
  Sound.prototype.breath = function (t0, dur, centre, q, gain) {
    var ctx = this.ctx;
    var src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(centre, t0);
    bp.frequency.exponentialRampToValueAtTime(Math.max(60, centre * (0.7 + Math.random() * 0.7)), t0 + dur);
    bp.Q.value = q || 4;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.05), t0 + dur * 0.42);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(this.busTexture);
    src.start(t0); src.stop(t0 + dur + 0.05);
    src.onended = function () { try { src.disconnect(); bp.disconnect(); g.disconnect(); } catch (e) { } };
  };

  /* resonant impulse: a short noise burst read by two or three resonators */
  Sound.prototype.impulse = function (t0, freq, decay, gain) {
    var ctx = this.ctx;
    var src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.02);
    var out = ctx.createGain();
    out.gain.value = 1;
    var ratios = [1, 2.37, 3.91];
    var nodes = [];
    for (var i = 0; i < 3; i++) {
      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq * ratios[i];
      bp.Q.value = 22 + i * 16;
      var rg = ctx.createGain();
      rg.gain.setValueAtTime(0.6 / (i + 1), t0);
      rg.gain.exponentialRampToValueAtTime(0.0001, t0 + (decay || 1.4) / (i + 1));
      g.connect(bp); bp.connect(rg); rg.connect(out);
      nodes.push(bp, rg);
    }
    out.connect(this.busTexture);
    src.connect(g);
    src.start(t0); src.stop(t0 + 0.05);
    setTimeout(function () {
      try { src.disconnect(); g.disconnect(); out.disconnect(); nodes.forEach(function (n) { n.disconnect(); }); } catch (e) { }
    }, Math.max(300, (t0 - ctx.currentTime + (decay || 1.4) + 0.5) * 1000));
  };

  /* difference tones: two close sines that refuse to resolve */
  Sound.prototype.beating = function (t0, freq, delta, dur, gain) {
    var ctx = this.ctx;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.05), t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(this.busTexture);
    var oscs = [];
    [0, delta].forEach(function (d) {
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq + d, t0);
      o.frequency.linearRampToValueAtTime(freq + d * 1.7, t0 + dur);
      o.connect(g);
      o.start(t0); o.stop(t0 + dur + 0.05);
      oscs.push(o);
    });
    oscs[0].onended = function () { try { oscs.forEach(function (o) { o.disconnect(); }); g.disconnect(); } catch (e) { } };
  };

  /* ------------------------------------------------------------- textures
     Not every grammatical event produces sound. Texture follows the regime
     and the spectral trace, with false causality against the text. */
  Sound.prototype.scheduleTexture = function (t0) {
    var mem = this.state.mem, rng = this.state.rng;
    var reg = mem.regime;
    var gap = rng.range(1.6, 5.5);

    if (mem.silenceDebt > 0.5) {
      this.nextTextureTime = t0 + gap * (1 + mem.silenceDebt * 3);
      return;
    }

    var base = this.subject ? this.subject.pitchField[0] : 110;
    var roll = rng();

    if (roll < 0.3 + reg.NAMING * 0.2) {
      this.breath(t0, rng.range(2.2, 6.5), base * rng.range(2, 7), 3 + mem.ambiguity * 8,
        0.028 + mem.immediateAttention * 0.02);
      this.pushScore(t0, 0.2 + rng() * 0.2, 'erode', 0.35);
    } else if (roll < 0.5 + reg.RELATING * 0.2) {
      this.impulse(t0, base * rng.pick([2, 3, 4, 6]), rng.range(0.8, 2.6), 0.09);
      this.pushScore(t0, 0.55 + rng() * 0.25, 'attack', 0.4);
    } else if (roll < 0.72 + mem.ambiguity * 0.2) {
      var f = base * rng.pick([3, 4, 5]);
      this.beating(t0, f, f * (0.004 + mem.ambiguity * 0.02), rng.range(3, 9), 0.03 + mem.ambiguity * 0.03);
      this.pushScore(t0, 0.45, 'divide', 0.3 + mem.ambiguity * 0.4);
    } else if (roll < 0.86 && reg.BRANCHING > 0.16) {
      // a family divides into related trajectories, delayed
      var f2 = base * rng.pick([4, 5, 6]);
      this.breath(t0 + 0.4, rng.range(1.4, 3), f2, 9, 0.03);
      this.breath(t0 + rng.range(1.2, 3.4), rng.range(1.4, 3), f2 * 1.5, 11, 0.024);
      this.pushScore(t0, 0.72, 'divide', 0.45);
    } else if (mem.residues.length && rng.chance(0.4)) {
      // a residue returns as a nearly unrecognisable event
      this.impulse(t0, base * rng.range(5, 11), rng.range(2, 5), 0.05);
      this.pushScore(t0, 0.88, 'return', 0.3);
    }

    this.nextTextureTime = t0 + gap * (0.6 + (1 - reg.REPEATING) * 0.9);
  };

  /* score events are written in reading-time so the visual score can read
     them without ever touching the audio clock */
  Sound.prototype.pushScore = function (audioTime, reg, kind, strength) {
    var st = this.state;
    if (!st.score) st.score = [];
    var offset = audioTime - this.ctx.currentTime;
    st.score.push({ t: st.mem.t + offset, reg: reg, kind: kind, strength: strength });
    if (st.score.length > LIMITS.scoreEvents) st.score.shift();
  };

  Sound.prototype.describe = function () {
    var s = this.subject;
    if (!s) return null;
    return {
      name: s.name,
      mode: s.mode,
      condition: this.melodyState,
      pitches: s.contour.map(function (c) { return Math.round(c.f); }),
      harmonicity: +s.harmonicity.toFixed(2),
      fatigue: +s.fatigue.toFixed(2),
      register: s.register,
      missing: s.missingTones.length,
      voices: 1 + this.voiceSubjects.length,
      residues: this.residueSubjects.length,
      genealogy: this.genealogy.slice(-14)
    };
  };

  SRI.Sound = Sound;
  SRI.soundLimits = LIMITS;
  SRI.melodyTransforms = T;
  SRI.makeSubject = makeSubject;
})();
