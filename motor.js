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

/* ---- el aire: espacios vacios como material ----
   sin distancia las cosas no habitan, solo estan impresas */

G.aire = [
  "\u00A0\u00A0", "\u00A0\u00A0\u00A0", "\u00A0\u00A0\u00A0\u00A0",
  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
  "#aire##aire#", "\u00A0"
];

/* ---- reglas: cielo (capa 1, la mas atras) ---- */

G.astro = (M.astro === "sol") ?
  ["<h4>#solE#</h4>", "<h4>#solEm#</h4>", "<h5>#solE#</h5>", "<font>#solEm#</font>"] :
  ["<h4>#lunaE#</h4>", "<h4>#lunaEm#</h4>", "<h5>#lunaE#</h5>", "<font>#lunaE#</font>"];

G.brillo = (M.astro === "sol") ?
  ["#estrella#", "<sup>#estrella#</sup>", "#aire#", "#aire#"] :
  ["#estrella#", "#estrellaE#", "<sup>#estrella#</sup>", "<sub>#estrellaE#</sub>", "<sup>#signoA#</sup>", "#aire#"];

G.orbita = ["#satelite#", "<sup>#satelite#</sup>", "<sub>#satelite#</sub>", "<font>#satelite#</font>", "#aire#", "#aire#", "#aire#"];

G.nube = [
  "#nubeEm#", "#nubeEm##aire##nubeEm#", "<sup>#nubeEm#</sup>", "<sub>#nubeEm#</sub>",
  "<span>#nubeEm#</span>", "<font>#nubeEm#</font>", "<h6>#nubeEm#</h6>",
  "#tormenta#", "<sub>#tormenta#</sub>", "<span>#boveda#</span>", "<sup>#viento#</sup>", "#aire#"
];

G.avecielo = ["<sub>#aveE#</sub>", "<sup>#aveE#</sup>", "<sup>#aveEm#</sup>", "#aveE#", "#aire#", "#aire#", "#aire#"];

G.cielotramo = [
  "#aire##nube##aire##brillo##aire##orbita#",
  "#brillo##aire##aire##nube##aire##avecielo#",
  "#aire##aire##orbita##aire##nube##aire#",
  "#aire##brillo##aire##aire##brillo##aire##aire#",
  "#nube##aire##nube##aire##aire##brillo#",
  "#aire##aire##avecielo##aire##orbita##aire##aire#",
  "#aire##aire##aire##nube##aire##aire#",
  "#aire##nube##salto##aire##aire##brillo##aire#"
];

/* ---- reglas: nubes frente (capa 3, sobre las montañas) ---- */

G.nubefrente = [
  "#nubeEm#", "#nubeEm##nubeEm#", "<font>#nubeEm#</font>", "<sup>#nubeEm#</sup>",
  "<h6>#nubeEm#</h6>", "<sub>#nubeEm#</sub>", "#tormenta#", ""
];

