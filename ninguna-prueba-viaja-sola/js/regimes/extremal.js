'use strict';
/* =====================================================================
   RÉGIMEN J — QUITAR HASTA QUE APAREZCA LA ESTRUCTURA
   el final no consiste en añadir una última pieza sino en eliminar
   conexiones. se poda el grafo de relaciones que el recorrido coloreó.

   TESTIGO sostiene una ley: ninguna prueba admisible es un bosque,
   porque toda prueba contiene al menos un regreso. La degeneración de un
   grafo —el mayor k tal que algún subgrafo tiene todos sus grados ≥ k—
   vale 1 exactamente cuando el grafo es un bosque. Si el visitante logra
   dejar el grafo en degeneración 1 sin desprender ningún documento, la
   ley queda refutada con un contraejemplo construido a mano.

   podar no es gratis: cada relación retirada degrada el registro que la
   produjo, y si formaba parte de un triángulo, el triángulo deja de
   existir aunque conste que existió.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const LEY = 'NINGUNA PRUEBA ADMISIBLE ES UN BOSQUE: TODA PRUEBA CONTIENE AL MENOS UN REGRESO.';

  function podadas() {
    const e = N.mem.regimen('J', {}).estado;
    e.podadas = e.podadas || [];
    return e.podadas;
  }

  /* el grafo vivo: lo coloreado menos lo retirado */
  function grafo() {
    const fuera = new Set(podadas());
    return N.mem.d.aristas.filter(a => !fuera.has(a[3]));
  }

  function vertices(aristas) {
    const v = new Set();
    for (const a of aristas) { v.add(a[0]); v.add(a[1]); }
    return v;
  }

  /* degeneración por pelado de grado mínimo. es el algoritmo clásico y
     devuelve además el orden en que los documentos se desprenden. */
  function degeneracion(aristas) {
    const ady = {};
    for (const a of aristas) {
      (ady[a[0]] = ady[a[0]] || new Set()).add(a[1]);
      (ady[a[1]] = ady[a[1]] || new Set()).add(a[0]);
    }
    const vivos = new Set(Object.keys(ady));
    let k = 0;
    const orden = [];
    while (vivos.size) {
      let min = null, gmin = Infinity;
      for (const v of vivos) {
        let g = 0;
        for (const u of ady[v]) if (vivos.has(u)) g++;
        if (g < gmin) { gmin = g; min = v; }
      }
      k = Math.max(k, gmin);
      orden.push({ v: min, g: gmin });
      vivos.delete(min);
    }
    return { k: k, orden: orden };
  }

  /* componentes conexas del grafo vivo */
  function componentes(aristas) {
    const ady = {};
    for (const a of aristas) {
      (ady[a[0]] = ady[a[0]] || []).push(a[1]);
      (ady[a[1]] = ady[a[1]] || []).push(a[0]);
    }
    const visto = new Set(), comps = [];
    for (const v of Object.keys(ady)) {
      if (visto.has(v)) continue;
      const pila = [v], c = [];
      visto.add(v);
      while (pila.length) {
        const x = pila.pop(); c.push(x);
        for (const y of ady[x]) if (!visto.has(y)) { visto.add(y); pila.push(y); }
      }
      comps.push(c);
    }
    return comps;
  }

  /* ¿algún documento quedó suelto? podar hasta desprender no refuta
     nada: sólo destruye el expediente. */
  function desprendidos() {
    const original = vertices(N.mem.d.aristas);
    const vivos = vertices(grafo());
    return Array.from(original).filter(v => !vivos.has(v));
  }

  function estado() {
    const g = grafo();
    const d = degeneracion(g);
    const sueltos = desprendidos();
    const comps = componentes(g);
    return {
      aristas: g.length,
      originales: N.mem.d.aristas.length,
      podadas: podadas().length,
      degeneracion: d.k,
      orden: d.orden,
      componentes: comps.length,
      documentos: vertices(g).size,
      desprendidos: sueltos,
      /* el contraejemplo: un bosque que no soltó a nadie. no se admite si
         nunca hubo prueba que demoler —el expediente original tiene que
         haber tenido al menos un regreso y cierto tamaño—. cuanto más
         largo fue el recorrido, más ciclos hay y más caro sale el final. */
      habiaPrueba: N.mem.d.aristas.length >= 6 && degeneracion(N.mem.d.aristas).k >= 2,
      refuta: d.k <= 1 && sueltos.length === 0 && g.length >= 4 &&
        N.mem.d.aristas.length >= 6 && degeneracion(N.mem.d.aristas).k >= 2
    };
  }

  /* ---- podar ---------------------------------------------------------- */
  function podar(clave) {
    const m = N.mem.d;
    const arista = m.aristas.find(a => a[3] === clave);
    if (!arista) return { hecho: false, razon: 'esa relación no existe' };
    if (podadas().indexOf(clave) >= 0) return { hecho: false, razon: 'esa relación ya fue retirada' };

    const e = N.mem.regimen('J', {}).estado;
    e.podadas.push(clave);

    const notas = [];

    /* el registro que produjo la relación se degrada: quitar una arista
       es quitar la razón por la que la bitácora decía algo. */
    const reg = m.rutas.slice().reverse().find(r => (r.p === arista[0] || r.p === arista[1]) && r.c === 'verdadero');
    if (reg) {
      reg.c = 'degradado';
      reg.causa = 'la relación ' + arista[0] + '–' + arista[1] + ' fue retirada del grafo';
      notas.push('un registro de la bitácora quedó sin causa.');
    }

    /* si la relación sostenía un triángulo, el triángulo deja de estar
       aunque conste que estuvo. */
    const rotos = m.triangulos.filter(t => t.nodos.indexOf(arista[0]) >= 0 && t.nodos.indexOf(arista[1]) >= 0);
    if (rotos.length) {
      m.triangulos = m.triangulos.filter(t => rotos.indexOf(t) < 0);
      for (const t of rotos) {
        N.mem.contradiccion(
          'se cerró el triángulo ' + t.nodos.join('–'),
          'ese triángulo no está en el grafo',
          'la relación ' + arista[0] + '–' + arista[1] + ' fue retirada después de cerrarlo');
      }
      notas.push('se deshizo un triángulo que ya había ocurrido.');
    }

    /* el circuito pierde la puerta correspondiente: menos nodos, más hueco */
    const est = N.mem.regimen('E', {}).estado;
    est.huecos = (est.huecos || 0) + 1;

    N.mem.guardar(true);
    N.mem.hito('conexion-eliminada', clave);

    const st = estado();
    if (st.desprendidos.length) {
      notas.push('quedaron documentos desprendidos: eso no refuta la ley, sólo rompe el expediente.');
    }
    if (st.refuta && !N.mem.tieneHito('la-demostracion-fallo')) {
      N.mem.hito('la-demostracion-fallo', st.aristas);
      N.mem.contradiccion(LEY, 'este expediente es un bosque y no soltó a nadie',
        'contraejemplo construido retirando ' + st.podadas + ' relaciones');
      N.bus.emit('demostracion-fallida', st);
      notas.push('la ley quedó refutada.');
    }
    N.bus.emit('poda', { clave, estado: st });
    return { hecho: true, notas: notas, estado: st };
  }

  function devolver(clave) {
    const e = N.mem.regimen('J', {}).estado;
    const i = e.podadas.indexOf(clave);
    if (i < 0) return false;
    e.podadas.splice(i, 1);
    N.mem.guardar(true);
    N.bus.emit('poda', { clave, estado: estado() });
    return true;
  }

  N.regJ = { LEY, grafo, estado, degeneracion, componentes, podar, devolver, podadas, desprendidos };

})(window.NPVS);
