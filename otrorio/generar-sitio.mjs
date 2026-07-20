#!/usr/bin/env node
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((arg, i, all) => {
  if (!arg.startsWith("--")) return ["_" + i, arg];
  const [key, inline] = arg.slice(2).split("=");
  return [key, inline ?? (all[i + 1]?.startsWith("--") ? true : all[i + 1])];
}));
const WORLD_SEED = String(args.seed || "otra-agua-2026");

function hash32(text) {
  let h = 1779033703 ^ String(text).length;
  for (let i = 0; i < String(text).length; i += 1) {
    h = Math.imul(h ^ String(text).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function rngFrom(text) {
  let a = hash32(text);
  return () => {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const worldRng = rngFrom(WORLD_SEED);
const requestedPages = Number(args.pages);
const PAGE_COUNT = Number.isFinite(requestedPages)
  ? Math.max(24, Math.min(128, Math.floor(requestedPages)))
  : WORLD_SEED === "otra-agua-2026" ? 96 : 62 + Math.floor(worldRng() * 43);
const pad = n => String(n).padStart(3, "0");
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const int = (rng, min, max) => Math.floor(min + rng() * (max - min + 1));
const chance = (rng, p) => rng() < p;
const sample = (rng, list, count) => {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const style = entries => Object.entries(entries).map(([key, value]) => `${key}:${value}`).join(";");

const TOPOLOGIES = [
  "table", "field", "corridor", "vertical", "windows", "iframes", "form",
  "source", "cellular", "index", "empty", "error", "glyphs", "destruction", "reproducer",
  "textstorm", "ascii", "garden", "charts", "cannibal", "cellularloom",
  "cellulararchive", "timepoem", "diagram", "diagramtext", "oracleparty", "vanishingmap"
];
const TOPOLOGY_LABELS = {
  table: "tabla infinita", field: "campo absoluto", corridor: "corredor horizontal",
  vertical: "documento vertical imposible", windows: "sistema de ventanas",
  iframes: "constelación de iframes", form: "formulario oracular",
  source: "código fuente habitable", cellular: "autómata habitable",
  index: "índice explosivo", empty: "página casi vacía", error: "error local",
  glyphs: "paisaje de glifos", destruction: "página que se autodestruye",
  reproducer: "página reproductora", textstorm: "tormenta de escrituras",
  ascii: "escultura ASCII", garden: "jardín estratificado",
  charts: "observatorio gráfico del ruido", cannibal: "página caníbal primitiva",
  cellularloom: "telar de autómatas", cellulararchive: "archivo de generaciones",
  timepoem: "poema que exige permanencia", diagram: "diagrama habitable",
  diagramtext: "ensayo convertido en diagrama", oracleparty: "oráculo descendiente de 006",
  vanishingmap: "mapa que hereda la desaparición de 013"
};
const RULES = [30, 45, 54, 60, 90, 110];
const CELLULAR_MODES = ["wolfram", "conway", "cyclic", "typographic"];
const FONT_MODES = ["everex", "model3", "compis", "anatolio", "egipcio", "lineara", "linearb"];
const RHYTHMS = ["still", "slow", "nervous", "explosive", "click", "scroll", "cellular"];
const RARE = ["monument", "same-text", "source", "glyph-only", "migration", "css-shift", "future-frame"];
const ACTIONS = ["normal", "normal", "normal", "normal", "window", "iframe", "destroy", "reproduce", "multiply", "chromatic", "mutant", "perishable"];
const OPERATIONS = ["display", "position", "tag", "multiply", "hierarchy", "serialize", "link", "comment", "relocate", "swap", "iframe", "destroy"];
const BUTTON_OPERATIONS = ["plus5", "noise", "chart", "sound", "block", "rain", "cultivate", "scale", "color", "archive", "map"];
const BUTTON_LABELS = {
  plus5: ["+5", "+ cinco botones", "+++++"], noise: ["más ruido", "ruido +", "ensuciar señal"],
  chart: ["graficar lluvia", "chart?", "medir el cauce"], block: ["<BLOCK>", "otro bloque", "insertar texto"],
  sound: ["escuchar el código", "tone.start()", "sonido: sí/no"],
  rain: ["hacer llover", "texto ↓", "caer"], cultivate: ["cultivar", "jardín +", "crecer código"],
  scale: ["otra escala", "texto ×10", "micro/macro"], color: ["mover color", "tinta ↻", "paleta inestable"],
  archive: ["registrar esto", "aconteció", "guardar ruido"],
  map: ["páginas usadas", "mapa de rastros", "¿dónde estuve?"]
};
const NAHUATL = Object.freeze({
  variety: "náhuatl clásico / grafía normalizada sin cantidades vocálicas",
  words: [
    ["ATL", "agua"], ["ATOYATL", "río"], ["AMOXTLI", "libro"], ["TLAHTOLLI", "palabra"],
    ["XOCHITL", "flor"], ["CUICATL", "canto"], ["OHTLI", "camino"], ["NEXTLI", "ceniza"],
    ["TLETL", "fuego"], ["YOHUALLI", "noche"], ["EHECATL", "viento"], ["YOLLOTL", "corazón"],
    ["TLALTICPAC", "sobre la tierra"], ["NICAN", "aquí"], ["MIXTLI", "nube"], ["QUIAHUITL", "lluvia"],
    ["CITLALIN", "estrella"], ["TONALLI", "día / calor / destino"], ["NEPANTLA", "en medio"], ["TLACUILOLLI", "pintura / escritura"]
  ],
  links: [
    "campa nel / hacia dónde, en verdad", "oc ceppa / otra vez", "ohtli / el camino",
    "amoxtli / entrar al libro", "in atl in tepetl / agua y cerro", "nepantla / cruzar lo de en medio",
    "xochitl cuicatl / flor y canto", "tlahtolli / seguir la palabra"
  ],
  fragments: [
    "An nochipa tlalticpac: zan achica ye nican. / No para siempre en la tierra: sólo un poco aquí.",
    "Campa nel tiazque? / ¿Hacia dónde iremos, en verdad?",
    "Azo tla nel o tic itohua nican? / ¿Acaso decimos aquí algo verdadero?",
    "Zan tontemiqui, in zan toncochitlehuaco. / Sólo soñamos, sólo despertamos del sueño.",
    "Cuix oc ceppa ye tonemiquiuh? / ¿Acaso volveremos a vivir otra vez?",
    "In tlilli, in tlapalli. / La tinta negra, el color rojo: escritura y saber.",
    "In xochitl, in cuicatl. / La flor, el canto: palabra florida.",
    "In atl, in tepetl. / El agua, el cerro: el lugar como cuerpo doble."
  ],
  passages: [
    "Campa nel tiazque? Ca zan titlacatico. Ca ompa huel tochan, in canin Ximoayan, in oncapa in Yolihuayan aic tlamian. / ¿Hacia dónde iremos, en verdad? Sólo hemos nacido; allá está nuestra casa, en Ximoayan, donde el vivir no termina.",
    "An nochipa tlalticpac: zan achica ye nican. Tel ca chalchihuitl no xamani, no teocuitlatl in tlapani, no quetzalli poztequi. / No para siempre en la tierra: sólo un poco aquí. El jade se quiebra, el oro se rompe, la pluma de quetzal se desgarra.",
    "Azo tla nel o tic itohua nican, Ipalnemohuani? Zan tontemiqui, in zan toncochitlehuaco; ayac nelli in quilhuia nican. / ¿Acaso decimos aquí algo verdadero? Sólo soñamos, sólo despertamos; nadie dice aquí una verdad definitiva.",
    "Cuix oc ceppa ye tonemiquiuh? In yuh quimati moyol: zan cen tinemico. / ¿Volveremos a vivir otra vez? Que lo sepa tu corazón: sólo una vez venimos a vivir.",
    "Cuix oc nelli in tlaca? Ye yuh ca ayoc nelli in tocuic. / ¿Es todavía verdadero el ser humano? Así parece que tampoco nuestro canto permanece verdadero.",
    "Ninotolinia: in aic notech acic in pactli, in necuiltonolli. / Estoy afligido: nunca llegaron hasta mí la alegría y la dicha."
  ],
  sources: ["Cantares mexicanos", "Gran Diccionario Náhuatl / UNAM"]
});
const nahPair = pair => `${pair[0]} / ${pair[1]}`;
const WORDS = ["RÍO", "FUEGO", "ARCHIVO", "CENIZA", "CAUCE", "LENGUA", "OLVIDO", "ECO", "UMBRAL", "MARGEN", "ÍNDICE", "GLIFO", "COPIA", "ORIGINAL", "TIEMPO", "AGUA", "SIGNO", "RUIDO", "NAVE", "VENTANA"].concat(NAHUATL.words.map(pair => pair[0]));
const LINKS = [
  "entrar por el margen", "seguir otra agua", "abrir la ceniza", "perder este destino",
  "doblar la ruta", "visitar el afuera", "copiar el hueco", "volver sin regresar",
  "traducir el borde", "hacer clic en la lluvia", "romper el índice",
  "habitar el atributo", "dejar que pase", "sembrar una ventana", "leer menos",
  "continuar en otra pestaña", "cerrar el verbo", "recordar este color"
].concat(NAHUATL.links);
const FRAGMENTS = [
  "El texto no fue escrito: fue encontrado escribiéndose.",
  "Un río no se lee dos veces con el mismo idioma.",
  "El archivo guarda todo menos el momento en que fue leído.",
  "El manuscrito existe sólo mientras nadie lo entiende.",
  "El signo apunta a otro signo, y así hasta el agua.",
  "Traducir es cruzar un río cargando el río.",
  "La trayectoria se curva como una frase que olvidó su verbo.",
  "La interfaz no muestra el mundo: lo hiere y lo vuelve visible.",
  "Desaparecer también es una manera de terminar la frase.",
  "Una regla mínima produce una tormenta, una célula produce una ciudad."
].concat(NAHUATL.fragments);
const MICRO = [
  "fragmento 0 de 0", "sentido parcial", "memoria no montada", "nodo ya futuro",
  "original: ninguna", "latencia del fuego", "este borde escucha", "la nota muerde",
  "ruido con sintaxis", "guardar sin conservar", "una ventana sueña", "cauce temporal",
  "zan achica ye nican / sólo un poco aquí", "nepantla / en medio", "amoxtli / libro",
  "tlahtolli / palabra", "nextli / ceniza", "oc ceppa / otra vez"
];
const ERRORS = [
  "404: el significado cambió de cauce", "HANDSHAKE: la lengua no responde",
  "AssertionError: original no encontrado", "La ruta existe, pero dejó de conducir",
  "El documento confundió tu lectura con clima"
];
const CODE = [
  "GET /origen 302 cauce", "while(!entiendes){ excava(); }",
  "if (leído) archivo.olvidar();", "chmod 000 /manuscrito",
  "SELECT sentido FROM río WHERE ∅;", "catch(nada){ throw margen; }"
];
const LITERARY = [
  "La lluvia no cae sobre la página: la página aprende a caer.",
  "El jardín crece debajo del código y levanta lentamente sus etiquetas.",
  "Cada estrato es una fecha que la pantalla pronuncia con otro color.",
  "La hoja escribe con luz; el archivo corrige con sombra.",
  "La corriente piensa sin centro y distribuye su recuerdo entre las piedras.",
  "Una célula contiene un cielo que todavía no ha elegido su clima.",
  "Lo que no puede leerse de cerca empieza a significar desde lejos.",
  "El lector dejó el cursor quieto y descubrió que la inacción también escribe.",
  "No hay fondo: sólo capas que aceptaron quedarse detrás.",
  "Al volver, el jardín había aprendido el nombre incompleto del visitante.",
  "Dos flechas discutieron durante horas cuál de ellas era la consecuencia.",
  "El diagrama no explica el río: registra los lugares donde el río se negó a obedecer.",
  "Una caja encierra la palabra origen y la palabra origen cava una salida en la caja.",
  "Toda clasificación produce, a su espalda, una criatura que no estaba en la lista.",
  "Las líneas conectan lo visible; los huecos conservan la conversación que ocurrió debajo.",
  "Esta página tiene memoria de pez y arquitectura de tormenta.",
  "El nodo central renunció a su cargo y desde entonces todos los márgenes gobiernan.",
  "La flecha llegó tarde: su destino ya se había convertido en pregunta.",
  "Cada recuadro es una habitación que decidió dibujar sus propios pasillos.",
  "Hay una diversión secreta en ordenar lo que sólo quería bailar.",
  "El lector tocó una relación y aparecieron tres parientes ilegítimos.",
  "Aquí el dato se disfraza de rumor para cruzar la frontera de la gráfica.",
  "La tipografía crece hasta dejar de informar y empezar a producir clima.",
  "Debajo de este párrafo hay otro párrafo usándolo como techo.",
  "La red promete orientación mientras cambia discretamente los puntos cardinales.",
  "Ningún mapa admite que sus zonas vacías también son decisiones.",
  "En la familia del seis los controles sueñan; en la del trece, las etiquetas aprenden a morir.",
  "Una ruta no visitada hace ruido incluso cuando nadie mueve el cursor.",
  "El documento se ríe con una animación mínima: dos píxeles fuera de lugar.",
  "La página siguiente no continúa ésta; la contagia."
].concat(NAHUATL.passages);
const DIAGRAM_TEXT = [
  "Primero apareció una línea entre dos palabras que nunca se habían visto. Nadie supo si era una flecha, una herida o la sombra de una instrucción. La pantalla la conservó porque todavía no distinguía entre explicar y decorar.",
  "Después llegaron cajas. Cada caja declaró que su interior era una región estable, pero las frases se escaparon por los bordes y comenzaron a utilizar los conectores como puentes. El orden sobrevivió sólo como estilo de borde.",
  "El mapa quiso ser útil: contó visitas, enumeró generaciones, calculó la distancia hasta una salida. Mientras tanto, una nota al margen cambió de color y alteró toda la geografía sin mover un solo nodo.",
  "Llamamos dato a lo que cabe en el recuadro y ruido a lo que continúa afuera. Esta distinción dura exactamente hasta que el lector hace clic; entonces el ruido recibe un nombre y el dato aprende a temblar.",
  "Hay diagramas que orientan y diagramas que producen más territorio. Éste pertenece a la segunda especie. Sus relaciones no representan una máquina previa: son la máquina mientras intenta recordar qué estaba fabricando.",
  "Una página usada deja residuos en la siguiente. No llega completa: llega como color, fragmento, regla celular, enlace que insiste o pequeña forma textual. La herencia digital es una mala traducción que por fortuna sigue viva.",
  "El seis enseñó al formulario a jugar. El trece enseñó al documento a perder partes sin perder del todo su respiración. Entre ambos apareció una familia de páginas que pregunta, conecta, desaparece y vuelve con otro tamaño.",
  "Leer este sistema no consiste en alcanzar un final. Consiste en producir una ruta lo bastante extraña para que el archivo la confunda con un acontecimiento y decida guardarla.",
  "Si una flecha apunta en dos direcciones no está equivocada: recuerda dos futuros. Si un nodo no tiene entrada quizá sea porque llegó desde una versión que todavía no hemos generado.",
  "Al fondo, casi ilegible, corre un ensayo distinto. A veces coincide con estas líneas; a veces sólo presta textura. La comprensión no se pierde: se distribuye en capas con velocidades incompatibles.",
  "Cada visitante fabrica una edición privada del laberinto. Las páginas no usadas ejercen una presión leve sobre los enlaces, como puertas cerradas que hacen circular el aire por debajo.",
  "Cuando todo parezca conectado, toca una caja. El diagrama recordará que también puede bailar, equivocarse, adoptar un color ajeno y enviar la lectura a una región todavía sin huellas."
].concat(NAHUATL.passages);
const DIAGRAM_LABELS = [
  "entrada que duda", "ruido hereditario", "caja sin autoridad", "futuro lateral",
  "dato que germina", "salida no usada", "parentesco 006", "memoria 013",
  "flecha nocturna", "hipótesis de agua", "nodo fugitivo", "error productivo",
  "lector como clima", "archivo poroso", "regla que baila", "margen soberano",
  "original apócrifo", "zona aún no leída", "conector doméstico", "fin provisional"
  , "tlahtolli / palabra", "nepantla / en medio", "oc ceppa / otra vez", "xochitl cuicatl / flor y canto"
];
const TIME_POEM = [
  "al principio la página era una respiración sin frase",
  "después llegó una célula cargando la noche en ocho vecinos",
  "nadie la vio dividir el agua: sólo quedó otra orilla",
  "el cursor aprendió a esperar sin parecer inmóvil",
  "cada segundo dejó una letra húmeda debajo del siguiente",
  "la regla ciento diez levantó una ciudad que no sabía durar",
  "en una ventana lejana el mismo color eligió otro nombre",
  "yo llamé lectura al tiempo que tardabas en no irte",
  "tú llamaste poema a la parte visible de la demora",
  "pero el archivo contó también los silencios que no aparecieron",
  "cuando la última línea llegue ya habrá cambiado su primera página",
  "quédate un poco más: el río todavía está escribiendo su salida",
  "An nochipa tlalticpac: zan achica ye nican. / No para siempre en la tierra: sólo un poco aquí.",
  "Campa nel tiazque? / ¿Hacia dónde iremos, en verdad?",
  "Zan tontemiqui, in zan toncochitlehuaco. / Sólo soñamos, sólo despertamos del sueño."
];
const FAUX_CODE = [
  "if (llueve) documento.germinar();", "while (río) { href = otraAgua; }",
  "const jardín = Array.from({length: infinito}, semilla);",
  "body::before { content: memoria-del-clima; }",
  "SELECT color FROM lluvia WHERE lectura IS NULL;",
  "garden.appendChild(document.createTextNode('raíz'));",
  "for (const estrato of tiempo) estrato.pensar();",
  "canvas.fillText(archivo, x = deriva, y = recuerdo);",
  "rule[110].then(ciudad).catch(jardín);",
  "grid[x][y] = vecinos === 3 ? palabra : silencio;",
  "amoxtli.append(tlahtolli);", "if (quiahuitl) atl += 1;",
  "const ohtli = mapa.oculto;", "nextli.remember(tletl);"
];
const RAIN_WORDS = [
  "cae", "carga", "otra agua", "todavía", "href", "llueve adentro",
  "memoria mineral", "una letra", "la misma nube", "archivo mojado",
  "texto de fondo", "error fértil", "jardín local", "sin centro",
  "una celda vive", "otra celda lee", "scroll lateral", "regla 110",
  "atl / agua", "tlahtolli / palabra", "xochitl / flor", "oc ceppa / otra vez"
];
const ASCII_SCULPTURES = [
`        +----------+
       /          /|
      /  ARCHIVO / |
     +----------+  |
     |  otra    |  +
     |  agua    | /
     |          |/
     +----------+`,
`             .      *
        *        .
             /\\
       _/\\_/  \\_/\\_
  ~~~~ otra corriente ~~~~
       \\  raíz raíz /
        \\__||||___/`,
`        .-.-.     .-.-.
     .-(  jardín de  )-.
    (__ hipervínculos __)
       '._   |   _.'
          \\ | /
        ---\|/---
           ||
       ____||____`,
`      [ antena de lluvia ]
             /|\\
            / | \\
       ____/  |  \\____
      /   señal: todavía \\
     /____________________\\
         |  |  |  |`
];
const GLYPH_SETS = [
  Array.from("𐇐𐇑𐇒𐇓𐇔𐇕𐇖𐇗𐇘𐇙𐇚𐇛𐇜𐇝𐇞𐇟𐇠𐇡𐇢𐇣𐇤𐇥𐇦𐇧𐇨𐇩"),
  Array.from("𒀀𒀁𒀂𒀃𒀄𒀅𒀆𒀇𒀈𒀉𒀊𒀋𒀌𒀍𒀎𒀏𒁃𒂷𒃻𒄞𒆳𒇻"),
  Array.from("𐘀𐘁𐘂𐘃𐘄𐘅𐘆𐘇𐘈𐘉𐘊𐘋𐘌𐘍𐘎𐘏𐘐𐘑𐘒𐘓"),
  Array.from("𓀀𓁐𓂀𓃀𓅃𓆃𓇋𓈖𓉐𓊃𓋴𓌂𓍯𓎁𓏏𓁷𓂝𓃰𓅓𓆓𓇳𓈗"),
  Array.from("≋≋≋〰〰﹏﹏∿∿∽∽≈≈≋⌇⌇⌁⌁⌇"),
  Array.from("╔╗╚╝╠╣╦╩╬┌┐└┘├┤┬┴┼▓▒░█▄▀")
];
const PALETTES = [
  ["#f8f7f1", "#050505", "#ff4fa3", "#147bff", "#b7ff3c", "#ff652b"],
  ["#050505", "#f7f1ff", "#ffd400", "#5a2dff", "#ff4fa3", "#b7ff3c"],
  ["#f8a9cb", "#20134d", "#75f4ff", "#ff6b00", "#f7ff8a", "#8e4dff"],
  ["#d9ff00", "#1900ff", "#ff2800", "#fff8e7", "#ff72bf", "#00b56a"],
  ["#001a39", "#fff1d7", "#ff7538", "#45d3ff", "#d9ff72", "#ff3b9f"],
  ["#fff", "#000", "#000", "#bbb", "#eee", "#555"],
  ["#2b0a3d", "#fff5c4", "#ff8dce", "#30e8c3", "#f5ff3f", "#7d63ff"],
  ["#ff5b22", "#151515", "#f4e8ff", "#0047ff", "#cbff00", "#ffb6de"],
  ["#b7d8ff", "#43006b", "#ffed00", "#ff4e91", "#e6fffa", "#1832ff"],
  ["#f0efe9", "#132519", "#8eeb83", "#ff9fbb", "#8758ff", "#ffe65c"],
  ["#ffe5f2", "#46112d", "#ec2f8b", "#185cff", "#ffca2a", "#78f0ce"],
  ["#2220a7", "#f9f4d2", "#ff6948", "#40e0ff", "#f0ff00", "#ff68cf"],
  ["#f6ff5f", "#351757", "#ff38a2", "#0d9dff", "#ffffff", "#ff792e"],
  ["#eff0ff", "#181829", "#694cff", "#ff3e66", "#00d9a6", "#ffd61e"],
  ["#281f21", "#ffefde", "#dcff62", "#ff4f9a", "#67a8ff", "#ff8f3d"]
];

function automataRows(rule, cols, rows, rng) {
  let row = Array.from({ length: cols }, () => rng() < .18 ? 1 : 0);
  if (!row.some(Boolean)) row[Math.floor(cols / 2)] = 1;
  const all = [row];
  for (let y = 1; y < rows; y += 1) {
    row = row.map((_, x) => {
      const l = row[(x - 1 + cols) % cols];
      const c = row[x];
      const r = row[(x + 1) % cols];
      return (rule >> ((l << 2) | (c << 1) | r)) & 1;
    });
    all.push(row);
  }
  return all;
}

function buildGraph(count, rng) {
  const graph = Array.from({ length: count }, (_, i) => new Set([(i + 1) % count, (i - 1 + count) % count]));
  const connect = (from, to) => {
    const target = (to + count) % count;
    if (target !== from) graph[from].add(target);
  };
  graph.forEach((edges, i) => {
    // Saltos con escalas incompatibles: el anillo mantiene la continuidad y
    // los puentes impiden que cuatro páginas se conviertan en todo el mundo.
    connect(i, i + 7);
    connect(i, i + 13);
    connect(i, i + 29);
    connect(i, i + Math.max(5, Math.floor(count * .381966)));
    const targetSize = Math.min(count - 1, int(rng, 7, 10));
    while (edges.size < targetSize) {
      const target = int(rng, 0, count - 1);
      if (target !== i) edges.add(target);
    }
  });
  [6, 13].filter(id => id < count).forEach((id, family) => {
    [17, 31, 47, 61, 79].forEach((jump, index) => connect(id, id + jump + family * 5 + index));
  });
  return graph.map(set => Array.from(set));
}

const graph = buildGraph(PAGE_COUNT, worldRng);
const hiddenSet = new Set(sample(worldRng, Array.from({ length: PAGE_COUNT }, (_, i) => i).slice(2), Math.max(3, Math.floor(PAGE_COUNT * .13))));

const nodes = Array.from({ length: PAGE_COUNT }, (_, id) => {
  const rng = rngFrom(`${WORLD_SEED}:page:${id}`);
  const topology = TOPOLOGIES[id % TOPOLOGIES.length];
  const lineage = topology === "form" || topology === "oracleparty" ? "006"
    : topology === "destruction" || topology === "vanishingmap" ? "013" : null;
  const palette = PALETTES[(id + int(rng, 0, PALETTES.length - 1)) % PALETTES.length];
  const rhythm = topology === "destruction" || topology === "timepoem" || topology === "vanishingmap" ? "slow"
    : topology === "index" || topology === "diagram" || topology === "oracleparty" ? "click"
      : topology === "field" || topology === "cellulararchive" || topology === "diagramtext" ? "scroll" : pick(rng, RHYTHMS);
  const noiseLevel = topology === "garden" ? 2.8 : topology === "textstorm" || topology === "diagramtext" ? 2.45
    : topology === "charts" || topology === "diagram" ? 2.15 : topology === "cellularloom" ? 1.9 : Number((.7 + rng() * 1.25).toFixed(2));
  const cannibalIntensity = topology === "cannibal" ? int(rng, 28, 44) : topology === "empty" ? 0
    : topology === "charts" || topology === "cellularloom" || topology === "diagramtext" ? int(rng, 7, 14) : int(rng, 2, 8);
  return {
    id: pad(id),
    index: id,
    topology,
    topologyLabel: TOPOLOGY_LABELS[topology],
    lineage,
    secondary: pick(rng, TOPOLOGIES.filter(t => t !== topology)),
    palette,
    cellularRule: pick(rng, RULES),
    cellularMode: CELLULAR_MODES[id % CELLULAR_MODES.length],
    cellSize: int(rng, 4, 14),
    cellDensity: Number((.09 + rng() * .25).toFixed(2)),
    noiseLevel,
    buttonCount: topology === "form" ? int(rng, 10, 16) : topology === "oracleparty" ? int(rng, 15, 22) : 0,
    cannibalIntensity,
    fontMode: FONT_MODES[id % FONT_MODES.length],
    rhythm,
    iframeDepth: int(rng, 1, 3),
    mutationBudget: rhythm === "explosive" ? int(rng, 24, 38) : int(rng, 8, 24),
    operations: sample(rng, OPERATIONS, int(rng, 4, 8)),
    rareEvent: pick(rng, RARE),
    rareProbability: Number((.22 + rng() * .44).toFixed(2)),
    edges: graph[id].map(pad),
    hidden: hiddenSet.has(id),
    revealsArchive: hiddenSet.has(id),
    revealsMap: id % 9 === 4 || chance(rng, .13),
    zapping: topology !== "timepoem" && !lineage && id > 2 && (id % 11 === 7 || chance(rng, .1)),
    zappingDelay: int(rng, 14, 34),
    poemInterval: int(rng, 4200, 7200),
    diagramComplexity: int(rng, 9, 19),
    word: pick(rng, WORDS),
    title: `${pick(rng, WORDS).toLowerCase()} / ${pick(rng, MICRO)}`
  };
});

function pageHref(target) { return `./${pad(Number(target))}.html`; }
function route(rng, target, label, action = pick(rng, ACTIONS), extra = "") {
  return `<a class="route" href="${pageHref(target)}" data-target="${pad(Number(target))}" data-action="${action}" ${extra}>${esc(label || pick(rng, LINKS))}</a>`;
}
function routesFor(node, rng, count = node.edges.length) {
  return sample(rng, node.edges, Math.min(count, node.edges.length)).map((target, i) => route(rng, target, i === 0 ? pick(rng, LINKS) : null, i === 0 ? "normal" : pick(rng, ACTIONS))).join("");
}
function permanentRoutes(node, rng) {
  const distance = target => {
    const delta = Math.abs(Number(target) - node.index);
    return Math.min(delta, PAGE_COUNT - delta);
  };
  const targets = node.edges.slice().sort((a, b) => distance(b) - distance(a)).slice(0, 2);
  return `<nav class="permanent-routes" aria-label="dos rutas persistentes" style="--pr-x:${int(rng, 1, 82)}vw;--pr-y:${int(rng, 1, 88)}vh;--pr-r:${int(rng, -8, 8)}deg">${targets.map((target, i) => route(rng, target, i ? `territorio no usado ${target}` : pick(rng, LINKS), "normal", `data-fixed="1" data-indestructible="1" ${i ? `data-explore="1"` : "data-structural=\"1\""}`)).join("")}</nav>`;
}
function buttonField(node, rng) {
  const tail = sample(rng, BUTTON_OPERATIONS.slice(4), BUTTON_OPERATIONS.length - 4);
  const operations = Array.from({ length: node.buttonCount }, (_, i) => i < 4 ? BUTTON_OPERATIONS[i] : tail[(i - 4) % tail.length]);
  return `<div class="poem-button-field" aria-label="botones que alteran la página">${operations.map((operation, i) => `<button type="button" class="poem-button" data-operation="${operation}" style="--button-color:${node.palette[2 + (i % 4)]}">${esc(pick(rng, BUTTON_LABELS[operation]))}</button>`).join("")}</div>`;
}
function glyphString(rng, length) {
  const sets = sample(rng, GLYPH_SETS, int(rng, 1, 3)).flat();
  return Array.from({ length }, () => pick(rng, sets)).join("");
}

function tablePage(node, rng) {
  const cols = int(rng, 28, 48);
  const rows = int(rng, 18, 34);
  const cells = automataRows(node.cellularRule, cols, rows, rng);
  let edgeIndex = 0;
  const html = cells.map((row, y) => `<tr>${row.map((alive, x) => {
    if (alive && edgeIndex < node.edges.length && (x + y) % 13 === 0) {
      return `<td class="alive wide" colspan="${int(rng, 1, 4)}">${route(rng, node.edges[edgeIndex++], pick(rng, WORDS), pick(rng, ACTIONS))}</td>`;
    }
    const content = alive ? (chance(rng, .22) ? esc(pick(rng, WORDS)).slice(0, 1) : "") : (chance(rng, .025) ? esc(pick(rng, MICRO)) : "");
    return `<td class="${alive ? "alive" : "dead"}" data-mutable style="--cell-color:${node.palette[(x + y) % node.palette.length]}">${content}</td>`;
  }).join("")}</tr>`).join("");
  return `<main class="topology-table"><table class="lab-table"><caption class="sr-only">${esc(node.title)}</caption><tbody>${html}</tbody></table></main>`;
}

function fieldPage(node, rng) {
  const w = int(rng, 4200, 7600);
  const h = int(rng, 2600, 5600);
  const parts = [];
  parts.push(`<div class="monument outline" data-mutable style="left:${int(rng, 120, w - 1600)}px;top:${int(rng, 100, h - 900)}px">${esc(node.word)}</div>`);
  for (let i = 0; i < int(rng, 28, 48); i += 1) {
    const x = int(rng, 0, w - 500), y = int(rng, 0, h - 220);
    if (i < node.edges.length) parts.push(`<div class="${i === 1 ? "cursor-migrant" : ""}" style="left:${x}px;top:${y}px">${route(rng, node.edges[i], pick(rng, LINKS), pick(rng, ACTIONS))}</div>`);
    else if (chance(rng, .32)) parts.push(`<span class="glyph" data-mutable style="left:${x}px;top:${y}px;font-size:${int(rng, 14, 170)}px;color:${pick(rng, node.palette)}">${glyphString(rng, int(rng, 1, 8))}</span>`);
    else parts.push(`<span class="micro rotated" data-mutable style="left:${x}px;top:${y}px;--r:${int(rng, -90, 90)}deg">${esc(pick(rng, MICRO))}</span>`);
  }
  node.edges.slice(0, 3).forEach((target, i) => parts.push(`<span id="coordinate-${i}" class="coordinate-anchor" style="left:${int(rng, 0, w)}px;top:${int(rng, 0, h)}px">${route(rng, target, `x:${int(rng, -400, 8888)} y:${int(rng, -400, 8888)}`, "normal")}</span>`));
  return `<main class="absolute-world" style="--world-w:${w}px;--world-h:${h}px">${parts.join("")}</main>`;
}

function corridorPage(node, rng) {
  const zones = int(rng, 10, 17);
  const widths = Array.from({ length: zones }, () => int(rng, 380, 1700));
  const total = widths.reduce((a, b) => a + b, 0);
  let edgeIndex = 0;
  const html = widths.map((width, i) => {
    const bg = node.palette[(i + 2) % node.palette.length];
    const fg = node.palette[(i + 3) % node.palette.length];
    const link = edgeIndex < node.edges.length && (i % 2 === 0 || i === zones - 1)
      ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS), `style="--x:${int(rng, 5, 80)}%;--y:${int(rng, 8, 82)}%"`)
      : "";
    return `<section class="corridor-zone" style="--zone-w:${width}px;--zone-bg:${bg};--zone-fg:${fg}" data-mutable>${link}<div class="corridor-word">${esc(i % 3 ? pick(rng, WORDS) : glyphString(rng, int(rng, 4, 16)))}</div><span class="vertical micro" style="position:absolute;right:4px;top:4px">${esc(pick(rng, MICRO))}</span></section>`;
  }).join("");
  return `<main class="corridor" style="--world-w:${total}px">${html}</main>`;
}

function verticalPage(node, rng) {
  let edgeIndex = 0;
  const bands = Array.from({ length: int(rng, 8, 13) }, (_, i) => {
    const bg = node.palette[i % node.palette.length];
    const fg = node.palette[(i + 1) % node.palette.length];
    const link = edgeIndex < node.edges.length ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS), `style="--x:${int(rng, 6, 80)}%;--y:${int(rng, 38, 88)}%"`) : "";
    return `<section class="depth-band" style="--band-h:${int(rng, 80, 210)}vh;--band-bg:${bg};--band-fg:${fg}" data-mutable><div class="depth-word ${i % 2 ? "outline" : ""}">${esc(i % 4 ? pick(rng, WORDS) : glyphString(rng, int(rng, 3, 12)))}</div>${link}<p class="micro vertical" style="position:absolute;right:${int(rng, 2, 30)}%;bottom:4%">profundidad ${i} / regla ${node.cellularRule} / ${esc(pick(rng, MICRO))}</p></section>`;
  }).join("");
  return `<main class="vertical-document">${bands}</main>`;
}

function windowsPage(node, rng) {
  let edgeIndex = 0;
  const windows = Array.from({ length: int(rng, 8, 15) }, (_, i) => {
    const containsFrame = i === 2 && node.edges[2];
    const body = containsFrame
      ? `<iframe title="otra zona" loading="lazy" data-src="${pageHref(node.edges[2])}"></iframe>`
      : i < node.edges.length ? route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS)) : (chance(rng, .5) ? `<span class="glyph">${glyphString(rng, int(rng, 3, 34))}</span>` : esc(pick(rng, FRAGMENTS)));
    return `<section class="poem-window" data-mutable style="--x:${int(rng, -4, 78)}vw;--y:${int(rng, 1, 82)}vh;--w:${int(rng, 160, 520)}px;--h:${int(rng, 60, 330)}px;--z:${i};--win-bg:${node.palette[(i + 1) % node.palette.length]};--win-fg:${node.palette[(i + 2) % node.palette.length]};--bar-bg:${node.palette[(i + 3) % node.palette.length]}"><div class="window-bar"><span>${esc(pick(rng, MICRO))}</span><button class="window-close" aria-label="cerrar ventana">×</button></div><div class="window-body">${body}</div></section>`;
  }).join("");
  return `<main class="window-field">${windows}</main>`;
}

