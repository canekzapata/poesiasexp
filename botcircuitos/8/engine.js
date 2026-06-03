
  

// =============================================================
//   CONFIG GLOBAL DE LA SESIÓN
//   - RARE :: cada carga tira el dado; ~5% sale un modo raro
//   - performance :: arco cerrado (setlist + fade out), tecla O
// =============================================================

const RARE = (() => {
  const r = Math.random();
  if (r < 0.005)  return 'silent';   // 0.5% sin sonido
  if (r < 0.015)  return 'mudo';     // 1%   sin diagramas
  if (r < 0.030)  return 'morse';    // 1.5% todo el texto en binario
  if (r < 0.050)  return 'ghost';    // 2%   todos los colores en ghost
  return null;
})();

// helper :: convierte texto a 0/1 ASCII (8 bits por carácter, espacios entre)
// trunca a 28 chars para que quepa en pantalla — la idea es que sea legible
// como bloque binario, no como wall of bits
function textToBinary(s) {
  const t = String(s || '').slice(0, 28);
  return t.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

// ── PERFORMANCE :: arco cerrado con setlist y final ─────────
let isPerformance = false;
let performanceEnded = false;
let setlistIdx = 0;
const SETLIST = [
  { name: 'terminal', dur: 28 },
  { name: 'mosaico',  dur: 38 },
  { name: 'glitch',   dur: 26 },
  { name: 'feedback', dur: 36 },
  { name: 'cita',     dur: 44 },
  { name: 'drone',    dur: 56 },
  { name: 'memoria',  dur: 34 },
  { name: 'ticker',   dur: 24 },
  { name: 'burst',    dur: 22 },
];

// =============================================================
//   CANVAS + FONTS
// =============================================================

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H;

// tipografías oldschool CP437 — todas monoespaciadas, alinean el ASCII;
// los glifos ausentes (kaomoji, ∿, subíndices) caen a Courier New
const TYPEFACES = [
  'SperryPC','Robotron','OlivettiThin','SiemensPCD','ApricotPortable',
  'Compis','IBM_Model3x','IBM_PS55','Stingray','ToshibaSat','HP150','Paradise132',
];
const FONT_SIZE = { micro: 10, small: 12, medium: 15, large: 22, drop: 34 };
const FONTS = { micro: '', small: '', medium: '', large: '', drop: '' };
const LH = { micro: 12, small: 16, medium: 20, large: 28, drop: 44 };
const CW = { micro: 6, small: 7.2, medium: 9, large: 13.2, drop: 20.4 };
let typeIdx = 0;

function measureFonts() {
  for (const k in FONTS) {
    ctx.font = FONTS[k];
    CW[k] = ctx.measureText('M').width || CW[k];
  }
}

// aplica una tipografía a todos los tamaños y re-mide al cargar la fuente
function applyTypeface(idx) {
  typeIdx = ((idx % TYPEFACES.length) + TYPEFACES.length) % TYPEFACES.length;
  const fam = TYPEFACES[typeIdx];
  for (const k in FONT_SIZE) {
    FONTS[k] = `${FONT_SIZE[k]}px '${fam}', 'Courier New', monospace`;
  }
  measureFonts();
  if (document.fonts && document.fonts.load) {
    document.fonts.load(`16px '${fam}'`).then(measureFonts).catch(() => {});
  }
}
applyTypeface(0);

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  measureFonts();
}
resize();
window.addEventListener('resize', resize);

function colorFor(name, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  if (RARE === 'ghost' && name !== 'ghost') name = 'ghost';
  switch (name) {
    case 'green': return `rgba(0, ${Math.round(255*a)}, ${Math.round(65*a)}, 1)`;
    case 'dim':   return `rgba(0, ${Math.round(135*a)}, ${Math.round(35*a)}, 1)`;
    case 'ghost': return `rgba(0, ${Math.round(85*a)}, ${Math.round(22*a)}, 1)`;
    case 'red':   return `rgba(255, ${Math.round(60*a)}, ${Math.round(50*a)}, ${a})`;
    case 'amber': return `rgba(255, ${Math.round(170*a)}, ${Math.round(20*a)}, ${a})`;
    case 'white': return `rgba(${Math.round(200*a)}, ${Math.round(225*a)}, 255, ${a})`;
    default:      return `rgba(0, ${Math.round(255*a)}, ${Math.round(65*a)}, 1)`;
  }
}

