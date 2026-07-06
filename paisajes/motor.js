/*
  motor.js — PAISAJES
  poesiasexp / canekzapata

  escenario en cinco capas superpuestas (la mas atras primero):
    1. cielo      — fondo total: astro, nubes, satelites, aves, estrellas
    2. montanas   — block elements con direccion: subida ◢ cumbre ▲ bajada ◣
    3. nubes      — nubes y pajaros por delante de las montañas
    4. vida       — humanos en actividades y naturaleza en caracteres
    5. agua       — el rio al frente: ondas, peces, barcas, cosas marinas

  motor en la linea de sutilezas: prng estilo fxhash, esquemas de color
  (momento del dia x modo armonico) sobre variables css, esquemas de
  animacion por capa, mini-tracery sobre LEXICO y contenedores de texto
  (span font h4 h5 h6 sub sup) cada uno con su pulso.
*/

/* ---------------- prng ---------------- */

var alfabeto = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var semilla = (typeof fxhash !== "undefined") ? fxhash :
  "oo" + Array(49).fill(0).map(function () { return alfabeto[(Math.random() * alfabeto.length) | 0]; }).join("");

function b58dec(str) {
  var r = 0;
  for (var i = 0; i < str.length; i++) r = r * alfabeto.length + alfabeto.indexOf(str[i]) | 0;
  return r;
}
function sfc32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
var trozos = semilla.slice(2).match(/.{12}/g).map(b58dec);
var rand = (typeof fxrand !== "undefined") ? fxrand : sfc32(trozos[0], trozos[1], trozos[2], trozos[3]);

function azar(min, max) { return min + rand() * (max - min); }
function entero(min, max) { return Math.floor(azar(min, max + 1)); }
function elegir(arr) { return arr[(rand() * arr.length) | 0]; }
function quizas(p) { return rand() < p; }

/* ---------------- colores ---------------- */

function hsl(h, s, l) {
  return "hsl(" + (((h % 360) + 360) % 360).toFixed(1) + "," + s.toFixed(1) + "%," + l.toFixed(1) + "%)";
}

/* momento del dia: sesga los tonos y decide el astro */
var MOMENTOS = {
  amanecer:  { tonos: [330, 30, 200], luz: [45, 90], sat: [40, 90], astro: "sol" },
  mediodia:  { tonos: [195, 215, 45, 130], luz: [40, 85], sat: [45, 100], astro: "sol" },
  atardecer: { tonos: [10, 35, 300, 275], luz: [25, 70], sat: [55, 100], astro: "sol" },
  noche:     { tonos: [230, 250, 270, 210], luz: [4, 38], sat: [30, 80], astro: "luna" }
};

/* modo armonico: como se reparten los tonos alrededor del momento */
var MODOS = {
  caos:        function (t) { return rand() * 360; },
  mono:        function (t) { return t + azar(-14, 14); },
  analogo:     function (t) { return t + azar(-45, 45); },
  complemento: function (t) { return quizas(.5) ? t + azar(-20, 20) : t + 180 + azar(-20, 20); },
  triada:      function (t) { return t + elegir([0, 120, 240]) + azar(-15, 15); }
};

var momento = elegir(Object.keys(MOMENTOS));
var modo = elegir(Object.keys(MODOS));
var M = MOMENTOS[momento];

function colorNuevo() {
  var base = elegir(M.tonos);
  return hsl(MODOS[modo](base), azar(M.sat[0], M.sat[1]), azar(M.luz[0], M.luz[1]));
}

var raiz = document.documentElement.style;
for (var ci = 0; ci < 32; ci++) raiz.setProperty("--c" + ci, colorNuevo());

raiz.setProperty("--deg", entero(1, 360) + "deg");
raiz.setProperty("--deg2", entero(1, 360) + "deg");
raiz.setProperty("--t1", azar(0.9, 2.4).toFixed(2) + "s");
raiz.setProperty("--t2", azar(4, 8).toFixed(2) + "s");
raiz.setProperty("--t3", azar(2.4, 5.4).toFixed(2) + "s");
raiz.setProperty("--t4", azar(1.2, 3).toFixed(2) + "s");
raiz.setProperty("--t5", azar(8, 17).toFixed(2) + "s");
raiz.setProperty("--shad", azar(0.4, 2.2).toFixed(2) + "px");

/* ---------------- mini tracery ---------------- */

var G = {};

function expandir(regla, prof) {
  prof = prof || 0;
  if (prof > 24) return "";
  return regla.replace(/#([a-zA-Z0-9_]+)#/g, function (_, sim) {
    var opciones = G[sim];
    if (!opciones) return "";
    return expandir(elegir(opciones), prof + 1);
  });
}

