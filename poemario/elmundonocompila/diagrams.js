'use strict';

/* =====================================================================
   EL MUNDO NO COMPILA
   diagrams.js  ::  sistema diagramático (SVG) + familias de páginas
   ---------------------------------------------------------------------
   La página ocupa el 100% de la ventana y sus dimensiones son dinámicas
   (PAGE_W/PAGE_H = viewport). Todas las composiciones se disponen con
   coordenadas proporcionales para adaptarse a cualquier pantalla.
   Cada flecha tiene una FUNCIÓN identificable (10). La leyenda existe
   pero puede corromperse.
   ===================================================================== */

/* IIFE: los scripts clásicos comparten el alcance léxico global, así que
   aislamos aquí para no colisionar con las declaraciones de content.js */
(function () {

let PAGE_W = 1000;
let PAGE_H = 1414;
const SVGNS = 'http://www.w3.org/2000/svg';

/* tamaño vivo de la página (lo lee el motor) */
const SIZE = { get w() { return PAGE_W; }, get h() { return PAGE_H; } };
function setPageSize(w, h) {
  PAGE_W = Math.max(320, Math.round(w));
  PAGE_H = Math.max(460, Math.round(h));
}

const {
  weave, microLine, nodeLabel, classSpec, pageTitle, stamp,
  pick, rint, rflt, chance, shuffle, pickN, val, short, cap, padZero,
  FORMULAS, GLYPHS, KAOMOJI, UNITS_ODD, CLASS_OBJECTS, chooseCats,
  CATS, nodo, acc, fragOf, unidad, estado, C,
} = CONTENT;

/* ------------------------------------------------------------------ */
/*  Helpers de disposición proporcional                                */
/* ------------------------------------------------------------------ */
function PX(f) { return f * PAGE_W; }
function PY(f) { return f * PAGE_H; }
function MIN() { return Math.min(PAGE_W, PAGE_H); }
function M() { return Math.max(22, Math.min(MIN() * 0.055, 84)); }        // margen
function bandTop() { return PY(0.115); }
function bandBot() { return PY(0.885); }
function rowY(i, n) { return n <= 1 ? (bandTop() + bandBot()) / 2 : bandTop() + (bandBot() - bandTop()) * (i / (n - 1)); }
function colX(i, n) {
  const l = M() + PAGE_W * 0.04, r = PAGE_W - M() - PAGE_W * 0.04;
  return n <= 1 ? (l + r) / 2 : l + (r - l) * (i / (n - 1));
}
/* ancho legible por defecto para bloques de texto */
function textW(f) { return Math.min(PAGE_W - M() * 2, PAGE_W * (f || 0.62)); }
function isWide() { return PAGE_W / PAGE_H > 1.15; }   // pantalla apaisada

/* ------------------------------------------------------------------ */
/*  Las 10 funciones de flecha                                         */
/* ------------------------------------------------------------------ */
const ARROWS = {
  transformacion:   { key: 'transform',   label: 'transformación',    marker: 'tri'  },
  dependencia:      { key: 'depend',      label: 'dependencia',       marker: 'open' },
  transmision:      { key: 'transmit',    label: 'transmisión',       marker: 'open' },
  contradiccion:    { key: 'contra',      label: 'contradicción',     marker: 'bar'  },
  retroalimentacion:{ key: 'feedback',    label: 'retroalimentación', marker: 'tri'  },
  contagio:         { key: 'contagion',   label: 'contagio',          marker: 'dot'  },
  perdida:          { key: 'loss',        label: 'pérdida',           marker: null   },
  demora:           { key: 'delay',       label: 'demora',            marker: 'open' },
  bifurcacion:      { key: 'fork',        label: 'bifurcación',       marker: 'open' },
  observacion:      { key: 'observe',     label: 'observación',       marker: 'ring' },
};
const ARROW_KEYS = Object.keys(ARROWS);

function ensureDefs() {
  if (document.getElementById('emc-defs')) return;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('id', 'emc-defs');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <marker id="mk-tri" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
      <marker id="mk-open" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
        <path d="M0,0 L9,5 L0,10" fill="none" stroke="currentColor" stroke-width="1.4"/></marker>
      <marker id="mk-dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <circle cx="5" cy="5" r="3.2" fill="currentColor"/></marker>
      <marker id="mk-ring" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.2"/></marker>
      <marker id="mk-bar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="8" markerHeight="10" orient="auto-start-reverse">
        <path d="M6,0 L6,10" stroke="currentColor" stroke-width="1.8"/></marker>
    </defs>`;
  document.body.appendChild(svg);
}

/* ------------------------------------------------------------------ */
/*  Fábrica de composición                                             */
/* ------------------------------------------------------------------ */
function newComp(family, cats, op) {
  ensureDefs();
  const el = document.createElement('div');
  el.className = 'comp comp--' + family;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'wires');
  svg.setAttribute('viewBox', `0 0 ${PAGE_W} ${PAGE_H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const g = document.createElementNS(SVGNS, 'g');
  svg.appendChild(g);
  el.appendChild(svg);
  return {
    el, svg, wires: g, _order: 0,
    meta: { family, cats: cats || [], op: op || '', nodes: [], arrows: [], density: 0, openNodes: [] },
  };
}

/* ------------------------------------------------------------------ */
/*  Nodos (HTML) y texto libre                                          */
/* ------------------------------------------------------------------ */
function mkNode(comp, x, y, html, opt = {}) {
  const n = document.createElement('div');
  n.className = 'node' + (opt.cls ? ' ' + opt.cls : '');
  n.innerHTML = html;
  n.style.left = x + 'px';
  n.style.top = y + 'px';
  if (opt.w) n.style.width = opt.w + 'px';
  if (opt.rot) n.style.transform = `translate(-50%,-50%) rotate(${opt.rot}deg)`;
  else n.style.transform = 'translate(-50%,-50%)';
  n.dataset.order = comp._order++;
  n.classList.add('reveal');
  comp.el.appendChild(n);
  const hw = (opt.w ? opt.w : (opt.hw || 150)) / 2;
  const lines = String(html).split(/<br|<\/div>|\n/).length;
  const hh = (opt.h ? opt.h : lines * (opt.big ? 46 : 20) + 24) / 2;
  const box = { cx: x, cy: y, hw, hh, el: n };
  comp.meta.nodes.push(box);
  return box;
}

function mkText(comp, x, y, text, opt = {}) {
  const t = document.createElement('div');
  t.className = 'txt' + (opt.cls ? ' ' + opt.cls : '');
  t.innerHTML = text;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  if (opt.center || opt.rot) {
    const tf = [];
    if (opt.center) tf.push('translate(-50%,-50%)');
    if (opt.rot) tf.push(`rotate(${opt.rot}deg)`);
    t.style.transform = tf.join(' ');
    t.dataset.fixedtf = '1';
  }
  if (opt.w) t.style.width = opt.w + 'px';
  t.dataset.order = comp._order++;
  t.classList.add('reveal');
  comp.el.appendChild(t);
  return t;
}

/* ------------------------------------------------------------------ */
/*  Flechas                                                             */
/* ------------------------------------------------------------------ */
function boxEdge(box, tx, ty) {
  const dx = tx - box.cx, dy = ty - box.cy;
  if (!dx && !dy) return { x: box.cx, y: box.cy };
  const sx = box.hw / Math.abs(dx || 1e-6);
  const sy = box.hh / Math.abs(dy || 1e-6);
  const s = Math.min(sx, sy);
  return { x: box.cx + dx * s, y: box.cy + dy * s };
}
function pathEl(d, kind, markerId) {
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('class', 'wire wire--' + kind);
  p.setAttribute('fill', 'none');
  if (markerId) p.setAttribute('marker-end', `url(#${markerId})`);
  return p;
}
function mkArrow(comp, A, B, type, opt = {}) {
  const t = ARROWS[type] || ARROWS.dependencia;
  const a = A.cx != null ? A : { cx: A.x, cy: A.y, hw: 0, hh: 0 };
  const b = B.cx != null ? B : { cx: B.x, cy: B.y, hw: 0, hh: 0 };
  const s = boxEdge(a, b.cx, b.cy);
  const e = boxEdge(b, a.cx, a.cy);
  const marker = t.marker ? 'mk-' + t.marker : null;
  let d;
  if (type === 'retroalimentacion' || opt.curve) {
    const mx = (s.x + e.x) / 2, my = (s.y + e.y) / 2;
    const nx = -(e.y - s.y), ny = (e.x - s.x);
    const len = Math.hypot(nx, ny) || 1;
    const off = (opt.curve || Math.min(PAGE_W, PAGE_H) * 0.08);
    d = `M${s.x},${s.y} Q${mx + nx / len * off},${my + ny / len * off} ${e.x},${e.y}`;
  } else {
    d = `M${s.x},${s.y} L${e.x},${e.y}`;
  }
  const p = pathEl(d, t.key, marker);
  comp.wires.appendChild(p);
  if (type === 'contradiccion') p.setAttribute('marker-start', 'url(#mk-bar)');
  if (type === 'contagio') addTicks(comp, s, e);
  if (type === 'perdida') p.classList.add('fade-out-end');
  comp.meta.arrows.push({ el: p, type });
  if (opt.label) {
    const mx = (s.x + e.x) / 2, my = (s.y + e.y) / 2;
    mkText(comp, mx, my - 8, opt.label, { cls: 'wire-label', center: true });
  }
  return p;
}
function addTicks(comp, s, e) {
  const n = 3;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = s.x + (e.x - s.x) * t, y = s.y + (e.y - s.y) * t;
    const nx = -(e.y - s.y), ny = (e.x - s.x), L = Math.hypot(nx, ny) || 1;
    const tick = pathEl(`M${x - nx / L * 6},${y - ny / L * 6} L${x + nx / L * 6},${y + ny / L * 6}`, 'contagion', null);
    tick.classList.add('tick');
    comp.wires.appendChild(tick);
  }
}

function mkLegend(comp, x, y, corruption = 0) {
  const box = document.createElement('div');
  box.className = 'legend reveal';
  box.style.left = x + 'px';
  box.style.top = y + 'px';
  box.dataset.order = comp._order++;
  const keys = shuffle(ARROW_KEYS).slice(0, rint(4, 7));
  let rows = `<div class="legend-h">LEYENDA · fig. ${padZero(rint(1, 99))}</div>`;
  for (const k of keys) {
    const a = ARROWS[k];
    let label = a.label;
    if (chance(corruption)) label = ARROWS[pick(ARROW_KEYS)].label;
    rows += `<div class="legend-row" data-corrupt="${chance(corruption) ? 1 : 0}">
      <svg viewBox="0 0 60 12" class="legend-mini"><path d="M2,6 L52,6" class="wire wire--${a.key}"
        ${a.marker ? `marker-end="url(#mk-${a.marker})"` : ''} fill="none"/></svg>
      <span class="mut">${label}</span></div>`;
  }
  box.innerHTML = rows;
  comp.el.appendChild(box);
  return box;
}

/* rejilla proporcional de puntos */
function gridPoints(cols, rows, jitFrac = 0) {
  const pts = [];
  const x0 = M() + PAGE_W * 0.02, y0 = bandTop();
  const w = PAGE_W - (M() + PAGE_W * 0.02) * 2, h = bandBot() - bandTop();
  const jx = jitFrac * PAGE_W, jy = jitFrac * PAGE_H;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pts.push({
        x: x0 + (cols === 1 ? w / 2 : (w * c) / (cols - 1)) + (jitFrac ? rflt(-jx, jx, 0) : 0),
        y: y0 + (rows === 1 ? h / 2 : (h * r) / (rows - 1)) + (jitFrac ? rflt(-jy, jy, 0) : 0),
      });
  return pts;
}

/* pequeño diagrama incrustado (diagramas dentro de diagramas) */
function miniWires(comp, cx, cy, r) {
  const pts = [];
  const n = rint(3, 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rflt(-0.3, 0.3, 2);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, hw: 0, hh: 0 });
  }
  for (let i = 0; i < n; i++) {
    const dot = pathEl(`M${pts[i].x - 2},${pts[i].y} a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0`, 'depend', null);
    dot.classList.add('mini-dot'); comp.wires.appendChild(dot);
    mkArrow(comp, pts[i], pts[(i + 1) % n], pick(ARROW_KEYS));
  }
}