// =============================================================
//   BLOCK  ::  unidad de display
// =============================================================

class Block {
  constructor(opts) {
    this.lines    = opts.lines || [];
    this.x        = opts.x;
    this.y        = opts.y;
    this.font     = opts.font || 'medium';
    this.color    = opts.color || 'green';
    this.born     = T;
    this.life     = opts.life || 8;
    this.typed    = 0;
    this.typeSpeed= opts.typeSpeed || 80;
    this.text     = this.lines.join('\n');
    this.glitch   = opts.glitch || 0;
    this.kind     = opts.kind || 'diag';
    this.drift    = opts.drift || { x: 0, y: 0 };
  }

  update(dt) {
    this.typed = Math.min(this.text.length, this.typed + this.typeSpeed * dt);
    this.x += this.drift.x * dt;
    this.y += this.drift.y * dt;
  }

  get age()   { return T - this.born; }
  get alive() {
    if (this.age >= this.life) return false;
    // ticker dies when fully off-screen
    if (this.kind === 'ticker' && this.x + (this.text.length * CW[this.font]) < -50) return false;
    return true;
  }

  get alpha() {
    const a = this.age;
    const fadeIn = 0.4;
    if (a < fadeIn) return a / fadeIn;
    if (a > this.life - 1.2) return Math.max(0, (this.life - a) / 1.2);
    return 1;
  }

  draw() {
    ctx.font = FONTS[this.font];
    const lh = LH[this.font];
    let alpha = this.alpha;
    if (this.kind === 'ghost') alpha *= 0.35;

    const slice = this.text.slice(0, Math.floor(this.typed));
    const visLines = slice.split('\n');

    // glitch ocasional: una línea, un char reemplazado por bloque
    if (this.glitch > 0 && visLines.length > 0 && Math.random() < this.glitch * 0.18) {
      const li = Math.floor(Math.random() * visLines.length);
      const line = visLines[li];
      if (line.length > 0) {
        const ci = Math.floor(Math.random() * line.length);
        const gc = '▓░▒█▌▐'[Math.floor(Math.random() * 6)];
        visLines[li] = line.slice(0, ci) + gc + line.slice(ci + 1);
      }
    }

    for (let i = 0; i < visLines.length; i++) {
      ctx.fillStyle = colorFor(this.color, alpha);
      ctx.fillText(visLines[i], this.x, this.y + i * lh);
    }

    // cursor de typewriter parpadeante mientras se está escribiendo
    if (this.typed < this.text.length && Math.floor(T * 4) % 2 === 0) {
      const charsInLastLine = (this.text.slice(0, Math.floor(this.typed)).split('\n').pop() || '').length;
      const cx = this.x + charsInLastLine * CW[this.font];
      const cy = this.y + (visLines.length - 1) * lh;
      ctx.fillStyle = colorFor(this.color, alpha);
      ctx.fillText('█', cx, cy);
    }
  }
}

// =============================================================
//   ESCENAS
// =============================================================

