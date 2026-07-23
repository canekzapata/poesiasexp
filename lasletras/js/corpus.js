/*
  corpus.js — frases como cargas, signos como materiales.
  Ninguna frase es una instrucción visible: la semilla la elige y el motor
  la convierte en masa, distancia, pliegue, repetición o erosión.
*/
(function (root) {
  "use strict";

  var frasesArco = [
    "el edificio recuerda una habitación que nunca tuvo",
    "la puerta aparece varios años antes que la casa",
    "el archivo construye un pasillo para poder perderlo",
    "cada muro aprende lentamente a sostener su ausencia",
    "la lluvia deja una columna encendida en el patio",
    "el eco alquila el piso de arriba",
    "una computadora sueña con una ventana que dé al mundo",
    "el umbral conserva la forma de quien no llegó",
    "el error trabaja de columna durante la noche",
    "un corredor atraviesa el recuerdo sin despertarlo"
  ];

  var frasesEspera = [
    "dos edificios se esperan sin tocarse",
    "la distancia también necesita techo",
    "cada fachada practica una forma distinta de mirar",
    "entre las dos torres cabe una conversación que no ocurrió",
    "un edificio envía un balcón y el otro todavía no responde",
    "se construyeron enfrente para aprender a echarse de menos",
    "la calle conserva exactamente el ancho de la espera",
    "uno recuerda al otro con varios pisos de diferencia",
    "dos ruinas futuras intercambian señales de puntuación",
    "la arquitectura intenta tocarse y produce una plaza",
    "el edificio de la izquierda sueña el techo del edificio derecho",
    "ningún puente llega completo al otro lado",
    "the gap is online but nobody is typing",
    "dos cuerpos practican una simetría que no les sale"
  ];

  var frasesEntrelazadas = [
    "un pasillo atraviesa otro pasillo y ambos cambian de piso",
    "la arquitectura entra por la puerta que todavía está construyendo",
    "dos cintas sostienen el vacío entre sus cruces",
    "el edificio atraviesa su propio recuerdo",
    "cada vuelta agrega una habitación al centro",
    "la escalera regresa por el interior del muro",
    "un nudo administra varios modos de estar adentro",
    "la cápsula contiene la puerta de otra cápsula",
    "the corridor crossed itself and became a room",
    "una superficie sale por donde debía continuar",
    "el techo pasa debajo de sí mismo para llegar arriba",
    "varios interiores comparten la misma curva",
    "el edificio se anuda para no terminar",
    "la fachada aprende a cruzar su propio umbral",
    "un corredor da tres vueltas antes de convertirse en patio"
  ];

  var frasesNoEuclidianas = [
    "el pasillo termina exactamente donde empieza",
    "la habitación es más grande por dentro que por fuera",
    "cada puerta corrige el lugar del que venimos",
    "el horizonte atraviesa el patio y vuelve por el techo",
    "una escalera asciende hasta el mismo peldaño",
    "la cúpula contiene el suelo que debería sostenerla",
    "el edificio tiene dos centros y ninguna periferia",
    "la ventana mira hacia el interior de su propia fachada",
    "cada vuelta cambia la dirección de arriba",
    "the room returns before the corridor ends",
    "el jardín ocupa la cara interior del horizonte",
    "la puerta pequeña administra una ciudad enorme",
    "dos líneas paralelas se encuentran dentro del vestíbulo",
    "el techo cae hacia arriba alrededor del patio",
    "la distancia se curva para caber en la habitación"
  ];

  var frasesGenealogicas = [
    "la cubierta negocia con el peso de todas las habitaciones",
    "un patio organiza las partes que todavía no se conocen",
    "cada estructura hereda un error de la estructura anterior",
    "la torre añade un piso para guardar otra manera de caer",
    "el pórtico sostiene una distancia antes de sostener el techo",
    "varias losas recuerdan edificios incompatibles",
    "la escalera construye primero el lugar al que quiere llegar",
    "un basamento reúne seis formas distintas de permanecer",
    "la fachada contiene piezas de otros edificios posibles",
    "el vacío decide qué parentesco existe entre las columnas",
    "una bóveda adopta la planta de una ruina futura",
    "el balcón ensaya una salida que la torre todavía no acepta",
    "cada anexo modifica la genealogía del edificio completo",
    "the structure keeps several unfinished ancestors online",
    "un túnel atraviesa las decisiones acumuladas de la semilla",
    "la corona repite abajo lo que el patio dejó sin construir",
    "dos alas diferentes comparten una sola entrada",
    "el edificio se parece a sus partes sólo durante un instante",
    "un anillo aprende a sostenerse sobre el arco",
    "el arco levanta una habitación circular sobre su clave",
    "la profundidad aparece cuando dos fachadas comparten una bóveda",
    "varias crujías dejan pasar el aire entre sus genealogías",
    "un puente habita la distancia entre sus propios apoyos",
    "cada piso gira para prestarle otra fachada al siguiente",
    "varios cubos comparten aristas sin ponerse de acuerdo",
    "la espiral convierte la profundidad en una forma de ascenso"
  ];

  var instrucciones = [
    { palabras: ["umbral", "puerta", "ventana"], nombre: "ABRIR", efecto: { vano: 12, profundidad: 1 } },
    { palabras: ["archivo", "recuerdo", "conserva"], nombre: "REPETIR", efecto: { repeticion: 1, carbon: 1 } },
    { palabras: ["distancia", "espera", "calle", "plaza", "ausencia", "gap"], nombre: "SEPARAR", efecto: { vano: 10, masa: -4 } },
    { palabras: ["eco", "repite", "señales", "puntuación"], nombre: "DESPLAZAR", efecto: { repeticion: 2, desplazamiento: 2 } },
    { palabras: ["lluvia", "río", "agua"], nombre: "EROSIONAR", efecto: { erosion: 0.035, vertical: 1 } },
    { palabras: ["error", "intenta", "sueña", "futura"], nombre: "DESALINEAR", efecto: { error: 4, desplazamiento: 1 } },
    { palabras: ["computadora", "online", "typing", "mundo"], nombre: "ANIDAR", efecto: { ventana: 1, profundidad: 1 } },
    { palabras: ["atraviesa", "cruce", "cruzar", "interior", "vuelta", "nudo", "cápsula", "anuda"], nombre: "ENTRELAZAR", efecto: { entrelazar: 1, profundidad: 1, repeticion: 1 } },
    { palabras: ["curva", "horizonte", "cúpula", "paralelas", "centros"], nombre: "CURVAR", efecto: { curvatura: 1, profundidad: 1 } },
    { palabras: ["regresa", "vuelve", "mismo", "termina", "returns"], nombre: "REGRESAR", efecto: { retorno: 1, repeticion: 1 } },
    { palabras: ["por dentro", "por fuera", "interior", "arriba", "dirección"], nombre: "INVERTIR", efecto: { inversion: 1, desplazamiento: 1 } },
    { palabras: ["noche", "ruina", "abajo"], nombre: "HUNDIR", efecto: { zocalo: 2 } },
    { palabras: ["techo", "arriba", "balcón", "puente"], nombre: "SOSTENER", efecto: { masa: 7, voladizo: 1 } },
    { palabras: ["anillo", "circular", "clave", "arcada"], nombre: "CORONAR", efecto: { repeticion: 1, profundidad: 1 } },
    { palabras: ["dos", "otro", "simetría", "enfrente"], nombre: "ESPEJEAR", efecto: { espejo: 1 } }
  ];

  // Cada lámina usa sólo cuatro signos como máximo. La diversidad sucede
  // entre semillas, no como enciclopedia Unicode dentro de una sola pieza.
  var paletas = [
    { nombre: "CNO", frente: "N", lateral: "C", techo: "O", sombra: "×", anomalia: "✶" },
    { nombre: "CÍRCULO/LÍNEA", frente: "│", lateral: "╱", techo: "○", sombra: "·", anomalia: "⊗" },
    { nombre: "CRUZ/PUNTO", frente: "╳", lateral: "┼", techo: "◌", sombra: "·", anomalia: "◎" },
    { nombre: "MECÁNICA", frente: "H", lateral: "K", techo: "0", sombra: "-", anomalia: "*" },
    { nombre: "MURO BLANDO", frente: "∩", lateral: "⟋", techo: "◦", sombra: "∙", anomalia: "⊙" },
    { nombre: "ENSAMBLE", frente: "╫", lateral: "╱", techo: "○", sombra: "×", anomalia: "┼" },
    { nombre: "PÓRTICO", frente: "Π", lateral: "╲", techo: "ο", sombra: "⋅", anomalia: "∴" },
    { nombre: "MALLA", frente: "╬", lateral: "╌", techo: "⊙", sombra: "░", anomalia: "¤" },
    { nombre: "SATÉLITE", frente: "I", lateral: "/", techo: "@", sombra: ".", anomalia: "?" },
    { nombre: "ANDAMIO", frente: "‡", lateral: "╱", techo: "°", sombra: "·", anomalia: "†" },
    { nombre: "CASILLA", frente: "□", lateral: "◇", techo: "○", sombra: "·", anomalia: "■" },
    { nombre: "PARÉNTESIS", frente: ")", lateral: "(", techo: "o", sombra: ".", anomalia: ":" },
    { nombre: "BLOQUES", frente: "▓", lateral: "▒", techo: "░", sombra: "·", anomalia: "█" },
    { nombre: "TRIÁNGULOS", frente: "▲", lateral: "◣", techo: "△", sombra: "·", anomalia: "▶" },
    { nombre: "FLECHAS", frente: "↑", lateral: "→", techo: "∘", sombra: "·", anomalia: "↯" },
    { nombre: "REDES", frente: "╪", lateral: "╤", techo: "╥", sombra: "·", anomalia: "╳" }
  ];

  var colores = [
    {
      nombre: "PAPEL DE ARCHIVO", familia: "archivo", peso: 28,
      papel: "#f1ecdf", frente: "#171713", lateral: "#292923", techo: "#575347",
      anomalia: "#fa3a2f", carbon: "#234ec8"
    },
    {
      nombre: "COPIA CARBÓN", familia: "archivo", peso: 18,
      papel: "#e9e7df", frente: "#18254f", lateral: "#314b85", techo: "#171713",
      anomalia: "#d62929", carbon: "#8a2268"
    },
    {
      nombre: "PAPEL ROSA", familia: "archivo", peso: 12,
      papel: "#f5d9df", frente: "#24161a", lateral: "#6a293e", techo: "#b33c5a",
      anomalia: "#174ce0", carbon: "#ed4e29"
    },
    {
      nombre: "PLANO AZUL", familia: "digital", peso: 11,
      papel: "#1232a8", frente: "#f4efe2", lateral: "#66ffe3", techo: "#ffb6dc",
      anomalia: "#ffef38", carbon: "#ff552f"
    },
    {
      nombre: "AMARILLO/VIOLETA", familia: "digital", peso: 9,
      papel: "#ffd51e", frente: "#25105b", lateral: "#e73131", techo: "#6a25d9",
      anomalia: "#087b68", carbon: "#ff5ca8"
    },
    {
      nombre: "NOCHE DE TERMINAL", familia: "digital", peso: 9,
      papel: "#0b0e12", frente: "#e9f3dc", lateral: "#3bff78", techo: "#44baff",
      anomalia: "#ff4d9d", carbon: "#ffef47"
    },
    {
      nombre: "CARTULINA ÁCIDA", familia: "digital", peso: 7,
      papel: "#b7ff3c", frente: "#10100f", lateral: "#5424d6", techo: "#ff4fa3",
      anomalia: "#f04424", carbon: "#147bff"
    },
    {
      nombre: "NARANJA/CÍAN", familia: "digital", peso: 6,
      papel: "#ff652b", frente: "#071d28", lateral: "#aefbff", techo: "#3e24b8",
      anomalia: "#fff04f", carbon: "#ffb8dc"
    },
    {
      nombre: "SEPIA QUEMADO", familia: "archivo", peso: 10,
      papel: "#e7d8b8", frente: "#2a1a0f", lateral: "#6b3d1b", techo: "#a5642c",
      anomalia: "#1f6b5c", carbon: "#3a2f6b"
    },
    {
      nombre: "BAUHAUS", familia: "archivo", peso: 9,
      papel: "#efe9df", frente: "#111111", lateral: "#d62828", techo: "#1d4e89",
      anomalia: "#f4c430", carbon: "#2a2a2a"
    },
    {
      nombre: "RISO FLÚOR", familia: "digital", peso: 8,
      papel: "#fdf2e3", frente: "#242424", lateral: "#ff4d6d", techo: "#3d5afe",
      anomalia: "#00e676", carbon: "#ff9100"
    },
    {
      nombre: "VERDE FÓSFORO", familia: "digital", peso: 7,
      papel: "#04140c", frente: "#c8ffcf", lateral: "#00ff8c", techo: "#9dff00",
      anomalia: "#ff2e88", carbon: "#00c2ff"
    },
    {
      nombre: "MAGENTA CINTA", familia: "digital", peso: 6,
      papel: "#1a0a14", frente: "#ffd9f2", lateral: "#ff3ea5", techo: "#7a5cff",
      anomalia: "#ffe14d", carbon: "#3affe0"
    }
  ];

  function normalizar(texto) {
    return String(texto || "").toLocaleLowerCase("es")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function interpretar(texto) {
    var limpio = normalizar(texto);
    var resultado = {
      nombres: [], vano: 0, masa: 0, error: 0, erosion: 0,
      profundidad: 0, repeticion: 0, desplazamiento: 0,
      carbon: 0, vertical: 0, ventana: 0, zocalo: 0,
      voladizo: 0, espejo: 0, entrelazar: 0,
      curvatura: 0, retorno: 0, inversion: 0
    };

    instrucciones.forEach(function (regla) {
      var encontrada = regla.palabras.some(function (palabra) { return limpio.indexOf(normalizar(palabra)) !== -1; });
      if (!encontrada) return;
      resultado.nombres.push(regla.nombre);
      Object.keys(regla.efecto).forEach(function (clave) { resultado[clave] += regla.efecto[clave]; });
    });

    if (!resultado.nombres.length) resultado.nombres.push("HABITAR");
    return resultado;
  }

  var frasesPorEspecie = {
    arco: frasesArco,
    espera: frasesEspera,
    entrelazada: frasesEntrelazadas,
    noeuclidiana: frasesNoEuclidianas,
    gramatica: frasesGenealogicas
  };
  var api = {
    frases: frasesArco.concat(frasesEspera, frasesEntrelazadas, frasesNoEuclidianas, frasesGenealogicas),
    frasesPorEspecie: frasesPorEspecie,
    instrucciones: instrucciones,
    paletas: paletas,
    colores: colores,
    interpretar: interpretar
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ARQ_CORPUS = api;
})(typeof window !== "undefined" ? window : globalThis);
