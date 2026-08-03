/*
  esculturas.js — los cuerpos de lasletras, sembrados por los corredores.

  `lasletras/` (ESPACIO ESCULTÓRICO) no guarda sólo la lámina proyectada:
  cada punto de su superficie conserva `rawX`, `rawY` y `z` —la nube antes de
  proyectar— y el glifo con el que está escrito. O sea que sus esculturas ya
  son volumen, y su materia ya es tipográfica. Aquí no se les inventa la
  tercera dimensión: se deja de aplanarlas.

  Entran como monumentos dispersos: fragmentos de una escultura repartidos por
  el laberinto, en los cruces y en los fondos de callejón. Son **atravesables**
  —pura aparición, se ven y no se tocan—, así que no alteran el trazado ni la
  conectividad. Caminar a través de una es parte de la pieza.

  Si `lasletras/` no está (la obra abierta suelta), no hay monumentos y todo lo
  demás sigue en pie.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;

  var ALTO_VOXEL = 0.25;      /* cada capa mide un cuarto de la altura de un muro */
  var RES = 6;                /* resolución horizontal dentro de la casilla */
  var CAPAS_MAX = 20;         /* cinco unidades de mundo como techo */

  function motor() { return root.ARQ_MOTOR || null; }

  /* ---- fragmentar: una escultura se rompe en cuerpos repartibles ---- */
  function fragmentos(rng, semilla, cuantos) {
    var M = motor();
    if (!M) return [];
    var crudos = [];
    /*
      Una sola construcción por nivel: la escultura se rompe en fragmentos
      (ver partir) y de ahí salen todos los cuerpos. Sale más barato y además
      es más cierto: los monumentos de un nivel son pedazos de la misma pieza.
    */
    var construcciones = 1;
    for (var b = 0; b < construcciones; b += 1) {
      var pieza;
      try { pieza = M.build({ seed: semilla + ":escultura:" + b }); }
      catch (e) { continue; }
      if (!pieza || !pieza.surface || !pieza.surface.length) continue;
      var porCuerpo = {};
      pieza.surface.forEach(function (p) {
        if (!isFinite(p.rawX) || !isFinite(p.rawY) || !isFinite(p.z)) return;
        var k = p.body || "solo";
        (porCuerpo[k] || (porCuerpo[k] = [])).push(p);
      });
      Object.keys(porCuerpo).forEach(function (k) {
        partir(porCuerpo[k], k, pieza, crudos);
      });
    }
    return crudos;
  }

  /*
    partir — un cuerpo grande se corta por su eje más largo. No es una
    concesión técnica: es el obelisco roto del catálogo de lasletras,
    repartido por el laberinto en vez de apilado en una lámina.
  */
  function partir(puntos, nombre, pieza, salida) {
    var caja = extremos(puntos);
    var anchoX = caja.x1 - caja.x0, anchoY = caja.y1 - caja.y0;
    var cortes = puntos.length > 900 ? 4 : (puntos.length > 380 ? 2 : 1);
    if (cortes === 1) {
      salida.push({ puntos: puntos, nombre: nombre, pieza: pieza });
      return;
    }
    var porX = anchoX >= anchoY;
    var lo = porX ? caja.x0 : caja.y0;
    var span = Math.max(1e-6, porX ? anchoX : anchoY);
    var cubos = [];
    for (var i = 0; i < cortes; i += 1) cubos.push([]);
    puntos.forEach(function (p) {
      var t = ((porX ? p.rawX : p.rawY) - lo) / span;
      var i = Math.min(cortes - 1, Math.max(0, Math.floor(t * cortes)));
      cubos[i].push(p);
    });
    cubos.forEach(function (c, i) {
      if (c.length < 24) return;
      salida.push({ puntos: c, nombre: nombre + " " + (i + 1) + "/" + cortes, pieza: pieza });
    });
  }

  function extremos(puntos) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (var i = 0; i < puntos.length; i += 1) {
      var p = puntos[i];
      if (p.rawX < x0) x0 = p.rawX;
      if (p.rawX > x1) x1 = p.rawX;
      if (p.rawY < y0) y0 = p.rawY;
      if (p.rawY > y1) y1 = p.rawY;
      if (p.z < z0) z0 = p.z;
      if (p.z > z1) z1 = p.z;
    }
    return { x0: x0, x1: x1, y0: y0, y1: y1, z0: z0, z1: z1 };
  }

  /*
    voxelar — la nube se mete en una caja de RES×RES×capas dentro de una
    casilla del laberinto. Cada vóxel se queda con el glifo del punto que
    cayó en él: la escultura sigue estando escrita.
  */
  function voxelar(frag, rng) {
    var puntos = frag.puntos;
    var caja = extremos(puntos);
    var anchoX = Math.max(1e-6, caja.x1 - caja.x0);
    var anchoY = Math.max(1e-6, caja.y1 - caja.y0);
    var anchoZ = Math.max(1e-6, caja.z1 - caja.z0);

    /* menos monumental, más frecuente: entre una y cuatro alturas de muro */
    var alto = rng.float(1.1, 4.0);
    var capas = Math.max(3, Math.min(CAPAS_MAX, Math.round(alto / ALTO_VOXEL)));
    var n = RES * RES * capas;
    var vox = new Uint8Array(n);
    var glifo = new Uint32Array(n);
    var cuenta = 0;

    for (var i = 0; i < puntos.length; i += 1) {
      var p = puntos[i];
      var ix = Math.min(RES - 1, Math.floor(((p.rawX - caja.x0) / anchoX) * RES));
      var iy = Math.min(RES - 1, Math.floor(((p.rawY - caja.y0) / anchoY) * RES));
      var iz = Math.min(capas - 1, Math.floor(((p.z - caja.z0) / anchoZ) * capas));
      var k = (iz * RES + iy) * RES + ix;
      if (!vox[k]) cuenta += 1;
      vox[k] = 1;
      var g = String(p.glyph || "·");
      glifo[k] = g.codePointAt(0) || 46;
    }
    if (cuenta < 8) return null;
    return {
      vox: vox, glifo: glifo, capas: capas, res: RES,
      alto: capas * ALTO_VOXEL,
      nombre: frag.nombre,
      especie: (frag.pieza && frag.pieza.meta && (frag.pieza.meta.species || frag.pieza.meta.speciesKey)) || "body",
      llenos: cuenta
    };
  }

  /* largo de la recta despejada que atraviesa una casilla en una dirección */
  function recta(lab, x, y, dx, dy) {
    var n = 1, k;
    for (k = 1; k < 24 && lab.aire(x + dx * k, y + dy * k); k += 1) n += 1;
    for (k = 1; k < 24 && lab.aire(x - dx * k, y - dy * k); k += 1) n += 1;
    return n;
  }

  /* ---- sembrar: dónde se los encuentra uno al doblar ---- */
  function sembrar(mundo, rng) {
    var mapa = {};
    var lista = [];
    if (!motor()) return { mapa: mapa, lista: lista, disponible: false };

    var lab = mundo.lab;
    var transitables = lab.casillasAbiertas();
    /*
      Uno por cada dieciocho casillas transitables. Con cuatro o nueve por
      mundo se podían caminar trescientos pasos sin ver ninguno: no eran
      monumentos dispersos, eran monumentos ausentes.
    */
    var cuantos = Math.max(12, Math.round(transitables.length / 18));
    var crudos = fragmentos(rng, mundo.semilla + ":" + mundo.nivel, cuantos);
    if (!crudos.length) return { mapa: mapa, lista: lista, disponible: false };
    rng.shuffle(crudos);

    /*
      Dónde se los ve. Un cuerpo en un pasillo largo se ve desde lejos; el
      mismo cuerpo en un fondo de callejón sólo existe si vas a dar con él.
      Se puntúa cada casilla por la longitud de la recta despejada que la
      atraviesa, y se siembra sobre todo en las líneas de visión. Quedan
      algunos al fondo de un callejón, porque encontrarse uno ahí vale.
    */
    var sitios = [];
    for (var i = 0; i < transitables.length; i += 1) {
      var x = transitables[i][0], y = transitables[i][1];
      if (lab.esUmbral(x, y)) continue;
      if (x === mundo.pos.x && y === mundo.pos.y) continue;
      var salidas = 0;
      if (lab.aire(x - 1, y)) salidas += 1;
      if (lab.aire(x + 1, y)) salidas += 1;
      if (lab.aire(x, y - 1)) salidas += 1;
      if (lab.aire(x, y + 1)) salidas += 1;
      var vista = recta(lab, x, y, 1, 0) + recta(lab, x, y, 0, 1);
      /* el desempate lo pone la semilla, no el orden del barrido */
      sitios.push({ x: x, y: y, fondo: salidas === 1, puntos: vista + rng.float(0, 3) });
    }
    if (!sitios.length) return { mapa: mapa, lista: lista, disponible: false };
    sitios.sort(function (a, b) { return b.puntos - a.puntos; });

    var fondos = sitios.filter(function (c) { return c.fondo; });
    var vistas = sitios.filter(function (c) { return !c.fondo; });
    var orden = [];
    for (var k = 0; k < sitios.length; k += 1) {
      /* una de cada cinco va a dar a un callejón; el resto, a la vista */
      var deFondo = (k % 5 === 4) && fondos.length;
      var elegido = deFondo ? fondos.shift() : (vistas.shift() || fondos.shift());
      if (!elegido) break;
      orden.push([elegido.x, elegido.y]);
    }
    var sitiosFinales = orden;

    var tintas = [1, 2, 3, 4, 5, 6, 15];
    for (var j = 0, s = 0; j < cuantos && s < sitiosFinales.length && crudos.length; j += 1) {
      var cuerpo = voxelar(crudos[j % crudos.length], rng);
      if (!cuerpo) continue;
      var sitio = null;
      while (s < sitiosFinales.length) {
        var cand = sitiosFinales[s]; s += 1;
        if (!mapa[cand[1] * lab.W + cand[0]]) { sitio = cand; break; }
      }
      if (!sitio) break;
      cuerpo.x = sitio[0];
      cuerpo.y = sitio[1];
      cuerpo.tinta = rng.pick(tintas);
      cuerpo.id = j;
      mapa[sitio[1] * lab.W + sitio[0]] = cuerpo;
      lista.push(cuerpo);
    }
    return { mapa: mapa, lista: lista, disponible: true };
  }

  /*
    columna — qué vóxeles atraviesa un rayo dentro de la casilla del cuerpo.
    Devuelve, de arriba abajo, las capas ocupadas y su glifo.
  */
  function columna(cuerpo, ux, uy) {
    var ix = Math.min(cuerpo.res - 1, Math.max(0, Math.floor(ux * cuerpo.res)));
    var iy = Math.min(cuerpo.res - 1, Math.max(0, Math.floor(uy * cuerpo.res)));
    var base = iy * cuerpo.res + ix;
    var out = null;
    for (var iz = 0; iz < cuerpo.capas; iz += 1) {
      var k = iz * cuerpo.res * cuerpo.res + base;
      if (!cuerpo.vox[k]) continue;
      (out || (out = [])).push({ z: iz, glifo: cuerpo.glifo[k] });
    }
    return out;
  }

  var api = {
    sembrar: sembrar, columna: columna, voxelar: voxelar, fragmentos: fragmentos,
    ALTO_VOXEL: ALTO_VOXEL, RES: RES, disponible: function () { return !!motor(); }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_ESCULTURAS = api;
})(typeof window !== "undefined" ? window : globalThis);
