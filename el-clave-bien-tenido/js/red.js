'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — red.js
   Web Audio: el organismo conectado. aquí se enruta, se filtra, se mide
   y se protege. no se compone y no se elige timbre.

   un solo AudioContext para toda la pieza: el de Tone. dos contextos son
   dos obras que no se oyen entre sí.

   dos planos, como en `sound.js`: el campo sostenido atrás y el canto
   adelante. si todo va al mismo plano, es una masa.

   y la sonda de nivel, que es lo único honesto que tengo: no puedo oír,
   pero sí puedo medir.
   ===================================================================== */
(function (raiz) {

  const TOPE = { voces: 16, ruido: 3, faust: 8 };

  const R = {
    ctx: null, maestro: null, limitador: null, tope: null,
    campo: null, canto: null, analizador: null, buf: null,
    cuentas: { faust: 0, osciladores: 0, ruidos: 0, nodos: 0 },
    encendido: false
  };

  function arrancar(ctx) {
    if (R.encendido && R.ctx === ctx) return R;
    R.ctx = ctx;

    /* tope de ganancia + limitador antes de la salida. nunca se conecta
       una voz directo a `destination`. */
    R.limitador = ctx.createDynamicsCompressor();
    R.limitador.threshold.value = -18;
    R.limitador.knee.value = 6;
    R.limitador.ratio.value = 14;
    R.limitador.attack.value = 0.005;
    R.limitador.release.value = 0.22;

    R.tope = ctx.createGain();
    R.tope.gain.value = 0.72;

    R.maestro = ctx.createGain();
    R.maestro.gain.value = 0.0001;

    R.maestro.connect(R.limitador);
    R.limitador.connect(R.tope);
    R.tope.connect(ctx.destination);
    R.maestro.gain.exponentialRampToValueAtTime(0.85, ctx.currentTime + 3.2);

    /* sonda de nivel permanente. no es telemetría del visitante: es un
       instrumento de taller, y sin él no hay manera de saber si esto
       suena o si está mudo. */
    R.analizador = ctx.createAnalyser();
    R.analizador.fftSize = 2048;
    R.analizador.smoothingTimeConstant = 0.4;
    R.buf = new Float32Array(R.analizador.fftSize);
    R.espectroBuf = new Float32Array(R.analizador.frequencyBinCount);
    R.tope.connect(R.analizador);

    /* los dos planos */
    R.campo = ctx.createGain(); R.campo.gain.value = 0.42; R.campo.connect(R.maestro);
    R.canto = ctx.createGain(); R.canto.gain.value = 1.0; R.canto.connect(R.maestro);

    R.cuentas = { faust: 0, osciladores: 0, ruidos: 0, nodos: 6 };
    R.encendido = true;
    return R;
  }

  /* una voz entra por su propio canal: ganancia, panorama y plano. la
     espacialización viene de la posición de la pantalla en el campo, no
     de que suene más bonito. */
  function canal(plano, x) {
    const ctx = R.ctx;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = Math.max(-0.85, Math.min(0.85, (x - 0.5) * 1.7));
      g.connect(pan);
      pan.connect(plano === 'campo' ? R.campo : R.canto);
    } else {
      g.connect(plano === 'campo' ? R.campo : R.canto);
    }
    R.cuentas.nodos += pan ? 2 : 1;
    return {
      entrada: g, ganancia: g.gain, pan: pan ? pan.pan : null,
      salida: pan || g,
      dispose: function () {
        try { g.disconnect(); } catch (e) {}
        try { if (pan) pan.disconnect(); } catch (e) {}
        R.cuentas.nodos -= pan ? 2 : 1;
      }
    };
  }

  /* nivel real de salida: RMS y pico en dBFS */
  function nivel() {
    if (!R.encendido || !R.analizador) return null;
    R.analizador.getFloatTimeDomainData(R.buf);
    let s = 0, pico = 0;
    for (let i = 0; i < R.buf.length; i++) {
      s += R.buf[i] * R.buf[i];
      const a = Math.abs(R.buf[i]);
      if (a > pico) pico = a;
    }
    const db = (v) => (v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -Infinity);
    return { rms: db(Math.sqrt(s / R.buf.length)), pico: db(pico) };
  }

  /* el espectro medido de la salida. es lo que permite comprobar que el
     gradiente en pantalla y el espectro sonoro son la misma cosa medida
     dos veces, en vez de dos cosas que se parecen. */
  function espectro() {
    if (!R.encendido || !R.analizador) return null;
    R.analizador.getFloatFrequencyData(R.espectroBuf);
    return { db: Array.prototype.slice.call(R.espectroBuf), sr: R.ctx.sampleRate, fft: R.analizador.fftSize };
  }

  /* energía medida alrededor de una frecuencia, en dB */
  function energiaEn(hz, ancho) {
    const e = espectro();
    if (!e) return -Infinity;
    const paso = e.sr / e.fft;
    const a = Math.max(0, Math.floor((hz - (ancho || hz * 0.12)) / paso));
    const b = Math.min(e.db.length - 1, Math.ceil((hz + (ancho || hz * 0.12)) / paso));
    let m = -Infinity;
    for (let i = a; i <= b; i++) if (e.db[i] > m) m = e.db[i];
    return m;
  }

  function cuentas() {
    return Object.assign({}, R.cuentas, { topes: TOPE });
  }

  /* apagar de verdad: desconecta el grafo y deja el contexto limpio.
     volver a encender reconstruye; no reanuda un fantasma. */
  function apagar() {
    if (!R.encendido) return;
    /* la fuente de ruido compartida la crea `cuerpo.js` y la suelta aquí:
       después de apagar no puede quedar ni un nodo vivo. */
    if (typeof R.ruidoCompartido === 'function') R.ruidoCompartido();
    const ns = [R.campo, R.canto, R.maestro, R.limitador, R.tope, R.analizador];
    for (const n of ns) { try { n.disconnect(); } catch (e) {} }
    R.campo = R.canto = R.maestro = R.limitador = R.tope = R.analizador = null;
    R.buf = R.espectroBuf = null;
    R.cuentas = { faust: 0, osciladores: 0, ruidos: 0, nodos: 0 };
    R.encendido = false;
    R.ctx = null;
  }

  const API = {
    TOPE, arrancar, canal, nivel, espectro, energiaEn, cuentas, apagar,
    get ctx() { return R.ctx; },
    get encendido() { return R.encendido; },
    get maestro() { return R.maestro; },
    get campo() { return R.campo; },
    get canto() { return R.canto; },
    interno: R
  };

  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.red = API;
  if (typeof module === 'object' && module.exports) module.exports = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