const SCENES = {
  terminal: {
    name: 'terminal',
    dur: [22, 38],
    diagRate: 0.30, tickerRate: 0.6, citaRate: 0.05, bigDropRate: 0.04,
    maxDiag: 3, glitch: 0, ghostBg: true,
    diagFonts: ['medium','medium','large'],
    palette: ['green','green','green','dim'],
  },
  mosaico: {
    name: 'mosaico',
    dur: [18, 32],
    diagRate: 0.95, tickerRate: 0.5, citaRate: 0.08, bigDropRate: 0,
    maxDiag: 6, glitch: 0.05, ghostBg: false,
    diagFonts: ['small','medium','small','medium'],
    palette: ['green','green','dim','green'],
  },
  glitch: {
    name: 'glitch',
    dur: [10, 18],
    diagRate: 0.55, tickerRate: 1.6, citaRate: 0.22, bigDropRate: 0.20,
    maxDiag: 4, glitch: 0.55, ghostBg: false,
    diagFonts: ['small','medium','large'],
    palette: ['green','red','amber','green','green','red'],
  },
  drone: {
    name: 'drone',
    dur: [35, 55],
    diagRate: 0.06, tickerRate: 0.15, citaRate: 0.04, bigDropRate: 0,
    maxDiag: 2, glitch: 0, ghostBg: true,
    diagFonts: ['large'],
    palette: ['green','dim','green'],
  },
  cita: {
    name: 'cita',
    dur: [16, 26],
    diagRate: 0.12, tickerRate: 0.4, citaRate: 0.55, bigDropRate: 0.20,
    maxDiag: 2, glitch: 0, ghostBg: true,
    diagFonts: ['medium','medium'],
    palette: ['green','white','green','white'],
  },
  ticker: {
    name: 'ticker',
    dur: [14, 22],
    diagRate: 0.04, tickerRate: 2.6, citaRate: 0, bigDropRate: 0,
    maxDiag: 1, glitch: 0.08, ghostBg: false,
    diagFonts: ['micro','small'],
    palette: ['green','dim','amber'],
  },
  // ── escenas nuevas ─────────────────────────────────────────
  feedback: {
    name: 'feedback',
    dur: [18, 28],
    diagRate: 0.5, tickerRate: 0.45, citaRate: 0.40, bigDropRate: 0.10,
    floaterRate: 0.5,
    maxDiag: 4, glitch: 0.08, ghostBg: true,
    diagFonts: ['medium','small','medium'],
    palette: ['green','white','green','dim'],
  },
  memoria: {
    name: 'memoria',
    dur: [28, 45],
    diagRate: 0.15, tickerRate: 0.25, citaRate: 0.12, bigDropRate: 0.05,
    floaterRate: 0.10,
    maxDiag: 3, glitch: 0, ghostBg: true,
    diagFonts: ['medium','large'],
    palette: ['ghost','dim','green','ghost'],
  },
  burst: {
    name: 'burst',
    dur: [8, 14],
    diagRate: 1.6, tickerRate: 2.8, citaRate: 0.55, bigDropRate: 0.50,
    floaterRate: 1.5,
    maxDiag: 8, glitch: 0.30, ghostBg: false,
    diagFonts: ['micro','small','medium','large'],
    palette: ['green','red','amber','green','green','red','amber'],
  },
};
const SCENE_LIST = Object.keys(SCENES);

// =============================================================
//   ESTADO GLOBAL
// =============================================================

let T = 0, lastTs = null, lastDt = 0.016;
let blocks = [];
let scene = SCENES.terminal;
let sceneT = 0, sceneDur = 30;
let tempo = 1;
let muted = false;
let acc = { diag: 0, tick: 0, cita: 0, drop: 0, floater: 0 };



// =============================================================
//   SPAWNERS
// =============================================================

function pickPos(estW, estH) {
  for (let i = 0; i < 30; i++) {
    const x = rv(20, Math.max(20, W - estW - 20));
    const y = rv(40, Math.max(40, H - estH - 60));
    let coll = 0;
    for (const b of blocks) {
      const bw = (b.lines[0]?.length || 0) * CW[b.font];
      const bh = b.lines.length * LH[b.font];
      if (x < b.x + bw && x + estW > b.x && y < b.y + bh && y + estH > b.y) coll++;
    }
    if (coll <= 1) return { x, y };
  }
  return { x: rv(40, Math.max(40, W - 200)), y: rv(40, Math.max(40, H - 100)) };
}

