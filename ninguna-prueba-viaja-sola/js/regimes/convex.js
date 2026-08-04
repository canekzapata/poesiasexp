'use strict';
/* =====================================================================
   RÉGIMEN H — CONTENER
   un cuerpo convexo con muchos puntos en la frontera y uno solo adentro.
   mover una cara cambia la cuenta: para conservar el único interior hay
   que deformar todo el contenedor alrededor de él.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const NS = 'http://www.w3.org/2000/svg';
  function sv(t, a) { const e = document.createElementNS(NS, t); if (a) for (const k in a) e.setAttribute(k, a[k]); return e; }

  function crear(svg, opciones) {
    const o = Object.assign({ paso: 46, alCambiar: null }, opciones || {});
    const r = N.seed.make(N.estado.semilla, 'convexo');
    let W = 1, H = 1, cx = 0, cy = 0;
    let vertices = [];
    let interior = { i: 0, j: 0 };
    let arrastre = null;
    const capa = sv('g'); svg.appendChild(capa);

    function medir() {
      const rect = svg.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      cx = W / 2; cy = H / 2;
    }

    function nacer() {
      // hexágono en coordenadas enteras: frontera generosa, un solo dentro
      const R = 2;
      vertices = [];
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + r.f(-0.12, 0.12);
        vertices.push({
          i: Math.round(Math.cos(a) * R * (k % 2 ? 1 : 1.4)),
          j: Math.round(Math.sin(a) * R * (k % 2 ? 1.4 : 1))
        });
      }
      interior = { i: 0, j: 0 };
    }

    const P = (v) => ({ x: cx + v.i * o.paso, y: cy + v.j * o.paso });

    function dentro(pi, pj) {
      // punto en polígono convexo por signo consistente del producto cruz
      let signo = 0;
      for (let k = 0; k < vertices.length; k++) {
        const a = vertices[k], b = vertices[(k + 1) % vertices.length];
        const c = (b.i - a.i) * (pj - a.j) - (b.j - a.j) * (pi - a.i);
        if (c === 0) return 'frontera';
        const s = c > 0 ? 1 : -1;
        if (signo === 0) signo = s;
        else if (s !== signo) return 'fuera';
      }
      return 'dentro';
    }

    function contar() {
      let dentroN = 0, fronteraN = 0;
      const lim = 7;
      const puntos = [];
      for (let i = -lim; i <= lim; i++)
        for (let j = -lim; j <= lim; j++) {
          const d = dentro(i, j);
          if (d === 'dentro') { dentroN++; puntos.push({ i, j, d }); }
          else if (d === 'frontera') { fronteraN++; puntos.push({ i, j, d }); }
        }
      return { dentro: dentroN, frontera: fronteraN, puntos };
    }

    function pintar() {
      capa.textContent = '';
      const c = contar();
      const pts = vertices.map(P).map(p => p.x + ',' + p.y).join(' ');
      capa.appendChild(sv('polygon', { points: pts, class: 'cara-caja' }));
      for (const p of c.puntos) {
        const q = P(p);
        capa.appendChild(sv('circle', { cx: q.x, cy: q.y, r: p.d === 'frontera' ? 3 : 2, class: 'frontera' }));
      }
      // el único interior: el visitante, una palabra, el origen, la sonda o una ausencia
      const q = P(interior);
      const estado = dentro(interior.i, interior.j);
      capa.appendChild(sv('circle', { cx: q.x, cy: q.y, r: 8, class: 'interior-punto' + (estado === 'dentro' ? '' : ' afuera') }));
      vertices.forEach(function (v, k) {
        const p = P(v);
        const a = sv('circle', { cx: p.x, cy: p.y, r: 8, class: 'ret-asa', 'data-v': k, tabindex: 0 });
        capa.appendChild(a);
      });
      if (o.alCambiar) o.alCambiar({ dentro: c.dentro, frontera: c.frontera, estadoInterior: estado });
      return c;
    }

    function aXY(ev) { const rect = svg.getBoundingClientRect(); return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }; }

    const quitar = [];
    quitar.push(N.bus.listen(svg, 'pointerdown', function (ev) {
      const k = ev.target.getAttribute && ev.target.getAttribute('data-v');
      if (k === null || k === undefined) return;
      arrastre = +k;
      svg.setPointerCapture && svg.setPointerCapture(ev.pointerId);
    }));
    quitar.push(N.bus.listen(svg, 'pointermove', function (ev) {
      if (arrastre === null) return;
      const p = aXY(ev);
      const i = Math.round((p.x - cx) / o.paso), j = Math.round((p.y - cy) / o.paso);
      if (i === vertices[arrastre].i && j === vertices[arrastre].j) return;
      if (Math.abs(i) > 6 || Math.abs(j) > 6) return;
      vertices[arrastre] = { i, j };
      pintar();
    }));
    quitar.push(N.bus.listen(window, 'pointerup', function () {
      if (arrastre !== null) {
        N.mem.regimen('H', {});
        const e = N.mem.d.regimenes.H.estado;
        e.deformaciones = (e.deformaciones || 0) + 1;
        N.mem.guardar();
      }
      arrastre = null;
    }));
    quitar.push(N.bus.listen(svg, 'keydown', function (ev) {
      const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!m[ev.key]) return;
      const t = document.activeElement;
      const k = t && t.getAttribute && t.getAttribute('data-v');
      if (k === null || k === undefined) return;
      ev.preventDefault();
      const v = vertices[+k];
      vertices[+k] = { i: Math.max(-6, Math.min(6, v.i + m[ev.key][0])), j: Math.max(-6, Math.min(6, v.j + m[ev.key][1])) };
      pintar();
    }));
    quitar.push(N.bus.listen(window, 'resize', function () { medir(); pintar(); }));

    medir(); nacer();
    const primero = pintar();

    return {
      pintar, contar,
      get interior() { return interior; },
      estadoInterior: () => dentro(interior.i, interior.j),
      destruir: function () { quitar.forEach(f => f()); capa.remove(); }
    };
  }

  N.regH = { crear };

})(window.NPVS);
