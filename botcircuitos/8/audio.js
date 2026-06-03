'use strict';

// =============================================================
//   AUDIO  ::  motor sónico de circuito.live v8
//
//   Capas (cada una conmutable):
//     1. circuito        — bleeps cortos, ping de cita
//     2. percusión       — caja de ritmos eléctrica (Tone.Transport)
//     3. melódico        — pad armónico, arpegio, bajo
//     4. textural        — drone, ruido con S&H LFO
//     5. voz híbrida     — Web Speech + vocoder + ring mod + eco
//
//   Cada escena visual define su propio modo musical, progresión,
//   color de drone y estilo de arpegio en SCENE_AUDIO; el cambio de
//   escena dispara un sweep/riser y reasigna toda la armonía.
//
//   Contrato público (lo que llama engine.js):
//     initAudio(), toggleSound(), syncPercTempo(),
//     audioDiagram(), audioCita(), audioSceneChange(name), speak(text)
//     AUDIO.ready / .enabled / .perc / .melody / .voice
// =============================================================

const AUDIO = {
  ready: false,
  initing: false,
  enabled: true,
  perc: true,
  melody: true,
  voice: true,
  // contadores de tiempo para throttling
  last: { diag: 0, cita: 0, speakEnd: 0, sceneChange: 0 },
  speakTimer: null,
  // callbacks que el engine puede registrar para spawns cuantizados al beat
  onBeat: null,
  onMeasure: null,
  speakingNow: false,
  currentVoiceMode: 'normal',
  // sub-objetos asignados en initAudio()
  n: {},
  // estado armónico vivo — lo mantiene chordSeq
  mus: {
    sceneName: 'terminal',
    rootMidi: 45,           // A2
    modeSemis: [0,2,3,5,7,8,10],
    prog: [0, 5, 3, 4],
    progStep: 0,
    chord: [],              // notas MIDI del chord actual
    arpStyle: 'up',
    arpRate: '8n',
    arpIdx: 0,
  },
};

// ────────────────────────────────────────────────────────────
//   CONFIGURACIÓN MUSICAL POR ESCENA
// ────────────────────────────────────────────────────────────
// rootName  → nota fundamental (string Tone)
// mode      → semitonos del modo (0 = root)
// prog      → progresión de grados (0..mode.length-1) en compases
// arpStyle  → 'up' | 'down' | 'updown' | 'random' | 'plucked' | 'static'
// arpRate   → '32n' | '16n' | '8n' | '4n' | '2n'
// drone     → octava abajo del root (string Tone)
// padQuality→ 'minor7' | 'major7' | 'sus2' | 'dim' | 'add9' | 'open5'
// chorus    → wet del chorus en el pad (0..1)
const SCENE_AUDIO = {
  // industrial menor, lento, suspendido
  terminal: { rootName:'A2', mode:[0,2,3,5,7,8,10], prog:[0,5,3,4],   arpStyle:'up',     arpRate:'8n',  drone:'A1', padQuality:'minor7', chorus:0.35 },
  // dórico, ritmo medio, abierto
  mosaico:  { rootName:'D2', mode:[0,2,3,5,7,9,10], prog:[0,3,5,0],   arpStyle:'updown', arpRate:'16n', drone:'D1', padQuality:'minor7', chorus:0.45 },
  // diminuto/frigio, denso, agitado
  glitch:   { rootName:'C2', mode:[0,1,3,5,6,8,10], prog:[0,0,6,0],   arpStyle:'random', arpRate:'32n', drone:'C1', padQuality:'dim',    chorus:0.20 },
  // pentatónico, sostenido, contemplativo
  drone:    { rootName:'E2', mode:[0,3,5,7,10],     prog:[0,0,0,0],   arpStyle:'static', arpRate:'2n',  drone:'E1', padQuality:'sus2',   chorus:0.55 },
  // mayor luminoso, declamado
  cita:     { rootName:'F2', mode:[0,2,4,5,7,9,11], prog:[0,5,3,4],   arpStyle:'down',   arpRate:'4n',  drone:'F1', padQuality:'major7', chorus:0.40 },
  // menor nervioso, ágil
  ticker:   { rootName:'B2', mode:[0,2,3,5,7,8,10], prog:[0,3,4,4],   arpStyle:'random', arpRate:'16n', drone:'B1', padQuality:'minor7', chorus:0.30 },
  // frigio dominante (medio-oriente eléctrico)
  feedback: { rootName:'G2', mode:[0,1,4,5,7,8,11], prog:[0,6,3,0],   arpStyle:'updown', arpRate:'8n',  drone:'G1', padQuality:'minor7', chorus:0.40 },
  // pentatónico mayor, etéreo
  memoria:  { rootName:'C2', mode:[0,2,4,7,9],      prog:[0,4,1,0],   arpStyle:'plucked',arpRate:'2n',  drone:'C1', padQuality:'add9',   chorus:0.60 },
  // hexatónico con tritono, agresivo
  burst:    { rootName:'A2', mode:[0,2,3,5,6,8,11], prog:[0,0,0,0],   arpStyle:'random', arpRate:'32n', drone:'A1', padQuality:'open5',  chorus:0.15 },
};

