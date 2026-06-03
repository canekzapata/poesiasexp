

// =============================================================
//   AUDIO  ::  Tone.js (circuito + synth) + Web Speech (voz híbrida)
// =============================================================

const AUDIO = {
  ready: false,
  initing: false,
  enabled: true,
  perc: true,
  scale: ['A2','C3','D3','E3','G3','A3','C4','D4','E4','G4','A4','C5'],
  last: { diag: 0, speakEnd: 0 },
  speakTimer: null,
  n: {},
};

// percusión :: 'x' = golpe, '.' = silencio — 16 pasos por compás
function patBeats(s) { return [...s].map(c => c === 'x' || c === 'X'); }

const PERC_PATTERNS = {
  terminal: { bpm: 96,  kick: patBeats('x.......x.......'), hat: patBeats('..x...x...x...x.'), rim: patBeats('....x.......x...'), zap: patBeats('................') },
  mosaico:  { bpm: 112, kick: patBeats('x...x...x...x...'), hat: patBeats('x.x.x.x.x.x.x.x.'), rim: patBeats('....x.......x...'), zap: patBeats('........x.......') },
  glitch:   { bpm: 134, kick: patBeats('x..x..x.x..x..x.'), hat: patBeats('xxxxxxxxxxxxxxxx'), rim: patBeats('..x..x..x..x..x.'), zap: patBeats('x...x...x...x..x') },
  drone:    { bpm: 60,  kick: patBeats('x...............'), hat: patBeats('........x.......'), rim: patBeats('................'), zap: patBeats('................') },
  cita:     { bpm: 82,  kick: patBeats('x.......x.......'), hat: patBeats('....x.......x...'), rim: patBeats('................'), zap: patBeats('................') },
  ticker:   { bpm: 126, kick: patBeats('x...x...x...x...'), hat: patBeats('x.x.x.x.x.x.x.x.'), rim: patBeats('..x...x...x...x.'), zap: patBeats('................') },
  feedback: { bpm: 104, kick: patBeats('x...x.....x...x.'), hat: patBeats('..x.x...x.x...x.'), rim: patBeats('x.......x.......'), zap: patBeats('............x...') },
  memoria:  { bpm: 68,  kick: patBeats('x.............x.'), hat: patBeats('....x.......x...'), rim: patBeats('................'), zap: patBeats('................') },
  burst:    { bpm: 152, kick: patBeats('x.xx..x.x.xx.x.x'), hat: patBeats('xxxxxxxxxxxxxxxx'), rim: patBeats('x.x.x.x.x.x.x.x.'), zap: patBeats('..x..x..x..x..x.') },
};

// bpm efectivo :: base de la escena modulada por el tempo del VJ
function percBpm() {
  const base = (PERC_PATTERNS[scene.name] || PERC_PATTERNS.terminal).bpm;
  return Math.max(48, Math.min(200, base * (0.7 + 0.3 * tempo)));
}

function syncPercTempo() {
  if (AUDIO.ready && typeof Tone !== 'undefined') Tone.Transport.bpm.rampTo(percBpm(), 0.4);
}

