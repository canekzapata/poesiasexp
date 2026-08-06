'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — text.js
   el mensaje es una cadena de bits. cada vacío cruzado apaga uno.
   la degradación no es un filtro visual: cambia los caracteres.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  /* ---- el mensaje y su erosión ------------------------------------- */

  function mensajeDegradado() {
    const base = N.corpus.MENSAJE;
    const flips = (N.mem.d && N.mem.d.bits.flips) || [];
    const chars = Array.from(base);
    for (const f of flips) {
      const i = f[0], b = f[1];
      if (i < 0 || i >= chars.length) continue;
      const cp = chars[i].codePointAt(0);
      const nuevo = cp ^ (1 << b);
      // se conserva legible como carácter: si sale de rango, cae a un signo
      chars[i] = (nuevo >= 32 && nuevo < 0x2500) ? String.fromCodePoint(nuevo) : '·';
    }
    return chars.join('');
  }

  /* apagar un bit: el gesto que lo provoca queda inscrito */
  function perderBit(causa) {
    const m = N.mem.d;
    const n = m.bits.flips.length;
    const r = N.seed.make(N.estado.semilla, 'bit:' + n);
    const chars = Array.from(N.corpus.MENSAJE);
    const validos = [];
    for (let i = 0; i < chars.length; i++) if (chars[i] !== ' ') validos.push(i);
    // no se repite el mismo carácter mientras queden otros
    const usados = new Set(m.bits.flips.map(f => f[0]));
    const libres = validos.filter(i => !usados.has(i));
    const idx = libres.length ? r.pick(libres) : r.pick(validos);
    const bit = r.i(0, 4);
    m.bits.flips.push([idx, bit, causa || '']);
    m.bits.perdidos = m.bits.flips.length;
    N.mem.guardar(true);
    N.bus.emit('bit', { idx, bit, causa, mensaje: mensajeDegradado() });
    return mensajeDegradado();
  }

  function bitsPerdidos() { return (N.mem.d && N.mem.d.bits.perdidos) || 0; }

  /* ---- distancia entre palabras binarias --------------------------- */
  function hamming(a, b) {
    const n = Math.min(a.length, b.length);
    let d = Math.abs(a.length - b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) d++;
    return d;
  }

  /* ---- telemetría ---------------------------------------------------
     nunca números arbitrarios: sólo estado real. */
  function telemetria() {
    const m = N.mem.d;
    const t = new Date(m.creada);
    const trans = Math.max(0, Date.now() - m.creada);
    const hh = String(Math.floor(trans / 3600000) % 100).padStart(2, '0');
    const mm = String(Math.floor(trans / 60000) % 60).padStart(2, '0');
    const ss = String(Math.floor(trans / 1000) % 60).padStart(2, '0');
    const integridad = Math.max(0, 100 - bitsPerdidos() * 2 - m.contradicciones.length * 3 - m.fragmentos.filter(f => f.estado === 'perdido').length * 2);
    return {
      recibido: hh + ':' + mm + ':' + ss,
      contenido: bitsPerdidos() === 0 ? 'NO DETERMINADO' : 'DETERMINADO EN ' + (100 - integridad) + '% POR EL RECORRIDO',
      origen: m.copia.activa ? 'DEMASIADO CERCA / TAMBIÉN AQUÍ' : 'DEMASIADO CERCA',
      integridad: integridad,
      cuerpos: m.fragmentos.length,
      cargas: m.cargas,
      fecha: t
    };
  }

  /* ---- máscara tipográfica ------------------------------------------
     convierte una frase en un campo de puntos: los cuerpos del
     empaquetamiento pueden escribirla sin usar letras. */
  function mascaraDeTexto(texto, w, h, paso) {
    paso = paso || 6;
    const c = document.createElement('canvas');
    c.width = Math.max(8, Math.floor(w)); c.height = Math.max(8, Math.floor(h));
    const g = c.getContext('2d');
    if (!g) return [];
    g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#fff';
    let size = Math.floor(c.height * 0.28);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const lineas = texto.split('\n');
    // ajuste: la frase debe caber a lo ancho
    for (let intento = 0; intento < 40; intento++) {
      g.font = '700 ' + size + 'px "Apercu", system-ui, sans-serif';
      const max = Math.max.apply(null, lineas.map(l => g.measureText(l).width));
      if (max <= c.width * 0.88) break;
      size = Math.floor(size * 0.9);
      if (size < 8) break;
    }
    const lh = size * 1.06;
    const y0 = c.height / 2 - (lineas.length - 1) * lh / 2;
    lineas.forEach((l, i) => g.fillText(l, c.width / 2, y0 + i * lh));
    const img = g.getImageData(0, 0, c.width, c.height).data;
    const pts = [];
    for (let y = 0; y < c.height; y += paso)
      for (let x = 0; x < c.width; x += paso) {
        if (img[(y * c.width + x) * 4] > 128) pts.push([x, y]);
      }
    return pts;
  }

  /* ---- escritura que llega tecleándose ------------------------------ */
  function teclear(nodo, texto, ms, alTerminar) {
    if (N.reducido) { nodo.textContent = texto; if (alTerminar) alTerminar(); return () => {}; }
    let i = 0;
    nodo.textContent = '';
    const parar = N.bus.every(() => {
      nodo.textContent = texto.slice(0, ++i);
      if (i >= texto.length) { parar(); if (alTerminar) alTerminar(); }
    }, ms || 34);
    return parar;
  }

  N.texto = { mensajeDegradado, perderBit, bitsPerdidos, hamming, telemetria, mascaraDeTexto, teclear };

})(window.NPVS);
