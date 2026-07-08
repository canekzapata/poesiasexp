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
function recordarSigno(s) { if (s) { usados.signos.push(s); if (usados.signos.length > 300) usados.signos.shift(); } }

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

/* ==================== campo: lienzo generativo (a la manera de fonts) ====================
   imprime frases y conjuntos de caracteres unicode y luego los pierde: el texto
   se dibuja en un <canvas> y sus pixeles se ordenan (pixel sorting) por
   luminancia mientras se funden hacia el fondo, hasta desaparecer; entonces
   vuelve a imprimir otra tanda. la vida ya no es el pulso css sino la deriva  */

function racimo(pool, n) {                 /* con contenedores pulsantes (dom: conector) */
  var s = "";
  for (var i = 0; i < n; i++) s += quizas(.4) ? pulso(elegir(pool)) : elegir(pool);
  return s;
}
function racimoPlano(pool, n) {            /* texto plano (canvas: campo) */
  var s = ""; for (var i = 0; i < n; i++) s += elegir(pool); return s;
}

function escala() {
  var r = rand();
  if (r < 0.055) return azar(11, 18);    // gigante (psfx)
  if (r < 0.22)  return azar(6, 10);      // grande
  if (r < 0.58)  return azar(3, 5.2);     // media
  if (r < 0.86)  return azar(1.7, 2.8);   // chica
  return azar(1.0, 1.5);                  // micro
}
function escalaPx(vmin) { return vmin / 100 * Math.min(window.innerWidth, window.innerHeight); }

function cifraPlano() {
  var s = elegir(VOC.tecnica.siglas) + "·" + hex(entero(0, 4095), 3);
  return s + elegir([
    " " + entero(0, 999) + elegir(VOC.tecnica.unidades),
    " " + elegir(VOC.tecnica.signos) + " " + entero(0, 360) + "°",
    " " + azar(0, 1).toFixed(3),
    " " + elegir(VOC.tecnica.signos) + hex(entero(0, 255), 2)
  ]);
}

/* un descriptor de pieza: texto plano, fuente, tamano (px), posicion (px) y color */
function descriptorPieza(cxf, cyf, registrar) {
  var W = window.innerWidth;
  var tam = escala();
  var tipo = elegir(["frase", "frase", "fragmento", "fragmento", "palabra", "palabra",
    "mosaico", "mosaico", "cluster", "cluster", "cifra"]);
  var txt = "", fam, maxw = null;

  if (tipo === "frase") {
    tam = Math.min(tam, 5.4); fam = elegir(FUENTES_TEXTO);
    txt = elegir(VOC.frases); maxw = azar(22, 42) / 100 * W;
    if (registrar) txt.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase().replace(/[.,¡!¿?;:«»]/g, "")); });
  } else if (tipo === "fragmento") {
    fam = elegir(FUENTES_TEXTO);
    var pal = elegir(VOC.frases).split(" ").filter(function (w) { return w.length > 2; });
    var ini = entero(0, Math.max(0, pal.length - 3));
    txt = pal.slice(ini, ini + entero(2, 4)).join(" ").replace(/[.,¡!¿?;:«»]/g, "");
    maxw = 0.34 * W;
    if (registrar) txt.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase()); });
  } else if (tipo === "palabra") {
    fam = elegir(FUENTES_TEXTO); txt = elegir(VOC.palabras);
    if (registrar) recordarConcepto(txt);
  } else if (tipo === "mosaico") {
    fam = elegir(["unscii", "unifont", "symbola"]); tam = Math.min(tam, 4.5);
    var pool = elegir([TRAMA, TRAMA, CAJA, SIGNO, GEOM]);
    txt = racimoPlano(pool, entero(14, 46)); maxw = azar(10, 26) / 100 * W;
    if (registrar) for (var m = 0; m < 3; m++) recordarSigno(elegir(pool));
  } else if (tipo === "cluster") {
    fam = elegir(FUENTES_GLIFO);
    var pool2 = elegir([SIGNO, SIGNO, TRAMA, GEOM, ONDA]);
    txt = racimoPlano(pool2, entero(3, 8));
    if (registrar) recordarSigno(elegir(pool2));
  } else { // cifra
    fam = elegir(["vga", "wang", "hplx"]); tam = Math.min(tam, 2.6); txt = cifraPlano();
  }

  var esTexto = (tipo === "frase" || tipo === "fragmento" || tipo === "palabra");
  return {
    txt: txt, fam: fam, tam: escalaPx(tam),
    x: cxf * W, y: cyf * window.innerHeight, maxw: maxw,
    color: colorTexto(), rot: quizas(.14) ? elegir([-90, 90, 180]) : 0, alfa: azar(.72, 1),
    typewriter: esTexto ? quizas(.72) : quizas(.4),   // alguna parte se escribe letra a letra
    psfx: quizas(.5),                                  // ...cambiando de caracteres visuales (psfx)
    dur: entero(60, 220),                             // cuadros que tarda en escribirse (timer propio, lento)
    cadencia: entero(2, 8),                           // ritmo del cambio de caracteres (mas pausado)
    cabeza: entero(2, 6),                             // largo de la cola que va cambiando
    edad: 0,                                          // reloj propio: cada bloque vive asincrono
    holdFrames: entero(80, 300)                       // tiempo de lectura, muy variado por bloque
  };
}

function generarPiezas(registrar) {
  var lista = [], gc = entero(6, 9), gr = entero(5, 8), celdas = [];
  for (var y = 0; y < gr; y++) for (var x = 0; x < gc; x++) celdas.push([x, y]);
  celdas = barajar(celdas);
  var total = Math.min(celdas.length, entero(30, 48));   // mas piezas = mas ruido
  for (var i = 0; i < total; i++) {
    var c = celdas[i];
    var cx = Math.max(.05, Math.min(.95, (c[0] + .5) / gc + azar(-.06, .06)));
    var cy = Math.max(.06, Math.min(.94, (c[1] + .5) / gr + azar(-.06, .06)));
    lista.push(descriptorPieza(cx, cy, registrar));
  }
  lista.sort(function (a, b) { return b.tam - a.tam; });   // grandes primero
  return lista;
}

/* ---- dibujo con ajuste de linea (por palabras y, si no cabe, por caracteres) ---- */
function partirTexto(ctx, txt, maxw) {
  if (!maxw) return [txt];
  var lineas = [], cur = "";
  txt.split(" ").forEach(function (w) {
    if (ctx.measureText(w).width > maxw) {           // racimo mas ancho que el cupo: parte por caracter
      if (cur) { lineas.push(cur); cur = ""; }
      var trozo = "";
      Array.from(w).forEach(function (ch) {
        if (trozo && ctx.measureText(trozo + ch).width > maxw) { lineas.push(trozo); trozo = ch; }
        else trozo += ch;
      });
      cur = trozo;
    } else {
      var t = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(t).width > maxw) { lineas.push(cur); cur = w; }
      else cur = t;
    }
  });
  if (cur) lineas.push(cur);
  return lineas;
}

