"use strict";

const assert = require("node:assert/strict");

global.ARQ_AZAR = require("../js/rng.js");
global.ARQ_CORPUS = require("../js/corpus.js");
const motor = require("../js/architecture.js");

const signatures = [];

for (const species of ["arco", "espera", "entrelazada", "noeuclidiana", "gramatica"]) {
  for (let i = 0; i < 24; i += 1) {
    const options = { seed: `${species}-prueba-${i}`, forceSpecies: species };
    const first = motor.build(options);
    const second = motor.build(options);

    assert.deepEqual(first, second, "la misma semilla debe reconstruir la misma arquitectura");
    assert.equal(first.meta.speciesKey, species);
    assert.ok(first.surface.length > 90, "cada aparición necesita una superficie sustancial");
    assert.ok(first.stats.visibleGlyphs > 80, "debe sobrevivir suficiente escritura");
    assert.equal(first.surface.filter((cell) => cell.anomaly).length, 1, "debe existir una sola anomalía");
    assert.ok(first.meta.alphabet.length >= 3 && first.meta.alphabet.length <= 4, "el alfabeto se mantiene restringido");
    assert.ok(first.stats.whitespace >= 0.28, "la lámina conserva aire");
    assert.ok(first.surface.every((cell) => cell.x >= 0 && cell.x <= 900 && cell.y >= 0 && cell.y <= 1200), "todo cabe en la lámina");

    if (species === "arco") assert.ok(first.geometry.radius >= 4, "el arco conserva un vano verdadero");
    else if (species === "espera") {
      assert.ok(first.geometry.gap > 0, "los edificios no se tocan");
      assert.ok(motor.morphologies.includes(first.geometry.leftMorph));
      assert.ok(motor.morphologies.includes(first.geometry.rightMorph));
    } else if (species === "entrelazada") {
      assert.ok(motor.entanglements.includes(first.geometry.kind), "la forma pertenece a la gramática entrelazada");
      assert.ok(first.geometry.bodies >= 2, "la arquitectura contiene más de un cuerpo");
      assert.ok(first.geometry.crossings >= 3, "hay cruces suficientes para producir entrelazado");
      assert.ok(first.geometry.authenticGaps >= 3, "los cruces dejan ausencias reales");
    } else if (species === "noeuclidiana") {
      assert.ok(motor.nonEuclideanForms.includes(first.geometry.kind), "la forma pertenece a la gramática no euclidiana");
      assert.ok(first.geometry.portalCount >= 1, "cada topología contiene al menos un portal real");
      assert.ok(first.geometry.voids >= 1, "la topología conserva ausencias materiales");
      assert.ok(first.geometry.curvature >= -1 && first.geometry.curvature <= 1, "la curvatura queda acotada");
      assert.ok(first.geometry.gravityCenters >= 1 && first.geometry.gravityCenters <= 3, "hay entre uno y tres centros de gravedad");
    } else {
      const genes = first.geometry.genealogy;
      assert.ok(motor.architecturalGenes.footprints.includes(genes.footprint));
      assert.ok(motor.architecturalGenes.structures.includes(genes.structure));
      assert.ok(motor.architecturalGenes.voids.includes(genes.void));
      assert.ok(motor.architecturalGenes.crowns.includes(genes.crown));
      assert.ok(motor.architecturalGenes.annexes.includes(genes.annex));
      assert.ok(motor.architecturalGenes.deformations.includes(genes.deformation));
      assert.ok(first.geometry.authenticVoid >= 1, "cada genealogía conserva al menos un vacío real");
      assert.ok(first.geometry.combinations > 60000, "la gramática supera el catálogo de formas fijas");
    }

    if (i < 3) signatures.push({
      species,
      seed: options.seed,
      glyphs: first.stats.visibleGlyphs,
      void: Math.round(first.stats.whitespace * 100),
      forms: species === "espera"
        ? `${first.geometry.leftMorph}/${first.geometry.rightMorph}`
        : species === "entrelazada" || species === "noeuclidiana" ? first.geometry.kind
          : species === "gramatica" ? `${first.geometry.genealogy.footprint}/${first.geometry.genealogy.structure}` : "ARCO",
      color: first.meta.color
    });
  }
}

