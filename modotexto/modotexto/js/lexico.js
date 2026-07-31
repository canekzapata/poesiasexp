/*
  lexico.js — el léxico de esta pieza, curado a mano.

  No está organizado por tema literario sino como el resto del edificio:
  por PROFUNDIDAD (a qué nivel del laberinto se dice) y por MATERIAL DE MURO
  (qué superficie es capaz de decirlo). Un muro de hollín no dice lo mismo
  que un muro de hueso.

  Frases de tres a doce palabras. Ninguna se copia entera de los libros del
  repositorio: se extrae tono y campo semántico. Las pocas citas literales
  y breves viven en CITAS y están atribuidas en el README.
*/
(function (root) {
  "use strict";

  /* ---- por profundidad: el nivel cambia la gramática, no sólo el decorado ---- */
  var PROFUNDIDAD = [
    [ /* nivel 0 — planta baja: el espacio todavía se deja describir */
      "el muro es una cita ilegible",
      "aquí la pared aprendió a repetirse",
      "cada celda pesa lo mismo que un ladrillo",
      "el pasillo no sabe que termina",
      "esto que llamamos fondo es falta de datos",
      "la rejilla no admite curvas, sólo promesas de curva",
      "camina despacio: el edificio te está midiendo",
      "un cuarto es una decisión que nadie firmó",
      "la puerta se llama puerta porque cabe",
      "las esquinas son un accidente de la métrica",
      "no hay afuera, hay menos información",
      "toda esquina fue antes una columna de números",
      "el techo es la fila que nadie pinta",
      "avanzar es reescribir una celda por vez",
      "aquí adentro la perspectiva es un rumor"
    ],
    [ /* nivel 1 — el espacio empieza a hablar de sí mismo */
      "la memoria dibuja mal y por eso dibuja",
      "vuelves y el corredor cambió de opinión",
      "lo recorrido se vuelve poroso",
      "el mapa se hace con el cuerpo o no se hace",
      "una pared frotada acaba cediendo",
      "las rutas que no usas se llenan de polvo",
      "el laberinto acepta agujeros que no planeó",
      "quien corre ve arquitectura, quien se detiene lee",
      "el olvido tiene textura de sombreado ligero",
      "lo que no revisitas se degrada a punto",
      "hay bucles: volver no es regresar",
      "la niebla de guerra también es una forma de memoria",
      "el arquitecto se equivocó y el sistema lo respeta",
      "esta pared no debería existir y sin embargo sostiene",
      "cartografiar es un subproducto de caminar"
    ],
    [ /* nivel 2 — régimen maquínico: el vocabulario se contamina */
      "el error es un cambio de régimen del espacio",
      "la variable que te sostiene no tiene nombre",
      "el volcado de núcleo también es un género",
      "la máquina se equivoca en verso",
      "una dirección inventada apunta a un cuarto real",
      "leer el estado interno es una forma de mirar por la ventana",
      "el proceso continúa aunque nadie observe",
      "la palabra entra al sistema como virus lento",
      "los caracteres migran hacia sentido y regresan",
      "cada bloque de memoria recuerda un pasillo",
      "la corrupción respeta el borde de la celda",
      "hexadecimal es un idioma con pocas vocales",
      "la falla se documenta a sí misma",
      "el sistema no traduce lo que está escrito ahí",
      "algo escribe en este muro y no somos nosotros"
    ],
    [ /* nivel 3 — fondo: casi no queda descripción, sólo residuo */
      "profundidad no es progreso",
      "no hay salida, sólo fondo",
      "la luz de una luciérnaga no ilumina: sobrevive",
      "quedan señales pequeñas y eso basta",
      "el minotauro es un cursor que parpadea",
      "el fondo es una fila que se desplaza",
      "abajo la gramática se cae de a poco",
      "todavía respira algo en la última columna",
      "el silencio aquí tiene la métrica de la fuente",
      "se apaga en 4 bits",
      "lo que sobrevive es intermitente",
      "aquí abajo el papel también es tinta"
    ]
  ];

  /* ---- por material: cada superficie tiene su habla ---- */
  var MATERIAL = {
    cal: [
      "la cal recuerda el molde y lo repite",
      "blanco es una densidad, no un color",
      "la junta vertical sostiene la mentira",
      "esta superficie se descascara en sílabas"
    ],
    ladrillo: [
      "junta doble: dos veces la misma decisión",
      "el ladrillo cuenta hasta cuatro y vuelve",
      "aparejo: cómo mentir con repetición",
      "el muro se teje, no se levanta"
    ],
    sextante: [
      "resolución doble, misma celda",
      "seis puntos por cuadro y ninguna curva",
      "el detalle no cabe: se aproxima",
      "media altura basta para fingir un borde"
    ],
    esquirla: [
      "las diagonales no son de esta rejilla",
      "aquí el ángulo se rompe y se cita",
      "cruz sobre cruz hasta perder el trazo",
      "lo oblicuo siempre es un injerto"
    ],
    hollin: [
      "el hollín se acumula donde nadie mira",
      "sombra sin fuente, sólo densidad",
      "esto quemó y sigue quemando despacio",
      "cuatro grises alcanzan para una noche"
    ],
    papel: [
      "la pared es papel de archivo, no piedra",
      "aquí se guardó algo y se perdió el índice",
      "puntuación usada como grano de la imagen",
      "el archivo también se desmorona"
    ],
    hueso: [
      "hueso: lo que queda cuando el dato se va",
      "grado, comilla, diéresis: restos de escritura",
      "esta superficie fue tabla y fue cuerpo",
      "lo blanco aquí es hueco"
    ],
    cuadrante: [
      "cuadrantes: la mitad de una mitad",
      "el color aquí gira en ondas lentas",
      "cuatro esquinas para inventar una diagonal",
      "el autómata pinta y nadie le pidió"
    ]
  };

  /* ---- letreros de fuga: se leen sólo al final de un corredor largo ---- */
  var FUGA = [
    "no vuelvas por donde viniste",
    "esto ya lo caminaste",
    "el corredor continúa sin ti",
    "aquí se acaba el plano y empieza la trama",
    "quien lee esto está quieto",
    "faltan celdas para llegar",
    "no había puerta, la abriste",
    "el fondo es una convención"
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
    "condensacion", "quietud", "disolucion", "anomalia", "volcado"
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
    "reintento de conexion del sector"
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
      var cita = this.rng.pick(CITAS.filter(function (c) { return !this.usadas[c.t]; }, this) || []);
      if (cita) { this.usadas[cita.t] = true; return { texto: cita.t, mezclada: false, cita: cita.f }; }
    }
    var todas = this.bolsa(nivel, materialClave);
    if (!todas.length) return { texto: "la celda quedó sin habla", mezclada: true };
    var a = String(this.rng.pick(todas)).split(" ");
    var b = String(this.rng.pick(todas)).split(" ");
    var corte = Math.max(1, Math.floor(a.length * this.rng.float(0.3, 0.7)));
    var mezcla = a.slice(0, corte).concat(b.slice(Math.floor(b.length * 0.4)));
    this.mezcla += 1;
    return { texto: mezcla.join(" ").slice(0, 74), mezclada: true };
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
    PROFUNDIDAD: PROFUNDIDAD, MATERIAL: MATERIAL, FUGA: FUGA,
    CITAS: CITAS, MAQUINA: MAQUINA, ERRORES: ERRORES, Lexico: Lexico
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_LEXICO = api;
})(typeof window !== "undefined" ? window : globalThis);
