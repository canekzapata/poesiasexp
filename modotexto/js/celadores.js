/*
  celadores.js — lo que se mueve por el laberinto y no eres tú.

  Vienen de `palimpsesto`: cuatro caracteres de escrituras distintas impresos
  casi encima, hasta que sus trazos chocan y nace un glifo imposible. En una
  pantalla de texto eso no necesita superposición: un glifo base más tres
  diacríticos combinantes son cuatro caracteres que ocupan **una sola celda**.
  El palimpsesto cabe entero en la rejilla, y su signo cambia mientras se
  mueve, porque nunca termina de decidirse.

  Un celador cuida que sigas adentro. Mientras ronda, borra el mapa por donde
  pasa: se come lo que recordabas. Si lo alcanzas, suelta lo único que en esta
  obra se dice en presente sobre la puerta —y te devuelve la memoria que se
  había comido.

  Los pozos de escritura se toman de ../poemario/heraclitofable/corpus.js, que
  es donde vive el palimpsesto. Si no está, hay un pozo mínimo de reserva y
  todo lo demás sigue en pie.
*/
(function (root) {
  "use strict";

  var RESERVA = {
    griego: "ΑΒΓΔΘΛΞΠΣΦΨΩαβγδθλξπσφψω".split(""),
    cirilico: "БГДЖЗИЛПФЦЧШЩЪЫЬЭЮЯ".split(""),
    hebreo: "אבגדהוזחטיכלמנסעפצקרשת".split(""),
    matematico: "∀∃∇∂∮∫∞≈≠≡⊕⊗⊙⋈⌘√".split("")
  };
  var COMBINANTES_RESERVA = "̵̶̷̸̧̨̲̀́̂̃̄̆̇̈̊̌".split("");

  var PASO = 720;          /* una casilla cada tanto: rondan, no corren */
  var VISTA = 6;           /* a partir de aquí te huyen */

  function pozos() {
    var C = root.HFABLE_CORPUS;
    if (C && C.scripts && Object.keys(C.scripts).length) return C.scripts;
    return RESERVA;
  }
  function combinantes() {
    var C = root.HFABLE_CORPUS;
    if (C && C.combinantes && C.combinantes.length) return C.combinantes;
    return COMBINANTES_RESERVA;
  }

  /*
    signo — cuatro caracteres en una celda: una base de una escritura y hasta
    tres combinantes encima. Los trazos chocan y no se lee ninguno.
  */
  function signo(rng) {
    var escrituras = pozos();
    var claves = Object.keys(escrituras);
    var pool = escrituras[claves[rng.int(0, claves.length - 1)]];
    var base = pool[rng.int(0, pool.length - 1)];
    var comb = combinantes();
    var cuantos = rng.int(1, 3);
    var s = base;
    for (var i = 0; i < cuantos; i += 1) s += comb[rng.int(0, comb.length - 1)];
    return s;
  }

  function Celador(rng, x, y, id) {
    this.rng = rng;
    this.x = x; this.y = y;
    this.id = id;
    this.dir = rng.int(0, 3);
    this.ultimo = 0;
    this.tinta = rng.pick([4, 5, 12, 13]);   /* los registros que arden */
    this.comido = [];                        /* lo que le quitó a tu memoria */
    this.signos = [];
    for (var i = 0; i < 4; i += 1) this.signos.push(signo(rng));
    this.vivo = true;
  }

  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

  /*
    mover — ronda al azar, pero si te ve cerca se aleja. No te persigue:
    te evita. Hay que acorralarlo, que es peor que perseguirlo.
  */
  Celador.prototype.mover = function (mundo, ahora) {
    if (!this.vivo || ahora - this.ultimo < PASO) return false;
    this.ultimo = ahora;
    var lab = mundo.lab;
    var dx = mundo.pos.x - this.x, dy = mundo.pos.y - this.y;
    var cerca = Math.abs(dx) + Math.abs(dy) <= VISTA;

    var opciones = [];
    for (var d = 0; d < 4; d += 1) {
      var nx = this.x + DIRS[d][0], ny = this.y + DIRS[d][1];
      if (!lab.aire(nx, ny)) continue;
      var puntos = 1;
      if (d === this.dir) puntos += 2;                       /* sigue derecho */
      if (cerca) {
        var antes = Math.abs(dx) + Math.abs(dy);
        var luego = Math.abs(mundo.pos.x - nx) + Math.abs(mundo.pos.y - ny);
        puntos += luego > antes ? 6 : -4;                    /* huye */
      }
      opciones.push({ d: d, x: nx, y: ny, puntos: puntos + this.rng.float(0, 2) });
    }
    if (!opciones.length) return false;
    opciones.sort(function (a, b) { return b.puntos - a.puntos; });
    var elegido = opciones[0];
    this.dir = elegido.d;
    this.x = elegido.x; this.y = elegido.y;
    /* el signo no termina de decidirse: uno de los cuatro cambia al andar */
    this.signos[this.rng.int(0, 3)] = signo(this.rng);
    this.comer(mundo);
    return true;
  };

  /* comer — borra el mapa por donde pasa, y se acuerda de lo que borró */
  Celador.prototype.comer = function (mundo) {
    var mem = mundo.memoria;
    if (!mem) return;
    var idx = this.y * mundo.lab.W + this.x;
    var rec = mem.recuerdo(mundo.nivel, idx);
    if (!rec || rec.grado <= 0) return;
    this.comido.push({ idx: idx, grado: rec.grado, mat: rec.mat });
    if (this.comido.length > 80) this.comido.shift();
    rec.grado -= 1;
  };

  /* devolver — al alcanzarlo, sale de él lo que se había tragado */
  Celador.prototype.devolver = function (mundo) {
    var mem = mundo.memoria;
    if (!mem) return 0;
    var n = 0;
    for (var i = 0; i < this.comido.length; i += 1) {
      var c = this.comido[i];
      var rec = mem.recuerdo(mundo.nivel, c.idx);
      if (rec) { if (rec.grado < c.grado) { rec.grado = c.grado; n += 1; } }
      else { mem.ver(mundo.nivel, c.idx, c.mat, false); n += 1; }
    }
    this.comido.length = 0;
    return n;
  };

  /* ------------------------------------------------------------------ */

  function Ronda(rng, mundo) {
    this.rng = rng;
    this.lista = [];
    this.atrapados = 0;
    var lab = mundo.lab;
    var abiertas = lab.casillasAbiertas();
    if (!abiertas.length) return;
    var cuantos = Math.max(3, Math.min(7, Math.round(abiertas.length / 130)));
    var lejos = abiertas.filter(function (c) {
      return Math.abs(c[0] - mundo.pos.x) + Math.abs(c[1] - mundo.pos.y) > 8;
    });
    var bolsa = lejos.length >= cuantos ? lejos : abiertas;
    rng.shuffle(bolsa);
    for (var i = 0; i < cuantos && i < bolsa.length; i += 1) {
      this.lista.push(new Celador(rng.fork("celador:" + i), bolsa[i][0], bolsa[i][1], i));
    }
  }

  Ronda.prototype.vivos = function () {
    return this.lista.filter(function (c) { return c.vivo; });
  };

  Ronda.prototype.actualizar = function (mundo, ahora, detenido) {
    if (detenido) return;                 /* Esc detiene toda proliferación */
    for (var i = 0; i < this.lista.length; i += 1) {
      if (this.lista[i].vivo) this.lista[i].mover(mundo, ahora);
    }
  };

  /* ¿hay uno donde estoy parado? */
  Ronda.prototype.en = function (x, y) {
    for (var i = 0; i < this.lista.length; i += 1) {
      var c = this.lista[i];
      if (c.vivo && c.x === x && c.y === y) return c;
    }
    return null;
  };

  Ronda.prototype.atrapar = function (celador, mundo) {
    celador.vivo = false;
    this.atrapados += 1;
    var devueltas = celador.devolver(mundo);
    return { frase: mundo.lexico.salida(), devueltas: devueltas, quedan: this.vivos().length };
  };

  var api = {
    Ronda: Ronda, Celador: Celador, signo: signo,
    PASO: PASO, VISTA: VISTA, RESERVA: RESERVA
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_CELADORES = api;
})(typeof window !== "undefined" ? window : globalThis);
