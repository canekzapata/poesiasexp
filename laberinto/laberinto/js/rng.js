/*
  rng.js — azar reproducible
  poesiasexp / laberinto

  un solo generador determinista (mulberry32) sembrado por una cadena o numero.
  la misma semilla reconstruye la misma internet. el caos temporal —el que no
  se reproduce— vive aparte, en Math.random dentro del motor.

  isomorfo: corre en node (generar-sitio.mjs) y en el navegador (motor).
*/
(function () {
  'use strict';

  // cadena/numero -> uint32 (xfnv1a). estable entre node y navegador.
  function hashSeed(x) {
    var str = String(x);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // avalancha final
    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function RNG(seed) {
    if (!(this instanceof RNG)) return new RNG(seed);
    this.seed = (typeof seed === 'number') ? (seed >>> 0) : hashSeed(seed);
    this._f = mulberry32(this.seed);
  }

  RNG.prototype.next = function () { return this._f(); };

  // entero en [a,b] inclusivo
  RNG.prototype.int = function (a, b) {
    if (b === undefined) { b = a; a = 0; }
    return a + Math.floor(this._f() * (b - a + 1));
  };

  RNG.prototype.float = function (a, b) {
    if (a === undefined) return this._f();
    if (b === undefined) { b = a; a = 0; }
    return a + this._f() * (b - a);
  };

  RNG.prototype.chance = function (p) { return this._f() < p; };

  RNG.prototype.pick = function (arr) {
    if (!arr || !arr.length) return undefined;
    return arr[Math.floor(this._f() * arr.length)];
  };

  // n elementos distintos (o menos si el arreglo es corto)
  RNG.prototype.picks = function (arr, n) {
    return this.shuffle(arr.slice()).slice(0, n);
  };

  // fisher-yates in place, devuelve el arreglo
  RNG.prototype.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(this._f() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  // {clave: peso, ...} -> clave
  RNG.prototype.weighted = function (obj) {
    var keys = Object.keys(obj), total = 0, i;
    for (i = 0; i < keys.length; i++) total += obj[keys[i]];
    var r = this._f() * total;
    for (i = 0; i < keys.length; i++) {
      r -= obj[keys[i]];
      if (r < 0) return keys[i];
    }
    return keys[keys.length - 1];
  };

  // un rng hijo, determinista, para aislar sub-decisiones sin gastar la corriente
  RNG.prototype.fork = function (tag) {
    return new RNG(hashSeed(this.seed + '::' + tag));
  };

  var api = { RNG: RNG, hashSeed: hashSeed };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') { window.AZAR = api; window.RNG = RNG; }
})();
