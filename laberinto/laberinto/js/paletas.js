/*
  paletas.js — color generativo
  poesiasexp / laberinto

  cada pagina tiene una identidad cromatica distinta. entre 3 y 12 colores
  activos. el color puede decidir navegacion (esa gramatica tambien muta).
  familias: mono, bi, complementaria, analoga, rgb, cmyk, pastel, acida,
  oscura, blanca, saturada, terminal. sin paleta de marca, sin fondos serios
  por miedo al color.

  isomorfo: node + navegador.
*/
(function () {
  'use strict';

  var FAMILIAS = ['mono', 'bi', 'complementaria', 'analoga', 'triada', 'rgb',
    'cmyk', 'pastel', 'acida', 'oscura', 'blanca', 'saturada', 'terminal', 'ceniza'];

  function hsl(h, s, l) {
    return 'hsl(' + ((h % 360 + 360) % 360).toFixed(0) + ',' + s.toFixed(0) + '%,' + l.toFixed(0) + '%)';
  }
  // luminancia relativa aproximada de un hsl (para elegir contraste)
  function claro(l) { return l > 55; }

  function generar(rng, familiaForzada) {
    var fam = familiaForzada || rng.pick(FAMILIAS);
    var base = rng.int(0, 359);
    var cols = [];
    var fondoL, tintaL, sat;

    switch (fam) {
      case 'mono':
        sat = rng.int(30, 95);
        for (var i = 0; i < rng.int(4, 8); i++) cols.push(hsl(base, sat, 8 + i * 11));
        break;
      case 'bi': {
        var h2 = (base + rng.int(150, 210)) % 360;
        for (var b = 0; b < 3; b++) cols.push(hsl(base, rng.int(55, 95), 25 + b * 22));
        for (var b2 = 0; b2 < 3; b2++) cols.push(hsl(h2, rng.int(55, 95), 30 + b2 * 22));
        break;
      }
      case 'complementaria':
        cols.push(hsl(base, 85, 50), hsl(base + 180, 85, 50), hsl(base, 40, 15),
          hsl(base + 180, 40, 85), hsl(base, 70, 30), hsl(base + 180, 70, 70));
        break;
      case 'analoga':
        for (var a = 0; a < 7; a++) cols.push(hsl(base + a * 18 - 54, rng.int(50, 90), rng.int(30, 70)));
        break;
      case 'triada':
        for (var tr = 0; tr < 3; tr++)
          for (var tl = 0; tl < 2; tl++) cols.push(hsl(base + tr * 120, 80, 30 + tl * 35));
        break;
      case 'rgb':
        cols = ['#ff0000', '#00ff00', '#0000ff', '#000000', '#ffffff', '#ffff00', '#00ffff', '#ff00ff'];
        rng.shuffle(cols);
        break;
      case 'cmyk':
        cols = ['#00aeef', '#ec008c', '#fff200', '#000000', '#ffffff', '#231f20'];
        break;
      case 'pastel':
        for (var p = 0; p < 8; p++) cols.push(hsl(rng.int(0, 359), rng.int(35, 60), rng.int(78, 92)));
        break;
      case 'acida':
        for (var ac = 0; ac < 6; ac++) cols.push(hsl(rng.pick([80, 120, 160, 300, 330, 55]), 100, rng.int(48, 62)));
        break;
      case 'oscura':
        for (var o = 0; o < 6; o++) cols.push(hsl(base + o * 12, rng.int(20, 70), rng.int(6, 22)));
        break;
      case 'blanca':
        for (var w = 0; w < 6; w++) cols.push(hsl(base, rng.int(0, 12), rng.int(86, 100)));
        cols.push(hsl(base, 30, 20));
        break;
      case 'saturada':
        for (var s2 = 0; s2 < 8; s2++) cols.push(hsl(rng.int(0, 359), 100, 50));
        break;
      case 'terminal':
        var tint = rng.pick([120, 90, 30, 200, 300]);
        cols = ['#000000', hsl(tint, 100, 50), hsl(tint, 100, 35), hsl(tint, 60, 70), '#0a0a0a', hsl(tint, 100, 65)];
        break;
      default: // ceniza
        for (var c = 0; c < 7; c++) cols.push(hsl(base, rng.int(2, 14), rng.int(12, 88)));
    }

    // fondo y tinta con contraste asegurado
    var oscuras = cols.filter(function (c) { return c.indexOf('%') > 0 ? parseInt(c.split(',')[2]) < 45 : true; });
    var fondo, tinta;
    if (fam === 'oscura' || fam === 'terminal' || rng.chance(0.5)) {
      fondo = rng.pick(cols.filter(esOscuro)) || '#0c0c10';
      tinta = rng.pick(cols.filter(esClaro)) || '#f4f4ef';
    } else {
      fondo = rng.pick(cols.filter(esClaro)) || '#f4f4ef';
      tinta = rng.pick(cols.filter(esOscuro)) || '#101014';
    }
    var acento = rng.pick(cols.filter(function (c) { return c !== fondo && c !== tinta; })) || tinta;
    var borde = rng.pick(cols) || acento;

    return {
      familia: fam,
      base: base,
      colores: cols,
      fondo: fondo,
      tinta: tinta,
      acento: acento,
      borde: borde,
      // color-> uso semantico (mutable, pero de arranque):
      enlace: acento,
      visitado: rng.pick(cols) || acento
    };
  }

  function nivel(c) {
    // aproxima luminosidad 0..100
    if (c[0] === '#') {
      var n = c.length === 4
        ? [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16)]
        : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
      return (0.299 * n[0] + 0.587 * n[1] + 0.114 * n[2]) / 255 * 100;
    }
    var m = /hsl\([^,]+,[^,]+,\s*([\d.]+)%/.exec(c);
    return m ? parseFloat(m[1]) : 50;
  }
  function esOscuro(c) { return nivel(c) < 45; }
  function esClaro(c) { return nivel(c) >= 55; }

  var api = { generar: generar, FAMILIAS: FAMILIAS, hsl: hsl, nivel: nivel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') { window.PALETAS = api; }
})();
