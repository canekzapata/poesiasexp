'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — shell.js
   lo que toda página comparte: la semilla en la URL, el color de las
   relaciones, la telemetría, la captura de gestos, las salidas (dos
   estables y las que se destruyen al usarse), la espera y la copia.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  N.reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- color: los siete significados ------------------------------- */
  function paleta() {
    const h0 = N.seed.hash32(N.estado.semilla + ':paleta') % 360;
    const r = N.seed.make(N.estado.semilla, 'paleta');
    const oscuro = r.raw() < 0.32;
    const raiz = document.documentElement;
    const papel = oscuro ? 'hsl(' + ((h0 + 200) % 360) + ' 12% 9%)' : 'hsl(' + h0 + ' 14% 92%)';
    const tinta = oscuro ? 'hsl(' + h0 + ' 10% 88%)' : 'hsl(' + ((h0 + 200) % 360) + ' 24% 12%)';
    raiz.style.setProperty('--papel', papel);
    raiz.style.setProperty('--tinta', tinta);
    raiz.style.setProperty('--oscuro', oscuro ? '1' : '0');
    N.rutas.ORDEN.forEach((clase, i) => {
      const h = (h0 + i * (360 / 7) + (i % 2 ? 9 : -9)) % 360;
      const l = oscuro ? 66 : 40;
      const s = 52 + (i % 3) * 9;
      raiz.style.setProperty('--c-' + clase, 'hsl(' + Math.round(h) + ' ' + s + '% ' + l + '%)');
    });
    raiz.style.setProperty('--acento', 'var(--c-transmision)');
    if (oscuro) raiz.classList.add('modo-oscuro');
    return { h0, oscuro };
  }

  /* ---- telemetría de esquina ---------------------------------------- */
  function telemetria(host) {
    const t = N.texto.telemetria();
    const mov = N.narrativa.estado();
    host.innerHTML = '';
    const filas = [
      ['RECIBIDO', t.recibido],
      ['CONTENIDO', t.contenido],
      ['ORIGEN', t.origen],
      ['INTEGRIDAD', t.integridad + '%'],
      ['MOVIMIENTO', mov.n + ' · ' + mov.nombre]
    ];
    for (const [k, v] of filas) {
      const d = document.createElement('div');
      d.className = 'tel-fila';
      d.innerHTML = '<span class="tel-k"></span><span class="tel-v"></span>';
      d.querySelector('.tel-k').textContent = k + ':';
      d.querySelector('.tel-v').textContent = v;
      host.appendChild(d);
    }
    return t;
  }

  /* ---- salidas ------------------------------------------------------ */
  function salidas(host, pagina) {
    const m = N.mem.d;
    const lista = N.rutas.salidasDe(pagina).filter(s => {
      if (s.tipo === 'estructural') return true;
      return !m.destruidas.some(d => d[0] === pagina && d[1] === s.a);
    });
    host.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'salidas-lista';
    for (const s of lista) {
      const cat = N.rutas.catalogo[s.a];
      if (!cat) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = N.rutas.href(s.a);
      a.className = 'salida clase-' + s.clase + (s.tipo === 'recalculada' ? ' destructible' : '');
      a.setAttribute('data-destino', s.a);
      a.setAttribute('data-clase', s.clase);
      a.textContent = cat.t;
      const sp = document.createElement('span');
      sp.className = 'salida-clase';
      sp.textContent = N.rutas.CLASES[s.clase].etiqueta;
      a.appendChild(sp);
      a.addEventListener('click', () => {
        N.rutas.registrarArista(pagina, s.a, s.clase);
        N.mem.direccion(s.tipo === 'estructural' ? 'der' : 'izq');
        if (s.tipo === 'recalculada') {
          m.destruidas.push([pagina, s.a, Date.now()]);
          N.mem.guardar(true);
        }
      });
      li.appendChild(a);
      ul.appendChild(li);
    }
    host.appendChild(ul);
    return lista;
  }

  /* una ruta que sólo aparece si nadie hace nada */
  function rutaPorEspera(host, pagina) {
    if (host.querySelector('.salida-demora')) return;
    const a = document.createElement('a');
    a.href = N.rutas.href('demora');
    a.className = 'salida salida-demora clase-silencio';
    a.setAttribute('data-destino', 'demora');
    a.textContent = 'algo siguió trabajando';
    a.addEventListener('click', () => N.rutas.registrarArista(pagina, 'demora', 'silencio'));
    const ul = host.querySelector('.salidas-lista') || host;
    const li = document.createElement('li');
    li.appendChild(a);
    ul.appendChild(li);
    N.mem.hito('la-espera-abrio-una-ruta', pagina);
  }

  /* ---- captura de gestos -------------------------------------------- */
  function capturar(pagina) {
    let ultimoMov = 0;
    N.bus.listen(document, 'pointerdown', (ev) => {
      if (ev.target.closest && ev.target.closest('a,button,input,textarea,select')) {
        const g = N.mem.gesto(pagina, 'clic', ev.clientX, ev.clientY, 'control');
        N.regB.codificar(g);
        return;
      }
      const g = N.mem.gesto(pagina, 'clic', ev.clientX, ev.clientY);
      N.regB.codificar(g);
    }, { passive: true });

    N.bus.listen(document, 'pointermove', (ev) => {
      const ahora = Date.now();
      if (ahora - ultimoMov < 140) return;
      ultimoMov = ahora;
      const gx = Math.round(ev.clientX / window.innerWidth * 23);
      const gy = Math.round(ev.clientY / window.innerHeight * 17);
      N.mem.celda(pagina, gx, gy);
      if (ev.movementX > 3) N.mem.direccion('der');
      else if (ev.movementX < -3) N.mem.direccion('izq');
      if (ev.movementY > 3) N.mem.direccion('abajo');
      else if (ev.movementY < -3) N.mem.direccion('arriba');
    }, { passive: true });

    N.bus.listen(document, 'keydown', (ev) => {
      if (ev.target && /input|textarea/i.test(ev.target.tagName)) return;
      const k = ev.key.toLowerCase();
      if (k === 'm') { location.href = N.rutas.href('mapa'); }
      else if (k === 'b') { location.href = N.rutas.href('bitacora'); }
      else if (k === 'escape') { location.href = N.rutas.href('hueco'); }
      else if (k === 'r') {
        const s = N.seed.nueva();
        const u = new URL(location.href); u.searchParams.set('seed', s); u.searchParams.set('z', '0');
        location.href = u.pathname + u.search;
      } else return;
      const g = N.mem.gesto(pagina, 'tecla', 0, 0, k);
      N.regB.codificar(g);
    });
  }

  /* ---- el regreso tiene consecuencias -------------------------------- */
  function regreso(pagina) {
    const veces = N.mem.vecesEn(pagina);
    if (veces < 2) return null;
    document.body.classList.add('regresado');
    document.body.setAttribute('data-veces', String(veces));
    const bits = N.texto.bitsPerdidos();
    const marca = 'r:' + pagina;
    const antes = N.mem.d.regimenes[marca];
    N.mem.regimen(marca, {});
    const est = N.mem.d.regimenes[marca].estado;
    const antesBits = est.bits;
    const cambio = (antesBits !== undefined && antesBits !== bits);
    est.bits = bits; est.veces = veces;
    N.mem.guardar();
    if (cambio) {
      N.mem.hito('regreso-no-equivalente', pagina);
      N.mem.contradiccion(
        pagina + ' con ' + antesBits + ' bits apagados',
        pagina + ' con ' + bits + ' bits apagados',
        'la misma dirección devolvió un documento distinto');
    }
    return { veces, cambio, antesBits, bits };
  }

  /* ---- arranque ------------------------------------------------------ */
  function iniciar(opciones) {
    const o = Object.assign({ pagina: 'umbral', espera: 46 }, opciones || {});
    N.pagina = o.pagina;
    N.mem.cargar(N.estado.semilla);
    paleta();
    N.url.fijarSemillaEnURL();

    const via = (function () {
      try {
        const c = sessionStorage.getItem('npvs.copia.entro');
        if (c === o.pagina) { sessionStorage.removeItem('npvs.copia.entro'); return 'copia'; }
      } catch (e) {}
      return N.estado.via;
    })();

    const reg = N.mem.visita(o.pagina, via);
    const t0 = Date.now();
    const cerrar = () => { N.mem.permanencia(reg, Date.now() - t0); N.mem.escribir(); };
    N.bus.listen(window, 'pagehide', cerrar);
    N.bus.listen(document, 'visibilitychange', () => { if (document.hidden) cerrar(); });

    // superficies comunes
    const tel = document.querySelector('[data-telemetria]');
    if (tel) { telemetria(tel); N.bus.every(() => telemetria(tel), 1000); }
    const sal = document.querySelector('[data-salidas]');
    if (sal) salidas(sal, o.pagina);

    capturar(o.pagina);
    const rr = regreso(o.pagina);
    if (rr && rr.cambio) {
      const aviso = document.createElement('p');
      aviso.className = 'aviso-regreso';
      aviso.textContent = 'esta dirección ya fue abierta ' + (rr.veces - 1) + ' vez/veces. no devuelve el mismo documento.';
      const main = document.querySelector('main');
      if (main) main.insertBefore(aviso, main.firstChild);
    }

    if (via === 'copia') {
      N.copia.rastro('entré aquí antes que tú');
      document.body.classList.add('entrada-de-la-copia');
    }

    // la espera es un gesto
    N.bus.inactividad(o.espera, () => {
      N.mem.pausa(o.espera);
      const g = N.mem.gesto(o.pagina, 'espera', 0, 0, o.espera + 's');
      N.regB.codificar(g);
      if (sal) rutaPorEspera(sal, o.pagina);
    });
    N.bus.iniciarInactividad();

    // la copia despierta cuando hay con qué construirla
    if (N.copia.suficiente()) {
      N.copia.despertar();
      N.copia.iniciar({ enPagina: o.pagina });
    }

    // triángulo monocromático: tres relaciones del mismo color se cierran
    N.bus.on('triangulo', (t) => {
      N.mem.hito('triangulo-monocromatico', t.color);
      const av = document.createElement('div');
      av.className = 'aviso-triangulo clase-' + t.color;
      av.textContent = t.nodos.join(' · ') + ' — tres relaciones de ' + N.rutas.CLASES[t.color].etiqueta + ' se reconocieron como una sola';
      document.body.appendChild(av);
      N.bus.later(() => av.remove(), 9000);
    });

    N.bus.on('contradiccion', () => {
      if (N.mem.d.contradicciones.length >= 2) N.mem.hito('dos-recuerdos-incompatibles', N.mem.d.contradicciones.length);
    });

    // el botón Atrás deshace los cambios internos
    N.url.alVolver((s) => { N.bus.emit('volver', s); });

    document.documentElement.classList.add('npvs-listo');
    N.bus.emit('listo', { pagina: o.pagina });
    return { registro: reg, via };
  }

  N.shell = { iniciar, paleta, telemetria, salidas, capturar, regreso };

})(window.NPVS);
