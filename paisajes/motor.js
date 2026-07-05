/*
  motor.js — PAISAJES
  poesiasexp / canekzapata

  motor generativo en la linea de sutilezas:
    - prng estilo fxhash (sfc32) — cada hash es un paisaje
    - esquemas de color (momento del dia + modo armonico) sobre variables css
    - esquemas de animacion distintos por capa (gradiente, fondo, tinta, sombra, mascara)
    - mini-tracery incluido: reglas #simbolo# que se expanden sobre LEXICO
    - contenedores de texto: span, font, h4, h5, h6, sub, sup — cada uno con su pulso
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
  var h = MODOS[modo](base);
  var s = azar(M.sat[0], M.sat[1]);
  var l = azar(M.luz[0], M.luz[1]);
  return hsl(h, s, l);
}

var raiz = document.documentElement.style;
var NCOLORES = 32;
var paleta = [];
for (var ci = 0; ci < NCOLORES; ci++) {
  paleta.push(colorNuevo());
  raiz.setProperty("--c" + ci, paleta[ci]);
}

/* angulos, tiempos, sombra, opacidad */
raiz.setProperty("--deg", entero(1, 360) + "deg");
raiz.setProperty("--deg2", entero(1, 360) + "deg");
raiz.setProperty("--t1", azar(0.9, 2.4).toFixed(2) + "s");
raiz.setProperty("--t2", azar(4, 8).toFixed(2) + "s");
raiz.setProperty("--t3", azar(2.4, 5.4).toFixed(2) + "s");
raiz.setProperty("--t4", azar(1.2, 3).toFixed(2) + "s");
raiz.setProperty("--t5", azar(8, 17).toFixed(2) + "s");
raiz.setProperty("--shad", azar(0.4, 2.2).toFixed(2) + "px");
raiz.setProperty("--opa", azar(0.55, 1).toFixed(2));

/* ---------------- mini tracery ---------------- */

var G = {};   /* gramatica */

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
G.diagonal   = LEXICO.laderas.diagonales;
G.sextante   = LEXICO.laderas.sextantes;
G.bloque     = LEXICO.laderas.bloques;
G.sombra     = LEXICO.laderas.sombras;
G.filo       = LEXICO.laderas.filos;
G.rocaE      = LEXICO.rocas.egipcio;
G.rocaB      = LEXICO.rocas.bloques;
G.rocaEm     = LEXICO.rocas.emoji;
G.boveda     = LEXICO.cielo.boveda_egipcio;
G.solE       = LEXICO.cielo.sol_egipcio.concat(LEXICO.cielo.sol_anatolio);
G.solEm      = LEXICO.cielo.sol_emoji;
G.lunaE      = LEXICO.cielo.luna_egipcio.concat(LEXICO.cielo.luna_anatolio);
G.lunaEm     = LEXICO.cielo.luna_emoji;
G.estrellaE  = LEXICO.cielo.estrellas_egipcio;
G.estrella   = LEXICO.cielo.estrellas;
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

/* ---- reglas: cielo ---- */

G.astro = (M.astro === "sol") ?
  ["<h4>#solE#</h4>", "<h4>#solEm#</h4>", "<h5>#solE#</h5>", "<sup><h4>#solE#</h4></sup>", "<font>#solEm#</font>"] :
  ["<h4>#lunaE#</h4>", "<h4>#lunaEm#</h4>", "<h5>#lunaE#</h5>", "<sup><h4>#lunaEm#</h4></sup>", "<font>#lunaE#</font>"];

G.brillo = (M.astro === "sol") ?
  ["#estrella#", "<sup>#estrella#</sup>", ""] :
  ["#estrella#", "#estrellaE#", "<sup>#estrella#</sup>", "<sub>#estrellaE#</sub>", "<sup>#estrellaE#</sup>", ""];

G.nube = [
  "#nubeEm#", "#nubeEm##nubeEm#", "<sup>#nubeEm#</sup>", "<sub>#nubeEm#</sub>",
  "<span>#nubeEm#</span>", "<font>#nubeEm#</font>", "<sup><font>#nubeEm#</font></sup>",
  "<h6>#nubeEm#</h6>", "#tormenta#", "<sub>#tormenta#</sub>", "<span>#boveda#</span>",
  "<sup>#viento#</sup>", ""
];

G.avecielo = [
  "<sub>#aveE#</sub>", "<sup>#aveE#</sup>", "<sup>#aveEm#</sup>", "#aveE#", "", "", ""
];

G.cielotramo = ["#nube##brillo##avecielo#", "#brillo##nube#", "#nube#", "#brillo#", "#nube##nube##brillo#"];

/* ---- reglas: cordillera ---- */

G.cumbre = [
  "#triangulo#", "<h6>#triangulo#</h6>", "#montanaE#", "<h5>#montanaE#</h5>",
  "<h4>#montanaA#</h4>", "#montanaEm#", "<h6>#montanaE#</h6>", "<sup>#filo#</sup>"
];

G.subida = ["#diagonal#", "#diagonal##diagonal#", "<span>#diagonal#</span>", "#filo#"];

G.nieve = ["<sup>❄</sup>", "<sup>#estrella#</sup>", "", "", ""];

G.pico = [
  "#subida##cumbre##subida#",
  "#subida#<sup>#cumbre#</sup>#subida#",
  "#subida##subida##cumbre##nieve##subida#",
  "#cumbre#", "#subida##cumbre#", "#cumbre##subida#",
  "#subida#<sup>#brillo#</sup>#cumbre##subida#"
];

G.cordilleratramo = ["#pico#", "#pico##pico#", "#pico# #pico#", "#pico#<span>#pico#</span>"];

/* ---- reglas: ladera ---- */

