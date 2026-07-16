'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  reader.js  ::  la lectura como materia
//
//  El lector no controla la obra: es lo que la obra intenta archivar
//  mientras todavía ocurre. Cada gesto alimenta la memoria de los
//  fragmentos y empuja la vuelta por sus ocho estados. Al final, el
//  archivo se muta y el PDF impreso es el registro de ESTA lectura.
// =====================================================================

(function () {
  const { Archive } = window.ArchiveCore;

  // los ocho estados heredan una acción que los caracteriza
  const SIGNATURE = {
    detener: 'presente_continuo',
    excavar: 'excavacion',
    enlazar: 'enlace',
    arrastrar: 'caja',
    abandonar: 'arqueologia_futura',
    // 'mover' y 'nada' no adelantan: son el fondo de la lectura
  };

  const STATE_LINE = {
    futuro_anterior: 'ESTE ARCHIVO YA REGISTRÓ TU LECTURA',
    celda: 'NO TOCAR TAMBIÉN ESCRIBE',
    caja: 'ARRASTRA LA FRONTERA — ADENTRO ES METADATO',
    excavacion: 'BAJA: NO PASAS PÁGINA, EXCAVAS',
    enlace: 'UNE DOS FRAGMENTOS Y NACE UN TERCERO',
    presente_continuo: 'PERMANECE: LA ATENCIÓN DEFORMA',
    arqueologia_futura: 'LO BORRADO REGRESA MAL ATRIBUIDO',
    profecia_fallida: 'EL ARCHIVO PREDICE TU PRÓXIMO GESTO',
  };

  class Reader {
    constructor() {
      const params = new URLSearchParams(location.search);
      this.seed = params.get('seed') || `archivo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      this.archive = new Archive(this.seed);
      this.root = document.querySelector('#pliego');

      // el clima: cada lectura tiene su armonía cromática y su canvas vivo
      this.palette = new window.ArchivePalette(this.seed);
      this.palette.apply();
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'clima';
      this.root.appendChild(this.canvas);
      this.climate = new window.ArchiveClimate(this.canvas, this.archive, this.palette);

      this.field = new window.ArchiveField(this.archive, this.root, this.palette);

      this.lastFrame = performance.now();
      this.pointer = { x: 0, y: 0, lastX: 0, lastY: 0, lastT: performance.now(), inside: false, velocity: 0 };
      this.lastInput = performance.now();
      this.hovered = null;
      this.dwellStart = 0;
      this.selection = null;      // primer fragmento elegido para enlace
      this.dragging = null;
      this.awaitingProphecy = false;
      this.ghostActive = false;
      this.ghost = { x: 0.5, y: 0.5, vx: 0, vy: 0, rng: window.ArchiveCore.makeRng(`${this.seed}:ghost`) };
      this.lastActions = [];

      const seedInput = document.querySelector('#seed-input');
      if (seedInput) seedInput.value = this.seed;

      this.bind();
      this.field.setMode(this.archive.state);
      this.showStateLine();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.scheduleBeat(this.stateDuration());
    }

    // -----------------------------------------------------------------
    //  enlaces de eventos
    // -----------------------------------------------------------------
    bind() {
      const r = this.root;
      r.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
      r.addEventListener('pointerdown', (e) => this.onDown(e));
      window.addEventListener('pointerup', (e) => this.onUp(e));
      r.addEventListener('pointerleave', () => { this.pointer.inside = false; });
      r.addEventListener('pointerenter', () => { this.pointer.inside = true; this.mark(); });
      // scroll = excavar (no pasa página)
      r.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
      window.addEventListener('resize', () => this.onResize(), { passive: true });
      document.addEventListener('visibilitychange', () => this.onVisibility());

      const seedInput = document.querySelector('#seed-input');
      if (seedInput) seedInput.addEventListener('change', () => this.regenerate(seedInput.value.trim()));

      addEventListener('keydown', (e) => {
        if (e.target.matches('input')) return;
        const k = e.key.toLowerCase();
        if (k === 'p') { e.preventDefault(); this.printEdition(); }
        else if (k === 'r') { this.regenerate(); }
        else if (k === 'f') { this.toggleFullscreen(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); this.excavate(0.5); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); this.excavate(-0.5); }
      });

      // botones mínimos
      const bind = (sel, fn) => { const b = document.querySelector(sel); if (b) b.addEventListener('click', fn); };
      bind('#print-btn', () => this.printEdition());
      bind('#regen-btn', () => this.regenerate());
      bind('#full-btn', () => this.toggleFullscreen());
    }

    mark() { this.lastInput = performance.now(); if (this.ghostActive) this.deactivateGhost(); }

    // -----------------------------------------------------------------
    //  SONDA :: el cursor como probe; velocidad = erosión o revelado
    // -----------------------------------------------------------------
    onMove(e) {
      this.mark();
      const now = performance.now();
      const dt = Math.max(1, now - this.pointer.lastT);
      const dx = e.clientX - this.pointer.lastX;
      const dy = e.clientY - this.pointer.lastY;
      const dist = Math.hypot(dx, dy);
      this.pointer.velocity = dist / dt;                 // px/ms
      this.pointer.lastX = e.clientX; this.pointer.lastY = e.clientY;
      this.pointer.lastT = now; this.pointer.inside = true;
      this.pointer.x = e.clientX; this.pointer.y = e.clientY;

      if (this.dragging) return this.dragMove(e);

      const frag = this.nearestFragment(e.clientX, e.clientY, 130);
      if (frag) {
        this.archive.probe(frag, this.pointer.velocity);
        this.field._syncFragmentNode(this.field.getFragmentNode(frag.id), frag);
        // cambió de fragmento → reinicia la permanencia
        if (this.hovered !== frag) { this.hovered = frag; this.dwellStart = now; }
      } else {
        this.hovered = null;
      }
      if (this.pointer.velocity > 0.35) this.registerAction('mover');
    }

    onWheel(e) {
      e.preventDefault();
      this.mark();
      this.excavate(e.deltaY > 0 ? 0.28 : -0.28);
    }
    excavate(delta) {
      this.field.setDepth(this.field.depth + delta);
      this.climate.depth = this.field.depth;
      this.registerAction('excavar');
      this.archive.jumpTo('excavacion');
      this.syncMode();
    }

    onDown(e) {
      this.mark();
      const boxNode = e.target.closest('.box');
      if (boxNode) {
        this.dragging = {
          box: this.field.boxes.find((b) => b.id === boxNode.dataset.id),
          handle: e.target.classList.contains('box-handle'),
          startX: e.clientX, startY: e.clientY, moved: false,
        };
        boxNode.setPointerCapture && boxNode.setPointerCapture(e.pointerId);
        return;
      }
      const fragNode = e.target.closest('.fragment');
      this.downFrag = fragNode ? this.archive.fragments.find((f) => f.id === fragNode.dataset.id) : null;
      this.downAt = { x: e.clientX, y: e.clientY };
    }

    onUp(e) {
      if (this.dragging) {
        if (this.dragging.moved) { this.field.reclassify(); this.registerAction('arrastrar'); this.archive.jumpTo('caja'); this.syncMode(); }
        this.dragging = null;
        return;
      }
      if (!this.downFrag) { this.clearSelection(); return; }
      const moved = this.downAt && Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 8;
      if (moved) { this.downFrag = null; return; }
      this.selectForLink(this.downFrag);
      this.downFrag = null;
    }

    // -----------------------------------------------------------------
    //  ENLACE :: elegir dos fragmentos crea una relación irreversible
    // -----------------------------------------------------------------
    selectForLink(frag) {
      if (!this.selection) {
        this.selection = frag;
        const node = this.field.getFragmentNode(frag.id);
        if (node) node.classList.add('selected');
        return;
      }
      if (this.selection.id === frag.id) { this.clearSelection(); return; }
      const result = this.archive.link(this.selection.id, frag.id);
      this.clearSelection();
      if (!result) return;
      this.field.syncFragments();
      this.field.syncRelations();
      this.field.flash('link');
      this.field.showOracle(`enlace: nace «${result.third}»`, 'link');
      this.registerAction('enlazar');
      this.archive.jumpTo('enlace');
      this.syncMode();
    }
    clearSelection() {
      if (this.selection) {
        const node = this.field.getFragmentNode(this.selection.id);
        if (node) node.classList.remove('selected');
      }
      this.selection = null;
    }

    // -----------------------------------------------------------------
    //  ARRASTRE :: mover fronteras, cajas, categorías
    // -----------------------------------------------------------------
    dragMove(e) {
      const d = this.dragging;
      if (!d || !d.box) return;
      d.moved = true;
      const rect = this.root.getBoundingClientRect();
      const box = d.box;
      if (d.handle) {
        box.w = Math.max(0.06, Math.min(0.9, (e.clientX - rect.left) / rect.width - box.x));
        box.h = Math.max(0.06, Math.min(0.9, (e.clientY - rect.top) / rect.height - box.y));
      } else {
        const dx = (e.clientX - d.startX) / rect.width;
        const dy = (e.clientY - d.startY) / rect.height;
        box.x = Math.max(0, Math.min(1 - box.w, box.x + dx));
        box.y = Math.max(0, Math.min(1 - box.h, box.y + dy));
        d.startX = e.clientX; d.startY = e.clientY;
      }
      box.node.style.left = `${box.x * 100}%`;
      box.node.style.top = `${box.y * 100}%`;
      box.node.style.width = `${box.w * 100}%`;
      box.node.style.height = `${box.h * 100}%`;
      this.field.reclassify();
    }

    // -----------------------------------------------------------------
    //  REDIMENSIÓN :: recalcula la topología y rompe conexiones
    // -----------------------------------------------------------------
    onResize() {
      this.mark();
      this.climate.resize();
      // la ventana cambió: algunas conexiones no sobreviven al nuevo pliego
      const before = this.archive.relations.length;
      this.archive.relations = this.archive.relations.filter(() => this.archive.rng() > 0.28);
      const broken = before - this.archive.relations.length;
      // los fragmentos se redistribuyen levemente: el plano se deforma
      this.archive.fragments.forEach((f) => {
        f.x = Math.max(0.02, Math.min(0.98, f.x + (this.archive.rng() - 0.5) * 0.04));
        f.y = Math.max(0.02, Math.min(0.98, f.y + (this.archive.rng() - 0.5) * 0.04));
      });
      this.field.syncFragments();
      this.field.syncRelations();
      if (broken > 0) { this.field.flash('break'); this.field.showOracle(`la topología rompió ${broken} enlace(s)`, 'break'); }
    }

    // -----------------------------------------------------------------
    //  ABANDONO :: salir de la pestaña produce un periodo que el
    //  sistema interpreta como hallazgo
    // -----------------------------------------------------------------
    onVisibility() {
      if (document.hidden) {
        this.abandonAt = Date.now();
        this.registerAction('abandonar');
      } else if (this.abandonAt) {
        const secs = Math.round((Date.now() - this.abandonAt) / 1000);
        this.abandonAt = null;
        // el archivo envejece durante la ausencia
        this.archive.fragments.forEach((f) => { f.edad += Math.min(3, Math.floor(secs / 10)); });
        this.archive.jumpTo('arqueologia_futura');
        this.syncMode();
        this.field.syncFragments();
        this.field.showOracle(`ausencia de ${secs}s registrada como estrato`, 'abandon');
      }
    }

    // -----------------------------------------------------------------
    //  bucle principal :: permanencia, lector fantasma, deriva
    // -----------------------------------------------------------------
    loop(now) {
      const idle = now - this.lastInput;
      const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
      this.lastFrame = now;

      // EL CLIMA :: el canvas respira cada cuadro
      this.climate.step(dt);
      this.field.drift(now);

      // boletín meteorológico ocasional (con humor) dentro del poema
      if (now - (this._bulletinAt || 0) > 11000 && !this.awaitingProphecy) {
        this._bulletinAt = now;
        this.field.showOracle(this.field.bulletin(), 'bulletin');
      }

      // PRESENTE CONTINUO :: permanecer sobre un fragmento lo deforma
      if (this.hovered && this.pointer.inside && !this.dragging) {
        const dwell = now - this.dwellStart;
        if (dwell > 620) {
          this.archive.dwellDeform(this.hovered);
          const node = this.field.getFragmentNode(this.hovered.id);
          if (node) this.field._syncFragmentNode(node, this.hovered);
          this.dwellStart = now;
          this.registerAction('detener');
          this.archive.jumpTo('presente_continuo');
          this.syncMode();
        }
      }

      // LECTOR FANTASMA :: no hacer nada activa una lectura autónoma
      if (idle > 4200) {
        if (!this.ghostActive) this.activateGhost();
        this.stepGhost(now);
      }

      requestAnimationFrame(this.loop);
    }

    activateGhost() {
      this.ghostActive = true;
      this.root.dataset.ghost = 'on';
      this.field.showOracle('un lector fantasma continúa la lectura', 'ghost');
      this.registerAction('nada');
    }
    deactivateGhost() {
      this.ghostActive = false;
      this.root.dataset.ghost = '';
      const g = this.root.querySelector('.ghost-cursor');
      if (g) g.remove();
    }
    stepGhost(now) {
      const g = this.ghost;
      // deriva browniana firmada por la semilla
      g.vx += (g.rng() - 0.5) * 0.002;
      g.vy += (g.rng() - 0.5) * 0.002;
      g.vx *= 0.94; g.vy *= 0.94;
      g.x = Math.max(0.04, Math.min(0.96, g.x + g.vx));
      g.y = Math.max(0.04, Math.min(0.96, g.y + g.vy));
      const rect = this.root.getBoundingClientRect();
      const px = rect.left + g.x * rect.width;
      const py = rect.top + g.y * rect.height;
      let cur = this.root.querySelector('.ghost-cursor');
      if (!cur) { cur = document.createElement('div'); cur.className = 'ghost-cursor'; this.root.appendChild(cur); }
      cur.style.left = `${g.x * 100}%`;
      cur.style.top = `${g.y * 100}%`;
      // el fantasma lee lento: acumula atención, casi nunca erosiona
      if (now - (this._ghostRead || 0) > 260) {
        this._ghostRead = now;
        const frag = this.nearestFragment(px, py, 120);
        if (frag) {
          this.archive.probe(frag, 0.2);
          const node = this.field.getFragmentNode(frag.id);
          if (node) this.field._syncFragmentNode(node, frag);
        }
        // muy de vez en cuando, el fantasma enlaza
        if (g.rng() < 0.03 && this.archive.fragments.length > 2) {
          const a = this.archive.fragments[Math.floor(g.rng() * this.archive.fragments.length)];
          const b = this.archive.fragments[Math.floor(g.rng() * this.archive.fragments.length)];
          if (a && b && a.id !== b.id) {
            this.archive.link(a.id, b.id);
            this.field.syncRelations();
          }
        }
      }
    }

    // -----------------------------------------------------------------
    //  máquina de ocho estados
    // -----------------------------------------------------------------
    stateDuration() {
      // cada estado dura entre 14 y 26 s de tiempo ambiente
      return 14000 + this.archive.rng() * 12000;
    }
    scheduleBeat(ms) {
      clearTimeout(this.beatTimer);
      this.beatTimer = setTimeout(() => this.beat(), ms);
    }
    beat() {
      if (this.awaitingProphecy) { this.scheduleBeat(1500); return; }
      this.advanceOrMutate();
    }
    advanceOrMutate() {
      const prevTurn = this.archive.turn;
      const wasProphecy = this.archive.state === 'profecia_fallida';
      const result = this.archive.advanceState();  // puede mutar internamente
      if (this.archive.turn !== prevTurn) {
        this.onMutation(result);
      } else {
        this.onEnterState(this.archive.state);
      }
    }
    onEnterState(state) {
      this.syncMode();
      this.showStateLine();
      if (state === 'celda' && this.field.boxes.length === 0) {
        // aparece la celda: un espacio delimitado; el texto se acumula afuera
        this.field.addBox(0.32, 0.3, 0.36, 0.4);
        this.field.reclassify();
      }
      if (state === 'profecia_fallida') { this.enterProphecy(); return; } // espera resolución
      this.scheduleBeat(this.stateDuration());
    }
    syncMode() {
      this.field.setMode(this.archive.state);
      this.field.setAuthority(this.archive.authority);
    }
    showStateLine() {
      const line = STATE_LINE[this.archive.state] || '';
      // la instrucción vive dentro del poema y se corrompe con la leyenda
      const corrupt = this.field._corrupt(line, this.archive.legendIntegrity);
      this.field.showOracle(corrupt, 'state');
    }

    // -----------------------------------------------------------------
    //  PROFECÍA FALLIDA :: el archivo anuncia el próximo gesto
    // -----------------------------------------------------------------
    enterProphecy() {
      const p = this.archive.predict();
      this.awaitingProphecy = true;
      const nombres = { mover:'MOVER', detener:'DETENERTE', enlazar:'ENLAZAR', arrastrar:'ARRASTRAR', excavar:'EXCAVAR', abandonar:'ABANDONAR', nada:'NO HACER NADA' };
      this.field.showOracle(`PROFECÍA — vas a ${nombres[p.accion] || p.accion}`, 'prophecy');
      // si el lector no actúa, la profecía se cumple con «nada»
      clearTimeout(this.prophecyTimeout);
      this.prophecyTimeout = setTimeout(() => this.resolveProphecy('nada'), 9000);
    }
    resolveProphecy(accionReal) {
      if (!this.awaitingProphecy) return;
      clearTimeout(this.prophecyTimeout);
      this.awaitingProphecy = false;
      const res = this.archive.resolvePrediction(accionReal);
      if (res && res.hit) {
        this.field.flash('authority');
        this.field.showOracle('ACERTÓ — la interfaz se vuelve autoritaria', 'authority');
      } else {
        this.field.flash('break');
        this.field.showOracle('FALLÓ — la leyenda pierde integridad', 'break');
        this.field.renderLegend();
      }
      this.syncMode();
      // tras la profecía, la vuelta se cierra: el archivo se muta
      this.scheduleBeat(2600);
    }

    // -----------------------------------------------------------------
    //  MUTACIÓN :: ARCHIVO′ (el contraarchivo)
    // -----------------------------------------------------------------
    onMutation(result) {
      this.field.flash('mutation');
      this.field.build();       // el campo se redibuja con los sobrevivientes
      this.field.depth = 0;
      this.field.setDepth(0);
      this.climate.depth = 0;
      this.climate.updateMemory();   // el clima se recompone con el contraarchivo
      this.syncMode();
      this.clearSelection();
      this.field.showOracle(
        `ARCHIVO′ — vuelta ${result.turn}: sobrevivió ${(result.keepRatio * 100).toFixed(1)}% (${result.survivors} frag), ${result.buried} enterrados`,
        'mutation'
      );
      this.scheduleBeat(this.stateDuration());
    }

    // -----------------------------------------------------------------
    //  registro de acciones (para la profecía y la historia)
    // -----------------------------------------------------------------
    registerAction(accion) {
      this.archive.recordAction(accion);
      this.lastActions.push(accion);
      if (this.lastActions.length > 40) this.lastActions.shift();
      // adelanta el estado si la acción tiene firma (nunca hacia atrás)
      const sig = SIGNATURE[accion];
      if (sig && !this.awaitingProphecy) { this.archive.jumpTo(sig); }
      if (this.awaitingProphecy) this.resolveProphecy(accion);
    }

    // -----------------------------------------------------------------
    //  utilidades
    // -----------------------------------------------------------------
    nearestFragment(clientX, clientY, radius) {
      const rect = this.root.getBoundingClientRect();
      const fx = (clientX - rect.left) / rect.width;
      const fy = (clientY - rect.top) / rect.height;
      let best = null, bestD = Infinity;
      for (const f of this.archive.fragments) {
        const d = Math.hypot((f.x - fx) * rect.width, (f.y - fy) * rect.height);
        if (d < bestD) { bestD = d; best = f; }
      }
      return bestD <= radius ? best : null;
    }

    regenerate(seed) {
      clearTimeout(this.beatTimer);
      this.seed = seed || `archivo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const seedInput = document.querySelector('#seed-input');
      if (seedInput) seedInput.value = this.seed;
      history.replaceState(null, '', `${location.pathname}?seed=${encodeURIComponent(this.seed)}`);
      this.archive = new Archive(this.seed);
      // nuevo clima: otra armonía cromática, otro tiempo atmosférico
      this.palette = new window.ArchivePalette(this.seed);
      this.palette.apply();
      this.climate.reseed(this.archive, this.palette);
      this.field = new window.ArchiveField(this.archive, this.root, this.palette);
      this.climate.resize();
      this.hovered = null; this.selection = null; this.awaitingProphecy = false;
      this.deactivateGhost();
      this.syncMode();
      this.showStateLine();
      this.scheduleBeat(this.stateDuration());
    }

    async toggleFullscreen() {
      try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
        else await document.exitFullscreen?.();
      } catch (e) { /* el pliego no siempre cabe en la pantalla */ }
    }

    // -----------------------------------------------------------------
    //  IMPOSICIÓN :: el PDF de ESTA lectura (~16 láminas)
    //  cada lector produce una edición distinta del libro
    // -----------------------------------------------------------------
    printEdition() {
      const book = document.querySelector('#print-book');
      if (!book) return;
      book.textContent = '';
      window.ArchivePrint.impose(book, this.archive.snapshotForPrint(), this.field.depth);
      requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    }
  }

  addEventListener('DOMContentLoaded', () => { window.reader = new Reader(); });
})();