/* campo de viento turbulento con rafagas (ventisca): el "noise" de fonts.
   suma de senos en varias escalas + una rafaga global que va y viene; el
   termino +0.8 en x da un viento dominante que arrastra los pixeles */
function flujo(x, y, t) {
  var rafaga = 0.55 + 0.45 * Math.sin(t * 0.5 + Math.sin(t * 0.17));
  var vx = Math.sin(x * 0.0021 + t) + 0.6 * Math.sin(y * 0.0033 - t * 0.7 + 1.3) + 0.4 * Math.sin((x + y) * 0.006 + t * 1.9);
  var vy = 0.5 * Math.cos(x * 0.0017 - t * 0.8) + 0.4 * Math.sin(y * 0.0027 + t * 0.6) + 0.3 * Math.cos((x - y) * 0.005 - t * 1.5);
  return { x: (vx + 0.8) * rafaga, y: vy * rafaga };
}

/* hash determinista en [0,1): para que el scramble cambie a un ritmo
   controlado (cadencia), no cada cuadro */
function h3(a, b, c) { var n = (a * 73856093 ^ b * 19349663 ^ c * 83492791) >>> 0; return n / 4294967296; }

/* dibuja una pieza con escritura progresiva (typewriter), cabeza que va
   cambiando de caracteres (psfx), parpadeo y desplazamiento por el viento */
function dibujarPiezaVida(ctx, p, ox, oy, SCRAMBLE) {
  var settled = p.typewriter ? Math.min(p.total, Math.floor(p.edad * p.cps)) : p.total;
  var apAlfa = p.typewriter ? 1 : Math.min(1, p.edad / 8);       // los no-typewriter surgen con un pop
  var enHold = settled >= p.total;                               // ya escrito -> puede parpadear (psfx)
  var restante = p.activoHasta - p.edad;
  if (restante < 12) apAlfa *= Math.max(0, restante / 12);       // se atenua justo antes de soltarse al viento
  ctx.save();
  ctx.translate(p.x + ox, p.y + oy);
  if (p.rot) ctx.rotate(p.rot * Math.PI / 180);
  ctx.font = p.tam.toFixed(1) + "px '" + p.fam + "', 'unifont', 'symbola', monospace";
  ctx.fillStyle = p.color; ctx.globalAlpha = p.alfa * apAlfa;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  var anchor = -p.maxLineW / 2, lh = p.tam * 1.06, y0 = -(p.lineasCP.length - 1) / 2 * lh;
  var L = SCRAMBLE.length, bucket = Math.floor(p.edad / p.cadencia), idx = 0;
  for (var li = 0; li < p.lineasCP.length; li++) {
    var arr = p.lineasCP[li], out = "";
    for (var ci = 0; ci < arr.length; ci++) {
      if (idx < settled) {
        out += (enHold && p.psfx && h3(bucket, idx, 7) < 0.05) ? SCRAMBLE[(h3(bucket, idx, 3) * L) | 0] : arr[ci];
      } else if (p.typewriter && idx < settled + p.cabeza) {
        out += SCRAMBLE[(h3(bucket, idx, 11) * L) | 0];          // la cola cambia cada 'cadencia' cuadros
      }
      idx++;
    }
    ctx.fillText(out, anchor, y0 + li * lh);
  }
  ctx.restore();
}

/* ---- el viento se aplica ahora como retroalimentacion con drawImage por
        bandas (en iniciarLienzo): mas barato y sin getImageData ---- */
function fundir(d, rgb, alfa) {
  for (var i = 0; i < d.length; i += 4) { d[i] += (rgb[0] - d[i]) * alfa; d[i + 1] += (rgb[1] - d[i + 1]) * alfa; d[i + 2] += (rgb[2] - d[i + 2]) * alfa; }
}
function hslNumRGB(str) {
  var m = str.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/); if (!m) return [6, 10, 16];
  var h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
  function f(n) { var k = (n + h * 12) % 12, aa = s * Math.min(l, 1 - l); return l - aa * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/* ============================================================================
   campo: MOTOR DE FONTS adaptado (port de canekzapata/fonts)
   revela palabras del vocabulario de vent como "agua al rio" (varias escalas,
   colores fluidos) y luego DEFORMA los pixeles del lienzo con dos sistemas:
     · particulas que capturan regiones, les desplazan el color y las reescriben
       movidas, con colisiones (absorben / fusionan / repelen / chocan)
     · distorsiones geometricas (rectangulo, trapecio, rombo, triangulo...) con
       doble trazo y evolucion de color fluida
   sobre un fundido lentisimo: el texto nuevo se imprime SOBRE los restos
   deformados y estos tardan en desaparecer. color y choques vienen de fonts;
   vocabulario y fuentes son los de vent.
   ============================================================================ */
var cv, ctx, cw, ch, campoCorriendo = false;
var particles = [], distortions = [], textRevealQueue = [];
var frameCount = 0, lastRevealTime = 0, lastTextRedraw = 0, nextRedrawTime = 8000;
var lastCollisionCheck = 0, collisionCheckInterval = 100;
var REVEAL_INTERVAL_MS = 35;
function random(n) { return Math.floor(Math.random() * n); }

/* ---- color fluido recursivo (fonts) ---- */
class RecursiveColorGenerator {
  constructor() {
    this.colorSeeds = [
      { h: Math.random() * 360, s: 60 + Math.random() * 40, l: 50 + Math.random() * 30 },
      { h: Math.random() * 360, s: 60 + Math.random() * 40, l: 50 + Math.random() * 30 },
      { h: Math.random() * 360, s: 60 + Math.random() * 40, l: 50 + Math.random() * 30 }
    ];
  }
  generateRecursiveColor(depth = 0, baseIndex = null) {
    if (depth > 4) { var b = this.colorSeeds[random(this.colorSeeds.length)]; return "hsl(" + Math.round(b.h) + "," + Math.round(b.s) + "%," + Math.round(b.l) + "%)"; }
    var pi = baseIndex !== null ? Math.max(0, Math.min(baseIndex, this.colorSeeds.length - 1)) : random(this.colorSeeds.length);
    var pc = this.colorSeeds[pi], v = 40 - depth * 8;
    var nc = {
      h: (pc.h + (Math.random() - 0.5) * v) % 360,
      s: Math.max(20, Math.min(100, pc.s + (Math.random() - 0.5) * v)),
      l: Math.max(20, Math.min(80, pc.l + (Math.random() - 0.5) * v))
    };
    if (Math.random() > 0.7 && depth < 3) return this.generateRecursiveColor(depth + 1, pi);
    return "hsl(" + Math.round(nc.h) + "," + Math.round(nc.s) + "%," + Math.round(nc.l) + "%)";
  }
  generateFluidShadowColor(base, intensity) {
    var m = base.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (m) {
      var h = +m[1], s = +m[2], l = +m[3];
      return "hsl(" + Math.round((h + 120 + (Math.random() - 0.5) * 60) % 360) + "," +
        Math.round(Math.max(30, Math.min(100, s + (Math.random() - 0.5) * 40))) + "%," +
        Math.round(Math.max(10, Math.min(60, l - 20 + (Math.random() - 0.5) * 30))) + "%)";
    }
    return "hsl(" + Math.round(Math.random() * 360) + "," + Math.round(60 + Math.random() * 40) + "%," + Math.round(30 + Math.random() * 30) + "%)";
  }
  evolveColorSeeds() {
    this.colorSeeds = this.colorSeeds.map(function (c) {
      return { h: (c.h + (Math.random() - 0.5) * 15) % 360, s: Math.max(20, Math.min(100, c.s + (Math.random() - 0.5) * 8)), l: Math.max(20, Math.min(80, c.l + (Math.random() - 0.5) * 8)) };
    });
  }
}
var fluidColorGenerator = new RecursiveColorGenerator();
function getFluidShadowColor(base) { return fluidColorGenerator.generateFluidShadowColor(base, Math.random() * 0.5 + 0.5); }

/* ---- texto: sale del vocabulario de vent; fuente segun sea latino o glifo ---- */
function textoReveal(registrar) {
  var r = Math.random(), t;
  if (r < 0.28) {                                   // frase entera
    t = elegir(VOC.frases);
    if (registrar) t.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase().replace(/[.,¡!¿?;:«»]/g, "")); });
  } else if (r < 0.46) {                            // parrafo recortado (fragmento)
    var pal = elegir(VOC.frases).split(" ").filter(function (w) { return w.length > 1; });
    var ini = entero(0, Math.max(0, pal.length - 4));
    t = pal.slice(ini, ini + entero(2, 5)).join(" ").replace(/[.,¡!¿?;:«»]/g, "");
    if (registrar) t.split(" ").forEach(function (w) { if (w.length > 3) recordarConcepto(w.toLowerCase()); });
  } else if (r < 0.58) {                            // palabra suelta
    t = elegir(VOC.palabras); if (registrar) recordarConcepto(t);
  } else if (r < 0.68) {                            // lectura tecnica
    t = cifraPlano();
  } else {                                          // mas caracteres: racimo de glifos mezclados
    var pools = barajar([TRAMA, SIGNO, GEOM, CAJA, ONDA]);
    var n = entero(4, 16), s = "";
    for (var i = 0; i < n; i++) s += (Math.random() < 0.14 ? " " : elegir(pools[i % 2]));
    t = s.trim();
    if (registrar) recordarSigno(elegir(pools[0]));
  }
  return t;
}
function fuentePara(txt) { return /[a-zA-Z]/.test(txt) ? elegir(FUENTES_TEXTO) : elegir(FUENTES_GLIFO); }
function sembrarTokens() { for (var i = 0; i < 40; i++) textoReveal(true); }   // pobla usados para el conector

