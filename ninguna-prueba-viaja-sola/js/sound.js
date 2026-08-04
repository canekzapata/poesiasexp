'use strict';
/* =====================================================================
   EL ESPECTRO TAMBIÉN RECUERDA — sound.js
   esto no compone nada. vuelve audible el modelo de `espectro.js`, que
   corre igual con la bocina apagada.

   un solo organismo: una fundamental herida y sus parciales. navegar no
   estrena una música: continúa el estado heredado. no hay premio por
   clic; un gesto cambia el expediente, y el expediente cambia el sonido.

   la respiración —inhalar, acumular, cruzar un umbral, decaer y
   recomenzar transformado— toma su periodo de la pausa mediana del
   visitante: la señal externa que organiza la música es él.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const MAX_VOCES = 16, MAX_RUIDO = 3, MAX_COLA = 48;
  let ctx = null, maestro = null, limite = null, campo = null, canto = null;
  let voces = [], ruidos = [], encendido = false;
  let respirar = null, refrescar = null, reloj = null;
  let fase = 0;
  let cola = [];            // notas programadas por el contrapunto
  let resonadores = [], envio = null, analizador = null, buf = null;
  let vivas = 0;            // osciladores de nota simultáneos, con tope
  let ultimaEntrada = 0;    // para que las entradas imiten, no se atropellen
  let sonando = [];         // las últimas entradas, para conducir contra ellas

  function disponible() { return !!(window.AudioContext || window.webkitAudioContext); }
  function quiere() { try { return localStorage.getItem('npvs.sonido') === '1'; } catch (e) { return false; } }

  function activar() {
    if (encendido) return true;
    if (!disponible()) return false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      /* nada de picos ni graves peligrosos: el organismo pasa por un
         compresor y un tope de ganancia antes de salir */
      limite = ctx.createDynamicsCompressor();
      limite.threshold.value = -22; limite.ratio.value = 12; limite.attack.value = 0.006;
      maestro = ctx.createGain();
      maestro.gain.value = 0.0001;
      maestro.connect(limite); limite.connect(ctx.destination);
      maestro.gain.exponentialRampToValueAtTime(0.26, ctx.currentTime + 2.4);
      /* sonda de nivel: sin oídos, la única manera honesta de saber si
         esto suena o si está apagado es medirlo. */
      analizador = ctx.createAnalyser();
      analizador.fftSize = 2048;
      buf = new Float32Array(analizador.fftSize);
      limite.connect(analizador);
      /* dos planos: el campo sostenido queda atrás y el canto adelante.
         antes todo estaba en el mismo plano y por eso era una masa. */
      campo = ctx.createGain(); campo.gain.value = 0.42; campo.connect(maestro);
      canto = ctx.createGain(); canto.gain.value = 1.0;  canto.connect(maestro);
      resonar();
      encendido = true;
      try { localStorage.setItem('npvs.sonido', '1'); } catch (e) {}
      construir();
      conectar();
      return true;
    } catch (e) { return false; }
  }

  function apagar() {
    if (!encendido) return;
    encendido = false;
    if (respirar) { respirar(); respirar = null; }
    if (refrescar) { refrescar(); refrescar = null; }
    if (reloj) { reloj(); reloj = null; }
    cola = []; ultimaEntrada = 0; sonando = [];
    for (const v of voces) { try { v.osc.stop(); v.osc.disconnect(); v.g.disconnect(); } catch (e) {} }
    for (const r of ruidos) { try { r.src.stop(); r.src.disconnect(); r.f.disconnect(); r.g.disconnect(); } catch (e) {} }
    for (const r of resonadores) { try { r.d.disconnect(); r.g.disconnect(); r.lp.disconnect(); r.sal.disconnect(); } catch (e) {} }
    resonadores = []; envio = null; vivas = 0;
    voces = []; ruidos = [];
    try { ctx.close(); } catch (e) {}
    ctx = null; maestro = null; limite = null; campo = null; canto = null;
    try { localStorage.setItem('npvs.sonido', '0'); } catch (e) {}
  }

  /* ---- la resonancia -------------------------------------------------
     sin resonancia esto suena a generador de señal. el espacio de esta
     obra no es un reverb genérico: es un banco de peines afinados a los
     parciales vivos del propio organismo, así que **la sala resuena en
     las frecuencias de la fundamental herida**. cuando un bit apaga un
     parcial, la sala también deja de resonar ahí. */
  function resonar() {
    const e = N.espectro.estado();
    const vivos = e.parciales.filter(function (p) { return p.modo !== 'callado'; })
      .sort(function (a, b) { return b.a - a.a; }).slice(0, 6);
    for (const p of vivos) {
      const f = Math.max(30, p.f + p.desv);
      const d = ctx.createDelay(0.25);
      d.delayTime.value = Math.min(0.24, 1 / f);       // peine: resuena en f
      const g = ctx.createGain();
      /* la ganancia del lazo tiene que ser MENOR QUE UNO en todas las
         frecuencias, y ahí estaba el error: un paso-bajos con Q por
         defecto tiene un pico de resonancia, así que 0.88 × ese pico
         pasaba de 1 y el peine se disparaba —medido: +7 dB por segundo
         hasta reventar el filtro y dejar la cadena muda para siempre—.
         ahora el filtro no tiene pico (Q 0.5) y la realimentación se
         queda holgadamente por debajo. */
      g.gain.value = 0.52 + Math.min(0.12, p.a * 0.2);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(6000, f * 8);
      lp.Q.value = 0.5;                                 // sin pico: nunca amplifica
      const sal = ctx.createGain(); sal.gain.value = 0.11;
      d.connect(lp); lp.connect(g); g.connect(d);       // lazo
      d.connect(sal); sal.connect(maestro);
      resonadores.push({ d: d, g: g, lp: lp, sal: sal, p: p });
    }
    envio = ctx.createGain(); envio.gain.value = 0.2;
    for (const r of resonadores) envio.connect(r.d);
    canto.connect(envio);
    campo.connect(envio);
  }

  /* ---- el organismo -------------------------------------------------- */
  function construir() {
    const e = N.espectro.estado();
    const vivos = e.parciales.filter(p => p.modo !== 'callado').slice(0, MAX_VOCES);
    for (const p of vivos) {
      if (p.modo === 'ruido') { if (ruidos.length < MAX_RUIDO) banda(p); continue; }
      voz(p);
      /* un parcial duplicado es dos parciales casi iguales: eso es el
         batimiento, no un efecto añadido */
      if (p.modo === 'duplicado' && voces.length < MAX_VOCES) voz(p, p.desv);
    }
    aplicar(e);
  }

  function voz(p, desv) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = p.i % 3 === 0 ? 'triangle' : 'sine';
    o.frequency.value = Math.max(20, p.f + (desv || p.desv || 0));
    g.gain.value = 0.0001;
    o.connect(g); g.connect(campo);
    o.start();
    voces.push({ osc: o, g: g, p: p, extra: !!desv });
  }

  function banda(p) {
    const n = Math.floor(ctx.sampleRate * 1.2);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    /* el ruido no es degradación sin estructura: es una banda centrada
       en el parcial que el bit convirtió en ruido */
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = Math.max(40, p.f); f.Q.value = 8;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    s.connect(f); f.connect(g); g.connect(campo);
    s.start();
    ruidos.push({ src: s, f: f, g: g, p: p });
  }

  /* las amplitudes salen del modelo, no de una envolvente decorativa */
  function aplicar(e, respiracion) {
    if (!encendido || !ctx) return;
    const t = ctx.currentTime;
    const resp = respiracion === undefined ? 0.6 : respiracion;
    for (const v of voces) {
      const p = v.p;
      const sost = e.sostenidos.indexOf(p.i) >= 0;
      /* debajo del umbral no se oye: permanecer es lo que lo cruza */
      const cruza = sost ? 1 : Math.max(0, resp - p.umbral) / Math.max(0.05, 1 - p.umbral);
      const amp = p.a * cruza * (v.extra ? 0.7 : 1) * (p.fundido ? 0.5 : 1) * 0.5;
      v.g.gain.setTargetAtTime(Math.max(0.0001, amp), t, 0.35);
    }
    for (const r of ruidos) {
      const sost = e.sostenidos.indexOf(r.p.i) >= 0;
      r.g.gain.setTargetAtTime(Math.max(0.0001, r.p.a * (sost ? 0.5 : 0.18) * (0.4 + resp * 0.6)), t, 0.5);
      r.f.Q.setTargetAtTime(Math.min(12, 5 + e.rugosidad * 8), t, 0.9);
    }
  }

  /* ---- respiración: periodo tomado del visitante --------------------- */
  function periodo() {
    const mo = (N.copia && N.mem.d) ? N.copia.modelo() : null;
    return Math.max(6, Math.min(34, (mo && mo.mediana) || 9));
  }

  function conectar() {
    let e = N.espectro.estado();
    const paso = 0.25;
    respirar = N.bus.every(function () {
      if (!encendido) return;
      const T = periodo();
      fase += paso / T;
      /* inhala, acumula, cruza un umbral, decae, recomienza distinta:
         cada ciclo desplaza su propia forma con la rugosidad medida */
      const x = fase % 1;
      const forma = x < 0.62
        ? Math.pow(x / 0.62, 1.5)
        : Math.pow(1 - (x - 0.62) / 0.38, 2.2);
      /* medido: con suelo 0.18 la respiración caía a −65 dBFS, que es
         silencio de verdad en cada valle. respirar no es desaparecer. */
      aplicar(e, 0.45 + forma * 0.55);
    }, 250);

    /* el modelo cambia cuando cambia el expediente, no cada frame */
    refrescar = N.bus.every(function () { if (encendido) e = N.espectro.estado(); }, 3000);
    N.bus.on('espectro:inscripcion', function () { e = N.espectro.estado(); });
    N.bus.on('espectro:sostenido', function () { e = N.espectro.estado(); });
    N.bus.on('bit', function () { reconstruir(); });
    /* cada regreso es una entrada canónica con su transformación */
    N.bus.on('espectro:regreso', function (r) { entrar(r.huella, r.etapa); });
    /* un parcial que cruza el umbral se anuncia diciendo el tema ahí */
    N.bus.on('espectro:sostenido', function (h) { e = N.espectro.estado(); entrar(h, 0); });
    N.bus.on('espectro:copia', function (h) { e = N.espectro.estado(); entrar(h, 1); });

    reloj = N.bus.every(programar, 25);

    /* al encender, el tema se dice una vez: hay que poder reconocerlo
       antes de que empiece a volver deformado */
    N.bus.later(function () {
      if (!encendido) return;
      const esp = N.espectro.guardado();
      const h = esp.huellas[esp.huellas.length - 1] || { id: 'x', parcial: 3, regresos: 0, pagina: N.pagina, clase: 'verdadero' };
      entrar(h, 0);
    }, 2200);
  }

  function reconstruir() {
    if (!encendido) return;
    for (const v of voces) { try { v.osc.stop(ctx.currentTime + 0.4); v.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12); } catch (e) {} }
    for (const r of ruidos) { try { r.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12); r.src.stop(ctx.currentTime + 0.4); } catch (e) {} }
    voces = []; ruidos = [];
    N.bus.later(function () { if (encendido) construir(); }, 450);
  }

  /* ---- contrapunto: el planificador con anticipación -----------------
     el reloj de JavaScript no sirve para articular: las notas se programan
     contra el reloj del audio, mirando 150 ms adelante. de ahí salen los
     ataques, que es lo que faltaba para que esto dejara de ser una masa. */
  function programar() {
    if (!encendido || !ctx) return;
    const horizonte = ctx.currentTime + 0.15;
    while (cola.length && cola[0].cuando <= horizonte) {
      const n = cola.shift();
      if (!n.callado && n.f > 20) tocarNota(n);
    }
    if (cola.length > MAX_COLA) cola = cola.slice(0, MAX_COLA);
  }

  const MAX_VIVAS = 40;
  function tocarNota(n) {
    if (vivas >= MAX_VIVAS) return;
    const t0 = Math.max(ctx.currentTime, n.cuando);
    const base = Math.max(0.0002, Math.min(0.10, n.amp * 0.10));
    const partes = n.timbre || [{ mult: 1, amp: 1, dur: n.dur, ataque: n.ataque }];

    /* una nota es un espectro que evoluciona: los agudos entran con el
       ataque y se van antes, así que el brillo cae solo. eso —y no un
       filtro barrido— es lo que separa un instrumento de un pitido. */
    for (const parte of partes) {
      const f = n.f * parte.mult;
      if (f < 20 || f > 12000) continue;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = (n.modo === 'formante' && parte.mult === 1) ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      if (n.desafina) o.detune.value = n.desafina;
      const at = Math.max(0.003, parte.ataque);
      /* los instrumentos reales pierden parciales al subir de registro:
         una nota aguda con cuatro armónicos hasta 4 kHz es un chillido.
         el brillo se va con la altura, como en cualquier cuerpo. */
      const amp = base * parte.amp / (1 + f / 2600);
      const dur = Math.max(0.08, parte.dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(amp, t0 + at);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.4), t0 + at + dur * 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.98);

      /* modulación en anillo: para lo que ya no se puede asegurar que
         fuera aquello. suma y diferencia, fuera de la serie. */
      if (n.anillo > 0.01) {
        /* anillo de verdad: la portadora se suprime en proporción al
           índice. dejarla entera sonaba a trémolo —el mismo objeto
           temblando— cuando lo que hay que oír es que ya es otro:
           quedan la suma y la diferencia, fuera de la serie. */
        const mod = ctx.createOscillator(), prof = ctx.createGain();
        const anillo = ctx.createGain(), directo = ctx.createGain();
        mod.frequency.value = f * (0.19 + n.anillo * 0.5);
        prof.gain.value = 1;
        anillo.gain.value = 0;
        mod.connect(prof); prof.connect(anillo.gain);
        o.connect(anillo); anillo.connect(g);
        directo.gain.value = Math.max(0, 1 - n.anillo);
        o.connect(directo); directo.connect(g);
        mod.start(t0); mod.stop(t0 + dur + 0.05);
      } else {
        o.connect(g);
      }
      g.connect(canto);
      vivas++;
      o.onended = function () { vivas = Math.max(0, vivas - 1); try { g.disconnect(); } catch (e) {} };
      o.start(t0); o.stop(t0 + dur + 0.06);
    }
  }

  /* una entrada del sujeto, dicha por una voz, en imitación: nunca pisa
     a la anterior, entra después, como cualquier canon. */
  function entrar(huella, etapa) {
    if (!encendido || !ctx) return null;
    let ent = N.voces.entradaPara(huella, etapa);
    /* las voces se escuchan entre sí: movimiento contrario, sin unísonos
       accidentales, y cadencia cuando caen en la misma familia */
    ent = N.voces.conducir(ent, sonando.slice(-2));
    sonando.push(ent);
    if (sonando.length > 3) sonando.shift();
    const plan = N.voces.notas(ent);
    const b = N.voces.pulso();
    const inicio = Math.max(ctx.currentTime + 0.12, ultimaEntrada + b * 2);
    for (const n of plan.notas) cola.push(Object.assign({ cuando: inicio + n.t }, n));
    cola.sort(function (a, b2) { return a.cuando - b2.cuando; });
    ultimaEntrada = inicio;
    N.bus.emit('voces:entrada', { entrada: ent, cadencia: !!ent.cadencia, notas: plan.notas.length,
      calladas: plan.notas.filter(function (x) { return x.callado; }).length });
    return ent;
  }

  /* control mínimo, siempre optativo, nunca autoplay */
  function control(host) {
    const b = document.createElement('button');
    b.className = 'boton-sonido';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    const pinta = function () {
      b.textContent = encendido ? 'bocina encendida' : 'encender bocina';
      b.setAttribute('aria-pressed', encendido ? 'true' : 'false');
    };
    b.addEventListener('click', function () { encendido ? apagar() : activar(); pinta(); });
    pinta();
    (host || document.body).appendChild(b);
    if (quiere()) {
      const una = function () {
        activar(); pinta();
        document.removeEventListener('pointerdown', una);
        document.removeEventListener('keydown', una);
      };
      document.addEventListener('pointerdown', una);
      document.addEventListener('keydown', una);
    }
    return b;
  }

  N.sonido = {
    activar, apagar, control, disponible, quiere,
    get encendido() { return encendido; },
    get voces() { return voces.length + ruidos.length; },
    get cola() { return cola.length; },
    get resonadores() { return resonadores.length; },
    get vivas() { return vivas; },
    entrar: entrar,
    /* nivel real de salida: RMS y pico en dBFS. no es telemetría del
       visitante, es un instrumento de taller. */
    nivel: function () {
      if (!encendido || !analizador) return null;
      analizador.getFloatTimeDomainData(buf);
      let s = 0, pico = 0;
      for (let i = 0; i < buf.length; i++) {
        s += buf[i] * buf[i];
        if (Math.abs(buf[i]) > pico) pico = Math.abs(buf[i]);
      }
      const rms = Math.sqrt(s / buf.length);
      const db = function (v) { return v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -Infinity; };
      return { rms: db(rms), pico: db(pico) };
    }
  };

})(window.NPVS);
