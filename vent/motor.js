/*
  motor.js — VENT
  poesiasexp / canekzapata

  una pieza generativa en clave de mapa y blueprint (the designers republic),
  en tres modulos superpuestos sobre una reticula:

    campo      — la pantalla grande, el arte abstracto: frases (psfx) y
                 conjuntos de caracteres unicode (sutileza) esparcidos en
                 varias escalas y fuentes, con evolucion de color (fonts)
    territorio — un cuadro (~20%) en una esquina al azar: un creador de
                 territorio; campo de alturas -> trama de caracteres = mapa
    conector   — una franja (~30%) horizontal o vertical: toma los tokens
                 que uso el campo y los reconecta como diagrama de nodos

  motor en la linea de sutilezas/paisajes: prng estilo fxhash, esquema de
  color (momento del dia x modo armonico) sobre variables css, y un
  substrato de plano (fondo casi negro, tinta azul, acentos de registro).

  clic: otra composicion
*/

/* ==================== prng ==================== */
var alfabeto = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var semilla = (typeof fxhash !== "undefined") ? fxhash :
  "oo" + Array(49).fill(0).map(function () { return alfabeto[(Math.random() * alfabeto.length) | 0]; }).join("");

function b58dec(str) { var r = 0; for (var i = 0; i < str.length; i++) r = r * alfabeto.length + alfabeto.indexOf(str[i]) | 0; return r; }
function sfc32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = (a + b | 0) + d | 0; d = d + 1 | 0;
    a = b ^ b >>> 9; b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11; c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
var trozos = semilla.slice(2).match(/.{12}/g).map(b58dec);
var rand = (typeof fxrand !== "undefined") ? fxrand : sfc32(trozos[0], trozos[1], trozos[2], trozos[3]);

