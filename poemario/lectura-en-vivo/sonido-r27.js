/* VIDA MEDIA · EN VIVO — sonido-r27.js
   R-27, la voz de formantes: dos bandas resonantes sobre una sierra, un
   ruido filtrado para las consonantes, y una cola de escritura corta.

   La lectura no se programa entera de golpe. Se escribe poco más de un
   segundo por delante y se rellena cada 180 ms: así una frase larga no
   deja centenares de eventos clavados en la línea de tiempo de WebAudio
   —que es justamente lo que el navegador cobra en forma de tirón. */

"use strict";

const R27 = (() => {
  const HORIZONTE = 1.15;      // segundos escritos por adelantado
  const INTERVALO = 180;       // ms entre rellenos
  const CABEZA = 0.12;         /* margen antes del primer fonema: si el
                                  hilo principal se atora justo aquí, los
                                  eventos siguen cayendo en el futuro */

  const FORMANTES = { a: [700, 1200], e: [450, 1900], i: [300, 2300], o: [450, 800], u: [325, 700] };
  const CONSONANTES = {
    tono: { m: 250, n: 300, ñ: 350, l: 400, b: 300, d: 350, g: 400, v: 300, r: 380, y: 300, w: 325 },
    ruido: { s: 6000, z: 5500, f: 4500, j: 2500, x: 5000, c: 4800, h: 0 },
    clic: ["p", "t", "k", "q"],
  };

  let listo = false;
  let src, f1, f2, vGain, noi, cFilt, cGain, salida;
  let lectura = 0, timer = null, caracteres = "", indice = 0, cursor = 0, freza = 1;

  function construir(destinoVocoder, destinoDirecto) {
    if (listo) return;
    src = new Tone.Oscillator({ type: "sawtooth", frequency: 110 }).start();
    f1 = new Tone.Filter({ frequency: 700, type: "bandpass", Q: 7 });
    f2 = new Tone.Filter({ frequency: 1200, type: "bandpass", Q: 8 });
    src.connect(f1);
    src.connect(f2);
    vGain = new Tone.Gain(0);
    f1.connect(vGain);
    f2.connect(vGain);
    noi = new Tone.Noise("white").start();
    cFilt = new Tone.Filter({ frequency: 4000, type: "bandpass", Q: 2 });
    noi.connect(cFilt);
    cGain = new Tone.Gain(0);
    cFilt.connect(cGain);
    salida = new Tone.Gain(2.2);
    vGain.connect(salida);
    cGain.connect(salida);
    salida.connect(destinoVocoder);        // R-27 también pasa por el vocoder
    const directo = new Tone.Gain(0.3);
    salida.connect(directo);
    directo.connect(destinoDirecto);
    listo = true;
  }

  function limpiaCola() {
    clearTimeout(timer);
    timer = null;
    if (!listo) return;
    const t = AUDIO.ahora();
    AUDIO.cancelaParametro(vGain.gain, t, true);
    AUDIO.cancelaParametro(cGain.gain, t, true);
    for (const p of [f1.frequency, f2.frequency, src.frequency, cFilt.frequency, cFilt.Q]) {
      AUDIO.cancelaParametro(p, t, false);
    }
    vGain.gain.linearRampToValueAtTime(0, t + 0.035);
    cGain.gain.linearRampToValueAtTime(0, t + 0.035);
  }

  function programaCaracter(c, t, f) {
    if (FORMANTES[c]) {
      const [F1, F2] = FORMANTES[c];
      const dur = 0.1 * f;
      f1.frequency.setValueAtTime(F1, t);
      f2.frequency.setValueAtTime(F2, t);
      src.frequency.setValueAtTime(105 + AZAR.caos() * 12, t);
      vGain.gain.setValueAtTime(0, t);
      vGain.gain.linearRampToValueAtTime(0.6, t + 0.02);
      vGain.gain.setValueAtTime(0.6, t + dur - 0.03);
      vGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.012;
    }
    if (CONSONANTES.tono[c]) {
      const dur = 0.06 * f;
      f1.frequency.setValueAtTime(CONSONANTES.tono[c], t);
      f2.frequency.setValueAtTime(CONSONANTES.tono[c] * 2.4, t);
      vGain.gain.setValueAtTime(0, t);
      vGain.gain.linearRampToValueAtTime(0.35, t + 0.015);
      vGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.01;
    }
    if (CONSONANTES.ruido[c] !== undefined) {
      if (CONSONANTES.ruido[c] === 0) return t + 0.02;   // la h no suena
      const dur = 0.07 * f;
      cFilt.frequency.setValueAtTime(CONSONANTES.ruido[c], t);
      cFilt.Q.setValueAtTime(2, t);
      cGain.gain.setValueAtTime(0, t);
      cGain.gain.linearRampToValueAtTime(0.5, t + 0.01);
      cGain.gain.linearRampToValueAtTime(0, t + dur);
      return t + dur + 0.01;
    }
    if (CONSONANTES.clic.includes(c)) {
      cFilt.frequency.setValueAtTime(1500, t);
      cFilt.Q.setValueAtTime(0.5, t);
      cGain.gain.setValueAtTime(0, t);
      cGain.gain.linearRampToValueAtTime(0.7, t + 0.004);
      cGain.gain.linearRampToValueAtTime(0, t + 0.025);
      return t + 0.045 * f;
    }
    if (c === " ") return t + 0.09 * f;
    if (c === "," || c === ";") return t + 0.28 * f;
    if (c === "." || c === ":") return t + 0.46 * f;
    return t;
  }

  function programaTramo(mi) {
    if (mi !== lectura || !listo || ESTADO.panico) return;
    const horizonte = AUDIO.ahora() + HORIZONTE;
    while (indice < caracteres.length && cursor < horizonte) {
      cursor = programaCaracter(caracteres[indice], cursor, freza);
      indice += 1;
    }
    timer = indice < caracteres.length
      ? setTimeout(() => programaTramo(mi), INTERVALO)
      : null;
  }

  function leer(texto) {
    if (!listo || ESTADO.panico) return;
    AUDIO.asegurarContexto();
    lectura += 1;
    const mi = lectura;
    limpiaCola();
    caracteres = String(texto || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ").slice(0, 600);
    indice = 0;
    freza = 1 + (1 - pila()) * 0.8;   // con poca pila lee más despacio
    cursor = AUDIO.ahora() + CABEZA;
    if (caracteres) programaTramo(mi);
  }

  function callar() {
    if (!listo) return;
    lectura += 1;
    limpiaCola();
  }

  return { construir, leer, callar, get listo() { return listo; } };
})();
