"use strict";

var assert = require("assert");
var motor = require("../js/architecture.js");

function increment(map, key) { map[key] = (map[key] || 0) + 1; }

function rgbFromCss(value) {
  var hsl = String(value).match(/hsl\(\s*([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\s*\)/i);
  if (hsl) {
    var h = ((Number(hsl[1]) % 360) + 360) % 360 / 360;
    var s = Number(hsl[2]) / 100;
    var l = Number(hsl[3]) / 100;
    if (!s) return [l, l, l];
    var hue = function (p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)];
  }
  var hex = String(value).replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(function (digit) { return digit + digit; }).join("");
  return [0, 2, 4].map(function (offset) { return parseInt(hex.slice(offset, offset + 2), 16) / 255; });
}

function luminance(value) {
  return rgbFromCss(value).map(function (channel) {
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }).reduce(function (sum, channel, index) {
    return sum + channel * [0.2126, 0.7152, 0.0722][index];
  }, 0);
}

function contrast(a, b) {
  var first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

var first = motor.build({ seed: "la-clave-sostiene-el-anillo" });
var again = motor.build({ seed: "la-clave-sostiene-el-anillo" });
assert.strictEqual(first.meta.version, "0.9.0");
assert.strictEqual(first.meta.instrument, "espacio escultórico");
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
var sculpturalAssemblies = {};
var sculptureCount = 0;
var sculptureVolumetric = 0;
var generativeColors = 0;
var colorModes = {};
var colorSignatures = {};

for (var i = 0; i < 2000; i += 1) {
  var piece = motor.build({ seed: "v09-smoke-" + i });
  increment(species, piece.meta.speciesKey);
  colorSignatures[[piece.colors.papel, piece.colors.frente, piece.colors.lateral, piece.colors.techo, piece.colors.anomalia].join("|")] = true;
  if (piece.colors.generativa) {
    generativeColors += 1;
    increment(colorModes, piece.colors.modo);
    assert(contrast(piece.colors.papel, piece.colors.frente) >= 6.75, "el frente generativo debe contrastar fuertemente");
    assert(contrast(piece.colors.papel, piece.colors.lateral) >= 3.35, "el lateral generativo debe conservar profundidad");
    assert(contrast(piece.colors.papel, piece.colors.techo) >= 3.35, "la cubierta generativa debe conservar profundidad");
    assert(contrast(piece.colors.papel, piece.colors.anomalia) >= 4.2, "la anomalía debe ser visible");
  }
  if (piece.traits.perspectiveClass === "CASI FRONTAL") almostFrontal += 1;
  if (piece.meta.speciesKey === "escultura") {
    sculptureCount += 1;
    increment(sculpturalAssemblies, piece.geometry.assembly);
    if (piece.stats.volumetric) sculptureVolumetric += 1;
  }
  if (piece.meta.speciesKey !== "gramatica") continue;
  grammarCount += 1;
  increment(structures, piece.traits.archStructure);
  increment(crowns, piece.traits.archCrown);
  increment(footprints, piece.traits.archFootprint);
  if (piece.stats.volumetric) grammarVolumetric += 1;
  if (piece.geometry.ringOverArch) ringOverArch += 1;
}

assert(grammarCount > 1100 && grammarCount < 1300, "la genealogía arquitectónica debe ocupar aproximadamente 60% de las semillas");
assert(sculptureCount > 300 && sculptureCount < 430, "los ensamblajes escultóricos deben ocupar aproximadamente 18% de las semillas");
assert(species.arco > 110 && species.arco < 210);
assert(species.espera > 75 && species.espera < 170);
assert(species.entrelazada > 55 && species.entrelazada < 145);
assert(species.noeuclidiana > 30 && species.noeuclidiana < 100);
assert(almostFrontal > 20 && almostFrontal < 85, "la vista casi frontal debe seguir siendo rara pero posible");
assert.strictEqual(Object.keys(structures).length, motor.architecturalGenes.structures.length, "deben aparecer todas las estructuras");
assert.strictEqual(Object.keys(crowns).length, motor.architecturalGenes.crowns.length, "deben aparecer todas las cubiertas");
assert.strictEqual(Object.keys(footprints).length, motor.architecturalGenes.footprints.length, "deben aparecer todas las plantas");
assert.strictEqual(Object.keys(sculpturalAssemblies).length, motor.sculpturalAssemblies.length, "deben aparecer todos los ensamblajes escultóricos");
assert(grammarVolumetric / grammarCount > 0.98, "casi toda arquitectura debe emitir frente, profundidad y cubierta");
assert(sculptureVolumetric / sculptureCount > 0.99, "todo ensamblaje escultórico debe conservar volumen");
assert(structures["MASA ARQUEADA"] > structures.PANTALLAS * 4, "la masa arqueada debe ser mucho más frecuente que la pantalla");
assert(structures.ARCADAS > structures.CINTAS * 3, "las arcadas deben ser mucho más frecuentes que las cintas");
assert(structures["TORRE HELICOIDAL"] > structures.PANTALLAS * 3, "la torre helicoidal debe ser una familia arquitectónica principal");
assert(structures["CUBOS ENCAJADOS"] > structures.CINTAS * 2, "los cubos encajados deben ser una familia recurrente");
assert(structures.ZIGURATS > structures.PANTALLAS * 2, "las zigurats deben conservar una presencia clara");
assert(ringOverArch > 70, "el arco con anillo superior debe seguir existiendo sin dominar");
assert(crowns.NINGUNA > crowns.CORONA * 3, "la ausencia de corona debe ser mucho más frecuente que el halo ornamental");
assert((crowns["ANILLO SUPERIOR"] + crowns["CÚPULA"] + crowns.CORONA) / grammarCount < 0.36,
  "anillos, cúpulas y coronas no deben concluir la mayoría de las piezas");
assert(sculpturalAssemblies["ESFERA SOBRE HÉLICE"] + sculpturalAssemblies["HÉLICE SOBRE ESFERA"] > sculptureCount * 0.25,
  "los ensamblajes de esfera y hélice deben ser una familia principal");
assert(generativeColors > 1350 && generativeColors < 1530, "cerca de 72% de las paletas deben ser genealógicas");
assert.strictEqual(Object.keys(colorModes).length, 6, "deben aparecer los seis sistemas cromáticos generativos");
assert(Object.keys(colorSignatures).length > 1350, "la serie debe producir más de 1350 combinaciones cromáticas en 2000 semillas");

var waiting = {};
for (var j = 0; j < 1200; j += 1) {
  var pair = motor.build({ seed: "v09-waiting-" + j, forceSpecies: "espera" });
  increment(waiting, pair.traits.leftMorph);
}
assert(waiting.ACUEDUCTO > waiting["TÓTEM"] * 3, "el acueducto debe superar ampliamente al tótem");
assert(waiting["MÉNSULAS"] > waiting.PANTALLA * 2, "las ménsulas deben superar ampliamente a la pantalla");
assert(waiting["TORRE HELICOIDAL"] > waiting["TÓTEM"] * 3, "la torre helicoidal debe superar ampliamente al tótem");
assert(waiting.ZIGURAT > waiting["TÓTEM"] * 3, "la zigurat debe superar ampliamente al tótem");
assert(waiting.ESFERA > waiting["TÓTEM"] * 2, "la esfera debe dejar de ser una aparición excepcional");
assert(waiting["PIRÁMIDE"] > waiting["TÓTEM"] * 2, "la pirámide debe formar parte estable del vocabulario");
assert(waiting["OBELISCO ROTO"] > waiting["TÓTEM"], "el obelisco roto debe aparecer con claridad");

console.log(JSON.stringify({
  version: first.meta.version,
  species: species,
  structures: structures,
  crowns: crowns,
  footprints: footprints,
  almostFrontal: almostFrontal,
  volumetricShare: Math.round(grammarVolumetric / grammarCount * 1000) / 1000,
  ringOverArch: ringOverArch,
  sculpturalAssemblies: sculpturalAssemblies,
  sculpturalVolumetricShare: Math.round(sculptureVolumetric / sculptureCount * 1000) / 1000,
  generativeColors: generativeColors,
  uniqueColorSignatures: Object.keys(colorSignatures).length,
  colorModes: colorModes,
  waitingMorphologies: waiting
}, null, 2));