function azar(min, max) { return min + rand() * (max - min); }
function entero(min, max) { return Math.floor(azar(min, max + 1)); }
function elegir(a) { return a[(rand() * a.length) | 0]; }
function quizas(p) { return rand() < p; }
function barajar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (rand() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function hex(n, len) { var s = Math.floor(n).toString(16).toUpperCase(); while (s.length < (len || 2)) s = "0" + s; return s; }

/* ==================== color ==================== */
function hsl(h, s, l) { return "hsl(" + (((h % 360) + 360) % 360).toFixed(1) + "," + s.toFixed(1) + "%," + l.toFixed(1) + "%)"; }

var MOMENTOS = {
  amanecer:  { tonos: [330, 30, 200] },
  mediodia:  { tonos: [195, 215, 45, 130] },
  atardecer: { tonos: [10, 35, 300, 275] },
  noche:     { tonos: [230, 250, 270, 210] }
};
var MODOS = {
  caos:        function ()  { return rand() * 360; },
  mono:        function (t) { return t + azar(-14, 14); },
  analogo:     function (t) { return t + azar(-45, 45); },
  complemento: function (t) { return quizas(.5) ? t + azar(-20, 20) : t + 180 + azar(-20, 20); },
  triada:      function (t) { return t + elegir([0, 120, 240]) + azar(-15, 15); }
};

var momento = elegir(Object.keys(MOMENTOS));
var modo = elegir(Object.keys(MODOS));
var M = MOMENTOS[momento];
var baseH = elegir(M.tonos);

/* la tinta del texto: viva y clara para leerse sobre el plano oscuro */
function colorTexto() { return hsl(MODOS[modo](elegir(M.tonos)), azar(55, 100), azar(46, 86)); }

var raiz = document.documentElement.style;
for (var ci = 0; ci < 32; ci++) raiz.setProperty("--c" + ci, colorTexto());

/* el substrato de blueprint: casi negro, con trazo azul y acentos de registro */
var fondoH = baseH + azar(-12, 12);
raiz.setProperty("--fondo",  hsl(fondoH, azar(28, 46), azar(4, 6.5)));
raiz.setProperty("--fondo2", hsl(fondoH + azar(-8, 8), azar(26, 44), azar(7, 10)));
raiz.setProperty("--linea",  hsl(fondoH + azar(-14, 14), azar(38, 62), azar(30, 42)));
raiz.setProperty("--tinta",  hsl(MODOS[modo](baseH), azar(78, 100), azar(64, 78)));
raiz.setProperty("--tinta2", hsl(baseH + azar(150, 205), azar(82, 100), azar(60, 72)));
raiz.setProperty("--tinta3", hsl(baseH + elegir([40, 55, -30]), azar(80, 100), azar(58, 70)));

raiz.setProperty("--deg", entero(1, 360) + "deg");
raiz.setProperty("--deg2", entero(1, 360) + "deg");
raiz.setProperty("--t1", azar(0.9, 2.4).toFixed(2) + "s");
raiz.setProperty("--t2", azar(4, 8).toFixed(2) + "s");
raiz.setProperty("--t3", azar(2.4, 5.4).toFixed(2) + "s");
raiz.setProperty("--t4", azar(1.2, 3).toFixed(2) + "s");
raiz.setProperty("--t5", azar(9, 18).toFixed(2) + "s");
raiz.setProperty("--shad", azar(0.5, 2.2).toFixed(2) + "px");
var pasoRejilla = entero(26, 42);
raiz.setProperty("--rejilla", pasoRejilla + "px");

/* ==================== pozos de material ==================== */
var G = VOC.glifos;

/* todos los sets de glifos abstractos, para las paredes de sutileza */
var TRAMA = G.sextantes.concat(G.cunas, G.legacy, G.bloques);
var SIGNO = G.phaistos.concat(G.tibetano, G.ogham, G.runas);
var GEOM  = G.geometrias.concat(G.marcas, G.operadores);
var CAJA  = G.cajas;

/* material cartografico prestado del lexico de paisajes */
var LX = (typeof LEXICO !== "undefined") ? LEXICO : null;
var MACIZO = LX ? LX.laderas.macizo : ["█", "▓", "▇", "▆"];
var CUMBRE = LX ? LX.laderas.cumbres : ["▲", "◭", "◮"];
var ONDA   = G.ondas;
var MARCADOR = ["◉", "⊕", "✜", "⌖", "⊙", "◎", "✛", "⧉"];

/* fuentes: latinas (pixel/blueprint, para frases legibles) y exoticas (glifos) */
var FUENTES_TEXTO  = ["vga", "wang", "hplx", "ever", "alpha", "unifont", "symbola"];
var FUENTES_GLIFO  = ["egipcio", "anatolio", "linearb", "tibet", "phags", "sign", "symbola", "unifont", "unscii"];

/* memoria de lo que el campo puso en pantalla, para que el conector lo re-lea */
var usados = { conceptos: [], signos: [] };
function recordarConcepto(w) { if (w && usados.conceptos.indexOf(w) < 0) usados.conceptos.push(w); }
function recordarSigno(s) { if (s) usados.signos.push(s); }

/* ==================== util ==================== */
function crear(tag, clase, padre) {
  var el = document.createElement(tag);
  if (clase) el.className = clase;
  if (padre) padre.appendChild(el);
  return el;
}
function svgEl(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }

/* envuelve texto en contenedores pulsantes al azar (la vida de sutileza) */
var TAGS = ["span", "font", "h5", "h6", "sub"];
function pulso(txt) { var t = elegir(TAGS); return "<" + t + ">" + txt + "</" + t + ">"; }
function envolverFrase(frase) {
  return frase.split(" ").map(function (w) { return quizas(.32) ? pulso(w) : w; }).join(" ");
}

var escena = document.getElementById("escena");
escena.innerHTML = "";

/* ==================== campo (pieza principal) ==================== */
function racimo(pool, n) {
  var s = "";
  for (var i = 0; i < n; i++) s += quizas(.4) ? pulso(elegir(pool)) : elegir(pool);
  return s;
}

function escala() {
  var r = rand();
  if (r < 0.055) return azar(11, 18);    // gigante (psfx)
  if (r < 0.22)  return azar(6, 10);      // grande
  if (r < 0.58)  return azar(3, 5.2);     // media
  if (r < 0.86)  return azar(1.7, 2.8);   // chica
  return azar(1.0, 1.5);                  // micro
}

function cifra() {
  var s = elegir(VOC.tecnica.siglas) + "·" + hex(entero(0, 4095), 3);
  var extra = elegir([
    " " + entero(0, 999) + elegir(VOC.tecnica.unidades),
    " " + elegir(VOC.tecnica.signos) + " " + entero(0, 360) + "°",
    " " + azar(0, 1).toFixed(3),
    " " + elegir(VOC.tecnica.signos) + hex(entero(0, 255), 2)
  ]);
  return "<font>" + s + "</font>" + extra;
}

function pieza(cx, cy) {
  var el = crear("div", "pieza");
  var tam = escala();
  var tipo = elegir([
    "frase", "frase", "fragmento", "fragmento", "palabra", "palabra",
    "mosaico", "mosaico", "cluster", "cluster", "cifra"
  ]);
  var html = "", fam;

  if (tipo === "frase") {
    tam = Math.min(tam, 5.4);
    fam = elegir(FUENTES_TEXTO);
    var fr = elegir(VOC.frases);
    html = envolverFrase(fr);
    el.style.maxWidth = entero(22, 42) + "vw";
    fr.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase().replace(/[.,¡!¿?;:«»]/g, "")); });
  } else if (tipo === "fragmento") {
    fam = elegir(FUENTES_TEXTO);
    var pal = elegir(VOC.frases).split(" ").filter(function (w) { return w.length > 2; });
    var ini = entero(0, Math.max(0, pal.length - 3));
    var frag = pal.slice(ini, ini + entero(2, 4)).join(" ").replace(/[.,¡!¿?;:«»]/g, "");
    html = envolverFrase(frag);
    el.style.maxWidth = "34vw";
    frag.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase()); });
  } else if (tipo === "palabra") {
    fam = elegir(FUENTES_TEXTO);
    var w2 = elegir(VOC.palabras);
    recordarConcepto(w2);
    html = quizas(.5) ? "<span class='mascara'>" + w2 + "</span>" : envolverFrase(w2);
  } else if (tipo === "mosaico") {
    fam = elegir(["unscii", "unifont", "symbola"]);
    var pool = elegir([TRAMA, TRAMA, CAJA, SIGNO, GEOM]);
    html = racimo(pool, entero(14, 46));
    el.style.maxWidth = entero(10, 26) + "vw";
    for (var m = 0; m < 3; m++) recordarSigno(elegir(pool));
    tam = Math.min(tam, 4.5);
  } else if (tipo === "cluster") {
    fam = elegir(FUENTES_GLIFO);
    var pool2 = elegir([SIGNO, SIGNO, TRAMA, GEOM, ONDA]);
    html = racimo(pool2, entero(3, 8));
    recordarSigno(elegir(pool2));
  } else { // cifra: lectura tecnica de blueprint
    fam = elegir(["vga", "wang", "hplx"]);
    tam = Math.min(tam, 2.6);
    html = cifra();
    el.style.letterSpacing = ".06em";
  }

  el.innerHTML = html;
  el.style.left = cx + "%";
  el.style.top = cy + "%";
  el.style.fontSize = tam.toFixed(2) + "vmin";
  el.style.fontFamily = "'" + fam + "', 'unifont', 'symbola', monospace";
  el.style.color = quizas(.5) ? "var(--tinta)" : "var(--c" + entero(0, 31) + ")";
  el.style.zIndex = Math.round(100 - tam);
  el.style.opacity = azar(.72, 1).toFixed(2);
  if (quizas(.14)) el.style.transform += " rotate(" + elegir([-90, 90, 180]) + "deg)";
  return { el: el, tam: tam };
}

