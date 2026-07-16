'use strict';

/* =====================================================================
   EL MUNDO NO COMPILA
   engine.js  ::  el director del loop con memoria imperfecta
   ---------------------------------------------------------------------
   El loop no repite el libro: demuestra que el mundo cambia durante el
   intento de representarlo. Cada vuelta muta el mundo, arrastra 5–15%
   de residuo, contamina la portada y vuelve a empezar transformada.
   ===================================================================== */

(function () {
  const { RNG, CAT_NAMES, CAT_WEIGHTS, chooseCats, pick, rint, rflt, chance,
    weave, microLine, val, short, cap, pageTitle, stamp, C, nodo, fragOf, estado } = CONTENT;
  const { buildComposition, mkText } = DIAGRAMS;
  const SZ = DIAGRAMS.SIZE;                 // tamaño vivo de la página (w/h)

  /* --- DOM ------------------------------------------------------- */
  let stage, bookPage, compLayer, residueLayer, furn, hud, statusEl, help, printRoot;

  /* --- estado global persistente -------------------------------- */
  const STATE = {
    seed: null,
    turn: 0,
    pageIndex: 0,
    turnLength: 30,
    mundo: {}, modelo: {},
    unrepresented: 1,
    errorCount: 0,
    wordFreq: {},
    openNodes: [],
    orphans: [],
    maxDensity: 0, maxDensityPage: 0,
    corruption: 0,
    familyWeights: {},
    lastFamily: null,
    current: null,
    residueText: [],
    unresolved: 'mundo',
    speed: 1.35,        // multiplicador de tiempo de lectura (mayor = más lento)
  };

  /* --- control del loop (compuerta pausable) -------------------- */
  let running = false, paused = false;
  let gateResolve = null, gateTimer = null, gateRemaining = 0, gateStart = 0;

  function gate(ms) {
    return new Promise(res => {
      gateResolve = res; gateRemaining = ms; gateStart = performance.now();
      if (!paused) gateTimer = setTimeout(fire, ms);
    });
  }
  function fire() { const r = gateResolve; gateResolve = null; gateTimer = null; if (r) r(); }
  function pauseLoop() {
    if (paused) return;
    paused = true;
    if (gateTimer) { clearTimeout(gateTimer); gateTimer = null; gateRemaining -= performance.now() - gateStart; }
    Anim.pauseAll();
    document.body.classList.add('paused');
    setStatus('[PAUSA] el mundo sigue cambiando aunque el diagrama se detenga');
  }
  function resumeLoop() {
    if (!paused) return;
    paused = false;
    Anim.resumeAll();
    document.body.classList.remove('paused');
    if (gateResolve) { gateStart = performance.now(); gateTimer = setTimeout(fire, Math.max(0, gateRemaining)); }
  }
  function togglePause() { paused ? resumeLoop() : pauseLoop(); }
  function skip() { if (gateTimer) { clearTimeout(gateTimer); gateTimer = null; } if (paused) { paused = false; Anim.resumeAll(); document.body.classList.remove('paused'); } fire(); }

  /* --- semilla -------------------------------------------------- */
  function setSeed(seed) {
    STATE.seed = String(seed);
    RNG.seedFrom(STATE.seed);
    try {
      const u = new URL(location.href);
      u.searchParams.set('seed', STATE.seed);
      history.replaceState(null, '', u);
    } catch (e) { /* ignore */ }
  }
  function randomSeed() { return (Math.random().toString(36).slice(2, 8) + '-' + Date.now().toString(36).slice(-3)); }

  /* --- inicialización del mundo --------------------------------- */
  function initWorld() {
    STATE.turn = 0; STATE.pageIndex = 0;
    STATE.errorCount = 0; STATE.wordFreq = {}; STATE.openNodes = []; STATE.orphans = [];
    STATE.maxDensity = 0; STATE.maxDensityPage = 0; STATE.corruption = 0;
    STATE.familyWeights = {}; STATE.lastFamily = null; STATE.residueText = [];
    STATE.mundo = {}; STATE.modelo = {};
    for (const c of CAT_NAMES) { STATE.mundo[c] = RNG.next(); STATE.modelo[c] = 0; CAT_WEIGHTS[c] = 1; }
    STATE.turnLength = rint(24, 40);
    recomputeUnrepresented();
    residueLayer.innerHTML = '';
  }

  function recomputeUnrepresented() {
    let gap = 0;
    for (const c of CAT_NAMES) gap += Math.abs(STATE.mundo[c] - STATE.modelo[c]);
    STATE.unrepresented = gap / CAT_NAMES.length;
    for (const c of CAT_NAMES) CAT_WEIGHTS[c] = 0.35 + 2.2 * Math.abs(STATE.mundo[c] - STATE.modelo[c]);
  }

  /* =============================================================== */
  /*  PORTADA + CIERRE                                               */
  /* =============================================================== */
  function buildCover(st) {
    const comp = DIAGRAMS.newComp('cover', chooseCats(3), 'repetir');
    const W = SZ.w, H = SZ.h;
    /* título como bloque de dos líneas: el interlineado evita solapamientos */
    mkText(comp, W / 2, H * 0.3, 'EL MUNDO<br>NO COMPILA', { cls: 'cover-mega center', center: true });
    mkText(comp, W / 2, H * 0.52, 'poemario diagramático para una máquina sin exterior', { cls: 'cover-sub center', center: true });
    const loop = [
      'while (mundo !== mundo_modelado) {',
      '    observar();',
      '    diagramar();',
      '    perder_algo();',
      '}',
    ];
    mkText(comp, W / 2, H * 0.66, loop.join('<br>'), { cls: 'cover-loop center mono', center: true });
    mkText(comp, W / 2, H * 0.82, 'vuelta ' + String(st.turn).padStart(3, '0') + ' · semilla ' + st.seed, { cls: 'cover-meta center mono', center: true });
    mkText(comp, W / 2, H * 0.86, 'sin representar: ' + Math.round(st.unrepresented * 100) + '% del mundo', { cls: 'cover-meta center mono dim', center: true });
    if (st.turn > 0) {
      comp.el.classList.add('cover--contaminated');
      st.residueText.slice(-8).forEach(b => mkText(comp, rint(W * 0.08, W * 0.8), rint(H * 0.08, H * 0.92), b,
        { cls: 'micro contaminant', rot: chance(0.4) ? rint(-8, 8) : 0 }));
      mkText(comp, W / 2, H * 0.86, 'esta portada quedó contaminada por la vuelta ' + String(st.turn - 1).padStart(3, '0'),
        { cls: 'micro center dim', center: true });
    }
    comp.meta.cats = ['WORLD', 'CODE', 'TIME'];
    comp.meta.title = 'PORTADA · tentativa ' + String(st.turn).padStart(3, '0');
    comp.meta.density = 8;
    comp.meta.isCover = true;
    return comp;
  }

  function buildClosing(st) {
    const comp = DIAGRAMS.newComp('closing', chooseCats(3), 'ejecutar');
    const W = SZ.w, H = SZ.h;
    st.unresolved = st.openNodes.length ? pick(st.openNodes) : short(nodo(pick(CAT_NAMES)));
    mkText(comp, W / 2, H * 0.16, 'la última página no cierra', { cls: 'closing-h center', center: true });
    const block = [
      'while (mundo !== mundo_modelado) {',
      '    observar();',
      '    diagramar();',
      '    perder_algo();',
      '}',
      '',
      '// variable no resuelta detectada:',
      '//   ' + st.unresolved,
      '// contaminando portada...',
      '// reiniciando la tentativa...',
    ];
    mkText(comp, W / 2, H * 0.42, block.join('<br>'), { cls: 'closing-loop center mono', center: true });
    mkText(comp, W / 2, H * 0.66, fragOf('WORLD'), { cls: 'center dim', center: true, w: Math.min(W - DIAGRAMS.M() * 2, W * 0.62) });
    mkText(comp, W / 2, H * 0.72, 'quedan ' + st.openNodes.length + ' nodos abiertos · ' + st.errorCount + ' errores sin atrapar',
      { cls: 'micro center dim', center: true });
    mkText(comp, W / 2, H * 0.86, 'return al principio (transformado)', { cls: 'mono center blink', center: true });
    comp.meta.cats = ['CODE', 'ERROR', 'WORLD'];
    comp.meta.title = 'CIERRE QUE NO CIERRA';
    comp.meta.density = 6;
    comp.meta.persist = true;
    comp.meta.isClosing = true;
    return comp;
  }

  /* =============================================================== */
  /*  RITMOS                                                          */
  /* =============================================================== */
  /* tiempos base más largos: la pieza está pensada para leerse con calma */
  const RHYTHMS = [
    { name: 'acumulación', stagger: 16, wireDur: 800, hold: 6500, leave: 'fade', w: 0.9 },
    { name: 'suspensión', stagger: 70, wireDur: 1900, hold: 16000, leave: 'ghost', w: 0.9 },
    { name: 'lectura lenta', stagger: 44, wireDur: 1300, hold: 13000, leave: 'fade', w: 1.5 },
    { name: 'parpadeo', stagger: 10, wireDur: 520, hold: 4200, leave: 'wipe', w: 0.5 },
    { name: 'colapso', stagger: 26, wireDur: 1000, hold: 7000, leave: 'collapse', w: 0.7 },
  ];
  function chooseRhythm(comp, st) {
    let total = 0; const eff = RHYTHMS.map(r => { total += r.w; return r.w; });
    let x = RNG.next() * total, r = RHYTHMS[0];
    for (let i = 0; i < RHYTHMS.length; i++) { x -= eff[i]; if (x <= 0) { r = RHYTHMS[i]; break; } }
    if (comp.meta.isCover || comp.meta.isClosing) r = RHYTHMS[2];
    const persist = comp.meta.persist || comp.meta.forcedError;
    const speed = st.speed || 1;
    return {
      name: r.name,
      enter: { stagger: r.stagger, wireDur: r.wireDur },
      hold: Math.round(r.hold * (persist ? 1.6 : 1) * speed * rflt(0.9, 1.15, 2)),
      leave: { mode: r.leave, dur: r.leave === 'ghost' ? 1600 : 1050 },
      collapse: r.leave === 'collapse',
    };
  }

  /* =============================================================== */
  /*  ACTUALIZACIÓN DEL ESTADO SEGÚN LA COMPOSICIÓN                  */
  /* =============================================================== */
  function updateWorld(comp, st) {
    const cats = comp.meta.cats || [];
    const learn = 0.14;
    for (const cat of cats) if (st.modelo[cat] != null) st.modelo[cat] += learn * (st.mundo[cat] - st.modelo[cat]);
    if (comp.meta.forcedError) st.errorCount++;
    const words = (comp.el.textContent.toLowerCase().match(/[a-záéíóúñü]{4,}/g) || []);
    for (const w of words) st.wordFreq[w] = (st.wordFreq[w] || 0) + 1;
    (comp.meta.openNodes || []).forEach(n => { if (st.openNodes.length < 400) st.openNodes.push(n); });
    if ((comp.meta.openNodes || []).length === 0) st.orphans.push(comp.meta.family);
    if (comp.meta.density > st.maxDensity) { st.maxDensity = comp.meta.density; st.maxDensityPage = st.pageIndex; }
    recomputeUnrepresented();
    st.familyWeights[comp.meta.family] = 0.5;
    for (const k in st.familyWeights) st.familyWeights[k] = st.familyWeights[k] * 0.94 + 0.06;
    st.lastFamily = comp.meta.family;
    st.corruption = Math.min(0.92, (st.pageIndex / Math.max(1, st.turnLength)) * 0.7 + st.turn * 0.04);
  }

  /* residuo: arrastra 8–14% de los elementos como fantasmas ------ */
  function carryResidue(comp, st, keepFactor) {
    const els = [...comp.el.querySelectorAll('.node, .txt')];
    const keep = Math.max(1, Math.round(els.length * (keepFactor || 0.10)));
    const chosen = shuffleLocal(els).slice(0, keep);
    for (const e of chosen) {
      const g = e.cloneNode(true);
      g.className = (g.className || '').replace(/\breveal\b/g, '').replace(/\bin\b/g, '') + ' ghost';
      g.classList.add('in');
      residueLayer.appendChild(g);
      const t = e.textContent.trim();
      if (t && t.length > 4 && t.length < 80 && st.residueText.length < 80) st.residueText.push(t);
    }
    /* límite: la memoria es imperfecta pero acotada */
    while (residueLayer.children.length > 70) residueLayer.removeChild(residueLayer.firstChild);
  }

  function shuffleLocal(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[r[i], r[j]] = [r[j], r[i]]; } return r; }

  /* =============================================================== */
  /*  MOBILIARIO DE PÁGINA (folio, coords, sello, running head)      */
  /* =============================================================== */
  function drawFurniture(st, comp) {
    furn.innerHTML = '';
    const W = SZ.w, H = SZ.h, m = DIAGRAMS.M();
    const add = (cls, html, x, y, right) => {
      const d = document.createElement('div'); d.className = 'furn ' + cls; d.innerHTML = html;
      if (right != null) d.style.right = right + 'px'; else if (x != null) d.style.left = x + 'px';
      if (y != null) d.style.top = y + 'px';
      furn.appendChild(d); return d;
    };
    const yb = H - Math.max(m * 1.5, 52);
    add('run-head', (comp.meta.title || '').toUpperCase(), m, Math.max(m * 0.5, 16));
    add('folio', 'p. ' + String(st.pageIndex).padStart(3, '0') + ' / ' + String(st.turnLength).padStart(3, '0')
      + ' · v' + String(st.turn).padStart(2, '0') + ' · ' + Math.round(st.unrepresented * 100) + '% sin repr.', m, yb);
    add('coords', 'x' + rint(0, 999) + ' y' + rint(0, 999) + ' · ' + rflt(-99, 99, 3) + 'ε', null, yb, m);
    add('stamp', stamp(), null, Math.max(m * 0.5, 16), m);
  }

  /* =============================================================== */
  /*  UNA PÁGINA                                                      */
  /* =============================================================== */
  async function stepOnePage() {
    const st = STATE;
    let comp;
    if (st.pageIndex === 0) comp = buildCover(st);
    else if (st.pageIndex >= st.turnLength - 1) comp = buildClosing(st);
    else comp = buildComposition(st);

    st.current = comp;
    /* alternancia violenta blanco/negro: páginas dramáticas y vueltas impares */
    const invert = ['errpoem', 'monument', 'cover', 'closing'].includes(comp.meta.family)
      || (st.turn % 3 === 2);
    bookPage.classList.toggle('invert', invert);
    compLayer.appendChild(comp.el);
    drawFurniture(st, comp);
    const rhythm = chooseRhythm(comp, st);
    updateWorld(comp, st);
    updateStatus(st, comp, rhythm);

    Anim.enter(comp, rhythm.enter);

    await gate(rhythm.hold);
    if (!running) { comp.el.remove(); return; }

    /* residuo (más si el ritmo es fantasma) */
    carryResidue(comp, st, rhythm.leave.mode === 'ghost' ? 0.16 : 0.09);
    if (rhythm.collapse) Anim.collapse(comp);
    if (chance(0.3)) Anim.seekLostNode(comp);
    await Anim.leave(comp, rhythm.leave);
    comp.el.remove();

    /* avanzar */
    st.pageIndex++;
    if (st.pageIndex >= st.turnLength) await endTurn(st);
  }

  /* fin de vuelta: el mundo cambia, se conserva residuo, se reinicia */
  async function endTurn(st) {
    setStatus('[LOOP] vuelta ' + String(st.turn).padStart(3, '0') + ' cerrada · el mundo se movió mientras la modelábamos');
    /* deriva del mundo: cambia durante el intento de representarlo */
    for (const c of CAT_NAMES) {
      st.mundo[c] += rflt(-0.28, 0.28, 3);
      if (st.mundo[c] < 0) st.mundo[c] += 1; if (st.mundo[c] > 1) st.mundo[c] -= 1;
      /* el modelo olvida un poco (memoria imperfecta) */
      st.modelo[c] *= rflt(0.7, 0.92, 2);
    }
    /* conservar 5–15% del residuo, descartar el resto */
    const keep = Math.round(residueLayer.children.length * rflt(0.05, 0.15, 2));
    while (residueLayer.children.length > keep) residueLayer.removeChild(residueLayer.firstChild);
    st.residueText = st.residueText.slice(-Math.max(4, Math.round(st.residueText.length * 0.12)));
    /* contaminar portada visualmente */
    bookPage.classList.add('turning');
    setTimeout(() => bookPage.classList.remove('turning'), 1200);
    st.turn++;
    st.pageIndex = 0;
    st.turnLength = rint(24, 40);
    st.openNodes = st.openNodes.slice(-Math.round(st.openNodes.length * 0.2));
    recomputeUnrepresented();
    await gate(900);
  }

  /* =============================================================== */
  /*  DIRECTOR                                                        */
  /* =============================================================== */
  async function director() {
    if (running) return;
    running = true;
    while (running) {
      try { await stepOnePage(); }
      catch (e) { console.error('director', e); setStatus('[FATAL] ' + e.message + ' — el diagrama continúa igual'); await gate(1500); }
    }
  }
  function stopDirector() { running = false; if (gateTimer) { clearTimeout(gateTimer); gateTimer = null; } fire(); }

  function regenerate(newSeed) {
    stopDirector();
    Anim.clearTimers();
    setTimeout(() => {
      compLayer.innerHTML = ''; residueLayer.innerHTML = ''; furn.innerHTML = '';
      bookPage.classList.remove('turning');
      setSeed(newSeed != null ? newSeed : randomSeed());
      initWorld();
      running = false; paused = false; document.body.classList.remove('paused');
      director();
    }, 60);
  }

  /* =============================================================== */
  /*  HUD / STATUS                                                   */
  /* =============================================================== */
  let statusQueue = [], statusTimer = null;
  function setStatus(msg) { statusQueue = [msg]; renderStatus(); }
  function updateStatus(st, comp, rhythm) {
    const lines = [
      '[SYS] sin representar: ' + Math.round(st.unrepresented * 100) + '% del mundo',
      '[ERR] ' + st.errorCount + ' excepciones no atrapadas',
      '[MEM] densidad máx · pág ' + String(st.maxDensityPage).padStart(3, '0'),
      '[LOOP] vuelta ' + String(st.turn).padStart(3, '0') + ' · pág ' + String(st.pageIndex).padStart(3, '0') + '/' + st.turnLength,
      '[RITMO] ' + rhythm.name,
      '[FAM] ' + comp.meta.family + ' · ' + (comp.meta.cats || []).join('+'),
      '[OPEN] ' + st.openNodes.length + ' nodos sin cerrar',
      '[VAR] no resuelta: ' + st.unresolved,
      '[SEED] ' + st.seed,
    ];
    statusQueue = lines;
    renderStatus();
  }
  function renderStatus() {
    if (!statusEl) return;
    if (statusTimer) { clearInterval(statusTimer); statusTimer = null; }
    let i = 0;
    const show = () => { if (!statusQueue.length) return; statusEl.textContent = statusQueue[i % statusQueue.length]; i++; };
    show();
    statusTimer = setInterval(() => { if (!paused) show(); }, 2600);
  }

  /* =============================================================== */
  /*  MODO IMPRESIÓN (PDF)                                           */
  /* =============================================================== */
  function printMode() {
    const wasRunning = running;
    pauseLoop();
    const saved = RNG.state;
    const pst = JSON.parse(JSON.stringify({
      seed: STATE.seed, turn: STATE.turn, pageIndex: 0, turnLength: 22,
      mundo: STATE.mundo, modelo: STATE.modelo, unrepresented: STATE.unrepresented,
      errorCount: STATE.errorCount, openNodes: STATE.openNodes.slice(-20), orphans: [],
      maxDensity: STATE.maxDensity, maxDensityPage: STATE.maxDensityPage, corruption: STATE.corruption,
      familyWeights: {}, lastFamily: null, residueText: STATE.residueText.slice(), unresolved: STATE.unresolved,
      wordFreq: {},
    }));
    for (const c of CAT_NAMES) CAT_WEIGHTS[c] = 0.35 + 2.2 * Math.abs(pst.mundo[c] - pst.modelo[c]);
    /* para imprimir usamos una proporción de página fija (ISO A portrait) */
    const liveW = SZ.w, liveH = SZ.h;
    DIAGRAMS.setPageSize(1000, 1414);
    printRoot.innerHTML = '';
    const count = 22;
    for (let i = 0; i < count; i++) {
      pst.pageIndex = i;
      let comp;
      if (i === 0) comp = buildCover(pst);
      else if (i === count - 1) comp = buildClosing(pst);
      else comp = buildComposition(pst);
      updateWorld(comp, pst);
      const page = document.createElement('div'); page.className = 'print-page';
      const bp = document.createElement('div'); bp.className = 'book-page print-book';
      bp.appendChild(comp.el);
      const f = document.createElement('div'); f.className = 'furniture';
      bp.appendChild(f);
      page.appendChild(bp);
      printRoot.appendChild(page);
      /* furniture for print */
      const savedFurn = furn; furn = f; drawFurniture(pst, comp); furn = savedFurn;
      Anim.finalize(comp);
    }
    DIAGRAMS.setPageSize(liveW, liveH);      // restaurar tamaño vivo
    RNG.state = saved;
    document.body.classList.add('printing');
    setStatus('[PDF] imponiendo ' + count + ' páginas · usa "Guardar como PDF"');
    setTimeout(() => { window.print(); }, 300);
    const done = () => {
      document.body.classList.remove('printing');
      printRoot.innerHTML = '';
      window.removeEventListener('afterprint', done);
      if (wasRunning) resumeLoop();
    };
    window.addEventListener('afterprint', done);
  }

  /* =============================================================== */
  /*  LAYOUT FLUIDO (la página ocupa el 100% de la ventana)          */
  /* =============================================================== */
  function relayout() {
    DIAGRAMS.setPageSize(stage.clientWidth || window.innerWidth, stage.clientHeight || window.innerHeight);
  }
  let resizeT = null;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      relayout();
      /* rehacer la página actual a la nueva medida sin romper el loop */
      if (running) skip();
    }, 320);
  }

  function setSpeed(delta) {
    STATE.speed = Math.min(2.8, Math.max(0.4, +(STATE.speed + delta).toFixed(2)));
    setStatus('[VEL] ×' + STATE.speed.toFixed(2) + '  (mayor = lectura más lenta)');
  }

  /* =============================================================== */
  /*  CONTROLES                                                       */
  /* =============================================================== */
  function onKey(e) {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    switch (e.key) {
      case ' ': case 'k': e.preventDefault(); togglePause(); break;
      case 'ArrowRight': case 'n': skip(); break;
      case 'r': case 'R': regenerate(); break;
      case 's': case 'S': {
        const v = prompt('semilla (deja vacío para una nueva al azar):', STATE.seed || '');
        if (v !== null) regenerate(v.trim() || randomSeed());
        break;
      }
      case 'p': case 'P': printMode(); break;
      case '+': case '=': setSpeed(-0.2); break;   // más rápido
      case '-': case '_': setSpeed(0.2); break;    // más lento
      case '?': case 'h': case 'H': toggleHelp(); break;
      case 'Escape': help.classList.remove('show'); break;
    }
  }
  function toggleHelp() { help.classList.toggle('show'); }

  /* =============================================================== */
  /*  BOOT                                                            */
  /* =============================================================== */
  function boot() {
    stage = document.getElementById('stage');
    bookPage = document.getElementById('book-page');
    compLayer = document.getElementById('comp-layer');
    residueLayer = document.getElementById('residue-layer');
    furn = document.getElementById('furniture');
    hud = document.getElementById('hud');
    statusEl = document.getElementById('status');
    help = document.getElementById('help');
    printRoot = document.getElementById('print-root');

    DIAGRAMS.ensureDefs();

    let seed;
    try { seed = new URL(location.href).searchParams.get('seed'); } catch (e) { seed = null; }
    setSeed(seed || randomSeed());
    relayout();
    initWorld();

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('keydown', onKey);

    /* botones discretos */
    document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'pause') togglePause();
      else if (a === 'next') skip();
      else if (a === 'regen') regenerate();
      else if (a === 'seed') { const v = prompt('semilla:', STATE.seed || ''); if (v !== null) regenerate(v.trim() || randomSeed()); }
      else if (a === 'print') printMode();
      else if (a === 'help') toggleHelp();
    }));

    /* la portada se muestra un instante antes de arrancar el loop */
    director();

    /* pista de controles que se desvanece (sólo la primera vez) */
    setTimeout(() => document.body.classList.add('hint-fade'), 6000);

    /* interfaz discreta: se oculta con el lector quieto, vuelve al moverse */
    let uiTimer;
    const showUI = () => {
      document.body.classList.remove('ui-hidden');
      clearTimeout(uiTimer);
      uiTimer = setTimeout(() => document.body.classList.add('ui-hidden'), 3600);
    };
    ['mousemove', 'mousedown', 'touchstart', 'keydown', 'wheel'].forEach(ev =>
      window.addEventListener(ev, showUI, { passive: true }));
    showUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.EMC = { STATE, regenerate, printMode, togglePause };
})();