/* ---- reveal progresivo ("agua al rio") ---- */
function buildTextRevealQueue() {
  textRevealQueue = [];
  fluidColorGenerator.evolveColorSeeds();
  var esc = Math.min(cw, ch) / 1000;
  var clusters = [
    { count: 1, minSize: 84 * esc, maxSize: 140 * esc },   // sectores mas chiquitos
    { count: 4, minSize: 42 * esc, maxSize: 80 * esc },
    { count: 7, minSize: 20 * esc, maxSize: 42 * esc },
    { count: 11, minSize: 9 * esc, maxSize: 20 * esc },
    { count: 6, minSize: 5 * esc, maxSize: 9 * esc }
  ];
  var instanceIndex = 0;
  clusters.forEach(function (cluster) {
    for (var c = 0; c < cluster.count; c++, instanceIndex++) {
      var text = (textoReveal(false) || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
      if (!text) continue;
      var fontSize = Math.round(cluster.minSize + Math.random() * (cluster.maxSize - cluster.minSize));
      var fontFamily = fuentePara(text);
      var angle = elegir([0, 0, 0, 0, 0, 90, 270, 180]) * Math.PI / 180;    // a veces vertical / invertido
      var gridCols = 4, gridRows = 4, cellW = cw / gridCols, cellH = ch / gridRows;
      var cellIdx = instanceIndex % (gridCols * gridRows);
      var gridCol = cellIdx % gridCols, gridRow = Math.floor(cellIdx / gridCols);
      var ox = gridCol * cellW + (Math.random() - 0.1) * cellW;
      var oy = gridRow * cellH + (Math.random() * 0.7 + 0.1) * cellH + fontSize;
      var maxLocal = (angle === 0 || angle === Math.PI ? cw : ch) * (0.35 + Math.random() * 0.5);  // parrafo recortado
      ctx.font = fontSize + "px '" + fontFamily + "', 'unifont', 'symbola', monospace";
      var tokens = text.split(/(\n)/).flatMap(function (part) { return part === "\n" ? ["\n"] : part.split(/\s+/).filter(function (w) { return w.length > 0; }); });
      var lx = 0, ly = 0;
      tokens.forEach(function (token) {
        if (token === "\n") { lx = 0; ly += fontSize * 1.35; return; }
        var wordW = ctx.measureText(token + " ").width;
        if (lx + wordW > maxLocal && lx > 0) { lx = 0; ly += fontSize * 1.35; }
        textRevealQueue.push({ word: token, ox: ox, oy: oy, lx: lx, ly: ly, angle: angle, fontSize: fontSize, fontFamily: fontFamily, textColor: fluidColorGenerator.generateRecursiveColor(0) });
        lx += wordW;
      });
    }
  });
  for (var i = textRevealQueue.length - 1; i > 0; i--) { var j = random(i + 1); var tmp = textRevealQueue[i]; textRevealQueue[i] = textRevealQueue[j]; textRevealQueue[j] = tmp; }
}
function revealNextWord() {
  if (textRevealQueue.length === 0) return;
  var cell = textRevealQueue.shift();
  ctx.save();
  ctx.translate(cell.ox, cell.oy);
  if (cell.angle) ctx.rotate(cell.angle);                 // texto en vertical / invertido
  ctx.font = cell.fontSize + "px '" + cell.fontFamily + "', 'unifont', 'symbola', monospace";
  if (Math.random() > 0.7) {
    ctx.fillStyle = getFluidShadowColor(cell.textColor); ctx.globalAlpha = 0.45;
    ctx.fillText(cell.word, cell.lx + (Math.random() - 0.5) * 3, cell.ly + (Math.random() - 0.5) * 3);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = cell.textColor;
  ctx.fillText(cell.word, cell.lx, cell.ly);
  ctx.restore();
}

/* ---- colisiones (fonts) ---- */
function detectCollision(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy) < Math.max(a.width, b.width) * 0.93; }
var CollisionBehaviors = { SURVIVE_BOTH: 0, ABSORB: 1, MERGE: 2, DESTROY_BOTH: 3, REPEL: 4, PHASE_THROUGH: 5 };
function decideCollisionBehavior(p1, p2) {
  var sd = Math.abs(p1.width - p2.width), e1 = p1.speed * p1.width, e2 = p2.speed * p2.width, r = Math.random();
  if (sd > 50) { if (r < 0.4) return 1; if (r < 0.7) return 5; return 0; }
  if (Math.abs(e1 - e2) < 100) { if (r < 0.25) return 2; if (r < 0.45) return 4; if (r < 0.65) return 0; if (r < 0.85) return 5; return 3; }
  if (e1 > e2 * 2 || e2 > e1 * 2) { if (r < 0.5) return 1; if (r < 0.8) return 0; return 4; }
  if (r < 0.3) return 0; if (r < 0.5) return 4; if (r < 0.7) return 5; if (r < 0.85) return 2; return 1;
}
function executeCollisionBehavior(behavior, p1, p2) {
  switch (behavior) {
    case 0:
      p1.direction.x += (Math.random() - 0.5) * 0.5; p1.direction.y += (Math.random() - 0.5) * 0.5;
      p2.direction.x += (Math.random() - 0.5) * 0.5; p2.direction.y += (Math.random() - 0.5) * 0.5; break;
    case 1:
      if (p1.width >= p2.width) { p1.width += p2.width * 0.3; p1.height += p2.height * 0.3; p1.speed += p2.speed * 0.1; p2.toDelete = true; }
      else { p2.width += p1.width * 0.3; p2.height += p1.height * 0.3; p2.speed += p1.speed * 0.1; p1.toDelete = true; } break;
    case 2: {
      particles.push(new SequencedTextParticle({
        x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, width: (p1.width + p2.width) / 2, height: (p1.height + p2.height) / 2,
        direction: { x: (p1.direction.x + p2.direction.x) / 2, y: (p1.direction.y + p2.direction.y) / 2 },
        arc: { x: (p1.arc.x + p2.arc.x) / 2, y: (p1.arc.y + p2.arc.y) / 2 },
        speed: (p1.speed + p2.speed) / 2, maxDistance: (p1.maxDistance + p2.maxDistance) / 2,
        colorShift: { r: (p1.colorShift.r + p2.colorShift.r) / 2, g: (p1.colorShift.g + p2.colorShift.g) / 2, b: (p1.colorShift.b + p2.colorShift.b) / 2 }
      }));
      p1.toDelete = true; p2.toDelete = true; break;
    }
    case 3:
      p1.toDelete = true; p2.toDelete = true;
      for (var i = 0; i < 3; i++) particles.push(new SequencedTextParticle({
        x: p1.x + (Math.random() - 0.5) * 50, y: p1.y + (Math.random() - 0.5) * 50, width: 20 + Math.random() * 20, height: 20 + Math.random() * 20,
        direction: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }, arc: { x: (Math.random() - 0.9) * 0.1, y: (Math.random() - 0.7) * 0.1 },
        speed: 0.5 + Math.random() * 0.5, maxDistance: 50 + Math.random() * 120,
        colorShift: { r: Math.random() * 100 - 50, g: Math.random() * 100 - 50, b: Math.random() * 100 - 50 }
      })); break;
    case 4: {
      var dx = p2.x - p1.x, dy = p2.y - p1.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      p1.direction.x -= dx / d; p1.direction.y -= dy / d; p2.direction.x += dx / d; p2.direction.y += dy / d; break;
    }
    case 5:
      p1.colorShift.r += (Math.random() - 0.5) * 20; p1.colorShift.g += (Math.random() - 0.5) * 20; p1.colorShift.b += (Math.random() - 0.5) * 20;
      p2.colorShift.r += (Math.random() - 0.5) * 20; p2.colorShift.g += (Math.random() - 0.5) * 20; p2.colorShift.b += (Math.random() - 0.5) * 20; break;
  }
}

