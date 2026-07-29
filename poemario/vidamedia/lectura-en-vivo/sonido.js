/* VIDA MEDIA · EN VIVO — sonido.js
   todo el audio: la música chip generativa, el vocoder de canal
   (la voz de R-27), la voz de formantes que lee sola, CORO
   (speechSynthesis, la voz de tierra), la mezcla y el limiter.
   reglas: el micro seco jamás por defecto; limiter -3 dB siempre;
   sin micro, todo lo demás sigue. */

"use strict";

const SONIDO = (() => {
  let listo = false;
  let master, limiter, musicaBus, vozBus, meter;
  let mic, micGain, modBus, dryGain;
  let bandas = [];
  let carrierSum, carriers = [], otraCarriers = [], otraGain, subOsc, subGain;
  let sibGain, noiseHP;
  let vocOut, wetGain;
  let fxIn, directo, panner, ecoSend, eco, verbSend, verb, granoSend, granoPitch, grano;
  let oscuraFoll, oscuraScale;
  let bpmBase = 100;
  let cuadroActual = null;
  let redTimer = null, corridoLFO = null;

  /* instrumentos */
  let kick, snare, hat, bajo, lead, lead2, campana, clic;
  let droneOscs = [], droneFilter, droneGain;
  let leadPan, leadEcho, leadEchoSend;
  let partes = [];
  let esaNotaFija = "A4";

  /* R-27, la voz de formantes */
  const r27 = { t: 0 };

  const FORMANTES = { a: [700, 1200], e: [450, 1900], i: [300, 2300], o: [450, 800], u: [325, 700] };
  const CONSONANTES = {
    tono: { m: 250, n: 300, ñ: 350, l: 400, b: 300, d: 350, g: 400, v: 300, r: 380, y: 300, w: 325 },
    ruido: { s: 6000, z: 5500, f: 4500, j: 2500, x: 5000, c: 4800, h: 0 },
    clic: ["p", "t", "k", "q"],
  };

  async function iniciar() {
    if (listo) return true;
    try { await Tone.start(); } catch (e) { console.warn("audio: sin contexto", e); return false; }

    /* ── mezcla ── */
    master = new Tone.Gain(0.9);
    limiter = new Tone.Limiter(-3);
    master.connect(limiter);
    limiter.toDestination();
    musicaBus = new Tone.Gain(0.8).connect(master);
    vozBus = new Tone.Gain(1).connect(master);
    meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });

    /* ── el micro (modulador) ── */
    modBus = new Tone.Gain(1);
    modBus.connect(meter);
    micGain = new Tone.Gain(1.4);
    micGain.connect(modBus);
    mic = new Tone.UserMedia();
    try {
      await mic.open();
      mic.connect(micGain);
      ESTADO.micOK = true;
    } catch (e) {
      ESTADO.micOK = false;
      console.warn("micro: sin señal —la consola sigue", e);
    }

    /* ── vocoder de canal ── */
    carrierSum = new Tone.Gain(0.45);
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
    const NB = 14, fmin = 110, fmax = 6200;
    for (let i = 0; i < NB; i++) {
      const f = fmin * Math.pow(fmax / fmin, i / (NB - 1));
      const anal = new Tone.Filter({ frequency: f, type: "bandpass", Q: 6 });
      modBus.connect(anal);
      const foll = new Tone.Follower(0.035);
      anal.connect(foll);
      const boost = new Tone.Gain(9);
      foll.connect(boost);
      const bFilt = new Tone.Filter({ frequency: f, type: "bandpass", Q: 6 });
      carrierSum.connect(bFilt);
      const bGain = new Tone.Gain(0);
      bFilt.connect(bGain);
      boost.connect(bGain.gain);
      bGain.connect(vocOut);
      bandas.push({ foll });
    }
    /* sibilantes: sin eses no hay poema */
    const sibAnal = new Tone.Filter({ frequency: 5400, type: "highpass" });
    modBus.connect(sibAnal);
    const sibFoll = new Tone.Follower(0.02);
    sibAnal.connect(sibFoll);
    const sibBoost = new Tone.Gain(7);
    sibFoll.connect(sibBoost);
    const sibNoise = new Tone.Noise("white").start();
    noiseHP = new Tone.Filter({ frequency: 4800, type: "highpass" });
    sibNoise.connect(noiseHP);
    sibGain = new Tone.Gain(0);
    noiseHP.connect(sibGain);
    sibBoost.connect(sibGain.gain);
    sibGain.connect(vocOut);

    wetGain = new Tone.Gain(0);
    vocOut.connect(wetGain);

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
    eco.connect(vozBus);
    /* LA REGIÓN */
    verb = new Tone.Freeverb({ roomSize: 0.93, dampening: 1400 });
    verbSend = new Tone.Gain(0);
    fxIn.connect(verbSend);
    verbSend.connect(verb);
    verb.connect(vozBus);
    /* ESCRIBIR FUERA DE SÍ: se suelta después, hecho polvo */
    granoPitch = new Tone.PitchShift(-5);
    grano = new Tone.FeedbackDelay({ delayTime: 4, feedback: 0.45, maxDelay: 8 });
    granoSend = new Tone.Gain(0);
    fxIn.connect(granoSend);
    granoSend.connect(granoPitch);
    granoPitch.connect(grano);
    grano.connect(vozBus);
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

  /* ── las músicas de los cuadros ── */

  const MUSICAS = {
    drone: { bpm: 60, arma() { droneGain.gain.rampTo(0.5, 2); } },

    despegue: {
      bpm: 108,
      arma(c) {
        const esc = c.escala;
        /* cuenta regresiva de blips, una sola vez */
        for (let i = 0; i < 8; i++) {
          Tone.Transport.schedule((t) => { try { campana.triggerAttackRelease(nota(esc[0], 24), "16n", t); } catch (e) { /* nada */ } }, "+" + (i * 0.28));
        }
        const k = patron(0.35);
        seq("8n", (t, i) => {
          if (i % 4 === 0) kick.triggerAttackRelease("A1", "8n", t);
          if (i % 2 === 1) hat.triggerAttackRelease("16n", t);
          if (k[i]) bajo.triggerAttackRelease(esc[0], "16n", t);
        });
        const arp = [0, 2, 4, 6, 4, 2].map((i) => nota(esc[i], 12));
        let j = 0;
        seq("16n", (t) => { lead.triggerAttackRelease(arp[j % arp.length], "16n", t); j++; }, 6);
      },
    },

    loop2c: {
      bpm: 104,
      arma(c) {
        const esc = c.escala;
        const riff = melodia(esc, 8, 1).map((n) => nota(n, 12));
        seq("8n", (t, i) => {
          if (i % 4 === 0) kick.triggerAttackRelease("A1", "8n", t);
          if (i % 8 === 4) snare.triggerAttackRelease("8n", t);
          bajo.triggerAttackRelease(esc[0], "16n", t);
          lead.triggerAttackRelease(riff[i % 8], "16n", t);
        });
      },
    },

    canon: {
      bpm: 96,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2).map((n) => nota(n, 12));
        seq("8n", (t, i) => {
          lead.triggerAttackRelease(linea[i % 8], "16n", t);
          /* la sombra: el mismo dato, dos pasos después, una octava abajo */
          lead2.triggerAttackRelease(nota(linea[(i + 6) % 8], -12), "16n", t);
          if (i % 4 === 0) kick.triggerAttackRelease("A1", "8n", t);
        });
      },
    },

    seCorrige: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        seq("8n", (t, i) => {
          const buena = nota(linea[i % 8], 12);
          if (AZAR.caos() < 0.22) {
            /* se equivoca y plancha a tiempo */
            lead.triggerAttackRelease(nota(linea[i % 8], 13), "32n", t);
            lead.triggerAttackRelease(buena, "16n", t + 0.09);
          } else {
            lead.triggerAttackRelease(buena, "16n", t);
          }
          if (i % 4 === 2) hat.triggerAttackRelease("16n", t);
        });
      },
    },

    detune: {
      bpm: 88,
      arma(c) {
        const esc = c.escala;
        seq("2n", (t, i) => {
          lead.triggerAttackRelease(nota(esc[(i * 2) % 7], 12), "2n", t);
          lead2.triggerAttackRelease(nota(esc[(i * 2) % 7], 12), "2n", t);
          /* el detune se abre y se cierra */
          lead2.detune.cancelScheduledValues(t);
          lead2.detune.setValueAtTime(0, t);
          lead2.detune.linearRampToValueAtTime(35, t + 1);
          lead2.detune.linearRampToValueAtTime(0, t + 2);
        }, 8);
      },
    },

    turnos: {
      bpm: 92,
      arma(c) {
        const esc = c.escala;
        const posiciones = [-0.8, 0, 0.8];
        const linea = melodia(esc, 6, 2);
        seq("4n", (t, i) => {
          leadPan.pan.setValueAtTime(posiciones[i % 3], t);
          lead.triggerAttackRelease(nota(linea[i % 6], 12), "8n", t);
          if (i % 3 === 0) bajo.triggerAttackRelease(esc[0], "8n", t);
        }, 6);
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
        }, 8);
      },
    },

    mitades: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1);
        let stride = 1, contador = 0;
        seq("8n", (t, i) => {
          contador++;
          if (contador === 32 || contador === 64) stride *= 2;   // la mitad, la mitad
          if (i % stride !== 0) return;
          lead.triggerAttackRelease(nota(linea[i % 8], 12), "16n", t);
          if (i % (4 * stride) === 0) kick.triggerAttackRelease("A1", "8n", t);
        });
      },
    },

    sub: {
      bpm: 60,
      arma(c) {
        droneGain.gain.rampTo(0.55, 2);
        seq("1n", (t, i) => {
          bajo.triggerAttackRelease(i % 2 === 0 ? "A0" : "A1", "2n", t);
        }, 4);
      },
    },

    suspendido: {
      bpm: 72,
      arma(c) {
        const esc = c.escala;
        droneGain.gain.rampTo(0.3, 2);
        seq("1n", (t, i) => {
          /* sus2: no resuelve nunca */
          lead.triggerAttackRelease(nota(esc[0], 12), "1n", t);
          lead2.triggerAttackRelease(nota(esc[1], 12), "1n", t + 0.02);
          if (i % 2 === 1) campana.triggerAttackRelease(nota(esc[4], 24), "8n", t);
        }, 4);
      },
    },

    telar8: {
      bpm: 96,
      arma(c) {
        const esc = c.escala;
        /* la tarjeta perforada: donde hay hoyo, uno */
        const tarjeta = patron(0.55, 8);
        seq("8n", (t, i) => {
          const paso = i % 8;
          if (tarjeta[paso]) bajo.triggerAttackRelease(esc[paso % 7], "16n", t);
          else hat.triggerAttackRelease("32n", t);
        }, 8);
      },
    },

    blips: {
      bpm: 112,
      arma(c) {
        const esc = c.escala;
        esaNotaFija = nota(esc[4], 24);
        seq("16n", (t, i) => {
          if (AZAR.caos() < 0.3) lead.triggerAttackRelease(nota(esc[AZAR.ent(0, 6)], 24), "32n", t);
          if (i % 8 === 0) kick.triggerAttackRelease("A1", "8n", t);
        });
      },
    },

    corrido: {
      bpm: 90,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        seq("4n", (t, i) => {
          /* apunta a una nota y suena la de al lado */
          const idx = esc.indexOf(linea[i % 8]);
          const corrida = esc[Math.min(6, idx + 1)];
          lead.triggerAttackRelease(nota(corrida, 12), "8n", t);
          if (i % 2 === 0) hat.triggerAttackRelease("16n", t);
        }, 8);
      },
    },

    huecos: {
      bpm: 92,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1);
        seq("8n", (t, i) => {
          if (i % 4 === 3) return;          // la cuarta queda escrita afuera
          lead.triggerAttackRelease(nota(linea[i % 8], 12), "16n", t);
          if (i % 8 === 0) bajo.triggerAttackRelease(esc[0], "8n", t);
        }, 8);
      },
    },

    contratiempo: {
      bpm: 84,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 4, 2);
        const respuesta = melodia(esc, 4, 3);
        lead2.detune.value = -30;           // la portadora vieja desafina
        seq("4n", (t, i) => {
          lead.triggerAttackRelease(nota(linea[i % 4], 12), "8n", t);
          /* la otra responde en el contratiempo */
          lead2.triggerAttackRelease(respuesta[i % 4], "8n", t + Tone.Time("8n").toSeconds());
        }, 4);
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
        }, 2);
      },
    },
  };

  function armarMusica(c) {
    partes.forEach((p) => { try { p.dispose(); } catch (e) { /* nada */ } });
    partes = [];
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    droneGain.gain.rampTo(0, 1);
    leadEchoSend.gain.rampTo(0, 0.3);
    leadPan.pan.rampTo(0, 0.3);
    lead2.detune.value = 0;
    AZAR.sembrar(ESTADO.seed + ":" + c.id);
    const M = MUSICAS[c.musica] || MUSICAS.drone;
    bpmBase = M.bpm;
    Tone.Transport.bpm.value = bpmBase * (0.55 + 0.45 * pila());
    if (M.arma) M.arma(c);
    if (ESTADO.capas.musica && !ESTADO.panico) Tone.Transport.start("+0.05");
  }

  /* ── el cuadro cambia: voz y música ── */

  function cuadro(c) {
    cuadroActual = c;
    if (!listo) return;
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
    wetGain.gain.rampTo(ESTADO.capas.vocoder ? (m.wet || 0) : 0, 0.4);
    subGain.gain.rampTo(m.sub ? 0.5 : 0, 0.4);
    otraGain.gain.rampTo(m.otra ? 0.6 : 0, 0.6);
    bandas.forEach((b) => { b.foll.smoothing = m.colaLarga ? 0.5 : 0.035; });

    /* efectos de voz */
    ecoSend.gain.rampTo(m.fx === "eco" ? 0.9 : (m.repite ? 0.5 : 0), 0.4);
    eco.delayTime.rampTo(m.repite ? 0.45 : 0.9, 0.3);
    verbSend.gain.rampTo(m.fx === "reverb" ? 0.85 : 0, 0.4);
    granoSend.gain.rampTo(m.fx === "granos" ? 0.8 : 0, 0.4);
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

  function leerR27(texto) {
    if (!listo) return;
    r27.t += 1;
    const freza = 1 + (1 - pila()) * 0.8;   // con poca pila lee más despacio
    let t = Tone.now() + 0.08;
    r27.vGain.gain.cancelScheduledValues(t);
    r27.cGain.gain.cancelScheduledValues(t);
    for (const cru of texto.toLowerCase()) {
      const c = cru.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
        t += dur + 0.012;
      } else if (CONSONANTES.tono[c]) {
        const dur = 0.06 * freza;
        r27.f1.frequency.setValueAtTime(CONSONANTES.tono[c], t);
        r27.f2.frequency.setValueAtTime(CONSONANTES.tono[c] * 2.4, t);
        r27.vGain.gain.setValueAtTime(0, t);
        r27.vGain.gain.linearRampToValueAtTime(0.35, t + 0.015);
        r27.vGain.gain.linearRampToValueAtTime(0, t + dur);
        t += dur + 0.01;
      } else if (CONSONANTES.ruido[c] !== undefined) {
        if (CONSONANTES.ruido[c] === 0) { t += 0.02; continue; }   // la h no suena
        const dur = 0.07 * freza;
        r27.cFilt.frequency.setValueAtTime(CONSONANTES.ruido[c], t);
        r27.cFilt.Q.setValueAtTime(2, t);
        r27.cGain.gain.setValueAtTime(0, t);
        r27.cGain.gain.linearRampToValueAtTime(0.5, t + 0.01);
        r27.cGain.gain.linearRampToValueAtTime(0, t + dur);
        t += dur + 0.01;
      } else if (CONSONANTES.clic.includes(c)) {
        r27.cFilt.frequency.setValueAtTime(1500, t);
        r27.cFilt.Q.setValueAtTime(0.5, t);
        r27.cGain.gain.setValueAtTime(0, t);
        r27.cGain.gain.linearRampToValueAtTime(0.7, t + 0.004);
        r27.cGain.gain.linearRampToValueAtTime(0, t + 0.025);
        t += 0.045 * freza;
      } else if (c === " ") {
        t += 0.09 * freza;
      } else if (c === "," || c === ";") {
        t += 0.28 * freza;
      } else if (c === "." || c === ":") {
        t += 0.46 * freza;
      }
    }
  }

  function callaR27() {
    if (!listo) return;
    const t = Tone.now();
    r27.vGain.gain.cancelScheduledValues(t);
    r27.cGain.gain.cancelScheduledValues(t);
    r27.vGain.gain.rampTo(0, 0.05);
    r27.cGain.gain.rampTo(0, 0.05);
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

  function nivel() {
    if (!listo) return 0;
    const v = meter.getValue();
    return Math.min(1, (typeof v === "number" ? v : v[0]) * 3);
  }

  function alternarMusica() {
    ESTADO.capas.musica = !ESTADO.capas.musica;
    if (!listo) return ESTADO.capas.musica;
    if (ESTADO.capas.musica) Tone.Transport.start("+0.05");
    else Tone.Transport.pause();
    return ESTADO.capas.musica;
  }
  function alternarVocoder() {
    ESTADO.capas.vocoder = !ESTADO.capas.vocoder;
    if (listo && cuadroActual) {
      wetGain.gain.rampTo(ESTADO.capas.vocoder ? (cuadroActual.micro.wet || 0) : 0, 0.2);
    }
    return ESTADO.capas.vocoder;
  }
  function alternarDry() {
    ESTADO.capas.dry = !ESTADO.capas.dry;
    if (listo) dryGain.gain.rampTo(ESTADO.capas.dry ? 0.5 : 0, 0.2);
    return ESTADO.capas.dry;
  }

  function panico() {
    if (!listo) { ESTADO.panico = !ESTADO.panico; return ESTADO.panico; }
    if (!ESTADO.panico) {
      master.gain.cancelScheduledValues(Tone.now());
      master.gain.rampTo(0, 0.03);          // 30ms. sin fade. sin preguntas.
      Tone.Transport.pause();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      callaR27();
      ESTADO.panico = true;
    } else {
      master.gain.rampTo(0.9, 0.5);
      if (ESTADO.capas.musica) Tone.Transport.start("+0.05");
      ESTADO.panico = false;
    }
    return ESTADO.panico;
  }

  /* el vocoder en vivo: zxcvbnm = grados de la escala del cuadro */
  function notaVocoder(grado) {
    if (!listo || !cuadroActual) return;
    const esc = cuadroActual.escala;
    const raiz = Tone.Frequency(esc[grado % 7]).toFrequency();
    carriers[0].frequency.rampTo(raiz, 0.06);
    if (carriers[1]) carriers[1].frequency.rampTo(raiz * 1.5, 0.06);
    if (carriers[2]) carriers[2].frequency.rampTo(raiz * 2, 0.06);
  }

  return {
    iniciar, cuadro, nivel, blip, esaNota, tecla, clicPuerta, ruido,
    leerR27, callaR27, coro, alternarMusica, alternarVocoder, alternarDry,
    panico, notaVocoder,
    get listo() { return listo; },
  };
})();