// ────────────────────────────────────────────────────────────
//   PATRONES DE PERCUSIÓN
// ────────────────────────────────────────────────────────────
// 'x' = golpe, '.' = silencio · 16 pasos por compás
function patBeats(s) { return [...s].map(c => c === 'x' || c === 'X'); }

const PERC_PATTERNS = {
  terminal: { bpm: 96,  kick:patBeats('x.......x.......'), hat:patBeats('..x...x...x...x.'), rim:patBeats('....x.......x...'), zap:patBeats('................') },
  mosaico:  { bpm: 112, kick:patBeats('x...x...x...x...'), hat:patBeats('x.x.x.x.x.x.x.x.'), rim:patBeats('....x.......x...'), zap:patBeats('........x.......') },
  glitch:   { bpm: 134, kick:patBeats('x..x..x.x..x..x.'), hat:patBeats('xxxxxxxxxxxxxxxx'), rim:patBeats('..x..x..x..x..x.'), zap:patBeats('x...x...x...x..x') },
  drone:    { bpm: 60,  kick:patBeats('x...............'), hat:patBeats('........x.......'), rim:patBeats('................'), zap:patBeats('................') },
  cita:     { bpm: 82,  kick:patBeats('x.......x.......'), hat:patBeats('....x.......x...'), rim:patBeats('................'), zap:patBeats('................') },
  ticker:   { bpm: 126, kick:patBeats('x...x...x...x...'), hat:patBeats('x.x.x.x.x.x.x.x.'), rim:patBeats('..x...x...x...x.'), zap:patBeats('................') },
  feedback: { bpm: 104, kick:patBeats('x...x.....x...x.'), hat:patBeats('..x.x...x.x...x.'), rim:patBeats('x.......x.......'), zap:patBeats('............x...') },
  memoria:  { bpm: 68,  kick:patBeats('x.............x.'), hat:patBeats('....x.......x...'), rim:patBeats('................'), zap:patBeats('................') },
  burst:    { bpm: 152, kick:patBeats('x.xx..x.x.xx.x.x'), hat:patBeats('xxxxxxxxxxxxxxxx'), rim:patBeats('x.x.x.x.x.x.x.x.'), zap:patBeats('..x..x..x..x..x.') },
};

function percBpm() {
  const base = (PERC_PATTERNS[scene.name] || PERC_PATTERNS.terminal).bpm;
  return Math.max(48, Math.min(200, base * (0.7 + 0.3 * tempo)));
}

function syncPercTempo() {
  if (AUDIO.ready && typeof Tone !== 'undefined') Tone.Transport.bpm.rampTo(percBpm(), 0.4);
}

// ────────────────────────────────────────────────────────────
//   HELPERS MUSICALES (todo en MIDI, conversión al final)
// ────────────────────────────────────────────────────────────
const NOTE_TO_SEMI = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };

function nameToMidi(name) {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!m) return 60;
  return NOTE_TO_SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
}
function midiToName(midi) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const oct = Math.floor(midi / 12) - 1;
  return names[((midi % 12) + 12) % 12] + oct;
}

