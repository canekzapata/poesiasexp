/*
  volcado.js — el error no es una pantalla aparte: es un cambio de régimen
  del espacio.

  Una región del laberinto se corrompe y sus celdas empiezan a mostrar el
  estado interno del programa entreverado con el léxico, en columnas
  hexadecimales que casi cuadran. Dura poco. Es el único momento en que la
  obra puede volverse densamente textual.

  Es un poema, no un letrero de error. Los errores suenan aburridos y reales.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;
  var LEX = root.MT_LEXICO;
  var ORIGEN = REJ.ORIGEN;

  var DURACION = 7200;

  function hex(n, largo) {
    var s = (n >>> 0).toString(16).toUpperCase();
    while (s.length < largo) s = "0" + s;
    return s;
  }

  function Volcado(rng, lexico) {
    this.rng = rng;
    this.lexico = lexico;
    this.activo = null;
    this.historial = [];
    this.ultimo = 0;
  }

  var V = Volcado.prototype;

  /* la corrupción siempre está ligada a algo que el visitante hizo */
  V.quizas = function (ahora, mundo, causa, fuerza) {
    if (this.activo) return false;
    if (ahora - this.ultimo < 120000) return false;
    var p = (fuerza || 0.02) * (1 + (mundo.nivel || 0) * 0.4);
    if (!this.rng.chance(Math.min(0.5, p))) return false;
    return this.disparar(ahora, mundo, causa);
  };

  V.disparar = function (ahora, mundo, causa) {
    var lab = mundo.lab;
    var r = this.rng.int(3, 6);
    var cx = mundo.pos.x + this.rng.int(-4, 4);
    var cy = mundo.pos.y + this.rng.int(-4, 4);
    cx = Math.max(2, Math.min(lab.W - 3, cx));
    cy = Math.max(2, Math.min(lab.H - 3, cy));
    this.activo = {
      x: cx, y: cy, r: r, t0: ahora, dur: DURACION,
      causa: causa || "movimiento",
      nivel: mundo.nivel,
      semilla: mundo.semilla,
      lineas: this.componer(mundo, cx, cy, causa)
    };
    this.ultimo = ahora;
    return true;
  };

  /* el poema: vocabulario de máquina y vocabulario del corpus, en columnas */
  V.componer = function (mundo, cx, cy, causa) {
    var rng = this.rng;
    var lineas = [];
    var base = (root.MT_AZAR ? root.MT_AZAR.hashSeed(mundo.semilla + ":" + cx + ":" + cy) : 0x4a1c0000) >>> 0;
    var cab = LEX.ERRORES[Math.floor(rng.next() * LEX.ERRORES.length)];
    lineas.push(cab + " " + hex(base & 0xffff, 4));
    lineas.push("region " + cx + "," + cy + " r=" + this.rng.int(3, 6) + "  nivel " + mundo.nivel + "  causa " + (causa || "?"));
    lineas.push("");
    var cuantas = rng.int(9, 15);
    for (var i = 0; i < cuantas; i += 1) {
      var dir = (base + i * 16) >>> 0;
      var bytes = [];
      var pal = LEX.MAQUINA[Math.floor(rng.next() * LEX.MAQUINA.length)];
      var frag = this.fragmento(mundo);
      var crudo = (pal + " " + frag).slice(0, 8);
      for (var b = 0; b < 8; b += 1) {
        var c = b < crudo.length ? crudo.charCodeAt(b) : rng.int(0, 255);
        bytes.push(hex(c, 2));
      }
      var izq = bytes.slice(0, 4).join(" ");
      var der = bytes.slice(4).join(" ");
      /* las columnas casi cuadran: una de cada cuatro se corre una celda */
      var sangria = (i % 4 === 3) ? " " : "";
      lineas.push(hex(dir, 8) + "  " + izq + "  " + der + sangria + "  |" + limpiar(crudo) + "|  " + pal + " " + frag);
    }
    lineas.push("");
    lineas.push("semilla " + mundo.semilla + "  pos " + mundo.pos.x + "," + mundo.pos.y +
                "  ang " + Math.round(mundo.dirAng * 180 / Math.PI) + "°");
    lineas.push("la region no volverá a ser la misma para esta semilla");
    return lineas;
  };

  V.fragmento = function (mundo) {
    var rng = this.rng;
    var bolsa = LEX.PROFUNDIDAD[Math.min(mundo.nivel, LEX.PROFUNDIDAD.length - 1)];
    var frase = bolsa[Math.floor(rng.next() * bolsa.length)] || "";
    var palabras = frase.split(" ");
    var n = rng.int(1, Math.min(4, palabras.length));
    var i0 = rng.int(0, Math.max(0, palabras.length - n));
    return palabras.slice(i0, i0 + n).join(" ");
  };

  function limpiar(s) {
    var out = "";
    for (var i = 0; i < 8; i += 1) {
      var c = i < s.length ? s.charAt(i) : ".";
      out += /[\x20-\x7e]/.test(c) ? c : ".";
    }
    return out;
  }

  V.vigente = function (ahora) {
    if (!this.activo) return false;
    if (ahora - this.activo.t0 > this.activo.dur) return false;
    return true;
  };

  /* al terminar, la región queda distinta. El daño es permanente para la semilla. */
  V.cerrar = function (mundo, memoria) {
    if (!this.activo) return null;
    var a = this.activo;
    var MATS = root.MT_MATERIALES.MATERIALES;
    var nuevo = MATS[this.rng.int(0, MATS.length - 1)].id;
    var lab = mundo.lab;
    for (var y = a.y - a.r; y <= a.y + a.r; y += 1) {
      for (var x = a.x - a.r; x <= a.x + a.r; x += 1) {
        if (!lab.dentro(x, y)) continue;
        var d = Math.abs(x - a.x) + Math.abs(y - a.y);
        if (d > a.r) continue;
        lab.mat[y * lab.W + x] = nuevo;
      }
    }
    if (memoria) {
      memoria.anotarVolcado({ n: mundo.nivel, x: a.x, y: a.y, r: a.r, m: nuevo });
      memoria.datos.regiones[mundo.nivel + ":" + a.x + ":" + a.y] = { r: a.r, m: nuevo };
    }
    this.historial.push(a);
    if (this.historial.length > 6) this.historial.shift();
    this.activo = null;
    return nuevo;
  };

  /* aplica cicatrices guardadas de sesiones anteriores */
  V.restaurar = function (mundo, memoria) {
    if (!memoria || !memoria.datos.regiones) return;
    var lab = mundo.lab;
    for (var k in memoria.datos.regiones) {
      if (!memoria.datos.regiones.hasOwnProperty(k)) continue;
      var partes = k.split(":");
      if (parseInt(partes[0], 10) !== mundo.nivel) continue;
      var cx = parseInt(partes[1], 10), cy = parseInt(partes[2], 10);
      var reg = memoria.datos.regiones[k];
      for (var y = cy - reg.r; y <= cy + reg.r; y += 1) {
        for (var x = cx - reg.r; x <= cx + reg.r; x += 1) {
          if (!lab.dentro(x, y)) continue;
          if (Math.abs(x - cx) + Math.abs(y - cy) > reg.r) continue;
          lab.mat[y * lab.W + x] = reg.m;
        }
      }
    }
  };

  /* pinta el volcado sobre la CÁMARA: sólo donde la región es visible */
  V.aplicar = function (rej, rect, trazado, ahora, tinta, papel) {
    if (!this.vigente(ahora)) return 0;
    var a = this.activo;
    var cols = trazado.columnas;
    var afectadas = [];
    for (var c = 0; c < cols.length; c += 1) {
      var col = cols[c];
      if (!col || col.fuera) continue;
      if (Math.abs(col.x - a.x) + Math.abs(col.y - a.y) <= a.r) afectadas.push(c);
    }
    if (!afectadas.length) return 0;
    var x0 = rect.x + afectadas[0];
    var ancho = afectadas[afectadas.length - 1] - afectadas[0] + 1;
    if (ancho < 8) return 0;
    var t = (ahora - a.t0) / a.dur;
    var visibles = Math.min(a.lineas.length, Math.max(1, Math.floor(t * a.lineas.length * 1.6)));
    var y0 = rect.y + Math.max(0, ((rect.h - visibles) >> 1));
    var usadas = 0;
    for (var i = 0; i < visibles; i += 1) {
      var y = y0 + i;
      if (y >= rect.y + rect.h) break;
      var linea = a.lineas[i] || "";
      for (var k2 = 0; k2 < ancho; k2 += 1) {
        var ch = k2 < linea.length ? linea.charAt(k2) : " ";
        if (ch === " " && k2 >= linea.length) continue;
        rej.set(x0 + k2, y, ch, tinta, papel, 0, ORIGEN.VOLCADO);
        if (/[A-Za-z]/.test(ch)) usadas += 1;
      }
    }
    return usadas;
  };

  V.poema = function () {
    var a = this.activo || this.historial[this.historial.length - 1];
    if (!a) return "";
    return a.lineas.join("\n");
  };

  var api = { Volcado: Volcado, DURACION: DURACION, hex: hex };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_VOLCADO = api;
})(typeof window !== "undefined" ? window : globalThis);