G.terreno = [
  "#sextante#", "#sextante#", "#sombra#", "#bloque#", "#diagonal#",
  "<span>#sextante#</span>", "<font>#sombra#</font>", "<h5>#sextante#</h5>",
  "<h6>#bloque#</h6>", "<span>#sombra##sombra#</span>"
];

G.habitante = [
  "<sub>#plantaE#</sub>", "<sup>#plantaE#</sup>", "#plantaE#",
  "<sub>#rocaE#</sub>", "#rocaB#", "<sub>#rocaB#</sub>",
  "<sub>#bestiaE#</sub>", "<sup>#bestiaE#</sup>",
  "<sub>#humano#</sub>", "<sub>#mujer#</sub>", "<sup><font>#dios#</font></sup>",
  "<sub>#plantaEm#</sub>", "#bicho#", "<sub>#signoB#</sub>", ""
];

G.laderatramo = [
  "#terreno##terreno##habitante##terreno#",
  "#terreno##habitante##terreno##terreno##terreno#",
  "#terreno##terreno##terreno#",
  "#terreno#<span>#terreno##habitante#</span>#terreno#",
  "#terreno##terreno#<h5>#terreno#</h5>#habitante#"
];

/* ---- reglas: pradera ---- */

G.mata = [
  "#plantaE#", "#plantaE#", "<span>#plantaE#</span>", "<h5>#plantaE#</h5>",
  "#plantaEm#", "<font>#plantaE#</font>", "<sub>#plantaE#</sub>", "<sup>#plantaE#</sup>"
];

G.vecino = [
  "#humano#", "#mujer#", "<span>#humano#</span>", "#bestiaE#", "<font>#bestiaE#</font>",
  "#bestiaEm#", "<sub>#bicho#</sub>", "<sup>#aveE#</sup>", "<sub>#vasija#</sub>", "", ""
];

G.praderatramo = [
  "#mata##mata##vecino##mata#",
  "#mata##vecino##mata##mata#",
  "#mata##mata##mata##mata##vecino#",
  "#vecino##mata#<span>#mata##mata#</span>",
  "#mata#<h6>#mata#</h6>#vecino##mata#"
];

/* ---- reglas: rio ---- */

G.corriente = [
  "#aguaE#", "#aguaE#", "#onda#", "<span>#aguaE#</span>", "<font>#onda#</font>",
  "<h5>#aguaE#</h5>", "#onda##onda#", "<h6>#aguaE#</h6>"
];

G.nadador = [
  "<sub>#pezE#</sub>", "<sub>#pezE#</sub>", "<sup>#pezE#</sup>", "<sub>#pezEm#</sub>",
  "<sub><font>#pezE#</font></sub>", "<sup>#barca#</sup>", "<sup><span>#barca#</span></sup>",
  "<sub>#aguaEm#</sub>", ""
];

G.riotramo = [
  "#corriente##corriente##nadador##corriente#",
  "#corriente##nadador##corriente##corriente#",
  "#corriente##corriente##corriente#",
  "#corriente#<span>#corriente#</span>#nadador#",
  "#nadador##corriente##corriente#"
];

/* ---------------- capas ---------------- */

var ANIMACIONES = ["anima-gradiente", "anima-fondo", "anima-tinta", "anima-sombra", "anima-mascara"];

/* cuantas filas y que tamaño tiene cada capa */
var CAPAS = [
  { id: "cielo",      tramo: "cielotramo",      filas: entero(1, 3), ancho: [3, 6], talla: [2.2, 4.6] },
  { id: "cordillera", tramo: "cordilleratramo", filas: entero(1, 3), ancho: [2, 5], talla: [3.4, 6.6] },
  { id: "ladera",     tramo: "laderatramo",     filas: entero(2, 5), ancho: [3, 7], talla: [2.8, 6] },
  { id: "pradera",    tramo: "praderatramo",    filas: entero(1, 3), ancho: [2, 5], talla: [2.2, 4.8] },
  { id: "rio",        tramo: "riotramo",        filas: entero(1, 3), ancho: [3, 8], talla: [2, 4.4] }
];

function construir() {
  var paisaje = document.getElementById("paisaje");
  paisaje.innerHTML = "";

  var esquemas = {};

  CAPAS.forEach(function (capa) {
    var div = document.createElement("div");
    var anima = elegir(ANIMACIONES);
    div.className = "capa " + capa.id + " " + anima;
    div.style.fontSize = azar(capa.talla[0], capa.talla[1]).toFixed(2) + "vmax";
    div.style.setProperty("--degcapa", entero(1, 360) + "deg");

    var filas = [];
    for (var f = 0; f < capa.filas; f++) {
      filas.push(repetir(capa.tramo, entero(capa.ancho[0], capa.ancho[1])));
    }
    var html = filas.join("<br>");

    /* el astro sale una sola vez, en una orilla del cielo */
    if (capa.id === "cielo") {
      var astro = expandir("#astro#");
      html = quizas(.5) ? astro + html : html + astro;
    }

    div.innerHTML = html;
    paisaje.appendChild(div);
    esquemas[capa.id] = anima;
  });

  return esquemas;
}

var esquemas = construir();

/* ---------------- rasgos ---------------- */

window.$fxhashFeatures = {
  momento: momento,
  paleta: modo,
  astro: M.astro,
  "esquema cielo": esquemas.cielo,
  "esquema ladera": esquemas.ladera
};

console.log("paisajes ::", semilla);
console.log("momento:", momento, "| paleta:", modo, "| astro:", M.astro);
console.log(esquemas);

if (typeof fxpreview === "function") setTimeout(fxpreview, 800);

/* clic: otro paisaje */
document.addEventListener("click", function () { location.reload(); });
