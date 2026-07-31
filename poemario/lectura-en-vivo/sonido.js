/* VIDA MEDIA · EN VIVO — sonido.js · vuelta 9
   La mesa de mezclas y la cadena de efectos de voz.

   Lo que antes era un solo archivo de mil quinientas líneas quedó
   repartido, porque cada capa tiene un ritmo de mantenimiento distinto:

     sonido-nucleo.js   contexto, cachés de nota, helpers de parámetro
     sonido-musica.js   instrumentos y las diecisiete piezas del setlist
     sonido-vocoder.js  micro, banco de canales, portadoras, calibración
     sonido-r27.js      la voz de formantes
     sonido.js          esto: master, buses, efectos de voz, pánico

   Reglas que no cambian: el micro seco jamás por defecto; limiter −3 dB
   siempre; sin micro, todo lo demás sigue. Y una nueva: nada que no se
   esté oyendo debe seguir gastando el hilo de audio. */

"use strict";

const SONIDO = (() => {
  let listo = false;
  let master, limiter, vozBus, vozProtector;
  let fxIn, directo, panner;
  let ecoSend, eco, ecoReturn;
  let verbSend, verb, verbReturn, verbConectada = false, verbTimer = null;
  let granoSend, granulador, granoPitch, grano, granoMemoriaGain;
  let granularOK = false;
  let granularFallbackConectado = false;
  let granularFallbackFallido = false;
  let granularFallbackTimer = null;
  let granularRáfagaTimer = null, granularFreezeTimer = null;
  let oscuraFoll, oscuraScale;
  let redTimer = null, corridoLFO = null;
  let cuadroActual = null;
  let calibracionAudio = false;

  /* NAVE y Hydra piden las mismas señales en ciclos distintos. Este
     snapshot de 30 Hz evita releer seis analizadores por cuadro. */
  const sensoresCache = { nivel: 0, grave: 0, agudo: 0, beat: 0 };
  let sensoresLeidosEn = -Infinity;
  const SENSOR_INTERVALO = 32;

  /* ── el granulador (ESCRIBIR FUERA DE SÍ) ── */

  function valorGranular(nombre, valor, rampa) {
    if (!granulador || !granulador.parameters) return;
    const p = granulador.parameters.get(nombre);
    if (!p) return;
    const t = AUDIO.contextoCrudo().currentTime;
    p.cancelScheduledValues(t);
    p.setValueAtTime(p.value, t);
    p.linearRampToValueAtTime(valor, t + (rampa || 0.04));
  }

  async function iniciarGranulador(entrada, salida) {
    const tc = AUDIO.contextoTone();
    const ac = AUDIO.contextoCrudo();
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
      granulador.port.postMessage({ type: "seed", value: AUDIO.hash(ESTADO.seed + ":granos") });
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

  /* ── LA REGIÓN: la cola de convolución sólo existe en su cuadro ──
     Un Reverb de 6,8 s es convolución particionada corriendo en el hilo
     de audio a costo fijo, se oiga o no. Bajar su envío a cero no la
     apagaba: había que soltarle la entrada. Se desconecta con retardo
     para que la cola termine de caer y no se corte en seco. */
  function conectaReverb(encendida) {
    clearTimeout(verbTimer);
    verbTimer = null;
    if (encendida) {
      if (!verbConectada) { verbSend.connect(verb); verbConectada = true; }
      return;
    }
    if (!verbConectada) return;
    verbTimer = setTimeout(() => {
      try { verbSend.disconnect(verb); } catch (e) { /* ya estaba fuera */ }
      verbConectada = false;
      verbTimer = null;
    }, 900);
  }

  /* ── arranque ── */

  async function iniciar() {
    if (listo) return true;
    try { await Tone.start(); } catch (e) { console.warn("audio: sin contexto", e); return false; }
    AUDIO.ajustaAnticipacion();

    /* ── mezcla ── */
    master = new Tone.Gain(0.9);
    limiter = new Tone.Limiter(-3);
    master.connect(limiter);
    limiter.toDestination();
    MUSICA.construir(master);
    /* La voz tiene su propio margen antes del limiter general. Así un pico
       del vocoder o de T no comprime también toda la música de fondo. */
    vozBus = new Tone.Gain(0.58);
    vozProtector = new Tone.Compressor({
      threshold: -12, ratio: 5.5, attack: 0.003, release: 0.09, knee: 6,
    });
    vozBus.connect(vozProtector);
    vozProtector.connect(master);

    /* El permiso del micro se pide ya; el resto del grafo se construye
       mientras el dispositivo responde. */
    const microPromesa = VOCODER.construir(limiter);

    /* ── la cadena de efectos de voz ── */
    fxIn = new Tone.Gain(1);
    VOCODER.conectarSalida(fxIn);
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
    VOCODER.entradaModulador().connect(oscuraFoll);
    oscuraScale = new Tone.Gain(0);
    oscuraFoll.connect(oscuraScale);
    oscuraScale.connect(MUSICA.moduladorDrone());

    R27.construir(VOCODER.entradaModulador(), vozBus);

    /* Micrófono y worklet se prepararon en paralelo con instrumentos y FX.
       `listo` conserva el mismo contrato: sólo cambia al terminar ambos. */
    const [, granularListo] = await Promise.all([microPromesa, granularPromesa]);
    granularOK = granularListo;
    /* Sin AudioWorklet, sólo el delay liviano conserva memoria previa;
       el pitch-shift pesado nace al llegar al cuadro que lo necesita. */
    if (!granularOK) preparaMemoriaFallbackGranular();

    listo = true;
    ESTADO.audioOK = true;
    if (typeof RENDIMIENTO !== "undefined") RENDIMIENTO.vigilaAudio(AUDIO.contextoCrudo());
    return true;
  }

  /* El prevuelo ocurre antes del primer cuadro: no hay acorde puesto.
     Se le da el de PLATAFORMA para que la voz tenga dónde apoyarse
     mientras se mide, sin armar todavía ninguna música. */
  function afinaPrevuelo() {
    if (!listo) return;
    VOCODER.acorde(SETLIST[0].acorde);
  }

  /* ── el cuadro cambia: voz y música ── */

  function cuadro(c) {
    cuadroActual = c;
    if (!listo) return;
    AUDIO.asegurarContexto();
    R27.callar();
    MUSICA.arma(c, calibracionAudio);
    VOCODER.acorde(c.acorde);

    const m = c.micro || {};
    VOCODER.ajusta(m);

    /* efectos de voz */
    clearTimeout(granularRáfagaTimer);
    clearTimeout(granularFreezeTimer);
    const ecoActivo = m.fx === "eco" || m.repite;
    const verbActiva = m.fx === "reverb";
    ecoSend.gain.rampTo(m.fx === "eco" ? 0.9 : (m.repite ? 0.5 : 0), 0.4);
    ecoReturn.gain.rampTo(m.fx === "eco" ? 0.72 : (m.repite ? 0.45 : 0), ecoActivo ? 0.18 : 0.06);
    eco.delayTime.rampTo(m.repite ? 0.45 : 0.9, 0.3);
    conectaReverb(verbActiva);
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

  /* ── sensores ── */

  function sensores() {
    if (!listo) {
      sensoresCache.nivel = 0;
      sensoresCache.grave = 0;
      sensoresCache.agudo = 0;
      sensoresCache.beat = 0;
      return sensoresCache;
    }
    const t = performance.now();
    if (t - sensoresLeidosEn < SENSOR_INTERVALO) return sensoresCache;
    sensoresLeidosEn = t;
    /* Se escribe sobre el mismo objeto a propósito: treinta veces por
       segundo, un objeto nuevo por lectura es basura que el recolector
       cobra en el peor momento. */
    VOCODER.sensores(sensoresCache);
    sensoresCache.beat = MUSICA.beat();
    return sensoresCache;
  }

  function nivel() { return sensores().nivel; }
  function grave() { return sensores().grave; }
  function agudo() { return sensores().agudo; }
  function beat() { return sensores().beat; }

  /* ── gestos, mezcla y pánico ── */

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

  function modoCalibracion(activo) {
    if (!listo) return;
    AUDIO.asegurarContexto();
    calibracionAudio = activo;
    VOCODER.modoCalibracion(activo);
    MUSICA.volumen(activo ? 0.12 : 0.8, activo ? 0.3 : 0.45);
  }

  function alternarMusica() { return MUSICA.alternar(); }
  /* Para el prevuelo: callar la música sin apagar su capa, de modo que
     la función la encuentre encendida cuando arranque. */
  function pausarMusica() { MUSICA.pausar(); }
  function alternarVocoder() { return VOCODER.alternar(); }
  function alternarDry() { return VOCODER.alternarDry(); }
  function alternarMicro() { return VOCODER.alternarMicro(); }

  function panico() {
    if (!listo) { ESTADO.panico = !ESTADO.panico; return ESTADO.panico; }
    if (!ESTADO.panico) {
      const t = AUDIO.ahora();
      AUDIO.cancelaParametro(master.gain, t, true);
      master.gain.linearRampToValueAtTime(0, t + 0.03); // 30ms. sin preguntas.
      MUSICA.pausar();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      R27.callar();
      configuraGranular(false);
      ESTADO.panico = true;
      VOCODER.actualizaProceso(0.04);
    } else {
      AUDIO.asegurarContexto();
      master.gain.rampTo(0.9, 0.5);
      MUSICA.reanudar();
      ESTADO.panico = false;
      VOCODER.actualizaProceso(0);
      configuraGranular(!!(cuadroActual && cuadroActual.micro && cuadroActual.micro.fx === "granos"));
    }
    return ESTADO.panico;
  }

  function notaVocoder(grado) {
    if (!listo || !cuadroActual) return;
    AUDIO.asegurarContexto();
    VOCODER.notaEnVivo(cuadroActual.escala, grado);
  }

  function telemetriaVocoder() { return VOCODER.telemetria({ granularOK }); }
  function aplicarCalibracion(a) { return VOCODER.aplicarCalibracion(a); }

  return {
    iniciar, cuadro, nivel, grave, agudo, beat, sensores,
    blip: (n) => MUSICA.blip(n),
    esaNota: () => MUSICA.esaNota(),
    tecla: () => MUSICA.tecla(),
    clicPuerta: () => MUSICA.clicPuerta(),
    ruido, soltarGranos,
    leerR27: (t) => R27.leer(t),
    callaR27: () => R27.callar(),
    coro, alternarMusica, pausarMusica, alternarVocoder, alternarDry,
    alternarMicro, afinaPrevuelo,
    panico, notaVocoder, telemetriaVocoder, aplicarCalibracion, modoCalibracion,
    get listo() { return listo; },
    get granularOK() { return granularOK; },
    get numeroBandas() { return VOCODER.numeroBandas; },
  };
})();
