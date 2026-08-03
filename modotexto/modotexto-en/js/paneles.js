/*
  paneles.js — TUI habitable.

  Los paneles no son composición: son órganos. El reparto de la rejilla es
  real (un árbol binario de particiones, sin superposición) y los marcos de
  dos paneles vecinos comparten celda, de modo que las uniones caen solas en
  ├ ┬ ╬. Cerrar un panel amputa una facultad del mundo.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;
  var ORIGEN = REJ.ORIGEN;

  var DEFINICIONES = {
    CAMARA:      { titulo: "CAMERA", faculty: "sight", facultad: "sight" },
    PLANTA:      { titulo: "MAP", faculty: "cartographic memory", facultad: "cartographic memory" },
    REGISTRO:    { titulo: "LOG", faculty: "narration", facultad: "narration" },
    INSPECTOR:   { titulo: "INSPECTOR", faculty: "the names of cells", facultad: "the names of cells" },
    PROFUNDIDAD: { titulo: "↕", faculty: "the measure of depth", facultad: "the measure of depth" }
  };

  function hoja(clave) { return { hoja: true, clave: clave, rect: null, padre: null }; }
  function corte(dir, razon, a, b) {
    var n = { hoja: false, dir: dir, razon: razon, a: a, b: b, rect: null, padre: null };
    a.padre = n; b.padre = n;
    return n;
  }

  function Disposicion(rng, cols, rows, opts) {
    opts = opts || {};
    this.cols = cols; this.rows = rows;
    this.doble = rng.chance(0.45);
    this.cerrados = {};
    this.foco = "CAMARA";
    this.residuos = [];
    this.raiz = this.componer(rng);
    this.recalcular(cols, rows);
    this.claveOrden = ["CAMARA", "PLANTA", "REGISTRO", "INSPECTOR", "PROFUNDIDAD"];
  }

  var D = Disposicion.prototype;

  /* el reparto inicial lo decide la semilla; la CÁMARA ocupa entre 45% y 75% */
  D.componer = function (rng) {
    var izquierda = rng.chance(0.5);
    var razonCamara = rng.float(0.56, 0.74);
    var registroAbajo = rng.chance(0.55);
    var tira = hoja("PROFUNDIDAD");

    var lado = corte("h", rng.float(0.45, 0.62), hoja("PLANTA"), hoja("INSPECTOR"));
    var centro;
    if (registroAbajo) {
      centro = corte("h", rng.float(0.72, 0.84), hoja("CAMARA"), hoja("REGISTRO"));
      centro = izquierda ? corte("v", razonCamara, centro, lado) : corte("v", 1 - razonCamara, lado, centro);
    } else {
      var derecha = corte("h", rng.float(0.34, 0.48), lado, hoja("REGISTRO"));
      centro = izquierda ? corte("v", razonCamara, hoja("CAMARA"), derecha)
                         : corte("v", 1 - razonCamara, derecha, hoja("CAMARA"));
    }
    var anchoTira = 3 / Math.max(20, this.cols);
    return rng.chance(0.5)
      ? corte("v", anchoTira, tira, centro)
      : corte("v", 1 - anchoTira, centro, tira);
  };

  /* rects que comparten la celda de frontera: por eso los marcos se funden */
  D.recalcular = function (cols, rows) {
    this.cols = cols; this.rows = rows;
    this.paneles = {};
    asignar(this.raiz, { x: 0, y: 0, w: cols, h: rows }, this.paneles);
    this.colocarResiduos();
  };

  function asignar(nodo, rect, mapa) {
    nodo.rect = rect;
    if (nodo.hoja) { mapa[nodo.clave] = nodo; return; }
    if (nodo.dir === "v") {
      var wa = Math.max(3, Math.min(rect.w - 3, Math.round((rect.w - 1) * nodo.razon) + 1));
      asignar(nodo.a, { x: rect.x, y: rect.y, w: wa, h: rect.h }, mapa);
      asignar(nodo.b, { x: rect.x + wa - 1, y: rect.y, w: rect.w - wa + 1, h: rect.h }, mapa);
    } else {
      var ha = Math.max(3, Math.min(rect.h - 3, Math.round((rect.h - 1) * nodo.razon) + 1));
      asignar(nodo.a, { x: rect.x, y: rect.y, w: rect.w, h: ha }, mapa);
      asignar(nodo.b, { x: rect.x, y: rect.y + ha - 1, w: rect.w, h: rect.h - ha + 1 }, mapa);
    }
  }

  D.rect = function (clave) {
    var p = this.paneles[clave];
    return p ? p.rect : null;
  };

  /* interior: el rect menos su marco */
  D.interior = function (clave) {
    var r = this.rect(clave);
    if (!r) return null;
    return { x: r.x + 1, y: r.y + 1, w: Math.max(0, r.w - 2), h: Math.max(0, r.h - 2) };
  };

  D.abierto = function (clave) { return !!this.paneles[clave]; };

  D.lista = function () {
    var out = [];
    for (var k in this.paneles) if (this.paneles.hasOwnProperty(k)) out.push(k);
    return out;
  };

  D.panelEn = function (x, y) {
    for (var k in this.paneles) {
      if (!this.paneles.hasOwnProperty(k)) continue;
      var r = this.paneles[k].rect;
      if (x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) return k;
    }
    return null;
  };

  D.enBarra = function (clave, x, y) {
    var r = this.rect(clave);
    return !!r && y === r.y && x > r.x && x < r.x + r.w - 1;
  };
  D.enEsquina = function (clave, x, y) {
    var r = this.rect(clave);
    return !!r && x === r.x + r.w - 1 && y === r.y + r.h - 1;
  };
  D.enCierre = function (clave, x, y) {
    var r = this.rect(clave);
    return !!r && y === r.y && x === r.x + 1;
  };

  /* ---- cerrar: el hermano se come la rejilla, queda un residuo de una celda ---- */
  D.cerrar = function (clave) {
    if (clave === "CAMARA") return false;          /* la vista no se amputa */
    var nodo = this.paneles[clave];
    if (!nodo || !nodo.padre) return false;
    var padre = nodo.padre;
    var hermano = padre.a === nodo ? padre.b : padre.a;
    var abuelo = padre.padre;
    hermano.padre = abuelo;
    if (!abuelo) this.raiz = hermano;
    else if (abuelo.a === padre) abuelo.a = hermano;
    else abuelo.b = hermano;
    this.cerrados[clave] = true;
    if (this.foco === clave) this.foco = "CAMARA";
    this.recalcular(this.cols, this.rows);
    return true;
  };

  /* ---- reabrir: parte la hoja más grande; lo perdido mientras tanto no vuelve ---- */
  D.abrir = function (clave) {
    if (this.paneles[clave]) return false;
    var mayor = null, area = -1;
    for (var k in this.paneles) {
      if (!this.paneles.hasOwnProperty(k)) continue;
      var r = this.paneles[k].rect, a = r.w * r.h;
      if (a > area) { area = a; mayor = this.paneles[k]; }
    }
    if (!mayor) return false;
    var r2 = mayor.rect;
    var dir = r2.w >= r2.h * 2 ? "v" : "h";
    var nueva = hoja(clave);
    var reemplazo = corte(dir, 0.6, hoja(mayor.clave), nueva);
    var padre = mayor.padre;
    reemplazo.padre = padre;
    if (!padre) this.raiz = reemplazo;
    else if (padre.a === mayor) padre.a = reemplazo;
    else padre.b = reemplazo;
    delete this.cerrados[clave];
    this.recalcular(this.cols, this.rows);
    return true;
  };

  /* ---- redimensionar: mover la línea de corte más cercana ---- */
  D.redimensionar = function (clave, dx, dy) {
    var nodo = this.paneles[clave];
    if (!nodo) return false;
    var hijo = nodo, padre = nodo.padre, movido = false;
    while (padre) {
      var delta = padre.dir === "v" ? dx : dy;
      if (delta) {
        var span = padre.dir === "v" ? padre.rect.w : padre.rect.h;
        var signo = padre.a === hijo ? 1 : -1;
        var nueva = padre.razon + (signo * delta) / Math.max(4, span);
        padre.razon = Math.max(0.12, Math.min(0.88, nueva));
        movido = true;
        break;
      }
      hijo = padre; padre = padre.padre;
    }
    if (movido) this.recalcular(this.cols, this.rows);
    return movido;
  };

  /* ---- mover: arrastrar una barra de título intercambia dos paneles ---- */
  D.intercambiar = function (a, b) {
    if (a === b) return false;
    var na = this.paneles[a], nb = this.paneles[b];
    if (!na || !nb) return false;
    na.clave = b; nb.clave = a;
    this.recalcular(this.cols, this.rows);
    return true;
  };

  D.vecino = function (clave, dx, dy) {
    var r = this.rect(clave);
    if (!r) return null;
    var cx = r.x + (r.w >> 1) + dx * ((r.w >> 1) + 1);
    var cy = r.y + (r.h >> 1) + dy * ((r.h >> 1) + 1);
    cx = Math.max(0, Math.min(this.cols - 1, cx));
    cy = Math.max(0, Math.min(this.rows - 1, cy));
    var otro = this.panelEn(cx, cy);
    return otro === clave ? null : otro;
  };

  D.siguienteFoco = function (paso) {
    var vivos = this.claveOrden.filter(function (k) { return this.paneles[k]; }, this);
    if (!vivos.length) return this.foco;
    var i = vivos.indexOf(this.foco);
    if (i < 0) i = 0;
    this.foco = vivos[(i + paso + vivos.length) % vivos.length];
    return this.foco;
  };

  /* residuos: una celda en la orilla por cada panel cerrado */
  D.colocarResiduos = function () {
    this.residuos = [];
    var i = 0;
    for (var k in this.cerrados) {
      if (!this.cerrados.hasOwnProperty(k)) continue;
      this.residuos.push({ clave: k, x: this.cols - 1, y: this.rows - 2 - i });
      i += 1;
    }
  };

  D.residuoEn = function (x, y) {
    for (var i = 0; i < this.residuos.length; i += 1) {
      if (this.residuos[i].x === x && this.residuos[i].y === y) return this.residuos[i].clave;
    }
    return null;
  };

  /* ---------------- dibujo ---------------- */

  D.marcos = function (rej) {
    for (var k in this.paneles) {
      if (!this.paneles.hasOwnProperty(k)) continue;
      var r = this.paneles[k].rect;
      /* el foco se dibuja con caracteres: el panel activo lleva marco doble */
      rej.marcoRect(r.x, r.y, r.w, r.h, this.doble ? k !== this.foco : k === this.foco);
    }
  };

  D.titulos = function (rej, tinta, papel, tintaFoco) {
    for (var k in this.paneles) {
      if (!this.paneles.hasOwnProperty(k)) continue;
      var r = this.paneles[k].rect;
      var def = DEFINICIONES[k];
      var activo = k === this.foco;
      var t = activo ? tintaFoco : tinta;
      if (r.w < 6) {
        rej.set(r.x + (r.w >> 1), r.y, def.titulo.charAt(0), t, papel, 0, ORIGEN.INTERFAZ);
        continue;
      }
      /* botón de cierre: una celda. La CÁMARA no lo tiene. */
      if (k !== "CAMARA") rej.set(r.x + 1, r.y, "■", t, papel, 0, ORIGEN.INTERFAZ);
      var etiqueta = def.titulo;
      var maxW = r.w - 5;
      var inicio = r.x + 3;
      if (etiqueta.length > maxW) etiqueta = etiqueta.slice(0, Math.max(1, maxW));
      rej.texto(inicio, r.y, etiqueta, t, papel, activo ? REJ.ATTR.INTENSO : 0, ORIGEN.INTERFAZ, maxW);
      /* esquina de redimensión */
      rej.set(r.x + r.w - 1, r.y + r.h - 1, "≡", t, papel, 0, ORIGEN.INTERFAZ);
    }
    for (var i = 0; i < this.residuos.length; i += 1) {
      var res = this.residuos[i];
      rej.set(res.x, res.y, "▌", tintaFoco, papel, 0, ORIGEN.INTERFAZ);
    }
  };

  D.limpiarInteriores = function (rej, papel) {
    for (var k in this.paneles) {
      if (!this.paneles.hasOwnProperty(k)) continue;
      var it = this.interior(k);
      if (!it) continue;
      rej.rellenar(it.x, it.y, it.w, it.h, " ", 7, papel, 0, ORIGEN.VACIO);
    }
  };

  var api = { Disposicion: Disposicion, DEFINICIONES: DEFINICIONES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_PANELES = api;
})(typeof window !== "undefined" ? window : globalThis);