function iframesPage(node, rng) {
  const frames = Array.from({ length: int(rng, 6, 11) }, (_, i) => {
    const target = node.edges[i % node.edges.length];
    return `<section class="iframe-cell" data-mutable style="--x:${int(rng, -8, 82)}vw;--y:${int(rng, 2, 128)}vh;--w:${int(rng, 120, 600)}px;--h:${int(rng, 80, 430)}px;--r:${int(rng, -9, 9)}deg;--bw:${int(rng, 1, 16)}px;--frame-color:${node.palette[i % node.palette.length]}"><span class="iframe-label">${esc(pick(rng, MICRO))}</span><iframe title="${esc(pick(rng, MICRO))}" loading="lazy" data-src="${pageHref(target)}"></iframe></section>`;
  }).join("");
  return `<main class="iframe-field">${frames}<nav style="position:absolute;z-index:20;right:1vw;bottom:1vh">${routesFor(node, rng, 2)}</nav><div class="outline" style="position:absolute;left:2vw;bottom:1vh;font:900 16vw/.7 Arial">${esc(node.word)}</div></main>`;
}

function formPage(node, rng) {
  const checks = sample(rng, LINKS, 7).map((label, i) => `<label><input type="checkbox" ${i === 0 ? "checked" : ""}> ${esc(label)}</label>`).join("");
  const radios = sample(rng, MICRO, 5).map((label, i) => `<label><input type="radio" name="original" ${i === 0 ? "checked" : ""}> ${esc(label)}</label>`).join("");
  return `<form class="oracle-form" action="${pageHref(node.edges[0])}" method="get"><fieldset><legend>${glyphString(rng, 5)} / seleccione las regiones que existen</legend>${checks}</fieldset><fieldset><legend>versión considerada original</legend>${radios}<select aria-label="gramática cromática"><option value="${node.palette[0]}">agua</option><option value="${node.palette[2]}">ventana</option><option value="${node.palette[4]}">error</option></select>${routesFor(node, rng, 2)}</fieldset><fieldset><legend>entropía del DOM</legend><input type="range" min="0" max="100" value="${int(rng, 12, 78)}"><progress max="100" value="${int(rng, 20, 90)}"></progress><meter min="0" max="1" value="${rng().toFixed(2)}"></meter><output>${esc(pick(rng, MICRO))}</output></fieldset><fieldset><legend>reescriba el atributo que lo contiene</legend><textarea name="cauce">${esc(pick(rng, FRAGMENTS))}</textarea><button type="submit">${esc(pick(rng, LINKS))}</button></fieldset></form>`;
}

