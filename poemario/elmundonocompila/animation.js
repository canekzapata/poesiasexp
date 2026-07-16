'use strict';

/* =====================================================================
   EL MUNDO NO COMPILA
   animation.js  ::  movimiento tipográfico y diagramático
   ---------------------------------------------------------------------
   No es cine: las conexiones se trazan, los nodos esperan una señal,
   las variables mutan, algunos caracteres caen, las notas invaden el
   cuerpo, un proceso borra a otro, las líneas buscan nodos idos, y los
   errores permanecen más tiempo que los resultados correctos.
   ===================================================================== */

const Anim = (() => {
  const REDUCED = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DRAWABLE = new Set(['transform', 'depend', 'feedback', 'fork']);
  let paused = false;
  const timers = new Set();

  function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }

  /* --- trazado de una conexión (stroke-dashoffset) ---------------- */
  function prepDraw(p) {
    let len = 0;
    try { len = p.getTotalLength(); } catch (e) { len = 600; }
    if (!isFinite(len) || len <= 0) len = 600;
    p.style.strokeDasharray = len + ' ' + len;
    p.style.strokeDashoffset = String(len);
    p._len = len;
  }
  function drawWire(p, dur) {
    requestAnimationFrame(() => {
      p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.6,.02,.3,1)`;
      p.style.strokeDashoffset = '0';
      // al terminar, quitar dash para que las texturas CSS (si las hay) manden
      later(() => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = ''; }, dur + 40);
    });
  }

  /* --- entrada de una composición --------------------------------- */
  function enter(comp, opts = {}) {
    const stagger = REDUCED ? 0 : (opts.stagger != null ? opts.stagger : 26);
    const delay = opts.delay || 0;
    const wireDur = REDUCED ? 1 : (opts.wireDur || 900);

    const reveals = [...comp.el.querySelectorAll('.reveal')]
      .sort((a, b) => (a.dataset.order | 0) - (b.dataset.order | 0));
    reveals.forEach((elm, i) => later(() => elm.classList.add('in'), delay + i * stagger));

    const wires = [...comp.wires.querySelectorAll('.wire')];
    const wireStart = delay + reveals.length * stagger * 0.35 + 120;
    wires.forEach((p, i) => {
      const key = (p.getAttribute('class').match(/wire--(\w+)/) || [])[1];
      if (DRAWABLE.has(key)) {
        prepDraw(p);
        later(() => drawWire(p, wireDur), wireStart + i * 55);
      } else {
        p.style.opacity = '0';
        later(() => { p.style.transition = 'opacity 700ms'; p.style.opacity = ''; }, wireStart + i * 40);
      }
    });

    if (!REDUCED) startMutations(comp);
    return wireStart + wires.length * 55 + wireDur;
  }

  /* revela todo de golpe (modo impresión / reducido) --------------- */
  function finalize(comp) {
    comp.el.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    comp.wires.querySelectorAll('.wire').forEach(p => {
      p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.opacity = '';
    });
  }

  /* --- mutación de variables + caídas de caracteres --------------- */
  const MUT_GLYPHS = '░▒▓█▚▞◆◌×∿≈§¶?…'.split('');
  /* los títulos monumentales no pierden letras (serían erratas, no poesía) */
  const NO_FALL = '.cover-mega,.monument,.err-mega,.err-code,.index-title,.cover-sub,.closing-h,.big-label,.cover-loop,.closing-loop';
  function startMutations(comp) {
    stopMutations(comp);
    const tick = () => {
      if (paused || !comp.el.isConnected) return;
      // mutar una etiqueta .mut (leyenda se corrompe)
      const muts = comp.el.querySelectorAll('.mut');
      if (muts.length && Math.random() < 0.6) glitchText(muts[(Math.random() * muts.length) | 0]);
      // hacer caer un carácter de un nodo/texto simple (nunca de los títulos)
      if (Math.random() < 0.4) {
        const cands = [...comp.el.querySelectorAll('.node, .txt')].filter(e =>
          e.children.length === 0 && e.textContent.trim().length > 3 && !e.matches(NO_FALL));
        if (cands.length) fallChar(cands[(Math.random() * cands.length) | 0]);
      }
      // parpadeo puntual de un nodo (espera de señal)
      if (Math.random() < 0.25) {
        const ns = comp.el.querySelectorAll('.node');
        if (ns.length) {
          const n = ns[(Math.random() * ns.length) | 0];
          n.classList.add('waiting');
          later(() => n.classList.remove('waiting'), 400);
        }
      }
    };
    comp._mut = setInterval(tick, 780 + Math.random() * 500);
  }
  function stopMutations(comp) { if (comp._mut) { clearInterval(comp._mut); comp._mut = null; } }

  function glitchText(el) {
    if (el._busy) return; el._busy = true;
    const orig = el.textContent;
    const chars = orig.split('');
    let step = 0;
    const iv = setInterval(() => {
      if (paused) return;
      el.textContent = chars.map(c => (c === ' ' || Math.random() > 0.5 - step * 0.08) ? c : MUT_GLYPHS[(Math.random() * MUT_GLYPHS.length) | 0]).join('');
      if (++step > 5) { clearInterval(iv); el.textContent = orig; el._busy = false; }
    }, 70);
  }

  function fallChar(el) {
    const txt = el.textContent;
    if (txt.length < 4) return;
    const idx = 2 + ((Math.random() * (txt.length - 3)) | 0);
    const ch = txt[idx];
    if (ch === ' ' || ch === '\n') return;
    /* no se destruye el texto: se suelta una copia fantasma del carácter,
       que cae fuera del contenedor y se pierde (perder_algo, pero legible) */
    const span = document.createElement('span');
    span.className = 'fallen';
    span.textContent = ch;
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    span.style.left = (left + (Math.random() * 40 - 8)) + 'px';
    span.style.top = (top + 4) + 'px';
    el.parentElement.appendChild(span);
    later(() => span.remove(), 2600);
  }

  /* --- salida: un proceso borra a otro; residuos quedan ----------- */
  function leave(comp, opts = {}) {
    return new Promise(resolve => {
      stopMutations(comp);
      const mode = opts.mode || 'fade';
      const dur = REDUCED ? 1 : (opts.dur || 900);
      comp.el.classList.add('leaving', 'leave--' + mode);
      // borrado parcial: algunos elementos se "raspan" antes de irse
      if (!REDUCED && mode !== 'ghost') {
        const els = [...comp.el.querySelectorAll('.node, .txt')];
        Content_shuffle(els).slice(0, Math.round(els.length * 0.3)).forEach((e, i) =>
          later(() => e.classList.add('erasing'), i * 40));
      }
      later(() => resolve(), dur);
    });
  }

  /* --- colapso hacia los márgenes --------------------------------- */
  function collapse(comp) {
    comp.el.classList.add('collapsing');
  }

  /* --- líneas que buscan un nodo que ya no está ------------------- */
  function seekLostNode(comp) {
    const wires = comp.wires.querySelectorAll('.wire');
    if (!wires.length) return;
    const p = wires[(Math.random() * wires.length) | 0];
    p.classList.add('seeking');
  }

  function Content_shuffle(a) { // barajado local (no estructural, usa Math.random)
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }

  function pauseAll() { paused = true; }
  function resumeAll() { paused = false; }
  function clearTimers() { timers.forEach(id => clearTimeout(id)); timers.clear(); }

  return {
    enter, leave, finalize, collapse, seekLostNode,
    stopMutations, pauseAll, resumeAll, clearTimers,
    get reduced() { return REDUCED; },
    get paused() { return paused; },
  };
})();

if (typeof window !== 'undefined') window.Anim = Anim;
