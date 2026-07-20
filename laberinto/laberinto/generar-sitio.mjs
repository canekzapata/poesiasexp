/*
  generar-sitio.mjs — el generador
  poesiasexp / laberinto

  planta una internet local a partir de una semilla: decide cuantas paginas
  existen (24–72), que topologia tiene cada una, como se relacionan, cuales se
  encuentran, cuales permanecen ocultas, que reglas celulares las gobiernan y
  que color domina. despues escribe la constelacion: manifest.js + paginas/*.html
  + las cuatro puertas (index, mapa, afuera, error).

  sin dependencias. node >= 16.

    node generar-sitio.mjs                 # una internet nueva (semilla al azar)
    node generar-sitio.mjs --semilla río   # una internet reproducible
    node generar-sitio.mjs --semilla río --n 48

  la obra funciona aunque nunca se ejecute este generador: la constelacion ya
  viene escrita. re-ejecutar con otra semilla la reemplaza por otra distinta.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AZAR from './js/rng.js';
import AUTOMATAS from './js/automatas.js';
import PALETAS from './js/paletas.js';
import CORPUS from './js/corpus.js';

const { RNG, hashSeed } = AZAR;
const { REGLAS } = AUTOMATAS;
const FAMILIAS = PALETAS.FAMILIAS;
const DIR = path.dirname(fileURLToPath(import.meta.url));

// ---------- argumentos ----------
function arg(nombre) {
  const i = process.argv.indexOf(nombre);
  return i >= 0 ? process.argv[i + 1] : null;
}
const siteSeed = arg('--semilla') || arg('-s') || ('río-' + (Math.random() * 1e9 | 0));
const R = new RNG(siteSeed);
const n = Math.max(4, Math.min(120, parseInt(arg('--n') || arg('-n') || '', 10) || R.int(24, 72)));

// ---------- vocabularios de planificacion ----------
const TOPOS = { tabla: 5, ventanas: 5, campo: 5, iframes: 3, formulario: 3, fuente: 3, celular: 5, indice: 4, vacio: 3, paisaje: 5, vertical: 4, corredor: 4, error: 2, reproductora: 2 };
const OVERLAY_OK = ['ventanas', 'iframes', 'celular', 'indice', 'vacio', 'paisaje'];
const SCROLLY = ['campo', 'corredor'];
const RITMOS = { inmovil: 1, lento: 4, nervioso: 3, explosivo: 1, clic: 2, scroll: 2, espera: 2, cursor: 2 };
const TIPOS = ['mono', 'mono', 'serif', 'sans', 'glifo', 'ancho'];
const RARES = ['palabraPantalla', 'ventanaMinuscula', 'invertirTabla', 'intercambiarDestinos', 'revelarFuente', 'todosMismoTexto', 'soloGlifos', 'desaparecerAlfabeto', 'cambiarCSS', 'recordarOtraSemilla', 'indiceInexistente', 'fondoEnlace', 'migrarMargen', 'reorganizarCursor', 'automataDetenido'];

function planTopo(r) {
  const primary = r.weighted(TOPOS);
  const topo = [primary];
  if (r.chance(0.45)) { const s = r.pick(OVERLAY_OK.filter(t => t !== primary)); if (s) topo.push(s); }
  if (r.chance(0.15)) { const t = r.pick(OVERLAY_OK.filter(t => topo.indexOf(t) < 0)); if (t) topo.push(t); }
  return topo;
}

// ---------- nodos ----------
const ids = Array.from({ length: n }, (_, i) => String(i).padStart(3, '0'));
const nodos = {};
for (const id of ids) {
  const seed = hashSeed(siteSeed + ':' + id);
  const nr = new RNG(seed);
  const familia = nr.pick(FAMILIAS);
  const topo = planTopo(nr);
  const pal = PALETAS.generar(new RNG(seed).fork('paleta'), familia); // paridad con el navegador
  nodos[id] = {
    id, seed, siteSeed,
    familia, topo,
    rule: nr.pick(REGLAS),
    tipo: nr.pick(TIPOS),
    ritmo: nr.weighted(RITMOS),
    mutacion: +nr.float(0.1, 0.9).toFixed(2),
    rare: nr.picks(RARES, nr.int(0, 3)),
    titulo: nr.pick(CORPUS.titulosDePestana),
    comentarios: nr.picks(CORPUS.comentariosHTML, nr.int(2, 4)),
    color: pal.acento, fondo: pal.fondo,
    oculta: false,
    links: []
  };
}

// ---------- paginas ocultas (~12%) ----------
const nOcultas = Math.floor(n * 0.12);
R.picks(ids, nOcultas).forEach(id => { nodos[id].oculta = true; });
const visibles = ids.filter(id => !nodos[id].oculta);

// ---------- enlaces ----------
function elegirKind(nr, node) {
  const w = { normal: 50, iframe: 12, ventana: 10, cromatico: 8, mutante: 7, perecedero: 5, multiplica: 4 };
  if (node.topo.some(t => SCROLLY.indexOf(t) >= 0)) w.coordenada = 14;
  return nr.weighted(w);
}
function enlace(to, href, kind, nr, textos) { return { to, href, kind, text: nr.pick(textos || CORPUS.enlaces) }; }

for (const id of ids) {
  const node = nodos[id];
  const nr = new RNG(node.seed).fork('rutas');
  const grado = nr.int(2, 7);
  const idx = ids.indexOf(id);
  const pool = nr.shuffle(visibles.filter(x => x !== id));
  let ci = 0;
  for (let k = 0; k < grado; k++) {
    const modo = nr.weighted({ pagina: 8, self: 0.5, afuera: 0.6, error: 0.5, mapa: 0.4 });
    if (modo === 'self') { node.links.push(enlace(id, id + '.html', 'normal', nr)); continue; }
    if (modo === 'afuera') { node.links.push(enlace('afuera', '../afuera.html', nr.chance(0.5) ? 'ventana' : 'normal', nr, ['hacia afuera', 'afuera', 'salir del río'])); continue; }
    if (modo === 'error') { node.links.push(enlace('error', '../error.html', 'normal', nr, CORPUS.errores)); continue; }
    if (modo === 'mapa') { node.links.push(enlace('mapa', '../mapa.html', 'normal', nr, ['mapa'])); continue; }
    let to = null;
    if (nr.chance(0.5)) { const off = nr.pick([-3, -2, -1, 1, 2, 3]); const cand = ids[(idx + off + n) % n]; if (cand !== id && !nodos[cand].oculta) to = cand; }
    if (!to) { to = pool.length ? pool[ci++ % pool.length] : id; }
    node.links.push(enlace(to, to + '.html', elegirKind(nr, node), nr));
  }
}

// ---------- puertas ----------
const ir = new RNG(siteSeed + ':index');
const indexLinks = ir.picks(visibles, Math.min(visibles.length, ir.int(6, 10)))
  .map(to => ({ to, href: 'paginas/' + to + '.html', text: ir.pick(CORPUS.enlaces), kind: ir.weighted({ normal: 6, iframe: 2, ventana: 2 }) }));
indexLinks.push({ to: 'mapa', href: 'mapa.html', text: 'mapa', kind: 'normal' });
indexLinks.push({ to: 'afuera', href: 'afuera.html', text: 'afuera', kind: 'normal' });

const indexDesc = puerta('index', {
  topo: ir.chance(0.5) ? ['paisaje', 'indice'] : ['indice'],
  ritmo: 'lento', mutacion: 0.25, titulo: 'laberinto · poesiasexp',
  links: indexLinks, prefijoPaginas: 'paginas/', rare: ir.picks(RARES, 1),
  seedTag: 'index', familia: ir.pick(FAMILIAS), tipo: ir.pick(TIPOS)
});

const mr = new RNG(siteSeed + ':mapa');
const mapaDesc = puerta('mapa', {
  topo: ['mapa'], ritmo: 'inmovil', mutacion: 0.1, titulo: 'mapa',
  prefijoPaginas: 'paginas/', rare: [],
  links: [{ to: 'index', href: 'index.html', text: 'índice', kind: 'normal' },
          { to: 'afuera', href: 'afuera.html', text: 'afuera', kind: 'normal' }]
    .concat(mr.picks(visibles, 3).map(to => ({ to, href: 'paginas/' + to + '.html', text: mr.pick(CORPUS.enlaces), kind: 'normal' }))),
  seedTag: 'mapa', familia: mr.pick(FAMILIAS), tipo: 'mono'
});

const ar = new RNG(siteSeed + ':afuera');
const afueraDesc = puerta('afuera', {
  topo: ar.chance(0.5) ? ['vacio'] : ['paisaje'], ritmo: ar.chance(0.5) ? 'inmovil' : 'lento',
  mutacion: 0.15, titulo: 'afuera',
  links: [{ to: 'index', href: 'index.html', text: 'adentro', kind: 'normal' }]
    .concat(ar.picks(visibles, 2).map(to => ({ to, href: 'paginas/' + to + '.html', text: ar.pick(CORPUS.enlaces), kind: ar.pick(['normal', 'coordenada']) }))),
  comentarios: ['una sonda que lleva décadas escapando', 'lo único que sobreviva de nosotros', 'dejará como basura nuestra última esperanza'],
  seedTag: 'afuera', familia: ar.pick(['oscura', 'blanca', 'ceniza', 'mono']), tipo: ar.pick(TIPOS), rare: ar.picks(RARES, 1)
});

const er = new RNG(siteSeed + ':error');
const errorDesc = puerta('error', {
  topo: ['error'], ritmo: 'nervioso', mutacion: 0.5, titulo: '404',
  links: er.picks(visibles, Math.min(visibles.length, er.int(4, 8)))
    .map(to => ({ to, href: 'paginas/' + to + '.html', text: er.pick(CORPUS.rutas), kind: er.pick(['normal', 'perecedero', 'mutante']) }))
    .concat([{ to: 'index', href: 'index.html', text: 'índice', kind: 'normal' }]),
  seedTag: 'error', familia: 'terminal', tipo: 'mono', rare: er.picks(RARES, 2)
});

function puerta(nombre, extra) {
  const seed = hashSeed(siteSeed + ':' + (extra.seedTag || nombre));
  return Object.assign({
    id: nombre, seed, siteSeed,
    familia: FAMILIAS[0], tipo: 'mono', ritmo: 'lento', mutacion: 0.3,
    rule: new RNG(seed).pick(REGLAS),
    titulo: nombre, comentarios: extra.comentarios || ['debajo de la interfaz no hay obra: la interfaz es la obra'],
    rare: extra.rare || [], links: []
  }, extra);
}

// ---------- conectividad: toda pagina visible alcanzable desde index ----------
(function asegurarConexion() {
  const alcanz = new Set();
  const cola = [];
  indexLinks.forEach(l => { if (nodos[l.to]) { alcanz.add(l.to); cola.push(l.to); } });
  while (cola.length) {
    const id = cola.shift();
    for (const l of nodos[id].links) {
      if (nodos[l.to] && !nodos[l.to].oculta && !alcanz.has(l.to)) { alcanz.add(l.to); cola.push(l.to); }
    }
  }
  const reachArr = Array.from(alcanz);
  for (const id of visibles) {
    if (!alcanz.has(id)) {
      const fuente = reachArr.length ? R.pick(reachArr) : 'index';
      if (fuente === 'index') indexLinks.splice(indexLinks.length - 2, 0, { to: id, href: 'paginas/' + id + '.html', text: R.pick(CORPUS.enlaces), kind: 'normal' });
      else nodos[fuente].links.push({ to: id, href: id + '.html', text: R.pick(CORPUS.enlaces), kind: 'normal' });
      alcanz.add(id); reachArr.push(id);
    }
  }
})();

// ---------- manifiesto (grafo) ----------
const manifiesto = {
  siteSeed: String(siteSeed), n, generado: new Date().toISOString().slice(0, 10),
  entradas: ['index', 'mapa', 'afuera', 'error'],
  paginas: {}, aristas: [], ocultas: ids.filter(id => nodos[id].oculta)
};
for (const id of ids) {
  const nd = nodos[id];
  manifiesto.paginas[id] = { id, topo: nd.topo, rule: nd.rule, familia: nd.familia, color: nd.color, titulo: nd.titulo, oculta: nd.oculta };
  for (const l of nd.links) if (nodos[l.to]) manifiesto.aristas.push([id, l.to, l.kind]);
}

// ---------- escritura ----------
function jsonSafe(o) { return JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"); }

function cascara(desc, root) {
  const base = root ? '' : '../';
  const comentarios = (desc.comentarios || []).map(c => '<!-- ' + c.replace(/--/g, '—') + ' -->').join('\n');
  const noscript = '<ul>' + (desc.links || []).map(l => '<li><a href="' + l.href + '">' + esc(l.text || l.to) + '</a></li>').join('') + '</ul>';
  const assets = ['js/rng.js', 'js/automatas.js', 'js/paletas.js', 'js/corpus.js', 'js/gramaticas.js', 'js/rutas.js', 'js/motor.js', 'js/barra.js'];
  return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(desc.titulo || '·') + '</title>\n'
    + comentarios + '\n'
    + '<link rel="stylesheet" href="' + base + 'css/base.css">\n'
    + '<link rel="stylesheet" href="' + base + 'css/mutaciones.css">\n'
    + '</head>\n<body>\n'
    + '<!-- ' + (desc.comentarios && desc.comentarios[0] || 'río') + ' -->\n'
    + '<main id="laberinto"><noscript>' + noscript + '</noscript></main>\n'
    + '<script>window.__PAGINA__=' + jsonSafe(desc) + ';window.__BASE__=' + JSON.stringify(base) + ';</script>\n'
    + '<script src="' + base + 'manifest.js"></script>\n'
    + assets.map(a => '<script src="' + base + a + '"></script>').join('\n') + '\n'
    + '</body>\n</html>\n';
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// limpia paginas previas
const dirPaginas = path.join(DIR, 'paginas');
fs.mkdirSync(dirPaginas, { recursive: true });
for (const f of fs.readdirSync(dirPaginas)) if (f.endsWith('.html')) fs.unlinkSync(path.join(dirPaginas, f));

// manifest.js
fs.writeFileSync(path.join(DIR, 'manifest.js'),
  '/* manifest.js — el grafo de esta internet. generado por generar-sitio.mjs. */\n'
  + 'window.MANIFIESTO = ' + JSON.stringify(manifiesto, null, 1) + ';\n'
  + 'if (typeof module !== "undefined" && module.exports) module.exports = window.MANIFIESTO;\n');

