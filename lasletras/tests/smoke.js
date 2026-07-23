"use strict";

var assert = require("assert");
var motor = require("../js/architecture.js");

function increment(map, key) { map[key] = (map[key] || 0) + 1; }

var first = motor.build({ seed: "la-clave-sostiene-el-anillo" });
var again = motor.build({ seed: "la-clave-sostiene-el-anillo" });
assert.strictEqual(first.meta.version, "0.6.0");
assert.deepStrictEqual(first.traits, again.traits, "la misma semilla debe conservar los genes");
assert.deepStrictEqual(first.surface, again.surface, "la misma semilla debe reconstruir la misma lámina");

var species = {};
var structures = {};
var crowns = {};
var footprints = {};
var almostFrontal = 0;
var grammarCount = 0;
var grammarVolumetric = 0;
var ringOverArch = 0;

for (var i = 0; i < 2000; i += 1) {
  var piece = motor.build({ seed: "v06-smoke-" + i });
  increment(species, piece.meta.speciesKey);
  if (piece.traits.perspectiveClass === "CASI FRONTAL") almostFrontal += 1;
  if (piece.meta.speciesKey !== "gramatica") continue;
  grammarCount += 1;
  increment(structures, piece.traits.archStructure);
  increment(crowns, piece.traits.archCrown);
  increment(footprints, piece.traits.archFootprint);
  if (piece.stats.volumetric) grammarVolumetric += 1;
  if (piece.geometry.ringOverArch) ringOverArch += 1;
}

assert(grammarCount > 1450 && grammarCount < 1650, "la arquitectura debe dominar aproximadamente 78% de las semillas");
assert(species.arco > 110 && species.arco < 210);
assert(species.espera > 75 && species.espera < 170);
assert(species.entrelazada > 55 && species.entrelazada < 145);
assert(species.noeuclidiana > 30 && species.noeuclidiana < 100);
assert(almostFrontal > 20 && almostFrontal < 85, "la vista casi frontal debe seguir siendo rara pero posible");
assert.strictEqual(Object.keys(structures).length, motor.architecturalGenes.structures.length, "deben aparecer todas las estructuras");
assert.strictEqual(Object.keys(crowns).length, motor.architecturalGenes.crowns.length, "deben aparecer todas las cubiertas");
assert.strictEqual(Object.keys(footprints).length, motor.architecturalGenes.footprints.length, "deben aparecer todas las plantas");
assert(grammarVolumetric / grammarCount > 0.98, "casi toda arquitectura debe emitir frente, profundidad y cubierta");
assert(structures["MASA ARQUEADA"] > structures.PANTALLAS * 4, "la masa arqueada debe ser mucho más frecuente que la pantalla");
assert(structures.ARCADAS > structures.CINTAS * 3, "las arcadas deben ser mucho más frecuentes que las cintas");
assert(ringOverArch > 200, "el arco con anillo superior debe ser un motivo recurrente");

var waiting = {};
for (var j = 0; j < 1200; j += 1) {
  var pair = motor.build({ seed: "v06-waiting-" + j, forceSpecies: "espera" });
  increment(waiting, pair.traits.leftMorph);
}
assert(waiting.ACUEDUCTO > waiting["TÓTEM"] * 3, "el acueducto debe superar ampliamente al tótem");
assert(waiting["MÉNSULAS"] > waiting.PANTALLA * 2, "las ménsulas deben superar ampliamente a la pantalla");

console.log(JSON.stringify({
  version: first.meta.version,
  species: species,
  structures: structures,
  crowns: crowns,
  footprints: footprints,
  almostFrontal: almostFrontal,
  volumetricShare: Math.round(grammarVolumetric / grammarCount * 1000) / 1000,
  ringOverArch: ringOverArch,
  waitingMorphologies: waiting
}, null, 2));
