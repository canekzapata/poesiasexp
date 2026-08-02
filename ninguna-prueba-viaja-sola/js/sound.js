'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — sound.js
   bocina rudimentaria. no hay música: hay estado audible. sólo empieza
   después de un gesto explícito y la obra funciona entera sin ella.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  let ctx = null, maestro = null, pulso = null, encendido = false;

  function disponible() { return !!(window.AudioContext || window.webkitAudioContext); }

  function activar() {
    if (encendido) return true;
    if (!disponible()) return false;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = 0.06;
      maestro.connect(ctx.destination);
      encendido = true;
      try { localStorage.setItem('npvs.sonido', '1'); } catch (e) {}
      latido();
      conectar();
      return true;
    } catch (e) { return false; }
  }

  function apagar() {
    if (!encendido) return;
    encendido = false;
    if (pulso) { pulso(); pulso = null; }
    try { ctx.close(); } catch (e) {}
    ctx = null; maestro = null;
    try { localStorage.setItem('npvs.sonido', '0'); } catch (e) {}
  }

  function quiere() { try { return localStorage.getItem('npvs.sonido') === '1'; } catch (e) { return false; } }

  function tono(f, dur, tipo, vol) {
    if (!encendido || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'square';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol || 0.5, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (dur || 0.08));
    o.connect(g); g.connect(maestro);
    o.start(); o.stop(ctx.currentTime + (dur || 0.08) + 0.02);
  }

  function ruido(dur, vol) {
    if (!encendido || !ctx) return;
    const n = Math.floor(ctx.sampleRate * (dur || 0.3));
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    // ruido que revela estructura: se filtra con la presión del campo
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 300 + N.texto.bitsPerdidos() * 90;
    const g = ctx.createGain(); g.gain.value = vol || 0.4;
    s.connect(f); f.connect(g); g.connect(maestro);
    s.start();
  }

  /* el pulso pierde un bit por ciclo: el ritmo se degrada como el mensaje */
  function latido() {
    if (pulso) pulso();
    const mo = N.copia && N.mem.d ? Math.max(4, Math.min(30, (N.copia.modelo().mediana || 8))) : 8;
    let paso = 0;
    pulso = N.bus.every(() => {
      if (!encendido) return;
      const dmin = N.regB.distanciaMinima();
      const base = 110 + dmin * 26;
      const saltar = (paso % 8) === (N.texto.bitsPerdidos() % 8);
      if (!saltar) tono(base, 0.05, 'square', 0.35);
      paso++;
    }, Math.max(420, mo * 70));
  }

  function conectar() {
    N.bus.on('gesto', (g) => {
      if (!encendido) return;
      if (g.k === 'clic') tono(880 + (g.x % 7) * 40, 0.03, 'square', 0.3);   // clic administrativo
      if (g.k === 'espera') tono(160, 0.5, 'sine', 0.2);
    });
    N.bus.on('expulsion', () => ruido(0.4, 0.6));
    N.bus.on('mutacion', () => { tono(520, 0.05, 'sawtooth', 0.3); N.bus.later(() => tono(494, 0.05, 'sawtooth', 0.3), 90); });
    N.bus.on('bit', () => ruido(0.12, 0.5));
    N.bus.on('triangulo', () => { tono(220, 0.5, 'triangle', 0.5); tono(221.7, 0.5, 'triangle', 0.5); }); // diferencia de fase
    N.bus.on('dimension', () => tono(330, 0.3, 'sine', 0.4));
  }

  /* control mínimo, siempre optativo */
  function control(host) {
    const b = document.createElement('button');
    b.className = 'boton-sonido';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    const pinta = () => { b.textContent = encendido ? 'bocina encendida' : 'encender bocina'; b.setAttribute('aria-pressed', encendido ? 'true' : 'false'); };
    b.addEventListener('click', () => { encendido ? apagar() : activar(); pinta(); });
    pinta();
    (host || document.body).appendChild(b);
    // consentimiento recordado: despierta con el siguiente gesto normal
    if (quiere()) {
      const una = () => { activar(); pinta(); document.removeEventListener('pointerdown', una); document.removeEventListener('keydown', una); };
      document.addEventListener('pointerdown', una);
      document.addEventListener('keydown', una);
    }
    return b;
  }

  N.sonido = { activar, apagar, control, disponible, quiere, get encendido() { return encendido; } };

})(window.NPVS);