/* ==================================================================== */
/*  FAMILIAS DE PÁGINAS                                                  */
/* ==================================================================== */

function famCausalMap(st) {
  const cats = chooseCats(4);
  const comp = newComp('causal', cats, 'conectar');
  const cols = isWide() ? 4 : 3, rows = 3;
  const pts = gridPoints(cols, rows, 0.02).filter(() => chance(0.66)).slice(0, rint(5, 8));
  const boxes = pts.map((p, i) => mkNode(comp, p.x, p.y,
    `<span class="n-id">${String.fromCharCode(65 + i)}</span> ${nodeLabel(pick(cats))}`,
    { w: Math.min(PAGE_W * 0.24, rint(150, 230)), cls: chance(0.3) ? 'node--heavy' : '' }));
  for (let i = 0; i < boxes.length; i++) {
    const targets = shuffle(boxes.filter((_, j) => j !== i)).slice(0, rint(1, 2));
    for (const t of targets) {
      mkArrow(comp, boxes[i], t, pick(['transformacion', 'dependencia', 'contagio', 'perdida', 'demora']));
      if (chance(0.4)) mkArrow(comp, t, boxes[i], 'contradiccion');
    }
  }
  mkLegend(comp, PX(0.72), PY(0.8), st.corruption);
  mkText(comp, M(), PY(0.9), weave(cats).lines.join('<br>'), { cls: 'foot mono', w: textW(0.5) });
  mkText(comp, M(), PY(0.07), 'MAPA CAUSAL · las causas se contradicen', { cls: 'mono head' });
  comp.meta.openNodes = boxes.length ? [nodeLabel(pick(cats))] : [];
  return comp;
}

