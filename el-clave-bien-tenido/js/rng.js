'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — rng.js
   azar firmado. heredado de `ninguna-prueba-viaja-sola/js/seed.js` sin
   cambiarle la aritmética: xmur3 para el hash, mulberry32 para el flujo,
   un generador por canal para que pedir azar en un sitio no gaste el
   azar de otro.

   la única diferencia con el original: acuñar una semilla nueva ya no
   usa Math.random(). así `grep -c "Math.random" js/*.js` da cero en toda
   la carpeta, que es lo que pide el criterio 2.
   ===================================================================== */
(function (raiz) {

  function xmur3(str) {
    let h = 1779033703 ^ String(str).length;
    for (let i = 0; i < String(str).length; i++) {
      h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
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

  /* un generador por canal: `semilla :: canal`. dos canales distintos de
     la misma semilla no se pisan, y por eso se puede añadir una decisión
     nueva sin mover todas las anteriores. */
  function rng(semilla, canal) {
    return mulberry32(hash32(String(semilla) + '::' + String(canal || '')));
  }

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

  function make(semilla, canal) { return util(rng(semilla, canal)); }

  /* los nombres de semilla salen del vocabulario de la casa: legibles,
     compartibles, repetibles. */
  const ADJ = ['tibia', 'parcial', 'lenta', 'ajena', 'doble', 'seca', 'menor', 'tardía', 'previa', 'inversa', 'húmeda', 'exacta'];
  const SUS = ['prueba', 'señal', 'copia', 'caja', 'sonda', 'orilla', 'esfera', 'retícula', 'huella', 'demora', 'vuelta', 'astilla'];

  /* entropía para acuñar una semilla nueva. esto NO es una decisión de
     composición: es la firma inicial. una vez firmada, todo lo demás se
     deriva de ella y no vuelve a haber azar en la pieza. */
  function entropia() {
    const c = (typeof crypto !== 'undefined' && crypto.getRandomValues)
      ? crypto.getRandomValues(new Uint32Array(1))[0] : 0;
    const t = Date.now() >>> 0;
    const p = (typeof performance !== 'undefined' ? Math.floor(performance.now() * 1000) : 0) >>> 0;
    return (c ^ t ^ (p << 7)) >>> 0;
  }

  function nueva() {
    const r = util(mulberry32(entropia()));
    return r.pick(SUS) + '-' + r.pick(ADJ) + '-' + r.i(100, 999);
  }

  /* la semilla viaja en la URL: compartir una URL comparte el mundo. */
  function deLaUrl(busqueda) {
    let q = busqueda;
    if (q === undefined && typeof location !== 'undefined') q = location.search;
    const m = /[?&]seed=([^&]+)/.exec(q || '');
    return m ? decodeURIComponent(m[1]) : null;
  }

  const API = { hash32, rng, make, nueva, mulberry32, deLaUrl, ADJ, SUS };

  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.rng = API;
  if (typeof module === 'object' && module.exports) module.exports = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
