'use strict';
/* =====================================================================
   EL ESPECTRO TAMBIÉN RECUERDA — espectro.js
   el segundo expediente. no es una banda sonora: es una memoria musical
   sometida a las mismas leyes que la textual —se conserva, se degrada,
   se infiere, se inventa y se contradice—.

   este módulo NO produce sonido. describe estados y transformaciones.
   `sonido.js` sólo vuelve audible lo que aquí se calcula, y el modelo
   sigue corriendo con la bocina apagada: no puede haber dos narrativas.

   nada se decide con Math.random(). toda variación viene de la semilla y
   deja causa escrita.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const PARCIALES = 16;
  const LIM = { huellas: 60 };

  /* clases de herida: qué le hace al espectro perder un bit del mensaje.
     el bit apagado decide la operación; el carácter decide el parcial. */
  const HERIDAS = ['callar', 'desafinar', 'duplicar', 'formante', 'ruido'];

  function base() {
    return { v: 1, huellas: [], sostenidos: [], expulsados: [], regresos: 0, ultimoRegreso: null };
  }

  /* migración defensiva: una memoria vieja no se borra, se completa */
  function estadoGuardado() {
    const m = N.mem.d;
    if (!m.espectro || m.espectro.v !== 1) {
      m.espectro = Object.assign(base(), m.espectro && typeof m.espectro === 'object' ? m.espectro : {});
      m.espectro.v = 1;
      for (const k in base()) if (m.espectro[k] === undefined) m.espectro[k] = base()[k];
      N.mem.guardar();
    }
    return m.espectro;
  }

  /* ---- LA FUNDAMENTAL HERIDA ---------------------------------------
     un solo organismo por semilla. la fundamental y el estiramiento de
     los parciales vienen de la semilla; las heridas, del mensaje. */
  function origen() {
    const r = N.seed.make(N.estado.semilla, 'espectro:origen');
    const f0 = 55 * Math.pow(2, r.f(0, 0.85));          // entre 55 y ~99 Hz
    const estira = r.f(0, 0.021);                        // 0 = armónico puro
    const caida = r.f(0.75, 1.35);                       // pendiente del espectro
    const parciales = [];
    for (let i = 1; i <= PARCIALES; i++) {
      parciales.push({
        i: i,
        f: f0 * Math.pow(i, 1 + estira),
        a: 1 / Math.pow(i, caida),
        desv: 0,
        modo: 'armonico',      // armonico · desafinado · duplicado · formante · ruido · callado
        umbral: r.f(0.12, 0.55), // cuánto hace falta para que cruce lo audible
        causa: null
      });
    }
    return { f0: f0, estira: estira, caida: caida, parciales: parciales };
  }

  /* el espectro actual: el origen más todo lo que le pasó */
  function estado() {
    const m = N.mem.d;
    const esp = estadoGuardado();
    const org = origen();
    const P = org.parciales.map(p => Object.assign({}, p));

    /* las heridas del mensaje. cada bit apagado tiene índice de carácter
       y posición de bit: el carácter elige el parcial, el bit la herida. */
    /* el daño se acumula, no se sustituye: un parcial callado no revive
       porque le caiga otra herida encima. el mensaje no se cura, y por eso
       el tema va perdiendo notas conforme se pierden bits. */
    (m.bits.flips || []).forEach(function (f, n) {
      const p = P[f[0] % PARCIALES];
      const herida = HERIDAS[f[1] % HERIDAS.length];
      p.heridas = (p.heridas || 0) + 1;
      p.causa = f[2] || 'bit ' + n;
      if (p.modo === 'callado') return;                   // ya no hay nada que herir
      if (herida === 'callar') { p.modo = 'callado'; p.a = 0; }
      else if (herida === 'desafinar') { p.modo = 'desafinado'; p.desv = ((f[1] % 2) ? 1 : -1) * (0.8 + (f[0] % 5) * 0.6); }
      else if (herida === 'duplicar') { p.modo = 'duplicado'; p.desv = 0.6 + (f[0] % 4) * 0.35; }
      else if (herida === 'formante') { p.modo = 'formante'; p.a = Math.min(1, p.a * 3.2); }
      else { p.modo = 'ruido'; }
      /* tres heridas sobre el mismo parcial lo acaban callando: insistir
         sobre lo mismo no lo transforma indefinidamente, lo apaga. */
      if (p.heridas >= 3) { p.modo = 'callado'; p.a = 0; p.causa = 'tres heridas sobre el mismo parcial'; }
    });

    /* los fragmentos expulsados se llevan su parcial a otra página */
    (m.fragmentos || []).forEach(function (fr, k) {
      if (fr.estado !== 'expulsado' && fr.estado !== 'perdido') return;
      const p = P[(k * 5 + 3) % PARCIALES];
      if (p.modo !== 'callado') { p.modo = 'callado'; p.a = 0; p.causa = 'expulsado con «' + fr.texto + '»'; }
    });

    /* las contradicciones duplican parciales vecinos: de ahí los batimientos */
    (m.contradicciones || []).forEach(function (c, k) {
      const p = P[(k * 7 + 1) % PARCIALES];
      if (p.modo === 'callado') return;
      p.modo = 'duplicado';
      p.desv = Math.max(p.desv, 0.4 + (k % 5) * 0.5);
      p.causa = c.causa;
    });

    /* B · la distancia mínima entre recuerdos gobierna la rugosidad:
       recuerdos que casi se confunden hacen parciales que casi se confunden */
    const dmin = N.regB ? N.regB.distanciaMinima() : N.regB_DMIN;
    const rugosidad = Math.max(0, Math.min(1, (N.regB ? N.regB.DMIN + 3 : 6) - dmin) / 6);

    /* los parciales sostenidos cruzaron el umbral y ya no lo desandan */
    for (const i of esp.sostenidos) { const p = P[i % PARCIALES]; if (p) p.sostenido = true; }

    /* E · fundir puertas funde también procesos sonoros equivalentes */
    const opsE = ((m.regimenes.E && m.regimenes.E.estado.ops) || []).length;
    if (opsE) {
      for (let k = 0; k < Math.min(opsE * 2, PARCIALES - 4); k++) {
        const p = P[PARCIALES - 1 - k];
        if (p.modo !== 'callado') { p.fundido = true; p.a *= 0.45; }
      }
    }

    /* J · podar retira relaciones: sin ellas hay menos regresos posibles */
    const podadas = (m.regimenes.J && m.regimenes.J.estado.podadas) ? m.regimenes.J.estado.podadas.length : 0;

    return {
      f0: org.f0, estira: org.estira, caida: org.caida,
      parciales: P, rugosidad: rugosidad, dmin: dmin,
      fundidos: opsE, podadas: podadas,
      armonicidad: armonicidad(P),
      huellas: esp.huellas,
      sostenidos: esp.sostenidos.slice(),
      regresosPosibles: regresosPosibles(esp, podadas)
    };
  }

  function armonicidad(P) {
    const vivos = P.filter(p => p.modo !== 'callado');
    if (!vivos.length) return 0;
    const puros = vivos.filter(p => p.modo === 'armonico' || p.modo === 'formante').length;
    return Math.round((puros / vivos.length) * 100) / 100;
  }

  /* cuántos regresos quedan disponibles: la poda los va cerrando */
  function regresosPosibles(esp, podadas) {
    const vivas = esp.huellas.filter(h => h.clase !== 'inventado');
    return Math.max(0, vivas.length - podadas);
  }

  /* ---- inscribir: una acción significativa deja una morfología ------ */
  function inscribir(tipo, pagina, datos) {
    const esp = estadoGuardado();
    const m = N.mem.d;
    const r = N.seed.make(N.estado.semilla, 'huella:' + esp.huellas.length);
    const org = origen();
    /* el parcial que cruza el umbral lo decide el código del gesto:
       la instrumentación del espectro la escribe el visitante sin elegirla */
    const w = (m.codigos.length ? m.codigos[m.codigos.length - 1].w : N.regG.codigoDelRecorrido());
    let n = 0;
    for (let i = 0; i < 4; i++) n = n * 2 + (+w[i]);
    const parcial = 1 + ((n + esp.huellas.length) % (PARCIALES - 1));

    const h = {
      id: 'h' + esp.huellas.length,
      tipo: tipo,                       // sostener · interrumpir
      pagina: pagina,
      parcial: parcial,
      dur: datos && datos.dur ? datos.dur : Math.round(r.f(3.5, 8.5) * 10) / 10,
      escala: 1,
      estado: tipo === 'sostener' ? 'creciendo' : 'residuo',
      clase: 'verdadero',
      regresos: 0,
      t: Date.now(),
      causa: (datos && datos.causa) || 'inscrita por ' + tipo,
      genealogia: []
    };
    esp.huellas.push(h);
    if (esp.huellas.length > LIM.huellas) esp.huellas = esp.huellas.slice(-LIM.huellas);
    N.mem.guardar();
    N.bus.emit('espectro:inscripcion', h);
    return h;
  }

  /* una huella que estaba creciendo se completa: el parcial cruzó */
  function sostener(h) {
    const esp = estadoGuardado();
    if (!h || h.estado !== 'creciendo') return false;
    h.estado = 'completa';
    if (esp.sostenidos.indexOf(h.parcial) < 0) esp.sostenidos.push(h.parcial);
    N.mem.guardar(true);
    N.mem.hito('un-parcial-fue-sostenido', h.parcial);
    N.bus.emit('espectro:sostenido', h);
    return true;
  }

  /* interrumpir: lo que faltaba se vuelve residuo, y el residuo viaja */
  function interrumpir(h, causa) {
    if (!h || h.estado !== 'creciendo') return false;
    h.estado = 'interrumpida';
    h.causa = causa || 'un gesto cortó el proceso antes del umbral';
    N.mem.guardar(true);
    N.bus.emit('espectro:interrupcion', h);
    return true;
  }

  function creciendo() {
    const esp = estadoGuardado();
    for (let i = esp.huellas.length - 1; i >= 0; i--) if (esp.huellas[i].estado === 'creciendo') return esp.huellas[i];
    return null;
  }

  /* ---- MODELO 02 · el regreso degradado -----------------------------
     una huella vuelve en otra página, y cada regreso la aleja de lo que
     fue. la última etapa no es ruido: es una memoria que ya no puede
     asegurar que aquello ocurrió. */
  const ETAPAS = [
    'vuelve legible',
    'vuelve en otra escala de tiempo',
    'vuelve con menos parciales',
    'vuelve contaminada por lo que ocurrió al lado',
    'vuelve sin que la memoria pueda asegurar que ocurrió'
  ];

  function regresar(pagina) {
    const esp = estadoGuardado();
    const podadas = (N.mem.d.regimenes.J && N.mem.d.regimenes.J.estado.podadas) ? N.mem.d.regimenes.J.estado.podadas.length : 0;
    /* J · cada relación podada cierra una vía de regreso */
    const candidatas = esp.huellas.filter(function (h) {
      return h.pagina !== pagina && h.clase !== 'inventado' && h.estado !== 'residuo-agotado';
    });
    if (!candidatas.length) return null;
    if (podadas >= candidatas.length) {
      N.mem.hito('la-poda-detuvo-un-regreso', podadas);
      return null;
    }
    /* un regreso en cada página sería un metrónomo, no una memoria: se
       reconoce lo que vuelve porque no vuelve siempre. hacen falta al
       menos tres páginas desde el último, y la semilla decide el resto. */
    if (esp.ultimoRegreso) {
      const desde = N.mem.d.rutas.length - (esp.ultimoRegreso.rutas || 0);
      if (desde < 3) return null;
      const r = N.seed.make(N.estado.semilla, 'regresa:' + esp.regresos + ':' + N.mem.d.rutas.length);
      if (r.raw() > 0.55) return null;
    }
    /* vuelve la más antigua que todavía puede volver: el expediente
       devuelve por orden de olvido, no por orden de importancia */
    const h = candidatas[0];
    const antes = { escala: h.escala, parcial: h.parcial, clase: h.clase };
    h.regresos++;
    const etapa = Math.min(h.regresos, ETAPAS.length - 1);

    if (etapa === 1) {
      const r = N.seed.make(N.estado.semilla, 'regreso:' + h.id + ':1');
      h.escala = r.raw() < 0.5 ? 2.6 : 0.42;
      h.causa = 'volvió en otra escala de tiempo (×' + h.escala + ')';
    } else if (etapa === 2) {
      h.parcial = Math.max(1, h.parcial - 2);
      h.causa = 'volvió con menos parciales: bajó al ' + h.parcial;
    } else if (etapa === 3) {
      const vecina = esp.huellas.find(x => x !== h && x.pagina !== h.pagina);
      if (vecina) {
        h.genealogia.push({ de: vecina.id, parcial: vecina.parcial });
        h.parcial = vecina.parcial;
        h.clase = 'degradado';
        h.causa = 'se contaminó con la huella de ' + vecina.pagina;
      }
    } else if (etapa >= 4) {
      h.clase = 'inventado';
      h.causa = 'la memoria ya no puede asegurar que esto ocurrió';
      N.mem.falso('inventado', 'huella ' + h.id + ' de ' + h.pagina,
        'volvió ' + h.regresos + ' veces y en cada regreso perdió una razón para ser cierta');
      N.mem.hito('el-espectro-recordo-mal', h.id);
    }

    esp.regresos++;
    esp.ultimoRegreso = { id: h.id, pagina: pagina, t: Date.now(), etapa: etapa, rutas: N.mem.d.rutas.length };
    N.mem.guardar(true);
    if (esp.regresos === 1) N.mem.hito('una-accion-viajo-a-otra-pagina', h.pagina + '→' + pagina);
    N.bus.emit('espectro:regreso', { huella: h, etapa: etapa, texto: ETAPAS[etapa], antes: antes, pagina: pagina });
    return { huella: h, etapa: etapa, texto: ETAPAS[etapa] };
  }

  /* ---- MODELO 04 · LA COPIA escucha ---------------------------------
     no se inventa un modelo conductual nuevo: se usa el que ya existe.
     la copia completa lo interrumpido con la duración que aprendió. */
  function completarConLaCopia() {
    const esp = estadoGuardado();
    if (!N.copia || !N.copia.suficiente()) return null;
    const h = esp.huellas.filter(x => x.estado === 'interrumpida' && !x.copia)[0];
    if (!h) return null;
    const mo = N.copia.modelo();
    h.estado = 'completa';
    h.copia = true;
    h.dur = mo.mediana;
    h.causa = 'la copia la terminó con tu duración media (' + mo.mediana + ' s)';
    if (esp.sostenidos.indexOf(h.parcial) < 0) esp.sostenidos.push(h.parcial);
    N.mem.guardar(true);
    N.mem.hito('la-copia-termino-un-gesto', h.id);
    N.copia.registrar({ tipo: 'completar', huella: h.id, dur: mo.mediana });
    N.bus.emit('espectro:copia', h);
    return h;
  }

  /* ---- medidas y rastro visible -------------------------------------
     toda condición audible importante tiene aquí su equivalente legible.
     la obra sin sonido conserva la información. */
  function medidas() {
    const e = estado();
    const vivos = e.parciales.filter(p => p.modo !== 'callado');
    return {
      f0: Math.round(e.f0 * 10) / 10,
      vivos: vivos.length,
      callados: PARCIALES - vivos.length,
      armonicidad: e.armonicidad,
      rugosidad: Math.round(e.rugosidad * 100) / 100,
      sostenidos: e.sostenidos.length,
      huellas: e.huellas.length,
      regresos: estadoGuardado().regresos,
      regresosPosibles: e.regresosPosibles
    };
  }

  const NS = 'http://www.w3.org/2000/svg';
  function trazo(host, opciones) {
    const o = Object.assign({ alto: 54 }, opciones || {});
    const e = estado();
    host.innerHTML = '';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'trazo-espectro');
    svg.setAttribute('viewBox', '0 0 ' + (PARCIALES * 12) + ' ' + o.alto);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'estado del espectro: ' + e.parciales.filter(p => p.modo !== 'callado').length +
      ' parciales vivos de ' + PARCIALES + ', armonicidad ' + e.armonicidad);
    e.parciales.forEach(function (p, k) {
      const alto = p.modo === 'callado' ? 1.5 : Math.max(2, Math.pow(p.a, 0.45) * (o.alto - 8));
      const l = document.createElementNS(NS, 'rect');
      l.setAttribute('x', k * 12 + 3);
      l.setAttribute('y', o.alto - alto - 2);
      l.setAttribute('width', p.modo === 'ruido' ? 7 : 4);
      l.setAttribute('height', alto);
      l.setAttribute('class', 'parcial parcial--' + p.modo + (p.sostenido ? ' sostenido' : '') + (p.fundido ? ' fundido' : ''));
      const t = document.createElementNS(NS, 'title');
      t.textContent = 'parcial ' + p.i + ' · ' + Math.round(p.f + p.desv) + ' Hz · ' + p.modo +
        (p.sostenido ? ' · sostenido' : '') + (p.causa ? ' · ' + p.causa : '');
      l.appendChild(t);
      svg.appendChild(l);
    });
    host.appendChild(svg);
    return e;
  }

  /* una línea de texto: el mismo estado para quien no puede oír ni ver */
  function linea() {
    const m = medidas();
    return 'f0 ' + m.f0 + ' Hz · ' + m.vivos + '/' + PARCIALES + ' parciales · armonicidad ' +
      m.armonicidad + ' · rugosidad ' + m.rugosidad + ' · sostenidos ' + m.sostenidos +
      ' · regresos ' + m.regresos + '/' + (m.regresos + m.regresosPosibles);
  }

  N.espectro = {
    PARCIALES, HERIDAS, ETAPAS,
    origen, estado, medidas, trazo, linea,
    inscribir, sostener, interrumpir, creciendo, regresar, completarConLaCopia,
    guardado: estadoGuardado
  };

})(window.NPVS);