function famDecisionTree(st) {
  const cats = chooseCats(3);
  const comp = newComp('decision', cats, 'ejecutar');
  const root = mkNode(comp, PX(0.5), PY(0.16), `¿${acc(cats[0])} ${nodo(cats[1])}?`, { w: Math.min(PAGE_W * 0.4, 340), cls: 'node--diamond' });
  const optN = isWide() ? rint(3, 5) : 3;
  const opts = [];
  for (let i = 0; i < optN; i++) {
    const o = mkNode(comp, colX(i, optN), PY(0.44),
      pick(['sí', 'no', 'tal vez', 'depende', 'ya no', 'nunca']) + '<br><span class="micro">' + short(nodo(pick(cats))) + '</span>',
      { w: Math.min(PAGE_W * 0.18, 170) });
    mkArrow(comp, root, o, 'bifurcacion', { label: pick(['si', 'no', '?', '≈']) });
    opts.push(o);
  }
  const leaf = mkNode(comp, PX(0.5), PY(0.74), fragOf(cats[2]), { w: textW(0.44), cls: 'node--heavy' });
  for (const o of opts) mkArrow(comp, o, leaf, pick(['dependencia', 'demora', 'perdida']));
  mkText(comp, PX(0.5), PY(0.83), 'todas las ramas conducen al mismo residuo', { cls: 'foot center', center: true });
  mkLegend(comp, M(), PY(0.82), st.corruption);
  mkText(comp, M(), PY(0.93), weave(cats).lines.join('<br>'), { cls: 'mono dim', w: textW(0.5) });
  comp.meta.openNodes = ['rama abierta'];
  return comp;
}

function famCircuit(st) {
  const cats = ['NETWORK', 'BODY', 'CODE'];
  const comp = newComp('circuit', cats, 'conectar');
  mkText(comp, M(), PY(0.08), '+V :: ' + fragOf('MATTER'), { cls: 'rail mono' });
  const chain = ['antena', 'célula', 'sílaba', 'nodo', 'pulmón', 'verbo', 'servidor', 'nervio', 'músculo', 'índice'];
  const picks = pickN(chain, isWide() ? rint(3, 4) : rint(3, 5));
  const boxes = [];
  let prev = null;
  picks.forEach((c, i) => {
    const b = mkNode(comp, PX(0.5) + rflt(-PAGE_W * 0.04, PAGE_W * 0.04, 0), rowY(i, picks.length + 0.6),
      `[ ${c} = ${val()} ${pick(UNITS_ODD)} ]<br><span class="micro">${estado(pick(cats))}</span>`,
      { w: Math.min(PAGE_W * 0.3, 280), cls: 'node--comp' });
    if (prev) mkArrow(comp, prev, b, pick(['transmision', 'dependencia', 'transformacion']));
    prev = b; boxes.push(b);
  });
  mkText(comp, M(), PY(0.92), 'GND :: ' + nodo('RESIDUE'), { cls: 'rail mono' });
  if (boxes.length > 1) {
    const side = mkNode(comp, PX(0.8), PY(0.5), nodeLabel('WEATHER'), { w: Math.min(PAGE_W * 0.2, 180), cls: 'node--ghost' });
    mkArrow(comp, side, boxes[rint(0, boxes.length - 1)], 'contagio');
  }
  mkLegend(comp, PX(0.72), PY(0.14), st.corruption);
  mkText(comp, M(), PY(0.07), 'CIRCUITO · infraestructura + organismo + lenguaje', { cls: 'mono head' });
  comp.meta.openNodes = [short(pick(picks))];
  return comp;
}

