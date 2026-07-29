/* VIDA MEDIA · EN VIVO — visuales.js · vuelta 2
   hydra: el espacio. un preset por cuadro, ahora con capas de
   feedback, moiré, evolución local (cada cuadro envejece por dentro)
   y tres puentes de audio: el nivel del micro, sus graves y agudos
   por separado, y el golpe del kick de la banda. si hydra falta o el
   WebGL falla, la capa se apaga y todo lo demás sigue. */

"use strict";

const VISUALES = (() => {
  let h = null, s = null;
  let activo = false;
  let actual = "plataforma";
  let flashTimer = null;

  /* los puentes: SONIDO los llena; aquí sólo se leen */
  const hay = () => typeof SONIDO !== "undefined" && SONIDO.listo;
  const ctx = {
    nivel: () => (hay() ? SONIDO.nivel() : 0),
    grave: () => (hay() ? SONIDO.grave() : 0),
    agudo: () => (hay() ? SONIDO.agudo() : 0),
    beat: () => (hay() ? SONIDO.beat() : 0),
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

    plataforma() { // la torre espera: niebla, scanlines, un parpadeo raro
      s.noise(1.4, 0.004).thresh(0.62, 0.02)
        .color(0.12, 0.3, 0.2)
        .add(s.osc(140, 0, 0).rotate(1.5708).thresh(0.75, 0.001).color(0, 0.05, 0.03), 0.7)
        .modulate(s.noise(0.4, 0.01), 0.06)
        .brightness(() => (AZAR.caos() < 0.005 ? 0.08 : -0.05))
        .out(s.o0);
    },

    despegue() { // las estrellas corren y dejan estela; el kick empuja
      s.osc(70, 0.22, 0).thresh(0.82, 0.02).rotate(1.5708)
        .color(0.5, 0.95, 0.7)
        .add(s.src(s.o0).scrollY(0.012).scale(1.01).brightness(-0.16), 0.62)
        .brightness(() => ctx.beat() * 0.09 - 0.06)
        .modulate(s.noise(2.5, 0.05), 0.015)
        .out(s.o0);
    },

    scroll() { // TIEMPO CONTINUO: dos velocidades del mismo renglón
      s.osc(26, 0.4, 0).thresh(0.55, 0.04).rotate(1.5708)
        .add(s.osc(52, 0.2, 0).thresh(0.6, 0.03).rotate(1.5708).brightness(-0.2), 0.6)
        .color(0.4, 0.85, 0.6).brightness(-0.14)
        .pixelate(() => 240 - ctx.nivel() * 160, () => 240 - ctx.nivel() * 160)
        .out(s.o0);
    },

    telar() { // PARIDAD: la tela, y la lanzadera que la recorre
      const t0 = Date.now();
      s.osc(64, 0.015, 0).thresh(0.42, 0.05)
        .add(s.osc(64, 0.011, 0).thresh(0.42, 0.05).rotate(1.5708), 0.9)
        .color(0.2, 0.5, 0.35).brightness(-0.1)
        .add(s.shape(4, 0.9, 0.05).scale(1, 1.6, 0.015)
          .scrollY(() => ((Date.now() - t0) / 7000) % 1 - 0.5)
          .color(0.22, 0.65, 0.42), 0.85)
        .modulate(s.noise(0.7, 0.02), () => 0.008 + ctx.grave() * 0.06)
        .modulateScrollX(s.osc(1.2, 0.02), () => ctx.agudo() * 0.04)
        .out(s.o0);
    },

    planchado() { // CORRECCIÓN: el glitch se plancha por vidas medias
      const t0 = Date.now();
      s.src(s.o0)
        .modulate(s.noise(5, 0.3), () => Math.max(0.015, 0.2 * Math.pow(0.5, (Date.now() - t0) / 18000)))
        .modulateScrollX(s.osc(0.3, 0), () => (AZAR.caos() < 0.02 ? 0.12 : 0))
        .blend(s.osc(12, 0.05, 0.35).color(0.35, 0.75, 0.55).brightness(-0.1), 0.09)
        .out(s.o0);
    },

    nm() { // LONGITUD DE ONDA: el disco de Newton gira y suma gris
      const t0 = Date.now();
      s.osc(6, 0.05, 1.2).kaleid(8).colorama(0.3)
        .rotate(() => (Date.now() - t0) / 2600)
        .modulateRotate(s.osc(2, 0.02), 0.12)
        .saturate(() => Math.max(0, 1.4 - (Date.now() - t0) / 50000))
        .brightness(-0.12)
        .mult(s.osc(90, 0, 0).rotate(1.5708).thresh(0.1, 0.7).brightness(0.35), 0.25)
        .out(s.o0);
    },

    antenas() { // LA RED: tres platos; la despierta brilla y emite
      const t0 = Date.now();
      const turno = () => Math.floor((Date.now() - t0) / 2600) % 3;
      s.shape(3, 0.2, 0.008).repeat(3, 1)
        .color(0.22, 0.5, 0.36)
        .add(s.shape(3, 0.22, 0.06).repeat(3, 1)
          .mask(s.shape(4, 0.5, 0.02).scale(1, 0.33, 1)
            .scrollX(() => (turno() - 1) * 0.333))
          .color(0.3, 0.85, 0.55), 1)
        .add(s.shape(64, () => 0.08 + ((Date.now() - t0) % 2600) / 2600 * 0.5, 0.02)
          .scrollX(() => (turno() - 1) * 0.333)
          .color(0.08, 0.35, 0.22), 0.7)
        .modulate(s.noise(1.5, 0.05), 0.02)
        .out(s.o0);
    },

    ondas() { // RELOJ DE ECOS: cada anillo envejece girando en el feedback
      s.shape(64, () => 0.18 + ctx.nivel() * 0.5, 0.35)
        .color(0.3, 0.8, 0.6)
        .add(s.src(s.o0).scale(1.055).rotate(0.012).brightness(-0.055).hue(0.012), 0.72)
        .modulate(s.noise(1.6, 0.08), () => 0.03 + ctx.grave() * 0.12)
        .out(s.o0);
    },

    curva() { // VIDA MEDIA: la luz se divide, la estela lo recuerda
      s.osc(3, 0.015, 0.7)
        .color(0.45, 0.85, 0.65)
        .brightness(() => -0.34 + ctx.pila() * 0.3 + ctx.beat() * 0.05)
        .modulateScale(s.osc(0.4, 0.01), 0.06)
        .add(s.src(s.o0).scale(0.995).brightness(-0.06), 0.55)
        .out(s.o0);
    },

    oscura() { // MATERIA OSCURA: la voz no se ve; dobla lo que se ve
      s.noise(3, 0.01).thresh(0.93, 0.004)
        .color(0.22, 0.38, 0.36)
        .modulateScale(s.osc(0.9, 0.04), () => 0.12 + ctx.grave() * 0.8)
        .modulateRotate(s.noise(0.5, 0.01), () => ctx.grave() * 0.4)
        .add(s.noise(20, 0.5).thresh(0.995, 0.001).color(0.4, 0.6, 0.55), 0.5)
        .out(s.o0);
    },

    niebla() { // LA REGIÓN: tres capas de niebla que se van juntando
      const t0 = Date.now();
      s.noise(1.1, 0.012).color(0.3, 0.5, 0.45).brightness(-0.2)
        .add(s.noise(2.6, 0.02).thresh(0.4, 0.5).color(0.12, 0.22, 0.2).scrollX(0.01, 0.004), 0.7)
        .add(s.noise(0.5, 0.006).color(0.08, 0.16, 0.14).scrollX(-0.01, -0.002),
          () => 0.5 + Math.min(0.35, (Date.now() - t0) / 200000))
        .modulate(s.noise(0.6, 0.008), 0.3)
        .out(s.o0);
    },

    telar2() { // FILAMENTOS: hilos en moiré; un pulso viaja; la voz vibra
      /* la bifurcación de LA REGIÓN: si el poeta tocó una palabra
         prohibida, H6 se deja ver con ese parecido — y miente */
      if (ESTADO.rumbo === "nube") return P.telar2nube();
      if (ESTADO.rumbo === "red") return P.telar2red();
      const t0 = Date.now();
      s.osc(180, 0.005, 0).thresh(0.3, 0.012)
        .add(s.osc(174, 0.004, 0).thresh(0.32, 0.012).rotate(0.02).brightness(-0.25), 0.7)
        .color(0.32, 0.75, 0.55).brightness(-0.08)
        .add(s.shape(4, 0.9, 0.08).scale(1, 1.7, 0.02)
          .scrollY(() => ((Date.now() - t0) / 5200) % 1 - 0.5)
          .color(0.15, 0.5, 0.3), 0.8)
        .modulate(s.noise(1.4, 0.06), () => 0.012 + ctx.nivel() * 0.25)
        .modulateScrollY(s.osc(60, 0), () => ctx.agudo() * 0.01)
        .out(s.o0);
    },

    telar2nube() { // si se dijo «nube»: los hilos se ahogan en niebla
      s.osc(180, 0.005, 0).thresh(0.3, 0.02)
        .color(0.3, 0.7, 0.5).brightness(-0.1)
        .modulate(s.noise(2.2, 0.05), () => 0.12 + ctx.nivel() * 0.3)
        .add(s.noise(1.2, 0.015).color(0.2, 0.34, 0.3).brightness(-0.1), 0.85)
        .modulate(s.noise(0.5, 0.01), 0.25)
        .out(s.o0);
    },

    telar2red() { // si se dijo «red»: la rejilla rígida que alguien tejió
      s.osc(90, 0, 0).thresh(0.93, 0.008)
        .add(s.osc(90, 0, 0).rotate(1.5708).thresh(0.93, 0.008), 1)
        .color(0.25, 0.62, 0.42).brightness(-0.05)
        .modulateScale(s.osc(0.5, 0.02), () => 0.008 + ctx.nivel() * 0.05)
        .brightness(() => ctx.beat() * 0.04)
        .out(s.o0);
    },

    vacio() { // constelación con rejilla débil; el kick la ilumina
      s.noise(2.2, 0.005).thresh(0.86, 0.008)
        .color(0.22, 0.45, 0.33)
        .add(s.osc(48, 0, 0).thresh(0.985, 0.002).color(0.05, 0.12, 0.08)
          .add(s.osc(48, 0, 0).rotate(1.5708).thresh(0.985, 0.002).color(0.05, 0.12, 0.08), 1), 0.6)
        .brightness(() => -0.1 + ctx.beat() * 0.05)
        .out(s.o0);
    },

    particulas() { // ESCRIBIR FUERA DE SÍ: el polvo, y la voz que lo avienta
      s.noise(7, 0.08).thresh(0.76, 0.008)
        .color(0.5, 0.9, 0.7)
        .modulateScrollX(s.noise(1, 0.04), () => 0.04 + ctx.agudo() * 0.2)
        .modulateScrollY(s.noise(1.3, 0.03), 0.03)
        .add(s.src(s.o0).scale(1.012).rotate(0.004).brightness(-0.045), 0.75)
        .out(s.o0);
    },

    estelas() { // LA OTRA: verde y ámbar, separándose muy despacio
      const t0 = Date.now();
      const sep = () => Math.min(0.3, (Date.now() - t0) / 300000);
      s.osc(5, 0.045, 0.3).thresh(0.68, 0.05)
        .scrollY(() => 0.12 + sep(), 0.006).color(0.2, 0.6, 0.38)
        .add(s.osc(4, -0.03, 1.4).thresh(0.68, 0.06)
          .scrollY(() => -0.12 - sep(), -0.004).color(0.55, 0.34, 0.1), 0.9)
        .blend(s.src(s.o0).scale(1.008).brightness(-0.06), 0.45)
        .modulate(s.noise(0.9, 0.02), 0.04)
        .brightness(-0.06)
        .out(s.o0);
    },

    apagado() { // ACUSE: baja por escalones, nunca llega al negro
      const t0 = Date.now();
      s.noise(1, 0.002).thresh(0.97, 0.002)
        .color(0.3, 0.5, 0.4)
        .brightness(() => -0.02 - Math.min(0.06, Math.floor((Date.now() - t0) / 9000) * 0.015))
        .out(s.o0);
    },

    damero() { // PUNTERO: la carta de ajuste, con sus barras de color
      s.osc(10, 0, 0).thresh(0.5, 0)
        .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0))
        .add(s.osc(10, 0, 0).thresh(0.5, 0).invert()
          .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0).invert()))
        .color(0.72, 0.72, 0.72)
        .layer(s.osc(30, 0, 2).saturate(1.6).posterize(6, 1)
          .mask(s.shape(4, 0.6, 0.001).scale(1, 1.8, 0.14).scrollY(-0.4)))
        .out(s.o0);
    },

    glitchazo() { // la ráfaga (tecla G): ahora también corta renglones
      s.src(s.o0)
        .modulate(s.noise(24, 1), 0.5)
        .modulateScrollX(s.osc(180, 0).thresh(0.5, 0), () => AZAR.caos() * 0.2)
        .scale(() => 1 + AZAR.caos() * 0.25)
        .colorama(2.5)
        .pixelate(() => 40 + AZAR.caos() * 300, () => 40 + AZAR.caos() * 300)
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
