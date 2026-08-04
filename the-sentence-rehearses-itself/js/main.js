/* main.js — lifecycle and shared state
 *
 * Three clocks, deliberately unequal:
 *   the render clock  (requestAnimationFrame) moves things that are already
 *                     decided. It never decides anything and never schedules
 *                     a sound.
 *   the memory clock  (250 ms) decays.
 *   the grammar clock (variable, seconds) decides.
 * Audio keeps its own clock inside sound.js.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var G = SRI.grammar, F = SRI.forms, C = SRI.corpus;

  var DISPLAY_MODES = ['stanza', 'tree', 'graph', 'table', 'fn', 'plot', 'score', 'residue'];

  var state = SRI.state = {
    seed: null, seedHash: 0, rng: null, layoutRng: null,
    mem: null, field: null, sound: null, reader: null,
    poem: null, previous: null,
    formState: {},
    tableColumns: ['word', 'claims to be', 'is used as', 'insistence', 'returns', 'disagreement'],
    plotSeries: ['insistence', 'ambiguity', 'returnProbability'],
    score: [], scoreSpan: 26,
    relationColor: '#4b4be0',
    pendingCauses: [], pendingIntent: null,
    lastOperation: null,
    audioOn: false, reduced: false,
    transformations: [],
    running: true
  };

  var dom = {};
  var rafId = null, memTimer = null, grammarTimer = null, ledgerTimer = null;
  var lastFrame = 0;

  /* ------------------------------------------------------------------ seed */
  function readSeed() {
    var m = location.hash.match(/seed=([A-Za-z0-9_-]{1,32})/);
    if (m) return m[1];
    var q = new URLSearchParams(location.search).get('seed');
    if (q) return q.slice(0, 32);
    return newSeed();
  }

  function newSeed() {
    var a = 'abcdefghijkmnopqrstuvwxyz23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    dom.field = document.getElementById('field');
    dom.text = document.getElementById('text-layer');
    dom.svg = document.getElementById('structure-layer');
    dom.canvas = document.getElementById('trace-layer');
    dom.ledger = document.getElementById('ledger');
    dom.status = document.getElementById('status');
    dom.seedOut = document.getElementById('seed-value');
    dom.audioBtn = document.getElementById('audio-toggle');
    dom.live = document.getElementById('live');
    dom.regime = document.getElementById('regime');

    state.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    state.announce = function (msg) {
      if (dom.live) dom.live.textContent = msg;
    };
    state.onResize = function () {
      state.field.resize();
      state.mem.raise('ambiguity', 0.02);
      // resizing recalculates the syntax spatially
      state.field.pendingLayout = true;
    };
    state.onAbsenceStart = function () { document.body.classList.add('is-absent'); };
    state.onAbsenceEnd = function (a) {
      document.body.classList.remove('is-absent');
      state.announce('You were away ' + Math.round(a.duration) + ' seconds. The grammar continued.');
      state.pendingCauses.push({ kind: 'revisit', t: state.mem.t });
      // an absence is not a pause: something was lost while nobody read it
      var lost = state.mem.phraseMemory[Math.floor(Math.random() * state.mem.phraseMemory.length)];
      if (lost) state.mem.addResidue({ kind: 'phrase', text: lost.text, note: 'said while you were away' });
      advance(true);
    };
    state.onToggleAudio = toggleAudio;
    state.onReset = function () { setSeed(state.seed, true); };
    state.onPrint = function () { SRI.print && SRI.print.make(state); };

    document.getElementById('reset').addEventListener('click', function () { setSeed(state.seed, true); });
    document.getElementById('reseed').addEventListener('click', function () { setSeed(newSeed(), true); });
    dom.audioBtn.addEventListener('click', toggleAudio);
    document.getElementById('print').addEventListener('click', function () { SRI.print && SRI.print.make(state); });

    setSeed(readSeed(), true);
    startLoops();
  }

  function setSeed(seed, hard) {
    state.seed = seed;
    state.seedHash = G.hashSeed(seed);
    state.rng = G.makeRNG(seed);
    state.layoutRng = G.makeRNG(seed + ':layout');
    state.formState = {};
    state.transformations = [];
    state.score = [];
    state.previous = null;
    state.lastOperation = null;
    state.pendingCauses = [];
    state.selfSentenceDone = false;
    state.mem = new SRI.Memory(seed);

    if (hard && state.field) state.field.destroy();
    if (!state.field) {
      state.field = new SRI.Field({ text: dom.text, svg: dom.svg, canvas: dom.canvas, state: state });
    } else {
      state.field.resize();
    }
    state.field.reduced = state.reduced;

    if (state.reader) state.reader.detach();
    state.reader = new SRI.Reader(state, state.field).attach(dom.field);

    if (state.sound) { state.sound.destroy(); state.sound = null; state.audioOn = false; }
    state.sound = new SRI.Sound(state);
    state.sound.init();
    updateAudioButton();

    if (dom.seedOut) dom.seedOut.textContent = seed;
    try { history.replaceState(null, '', '#seed=' + seed); } catch (e) { }

    // the opening: one short English sentence, the same for the same seed
    var ctx = makeCtx();
    var opening = G.openingSentence(ctx);
    state.opening = G.textOf(opening);
    var reg = F.register(ctx, opening);
    var poem = {
      form: 'lyric', lines: [F.line(reg.tokens)], trees: [opening],
      meta: {}, trace: null, t: 0, regime: 'NAMING'
    };
    state.poem = poem;
    state.field.setMode('stanza');
    state.field.setPoem(poem);
    updateColor();
    state.announce('A reading begins. Seed ' + seed + '.');
    scheduleGrammar(6.5);
  }

  function makeCtx() {
    var ctx = {
      rng: state.rng, mem: state.mem, state: state,
      previous: state.previous, trees: []
    };
    ctx.pick = G.chooser(ctx);
    return ctx;
  }

  /* ------------------------------------------------------------------ loops */
  function startLoops() {
    lastFrame = performance.now();
    if (!rafId) rafId = requestAnimationFrame(frame);
    if (!memTimer) memTimer = setInterval(function () { state.mem.tick(0.25); tickSlow(); }, 250);
    if (!ledgerTimer) ledgerTimer = setInterval(updateLedger, 1900);
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = Math.min(0.06, (now - lastFrame) / 1000);
    lastFrame = now;
    if (document.hidden) return;          // no visual work while unread
    state.field.render(dt);
  }

  function tickSlow() {
    updateColor();
    // the instructions belong to the beginning of the reading, not to all
    // of it: they recede once the reader has done anything at all
    if (!document.body.classList.contains('colophon-dim') &&
      (state.mem.t > 80 || state.mem.longTermRelations.length || state.mem.residues.length ||
        state.mem.immediateAttention > 0.25)) {
      document.body.classList.add('colophon-dim');
      state.field.pendingLayout = true;
    }
    if (dom.regime) {
      var r = state.mem.regime;
      var top = Object.keys(r).sort(function (a, b) { return r[b] - r[a]; }).slice(0, 2);
      dom.regime.textContent = top[0].toLowerCase() + ' · ' + top[1].toLowerCase();
    }
    // the score keeps its own window open even when nothing is sounding
    var cutoff = state.mem.t - state.scoreSpan * 1.4;
    while (state.score.length && state.score[0].t < cutoff) state.score.shift();
    if (state.field.mode === 'score') state.field.pendingLayout = true;
  }

  /* One relational colour, changing. Hue follows the spectral identity and
     the dominant regime; chroma follows accumulated insistence. */
  function updateColor() {
    var mem = state.mem;
    var base = (state.seedHash % 360);
    var reg = mem.regime;
    var drift = reg.RETURNING * 70 - reg.NAMING * 40 + reg.MISREMEMBERING * 55 + mem.ambiguity * 30;
    var hue = (base + drift + mem.t * 0.35) % 360;
    var sat = 42 + Math.min(38, mem.avgSeries('insistence', 10) * 40);
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var lig = dark ? 62 : 42;
    state.relationColor = 'hsl(' + hue.toFixed(1) + ' ' + sat.toFixed(0) + '% ' + lig + '%)';
    var st = document.documentElement.style;
    st.setProperty('--rel', state.relationColor);
    st.setProperty('--rel-soft', 'hsl(' + hue.toFixed(1) + ' ' + (sat * 0.7).toFixed(0) + '% ' + (lig + 18) + '%)');
    // the ink version of the relational colour: insistence must darken a word,
    // never bleach it
    st.setProperty('--rel-ink', 'hsl(' + hue.toFixed(1) + ' ' + Math.min(80, sat + 14).toFixed(0) + '% ' +
      (dark ? 78 : 24) + '%)');
  }

  /* ------------------------------------------------------------- the grammar
     Variable interval. The piece is allowed to stay still. */
  function scheduleGrammar(seconds) {
    clearTimeout(grammarTimer);
    grammarTimer = setTimeout(function () { advance(false); }, Math.max(1200, seconds * 1000));
  }

  function nextInterval() {
    var mem = state.mem;
    var base = 9.5;
    base *= 1 + mem.silenceDebt * 1.9;          // when sound withdraws, so does change
    base *= 1 - Math.min(0.45, mem.immediateAttention * 0.5);
    base *= state.reduced ? 1.5 : 1;
    if (state.rng.chance(0.16)) base *= state.rng.range(1.8, 3.4);   // stillness
    return base * state.rng.range(0.75, 1.35);
  }

  function advance(forced) {
    if (!state.running) return;
    var mem = state.mem;
    var rng = state.rng;

    var intent = state.pendingIntent;
    state.pendingIntent = null;

    var did = false;
    if (intent) did = actOnIntent(intent);

    if (!did) {
      var p = mem.returnProbability();          // the plotted history decides
      var roll = rng();
      if (roll < 0.26 + mem.regime.MISREMEMBERING * 0.3) did = applyOperation();
      else if (roll < 0.26 + p * 0.45) did = returnToSomething();
      if (!did) did = newPoem();
    }

    chooseDisplay();
    maybeSelfSentence();
    scheduleGrammar(forced ? 4 : nextInterval());
  }

  /* An action of the reader becomes a grammatical event, later. */
  function actOnIntent(intent) {
    var ctx = makeCtx();
    if (intent.kind === 'roleShift' || intent.kind === 'node') {
      var tree = pickTree();
      if (!tree) return false;
      var target = null;
      if (intent.id && state.field.byId[intent.id]) {
        target = G.findNode(tree, intent.id);
      }
      var res = G.ops.roleShift(ctx, tree, target);
      if (!res.word) { var alt = G.ops.nounToAction(ctx, tree); res.note = alt.note; }
      showOperation('roleShift', tree, res);
      record('roleShift', res.note);
      return true;
    }
    if (intent.kind === 'connect') {
      // adding an edge produces a third phrase
      var toks = F.tokenize(intent.phrase);
      var poem = {
        form: 'relation', lines: [F.line(toks)], trees: [], meta: {},
        trace: { from: state.poem ? state.poem.form : null, to: 'relation', via: 'two words were connected' },
        t: state.mem.t, regime: state.mem.dominantRegime()
      };
      commitPoem(poem);
      state.field.setMode('graph');
      record('relation', intent.a + ' ' + intent.relation + ' ' + intent.b);
      return true;
    }
    if (intent.kind === 'reorder') {
      // a reordered column changes what the grammar is willing to say
      var t2 = pickTree();
      if (t2) {
        var r2 = intent.column === 'is used as' ? G.ops.nounToAction(ctx, t2)
          : intent.column === 'insistence' ? G.ops.repeat(ctx, t2, 2)
            : intent.column === 'returns' ? G.ops.misremember(ctx, t2)
              : G.ops.name(ctx, t2);
        showOperation(intent.column === 'is used as' ? 'nounToAction'
          : intent.column === 'insistence' ? 'repeat'
            : intent.column === 'returns' ? 'misremember' : 'name', t2, r2);
        record('table', 'column ' + intent.column + ' → ' + r2.note);
        return true;
      }
    }
    if (intent.kind === 'press') {
      var t3 = pickTree();
      if (t3) {
        var r3 = G.ops.repeat(ctx, t3, 2);
        showOperation('repeat', t3, r3);
        record('insistence', intent.word + ': ' + r3.note);
        return true;
      }
    }
    if (intent.kind === 'residue') {
      state.field.setMode('residue');
      return false;
    }
    return false;
  }

  function pickTree() {
    if (!state.poem || !state.poem.trees || !state.poem.trees.length) return null;
    var best = null, bd = -1;
    state.poem.trees.forEach(function (t) {
      var d = G.leaves(t).length;
      if (d > bd) { bd = d; best = t; }
    });
    return best;
  }

  /* An operation is performed and shown as what it is. */
  function applyOperation() {
    var tree = pickTree();
    if (!tree) return false;
    var ctx = makeCtx();
    var reg = state.mem.regime;
    var names = ['remember', 'repeat', 'name', 'give', 'misremember', 'roleShift',
      'promoteClause', 'dropReferent', 'adjectiveToDiagram', 'verbToPlace', 'nounToAction'];
    var w = {
      remember: 0.6 + reg.RETURNING * 1.4,
      repeat: 0.5 + reg.REPEATING * 2.0,
      name: 0.5 + reg.NAMING * 1.8,
      give: 0.4 + reg.RELATING * 1.6,
      misremember: 0.4 + reg.MISREMEMBERING * 2.2,
      roleShift: 0.6 + reg.MISREMEMBERING * 1.4 + reg.BRANCHING * 0.8,
      promoteClause: 0.35 + reg.BRANCHING * 2.2,
      dropReferent: 0.3 + reg.MISREMEMBERING * 1.2,
      adjectiveToDiagram: 0.25 + reg.BRANCHING * 1.0,
      verbToPlace: 0.3 + reg.RELATING * 1.2,
      nounToAction: 0.35 + reg.RELATING * 1.0
    };
    var name = state.rng.weighted(names, function (k) { return w[k]; });
    var res = G.ops[name](ctx, tree);
    showOperation(name, tree, res);
    record(name, res.note);

    if (name === 'adjectiveToDiagram' && res.adjective) {
      document.body.dataset.figure = res.adjective;
      state.announce('The whole figure is ' + res.adjective + '.');
    }
    if (name === 'repeat') state.pendingCauses.push({ kind: 'repeat', t: state.mem.t });
    if (name === 'misremember' || name === 'name') state.pendingCauses.push({ kind: 'ambiguity', t: state.mem.t });
    if (name === 'promoteClause') state.pendingCauses.push({ kind: 'diagram', t: state.mem.t });
    return true;
  }

  function showOperation(name, before, res) {
    var meta = G.opPoems[name] || { sig: name + '(x)', gloss: 'a change' };
    var inTokens = state.poemTokens || G.linearize(before);
    var outTree = res.tree || before;
    var outTokens = G.linearize(outTree);
    if (res.gift) outTokens = outTokens.concat(G.linearize(res.gift));

    state.lastOperation = {
      name: name, sig: meta.sig, gloss: meta.gloss,
      inTokens: inTokens, outTokens: outTokens, note: res.note, t: state.mem.t
    };

    var poem = {
      form: 'operation', operation: name,
      lines: [F.line(inTokens, { cls: 'argument' }), F.line(outTokens, { cls: 'result' })],
      trees: [outTree], meta: {}, t: state.mem.t,
      trace: { from: state.poem ? state.poem.form : null, to: 'operation', via: meta.sig },
      regime: state.mem.dominantRegime()
    };
    commitPoem(poem);
    // the function form pulls hard, but not always
    if (state.rng.chance(0.55)) state.field.setMode('fn');
  }

  /* Returning is not repeating: the material comes back into a different
     state, and its return is recorded as a return. */
  function returnToSomething() {
    var mem = state.mem, rng = state.rng;
    var res = mem.takeResidue(rng);
    if (res && res.text && res.text.length > 2) {
      var ctx = makeCtx();
      var toks = F.tokenize(res.text);
      var tail = F.build(ctx, rng.chance(0.5) ? 'refrain' : 'lyric');
      tail.lines.unshift(F.line(toks, { cls: 'returned' }));
      tail.trace = { from: state.poem ? state.poem.form : null, to: tail.form, via: 'something set aside came back' };
      commitPoem(tail);
      record('return', '"' + res.text + '" returned after ' + Math.round(mem.t - res.t) + 's');
      state.pendingCauses.push({ kind: 'residue', t: mem.t });
      state.field.setMode(rng.chance(0.4) ? 'residue' : 'stanza');
      return true;
    }
    var prev = mem.formHistory.slice(0, -1);
    if (prev.length && rng.chance(0.6)) {
      var form = rng.pick(prev);
      var ctx2 = makeCtx();
      var poem = F.build(ctx2, form);
      poem.trace = { from: state.poem ? state.poem.form : null, to: form, via: 'the form is visited again and is not the same' };
      commitPoem(poem);
      record('revisit', form + ' returns changed');
      state.pendingCauses.push({ kind: 'revisit', t: mem.t });
      return true;
    }
    return false;
  }

  function newPoem() {
    var ctx = makeCtx();
    var poem = F.build(ctx);
    commitPoem(poem);
    if (poem.form === 'refrain' || poem.form === 'villanelle') {
      state.pendingCauses.push({ kind: 'refrain', t: state.mem.t });
    }
    if (state.previous && state.previous.form !== poem.form) {
      state.pendingCauses.push({ kind: 'abandon', what: state.previous.form, t: state.mem.t });
    }
    record('form', poem.form + (poem.trace && poem.trace.via ? ' — ' + poem.trace.via : ''));
    return true;
  }

  function commitPoem(poem) {
    state.previous = state.poem;
    state.poem = poem;
    state.poemTokens = [];
    poem.lines.forEach(function (l) { state.poemTokens = state.poemTokens.concat(l.tokens); });
    state.field.setPoem(poem);
    // pressure carried by memory becomes visible weight on the word
    state.field.words.forEach(function (wd) {
      var st = state.mem.stat(wd.t);
      if (st) wd.insist = Math.max(wd.insist, st.insist);
    });
  }

  function record(kind, note) {
    state.transformations.push({ t: Math.round(state.mem.t), kind: kind, note: note });
    if (state.transformations.length > 200) state.transformations.shift();
  }

  /* Which computational form the poem stands in. Affinity plus regime plus a
     resistance to changing too often. */
  function chooseDisplay() {
    var f = state.field;
    if (f.modeAge < 1 && state.rng.chance(0.55)) { f.modeAge++; return; }
    var aff = F.DISPLAY_AFFINITY[state.poem.form] || { stanza: 2 };
    var reg = state.mem.regime;
    var mem = state.mem;
    // a diagram is only offered when there is something for it to be made
    // of. An empty graph is not a poem about emptiness, it is a bug.
    var amb = mem.ambiguousWords().length;
    var pull = {
      stanza: 1.6,
      tree: (state.poem.trees && state.poem.trees.length) ? 0.3 + reg.BRANCHING * 2.2 : 0,
      graph: mem.longTermRelations.length >= 3
        ? 0.2 + reg.RELATING * 2.4 + Math.min(1, mem.longTermRelations.length / 8) : 0,
      table: amb >= 2 ? 0.2 + reg.MISREMEMBERING * 1.6 + Math.min(1, amb / 5) : 0,
      fn: state.lastOperation ? 0.5 + reg.MISREMEMBERING * 0.8 : 0,
      plot: mem.series.insistence.length > 10 ? 0.15 + Math.min(1.6, mem.t / 200) : 0,
      score: 0.15 + (state.audioOn ? 1.2 : 0.4) + reg.RETURNING * 0.8,
      residue: mem.residues.length >= 3 ? 0.1 + Math.min(1.8, mem.residues.length / 6) : 0
    };
    var mode = state.rng.weighted(DISPLAY_MODES, function (m) {
      var v = (pull[m] || 0.2) * (1 + (aff[m] || 0));
      if (m === f.mode) v *= 0.35;
      return v;
    });
    if (state.field.setMode(mode)) {
      if (mode !== 'stanza') state.pendingCauses.push({ kind: 'diagram', t: mem.t });
      document.body.dataset.mode = mode;
    }
  }

  /* After sufficient transformation the system may briefly produce a
     compact sentence about its own reading. It is convincing for a moment
     and then becomes material again. */
  function maybeSelfSentence() {
    var mem = state.mem;
    if (state.selfSentenceDone && mem.t - state.selfSentenceDone < 260) return;
    if (mem.t < 180 || state.transformations.length < 14) return;
    if (!state.rng.chance(0.22)) return;

    var top = mem.insistent(3).map(function (s) { return s.w; });
    var shifted = mem.roleShifts.length ? mem.roleShifts[mem.roleShifts.length - 1] : null;
    var text;
    if (shifted) {
      text = 'This reading has been ' + (top[0] || 'a hand') + ' ' + Math.round(mem.t / 60) +
        ' minutes long, and ' + shifted.w + ' has stopped being ' + SRI.roleName(shifted.from) + '.';
    } else {
      text = 'So far this is a reading about ' + (top[0] || 'distance') +
        ', and about how long ' + (top[1] || 'it') + ' can be held.';
    }
    var toks = F.tokenize(text);
    var poem = {
      form: 'self', lines: [F.line(toks, { cls: 'self' })], trees: [], meta: {},
      trace: { from: state.poem.form, to: 'self', via: 'the sentence describes its own reading' },
      t: mem.t, regime: mem.dominantRegime()
    };
    commitPoem(poem);
    state.field.setMode('stanza');
    document.body.classList.add('is-self');
    state.selfSentenceDone = mem.t;
    record('self', text);
    setTimeout(function () { document.body.classList.remove('is-self'); }, 9000);
  }

  /* ---------------------------------------------------------------- ledger
     Microtext as evidence, not interface. What the machine has noticed. */
  function updateLedger() {
    if (!dom.ledger || document.hidden) return;
    var mem = state.mem;
    var rows = [];
    mem.insistent(4).forEach(function (s) {
      if (s.count < 2 && s.insist < 0.2) return;
      var roles = Object.keys(s.roles);
      rows.push(s.w + '  ×' + s.count + (roles.length > 1 ? '  ' + roles.join('→') : '') +
        '  ' + s.insist.toFixed(2));
    });
    var last = state.transformations.slice(-3).reverse();
    last.forEach(function (tr) { rows.push(tr.t + 's  ' + tr.kind + (tr.note ? '  ' + tr.note : '')); });
    if (mem.residues.length) rows.push(mem.residues.length + ' set aside, still here');
    if (state.sound && state.audioOn) {
      var d = state.sound.describe();
      if (d) rows.push('subject ' + d.name + '  ' + d.condition + (d.missing ? '  −' + d.missing : ''));
    }
    dom.ledger.textContent = rows.join('\n');
  }

  /* ----------------------------------------------------------------- audio */
  function toggleAudio() {
    if (!state.sound.available()) {
      state.announce('This browser has no Web Audio. The reading continues in silence.');
      return;
    }
    if (state.audioOn) {
      state.sound.stop();
      state.audioOn = false;
      state.announce('Sound stopped.');
    } else {
      state.sound.start();
      state.audioOn = true;
      state.announce('Sound started. It will not follow the text exactly.');
    }
    updateAudioButton();
  }

  function updateAudioButton() {
    if (!dom.audioBtn) return;
    dom.audioBtn.textContent = state.audioOn ? 'stop sound' : 'start sound';
    dom.audioBtn.setAttribute('aria-pressed', state.audioOn ? 'true' : 'false');
  }

  /* ---------------------------------------------------------------- cleanup */
  window.addEventListener('pagehide', function () {
    state.running = false;
    if (rafId) cancelAnimationFrame(rafId);
    clearInterval(memTimer); clearInterval(ledgerTimer); clearTimeout(grammarTimer);
    if (state.sound) state.sound.destroy();
    if (state.reader) state.reader.detach();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  SRI.advance = advance;
})();
