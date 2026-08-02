'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — seed.js
   azar firmado. la semilla no adorna: decide la topología, los códigos,
   los colores y qué recuerdos se van a degradar.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  function xmur3(str) {
    let h = 1779033703 ^ String(str).length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^ (h >>> 16)) >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash32(str) { return xmur3(str)(); }

  /* un generador por canal: el mismo mundo puede pedir azar para el
     empaquetamiento sin gastar el azar de la memoria. */
  function rng(seed, channel) {
    return mulberry32(hash32(String(seed) + '::' + String(channel || '')));
  }

  /* utilidades sobre un rng crudo */
  function util(r) {
    return {
      raw: r,
      f: (a, b) => a + r() * (b - a),
      i: (a, b) => Math.floor(a + r() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      chance: (p) => r() < p,
      shuffle: (arr) => {
        const s = arr.slice();
        for (let i = s.length - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1));
          const t = s[i]; s[i] = s[j]; s[j] = t;
        }
        return s;
      },
      bits: (n) => { let s = ''; for (let i = 0; i < n; i++) s += r() < 0.5 ? '0' : '1'; return s; }
    };
  }

  function make(seed, channel) { return util(rng(seed, channel)); }

  const ADJ = ['tibia', 'parcial', 'lenta', 'ajena', 'doble', 'seca', 'menor', 'tardía', 'previa', 'inversa', 'húmeda', 'exacta'];
  const SUS = ['prueba', 'señal', 'copia', 'caja', 'sonda', 'orilla', 'esfera', 'retícula', 'huella', 'demora', 'vuelta', 'astilla'];

  /* una semilla nueva se escribe como dos palabras y un número:
     legible, compartible, repetible. */
  function nueva() {
    const t = Date.now();
    const r = util(mulberry32((t ^ (Math.random() * 0xffffffff)) >>> 0));
    return r.pick(SUS) + '-' + r.pick(ADJ) + '-' + r.i(100, 999);
  }

  N.seed = {
    hash32: hash32,
    rng: rng,
    make: make,
    nueva: nueva,
    mulberry32: mulberry32
  };

})(window.NPVS);