function repetir(sim, veces, sep) {
  var salida = [];
  for (var i = 0; i < veces; i++) salida.push(expandir("#" + sim + "#"));
  return salida.join(sep || "");
}

/* terminales: el lexico entra directo como simbolos */
G.montanaE   = LEXICO.montanas.egipcio;
G.montanaA   = LEXICO.montanas.anatolio;
G.montanaEm  = LEXICO.montanas.emoji;
G.triangulo  = LEXICO.montanas.triangulos;
G.subida     = LEXICO.laderas.subida;
G.bajada     = LEXICO.laderas.bajada;
G.cornisaI   = LEXICO.laderas.cornisa_izq;
G.cornisaD   = LEXICO.laderas.cornisa_der;
G.cumbre     = LEXICO.laderas.cumbres;
G.macizo     = LEXICO.laderas.macizo;
G.sextante   = LEXICO.laderas.sextantes;
G.bloque     = LEXICO.laderas.bloques;
G.sombra     = LEXICO.laderas.sombras;
G.filo       = LEXICO.laderas.filos;
G.rocaE      = LEXICO.rocas.egipcio;
G.rocaB      = LEXICO.rocas.bloques;
G.boveda     = LEXICO.cielo.boveda_egipcio;
G.solE       = LEXICO.cielo.sol_egipcio.concat(LEXICO.cielo.sol_anatolio);
G.solEm      = LEXICO.cielo.sol_emoji;
G.lunaE      = LEXICO.cielo.luna_egipcio.concat(LEXICO.cielo.luna_anatolio);
G.lunaEm     = LEXICO.cielo.luna_emoji;
G.estrellaE  = LEXICO.cielo.estrellas_egipcio;
G.estrella   = LEXICO.cielo.estrellas;
G.satelite   = LEXICO.cielo.satelites;
G.nubeEm     = LEXICO.nubes.emoji;
G.tormenta   = LEXICO.nubes.tormenta_anatolio.concat(LEXICO.nubes.lluvia_egipcio);
G.viento     = LEXICO.nubes.viento_egipcio;
G.aguaE      = LEXICO.agua.egipcio.concat(LEXICO.agua.anatolio);
G.aguaEm     = LEXICO.agua.emoji;
G.onda       = LEXICO.agua.ondas;
G.barca      = LEXICO.barcas.egipcio.concat(LEXICO.barcas.emoji);
G.pezE       = LEXICO.peces.egipcio;
G.pezEm      = LEXICO.peces.emoji;
G.aveE       = LEXICO.aves.egipcio.concat(LEXICO.aves.anatolio);
G.aveEm      = LEXICO.aves.emoji;
G.bestiaE    = LEXICO.animales.egipcio.concat(LEXICO.animales.anatolio, LEXICO.animales.linearb);
G.bicho      = LEXICO.animales.reptiles_egipcio.concat(LEXICO.animales.insectos_egipcio);
G.bestiaEm   = LEXICO.animales.emoji;
G.humano     = LEXICO.humanos.egipcio.concat(LEXICO.humanos.anatolio, LEXICO.humanos.linearb);
G.mujer      = LEXICO.humanos.egipcio_mujeres;
G.dios       = LEXICO.humanos.egipcio_dioses;
G.plantaE    = LEXICO.plantas.egipcio.concat(LEXICO.plantas.anatolio, LEXICO.plantas.linearb);
G.plantaEm   = LEXICO.plantas.emoji;
G.signoA     = LEXICO.signos.lineara;
G.signoB     = LEXICO.signos.linearb_silabas;
G.vasija     = LEXICO.signos.linearb_vasijas;

/* ---- reglas: cielo (capa 1, la mas atras) ---- */

G.astro = (M.astro === "sol") ?
  ["<h4>#solE#</h4>", "<h4>#solEm#</h4>", "<h5>#solE#</h5>", "<font>#solEm#</font>"] :
  ["<h4>#lunaE#</h4>", "<h4>#lunaEm#</h4>", "<h5>#lunaE#</h5>", "<font>#lunaE#</font>"];

G.brillo = (M.astro === "sol") ?
  ["#estrella#", "<sup>#estrella#</sup>", "", ""] :
  ["#estrella#", "#estrellaE#", "<sup>#estrella#</sup>", "<sub>#estrellaE#</sub>", "<sup>#signoA#</sup>", ""];

G.orbita = ["#satelite#", "<sup>#satelite#</sup>", "<sub>#satelite#</sub>", "<font>#satelite#</font>", "", "", ""];

