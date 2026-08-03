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

/* ---- 11. el expediente espectral: modelo determinista, sin juzgar el audio */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  p.on('console', m => { if (m.type() === 'error') sucio.push(m.text()); });
  await recorrer(p, 'espectro-uno', 10);

  /* el mismo expediente produce el mismo espectro */
  const det = await p.evaluate(() => {
    const N = window.NPVS;
    const a = JSON.stringify(N.espectro.medidas());
    const b = JSON.stringify(N.espectro.medidas());
    return { igual: a === b, med: JSON.parse(a) };
  });
  ok('el mismo expediente produce el mismo espectro', det.igual, JSON.stringify(det.med));
  ok('la fundamental está en el registro grave elegido por la semilla',
    det.med.f0 >= 55 && det.med.f0 <= 100, det.med.f0 + ' Hz');

  /* perder un bit modifica la estructura, no el volumen */
  const herida = await p.evaluate(() => {
    const N = window.NPVS;
    const antes = N.espectro.estado().parciales.map(x => x.modo).join(',');
    N.texto.perderBit('prueba: herida deliberada');
    const despues = N.espectro.estado().parciales.map(x => x.modo).join(',');
    return { antes, despues, cambio: antes !== despues };
  });
  ok('perder un bit cambia el modo de un parcial, no su volumen', herida.cambio);

  /* la cadena vertical: inscribir → sostener/interrumpir → regresar */
  const cadena = await p.evaluate(() => {
    const N = window.NPVS;
    const h = N.espectro.inscribir('sostener', 'separacion', { causa: 'prueba' });
    const sost = N.espectro.sostener(h);
    const h2 = N.espectro.inscribir('sostener', 'matriz', { causa: 'prueba 2' });
    const cortada = N.espectro.interrumpir(h2, 'prueba: cortada');
    const r = N.espectro.regresar('reticula');
    return {
      sost, cortada,
      regreso: !!r,
      pagina: r && r.huella.pagina,
      texto: r && r.texto,
      causa: r && r.huella.causa,
      hito: N.mem.tieneHito('una-accion-viajo-a-otra-pagina'),
      sostenido: N.mem.tieneHito('un-parcial-fue-sostenido')
    };
  });
  ok('permanecer sostiene un parcial y deja invariante', cadena.sost && cadena.sostenido);
  ok('interrumpir corta el proceso antes del umbral', cadena.cortada);
  ok('una acción vuelve en otra página', cadena.regreso && cadena.pagina !== 'reticula', cadena.pagina + ' → reticula');
  ok('el regreso deja causa escrita', !!cadena.causa, cadena.causa);
  ok('el viaje deja invariante', cadena.hito);

  /* regresos sucesivos degradan hasta que la memoria no puede asegurarlo */
  const degrada = await p.evaluate(() => {
    const N = window.NPVS;
    const clases = [];
    /* los regresos están espaciados a propósito: hay que recorrer entre
       uno y otro, así que la prueba recorre. */
    for (let i = 0; i < 40 && clases.indexOf('inventado') < 0; i++) {
      N.mem.visita('vecino', 'prueba'); N.mem.visita('reticula', 'prueba'); N.mem.visita('distancia', 'prueba');
      const r = N.espectro.regresar('vecino');
      if (r) clases.push(r.huella.clase);
    }
    return { clases, malRecuerdo: N.mem.tieneHito('el-espectro-recordo-mal') };
  });
  ok('los regresos sucesivos degradan la huella hasta inventarla',
    degrada.clases.indexOf('inventado') >= 0 || degrada.malRecuerdo, JSON.stringify(degrada.clases));

  /* LA COPIA completa lo interrumpido con la duración aprendida */
  const copia = await p.evaluate(() => {
    const N = window.NPVS;
    N.espectro.inscribir('sostener', 'ruido', { causa: 'prueba copia' });
    const h = N.espectro.guardado().huellas.slice(-1)[0];
    N.espectro.interrumpir(h, 'prueba: para que la copia la termine');
    const antes = N.copia.modelo().mediana;
    const hecha = N.espectro.completarConLaCopia();
    return { hecha: !!hecha, dur: hecha && hecha.dur, mediana: antes, hito: N.mem.tieneHito('la-copia-termino-un-gesto') };
  });
  ok('la copia termina una morfología con la duración del visitante',
    copia.hecha && copia.dur === copia.mediana && copia.hito, 'duración ' + copia.dur + ' s');

  /* navegar no estrena una música: el estado se hereda entre páginas */
  const antesNav = await p.evaluate(() => JSON.stringify(window.NPVS.espectro.medidas()));
  await p.goto(BASE + 'paginas/hueco.html?seed=espectro-uno');
  await listo(p); await p.waitForTimeout(400);
  const trasNav = await p.evaluate(() => {
    const m = window.NPVS.espectro.medidas();
    return { json: JSON.stringify(m), f0: m.f0, sost: m.sostenidos };
  });
  const a = JSON.parse(antesNav);
  ok('navegar hereda el espectro en vez de reiniciarlo',
    trasNav.f0 === a.f0 && trasNav.sost >= a.sostenidos,
    'f0 ' + a.f0 + '→' + trasNav.f0 + ', sostenidos ' + a.sostenidos + '→' + trasNav.sost);

  /* el modelo corre en silencio: nada de esto necesitó la bocina */
  const silencio = await p.evaluate(() => ({
    encendido: window.NPVS.sonido.encendido,
    huellas: window.NPVS.espectro.guardado().huellas.length,
    linea: window.NPVS.espectro.linea()
  }));
  ok('el expediente espectral se calcula con la bocina apagada',
    !silencio.encendido && silencio.huellas > 0, silencio.linea);

  ok('el espectro no ensucia la consola', sucio.length === 0, sucio.slice(0, 2).join(' | '));
  await ctx.close();
}

