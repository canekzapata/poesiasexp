#!/usr/bin/env node
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((arg, i, all) => {
  if (!arg.startsWith("--")) return ["_" + i, arg];
  const [key, inline] = arg.slice(2).split("=");
  return [key, inline ?? (all[i + 1]?.startsWith("--") ? true : all[i + 1])];
}));
const WORLD_SEED = String(args.seed || "otra-agua-2026");

function hash32(text) {
  let h = 1779033703 ^ String(text).length;
  for (let i = 0; i < String(text).length; i += 1) {
    h = Math.imul(h ^ String(text).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function rngFrom(text) {
  let a = hash32(text);
  return () => {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const worldRng = rngFrom(WORLD_SEED);
const requestedPages = Number(args.pages);
const PAGE_COUNT = Number.isFinite(requestedPages)
  ? Math.max(24, Math.min(72, Math.floor(requestedPages)))
  : 24 + Math.floor(worldRng() * 49);
const pad = n => String(n).padStart(3, "0");
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const int = (rng, min, max) => Math.floor(min + rng() * (max - min + 1));
const chance = (rng, p) => rng() < p;
const sample = (rng, list, count) => {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const style = entries => Object.entries(entries).map(([key, value]) => `${key}:${value}`).join(";");

const TOPOLOGIES = [
  "table", "field", "corridor", "vertical", "windows", "iframes", "form",
  "source", "cellular", "index", "empty", "error", "glyphs", "destruction", "reproducer"
];
const TOPOLOGY_LABELS = {
  table: "tabla infinita", field: "campo absoluto", corridor: "corredor horizontal",
  vertical: "documento vertical imposible", windows: "sistema de ventanas",
  iframes: "constelación de iframes", form: "formulario oracular",
  source: "código fuente habitable", cellular: "autómata habitable",
  index: "índice explosivo", empty: "página casi vacía", error: "error local",
  glyphs: "paisaje de glifos", destruction: "página que se autodestruye",
  reproducer: "página reproductora"
};
const RULES = [30, 45, 54, 60, 90, 110];
const RHYTHMS = ["still", "slow", "nervous", "explosive", "click", "scroll", "cellular"];
const RARE = ["monument", "same-text", "source", "glyph-only", "migration", "css-shift", "future-frame"];
const ACTIONS = ["normal", "normal", "normal", "window", "iframe", "destroy", "reproduce"];
const OPERATIONS = ["display", "position", "tag", "multiply", "hierarchy", "serialize", "link", "comment", "relocate", "swap", "iframe", "destroy"];
const WORDS = ["RÍO", "FUEGO", "ARCHIVO", "CENIZA", "CAUCE", "LENGUA", "OLVIDO", "ECO", "UMBRAL", "MARGEN", "ÍNDICE", "GLIFO", "COPIA", "ORIGINAL", "TIEMPO", "AGUA", "SIGNO", "RUIDO", "NAVE", "VENTANA"];
const LINKS = [
  "entrar por el margen", "seguir otra agua", "abrir la ceniza", "perder este destino",
  "doblar la ruta", "visitar el afuera", "copiar el hueco", "volver sin regresar",
  "traducir el borde", "hacer clic en la lluvia", "romper el índice",
  "habitar el atributo", "dejar que pase", "sembrar una ventana", "leer menos",
  "continuar en otra pestaña", "cerrar el verbo", "recordar este color"
];
const FRAGMENTS = [
  "El texto no fue escrito: fue encontrado escribiéndose.",
  "Un río no se lee dos veces con el mismo idioma.",
  "El archivo guarda todo menos el momento en que fue leído.",
  "El manuscrito existe sólo mientras nadie lo entiende.",
  "El signo apunta a otro signo, y así hasta el agua.",
  "Traducir es cruzar un río cargando el río.",
  "La trayectoria se curva como una frase que olvidó su verbo.",
  "La interfaz no muestra el mundo: lo hiere y lo vuelve visible.",
  "Desaparecer también es una manera de terminar la frase.",
  "Una regla mínima produce una tormenta, una célula produce una ciudad."
];
const MICRO = [
  "fragmento 0 de 0", "sentido parcial", "memoria no montada", "nodo ya futuro",
  "original: ninguna", "latencia del fuego", "este borde escucha", "la nota muerde",
  "ruido con sintaxis", "guardar sin conservar", "una ventana sueña", "cauce temporal"
];
const ERRORS = [
  "404: el significado cambió de cauce", "HANDSHAKE: la lengua no responde",
  "AssertionError: original no encontrado", "La ruta existe, pero dejó de conducir",
  "El documento confundió tu lectura con clima"
];
const CODE = [
  "GET /origen 302 cauce", "while(!entiendes){ excava(); }",
  "if (leído) archivo.olvidar();", "chmod 000 /manuscrito",
  "SELECT sentido FROM río WHERE ∅;", "catch(nada){ throw margen; }"
];
const GLYPH_SETS = [
  Array.from("𐇐𐇑𐇒𐇓𐇔𐇕𐇖𐇗𐇘𐇙𐇚𐇛𐇜𐇝𐇞𐇟𐇠𐇡𐇢𐇣𐇤𐇥𐇦𐇧𐇨𐇩"),
  Array.from("𒀀𒀁𒀂𒀃𒀄𒀅𒀆𒀇𒀈𒀉𒀊𒀋𒀌𒀍𒀎𒀏𒁃𒂷𒃻𒄞𒆳𒇻"),
  Array.from("𐘀𐘁𐘂𐘃𐘄𐘅𐘆𐘇𐘈𐘉𐘊𐘋𐘌𐘍𐘎𐘏𐘐𐘑𐘒𐘓"),
  Array.from("𓀀𓁐𓂀𓃀𓅃𓆃𓇋𓈖𓉐𓊃𓋴𓌂𓍯𓎁𓏏𓁷𓂝𓃰𓅓𓆓𓇳𓈗"),
  Array.from("≋≋≋〰〰﹏﹏∿∿∽∽≈≈≋⌇⌇⌁⌁⌇"),
  Array.from("╔╗╚╝╠╣╦╩╬┌┐└┘├┤┬┴┼▓▒░█▄▀")
];
const PALETTES = [
  ["#f8f7f1", "#050505", "#ff4fa3", "#147bff", "#b7ff3c", "#ff652b"],
  ["#050505", "#f7f1ff", "#ffd400", "#5a2dff", "#ff4fa3", "#b7ff3c"],
  ["#f8a9cb", "#20134d", "#75f4ff", "#ff6b00", "#f7ff8a", "#8e4dff"],
  ["#d9ff00", "#1900ff", "#ff2800", "#fff8e7", "#ff72bf", "#00b56a"],
  ["#001a39", "#fff1d7", "#ff7538", "#45d3ff", "#d9ff72", "#ff3b9f"],
  ["#fff", "#000", "#000", "#bbb", "#eee", "#555"],
  ["#2b0a3d", "#fff5c4", "#ff8dce", "#30e8c3", "#f5ff3f", "#7d63ff"],
  ["#ff5b22", "#151515", "#f4e8ff", "#0047ff", "#cbff00", "#ffb6de"],
  ["#b7d8ff", "#43006b", "#ffed00", "#ff4e91", "#e6fffa", "#1832ff"],
  ["#f0efe9", "#132519", "#8eeb83", "#ff9fbb", "#8758ff", "#ffe65c"],
  ["#ffe5f2", "#46112d", "#ec2f8b", "#185cff", "#ffca2a", "#78f0ce"],
  ["#2220a7", "#f9f4d2", "#ff6948", "#40e0ff", "#f0ff00", "#ff68cf"],
  ["#f6ff5f", "#351757", "#ff38a2", "#0d9dff", "#ffffff", "#ff792e"],
  ["#eff0ff", "#181829", "#694cff", "#ff3e66", "#00d9a6", "#ffd61e"],
  ["#281f21", "#ffefde", "#dcff62", "#ff4f9a", "#67a8ff", "#ff8f3d"]
];

function automataRows(rule, cols, rows, rng) {
  let row = Array.from({ length: cols }, () => rng() < .18 ? 1 : 0);
  if (!row.some(Boolean)) row[Math.floor(cols / 2)] = 1;
  const all = [row];
  for (let y = 1; y < rows; y += 1) {
    row = row.map((_, x) => {
      const l = row[(x - 1 + cols) % cols];
      const c = row[x];
      const r = row[(x + 1) % cols];
      return (rule >> ((l << 2) | (c << 1) | r)) & 1;
    });
    all.push(row);
  }
  return all;
}

function buildGraph(count, rng) {
  const graph = Array.from({ length: count }, (_, i) => new Set([(i + 1) % count, (i - 1 + count) % count]));
  graph.forEach((edges, i) => {
    const extra = int(rng, 1, 4);
    while (edges.size < extra + 2) {
      const target = int(rng, 0, count - 1);
      if (target !== i) edges.add(target);
    }
  });
  return graph.map(set => Array.from(set));
}

const graph = buildGraph(PAGE_COUNT, worldRng);
const hiddenSet = new Set(sample(worldRng, Array.from({ length: PAGE_COUNT }, (_, i) => i).slice(2), Math.max(3, Math.floor(PAGE_COUNT * .13))));

const nodes = Array.from({ length: PAGE_COUNT }, (_, id) => {
  const rng = rngFrom(`${WORLD_SEED}:page:${id}`);
  const topology = TOPOLOGIES[id % TOPOLOGIES.length];
  const palette = PALETTES[(id + int(rng, 0, PALETTES.length - 1)) % PALETTES.length];
  const rhythm = topology === "destruction" ? "slow" : topology === "index" ? "click" : topology === "field" ? "scroll" : pick(rng, RHYTHMS);
  return {
    id: pad(id),
    index: id,
    topology,
    topologyLabel: TOPOLOGY_LABELS[topology],
    secondary: pick(rng, TOPOLOGIES.filter(t => t !== topology)),
    palette,
    cellularRule: pick(rng, RULES),
    cellSize: int(rng, 4, 14),
    cellDensity: Number((.09 + rng() * .25).toFixed(2)),
    rhythm,
    iframeDepth: int(rng, 1, 3),
    mutationBudget: rhythm === "explosive" ? int(rng, 24, 38) : int(rng, 8, 24),
    operations: sample(rng, OPERATIONS, int(rng, 4, 8)),
    rareEvent: pick(rng, RARE),
    rareProbability: Number((.22 + rng() * .44).toFixed(2)),
    edges: graph[id].map(pad),
    hidden: hiddenSet.has(id),
    word: pick(rng, WORDS),
    title: `${pick(rng, WORDS).toLowerCase()} / ${pick(rng, MICRO)}`
  };
});

function pageHref(target) { return `./${pad(Number(target))}.html`; }
function route(rng, target, label, action = pick(rng, ACTIONS), extra = "") {
  return `<a class="route" href="${pageHref(target)}" data-target="${pad(Number(target))}" data-action="${action}" ${extra}>${esc(label || pick(rng, LINKS))}</a>`;
}
function routesFor(node, rng, count = node.edges.length) {
  return sample(rng, node.edges, Math.min(count, node.edges.length)).map((target, i) => route(rng, target, i === 0 ? pick(rng, LINKS) : null, i === 0 ? "normal" : pick(rng, ACTIONS))).join("");
}
function glyphString(rng, length) {
  const sets = sample(rng, GLYPH_SETS, int(rng, 1, 3)).flat();
  return Array.from({ length }, () => pick(rng, sets)).join("");
}

function tablePage(node, rng) {
  const cols = int(rng, 28, 48);
  const rows = int(rng, 18, 34);
  const cells = automataRows(node.cellularRule, cols, rows, rng);
  let edgeIndex = 0;
  const html = cells.map((row, y) => `<tr>${row.map((alive, x) => {
    if (alive && edgeIndex < node.edges.length && (x + y) % 13 === 0) {
      return `<td class="alive wide" colspan="${int(rng, 1, 4)}">${route(rng, node.edges[edgeIndex++], pick(rng, WORDS), pick(rng, ACTIONS))}</td>`;
    }
    const content = alive ? (chance(rng, .22) ? esc(pick(rng, WORDS)).slice(0, 1) : "") : (chance(rng, .025) ? esc(pick(rng, MICRO)) : "");
    return `<td class="${alive ? "alive" : "dead"}" data-mutable style="--cell-color:${node.palette[(x + y) % node.palette.length]}">${content}</td>`;
  }).join("")}</tr>`).join("");
  return `<main class="topology-table"><table class="lab-table"><caption class="sr-only">${esc(node.title)}</caption><tbody>${html}</tbody></table></main>`;
}

function fieldPage(node, rng) {
  const w = int(rng, 4200, 7600);
  const h = int(rng, 2600, 5600);
  const parts = [];
  parts.push(`<div class="monument outline" data-mutable style="left:${int(rng, 120, w - 1600)}px;top:${int(rng, 100, h - 900)}px">${esc(node.word)}</div>`);
  for (let i = 0; i < int(rng, 28, 48); i += 1) {
    const x = int(rng, 0, w - 500), y = int(rng, 0, h - 220);
    if (i < node.edges.length) parts.push(`<div class="${i === 1 ? "cursor-migrant" : ""}" style="left:${x}px;top:${y}px">${route(rng, node.edges[i], pick(rng, LINKS), pick(rng, ACTIONS))}</div>`);
    else if (chance(rng, .32)) parts.push(`<span class="glyph" data-mutable style="left:${x}px;top:${y}px;font-size:${int(rng, 14, 170)}px;color:${pick(rng, node.palette)}">${glyphString(rng, int(rng, 1, 8))}</span>`);
    else parts.push(`<span class="micro rotated" data-mutable style="left:${x}px;top:${y}px;--r:${int(rng, -90, 90)}deg">${esc(pick(rng, MICRO))}</span>`);
  }
  node.edges.slice(0, 3).forEach((target, i) => parts.push(`<span id="coordinate-${i}" class="coordinate-anchor" style="left:${int(rng, 0, w)}px;top:${int(rng, 0, h)}px">${route(rng, target, `x:${int(rng, -400, 8888)} y:${int(rng, -400, 8888)}`, "normal")}</span>`));
  return `<main class="absolute-world" style="--world-w:${w}px;--world-h:${h}px">${parts.join("")}</main>`;
}

function corridorPage(node, rng) {
  const zones = int(rng, 10, 17);
  const widths = Array.from({ length: zones }, () => int(rng, 380, 1700));
  const total = widths.reduce((a, b) => a + b, 0);
  let edgeIndex = 0;
  const html = widths.map((width, i) => {
    const bg = node.palette[(i + 2) % node.palette.length];
    const fg = node.palette[(i + 3) % node.palette.length];
    const link = edgeIndex < node.edges.length && (i % 2 === 0 || i === zones - 1)
      ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS), `style="--x:${int(rng, 5, 80)}%;--y:${int(rng, 8, 82)}%"`)
      : "";
    return `<section class="corridor-zone" style="--zone-w:${width}px;--zone-bg:${bg};--zone-fg:${fg}" data-mutable>${link}<div class="corridor-word">${esc(i % 3 ? pick(rng, WORDS) : glyphString(rng, int(rng, 4, 16)))}</div><span class="vertical micro" style="position:absolute;right:4px;top:4px">${esc(pick(rng, MICRO))}</span></section>`;
  }).join("");
  return `<main class="corridor" style="--world-w:${total}px">${html}</main>`;
}

function verticalPage(node, rng) {
  let edgeIndex = 0;
  const bands = Array.from({ length: int(rng, 8, 13) }, (_, i) => {
    const bg = node.palette[i % node.palette.length];
    const fg = node.palette[(i + 1) % node.palette.length];
    const link = edgeIndex < node.edges.length ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS), `style="--x:${int(rng, 6, 80)}%;--y:${int(rng, 38, 88)}%"`) : "";
    return `<section class="depth-band" style="--band-h:${int(rng, 80, 210)}vh;--band-bg:${bg};--band-fg:${fg}" data-mutable><div class="depth-word ${i % 2 ? "outline" : ""}">${esc(i % 4 ? pick(rng, WORDS) : glyphString(rng, int(rng, 3, 12)))}</div>${link}<p class="micro vertical" style="position:absolute;right:${int(rng, 2, 30)}%;bottom:4%">profundidad ${i} / regla ${node.cellularRule} / ${esc(pick(rng, MICRO))}</p></section>`;
  }).join("");
  return `<main class="vertical-document">${bands}</main>`;
}

function windowsPage(node, rng) {
  let edgeIndex = 0;
  const windows = Array.from({ length: int(rng, 8, 15) }, (_, i) => {
    const containsFrame = i === 2 && node.edges[2];
    const body = containsFrame
      ? `<iframe title="otra zona" loading="lazy" data-src="${pageHref(node.edges[2])}"></iframe>`
      : i < node.edges.length ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS)) : (chance(rng, .5) ? `<span class="glyph">${glyphString(rng, int(rng, 3, 34))}</span>` : esc(pick(rng, FRAGMENTS)));
    return `<section class="poem-window" data-mutable style="--x:${int(rng, -4, 78)}vw;--y:${int(rng, 1, 82)}vh;--w:${int(rng, 160, 520)}px;--h:${int(rng, 60, 330)}px;--z:${i};--win-bg:${node.palette[(i + 1) % node.palette.length]};--win-fg:${node.palette[(i + 2) % node.palette.length]};--bar-bg:${node.palette[(i + 3) % node.palette.length]}"><div class="window-bar"><span>${esc(pick(rng, MICRO))}</span><button class="window-close" aria-label="cerrar ventana">×</button></div><div class="window-body">${body}</div></section>`;
  }).join("");
  return `<main class="window-field">${windows}</main>`;
}

