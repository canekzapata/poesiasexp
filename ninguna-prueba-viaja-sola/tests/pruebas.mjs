/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — pruebas de navegador
   requiere playwright y un servidor estático:

     python3 -m http.server 8765
     node tests/pruebas.mjs                      (usa el chromium del sistema)
     BASE=http://localhost:8765/ninguna-prueba-viaja-sola/ node tests/pruebas.mjs

   comprueba: consola limpia, determinismo por semilla, pérdida de bits,
   pushState/Atrás, aparición de la copia, detección de triángulos
   monocromáticos, certificado con datos reales, móvil y movimiento
   reducido. no comprueba la obra: comprueba que la obra funciona.
   ===================================================================== */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8765/ninguna-prueba-viaja-sola/';
const EXE = process.env.CHROME || undefined;

const PAGINAS = [
  'index.html', 'mapa.html', 'certificado.html',
  'paginas/recepcion.html', 'paginas/residuo.html', 'paginas/expulsion.html',
  'paginas/separacion.html', 'paginas/matriz.html', 'paginas/constelacion.html',
  'paginas/bit.html', 'paginas/reticula.html', 'paginas/vecino.html',
  'paginas/distancia.html', 'paginas/caja.html', 'paginas/interior.html',
  'paginas/bitacora.html', 'paginas/contradiccion.html', 'paginas/copia.html',
  'paginas/hueco.html', 'paginas/testigo.html', 'paginas/original.html',
  'paginas/sonda.html', 'paginas/ruido.html', 'paginas/demora.html',
  'paginas/umbral-falso.html'
];

let fallos = 0;
const ok = (n, c, extra) => { if (!c) fallos++; console.log((c ? '  ok  ' : 'FALLO ') + n + (extra ? '  → ' + extra : '')); };
/* una página está lista cuando el motor cargó Y el armazón ya escribió sus
   salidas: esperar sólo a la memoria deja una ventana en la que el documento
   todavía no tiene enlaces y la prueba lo confunde con un callejón. */
const listo = (p) => p.waitForFunction(() => {
  if (!(window.NPVS && window.NPVS.mem && window.NPVS.mem.d)) return false;
  const host = document.querySelector('[data-salidas]');
  if (host && !host.querySelector('.salida')) return false;
  return true;
}, null, { timeout: 10000 });

const navegador = await chromium.launch(EXE ? { executablePath: EXE } : {});

/* ---- 1. todos los documentos cargan, tienen salida y no ensucian la consola */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(p.url().split('/').pop() + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error') sucio.push(p.url().split('/').pop() + ': ' + m.text()); });
  let sinSalida = [];
  for (const u of PAGINAS) {
    await p.goto(BASE + u + '?seed=prueba-fija');
    await listo(p).catch(() => {});
    await p.waitForTimeout(500);
    const n = await p.evaluate(() => document.querySelectorAll('.salida, .vacio-enlace').length);
    if (n < 2) sinSalida.push(u + ' (' + n + ')');
  }
  ok('los ' + PAGINAS.length + ' documentos cargan sin errores de consola', sucio.length === 0, sucio.slice(0, 4).join(' | '));
  ok('ningún documento es un callejón sin salida', sinSalida.length === 0, sinSalida.join(', '));
  await ctx.close();
}

/* ---- 2. determinismo */
{
  const huella = async (seed) => {
    const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
    const p = await ctx.newPage();
    await p.goto(BASE + 'index.html?seed=' + seed);
    await listo(p); await p.waitForTimeout(1300);
    const h = await p.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return cs.getPropertyValue('--papel').trim() + '|' +
        Array.from(document.querySelectorAll('.vacio-enlace'))
          .map(a => a.getAttribute('data-destino') + ':' + Math.round(parseFloat(a.style.left)) + ',' + Math.round(parseFloat(a.style.top))).join('/');
    });
    await ctx.close(); return h;
  };
  const a = await huella('det-alfa'), a2 = await huella('det-alfa'), b = await huella('det-beta');
  ok('misma semilla → mismo mundo inicial', a === a2);
  ok('otra semilla → diferencia estructural, no sólo cromática', a.split('|')[1] !== b.split('|')[1]);
}

/* ---- 3. cruzar un vacío apaga un bit del mensaje */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html?seed=bit-uno');
  await listo(p); await p.waitForTimeout(1400);
  const antes = await p.evaluate(() => window.NPVS.texto.mensajeDegradado());
  await p.click('.vacio-enlace');
  await listo(p);
  const d = await p.evaluate(() => ({ m: window.NPVS.texto.mensajeDegradado(), b: window.NPVS.texto.bitsPerdidos() }));
  ok('cruzar el primer vacío pierde un bit', antes !== d.m && d.b >= 1, d.m);
  await ctx.close();
}

