'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — routes.js
   el catálogo, el color de las relaciones y el grafo que el recorrido
   va coloreando. cruzar un enlace no sólo cambia de página: pinta una
   arista, y tres aristas del mismo color cierran algo que no debía
   cerrarse.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  /* ---- clases de relación (los colores significan) ------------------ */
  const CLASES = {
    copia:         { g: 0, etiqueta: 'copia' },
    contradiccion: { g: 1, etiqueta: 'contradicción' },
    recuerdo:      { g: 2, etiqueta: 'recuerdo' },
    transmision:   { g: 3, etiqueta: 'transmisión' },
    silencio:      { g: 4, etiqueta: 'silencio' },
    aproximacion:  { g: 5, etiqueta: 'aproximación' },
    perdida:       { g: 6, etiqueta: 'pérdida' }
  };
  const ORDEN = Object.keys(CLASES);

  /* ---- catálogo -----------------------------------------------------
     archivo, título corto, régimen dominante y si el mapa la conoce. */
  const catalogo = {
    umbral:       { f: 'index.html',                t: 'umbral',                    r: 'A', mapa: true },
    recepcion:    { f: 'paginas/recepcion.html',    t: 'recepción',                 r: 'A', mapa: true },
    residuo:      { f: 'paginas/residuo.html',      t: 'residuo',                   r: 'A', mapa: true },
    expulsion:    { f: 'paginas/expulsion.html',    t: 'expulsión',                 r: 'A', mapa: true },
    separacion:   { f: 'paginas/separacion.html',   t: 'separación',                r: 'B', mapa: true },
    matriz:       { f: 'paginas/matriz.html',       t: 'matriz',                    r: 'B', mapa: true },
    constelacion: { f: 'paginas/constelacion.html', t: 'constelación',              r: 'B', mapa: true },
    bit:          { f: 'paginas/bit.html',          t: 'un bit',                    r: 'B', mapa: false },
    reticula:     { f: 'paginas/reticula.html',     t: 'retícula',                  r: 'G', mapa: true },
    vecino:       { f: 'paginas/vecino.html',       t: 'vecino',                    r: 'G', mapa: true },
    distancia:    { f: 'paginas/distancia.html',    t: 'distancia irresuelta',      r: 'G', mapa: true },
    caja:         { f: 'paginas/caja.html',         t: 'caja',                      r: 'H', mapa: true },
    interior:     { f: 'paginas/interior.html',     t: 'interior',                  r: 'H', mapa: false },
    circuito:     { f: 'paginas/circuito.html',     t: 'circuito',                  r: 'E', mapa: true },
    poda:         { f: 'paginas/poda.html',         t: 'poda',                      r: 'J', mapa: false },
    bitacora:     { f: 'paginas/bitacora.html',     t: 'bitácora',                  r: '·', mapa: true },
    contradiccion:{ f: 'paginas/contradiccion.html',t: 'contradicción',             r: 'D', mapa: true },
    copia:        { f: 'paginas/copia.html',        t: 'la copia',                  r: 'C', mapa: true },
    hueco:        { f: 'paginas/hueco.html',        t: 'hueco',                     r: '·', mapa: false },
    testigo:      { f: 'paginas/testigo.html',      t: 'TESTIGO',                   r: '·', mapa: true },
    original:     { f: 'paginas/original.html',     t: 'el original',               r: '·', mapa: false },
    sonda:        { f: 'paginas/sonda.html',        t: 'sonda',                     r: '·', mapa: true },
    ruido:        { f: 'paginas/ruido.html',        t: 'ruido',                     r: '·', mapa: true },
    demora:       { f: 'paginas/demora.html',       t: 'demora',                    r: '·', mapa: false },
    umbralfalso:  { f: 'paginas/umbral-falso.html', t: 'umbral (otra vez)',         r: 'D', mapa: false },
    mapa:         { f: 'mapa.html',                 t: 'mapa incompleto',           r: '·', mapa: true },
    certificado:  { f: 'certificado.html',          t: 'certificado',               r: 'J', mapa: true }
  };
  const IDS = Object.keys(catalogo);

  /* ---- topología: estructural (fija por semilla) --------------------
     cada página conserva al menos una salida estable; el resto se
     recalcula al cargar. el grafo es circular: no hay callejón. */
  const ESTRUCTURA = {
    umbral:        ['recepcion', 'separacion', 'reticula'],
    recepcion:     ['separacion', 'residuo', 'testigo'],
    residuo:       ['expulsion', 'bitacora', 'reticula'],
    expulsion:     ['residuo', 'ruido', 'circuito'],
    separacion:    ['matriz', 'constelacion', 'recepcion'],
    matriz:        ['bit', 'separacion', 'contradiccion'],
    constelacion:  ['separacion', 'reticula', 'sonda'],
    bit:           ['matriz', 'hueco'],
    reticula:      ['vecino', 'distancia', 'residuo'],
    vecino:        ['distancia', 'original', 'reticula'],
    distancia:     ['reticula', 'caja', 'copia'],
    caja:          ['interior', 'expulsion', 'bitacora'],
    interior:      ['caja', 'hueco'],
    circuito:      ['poda', 'bitacora', 'testigo'],
    poda:          ['circuito', 'mapa', 'testigo'],
    bitacora:      ['contradiccion', 'circuito', 'mapa'],
    contradiccion: ['umbralfalso', 'bitacora', 'testigo'],
    copia:         ['bitacora', 'contradiccion', 'sonda'],
    hueco:         ['umbral', 'demora'],
    testigo:       ['separacion', 'circuito', 'certificado'],
    original:      ['vecino', 'distancia', 'ruido'],
    sonda:         ['recepcion', 'ruido', 'copia'],
    ruido:         ['residuo', 'sonda', 'matriz'],
    demora:        ['hueco', 'original', 'bitacora'],
    umbralfalso:   ['recepcion', 'contradiccion', 'copia'],
    mapa:          ['umbral', 'bitacora', 'testigo'],
    certificado:   ['umbral', 'mapa', 'bitacora']
  };

  /* cada documento pertenece a una clase. el color de una relación no es
     el color de su destino —eso produciría estrellas, nunca triángulos—
     sino la suma de las dos clases en Z/7. de ahí se sigue que un
     triángulo monocromático sólo puede cerrarse entre tres documentos de
     la misma clase: tres versiones del mismo acontecimiento. */
  const CLASE_PAGINA = {
    umbral: 'transmision', recepcion: 'transmision', sonda: 'transmision', testigo: 'transmision',
    bitacora: 'recuerdo', mapa: 'recuerdo', certificado: 'recuerdo', constelacion: 'recuerdo',
    hueco: 'silencio', original: 'silencio', demora: 'silencio',
    reticula: 'aproximacion', vecino: 'aproximacion', distancia: 'aproximacion', caja: 'aproximacion',
    separacion: 'contradiccion', matriz: 'contradiccion', bit: 'contradiccion', contradiccion: 'contradiccion',
    copia: 'copia', umbralfalso: 'copia', interior: 'copia',
    residuo: 'perdida', expulsion: 'perdida', ruido: 'perdida', poda: 'perdida',
    circuito: 'aproximacion'
  };

  function claseDePagina(id) { return CLASE_PAGINA[id] || 'transmision'; }

  function claseDe(de, a) {
    const i = ORDEN.indexOf(claseDePagina(de));
    const j = ORDEN.indexOf(claseDePagina(a));
    return ORDEN[(i + j) % ORDEN.length];
  }

  /* ---- salida recalculada -------------------------------------------
     lee la memoria: busca una página no usada; si el mundo ya fue
     recorrido, evita el tramo reciente. no premia el circuito corto. */
  function recalculada(desde) {
    const m = N.mem.d;
    const recientes = new Set(N.mem.ultimasPaginas(7));
    const vistas = new Set(N.mem.paginasVistas());
    const r = N.seed.make(N.estado.semilla, 'salida:' + desde + ':' + m.rutas.length);
    const candidatas = IDS.filter(id => id !== desde && id !== 'certificado');
    const noUsadas = candidatas.filter(id => !vistas.has(id));
    let pool = noUsadas.length ? noUsadas : candidatas.filter(id => !recientes.has(id));
    if (!pool.length) pool = candidatas;
    return r.pick(pool);
  }

  /* ---- el grafo multicolor ------------------------------------------ */
  function registrarArista(de, a, clase) {
    const m = N.mem.d;
    if (!de || !a || de === a) return null;
    const k = [de, a].sort().join('|');
    const ya = m.aristas.find(e => e[3] === k);
    if (ya) return ya;
    const e = [de, a, clase, k];
    m.aristas.push(e);
    m.colores[clase] = (m.colores[clase] || 0) + 1;
    const tri = buscarTriangulo();
    N.mem.guardar();
    if (tri) N.bus.emit('triangulo', tri);
    return e;
  }

  /* triángulo monocromático: tres fragmentos que se reconocen como
     versiones del mismo acontecimiento. */
  function buscarTriangulo() {
    const m = N.mem.d;
    const porColor = {};
    for (const [a, b, c] of m.aristas) {
      (porColor[c] = porColor[c] || []).push([a, b]);
    }
    for (const c in porColor) {
      const ady = {};
      for (const [a, b] of porColor[c]) {
        (ady[a] = ady[a] || new Set()).add(b);
        (ady[b] = ady[b] || new Set()).add(a);
      }
      const nodos = Object.keys(ady);
      for (let i = 0; i < nodos.length; i++)
        for (const x of ady[nodos[i]])
          for (const y of ady[nodos[i]]) {
            if (x >= y) continue;
            if (ady[x] && ady[x].has(y)) {
              const firma = [nodos[i], x, y].sort().join('|') + ':' + c;
              if (m.triangulos.some(t => t.firma === firma)) continue;
              const t = { firma, color: c, nodos: [nodos[i], x, y].sort(), t: Date.now() };
              m.triangulos.push(t);
              return t;
            }
          }
    }
    return null;
  }

  function gradoCromatico(clase) { return (N.mem.d.colores[clase] || 0); }

  /* ---- construcción de salidas para una página ---------------------- */
  function salidasDe(id) {
    const est = (ESTRUCTURA[id] || ['umbral', 'bitacora']).slice();
    const out = [];
    // la primera es estructural y no se destruye nunca
    out.push({ a: est[0], tipo: 'estructural', clase: claseDe(id, est[0]) });
    // la segunda tampoco: el mundo siempre conserva una bifurcación real
    if (est[1]) out.push({ a: est[1], tipo: 'estructural', clase: claseDe(id, est[1]) });
    // las siguientes son recalculadas y pueden destruirse al seguirlas
    const rec = recalculada(id);
    if (!out.some(o => o.a === rec)) out.push({ a: rec, tipo: 'recalculada', clase: claseDe(id, rec) });
    if (est[2] && !out.some(o => o.a === est[2])) out.push({ a: est[2], tipo: 'recalculada', clase: claseDe(id, est[2]) });
    return out;
  }

  function href(id, extra) {
    const c = catalogo[id];
    if (!c) return N.url.href('index.html', extra);
    return N.url.href(c.f, extra);
  }

  N.rutas = {
    CLASES, ORDEN, catalogo, IDS, ESTRUCTURA,
    claseDe, claseDePagina, CLASE_PAGINA, recalculada, registrarArista, buscarTriangulo, gradoCromatico,
    salidasDe, href
  };

})(window.NPVS);