// dado root MIDI + modo + grado, devuelve un acorde de 3-4 notas
function buildChord(rootMidi, modeSemis, degree, quality) {
  const scale = modeSemis;
  const i = ((degree % scale.length) + scale.length) % scale.length;
  const base = rootMidi + scale[i];
  const get = (step) => rootMidi + scale[((i + step) % scale.length + scale.length) % scale.length] + (Math.floor((i + step) / scale.length) * 12);
  switch (quality) {
    case 'minor7':  return [base, get(2), get(4), get(6)];
    case 'major7':  return [base, get(2), get(4), get(6)];
    case 'sus2':    return [base, get(1), get(4)];
    case 'dim':     return [base, get(2), get(4)];
    case 'add9':    return [base, get(2), get(4), get(8)];
    case 'open5':   return [base, get(4), base + 12];
    default:        return [base, get(2), get(4)];
  }
}

// notas de la escala completa en 2 octavas a partir de un MIDI base
function scaleNotes(rootMidi, modeSemis, octaves = 2) {
  const out = [];
  for (let o = 0; o < octaves; o++) for (const s of modeSemis) out.push(rootMidi + s + o * 12);
  return out;
}

// ────────────────────────────────────────────────────────────
//   INICIALIZACIÓN — todo el grafo se construye al primer gesto
// ────────────────────────────────────────────────────────────
async function initAudio() {
  if (AUDIO.ready || AUDIO.initing || typeof Tone === 'undefined') return;
  AUDIO.initing = true;
  try { await Tone.start(); }
  catch (e) { AUDIO.initing = false; return; }

  // ── MASTER CHAIN ──────────────────────────────────────────
  const limiter    = new Tone.Limiter(-3).toDestination();
  const masterComp = new Tone.Compressor({ threshold: -18, ratio: 2.5, attack: 0.005, release: 0.18 }).connect(limiter);
  const masterRev  = new Tone.Reverb({ decay: 2.4, wet: 0.20 }).connect(masterComp);
  masterRev.generate().catch(() => {});
  const masterChor = new Tone.Chorus({ frequency: 0.6, delayTime: 3.5, depth: 0.35, wet: 0 }).connect(masterRev).start();
  const masterBus  = new Tone.Gain(0.72).connect(masterChor);

  // ── CIRCUITO :: bleep + blip + delay ──────────────────────
  const delay       = new Tone.FeedbackDelay({ delayTime: 0.165, feedback: 0.30, wet: 0.18 }).connect(masterBus);
  const bleepFilter = new Tone.Filter({ type: 'lowpass', frequency: 3400, Q: 1.4 }).connect(masterBus);
  bleepFilter.connect(delay);
  const bleep = new Tone.Synth({
    volume: -13,
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.085, sustain: 0, release: 0.05 },
  }).connect(bleepFilter);
  const blip = new Tone.Synth({
    volume: -19,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.55, sustain: 0, release: 0.5 },
  }).connect(bleepFilter);

  // ── PAD ARMÓNICO :: PolySynth AM + filtro abierto ─────────
  // sidechainGain baja con cada kick para hacer pumping
  const sidechainGain = new Tone.Gain(1).connect(masterBus);
  const padFilter = new Tone.Filter({ type: 'lowpass', frequency: 1800, Q: 0.5 }).connect(sidechainGain);
  const pad = new Tone.PolySynth(Tone.AMSynth, {
    maxPolyphony: 6,
    volume: -22,
    harmonicity: 1.5,
    oscillator: { type: 'sine' },
    modulation: { type: 'sawtooth' },
    envelope:        { attack: 1.2, decay: 0.4, sustain: 0.5, release: 1.4 },
    modulationEnvelope: { attack: 1.5, decay: 0.3, sustain: 0.6, release: 1.0 },
  }).connect(padFilter);
  // LFO lento sobre el cutoff del pad
  const padLfo = new Tone.LFO({ frequency: 0.07, min: 900, max: 2600, type: 'sine' });
  padLfo.connect(padFilter.frequency).start();

  // ── ARPEGIO :: MonoSynth con filter envelope (pluck) ──────
  const arpDelay  = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.32, wet: 0.30 }).connect(masterBus);
  const arpFilter = new Tone.Filter({ type: 'lowpass', frequency: 2400, Q: 2 }).connect(masterBus);
  arpFilter.connect(arpDelay);
  const arp = new Tone.MonoSynth({
    volume: -16,
    oscillator: { type: 'triangle' },
    envelope:       { attack: 0.003, decay: 0.18, sustain: 0.0, release: 0.18 },
    filterEnvelope: { attack: 0.003, decay: 0.12, sustain: 0.0, release: 0.18,
                      baseFrequency: 250, octaves: 3.2, exponent: 2 },
  }).connect(arpFilter);

  // ── BAJO :: FMSynth subgrave ──────────────────────────────
  const bassFilter = new Tone.Filter({ type: 'lowpass', frequency: 600, Q: 1 }).connect(masterBus);
  const bass = new Tone.FMSynth({
    volume: -14,
    harmonicity: 1.0, modulationIndex: 6,
    oscillator: { type: 'sine' },
    modulation: { type: 'square' },
    envelope:           { attack: 0.005, decay: 0.18, sustain: 0.85, release: 0.25 },
    modulationEnvelope: { attack: 0.01,  decay: 0.4,  sustain: 0.0,  release: 0.2 },
  }).connect(bassFilter);

  // ── DRONE :: 2 osciladores ligeramente desafinados + LFO ──
  const droneBus    = new Tone.Gain(0.55).connect(masterBus);
  const dronePan    = new Tone.Panner(0).connect(droneBus);
  const droneFilter = new Tone.Filter({ type: 'lowpass', frequency: 1200, Q: 0.8 }).connect(dronePan);
  const droneOsc1 = new Tone.Oscillator({ frequency: 55,   type: 'sawtooth', volume: -22 }).connect(droneFilter);
  const droneOsc2 = new Tone.Oscillator({ frequency: 55.4, type: 'sine',     volume: -16 }).connect(droneFilter);
  droneOsc1.start(); droneOsc2.start();
  // LFO de pan lento
  const dronePanLfo = new Tone.LFO({ frequency: 0.05, min: -0.7, max: 0.7, type: 'sine' });
  dronePanLfo.connect(dronePan.pan).start();
  // LFO sobre el cutoff del drone
  const droneFiltLfo = new Tone.LFO({ frequency: 0.11, min: 500, max: 2200, type: 'sine' });
  droneFiltLfo.connect(droneFilter.frequency).start();

  // ── RUIDO TEXTURAL :: pink + bandpass con Sample & Hold ───
  const noiseBus    = new Tone.Gain(0.35).connect(masterBus);
  const noiseFilter = new Tone.Filter({ type: 'bandpass', frequency: 1600, Q: 6 }).connect(noiseBus);
  const noise = new Tone.Noise({ type: 'pink', volume: -34 }).connect(noiseFilter);
  noise.start();
  // S&H simulado :: saltos aleatorios del cutoff cada 280ms
  const shTimer = setInterval(() => {
    if (!AUDIO.ready) return;
    const f = 600 + Math.random() * 3400;
    noiseFilter.frequency.cancelScheduledValues(Tone.now());
    noiseFilter.frequency.setValueAtTime(f, Tone.now());
  }, 280);

  // ── PERCUSIÓN (idéntica a v7, retorquilada) ───────────────
  const percBus = new Tone.Gain(0.78).connect(masterBus);
  const kick = new Tone.MembraneSynth({
    volume: -7, pitchDecay: 0.045, octaves: 5,
    envelope: { attack: 0.001, decay: 0.34, sustain: 0, release: 0.35 },
  }).connect(percBus);
  const hatFilter = new Tone.Filter({ type: 'highpass', frequency: 7000 }).connect(percBus);
  const hat = new Tone.NoiseSynth({
    volume: -25, noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.035, sustain: 0 },
  }).connect(hatFilter);
  const rim = new Tone.MetalSynth({
    volume: -28, frequency: 240, harmonicity: 5.1, modulationIndex: 32,
    resonance: 3200, octaves: 1.3,
    envelope: { attack: 0.001, decay: 0.07, release: 0.02 },
  }).connect(percBus);
  const zapFilter = new Tone.Filter({ type: 'bandpass', frequency: 1200, Q: 3 }).connect(percBus);
  const zap = new Tone.NoiseSynth({
    volume: -20, noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0 },
  }).connect(zapFilter);

  // ── VOCODER BED :: AM carrier + banco formante + ring + eco
  const vocMaster = new Tone.Gain(0).connect(masterBus);
  const vocEcho   = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.30, wet: 0.35 }).connect(vocMaster);
  // AMOscillator hace de carrier con ring-mod-ish (harmonicity controla el carácter)
  const carrier = new Tone.AMOscillator({
    frequency: 82, type: 'sawtooth', modulationType: 'sine',
    harmonicity: 1.5, volume: -4,
  });
  const bands = [];
  for (const f of [320, 1100, 2700]) {
    const bp = new Tone.Filter({ type: 'bandpass', frequency: f, Q: 8 });
    const g  = new Tone.Gain(0).connect(vocMaster);
    carrier.connect(bp);
    bp.connect(g);
    bp.connect(vocEcho);
    bands.push(g);
  }
  carrier.start();

  // ── SECUENCIAS ────────────────────────────────────────────
  // percSeq :: 16 pasos por compás, sigue patrón de la escena
  const percSeq = new Tone.Sequence((time, step) => {
    if (!AUDIO.enabled || !AUDIO.perc) return;
    const p = PERC_PATTERNS[scene.name] || PERC_PATTERNS.terminal;
    if (p.kick[step]) {
      kick.triggerAttackRelease('C1', '8n', time);
      // sidechain: agacha el pad y arp
      sidechainGain.gain.cancelScheduledValues(time);
      sidechainGain.gain.setValueAtTime(0.35, time);
      sidechainGain.gain.exponentialRampToValueAtTime(1, time + 0.22);
    }
    if (p.hat[step])  hat.triggerAttackRelease('16n', time, 0.6 + Math.random() * 0.4);
    if (p.rim[step])  rim.triggerAttackRelease('32n', time, 0.8);
    if (p.zap[step]) {
      zapFilter.frequency.cancelScheduledValues(time);
      zapFilter.frequency.setValueAtTime(2600, time);
      zapFilter.frequency.exponentialRampToValueAtTime(220, time + 0.13);
      zap.triggerAttackRelease('16n', time);
    }
  }, [...Array(16).keys()], '16n');
  percSeq.start(0);

  // chordSeq :: cambia el acorde cada 2 compases ('1m' = 1 measure)
  const chordSeq = new Tone.Loop((time) => {
    if (!AUDIO.enabled || !AUDIO.melody) return;
    const cfg = SCENE_AUDIO[scene.name] || SCENE_AUDIO.terminal;
    const degree = cfg.prog[AUDIO.mus.progStep % cfg.prog.length];
    AUDIO.mus.progStep++;
    AUDIO.mus.chord = buildChord(AUDIO.mus.rootMidi, AUDIO.mus.modeSemis, degree, cfg.padQuality);
    const chordNames = AUDIO.mus.chord.map(midiToName);
    pad.releaseAll(time);
    pad.triggerAttackRelease(chordNames, '2m', time, 0.7);
    // bajo en la fundamental, octava abajo
    const bassMidi = AUDIO.mus.chord[0] - 12;
    bass.triggerAttackRelease(midiToName(bassMidi), '2m', time, 0.85);
  }, '2m');
  chordSeq.start(0);

  // arpSeq :: arpegia el acorde actual en estilo de escena
  let arpStep = 0;
  const arpSeq = new Tone.Loop((time) => {
    if (!AUDIO.enabled || !AUDIO.melody) return;
    const cfg = SCENE_AUDIO[scene.name] || SCENE_AUDIO.terminal;
    if (cfg.arpStyle === 'static') return;
    // throttle :: en escenas rápidas (32n a alto BPM) saltamos pulsos para no saturar
    const dense = (cfg.arpRate === '32n' && Tone.Transport.bpm.value > 125);
    if (dense && Math.random() < 0.45) { arpStep++; return; }
    const notes = scaleNotes(AUDIO.mus.rootMidi + 12, AUDIO.mus.modeSemis, 2);
    let idx;
    switch (cfg.arpStyle) {
      case 'down':    idx = notes.length - 1 - (arpStep % notes.length); break;
      case 'updown': {
        const span = (notes.length - 1) * 2;
        const p = arpStep % span;
        idx = p < notes.length ? p : span - p;
        break;
      }
      case 'random':  idx = (Math.random() * notes.length) | 0; break;
      case 'plucked': idx = arpStep % 2 === 0 ? 0 : (Math.random() * notes.length) | 0; break;
      case 'up':
      default:        idx = arpStep % notes.length;
    }
    arpStep++;
    if (Math.random() > 0.22) {
      arp.triggerAttackRelease(midiToName(notes[idx]), '32n', time, 0.55 + Math.random() * 0.3);
    }
  }, '8n');  // el rate base se ajusta en audioSceneChange
  arpSeq.start(0);

  // beatLoop / measureLoop :: callbacks expuestos al engine para cuantizar spawns
  // se programan en el thread visual con Tone.Draw para evitar drift
  const beatLoop = new Tone.Loop((time) => {
    if (AUDIO.onBeat) Tone.Draw.schedule(() => { try { AUDIO.onBeat(); } catch (e) {} }, time);
  }, '4n').start(0);
  const measureLoop = new Tone.Loop((time) => {
    if (AUDIO.onMeasure) Tone.Draw.schedule(() => { try { AUDIO.onMeasure(); } catch (e) {} }, time);
  }, '1m').start(0);

  // droneSeq :: mueve la fundamental del drone cada 8 compases
  const droneSeq = new Tone.Loop((time) => {
    if (!AUDIO.enabled || !AUDIO.melody) return;
    const cfg = SCENE_AUDIO[scene.name] || SCENE_AUDIO.terminal;
    const base = nameToMidi(cfg.drone);
    const offsets = [0, 7, -5, 5, -7];
    const off = offsets[(Math.random() * offsets.length) | 0];
    const freq = Tone.Frequency(midiToName(base + off)).toFrequency();
    droneOsc1.frequency.rampTo(freq, 1.2);
    droneOsc2.frequency.rampTo(freq * 1.0073, 1.2);
  }, '8m');
  droneSeq.start(0);

  Tone.Transport.bpm.value = percBpm();
  Tone.Transport.start();

  // Guardar referencias
  AUDIO.n = {
    limiter, masterComp, masterRev, masterChor, masterBus,
    delay, bleepFilter, bleep, blip,
    sidechainGain, padFilter, pad, padLfo,
    arpDelay, arpFilter, arp,
    bassFilter, bass,
    droneBus, dronePan, droneFilter, droneOsc1, droneOsc2, dronePanLfo, droneFiltLfo,
    noiseBus, noiseFilter, noise, shTimer,
    percBus, kick, hatFilter, hat, rim, zapFilter, zap,
    vocMaster, vocEcho, carrier, bands,
    percSeq, chordSeq, arpSeq, droneSeq, beatLoop, measureLoop,
  };
  AUDIO.ready = true;
  AUDIO.initing = false;

  // arrancar con la escena actual ya configurada
  audioSceneChange(scene.name);
}