/* ---- 12. la bocina: se enciende con gesto, suena el organismo, se apaga limpio */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  await p.goto(BASE + 'index.html?seed=bocina-uno');
  await listo(p); await p.waitForTimeout(900);
  ok('no hay autoplay', !(await p.evaluate(() => window.NPVS.sonido.encendido)));
  await p.click('.boton-sonido');
  await p.waitForTimeout(1200);
  const on = await p.evaluate(() => ({ enc: window.NPVS.sonido.encendido, voces: window.NPVS.sonido.voces }));
  ok('tras el gesto explícito hay un organismo sonando', on.enc && on.voces > 0, on.voces + ' voces');
  ok('las voces están acotadas', on.voces <= 19, String(on.voces));
  await p.click('.boton-sonido');
  await p.waitForTimeout(600);
  const off = await p.evaluate(() => ({ enc: window.NPVS.sonido.encendido, voces: window.NPVS.sonido.voces }));
  ok('apagar desconecta todos los nodos', !off.enc && off.voces === 0);
  ok('la bocina no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 13. la genealogía musical llega al acta */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await recorrer(p, 'acta-espectral', 8);
  await p.evaluate(() => {
    const N = window.NPVS;
    const h = N.espectro.inscribir('sostener', 'residuo', { causa: 'para el acta' });
    N.espectro.sostener(h);
  });
  await p.goto(BASE + 'certificado.html?seed=acta-espectral');
  await listo(p); await p.waitForTimeout(800);
  const acta = await p.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('.cert h2')).map(x => x.textContent);
    const i = h2.indexOf('genealogía musical');
    const ul = document.querySelectorAll('.cert ul')[i];
    return { tiene: i >= 0, lineas: ul ? Array.from(ul.children).map(x => x.textContent) : [] };
  });
  ok('el acta incluye la genealogía musical', acta.tiene);
  ok('el acta no afirma demostrar el contenido del sonido',
    acta.lineas.some(l => /no afirma qué decía el mensaje/.test(l)), acta.lineas.slice(-1)[0]);
  await ctx.close();
}

