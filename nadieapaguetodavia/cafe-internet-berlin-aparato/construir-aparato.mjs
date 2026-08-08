/* =====================================================================
   NADIE APAGUE TODAVÍA — aparato crítico
   construir-aparato.mjs

   Emite las dos salidas impresas desde el mismo corpus que alimenta el
   pliego ejecutable, para que no puedan separarse.

   La versión impresa es la EDICIÓN DIPLOMÁTICA: presenta todas las
   lecturas y no resuelve ninguna. Es incapaz, a propósito, de lo único
   que hace la máquina — obligar a elegir y cobrar por la elección.

     node construir-aparato.mjs
   ===================================================================== */

import { readFileSync, writeFileSync } from "node:fs";

/* ---- cargar el corpus sin navegador ------------------------------------ */

const src = readFileSync(new URL("./corpus.js", import.meta.url), "utf8");
const window = {};
eval(src);
const A = window.APARATO;

const FRENTE = readFileSync(new URL("./libro/frente.txt", import.meta.url), "utf8");
const DORSO  = readFileSync(new URL("./libro/dorso.txt", import.meta.url), "utf8");

const ANCHO = 76;

/* ---- utilidades -------------------------------------------------------- */

function envolver(texto, ancho, sangria = "") {
  const palabras = String(texto).split(/\s+/).filter(Boolean);
  const lineas = [];
  let l = "";
  for (const p of palabras) {
    if (l && (l + " " + p).length > ancho) { lineas.push(l); l = p; }
    else l = l ? l + " " + p : p;
  }
  if (l) lineas.push(l);
  return lineas.map((x, i) => (i === 0 ? sangria + x : sangria + x)).join("\n");
}

/* [[21]] -> «título» 21 · [[T:C]] -> C */
function planas(t) {
  return String(t)
    .replace(/\[\[T:([A-Z])\]\]/g, "$1")
    .replace(/\[\[(\d+)\]\]/g, (_, n) => {
      const p = A.piezas.find((x) => x.n === +n);
      return p ? `«${p.titulo}» (${n})` : n;
    });
}

function rep(c, n) { return c.repeat(Math.max(0, n)); }

/* agrupa lecturas idénticas bajo una sigla compuesta: CD, DP, … */
function agrupar(l) {
  const porTexto = new Map();
  for (const s of Object.keys(l)) {
    const t = l[s];
    if (!porTexto.has(t)) porTexto.set(t, []);
    porTexto.get(t).push(s);
  }
  return [...porTexto.entries()].map(([texto, siglas]) => ({ texto, siglas: siglas.join("") }));
}

function etiqueta(p) {
  return { restituible: "restituible", fragmentaria: "fragmentaria",
           perdida: "perdida", sin_testimonio: "sin testimonio" }[p.estado];
}

/* ---- cuerpo del aparato, en texto -------------------------------------- */

function piezaTxt(p) {
  let s = "";
  const cab = `${String(p.n).padStart(2, "0")} · ${p.titulo}`;
  s += cab + "\n";
  s += rep("─", Math.min(ANCHO, cab.length + 4)) + "\n";
  s += `folio ${p.folio} · ${etiqueta(p)}\n\n`;

  let num = 0;
  for (const v of p.versos || []) {
    if (v.blanco) { s += "\n"; continue; }
    num++;
    const gutter = String(num).padStart(4, " ") + " │ ";
    const vacio  = "     │ ";

    if (v.laguna) {
      s += gutter + rep("·", Math.min(38, Math.round(v.laguna / 1.6))) +
           `  laguna · ${v.laguna} signos\n`;
      continue;
    }

    const grupos = agrupar(v.l);
    grupos.forEach((g, i) => {
      const sig = g.siglas.padEnd(3, " ");
      const cuerpo = envolver(g.texto, ANCHO - 11, "").split("\n");
      cuerpo.forEach((linea, j) => {
        s += (i === 0 && j === 0 ? gutter : vacio) +
             (j === 0 ? sig : "   ") + " " + linea + "\n";
      });
    });
    if (grupos.length > 1) {
      s += vacio + `    ── ${grupos.length} lecturas en desacuerdo. la edición impresa no elige.\n`;
    }
  }

  if (!(p.versos || []).length) {
    if (p.estado === "perdida") {
      s += "     │ sin testimonio. sólo el título, en el índice escrito al dorso\n";
      s += "     │ del plano de la sala.\n";
    } else {
      s += "     │ ningún testigo lo vio. en el pliego ejecutable este folio\n";
      s += "     │ está en blanco y admite lo que escriba quien lee.\n";
    }
  }

  if (p.notas?.length) {
    s += "\n";
    for (const n of p.notas) {
      const marca = `[${n.m}]`.padEnd(12, " ");
      const texto = envolver(planas(n.t), ANCHO - 12, "").split("\n");
      texto.forEach((linea, i) => {
        s += (i === 0 ? marca : rep(" ", 12)) + linea + "\n";
      });
    }
  }

  return s + "\n";
}

function tablaTestigos() {
  let s = "";
  for (const t of A.testigos) {
    s += `  ${t.sigla}   ${t.nombre}\n`;
    s += `      ${t.soporte}\n`;
    s += `      ${t.fecha} · ${planas(t.procedencia)}\n`;
    s += envolver("virtud: " + planas(t.virtud), ANCHO - 6, "      ") + "\n";
    s += envolver("falla:  " + planas(t.falla), ANCHO - 6, "      ") + "\n\n";
  }
  return s;
}

