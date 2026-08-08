/* forms.js — verbal forms
 *
 * Each form has its own rules for line length, recurrence, syntax,
 * punctuation, stanza shape and transformation. A form is not a layout
 * applied to the same sentence; it is a different way for the sentence to
 * be a sentence.
 *
 * Forms carry state across returns (refrains remember, sestinas rotate,
 * corrections need a previous version), so returning to a form is never
 * arriving at it again.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var C = SRI.corpus, G = SRI.grammar, M = C.morph;

  var tokSeq = 0;

  /* --------------------------------------------------------------- tokens */
  function tokenize(str, cls) {
    var out = [];
    var parts = String(str).match(/[^\s]+/g) || [];
    parts.forEach(function (p) {
      var m = p.match(/^(.*?)([,.;:?!—]*)$/);
      var word = m[1], punct = m[2];
      if (word) out.push({ t: word, nid: 'f' + (tokSeq++), role: 'FRAG', kind: 'word', cls: cls || '', lex: null });
      if (punct) out.push({ t: punct, nid: 'f' + (tokSeq++), role: 'PUNCT', kind: 'punct', cls: cls || '' });
    });
    return out;
  }

  function label(str) {
    return [{ t: str, nid: 'f' + (tokSeq++), role: 'LABEL', kind: 'label', cls: 'speaker' }];
  }

  /* Mark the first leaf of every phrase so that line breaks can choose to
     reveal a dependency or to hide it. */
  function markBoundaries(tree, tokens) {
    var byId = {};
    tokens.forEach(function (t) { byId[t.nid] = t; });
    G.walk(tree, function (n) {
      if (!/^(NP|PP|CL|VP|S)$/.test(n.role)) return;
      var ls = G.leaves(n);
      if (ls.length && byId[ls[0].id]) {
        byId[ls[0].id].boundary = n.role;
        byId[ls[0].id].boundaryDepth = ls.length;
      }
    });
    return tokens;
  }

  /* Build a sentence and let the memory feel it. */
  function S(ctx, frame) {
    var tree = G.makeSentence(ctx, frame);
    return register(ctx, tree);
  }

  function register(ctx, tree) {
    var toks = markBoundaries(tree, G.linearize(tree));
    if (ctx.mem) {
      var verbs = [], subj = null;
      G.leaves(tree).forEach(function (l) {
        // punctuation and determiners recur constantly and mean nothing by
        // recurring; they are not what insists
        if (/^(PUNCT|DET)$/.test(l.role)) return;
        ctx.mem.touch(l.word, l.role);
        if (l.role === 'V') verbs.push(l);
        if (l.role === 'N' && !subj) subj = l;
      });
      ctx.mem.push('clauseLength', toks.filter(function (t) { return t.kind === 'word'; }).length);
      if (subj && verbs.length) {
        ctx.mem.push('syntacticDistance', G.treeDistance(tree, subj, verbs[0]));
      } else {
        ctx.mem.push('syntacticDistance', G.depthOf(tree));
      }
      ctx.mem.rememberPhrase(G.textOf(tree), ctx.formName);
    }
    ctx.trees.push(tree);
    return { tree: tree, tokens: toks };
  }

  function line(tokens, opts) {
    opts = opts || {};
    return {
      tokens: tokens,
      indent: opts.indent || 0,
      cls: opts.cls || '',
      scale: opts.scale || 1,
      breakKind: opts.breakKind || null
    };
  }

  /* Line breaking. 'reveal' cuts where the syntax already cuts. 'conceal'
     cuts inside a phrase so the dependency has to be carried across the
     white space. 'weight' cuts after the most insistent word. */
  function breakLines(tokens, mode, target, rng) {
    target = target || 7;
    var lines = [], cur = [];
    for (var i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      var canBreak = false;
      if (cur.length >= Math.max(2, target - 3)) {
        if (mode === 'reveal') canBreak = !!tk.boundary;
        else if (mode === 'conceal') canBreak = !tk.boundary && tk.kind === 'word';
        else if (mode === 'weight') canBreak = (cur[cur.length - 1] && cur[cur.length - 1].insist > 0.4);
        else canBreak = rng ? rng.chance(0.4) : true;
      }
      if (cur.length >= target + 3) canBreak = true;
      if (canBreak && cur.length) { lines.push(line(cur, { breakKind: mode })); cur = []; }
      cur.push(tk);
    }
    if (cur.length) lines.push(line(cur, { breakKind: mode }));
    return lines;
  }

  function textOfTokens(tokens) {
    var s = '';
    tokens.forEach(function (t, i) {
      if (t.kind === 'punct') s += t.t;
      else s += (i ? ' ' : '') + t.t;
    });
    return s;
  }

  function lower(s) { return String(s).charAt(0).toLowerCase() + String(s).slice(1); }

  /* ================================================================ forms */
  var FORMS = {};

  /* free-verse lyric — breath-length lines, mixed reveal/conceal, sparse
     terminal punctuation */
  FORMS.lyric = function (ctx) {
    var out = [], n = ctx.rng.int(2, 3);
    for (var i = 0; i < n; i++) {
      var s = S(ctx);
      var mode = ctx.rng.chance(0.62) ? 'reveal' : 'conceal';
      var ls = breakLines(s.tokens, mode, ctx.rng.int(5, 8), ctx.rng);
      ls.forEach(function (l, j) {
        l.indent = j === 0 ? 0 : (mode === 'conceal' ? 1 : 0);
        out.push(l);
      });
      if (i < n - 1) out.push(line([], { cls: 'gap' }));
    }
    return { lines: out };
  };

  /* couplet — two lines, hard end-stop, the second line answers the first
     with a shorter grammar */
  FORMS.couplet = function (ctx) {
    var out = [], n = ctx.rng.int(2, 3);
    for (var i = 0; i < n; i++) {
      var a = S(ctx, ctx.rng.chance(0.5) ? 'plain' : 'fronted');
      var b = S(ctx, ctx.rng.chance(0.6) ? 'copular' : 'returnsAs');
      out.push(line(a.tokens));
      out.push(line(b.tokens, { indent: 1 }));
      if (i < n - 1) out.push(line([], { cls: 'gap' }));
    }
    return { lines: out };
  };

  FORMS.tercet = function (ctx) {
    var out = [];
    for (var i = 0; i < 2; i++) {
      var frames = ctx.rng.shuffle(['plain', 'copular', 'cleft']);
      for (var j = 0; j < 3; j++) {
        var s = S(ctx, frames[j]);
        out.push(line(s.tokens, { indent: j }));
      }
      if (i === 0) out.push(line([], { cls: 'gap' }));
    }
    return { lines: out };
  };

  /* prose poem — no line breaks of its own; the field breaks it */
  FORMS.prose = function (ctx) {
    var toks = [];
    var n = ctx.rng.int(4, 6);
    for (var i = 0; i < n; i++) {
      var s = S(ctx);
      toks = toks.concat(s.tokens);
    }
    return { lines: [line(toks, { cls: 'prose' })], prose: true };
  };

  /* litany — one head repeated, tails varying; the head is stored so it can
     return in another form later */
  FORMS.litany = function (ctx) {
    var st = ctx.state.formState;
    var head = st.litanyHead;
    if (!head || ctx.rng.chance(0.35)) {
      var e = ctx.pick('N', { tags: ['body', 'ordinary', 'signal'] });
      head = st.litanyHead = (ctx.rng.chance(0.5) ? 'Every ' : 'The same ') + e.w;
    }
    var out = [], n = ctx.rng.int(4, 7);
    for (var i = 0; i < n; i++) {
      var vp = G.VP(ctx, { objP: 0.8 });
      var wrap = G.node('S');
      G.add(wrap, vp, G.leaf('PUNCT', i === n - 1 ? '.' : ','));
      var r = register(ctx, wrap);
      out.push(line(tokenize(head).concat(r.tokens), { indent: i % 2 }));
    }
    return { lines: out, head: head };
  };

  /* dialogue between two grammatical voices: one that names, one that does */
  FORMS.dialogue = function (ctx) {
    var out = [], n = ctx.rng.int(3, 5);
    for (var i = 0; i < n; i++) {
      var naming = i % 2 === 0;
      var s = S(ctx, naming ? (ctx.rng.chance(0.5) ? 'copular' : 'cleft')
        : (ctx.rng.chance(0.5) ? 'plain' : 'imperative'));
      out.push(line(label(naming ? 'names' : 'does').concat(s.tokens), {
        indent: naming ? 0 : 1, cls: 'voice-' + (naming ? 'a' : 'b')
      }));
    }
    return { lines: out };
  };

  /* definition poem — the entry disagrees with itself */
  FORMS.definition = function (ctx) {
    var pool = C.PIVOTS.filter(function (e) { return e.claims; });
    var e = ctx.rng.weighted(pool, function (x) {
      var st = ctx.mem.stat(x.w);
      return 1 + (st ? st.insist * 2 : 0);
    });
    ctx.mem.touch(e.w, 'N');
    var out = [];
    out.push(line(tokenize(e.w), { cls: 'headword', scale: 1.8 }));
    var roles = Object.keys(e.claims);
    roles.forEach(function (r, i) {
      if (e.claims[r] === '—') return;
      out.push(line(label(r.toLowerCase() + '.').concat(tokenize(e.claims[r] + (i === roles.length - 1 ? '' : ';'))), { indent: 1 }));
    });
    var s = S(ctx, 'cleft');
    out.push(line([], { cls: 'gap' }));
    out.push(line(s.tokens, { indent: 0, cls: 'example' }));
    ctx.mem.raise('ambiguity', 0.05);
    return { lines: out, headword: e.w };
  };

  /* instruction poem — imperatives that the machine can actually carry out.
     The listed operations are the operations. */
  FORMS.instruction = function (ctx) {
    var out = [];
    var picks = ctx.rng.shuffle(C.FRAGMENTS.instruction).slice(0, ctx.rng.int(2, 3));
    picks.forEach(function (p, i) {
      out.push(line(label(String(i + 1) + '.').concat(tokenize(p)), { indent: 0 }));
    });
    var s = S(ctx, 'imperative');
    out.push(line(label(String(picks.length + 1) + '.').concat(s.tokens)));
    return { lines: out, executable: true };
  };

  /* catalogue — nouns without a verb to hold them */
  FORMS.catalogue = function (ctx) {
    var out = [];
    var head = ctx.rng.pick([
      'Things that were left in the room:',
      'Contents of the unopened parcel:',
      'What the signal passed through:',
      'Objects that did not answer:'
    ]);
    out.push(line(tokenize(head), { cls: 'headline' }));
    var n = ctx.rng.int(4, 7);
    var rows = [];
    for (var i = 0; i < n; i++) {
      var np = G.NP(ctx, { adjP: 0.45 });
      var wrap = G.node('S'); G.add(wrap, np, G.leaf('PUNCT', i === n - 1 ? '.' : ','));
      var r = register(ctx, wrap);
      rows.push(r.tokens);
      out.push(line(r.tokens, { indent: 1 }));
    }
    return { lines: out, rows: rows, tabular: true };
  };

  /* riddle — the answer is withheld and stored as residue */
  FORMS.riddle = function (ctx) {
    var e = ctx.pick('N', { pivotOnly: true });
    var out = [];
    var n = ctx.rng.int(3, 4);
    for (var i = 0; i < n; i++) {
      var s = S(ctx, ctx.rng.pick(['copular', 'plain', 'paired']));
      out.push(line(s.tokens, { indent: i % 2 }));
    }
    out.push(line(tokenize('What is it.'), { cls: 'riddle-q' }));
    ctx.mem.addResidue({ kind: 'answer', text: e.w, note: 'withheld answer' });
    return { lines: out, answer: e.w };
  };

  /* refrain poem — one line comes back, changed only by what surrounds it */
  FORMS.refrain = function (ctx) {
    var st = ctx.state.formState;
    if (!st.refrain || ctx.rng.chance(0.28)) {
      var s0 = S(ctx, ctx.rng.chance(0.5) ? 'copular' : 'returnsAs');
      st.refrain = s0.tokens;
      st.refrainText = textOfTokens(s0.tokens);
      st.refrainAge = 0;
    } else {
      st.refrainAge = (st.refrainAge || 0) + 1;
    }
    var out = [];
    var n = ctx.rng.int(2, 3);
    for (var i = 0; i < n; i++) {
      var s = S(ctx);
      out.push(line(s.tokens));
      var ref = st.refrain.map(function (t) { return cloneToken(t); });
      if (st.refrainAge > 1 && ctx.rng.chance(0.4)) ref = wearRefrain(ctx, ref);
      out.push(line(ref, { indent: 2, cls: 'refrain' }));
    }
    ctx.state.refrainReturned = true;
    return { lines: out, refrain: st.refrainText };
  };

  function cloneToken(t) {
    var c = {};
    for (var k in t) c[k] = t[k];
    c.nid = t.nid; // the same word, not a copy: the field keeps identity
    return c;
  }

  /* a refrain that has returned too often loses a word rather than gaining
     an emphasis */
  function wearRefrain(ctx, toks) {
    var idx = [];
    toks.forEach(function (t, i) { if (t.kind === 'word' && /^(the|a|an|one|this|that|still|almost)$/i.test(t.t)) idx.push(i); });
    if (!idx.length) return toks;
    var drop = ctx.rng.pick(idx);
    var removed = toks[drop];
    ctx.mem.addResidue({ kind: 'word', text: removed.t, note: 'worn from the refrain' });
    return toks.filter(function (t, i) { return i !== drop; });
  }

  /* villanelle-like recurrence: two refrains alternate and finally meet */
  FORMS.villanelle = function (ctx) {
    var st = ctx.state.formState;
    if (!st.vA) { st.vA = S(ctx, 'copular').tokens; st.vB = S(ctx, 'returnsAs').tokens; st.vTurn = 0; }
    st.vTurn++;
    var out = [];
    var first = st.vTurn % 2 === 1;
    out.push(line((first ? st.vA : st.vB).map(cloneToken), { cls: 'refrain' }));
    out.push(line(S(ctx).tokens, { indent: 1 }));
    out.push(line((first ? st.vB : st.vA).map(cloneToken), { cls: 'refrain', indent: 0 }));
    if (st.vTurn >= 4) {
      out.push(line([], { cls: 'gap' }));
      out.push(line(st.vA.map(cloneToken), { cls: 'refrain' }));
      out.push(line(st.vB.map(cloneToken), { cls: 'refrain' }));
      st.vTurn = 0;
      st.vA = null;
    }
    return { lines: out };
  };

  /* sestina-like rotation: six end words, rotated 6-1-5-2-4-3 */
  FORMS.sestina = function (ctx) {
    var st = ctx.state.formState;
    if (!st.endWords) {
      st.endWords = [];
      for (var i = 0; i < 6; i++) st.endWords.push(ctx.pick('N', { pivotOnly: i < 3 }).w);
      st.sestinaTurn = 0;
    }
    var ew = st.endWords;
    var out = [];
    for (var j = 0; j < 6; j++) {
      var vp = G.VP(ctx, { objP: 0.25 });
      var wrap = G.node('S');
      var np = G.NP(ctx, { adjP: 0.2 });
      G.add(wrap, np, vp, G.leaf('PREP', ctx.rng.pick(['toward', 'against', 'without', 'beside'])),
        G.leaf('DET', 'the'), G.leaf('N', ew[j]), G.leaf('PUNCT', j === 5 ? '.' : ','));
      var r = register(ctx, wrap);
      r.tokens[r.tokens.length - 2].cls = 'endword';
      out.push(line(r.tokens, { indent: j % 3 }));
    }
    st.endWords = [ew[5], ew[0], ew[4], ew[1], ew[3], ew[2]];
    st.sestinaTurn++;
    ctx.state.sestinaRotated = true;
    return { lines: out, endWords: st.endWords.slice() };
  };

  /* sonnet fragment — it may never reach fourteen lines and knows it */
  FORMS.sonnetFragment = function (ctx) {
    var st = ctx.state.formState;
    st.sonnetCount = st.sonnetCount || 0;
    var out = [];
    var n = ctx.rng.int(3, 5);
    for (var i = 0; i < n; i++) {
      var s = S(ctx, i === n - 1 ? 'subordinate' : ctx.rng.pick(['plain', 'copular', 'embedded']));
      out.push(line(s.tokens, { indent: st.sonnetCount + i >= 8 ? 1 : 0 }));
    }
    st.sonnetCount += n;
    if (st.sonnetCount >= 8 && !st.volta) {
      st.volta = true;
      out.push(line(tokenize('And yet.'), { cls: 'volta', indent: 2 }));
    }
    var remaining = 14 - st.sonnetCount;
    if (st.sonnetCount >= 14) { st.sonnetCount = 0; st.volta = false; }
    return { lines: out, remaining: remaining };
  };

  /* ballad stanza with unstable meter: 4 lines, alternating length, the
     meter drifts by the current fatigue */
  FORMS.ballad = function (ctx) {
    var out = [];
    var drift = ctx.mem.fatigue;
    for (var i = 0; i < 4; i++) {
      var long = i % 2 === 0;
      var target = (long ? 8 : 5) + Math.round((ctx.rng() - 0.5) * 4 * (0.4 + drift));
      var s = S(ctx, long ? 'fronted' : 'plain');
      var ls = breakLines(s.tokens, 'reveal', Math.max(3, target), ctx.rng);
      ls.forEach(function (l, k) { l.indent = long ? 0 : 1; out.push(l); });
    }
    return { lines: out };
  };

  /* dramatic monologue spoken by an object, a relation or a verb */
  FORMS.monologue = function (ctx) {
    var kind = ctx.rng.pick(['object', 'relation', 'verb']);
    var e = kind === 'object' ? ctx.pick('N', { tags: ['ordinary', 'machine'] })
      : kind === 'relation' ? ctx.pick('N', { tags: ['relation', 'measure'] })
        : ctx.pick('V');
    ctx.mem.touch(e.w, kind === 'verb' ? 'V' : 'N');
    var speaker = kind === 'verb' ? 'the verb ' + e.w : 'the ' + e.w;
    var out = [line(label(speaker + ' speaks').concat([]), { cls: 'stage' })];
    var openings = kind === 'verb' ? [
      'I am what happens when nobody is holding it.',
      'I do not need a body. I borrow one and give it back warm.',
      'When they put me in a room I become the room.'
    ] : [
      'I have been here since before the sentence needed me.',
      'Nobody has asked me what I am for. I am for this.',
      'I am spelled the same in every position and I am not the same.'
    ];
    out.push(line(tokenize(ctx.rng.pick(openings))));
    var n = ctx.rng.int(2, 3);
    for (var i = 0; i < n; i++) {
      var s = S(ctx, ctx.rng.pick(['copular', 'plain', 'paired']));
      out.push(line(s.tokens, { indent: 1 }));
    }
    out.push(line(tokenize(ctx.rng.pick(C.FRAGMENTS.tender)), { indent: 1, cls: 'quiet' }));
    return { lines: out, speaker: speaker };
  };

  /* epistolary fragment addressed to something that cannot answer */
  FORMS.epistle = function (ctx) {
    var out = [];
    out.push(line(tokenize(ctx.rng.pick(C.FRAGMENTS.address)), { cls: 'address' }));
    out.push(line([], { cls: 'gap' }));
    var n = ctx.rng.int(2, 4);
    for (var i = 0; i < n; i++) {
      var s = S(ctx, ctx.rng.pick(['plain', 'fronted', 'subordinate']));
      out.push(line(s.tokens, { indent: 1 }));
    }
    out.push(line([], { cls: 'gap' }));
    out.push(line(tokenize(ctx.rng.pick(C.FRAGMENTS.closing)), { indent: 1, cls: 'closing' }));
    ctx.mem.raise('silenceDebt', 0.06);
    return { lines: out };
  };

  /* a poem made entirely from questions */
  FORMS.questions = function (ctx) {
    var out = [];
    var n = ctx.rng.int(3, 5);
    for (var i = 0; i < n; i++) {
      if (ctx.rng.chance(0.45)) {
        out.push(line(tokenize(ctx.rng.pick(C.FRAGMENTS.question)), { indent: i % 2 }));
      } else {
        var s = S(ctx, ctx.rng.pick(['copular', 'cleft']));
        var toks = s.tokens.slice();
        var lastPunct = toks[toks.length - 1];
        if (lastPunct && lastPunct.kind === 'punct') lastPunct.t = '?';
        var q = tokenize(ctx.rng.pick(['Is it true that', 'And what if', 'Was it', 'Does'])).concat(toks);
        out.push(line(q, { indent: i % 2 }));
      }
    }
    ctx.mem.raise('ambiguity', 0.04);
    return { lines: out };
  };

  /* a poem made from corrections of its previous version */
  FORMS.corrections = function (ctx) {
    var prev = ctx.previous;
    var out = [];
    if (!prev || !prev.lines || !prev.lines.length) return FORMS.lyric(ctx);
    var src = prev.lines.filter(function (l) { return l.tokens.length > 2; });
    if (!src.length) return FORMS.lyric(ctx);
    var n = Math.min(src.length, ctx.rng.int(2, 4));
    for (var i = 0; i < n; i++) {
      var l = src[i];
      out.push(line(l.tokens.map(cloneToken), { cls: 'struck' }));
      var corrected = correctLine(ctx, l.tokens);
      out.push(line(corrected, { indent: 1, cls: 'correction' }));
    }
    out.push(line(tokenize(ctx.rng.pick(C.FRAGMENTS.correction)), { cls: 'quiet', indent: 1 }));
    return { lines: out, corrects: prev.form };
  };

  function correctLine(ctx, toks) {
    var out = toks.map(cloneToken);
    var wordIdx = [];
    out.forEach(function (t, i) { if (t.kind === 'word') wordIdx.push(i); });
    if (!wordIdx.length) return out;
    var i0 = ctx.rng.pick(wordIdx);
    var target = out[i0];
    var pool = C.BY_ROLE[target.role] || C.BY_ROLE.N;
    var repl = ctx.rng.pick(pool);
    var before = target.t;
    target.t = /^[A-Z]/.test(before) ? M.capital(repl.w) : repl.w;
    target.nid = 'f' + (tokSeq++);
    target.cls = 'changed';
    ctx.mem.addEdge(before.toLowerCase(), repl.w, 'misremembers');
    ctx.mem.addResidue({ kind: 'word', text: before, note: 'corrected away' });
    return out;
  }

  /* -------------------------------------------------- form transformation
     A poem may become another form through an intelligible operation, and
     the earlier form must leave a trace. */
  var TRANSITIONS = {
    lyric: [['refrain', 'the line that would not leave'], ['couplet', 'compression'], ['questions', 'the statement loses its nerve']],
    refrain: [['litany', 'the refrain takes over the poem'], ['villanelle', 'a second refrain answers']],
    litany: [['catalogue', 'the verbs fall away'], ['sestina', 'the ends begin to rotate']],
    definition: [['corrections', 'the entry disagrees with itself'], ['dialogue', 'the disagreement finds two mouths']],
    dialogue: [['questions', 'both voices stop asserting'], ['monologue', 'one of them leaves']],
    prose: [['couplet', 'syntactic compression'], ['lyric', 'the block admits a break']],
    couplet: [['tercet', 'a third line arrives late'], ['ballad', 'the meter becomes unstable']],
    tercet: [['villanelle', 'the tercets start remembering']],
    catalogue: [['sestina', 'the list acquires an order it will keep']],
    instruction: [['monologue', 'the instructions are being spoken by something']],
    sestina: [['refrain', 'the rotation settles on one word']],
    riddle: [['definition', 'the answer is looked up instead of guessed']],
    questions: [['corrections', 'the questions correct each other']],
    corrections: [['lyric', 'the corrected version is read as if it were first']],
    monologue: [['epistle', 'the speech is addressed to someone absent']],
    epistle: [['questions', 'the letter stops asserting']],
    sonnetFragment: [['couplet', 'only the ending survives']],
    ballad: [['litany', 'the stanza forgets its second half']],
    villanelle: [['sonnetFragment', 'the recurrence tries a different container']]
  };

  var FORM_KEYS = Object.keys(FORMS);

  /* Affinity between a verbal form and the computational form that can
     carry it. Not a menu: a pull. */
  var DISPLAY_AFFINITY = {
    lyric: { stanza: 3, tree: 1.2, score: 0.6 },
    couplet: { stanza: 2.4, tree: 1.4, table: 0.5 },
    tercet: { stanza: 2.2, tree: 1.6 },
    prose: { stanza: 2.6, plot: 0.8 },
    litany: { stanza: 2, graph: 1.4, score: 1.2 },
    dialogue: { stanza: 1.8, graph: 1.6, table: 1.2 },
    definition: { table: 2.6, stanza: 1.2, fn: 1.2 },
    instruction: { fn: 3, stanza: 1 },
    catalogue: { table: 2.6, plot: 1.6, stanza: 1 },
    riddle: { residue: 2, stanza: 1.4, graph: 1 },
    refrain: { stanza: 2, score: 1.8, plot: 1 },
    villanelle: { score: 2.2, stanza: 1.4 },
    sestina: { graph: 2.6, table: 1.4, stanza: 1 },
    sonnetFragment: { score: 2.4, stanza: 1.4 },
    ballad: { stanza: 2, score: 1.2 },
    monologue: { stanza: 2.2, tree: 1.6 },
    epistle: { stanza: 2.4, residue: 1.2 },
    questions: { stanza: 1.8, tree: 2, graph: 1 },
    corrections: { residue: 2.4, stanza: 1.4, plot: 1.2 }
  };

  /* Which form wants to happen now. Regimes pull; fatigue pushes away from
     what has just happened; a transition from the previous form is
     privileged so that the change is legible as an operation. */
  function chooseForm(ctx) {
    var reg = ctx.mem.regime;
    var prev = ctx.previous ? ctx.previous.form : null;
    var recent = ctx.mem.formHistory.slice(-5);
    var trans = prev && TRANSITIONS[prev] ? TRANSITIONS[prev] : [];
    var bias = {};
    trans.forEach(function (t, i) { bias[t[0]] = 2.6 - i * 0.5; });

    var pull = {
      lyric: 1 + reg.NAMING * 1.4,
      couplet: 0.8 + reg.RELATING * 1.0,
      tercet: 0.6 + reg.BRANCHING * 0.9,
      prose: 0.7 + reg.NAMING * 0.8 + reg.RELATING * 0.6,
      litany: 0.5 + reg.REPEATING * 2.6,
      dialogue: 0.6 + reg.RELATING * 1.8,
      definition: 0.6 + reg.NAMING * 1.8 + reg.MISREMEMBERING * 0.8,
      instruction: 0.5 + reg.RELATING * 1.2,
      catalogue: 0.5 + reg.NAMING * 1.4 + reg.REPEATING * 0.6,
      riddle: 0.4 + reg.MISREMEMBERING * 1.4,
      refrain: 0.4 + reg.RETURNING * 2.4,
      villanelle: 0.25 + reg.RETURNING * 2.0 + reg.REPEATING * 0.8,
      sestina: 0.25 + reg.RETURNING * 1.6 + reg.BRANCHING * 0.8,
      sonnetFragment: 0.4 + reg.BRANCHING * 1.4,
      ballad: 0.35 + reg.REPEATING * 1.2,
      monologue: 0.4 + reg.NAMING * 0.8 + reg.MISREMEMBERING * 1.0,
      epistle: 0.4 + reg.RELATING * 0.8 + ctx.mem.silenceDebt * 1.6,
      questions: 0.4 + reg.MISREMEMBERING * 1.6,
      corrections: 0.3 + reg.MISREMEMBERING * 2.0 + reg.RETURNING * 0.8
    };

    return ctx.rng.weighted(FORM_KEYS, function (k) {
      var w = (pull[k] || 0.3) * (1 + (bias[k] || 0));
      var seen = recent.filter(function (f) { return f === k; }).length;
      w *= Math.pow(0.32, seen);      // fatigue: not forbidden, only tired
      if (k === 'corrections' && !ctx.previous) w *= 0.05;
      return w;
    });
  }

  function build(ctx, formName) {
    formName = formName || chooseForm(ctx);
    ctx.formName = formName;
    ctx.trees = [];
    var res = FORMS[formName](ctx);
    var trace = ctx.previous ? transitionNote(ctx.previous.form, formName) : null;
    var poem = {
      form: formName,
      lines: res.lines,
      trees: ctx.trees,
      meta: res,
      trace: trace,
      t: ctx.mem.t,
      regime: ctx.mem.dominantRegime()
    };
    ctx.mem.noteForm(formName);
    return poem;
  }

  function transitionNote(from, to) {
    var list = TRANSITIONS[from] || [];
    for (var i = 0; i < list.length; i++) if (list[i][0] === to) return { from: from, to: to, via: list[i][1] };
    return { from: from, to: to, via: null };
  }

  SRI.forms = {
    FORMS: FORMS, KEYS: FORM_KEYS, TRANSITIONS: TRANSITIONS,
    DISPLAY_AFFINITY: DISPLAY_AFFINITY,
    build: build, chooseForm: chooseForm,
    tokenize: tokenize, textOfTokens: textOfTokens,
    breakLines: breakLines, register: register, line: line, cloneToken: cloneToken
  };
})();