// el contexto de audio sólo arranca tras un gesto del usuario
async function initAudio() {
  if (AUDIO.ready || AUDIO.initing || typeof Tone === 'undefined') return;
  AUDIO.initing = true;
  try { await Tone.start(); }
  catch (e) { AUDIO.initing = false; return; }

  const limiter   = new Tone.Limiter(-2).toDestination();
  const reverb    = new Tone.Reverb({ decay: 2.6, wet: 0.16 }).connect(limiter);
  reverb.generate().catch(() => {});
  const masterBus = new Tone.Gain(0.85).connect(reverb);

  // — circuito: bleeps cortos, sonda lógica —
  const delay       = new Tone.FeedbackDelay({ delayTime: 0.165, feedback: 0.26, wet: 0.16 }).connect(masterBus);
  const bleepFilter = new Tone.Filter({ type: 'lowpass', frequency: 3400, Q: 1 }).connect(masterBus);
  bleepFilter.connect(delay);
  const bleep = new Tone.Synth({
    volume: -13,
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.085, sustain: 0, release: 0.05 },
  }).connect(bleepFilter);

  // — cita: ping suave de sintetizador —
  const blip = new Tone.Synth({
    volume: -19,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.55, sustain: 0, release: 0.5 },
  }).connect(bleepFilter);

  // — bed de vocoder: carrier sawtooth → banco de filtros formantes —
  const vocMaster = new Tone.Gain(0).connect(masterBus);
  const carrier   = new Tone.Oscillator({ frequency: 82, type: 'sawtooth', volume: -4 });
  const bands = [];
  for (const f of [320, 1100, 2700]) {
    const bp = new Tone.Filter({ type: 'bandpass', frequency: f, Q: 7 });
    const g  = new Tone.Gain(0).connect(vocMaster);
    carrier.connect(bp);
    bp.connect(g);
    bands.push(g);
  }
  carrier.start();

  // — percusión :: caja de ritmos eléctrica sobre Tone.Transport —
  const percBus = new Tone.Gain(0.8).connect(masterBus);
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

  // un paso por '16n'; el patrón sigue a la escena viva
  const percSeq = new Tone.Sequence((time, step) => {
    if (!AUDIO.enabled || !AUDIO.perc) return;
    const p = PERC_PATTERNS[scene.name] || PERC_PATTERNS.terminal;
    if (p.kick[step]) kick.triggerAttackRelease('C1', '8n', time);
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
  Tone.Transport.bpm.value = percBpm();
  Tone.Transport.start();

  AUDIO.n = {
    limiter, reverb, masterBus, delay, bleepFilter, bleep, blip,
    vocMaster, carrier, bands, percBus, kick, hat, rim, zap, percSeq,
  };
  AUDIO.ready = true;
  AUDIO.initing = false;
}

// circuito :: motivo corto de 2-4 notas al aparecer un diagrama
function audioDiagram() {
  if (!AUDIO.ready || !AUDIO.enabled) return;
  const t = Tone.now();
  if (t - AUDIO.last.diag < 0.14) return;
  AUDIO.last.diag = t;
  const len   = 2 + (Math.random() * 3 | 0);
  const start = (Math.random() * (AUDIO.scale.length - len)) | 0;
  const up    = Math.random() < 0.5;
  for (let i = 0; i < len; i++) {
    const idx = up ? start + i : start + len - 1 - i;
    AUDIO.n.bleep.triggerAttackRelease(AUDIO.scale[idx], 0.05, t + i * 0.075);
  }
}

// cita/glosa :: ping suave
function audioCita() {
  if (!AUDIO.ready || !AUDIO.enabled) return;
  const note = AUDIO.scale[6 + (Math.random() * (AUDIO.scale.length - 6) | 0)];
  AUDIO.n.blip.triggerAttackRelease(note, 0.5, Tone.now());
}

// — voz híbrida :: Web Speech lee el texto + bed de vocoder de Tone.js —
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

function speak(text) {
  if (!AUDIO.enabled || !window.speechSynthesis || !text) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) return;
  if (AUDIO.ready && Tone.now() - AUDIO.last.speakEnd < 1.4) return;
  const u  = new SpeechSynthesisUtterance(text);
  u.lang   = 'es-ES';
  u.pitch  = 0.3 + Math.random() * 0.35;   // grave → robótico
  u.rate   = 0.84 + Math.random() * 0.26;
  u.volume = 0.9;
  const v  = pickVoice();
  if (v) u.voice = v;
  u.onstart    = vocoderStart;
  u.onboundary = vocoderPulse;
  u.onend      = vocoderStop;
  u.onerror    = vocoderStop;
  speechSynthesis.speak(u);
}

// el bed se enciende mientras habla y pulsa al ritmo de las palabras
function vocoderStart() {
  if (!AUDIO.ready) return;
  AUDIO.n.vocMaster.gain.cancelScheduledValues(Tone.now());
  AUDIO.n.vocMaster.gain.rampTo(0.18, 0.3);
  vocoderPulse();
  clearInterval(AUDIO.speakTimer);
  AUDIO.speakTimer = setInterval(vocoderPulse, 95 + Math.random() * 80);
}

function vocoderPulse() {
  if (!AUDIO.ready) return;
  const t = Tone.now();
  for (const g of AUDIO.n.bands) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(0, g.gain.value), t);
    g.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.7, t + 0.025);
    g.gain.linearRampToValueAtTime(Math.random() * 0.08, t + 0.085 + Math.random() * 0.07);
  }
  AUDIO.n.carrier.frequency.rampTo(68 + Math.random() * 64, 0.05);
}

function vocoderStop() {
  clearInterval(AUDIO.speakTimer);
  AUDIO.speakTimer = null;
  if (!AUDIO.ready) return;
  AUDIO.n.vocMaster.gain.rampTo(0, 0.45);
  AUDIO.last.speakEnd = Tone.now();
}

function toggleSound() {
  AUDIO.enabled = !AUDIO.enabled;
  if (!AUDIO.enabled) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    vocoderStop();
  }
}
