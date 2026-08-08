/* print.js — one edition produced by one reading
 *
 * Not documentation of the work. The work has been happening; this is what
 * that particular happening left behind. Two readers with the same seed
 * will print different pages.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});
  var G = SRI.grammar;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, parent, text) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  function svg(tag, attrs, parent, text) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  function section(root, title) {
    var s = el('section', { 'class': 'ed-sec' }, root);
    el('h2', null, s, title);
    return s;
  }

  /* ---------------------------------------------------------- parse tree */
  function drawTree(parent, tree) {
    if (!tree) return;
    var lvs = G.leaves(tree);
    if (!lvs.length) return;
    var depth = G.depthOf(tree) || 1;
    var W = 640, H = 60 + depth * 56;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'ed-fig' }, parent);
    var pos = {};
    lvs.forEach(function (n, i) {
      pos[n.id] = { x: 24 + ((W - 48) * (i + 0.5)) / lvs.length, y: H - 26 };
    });
    (function assign(n, d) {
      n.children.forEach(function (c) { assign(c, d + 1); });
      if (!pos[n.id]) pos[n.id] = { x: 0, y: 0 };
      if (n.children.length) {
        var sx = 0;
        n.children.forEach(function (c) { sx += pos[c.id].x; });
        pos[n.id].x = sx / n.children.length;
        pos[n.id].y = 22 + d * 56;
      }
    })(tree, 0);
    G.walk(tree, function (n) {
      n.children.forEach(function (c) {
        var a = pos[n.id], b = pos[c.id];
        svg('line', {
          x1: a.x, y1: a.y + 5, x2: b.x, y2: b.y - 11,
          stroke: '#000', 'stroke-width': c.role === 'CL' ? 1.1 : 0.5
        }, s);
      });
      var p = pos[n.id];
      if (n.children.length) {
        svg('text', { x: p.x, y: p.y, 'text-anchor': 'middle', 'class': 'ed-node' }, s, n.role);
      } else {
        svg('text', { x: p.x, y: p.y, 'text-anchor': 'middle', 'class': 'ed-leaf' }, s, n.word);
        svg('text', { x: p.x, y: p.y + 12, 'text-anchor': 'middle', 'class': 'ed-node' }, s, n.role);
      }
    });
  }

  /* -------------------------------------------------------- relation graph */
  function drawGraph(parent, mem) {
    var edges = mem.longTermRelations.slice(-24);
    if (!edges.length) {
      el('p', { 'class': 'ed-none' }, parent, 'No relation was made durable enough to be drawn.');
      return;
    }
    var names = [];
    edges.forEach(function (e) {
      if (names.indexOf(e.a) < 0) names.push(e.a);
      if (names.indexOf(e.b) < 0) names.push(e.b);
    });
    var W = 640, H = 400, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'ed-fig' }, parent);
    var pos = {};
    names.forEach(function (n, i) {
      var a = (i / names.length) * Math.PI * 2 - Math.PI / 2;
      var st = mem.stat(n);
      var rr = R * (0.55 + 0.45 * (1 - Math.min(1, (st ? st.insist : 0) / 2)));
      pos[n] = { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
    });
    edges.forEach(function (e) {
      var a = pos[e.a], b = pos[e.b];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      svg('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#000',
        'stroke-width': Math.min(2.4, 0.4 + e.weight * 0.4),
        'stroke-dasharray': e.kind === 'misremembers' ? '3 3' : e.kind === 'contradicts' ? '1 3' : ''
      }, s);
      svg('text', { x: mx, y: my - 3, 'text-anchor': 'middle', 'class': 'ed-edge' }, s, e.kind);
    });
    names.forEach(function (n) {
      var p = pos[n];
      svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', 'class': 'ed-leaf' }, s, n);
    });
  }

  /* -------------------------------------------------------------- history */
  function drawPlot(parent, mem, names) {
    var W = 640, H = 200, pad = 30;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'ed-fig' }, parent);
    svg('line', { x1: pad, y1: H - pad, x2: W - 10, y2: H - pad, stroke: '#000', 'stroke-width': 0.5 }, s);
    svg('line', { x1: pad, y1: 12, x2: pad, y2: H - pad, stroke: '#000', 'stroke-width': 0.5 }, s);
    var any = false;
    names.forEach(function (name, si) {
      var series = mem.series[name];
      if (!series || series.length < 2) return;
      any = true;
      var t0 = series[0].t, t1 = series[series.length - 1].t;
      var span = Math.max(4, t1 - t0), mx = 0.0001;
      series.forEach(function (p) { if (p.v > mx) mx = p.v; });
      var d = '';
      series.forEach(function (p, i) {
        var x = pad + ((p.t - t0) / span) * (W - pad - 10);
        var y = (H - pad) - (p.v / mx) * (H - pad - 16);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
      });
      svg('path', {
        d: d, fill: 'none', stroke: '#000',
        'stroke-width': si === 0 ? 1.2 : 0.6,
        'stroke-dasharray': si === 0 ? '' : '2 3'
      }, s);
      svg('text', { x: W - 12, y: 20 + si * 13, 'text-anchor': 'end', 'class': 'ed-edge' }, s,
        name + '  max ' + mx.toFixed(2));
    });
    if (!any) el('p', { 'class': 'ed-none' }, parent, 'The reading is too young to have a history.');
    svg('text', { x: pad, y: H - 8, 'class': 'ed-edge' }, s, 'seconds of reading →');
  }

  /* ------------------------------------------------------------------ make */
  function make(state) {
    var mem = state.mem;
    var root = document.getElementById('edition');
    if (!root) return;
    root.innerHTML = '';

    var head = el('header', { 'class': 'ed-head' }, root);
    el('h1', null, head, 'THE SENTENCE REHEARSES ITSELF');
    el('p', { 'class': 'ed-sub' }, head,
      'one edition produced by one reading · seed ' + state.seed +
      ' · ' + Math.round(mem.t) + ' seconds · ' + new Date().toISOString().slice(0, 16).replace('T', ' '));

    var s1 = section(root, 'The sentence it began with');
    el('p', { 'class': 'ed-opening' }, s1, state.opening || '—');

    var s2 = section(root, 'Its major transformations');
    var ul = el('ol', { 'class': 'ed-list' }, s2);
    var majors = state.transformations.filter(function (t) {
      return /^(form|return|revisit|self|relation|roleShift|promoteClause|misremember|name|give)$/.test(t.kind);
    }).slice(-22);
    if (!majors.length) el('p', { 'class': 'ed-none' }, s2, 'Nothing has yet been done twice.');
    majors.forEach(function (t) {
      el('li', null, ul, t.t + 's · ' + t.kind + (t.note ? ' — ' + t.note : ''));
    });

    var s3 = section(root, 'One parse tree');
    var tree = null;
    if (state.poem && state.poem.trees && state.poem.trees.length) {
      tree = state.poem.trees.reduce(function (a, b) {
        return G.leaves(b).length > G.leaves(a).length ? b : a;
      });
    }
    if (tree) {
      el('p', { 'class': 'ed-cap' }, s3, G.textOf(tree));
      drawTree(s3, tree);
    } else el('p', { 'class': 'ed-none' }, s3, 'The current form has no tree; it is standing as something else.');

    var s4 = section(root, 'One relation graph');
    drawGraph(s4, mem);

    var s5 = section(root, 'One function');
    var op = state.lastOperation;
    if (op) {
      el('p', { 'class': 'ed-sig' }, s5, op.sig + '   →   ' + op.gloss);
      el('p', { 'class': 'ed-cap' }, s5, 'x = ' + SRI.forms.textOfTokens(op.inTokens || []));
      el('p', { 'class': 'ed-cap' }, s5, '⇒ ' + SRI.forms.textOfTokens(op.outTokens || []));
      if (op.note) el('p', { 'class': 'ed-note' }, s5, '// ' + op.note);
    } else el('p', { 'class': 'ed-none' }, s5, 'No operation has been performed on this reading yet.');

    var s6 = section(root, 'One history');
    drawPlot(s6, mem, ['insistence', 'ambiguity', 'returnProbability']);
    el('p', { 'class': 'ed-note' }, s6,
      'return probability now ' + mem.returnProbability().toFixed(3) +
      ' · this number was used to decide what came back.');

    var s7 = section(root, 'Selected residues');
    if (mem.residues.length) {
      var ul2 = el('ul', { 'class': 'ed-list' }, s7);
      mem.residues.slice(-16).forEach(function (r) {
        el('li', null, ul2, '"' + r.text + '"' + (r.note ? ' — ' + r.note : '') +
          ' · set aside at ' + Math.round(r.t) + 's · strength ' + r.strength.toFixed(2) +
          (r.returns ? ' · returned ×' + r.returns : ''));
      });
    } else el('p', { 'class': 'ed-none' }, s7, 'Nothing has been set aside. Nothing has come back.');

    var s8 = section(root, 'Spectral genealogy');
    var d = state.sound && state.sound.describe();
    if (d) {
      el('p', { 'class': 'ed-cap' }, s8,
        'subject ' + d.name + ' · ' + d.pitches.join(' ') + ' Hz · harmonicity ' + d.harmonicity +
        ' · fatigue ' + d.fatigue + ' · ' + d.voices + ' voice' + (d.voices > 1 ? 's' : '') +
        ' · condition: ' + d.condition);
      var ul3 = el('ul', { 'class': 'ed-list' }, s8);
      d.genealogy.forEach(function (g) {
        el('li', null, ul3, g.t + 's · ' + g.cause + ' → ' + g.note);
      });
    } else {
      el('p', { 'class': 'ed-none' }, s8, 'This reading was silent. The melody was generated and never heard.');
    }

    var s9 = section(root, 'Its current provisional form');
    el('p', { 'class': 'ed-cap' }, s9,
      (state.poem ? state.poem.form : '—') + ' standing as ' + (state.field ? state.field.mode : '—') +
      ' · regime ' + mem.dominantRegime().toLowerCase());
    var body = el('div', { 'class': 'ed-poem' }, s9);
    (state.poem ? state.poem.lines : []).forEach(function (l) {
      var t = SRI.forms.textOfTokens(l.tokens);
      var p = el('p', { 'class': 'ed-line ind-' + (l.indent || 0) }, body, t || ' ');
      if (l.cls) p.className += ' ed-' + l.cls;
    });

    var foot = el('footer', { 'class': 'ed-foot' }, root);
    var snap = mem.snapshot();
    el('p', null, foot, Object.keys(snap).map(function (k) { return k + ' ' + snap[k]; }).join(' · '));
    el('p', null, foot, 'This edition cannot be produced again. Reload with the same seed and a different reading will occur.');

    document.body.classList.add('printing');
    state.announce && state.announce('An edition of this reading has been assembled for printing.');
    setTimeout(function () {
      window.print();
      setTimeout(function () { document.body.classList.remove('printing'); }, 400);
    }, 90);
  }

  SRI.print = { make: make };
})();
