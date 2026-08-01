/*
  condensacion.js — la quietud condensa.

  El ruido se vuelve lenguaje cuando el visitante deja de moverse.
  4 s sin entrada: la trama de un muro cercano empieza a migrar.
  8 s: la frase está completa y legible.
  Al primer movimiento se deshace, más rápido de lo que se hizo.

  Es la única forma de acumular texto en la obra.

  Una frase nunca se recorta. Si no cabe a lo ancho del muro, se parte en
  renglones —hasta tres, que es lo que permite la regla de proporción— y si
  aun así no cabe, se ensancha el bloque. Media frase no es media frase:
  es una frase rota, y eso no lo dice el edificio.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;
  var ORIGEN = REJ.ORIGEN;

  var ESPERA = 4000;
  var CONDENSA = 4000;
  var DISUELVE = 700;
  var MIGRACION = "·.,:;'\"¨´°¤∙";
  var MAX_LINEAS = 3;

  function Condensacion(rng, lexico) {
    this.rng = rng;
    this.lexico = lexico;
    this.estado = "dormida";     /* dormida | condensando | legible | disolviendo */
    this.t0 = 0;
    this.frase = null;
    this.lineas = null;
    this.sitio = null;
    this.orden = null;
    this.reducido = false;
    this.alLeer = null;
  }

  var C = Condensacion.prototype;

  C.reiniciar = function () {
    this.estado = "dormida";
    this.frase = null;
    this.lineas = null;
    this.sitio = null;
    this.orden = null;
  };

  C.mover = function (ahora) {
    if (this.estado === "condensando" || this.estado === "legible") {
      this.estado = "disolviendo";
      this.t0 = ahora;
    } else if (this.estado !== "disolviendo") {
      this.estado = "dormida";
    }
  };

  /*
    elegirSitio — un tramo continuo de muro cercano dentro de la CÁMARA.
    Si no hay muro cerca, la frase no aparece: el laberinto calla.
  */
  C.elegirSitio = function (trazado, rect, mundo) {
    var cols = trazado.columnas;
    if (!cols || !cols.length) return null;
    var mejor = null, ini = 0;
    for (var i = 1; i <= cols.length; i += 1) {
      var mismo = i < cols.length && cols[i] && cols[ini] && !cols[i].fuera &&
        cols[i].x === cols[ini].x && cols[i].y === cols[ini].y;
      if (mismo) continue;
      var largo = i - ini;
      var c0 = cols[ini];
      if (c0 && !c0.fuera && c0.dist < 7 && largo >= 6) {
        if (!mejor || largo > mejor.largo) mejor = { ini: ini, largo: largo, col: c0 };
      }
      ini = i;
    }
    if (!mejor) {
      for (var k = 0; k < cols.length; k += 1) {
        if (cols[k] && !cols[k].fuera && cols[k].dist < 10) {
          mejor = { ini: Math.max(0, k - 3), largo: Math.min(12, cols.length - k), col: cols[k] };
          break;
        }
      }
    }
    if (!mejor) return null;
    var col = mejor.col;
    var fila = Math.max(rect.y + 1, Math.min(rect.y + rect.h - 2,
      Math.round((col.arriba + col.abajo) / 2)));
    return {
      x0: rect.x + mejor.ini, y: fila, ancho: mejor.largo,
      mat: col.mat, casilla: { x: col.x, y: col.y }
    };
  };

  /* corta por palabras; nunca parte una palabra si puede evitarlo */
  function envolver(texto, ancho) {
    var palabras = String(texto).split(/\s+/).filter(Boolean);
    var lineas = [], actual = "";
    for (var i = 0; i < palabras.length; i += 1) {
      var p = palabras[i];
      if (!actual) {
        actual = p;
      } else if ((actual + " " + p).length <= ancho) {
        actual += " " + p;
      } else {
        lineas.push(actual);
        actual = p;
      }
      /* una palabra sola más larga que el ancho: se parte, no se pierde */
      while (actual.length > ancho) {
        lineas.push(actual.slice(0, ancho));
        actual = actual.slice(ancho);
      }
    }
    if (actual) lineas.push(actual);
    return lineas;
  }

  /*
    acomodar — busca el ancho más chico que meta la frase entera en tres
    renglones o menos, sin pasarse del panel. Empieza por el ancho del muro
    y ensancha si hace falta: primero manda que la frase esté completa.
  */
  function acomodar(texto, anchoMuro, anchoPanel) {
    var minimo = Math.max(8, Math.min(anchoMuro, anchoPanel));
    var maximo = Math.max(minimo, anchoPanel - 2);
    for (var a = minimo; a <= maximo; a += 1) {
      var l = envolver(texto, a);
      if (l.length <= MAX_LINEAS) return { ancho: a, lineas: l };
    }
    /* imposible en tres renglones: se dan los que hagan falta al ancho máximo */
    return { ancho: maximo, lineas: envolver(texto, maximo) };
  }

  C.actualizar = function (ahora, quietoDesde, trazado, rect, mundo) {
    var inactivo = ahora - quietoDesde;
    if (this.estado === "disolviendo" && ahora - this.t0 > DISUELVE) this.estado = "dormida";
    if (this.estado === "dormida" && inactivo >= ESPERA) {
      var sitio = this.elegirSitio(trazado, rect, mundo);
      if (!sitio) return;
      var mat = sitio.mat ? sitio.mat.clave : null;
      var tomada = this.lexico.tomar(mundo.nivel, mat);
      var caja = acomodar(tomada.texto, sitio.ancho, rect.w);

      /* el bloque se centra sobre el muro y se recorta al panel, nunca la frase */
      var centro = sitio.x0 + Math.floor(sitio.ancho / 2);
      var x0 = centro - Math.floor(caja.ancho / 2);
      x0 = Math.max(rect.x, Math.min(rect.x + rect.w - caja.ancho, x0));
      var y0 = sitio.y - Math.floor((caja.lineas.length - 1) / 2);
      y0 = Math.max(rect.y, Math.min(rect.y + rect.h - caja.lineas.length, y0));

      this.frase = tomada;
      this.lineas = caja.lineas;
      this.sitio = { x0: x0, y: y0, ancho: caja.ancho, mat: sitio.mat, casilla: sitio.casilla };
      this.orden = caja.lineas.map(function (l) { return ordenMigracion(this.rng, l.length); }, this);
      this.estado = "condensando";
      this.t0 = ahora;
      if (this.reducido) { this.estado = "legible"; this.avisar(tomada); }
    }
    if (this.estado === "condensando") {
      var p = (ahora - this.t0) / CONDENSA;
      if (p >= 1) { this.estado = "legible"; this.avisar(this.frase); }
    }
  };

  C.avisar = function (tomada) {
    if (this.avisada === tomada) return;
    this.avisada = tomada;
    if (this.alLeer) this.alLeer(tomada);
  };

  C.progreso = function (ahora) {
    if (this.estado === "legible") return 1;
    if (this.estado === "condensando") return Math.min(1, (ahora - this.t0) / CONDENSA);
    if (this.estado === "disolviendo") return Math.max(0, 1 - (ahora - this.t0) / DISUELVE);
    return 0;
  };

  /* superpone la frase sobre el muro; devuelve cuántas celdas se volvieron letra */
  C.aplicar = function (rej, ahora, tinta, papel) {
    if (this.estado === "dormida" || !this.sitio || !this.lineas) return 0;
    var p = this.reducido ? 1 : this.progreso(ahora);
    var s = this.sitio;
    var usadas = 0;
    for (var l = 0; l < this.lineas.length; l += 1) {
      var texto = this.lineas[l];
      var orden = this.orden[l];
      var y = s.y + l;
      /* cada renglón se centra en el bloque: el poema queda a plomo */
      var sangria = Math.floor((s.ancho - texto.length) / 2);
      for (var i = 0; i < texto.length; i += 1) {
        var x = s.x0 + sangria + i;
        if (x < 0 || x >= rej.cols) continue;
        var umbral = orden[i] / Math.max(1, texto.length);
        var c;
        if (p >= 1 || p > umbral + 0.25) { c = texto.charAt(i); if (c !== " ") usadas += 1; }
        else if (p > umbral) c = MIGRACION.charAt((i * 5 + Math.floor(p * 40)) % MIGRACION.length);
        else continue;
        rej.set(x, y, c, tinta, papel, p >= 1 ? REJ.ATTR.INTENSO : 0, ORIGEN.LEXICO);
      }
    }
    return usadas;
  };

  function ordenMigracion(rng, n) {
    var o = [];
    for (var i = 0; i < n; i += 1) o.push(i);
    rng.shuffle(o);
    return o;
  }

  var api = {
    Condensacion: Condensacion, envolver: envolver, acomodar: acomodar,
    ESPERA: ESPERA, CONDENSA: CONDENSA, DISUELVE: DISUELVE, MAX_LINEAS: MAX_LINEAS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_CONDENSACION = api;
})(typeof window !== "undefined" ? window : globalThis);