/* ---- 14. la cadena por la vía real: permanecer inscribe y sostiene.
   tarda medio minuto porque la espera es la operación que se prueba. */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'paginas/hueco.html?seed=cadena-real');
  await listo(p);
  await p.waitForTimeout(31000);   // espera 18 s de la página + 9 s del umbral
  const r = await p.evaluate(() => {
    const N = window.NPVS;
    const e = N.espectro.guardado();
    const h = e.huellas[0];
    const rastro = document.querySelector('.rastro-espectro');
    return {
      inscrita: !!h, estado: h && h.estado, causa: h && h.causa,
      sostenidos: e.sostenidos.length,
      hito: N.mem.tieneHito('un-parcial-fue-sostenido'),
      rastroVisible: !!(rastro && rastro.querySelector('.linea').textContent),
      dibujo: !!(rastro && rastro.querySelector('svg'))
    };
  });
  ok('permanecer sin intervenir inscribe una huella', r.inscrita, r.causa);
  ok('y el parcial cruza el umbral solo', r.estado === 'completa' && r.sostenidos > 0 && r.hito);
  ok('con rastro legible y dibujado para quien no oye', r.rastroVisible && r.dibujo);
  await ctx.close();
}

/* ---- 15. contrapunto espectral: sujeto, voces y entradas canónicas */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  await p.goto(BASE + 'index.html?seed=contrapunto-uno');
  await listo(p); await p.waitForTimeout(700);

  const s = await p.evaluate(() => {
    const N = window.NPVS;
    const a = JSON.stringify(N.voces.sujeto()), b = JSON.stringify(N.voces.sujeto());
    return { igual: a === b, pasos: JSON.parse(a).pasos, n: JSON.parse(a).n };
  });
  ok('el sujeto es el mismo en toda la semilla', s.igual, 'contorno ' + s.pasos.join(' '));
  ok('el sujeto tiene forma de tema, no de nota sola', s.n >= 5 && new Set(s.pasos).size >= 3);

  /* las cinco etapas del regreso son las cinco transformaciones canónicas */
  const et = await p.evaluate(() => {
    const N = window.NPVS;
    const h = { id: 'h', parcial: 5, regresos: 0, pagina: 'umbral', clase: 'verdadero', escala: 1, genealogia: [] };
    return [0, 1, 2, 3, 4].map(e => {
      const en = N.voces.entradaPara(h, e);
      const pl = N.voces.notas(en);
      return {
        e, voz: en.registro, factor: en.factor, pasos: en.pasos,
        freqs: pl.notas.map(x => Math.round(x.f)),
        distintas: new Set(pl.notas.map(x => Math.round(x.f))).size,
        dur: pl.duracion
      };
    });
  });
  const base0 = et[0], aum = et[1], inv = et[4];
  ok('la respuesta entra en una voz con su propio registro',
    new Set(et.map(x => x.voz)).size >= 2, et.map(x => x.voz).join(', '));
  ok('la etapa 1 aumenta o disminuye de verdad',
    aum.factor !== 1 && Math.abs(aum.dur - base0.dur) > 0.4, '×' + aum.factor);
  ok('la etapa 4 invierte el contorno',
    inv.pasos.every((v, i) => v === -base0.pasos[i] || base0.pasos[i] === 0), inv.pasos.join(' '));
  ok('la inversión no se aplasta contra el grave',
    inv.distintas >= 3, inv.distintas + ' alturas distintas de ' + inv.freqs.length);

  /* las heridas del mensaje le hacen agujeros al tema, y no se curan */
  const agujeros = await p.evaluate(() => {
    const N = window.NPVS;
    const serie = [];
    for (let k = 0; k < 16; k++) {
      serie.push(N.voces.integridadDelSujeto().vivas);
      N.texto.perderBit('prueba de agujeros ' + k);
    }
    serie.push(N.voces.integridadDelSujeto().vivas);
    return serie;
  });
  const monotono = agujeros.every((v, i) => i === 0 || v <= agujeros[i - 1]);
  ok('el tema pierde notas al perderse bits', agujeros[agujeros.length - 1] < agujeros[0], agujeros.join('→'));
  ok('y no las recupera nunca: el daño es monótono', monotono, agujeros.join('→'));

  ok('el contrapunto no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 16. timbre, resonancia y conducción: la música como cuerpo */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  await p.goto(BASE + 'index.html?seed=timbre-uno');
  await listo(p); await p.waitForTimeout(700);

  /* una nota es un espectro que evoluciona, no una frecuencia */
  const tim = await p.evaluate(() => {
    const N = window.NPVS;
    const h = { id: 'h', parcial: 5, regresos: 0, pagina: 'umbral', clase: 'verdadero', escala: 1, genealogia: [] };
    const n = N.voces.notas(N.voces.entradaPara(h, 0)).notas[0];
    return { partes: n.timbre.length, mult: n.timbre.map(x => x.mult), dur: n.timbre.map(x => x.dur) };
  });
  ok('cada nota trae su propio espectro', tim.partes >= 3);
  ok('sus parciales son inarmónicos, heredados del organismo',
    tim.mult.some((m, i) => i > 0 && Math.abs(m - (i + 1)) > 0.01), tim.mult.map(x => Math.round(x * 100) / 100).join(' '));
  ok('el brillo cae al decaer: los agudos duran menos',
    tim.dur.every((d, i) => i === 0 || d < tim.dur[0]), tim.dur.map(x => Math.round(x * 100) / 100).join(' '));

  /* el anillo sólo aparece cuando la huella dejó de poder asegurarse */
  const an = await p.evaluate(() => {
    const N = window.NPVS;
    return ['verdadero', 'degradado', 'inventado'].map(c => N.voces.anillo(c));
  });
  ok('la modulación en anillo crece con la incertidumbre',
    an[0] === 0 && an[1] > 0 && an[2] > an[1], an.join(' < '));

  /* conducción: movimiento contrario y familias espectrales */
  const cond = await p.evaluate(() => {
    const N = window.NPVS;
    const mk = (id, parcial) => N.voces.entradaPara(
      { id, parcial, regresos: 0, pagina: 'x', clase: 'verdadero', escala: 1, genealogia: [] }, 0);
    const a = mk('a', 3), b = mk('b', 4);
    const dirA = a.pasos[a.pasos.length - 1] - a.pasos[0];
    const antes = b.pasos[b.pasos.length - 1] - b.pasos[0];
    const c = N.voces.conducir(b, [a]);
    const despues = c.pasos[c.pasos.length - 1] - c.pasos[0];
    /* dos entradas que caen en la misma voz: la segunda tiene que mudarse,
       porque una voz canta una línea */
    const d = mk('d', 3), e2 = mk('e', 3);
    const vozAntes = e2.voz;
    const cd = N.voces.conducir(e2, [d]);
    return {
      dirA, antes, despues,
      contrario: dirA * antes > 0 ? dirA * despues <= 0 : true,
      mismaVoz: d.voz === vozAntes,
      unisono: cd.voz !== d.voz && cd.base !== d.base,
      familias: [2, 4, 8].map(x => N.voces.familia(x)),
      familias3: [3, 6, 12].map(x => N.voces.familia(x))
    };
  });
  ok('las voces se mueven en dirección contraria', cond.contrario, cond.dirA + ' vs ' + cond.antes + '→' + cond.despues);
  ok('una voz canta una línea: la segunda entrada se muda de voz', cond.unisono, cond.mismaVoz ? 'colisión resuelta' : 'no hubo colisión');
  ok('las familias espectrales agrupan las octavas',
    new Set(cond.familias).size === 1 && new Set(cond.familias3).size === 1,
    '2,4,8→' + cond.familias[0] + ' · 3,6,12→' + cond.familias3[0]);

  /* la sala resuena en las frecuencias del propio organismo */
  await p.click('.boton-sonido');
  await p.waitForTimeout(3200);
  const son = await p.evaluate(() => ({
    reson: window.NPVS.sonido.resonadores,
    vivas: window.NPVS.sonido.vivas,
    voces: window.NPVS.sonido.voces
  }));
  ok('hay un banco de resonadores afinado al espectro', son.reson >= 3 && son.reson <= 6, son.reson + ' resonadores');
  ok('las notas suenan y están acotadas', son.vivas <= 40, son.vivas + ' osciladores de nota');
  await p.waitForTimeout(4000);
  const libres = await p.evaluate(() => window.NPVS.sonido.vivas);
  ok('las notas se liberan al terminar', libres < 40, libres + ' vivas después');
  await p.click('.boton-sonido');
  await p.waitForTimeout(600);
  const off = await p.evaluate(() => ({
    r: window.NPVS.sonido.resonadores, v: window.NPVS.sonido.voces, n: window.NPVS.sonido.vivas
  }));
  ok('apagar desmonta también la resonancia', off.r === 0 && off.v === 0 && off.n === 0);
  ok('el timbre no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 17. el nivel de salida: ni se desboca ni se muere -------------
   esta prueba existe porque el banco de resonadores se disparó en
   producción: la ganancia del lazo pasaba de 1, subía +7 dB por segundo
   hasta reventar el filtro y dejaba la cadena muda para siempre. */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  let inestable = 0;
  const sucio = [];
  p.on('pageerror', e => sucio.push(e.message));
  p.on('console', m => { if (/Biquad|unstable/i.test(m.text())) inestable++; });
  await p.goto(BASE + 'index.html?seed=nivel-uno');
  await listo(p); await p.waitForTimeout(600);
  await p.click('.boton-sonido');
  /* el maestro entra con una rampa de 2.4 s: medir ahí es medir el
     arranque, no el nivel. se espera a que el organismo esté puesto. */
  await p.waitForTimeout(3600);

  const muestras = [];
  for (let s = 0; s < 14; s++) {
    await p.waitForTimeout(1000);
    const n = await p.evaluate(() => window.NPVS.sonido.nivel());
    if (n) muestras.push(n.rms);
  }
  const finitas = muestras.filter(v => isFinite(v));
  const max = Math.max.apply(null, finitas);
  const min = Math.min.apply(null, finitas);
  ok('no hay filtros inestables', inestable === 0, inestable + ' avisos');
  ok('el nivel nunca se desboca', max < -6, 'máximo ' + max + ' dBFS');
  ok('y nunca se muere', finitas.length === muestras.length && min > -70,
    'mínimo ' + min + ' dBFS · ' + (muestras.length - finitas.length) + ' muestras mudas');
  ok('se oye: el nivel está en un rango de fondo razonable',
    max > -45 && max < -10, 'entre ' + min + ' y ' + max + ' dBFS');
  ok('la respiración se mueve', max - min > 4, (Math.round((max - min) * 10) / 10) + ' dB de recorrido');
  ok('el nivel no ensucia la consola', sucio.length === 0, sucio.join(' | '));
  await ctx.close();
}

/* ---- 18. la puerta se puede encontrar ------------------------------
   el umbral no tiene botón de comenzar, y eso es deliberado. una obra
   en la que nadie encuentra la puerta, no. */
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html?seed=puerta-uno');
  await listo(p); await p.waitForTimeout(1500);
  const pronto = await p.evaluate(() => document.getElementById('vacios').classList.contains('senalados'));
  ok('la primera imagen no se estropea con etiquetas', !pronto);
  await p.waitForTimeout(8000);
  const luego = await p.evaluate(() => ({
    sen: document.getElementById('vacios').classList.contains('senalados'),
    nombres: Array.from(document.querySelectorAll('.vacio-enlace .nombre'))
      .map(n => n.textContent).filter(Boolean),
    opacidad: getComputedStyle(document.querySelector('.vacio-enlace .nombre')).opacity
  }));
  ok('a los ocho segundos los huecos dicen su nombre',
    luego.sen && luego.nombres.length === 3 && parseFloat(luego.opacidad) > 0.5,
    luego.nombres.join(' · '));
  const antes = p.url();
  await p.click('.vacio-enlace');
  await listo(p).catch(() => {});
  ok('y cruzarlos lleva a otra página', p.url() !== antes, p.url().split('/').pop());
  await ctx.close();
}

/* ---- 19. móvil y movimiento reducido */
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
