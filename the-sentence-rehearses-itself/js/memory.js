/* memory.js — attention, relations, fatigue, residues and decay
 *
 * repetition = the visible return of material
 * insistence = the pressure accumulated by returning
 *
 * Nothing in this file forgets at the same speed as anything else. That is
 * the whole point of the file. A word can be fatigued and still insistent;
 * a relation can outlive both words it connects; a residue can outlive the
 * sentence that discarded it.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var C = SRI.corpus;

  var LIMITS = {
    words: 240,        // word ledger entries
    edges: 90,         // relation graph edges
    residues: 40,      // discarded phrases kept
    series: 320,       // samples per plotted history
    phrases: 24        // phrase memory depth
  };

  /* Decay half-lives in seconds. Different rates, deliberately. */
  var HALF = {
    immediateAttention: 3.5,
    novelty: 40,
    ambiguity: 210,
    fatigueWord: 95,
    insistWord: 480,
    edgeWeight: 900,
    residue: 2400
  };

  function decayFactor(dt, halfLife) {
    return Math.pow(0.5, dt / halfLife);
  }

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function Memory(seedString) {
    this.seed = seedString;
    this.t = 0;
    this.startedAt = Date.now();

    /* --- the nine memories --------------------------------------------- */
    this.immediateAttention = 0;   // seconds-scale: is anyone looking
    this.phraseMemory = [];        // the current section's behaviour
    this.longTermRelations = [];   // edges, the session's accumulated syntax
    this.residues = [];            // removed material, still available
    this.fatigue = 0;              // resistance to repeating a response
    this.novelty = 1;              // difference between now and the history
    this.ambiguity = 0;            // unresolved grammatical role pressure
    this.silenceDebt = 0;          // accumulated need to withdraw sound
    this.spectralTrace = [0.4, 0.3, 0.22, 0.16, 0.12, 0.09, 0.06, 0.04];

    /* --- derived / bookkeeping ----------------------------------------- */
    this.words = Object.create(null);
    this.roleShifts = [];
    this.formHistory = [];
    this.returns = 0;              // how many times material has come back
    this.absences = [];            // tab-blur intervals: not pauses, absences
    this.lastActivity = 0;
    this.pointerSpeed = 0;
    this.readingRate = 0;

    this.series = {
      insistence: [], syntacticDistance: [], ambiguity: [],
      clauseLength: [], silenceDebt: [], returnProbability: [], novelty: []
    };

    this.regime = {
      NAMING: 1, RELATING: 0, REPEATING: 0,
      BRANCHING: 0, MISREMEMBERING: 0, RETURNING: 0
    };

    this._lastSample = 0;
  }

  Memory.prototype.stat = function (w) {
    return this.words[String(w).toLowerCase()] || null;
  };

  Memory.prototype.ensure = function (w) {
    var k = String(w).toLowerCase();
    var e = this.words[k];
    if (!e) {
      e = this.words[k] = {
        w: k, count: 0, insist: 0, fatigue: 0,
        firstSeen: this.t, lastSeen: this.t,
        roles: Object.create(null), shifts: 0, dwell: 0
      };
      this.novelty = clamp01(this.novelty + 0.05);
      this._trim();
    }
    return e;
  };

  Memory.prototype._trim = function () {
    var keys = Object.keys(this.words);
    if (keys.length <= LIMITS.words) return;
    var self = this;
    keys.sort(function (a, b) {
      var A = self.words[a], B = self.words[b];
      return (A.insist + A.count * 0.05) - (B.insist + B.count * 0.05);
    });
    var drop = keys.length - LIMITS.words;
    for (var i = 0; i < drop; i++) delete this.words[keys[i]];
  };

  /* touch: the word was used. The second use is not the same as the first. */
  Memory.prototype.touch = function (w, role) {
    var e = this.ensure(w);
    var gap = this.t - e.lastSeen;
    e.count++;
    e.lastSeen = this.t;
    if (role) e.roles[role] = (e.roles[role] || 0) + 1;
    // A quick return presses harder than a distant one, but a distant return
    // counts as a return rather than a repetition.
    if (e.count > 1) {
      if (gap < 25) { e.insist += 0.16; e.fatigue = clamp01(e.fatigue + 0.14); }
      else { e.insist += 0.26; this.returns++; e.fatigue = clamp01(e.fatigue + 0.04); }
    }
    e.insist = Math.min(4, e.insist);
    this.novelty = clamp01(this.novelty - 0.012);
    return e;
  };

  Memory.prototype.press = function (w, amount, role) {
    var e = this.ensure(w);
    e.insist = Math.min(4, e.insist + amount);
    if (role) e.roles[role] = (e.roles[role] || 0) + 0.5;
    this.fatigue = clamp01(this.fatigue + amount * 0.05);
    return e;
  };

  Memory.prototype.dwell = function (w, seconds) {
    var e = this.ensure(w);
    e.dwell += seconds;
    e.insist = Math.min(4, e.insist + seconds * 0.28);
    this.immediateAttention = clamp01(this.immediateAttention + seconds * 0.5);
    this.lastActivity = this.t;
    return e;
  };

  Memory.prototype.noteRoleShift = function (w, from, to) {
    var e = this.ensure(w);
    e.shifts++;
    e.roles[to] = (e.roles[to] || 0) + 1;
    this.roleShifts.push({ w: String(w).toLowerCase(), from: from, to: to, t: this.t });
    if (this.roleShifts.length > 60) this.roleShifts.shift();
    this.ambiguity = clamp01(this.ambiguity + 0.06);
    return e;
  };

  Memory.prototype.raise = function (key, amount) {
    if (typeof this[key] !== 'number') return;
    this[key] = clamp01(this[key] + amount);
  };

  /* ------------------------------------------------------------ relations */
  Memory.prototype.addEdge = function (a, b, kind) {
    a = String(a).toLowerCase(); b = String(b).toLowerCase();
    if (a === b) return null;
    var existing = null;
    for (var i = 0; i < this.longTermRelations.length; i++) {
      var e = this.longTermRelations[i];
      if (e.a === a && e.b === b && e.kind === kind) { existing = e; break; }
    }
    if (existing) {
      existing.weight += 0.4;
      existing.touched = this.t;
      existing.tightenings++;
      return existing;
    }
    var edge = {
      a: a, b: b, kind: kind, weight: 1,
      born: this.t, touched: this.t, tightenings: 0
    };
    this.longTermRelations.push(edge);
    this.ensure(a); this.ensure(b);
    // Both words are changed by being connected.
    this.ensure(a).insist += 0.1;
    this.ensure(b).insist += 0.1;
    this.raise('ambiguity', 0.02);
    if (this.longTermRelations.length > LIMITS.edges) {
      this.longTermRelations.sort(function (x, y) { return x.weight - y.weight; });
      var lost = this.longTermRelations.shift();
      this.addResidue({ kind: 'edge', text: lost.a + ' ' + lost.kind + ' ' + lost.b });
    }
    return edge;
  };

  Memory.prototype.edgesOf = function (w) {
    w = String(w).toLowerCase();
    return this.longTermRelations.filter(function (e) { return e.a === w || e.b === w; });
  };

  /* ------------------------------------------------------------- residues */
  /* Deleting does not destroy. It moves material into a slower memory that
     can contaminate a later form. */
  Memory.prototype.addResidue = function (obj) {
    obj.t = this.t;
    obj.strength = 1;
    obj.returns = 0;
    this.residues.push(obj);
    if (this.residues.length > LIMITS.residues) this.residues.shift();
    this.silenceDebt = clamp01(this.silenceDebt + 0.05);
    return obj;
  };

  Memory.prototype.takeResidue = function (rng) {
    if (!this.residues.length) return null;
    var self = this;
    var r = rng.weighted(this.residues, function (x) {
      // old residues are more likely to come back than fresh ones
      return x.strength * (0.4 + Math.min(3, (self.t - x.t) / 120));
    });
    r.returns++;
    r.strength *= 0.72;
    this.returns++;
    return r;
  };

  Memory.prototype.takeResidueWord = function (rng) {
    var r = this.takeResidue(rng);
    if (!r || !r.text) return null;
    var parts = String(r.text).split(/[\s,.;:]+/).filter(function (s) { return s.length > 2; });
    return parts.length ? rng.pick(parts).toLowerCase() : null;
  };

  /* --------------------------------------------------------------- phrase */
  Memory.prototype.rememberPhrase = function (text, form) {
    this.phraseMemory.push({ text: text, form: form, t: this.t });
    if (this.phraseMemory.length > LIMITS.phrases) this.phraseMemory.shift();
  };

  Memory.prototype.noteForm = function (form) {
    var prev = this.formHistory[this.formHistory.length - 1];
    var revisit = this.formHistory.indexOf(form) >= 0;
    this.formHistory.push(form);
    if (this.formHistory.length > 48) this.formHistory.shift();
    if (revisit) this.returns++;
    return { revisit: revisit, previous: prev };
  };

  /* --------------------------------------------------------------- absence */
  Memory.prototype.beginAbsence = function () {
    this._absenceStart = this.t;
  };

  Memory.prototype.endAbsence = function () {
    if (this._absenceStart == null) return null;
    var dur = this.t - this._absenceStart;
    this._absenceStart = null;
    if (dur < 0.5) return null;
    var a = { start: this.t - dur, duration: dur };
    this.absences.push(a);
    if (this.absences.length > 20) this.absences.shift();
    // An absence is not a pause: the grammar kept going and lost something.
    this.silenceDebt = clamp01(this.silenceDebt + Math.min(0.5, dur / 60));
    this.novelty = clamp01(this.novelty + Math.min(0.35, dur / 90));
    this.ambiguity = clamp01(this.ambiguity + Math.min(0.2, dur / 200));
    return a;
  };

  /* ----------------------------------------------------------- the clock */
  Memory.prototype.tick = function (dt) {
    this.t += dt;

    this.immediateAttention *= decayFactor(dt, HALF.immediateAttention);
    this.novelty = clamp01(this.novelty * decayFactor(dt, HALF.novelty) + 0.004 * dt);
    this.ambiguity *= decayFactor(dt, HALF.ambiguity);
    this.fatigue *= decayFactor(dt, HALF.fatigueWord);

    var idle = this.t - this.lastActivity;
    if (idle > 6) this.silenceDebt = clamp01(this.silenceDebt + dt * 0.012);
    else this.silenceDebt = clamp01(this.silenceDebt - dt * 0.03);

    var fw = decayFactor(dt, HALF.fatigueWord);
    var iw = decayFactor(dt, HALF.insistWord);
    for (var k in this.words) {
      var e = this.words[k];
      e.fatigue *= fw;
      e.insist *= iw;
    }

    var ew = decayFactor(dt, HALF.edgeWeight);
    for (var i = this.longTermRelations.length - 1; i >= 0; i--) {
      var edge = this.longTermRelations[i];
      edge.weight *= ew;
      if (edge.weight < 0.06) {
        this.addResidue({ kind: 'edge', text: edge.a + ' ' + edge.kind + ' ' + edge.b });
        this.longTermRelations.splice(i, 1);
      }
    }

    var rw = decayFactor(dt, HALF.residue);
    for (var j = this.residues.length - 1; j >= 0; j--) {
      this.residues[j].strength *= rw;
      if (this.residues[j].strength < 0.02) this.residues.splice(j, 1);
    }

    this.updateRegime();
    this.updateSpectralTrace(dt);
    if (this.t - this._lastSample > 1.2) { this.sample(); this._lastSample = this.t; }
  };

  /* Regimes are behaviours, not pages. Several coexist; they are normalised
     weights that bias frames, forms, layout and music. */
  Memory.prototype.updateRegime = function () {
    var totalInsist = 0, n = 0, maxInsist = 0, shifted = 0;
    for (var k in this.words) {
      var e = this.words[k];
      totalInsist += e.insist; n++;
      if (e.insist > maxInsist) maxInsist = e.insist;
      if (e.shifts) shifted++;
    }
    var meanInsist = n ? totalInsist / n : 0;
    var age = Math.min(1, this.t / 420);
    var edges = this.longTermRelations.length;

    var r = {
      NAMING: 0.75 * this.novelty + 0.25 * (1 - age),
      RELATING: 0.15 + Math.min(1, edges / 14) * 0.9,
      REPEATING: Math.min(1.2, meanInsist * 1.5 + this.fatigue * 0.5),
      BRANCHING: 0.1 + Math.min(1, this.avgSeries('syntacticDistance') / 6) + this.immediateAttention * 0.25,
      MISREMEMBERING: this.ambiguity * 1.4 + Math.min(0.6, shifted / 8),
      RETURNING: Math.min(1.3, this.returns / 12) + Math.min(0.5, this.residues.length / 20) + age * 0.3
    };
    var sum = 0, key;
    for (key in r) { r[key] = Math.max(0.02, r[key]); sum += r[key]; }
    for (key in r) this.regime[key] = r[key] / sum;
    return this.regime;
  };

  Memory.prototype.dominantRegime = function () {
    var best = 'NAMING', v = -1;
    for (var k in this.regime) if (this.regime[k] > v) { v = this.regime[k]; best = k; }
    return best;
  };

  /* The spectral trace is a timbral fingerprint of the reading. Eight bands.
     It is read by sound.js and by the relational colour. */
  Memory.prototype.updateSpectralTrace = function (dt) {
    var target = [];
    var reg = this.regime;
    var harm = 1 - this.ambiguity * 0.8;
    for (var i = 0; i < 8; i++) {
      var base = Math.pow(0.72, i);
      var tilt = 1 + reg.BRANCHING * (i / 7) * 1.6 - reg.REPEATING * (i / 7) * 0.9;
      var rough = 1 + Math.sin(i * 1.7 + this.t * 0.03) * this.ambiguity * 0.5;
      target.push(Math.max(0.01, base * tilt * rough * harm));
    }
    var mx = Math.max.apply(null, target);
    var k = Math.min(1, dt / 8);
    for (var j = 0; j < 8; j++) {
      this.spectralTrace[j] += ((target[j] / mx) - this.spectralTrace[j]) * k;
    }
  };

  /* -------------------------------------------------------- plotted history
     These series are not decoration. sample() writes them; the generator and
     the sound organism read them back. See returnProbability below: it is
     literally the probability used when the grammar decides to bring
     something back. */
  Memory.prototype.sample = function () {
    var totalInsist = 0, n = 0;
    for (var k in this.words) { totalInsist += this.words[k].insist; n++; }
    var meanInsist = n ? totalInsist / n : 0;
    this.push('insistence', meanInsist);
    this.push('ambiguity', this.ambiguity);
    this.push('silenceDebt', this.silenceDebt);
    this.push('novelty', this.novelty);
    this.push('returnProbability', this.returnProbability());
  };

  Memory.prototype.push = function (name, v) {
    var s = this.series[name];
    if (!s) s = this.series[name] = [];
    s.push({ t: this.t, v: v });
    if (s.length > LIMITS.series) s.shift();
  };

  Memory.prototype.avgSeries = function (name, lastN) {
    var s = this.series[name];
    if (!s || !s.length) return 0;
    var from = lastN ? Math.max(0, s.length - lastN) : 0;
    var sum = 0, c = 0;
    for (var i = from; i < s.length; i++) { sum += s[i].v; c++; }
    return c ? sum / c : 0;
  };

  Memory.prototype.slopeSeries = function (name) {
    var s = this.series[name];
    if (!s || s.length < 4) return 0;
    var a = s[Math.max(0, s.length - 12)], b = s[s.length - 1];
    var dt = b.t - a.t;
    return dt > 0 ? (b.v - a.v) / dt : 0;
  };

  /* The changing probability that a word returns. Read by grammar decisions
     in main.js, plotted by diagrams.js. Same number, both places. */
  Memory.prototype.returnProbability = function () {
    var r = this.regime;
    var p = 0.12
      + r.RETURNING * 0.55
      + r.REPEATING * 0.3
      + Math.min(0.2, this.residues.length / 60)
      - this.novelty * 0.18
      - this.fatigue * 0.12;
    // the plotted history feeds back: a rising insistence curve makes
    // returning more likely than a flat one
    p += Math.max(-0.1, Math.min(0.18, this.slopeSeries('insistence') * 6));
    return clamp01(p);
  };

  /* Words ranked by accumulated pressure. Used by the field, the table,
     the graph and the melody's register decisions. */
  var CLOSED = /^(the|a|an|one|this|that|these|those|every|each|no|is|is not|and|but|or|so|to|of|in|it|as|not|was never|becomes|stays|is almost|is still)$/;

  Memory.prototype.insistent = function (limit) {
    var arr = [];
    for (var k in this.words) {
      if (CLOSED.test(k) || k.length < 3) continue;
      arr.push(this.words[k]);
    }
    arr.sort(function (a, b) { return b.insist - a.insist; });
    return arr.slice(0, limit || 12);
  };

  Memory.prototype.ambiguousWords = function () {
    var arr = [];
    for (var k in this.words) {
      var e = this.words[k];
      if (CLOSED.test(k) || k.length < 3) continue;
      if (Object.keys(e.roles).length > 1) arr.push(e);
    }
    arr.sort(function (a, b) { return Object.keys(b.roles).length - Object.keys(a.roles).length; });
    return arr;
  };

  Memory.prototype.snapshot = function () {
    return {
      t: Math.round(this.t),
      regime: this.dominantRegime(),
      insistence: +this.avgSeries('insistence', 8).toFixed(3),
      ambiguity: +this.ambiguity.toFixed(3),
      novelty: +this.novelty.toFixed(3),
      silenceDebt: +this.silenceDebt.toFixed(3),
      returns: this.returns,
      edges: this.longTermRelations.length,
      residues: this.residues.length,
      words: Object.keys(this.words).length
    };
  };

  SRI.Memory = Memory;
  SRI.memoryLimits = LIMITS;
  SRI.memoryHalfLives = HALF;
})();
