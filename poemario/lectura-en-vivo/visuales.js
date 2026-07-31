/* VIDA MEDIA · EN VIVO — visuales.js · vuelta 4
   hydra: el espacio. cada cuadro es ahora un pequeño sistema y no una
   textura: estratos con velocidades distintas, memoria, moiré, fases
   firmadas por semilla y cuatro puentes de audio suavizados. si hydra
   o WebGL fallan, la capa se apaga y todo lo demás sigue. */

"use strict";

const VISUALES = (() => {
  let h = null, s = null;
  let activo = false;
  let actual = "plataforma";
  let flashTimer = null;
  let t0Preset = performance.now();
  let firma = { a: 0.17, b: 0.43, c: 0.71 };
  const señal = { nivel: 0, grave: 0, agudo: 0, beat: 0 };
  const altaCalidad = new URLSearchParams(location.search).has("hq");
  const escalaBase = altaCalidad ? 0.72 : 0.5;
  /* Hydra cede antes que el audio. Cuando el vigía detecta cuadros
     largos, esta capa baja de cuadros y de resolución: la pieza se ve
     un poco más lenta y se sigue oyendo entera, que es el trato. */
  const FPS = altaCalidad ? [45, 30, 20] : [30, 22, 16];
  const MERMA = [1, 0.82, 0.66];
  let calibrando = false;

  const nivelCarga = () => (typeof RENDIMIENTO !== "undefined" ? RENDIMIENTO.nivel : 0);
  const fpsActual = () => FPS[nivelCarga()];
  const escalaResolucion = () => escalaBase * MERMA[nivelCarga()];

  /* Los analizadores de Tone son nerviosos. Se leen una vez por frame
     y se suavizan aquí: hydra recibe respiración, no valores rotos. */
  const hay = () => typeof SONIDO !== "undefined" && SONIDO.listo;
  const ctx = {
    nivel: () => señal.nivel,
    grave: () => señal.grave,
    agudo: () => señal.agudo,
    beat: () => señal.beat,
    pila: () => pila(),
    edad: () => (performance.now() - t0Preset) / 1000,
    pulso: (hz, fase = 0) => () =>
      0.5 + 0.5 * Math.sin((performance.now() - t0Preset) * 0.001 * hz + fase),
  };

  function hashFirma(texto) {
    let h0 = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h0 ^= texto.charCodeAt(i);
      h0 = Math.imul(h0, 16777619);
    }
    const u = (n) => ((Math.imul(h0 ^ n, 2246822507) >>> 0) / 4294967296);
    return { a: u(11), b: u(37), c: u(73) };
  }

  function actualizaSensores() {
    if (document.body.classList.contains("calibrando")) {
      requestAnimationFrame(actualizaSensores);
      return;
    }
    const leído = hay()
      ? SONIDO.sensores()
      : { nivel: 0, grave: 0, agudo: 0, beat: 0 };
    const seguro = (v) => Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
    const crudo = {
      nivel: seguro(leído.nivel),
      grave: seguro(leído.grave),
      agudo: seguro(leído.agudo),
      beat: seguro(leído.beat),
    };
    señal.nivel += (crudo.nivel - señal.nivel) * 0.12;
    señal.grave += (crudo.grave - señal.grave) * 0.08;
    señal.agudo += (crudo.agudo - señal.agudo) * 0.18;
    señal.beat += (crudo.beat - señal.beat) * (crudo.beat > señal.beat ? 0.5 : 0.09);
    requestAnimationFrame(actualizaSensores);
  }

  function iniciar(canvas) {
    if (typeof Hydra === "undefined") {
      console.warn("hydra: sin motor (lib/hydra-synth.js no cargó)");
      return false;
    }
    try {
      /* media resolución para escenario; ?hq sube el detalle cuando
         la GPU y el proyector ya fueron probados con cuerpo */
      canvas.width = Math.floor(window.innerWidth * escalaResolucion());
      canvas.height = Math.floor(window.innerHeight * escalaResolucion());
      h = new Hydra({ canvas, detectAudio: false, makeGlobal: false, autoLoop: true });
      s = h.synth;
      /* El audio tiene prioridad de escenario. Treinta cuadros conservan
         el movimiento y dejan aire al vocoder y al planificador musical. */
      s.fps = fpsActual();
      activo = true;
      actualizaSensores();
      const remide = () => {
        const w = Math.floor(window.innerWidth * escalaResolucion());
        const alto = Math.floor(window.innerHeight * escalaResolucion());
        if (h && typeof h.setResolution === "function") h.setResolution(w, alto);
        else { canvas.width = w; canvas.height = alto; }
      };
      window.addEventListener("resize", remide);
      if (typeof RENDIMIENTO !== "undefined") {
        RENDIMIENTO.alCambiar(() => {
          if (!activo) return;
          if (!calibrando) s.fps = fpsActual();
          remide();
        });
      }
    } catch (e) {
      console.warn("hydra: no arrancó", e);
      activo = false;
    }
    return activo;
  }

  /* ── presets ── */
  const P = {

    plataforma() { // la torre espera: niebla, radar y una señal que no llega
      s.noise(1.4, 0.004).thresh(0.62, 0.02)
        .color(0.12, 0.3, 0.2)
        .add(s.osc(140, 0, 0).rotate(1.5708).thresh(0.75, 0.001).color(0, 0.05, 0.03), 0.7)
        .add(s.shape(64, 0.38, 0.008).diff(s.shape(64, 0.355, 0.008))
          .scale(1, 1, 1.77).rotate(() => ctx.edad() * 0.012 + firma.a)
          .scrollX(0.27).scrollY(-0.1)
          .color(0.16, 0.58, 0.34), 0.7)
        .add(s.shape(4, 0.42, 0.003).scale(1, 0.006, 0.62)
          .rotate(() => ctx.edad() * 0.13 + firma.b * 6.28)
          .scrollX(0.27).scrollY(-0.1)
          .color(0.1, 0.42, 0.24), 0.55)
        .modulate(s.noise(0.4, 0.01), 0.06)
        .brightness(() => (Math.sin(ctx.edad() * 17 + firma.c * 20) > 0.997 ? 0.08 : -0.05))
        .out(s.o0);
    },

    despegue() { // túnel de transmisión: tres velocidades y memoria lateral
      s.osc(70 + firma.a * 18, 0.22, 0).thresh(0.82, 0.02).rotate(1.5708)
        .color(0.5, 0.95, 0.7)
        .add(s.src(s.o0).scrollY(0.012).scale(1.01).brightness(-0.16), 0.62)
        .add(s.osc(18, -0.08, 0.6).kaleid(4)
          .thresh(0.74, 0.025).scale(() => 1.2 + ctx.beat() * 0.16)
          .color(0.08, 0.35, 0.22).brightness(-0.18), 0.52)
        .add(s.src(s.o0).scrollX(() => (ctx.agudo() - 0.5) * 0.008)
          .scale(1.018).brightness(-0.22).color(0.12, 0.5, 0.32), 0.28)
        .brightness(() => ctx.beat() * 0.09 - 0.06)
        .modulate(s.noise(2.5 + firma.b, 0.05), () => 0.012 + ctx.grave() * 0.035)
        .out(s.o0);
    },

    scroll() { // TIEMPO CONTINUO: tres relojes que nunca coinciden
      s.osc(26, 0.4, 0).thresh(0.55, 0.04).rotate(1.5708)
        .add(s.osc(52, 0.2, 0).thresh(0.6, 0.03).rotate(1.5708).brightness(-0.2), 0.6)
        .diff(s.osc(25 + firma.a * 2, -0.07, firma.b)
          .rotate(1.5708 + 0.012).thresh(0.84, 0.015).brightness(-0.24), 0.28)
        .add(s.src(s.o0).scrollY(-0.006).scale(1.004, 1, 1.01)
          .brightness(-0.14), 0.34)
        .color(0.4, 0.85, 0.6).brightness(-0.14)
        .modulateScrollX(s.noise(0.8, 0.02), () => ctx.agudo() * 0.055)
        .pixelate(() => 260 - ctx.nivel() * 180, () => 210 - ctx.grave() * 130)
        .out(s.o0);
    },

    telar() { // PARIDAD: urdimbre, trama, sombra y lanzadera
      const t0 = Date.now();
      s.osc(64, 0.015, 0).thresh(0.42, 0.05)
        .add(s.osc(64, 0.011, 0).thresh(0.42, 0.05).rotate(1.5708), 0.9)
        .add(s.osc(92 + firma.a * 24, -0.006, firma.c)
          .thresh(0.78, 0.015).rotate(0.785 + firma.b * 0.03)
          .brightness(-0.28), 0.48)
        .color(0.2, 0.5, 0.35).brightness(-0.1)
        .add(s.shape(4, 0.9, 0.05).scale(1, 1.6, 0.015)
          .scrollY(() => ((Date.now() - t0) / 7000) % 1 - 0.5)
          .color(0.22, 0.65, 0.42), 0.85)
        .add(s.src(s.o0).scrollX(0.003).scrollY(-0.003)
          .scale(1.003).brightness(-0.18), 0.26)
        .modulate(s.noise(0.7, 0.02), () => 0.008 + ctx.grave() * 0.06)
        .modulateScrollX(s.osc(1.2, 0.02), () => ctx.agudo() * 0.04)
        .out(s.o0);
    },

    planchado() { // CORRECCIÓN: el glitch se plancha por vidas medias
      const t0 = Date.now();
      s.src(s.o0)
        .modulate(s.noise(5, 0.3), () => Math.max(0.015, 0.2 * Math.pow(0.5, (Date.now() - t0) / 18000)))
        .modulateScrollX(s.osc(0.3, 0), () =>
          Math.sin(ctx.edad() * 13 + firma.a * 30) > 0.982 ? 0.12 : 0)
        .pixelate(() => 70 + Math.min(260, ctx.edad() * 7), () => 48 + Math.min(190, ctx.edad() * 5))
        .blend(s.osc(12, 0.05, 0.35).color(0.35, 0.75, 0.55).brightness(-0.1), 0.09)
        .add(s.osc(128, 0, 0).rotate(1.5708).thresh(0.985, 0.002)
          .scrollY(() => -ctx.edad() * 0.008).color(0.08, 0.24, 0.14), 0.45)
        .out(s.o0);
    },

    nm() { // LONGITUD DE ONDA: dos discos se cancelan hasta dar gris
      const t0 = Date.now();
      s.osc(6, 0.05, 1.2).kaleid(8).colorama(0.3)
        .rotate(() => (Date.now() - t0) / 2600)
        .add(s.osc(7 + firma.a * 2, -0.032, firma.b * 3)
          .kaleid(12).rotate(() => -(Date.now() - t0) / 4100)
          .colorama(() => 0.1 + ctx.agudo() * 0.35).brightness(-0.2), 0.58)
        .modulateRotate(s.osc(2, 0.02), 0.12)
        .saturate(() => Math.max(0, 1.4 - (Date.now() - t0) / 50000))
        .scale(() => 1 + ctx.beat() * 0.04)
        .brightness(-0.12)
        .mult(s.osc(90, 0, 0).rotate(1.5708).thresh(0.1, 0.7).brightness(0.35), 0.25)
        .out(s.o0);
    },

    antenas() { // LA RED: tres estaciones, sus lóbulos y la escucha rotativa
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
        .add(s.shape(64, 0.44, 0.004).diff(s.shape(64, 0.42, 0.004))
          .scale(1, 1, 0.42).repeat(3, 1)
          .rotate(() => ctx.edad() * 0.025 + firma.c)
          .color(0.12, 0.42, 0.26), 0.5)
        .add(s.osc(160, 0.02, 0).thresh(0.97, 0.004)
          .rotate(() => 1.5708 + turno() * 0.018).brightness(-0.22), 0.38)
        .modulate(s.noise(1.5, 0.05), () => 0.015 + ctx.nivel() * 0.04)
        .out(s.o0);
    },

    ondas() { // RELOJ DE ECOS: dos relojes regresan con tiempos distintos
      s.shape(64, () => 0.18 + ctx.nivel() * 0.5, 0.35)
        .color(0.3, 0.8, 0.6)
        .add(s.src(s.o0).scale(1.055).rotate(0.012).brightness(-0.055).hue(0.012), 0.72)
        .diff(s.shape(64, () => 0.1 + ctx.grave() * 0.38, 0.28)
          .scrollX(() => Math.sin(ctx.edad() * 0.17 + firma.a * 6.28) * 0.12)
          .color(0.12, 0.42, 0.28), 0.35)
        .add(s.osc(84, 0, 0).rotate(1.5708).thresh(0.985, 0.002)
          .scrollY(() => ctx.edad() * 0.006).brightness(-0.2), 0.3)
        .modulate(s.noise(1.6, 0.08), () => 0.03 + ctx.grave() * 0.12)
        .out(s.o0);
    },

    curva() { // VIDA MEDIA: órbitas que se dividen y una memoria que no toca cero
      s.osc(3, 0.015, 0.7)
        .color(0.45, 0.85, 0.65)
        .brightness(() => -0.34 + ctx.pila() * 0.3 + ctx.beat() * 0.05)
        .add(s.shape(64, () => 0.12 + (1 - ctx.pila()) * 0.42, 0.01)
          .diff(s.shape(64, () => 0.105 + (1 - ctx.pila()) * 0.42, 0.01))
          .scale(1, 1, 1.77).rotate(() => firma.a + ctx.edad() * 0.006)
          .color(0.16, 0.48, 0.3), 0.58)
        .add(s.osc(96, 0, 0).rotate(1.5708).thresh(0.985, 0.002)
          .scrollY(() => -ctx.edad() * 0.002).brightness(-0.23), 0.4)
        .modulateScale(s.osc(0.4, 0.01), 0.06)
        .add(s.src(s.o0).scale(0.995).brightness(-0.06), 0.55)
        .out(s.o0);
    },

    oscura() { // MATERIA OSCURA: dos lentes ausentes doblan el mismo campo
      s.noise(3, 0.01).thresh(0.93, 0.004)
        .color(0.22, 0.38, 0.36)
        .modulateScale(s.osc(0.9, 0.04), () => 0.12 + ctx.grave() * 0.8)
        .modulateRotate(s.noise(0.5, 0.01), () => ctx.grave() * 0.4)
        .add(s.shape(64, 0.34, 0.004).diff(s.shape(64, 0.328, 0.004))
          .scale(1, 1, 1.77)
          .scrollX(() => Math.cos(ctx.edad() * 0.09 + firma.a * 6.28) * 0.22)
          .scrollY(() => Math.sin(ctx.edad() * 0.063 + firma.b * 6.28) * 0.18)
          .color(0.03, 0.09, 0.07), () => 0.2 + ctx.grave() * 0.35)
        .add(s.src(s.o0).scale(() => 1.003 + ctx.grave() * 0.01)
          .rotate(() => (ctx.agudo() - 0.5) * 0.008).brightness(-0.13), 0.38)
        .add(s.noise(20, 0.5).thresh(0.995, 0.001).color(0.4, 0.6, 0.55), 0.5)
        .out(s.o0);
    },

    niebla() { // LA REGIÓN: cinco densidades sin borde ni centro
      const t0 = Date.now();
      s.noise(1.1, 0.012).color(0.3, 0.5, 0.45).brightness(-0.2)
        .add(s.noise(2.6, 0.02).thresh(0.4, 0.5).color(0.12, 0.22, 0.2).scrollX(0.01, 0.004), 0.7)
        .add(s.noise(0.5, 0.006).color(0.08, 0.16, 0.14).scrollX(-0.01, -0.002),
          () => 0.5 + Math.min(0.35, (Date.now() - t0) / 200000))
        .add(s.osc(118 + firma.a * 30, 0.002, firma.b)
          .rotate(0.18).thresh(0.96, 0.006)
          .modulate(s.noise(0.7, 0.01), () => 0.04 + ctx.nivel() * 0.18)
          .color(0.1, 0.27, 0.18).brightness(-0.18), 0.48)
        .add(s.src(s.o0).scale(1.006).scrollX(-0.002)
          .brightness(-0.12).hue(0.004), 0.34)
        .modulate(s.noise(0.6, 0.008), () => 0.23 + ctx.grave() * 0.16)
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
        .add(s.osc(88 + firma.a * 18, -0.003, firma.b)
          .rotate(0.785).thresh(0.86, 0.008).brightness(-0.26), 0.45)
        .color(0.32, 0.75, 0.55).brightness(-0.08)
        .add(s.shape(4, 0.9, 0.08).scale(1, 1.7, 0.02)
          .scrollY(() => ((Date.now() - t0) / 5200) % 1 - 0.5)
          .color(0.15, 0.5, 0.3), 0.8)
        .add(s.src(s.o0).scale(1.004).scrollY(-0.002)
          .brightness(-0.16), 0.3)
        .modulate(s.noise(1.4, 0.06), () => 0.012 + ctx.nivel() * 0.25)
        .modulateScrollY(s.osc(60, 0), () => ctx.agudo() * 0.01)
        .out(s.o0);
    },

    telar2nube() { // si se dijo «nube»: los hilos se ahogan en niebla
      s.osc(180, 0.005, 0).thresh(0.3, 0.02)
        .color(0.3, 0.7, 0.5).brightness(-0.1)
        .add(s.osc(176, -0.003, firma.a).rotate(0.018)
          .thresh(0.66, 0.04).brightness(-0.22), 0.48)
        .modulate(s.noise(2.2, 0.05), () => 0.12 + ctx.nivel() * 0.3)
        .add(s.noise(1.2, 0.015).color(0.2, 0.34, 0.3).brightness(-0.1), 0.85)
        .add(s.src(s.o0).scale(1.008).rotate(0.002).brightness(-0.14), 0.3)
        .modulate(s.noise(0.5, 0.01), 0.25)
        .out(s.o0);
    },

    telar2red() { // si se dijo «red»: la rejilla rígida que alguien tejió
      s.osc(90, 0, 0).thresh(0.93, 0.008)
        .add(s.osc(90, 0, 0).rotate(1.5708).thresh(0.93, 0.008), 1)
        .add(s.osc(45, 0, 0).rotate(0.785).thresh(0.965, 0.004)
          .scrollX(() => ctx.edad() * 0.0015).brightness(-0.22), 0.55)
        .color(0.25, 0.62, 0.42).brightness(-0.05)
        .modulateScale(s.osc(0.5, 0.02), () => 0.008 + ctx.nivel() * 0.05)
        .modulateScrollX(s.osc(6, 0), () => ctx.agudo() * 0.018)
        .brightness(() => ctx.beat() * 0.06)
        .out(s.o0);
    },

    vacio() { // constelación, rejilla desviada y una memoria de coordenadas
      s.noise(2.2, 0.005).thresh(0.86, 0.008)
        .color(0.22, 0.45, 0.33)
        .add(s.osc(48, 0, 0).thresh(0.985, 0.002).color(0.05, 0.12, 0.08)
          .add(s.osc(48, 0, 0).rotate(1.5708).thresh(0.985, 0.002).color(0.05, 0.12, 0.08), 1), 0.6)
        .add(s.osc(47 + firma.a, 0, firma.b).rotate(0.012)
          .thresh(0.988, 0.002).scrollY(() => ctx.edad() * 0.0015)
          .color(0.05, 0.15, 0.09), 0.45)
        .add(s.src(s.o0).scale(1.003).rotate(-0.001)
          .brightness(-0.17), 0.25)
        .brightness(() => -0.1 + ctx.beat() * 0.05)
        .out(s.o0);
    },

    particulas() { // ESCRIBIR FUERA DE SÍ: polvo fino, grano y letras fantasma
      s.noise(7, 0.08).thresh(0.76, 0.008)
        .color(0.5, 0.9, 0.7)
        .add(s.noise(22, 0.16).thresh(0.91, 0.003)
          .color(0.24, 0.56, 0.36).brightness(-0.08), 0.62)
        .add(s.osc(120, -0.018, firma.c).rotate(0.21)
          .thresh(0.975, 0.004).brightness(-0.2), 0.32)
        .modulateScrollX(s.noise(1, 0.04), () => 0.04 + ctx.agudo() * 0.2)
        .modulateScrollY(s.noise(1.3, 0.03), () => 0.03 + ctx.grave() * 0.09)
        .add(s.src(s.o0).scale(1.012).rotate(0.004).brightness(-0.045), 0.75)
        .out(s.o0);
    },

    estelas() { // LA OTRA: dos portadoras y el residuo que ninguna reconoce
      const t0 = Date.now();
      const sep = () => Math.min(0.3, (Date.now() - t0) / 300000);
      s.osc(5, 0.045, 0.3).thresh(0.68, 0.05)
        .scrollY(() => 0.12 + sep(), 0.006).color(0.2, 0.6, 0.38)
        .add(s.osc(4, -0.03, 1.4).thresh(0.68, 0.06)
          .scrollY(() => -0.12 - sep(), -0.004).color(0.55, 0.34, 0.1), 0.9)
        .diff(s.osc(9 + firma.a * 2, 0.006, firma.b)
          .kaleid(2).thresh(0.88, 0.015)
          .color(0.18, 0.26, 0.22).brightness(-0.15), 0.35)
        .blend(s.src(s.o0).scale(1.008).brightness(-0.06), 0.45)
        .modulate(s.noise(0.9, 0.02), () => 0.035 + ctx.nivel() * 0.055)
        .brightness(-0.06)
        .out(s.o0);
    },

    apagado() { // ACUSE: cada escalón pierde resolución, nunca la última señal
      const t0 = Date.now();
      s.noise(1, 0.002).thresh(0.97, 0.002)
        .color(0.3, 0.5, 0.4)
        .add(s.src(s.o0).scale(0.997).brightness(-0.12), 0.28)
        .pixelate(
          () => Math.max(12, 180 / Math.pow(2, Math.floor((Date.now() - t0) / 9000))),
          () => Math.max(8, 100 / Math.pow(2, Math.floor((Date.now() - t0) / 9000))))
        .brightness(() => -0.02 - Math.min(0.06, Math.floor((Date.now() - t0) / 9000) * 0.015))
        .out(s.o0);
    },

    damero() { // PUNTERO: carta de ajuste, anillos y dirección corrida
      s.osc(10, 0, 0).thresh(0.5, 0)
        .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0))
        .add(s.osc(10, 0, 0).thresh(0.5, 0).invert()
          .mult(s.osc(10, 0, 0).rotate(1.5708).thresh(0.5, 0).invert()))
        .color(0.72, 0.72, 0.72)
        .add(s.shape(64, 0.42, 0.005).diff(s.shape(64, 0.39, 0.005))
          .scale(1, 1, 1.77).color(0.1, 0.1, 0.1), 0.8)
        .add(s.shape(4, 0.42, 0.002).scale(1, 0.008, 0.72)
          .rotate(() => firma.a * 0.08 - 0.04).color(0.05, 0.05, 0.05), 0.9)
        .layer(s.osc(30, 0, 2).saturate(1.6).posterize(6, 1)
          .mask(s.shape(4, 0.6, 0.001).scale(1, 1.8, 0.14).scrollY(-0.4)))
        .out(s.o0);
    },

    glitchazo() { // la ráfaga: corta renglones, profundidad y color
      s.src(s.o0)
        .modulate(s.noise(24, 1), 0.5)
        .modulateScrollX(s.osc(180, 0).thresh(0.5, 0),
          () => (0.5 + 0.5 * Math.sin(ctx.edad() * 37 + firma.a * 20)) * 0.2)
        .scale(() => 1 + (0.5 + 0.5 * Math.sin(ctx.edad() * 23)) * 0.25)
        .colorama(2.5)
        .posterize(() => 3 + Math.floor(ctx.pulso(9, firma.b * 6.28)() * 5), 1)
        .pixelate(
          () => 40 + ctx.pulso(13, firma.a * 6.28)() * 300,
          () => 40 + ctx.pulso(17, firma.c * 6.28)() * 300)
        .out(s.o0);
    },
  };

  function preset(nombre) {
    actual = nombre;
    if (!activo || !ESTADO.capas.hydra) return;
    t0Preset = performance.now();
    firma = hashFirma(ESTADO.seed + "·" + nombre);
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

  function modoCalibracion(encendido) {
    calibrando = encendido;
    if (s) s.fps = encendido ? 12 : fpsActual();
  }

  return { iniciar, preset, flash, apagar, alternar, modoCalibracion, get activo() { return activo; } };
})();
