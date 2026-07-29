/* VIDA MEDIA · EN VIVO — consola.js
   el motor de la consola: el teclado del performer, el avance de
   cuadros, el HUD, el modo ensayo, las puertas y el pánico.
   el poeta manda; el reloj informa. */

"use strict";

const CONSOLA = (() => {
  let refs = {};

  function boot() {
    refs = {
      nave: document.getElementById("nave"),
      texto: document.getElementById("texto"),
      hydra: document.getElementById("hydra"),
      hudNave: document.getElementById("hud-nave"),
      hudCuadro: document.getElementById("hud-cuadro"),
      hudMicro: document.getElementById("hud-micro"),
      hudCapas: document.getElementById("hud-capas"),
      hudSemilla: document.getElementById("hud-semilla"),
      hudAviso: document.getElementById("hud-aviso"),
      ensayo: document.getElementById("ensayo"),
      portada: document.getElementById("portada"),
    };
    NAVE.iniciar(refs.nave);
    TEXTO.iniciar(refs.texto);
    VISUALES.iniciar(refs.hydra);
    refs.hudSemilla.textContent = "semilla " + ESTADO.seed;
    if (ESTADO.ensayo) document.body.classList.add("ensayando");
    if ("speechSynthesis" in window) speechSynthesis.getVoices();   // precalienta

    document.getElementById("despierta").addEventListener("click", despertar);
    document.addEventListener("keydown", teclas);
    setInterval(hud, 250);
  }

  async function despertar() {
    refs.portada.querySelector("#despierta").textContent = "[ despertando… ]";
    await SONIDO.iniciar();
    refs.portada.remove();
    ir(0);
  }

  /* ── el avance de cuadros ── */

  function ir(n) {
    n = Math.max(0, Math.min(SETLIST.length - 1, n));
    /* dejar PLATAFORMA arranca la misión: la pila empieza a gastarse */
    if (ESTADO.t0 === null && n > 0) ESTADO.t0 = Date.now();
    ESTADO.cuadro = n;
    const c = SETLIST[n];
    ESTADO.log.push({ n, titulo: c.titulo, t: tMision() });
    TEXTO.tocar(c);
    NAVE.config(c);
    VISUALES.preset(c.hydra);
    if (SONIDO.listo) SONIDO.cuadro(c);
    hud();
    if (ESTADO.ensayo) pintaEnsayo();
  }

  /* ── el teclado del performer ── */

  /* b es de blackout (sagrada): el grado 6 vive en la coma */
  const GRADOS = { z: 0, x: 1, c: 2, v: 3, n: 4, m: 5, ",": 6 };

  function teclas(e) {
    if (refs.portada.isConnected) {
      if (e.key === "Enter") despertar();
      return;
    }
    /* en EL NÚMERO, las flechas son de la nave */
    if (NAVE.teclaInvader(e.key)) { e.preventDefault(); return; }

    const k = e.key;
    if (k === " ") { e.preventDefault(); ir(ESTADO.cuadro + 1); return; }
    if (k === "ArrowRight") { ir(ESTADO.cuadro + 1); return; }
    if (k === "ArrowLeft") { ir(ESTADO.cuadro - 1); return; }
    if (/^[1-9]$/.test(k)) { ir(parseInt(k, 10)); return; }
    if (k === "0") { ir(16); return; }

    const K = k.toLowerCase();
    if (K === "k") { SONIDO.panico(); aviso(ESTADO.panico ? "PÁNICO: audio muerto" : "audio de vuelta"); return; }
    if (K === "b") {
      ESTADO.blackout = !ESTADO.blackout;
      document.body.classList.toggle("negro", ESTADO.blackout);
      return;
    }
    if (K === "f") { pantallaCompleta(); return; }
    if (K === "m" && e.shiftKey) { aviso("música " + (SONIDO.alternarMusica() ? "on" : "off")); return; }
    if (K === "h") { aviso("hydra " + (VISUALES.alternar() ? "on" : "off")); return; }
    if (K === "d") { aviso("micro seco " + (SONIDO.alternarDry() ? "ON (¡feedback!)" : "off")); return; }
    if (K === "g") { rafaga(); return; }
    if (K === "e") { ESTADO.ensayo = !ESTADO.ensayo; document.body.classList.toggle("ensayando", ESTADO.ensayo); if (ESTADO.ensayo) pintaEnsayo(); return; }
    if (K === "t") { SONIDO.leerR27(SETLIST[ESTADO.cuadro].lectura); return; }
    if (K === "y") { SONIDO.coro(SETLIST[ESTADO.cuadro].boletin); return; }
    if (K === "r") {
      if (ESTADO.cuadro === 0 && ESTADO.t0 === null) {
        const nueva = Math.floor(Math.random() * 1e6).toString(36);
        location.href = "?seed=" + nueva + (ESTADO.ensayo ? "&ensayo" : "");
      }
      return;
    }
    /* v suelta es el grado 3 del acorde; Shift+V prende/apaga el vocoder */
    if (K === "v" && e.shiftKey) { aviso("vocoder " + (SONIDO.alternarVocoder() ? "on" : "off")); return; }
    if (GRADOS[K] !== undefined) { SONIDO.notaVocoder(GRADOS[K]); return; }
  }

  function pantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }

  function rafaga() {
    document.body.classList.add("glitch");
    VISUALES.flash("glitchazo", 2000);
    SONIDO.ruido(1.5);
    setTimeout(() => document.body.classList.remove("glitch"), 2000);
  }

  /* ── las puertas (hipervínculos en vivo) ── */

  function puerta(fx, palabra, el) {
    if (!ESTADO.heridas.includes(palabra)) ESTADO.heridas.push(palabra);
    el.classList.add("herida");
    if (SONIDO.listo) SONIDO.clicPuerta();
    if (fx === "damero") VISUALES.flash("damero", 5000);
    if (fx === "filamento") {
      ESTADO.filamentos.push(palabra);
      aviso("«" + palabra + "» quedó en los filamentos");
    }
  }

  /* ── HUD: telemetría que no miente ── */

  function hud() {
    const p = (pila() * 100).toFixed(1);
    const t = Math.floor(tMision());
    const mm = String(Math.floor(t / 60)).padStart(2, "0");
    const ss = String(t % 60).padStart(2, "0");
    refs.hudNave.textContent = `R-27 · pila ${p}% · t+${mm}:${ss} · H6`;
    const c = SETLIST[ESTADO.cuadro];
    refs.hudCuadro.textContent = `${ESTADO.cuadro}/16 · ${c.titulo}`;
    refs.hudMicro.textContent = ESTADO.audioOK
      ? (ESTADO.micOK ? "micro: señal" : "micro: sin señal")
      : "audio: dormido";
    refs.hudMicro.classList.toggle("muerto", ESTADO.audioOK && !ESTADO.micOK);
    refs.hudCapas.textContent =
      (ESTADO.capas.musica ? "♪" : "·") + " " +
      (ESTADO.capas.vocoder ? "▓" : "·") + " " +
      (VISUALES.activo && ESTADO.capas.hydra ? "✦" : "·") +
      (ESTADO.panico ? "  ⚠ PÁNICO" : "");
  }

  let avisoTimer = null;
  function aviso(msj) {
    refs.hudAviso.textContent = msj;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => { refs.hudAviso.textContent = ""; }, 3000);
  }

  /* ── modo ensayo ── */

  function pintaEnsayo() {
    const filas = ESTADO.log.map((l, i) => {
      const fin = i + 1 < ESTADO.log.length ? ESTADO.log[i + 1].t : tMision();
      const real = Math.round(fin - l.t);
      const meta = SETLIST[l.n].dur;
      const marca = Number.isFinite(meta) && real > meta ? " pasado" : "";
      return `<div class="fila${marca}">${String(l.n).padStart(2, "0")} ${l.titulo.slice(0, 24)} — ${real}s${Number.isFinite(meta) ? " / " + meta + "s" : ""}</div>`;
    }).join("");
    const total = Math.round(tMision());
    const clase = total > 1200 ? "pasado" : "";
    refs.ensayo.innerHTML =
      `<div><b>ensayo · ${ESTADO.seed}</b></div>${filas}` +
      `<div class="${clase}">total ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} / 20:00</div>` +
      `<button id="exporta">exportar log</button>`;
    const b = document.getElementById("exporta");
    if (b) b.addEventListener("click", exportaLog);
  }

  function exportaLog() {
    const lineas = ESTADO.log.map((l) => `${Math.round(l.t)}s\t${l.n}\t${l.titulo}`);
    lineas.unshift(`VIDA MEDIA · EN VIVO — corrida · semilla ${ESTADO.seed} · ${new Date().toISOString()}`);
    const blob = new Blob([lineas.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `corrida-${ESTADO.seed}.txt`;
    a.click();
  }

  window.addEventListener("DOMContentLoaded", boot);

  return { ir, puerta, get refs() { return refs; } };
})();