G.nube = [
  "#nubeEm#", "#nubeEm##nubeEm#", "<sup>#nubeEm#</sup>", "<sub>#nubeEm#</sub>",
  "<span>#nubeEm#</span>", "<font>#nubeEm#</font>", "<h6>#nubeEm#</h6>",
  "#tormenta#", "<sub>#tormenta#</sub>", "<span>#boveda#</span>", "<sup>#viento#</sup>", ""
];

G.avecielo = ["<sub>#aveE#</sub>", "<sup>#aveE#</sup>", "<sup>#aveEm#</sup>", "#aveE#", "", "", ""];

G.cielotramo = [
  "#nube# #brillo# #orbita#", "#brillo##nube# #avecielo#", "#orbita# #nube#",
  "#brillo# #brillo#", "#nube##nube# #brillo#", "#avecielo# #orbita#"
];

/* ---- reglas: nubes frente (capa 3, sobre las montañas) ---- */

G.nubefrente = [
  "#nubeEm#", "#nubeEm##nubeEm#", "<font>#nubeEm#</font>", "<sup>#nubeEm#</sup>",
  "<h6>#nubeEm#</h6>", "<sub>#nubeEm#</sub>", "#tormenta#", ""
];

G.frentetramo = [
  "#nubefrente#  #avecielo#", "#avecielo# #nubefrente#", "#nubefrente#",
  "#avecielo#", "#nubefrente# #nubefrente# #avecielo#"
];

/* ---- reglas: vida (capa 4) ---- */

G.actividad = [
  "#humano#", "#humano##humano#", "#mujer#", "#humano#<sub>#vasija#</sub>",
  "<span>#humano#</span>", "<font>#humano#</font>", "<h5>#humano#</h5>",
  "<sub>#humano#</sub>", "#mujer##humano#", "<font>#dios#</font>", "#humano#<sup>#aveE#</sup>"
];

G.mata = [
  "#plantaE#", "#plantaE#", "<span>#plantaE#</span>", "<h5>#plantaE#</h5>",
  "#plantaEm#", "<font>#plantaE#</font>", "<sub>#plantaE#</sub>", "<sup>#plantaE#</sup>"
];

G.compania = [
  "#bestiaE#", "<font>#bestiaE#</font>", "#bestiaEm#", "<sub>#bicho#</sub>",
  "<sub>#rocaE#</sub>", "#rocaB#", "<sub>#signoB#</sub>", "", ""
];

G.vidatramo = [
  "#mata##actividad##mata#", "#actividad# #compania# #mata#",
  "#mata##mata##compania##actividad#", "#actividad##actividad# #mata#",
  "#mata#<h6>#mata#</h6>#actividad##compania#", "#compania##actividad##mata#"
];

/* ---- reglas: agua (capa 5, al frente) ---- */

G.corriente = [
  "#aguaE#", "#aguaE#", "#onda#", "<span>#aguaE#</span>", "<font>#onda#</font>",
  "<h5>#aguaE#</h5>", "#onda##onda#", "<h6>#aguaE#</h6>"
];

G.marino = [
  "<sub>#pezE#</sub>", "<sub>#pezE#</sub>", "<sup>#pezE#</sup>", "<sub>#pezEm#</sub>",
  "<sub><font>#pezE#</font></sub>", "<sup>#barca#</sup>", "<sup><span>#barca#</span></sup>",
  "<sub>#aguaEm#</sub>", ""
];

G.aguatramo = [
  "#corriente##corriente##marino##corriente#",
  "#corriente##marino##corriente##corriente#",
  "#corriente##corriente##corriente#",
  "#corriente#<span>#corriente#</span>#marino#",
  "#marino##corriente##corriente#"
];

/* ---- montañas coherentes (capa 2): subida, cumbre, bajada ---- */

G.picoadorno = ["<sup>❄</sup>", "<sup>#estrella#</sup>", "<sup>#montanaE#</sup>", "", "", "", ""];
G.roquerio = ["<sub>#rocaE#</sub>", "<sub>#bestiaE#</sub>", "<sub>#signoA#</sub>", "<sub>#plantaE#</sub>", "", "", "", ""];

function montana() {
  /* una montaña: ladera izquierda que sube, cumbre, ladera derecha que baja */
  var s = "";
  var anchoIzq = entero(1, 4), anchoDer = entero(1, 4);
  for (var i = 0; i < anchoIzq; i++) s += expandir("#subida#");
  if (quizas(.25)) {                       /* meseta: macizo entre las dos laderas */
    s += repetir("macizo", entero(1, 3));
  } else {                                 /* pico */
    s += expandir(quizas(.5) ? "#cumbre#" : "#macizo#") + expandir("#picoadorno#");
  }
  for (var j = 0; j < anchoDer; j++) s += expandir("#bajada#");
  return s;
}

