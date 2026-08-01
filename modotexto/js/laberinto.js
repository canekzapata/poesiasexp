/*
  laberinto.js — el laberinto no es una metáfora, es una estructura de datos
  recorrible. Siete arquitecturas, cada una con su mano tipográfica.

  Convención: casillas[y*W+x] === 1 es macizo, 0 es aire.
  No hay salida. Hay profundidad.
*/
(function (root) {
  "use strict";

  var MAT = root.MT_MATERIALES;

  var ARQUITECTURAS = [
    { clave: "excavado",   nombre: "excavado",   material: "hollin",    peso: 3 },
    { clave: "tejido",     nombre: "tejido",     material: "sextante",  peso: 3 },
    { clave: "sesgado",    nombre: "sesgado",    material: "esquirla",  peso: 2 },
    { clave: "caverna",    nombre: "caverna",    material: "cuadrante", peso: 3 },
    { clave: "distritos",  nombre: "distritos",  material: "ladrillo",  peso: 2 },
    { clave: "concentrico",nombre: "concéntrico",material: "cal",       peso: 2 },
    { clave: "danado",     nombre: "dañado",     material: "papel",     peso: 2 }
  ];

  function Laberinto(opts) {
    this.W = opts.W; this.H = opts.H;
    this.rng = opts.rng;
    this.nivel = opts.nivel || 0;
    this.arquitectura = opts.arquitectura;
    this.porosidad = opts.porosidad || 0;   /* memoria: lo muy recorrido se abre */
    this.casillas = new Uint8Array(this.W * this.H).fill(1);
    this.mat = new Uint8Array(this.W * this.H);
    this.roto = new Uint8Array(this.W * this.H);
    this.desgaste = new Uint16Array(this.W * this.H);
    this.umbrales = [];
    this.inscripciones = {};
    this.letreros = {};
    this.distritos = null;
    this.danado = 0;
    this.construir();
  }

  var P = Laberinto.prototype;

  P.i = function (x, y) { return y * this.W + x; };
  P.dentro = function (x, y) { return x >= 0 && y >= 0 && x < this.W && y < this.H; };
  P.macizo = function (x, y) { return !this.dentro(x, y) || this.casillas[y * this.W + x] === 1; };
  P.aire = function (x, y) { return this.dentro(x, y) && this.casillas[y * this.W + x] === 0; };
  P.abrir = function (x, y) { if (this.dentro(x, y)) this.casillas[y * this.W + x] = 0; };
  P.cerrar = function (x, y) { if (this.dentro(x, y)) this.casillas[y * this.W + x] = 1; };
  P.material = function (x, y) {
    if (!this.dentro(x, y)) return MAT.MATERIALES[0];
    return MAT.MATERIALES[this.mat[y * this.W + x] % MAT.MATERIALES.length];
  };

  /* ---------------------------------------------------------------- */

  P.construir = function () {
    var clave = this.arquitectura.clave;
    var base = clave;
    if (clave === "danado") {
      var otras = ARQUITECTURAS.filter(function (a) { return a.clave !== "danado"; });
      base = this.rng.pick(otras).clave;
      this.baseDanada = base;
    }
    if (base === "excavado") this.excavado();
    else if (base === "tejido") this.tejido();
    else if (base === "sesgado") this.sesgado();
    else if (base === "caverna") this.caverna();
    else if (base === "distritos") this.distritosVoronoi();
    else this.concentrico();

    this.bordeSolido();
    this.trenzar(clave === "tejido" ? 0.32 : 0.16);
    if (this.porosidad > 0) this.trenzar(Math.min(0.3, this.porosidad));
    this.asegurarConexo();
    if (clave === "danado") this.danar();
    this.asegurarConexo();
    this.repartirMateriales();
    this.ponerUmbrales();
  };

  P.bordeSolido = function () {
    var x, y;
    for (x = 0; x < this.W; x += 1) { this.cerrar(x, 0); this.cerrar(x, this.H - 1); }
    for (y = 0; y < this.H; y += 1) { this.cerrar(0, y); this.cerrar(this.W - 1, y); }
  };

  /* --- EXCAVADO: corredores largos, pocos cruces, callejones profundos --- */
  P.excavado = function () {
    var rng = this.rng, W = this.W, H = this.H;
    var sx = 1 + 2 * rng.int(0, ((W - 2) / 2 | 0) - 1);
    var sy = 1 + 2 * rng.int(0, ((H - 2) / 2 | 0) - 1);
    var pila = [[sx, sy]];
    this.abrir(sx, sy);
    var dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];
    var ultima = null;
    while (pila.length) {
      var cur = pila[pila.length - 1];
      var libres = [];
      for (var d = 0; d < 4; d += 1) {
        var nx = cur[0] + dirs[d][0], ny = cur[1] + dirs[d][1];
        if (nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1 && this.macizo(nx, ny)) libres.push(d);
      }
      if (!libres.length) { pila.pop(); ultima = null; continue; }
      /* sesgo a seguir recto: corredores largos */
      var d2 = (ultima != null && libres.indexOf(ultima) >= 0 && rng.chance(0.72)) ? ultima : rng.pick(libres);
      var mx = cur[0] + dirs[d2][0] / 2, my = cur[1] + dirs[d2][1] / 2;
      this.abrir(mx, my);
      this.abrir(cur[0] + dirs[d2][0], cur[1] + dirs[d2][1]);
      pila.push([cur[0] + dirs[d2][0], cur[1] + dirs[d2][1]]);
      ultima = d2;
    }
  };

  /* --- TEJIDO: retícula pareja, muchas bifurcaciones cortas (Kruskal) --- */
  P.tejido = function () {
    var rng = this.rng, W = this.W, H = this.H;
    var cw = (W - 1) >> 1, chh = (H - 1) >> 1;
    var padre = new Int32Array(cw * chh);
    for (var k = 0; k < padre.length; k += 1) padre[k] = k;
    function raiz(a) { while (padre[a] !== a) { padre[a] = padre[padre[a]]; a = padre[a]; } return a; }
    var aristas = [];
    for (var cy = 0; cy < chh; cy += 1) {
      for (var cx = 0; cx < cw; cx += 1) {
        this.abrir(1 + cx * 2, 1 + cy * 2);
        if (cx < cw - 1) aristas.push([cy * cw + cx, cy * cw + cx + 1, 2 + cx * 2, 1 + cy * 2]);
        if (cy < chh - 1) aristas.push([cy * cw + cx, (cy + 1) * cw + cx, 1 + cx * 2, 2 + cy * 2]);
      }
    }
    rng.shuffle(aristas);
    for (var e = 0; e < aristas.length; e += 1) {
      var a = raiz(aristas[e][0]), b = raiz(aristas[e][1]);
      if (a === b) continue;
      padre[a] = b;
      this.abrir(aristas[e][2], aristas[e][3]);
    }
  };

  /* --- SESGADO: el mundo se inclina hacia una esquina (sidewinder) --- */
  P.sesgado = function () {
    var rng = this.rng, W = this.W, H = this.H;
    this.inclinacion = rng.pick(["NE", "NO", "SE", "SO"]);
    var haciaArriba = this.inclinacion[0] === "N";
    var haciaDerecha = this.inclinacion[1] === "E";
    for (var cy = 0; cy < (H - 1) >> 1; cy += 1) {
      var corrida = [];
      for (var cx = 0; cx < (W - 1) >> 1; cx += 1) {
        var x = 1 + cx * 2, y = 1 + cy * 2;
        this.abrir(x, y);
        corrida.push([x, y]);
        var enBorde = haciaDerecha ? (cx === ((W - 1) >> 1) - 1) : (cx === 0);
        var cerrar = enBorde || rng.chance(0.34);
        if (!cerrar) {
          this.abrir(x + (haciaDerecha ? 1 : -1), y);
          continue;
        }
        var pick = rng.pick(corrida);
        var vy = pick[1] + (haciaArriba ? -1 : 1);
        if (vy > 0 && vy < H - 1) { this.abrir(pick[0], vy); this.abrir(pick[0], pick[1] + (haciaArriba ? -2 : 2)); }
        corrida = [];
      }
    }
  };

  /* --- CAVERNA: cuartos orgánicos, regla 4-5 --- */
  P.caverna = function () {
    var rng = this.rng, W = this.W, H = this.H, x, y;
    var g = new Uint8Array(W * H);
    for (y = 0; y < H; y += 1) for (x = 0; x < W; x += 1) g[y * W + x] = rng.chance(0.46) ? 1 : 0;
    for (var paso = 0; paso < 5; paso += 1) {
      var n = new Uint8Array(W * H);
      for (y = 0; y < H; y += 1) {
        for (x = 0; x < W; x += 1) {
          var vecinos = 0;
          for (var dy = -1; dy <= 1; dy += 1) {
            for (var dx = -1; dx <= 1; dx += 1) {
              if (!dx && !dy) continue;
              var ax = x + dx, ay = y + dy;
              if (ax < 0 || ay < 0 || ax >= W || ay >= H) { vecinos += 1; continue; }
              vecinos += g[ay * W + ax];
            }
          }
          n[y * W + x] = vecinos >= 5 ? 1 : (vecinos <= 3 ? 0 : g[y * W + x]);
        }
      }
      g = n;
    }
    this.casillas = g;
  };

  /* --- DISTRITOS: barrios con material propio y frontera de una celda --- */
  P.distritosVoronoi = function () {
    var rng = this.rng, W = this.W, H = this.H, x, y;
    var cuantos = rng.int(4, 8);
    var focos = [];
    for (var k = 0; k < cuantos; k += 1) {
      focos.push({
        x: rng.int(2, W - 3), y: rng.int(2, H - 3),
        mat: rng.int(0, MAT.MATERIALES.length - 1)
      });
    }
    var mapa = new Int16Array(W * H);
    for (y = 0; y < H; y += 1) {
      for (x = 0; x < W; x += 1) {
        var mejor = 0, dm = Infinity;
        for (var f = 0; f < focos.length; f += 1) {
          var dx = x - focos[f].x, dy = y - focos[f].y;
          var d = dx * dx + dy * dy;
          if (d < dm) { dm = d; mejor = f; }
        }
        mapa[y * W + x] = mejor;
      }
    }
    this.distritos = { mapa: mapa, focos: focos };
    /* laberinto normal dentro, frontera maciza de un ancho, con vanos */
    this.excavado();
    for (y = 1; y < H - 1; y += 1) {
      for (x = 1; x < W - 1; x += 1) {
        var a = mapa[y * W + x];
        var frontera = (mapa[y * W + x + 1] !== a) || (mapa[(y + 1) * W + x] !== a);
        if (frontera) this.cerrar(x, y);
      }
    }
    /* un vano por par de distritos vecinos */
    var vistos = {};
    for (y = 1; y < H - 1; y += 1) {
      for (x = 1; x < W - 1; x += 1) {
        var b = mapa[y * W + x], c = mapa[y * W + x + 1];
        if (b === c) continue;
        var llave = Math.min(b, c) + ":" + Math.max(b, c);
        if (vistos[llave]) continue;
        if (!rng.chance(0.22)) continue;
        vistos[llave] = 1;
        this.abrir(x, y); this.abrir(x + 1, y); this.abrir(x - 1, y);
      }
    }
  };

  /* --- CONCÉNTRICO: anillos con vanos desalineados --- */
  P.concentrico = function () {
    var rng = this.rng, W = this.W, H = this.H, x, y;
    var cx = W >> 1, cy = H >> 1;
    for (y = 1; y < H - 1; y += 1) for (x = 1; x < W - 1; x += 1) this.abrir(x, y);
    var paso = rng.int(2, 3);
    var anillos = [];
    for (var r = paso; r < Math.max(W, H); r += paso) anillos.push(r);
    for (y = 1; y < H - 1; y += 1) {
      for (x = 1; x < W - 1; x += 1) {
        var d = Math.max(Math.abs(x - cx) * (H / W), Math.abs(y - cy));
        for (var a = 0; a < anillos.length; a += 1) {
          if (Math.abs(d - anillos[a]) < 0.5) { this.cerrar(x, y); break; }
        }
      }
    }
    /* vanos: uno o dos por anillo, en ángulos que nunca coinciden */
    anillos.forEach(function (r, idx) {
      var vanos = rng.int(1, 2);
      for (var v = 0; v < vanos; v += 1) {
        var ang = (idx * 1.618 + v * 0.5 + rng.float(0, 0.3)) * Math.PI * 2;
        for (var t = -1; t <= 1; t += 1) {
          var px = Math.round(cx + Math.cos(ang) * r * (W / H) + Math.cos(ang + Math.PI / 2) * t);
          var py = Math.round(cy + Math.sin(ang) * r + Math.sin(ang + Math.PI / 2) * t);
          this.abrir(px, py);
        }
      }
    }, this);
    if (rng.chance(0.5)) {
      for (y = cy - 2; y <= cy + 2; y += 1) for (x = cx - 3; x <= cx + 3; x += 1) this.abrir(x, y);
    }
  };

  /* --- DAÑADO: muros que no deberían existir, tratados como legítimos --- */
  P.danar = function () {
    var rng = this.rng, W = this.W, H = this.H;
    var abiertas = [];
    for (var y = 1; y < H - 1; y += 1) {
      for (var x = 1; x < W - 1; x += 1) if (this.aire(x, y)) abiertas.push([x, y]);
    }
    var cuota = Math.floor(abiertas.length * rng.float(0.03, 0.07));
    rng.shuffle(abiertas);
    var puestos = 0;
    for (var k = 0; k < abiertas.length && puestos < cuota; k += 1) {
      var p = abiertas[k];
      this.cerrar(p[0], p[1]);
      if (this.conexo()) { puestos += 1; this.mat[this.i(p[0], p[1])] = MAT.POR_CLAVE.papel.id; }
      else this.abrir(p[0], p[1]);
    }
    this.danado = puestos;
  };

  /* --- trenzado: bucles verdaderos, no un árbol perfecto --- */
  P.trenzar = function (prob) {
    var rng = this.rng;
    for (var y = 2; y < this.H - 2; y += 1) {
      for (var x = 2; x < this.W - 2; x += 1) {
        if (!this.macizo(x, y)) continue;
        var h = this.aire(x - 1, y) && this.aire(x + 1, y) && this.macizo(x, y - 1) && this.macizo(x, y + 1);
        var v = this.aire(x, y - 1) && this.aire(x, y + 1) && this.macizo(x - 1, y) && this.macizo(x + 1, y);
        if ((h || v) && rng.chance(prob)) this.abrir(x, y);
      }
    }
  };

  /* --- conectividad: siempre existe una ruta, aunque sea larga --- */
  P.componentes = function () {
    var W = this.W, H = this.H, n = W * H;
    var marca = new Int32Array(n).fill(-1);
    var comps = [];
    var cola = new Int32Array(n);
    for (var s = 0; s < n; s += 1) {
      if (this.casillas[s] === 1 || marca[s] >= 0) continue;
      var id = comps.length, cab = 0, fin = 0;
      cola[fin++] = s; marca[s] = id;
      var lista = [];
      while (cab < fin) {
        var c = cola[cab++]; lista.push(c);
        var x = c % W, y = (c / W) | 0;
        var vec = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
        for (var v = 0; v < 4; v += 1) {
          var nx = vec[v][0], ny = vec[v][1];
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          var ni = ny * W + nx;
          if (this.casillas[ni] === 1 || marca[ni] >= 0) continue;
          marca[ni] = id; cola[fin++] = ni;
        }
      }
      comps.push(lista);
    }
    this._marca = marca;
    return comps;
  };

  P.conexo = function () { return this.componentes().length <= 1; };

  P.asegurarConexo = function () {
    var comps = this.componentes();
    if (comps.length <= 1) return true;
    comps.sort(function (a, b) { return b.length - a.length; });
    var W = this.W;
    var principal = comps[0];
    var enPrincipal = new Uint8Array(this.W * this.H);
    principal.forEach(function (i) { enPrincipal[i] = 1; });
    for (var c = 1; c < comps.length; c += 1) {
      var lista = comps[c];
      if (lista.length < 4) { lista.forEach(function (i) { this.casillas[i] = 1; }, this); continue; }
      /* excavar el túnel más corto hacia el componente principal */
      var mejor = null;
      for (var k = 0; k < lista.length; k += 1) {
        var x = lista[k] % W, y = (lista[k] / W) | 0;
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (var d = 0; d < 4; d += 1) {
          for (var paso = 1; paso <= 6; paso += 1) {
            var nx = x + dirs[d][0] * paso, ny = y + dirs[d][1] * paso;
            if (nx < 1 || ny < 1 || nx >= this.W - 1 || ny >= this.H - 1) break;
            var ni = ny * W + nx;
            if (enPrincipal[ni] && (!mejor || paso < mejor.paso)) {
              mejor = { x: x, y: y, dx: dirs[d][0], dy: dirs[d][1], paso: paso };
            }
            if (enPrincipal[ni]) break;
          }
        }
        if (mejor && mejor.paso === 1) break;
      }
      if (!mejor) { lista.forEach(function (i) { this.casillas[i] = 1; }, this); continue; }
      for (var t = 0; t <= mejor.paso; t += 1) {
        var ax = mejor.x + mejor.dx * t, ay = mejor.y + mejor.dy * t;
        this.abrir(ax, ay);
        enPrincipal[ay * W + ax] = 1;
      }
      lista.forEach(function (i) { enPrincipal[i] = 1; });
    }
    return this.componentes().length <= 1;
  };

  /* --- materiales por región: la mano tipográfica de cada arquitectura --- */
  P.repartirMateriales = function () {
    var rng = this.rng.fork("materiales"), W = this.W, H = this.H;
    var dominante = MAT.POR_CLAVE[this.arquitectura.material] || MAT.MATERIALES[0];
    if (this.distritos) {
      for (var y = 0; y < H; y += 1) {
        for (var x = 0; x < W; x += 1) {
          var f = this.distritos.focos[this.distritos.mapa[y * W + x]];
          this.mat[y * W + x] = f.mat;
        }
      }
      this.materialDominante = MAT.MATERIALES[this.distritos.focos[0].mat];
      return;
    }
    /* manchas: el dominante y dos acompañantes, en parches suaves */
    var otros = MAT.MATERIALES.filter(function (m) { return m !== dominante; });
    rng.shuffle(otros);
    var acomp = otros.slice(0, 2);
    var focos = [];
    var cuantos = rng.int(5, 11);
    for (var k = 0; k < cuantos; k += 1) {
      focos.push({
        x: rng.int(0, W - 1), y: rng.int(0, H - 1),
        m: rng.chance(0.55) ? dominante : rng.pick(acomp),
        r: rng.float(4, 16)
      });
    }
    for (var yy = 0; yy < H; yy += 1) {
      for (var xx = 0; xx < W; xx += 1) {
        var elegido = dominante, mejor = Infinity;
        for (var f2 = 0; f2 < focos.length; f2 += 1) {
          var dx = xx - focos[f2].x, dy = yy - focos[f2].y;
          var d = Math.sqrt(dx * dx + dy * dy) / focos[f2].r;
          if (d < mejor) { mejor = d; elegido = focos[f2].m; }
        }
        this.mat[yy * W + xx] = elegido.id;
      }
    }
    this.materialDominante = dominante;
  };

  /* --- umbrales: bajar no es progresar, es cambiar de gramática --- */
  P.ponerUmbrales = function () {
    var rng = this.rng.fork("umbrales");
    var cuantos = rng.int(1, 3);
    var abiertas = this.casillasAbiertas();
    if (!abiertas.length) return;
    for (var k = 0; k < cuantos; k += 1) {
      var p = rng.pick(abiertas);
      if (!p) continue;
      this.umbrales.push({ x: p[0], y: p[1] });
    }
  };

  P.casillasAbiertas = function () {
    var out = [];
    for (var y = 1; y < this.H - 1; y += 1) {
      for (var x = 1; x < this.W - 1; x += 1) if (this.aire(x, y)) out.push([x, y]);
    }
    return out;
  };

  P.esUmbral = function (x, y) {
    for (var i = 0; i < this.umbrales.length; i += 1) {
      if (this.umbrales[i].x === x && this.umbrales[i].y === y) return true;
    }
    return false;
  };

  /*
    perforar — un muro frotado puede abrir un paso que el generador no previó.
    Devuelve true si el laberinto lo acepta. Nunca desconecta ni encierra.
  */
  P.perforar = function (x, y) {
    if (!this.dentro(x, y) || !this.macizo(x, y)) return false;
    if (x <= 0 || y <= 0 || x >= this.W - 1 || y >= this.H - 1) return false;
    this.abrir(x, y);
    if (!this.conexo()) { this.cerrar(x, y); return false; }
    this.roto[this.i(x, y)] = 1;
    return true;
  };

  /* cerrar una casilla sólo si el laberinto sigue siendo recorrible */
  P.macizar = function (x, y) {
    if (!this.dentro(x, y) || this.macizo(x, y)) return false;
    if (this.esUmbral(x, y)) return false;
    this.cerrar(x, y);
    if (!this.conexo()) { this.abrir(x, y); return false; }
    return true;
  };

  function elegirArquitectura(rng, sesgo) {
    if (sesgo && sesgo.arquitectura) {
      for (var i = 0; i < ARQUITECTURAS.length; i += 1) {
        if (ARQUITECTURAS[i].clave === sesgo.arquitectura) return ARQUITECTURAS[i];
      }
    }
    var bolsa = [];
    ARQUITECTURAS.forEach(function (a) {
      for (var k = 0; k < a.peso; k += 1) bolsa.push(a);
    });
    return rng.pick(bolsa);
  }

  var api = { Laberinto: Laberinto, ARQUITECTURAS: ARQUITECTURAS, elegirArquitectura: elegirArquitectura };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_LABERINTO = api;
})(typeof window !== "undefined" ? window : globalThis);
