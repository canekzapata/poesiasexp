/* =====================================================================
   EL CLAVE BIEN TEÑIDO — pruebas de navegador
   requiere playwright y un servidor estático:

     python3 -m http.server 8765
     node tests/audio.mjs
     BASE=http://localhost:8765/el-clave-bien-tenido/ node tests/audio.mjs

   comprueba: consola limpia, arranque tras gesto, un solo AudioContext,
   nivel medido en dBFS, topes de nodos, apagado sin fantasmas, los cuatro
   peldaños de degradación, `Tone.Offline` reproducible, los siete verbos
   por teclado y la cadena vertical entera. no comprueba la obra:
   comprueba que la obra funciona.
   ===================================================================== */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8765/el-clave-bien-tenido/';
const EXE = process.env.CHROME || undefined;

let fallos = 0, pruebas = 0;
const ok = (n, c, extra) => {
  pruebas++;
  if (!c) fallos++;
  console.log((c ? '  ok  ' : 'FALLO ') + n + (extra !== undefined ? '  → ' + extra : ''));
};
const titulo = (t) => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length)));

const navegador = await chromium.launch({
  ...(EXE ? { executablePath: EXE } : {}),
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream']
});

async function pagina(opciones) {
  const ctx = await navegador.newContext(opciones || {});
  const p = await ctx.newPage();
  p._consola = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') p._consola.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => p._consola.push('pageerror: ' + e.message));
  return { ctx, p };
}

const listo = (p) => p.waitForFunction(() => !!(window.CLAVE && window.CLAVE.organismo && document.querySelector('.pantalla')), null, { timeout: 10000 });

