'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — color.js
   la ley física de la pieza. no es una paleta: es un espacio métrico.

   OKLCH es el estado de verdad (L claridad perceptual 0–1, C croma
   0–~0.37, H matiz en grados). el hex es salida y nunca estado. HSL sólo
   entra como afinación falsa deliberada: es el temperamento natural.

   aquí viven las cuatro cosas de las que se deriva todo lo demás:
     Δ(a,b)   distancia cromática en OKLab  → consonancia y rugosidad
     ΔH(a,b)  ángulo corto de matiz         → intervalo
     mezcla   aditiva · sustractiva · diferencia, según el medio
     el gris  el atractor: croma cero es ruido sin altura

   este módulo no dibuja ni suena. corre entero con la bocina apagada y
   con la pantalla apagada.
   ===================================================================== */
(function (raiz) {

  const nombres = (raiz.CLAVE && raiz.CLAVE.nombres)
    || (typeof require === 'function' ? require('./nombres.js') : null);

  /* croma máximo alcanzable en sRGB, redondeado hacia abajo. sirve de
     referencia para normalizar, no de límite duro. */
  const C_MAX = 0.37;
  /* debajo de esto ya no hay matiz que valga: es el gris trabajando */
  const C_GRIS = 0.02;
  /* 360° de matiz = una octava = 1200 cents. de aquí sale todo el
     temperamento, y de aquí salen los microtonos de Carrillo. */
  const CENTS_POR_GRADO = 1200 / 360;

  /* ---- conversiones (Ottosson) --------------------------------------
     sRGB ↔ lineal ↔ OKLab ↔ OKLCH. sin dependencias: la pieza tiene que
     abrir dentro de diez años y sin red. */

  function aLineal(v) {
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function aGama(v) {
    return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  }

  function linealAOklab(r, g, b) {
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
    return {
      L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    };
  }

  function oklabALineal(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    return {
      r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    };
  }

  function oklchAOklab(c) {
    const h = c.H * Math.PI / 180;
    return { L: c.L, a: Math.cos(h) * c.C, b: Math.sin(h) * c.C };
  }

  function oklabAOklch(o) {
    const C = Math.hypot(o.a, o.b);
    let H = Math.atan2(o.b, o.a) * 180 / Math.PI;
    if (H < 0) H += 360;
    return { L: o.L, C: C, H: C < 1e-7 ? 0 : H };
  }

  function oklchALineal(c) { const o = oklchAOklab(c); return oklabALineal(o.L, o.a, o.b); }

  function linealAOklch(lin) { return oklabAOklch(linealAOklab(lin.r, lin.g, lin.b)); }

  /* ---- gama: bajar el croma hasta que el color exista de verdad ------
     recortar los canales cambiaría el matiz sin avisar. bisecar el croma
     conserva L y H, que son las dos coordenadas de las que cuelgan el
     registro y la altura. */
  function dentro(lin, e) {
    const t = e === undefined ? 1e-4 : e;
    return lin.r >= -t && lin.r <= 1 + t && lin.g >= -t && lin.g <= 1 + t && lin.b >= -t && lin.b <= 1 + t;
  }

  function enGama(c) {
    const cl = { L: Math.min(1, Math.max(0, c.L)), C: Math.max(0, c.C), H: ((c.H % 360) + 360) % 360 };
    if (dentro(oklchALineal(cl))) return cl;
    let lo = 0, hi = cl.C;
    for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) / 2;
      if (dentro(oklchALineal({ L: cl.L, C: mid, H: cl.H }))) lo = mid; else hi = mid;
    }
    return { L: cl.L, C: lo, H: cl.H };
  }

  function hex(c) {
    const lin = oklchALineal(enGama(c));
    const b = (v) => {
      const n = Math.round(Math.min(1, Math.max(0, aGama(Math.min(1, Math.max(0, v))))) * 255);
      return n.toString(16).padStart(2, '0');
    };
    return '#' + b(lin.r) + b(lin.g) + b(lin.b);
  }

  function deHex(h) {
    const s = String(h).replace('#', '');
    const n = parseInt(s.length === 3 ? s.split('').map(x => x + x).join('') : s, 16);
    const r = aLineal(((n >> 16) & 255) / 255);
    const g = aLineal(((n >> 8) & 255) / 255);
    const b = aLineal((n & 255) / 255);
    return linealAOklch({ r, g, b });
  }

  /* ---- HSL: la afinación falsa --------------------------------------
     no se usa para pintar. se usa para construir el temperamento natural
     y para poder medir en cuánto se equivoca. */
  function hslASrgb(h, s, l) {
    const H = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (H < 60) { r = c; g = x; }
    else if (H < 120) { r = x; g = c; }
    else if (H < 180) { g = c; b = x; }
    else if (H < 240) { g = x; b = c; }
    else if (H < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return { r: r + m, g: g + m, b: b + m };
  }

  /* el matiz OKLCH que le corresponde a un matiz HSL. la nolinealidad de
     este mapa es, literalmente, el desierto entre el verde y el azul y el
     atasco de amarillos. */
  function matizDeHsl(h) {
    const s = hslASrgb(h, 1, 0.5);
    return linealAOklch({ r: aLineal(s.r), g: aLineal(s.g), b: aLineal(s.b) }).H;
  }

  /* ---- las dos métricas ---------------------------------------------- */

  /* Δ: distancia euclidiana en OKLab (ΔE OK). decide consonancia,
     vecindad y confusión. */
  function delta(a, b) {
    const x = oklchAOklab(a), y = oklchAOklab(b);
    return Math.hypot(x.L - y.L, x.a - y.a, x.b - y.b);
  }

  /* ΔH: el ángulo corto entre matices, en grados. decide intervalo. */
  function deltaH(a, b) {
    let d = Math.abs(a.H - b.H) % 360;
    return d > 180 ? 360 - d : d;
  }

  /* con signo, para saber si dos voces se mueven en paralelo */
  function deltaHsig(a, b) {
    let d = (b.H - a.H) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }

  function esGris(c) { return c.C < C_GRIS; }

  /* ---- las reglas de mezcla ------------------------------------------
     dos, y distinguibles. el medio de la región decide cuál se aplica, y
     el mismo par de colores da resultados distintos según el medio.

     ninguna es reversible: de `mezcla(a,b)` no se puede volver a `a` ni a
     `b`. el sistema guarda la causa, no el material. */

  function mezclaLineal(a, b, medio, peso) {
    const p = peso === undefined ? 0.5 : Math.min(1, Math.max(0, peso));
    const A = oklchALineal(a), B = oklchALineal(b);
    const ch = ['r', 'g', 'b'];
    const out = {};
    for (const k of ch) {
      const x = Math.min(1, Math.max(0, A[k])), y = Math.min(1, Math.max(0, B[k]));
      if (medio === 'aditivo') {
        /* luz: se suman. con peso 0.5 la suma es literal, x + y, y por
           eso dos colores intensos se comen su propio matiz al saturar
           hacia el blanco: no lo decide nadie, lo decide el techo. */
        out[k] = Math.min(1, x * 2 * (1 - p) + y * 2 * p);
      } else if (medio === 'diferencia') {
        /* el `mix-blend-mode: difference` del CSS, sin metáfora */
        out[k] = Math.abs(x - y);
      } else {
        /* tinte: se restan hacia el lodo. la multiplicación en luz lineal
           es lo que hace que dos complementarios se cancelen sin que haya
           que programar la cancelación aparte. */
        out[k] = Math.pow(x, 1 - p + 0.5) * Math.pow(y, p + 0.5);
      }
    }
    return linealAOklch(out);
  }

  /* la operación completa: color resultante + lo que costó.
     el costo es siempre positivo: mezclar gasta croma aunque el
     resultado parezca más vivo. no hay mezcla gratis. */
  function mezclar(a, b, medio, peso) {
    const r = enGama(mezclaLineal(a, b, medio, peso));
    const d = delta(a, b);
    const dh = deltaH(a, b);
    const perdido = Math.max(0, (a.C + b.C) / 2 - r.C);
    const costo = Math.max(0.004, perdido + d * 0.35);
    const complementarios = Math.abs(dh - 180) < 12;
    /* cancelación: no está programada aparte. es lo que ocurre cuando la
       multiplicación en luz lineal de dos complementarios deja el croma
       por debajo de un tercio del más pobre de los dos. */
    const cancela = complementarios && medio !== 'aditivo' && r.C < Math.min(a.C, b.C) * 0.5;
    return {
      color: r,
      costo: costo,
      delta: d,
      deltaH: dh,
      medio: medio,
      cancela: cancela,
      causa: 'mezcla ' + medio + ' · ΔH ' + dh.toFixed(1) + '° · Δ ' + d.toFixed(3) +
        (cancela ? ' · cancelación' : '') + ' · croma gastado ' + costo.toFixed(4)
    };
  }

  /* ---- TEMPERAMENTO --------------------------------------------------
     la rueda de matiz tiene el mismo problema que la octava: doce pasos
     iguales sólo lo son en un espacio. y como en la música, la elección
     no es entre bueno y malo, sino entre dónde pagarlo.

     igual (OKLCH)   doce pasos de 30° perceptualmente iguales. la rueda
                     CIERRA —residuo 0.000°— y se paga con que cada quinta
                     está 1.955 cents baja, en las doce tonalidades.
     natural (HSL)   doce pasos de 30° HSL, perceptualmente desiguales:
                     hay regiones purísimas y un desierto entre el verde y
                     el azul. las quintas son puras y por eso la rueda NO
                     cierra: deja la coma, +7.038°.

     con 360° = una octava = 1200 cents:
       quinta pura      1200·log2(3/2) = 701.955 cents = 210.5865°
       quinta temperada                   700    cents = 210.0000°
       doce quintas puras − siete vueltas = 7.038° (la coma pitagórica) */

  const QUINTA_PURA = 1200 * Math.log2(3 / 2) / CENTS_POR_GRADO;   // 210.5865°
  const QUINTA_IGUAL = 700 / CENTS_POR_GRADO;                      // 210.0000°

  function temperamento(nombre, opciones) {
    const o = Object.assign({ H0: 0, L: 0.62, C: 0.16 }, opciones || {});
    const igual = nombre !== 'natural';
    const estaciones = [];
    if (igual) {
      for (let i = 0; i < 12; i++) estaciones.push((o.H0 + i * 30) % 360);
    } else {
      /* el matiz HSL de la estación i, leído en OKLCH: ahí está el
         desierto y ahí está el atasco. */
      const h0 = 0;
      for (let i = 0; i < 12; i++) estaciones.push((matizDeHsl(h0 + i * 30) + o.H0) % 360);
      estaciones.sort((a, b) => a - b);
    }

    /* los doce pasos, medidos en grados OKLCH y en ΔEok con L y C fijos */
    const pasos = [], pasosE = [];
    for (let i = 0; i < 12; i++) {
      const a = estaciones[i], b = estaciones[(i + 1) % 12];
      let d = (b - a + 360) % 360;
      pasos.push(d);
      pasosE.push(delta({ L: o.L, C: o.C, H: a }, { L: o.L, C: o.C, H: b }));
    }
    const media = pasos.reduce((s, x) => s + x, 0) / 12;
    const mediaE = pasosE.reduce((s, x) => s + x, 0) / 12;
    const sigma = Math.sqrt(pasos.reduce((s, x) => s + (x - media) * (x - media), 0) / 12);
    const sigmaE = Math.sqrt(pasosE.reduce((s, x) => s + (x - mediaE) * (x - mediaE), 0) / 12);

    const quinta = igual ? QUINTA_IGUAL : QUINTA_PURA;
    /* doce quintas deberían ser siete vueltas exactas. en igual lo son. */
    const residuo = (quinta * 12) - 2520;

    /* cuantizar: la altura sale de la estación más cercana, y lo que
       sobra se vuelve desviación en cents. los microtonos no se eligen:
       son lo que queda cuando un matiz cae entre dos pasos. */
    function cuantiza(H) {
      let mejor = 0, dm = 1e9;
      for (let i = 0; i < 12; i++) {
        let d = Math.abs(((H - estaciones[i] + 540) % 360) - 180);
        d = 180 - d;
        if (d < dm) { dm = d; mejor = i; }
      }
      let signo = ((H - estaciones[mejor] + 540) % 360) - 180;
      signo = signo > 0 ? 1 : -1;
      return {
        estacion: mejor,
        matiz: estaciones[mejor],
        grados: dm * signo,
        cents: dm * signo * CENTS_POR_GRADO
      };
    }

    return {
      nombre: igual ? 'igual' : 'natural',
      espacio: igual ? 'OKLCH' : 'HSL',
      estaciones: estaciones,
      pasos: pasos,
      pasosE: pasosE,
      quinta: quinta,
      residuoRueda: residuo,
      errorPorQuinta: quinta - QUINTA_PURA,
      dispersion: { min: Math.min.apply(null, pasos), max: Math.max.apply(null, pasos), media: media, sigma: sigma },
      dispersionE: { min: Math.min.apply(null, pasosE), max: Math.max.apply(null, pasosE), media: mediaE, sigma: sigmaE },
      cuantiza: cuantiza,
      /* una vuelta del canon per tonos: la rueda avanza una quinta */
      avanzar: function (H) { return (H + quinta) % 360; },
      /* qué cuenta como vecino en este temperamento: el umbral es
         perceptual (ΔEok), así que en natural los vecinos no son los
         mismos grados en todas partes. */
      vecinos: function (a, b) { return delta(a, b) < 0.10; },
      medidas: function () {
        return {
          temperamento: igual ? 'igual (OKLCH)' : 'natural (HSL)',
          quintaGrados: Math.round(quinta * 10000) / 10000,
          quintaCents: Math.round(quinta * CENTS_POR_GRADO * 1000) / 1000,
          residuoGrados: Math.round(residuo * 10000) / 10000,
          residuoCents: Math.round(residuo * CENTS_POR_GRADO * 1000) / 1000,
          errorPorQuintaCents: Math.round((quinta - QUINTA_PURA) * CENTS_POR_GRADO * 1000) / 1000,
          pasoMin: Math.round(Math.min.apply(null, pasos) * 100) / 100,
          pasoMax: Math.round(Math.max.apply(null, pasos) * 100) / 100,
          pasoSigma: Math.round(sigma * 100) / 100,
          pasoEMin: Math.round(Math.min.apply(null, pasosE) * 10000) / 10000,
          pasoEMax: Math.round(Math.max.apply(null, pasosE) * 10000) / 10000,
          pasoESigma: Math.round(sigmaE * 10000) / 10000
        };
      }
    };
  }

  /* ---- altura: el matiz es la nota ----------------------------------
     360° = una octava. la claridad decide el registro. lo que el matiz no
     acierta a caer en la rejilla se vuelve desviación en cents, y esa
     desviación es una causa, no un adorno. */
  function altura(c, temp, f0) {
    const q = temp.cuantiza(c.H);
    const base = f0 || 55;
    const octava = Math.round(c.L * 4) - 1;            // −1 … +3
    const hz = base * Math.pow(2, octava + q.matiz / 360);
    const hzReal = hz * Math.pow(2, q.cents / 1200);
    return {
      hz: hzReal,
      hzTemperada: hz,
      octava: octava,
      estacion: q.estacion,
      cents: q.cents,
      /* un matiz mal afinado produce una altura mal afinada: eso es
         Carrillo, y viene de una distancia, no de un gusto */
      microtonal: Math.abs(q.cents) > 12
    };
  }

  /* ---- contraste: se calcula, no se estima --------------------------- */
  function luminancia(c) {
    const lin = oklchALineal(enGama(c));
    const f = (v) => Math.min(1, Math.max(0, v));
    return 0.2126 * f(lin.r) + 0.7152 * f(lin.g) + 0.0722 * f(lin.b);
  }

  function contraste(a, b) {
    const x = luminancia(a), y = luminancia(b);
    const hi = Math.max(x, y), lo = Math.min(x, y);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* si un color generado no llega al umbral con su fondo, se ajusta L.
     no se rinde y no cambia de matiz: el matiz es información. */
  function ajustarL(c, fondo, minimo) {
    const min = minimo || 4.5;
    if (contraste(c, fondo) >= min) return c;
    let mejor = c, mejorK = contraste(c, fondo);
    for (let paso = 0; paso <= 100; paso++) {
      for (const s of [1, -1]) {
        const L = Math.min(1, Math.max(0, c.L + s * paso / 100));
        const cand = enGama({ L: L, C: c.C, H: c.H });
        const k = contraste(cand, fondo);
        if (k > mejorK) { mejor = cand; mejorK = k; }
        if (k >= min) return cand;
      }
    }
    return mejor;
  }

  /* ---- dicromacia: para probar que el matiz no es el único canal -----
     matrices de Viénot–Brettel–Mollon aplicadas en luz lineal. no se usan
     en la obra: se usan en las pruebas, para comprobar que dos cosas que
     el modelo trata como distintas siguen siendo distinguibles sin matiz
     —por forma, área, posición o textura—. */
  function simular(c, tipo) {
    const lin = oklchALineal(enGama(c));
    const r = Math.min(1, Math.max(0, lin.r)), g = Math.min(1, Math.max(0, lin.g)), b = Math.min(1, Math.max(0, lin.b));
    let o;
    if (tipo === 'protanopia') o = { r: 0.0 * r + 2.02344 * g - 2.52581 * b, g: g, b: b };
    else if (tipo === 'deuteranopia') o = { r: r, g: 0.494207 * r + 0.0 * g + 1.24827 * b, b: b };
    else o = { r: r, g: g, b: b };          // acromatopsia: sólo claridad
    if (tipo === 'acromatopsia') {
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      o = { r: y, g: y, b: y };
    }
    for (const k of ['r', 'g', 'b']) o[k] = Math.min(1, Math.max(0, o[k]));
    return linealAOklch(o);
  }

  /* ---- nombrar: procedencia, no notación ---------------------------- */
  function nombre(c) {
    if (!nombres) return 'color';
    let mejor = nombres.NOMBRES[0], dm = 1e9;
    for (const n of nombres.NOMBRES) {
      const d = delta(c, n);
      if (d < dm) { dm = d; mejor = n; }
    }
    return mejor.nombre;
  }

  function familia(c) {
    if (!nombres) return 'color';
    let mejor = nombres.NOMBRES[0], dm = 1e9;
    for (const n of nombres.NOMBRES) {
      const d = delta(c, n);
      if (d < dm) { dm = d; mejor = n; }
    }
    return mejor.familia;
  }

  /* ---- el expediente cromático ---------------------------------------
     un color sin causa es un bug. cada uno lleva su procedencia, su
     genealogía y su clase de memoria, exactamente como las huellas de
     `espectro.js`.

       verdadero      salió de la semilla o de una operación exacta
       degradado      volvió deformado, o fue erosionado por repetición
       inferido       la máquina lo dedujo de un hábito del visitante
       inventado      no hay gesto que lo explique; la bitácora no puede
                      afirmar que ocurrió
       contradictorio dos historias distintas produjeron el mismo color */
  const CLASES = ['verdadero', 'degradado', 'inferido', 'inventado', 'contradictorio'];

  let contador = 0;
  function crear(coords, datos) {
    const c = enGama(coords);
    const d = datos || {};
    return {
      id: d.id || ('c' + (contador++)),
      L: c.L, C: c.C, H: c.H,
      nombre: d.nombre || nombre(c),
      familia: familia(c),
      origen: d.origen || 'semilla',
      causa: d.causa || 'derivado de la semilla',
      genealogia: d.genealogia || [],
      clase: d.clase || 'verdadero',
      mezclas: d.mezclas || 0
    };
  }

  function reiniciarContador() { contador = 0; }

  /* una línea de texto con el mismo estado, para quien no ve el matiz */
  function linea(c) {
    return c.nombre + ' · L ' + c.L.toFixed(2) + ' · C ' + c.C.toFixed(3) +
      ' · H ' + Math.round(c.H) + '° · ' + c.clase +
      (c.genealogia && c.genealogia.length ? ' · de ' + c.genealogia.join('+') : '');
  }

  const API = {
    C_MAX, C_GRIS, CENTS_POR_GRADO, CLASES, QUINTA_PURA, QUINTA_IGUAL,
    aLineal, aGama, linealAOklab, oklabALineal, oklchAOklab, oklabAOklch,
    oklchALineal, linealAOklch, enGama, dentro, hex, deHex,
    hslASrgb, matizDeHsl,
    delta, deltaH, deltaHsig, esGris,
    mezclar, mezclaLineal,
    temperamento, altura,
    luminancia, contraste, ajustarL, simular,
    nombre, familia, crear, linea, reiniciarContador
  };

  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.color = API;
  if (typeof module === 'object' && module.exports) module.exports = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
