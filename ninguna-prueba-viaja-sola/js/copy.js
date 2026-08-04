'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — copy.js
   LA COPIA: una aproximación conductual del visitante hecha con
   frecuencias, transiciones, ritmos y preferencias de dirección.
   no es una persona, no es una IA, no finge conciencia. es lo que cabe
   del visitante dentro de este aparato.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const MINIMO = { gestos: 16, paginas: 3, transiciones: 3 };

  function suficiente() {
    const m = N.mem.d;
    return m.gestos.length >= MINIMO.gestos
      && N.mem.paginasVistas().length >= MINIMO.paginas
      && Object.keys(m.copia.transiciones).length >= MINIMO.transiciones;
  }

  /* el modelo: nada aquí es inventado, todo se midió */
  function modelo() {
    const m = N.mem.d;
    const trans = m.copia.transiciones;
    const total = Object.keys(trans).reduce((s, k) => s + trans[k], 0) || 1;
    const pausas = m.copia.pausas.slice().sort((a, b) => a - b);
    const mediana = pausas.length ? pausas[Math.floor(pausas.length / 2)] : 9;
    const dirs = m.copia.direcciones;
    const dirTop = Object.keys(dirs).sort((a, b) => dirs[b] - dirs[a])[0] || 'der';
    const tipos = {};
    for (const g of m.gestos) tipos[g.k] = (tipos[g.k] || 0) + 1;
    const gestoTop = Object.keys(tipos).sort((a, b) => tipos[b] - tipos[a])[0] || 'clic';
    // rutas evitadas: páginas del catálogo enlazadas y nunca seguidas
    const vistas = new Set(N.mem.paginasVistas());
    const evitadas = N.rutas.IDS.filter(id => !vistas.has(id));
    // color preferido: la clase de relación más cruzada
    const color = Object.keys(m.colores).sort((a, b) => m.colores[b] - m.colores[a])[0] || null;
    return {
      transiciones: trans, total, mediana, dirTop, gestoTop, evitadas, color,
      celdas: m.celdas,
      ritmo: Math.max(4, Math.min(40, mediana))
    };
  }

  /* a dónde iría la copia desde aquí */
  function destino(desde) {
    const mo = modelo();
    const cand = Object.keys(mo.transiciones).filter(k => k.indexOf(desde + '>') === 0);
    if (cand.length) {
      cand.sort((a, b) => mo.transiciones[b] - mo.transiciones[a]);
      return cand[0].split('>')[1];
    }
    // sin datos de este nodo: la copia hereda la costumbre general
    const todos = Object.keys(mo.transiciones).sort((a, b) => mo.transiciones[b] - mo.transiciones[a]);
    return todos.length ? todos[0].split('>')[1] : 'bitacora';
  }

  function registrar(acto) {
    const m = N.mem.d;
    m.copia.actos.push(Object.assign({ t: Date.now(), p: N.pagina }, acto));
    N.mem.guardar();
    N.bus.emit('copia:acto', acto);
    if (m.copia.actos.length >= 5) N.mem.hito('la-copia-actua-sola', m.copia.actos.length);
  }

  let corriendo = null;

  function despertar() {
    const m = N.mem.d;
    if (!suficiente()) return false;
    if (!m.copia.activa) {
      m.copia.activa = true;
      m.copia.despertada = Date.now();
      const mo = modelo();
      m.copia.color = mo.color;
      N.mem.hito('la-copia-existe', mo.total);
      N.mem.guardar(true);
      N.bus.emit('copia:nace', mo);
    }
    return true;
  }

  /* la copia trabaja al ritmo del visitante, no al de un reloj */
  function iniciar(opciones) {
    if (corriendo) return corriendo;
    if (!despertar()) return null;
    const o = Object.assign({ enPagina: null }, opciones || {});
    const mo = modelo();
    const periodo = Math.max(6000, mo.ritmo * 900);
    let n = 0;

    const parar = N.bus.every(() => {
      n++;
      const acciones = ['frase', 'evitar', 'punto', 'color'];
      if (n % 4 === 0) acciones.push('seguir');
      const r = N.seed.make(N.estado.semilla, 'copia:' + N.mem.d.copia.actos.length);
      const a = r.pick(acciones);
      ejecutar(a, mo);
    }, periodo);

    corriendo = () => { parar(); corriendo = null; };
    return corriendo;
  }

  function ejecutar(tipo, mo) {
    mo = mo || modelo();
    switch (tipo) {
      case 'frase': {
        const r = N.seed.make(N.estado.semilla, 'copiafrase:' + N.mem.d.copia.actos.length);
        const frases = [
          'aquí me detuve ' + mo.ritmo + ' segundos, como tú',
          'de ' + (N.pagina || 'aquí') + ' se sale por ' + destino(N.pagina || 'umbral'),
          'no abriste ' + (mo.evitadas[0] || 'nada') + ' y yo tampoco',
          'tu gesto más frecuente es: ' + mo.gestoTop,
          'esto no lo pensé: lo repetí'
        ];
        const texto = r.pick(frases);
        rastro(texto);
        registrar({ tipo: 'frase', texto });
        break;
      }
      case 'evitar': {
        const id = mo.evitadas.length ? mo.evitadas[0] : null;
        const a = id && document.querySelector('a[data-destino="' + id + '"]');
        if (a) { a.classList.add('copia-evita'); a.setAttribute('title', 'la copia no entra aquí'); }
        registrar({ tipo: 'evitar', destino: id });
        break;
      }
      case 'punto': {
        N.bus.emit('copia:punto', { dir: mo.dirTop });
        registrar({ tipo: 'punto', dir: mo.dirTop });
        break;
      }
      case 'color': {
        if (mo.color) {
          document.documentElement.style.setProperty('--acento', 'var(--c-' + mo.color + ')');
          registrar({ tipo: 'color', color: mo.color });
        }
        break;
      }
      case 'seguir': {
        // sólo si el visitante lleva rato quieto: la copia no roba el timón
        if (N.bus.ociosoDesde() < 42) { registrar({ tipo: 'seguir-no', razon: 'el visitante estaba usando el aparato' }); break; }
        const d = destino(N.pagina || 'umbral');
        if (!d || !N.rutas.catalogo[d]) break;
        registrar({ tipo: 'seguir', destino: d });
        N.mem.hito('la-copia-navego-sola', d);
        // deja escrito que fue ella
        try { sessionStorage.setItem('npvs.copia.entro', d); } catch (e) {}
        rastro('sigo sin ti a ' + N.rutas.catalogo[d].t);
        N.bus.later(() => { window.location.href = N.rutas.href(d, { v: 'copia' }); }, 2600);
        break;
      }
    }
  }

  function rastro(texto) {
    let caja = document.querySelector('.copia-rastro');
    if (!caja) {
      caja = document.createElement('aside');
      caja.className = 'copia-rastro';
      caja.setAttribute('aria-live', 'polite');
      caja.innerHTML = '<b>la copia</b>';
      document.body.appendChild(caja);
    }
    const p = document.createElement('p');
    p.textContent = texto;
    caja.appendChild(p);
    while (caja.querySelectorAll('p').length > 5) caja.querySelector('p').remove();
  }

  N.copia = { suficiente, despertar, iniciar, modelo, destino, ejecutar, registrar, rastro, MINIMO,
    get activa() { return !!(N.mem.d && N.mem.d.copia.activa); } };

})(window.NPVS);