function sourcePage(node, rng) {
  const edge = () => node.edges[int(rng, 0, node.edges.length - 1)];
  const lines = [
    [`&lt;!doctype <button class="code-token" data-op="class">html</button>&gt;`, 0],
    [`&lt;<button class="code-token" data-op="div">html</button> lang="otra-agua" data-original="ninguno"&gt;`, 0],
    [`&lt;head&gt;&lt;title&gt;${esc(node.title)}&lt;/title&gt;&lt;/head&gt;`, 2],
    [`&lt;body class="<button class="code-token" data-op="class">cauce archivo margen</button>"&gt;`, 0],
    [`&lt;table data-regla="${node.cellularRule}"&gt;`, 4],
    [`&lt;tr&gt;&lt;td&gt;${glyphString(rng, 12)}&lt;/td&gt;&lt;/tr&gt;`, 8],
    [`&lt;a <button class="code-token" data-op="href">href</button>="${pageHref(edge())}"&gt;${esc(pick(rng, LINKS))}&lt;/a&gt;`, 8],
    [`&lt;div data-memoria="imperfecta"&gt;${esc(pick(rng, FRAGMENTS))}`, 12],
    [`<button class="code-token" data-op="close">&lt;/div&gt;</button>`, 12],
    [`&lt;!-- ${esc(pick(rng, MICRO))} --&gt;`, 4],
    [`&lt;a href="${pageHref(edge())}"&gt;${esc(pick(rng, CODE))}&lt;/a&gt;`, 22],
    [`<button class="code-token" data-op="close">&lt;/body&gt;</button>&lt;/html&gt;`, 0]
  ];
  return `<main class="source-world">${lines.concat(lines.slice(4, int(rng, 7, 12))).map(([line, indent]) => `<div class="code-line" data-mutable style="--indent:${indent}ch">${line}</div>`).join("")}<div class="code-line" style="--indent:8ch">&lt;a href=\"${pageHref(node.edges[0])}\"&gt; ${route(rng, node.edges[0], "href", "normal")} &lt;/a&gt;</div></main>`;
}

