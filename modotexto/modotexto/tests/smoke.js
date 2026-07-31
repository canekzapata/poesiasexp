/*
  tests/smoke.js — corre con `node tests/smoke.js`, sin dependencias.

  Verifica lo que la obra promete y que no se puede comprobar a ojo:
    · determinismo por semilla
    · conectividad del laberinto en 1000 semillas
    · aparición de las siete arquitecturas
    · la regla de proporción: ninguna semilla pasa del 15% de caracteres léxicos
    · la cuota del verde sobre negro
    · una anomalía por semilla, y una sola

  Los módulos de la obra no tocan el DOM al cargarse, así que se pueden
  ejecutar aquí tal cual, incluido el préstamo de ../otrorio/js/automatas.js.
*/
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var RAIZ = path.resolve(__dirname, "..");
var ARCHIVOS = [
  path.resolve(RAIZ, "../otrorio/js/automatas.js"),
  "js/rng.js", "js/rejilla.js", "js/materiales.js", "js/laberinto.js",
  "js/camara.js", "js/paneles.js", "js/lexico.js", "js/condensacion.js",
  "js/memoria.js", "js/volcado.js", "js/sonido.js", "js/app.js"
];

var caja = { console: console, Math: Math, Date: Date, JSON: JSON, performance: { now: Date.now } };
caja.window = caja;
caja.self = caja;
vm.createContext(caja);
caja.window = caja;

ARCHIVOS.forEach(function (rel) {
  var abs = path.isAbsolute(rel) ? rel : path.resolve(RAIZ, rel);
  if (!fs.existsSync(abs)) {
    console.error("falta " + abs);
    process.exit(2);
  }
  vm.runInContext(fs.readFileSync(abs, "utf8"), caja, { filename: abs });
});

var APP = caja.MT_APP;
var REJ = caja.MT_REJILLA;
var LAB = caja.MT_LABERINTO;
var MATS = caja.MT_MATERIALES;

var fallos = [];
var pruebas = 0;

function afirmar(cond, mensaje) {
  pruebas += 1;
  if (!cond) fallos.push(mensaje);
}

function titulo(t) { console.log("\n── " + t); }

function semillas(n, prefijo) {
  var out = [];
  for (var i = 0; i < n; i += 1) out.push((prefijo || "s") + "-" + i);
  return out;
}

/* ------------------------------------------------------------------ */
titulo("préstamo de autómatas");
afirmar(!!caja.LabAutomata, "LabAutomata no se cargó desde ../otrorio/js/automatas.js");
afirmar(typeof caja.LabAutomata.conwayStep === "function", "LabAutomata sin conwayStep");
console.log("   LabAutomata disponible: " + Object.keys(caja.LabAutomata).length + " funciones");

/* ------------------------------------------------------------------ */
titulo("determinismo por semilla");
(function () {
  var muestras = ["excavar", "río hondo", "luciérnaga", "virus lento", "hueco", "regresa", "noche", "kx-9182"];
  muestras.forEach(function (s) {
    var a = APP.crearMundo({ semilla: s, cols: 104, rows: 36 });
    var b = APP.crearMundo({ semilla: s, cols: 104, rows: 36 });
    afirmar(a.lab.arquitectura.clave === b.lab.arquitectura.clave, "arquitectura no determinista: " + s);
    afirmar(a.paleta.clave === b.paleta.clave, "paleta no determinista: " + s);
    afirmar(a.fuente.clave === b.fuente.clave, "fuente no determinista: " + s);
    afirmar(a.anomalia === b.anomalia, "anomalía no determinista: " + s);
    afirmar(a.lab.W === b.lab.W && a.lab.H === b.lab.H, "dimensiones no deterministas: " + s);
    var iguales = true;
    for (var i = 0; i < a.lab.casillas.length; i += 1) {
      if (a.lab.casillas[i] !== b.lab.casillas[i]) { iguales = false; break; }
    }
    afirmar(iguales, "el trazado del laberinto no es determinista: " + s);

    var ra = new REJ.Rejilla(104, 36), rb = new REJ.Rejilla(104, 36);
    APP.componer(a, ra, 0, {});
    APP.componer(b, rb, 0, {});
    afirmar(ra.aTexto() === rb.aTexto(), "la pantalla inicial no es determinista: " + s);
  });
  console.log("   " + muestras.length + " semillas reconstruyen el mismo mundo");
})();

