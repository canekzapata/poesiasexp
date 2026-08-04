/* reader.js — interpreted interactions
 *
 *   action → interpretation → memory → grammatical and musical state
 *          → immediate or delayed consequence
 *
 * Nothing here calls the synthesiser and nothing here writes a sentence.
 * It writes into memory. The grammar and the organism read memory on their
 * own clocks, which is why the reader influences the work without
 * controlling it.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});

  var DWELL_MS = 620;
  var DRAG_THRESHOLD = 7;

  function Reader(state, field) {
    this.state = state;
    this.field = field;
    this.hover = null;
    this.hoverSince = 0;
    this.selected = null;
    this.drag = null;
    this.lastPointer = null;
    this.lastPointerAt = 0;
    this.speed = 0;
    this.listeners = [];
    this.dwellTimer = null;
  }

  Reader.prototype.on = function (target, type, fn, opts) {
    target.addEventListener(type, fn, opts || false);
    this.listeners.push([target, type, fn, opts || false]);
  };

  Reader.prototype.attach = function (root) {
    var self = this;
    this.root = root;

    this.on(root, 'pointermove', function (e) { self.onMove(e); }, { passive: true });
    this.on(root, 'pointerdown', function (e) { self.onDown(e); });
    this.on(window, 'pointerup', function (e) { self.onUp(e); });
    this.on(root, 'pointerleave', function () { self.setHover(null); });

    this.on(document, 'keydown', function (e) { self.onKey(e); });
    this.on(document, 'focusin', function (e) { self.onFocus(e); });

    this.on(document, 'visibilitychange', function () {
      if (document.hidden) {
        self.state.mem.beginAbsence();
        self.state.onAbsenceStart && self.state.onAbsenceStart();
      } else {
        var a = self.state.mem.endAbsence();
        if (a) self.state.onAbsenceEnd && self.state.onAbsenceEnd(a);
      }
    });

    var rt = null;
    this.on(window, 'resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { self.state.onResize && self.state.onResize(); }, 180);
    });

    this.dwellTimer = setInterval(function () { self.checkDwell(); }, 140);
    return this;
  };

  Reader.prototype.detach = function () {
    this.listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    this.listeners = [];
    if (this.dwellTimer) clearInterval(this.dwellTimer);
  };

  /* ------------------------------------------------------------- pointer */
  Reader.prototype.onMove = function (e) {
    var now = performance.now();
    if (this.lastPointer) {
      var dt = Math.max(16, now - this.lastPointerAt) / 1000;
      var d = Math.hypot(e.clientX - this.lastPointer.x, e.clientY - this.lastPointer.y);
      var inst = d / dt;
      this.speed = this.speed * 0.82 + inst * 0.18;
      this.state.pointerSpeed = this.speed;
      this.state.mem.lastActivity = this.state.mem.t;
      // rapid movement fragments dependency; slow movement lets clauses converge
      if (this.speed > 1400) this.state.mem.raise('ambiguity', 0.004);
      else if (this.speed < 90) this.state.mem.immediateAttention =
        Math.min(1, this.state.mem.immediateAttention + 0.006);
    }
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.lastPointerAt = now;

    if (this.drag) { this.moveDrag(e); return; }

    var wd = this.wordFromEvent(e);
    this.setHover(wd);
  };

  Reader.prototype.wordFromEvent = function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('w')) {
      return this.field.byId[t.dataset.nid] || null;
    }
    var r = this.field.textLayer.getBoundingClientRect();
    return this.field.wordAt(e.clientX - r.left, e.clientY - r.top);
  };

  Reader.prototype.setHover = function (wd) {
    if (this.hover === wd) return;
    if (this.hover) this.hover.el.classList.remove('is-hover');
    this.hover = wd;
    this.hoverSince = performance.now();
    if (wd) {
      wd.el.classList.add('is-hover');
      this.state.mem.lastActivity = this.state.mem.t;
    }
  };

  /* dwelling on a word increases its insistence — slowly, and with a cost */
  Reader.prototype.checkDwell = function () {
    if (!this.hover || this.drag) return;
    var held = (performance.now() - this.hoverSince) / 1000;
    if (held * 1000 < DWELL_MS) return;
    var wd = this.hover;
    wd.insist += 0.055;
    wd.dwell += 0.14;
    this.state.mem.dwell(wd.t, 0.14);
    if (wd.dwell > 1.2 && !wd.attentionSent) {
      wd.attentionSent = true;
      this.cause('attention', { word: wd.t });
      wd.el.classList.add('is-insisting');
    }
    if (wd.insist > 1.4 && !wd.pressureSent) {
      wd.pressureSent = true;
      this.state.pendingIntent = { kind: 'press', word: wd.t, id: wd.id };
    }
  };

  Reader.prototype.onDown = function (e) {
    var svgTarget = e.target && e.target.dataset ? e.target.dataset.action : null;
    if (svgTarget === 'column') { this.reorderColumn(parseInt(e.target.dataset.col, 10)); return; }
    if (svgTarget === 'node') { this.touchNode(e.target.dataset.node); return; }

    var wd = this.wordFromEvent(e);
    if (!wd) {
      if (this.selected) this.deselect();
      return;
    }
    this.drag = { wd: wd, x0: e.clientX, y0: e.clientY, moved: false, ox: wd.x, oy: wd.y };
    wd.el.classList.add('is-dragging');
    try { this.root.setPointerCapture && this.root.setPointerCapture(e.pointerId); } catch (err) { }
  };

  Reader.prototype.moveDrag = function (e) {
    var d = this.drag;
    var dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) d.moved = true;
    if (!d.moved) return;
    d.wd.x = d.ox + dx;
    d.wd.y = d.oy + dy;
    d.wd.tx = d.wd.x;
    d.wd.ty = d.wd.y;
    var over = this.wordFromEvent(e);
    if (over && over !== d.wd) {
      if (this.overTarget && this.overTarget !== over) this.overTarget.el.classList.remove('is-target');
      this.overTarget = over;
      over.el.classList.add('is-target');
    } else if (this.overTarget) {
      this.overTarget.el.classList.remove('is-target');
      this.overTarget = null;
    }
  };

  Reader.prototype.onUp = function (e) {
    if (!this.drag) return;
    var d = this.drag;
    d.wd.el.classList.remove('is-dragging');
    this.drag = null;

    if (this.overTarget) {
      var target = this.overTarget;
      this.overTarget.el.classList.remove('is-target');
      this.overTarget = null;
      this.connect(d.wd, target);
      return;
    }
    if (d.moved) {
      // dragged into another region of the field: the word changes its role
      this.state.pendingIntent = { kind: 'roleShift', word: d.wd.t, id: d.wd.id };
      this.cause('roleShift', { word: d.wd.t });
      this.field.pendingLayout = true;
    } else {
      this.select(d.wd);
    }
  };

  /* connecting two words creates a relation that alters both */
  Reader.prototype.connect = function (a, b) {
    var mem = this.state.mem, rng = this.state.rng;
    var C = SRI.corpus;
    var kind = rng.weighted(C.RELATIONS, function (r) {
      if (r.k === 'repeats' && a.t.toLowerCase() === b.t.toLowerCase()) return 6;
      if (r.k === 'returns as' && a.role !== b.role) return 3;
      if (r.k === 'contradicts' && a.role === b.role) return 2;
      return 1;
    });
    var edge = mem.addEdge(a.t, b.t, kind.k);
    a.insist += 0.2; b.insist += 0.2;
    a.el.classList.add('is-related'); b.el.classList.add('is-related');
    this.state.pendingIntent = {
      kind: 'connect', a: a.t.toLowerCase(), b: b.t.toLowerCase(),
      relation: kind.k, phrase: kind.phrase(a.t.toLowerCase(), b.t.toLowerCase())
    };
    this.cause('connect', { a: a.t, b: b.t });
    if (edge && edge.tightenings > 1) this.cause('repeat', {});
    this.field.pendingLayout = true;
    this.deselect();
    return edge;
  };

  Reader.prototype.select = function (wd) {
    if (this.selected && this.selected !== wd) {
      var first = this.selected;
      this.deselect();
      this.connect(first, wd);
      return;
    }
    this.selected = wd;
    wd.el.classList.add('is-selected');
    this.state.announce && this.state.announce(wd.t + ' selected. Choose a second word to relate it, or press Backspace to set it aside.');
  };

  Reader.prototype.deselect = function () {
    if (this.selected) this.selected.el.classList.remove('is-selected');
    this.selected = null;
  };

  /* deleting a phrase stores it as residue rather than destroying it */
  Reader.prototype.setAside = function (wd) {
    if (!wd) return;
    this.state.mem.addResidue({ kind: 'word', text: wd.t, note: 'set aside by the reader' });
    this.state.mem.raise('silenceDebt', 0.04);
    this.cause('abandon', { what: wd.t });
    this.field.remove(wd.id);
    this.state.pendingIntent = { kind: 'residue', word: wd.t };
    this.state.announce && this.state.announce(wd.t + ' set aside. It is still here.');
  };

  /* reordering a table column changes the grammar it describes */
  Reader.prototype.reorderColumn = function (i) {
    var cols = this.state.tableColumns;
    if (isNaN(i) || i < 0 || i >= cols.length) return;
    var moved = cols.splice(i, 1)[0];
    cols.unshift(moved);
    this.state.pendingIntent = { kind: 'reorder', column: moved };
    this.cause('roleShift', { word: moved });
    this.state.mem.raise('ambiguity', 0.07);
    this.field.pendingLayout = true;
    this.state.announce && this.state.announce('Column "' + moved + '" moved first. The rows now disagree differently.');
  };

  /* moving a node changes its grammatical role and regenerates the sentence */
  Reader.prototype.touchNode = function (nodeId) {
    this.state.pendingIntent = { kind: 'node', nodeId: nodeId };
    this.cause('roleShift', { word: nodeId });
    this.state.mem.raise('ambiguity', 0.05);
  };

  /* -------------------------------------------------------------- keyboard */
  Reader.prototype.onFocus = function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('w')) {
      var wd = this.field.byId[t.dataset.nid];
      if (wd) { this.setHover(wd); this.state.mem.lastActivity = this.state.mem.t; }
    }
  };

  Reader.prototype.onKey = function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    var focusWord = null;
    if (document.activeElement && document.activeElement.classList &&
      document.activeElement.classList.contains('w')) {
      focusWord = this.field.byId[document.activeElement.dataset.nid];
    }
    var wd = focusWord || this.hover;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (wd) { e.preventDefault(); this.select(wd); }
        break;
      case 'Backspace':
      case 'Delete':
        if (wd) { e.preventDefault(); this.setAside(wd); }
        break;
      case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
        if (wd) {
          e.preventDefault();
          this.state.pendingIntent = { kind: 'roleShift', word: wd.t, id: wd.id };
          this.cause('roleShift', { word: wd.t });
          this.state.announce && this.state.announce(wd.t + ' moved to another branch.');
        }
        break;
      case 'p': case 'P':
        e.preventDefault();
        this.state.onPrint && this.state.onPrint();
        break;
      case 's': case 'S':
        e.preventDefault();
        this.state.onToggleAudio && this.state.onToggleAudio();
        break;
      case 'r': case 'R':
        e.preventDefault();
        this.state.onReset && this.state.onReset();
        break;
      case 'Escape':
        this.deselect();
        break;
    }
  };

  Reader.prototype.cause = function (kind, data) {
    var st = this.state;
    if (!st.pendingCauses) st.pendingCauses = [];
    data = data || {};
    data.kind = kind;
    data.t = st.mem.t;
    st.pendingCauses.push(data);
    if (st.pendingCauses.length > 12) st.pendingCauses.shift();
  };

  SRI.Reader = Reader;
})();