// paginas
for (const id of ids) {
  const desc = Object.assign({}, nodos[id]);
  delete desc.color; delete desc.fondo; // el navegador recalcula la paleta; el manifiesto guarda el color
  fs.writeFileSync(path.join(dirPaginas, id + '.html'), cascara(desc, false));
}
// puertas (en la raiz)
fs.writeFileSync(path.join(DIR, 'index.html'), cascara(indexDesc, true));
fs.writeFileSync(path.join(DIR, 'mapa.html'), cascara(mapaDesc, true));
fs.writeFileSync(path.join(DIR, 'afuera.html'), cascara(afueraDesc, true));
fs.writeFileSync(path.join(DIR, 'error.html'), cascara(errorDesc, true));

// ---------- reporte ----------
const cuenta = {};
for (const id of ids) nodos[id].topo.forEach(t => cuenta[t] = (cuenta[t] || 0) + 1);
console.log('laberinto generado');
console.log('  semilla : ' + siteSeed);
console.log('  páginas : ' + n + ' (' + manifiesto.ocultas.length + ' ocultas)');
console.log('  aristas : ' + manifiesto.aristas.length);
console.log('  topologías: ' + Object.entries(cuenta).map(([k, v]) => k + ':' + v).join('  '));
console.log('  puertas : index.html · mapa.html · afuera.html · error.html');