/* ------------------------------------------------------------------ */
titulo("conectividad en 1000 semillas");
(function () {
  var lista = semillas(1000, "con");
  var desconectados = 0, sinUmbral = 0, peor = 0;
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 100, rows: 34 });
    var comps = m.lab.componentes();
    if (comps.length > 1) desconectados += 1;
    if (comps.length > peor) peor = comps.length;
    if (!m.lab.umbrales.length) sinUmbral += 1;
  });
  afirmar(desconectados === 0, desconectados + " de 1000 laberintos quedaron desconectados (máx " + peor + " componentes)");
  afirmar(sinUmbral === 0, sinUmbral + " laberintos sin umbral");
  console.log("   1000 laberintos conexos, todos con al menos un umbral");
})();

/* ------------------------------------------------------------------ */
titulo("las siete arquitecturas");
(function () {
  var vistas = {};
  semillas(600, "arq").forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 96, rows: 32 });
    vistas[m.lab.arquitectura.clave] = (vistas[m.lab.arquitectura.clave] || 0) + 1;
  });
  LAB.ARQUITECTURAS.forEach(function (a) {
    afirmar(vistas[a.clave] > 0, "la arquitectura " + a.clave + " no apareció en 600 semillas");
  });
  console.log("   " + Object.keys(vistas).map(function (k) {
    return k + ":" + vistas[k];
  }).join("  "));
})();

/* ------------------------------------------------------------------ */
titulo("regla de proporción: ≥85% de materia no léxica");
(function () {
  var lista = semillas(240, "prop");
  var peor = { s: null, p: 0 }, peorLineas = 0, suma = 0;
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 110, rows: 38 });
    var rej = new REJ.Rejilla(110, 38);
    var r = APP.componer(m, rej, 0, {});
    var met = r.metrica;
    suma += met.proporcion;
    if (met.proporcion > peor.p) peor = { s: s, p: met.proporcion };
    if (met.lineasLegibles > peorLineas) peorLineas = met.lineasLegibles;
    afirmar(met.proporcion <= 0.15,
      "la semilla " + s + " tiene " + (met.proporcion * 100).toFixed(1) + "% de caracteres léxicos");
    afirmar(met.lineasLegibles <= 3,
      "la semilla " + s + " muestra " + met.lineasLegibles + " líneas legibles a la vez");
  });
  console.log("   media " + ((suma / lista.length) * 100).toFixed(2) + "%  ·  peor " +
    (peor.p * 100).toFixed(2) + "% (" + peor.s + ")  ·  máx líneas legibles " + peorLineas);
})();

/* ------------------------------------------------------------------ */
titulo("cuota del verde sobre negro");
(function () {
  var lista = semillas(2000, "pal");
  var cuenta = {};
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 90, rows: 30 });
    cuenta[m.paleta.clave] = (cuenta[m.paleta.clave] || 0) + 1;
  });
  var verde = (cuenta.verde || 0) / lista.length;
  afirmar(verde <= 0.10, "el monocromo verde salió en el " + (verde * 100).toFixed(1) + "% de las semillas");
  MATS.PALETAS.forEach(function (p) {
    afirmar((cuenta[p.clave] || 0) > 0, "la paleta " + p.clave + " nunca salió");
  });
  var mayor = 0;
  Object.keys(cuenta).forEach(function (k) { mayor = Math.max(mayor, cuenta[k] / lista.length); });
  afirmar(mayor <= 0.35, "una familia cromática domina el " + (mayor * 100).toFixed(1) + "% de las semillas");
  console.log("   verde " + (verde * 100).toFixed(1) + "%  ·  familia mayoritaria " + (mayor * 100).toFixed(1) + "%");
})();

