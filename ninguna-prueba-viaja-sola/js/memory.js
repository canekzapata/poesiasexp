'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — memory.js
   la memoria no es un registro: es un aparato que recuerda, degrada,
   infiere e inventa. cada mentira tiene causa y se puede reproducir
   con la misma semilla.

   clases internas de un registro:
     verdadero    — lo que ocurrió y sigue diciendo que ocurrió
     degradado    — lo que ocurrió pero ya no se dice igual
     inferencia   — lo que la copia deduce y la memoria acepta
     inventado    — lo que nunca pasó y la memoria sostiene
     contradiccion— dos afirmaciones que no caben juntas
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const LIM = { rutas: 400, gestos: 700, codigos: 260, aristas: 320, contradicciones: 90, fragmentos: 80, falsos: 60, actos: 120 };
  const CLAVE = (semilla) => 'npvs.' + semilla;

  function vacio(semilla) {
    return {
      v: 1,
      semilla: semilla,
      creada: Date.now(),
      cargas: 0,
      rutas: [],
      gestos: [],
      celdas: {},
      codigos: [],
      colores: {},
      aristas: [],
      triangulos: [],
      contradicciones: [],
      fragmentos: [],
      regimenes: {},
      falsos: [],
      copia: { transiciones: {}, direcciones: { izq: 0, der: 0, arriba: 0, abajo: 0 }, pausas: [], color: null, actos: [], activa: false, despertada: 0 },
      bits: { perdidos: 0, flips: [] },
      espectro: { v: 1, huellas: [], sostenidos: [], expulsados: [], regresos: 0, ultimoRegreso: null },
      hitos: {},
      destruidas: [],
      esperadas: [],
      ultima: null
    };
  }

  let datos = null;
  let semillaActual = null;
  let sucio = false;
  let guardarLuego = null;

  function cargar(semilla) {
    semillaActual = semilla;
    let d = null;
    try {
      const raw = localStorage.getItem(CLAVE(semilla));
      if (raw) d = JSON.parse(raw);
    } catch (e) { d = null; }
    if (!d || d.v !== 1) d = vacio(semilla);
    // reparación defensiva: una memoria a medias sigue siendo memoria
    const base = vacio(semilla);
    for (const k in base) if (!(k in d)) d[k] = base[k];
    for (const k in base.copia) if (!(k in d.copia)) d.copia[k] = base.copia[k];
    datos = d;
    datos.cargas++;
    degradar();
    guardar(true);
    return datos;
  }

  function guardar(ahora) {
    if (!datos) return;
    sucio = true;
    if (ahora) return escribir();
    if (guardarLuego) return;
    guardarLuego = setTimeout(escribir, 800);
  }

  function escribir() {
    guardarLuego = null;
    if (!datos || !sucio) return;
    podar();
    try { localStorage.setItem(CLAVE(datos.semilla), JSON.stringify(datos)); sucio = false; }
    catch (e) {
      // memoria llena: la obra pierde lo más viejo, como debe ser
      datos.gestos = datos.gestos.slice(-120);
      datos.rutas = datos.rutas.slice(-80);
      try { localStorage.setItem(CLAVE(datos.semilla), JSON.stringify(datos)); sucio = false; } catch (e2) {}
    }
  }

  function podar() {
    for (const k in LIM) if (Array.isArray(datos[k]) && datos[k].length > LIM[k]) datos[k] = datos[k].slice(-LIM[k]);
    if (datos.copia.actos.length > LIM.actos) datos.copia.actos = datos.copia.actos.slice(-LIM.actos);
    const cel = Object.keys(datos.celdas);
    if (cel.length > 900) {
      cel.sort((a, b) => datos.celdas[a] - datos.celdas[b]);
      for (const c of cel.slice(0, cel.length - 700)) delete datos.celdas[c];
    }
  }

  /* ---- registro ---------------------------------------------------- */

  function visita(pagina, via) {
    const r = { p: pagina, t: Date.now(), d: 0, via: via || 'ruta', c: 'verdadero' };
    datos.rutas.push(r);
    const prev = datos.ultima;
    if (prev && prev !== pagina) {
      const k = prev + '>' + pagina;
      datos.copia.transiciones[k] = (datos.copia.transiciones[k] || 0) + 1;
    }
    datos.ultima = pagina;
    guardar(true);   // la visita se escribe ya: una salida rápida también cuenta
    return r;
  }

  function permanencia(reg, ms) {
    if (!reg) return;
    reg.d = Math.min(1000 * 60 * 30, Math.round(ms));
    guardar();
  }

  function gesto(pagina, tipo, x, y, extra) {
    const g = { p: pagina, k: tipo, x: Math.round(x || 0), y: Math.round(y || 0), t: Date.now() };
    if (extra) g.e = extra;
    datos.gestos.push(g);
    guardar();
    N.bus && N.bus.emit('gesto', g);
    return g;
  }

  function celda(pagina, gx, gy) {
    const k = pagina + ':' + gx + ',' + gy;
    datos.celdas[k] = (datos.celdas[k] || 0) + 1;
    sucio = true;
    if (!guardarLuego) guardarLuego = setTimeout(escribir, 2000);
  }

  function direccion(d) {
    if (d in datos.copia.direcciones) { datos.copia.direcciones[d]++; guardar(); }
  }

  function pausa(seg) {
    datos.copia.pausas.push(Math.round(seg));
    if (datos.copia.pausas.length > 40) datos.copia.pausas.shift();
    guardar();
  }

  function fragmento(f) {
    const ya = datos.fragmentos.find(x => x.id === f.id);
    if (ya) { Object.assign(ya, f); } else { datos.fragmentos.push(f); }
    guardar();
    N.bus && N.bus.emit('fragmento', f);
  }

  function contradiccion(a, b, causa) {
    const c = { a, b, causa, t: Date.now() };
    datos.contradicciones.push(c);
    guardar();
    N.bus && N.bus.emit('contradiccion', c);
    return c;
  }

  function falso(tipo, ref, causa) {
    const f = { tipo, ref, causa, t: Date.now() };
    datos.falsos.push(f);
    guardar();
    return f;
  }

  function hito(nombre, valor) {
    if (datos.hitos[nombre]) return false;
    datos.hitos[nombre] = { t: Date.now(), v: valor === undefined ? true : valor };
    guardar(true);
    N.bus && N.bus.emit('hito', { nombre, valor });
    return true;
  }
  function tieneHito(n) { return !!datos.hitos[n]; }
  function cuentaHitos() { return Object.keys(datos.hitos).length; }

  function regimen(letra, parche) {
    const r = datos.regimenes[letra] = datos.regimenes[letra] || { visto: 0, hecho: 0, estado: {} };
    if (parche) Object.assign(r, parche);
    guardar();
    return r;
  }

  /* ---- degradación causal ------------------------------------------
     se ejecuta una vez por carga. no inventa al azar: cada alteración
     depende de (semilla, número de carga, índice del registro). */
  function degradar() {
    const C = datos.cargas;
    if (C < 3 || datos.rutas.length < 5) return;
    const r = N.seed.make(datos.semilla, 'degradacion:' + C);

    /* la erosión es lenta y acotada: como mucho un registro por carga, y
       nunca los tres últimos. cada navegación es una carga, así que una
       moneda por registro y por carga borraba la bitácora entera en veinte
       saltos y dejaba sin sentido la distinción entre lo que ocurrió y lo
       que la memoria dice. lo que se degrada es siempre lo más viejo que
       sigue en pie. */
    const presion = Math.min(0.45, 0.10 + 0.015 * (C - 3) + 0.02 * datos.bits.perdidos
      + 0.03 * datos.fragmentos.filter(f => f.estado === 'perdido').length);
    if (r.raw() < presion) {
      let i = -1;
      for (let k = 1; k < datos.rutas.length - 3; k++) {
        if (datos.rutas[k].c === 'verdadero') { i = k; break; }
      }
      if (i > 0) {
        const reg = datos.rutas[i];
        const vecino = datos.rutas[i - 1];
        const real = reg.d;
        reg.d = vecino.d;                   // la memoria copia la permanencia contigua
        reg.c = 'degradado';
        reg.causa = 'la permanencia fue reemplazada por la de la página anterior en la carga ' + C;
        reg.real = real;
        if (real > 0 && (real > reg.d * 2 || reg.d > real * 2)) {
          const otra = datos.rutas.find((x, j) => j !== i && x.p === reg.p && x.c === 'verdadero');
          if (otra) contradiccion(
            'permanencia en ' + reg.p + ': ' + Math.round(reg.d / 100) / 10 + ' s',
            'permanencia en ' + reg.p + ': ' + Math.round(otra.d / 100) / 10 + ' s',
            'degradación reproducible (carga ' + C + ', registro ' + i + ')');
        }
      }
    }
    // inferencia: la copia sostiene una transición que nunca fue consecutiva
    const trans = Object.keys(datos.copia.transiciones);
    if (trans.length >= 4) {
      const total = trans.reduce((s, k) => s + datos.copia.transiciones[k], 0);
      const orden = trans.slice().sort((a, b) => datos.copia.transiciones[b] - datos.copia.transiciones[a]);
      const top = orden[0];
      const p = datos.copia.transiciones[top] / total;
      if (p >= 0.34) {
        const dest = top.split('>')[1];
        const nunca = orden.find(k => datos.copia.transiciones[k] === 1 && k.split('>')[1] !== dest);
        if (nunca && !datos.falsos.some(f => f.ref === nunca)) {
          falso('inferencia', nunca, 'la copia extendió su transición dominante (' + top + ', ' + Math.round(p * 100) + '%) a un tramo recorrido una sola vez');
        }
      }
    }
    /* invención: rara y con techo. una memoria que inventa más de lo que
       recuerda no es una memoria defectuosa, es ruido. */
    const inventados = datos.falsos.filter(f => f.tipo === 'inventado').length;
    if (C >= 6 && C % 6 === 0 && inventados < 4) {
      const rr = N.seed.make(datos.semilla, 'invencion:' + C);
      const vistas = new Set(datos.rutas.map(x => x.p));
      const cat = (N.rutas && N.rutas.catalogo) ? Object.keys(N.rutas.catalogo) : [];
      const noVistas = cat.filter(p => !vistas.has(p));
      if (noVistas.length && rr.raw() < 0.5) {
        const p = rr.pick(noVistas);
        if (!datos.falsos.some(f => f.ref === p && f.tipo === 'inventado')) {
          falso('inventado', p, 'con ' + C + ' cargas la memoria completó un hueco del catálogo con una página que nadie abrió');
          datos.rutas.push({ p: p, t: Date.now() - 86400000, d: 4000, via: 'inventada', c: 'inventado', causa: 'hueco completado en la carga ' + C });
        }
      }
    }
  }

  /* ---- lecturas derivadas ------------------------------------------ */

  function permanenciaTotal() { return datos.rutas.reduce((s, r) => s + (r.d || 0), 0); }
  function paginasVistas() { return Array.from(new Set(datos.rutas.filter(r => r.c !== 'inventado').map(r => r.p))); }
  function vecesEn(p) { return datos.rutas.filter(r => r.p === p).length; }
  function ultimasPaginas(n) { return datos.rutas.slice(-n).map(r => r.p); }
  function gestosEn(p) { return datos.gestos.filter(g => g.p === p); }
  function celdasDe(p) {
    const out = [];
    for (const k in datos.celdas) if (k.indexOf(p + ':') === 0) {
      const xy = k.slice(p.length + 1).split(',');
      out.push({ x: +xy[0], y: +xy[1], n: datos.celdas[k] });
    }
    return out;
  }

  function olvidar() {
    try { localStorage.removeItem(CLAVE(semillaActual)); } catch (e) {}
    datos = vacio(semillaActual);
    datos.cargas = 1;
    guardar(true);
  }

  /* abandonar la página no puede perder lo que ya ocurrió: la escritura
     pendiente se vacía antes de que el navegador cierre el documento. */
  window.addEventListener('pagehide', function () { escribir(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) escribir(); });

  N.mem = {
    cargar, guardar, escribir, olvidar,
    visita, permanencia, gesto, celda, direccion, pausa,
    fragmento, contradiccion, falso, hito, tieneHito, cuentaHitos, regimen,
    permanenciaTotal, paginasVistas, vecesEn, ultimasPaginas, gestosEn, celdasDe,
    get d() { return datos; },
    get semilla() { return semillaActual; }
  };

})(window.NPVS);
