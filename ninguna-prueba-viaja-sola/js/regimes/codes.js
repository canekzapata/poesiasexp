'use strict';
/* =====================================================================
   RÉGIMEN B — SEPARAR
   cada gesto se escribe como una palabra binaria y como un punto sobre
   una esfera. las palabras deben mantener una distancia mínima: cuando
   dos recuerdos se parecen demasiado, uno muta. corregir la señal y
   conservar su ambigüedad son operaciones incompatibles.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const LONGITUD = 12;
  const DMIN = 3;

  function bitsDe(gesto, indice) {
    // datos reales: posición cuantizada, tipo, ritmo
    const tipo = { clic: 1, arrastre: 2, espera: 3, tecla: 4, roce: 5, copia: 6 }[gesto.k] || 0;
    const gx = Math.max(0, Math.min(31, Math.round((gesto.x || 0) / Math.max(1, window.innerWidth) * 31)));
    const gy = Math.max(0, Math.min(31, Math.round((gesto.y || 0) / Math.max(1, window.innerHeight) * 31)));
    const n = (gx << 7) ^ (gy << 2) ^ (tipo << 9) ^ (indice & 3);
    let s = '';
    for (let i = LONGITUD - 1; i >= 0; i--) s += ((n >> i) & 1) ? '1' : '0';
    return s;
  }

  function flip(w, i) {
    const a = w.split(''); a[i] = a[i] === '1' ? '0' : '1'; return a.join('');
  }

  /* la separación mínima se impone sobre la memoria real */
  function codificar(gesto) {
    const m = N.mem.d;
    const palabras = m.codigos.map(c => c.w);
    let w = bitsDe(gesto, m.codigos.length);
    let causa = 'gesto';
    let mutaciones = 0;
    const r = N.seed.make(N.estado.semilla, 'codigo:' + m.codigos.length);

    let vecino = masCercano(w, palabras);
    while (vecino && vecino.d < DMIN && mutaciones < LONGITUD) {
      // se aleja el recuerdo nuevo, no el viejo: el archivo protege lo anterior
      const dif = [];
      for (let i = 0; i < LONGITUD; i++) if (w[i] === vecino.w[i]) dif.push(i);
      const i = dif.length ? dif[Math.floor(r.raw() * dif.length)] : Math.floor(r.raw() * LONGITUD);
      w = flip(w, i);
      mutaciones++;
      causa = 'separación forzada: estaba a ' + vecino.d + ' de un recuerdo anterior';
      vecino = masCercano(w, palabras);
    }

    const reg = { w: w, k: gesto.k, p: gesto.p, t: gesto.t, causa: causa, mut: mutaciones };
    m.codigos.push(reg);

    if (mutaciones > 0) {
      m.regimenes.B = m.regimenes.B || { visto: 0, hecho: 0, estado: {} };
      m.regimenes.B.estado.mutados = (m.regimenes.B.estado.mutados || 0) + 1;
      // corregir cuesta: la señal pierde ambigüedad y el mensaje un bit
      if (m.regimenes.B.estado.mutados % 3 === 0) {
        N.texto.perderBit('corrección de un recuerdo demasiado parecido a otro');
      }
      N.bus.emit('mutacion', reg);
      if (N.mem.cuentaHitos !== undefined && (m.regimenes.B.estado.mutados >= 3)) {
        N.mem.hito('tres-codigos-separados', m.regimenes.B.estado.mutados);
      }
    }
    N.mem.guardar();
    return reg;
  }

  function masCercano(w, palabras) {
    let mejor = null;
    for (const p of palabras) {
      const d = N.texto.hamming(w, p);
      if (!mejor || d < mejor.d) mejor = { w: p, d: d };
    }
    return mejor;
  }

  function distanciaMinima() {
    const ws = N.mem.d.codigos.map(c => c.w);
    let min = LONGITUD;
    for (let i = 0; i < ws.length; i++)
      for (let j = i + 1; j < ws.length; j++) min = Math.min(min, N.texto.hamming(ws[i], ws[j]));
    return ws.length < 2 ? LONGITUD : min;
  }

  /* ---- superficies ------------------------------------------------- */

  /* matriz binaria: los recuerdos como filas; las columnas son bits */
  function matriz(canvas, opciones) {
    const g = canvas.getContext('2d');
    if (!g) return () => {};
    const o = Object.assign({ max: 48, alSeleccionar: null }, opciones || {});
    let sel = -1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function medir() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
    }

    function pintar() {
      medir();
      const cs = getComputedStyle(document.documentElement);
      const tinta = cs.getPropertyValue('--tinta').trim() || '#111';
      const papel = cs.getPropertyValue('--papel').trim() || '#eee';
      const acento = cs.getPropertyValue('--c-contradiccion').trim() || '#a33';
      const codigos = N.mem.d.codigos.slice(-o.max);
      g.fillStyle = papel; g.fillRect(0, 0, canvas.width, canvas.height);
      if (!codigos.length) {
        g.fillStyle = tinta; g.globalAlpha = 0.5;
        g.font = (13 * dpr) + 'px "Apercu", system-ui, sans-serif';
        g.fillText('ningún recuerdo codificado todavía', 12 * dpr, 26 * dpr);
        g.globalAlpha = 1;
        return;
      }
      const cw = canvas.width / LONGITUD;
      const ch = canvas.height / codigos.length;
      codigos.forEach((c, y) => {
        for (let x = 0; x < LONGITUD; x++) {
          if (c.w[x] === '1') {
            g.fillStyle = (y === sel) ? acento : tinta;
            g.fillRect(x * cw + 1, y * ch + 1, cw - 2, Math.max(1, ch - 2));
          } else if (c.mut > 0) {
            g.fillStyle = tinta; g.globalAlpha = 0.12;
            g.fillRect(x * cw + 1, y * ch + 1, cw - 2, Math.max(1, ch - 2));
            g.globalAlpha = 1;
          }
        }
      });
      return codigos;
    }

    function indiceEn(ev) {
      const r = canvas.getBoundingClientRect();
      const codigos = N.mem.d.codigos.slice(-o.max);
      if (!codigos.length) return -1;
      const y = (ev.clientY - r.top) / r.height;
      return Math.max(0, Math.min(codigos.length - 1, Math.floor(y * codigos.length)));
    }

    const quitar = [];
    quitar.push(N.bus.listen(canvas, 'pointerdown', (ev) => {
      const codigos = N.mem.d.codigos.slice(-o.max);
      const i = indiceEn(ev);
      if (i < 0) return;
      sel = i;
      const r = canvas.getBoundingClientRect();
      const bx = Math.max(0, Math.min(LONGITUD - 1, Math.floor((ev.clientX - r.left) / r.width * LONGITUD)));
      // tocar un bit lo cambia: el recuerdo se aleja o se acerca a otro
      const global = N.mem.d.codigos.length - codigos.length + i;
      const antes = N.mem.d.codigos[global].w;
      const despues = flip(antes, bx);
      N.mem.d.codigos[global].w = despues;
      N.mem.d.codigos[global].causa = 'un bit cambiado a mano';
      const otros = N.mem.d.codigos.filter((_, j) => j !== global).map(c => c.w);
      const v = masCercano(despues, otros);
      N.mem.guardar();
      if (v && v.d < DMIN) {
        N.mem.contradiccion('recuerdo ' + despues, 'recuerdo ' + v.w, 'quedaron a distancia ' + v.d + ', por debajo del mínimo ' + DMIN);
        N.texto.perderBit('dos recuerdos quedaron a distancia ' + v.d);
      }
      if (o.alSeleccionar) o.alSeleccionar(N.mem.d.codigos[global], v);
      pintar();
    }));
    quitar.push(N.bus.listen(window, 'resize', pintar));
    pintar();
    const parar = N.bus.on('gesto', () => pintar());
    return () => { quitar.forEach(f => f()); parar(); };
  }

  /* constelación: los mismos códigos como puntos separados sobre una
     esfera proyectada. la distancia visible es la distancia Hamming. */
  function esfera(canvas, opciones) {
    const g = canvas.getContext('2d');
    if (!g) return () => {};
    const o = Object.assign({ max: 60 }, opciones || {});
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let giro = 0, tocado = 0;

    function puntos() {
      const codigos = N.mem.d.codigos.slice(-o.max);
      return codigos.map((c, i) => {
        // el código se lee como coordenada: mitad alta → longitud, baja → latitud
        let a = 0, b = 0;
        for (let k = 0; k < 6; k++) { a = a * 2 + (+c.w[k]); b = b * 2 + (+c.w[k + 6]); }
        const lon = (a / 63) * Math.PI * 2;
        const lat = (b / 63 - 0.5) * Math.PI;
        return { lon, lat, c, i };
      });
    }

    function pintar() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      const cs = getComputedStyle(document.documentElement);
      const tinta = cs.getPropertyValue('--tinta').trim() || '#111';
      const papel = cs.getPropertyValue('--papel').trim() || '#eee';
      const cerca = cs.getPropertyValue('--c-copia').trim() || '#39c';
      g.fillStyle = papel; g.fillRect(0, 0, canvas.width, canvas.height);
      const R = Math.min(canvas.width, canvas.height) * 0.38;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      g.strokeStyle = tinta; g.globalAlpha = 0.16;
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.ellipse(cx, cy, R, Math.abs(R * Math.cos(k * 0.5)), 0, 0, Math.PI * 2);
        g.stroke();
      }
      g.globalAlpha = 1;
      const P = puntos();
      // aristas sólo entre códigos a distancia mínima: lo que casi se confunde
      for (let i = 0; i < P.length; i++)
        for (let j = i + 1; j < P.length; j++) {
          const d = N.texto.hamming(P[i].c.w, P[j].c.w);
          if (d > DMIN) continue;
          const A = proy(P[i]), B = proy(P[j]);
          g.strokeStyle = cerca; g.globalAlpha = 0.5 - d * 0.1;
          g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
        }
      g.globalAlpha = 1;
      for (const p of P) {
        const q = proy(p);
        g.globalAlpha = q.z > 0 ? 1 : 0.28;
        g.fillStyle = p.c.mut > 0 ? cerca : tinta;
        g.beginPath(); g.arc(q.x, q.y, (p.c.mut > 0 ? 3.4 : 2.2) * dpr, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;

      function proy(p) {
        const x = Math.cos(p.lat) * Math.cos(p.lon + giro);
        const y = Math.sin(p.lat);
        const z = Math.cos(p.lat) * Math.sin(p.lon + giro);
        return { x: cx + x * R, y: cy + y * R, z: z };
      }
    }

    let parar = null;
    if (!N.reducido) parar = N.bus.loop(() => { giro += 0.0016 + tocado * 0.004; tocado *= 0.96; pintar(); });
    else pintar();
    const l1 = N.bus.listen(canvas, 'pointerdown', () => { tocado = 1; if (N.reducido) { giro += 0.4; pintar(); } });
    const l2 = N.bus.listen(window, 'resize', pintar);
    return () => { if (parar) parar(); l1(); l2(); };
  }

  N.regB = { LONGITUD, DMIN, codificar, masCercano, distanciaMinima, matriz, esfera, bitsDe };

})(window.NPVS);
