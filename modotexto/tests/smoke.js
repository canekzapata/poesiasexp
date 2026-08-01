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
  "js/rng.js",
  path.resolve(RAIZ, "../lasletras/js/corpus.js"),
  path.resolve(RAIZ, "../lasletras/js/architecture.js"),
  path.resolve(RAIZ, "../poemario/heraclitofable/corpus.js"),
  "js/rejilla.js", "js/materiales.js", "js/laberinto.js", "js/esculturas.js", "js/celadores.js",
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
var ESC = caja.MT_ESCULTURAS;
var CEL = caja.MT_CELADORES;
var CON = caja.MT_CONDENSACION;
var LEXM = caja.MT_LEXICO;

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
afirmar(!!caja.ARQ_MOTOR, "ARQ_MOTOR no se cargó desde ../lasletras/js/architecture.js");
afirmar(ESC.disponible(), "esculturas.js no encuentra el motor de lasletras");
console.log("   ARQ_MOTOR disponible: " + (caja.ARQ_MOTOR ? Object.keys(caja.ARQ_MOTOR).length : 0) + " funciones");

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
    var m = APP.crearMundo({ semilla: s, cols: 100, rows: 34, esculturas: false });
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
    var m = APP.crearMundo({ semilla: s, cols: 96, rows: 32, esculturas: false });
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
  var lista = semillas(120, "prop");
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
    var m = APP.crearMundo({ semilla: s, cols: 90, rows: 30, esculturas: false });
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
    var m = APP.crearMundo({ semilla: s, cols: 90, rows: 30, esculturas: false });
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
titulo("los cuerpos de lasletras");
(function () {
  var lista = semillas(24, "esc");
  var sinCuerpos = 0, totalCuerpos = 0, altoMax = 0, glifos = {};
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 100, rows: 34 });
    var mon = m.monumentos;
    afirmar(mon && mon.disponible, "la semilla " + s + " no sembró cuerpos");
    if (!mon || !mon.lista.length) { sinCuerpos += 1; return; }
    totalCuerpos += mon.lista.length;
    mon.lista.forEach(function (c) {
      altoMax = Math.max(altoMax, c.alto);
      afirmar(c.alto >= 0.7 && c.alto <= 5.2, "cuerpo fuera de escala: " + c.alto);
      afirmar(c.llenos >= 8, "cuerpo demasiado vacío: " + c.llenos + " vóxeles");
      /* atravesables: nunca tocan el trazado */
      afirmar(m.lab.aire(c.x, c.y), "un cuerpo cayó dentro de un muro");
      afirmar(!m.lab.esUmbral(c.x, c.y), "un cuerpo tapó un umbral");
      for (var k = 0; k < c.glifo.length; k += 1) {
        if (c.vox[k]) glifos[c.glifo[k]] = 1;
      }
    });
    /* siguen sin desconectar nada, porque no son materia */
    afirmar(m.lab.componentes().length === 1, "el laberinto dejó de ser conexo con cuerpos");
  });
  afirmar(sinCuerpos === 0, sinCuerpos + " semillas se quedaron sin ningún cuerpo");
  console.log("   " + totalCuerpos + " cuerpos en 24 semillas · alto máximo " +
    altoMax.toFixed(1) + " muros · " + Object.keys(glifos).length + " glifos distintos");
})();

/* ------------------------------------------------------------------ */
titulo("los cuerpos son deterministas y no rompen la proporción");
(function () {
  var lista = semillas(24, "escprop");
  var peor = 0, conCuerpoVisible = 0;
  lista.forEach(function (s) {
    var a = APP.crearMundo({ semilla: s, cols: 108, rows: 36 });
    var b = APP.crearMundo({ semilla: s, cols: 108, rows: 36 });
    afirmar(a.monumentos.lista.length === b.monumentos.lista.length,
      "el número de cuerpos no es determinista: " + s);
    for (var i = 0; i < a.monumentos.lista.length; i += 1) {
      var ca = a.monumentos.lista[i], cb = b.monumentos.lista[i];
      afirmar(ca.x === cb.x && ca.y === cb.y && ca.capas === cb.capas,
        "un cuerpo cambió de sitio o de forma entre dos construcciones: " + s);
    }
    var rej = new REJ.Rejilla(108, 36);
    var r = APP.componer(a, rej, 0, {});
    if (rej.aTexto().indexOf("♦") >= 0) conCuerpoVisible += 1;
    peor = Math.max(peor, r.metrica.proporcion);
    afirmar(r.metrica.proporcion <= 0.15,
      "con cuerpos, la semilla " + s + " llega a " + (r.metrica.proporcion * 100).toFixed(1) + "%");
    afirmar(r.metrica.lineasLegibles <= 3, "con cuerpos, " + s + " muestra demasiadas líneas legibles");
  });
  console.log("   peor proporción con cuerpos en pantalla: " + (peor * 100).toFixed(2) + "%");
})();

