'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  print.js  ::  la imposición
//
//  Después de una vuelta, el sistema impone ~16 láminas con la
//  arqueología de ESTA sesión: los fragmentos como quedaron, los
//  enlaces que el lector hizo, los estratos, la leyenda ya corrompida
//  y el registro de acciones. Cada lector produce una edición distinta.
// =====================================================================

(function () {
  const C = window.ARCHIVE_CONTENT;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  const S = (t, a = {}) => { const n = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) n.setAttribute(k, String(v)); return n; };

  function impose(book, snap, depth) {
    const rng = window.ArchiveCore.makeRng(`${snap.seed}:print:${snap.turn}`);
    const PLATES = 16;
    const frags = snap.fragments.slice();
    const rels = snap.relations.slice();

    // portada contaminada
    book.appendChild(cover(snap));

    // 6 láminas estratigráficas: una por estrato, el mismo campo excavado
    C.STRATA.forEach((stratum, i) => {
      book.appendChild(stratumPlate(snap, i, rng));
    });

    // láminas de enlace: los vínculos que ESTA lectura produjo
    const linkPlates = Math.min(4, Math.max(1, Math.ceil(rels.length / 3)));
    for (let i = 0; i < linkPlates; i++) {
      book.appendChild(linkPlate(snap, i, linkPlates, rng));
    }

    // completa hasta ~16 con láminas de residuo / arqueología
    while (book.children.length < PLATES - 1) {
      book.appendChild(residuePlate(snap, book.children.length, rng));
    }

    // colofón: el registro de la lectura
    book.appendChild(colophon(snap));
  }

  // --- portada -------------------------------------------------------
  function cover(snap) {
    const plate = el('section', 'plate plate-cover');
    plate.appendChild(el('div', 'plate-crop tl'));
    plate.appendChild(el('div', 'plate-crop br'));
    const t = el('h1', 'cover-title', 'EL ARCHIVO\nNO RECUERDA\nHABER SIDO\nLEÍDO');
    plate.appendChild(t);
    plate.appendChild(el('p', 'cover-sub', 'poemario arqueológico para una máquina que confunde lectura con clima'));
    const meta = el('pre', 'cover-meta',
      `semilla ............ ${snap.seed}
vuelta ............. ${String(snap.turn).padStart(2, '0')}
integridad leyenda . ${snap.legendIntegrity.toFixed(1)}%
autoridad .......... ${snap.authority.toFixed(1)}
fragmentos vivos ... ${snap.fragments.length}
enterrados ......... ${snap.buried.length}
edición ............ única — esta lectura`);
    plate.appendChild(meta);
    return plate;
  }

  // --- lámina estratigráfica: el campo visto a una profundidad -------
  function stratumPlate(snap, depth, rng) {
    const stratum = C.STRATA[depth];
    const plate = el('section', `plate plate-stratum stratum-${stratum.key}`);
    plate.appendChild(plateHead(`ESTRATO ${depth + 1}/6 · ${stratum.label}`, `excavación ${depth}`));

    const field = el('div', 'plate-field');
    const svg = S('svg', { class: 'plate-svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none' });
    // relaciones proyectadas
    snap.relations.forEach((r) => {
      const a = snap.fragments.find((f) => f.id === r.from);
      const b = snap.fragments.find((f) => f.id === r.to);
      if (!a || !b) return;
      svg.appendChild(S('path', { class: 'plate-rel', d: `M${a.x * 100},${a.y * 100} L${b.x * 100},${b.y * 100}`, fill: 'none' }));
    });
    field.appendChild(svg);

    // fragmentos tratados por la operación del estrato
    const r = window.ArchiveCore.makeRng(`${snap.seed}:plate:${depth}`);
    snap.fragments.forEach((f) => {
      const dist = Math.abs(depth - f.stratum);
      const node = el('div', 'plate-frag');
      node.style.left = `${(f.x * 100).toFixed(2)}%`;
      node.style.top = `${(f.y * 100).toFixed(2)}%`;
      node.style.opacity = Math.max(0.12, 1 - dist * 0.4).toFixed(2);
      node.style.setProperty('--scale', Math.min(3, f.scale).toFixed(2));
      const text = window.ArchiveCore.applyStratum(f.text, stratum.op, r);
      node.appendChild(el('span', 'plate-frag-glyph', f.glyph));
      node.appendChild(el('span', 'plate-frag-text', text));
      field.appendChild(node);
    });
    plate.appendChild(field);
    plate.appendChild(el('div', 'plate-foot', `bajar es excavar — la geometría es la operación lingüística`));
    return plate;
  }

  // --- lámina de enlace: los vínculos de esta lectura ---------------
  function linkPlate(snap, i, total, rng) {
    const plate = el('section', 'plate plate-link');
    plate.appendChild(plateHead(`ENLACES ${i + 1}/${total}`, `${snap.relations.length} vínculos irreversibles`));
    const list = el('div', 'link-list');
    const per = Math.ceil(snap.relations.length / total);
    snap.relations.slice(i * per, (i + 1) * per).forEach((r) => {
      const a = snap.fragments.find((f) => f.id === r.from);
      const b = snap.fragments.find((f) => f.id === r.to);
      const row = el('div', 'link-row');
      row.appendChild(el('span', 'link-glyph', r.glyph));
      row.appendChild(el('span', 'link-kind', r.kind));
      row.appendChild(el('span', 'link-a', a ? a.text.replace(/\n/g, ' ') : '—'));
      row.appendChild(el('span', 'link-arrow', '→'));
      row.appendChild(el('span', 'link-b', b ? b.text.replace(/\n/g, ' ') : '—'));
      list.appendChild(row);
    });
    if (!snap.relations.length) list.appendChild(el('div', 'link-row', 'esta lectura no enlazó nada: el archivo quedó disperso'));
    plate.appendChild(list);
    return plate;
  }

  // --- lámina de residuo: lo enterrado, mal atribuido ---------------
  function residuePlate(snap, idx, rng) {
    const plate = el('section', 'plate plate-residue');
    plate.appendChild(plateHead(`ARQUEOLOGÍA FUTURA`, `residuos de la vuelta ${snap.turn}`));
    const grid = el('div', 'residue-grid');
    const items = snap.buried.length ? snap.buried : snap.fragments.map((f) => ({ text: f.text, era: f.era, origin: f.origin }));
    items.forEach((res) => {
      const cell = el('div', 'residue-cell');
      cell.appendChild(el('span', 'residue-era', res.era || '¿?'));
      cell.appendChild(el('span', 'residue-text', res.text.replace(/\n/g, ' ')));
      cell.appendChild(el('span', 'residue-origin', res.origin || ''));
      grid.appendChild(cell);
    });
    plate.appendChild(grid);
    plate.appendChild(el('div', 'plate-foot', 'atribuido erróneamente a otra época'));
    return plate;
  }

  // --- colofón: el registro de la lectura ----------------------------
  function colophon(snap) {
    const plate = el('section', 'plate plate-colophon');
    plate.appendChild(plateHead('COLOFÓN', 'el registro de una lectura particular'));
    const acts = {};
    snap.log.filter((l) => l.kind === 'prophecy').forEach((l) => { acts[l.hit ? 'aciertos' : 'fallos'] = (acts[l.hit ? 'aciertos' : 'fallos'] || 0) + 1; });
    const states = snap.log.filter((l) => l.kind === 'state' || l.kind === 'state-jump').map((l) => l.state);
    const links = snap.log.filter((l) => l.kind === 'link').length;
    const body = el('pre', 'colophon-body',
`Este ejemplar es el registro de una lectura que ya no puede repetirse.
El archivo pasó por los estados en este orden:

  ${states.join(' · ') || '—'}

enlaces producidos ...... ${links}
profecías acertadas ..... ${acts.aciertos || 0}
profecías falladas ...... ${acts.fallos || 0}
integridad final ........ ${snap.legendIntegrity.toFixed(1)}%
autoridad final ......... ${snap.authority.toFixed(1)}

El libro terminó de archivar una lectura que el lector
no reconoce del todo como propia.`);
    plate.appendChild(body);
    plate.appendChild(el('div', 'colophon-mark', C.DIAGNOSTIC[0]));
    return plate;
  }

  function plateHead(left, right) {
    const head = el('div', 'plate-head');
    head.appendChild(el('span', 'plate-head-l', left));
    head.appendChild(el('span', 'plate-head-r', right));
    return head;
  }

  window.ArchivePrint = { impose };
})();