function cordillera() {
  /* fila de montañas con valles entre medio */
  var s = "";
  var n = entero(2, 5);
  for (var i = 0; i < n; i++) {
    s += montana();
    if (i < n - 1 && quizas(.6)) s += elegir(["", " ", "  ", expandir("#filo#")]);
  }
  return s;
}

function faldas() {
  /* base de la cordillera: macizo con rocas, bestias y signos incrustados */
  var s = "";
  var n = entero(8, 18);
  for (var i = 0; i < n; i++) {
    s += expandir(elegir(["#macizo#", "#macizo#", "#macizo#", "#sextante#", "#sombra#", "#bloque#"]));
    if (quizas(.22)) s += expandir("#roquerio#");
  }
  return s;
}

/* ---------------- capas del escenario ---------------- */

/* esquemas de animacion permitidos por capa: las de adelante van sin fondo
   para dejar ver a las de atras */
var ESCENA = [
  { id: "cielo",    animas: ["anima-gradiente", "anima-gradiente", "anima-mascara"] },
  { id: "montanas", animas: ["anima-tinta", "anima-sombra", "anima-mascara"] },
  { id: "nubes",    animas: ["anima-tinta", "anima-sombra"] },
  { id: "vida",     animas: ["anima-tinta", "anima-sombra", "anima-mascara"] },
  { id: "agua",     animas: ["anima-tinta", "anima-mascara", "anima-sombra"] }
];

function fila(html, alinear) {
  var d = "<div class='fila' style='text-align:" + alinear + ";padding:0 " + entero(0, 18) + "%'>" + html + "</div>";
  return d;
}

var ALINEACIONES = ["left", "center", "right", "center"];

function construir() {
  var escenario = document.getElementById("escenario");
  escenario.innerHTML = "";
  var rasgos = {};

  ESCENA.forEach(function (capa) {
    var div = document.createElement("div");
    var anima = elegir(capa.animas);
    div.className = "capa capa-" + capa.id + " " + anima;
    div.style.setProperty("--degcapa", entero(1, 360) + "deg");
    var html = "";

    if (capa.id === "cielo") {
      div.style.fontSize = azar(2, 4).toFixed(2) + "vmax";
      /* el astro una sola vez, arriba, a un lado */
      html += fila(expandir("#astro#"), elegir(["left", "right", "center"]));
      var nf = entero(2, 4);
      for (var f = 0; f < nf; f++) html += fila(repetir("cielotramo", entero(2, 5), " "), elegir(ALINEACIONES));
    }

    if (capa.id === "montanas") {
      div.style.fontSize = azar(4.5, 9).toFixed(2) + "vmax";
      html += fila(cordillera(), "center");
      if (quizas(.75)) html += fila(faldas(), "center");
    }

    if (capa.id === "nubes") {
      div.style.fontSize = azar(2.4, 5).toFixed(2) + "vmax";
      div.style.top = entero(14, 38) + "%";
      var nn = entero(1, 2);
      for (var g = 0; g < nn; g++) html += fila(repetir("frentetramo", entero(1, 4), "  "), elegir(ALINEACIONES));
    }

    if (capa.id === "vida") {
      div.style.fontSize = azar(2.2, 4.4).toFixed(2) + "vmax";
      div.style.bottom = entero(10, 22) + "%";
      var nv = entero(1, 2);
      for (var h = 0; h < nv; h++) html += fila(repetir("vidatramo", entero(2, 4), " "), elegir(ALINEACIONES));
    }

    if (capa.id === "agua") {
      div.style.fontSize = azar(2, 4).toFixed(2) + "vmax";
      var na = entero(1, 3);
      for (var k = 0; k < na; k++) html += fila(repetir("aguatramo", entero(3, 7)), elegir(ALINEACIONES));
    }

    div.innerHTML = html;
    escenario.appendChild(div);
    rasgos[capa.id] = anima;
  });

  return rasgos;
}

var rasgos = construir();

/* ---------------- rasgos ---------------- */

window.$fxhashFeatures = {
  momento: momento,
  paleta: modo,
  astro: M.astro,
  "esquema cielo": rasgos.cielo,
  "esquema montanas": rasgos.montanas,
  "esquema agua": rasgos.agua
};

console.log("paisajes ::", semilla);
console.log("momento:", momento, "| paleta:", modo, "| astro:", M.astro);
console.log(rasgos);

if (typeof fxpreview === "function") setTimeout(fxpreview, 800);

/* clic: otro paisaje */
document.addEventListener("click", function () { location.reload(); });
