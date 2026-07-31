/*
  materiales.js — de qué está hecho el edificio.

  Un material es: un juego restringido de signos (seis como máximo),
  una regla de trama, una junta, un registro de color y un autómata propio.
  La diferencia entre dos materiales tiene que leerse como diferencia de
  construcción, no de decoración.

  Los autómatas se toman prestados de ../otrorio/js/automatas.js (LabAutomata),
  con la misma economía de préstamo por ruta relativa que usa vent/.
*/
(function (root) {
  "use strict";

  var LAB = root.LabAutomata || null;

  /* ------------------------------------------------------------------ *
   * 16 tintas + 16 papeles. Sin alfa, sin mezcla.
   * Un cambio de color es un cambio de estado.
   *
   * Convención de índices, igual en las familias claras y en las oscuras:
   *   tinta 0      · del color del papel: tinta invisible
   *   tinta 1..6   · los seis colores de material, legibles sobre el papel 0
   *   tinta 7      · la tinta de la interfaz
   *   tinta 8      · apagada, para suelo y techo
   *   tinta 9..14  · los materiales con el atributo intenso
   *   tinta 15     · contraste máximo
   *   papel 0      · el fondo, que es también la lejanía
   *   papel 1..6   · seis escalones de cercanía
   *   papel 8..15  · el juego invertido
   * Así "intenso" (tinta | 8) siempre significa más contraste, nunca más claro.
   * peso = cuántas semillas de cada 19 caen en esta familia.
   * El verde sobre negro pesa 1: nunca pasa del 10%.
   * ------------------------------------------------------------------ */
  var PALETAS = [
    {
      clave: "riso", nombre: "riso colorido", peso: 3,
      tinta: ["#fbf7ee", "#2b4bd6", "#0f8f6a", "#c41a6a", "#d2401f", "#7a2fb5", "#b07a12", "#2a2733",
              "#8a8698", "#1b34a8", "#0a6b4e", "#93104c", "#a82c12", "#571c85", "#87590a", "#14121a"],
      papel: ["#fbf7ee", "#f6f1e4", "#f1ebda", "#ece5d0", "#e7dfc6", "#e2d9bc", "#ddd3b2", "#d8cda8",
              "#2b2937", "#1e2a4d", "#12332c", "#3d1524", "#3a1a10", "#2c1638", "#3a2a10", "#0f0e14"]
    },
    {
      clave: "archivo", nombre: "papel de archivo", peso: 3,
      tinta: ["#e8dfc6", "#6b4a2a", "#4a5a34", "#7a3a2a", "#8a5a1a", "#5a4a6a", "#33495a", "#2b2318",
              "#9a8b66", "#523618", "#364423", "#5e2818", "#6b430a", "#423450", "#213544", "#171208"],
      papel: ["#e8dfc6", "#e2d8bb", "#dcd1b0", "#d6caa5", "#d0c39a", "#cabc8f", "#c4b584", "#beae79",
              "#2b2519", "#332c1e", "#3b3323", "#433a28", "#4b412d", "#534832", "#5b4f37", "#1a1610"]
    },
    {
      clave: "carbon", nombre: "copia carbón", peso: 2,
      tinta: ["#e6e2dc", "#2f4a6a", "#3a5a4a", "#4a4a5f", "#6a3a3a", "#4a3a5a", "#5a5a3a", "#1c1c22",
              "#8a8680", "#1f3550", "#284434", "#353548", "#502828", "#352848", "#454527", "#0b0b0f"],
      papel: ["#e6e2dc", "#e0dcd5", "#d9d5ce", "#d2cec6", "#cbc7bf", "#c4c0b7", "#bdb9b0", "#b6b2a8",
              "#16161c", "#1c2230", "#232b34", "#2a3440", "#332828", "#2c2434", "#34302a", "#0b0b0f"]
    },
    {
      clave: "plano", nombre: "plano azul", peso: 3,
      tinta: ["#0d2340", "#6fa8d8", "#5fc9b0", "#7fd8e8", "#e08aa8", "#a98ae0", "#e0c46a", "#b8cbe0",
              "#3d5f84", "#9ccdf2", "#8ce8d2", "#a9ecf8", "#f4b2c8", "#c9b0f4", "#f4e09a", "#f2f8ff"],
      papel: ["#0d2340", "#102947", "#13304e", "#163655", "#193d5c", "#1c4363", "#1f4a6a", "#225071",
              "#081a30", "#0a1e38", "#0c2240", "#0e2648", "#102a50", "#122e58", "#143260", "#050e1c"]
    },
    {
      clave: "cartulina", nombre: "cartulina ácida", peso: 2,
      tinta: ["#f4ff9e", "#1a6b2a", "#0a7a7a", "#c41a4a", "#8a1ac4", "#c46a0a", "#2a4a8a", "#1a1a08",
              "#8a9a50", "#0f4d1c", "#065656", "#8f0f36", "#600f8a", "#8c4a06", "#1c3462", "#000400"],
      papel: ["#f4ff9e", "#edf894", "#e6f18a", "#dfea80", "#d8e376", "#d1dc6c", "#cad562", "#c3ce58",
              "#2a2e0c", "#1e3a12", "#0e3a26", "#0e3838", "#3a0e1e", "#2a0e3a", "#3a2a04", "#101204"]
    },
    {
      clave: "noche", nombre: "noche de terminal", peso: 3,
      tinta: ["#08080b", "#4a6ac0", "#3f9c74", "#3f9cae", "#b04a5e", "#8a4ac0", "#b09a3f", "#9aa0a8",
              "#3a3e46", "#7a9aee", "#63d6a8", "#6fd6ea", "#e87a8e", "#b87aee", "#e6c65a", "#e8ecf2"],
      papel: ["#08080b", "#0b0b0f", "#0e0e13", "#111117", "#14141b", "#17171f", "#1a1a23", "#22242a",
              "#040406", "#060a12", "#050e0a", "#050e12", "#100609", "#0c0612", "#100e04", "#000000"]
    },
    {
      clave: "ambar", nombre: "ámbar de fósforo", peso: 2,
      tinta: ["#0d0800", "#8a5600", "#a86c00", "#c68400", "#b04a10", "#8a6a2a", "#6a4000", "#e09c10",
              "#5a3400", "#c07a10", "#e09a10", "#f6b420", "#e0742a", "#c09a4a", "#a06a10", "#ffe6a8"],
      papel: ["#0d0800", "#120b00", "#170e00", "#1c1100", "#211400", "#261700", "#2b1a00", "#301d00",
              "#080500", "#0a0600", "#0c0700", "#0e0800", "#100900", "#120a00", "#140b00", "#000000"]
    },
    {
      clave: "verde", nombre: "monocromo verde", peso: 1,
      tinta: ["#000800", "#00641c", "#007e26", "#009830", "#046c2a", "#0a8a3a", "#00541a", "#00b23a",
              "#00461a", "#20cc50", "#3ad868", "#54e480", "#2ac05a", "#48d472", "#18b448", "#c8ffd8"],
      papel: ["#000800", "#000c00", "#001000", "#001400", "#001800", "#001c00", "#002000", "#002400",
              "#000400", "#000600", "#000800", "#000a00", "#000c00", "#000e00", "#001000", "#000000"]
    }
  ];

  /* familia obligatoria cuando el sistema pide contraste alto */
  var PALETA_CONTRASTE = {
    clave: "contraste", nombre: "alto contraste", peso: 0,
    tinta: ["#000000", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
            "#000000", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
    papel: ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000",
            "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]
  };

  function elegirPaleta(rng, sesgo) {
    var bolsa = [];
    PALETAS.forEach(function (p) {
      var peso = p.peso + ((sesgo && sesgo.paleta === p.clave) ? 6 : 0);
      for (var i = 0; i < peso; i += 1) bolsa.push(p);
    });
    return rng.pick(bolsa);
  }

  /* ------------------------------------------------------------------ *
   * MATERIALES
   * rampa: seis signos de cerca a lejos. El sexto es siempre el espacio:
   * la oscuridad no es un color, es falta de información.
   * cara: la trama alterna para las caras norte/sur, para que las esquinas
   * se lean sin necesidad de sombra.
   * ------------------------------------------------------------------ */
  var MATERIALES = [
    {
      clave: "cal", nombre: "cal", tinta: 7, junta: "│",
      rampa: ["█", "▓", "▒", "░", "·", " "],
      cara: ["▓", "▒", "░", "░", "·", " "],
      grano: ".,:;'",
      automata: { tipo: "wolfram", regla: 30 },
      tono: 220
    },
    {
      clave: "ladrillo", nombre: "ladrillo", tinta: 4, junta: "═",
      rampa: ["█", "▓", "▚", "▒", "░", " "],
      cara: ["▓", "▚", "▒", "░", "·", " "],
      grano: "▄▀▌▐",
      automata: { tipo: "wolfram", regla: 110 },
      tono: 165
    },
    {
      clave: "sextante", nombre: "sextante", tinta: 3, junta: "╬",
      rampa: ["█", "🬲", "🬕", "🬊", "🬀", " "],
      cara: ["🬭", "🬧", "🬔", "🬅", "·", " "],
      grano: "🬂🬋🬎🬹",
      automata: { tipo: "conway" },
      tono: 330
    },
    {
      clave: "esquirla", nombre: "esquirla", tinta: 5, junta: "╳",
      rampa: ["█", "▛", "╳", "╲", "╱", " "],
      cara: ["▟", "▜", "╳", "╱", "·", " "],
      grano: "╱╲╳",
      automata: { tipo: "wolfram", regla: 90 },
      tono: 440
    },
    {
      clave: "hollin", nombre: "hollín", tinta: 8, junta: "┼",
      rampa: ["█", "▓", "▒", "░", "∙", " "],
      cara: ["▓", "▒", "░", "∙", "·", " "],
      grano: "∙·°",
      automata: { tipo: "wolfram", regla: 45 },
      tono: 110
    },
    {
      clave: "papel", nombre: "papel", tinta: 6, junta: "┊",
      rampa: ["▓", "▒", "░", ":", ".", " "],
      cara: ["▒", "░", ";", ".", "·", " "],
      grano: ".,:;",
      automata: { tipo: "wolfram", regla: 60 },
      tono: 590
    },
    {
      clave: "hueso", nombre: "hueso", tinta: 15, junta: "╪",
      rampa: ["█", "▒", "▖", "°", "¨", " "],
      cara: ["▓", "▗", "¤", "´", "·", " "],
      grano: "°¨´¤",
      automata: { tipo: "wolfram", regla: 54 },
      tono: 740
    },
    {
      clave: "cuadrante", nombre: "cuadrante", tinta: 2, junta: "╫",
      rampa: ["█", "▙", "▚", "▖", "·", " "],
      cara: ["█", "▟", "▞", "▝", "·", " "],
      grano: "▖▗▘▝",
      automata: { tipo: "ciclico", estados: 5 },
      tono: 275
    }
  ];

  var POR_CLAVE = {};
  MATERIALES.forEach(function (m, i) { m.id = i; POR_CLAVE[m.clave] = m; });

  /* alfabetos que nadie lee: sólo para inscripciones, nunca para muro */
  var ALFABETOS_ILEGIBLES = {
    phagspa: "ꡀꡁꡂꡄꡅꡆꡇꡈꡉꡊꡋꡌꡍꡎꡏꡐꡑꡒꡓꡔꡕꡖꡗꡘꡙꡚꡛꡜꡝꡞꡟꡠ",
    egipcio: "𓀀𓀁𓀂𓁐𓂀𓂝𓃀𓄿𓅓𓆑𓇋𓈖𓉐𓊃𓋴𓌂𓍑𓎛𓏏𓐍",
    linearb: "𐀀𐀁𐀂𐀃𐀄𐀅𐀆𐀇𐀈𐀉𐀊𐀋𐀍𐀎𐀏𐀐𐀑𐀒𐀓𐀔",
    firma: "𝤟𝤠𝤡𝤢𝤣𝤤𝤥𝤦𝤧𝤨"
  };

  /* ------------------------------------------------------------------ *
   * Autómatas: erosión lenta sobre la trama de cada material.
   * Se usan las funciones de LabAutomata (otrorio) cuando están; si el
   * documento se abre suelto sin ese archivo, el material simplemente
   * no se erosiona: la obra sigue en pie.
   * ------------------------------------------------------------------ */
  function nuevaTrama(mat, ancho, alto, rng) {
    if (!LAB) return null;
    if (mat.automata.tipo === "wolfram") {
      return { tipo: "wolfram", fila: LAB.seededRow(ancho, rng, 0.24), regla: mat.automata.regla, gen: 0 };
    }
    if (mat.automata.tipo === "conway") {
      return { tipo: "conway", rejilla: LAB.seededGrid(ancho, alto, rng, 2, 0.34), gen: 0 };
    }
    return {
      tipo: "ciclico",
      rejilla: LAB.seededGrid(ancho, alto, rng, mat.automata.estados || 5, 0.9),
      estados: mat.automata.estados || 5, gen: 0
    };
  }

  function avanzarTrama(trama) {
    if (!LAB || !trama) return trama;
    if (trama.tipo === "wolfram") trama.fila = LAB.nextRow(trama.fila, trama.regla, true);
    else if (trama.tipo === "conway") trama.rejilla = LAB.conwayStep(trama.rejilla, true);
    else trama.rejilla = LAB.cyclicStep(trama.rejilla, trama.estados);
    trama.gen += 1;
    return trama;
  }

  /* valor 0..1 de la trama en una coordenada del muro */
  function valorTrama(trama, x, y) {
    if (!trama) return 0;
    if (trama.tipo === "wolfram") return trama.fila[((x + y * 7) % trama.fila.length + trama.fila.length) % trama.fila.length];
    var filas = trama.rejilla, alto = filas.length, ancho = filas[0].length;
    var v = filas[((y % alto) + alto) % alto][((x % ancho) + ancho) % ancho];
    if (trama.tipo === "ciclico") return v / Math.max(1, trama.estados - 1);
    return v;
  }

  /*
    La niebla no es un degradado: es una rampa de caracteres, y sus escalones
    están donde la profundidad se nota. Las distancias crecen casi al doble en
    cada peldaño, como la percepción, no como la aritmética.
  */
  var UMBRALES = [1.35, 2.7, 5.2, 9.8, 17];

  function peldano(dist) {
    var i = 0;
    while (i < UMBRALES.length && dist > UMBRALES[i]) i += 1;
    return i;
  }

  function signo(mat, dist, maxDist, caraNS, trama, x, y) {
    var rampa = caraNS ? mat.cara : mat.rampa;
    var i = Math.min(rampa.length - 1, peldano(dist));
    var v = valorTrama(trama, x, y);
    if (v > 0.66 && i > 0) i -= 1;
    else if (v < 0.12 && i < rampa.length - 1) i += 1;
    return rampa[i];
  }

  var api = {
    PALETAS: PALETAS,
    PALETA_CONTRASTE: PALETA_CONTRASTE,
    MATERIALES: MATERIALES,
    POR_CLAVE: POR_CLAVE,
    ALFABETOS_ILEGIBLES: ALFABETOS_ILEGIBLES,
    elegirPaleta: elegirPaleta,
    nuevaTrama: nuevaTrama,
    avanzarTrama: avanzarTrama,
    valorTrama: valorTrama,
    signo: signo,
    peldano: peldano,
    UMBRALES: UMBRALES,
    usarLab: function (lab) { LAB = lab; }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_MATERIALES = api;
})(typeof window !== "undefined" ? window : globalThis);