function construirCampo() {
  var campo = crear("div", "", escena); campo.id = "campo";

  var gc = entero(6, 8), gr = entero(5, 7);
  var celdas = [];
  for (var y = 0; y < gr; y++) for (var x = 0; x < gc; x++) celdas.push([x, y]);
  celdas = barajar(celdas);

  var total = Math.min(celdas.length, entero(30, 44));
  var piezas = [];
  for (var i = 0; i < total; i++) {
    var cel = celdas[i];
    var cx = (cel[0] + 0.5) / gc * 100 + azar(-6, 6);
    var cy = (cel[1] + 0.5) / gr * 100 + azar(-6, 6);
    cx = Math.max(4, Math.min(96, cx));
    cy = Math.max(6, Math.min(94, cy));
    piezas.push(pieza(cx, cy));
  }
  piezas.sort(function (a, b) { return b.tam - a.tam; });   // grandes al fondo
  piezas.forEach(function (p) { campo.appendChild(p.el); });
  return campo;
}

/* ==================== territorio (mapa / topologia) ==================== */
function anchoAvance(fam) {
  var m = crear("span", "", document.body);
  m.style.cssText = "position:absolute;visibility:hidden;font-family:'" + fam + "',monospace;font-size:100px;line-height:1;white-space:pre";
  m.textContent = "██████████";
  var w = m.offsetWidth / 10 / 100;
  document.body.removeChild(m);
  return w || 0.5;
}

