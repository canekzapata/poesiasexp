#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
const byId = Object.fromEntries(manifest.pages.map(page => [page.id, page]));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(manifest.version === 13, `se esperaba manifest v13; llegó v${manifest.version}`);
assert(manifest.pages.length === manifest.pageCount, "pageCount no coincide con pages.length");
assert(manifest.pages.length >= 96, "el mundo debe contener al menos 96 páginas");
assert(Object.keys(manifest.topologies).length >= 27, "faltan especies visuales");
assert(byId["006"]?.topology === "form", "006 dejó de ser el formulario-oráculo");
assert(byId["013"]?.topology === "destruction", "013 dejó de ser la página que se autodestruye");

const start = manifest.pages[0].id;
const seen = new Set([start]);
const queue = [start];
while (queue.length) {
  const page = byId[queue.shift()];
  for (const target of page.edges || []) {
    assert(Boolean(byId[target]), `${page.id} apunta a una página inexistente: ${target}`);
    if (!seen.has(target)) { seen.add(target); queue.push(target); }
  }
}
assert(seen.size === manifest.pages.length, `sólo ${seen.size}/${manifest.pages.length} páginas son alcanzables`);

const reverse = Object.fromEntries(manifest.pages.map(page => [page.id, []]));
manifest.pages.forEach(page => page.edges.forEach(target => reverse[target]?.push(page.id)));
const returning = new Set([start]);
const reverseQueue = [start];
while (reverseQueue.length) {
  for (const source of reverse[reverseQueue.shift()] || []) {
    if (!returning.has(source)) { returning.add(source); reverseQueue.push(source); }
  }
}
assert(returning.size === manifest.pages.length, "el grafo no es fuertemente conexo");

const oldLoop = new Set(["000", "001", "002", "017"]);
for (const id of oldLoop) {
  const exits = byId[id].edges.filter(target => !oldLoop.has(target));
  assert(exits.length >= 4, `${id} conserva demasiado peso en el circuito antiguo`);
}

const requiredNewSpecies = ["diagram", "diagramtext", "oracleparty", "vanishingmap"];
for (const topology of requiredNewSpecies) {
  assert(manifest.pages.filter(page => page.topology === topology).length >= 3, `faltan páginas ${topology}`);
}

for (const page of manifest.pages) {
  const html = await readFile(join(ROOT, "paginas", `${page.id}.html`), "utf8");
  const persistent = html.match(/data-fixed="1"/g) || [];
  const exploratory = html.match(/data-explore="1"/g) || [];
  assert(persistent.length >= 2, `${page.id} no conserva dos hipervínculos persistentes`);
  assert(exploratory.length === 1, `${page.id} no tiene exactamente una salida exploratoria`);
  assert(html.includes("../js/diagramas.js"), `${page.id} no carga el motor de diagramas`);
  assert(html.includes("../js/tlahtolli.js"), `${page.id} no carga el motor tlahtolli`);
  assert(html.includes("../js/reliquias.js"), `${page.id} no carga el códice de reliquias`);
  assert(html.includes("../js/poliglotas.js"), `${page.id} no carga las voces políglotas`);
  assert(html.includes("../js/juegos.js"), `${page.id} no carga las reglas de puntuación local`);
}

assert((await readFile(join(ROOT, "reliquias.html"), "utf8")).includes("códice de reliquias"), "falta reliquias.html");
const chamber = await readFile(join(ROOT, "camara.html"), "utf8");
assert(chamber.includes("cámara epigráfica"), "falta camara.html");
assert((chamber.match(/<a /g) || []).length >= 2, "la cámara no conserva dos hipervínculos");
const corpus = await readFile(join(ROOT, "js", "corpus.js"), "utf8");
assert(corpus.includes("alemanSistema"), "falta el personaje alemán");
for (const source of ["homeriliad.txt", "homerody.txt", "nonnus.txt", "pindar.txt"]) assert(corpus.includes(source), `falta el corpus griego ${source}`);
const polyglot = await readFile(join(ROOT, "js", "poliglotas.js"), "utf8");
assert(polyglot.includes("120000"), "las apariciones no tienen enfriamiento global de dos minutos");
assert(!polyglot.includes('addEventListener("pointerover"'), "el hover todavía produce voces");
assert(polyglot.includes('language === "fr"'), "el francés no tiene una presentación separada");
assert(polyglot.includes("otrorio.lenguas."), "las lenguas no conservan memoria por semilla");
const relics = await readFile(join(ROOT, "js", "reliquias.js"), "utf8");
assert(relics.includes("meaningfulGestures < 8"), "una reliquia todavía puede aparecer demasiado pronto");
assert(relics.includes("pageCount < 2"), "las reliquias no exigen recorrer dos páginas");
assert((await readFile(join(ROOT, "js", "juegos.js"), "utf8")).includes("score local"), "falta el motor de puntuaciones locales");
assert((await readFile(join(ROOT, "index.html"), "utf8")).includes("freshSeed"), "el umbral no genera una semilla fresca");

if (failures.length) {
  console.error(failures.map(message => `× ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`✓ v${manifest.version}: ${manifest.pages.length} páginas · ${Object.keys(manifest.topologies).length} topologías · grafo fuertemente conexo · dos salidas persistentes por página`);
}
