'use strict';
/* =====================================================================
   RÉGIMEN E — PAGAR EL ATAJO
   el recorrido leído como circuito aritmético. cada acontecimiento que
   ya ocurrió es una puerta con entradas, salida y costo. el circuito no
   se inventa: se deduce de la memoria y de la semilla, así que el mismo
   expediente produce el mismo circuito.

   cuatro medidas, todas reales:
     nodos        cuántas puertas hacen falta
     profundidad  el camino más largo de una entrada a la salida
     duplicación  cuántas subexpresiones se repiten
     cable        cuánto espacio real ocupan las conexiones en pantalla

   simplificar funciona: fundir subexpresiones comunes abarata el circuito
   de verdad, y el código lo mide después en vez de prometerlo antes. el
   régimen no consiste en que el grafo empeore sino en dónde cae el
   ahorro: al calcular una sola vez lo que ocurrió varias, la memoria deja
   de distinguir esos pasos. el circuito se vuelve elegante exactamente en
   la medida en que el expediente se vuelve pobre. si no había nada que
   perder en la memoria, el saldo lo paga el mensaje con un bit.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const OPS = {
    '+': 'acumula',
    '×': 'multiplica',
    '⊕': 'cambia un bit',
    '≠': 'no concuerda',
    '∂': 'deriva de otra cosa',
    '⟳': 'retención'
  };

  /* ---- construcción: el circuito es el recorrido -------------------- */
  function construir() {
    const m = N.mem.d;
    const r = N.seed.make(N.estado.semilla, 'circuito:' + m.rutas.length);
    const nodos = [];
    const meter = (n) => { n.id = 'n' + nodos.length; nodos.push(n); return n; };

    meter({ t: 'entrada', et: 'la semilla', in: [], w: N.regG.codigoDePagina('umbral') });
    meter({ t: 'entrada', et: 'el mensaje', in: [], w: N.regG.codigoDePagina('certificado') });
    meter({ t: 'entrada', et: 'el primer gesto', in: [], w: (m.codigos[0] && m.codigos[0].w) || N.regG.codigoDelRecorrido() });

    /* el cableado no es azar: cada puerta cuelga de aquello de lo que
       depende. una página depende de la página desde la que se llegó; un
       fragmento, de la página que lo expulsó; una contradicción, de las
       dos cosas que no concuerdan. de ahí viene la duplicación real: si el
       recorrido repitió un tramo, el circuito calcula dos veces lo mismo,
       y compartir esas puertas sí ahorra. */
    const SEM = nodos[0], MSJ = nodos[1], GES = nodos[2];
    const ultimo = {};                 // página → última puerta que la calcula
    let previo = GES;

    for (const reg of m.rutas.slice(-26)) {
      const p = reg.p;
      const g = meter({
        t: 'puerta', op: '+',
        et: (N.rutas.catalogo[p] || { t: p }).t,
        in: [previo.id, SEM.id],
        w: N.regG.codigoDePagina(p), de: p
      });
      ultimo[p] = g;
      previo = g;
    }
    const desde = (p, alt) => (ultimo[p] ? ultimo[p].id : (alt || MSJ.id));

    for (const f of m.fragmentos)
      meter({ t: 'puerta', op: '×', et: f.texto, in: [desde(f.de), MSJ.id], w: N.regG.codigoDePagina(f.de || 'residuo'), de: f.de });
    for (const c of m.codigos.filter(c => c.mut > 0))
      meter({ t: 'puerta', op: '⊕', et: 'un recuerdo que se apartó', in: [desde(c.p, GES.id), GES.id], w: c.w, de: c.p });
    for (const c of m.contradicciones) {
      const nombra = N.rutas.IDS.filter(id => (c.a + ' ' + c.b).indexOf(id) >= 0);
      const ent = nombra.length >= 2 ? [desde(nombra[0]), desde(nombra[1])]
        : [desde('contradiccion'), previo.id];
      meter({ t: 'puerta', op: '≠', et: c.causa, in: ent, w: N.regG.codigoDePagina('contradiccion'), de: 'contradiccion' });
    }
    for (const f of m.falsos)
      meter({ t: 'puerta', op: '∂', et: f.tipo + ': ' + f.ref, in: [desde(f.ref, MSJ.id), desde('bitacora')], w: N.regG.codigoDePagina('bitacora'), de: 'bitacora' });

    const ultimas = nodos.slice(-3).map(n => n.id);
    meter({ t: 'salida', et: 'la prueba', in: ultimas.length ? ultimas : [nodos[0].id], w: N.regG.codigoDelRecorrido() });

    const c = { nodos: nodos, ops: [] };
    /* las simplificaciones ya aplicadas se rejuegan en orden. el circuito
       no vuelve a ser idéntico al recargar —simplificar cambió el
       expediente del que se deduce— pero carga con lo que se hizo: menos
       duplicación, y una bitácora que ya no distingue lo que fundió. */
    const guardadas = (m.regimenes.E && m.regimenes.E.estado.ops) || [];
    for (const op of guardadas) aplicar(c, op.tipo, true);
    return c;
  }

  const porId = (c) => { const x = {}; for (const n of c.nodos) x[n.id] = n; return x; };

  /* ---- medidas reales ----------------------------------------------- */
  function profundidad(c) {
    const idx = porId(c);
    const memo = {};
    function d(id, pila) {
      if (memo[id] !== undefined) return memo[id];
      if (pila.has(id)) return 0;              // el ciclo no cuenta como camino
      pila.add(id);
      const n = idx[id];
      let mx = 0;
      if (n) for (const e of n.in) mx = Math.max(mx, 1 + d(e, pila));
      pila.delete(id);
      return (memo[id] = mx);
    }
    let mx = 0;
    for (const n of c.nodos) mx = Math.max(mx, d(n.id, new Set()));
    return mx;
  }

  /* firma estructural: dos puertas comparten firma cuando calculan la
     misma subexpresión completa. la duplicación no se fabrica bajando el
     listón: aparece cuando el recorrido repitió un tramo de verdad. */
  const PROF_FIRMA = 10;
  function firmas(c) {
    const idx = porId(c);
    function f(id, prof) {
      const n = idx[id];
      if (!n) return '?';
      if (n.t === 'entrada') return 'E:' + n.et;
      if (prof >= PROF_FIRMA) return (n.op || n.t);
      const hijos = n.in.map(e => f(e, prof + 1)).sort();
      return (n.op || n.t) + '(' + hijos.join(',') + ')';
    }
    const out = {};
    for (const n of c.nodos) out[n.id] = f(n.id, 0);
    return out;
  }

  function duplicacion(c) {
    const fs = firmas(c);
    const cuenta = {};
    for (const n of c.nodos) {
      if (n.t !== 'puerta') continue;
      cuenta[fs[n.id]] = (cuenta[fs[n.id]] || 0) + 1;
    }
    let d = 0;
    for (const k in cuenta) if (cuenta[k] > 1) d += cuenta[k] - 1;
    return d;
  }

  function medir(c, cable) {
    return {
      nodos: c.nodos.length,
      profundidad: profundidad(c),
      duplicacion: duplicacion(c),
      cable: Math.round(cable || c.cable || 0),
      dom: document.getElementsByTagName('*').length
    };
  }

  /* ---- las tres simplificaciones ------------------------------------ */

  /* compartir: las puertas repetidas se funden en una, pero el reparto
     de su salida exige una retención. menos nodos, más profundidad. */
  function compartir(c, rejugando) {
    const fs = firmas(c);
    const grupos = {};
    for (const n of c.nodos) {
      if (n.t !== 'puerta') continue;
      (grupos[fs[n.id]] = grupos[fs[n.id]] || []).push(n);
    }
    let mejor = null;
    for (const k in grupos) if (grupos[k].length > 1 && (!mejor || grupos[k].length > mejor.length)) mejor = grupos[k];
    if (!mejor) return { hecho: false, razon: 'no hay dos puertas que calculen lo mismo' };

    const queda = mejor[0];
    const sobran = mejor.slice(1);
    let nota = '';

    /* régimen B: dos recuerdos no pueden fundirse si están demasiado cerca */
    for (const s of sobran) {
      const d = N.texto.hamming(queda.w, s.w);
      if (d < N.regB.DMIN) {
        /* el costo se paga una sola vez: al rejugar la operación en una
           recarga, la mutación se aplica pero el bit ya se perdió. */
        let w = s.w.split('');
        for (let i = 0, cambios = 0; i < w.length && cambios < (N.regB.DMIN - d); i++) {
          if (w[i] === queda.w[i]) { w[i] = w[i] === '1' ? '0' : '1'; cambios++; }
        }
        s.w = w.join('');
        if (!rejugando) N.texto.perderBit('dos puertas del circuito se fundieron estando a distancia ' + d);
        nota = 'dos puertas estaban a distancia ' + d + ': una mutó y el mensaje perdió un bit. ';
      }
    }

    const retencion = { id: 'r' + c.nodos.length, t: 'puerta', op: '⟳', et: 'reparto de ' + queda.et, in: [queda.id], w: queda.w };
    c.nodos.push(retencion);
    const fuera = new Set(sobran.map(s => s.id));
    for (const n of c.nodos) n.in = n.in.map(e => (fuera.has(e) ? retencion.id : e));
    c.nodos = c.nodos.filter(n => !fuera.has(n.id));

    /* el circuito sí adelgaza: fundir subexpresiones comunes funciona.
       el precio no está en el grafo, está en el expediente. al calcular
       una sola vez lo que ocurrió varias, la memoria deja de distinguir
       esos pasos: quedan degradados y con la causa escrita. */
    /* el cobro es proporcional pero acotado: fundir dieciocho puertas de
       un golpe no puede vaciar la bitácora entera. tres pasos por
       operación bastan para que se note y no para que desaparezca. */
    const paginas = rejugando ? [] : sobran.map(s => s.de).filter(Boolean).slice(0, 3);
    let borrosos = 0;
    for (const p of paginas) {
      const reg = N.mem.d.rutas.slice().reverse().find(r => r.p === p && r.c === 'verdadero');
      if (!reg) continue;
      reg.c = 'degradado';
      reg.causa = 'el circuito dejó de distinguir este paso de otro igual';
      borrosos++;
    }
    if (borrosos) {
      N.mem.contradiccion(
        'la bitácora registró ' + (borrosos + 1) + ' pasos distintos por «' + queda.et + '»',
        'el circuito los calcula una sola vez',
        'se fundieron subexpresiones comunes del recorrido');
      N.mem.guardar();
    }
    return {
      hecho: true,
      nota: nota + 'se fundieron ' + (sobran.length + 1) + ' puertas y apareció una retención para repartir su salida. ' +
        (borrosos ? 'el circuito adelgazó y ' + borrosos + ' pasos de la bitácora se volvieron indistinguibles.'
                  : 'el circuito adelgazó sin que la bitácora tuviera nada que perder.')
    };
  }

  /* aplanar: el camino más largo se acorta duplicando lo que lo alarga */
  function aplanar(c) {
    const idx = porId(c);
    const salida = c.nodos.find(n => n.t === 'salida');
    if (!salida) return { hecho: false, razon: 'no hay salida' };
    // camino crítico hacia atrás
    const memo = {};
    function d(id, pila) {
      if (memo[id] !== undefined) return memo[id];
      if (pila.has(id)) return 0;
      pila.add(id);
      const n = idx[id];
      let mx = 0;
      if (n) for (const e of n.in) mx = Math.max(mx, 1 + d(e, pila));
      pila.delete(id);
      return (memo[id] = mx);
    }
    let cur = salida, camino = [salida];
    for (let k = 0; k < 40; k++) {
      const n = idx[cur.id];
      if (!n || !n.in.length) break;
      let sig = null, mejorD = -1;
      for (const e of n.in) { const dd = d(e, new Set()); if (dd > mejorD) { mejorD = dd; sig = idx[e]; } }
      if (!sig || camino.includes(sig)) break;
      camino.push(sig); cur = sig;
    }
    const victima = camino[camino.length - 2];
    if (!victima || victima.t === 'entrada') return { hecho: false, razon: 'el camino más largo ya es una entrada' };

    /* se cortocircuita: la copia que sustituye a la víctima cuelga de su
       entrada MENOS profunda, así el camino crítico baja de verdad. lo que
       se gana en profundidad se paga en nodos y en duplicación. */
    const padre = camino[camino.length - 3] || salida;
    let corta = victima.in[0], cortaD = Infinity;
    for (const e of victima.in) { const dd = d(e, new Set()); if (dd < cortaD) { cortaD = dd; corta = e; } }
    const copia = { id: 'c' + c.nodos.length, t: 'puerta', op: victima.op || '+', et: 'copia de ' + victima.et, in: [corta], w: victima.w };
    const antesProf = profundidad(c);
    c.nodos.push(copia);
    padre.in = padre.in.map(e => (e === victima.id ? copia.id : e));
    const despuesProf = profundidad(c);
    /* la profundidad es un máximo sobre todos los caminos: si había más de
       uno igual de largo, acortar uno no acorta el circuito. se dice. */
    return {
      hecho: true,
      nota: despuesProf < antesProf
        ? 'el camino más largo se acortó cortocircuitando «' + victima.et + '»: la profundidad bajó de ' + antesProf + ' a ' + despuesProf + '.'
        : 'se cortocircuitó «' + victima.et + '», pero la profundidad no bajó: había más de un camino igual de largo. acortar uno no acorta el circuito.'
    };
  }

  /* desduplicar: se borran las repetidas sin repartidor. el circuito
     adelgaza y la bitácora pierde una entrada. */
  function desduplicar(c, rejugando) {
    const fs = firmas(c);
    const visto = {};
    const fuera = new Set();
    for (const n of c.nodos) {
      if (n.t !== 'puerta') continue;
      const f = fs[n.id];
      if (visto[f]) fuera.add(n.id); else visto[f] = n.id;
    }
    if (!fuera.size) return { hecho: false, razon: 'no hay puertas repetidas' };
    for (const n of c.nodos) n.in = n.in.map(e => (fuera.has(e) ? visto[fs[e]] || n.in[0] : e));
    c.nodos = c.nodos.filter(n => !fuera.has(n.id));

    /* el costo es de la memoria, no del circuito: se pierde un registro */
    const m = N.mem.d;
    const r = N.seed.make(N.estado.semilla, 'desdup:' + ((m.regimenes.E && m.regimenes.E.estado.ops) || []).length);
    let perdidos = 0;
    for (let i = 0; i < (rejugando ? 0 : Math.min(3, fuera.size)); i++) {
      const vivos = m.rutas.filter(x => x.c === 'verdadero');
      if (vivos.length <= 1) break;
      const victima = vivos[r.i(0, vivos.length - 1)];
      victima.c = 'degradado';
      victima.causa = 'el registro se perdió al adelgazar el circuito';
      perdidos++;
    }
    if (perdidos) {
      N.mem.contradiccion(
        'la bitácora registró ' + perdidos + ' pasos con causa',
        'el circuito ya no tiene puertas para ellos',
        'se quitaron ' + fuera.size + ' puertas repetidas sin dejar repartidor');
      N.mem.guardar();
    }
    return { hecho: true, nota: 'se quitaron ' + fuera.size + ' puertas repetidas. la bitácora perdió ' + perdidos + ' registro(s) a cambio.' };
  }

  /* ---- aplicar con cobro -------------------------------------------- */
  function aplicar(c, tipo, rejugando) {
    const antes = medir(c);
    let res;
    if (tipo === 'compartir') res = compartir(c, rejugando);
    else if (tipo === 'aplanar') res = aplanar(c);
    else if (tipo === 'desduplicar') res = desduplicar(c, rejugando);
    else return { hecho: false, razon: 'operación desconocida' };
    if (!res.hecho) return res;

    const despues = medir(c);
    /* la regla del régimen no es que el circuito empeore —simplificar de
       verdad funciona— sino que el ahorro se cobra fuera de él. si el
       circuito bajó en todo y el expediente no perdió nada, el aparato
       cobra el saldo con un bit del mensaje. */
    const bajoTodo = ['nodos', 'profundidad', 'duplicacion'].every(k => despues[k] <= antes[k]);
    const pagoEnMemoria = /bitácora|indistinguibles|registro/.test(res.nota || '');
    if (bajoTodo && !pagoEnMemoria && !rejugando) {
      N.texto.perderBit('el circuito se simplificó sin que el expediente perdiera nada');
      res.peaje = true;
      res.nota = (res.nota || '') + ' el expediente no tenía nada que perder, así que el saldo lo pagó el mensaje: un bit menos.';
    }
    res.antes = antes;
    res.despues = medir(c);

    if (!rejugando) {
      N.mem.regimen('E', {});
      const est = N.mem.d.regimenes.E.estado;
      est.ops = (est.ops || []).concat([{ tipo: tipo, t: Date.now() }]);
      est.medidas = res.despues;
      N.mem.guardar(true);
      N.mem.hito('el-atajo-se-pago', tipo);
      if (est.ops.length >= 3) N.mem.hito('el-circuito-fue-simplificado-tres-veces', est.ops.length);
      N.bus.emit('circuito', { tipo, res });
    }
    return res;
  }

  /* ---- dibujo: circuito tipográfico, cable medido de verdad --------- */
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (t, a) => { const e = document.createElementNS(NS, t); if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };

  function dibujar(svg, c, opciones) {
    const o = Object.assign({ alTocar: null }, opciones || {});
    svg.textContent = '';
    const rect = svg.getBoundingClientRect();
    const W = Math.max(1, rect.width), H = Math.max(1, rect.height);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    const idx = porId(c);
    const memo = {};
    function nivel(id, pila) {
      if (memo[id] !== undefined) return memo[id];
      if (pila.has(id)) return 0;
      pila.add(id);
      const n = idx[id];
      let mx = 0;
      if (n) for (const e of n.in) mx = Math.max(mx, 1 + nivel(e, pila));
      pila.delete(id);
      return (memo[id] = mx);
    }
    /* el circuito se lee de izquierda a derecha: la profundidad ocupa el
       eje largo y cada capa se apila en vertical. las entradas quedan al
       principio y la prueba al final, como en cualquier circuito. */
    const capas = {};
    for (const n of c.nodos) { const k = nivel(n.id, new Set()); (capas[k] = capas[k] || []).push(n); }
    const maxN = Math.max(1, Math.max.apply(null, Object.keys(capas).map(Number)));
    const pos = {};
    const mx = 26, my = 22;
    for (const k in capas) {
      const col = capas[k];
      const x = mx + (+k) * ((W - mx * 2) / maxN);
      col.forEach((n, i) => { pos[n.id] = { x: x, y: my + ((H - my * 2) / (col.length + 1)) * (i + 1) }; });
    }

    const gCables = sv('g'); svg.appendChild(gCables);
    const gNodos = sv('g'); svg.appendChild(gNodos);
    let cable = 0;
    const cs = getComputedStyle(document.documentElement);
    for (const n of c.nodos) {
      const p = pos[n.id]; if (!p) continue;
      for (const e of n.in) {
        const q = pos[e]; if (!q) continue;
        const medio = (p.x + q.x) / 2;
        const d = 'M' + q.x + ',' + q.y + ' L' + medio + ',' + q.y + ' L' + medio + ',' + p.y + ' L' + p.x + ',' + p.y;
        cable += Math.abs(medio - q.x) + Math.abs(p.y - q.y) + Math.abs(p.x - medio);
        gCables.appendChild(sv('path', { d: d, class: 'cable' }));
      }
    }
    for (const n of c.nodos) {
      const p = pos[n.id]; if (!p) continue;
      const g = sv('g', { class: 'puerta puerta--' + n.t, tabindex: 0, role: 'button' });
      const glifo = n.t === 'entrada' ? '·' : (n.t === 'salida' ? '⊢' : n.op);
      const t = sv('text', { x: p.x, y: p.y + 6, class: 'puerta-glifo' });
      t.textContent = glifo;
      g.appendChild(t);
      g.appendChild(sv('title')).textContent = n.et + (n.op ? ' — ' + OPS[n.op] : '') + ' · ' + n.w;
      if (o.alTocar) {
        g.addEventListener('click', () => o.alTocar(n));
        g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); o.alTocar(n); } });
      }
      gNodos.appendChild(g);
    }
    c.cable = cable;
    return medir(c, cable);
  }

  N.regE = { construir, medir, aplicar, dibujar, profundidad, duplicacion, firmas, OPS };

})(window.NPVS);
