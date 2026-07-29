/* VIDA MEDIA · EN VIVO — nave.js
   el canvas de la nave: starfield, retícula, torre, lente gravitacional,
   la curva que no toca el suelo, las ondas del reloj de ecos y los
   invaders de EL NÚMERO. sin librerías. */

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

  const N_ESTRELLAS = 240;

  function iniciar(canvas) {
    cv = canvas;
    cx = cv.getContext("2d");
    mide();
    window.addEventListener("resize", mide);
    for (let i = 0; i < N_ESTRELLAS; i++) estrellas.push(nueva(true));
    ret.x = ret.tx = W / 2; ret.y = ret.ty = H / 2;
    requestAnimationFrame(paso);
  }

  function mide() {
    W = cv.width = cv.clientWidth;
    H = cv.height = cv.clientHeight;
  }

  function nueva(cualquierZ) {
    return {
      x: (AZAR.caos() - 0.5) * W * 2,
      y: (AZAR.caos() - 0.5) * H * 2,
      z: cualquierZ ? AZAR.caos() * 1.4 + 0.1 : 1.5,
      capa: Math.floor(AZAR.caos() * 3),
    };
  }

  function config(cuadro) {
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
    if (ESTADO.blackout) { cx.clearRect(0, 0, W, H); return; }
    cx.clearRect(0, 0, W, H);

    /* ACUSE: se apaga por mitades, nunca del todo */
    if (flags.apagaMitades && Date.now() - ultimaMitad > 9000 && visibles > 0.04) {
      visibles /= 2;
      ultimaMitad = Date.now();
    }

    /* la masa invisible deriva despacio */
    masa.a += 0.0021;
    masa.x = W / 2 + Math.cos(masa.a) * W * 0.22;
    masa.y = H / 2 + Math.sin(masa.a * 0.7) * H * 0.2;

    const cxm = W / 2, cym = H / 2;
    const nVis = Math.floor(estrellas.length * visibles);
    for (let i = 0; i < estrellas.length; i++) {
      if (i >= nVis) continue;
      const e = estrellas[i];
      /* vuelo radial: las estrellas crecen desde el centro */
      e.z -= vel * 0.004 * (1 + e.capa * 0.6);
      if (e.z <= 0.05) Object.assign(e, nueva(false));
      let px = cxm + e.x / e.z * 0.5;
      let py = cym + e.y / e.z * 0.5;
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) { Object.assign(e, nueva(false)); continue; }

      /* MATERIA OSCURA: la lente dobla lo que sí se ve */
      if (flags.lente) {
        const dx = px - masa.x, dy = py - masa.y;
        const d2 = dx * dx + dy * dy + 400;
        const k = 26000 / d2;
        px += dx * k; py += dy * k;
      }

      const brillo = Math.min(1, 0.25 + (1.5 - e.z));
      cx.fillStyle = `rgba(200, 230, 215, ${brillo * 0.8})`;
      const s = e.capa === 2 ? 2 : 1;
      if (vel > 1.4) {
        /* líneas de velocidad */
        cx.fillRect(px, py, s, s + vel * 2.2);
      } else {
        cx.fillRect(px, py, s, s);
      }
    }

    if (flags.torre) torre();
    if (flags.curva) curva();
    if (ondas.length) pintaOndas();
    if (inv) pasoInvaders();
    pintaReticula();
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
    cx.stroke();
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

  function pintaReticula() {
    /* deriva sola, lenta: es el ojo de la sonda, no un cursor */
    const t = Date.now() / 1000;
    const ix = W / 2 + Math.sin(t * 0.21) * W * 0.3;
    const iy = H / 2 + Math.sin(t * 0.13 + 1.7) * H * 0.26;
    ret.tx += (ix - ret.tx) * 0.004;
    ret.ty += (iy - ret.ty) * 0.004;
    ret.x += (ret.tx - ret.x) * 0.03;
    ret.y += (ret.ty - ret.y) * 0.03;
    const r = 14;
    cx.strokeStyle = "rgba(140, 255, 170, 0.55)";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.arc(ret.x, ret.y, r, 0, Math.PI * 2);
    cx.moveTo(ret.x - r * 1.7, ret.y); cx.lineTo(ret.x - r * 0.6, ret.y);
    cx.moveTo(ret.x + r * 0.6, ret.y); cx.lineTo(ret.x + r * 1.7, ret.y);
    cx.moveTo(ret.x, ret.y - r * 1.7); cx.lineTo(ret.x, ret.y - r * 0.6);
    cx.moveTo(ret.x, ret.y + r * 0.6); cx.lineTo(ret.x, ret.y + r * 1.7);
    cx.stroke();
  }

  return { iniciar, config, reticula, apunta, ping, teclaInvader };
})();