const distribution = {
  lowPerspective: 0,
  species: { arco: 0, espera: 0, entrelazada: 0, noeuclidiana: 0, gramatica: 0 },
  forms: new Set(), entanglements: new Set(), nonEuclidean: new Set(),
  geneFootprints: new Set(), geneStructures: new Set(), geneVoids: new Set(),
  geneCrowns: new Set(), geneAnnexes: new Set(), geneDeformations: new Set(),
  contaminated: 0, colors: new Set(), palettes: new Set()
};
for (let i = 0; i < 1200; i += 1) {
  const piece = motor.build({ seed: `distribucion-${i}` });
  if (piece.traits.perspective < 22) distribution.lowPerspective += 1;
  distribution.species[piece.meta.speciesKey] += 1;
  if (piece.meta.speciesKey === "espera") {
    distribution.forms.add(piece.geometry.leftMorph);
    distribution.forms.add(piece.geometry.rightMorph);
  }
  if (piece.meta.speciesKey === "entrelazada") distribution.entanglements.add(piece.geometry.kind);
  if (piece.meta.speciesKey === "noeuclidiana") distribution.nonEuclidean.add(piece.geometry.kind);
  if (piece.meta.speciesKey === "gramatica") {
    const genes = piece.geometry.genealogy;
    distribution.geneFootprints.add(genes.footprint);
    distribution.geneStructures.add(genes.structure);
    distribution.geneVoids.add(genes.void);
    distribution.geneCrowns.add(genes.crown);
    distribution.geneAnnexes.add(genes.annex);
    distribution.geneDeformations.add(genes.deformation);
    if (genes.contamination !== "NINGUNA") distribution.contaminated += 1;
  }
  distribution.colors.add(piece.meta.color);
  distribution.palettes.add(piece.meta.palette);
}

assert.ok(distribution.lowPerspective >= 20 && distribution.lowPerspective <= 90, "la perspectiva baja debe ser rara, no imposible");
assert.ok(distribution.species.gramatica >= 590 && distribution.species.gramatica <= 740, "la gramática arquitectónica domina el motor");
assert.ok(distribution.species.arco >= 75 && distribution.species.arco <= 165, "el arco reaparece como memoria constructiva");
assert.ok(distribution.species.espera >= 110 && distribution.species.espera <= 205, "la espera conserva presencia");
assert.ok(distribution.species.entrelazada >= 115 && distribution.species.entrelazada <= 220, "el entrelazado permanece como mutación amplia");
assert.ok(distribution.species.noeuclidiana >= 55 && distribution.species.noeuclidiana <= 135, "la no euclidiana se vuelve una aparición rara");
assert.equal(distribution.forms.size, motor.morphologies.length, "todas las morfologías deben aparecer");
assert.equal(distribution.entanglements.size, motor.entanglements.length, "todas las arquitecturas entrelazadas deben aparecer");
assert.equal(distribution.nonEuclidean.size, motor.nonEuclideanForms.length, "todas las topologías no euclidianas deben aparecer");
assert.equal(distribution.geneFootprints.size, motor.architecturalGenes.footprints.length, "aparecen todas las plantas");
assert.equal(distribution.geneStructures.size, motor.architecturalGenes.structures.length, "aparecen todas las estructuras");
assert.equal(distribution.geneVoids.size, motor.architecturalGenes.voids.length, "aparecen todos los vacíos");
assert.equal(distribution.geneCrowns.size, motor.architecturalGenes.crowns.length, "aparecen todas las cubiertas");
assert.equal(distribution.geneAnnexes.size, motor.architecturalGenes.annexes.length, "aparecen todos los anexos");
assert.equal(distribution.geneDeformations.size, motor.architecturalGenes.deformations.length, "aparecen todas las deformaciones");
assert.ok(distribution.contaminated >= 35 && distribution.contaminated <= 130, "la contaminación topológica es rara pero visible");
assert.equal(distribution.colors.size, ARQ_CORPUS.colores.length, "todas las familias cromáticas deben aparecer");
assert.equal(distribution.palettes.size, ARQ_CORPUS.paletas.length, "todos los alfabetos deben aparecer");

console.table(signatures);
console.log({
  samples: 1200,
  lowPerspective: distribution.lowPerspective,
  species: distribution.species,
  morphologies: [...distribution.forms],
  entanglements: [...distribution.entanglements],
  nonEuclidean: [...distribution.nonEuclidean],
  architecturalGenes: {
    footprints: [...distribution.geneFootprints], structures: [...distribution.geneStructures],
    voids: [...distribution.geneVoids], crowns: [...distribution.geneCrowns],
    annexes: [...distribution.geneAnnexes], deformations: [...distribution.geneDeformations]
  },
  contaminated: distribution.contaminated,
  colors: distribution.colors.size,
  alphabets: distribution.palettes.size
});
console.log("arquitecturasunicode v0.5: genealogía, diversidad y determinismo correctos");