/* ---- particula que captura, desplaza color y reescribe movida ---- */
class SequencedTextParticle {
  constructor(o) { Object.assign(this, o); this.done = false; this.distance = 0; this.params = {}; Object.assign(this.params, o); this.trail = []; this.toDelete = false; this.collisionCooldown = 0; }
  reset() {
    Object.assign(this, this.params);
    var intensity = 80 + Math.random() * 100;
    this.colorShift = { r: (Math.random() - 0.5) * 2 * intensity, g: (Math.random() - 0.5) * 2 * intensity, b: (Math.random() - 0.5) * 2 * intensity };
    this.direction = { x: (Math.random() - 0.5) * 1.8, y: (Math.random() - 0.5) * 1.8 };
    this.arc = { x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.08 };
    this.maxDistance = 300 + Math.floor(Math.random() * 3000);
    this.done = false; this.distance = 0; this.trail = []; this.toDelete = false; this.collisionCooldown = 0;
    this.x = random(cw); this.y = random(ch);
  }
  draw() {
    if (this.done || this.toDelete) { if (!this.toDelete) this.reset(); return; }
    if (this.collisionCooldown > 0) this.collisionCooldown--;
    var sx0 = Math.floor(this.x), sy0 = Math.floor(this.y);
    var captureWidth = Math.floor(Math.min(this.width, cw - sx0)), captureHeight = Math.floor(Math.min(this.height, ch - sy0));
    if (captureWidth >= 1 && captureHeight >= 1 && sx0 >= 0 && sy0 >= 0) {
      var imageData = ctx.getImageData(sx0, sy0, captureWidth, captureHeight), data = imageData.data;
      for (var i = 0; i < data.length; i += 4) {
        var isNearBlack = data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15;
        if (isNearBlack) {
          if (Math.random() > 0.992) { data[i] = Math.min(255, Math.abs(this.colorShift.r)); data[i + 1] = Math.min(255, Math.abs(this.colorShift.g)); data[i + 2] = Math.min(255, Math.abs(this.colorShift.b)); }   // casi no tocar el vacio
        } else if (Math.random() > 0.45) {                                                    // deforma sobre todo el texto
          data[i] = Math.min(255, Math.max(0, data[i] + this.colorShift.r)); data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + this.colorShift.g)); data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + this.colorShift.b));
          if (Math.random() > 0.93) { data[i] = random(255); data[i + 1] = random(255); data[i + 2] = random(255); }
        }
      }
      var newX = sx0 + this.direction.x, newY = sy0 + this.direction.y;
      if (newX < 0) newX = cw + newX; if (newX >= cw) newX = newX - cw;
      if (newY < 0) newY = ch + newY; if (newY >= ch) newY = newY - ch;
      ctx.putImageData(imageData, newX, newY);
    }
    this.x += this.direction.x * this.speed; this.y += this.direction.y * this.speed;
    this.direction.x += this.arc.x; this.direction.y += this.arc.y;
    if (Math.random() > 0.78) { this.direction.x += (Math.random() - 0.5) * 0.5; this.direction.y += (Math.random() - 0.5) * 0.5; }
    this.direction.x = Math.max(-2.5, Math.min(2.5, this.direction.x)); this.direction.y = Math.max(-2.5, Math.min(2.5, this.direction.y));
    var edgeM = 60;
    if (this.x < edgeM) this.direction.x += 0.06;
    if (this.x > cw - edgeM - this.width) this.direction.x -= 0.06;
    if (this.y < edgeM) this.direction.y += 0.06;
    if (this.y > ch - edgeM - this.height) this.direction.y -= 0.06;
    if (Math.random() > 0.95) { var af = Math.min(1, this.distance / (this.maxDistance || 1200)); var drift = (Math.random() - 0.35) * 14 * (1 + af); this.colorShift.r = Math.max(-180, Math.min(180, this.colorShift.r + drift)); this.colorShift.g = Math.max(-180, Math.min(180, this.colorShift.g + drift)); this.colorShift.b = Math.max(-180, Math.min(180, this.colorShift.b + drift)); }
    this.distance++; if (this.distance > this.maxDistance) this.done = true;
  }
}