G.frentetramo = [
  "#aire##nubefrente##aire##avecielo##aire#",
  "#avecielo##aire##aire##nubefrente#",
  "#aire##nubefrente##aire##aire#",
  "#aire##aire##avecielo##aire#",
  "#nubefrente##aire##nubefrente##aire##aire##avecielo#"
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
  "#mata##aire##actividad##aire##mata#",
  "#actividad##aire##compania##aire##aire##mata#",
  "#aire##mata##mata##aire##compania##aire##actividad#",
  "#actividad##actividad##aire##aire##mata##aire#",
  "#mata#<h6>#mata#</h6>#aire##actividad##aire##compania#",
  "#aire##compania##aire##actividad##aire##aire##mata#",
  "#aire##aire##actividad##aire##aire#",
  "#mata##aire##actividad##salto##aire##aire##compania##aire##mata#"
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

/* el salto de linea tambien es material: el agua es una estrofa,
   no una linea — unos cuantos caracteres de agua <br> otros cuantos */

G.salto = ["<br>"];

G.verso = [
  "#corriente##corriente##marino##corriente#",
  "#aire##corriente##marino##corriente#",
  "#corriente##corriente##corriente#",
  "#corriente#<span>#corriente#</span>#marino#",
  "#marino##corriente##corriente##aire#",
  "#aire##corriente##corriente#",        /* orilla: el agua tambien respira */
  "#corriente##aire##marino#"
];

G.estrofa = [
  "#verso##salto##verso#",
  "#verso##salto##aire##verso#",
  "#verso##salto##verso##salto##verso#",
  "#verso##salto##aire##verso##salto##verso#",
  "#aire##verso##salto##verso##salto##aire##verso##salto##verso#"
];

/* ---- montañas raster (capa 2): laderas que se acumulan con
        diferente inclinacion, celda por celda ----

   el perfil sube y baja por segmentos; cada segmento elige inclinacion:
     suave    ~18°  🭈🭆🭂 (una fila cada tres columnas)
     media    ~34°  🭇🭄   (una fila cada dos columnas)
     recta     45°  ◢     (una fila por columna)
     empinada ~63°  🭅+🭋  (dos filas por columna)
   y debajo del perfil todo se rellena de macizo █                       */

var INCL = LEXICO.laderas.inclinaciones;

function sierra(W, H) {
  var grid = [], relleno = [], x = 0, h = 0, y;
  for (y = 0; y < H; y++) grid.push(new Array(W).fill(" "));
  for (y = 0; y < W; y++) relleno.push(0);

  function poner(cx, fy, ch) {
    if (cx >= 0 && cx < W && fy >= 0 && fy < H) grid[fy][cx] = ch;
  }

  /* una unidad de subida con la inclinacion dada; devuelve false si no cabe */
  function subir(incl, tope) {
    if (incl === "suave" && x + 3 <= W && h < tope) {
      for (var a = 0; a < 3; a++) { poner(x, H - h - 1, INCL.subida_suave[a]); relleno[x] = h; x++; }
      h++; return true;
    }
    if (incl === "media" && x + 2 <= W && h < tope) {
      for (var b = 0; b < 2; b++) { poner(x, H - h - 1, INCL.subida_media[b]); relleno[x] = h; x++; }
      h++; return true;
    }
    if (incl === "empinada" && x < W && h + 2 <= tope) {
      poner(x, H - h - 1, INCL.subida_empinada[0]);
      poner(x, H - h - 2, INCL.subida_empinada[1]);
      relleno[x] = h; x++; h += 2; return true;
    }
    if (x < W && h < tope) {   /* recta */
      poner(x, H - h - 1, INCL.subida_recta[0]); relleno[x] = h; x++; h++; return true;
    }
    return false;
  }

  /* una unidad de bajada; devuelve false si no cabe */
  function bajar(incl, piso) {
    if (incl === "suave" && x + 3 <= W && h > piso) {
      for (var c = 0; c < 3; c++) { poner(x, H - h, INCL.bajada_suave[c]); relleno[x] = h - 1; x++; }
      h--; return true;
    }
    if (incl === "media" && x + 2 <= W && h > piso) {
      for (var d = 0; d < 2; d++) { poner(x, H - h, INCL.bajada_media[d]); relleno[x] = h - 1; x++; }
      h--; return true;
    }
    if (incl === "empinada" && x < W && h - 2 >= piso) {
      poner(x, H - h, INCL.bajada_empinada[0]);
      poner(x, H - h + 1, INCL.bajada_empinada[1]);
      relleno[x] = h - 2; x++; h -= 2; return true;
    }
    if (x < W && h > piso) {   /* recta */
      poner(x, H - h, INCL.bajada_recta[0]); relleno[x] = h - 1; x++; h--; return true;
    }
    return false;
  }

  function plano(largo) {
    while (largo-- > 0 && x < W) { relleno[x] = h; x++; }
  }

  var INCLINACIONES = ["suave", "media", "recta", "recta", "empinada", "empinada"];

  /* la cordillera es una sucesion de montes, lomas y huecos:
     no tiene que ocupar todo el ancho — a veces una montaña
     simplemente no sigue, o sigue despues de un vacio */
  while (x < W) {
    var accion = elegir(["monte", "monte", "monte", "monte", "hueco", "hueco", "lomas"]);

    if (accion === "hueco") {          /* suelo desnudo: nada */
      x += entero(2, 9);
      continue;
    }

    if (accion === "lomas") {          /* colinas bajas y suaves */
      var alto = entero(1, Math.max(1, (H / 3) | 0));
      while (h < alto) if (!subir(elegir(["suave", "media"]), alto)) break;
      plano(entero(2, 6));
      while (h > 0) if (!bajar(elegir(["suave", "media"]), 0)) break;
      continue;
    }

    /* monte: subir hasta un pico alto, cresta breve, bajar hasta el suelo,
       cambiando de inclinacion en el camino */
    var pico = entero(Math.ceil(H * .55), H - 1);
    while (h < pico) if (!subir(elegir(INCLINACIONES), pico)) break;
    if (quizas(.35)) plano(entero(1, 3));
    while (h > 0) if (!bajar(elegir(INCLINACIONES), 0)) break;
    if (quizas(.5)) x += quizas(.5) ? 1 : 0;
  }

  /* relleno bajo el perfil */
  for (var cx = 0; cx < W; cx++) {
    for (var fy = H - relleno[cx]; fy < H; fy++) {
      if (grid[fy][cx] === " ") grid[fy][cx] = quizas(.07) ? elegir(LEXICO.laderas.macizo) : "█";
    }
  }

  return grid.map(function (f) { return f.join(""); }).join("<br>");
}

G.roquerio = ["<sub>#rocaE#</sub>", "<sub>#bestiaE#</sub>", "<sub>#signoA#</sub>", "<sub>#plantaE#</sub>", "", "", "", ""];

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
  { id: "sierra",   animas: ["anima-tinta", "anima-sombra", "anima-mascara"] },
  { id: "montanas", animas: ["anima-tinta", "anima-sombra", "anima-mascara"] },
  { id: "nubes",    animas: ["anima-tinta", "anima-sombra"] },
  { id: "vida",     animas: ["anima-tinta", "anima-sombra", "anima-mascara"] },
  { id: "agua",     animas: ["anima-tinta", "anima-mascara", "anima-sombra"] }
];

