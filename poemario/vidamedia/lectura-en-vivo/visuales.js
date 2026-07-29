/* VIDA MEDIA · EN VIVO — visuales.js
   hydra: el espacio. un preset por cuadro. el micro entra a hydra
   como función-parámetro (el puente del prompt, §7). si hydra falta
   o el WebGL falla, la capa se apaga y todo lo demás sigue. */

"use strict";

const VISUALES = (() => {
  let h = null, s = null;
  let activo = false;
  let actual = "plataforma";
  let flashTimer = null;

  /* nivel del micro (0..1): lo llena SONIDO; aquí sólo se lee */
  const ctx = {
    nivel: () => (typeof SONIDO !== "undefined" && SONIDO.listo) ? SONIDO.nivel() : 0,
    pila: () => pila(),
  };

  function iniciar(canvas) {
    if (typeof Hydra === "undefined") {
      console.warn("hydra: sin motor (lib/hydra-synth.js no cargó)");
      return false;
    }
    try {
      /* half-res: es proyector, no retina */
      canvas.width = Math.floor(window.innerWidth / 2);
      canvas.height = Math.floor(window.innerHeight / 2);
      h = new Hydra({ canvas, detectAudio: false, makeGlobal: false, autoLoop: true });
      s = h.synth;
      activo = true;
    } catch (e) {
      console.warn("hydra: no arrancó", e);
      activo = false;
    }
    return activo;
  }

  /* ── presets ── */
  const P = {

    plataforma() { // niebla oscura, casi quieta: la torre espera
      s.noise(1.2, 0.003).thresh(0.6, 0.02)
        .color(0.1, 0.25, 0.18).brightness(-0.06)
        .out(s.o0);
    },

    despegue() { // las estrellas empiezan a correr
      s.osc(60, 0.18, 0).thresh(0.8, 0.02)
        .rotate(1.5708).scrollY(0, -0.4)
        .color(0.5, 0.9, 0.7)
        .modulate(s.noise(3, 0.05), 0.02)
        .out(s.o0);
    },

    scroll() { // TIEMPO CONTINUO: la misma línea con la hora cambiada
      s.osc(24, 0.35, 0).thresh(0.55, 0.05)
        .rotate(1.5708)
        .color(0.4, 0.85, 0.6)
        .brightness(-0.12)
        .out(s.o0);
    },

    telar() { // PARIDAD: trama y urdimbre; el micro aprieta el tejido
      s.osc(() => 60 + ctx.nivel() * 80, 0.02, 0)
        .thresh(0.42, 0.05)
        .add(s.osc(() => 60 + ctx.nivel() * 50, 0.015, 0).thresh(0.42, 0.05).rotate(1.5708), 0.9)
        .color(0.2, 0.5, 0.35)
        .brightness(-0.08)
        .modulate(s.noise(0.8, 0.02), 0.01)
        .out(s.o0);
    },

    planchado() { // CORRECCIÓN: feedback que converge a la frase limpia
      s.src(s.o0)
        .modulate(s.noise(4, 0.2), () => 0.12 * (1 - ctx.nivel()))
        .blend(s.osc(10, 0.06, 0.4).color(0.4, 0.8, 0.6), 0.08)
        .out(s.o0);
    },

    nm() { // LONGITUD DE ONDA: el disco de Newton gira y suma gris
      const t0 = Date.now();
      s.osc(6, 0.05, 1.2)
        .kaleid(8)
        .colorama(0.3)
        .rotate(() => (Date.now() - t0) / 2600)
        .saturate(() => Math.max(0, 1.4 - (Date.now() - t0) / 50000))
        .brightness(-0.12)
        .out(s.o0);
    },

    antenas() { // LA RED: tres platos turnándose la vigilia
      s.shape(3, 0.24, 0.01)
        .repeat(3, 1)
        .rotate(() => Date.now() / 4000 % 6.283)
        .color(0.4, 0.9, 0.7)
        .modulate(s.osc(2, 0.1), 0.05)
        .out(s.o0);
    },

    ondas() { // RELOJ DE ECOS: círculos que rebotan deformados
      s.shape(64, () => 0.2 + ctx.nivel() * 0.5, 0.4)
        .color(0.3, 0.8, 0.6)
        .modulate(s.noise(2, 0.1), 0.08)
        .add(s.src(s.o0).scale(1.06).brightness(-0.06), 0.6)
        .out(s.o0);
    },

    curva() { // VIDA MEDIA: la mitad de la mitad, en luz
      s.osc(4, 0.02, 0.6)
        .brightness(() => -0.35 + ctx.pila() * 0.3)
        .color(0.5, 0.9, 0.7)
        .modulate(s.noise(1.5, 0.02), 0.04)
        .out(s.o0);
    },

    oscura() { // MATERIA OSCURA: casi nada; lo que hay, dobla
      s.noise(2.5, 0.008)
        .thresh(0.92, 0.005)
        .color(0.25, 0.4, 0.4)
        .modulateScale(s.osc(1, 0.03), () => 0.1 + ctx.nivel() * 0.5)
        .out(s.o0);
    },

    niebla() { // LA REGIÓN: sin borde, sin adentro
      s.noise(1.1, 0.014)
        .color(0.35, 0.55, 0.5)
        .brightness(-0.18)
        .modulate(s.noise(0.6, 0.01), 0.3)
        .out(s.o0);
    },

    telar2() { // FILAMENTOS: mil hilos; la voz del poeta los mueve
      s.osc(170, 0.006, 0).thresh(0.3, 0.015)
        .color(0.35, 0.8, 0.6)
        .brightness(-0.06)
        .modulate(s.noise(1.2, 0.05), () => 0.015 + ctx.nivel() * 0.22)
        .mult(s.osc(3, 0.02).brightness(0.35))
        .out(s.o0);
    },

    vacio() { // fondo mínimo para EL NÚMERO y PUNTERO
      s.noise(2, 0.004).thresh(0.85, 0.01)
        .color(0.2, 0.4, 0.3).brightness(-0.1)
        .out(s.o0);
    },

    particulas() { // ESCRIBIR FUERA DE SÍ: polvo que se dispersa
      s.noise(6, 0.06).thresh(0.75, 0.01)
        .color(0.5, 0.9, 0.7)
        .modulateScrollX(s.noise(1, 0.03), 0.06)
        .add(s.src(s.o0).scale(1.01).brightness(-0.04), 0.7)
        .out(s.o0);
    },

    estelas() { // LA OTRA: dos derivas que no se cruzan
      s.osc(5, 0.04, 0.3).thresh(0.6, 0.2)
        .scrollY(0.15, 0.006)
        .add(s.osc(5, -0.03, 1.4).thresh(0.6, 0.2).scrollY(-0.15, -0.004), 0.8)
        .color(0.4, 0.8, 0.7)
        .out(s.o0);
    },

    apagado() { // ACUSE: casi negro; nunca negro del todo
      s.noise(1, 0.002).thresh(0.97, 0.002)
        .color(0.3, 0.5, 0.4)
        .brightness(-0.02)
        .out(s.o0);
    },

    damero() { // PUNTERO: la carta de ajuste (lo que devuelve «casa»)
      s.osc(10, 0, 0).thresh(0.5, 0)
        .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0))
        .add(s.osc(10, 0, 0).thresh(0.5, 0).invert()
          .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0).invert()))
        .color(0.72, 0.72, 0.72)
        .out(s.o0);
    },

    glitchazo() { // la ráfaga (tecla G)
      s.src(s.o0)
        .modulate(s.noise(20, 1), 0.4)
        .scale(() => 1 + AZAR.caos() * 0.2)
        .colorama(2)
        .out(s.o0);
    },
  };

  function preset(nombre) {
    actual = nombre;
    if (!activo || !ESTADO.capas.hydra) return;
    const fn = P[nombre] || P.vacio;
    try { fn(); } catch (e) { console.warn("hydra preset", nombre, e); }
  }

  /* un preset temporal (la carta de ajuste, el glitch) y de regreso */
  function flash(nombre, ms) {
    if (!activo || !ESTADO.capas.hydra) return;
    const previo = actual;
    preset(nombre);
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => preset(previo), ms || 4000);
  }

  function apagar() {
    if (!activo) return;
    try { s.solid(0, 0, 0).out(s.o0); } catch (e) { /* nada */ }
  }

  function alternar() {
    ESTADO.capas.hydra = !ESTADO.capas.hydra;
    if (!ESTADO.capas.hydra) apagar(); else preset(actual);
    return ESTADO.capas.hydra;
  }

  return { iniciar, preset, flash, apagar, alternar, get activo() { return activo; } };
})();
