/* VIDA MEDIA · EN VIVO — rendimiento.js
   El vigía de la fluidez.

   El audio de esta consola no vive sólo en el hilo de audio: el
   planificador de Tone, la lectura de R-27 y las secuencias musicales se
   escriben desde el hilo principal. Cuando el canvas, hydra y el DOM se
   comen un cuadro largo, esa escritura llega tarde y la música se traba.
   Aquí se mide ese atoro y se avisa a las capas visuales para que
   aflojen antes de que el sonido lo pague.

   No se mide contra sesenta cuadros por segundo: un proyector a treinta
   hercios no está ahogado, sólo va a treinta. Se mide contra el propio
   ritmo de la pantalla —el cuadro más corto de la ventana— y se cuentan
   los que se salen de él. Así el veredicto es «esta máquina se atora»,
   no «esta pantalla es lenta».

   Tres niveles, con histéresis para que no oscile en escena:
     0 · holgado   — todo como está escrito
     1 · apretado  — menos estrellas, hydra más lenta
     2 · ligero    — el mínimo digno: la pieza sigue, el audio manda

   `?ligero` lo fija desde el arranque (proyector viejo, laptop cansada). */

"use strict";

const RENDIMIENTO = (() => {
  const forzado = new URLSearchParams(location.search).has("ligero");
  const VENTANA = 2500;        // ms de observación por veredicto
  const MUESTRAS = 512;        // cuadros guardados por ventana
  const MINIMO = 8;            /* menos cuadros que esto no es evidencia. Es
                                  bajo a propósito: si la máquina va tan mal
                                  que sólo entrega ocho cuadros en dos segundos
                                  y medio, eso ya es el diagnóstico */
  const ABANDONO = 3000;       // gap mayor a esto es pestaña dormida, no atoro
  const HOLGURA = 1.8;         // veces el ritmo natural antes de contar tirón
  const PISO_MS = 20;          // nunca acusar por debajo de esto
  const LENTA_MS = 40;         // ritmo sostenido peor que esto ya es atoro
  const SANA_MS = 30;          // y por debajo de esto se puede recuperar
  const SUBE = 0.30;           // fracción de cuadros con tirón que degrada
  const BAJA = 0.08;           // fracción que permite recuperar calidad
  const GRACIA = 8000;         // ms de arranque sin veredicto
  const CALMA = 20000;         // ms antes de volver a exigirle a la GPU
  const RECAIDAS = 2;          // veces que se cae a un nivel antes de quedarse

  const deltas = new Float32Array(MUESTRAS);
  let cuantos = 0;
  let nivel = forzado ? 2 : 0;
  let ultimo = 0;
  let ventanaInicio = 0;
  let arranque = 0;
  let ultimoCambio = 0;
  /* Degradar arregla el síntoma, y entonces la consola parece sana otra
     vez: si se recupera sin más, vuelve a ahogarse y el ciclo no termina.
     Después de caer dos veces al mismo nivel, ese nivel se vuelve el
     techo de la corrida. Un cielo pobre y estable es mejor función que
     uno que cambia de resolución cada minuto. */
  const recaidas = [0, 0, 0];
  let techo = 0;
  const oyentes = [];

  /* ── el reloj de audio contra el reloj de pared ──
     La medida honesta de un corte. El reloj de audio sólo avanza con las
     muestras que de verdad se rindieron: si el hilo de audio no alcanzó,
     se queda atrás del reloj de pared y ese retraso es exactamente el
     sonido que no se oyó.

     Un atoro del hilo principal NO ensucia esta cuenta: si el muestreo
     llega tarde, los dos relojes llegan tarde por igual. Aquí sólo
     aparecen los cortes reales. */
  let reloj = null;
  const audio = { derivaMs: 0, cortes: 0, peorMs: 0, midiendo: false };
  const CORTE_MS = 12;         // menos que esto es jitter del muestreo
  let cortesVistos = 0;

  function vigilaAudio(ac) {
    if (reloj || !ac) return;
    let ta = ac.currentTime;
    let tp = performance.now();
    audio.midiendo = true;
    reloj = setInterval(() => {
      if (ac.state !== "running") { ta = ac.currentTime; tp = performance.now(); return; }
      const a = ac.currentTime;
      const p = performance.now();
      const falta = (p - tp) / 1000 - (a - ta);
      ta = a; tp = p;
      const ms = falta * 1000;
      if (ms > CORTE_MS) {
        audio.cortes += 1;
        audio.derivaMs += ms;
        if (ms > audio.peorMs) audio.peorMs = ms;
      }
    }, 500);
  }

  function olvidaAudio() {
    audio.cortes = 0;
    audio.derivaMs = 0;
    audio.peorMs = 0;
    cortesVistos = 0;
  }

  function cambia(nuevo) {
    if (nuevo === nivel) return;
    nivel = nuevo;
    ultimoCambio = performance.now();
    for (const fn of oyentes) {
      try { fn(nivel); } catch (e) { console.warn("rendimiento: un oyente falló", e); }
    }
  }

  function veredicto(t) {
    const n = Math.min(cuantos, MUESTRAS);
    cuantos = 0;
    ventanaInicio = t;
    if (forzado || n < MINIMO || t - arranque < GRACIA) return;
    /* La mediana es el ritmo natural de esta pantalla —no el mínimo, que
       cualquier cuadro rebotado después de un tirón deja por los suelos. */
    const orden = deltas.subarray(0, n);
    orden.sort();
    const ritmo = orden[n >> 1];
    const umbral = Math.max(PISO_MS, ritmo * HOLGURA);
    let tirones = 0;
    for (let i = n - 1; i >= 0 && orden[i] > umbral; i--) tirones += 1;
    const fraccion = tirones / n;
    /* Dos maneras de estar ahogado: muchos tirones sueltos, o un ritmo
       sostenido tan bajo que ya no queda margen para nada. */
    /* Un corte de audio pesa más que cualquier medida de cuadros: es el
       síntoma que se vino a curar, no un indicio de él. */
    const cortesNuevos = audio.cortes - cortesVistos;
    cortesVistos = audio.cortes;
    const ahogada = cortesNuevos > 0 || fraccion > SUBE || ritmo > LENTA_MS;
    const sana = cortesNuevos === 0 && fraccion < BAJA && ritmo < SANA_MS;
    /* Degradar es urgente; recuperar puede esperar. */
    if (ahogada && nivel < 2) {
      const nuevo = nivel + 1;
      recaidas[nuevo] += 1;
      if (recaidas[nuevo] >= RECAIDAS) techo = Math.max(techo, nuevo);
      cambia(nuevo);
    } else if (sana && nivel > techo && t - ultimoCambio > CALMA) {
      cambia(nivel - 1);
    }
  }

  /* NAVE ya tiene un requestAnimationFrame por cuadro: se aprovecha ese
     latido en vez de abrir otro bucle que compita con él. */
  function marca() {
    const t = performance.now();
    if (!arranque) { arranque = t; ventanaInicio = t; ultimo = t; return; }
    const delta = t - ultimo;
    ultimo = t;
    /* Un salto de varios segundos es una pestaña que volvió del fondo,
       no una consola ahogada: eso sí se descarta. */
    if (delta > 0 && delta < ABANDONO) {
      if (cuantos < MUESTRAS) deltas[cuantos] = delta;
      cuantos += 1;
    }
    if (t - ventanaInicio >= VENTANA) veredicto(t);
  }

  function alCambiar(fn) {
    oyentes.push(fn);
    return fn;
  }

  const ETIQUETAS = ["holgado", "apretado", "ligero"];

  return {
    marca, alCambiar, vigilaAudio, olvidaAudio,
    get audio() { return audio; },
    get nivel() { return nivel; },
    get ligero() { return nivel >= 2; },
    get apretado() { return nivel >= 1; },
    get etiqueta() { return ETIQUETAS[nivel]; },
    get forzado() { return forzado; },
  };
})();