/* ------------------------------------------------------------------ */
titulo("ninguna frase se corta");
(function () {
  var todas = [];
  LEXM.PROFUNDIDAD.forEach(function (n) { todas = todas.concat(n); });
  Object.keys(LEXM.MATERIAL).forEach(function (k) { todas = todas.concat(LEXM.MATERIAL[k]); });
  todas = todas.concat(LEXM.FUGA).concat(LEXM.SALIDA);
  var peorLineas = 0, masLarga = 0, anchos = 0, partidas = 0;
  function sinEspacios(t) { return String(t).replace(/\s+/g, ""); }
  todas.forEach(function (f) {
    masLarga = Math.max(masLarga, f.length);
    var palabraMasLarga = 0;
    f.split(/\s+/).forEach(function (p) { palabraMasLarga = Math.max(palabraMasLarga, p.length); });
    for (var ancho = 10; ancho <= 70; ancho += 1) {
      var l = CON.envolver(f, ancho);
      anchos += 1;
      /* invariante duro: no se pierde una sola letra, a ningún ancho */
      afirmar(sinEspacios(l.join("")) === sinEspacios(f),
        "se perdió texto al envolver en " + ancho + ": " + f);
      l.forEach(function (t) {
        afirmar(t.length <= ancho, "un renglón se pasó del ancho " + ancho + ": " + t);
      });
      /* si el ancho da para la palabra más larga, no se parte ninguna */
      if (ancho >= palabraMasLarga) {
        afirmar(l.join(" ") === f, "se partió una palabra pudiendo no hacerlo, ancho " + ancho + ": " + f);
      } else {
        partidas += 1;
      }
    }
    /* y en un panel realista tiene que caber en tres renglones */
    var caja2 = CON.acomodar(f, 12, 60);
    peorLineas = Math.max(peorLineas, caja2.lineas.length);
    afirmar(caja2.lineas.join(" ") === f, "acomodar perdió texto: " + f);
    afirmar(caja2.lineas.length <= CON.MAX_LINEAS,
      "no cupo en " + CON.MAX_LINEAS + " renglones: " + f);
    afirmar(caja2.ancho <= 60, "acomodar se salió del panel: " + f);
  });
  console.log("   " + todas.length + " frases x " + (anchos / todas.length) +
    " anchos: ninguna pierde una letra · palabra partida sólo cuando no cabe (" +
    partidas + " casos) · la más larga " + masLarga + " caracteres · máximo " +
    peorLineas + " renglones");
})();

/* ------------------------------------------------------------------ */
titulo("los celadores");
(function () {
  var lista = semillas(30, "cel");
  var total = 0, movidos = 0, atrapados = 0, frases = {}, fuera = 0, devueltas = 0;
  lista.forEach(function (s) {
    var m = APP.crearMundo({ semilla: s, cols: 100, rows: 34, esculturas: false });
    m.memoria = new caja.MT_MEMORIA.Memoria("prueba-" + s);
    afirmar(m.ronda && m.ronda.lista.length >= 3, "la semilla " + s + " no puso celadores");
    total += m.ronda.lista.length;
    m.ronda.lista.forEach(function (c) {
      afirmar(m.lab.aire(c.x, c.y), "un celador nació dentro de un muro");
      afirmar(Array.from(c.signos[0]).length >= 2,
        "el signo no es palimpsesto: le faltan caracteres apilados");
    });
    /* rondan: se mueven, y nunca salen del aire */
    var t = 0;
    for (var k = 0; k < 60; k += 1) {
      t += CEL.PASO;
      m.ronda.actualizar(m, t, false);
      m.ronda.lista.forEach(function (c) {
        if (!m.lab.aire(c.x, c.y)) fuera += 1;
      });
    }
    var antes = m.ronda.lista.map(function (c) { return c.x + "," + c.y; }).join("|");
    t += CEL.PASO;
    m.ronda.actualizar(m, t, false);
    if (m.ronda.lista.map(function (c) { return c.x + "," + c.y; }).join("|") !== antes) movidos += 1;

    /* Esc detiene toda proliferación, ellos incluidos */
    var quieto = m.ronda.lista.map(function (c) { return c.x + "," + c.y; }).join("|");
    for (var q = 0; q < 5; q += 1) { t += CEL.PASO; m.ronda.actualizar(m, t, true); }
    afirmar(m.ronda.lista.map(function (c) { return c.x + "," + c.y; }).join("|") === quieto,
      "los celadores siguieron rondando con la proliferación detenida");

    /* alcanzarlos da una frase de salida y devuelve el mapa que se comieron */
    var c0 = m.ronda.vivos()[0];
    if (c0) {
      c0.comido = [{ idx: 5 * m.lab.W + 5, grado: 3, mat: 0 }];
      var r = m.ronda.atrapar(c0, m);
      atrapados += 1;
      devueltas += r.devueltas;
      afirmar(LEXM.SALIDA.indexOf(r.frase) >= 0, "lo que soltó no es del léxico de salida");
      afirmar(!c0.vivo, "el celador siguió vivo tras alcanzarlo");
      afirmar(m.ronda.en(c0.x, c0.y) !== c0, "un celador muerto sigue en la casilla");
      frases[r.frase] = 1;
    }
  });
  afirmar(fuera === 0, fuera + " veces un celador se metió en un muro");
  console.log("   " + total + " celadores en 30 semillas · " + movidos +
    "/30 rondas se movieron · " + atrapados + " alcanzados, " + Object.keys(frases).length +
    " frases distintas, " + devueltas + " casillas devueltas");
})();

/* ------------------------------------------------------------------ */
console.log("\n" + (fallos.length ? "✗" : "✓") + " " + (pruebas - fallos.length) + "/" + pruebas + " comprobaciones");
if (fallos.length) {
  fallos.slice(0, 20).forEach(function (f) { console.log("  ✗ " + f); });
  if (fallos.length > 20) console.log("  … y " + (fallos.length - 20) + " más");
  process.exit(1);
}
process.exit(0);