// ────────────────────────────────────────────────────────────
//   DISPAROS DESDE EL ENGINE
// ────────────────────────────────────────────────────────────

// circuito :: arpegio corto al aparecer un diagrama; usa el chord vivo
function audioDiagram() {
  if (!AUDIO.ready || !AUDIO.enabled) return;
  const t = Tone.now();
  if (t - AUDIO.last.diag < 0.14) return;
  AUDIO.last.diag = t;
  // toma 3-5 notas del chord actual + octava
  const chord = AUDIO.mus.chord.length ? AUDIO.mus.chord : [57, 60, 64];
  const pool = [...chord, ...chord.map(n => n + 12)];
  const len = 3 + (Math.random() * 3 | 0);
  const dir = Math.random() < 0.55;
  for (let i = 0; i < len; i++) {
    const note = pool[(Math.random() * pool.length) | 0] + (Math.random() < 0.18 ? 12 : 0);
    const when = t + i * (0.06 + Math.random() * 0.04);
    AUDIO.n.bleep.triggerAttackRelease(midiToName(dir ? note : note - 0), 0.05, when);
  }
}

// cita/glosa :: ping melódico que cae dentro del chord, con tail más largo
function audioCita() {
  if (!AUDIO.ready || !AUDIO.enabled) return;
  const t = Tone.now();
  if (t - AUDIO.last.cita < 0.3) return;
  AUDIO.last.cita = t;
  const chord = AUDIO.mus.chord.length ? AUDIO.mus.chord : [57, 60, 64];
  const note = chord[(Math.random() * chord.length) | 0] + 12;
  AUDIO.n.blip.triggerAttackRelease(midiToName(note), 0.6, t, 0.9);
  // segundo ping una quinta arriba, retardado
  if (Math.random() < 0.4) {
    AUDIO.n.blip.triggerAttackRelease(midiToName(note + 7), 0.5, t + 0.18, 0.6);
  }
}

