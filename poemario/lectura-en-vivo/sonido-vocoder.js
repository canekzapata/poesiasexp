/* VIDA MEDIA · EN VIVO — sonido-vocoder.js
   El micrófono, el banco de canales y las portadoras: la voz de R-27.

   Un vocoder de canal es caro por definición, pero lo era mucho más de
   lo necesario: un `Tone.Filter` cuesta QUINCE nodos nativos —catorce
   son el cableado de sus parámetros automatizables, que aquí nunca se
   automatizan— contra uno de un BiquadFilter nativo. Con dos filtros
   por banda, el banco se llevaba treinta y seis nodos por canal. Ahora
   son ocho. Mismo tipo de filtro, misma Q, mismo seguidor: suena igual
   y pesa la cuarta parte.

   El ancho del banco además es un parámetro de escenario (`?bandas=`) y
   la Q se deduce del espaciado, de modo que ocho o veinte canales
   cubren el mismo espectro sin agujeros ni chillido.

   El banco además se poda: cuando el cuadro no pide vocoder, las tres
   puertas raíz bajan a cero y el análisis deja de tener trabajo real. */

"use strict";

const VOCODER = (() => {
  let listo = false;
  let mic, micPuerta, micGain, micHP, micComp, micGate;
  let modBus, modVocoderIn;
  let carrierSum, carrierVocoderIn, carriers = [], otraCarriers = [], otraGain, subOsc, subGain;
  let sibilantes = [], sibNoise, sibVocoderIn;
  let bandas = [];
  let vocOut, vocPost, wetGain, dryGain;
  let meter, meterCrudo, meterVocoder, meterSalida, meterGrave, meterAgudo, espectroVoz;
  let salidaMaster = null;
  let suavizado = 0.035;
  let procesando = true;
  let podaTimer = null;
  let telemetriaConectada = false;
  let calibrando = false;
  let wetCuadro = 0;

  const FMIN = 95, FMAX = 7200;
  /* La Q original (5,4 sobre dieciocho bandas) es 1,34 veces más
     estrecha que el solape exacto. Se conserva esa proporción para que
     el timbre no cambie de carácter al mover el número de canales. */
  const ESTRECHEZ = 1.34;

  const ajusteMicro = {
    gain: 1.4,
    gateDb: -52,
    bandas: [],
    sibilantes: [1, 1],
  };

  /* ── fábricas nativas ──
     Ni la frecuencia ni la Q de estos filtros se mueven nunca: se fijan
     al construir el banco y ahí se quedan. Envolverlos en Tone sólo
     compraba catorce nodos de cableado por filtro que nadie usa. */

  function filtro(f, tipo, q) {
    const nodo = AUDIO.contextoCrudo().createBiquadFilter();
    nodo.type = tipo;
    nodo.frequency.value = f;
    nodo.Q.value = q;
    return nodo;
  }

  function ganancia(v) {
    const nodo = AUDIO.contextoCrudo().createGain();
    nodo.gain.value = v;
    return nodo;
  }

  /* ── construcción ── */

  function construir(salidaFinal) {
    if (listo) return Promise.resolve(false);

    meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });
    meterCrudo = new Tone.Meter({ normalRange: true, smoothing: 0.76 });
    meterVocoder = new Tone.Meter({ normalRange: true, smoothing: 0.72 });
    meterSalida = new Tone.Meter({ normalRange: true, smoothing: 0.82 });
    meterGrave = new Tone.Meter({ normalRange: true, smoothing: 0.85 });
    meterAgudo = new Tone.Meter({ normalRange: true, smoothing: 0.7 });
    /* El medidor de salida sólo escucha durante la calibración: fuera de
       ella sería un analizador más colgado del master sin lector. */
    salidaMaster = salidaFinal;

    /* ── el micro (modulador) ── */
    modBus = new Tone.Gain(1);
    modBus.connect(meter);
    /* Puerta raíz de topología fija: encender el vocoder ya no obliga al
       navegador a reconstruir decenas de conexiones en plena escena. */
    modVocoderIn = new Tone.Gain(1);
    modBus.connect(modVocoderIn);
    /* Un solo espectro sirve a todas las bandas de calibración. Antes
       había veinte analizadores independientes trabajando siempre. */
    espectroVoz = new Tone.FFT({ size: 1024, smoothing: 0.74, normalRange: true });
    const tapGrave = filtro(320, "lowpass", 1);
    modBus.connect(tapGrave);
    Tone.connect(tapGrave, meterGrave);
    const tapAgudo = filtro(2800, "highpass", 1);
    modBus.connect(tapAgudo);
    Tone.connect(tapAgudo, meterAgudo);
    micGain = new Tone.Gain(ajusteMicro.gain);
    micHP = filtro(82, "highpass", 0.72);
    micComp = new Tone.Compressor({
      threshold: -20, ratio: 3, attack: 0.012, release: 0.14, knee: 14,
    });
    /* No es una puerta dura: smoothing largo para que el final de una
       palabra no desaparezca cuando cae debajo del ruido de sala. */
    micGate = new Tone.Gate({ threshold: ajusteMicro.gateDb, smoothing: 0.11 });
    micGain.connect(micHP);
    Tone.connect(micHP, micComp);
    micComp.connect(micGate);
    micGate.connect(modBus);
    /* La puerta del micro va antes de la ganancia de calibración, para
       que cerrarla no discuta con lo que el prevuelo haya medido. Cierra
       el micrófono y sólo el micrófono: R-27 entra al vocoder por otro
       lado y sigue hablando con la boca tapada. */
    micPuerta = new Tone.Gain(ESTADO.micAbierto ? 1 : 0);
    micPuerta.connect(micGain);
    mic = new Tone.UserMedia();
    /* El permiso del micro se pide ya, pero el resto del grafo se
       construye mientras el dispositivo responde. */
    const microPromesa = mic.open().then(() => {
      mic.connect(micPuerta);
      ESTADO.micOK = true;
      return true;
    }).catch((e) => {
      ESTADO.micOK = false;
      console.warn("micro: sin señal —la consola sigue", e);
      return false;
    });

    /* ── portadoras ── */
    carrierSum = new Tone.Gain(0.45);
    carrierVocoderIn = new Tone.Gain(1);
    carrierSum.connect(carrierVocoderIn);
    for (let i = 0; i < 3; i++) {
      const o = new Tone.Oscillator({ type: "sawtooth", frequency: 110 });
      o.detune.value = (i - 1) * 8;      // gordura ochentera
      o.start();
      o.connect(carrierSum);
      carriers.push(o);
    }
    /* LA OTRA: la portadora vieja, más grave, con deriva */
    otraGain = new Tone.Gain(0);
    for (let i = 0; i < 2; i++) {
      const o = new Tone.Oscillator({ type: "sawtooth", frequency: 55 });
      o.start();
      o.connect(otraGain);
      const lfo = new Tone.LFO({ frequency: 0.07 + i * 0.05, min: -45, max: 25 });
      lfo.connect(o.detune);
      lfo.start();
      otraCarriers.push(o);
    }
    otraGain.connect(carrierSum);
    /* PARIDAD: la sub-octava (la voz y su sombra) */
    subOsc = new Tone.Oscillator({ type: "square", frequency: 55 });
    subOsc.start();
    subGain = new Tone.Gain(0);
    subOsc.connect(subGain);
    subGain.connect(carrierSum);

    /* ── el banco de canales ── */
    vocOut = new Tone.Gain(1);
    const NB = AUDIO.opciones.bandas;
    const pasoBanda = Math.pow(FMAX / FMIN, 1 / (NB - 1));
    const bordeBanda = Math.sqrt(pasoBanda);
    const Q = ESTRECHEZ / (bordeBanda - 1 / bordeBanda);
    /* Menos canales reparten la misma voz: cada uno debe dejar salir un
       poco más para que el conjunto conserve el cuerpo de dieciocho. */
    const compensa = Math.sqrt(18 / NB);
    for (let i = 0; i < NB; i++) {
      const f = FMIN * Math.pow(FMAX / FMIN, i / (NB - 1));
      const anal = filtro(f, "bandpass", Q);
      modVocoderIn.connect(anal);
      const foll = new Tone.Follower(0.035);
      Tone.connect(anal, foll);
      /* Las bandas graves traen mucha energía y poca articulación.
         La presencia recibe una compensación moderada, no un agudo chillón. */
      const baseBoost = (f < 180 ? 6.8 : f < 700 ? 8.2 : f < 3200 ? 9.6 : f < 5200 ? 11 : 12.4) * compensa;
      const boost = ganancia(baseBoost);
      foll.connect(boost);
      const bFilt = filtro(f, "bandpass", Q);
      carrierVocoderIn.connect(bFilt);
      const bGain = ganancia(0);
      bFilt.connect(bGain);
      boost.connect(bGain.gain);
      Tone.connect(bGain, vocOut);
      bandas.push({
        f, anal, foll, boost, bFilt, baseBoost,
        medicionBaja: f / bordeBanda,
        medicionAlta: f * bordeBanda,
      });
    }
    /* Dos familias de consonantes: fricción media para f/j/ch y aire
       alto para s/z. Sin ellas el vocoder conserva tono pero no poema. */
    sibNoise = new Tone.Noise("white").start();
    sibVocoderIn = new Tone.Gain(1);
    sibNoise.connect(sibVocoderIn);
    [
      { f: 3600, type: "bandpass", Q: 1.15, noiseF: 3900, noiseType: "bandpass", boost: 5.4,
        medicionBaja: 2500, medicionAlta: 4800 },
      { f: 5700, type: "highpass", Q: 0.7, noiseF: 5200, noiseType: "highpass", boost: 7.2,
        medicionBaja: 5000, medicionAlta: 7800 },
    ].forEach((spec) => {
      const anal = filtro(spec.f, spec.type, spec.Q);
      modVocoderIn.connect(anal);
      const foll = new Tone.Follower(0.018);
      Tone.connect(anal, foll);
      const boost = ganancia(spec.boost);
      foll.connect(boost);
      const filtroRuido = filtro(spec.noiseF, spec.noiseType, spec.Q);
      sibVocoderIn.connect(filtroRuido);
      const gain = ganancia(0);
      filtroRuido.connect(gain);
      boost.connect(gain.gain);
      Tone.connect(gain, vocOut);
      sibilantes.push({ ...spec, anal, foll, boost, filtroRuido, baseBoost: spec.boost });
    });

    wetGain = new Tone.Gain(0);
    vocPost = new Tone.Compressor({
      threshold: -15, ratio: 2.2, attack: 0.008, release: 0.1, knee: 10,
    });
    vocOut.connect(vocPost);
    vocPost.connect(wetGain);

    /* el micro seco: existe, pero apagado (regla de escenario) */
    dryGain = new Tone.Gain(0);
    micGain.connect(dryGain);

    listo = true;
    return microPromesa;
  }

  /* La voz procesada y la seca entran juntas a la cadena de efectos. */
  function conectarSalida(destino) {
    wetGain.connect(destino);
    dryGain.connect(destino);
  }

  function entradaModulador() { return modBus; }

  /* ── poda: apagar el banco cuando el cuadro no lo usa ── */

  function necesitaProceso() {
    if (!listo || ESTADO.panico) return false;
    if (calibrando) return true;
    return ESTADO.capas.vocoder && wetCuadro > 0;
  }

  function abrePuertas(valor, rampa) {
    const t = AUDIO.ahora();
    for (const entrada of [modVocoderIn, carrierVocoderIn, sibVocoderIn]) {
      AUDIO.cancelaParametro(entrada.gain, t, true);
      entrada.gain.linearRampToValueAtTime(valor, t + rampa);
    }
  }

  function actualizaProceso(demora) {
    if (!listo) return;
    clearTimeout(podaTimer);
    podaTimer = null;
    if (necesitaProceso()) {
      if (!procesando) { abrePuertas(1, 0.025); procesando = true; }
      return;
    }
    podaTimer = setTimeout(() => {
      podaTimer = null;
      if (!necesitaProceso() && procesando) { abrePuertas(0, 0.035); procesando = false; }
    }, Math.max(0, (demora || 0) * 1000));
  }

  /* ── el cuadro ── */

  function acorde(notas) {
    if (!listo) return;
    const base = AUDIO.frecuencia(notas[0]);
    const ultima = AUDIO.frecuencia(notas[notas.length - 1]);
    for (let i = 0; i < carriers.length; i++) {
      const destino = i < notas.length ? AUDIO.frecuencia(notas[i]) : ultima;
      carriers[i].frequency.rampTo(destino, 0.2);
    }
    otraCarriers.forEach((o, i) => {
      o.frequency.rampTo(base / 2 * (i ? 1.5 : 1), 0.4);
    });
    subOsc.frequency.rampTo(base / 2, 0.2);
  }

  function ajusta(m) {
    if (!listo) return;
    wetCuadro = m.wet || 0;
    const objetivo = calibrando ? 0.74 : (ESTADO.capas.vocoder ? wetCuadro : 0);
    wetGain.gain.rampTo(objetivo, 0.4);
    actualizaProceso(0.45);
    subGain.gain.rampTo(m.sub ? 0.5 : 0, 0.4);
    otraGain.gain.rampTo(m.otra ? 0.6 : 0, 0.6);
    const nuevo = m.colaLarga ? 0.5 : 0.035;
    if (nuevo !== suavizado) {
      for (const b of bandas) b.foll.smoothing = nuevo;
      suavizado = nuevo;
    }
  }

  /* el vocoder en vivo: zxcvbnm = grados de la escala del cuadro */
  function notaEnVivo(esc, grado) {
    if (!listo) return;
    const raiz = AUDIO.frecuencia(esc[grado % 7]);
    const t = AUDIO.ahora();
    const objetivos = [raiz, raiz * 1.5, raiz * 2];
    for (let i = 0; i < objetivos.length; i++) {
      if (!carriers[i]) continue;
      AUDIO.cancelaParametro(carriers[i].frequency, t, true);
      carriers[i].frequency.linearRampToValueAtTime(objetivos[i], t + 0.045);
    }
  }

  function alternar() {
    ESTADO.capas.vocoder = !ESTADO.capas.vocoder;
    if (listo) {
      AUDIO.asegurarContexto();
      actualizaProceso(0.22);
      const t = AUDIO.ahora();
      AUDIO.cancelaParametro(wetGain.gain, t, true);
      wetGain.gain.linearRampToValueAtTime(ESTADO.capas.vocoder ? wetCuadro : 0, t + 0.12);
    }
    return ESTADO.capas.vocoder;
  }

  /* Q: el micro se cierra en veinticinco milisegundos. Es la tecla del
     acople, de la tos y de hablarle a la técnica sin que la sala oiga. */
  function alternarMicro() {
    ESTADO.micAbierto = !ESTADO.micAbierto;
    if (listo) {
      AUDIO.asegurarContexto();
      micPuerta.gain.rampTo(ESTADO.micAbierto ? 1 : 0, 0.025);
    }
    return ESTADO.micAbierto;
  }

  function alternarDry() {
    ESTADO.capas.dry = !ESTADO.capas.dry;
    if (listo) {
      AUDIO.asegurarContexto();
      dryGain.gain.rampTo(ESTADO.capas.dry ? 0.5 : 0, 0.2);
    }
    return ESTADO.capas.dry;
  }

  /* ── sensores (nivel, grave, agudo del modulador) ── */

  function sensores(destino) {
    destino.nivel = listo ? Math.min(1, AUDIO.amplitudMeter(meter) * 3) : 0;
    destino.grave = listo ? Math.min(1, AUDIO.amplitudMeter(meterGrave) * 4) : 0;
    destino.agudo = listo ? Math.min(1, AUDIO.amplitudMeter(meterAgudo) * 5) : 0;
  }

  /* ── calibración ── */

  function conectaTelemetria() {
    if (telemetriaConectada) return;
    micComp.connect(meterCrudo);
    modBus.connect(espectroVoz);
    vocPost.connect(meterVocoder);
    if (salidaMaster) salidaMaster.connect(meterSalida);
    telemetriaConectada = true;
  }

  function desconectaTelemetria() {
    if (!telemetriaConectada) return;
    try { micComp.disconnect(meterCrudo); } catch (e) { /* ya estaba fuera */ }
    try { modBus.disconnect(espectroVoz); } catch (e) { /* ya estaba fuera */ }
    try { vocPost.disconnect(meterVocoder); } catch (e) { /* ya estaba fuera */ }
    try { if (salidaMaster) salidaMaster.disconnect(meterSalida); } catch (e) { /* ya estaba fuera */ }
    telemetriaConectada = false;
  }

  function telemetria(extra) {
    const ac = AUDIO.contextoCrudo();
    let espectro = [];
    try { espectro = espectroVoz ? espectroVoz.getValue() : []; } catch (e) { /* sin espectro */ }
    const sampleRate = ac && ac.sampleRate ? ac.sampleRate : 48000;
    const crudo = AUDIO.amplitudMeter(meterCrudo);
    const entrada = AUDIO.amplitudMeter(meter);
    const vocoder = AUDIO.amplitudMeter(meterVocoder);
    const salida = AUDIO.amplitudMeter(meterSalida);
    const mide = (b) => {
      const n = AUDIO.nivelEspectral(espectro, b.medicionBaja, b.medicionAlta, sampleRate);
      return { f: Math.round(b.f), nivel: n, db: AUDIO.aDb(n) };
    };
    return {
      crudo, entrada, vocoder, salida,
      crudoDb: AUDIO.aDb(crudo),
      entradaDb: AUDIO.aDb(entrada),
      vocoderDb: AUDIO.aDb(vocoder),
      salidaDb: AUDIO.aDb(salida),
      bandas: bandas.map(mide),
      sibilantes: sibilantes.map(mide),
      clip: crudo > 0.94 || salida > 0.94,
      micOK: ESTADO.micOK,
      granularOK: !!(extra && extra.granularOK),
      sampleRate: ac && ac.sampleRate ? ac.sampleRate : null,
      baseLatency: ac && Number.isFinite(ac.baseLatency) ? ac.baseLatency : null,
      outputLatency: ac && Number.isFinite(ac.outputLatency) ? ac.outputLatency : null,
      ajuste: {
        gain: ajusteMicro.gain,
        gateDb: ajusteMicro.gateDb,
        bandas: ajusteMicro.bandas.slice(),
        sibilantes: ajusteMicro.sibilantes.slice(),
      },
    };
  }

  function aplicarCalibracion(a) {
    if (!listo || !a) return null;
    const limita = (v, min, max, defecto) =>
      Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : defecto;
    ajusteMicro.gain = limita(a.gain, 0.55, 4.2, ajusteMicro.gain);
    ajusteMicro.gateDb = limita(a.gateDb, -68, -26, ajusteMicro.gateDb);
    ajusteMicro.bandas = bandas.map((_, i) => limita(a.bandas && a.bandas[i], 0.62, 1.58, 1));
    ajusteMicro.sibilantes = sibilantes.map((_, i) => limita(a.sibilantes && a.sibilantes[i], 0.72, 1.75, 1));

    micGain.gain.rampTo(ajusteMicro.gain, 0.35);
    micGate.threshold = ajusteMicro.gateDb;
    bandas.forEach((b, i) => AUDIO.rampa(b.boost.gain, b.baseBoost * ajusteMicro.bandas[i], 0.45));
    sibilantes.forEach((b, i) => AUDIO.rampa(b.boost.gain, b.baseBoost * ajusteMicro.sibilantes[i], 0.35));
    return telemetria().ajuste;
  }

  function modoCalibracion(activo) {
    if (!listo) return;
    calibrando = activo;
    if (activo) {
      conectaTelemetria();
      actualizaProceso(0);
      micGate.threshold = -70;
      wetGain.gain.rampTo(0.74, 0.25);
    } else {
      micGate.threshold = ajusteMicro.gateDb;
      wetGain.gain.rampTo(ESTADO.capas.vocoder ? wetCuadro : 0, 0.3);
      actualizaProceso(0.35);
      desconectaTelemetria();
    }
  }

  return {
    construir, conectarSalida, entradaModulador,
    acorde, ajusta, notaEnVivo, alternar, alternarDry, alternarMicro,
    actualizaProceso, sensores,
    telemetria, aplicarCalibracion, modoCalibracion,
    get listo() { return listo; },
    get numeroBandas() { return bandas.length; },
  };
})();
