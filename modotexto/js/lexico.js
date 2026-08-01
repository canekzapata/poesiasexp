/*
  lexico.js — el léxico de esta pieza, curado a mano.

  Quien recorre esto es alguien, no una cámara. Entró por su propio pie y
  ahora busca por dónde se sale. El edificio no lo odia: lo contiene, que es
  peor. Por eso el léxico habla de la entrada, de la salida y de quedarse,
  no de arquitectura.

  Sigue organizado como el resto del edificio: por PROFUNDIDAD —cuánto ha
  bajado, y por lo tanto cuánto le queda de esperanza— y por MATERIAL DE
  MURO, porque una pared de hollín no confiesa lo mismo que una de hueso.

  Frases de tres a doce palabras. Ninguna se copia de los libros del
  repositorio: se extrae tono y campo semántico. Las pocas citas literales
  y breves viven en CITAS y están atribuidas en el README.
*/
(function (root) {
  "use strict";

  /* ---- por profundidad: bajar no es avanzar, es perder argumentos ---- */
  var PROFUNDIDAD = [
    [ /* nivel 0 — recién entrado. Todavía cree que hay puerta */
      "entré por mi propio pie, eso es lo peor",
      "todavía me acuerdo por dónde entré",
      "conté las vueltas hasta que dejé de contar",
      "la salida tiene que estar detrás de algo",
      "no me trajeron aquí: vine",
      "el edificio no me odia, y eso asusta más",
      "busco una puerta y encuentro otra pared parecida",
      "afuera todavía existe, tiene que existir",
      "si camino derecho llego a alguna orilla",
      "aquí nadie te encierra: te quedas",
      "la entrada era angosta y ya no la veo",
      "cuento pasos para no contar horas",
      "cada pared que toco me devuelve la misma pregunta",
      "alguien hizo esto para que pareciera un pasillo",
      "todavía tengo el afuera fresco en la boca"
    ],
    [ /* nivel 1 — la duda: el mapa de adentro empieza a mentir */
      "volví al mismo cruce y el cruce no me reconoció",
      "creí que este pasillo era nuevo",
      "la salida se movió de lugar mientras yo dormía",
      "ya no sé si avanzo o me repito",
      "he estado aquí, y aquí no me acuerdo de mí",
      "el mapa que llevo adentro empezó a mentirme",
      "me acostumbré, que es la forma lenta de rendirse",
      "buscar la puerta se volvió una manera de caminar",
      "hay huellas mías que no recuerdo haber dejado",
      "el afuera se me está gastando en la memoria",
      "puedo salir cuando quiera, digo, y sigo aquí",
      "no me perdí: me quedé",
      "la esperanza también es una forma de pasillo",
      "dejé marcas y alguien las borró, o fui yo",
      "regresar y llegar dejaron de ser cosas distintas"
    ],
    [ /* nivel 2 — el encierro se vuelve maquínico */
      "esto no fue construido: fue calculado",
      "la puerta existe en los datos y no en el muro",
      "alguien escribió mi ruta antes que yo",
      "soy un cursor que se cree un cuerpo",
      "el sistema no me castiga, me contiene",
      "la salida es una variable que nadie inicializó",
      "me vigilan sin mirarme, que es peor",
      "el error también quiere salir de aquí",
      "hay una puerta en la memoria, con la dirección corrupta",
      "el edificio se está acordando de mí",
      "no hay guardia: hay reglas, y las reglas no duermen",
      "estoy dentro de algo que todavía se escribe",
      "mi nombre no cabe en ninguna celda",
      "la máquina no quiere nada, por eso no cede",
      "otro caminó esto y su rastro quedó en el disco"
    ],
    [ /* nivel 3 — el fondo: la salida ya es sólo una palabra */
      "ya no busco la salida: busco dónde termina",
      "la puerta era una palabra que aprendí afuera",
      "aquí abajo hasta la esperanza pesa",
      "no hay salida, hay fondo, y el fondo respira",
      "me acuerdo del cielo como de un idioma que hablaba",
      "si alguien lee esto, no bajó lo suficiente",
      "dejé de contar y por fin descansé",
      "lo único que sube es el eco",
      "quiero salir, y esa frase ya no tiene a dónde ir",
      "abajo la palabra afuera se despinta",
      "el minotauro soy yo, esperándome",
      "entré para salir; me quedé para entender"
    ]
  ];

  /* ---- por material: cada superficie confiesa distinto ---- */
  var MATERIAL = {
    cal: [
      "esta pared la pintaron para tapar una puerta",
      "la cal guarda la forma de lo que cubrió",
      "blanco no es limpio: es lo que se repintó",
      "alguien apoyó aquí la espalda mucho tiempo"
    ],
    ladrillo: [
      "lo levantaron por fuera, no por dentro",
      "el que puso estos ladrillos ya se fue a su casa",
      "cuento hasta cuatro y vuelvo, como el aparejo",
      "un muro se teje despacio, para durar más que tú"
    ],
    sextante: [
      "aquí el detalle no cabe y se aproxima",
      "media altura basta para fingir una salida",
      "seis puntos por cuadro y ninguno es una puerta",
      "de cerca es piedra, de lejos es error"
    ],
    esquirla: [
      "algo se rompió aquí y nadie vino",
      "lo oblicuo siempre es un injerto, como yo",
      "las diagonales no pertenecen a esta rejilla",
      "esta pared tiene filo, y lo usé"
    ],
    hollin: [
      "se quemó algo aquí y siguió el pasillo",
      "el hollín se acumula donde nadie mira",
      "cuatro grises alcanzan para una noche entera",
      "esto ardió del lado de afuera"
    ],
    papel: [
      "la pared es archivo, no piedra",
      "aquí guardaron algo y perdieron el índice",
      "estuve fichado antes de entrar",
      "el expediente también se desmorona"
    ],
    hueso: [
      "hueso: lo que queda cuando el dato se va",
      "esta superficie fue tabla y fue cuerpo",
      "lo blanco aquí es hueco, no luz",
      "alguien contó los días rayando esta pared"
    ],
    cuadrante: [
      "cuatro esquinas para inventar una salida",
      "el color gira aquí en ondas muy lentas",
      "la mitad de una mitad, y sigue sin abrirse",
      "esto se pinta solo, y nadie se lo pidió"
    ]
  };

  /*
    letreros de fuga — se leen sólo al final de un corredor largo, cuando
    ya caminaste hacia ellos. Son lo más cruel que dice el edificio.
  */
  var FUGA = [
    "por aquí no se sale",
    "ya pasaste por aquí",
    "sigue, falta menos — mentira",
    "esto no lleva a ninguna puerta",
    "la salida estaba del otro lado",
    "quien escribió esto tampoco salió",
    "no te detengas aquí",
    "faltan menos pasos de los que crees",
    "regresa mientras te acuerdes del camino",
    "aquí se acaba el plano y empieza la trama"
  ];

  /*
    SALIDA — lo que sueltan los celadores cuando los alcanzas. Es lo único
    del léxico que se gana persiguiendo algo, y por eso es lo único que
    habla de la puerta en presente.
  */
  var SALIDA = [
    "el aire se mueve: algo está abierto",
    "una de estas paredes fue puerta",
    "hay una corriente y viene de arriba",
    "la entrada sigue donde la dejaste",
    "arriba alguien encendió una luz",
    "conté mal: falta menos",
    "esta dirección huele distinto",
    "hay una junta floja tres muros más allá",
    "el eco tarda más de este lado",
    "por aquí entró el que se fue",
    "queda una puerta sin cerrar en algún nivel",
    "lo abierto no se posee, pero se siente"
  ];

  /*
    citas — literales breves, atribuidas en el README.
    Aparecen raramente y nunca dos veces en la misma sesión.
  */
  var CITAS = [
    { t: "storm the reality studio", f: "Burroughs" },
    { t: "rub out the word forever", f: "Burroughs" },
    { t: "the nova police", f: "Burroughs" },
    { t: "it arrives from the future", f: "Eshun" }
  ];

  /* ---- vocabulario de máquina, sólo para el volcado de núcleo ---- */
  var MAQUINA = [
    "rejilla", "celda", "trama", "rampa", "junta", "cara", "columna", "rayo",
    "dda", "horizonte", "papel", "tinta", "atributo", "origen", "sucia",
    "semilla", "fork", "mulberry", "xfnv1a", "porosidad", "umbral", "nivel",
    "componente", "conexo", "desgaste", "erosion", "presupuesto", "residuo",
    "disposicion", "razon", "hoja", "corte", "foco", "niebla", "deterioro",
    "condensacion", "quietud", "disolucion", "anomalia", "volcado",
    "salida", "puerta", "ruta", "celador", "encierro"
  ];

  var ERRORES = [
    "lectura fuera de rango en trama[",
    "la region no responde desde hace",
    "se descartaron celdas sucias:",
    "el componente quedó sin ruta:",
    "presupuesto de erosion agotado en",
    "no se pudo escribir el atributo de",
    "colision de material en la casilla",
    "el umbral apunta a un nivel inexistente",
    "checksum de la planta no coincide",
    "reintento de conexion del sector",
    "no se encontró ninguna salida en el grafo",
    "la puerta apunta a una direccion liberada"
  ];

  /* ---- Léxico: reparte, no repite, y se agota ---- */
  function Lexico(rng) {
    this.rng = rng;
    this.usadas = {};
    this.mezcla = 0;
  }

  Lexico.prototype.bolsa = function (nivel, materialClave) {
    var lista = (PROFUNDIDAD[Math.min(nivel, PROFUNDIDAD.length - 1)] || []).slice();
    if (materialClave && MATERIAL[materialClave]) lista = lista.concat(MATERIAL[materialClave]);
    return lista;
  };

  Lexico.prototype.disponibles = function (nivel, materialClave) {
    var self = this;
    return this.bolsa(nivel, materialClave).filter(function (f) { return !self.usadas[f]; });
  };

  /*
    tomar — la misma frase no se ofrece dos veces en la misma sesión.
    Cuando el léxico se agota, las frases empiezan a mezclarse entre sí:
    esa degradación es parte del poema, no un fallo.
  */
  Lexico.prototype.tomar = function (nivel, materialClave) {
    var libres = this.disponibles(nivel, materialClave);
    if (libres.length > 2) {
      var f = this.rng.pick(libres);
      this.usadas[f] = true;
      return { texto: f, mezclada: false };
    }
    if (this.rng.chance(0.18)) {
      var sinUsar = CITAS.filter(function (c) { return !this.usadas[c.t]; }, this);
      var cita = sinUsar.length ? this.rng.pick(sinUsar) : null;
      if (cita) { this.usadas[cita.t] = true; return { texto: cita.t, mezclada: false, cita: cita.f }; }
    }
    var todas = this.bolsa(nivel, materialClave);
    if (!todas.length) return { texto: "la celda se quedó sin habla", mezclada: true };
    var a = String(this.rng.pick(todas)).split(" ");
    var b = String(this.rng.pick(todas)).split(" ");
    var corte = Math.max(1, Math.floor(a.length * this.rng.float(0.3, 0.7)));
    var mezcla = a.slice(0, corte).concat(b.slice(Math.floor(b.length * 0.4)));
    this.mezcla += 1;
    return { texto: mezcla.join(" ").slice(0, 74), mezclada: true };
  };

  /* lo que sueltan los celadores: nunca se repite mientras quede alguna */
  Lexico.prototype.salida = function () {
    var self = this;
    var libres = SALIDA.filter(function (f) { return !self.usadas[f]; });
    var f = libres.length ? this.rng.pick(libres) : this.rng.pick(SALIDA);
    this.usadas[f] = true;
    return f;
  };

  Lexico.prototype.fuga = function () { return this.rng.pick(FUGA); };
  Lexico.prototype.leidas = function () { return Object.keys(this.usadas); };
  Lexico.prototype.restantes = function (nivel, materialClave) {
    return this.disponibles(nivel, materialClave).length;
  };
  Lexico.prototype.marcarLeidas = function (lista) {
    (lista || []).forEach(function (f) { this.usadas[f] = true; }, this);
  };

  var api = {
    PROFUNDIDAD: PROFUNDIDAD, MATERIAL: MATERIAL, FUGA: FUGA, SALIDA: SALIDA,
    CITAS: CITAS, MAQUINA: MAQUINA, ERRORES: ERRORES, Lexico: Lexico
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_LEXICO = api;
})(typeof window !== "undefined" ? window : globalThis);
