/* VIDA MEDIA · EN VIVO — sonido-nucleo.js
   Lo que todas las capas de audio comparten: el contexto, los helpers
   de parámetro, la lectura de medidores y las cachés de nota.

   Aquí no vive ningún nodo del grafo. Es el taller, no el instrumento.
   Separarlo permite que sonido.js vuelva a ser una mesa de mezclas y
   no un archivo de mil quinientas líneas donde todo se toca. */

"use strict";

const AUDIO = (() => {
  const parametros = new URLSearchParams(location.search);

  function entero(nombre, defecto, min, max) {
    const v = parseInt(parametros.get(nombre), 10);
    if (!Number.isFinite(v)) return defecto;
    return Math.max(min, Math.min(max, v));
  }

  /* ── opciones de escenario ──
     bandas: el ancho del vocoder. Dieciocho —el timbre original— pesan
       hoy menos que ocho antes de pasar el banco a nodos nativos, así
       que vuelven a ser el default. Bajarlo sigue siendo la concesión
       más barata si una máquina no da.
     latencia: cuánto se adelanta el planificador de Tone. Subirla no
       retrasa el micro (ese camino es nativo): sólo da margen a la
       música programada cuando el hilo principal se atora.
     ligero: fuerza el modo de bajo consumo desde el arranque. */
  const opciones = {
    bandas: entero("bandas", 18, 8, 20),
    latenciaMs: entero("latencia", 200, 60, 500),
    ligero: parametros.has("ligero"),
  };

  function hash(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ── el contexto ── */

  function contextoTone() {
    return typeof Tone.getContext === "function" ? Tone.getContext() : Tone.context;
  }

  function contextoCrudo() {
    const c = contextoTone();
    return c && (c.rawContext || c._context || c);
  }

  function asegurarContexto() {
    const ac = contextoCrudo();
    if (!ac || ac.state === "running" || typeof ac.resume !== "function") return;
    const reanudado = ac.resume();
    if (reanudado && typeof reanudado.catch === "function") {
      reanudado.catch((e) => console.warn("audio: no se pudo reanudar el contexto", e));
    }
  }

  /* El planificador de Tone corre en el hilo principal: si hydra, el
     canvas o el DOM se llevan un cuadro largo, los eventos ya escritos
     con anticipación siguen sonando. Ese margen es la diferencia entre
     una función continua y una que se traba. */
  function ajustaAnticipacion() {
    const c = contextoTone();
    if (!c) return;
    try { c.lookAhead = opciones.latenciaMs / 1000; } catch (e) { /* Tone antiguo */ }
  }

  function ahora() {
    return typeof Tone.immediate === "function" ? Tone.immediate() : Tone.now();
  }

  function cancelaParametro(param, t, sostiene) {
    if (!param) return;
    try {
      if (sostiene && typeof param.cancelAndHoldAtTime === "function") {
        param.cancelAndHoldAtTime(t);
      } else {
        const valor = Number.isFinite(param.value) ? param.value : 0;
        param.cancelScheduledValues(t);
        if (sostiene) param.setValueAtTime(valor, t);
      }
    } catch (e) { /* una cancelación tardía no debe bloquear la consola */ }
  }

  /* Rampa que sirve igual a un AudioParam nativo que a uno de Tone. El
     banco del vocoder está hecho de nodos nativos —ver sonido-vocoder—
     y esos no traen el azúcar de Tone. */
  function rampa(param, valor, segundos) {
    if (!param) return;
    const t = ahora();
    try {
      param.cancelScheduledValues(t);
      param.setValueAtTime(param.value, t);
      param.linearRampToValueAtTime(valor, t + Math.max(0.005, segundos || 0.05));
    } catch (e) {
      try { param.value = valor; } catch (ignorado) { /* nada que hacer */ }
    }
  }

  /* ── cachés de nota ──
     Tone.Frequency parsea cadenas y construye objetos. Dentro de una
     secuencia a semicorcheas eso son decenas de objetos por segundo
     nacidos y muertos en el mismo hilo que planifica el audio: basura
     que el recolector cobra justo cuando peor cae. El dominio es
     minúsculo (siete grados por unas cuantas transposiciones), así que
     se memoriza. */
  const cacheNotas = new Map();
  const cacheFrecuencias = new Map();
  const TOPE_CACHE = 4096;

  function nota(n, semitonos) {
    const t = semitonos || 0;
    const llave = t === 0 ? n : n + "|" + t;
    const guardada = cacheNotas.get(llave);
    if (guardada !== undefined) return guardada;
    const calculada = Tone.Frequency(n).transpose(t).toNote();
    if (cacheNotas.size < TOPE_CACHE) cacheNotas.set(llave, calculada);
    return calculada;
  }

  function frecuencia(n) {
    const guardada = cacheFrecuencias.get(n);
    if (guardada !== undefined) return guardada;
    const calculada = Tone.Frequency(n).toFrequency();
    if (cacheFrecuencias.size < TOPE_CACHE) cacheFrecuencias.set(n, calculada);
    return calculada;
  }

  /* la tríada del grado, subiendo de octava cuando la escala se acaba */
  function triada(esc, grado, extra) {
    const n = (i) => {
      const idx = grado + i;
      return nota(esc[idx % 7], Math.floor(idx / 7) * 12 + (extra || 0));
    };
    return [n(0), n(2), n(4)];
  }

  /* ── medidores ── */

  function amplitudMeter(m) {
    if (!m) return 0;
    const v = m.getValue();
    const lista = typeof v === "number" ? [v] : v;
    let mayor = 0;
    for (const x of lista) if (Number.isFinite(x)) mayor = Math.max(mayor, Math.abs(x));
    return Math.min(1.5, mayor);
  }

  function aDb(v) {
    return 20 * Math.log10(Math.max(0.000001, v));
  }

  function nivelEspectral(valores, desde, hasta, sampleRate) {
    if (!valores || !valores.length || !sampleRate) return 0;
    const nyquist = sampleRate / 2;
    const inicio = Math.max(0, Math.floor(desde / nyquist * valores.length));
    const fin = Math.min(valores.length - 1, Math.ceil(hasta / nyquist * valores.length));
    let suma = 0;
    let n = 0;
    for (let i = inicio; i <= fin; i++) {
      const v = Number.isFinite(valores[i]) ? Math.max(0, valores[i]) : 0;
      suma += v * v;
      n += 1;
    }
    return n ? Math.sqrt(suma / n) : 0;
  }

  return {
    opciones, hash,
    contextoTone, contextoCrudo, asegurarContexto, ajustaAnticipacion,
    ahora, cancelaParametro, rampa,
    nota, frecuencia, triada,
    amplitudMeter, aDb, nivelEspectral,
  };
})();
