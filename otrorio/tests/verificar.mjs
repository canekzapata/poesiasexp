#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
const byId = Object.fromEntries(manifest.pages.map(page => [page.id, page]));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(manifest.version === 10, `se esperaba manifest v10; llegó v${manifest.version}`);
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
}

assert((await readFile(join(ROOT, "reliquias.html"), "utf8")).includes("códice de reliquias"), "falta reliquias.html");

if (failures.length) {
  console.error(failures.map(message => `× ${message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`✓ v${manifest.version}: ${manifest.pages.length} páginas · ${Object.keys(manifest.topologies).length} topologías · grafo fuertemente conexo · dos salidas persistentes por página`);
}
