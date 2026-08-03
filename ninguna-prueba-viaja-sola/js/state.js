'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — state.js
   la URL es parte del aparato: lleva semilla, profundidad y la vía por la
   que se entró. pushState escribe los cambios internos; el botón Atrás
   los deshace de verdad.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const url = new URL(window.location.href);
  const q = url.searchParams;

  let semilla = q.get('seed');
  let semillaNueva = false;
  if (!semilla) { semilla = N.seed.nueva(); semillaNueva = true; }

  const estado = {
    semilla: semilla,
    z: parseInt(q.get('z') || '0', 10) || 0,      // profundidad del recorrido
    via: q.get('v') || 'directa',                  // por dónde se entró
    n: q.get('n') || null,                         // nodo interno
    nueva: semillaNueva
  };

  /* raíz relativa: las páginas viven en paginas/, el umbral no */
  const enPaginas = /\/paginas\//.test(window.location.pathname);
  const base = enPaginas ? '../' : './';

  function href(archivo, extra) {
    const u = archivo.indexOf('http') === 0 ? new URL(archivo) : new URL(base + archivo, window.location.href);
    u.searchParams.set('seed', estado.semilla);
    u.searchParams.set('z', String(estado.z + 1));
    if (extra) for (const k in extra) { if (extra[k] == null) u.searchParams.delete(k); else u.searchParams.set(k, extra[k]); }
    return u.pathname + u.search + u.hash;
  }

  /* la semilla escrita en la barra sin recargar: el mundo queda compartible */
  function fijarSemillaEnURL() {
    if (!semillaNueva) return;
    const u = new URL(window.location.href);
    u.searchParams.set('seed', estado.semilla);
    u.searchParams.set('z', String(estado.z));
    history.replaceState(historyPayload('umbral'), '', u.pathname + u.search);
    semillaNueva = false;
  }

  function historyPayload(marca, extra) {
    return Object.assign({ npvs: true, semilla: estado.semilla, marca: marca, z: estado.z }, extra || {});
  }

  /* un cambio interno con rastro: la obra empuja estado, el navegador lo devuelve */
  function empujar(marca, extra, fragmento) {
    const u = new URL(window.location.href);
    if (fragmento) u.hash = fragmento;
    if (extra) for (const k in extra) u.searchParams.set(k, extra[k]);
    try { history.pushState(historyPayload(marca, extra), '', u.pathname + u.search + u.hash); }
    catch (e) { /* file:// puede negarse; la obra sigue */ }
  }

  function alVolver(fn) {
    window.addEventListener('popstate', (ev) => {
      const s = ev.state && ev.state.npvs ? ev.state : null;
      try { fn(s, new URL(window.location.href).searchParams); } catch (e) { console.warn('[npvs] popstate', e); }
    });
  }

  N.estado = estado;
  N.url = { href, base, fijarSemillaEnURL, empujar, alVolver, params: q };

})(window.NPVS);
