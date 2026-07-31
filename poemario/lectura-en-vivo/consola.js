/* VIDA MEDIA · EN VIVO — consola.js
   el motor de la consola: el teclado del performer, el avance de
   cuadros, el HUD, el modo ensayo, las puertas y el pánico.
   el poeta manda; el reloj informa. */

"use strict";

const CONSOLA = (() => {
  let refs = {};
  let autoTimer = null;
  let autoLectura = null;
  let despertando = false;

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
      info: document.getElementById("info-controles"),
      abreInfo: document.getElementById("abre-info"),
    };
    NAVE.iniciar(refs.nave);
    TEXTO.iniciar(refs.texto);
    VISUALES.iniciar(refs.hydra);
    refs.hudSemilla.textContent = "semilla " + ESTADO.seed;
    if (ESTADO.ensayo) document.body.classList.add("ensayando");
    if ("speechSynthesis" in window) speechSynthesis.getVoices();   // precalienta

    document.getElementById("despierta").addEventListener("click", despertar);
    refs.abreInfo.addEventListener("click", alternarInfo);
    document.getElementById("cierra-info").addEventListener("click", cerrarInfo);
    refs.info.addEventListener("cancel", (e) => { e.preventDefault(); cerrarInfo(); });
    document.addEventListener("keydown", teclas);
    setInterval(hud, 250);
  }

  async function despertar() {
    /* Enter sobre el botón también produce click; sin este cerrojo se
       construían dos grafos de Tone y sus worklets competían por nombre. */
    if (despertando || !refs.portada || !refs.portada.isConnected) return;
    despertando = true;
    const botón = refs.portada.querySelector("#despierta");
    botón.textContent = "[ despertando… ]";
    botón.disabled = true;
    try {
      await SONIDO.iniciar();
    } catch (e) {
      /* Una capa de audio nunca debe impedir que la pieza navegue. */
      console.error("audio: arranque incompleto; texto y visuales continúan", e);
    }
    refs.portada.remove();
    ir(0);
    if (typeof CALIBRACION !== "undefined" && CALIBRACION.auto) CALIBRACION.iniciar();
    else if (ESTADO.micOK) aviso("prevuelo: audífonos + Shift+A · calibrar vocoder", 8000);
  }

  function infoAbierta() {
    return !!(refs.info && (refs.info.open || refs.info.hasAttribute("open")));
  }

  function abrirInfo() {
    if (!refs.info || infoAbierta()) return;
    if (typeof refs.info.showModal === "function") refs.info.showModal();
    else refs.info.setAttribute("open", "");
    document.getElementById("cierra-info").focus();
  }

  function cerrarInfo() {
    if (!infoAbierta()) return;
    if (typeof refs.info.close === "function") refs.info.close();
    else refs.info.removeAttribute("open");
    if (refs.abreInfo && refs.abreInfo.isConnected) refs.abreInfo.focus();
  }

  function alternarInfo() {
    if (infoAbierta()) cerrarInfo(); else abrirInfo();
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
    programarAuto(n);
  }

  /* ── el auto-vuelo ──
     la consola avanza sola con las duraciones orientativas: para
     ensayar sin manos y para funcionar como instalación desatendida.
     cualquier tecla de navegación devuelve el mando al poeta. */

  function programarAuto(n) {
    clearTimeout(autoTimer);
    clearTimeout(autoLectura);
    if (!ESTADO.auto) return;
    const c = SETLIST[n];
    const dur = Number.isFinite(c.dur) ? c.dur : 20;   // PLATAFORMA espera 20s
    const espera = dur * 1000 / ESTADO.turbo;
    autoTimer = setTimeout(() => {
      if (!ESTADO.auto || ESTADO.cuadro !== n) return;
      if (n < 16) { ir(n + 1); return; }
      /* después de ACUSE, la instalación vuelve a la torre */
      reiniciarCorrida();
      ir(0);
    }, espera);
    /* la nave lee sola: a veces en cada cuadro, siempre en ACUSE */
    if (ESTADO.turbo === 1 && SONIDO.listo && (n === 16 || AZAR.caos() < 0.4)) {
      autoLectura = setTimeout(() => {
        if (ESTADO.auto && ESTADO.cuadro === n) SONIDO.leerR27(c.lectura);
      }, 5000);
    }
  }

  function reiniciarCorrida() {
    ESTADO.t0 = null;
    ESTADO.heridas = [];
    ESTADO.filamentos = [];
    ESTADO.rumbo = null;
    ESTADO.log.push({ n: -1, titulo: "— nueva corrida —", t: 0 });
  }

  function mandoManual() {
    if (!ESTADO.auto) return;
    ESTADO.auto = false;
    clearTimeout(autoTimer);
    clearTimeout(autoLectura);
    aviso("el poeta retoma el mando");
  }

  /* ── el teclado del performer ── */

  /* b es de blackout (sagrada): el grado 6 vive en la coma */
  const GRADOS = { z: 0, x: 1, c: 2, v: 3, n: 4, m: 5, ",": 6 };

  function teclas(e) {
    if (refs.portada.isConnected) {
      const K = e.key.toLowerCase();
      if (e.repeat) { e.preventDefault(); return; }
      if (K === "i") { e.preventDefault(); alternarInfo(); return; }
      if (infoAbierta()) {
        if (e.key === "Escape") { e.preventDefault(); cerrarInfo(); }
        return;
      }
      if (e.key === "Enter" && e.target === refs.abreInfo) return;
      if (e.key === "Enter") despertar();
      return;
    }
    if (typeof CALIBRACION !== "undefined" && CALIBRACION.interceptaTecla(e)) {
      e.preventDefault();
      return;
    }
    /* en EL NÚMERO, las flechas son de la nave */
    if (NAVE.teclaInvader(e.key)) { e.preventDefault(); return; }
    /* Los controles de consola son gestos discretos. El autorepeat podía
       reconstruir música o apilar cientos de eventos de R-27. */
    if (e.repeat) { e.preventDefault(); return; }

    const k = e.key;
    if (k === " ") { e.preventDefault(); mandoManual(); ir(ESTADO.cuadro + 1); return; }
    if (k === "ArrowRight") { mandoManual(); ir(ESTADO.cuadro + 1); return; }
    if (k === "ArrowLeft") { mandoManual(); ir(ESTADO.cuadro - 1); return; }
    if (/^[1-9]$/.test(k)) { mandoManual(); ir(parseInt(k, 10)); return; }
    if (k === "0") { mandoManual(); ir(16); return; }

    const K = k.toLowerCase();
    if (K === "k") { SONIDO.panico(); aviso(ESTADO.panico ? "PÁNICO: audio muerto" : "audio de vuelta"); return; }
    if (K === "b") {
      ESTADO.blackout = !ESTADO.blackout;
      document.body.classList.toggle("negro", ESTADO.blackout);
      return;
    }
    if (K === "f") { pantallaCompleta(); return; }
    if (K === "a" && e.shiftKey) {
      if (typeof CALIBRACION !== "undefined") {
        aviso("calibración " + (CALIBRACION.alternar() ? "on" : "off"));
      }
      return;
    }
    if (K === "m" && e.shiftKey) { aviso("música " + (SONIDO.alternarMusica() ? "on" : "off")); return; }
    if (K === "h") { aviso("hydra " + (VISUALES.alternar() ? "on" : "off")); return; }
    if (K === "d") { aviso("micro seco " + (SONIDO.alternarDry() ? "ON (¡feedback!)" : "off")); return; }
    if (K === "g") { rafaga(); return; }
    if (K === "a") {
      ESTADO.auto = !ESTADO.auto;
      aviso("auto-vuelo " + (ESTADO.auto ? "on" : "off"));
      if (ESTADO.auto) programarAuto(ESTADO.cuadro);
      else { clearTimeout(autoTimer); clearTimeout(autoLectura); }
      return;
    }
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
    if (fx === "rumboNube" || fx === "rumboRed") {
      ESTADO.rumbo = fx === "rumboNube" ? "nube" : "red";
      aviso("rumbo: " + ESTADO.rumbo);
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
    const calPendiente = ESTADO.cuadro === 0 && ESTADO.micOK &&
      typeof CALIBRACION !== "undefined" && !CALIBRACION.aplicada && !CALIBRACION.activa;
    refs.hudCapas.textContent =
      (ESTADO.capas.musica ? "♪" : "·") + " " +
      (ESTADO.capas.vocoder ? "▓" : "·") + " " +
      (VISUALES.activo && ESTADO.capas.hydra ? "✦" : "·") +
      (ESTADO.auto ? " · auto" : "") +
      (typeof CALIBRACION !== "undefined" && CALIBRACION.activa ? " · cal" : "") +
      (calPendiente ? " · Shift+A calibra vocoder" : "") +
      (ESTADO.panico ? "  ⚠ PÁNICO" : "");
    refs.hudCapas.classList.toggle("pendiente", calPendiente);
  }

  let avisoTimer = null;
  function aviso(msj, duracion) {
    refs.hudAviso.textContent = msj;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => { refs.hudAviso.textContent = ""; }, duracion || 3000);
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
