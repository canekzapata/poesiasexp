'use strict';
/* =====================================================================
   RÉGIMEN G — ENCONTRAR LO QUE NO SE BUSCABA
   una retícula deformable. el cursor propone un vector; el aparato
   busca el punto de la retícula más cercano y lo llama original.
   la cercanía geométrica y la cercanía narrativa casi nunca coinciden.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* palabra binaria estable de una página: su lugar en el código */
  function codigoDePagina(id) {
    const h = N.seed.hash32(N.estado.semilla + '#' + id);
    let s = '';
    for (let i = N.regB.LONGITUD - 1; i >= 0; i--) s += ((h >> i) & 1) ? '1' : '0';
    return s;
  }

  /* el recorrido también es una palabra: la media de los últimos gestos */
  function codigoDelRecorrido() {
    const cs = N.mem.d.codigos.slice(-9);
    if (!cs.length) return codigoDePagina(N.pagina || 'umbral');
    let out = '';
    for (let i = 0; i < N.regB.LONGITUD; i++) {
      let unos = 0;
      for (const c of cs) if (c.w[i] === '1') unos++;
      out += (unos * 2 >= cs.length) ? '1' : '0';
    }
    return out;
  }

  function crear(svg, opciones) {
    const o = Object.assign({
      rango: 4,
      alElegir: null,
      paginas: null
    }, opciones || {});

    const r = N.seed.make(N.estado.semilla, 'reticula');
    let W = 1, H = 1;
    // base de la retícula: dos vectores deformables
    let b1 = { x: 0, y: 0 }, b2 = { x: 0, y: 0 };
    let origen = { x: 0, y: 0 };
    let objetivo = { x: 0, y: 0 };
    let arrastre = null;
    const capaLineas = sv('g', { class: 'ret-lineas' });
    const capaPuntos = sv('g', { class: 'ret-puntos' });
    const capaMarcas = sv('g', { class: 'ret-marcas' });
    svg.appendChild(capaLineas); svg.appendChild(capaPuntos); svg.appendChild(capaMarcas);

    const paginas = o.paginas || N.rutas.IDS.filter(id => id !== 'certificado' && id !== 'mapa');

    function medir() {
      const rect = svg.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      if (!b1.x && !b1.y) {
        // la retícula completa —incluidas sus asas— debe caber en su caja
        const u = Math.min(W, H) / (o.rango * 2.7 + 1.4);
        b1 = { x: u * 1.0, y: u * r.f(-0.12, 0.12) };
        b2 = { x: u * r.f(-0.3, 0.3), y: u * 0.92 };
        origen = { x: W / 2, y: H / 2 };
        objetivo = { x: W * 0.62, y: H * 0.38 };
      }
    }

    function puntos() {
      const out = [];
      let k = 0;
      for (let i = -o.rango; i <= o.rango; i++)
        for (let j = -o.rango; j <= o.rango; j++) {
          const x = origen.x + i * b1.x + j * b2.x;
          const y = origen.y + i * b1.y + j * b2.y;
          out.push({ i, j, x, y, id: paginas[(Math.abs(i * 7 + j * 13 + k) ) % paginas.length] });
          k++;
        }
      return out;
    }

    /* CVP real: coordenadas en la base, redondeo y revisión de vecinos */
    function masCercano(t) {
      const det = b1.x * b2.y - b1.y * b2.x;
      const px = t.x - origen.x, py = t.y - origen.y;
      let a = 0, b = 0;
      if (Math.abs(det) > 1e-6) {
        a = (px * b2.y - py * b2.x) / det;
        b = (b1.x * py - b1.y * px) / det;
      }
      let mejor = null;
      for (let di = -1; di <= 1; di++)
        for (let dj = -1; dj <= 1; dj++) {
          const i = Math.max(-o.rango, Math.min(o.rango, Math.round(a) + di));
          const j = Math.max(-o.rango, Math.min(o.rango, Math.round(b) + dj));
          const x = origen.x + i * b1.x + j * b2.x;
          const y = origen.y + i * b1.y + j * b2.y;
          const d = Math.hypot(x - t.x, y - t.y);
          if (!mejor || d < mejor.d) mejor = { i, j, x, y, d };
        }
      if (mejor) {
        const P = puntos();
        const q = P.find(p => p.i === mejor.i && p.j === mejor.j);
        mejor.id = q ? q.id : paginas[0];
      }
      return mejor;
    }

    /* cercanía narrativa: distancia entre el código de la página y el
       código del recorrido. no tiene nada que ver con la geometría. */
    function masCercanoNarrativo() {
      const w = codigoDelRecorrido();
      let mejor = null;
      for (const id of paginas) {
        let d = N.texto.hamming(w, codigoDePagina(id));
        // el recorrido pesa: una página ya usada está más lejos de ser hallazgo
        d += Math.min(4, N.mem.vecesEn(id));
        if (!mejor || d < mejor.d) mejor = { id, d };
      }
      return mejor;
    }

    function pintar() {
      const P = puntos();
      const cvp = masCercano(objetivo);
      const nar = masCercanoNarrativo();
      capaLineas.textContent = ''; capaPuntos.textContent = ''; capaMarcas.textContent = '';

      // las rectas de la base
      for (let i = -o.rango; i <= o.rango; i++) {
        const a = { x: origen.x + i * b1.x - o.rango * b2.x, y: origen.y + i * b1.y - o.rango * b2.y };
        const b = { x: origen.x + i * b1.x + o.rango * b2.x, y: origen.y + i * b1.y + o.rango * b2.y };
        capaLineas.appendChild(sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'ret-linea' }));
        const c = { x: origen.x + i * b2.x - o.rango * b1.x, y: origen.y + i * b2.y - o.rango * b1.y };
        const d = { x: origen.x + i * b2.x + o.rango * b1.x, y: origen.y + i * b2.y + o.rango * b1.y };
        capaLineas.appendChild(sv('line', { x1: c.x, y1: c.y, x2: d.x, y2: d.y, class: 'ret-linea' }));
      }

      for (const p of P) {
        const esCVP = cvp && p.i === cvp.i && p.j === cvp.j;
        const esNar = nar && p.id === nar.id;
        const c = sv('circle', {
          cx: p.x, cy: p.y, r: esCVP ? 7 : (esNar ? 5.5 : 2.4),
          class: 'ret-punto' + (esCVP ? ' es-cvp' : '') + (esNar ? ' es-narrativo' : ''),
          'data-id': p.id, tabindex: (esCVP || esNar) ? 0 : -1
        });
        c.appendChild(sv('title')).textContent = p.id + ' · [' + p.i + ',' + p.j + ']';
        capaPuntos.appendChild(c);
      }

      // el vector propuesto
      capaMarcas.appendChild(sv('line', { x1: origen.x, y1: origen.y, x2: objetivo.x, y2: objetivo.y, class: 'ret-vector' }));
      capaMarcas.appendChild(sv('circle', { cx: objetivo.x, cy: objetivo.y, r: 3.2, class: 'ret-objetivo' }));
      if (cvp) {
        capaMarcas.appendChild(sv('line', { x1: objetivo.x, y1: objetivo.y, x2: cvp.x, y2: cvp.y, class: 'ret-error' }));
      }
      // asas de la base: se pueden arrastrar y deforman la retícula
      capaMarcas.appendChild(sv('circle', { cx: origen.x + b1.x * o.rango, cy: origen.y + b1.y * o.rango, r: 6, class: 'ret-asa', 'data-asa': '1', tabindex: 0 }));
      capaMarcas.appendChild(sv('circle', { cx: origen.x + b2.x * o.rango, cy: origen.y + b2.y * o.rango, r: 6, class: 'ret-asa', 'data-asa': '2', tabindex: 0 }));

      if (o.alElegir) o.alElegir({ cvp, narrativo: nar, deformacion: deformacion() });
      return { cvp, nar };
    }

    /* cuánto se apartó la retícula de su forma inicial */
    let base0 = null;
    function deformacion() {
      if (!base0) return 0;
      return Math.round((Math.hypot(b1.x - base0.b1.x, b1.y - base0.b1.y) + Math.hypot(b2.x - base0.b2.x, b2.y - base0.b2.y)) * 10) / 10;
    }

    function xy(ev) {
      const rect = svg.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    }

    const quitar = [];
    quitar.push(N.bus.listen(svg, 'pointerdown', (ev) => {
      const t = ev.target;
      const asa = t.getAttribute && t.getAttribute('data-asa');
      if (asa) { arrastre = { asa: asa }; svg.setPointerCapture && svg.setPointerCapture(ev.pointerId); return; }
      objetivo = xy(ev);
      N.mem.gesto(N.pagina, 'clic', ev.clientX, ev.clientY, 'vector propuesto');
      pintar();
    }));
    quitar.push(N.bus.listen(svg, 'pointermove', (ev) => {
      if (!arrastre) return;
      const p = xy(ev);
      const v = { x: (p.x - origen.x) / o.rango, y: (p.y - origen.y) / o.rango };
      if (Math.hypot(v.x, v.y) < 6) return;
      if (arrastre.asa === '1') b1 = v; else b2 = v;
      pintar();
    }));
    quitar.push(N.bus.listen(window, 'pointerup', () => {
      if (arrastre) {
        N.mem.regimen('G', {});
        const e = N.mem.d.regimenes.G.estado;
        e.deformacion = deformacion();
        e.deformada = (e.deformada || 0) + 1;
        N.mem.guardar();
        if (e.deformada >= 2) N.mem.hito('reticula-deformada', e.deformacion);
      }
      arrastre = null;
    }));
    quitar.push(N.bus.listen(window, 'resize', () => { medir(); pintar(); }));
    quitar.push(N.bus.listen(svg, 'keydown', (ev) => {
      const paso = ev.shiftKey ? 24 : 8;
      const mapa = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] };
      if (!mapa[ev.key]) return;
      ev.preventDefault();
      objetivo = { x: Math.max(0, Math.min(W, objetivo.x + mapa[ev.key][0])), y: Math.max(0, Math.min(H, objetivo.y + mapa[ev.key][1])) };
      N.mem.gesto(N.pagina, 'tecla', objetivo.x, objetivo.y, ev.key);
      pintar();
    }));

    medir();
    base0 = { b1: { x: b1.x, y: b1.y }, b2: { x: b2.x, y: b2.y } };
    const primero = pintar();

    return {
      pintar,
      masCercano: () => masCercano(objetivo),
      narrativo: masCercanoNarrativo,
      deformacion,
      get objetivo() { return objetivo; },
      destruir: () => { quitar.forEach(f => f()); capaLineas.remove(); capaPuntos.remove(); capaMarcas.remove(); }
    };
  }

  N.regG = { crear, codigoDePagina, codigoDelRecorrido };

})(window.NPVS);