// cambio de escena :: actualiza armonía, BPM, chorus, arpRate, drone, sweep
function audioSceneChange(name) {
  if (!AUDIO.ready) return;
  const t = Tone.now();
  if (t - AUDIO.last.sceneChange < 0.3) return;
  AUDIO.last.sceneChange = t;

  const cfg = SCENE_AUDIO[name] || SCENE_AUDIO.terminal;
  AUDIO.mus.sceneName = name;
  AUDIO.mus.rootMidi  = nameToMidi(cfg.rootName);
  AUDIO.mus.modeSemis = cfg.mode;
  AUDIO.mus.prog      = cfg.prog;
  AUDIO.mus.progStep  = 0;
  AUDIO.mus.arpStyle  = cfg.arpStyle;
  AUDIO.mus.arpRate   = cfg.arpRate;

  // tempo y chorus
  Tone.Transport.bpm.rampTo(percBpm(), 0.8);
  AUDIO.n.masterChor.wet.rampTo(cfg.chorus, 1.2);

  // re-intervalar arpSeq
  AUDIO.n.arpSeq.interval = cfg.arpRate;

  // sweep transicional :: filtro del pad abre rápido
  AUDIO.n.padFilter.frequency.cancelScheduledValues(t);
  AUDIO.n.padFilter.frequency.setValueAtTime(400, t);
  AUDIO.n.padFilter.frequency.exponentialRampToValueAtTime(1800, t + 1.4);

  // riser breve de noise
  AUDIO.n.noiseBus.gain.cancelScheduledValues(t);
  AUDIO.n.noiseBus.gain.setValueAtTime(0.05, t);
  AUDIO.n.noiseBus.gain.linearRampToValueAtTime(0.5, t + 0.6);
  AUDIO.n.noiseBus.gain.exponentialRampToValueAtTime(0.35, t + 1.4);
}