function spawnDiagram() {
  const lines = genDiagram();
  const font  = pick(scene.diagFonts);
  const cw    = CW[font], lh = LH[font];
  const estW  = Math.max(...lines.map(l => l.length)) * cw + 10;
  const estH  = lines.length * lh + 10;
  const pos   = pickPos(estW, estH);
  blocks.push(new Block({
    lines, x: pos.x, y: pos.y,
    font, color: pick(scene.palette),
    life: 6 + Math.random() * 8,
    typeSpeed: 60 + Math.random() * 100,
    glitch: scene.glitch,
    kind: 'diag',
  }));
  audioDiagram();
}

function spawnTicker() {
  const text = genTicker();
  const font = maybe(0.45) ? 'small' : 'micro';
  const top  = maybe(0.5);
  const lh   = LH[font];
  const y    = top ? 12 + rv(0, 3) * lh : H - 36 - rv(0, 3) * lh;
  const x    = W;
  blocks.push(new Block({
    lines: [text], x, y,
    font,
    color: maybe(0.06) ? 'amber' : maybe(0.05) ? 'red' : 'dim',
    life: 6 + Math.random() * 3,
    typeSpeed: 280,
    drift: { x: -75 * tempo, y: 0 },
    kind: 'ticker',
    glitch: scene.glitch * 0.5,
  }));
}

function spawnCita() {
  if (maybe(0.30)) return spawnGlosa();
  const original = genCita();
  const lines = [RARE === 'morse' ? textToBinary(original) : original];
  const font  = maybe(0.5) ? 'large' : (RARE === 'morse' ? 'small' : 'drop');
  const cw    = CW[font];
  const estW  = lines[0].length * cw + 20;
  const x     = rv(20, Math.max(20, W - estW - 20));
  const y     = rv(80, Math.max(80, H - 200));
  blocks.push(new Block({
    lines, x, y,
    font, color: pick(scene.palette),
    life: 5 + Math.random() * 4,
    typeSpeed: 30 + Math.random() * 30,
    kind: 'cita',
  }));
  audioCita();
  speak(original);
}

function spawnGlosa() {
  const original = genGlosa();
  const lines = RARE === 'morse' ? original.map(textToBinary) : original;
  const font  = RARE === 'morse' ? 'small' : 'medium';
  const cw    = CW[font], lh = LH[font];
  const estW  = Math.max(...lines.map(l => l.length)) * cw;
  const pos   = pickPos(estW, lines.length * lh);
  blocks.push(new Block({
    lines, x: pos.x, y: pos.y,
    font,
    color: maybe(0.4) ? 'white' : 'green',
    life: 8 + Math.random() * 4,
    typeSpeed: 40 + Math.random() * 30,
    kind: 'glosa',
  }));
  audioCita();
  speak(original[0]);
}

function spawnDrop() {
  const cita = pick(POOLS.cita);
  const font = 'drop';
  const cw   = CW[font];
  const estW = cita.length * cw;
  const x    = Math.max(20, (W - estW) / 2);
  const y    = H / 2 - 22;
  blocks.push(new Block({
    lines: [cita], x, y,
    font, color: maybe(0.3) ? 'white' : 'green',
    life: 4 + Math.random() * 1.5,
    typeSpeed: 90,
    kind: 'drop',
  }));
  for (let i = 0; i < 3; i++) {
    spawnStatusBurstAt(rv(30, Math.max(30, W - 250)), rv(30, Math.max(30, H - 150)));
  }
}

function spawnStatusBurstAt(x, y) {
  const lines = genStatusBurst();
  blocks.push(new Block({
    lines, x, y,
    font: 'small',
    color: maybe(0.5) ? 'amber' : 'dim',
    life: 2.5 + Math.random() * 1.5,
    typeSpeed: 280,
    kind: 'burst',
    glitch: 0.12,
  }));
}

