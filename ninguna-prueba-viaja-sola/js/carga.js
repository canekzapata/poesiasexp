'use strict';
/* carga ordenada de los módulos. async=false conserva el orden de
   ejecución; al terminar avisa con el evento npvs:cargado. */
(function () {
  const actual = document.currentScript;
  const base = (actual && actual.getAttribute('data-base')) || './';
  const archivos = [
    'js/seed.js', 'js/events.js', 'js/state.js', 'corpus/fragments.js',
    'js/memory.js', 'js/routes.js', 'js/text.js',
    'js/regimes/codes.js', 'js/regimes/packing.js', 'js/regimes/lattice.js',
    'js/regimes/convex.js',
    'js/narrative.js', 'js/copy.js', 'js/sound.js', 'js/shell.js'
  ];
  let n = 0, fallo = false;
  archivos.forEach(function (f) {
    const e = document.createElement('script');
    e.src = base + f;
    e.async = false;
    e.onload = function () {
      if (++n === archivos.length && !fallo) {
        document.dispatchEvent(new CustomEvent('npvs:cargado'));
      }
    };
    e.onerror = function () {
      fallo = true;
      console.error('[npvs] no se pudo cargar', f);
      document.documentElement.classList.add('npvs-sin-motor');
    };
    document.head.appendChild(e);
  });
})();