/* =================================================================== */
titulo('1 · abre limpia y se recorre sin audio (peldaño 3)');
{
  const { ctx, p } = await pagina();
  await p.goto(BASE + 'index.html?seed=prueba-navegador-1');
  await listo(p);
  await p.waitForTimeout(900);

  const pantallas = await p.$$('.pantalla');
  ok('el campo tiene pantallas', pantallas.length >= 3, pantallas.length);
  ok('sin audio, el modelo avanza igual',
    await p.evaluate(() => CLAVE.organismo.t) > 0.4,
    await p.evaluate(() => CLAVE.organismo.t));
  ok('la bitácora escribe', (await p.textContent('#bitacora')).length > 20);
  ok('el estado se lee sin color', /voces/.test(await p.textContent('#estado')), (await p.textContent('#estado')).slice(0, 70));

  /* los siete verbos, con teclado */
  await p.focus('.pantalla');
  const antes = await p.evaluate(() => JSON.stringify(CLAVE.organismo.medidas().voces));
  for (const k of [' ', ' ', 'd', 'ArrowRight', '+', 'i', 'h']) { await p.keyboard.press(k); await p.waitForTimeout(120); }
  const despues = await p.evaluate(() => JSON.stringify(CLAVE.organismo.medidas().voces));
  ok('los verbos operan con teclado', antes !== despues, despues);
  await p.keyboard.press('s'); await p.waitForTimeout(400);
  ok('sumar produce un choque', await p.evaluate(() => Object.keys(CLAVE.organismo.choques).length) > 0);
  ok('el choque queda inscrito con causa',
    await p.evaluate(() => CLAVE.organismo.bitacora.some(l => l.tipo === 'choque' && !!l.causa)));
  await p.focus('.pantalla');
  await p.keyboard.press('x'); await p.waitForTimeout(300);
  ok('borrar deja residuo visible', (await p.$$('.residuo')).length > 0);

  ok('cero errores y avisos de consola', p._consola.length === 0, p._consola.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('2 · el sonido arranca sólo tras el gesto, y con un solo contexto');
{
  const { ctx, p } = await pagina();
  await p.goto(BASE + 'index.html?seed=prueba-navegador-2');
  await listo(p);
  await p.waitForTimeout(600);
  ok('no hay autoplay', await p.evaluate(() => !CLAVE.tiempo.encendido && !CLAVE.red.encendido));

  await p.click('#sonido');
  await p.waitForFunction(() => CLAVE.tiempo.encendido, null, { timeout: 10000 });
  await p.waitForTimeout(3500);

  const peldano = await p.evaluate(() => CLAVE.tiempo.peldano);
  ok('el peldaño es el completo, con Faust en el worklet', peldano === 'completo', peldano);
  ok('un solo AudioContext: el de Tone',
    await p.evaluate(() => CLAVE.red.ctx === Tone.getContext().rawContext));

  const nivel = await p.evaluate(() => CLAVE.red.nivel());
  ok('la sonda mide señal, no silencio', nivel && nivel.rms > -60 && nivel.rms < -8,
    'RMS ' + (nivel && nivel.rms) + ' dBFS');
  ok('y no se desboca', nivel && nivel.pico < 0, 'pico ' + (nivel && nivel.pico) + ' dBFS');

  const cuentas = await p.evaluate(() => CLAVE.red.cuentas());
  ok('el tope de nodos Faust se respeta', cuentas.faust <= cuentas.topes.faust, cuentas.faust + '/' + cuentas.topes.faust);
  ok('hay un cuerpo por voz audible',
    await p.evaluate(() => CLAVE.tiempo.voces === CLAVE.organismo.audibles().length),
    await p.evaluate(() => CLAVE.tiempo.voces + ' cuerpos / ' + CLAVE.organismo.audibles().length + ' voces'));
  ok('la criba deja pasar unos pulsos y no otros',
    await p.evaluate(() => { const x = CLAVE.tiempo.pulsos; return x.existentes > 0 && x.existentes < x.contados; }),
    JSON.stringify(await p.evaluate(() => CLAVE.tiempo.pulsos)));

  /* el nivel se mantiene: ningún lazo se dispara */
  const medidas = [];
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(700); medidas.push((await p.evaluate(() => CLAVE.red.nivel())).rms); }
  ok('el nivel es estable durante cuatro segundos',
    Math.max(...medidas) - Math.min(...medidas) < 26 && Math.max(...medidas) < -6,
    medidas.map(x => x.toFixed(1)).join(' '));

  /* apagar de verdad */
  await p.click('#sonido');
  await p.waitForTimeout(1400);
  const tras = await p.evaluate(() => ({
    encendido: CLAVE.tiempo.encendido, red: CLAVE.red.encendido,
    voces: CLAVE.tiempo.voces, lazos: CLAVE.tiempo.lazos,
    transporte: Tone.Transport.state, cuentas: CLAVE.red.cuentas()
  }));
  ok('apagar detiene el transporte', tras.transporte !== 'started', tras.transporte);
  ok('no queda ni un cuerpo ni un lazo vivo', tras.voces === 0 && tras.lazos === 0);
  ok('no queda ni un nodo contado', tras.cuentas.nodos === 0 && tras.cuentas.faust === 0 && tras.cuentas.osciladores === 0,
    JSON.stringify(tras.cuentas));
  ok('el modelo sigue corriendo con la bocina apagada',
    await p.evaluate(async () => { const a = CLAVE.organismo.t; await new Promise(r => setTimeout(r, 600)); return CLAVE.organismo.t > a; }));

  /* volver a encender reconstruye, no reanuda un fantasma */
  await p.click('#sonido');
  await p.waitForFunction(() => CLAVE.tiempo.encendido, null, { timeout: 10000 });
  await p.waitForTimeout(4200);
  const rearranque = await p.evaluate(() => ({ voces: CLAVE.tiempo.voces, nivel: CLAVE.red.nivel() }));
  ok('volver a encender reconstruye', rearranque.voces > 0 && rearranque.nivel.rms > -70,
    rearranque.voces + ' cuerpos · RMS ' + rearranque.nivel.rms + ' dBFS');
  ok('cero errores y avisos de consola', p._consola.length === 0, p._consola.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('3 · peldaño 2: sin Faust, misma estructura');
{
  const { ctx, p } = await pagina();
  /* el `.wasm` no llega: exactamente lo que pasa al abrir por file:// */
  await p.route('**/cuerpo.wasm', r => r.abort());
  await p.goto(BASE + 'index.html?seed=prueba-navegador-2');
  await listo(p);
  await p.click('#sonido');
  await p.waitForFunction(() => CLAVE.tiempo.encendido, null, { timeout: 10000 });
  await p.waitForTimeout(3000);
  ok('cae al peldaño sin Faust', await p.evaluate(() => CLAVE.tiempo.peldano) === 'sin-faust');
  const nivel = await p.evaluate(() => CLAVE.red.nivel());
  ok('y sigue sonando', nivel.rms > -60 && nivel.pico < 0, 'RMS ' + nivel.rms + ' dBFS');
  ok('con las mismas causas y los mismos invariantes disponibles',
    await p.evaluate(() => CLAVE.organismo.bitacora.length > 1 && typeof CLAVE.organismo.invariante === 'function'));
  ok('lo declara en la bitácora sin enseñar un error técnico',
    await p.evaluate(() => CLAVE.organismo.bitacora.some(l => l.tipo === 'audio' && /menos cuerpo/.test(l.texto))));
  /* el navegador anota por su cuenta el recurso que no llegó —aquí lo
     abortamos a propósito, y por file:// pasaría igual—. lo que se
     comprueba es que la pieza no añade ni un error propio. */
  const propios = p._consola.filter(m => !/Failed to load resource/.test(m));
  ok('sin errores propios de la pieza', propios.length === 0, propios.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('4 · Tone.Offline: el mismo búfer para la misma semilla');
{
  const { ctx, p } = await pagina();
  await p.goto(BASE + 'index.html?seed=offline-1');
  await listo(p);
  const r = await p.evaluate(async () => {
    async function medir(semilla) {
      const buf = await CLAVE.tiempo.renderOffline(semilla, 6);
      const x = buf.getChannelData(0);
      let s = 0, pico = 0, mudas = 0, firma = 0;
      for (let i = 0; i < x.length; i++) {
        s += x[i] * x[i];
        const a = Math.abs(x[i]);
        if (a > pico) pico = a;
        if (a < 1e-7) mudas++;
        if (i % 977 === 0) firma = (firma * 31 + Math.round(x[i] * 1e6)) | 0;
      }
      const db = v => (v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -Infinity);
      return { rms: db(Math.sqrt(s / x.length)), pico: db(pico), mudas: mudas / x.length, firma, n: x.length };
    }
    const a = await medir('offline-1');
    const b = await medir('offline-1');
    const c = await medir('offline-2');
    return { a, b, c };
  });
  ok('el render es reproducible', r.a.firma === r.b.firma && r.a.rms === r.b.rms,
    r.a.firma + ' = ' + r.b.firma);
  ok('otra semilla rinde otro búfer', r.a.firma !== r.c.firma, r.c.firma);
  ok('el nivel está en rango', r.a.rms > -50 && r.a.rms < -8 && r.a.pico < 0,
    'RMS ' + r.a.rms + ' dBFS · pico ' + r.a.pico + ' dBFS');
  ok('sin muestras mudas', r.a.mudas < 0.02, (r.a.mudas * 100).toFixed(2) + '%');
  ok('sin errores de consola', p._consola.length === 0, p._consola.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('5 · la cadena vertical, con audio encendido');
{
  const { ctx, p } = await pagina();
  await p.goto(BASE + 'index.html?seed=vertical-5');
  await listo(p);
  await p.click('#sonido');
  await p.waitForFunction(() => CLAVE.tiempo.encendido, null, { timeout: 10000 });
  await p.waitForTimeout(1500);

  const r = await p.evaluate(async () => {
    const org = CLAVE.organismo;
    const espera = (ms) => new Promise(r => setTimeout(r, ms));
    /* 1 · tres pantallas derivadas de la semilla, operables */
    const inicio = org.audibles().length;
    /* 2 · un choque con mezcla irreversible y causa inscrita */
    const antesCroma = org.presupuesto.restante;
    org.sumar('v0', 'v1');
    await espera(600);
    const mezcla = org.colores.filter(c => c.origen === 'mezcla').length;
    /* 3 · una entrada canónica por duplicación que vuelve deformada */
    const copia = org.duplicar('v0', 2.0);
    org.modificar('v0', { dH: 60 });
    await espera(3000);
    const entro = org.bitacora.some(l => l.tipo === 'canon' && /ya había cambiado/.test(l.texto));
    /* 4 · una muerte por paralelas */
    const a = org.voz('v0'), b = org.voz('v2');
    if (a && b) {
      b.color = CLAVE.color.crear({ L: a.color.L - 0.2, C: a.color.C, H: a.color.H }, { causa: 'prueba vertical' });
      a.rect = { x: 0.3, y: 0.5, w: 0.12, h: 0.12 };
      b.rect = { x: 0.33, y: 0.53, w: 0.10, h: 0.10 };
      for (let k = 0; k < 20; k++) {
        org.mover(a.id, a.rect.x, Math.max(0, a.rect.y - 0.02));
        org.mover(b.id, b.rect.x, Math.max(0, b.rect.y - 0.02));
        await espera(120);
      }
    }
    const muerta = org.voces.filter(v => v.estado === 'fundida')[0];
    await espera(1200);
    return {
      inicio, mezcla, entro, copia: !!copia,
      croma: antesCroma - org.presupuesto.restante,
      muerta: muerta ? muerta.id : null,
      causa: muerta ? muerta.muerte.causa : null,
      cuerpos: CLAVE.tiempo.voces,
      audibles: org.audibles().length,
      nivel: CLAVE.red.nivel(),
      cert: org.certificado()
    };
  });
  ok('el campo arranca con tres a seis pantallas', r.inicio >= 3 && r.inicio <= 6, r.inicio);
  ok('un choque produjo una mezcla irreversible', r.mezcla > 0, r.mezcla + ' colores de mezcla');
  ok('y gastó croma', r.croma > 0, r.croma.toFixed(4));
  ok('la copia canónica entró cuando el original ya había cambiado', r.copia && r.entro);
  ok('una voz murió por paralelas', !!r.muerta, r.muerta + ' · ' + (r.causa || '').slice(0, 60));
  ok('y su cuerpo se retiró del grafo', r.cuerpos === r.audibles, r.cuerpos + ' cuerpos / ' + r.audibles + ' voces');
  ok('el nivel sigue en rango', r.nivel.rms > -60 && r.nivel.pico < 0, 'RMS ' + r.nivel.rms + ' dBFS');
  ok('el certificado describe sin afirmar', /no demuestra/.test(r.cert.aviso));
  ok('cero errores y avisos de consola', p._consola.length === 0, p._consola.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('6 · móvil, movimiento reducido y fotosensibilidad');
{
  const { ctx, p } = await pagina({
    viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true,
    reducedMotion: 'reduce', deviceScaleFactor: 2
  });
  await p.goto(BASE + 'index.html?seed=movil-6');
  await listo(p);
  await p.waitForTimeout(800);
  ok('el campo se arma en móvil', (await p.$$('.pantalla')).length >= 3);
  ok('con movimiento reducido la pieza no enmudece: sigue calculando',
    await p.evaluate(() => CLAVE.organismo.t) > 0.4);
  const caja = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, v: window.innerWidth }));
  ok('no hay desbordamiento horizontal', caja.w <= caja.v + 1, caja.w + ' vs ' + caja.v);

  /* fotosensibilidad: nada que alterne por encima de 3 Hz a área grande */
  const rapidas = await p.evaluate(() => {
    const malas = [];
    for (const hoja of document.styleSheets) {
      let reglas; try { reglas = hoja.cssRules; } catch (e) { continue; }
      for (const r of reglas) {
        const d = r.style && (r.style.animationDuration || r.style.transitionDuration);
        if (!d) continue;
        for (const parte of d.split(',')) {
          const s = parte.trim().endsWith('ms') ? parseFloat(parte) / 1000 : parseFloat(parte);
          if (s > 0 && s < 0.34) malas.push(r.selectorText + ' ' + parte.trim());
        }
      }
    }
    return malas;
  });
  ok('ninguna animación ni transición por encima de 3 Hz', rapidas.length === 0, rapidas.join(', ') || 'ninguna');

  /* un dedo basta: tocar una pantalla la congela */
  const antes = await p.evaluate(() => CLAVE.organismo.audibles().filter(v => v.congelado).length);
  await p.tap('.pantalla');
  await p.waitForTimeout(400);
  const despues = await p.evaluate(() => CLAVE.organismo.audibles().filter(v => v.congelado).length);
  ok('con un dedo se congela una pantalla', despues !== antes, antes + ' → ' + despues);
  ok('cero errores y avisos de consola', p._consola.length === 0, p._consola.join(' | ') || 'limpia');
  await ctx.close();
}

titulo('7 · misma semilla, mismo mundo, también en el navegador');
{
  const huella = async (semilla) => {
    const { ctx, p } = await pagina();
    await p.goto(BASE + 'index.html?seed=' + semilla);
    await listo(p);
    const h = await p.evaluate(() => {
      const org = CLAVE.organismo;
      /* un guion idéntico, sin depender del reloj del navegador */
      org.sumar('v0', 'v1');
      for (let k = 0; k < 40; k++) org.avanzar(org.t + 0.25);
      org.duplicar('v0', 1.5);
      for (let k = 0; k < 40; k++) org.avanzar(org.t + 0.25);
      return JSON.stringify(org.voces.map(v => [v.id, v.estado, Math.round(v.color.H * 1000), Math.round(v.color.C * 1e5)]))
        + '|' + org.semillaDescendiente();
    });
    await ctx.close();
    return h;
  };
  const a = await huella('reproducible-7');
  const b = await huella('reproducible-7');
  const c = await huella('reproducible-8');
  ok('la misma semilla y el mismo guion dan el mismo mundo', a === b);
  ok('otra semilla da otro mundo', a !== c);
}

await navegador.close();
console.log('\n' + (fallos ? 'FALLOS: ' + fallos + ' de ' + pruebas : 'todas las pruebas pasan (' + pruebas + ')'));
process.exit(fallos ? 1 : 0);
