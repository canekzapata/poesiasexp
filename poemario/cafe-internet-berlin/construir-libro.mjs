/* =====================================================================
   CAFÉ INTERNET, BERLÍN, 1997 — construir-libro.mjs

   el libro impreso se genera desde el mismo corpus que la pieza web.
   las dos versiones no pueden separarse: si una pieza cambia en
   corpus.js, cambia en el .txt y en el .md.

       node construir-libro.mjs

   emite:
     CAFE_INTERNET_BERLIN_1997.txt   manuscrito, tipografía de la casa
     CAFE_INTERNET_BERLIN_1997.md    misma edición, legible en cualquier visor
   ===================================================================== */

import { readFileSync, writeFileSync } from "node:fs";

/* corpus.js está escrito para el navegador: le damos un window */
const g = globalThis;
g.window = g;
eval(readFileSync(new URL("./corpus.js", import.meta.url), "utf8"));
const A = g.CAFE97.archivos;

const raiz = A.filter(a => a.dir === "");
const libro = A.filter(a => a.dir !== "");
const num = new Map(libro.map((a, i) => [a.ruta, String(i + 1).padStart(2, "0")]));

const GLIFO = {
  continuacion: "→", procedencia: "⌐", contradiccion: "↮",
  performativo: "⏎", roto: "✕", apocrifo: "⟳", cuidado: "♥"
};

const RE = /\{\{(\w+)\|([^|{}]+)\|([^|{}]+)\}\}/g;
/* el glifo declara la retórica; los puntos guía llevan al número */
const enlaces = t => String(t).replace(RE, (_, tipo, texto, ruta) => {
  const d = num.get(ruta) || ruta;
  const g = GLIFO[tipo] || "→";
  const p = ".".repeat(Math.max(3, 52 - texto.length - g.length));
  return `${g} ${texto} ${p} ${d}`;
});

const MONO = new Set(["log", "tabla", "sesion", "cola", "codigo", "correo", "ficha"]);
const kb = n => !n ? "0 b" : n < 1024 ? n + " b"
  : n < 1048576 ? (n / 1024).toFixed(1).replace(".0", "") + " kB"
  : (n / 1048576).toFixed(1).replace(".0", "") + " MB";

/* separa el cuerpo de las rutas del pie */
function partir(a) {
  const c = a.cuerpo.map(String);
  let i = c.length;
  while (i > 0 && (c[i - 1].trim() === "" || RE.test(c[i - 1]) && (RE.lastIndex = 0, true))) {
    if (c[i - 1].trim() === "") { i--; continue; }
    RE.lastIndex = 0;
    if (!RE.test(c[i - 1])) break;
    RE.lastIndex = 0; i--;
  }
  const cuerpo = c.slice(0, i);
  const rutas = c.slice(i).filter(l => l.trim());
  while (cuerpo.length && !cuerpo[cuerpo.length - 1].trim()) cuerpo.pop();
  return { cuerpo, rutas };
}

const FRENTE = readFileSync(new URL("./libro/frente.txt", import.meta.url), "utf8");
const DORSO  = readFileSync(new URL("./libro/dorso.txt",  import.meta.url), "utf8");

/* ---- índice: árbol de directorios ------------------------------------- */
const DIRS = [
  ["montage",     "montage/",     "mañana y tarde. todavía puede nombrarse cada cable"],
  ["public_html", "public_html/", "apertura. más densa socialmente, menos estable"],
  ["spool",       "spool/",       "no hay poemas terminados: hay trabajos"],
  ["nachtkopie",  "nachtkopie/",  "la sala se vacía mientras el archivo se multiplica"],
  ["morgen",      "morgen/",      "fechas imposibles y una página que sigue esperando"]
];

function indice() {
  let s = "    /cafe_berlin_1997\n";
  s += raiz.map(a => "    ├── " + a.ruta).join("\n") + "\n";
  DIRS.forEach(([d, t], gi) => {
    const ult = gi === DIRS.length - 1;
    s += `    ${ult ? "└" : "├"}── ${t}\n`;
    const rel = ult ? "    " : "│   ";
    /* works/ existe en el disco y está vacío: entra al índice sin número */
    const hijos = A.filter(a => a.dir === d)
      .map(a => [a.ruta.split("/").pop(), num.get(a.ruta)]);
    if (d === "public_html") hijos.push(["works/", "(vacío)"]);
    hijos.forEach(([nom, n], i) => {
      s += `    ${rel}${i === hijos.length - 1 ? "└" : "├"}── ${nom} `
         + ".".repeat(Math.max(2, 34 - nom.length)) + " " + n + "\n";
    });
  });
  return s;
}