// floater :: una sola línea suelta — fórmula, kaomoji, ping o glosa-fragmento
function spawnFloater() {
  const types = [
    () => ({ text: pick(POOLS.formula),                    font: 'medium', color: 'dim',   life: 3.5 }),
    () => ({ text: pick(POOLS.kaomoji),                    font: 'large',  color: maybe(0.5) ? 'amber' : 'green', life: 2.2 }),
    () => ({ text: '[ ' + pick(POOLS.glosa).slice(0, 42) + ' ]', font: 'small', color: 'white', life: 3.0 }),
    () => ({ text: pick(POOLS.ping) + '  ·  ' + pick(POOLS.ping) + '  ·  ' + pick(POOLS.ping), font: 'small', color: 'dim', life: 2.5 }),
    () => ({ text: pick(POOLS.verbo) + '  ·  ' + pick(POOLS.adj),        font: 'medium', color: 'green', life: 3 }),
    () => ({ text: pick(POOLS.epoch),                      font: 'medium', color: maybe(0.4) ? 'white' : 'dim', life: 3.5 }),
  ];
  const opt = pick(types)();
  const cw  = CW[opt.font];
  const estW = (opt.text.length || 1) * cw;
  const x = rv(20, Math.max(20, W - estW - 20));
  const y = rv(40, Math.max(40, H - 100));
  blocks.push(new Block({
    lines: [opt.text], x, y,
    font: opt.font, color: opt.color,
    life: opt.life + Math.random() * 1.2,
    typeSpeed: 220,
    kind: 'floater',
    glitch: scene.glitch * 0.3,
  }));
}

function spawnGhostBackground() {
  const lines = genDiagram();
  const font  = maybe(0.4) ? 'large' : 'medium';
  const cw    = CW[font], lh = LH[font];
  const estW  = Math.max(...lines.map(l => l.length)) * cw;
  const x     = Math.max(20, (W - estW) / 2 + rv(-100, 100));
  const y     = Math.max(40, (H - lines.length * lh) / 2 + rv(-80, 80));
  blocks.push(new Block({
    lines, x, y,
    font, color: 'ghost',
    life: 18 + Math.random() * 10,
    typeSpeed: 25,
    kind: 'ghost',
  }));
}

// =============================================================
//   SCHEDULER + LOOP
// =============================================================

function startScene(name) {
  scene = SCENES[name] || SCENES.terminal;
  sceneT = 0;
  if (isPerformance && SETLIST[setlistIdx]) {
    sceneDur = SETLIST[setlistIdx].dur;
  } else {
    sceneDur = scene.dur[0] + Math.random() * (scene.dur[1] - scene.dur[0]);
  }
  acc.diag = acc.tick = acc.cita = acc.drop = 0;
  if (AUDIO.ready) audioSceneChange(scene.name);
  if (scene.ghostBg && Math.random() < 0.65) spawnGhostBackground();
}

// ── HOOKS DE AUDIO ────────────────────────────────────────────
// Cuando Tone.Transport corre, los spawns se cuantizan al beat/compás
// vía callbacks que registramos en AUDIO. El fallback (timers libres)
// sólo aplica cuando el audio aún no ha arrancado.

let _rareApplied = false;
function ensureAudioHooks() {
  if (AUDIO.ready && !AUDIO.onBeat) {
    AUDIO.onBeat = onBeatTick;
    AUDIO.onMeasure = onMeasureTick;
  }
  // silent mode :: aplicar una sola vez cuando el audio esté listo
  if (RARE === 'silent' && AUDIO.ready && !_rareApplied) {
    AUDIO.enabled = false;
    _rareApplied = true;
  }
}