function famFlowchart(st) {
  const cats = chooseCats(3);
  const comp = newComp('flow', cats, 'ejecutar');
  const steps = [
    { t: 'INICIO', k: 'term' },
    { t: acc(cats[0]) + ' ' + nodo(cats[1]), k: 'proc' },
    { t: '¿' + nodo(cats[2]) + ' ' + estado(cats[2]) + '?', k: 'dec' },
    { t: 'abrir todas las ventanas<br>que ya no existen', k: 'proc' },
    { t: 'esperar otra época geológica', k: 'proc' },
    { t: 'GOTO paso −1', k: 'term' },
  ];
  const boxes = steps.map((s, i) => mkNode(comp, PX(0.5) + rflt(-PAGE_W * 0.03, PAGE_W * 0.03, 0), rowY(i, steps.length), s.t,
    { w: Math.min(PAGE_W * (s.k === 'dec' ? 0.42 : 0.36), s.k === 'dec' ? 380 : 320),
      cls: s.k === 'dec' ? 'node--diamond' : (s.k === 'term' ? 'node--term' : 'node--proc') }));
  for (let i = 0; i < boxes.length - 1; i++)
    mkArrow(comp, boxes[i], boxes[i + 1], i === 2 ? 'bifurcacion' : 'dependencia', i === 2 ? { label: 'sí→∅' } : {});
  mkArrow(comp, boxes[boxes.length - 1], boxes[0], 'retroalimentacion', { curve: PAGE_W * 0.24, label: 'goto' });
  mkText(comp, M(), PY(0.94), '// esta instrucción se modifica al ejecutarse', { cls: 'mono dim' });
  mkText(comp, M(), PY(0.07), 'DIAGRAMA DE FLUJO · con instrucciones imposibles', { cls: 'mono head' });
  mkLegend(comp, PX(0.73), PY(0.82), st.corruption);
  comp.meta.openNodes = ['paso −1'];
  return comp;
}

function famNetwork(st) {
  const cats = chooseCats(3);
  const comp = newComp('network', cats, 'mapa');
  const N = rint(8, 13);
  const boxes = [];
  const cx = PX(0.5), cy = PY(0.5), R = MIN() * 0.36;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + rflt(-0.2, 0.2, 3);
    const rr = R * rflt(0.5, 1, 2);
    boxes.push(mkNode(comp, cx + Math.cos(a) * rr * (PAGE_W / MIN()), cy + Math.sin(a) * rr * (PAGE_H / MIN()),
      short(nodeLabel(pick(cats))), { w: rint(80, 150), cls: 'node--peer' }));
  }
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < rint(1, 3); k++) {
      const j = rint(0, N - 1);
      if (j === i) continue;
      const key = Math.min(i, j) + '-' + Math.max(i, j);
      if (seen.has(key)) continue; seen.add(key);
      mkArrow(comp, boxes[i], boxes[j], pick(['transmision', 'perdida', 'observacion', 'demora']));
    }
  }
  mkText(comp, cx, cy, 'sin nodo central', { cls: 'center dim', center: true });
  mkText(comp, M(), PY(0.07), 'TOPOLOGÍA ' + padZero(rint(0, 99)) + ' · la malla no se cae del todo', { cls: 'mono head' });
  mkLegend(comp, M(), PY(0.82), st.corruption);
  comp.meta.openNodes = [short(nodeLabel(pick(cats)))];
  return comp;
}

function famWeather(st) {
  const cats = ['WEATHER', pick(['MEMORY', 'BODY', 'CODE']), pick(['ERROR', 'TIME', 'LABOR'])];
  const comp = newComp('weather', cats, 'medir');
  mkText(comp, M(), PY(0.07), 'PRONÓSTICO COMPUTACIONAL · ' + padZero(rint(0, 99)) + 'h', { cls: 'mono head' });
  const cols = isWide() ? 7 : 5, rows = isWide() ? 4 : 6;
  const moods = ['☁', '☂', '☀', '☂', '≈', '░', '▓', '✳', '∿', '◐', '☁', '×'];
  const x0 = M(), y0 = PY(0.13), cw = (PAGE_W - M() * 2) / cols, ch = (bandBot() - y0) / rows;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      mkNode(comp, x0 + cw * c + cw / 2, y0 + ch * r + ch / 2,
        `<span class="mood">${pick(moods)}</span><br><span class="micro">${estado(pick(cats))}</span>`,
        { w: cw - 14, cls: 'cell' });
  for (let k = 0; k < 3; k++) {
    let d = `M0,${y0 + rint(60, ch * rows)} `;
    for (let x = 0; x <= PAGE_W; x += PAGE_W / 8) d += `Q${x + PAGE_W / 16},${y0 + rint(40, ch * rows)} ${x + PAGE_W / 8},${y0 + rint(40, ch * rows)} `;
    const iso = pathEl(d, 'observe', null); iso.classList.add('isobar'); comp.wires.appendChild(iso);
  }
  mkText(comp, M(), PY(0.91), 'estado de ánimo del sistema: ' + estado(cats[1]) + '<br>' + fragOf('WEATHER'), { cls: 'mono foot', w: textW(0.6) });
  comp.meta.openNodes = ['frente sin nombre'];
  return comp;
}

function famMemory(st) {
  const cats = ['MEMORY', pick(['BODY', 'RESIDUE', 'TIME']), pick(['ERROR', 'CODE', 'WORLD'])];
  const comp = newComp('memory', cats, 'clasificar');
  mkText(comp, M(), PY(0.07), 'MAPA DE MEMORIA · 0x' + rint(1000, 9999).toString(16).toUpperCase(), { cls: 'mono head' });
  const cols = isWide() ? 12 : 8, rows = isWide() ? 7 : 10;
  const x0 = M(), y0 = PY(0.13), cw = (PAGE_W - M() * 2) / cols, ch = (bandBot() - y0) / rows;
  let corruptAddr = null;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const corrupt = chance(0.22);
      const addr = '0x' + (r * cols + c).toString(16).padStart(2, '0').toUpperCase();
      let inner;
      if (corrupt) { inner = pick(['▓▓', '░▓', '██', '▚▚', '??', '×']); corruptAddr = addr; }
      else inner = chance(0.3) ? short(nodeLabel(pick(cats))) : pick(['··', 'ok', pick(GLYPHS), rint(0, 99) + '']);
      mkNode(comp, x0 + cw * c + cw / 2, y0 + ch * r + ch / 2, `<span class="micro addr">${addr}</span><br>${inner}`,
        { w: cw - 6, cls: 'cell ' + (corrupt ? 'cell--corrupt' : '') });
    }
  mkText(comp, M(), PY(0.92), 'sector ' + (corruptAddr || '0x??') + ' corrupto — ' + fragOf('MEMORY'), { cls: 'mono foot', w: textW(0.7) });
  comp.meta.openNodes = [corruptAddr || 'sector perdido'];
  comp.meta.forcedError = corruptAddr != null;
  return comp;
}

