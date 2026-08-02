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
  'paginas/umbral-falso.html', 'paginas/circuito.html', 'paginas/poda.html'
];

/* un recorrido real: hace falta memoria para que haya circuito y grafo */
async function recorrer(p, seed, saltos) {
  await p.goto(BASE + 'index.html?seed=' + seed);
  await listo(p); await p.waitForTimeout(1200);
  await p.click('.vacio-enlace'); await listo(p).catch(() => {});
  for (let i = 0; i < saltos; i++) {
    await p.waitForTimeout(220);
    await p.mouse.click(430 + i * 13, 330).catch(() => {});
    let enlaces = [];
    try { enlaces = await p.$$('.salida'); } catch (e) { await listo(p).catch(() => {}); continue; }
    if (!enlaces.length) break;
    await enlaces[i % enlaces.length].click().catch(() => {});
    await listo(p).catch(() => {});
  }
}

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

/* ---- 8. régimen E: el circuito se deduce del recorrido y el atajo se cobra */
{
  const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  await recorrer(p, 'circuito-uno', 14);
  await p.goto(BASE + 'paginas/circuito.html?seed=circuito-uno');
  await listo(p); await p.waitForTimeout(700);

  const m0 = await p.evaluate(() => { const c = window.NPVS.regE.construir(); return window.NPVS.regE.medir(c, c.cable); });
  ok('el circuito tiene puertas deducidas del recorrido', m0.nodos > 6, JSON.stringify(m0));
  ok('el recorrido repetido produce duplicación real', m0.duplicacion > 0, 'duplicación ' + m0.duplicacion);

  /* fundir subexpresiones abarata el circuito y lo cobra en el expediente */
  const antesMem = await p.evaluate(() => window.NPVS.mem.d.rutas.filter(r => r.c === 'verdadero').length);
  await p.click('#compartir'); await p.waitForTimeout(500);
  const tras = await p.evaluate(() => {
    const N = window.NPVS;
    const c = N.regE.construir();
    return {
      med: N.regE.medir(c, c.cable),
      verdaderos: N.mem.d.rutas.filter(r => r.c === 'verdadero').length,
      bits: N.texto.bitsPerdidos(),
      ops: (N.mem.d.regimenes.E.estado.ops || []).length
    };
  });
  ok('la simplificación abarata el circuito', tras.med.nodos < m0.nodos, m0.nodos + ' → ' + tras.med.nodos);
  ok('y se cobra fuera del circuito', tras.verdaderos < antesMem || tras.bits > 0,
    'registros verdaderos ' + antesMem + ' → ' + tras.verdaderos + ', bits ' + tras.bits);
  ok('la simplificación queda registrada y se rejuega al recargar', tras.ops >= 1);

  /* determinismo del circuito: es función de (semilla, expediente). dos
     construcciones dentro de la misma carga tienen que coincidir. */
  const dos = await p.evaluate(() => {
    const N = window.NPVS;
    const a = N.regE.construir(), b = N.regE.construir();
    return JSON.stringify(N.regE.medir(a)) === JSON.stringify(N.regE.medir(b));
  });
  ok('el mismo expediente produce el mismo circuito', dos);

  /* al recargar NO vuelve a ser idéntico —simplificar cambió el
     expediente del que se deduce— pero el efecto tiene que sobrevivir. */
  await p.goto(BASE + 'paginas/circuito.html?seed=circuito-uno');
  await listo(p); await p.waitForTimeout(600);
  const rejugado = await p.evaluate(() => {
    const N = window.NPVS;
    const c = N.regE.construir();
    return { med: N.regE.medir(c, c.cable), ops: (N.mem.d.regimenes.E.estado.ops || []).length };
  });
  ok('el efecto de la simplificación sobrevive a la recarga',
    rejugado.ops >= 1 && rejugado.med.duplicacion < m0.duplicacion,
    'duplicación ' + m0.duplicacion + ' → ' + rejugado.med.duplicacion + ' con ' + rejugado.ops + ' op(s)');
  ok('el circuito no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 9. régimen J: podar hasta refutar la ley */
{
  const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  await recorrer(p, 'poda-uno', 16);
  await p.goto(BASE + 'paginas/poda.html?seed=poda-uno');
  await listo(p); await p.waitForTimeout(600);

  const st0 = await p.evaluate(() => window.NPVS.regJ.estado());
  ok('el grafo empieza con al menos un regreso', st0.degeneracion >= 2, 'degeneración ' + st0.degeneracion);
  ok('la ley se sostiene antes de podar', !st0.refuta);

  const fin = await p.evaluate(() => {
    const N = window.NPVS;
    let pasos = 0;
    for (let k = 0; k < 200; k++) {
      const st = N.regJ.estado();
      if (st.refuta) break;
      const vivas = N.regJ.grafo();
      const grados = {};
      for (const e of vivas) { grados[e[0]] = (grados[e[0]] || 0) + 1; grados[e[1]] = (grados[e[1]] || 0) + 1; }
      const elegida = vivas.find(a => grados[a[0]] > 1 && grados[a[1]] > 1);
      if (!elegida) break;
      N.regJ.podar(elegida[3]); pasos++;
    }
    const st = N.regJ.estado();
    return { pasos, deg: st.degeneracion, sueltos: st.desprendidos.length, refuta: st.refuta,
      hito: N.mem.tieneHito('la-demostracion-fallo'), mov: N.narrativa.estado().n };
  });
  ok('podar sin desprender lleva el grafo a bosque', fin.deg <= 1 && fin.sueltos === 0, 'degeneración ' + fin.deg);
  ok('la ley queda refutada y deja hito', fin.refuta && fin.hito, fin.pasos + ' relaciones retiradas');
  ok('el fracaso empuja al movimiento V', fin.mov === 'V', 'movimiento ' + fin.mov);

  await p.goto(BASE + 'certificado.html?seed=poda-uno');
  await listo(p); await p.waitForTimeout(800);
  const acta = await p.evaluate(() => ({
    v: document.getElementById('veredicto').textContent,
    sec: document.querySelectorAll('.cert h2').length
  }));
  ok('el acta cambia de veredicto tras el fracaso', /LA DEMOSTRACIÓN FALLÓ/.test(acta.v), acta.v);
  ok('el acta imprime circuito y poda', acta.sec >= 12, acta.sec + ' secciones');
  ok('la poda no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 10. la memoria se erosiona sin disolverse */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await recorrer(p, 'erosion-uno', 20);
  const c = await p.evaluate(() => {
    const cl = {};
    for (const r of window.NPVS.mem.d.rutas) cl[r.c] = (cl[r.c] || 0) + 1;
    return { cl, total: window.NPVS.mem.d.rutas.length };
  });
  const verd = c.cl.verdadero || 0;
  ok('tras veinte saltos la mayoría de la bitácora sigue siendo verdadera',
    verd > c.total / 2, JSON.stringify(c.cl));
  ok('hay menos invenciones que verdades', (c.cl.inventado || 0) < verd, JSON.stringify(c.cl));
  await ctx.close();
}

/* ---- 11. móvil y movimiento reducido */
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
