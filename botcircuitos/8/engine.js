
  

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