function famMismatchTable(st) {
  const cats = chooseCats(4);
  const comp = newComp('table', cats, 'medir');
  mkText(comp, M(), PY(0.07), 'TABLA ' + padZero(rint(0, 99)) + ' · medidas incompletas', { cls: 'mono head' });
  const rowsN = isWide() ? rint(7, 11) : rint(6, 9);
  let html = '<table class="mismatch"><thead><tr>';
  ['magnitud', 'valor', 'unidad', 'estado'].forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  for (let i = 0; i < rowsN; i++) {
    const cat = pick(cats);
    const mv = chance(0.5) ? fragOf(cat).split(' ').slice(0, 3).join(' ') : val();
    html += `<tr><td>${nodo(cat)}</td>
      <td class="${/[a-z]/i.test(mv) && !/^NaN|aprend/.test(mv) ? 'wrongtype' : ''}">${mv}</td>
      <td>${pick(UNITS_ODD)}</td><td class="dim">${estado(cat)}</td></tr>`;
  }
  html += '</tbody></table>';
  mkText(comp, M(), PY(0.14), html, { cls: 'table-wrap', w: PAGE_W - M() * 2 });
  mkText(comp, M(), PY(0.92), '⚠ las unidades no corresponden con los valores medidos', { cls: 'mono foot' });
  comp.meta.openNodes = ['columna sin unidad'];
  return comp;
}

function famTimeline(st) {
  const cats = chooseCats(3);
  const comp = newComp('timeline', cats, 'causa');
  mkText(comp, M(), PY(0.08), 'LÍNEA DE TIEMPO · recursiva', { cls: 'mono head' });
  const y = PY(0.5);
  comp.wires.appendChild(pathEl(`M${M()},${y} L${PAGE_W - M()},${y}`, 'depend', 'mk-open'));
  const labels = ['ahora', 'antes', 'después', 'antes del antes', 'ya', 'nunca', 'luego'];
  const N = isWide() ? rint(6, 8) : rint(5, 6);
  const boxes = [];
  for (let i = 0; i < N; i++) {
    const x = colX(i, N);
    const b = mkNode(comp, x, i % 2 === 0 ? y - PY(0.11) : y + PY(0.11),
      pick(labels) + '<br><span class="micro">' + short(nodeLabel(pick(cats))) + '</span>', { w: Math.min(PAGE_W * 0.16, 160) });
    mkArrow(comp, { x, y }, b, 'observacion');
    boxes.push({ b, x });
  }
  mkArrow(comp, boxes[rint(2, boxes.length - 1)].b, boxes[rint(0, 1)].b, 'retroalimentacion', { curve: PAGE_H * 0.14, label: 'causa' });
  mkText(comp, M(), PY(0.9), 'el efecto quedó anotado antes que su causa', { cls: 'mono foot' });
  comp.meta.openNodes = ['antes del antes'];
  return comp;
}

function famClassDiagram(st) {
  const comp = newComp('class', [], 'clasificar');
  const specs = [classSpec(), classSpec(), (isWide() || chance(0.6)) ? classSpec() : null].filter(Boolean);
  comp.meta.cats = specs.flatMap(s => s.cats).slice(0, 4);
  const positions = isWide()
    ? [{ x: PX(0.24), y: PY(0.42) }, { x: PX(0.54), y: PY(0.62) }, { x: PX(0.8), y: PY(0.38) }]
    : [{ x: PX(0.3), y: PY(0.34) }, { x: PX(0.7), y: PY(0.56) }, { x: PX(0.4), y: PY(0.76) }];
  const boxes = specs.map((s, i) => {
    const html = `<div class="cls-name">${s.name}</div>
      <div class="cls-attrs">${s.attrs.map(a => '· ' + a).join('<br>')}</div>
      <div class="cls-methods">${s.methods.map(m => '+ ' + m).join('<br>')}</div>`;
    return mkNode(comp, positions[i].x, positions[i].y, html, { w: Math.min(PAGE_W * 0.26, 280), cls: 'uml' });
  });
  for (let i = 0; i < boxes.length - 1; i++)
    mkArrow(comp, boxes[i + 1], boxes[i], pick(['dependencia', 'transformacion', 'contradiccion']),
      { label: pick(['hereda', 'usa', 'niega', 'contiene']) });
  mkText(comp, M(), PY(0.07), 'DIAGRAMA DE CLASES · objetos del mundo', { cls: 'mono head' });
  mkText(comp, M(), PY(0.92), 'nota: ninguno de estos objetos aceptó ser instanciado', { cls: 'mono foot' });
  mkLegend(comp, PX(0.74), PY(0.14), st.corruption);
  comp.meta.openNodes = [specs[0].name];
  return comp;
}

function famContaminated(st) {
  const cats = ['CODE', 'MATTER', 'LABOR'];
  const comp = newComp('arch', cats, 'conectar');
  mkText(comp, M(), PY(0.07), 'ARQUITECTURA · contaminada', { cls: 'mono head' });
  const layers = ['interfaz', 'lógica', 'modelo del mundo', 'persistencia', 'hardware'];
  const boxes = layers.map((L, i) => mkNode(comp, PX(0.5), rowY(i, layers.length), L.toUpperCase(),
    { w: Math.min(PAGE_W * 0.55, 560), cls: 'layer' }));
  for (let i = 0; i < boxes.length - 1; i++) mkArrow(comp, boxes[i], boxes[i + 1], 'dependencia');
  for (const cont of pickN(['polvo', 'calor', 'deseo', 'trabajo', 'óxido', 'ruido'], rint(3, 4))) {
    const side = chance(0.5);
    const b = mkNode(comp, side ? PX(0.12) : PX(0.88), rowY(rint(0, layers.length - 1), layers.length) + rflt(-PY(0.03), PY(0.03), 0),
      cont, { w: Math.min(PAGE_W * 0.13, 120), cls: 'node--dust' });
    mkArrow(comp, b, boxes[rint(0, boxes.length - 1)], 'contagio');
  }
  mkText(comp, M(), PY(0.92), 'el modelo del mundo se calienta y empieza a mentir', { cls: 'mono foot' });
  mkLegend(comp, PX(0.74), PY(0.82), st.corruption);
  comp.meta.openNodes = ['capa contaminada'];
  return comp;
}