function iframesPage(node, rng) {
  const frames = Array.from({ length: int(rng, 6, 11) }, (_, i) => {
    const target = node.edges[i % node.edges.length];
    return `<section class="iframe-cell" data-mutable style="--x:${int(rng, -8, 82)}vw;--y:${int(rng, 2, 128)}vh;--w:${int(rng, 120, 600)}px;--h:${int(rng, 80, 430)}px;--r:${int(rng, -9, 9)}deg;--bw:${int(rng, 1, 16)}px;--frame-color:${node.palette[i % node.palette.length]}"><span class="iframe-label">${esc(pick(rng, MICRO))}</span><iframe title="${esc(pick(rng, MICRO))}" loading="lazy" data-src="${pageHref(target)}"></iframe></section>`;
  }).join("");
  return `<main class="iframe-field">${frames}<nav style="position:absolute;z-index:20;right:1vw;bottom:1vh">${routesFor(node, rng, 2)}</nav><div class="outline" style="position:absolute;left:2vw;bottom:1vh;font:900 16vw/.7 Arial">${esc(node.word)}</div></main>`;
}

function formPage(node, rng) {
  const checks = sample(rng, LINKS, 7).map((label, i) => `<label><input type="checkbox" ${i === 0 ? "checked" : ""}> ${esc(label)}</label>`).join("");
  const radios = sample(rng, MICRO, 5).map((label, i) => `<label><input type="radio" name="original" ${i === 0 ? "checked" : ""}> ${esc(label)}</label>`).join("");
  return `<form class="oracle-form" action="${pageHref(node.edges[0])}" method="get"><fieldset><legend>${glyphString(rng, 5)} / seleccione las regiones que existen</legend>${checks}</fieldset><fieldset><legend>versión considerada original</legend>${radios}<select aria-label="gramática cromática"><option value="${node.palette[0]}">agua</option><option value="${node.palette[2]}">ventana</option><option value="${node.palette[4]}">error</option></select>${routesFor(node, rng, 2)}</fieldset><fieldset><legend>entropía del DOM</legend><input type="range" min="0" max="100" value="${int(rng, 12, 78)}"><progress max="100" value="${int(rng, 20, 90)}"></progress><meter min="0" max="1" value="${rng().toFixed(2)}"></meter><output>${esc(pick(rng, MICRO))}</output></fieldset><fieldset><legend>reescriba el atributo que lo contiene</legend><textarea name="cauce">${esc(pick(rng, FRAGMENTS))}</textarea><button type="submit">${esc(pick(rng, LINKS))}</button></fieldset></form>`;
}

