/*
  rejilla.js — la matriz de celdas. Es el mundo entero.
  Nada existe fuera de esta matriz: ni una forma, ni un pixel, ni un borde.

  Datos puros (sin DOM, para que tests/smoke.js pueda componer pantallas en node).
  El pintado vive en Pintor, que sí necesita un <canvas>.
*/
(function (root) {
  "use strict";

  var ORIGEN = {
    VACIO: 0, MURO: 1, AUTOMATA: 2, LEXICO: 3, RUIDO: 4,
    INTERFAZ: 5, PISO: 6, CIELO: 7, CUERPO: 8, VOLCADO: 9, INSCRIPCION: 10,
    ESCULTURA: 11, CELADOR: 12
  };
  var NOMBRE_ORIGEN = [
    "void", "wall", "automaton", "lexicon", "noise",
    "interface", "floor", "sky", "body", "dump", "inscription", "sculpture", "warden"
  ];
  var ATTR = { NORMAL: 0, INTENSO: 1, PARPADEO: 2, INVERTIDO: 4 };

  /* marco: N=1 E=2 S=4 W=8, doble=16 */
  var MARCO_SIMPLE = [
    " ", "│", "─", "└", "│", "│", "┌", "├",
    "─", "┘", "─", "┴", "┐", "┤", "┬", "┼"
  ];
  var MARCO_DOBLE = [
    " ", "║", "═", "╚", "║", "║", "╔", "╠",
    "═", "╝", "═", "╩", "╗", "╣", "╦", "╬"
  ];

  function Rejilla(cols, rows) { this.redim(cols, rows); }

  Rejilla.prototype.redim = function (cols, rows) {
    cols = Math.max(20, cols | 0);
    rows = Math.max(10, rows | 0);
    var n = cols * rows;
    this.cols = cols; this.rows = rows; this.n = n;
    this.ch = new Uint32Array(n);
    this.ink = new Uint8Array(n);
    this.paper = new Uint8Array(n);
    this.attr = new Uint8Array(n);
    this.origen = new Uint8Array(n);
    this.marco = new Uint8Array(n);
    this.veces = new Uint16Array(n);
    /*
      compuestas — una celda guarda un solo punto de código, pero el
      palimpsesto necesita cuatro caracteres en el mismo sitio: una base y
      hasta tres diacríticos combinantes. Esos se apuntan aquí; el resto de
      la obra sigue leyendo `ch`, y las exportaciones se quedan con la base,
      que es exactamente la pobreza que les toca.
    */
    this.compuestas = {};
    this.limpiar(32, 7, 0);
    return this;
  };

  Rejilla.prototype.limpiar = function (code, ink, paper) {
    this.ch.fill(code == null ? 32 : code);
    this.ink.fill(ink == null ? 7 : ink);
    this.paper.fill(paper == null ? 0 : paper);
    this.attr.fill(0);
    this.origen.fill(ORIGEN.VACIO);
    this.marco.fill(0);
    this.compuestas = {};
  };

  Rejilla.prototype.dentro = function (x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  };
  Rejilla.prototype.idx = function (x, y) { return y * this.cols + x; };

  /* set: un carácter (string de 1 punto de código) o un code point */
  Rejilla.prototype.set = function (x, y, c, ink, paper, attr, origen) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    var i = y * this.cols + x;
    var code = typeof c === "number" ? c : (c == null ? 32 : c.codePointAt(0));
    if (this.ch[i] !== code) this.veces[i] = Math.min(65535, this.veces[i] + 1);
    this.ch[i] = code;
    if (typeof c === "string" && c.length > 1 && Array.from(c).length > 1) this.compuestas[i] = c;
    else if (this.compuestas[i] !== undefined) delete this.compuestas[i];
    if (ink != null) this.ink[i] = ink & 15;
    if (paper != null) this.paper[i] = paper & 15;
    this.attr[i] = attr || 0;
    if (origen != null) this.origen[i] = origen;
  };

  Rejilla.prototype.getChar = function (x, y) {
    if (!this.dentro(x, y)) return " ";
    return String.fromCodePoint(this.ch[y * this.cols + x]);
  };

  Rejilla.prototype.celda = function (x, y) {
    if (!this.dentro(x, y)) return null;
    var i = y * this.cols + x;
    return {
      x: x, y: y,
      ch: String.fromCodePoint(this.ch[i]),
      ink: this.ink[i], paper: this.paper[i], attr: this.attr[i],
      origen: NOMBRE_ORIGEN[this.origen[i]] || "?",
      veces: this.veces[i]
    };
  };

  Rejilla.prototype.rellenar = function (x, y, w, h, c, ink, paper, attr, origen) {
    for (var j = 0; j < h; j += 1) {
      for (var i = 0; i < w; i += 1) this.set(x + i, y + j, c, ink, paper, attr, origen);
    }
  };

  /* texto: escribe una cadena recortada al ancho dado. Devuelve cuántas celdas usó. */
  Rejilla.prototype.texto = function (x, y, str, ink, paper, attr, origen, maxW) {
    var chars = Array.from(String(str));
    var lim = maxW == null ? chars.length : Math.min(chars.length, maxW);
    for (var i = 0; i < lim; i += 1) {
      this.set(x + i, y, chars[i], ink, paper, attr, origen == null ? ORIGEN.LEXICO : origen);
    }
    return lim;
  };

  /* ---- marcos: se acumulan como bits y se resuelven al final,
         para que dos paneles que se tocan compartan ├ ┬ ╬ ---- */
  Rejilla.prototype.marcoBit = function (x, y, bits) {
    if (!this.dentro(x, y)) return;
    this.marco[y * this.cols + x] |= bits;
  };

  Rejilla.prototype.marcoRect = function (x, y, w, h, doble) {
    if (w < 2 || h < 2) return;
    var d = doble ? 16 : 0, i;
    for (i = x + 1; i < x + w - 1; i += 1) {
      this.marcoBit(i, y, 2 | 8 | d);
      this.marcoBit(i, y + h - 1, 2 | 8 | d);
    }
    for (i = y + 1; i < y + h - 1; i += 1) {
      this.marcoBit(x, i, 1 | 4 | d);
      this.marcoBit(x + w - 1, i, 1 | 4 | d);
    }
    this.marcoBit(x, y, 2 | 4 | d);
    this.marcoBit(x + w - 1, y, 4 | 8 | d);
    this.marcoBit(x, y + h - 1, 1 | 2 | d);
    this.marcoBit(x + w - 1, y + h - 1, 1 | 8 | d);
  };

  Rejilla.prototype.resolverMarcos = function (ink, paper) {
    for (var i = 0; i < this.n; i += 1) {
      var m = this.marco[i];
      if (!m) continue;
      var tabla = (m & 16) ? MARCO_DOBLE : MARCO_SIMPLE;
      var c = tabla[m & 15];
      if (c === " ") continue;
      var x = i % this.cols, y = (i / this.cols) | 0;
      this.set(x, y, c, ink, paper, 0, ORIGEN.INTERFAZ);
    }
  };

  /*
    contarLexico — la regla dura del §2, hecha número.
    Cuenta como "lenguaje reconocible" toda letra que forme parte de una
    corrida de tres o más letras. Una letra suelta es textura, no palabra.
  */
  var RE_LETRA = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;
  Rejilla.prototype.contarLexico = function () {
    var lexicas = 0, ocupadas = 0, lineas = 0;
    for (var y = 0; y < this.rows; y += 1) {
      var corrida = 0, palabras = 0, letrasEnPalabras = 0;
      for (var x = 0; x <= this.cols; x += 1) {
        var code = x < this.cols ? this.ch[y * this.cols + x] : 32;
        var c = String.fromCodePoint(code);
        if (x < this.cols && code !== 32) ocupadas += 1;
        if (RE_LETRA.test(c)) { corrida += 1; continue; }
        if (corrida >= 3) lexicas += corrida;
        /*
          Una línea legible tiene estructura de palabras: varios grupos
          cortos separados por espacio. Una corrida larguísima de letras
          sin junturas es un muro escrito —lenguaje visible, no legible—
          y no cuenta para el máximo de tres líneas simultáneas.
        */
        if (corrida >= 2 && corrida <= 14 && c === " ") {
          palabras += 1; letrasEnPalabras += corrida;
        }
        corrida = 0;
      }
      if (palabras >= 3 && letrasEnPalabras >= 12) lineas += 1;
    }
    return {
      total: this.n,
      lexicas: lexicas,
      ocupadas: ocupadas,
      proporcion: lexicas / this.n,
      lineasLegibles: lineas
    };
  };

  Rejilla.prototype.aTexto = function () {
    var out = [];
    for (var y = 0; y < this.rows; y += 1) {
      var s = "";
      for (var x = 0; x < this.cols; x += 1) s += String.fromCodePoint(this.ch[y * this.cols + x]);
      out.push(s.replace(/\s+$/, ""));
    }
    return out.join("\n");
  };

  /* ---------------- Pintor: la única parte que toca el canvas ---------------- */

  function Pintor(canvas, paleta) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.paleta = paleta;
    this.cw = 8; this.chh = 16;
    this.fuente = "monospace";
    this.dpr = 1;
    this.prev = null;
    this.parpadeoOn = true;
    this.reducido = false;
    /*
      Los alfabetos que nadie lee no comparten la métrica de las CP437:
      el phags-pa mide el doble, los sextantes de unscii miden menos.
      No importa: ningún glifo se dibuja fuera de su celda (ver anchoDe).
    */
    this.fuenteIlegible = "mtSymbola, mtPhags, mtEgipcio, mtLinearB, mtAnatolio, mtSign, monospace";
    this._anchos = {};
    this._anchosIlegibles = {};
  }

  /* ancho real de un glifo en la fuente actual, memorizado */
  Pintor.prototype.anchoDe = function (code, ilegible) {
    var cache = ilegible ? this._anchosIlegibles : this._anchos;
    var w = cache[code];
    if (w === undefined) {
      w = this.ctx.measureText(String.fromCodePoint(code)).width;
      cache[code] = w;
    }
    return w;
  };

  Pintor.prototype.medir = function (fuente, alturaPx) {
    this.fuente = fuente;
    this.chh = Math.max(6, Math.round(alturaPx));
    this.ctx.font = this.chh + "px " + fuente;
    var w = this.ctx.measureText("█").width;
    if (!w || !isFinite(w)) w = this.ctx.measureText("M").width;
    this.cw = Math.max(3, Math.round(w));
    this._anchos = {};
    this._anchosIlegibles = {};
    return { cw: this.cw, ch: this.chh };
  };

  Pintor.prototype.ajustar = function (rejilla) {
    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    var w = rejilla.cols * this.cw, h = rejilla.rows * this.chh;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    this.ctx.font = this.chh + "px " + this.fuente;
    this.prev = null;
    this.ancho = w; this.alto = h;
  };

  Pintor.prototype.invalidar = function () { this.prev = null; };

  /* pinta sólo las celdas que cambiaron desde el fotograma anterior */
  Pintor.prototype.pintar = function (rej, tiempo) {
    var ctx = this.ctx, n = rej.n, cols = rej.cols;
    var blink = this.reducido ? true : (Math.floor(tiempo / 400) % 2 === 0);
    var cambioBlink = blink !== this.parpadeoOn;
    this.parpadeoOn = blink;
    var completo = false;
    if (!this.prev || this.prev.ch.length !== n) {
      this.prev = {
        ch: new Uint32Array(n), ink: new Uint8Array(n),
        paper: new Uint8Array(n), attr: new Uint8Array(n)
      };
      this.prev.ch.fill(0xffff);
      completo = true;
      ctx.fillStyle = this.paleta.papel[0];
      ctx.fillRect(0, 0, this.ancho, this.alto);
    }
    var p = this.prev, cw = this.cw, chh = this.chh;
    var fuenteBase = chh + "px " + this.fuente;
    var fuenteOtra = chh + "px " + this.fuenteIlegible;
    ctx.font = fuenteBase;
    var fuenteActual = 0;
    for (var i = 0; i < n; i += 1) {
      var a = rej.attr[i];
      var parpadea = (a & ATTR.PARPADEO) !== 0;
      if (!completo && !(parpadea && cambioBlink) &&
          p.ch[i] === rej.ch[i] && p.ink[i] === rej.ink[i] &&
          p.paper[i] === rej.paper[i] && p.attr[i] === rej.attr[i]) continue;
      p.ch[i] = rej.ch[i]; p.ink[i] = rej.ink[i];
      p.paper[i] = rej.paper[i]; p.attr[i] = rej.attr[i];
      var x = (i % cols) * cw, y = ((i / cols) | 0) * chh;
      var tinta = rej.ink[i], papel = rej.paper[i];
      if (a & ATTR.INVERTIDO) { var t = tinta; tinta = papel; papel = t; }
      if (a & ATTR.INTENSO) tinta = tinta | 8;
      ctx.fillStyle = this.paleta.papel[papel & 15];
      ctx.fillRect(x, y, cw, chh);
      var code = rej.ch[i];
      if (code === 32) continue;
      if (parpadea && !blink) continue;
      ctx.fillStyle = this.paleta.tinta[tinta & 15];
      var o = rej.origen[i];
      var ilegible = o === ORIGEN.INSCRIPCION || o === ORIGEN.ESCULTURA || o === ORIGEN.CELADOR;
      if (ilegible !== (fuenteActual === 1)) {
        ctx.font = ilegible ? fuenteOtra : fuenteBase;
        fuenteActual = ilegible ? 1 : 0;
      }
      /*
        Cada glifo se estira o se encoge para ocupar exactamente su celda.
        Es la ley de la pieza: nada ocurre fuera de la rejilla, ni medio
        pixel. De paso desaparecen las junturas entre bloques.
      */
      var glifo = rej.compuestas[i] || String.fromCodePoint(code);
      var ancho = this.anchoDe(code, ilegible);
      if (ancho > 0.1 && Math.abs(ancho - cw) > 0.25) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(cw / ancho, 1);
        ctx.fillText(glifo, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(glifo, x, y);
      }
    }
  };

  var api = {
    Rejilla: Rejilla, Pintor: Pintor,
    ORIGEN: ORIGEN, ATTR: ATTR, NOMBRE_ORIGEN: NOMBRE_ORIGEN,
    MARCO_SIMPLE: MARCO_SIMPLE, MARCO_DOBLE: MARCO_DOBLE
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_REJILLA = api;
})(typeof window !== "undefined" ? window : globalThis);
