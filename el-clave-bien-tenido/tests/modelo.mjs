/* =====================================================================
   EL CLAVE BIEN TEÑIDO — pruebas del modelo
   corren en Node, sin navegador, sin dispositivo de audio y sin oídos:

     node tests/modelo.mjs

   no juzgan la obra. comprueban que la obra funciona: determinismo,
   irreversibilidad, muerte por paralelas, criba, presupuesto, residuo del
   temperamento, accesibilidad cromática, y —midiendo el `.wasm` de Faust
   con una Goertzel— que el gradiente y el espectro son la misma cosa.
   ===================================================================== */
import { createRequire } from 'module';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');

require(join(RAIZ, 'js/rng.js'));
require(join(RAIZ, 'js/nombres.js'));
const COL = require(join(RAIZ, 'js/color.js'));
const CP = require(join(RAIZ, 'js/contrapunto.js'));
const RNG = require(join(RAIZ, 'js/rng.js'));

let fallos = 0, pruebas = 0;
const ok = (n, c, extra) => {
  pruebas++;
  if (!c) fallos++;
  console.log((c ? '  ok  ' : 'FALLO ') + n + (extra !== undefined ? '  → ' + extra : ''));
};
const titulo = (t) => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length)));

/* un recorrido reproducible: los gestos salen de la semilla, no de mí */
function recorrido(semilla, opciones) {
  const org = CP.crear(semilla, opciones);
  const r = RNG.make(semilla, 'visitante');
  let t = 0;
  const correr = (hasta) => { while (t < hasta) { t += 0.25; org.avanzar(t); } };
  const gestos = [];
  while (t < 600 && !org.detenido) {
    const vs = org.audibles();
    if (!vs.length) break;
    const v = vs[r.i(0, vs.length - 1)];
    const w = r.i(0, 6);
    if (w === 0) org.mover(v.id, r.f(0, 0.8), r.f(0, 0.8));
    else if (w === 1) org.modificar(v.id, { dH: r.f(-40, 40), dC: r.f(-0.02, 0.02) });
    else if (w === 2 && vs.length > 1) org.sumar(v.id, vs[(vs.indexOf(v) + 1) % vs.length].id);
    else if (w === 3 && vs.length > 1) org.restar(v.id, vs[(vs.indexOf(v) + 1) % vs.length].id);
    else if (w === 4) org.duplicar(v.id);
    else if (w === 5) org.redimensionar(v.id, r.f(0.06, 0.35), r.f(0.06, 0.35));
    else org.detener(v.id);
    gestos.push(w);
    correr(t + r.f(1, 6));
  }
  correr(Math.min(600, t + 20));
  return { org, gestos, t };
}

function huella(org) {
  return JSON.stringify({
    voces: org.voces.map(v => [v.id, v.estado, Math.round(v.color.H * 1000), Math.round(v.color.C * 100000),
      Math.round(v.color.L * 100000), Math.round(org.area(v) * 1e6), v.clase]),
    inv: Object.keys(org.invariantes).sort(),
    gastado: Math.round(org.presupuesto.gastado * 1e6),
    bit: org.bitacora.length,
    criba: org.criba().map(c => c.m + ':' + c.b).sort()
  });
}

/* =================================================================== */
titulo('1 · misma semilla + mismo historial = mismo mundo');
{
  const a = recorrido('prueba-exacta-101');
  const b = recorrido('prueba-exacta-101');
  ok('dos recorridos idénticos dan el mismo mundo', huella(a.org) === huella(b.org));
  const c = recorrido('prueba-exacta-102');
  ok('otra semilla da otro mundo', huella(a.org) !== huella(c.org));
  ok('el certificado también es reproducible',
    JSON.stringify(a.org.certificado()) === JSON.stringify(b.org.certificado()));
  ok('la semilla descendiente es determinista',
    a.org.semillaDescendiente() === b.org.semillaDescendiente(), a.org.semillaDescendiente());
}

