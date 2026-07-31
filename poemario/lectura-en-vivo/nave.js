/* VIDA MEDIA · EN VIVO — nave.js · vuelta 4
   el canvas de la nave: starfield con estelas y temperatura, retícula,
   trayectorias, filamentos H6, instrumentos específicos por cuadro,
   lente gravitacional, curva, ecos e invaders. sin librerías. */

"use strict";

const NAVE = (() => {
  let cv, cx, W, H;
  let estrellas = [];
  let vel = 0;
  let flags = {};              // lente, curva, invaders, torre, apagaMitades
  let visibles = 1;            // fracción de estrellas encendidas (ACUSE)
  let ret = { x: 0, y: 0, tx: 0, ty: 0 };
  let ondas = [];              // [{r, alpha}]
  let masa = { x: 0, y: 0, a: 0 };   // la masa invisible de MATERIA OSCURA
  let curvaT = 0;
  let inv = null;              // estado de los invaders
  let ultimaMitad = 0;
  let modo = "plataforma";
  let semillaVisual = 1;
  let secuenciaEstrellas = 0;
  let filamentos = [];
  let paquetes = [];
  let entradaCuadro = performance.now();

  const N_ESTRELLAS = 320;
  /* Bajo presión la primera concesión es el cielo, no el audio: menos
     estrellas antes que una música que se traba. */
  const CENSO = [1, 0.62, 0.38];

  function iniciar(canvas) {
    cv = canvas;
    cx = cv.getContext("2d");
    semillaVisual = hashTexto(ESTADO.seed);
    mide();
    window.addEventListener("resize", mide);
    for (let i = 0; i < N_ESTRELLAS; i++) estrellas.push(siembra({}, true));
    armaFilamentos();
    preparaPaleta();
    ret.x = ret.tx = W / 2; ret.y = ret.ty = H / 2;
    requestAnimationFrame(paso);
  }

  function mide() {
    W = cv.width = cv.clientWidth;
    H = cv.height = cv.clientHeight;
  }

  /* Se reescribe la estrella en su sitio. Antes cada renacimiento creaba
     un objeto nuevo: con trescientas veinte estrellas y vuelo rápido eso
     era basura constante, y el recolector siempre cobra a destiempo. */
  function siembra(e, cualquierZ) {
    const id = secuenciaEstrellas++;
    const r = (sal) => ruidoFirma(id * 7 + sal);
    e.x = (r(1) - 0.5) * W * 2;
    e.y = (r(2) - 0.5) * H * 2;
    e.z = cualquierZ ? r(3) * 1.4 + 0.1 : 1.5;
    e.capa = Math.floor(r(4) * 3);
    e.fase = r(5) * Math.PI * 2;
    e.tono = r(6);
    e.px = null;
    e.py = null;
    return e;
  }

  /* ── el cielo se dibuja por lotes ──
     Trescientas veinte estrellas pintadas una por una son trescientos
     veinte cambios de estilo, trescientas veinte llamadas a stroke y
     —peor— trescientas veinte cadenas «rgba(…)» nuevas por cuadro. Se
     agrupan por color, opacidad y tamaño: unas decenas de llamadas y
     ninguna cadena nueva mientras no cambie el cuadro. */
  const NIVELES = 24;
  let colores = [];
  const lotes = new Map();

  function paletaDelModo(m) {
    if (m === "otra") return [[140, 255, 170], [228, 255, 238], [255, 184, 74]];
    if (m === "onda") return [[90, 128, 255], [100, 255, 160], [255, 92, 82]];
    if (m === "acuse") return [[175, 194, 184]];
    return [[140, 255, 170], [228, 255, 238]];
  }

  function indicePaleta(m, tono) {
    if (m === "otra") return tono > 0.62 ? 2 : 0;
    if (m === "onda") return tono < 0.33 ? 0 : (tono < 0.66 ? 1 : 2);
    if (m === "acuse") return 0;
    return tono > 0.82 ? 1 : 0;
  }

  function preparaPaleta() {
    colores = paletaDelModo(modo).map(([r, g, b]) =>
      Array.from({ length: NIVELES }, (_, i) =>
        `rgba(${r}, ${g}, ${b}, ${((i + 0.5) / NIVELES).toFixed(3)})`));
    lotes.clear();
  }

  function apunta1(clave, a, b, c, d) {
    let l = lotes.get(clave);
    if (!l) { l = { n: 0, datos: new Float32Array(N_ESTRELLAS * 4) }; lotes.set(clave, l); }
    const k = l.n * 4;
    if (k + 3 >= l.datos.length) return;
    l.datos[k] = a; l.datos[k + 1] = b; l.datos[k + 2] = c; l.datos[k + 3] = d;
    l.n += 1;
  }

  function nivelAlfa(alpha) {
    const v = (alpha * NIVELES) | 0;
    return v < 0 ? 0 : (v >= NIVELES ? NIVELES - 1 : v);
  }

  function pintaLotes() {
    for (const [clave, l] of lotes) {
      if (!l.n) continue;
      const raya = clave & 1;
      const tamaño = ((clave >> 1) & 1) + 1;
      const resto = clave >> 2;
      const color = colores[(resto / NIVELES) | 0][resto % NIVELES];
      const d = l.datos;
      cx.beginPath();
      if (raya) {
        cx.strokeStyle = color;
        cx.lineWidth = tamaño;
        for (let i = 0; i < l.n; i++) {
          const k = i * 4;
          cx.moveTo(d[k], d[k + 1]);
          cx.lineTo(d[k + 2], d[k + 3]);
        }
        cx.stroke();
      } else {
        cx.fillStyle = color;
        for (let i = 0; i < l.n; i++) {
          const k = i * 4;
          cx.rect(d[k], d[k + 1], tamaño, tamaño);
        }
        cx.fill();
      }
      l.n = 0;
    }
  }

  function hashTexto(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function ruidoFirma(n) {
    let x = (semillaVisual + Math.imul(n + 1, 374761393)) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  }

  function armaFilamentos() {
    filamentos = Array.from({ length: 34 }, (_, i) => ({
      x: ruidoFirma(900 + i * 3),
      y: ruidoFirma(901 + i * 3),
      fase: ruidoFirma(902 + i * 3) * Math.PI * 2,
      par: (i * 7 + 5) % 34,
    }));
  }

  function config(cuadro) {
    modo = cuadro.id;
    preparaPaleta();
    entradaCuadro = performance.now();
    vel = cuadro.vel;
    flags = {
      lente: !!cuadro.lente,
      curva: !!cuadro.curva,
      torre: cuadro.id === "plataforma",
      apagaMitades: !!cuadro.apagaMitades,
    };
    curvaT = 0;
    ondas = [];
    if (cuadro.invaders) armaInvaders(); else inv = null;
    if (!flags.apagaMitades) visibles = 1;
    ultimaMitad = Date.now();
    paquetes = [];
  }

  function reticula() {
    const b = cv.getBoundingClientRect();
    return { x: b.left + ret.x, y: b.top + ret.y };
  }

  function apunta(x, y) { ret.tx = x; ret.ty = y; }

  function ping() { ondas.push({ r: 8, alpha: 0.9 }); }

  /* ── invaders (sólo EL NÚMERO; un guiño, no un arcade) ── */

  function armaInvaders() {
    inv = {
      nave: W / 2,
      balas: [],
      digitos: [],
      muertos: 0,
    };
    const elegido = AZAR.ent(0, 9);
    for (let i = 0; i < 10; i++) {
      inv.digitos.push({
        d: AZAR.caos() < 0.35 ? elegido : AZAR.ent(0, 9),
        x: (i + 0.5) * (W / 10),
        y: 60 + (i % 3) * 44,
        vx: (AZAR.caos() - 0.5) * 0.4,
        vivo: true,
      });
    }
  }

  function teclaInvader(k) {
    if (!inv) return false;
    if (k === "ArrowLeft") { inv.nave = Math.max(30, inv.nave - 26); return true; }
    if (k === "ArrowRight") { inv.nave = Math.min(W - 30, inv.nave + 26); return true; }
    if (k === "ArrowUp") { inv.balas.push({ x: inv.nave, y: H - 70 }); return true; }
    return false;
  }

  function pasoInvaders() {
    if (!inv) return;
    inv.digitos.forEach((d) => {
      if (!d.vivo) return;
      d.x += d.vx;
      d.y += 0.05;                       // bajan muy despacio: hay tiempo
      if (d.x < 20 || d.x > W - 20) d.vx *= -1;
    });
    inv.balas.forEach((b) => { b.y -= 7; });
    inv.balas = inv.balas.filter((b) => b.y > 20);
    for (const b of inv.balas) {
      for (const d of inv.digitos) {
        if (d.vivo && Math.abs(d.x - b.x) < 16 && Math.abs(d.y - b.y) < 16) {
          d.vivo = false;
          b.y = -99;
          inv.muertos += 1;
          if (typeof SONIDO !== "undefined") SONIDO.blip(inv.muertos);
          if (typeof TEXTO !== "undefined") TEXTO.hueco();
          apunta(d.x, d.y);
        }
      }
    }
    /* dibujo */
    cx.font = "22px unscii, monospace";
    cx.textAlign = "center";
    inv.digitos.forEach((d) => {
      if (!d.vivo) return;
      cx.fillStyle = "rgba(140, 255, 170, 0.85)";
      cx.fillText(String(d.d), d.x, d.y);
    });
    cx.fillStyle = "rgba(140, 255, 170, 0.9)";
    cx.fillText("▲", inv.nave, H - 54);
    cx.fillStyle = "rgba(230, 255, 240, 0.9)";
    inv.balas.forEach((b) => cx.fillRect(b.x - 1, b.y - 6, 2, 8));
  }

  /* ── el paso de dibujo ── */

  function paso() {
    requestAnimationFrame(paso);
    /* Este es el único latido por cuadro de toda la consola: el vigía de
       fluidez se cuelga de aquí en vez de abrir un bucle propio. */
    if (typeof RENDIMIENTO !== "undefined") RENDIMIENTO.marca();
    if (ESTADO.blackout) { cx.clearRect(0, 0, W, H); return; }
    /* La calibración cubre el escenario: congelar este lienzo evita que
       el dibujo compita con las mediciones del vocoder. */
    if (document.body.classList.contains("calibrando")) return;
    cx.clearRect(0, 0, W, H);
    const t = performance.now() / 1000;
    const audio = nivelAudio();

    /* ACUSE: se apaga por mitades, nunca del todo */
    if (flags.apagaMitades && Date.now() - ultimaMitad > 9000 && visibles > 0.04) {
      visibles /= 2;
      ultimaMitad = Date.now();
    }

    /* la masa invisible deriva despacio */
    masa.a += 0.0021;
    masa.x = W / 2 + Math.cos(masa.a) * W * 0.22;
    masa.y = H / 2 + Math.sin(masa.a * 0.7) * H * 0.2;

    pintaPlanoDeVuelo(t, audio);

    const cxm = W / 2, cym = H / 2;
    const censo = CENSO[typeof RENDIMIENTO !== "undefined" ? RENDIMIENTO.nivel : 0];
    const nVis = Math.floor(estrellas.length * visibles * censo);
    const rayas = vel > 0.75 || modo === "otra";
    for (let i = 0; i < nVis; i++) {
      const e = estrellas[i];
      /* vuelo radial: las estrellas crecen desde el centro */
      e.z -= vel * 0.004 * (1 + e.capa * 0.6);
      if (e.z <= 0.05) siembra(e, false);
      let px = cxm + e.x / e.z * 0.5;
      let py = cym + e.y / e.z * 0.5;
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) { siembra(e, false); continue; }

      /* MATERIA OSCURA: la lente dobla lo que sí se ve */
      if (flags.lente) {
        const dx = px - masa.x, dy = py - masa.y;
        const d2 = dx * dx + dy * dy + 400;
        const k = 26000 / d2;
        px += dx * k; py += dy * k;
      }

      const centelleo = 0.72 + Math.sin(t * (0.7 + e.capa * 0.35) + e.fase) * 0.28;
      const brillo = Math.min(1, 0.25 + (1.5 - e.z)) * centelleo;
      const p = indicePaleta(modo, e.tono);
      const s = e.capa === 2 ? 2 : 1;
      const base = ((p * NIVELES) << 2) | ((s - 1) << 1);
      if (e.px !== null && rayas) {
        /* la distancia no produce rayas iguales: cada capa conserva
           una longitud distinta de su posición anterior */
        const largo = Math.min(1, 0.28 + vel * 0.22 + e.capa * 0.12);
        const nivel = nivelAlfa(brillo * 0.45 * 0.78);
        apunta1(base + (nivel << 2) + 1, px, py,
          px + (e.px - px) * largo, py + (e.py - py) * largo);
      } else {
        const nivel = nivelAlfa(brillo * 0.78);
        apunta1(base + (nivel << 2), px, py, 0, 0);
      }
      e.px = px; e.py = py;
    }
    pintaLotes();

    pintaInstrumentoDelCuadro(t, audio);
    if (flags.torre) torre();
    if (flags.curva) curva();
    if (ondas.length) pintaOndas();
    if (inv) pasoInvaders();
    pintaReticula(audio);
  }

  /* Un solo objeto para toda la corrida: se lee sesenta veces por
     segundo y ninguna de esas lecturas merece basura nueva. */
  const lectura = { nivel: 0, grave: 0, agudo: 0, beat: 0 };
  const acota = (v) => (Number.isFinite(v) ? (v < 0 ? 0 : (v > 1 ? 1 : v)) : 0);

  function nivelAudio() {
    const señal = (typeof SONIDO !== "undefined" && SONIDO.listo) ? SONIDO.sensores() : null;
    lectura.nivel = señal ? acota(señal.nivel) : 0;
    lectura.grave = señal ? acota(señal.grave) : 0;
    lectura.agudo = señal ? acota(señal.agudo) : 0;
    lectura.beat = señal ? acota(señal.beat) : 0;
    return lectura;
  }

  /* La instrumentación no es un marco fijo: se desarma y recompone
     según el cuadro. Estas órbitas son apenas el plano común. */
  function pintaPlanoDeVuelo(t, audio) {
    if (modo === "plataforma" || modo === "oscura") return;
    cx.save();
    cx.strokeStyle = `rgba(140, 255, 170, ${0.045 + audio.nivel * 0.025})`;
    cx.lineWidth = 1;
    cx.setLineDash([2, 12]);
    cx.beginPath();
    cx.ellipse(W / 2, H / 2, W * 0.31, H * 0.2, t * 0.004, 0, Math.PI * 2);
    cx.ellipse(W / 2, H / 2, W * 0.18, H * 0.34, -t * 0.003, 0, Math.PI * 2);
    cx.stroke();
    cx.setLineDash([]);

    /* marcas de un instrumento cuyo origen quedó en otra parte */
    cx.strokeStyle = "rgba(140, 255, 170, 0.075)";
    cx.beginPath();
    for (let i = 0; i < 18; i++) {
      const x = (i + 0.5) * W / 18;
      const largo = i % 3 === 0 ? 11 : 5;
      cx.moveTo(x, H * 0.06);
      cx.lineTo(x, H * 0.06 + largo);
      cx.moveTo(W - x, H * 0.94);
      cx.lineTo(W - x, H * 0.94 - largo);
    }
    cx.stroke();
    cx.restore();
  }

  function pintaInstrumentoDelCuadro(t, audio) {
    if (modo === "paridad") pintaParidad(t, audio);
    else if (modo === "correccion") pintaCorreccion(t);
    else if (modo === "onda") pintaEspectro(t, audio);
    else if (modo === "red") pintaRed(t, audio);
    else if (modo === "region") pintaH6(t, audio, "region");
    else if (modo === "filamentos") pintaH6(t, audio, ESTADO.rumbo || "filamentos");
    else if (modo === "fuera") pintaH6(t, audio, "polvo");
    else if (modo === "otra") pintaOtra(t, audio);
    else if (modo === "oscura") pintaLente(t, audio);
    else if (modo === "acuse") pintaMitades();
  }

  function pintaParidad(t, audio) {
    cx.save();
    cx.strokeStyle = `rgba(140, 255, 170, ${0.09 + audio.nivel * 0.08})`;
    cx.fillStyle = "rgba(140, 255, 170, 0.22)";
    cx.font = "10px everex, monospace";
    cx.textAlign = "center";
    for (let i = 0; i < 18; i++) {
      const n = filamentos[i];
      const x = n.x * W;
      const y = n.y * H;
      const dx = 12 + Math.sin(t * 0.4 + n.fase) * 5;
      cx.beginPath();
      cx.moveTo(x - dx, y);
      cx.lineTo(x + dx, y);
      cx.stroke();
      cx.fillText(String((i + semillaVisual) % 2), x - dx - 5, y + 3);
      cx.fillText(String((i + semillaVisual + 1) % 2), x + dx + 5, y + 3);
    }
    cx.restore();
  }

  function pintaCorreccion(t) {
    const edad = (performance.now() - entradaCuadro) / 1000;
    const error = Math.max(0.5, 18 * Math.pow(0.5, edad / 12));
    cx.save();
    cx.strokeStyle = "rgba(140, 255, 170, 0.11)";
    cx.fillStyle = "rgba(140, 255, 170, 0.09)";
    for (let i = 0; i < 11; i++) {
      const y = H * (0.12 + i * 0.07);
      const salto = Math.sin(t * (3 + i * 0.07) + i) * error;
      cx.strokeRect(W * 0.08 + salto, y, W * 0.84 - salto * 2, H * 0.035);
      if ((i + Math.floor(t * 2)) % 5 === 0) {
        cx.fillRect(W * 0.08, y, W * (0.08 + ruidoFirma(i + Math.floor(t) * 13) * 0.2), 1);
      }
    }
    cx.restore();
  }

  function pintaEspectro(t, audio) {
    const bandas = [
      [413, 123, 91, 255], [440, 74, 96, 255], [474, 61, 123, 255],
      [517, 61, 255, 123], [570, 230, 255, 61], [590, 255, 226, 61],
      [620, 255, 154, 61], [686, 255, 74, 61],
    ];
    cx.save();
    cx.globalCompositeOperation = "screen";
    bandas.forEach(([nm, r, g, b], i) => {
      const x = W * (0.12 + i * 0.105);
      const alto = H * (0.16 + Math.sin(t * 0.3 + i) * 0.025 + audio.agudo * 0.08);
      cx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.24)`;
      cx.beginPath();
      cx.moveTo(x, H * 0.18);
      cx.lineTo(x, H * 0.18 + alto);
      cx.stroke();
      cx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.36)`;
      cx.font = "10px everex, monospace";
      cx.textAlign = "center";
      cx.fillText(String(nm), x, H * 0.18 + alto + 14);
    });
    cx.restore();
  }

  function pintaRed(t, audio) {
    cx.save();
    cx.strokeStyle = `rgba(140, 255, 170, ${0.13 + audio.agudo * 0.12})`;
    cx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = W * (0.22 + i * 0.28);
      const y = H * 0.78;
      const fase = (t / 2.6 + i / 3) % 1;
      cx.beginPath();
      cx.arc(x, y, 20, Math.PI * 1.08, Math.PI * 1.92);
      cx.moveTo(x, y - 19); cx.lineTo(x, y + 20);
      cx.stroke();
      for (let a = 0; a < 3; a++) {
        const r = 28 + ((fase + a / 3) % 1) * H * 0.34;
        cx.globalAlpha = Math.max(0, 0.32 - r / H * 0.42);
        cx.beginPath();
        cx.arc(x, y - 12, r, Math.PI * 1.18, Math.PI * 1.82);
        cx.stroke();
      }
    }
    cx.globalAlpha = 1;
    cx.restore();
  }

  function pintaH6(t, audio, parecido) {
    const nube = parecido === "nube" || parecido === "region";
    const red = parecido === "red";
    cx.save();
    cx.globalCompositeOperation = "screen";
    filamentos.forEach((n, i) => {
      const p = filamentos[n.par];
      const x0 = n.x * W, y0 = n.y * H;
      const x1 = p.x * W, y1 = p.y * H;
      const respiración = Math.sin(t * (0.12 + ruidoFirma(i + 300) * 0.2) + n.fase);
      const deriva = (8 + audio.nivel * 48) * respiración;
      cx.strokeStyle = red
        ? `rgba(140, 255, 170, ${0.08 + audio.beat * 0.12})`
        : `rgba(140, 255, 170, ${0.045 + audio.nivel * 0.1})`;
      cx.lineWidth = i % 7 === 0 ? 1.4 : 0.6;
      cx.beginPath();
      cx.moveTo(x0, y0);
      if (red) {
        cx.lineTo(x1, y0);
        cx.lineTo(x1, y1);
      } else {
        cx.quadraticCurveTo((x0 + x1) / 2 + deriva, (y0 + y1) / 2 - deriva, x1, y1);
      }
      cx.stroke();
      if (!nube || i % 3 === 0) {
        cx.fillStyle = "rgba(205, 255, 220, 0.18)";
        cx.fillRect(x0 - 1, y0 - 1, 2, 2);
      }
    });
    if (parecido === "polvo") pintaPaquetes(t, audio);
    cx.restore();
  }

  function pintaPaquetes(t, audio) {
    if (paquetes.length < 26 && ruidoFirma(Math.floor(t * 6) + paquetes.length * 17) > 0.55) {
      paquetes.push({
        x: ret.x,
        y: ret.y,
        vx: (ruidoFirma(paquetes.length + 700) - 0.5) * (1.4 + audio.agudo * 5),
        vy: (ruidoFirma(paquetes.length + 800) - 0.62) * (1.2 + audio.grave * 4),
        a: 0.7,
      });
    }
    paquetes.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.a *= 0.986;
      cx.fillStyle = `rgba(205, 255, 220, ${p.a})`;
      cx.fillRect(p.x, p.y, 2, 2);
    });
    paquetes = paquetes.filter((p) => p.a > 0.035 && p.x > 0 && p.x < W && p.y > 0 && p.y < H);
  }

  function pintaOtra(t, audio) {
    cx.save();
    cx.lineWidth = 1;
    for (let voz = 0; voz < 2; voz++) {
      cx.strokeStyle = voz === 0
        ? `rgba(140, 255, 170, ${0.2 + audio.nivel * 0.1})`
        : `rgba(255, 184, 74, ${0.18 + audio.nivel * 0.08})`;
      cx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const q = i / 80;
        const x = W * (0.08 + q * 0.84);
        const separación = H * (0.12 + Math.min(0.16, (performance.now() - entradaCuadro) / 300000));
        const y = H / 2 + (voz ? 1 : -1) * separación +
          Math.sin(q * 8 + t * (voz ? -0.18 : 0.22)) * (16 + audio.grave * 35);
        i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
      }
      cx.stroke();
    }
    cx.restore();
  }

  function pintaLente(t, audio) {
    cx.save();
    cx.translate(masa.x, masa.y);
    cx.rotate(t * 0.013);
    cx.strokeStyle = `rgba(140, 255, 170, ${0.045 + audio.grave * 0.09})`;
    for (let i = 0; i < 9; i++) {
      const r = 32 + i * 19;
      cx.beginPath();
      cx.ellipse(0, 0, r * (1 + audio.grave * 0.18), r * 0.58,
        i * 0.17, i * 0.41, i * 0.41 + Math.PI * (0.45 + i * 0.025));
      cx.stroke();
    }
    cx.restore();
  }

  function pintaMitades() {
    const edad = (Date.now() - ultimaMitad) / 9000;
    const pasos = Math.max(1, Math.round(1 / Math.max(visibles, 0.04)));
    cx.save();
    cx.strokeStyle = `rgba(170, 194, 180, ${0.08 * (1 - Math.min(1, edad))})`;
    cx.beginPath();
    for (let i = 1; i < pasos; i++) {
      const x = i * W / pasos;
      cx.moveTo(x, H * 0.08); cx.lineTo(x, H * 0.92);
    }
    cx.stroke();
    cx.restore();
  }

  function torre() {
    cx.strokeStyle = "rgba(140, 255, 170, 0.35)";
    cx.lineWidth = 1;
    const bx = W * 0.78, by = H * 0.92;
    cx.beginPath();
    cx.moveTo(bx, by); cx.lineTo(bx, by - H * 0.42);
    cx.moveTo(bx - 26, by); cx.lineTo(bx - 26, by - H * 0.42);
    for (let i = 0; i < 9; i++) {
      const y = by - i * H * 0.05;
      cx.moveTo(bx - 26, y); cx.lineTo(bx, y - 12);
      cx.moveTo(bx, y); cx.lineTo(bx - 26, y - 12);
    }
    /* plato y sus tres ecos: todavía escucha a distancia cero */
    cx.moveTo(bx - 13, by - H * 0.42);
    cx.lineTo(bx - 13, by - H * 0.5);
    cx.arc(bx - 13, by - H * 0.5, 22, Math.PI * 0.12, Math.PI * 0.88);
    cx.stroke();
    const fase = (performance.now() / 3200) % 1;
    for (let i = 0; i < 3; i++) {
      const r = 30 + ((fase + i / 3) % 1) * 100;
      cx.globalAlpha = Math.max(0, 0.24 - r / 500);
      cx.beginPath();
      cx.arc(bx - 13, by - H * 0.5, r, Math.PI * 1.12, Math.PI * 1.88);
      cx.stroke();
    }
    cx.globalAlpha = 1;
    cx.fillStyle = "rgba(140, 255, 170, 0.5)";
    cx.font = "13px unscii, monospace";
    cx.textAlign = "left";
    cx.fillText("⊕ distancia: 0 · la ventana abierta", 24, H - 28);
  }

  /* VIDA MEDIA: la curva se dibuja y no toca nunca el suelo */
  function curva() {
    curvaT = Math.min(1, curvaT + 0.0012);
    const x0 = W * 0.12, x1 = W * 0.88, y0 = H * 0.2, y1 = H * 0.82;
    cx.strokeStyle = "rgba(140, 255, 170, 0.5)";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(x0, y1); cx.lineTo(x1, y1);      // el suelo
    cx.moveTo(x0, y1); cx.lineTo(x0, y0);
    for (let i = 1; i <= 5; i++) {
      const x = x0 + (1 - Math.pow(0.5, i)) * (x1 - x0);
      cx.moveTo(x, y1 - 5); cx.lineTo(x, y1 + 5);
    }
    cx.stroke();
    cx.strokeStyle = "rgba(200, 255, 220, 0.8)";
    cx.beginPath();
    const n = Math.floor(200 * curvaT);
    for (let i = 0; i <= n; i++) {
      const t = i / 200;
      const x = x0 + t * (x1 - x0);
      const y = y0 + (y1 - y0) * (1 - Math.pow(0.5, t * 5)) * 0.96;
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    }
    cx.stroke();
    cx.fillStyle = "rgba(140, 255, 170, 0.28)";
    cx.font = "9px everex, monospace";
    cx.textAlign = "center";
    for (let i = 1; i <= 5; i++) {
      const x = x0 + (1 - Math.pow(0.5, i)) * (x1 - x0);
      cx.fillText(`1/${Math.pow(2, i)}`, x, y1 + 18);
    }
  }

  function pintaOndas() {
    ondas.forEach((o) => {
      o.r += 2.6;
      o.alpha *= 0.985;
      cx.strokeStyle = `rgba(140, 255, 170, ${o.alpha})`;
      cx.lineWidth = 1;
      cx.beginPath();
      /* la onda vuelve deformada: no es un círculo perfecto */
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
        const rr = o.r * (1 + Math.sin(a * 3 + o.r * 0.05) * 0.06);
        const x = W / 2 + Math.cos(a) * rr;
        const y = H / 2 + Math.sin(a) * rr;
        a === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
      }
      cx.stroke();
    });
    ondas = ondas.filter((o) => o.alpha > 0.03 && o.r < Math.max(W, H));
  }

  function pintaReticula(audio) {
    /* deriva sola, lenta: es el ojo de la sonda, no un cursor */
    const t = Date.now() / 1000;
    const ix = W / 2 + Math.sin(t * 0.21) * W * 0.3;
    const iy = H / 2 + Math.sin(t * 0.13 + 1.7) * H * 0.26;
    ret.tx += (ix - ret.tx) * 0.004;
    ret.ty += (iy - ret.ty) * 0.004;
    ret.x += (ret.tx - ret.x) * 0.03;
    ret.y += (ret.ty - ret.y) * 0.03;
    const r = 14 + audio.nivel * 7;
    cx.strokeStyle = "rgba(140, 255, 170, 0.55)";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.arc(ret.x, ret.y, r, 0, Math.PI * 2);
    cx.moveTo(ret.x - r * 1.7, ret.y); cx.lineTo(ret.x - r * 0.6, ret.y);
    cx.moveTo(ret.x + r * 0.6, ret.y); cx.lineTo(ret.x + r * 1.7, ret.y);
    cx.moveTo(ret.x, ret.y - r * 1.7); cx.lineTo(ret.x, ret.y - r * 0.6);
    cx.moveTo(ret.x, ret.y + r * 0.6); cx.lineTo(ret.x, ret.y + r * 1.7);
    cx.stroke();

    /* dos arcos fuera de fase: nivel y graves no apuntan al mismo sitio */
    cx.strokeStyle = `rgba(140, 255, 170, ${0.18 + audio.agudo * 0.22})`;
    cx.beginPath();
    cx.arc(ret.x, ret.y, r * 2.35, t * 0.22, t * 0.22 + Math.PI * 0.72);
    cx.arc(ret.x, ret.y, r * (2.8 + audio.grave), -t * 0.13, -t * 0.13 + Math.PI * 0.44);
    cx.stroke();
    cx.fillStyle = "rgba(140, 255, 170, 0.32)";
    cx.font = "9px everex, monospace";
    cx.textAlign = "left";
    cx.fillText(`${Math.round(ret.x).toString(16)}:${Math.round(ret.y).toString(16)}`, ret.x + r * 2, ret.y - r * 1.2);
  }

  return { iniciar, config, reticula, apunta, ping, teclaInvader };
})();