function famSignalNoise(st) {
  const cats = ['NETWORK', pick(['MEMORY', 'BODY']), 'RESIDUE'];
  const comp = newComp('signal', cats, 'medir');
  mkText(comp, M(), PY(0.08), 'SEÑAL vs RUIDO', { cls: 'mono head' });
  const w = PAGE_W - M() * 2;
  let sig = `M${M()},${PY(0.3)} `;
  for (let x = 0; x <= w; x += 8) sig += `L${M() + x},${PY(0.3) + Math.sin(x / 40) * PY(0.02)} `;
  const sp = pathEl(sig, 'depend', null); sp.classList.add('signal-line'); comp.wires.appendChild(sp);
  mkText(comp, PAGE_W - M(), PY(0.28), 'señal', { cls: 'micro' });
  let noise = `M${M()},${PY(0.58)} `;
  for (let x = 0; x <= w; x += 5) noise += `L${M() + x},${PY(0.58) + rint(-PY(0.1), PY(0.1))} `;
  const np = pathEl(noise, 'contagion', null); np.classList.add('noise-line'); comp.wires.appendChild(np);
  mkText(comp, M(), PY(0.46), 'RUIDO', { cls: 'head big-label' });
  for (let i = 0; i < 6; i++)
    mkText(comp, M() + rint(0, w - 120), PY(0.54) + rint(-PY(0.09), PY(0.09)), microLine(cats).text, { cls: 'micro noise-text', rot: rint(-6, 6) });
  mkText(comp, M(), PY(0.92), 'SNR = ' + rint(-20, 3) + ' dB — el ruido dice más que la señal', { cls: 'mono foot' });
  comp.meta.openNodes = ['banda de ruido'];
  return comp;
}

function famDrift(st) {
  const cats = chooseCats(3);
  const comp = newComp('coord', cats, 'medir');
  mkText(comp, M(), PY(0.07), 'SISTEMA DE COORDENADAS · inestable', { cls: 'mono head' });
  const cx = PX(0.5), cy = PY(0.5);
  for (const [dx, dy, rot, cls] of [[0, 0, 0, 'axis'], [rint(20, 60), rint(-40, 40), rflt(3, 9, 1), 'axis axis--drift']]) {
    const ax = pathEl(`M${M() + dx},${cy + dy} L${PAGE_W - M() + dx},${cy + dy}`, 'depend', 'mk-open');
    const ay = pathEl(`M${cx + dx},${PY(0.14) + dy} L${cx + dx},${PY(0.86) + dy}`, 'depend', 'mk-open');
    ax.classList.add(...cls.split(' ')); ay.classList.add(...cls.split(' '));
    if (rot) { ax.setAttribute('transform', `rotate(${rot} ${cx} ${cy})`); ay.setAttribute('transform', `rotate(${rot} ${cx} ${cy})`); }
    comp.wires.appendChild(ax); comp.wires.appendChild(ay);
  }
  const px = cx + rflt(-PX(0.2), PX(0.2), 0), py = cy + rflt(-PY(0.2), PY(0.2), 0);
  mkNode(comp, px, py, '●<br><span class="micro">medición 1</span>', { w: 100, cls: 'node--pt' });
  mkNode(comp, px + rint(40, 90), py + rint(30, 80), '○<br><span class="micro">medición 2</span>', { w: 100, cls: 'node--pt ghost' });
  mkText(comp, M(), PY(0.92), 'el eje se movió mientras medíamos ' + nodo(cats[0]), { cls: 'mono foot' });
  comp.meta.openNodes = ['origen desplazado'];
  return comp;
}

function famScatteredCode(st) {
  const cats = chooseCats(4);
  const comp = newComp('scatter', cats, 'ejecutar');
  const n = isWide() ? rint(5, 7) : rint(4, 6);
  const blocks = [];
  for (let i = 0; i < n; i++) {
    const f = weave(pickN(cats, 3));
    const x = rint(M(), PAGE_W - M() - PAGE_W * 0.3);
    const y = rint(PY(0.12), PY(0.82));
    const t = mkText(comp, x, y, f.lines.join('<br>'),
      { cls: 'mono block', w: Math.min(PAGE_W * 0.34, rint(260, 400)), rot: chance(0.4) ? rint(-4, 4) : 0 });
    blocks.push({ x: x + 120, y: y + 30, el: t });
  }
  for (let i = 0; i < blocks.length - 1; i++)
    if (chance(0.6)) mkArrow(comp, { x: blocks[i].x, y: blocks[i].y }, { x: blocks[i + 1].x, y: blocks[i + 1].y }, pick(['perdida', 'demora', 'observacion']));
  mkText(comp, M(), PY(0.07), 'PSEUDOCÓDIGO DISTRIBUIDO · sin punto de entrada', { cls: 'mono dim' });
  comp.meta.openNodes = ['función sin llamar'];
  return comp;
}

function famGloss(st) {
  const cats = chooseCats(3);
  const comp = newComp('gloss', cats, 'desobedecer');
  const a = mkNode(comp, PX(0.3), PY(0.3), nodeLabel(cats[0]), { w: Math.min(PAGE_W * 0.2, 200) });
  const b = mkNode(comp, PX(0.68), PY(0.3), nodeLabel(cats[1]), { w: Math.min(PAGE_W * 0.2, 200) });
  mkArrow(comp, a, b, 'transformacion', { label: 'transforma' });
  const c = mkNode(comp, PX(0.5), PY(0.47), nodeLabel(cats[2]), { w: Math.min(PAGE_W * 0.2, 200) });
  mkArrow(comp, b, c, 'dependencia');
  mkText(comp, M(), PY(0.62),
    'GLOSA. En la figura, ' + short(nodo(cats[0])) + ' <em>no</em> transforma nada:<br>'
    + 'permanece idéntico mientras ' + nodo(cats[2]) + ' ' + acc(cats[2]) + '.<br>'
    + 'La flecha miente. La imagen obedece a otra ley.', { cls: 'gloss-txt', w: textW(0.62) });
  mkText(comp, M(), PY(0.07), 'FIG. ' + rint(1, 99) + ' con glosa contradictoria', { cls: 'mono head' });
  mkLegend(comp, PX(0.74), PY(0.14), Math.max(st.corruption, 0.5));
  comp.meta.openNodes = ['flecha que miente'];
  return comp;
}