function sourcePage(node, rng) {
  const edge = () => node.edges[int(rng, 0, node.edges.length - 1)];
  const lines = [
    [`&lt;!doctype <button class="code-token" data-op="class">html</button>&gt;`, 0],
    [`&lt;<button class="code-token" data-op="div">html</button> lang="otra-agua" data-original="ninguno"&gt;`, 0],
    [`&lt;head&gt;&lt;title&gt;${esc(node.title)}&lt;/title&gt;&lt;/head&gt;`, 2],
    [`&lt;body class="<button class="code-token" data-op="class">cauce archivo margen</button>"&gt;`, 0],
    [`&lt;table data-regla="${node.cellularRule}"&gt;`, 4],
    [`&lt;tr&gt;&lt;td&gt;${glyphString(rng, 12)}&lt;/td&gt;&lt;/tr&gt;`, 8],
    [`&lt;a <button class="code-token" data-op="href">href</button>="${pageHref(edge())}"&gt;${esc(pick(rng, LINKS))}&lt;/a&gt;`, 8],
    [`&lt;div data-memoria="imperfecta"&gt;${esc(pick(rng, FRAGMENTS))}`, 12],
    [`<button class="code-token" data-op="close">&lt;/div&gt;</button>`, 12],
    [`&lt;!-- ${esc(pick(rng, MICRO))} --&gt;`, 4],
    [`&lt;a href="${pageHref(edge())}"&gt;${esc(pick(rng, CODE))}&lt;/a&gt;`, 22],
    [`<button class="code-token" data-op="close">&lt;/body&gt;</button>&lt;/html&gt;`, 0]
  ];
  return `<main class="source-world">${lines.concat(lines.slice(4, int(rng, 7, 12))).map(([line, indent]) => `<div class="code-line" data-mutable style="--indent:${indent}ch">${line}</div>`).join("")}<div class="code-line" style="--indent:8ch">&lt;a href=\"${pageHref(node.edges[0])}\"&gt; ${route(rng, node.edges[0], "href", "normal")} &lt;/a&gt;</div></main>`;
}

