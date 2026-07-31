/* VIDA MEDIA · EN VIVO — calibracion.js
   Un rito corto antes de la función: mide sala, voz, vocales y aire;
   propone ajustes sin grabar ni conservar audio. */

"use strict";

const CALIBRACION = (() => {
  const auto = new URLSearchParams(location.search).has("calibra");
  const FASES = [
    {
      id: "silencio", dur: 3000, titulo: "01 · SILENCIO DE LA SALA",
      instruccion: "no hables · deja que la consola mida lo que ya estaba aquí",
    },
    {
      id: "voz", dur: 5200, titulo: "02 · VOZ DE LECTURA",
      instruccion: "lee a volumen real: «ninguna transmisión existe entera en un solo lugar»",
    },
    {
      id: "vocales", dur: 5200, titulo: "03 · FORMANTES",
      instruccion: "a — e — i — o — u · largas, sin cantar",
    },
    {
      id: "sibilantes", dur: 4200, titulo: "04 · AIRE Y CONSONANTES",
      instruccion: "sss · fff · shhh · ch · la señal necesita sus bordes",
    },
  ];

  let capa = null;
  let activa = false;
  let corriendo = false;
  let aplicada = false;
  let token = 0;
  let monitorTimer = null;
  let captura = null;
  let refs = {};
  let telemetria = null;
  let muestras = {};
  let resultado = null;
  let frecuenciasPintadas = false;
  const INTERVALO_MUESTREO = 50;

  const limita = (v, a, b) => Math.max(a, Math.min(b, v));
  const aDb = (v) => 20 * Math.log10(Math.max(0.000001, v));

  function percentil(valores, p) {
    const v = valores.filter(Number.isFinite).sort((a, b) => a - b);
    if (!v.length) return 0;
    return v[Math.min(v.length - 1, Math.floor((v.length - 1) * p))];
  }

  function mediana(valores) {
    return percentil(valores, 0.5);
  }

  function calculaAjustes(datos) {
    const silencio = datos.silencio || [];
    const voz = datos.voz || [];
    const vocales = datos.vocales || [];
    const friccion = datos.sibilantes || [];
    const ruido = percentil(silencio.map((m) => m.crudo), 0.88);
    const picoVoz = percentil(voz.map((m) => m.crudo), 0.92);
    const picoVocales = percentil(vocales.map((m) => m.crudo), 0.88);
    const picoSibilantes = percentil(friccion.map((m) => m.crudo), 0.88);
    const gainActual = ((voz[voz.length - 1] || silencio[silencio.length - 1] || {})
      .ajuste || {}).gain || 1.4;
    const relaciónDb = aDb(picoVoz) - aDb(ruido);
    const relaciónVocalesDb = aDb(picoVocales) - aDb(ruido);
    const relaciónSibilantesDb = aDb(picoSibilantes) - aDb(ruido);
    /* Tener permiso de micrófono no garantiza estar leyendo la entrada
       correcta. La voz debe despegar claramente del piso de la sala. */
    const señalValida = silencio.length >= 20 && voz.length >= 20 &&
      vocales.length >= 20 && friccion.length >= 20 &&
      picoVoz >= 0.002 && picoVoz >= ruido * 2 && relaciónDb >= 6 &&
      picoVocales >= 0.001 && picoVocales >= ruido * 1.4 && relaciónVocalesDb >= 3 &&
      picoSibilantes >= 0.001 && picoSibilantes >= ruido * 1.4 && relaciónSibilantesDb >= 3;
    const gateDb = limita(aDb(ruido) + 8, -68, -26);

    const nBandas = Math.max(0, ...vocales.map((m) => (m.bandas || []).length));
    const energíaBandas = Array.from({ length: nBandas }, (_, i) =>
      percentil(vocales.map((m) => ((m.bandas || [])[i] || {}).nivel || 0), 0.82));
    const nSib = Math.max(0, ...friccion.map((m) => (m.sibilantes || []).length));
    const energíaSib = Array.from({ length: nSib }, (_, i) =>
      percentil(friccion.map((m) => ((m.sibilantes || [])[i] || {}).nivel || 0), 0.84));
    const espectroValido = nBandas > 0 && nSib > 0 &&
      energíaBandas.some((v) => Number.isFinite(v) && v > 0) &&
      energíaSib.some((v) => Number.isFinite(v) && v > 0);
    const valida = señalValida && espectroValido;
    const gain = valida
      ? limita(gainActual * 0.38 / Math.max(0.025, picoVoz), 0.55, 4.2)
      : gainActual;
    const centro = mediana(energíaBandas.filter((v) => v > 0.00001)) || 0.01;
    const bandas = energíaBandas.map((v) => valida
      ? limita(Math.pow(centro / Math.max(0.00001, v), 0.22), 0.62, 1.58)
      : 1);

    const centroSib = mediana(energíaSib.filter((v) => v > 0.00001)) || 0.006;
    const sibilantes = energíaSib.map((v) => valida
      ? limita(Math.pow(centroSib / Math.max(0.00001, v), 0.18), 0.72, 1.75)
      : 1);

    return {
      valida, gain, gateDb, bandas, sibilantes,
      medicion: {
        ruido, ruidoDb: aDb(ruido),
        picoVoz, picoVozDb: aDb(picoVoz),
        picoVocales, picoVocalesDb: aDb(picoVocales),
        picoSibilantes, picoSibilantesDb: aDb(picoSibilantes),
        relaciónDb,
        relaciónVocalesDb,
        relaciónSibilantesDb,
        espectroValido,
        energíaBandas,
        energíaSib,
      },
    };
  }

  function construye() {
    capa.innerHTML = `
      <div class="cal-cabecera">
        <span>R-27 · CALIBRACIÓN DEL VOCODER</span>
        <button id="cal-cerrar" aria-label="cerrar">×</button>
      </div>
      <div class="cal-estado">
        <div id="cal-titulo">PREVUELO</div>
        <div id="cal-instruccion">audífonos primero · el micro seco continúa apagado</div>
        <div id="cal-tiempo">—</div>
      </div>
      <div class="cal-medidores">
        ${["crudo", "entrada", "vocoder", "salida"].map((id) => `
          <div class="cal-medidor">
            <span>${id}</span><i><b id="cal-${id}"></b></i><em id="cal-${id}-db">−∞</em>
          </div>`).join("")}
      </div>
      <div class="cal-bandas" id="cal-bandas"></div>
      <div class="cal-diagnostico" id="cal-diagnostico">
        la consola todavía no conoce esta sala
      </div>
      <div class="cal-acciones">
        <button id="cal-inicia">[ comenzar secuencia ]</button>
        <button id="cal-exporta" disabled>[ exportar calibración ]</button>
      </div>`;

    refs = {
      titulo: capa.querySelector("#cal-titulo"),
      instruccion: capa.querySelector("#cal-instruccion"),
      tiempo: capa.querySelector("#cal-tiempo"),
      diagnostico: capa.querySelector("#cal-diagnostico"),
      inicia: capa.querySelector("#cal-inicia"),
      exporta: capa.querySelector("#cal-exporta"),
      bandas: capa.querySelector("#cal-bandas"),
      medidores: Object.fromEntries(["crudo", "entrada", "vocoder", "salida"].map((id) => [
        id,
        { barra: capa.querySelector(`#cal-${id}`), db: capa.querySelector(`#cal-${id}-db`) },
      ])),
    };
    const nBandas = Math.max(1, SONIDO.numeroBandas || 18);
    refs.bandas.style.setProperty("--bandas", nBandas);
    refs.bandas.innerHTML = Array.from({ length: nBandas }, (_, i) =>
      `<i><b data-banda="${i}"></b><em data-f="${i}">—</em></i>`).join("");
    refs.bandBars = [...refs.bandas.querySelectorAll("[data-banda]")];
    refs.bandFreqs = [...refs.bandas.querySelectorAll("[data-f]")];
    capa.querySelector("#cal-cerrar").addEventListener("click", cerrar);
    refs.inicia.addEventListener("click", secuencia);
    refs.exporta.addEventListener("click", exporta);
  }

  function iniciar() {
    if (!SONIDO.listo) return false;
    if (!capa) {
      capa = document.getElementById("calibracion");
      construye();
    }
    if (activa) return true;
    activa = true;
    document.body.classList.add("calibrando");
    SONIDO.modoCalibracion(true);
    if (typeof VISUALES !== "undefined" && typeof VISUALES.modoCalibracion === "function") {
      VISUALES.modoCalibracion(true);
    }
    frecuenciasPintadas = false;
    refs.diagnostico.textContent = ESTADO.micOK
      ? "micro detectado · aún no se conserva ninguna muestra"
      : "micro sin señal · la medición no podrá continuar";
    bucle();
    return true;
  }

  function cerrar() {
    token += 1;
    corriendo = false;
    activa = false;
    if (captura) {
      const termina = captura.resuelve;
      captura = null;
      termina();
    }
    if (refs.inicia) refs.inicia.disabled = false;
    document.body.classList.remove("calibrando");
    SONIDO.modoCalibracion(false);
    if (typeof VISUALES !== "undefined" && typeof VISUALES.modoCalibracion === "function") {
      VISUALES.modoCalibracion(false);
    }
    clearTimeout(monitorTimer);
    monitorTimer = null;
  }

  function alternar() {
    if (activa) cerrar(); else iniciar();
    return activa;
  }

  function bucle() {
    if (!activa) return;
    telemetria = SONIDO.telemetriaVocoder();
    pintaTelemetria(telemetria);
    if (captura) {
      const actual = captura;
      if (actual.mi !== token) {
        captura = null;
        actual.resuelve();
      } else {
        const pasado = performance.now() - actual.inicio;
        refs.tiempo.textContent = Math.max(0,
          (actual.fase.dur - pasado) / 1000).toFixed(1) + "s";
        muestras[actual.fase.id].push(telemetria);
        if (pasado >= actual.fase.dur) {
          captura = null;
          actual.resuelve();
        }
      }
    }
    monitorTimer = setTimeout(bucle, INTERVALO_MUESTREO);
  }

  function porcentajeDb(db) {
    return limita((db + 60) / 60 * 100, 0, 100);
  }

  function pintaTelemetria(t) {
    ["crudo", "entrada", "vocoder", "salida"].forEach((id) => {
      refs.medidores[id].barra.style.width = porcentajeDb(t[id + "Db"]) + "%";
      refs.medidores[id].db.textContent = Number.isFinite(t[id + "Db"])
        ? t[id + "Db"].toFixed(1) + " dB" : "−∞";
    });
    refs.medidores.crudo.barra.classList.toggle("clip", t.crudo > 0.94);
    refs.medidores.salida.barra.classList.toggle("clip", t.salida > 0.94);
    t.bandas.forEach((b, i) => {
      const barra = refs.bandBars[i];
      const f = refs.bandFreqs[i];
      if (barra) barra.style.height = porcentajeDb(b.db) + "%";
      if (f && !frecuenciasPintadas) {
        f.textContent = b.f >= 1000 ? (b.f / 1000).toFixed(1) + "k" : b.f;
      }
    });
    frecuenciasPintadas = true;
  }

  async function secuencia() {
    if (corriendo || !ESTADO.micOK) return;
    corriendo = true;
    resultado = null;
    muestras = {};
    refs.inicia.disabled = true;
    refs.exporta.disabled = true;
    const mi = ++token;

    for (const fase of FASES) {
      if (mi !== token || !activa) return;
      muestras[fase.id] = [];
      refs.titulo.textContent = fase.titulo;
      refs.instruccion.textContent = fase.instruccion;
      await mideFase(fase, mi);
    }
    if (mi !== token || !activa) return;

    resultado = calculaAjustes(muestras);
    if (!resultado.valida) {
      refs.titulo.textContent = "MEDICIÓN NO APLICADA";
      refs.instruccion.textContent =
        "faltó señal clara en una estación · revisa el micrófono y repite la secuencia completa";
      refs.tiempo.textContent = "×";
      refs.diagnostico.textContent =
        `ruido ${resultado.medicion.ruidoDb.toFixed(1)} dB · ` +
        `márgenes voz ${resultado.medicion.relaciónDb.toFixed(1)} dB · ` +
        `vocales ${resultado.medicion.relaciónVocalesDb.toFixed(1)} dB · ` +
        `aire ${resultado.medicion.relaciónSibilantesDb.toFixed(1)} dB · repite las cuatro fases`;
      refs.inicia.textContent = "[ repetir medición ]";
      refs.inicia.disabled = false;
      refs.exporta.disabled = false;
      corriendo = false;
      return;
    }
    const aplicado = SONIDO.aplicarCalibracion(resultado);
    aplicada = true;
    const snr = resultado.medicion.relaciónDb;
    refs.titulo.textContent = "CALIBRACIÓN APLICADA";
    refs.instruccion.textContent = "habla otra vez · la consola ya conoce aproximadamente esta sala";
    refs.tiempo.textContent = "✓";
    refs.diagnostico.textContent =
      `ruido ${resultado.medicion.ruidoDb.toFixed(1)} dB · ` +
      `voz ${resultado.medicion.picoVozDb.toFixed(1)} dB · ` +
      `margen ${snr.toFixed(1)} dB · gain ${aplicado.gain.toFixed(2)}× · ` +
      `puerta ${aplicado.gateDb.toFixed(1)} dB`;
    refs.inicia.textContent = "[ medir otra vez ]";
    refs.inicia.disabled = false;
    refs.exporta.disabled = false;
    corriendo = false;
  }

  function mideFase(fase, mi) {
    return new Promise((res) => {
      captura = { fase, mi, inicio: performance.now(), resuelve: res };
    });
  }

  function documento() {
    const t = telemetria || SONIDO.telemetriaVocoder();
    return {
      pieza: "VIDA MEDIA · EN VIVO",
      sistema: "R-27 · calibración de vocoder · vuelta 8",
      fecha: new Date().toISOString(),
      semilla: ESTADO.seed,
      audio: {
        sampleRate: t.sampleRate,
        baseLatency: t.baseLatency,
        outputLatency: t.outputLatency,
        micOK: t.micOK,
        granularOK: t.granularOK,
      },
      medicionValida: resultado ? resultado.valida : null,
      medicion: resultado ? resultado.medicion : null,
      ajuste: t.ajuste,
      muestrasPorFase: Object.fromEntries(
        Object.entries(muestras).map(([k, v]) => [k, v.length])),
      advertencias: [
        "No contiene ni conserva audio.",
        "Los valores finales se verifican con audífonos, bocinas y sala reales.",
      ],
    };
  }

  function exporta() {
    if (!resultado) return;
    const blob = new Blob([JSON.stringify(documento(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calibracion-vocoder-${ESTADO.seed}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function interceptaTecla(e) {
    if (!activa) return false;
    if (e.key === "Escape") { cerrar(); return true; }
    const k = e.key.toLowerCase();
    /* Pánico, blackout, fullscreen y el propio toggle siguen vivos.
       El resto no debe afinar ni mover la nave durante una medición. */
    if (["k", "b", "f"].includes(k) || (k === "a" && e.shiftKey)) return false;
    return true;
  }

  return {
    iniciar, cerrar, alternar, interceptaTecla, calculaAjustes,
    get activa() { return activa; },
    get aplicada() { return aplicada; },
    get auto() { return auto; },
  };
})();