function generarMapa(cols, rows) {
  var K = entero(3, 6), colinas = [];
  for (var k = 0; k < K; k++) colinas.push({
    x: azar(0.1, 0.9) * cols, y: azar(0.1, 0.9) * rows,
    r: azar(0.14, 0.4) * Math.min(cols, rows * 2), a: azar(0.6, 1.2)
  });
  var vetaAng = azar(0, Math.PI), vetaF = azar(0.05, 0.14);

  var alt = [], min = 1e9, max = -1e9;
  for (var y = 0; y < rows; y++) {
    alt.push([]);
    for (var x = 0; x < cols; x++) {
      var e = 0;
      for (var c = 0; c < colinas.length; c++) {
        var h = colinas[c];
        var dx = (x - h.x), dy = (y - h.y) * 2;   // celda 2:1 -> circular
        e += h.a * Math.exp(-(dx * dx + dy * dy) / (2 * h.r * h.r));
      }
      e += 0.12 * Math.sin((x * Math.cos(vetaAng) + y * 2 * Math.sin(vetaAng)) * vetaF);
      alt[y].push(e);
      if (e < min) min = e; if (e > max) max = e;
    }
  }
  var grid = [];
  for (var y2 = 0; y2 < rows; y2++) {
    grid.push([]);
    for (var x2 = 0; x2 < cols; x2++) grid[y2].push((alt[y2][x2] - min) / (max - min + 1e-9));
  }
  return grid;
}

function caracterAltura(n) {
  if (n < 0.20) return quizas(.06) ? elegir(["·", "∙", "⌇"]) : " ";            // mar
  if (n < 0.34) return quizas(.5) ? "░" : elegir(["·", "░", "▒"]);             // costa
  if (n < 0.52) return quizas(.15) ? elegir(ONDA) : "▒";                       // baja
  if (n < 0.72) return quizas(.12) ? elegir(G.legacy) : "▓";                   // media
  return quizas(.12) ? elegir(CUMBRE) : elegir(["█", elegir(MACIZO)]);         // alta
}