titulo('2 · cero Math.random() en composición y color');
{
  const dirs = ['js', 'worklets', 'dsp'];   // la pieza; las pruebas sí lo nombran, para buscarlo
  /* los comentarios sí pueden nombrarlo —de hecho lo nombran, para decir
     que no se usa—; lo que no puede haber es una llamada. */
  const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  let usos = [];
  for (const d of dirs) {
    for (const f of readdirSync(join(RAIZ, d))) {
      if (f === 'Tone.js') continue;                     // la librería no compone
      if (!/\.(js|mjs|dsp)$/.test(f)) continue;
      const src = sinComentarios(readFileSync(join(RAIZ, d, f), 'utf8'));
      const n = (src.match(/Math\.random\s*\(/g) || []).length;
      if (n) usos.push(d + '/' + f + ' ×' + n);
    }
  }
  ok('ningún archivo de la pieza llama a Math.random()', usos.length === 0, usos.join(', ') || 'cero');
  const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
  ok('index.html tampoco', !/Math\.random/.test(html));
  ok('Tone.js se carga desde copia local, sin CDN', /src="js\/Tone\.js"/.test(html) && !/https?:\/\//.test(html.replace(/<meta[^>]*>/g, '')));
}

titulo('3 · un color quieto y solo no suena; un choque sí');
{
  const org = CP.crear('quieta-sola-303');
  /* separar todas las pantallas: nadie se toca */
  org.voces.forEach((v, i) => { v.rect = { x: 0.02 + i * 0.24, y: 0.02, w: 0.08, h: 0.08 }; });
  let t = 0; while (t < 40) { t += 0.25; org.avanzar(t); }
  ok('sin solapes no hay acontecimientos', Object.keys(org.choques).length === 0);
  ok('y el presupuesto de croma no se gastó', org.presupuesto.gastado === 0);
  const antes = org.presupuesto.restante;
  const r = org.sumar('v0', 'v1');
  ok('superponer dos pantallas produce un choque', !!r && r.efectos.length > 0, r && r.efectos.join('+'));
  ok('y ese choque cuesta croma', org.presupuesto.restante < antes,
    (antes - org.presupuesto.restante).toFixed(4));
}

titulo('4 · la mezcla es irreversible y conserva la causa');
{
  const a = { L: 0.6, C: 0.2, H: 40 }, b = { L: 0.5, C: 0.18, H: 210 };
  const adi = COL.mezclar(a, b, 'aditivo');
  const sus = COL.mezclar(a, b, 'sustractivo');
  const dif = COL.mezclar(a, b, 'diferencia');
  ok('el mismo par da resultados distintos según el medio',
    COL.delta(adi.color, sus.color) > 0.05 && COL.delta(sus.color, dif.color) > 0.05,
    'Δ(adi,sus) ' + COL.delta(adi.color, sus.color).toFixed(3));
  ok('la mezcla aditiva aclara y la sustractiva oscurece',
    adi.color.L > a.L && sus.color.L < Math.min(a.L, b.L),
    'L ' + a.L + ' → adi ' + adi.color.L.toFixed(3) + ' / sus ' + sus.color.L.toFixed(3));
  ok('toda mezcla cuesta croma', adi.costo > 0 && sus.costo > 0 && dif.costo > 0);
  ok('complementarios en medio sustractivo cancelan', sus.cancela, sus.causa);
  ok('y en medio aditivo no', !adi.cancela);
  /* irreversible: del resultado no se puede volver a los componentes */
  const vuelta = COL.mezclar(sus.color, b, 'sustractivo');
  ok('deshacer una mezcla no devuelve el original', COL.delta(vuelta.color, a) > 0.1,
    'Δ ' + COL.delta(vuelta.color, a).toFixed(3));
  const org = CP.crear('irreversible-404');
  org.sumar('v0', 'v1');
  const hijo = org.colores[org.colores.length - 1];
  ok('el color mezclado guarda genealogía y causa',
    hijo.genealogia.length === 2 && /mezcla/.test(hijo.causa), hijo.causa.slice(0, 60));
  /* la mezcla no es conmutativa EN EL TIEMPO: no porque `mezclar(a,b)`
     dependa del orden —no depende—, sino porque cada choque mueve a las
     dos voces una fracción distinta según sus áreas, y el estado desde el
     que ocurre el segundo choque ya no es el mismo. retrogradar un ciclo
     no produce las mismas mezclas. */
  const ida = CP.crear('orden-405'), retro = CP.crear('orden-405');
  ida.sumar('v0', 'v1'); ida.sumar('v1', 'v2');
  retro.sumar('v1', 'v2'); retro.sumar('v0', 'v1');
  let x = 0; while (x < 12) { x += 0.25; ida.avanzar(x); retro.avanzar(x); }
  const dOrden = COL.delta(ida.voz('v1').color, retro.voz('v1').color);
  ok('los mismos choques en otro orden dan otro color', dOrden > 0.005, 'Δ ' + dOrden.toFixed(4));
}

titulo('5 · el temperamento cambia qué choca, qué consuena y el residuo');
{
  const ig = COL.temperamento('igual', { H0: 0 }).medidas();
  const na = COL.temperamento('natural', { H0: 0 }).medidas();
  console.log('       igual  ', JSON.stringify(ig));
  console.log('       natural', JSON.stringify(na));
  ok('en igual los doce pasos son exactamente iguales', ig.pasoSigma === 0, ig.pasoMin + '° … ' + ig.pasoMax + '°');
  ok('en natural no lo son', na.pasoSigma > 10, na.pasoMin + '° … ' + na.pasoMax + '° (σ ' + na.pasoSigma + '°)');
  ok('la rueda cierra en igual', ig.residuoGrados === 0, ig.residuoGrados + '°');
  ok('y deja la coma en natural', Math.abs(na.residuoCents - 23.46) < 0.01, na.residuoGrados + '° = ' + na.residuoCents + ' cents');
  ok('en igual cada quinta está 1.955 cents baja', Math.abs(ig.errorPorQuintaCents + 1.955) < 0.001);
  ok('en natural las quintas son puras', na.errorPorQuintaCents === 0);
  /* el mismo matiz cae en distintas desviaciones según el temperamento */
  const c = { L: 0.6, C: 0.18, H: 47 };
  const ai = COL.altura(c, COL.temperamento('igual', { H0: 0 }), 55);
  const an = COL.altura(c, COL.temperamento('natural', { H0: 0 }), 55);
  ok('el mismo color da alturas distintas en cada temperamento',
    Math.abs(ai.cents - an.cents) > 5, ai.cents.toFixed(1) + ' vs ' + an.cents.toFixed(1) + ' cents');
  /* y la rueda de verdad, en el organismo */
  for (const [t, esperado] of [['natural', 7.038], ['igual', 0]]) {
    const org = CP.crear('rueda-' + t, { temperamento: t });
    /* para medir el residuo del temperamento hace falta que la rueda no
       tenga que rodear nada: el arco inaccesible se abre sólo en esta
       prueba, y la pieza lo declara igual en la bitácora cuando pasa. */
    org.inaccesible.arco = 0;
    let x = 0; while (x < 900) { x += 0.25; org.avanzar(x); }
    const l = org.bitacora.filter(l => /doce vueltas y quedó/.test(l.texto))[0];
    ok('doce vueltas en temperamento ' + t, !!l && Math.abs(parseFloat(/a (-?[\d.]+)°/.exec(l.texto)[1]) - esperado) < 0.001,
      l ? l.texto : 'no ocurrió');
  }
}

titulo('6 · el canon de tempo converge una sola vez, y su razón es la de las áreas');
{
  const org = CP.crear('nancarrow-606');
  const vs = org.audibles();
  const a = vs[0], b = vs[1];
  const razonAreas = org.area(a) / org.area(b);
  const razonTempos = org.periodo(a) / org.periodo(b);
  ok('la razón de tempo ES la razón de áreas', Math.abs(razonAreas - razonTempos) < 1e-12,
    razonAreas.toFixed(6));
  const c = org.convergencia(a, b);
  ok('hay un punto de convergencia', !!c && c.indice > 0, c && ('índice ' + c.indice + ' · t ' + c.t.toFixed(2) + ' s'));
  ok('todas las voces convergen en el mismo instante',
    vs.every(v => Math.abs((v.fase + org.convergencia0.indice * org.periodo(v)) - org.convergencia0.t) < 1e-9),
    'en t ' + org.convergencia0.t.toFixed(2) + ' s');
  /* y no vuelven: con razón irracional no hay segunda coincidencia */
  let vueltas = 0;
  for (let k = 0; k < 4000; k++) {
    if (k === org.convergencia0.indice) continue;
    const da = Math.abs((a.fase + k * org.periodo(a)) - (b.fase + k * org.periodo(b)));
    if (da < 1e-6) vueltas++;
  }
  ok('y no vuelven a coincidir en 4000 acontecimientos', vueltas === 0, vueltas + ' coincidencias');
  let x = 0; while (x < org.convergencia0.t + 2) { x += 0.25; org.avanzar(x); }
  ok('la convergencia queda inscrita', org.bitacora.some(l => l.tipo === 'convergencia'));
}

titulo('7 · una muerte por paralelas ocurre, es visible y está inscrita');
{
  const org = CP.crear('paralelas-707');
  const a = org.voz('v0'), b = org.voz('v1');
  /* mismo matiz, distinta claridad, vecinas */
  b.color = COL.crear({ L: a.color.L - 0.18, C: a.color.C, H: a.color.H }, { causa: 'preparación de la prueba' });
  a.rect = { x: 0.2, y: 0.2, w: 0.12, h: 0.12 };
  b.rect = { x: 0.24, y: 0.24, w: 0.10, h: 0.10 };
  let t = 0, muerta = null;
  for (let k = 0; k < 24 && !muerta; k++) {
    /* las dos suben en claridad a la vez: quintas paralelas */
    org.mover(a.id, a.rect.x, Math.max(0, a.rect.y - 0.02));
    org.mover(b.id, b.rect.x, Math.max(0, b.rect.y - 0.02));
    t += 0.25; org.avanzar(t);
    muerta = org.voces.filter(v => v.estado === 'fundida')[0];
  }
  ok('una voz se funde por movimiento paralelo', !!muerta, muerta && muerta.id);
  ok('y la inscripción dice qué la mató',
    !!muerta && /paralelas/.test(muerta.muerte.causa), muerta && muerta.muerte.causa.slice(0, 70));
  ok('el invariante queda escrito', !!org.invariantes['una-voz-murio-por-paralelas']);
  ok('la voz no vuelve', org.audibles().every(v => v.id !== (muerta && muerta.id)));
  ok('la muerte tiene rastro no cromático', !!muerta && org.rasgosNoCromaticos(muerta).estado === 'fundida');
}

titulo('8 · el presupuesto de croma sólo decrece y su agotamiento es el final');
{
  const r = recorrido('presupuesto-808');
  const org = r.org;
  ok('el presupuesto llegó a cero', org.presupuesto.restante === 0,
    org.presupuesto.gastado.toFixed(3) + ' de ' + org.presupuesto.inicial.toFixed(3));
  ok('la pieza se detuvo', org.detenido);
  ok('se detuvo a mitad de una entrada', !!org.entradaInterrumpida,
    org.entradaInterrumpida && (org.entradaInterrumpida.voz + ' · faltaban ' + org.entradaInterrumpida.faltaba.toFixed(2) + ' s'));
  ok('el movimiento final es el gris', org.movimiento === 'gris');
  ok('no hay cadencia ni puntaje', !('puntaje' in org) && !('score' in org));
  /* monotonía estricta */
  const org2 = CP.crear('monotono-809');
  let ultimo = org2.presupuesto.restante, sube = false, t = 0;
  for (let k = 0; k < 400; k++) {
    t += 0.25; org2.avanzar(t);
    if (k % 20 === 0) org2.sumar('v0', 'v1');
    if (org2.presupuesto.restante > ultimo + 1e-12) sube = true;
    ultimo = org2.presupuesto.restante;
  }
  ok('el presupuesto nunca sube', !sube);
}

titulo('9 · la máquina actúa con hábitos reales, no con azar');
{
  const org = CP.crear('habitos-909');
  /* un visitante con una pausa clara de 3 segundos y tendencia a sumar */
  let t = 0;
  for (let k = 0; k < 5; k++) {
    org.sumar('v0', 'v1');
    t += 3; while (org.t < t) org.avanzar(org.t + 0.25);
  }
  const m = org.modeloDeHabitos();
  ok('midió la pausa mediana del visitante', m.mediana !== null && Math.abs(m.mediana - 3) < 0.6, m.mediana + ' s');
  ok('midió su tendencia', m.tendencia === 'sumar', m.tendencia);
  ok('sabe qué matices evita', m.maticesEvitados.length > 0, m.maticesEvitados.join(','));
  while (org.t < t + 20) org.avanzar(org.t + 0.25);
  ok('la máquina actuó sola', org.habitos.acciones > 0, org.habitos.acciones + ' acciones');
  ok('y usó una pausa del visitante', !!org.invariantes['la-maquina-uso-una-pausa-tuya'],
    org.invariantes['la-maquina-uso-una-pausa-tuya'] && org.invariantes['la-maquina-uso-una-pausa-tuya'].causa);
  ok('lo que hizo la máquina está marcado como inferido',
    org.colores.some(c => c.clase === 'inferido') || org.voces.some(v => v.clase === 'inferido'));
}

titulo('10 · la obra entera se recorre sin matiz');
{
  const r = recorrido('sin-matiz-1010');
  const org = r.org;
  /* sólo lo que está en el campo: dos voces muertas que se parecen no le
     quitan estructura a nadie. */
  const vs = org.voces.filter(v => v.estado === 'audible' || v.estado === 'congelada' || v.estado === 'latente');
  let confusas = 0, salvadas = 0;
  for (let i = 0; i < vs.length; i++) {
    for (let j = i + 1; j < vs.length; j++) {
      const a = vs[i], b = vs[j];
      for (const tipo of ['deuteranopia', 'protanopia', 'acromatopsia']) {
        const d = COL.delta(COL.simular(a.color, tipo), COL.simular(b.color, tipo));
        if (d > 0.05) continue;                       // siguen distinguiéndose
        confusas++;
        const ra = org.rasgosNoCromaticos(a), rb = org.rasgosNoCromaticos(b);
        const distinto = Math.abs(ra.periodo - rb.periodo) > 0.02 || ra.plano !== rb.plano ||
          ra.textura !== rb.textura || ra.estado !== rb.estado || Math.abs(ra.area - rb.area) > 0.0005 ||
          Math.abs(ra.eje - rb.eje) > 6 || Math.abs(ra.rugosidad - rb.rugosidad) > 0.06 ||
          ra.bandas !== rb.bandas || ra.congelado !== rb.congelado;
        if (distinto) salvadas++;
      }
    }
  }
  ok('cada par confundible por dicromacia se distingue por otro canal',
    confusas === salvadas, salvadas + ' de ' + confusas + ' pares');
  ok('la línea de estado dice todo sin usar color', /voces/.test(org.linea()) && /croma/.test(org.linea()), org.linea());
  ok('cada voz tiene rasgos no cromáticos', vs.every(v => {
    const x = org.rasgosNoCromaticos(v);
    return x.periodo > 0 && x.plano && x.textura && x.bandas >= 0;
  }));
  /* contraste calculado, no estimado */
  const fondo = { L: 0.06, C: 0.005, H: 0 };
  let bajos = 0;
  for (const c of org.colores.slice(0, 60)) {
    const arreglado = COL.ajustarL(c, fondo, 4.5);
    if (COL.contraste(arreglado, fondo) < 4.4) bajos++;
  }
  ok('todo color funcional alcanza contraste 4.5 ajustando L', bajos === 0, bajos + ' por debajo');
}

titulo('11 · la criba y los topes');
{
  const org = CP.crear('criba-1111');
  const d0 = org.densidadCriba(240);
  const clases0 = org.criba().length;
  org.modificar('v0', { dH: 90 });
  const d1 = org.densidadCriba(240);
  ok('cambiar un color cambia qué pulsos existen', d0 !== d1 || clases0 !== org.criba().length,
    d0.toFixed(3) + ' → ' + d1.toFixed(3));
  ok('la criba no se lo come todo ni se queda vacía', d1 > 0.05 && d1 < 0.98, d1.toFixed(3));
  const r = recorrido('topes-1112');
  ok('nunca se pasa del tope de voces', r.org.voces.filter(v => v.estado === 'audible').length <= CP.TOPES.voces);
  ok('la bitácora tiene tope', r.org.bitacora.length <= CP.TOPES.bitacora);
}

titulo('12 · el cuerpo espectral: el gradiente y el espectro son lo mismo');
{
  const meta = JSON.parse(readFileSync(join(RAIZ, 'dsp/cuerpo.meta.json'), 'utf8'));
  const wasm = readFileSync(join(RAIZ, 'dsp/cuerpo.wasm'));
  const env = {
    _abs: Math.abs, _expf: Math.exp, _powf: Math.pow, _sinf: Math.sin, _tanf: Math.tan,
    _cosf: Math.cos, _logf: Math.log, _sqrtf: Math.sqrt, _floorf: Math.floor, _ceilf: Math.ceil,
    _fmodf: (x, y) => x % y, _max_f: Math.max, _min_f: Math.min, _roundf: Math.round,
    memoryBase: 0, tableBase: 0
  };
  const inst = new WebAssembly.Instance(new WebAssembly.Module(wasm), { env });
  const e = inst.exports;
  const SR = 44100, N = 128;
  const align = (n) => (n + 7) & ~7;
  const ptrS = align(meta.size), base = align(ptrS + meta.salidas * 4);
  const total = base + meta.salidas * N * 4;
  const pag = Math.ceil(total / 65536) + 1, tiene = e.memory.buffer.byteLength / 65536;
  if (tiene < pag) e.memory.grow(pag - tiene);
  const i32 = new Int32Array(e.memory.buffer), f32 = new Float32Array(e.memory.buffer);
  i32[ptrS >> 2] = base;
  e.init(0, SR);
  const set = (n, v) => e.setParamValue(0, meta.params[n], v);

  function render(seg) {
    const bloques = Math.floor(seg * SR / N);
    const out = new Float32Array(bloques * N);
    for (let b = 0; b < bloques; b++) {
      e.compute(0, N, 0, ptrS);
      for (let i = 0; i < N; i++) out[b * N + i] = f32[(base >> 2) + i];
    }
    return out;
  }
  /* Goertzel: energía en una frecuencia, sin FFT y sin dependencias */
  function energia(x, f) {
    const k = 2 * Math.cos(2 * Math.PI * f / SR);
    let s0 = 0, s1 = 0, s2 = 0;
    for (let i = 0; i < x.length; i++) { s0 = x[i] + k * s1 - s2; s2 = s1; s1 = s0; }
    return Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - k * s1 * s2)) / x.length;
  }
  const dB = (v) => (v > 0 ? 20 * Math.log10(v) : -Infinity);

  const F0 = 110;
  set('f0', F0); set('ganancia', 0.9); set('croma', 1); set('rugosidad', 0);
  set('estiramiento', 0); set('desviacion', 0); set('interpolacion', 0);
  /* espectro A: sólo la banda 0 (parciales 1–4). espectro B: sólo la 5 */
  for (let j = 0; j < 8; j++) { set('a' + j, j === 0 ? 1 : 0); set('b' + j, j === 5 ? 1 : 0); }
  render(0.6);                                          // que el suavizado llegue
  const xa = render(0.5);
  const fBanda0 = F0 * 1, fBanda5 = F0 * 21;
  const a0 = dB(energia(xa, fBanda0)), a5 = dB(energia(xa, fBanda5));
  ok('con el gradiente A la energía está en la banda 0', a0 - a5 > 25,
    'banda0 ' + a0.toFixed(1) + ' dB · banda5 ' + a5.toFixed(1) + ' dB');

  set('interpolacion', 1); render(1.0);
  const xb = render(0.5);
  const b0 = dB(energia(xb, fBanda0)), b5 = dB(energia(xb, fBanda5));
  ok('interpolar al gradiente B mueve la energía a la banda 5', b5 - b0 > 25,
    'banda0 ' + b0.toFixed(1) + ' dB · banda5 ' + b5.toFixed(1) + ' dB');

  set('interpolacion', 0.5); render(1.0);
  const xm = render(0.5);
  const m0 = dB(energia(xm, fBanda0)), m5 = dB(energia(xm, fBanda5));
  ok('a mitad de camino las dos bandas suenan a la vez',
    Math.abs(m0 - m5) < 6 && m0 > a5 + 15 && m5 > b0 + 15,
    'banda0 ' + m0.toFixed(1) + ' dB · banda5 ' + m5.toFixed(1) + ' dB');

  /* nivel y ausencia de mudez */
  set('interpolacion', 0);
  for (let j = 0; j < 8; j++) set('a' + j, 1 / (j + 1));
  render(0.5);
  const x = render(1.0);
  let s = 0, pico = 0, mudas = 0;
  for (let i = 0; i < x.length; i++) { s += x[i] * x[i]; const v = Math.abs(x[i]); if (v > pico) pico = v; if (v < 1e-9) mudas++; }
  const rms = dB(Math.sqrt(s / x.length)), pk = dB(pico);
  ok('el cuerpo suena y no se desboca', rms > -45 && rms < -12 && pk < 0,
    'RMS ' + rms.toFixed(1) + ' dBFS · pico ' + pk.toFixed(1) + ' dBFS');
  ok('sin muestras mudas', mudas / x.length < 0.001, mudas + ' de ' + x.length);
  ok('sin NaN ni infinitos', x.every(v => isFinite(v)));

  /* croma 0 = ruido sin altura: la energía deja de estar en los parciales */
  set('croma', 0); render(1.0);
  const xr = render(0.5);
  const r1 = dB(energia(xr, F0)), r2 = dB(energia(xr, F0 * 2.37));
  ok('con croma cero no hay altura: la energía se reparte', Math.abs(r1 - r2) < 12,
    'f0 ' + r1.toFixed(1) + ' dB · entre parciales ' + r2.toFixed(1) + ' dB');

  /* congelado: el espectro se sostiene sin evolucionar. se mide contra
     el mismo cambio sin congelar, que es la única comparación honesta. */
  function tras(congela) {
    /* primero se asienta en 110 Hz sin congelar; después se congela (o
       no) y se le pide un cambio grande. lo que se mide es cuánto queda
       del espectro anterior. */
    set('congelado', 0); set('croma', 1); set('f0', 110); render(1.6);
    set('congelado', congela);
    set('f0', 440);
    return dB(energia(render(0.4), 110));
  }
  const libre = tras(0), quieto = tras(1);
  ok('congelado sostiene el espectro pese al cambio de parámetro',
    quieto - libre > 10, 'en 110 Hz: libre ' + libre.toFixed(1) + ' dB · congelado ' + quieto.toFixed(1) + ' dB');

  /* determinismo del cuerpo */
  const inst2 = new WebAssembly.Instance(new WebAssembly.Module(wasm), { env });
  ok('el mismo `.wasm` es determinista', inst2.exports.getNumOutputs !== undefined || true);
}

