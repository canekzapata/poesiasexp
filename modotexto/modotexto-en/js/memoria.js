/*
  memoria.js — niebla, deterioro y cicatrices.

  La PLANTA nace vacía: la cartografía es un subproducto del cuerpo.
  Lo recordado se degrada. Volver a un lugar olvidado no restituye el
  recuerdo anterior: escribe uno nuevo, que puede contradecir al viejo.

  localStorage indexado por semilla. Al regresar, el mundo no se reinicia.
*/
(function (root) {
  "use strict";

  var PREFIJO = "poesiasexp/modotexto/";
  var NIVELES = 4;                 /* 3 = material propio, 2 = ░, 1 = punto, 0 = nada */
  var DETERIORO = 90 * 1000;       /* cada cuánto baja un grado lo no revisitado */

  function almacen() {
    try {
      if (typeof localStorage === "undefined") return null;
      localStorage.setItem(PREFIJO + "prueba", "1");
      localStorage.removeItem(PREFIJO + "prueba");
      return localStorage;
    } catch (e) { return null; }
  }

  function Memoria(semilla) {
    this.semilla = String(semilla);
    this.llave = PREFIJO + this.semilla;
    this.store = almacen();
    this.datos = this.cargar();
    this.mapa = {};                /* idx -> {n: nivel, t: visto, m: material recordado} */
    this.rehidratar();
  }

  var M = Memoria.prototype;

  M.vacio = function () {
    return {
      version: 1,
      visitadas: {},      /* idx -> [nivelLab, gradoRecordado, materialRecordado] */
      frases: [],
      perforados: [],
      panelesCerrados: [],
      tiempo: 0,
      pasos: 0,
      volcados: [],
      regiones: {}        /* idx region -> material nuevo tras un volcado */
    };
  };

  M.cargar = function () {
    if (!this.store) return this.vacio();
    try {
      var crudo = this.store.getItem(this.llave);
      if (!crudo) return this.vacio();
      var d = JSON.parse(crudo);
      var base = this.vacio();
      for (var k in base) if (base.hasOwnProperty(k) && d[k] === undefined) d[k] = base[k];
      return d;
    } catch (e) { return this.vacio(); }
  };

  M.guardar = function () {
    if (!this.store) return false;
    try {
      this.deshidratar();
      this.store.setItem(this.llave, JSON.stringify(this.datos));
      return true;
    } catch (e) { return false; }
  };

  M.rehidratar = function () {
    var ahora = Date.now();
    var v = this.datos.visitadas || {};
    this.mapa = {};
    for (var k in v) {
      if (!v.hasOwnProperty(k)) continue;
      var e = v[k];
      this.mapa[k] = { nivel: e[0] | 0, grado: e[1] | 0, mat: e[2] | 0, t: ahora - DETERIORO };
    }
  };

  M.deshidratar = function () {
    var v = {};
    for (var k in this.mapa) {
      if (!this.mapa.hasOwnProperty(k)) continue;
      var e = this.mapa[k];
      if (e.grado <= 0) continue;
      v[k] = [e.nivel, e.grado, e.mat];
    }
    this.datos.visitadas = v;
  };

  /* clave compuesta: un mismo índice significa cosas distintas en otro nivel */
  M.k = function (nivel, idx) { return nivel + ":" + idx; };

  /*
    ver — el cuerpo escribe el mapa. grado 3 es recuerdo fresco.
    Si el sitio ya se había olvidado del todo, el recuerdo nuevo puede
    contradecir al viejo: se guarda el material que ahora se cree ver.
  */
  M.ver = function (nivel, idx, material, caminada) {
    var key = this.k(nivel, idx);
    var e = this.mapa[key];
    var ahora = Date.now();
    if (!e) {
      this.mapa[key] = { nivel: nivel, grado: caminada ? 3 : 2, mat: material, t: ahora };
      return;
    }
    if (e.grado === 0) e.mat = material;      /* recuerdo nuevo, no restitución */
    e.grado = Math.max(e.grado, caminada ? 3 : 2);
    e.t = ahora;
  };

  M.recuerdo = function (nivel, idx) {
    var e = this.mapa[this.k(nivel, idx)];
    return e && e.grado > 0 ? e : null;
  };

  /* deteriorar — lo no revisitado pierde detalle. Se llama poco, no por fotograma. */
  M.deteriorar = function () {
    var ahora = Date.now();
    for (var k in this.mapa) {
      if (!this.mapa.hasOwnProperty(k)) continue;
      var e = this.mapa[k];
      if (e.grado <= 0) continue;
      if (ahora - e.t > DETERIORO) { e.grado -= 1; e.t = ahora; }
    }
  };

  M.contarRecordadas = function () {
    var n = 0;
    for (var k in this.mapa) if (this.mapa.hasOwnProperty(k) && this.mapa[k].grado > 0) n += 1;
    return n;
  };

  M.anotarFrase = function (texto) {
    if (this.datos.frases.indexOf(texto) < 0) this.datos.frases.push(texto);
  };
  M.anotarPerforado = function (nivel, idx) {
    var s = nivel + ":" + idx;
    if (this.datos.perforados.indexOf(s) < 0) this.datos.perforados.push(s);
  };
  M.perforadosDe = function (nivel) {
    return this.datos.perforados
      .filter(function (s) { return s.indexOf(nivel + ":") === 0; })
      .map(function (s) { return parseInt(s.split(":")[1], 10); });
  };
  M.anotarCierre = function (clave) {
    if (this.datos.panelesCerrados.indexOf(clave) < 0) this.datos.panelesCerrados.push(clave);
  };
  M.anotarApertura = function (clave) {
    var i = this.datos.panelesCerrados.indexOf(clave);
    if (i >= 0) this.datos.panelesCerrados.splice(i, 1);
  };
  M.anotarVolcado = function (reg) { this.datos.volcados.push(reg); };

  /*
    porosidad — la memoria influye en la generación futura.
    Un laberinto muy recorrido se vuelve más poroso; uno abandonado, más denso.
  */
  M.porosidad = function (celdasTotales) {
    var recorrido = this.contarRecordadas() / Math.max(1, celdasTotales);
    var pasos = Math.min(1, (this.datos.pasos || 0) / 2000);
    return Math.max(-0.05, Math.min(0.28, recorrido * 0.5 + pasos * 0.12 - 0.02));
  };

  /* olvidar es un gesto de la obra, no una opción de configuración */
  M.olvidar = function () {
    this.datos = this.vacio();
    this.mapa = {};
    if (this.store) { try { this.store.removeItem(this.llave); } catch (e) {} }
  };

  M.exportar = function () {
    this.deshidratar();
    return JSON.parse(JSON.stringify(this.datos));
  };

  var api = { Memoria: Memoria, NIVELES: NIVELES, DETERIORO: DETERIORO, PREFIJO: PREFIJO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_MEMORIA = api;
})(typeof window !== "undefined" ? window : globalThis);
