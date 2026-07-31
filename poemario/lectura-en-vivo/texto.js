/* VIDA MEDIA · EN VIVO — texto.js
   los constructores de texto y el reproductor de guiones.
   todo lo que se escribe aquí también se puede borrar. */

"use strict";

const TEXTO = (() => {
  const RETARDO_INICIAL = 7000;
  let capa = null;        // el contenedor DOM
  let token = 0;          // cancelación de guiones
  let ocultos = [];       // letras de MATERIA OSCURA (las mueve la retícula)
  let rafOculto = null;
  let medirOcultos = false;   // el sitio de las letras se lee una sola vez
  window.addEventListener("resize", () => { medirOcultos = true; });

  const VOCAL = { a: "o", e: "a", i: "e", o: "u", u: "i", á: "ó", é: "á", í: "é", ó: "ú", ú: "í" };

  function iniciar(el) { capa = el; }

  function dormir(ms, mi) {
    return new Promise((res) => setTimeout(() => res(mi === token), ms));
  }

  function desvocaliza(palabra) {
    return palabra.replace(/[aeiouáéíóú]/gi, "·");
  }

  /* si la palabra fue herida en un cuadro anterior, vuelve sin vocales */
  function marcaHeridas(frase) {
    if (!ESTADO.heridas.length) return frase;
    return frase.split(/(\s+)/).map((w) => {
      const limpia = w.toLowerCase().replace(/[^a-záéíóúñü]/g, "");
      return limpia && ESTADO.heridas.includes(limpia) ? desvocaliza(w) : w;
    }).join("");
  }

  function linea(clase) {
    const p = document.createElement("p");
    p.className = "linea " + (clase || "");
    capa.appendChild(p);
    recorta();
    return p;
  }

  /* la capa no scrollea: si hay demasiadas líneas, las viejas se van */
  function recorta() {
    while (capa.children.length > 14) capa.removeChild(capa.firstChild);
  }

  /* ── constructores ── */

  async function teclea(paso, mi) {
    const p = linea(paso.clase);
    const frase = marcaHeridas(paso.t);
    const cps = paso.cps || 18;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "▮";
    p.appendChild(cursor);
    let escrito = "";
    for (let i = 0; i < frase.length; i++) {
      if (token !== mi) return;
      /* CORRECCIÓN: a veces se equivoca, retrocede y plancha */
      if (paso.errores && AZAR.caos() < paso.errores && /[a-záéíóú]/i.test(frase[i])) {
        const mala = String.fromCharCode(97 + Math.floor(AZAR.caos() * 26));
        escrito += mala;
        p.textContent = escrito; p.appendChild(cursor);
        if (!(await dormir(1000 / cps + 120, mi))) return;
        escrito = escrito.slice(0, -1);
        p.textContent = escrito; p.appendChild(cursor);
        if (!(await dormir(90, mi))) return;
      }
      escrito += frase[i];
      p.textContent = escrito;
      p.appendChild(cursor);
      if (typeof SONIDO !== "undefined") SONIDO.tecla();
      if (!(await dormir(1000 / cps, mi))) return;
    }
    cursor.remove();
  }

  function verso(paso) {
    const p = linea(paso.clase);
    if (paso.id) p.id = paso.id;
    p.textContent = marcaHeridas(paso.t);
  }

  async function apila(paso, mi) {
    let cadencia = paso.cadencia || 1400;
    for (let i = 0; i < (paso.n || 5); i++) {
      if (token !== mi) return;
      const p = linea("apilada");
      p.textContent = paso.t;
      p.style.opacity = String(Math.max(0.15, 1 - i * (paso.decae || 0.08)));
      if (!(await dormir(cadencia, mi))) return;
      if (paso.frena) cadencia *= paso.frena;   // VIDA MEDIA: cada vez más lento
    }
  }

  function paridad(paso) {
    const p = linea("conparidad");
    const frase = marcaHeridas(paso.t);
    const arriba = document.createElement("span");
    arriba.textContent = frase;
    const abajo = document.createElement("span");
    abajo.className = "sombra";
    /* la sombra es verdadera: charCode % 2, letra por letra */
    abajo.textContent = [...frase].map((c) => (c === " " ? " " : String(c.charCodeAt(0) % 2))).join("");
    p.appendChild(arriba);
    p.appendChild(document.createElement("br"));
    p.appendChild(abajo);
  }

  async function tacha(paso, mi) {
    const p = linea("");
    p.textContent = paso.t;
    if (!(await dormir(1700, mi))) return;
    p.classList.add("tachada");
  }

  function telar(paso) {
    const p = linea("telar");
    [...paso.t].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "hilo";
      s.style.setProperty("--i", i);
      s.style.animationDelay = (i * 0.11) + "s";
      s.textContent = c === " " ? " " : c;
      p.appendChild(s);
    });
  }

  function columnas(paso, mi) {
    const p = linea("columnas");
    const cols = paso.t.map((t) => {
      const d = document.createElement("span");
      d.className = "columna";
      d.textContent = t;
      p.appendChild(d);
      return d;
    });
    /* la ronda corre en paralelo: no detiene el resto del guion */
    (async () => {
      let turno = 0;
      while (token === mi) {
        cols.forEach((c, i) => c.classList.toggle("despierta", i === turno));
        turno = (turno + 1) % cols.length;
        if (!(await dormir(paso.cadencia || 2600, mi))) return;
      }
    })();
  }

  async function nm(paso, mi) {
    for (const [nombre, valor] of paso.colores) {
      if (token !== mi) return;
      const p = linea("nm");
      const n = document.createElement("span");
      n.textContent = nombre;
      n.className = "nombrecolor";
      n.style.color = colorNm(valor);
      const v = document.createElement("span");
      v.textContent = "  " + valor + " nm";
      p.appendChild(n); p.appendChild(v);
      if (!(await dormir(1500, mi))) return;
      /* el nombre se borra; queda el número */
      n.classList.add("seborra");
    }
  }

  function colorNm(nm) {
    if (nm < 450) return "#7b5bff";
    if (nm < 495) return "#3d7bff";
    if (nm < 570) return "#3dff7b";
    if (nm < 590) return "#ffe23d";
    if (nm < 620) return "#ff9a3d";
    return "#ff4a3d";
  }

  async function eco(paso, mi) {
    verso({ t: paso.t });
    if (typeof NAVE !== "undefined") NAVE.ping();
    if (!(await dormir(paso.retraso || 900, mi))) return;
    const p = linea("eco");
    p.textContent = [...paso.t].map((c) => VOCAL[c] || c).join("");
  }

  function otra(paso) {
    const p = linea("laotra");
    /* pausas mal puestas a propósito */
    p.textContent = paso.t.split(" ").map((w) =>
      AZAR.caos() < 0.22 ? w + "  ·" : w).join(" ");
  }

  function oculto(paso) {
    const p = linea("oculto");
    [...paso.t].forEach((c) => {
      const s = document.createElement("span");
      s.textContent = c === " " ? "\u00a0" : c;
      p.appendChild(s);
      ocultos.push({ el: s, cx: 0, cy: 0 });
    });
    medirOcultos = true;
    armaOculto();
  }

  /* MATERIA OSCURA: las letras sólo se revelan cuando la retícula
     pasa cerca y las deforma — se mide la ausencia por el tirón.

     El sitio de cada letra se mide una sola vez. Antes se leía el
     rectángulo de un span y en seguida se le escribía el transform,
     dentro del mismo bucle: eso obliga al navegador a recalcular la
     disposición letra por letra, sesenta veces por segundo. Ese atoro
     del hilo principal es el que llega tarde al planificador del audio. */
  function armaOculto() {
    if (rafOculto) return;
    const paso = () => {
      if (!ocultos.length) { rafOculto = null; return; }
      if (medirOcultos) {
        for (const o of ocultos) o.el.style.transform = "none";
        for (const o of ocultos) {
          const b = o.el.getBoundingClientRect();
          o.cx = b.left + b.width / 2;
          o.cy = b.top + b.height / 2;
        }
        medirOcultos = false;
      }
      const r = (typeof NAVE !== "undefined") ? NAVE.reticula() : { x: -9999, y: -9999 };
      for (const o of ocultos) {
        const dx = o.cx - r.x;
        const dy = o.cy - r.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const cerca = Math.max(0, 1 - d / 190);
        o.el.style.opacity = String(0.04 + cerca * 0.9);
        o.el.style.transform = cerca > 0
          ? `translate(${(dx / (d || 1)) * cerca * 9}px, ${(dy / (d || 1)) * cerca * 9}px)`
          : "none";
      }
      rafOculto = requestAnimationFrame(paso);
    };
    rafOculto = requestAnimationFrame(paso);
  }

  function puertas(paso) {
    const p = linea("");
    paso.t.split(/(\s+)/).forEach((w) => {
      const limpia = w.toLowerCase().replace(/[^a-záéíóúñü]/g, "");
      if (limpia && paso.palabras[limpia]) {
        const s = document.createElement("span");
        s.className = "puerta";
        s.textContent = marcaHeridas(w) === w ? w : desvocaliza(w);
        s.addEventListener("click", () => {
          if (typeof CONSOLA !== "undefined") CONSOLA.puerta(paso.palabras[limpia], limpia, s);
        });
        p.appendChild(s);
      } else {
        p.appendChild(document.createTextNode(w));
      }
    });
  }

  async function borra(paso, mi) {
    const lineas = [...capa.children];
    if (paso.modo === "particulas") {
      /* ESCRIBIR FUERA DE SÍ: las letras se sueltan y se dispersan */
      if (typeof SONIDO !== "undefined" && SONIDO.soltarGranos) SONIDO.soltarGranos();
      for (const p of lineas) dispersa(p);
      await dormir(1400, mi);
      return;
    }
    if (paso.modo === "mitades") {
      /* ACUSE: la mitad, luego la mitad de la mitad… nunca todas de golpe */
      let vivas = lineas;
      while (vivas.length > 1 && token === mi) {
        vivas = vivas.filter((p, i) => {
          if (i % 2 === 0) { p.remove(); return false; }
          return true;
        });
        if (!(await dormir(1200, mi))) return;
      }
      return;
    }
    /* letra a letra, de abajo hacia arriba */
    for (const p of lineas.reverse()) {
      if (p.querySelector("span")) { p.remove(); continue; }
      while (p.textContent.length && token === mi) {
        p.textContent = p.textContent.slice(0, -1);
        if (!(await dormir(14, mi))) return;
      }
      p.remove();
    }
  }

  function dispersa(p) {
    const frase = p.textContent;
    p.textContent = "";
    [...frase].forEach((c) => {
      const s = document.createElement("span");
      s.className = "particula";
      s.textContent = c === " " ? " " : c;
      p.appendChild(s);
      const dx = (AZAR.caos() - 0.5) * 600;
      const dy = (AZAR.caos() - 0.7) * 400;
      const rot = (AZAR.caos() - 0.5) * 720;
      requestAnimationFrame(() => {
        s.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        s.style.opacity = "0";
      });
    });
    setTimeout(() => p.remove(), 1600);
  }

  function filamentosVuelven() {
    /* lo que se escribió afuera, vuelve deformado */
    if (!ESTADO.filamentos.length) return;
    const p = linea("eco");
    p.textContent = ESTADO.filamentos
      .map((w) => [...w].map((c) => VOCAL[c] || c).join(""))
      .join("   ");
  }

  function contador() {
    const p = linea("contador");
    p.id = "elcontador";
    let n = AZAR.ent(700, 900);
    const elegido = AZAR.ent(0, 9);   // el número que se repite
    p.dataset.elegido = String(elegido);
    const tic = setInterval(() => {
      if (!document.getElementById("elcontador")) { clearInterval(tic); return; }
      /* el número aparece más veces de las que el azar permite */
      n += AZAR.caos() < 0.3 ? (10 + elegido - (n % 10)) : AZAR.ent(1, 7);
      p.textContent = String(n).padStart(6, "0");
      if (n % 10 === elegido && typeof SONIDO !== "undefined") SONIDO.esaNota();
    }, 900);
  }

  function limpia() {
    ocultos = [];
    medirOcultos = false;
    capa.innerHTML = "";
  }

  /* ── el reproductor de guiones ── */

  const PASOS = { teclea, verso, apila, paridad, tacha, telar, columnas, nm, eco, otra, oculto, puertas, borra, contador, filamentosVuelven };

  async function tocar(cuadro) {
    token += 1;
    const mi = token;
    limpia();
    /* Cada cuadro deja entrar primero a la nave, la música y Hydra.
       Después de siete segundos aparece la escritura. En modo turbo
       la pausa se comprime junto con el resto del ensayo. */
    const retardo = Number.isFinite(cuadro.esperaTexto)
      ? Math.max(0, cuadro.esperaTexto)
      : RETARDO_INICIAL;
    if (!(await dormir(retardo / Math.max(1, ESTADO.turbo || 1), mi))) return;
    do {
      for (const paso of cuadro.guion) {
        if (token !== mi) return;
        if (paso.f === "espera") { if (!(await dormir(paso.ms, mi))) return; continue; }
        if (paso.f === "limpia") { limpia(); continue; }
        const fn = PASOS[paso.f];
        if (fn) await fn(paso, mi);
      }
      if (cuadro.bucle && token === mi) { if (!(await dormir(1500, mi))) return; limpia(); }
    } while (cuadro.bucle && token === mi);
  }

  /* los invaders muerden el verso: un carácter menos por dígito muerto */
  function hueco() {
    const p = document.getElementById("versoInvadido");
    if (!p || !p.textContent.trim()) return;
    const idx = [...p.textContent].map((c, i) => (c === " " || c === "▁" ? -1 : i)).filter((i) => i >= 0);
    if (!idx.length) return;
    const i = idx[Math.floor(AZAR.caos() * idx.length)];
    p.textContent = p.textContent.slice(0, i) + "▁" + p.textContent.slice(i + 1);
  }

  return { iniciar, tocar, limpia, hueco };
})();