/* ---- .txt -------------------------------------------------------------- */
function txt() {
  let s = FRENTE.replace("{{INDICE}}", indice());

  const seccion = (t, sub) =>
    "\n\n╔" + "═".repeat(70) + "╗\n" +
    ("║" + t.padStart(Math.floor((70 + t.length) / 2)).padEnd(70) + "║\n") +
    sub.map(l => "║" + l.padStart(Math.floor((70 + l.length) / 2)).padEnd(70) + "║\n").join("") +
    "╚" + "═".repeat(70) + "╝\n\n";

  raiz.forEach(a => {
    const { cuerpo, rutas } = partir(a);
    s += "\n\n" + "═".repeat(72) + "\n";
    s += a.ruta.padStart(Math.floor((72 + a.ruta.length) / 2)) + "\n";
    s += "═".repeat(72) + "\n\n";
    s += "".padEnd(Math.max(0, 72 - a.soporte.length - 2)) + a.soporte + "\n";
    s += "".padEnd(Math.max(0, 72 - (a.fecha + " · " + kb(a.peso)).length - 2)) +
         a.fecha + " · " + kb(a.peso) + "\n\n\n";
    s += cuerpo.join("\n") + "\n";
    if (rutas.length) s += "\n" + rutas.map(r => "        " + enlaces(r)).join("\n") + "\n";
    s += "\n" + notasTxt(a);
  });

  DIRS.forEach(([d, , desc]) => {
    s += seccion("/" + d, [desc]);
    A.filter(a => a.dir === d).forEach(a => {
      const { cuerpo, rutas } = partir(a);
      const cab = num.get(a.ruta) + " · " + a.titulo.toUpperCase();
      s += "\n" + cab + (a.hora ? (a.hora).padStart(72 - cab.length) : "") + "\n";
      s += "─".repeat(72) + "\n";
      s += "".padEnd(Math.max(0, 72 - a.soporte.length - 2)) + a.soporte + "\n";
      s += "".padEnd(Math.max(0, 72 - (a.fecha + " · " + kb(a.peso)).length - 2)) +
           a.fecha + " · " + kb(a.peso) + "\n\n\n";
      s += cuerpo.join("\n") + "\n";
      if (rutas.length) s += "\n" + rutas.map(r => "        " + enlaces(r)).join("\n") + "\n";
      s += "\n" + notasTxt(a) + "\n\n";
    });
  });

  return s + DORSO;
}

function envolver(t, ancho, sangria) {
  const p = []; let l = "";
  for (const w of t.split(/\s+/)) {
    if ((l + " " + w).trim().length > ancho) { p.push(l.trim()); l = w; }
    else l += " " + w;
  }
  if (l.trim()) p.push(l.trim());
  return p.map((x, i) => (i ? sangria : "") + x).join("\n");
}

function notasTxt(a) {
  const ns = notas(a);
  if (!ns.length) return "";
  return ns.map((n, i) => {
    const pre = `    ${i + 1} [${n.marca}] `;
    if (n.vacia) return pre.trimEnd() + "\n         " + "_".repeat(60) + "\n";
    return pre + envolver(enlaces(n.texto), 62, "         ");
  }).join("\n") + "\n";
}

/* la nota invasora se imprime completa; en pantalla crece con la lectura */
function notas(a) {
  const extra = (a.crecimiento || []).map((t, i) =>
    ({ marca: "M?", texto: (["PRIMERA","SEGUNDA","TERCERA","CUARTA","QUINTA",
       "SEXTA","SÉPTIMA","OCTAVA","NOVENA","DÉCIMA"][i] || (i+1)) + " LECTURA. " + t }));
  return extra.concat((a.notas || []).map(n =>
    n.nota6 ? { marca: n.marca, texto: "", vacia: true } : n));
}

/* ---- .md ---------------------------------------------------------------- */
function md() {
  let s = "# CAFÉ INTERNET, BERLÍN, 1997\n### reconstrucción imposible de un directorio llamado `morgen`\n\n";
  s += "> poesiasexp / canek zapata · serie *Cuadernos de Especulaciones Poéticas*\n\n";
  s += FRENTE.split("\n").slice(6).join("\n")
        .replace("{{INDICE}}", indice())
        .replace(/^(FICHA DEL DISCO|MARCAS DE ANOTACIÓN|ÍNDICE — ÁRBOL DE DIRECTORIOS|UMBRAL)$/gm, "\n## $1\n")
        .replace(/^(\s{4}.*)$/gm, "$1");
  s = s.replace(/\n(## .+)\n/g, "\n$1\n") + "\n";

  const pieza = (a, cab) => {
    const { cuerpo, rutas } = partir(a);
    let o = `\n\n---\n\n## ${cab}\n\n`;
    o += `\`${a.ruta}\` · ${a.hora && a.hora !== "—" ? a.hora + " · " : ""}${kb(a.peso)} · ${a.fecha}\n`;
    o += `*${a.soporte}*\n\n`;
    o += "```\n" + cuerpo.join("\n") + "\n```\n";
    if (rutas.length) o += "\n" + rutas.map(r => "- " + enlaces(r)).join("\n") + "\n";
    const ns = notas(a);
    if (ns.length) o += "\n" + ns.map((n, i) =>
      `> **${i + 1} [${n.marca}]** ` + (n.vacia ? "`________________________________________`" : enlaces(n.texto))
    ).join("\n>\n") + "\n";
    return o;
  };

  raiz.forEach(a => { s += pieza(a, "`" + a.ruta + "`"); });
  DIRS.forEach(([d, t, desc]) => {
    s += `\n\n---\n\n# /${d}\n\n*${desc}*\n`;
    A.filter(a => a.dir === d).forEach(a => {
      s += pieza(a, num.get(a.ruta) + " · " + a.titulo.toUpperCase());
    });
  });

  s += "\n\n---\n\n" + DORSO
    .replace(/^═+$/gm, "")
    .replace(/^ +(APARATO · RÉGIMEN DE VERDAD|COLOFÓN AMPLIADO)$/gm, "\n# $1\n")
    .replace(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ·,]+(?: \([^)]+\))?)$/gm, "\n## $1\n");
  return s;
}

writeFileSync(new URL("./CAFE_INTERNET_BERLIN_1997.txt", import.meta.url), txt());
writeFileSync(new URL("./CAFE_INTERNET_BERLIN_1997.md", import.meta.url), md());
console.log(`piezas ${libro.length} (+${raiz.length} de raíz) · notas ${A.reduce((s,a)=>s+notas(a).length,0)}`);
