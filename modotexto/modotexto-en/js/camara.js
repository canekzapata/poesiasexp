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

  /*
    DDA: devuelve distancia, casilla golpeada, cara y coordenada sobre el muro.
    Si se le pasa el mapa de monumentos, anota además cada cuerpo que el rayo
    atraviesa antes del muro, con su distancia de entrada y el punto medio de
    la travesía: son atravesables, así que no detienen el rayo.
  */
  function rayo(lab, px, py, ang, limite, monumentos, cruces) {
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
      if (monumentos && cruces) {
        var cuerpo = monumentos[my * lab.W + mx];
        if (cuerpo) {
          var entrada = cara === 0 ? ladoX - deltaX : ladoY - deltaY;
          var salida = Math.min(ladoX, ladoY);
          var medio = (entrada + salida) / 2;
          cruces.push({
            cuerpo: cuerpo,
            dist: Math.max(0.05, entrada),
            ux: (px + dx * medio) - mx,
            uy: (py + dy * medio) - my
          });
        }
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

    var monumentos = mundo.monumentos ? mundo.monumentos.mapa : null;
    var cruces = [];

    for (var c = 0; c < rect.w; c += 1) {
      var a = ang - FOV / 2 + FOV * ((c + 0.5) / rect.w);
      cruces.length = 0;
      var r = rayo(lab, px, py, a, MAX_DIST, monumentos, cruces);
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
      if (cruces.length) {
        gastado += monumento(rej, rect, cruces, dperp, horizonte, alturaBase, c, presupuesto - gastado);
      }
    }
    var salida = { columnas: columnas, horizonte: horizonte, gastadoLexico: gastado };
    /* los celadores se pintan al final: necesitan toda la columna para saber
       qué muro los tapa */
    if (mundo.ronda) celadores(rej, rect, mundo, salida, alturaBase);
    return salida;
  }

  /*
    monumento — pinta los cuerpos de lasletras que el rayo atravesó, de lejos
    a cerca, y sólo por delante del muro. En vez de proyectar cada vóxel a
    filas, se recorre la columna de la pantalla y se pregunta a qué altura del
    mundo mira cada fila: así no quedan huecos cuando un cuerpo está lejos.

    El ojo va a media altura del muro; un muro mide una unidad.
  */
  var OJO = 0.5;

  function monumento(rej, rect, cruces, distMuro, horizonte, alturaBase, c, presupuesto) {
    var ESC = root.MT_ESCULTURAS;
    if (!ESC) return 0;
    var gastado = 0;
    cruces.sort(function (a, b) { return b.dist - a.dist; });
    for (var i = 0; i < cruces.length; i += 1) {
      var cr = cruces[i];
      if (cr.dist >= distMuro) continue;              /* el muro lo tapa */
      var paso = MAT.peldano(cr.dist);
      if (paso >= 5) continue;                        /* demasiado lejos: se pierde */
      var pila = ESC.columna(cr.cuerpo, cr.ux, cr.uy);
      if (!pila) continue;
      var ocupadas = {};
      for (var k = 0; k < pila.length; k += 1) ocupadas[pila[k].z] = pila[k].glifo;

      var altura = cr.cuerpo.capas * ESC.ALTO_VOXEL;
      var filaAlta = Math.floor(horizonte - alturaBase * (altura - OJO) / cr.dist);
      var filaBaja = Math.ceil(horizonte + alturaBase * OJO / cr.dist);
      filaAlta = Math.max(rect.y, filaAlta);
      filaBaja = Math.min(rect.y + rect.h - 1, filaBaja);
      var papel = Math.max(0, 6 - paso);

      for (var fila = filaAlta; fila <= filaBaja; fila += 1) {
        var z = OJO + (horizonte - fila) * cr.dist / alturaBase;
        var iz = Math.floor(z / ESC.ALTO_VOXEL);
        var g = ocupadas[iz];
        if (g === undefined) continue;
        /*
          El cuerpo conserva su propia grafía mientras se pueda distinguir;
          más allá se rinde a la misma rampa de niebla que todo lo demás.
        */
        var ch;
        if (paso <= 2) ch = String.fromCodePoint(g);
        else if (paso === 3) ch = "░";
        else ch = "·";
        var esLetra = paso <= 2 && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(ch);
        if (esLetra) {
          if (gastado >= presupuesto) continue;       /* la regla de proporción manda */
          gastado += 1;
        }
        rej.set(rect.x + c, fila, ch, cr.cuerpo.tinta | (paso <= 2 ? 8 : 0), papel, 0,
          paso <= 2 ? ORIGEN.ESCULTURA : ORIGEN.MURO);
      }
    }
    return gastado;
  }

  /*
    celadores — no son volumen, son signo: se pintan como una estampa plana
    encarada al visitante, del tamaño que les toca por distancia. Un muro más
    cercano los tapa. Su glifo es el palimpsesto entero, cuatro caracteres en
    una celda, y por eso va por la capa de compuestas de la rejilla.
  */
  function celadores(rej, rect, mundo, trazado, alturaBase) {
    var vivos = mundo.ronda.vivos();
    if (!vivos.length) return;
    var px = mundo.vista.x, py = mundo.vista.y, ang = mundo.vista.ang;
    var horizonte = trazado.horizonte;
    /* de lejos a cerca, para que el de adelante gane la celda */
    var orden = vivos.map(function (c) {
      var dx = c.x + 0.5 - px, dy = c.y + 0.5 - py;
      return { c: c, dx: dx, dy: dy, d: Math.sqrt(dx * dx + dy * dy) };
    }).sort(function (a, b) { return b.d - a.d; });

    for (var i = 0; i < orden.length; i += 1) {
      var o = orden[i];
      if (o.d > 15 || o.d < 0.05) continue;
      var delta = Math.atan2(o.dy, o.dx) - ang;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > FOV * 0.62) continue;
      var dperp = Math.max(0.12, o.d * Math.cos(delta));
      var centro = ((delta + FOV / 2) / FOV) * rect.w - 0.5;
      /*
        Miden casi lo que un muro, y nunca menos de dos por tres celdas: algo
        que hay que alcanzar tiene que verse desde el otro lado del pasillo.
      */
      var tam = alturaBase * 0.9 / dperp;
      var alto = Math.max(3, Math.min(rect.h, Math.round(tam)));
      var ancho = Math.max(2, Math.min(rect.w, Math.round(tam * 0.62)));
      var x0 = Math.round(centro - (ancho - 1) / 2);
      var y0 = Math.round(horizonte - alto / 2);
      var papel = Math.max(0, 6 - MAT.peldano(dperp));
      var signos = o.c.signos;

      for (var fy = 0; fy < alto; fy += 1) {
        for (var fx = 0; fx < ancho; fx += 1) {
          var cx = rect.x + x0 + fx, cy = y0 + fy;
          if (cx < rect.x || cx >= rect.x + rect.w) continue;
          if (cy < rect.y || cy >= rect.y + rect.h) continue;
          var col = trazado.columnas[x0 + fx];
          if (col && !col.fuera && col.dist < dperp) continue;   /* lo tapa el muro */
          /* los cuatro signos se reparten para que el bloque no sea un tapiz */
          var k = (fx + fy * 3 + o.c.id) % signos.length;
          rej.set(cx, cy, signos[k], o.c.tinta | 8, papel, 0, ORIGEN.CELADOR);
        }
      }
    }
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
    monumento: monumento, celadores: celadores, OJO: OJO,
    MAX_DIST: MAX_DIST, FOV: FOV, RAMPA_PISO: RAMPA_PISO, RAMPA_CIELO: RAMPA_CIELO
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_CAMARA = api;
})(typeof window !== "undefined" ? window : globalThis);