function indiceTxt() {
  let s = "";
  for (const c of A.cuadernillos) {
    s += `\n  cuadernillo ${c.id} · ${c.nombre} (${c.glosa})\n`;
    for (const p of A.piezas.filter((p) => p.n >= c.desde && p.n <= c.hasta)) {
      const n = String(p.n).padStart(2, "0");
      const puntos = rep(".", Math.max(2, 52 - p.titulo.length));
      s += `    ${n}  ${p.titulo} ${puntos} ${etiqueta(p)}\n`;
    }
  }
  return s;
}

/* ---- .txt --------------------------------------------------------------- */

function txt() {
  let s = FRENTE
    .replace("{{TESTIGOS}}", tablaTestigos())
    .replace("{{INDICE}}", indiceTxt());
  s += "\n\n";
  for (const c of A.cuadernillos) {
    const t = `CUADERNILLO ${c.id} · ${c.nombre.toUpperCase()} (${c.glosa})`;
    s += "\n" + rep("═", ANCHO) + "\n" + t + "\n" + rep("═", ANCHO) + "\n\n";
    for (const p of A.piezas.filter((p) => p.n >= c.desde && p.n <= c.hasta)) {
      s += piezaTxt(p);
    }
  }
  s += DORSO;
  return s;
}

/* ---- .md ---------------------------------------------------------------- */

function md() {
  let s = "# ~~NADIE APAGUE TODAVÍA~~\n";
  s += "### aparato crítico de un poemario que no se conserva\n\n";
  s += "> poesiasexp / canek zapata · serie *Cuadernos de Especulaciones Poéticas*\n\n";
  s += "Poemario de Mara Ionescu (atribuido). Berlín, 1997. Cuarenta piezas. Perdido.\n";
  s += "Lo que sigue es su aparato: cinco testigos parciales que no están de acuerdo.\n";
  s += "Esta salida es la **edición diplomática**: presenta todas las lecturas y no\n";
  s += "resuelve ninguna. Para resolverlas hay que abrir `index.html`, donde elegir\n";
  s += "cuesta algo.\n\n";

  s += "## Los testigos\n\n";
  s += "| | testigo | soporte | virtud | falla |\n|---|---|---|---|---|\n";
  for (const t of A.testigos) {
    s += `| **${t.sigla}** | ${t.nombre} | ${t.soporte} | ${planas(t.virtud)} | ${planas(t.falla)} |\n`;
  }

  s += "\n## Índice\n\nEscrito al dorso del plano de la sala. Es lo único completo que sobrevive.\n";
  for (const c of A.cuadernillos) {
    s += `\n**cuadernillo ${c.id} · ${c.nombre}** *(${c.glosa})*\n\n`;
    for (const p of A.piezas.filter((p) => p.n >= c.desde && p.n <= c.hasta)) {
      s += `${String(p.n).padStart(2, "0")}. ${p.titulo} — *${etiqueta(p)}*\n`;
    }
  }

  for (const c of A.cuadernillos) {
    s += `\n---\n\n## Cuadernillo ${c.id} · ${c.nombre} *(${c.glosa})*\n`;
    for (const p of A.piezas.filter((p) => p.n >= c.desde && p.n <= c.hasta)) {
      s += `\n### ${String(p.n).padStart(2, "0")} · ${p.titulo}\n\n`;
      s += `\`folio ${p.folio} · ${etiqueta(p)}\`\n\n`;

      if (!(p.versos || []).length) {
        s += p.estado === "perdida"
          ? "*Sin testimonio. Sólo el título.*\n\n"
          : "*Ningún testigo lo vio. En el pliego ejecutable, este folio lo escribe quien lee.*\n\n";
      } else {
        s += "```\n";
        let num = 0;
        for (const v of p.versos) {
          if (v.blanco) { s += "\n"; continue; }
          num++;
          const g = String(num).padStart(3, " ") + " │ ";
          if (v.laguna) {
            s += g + rep("·", Math.min(30, Math.round(v.laguna / 1.6))) +
                 `  laguna · ${v.laguna} signos\n`;
            continue;
          }
          agrupar(v.l).forEach((x, i) => {
            s += (i === 0 ? g : "    │ ") + x.siglas.padEnd(3, " ") + " " + x.texto + "\n";
          });
        }
        s += "```\n\n";
      }

      if (p.notas?.length) {
        for (const n of p.notas) {
          s += `> **[${n.m}]** ${planas(n.t)}\n>\n`;
        }
        s += "\n";
      }
    }
  }

  s += "\n---\n\n";
  s += DORSO.split("\n").map((l) => l.replace(/^ {0,2}/, "")).join("\n");
  return s;
}

/* ---- emitir ------------------------------------------------------------- */

writeFileSync(new URL("./NADIE_APAGUE_TODAVIA_APARATO.txt", import.meta.url), txt());
writeFileSync(new URL("./NADIE_APAGUE_TODAVIA_APARATO.md", import.meta.url), md());

const versos = A.piezas.reduce((s, p) => s + (p.versos || []).filter((v) => v.l).length, 0);
const lecturas = A.piezas.reduce(
  (s, p) => s + (p.versos || []).reduce((t, v) => t + (v.l ? Object.keys(v.l).length : 0), 0), 0);
const disputa = A.piezas.reduce(
  (s, p) => s + (p.versos || []).filter((v) => v.l && agrupar(v.l).length > 1).length, 0);
const lagunas = A.piezas.reduce((s, p) => s + (p.versos || []).filter((v) => v.laguna).length, 0);
const notas = A.piezas.reduce((s, p) => s + (p.notas || []).length, 0);

console.log(
  `piezas ${A.piezas.length} · versos ${versos} · lecturas ${lecturas} · ` +
  `en desacuerdo ${disputa} · lagunas ${lagunas} · notas ${notas}`);
