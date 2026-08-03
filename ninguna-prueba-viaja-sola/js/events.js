'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — events.js
   bus de acontecimientos, registro de limpieza y detección de inactividad.
   ninguna animación sobrevive a la página que la pidió.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const subs = Object.create(null);
  const listeners = [];   // [target, type, fn, opts]
  const rafs = new Set();
  const timers = new Set();
  let vivo = true;

  function on(tipo, fn) {
    (subs[tipo] = subs[tipo] || []).push(fn);
    return () => off(tipo, fn);
  }
  function off(tipo, fn) {
    const a = subs[tipo]; if (!a) return;
    const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1);
  }
  function emit(tipo, datos) {
    const a = subs[tipo];
    if (a) for (const fn of a.slice()) { try { fn(datos, tipo); } catch (e) { console.warn('[npvs] oyente', tipo, e); } }
    const c = subs['*'];
    if (c) for (const fn of c.slice()) { try { fn(datos, tipo); } catch (e) { /* silencio */ } }
  }

  /* listeners con memoria de su propia retirada */
  function listen(target, type, fn, opts) {
    if (!target) return () => {};
    target.addEventListener(type, fn, opts);
    listeners.push([target, type, fn, opts]);
    return () => {
      target.removeEventListener(type, fn, opts);
      const i = listeners.findIndex(l => l[0] === target && l[1] === type && l[2] === fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* bucle de animación que se detiene solo al abandonar la página */
  function loop(fn) {
    let id = 0;
    const paso = (t) => {
      if (!vivo) return;
      id = requestAnimationFrame(paso);
      rafs.add(id);
      try { fn(t); } catch (e) { console.warn('[npvs] ciclo', e); cancel(); }
    };
    id = requestAnimationFrame(paso);
    rafs.add(id);
    const cancel = () => { cancelAnimationFrame(id); rafs.delete(id); };
    return cancel;
  }

  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); if (vivo) fn(); }, ms);
    timers.add(id);
    return () => { clearTimeout(id); timers.delete(id); };
  }
  function every(fn, ms) {
    const id = setInterval(() => { if (vivo) fn(); }, ms);
    timers.add(id);
    return () => { clearInterval(id); timers.delete(id); };
  }

  function destruir() {
    vivo = false;
    for (const [t, ty, fn, o] of listeners.splice(0)) { try { t.removeEventListener(ty, fn, o); } catch (e) {} }
    for (const id of rafs) cancelAnimationFrame(id);
    rafs.clear();
    for (const id of timers) { clearTimeout(id); clearInterval(id); }
    timers.clear();
  }

  /* ---- inactividad: la excavación continúa sin el visitante -------- */
  const quieto = { desde: Date.now(), umbrales: [], disparados: new Set() };

  function marcarActividad() {
    quieto.desde = Date.now();
    if (quieto.disparados.size) {
      quieto.disparados.clear();
      emit('actividad', {});
    }
  }

  function inactividad(segundos, fn) {
    quieto.umbrales.push({ s: segundos, fn: fn });
  }

  function iniciarInactividad() {
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'focusin']
      .forEach(t => listen(window, t, marcarActividad, { passive: true }));
    every(() => {
      const s = (Date.now() - quieto.desde) / 1000;
      for (const u of quieto.umbrales) {
        if (s >= u.s && !quieto.disparados.has(u)) {
          quieto.disparados.add(u);
          emit('inaccion', { segundos: u.s });
          try { u.fn(s); } catch (e) { console.warn('[npvs] inactividad', e); }
        }
      }
    }, 500);
  }

  N.bus = {
    on, off, emit, listen, loop, later, every,
    destruir, inactividad, iniciarInactividad, marcarActividad,
    ociosoDesde: () => (Date.now() - quieto.desde) / 1000,
    get vivo() { return vivo; }
  };

  window.addEventListener('pagehide', destruir);
  window.addEventListener('beforeunload', destruir);

})(window.NPVS);
