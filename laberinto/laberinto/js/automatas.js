/*
  automatas.js — automatas celulares elementales (Wolfram)
  poesiasexp / laberinto

  no son fondo de pantalla. una fila del automata decide cosas del DOM:
  que celdas de una tabla existen, donde aparece un enlace, que columna
  sobrevive, que ventana nace, que ruta se cierra. la ultima fila de una
  pagina puede ser la semilla de la siguiente.

  reglas privilegiadas por el laberinto: 30, 45, 54, 60, 90, 110.
  isomorfo: node + navegador.
*/
(function () {
  'use strict';

  var REGLAS = [30, 45, 54, 60, 90, 110, 73, 105, 150, 22, 90, 126];

  // regla -> tabla de 8 vecindarios (indice = izq*4+centro*2+der)
  function tablaRegla(regla) {
    var t = new Uint8Array(8);
    for (var i = 0; i < 8; i++) t[i] = (regla >> i) & 1;
    return t;
  }

  function Automata(opts) {
    opts = opts || {};
    this.ancho = opts.ancho || 96;
    this.regla = (opts.regla === undefined) ? 90 : opts.regla;
    this.tabla = tablaRegla(this.regla);
    this.envolvente = opts.envolvente !== false; // toroidal por defecto
    if (opts.fila && opts.fila.length) {
      this.fila = Uint8Array.from(opts.fila.slice(0, this.ancho));
    } else {
      this.fila = new Uint8Array(this.ancho);
      if (opts.rng) {
        // sembrado por densidad
        var d = (opts.densidad === undefined) ? 0.12 : opts.densidad;
        for (var i = 0; i < this.ancho; i++) this.fila[i] = opts.rng.chance(d) ? 1 : 0;
        // garantiza al menos una celda viva
        if (this.fila.indexOf(1) < 0) this.fila[opts.rng.int(0, this.ancho - 1)] = 1;
      } else {
        this.fila[this.ancho >> 1] = 1; // un solo punto al centro (clasico)
      }
    }
    this.generacion = 0;
  }

  Automata.prototype.paso = function () {
    var n = this.ancho, prev = this.fila, next = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      var izq, der;
      if (this.envolvente) {
        izq = prev[(i - 1 + n) % n];
        der = prev[(i + 1) % n];
      } else {
        izq = i > 0 ? prev[i - 1] : 0;
        der = i < n - 1 ? prev[i + 1] : 0;
      }
      var idx = (izq << 2) | (prev[i] << 1) | der;
      next[i] = this.tabla[idx];
    }
    this.fila = next;
    this.generacion++;
    return next;
  };

  // devuelve un arreglo de filas (matriz alto x ancho), sin mutar de mas
  Automata.prototype.evolucionar = function (alto) {
    var filas = [Uint8Array.from(this.fila)];
    for (var g = 0; g < alto - 1; g++) filas.push(Uint8Array.from(this.paso()));
    return filas;
  };

  // indices de celdas vivas de la fila actual
  Automata.prototype.vivas = function () {
    var out = [];
    for (var i = 0; i < this.ancho; i++) if (this.fila[i]) out.push(i);
    return out;
  };

  Automata.prototype.densidadActual = function () {
    var c = 0;
    for (var i = 0; i < this.ancho; i++) c += this.fila[i];
    return c / this.ancho;
  };

  // mezcla de dos reglas al enlazar dos paginas: alterna, mezcla o hereda
  function mezclar(a, b, modo) {
    switch (modo) {
      case 'alternar': return (a + b) & 1 ? a : b;
      case 'xor':      return a ^ b;
      case 'suma':     return REGLAS[(REGLAS.indexOf(a) + REGLAS.indexOf(b) + 1 + REGLAS.length) % REGLAS.length];
      default:         return b; // hereda la ultima
    }
  }

  var api = { Automata: Automata, REGLAS: REGLAS, tablaRegla: tablaRegla, mezclar: mezclar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') { window.AUTOMATAS = api; window.Automata = Automata; }
})();
