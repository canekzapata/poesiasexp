/*
  condensacion.js — la quietud condensa.

  El ruido se vuelve lenguaje cuando el visitante deja de moverse.
  4 s sin entrada: la trama de un muro cercano empieza a migrar.
  8 s: la frase está completa y legible.
  Al primer movimiento se deshace, más rápido de lo que se hizo.

  Es la única forma de acumular texto en la obra.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;
  var ORIGEN = REJ.ORIGEN;

  var ESPERA = 4000;
  var CONDENSA = 4000;
  var DISUELVE = 700;
  var MIGRACION = "·.,:;'\"¨´°¤∙";

  function Condensacion(rng, lexico) {
    this.rng = rng;
    this.lexico = lexico;
    this.estado = "dormida";     /* dormida | condensando | legible | disolviendo */
    this.t0 = 0;
    this.frase = null;
    this.sitio = null;
    this.orden = null;
    this.reducido = false;
    this.alLeer = null;
  }

  var C = Condensacion.prototype;

  C.reiniciar = function () {
    this.estado = "dormida";
    this.frase = null;
    this.sitio = null;
    this.orden = null;
  };

  C.mover = function (ahora) {
    if (this.estado === "condensando" || this.estado === "legible") {
      this.estado = "disolviendo";
      this.t0 = ahora;
    } else if (this.estado === "disolviendo") {
      /* ya se está deshaciendo: sigue */
    } else {
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
      /* tramo cualquiera de muro no lejano */
      for (var k = 0; k < cols.length; k += 1) {
        if (cols[k] && !cols[k].fuera && cols[k].dist < 10) {
          mejor = { ini: Math.max(0, k - 3), largo: Math.min(12, cols.length - k), col: cols[k] };
          break;
        }
      }
    }
    if (!mejor || mejor.largo < 4) return null;
    var col = mejor.col;
    var fila = Math.max(rect.y + 1, Math.min(rect.y + rect.h - 2,
      Math.round((col.arriba + col.abajo) / 2)));
    return { x0: rect.x + mejor.ini, y: fila, ancho: mejor.largo, mat: col.mat, casilla: { x: col.x, y: col.y } };
  };

  C.actualizar = function (ahora, quietoDesde, trazado, rect, mundo) {
    var inactivo = ahora - quietoDesde;
    if (this.estado === "disolviendo" && ahora - this.t0 > DISUELVE) this.estado = "dormida";
    if (this.estado === "dormida" && inactivo >= ESPERA) {
      var sitio = this.elegirSitio(trazado, rect, mundo);
      if (!sitio) return;
      var mat = sitio.mat ? sitio.mat.clave : null;
      var tomada = this.lexico.tomar(mundo.nivel, mat);
      var texto = tomada.texto;
      var ancho = Math.max(6, sitio.ancho);
      if (texto.length > ancho) texto = recortar(texto, ancho);
      this.frase = tomada;
      this.fraseVisible = texto;
      this.sitio = sitio;
      this.orden = ordenMigracion(this.rng, texto.length);
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
    if (this.estado === "dormida" || !this.sitio || !this.fraseVisible) return 0;
    var p = this.reducido ? (this.estado === "dormida" ? 0 : 1) : this.progreso(ahora);
    var texto = this.fraseVisible;
    var s = this.sitio;
    var usadas = 0;
    for (var i = 0; i < texto.length; i += 1) {
      var x = s.x0 + i;
      if (x >= rej.cols) break;
      var umbral = this.orden[i] / texto.length;
      var c;
      if (p >= 1 || p > umbral + 0.25) { c = texto.charAt(i); if (c !== " ") usadas += 1; }
      else if (p > umbral) c = MIGRACION.charAt((i * 5 + Math.floor(p * 40)) % MIGRACION.length);
      else continue;
      rej.set(x, s.y, c, tinta, papel, p >= 1 ? REJ.ATTR.INTENSO : 0, ORIGEN.LEXICO);
    }
    return usadas;
  };

  function ordenMigracion(rng, n) {
    var o = [];
    for (var i = 0; i < n; i += 1) o.push(i);
    rng.shuffle(o);
    return o;
  }

  function recortar(texto, ancho) {
    if (texto.length <= ancho) return texto;
    var palabras = texto.split(" ");
    var out = "";
    for (var i = 0; i < palabras.length; i += 1) {
      if ((out + (out ? " " : "") + palabras[i]).length > ancho) break;
      out += (out ? " " : "") + palabras[i];
    }
    return out || texto.slice(0, ancho);
  }

  var api = { Condensacion: Condensacion, ESPERA: ESPERA, CONDENSA: CONDENSA, DISUELVE: DISUELVE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_CONDENSACION = api;
})(typeof window !== "undefined" ? window : globalThis);