function cellularPage(node, rng) {
  const links = Array.from({ length: int(rng, 14, 36) }, (_, i) => {
    if (i % int(rng, 3, 7)) return `<span></span>`;
    return route(rng, node.edges[i % node.edges.length], chance(rng, .5) ? glyphString(rng, 1) : pick(rng, WORDS).slice(0, 1), pick(rng, ACTIONS));
  }).join("");
  return `<main class="cellular-page"><canvas class="cellular-canvas" aria-hidden="true"></canvas><div class="cellular-links" style="--cols:${int(rng, 14, 38)}">${links}</div><div class="cellular-title">${esc(node.word)}</div></main>`;
}

function cellularLoomPage(node, rng) {
  const modes = ["wolfram", "conway", "cyclic", "typographic"];
  const panels = Array.from({ length: int(rng, 9, 15) }, (_, i) => {
    const mode = modes[(i + node.index) % modes.length];
    const rule = RULES[(i * 3 + node.index) % RULES.length];
    const routeNode = i % 4 === 0 ? route(rng, node.edges[i % node.edges.length], pick(rng, LINKS), pick(rng, ACTIONS)) : "";
    return `<figure class="automata-specimen" data-mutable style="--specimen-color:${node.palette[2 + (i % 4)]};--specimen-r:${int(rng, -4, 4)}deg"><canvas class="cellular-panel" data-mode="${mode}" data-rule="${rule}" data-cell="${int(rng, 3, 12)}" data-density="${(.08 + rng() * .3).toFixed(2)}" aria-label="autómata ${mode}, regla ${rule}"></canvas><figcaption><b>gen.${rule}</b> ${mode} / ${esc(pick(rng, MICRO))} ${routeNode}</figcaption></figure>`;
  }).join("");
  return `<main class="automata-loom"><header><span>CELULAR × ${panels.length}</span><strong class="outline">${esc(node.word)}</strong></header><section class="automata-loom-grid">${panels}</section><pre class="automata-loom-code" aria-hidden="true">${esc(sample(rng, FAUX_CODE, 8).join("\n"))}</pre></main>`;
}