// ────────────────────────────────────────────────────────────
//   VOZ HÍBRIDA :: Web Speech + vocoder bed + auto-tune
// ────────────────────────────────────────────────────────────
let _voices = [];
function loadVoices() { if (window.speechSynthesis) _voices = speechSynthesis.getVoices() || []; }
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
}
function pickVoice() {
  const es = _voices.filter(v => /^es/i.test(v.lang));
  return es.length ? es[(Math.random() * es.length) | 0] : null;
}

// modos vocales — sorteados por probabilidad en cada cita
//   normal   :: voz grave robótica
//   whisper  :: pitch alto + volumen bajo + carrier silencioso
//   double   :: voz + segunda voz desfasada (efecto coro fantasma)
//   alien    :: harmonicity alta en el AM + auto-tune agresivo
function pickVoiceMode() {
  const r = Math.random();
  if (r < 0.55) return 'normal';
  if (r < 0.75) return 'double';
  if (r < 0.88) return 'whisper';
  return 'alien';
}

function speak(text) {
  if (!AUDIO.enabled || !AUDIO.voice || !window.speechSynthesis || !text) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) return;
  if (AUDIO.ready && Tone.now() - AUDIO.last.speakEnd < 1.4) return;
  // navegadores sin voces cargadas a tiempo se traban; abortar
  if (!_voices.length) loadVoices();
  if (!_voices.length) return;

  const mode = pickVoiceMode();
  AUDIO.currentVoiceMode = mode;
  AUDIO.speakingNow = true;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  const v = pickVoice();
  if (v) u.voice = v;

  switch (mode) {
    case 'whisper':
      u.pitch  = 1.3 + Math.random() * 0.5;
      u.rate   = 0.7  + Math.random() * 0.2;
      u.volume = 0.45;
      break;
    case 'alien':
      u.pitch  = 0.1 + Math.random() * 0.25;
      u.rate   = 0.85 + Math.random() * 0.3;
      u.volume = 0.95;
      break;
    case 'double':
      u.pitch  = 0.5 + Math.random() * 0.25;
      u.rate   = 0.9 + Math.random() * 0.2;
      u.volume = 0.85;
      break;
    case 'normal':
    default:
      u.pitch  = 0.3 + Math.random() * 0.35;
      u.rate   = 0.84 + Math.random() * 0.26;
      u.volume = 0.9;
  }

  u.onstart    = () => vocoderStart(mode);
  u.onboundary = () => vocoderPulse(mode);
  u.onend      = vocoderStop;
  u.onerror    = vocoderStop;
  speechSynthesis.speak(u);

  // double :: segunda voz desfasada — sólo si el original sigue hablando
  if (mode === 'double' && Math.random() < 0.7) {
    setTimeout(() => {
      if (!AUDIO.speakingNow || !speechSynthesis.speaking) return;
      const u2 = new SpeechSynthesisUtterance(text);
      u2.lang = 'es-ES';
      if (v) u2.voice = v;
      u2.pitch  = Math.max(0.05, u.pitch - 0.15);
      u2.rate   = u.rate * (0.96 + Math.random() * 0.05);
      u2.volume = 0.32;
      try { speechSynthesis.speak(u2); } catch (e) {}
    }, 180 + Math.random() * 200);
  }
}

