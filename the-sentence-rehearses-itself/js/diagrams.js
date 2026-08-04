/* diagrams.js — the field: stanza, tree, graph, function, plot, table,
 * score, residue.
 *
 * There is only one set of words. A diagram is not a picture of the poem;
 * it is the poem standing in a different arrangement. The same DOM element
 * that was a word in a line becomes a leaf of a parse tree, a node of a
 * relation graph, a cell in a table, an event in a score. Identity is kept
 * by token id, so a word that returns is the same word returning.
 *
 * SVG carries structure (branches, edges, brackets, staves).
 * Canvas carries history (traces of what has already been here).
 * DOM carries language.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var G = SRI.grammar, C = SRI.corpus;

  var LIMITS = { words: 130, edges: 46, traceAlpha: 0.06, nodes: 60, marksPerLayout: 14 };
  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function Field(opts) {
    this.textLayer = opts.text;
    this.svg = opts.svg;
    this.canvas = opts.canvas;
    this.ctx2d = this.canvas.getContext('2d');
    this.state = opts.state;
    this.words = [];               // live Word objects
    this.byId = Object.create(null);
    this.mode = 'stanza';
    this.modeAge = 0;
    this.w = 0; this.h = 0;
    this.dpr = 1;
    this.svgGroups = {};
    this.marks = [];               // canvas trace queue
    this.reduced = false;
    this.focusId = null;
    this.pendingLayout = true;
    this.overlayText = [];
    this._svgTick = 0;
    this.buildSVG();
    this.resize();
  }

  Field.prototype.buildSVG = function () {
    var g = this.svgGroups;
    ['structure', 'edges', 'brackets', 'axis', 'marks'].forEach(function (name) {
      g[name] = el('g', { 'class': 'g-' + name }, this.svg);
    }, this);
  };

  Field.prototype.resize = function () {
    var r = this.textLayer.getBoundingClientRect();
    this.w = Math.max(320, r.width);
    this.h = Math.max(320, r.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx2d.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.svg.setAttribute('viewBox', '0 0 ' + this.w + ' ' + this.h);
    this.narrow = this.w < 720;
    this.pendingLayout = true;
  };

  /* ------------------------------------------------------------- reconcile
     New poem arrives. Words already on stage keep their element and their
     accumulated pressure. Words no longer present begin to leave; they are
     not deleted at once, and their leaving is drawn. */
  Field.prototype.setPoem = function (poem) {
    var self = this;
    this.poem = poem;
    var seen = Object.create(null);
    var order = 0;

    poem.lines.forEach(function (ln, li) {
      ln.tokens.forEach(function (tk) {
        seen[tk.nid] = true;
        var wd = self.byId[tk.nid];
        if (!wd) {
          wd = self.makeWord(tk);
          self.words.push(wd);
          self.byId[tk.nid] = wd;
        } else {
          wd.returns++;
          wd.leaving = false;
          wd.el.classList.add('is-returning');
          wd.t = tk.t;
          if (wd.el.textContent !== tk.t) {
            // an operation has rewritten this word: it is the same word, so
            // it keeps its element and its pressure, but it is not the same
            // width any more
            wd.el.textContent = tk.t;
            wd.el.setAttribute('aria-label', tk.t + ', ' + roleName(tk.role));
            wd.w = wd.el.offsetWidth;
            wd.h = wd.el.offsetHeight;
          }
        }
        wd.line = li;
        wd.order = order++;
        wd.indent = ln.indent;
        wd.lineCls = ln.cls;
        wd.tokenCls = tk.cls || '';
        wd.role = tk.role;
        wd.kind = tk.kind;
        wd.boundary = tk.boundary || null;
        wd.present = true;
      });
    });

    this.words.forEach(function (wd) {
      if (!seen[wd.id]) {
        wd.present = false;
        if (!wd.leaving) { wd.leaving = true; wd.leaveAt = performance.now(); }
      }
    });

    this.trim();
    this.pendingLayout = true;
  };

  Field.prototype.makeWord = function (tk) {
    var span = document.createElement('span');
    span.className = 'w w--' + (tk.kind || 'word') + (tk.cls ? ' ' + tk.cls : '');
    span.textContent = tk.t;
    span.dataset.nid = tk.nid;
    span.dataset.role = tk.role || '';
    if (tk.kind === 'word') {
      span.tabIndex = 0;
      span.setAttribute('role', 'button');
      span.setAttribute('aria-label', tk.t + ', ' + roleName(tk.role));
    }
    this.textLayer.appendChild(span);
    var wd = {
      id: tk.nid, t: tk.t, el: span, role: tk.role, kind: tk.kind,
      x: this.w * 0.5 + (Math.random() - 0.5) * 40,
      y: this.h * 0.5 + (Math.random() - 0.5) * 40,
      tx: 0, ty: 0, w: 0, h: 0,
      opacity: 0, targetOpacity: 1, scale: 1, targetScale: 1,
      insist: 0, returns: 0, present: true, leaving: false,
      born: performance.now(), lex: tk.lex, dwell: 0, rot: 0, targetRot: 0
    };
    wd.w = span.offsetWidth;
    wd.h = span.offsetHeight;
    return wd;
  };

  function roleName(r) {
    return ({
      N: 'noun', V: 'verb', ADJ: 'adjective', ADV: 'adverb', DET: 'determiner',
      DEIC: 'deictic', PREP: 'preposition', CONJ: 'conjunction', COP: 'copula',
      HES: 'hesitation', PUNCT: 'punctuation', FRAG: 'word', LABEL: 'label'
    })[r] || 'word';
  }

  Field.prototype.trim = function () {
    if (this.words.length <= LIMITS.words) return;
    var gone = [];
    this.words.sort(function (a, b) {
      return (a.present ? 1 : 0) - (b.present ? 1 : 0) || a.insist - b.insist;
    });
    while (this.words.length > LIMITS.words) {
      var wd = this.words.shift();
      if (wd.present) { this.words.push(wd); break; }
      gone.push(wd);
    }
    var self = this;
    gone.forEach(function (wd) {
      self.mark(wd.x, wd.y, wd.w, 'erase');
      if (wd.el.parentNode) wd.el.parentNode.removeChild(wd.el);
      delete self.byId[wd.id];
    });
    this.words.sort(function (a, b) { return a.order - b.order; });
  };

  Field.prototype.remove = function (id) {
    var wd = this.byId[id];
    if (!wd) return null;
    this.mark(wd.x, wd.y, wd.w, 'erase');
    if (wd.el.parentNode) wd.el.parentNode.removeChild(wd.el);
    delete this.byId[id];
    var i = this.words.indexOf(wd);
    if (i >= 0) this.words.splice(i, 1);
    return wd;
  };

  /* ---------------------------------------------------------------- layout */

  /* The words the current poem is actually made of. A figure that cannot
     find its insistent words falls back to these, because a diagram with no
     language in it is a chart, and this piece does not make charts. */
  Field.prototype.contentWords = function (limit) {
    var out = this.words.filter(function (wd) {
      return wd.present && wd.kind === 'word' && !/^(PUNCT|DET|LABEL)$/.test(wd.role);
    });
    out.sort(function (a, b) { return (b.insist - a.insist) || (a.order - b.order); });
    return out.slice(0, limit || 6);
  };

  Field.prototype.setMode = function (mode) {
    if (mode === this.mode) { this.modeAge++; return false; }
    this.previousMode = this.mode;
    this.mode = mode;
    this.modeAge = 0;
    this.pendingLayout = true;
    return true;
  };

  /* Words that the current arrangement has no place for are not deleted and
     not left where they were. They are parked in a margin as evidence, and
     the margin has a bottom: anything past it is genuinely out of the
     figure and shows as nothing. */
  Field.prototype.park = function (words, p) {
    var self = this;
    if (this.narrow) {
      /* On a narrow screen there is no margin to put a margin in. The
         evidence goes to a band beneath the figure and most of it is simply
         not shown: the phone reading has less peripheral memory than the
         desktop reading, and that is a difference in the work, not a defect
         in the layout. */
      var bandTop = this.h - p.b - 34;
      var x = p.l, row = 0;
      words.forEach(function (wd) {
        var wdw = wd.w * 0.6 + 8;
        if (row > 1) { wd.targetOpacity = 0; wd.targetScale = 0.5; return; }
        if (x + wdw > self.w - p.r) { row++; x = p.l; }
        if (row > 1) { wd.targetOpacity = 0; wd.targetScale = 0.5; return; }
        wd.tx = x;
        wd.ty = bandTop + row * 15;
        wd.targetOpacity = wd.present ? 0.24 : 0;
        wd.targetScale = 0.58;
        wd.targetRot = 0;
        x += wdw;
      });
      return;
    }
    var col = this.w - p.r * 0.62;
    var top = p.t + 10;
    var rowH = 15;
    var maxRows = Math.max(4, Math.floor((this.h - p.b - 84 - top) / rowH));
    var i = 0;
    words.forEach(function (wd) {
      if (i >= maxRows) { wd.targetOpacity = 0; wd.targetScale = 0.5; return; }
      wd.tx = col - wd.w * 0.6;
      wd.ty = top + i * rowH;
      wd.targetOpacity = wd.present ? 0.26 : 0;
      wd.targetScale = 0.6;
      wd.targetRot = 0;
      i++;
    });
  };

  Field.prototype.layout = function () {
    this.pendingLayout = false;
    this.clearSVG();
    this.overlayText = [];
    // the plot is drawn on canvas; when the poem stops being a plot the
    // drawing has to stop being there too
    if (this.plotGeom && this.mode !== 'plot') {
      this.ctx2d.clearRect(this.plotGeom.x0 - 12, this.plotGeom.y0 - 34,
        this.plotGeom.x1 - this.plotGeom.x0 + 30, this.plotGeom.y1 - this.plotGeom.y0 + 60);
      this.plotGeom = null;
    }
    var m = this.mode;
    if (m === 'tree') this.layoutTree();
    else if (m === 'graph') this.layoutGraph();
    else if (m === 'table') this.layoutTable();
    else if (m === 'fn') this.layoutFunction();
    else if (m === 'plot') this.layoutPlot();
    else if (m === 'score') this.layoutScore();
    else if (m === 'residue') this.layoutResidue();
    else this.layoutStanza();
    this.placeOverlayText();
    this.traceDeparture();
  };

  /* One burst of traces per rearrangement, drawn where the words were
     standing before this figure asked them to be somewhere else. This is the
     only thing the canvas is for: it is not a texture, it is the record of
     positions the poem has already occupied. */
  Field.prototype.traceDeparture = function () {
    var moved = [];
    this.words.forEach(function (wd) {
      var d = Math.hypot(wd.tx - wd.x, wd.ty - wd.y);
      // only words that have accumulated pressure leave a trace: the canvas
      // records insistence, not traffic
      if (d > 90 && wd.opacity > 0.2 && wd.insist > 0.35) moved.push({ wd: wd, d: d });
    });
    moved.sort(function (a, b) { return b.insist - a.insist; });
    for (var i = 0; i < Math.min(LIMITS.marksPerLayout, moved.length); i++) {
      this.mark(moved[i].wd.x, moved[i].wd.y, moved[i].wd.w, 'move');
    }
  };

  Field.prototype.clearSVG = function () {
    for (var k in this.svgGroups) {
      var g = this.svgGroups[k];
      while (g.firstChild) g.removeChild(g.firstChild);
    }
  };

  Field.prototype.pad = function () {
    // the colophon holds the top-left corner until the reading no longer
    // needs to be told what it is
    var top = document.body.classList.contains('colophon-dim') ? 76 : (this.narrow ? 150 : 210);
    return this.narrow
      ? { l: 18, r: 18, t: top, b: 104 }
      : { l: Math.max(48, this.w * 0.08), r: Math.max(56, this.w * 0.1), t: top, b: 104 };
  };

  /* ---- stanza: a temporarily readable arrangement ---------------------- */
  Field.prototype.layoutStanza = function () {
    var p = this.pad();
    var maxW = this.w - p.l - p.r;
    var lh = this.narrow ? 30 : 36;
    var x = p.l, y = p.t + 24, curLine = -1;
    var self = this;
    var prose = this.poem && this.poem.lines.length === 1 && this.poem.lines[0].cls === 'prose';
    var live = this.words.filter(function (wd) { return wd.present; });

    live.forEach(function (wd, i) {
      var ln = self.poem.lines[wd.line];
      if (!prose && wd.line !== curLine) {
        if (curLine >= 0) y += lh * (ln && ln.cls === 'gap' ? 0.55 : 1);
        curLine = wd.line;
        x = p.l + (wd.indent || 0) * (self.narrow ? 16 : 30);
      }
      // no space is opened before a mark of punctuation
      var next = live[i + 1];
      var grown = wd.w * Math.max(wd.scale, wd.targetScale || 1);
      var adv = grown + (next && next.kind === 'punct' ? 1 : 7);
      if (x + adv > p.l + maxW) { y += lh; x = p.l + (prose ? 14 : (wd.indent || 0) * 18); }
      wd.tx = x;
      wd.lineY = y;
      wd.ty = y;
      wd.targetRot = 0;
      // monumental scale only when grammatical pressure justifies it
      wd.targetScale = (wd.insist > 1.5 && wd.role === 'N' && !self.narrow)
        ? Math.min(2.4, 1 + wd.insist * 0.5, (maxW * 0.45) / Math.max(20, wd.w))
        : 1;
      wd.targetOpacity = 1;
      x += adv;
    });
    this.words.forEach(function (wd) { if (!wd.present) self.driftAway(wd); });
    this.contentBottom = y;
  };

  Field.prototype.driftAway = function (wd) {
    var a = (wd.id.charCodeAt(1) || 3) * 1.7;
    wd.tx = wd.x + Math.cos(a) * 40;
    wd.ty = wd.y + Math.sin(a) * 26;
    wd.targetOpacity = 0;
    wd.targetScale = 0.9;
  };

  /* ---- parse tree: how the current sentence was actually generated ------ */
  Field.prototype.layoutTree = function () {
    var tree = this.pickTree();
    if (!tree) return this.layoutStanza();
    this.currentTree = tree;
    var p = this.pad();
    var lvs = G.leaves(tree);
    var self = this;
    var used = Object.create(null);

    // assign x by leaf order, y by depth
    var depth = G.depthOf(tree) || 1;
    var lh = Math.min(150, Math.max(46, (this.h - p.t - p.b - 40) / Math.max(1, depth)));
    var spanW = this.w - p.l - p.r;
    var pos = Object.create(null);
    var leafCount = lvs.length || 1;

    lvs.forEach(function (n, i) {
      pos[n.id] = { x: p.l + (spanW * (i + 0.5)) / leafCount, y: 0 };
    });

    // internal nodes: mean of children, depth from root
    (function assign(n, d) {
      n.children.forEach(function (c) { assign(c, d + 1); });
      if (!pos[n.id]) pos[n.id] = { x: 0, y: 0 };
      if (n.children.length) {
        var sx = 0;
        n.children.forEach(function (c) { sx += pos[c.id].x; });
        pos[n.id].x = sx / n.children.length;
      }
      pos[n.id].y = p.t + d * lh;
      pos[n.id].d = d;
    })(tree, 0);

    // leaves sit at the bottom row
    var bottom = p.t + (depth) * lh;
    lvs.forEach(function (n) { pos[n.id].y = bottom; });

    // branches
    var gs = this.svgGroups.structure;
    G.walk(tree, function (n) {
      n.children.forEach(function (c) {
        var a = pos[n.id], b = pos[c.id];
        if (!a || !b) return;
        var mid = (a.y + b.y) / 2;
        el('path', {
          d: 'M' + a.x + ',' + (a.y + 8) + ' C' + a.x + ',' + mid + ' ' + b.x + ',' + mid + ' ' + b.x + ',' + (b.y - 14),
          'class': 'branch' + (c.role === 'CL' ? ' branch--clause' : '')
        }, gs);
      });
    });

    // internal labels as microtext evidence
    G.walk(tree, function (n) {
      if (!n.children.length) return;
      var a = pos[n.id];
      self.overlayText.push({ x: a.x, y: a.y, t: n.role, cls: 'nodelabel', nodeId: n.id });
    });

    // words to their leaves
    var placed = Object.create(null);
    lvs.forEach(function (n) {
      var wd = self.byId[n.id];
      if (!wd) return;
      placed[wd.id] = true;
      used[wd.id] = true;
      wd.tx = pos[n.id].x - wd.w / 2;
      wd.ty = pos[n.id].y;
      wd.targetOpacity = 1;
      wd.targetScale = 1;
      wd.targetRot = 0;
      wd.treeNode = n;
    });

    // everything else becomes marginal evidence
    this.park(this.words.filter(function (wd) { return !used[wd.id]; }), p);
  };

  Field.prototype.pickTree = function () {
    if (!this.poem || !this.poem.trees || !this.poem.trees.length) return null;
    var best = null, bd = -1;
    this.poem.trees.forEach(function (t) {
      var d = G.leaves(t).length;
      if (d > bd) { bd = d; best = t; }
    });
    return best;
  };

  /* ---- relation graph: words as nodes, relations as edges -------------- */
  Field.prototype.layoutGraph = function () {
    var mem = this.state.mem;
    var p = this.pad();
    var rng = this.state.layoutRng;
    var edges = mem.longTermRelations.slice(-LIMITS.edges);
    var names = Object.create(null);
    edges.forEach(function (e) { names[e.a] = true; names[e.b] = true; });

    // map lowercase names to live word objects, preferring insistent ones
    var byText = Object.create(null);
    this.words.forEach(function (wd) {
      if (wd.kind !== 'word') return;
      var k = wd.t.toLowerCase().replace(/[^a-z-]/g, '');
      if (!byText[k] || byText[k].insist < wd.insist) byText[k] = wd;
    });

    var nodes = [];
    Object.keys(names).forEach(function (n) {
      if (byText[n]) nodes.push({ name: n, wd: byText[n] });
    });
    if (nodes.length < 3) {
      // not enough relations yet: let the insistent words stand in a ring
      mem.insistent(9).forEach(function (s) {
        if (byText[s.w] && !names[s.w]) nodes.push({ name: s.w, wd: byText[s.w] });
      });
    }
    nodes = nodes.slice(0, LIMITS.nodes);
    if (!nodes.length) return this.layoutStanza();

    var cx = this.w * 0.5, cy = (p.t + this.h - p.b) * 0.5;
    var R = Math.min(this.w - p.l - p.r, this.h - p.t - p.b) * 0.42;
    var self = this;
    var pos = Object.create(null);
    nodes.forEach(function (nd, i) {
      var st = mem.stat(nd.name);
      var ang = (i / nodes.length) * Math.PI * 2 + rng() * 0.12;
      var rr = R * (0.42 + 0.58 * (1 - Math.min(1, (st ? st.insist : 0) / 2.2)));
      pos[nd.name] = { x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr * 0.82 };
      nd.wd.tx = pos[nd.name].x - nd.wd.w / 2;
      nd.wd.ty = pos[nd.name].y;
      nd.wd.targetOpacity = 1;
      nd.wd.targetScale = 1 + Math.min(0.8, (st ? st.insist : 0) * 0.3);
      nd.wd.targetRot = 0;
      nd.wd.graphName = nd.name;
    });

    var ge = this.svgGroups.edges;
    edges.forEach(function (e) {
      var a = pos[e.a], b = pos[e.b];
      if (!a || !b) return;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var dx = b.x - a.x, dy = b.y - a.y;
      var bow = Math.min(60, 12 + e.tightenings * 4) * (e.kind === 'contradicts' ? -1 : 1);
      var nx = -dy, ny = dx, L = Math.hypot(nx, ny) || 1;
      var qx = mx + (nx / L) * bow, qy = my + (ny / L) * bow;
      el('path', {
        d: 'M' + a.x + ',' + a.y + ' Q' + qx + ',' + qy + ' ' + b.x + ',' + b.y,
        'class': 'edge edge--' + e.kind.replace(/\s+/g, '-'),
        'stroke-width': Math.min(3.2, 0.5 + e.weight * 0.5)
      }, ge);
      self.overlayText.push({ x: qx, y: qy, t: e.kind, cls: 'edgelabel' });
    });

    this.park(this.words.filter(function (wd) { return !(wd.graphName && pos[wd.graphName]); }), p);
  };

  /* ---- table: rows disagree about what a word is ----------------------- */
  Field.prototype.layoutTable = function () {
    var mem = this.state.mem;
    var p = this.pad();
    var self = this;
    var cols = this.state.tableColumns;
    var amb = mem.ambiguousWords().slice(0, 7);
    if (amb.length < 2) {
      amb = mem.insistent(6).map(function (s) { return s; });
    }
    if (!amb.length) return this.layoutStanza();
    this.tableRows = amb;

    var colW = (this.w - p.l - p.r) / cols.length;
    var rowH = this.narrow ? 34 : 40;
    var y0 = p.t + 42;

    var gs = this.svgGroups.structure;
    cols.forEach(function (c, i) {
      var x = p.l + i * colW;
      self.overlayText.push({
        x: x, y: y0 - 20, t: c, cls: 'colhead', col: i, interactive: true
      });
      el('line', { x1: x - 8, y1: y0 - 12, x2: x - 8, y2: y0 + amb.length * rowH, 'class': 'rule rule--v' }, gs);
    });
    el('line', { x1: p.l - 8, y1: y0 - 12, x2: this.w - p.r, y2: y0 - 12, 'class': 'rule' }, gs);

    var byText = Object.create(null);
    this.words.forEach(function (wd) {
      var k = wd.t.toLowerCase().replace(/[^a-z-]/g, '');
      if (!byText[k]) byText[k] = wd;
    });

    var usedIds = Object.create(null);
    amb.forEach(function (row, r) {
      var y = y0 + r * rowH;
      el('line', { x1: p.l - 8, y1: y + rowH - 12, x2: self.w - p.r, y2: y + rowH - 12, 'class': 'rule rule--faint' }, gs);
      cols.forEach(function (c, i) {
        var x = p.l + i * colW;
        var val = cellValue(c, row, mem);
        if (c === 'word') {
          var wd = byText[row.w];
          if (wd) {
            usedIds[wd.id] = true;
            wd.tx = x; wd.ty = y; wd.targetOpacity = 1; wd.targetScale = 1; wd.targetRot = 0;
            return;
          }
        }
        self.overlayText.push({ x: x, y: y, t: val, cls: 'cell' });
      });
    });

    this.park(this.words.filter(function (wd) { return !usedIds[wd.id]; }), p);
  };

  function cellValue(col, row, mem) {
    var lex = null;
    for (var i = 0; i < C.ALL.length; i++) if (C.ALL[i].w === row.w) { lex = C.ALL[i]; break; }
    switch (col) {
      case 'word': return row.w;
      case 'claims to be': {
        var rs = Object.keys(row.roles);
        return rs.length ? rs.map(roleName).join(' / ') : 'a word';
      }
      case 'is used as': {
        var best = null, bv = -1;
        for (var k in row.roles) if (row.roles[k] > bv) { bv = row.roles[k]; best = k; }
        return best ? roleName(best) : '—';
      }
      case 'insistence': return row.insist.toFixed(2);
      case 'returns': return String(row.count);
      case 'disagreement': {
        if (lex && lex.claims) {
          var ks = Object.keys(lex.claims).filter(function (x) { return lex.claims[x] !== '—'; });
          return ks.length > 1 ? ks.length + ' readings' : 'settled';
        }
        return Object.keys(row.roles).length > 1 ? 'unsettled' : 'settled';
      }
      default: return '';
    }
  }

  /* ---- executable function --------------------------------------------- */
  Field.prototype.layoutFunction = function () {
    var p = this.pad();
    var fn = this.state.lastOperation;
    if (!fn) return this.layoutStanza();
    var self = this;
    var cx = p.l + (this.narrow ? 0 : 34);
    var y = p.t + 40;
    var lh = this.narrow ? 34 : 38;

    this.overlayText.push({ x: cx, y: y, t: fn.sig, cls: 'fnsig' });
    this.overlayText.push({ x: cx, y: y + lh * 0.62, t: '→ ' + fn.gloss, cls: 'fngloss' });

    var gs = this.svgGroups.brackets;
    var boxTop = y + lh * 1.25;
    el('path', {
      d: 'M' + (cx - 12) + ',' + boxTop + ' L' + (cx - 20) + ',' + boxTop +
        ' L' + (cx - 20) + ',' + (boxTop + lh * 2.6) + ' L' + (cx - 12) + ',' + (boxTop + lh * 2.6),
      'class': 'bracket'
    }, gs);

    var argIds = Object.create(null);
    var rowY = boxTop + lh * 0.5;
    ['in', 'out'].forEach(function (which, i) {
      var toks = which === 'in' ? fn.inTokens : fn.outTokens;
      self.overlayText.push({ x: cx - 46, y: rowY + i * lh * 1.4, t: which === 'in' ? 'x =' : '⇒', cls: 'fnrow' });
      var x = cx, row = 0;
      var maxX = self.w - self.pad().r;
      (toks || []).forEach(function (tk) {
        var wd = self.byId[tk.nid];
        if (!wd) return;
        argIds[wd.id] = true;
        if (x + wd.w > maxX) { row++; x = cx + 14; }
        var rowGap = Math.max(lh * 0.9, 30);
        wd.tx = x; wd.ty = rowY + i * lh * 1.5 + row * rowGap;
        wd.targetOpacity = which === 'out' ? 1 : 0.5;
        wd.targetScale = 1;
        wd.targetRot = 0;
        x += wd.w + 7;
      });
      rowY += row * Math.max(lh * 0.9, 30);
    });

    if (fn.note) this.overlayText.push({ x: cx, y: rowY + lh * 2.1, t: '// ' + fn.note, cls: 'fnnote' });

    this.park(this.words.filter(function (wd) { return !argIds[wd.id]; }), p);
  };

  /* ---- plot: histories that act on the future -------------------------- */
  Field.prototype.layoutPlot = function () {
    var p = this.pad();
    var mem = this.state.mem;
    var self = this;
    var names = this.state.plotSeries;
    var x0 = p.l, x1 = this.w - p.r, y0 = p.t + 40, y1 = this.h - p.b - 30;

    var gs = this.svgGroups.axis;
    el('line', { x1: x0, y1: y1, x2: x1, y2: y1, 'class': 'axis' }, gs);
    el('line', { x1: x0, y1: y0, x2: x0, y2: y1, 'class': 'axis' }, gs);
    this.overlayText.push({ x: x0, y: y0 - 18, t: names.join('  ·  '), cls: 'plotkey' });
    this.overlayText.push({ x: x0 + 2, y: y1 + 18, t: 'seconds of reading →', cls: 'axislabel' });

    this.plotGeom = { x0: x0, x1: x1, y0: y0, y1: y1, names: names };

    // words that name the extremes of the data sit on the plot
    var ins = mem.insistent(5);
    var byText = Object.create(null);
    this.words.forEach(function (wd) { if (!byText[wd.t.toLowerCase()]) byText[wd.t.toLowerCase()] = wd; });
    var marked = [];
    ins.forEach(function (s) { if (byText[s.w]) marked.push({ wd: byText[s.w], v: s.insist }); });
    if (marked.length < 3) {
      this.contentWords(5).forEach(function (wd) {
        if (!marked.some(function (x) { return x.wd === wd; })) marked.push({ wd: wd, v: wd.insist });
      });
    }
    var used = Object.create(null);
    marked.slice(0, 5).forEach(function (mk, i) {
      var wd = mk.wd;
      used[wd.id] = true;
      var fx = x1 - 16 - (i * (self.narrow ? 52 : 96));
      var v = Math.min(1, mk.v / 2.4);
      wd.tx = Math.max(x0, fx - wd.w / 2);
      wd.ty = y1 - v * (y1 - y0) * 0.9 - 6;
      wd.targetOpacity = 1;
      wd.targetScale = 0.9 + v * 0.5;
      wd.targetRot = 0;
    });

    this.park(this.words.filter(function (wd) { return !used[wd.id]; }), p);
  };

  /* ---- score: neither a staff nor a waveform ---------------------------
     Time runs left to right. Height is register. A mark's shape says what
     kind of event it is: attack, erosion, division, rest, return. Words sit
     where they are being remembered by the music, which is not where they
     are being said. */
  Field.prototype.layoutScore = function () {
    var p = this.pad();
    var self = this;
    var score = this.state.score || [];
    var x0 = p.l, x1 = this.w - p.r, y0 = p.t + 46, y1 = this.h - p.b - 40;
    var gs = this.svgGroups.structure;

    // three faint horizons: not a staff, three registers of attention
    [0.18, 0.5, 0.82].forEach(function (f) {
      el('line', { x1: x0, y1: y0 + (y1 - y0) * f, x2: x1, y2: y0 + (y1 - y0) * f, 'class': 'horizon' }, gs);
    });

    var span = Math.max(8, this.state.scoreSpan || 24);
    var now = this.state.mem.t;
    var gm = this.svgGroups.marks;
    score.forEach(function (ev) {
      var age = now - ev.t;
      if (age > span || age < -span) return;
      var fx = x0 + (1 - age / span) * (x1 - x0);
      var fy = y1 - (ev.reg || 0.5) * (y1 - y0);
      var s = 3 + (ev.strength || 0.5) * 7;
      if (ev.kind === 'attack') {
        el('path', { d: 'M' + fx + ',' + (fy - s) + ' L' + (fx + s * 0.7) + ',' + fy + ' L' + fx + ',' + (fy + s) + 'Z', 'class': 'mk mk--attack' }, gm);
      } else if (ev.kind === 'rest') {
        el('line', { x1: fx, y1: fy - s, x2: fx, y2: fy + s, 'class': 'mk mk--rest' }, gm);
      } else if (ev.kind === 'erode') {
        el('path', { d: 'M' + (fx - s) + ',' + fy + ' q' + s + ',-' + s + ' ' + (s * 2) + ',0', 'class': 'mk mk--erode' }, gm);
      } else if (ev.kind === 'divide') {
        el('path', { d: 'M' + (fx - s) + ',' + (fy + s) + ' L' + fx + ',' + (fy - s) + ' L' + (fx + s) + ',' + (fy + s), 'class': 'mk mk--divide' }, gm);
      } else if (ev.kind === 'return') {
        el('circle', { cx: fx, cy: fy, r: s * 0.8, 'class': 'mk mk--return' }, gm);
      } else {
        el('circle', { cx: fx, cy: fy, r: s * 0.4, 'class': 'mk' }, gm);
      }
    });

    // the melodic subject drawn as contour, sparse and small
    var subj = this.state.subject;
    if (subj && subj.contour && subj.contour.length) {
      var d = '';
      var n = subj.contour.length;
      subj.contour.forEach(function (step, i) {
        var fx = x0 + ((i + 0.5) / n) * (x1 - x0) * 0.55;
        var fy = y1 - (step.norm) * (y1 - y0);
        d += (i ? ' L' : 'M') + fx + ',' + fy;
      });
      el('path', { d: d, 'class': 'contour' }, gs);
      this.overlayText.push({ x: x0, y: y0 - 20, t: 'subject · ' + (this.state.melodyState || 'intimation'), cls: 'plotkey' });
    }

    var ins = this.state.mem.insistent(6);
    var byText = Object.create(null);
    this.words.forEach(function (wd) { if (!byText[wd.t.toLowerCase()]) byText[wd.t.toLowerCase()] = wd; });
    var singers = [];
    ins.forEach(function (s) { if (byText[s.w]) singers.push({ wd: byText[s.w], v: s.insist }); });
    if (singers.length < 3) {
      this.contentWords(6).forEach(function (wd) {
        if (!singers.some(function (x) { return x.wd === wd; })) singers.push({ wd: wd, v: wd.insist });
      });
    }
    var used = Object.create(null);
    singers.slice(0, 7).forEach(function (sg, i) {
      var wd = sg.wd;
      used[wd.id] = true;
      wd.tx = x0 + (0.1 + (i / Math.max(1, singers.length)) * 0.78) * (x1 - x0);
      wd.ty = y1 - (0.18 + Math.min(0.7, sg.v / 3)) * (y1 - y0);
      wd.targetOpacity = 0.92;
      wd.targetScale = 1;
      wd.targetRot = 0;
    });

    this.park(this.words.filter(function (wd) { return !used[wd.id]; }), p);
  };

  /* ---- residue: what was removed is still here ------------------------- */
  Field.prototype.layoutResidue = function () {
    var p = this.pad();
    var mem = this.state.mem;
    var self = this;
    var rng = this.state.layoutRng;
    var y = p.t + 40;
    this.overlayText.push({ x: p.l, y: y - 22, t: 'nothing was deleted', cls: 'plotkey' });
    mem.residues.slice(-18).forEach(function (r, i) {
      self.overlayText.push({
        x: p.l + (i % 2) * (self.w - p.l - p.r) * 0.5,
        y: y + Math.floor(i / 2) * 22,
        t: r.text + (r.note ? '  (' + r.note + ')' : ''),
        cls: 'residue',
        alpha: 0.16 + r.strength * 0.6
      });
    });
    var base = y + Math.ceil(Math.min(18, mem.residues.length) / 2) * 22 + 30;
    var cols = this.narrow ? 2 : 4;
    var rows = Math.max(2, Math.floor((this.h - p.b - base) / 26));
    var mi = 0;
    this.words.forEach(function (wd) {
      if (mi >= cols * rows) { wd.targetOpacity = 0; wd.targetScale = 0.5; return; }
      var a = rng() * Math.PI * 2;
      wd.tx = p.l + (mi % cols) * ((self.w - p.l - p.r) / cols) + Math.cos(a) * 10;
      wd.ty = base + Math.floor(mi / cols) * 26 + Math.sin(a) * 8;
      wd.targetOpacity = wd.present ? 0.75 : 0;
      wd.targetScale = 0.86;
      wd.targetRot = 0;
      mi++;
    });
  };

  /* --------------------------------------------------------- overlay text */
  Field.prototype.placeOverlayText = function () {
    var g = this.svgGroups.axis;
    var self = this;
    this.overlayText.forEach(function (o) {
      var t = el('text', {
        x: o.x, y: o.y, 'class': 'tx tx--' + (o.cls || 'plain'),
        'text-anchor': o.anchor || 'start'
      }, g);
      t.textContent = o.t;
      if (o.alpha != null) t.setAttribute('opacity', o.alpha);
      if (o.interactive) {
        t.classList.add('is-interactive');
        t.setAttribute('tabindex', '0');
        t.dataset.col = o.col;
        t.dataset.action = 'column';
      }
      if (o.nodeId) {
        t.dataset.node = o.nodeId;
        t.dataset.action = 'node';
        t.setAttribute('tabindex', '0');
        t.classList.add('is-interactive');
      }
    });
  };

  /* -------------------------------------------------------------- render */
  Field.prototype.render = function (dt) {
    if (this.pendingLayout) this.layout();
    var k = this.reduced ? 1 : Math.min(1, dt * 3.4);
    var now = performance.now();
    var self = this;

    for (var i = this.words.length - 1; i >= 0; i--) {
      var wd = this.words[i];
      var dx = wd.tx - wd.x, dy = wd.ty - wd.y;
      wd.x += dx * k;
      wd.y += dy * k;
      wd.opacity += (wd.targetOpacity - wd.opacity) * Math.min(1, k * 0.7);
      wd.scale += (wd.targetScale - wd.scale) * Math.min(1, k * 0.5);
      wd.rot += (wd.targetRot - wd.rot) * Math.min(1, k * 0.4);

      wd.el.style.transform = 'translate3d(' + wd.x.toFixed(1) + 'px,' + wd.y.toFixed(1) + 'px,0)' +
        (wd.scale !== 1 ? ' scale(' + wd.scale.toFixed(3) + ')' : '') +
        (wd.rot ? ' rotate(' + wd.rot.toFixed(2) + 'rad)' : '');
      wd.el.style.opacity = wd.opacity.toFixed(3);
      wd.el.style.setProperty('--insist', Math.min(1, wd.insist / 2.2).toFixed(3));

      if (wd.leaving && wd.opacity < 0.02 && now - wd.leaveAt > 2600) {
        this.mark(wd.x, wd.y, wd.w, 'erase');
        if (wd.el.parentNode) wd.el.parentNode.removeChild(wd.el);
        delete this.byId[wd.id];
        this.words.splice(i, 1);
      }
    }

    this.drawTraces(dt);
    if (this.mode === 'plot') this.drawPlot();
    this._svgTick++;
  };

  /* Canvas holds only history: where words have been, what was erased,
     and the accumulating pressure of the reading. It fades slowly. */
  Field.prototype.mark = function (x, y, w, kind) {
    if (this.marks.length > 400) return;
    this.marks.push({ x: x, y: y, w: w, kind: kind });
  };

  Field.prototype.drawTraces = function (dt) {
    var c = this.ctx2d;
    if (this.fadeAcc == null) this.fadeAcc = 0;
    this.fadeAcc += dt;
    if (this.fadeAcc > 0.5) {
      this.fadeAcc = 0;
      c.save();
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = 'rgba(0,0,0,0.075)';
      c.fillRect(0, 0, this.w, this.h);
      c.restore();
    }
    if (!this.marks.length) return;
    var col = this.state.relationColor || '#6a5acd';
    c.save();
    while (this.marks.length) {
      var m = this.marks.pop();
      c.globalAlpha = m.kind === 'erase' ? 0.22 : LIMITS.traceAlpha;
      c.strokeStyle = col;
      c.lineWidth = m.kind === 'erase' ? 0.8 : 0.5;
      c.beginPath();
      if (m.kind === 'erase') {
        c.moveTo(m.x, m.y + 2); c.lineTo(m.x + (m.w || 10), m.y + 2);
      } else {
        c.moveTo(m.x, m.y); c.lineTo(m.x + (m.w || 8) * 0.34, m.y);
      }
      c.stroke();
    }
    c.restore();
  };

  /* dense histories belong to canvas */
  Field.prototype.drawPlot = function () {
    var gm = this.plotGeom;
    if (!gm) return;
    var mem = this.state.mem;
    var c = this.ctx2d;
    c.save();
    c.clearRect(gm.x0 - 2, gm.y0 - 24, gm.x1 - gm.x0 + 6, gm.y1 - gm.y0 + 30);
    var col = this.state.relationColor || '#6a5acd';
    gm.names.forEach(function (name, si) {
      var s = mem.series[name];
      if (!s || s.length < 2) return;
      var t0 = s[0].t, t1 = s[s.length - 1].t;
      var span = Math.max(6, t1 - t0);
      var mx = 0.0001;
      s.forEach(function (p) { if (p.v > mx) mx = p.v; });
      c.beginPath();
      s.forEach(function (p, i) {
        var x = gm.x0 + ((p.t - t0) / span) * (gm.x1 - gm.x0);
        var y = gm.y1 - (p.v / mx) * (gm.y1 - gm.y0) * 0.92;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      });
      c.strokeStyle = si === 0 ? col : 'rgba(128,128,128,0.55)';
      c.lineWidth = si === 0 ? 1.4 : 0.8;
      c.setLineDash(si === 0 ? [] : [2, 3]);
      c.stroke();
      // last value as a small blunt tick, not a dot on a dashboard
      var last = s[s.length - 1];
      var lx = gm.x1, ly = gm.y1 - (last.v / mx) * (gm.y1 - gm.y0) * 0.92;
      c.setLineDash([]);
      c.beginPath(); c.moveTo(lx - 6, ly); c.lineTo(lx, ly); c.stroke();
    });
    c.restore();
  };

  Field.prototype.wordAt = function (x, y) {
    var best = null, bd = 1e9;
    this.words.forEach(function (wd) {
      if (wd.opacity < 0.15 || wd.kind !== 'word') return;
      var cx = wd.x + wd.w / 2, cy = wd.y + wd.h / 2;
      var d = Math.hypot(cx - x, cy - y);
      if (d < bd && d < 60) { bd = d; best = wd; }
    });
    return best;
  };

  Field.prototype.destroy = function () {
    this.words.forEach(function (wd) { if (wd.el.parentNode) wd.el.parentNode.removeChild(wd.el); });
    this.words = [];
    this.byId = Object.create(null);
    this.clearSVG();
    this.ctx2d.clearRect(0, 0, this.w, this.h);
  };

  SRI.Field = Field;
  SRI.fieldLimits = LIMITS;
  SRI.roleName = roleName;
})();