function cellularArchivePage(node, rng) {
  const modes = ["wolfram", "typographic", "conway", "cyclic"];
  const tapes = Array.from({ length: int(rng, 6, 10) }, (_, i) => {
    const rule = RULES[(node.index + i * 2) % RULES.length];
    const cols = int(rng, 30, 64);
    const rows = int(rng, 9, 18);
    const transcript = automataRows(rule, cols, rows, rng).map((row, y) => row.map((alive, x) => alive ? pick(rng, ["█", "▓", "1", node.word.slice(0, 1)]) : ((x + y) % 13 ? " " : "·")).join("")).join("\n");
    return `<section class="generation-tape" data-mutable style="--tape-color:${node.palette[2 + (i % 4)]};--tape-w:${int(rng, 520, 1100)}px"><header><span>${String(i).padStart(2, "0")} / gen.${rule}</span><span>${modes[(i + node.index) % modes.length]}</span>${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), pick(rng, ACTIONS)) : ""}</header><pre class="cellular-transcript">${esc(transcript)}</pre><canvas class="cellular-panel cellular-strip" data-mode="${modes[(i + node.index) % modes.length]}" data-rule="${rule}" data-cell="${int(rng, 3, 8)}" data-density="${(.1 + rng() * .2).toFixed(2)}" aria-hidden="true"></canvas></section>`;
  }).join("");
  return `<main class="generation-archive"><div class="generation-archive-title outline">${esc(node.word)}</div><div class="generation-track">${tapes}</div></main>`;
}

function timePoemPage(node, rng) {
  const offset = node.index % TIME_POEM.length;
  const poem = TIME_POEM.map((_, i) => TIME_POEM[(i + offset) % TIME_POEM.length]);
  const lines = poem.map((line, i) => `<p class="timepoem-line" data-time-line data-line-number="${i + 1}" data-line="${esc(line)}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span></p>`).join("");
  return `<main class="timepoem-world" style="--poem-interval:${node.poemInterval}ms"><canvas class="timepoem-cells cellular-panel" data-mode="typographic" data-rule="${node.cellularRule}" data-cell="${int(rng, 12, 22)}" data-density="${node.cellDensity}" aria-hidden="true"></canvas><header><p>este poema sólo utiliza el tiempo que le das</p><h1 class="outline">${esc(node.word)}</h1><div class="timepoem-clock"><span data-poem-count>0</span> / ${poem.length} líneas · <span data-poem-seconds>0</span>s</div></header><section class="timepoem-lines" aria-live="polite">${lines}</section><footer>${esc(pick(rng, MICRO))} · no hay botón para adelantar</footer></main>`;
}

function indexPage(node, rng) {
  const links = Array.from({ length: int(rng, 28, 64) }, (_, i) => route(rng, node.edges[i % node.edges.length], i % 4 ? pick(rng, LINKS) : `${pad(i)}.${pick(rng, MICRO)}`, i % 5 === 0 ? "multiply" : pick(rng, ["multiply", "multiply", "destroy", "normal"]), `style="--r:${int(rng, -12, 12)}deg;--s:${int(rng, 7, 28)}px"`)).join("");
  return `<main class="explosive-index"><nav aria-label="índice que se reproduce">${links}</nav><div class="index-collapse outline">${esc(node.word)}</div></main>`;
}

function emptyPage(node, rng) {
  const w = int(rng, 4200, 7800), h = int(rng, 3200, 6500);
  const links = node.edges.map((target, i) => `<a class="route ${i ? "empty-pixel" : "micro"}" href="${pageHref(target)}" data-target="${target}" data-action="${i ? "normal" : pick(rng, ACTIONS)}" style="left:${int(rng, 80, w - 200)}px;top:${int(rng, 80, h - 100)}px">${i ? "·" : esc(pick(rng, MICRO))}</a>`).join("");
  return `<main class="empty-world" style="--world-w:${w}px;--world-h:${h}px">${links}<span class="micro" style="left:${int(rng, 30, w - 300)}px;top:${int(rng, 30, h - 100)}px">${esc(pick(rng, MICRO))}</span></main>`;
}

function errorPage(node, rng) {
  const rows = Array.from({ length: int(rng, 5, 10) }, (_, i) => `<tr><td>${i ? "" : esc(pick(rng, WORDS))}</td><td>${esc(pick(rng, ERRORS))}</td><td>${i < node.edges.length ? route(rng, node.edges[i], i ? "∅" : pick(rng, LINKS), pick(rng, ACTIONS)) : "href=\"\""}</td></tr>`).join("");
  return `<main class="error-world"><aside class="error-aside"><p>${esc(pick(rng, CODE))}</p><p>${esc(pick(rng, MICRO))}</p><form class="repair-form"><label>archivo de reparación <input value="${esc(pick(rng, WORDS))}"></label><button>reparar antes</button></form></aside><section class="error-body"><div class="error-code outline">${pick(rng, ["404", "0/0", "∅", "302"])}</div><img class="missing-image" src="../adendas/imagen-que-no-existe-${node.id}.gif" alt="imagen ausente: ${esc(pick(rng, FRAGMENTS))}"><table class="broken-table">${rows}</table></section></main>`;
}

function glyphPage(node, rng) {
  const layers = Array.from({ length: int(rng, 7, 12) }, (_, i) => {
    let material = glyphString(rng, int(rng, 80, 430));
    if (i < node.edges.length) material = `${material.slice(0, 30)} ${route(rng, node.edges[i], glyphString(rng, int(rng, 1, 3)), pick(rng, ACTIONS))} ${material.slice(30)}`;
    return `<div class="glyph-layer" data-mutable style="top:${int(rng, -5, 105)}vh;--size:${int(rng, 12, 110)}px;--tracking:${int(rng, -4, 14)}px;--layer-color:${node.palette[i % node.palette.length]}">${material}</div>`;
  }).join("");
  return `<main class="glyph-landscape" style="--sky:${node.palette[0]}">${layers}<span class="vertical micro" style="position:absolute;z-index:20;right:1vw;top:2vh">${esc(pick(rng, FRAGMENTS))}</span></main>`;
}

function destructionPage(node, rng) {
  let edgeIndex = 0;
  const mortals = Array.from({ length: int(rng, 35, 72) }, (_, i) => {
    if (edgeIndex < node.edges.length && i % 11 === 0) return `<span class="mortal" data-mortal-id="${node.id}-${i}">${route(rng, node.edges[edgeIndex++], pick(rng, LINKS), pick(rng, ACTIONS))}</span>`;
    const tag = pick(rng, ["span", "b", "i", "mark", "small", "code"]);
    return `<${tag} class="mortal" data-mutable data-mortal-id="${node.id}-${i}">${chance(rng, .35) ? glyphString(rng, int(rng, 1, 8)) : esc(pick(rng, i % 3 ? MICRO : FRAGMENTS))}</${tag}>`;
  }).join("");
  return `<main class="destruction-field"><div style="font:900 18vw/.7 Arial" class="outline">${esc(node.word)}</div>${mortals}</main>`;
}

function reproducerPage(node, rng) {
  const children = Array.from({ length: int(rng, 5, 10) }, (_, i) => `<section class="descendant" data-mutable style="--x:${int(rng, 0, 78)}vw;--y:${int(rng, 2, 76)}vh;--w:${int(rng, 120, 460)}px;--h:${int(rng, 70, 300)}px;--desc-bg:${node.palette[(i + 2) % node.palette.length]};--desc-fg:${node.palette[(i + 3) % node.palette.length]};--desc-shadow:${node.palette[(i + 4) % node.palette.length]}">${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), i === 0 ? "reproduce" : pick(rng, ACTIONS), i === 0 ? `data-birth="download"` : "") : esc(pick(rng, FRAGMENTS))}</section>`).join("");
  return `<main class="reproducer-field"><div class="micro">doble clic: producir un interior · ${esc(pick(rng, MICRO))}</div>${children}</main>`;
}

