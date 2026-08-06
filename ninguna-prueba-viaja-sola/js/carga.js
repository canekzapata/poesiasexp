'use strict';
/* carga ordenada de los módulos. async=false conserva el orden de
   ejecución; al terminar avisa con el evento npvs:cargado.

   si un módulo no llega, se reintenta una vez; si tampoco, el documento
   no puede quedarse sin salidas: se escriben a mano las direcciones
   mínimas. ninguna página de esta obra es un callejón, tampoco cuando
   falla. */
(function () {
  const actual = document.currentScript;
  const base = (actual && actual.getAttribute('data-base')) || './';
  const archivos = [
    'js/seed.js', 'js/events.js', 'js/state.js', 'corpus/fragments.js',
    'js/memory.js', 'js/routes.js', 'js/text.js',
    'js/regimes/codes.js', 'js/regimes/packing.js', 'js/regimes/lattice.js',
    'js/regimes/convex.js', 'js/regimes/circuits.js', 'js/regimes/extremal.js',
    'js/narrative.js', 'js/copy.js', 'js/espectro.js', 'js/voces.js', 'js/sound.js', 'js/shell.js'
  ];
  let n = 0, roto = false;

  /* con la caché caliente los módulos pueden ejecutarse en una pausa del
     analizador, antes de que la página haya registrado su oyente: el aviso
     se dispararía sin nadie escuchando y el documento quedaría sin
     inicializar. por eso se vuelve a avisar cuando el documento termina de
     analizarse. `shell.iniciar` es idempotente, así que avisar dos veces no
     duplica nada. */
  window.__npvsCargado = false;
  function avisar() {
    window.__npvsCargado = true;
    document.dispatchEvent(new CustomEvent('npvs:cargado'));
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        document.dispatchEvent(new CustomEvent('npvs:cargado'));
      }, { once: true });
    }
  }

  function pedir(f, reintento) {
    const e = document.createElement('script');
    e.src = base + f + (reintento ? '?r=1' : '');
    e.async = false;
    e.onload = function () {
      if (++n === archivos.length && !roto) avisar();
    };
    e.onerror = function () {
      if (!reintento) { console.warn('[npvs] reintentando', f); pedir(f, true); return; }
      roto = true;
      console.error('[npvs] no se pudo cargar', f);
      document.documentElement.classList.add('npvs-sin-motor');
      salidaDeEmergencia(f);
    };
    document.head.appendChild(e);
  }

  /* el aparato falló, pero la dirección sigue existiendo */
  let puesta = false;
  function salidaDeEmergencia(f) {
    if (puesta) return;
    puesta = true;
    const poner = function () {
      const nav = document.querySelector('[data-salidas]') || document.body;
      const aviso = document.createElement('p');
      aviso.className = 'error-util';
      aviso.textContent = 'el aparato no cargó (' + f + '). la señal sigue distribuida en estas direcciones:';
      const ul = document.createElement('ul');
      ul.className = 'salidas-lista';
      [['index.html', 'umbral'], ['mapa.html', 'mapa incompleto'],
       ['paginas/bitacora.html', 'bitácora'], ['certificado.html', 'certificado']]
        .forEach(function (par) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'salida';
          a.href = base + par[0] + window.location.search;
          a.textContent = par[1];
          li.appendChild(a); ul.appendChild(li);
        });
      nav.appendChild(aviso); nav.appendChild(ul);
    };
    if (document.body) poner();
    else document.addEventListener('DOMContentLoaded', poner);
  }

  archivos.forEach(function (f) { pedir(f, false); });
})();