/* ---- distorsion geometrica con doble trazo y color fluido (fonts) ---- */
class SequencedPixelDistortion {
  constructor(o) {
    Object.assign(this, o); this.params = {}; Object.assign(this.params, o); this.toDelete = false;
    this.lifespan = 1400 + Math.random() * 600; this.age = 0;
    this.sizeChangeType = this.chooseSizeChangeType(); this.sizeChangeSpeed = 0.5 + Math.random() * 1.5; this.sizeChangeIntensity = 0.1 + Math.random() * 0.4;
    this.originalWidth = this.width; this.originalHeight = this.height;
    this.geometryTypes = ["rectangle", "trapezoid", "parallelogram", "rhombus", "irregular", "triangle", "pentagon"];
    this.geometryType = this.geometryTypes[random(this.geometryTypes.length)];
    this.shapeParameters = this.generateShapeParameters();
    this.arc = { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 };
    this.secondStroke = { x: this.x + (Math.random() - 0.5) * 100, y: this.y + (Math.random() - 0.5) * 100, change: { x: this.change.x + (Math.random() - 0.5) * 0.8, y: this.change.y + (Math.random() - 0.5) * 0.8 }, arc: { x: (Math.random() - 0.5) * 0.12, y: (Math.random() - 0.5) * 0.12 } };
    this.arcIntensity = 0.3 + Math.random() * 0.4; this.arcFrequency = 0.02 + Math.random() * 0.05;
    this.fluidColorSeed = Math.random() * 360; this.colorEvolutionSpeed = 0.01 + Math.random() * 0.02;
  }
  generateShapeParameters() {
    switch (this.geometryType) {
      case "trapezoid": return { topWidth: this.width * (0.6 + Math.random() * 0.4), bottomWidth: this.width * (0.8 + Math.random() * 0.4), skew: (Math.random() - 0.5) * 0.3 };
      case "parallelogram": return { skewX: (Math.random() - 0.5) * 0.5, skewY: (Math.random() - 0.5) * 0.3 };
      case "rhombus": return { angle: Math.random() * Math.PI * 2, ratio: 0.6 + Math.random() * 0.8 };
      case "irregular": return { vertices: this.generateIrregularVertices(), distortion: 0.2 + Math.random() * 0.6 };
      case "triangle": return { type: random(3), rotation: Math.random() * Math.PI * 2 };
      case "pentagon": return { irregularity: 0.3 + Math.random() * 0.4, rotation: Math.random() * Math.PI * 2 };
      default: return {};
    }
  }
  chooseSizeChangeType() { var t = ["stable", "pulse", "grow", "shrink", "oscillate", "random_jump", "wave", "spiral"]; return t[random(t.length)]; }
  updateSize() {
    switch (this.sizeChangeType) {
      case "pulse": { var m = 1 + Math.sin(this.age * this.sizeChangeSpeed * 0.1) * this.sizeChangeIntensity; this.width = this.originalWidth * m; this.height = this.originalHeight * m; break; }
      case "grow": { var g = 1 + this.age * 0.001 * this.sizeChangeSpeed; this.width = Math.min(this.originalWidth * g, this.originalWidth * 2); this.height = Math.min(this.originalHeight * g, this.originalHeight * 2); break; }
      case "shrink": { var s = Math.max(0.3, 1 - this.age * 0.001 * this.sizeChangeSpeed); this.width = this.originalWidth * s; this.height = this.originalHeight * s; break; }
      case "oscillate": { this.width = this.originalWidth * (1 + Math.sin(this.age * this.sizeChangeSpeed * 0.08) * this.sizeChangeIntensity); this.height = this.originalHeight * (1 + Math.cos(this.age * this.sizeChangeSpeed * 0.12) * this.sizeChangeIntensity); break; }
      case "random_jump": { if (Math.random() > 0.98) { this.width = this.originalWidth * (0.5 + Math.random() * 1.5); this.height = this.originalHeight * (0.5 + Math.random() * 1.5); } break; }
      case "wave": { this.width = this.originalWidth * (1 + Math.sin(this.age * 0.05 + this.x * 0.01) * this.sizeChangeIntensity); this.height = this.originalHeight * (1 + Math.cos(this.age * 0.07 + this.y * 0.01) * this.sizeChangeIntensity); break; }
      case "spiral": { var a = this.age * 0.02, rad = 1 + Math.sin(a) * this.sizeChangeIntensity, sx = 1 + Math.cos(a * 1.3) * this.sizeChangeIntensity * 0.5; this.width = this.originalWidth * rad * sx; this.height = this.originalHeight * rad; break; }
    }
    this.width = Math.max(10, Math.min(300, this.width)); this.height = Math.max(10, Math.min(300, this.height));
  }
  generateIrregularVertices() { var n = 4 + random(4), v = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, r = 0.5 + Math.random() * 0.5; v.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); } return v; }
  getCaptureRegion(x, y, w, h) {
    switch (this.geometryType) {
      case "trapezoid": return this.getTrapezoidRegion(x, y, w, h);
      case "parallelogram": return this.getParallelogramRegion(x, y, w, h);
      case "rhombus": return this.getRhombusRegion(x, y, w, h);
      case "irregular": return this.getIrregularRegion(x, y, w, h);
      case "triangle": return this.getTriangleRegion(x, y, w, h);
      case "pentagon": return this.getPentagonRegion(x, y, w, h);
      default: return [{ x: Math.max(0, Math.min(x, cw - w)), y: Math.max(0, Math.min(y, ch - h)), width: Math.min(w, cw - x), height: Math.min(h, ch - y) }];
    }
  }
  getTrapezoidRegion(x, y, w, h) { var p = this.shapeParameters, out = []; for (var i = 0; i < 8; i++) { var ra = i / 8, sw = p.topWidth + (p.bottomWidth - p.topWidth) * ra, sx = x + (w - sw) / 2 + p.skew * ra * w, sy = y + h / 8 * i, sh = h / 8; if (sx >= 0 && sy >= 0 && sx + sw <= cw && sy + sh <= ch) out.push({ x: sx, y: sy, width: sw, height: sh }); } return out; }
  getParallelogramRegion(x, y, w, h) { var p = this.shapeParameters, out = []; for (var i = 0; i < 6; i++) { var ra = i / 6, sx = x + p.skewX * ra * w, sy = y + p.skewY * ra * h + h / 6 * i, sw = w / 6, sh = h / 6; if (sx >= 0 && sy >= 0 && sx + sw <= cw && sy + sh <= ch) out.push({ x: sx, y: sy, width: sw, height: sh }); } return out; }
  getRhombusRegion(x, y, w, h) { var p = this.shapeParameters, ccx = x + w / 2, ccy = y + h / 2, out = []; for (var r = 0; r < 5; r++) { var ra = (r + 1) / 5, rw = w * ra * 0.7, rh = h * ra * p.ratio, rx = ccx - rw / 2, ry = ccy - rh / 2; if (rx >= 0 && ry >= 0 && rx + rw <= cw && ry + rh <= ch) out.push({ x: rx, y: ry, width: rw, height: rh }); } return out; }
  getIrregularRegion(x, y, w, h) { var p = this.shapeParameters, ccx = x + w / 2, ccy = y + h / 2, out = [], gs = 8; for (var gx = 0; gx < gs; gx++) for (var gy = 0; gy < gs; gy++) { var lx = (gx / gs - 0.5) * 2, ly = (gy / gs - 0.5) * 2; if (this.pointInIrregularShape(lx, ly, p.vertices)) { var rx = ccx + lx * w / 2, ry = ccy + ly * h / 2, rw = w / gs, rh = h / gs; if (rx >= 0 && ry >= 0 && rx + rw <= cw && ry + rh <= ch) out.push({ x: rx, y: ry, width: rw, height: rh }); } } return out; }
  getTriangleRegion(x, y, w, h) { var p = this.shapeParameters, out = []; for (var i = 0; i < 6; i++) { var ra = i / 6, sw, sx; if (p.type === 0) { sw = w * (1 - ra); sx = x + (w - sw) / 2; } else if (p.type === 1) { sw = w * (1 - ra * 0.8); sx = x + (w - sw) / 2; } else { sw = w * (1 - ra * (0.6 + Math.random() * 0.4)); sx = x + (Math.random() - 0.3) * w * 0.3; } var sy = y + h / 6 * i, sh = h / 6; if (sx >= 0 && sy >= 0 && sx + sw <= cw && sy + sh <= ch) out.push({ x: sx, y: sy, width: sw, height: sh }); } return out; }
  getPentagonRegion(x, y, w, h) { var p = this.shapeParameters, ccx = x + w / 2, ccy = y + h / 2, out = []; for (var i = 0; i < 5; i++) { var a = i / 5 * Math.PI * 2 + p.rotation, rad = (w + h) / 4 * (1 + (Math.random() - 0.5) * p.irregularity), px = ccx + Math.cos(a) * rad, py = ccy + Math.sin(a) * rad, rs = Math.min(w, h) / 6, rx = px - rs / 2, ry = py - rs / 2; if (rx >= 0 && ry >= 0 && rx + rs <= cw && ry + rs <= ch) out.push({ x: rx, y: ry, width: rs, height: rs }); } return out; }
  pointInIrregularShape(x, y, v) { var inside = false, n = v.length; for (var i = 0, j = n - 1; i < n; j = i++) { if (((v[i].y > y) !== (v[j].y > y)) && (x < (v[j].x - v[i].x) * (y - v[i].y) / (v[j].y - v[i].y) + v[i].x)) inside = !inside; } return inside; }
  reset() {
    Object.assign(this, this.params); this.x = random(cw); this.y = random(ch); this.toDelete = false; this.age = 0;
    this.geometryType = this.geometryTypes[random(this.geometryTypes.length)]; this.shapeParameters = this.generateShapeParameters();
    this.arc = { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 };
    this.secondStroke = { x: this.x + (Math.random() - 0.5) * 100, y: this.y + (Math.random() - 0.5) * 100, change: { x: this.change.x + (Math.random() - 0.5) * 0.8, y: this.change.y + (Math.random() - 0.5) * 0.8 }, arc: { x: (Math.random() - 0.9) * 0.12, y: (Math.random() - 0.9) * 0.12 } };
    this.arcIntensity = 0.8 + Math.random() * 0.4; this.arcFrequency = 0.02 + Math.random() * 0.05;
  }
  applyFluidColorEffects(imageData) {
    var data = imageData.data; this.fluidColorSeed += this.colorEvolutionSpeed; if (this.fluidColorSeed > 360) this.fluidColorSeed -= 360;
    var fh = this.fluidColorSeed;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) continue;   // solo el texto, no el vacio
      if (Math.random() > 0.7) {
        var ci = Math.sin(this.age * 0.03 + i * 0.0001) * 25;
        data[i] = Math.min(255, Math.max(0, data[i] + Math.sin(fh * Math.PI / 180) * ci));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + Math.sin((fh + 120) * Math.PI / 180) * ci));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + Math.sin((fh + 240) * Math.PI / 180) * ci));
      }
    }
  }
  applyShapeSpecificEffects(imageData) {
    var data = imageData.data, a = this.age;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) continue;   // no tocar el vacio: deformar el texto
      if (Math.random() > 0.5) continue;
      var s;
      switch (this.geometryType) {
        case "trapezoid": s = Math.sin(a * 0.02) * 40; data[i] += s; data[i + 1] -= s * 0.5; data[i + 2] += s * 0.4; break;
        case "parallelogram": s = Math.cos(a * 0.03) * 35; data[i] += s; data[i + 1] += s * 0.6; data[i + 2] -= s * 0.3; break;
        case "rhombus": { var an = a * 0.015, r = data[i], g = data[i + 1], b = data[i + 2]; data[i] = r * Math.cos(an) - g * Math.sin(an); data[i + 1] = r * Math.sin(an) + g * Math.cos(an); data[i + 2] = b + Math.sin(an) * 25; break; }
        case "irregular": s = (Math.random() - 0.5) * 80; data[i] += s; data[i + 1] += s * 0.7; data[i + 2] += s * 1.3; break;
        case "triangle": s = Math.sin(a * 0.04 + i * 0.001) * 50; data[i] += s; data[i + 2] -= s * 0.6; break;
        case "pentagon": s = Math.sin(a * 0.25) * 45; data[i + 1] += s; data[i + 2] += s * 0.6; break;
        default: data[i] += (Math.random() - 0.5) * 50; data[i + 1] += (Math.random() - 0.5) * 50; data[i + 2] += (Math.random() - 0.5) * 50;
      }
      data[i] = Math.min(255, Math.max(0, data[i])); data[i + 1] = Math.min(255, Math.max(0, data[i + 1])); data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
    }
  }
  drawIrregularStroke(x, y, w, h, change) {
    var self = this;
    this.getCaptureRegion(x, y, w, h).forEach(function (region) {
      var rx = Math.max(0, Math.floor(region.x)), ry = Math.max(0, Math.floor(region.y));
      var rw = Math.floor(region.width), rh = Math.floor(region.height);
      if (rx + rw > cw) rw = cw - rx; if (ry + rh > ch) rh = ch - ry;
      if (rw < 1 || rh < 1) return;
      var imageData = ctx.getImageData(rx, ry, rw, rh);
      var newX = rx + change.x, newY = ry + change.y;
      if (newX < 0) newX = cw + newX; if (newX >= cw) newX = newX - cw;
      if (newY < 0) newY = ch + newY; if (newY >= ch) newY = newY - ch;
      self.applyShapeSpecificEffects(imageData); self.applyFluidColorEffects(imageData);
      ctx.putImageData(imageData, newX, newY);
    });
  }
  draw() {
    if (this.toDelete) return;
    this.age++; if (this.age > this.lifespan) { this.toDelete = true; return; }
    this.updateSize(); if (this.width < 1) this.width = 60; if (this.height < 1) this.height = 60;
    this.drawIrregularStroke(this.x, this.y, this.width, this.height, this.change);
    this.drawIrregularStroke(this.secondStroke.x, this.secondStroke.y, this.width * 0.7, this.height * 0.7, this.secondStroke.change);
    this.x += this.change.x; this.y += this.change.y; this.change.x += this.arc.x * this.arcIntensity; this.change.y += this.arc.y * this.arcIntensity;
    this.change.x = Math.max(-6, Math.min(6, this.change.x)); this.change.y = Math.max(-6, Math.min(6, this.change.y));
    if (this.x > cw + this.width) this.x = -this.width; if (this.x < -this.width) this.x = cw; if (this.y > ch + this.height) this.y = -this.height; if (this.y < -this.height) this.y = ch;
    this.secondStroke.x += this.secondStroke.change.x; this.secondStroke.y += this.secondStroke.change.y;
    this.secondStroke.change.x += this.secondStroke.arc.x * this.arcIntensity; this.secondStroke.change.y += this.secondStroke.arc.y * this.arcIntensity;
    this.secondStroke.change.x = Math.max(-6, Math.min(6, this.secondStroke.change.x)); this.secondStroke.change.y = Math.max(-6, Math.min(6, this.secondStroke.change.y));
    if (this.secondStroke.x > cw + this.width) this.secondStroke.x = -this.width; if (this.secondStroke.x < -this.width) this.secondStroke.x = cw; if (this.secondStroke.y > ch + this.height) this.secondStroke.y = -this.height; if (this.secondStroke.y < -this.height) this.secondStroke.y = ch;
    if (Math.random() > 0.85) {
      this.arc.x += (Math.random() - 0.5) * 0.1; this.arc.y += (Math.random() - 0.5) * 0.1;
      this.secondStroke.arc.x += (Math.random() - 0.5) * 0.08; this.secondStroke.arc.y += (Math.random() - 0.5) * 0.08;
      if (Math.random() > 0.95) { this.geometryType = this.geometryTypes[random(this.geometryTypes.length)]; this.shapeParameters = this.generateShapeParameters(); }
      if (Math.random() > 0.7) { this.change.x += (Math.random() - 0.5) * 0.5; this.change.y += (Math.random() - 0.5) * 0.5; this.secondStroke.change.x += (Math.random() - 0.5) * 0.4; this.secondStroke.change.y += (Math.random() - 0.5) * 0.4; }
    }
    this.arcIntensity = 0.3 + Math.sin(this.age * this.arcFrequency) * 0.3;
    this.arc.x = Math.max(-0.3, Math.min(0.3, this.arc.x)); this.arc.y = Math.max(-0.3, Math.min(0.3, this.arc.y));
    this.secondStroke.arc.x = Math.max(-0.25, Math.min(0.25, this.secondStroke.arc.x)); this.secondStroke.arc.y = Math.max(-0.25, Math.min(0.25, this.secondStroke.arc.y));
  }
}