// cada negra :: spawns frecuentes (diag, ticker, cita, drop)
function onBeatTick() {
  if (muted) return;
  const bpm = Math.max(40, Tone.Transport.bpm.value);
  const beatDur = 60 / bpm;                  // segundos por beat
  const k = beatDur * tempo;                 // prob de un evento a-rate-1 por beat
  const mudo = RARE === 'mudo';
  if (!mudo) {
    const aliveDiag = blocks.filter(b => b.kind === 'diag').length;
    if (Math.random() < scene.diagRate * k && aliveDiag < scene.maxDiag) spawnDiagram();
  }
  if (Math.random() < scene.tickerRate * k) spawnTicker();
  if ((scene.citaRate || 0) > 0 && Math.random() < scene.citaRate * k) spawnCita();
  if ((scene.bigDropRate || 0) > 0 && Math.random() < scene.bigDropRate * k) spawnDrop();
}

// cada compás :: spawns lentos (floater, ghost)
function onMeasureTick() {
  if (muted) return;
  const bpm = Math.max(40, Tone.Transport.bpm.value);
  const measureDur = (60 / bpm) * 4;
  const fRate = scene.floaterRate ?? 0.20;
  if (fRate > 0 && Math.random() < fRate * measureDur * tempo) spawnFloater();
  if (scene.ghostBg && Math.random() < 0.08) spawnGhostBackground();
}

// ── PERFORMANCE :: control del arco ───────────────────────────

function startPerformance() {
  isPerformance = true;
  performanceEnded = false;
  setlistIdx = 0;
  blocks = [];
  if (AUDIO.ready && !AUDIO.enabled) AUDIO.enabled = true;
  startScene(SETLIST[0].name);
}

function nextInSetlist() {
  setlistIdx++;
  if (setlistIdx >= SETLIST.length) { endPerformance(); return; }
  startScene(SETLIST[setlistIdx].name);
}

function endPerformance() {
  isPerformance = false;
  performanceEnded = true;
  if (AUDIO.ready) {
    AUDIO.n.masterBus.gain.cancelScheduledValues(Tone.now());
    AUDIO.n.masterBus.gain.rampTo(0, 4.2);
    if (window.speechSynthesis) speechSynthesis.cancel();
    setTimeout(() => {
      if (!AUDIO.ready) return;
      AUDIO.n.masterBus.gain.rampTo(0.72, 0.1);
    }, 4600);
  }
}

function tickScheduler(dt) {
  if (muted) return;
  sceneT += dt;
  if (sceneT >= sceneDur) {
    if (isPerformance) {
      nextInSetlist();
    } else {
      const others = SCENE_LIST.filter(s => s !== scene.name);
      startScene(pick(others));
    }
  }
  // si los hooks de Transport están vivos, los spawns ya se manejan ahí
  if (AUDIO.ready && AUDIO.onBeat) return;

  // ── FALLBACK :: timers libres antes de que el audio arranque ─
  const t = dt * tempo;
  const aliveDiag = blocks.filter(b => b.kind === 'diag').length;
  const mudo = RARE === 'mudo';
  acc.diag += t;
  if (!mudo && acc.diag >= 1 / Math.max(0.01, scene.diagRate) && aliveDiag < scene.maxDiag) {
    acc.diag = 0;
    spawnDiagram();
  }
  acc.tick += t;
  if (acc.tick >= 1 / Math.max(0.01, scene.tickerRate)) {
    acc.tick = 0;
    spawnTicker();
  }
  acc.cita += t;
  if (scene.citaRate > 0 && acc.cita >= 1 / scene.citaRate) {
    acc.cita = 0;
    spawnCita();
  }
  acc.drop += t;
  if (scene.bigDropRate > 0 && acc.drop >= 1 / scene.bigDropRate) {
    acc.drop = 0;
    spawnDrop();
  }
  acc.floater += t;
  const fRate = scene.floaterRate ?? 0.20;
  if (fRate > 0 && acc.floater >= 1 / fRate) {
    acc.floater = 0;
    spawnFloater();
  }
  if (scene.ghostBg && Math.random() < 0.0008 * tempo) spawnGhostBackground();
}