function textstormPage(node, rng) {
  const rain = Array.from({ length: int(rng, 11, 24) }, (_, i) => {
    const words = Array.from({ length: int(rng, 12, 32) }, () => pick(rng, RAIN_WORDS)).join(" · ");
    return `<div class="text-rain-column" data-mutable style="--rain-x:${int(rng, -6, 96)}%;--rain-size:${int(rng, 7, 36)}px;--rain-delay:${(-rng() * 16).toFixed(2)}s;--rain-speed:${int(rng, 11, 38)}s;--rain-color:${node.palette[i % node.palette.length]}">${esc(words)}</div>`;
  }).join("");
  const faux = Array.from({ length: int(rng, 18, 38) }, (_, i) => `${String(i).padStart(3, "0")} ${pick(rng, FAUX_CODE)} /* ${pick(rng, MICRO)} */`).join("\n");
  const blocks = [
    `<blockquote><p>${esc(pick(rng, LITERARY))}</p><cite>${esc(pick(rng, MICRO))}</cite></blockquote>`,
    `<details ${chance(rng, .55) ? "open" : ""}><summary>${esc(pick(rng, LINKS))}</summary><p>${esc(pick(rng, LITERARY))}</p></details>`,
    `<dl><dt>${esc(pick(rng, WORDS))}</dt><dd>${esc(pick(rng, LITERARY))}</dd><dt>${esc(pick(rng, WORDS))}</dt><dd>${esc(pick(rng, MICRO))}</dd></dl>`,
    `<address>${esc(pick(rng, FRAGMENTS))}<br>${esc(pick(rng, CODE))}</address>`,
    `<figure><div class="visual-writing">${esc(Array.from({ length: int(rng, 8, 22) }, () => pick(rng, WORDS)).join(" "))}</div><figcaption>${esc(pick(rng, LITERARY))}</figcaption></figure>`,
    `<ol>${sample(rng, RAIN_WORDS, 6).map(word => `<li>${esc(word)}</li>`).join("")}</ol>`
  ];
  const islands = sample(rng, LITERARY, int(rng, 3, 6)).map((text, i) => `<article class="legible-island" style="--island-x:${int(rng, 2, 72)}%;--island-y:${int(rng, 4, 78)}%;--island-bg:${node.palette[(i + 1) % node.palette.length]};--island-fg:${node.palette[(i + 2) % node.palette.length]}"><p>${esc(text)}</p>${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), pick(rng, ACTIONS)) : ""}</article>`).join("");
  return `<main class="textstorm-world"><canvas class="embedded-automata" aria-hidden="true"></canvas><div class="faux-code-wall" aria-hidden="true"><pre>${esc(faux)}</pre></div><div class="op-texture" aria-hidden="true">${esc(Array.from({ length: 90 }, (_, i) => i % 3 ? node.word : pick(rng, WORDS)).join(" "))}</div><section class="block-archive">${blocks.join("")}</section><div class="text-rain">${rain}</div>${islands}<div class="textstorm-monument outline">${esc(node.word)}</div></main>`;
}

function asciiPage(node, rng) {
  const planes = Array.from({ length: int(rng, 5, 11) }, (_, i) => {
    const sculpture = pick(rng, ASCII_SCULPTURES);
    const cellular = automataRows(node.cellularRule, int(rng, 18, 42), int(rng, 5, 14), rng).map(row => row.map(cell => cell ? pick(rng, ["█", "▓", "#", "+", "1"]) : pick(rng, [" ", " ", "·", "0"])).join("")).join("\n");
    return `<pre class="ascii-plane" data-mutable style="--ascii-x:${int(rng, -4, 76)}%;--ascii-y:${int(rng, -6, 86)}%;--ascii-size:${int(rng, 7, 34)}px;--ascii-r:${int(rng, -10, 10)}deg;--ascii-color:${node.palette[i % node.palette.length]}">${esc(chance(rng, .55) ? sculpture : cellular)}</pre>`;
  }).join("");
  const routes = node.edges.slice(0, 3).map((target, i) => `<div class="ascii-route" style="--x:${int(rng, 2, 84)}%;--y:${int(rng, 8, 88)}%">${route(rng, target, i ? `[${pick(rng, WORDS)}]` : "+---- href ----+", pick(rng, ACTIONS))}</div>`).join("");
  return `<main class="ascii-world"><div class="ascii-microtexture" aria-hidden="true">${esc(Array.from({ length: 400 }, () => pick(rng, [".", ":", "+", "-", "0", "1", " "])).join(""))}</div>${planes}${routes}<p class="ascii-literary">${esc(pick(rng, LITERARY))}</p></main>`;
}

function gardenPage(node, rng) {
  const zones = ["aire", "montaña", "bosque", "orilla", "agua", "abismo", "raíz", "archivo"];
  const strata = zones.map((zone, i) => `<div class="garden-stratum" style="--stratum-y:${i * 12.5}%;--stratum-color:${node.palette[i % node.palette.length]}"><span>${esc(zone)}</span><span class="garden-glyphs">${glyphString(rng, int(rng, 16, 70))}</span></div>`).join("");
  const notes = sample(rng, LITERARY, int(rng, 5, 9)).map((text, i) => `<article class="garden-note" data-mutable style="--note-x:${int(rng, 3, 76)}%;--note-y:${int(rng, 4, 88)}%;--note-color:${node.palette[(i + 2) % node.palette.length]}"><p>${esc(text)}</p>${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), pick(rng, ACTIONS)) : ""}</article>`).join("");
  return `<main class="garden-world"><canvas class="garden-canvas" aria-hidden="true"></canvas><div class="garden-strata">${strata}</div>${notes}<pre class="garden-code" aria-hidden="true">${esc(sample(rng, FAUX_CODE, 6).join("\n"))}</pre><div class="garden-title outline">${esc(node.word)}</div></main>`;
}

function chartPage(node, rng) {
  const modes = ["bars", "line", "scatter", "radial", "strata", "stream", "moire", "glitch", "constellation", "glyph", "cellular", "erosion"];
  const figures = Array.from({ length: int(rng, 12, 19) }, (_, i) => `<figure class="generative-chart" data-chart="${modes[i % modes.length]}" style="--chart-color:${node.palette[2 + (i % 4)]};--chart-r:${int(rng, -8, 8)}deg;--chart-h:${int(rng, 150, 390)}px"><button type="button" class="chart-close" aria-label="cerrar gráfica">×</button><canvas data-height="${int(rng, 130, 340)}"></canvas><figcaption>${esc(pick(rng, ["densidad de lluvia", "historial del cauce", "población de enlaces", "pérdida por color", "ruido acumulado", "botones todavía vivos", "tiempo usado", "erosión del DOM", "constelación de reglas", "moiré de visitas"]))} / ${node.id}</figcaption></figure>`).join("");
  return `<main class="chart-world"><div class="chart-wall-title outline">${esc(node.word)}</div><pre class="chart-source" aria-hidden="true">${esc(sample(rng, FAUX_CODE, 8).join("\n"))}</pre><section class="chart-grid">${figures}</section><aside class="chart-reading"><p>${esc(pick(rng, LITERARY))}</p>${routesFor(node, rng, 3)}</aside></main>`;
}

function cannibalPage(node, rng) {
  const source = Array.from({ length: int(rng, 18, 32) }, (_, i) => `${String(i).padStart(3, "0")} :: ${pick(rng, FAUX_CODE)} // ${pick(rng, MICRO)}`).join("\n");
  return `<main class="cannibal-world" data-cannibal-root><pre class="cannibal-source" aria-hidden="true">${esc(source)}</pre><div class="cannibal-title outline">${esc(node.word)}</div><section class="cannibal-stage" aria-label="página ensamblada desde código de otras páginas"></section><nav class="cannibal-routes">${routesFor(node, rng, 3)}</nav></main>`;
}

function diagramGeometry(node, rng, count = node.diagramComplexity) {
  const points = Array.from({ length: count }, (_, i) => ({
    x: int(rng, 7, 91), y: int(rng, 8, 86), color: node.palette[2 + (i % 4)],
    label: DIAGRAM_LABELS[(node.index + i * 3) % DIAGRAM_LABELS.length]
  }));
  const lines = points.map((point, i) => {
    const target = points[(i * 5 + 3) % points.length];
    const bendX = Math.round((point.x + target.x) * 5 + int(rng, -130, 130));
    const bendY = Math.round((point.y + target.y) * 3.5 + int(rng, -90, 90));
    return `<path d="M ${point.x * 10} ${point.y * 7} Q ${bendX} ${bendY} ${target.x * 10} ${target.y * 7}" style="--line-color:${point.color}" marker-end="url(#arrow-${node.id})"></path>`;
  }).join("");
  const svg = `<svg class="diagram-links" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow-${node.id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"></path></marker></defs>${lines}</svg>`;
  return { points, svg };
}

function diagramPage(node, rng) {
  const { points, svg } = diagramGeometry(node, rng);
  const nodesHTML = points.map((point, i) => {
    const content = i % 3 === 0 ? pick(rng, LITERARY) : point.label;
    const link = i < node.edges.length ? route(rng, node.edges[i], i % 2 ? point.label : pick(rng, LINKS), "normal") : "";
    return `<article class="diagram-node" tabindex="0" data-diagram-node data-mutable style="--dx:${point.x}%;--dy:${point.y}%;--node-color:${point.color};--node-r:${int(rng, -7, 7)}deg"><span class="diagram-number">${String(i).padStart(2, "0")}</span><p>${esc(content)}</p>${link}</article>`;
  }).join("");
  return `<main class="diagram-world" data-diagram-world><div class="diagram-title outline">${esc(node.word)}</div>${svg}<section class="diagram-field">${nodesHTML}</section><p class="diagram-instruction">toca dos cajas para inventar una relación · doble clic en el fondo para producir un nodo ilegítimo</p></main>`;
}

function diagramTextPage(node, rng) {
  const paragraphs = Array.from({ length: int(rng, 15, 23) }, (_, i) => DIAGRAM_TEXT[(i + node.index) % DIAGRAM_TEXT.length]);
  const apertures = Array.from({ length: int(rng, 9, 16) }, (_, i) => {
    const link = i < node.edges.length ? route(rng, node.edges[i], pick(rng, DIAGRAM_LABELS), "normal") : `<span>${esc(pick(rng, DIAGRAM_LABELS))}</span>`;
    return `<aside class="diagram-aperture" data-diagram-node data-mutable tabindex="0" style="--dx:${int(rng, 4, 88)}%;--dy:${int(rng, 5, 91)}%;--dw:${int(rng, 9, 29)}vw;--dh:${int(rng, 12, 48)}vh;--node-color:${node.palette[2 + (i % 4)]};--node-r:${int(rng, -5, 5)}deg">${link}</aside>`;
  }).join("");
  const { svg } = diagramGeometry(node, rng, int(rng, 12, 22));
  return `<main class="diagram-text-world" data-diagram-world><article class="diagram-essay">${paragraphs.map((text, i) => `<p data-mutable><sup>${String(i + 1).padStart(2, "0")}</sup> ${esc(text)}</p>`).join("")}</article><div class="diagram-ghost-text" aria-hidden="true">${esc(Array.from({ length: 44 }, (_, i) => i % 4 ? pick(rng, DIAGRAM_LABELS) : pick(rng, FAUX_CODE)).join(" · "))}</div>${svg}<section class="diagram-apertures">${apertures}</section><div class="diagram-text-title outline">${esc(node.word)}</div></main>`;
}