function famPhantomIndex(st) {
  const cats = chooseCats(4);
  const comp = newComp('index', cats, 'marginal');
  mkText(comp, M(), PY(0.1), 'ÍNDICE', { cls: 'index-title' });
  mkText(comp, M(), PY(0.17), 'de páginas que este poemario no contiene', { cls: 'mono dim' });
  const N = isWide() ? rint(8, 11) : rint(9, 13);
  const y0 = PY(0.24), step = (bandBot() - y0) / N;
  for (let i = 0; i < N; i++) {
    const cat = pick(cats);
    const title = cap(nodo(cat)) + ' ' + pick(['que', 'sin', 'y su', 'contra el']) + ' ' + short(nodo(pick(cats)));
    const pageno = chance(0.3) ? pick(['—', '∞', '404', 'ø', 'π']) : rint(3, 999);
    mkText(comp, M(), y0 + step * i, `<span class="idx-t">${title}</span><span class="idx-dots"></span><span class="idx-p">${pageno}</span>`,
      { cls: 'idx-row', w: PAGE_W - M() * 2 });
  }
  mkText(comp, M(), PY(0.92), 'ninguna de estas páginas fue jamás compilada', { cls: 'mono foot' });
  comp.meta.openNodes = ['p. ' + rint(100, 999)];
  return comp;
}

function famErrorPoem(st) {
  const cats = chooseCats(3);
  const comp = newComp('errpoem', cats, 'error');
  const code = rint(400, 599);
  mkText(comp, PX(0.5), PY(0.18), 'ERROR', { cls: 'err-mega center', center: true });
  mkText(comp, PX(0.5), PY(0.3), String(code), { cls: 'err-code center', center: true });
  const body = [
    fragOf(cats[0]),
    nodo(cats[1]) + ' ' + acc(cats[1]) + ' donde debía ' + acc(cats[2]),
    'el modelo recibió el mundo',
    'pero no encontró dónde guardarlo',
    '', 'traza:',
    '  en ' + nodo(cats[0]) + ' (línea ' + rint(1, 999) + ')',
    '  en ' + nodo(cats[1]) + ' (línea ' + rint(1, 999) + ')',
    '  en el origen (sin línea)',
  ];
  mkText(comp, PX(0.5), PY(0.55), body.join('<br>'), { cls: 'err-body center mono', center: true, w: textW(0.64) });
  mkText(comp, PX(0.5), PY(0.9), 'reintentar en ' + rint(1, 999) + ' ms · ' + estado('ERROR'), { cls: 'mono dim center blink', center: true });
  comp.meta.openNodes = ['excepción no atrapada'];
  comp.meta.forcedError = true;
  comp.meta.persist = true;
  return comp;
}

function famOverflow(st) {
  const cats = chooseCats(5);
  const comp = newComp('overflow', cats, 'conectar');
  const N = rint(18, 30);
  const boxes = [];
  for (let i = 0; i < N; i++)
    boxes.push(mkNode(comp, rint(-PAGE_W * 0.06, PAGE_W * 1.06), rint(PY(0.03), PY(1.03)),
      short(nodeLabel(pick(cats))), { w: rint(80, 170), cls: 'node--peer' }));
  for (let i = 0; i < N; i++)
    for (let k = 0; k < rint(1, 2); k++) { const j = rint(0, N - 1); if (j !== i) mkArrow(comp, boxes[i], boxes[j], pick(ARROW_KEYS)); }
  mkText(comp, M(), PY(0.06), 'DIAGRAMA ' + padZero(rint(0, 99)) + ' · sólo legible en parte', { cls: 'mono dim' });
  comp.meta.openNodes = ['nodo fuera de página', short(nodeLabel(pick(cats)))];
  comp.meta.overflow = true;
  return comp;
}

function famMonument(st) {
  const cats = chooseCats(3);
  const comp = newComp('monument', cats, 'repetir');
  const word = short(nodo(cats[0])).toUpperCase();
  mkText(comp, PX(0.5), PY(0.5), word, { cls: 'monument center', center: true });
  for (let i = 0; i < rint(7, 12); i++)
    mkText(comp, rint(M(), PAGE_W - M() - PAGE_W * 0.2), rint(PY(0.09), PY(0.9)),
      microLine(cats).text, { cls: 'micro', rot: chance(0.3) ? rint(-90, 90) : 0 });
  mkText(comp, M(), PY(0.93), weave(cats).lines.join(' · '), { cls: 'mono foot', w: textW(0.72) });
  comp.meta.openNodes = [word.toLowerCase()];
  return comp;
}

/* NUEVA · diagrama dentro de diagrama */
function famNested(st) {
  const cats = chooseCats(4);
  const comp = newComp('nested', cats, 'repetir');
  mkText(comp, M(), PY(0.07), 'DIAGRAMA DENTRO DE DIAGRAMA · fig. ' + rint(1, 99), { cls: 'mono head' });
  const outer = [];
  const n = isWide() ? 4 : 3;
  for (let i = 0; i < n; i++) {
    const b = mkNode(comp, colX(i, n), i % 2 ? PY(0.62) : PY(0.36),
      '<div class="nest-name">' + short(nodeLabel(pick(cats))) + '</div><div class="nest-slot"></div>',
      { w: Math.min(PAGE_W * 0.22, 230), cls: 'node--nest', h: PAGE_H * 0.14 });
    outer.push(b);
    miniWires(comp, b.cx, b.cy + PY(0.02), Math.min(PAGE_W * 0.05, 52));
  }
  for (let i = 0; i < outer.length - 1; i++) mkArrow(comp, outer[i], outer[i + 1], pick(['dependencia', 'transformacion', 'contagio']));
  mkArrow(comp, outer[outer.length - 1], outer[0], 'retroalimentacion', { curve: PAGE_H * 0.1 });
  mkText(comp, M(), PY(0.92), 'cada nodo contiene un mundo que no termina de caber', { cls: 'mono foot' });
  comp.meta.openNodes = ['nodo recursivo'];
  return comp;
}