/* ---- mantenimiento (fonts) ---- */
function processCollisions() {
  var a = particles.filter(function (p) { return !p.toDelete && !p.done; });
  for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) {
    if (a[i].collisionCooldown === 0 && a[j].collisionCooldown === 0 && detectCollision(a[i], a[j])) {
      executeCollisionBehavior(decideCollisionBehavior(a[i], a[j]), a[i], a[j]); a[i].collisionCooldown = 10; a[j].collisionCooldown = 10;
    }
  }
}
function cleanupParticles() { particles = particles.filter(function (p) { return !p.toDelete; }); distortions = distortions.filter(function (d) { return !d.toDelete; }); }
function nuevaParticula(sp) { return new SequencedTextParticle({ x: random(cw), y: random(ch), width: random(64) + 20, height: random(64) + 20, direction: { x: (random(3) - 1) * sp, y: (random(3) - 1) * sp }, arc: { x: (random(3) - 1) * 0.06, y: (random(3) - 1) * 0.06 }, speed: 0.0002 + Math.random() * 0.28, maxDistance: 300 + Math.floor(Math.random() * 3000), colorShift: { r: random(150) - 75, g: random(150) - 75, b: random(150) - 75 } }); }
function nuevaDistorsion(m) { return new SequencedPixelDistortion({ x: random(cw), y: random(ch), width: random(70) + 22, height: random(70) + 22, change: { x: (random(3) - 1) * m, y: (random(3) - 1) * m } }); }
function regenerateParticles() { var n = 6 + random(8); for (var i = 0; i < n; i++) particles.push(nuevaParticula(0.5)); }
function regenerateDistortions() { var n = 4 + random(6); for (var i = 0; i < n; i++) distortions.push(nuevaDistorsion(1.6)); }
function renewMovementRules() {
  particles.forEach(function (p) { if (!p.toDelete && Math.random() > 0.6) { p.direction.x += (Math.random() - 0.5) * 0.5; p.direction.y += (Math.random() - 0.5) * 0.5; p.arc.x += (Math.random() - 0.7) * 0.505; p.arc.y += (Math.random() - 0.7) * 0.505; } });
  distortions.forEach(function (d) { if (!d.toDelete && Math.random() > 0.4) { d.change.x += (Math.random() - 0.5) * 0.5; d.change.y += (Math.random() - 0.5) * 0.5; } });
  if (Math.random() > 0.85) { var c = random(6) + 4; for (var i = 0; i < c; i++) distortions.push(nuevaDistorsion(2.5)); }
}
function maintainSystemHealth() {
  if (particles.filter(function (p) { return !p.toDelete && !p.done; }).length < 14) regenerateParticles();
  if (distortions.filter(function (d) { return !d.toDelete; }).length < 10) regenerateDistortions();
}