function cellularPage(node, rng) {
  const links = Array.from({ length: int(rng, 14, 36) }, (_, i) => {
    if (i % int(rng, 3, 7)) return `<span></span>`;
    return route(rng, node.edges[i % node.edges.length], chance(rng, .5) ? glyphString(rng, 1) : pick(rng, WORDS).slice(0, 1), pick(rng, ACTIONS));
  }).join("");
  return `<main class="cellular-page"><canvas class="cellular-canvas" aria-hidden="true"></canvas><div class="cellular-links" style="--cols:${int(rng, 14, 38)}">${links}</div><div class="cellular-title">${esc(node.word)}</div></main>`;
}

function indexPage(node, rng) {
  const links = Array.from({ length: int(rng, 28, 64) }, (_, i) => route(rng, node.edges[i % node.edges.length], i % 4 ? pick(rng, LINKS) : `${pad(i)}.${pick(rng, MICRO)}`, i % 5 === 0 ? "multiply" : pick(rng, ["multiply", "multiply", "destroy", "normal"]), `style="--r:${int(rng, -12, 12)}deg;--s:${int(rng, 7, 28)}px"`)).join("");
  return `<main class="explosive-index"><nav aria-label="índice que se reproduce">${links}</nav><div class="index-collapse outline">${esc(node.word)}</div></main>`;
}