function construirTerritorio(corner) {
  var mod = crear("div", "modulo", escena); mod.id = "territorio";
  var lado = entero(34, 42);
  mod.style.width = lado + "vmin";
  mod.style.height = lado + "vmin";
  var inset = 2.4;
  /* deja libre la banda superior/inferior donde vive el hud global */
  if (corner[0] === "t") mod.style.top = banda + "vmin"; else mod.style.bottom = banda + "vmin";
  if (corner[1] === "l") mod.style.left = inset + "vmin"; else mod.style.right = inset + "vmin";

  var idHex = hex(entero(0, 65535), 4);
  var cab = crear("div", "cab", mod);
  cab.innerHTML = "<span class='n'>TERR·" + idHex + "</span> TOPO <span class='d'>θ" + entero(0, 360) + "°</span>";
  ["a", "b", "c", "d"].forEach(function (k) { crear("div", "esq " + k, mod); });
  var cuerpo = crear("div", "cuerpo", mod);

  requestAnimationFrame(function () {
    var W = cuerpo.clientWidth, H = cuerpo.clientHeight;
    var av = anchoAvance("unscii");
    var rows = entero(24, 32);
    var F = H / rows;
    var cols = Math.max(20, Math.floor(W / (F * av)));
    var grid = generarMapa(cols, rows);

    var lineas = [];
    for (var y = 0; y < rows; y++) {
      var s = "";
      for (var x = 0; x < cols; x++) s += caracterAltura(grid[y][x]);
      lineas.push(s);
    }
    var mapa = crear("div", "mapa", cuerpo);
    mapa.style.fontSize = F.toFixed(2) + "px";
    mapa.style.color = "color-mix(in srgb, var(--tinta) 82%, var(--linea))";
    mapa.innerHTML = lineas.join("<br>");

    var cimas = [], intentos = 0;
    var objetivo = entero(2, 4);
    while (cimas.length < objetivo && intentos++ < 300) {
      var mx = entero(2, cols - 3), my = entero(2, rows - 3);
      if (grid[my][mx] > 0.6) cimas.push([mx, my]);
    }
    if (cimas.length >= 2) {
      var svg = svgEl("svg");
      svg.setAttribute("viewBox", "0 0 " + cols + " " + rows);
      svg.setAttribute("preserveAspectRatio", "none");
      svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      var d = "M " + (cimas[0][0] + .5) + " " + (cimas[0][1] + .5);
      for (var q = 1; q < cimas.length; q++) {
        d += " L " + (cimas[q][0] + .5) + " " + (cimas[q - 1][1] + .5);
        d += " L " + (cimas[q][0] + .5) + " " + (cimas[q][1] + .5);
      }
      var path = svgEl("path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--tinta2)");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-dasharray", "3 2");
      path.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(path);
      mapa.appendChild(svg);
    }
    cimas.forEach(function (c, idx) {
      var mk = crear("div", "marca", mapa);
      mk.style.left = (c[0] / cols * 100) + "%";
      mk.style.top = (c[1] / rows * 100) + "%";
      mk.style.transform = "translate(-50%,-50%)";
      mk.style.fontSize = (F * 1.3).toFixed(1) + "px";
      mk.innerHTML = elegir(MARCADOR) + "<span style='font-family:vga;font-size:" + (F * .7).toFixed(1) + "px;color:var(--tinta3)'> " + elegir(VOC.tecnica.siglas).slice(0, 3) + hex(idx, 2) + "</span>";
    });
  });

  var glosas = [
    { t: "N " + entero(0, 89) + "°" + hex(entero(0, 59), 2) + "′", p: "top:3vmin;left:.6em" },
    { t: "E " + entero(0, 179) + "°" + hex(entero(0, 59), 2) + "′", p: "bottom:.5em;right:.6em" },
    { t: "1:" + elegir(["∞", entero(2, 9) + "·10^" + entero(3, 6)]), p: "bottom:.5em;left:.6em" },
    { t: "↑N", p: "top:3vmin;right:.6em" }
  ];
  glosas.forEach(function (g) {
    var el = crear("div", "glosa", cuerpo);
    el.textContent = g.t;
    el.style.cssText += ";" + g.p;
  });
  return mod;
}