function animate() {
  if (!campoCorriendo) return;
  requestAnimationFrame(animate);
  frameCount++;
  ctx.fillStyle = "rgba(0,0,0,0.01)"; ctx.fillRect(0, 0, cw, ch);        // fundido lento: el texto queda mas tiempo

  /* SISTEMA DE EROSION (fonts): deforma lo que ya hay, a su propio ritmo lento */
  if (Date.now() - lastCollisionCheck > collisionCheckInterval) { processCollisions(); lastCollisionCheck = Date.now(); }
  if (frameCount % 2 === 0) { particles.forEach(function (p) { p.draw(); }); }      // erosion a menor ritmo
  if (particles.length > 160) particles = particles.filter(function (p) { return !p.toDelete; }).slice(-80);
  distortions.forEach(function (d) { if (Math.random() > 0.65) d.draw(); });         // pocas distorsiones por cuadro
  if (distortions.length > 40) distortions = distortions.filter(function (d) { return !d.toDelete; }).slice(-50);

  /* SISTEMA DE ESCRITURA (los bots): escribe ENCIMA, independiente y continuo,
     asi lo recien escrito se lee y luego la erosion lo va comiendo */
  if (Date.now() - lastRevealTime > REVEAL_INTERVAL_MS) {
    if (textRevealQueue.length === 0) buildTextRevealQueue();          // repone: el texto no para de salir
    var burst = 3 + random(4); for (var w = 0; w < burst; w++) revealNextWord();
    lastRevealTime = Date.now();
  }
  if (Date.now() - lastTextRedraw > nextRedrawTime) { buildTextRevealQueue(); lastTextRedraw = Date.now(); if (Math.random() < 0.4) renewMovementRules(); nextRedrawTime = (4 + Math.random() * 5) * 1000; }

  if (frameCount % 20 === 0) { cleanupParticles(); maintainSystemHealth(); }
  if (Math.random() > 0.995) distortions.push(nuevaDistorsion(1.8));
  if (frameCount % 1800 === 0) { if (Math.random() < 0.4) regenerateParticles(); }
}