function oraclePartyPage(node, rng) {
  const { points, svg } = diagramGeometry(node, rng, int(rng, 8, 13));
  const satellites = points.map((point, i) => `<span class="oracle-satellite" data-diagram-node tabindex="0" style="--dx:${point.x}%;--dy:${point.y}%;--node-color:${point.color}">${i < node.edges.length ? route(rng, node.edges[i], point.label, "normal") : esc(point.label)}</span>`).join("");
  return `<main class="oracle-party diagram-world" data-diagram-world><div class="family-label">006 tuvo descendencia / los controles ahora conectan regiones</div>${svg}${formPage(node, rng)}<section class="oracle-satellites">${satellites}</section><div class="diagram-title outline">${esc(node.word)}</div></main>`;
}

function vanishingMapPage(node, rng) {
  const { points, svg } = diagramGeometry(node, rng, int(rng, 12, 20));
  const nodesHTML = points.map((point, i) => `<article class="diagram-node mortal" data-mortal-id="${node.id}-map-${i}" data-diagram-node data-mutable tabindex="0" style="--dx:${point.x}%;--dy:${point.y}%;--node-color:${point.color};--node-r:${int(rng, -9, 9)}deg"><span class="diagram-number">013.${String(i).padStart(2, "0")}</span><p>${esc(i % 2 ? point.label : pick(rng, LITERARY))}</p>${i < node.edges.length ? route(rng, node.edges[i], pick(rng, LINKS), "normal") : ""}</article>`).join("");
  return `<main class="diagram-world vanishing-map" data-diagram-world><div class="family-label">013 dibuja todo lo que está a punto de perder</div>${svg}<section class="diagram-field">${nodesHTML}</section><div class="diagram-title outline">${esc(node.word)}</div><p class="diagram-instruction">las relaciones duran menos que sus residuos</p></main>`;
}

const renderers = {
  table: tablePage, field: fieldPage, corridor: corridorPage, vertical: verticalPage,
  windows: windowsPage, iframes: iframesPage, form: formPage, source: sourcePage,
  cellular: cellularPage, index: indexPage, empty: emptyPage, error: errorPage,
  glyphs: glyphPage, destruction: destructionPage, reproducer: reproducerPage,
  textstorm: textstormPage, ascii: asciiPage, garden: gardenPage, charts: chartPage,
  cannibal: cannibalPage, cellularloom: cellularLoomPage,
  cellulararchive: cellularArchivePage, timepoem: timePoemPage,
  diagram: diagramPage, diagramtext: diagramTextPage,
  oracleparty: oraclePartyPage, vanishingmap: vanishingMapPage
};

function renderPageBody(node) {
  const rng = rngFrom(`${WORLD_SEED}:render:${node.id}`);
  return { rng, body: renderers[node.topology](node, rng) };
}

function unique(list) { return Array.from(new Set(list.filter(Boolean))); }

