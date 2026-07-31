/* VIDA MEDIA · EN VIVO — sonido-musica.js
   La música chip generativa: el bastidor de instrumentos, las diecisiete
   piezas del setlist y el transporte que las sostiene.

   Todo lo que aquí ocurre se escribe desde el hilo principal con
   anticipación. Por eso las llamadas dentro de una secuencia son lo más
   baratas posible: nombres de nota memorizados, duraciones resueltas una
   sola vez al armar el cuadro y ningún objeto nuevo por semicorchea. */

"use strict";

const MUSICA = (() => {
  let listo = false;
  let musicaBus, duck, musFilter;
  let kick, snare, hat, bajo, lead, lead2, campana, clic;
  let droneOscs = [], droneFilter, droneGain;
  let leadPan, leadEcho, leadEchoSend;
  let arp, arpPan, pad, padChorus, crusher;
  let partes = [];
  let bpmBase = 100;
  let esaNotaFija = "A4";
  let motivoGuardado = null;   // el riff de TIEMPO CONTINUO vuelve roto en ACUSE
  let ultimoKick = 0;
  let ultimoClic = 0;
  let relojPila = null;
  let escalaActual = null;

  const nota = AUDIO.nota;
  const triada = AUDIO.triada;

  /* ── el bastidor ── */

  function construir(destino) {
    if (listo) return;
    musicaBus = new Tone.Gain(0.8);
    duck = new Tone.Gain(1);
    musFilter = new Tone.Filter({ frequency: 9000, type: "lowpass", Q: 0.5 });
    musicaBus.connect(duck);
    duck.connect(musFilter);
    musFilter.connect(destino);

    kick = new Tone.MembraneSynth({ octaves: 6, pitchDecay: 0.045, volume: -6 }).connect(musicaBus);
    snare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.11, sustain: 0 }, volume: -14 }).connect(musicaBus);
    /* fijo para siempre: un BiquadFilter nativo en vez de los quince
       nodos que cuesta envolverlo en Tone */
    const hatHP = AUDIO.contextoCrudo().createBiquadFilter();
    hatHP.type = "highpass";
    hatHP.frequency.value = 8000;
    Tone.connect(hatHP, musicaBus);
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
    /* Nunca suenan más de una tríada con su cola. El techo de treinta y
       dos voces de Tone sólo sirve para que un cuadro nervioso deje
       sembrada media orquesta de osciladores que ya no canta. */
    pad.maxPolyphony = 8;
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

    /* el bpm sigue a la pila: la música piensa más despacio */
    relojPila = setInterval(() => {
      if (!listo || Tone.Transport.state !== "started") return;
      Tone.Transport.bpm.rampTo(bpmBase * (0.55 + 0.45 * pila()), 0.8);
    }, 1000);

    listo = true;
  }

  /* MATERIA OSCURA engancha la voz al corte del drone */
  function moduladorDrone() { return droneFilter && droneFilter.frequency; }

  /* ── helpers ── */

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
        const graves = [nota(esc[0], -12), nota(esc[0], 0)];
        const tri = triada(esc, 0, 24);
        let paso = 0;
        seq("8n", (t, i) => {
          if (i % 4 === 0) golpeKick(t);
          if (i % 8 === 4) snare.triggerAttackRelease("8n", t);
          if (i % 2 === 1) hat.triggerAttackRelease("32n", t);
          bajo.triggerAttackRelease(graves[i % 8 === 6 ? 1 : 0], "16n", t);
          lead.triggerAttackRelease(riff[i % 8], "16n", t);
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
        const alta = linea.map((n) => nota(n, 12));
        const baja = linea.map((n) => nota(n, -12));
        const acorde = triada(esc, 0, 12);
        seq("8n", (t, i) => {
          lead.triggerAttackRelease(alta[i % 8], "16n", t);
          lead2.triggerAttackRelease(linea[(i + 6) % 8], "16n", t, 0.6);
          bajo.triggerAttackRelease(baja[7 - (i % 8)], "16n", t, 0.7);
          if (i % 4 === 0) golpeKick(t);
          if (i % 8 === 4) hat.triggerAttackRelease("32n", t);
        });
        seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.3); }, 1);
      },
    },

    seCorrige: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 2);
        const buenas = linea.map((n) => nota(n, 12));
        const malas = linea.map((n) => nota(n, 13));
        const prog = [nota(esc[0], -12), nota(esc[3], -12)];
        let paso = 0;
        seq("8n", (t, i) => {
          const g = paso % 16 < 8 ? 0 : 1;
          if (AZAR.caos() < 0.22) {
            /* se equivoca, plancha, y el snare firma el checksum */
            lead.triggerAttackRelease(malas[i % 8], "32n", t);
            lead.triggerAttackRelease(buenas[i % 8], "16n", t + 0.09);
            snare.triggerAttackRelease("32n", t + 0.09, 0.4);
          } else {
            lead.triggerAttackRelease(buenas[i % 8], "16n", t);
          }
          if (i % 2 === 0) bajo.triggerAttackRelease(prog[g], "16n", t);
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
        const acordes = prog.map((g) => triada(esc, g, 12));
        const agudas = prog.map((g) => nota(esc[g], 12));
        let compas = 0;
        seq("1m", (t) => {
          pad.triggerAttackRelease(acordes[compas % 4], "1m", t, 0.5);
          /* el filtro maestro abre y cierra como un iris */
          musFilter.frequency.rampTo(1100 + AZAR.caos() * 4200, 3.4);
          compas++;
        }, 1);
        seq("2n", (t, i) => {
          const n = agudas[Math.floor(i / 2) % 4];
          lead.triggerAttackRelease(n, "2n", t);
          lead2.triggerAttackRelease(n, "2n", t);
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
        const linea = melodia(esc, 6, 2).map((n) => nota(n, 12));
        const tri = triada(esc, 0, 24);
        const grave = nota(esc[0], -12);
        let paso = 0;
        seq("8n", (t, i) => {
          const turno = Math.floor(paso / 4) % 3;
          leadPan.pan.setValueAtTime(pos[turno], t);
          arpPan.pan.setValueAtTime(pos[(turno + 2) % 3], t);
          if (i % 2 === 0) lead.triggerAttackRelease(linea[(i / 2) % 6], "16n", t);
          arp.triggerAttackRelease(tri[paso % 3], "32n", t, 0.7);
          if (i % 8 === 0) { golpeKick(t); bajo.triggerAttackRelease(grave, "8n", t); }
          paso++;
        });
      },
    },

    pingEco: {
      bpm: 76,
      arma(c) {
        const esc = c.escala;
        const grave = nota(esc[0], -12);
        const acorde = triada(esc, 5, 0);
        leadEchoSend.gain.rampTo(0.9, 0.5);
        seq("2n", (t, i) => {
          if (i % 2 === 0) {
            lead.triggerAttackRelease(nota(esc[AZAR.ent(2, 6)], 12), "16n", t);
            Tone.Draw.schedule(() => { if (typeof NAVE !== "undefined") NAVE.ping(); }, t);
          }
          /* el bajo contesta tarde, como el eco que hace de reloj */
          if (i % 4 === 3) bajo.triggerAttackRelease(grave, "4n", t);
        }, 8);
        seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.25); }, 1);
      },
    },

    mitades: {
      bpm: 100,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1);
        const octavas = { 12: linea.map((n) => nota(n, 12)), 0: linea.map((n) => nota(n, 0)), "-12": linea.map((n) => nota(n, -12)) };
        const grave = nota(esc[0], -12);
        const acorde = triada(esc, 0, 0);
        let stride = 1, contador = 0, octava = 12;
        seq("8n", (t, i) => {
          contador++;
          if (contador === 32 || contador === 64) { stride *= 2; octava -= 12; }
          if (i % stride !== 0) return;
          lead.triggerAttackRelease(octavas[octava][i % 8], "16n", t);
          if (i % (4 * stride) === 0) golpeKick(t);
          if (i % (2 * stride) === 0) bajo.triggerAttackRelease(grave, "16n", t);
        });
        /* el pad aguanta la respiración mientras todo se divide */
        seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.3); }, 1);
      },
    },

    sub: {
      bpm: 60,
      arma(c) {
        const destello = nota(c.escala[6], 36);
        droneGain.gain.rampTo(0.55, 2);
        seq("1n", (t, i) => {
          bajo.triggerAttackRelease(i % 2 === 0 ? "A0" : "E1", "2n", t);
          /* el gruñido FM: la masa que no brilla */
          if (i % 4 === 2) campana.triggerAttackRelease("A1", "1n", t, 0.4);
          if (AZAR.caos() < 0.1) campana.triggerAttackRelease(destello, "16n", t, 0.08);
        }, 4);
      },
    },

    suspendido: {
      bpm: 72,
      arma(c) {
        const esc = c.escala;
        /* sus2: la palabra que no resuelve */
        const sus2 = [nota(esc[0], 12), nota(esc[1], 12), nota(esc[4], 12)];
        const campanas = [nota(esc[1], 24), nota(esc[4], 24)];
        droneGain.gain.rampTo(0.3, 2);
        seq("1m", (t) => {
          pad.triggerAttackRelease(sus2, "1m", t, 0.5);
          musFilter.frequency.rampTo(900 + AZAR.caos() * 2600, 3.2);
        }, 1);
        seq("2n", (t, i) => {
          if (i % 2 === 1) campana.triggerAttackRelease(AZAR.el(campanas), "8n", t, 0.3);
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
        const graves = esc.map((n) => nota(n, -12));
        const agudas = esc.map((n) => nota(n, 12));
        const acorde = triada(esc, 0, 0);
        seq("8n", (t, i) => {
          const p = i % 8;
          if (i % 16 === 0) golpeKick(t);
          if (tarjetaA[p]) bajo.triggerAttackRelease(graves[p % 7], "16n", t);
          else hat.triggerAttackRelease("32n", t, red ? 0.9 : 0.5);
          if (tarjetaB[p]) arp.triggerAttackRelease(agudas[(p * 2) % 7], "32n", t);
        });
        if (nube) seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.35); }, 1);
      },
    },

    blips: {
      bpm: 112,
      arma(c) {
        const esc = c.escala;
        const chispas = esc.map((n) => nota(n, 24));
        const grave = nota(esc[0], -12);
        esaNotaFija = chispas[4];
        let paso = 0;
        seq("16n", (t, i) => {
          if (AZAR.caos() < 0.3) arp.triggerAttackRelease(chispas[AZAR.ent(0, 6)], "32n", t);
          if (i % 8 === 0) golpeKick(t);
          if (i % 8 === 4) bajo.triggerAttackRelease(grave, "16n", t);
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
        /* apunta a una nota y suenan las de al lado: melodía y bajo */
        const corridas = linea.map((n) => nota(esc[Math.min(6, esc.indexOf(n) + 1)], 12));
        const vecinas = linea.map((n) => nota(esc[(esc.indexOf(n) + 1) % 7], -12));
        const retraso = Tone.Time("8n").toSeconds();
        seq("4n", (t, i) => {
          lead.triggerAttackRelease(corridas[i % 8], "8n", t);
          bajo.triggerAttackRelease(vecinas[i % 8], "8n", t + retraso);
          if (i % 2 === 0) hat.triggerAttackRelease("16n", t);
          if (i % 4 === 0) golpeKick(t);
        }, 8);
      },
    },

    huecos: {
      bpm: 92,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 8, 1).map((n) => nota(n, 12));
        const grave = nota(esc[0], -12);
        const acorde = triada(esc, 3, 0);
        seq("8n", (t, i) => {
          if (i % 4 === 3) { hat.triggerAttackRelease("64n", t, 0.15); return; }   // el hueco se oye
          lead.triggerAttackRelease(linea[i % 8], "16n", t);
          if (i % 8 === 0) { golpeKick(t); bajo.triggerAttackRelease(grave, "8n", t); }
        }, 8);
        seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.25); }, 1);
      },
    },

    contratiempo: {
      bpm: 84,
      arma(c) {
        const esc = c.escala;
        const linea = melodia(esc, 4, 2).map((n) => nota(n, 12));
        const respuesta = melodia(esc, 4, 3);
        const grave = nota(esc[0], -12);
        const acorde = triada(esc, 5, 0);
        const retraso = Tone.Time("8n").toSeconds();
        lead2.detune.value = -30;
        leadEchoSend.gain.rampTo(0.4, 0.5);
        seq("4n", (t, i) => {
          lead.triggerAttackRelease(linea[i % 4], "8n", t);
          lead2.triggerAttackRelease(respuesta[i % 4], "8n", t + retraso);
          if (i % 2 === 0) bajo.triggerAttackRelease(grave, "8n", t);
          if (i % 4 === 0) golpeKick(t);
        }, 4);
        seq("1m", (t) => { pad.triggerAttackRelease(acorde, "1m", t, 0.2); }, 1);
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
          const memoria = motivoGuardado;
          let j = 0;
          seq("2n", (t) => {
            if (AZAR.caos() < 0.5) { j++; return; }
            lead2.triggerAttackRelease(memoria[j % 8], "4n", t, 0.15);
            j++;
          }, 8);
        }
      },
    },
  };

  /* ── armar el cuadro ── */

  function arma(c, calibrando) {
    if (!listo) return;
    partes.forEach((p) => { try { p.dispose(); } catch (e) { /* nada */ } });
    partes = [];
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    const t = AUDIO.ahora();
    AUDIO.cancelaParametro(kick.volume, t, true);
    kick.volume.linearRampToValueAtTime(-6, t + 0.04);
    AUDIO.cancelaParametro(duck.gain, t, true);
    duck.gain.linearRampToValueAtTime(1, t + 0.04);
    AUDIO.cancelaParametro(lead2.detune, t, true);
    lead2.detune.linearRampToValueAtTime(0, t + 0.04);
    droneGain.gain.rampTo(0, 1);
    leadEchoSend.gain.rampTo(0, 0.3);
    try { pad.releaseAll(); } catch (e) { /* nada */ }
    escalaActual = c.escala;
    volumen(calibrando ? 0.12 : 0.8, 0.12);
    musFilter.frequency.rampTo(9000, 0.5);
    leadPan.pan.rampTo(0, 0.3);
    AZAR.sembrar(ESTADO.seed + ":" + c.id);
    const M = MUSICAS[c.musica] || MUSICAS.drone;
    bpmBase = M.bpm;
    Tone.Transport.bpm.value = bpmBase * (0.55 + 0.45 * pila());
    if (M.arma) M.arma(c);
    if (ESTADO.capas.musica && !ESTADO.panico) Tone.Transport.start("+0.05");
  }

  /* ── mezcla y control ── */

  function volumen(v, tiempo) {
    if (!listo) return;
    musicaBus.gain.rampTo(ESTADO.capas.musica ? v : 0, tiempo || 0.3);
  }

  function alternar() {
    ESTADO.capas.musica = !ESTADO.capas.musica;
    if (!listo) return ESTADO.capas.musica;
    AUDIO.asegurarContexto();
    if (ESTADO.capas.musica) {
      musicaBus.gain.rampTo(0.8, 0.12);
      Tone.Transport.start("+0.05");
    } else {
      musicaBus.gain.rampTo(0, 0.08);
      Tone.Transport.pause();
    }
    return ESTADO.capas.musica;
  }

  function pausar() { if (listo) Tone.Transport.pause(); }

  function reanudar() {
    if (listo && ESTADO.capas.musica) Tone.Transport.start("+0.05");
  }

  /* ── gestos chicos ── */

  function blip(n) {
    if (!listo || !ESTADO.capas.musica) return;
    const esc = escalaActual || SETLIST[0].escala;
    try { lead.triggerAttackRelease(nota(esc[n % 7], 24), "32n"); } catch (e) { /* nada */ }
  }

  function esaNota() {
    if (!listo || !ESTADO.capas.musica) return;
    try { campana.triggerAttackRelease(esaNotaFija, "16n"); } catch (e) { /* nada */ }
  }

  function tecla() {
    if (!listo || !ESTADO.capas.musica || ESTADO.panico) return;
    const t = Tone.now();
    if (t - ultimoClic < 0.05) return;
    ultimoClic = t;
    if (AZAR.caos() < 0.5) { try { clic.triggerAttackRelease("64n"); } catch (e) { /* nada */ } }
  }

  function clicPuerta() {
    if (!listo) return;
    try { campana.triggerAttackRelease("A5", "32n"); } catch (e) { /* nada */ }
  }

  function beat() {
    return Math.max(0, 1 - (performance.now() - ultimoKick) / 400);
  }

  return {
    construir, moduladorDrone, arma, volumen, alternar, pausar, reanudar,
    blip, esaNota, tecla, clicPuerta, beat,
    get listo() { return listo; },
  };
})();
