/* VIDA MEDIA · EN VIVO — sonido.js · vuelta 8
   todo el audio: la música chip generativa, el vocoder de canal
   (la voz de R-27), la voz de formantes que lee sola, CORO
   (speechSynthesis, la voz de tierra), el granulador circular,
   la mezcla y el limiter.
   reglas: el micro seco jamás por defecto; limiter -3 dB siempre;
   sin micro, todo lo demás sigue. */

"use strict";

const SONIDO = (() => {
  let listo = false;
  let master, limiter, musicaBus, vozBus, vozProtector, meterCrudo, meter, meterVocoder, meterSalida, espectroVoz;
  let mic, micGain, micHP, micComp, micGate, modBus, modVocoderIn, dryGain;
  let bandas = [];
  let carrierSum, carrierVocoderIn, carriers = [], otraCarriers = [], otraGain, subOsc, subGain;
  let sibilantes = [], sibNoise, sibVocoderIn;
  let vocOut, vocPost, wetGain;
  let fxIn, directo, panner, ecoSend, eco, ecoReturn, verbSend, verb, verbReturn;
  let granoSend, granulador, granoPitch, grano, granoMemoriaGain;
  let granularOK = false;
  let granularFallbackConectado = false;
  let granularFallbackFallido = false;
  let granularFallbackTimer = null;
  const ajusteMicro = {
    gain: 1.4,
    gateDb: -52,
    bandas: [],
    sibilantes: [1, 1],
  };
  let oscuraFoll, oscuraScale;
  let bpmBase = 100;
  let cuadroActual = null;
  let suavizadoVocoder = 0.035;
  let vocoderProcesando = true;
  let vocoderFuentesConectadas = true;
  let vocoderDesconexionTimer = null;
  let vocoderPodaTimer = null;
  let telemetriaCalibracionConectada = false;
  let calibracionAudio = false;
  let redTimer = null, corridoLFO = null;
  let granularRáfagaTimer = null, granularFreezeTimer = null;

  /* instrumentos */
  let kick, snare, hat, bajo, lead, lead2, campana, clic;
  let droneOscs = [], droneFilter, droneGain;
  let leadPan, leadEcho, leadEchoSend;
  let partes = [];
  let esaNotaFija = "A4";
  let arp, arpPan, pad, padChorus, crusher, musFilter, duck;
  let meterGrave, meterAgudo;
  let motivoGuardado = null;   // el riff de TIEMPO CONTINUO vuelve roto en ACUSE
  let ultimoKick = 0;

  /* R-27, la voz de formantes. La lectura usa una cola corta para no
     llenar de golpe la línea de tiempo de WebAudio. */
  const r27 = { t: 0, timer: null, caracteres: "", indice: 0, cursor: 0, freza: 1 };
  const R27_HORIZONTE = 1.15;
  const R27_INTERVALO = 180;

  const SENSORES_CERO = Object.freeze({ nivel: 0, grave: 0, agudo: 0, beat: 0 });
  const sensoresCache = { nivel: 0, grave: 0, agudo: 0, beat: 0 };
  let sensoresLeidosEn = -Infinity;
  const SENSOR_INTERVALO = 32;
  const cacheNotas = new Map();
  const cacheFrecuencias = new Map();

  const FORMANTES = { a: [700, 1200], e: [450, 1900], i: [300, 2300], o: [450, 800], u: [325, 700] };
  const CONSONANTES = {
    tono: { m: 250, n: 300, ñ: 350, l: 400, b: 300, d: 350, g: 400, v: 300, r: 380, y: 300, w: 325 },
    ruido: { s: 6000, z: 5500, f: 4500, j: 2500, x: 5000, c: 4800, h: 0 },
    clic: ["p", "t", "k", "q"],
  };

  function hashAudio(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function contextoTone() {
    return typeof Tone.getContext === "function" ? Tone.getContext() : Tone.context;
  }

  function contextoCrudo() {
    const c = contextoTone();
    return c && (c.rawContext || c._context || c);
  }

  function asegurarContexto() {
    const ac = contextoCrudo();
    if (!ac || ac.state === "running" || typeof ac.resume !== "function") return;
    const reanudado = ac.resume();
    if (reanudado && typeof reanudado.catch === "function") {
      reanudado.catch((e) => console.warn("audio: no se pudo reanudar el contexto", e));
    }
  }

  function valorGranular(nombre, valor, rampa) {
    if (!granulador || !granulador.parameters) return;
    const p = granulador.parameters.get(nombre);
    if (!p) return;
    const ahora = contextoCrudo().currentTime;
    p.cancelScheduledValues(ahora);
    p.setValueAtTime(p.value, ahora);
    p.linearRampToValueAtTime(valor, ahora + (rampa || 0.04));
  }

  async function iniciarGranulador(entrada, salida) {
    const tc = contextoTone();
    const ac = contextoCrudo();
    if (!ac || !ac.audioWorklet || typeof AudioWorkletNode === "undefined") return false;
    try {
      /* Tone 14 envuelve el AudioContext con standardized-audio-context.
         El constructor global rechaza ese wrapper aunque exponga audioWorklet.
         Las fábricas de Tone conocen el contexto nativo y además deduplican
         módulos por nombre dentro de la misma función. */
      if (tc && typeof tc.addAudioWorkletModule === "function") {
        await tc.addAudioWorkletModule("granular-worklet.js", "r27-granular");
      } else {
        await ac.audioWorklet.addModule("granular-worklet.js");
      }
      const opciones = {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        processorOptions: { seconds: 8 },
      };
      granulador = tc && typeof tc.createAudioWorkletNode === "function"
        ? tc.createAudioWorkletNode("r27-granular", opciones)
        : new AudioWorkletNode(ac, "r27-granular", opciones);
      entrada.connect(granulador);
      granulador.connect(salida.input || salida);
      granulador.port.postMessage({ type: "seed", value: hashAudio(ESTADO.seed + ":granos") });
      valorGranular("density", 0);
      valorGranular("grainSize", 0.22);
      valorGranular("delay", 3.6);
      valorGranular("jitter", 1.4);
      valorGranular("pitch", -5);
      valorGranular("spread", 0.9);
      valorGranular("feedback", 0.16);
      valorGranular("freeze", 0);
      return true;
    } catch (e) {
      granulador = null;
      console.warn("granular: AudioWorklet no arrancó; se conserva la demora de emergencia", e);
      return false;
    }
  }

  function preparaMemoriaFallbackGranular() {
    if (granularOK || granularFallbackFallido || grano) return;
    try {
      /* El delay nativo es liviano y escucha desde el prevuelo. El
         pitch-shift pesado sólo se conecta al entrar al cuadro. */
      grano = new Tone.FeedbackDelay({ delayTime: 4, feedback: 0.45, maxDelay: 8 });
      fxIn.connect(grano);
      /* Una salida inaudible impide que el navegador pode la rama y
         garantiza que el delay sí conserve memoria previa. */
      granoMemoriaGain = new Tone.Gain(0.00000001).connect(vozBus);
      grano.connect(granoMemoriaGain);
    } catch (e) {
      try { if (grano) grano.dispose(); } catch (ignorado) { /* nada */ }
      try { if (granoMemoriaGain) granoMemoriaGain.dispose(); } catch (ignorado) { /* nada */ }
      grano = null;
      granoMemoriaGain = null;
      granularFallbackFallido = true;
      console.warn("granular: la memoria de emergencia tampoco arrancó", e);
    }
  }

  function conectaFallbackGranular(encendido) {
    if (granularOK || granularFallbackFallido) return;
    preparaMemoriaFallbackGranular();
    if (!grano || granularFallbackFallido) return;
    clearTimeout(granularFallbackTimer);
    granularFallbackTimer = null;
    if (encendido && !granoPitch) {
      try {
        granoPitch = new Tone.PitchShift(-5);
      } catch (e) {
        try { if (granoPitch) granoPitch.dispose(); } catch (ignorado) { /* nada */ }
        granoPitch = null;
        granularFallbackFallido = true;
        console.warn("granular: el pitch de emergencia tampoco arrancó", e);
        return;
      }
    }
    if (encendido && !granularFallbackConectado) {
      granoPitch.connect(granoSend);
      grano.connect(granoPitch);
      granularFallbackConectado = true;
    } else if (!encendido && granularFallbackConectado) {
      /* Deja terminar la rampa de salida antes de podar el pitch. Si el
         cuadro vuelve enseguida, el temporizador se cancela y no hay corte. */
      granularFallbackTimer = setTimeout(() => {
        try { grano.disconnect(granoPitch); } catch (e) { /* ya estaba fuera */ }
        try { granoPitch.disconnect(granoSend); } catch (e) { /* ya estaba fuera */ }
        granularFallbackConectado = false;
        granularFallbackTimer = null;
      }, 220);
    }
  }

  function configuraGranular(encendido) {
    conectaFallbackGranular(encendido);
    granoSend.gain.rampTo(encendido ? 0.78 : 0, encendido ? 0.65 : 0.18);
    if (!granularOK) return;
    valorGranular("freeze", 0, 0.04);
    valorGranular("density", encendido ? 12 : 0, encendido ? 1.4 : 0.12);
    valorGranular("grainSize", encendido ? 0.24 : 0.18, 1.2);
    valorGranular("delay", encendido ? 3.6 : 2.4, 1.2);
    valorGranular("jitter", encendido ? 1.55 : 0.4, 1.2);
    valorGranular("pitch", encendido ? -5 : 0, 1.4);
    valorGranular("spread", encendido ? 0.92 : 0.35, 1);
    valorGranular("feedback", encendido ? 0.18 : 0.05, 1.2);
  }

  /* Cada dispersión tipográfica congela un instante de la memoria y
     lo abre en muchos granos. El texto no ilustra el audio: lo dispara. */
  function soltarGranos() {
    if (!listo || !cuadroActual || cuadroActual.micro.fx !== "granos" || ESTADO.panico) return;
    clearTimeout(granularRáfagaTimer);
    clearTimeout(granularFreezeTimer);
    granoSend.gain.rampTo(0.96, 0.06);
    if (granularOK) {
      valorGranular("freeze", 1, 0.025);
      valorGranular("density", 24, 0.06);
      valorGranular("grainSize", 0.085, 0.08);
      valorGranular("delay", 1.8, 0.08);
      valorGranular("jitter", 2.35, 0.08);
      valorGranular("pitch", -7, 0.12);
      valorGranular("spread", 1, 0.08);
      valorGranular("feedback", 0.27, 0.1);
      granularFreezeTimer = setTimeout(() => valorGranular("freeze", 0, 0.05), 260);
    }
    granularRáfagaTimer = setTimeout(() => {
      if (cuadroActual && cuadroActual.micro.fx === "granos" && !ESTADO.panico) configuraGranular(true);
    }, 1450);
  }

  async function iniciar() {
    if (listo) return true;
    try { await Tone.start(); } catch (e) { console.warn("audio: sin contexto", e); return false; }

    /* ── mezcla ── */
    master = new Tone.Gain(0.9);
    limiter = new Tone.Limiter(-3);
    master.connect(limiter);
    limiter.toDestination();
    musicaBus = new Tone.Gain(0.8);
    duck = new Tone.Gain(1);
    musFilter = new Tone.Filter({ frequency: 9000, type: "lowpass", Q: 0.5 });
    musicaBus.connect(duck);
    duck.connect(musFilter);
    musFilter.connect(master);
    /* La voz tiene su propio margen antes del limiter general. Así un pico
       del vocoder o de T no comprime también toda la música de fondo. */
    vozBus = new Tone.Gain(0.58);
    vozProtector = new Tone.Compressor({
      threshold: -12, ratio: 5.5, attack: 0.003, release: 0.09, knee: 6,
    });
    vozBus.connect(vozProtector);
    vozProtector.connect(master);
    meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });
    meterCrudo = new Tone.Meter({ normalRange: true, smoothing: 0.76 });
    meterVocoder = new Tone.Meter({ normalRange: true, smoothing: 0.72 });
    meterSalida = new Tone.Meter({ normalRange: true, smoothing: 0.82 });
    meterGrave = new Tone.Meter({ normalRange: true, smoothing: 0.85 });
    meterAgudo = new Tone.Meter({ normalRange: true, smoothing: 0.7 });

    /* ── el micro (modulador) ── */
    modBus = new Tone.Gain(1);
    modBus.connect(meter);
    /* Puerta raíz de topología fija: encender el vocoder ya no obliga al
       navegador a reconstruir decenas de conexiones en plena escena. */
    modVocoderIn = new Tone.Gain(1);
    modBus.connect(modVocoderIn);
    /* Un solo espectro sirve a las 18 bandas de calibración. Antes había
       veinte analizadores independientes trabajando todo el tiempo. */
    espectroVoz = new Tone.FFT({ size: 1024, smoothing: 0.74, normalRange: true });
    const tapGrave = new Tone.Filter({ frequency: 320, type: "lowpass" });
    modBus.connect(tapGrave);
    tapGrave.connect(meterGrave);
    const tapAgudo = new Tone.Filter({ frequency: 2800, type: "highpass" });
    modBus.connect(tapAgudo);
    tapAgudo.connect(meterAgudo);
    micGain = new Tone.Gain(ajusteMicro.gain);
    micHP = new Tone.Filter({ frequency: 82, type: "highpass", Q: 0.72 });
    micComp = new Tone.Compressor({
      threshold: -20, ratio: 3, attack: 0.012, release: 0.14, knee: 14,
    });
    /* No es una puerta dura: smoothing largo para que el final de una
       palabra no desaparezca cuando cae debajo del ruido de sala. */
    micGate = new Tone.Gate({ threshold: ajusteMicro.gateDb, smoothing: 0.11 });
    micGain.connect(micHP);
    micHP.connect(micComp);
    micComp.connect(micGate);
    micGate.connect(modBus);
    mic = new Tone.UserMedia();
    /* El permiso del micro se pide ya, pero el resto del grafo se construye
       mientras el dispositivo responde. Antes ambas esperas eran seriales. */
    const microPromesa = mic.open().then(() => {
      mic.connect(micGain);
      ESTADO.micOK = true;
      return true;
    }).catch((e) => {
      ESTADO.micOK = false;
      console.warn("micro: sin señal —la consola sigue", e);
      return false;
    });

    /* ── vocoder de canal ── */
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

    vocOut = new Tone.Gain(1);
    const NB = 18, fmin = 95, fmax = 7200;
    const pasoBanda = Math.pow(fmax / fmin, 1 / (NB - 1));
    const bordeBanda = Math.sqrt(pasoBanda);
    for (let i = 0; i < NB; i++) {
      const f = fmin * Math.pow(fmax / fmin, i / (NB - 1));
      const anal = new Tone.Filter({ frequency: f, type: "bandpass", Q: 5.4 });
      modVocoderIn.connect(anal);
      const foll = new Tone.Follower(0.035);
      anal.connect(foll);
      /* Las bandas graves traen mucha energía y poca articulación.
         La presencia recibe una compensación moderada, no un agudo chillón. */
      const baseBoost = f < 180 ? 6.8 : f < 700 ? 8.2 : f < 3200 ? 9.6 : f < 5200 ? 11 : 12.4;
      const boost = new Tone.Gain(baseBoost);
      foll.connect(boost);
      const bFilt = new Tone.Filter({ frequency: f, type: "bandpass", Q: 5.4 });
      carrierVocoderIn.connect(bFilt);
      const bGain = new Tone.Gain(0);
      bFilt.connect(bGain);
      boost.connect(bGain.gain);
      bGain.connect(vocOut);
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
      const anal = new Tone.Filter({ frequency: spec.f, type: spec.type, Q: spec.Q });
      modVocoderIn.connect(anal);
      const foll = new Tone.Follower(0.018);
      anal.connect(foll);
      const boost = new Tone.Gain(spec.boost);
      foll.connect(boost);
      const filtroRuido = new Tone.Filter({
        frequency: spec.noiseF, type: spec.noiseType, Q: spec.Q,
      });
      sibVocoderIn.connect(filtroRuido);
      const gain = new Tone.Gain(0);
      filtroRuido.connect(gain);
      boost.connect(gain.gain);
      gain.connect(vocOut);
      sibilantes.push({
        ...spec, anal, foll, boost, filtroRuido, baseBoost: spec.boost,
      });
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

    /* ── la cadena de efectos de voz ── */
    fxIn = new Tone.Gain(1);
    wetGain.connect(fxIn);
    dryGain.connect(fxIn);
    panner = new Tone.Panner(0);
    directo = new Tone.Gain(1);
    fxIn.connect(directo);
    directo.connect(panner);
    panner.connect(vozBus);
    /* RELOJ DE ECOS */
    eco = new Tone.FeedbackDelay({ delayTime: 0.9, feedback: 0.55 });
    ecoSend = new Tone.Gain(0);
    fxIn.connect(ecoSend);
    ecoSend.connect(eco);
    ecoReturn = new Tone.Gain(0);
    eco.connect(ecoReturn);
    ecoReturn.connect(vozBus);
    /* LA REGIÓN */
    /* Freeverb en Tone 14.7.40 crea varios worklets con el mismo nombre
       (feedback-comb-filter) y Chrome puede rechazar el segundo registro.
       Reverb usa convolución y conserva la región larga sin ese procesador. */
    verb = new Tone.Reverb({ decay: 6.8, preDelay: 0.035, wet: 1 });
    if (verb.ready && typeof verb.ready.catch === "function") {
      verb.ready.catch((e) => console.warn("región: la cola de convolución no arrancó", e));
    }
    verbSend = new Tone.Gain(0);
    fxIn.connect(verbSend);
    verbSend.connect(verb);
    verbReturn = new Tone.Gain(0);
    verb.connect(verbReturn);
    verbReturn.connect(vozBus);
    /* ESCRIBIR FUERA DE SÍ: ocho segundos de memoria circular.
       El worklet graba siempre, pero sólo deja salir granos en el cuadro.
       Si AudioWorklet no existe, queda la demora anterior como auxilio. */
    granoSend = new Tone.Gain(0);
    granoSend.connect(vozBus);
    const granularPromesa = iniciarGranulador(fxIn, granoSend);
    /* MATERIA OSCURA: la voz no suena; dobla el drone */
    oscuraFoll = new Tone.Follower(0.05);
    modBus.connect(oscuraFoll);
    oscuraScale = new Tone.Gain(0);
    oscuraFoll.connect(oscuraScale);

    /* ── instrumentos ── */
    kick = new Tone.MembraneSynth({ octaves: 6, pitchDecay: 0.045, volume: -6 }).connect(musicaBus);
    snare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.11, sustain: 0 }, volume: -14 }).connect(musicaBus);
    const hatHP = new Tone.Filter({ frequency: 8000, type: "highpass" }).connect(musicaBus);
    hat = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -20 }).connect(hatHP);
    bajo = new Tone.MonoSynth({
      oscillator: { type: "square" },
      filter: { type: "lowpass", Q: 2 },
      filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.4, baseFrequency: 180, octaves: 2.2 },
      envelope: { attack: 0.004, decay: 0.18, sustain: 0.5, release: 0.1 },
      volume: -10,
    }).connect(musicaBus);
    leadPan = new Tone.Panner(0).connect(musicaBus);
    leadEcho = new Tone.PingPongDelay({ delayTime: "8n.", feedback: 0.45, wet: 1 });
    leadEchoSend = new Tone.Gain(0).connect(leadEcho);
    leadEcho.connect(musicaBus);
    lead = new Tone.MonoSynth({
      oscillator: { type: "pulse", width: 0.25 },
      envelope: { attack: 0.003, decay: 0.14, sustain: 0.2, release: 0.08 },
      filterEnvelope: { attack: 0.002, decay: 0.1, sustain: 0.5, baseFrequency: 500, octaves: 3 },
      volume: -12,
    });
    lead.connect(leadPan);
    lead.connect(leadEchoSend);
    lead2 = new Tone.MonoSynth({
      oscillator: { type: "pulse", width: 0.4 },
      envelope: { attack: 0.005, decay: 0.16, sustain: 0.2, release: 0.1 },
      filterEnvelope: { attack: 0.002, decay: 0.12, sustain: 0.4, baseFrequency: 380, octaves: 2.4 },
      volume: -16,
    }).connect(musicaBus);
    campana = new Tone.FMSynth({
      harmonicity: 5.07, modulationIndex: 8,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.3 },
      volume: -16,
    }).connect(musicaBus);
    clic = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.012, sustain: 0 }, volume: -30 }).connect(musicaBus);
    /* el arpegiador: cuadrada delgada por un bitcrusher (el chip) */
    crusher = new Tone.BitCrusher(6);
    crusher.wet.value = 0.3;
    arpPan = new Tone.Panner(0).connect(musicaBus);
    arp = new Tone.MonoSynth({
      oscillator: { type: "square" },
      envelope: { attack: 0.002, decay: 0.09, sustain: 0.1, release: 0.05 },
      filterEnvelope: { attack: 0.001, decay: 0.06, sustain: 0.3, baseFrequency: 900, octaves: 2.5 },
      volume: -17,
    });
    arp.connect(crusher);
    crusher.connect(arpPan);
    /* el pad: sierras gordas con chorus, la atmósfera del cuadro */
    padChorus = new Tone.Chorus(2.2, 3.5, 0.45).start();
    padChorus.connect(musicaBus);
    pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
      envelope: { attack: 0.9, decay: 0.4, sustain: 0.6, release: 1.8 },
      volume: -21,
    });
    pad.connect(padChorus);
    /* el drone: firmado por semilla en su latido */
    droneFilter = new Tone.Filter({ frequency: 260, type: "lowpass", Q: 1.4 });
    droneGain = new Tone.Gain(0);
    droneFilter.connect(droneGain);
    droneGain.connect(musicaBus);
    ["A1", "E2"].forEach((n, i) => {
      const o = new Tone.Oscillator({ type: "sawtooth", frequency: n, volume: -14 });
      o.detune.value = i * 6;
      o.start();
      o.connect(droneFilter);
      droneOscs.push(o);
    });
    oscuraScale.connect(droneFilter.frequency);

    /* ── R-27: la voz de formantes ── */
    r27.src = new Tone.Oscillator({ type: "sawtooth", frequency: 110 }).start();
    r27.f1 = new Tone.Filter({ frequency: 700, type: "bandpass", Q: 7 });
    r27.f2 = new Tone.Filter({ frequency: 1200, type: "bandpass", Q: 8 });
    r27.src.connect(r27.f1);
    r27.src.connect(r27.f2);
    r27.vGain = new Tone.Gain(0);
    r27.f1.connect(r27.vGain);
    r27.f2.connect(r27.vGain);
    r27.noi = new Tone.Noise("white").start();
    r27.cFilt = new Tone.Filter({ frequency: 4000, type: "bandpass", Q: 2 });
    r27.noi.connect(r27.cFilt);
    r27.cGain = new Tone.Gain(0);
    r27.cFilt.connect(r27.cGain);
    r27.out = new Tone.Gain(2.2);
    r27.vGain.connect(r27.out);
    r27.cGain.connect(r27.out);
    r27.out.connect(modBus);          // R-27 también pasa por el vocoder
    const r27directo = new Tone.Gain(0.3);
    r27.out.connect(r27directo);
    r27directo.connect(vozBus);

    /* Micrófono y worklet se prepararon en paralelo con instrumentos y FX.
       `listo` conserva el mismo contrato: sólo cambia al terminar ambos. */
    const [, granularListo] = await Promise.all([microPromesa, granularPromesa]);
    granularOK = granularListo;
    /* Sin AudioWorklet, sólo el delay liviano conserva memoria previa;
       el pitch-shift pesado nace al llegar al cuadro que lo necesita. */
    if (!granularOK) preparaMemoriaFallbackGranular();

    /* el bpm sigue a la pila: la música piensa más despacio */
    setInterval(() => {
      if (!listo || Tone.Transport.state !== "started") return;
      Tone.Transport.bpm.rampTo(bpmBase * (0.55 + 0.45 * pila()), 0.8);
    }, 1000);

    listo = true;
    ESTADO.audioOK = true;
    return true;
  }

  /* ── helpers musicales ── */

  function nota(n, semitonos) {
    return Tone.Frequency(n).transpose(semitonos || 0).toNote();
  }
  function melodia(esc, pasos, salto) {
    const m = [];
    let i = AZAR.ent(0, 6);
    for (let k = 0; k < pasos; k++) {
      m.push(esc[i]);
      i = Math.max(0, Math.min(6, i + AZAR.ent(-(salto || 2), salto || 2)));
    }
    return m;
  }
  function patron(dens, pasos) {
    const p = [];
    for (let i = 0; i < (pasos || 16); i++) p.push(i === 0 ? true : AZAR.prob(dens));
    return p;
  }
  function seq(subdiv, fn, largo) {
    const blindada = (t, i) => { try { fn(t, i); } catch (e) { /* un choque de reloj no detiene la función */ } };
    const s = new Tone.Sequence(blindada, [...Array(largo || 16).keys()], subdiv);
    s.start(0);
    partes.push(s);
    return s;
  }

  /* la tríada del grado, subiendo de octava cuando la escala se acaba */
  function triada(esc, grado, extra) {
    const n = (i) => {
      const idx = grado + i;
      return Tone.Frequency(esc[idx % 7]).transpose(Math.floor(idx / 7) * 12 + (extra || 0)).toNote();
    };
    return [n(0), n(2), n(4)];
  }

  /* el kick golpea y la mezcla entera se agacha: el pump ochentero */
  function golpeKick(t) {
    kick.triggerAttackRelease("A1", "8n", t);
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(0.62, t);
    duck.gain.linearRampToValueAtTime(1, t + 0.24);
    Tone.Draw.schedule(() => { ultimoKick = performance.now(); }, t);
  }

  /* ── las músicas de los cuadros ── */

  const MUSICAS = {

    drone: {
      bpm: 60,
      arma(c) {
        droneGain.gain.rampTo(0.5, 2);
        /* el drone respira: el filtro se mueve solo, muy despacio */
        seq("1m", () => { droneFilter.frequency.rampTo(170 + AZAR.caos() * 280, 2.2); }, 1);
        /* un destello agudo muy de vez en cuando: la torre parpadea */
        seq("2n", (t) => {
          if (AZAR.caos() < 0.1) campana.triggerAttackRelease(nota(c.escala[AZAR.ent(3, 6)], 36), "8n", t, 0.1);
        }, 4);
      },
    },

    despegue: {
      bpm: 112,
      arma(c) {
        const esc = c.escala;
        for (let i = 0; i < 8; i++) {
          Tone.Transport.schedule((t) => campana.triggerAttackRelease(nota(esc[0], 24), "16n", t), "+" + (i * 0.26));
        }
        const prog = [0, 0, 5, 3];
        const linea = melodia(esc, 8, 2);
        let paso = 0;
        seq("16n", (t, i) => {
          const compas = Math.floor(paso / 16);
          const g = prog[compas % 4];
          const fill = compas % 4 === 3 && i >= 12;
          if (i % 4 === 0) golpeKick(t);
          if (i % 16 === 8) snare.triggerAttackRelease("8n", t);
          if (fill) snare.triggerAttackRelease("16n", t, 0.5);
          if (i % 2 === 1) hat.triggerAttackRelease("32n", t);
          if (i % 2 === 0) bajo.triggerAttackRelease(nota(esc[g], i % 8 === 6 ? 0 : -12), "16n", t);
          const tri = triada(esc, g, 24);
          arp.triggerAttackRelease(tri[paso % 3], "32n", t);
          if (i % 4 === 0) lead.triggerAttackRelease(nota(linea[(i / 4 + compas * 4) % 8], 12), "8n", t);
          paso++;
        });
      },
    },

    loop2c: {
      bpm: 104,
      arma(c) {
        /* la identidad del cuadro es NO cambiar: dos compases perfectos
           en bucle. pero ahora la banda entera los toca. */
        const esc = c.escala;
        const riff = melodia(esc, 8, 1).map((n) => nota(n, 12));
        motivoGuardado = riff.slice();   // ACUSE lo recordará roto
        let paso = 0;
        seq("8n", (t, i) => {
          if (i % 4 === 0) golpeKick(t);
          if (i % 8 === 4) snare.triggerAttackRelease("8n", t);
          if (i % 2 === 1) hat.triggerAttackRelease("32n", t);
          bajo.triggerAttackRelease(nota(esc[0], i % 8 === 6 ? 0 : -12), "16n", t);
          lead.triggerAttackRelease(riff[i % 8], "16n", t);
          const tri = triada(esc, 0, 24);
          arp.triggerAttackRelease(tri[paso % 3], "32n", t);
          paso++;
        });
      },
    },

    canon: {
      bpm: 96,
      arma(c) {
        /* tres voces del mismo dato: la voz, su copia dos pasos después
           una octava abajo, y el revés (el retrógrado) en el bajo */
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        seq("8n", (t, i) => {
          lead.triggerAttackRelease(nota(linea[i % 8], 12), "16n", t);
          lead2.triggerAttackRelease(nota(linea[(i + 6) % 8], 0), "16n", t, 0.6);
          bajo.triggerAttackRelease(nota(linea[7 - (i % 8)], -12), "16n", t, 0.7);
          if (i % 4 === 0) golpeKick(t);
          if (i % 8 === 4) hat.triggerAttackRelease("32n", t);
        });
        seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 0, 12), "1m", t, 0.3); }, 1);
      },
    },

    seCorrige: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        const prog = [0, 3];
        let paso = 0;
        seq("8n", (t, i) => {
          const g = prog[Math.floor(paso / 8) % 2];
          const buena = nota(linea[i % 8], 12);
          if (AZAR.caos() < 0.22) {
            /* se equivoca, plancha, y el snare firma el checksum */
            lead.triggerAttackRelease(nota(linea[i % 8], 13), "32n", t);
            lead.triggerAttackRelease(buena, "16n", t + 0.09);
            snare.triggerAttackRelease("32n", t + 0.09, 0.4);
          } else {
            lead.triggerAttackRelease(buena, "16n", t);
          }
          if (i % 2 === 0) bajo.triggerAttackRelease(nota(esc[g], -12), "16n", t);
          if (i % 4 === 0) golpeKick(t);
          if (i % 4 === 2) hat.triggerAttackRelease("32n", t);
          paso++;
        });
      },
    },

    detune: {
      bpm: 88,
      arma(c) {
        const esc = c.escala;
        const prog = [0, 2, 5, 3];
        let compas = 0;
        seq("1m", (t) => {
          const g = prog[compas % 4];
          pad.triggerAttackRelease(triada(esc, g, 12), "1m", t, 0.5);
          /* el filtro maestro abre y cierra como un iris */
          musFilter.frequency.rampTo(1100 + AZAR.caos() * 4200, 3.4);
          compas++;
        }, 1);
        seq("2n", (t, i) => {
          const g = prog[Math.floor(i / 2) % 4];
          lead.triggerAttackRelease(nota(esc[g], 12), "2n", t);
          lead2.triggerAttackRelease(nota(esc[g], 12), "2n", t);
          lead2.detune.cancelScheduledValues(t);
          lead2.detune.setValueAtTime(0, t);
          lead2.detune.linearRampToValueAtTime(38, t + 1);
          lead2.detune.linearRampToValueAtTime(0, t + 2);
        }, 8);
      },
    },

    turnos: {
      bpm: 92,
      arma(c) {
        /* tres antenas: la melodía y el arpegio rotan por el estéreo
           en turnos opuestos, como platos que se pasan la vigilia */
        const esc = c.escala;
        const pos = [-0.8, 0, 0.8];
        const linea = melodia(esc, 6, 2);
        let paso = 0;
        seq("8n", (t, i) => {
          const turno = Math.floor(paso / 4) % 3;
          leadPan.pan.setValueAtTime(pos[turno], t);
          arpPan.pan.setValueAtTime(pos[(turno + 2) % 3], t);
          if (i % 2 === 0) lead.triggerAttackRelease(nota(linea[(i / 2) % 6], 12), "16n", t);
          const tri = triada(esc, 0, 24);
          arp.triggerAttackRelease(tri[paso % 3], "32n", t, 0.7);
          if (i % 8 === 0) { golpeKick(t); bajo.triggerAttackRelease(nota(esc[0], -12), "8n", t); }
          paso++;
        });
      },
    },

    pingEco: {
      bpm: 76,
      arma(c) {
        const esc = c.escala;
        leadEchoSend.gain.rampTo(0.9, 0.5);
        seq("2n", (t, i) => {
          if (i % 2 === 0) {
            lead.triggerAttackRelease(nota(esc[AZAR.ent(2, 6)], 12), "16n", t);
            Tone.Draw.schedule(() => { if (typeof NAVE !== "undefined") NAVE.ping(); }, t);
          }
          /* el bajo contesta tarde, como el eco que hace de reloj */
          if (i % 4 === 3) bajo.triggerAttackRelease(nota(esc[0], -12), "4n", t);
        }, 8);
        seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 5, 0), "1m", t, 0.25); }, 1);
      },
    },

    mitades: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1);
        let stride = 1, contador = 0, octava = 12;
        seq("8n", (t, i) => {
          contador++;
          if (contador === 32 || contador === 64) { stride *= 2; octava -= 12; }
          if (i % stride !== 0) return;
          lead.triggerAttackRelease(nota(linea[i % 8], octava), "16n", t);
          if (i % (4 * stride) === 0) golpeKick(t);
          if (i % (2 * stride) === 0) bajo.triggerAttackRelease(nota(esc[0], -12), "16n", t);
        });
        /* el pad aguanta la respiración mientras todo se divide */
        seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 0, 0), "1m", t, 0.3); }, 1);
      },
    },

    sub: {
      bpm: 60,
      arma(c) {
        droneGain.gain.rampTo(0.55, 2);
        seq("1n", (t, i) => {
          bajo.triggerAttackRelease(i % 2 === 0 ? "A0" : "E1", "2n", t);
          /* el gruñido FM: la masa que no brilla */
          if (i % 4 === 2) campana.triggerAttackRelease("A1", "1n", t, 0.4);
          if (AZAR.caos() < 0.1) campana.triggerAttackRelease(nota(c.escala[6], 36), "16n", t, 0.08);
        }, 4);
      },
    },

    suspendido: {
      bpm: 72,
      arma(c) {
        const esc = c.escala;
        droneGain.gain.rampTo(0.3, 2);
        seq("1m", (t) => {
          /* sus2: la palabra que no resuelve */
          pad.triggerAttackRelease([nota(esc[0], 12), nota(esc[1], 12), nota(esc[4], 12)], "1m", t, 0.5);
          musFilter.frequency.rampTo(900 + AZAR.caos() * 2600, 3.2);
        }, 1);
        seq("2n", (t, i) => {
          if (i % 2 === 1) campana.triggerAttackRelease(nota(esc[AZAR.el([1, 4])], 24), "8n", t, 0.3);
        }, 4);
      },
    },

    telar8: {
      bpm: 96,
      arma(c) {
        /* dos tarjetas perforadas entrelazadas: el bajo teje una,
           el arpegio la otra, y el hat marca donde NO hay hoyo.
           la bifurcación de LA REGIÓN también se oye: «nube» afloja
           la trama y suelta el pad; «red» la aprieta y endurece. */
        const esc = c.escala;
        const nube = ESTADO.rumbo === "nube";
        const red = ESTADO.rumbo === "red";
        const tarjetaA = patron(nube ? 0.35 : red ? 0.75 : 0.55, 8);
        const tarjetaB = patron(nube ? 0.3 : red ? 0.6 : 0.45, 8);
        seq("8n", (t, i) => {
          const p = i % 8;
          if (i % 16 === 0) golpeKick(t);
          if (tarjetaA[p]) bajo.triggerAttackRelease(nota(esc[p % 7], -12), "16n", t);
          else hat.triggerAttackRelease("32n", t, red ? 0.9 : 0.5);
          if (tarjetaB[p]) arp.triggerAttackRelease(nota(esc[(p * 2) % 7], 12), "32n", t);
        });
        if (nube) seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 0, 0), "1m", t, 0.35); }, 1);
      },
    },

    blips: {
      bpm: 112,
      arma(c) {
        const esc = c.escala;
        esaNotaFija = nota(esc[4], 24);
        let paso = 0;
        seq("16n", (t, i) => {
          if (AZAR.caos() < 0.3) arp.triggerAttackRelease(nota(esc[AZAR.ent(0, 6)], 24), "32n", t);
          if (i % 8 === 0) golpeKick(t);
          if (i % 8 === 4) bajo.triggerAttackRelease(nota(esc[0], -12), "16n", t);
          /* cada cuatro compases, el número reza su nota entera */
          if (paso % 64 === 48) lead.triggerAttackRelease(esaNotaFija, "8n", t);
          paso++;
        });
      },
    },

    corrido: {
      bpm: 90,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        seq("4n", (t, i) => {
          /* apunta a una nota y suenan las de al lado: melodía y bajo */
          const idx = esc.indexOf(linea[i % 8]);
          const corrida = esc[Math.min(6, idx + 1)];
          lead.triggerAttackRelease(nota(corrida, 12), "8n", t);
          bajo.triggerAttackRelease(nota(esc[(idx + 1) % 7], -12), "8n", t + Tone.Time("8n").toSeconds());
          if (i % 2 === 0) hat.triggerAttackRelease("16n", t);
          if (i % 4 === 0) golpeKick(t);
        }, 8);
      },
    },

    huecos: {
      bpm: 92,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1);
        seq("8n", (t, i) => {
          if (i % 4 === 3) { hat.triggerAttackRelease("64n", t, 0.15); return; }   // el hueco se oye
          lead.triggerAttackRelease(nota(linea[i % 8], 12), "16n", t);
          if (i % 8 === 0) { golpeKick(t); bajo.triggerAttackRelease(nota(esc[0], -12), "8n", t); }
        }, 8);
        seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 3, 0), "1m", t, 0.25); }, 1);
      },
    },

    contratiempo: {
      bpm: 84,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 4, 2);
        const respuesta = melodia(esc, 4, 3);
        lead2.detune.value = -30;
        leadEchoSend.gain.rampTo(0.4, 0.5);
        seq("4n", (t, i) => {
          lead.triggerAttackRelease(nota(linea[i % 4], 12), "8n", t);
          lead2.triggerAttackRelease(respuesta[i % 4], "8n", t + Tone.Time("8n").toSeconds());
          if (i % 2 === 0) bajo.triggerAttackRelease(nota(esc[0], -12), "8n", t);
          if (i % 4 === 0) golpeKick(t);
        }, 4);
        seq("1m", (t) => { pad.triggerAttackRelease(triada(esc, 5, 0), "1m", t, 0.2); }, 1);
      },
    },

    pulso: {
      bpm: 50,
      arma() {
        let vol = -6, contador = 0;
        seq("1n", (t) => {
          contador++;
          if (contador % 4 === 0) vol -= 6;   // la mitad del pulso, cada vez
          kick.volume.setValueAtTime(Math.max(-40, vol), t);
          kick.triggerAttackRelease("A0", "2n", t);
          Tone.Draw.schedule(() => { ultimoKick = performance.now(); }, t);
        }, 2);
        /* la memoria vuelve rota: el riff de TIEMPO CONTINUO,
           a media velocidad, perdiendo notas, apenas audible */
        if (motivoGuardado) {
          let j = 0;
          seq("2n", (t) => {
            if (AZAR.caos() < 0.5) { j++; return; }
            lead2.triggerAttackRelease(motivoGuardado[j % 8], "4n", t, 0.15);
            j++;
          }, 8);
        }
      },
    },
  };

  function armarMusica(c) {
    partes.forEach((p) => { try { p.dispose(); } catch (e) { /* nada */ } });
    partes = [];
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    const ahora = ahoraR27();
    cancelaParametro(kick.volume, ahora, true);
    kick.volume.linearRampToValueAtTime(-6, ahora + 0.04);
    cancelaParametro(duck.gain, ahora, true);
    duck.gain.linearRampToValueAtTime(1, ahora + 0.04);
    cancelaParametro(lead2.detune, ahora, true);
    lead2.detune.linearRampToValueAtTime(0, ahora + 0.04);
    droneGain.gain.rampTo(0, 1);
    leadEchoSend.gain.rampTo(0, 0.3);
    try { pad.releaseAll(); } catch (e) { /* nada */ }
    musicaBus.gain.rampTo(
      ESTADO.capas.musica ? (calibracionAudio ? 0.12 : 0.8) : 0, 0.12);
    musFilter.frequency.rampTo(9000, 0.5);
    leadPan.pan.rampTo(0, 0.3);
    AZAR.sembrar(ESTADO.seed + ":" + c.id);
    const M = MUSICAS[c.musica] || MUSICAS.drone;
    bpmBase = M.bpm;
    Tone.Transport.bpm.value = bpmBase * (0.55 + 0.45 * pila());
    if (M.arma) M.arma(c);
    if (ESTADO.capas.musica && !ESTADO.panico) Tone.Transport.start("+0.05");
  }

  function necesitaProcesamientoVocoder() {
    if (!listo || ESTADO.panico) return false;
    if (calibracionAudio) return true;
    const wet = cuadroActual && cuadroActual.micro ? (cuadroActual.micro.wet || 0) : 0;
    return ESTADO.capas.vocoder && wet > 0;
  }

  function conectaBancoVocoder() {
    if (vocoderProcesando) return;
    const ahora = ahoraR27();
    [modVocoderIn, carrierVocoderIn, sibVocoderIn].forEach((entrada) => {
      cancelaParametro(entrada.gain, ahora, true);
      entrada.gain.linearRampToValueAtTime(1, ahora + 0.025);
    });
    vocoderProcesando = true;
  }

  function desconectaBancoVocoder() {
    if (!vocoderProcesando) return;
    const ahora = ahoraR27();
    [modVocoderIn, carrierVocoderIn, sibVocoderIn].forEach((entrada) => {
      cancelaParametro(entrada.gain, ahora, true);
      entrada.gain.linearRampToValueAtTime(0, ahora + 0.035);
    });
    vocoderProcesando = false;
  }

  function actualizaProcesamientoVocoder(demora) {
    clearTimeout(vocoderDesconexionTimer);
    vocoderDesconexionTimer = null;
    if (necesitaProcesamientoVocoder()) {
      conectaBancoVocoder();
      return;
    }
    vocoderDesconexionTimer = setTimeout(() => {
      vocoderDesconexionTimer = null;
      if (!necesitaProcesamientoVocoder()) desconectaBancoVocoder();
    }, Math.max(0, (demora || 0) * 1000));
  }

  /* ── el cuadro cambia: voz y música ── */

  function cuadro(c) {
    cuadroActual = c;
    if (!listo) return;
    asegurarContexto();
    callaR27();
    armarMusica(c);

    /* carrier del vocoder: el acorde del cuadro */
    c.acorde.forEach((n, i) => {
      if (carriers[i]) carriers[i].frequency.rampTo(Tone.Frequency(n).toFrequency(), 0.2);
    });
    for (let i = c.acorde.length; i < carriers.length; i++) {
      carriers[i].frequency.rampTo(Tone.Frequency(c.acorde[c.acorde.length - 1]).toFrequency(), 0.2);
    }
    otraCarriers.forEach((o, i) => {
      o.frequency.rampTo(Tone.Frequency(c.acorde[0]).toFrequency() / 2 * (i ? 1.5 : 1), 0.4);
    });
    subOsc.frequency.rampTo(Tone.Frequency(c.acorde[0]).toFrequency() / 2, 0.2);

    const m = c.micro || {};
    const wetObjetivo = calibracionAudio ? 0.74
      : (ESTADO.capas.vocoder ? (m.wet || 0) : 0);
    wetGain.gain.rampTo(wetObjetivo, 0.4);
    actualizaProcesamientoVocoder(0.45);
    subGain.gain.rampTo(m.sub ? 0.5 : 0, 0.4);
    otraGain.gain.rampTo(m.otra ? 0.6 : 0, 0.6);
    const nuevoSuavizado = m.colaLarga ? 0.5 : 0.035;
    if (nuevoSuavizado !== suavizadoVocoder) {
      bandas.forEach((b) => { b.foll.smoothing = nuevoSuavizado; });
      suavizadoVocoder = nuevoSuavizado;
    }

    /* efectos de voz */
    clearTimeout(granularRáfagaTimer);
    clearTimeout(granularFreezeTimer);
    const ecoActivo = m.fx === "eco" || m.repite;
    const verbActiva = m.fx === "reverb";
    ecoSend.gain.rampTo(m.fx === "eco" ? 0.9 : (m.repite ? 0.5 : 0), 0.4);
    ecoReturn.gain.rampTo(m.fx === "eco" ? 0.72 : (m.repite ? 0.45 : 0), ecoActivo ? 0.18 : 0.06);
    eco.delayTime.rampTo(m.repite ? 0.45 : 0.9, 0.3);
    verbSend.gain.rampTo(verbActiva ? 0.85 : 0, 0.4);
    verbReturn.gain.rampTo(verbActiva ? 0.62 : 0, verbActiva ? 0.22 : 0.06);
    configuraGranular(m.fx === "granos" && !ESTADO.panico);
    oscuraScale.gain.rampTo(m.fx === "oscura" ? 2600 : 0, 0.4);
    directo.gain.rampTo(m.fx === "oscura" ? 0 : 1, 0.4);

    clearInterval(redTimer);
    if (corridoLFO) { corridoLFO.dispose(); corridoLFO = null; }
    if (m.fx === "red") {
      /* LA RED: la voz rota por las tres antenas */
      const pos = [-0.8, 0, 0.8];
      let turno = 0;
      redTimer = setInterval(() => {
        panner.pan.rampTo(pos[turno], 0.15);
        turno = (turno + 1) % 3;
      }, 2600);
    } else if (m.fx === "corrido") {
      /* PUNTERO: sale por el lugar equivocado */
      corridoLFO = new Tone.LFO({ frequency: 0.08, type: "square", min: -0.7, max: 0.7 });
      corridoLFO.connect(panner.pan);
      corridoLFO.start();
    } else {
      panner.pan.rampTo(0, 0.3);
    }
  }

  /* ── R-27 lee (formantes por el vocoder) ── */

  function ahoraR27() {
    return typeof Tone.immediate === "function" ? Tone.immediate() : Tone.now();
  }

  function cancelaParametro(param, ahora, sostiene) {
    if (!param) return;
    try {
      if (sostiene && typeof param.cancelAndHoldAtTime === "function") {
        param.cancelAndHoldAtTime(ahora);
      } else {
        const valor = Number.isFinite(param.value) ? param.value : 0;
        param.cancelScheduledValues(ahora);
        if (sostiene) param.setValueAtTime(valor, ahora);
      }
    } catch (e) { /* una cancelación tardía no debe bloquear la consola */ }
  }

  function limpiaColaR27() {
    clearTimeout(r27.timer);
    r27.timer = null;
    if (!r27.vGain) return;
    const ahora = ahoraR27();
    cancelaParametro(r27.vGain.gain, ahora, true);
    cancelaParametro(r27.cGain.gain, ahora, true);
    [r27.f1.frequency, r27.f2.frequency, r27.src.frequency,
      r27.cFilt.frequency, r27.cFilt.Q].forEach((p) => cancelaParametro(p, ahora, false));
    r27.vGain.gain.linearRampToValueAtTime(0, ahora + 0.035);
    r27.cGain.gain.linearRampToValueAtTime(0, ahora + 0.035);
  }

  function programaCaracterR27(c, t, freza) {
    if (FORMANTES[c]) {
      const [F1, F2] = FORMANTES[c];
      const dur = 0.1 * freza;
      r27.f1.frequency.setValueAtTime(F1, t);
      r27.f2.frequency.setValueAtTime(F2, t);
      r27.src.frequency.setValueAtTime(105 + AZAR.caos() * 12, t);
      r27.vGain.gain.setValueAtTime(0, t);
      r27.vGain.gain.linearRampToValueAtTime(0.6, t + 0.02);
      r27.vGain.gain.setValueAtTime(0.6, t + dur - 0.03);
      r27.vGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.012;
    }
    if (CONSONANTES.tono[c]) {
      const dur = 0.06 * freza;
      r27.f1.frequency.setValueAtTime(CONSONANTES.tono[c], t);
      r27.f2.frequency.setValueAtTime(CONSONANTES.tono[c] * 2.4, t);
      r27.vGain.gain.setValueAtTime(0, t);
      r27.vGain.gain.linearRampToValueAtTime(0.35, t + 0.015);
      r27.vGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.01;
    }
    if (CONSONANTES.ruido[c] !== undefined) {
      if (CONSONANTES.ruido[c] === 0) return t + 0.02;   // la h no suena
      const dur = 0.07 * freza;
      r27.cFilt.frequency.setValueAtTime(CONSONANTES.ruido[c], t);
      r27.cFilt.Q.setValueAtTime(2, t);
      r27.cGain.gain.setValueAtTime(0, t);
      r27.cGain.gain.linearRampToValueAtTime(0.5, t + 0.01);
      r27.cGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.01;
    }
    if (CONSONANTES.clic.includes(c)) {
      r27.cFilt.frequency.setValueAtTime(1500, t);
      r27.cFilt.Q.setValueAtTime(0.5, t);
      r27.cGain.gain.setValueAtTime(0, t);
      r27.cGain.gain.linearRampToValueAtTime(0.7, t + 0.004);
      r27.cGain.gain.linearRampToValueAtTime(0, t + 0.025);
      return t + 0.045 * freza;
    }
    if (c === " ") return t + 0.09 * freza;
    if (c === "," || c === ";") return t + 0.28 * freza;
    if (c === "." || c === ":") return t + 0.46 * freza;
    return t;
  }

  function programaTramoR27(miLectura) {
    if (miLectura !== r27.t || !listo || ESTADO.panico) return;
    const horizonte = ahoraR27() + R27_HORIZONTE;
    while (r27.indice < r27.caracteres.length && r27.cursor < horizonte) {
      r27.cursor = programaCaracterR27(
        r27.caracteres[r27.indice], r27.cursor, r27.freza);
      r27.indice += 1;
    }
    if (r27.indice < r27.caracteres.length) {
      r27.timer = setTimeout(() => programaTramoR27(miLectura), R27_INTERVALO);
    } else {
      r27.timer = null;
    }
  }

  function leerR27(texto) {
    if (!listo || ESTADO.panico) return;
    asegurarContexto();
    r27.t += 1;
    const miLectura = r27.t;
    limpiaColaR27();
    r27.caracteres = String(texto || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ").slice(0, 600);
    r27.indice = 0;
    r27.freza = 1 + (1 - pila()) * 0.8;   // con poca pila lee más despacio
    r27.cursor = ahoraR27() + 0.045;
    if (r27.caracteres) programaTramoR27(miLectura);
  }

  function callaR27() {
    if (!listo) return;
    r27.t += 1;
    limpiaColaR27();
  }

  /* ── CORO: la voz de tierra ── */

  function coro(texto) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const voz = speechSynthesis.getVoices().find((v) => /^es[-_]/i.test(v.lang));
    if (voz) u.voice = voz;
    u.pitch = 0.5;
    u.rate = 0.82;
    speechSynthesis.speak(u);
  }

  /* ── gestos chicos ── */

  function blip(n) {
    if (!listo || !ESTADO.capas.musica) return;
    const esc = (cuadroActual || SETLIST[0]).escala;
    try { lead.triggerAttackRelease(nota(esc[n % 7], 24), "32n"); } catch (e) { /* nada */ }
  }
  function esaNota() {
    if (!listo || !ESTADO.capas.musica) return;
    try { campana.triggerAttackRelease(esaNotaFija, "16n"); } catch (e) { /* nada */ }
  }
  let ultimoClic = 0;
  function tecla() {
    if (!listo || !ESTADO.capas.musica || ESTADO.panico) return;
    const ahora = Tone.now();
    if (ahora - ultimoClic < 0.05) return;
    ultimoClic = ahora;
    if (AZAR.caos() < 0.5) { try { clic.triggerAttackRelease("64n"); } catch (e) { /* nada */ } }
  }
  function clicPuerta() {
    if (!listo) return;
    try { campana.triggerAttackRelease("A5", "32n"); } catch (e) { /* nada */ }
  }
  function ruido(seg) {
    if (!listo) return;
    const n = new Tone.Noise("pink").start();
    const g = new Tone.Gain(0).connect(master);
    n.connect(g);
    g.gain.rampTo(0.25, 0.05);
    setTimeout(() => {
      g.gain.rampTo(0, 0.3);
      setTimeout(() => { n.dispose(); g.dispose(); }, 500);
    }, (seg || 1.5) * 1000);
  }

  /* ── mezcla y pánico ── */

  function amplitudMeter(m) {
    if (!m) return 0;
    const v = m.getValue();
    const lista = typeof v === "number" ? [v] : v;
    let mayor = 0;
    for (const x of lista) if (Number.isFinite(x)) mayor = Math.max(mayor, Math.abs(x));
    return Math.min(1.5, mayor);
  }

  /* NAVE y Hydra piden las mismas señales en ciclos distintos. Este
     snapshot de 30 Hz evita releer seis analizadores por frame. */
  function sensores() {
    if (!listo) return { nivel: 0, grave: 0, agudo: 0, beat: 0 };
    const ahora = performance.now();
    if (ahora - sensoresLeidosEn < SENSOR_INTERVALO) return sensoresCache;
    sensoresLeidosEn = ahora;
    sensoresCache = {
      nivel: Math.min(1, amplitudMeter(meter) * 3),
      grave: Math.min(1, amplitudMeter(meterGrave) * 4),
      agudo: Math.min(1, amplitudMeter(meterAgudo) * 5),
      beat: Math.max(0, 1 - (ahora - ultimoKick) / 400),
    };
    return sensoresCache;
  }

  function beat() { return sensores().beat; }
  function grave() { return sensores().grave; }
  function agudo() { return sensores().agudo; }
  function nivel() { return sensores().nivel; }

  function aDb(v) {
    return 20 * Math.log10(Math.max(0.000001, v));
  }

  function nivelEspectral(valores, desde, hasta, sampleRate) {
    if (!valores || !valores.length || !sampleRate) return 0;
    const nyquist = sampleRate / 2;
    const inicio = Math.max(0, Math.floor(desde / nyquist * valores.length));
    const fin = Math.min(valores.length - 1, Math.ceil(hasta / nyquist * valores.length));
    let suma = 0;
    let n = 0;
    for (let i = inicio; i <= fin; i++) {
      const v = Number.isFinite(valores[i]) ? Math.max(0, valores[i]) : 0;
      suma += v * v;
      n += 1;
    }
    return n ? Math.sqrt(suma / n) : 0;
  }

  function conectaTelemetriaCalibracion() {
    if (telemetriaCalibracionConectada) return;
    micComp.connect(meterCrudo);
    modBus.connect(espectroVoz);
    vocPost.connect(meterVocoder);
    limiter.connect(meterSalida);
    telemetriaCalibracionConectada = true;
  }

  function desconectaTelemetriaCalibracion() {
    if (!telemetriaCalibracionConectada) return;
    try { micComp.disconnect(meterCrudo); } catch (e) { /* ya estaba fuera */ }
    try { modBus.disconnect(espectroVoz); } catch (e) { /* ya estaba fuera */ }
    try { vocPost.disconnect(meterVocoder); } catch (e) { /* ya estaba fuera */ }
    try { limiter.disconnect(meterSalida); } catch (e) { /* ya estaba fuera */ }
    telemetriaCalibracionConectada = false;
  }

  function telemetriaVocoder() {
    const ac = contextoCrudo();
    let espectro = [];
    try { espectro = espectroVoz ? espectroVoz.getValue() : []; } catch (e) { /* sin espectro */ }
    const sampleRate = ac && ac.sampleRate ? ac.sampleRate : 48000;
    const crudo = amplitudMeter(meterCrudo);
    const entrada = amplitudMeter(meter);
    const vocoder = amplitudMeter(meterVocoder);
    const salida = amplitudMeter(meterSalida);
    return {
      crudo, entrada, vocoder, salida,
      crudoDb: aDb(crudo),
      entradaDb: aDb(entrada),
      vocoderDb: aDb(vocoder),
      salidaDb: aDb(salida),
      bandas: bandas.map((b) => {
        const n = nivelEspectral(espectro, b.medicionBaja, b.medicionAlta, sampleRate);
        return { f: Math.round(b.f), nivel: n, db: aDb(n) };
      }),
      sibilantes: sibilantes.map((b) => {
        const n = nivelEspectral(espectro, b.medicionBaja, b.medicionAlta, sampleRate);
        return { f: b.f, nivel: n, db: aDb(n) };
      }),
      clip: crudo > 0.94 || salida > 0.94,
      micOK: ESTADO.micOK,
      granularOK,
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
    ajusteMicro.bandas = bandas.map((_, i) =>
      limita(a.bandas && a.bandas[i], 0.62, 1.58, 1));
    ajusteMicro.sibilantes = sibilantes.map((_, i) =>
      limita(a.sibilantes && a.sibilantes[i], 0.72, 1.75, 1));

    micGain.gain.rampTo(ajusteMicro.gain, 0.35);
    micGate.threshold = ajusteMicro.gateDb;
    bandas.forEach((b, i) => b.boost.gain.rampTo(
      b.baseBoost * ajusteMicro.bandas[i], 0.45));
    sibilantes.forEach((b, i) => b.boost.gain.rampTo(
      b.baseBoost * ajusteMicro.sibilantes[i], 0.35));
    return telemetriaVocoder().ajuste;
  }

  function modoCalibracion(activo) {
    if (!listo) return;
    asegurarContexto();
    calibracionAudio = activo;
    if (activo) {
      conectaTelemetriaCalibracion();
      actualizaProcesamientoVocoder(0);
      micGate.threshold = -70;
      wetGain.gain.rampTo(0.74, 0.25);
      musicaBus.gain.rampTo(ESTADO.capas.musica ? 0.12 : 0, 0.3);
    } else {
      micGate.threshold = ajusteMicro.gateDb;
      const wet = cuadroActual && cuadroActual.micro
        ? (ESTADO.capas.vocoder ? (cuadroActual.micro.wet || 0) : 0) : 0;
      wetGain.gain.rampTo(wet, 0.3);
      musicaBus.gain.rampTo(ESTADO.capas.musica ? 0.8 : 0, 0.45);
      actualizaProcesamientoVocoder(0.35);
      desconectaTelemetriaCalibracion();
    }
  }

  function alternarMusica() {
    ESTADO.capas.musica = !ESTADO.capas.musica;
    if (!listo) return ESTADO.capas.musica;
    asegurarContexto();
    if (ESTADO.capas.musica) {
      musicaBus.gain.rampTo(0.8, 0.12);
      Tone.Transport.start("+0.05");
    } else {
      musicaBus.gain.rampTo(0, 0.08);
      Tone.Transport.pause();
    }
    return ESTADO.capas.musica;
  }
  function alternarVocoder() {
    ESTADO.capas.vocoder = !ESTADO.capas.vocoder;
    if (listo && cuadroActual) {
      asegurarContexto();
      actualizaProcesamientoVocoder(0.22);
      const ahora = ahoraR27();
      const wet = ESTADO.capas.vocoder ? (cuadroActual.micro.wet || 0) : 0;
      cancelaParametro(wetGain.gain, ahora, true);
      wetGain.gain.linearRampToValueAtTime(wet, ahora + 0.12);
    }
    return ESTADO.capas.vocoder;
  }
  function alternarDry() {
    ESTADO.capas.dry = !ESTADO.capas.dry;
    if (listo) {
      asegurarContexto();
      dryGain.gain.rampTo(ESTADO.capas.dry ? 0.5 : 0, 0.2);
    }
    return ESTADO.capas.dry;
  }

  function panico() {
    if (!listo) { ESTADO.panico = !ESTADO.panico; return ESTADO.panico; }
    if (!ESTADO.panico) {
      const ahora = ahoraR27();
      cancelaParametro(master.gain, ahora, true);
      master.gain.linearRampToValueAtTime(0, ahora + 0.03); // 30ms. sin preguntas.
      Tone.Transport.pause();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      callaR27();
      configuraGranular(false);
      ESTADO.panico = true;
      actualizaProcesamientoVocoder(0.04);
    } else {
      asegurarContexto();
      master.gain.rampTo(0.9, 0.5);
      if (ESTADO.capas.musica) Tone.Transport.start("+0.05");
      ESTADO.panico = false;
      actualizaProcesamientoVocoder(0);
      configuraGranular(!!(cuadroActual && cuadroActual.micro && cuadroActual.micro.fx === "granos"));
    }
    return ESTADO.panico;
  }

  /* el vocoder en vivo: zxcvbnm = grados de la escala del cuadro */
  function notaVocoder(grado) {
    if (!listo || !cuadroActual) return;
    asegurarContexto();
    const esc = cuadroActual.escala;
    const raiz = Tone.Frequency(esc[grado % 7]).toFrequency();
    const ahora = ahoraR27();
    [raiz, raiz * 1.5, raiz * 2].forEach((frecuencia, i) => {
      if (!carriers[i]) return;
      cancelaParametro(carriers[i].frequency, ahora, true);
      carriers[i].frequency.linearRampToValueAtTime(frecuencia, ahora + 0.045);
    });
  }

  return {
    iniciar, cuadro, nivel, grave, agudo, beat, sensores, blip, esaNota, tecla, clicPuerta, ruido, soltarGranos,
    leerR27, callaR27, coro, alternarMusica, alternarVocoder, alternarDry,
    panico, notaVocoder, telemetriaVocoder, aplicarCalibracion, modoCalibracion,
    get listo() { return listo; },
    get granularOK() { return granularOK; },
    get numeroBandas() { return bandas.length; },
  };
})();