function fila(html, alinear, pad) {
  var p = (pad === false) ? "0" : "0 " + entero(0, 18) + "%";
  return "<div class='fila' style='text-align:" + alinear + ";padding:" + p + "'>" + html + "</div>";
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
      html += fila(expandir("#aire##astro##aire#"), elegir(["left", "right", "center"]));
      var nf = entero(3, 5);
      for (var f = 0; f < nf; f++) html += fila(repetir("cielotramo", entero(2, 5), ""), elegir(ALINEACIONES));
    }

    if (capa.id === "sierra") {
      /* cordillera lejana: mas columnas, letra chica, medio difusa.
         tamaño en px enteros para que la malla no deje costuras */
      var Ws = entero(100, 150), Hs = entero(6, 10);
      div.style.fontSize = 2 * Math.floor(escenario.clientWidth / Ws) + "px";
      div.style.bottom = entero(44, 58) + "%";
      div.style.opacity = azar(.45, .85).toFixed(2);
      html += fila(sierra(Ws, Hs), "left", false);
    }

    if (capa.id === "montanas") {
      /* cordillera cercana: alta y anclada arriba, para dejar
         el valle y el agua a la vista */
      var Wm = entero(56, 92), Hm = entero(9, 15);
      div.style.fontSize = 2 * Math.floor(escenario.clientWidth / Wm) + "px";
      div.style.bottom = entero(26, 38) + "%";
      html += fila(sierra(Wm, Hm), "left", false);
      /* a veces las montañas marcan un horizonte que sigue donde ellas no */
      if (quizas(.55)) {
        var trazo = elegir(["▔", "▁", "─", "🮂", "🮁"]);
        html += fila(trazo.repeat(Wm), "left", false);
      }
      if (quizas(.3)) html += fila(faldas(), "center");
    }

    if (capa.id === "nubes") {
      div.style.fontSize = azar(2.4, 5).toFixed(2) + "vmax";
      div.style.top = entero(14, 38) + "%";
      var nn = entero(1, 2);
      for (var g = 0; g < nn; g++) html += fila(repetir("frentetramo", entero(1, 4), ""), elegir(ALINEACIONES));
    }

    if (capa.id === "vida") {
      div.style.fontSize = azar(2.2, 4.4).toFixed(2) + "vmax";
      div.style.bottom = entero(7, 17) + "%";
      /* a veces el valle vive sobre un fondo de otro color */
      if (quizas(.4)) {
        anima = elegir(["anima-tinta", "anima-sombra"]);
        div.className = "capa capa-" + capa.id + " " + anima + " fondo-valle";
      }
      var nv = entero(1, 2);
      for (var h = 0; h < nv; h++) html += fila(repetir("vidatramo", entero(2, 4), ""), elegir(ALINEACIONES));
    }

    if (capa.id === "agua") {
      div.style.fontSize = azar(2, 4).toFixed(2) + "vmax";
      var ne = entero(1, 2);
      for (var k = 0; k < ne; k++) html += fila(expandir("#estrofa#"), elegir(ALINEACIONES));
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
  "esquema sierra": rasgos.sierra,
  "esquema montanas": rasgos.montanas,
  "esquema agua": rasgos.agua
};

console.log("paisajes ::", semilla);
console.log("momento:", momento, "| paleta:", modo, "| astro:", M.astro);
console.log(rasgos);

if (typeof fxpreview === "function") setTimeout(fxpreview, 800);

/* clic: otro paisaje */
document.addEventListener("click", function () { location.reload(); });