function emptyPage(node, rng) {
  const w = int(rng, 4200, 7800), h = int(rng, 3200, 6500);
  const links = node.edges.map((target, i) => `<a class="route ${i ? "empty-pixel" : "micro"}" href="${pageHref(target)}" data-target="${target}" data-action="${i ? "normal" : pick(rng, ACTIONS)}" style="left:${int(rng, 80, w - 200)}px;top:${int(rng, 80, h - 100)}px">${i ? "·" : esc(pick(rng, MICRO))}</a>`).join("");
  return `<main class="empty-world" style="--world-w:${w}px;--world-h:${h}px">${links}<span class="micro" style="left:${int(rng, 30, w - 300)}px;top:${int(rng, 30, h - 100)}px">${esc(pick(rng, MICRO))}</span></main>`;
}

function errorPage(node, rng) {
  const rows = Array.from({ length: int(rng, 5, 10) }, (_, i) => `<tr><td>${i ? "" : esc(pick(rng, WORDS))}</td><td>${esc(pick(rng, ERRORS))}</td><td>${i < node.edges.length ? route(rng, node.edges[i], i ? "∅" : pick(rng, LINKS), pick(rng, ACTIONS)) : "href=\"\""}</td></tr>`).join("");
  return `<main class="error-world"><aside class="error-aside"><p>${esc(pick(rng, CODE))}</p><p>${esc(pick(rng, MICRO))}</p><form class="repair-form"><label>archivo de reparación <input value="${esc(pick(rng, WORDS))}"></label><button>reparar antes</button></form></aside><section class="error-body"><div class="error-code outline">${pick(rng, ["404", "0/0", "∅", "302"])}</div><img class="missing-image" src="../adendas/imagen-que-no-existe-${node.id}.gif" alt="imagen ausente: ${esc(pick(rng, FRAGMENTS))}"><table class="broken-table">${rows}</table></section></main>`;
}

