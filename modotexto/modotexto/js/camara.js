/*
  camara.js — trazador de rayos en modo texto.

  Un rayo por columna de celdas (DDA sobre la rejilla del laberinto).
  La distancia se traduce en altura de columna y en densidad de signo:
  la niebla no es un degradado, es una rampa de caracteres.

  Conflicto de color, resuelto explícitamente:
    la TINTA dice de qué está hecho el muro,
    el PAPEL dice a qué distancia está.
*/
(function (root) {
  "use strict";

  var REJ = root.MT_REJILLA;
  var MAT = root.MT_MATERIALES;
  var ORIGEN = REJ.ORIGEN;

  /*
    Suelo y techo tienen rampas propias y más cortas, para que el horizonte
    quede claro sin dibujar una línea. El techo es la parte menos informada
    del cuarto: la oscuridad aquí es falta de datos, no color negro.
  */
  var RAMPA_PISO = ["▒", "░", "∙", "·", " "];
  var RAMPA_CIELO = ["·", " "];
  var MAX_DIST = 24;
  var FOV = Math.PI / 3;

  /* el papel dice la distancia: seis escalones, los mismos que la rampa de signos */
  function bandaPapel(dist) {
    return Math.max(0, 6 - MAT.peldano(dist));
  }

  /* DDA: devuelve distancia, casilla golpeada, cara y coordenada sobre el muro */
  function rayo(lab, px, py, ang, limite) {
    var dx = Math.cos(ang), dy = Math.sin(ang);
    var mx = Math.floor(px), my = Math.floor(py);
    var deltaX = Math.abs(dx) < 1e-9 ? 1e9 : Math.abs(1 / dx);
    var deltaY = Math.abs(dy) < 1e-9 ? 1e9 : Math.abs(1 / dy);
    var pasoX, pasoY, ladoX, ladoY;
    if (dx < 0) { pasoX = -1; ladoX = (px - mx) * deltaX; }
    else { pasoX = 1; ladoX = (mx + 1 - px) * deltaX; }
    if (dy < 0) { pasoY = -1; ladoY = (py - my) * deltaY; }
    else { pasoY = 1; ladoY = (my + 1 - py) * deltaY; }
    var cara = 0, golpe = false, giros = 0;
    while (!golpe && giros < 512) {
      giros += 1;
      if (ladoX < ladoY) { ladoX += deltaX; mx += pasoX; cara = 0; }
      else { ladoY += deltaY; my += pasoY; cara = 1; }
      if (mx < 0 || my < 0 || mx >= lab.W || my >= lab.H) {
        return { dist: limite, x: mx, y: my, cara: cara, u: 0, fuera: true };
      }
      if (lab.casillas[my * lab.W + mx] === 1) golpe = true;
      if ((cara === 0 ? ladoX - deltaX : ladoY - deltaY) > limite) {
        return { dist: limite, x: mx, y: my, cara: cara, u: 0, fuera: true };
      }
    }
    var dist = cara === 0 ? (ladoX - deltaX) : (ladoY - deltaY);
    var u = cara === 0 ? (py + dist * dy) : (px + dist * dx);
    u = u - Math.floor(u);
    return { dist: Math.max(0.05, dist), x: mx, y: my, cara: cara, u: u, fuera: false };
  }

  /*
    trazar — pinta el interior del panel CÁMARA dentro de la rejilla.
    opts.presupuestoLexico limita cuántas celdas pueden volverse lenguaje:
    es la regla de proporción hecha código.
  */
  function trazar(mundo, rej, rect, opts) {
    opts = opts || {};
    var lab = mundo.lab;
    var px = mundo.vista.x, py = mundo.vista.y, ang = mundo.vista.ang;
    var horizonte = rect.y + Math.max(1, Math.min(rect.h - 2,
      Math.round(rect.h * (0.5 + (mundo.horizonte || 0)))));
    var alturaBase = rect.h * 0.92;
    var presupuesto = opts.presupuestoLexico == null ? 0 : opts.presupuestoLexico;
    var gastado = 0;
    var columnas = new Array(rect.w);
    var tintaPiso = opts.tintaPiso == null ? 8 : opts.tintaPiso;
    var tintaCielo = opts.tintaCielo == null ? 8 : opts.tintaCielo;

    for (var c = 0; c < rect.w; c += 1) {
      var a = ang - FOV / 2 + FOV * ((c + 0.5) / rect.w);
      var r = rayo(lab, px, py, a, MAX_DIST);
      var dperp = Math.max(0.08, r.dist * Math.cos(a - ang));
      var altura = Math.min(rect.h * 3, Math.round(alturaBase / dperp));
      var arriba = horizonte - (altura >> 1);
      var abajo = arriba + altura - 1;
      var mat = r.fuera ? lab.material(0, 0) : lab.material(r.x, r.y);
      var trama = mundo.tramas ? mundo.tramas[mat.id] : null;
      var idxCas = r.fuera ? -1 : r.y * lab.W + r.x;
      var escritura = idxCas >= 0 ? mundo.escrituras[idxCas] : null;
      var inscripcion = idxCas >= 0 ? lab.inscripciones[idxCas] : null;
      var roto = idxCas >= 0 && lab.roto[idxCas];
      var papel = bandaPapel(dperp);
      columnas[c] = { dist: dperp, mat: mat, cara: r.cara, x: r.x, y: r.y, fuera: r.fuera, arriba: arriba, abajo: abajo };

      var uCol = Math.floor(r.u * 8);
      for (var fila = rect.y; fila < rect.y + rect.h; fila += 1) {
        var x = rect.x + c;
        if (fila < arriba) {
          /* cielo: rampa corta, para que el horizonte quede claro */
          var dc = (horizonte - fila) / Math.max(1, rect.h * 0.5);
          var ic = Math.min(RAMPA_CIELO.length - 1, Math.floor(dc * RAMPA_CIELO.length));
          rej.set(x, fila, RAMPA_CIELO[RAMPA_CIELO.length - 1 - ic], tintaCielo, 0, 0, ORIGEN.CIELO);
        } else if (fila > abajo) {
          var dp = (fila - horizonte) / Math.max(1, rect.h * 0.5);
          var ip = Math.min(RAMPA_PISO.length - 1, Math.floor((1 - Math.min(1, dp)) * RAMPA_PISO.length));
          var chp = RAMPA_PISO[ip];
          rej.set(x, fila, chp, tintaPiso, Math.max(0, 2 - ip), 0, ORIGEN.PISO);
        } else {
          var v = altura > 0 ? (fila - arriba) / altura : 0;
          var ch, tinta = mat.tinta, attr = 0, origen = ORIGEN.MURO;
          if (inscripcion && dperp < 9) {
            /* una sola palabra ilegible ocupando toda la altura del muro */
            var glifos = inscripcion.glifos;
            ch = glifos[Math.min(glifos.length - 1, Math.floor(v * glifos.length))];
            tinta = mat.tinta | 8;
            origen = ORIGEN.INSCRIPCION;
          } else if (escritura && dperp < 4.2 && gastado < presupuesto) {
            /* muro escrito: la trama se sustituye por lenguaje deformado */
            /*
              La perspectiva deforma el texto: cada hilera del muro muestrea
              la frase con otro paso, de modo que se ve que es lenguaje y casi
              nunca se puede leer. El espacio se sustituye por grano: un muro
              escrito no tiene junturas de palabra.
            */
            var texto = escritura.texto;
            var vi = Math.floor(v * escritura.alto);
            var ui = Math.floor(r.u * escritura.ancho);
            var paso = 3 + (vi % 4);
            var k = ((vi * 5 + ui * paso) % texto.length + texto.length) % texto.length;
            ch = texto.charAt(k);
            if (ch === " ") ch = mat.grano.charAt(k % mat.grano.length);
            else gastado += 1;
            origen = ORIGEN.LEXICO;
          } else {
            ch = MAT.signo(mat, dperp, MAX_DIST, r.cara === 1, trama, uCol + r.x, Math.floor(v * 12) + r.y);
          }
          if (roto) { tinta = mat.tinta | 8; if (v > 0.45 && v < 0.55) ch = "·"; }
          if (r.cara === 1) papel = Math.max(0, papel - 1);
          rej.set(x, fila, ch, tinta, papel, attr, origen);
        }
      }
    }
    return { columnas: columnas, horizonte: horizonte, gastadoLexico: gastado };
  }

  /* qué hay exactamente enfrente: para tocar el muro y para el espejo accesible */
  function frente(mundo) {
    var lab = mundo.lab;
    var dx = Math.round(Math.cos(mundo.dirAng));
    var dy = Math.round(Math.sin(mundo.dirAng));
    var x = mundo.pos.x + dx, y = mundo.pos.y + dy;
    return {
      x: x, y: y,
      macizo: lab.macizo(x, y),
      material: lab.macizo(x, y) ? lab.material(x, y) : null,
      roto: lab.dentro(x, y) ? !!lab.roto[y * lab.W + x] : false
    };
  }

  /* la columna del panel que apunta a una casilla dada (para clic en CÁMARA) */
  function columnaHacia(mundo, rect, cx) {
    var a = mundo.vista.ang - FOV / 2 + FOV * ((cx + 0.5) / rect.w);
    return a;
  }

  var api = {
    trazar: trazar, rayo: rayo, frente: frente, columnaHacia: columnaHacia,
    MAX_DIST: MAX_DIST, FOV: FOV, RAMPA_PISO: RAMPA_PISO, RAMPA_CIELO: RAMPA_CIELO
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_CAMARA = api;
})(typeof window !== "undefined" ? window : globalThis);