/* ==================== conector (diagrama de nodos) ==================== */
function construirConector(vertical, anclaje) {
  var mod = crear("div", "modulo", escena); mod.id = "conector";
  var inset = 2.4;
  if (vertical) {
    mod.style.width = entero(26, 32) + "vw";
    mod.style.top = banda + "vmin"; mod.style.bottom = banda + "vmin";
    if (anclaje === "l") mod.style.left = inset + "vmin"; else mod.style.right = inset + "vmin";
  } else {
    mod.style.height = entero(26, 32) + "vh";
    mod.style.left = inset + "vmin"; mod.style.right = inset + "vmin";
    if (anclaje === "t") mod.style.top = banda + "vmin"; else mod.style.bottom = banda + "vmin";
  }

  var conceptos = usados.conceptos.length ? barajar(usados.conceptos) : barajar(VOC.palabras);
  var signos = usados.signos.length ? usados.signos : SIGNO;
  var N = entero(6, 10);

  var idHex = hex(entero(0, 65535), 4);
  var cab = crear("div", "cab", mod);
  cab.innerHTML = "<span class='n'>LINK·" + idHex + "</span> " + (vertical ? "FLUX/V" : "FLUX/H") +
    " <span class='d'>" + N + "·" + hex(entero(0, 255), 2) + "</span>";
  ["a", "b", "c", "d"].forEach(function (k) { crear("div", "esq " + k, mod); });
  var cuerpo = crear("div", "cuerpo", mod);

  var nodos = [];
  for (var i = 0; i < N; i++) {
    var a = (i + 0.5) / N;
    var b = 0.5 + azar(-0.32, 0.32);
    var esConcepto = quizas(.6) && conceptos.length;
    var token = esConcepto ? conceptos[i % conceptos.length] : racimo(signos, entero(1, 3));
    nodos.push({ x: (vertical ? b : a) * 100, y: (vertical ? a : b) * 100, token: token, concepto: esConcepto, i: i });
  }

  var svg = svgEl("svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  cuerpo.appendChild(svg);

  function segmento(n1, n2, clase) {
    var p = svgEl("path");
    var d = vertical
      ? "M " + n1.x + " " + n1.y + " L " + n1.x + " " + ((n1.y + n2.y) / 2) + " L " + n2.x + " " + ((n1.y + n2.y) / 2) + " L " + n2.x + " " + n2.y
      : "M " + n1.x + " " + n1.y + " L " + ((n1.x + n2.x) / 2) + " " + n1.y + " L " + ((n1.x + n2.x) / 2) + " " + n2.y + " L " + n2.x + " " + n2.y;
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    if (clase === "ramal") {
      p.setAttribute("stroke", "var(--tinta2)"); p.setAttribute("stroke-width", "1");
      p.setAttribute("stroke-dasharray", "4 3"); p.setAttribute("opacity", ".65");
    } else {
      p.setAttribute("stroke", "var(--tinta)"); p.setAttribute("stroke-width", "1.4"); p.setAttribute("opacity", ".85");
    }
    svg.appendChild(p);
  }
  for (var s = 0; s < nodos.length - 1; s++) segmento(nodos[s], nodos[s + 1], "espina");
  var ramales = entero(2, 4);
  for (var r = 0; r < ramales; r++) {
    var i1 = entero(0, nodos.length - 1), i2 = entero(0, nodos.length - 1);
    if (Math.abs(i1 - i2) > 1) segmento(nodos[i1], nodos[i2], "ramal");
  }

  nodos.forEach(function (n) {
    var el = crear("div", "nodo", cuerpo);
    el.style.left = n.x + "%";
    el.style.top = n.y + "%";
    var glifo = n.concepto ? envolverFrase(n.token) : "<font>" + n.token + "</font>";
    var fam = n.concepto ? elegir(["vga", "wang", "ever"]) : elegir(FUENTES_GLIFO);
    var tam = n.concepto ? azar(1.3, 2.2) : azar(2.4, 4.2);
    el.innerHTML =
      "<span class='et'>" + elegir(["N", "K", "Ø", "V"]) + hex(n.i, 2) + "</span>" +
      "<span class='pt' style='font-family:\"" + fam + "\",unifont,symbola,monospace;font-size:" + tam.toFixed(2) + "vmin'>" + glifo + "</span>";
    var punto = crear("div", "", cuerpo);
    punto.style.cssText = "position:absolute;left:" + n.x + "%;top:" + n.y + "%;transform:translate(-50%,-50%);" +
      "width:.9vmin;height:.9vmin;border:1px solid var(--tinta);opacity:.55;" +
      (n.concepto ? "" : "border-radius:50%;border-color:var(--tinta2);");
  });
  return mod;
}

/* ==================== marco / hud de blueprint ==================== */
function regla(n) { var s = ""; for (var i = 0; i < n; i++) s += (i % 5 === 0) ? "┼" : "·"; return s; }

function construirChrome() {
  [["tl", "⌖"], ["tr", "⌖"], ["bl", "⊹"], ["br", "⊹"]].forEach(function (m) {
    var el = crear("div", "mira " + m[0], document.body);
    el.textContent = m[1];
    el.style.animation = "latido " + azar(2, 4).toFixed(1) + "s ease infinite";
  });

  var sem = semilla.slice(2, 11).toUpperCase();
  var hud = [
    { c: "top:2.4vmin;left:2.4vmin;text-align:left",
      h: "<span class='hi'>VENT</span> <span class='lo'>///</span> " + sem + "\n" +
         "MOMENTO <span class='mg'>" + momento.toUpperCase() + "</span> · PALETA <span class='mg'>" + modo.toUpperCase() + "</span>" },
    { c: "top:2.4vmin;right:2.4vmin;text-align:right",
      h: "LAT " + entero(0, 89) + "°" + hex(entero(0, 59), 2) + "′ LON " + entero(0, 179) + "°" + hex(entero(0, 59), 2) + "′\n" +
         "AZ " + entero(0, 360) + "° · <span class='hi'>H " + baseH.toFixed(0) + "</span>" },
    { c: "bottom:2.4vmin;left:2.4vmin;text-align:left",
      h: "GRID " + pasoRejilla + "PX · <span class='lo'>REV</span> " + hex(entero(0, 255), 2) + "\n" + regla(28) },
    { c: "bottom:2.4vmin;right:2.4vmin;text-align:right",
      h: "№ <span class='hi'>" + hex(entero(0, 16777215), 6) + "</span> · CAT/2y2\n" +
         "<span class='lo'>poesiasexp · canekzapata · 2026</span>" }
  ];
  hud.forEach(function (b) {
    var el = crear("div", "hud", document.body);
    el.style.cssText += ";" + b.c;
    el.innerHTML = b.h;
  });
}

/* ==================== composicion ==================== */
var banda = 7;                                     // franja reservada al hud (vmin)
var corner = elegir(["tl", "tr", "bl", "br"]);   // esquina del territorio
var vertical = quizas(.5);                         // orientacion del conector
var anclaje = vertical ? ((corner[1] === "l") ? "r" : "l") : ((corner[0] === "t") ? "b" : "t");

construirCampo();
construirTerritorio(corner);
construirConector(vertical, anclaje);
construirChrome();

/* ==================== rasgos ==================== */
window.$fxhashFeatures = {
  momento: momento,
  paleta: modo,
  "esquina territorio": { tl: "arriba-izq", tr: "arriba-der", bl: "abajo-izq", br: "abajo-der" }[corner],
  "conector": vertical ? "vertical" : "horizontal",
  "nodos": usados.conceptos.length
};

console.log("vent ::", semilla);
console.log("momento:", momento, "| paleta:", modo, "| territorio:", corner, "| conector:", vertical ? "vertical" : "horizontal");

if (typeof fxpreview === "function") setTimeout(fxpreview, 900);

document.addEventListener("click", function () { location.reload(); });
