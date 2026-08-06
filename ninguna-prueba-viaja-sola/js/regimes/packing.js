'use strict';
/* =====================================================================
   RÉGIMEN A — ACOMODAR
   los cuerpos intentan ocupar el documento sin superponerse. no caben.
   la dimensión visible es dos; el campo puede tener más, y entonces
   caben, pero se ven encima. comprimir expulsa. el hueco es un enlace.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const DIM_MAX = 5;

  function crear(canvas, opciones) {
    const g = canvas.getContext('2d');
    if (!g) return null;
    const o = Object.assign({
      cuerpos: 74,
      vacios: 3,
      cobertura: 0.32,          // fracción del documento que los cuerpos intentan ocupar
      centroOculto: true,
      alExpulsar: null,
      alVacio: null,
      escala: 1
    }, opciones || {});

    const r = N.seed.make(N.estado.semilla, 'empaque');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 1, H = 1;
    let dim = 2;
    let compresion = 1;            // 1 = campo entero; <1 = comprimido
    let presion = 0;               // solapamiento residual medido
    let cuerpos = [];
    let vacios = [];
    let mascara = null;            // puntos de la frase escrita sin letras
    let mascaraFuerza = 0;
    let arrastrando = null;
    let vivo = true;
    let ultimoVacios = 0;
    let expulsados = 0;

    /* el punto que no está dibujado */
    const centro = { x: 0.5, y: 0.5 };

    function medir() {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
    }

    function nacer() {
      cuerpos = [];
      const n = o.cuerpos;
      /* el radio se deduce de la superficie disponible: la cobertura es
         una medida, no una figura retórica. cerca de 0.7 el campo deja de
         caber y tiembla; cerca de 0.3 respira y deja huecos reales. */
      const base = Math.sqrt((W * H * o.cobertura) / (n * Math.PI));
      for (let i = 0; i < n; i++) {
        const rad = base * (0.42 + Math.pow(r.raw(), 1.7) * 1.5) * o.escala;
        const c = {
          i: i,
          x: r.f(0.04, 0.96) * W, y: r.f(0.04, 0.96) * H,
          vx: 0, vy: 0,
          r: rad,
          q: new Array(DIM_MAX).fill(0).map((_, k) => k < 2 ? 0 : 0), // coords ocultas
          temblor: 0,
          nombre: null,
          vivo: true
        };
        cuerpos.push(c);
      }
    }

    /* distancia en el espacio real (2 visibles + las ocultas) */
    function dist2(a, b) {
      let dx = a.x - b.x, dy = a.y - b.y;
      let s = dx * dx + dy * dy;
      for (let k = 2; k < dim; k++) { const d = a.q[k] - b.q[k]; s += d * d; }
      return s;
    }

    function relajar() {
      const lim = { x0: W * (0.5 - 0.5 * compresion), x1: W * (0.5 + 0.5 * compresion),
                    y0: H * (0.5 - 0.5 * compresion), y1: H * (0.5 + 0.5 * compresion) };
      let solape = 0;
      const vivos = cuerpos.filter(c => c.vivo);
      for (let it = 0; it < 2; it++) {
        for (let i = 0; i < vivos.length; i++) {
          const a = vivos[i];
          for (let j = i + 1; j < vivos.length; j++) {
            const b = vivos[j];
            const min = a.r + b.r;
            const d2 = dist2(a, b);
            if (d2 >= min * min || d2 === 0) continue;
            const d = Math.sqrt(d2);
            const emp = (min - d) / min;
            solape += emp;
            // sólo las dos coordenadas visibles reciben el empuje;
            // las ocultas absorben lo que sobra
            const nx = (a.x - b.x) / (d || 1), ny = (a.y - b.y) / (d || 1);
            const f = (min - d) * 0.16;
            a.vx += nx * f; a.vy += ny * f;
            b.vx -= nx * f; b.vy -= ny * f;
            for (let k = 2; k < dim; k++) {
              const dif = (a.q[k] - b.q[k]) || (r.raw() - 0.5);
              const s = Math.sign(dif) * (min - d) * 0.05;
              a.q[k] += s; b.q[k] -= s;
            }
            a.temblor = Math.min(1, a.temblor + emp * 0.3);
            b.temblor = Math.min(1, b.temblor + emp * 0.3);
          }
        }
      }
      presion = vivos.length ? solape / vivos.length : 0;

      for (const c of vivos) {
        if (c === arrastrando) { c.vx = c.vy = 0; continue; }
        /* atracción hacia el punto que no está dibujado: blanda en el
           centro, firme en los bordes. sostiene el campo sin colapsarlo. */
        const tx = centro.x * W, ty = centro.y * H;
        const dx = tx - c.x, dy = ty - c.y;
        const dn = Math.hypot(dx, dy) / (Math.hypot(W, H) * 0.5) || 0;
        const k = 0.00016 + 0.0022 * dn * dn;
        c.vx += dx * k;
        c.vy += dy * k;
        // la frase escrita por los cuerpos, cuando nadie interviene
        if (mascara && mascaraFuerza > 0 && c.destino) {
          c.vx += (c.destino[0] - c.x) * 0.012 * mascaraFuerza;
          c.vy += (c.destino[1] - c.y) * 0.012 * mascaraFuerza;
        }
        /* temblor: la dimensión es insuficiente. no depende sólo del
           solapamiento: mientras el campo sea plano, todos tiemblan un
           poco, y cada dimensión añadida los calma. */
        const base = 0.2 / (dim - 1);
        const t = Math.max(c.temblor, base);
        if (!N.reducido) {
          c.vx += (r.raw() - 0.5) * t * 1.4;
          c.vy += (r.raw() - 0.5) * t * 1.4;
        }
        c.temblor *= 0.93;
        c.vx *= 0.86; c.vy *= 0.86;
        c.x += c.vx; c.y += c.vy;
        // el borde del campo comprimido
        if (c.x < lim.x0 + c.r) { c.x = lim.x0 + c.r; c.vx *= -0.4; c.fuera = (c.fuera || 0) + 1; }
        if (c.x > lim.x1 - c.r) { c.x = lim.x1 - c.r; c.vx *= -0.4; c.fuera = (c.fuera || 0) + 1; }
        if (c.y < lim.y0 + c.r) { c.y = lim.y0 + c.r; c.vy *= -0.4; c.fuera = (c.fuera || 0) + 1; }
        if (c.y > lim.y1 - c.r) { c.y = lim.y1 - c.r; c.vy *= -0.4; c.fuera = (c.fuera || 0) + 1; }
        for (let k = 2; k < dim; k++) c.q[k] *= 0.995;
      }
    }

    /* ---- campo de distancia: dónde no hay nadie -------------------- */
    function calcularVacios() {
      const paso = Math.max(10, Math.floor(Math.min(W, H) / 26));
      const vivos = cuerpos.filter(c => c.vivo);
      const cand = [];
      for (let y = paso; y < H - paso; y += paso)
        for (let x = paso; x < W - paso; x += paso) {
          let d = Math.min(x, y, W - x, H - y);
          for (const c of vivos) {
            const dd = Math.hypot(x - c.x, y - c.y) - c.r;
            if (dd < d) d = dd;
            if (d <= 0) break;
          }
          if (d > 14) cand.push({ x, y, d });
        }
      /* un hueco importa por estar ENTRE los cuerpos, no por estar lejos.
         se exige que el candidato tenga cuerpos en al menos tres de sus
         cuatro cuadrantes: el margen vacío del documento no es un hueco. */
      function rodeado(p) {
        const q = [false, false, false, false];
        for (const c of vivos) {
          const dx = c.x - p.x, dy = c.y - p.y;
          if (Math.hypot(dx, dy) > p.d * 4 + c.r) continue;
          q[(dx >= 0 ? 1 : 0) + (dy >= 0 ? 2 : 0)] = true;
        }
        return q.filter(Boolean).length;
      }
      cand.sort((a, b) => b.d - a.d);
      const entre = cand.filter(c => rodeado(c) >= 4);
      const casi = cand.filter(c => rodeado(c) === 3);
      const orden = entre.concat(casi, cand);

      const sel = [];
      for (const c of orden) {
        if (sel.length >= o.vacios) break;
        if (sel.some(s => s === c)) continue;
        if (sel.every(s => Math.hypot(s.x - c.x, s.y - c.y) > (s.d + c.d) * 0.95 + 30)) sel.push(c);
      }
      vacios = sel;
      if (o.alVacio && (vacios.length !== ultimoVacios || true)) { o.alVacio(vacios); }
      ultimoVacios = vacios.length;
    }

    /* ---- operaciones jugables --------------------------------------- */

    function comprimir(f) {
      compresion = Math.max(0.34, compresion * (f || 0.88));
      // comprimir expulsa: el cuerpo con más presión sale del documento
      const vivos = cuerpos.filter(c => c.vivo);
      if (!vivos.length) return null;
      vivos.sort((a, b) => (b.fuera || 0) + b.temblor - ((a.fuera || 0) + a.temblor));
      const victima = vivos[0];
      victima.vivo = false;
      expulsados++;
      const idx = (N.mem.d.fragmentos.length) % N.corpus.FRAGMENTOS.length;
      const frag = {
        id: 'f' + N.mem.d.fragmentos.length,
        texto: victima.nombre || N.corpus.FRAGMENTOS[idx],
        de: N.pagina,
        estado: 'expulsado',
        t: Date.now()
      };
      N.mem.fragmento(frag);
      N.mem.regimen('A', {});
      N.mem.d.regimenes.A.estado.expulsados = expulsados;
      N.mem.d.regimenes.A.estado.compresion = Math.round(compresion * 100) / 100;
      N.mem.guardar();
      if (expulsados >= 2) N.mem.hito('campo-comprimido-dos-veces', expulsados);
      N.texto.perderBit('un cuerpo fue expulsado del documento al comprimir el campo');
      if (o.alExpulsar) o.alExpulsar(frag, victima);
      N.bus.emit('expulsion', frag);
      calcularVacios();
      if (N.reducido) asentar();
      return frag;
    }

    function aumentarDimension() {
      if (dim >= DIM_MAX) return dim;
      dim++;
      for (const c of cuerpos) c.q[dim - 1] = (r.raw() - 0.5) * c.r * 1.2;
      N.mem.regimen('A', {});
      N.mem.d.regimenes.A.estado.dimension = dim;
      N.mem.guardar();
      if (dim >= 4) N.mem.hito('dimension-insuficiente-corregida', dim);
      N.bus.emit('dimension', { dim });
      if (N.reducido) asentar();
      return dim;
    }

    function escribirEnVacio(texto, indice) {
      const v = vacios[indice] || vacios[0];
      if (!v) return null;
      // la frase se vuelve un cuerpo: ahora ocupa lugar y estorba
      const c = {
        i: cuerpos.length, x: v.x, y: v.y, vx: 0, vy: 0,
        r: Math.max(16, Math.min(70, 7 + texto.length * 3.1)),
        q: new Array(DIM_MAX).fill(0), temblor: 0.6, nombre: texto, vivo: true, propio: true
      };
      cuerpos.push(c);
      N.mem.regimen('A', {});
      const est = N.mem.d.regimenes.A.estado;
      est.frases = (est.frases || []).concat([texto]).slice(-8);
      N.mem.guardar();
      N.mem.hito('frase-en-el-vacio', texto);
      N.bus.emit('frase', { texto });
      calcularVacios();
      if (N.reducido) asentar();
      return c;
    }

    /* la inactividad completa la operación: los cuerpos escriben */
    function escribirConCuerpos(frase) {
      const pts = N.texto.mascaraDeTexto(frase, W, H, 7);
      if (!pts.length) return;
      mascara = pts;
      const vivos = cuerpos.filter(c => c.vivo);
      const paso = Math.max(1, Math.floor(pts.length / Math.max(1, vivos.length)));
      vivos.forEach((c, i) => { const p = pts[(i * paso) % pts.length]; c.destino = [p[0], p[1]]; });
      mascaraFuerza = 0;
      if (N.reducido) { mascaraFuerza = 1; asentar(); }
      else {
        const subir = N.bus.every(() => {
          mascaraFuerza = Math.min(1, mascaraFuerza + 0.06);
          if (mascaraFuerza >= 1) subir();
        }, 60);
      }
      N.mem.hito('el-campo-escribio-solo', frase);
      N.bus.emit('escritura-por-inaccion', { frase });
    }

    function soltarMascara() {
      mascara = null; mascaraFuerza = 0;
      for (const c of cuerpos) c.destino = null;
      if (N.reducido) asentar();
    }

    /* ---- dibujo ------------------------------------------------------ */
    function pintar() {
      const cs = getComputedStyle(document.documentElement);
      const tinta = cs.getPropertyValue('--tinta').trim() || '#141414';
      const papel = cs.getPropertyValue('--papel').trim() || '#e9e5dc';
      const halo = cs.getPropertyValue('--c-aproximacion').trim() || '#7a6';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = papel; g.fillRect(0, 0, W, H);

      // región de exclusión: el campo comprimido deja un borde muerto
      if (compresion < 0.999) {
        g.fillStyle = tinta; g.globalAlpha = 0.05;
        g.fillRect(0, 0, W, H * (0.5 - 0.5 * compresion));
        g.fillRect(0, H * (0.5 + 0.5 * compresion), W, H);
        g.fillRect(0, 0, W * (0.5 - 0.5 * compresion), H);
        g.fillRect(W * (0.5 + 0.5 * compresion), 0, W, H);
        g.globalAlpha = 1;
      }

      for (const c of cuerpos) {
        if (!c.vivo) continue;
        const oculto = dim > 2 ? Math.min(1, Math.hypot.apply(null, c.q.slice(2, dim)) / (c.r + 1)) : 0;
        g.beginPath(); g.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        if (c.propio) {
          g.fillStyle = halo; g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1;
        }
        g.strokeStyle = tinta;
        g.globalAlpha = 0.22 + 0.5 * (1 - oculto) * (0.4 + c.temblor);
        g.lineWidth = 1 + c.temblor * 1.6;
        g.stroke();
        g.globalAlpha = 1;
        if (c.nombre && c.r > 20) {
          g.fillStyle = tinta; g.globalAlpha = 0.8;
          g.font = '11px "Apercu", system-ui, sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(c.nombre.slice(0, 18), c.x, c.y);
          g.globalAlpha = 1;
        }
      }

      // los huecos no se dibujan: se sienten. sólo un borde muy leve.
      g.setLineDash([3, 6]);
      g.lineWidth = 1.5;
      for (const v of vacios) {
        g.strokeStyle = tinta; g.globalAlpha = 0.5;
        g.beginPath(); g.arc(v.x, v.y, Math.max(24, Math.min(v.d, 52)), 0, Math.PI * 2); g.stroke();
      }
      g.lineWidth = 1;
      g.setLineDash([]);
      g.globalAlpha = 1;
    }

    /* ---- interacción -------------------------------------------------- */
    const quitar = [];
    function enCuerpo(ev) {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      let mejor = null;
      for (const c of cuerpos) {
        if (!c.vivo) continue;
        const d = Math.hypot(x - c.x, y - c.y);
        if (d <= c.r && (!mejor || d < mejor.d)) mejor = { c, d };
      }
      return mejor ? mejor.c : null;
    }

    quitar.push(N.bus.listen(canvas, 'pointerdown', (ev) => {
      const c = enCuerpo(ev);
      if (!c) return;
      arrastrando = c;
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      soltarMascara();
      N.mem.gesto(N.pagina, 'arrastre', ev.clientX, ev.clientY, 'cuerpo ' + c.i);
    }));
    quitar.push(N.bus.listen(canvas, 'pointermove', (ev) => {
      if (!arrastrando) return;
      const rect = canvas.getBoundingClientRect();
      arrastrando.x = ev.clientX - rect.left;
      arrastrando.y = ev.clientY - rect.top;
    }));
    quitar.push(N.bus.listen(window, 'pointerup', () => {
      if (arrastrando) {
        N.mem.regimen('A', {});
        const e = N.mem.d.regimenes.A.estado;
        e.arrastres = (e.arrastres || 0) + 1;
        if (e.arrastres >= 3) N.mem.hito('el-campo-fue-tocado', e.arrastres);
        N.mem.guardar();
      }
      arrastrando = null;
    }));
    quitar.push(N.bus.listen(window, 'resize', () => { medir(); calcularVacios(); }));

    medir(); nacer();
    for (let i = 0; i < 40; i++) relajar();
    calcularVacios();

    /* con movimiento reducido el campo no se anima: se acomoda de golpe,
       se dibuja una vez y sólo vuelve a moverse si alguien lo toca. */
    let cuenta = 0;
    let parar = () => {};
    function asentar() {
      for (let i = 0; i < 120; i++) relajar();
      calcularVacios();
      pintar();
    }
    if (N.reducido) {
      asentar();
      quitar.push(N.bus.listen(canvas, 'pointermove', () => { if (arrastrando) { relajar(); pintar(); } }));
      quitar.push(N.bus.listen(window, 'pointerup', () => asentar()));
    } else {
      parar = N.bus.loop(() => {
        if (!vivo) return;
        relajar();
        if ((cuenta++ % 30) === 0) calcularVacios();
        pintar();
      });
    }

    return {
      asentar,
      comprimir, aumentarDimension, escribirEnVacio, escribirConCuerpos, soltarMascara,
      get presion() { return presion; },
      get dimension() { return dim; },
      get compresion() { return compresion; },
      get vacios() { return vacios; },
      get expulsados() { return expulsados; },
      recalcularVacios: calcularVacios,
      destruir: () => { vivo = false; parar(); quitar.forEach(f => f()); }
    };
  }

  N.regA = { crear, DIM_MAX };

})(window.NPVS);
