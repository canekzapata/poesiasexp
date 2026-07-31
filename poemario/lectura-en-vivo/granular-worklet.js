/* VIDA MEDIA · EN VIVO — granular-worklet.js
   El búfer circular de R-27. Conserva ocho segundos de la señal y
   devuelve fragmentos Hann superpuestos. No usa samples ni red. */

"use strict";

/* La ventana Hann se tabula una vez. Calcularla con Math.cos por grano
   y por muestra era medio millón de cosenos por segundo dentro del hilo
   de audio: exactamente el gasto que produce los cortes. */
const VENTANA_N = 2048;
const VENTANA = new Float32Array(VENTANA_N + 1);
for (let i = 0; i <= VENTANA_N; i++) {
  VENTANA[i] = 0.5 - 0.5 * Math.cos(Math.PI * 2 * (i / VENTANA_N));
}

/* Un tope de granos vivos: por encima de esto el cuadro deja de ser
   polvo y se vuelve ruido caro. */
const MAX_GRANOS = 28;

class R27GranularProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "density", defaultValue: 0, minValue: 0, maxValue: 28, automationRate: "k-rate" },
      { name: "grainSize", defaultValue: 0.22, minValue: 0.035, maxValue: 0.8, automationRate: "k-rate" },
      { name: "delay", defaultValue: 3.6, minValue: 0.04, maxValue: 7.5, automationRate: "k-rate" },
      { name: "jitter", defaultValue: 1.4, minValue: 0, maxValue: 3, automationRate: "k-rate" },
      { name: "pitch", defaultValue: -5, minValue: -18, maxValue: 18, automationRate: "k-rate" },
      { name: "spread", defaultValue: 0.9, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "feedback", defaultValue: 0.16, minValue: 0, maxValue: 0.72, automationRate: "k-rate" },
      { name: "freeze", defaultValue: 0, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  constructor(options) {
    super();
    const segundos = Math.max(2, Math.min(12,
      (options.processorOptions && options.processorOptions.seconds) || 8));
    this.length = Math.ceil(sampleRate * segundos);
    this.memoria = [new Float32Array(this.length), new Float32Array(this.length)];
    this.write = 0;
    this.llena = 0;
    this.granos = [];
    this.pool = [];
    this.hastaSiguiente = 0;
    this.rng = 0x27c0ffee;
    this.env = 0;
    this.ultimoL = 0;
    this.ultimoR = 0;

    this.port.onmessage = (evento) => {
      const d = evento.data || {};
      if (d.type === "seed") this.rng = (d.value >>> 0) || 0x27c0ffee;
      if (d.type === "clear") {
        this.memoria[0].fill(0);
        this.memoria[1].fill(0);
        for (const grano of this.granos) {
          if (this.pool.length < MAX_GRANOS) this.pool.push(grano);
        }
        this.granos.length = 0;
        this.write = 0;
        this.llena = 0;
        this.hastaSiguiente = 0;
        this.env = 0;
        this.ultimoL = 0;
        this.ultimoR = 0;
      }
    };
  }

  azar() {
    let x = this.rng;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rng = x >>> 0;
    return this.rng / 4294967296;
  }

  envuelve(pos) {
    pos %= this.length;
    return pos < 0 ? pos + this.length : pos;
  }

  lee(canal, pos) {
    const a = Math.floor(pos);
    const b = (a + 1) % this.length;
    const f = pos - a;
    return this.memoria[canal][a] * (1 - f) + this.memoria[canal][b] * f;
  }

  creaGrano(tamaño, retardo, jitter, pitch, spread, densidad) {
    if (this.granos.length >= MAX_GRANOS || this.llena < sampleRate * 0.25) return;
    const duración = Math.max(64, Math.floor(sampleRate * tamaño * (0.72 + this.azar() * 0.56)));
    const historia = this.llena / sampleRate;
    const detrásDeseado = Math.max(tamaño * 1.25,
      retardo + (this.azar() * 2 - 1) * jitter);
    /* Nunca apuntar a la zona del búfer que aún no se ha escrito. */
    const detrás = Math.max(0.02, Math.min(detrásDeseado, historia - 0.02));
    const paneo = (this.azar() * 2 - 1) * spread;
    const ángulo = (paneo + 1) * Math.PI * 0.25;
    const velocidad = Math.pow(2, (pitch + (this.azar() * 2 - 1) * 1.2) / 12);
    const solape = Math.max(1, densidad * tamaño);

    const grano = this.pool.pop() || {};
    grano.edad = 0;
    grano.duración = duración;
    grano.pasoVentana = VENTANA_N / duración;
    grano.inicio = this.envuelve(this.write - detrás * sampleRate);
    grano.velocidad = velocidad;
    grano.l = Math.cos(ángulo);
    grano.r = Math.sin(ángulo);
    grano.amplitud = Math.min(0.72, 0.9 / Math.sqrt(solape));
    this.granos.push(grano);
  }

  process(inputs, outputs, params) {
    const entrada = inputs[0] || [];
    const salida = outputs[0];
    if (!salida || !salida.length) return true;
    const inL = entrada[0];
    const inR = entrada[1] || inL;
    const outL = salida[0];
    const outR = salida[1] || outL;
    /* Todos los parámetros son k-rate: se leen una vez por bloque, no
       una vez por cada muestra de audio. */
    const densidad = params.density[0];
    const tamaño = params.grainSize[0];
    const retardo = params.delay[0];
    const jitter = params.jitter[0];
    const pitch = params.pitch[0];
    const spread = params.spread[0];
    const feedback = params.feedback[0];
    const freeze = params.freeze[0] > 0.5;
    const silencioso = densidad <= 0.01 && this.granos.length === 0;
    if (densidad <= 0.01) {
      this.hastaSiguiente = 0;
    } else {
      /* Si la densidad está subiendo, acotar el contador antiguo evita
         heredar un intervalo de ~5 s calculado al inicio de la rampa. */
      const intervaloMáximo = sampleRate / Math.max(0.2, densidad) * 1.34;
      this.hastaSiguiente = Math.min(this.hastaSiguiente, intervaloMáximo);
    }

    /* Camino corto: dieciséis de los diecisiete cuadros no piden granos y
       aun así el búfer debe seguir recordando. Ahí no hace falta ni
       envolvente por muestra ni realimentación: sólo escribir memoria.
       Es el estado normal de la pieza, y ahora casi no cuesta. */
    if (silencioso) {
      this.ultimoL = 0;
      this.ultimoR = 0;
      outL.fill(0);
      if (outR !== outL) outR.fill(0);
      let pico = 0;
      if (!freeze) {
        const memL = this.memoria[0];
        const memR = this.memoria[1];
        const largo = this.length;
        let w = this.write;
        for (let i = 0; i < outL.length; i++) {
          const l = inL ? inL[i] || 0 : 0;
          const r = inR ? inR[i] || 0 : l;
          if (l > pico) pico = l; else if (-l > pico) pico = -l;
          memL[w] = l < -1 ? -1 : (l > 1 ? 1 : l);
          memR[w] = r < -1 ? -1 : (r > 1 ? 1 : r);
          w = w + 1 === largo ? 0 : w + 1;
        }
        this.write = w;
        this.llena = Math.min(largo, this.llena + outL.length);
      }
      /* el seguidor se actualiza una vez por bloque: cuando el cuadro
         despierte encontrará una envolvente aproximada, no una de hace
         medio minuto */
      this.env += (pico - this.env) * (pico > this.env ? 0.28 : 0.02);
      return true;
    }

    for (let i = 0; i < outL.length; i++) {
      const l = inL ? inL[i] || 0 : 0;
      const r = inR ? inR[i] || 0 : l;
      const amplitudEntrada = Math.max(Math.abs(l), Math.abs(r));
      this.env += (amplitudEntrada - this.env) *
        (amplitudEntrada > this.env ? 0.035 : 0.0008);

      if (!freeze) {
        this.memoria[0][this.write] = Math.max(-1, Math.min(1, l + this.ultimoL * feedback));
        this.memoria[1][this.write] = Math.max(-1, Math.min(1, r + this.ultimoR * feedback));
        this.write = (this.write + 1) % this.length;
        this.llena = Math.min(this.length, this.llena + 1);
      }

      if (densidad > 0.01) {
        this.hastaSiguiente -= 1;
        if (this.hastaSiguiente <= 0) {
          this.creaGrano(tamaño, retardo, jitter, pitch, spread, densidad);
          const densidadViva = densidad * (0.22 + Math.min(1, this.env * 7) * 1.3);
          const deriva = 0.72 + this.azar() * 0.62;
          this.hastaSiguiente = sampleRate / Math.max(0.2, densidadViva) * deriva;
        }
      }

      let polvoL = 0;
      let polvoR = 0;
      for (let g = 0; g < this.granos.length; g++) {
        const grano = this.granos[g];
        if (grano.edad >= grano.duración) continue;
        const ventana = VENTANA[(grano.edad * grano.pasoVentana) | 0];
        const pos = this.envuelve(grano.inicio + grano.edad * grano.velocidad);
        polvoL += this.lee(0, pos) * ventana * grano.l * grano.amplitud;
        polvoR += this.lee(1, pos) * ventana * grano.r * grano.amplitud;
        grano.edad += 1;
      }

      this.ultimoL = Math.tanh(polvoL);
      this.ultimoR = Math.tanh(polvoR);
      outL[i] = this.ultimoL;
      if (outR !== outL) outR[i] = this.ultimoR;
    }
    /* Compactación in-place: evita crear cientos de arreglos por segundo
       dentro del hilo de audio. Los objetos terminados se reutilizan. */
    let vivos = 0;
    for (let i = 0; i < this.granos.length; i++) {
      const grano = this.granos[i];
      if (grano.edad < grano.duración) {
        this.granos[vivos++] = grano;
      } else if (this.pool.length < MAX_GRANOS) {
        this.pool.push(grano);
      }
    }
    this.granos.length = vivos;
    return true;
  }
}

registerProcessor("r27-granular", R27GranularProcessor);