/* ---- 4. pushState / botón Atrás sobre estado interno */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'paginas/bit.html?seed=atras-uno');
  await listo(p);
  const v0 = await p.textContent('#bit');
  await p.click('#bit'); await p.waitForTimeout(300);
  const v1 = await p.textContent('#bit');
  await p.goBack(); await p.waitForTimeout(600);
  const v2 = await p.textContent('#bit');
  ok('pushState y Atrás deshacen el estado interno', v0 !== v1 && v2 === v0);
  await ctx.close();
}

/* ---- 5. la copia no actúa antes de tiempo y despierta después */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'paginas/copia.html?seed=copia-uno');
  await listo(p);
  ok('la copia no existe sin datos', !(await p.evaluate(() => window.NPVS.copia.suficiente())));
  for (const u of ['paginas/separacion.html', 'paginas/matriz.html', 'paginas/separacion.html',
                   'paginas/reticula.html', 'paginas/vecino.html', 'paginas/reticula.html']) {
    await p.goto(BASE + u + '?seed=copia-uno'); await listo(p);
    for (let i = 0; i < 4; i++) { await p.mouse.click(300 + i * 90, 250 + i * 40); await p.waitForTimeout(110); }
  }
  await p.goto(BASE + 'paginas/copia.html?seed=copia-uno'); await listo(p);
  ok('después del recorrido, la copia existe', await p.evaluate(() => window.NPVS.copia.suficiente() && window.NPVS.copia.activa));
  await p.click('#pedir'); await p.waitForTimeout(400);
  ok('la copia realiza un acto propio', (await p.evaluate(() => window.NPVS.mem.d.copia.actos.length)) > 0);
  await ctx.close();
}

/* ---- 6. triángulo monocromático: tres documentos de la misma clase */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  for (const [de, a] of [['reticula', 'vecino'], ['vecino', 'distancia'], ['distancia', 'reticula']]) {
    await p.goto(BASE + 'paginas/' + de + '.html?seed=tri-uno'); await listo(p);
    await p.waitForTimeout(350);
    const enlace = await p.$('a[data-destino="' + a + '"]');
    if (enlace) await enlace.click();
    else await p.evaluate(([d, x]) => window.NPVS.rutas.registrarArista(d, x, window.NPVS.rutas.claseDe(d, x)), [de, a]);
    await p.waitForTimeout(400);
  }
  await p.goto(BASE + 'paginas/reticula.html?seed=tri-uno'); await listo(p);
  const t = await p.evaluate(() => ({ n: window.NPVS.mem.d.triangulos.length, h: window.NPVS.mem.tieneHito('triangulo-monocromatico') }));
  ok('se detecta el triángulo monocromático', t.n >= 1 && t.h);
  await ctx.close();
}

/* ---- 7. el certificado se compone con datos reales */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html?seed=acta-uno'); await listo(p); await p.waitForTimeout(1300);
  await p.click('.vacio-enlace'); await listo(p); await p.waitForTimeout(600);
  await p.goto(BASE + 'certificado.html?seed=acta-uno'); await listo(p); await p.waitForTimeout(600);
  const c = await p.evaluate(() => ({
    sec: document.querySelectorAll('.cert h2').length,
    ver: document.getElementById('veredicto').textContent.trim(),
    hija: document.getElementById('hija').textContent.trim()
  }));
  ok('el acta tiene todas sus secciones', c.sec >= 10, String(c.sec));
  ok('el acta declara el veredicto', /NINGUNA PARTE DEL MENSAJE VIAJÓ SOLA/.test(c.ver));
  ok('el acta genera una semilla descendiente', c.hija.length > 4, c.hija);
  await ctx.close();
}

/* ---- 8. móvil y movimiento reducido */
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  for (const u of ['index.html', 'paginas/reticula.html', 'paginas/separacion.html', 'paginas/caja.html']) {
    await p.goto(BASE + u + '?seed=movil-uno'); await listo(p); await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({
      red: window.NPVS.reducido,
      ancho: document.documentElement.scrollWidth <= window.innerWidth + 2
    }));
    ok('móvil sin scroll horizontal: ' + u, r.ancho);
    if (u === 'index.html') ok('prefers-reduced-motion detectado', r.red);
  }
  ok('móvil sin errores', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

await navegador.close();
console.log('\n' + (fallos ? fallos + ' PRUEBAS FALLARON' : 'todas las pruebas pasaron'));
process.exit(fallos ? 1 : 0);