/* ------------------------------------------------------------------ */
titulo("una anomalía por semilla, y una sola");
(function () {
  var vistas = {};
  var lista = semillas(800, "ano");
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 90, rows: 30 });
    afirmar(typeof m.anomalia === "string" && APP.ANOMALIAS.indexOf(m.anomalia) >= 0,
      "anomalía inválida en " + s);
    var otras = APP.ANOMALIAS.filter(function (a) { return a === m.anomalia; });
    afirmar(otras.length === 1, "la semilla " + s + " reclama más de una anomalía");
    vistas[m.anomalia] = (vistas[m.anomalia] || 0) + 1;
  });
  APP.ANOMALIAS.forEach(function (a) {
    afirmar(vistas[a] > 0, "la anomalía " + a + " nunca apareció en 800 semillas");
  });
  console.log("   " + Object.keys(vistas).length + "/" + APP.ANOMALIAS.length + " anomalías presentes");
})();

/* ------------------------------------------------------------------ */
titulo("marcos que se funden");
(function () {
  var m = APP.crearMundo({ semilla: "marcos", cols: 110, rows: 38 });
  var rej = new REJ.Rejilla(110, 38);
  APP.componer(m, rej, 0, {});
  var texto = rej.aTexto();
  var uniones = (texto.match(/[├┤┬┴┼╠╣╦╩╬]/g) || []).length;
  afirmar(uniones > 0, "ningún panel comparte marco: las uniones no se fundieron");
  console.log("   " + uniones + " celdas de unión en la pantalla inicial");
})();

/* ------------------------------------------------------------------ */
titulo("sesgos de semillas cargadas");
(function () {
  afirmar(APP.crearMundo({ semilla: "río" }).lab.arquitectura.clave === "caverna", "la semilla río no sesgó a caverna");
  afirmar(APP.crearMundo({ semilla: "virus" }).lab.arquitectura.clave === "danado", "la semilla virus no sesgó a dañado");
  afirmar(APP.crearMundo({ semilla: "regresa" }).lab.arquitectura.clave === "concentrico", "la semilla regresa no sesgó a concéntrico");
  afirmar(APP.crearMundo({ semilla: "noche" }).paleta.clave === "noche", "la semilla noche no sesgó su paleta");
  console.log("   río, virus, regresa y noche inclinan la generación");
})();

/* ------------------------------------------------------------------ */
titulo("perforar no desconecta y bajar cambia de gramática");
(function () {
  var m = APP.crearMundo({ semilla: "perforar", cols: 100, rows: 34 });
  var antes = m.lab.arquitectura.clave;
  var aceptados = 0, rechazados = 0;
  for (var y = 1; y < m.lab.H - 1 && aceptados < 60; y += 1) {
    for (var x = 1; x < m.lab.W - 1 && aceptados < 60; x += 1) {
      if (!m.lab.macizo(x, y)) continue;
      if (m.lab.perforar(x, y)) aceptados += 1; else rechazados += 1;
    }
  }
  afirmar(m.lab.componentes().length === 1, "perforar dejó el laberinto desconectado");
  afirmar(aceptados > 0, "no se pudo perforar ningún muro");
  m.niveles = 3;
  APP.generarNivel(m, 1);
  afirmar(m.lab.arquitectura.clave !== antes, "bajar de nivel no cambió la gramática");
  afirmar(m.lab.componentes().length === 1, "el nivel siguiente no es conexo");
  console.log("   " + aceptados + " perforaciones aceptadas, " + rechazados + " rechazadas; nivel 1 = " + m.lab.arquitectura.clave);
})();

/* ------------------------------------------------------------------ */
titulo("el léxico se agota y empieza a mezclarse");
(function () {
  var m = APP.crearMundo({ semilla: "lexico", cols: 90, rows: 30 });
  var mezcladas = 0, total = 60;
  for (var i = 0; i < total; i += 1) {
    var t = m.lexico.tomar(0, "cal");
    if (t.mezclada) mezcladas += 1;
    afirmar(typeof t.texto === "string" && t.texto.length > 0, "el léxico devolvió una frase vacía");
  }
  afirmar(mezcladas > 0, "el léxico nunca se agotó ni se mezcló");
  console.log("   " + mezcladas + " de " + total + " frases salieron ya degradadas");
})();

/* ------------------------------------------------------------------ */
console.log("\n" + (fallos.length ? "✗" : "✓") + " " + (pruebas - fallos.length) + "/" + pruebas + " comprobaciones");
if (fallos.length) {
  fallos.slice(0, 20).forEach(function (f) { console.log("  ✗ " + f); });
  if (fallos.length > 20) console.log("  … y " + (fallos.length - 20) + " más");
  process.exit(1);
}
process.exit(0);
