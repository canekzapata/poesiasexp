/*
  app.js — bucle, entrada, estado, URL.

  Todo lo que compone la pantalla vive aquí y es independiente del DOM:
  crearMundo() y componer() se pueden correr en node, y por eso
  tests/smoke.js puede medir la regla de proporción sin abrir un navegador.
  Sólo iniciar() toca el documento.
*/
(function (root) {
  "use strict";

  var AZAR = root.MT_AZAR;
  var REJ = root.MT_REJILLA;
  var MAT = root.MT_MATERIALES;
  var LABM = root.MT_LABERINTO;
  var CAM = root.MT_CAMARA;
  var PAN = root.MT_PANELES;
  var LEXM = root.MT_LEXICO;
  var CONM = root.MT_CONDENSACION;
  var MEMM = root.MT_MEMORIA;
  var VOLM = root.MT_VOLCADO;
  var ESCM = root.MT_ESCULTURAS;
  var CELM = root.MT_CELADORES;
  var ORIGEN = REJ.ORIGEN;
  var ATTR = REJ.ATTR;

  /* ------------------------------------------------------------------ *
   * Fuentes: cada una tiene su métrica de celda, y esa diferencia es
   * material. Cambiar de fuente cambia las dimensiones del laberinto.
   * ------------------------------------------------------------------ */
  var FUENTES = [
    { clave: "vga",     familia: "mtVGA",     archivo: "Px437_IBM_VGA_9x8-2x.ttf",   base: 16, peso: 3 },
    { clave: "xga",     familia: "mtXGA",     archivo: "Px437_IBM_XGA-AI_12x20.ttf", base: 20, peso: 2 },
    { clave: "nec",     familia: "mtNEC",     archivo: "Px437_NEC_APC3_8x16-2x.ttf", base: 16, peso: 2 },
    { clave: "toshiba", familia: "mtToshiba", archivo: "Px437_ToshibaTxL2_8x16.ttf", base: 16, peso: 2 },
    { clave: "wang",    familia: "mtWang",    archivo: "Px437_Wang_Pro_Mono.ttf",    base: 16, peso: 2 },
    { clave: "hp100",   familia: "mtHP100",   archivo: "PxPlus_HP_100LX_6x8.ttf",     base: 16, peso: 2 },
    { clave: "hp150",   familia: "mtHP150",   archivo: "PxPlus_HP_150_re.ttf",        base: 16, peso: 1 },
    { clave: "rainbow", familia: "mtRainbow", archivo: "PxPlus_Rainbow100_re_80.ttf", base: 16, peso: 1 },
    { clave: "tseng",   familia: "mtTseng",   archivo: "Ac437_TsengEVA_132_6x14.ttf", base: 14, peso: 2 }
  ];

  /* ------------------------------------------------------------------ *
   * Semillas cargadas: el sesgo es real y está documentado en el README.
   * ------------------------------------------------------------------ */
  var SESGOS = [
    { palabra: /r[ií]o/i,        arquitectura: "caverna",     paleta: "plano",     nota: "corriente" },
    { palabra: /luci[eé]rnaga/i, arquitectura: null,          paleta: "riso",      parpadeo: 3, nota: "intermitencia" },
    { palabra: /virus/i,         arquitectura: "danado",      paleta: null,        nota: "contagio" },
    { palabra: /hueco/i,         arquitectura: null,          paleta: null,        porosidad: 0.16, nota: "porosidad" },
    { palabra: /regresa/i,       arquitectura: "concentrico", paleta: null,        nota: "giro" },
    { palabra: /noche/i,         arquitectura: null,          paleta: "noche",     nota: "oscuridad" }
  ];

  function detectarSesgo(semilla) {
    var s = String(semilla);
    var acumulado = { arquitectura: null, paleta: null, porosidad: 0, parpadeo: 1, notas: [] };
    SESGOS.forEach(function (g) {
      if (!g.palabra.test(s)) return;
      if (g.arquitectura) acumulado.arquitectura = g.arquitectura;
      if (g.paleta) acumulado.paleta = g.paleta;
      if (g.porosidad) acumulado.porosidad += g.porosidad;
      if (g.parpadeo) acumulado.parpadeo = Math.max(acumulado.parpadeo, g.parpadeo);
      acumulado.notas.push(g.nota);
    });
    return acumulado;
  }

  /* ------------------------------------------------------------------ *
   * Una anomalía por semilla. La obra nunca la nombra.
   * ------------------------------------------------------------------ */
  var ANOMALIAS = [
    "horizonte",     /* el horizonte se desplaza con una respiración lenta */
    "planta_miente", /* una casilla de la planta muestra siempre otro material */
    "norte_pesa",    /* girar hacia el norte cuesta un paso de más */
    "papel_invierte",/* cada 91 pasos, un fotograma con el papel invertido */
    "muro_terco",    /* hay un muro que nunca se erosiona */
    "profundidad",   /* la tira de profundidad se adelanta a sí misma */
    "cursor_lento",  /* el cursor late más lento de lo que debería */
    "eco_lexico"     /* un material habla con el léxico de otro */
  ];

  /* ------------------------------------------------------------------ */

  function nuevaSemilla() {
    var silabas = ["ne", "gra", "ta", "lu", "mi", "cor", "ve", "sa", "hue", "ri", "no", "che", "za", "pe", "tro"];
    var r = Math.random;
    var s = "";
    var n = 3 + Math.floor(r() * 2);
    for (var i = 0; i < n; i += 1) s += silabas[Math.floor(r() * silabas.length)];
    return s + "-" + Math.floor(r() * 9000 + 1000);
  }

  function elegirFuente(rng) {
    var bolsa = [];
    FUENTES.forEach(function (f) { for (var i = 0; i < f.peso; i += 1) bolsa.push(f); });
    return rng.pick(bolsa);
  }

  /*
    crearMundo — reproducible por completo: la misma semilla reconstruye
    arquitectura, materiales, paleta, fuente, reparto de paneles, umbrales
    e inscripciones. Lo que hizo el visitante es otra capa (memoria).
  */
  function crearMundo(opts) {
    opts = opts || {};
    var semilla = String(opts.semilla == null ? "modotexto" : opts.semilla);
    var cols = opts.cols || 100, rows = opts.rows || 34;
    var raiz = new AZAR.RNG(semilla);
    var sesgo = detectarSesgo(semilla);
    var memoria = opts.memoria || null;

    var mundo = {
      semilla: semilla,
      sesgo: sesgo,
      rng: raiz,
      paleta: MAT.elegirPaleta(raiz.fork("paleta"), sesgo),
      fuente: elegirFuente(raiz.fork("fuente")),
      disposicion: new PAN.Disposicion(raiz.fork("paneles"), cols, rows),
      lexico: new LEXM.Lexico(raiz.fork("lexico")),
      anomalia: raiz.fork("anomalia").pick(ANOMALIAS),
      nivel: 0,
      niveles: raiz.fork("niveles").int(2, 4),
      memoria: memoria,
      registro: [],
      horizonte: 0,
      pasos: 0,
      detenido: false,
      tocados: 0,
      cuotaErosion: 0,
      ultimaErosion: 0,
      ultimoDeterioro: 0
    };
    /* sembrar cuerpos cuesta una construcción de lasletras; los tests que no
       los miran la pueden apagar sin que cambie nada más del mundo */
    mundo.sinEsculturas = opts.esculturas === false;
    mundo.condensacion = new CONM.Condensacion(raiz.fork("condensacion"), mundo.lexico);
    mundo.volcado = new VOLM.Volcado(raiz.fork("volcado"), mundo.lexico);
    if (opts.reducido) mundo.condensacion.reducido = true;
    generarNivel(mundo, 0);
    return mundo;
  }

  function generarNivel(mundo, nivel) {
    var raiz = mundo.rng;
    var rngN = raiz.fork("nivel:" + nivel);
    var sesgo = mundo.sesgo;
    var arq = LABM.elegirArquitectura(rngN.fork("arq"), nivel === 0 ? sesgo : null);
    if (nivel > 0) {
      /* bajar es cambiar de gramática: nunca la misma arquitectura dos veces seguidas */
      var previas = mundo.lab ? mundo.lab.arquitectura.clave : null;
      var intentos = 0;
      while (arq.clave === previas && intentos < 8) { arq = LABM.elegirArquitectura(rngN.fork("arq" + intentos)); intentos += 1; }
    }
    var W = 2 * rngN.int(14, 24) + 1;
    var H = 2 * rngN.int(11, 19) + 1;
    var poros = (sesgo.porosidad || 0) + (mundo.memoria ? mundo.memoria.porosidad(W * H) : 0);
    var lab = new LABM.Laberinto({
      W: W, H: H, rng: rngN.fork("trazo"), nivel: nivel,
      arquitectura: arq, porosidad: poros
    });
    mundo.lab = lab;
    mundo.nivel = nivel;

    /* tramas: cada material corre su propio autómata sobre su superficie */
    mundo.tramas = {};
    MAT.MATERIALES.forEach(function (m) {
      var r = rngN.fork("trama:" + m.clave);
      mundo.tramas[m.id] = MAT.nuevaTrama(m, 32, 16, function () { return r.next(); });
    });

    /* escrituras, inscripciones y letreros de fuga */
    repartirEscrituras(mundo, rngN.fork("escritura"));

    /* cicatrices previas: agujeros y volcados de otras sesiones */
    if (mundo.memoria) {
      mundo.memoria.perforadosDe(nivel).forEach(function (idx) {
        var x = idx % lab.W, y = (idx / lab.W) | 0;
        lab.perforar(x, y);
      });
      mundo.volcado.restaurar(mundo, mundo.memoria);
    }

    var abiertas = lab.casillasAbiertas();
    var inicio = abiertas.length ? rngN.fork("inicio").pick(abiertas) : [1, 1];
    mundo.pos = { x: inicio[0], y: inicio[1] };
    mundo.origen = { x: inicio[0], y: inicio[1] };
    mundo.pasoGiro = rngN.chance(0.5) ? 15 : 30;
    /* se empieza mirando hacia donde hay espacio: nadie entra de cara al muro */
    mundo.dirPaso = 0;
    var vueltas = Math.round(360 / mundo.pasoGiro);
    var cuartos = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    for (var q = 0; q < 4; q += 1) {
      var d = cuartos[q];
      if (lab.aire(mundo.pos.x + d[0], mundo.pos.y + d[1])) {
        mundo.dirPaso = Math.round(Math.atan2(d[1], d[0]) / (mundo.pasoGiro * Math.PI / 180));
        break;
      }
    }
    mundo.dirPaso = ((mundo.dirPaso % vueltas) + vueltas) % vueltas;
    mundo.dirAng = anguloDe(mundo);
    mundo.vista = { x: mundo.pos.x + 0.5, y: mundo.pos.y + 0.5, ang: mundo.dirAng };
    mundo.movimiento = null;
    mundo.condensacion.reiniciar();

    /* los cuerpos de lasletras, repartidos por los cruces y los callejones */
    /* los celadores: lo que se mueve por el laberinto y no eres tú */
    mundo.ronda = CELM ? new CELM.Ronda(rngN.fork("celadores"), mundo) : null;

    mundo.monumentos = (ESCM && !mundo.sinEsculturas)
      ? ESCM.sembrar(mundo, rngN.fork("esculturas"))
      : { mapa: {}, lista: [], disponible: false };

    return lab;
  }

  function repartirEscrituras(mundo, rng) {
    var lab = mundo.lab;
    mundo.escrituras = {};
    lab.inscripciones = {};
    lab.letreros = {};
    var muros = [];
    for (var y = 1; y < lab.H - 1; y += 1) {
      for (var x = 1; x < lab.W - 1; x += 1) {
        if (!lab.macizo(x, y)) continue;
        if (lab.aire(x - 1, y) || lab.aire(x + 1, y) || lab.aire(x, y - 1) || lab.aire(x, y + 1)) muros.push([x, y]);
      }
    }
    rng.shuffle(muros);
    var conEscritura = Math.floor(muros.length * 0.05);
    var eco = mundo.anomalia === "eco_lexico";
    for (var i = 0; i < conEscritura && i < muros.length; i += 1) {
      var m = muros[i];
      var mat = lab.material(m[0], m[1]);
      var clave = eco ? MAT.MATERIALES[(mat.id + 3) % MAT.MATERIALES.length].clave : mat.clave;
      var bolsa = LEXM.MATERIAL[clave] || LEXM.PROFUNDIDAD[0];
      var texto = rng.pick(bolsa) + "  ";
      mundo.escrituras[m[1] * lab.W + m[0]] = {
        texto: texto.toLowerCase(),
        ancho: rng.int(9, 18),
        alto: rng.int(3, 7)
      };
    }
    /* inscripciones: escritura que nadie puede leer y que el sistema no traduce */
    var alfabetos = Object.keys(MAT.ALFABETOS_ILEGIBLES);
    var conInscripcion = Math.max(2, Math.floor(muros.length * 0.012));
    for (var k = conEscritura; k < conEscritura + conInscripcion && k < muros.length; k += 1) {
      var mm = muros[k];
      var alf = rng.pick(alfabetos);
      var fuenteGlifos = Array.from(MAT.ALFABETOS_ILEGIBLES[alf]);
      var glifos = [];
      var largo = rng.int(3, 6);
      for (var g = 0; g < largo; g += 1) glifos.push(rng.pick(fuenteGlifos));
      lab.inscripciones[mm[1] * lab.W + mm[0]] = { alfabeto: alf, glifos: glifos };
    }
    /* letreros de fuga al final de corredores largos */
    var fondos = muros.filter(function (m) {
      var abiertos = 0;
      if (lab.aire(m[0] - 1, m[1])) abiertos += 1;
      if (lab.aire(m[0] + 1, m[1])) abiertos += 1;
      if (lab.aire(m[0], m[1] - 1)) abiertos += 1;
      if (lab.aire(m[0], m[1] + 1)) abiertos += 1;
      return abiertos === 1;
    });
    rng.shuffle(fondos);
    fondos.slice(0, Math.min(6, fondos.length)).forEach(function (f) {
      lab.letreros[f[1] * lab.W + f[0]] = mundo.lexico.fuga();
    });
  }

  /* ------------------------------------------------------------------ *
   * Cuerpo
   * ------------------------------------------------------------------ */

  function anguloDe(mundo) { return mundo.dirPaso * mundo.pasoGiro * Math.PI / 180; }

  function girar(mundo, pasos, ahora) {
    var extra = 0;
    if (mundo.anomalia === "norte_pesa") {
      var destino = ((mundo.dirPaso + pasos) * mundo.pasoGiro % 360 + 360) % 360;
      if (destino > 250 && destino < 290) extra = pasos > 0 ? 1 : -1;
    }
    mundo.dirPaso += pasos + extra;
    mundo.dirAng = anguloDe(mundo);
    mundo.movimiento = { t0: ahora, dur: 110, desde: { x: mundo.vista.x, y: mundo.vista.y, ang: mundo.vista.ang } };
    return true;
  }

  function casillaAdelante(mundo, signo) {
    var a = mundo.dirAng;
    var dx = Math.cos(a), dy = Math.sin(a);
    var px = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
    var py = Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0;
    if (px === 0 && py === 0) px = 1;
    return { x: mundo.pos.x + px * signo, y: mundo.pos.y + py * signo };
  }

  function casillaLateral(mundo, signo) {
    var a = mundo.dirAng + Math.PI / 2 * signo;
    var dx = Math.cos(a), dy = Math.sin(a);
    var px = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
    var py = Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0;
    return { x: mundo.pos.x + px, y: mundo.pos.y + py };
  }

  function caminar(mundo, destino, ahora) {
    if (!mundo.lab.aire(destino.x, destino.y)) return false;
    mundo.movimiento = { t0: ahora, dur: 120, desde: { x: mundo.vista.x, y: mundo.vista.y, ang: mundo.vista.ang } };
    mundo.pos = { x: destino.x, y: destino.y };
    mundo.pasos += 1;
    return true;
  }

  function interpolar(mundo, ahora, reducido) {
    var metaX = mundo.pos.x + 0.5, metaY = mundo.pos.y + 0.5, metaA = mundo.dirAng;
    if (reducido || !mundo.movimiento) {
      mundo.vista.x = metaX; mundo.vista.y = metaY; mundo.vista.ang = metaA;
      mundo.movimiento = null;
      return;
    }
    var m = mundo.movimiento;
    var p = Math.min(1, (ahora - m.t0) / m.dur);
    var e = p * p * (3 - 2 * p);
    mundo.vista.x = m.desde.x + (metaX - m.desde.x) * e;
    mundo.vista.y = m.desde.y + (metaY - m.desde.y) * e;
    var da = metaA - m.desde.ang;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    mundo.vista.ang = m.desde.ang + da * e;
    if (p >= 1) mundo.movimiento = null;
  }

  /* ------------------------------------------------------------------ *
   * Composición de la pantalla
   * ------------------------------------------------------------------ */

  function anotar(mundo, texto) {
    if (!mundo.disposicion.abierto("REGISTRO")) return;   /* sin panel no hay narración */
    texto = String(texto);
    var ultimo = mundo.registro[mundo.registro.length - 1];
    /* una línea por acontecimiento: chocar diez veces contra el mismo muro
       es un solo acontecimiento que se repite, y así se cuenta */
    if (ultimo && ultimo.base === texto) {
      ultimo.veces += 1;
      ultimo.texto = texto + " x" + ultimo.veces;
      return;
    }
    mundo.registro.push({ t: Date.now(), base: texto, texto: texto, veces: 1 });
    if (mundo.registro.length > 60) mundo.registro.shift();
  }

  function componer(mundo, rej, ahora, opts) {
    opts = opts || {};
    var disp = mundo.disposicion;
    rej.limpiar(32, 7, 0);
    disp.limpiarInteriores(rej, 0);

    var camara = disp.interior("CAMARA");
    var presupuesto = Math.floor(rej.n * 0.045);
    var trazado = { columnas: [], horizonte: camara ? camara.y : 0, gastadoLexico: 0 };
    if (camara && camara.w > 2 && camara.h > 2) {
      if (mundo.anomalia === "horizonte") mundo.horizonte = Math.sin(ahora / 9000) * 0.09;
      trazado = CAM.trazar(mundo, rej, camara, {
        presupuestoLexico: presupuesto,
        tintaPiso: 7, tintaCielo: 8
      });
      mundo.ultimoTrazado = trazado;
      letreroDeFuga(mundo, rej, camara, trazado);
      if (!mundo.detenido) mundo.condensacion.aplicar(rej, ahora, 15, 0);
      if (!mundo.detenido) mundo.volcado.aplicar(rej, camara, trazado, ahora, 7, 0);
      cuerpo(mundo, rej, camara, ahora, opts.reducido);
      if (opts.tactil) pastillasTactiles(rej, camara);
    }

    planta(mundo, rej, disp.interior("PLANTA"));
    registro(mundo, rej, disp.interior("REGISTRO"));
    inspector(mundo, rej, disp.interior("INSPECTOR"), opts.cursor);
    profundidad(mundo, rej, disp.interior("PROFUNDIDAD"), ahora);

    disp.marcos(rej);
    rej.resolverMarcos(7, 0);
    disp.titulos(rej, 7, 0, 15);
    ficha(mundo, rej, opts);

    if (mundo.anomalia === "papel_invierte" && mundo.pasos > 0 && mundo.pasos % 91 === 0) {
      for (var i = 0; i < rej.n; i += 1) rej.attr[i] |= ATTR.INVERTIDO;
    }
    return { trazado: trazado, metrica: rej.contarLexico() };
  }

  /* el visitante es un cursor: parpadea, y su ritmo es el único estado de ánimo */
  function cuerpo(mundo, rej, rect, ahora, reducido) {
    var lab = mundo.lab;
    var salidas = 0;
    if (lab.aire(mundo.pos.x - 1, mundo.pos.y)) salidas += 1;
    if (lab.aire(mundo.pos.x + 1, mundo.pos.y)) salidas += 1;
    if (lab.aire(mundo.pos.x, mundo.pos.y - 1)) salidas += 1;
    if (lab.aire(mundo.pos.x, mundo.pos.y + 1)) salidas += 1;
    var ritmo = salidas <= 1 ? 190 : (salidas >= 4 ? 900 : 480);
    if (mundo.anomalia === "cursor_lento") ritmo *= 1.7;
    var encendido = reducido ? true : (Math.floor(ahora / ritmo) % 2 === 0);
    var x = rect.x + (rect.w >> 1);
    var y = rect.y + rect.h - 1;
    rej.set(x, y, encendido ? "▄" : " ", 15, 0, 0, ORIGEN.CUERPO);
    mundo.ritmo = ritmo;
  }

  /* letreros de fuga: la frase se vuelve legible sólo en el último paso */
  function letreroDeFuga(mundo, rej, rect, trazado) {
    var centro = trazado.columnas[rect.w >> 1];
    if (!centro || centro.fuera) return;
    var idx = centro.y * mundo.lab.W + centro.x;
    var frase = mundo.lab.letreros[idx];
    if (!frase) return;
    var d = centro.dist;
    if (d > 6) return;
    var visible = Math.max(0, Math.min(1, (6 - d) / 4));
    var texto = frase.slice(0, Math.max(1, Math.floor(frase.length * visible)));
    var x0 = rect.x + Math.max(0, ((rect.w - texto.length) >> 1));
    var y = Math.max(rect.y, Math.min(rect.y + rect.h - 1, Math.round((centro.arriba + centro.abajo) / 2)));
    for (var i = 0; i < texto.length && x0 + i < rect.x + rect.w; i += 1) {
      var c = visible > 0.72 ? texto.charAt(i) : (i % 2 ? "░" : texto.charAt(i));
      rej.set(x0 + i, y, c, 15, 0, 0, ORIGEN.LEXICO);
    }
  }

  /* la planta nace vacía: sólo se dibuja lo caminado y lo visto */
  function planta(mundo, rej, rect) {
    if (!rect || rect.w < 3 || rect.h < 3) return;
    var lab = mundo.lab, mem = mundo.memoria;
    var cx = mundo.pos.x, cy = mundo.pos.y;
    var x0 = cx - (rect.w >> 1), y0 = cy - (rect.h >> 1);
    for (var j = 0; j < rect.h; j += 1) {
      for (var i = 0; i < rect.w; i += 1) {
        var mx = x0 + i, my = y0 + j;
        if (!lab.dentro(mx, my)) { rej.set(rect.x + i, rect.y + j, " ", 8, 0, 0, ORIGEN.VACIO); continue; }
        var idx = my * lab.W + mx;
        var rec = mem ? mem.recuerdo(mundo.nivel, idx) : null;
        var ch = " ", tinta = 8;
        if (rec) {
          var esMuro = lab.macizo(mx, my);
          if (rec.grado >= 3) {
            var m = MAT.MATERIALES[rec.mat % MAT.MATERIALES.length];
            if (mundo.anomalia === "planta_miente" && idx % 97 === 13) m = MAT.MATERIALES[(rec.mat + 4) % MAT.MATERIALES.length];
            ch = esMuro ? m.junta : "·";
            tinta = esMuro ? m.tinta : 7;
          } else if (rec.grado === 2) { ch = esMuro ? "░" : " "; tinta = 8; }
          else { ch = "·"; tinta = 8; }
          if (lab.roto[idx]) { ch = "¤"; tinta = 14; }     /* esto no lo hizo el arquitecto */
          if (mundo.monumentos && mundo.monumentos.mapa[idx]) {
            ch = "♦";                                      /* un cuerpo de lasletras */
            tinta = mundo.monumentos.mapa[idx].tinta | 8;
          }
          if (lab.esUmbral(mx, my)) { ch = "↓"; tinta = 15; }
        }
        rej.set(rect.x + i, rect.y + j, ch, tinta, 0, 0, ORIGEN.RUIDO);
      }
    }
    if (mundo.ronda) {
      mundo.ronda.vivos().forEach(function (c) {
        var sx = rect.x + (c.x - x0), sy = rect.y + (c.y - y0);
        if (sx < rect.x || sy < rect.y || sx >= rect.x + rect.w || sy >= rect.y + rect.h) return;
        rej.set(sx, sy, c.signos[0], c.tinta | 8, 0, ATTR.PARPADEO, ORIGEN.CELADOR);
      });
    }
    var px = rect.x + (rect.w >> 1), py = rect.y + (rect.h >> 1);
    var flechas = ["►", "◘", "▼", "◙", "◄", "◘", "▲", "◙"];
    var oct = ((Math.round(mundo.dirAng / (Math.PI / 4)) % 8) + 8) % 8;
    rej.set(px, py, flechas[oct], 15, 0, ATTR.INTENSO, ORIGEN.CUERPO);
  }

  /* una línea por acontecimiento, nunca por fotograma */
  function registro(mundo, rej, rect) {
    if (!rect || rect.w < 4 || rect.h < 1) return;
    var n = Math.min(rect.h, mundo.registro.length);
    for (var i = 0; i < n; i += 1) {
      var e = mundo.registro[mundo.registro.length - n + i];
      var linea = e.texto;
      if (linea.length > rect.w) linea = linea.slice(0, rect.w - 1) + ".";
      rej.texto(rect.x, rect.y + i, linea, i === n - 1 ? 15 : 7, 0, 0, ORIGEN.LEXICO, rect.w);
    }
  }

  /* sin INSPECTOR las celdas dejan de tener nombre */
  function inspector(mundo, rej, rect, cursor) {
    if (!rect || rect.w < 8 || rect.h < 2) return;
    var c = cursor && rej.dentro(cursor.x, cursor.y) ? rej.celda(cursor.x, cursor.y) : null;
    var lineas;
    if (!c) {
      lineas = ["-", "", "sin celda", "bajo el cursor"];
    } else {
      lineas = [
        c.x + "," + c.y,
        "[" + c.ch + "]",
        "de " + c.origen,
        "t" + c.ink + " p" + c.paper + " a" + c.attr,
        "x" + c.veces
      ];
    }
    for (var i = 0; i < lineas.length && i < rect.h; i += 1) {
      rej.texto(rect.x, rect.y + i, lineas[i], i === 0 ? 15 : 7, 0, 0, ORIGEN.INTERFAZ, rect.w);
    }
  }

  /* la única barra de progreso de la obra, y miente */
  function profundidad(mundo, rej, rect, ahora) {
    if (!rect || rect.h < 3) return;
    var dx = mundo.pos.x - mundo.origen.x, dy = mundo.pos.y - mundo.origen.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    var max = Math.sqrt(mundo.lab.W * mundo.lab.W + mundo.lab.H * mundo.lab.H) / 2;
    var t = Math.min(1, d / max);
    if (mundo.anomalia === "profundidad") t = Math.min(1, t * 1.35 + 0.06);
    /* la mentira es estructural: mezcla distancia con nivel y con pasos */
    var mentira = Math.min(1, t * 0.6 + (mundo.nivel / Math.max(1, mundo.niveles)) * 0.3 +
      (Math.min(1, mundo.pasos / 600)) * 0.1);
    var lleno = Math.round(mentira * (rect.h - 1));
    var escala = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
    for (var j = 0; j < rect.h; j += 1) {
      var desdeAbajo = rect.h - 1 - j;
      var ch = desdeAbajo <= lleno ? escala[(desdeAbajo + mundo.nivel) % escala.length] : "·";
      var col = mundo.centrarColumna == null ? rect.x + (rect.w >> 1) : rect.x;
      rej.set(col, rect.y + j, ch, desdeAbajo <= lleno ? 15 : 8, 0, 0, ORIGEN.INTERFAZ);
    }
  }

  /* pastillas táctiles: celdas grandes, ningún gesto de dos dedos */
  function pastillasTactiles(rej, rect) {
    var y = rect.y + rect.h - 1;
    for (var i = 0; i < 3; i += 1) {
      rej.set(rect.x + i, y, "◄", 15, 0, 0, ORIGEN.INTERFAZ);
      rej.set(rect.x + rect.w - 1 - i, y, "►", 15, 0, 0, ORIGEN.INTERFAZ);
    }
  }

  /* la ficha de rasgos vive en una celda; se despliega si se pide */
  function rasgosDe(mundo) {
    return [
      ["arquitectura", mundo.lab.arquitectura.nombre + (mundo.lab.baseDanada ? " (" + mundo.lab.baseDanada + ")" : "")],
      ["material", mundo.lab.materialDominante ? mundo.lab.materialDominante.nombre : "—"],
      ["paleta", mundo.paleta.nombre],
      ["fuente", mundo.fuente.clave],
      ["niveles", String(mundo.niveles)],
      ["nivel", String(mundo.nivel)],
      ["rejilla", mundo.lab.W + "x" + mundo.lab.H],
      ["cuerpos", mundo.monumentos ? String(mundo.monumentos.lista.length) : "0"],
      ["celadores", mundo.ronda ? (mundo.ronda.vivos().length + " de " + mundo.ronda.lista.length) : "0"],
      ["semilla", mundo.semilla]
    ];
  }

  /*
    La hoja — la obra no se explica por dentro, pero sí dice qué hacen sus
    teclas. Es una lista de controles, no una interpretación: en ningún
    renglón dice qué significa nada.
  */
  var CONTROLES = [
    ["flechas / WASD", "caminar y girar"],
    ["Q  E", "paso lateral"],
    ["Espacio", "tocar el muro de enfrente"],
    ["no hacer nada", "el muro se vuelve frase"],
    ["arrastrar un muro", "frotarlo hasta abrirlo"],
    ["Enter", "bajar por un umbral"],
    ["", ""],
    ["Tab", "cambiar de panel"],
    ["X", "cerrar el panel activo"],
    ["Ctrl + flechas", "redimensionarlo"],
    ["Alt + flechas", "intercambiarlo"],
    ["", ""],
    ["Esc", "detener la proliferación"],
    ["R", "rasgos de la semilla"],
    ["M", "altavoz"],
    ["O", "olvidar"],
    ["P", "imprimir la constancia"],
    ["Shift+S A T J V", "png · ans · txt · json · volcado"],
    ["?", "esta hoja"]
  ];

  function hoja(mundo, rej) {
    var envolver = CONM.envolver;
    var col = 0, desc = 0;
    CONTROLES.forEach(function (c) {
      col = Math.max(col, c[0].length);
      desc = Math.max(desc, c[1].length);
    });
    /*
      El ancho lo pide cada columna por separado, no la suma del renglón más
      largo: si no, la última descripción se sale de la caja. Y si aun así no
      cabe, la descripción baja de renglón. Aquí tampoco se corta nada.
    */
    var disponible = Math.max(20, rej.cols - 6);
    var anchoDesc = Math.min(desc, Math.max(8, disponible - col - 2));
    var ancho = Math.min(disponible, col + 2 + anchoDesc);

    var filas = [];
    CONTROLES.forEach(function (c) {
      if (!c[0] && !c[1]) { filas.push(null); return; }
      var partes = envolver(c[1], anchoDesc);
      filas.push({ clave: c[0], texto: partes[0] || "" });
      for (var i = 1; i < partes.length; i += 1) filas.push({ clave: "", texto: partes[i] });
    });

    var alto = Math.min(rej.rows, filas.length + 4);
    var x0 = Math.max(0, ((rej.cols - ancho - 2) >> 1));
    var y0 = Math.max(0, ((rej.rows - alto) >> 1));
    rej.rellenar(x0, y0, ancho + 2, alto, " ", 7, 0, 0, ORIGEN.INTERFAZ);
    marcoSuelto(rej, x0, y0, ancho + 2, alto, 15);
    rej.texto(x0 + 2, y0 + 1, "CONTROLES", 15, 0, ATTR.INTENSO, ORIGEN.INTERFAZ, ancho);
    for (var f = 0; f < filas.length && y0 + 3 + f < y0 + alto - 1; f += 1) {
      var fila = filas[f];
      if (!fila) continue;
      if (fila.clave) rej.texto(x0 + 2, y0 + 3 + f, fila.clave, 15, 0, 0, ORIGEN.INTERFAZ, col);
      rej.texto(x0 + 2 + col + 2, y0 + 3 + f, fila.texto, 7, 0, 0, ORIGEN.INTERFAZ, anchoDesc);
    }
  }

  /* un marco dibujado a mano, para lo que no es panel y no debe fundirse */
  function marcoSuelto(rej, x, y, w, h, tinta) {
    var i;
    for (i = 1; i < w - 1; i += 1) {
      rej.set(x + i, y, "═", tinta, 0, 0, ORIGEN.INTERFAZ);
      rej.set(x + i, y + h - 1, "═", tinta, 0, 0, ORIGEN.INTERFAZ);
    }
    for (i = 1; i < h - 1; i += 1) {
      rej.set(x, y + i, "║", tinta, 0, 0, ORIGEN.INTERFAZ);
      rej.set(x + w - 1, y + i, "║", tinta, 0, 0, ORIGEN.INTERFAZ);
    }
    rej.set(x, y, "╔", tinta, 0, 0, ORIGEN.INTERFAZ);
    rej.set(x + w - 1, y, "╗", tinta, 0, 0, ORIGEN.INTERFAZ);
    rej.set(x, y + h - 1, "╚", tinta, 0, 0, ORIGEN.INTERFAZ);
    rej.set(x + w - 1, y + h - 1, "╝", tinta, 0, 0, ORIGEN.INTERFAZ);
  }

  function ficha(mundo, rej, opts) {
    var x = rej.cols - 1, y = 0;
    rej.set(x, y, "§", 15, 0, 0, ORIGEN.INTERFAZ);
    /* el altavoz es una celda, no un menú; y sólo parpadea cuando suena */
    rej.set(x, 1, opts.sonido ? "♪" : "·", opts.sonido ? 15 : 8, 0,
      opts.sonido ? ATTR.PARPADEO : 0, ORIGEN.INTERFAZ);
    if (mundo.detenido) rej.set(x, 2, "‼", 15, 0, 0, ORIGEN.INTERFAZ);
    rej.set(x, 3, "?", opts.ayudaAbierta ? 15 : 8, 0, 0, ORIGEN.INTERFAZ);
    if (opts.ayudaAbierta) { hoja(mundo, rej); return; }
    if (!opts.rasgosAbiertos) return;
    var filas = rasgosDe(mundo);
    var ancho = 0;
    filas.forEach(function (f) { ancho = Math.max(ancho, (f[0] + " " + f[1]).length); });
    ancho = Math.min(rej.cols - 4, ancho + 2);
    var x0 = Math.max(1, rej.cols - ancho - 2), y0 = 1;
    rej.rellenar(x0, y0, ancho + 2, filas.length + 2, " ", 7, 0, 0, ORIGEN.INTERFAZ);
    marcoSuelto(rej, x0, y0, ancho + 2, filas.length + 2, 15);
    filas.forEach(function (f, i) {
      rej.texto(x0 + 1, y0 + 1 + i, f[0] + " " + f[1], 7, 0, 0, ORIGEN.INTERFAZ, ancho);
    });
  }

  /* ------------------------------------------------------------------ *
   * Erosión, con presupuesto: el mundo se degrada sin disolverse
   * ------------------------------------------------------------------ */
  var CUOTA_MINUTO = 24;

  function erosionar(mundo, ahora) {
    if (mundo.detenido) return;
    if (ahora - mundo.ultimaErosion < 2200 + (mundo.rng.seed % 2800)) return;
    mundo.ultimaErosion = ahora;
    MAT.MATERIALES.forEach(function (m) {
      if (mundo.tramas[m.id]) MAT.avanzarTrama(mundo.tramas[m.id]);
    });
    if (ahora - (mundo.minutoErosion || 0) > 60000) {
      mundo.minutoErosion = ahora;
      mundo.cuotaErosion = 0;
    }
    if (mundo.cuotaErosion >= CUOTA_MINUTO) return;

    /* una sola modificación estructural por generación, lejos del cuerpo,
       y siempre verificando que el laberinto siga siendo recorrible */
    var lab = mundo.lab, rng = mundo.rng;
    var ang = rng.float(0, Math.PI * 2), r = rng.float(6, 15);
    var x = Math.round(mundo.pos.x + Math.cos(ang) * r);
    var y = Math.round(mundo.pos.y + Math.sin(ang) * r);
    if (!lab.dentro(x, y) || x < 1 || y < 1 || x >= lab.W - 1 || y >= lab.H - 1) return;
    var idx = y * lab.W + x;
    if (mundo.anomalia === "muro_terco" && idx % 211 === 7) return;
    var mat = lab.material(x, y);
    var trama = mundo.tramas[mat.id];
    var v = MAT.valorTrama(trama, x, y);
    if (lab.macizo(x, y)) {
      /* Conway y Wolfram 30 desmoronan */
      if (v > 0.5 && (mat.automata.tipo === "conway" || mat.automata.regla === 30 || mat.automata.regla === 45)) {
        if (lab.perforar(x, y)) mundo.cuotaErosion += 1;
      }
    } else {
      /* Wolfram 110 construye */
      if (v > 0.7 && mat.automata.regla === 110) {
        if (lab.macizar(x, y)) mundo.cuotaErosion += 1;
      }
    }
  }

  /*
    frotar — acelera localmente el autómata de un muro. Frotar mucho abre un
    paso que el generador no previó; el laberinto lo acepta y recalcula rutas.
  */
  function frotar(mundo, x, y, ahora) {
    var lab = mundo.lab;
    if (!lab.dentro(x, y) || !lab.macizo(x, y)) return null;
    var idx = y * lab.W + x;
    if (mundo.anomalia === "muro_terco" && idx % 211 === 7) return { desgaste: 0, terco: true };
    lab.desgaste[idx] += 1;
    var mat = lab.material(x, y);
    if (mundo.tramas[mat.id]) MAT.avanzarTrama(mundo.tramas[mat.id]);
    if (lab.desgaste[idx] >= 34) {
      if (mundo.cuotaErosion >= CUOTA_MINUTO) return { resiste: true };
      if (lab.perforar(x, y)) {
        mundo.cuotaErosion += 1;
        if (mundo.memoria) mundo.memoria.anotarPerforado(mundo.nivel, idx);
        return { perforado: true, x: x, y: y };
      }
      lab.desgaste[idx] = 24;
      return { resiste: true };
    }
    return { desgaste: lab.desgaste[idx] };
  }

  /* tocar el muro de enfrente: el gesto principal */
  function tocar(mundo, ahora) {
    var f = CAM.frente(mundo);
    mundo.tocados += 1;
    if (!f.macizo) return { vacio: true, frente: f };
    var mat = f.material;
    var idx = f.y * mundo.lab.W + f.x;
    var r = mundo.rng.next();
    if (mundo.lab.inscripciones[idx]) {
      var ins = mundo.lab.inscripciones[idx];
      return { frente: f, inscripcion: ins, texto: ins.glifos.join("") };
    }
    if (r < 0.34) {
      var t = mundo.lexico.tomar(mundo.nivel, mat.clave);
      return { frente: f, palabra: t.texto, material: mat };
    }
    if (r < 0.55) return { frente: f, ilumina: true, material: mat };
    if (r < 0.72) { mundo.lab.desgaste[idx] += 6; return { frente: f, agrieta: true, material: mat }; }
    return { frente: f, mudo: true, material: mat };
  }

  function bajar(mundo, ahora) {
    if (!mundo.lab.esUmbral(mundo.pos.x, mundo.pos.y)) return false;
    var siguiente = (mundo.nivel + 1) % mundo.niveles;
    generarNivel(mundo, siguiente);
    return true;
  }

  /* recuerdo: el cuerpo escribe el mapa */
  function recordar(mundo) {
    if (!mundo.memoria) return;
    var lab = mundo.lab;
    var idx = mundo.pos.y * lab.W + mundo.pos.x;
    mundo.memoria.ver(mundo.nivel, idx, lab.mat[idx], true);
    var t = mundo.ultimoTrazado;
    if (!t) return;
    for (var i = 0; i < t.columnas.length; i += 1) {
      var c = t.columnas[i];
      if (!c || c.fuera || c.dist > 9) continue;
      var j = c.y * lab.W + c.x;
      mundo.memoria.ver(mundo.nivel, j, lab.mat[j], false);
    }
  }

  /* ------------------------------------------------------------------ *
   * Espejo accesible: la obra dicha en voz baja. No es una vista.
   * ------------------------------------------------------------------ */
  var RUMBOS = ["este", "sureste", "sur", "suroeste", "oeste", "noroeste", "norte", "noreste"];

  function monumentoEn(mundo, x, y) {
    if (!mundo.monumentos || !mundo.lab.dentro(x, y)) return null;
    return mundo.monumentos.mapa[y * mundo.lab.W + x] || null;
  }

  function frase(mundo) {
    var f = CAM.frente(mundo);
    var oct = ((Math.round(mundo.dirAng / (Math.PI / 4)) % 8) + 8) % 8;
    var partes = ["Miras al " + RUMBOS[oct] + "."];
    if (f.macizo) partes.push("Enfrente, muro de " + (f.material ? f.material.nombre : "material desconocido") + (f.roto ? ", perforado" : "") + ".");
    else partes.push("Enfrente, paso abierto.");
    if (mundo.lab.esUmbral(mundo.pos.x, mundo.pos.y)) partes.push("Estás sobre un umbral.");
    var aqui = monumentoEn(mundo, mundo.pos.x, mundo.pos.y);
    if (aqui) partes.push("Estás dentro de un cuerpo escrito: " + aqui.nombre + ".");
    else {
      var cerca = monumentoEn(mundo, f.x, f.y);
      if (cerca) partes.push("Enfrente, un cuerpo escrito de " + cerca.alto.toFixed(1) + " alturas.");
    }
    if (mundo.condensacion.estado === "legible" && mundo.condensacion.fraseVisible) {
      partes.push("El muro dice: " + mundo.condensacion.fraseVisible + ".");
    } else if (mundo.condensacion.estado === "condensando") {
      partes.push("Algo se está ordenando en el muro.");
    }
    if (mundo.ronda) {
      var vivos = mundo.ronda.vivos();
      var pegado = vivos.filter(function (c) {
        return Math.abs(c.x - mundo.pos.x) + Math.abs(c.y - mundo.pos.y) <= 3;
      });
      if (pegado.length) partes.push("Hay " + (pegado.length === 1 ? "un celador" : pegado.length + " celadores") + " muy cerca.");
    }
    if (mundo.volcado.activo) partes.push("Una región del espacio está volcando su estado interno.");
    partes.push("Nivel " + mundo.nivel + ", " + mundo.pasos + " pasos.");
    return partes.join(" ");
  }

  /* ------------------------------------------------------------------ *
   * iniciar() — de aquí para abajo sí existe el documento
   * ------------------------------------------------------------------ */
  function iniciar() {
    var doc = root.document;
    var lienzo = doc.getElementById("pantalla");
    var espejo = doc.getElementById("espejo");
    var impresion = doc.getElementById("constancia");
    var envoltorio = doc.getElementById("marco");
    if (!lienzo) return;

    var mqMov = root.matchMedia ? root.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
    var mqCon = root.matchMedia ? root.matchMedia("(prefers-contrast: more)") : { matches: false };
    var mqFino = root.matchMedia ? root.matchMedia("(pointer: fine)") : { matches: true };
    var reducido = !!mqMov.matches;

    var params = new URLSearchParams(root.location.search);
    var semilla = params.get("seed");
    if (!semilla) {
      semilla = nuevaSemilla();
      params.set("seed", semilla);
      root.history.replaceState(null, "", root.location.pathname + "?" + params.toString());
    }

    var memoria = new MEMM.Memoria(semilla);
    var rej = new REJ.Rejilla(100, 34);
    var mundo = crearMundo({ semilla: semilla, cols: 100, rows: 34, memoria: memoria, reducido: reducido });
    var paleta = mqCon.matches ? MAT.PALETA_CONTRASTE : mundo.paleta;
    var pintor = new REJ.Pintor(lienzo, paleta);
    pintor.reducido = reducido;
    var sonido = new (root.MT_SONIDO.Sonido)();
    var estado = {
      cursor: null, rasgosAbiertos: false, ayudaAbierta: false, arrastre: null,
      quietoDesde: (root.performance ? performance.now() : Date.now()),
      ultimoEspejo: 0, ultimoGuardado: 0, ultimaCompuesta: 0, visible: true
    };

    mundo.lexico.marcarLeidas(memoria.datos.frases);
    (memoria.datos.panelesCerrados || []).forEach(function (k) { mundo.disposicion.cerrar(k); });
    mundo.condensacion.alLeer = function (tomada) {
      anotar(mundo, "· " + tomada.texto + (tomada.cita ? "  [" + tomada.cita + "]" : ""));
      memoria.anotarFrase(tomada.texto);
      guardar();
      actualizarEspejo(true);
    };

    /* --- métrica de rejilla: la fuente decide las dimensiones del mundo --- */
    /* la CP437 de la semilla, con unscii detrás para sextantes y cuadrantes */
    function pila() { return mundo.fuente.familia + ", mtUnscii, monospace"; }

    function medir() {
      var familia = pila();
      var alto = mundo.fuente.base;
      var anchoV = envoltorio ? envoltorio.clientWidth : root.innerWidth;
      var altoV = envoltorio ? envoltorio.clientHeight : root.innerHeight;
      var estrecha = anchoV < 620;
      var m, cols, intentos = 0;
      if (estrecha) {
        /*
          En un teléfono la rejilla es más chica y se acabó: se busca llenar
          el alto con las 50 filas del techo, y las columnas son las que
          quepan. Escalar el lienzo lo volvería borroso, y el pixel es la ley.
        */
        alto = Math.max(8, Math.min(24, Math.floor(altoV / 50)));
        m = pintor.medir(familia, alto);
        cols = Math.floor(anchoV / m.cw);
        while (cols < 36 && alto > 8 && intentos < 24) {
          intentos += 1;
          alto -= 1;
          m = pintor.medir(familia, alto);
          cols = Math.floor(anchoV / m.cw);
        }
      } else {
        m = pintor.medir(familia, alto);
        cols = Math.floor(anchoV / m.cw);
        /*
          El ancho manda: la rejilla busca estar entre 80 y 160 columnas, pero
          nunca se le pide al lienzo más de lo que cabe.
        */
        while (intentos < 40) {
          intentos += 1;
          if (cols > 160) { alto += 1; }
          else if (cols < 80 && alto > 8) { alto -= 1; }
          else break;
          m = pintor.medir(familia, alto);
          cols = Math.floor(anchoV / m.cw);
        }
      }
      var rows = Math.floor(altoV / m.ch);
      cols = Math.max(20, Math.min(160, cols));
      rows = Math.max(12, Math.min(50, rows));
      rej.redim(cols, rows);
      mundo.disposicion.recalcular(cols, rows);
      pintor.ajustar(rej);
      pintor.invalidar();
    }

    function actualizarEspejo(forzar) {
      var ahora = root.performance ? performance.now() : Date.now();
      if (!forzar && ahora - estado.ultimoEspejo < 900) return;
      estado.ultimoEspejo = ahora;
      if (espejo) espejo.textContent = frase(mundo);
    }

    function moverse() {
      estado.quietoDesde = root.performance ? performance.now() : Date.now();
      mundo.condensacion.mover(estado.quietoDesde);
      sonido.callar(0);
    }

    /* ------------------------- entrada ------------------------- */
    function tecla(ev) {
      var ahora = root.performance ? performance.now() : Date.now();
      var k = ev.key;
      var manejada = true;
      var foco = mundo.disposicion.foco;

      if (k === "Escape") {
        mundo.detenido = !mundo.detenido;
        anotar(mundo, mundo.detenido ? "proliferación detenida" : "proliferación reanudada");
      } else if (k === "Tab") {
        mundo.disposicion.siguienteFoco(ev.shiftKey ? -1 : 1);
      } else if (ev.shiftKey && (k === "S" || k === "s")) {
        root.MT_EXPORTAR.png(rej, paleta, pila(), mundo.fuente.base, 2, semilla);
      } else if (ev.shiftKey && (k === "A" || k === "a")) {
        root.MT_EXPORTAR.ans(rej, semilla);
      } else if (ev.shiftKey && (k === "T" || k === "t")) {
        root.MT_EXPORTAR.txt(rej, semilla);
      } else if (ev.shiftKey && (k === "J" || k === "j")) {
        root.MT_EXPORTAR.json(estadoExportable(), semilla);
      } else if (ev.shiftKey && (k === "V" || k === "v")) {
        root.MT_EXPORTAR.volcadoTxt(mundo.volcado.poema() || "no ha habido volcado en esta sesión", semilla);
      } else if (k === "p" || k === "P") {
        prepararImpresion(); root.print();
      } else if (k === "?" || k === "h" || k === "H" || k === "F1") {
        estado.ayudaAbierta = !estado.ayudaAbierta;
        if (estado.ayudaAbierta) estado.rasgosAbiertos = false;
      } else if (k === "r" || k === "R") {
        estado.rasgosAbiertos = !estado.rasgosAbiertos;
        if (estado.rasgosAbiertos) estado.ayudaAbierta = false;
      } else if (k === "m" || k === "M") {
        var on = sonido.alternar();
        anotar(mundo, on ? "altavoz encendido" : "altavoz apagado");
      } else if (k === "o" || k === "O") {
        olvidar();
      } else if (foco !== "CAMARA" && (k === "x" || k === "X" || k === "Delete")) {
        cerrarPanel(foco);
      } else if (ev.ctrlKey && (k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown")) {
        mundo.disposicion.redimensionar(foco,
          (k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0),
          (k === "ArrowDown" ? 1 : k === "ArrowUp" ? -1 : 0));
      } else if (ev.altKey && (k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown")) {
        var otro = mundo.disposicion.vecino(foco,
          (k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0),
          (k === "ArrowDown" ? 1 : k === "ArrowUp" ? -1 : 0));
        if (otro) mundo.disposicion.intercambiar(foco, otro);
      } else if (k === "ArrowUp" || k === "w" || k === "W") {
        pasoAdelante(1, ahora);
      } else if (k === "ArrowDown" || k === "s" || k === "S") {
        pasoAdelante(-1, ahora);
      } else if (k === "ArrowLeft" || k === "a" || k === "A") {
        girar(mundo, -1, ahora); sonido.giro(); moverse();
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        girar(mundo, 1, ahora); sonido.giro(); moverse();
      } else if (k === "q" || k === "Q") {
        lateral(-1, ahora);
      } else if (k === "e" || k === "E") {
        lateral(1, ahora);
      } else if (k === " ") {
        gestoTocar(ahora);
      } else if (k === "Enter") {
        if (mundo.disposicion.residuos.length) reabrirPanel(mundo.disposicion.residuos[0].clave);
        else if (bajar(mundo, ahora)) { sonido.umbral(); anotar(mundo, "umbral: nivel " + mundo.nivel); }
      } else {
        manejada = false;
      }
      if (manejada) { ev.preventDefault(); actualizarEspejo(); }
    }

    /* alcanzar a un celador: suelta la puerta en presente y devuelve el mapa */
    function atrapar(ahora) {
      if (!mundo.ronda) return;
      var c = mundo.ronda.en(mundo.pos.x, mundo.pos.y);
      if (!c) return;
      var r = mundo.ronda.atrapar(c, mundo);
      anotar(mundo, "alcanzaste un celador: " + r.frase);
      if (r.devueltas) anotar(mundo, "devolvió " + r.devueltas + " casillas de tu memoria");
      if (!r.quedan) anotar(mundo, "no queda ninguno rondando este nivel");
      memoria.anotarFrase(r.frase);
      sonido.perforar();
      guardar();
      actualizarEspejo(true);
      mundo.volcado.quizas(ahora, mundo, "celador", 0.12);
    }

    function pasoAdelante(signo, ahora) {
      var destino = casillaAdelante(mundo, signo);
      if (caminar(mundo, destino, ahora)) {
        sonido.paso();
        recordar(mundo);
        atrapar(ahora);
        var cuerpo = monumentoEn(mundo, mundo.pos.x, mundo.pos.y);
        if (cuerpo && cuerpo !== estado.ultimoCuerpo) {
          estado.ultimoCuerpo = cuerpo;
          anotar(mundo, "atraviesas " + cuerpo.nombre + " (" + cuerpo.especie + ")");
          sonido.muro(mundo.lab.material(mundo.pos.x, mundo.pos.y));
        } else if (!cuerpo) { estado.ultimoCuerpo = null; }
        if (mundo.lab.esUmbral(mundo.pos.x, mundo.pos.y)) anotar(mundo, "umbral bajo los pies");
        mundo.volcado.quizas(ahora, mundo, "pasos", 0.006);
      } else {
        var contra = mundo.lab.material(destino.x, destino.y);
        anotar(mundo, "choque contra " + contra.nombre);
        sonido.muro(contra);
      }
      moverse();
    }

    function lateral(signo, ahora) {
      var destino = casillaLateral(mundo, signo);
      if (caminar(mundo, destino, ahora)) { sonido.paso(); recordar(mundo); }
      moverse();
    }

    function gestoTocar(ahora) {
      var r = tocar(mundo, ahora);
      if (r.vacio) { anotar(mundo, "nada enfrente"); }
      else if (r.inscripcion) { anotar(mundo, "inscripción " + r.texto); sonido.muro(r.frente.material); }
      else if (r.palabra) { anotar(mundo, "el muro suelta: " + r.palabra); memoria.anotarFrase(r.palabra); sonido.muro(r.material); }
      else if (r.ilumina) { anotar(mundo, "el muro de " + r.material.nombre + " se ilumina"); sonido.muro(r.material); }
      else if (r.agrieta) { anotar(mundo, "el muro se agrieta"); sonido.muro(r.material); }
      else { anotar(mundo, "el muro no responde; queda registrado"); }
      mundo.volcado.quizas(ahora, mundo, "tacto", 0.02);
      moverse();
    }

    function cerrarPanel(clave) {
      var def = PAN.DEFINICIONES[clave];
      if (mundo.disposicion.cerrar(clave)) {
        memoria.anotarCierre(clave);
        guardar();
        anotar(mundo, "se cerró " + clave + ": se pierde " + (def ? def.facultad : "una facultad"));
        sonido.panel(false);
        pintor.invalidar();
      }
    }

    function reabrirPanel(clave) {
      if (mundo.disposicion.abrir(clave)) {
        memoria.anotarApertura(clave);
        guardar();
        anotar(mundo, clave + " vuelve, pero no lo que pasó sin él");
        sonido.panel(true);
        pintor.invalidar();
      }
    }

    function olvidar() {
      memoria.olvidar();
      mundo.registro.length = 0;
      mundo.lexico = new LEXM.Lexico(mundo.rng.fork("lexico:" + Date.now()));
      mundo.condensacion.lexico = mundo.lexico;
      mundo.condensacion.reiniciar();
      anotar(mundo, "memoria borrada: el mundo vuelve a no saber nada");
      actualizarEspejo(true);
    }

    /* ------------------------- ratón y tacto ------------------------- */
    function celdaDe(ev) {
      var caja = lienzo.getBoundingClientRect();
      var x = Math.floor((ev.clientX - caja.left) / (caja.width / rej.cols));
      var y = Math.floor((ev.clientY - caja.top) / (caja.height / rej.rows));
      return { x: Math.max(0, Math.min(rej.cols - 1, x)), y: Math.max(0, Math.min(rej.rows - 1, y)) };
    }

    function abajo(ev) {
      var c = celdaDe(ev);
      var ahora = root.performance ? performance.now() : Date.now();
      lienzo.setPointerCapture && lienzo.setPointerCapture(ev.pointerId);
      var residuo = mundo.disposicion.residuoEn(c.x, c.y);
      if (residuo) { reabrirPanel(residuo); return; }
      if (c.x === rej.cols - 1 && c.y === 0) { estado.rasgosAbiertos = !estado.rasgosAbiertos; return; }
      if (c.x === rej.cols - 1 && c.y === 1) {
        anotar(mundo, sonido.alternar() ? "altavoz encendido" : "altavoz apagado");
        return;
      }
      if (c.x === rej.cols - 1 && c.y === 2) {
        mundo.detenido = !mundo.detenido;
        anotar(mundo, mundo.detenido ? "proliferación detenida" : "proliferación reanudada");
        return;
      }
      if (c.x === rej.cols - 1 && c.y === 3) {
        estado.ayudaAbierta = !estado.ayudaAbierta;
        if (estado.ayudaAbierta) estado.rasgosAbiertos = false;
        return;
      }
      if (estado.ayudaAbierta) { estado.ayudaAbierta = false; return; }
      var clave = mundo.disposicion.panelEn(c.x, c.y);
      if (!clave) return;
      mundo.disposicion.foco = clave;
      if (mundo.disposicion.enCierre(clave, c.x, c.y)) { cerrarPanel(clave); return; }
      if (mundo.disposicion.enEsquina(clave, c.x, c.y)) { estado.arrastre = { tipo: "redim", clave: clave, c: c }; return; }
      if (mundo.disposicion.enBarra(clave, c.x, c.y)) { estado.arrastre = { tipo: "mover", clave: clave }; return; }
      if (clave === "CAMARA") {
        var it = mundo.disposicion.interior("CAMARA");
        if (!it) return;
        if (c.y === it.y + it.h - 1 && c.x <= it.x + 2) { girar(mundo, -1, ahora); moverse(); return; }
        if (c.y === it.y + it.h - 1 && c.x >= it.x + it.w - 3) { girar(mundo, 1, ahora); moverse(); return; }
        estado.arrastre = { tipo: "frotar", clave: clave };
        caminarHacia(c, it, ahora);
      } else if (clave === "PLANTA") {
        mirarHacia(c, ahora);
      }
    }

    function caminarHacia(c, it, ahora) {
      var col = c.x - it.x;
      var ang = CAM.columnaHacia(mundo, it, col);
      var pasos = Math.round((ang - mundo.dirAng) / (mundo.pasoGiro * Math.PI / 180));
      if (pasos) { girar(mundo, pasos, ahora); sonido.giro(); }
      else pasoAdelante(1, ahora);
      moverse();
    }

    function mirarHacia(c, ahora) {
      var rect = mundo.disposicion.interior("PLANTA");
      if (!rect) return;
      var mx = mundo.pos.x - (rect.w >> 1) + (c.x - rect.x);
      var my = mundo.pos.y - (rect.h >> 1) + (c.y - rect.y);
      var ang = Math.atan2(my - mundo.pos.y, mx - mundo.pos.x);
      var pasos = Math.round(ang / (mundo.pasoGiro * Math.PI / 180)) - mundo.dirPaso;
      girar(mundo, pasos, ahora);
      moverse();
    }

    function movido(ev) {
      var c = celdaDe(ev);
      estado.cursor = c;
      var ahora = root.performance ? performance.now() : Date.now();
      if (!estado.arrastre) return;
      if (estado.arrastre.tipo === "redim") {
        var d = estado.arrastre.c;
        mundo.disposicion.redimensionar(estado.arrastre.clave, c.x - d.x, c.y - d.y);
        estado.arrastre.c = c;
        pintor.invalidar();
      } else if (estado.arrastre.tipo === "frotar") {
        var it = mundo.disposicion.interior("CAMARA");
        var t = mundo.ultimoTrazado;
        if (!it || !t) return;
        var col = t.columnas[c.x - it.x];
        if (!col || col.fuera) return;
        var r = frotar(mundo, col.x, col.y, ahora);
        if (r && r.perforado) {
          anotar(mundo, "paso abierto en " + r.x + "," + r.y + ": no lo hizo el arquitecto");
          guardar();
          sonido.perforar();
          mundo.volcado.quizas(ahora, mundo, "perforación", 0.22);
        }
        moverse();
      }
    }

    function arriba(ev) {
      if (estado.arrastre && estado.arrastre.tipo === "mover") {
        var c = celdaDe(ev);
        var destino = mundo.disposicion.panelEn(c.x, c.y);
        if (destino && destino !== estado.arrastre.clave) {
          mundo.disposicion.intercambiar(estado.arrastre.clave, destino);
          pintor.invalidar();
        }
      }
      estado.arrastre = null;
    }

    /* ------------------------- exportación ------------------------- */
    function estadoExportable() {
      return {
        obra: "modotexto", sitio: "poesiasexp",
        semilla: semilla,
        rasgos: rasgosDe(mundo),
        anomalia: mundo.anomalia,
        laberinto: {
          W: mundo.lab.W, H: mundo.lab.H,
          arquitectura: mundo.lab.arquitectura.clave,
          umbrales: mundo.lab.umbrales,
          casillas: Array.from(mundo.lab.casillas).join("")
        },
        memoria: memoria.exportar(),
        frases: mundo.lexico.leidas(),
        pasos: mundo.pasos,
        exportado: new Date().toISOString()
      };
    }

    function plantaTexto() {
      var lab = mundo.lab, out = [];
      for (var y = 0; y < lab.H; y += 1) {
        var s = "";
        for (var x = 0; x < lab.W; x += 1) {
          var idx = y * lab.W + x;
          var rec = memoria.recuerdo(mundo.nivel, idx);
          if (!rec) { s += " "; continue; }
          if (lab.roto[idx]) { s += "¤"; continue; }
          if (lab.esUmbral(x, y)) { s += "↓"; continue; }
          if (rec.grado >= 3) s += lab.macizo(x, y) ? "#" : "·";
          else if (rec.grado === 2) s += lab.macizo(x, y) ? "░" : " ";
          else s += ".";
        }
        out.push(s.replace(/\s+$/, ""));
      }
      return out.join("\n");
    }

    function guardar() {
      memoria.datos.pasos = mundo.pasos;
      memoria.datos.tiempo = (memoria.datos.tiempo || 0) + 5;
      memoria.guardar();
    }

    function prepararImpresion() {
      root.MT_EXPORTAR.constancia(impresion, {
        semilla: semilla,
        rasgos: rasgosDe(mundo),
        planta: plantaTexto(),
        frases: mundo.lexico.leidas(),
        volcado: mundo.volcado.poema()
      });
    }

    /* ------------------------- bucle ------------------------- */
    var pendiente = 0;
    function bucle(ahora) {
      pendiente = root.requestAnimationFrame(bucle);
      if (doc.hidden) return;
      /* la cadencia de una máquina lenta: ocho a doce fotogramas por segundo */
      if (ahora - estado.ultimaCompuesta < 83) return;
      estado.ultimaCompuesta = ahora;

      interpolar(mundo, ahora, reducido);
      erosionar(mundo, ahora);
      if (mundo.ronda) {
        mundo.ronda.actualizar(mundo, ahora, mundo.detenido);
        atrapar(ahora);
      }

      if (mundo.volcado.activo && !mundo.volcado.vigente(ahora)) {
        var nuevo = mundo.volcado.cerrar(mundo, memoria);
        if (nuevo != null) anotar(mundo, "la región quedó de otro material");
      }
      if (mundo.volcado.activo && mundo.volcado.activo !== estado.volcadoSonado) {
        estado.volcadoSonado = mundo.volcado.activo;
        sonido.volcado();
      }

      var it = mundo.disposicion.interior("CAMARA");
      if (it && mundo.ultimoTrazado && !mundo.detenido) {
        mundo.condensacion.actualizar(ahora, estado.quietoDesde, mundo.ultimoTrazado, it, mundo);
        if (mundo.condensacion.estado === "condensando") sonido.callar(400);
      }

      componer(mundo, rej, ahora, {
        cursor: estado.cursor,
        rasgosAbiertos: estado.rasgosAbiertos,
        ayudaAbierta: estado.ayudaAbierta,
        sonido: sonido.encendido,
        reducido: reducido,
        tactil: !mqFino.matches
      });
      pintor.pintar(rej, ahora);

      if (ahora - mundo.ultimoDeterioro > 20000) {
        mundo.ultimoDeterioro = ahora;
        memoria.deteriorar();
      }
      if (ahora - estado.ultimoGuardado > 5000) {
        estado.ultimoGuardado = ahora;
        guardar();
        prepararImpresion();   /* el papel siempre tiene algo que decir */
      }
      actualizarEspejo();
    }

    /* ------------------------- arranque ------------------------- */
    medir();
    recordar(mundo);
    anotar(mundo, "semilla " + semilla);
    anotar(mundo, mundo.lab.arquitectura.nombre + ", " + mundo.paleta.nombre);
    actualizarEspejo(true);
    prepararImpresion();

    /* la métrica de la celda depende de la fuente: hay que remedir al cargarla */
    if (doc.fonts && doc.fonts.load) {
      Promise.all([
        doc.fonts.load(mundo.fuente.base + "px " + mundo.fuente.familia, "█"),
        doc.fonts.load(mundo.fuente.base + "px mtUnscii", "🬀")
      ]).then(function () { medir(); }, function () { medir(); });
    }

    var alRedimensionar = function () { medir(); };  /* el laberinto no se regenera: se re-encuadra */
    root.addEventListener("resize", alRedimensionar, { passive: true });
    doc.addEventListener("keydown", tecla);
    lienzo.addEventListener("pointerdown", abajo);
    lienzo.addEventListener("pointermove", movido);
    lienzo.addEventListener("pointerup", arriba);
    lienzo.addEventListener("pointercancel", arriba);
    lienzo.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    root.addEventListener("beforeprint", prepararImpresion);
    root.addEventListener("beforeunload", guardar);
    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) { sonido.callar(60000); guardar(); }
      else { pintor.invalidar(); sonido.callar(0); }
    });
    if (mqMov.addEventListener) {
      mqMov.addEventListener("change", function (e) {
        reducido = e.matches;
        pintor.reducido = reducido;
        mundo.condensacion.reducido = reducido;
      });
    }
    lienzo.setAttribute("tabindex", "0");
    lienzo.focus();
    pendiente = root.requestAnimationFrame(bucle);
  }

  var api = {
    crearMundo: crearMundo, componer: componer, generarNivel: generarNivel,
    rasgosDe: rasgosDe, detectarSesgo: detectarSesgo, frase: frase,
    girar: girar, caminar: caminar, casillaAdelante: casillaAdelante,
    casillaLateral: casillaLateral, interpolar: interpolar, tocar: tocar,
    frotar: frotar, erosionar: erosionar, bajar: bajar, anotar: anotar,
    monumentoEn: monumentoEn,
    FUENTES: FUENTES, ANOMALIAS: ANOMALIAS, SESGOS: SESGOS,
    nuevaSemilla: nuevaSemilla, iniciar: iniciar
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_APP = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();
  }
})(typeof window !== "undefined" ? window : globalThis);