// el vocoder bed se enciende mientras habla — distinto carácter por modo
function vocoderStart(mode) {
  if (!AUDIO.ready) return;
  const t = Tone.now();
  AUDIO.n.vocMaster.gain.cancelScheduledValues(t);
  let level;
  switch (mode) {
    case 'whisper': level = 0.04; break;
    case 'alien':   level = 0.28; AUDIO.n.carrier.harmonicity.rampTo(3.5, 0.4); break;
    case 'double':  level = 0.22; AUDIO.n.carrier.harmonicity.rampTo(2.1, 0.4); break;
    case 'normal':
    default:        level = 0.18; AUDIO.n.carrier.harmonicity.rampTo(1.5, 0.4);
  }
  AUDIO.n.vocMaster.gain.rampTo(level, 0.3);
  vocoderPulse(mode);
  clearInterval(AUDIO.speakTimer);
  const period = mode === 'alien' ? 60 + Math.random() * 40
              : mode === 'whisper' ? 140 + Math.random() * 80
              : 95 + Math.random() * 80;
  AUDIO.speakTimer = setInterval(() => vocoderPulse(mode), period);
}

// cada pulso :: las bandas formantes se mueven; carrier salta a una nota
// de la escala viva → la voz "canta" sin querer
function vocoderPulse(mode) {
  if (!AUDIO.ready) return;
  const t = Tone.now();
  const intensity = mode === 'whisper' ? 0.35
                  : mode === 'alien'   ? 1.1
                  : 0.85;
  for (const g of AUDIO.n.bands) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(0, g.gain.value), t);
    g.gain.linearRampToValueAtTime(intensity * (0.12 + Math.random() * 0.7), t + 0.025);
    g.gain.linearRampToValueAtTime(intensity * (Math.random() * 0.08), t + 0.085 + Math.random() * 0.07);
  }
  // auto-tune del carrier a la escala actual (octava grave)
  const notes = scaleNotes(AUDIO.mus.rootMidi - 12, AUDIO.mus.modeSemis, 1);
  const target = notes[(Math.random() * notes.length) | 0];
  const freq = Tone.Frequency(midiToName(target)).toFrequency();
  // alien: pitch más errático
  const jitter = mode === 'alien' ? (0.7 + Math.random() * 0.8) : 1;
  AUDIO.n.carrier.frequency.rampTo(freq * jitter, 0.05);
}

