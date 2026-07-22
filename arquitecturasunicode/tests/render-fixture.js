"use strict";

const fs = require("node:fs");

global.ARQ_AZAR = require("../js/rng.js");
global.ARQ_CORPUS = require("../js/corpus.js");
const motor = require("../js/architecture.js");

const output = process.argv[2] || "/tmp/arquitecturasunicode-fixture.svg";
const seed = process.argv[3] || "dos-edificios-01";
const species = process.argv[4] || undefined;
const piece = motor.build({ seed, forceSpecies: species });

function escapeXML(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function colorFor(item) {
  if (item.anomaly) return piece.colors.anomalia;
  return piece.colors[item.face] || piece.colors.frente;
}

const glyphs = piece.surface.filter((item) => item.glyph).map((item) =>
  `<text x="${item.x}" y="${item.y}" font-size="${item.fontSize}" fill="${colorFor(item)}" opacity="${item.opacity}" text-anchor="middle" dominant-baseline="central">${escapeXML(item.glyph)}</text>`
).join("\n");

const document = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <style>text { font-family: "Ac437 ApricotPortable", "Symbola", "DejaVu Sans Mono", monospace; }</style>
  <rect width="900" height="1200" fill="${piece.colors.papel}"/>
  <line x1="52" y1="76" x2="848" y2="76" stroke="${piece.colors.frente}"/>
  <text x="52" y="58" font-size="12" fill="${piece.colors.frente}">${escapeXML(piece.meta.species.toUpperCase())}</text>
  <text x="848" y="58" font-size="12" fill="${piece.colors.frente}" text-anchor="end">${escapeXML(seed)}</text>
  <g>${glyphs}</g>
  <line x1="52" y1="1112" x2="848" y2="1112" stroke="${piece.colors.frente}"/>
  <text x="52" y="1140" font-size="11" fill="${piece.colors.frente}">${escapeXML(piece.meta.phrase.toUpperCase())}</text>
  <text x="848" y="1165" font-size="9" fill="${piece.colors.frente}" opacity=".7" text-anchor="end">${escapeXML(piece.meta.palette + " / " + piece.meta.color + " / " + piece.traits.temperature)}</text>
</svg>`;

fs.writeFileSync(output, document, "utf8");
console.log(JSON.stringify({
  output,
  seed,
  species: piece.meta.speciesKey,
  glyphs: piece.stats.visibleGlyphs,
  forms: piece.geometry.genealogy
    ? [piece.geometry.genealogy.footprint, piece.geometry.genealogy.structure,
      piece.geometry.genealogy.void, piece.geometry.genealogy.crown]
    : piece.geometry.leftMorph
    ? [piece.geometry.leftMorph, piece.geometry.rightMorph]
    : [piece.geometry.kind || "ARCO"],
  alphabet: piece.meta.alphabet,
  color: piece.meta.color,
  perspective: piece.traits.perspective
}));