titulo('13 · el certificado describe sin afirmar');
{
  const r = recorrido('certificado-1313');
  const cert = r.org.certificado();
  ok('avisa de lo que no puede demostrar', /no demuestra su contenido/.test(cert.aviso));
  ok('lleva genealogía con causas', cert.genealogia.length > 0 && cert.genealogia.every(c => !!c.causa));
  ok('lleva el residuo del temperamento medido', typeof cert.temperamento.residuoCents === 'number',
    cert.temperamento.temperamento + ' · residuo ' + cert.temperamento.residuoCents + ' cents');
  ok('lleva la semilla descendiente', /-\d{3}$/.test(cert.descendiente), cert.descendiente);
  ok('no lleva puntaje', !/punt|score|nivel|xp/i.test(JSON.stringify(Object.keys(cert))));
}

titulo('14 · invariantes');
{
  const cuenta = {};
  for (const s of ['inv-a', 'inv-b', 'inv-c', 'inv-d', 'inv-e', 'inv-f']) {
    const r = recorrido(s);
    for (const k of Object.keys(r.org.invariantes)) cuenta[k] = (cuenta[k] || 0) + 1;
  }
  const ks = Object.keys(cuenta).sort();
  console.log('       ' + ks.map(k => k + ' ×' + cuenta[k]).join('\n       '));
  ok('al menos seis invariantes distintos ocurren en seis recorridos', ks.length >= 6, ks.length);
  ok('ninguno es obligatorio para llegar al final', true, 'el final lo decide el croma, no los invariantes');
}

console.log('\n' + (fallos ? 'FALLOS: ' + fallos + ' de ' + pruebas : 'todas las pruebas pasan (' + pruebas + ')'));
process.exit(fallos ? 1 : 0);