function iniciarLienzo() {
  cv = document.createElement("canvas"); cv.id = "lienzo";
  escena.insertBefore(cv, escena.firstChild);
  ctx = cv.getContext("2d", { willReadFrequently: true });
  var esc = Math.min(1, 1200 / Math.max(window.innerWidth, window.innerHeight));   // cap de resolucion (getImageData es caro)
  cw = Math.max(2, Math.round(window.innerWidth * esc));
  ch = Math.max(2, Math.round(window.innerHeight * esc));
  cv.width = cw; cv.height = ch;
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
  particles = []; for (var i = 0; i < 13; i++) particles.push(nuevaParticula(0.6));
  distortions = []; var dc = random(5) + 6; for (var d = 0; d < dc; d++) distortions.push(nuevaDistorsion(1.6));
  buildTextRevealQueue();
  campoCorriendo = true;
  animate();
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
  var lado = entero(26, 33);                        // sector mas chiquito
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
    mod.style.width = entero(13, 18) + "vw";       // sector mas chiquito / delgado
    mod.style.top = banda + "vmin"; mod.style.bottom = banda + "vmin";
    if (anclaje === "l") mod.style.left = inset + "vmin"; else mod.style.right = inset + "vmin";
  } else {
    mod.style.height = entero(13, 18) + "vh";       // sector mas chiquito / delgado
    mod.style.left = inset + "vmin"; mod.style.right = inset + "vmin";
    if (anclaje === "t") mod.style.top = banda + "vmin"; else mod.style.bottom = banda + "vmin";
  }

  var conceptos = usados.conceptos.length ? barajar(usados.conceptos) : barajar(VOC.palabras);
  var signos = usados.signos.length ? usados.signos : SIGNO;
  var N = entero(9, 14);                            // mas nodos = mas denso

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
  var ramales = entero(3, 6);
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
    var tam = n.concepto ? azar(1.0, 1.7) : azar(1.8, 3.0);
    el.innerHTML =
      "<span class='et'>" + elegir(["N", "K", "Ø", "V"]) + hex(n.i, 2) + "</span>" +
      "<span class='pt' style='font-family:\"" + fam + "\",unifont,symbola,monospace;font-size:" + tam.toFixed(2) + "vmin'>" + glifo + "</span>";
    var punto = crear("div", "", cuerpo);
    punto.style.cssText = "position:absolute;left:" + n.x + "%;top:" + n.y + "%;transform:translate(-50%,-50%);" +
      "width:.8vmin;height:.8vmin;border:1px solid var(--tinta);opacity:.55;" +
      (n.concepto ? "" : "border-radius:50%;border-color:var(--tinta2);");
  });

  /* densidad de bus de datos: tick perpendicular en cada nodo */
  nodos.forEach(function (n) {
    var tk = svgEl("line");
    if (vertical) { tk.setAttribute("x1", n.x - 5); tk.setAttribute("x2", n.x + 5); tk.setAttribute("y1", n.y); tk.setAttribute("y2", n.y); }
    else { tk.setAttribute("x1", n.x); tk.setAttribute("x2", n.x); tk.setAttribute("y1", n.y - 5); tk.setAttribute("y2", n.y + 5); }
    tk.setAttribute("stroke", "var(--tinta3)"); tk.setAttribute("stroke-width", "1");
    tk.setAttribute("vector-effect", "non-scaling-stroke"); tk.setAttribute("opacity", ".7");
    svg.appendChild(tk);
  });

  /* micro-lecturas flotantes: la jerga del plano, para llenar el vacio */
  var extras = entero(5, 9);
  for (var e = 0; e < extras; e++) {
    var lx = vertical ? azar(8, 92) : azar(3, 97);
    var ly = vertical ? azar(3, 97) : azar(14, 86);
    var lab = crear("div", "", cuerpo);
    lab.style.cssText = "position:absolute;left:" + lx + "%;top:" + ly + "%;transform:translate(-50%,-50%);" +
      "font-family:vga,monospace;font-size:.95vmin;letter-spacing:.04em;white-space:nowrap;opacity:.68;" +
      "color:color-mix(in srgb, var(--linea) 55%, var(--tinta));";
    lab.textContent = elegir(VOC.tecnica.siglas) + " " + hex(entero(0, 255), 2) + elegir(VOC.tecnica.unidades);
  }
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

/* siembra los tokens que re-lee el conector antes de armarlo; el territorio y
   el conector son instrumentos nitidos por encima del lienzo */
sembrarTokens();
construirTerritorio(corner);
construirConector(vertical, anclaje);
construirChrome();

/* el campo arranca cuando las fuentes esten cargadas, para que el canvas
   no dibuje con fuentes de reemplazo */
function arrancarCampo() { iniciarLienzo(); }
if (document.fonts && document.fonts.ready) {
  var fams = FUENTES_TEXTO.concat(FUENTES_GLIFO, ["vga", "unscii", "unifont", "symbola"]);
  Promise.all(fams.map(function (f) { return document.fonts.load("24px '" + f + "'").catch(function () {}); }))
    .then(arrancarCampo, arrancarCampo);
} else { arrancarCampo(); }

/* las otras dos ventanas se renuevan cada ~20s (por ahora solo recargan su
   contenido; mas adelante se animaran) */
setInterval(function () {
  var terr = document.getElementById("territorio"); if (terr) terr.remove();
  var con = document.getElementById("conector"); if (con) con.remove();
  construirTerritorio(corner);
  construirConector(vertical, anclaje);
}, 20000);

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