function genomeFor(node) {
  const body = renderPageBody(node).body;
  const rng = rngFrom(`${WORLD_SEED}:genome:${node.id}`);
  const tags = unique(Array.from(body.matchAll(/<([a-z][\w-]*)\b/gi), match => match[1].toLowerCase()));
  const classes = unique(Array.from(body.matchAll(/class="([^"]+)"/g), match => match[1].split(/\s+/)).flat());
  const styles = unique(Array.from(body.matchAll(/style="([^"]+)"/g), match => match[1]));
  const texts = unique(Array.from(body.matchAll(/>([^<>]{3,360})</g), match => match[1].replace(/\s+/g, " ").trim())).filter(text => !/^\s*$/.test(text));
  const charts = unique(Array.from(body.matchAll(/data-chart="([^"]+)"/g), match => match[1]));
  const hrefs = unique(Array.from(body.matchAll(/href="([^"]+)"/g), match => match[1]));
  const snippets = [];
  const pattern = /<(p|pre|blockquote|article|aside|figure|section|div|code|span)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of body.matchAll(pattern)) {
    const html = match[0];
    if (html.length >= 28 && html.length <= 2600 && !/<iframe|<script/i.test(html)) snippets.push(html);
  }
  return {
    id: node.id,
    topology: node.topology,
    fontMode: node.fontMode,
    palette: node.palette,
    hidden: node.hidden,
    edges: node.edges,
    lineage: node.lineage,
    tags: sample(rng, tags, Math.min(tags.length, 14)),
    classes: sample(rng, classes, Math.min(classes.length, 20)),
    styles: sample(rng, styles, Math.min(styles.length, 16)),
    texts: sample(rng, texts.length ? texts : [pick(rng, FRAGMENTS)], Math.min(Math.max(1, texts.length), 18)),
    snippets: sample(rng, snippets.length ? snippets : [`<p>${esc(pick(rng, FRAGMENTS))}</p>`], Math.min(Math.max(1, snippets.length), 10)),
    charts,
    hrefs,
    code: sample(rng, FAUX_CODE.concat(CODE), 8)
  };
}

function pageDocument(node) {
  const { rng, body } = renderPageBody(node);
  const [bg, fg, a, b, c, d] = node.palette;
  const vars = `--bg:${bg};--fg:${fg};--a:${a};--b:${b};--c:${c};--d:${d};--cell:${node.cellSize + 8}px;--speed:${int(rng, 4, 15)}s`;
  const className = `topology-${node.topology}${node.lineage ? ` lineage-${node.lineage}` : ""}`;
  const archive = node.revealsArchive ? `<a class="route event-archive-link" data-fixed="1" href="../acontecimientos.html?seed=${encodeURIComponent(WORLD_SEED)}">el archivo de acontecimientos apareció</a>` : "";
  const mapAccess = node.revealsMap ? `<button type="button" class="used-map-button" data-open-used-map>mapa de páginas usadas</button>` : "";
  const config = { ...node, worldSeed: WORLD_SEED };
  return `<!doctype html>
<html lang="es" style="${vars}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${esc(node.title)}</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/mutaciones.css">
  <script>window.LAB_PAGE=${JSON.stringify(config).replace(/</g, "\\u003c")};</script>
  <script defer src="../js/corpus.js"></script>
  <script defer src="../js/automatas.js"></script>
  <script defer src="../js/acontecimientos.js"></script>
  <script defer src="../js/graficas.js"></script>
  <script defer src="../js/ruido.js"></script>
  <script defer src="../js/rutas.js"></script>
  <script defer src="../js/genoma-paginas.js"></script>
  <script defer src="../js/reliquias.js"></script>
  <script defer src="../js/tlahtolli.js"></script>
  <script defer src="../js/diagramas.js"></script>
  <script defer src="../js/gramaticas.js"></script>
  <script defer src="../js/motor.js"></script>
  <script defer src="../js/canibal.js"></script>
  <script defer src="../js/zapping.js"></script>
  <script defer src="../js/sonido.js"></script>
</head>
<body class="${className}" data-topology="${node.topology}" data-font="${node.fontMode}"${node.lineage ? ` data-lineage="${node.lineage}"` : ""}>
  <canvas class="ambient-noise-canvas" aria-hidden="true"></canvas>
  <div class="lab-meta" aria-hidden="true"><span>${node.id}</span><span>R${node.cellularRule}</span><span>${esc(node.rhythm)}</span></div>
  ${body}
  ${node.topology === "form" || node.topology === "oracleparty" ? buttonField(node, rng) : ""}
  ${permanentRoutes(node, rng)}
  ${archive}
  ${mapAccess}
</body>
</html>`;
}

function portalDocument() {
  const visible = nodes.filter(node => !node.hidden);
  const cells = Array.from({ length: 192 }, (_, i) => {
    const node = visible[(i * 7 + 3) % visible.length];
    const live = (i * node.cellularRule + node.index) % 11 < 3;
    if (!live && i % 17) return `<span style="background:${nodes[i % nodes.length].palette[i % 6]}"></span>`;
    return `<a href="paginas/${node.id}.html?seed=${encodeURIComponent(WORLD_SEED)}" data-target="${node.id}" title="${esc(node.topologyLabel)}">${i % 5 ? esc(node.word.slice(0, 1)) : node.id}</a>`;
  }).join("");
  const palette = nodes[0].palette;
  return `<!doctype html><html lang="es" style="--bg:${palette[0]};--fg:${palette[1]};--a:${palette[2]};--b:${palette[3]};--c:${palette[4]};--d:${palette[5]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>otra internet dentro del mismo corpus</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="css/base.css"><script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"portal",topologyLabel:"umbral sonoro"};</script><script defer src="js/corpus.js"></script><script defer src="js/acontecimientos.js"></script><script defer src="js/reliquias.js"></script><script defer src="js/tlahtolli.js"></script><script defer src="js/sonido.js"></script></head><body><main class="portal"><div class="portal-grid">${cells}</div><h1 class="portal-title outline">${esc(nodes[0].word)}<br>${esc(nodes[1].word)}</h1><form class="seed-form" id="seed-form"><input name="seed" value="${esc(WORLD_SEED)}" aria-label="semilla"><button type="submit">otra internet no usada</button><button type="button" id="sound-entry">entrar con sonido</button><a class="route" href="mapa.html?seed=${encodeURIComponent(WORLD_SEED)}">mapa que miente</a><a class="route" href="reliquias.html?seed=${encodeURIComponent(WORLD_SEED)}">amoxtli de reliquias</a></form></main><script>document.getElementById('seed-form').addEventListener('submit',function(e){e.preventDefault();var s=this.seed.value||Math.random().toString(36).slice(2);var all=Array.from(document.querySelectorAll('.portal-grid a'));var unique=Array.from(new Map(all.map(function(a){return[a.dataset.target,a]})).values());var memory={};try{memory=JSON.parse(localStorage.getItem('laberinto:'+s)||'{}')}catch(error){}var visited=memory.visited||[];var recent=memory.recent||[];var pool=unique.filter(function(a){return visited.indexOf(a.dataset.target)<0&&recent.indexOf(a.dataset.target)<0});if(!pool.length)pool=unique.filter(function(a){return recent.indexOf(a.dataset.target)<0});if(!pool.length)pool=unique;var link=pool[Math.floor(Math.random()*pool.length)];location.href=link.getAttribute('href').replace(/seed=[^&]*/, 'seed='+encodeURIComponent(s));});</script></body></html>`;
}

function mapDocument() {
  return `<!doctype html>
<html lang="es" style="--bg:#eadcc7;--fg:#101c2b;--a:#ff6b00;--b:#147bff;--c:#b7ff3c;--d:#ff4fa3">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>mapa de páginas usadas</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"memorymap",topologyLabel:"mapa de páginas usadas"};</script>
  <script defer src="manifest.js"></script>
  <script defer src="js/corpus.js"></script>
  <script defer src="js/acontecimientos.js"></script>
  <script defer src="js/reliquias.js"></script>
  <script defer src="js/tlahtolli.js"></script>
  <script defer src="js/mapa.js"></script>
</head>
<body class="memory-map-page">
  <header class="memory-map-header">
    <h1>MAPA</h1>
    <p><em>este mapa no corresponde del todo a estas páginas</em></p>
    <nav><a class="route" href="index.html?seed=${encodeURIComponent(WORLD_SEED)}">volver al umbral</a><a class="route" href="acontecimientos.html?seed=${encodeURIComponent(WORLD_SEED)}">archivo / PDF</a><a class="route" href="reliquias.html?seed=${encodeURIComponent(WORLD_SEED)}">códice de reliquias</a><a class="route" href="comentario.html?seed=${encodeURIComponent(WORLD_SEED)}">comentario vivo</a></nav>
    <div class="memory-map-controls" role="group" aria-label="vista del mapa"><button type="button" data-map-view="used">páginas usadas</button><button type="button" data-map-view="all">todas</button><button type="button" data-map-view="graph">relaciones</button><button type="button" id="map-random">azar no usado</button></div>
    <output id="map-status" aria-live="polite"></output>
  </header>
  <main><section id="memory-map-list" class="memory-map-list" aria-label="páginas del mapa"></section><canvas id="memory-map-graph" class="memory-map-graph" hidden aria-label="relaciones entre páginas"></canvas></main>
  <footer class="memory-map-footer">Una página cargada dentro de otra también cuenta como usada.</footer>
</body>
</html>`;
}

function outsideDocument() {
  const target = nodes.find(node => node.hidden) || nodes[nodes.length - 1];
  return `<!doctype html><html lang="es" style="--bg:#fff;--fg:#111;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>afuera también era una carpeta</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="css/base.css"><script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"outside",topologyLabel:"afuera"};</script><script defer src="js/corpus.js"></script><script defer src="js/acontecimientos.js"></script><script defer src="js/reliquias.js"></script><script defer src="js/tlahtolli.js"></script></head><body><main class="empty-world" style="--world-w:5600px;--world-h:4200px"><a class="route micro" href="paginas/${target.id}.html?seed=${encodeURIComponent(WORLD_SEED)}" style="left:4380px;top:3300px">lo que el mapa ocultó</a><a class="empty-pixel" href="index.html" style="left:17px;top:21px">volver</a></main></body></html>`;
}

function errorRootDocument() {
  const targets = sample(worldRng, nodes, 5);
  return `<!doctype html><html lang="es" style="--bg:#f8f7f1;--fg:#050505;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>error local que contiene rutas</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="css/base.css"><script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"rooterror",topologyLabel:"error local"};</script><script defer src="js/corpus.js"></script><script defer src="js/acontecimientos.js"></script><script defer src="js/reliquias.js"></script><script defer src="js/tlahtolli.js"></script></head><body><main class="error-world"><aside class="error-aside">manifest.corrupt<br>${esc(WORLD_SEED)}<br>${PAGE_COUNT} documentos</aside><section class="error-body"><div class="error-code outline">0/0</div><table class="broken-table">${targets.map(node => `<tr><td>${esc(node.topologyLabel)}</td><td><a class="route" href="paginas/${node.id}.html?seed=${encodeURIComponent(WORLD_SEED)}">${node.id}</a></td></tr>`).join("")}</table></section></main></body></html>`;
}

function eventsDocument() {
  return `<!doctype html>
<html lang="es" style="--bg:#f8f7f1;--fg:#050505;--a:#ff4fa3;--b:#147bff;--c:#b7ff3c;--d:#ff652b">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>acontecimientos que el río decidió guardar</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"chronicle",topologyLabel:"archivo de acontecimientos"};</script>
  <script defer src="js/corpus.js"></script>
  <script defer src="js/acontecimientos.js"></script>
  <script defer src="js/reliquias.js"></script>
  <script defer src="js/tlahtolli.js"></script>
</head>
<body class="chronicle-page">
  <header class="chronicle-header">
    <p class="micro">ARCHIVO LOCAL / SEMILLA ${esc(WORLD_SEED)}</p>
    <h1>acontecimientos que el río decidió guardar</h1>
    <p>La crónica no resume la pieza: conserva visitas, esperas, aperturas, destrucciones, reproducciones y rarezas como texto generado durante el recorrido.</p>
    <nav><a class="route" href="index.html?seed=${encodeURIComponent(WORLD_SEED)}">volver al río</a><a class="route" href="mapa.html?seed=${encodeURIComponent(WORLD_SEED)}&amp;view=used">volver por el mapa</a><a class="route" href="reliquias.html?seed=${encodeURIComponent(WORLD_SEED)}">abrir el códice</a></nav>
    <div class="chronicle-actions"><button id="print-chronicle">imprimir / guardar PDF</button><a class="button-link" href="mapa.html?seed=${encodeURIComponent(WORLD_SEED)}&amp;view=used">mapa de páginas usadas</a><button id="export-events">descargar JSON</button><button id="clear-events">vaciar este archivo</button></div>
  </header>
  <main id="chronicle" class="chronicle"></main>
  <footer class="chronicle-footer">La capa sonora deja aquí su notación textual, nunca una grabación.</footer>
  <script>addEventListener('DOMContentLoaded',function(){var root=document.getElementById('chronicle');LabEvents.renderArchive(root);document.getElementById('print-chronicle').onclick=function(){print()};document.getElementById('export-events').onclick=function(){LabEvents.exportJSON()};document.getElementById('clear-events').onclick=function(){if(confirm('¿vaciar los acontecimientos de esta semilla?')){LabEvents.clear();LabEvents.renderArchive(root)}}});</script>
</body>
</html>`;
}

function relicsDocument() {
  return `<!doctype html>
<html lang="es" style="--bg:#071b2e;--fg:#f7ecd7;--a:#ff3c98;--b:#63a7ff;--c:#d7ff4f;--d:#ff7b32">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>amoxtli de reliquias</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="css/base.css"><script>window.LAB_PAGE={worldSeed:${JSON.stringify(WORLD_SEED)},topology:"reliccodex",topologyLabel:"códice de reliquias"};</script><script defer src="js/corpus.js"></script><script defer src="js/acontecimientos.js"></script><script defer src="js/reliquias.js"></script><script defer src="js/tlahtolli.js"></script></head>
<body class="relic-codex-page"><header class="relic-codex-header"><p class="micro" lang="nah">AMOXTLI / TLAHTOLLI / NEXTLI</p><h1>códice de reliquias</h1><p>No son puntos. Son frases, residuos y pequeñas pruebas que la lectura encontró sin saber que las buscaba.</p><nav><a class="route" href="index.html?seed=${encodeURIComponent(WORLD_SEED)}">volver al río</a><a class="route" href="mapa.html?seed=${encodeURIComponent(WORLD_SEED)}&amp;view=used">mapa que aún omite</a><a class="route" href="acontecimientos.html?seed=${encodeURIComponent(WORLD_SEED)}">acontecimientos / PDF</a></nav></header><main id="relic-codex" class="relic-codex" aria-live="polite"></main><footer class="relic-sources"><p>Las formas en náhuatl están identificadas como náhuatl clásico y acompañadas por glosas propias en español.</p><a href="https://historicas.unam.mx/publicaciones/publicadigital/libros/obras_leon_portilla/339/339_04_08_apendicei.pdf">Cantares mexicanos / textos citados en su original náhuatl · UNAM</a><a href="https://gdn.iib.unam.mx/">Gran Diccionario Náhuatl · UNAM</a></footer><script>addEventListener('DOMContentLoaded',function(){LabRelics.render(document.getElementById('relic-codex'))});</script></body></html>`;
}

async function write(relative, content) {
  const path = join(ROOT, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

const manifest = {
  version: 10,
  generatedAt: new Date(0).toISOString(),
  seed: WORLD_SEED,
  pageCount: PAGE_COUNT,
  hiddenCount: hiddenSet.size,
  rules: RULES,
  cellularModes: CELLULAR_MODES,
  fonts: FONT_MODES,
  toneVersion: "15.1.22",
  toneLoading: "lazy-single-owner",
  cannibalEngine: "whole-DOM primitives",
  textEngine: "tlahtolli / initial plus generated plus cannibalized DOM",
  relics: "seed-local codex, never a score",
  nahuatl: { variety: NAHUATL.variety, sources: NAHUATL.sources },
  donor: "laberinto/laberinto: mutable links, persistent destruction, four typefaces",
  chartModes: ["bars", "line", "scatter", "radial", "strata", "stream", "moire", "glitch", "constellation", "glyph", "cellular", "erosion"],
  zapping: "exploration-biased-occasional",
  navigation: "recent-memory plus guaranteed unused exit",
  lineages: { "006": ["form", "oracleparty"], "013": ["destruction", "vanishingmap"] },
  buttonTopology: ["form", "oracleparty"],
  minimumPersistentLinksPerPage: 2,
  topologies: TOPOLOGY_LABELS,
  pages: nodes
};

const genomeCatalog = nodes.map(genomeFor);

await mkdir(join(ROOT, "paginas"), { recursive: true });
const previousPages = await readdir(join(ROOT, "paginas"));
await Promise.all(previousPages.filter(name => /^\d{3}\.html$/.test(name)).map(name => unlink(join(ROOT, "paginas", name))));
await Promise.all(["fragmentos-paginas.js", "mezclador.js"].map(name => unlink(join(ROOT, "js", name)).catch(error => {
  if (error.code !== "ENOENT") throw error;
})));
await Promise.all(nodes.map(node => write(`paginas/${node.id}.html`, pageDocument(node))));
await Promise.all([
  write("index.html", portalDocument()),
  write("mapa.html", mapDocument()),
  write("afuera.html", outsideDocument()),
  write("error.html", errorRootDocument()),
  write("acontecimientos.html", eventsDocument()),
  write("reliquias.html", relicsDocument()),
  write("js/genoma-paginas.js", `window.LAB_PAGE_GENOMES=${JSON.stringify(genomeCatalog).replace(/</g, "\\u003c")};\n`),
  write("manifest.json", JSON.stringify(manifest, null, 2) + "\n"),
  write("manifest.js", `window.LAB_MANIFEST=${JSON.stringify(manifest).replace(/</g, "\\u003c")};\n`)
]);

console.log(`laberinto generado: ${PAGE_COUNT} páginas · semilla ${WORLD_SEED} · ${hiddenSet.size} ocultas`);
