'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — contrapunto.js
   el modelo musical puro. cero audio, cero DOM, cero `Math.random()`.

   un solo organismo por semilla. cada VOZ es una PANTALLA y la tabla del
   isomorfismo se cumple aquí, no en el CSS:

     gradiente → espectro (cada parada es un parcial, su croma la amplitud)
     eje       → inarmonicidad y fase
     tamaño    → escala temporal (la razón de tempo ES la razón de áreas)
     posición  → registro (L) y plano (campo atrás / canto adelante)
     solape    → el choque: el único acontecimiento
     modo      → el medio de la mezcla
     borde     → genealogía y clase de memoria

   un color quieto y solo no suena. suena cuando se encuentra con otro.
   el silencio no es ausencia de música: es ausencia de choques.

   el tiempo de este módulo es tiempo de modelo, en segundos, avanzado a
   mano por `avanzar(t)`. por eso corre igual con la bocina apagada, en
   una prueba de Node y dentro de `Tone.Offline`.
   ===================================================================== */
(function (raiz) {

  const RNG = (raiz.CLAVE && raiz.CLAVE.rng) || (typeof require === 'function' ? require('./rng.js') : null);
  const COL = (raiz.CLAVE && raiz.CLAVE.color) || (typeof require === 'function' ? require('./color.js') : null);

  /* topes: contados, no supuestos */
  const TOPES = { voces: 16, ruido: 3, cola: 48, faust: 8, bitacora: 240 };
  /* paradas del gradiente = bandas del espectro. ocho: bastantes para que
     interpolar dos gradientes sea una operación con consecuencias, pocas
     para que cada una siga siendo visible como parada de color. */
  const BANDAS = 8;

  /* familias de razón de tempo. ninguna es conmensurable con las otras
     dos: dos voces con estas áreas convergen una vez y no vuelven. */
  const RAZONES = [
    { nombre: '21:24:25', v: [21, 24, 25, 27, 32, 35] },
    { nombre: '√2:1', v: [Math.SQRT2, 1, Math.SQRT2 * Math.SQRT2 * 0.75, Math.sqrt(3), Math.sqrt(5), Math.sqrt(7)] },
    { nombre: 'e:π', v: [Math.E, Math.PI, 2, Math.E * 1.5, Math.PI * 1.5, 3] },
    { nombre: 'φ:1', v: [(1 + Math.sqrt(5)) / 2, 1, Math.sqrt(2), (1 + Math.sqrt(5)) / 2 * 1.5, 2, Math.sqrt(3)] },
    { nombre: '13:17:19', v: [13, 17, 19, 23, 29, 31] }
  ];

  /* familias de cuantización y acento. no son géneros y no se nombran en
     la obra: son maneras de repartir los acentos sobre la criba. */
  const ACENTOS = [
    { nombre: 'rejilla dura', patron: [1, 0, 0, 0] },
    { nombre: 'tresillo', patron: [1, 0, 1, 0, 1, 0] },
    { nombre: 'rebajado', patron: [1, 0, 0, 1, 0, 0, 0] },
    { nombre: 'roída', patron: [1, 0, 1, 1, 0, 0, 1, 0, 0] },
    { nombre: 'desplazada', patron: [0, 1, 0, 0, 1] }
  ];

  const ESTADOS = ['latente', 'audible', 'congelada', 'fundida', 'expulsada', 'podada', 'heredada'];

  /* =================================================================== */
  function crear(semilla, opciones) {
    const o = Object.assign({ densidad: 'escasa' }, opciones || {});
    const org = {};

    /* ---- lo que decide la semilla ----------------------------------- */
    const rMedio = RNG.make(semilla, 'medio');
    const rTemp = RNG.make(semilla, 'temperamento');
    const rEje = RNG.make(semilla, 'eje');
    const rCroma = RNG.make(semilla, 'croma');
    const rVoces = RNG.make(semilla, 'voces');
    const rInac = RNG.make(semilla, 'inaccesible');
    const rCriba = RNG.make(semilla, 'criba');
    const rTempo = RNG.make(semilla, 'tempo');
    const rCuerpo = RNG.make(semilla, 'cuerpo');

    org.semilla = String(semilla);
    org.medio = o.medio || (rMedio.chance(0.5) ? 'aditivo' : 'sustractivo');
    org.f0 = 55 * Math.pow(2, rCuerpo.f(0, 0.9));
    org.familiaCroma = rCroma.f(0.14, 0.26);
    org.ejeInversion = Math.round(rEje.f(0, 360));

    const nombreTemp = o.temperamento || (rTemp.chance(0.5) ? 'igual' : 'natural');
    org.temperamento = COL.temperamento(nombreTemp, {
      H0: Math.round(rTemp.f(0, 360)), L: 0.62, C: org.familiaCroma
    });

    /* el color inaccesible: un arco de matiz que esta semilla no sabe
       generar. sólo se puede llegar ahí mezclando. */
    org.inaccesible = { matiz: Math.round(rInac.f(0, 360)), arco: 14 };

    org.nVoces = o.voces || rVoces.i(3, 6);
    org.razon = RAZONES[rTempo.i(0, RAZONES.length - 1)];
    org.acento = ACENTOS[rTempo.i(0, ACENTOS.length - 1)];
    org.pulso = rTempo.f(0.16, 0.34);           // segundos del pulso base

    /* ---- la criba (Xenakis) -----------------------------------------
       la rejilla de tiempo no es un compás: es una unión de clases
       residuales. tres vienen de la semilla; las demás las ponen los
       colores presentes, así que cambiar un color cambia qué pulsos
       existen. */
    const MODULOS = [3, 5, 7, 8, 11, 13];
    org.cribaSemilla = [];
    {
      const ms = rCriba.shuffle(MODULOS).slice(0, 3);
      for (const m of ms) org.cribaSemilla.push({ m: m, b: rCriba.i(0, m - 1), de: 'semilla' });
    }

    org.criba = function () {
      const clases = org.cribaSemilla.slice();
      for (const v of org.voces) {
        if (v.estado !== 'audible' && v.estado !== 'congelada') continue;
        const q = org.temperamento.cuantiza(v.color.H);
        const m = 3 + (q.estacion % 9);
        clases.push({ m: m, b: Math.round(v.color.L * (m - 1)) % m, de: v.id });
      }
      return clases;
    };

    org.existePulso = function (n) {
      const clases = org.criba();
      for (const c of clases) if (((n % c.m) + c.m) % c.m === c.b) return true;
      return false;
    };

    /* qué proporción de la rejilla sobrevive: una medida de densidad que
       no depende de la interfaz */
    org.densidadCriba = function (largo) {
      const N = largo || 120;
      let k = 0;
      for (let n = 0; n < N; n++) if (org.existePulso(n)) k++;
      return k / N;
    };

    /* ---- estado ------------------------------------------------------ */
    org.t = 0;
    org.voces = [];
    org.bitacora = [];
    org.invariantes = {};
    org.choques = {};                 // par → conteo
    org.movimiento = 'invencion';
    org.detenido = false;
    org.entradaInterrumpida = null;
    org.recurrencias = [];
    org.cancelaciones = [];
    org.rueda = { vueltas: 0, matiz: org.temperamento.estaciones[0], residuo: 0, cerrada: false, ultima: 0, proxima: 0 };
    /* una vuelta de la rueda dura sesenta y cuatro pulsos base: doce
       vueltas caen entre dos y cinco minutos, que es cuando el error
       empieza a ser audible sin que nadie lo señale. */
    org.periodoRueda = org.pulso * 64;
    org.rueda.proxima = org.periodoRueda;
    org.habitos = {
      gestos: [], pausas: [], ultimo: 0, sumas: 0, restas: 0,
      agrandes: [], modificadas: {}, maticesTocados: {}, acciones: 0
    };
    org.pares = {};                   // memoria de pares para paralelas
    org.colores = [];                 // expediente cromático completo

    /* los identificadores de color son de ESTE organismo. si vinieran de
       un contador global, dos piezas abiertas a la vez se contaminarían
       el expediente y la misma semilla dejaría de dar el mismo mundo. */
    let nColor = 0;
    function crearColor(coords, datos) {
      const d = Object.assign({}, datos || {});
      if (!d.id) d.id = 'c' + (nColor++);
      return COL.crear(coords, d);
    }
    org.crearColor = crearColor;

    /* ---- inscripción -------------------------------------------------- */
    function inscribir(tipo, texto, datos) {
      const l = Object.assign({ t: Math.round(org.t * 100) / 100, tipo: tipo, texto: texto }, datos || {});
      org.bitacora.push(l);
      if (org.bitacora.length > TOPES.bitacora) org.bitacora = org.bitacora.slice(-TOPES.bitacora);
      return l;
    }
    org.inscribir = inscribir;

    function invariante(nombre, causa) {
      if (org.invariantes[nombre]) return false;
      org.invariantes[nombre] = { t: Math.round(org.t * 100) / 100, causa: causa };
      inscribir('invariante', nombre, { causa: causa });
      return true;
    }
    org.invariante = invariante;

    /* ---- presupuesto de croma ----------------------------------------
       finito y sólo decrece. mezclar gasta; separar no devuelve. el
       visitante lo está gastando desde el primer gesto sin que nadie se
       lo diga. */
    org.presupuesto = { inicial: 0, restante: 0, gastado: 0 };

    function gastar(cuanto, causa) {
      const c = Math.max(0, cuanto);
      org.presupuesto.gastado += c;
      org.presupuesto.restante = Math.max(0, org.presupuesto.inicial - org.presupuesto.gastado);
      if (org.presupuesto.restante <= org.presupuesto.inicial * 0.5) {
        invariante('el-presupuesto-de-croma-bajo-de-la-mitad', causa);
      }
      return org.presupuesto.restante;
    }
    org.gastar = gastar;

    /* ---- colores ------------------------------------------------------ */

    /* un matiz generado nunca cae en el arco inaccesible: se aparta. sólo
       una mezcla puede llegar ahí, y cuando llegue quedará inscrito. */
    function apartarDelInaccesible(H) {
      let d = ((H - org.inaccesible.matiz + 540) % 360) - 180;
      if (Math.abs(d) >= org.inaccesible.arco) return ((H % 360) + 360) % 360;
      const signo = d === 0 ? 1 : (d > 0 ? 1 : -1);
      return ((org.inaccesible.matiz + signo * org.inaccesible.arco) % 360 + 360) % 360;
    }

    function registrarColor(c) {
      /* dos historias distintas que producen el mismo color no se
         resuelven ni se fusionan: se marcan, y sus diferencias internas
         se conservan hasta que produzcan batimientos. */
      for (const otro of org.colores) {
        if (otro.id === c.id) continue;
        if (COL.delta(otro, c) < 0.012 && otro.causa !== c.causa) {
          if (c.clase !== 'contradictorio') { c.clase = 'contradictorio'; }
          if (otro.clase !== 'contradictorio') { otro.clase = 'contradictorio'; }
          invariante('dos-historias-produjeron-el-mismo-color', otro.nombre + ' ≡ ' + c.nombre);
        }
      }
      /* el arco inaccesible sólo se alcanza por mezcla. generar —la
         semilla, un gesto de modificar, una inversión, la rueda— siempre
         se aparta de él; llegar ahí es prueba de que hubo un encuentro. */
      const d = Math.abs(((c.H - org.inaccesible.matiz + 540) % 360) - 180);
      const porEncuentro = ['mezcla', 'interpolacion', 'contaminacion', 'difusion'].indexOf(c.origen) >= 0;
      if (d < org.inaccesible.arco && porEncuentro) {
        invariante('aparecio-el-color-inaccesible',
          c.nombre + ' cayó en el arco que la semilla no sabía generar (' + org.inaccesible.matiz +
          '° ± ' + org.inaccesible.arco + '°) y llegó ahí por ' + c.origen);
      }
      if (COL.esGris(c)) {
        invariante('dos-colores-produjeron-gris', c.causa || 'croma bajo el umbral');
      }
      org.colores.push(c);
      return c;
    }
    org.registrarColor = registrarColor;

    /* ---- el gradiente = el espectro -----------------------------------
       ocho paradas. la posición de la parada es el índice del parcial y
       su croma es la amplitud. interpolar dos gradientes es interpolar
       dos espectros: la misma operación, ejecutada una vez. */
    function gradiente(color, eje, perfil) {
      const paradas = [];
      const apertura = 6 + (eje % 90) * 0.35;
      for (let j = 0; j < BANDAS; j++) {
        const k = j - (BANDAS - 1) / 2;
        paradas.push(COL.enGama({
          L: Math.min(1, Math.max(0.04, color.L + k * 0.035 * Math.cos(eje * Math.PI / 180))),
          C: Math.max(0, color.C * perfil[j]),
          H: ((color.H + k * apertura) % 360 + 360) % 360
        }));
      }
      return paradas;
    }

    function bandasDe(v) {
      /* amplitud de la banda j = croma de la parada j, normalizado. si el
         croma se fue, las bandas se aplanan y el cuerpo se vuelve ruido:
         el gris no es un color más, es el final termodinámico. */
      return v.gradiente.map(p => Math.min(1, p.C / COL.C_MAX));
    }
    org.bandasDe = bandasDe;

    /* ---- voces / pantallas -------------------------------------------- */
    let contadorVoz = 0;

    function nuevaVoz(datos) {
      const d = datos || {};
      const id = d.id || ('v' + (contadorVoz++));
      const rp = RNG.make(semilla, 'perfil:' + id);
      const caida = rp.f(0.55, 1.25);
      const perfil = [];
      for (let j = 0; j < BANDAS; j++) perfil.push(Math.pow(1 / (j + 1), caida) * rp.f(0.75, 1.15));
      const v = {
        id: id,
        color: d.color,
        rect: d.rect,
        eje: d.eje === undefined ? 0 : d.eje,
        perfil: perfil,
        gradiente: null,
        estado: d.estado || 'latente',
        fase: d.fase === undefined ? 0 : d.fase,
        retardo: d.retardo || 0,
        rugosidad: 0,
        congelado: 0,
        erosion: 0,
        entradas: 0,
        nacida: org.t,
        origen: d.origen || 'semilla',
        causa: d.causa || 'voz inicial de la semilla',
        genealogia: d.genealogia || [],
        clase: d.clase || 'verdadero',
        muerte: null,
        /* el destino de una interpolación espectral en curso */
        interpolacion: null
      };
      v.gradiente = gradiente(v.color, v.eje, perfil);
      org.voces.push(v);
      return v;
    }

    /* área → escala temporal. la razón de tempo entre dos voces ES la
       razón entre sus áreas: ahí viven los cánones de Nancarrow. */
    org.area = function (v) { return v.rect.w * v.rect.h; };
    org.periodo = function (v) { return org.pulso * (org.area(v) / 0.02); };

    /* plano: arriba el campo sostenido, abajo el canto */
    org.plano = function (v) { return (v.rect.y + v.rect.h / 2) < 0.5 ? 'campo' : 'canto'; };

    org.audibles = function () { return org.voces.filter(v => v.estado === 'audible' || v.estado === 'congelada'); };
    org.vivas = function () { return org.voces.filter(v => v.estado !== 'fundida' && v.estado !== 'expulsada' && v.estado !== 'podada'); };
    org.voz = function (id) { return org.voces.filter(v => v.id === id)[0] || null; };

    /* el punto de convergencia de un canon de tempo: dos voces que leen
       el mismo material a velocidades incompatibles coinciden en un solo
       índice de acontecimiento y no vuelven a coincidir jamás. */
    org.convergencia = function (a, b) {
      const Ta = org.periodo(a), Tb = org.periodo(b);
      if (Math.abs(Ta - Tb) < 1e-9) return null;
      const k = (b.fase - a.fase) / (Ta - Tb);
      if (!isFinite(k) || k < 0) return null;
      const kk = Math.round(k);
      return {
        indice: kk,
        t: a.fase + kk * Ta,
        error: Math.abs((a.fase + kk * Ta) - (b.fase + kk * Tb)),
        razon: Ta / Tb
      };
    };

    /* ---- geometría del campo ------------------------------------------ */
    function solape(a, b) {
      const w = Math.min(a.rect.x + a.rect.w, b.rect.x + b.rect.w) - Math.max(a.rect.x, b.rect.x);
      const h = Math.min(a.rect.y + a.rect.h, b.rect.y + b.rect.h) - Math.max(a.rect.y, b.rect.y);
      return (w > 0 && h > 0) ? w * h : 0;
    }
    function separacion(a, b) {
      const dx = Math.max(0, Math.max(a.rect.x - (b.rect.x + b.rect.w), b.rect.x - (a.rect.x + a.rect.w)));
      const dy = Math.max(0, Math.max(a.rect.y - (b.rect.y + b.rect.h), b.rect.y - (a.rect.y + a.rect.h)));
      return Math.hypot(dx, dy);
    }
    org.solape = solape;
    org.separacion = separacion;

    /* el modo de fusión del solape es el medio de la mezcla, y está a la
       vista. no es un ajuste oculto. */
    org.medioDe = function (a, b) {
      if (a.medioForzado) return a.medioForzado;
      if (b.medioForzado) return b.medioForzado;
      return org.medio;
    };

    /* =================================================================
       LAS REGLAS DE CHOQUE
       cada fila necesita consecuencia audible, consecuencia visible e
       inscripción con causa. aquí están las tres.
       ================================================================= */
    function clave(a, b) { return a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id; }

    function choque(a, b) {
      const k = clave(a, b);
      org.choques[k] = (org.choques[k] || 0) + 1;
      const veces = org.choques[k];
      const dh = COL.deltaH(a.color, b.color);
      const d = COL.delta(a.color, b.color);
      const medio = org.medioDe(a, b);
      const res = { par: k, veces: veces, deltaH: dh, delta: d, medio: medio, efectos: [] };

      /* 7 · el mismo par por tercera vez ya no produce novedad: produce
         erosión. cada regreso pierde parciales. */
      if (veces >= 3) {
        a.erosion = Math.min(BANDAS - 2, a.erosion + 1);
        b.erosion = Math.min(BANDAS - 2, b.erosion + 1);
        if (a.clase === 'verdadero') a.clase = 'degradado';
        if (b.clase === 'verdadero') b.clase = 'degradado';
        res.efectos.push('erosion');
        inscribir('erosion', 'el par ' + k + ' volvió por ' + veces + 'ª vez y perdió parciales',
          { causa: 'choque repetido' });
      }

      /* 6 · croma bajo en los dos: ruido sin altura. no hay intervalo
         posible: es el gris trabajando. */
      if (COL.esGris(a.color) && COL.esGris(b.color)) {
        res.efectos.push('ruido-sin-altura');
        invariante('la-altura-volvio-a-ser-ruido', 'dos cromas bajo ' + COL.C_GRIS + ' chocaron: ' + k);
      }

      /* 1 · matices vecinos: batimiento y rugosidad. los dos colores se
         vuelven difíciles de distinguir. */
      if (dh < 18 && d < 0.10) {
        const batido = Math.max(0.2, dh * 0.9);       // Hz
        a.rugosidad = Math.min(1, a.rugosidad + 0.12);
        b.rugosidad = Math.min(1, b.rugosidad + 0.12);
        /* se contaminan: los matices se acercan antes de fundirse */
        const medioH = COL.deltaHsig(a.color, b.color) / 2;
        a.color = crearColor({ L: a.color.L, C: a.color.C, H: a.color.H + medioH * 0.18 },
          { origen: 'contaminacion', causa: 'se acercó a ' + b.color.nombre, genealogia: [a.color.id, b.color.id], clase: a.color.clase });
        b.color = crearColor({ L: b.color.L, C: b.color.C, H: b.color.H - medioH * 0.18 },
          { origen: 'contaminacion', causa: 'se acercó a ' + a.color.nombre, genealogia: [b.color.id, a.color.id], clase: b.color.clase });
        registrarColor(a.color); registrarColor(b.color);
        regradar(a); regradar(b);
        res.batido = batido;
        res.efectos.push('batimiento');
        inscribir('choque', 'batimiento de ' + batido.toFixed(1) + ' Hz entre ' + a.id + ' y ' + b.id,
          { causa: 'ΔH ' + dh.toFixed(1) + '° · Δ ' + d.toFixed(3) });
        return res;
      }

      /* 2 y 5 · la mezcla. irreversible: el sistema conserva la causa, no
         el material. */
      const m = COL.mezclar(a.color, b.color, medio);
      gastar(m.costo, 'mezcla ' + k);
      const hijo = crearColor(m.color, {
        origen: 'mezcla',
        causa: m.causa + ' · entre «' + a.color.nombre + '» y «' + b.color.nombre + '»',
        genealogia: [a.color.id, b.color.id],
        clase: (a.color.clase === 'inventado' || b.color.clase === 'inventado') ? 'inventado'
          : (a.color.clase === 'inferido' || b.color.clase === 'inferido') ? 'inferido'
            : (veces >= 3 ? 'degradado' : 'verdadero')
      });
      registrarColor(hijo);
      res.mezcla = m;
      res.hijo = hijo;

      /* la interpolación espectral: no se salta al resultado, se viaja
         hacia él. es la operación central de la pieza.

         las dos voces no llegan al mismo sitio: la pantalla grande
         resiste y la chica cede, en proporción a sus áreas. si las dos
         se volvieran el color mezclado, cada mezcla fabricaría un
         unísono y el campo moriría de paralelas en un minuto. lo que se
         pierde es la información de los componentes, no la diferencia
         entre las voces. */
      const aa = org.area(a), ab = org.area(b);
      const fa = Math.min(0.85, Math.max(0.15, ab / (aa + ab)));
      interpolarHacia(a, haciaColor(a.color, hijo, fa), 'mezcla con ' + b.id);
      interpolarHacia(b, haciaColor(b.color, hijo, 1 - fa), 'mezcla con ' + a.id);

      if (m.cancela) {
        /* 2 · complementarios en medio sustractivo: cancelación. el
           silencio conserva la información de qué se canceló. */
        const c = {
          t: Math.round(org.t * 100) / 100,
          par: k,
          fueron: [a.color.nombre, b.color.nombre],
          matices: [Math.round(a.color.H), Math.round(b.color.H)],
          causa: 'ΔH ' + dh.toFixed(1) + '° en medio ' + medio
        };
        org.cancelaciones.push(c);
        res.efectos.push('cancelacion');
        invariante('un-silencio-conservo-una-cancelacion',
          c.fueron[0] + ' y ' + c.fueron[1] + ' se cancelaron; el silencio guarda cuáles eran');
        inscribir('cancelacion', 'silencio con residuo entre ' + a.id + ' y ' + b.id, { causa: c.causa });
      } else if (Math.abs(dh - 180) < 12) {
        res.efectos.push('tono-de-diferencia');
        res.diferencia = Math.abs(COL.altura(a.color, org.temperamento, org.f0).hz -
          COL.altura(b.color, org.temperamento, org.f0).hz);
        inscribir('choque', 'tono de diferencia de ' + res.diferencia.toFixed(1) + ' Hz entre ' + a.id + ' y ' + b.id,
          { causa: 'ΔH ' + dh.toFixed(1) + '°' });
      } else {
        res.efectos.push('mezcla');
        inscribir('choque', 'mezcla ' + medio + ' de ' + a.id + ' y ' + b.id + ' → «' + hijo.nombre + '»',
          { causa: m.causa });
      }

      /* 8 · choque con un color inferido o inventado: suena, pero la
         bitácora no puede afirmar que ocurrió. */
      if (a.color.clase === 'inventado' || b.color.clase === 'inventado' ||
        hijo.clase === 'inventado') {
        inscribir('duda', 'este choque no puede afirmarse: uno de los colores fue inventado',
          { causa: 'clase de memoria' });
      }
      return res;
    }

    /* un punto intermedio del camino hacia el resultado de una mezcla.
       el matiz se recorre por el arco corto: ir por el largo sería pasar
       por colores que nadie produjo. */
    function haciaColor(desde, hasta, f) {
      const dh = COL.deltaHsig(desde, hasta);
      return crearColor({
        L: desde.L + (hasta.L - desde.L) * f,
        C: desde.C + (hasta.C - desde.C) * f,
        H: desde.H + dh * f
      }, {
        origen: 'mezcla',
        causa: 'a ' + Math.round(f * 100) + '% del camino hacia «' + hasta.nombre + '» · ' + hasta.causa,
        genealogia: [desde.id, hasta.id],
        clase: hasta.clase
      });
    }
    org.haciaColor = haciaColor;

    function regradar(v) {
      v.gradiente = gradiente(v.color, v.eje, v.perfil);
    }
    org.regradar = regradar;

    /* la interpolación espectral en curso: el cuerpo viaja de su espectro
       actual al del color resultante. Faust la ejecuta; aquí sólo se
       decide el destino y la duración. */
    function interpolarHacia(v, destino, causa) {
      const perfilDestino = v.perfil;
      v.interpolacion = {
        desde: bandasDe(v),
        hacia: gradiente(destino, v.eje, perfilDestino).map(p => Math.min(1, p.C / COL.C_MAX)),
        color: destino,
        t0: org.t,
        dur: Math.max(1.2, org.periodo(v) * 3),
        causa: causa
      };
      return v.interpolacion;
    }
    org.interpolarHacia = interpolarHacia;

    /* muerte por paralelas: no hay mensaje de error. hay una voz menos y
       una inscripción que dice qué la mató. */
    function fundir(muere, queda, causa) {
      muere.estado = 'fundida';
      muere.muerte = { t: Math.round(org.t * 100) / 100, causa: causa, en: queda.id };
      queda.genealogia = queda.genealogia.concat([muere.id]);
      queda.rugosidad = Math.min(1, queda.rugosidad + 0.2);
      inscribir('muerte', muere.id + ' se fundió en ' + queda.id, { causa: causa });
      invariante('una-voz-murio-por-paralelas', muere.id + ': ' + causa);
      return muere;
    }
    org.fundir = fundir;

    /* =================================================================
       COLORACIÓN DEL GRAFO Y EXPULSIÓN
       mientras el grafo de adyacencias admita coloración, la textura se
       lee. cuando deja de admitirla, algo tiene que ser expulsado.
       el número de colores disponibles baja con el presupuesto: el gris
       se come la resolución del matiz.
       ================================================================= */
    org.coloresDisponibles = function () {
      const p = org.presupuesto.inicial > 0 ? org.presupuesto.restante / org.presupuesto.inicial : 1;
      return Math.max(2, Math.ceil(12 * p));
    };

    function grafo() {
      const vs = org.audibles();
      const ady = {};
      for (const v of vs) ady[v.id] = [];
      for (let i = 0; i < vs.length; i++) {
        for (let j = i + 1; j < vs.length; j++) {
          if (solape(vs[i], vs[j]) > 0) { ady[vs[i].id].push(vs[j].id); ady[vs[j].id].push(vs[i].id); }
        }
      }
      return { vs: vs, ady: ady };
    }
    org.grafo = grafo;

    /* coloración exacta por retroceso: los campos son pequeños (≤16) y
       una heurística mentiría sobre cuándo hay que expulsar. */
    function coloreable(g, k) {
      const ids = g.vs.map(v => v.id);
      const asign = {};
      function paso(i) {
        if (i >= ids.length) return true;
        const id = ids[i];
        for (let c = 0; c < k; c++) {
          let ok = true;
          for (const n of g.ady[id]) if (asign[n] === c) { ok = false; break; }
          if (ok) { asign[id] = c; if (paso(i + 1)) return true; delete asign[id]; }
        }
        return false;
      }
      return paso(0) ? asign : null;
    }
    org.coloreable = coloreable;

    function expulsarSiHaceFalta() {
      const g = grafo();
      const k = org.coloresDisponibles();
      if (!g.vs.length) return null;
      if (coloreable(g, k)) return null;
      /* se va la de mayor grado; a igualdad, la más joven. no hay
         negociación y no hay aviso previo. */
      let peor = null, gr = -1;
      for (const v of g.vs) {
        const d = g.ady[v.id].length;
        if (d > gr || (d === gr && peor && v.nacida > peor.nacida)) { gr = d; peor = v; }
      }
      peor.estado = 'expulsada';
      peor.muerte = { t: Math.round(org.t * 100) / 100, causa: 'el grafo dejó de admitir coloración con ' + k + ' matices', en: null };
      inscribir('expulsion', peor.id + ' fue expulsada del campo',
        { causa: 'grafo no coloreable con ' + k + ' matices disponibles' });
      invariante('una-pantalla-fue-expulsada-del-campo', peor.id + ' · grado ' + gr + ' · k=' + k);
      return peor;
    }
    org.expulsarSiHaceFalta = expulsarSiHaceFalta;

    /* triángulo monocromático: tres pantallas mutuamente adyacentes con
       el mismo matiz cierran un sistema de interferencias. se instala una
       recurrencia que ya no depende del visitante. */
    function triangulos() {
      const g = grafo();
      const out = [];
      for (let i = 0; i < g.vs.length; i++) {
        for (let j = i + 1; j < g.vs.length; j++) {
          for (let k = j + 1; k < g.vs.length; k++) {
            const a = g.vs[i], b = g.vs[j], c = g.vs[k];
            if (g.ady[a.id].indexOf(b.id) < 0 || g.ady[b.id].indexOf(c.id) < 0 || g.ady[a.id].indexOf(c.id) < 0) continue;
            const ea = org.temperamento.cuantiza(a.color.H).estacion;
            const eb = org.temperamento.cuantiza(b.color.H).estacion;
            const ec = org.temperamento.cuantiza(c.color.H).estacion;
            if (ea === eb && eb === ec) out.push([a, b, c]);
          }
        }
      }
      return out;
    }
    org.triangulos = triangulos;

    /* =================================================================
       LAS SIETE OPERACIONES
       cada verbo es a la vez gesto de interfaz, operación bachiana y
       consecuencia cromática. ninguno tiene etiqueta explicativa: eso es
       trabajo de la fase visual, no del modelo.
       ================================================================= */

    function gesto(tipo, datos) {
      const d = datos || {};
      const h = org.habitos;
      if (h.gestos.length) {
        const pausa = org.t - h.ultimo;
        if (pausa > 0.05) h.pausas.push(Math.round(pausa * 100) / 100);
        if (h.pausas.length > 40) h.pausas = h.pausas.slice(-40);
      }
      h.ultimo = org.t;
      h.gestos.push({ t: Math.round(org.t * 100) / 100, tipo: tipo, voz: d.voz || null });
      if (h.gestos.length > 120) h.gestos = h.gestos.slice(-120);
      if (tipo === 'sumar') h.sumas++;
      if (tipo === 'restar') h.restas++;
      if (tipo === 'modificar' && d.voz) h.modificadas[d.voz] = (h.modificadas[d.voz] || 0) + 1;
      if (tipo === 'agrandar' && d.voz) h.agrandes.push(d.voz);
      const v = d.voz ? org.voz(d.voz) : null;
      if (v) { h.maticesTocados[org.temperamento.cuantiza(v.color.H).estacion] = true; v.ultimoGesto = org.t; }
      return h;
    }
    org.gesto = gesto;

    /* DETENER · congela el gradiente. congelamiento espectral: la voz se
       sostiene sin evolucionar y deja de producir acontecimientos. */
    org.detener = function (id) {
      const v = org.voz(id); if (!v) return null;
      gesto('detener', { voz: id });
      v.estado = 'congelada';
      v.congelado = 1;
      inscribir('operacion', 'detener ' + id, { causa: 'el gradiente dejó de evolucionar' });
      return v;
    };

    org.soltar = function (id) {
      const v = org.voz(id); if (!v) return null;
      gesto('soltar', { voz: id });
      if (v.estado === 'congelada') { v.estado = 'audible'; v.congelado = 0; }
      return v;
    };

    /* MODIFICAR · arrastrar el gradiente: matiz, croma, eje. gasta
       presupuesto si baja el croma. */
    org.modificar = function (id, cambio) {
      const v = org.voz(id); if (!v) return null;
      const c = cambio || {};
      gesto('modificar', { voz: id });
      const antes = { L: v.color.L, C: v.color.C, H: v.color.H };
      const nuevo = crearColor({
        L: Math.min(1, Math.max(0.04, v.color.L + (c.dL || 0))),
        C: Math.max(0, v.color.C + (c.dC || 0)),
        H: apartarDelInaccesible(v.color.H + (c.dH || 0))
      }, {
        origen: 'gesto',
        causa: 'modificado a mano: ' + ['dL ' + (c.dL || 0), 'dC ' + (c.dC || 0), 'dH ' + (c.dH || 0)].join(' · '),
        genealogia: [v.color.id], clase: v.color.clase
      });
      if (nuevo.C < antes.C) gastar((antes.C - nuevo.C) * 0.5, 'bajar croma de ' + id);
      v.color = registrarColor(nuevo);
      if (c.dEje) v.eje = ((v.eje + c.dEje) % 360 + 360) % 360;
      regradar(v);
      if (v.estado === 'latente') v.estado = 'audible';
      inscribir('operacion', 'modificar ' + id + ' → «' + v.color.nombre + '»', { causa: v.color.causa });
      return v;
    };

    /* DUPLICAR · canon: la copia entra después, y puede llegar cuando el
       original ya cambió. */
    org.duplicar = function (id, retardo) {
      const v = org.voz(id); if (!v) return null;
      if (org.vivas().length >= TOPES.voces) {
        inscribir('tope', 'no se duplicó ' + id + ': el campo está en el tope de ' + TOPES.voces + ' voces',
          { causa: 'tope de voces' });
        return null;
      }
      gesto('duplicar', { voz: id });
      const d = retardo === undefined ? org.periodo(v) * 2 : retardo;
      const copia = nuevaVoz({
        color: registrarColor(crearColor({ L: v.color.L, C: v.color.C, H: v.color.H }, {
          origen: 'canon', causa: 'copia canónica de ' + id + ' con retardo ' + d.toFixed(2) + ' s',
          genealogia: [v.color.id], clase: v.color.clase
        })),
        rect: { x: Math.min(0.92, v.rect.x + 0.06), y: Math.min(0.92, v.rect.y + 0.05), w: v.rect.w, h: v.rect.h },
        eje: v.eje,
        fase: v.fase + d,
        retardo: d,
        estado: 'latente',
        origen: 'canon',
        causa: 'duplicación de ' + id,
        genealogia: [v.id],
        clase: v.clase
      });
      /* el retardo canónico se guarda como promesa: la entrada ocurre
         cuando le toca, no cuando se hizo clic. */
      copia.entraEn = org.t + d;
      copia.originalEra = { H: v.color.H, C: v.color.C, L: v.color.L };
      copia.original = v.id;
      inscribir('operacion', 'duplicar ' + id + ' → ' + copia.id + ' (retardo ' + d.toFixed(2) + ' s)',
        { causa: 'canon' });
      return copia;
    };

    /* BORRAR · poda: elimina una resonancia y puede detener una
       recurrencia. irreversible; el residuo queda inscrito. */
    org.borrar = function (id) {
      const v = org.voz(id); if (!v) return null;
      gesto('borrar', { voz: id });
      v.estado = 'podada';
      v.muerte = { t: Math.round(org.t * 100) / 100, causa: 'podada por el visitante', en: null };
      v.residuo = { color: { L: v.color.L, C: v.color.C, H: v.color.H }, nombre: v.color.nombre };
      /* la poda cierra las recurrencias que pasaban por ella */
      org.recurrencias = org.recurrencias.filter(function (r) {
        if (r.voces.indexOf(id) < 0) return true;
        inscribir('poda', 'la poda de ' + id + ' detuvo una recurrencia', { causa: 'poda' });
        return false;
      });
      inscribir('operacion', 'borrar ' + id + ' · queda su residuo', { causa: 'poda' });
      return v;
    };

    /* SUMAR / RESTAR · superponer dos pantallas. el modo de fusión del
       solape es el medio, y está a la vista. */
    function superponer(idA, idB, medio) {
      const a = org.voz(idA), b = org.voz(idB);
      if (!a || !b || a === b) return null;
      gesto(medio === 'aditivo' ? 'sumar' : 'restar', { voz: idA });
      b.medioForzado = medio;
      /* mover B encima de A: el solape es el acontecimiento */
      b.rect = { x: a.rect.x + a.rect.w * 0.25, y: a.rect.y + a.rect.h * 0.25, w: b.rect.w, h: b.rect.h };
      if (a.estado === 'latente') a.estado = 'audible';
      if (b.estado === 'latente') b.estado = 'audible';
      const r = choque(a, b);
      /* el par queda marcado como en contacto: si no, el siguiente
         avance del reloj lo tomaría por un choque nuevo y la misma
         superposición produciría dos acontecimientos. */
      const k = clave(a, b);
      org.pares[k] = { tocando: true, La: a.color.L, Lb: b.color.L, dL: a.color.L - b.color.L, paralelo: 0 };
      return r;
    }
    org.sumar = function (a, b) { return superponer(a, b, 'aditivo'); };
    org.restar = function (a, b, diferencia) { return superponer(a, b, diferencia ? 'diferencia' : 'sustractivo'); };
    org.superponer = superponer;

    /* AGRANDAR / ENCOGER · aumentación y disminución. reordena todo el
       sistema polirrítmico, no sólo esa voz. */
    org.redimensionar = function (id, w, h) {
      const v = org.voz(id); if (!v) return null;
      const crece = (w * h) > (v.rect.w * v.rect.h);
      gesto(crece ? 'agrandar' : 'encoger', { voz: id });
      const antes = org.periodo(v);
      v.rect = { x: v.rect.x, y: v.rect.y, w: Math.min(0.9, Math.max(0.04, w)), h: Math.min(0.9, Math.max(0.04, h)) };
      const ahora = org.periodo(v);
      inscribir('operacion', (crece ? 'agrandar ' : 'encoger ') + id +
        ' · período ' + antes.toFixed(2) + ' → ' + ahora.toFixed(2) + ' s',
        { causa: 'la razón de tempo con todas las demás cambió' });
      return v;
    };

    /* MOVER · registro y plano a la vez */
    org.mover = function (id, x, y) {
      const v = org.voz(id); if (!v) return null;
      gesto('mover', { voz: id });
      v.rect = { x: Math.min(0.98 - v.rect.w, Math.max(0, x)), y: Math.min(0.98 - v.rect.h, Math.max(0, y)), w: v.rect.w, h: v.rect.h };
      /* la posición vertical es el registro: mover una pantalla la mueve
         de octava y de plano a la vez */
      const L = Math.min(0.96, Math.max(0.06, 1 - v.rect.y - v.rect.h / 2));
      if (Math.abs(L - v.color.L) > 0.02) {
        v.color = registrarColor(crearColor({ L: L, C: v.color.C, H: v.color.H }, {
          origen: 'gesto', causa: 'movida: el registro cambió a L ' + L.toFixed(2),
          genealogia: [v.color.id], clase: v.color.clase
        }));
        regradar(v);
      }
      if (v.estado === 'latente') v.estado = 'audible';
      return v;
    };

    /* =================================================================
       LAS OPERACIONES BACHIANAS SOBRE COLORES
       ================================================================= */

    /* inversión: el matiz se refleja sobre el eje que eligió la semilla.
       no es el complementario: es el complementario respecto de ESE eje. */
    org.invertir = function (id) {
      const v = org.voz(id); if (!v) return null;
      gesto('invertir', { voz: id });
      const H = apartarDelInaccesible(2 * org.ejeInversion - v.color.H);
      v.color = registrarColor(crearColor({ L: v.color.L, C: v.color.C, H: H }, {
        origen: 'inversion', causa: 'matiz reflejado sobre el eje ' + org.ejeInversion + '°',
        genealogia: [v.color.id], clase: v.color.clase
      }));
      regradar(v);
      inscribir('operacion', 'inversión de ' + id + ' → «' + v.color.nombre + '»', { causa: v.color.causa });
      return v;
    };

    /* retrogradación: el ciclo gira al contrario. los choques ocurren en
       orden inverso y NO producen las mismas mezclas: la mezcla no es
       conmutativa en el tiempo. */
    org.retrogradar = function (id) {
      const v = org.voz(id); if (!v) return null;
      gesto('retrogradar', { voz: id });
      v.perfil = v.perfil.slice().reverse();
      v.fase = -v.fase;
      regradar(v);
      inscribir('operacion', 'retrogradación de ' + id, { causa: 'el gradiente se lee al revés' });
      return v;
    };

    /* aumentación / disminución: aclarar estira el tiempo de la voz,
       oscurecer lo comprime. es la claridad la que escala el tiempo. */
    org.escalarClaridad = function (id, factor) {
      const v = org.voz(id); if (!v) return null;
      gesto('escalar', { voz: id });
      const L = Math.min(0.96, Math.max(0.06, v.color.L * factor));
      v.color = registrarColor(crearColor({ L: L, C: v.color.C, H: v.color.H }, {
        origen: 'aumentacion', causa: 'claridad × ' + factor.toFixed(3) + ': la voz cambió de escala temporal',
        genealogia: [v.color.id], clase: v.color.clase
      }));
      const k = Math.min(2.4, Math.max(0.4, factor));
      v.rect = { x: v.rect.x, y: v.rect.y, w: Math.min(0.9, v.rect.w * k), h: Math.min(0.9, v.rect.h * k) };
      regradar(v);
      return v;
    };

    /* stretto: las entradas se acercan hasta solaparse. densidad de
       choque, sin cambiar ningún color. */
    org.stretto = function (factor) {
      const f = factor === undefined ? 0.7 : factor;
      gesto('stretto', {});
      for (const v of org.audibles()) v.fase *= f;
      inscribir('operacion', 'stretto ×' + f, { causa: 'las entradas se acercaron' });
      return org.audibles().length;
    };

    /* canon per tonos: la rueda avanza una quinta por vuelta. después de
       doce vueltas debería volver al origen. en temperamento igual vuelve
       —y se paga con que cada quinta está baja—; en natural no vuelve, y
       el error acumulado es el tema de la pieza. */
    org.vueltaDeRueda = function () {
      const r = org.rueda;
      const antes = r.matiz;
      r.matiz = org.temperamento.avanzar(r.matiz);
      r.vueltas++;
      r.residuo = (org.temperamento.quinta * r.vueltas) - Math.round(org.temperamento.quinta * r.vueltas / 360) * 360;
      inscribir('rueda', 'vuelta ' + r.vueltas + ': ' + Math.round(antes) + '° → ' + Math.round(r.matiz) + '°',
        { causa: 'canon per tonos · quinta de ' + org.temperamento.quinta.toFixed(4) + '°' });
      if (r.vueltas === 12) {
        const resto = Math.abs(org.temperamento.residuoRueda);
        if (resto > 0.001) {
          r.cerrada = false;
          invariante('la-rueda-de-matiz-dio-doce-vueltas-y-no-volvio',
            'residuo ' + org.temperamento.residuoRueda.toFixed(4) + '° (' +
            (org.temperamento.residuoRueda * COL.CENTS_POR_GRADO).toFixed(3) + ' cents)');
        } else {
          r.cerrada = true;
          invariante('la-rueda-cerro-pagando-cada-quinta',
            'residuo 0°, pero cada quinta quedó ' +
            (org.temperamento.errorPorQuinta * COL.CENTS_POR_GRADO).toFixed(3) + ' cents de la pura');
        }
      }
      return r;
    };

    /* =================================================================
       LA MÁQUINA: hábitos aprendidos
       cuando el visitante deja de tocar, la pieza no se detiene: sigue
       con lo que aprendió. sus matices evitados nunca aparecen.
       ================================================================= */
    org.modeloDeHabitos = function () {
      const h = org.habitos;
      const ps = h.pausas.slice().sort((a, b) => a - b);
      const mediana = ps.length ? ps[Math.floor(ps.length / 2)] : null;
      let masModificada = null, n = -1;
      for (const k in h.modificadas) if (h.modificadas[k] > n) { n = h.modificadas[k]; masModificada = k; }
      const evitados = [];
      for (let i = 0; i < 12; i++) if (!h.maticesTocados[i]) evitados.push(i);
      return {
        mediana: mediana,
        muestras: ps.length,
        tendencia: h.sumas === h.restas ? null : (h.sumas > h.restas ? 'sumar' : 'restar'),
        masModificada: masModificada,
        nuncaAgrandadas: org.audibles().filter(v => h.agrandes.indexOf(v.id) < 0).map(v => v.id),
        maticesEvitados: evitados,
        acciones: h.acciones
      };
    };

    /* suficiente para actuar: tres pausas medidas. menos que eso sería
       inventar un hábito, no aprenderlo. */
    org.maquinaPuede = function () {
      const m = org.modeloDeHabitos();
      return m.muestras >= 3 && m.mediana !== null;
    };

    function maquinaActua() {
      const m = org.modeloDeHabitos();
      if (!org.maquinaPuede()) return null;
      const silencio = org.t - org.habitos.ultimo;
      if (silencio < m.mediana * 2) return null;
      const vs = org.audibles();
      if (vs.length < 2) return null;
      org.habitos.acciones++;
      const antesDeActuar = org.colores.length;
      let accion = null;
      if (m.tendencia === 'sumar' || m.tendencia === null) {
        /* usa la tendencia y el par más cercano que el visitante no juntó */
        let a = null, b = null, dm = 1e9;
        for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
          const d = separacion(vs[i], vs[j]);
          if (d > 0 && d < dm) { dm = d; a = vs[i]; b = vs[j]; }
        }
        if (a && b) {
          const r = superponer(a.id, b.id, m.tendencia === 'sumar' ? 'aditivo' : org.medio);
          accion = { tipo: 'superponer', par: [a.id, b.id], resultado: r };
        }
      }
      if (!accion) {
        /* duplica la que más modificaste, con TU pausa mediana como
           retardo canónico. eso era «arma tu ritmo». */
        const id = m.masModificada || vs[0].id;
        const copia = org.duplicar(id, m.mediana);
        accion = { tipo: 'duplicar', voz: id, retardo: m.mediana, copia: copia && copia.id };
      }
      /* lo que hace la máquina se marca: no es un recuerdo, es una
         inferencia. la bitácora podrá decir que ocurrió, no que el
         visitante lo hizo. */
      for (const v of org.voces) if (v.nacida === org.t) { v.origen = 'maquina'; v.clase = 'inferido'; }
      for (let i = antesDeActuar; i < org.colores.length; i++) {
        org.colores[i].clase = 'inferido';
        org.colores[i].origen = 'maquina';
        org.colores[i].causa = 'la máquina lo produjo: ' + org.colores[i].causa;
      }
      inscribir('maquina', 'la máquina actuó con tu pausa mediana de ' + m.mediana.toFixed(2) + ' s',
        { causa: 'hábito medido sobre ' + m.muestras + ' pausas' });
      invariante('la-maquina-uso-una-pausa-tuya',
        'pausa mediana ' + m.mediana.toFixed(2) + ' s usada como retardo canónico');
      org.habitos.ultimo = org.t;      // la máquina también respira
      return accion;
    }
    org.maquinaActua = maquinaActua;

    /* =================================================================
       EL RELOJ DEL MODELO
       `avanzar(t)` lleva el organismo hasta el instante t. no dispara
       notas: transforma un estado acumulativo. Tone decide cuándo se
       oye lo que aquí se calculó.
       ================================================================= */
    org.avanzar = function (t) {
      const eventos = [];
      if (t <= org.t) return eventos;
      const dt = t - org.t;
      org.t = t;
      if (org.detenido) return eventos;

      /* entradas canónicas que vencen: la copia llega, y puede llegar
         cuando su original ya se mezcló. */
      for (const v of org.voces) {
        if (v.entraEn !== undefined && v.entraEn <= org.t && v.estado === 'latente') {
          v.estado = 'audible';
          v.entradas++;
          const orig = v.original ? org.voz(v.original) : null;
          const cambió = orig && v.originalEra &&
            (COL.deltaH(orig.color, { H: v.originalEra.H }) > 3 || Math.abs(orig.color.C - v.originalEra.C) > 0.01);
          if (cambió) {
            v.clase = 'inferido';
            v.color.clase = v.color.clase === 'verdadero' ? 'inferido' : v.color.clase;
            inscribir('canon', v.id + ' entró cuando ' + orig.id + ' ya había cambiado',
              { causa: 'retardo canónico de ' + v.retardo.toFixed(2) + ' s' });
          } else {
            inscribir('canon', v.id + ' entró con retardo ' + v.retardo.toFixed(2) + ' s', { causa: 'canon' });
          }
          eventos.push({ t: org.t, tipo: 'entrada', voz: v.id });
          delete v.entraEn;
        }
      }

      /* la convergencia del canon de tempo: ocurre una vez. no se
         anuncia antes y no vuelve. */
      if (org.convergencia0 && !org.convergencia0.ocurrida && org.t >= org.convergencia0.t) {
        org.convergencia0.ocurrida = true;
        const razones = [];
        const vv = org.audibles();
        for (let i = 0; i < vv.length; i++) for (let j = i + 1; j < vv.length; j++) {
          razones.push(vv[i].id + ':' + vv[j].id + ' = ' + (org.periodo(vv[i]) / org.periodo(vv[j])).toFixed(4));
        }
        inscribir('convergencia', 'las voces coincidieron en el acontecimiento ' + org.convergencia0.indice,
          { causa: 'razones de área incompatibles · ' + razones.join(' · ') });
        eventos.push({ t: org.t, tipo: 'convergencia', indice: org.convergencia0.indice });
      }

      /* la interpolación espectral avanza sola: es un proceso, no una
         animación. una pantalla congelada la detiene. */
      for (const v of org.voces) {
        if (!v.interpolacion) continue;
        if (v.congelado) { v.interpolacion.t0 += dt; continue; }
        const x = (org.t - v.interpolacion.t0) / v.interpolacion.dur;
        if (x >= 1) {
          v.color = registrarColor(crearColor(v.interpolacion.color, {
            origen: 'interpolacion',
            causa: 'la interpolación espectral llegó: ' + v.interpolacion.causa,
            genealogia: [v.color.id, v.interpolacion.color.id],
            clase: v.interpolacion.color.clase
          }));
          regradar(v);
          v.interpolacion = null;
          eventos.push({ t: org.t, tipo: 'interpolacion-completa', voz: v.id });
        }
      }

      /* EL CANON PER TONOS.
         la rueda avanza una quinta cada vuelta, y arrastra con ella a las
         voces que el visitante no ha tocado desde la vuelta anterior:
         ésas son las que la máquina modula. después de doce vueltas una
         voz intacta debería estar en su matiz de origen. en temperamento
         igual está; en natural le falta la coma, y eso es el tema. */
      if (org.t >= org.rueda.proxima) {
        org.rueda.proxima = org.t + org.periodoRueda;
        const desde = org.rueda.ultima;
        org.vueltaDeRueda();
        for (const v of org.audibles()) {
          if (v.ultimoGesto !== undefined && v.ultimoGesto > desde) continue;
          if (v.hueOrigen === undefined) { v.hueOrigen = v.color.H; v.vueltasSinTocar = 0; }
          v.vueltasSinTocar++;
          let H = org.temperamento.avanzar(v.color.H);
          /* la rueda tampoco puede entrar en el arco inaccesible: si la
             quinta la deja ahí, rodea. esa voz queda marcada, porque su
             error ya no es sólo el del temperamento y medirlo mentiría. */
          const dentroDelArco = Math.abs(((H - org.inaccesible.matiz + 540) % 360) - 180) < org.inaccesible.arco;
          if (dentroDelArco) {
            H = apartarDelInaccesible(H);
            if (!v.desviadaPorArco) {
              v.desviadaPorArco = true;
              inscribir('rueda', v.id + ' tuvo que rodear el matiz que esta semilla no genera (' +
                org.inaccesible.matiz + '°)', { causa: 'color inaccesible' });
            }
          }
          v.color = registrarColor(crearColor({ L: v.color.L, C: v.color.C, H: H }, {
            origen: 'canon-per-tonos',
            causa: 'la rueda avanzó una quinta (' + org.temperamento.quinta.toFixed(4) + '°) sin que nadie la tocara',
            genealogia: [v.color.id], clase: v.color.clase
          }));
          regradar(v);
          if (v.vueltasSinTocar === 12) {
            if (v.desviadaPorArco) {
              inscribir('rueda', v.id + ' completó doce vueltas, pero su error no es medible: rodeó el arco inaccesible',
                { causa: 'color inaccesible' });
            } else {
              const err = ((v.color.H - v.hueOrigen + 540) % 360) - 180;
              inscribir('rueda', v.id + ' dio doce vueltas y quedó a ' + err.toFixed(4) + '° de su origen',
                { causa: 'temperamento ' + org.temperamento.nombre });
              eventos.push({ t: org.t, tipo: 'rueda-cerrada', voz: v.id, error: err });
            }
          }
        }
        org.rueda.ultima = org.t;
      }

      /* difusión: esperar produce información. dos pantallas vecinas que
         no se tocan se contaminan igual, sólo que despacio. */
      const vs = org.audibles();
      for (let i = 0; i < vs.length; i++) {
        for (let j = i + 1; j < vs.length; j++) {
          const a = vs[i], b = vs[j];
          const s = solape(a, b);
          if (s > 0) continue;
          const sep = separacion(a, b);
          if (sep > 0.06) continue;
          const k = (0.06 - sep) * dt * 0.06;
          const dh = COL.deltaHsig(a.color, b.color);
          if (Math.abs(dh) < 0.2) continue;
          a.color = crearColor({ L: a.color.L, C: a.color.C, H: a.color.H + dh * k }, {
            origen: 'difusion', causa: 'difusión con ' + b.id + ' a ' + sep.toFixed(3) + ' de distancia',
            genealogia: [a.color.id], clase: a.color.clase
          });
          b.color = crearColor({ L: b.color.L, C: b.color.C, H: b.color.H - dh * k }, {
            origen: 'difusion', causa: 'difusión con ' + a.id + ' a ' + sep.toFixed(3) + ' de distancia',
            genealogia: [b.color.id], clase: b.color.clase
          });
          a.rugosidad = Math.min(1, a.rugosidad + k * 2);
          b.rugosidad = Math.min(1, b.rugosidad + k * 2);
          regradar(a); regradar(b);
        }
      }

      /* choques: el único acontecimiento.
         y antes del choque, la prohibición: dos voces con el mismo matiz
         que se mueven juntas en claridad se funden, y no hace falta que
         se toquen para que la regla escolar se vuelva ley de la materia.
         basta con que sean vecinas y vayan a la par. */
      for (let i = 0; i < vs.length; i++) {
        for (let j = i + 1; j < vs.length; j++) {
          const a = vs[i], b = vs[j];
          if (a.estado === 'fundida' || b.estado === 'fundida') continue;
          const k = clave(a, b);
          const hay = solape(a, b) > 0;
          const cerca = hay || separacion(a, b) < 0.06;
          const antes = org.pares[k];
          const dh = COL.deltaH(a.color, b.color);

          let seguidas = 0;
          if (cerca && antes && dh < 4 && Math.abs(antes.dL) > 0.015) {
            const va = a.color.L - antes.La, vb = b.color.L - antes.Lb;
            /* movimiento paralelo: las dos claridades se mueven, y en el
               mismo sentido. octavas y quintas paralelas de toda la vida,
               sólo que aquí cuestan una voz.

               hacen falta dos evaluaciones seguidas: un temblor no es un
               movimiento, y matar una voz por un temblor sería ruido. */
            if (Math.abs(va) > 0.004 && Math.abs(vb) > 0.004 && Math.sign(va) === Math.sign(vb)) {
              seguidas = (antes.paralelo || 0) + 1;
              if (seguidas >= 2) {
                const muere = org.area(a) <= org.area(b) ? a : b;
                const queda = muere === a ? b : a;
                fundir(muere, queda, 'paralelas: ΔH ' + dh.toFixed(1) + '° y las dos claridades moviéndose en el mismo sentido (' +
                  va.toFixed(3) + ' / ' + vb.toFixed(3) + ') durante ' + seguidas + ' evaluaciones');
                eventos.push({ t: org.t, tipo: 'paralelas', voz: muere.id, en: queda.id });
                org.pares[k] = { tocando: hay, La: a.color.L, Lb: b.color.L, dL: a.color.L - b.color.L, paralelo: 0 };
                continue;
              }
            }
          }

          if (hay && (!antes || !antes.tocando)) {
            const r = choque(a, b);
            eventos.push({ t: org.t, tipo: 'choque', par: k, resultado: r });
          }
          org.pares[k] = {
            tocando: hay,
            La: a.color.L, Lb: b.color.L,
            dL: a.color.L - b.color.L,
            paralelo: seguidas
          };
        }
      }

      /* triángulos monocromáticos: se instala una recurrencia que ya no
         depende del visitante */
      for (const tri of triangulos()) {
        const ids = tri.map(v => v.id).sort().join('+');
        if (org.recurrencias.some(r => r.ids === ids)) continue;
        org.recurrencias.push({
          ids: ids, voces: tri.map(v => v.id), desde: org.t,
          periodo: tri.reduce((s, v) => s + org.periodo(v), 0) / 3,
          causa: 'triángulo monocromático en la estación ' + org.temperamento.cuantiza(tri[0].color.H).estacion
        });
        inscribir('recurrencia', 'se instaló una recurrencia entre ' + ids, { causa: 'triángulo monocromático' });
        invariante('el-choque-se-volvio-pulso', ids);
      }

      /* coloración del grafo: si deja de admitirla, algo se va */
      const exp = expulsarSiHaceFalta();
      if (exp) eventos.push({ t: org.t, tipo: 'expulsion', voz: exp.id });

      /* la máquina */
      const acc = maquinaActua();
      if (acc) eventos.push({ t: org.t, tipo: 'maquina', accion: acc });

      /* un canon que se cierra sin el visitante: una recurrencia que
         completó doce períodos sin ningún gesto de por medio */
      for (const r of org.recurrencias) {
        if (r.cerrado) continue;
        if (org.t - r.desde > r.periodo * 12 && org.habitos.ultimo < r.desde) {
          r.cerrado = true;
          invariante('un-canon-se-cerro-sin-el-visitante', r.ids + ' completó doce períodos sin un gesto');
        }
      }

      /* ruido ↔ altura */
      for (const v of vs) {
        const gris = COL.esGris(v.color);
        if (gris && !v.eraGris) {
          v.eraGris = true;
          invariante('la-altura-volvio-a-ser-ruido', v.id + ' perdió el croma: C ' + v.color.C.toFixed(4));
        } else if (!gris && v.eraGris) {
          v.eraGris = false;
          invariante('el-ruido-se-volvio-altura', v.id + ' recuperó croma por mezcla: C ' + v.color.C.toFixed(4));
        }
      }

      movimiento();

      /* EL FINAL · el presupuesto se agota y la pieza se detiene a mitad
         de una entrada, como El arte de la fuga. no hay cadencia. */
      if (org.presupuesto.restante <= 0 && !org.detenido) detenerse();

      return eventos;
    };

    function detenerse() {
      org.detenido = true;
      const aMedias = org.voces.filter(v => v.interpolacion || (v.entraEn !== undefined && v.estado === 'latente'));
      org.entradaInterrumpida = aMedias.length ? {
        voz: aMedias[0].id,
        causa: aMedias[0].interpolacion ? aMedias[0].interpolacion.causa : 'entrada canónica pendiente',
        faltaba: aMedias[0].interpolacion
          ? Math.max(0, aMedias[0].interpolacion.dur - (org.t - aMedias[0].interpolacion.t0))
          : Math.max(0, (aMedias[0].entraEn || org.t) - org.t)
      } : { voz: null, causa: 'el croma se agotó sin nada a medias', faltaba: 0 };
      inscribir('final', 'se detuvo a mitad de una entrada', { causa: 'el presupuesto de croma llegó a cero' });
      org.movimiento = 'gris';
    }
    org.detenerse = detenerse;

    /* ---- los cinco movimientos ---------------------------------------
       no son cinco páginas: son cinco estados del mismo organismo, y sus
       disparadores son números, no gustos. */
    function movimiento() {
      if (org.detenido) { org.movimiento = 'gris'; return org.movimiento; }
      const choques = Object.keys(org.choques).length;
      const audibles = org.audibles().length;
      const p = org.presupuesto.inicial > 0 ? org.presupuesto.restante / org.presupuesto.inicial : 1;
      const canon = org.voces.some(v => v.origen === 'canon' && v.estado === 'audible');
      const desorden = audibles >= Math.max(5, org.nVoces + 1) || org.recurrencias.length >= 2;
      let m = 'invencion';
      if (choques > 0) m = 'canon';
      if (canon && (org.rueda.vueltas >= 3 || org.colores.some(c => c.clase === 'contradictorio'))) m = 'temperamento';
      if (desorden && p < 0.6) m = 'desorden';
      if (p <= 0) m = 'gris';
      /* los movimientos no retroceden: son estados del organismo, no
         escenas de un guión */
      const orden = ['invencion', 'canon', 'temperamento', 'desorden', 'gris'];
      if (orden.indexOf(m) > orden.indexOf(org.movimiento)) {
        org.movimiento = m;
        inscribir('movimiento', m, { causa: 'choques ' + choques + ' · audibles ' + audibles + ' · croma ' + (p * 100).toFixed(1) + '%' });
      }
      return org.movimiento;
    }
    org.calcularMovimiento = movimiento;

    /* =================================================================
       ARRANQUE
       tres a seis pantallas, croma alto, matices claramente distintos,
       silencio casi total. nada suena hasta que algo se toca.
       ================================================================= */
    (function arrancar() {
      const r = RNG.make(semilla, 'arranque');
      const est = org.temperamento.estaciones;
      /* matices bien separados: en la invención se tienen que poder
         distinguir sin esfuerzo */
      const salto = Math.max(2, Math.floor(12 / org.nVoces));
      const base = r.i(0, 11);
      for (let i = 0; i < org.nVoces; i++) {
        const H = apartarDelInaccesible(est[(base + i * salto) % 12]);
        const L = 0.34 + (i / Math.max(1, org.nVoces - 1)) * 0.42;
        const C = org.familiaCroma * r.f(0.85, 1.15);
        const color = registrarColor(crearColor({ L: L, C: C, H: H }, {
          origen: 'semilla', causa: 'voz inicial ' + i + ' de la semilla «' + semilla + '»', clase: 'verdadero'
        }));
        /* las áreas llevan la razón de tempo: incompatibles por
           construcción, para que la convergencia ocurra una sola vez */
        const razon = org.razon.v[i % org.razon.v.length];
        const norm = razon / org.razon.v[0];
        const area = 0.02 * norm;
        const w = Math.min(0.42, Math.sqrt(area * 1.6));
        const h = Math.min(0.42, area / w);
        const v = nuevaVoz({
          color: color,
          rect: {
            x: 0.06 + (i % 3) * 0.30 + r.f(0, 0.03),
            y: 0.08 + Math.floor(i / 3) * 0.34 + r.f(0, 0.03),
            w: w, h: h
          },
          eje: Math.round(r.f(0, 360)),
          fase: r.f(0, 1.4),
          estado: 'audible',
          origen: 'semilla',
          causa: 'voz inicial de la semilla'
        });
        v.eraGris = COL.esGris(v.color);
      }
      /* EL PUNTO DE CONVERGENCIA (Nancarrow).
         las fases no se sortean: se resuelven. con fase_i = tConv − k·T_i,
         TODAS las voces coinciden en el acontecimiento número k y en el
         instante tConv, una sola vez, y después se separan para siempre.
         como las áreas son incompatibles, no hay un segundo encuentro:
         el sistema no es periódico. */
      org.convergencia0 = { indice: 24, t: r.f(45, 110) };
      for (const v of org.voces) v.fase = org.convergencia0.t - org.convergencia0.indice * org.periodo(v);

      /* el presupuesto sale del croma que la semilla puso en el campo.
         no es un número inventado: es lo que hay. */
      org.presupuesto.inicial = org.voces.reduce((s, v) => s + v.color.C, 0) * 10;
      org.presupuesto.restante = org.presupuesto.inicial;
      inscribir('arranque', org.nVoces + ' voces · medio ' + org.medio + ' · temperamento ' +
        org.temperamento.nombre + ' · razón ' + org.razon.nombre,
        { causa: 'semilla «' + semilla + '»' });
    })();

    /* =================================================================
       MEDIDAS Y RASTRO LEGIBLE
       toda condición audible tiene aquí su equivalente en texto. la obra
       entera se recorre sin sonido y sin matiz sin perder estructura.
       ================================================================= */
    org.medidas = function () {
      const vs = org.audibles();
      const conv = [];
      for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
        const c = org.convergencia(vs[i], vs[j]);
        if (c) conv.push({ par: vs[i].id + '|' + vs[j].id, indice: c.indice, t: Math.round(c.t * 100) / 100, razon: Math.round(c.razon * 10000) / 10000 });
      }
      return {
        semilla: org.semilla,
        t: Math.round(org.t * 100) / 100,
        movimiento: org.movimiento,
        detenido: org.detenido,
        medio: org.medio,
        temperamento: org.temperamento.nombre,
        razonDeTempo: org.razon.nombre,
        acento: org.acento.nombre,
        voces: { vivas: org.vivas().length, audibles: vs.length, fundidas: org.voces.filter(v => v.estado === 'fundida').length, expulsadas: org.voces.filter(v => v.estado === 'expulsada').length, podadas: org.voces.filter(v => v.estado === 'podada').length },
        colores: org.colores.length,
        clases: COL.CLASES.reduce(function (a, k) { a[k] = org.colores.filter(c => c.clase === k).length; return a; }, {}),
        choques: Object.keys(org.choques).length,
        cancelaciones: org.cancelaciones.length,
        recurrencias: org.recurrencias.length,
        rueda: { vueltas: org.rueda.vueltas, residuo: Math.round(org.rueda.residuo * 1000) / 1000, cerrada: org.rueda.cerrada },
        criba: { clases: org.criba().length, densidad: Math.round(org.densidadCriba() * 1000) / 1000 },
        presupuesto: {
          inicial: Math.round(org.presupuesto.inicial * 10000) / 10000,
          restante: Math.round(org.presupuesto.restante * 10000) / 10000,
          gastadoPorCiento: org.presupuesto.inicial ? Math.round(Math.min(1, org.presupuesto.gastado / org.presupuesto.inicial) * 1000) / 10 : 0
        },
        coloresDisponibles: org.coloresDisponibles(),
        convergencias: conv,
        invariantes: Object.keys(org.invariantes),
        habitos: org.modeloDeHabitos()
      };
    };

    /* una línea: el mismo estado para quien no puede oír ni distinguir
       matices */
    org.linea = function () {
      const m = org.medidas();
      return m.movimiento + ' · ' + m.voces.audibles + ' voces · ' + m.choques + ' choques · croma ' +
        (100 - m.presupuesto.gastadoPorCiento).toFixed(1) + '% · rueda ' + m.rueda.vueltas + ' vueltas · ' +
        m.invariantes.length + ' invariantes';
    };

    /* los rasgos que NO son matiz. con visión monocromática se pierde el
       matiz y no se pierde la estructura: por eso cada voz tiene también
       área, posición, textura y comportamiento temporal. */
    org.rasgosNoCromaticos = function (v) {
      return {
        area: Math.round(org.area(v) * 10000) / 10000,
        periodo: Math.round(org.periodo(v) * 1000) / 1000,
        plano: org.plano(v),
        eje: v.eje,
        textura: v.clase,                    // borde y residuo: clase de memoria
        estado: v.estado,
        rugosidad: Math.round(v.rugosidad * 100) / 100,
        erosion: v.erosion,
        bandas: BANDAS - v.erosion,
        congelado: v.congelado
      };
    };

    /* el certificado: describe genealogía sin afirmar que la demuestra */
    org.certificado = function () {
      const m = org.medidas();
      return {
        semilla: org.semilla,
        aviso: 'este documento describe una genealogía. no demuestra su contenido: ' +
          'parte de los colores que menciona son inferidos o inventados, y de ésos la bitácora ' +
          'sólo puede decir que aparecieron.',
        medio: org.medio,
        temperamento: org.temperamento.medidas(),
        razonDeTempo: org.razon.nombre,
        colorInaccesible: org.inaccesible,
        presupuesto: m.presupuesto,
        muertes: org.voces.filter(v => v.muerte).map(v => ({ voz: v.id, causa: v.muerte.causa, t: v.muerte.t })),
        cancelaciones: org.cancelaciones,
        invariantes: org.invariantes,
        entradaInterrumpida: org.entradaInterrumpida,
        genealogia: org.colores.map(c => ({
          nombre: c.nombre, clase: c.clase, origen: c.origen, causa: c.causa,
          de: c.genealogia, L: Math.round(c.L * 1000) / 1000, C: Math.round(c.C * 10000) / 10000, H: Math.round(c.H * 10) / 10
        })),
        descendiente: org.semillaDescendiente()
      };
    };

    /* la semilla descendiente hereda la deformación final, no una
       grabación. lo que quedó a medias viaja con ella. */
    org.semillaDescendiente = function () {
      const firma = [
        org.semilla,
        Object.keys(org.invariantes).sort().join(','),
        org.voces.filter(v => v.muerte).length,
        org.cancelaciones.length,
        Math.round(org.presupuesto.gastado * 1000),
        org.rueda.vueltas,
        org.entradaInterrumpida ? org.entradaInterrumpida.voz : '-'
      ].join('|');
      const h = RNG.hash32(firma);
      const r = RNG.make(firma, 'descendiente');
      return r.pick(RNG.SUS) + '-' + r.pick(RNG.ADJ) + '-' + (100 + (h % 900));
    };

    org.TOPES = TOPES;
    org.BANDAS = BANDAS;
    return org;
  }

  const API = { crear, TOPES, BANDAS, RAZONES, ACENTOS, ESTADOS };

  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.contrapunto = API;
  if (typeof module === 'object' && module.exports) module.exports = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
