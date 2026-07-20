/*
  motor.js — el navegador desenfrenado
  poesiasexp / laberinto

  lee el descriptor de la pagina (window.__PAGINA__) y el grafo (MANIFIESTO),
  compone una a tres gramaticas del DOM, y despues mantiene el documento vivo:
  muta, destruye con residuo, reconstruye desde memoria, dispara eventos raros,
  anima los automatas. conserva el control aunque parezca haberlo perdido:
  limita ventanas e iframes, respeta prefers-reduced-motion, para todo con Esc,
  y pausa cuando la pestaña se oculta. nunca secuestra el historial ni impide
  cerrar la pestaña.

  solo navegador.
*/
(function () {
  'use strict';

  var P = window.__PAGINA__ || {};
  var MAN = window.MANIFIESTO || { paginas: {}, aristas: [] };
  var U = window.LAB_UTIL;
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- profundidad de iframe (para que la recursion no bloquee) ----------
  var params = new URLSearchParams(location.search);
  var prof = parseInt(params.get('p') || '0', 10) || 0;
  var semillaURL = params.get('semilla');

  // ---------- semilla de la pagina ----------
  var semillaBase = semillaURL != null ? semillaURL : (P.seed != null ? P.seed : 'río');
  var rng = new window.RNG(semillaBase);

  // ---------- paleta ----------
  var pal = window.PALETAS.generar(rng.fork('paleta'), P.familia || null);

  // ---------- estado del motor ----------
  var timers = [];
  var rafs = [];
  var quieto = false;
  var oculto = false;
  var CAP_NODOS = 4200;
  var contadorAutomata = 0;

  var limites = {
    iframes: reducido ? 3 : 12,
    ventanas: reducido ? 3 : 14,
    profundidad: 2
  };

  function intervalo(fn, ms) {
    if (reducido) return -1;
    var id = setInterval(function () { if (!quieto && !oculto) fn(); }, ms);
    timers.push(id); return id;
  }
  function unaVez(fn, ms) {
    var id = setTimeout(function () { if (!quieto) fn(); }, ms);
    timers.push(id); return id;
  }
  function animar(fn) {
    if (reducido) return;
    var vivo = true;
    function paso() { if (!vivo) return; if (!quieto && !oculto) fn(); requestAnimationFrame(paso); }
    var r = requestAnimationFrame(paso);
    rafs.push({ id: r, matar: function () { vivo = false; } });
  }

  // ---------- contexto que reciben las gramaticas ----------
  var raiz = document.getElementById('laberinto') || document.body;
  var CORPUS = window.CORPUS;

  // en hoja profunda: forzar topologia ligera, sin mas iframes ni ventanas
  var enHoja = prof >= limites.profundidad;

  var ctx = {
    rng: rng,
    pal: pal,
    corpus: CORPUS,
    rule: P.rule != null ? P.rule : 90,
    iframeDepth: prof + 1,
    limites: limites,
    prefijoPaginas: P.prefijoPaginas || '',

    linkAzar: function () {
      var L = P.links && P.links.length ? P.links : [{ href: location.pathname, text: '·', kind: 'normal', to: P.id }];
      var l = rng.pick(L);
      if (enHoja && (l.kind === 'iframe' || l.kind === 'ventana')) l = { href: l.href, text: l.text, kind: 'normal', to: l.to };
      return l;
    },
    linkAzarTemporal: function () {
      var L = P.links && P.links.length ? P.links : [{ href: location.pathname, kind: 'normal', to: P.id }];
      return L[Math.floor(Math.random() * L.length)];
    },
    nuevoAutomata: function (cols) {
      contadorAutomata++;
      return new window.Automata({
        ancho: cols, regla: ctx.rule,
        rng: rng.fork('auto' + contadorAutomata), densidad: 0.14
      });
    },
    marcarAutomata: function (el) { el.classList.add('con-automata'); },
    paletaHija: function (tag) { return window.PALETAS.generar(rng.fork(tag)); },
    contarIframes: function () { return document.querySelectorAll('iframe').length; },
    contarVentanas: function () { return document.querySelectorAll('.ventana').length; },
    contenedorScroll: function () { return document.scrollingElement || document.documentElement; },
    colorDe: function (to) {
      var n = MAN.paginas && MAN.paginas[to];
      return n && n.color ? n.color : null;
    },
    intervalo: intervalo,
    serializarDescendiente: serializarDescendiente
  };

  // ---------- descendencia (pagina reproductora) ----------
  function serializarDescendiente() {
    var nueva = (rng.int(0, 1e9) ^ (Date.now() & 0xffffff)) >>> 0;
    var dir = location.href.replace(/[^/]*$/, '');
    var css = Array.prototype.map.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.getAttribute('href'); });
    var js = Array.prototype.map.call(document.querySelectorAll('script[src]'), function (s) { return s.getAttribute('src'); });
    var desc = Object.assign({}, P, { seed: nueva, id: (P.id || '000') + '·h', esDescendiente: true });
    var html = '<!doctype html><html lang="es"><head><meta charset="utf-8">'
      + '<meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<base href="' + dir + '">'
      + '<title>descendiente ' + nueva + '</title>'
      + css.map(function (h) { return '<link rel="stylesheet" href="' + h + '">'; }).join('')
      + '</head><body><main id="laberinto"></main>'
      + '<script>window.__PAGINA__=' + JSON.stringify(desc).replace(/</g, '\\u003c') + ';window.__BASE__=' + JSON.stringify(window.__BASE__ || '') + ';<\/script>'
      + js.map(function (s) { return '<script src="' + s + '"><\/script>'; }).join('')
      + '</body></html>';
    return { html: html, semilla: nueva };
  }

  // ---------- construccion ----------
  function construir() {
    // variables CSS de la paleta
    var root = document.documentElement;
    root.style.setProperty('--fondo', pal.fondo);
    root.style.setProperty('--tinta', pal.tinta);
    root.style.setProperty('--acento', pal.acento);
    root.style.setProperty('--borde', pal.borde);
    root.style.setProperty('--enlace', pal.enlace);
    root.style.setProperty('--visitado', pal.visitado);
    pal.colores.forEach(function (c, i) { root.style.setProperty('--c' + i, c); });
    root.style.setProperty('--n-colores', pal.colores.length);
    root.style.setProperty('--entropia', (P.mutacion || 0.3).toFixed(2));

    document.body.classList.add('fam-' + pal.familia, 'tipo-' + (P.tipo || 'mono'), 'ritmo-' + (P.ritmo || 'lento'));
    if (prof > 0) document.body.classList.add('en-iframe', 'prof-' + prof);

    // topologias (1 a 3); en hoja profunda, una sola ligera
    var topos = (P.topo && P.topo.length) ? P.topo.slice() : ['paisaje'];
    if (enHoja) topos = [rng.pick(['vacio', 'paisaje', 'fuente', 'celular'])];
    topos.forEach(function (nombre) {
      var g = window.GRAMATICAS[nombre];
      if (g) { try { g(raiz, ctx); } catch (e) { /* una gramatica no debe tumbar la pieza */ } }
    });
    // campo y corredor necesitan scroll horizontal real del viewport
    if (topos.indexOf('campo') >= 0 || topos.indexOf('corredor') >= 0) document.body.classList.add('scroll-libre');

    // enlaces con conducta
    window.RUTAS.enlazar(raiz, ctx);

    // memoria: al volver, la pagina reconstruye solo una parte
    reconstruirDesdeMemoria();

    // canvas de automata (si alguna gramatica lo dejo)
    if (ctx.canvasCelular) animarCanvas(ctx.canvasCelular);

    // ritmo de mutacion
    arrancarRitmo();

    // eventos raros
    programarRaros();
  }

  // ---------- animacion del automata en canvas ----------
  function animarCanvas(canvas) {
    var ancho = canvas.clientWidth || 320, alto = canvas.clientHeight || 240;
    canvas.width = Math.min(ancho, 900); canvas.height = Math.min(alto, 700);
    var cx = canvas.getContext('2d');
    var cols = Math.max(24, canvas.width >> 2);
    var auto = new window.Automata({ ancho: cols, regla: ctx.rule, rng: rng.fork('canvas'), densidad: 0.1 });
    var cell = canvas.width / cols;
    var y = 0, vivo = pal.acento, muerto = pal.fondo;
    cx.fillStyle = muerto; cx.fillRect(0, 0, canvas.width, canvas.height);
    animar(function () {
      var fila = auto.paso();
      cx.fillStyle = vivo;
      for (var i = 0; i < cols; i++) if (fila[i]) cx.fillRect(i * cell, y, Math.ceil(cell), Math.ceil(cell));
      y += cell;
      if (y >= canvas.height) { y = 0; cx.fillStyle = muerto; cx.fillRect(0, 0, canvas.width, canvas.height); vivo = rng.pick(pal.colores); }
    });
  }

  // =========================================================
  //  MUTACIONES — el DOM sigue cambiando despues de cargar
  // =========================================================
  function candidatos() { return raiz.querySelectorAll('#laberinto *, main#laberinto > *'); }
  function unNodo() {
    var todos = raiz.querySelectorAll(':scope *');
    if (!todos.length) return null;
    return todos[Math.floor(Math.random() * todos.length)];
  }
  function nNodos() { return raiz.querySelectorAll(':scope *').length; }

  var MUT = {
    display: function (n) { n.style.display = ['block', 'inline-block', 'flex', 'grid', 'table', 'inline'][Math.floor(Math.random() * 6)]; },
    posicion: function (n) { if (Math.random() < .5) { n.style.position = 'relative'; n.style.left = (Math.random() * 40 - 20) + 'px'; n.style.top = (Math.random() * 30 - 15) + 'px'; } },
    etiqueta: function (n) { n.classList.toggle('mut-etiqueta'); },
    convertirEnEnlace: function (n) {
      if (n.tagName === 'A' || n.querySelector('a')) return;
      n.style.cursor = 'pointer'; n.classList.add('vuelto-enlace');
      var l = ctx.linkAzar(); n.dataset.href = l.href;
      n.onclick = function () { location.href = this.dataset.href; };
    },
    convertirEnComentario: function (n) {
      if (!n.textContent) return;
      var c = U.el('span', { class: 'comentario-visible', text: '<!-- ' + n.textContent.slice(0, 40) + ' -->' });
      if (n.parentNode) n.parentNode.replaceChild(c, n);
    },
    reubicar: function (n) {
      var destinos = raiz.querySelectorAll(':scope > *');
      if (destinos.length) { var d = destinos[Math.floor(Math.random() * destinos.length)]; if (d !== n && !d.contains(n)) d.appendChild(n); }
    },
    intercambiarDestinos: function () {
      var as = raiz.querySelectorAll('a[href]'); if (as.length < 2) return;
      var a = as[Math.floor(Math.random() * as.length)], b = as[Math.floor(Math.random() * as.length)];
      var t = a.href; a.href = b.href; b.href = t;
    },
    partirTabla: function () {
      var tr = raiz.querySelectorAll('tr'); if (!tr.length) return;
      var v = tr[Math.floor(Math.random() * tr.length)]; if (v) v.style.opacity = 0.1;
    },
    duplicar: function (n) {
      if (nNodos() > CAP_NODOS) return;
      var c = n.cloneNode(true); c.classList.add('duplicado');
      c.style.transform = 'translate(' + (Math.random() * 8 - 4) + 'px,' + (Math.random() * 8 - 4) + 'px)';
      if (n.parentNode) n.parentNode.insertBefore(c, n.nextSibling);
      window.RUTAS.enlazar(c.parentNode, ctx);
    },
    destruirConResiduo: function (n) {
      if (n === raiz || !n.parentNode) return;
      var resto = U.el('span', { class: 'residuo-inline', title: n.textContent ? n.textContent.slice(0, 30) : '' });
      resto.textContent = Math.random() < .5 ? '·' : '';
      n.parentNode.replaceChild(resto, n);
      memoriaDestruir();
    }
  };

  function tick(intensidad) {
    if (nNodos() > CAP_NODOS) { for (var d = 0; d < 3; d++) MUT.destruirConResiduo(unNodo() || raiz); return; }
    var cuantos = 1 + Math.floor(Math.random() * intensidad);
    for (var i = 0; i < cuantos; i++) {
      var n = unNodo(); if (!n) continue;
      var op = pickOp();
      try { op.length ? op(n) : op(); } catch (e) {}
    }
  }
  function pickOp() {
    var ops = [MUT.display, MUT.posicion, MUT.etiqueta, MUT.convertirEnEnlace, MUT.reubicar,
      MUT.intercambiarDestinos, MUT.partirTabla, MUT.duplicar, MUT.convertirEnComentario, MUT.destruirConResiduo];
    return ops[Math.floor(Math.random() * ops.length)];
  }

  function arrancarRitmo() {
    var ritmo = P.ritmo || 'lento';
    var mr = P.mutacion != null ? P.mutacion : 0.3;
    if (reducido || ritmo === 'inmovil') return; // pagina quieta
    if (ritmo === 'lento') intervalo(function () { tick(1); }, 2600 - mr * 1200);
    else if (ritmo === 'nervioso') intervalo(function () { tick(2); }, 900 - mr * 400);
    else if (ritmo === 'explosivo') intervalo(function () { tick(3); }, 380);
    else if (ritmo === 'clic') document.addEventListener('click', function () { tick(2); });
    else if (ritmo === 'scroll') window.addEventListener('scroll', throttle(function () { tick(1); }, 300));
    else if (ritmo === 'espera') { var t = 0; document.addEventListener('mousemove', function () { t = Date.now(); }); intervalo(function () { if (Date.now() - t > 4000) tick(2); }, 1500); }
    else if (ritmo === 'cursor') document.addEventListener('mousemove', throttle(function () { if (Math.random() < .15) tick(1); }, 200));
    else intervalo(function () { tick(1); }, 2000);
  }

  function throttle(fn, ms) { var last = 0; return function () { var now = Date.now(); if (now - last > ms) { last = now; fn.apply(this, arguments); } }; }

  // ---------- memoria local (sessionStorage) ----------
  function claveMem() { return 'lab:' + (P.id || location.pathname) + ':destr'; }
  function memoriaDestruir() {
    try { var k = claveMem(); var n = (parseInt(sessionStorage.getItem(k) || '0', 10) || 0) + 1; sessionStorage.setItem(k, String(n)); } catch (e) {}
  }
  function reconstruirDesdeMemoria() {
    try {
      var n = parseInt(sessionStorage.getItem(claveMem()) || '0', 10) || 0;
      // al volver, ya faltan cosas: destruimos una fraccion de lo recordado (con tope)
      var cuantos = Math.min(n, 18);
      for (var i = 0; i < cuantos; i++) { var x = unNodo(); if (x && x !== raiz) MUT.destruirConResiduo(x); }
    } catch (e) {}
  }

  // =========================================================
  //  EVENTOS RAROS — pocos por sesion, tardios, improbables
  // =========================================================
  var RAROS = {
    palabraPantalla: function () {
      var w = U.el('div', { class: 'raro-palabra', text: rng.pick(CORPUS.monumentales) });
      w.addEventListener('click', function () { w.remove(); });
      document.body.appendChild(w);
      unaVez(function () { w.classList.add('desvanece'); unaVez(function () { w.remove(); }, 1600); }, 3200);
    },
    ventanaMinuscula: function () {
      document.body.appendChild(U.el('div', { class: 'raro-min', style: { left: (10 + Math.random() * 80) + 'vw', top: (10 + Math.random() * 80) + 'vh' }, text: rng.pick(CORPUS.microtextos) }));
    },
    invertirTabla: function () { var t = raiz.querySelector('table'); if (t) t.classList.add('invertida'); },
    intercambiarDestinos: function () { for (var i = 0; i < 8; i++) MUT.intercambiarDestinos(); },
    revelarFuente: function () { document.body.classList.toggle('revela-fuente'); },
    todosMismoTexto: function () { var p = rng.pick(CORPUS.monumentales); Array.prototype.forEach.call(raiz.querySelectorAll('a'), function (a) { a.textContent = p; }); },
    soloGlifos: function () { document.body.classList.add('solo-glifos'); Array.prototype.forEach.call(raiz.querySelectorAll('a,p,span'), function (e) { if (/[a-záéíóúñ]/i.test(e.textContent) && e.children.length === 0) e.textContent = U.glifos ? '' : ''; }); document.body.classList.add('sin-alfabeto'); },
    desaparecerAlfabeto: function () { document.body.classList.add('sin-alfabeto'); },
    cambiarCSS: function () { document.body.classList.add('css-otro'); },
    recordarOtraSemilla: function () {
      if (enHoja) return;
      var ov = U.el('div', { class: 'raro-recuerdo' });
      ov.appendChild(U.el('iframe', { src: location.pathname + '?semilla=' + (rng.int(0, 1e9)) + '&p=' + limites.profundidad, title: 'otra semilla' }));
      var x = U.el('span', { class: 'overlay-cerrar', text: '×' }); x.addEventListener('click', function () { ov.remove(); });
      ov.appendChild(x); document.body.appendChild(ov);
    },
    indiceInexistente: function () {
      var ul = U.el('ul', { class: 'raro-indice' });
      for (var i = 0; i < rng.int(6, 16); i++) ul.appendChild(U.el('li', null, U.el('a', { href: '#' + rng.int(1000, 9999), text: rng.pick(CORPUS.rutas) + '-' + rng.int(100, 999) + '.html', class: 'enlace' })));
      document.body.appendChild(ul);
    },
    fondoEnlace: function () { document.body.classList.add('fondo-enlace'); document.body.addEventListener('click', function (e) { if (e.target === document.body) location.href = ctx.linkAzar().href; }); },
    migrarMargen: function () { document.body.classList.add('migra-' + rng.pick(['izq', 'der', 'arriba', 'abajo'])); },
    reorganizarCursor: function () {
      document.addEventListener('mousemove', throttle(function (e) {
        var f = e.clientX / window.innerWidth;
        raiz.style.setProperty('--empuje', (f * 40 - 20).toFixed(1) + 'px');
        document.body.classList.add('sigue-cursor');
      }, 120));
    },
    automataDetenido: function () { quietoAutomata = true; }
  };
  var quietoAutomata = false;

  function programarRaros() {
    var lista = (P.rare && P.rare.length) ? P.rare : [];
    lista.forEach(function (nombre) {
      if (!RAROS[nombre]) return;
      if (rng.chance(0.7)) { // no todos ocurren en cada sesion
        unaVez(function () { try { RAROS[nombre](); } catch (e) {} }, rng.int(3500, 20000));
      }
    });
  }

  // =========================================================
  //  CONTROLES DE SEGURIDAD
  // =========================================================
  function detenerTodo() {
    quieto = true;
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    rafs.forEach(function (r) { r.matar(); });
    timers = []; rafs = [];
    document.body.classList.add('quieto');
    // cerrar ventanas/overlays engendrados
    Array.prototype.forEach.call(document.querySelectorAll('.overlay-iframe,.raro-recuerdo,.ventana-ruta'), function (e) { e.remove(); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { detenerTodo(); }
    // barra: sube el ruido/entropia
    if (e.key === ' ' && !/input|textarea/i.test((e.target.tagName || ''))) {
      var v = Math.min(1, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--entropia')) || 0.3) + 0.12);
      document.documentElement.style.setProperty('--entropia', v.toFixed(2));
    }
  });

  document.addEventListener('visibilitychange', function () {
    oculto = document.hidden; // detiene mutaciones/animacion en pestañas ocultas
  });

  // navegacion real: el boton atras produce retornos (aunque cambie lo que encuentre)
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) { /* volvio del bfcache: la memoria ya alteró la pieza */ } });

  // ---------- arranque ----------
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', construir);
  else construir();

  // expuesto para depurar / para la descendencia
  window.MOTOR = { P: P, pal: pal, detener: detenerTodo, ctx: ctx };
})();