function glyphPage(node, rng) {
  const layers = Array.from({ length: int(rng, 7, 12) }, (_, i) => {
    let material = glyphString(rng, int(rng, 80, 430));
    if (i < node.edges.length) material = `${material.slice(0, 30)} ${route(rng, node.edges[i], glyphString(rng, int(rng, 1, 3)), pick(rng, ACTIONS))} ${material.slice(30)}`;
    return `<div class="glyph-layer" data-mutable style="top:${int(rng, -5, 105)}vh;--size:${int(rng, 12, 110)}px;--tracking:${int(rng, -4, 14)}px;--layer-color:${node.palette[i % node.palette.length]}">${material}</div>`;
  }).join("");
  return `<main class="glyph-landscape" style="--sky:${node.palette[0]}">${layers}<span class="vertical micro" style="position:absolute;z-index:20;right:1vw;top:2vh">${esc(pick(rng, FRAGMENTS))}</span></main>`;
}

function destructionPage(node, rng) {
  let edgeIndex = 0;
  const mortals = Array.from({ length: int(rng, 35, 72) }, (_, i) => {
    if (edgeIndex < node.edges.length && i % 11 === 0) return `<span class="mortal">${route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS))}</span>`;
    const tag = pick(rng, ["span", "b", "i", "mark", "small", "code"]);
    return `<${tag} class="mortal" data-mutable>${chance(rng, .35) ? glyphString(rng, int(rng, 1, 8)) : esc(pick(rng, i % 3 ? MICRO : FRAGMENTS))}</${tag}>`;
  }).join("");
  return `<main class="destruction-field"><div style="font:900 18vw/.7 Arial" class="outline">${esc(node.word)}</div>${mortals}</main>`;
}