/* NUEVA · estratos (memoria geológica con capas corruptas) */
function famStrata(st) {
  const cats = ['MEMORY', 'MATTER', pick(['TIME', 'RESIDUE', 'WORLD'])];
  const comp = newComp('strata', cats, 'clasificar');
  mkText(comp, M(), PY(0.07), 'CORTE ESTRATIGRÁFICO · memoria del sistema', { cls: 'mono head' });
  const N = rint(6, 9);
  const y0 = PY(0.13), h = (bandBot() - y0) / N;
  for (let i = 0; i < N; i++) {
    const corrupt = chance(0.28);
    const y = y0 + h * i + h / 2;
    mkNode(comp, PX(0.5), y,
      `<span class="strata-depth">−${(i + 1) * rint(10, 90)} ${pick(['m', 'años', 'capas', 'µm'])}</span>  ${corrupt ? '▓▓ ' : ''}${fragOf(pick(cats))}`,
      { w: PAGE_W - M() * 2, cls: 'strata-band ' + (corrupt ? 'cell--corrupt' : '') });
    if (i > 0 && chance(0.5)) mkText(comp, PX(0.5), y - h / 2, pick(['discordancia', 'hiato', 'falla', 'contacto neto']),
      { cls: 'micro center', center: true });
  }
  mkText(comp, M(), PY(0.92), 'lo más profundo es lo primero que se olvidó', { cls: 'mono foot' });
  comp.meta.openNodes = ['capa −' + rint(100, 900)];
  return comp;
}

/* NUEVA · glosario de unidades inventadas */
function famLexicon(st) {
  const cats = chooseCats(4);
  const comp = newComp('lexicon', cats, 'medir');
  mkText(comp, M(), PY(0.07), 'GLOSARIO DE UNIDADES · sistema métrico averiado', { cls: 'mono head' });
  const cols = isWide() ? 2 : 1;
  const per = isWide() ? rint(4, 5) : rint(6, 8);
  for (let c = 0; c < cols; c++) {
    const x = cols === 1 ? M() : (c === 0 ? M() : PX(0.52));
    const y0 = PY(0.15), step = (bandBot() - y0) / per;
    for (let i = 0; i < per; i++) {
      const u = pick(UNITS_ODD);
      mkText(comp, x, y0 + step * i,
        `<span class="lex-u">${u}</span> — <span class="lex-d">${fragOf(pick(cats))}; se mide ${acc(pick(cats))} ${nodo(pick(cats))}</span>`,
        { cls: 'lex-row', w: (cols === 1 ? PAGE_W - M() * 2 : PAGE_W * 0.42) });
    }
  }
  mkText(comp, M(), PY(0.92), 'ninguna unidad basta para lo que intenta medir', { cls: 'mono foot' });
  comp.meta.openNodes = [pick(UNITS_ODD)];
  return comp;
}

/* ------------------------------------------------------------------ */
/*  Registro de familias                                               */
/* ------------------------------------------------------------------ */
const FAMILIES = [
  { key: 'causal',   build: famCausalMap,     w: 1.1 },
  { key: 'decision', build: famDecisionTree,  w: 1.0 },
  { key: 'circuit',  build: famCircuit,       w: 1.0 },
  { key: 'flow',     build: famFlowchart,     w: 1.0 },
  { key: 'network',  build: famNetwork,       w: 1.0 },
  { key: 'weather',  build: famWeather,       w: 0.9 },
  { key: 'memory',   build: famMemory,        w: 1.0 },
  { key: 'table',    build: famMismatchTable, w: 0.85 },
  { key: 'timeline', build: famTimeline,      w: 0.9 },
  { key: 'class',    build: famClassDiagram,  w: 1.0 },
  { key: 'arch',     build: famContaminated,  w: 0.95 },
  { key: 'signal',   build: famSignalNoise,   w: 0.9 },
  { key: 'coord',    build: famDrift,         w: 0.85 },
  { key: 'scatter',  build: famScatteredCode, w: 1.0 },
  { key: 'gloss',    build: famGloss,         w: 0.8 },
  { key: 'index',    build: famPhantomIndex,  w: 0.7 },
  { key: 'errpoem',  build: famErrorPoem,     w: 0.8 },
  { key: 'overflow', build: famOverflow,      w: 0.75 },
  { key: 'monument', build: famMonument,      w: 0.8 },
  { key: 'nested',   build: famNested,        w: 0.85 },
  { key: 'strata',   build: famStrata,        w: 0.85 },
  { key: 'lexicon',  build: famLexicon,       w: 0.75 },
];

function chooseFamily(st) {
  let total = 0;
  const eff = FAMILIES.map(f => {
    let w = f.w * (st.familyWeights[f.key] || 1);
    if (st.lastFamily === f.key) w *= 0.12;
    total += w;
    return w;
  });
  let r = CONTENT.RNG.next() * total;
  for (let i = 0; i < FAMILIES.length; i++) { r -= eff[i]; if (r <= 0) return FAMILIES[i]; }
  return FAMILIES[0];
}

function buildComposition(st) {
  const fam = chooseFamily(st);
  let comp;
  try { comp = fam.build(st); }
  catch (e) { console.warn('fallo en familia', fam.key, e); comp = famErrorPoem(st); comp.meta.family = fam.key; }
  comp.meta.family = fam.key;
  if (!comp.meta.op) comp.meta.op = '';
  comp.meta.title = pageTitle(comp.meta.op || 'conectar', comp.meta.cats.length ? comp.meta.cats : ['WORLD', 'CODE', 'ERROR']);
  comp.meta.density = comp.meta.nodes.length + comp.meta.arrows.length + Math.round(comp.el.textContent.length / 60);
  return comp;
}

const DIAGRAMS = {
  SIZE, setPageSize, buildComposition, FAMILIES, ARROWS, ARROW_KEYS,
  newComp, mkNode, mkText, mkArrow, mkLegend, ensureDefs, PX, PY, M,
};
if (typeof window !== 'undefined') window.DIAGRAMS = DIAGRAMS;

})();