function vocoderStop() {
  clearInterval(AUDIO.speakTimer);
  AUDIO.speakTimer = null;
  AUDIO.speakingNow = false;
  if (!AUDIO.ready) return;
  AUDIO.n.vocMaster.gain.rampTo(0, 0.45);
  AUDIO.n.carrier.harmonicity.rampTo(1.5, 0.6);
  AUDIO.last.speakEnd = Tone.now();
}

// ────────────────────────────────────────────────────────────
//   TOGGLES
// ────────────────────────────────────────────────────────────
function toggleSound() {
  AUDIO.enabled = !AUDIO.enabled;
  if (!AUDIO.enabled) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    vocoderStop();
  }
}

// apaga la capa melódica :: pad/arp/bajo/drone se silencian
function toggleMelody() {
  AUDIO.melody = !AUDIO.melody;
  if (!AUDIO.ready) return;
  const t = Tone.now();
  const lvl = AUDIO.melody ? 0.55 : 0;
  AUDIO.n.droneBus.gain.rampTo(lvl, 0.5);
  if (!AUDIO.melody) AUDIO.n.pad.releaseAll(t);
}

// apaga la voz (TTS + vocoder bed)
function toggleVoice() {
  AUDIO.voice = !AUDIO.voice;
  if (!AUDIO.voice) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    vocoderStop();
  }
}