function reproducerPage(node, rng) {
  const children = Array.from({ length: int(rng, 5, 10) }, (_, i) => `<section class="descendant" data-mutable style="--x:${int(rng, 0, 78)}vw;--y:${int(rng, 2, 76)}vh;--w:${int(rng, 120, 460)}px;--h:${int(rng, 70, 300)}px;--desc-bg:${node.palette[(i + 2) % node.palette.length]};--desc-fg:${node.palette[(i + 3) % node.palette.length]};--desc-shadow:${node.palette[(i + 4) % node.palette.length]}">${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), i === 0 ? "reproduce" : pick(rng, ACTIONS), i === 0 ? `data-birth="download"` : "") : esc(pick(rng, FRAGMENTS))}</section>`).join("");
  return `<main class="reproducer-field"><div class="micro">doble clic: producir un interior · ${esc(pick(rng, MICRO))}</div>${children}</main>`;
}

const renderers = {
  table: tablePage, field: fieldPage, corridor: corridorPage, vertical: verticalPage,
  windows: windowsPage, iframes: iframesPage, form: formPage, source: sourcePage,
  cellular: cellularPage, index: indexPage, empty: emptyPage, error: errorPage,
  glyphs: glyphPage, destruction: destructionPage, reproducer: reproducerPage
};

function pageDocument(node) {
  const rng = rngFrom(`${WORLD_SEED}:render:${node.id}`);
  const [bg, fg, a, b, c, d] = node.palette;
  const vars = `--bg:${bg};--fg:${fg};--a:${a};--b:${b};--c:${c};--d:${d};--cell:${node.cellSize + 8}px;--speed:${int(rng, 4, 15)}s`;
  const className = `topology-${node.topology}`;
  const body = renderers[node.topology](node, rng);
  const config = { ...node, worldSeed: WORLD_SEED };
  return `<!doctype html>
<html lang="es" style="${vars}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${esc(node.title)}</title>
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/mutaciones.css">
  <script>window.LAB_PAGE=${JSON.stringify(config).replace(/</g, "\\u003c")};</script>
  <script defer src="../js/corpus.js"></script>
  <script defer src="../js/automatas.js"></script>
  <script defer src="../js/rutas.js"></script>
  <script defer src="../js/gramaticas.js"></script>
  <script defer src="../js/motor.js"></script>
</head>
<body class="${className}" data-topology="${node.topology}">
  <div class="lab-meta" aria-hidden="true"><span>${node.id}</span><span>R${node.cellularRule}</span><span>${esc(node.rhythm)}</span></div>
  ${body}
</body>
</html>`;
}

function portalDocument() {
  const visible = nodes.filter(node => !node.hidden);
  const cells = Array.from({ length: 192 }, (_, i) => {
    const node = visible[(i * 7 + 3) % visible.length];
    const live = (i * node.cellularRule + node.index) % 11 < 3;
    if (!live && i % 17) return `<span style="background:${nodes[i % nodes.length].palette[i % 6]}"></span>`;
    return `<a href="paginas/${node.id}.html?seed=${encodeURIComponent(WORLD_SEED)}" title="${esc(node.topologyLabel)}">${i % 5 ? esc(node.word.slice(0, 1)) : node.id}</a>`;
  }).join("");
  const palette = nodes[0].palette;
  return `<!doctype html><html lang="es" style="--bg:${palette[0]};--fg:${palette[1]};--a:${palette[2]};--b:${palette[3]};--c:${palette[4]};--d:${palette[5]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>otra internet dentro del mismo corpus</title><link rel="stylesheet" href="css/base.css"></head><body><main class="portal"><div class="portal-grid">${cells}</div><h1 class="portal-title outline">${esc(nodes[0].word)}<br>${esc(nodes[1].word)}</h1><form class="seed-form" id="seed-form"><input name="seed" value="${esc(WORLD_SEED)}" aria-label="semilla"><button>otra internet</button><a class="route" href="mapa.html?seed=${encodeURIComponent(WORLD_SEED)}">mapa que miente</a></form></main><script>document.getElementById('seed-form').addEventListener('submit',function(e){e.preventDefault();var s=this.seed.value||Math.random().toString(36).slice(2);var links=document.querySelectorAll('.portal-grid a');var n=Math.floor(Math.random()*links.length);location.href=links[n].getAttribute('href').replace(/seed=[^&]*/, 'seed='+encodeURIComponent(s));});</script></body></html>`;
}