function render() {
  // fade-trail: rastros decaen suaves frame a frame
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, 0, W, H);

  // ordenar para que ghost vaya al fondo
  blocks.sort((a, b) => {
    const order = { ghost: 0, burst: 1, ticker: 2, floater: 2.5, diag: 3, glosa: 4, cita: 5, drop: 6 };
    return (order[a.kind] || 3) - (order[b.kind] || 3);
  });
  for (const b of blocks) b.draw();

  // HUD inferior derecha — hardcoded para sobrevivir a ghost mode
  ctx.font = FONTS.micro;
  ctx.fillStyle = 'rgba(0, 135, 35, 0.85)';
  const fps = (1 / Math.max(0.001, lastDt)).toFixed(0);
  const snd = !AUDIO.ready ? '♪ —'
            : !AUDIO.enabled ? '♪ off'
            : `♪${AUDIO.perc?'·D':''}${AUDIO.melody?'·M':''}${AUDIO.voice?'·V':''}`;
  const mus = AUDIO.ready && AUDIO.mus ? `  mode=${AUDIO.mus.sceneName}` : '';
  const perf = isPerformance ? `  PERFORMANCE ${setlistIdx + 1}/${SETLIST.length}` : (performanceEnded ? '  EOF' : '');
  const rare = RARE ? `  rare=${RARE}` : '';
  const hud = `[${scene.name}]  ${TYPEFACES[typeIdx]}  tempo=${tempo.toFixed(2)}x  blocks=${blocks.length}  ${fps}fps  ·  ${snd}${mus}${perf}${rare}${muted ? '  ·  MUTED' : ''}`;
  ctx.fillText(hud, W - hud.length * CW.micro - 14, H - 12);
}

function update(dt) {
  for (const b of blocks) b.update(dt);
  blocks = blocks.filter(b => b.alive);
}

function loop(ts) {
  if (lastTs === null) lastTs = ts;
  const dt = Math.min((ts - lastTs) / 1000, 0.06);
  lastTs = ts;
  lastDt = dt;
  T += dt;

  ensureAudioHooks();
  tickScheduler(dt);
  update(dt);
  render();

  requestAnimationFrame(loop);
}

// =============================================================
//   VJ CONTROLS
// =============================================================

window.addEventListener('keydown', e => {
  initAudio();
  if (e.key === ' ')      { e.preventDefault(); spawnDrop(); return; }
  if (e.key === 's' || e.key === 'S') { toggleSound(); return; }
  if (e.key === 'p' || e.key === 'P') { AUDIO.perc = !AUDIO.perc; return; }
  if (e.key === 'h' || e.key === 'H') { if (AUDIO.ready) toggleMelody(); return; }
  if (e.key === 'v' || e.key === 'V') { if (AUDIO.ready) toggleVoice(); return; }
  if (e.key === 'o' || e.key === 'O') {
    if (isPerformance) endPerformance(); else startPerformance();
    return;
  }
  if (e.key === 't' || e.key === 'T') { applyTypeface(typeIdx + 1); return; }
  if (e.key === 'm' || e.key === 'M') { muted = !muted; return; }
  if (e.key === 'r' || e.key === 'R') { blocks = []; return; }
  if (e.key === 'f' || e.key === 'F') { for (let i = 0; i < 6; i++) spawnFloater(); return; }
  if (e.key === '+' || e.key === '=') { tempo = Math.min(4, tempo * 1.25); syncPercTempo(); return; }
  if (e.key === '-' || e.key === '_') { tempo = Math.max(0.1, tempo / 1.25); syncPercTempo(); return; }
  if (e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key, 10) - 1;
    if (idx < SCENE_LIST.length) startScene(SCENE_LIST[idx]);
    return;
  }
});

canvas.addEventListener('click', () => { initAudio(); spawnDrop(); });

// =============================================================
//   ARRANQUE
// =============================================================

startScene('terminal');
requestAnimationFrame(loop);
