'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  field.js  ::  el campo diagramático, vivo y a color
//
//  Sobre el clima (canvas) flota un plano que respira: fragmentos
//  coloreados con la biografía de su memoria dibujada al lado, el grafo
//  de enlaces animado, gráficas generativas de la lectura (calor por
//  campo, rosa de acciones, integridad por vuelta), texto que se
//  comprime y descomprime. Lectura no lineal: se explora, no se pasa.
// =====================================================================

(function () {
  const C = window.ARCHIVE_CONTENT;
  const NS = 'http://www.w3.org/2000/svg';
  const makeRng = window.ArchiveCore.makeRng;

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const svg = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // barra de braille: una gráfica diminuta de un valor 0..1
  const BRAILLE = '⠀⢀⢠⢰⢸⣸⣼⣾⣿';
  function sparkline(vals, max) {
    const m = max || Math.max(1, ...vals);
    return vals.map((v) => BRAILLE[clamp(Math.round((v / m) * 8), 0, 8)]).join('');
  }

  class Field {
    constructor(archive, root, palette) {
      this.archive = archive;
      this.root = root;
      this.palette = palette;
      this.depth = 0;
      this.boxes = [];
      this._chartAt = 0;
      this.build();
    }

    setPalette(p) { this.palette = p; }

    build() {
      // conserva el canvas del clima si ya existe (lo crea el reader)
      const clima = this.root.querySelector('#clima');
      this.root.textContent = '';
      if (clima) this.root.appendChild(clima);
      this.root.classList.add('field');

      this.svgLayer = svg('svg', { class: 'relation-layer', preserveAspectRatio: 'none' });
      this._defs();
      this.root.appendChild(this.svgLayer);

      this.fragLayer = el('div', 'fragments');
      this.root.appendChild(this.fragLayer);

      this.boxLayer = el('div', 'boxes');
      this.root.appendChild(this.boxLayer);

      this.monument = el('div', 'monument');
      this.root.appendChild(this.monument);

      // panel de gráficas generativas
      this.charts = el('aside', 'charts');
      this.root.appendChild(this.charts);

      this.legend = el('aside', 'legend');
      this.root.appendChild(this.legend);

      this.oracle = el('div', 'oracle');
      this.root.appendChild(this.oracle);

      this.stamp = el('div', 'stamp');
      this.root.appendChild(this.stamp);

      this.syncAll();
    }

    _defs() {
      const defs = svg('defs');
      // gradientes de enlace, uno por tipo de relación, coloreados
      Object.keys(C.RELATIONS).forEach((k, i) => {
        const grad = svg('linearGradient', { id: `grad-${k}`, x1: '0', y1: '0', x2: '1', y2: '1' });
        grad.appendChild(svg('stop', { offset: '0%', 'stop-color': this.palette.colors[(i * 3) % 24] }));
        grad.appendChild(svg('stop', { offset: '100%', 'stop-color': this.palette.colors[(i * 3 + 8) % 24] }));
        defs.appendChild(grad);
      });
      this.svgLayer.appendChild(defs);
    }

    syncAll() {
      this.syncFragments();
      this.syncRelations();
      this.renderLegend();
      this.renderCharts();
      this.syncStamp();
      this.syncMonument();
    }

    // -----------------------------------------------------------------
    //  fragmentos coloreados, con su memoria dibujada
    // -----------------------------------------------------------------
    syncFragments() {
      const have = new Set();
      this.archive.fragments.forEach((f) => {
        have.add(f.id);
        let node = this.fragLayer.querySelector(`[data-id="${f.id}"]`);
        if (!node) node = this._makeFragmentNode(f);
        this._syncFragmentNode(node, f);
      });
      [...this.fragLayer.children].forEach((n) => { if (!have.has(n.dataset.id)) n.remove(); });
    }

    _makeFragmentNode(f) {
      const node = el('div', 'fragment');
      node.dataset.id = f.id;
      // color propio, estable por vuelta
      node.style.setProperty('--fc', this.palette.forId(f.id, f.born));
      // deriva individual (no lineal): cada fragmento con su fase
      const r = makeRng(`${f.id}:drift`);
      node.style.setProperty('--dx', `${(r() - 0.5) * 22}px`);
      node.style.setProperty('--dy', `${(r() - 0.5) * 22}px`);
      node.style.setProperty('--dt', `${(6 + r() * 10).toFixed(1)}s`);
      node.appendChild(el('span', 'frag-glyph', f.glyph));
      node.appendChild(el('div', 'frag-text'));
      node.appendChild(el('div', 'frag-graph'));   // mini-gráfica de memoria
      node.appendChild(el('span', 'frag-meta'));
      this.fragLayer.appendChild(node);
      return node;
    }

    _syncFragmentNode(node, f) {
      node.style.left = `${(f.x * 100).toFixed(3)}%`;
      node.style.top = `${(f.y * 100).toFixed(3)}%`;
      node.style.setProperty('--scale', f.scale.toFixed(3));
      const dist = Math.abs(this.depth - f.stratum);
      node.style.setProperty('--legibility', clamp(1 - dist * 0.4, 0.12, 1).toFixed(3));
      node.style.setProperty('--dano', clamp(f.daño / 100, 0, 1).toFixed(3));
      // texto compresible/incompresible: la atención comprime la letra
      node.style.setProperty('--compress', clamp(1 - f.atencion * 0.03, 0.5, 1.35).toFixed(3));
      node.dataset.origin = f.origin;
      node.classList.toggle('instruction', !!f.instruction);
      node.classList.toggle('fossil', !!f.fossil);
      node.classList.toggle('sign', !!f.sign);
      node.classList.toggle('predicted', !!f.predicted);
      node.classList.toggle('hyper', f.scale > 1.4);
      node.classList.toggle('connected', f.conexiones.length > 0);
      node.querySelector('.frag-text').textContent = this.archive.renderText(f, this.depth);
      // la gráfica de memoria: atención · daño · edad · enlaces en braille
      node.querySelector('.frag-graph').textContent =
        sparkline([f.atencion, f.daño / 10, f.edad, f.conexiones.length * 2], 12);
      node.querySelector('.frag-meta').textContent = f.era
        ? `${f.era}` : `${f.origin}·a${f.atencion | 0}·d${f.daño | 0}·c${f.conexiones.length}`;
    }

    // -----------------------------------------------------------------
    //  el grafo de enlaces: trazos de color animados
    // -----------------------------------------------------------------
    syncRelations() {
      [...this.svgLayer.querySelectorAll('.relation, .relation-label')].forEach((n) => n.remove());
      const rect = this.root.getBoundingClientRect();
      const W = rect.width || 1, H = rect.height || 1;
      this.svgLayer.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.archive.relations.forEach((rel) => {
        const a = this.archive.fragments.find((f) => f.id === rel.from);
        const b = this.archive.fragments.find((f) => f.id === rel.to);
        if (!a || !b) return;
        const x1 = a.x * W, y1 = a.y * H, x2 = b.x * W, y2 = b.y * H;
        const mx = (x1 + x2) / 2 + (rel.kind === 'demora' ? 46 : (Math.sin(rel.turn) * 30));
        const my = (y1 + y2) / 2 - (rel.kind === 'eco' ? 34 : 0);
        const path = svg('path', {
          class: `relation rel-${rel.kind}`,
          d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`,
          stroke: `url(#grad-${rel.kind})`,
        });
        this.svgLayer.appendChild(path);
        const label = svg('text', { class: 'relation-label', x: mx, y: my, fill: this.palette.tinta });
        label.textContent = `${rel.glyph} ${rel.kind}`;
        this.svgLayer.appendChild(label);
      });
    }

    drawTransientLink(x1, y1, x2, y2) {
      const rect = this.root.getBoundingClientRect();
      const path = svg('path', { class: 'relation transient', stroke: this.palette.acento,
        d: `M${x1 - rect.left},${y1 - rect.top} L${x2 - rect.left},${y2 - rect.top}` });
      this.svgLayer.appendChild(path);
      return path;
    }

    // -----------------------------------------------------------------
    //  gráficas generativas de la lectura (diagramas + graficas)
    // -----------------------------------------------------------------
    renderCharts() {
      const a = this.archive, P = this.palette;
      this.charts.textContent = '';

      // 1. calor por campo: barras de atención acumulada por operación
      const heat = {};
      a.fragments.forEach((f) => { heat[f.origin] = (heat[f.origin] || 0) + f.atencion + 1; });
      const keys = Object.keys(C.OPERATIONS);
      const maxH = Math.max(1, ...keys.map((k) => heat[k] || 0));
      const bars = svg('svg', { class: 'chart', viewBox: '0 0 100 46', preserveAspectRatio: 'none' });
      keys.forEach((k, i) => {
        const h = (heat[k] || 0) / maxH * 38;
        const x = i * (100 / keys.length) + 1;
        bars.appendChild(svg('rect', { x, y: 42 - h, width: 100 / keys.length - 2, height: h,
          fill: P.forId('op-' + k, 0) }));
      });
      this.charts.appendChild(this._chartBlock('CALOR POR CAMPO', bars));

      // 2. rosa de acciones: diagrama radial del historial
      const counts = a._actionCounts || {};
      const acc = ['mover', 'detener', 'enlazar', 'arrastrar', 'excavar', 'abandonar', 'nada'];
      const maxA = Math.max(1, ...acc.map((k) => counts[k] || 0));
      const rose = svg('svg', { class: 'chart', viewBox: '-24 -24 48 48' });
      acc.forEach((k, i) => {
        const ang = (i / acc.length) * 6.2832 - 1.5708;
        const r = 4 + (counts[k] || 0) / maxA * 18;
        rose.appendChild(svg('line', { x1: 0, y1: 0, x2: (Math.cos(ang) * r).toFixed(1), y2: (Math.sin(ang) * r).toFixed(1),
          stroke: P.colors[i * 3 % 24], 'stroke-width': 1.4 }));
        rose.appendChild(svg('circle', { cx: (Math.cos(ang) * r).toFixed(1), cy: (Math.sin(ang) * r).toFixed(1), r: 1.6, fill: P.acento }));
      });
      this.charts.appendChild(this._chartBlock('ROSA DE ACCIONES', rose));

      // 3. integridad por vuelta: gráfica de línea
      const hist = a.integrityHistory && a.integrityHistory.length ? a.integrityHistory : [a.legendIntegrity];
      const line = svg('svg', { class: 'chart', viewBox: '0 0 100 30', preserveAspectRatio: 'none' });
      const pts = hist.map((v, i) => `${(i / Math.max(1, hist.length - 1)) * 100},${30 - v / 100 * 28}`).join(' ');
      line.appendChild(svg('polyline', { points: pts, fill: 'none', stroke: P.diagnostico, 'stroke-width': 1.4 }));
      line.appendChild(svg('polyline', { points: `0,30 ${pts} 100,30`, fill: P.diagnostico, opacity: 0.14, stroke: 'none' }));
      this.charts.appendChild(this._chartBlock(`INTEGRIDAD ${a.legendIntegrity | 0}%`, line));

      this._chartAt = performance.now();
    }
    _chartBlock(title, node) {
      const b = el('div', 'chart-block');
      b.appendChild(el('div', 'chart-title', title));
      b.appendChild(node);
      return b;
    }

    // -----------------------------------------------------------------
    //  leyenda corruptible, a color
    // -----------------------------------------------------------------
    renderLegend() {
      const integrity = this.archive.legendIntegrity;
      this.legend.textContent = '';
      const head = el('div', 'legend-head');
      head.textContent = this._corrupt('LEYENDA · ' + this.palette.momento, integrity);
      this.legend.appendChild(head);
      const bar = el('div', 'legend-bar');
      bar.style.setProperty('--w', `${integrity}%`);
      this.legend.appendChild(bar);
      Object.entries(C.RELATIONS).forEach(([k, r], i) => {
        const row = el('div', 'legend-row');
        const g = el('span', 'legend-glyph', r.glyph);
        g.style.color = this.palette.colors[i * 3 % 24];
        row.appendChild(g);
        row.appendChild(el('span', 'legend-name', this._corrupt(k, integrity)));
        this.legend.appendChild(row);
      });
    }

    _corrupt(text, integrity) {
      if (integrity >= 92) return text;
      const p = (100 - integrity) / 100;
      const r = makeRng(`${text}:${Math.round(integrity)}`);
      const pool = C.GLYPHSETS.geo.concat(C.GLYPHS);
      return [...text].map((ch) => (ch === ' ' ? ' ' : (r() < p * 0.7 ? pool[(r() * pool.length) | 0] : ch))).join('');
    }

    // -----------------------------------------------------------------
    //  monumento: la palabra del estrato, comprimida o expandida
    // -----------------------------------------------------------------
    syncMonument() {
      const stratum = C.STRATA[Math.min(C.STRATA.length - 1, Math.round(this.depth))];
      this.monument.textContent = stratum.label;
      this.monument.style.setProperty('--depth', this.depth.toFixed(2));
      this.monument.style.color = this.palette.colors[Math.round(this.depth) * 3 % 24];
    }

    syncStamp() {
      const a = this.archive, P = this.palette;
      this.stamp.textContent = '';
      this.stamp.appendChild(el('span', 'stamp-turn', `VUELTA ${String(a.turn + 1).padStart(2, '0')}`));
      this.stamp.appendChild(el('span', 'stamp-state', `${a.stateNumber}/8 ${a.state}`));
      this.stamp.appendChild(el('span', 'stamp-clima', `${P.momento} · ${P.modo} · ${P.M.humor}`));
      this.stamp.appendChild(el('span', 'stamp-frag', `${a.fragments.length} estaciones · ${a.buried.length} enterradas`));
    }

    setDepth(d) {
      this.depth = clamp(d, 0, C.STRATA.length - 1);
      this.root.style.setProperty('--depth', this.depth.toFixed(3));
      this.syncFragments();
      this.syncMonument();
    }
    setMode(mode) { this.root.dataset.mode = mode; this.syncStamp(); }
    setAuthority(a) { this.root.style.setProperty('--authority', clamp(a / 100, 0, 1).toFixed(3)); }

    // -----------------------------------------------------------------
    //  cajas / fronteras
    // -----------------------------------------------------------------
    addBox(x, y, w, h) {
      const box = { id: `b${Date.now().toString(36)}`, x, y, w, h };
      this.boxes.push(box);
      const node = el('div', 'box');
      node.dataset.id = box.id;
      node.style.left = `${x * 100}%`; node.style.top = `${y * 100}%`;
      node.style.width = `${w * 100}%`; node.style.height = `${h * 100}%`;
      node.style.setProperty('--bc', this.palette.acento);
      node.appendChild(el('span', 'box-label', 'celda'));
      node.appendChild(el('span', 'box-handle'));
      this.boxLayer.appendChild(node);
      box.node = node; box.handle = node.querySelector('.box-handle');
      return box;
    }
    reclassify() {
      const inside = new Set();
      this.boxes.forEach((box) => {
        this.archive.fragments.forEach((f) => {
          if (f.x >= box.x && f.x <= box.x + box.w && f.y >= box.y && f.y <= box.y + box.h) inside.add(f.id);
        });
      });
      this.fragLayer.querySelectorAll('.fragment').forEach((n) => n.classList.toggle('metadata', inside.has(n.dataset.id)));
      return inside;
    }

    // -----------------------------------------------------------------
    //  oráculo :: boletín meteorológico / meme / instrucción corrompida
    // -----------------------------------------------------------------
    showOracle(text, kind = 'neutral') {
      this.oracle.textContent = text;
      this.oracle.dataset.kind = kind;
      this.oracle.style.setProperty('--oc', kind === 'prophecy' || kind === 'break' ? this.palette.diagnostico : this.palette.acento);
      this.oracle.classList.remove('visible'); void this.oracle.offsetWidth;
      this.oracle.classList.add('visible');
      clearTimeout(this._oracleT);
      this._oracleT = setTimeout(() => this.oracle.classList.remove('visible'), 4600);
    }
    // un boletín del clima de esta lectura, con humor
    bulletin() {
      const a = this.archive;
      const r = a.rng;
      const P = (arr) => arr[(r() * arr.length) | 0];
      if (r() < 0.32) return P(C.MEMES.errores);
      if (r() < 0.5) return P(C.MEMES.citas);
      const t = (r() * 40 - 5) | 0, s = t + ((r() * 20 - 10) | 0);
      const p = (r() * 100) | 0;
      return P(C.CLIMA.bulletins)
        .replace('{p}', p).replace('{t}', Math.abs(t)).replace('{s}', s)
        .replace('{f}', P(C.CLIMA.fenomenos))
        .replace('{w}', P(C.OPERATIONS[Object.keys(C.OPERATIONS)[(r() * 8) | 0]].words));
    }

    flash(kind) {
      this.root.dataset.flash = kind;
      clearTimeout(this._flashT);
      this._flashT = setTimeout(() => { this.root.dataset.flash = ''; }, 520);
    }

    getFragmentNode(id) { return this.fragLayer.querySelector(`[data-id="${id}"]`); }
    fragmentCenter(id) {
      const node = this.getFragmentNode(id); if (!node) return null;
      const r = node.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // deriva por cuadro: refresca gráficas y grafo con moderación
    drift(now) {
      if (now - this._chartAt > 900) this.renderCharts();
    }
  }

  window.ArchiveField = Field;
})();