function mapDocument() {
  return `<!doctype html><html lang="es" style="--bg:#050505;--fg:#f8f7f1;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c;--d:#ff652b"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>el mapa no contiene el territorio local</title><link rel="stylesheet" href="css/base.css"><script defer src="manifest.js"></script></head><body style="overflow:hidden"><canvas id="map" style="position:fixed;inset:0;width:100%;height:100%"></canvas><a class="route" href="index.html" style="position:fixed;left:8px;top:8px;z-index:2">fuera del mapa</a><div id="nodes" style="position:fixed;inset:0;z-index:1"></div><script>addEventListener('load',function(){var m=window.LAB_MANIFEST;var c=document.getElementById('map');var x=c.getContext('2d');var d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;x.scale(d,d);x.fillStyle='#050505';x.fillRect(0,0,innerWidth,innerHeight);var pts=m.pages.map(function(p,i){var a=i*2.39996;var r=30+Math.sqrt(i/m.pages.length)*Math.min(innerWidth,innerHeight)*.44;return{x:innerWidth/2+Math.cos(a)*r,y:innerHeight/2+Math.sin(a)*r,p:p}});x.globalAlpha=.58;pts.forEach(function(q){q.p.edges.forEach(function(id){var t=pts[Number(id)];if(!t)return;x.strokeStyle=q.p.palette[2];x.beginPath();x.moveTo(q.x,q.y);x.quadraticCurveTo(innerWidth/2,innerHeight/2,t.x,t.y);x.stroke()})});var layer=document.getElementById('nodes');pts.filter(function(q){return !q.p.hidden}).forEach(function(q){var a=document.createElement('a');a.className='route';a.href='paginas/'+q.p.id+'.html?seed='+encodeURIComponent(m.seed);a.textContent=q.p.id;a.title=q.p.topologyLabel;a.style.cssText='position:absolute;left:'+q.x+'px;top:'+q.y+'px;transform:translate(-50%,-50%);background:'+q.p.palette[0]+';color:'+q.p.palette[1]+';font-size:8px';layer.appendChild(a)})});</script></body></html>`;
}

function outsideDocument() {
  const target = nodes.find(node => node.hidden) || nodes[nodes.length - 1];
  return `<!doctype html><html lang="es" style="--bg:#fff;--fg:#111;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>afuera también era una carpeta</title><link rel="stylesheet" href="css/base.css"></head><body><main class="empty-world" style="--world-w:5600px;--world-h:4200px"><a class="route micro" href="paginas/${target.id}.html?seed=${encodeURIComponent(WORLD_SEED)}" style="left:4380px;top:3300px">lo que el mapa ocultó</a><a class="empty-pixel" href="index.html" style="left:17px;top:21px">volver</a></main></body></html>`;
}

function errorRootDocument() {
  const targets = sample(worldRng, nodes, 5);
  return `<!doctype html><html lang="es" style="--bg:#f8f7f1;--fg:#050505;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>error local que contiene rutas</title><link rel="stylesheet" href="css/base.css"></head><body><main class="error-world"><aside class="error-aside">manifest.corrupt<br>${esc(WORLD_SEED)}<br>${PAGE_COUNT} documentos</aside><section class="error-body"><div class="error-code outline">0/0</div><table class="broken-table">${targets.map(node => `<tr><td>${esc(node.topologyLabel)}</td><td><a class="route" href="paginas/${node.id}.html?seed=${encodeURIComponent(WORLD_SEED)}">${node.id}</a></td></tr>`).join("")}</table></section></main></body></html>`;
}

async function write(relative, content) {
  const path = join(ROOT, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

const manifest = {
  version: 2,
  generatedAt: new Date(0).toISOString(),
  seed: WORLD_SEED,
  pageCount: PAGE_COUNT,
  hiddenCount: hiddenSet.size,
  rules: RULES,
  topologies: TOPOLOGY_LABELS,
  pages: nodes
};

await mkdir(join(ROOT, "paginas"), { recursive: true });
const previousPages = await readdir(join(ROOT, "paginas"));
await Promise.all(previousPages.filter(name => /^\d{3}\.html$/.test(name)).map(name => unlink(join(ROOT, "paginas", name))));
await Promise.all(nodes.map(node => write(`paginas/${node.id}.html`, pageDocument(node))));
await Promise.all([
  write("index.html", portalDocument()),
  write("mapa.html", mapDocument()),
  write("afuera.html", outsideDocument()),
  write("error.html", errorRootDocument()),
  write("manifest.json", JSON.stringify(manifest, null, 2) + "\n"),
  write("manifest.js", `window.LAB_MANIFEST=${JSON.stringify(manifest).replace(/</g, "\\u003c")};\n`)
]);

console.log(`laberinto generado: ${PAGE_COUNT} páginas · semilla ${WORLD_SEED} · ${hiddenSet.size} ocultas`);
