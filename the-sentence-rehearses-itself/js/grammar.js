/* grammar.js — seeded sentence generation and transformation
 *
 * A sentence here is not a string. It is a tree of nodes with roles.
 * Strings are produced by linearising the tree, so any change to the tree
 * is a change to the language. The operations at the bottom of this file
 * (remember, repeat, name, give, misremember, returnAs, roleShift,
 * promoteClause, dropReferent, nounToAction, verbToPlace) are the same
 * functions the work displays as "executable function" poems. They are
 * real. The display reads the generator; the generator does not read the
 * display.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var C = SRI.corpus;
  var M = C.morph;

  /* ------------------------------------------------------------------ rng */
  function hashSeed(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  function makeRNG(seedStr) {
    var h = hashSeed(String(seedStr));
    var r = sfc32(h, h ^ 0x9e3779b9, (h << 7) | 0, (h >>> 3) | 0);
    for (var i = 0; i < 12; i++) r();
    r.seedString = String(seedStr);
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.range = function (a, b) { return a + r() * (b - a); };
    r.int = function (a, b) { return Math.floor(a + r() * (b - a + 1)); };
    r.chance = function (p) { return r() < p; };
    r.weighted = function (items, weightFn) {
      var tot = 0, i, ws = [];
      for (i = 0; i < items.length; i++) { var v = Math.max(0.0001, weightFn(items[i], i)); ws.push(v); tot += v; }
      var x = r() * tot;
      for (i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; }
      return items[items.length - 1];
    };
    r.shuffle = function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(r() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    };
    return r;
  }

  /* ---------------------------------------------------------------- nodes */
  var nid = 0;
  function node(role, opts) {
    var n = {
      id: 'n' + (nid++),
      role: role,
      word: null,
      lex: null,
      children: [],
      parent: null,
      born: 0,
      insist: 0,
      history: [],
      detached: false
    };
    if (opts) for (var k in opts) n[k] = opts[k];
    return n;
  }

  function add(parent) {
    for (var i = 1; i < arguments.length; i++) {
      var c = arguments[i];
      if (!c) continue;
      c.parent = parent;
      parent.children.push(c);
    }
    return parent;
  }

  function leaf(role, word, lex) {
    return node(role, { word: word, lex: lex || null });
  }

  function leaves(root, out) {
    out = out || [];
    if (root.word !== null && root.word !== undefined) out.push(root);
    for (var i = 0; i < root.children.length; i++) leaves(root.children[i], out);
    return out;
  }

  function walk(root, fn, depth) {
    depth = depth || 0;
    fn(root, depth);
    for (var i = 0; i < root.children.length; i++) walk(root.children[i], fn, depth + 1);
  }

  function findNode(root, id) {
    var found = null;
    walk(root, function (n) { if (n.id === id) found = n; });
    return found;
  }

  function depthOf(root) {
    var d = 0;
    walk(root, function (n, dep) { if (dep > d) d = dep; });
    return d;
  }

  function pathTo(root, target) {
    var path = null;
    (function rec(n, acc) {
      var a = acc.concat([n]);
      if (n === target) { path = a; return; }
      for (var i = 0; i < n.children.length; i++) rec(n.children[i], a);
    })(root, []);
    return path;
  }

  function treeDistance(root, a, b) {
    var pa = pathTo(root, a), pb = pathTo(root, b);
    if (!pa || !pb) return 99;
    var i = 0;
    while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++;
    return (pa.length - i) + (pb.length - i);
  }

  function cloneTree(root, parent) {
    var c = node(root.role, {
      word: root.word, lex: root.lex, born: root.born,
      insist: root.insist, history: root.history.slice(), detached: root.detached
    });
    c.origin = root.id;
    c.parent = parent || null;
    c.children = root.children.map(function (k) { return cloneTree(k, c); });
    return c;
  }

  /* Tokens are what the visual field consumes. One token = one word that can
     be looked at, dragged, connected, deleted, sung about or forgotten. */
  function linearize(root) {
    return leaves(root).map(function (n) {
      return {
        t: n.word,
        nid: n.id,
        role: n.role,
        lex: n.lex ? n.lex.w : null,
        insist: n.insist,
        kind: /^(PUNCT)$/.test(n.role) ? 'punct' : 'word'
      };
    });
  }

  function textOf(root) {
    var s = '';
    linearize(root).forEach(function (t, i) {
      if (t.kind === 'punct') s += t.t;
      else s += (i ? ' ' : '') + t.t;
    });
    return s.replace(/\s+([,.;:?!])/g, '$1');
  }

  /* --------------------------------------------------------- word choice */
  /* Selection is never uniform. It reads memory: what has insisted, what is
     fatigued, what has never been said, what the regime is pulling toward. */

  function chooser(ctx) {
    var rng = ctx.rng, mem = ctx.mem;
    return function pick(role, opts) {
      opts = opts || {};
      var pool = C.BY_ROLE[role] || [];
      if (opts.tags) {
        var tagged = pool.filter(function (e) {
          return opts.tags.some(function (t) { return e.tags.indexOf(t) >= 0; });
        });
        if (tagged.length > 2) pool = tagged;
      }
      if (opts.pivotOnly) {
        var pv = pool.filter(function (e) { return e.pivot; });
        if (pv.length) pool = pv;
      }
      if (opts.exclude && opts.exclude.length) {
        var ex = pool.filter(function (e) { return opts.exclude.indexOf(e.w) < 0; });
        if (ex.length > 3) pool = ex;
      }
      if (!pool.length) pool = C.BY_ROLE.N;
      var reg = mem ? mem.regime : null;
      return rng.weighted(pool, function (e) {
        var s = e.roles[role] || 0.2;
        var st = mem ? mem.stat(e.w) : null;
        if (st) {
          // returning pressure: insistence attracts when the regime returns
          s *= 1 + (st.insist * 2.2 * (reg ? (reg.RETURNING + reg.REPEATING) : 0.3));
          // fatigue pushes away, but never to zero: nothing is forbidden
          s *= Math.max(0.12, 1 - st.fatigue * 0.85);
        } else if (reg) {
          s *= 1 + reg.NAMING * 1.4; // the unnamed is attractive while naming
        }
        if (e.pivot && reg) s *= 1 + (reg.MISREMEMBERING + reg.BRANCHING) * 1.1;
        if (opts.weight) s *= opts.weight(e);
        return s;
      });
    };
  }

  /* ---------------------------------------------------------------- frames
     Each frame builds a tree. Frames are chosen by regime, not by cycle. */

  function NP(ctx, opts) {
    opts = opts || {};
    var rng = ctx.rng, pick = ctx.pick;
    var np = node('NP');
    var e = opts.lex || pick('N', opts);
    var det = opts.det === false ? null
      : rng.chance(0.16) ? null
        : leaf('DET', opts.detWord || pickDet(ctx, e));
    var adj = null;
    if (rng.chance(opts.adjP === undefined ? 0.3 : opts.adjP)) {
      var a = pick('ADJ', { tags: e.tags });
      adj = leaf('ADJ', a.w, a);
    }
    var head = leaf('N', e.w, e);
    add(np, det, adj, head);
    np.head = head;
    return np;
  }

  function pickDet(ctx, e) {
    var rng = ctx.rng, mem = ctx.mem;
    var st = mem ? mem.stat(e.w) : null;
    if (st && st.count > 1 && rng.chance(0.55)) return 'the';   // known things definite
    if (st && st.count > 3 && rng.chance(0.4)) return 'that';
    return rng.weighted(['a', 'the', 'one', 'this', 'every', 'no'],
      function (d) {
        return d === 'a' ? 3 : d === 'the' ? 3 : d === 'one' ? 1.4 : d === 'this' ? 1 : 0.5;
      })
      .replace(/^a$/, M.article(e.w) === 'an' ? 'an' : 'a');
  }

  function VP(ctx, opts) {
    opts = opts || {};
    var rng = ctx.rng, pick = ctx.pick;
    var vp = node('VP');
    var e = opts.lex || pick('V', opts);
    var v = leaf('V', e.v || M.third(e.w), e);
    v.base = e.w;
    var hes = rng.chance(0.18) ? leaf('HES', pick('HES').w) : null;
    add(vp, hes, v);
    if (opts.obj !== false && rng.chance(opts.objP === undefined ? 0.72 : opts.objP)) {
      add(vp, NP(ctx, { tags: opts.objTags }));
    }
    vp.head = v;
    return vp;
  }

  function PP(ctx, opts) {
    opts = opts || {};
    var pick = ctx.pick;
    var pp = node('PP');
    var p = pick('PREP');
    add(pp, leaf('PREP', p.w, p), NP(ctx, opts));
    return pp;
  }

  function period(s) { return leaf('PUNCT', s === undefined ? '.' : s); }

  var FRAMES = {
    /* A hand repeats the distance. */
    plain: function (ctx) {
      var s = node('S');
      add(s, NP(ctx, { tags: ['body', 'ordinary', 'creature'] }), VP(ctx), period());
      return s;
    },
    /* The distance is not second. */
    copular: function (ctx) {
      var s = node('S');
      var cop = ctx.rng.pick(C.COPULA);
      var comp = ctx.rng.chance(0.5)
        ? leaf('ADJ', ctx.pick('ADJ').w)
        : NP(ctx, { adjP: 0.15 });
      add(s, NP(ctx, { tags: ['relation', 'measure', 'signal'] }), leaf('COP', cop), comp, period());
      return s;
    },
    /* Second is what the window does. */
    cleft: function (ctx) {
      var s = node('S');
      var subj = ctx.pick('N', { pivotOnly: true });
      var cl = node('CL');
      add(cl, leaf('DEIC', 'what'), NP(ctx, { tags: ['ordinary', 'surface'] }), leaf('V', 'does'));
      add(s, leaf('N', subj.w, subj), leaf('COP', 'is'), cl, period());
      return s;
    },
    /* A window returns as a verb. */
    returnsAs: function (ctx) {
      var s = node('S');
      var e = ctx.pick('N', { pivotOnly: true });
      var vp = node('VP');
      add(vp, leaf('V', 'returns'), leaf('PREP', 'as'),
        NP(ctx, { tags: ['language'], adjP: 0.1 }));
      add(s, NP(ctx, { lex: e }), vp, period());
      return s;
    },
    /* Inside the box, the answer waits. */
    fronted: function (ctx) {
      var s = node('S');
      add(s, PP(ctx, { tags: ['ordinary', 'body'] }), leaf('PUNCT', ','),
        NP(ctx, { tags: ['signal', 'quiet'] }), VP(ctx, { objP: 0.35 }), period());
      return s;
    },
    /* Because the room repeats, the hand is second. */
    subordinate: function (ctx) {
      var s = node('S');
      var cl = node('CL');
      add(cl, leaf('CONJ', ctx.rng.pick(C.SUBORD)), NP(ctx), VP(ctx, { objP: 0.3 }));
      add(s, cl, leaf('PUNCT', ','), NP(ctx), VP(ctx, { objP: 0.5 }), period());
      s.subordinate = cl;
      return s;
    },
    /* The hand, which is not the distance, holds still. */
    embedded: function (ctx) {
      var s = node('S');
      var np = NP(ctx, { tags: ['body', 'ordinary'] });
      var cl = node('CL');
      add(cl, leaf('CONJ', 'which'), leaf('COP', ctx.rng.chance(0.6) ? 'is not' : 'is almost'),
        NP(ctx, { tags: ['relation', 'measure'] }));
      add(s, np, leaf('PUNCT', ','), cl, leaf('PUNCT', ','), VP(ctx, { objP: 0.35 }), period());
      s.subordinate = cl;
      return s;
    },
    /* Hold the cup until the cup is a duration. */
    imperative: function (ctx) {
      var s = node('S');
      var e = ctx.pick('V');
      var vp = node('VP');
      add(vp, leaf('V', e.w, e), NP(ctx));
      var cl = node('CL');
      add(cl, leaf('CONJ', ctx.rng.pick(['until', 'while', 'before', 'because'])),
        NP(ctx), leaf('COP', 'is'), NP(ctx, { tags: ['measure', 'relation'], adjP: 0.1 }));
      add(s, vp, cl, period());
      s.subordinate = cl;
      return s;
    },
    /* And the distance and the distance and the window. */
    accumulative: function (ctx) {
      var s = node('S');
      var n = ctx.rng.int(2, 4);
      for (var i = 0; i < n; i++) {
        if (i) add(s, leaf('CONJ', 'and'));
        add(s, NP(ctx, { adjP: 0.12 }));
      }
      add(s, period());
      return s;
    },
    /* One waits. The other is not answering. */
    paired: function (ctx) {
      var s = node('S');
      add(s, leaf('DEIC', 'one'), VP(ctx, { objP: 0.15 }), leaf('PUNCT', '.'),
        leaf('DEIC', 'the other'), leaf('COP', 'is not'), leaf('V', M.gerund(ctx.pick('V').w)), period());
      return s;
    }
  };

  var FRAME_KEYS = Object.keys(FRAMES);

  function frameWeights(reg) {
    return {
      plain: 1 + reg.NAMING * 2.2,
      copular: 1 + reg.NAMING * 1.2 + reg.RELATING * 1.4,
      cleft: 0.7 + reg.MISREMEMBERING * 2.0,
      returnsAs: 0.5 + reg.RETURNING * 3.0,
      fronted: 0.7 + reg.RELATING * 1.6,
      subordinate: 0.6 + reg.BRANCHING * 2.4,
      embedded: 0.4 + reg.BRANCHING * 2.0 + reg.MISREMEMBERING * 0.8,
      imperative: 0.5 + reg.RELATING * 1.0,
      accumulative: 0.4 + reg.REPEATING * 2.8,
      paired: 0.5 + reg.RELATING * 1.2 + reg.MISREMEMBERING * 0.7
    };
  }

  function makeSentence(ctx, forceFrame) {
    var reg = ctx.mem ? ctx.mem.regime : { NAMING: 1, RELATING: 0, REPEATING: 0, BRANCHING: 0, MISREMEMBERING: 0, RETURNING: 0 };
    var wts = frameWeights(reg);
    var key = forceFrame || ctx.rng.weighted(FRAME_KEYS, function (k) { return wts[k] || 0.3; });
    var t = FRAMES[key](ctx);
    t.frame = key;
    t.born = ctx.mem ? ctx.mem.t : 0;
    // capitalise the first spoken word
    var ls = leaves(t);
    for (var i = 0; i < ls.length; i++) {
      if (ls[i].role !== 'PUNCT') { ls[i].word = M.capital(ls[i].word); break; }
    }
    return t;
  }

  /* The opening. Deliberately short and grammatically flat: the whole piece
     is what happens to it. Same seed, same first sentence. */
  function openingSentence(ctx) {
    var subj = ctx.pick('N', { tags: ['body'] });
    var verb = ctx.pick('V', { tags: ['quiet', 'transform'] });
    var obj = ctx.pick('N', { tags: ['relation', 'measure'] });
    var s = node('S');
    var np1 = node('NP');
    add(np1, leaf('DET', M.capital(M.article(subj.w))), leaf('N', subj.w, subj));
    var vp = node('VP');
    var np2 = node('NP'); add(np2, leaf('DET', 'the'), leaf('N', obj.w, obj));
    add(vp, leaf('V', verb.v || M.third(verb.w), verb), np2);
    add(s, np1, vp, period());
    s.frame = 'plain';
    s.isOpening = true;
    return s;
  }

  /* ----------------------------------------------------------- operations
     These are displayed as function poems. They must be true. */

  var OPS = {
    /* remember(x) → x returns with one relation missing */
    remember: function (ctx, tree) {
      var t = cloneTree(tree);
      var candidates = [];
      walk(t, function (n) {
        if (n.parent && n.children.length === 0 && /^(DET|ADJ|HES|PREP)$/.test(n.role)) candidates.push(n);
      });
      if (!candidates.length) {
        walk(t, function (n) { if (n.parent && n.role === 'PP') candidates.push(n); });
      }
      var victim = candidates.length ? ctx.rng.pick(candidates) : null;
      var lost = null;
      if (victim) {
        lost = leaves(victim).map(function (l) { return l.word; }).join(' ');
        var ix = victim.parent.children.indexOf(victim);
        victim.parent.children.splice(ix, 1);
      }
      t.history = (tree.history || []).concat(['remember']);
      return { tree: t, lost: lost, note: lost ? 'one relation missing: ' + lost : 'nothing left to lose' };
    },

    /* repeat(x, n) → x accumulates pressure, not copies */
    repeat: function (ctx, tree, n) {
      n = n || 1;
      var pressed = [];
      leaves(tree).forEach(function (l) {
        if (l.role === 'PUNCT') return;
        l.insist = (l.insist || 0) + n * 0.34;
        if (ctx.mem) ctx.mem.press(l.word, n * 0.34, l.role);
        pressed.push(l.word);
      });
      tree.history = (tree.history || []).concat(['repeat×' + n]);
      return { tree: tree, note: 'pressure ' + (n * 0.34).toFixed(2) + ' on ' + pressed.length + ' words; no copy made' };
    },

    /* name(x) → x becomes less identifiable */
    name: function (ctx, tree) {
      var ns = leaves(tree).filter(function (l) { return l.role === 'N' || l.role === 'DEIC'; });
      if (!ns.length) return { tree: tree, note: 'nothing answers to a name' };
      var target = ctx.rng.weighted(ns, function (l) { return 1 + (l.insist || 0) * 2; });
      var before = target.word;
      var stages = ['the one that was ' + before.toLowerCase(), 'the one', 'one', 'it'];
      target.nameStage = Math.min(stages.length - 1, (target.nameStage || -1) + 1);
      target.word = stages[target.nameStage];
      target.role = target.nameStage >= 1 ? 'DEIC' : target.role;
      if (ctx.mem) ctx.mem.raise('ambiguity', 0.09);
      tree.history = (tree.history || []).concat(['name']);
      return { tree: tree, note: before + ' → ' + target.word, before: before, after: target.word };
    },

    /* give(x, y) → the distance between x and y becomes the gift */
    give: function (ctx, tree, a, b) {
      var ls = leaves(tree).filter(function (l) { return l.role !== 'PUNCT'; });
      if (ls.length < 2) return { tree: tree, note: 'nothing to give across' };
      a = a || ls[0];
      b = b || ls[ls.length - 1];
      var d = treeDistance(tree, a, b);
      var gift = node('NP');
      add(gift, leaf('DET', 'the'), leaf('N', 'distance'),
        leaf('PREP', 'between'), leaf('N', a.word.toLowerCase()),
        leaf('CONJ', 'and'), leaf('N', b.word.toLowerCase()));
      gift.giftDistance = d;
      if (ctx.mem) ctx.mem.addEdge(a.word.toLowerCase(), b.word.toLowerCase(), 'inherits');
      tree.history = (tree.history || []).concat(['give']);
      return {
        tree: tree, gift: gift, distance: d,
        note: 'distance ' + d + ' delivered instead of ' + a.word.toLowerCase()
      };
    },

    /* misremember(x) → a word is replaced by something that shares a tag
       with it, or by a residue that has been waiting */
    misremember: function (ctx, tree) {
      var ls = leaves(tree).filter(function (l) { return l.lex && l.role !== 'PUNCT'; });
      if (!ls.length) return { tree: tree, note: 'nothing misremembered' };
      var target = ctx.rng.pick(ls);
      var before = target.word;
      var res = ctx.mem && ctx.mem.takeResidueWord(ctx.rng);
      var repl;
      if (res && ctx.rng.chance(0.45)) {
        repl = res;
      } else {
        var tag = ctx.rng.pick(target.lex.tags.length ? target.lex.tags : ['ordinary']);
        var pool = (C.BY_TAG[tag] || []).filter(function (e) {
          return e.w !== target.lex.w && e.roles[target.role];
        });
        repl = pool.length ? ctx.rng.pick(pool).w : target.lex.w;
      }
      target.word = /^[A-Z]/.test(before) ? M.capital(repl) : repl;
      if (ctx.mem) {
        ctx.mem.addEdge(before.toLowerCase(), repl.toLowerCase(), 'misremembers');
        ctx.mem.raise('ambiguity', 0.05);
      }
      tree.history = (tree.history || []).concat(['misremember']);
      return { tree: tree, before: before, after: target.word, note: before + ' ⇢ ' + target.word };
    },

    /* roleShift(x) → same spelling, different function.
       a noun may become an action; a verb may become a place. */
    roleShift: function (ctx, tree, target) {
      var ls = leaves(tree).filter(function (l) {
        return l.lex && l.lex.pivot && /^(N|V|ADJ|DEIC)$/.test(l.role);
      });
      if (!ls.length) return { tree: tree, note: 'no word is willing to change function' };
      target = target || ctx.rng.weighted(ls, function (l) { return 1 + (l.insist || 0) * 3; });
      var e = target.lex;
      var roles = Object.keys(e.roles).filter(function (r) { return r !== target.role; });
      if (!roles.length) return { tree: tree, note: e.w + ' has only one function' };
      var to = ctx.rng.pick(roles);
      var from = target.role;
      target.role = to;
      if (to === 'V') target.word = e.v || M.third(e.w);
      else target.word = e.w;
      if (/^[A-Z]/.test(e.w) === false && target.parent && target.parent.children[0] === target && tree.children[0] === target.parent) {
        target.word = M.capital(target.word);
      }
      target.history.push(from + '→' + to);
      if (ctx.mem) {
        ctx.mem.noteRoleShift(e.w, from, to);
        ctx.mem.raise('ambiguity', 0.07);
      }
      tree.history = (tree.history || []).concat(['roleShift']);
      return { tree: tree, word: e.w, from: from, to: to, note: e.w + ': ' + from + ' → ' + to };
    },

    /* a subordinate clause may become the root of its own tree */
    promoteClause: function (ctx, tree) {
      var cls = [];
      walk(tree, function (n) { if (n.role === 'CL' && n.parent) cls.push(n); });
      if (!cls.length) return { tree: tree, note: 'no clause is ready to be a root' };
      var cl = ctx.rng.pick(cls);
      var ix = cl.parent.children.indexOf(cl);
      cl.parent.children.splice(ix, 1);
      var root = node('S');
      root.frame = 'promoted';
      cl.children = cl.children.filter(function (c) { return c.role !== 'CONJ'; });
      cl.children.forEach(function (c) { c.parent = root; root.children.push(c); });
      add(root, period());
      var l0 = leaves(root)[0];
      if (l0) l0.word = M.capital(l0.word);
      root.history = ['promoted from ' + (tree.frame || 'a sentence')];
      return { tree: root, host: tree, note: 'a clause became a root' };
    },

    /* a pronoun may lose its referent */
    dropReferent: function (ctx, tree) {
      var ds = leaves(tree).filter(function (l) { return l.role === 'DEIC'; });
      var target;
      if (!ds.length) {
        var ns = leaves(tree).filter(function (l) { return l.role === 'N'; });
        if (!ns.length) return { tree: tree, note: 'nothing points' };
        target = ctx.rng.pick(ns);
        target.referentOf = target.word;
        target.word = 'it';
        target.role = 'DEIC';
      } else {
        target = ctx.rng.pick(ds);
      }
      target.unbound = true;
      if (ctx.mem) ctx.mem.raise('ambiguity', 0.11);
      tree.history = (tree.history || []).concat(['dropReferent']);
      return { tree: tree, note: '"' + target.word + '" no longer points anywhere' };
    },

    /* an adjective may attach itself to an entire diagram */
    adjectiveToDiagram: function (ctx, tree) {
      var as = leaves(tree).filter(function (l) { return l.role === 'ADJ'; });
      if (!as.length) return { tree: tree, note: 'nothing is describable at that scale' };
      var a = ctx.rng.pick(as);
      var ix = a.parent.children.indexOf(a);
      a.parent.children.splice(ix, 1);
      a.detached = true;
      tree.history = (tree.history || []).concat(['adjectiveToDiagram']);
      return { tree: tree, adjective: a.word, note: 'the whole figure is now ' + a.word };
    },

    /* a verb may become a place */
    verbToPlace: function (ctx, tree) {
      var vs = leaves(tree).filter(function (l) { return l.role === 'V'; });
      if (!vs.length) return { tree: tree, note: 'no action is standing still enough' };
      var v = ctx.rng.pick(vs);
      var base = v.base || (v.lex && v.lex.w) || v.word;
      v.role = 'N';
      v.word = M.gerund(base);
      var pp = node('PP');
      var slot = v.parent.children.indexOf(v);
      v.parent.children.splice(slot, 1);
      add(pp, leaf('PREP', ctx.rng.pick(['inside', 'beside', 'under', 'toward'])), leaf('DET', 'the'), v);
      pp.parent = v.parent;
      v.parent.children.splice(slot, 0, pp);
      tree.history = (tree.history || []).concat(['verbToPlace']);
      return { tree: tree, note: base + ' is now somewhere you can stand' };
    },

    /* a noun may become an action */
    nounToAction: function (ctx, tree) {
      var ns = leaves(tree).filter(function (l) { return l.role === 'N' && l.lex && (l.lex.roles.V || l.lex.pivot); });
      if (!ns.length) return { tree: tree, note: 'every thing is content to be a thing' };
      var n = ctx.rng.pick(ns);
      var before = n.word;
      n.role = 'V';
      n.word = n.lex.v || M.third(n.lex.w);
      if (n.parent) {
        n.parent.children = n.parent.children.filter(function (c) { return c === n || c.role !== 'DET'; });
      }
      if (ctx.mem) ctx.mem.noteRoleShift(n.lex.w, 'N', 'V');
      tree.history = (tree.history || []).concat(['nounToAction']);
      return { tree: tree, note: before + ' is doing it now' };
    }
  };

  /* Descriptions used by the function-poem form. The body text is written
     for the reader; the code above is written for the machine; they are the
     same operation. */
  var OP_POEMS = {
    remember: { sig: 'remember(x)', gloss: 'x returns with one relation missing' },
    repeat: { sig: 'repeat(x, n)', gloss: 'x accumulates pressure, not copies' },
    name: { sig: 'name(x)', gloss: 'x becomes less identifiable' },
    give: { sig: 'give(x, y)', gloss: 'the distance between x and y becomes the gift' },
    misremember: { sig: 'misremember(x)', gloss: 'x is replaced by what shares a tag with it' },
    roleShift: { sig: 'returnAs(x, role)', gloss: 'the spelling survives; the function does not' },
    promoteClause: { sig: 'promote(clause)', gloss: 'the dependent becomes the root' },
    dropReferent: { sig: 'unbind(pronoun)', gloss: 'the pointing continues without a target' },
    adjectiveToDiagram: { sig: 'scale(adjective)', gloss: 'the modifier attaches to the whole figure' },
    verbToPlace: { sig: 'place(verb)', gloss: 'an action becomes somewhere to stand' },
    nounToAction: { sig: 'act(noun)', gloss: 'a thing begins doing what it is' }
  };

  SRI.grammar = {
    makeRNG: makeRNG,
    hashSeed: hashSeed,
    node: node, add: add, leaf: leaf, leaves: leaves, walk: walk,
    findNode: findNode, cloneTree: cloneTree, depthOf: depthOf,
    treeDistance: treeDistance, pathTo: pathTo,
    linearize: linearize, textOf: textOf,
    chooser: chooser,
    NP: NP, VP: VP, PP: PP,
    FRAMES: FRAMES, makeSentence: makeSentence, openingSentence: openingSentence,
    ops: OPS, opPoems: OP_POEMS
  };
})();
