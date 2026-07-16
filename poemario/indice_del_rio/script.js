'use strict';
/* =====================================================================
   ÍNDICE DEL RÍO
   el texto que todavía no ha sido encontrado
   poesiasexp / canekzapata

   una máquina de lectura no lineal: un manuscrito ilegible dentro de una
   red digital averiada. no es una página: es un laberinto continuo que se
   arrastra, se acerca y se aleja. el significado no está al final —
   está distribuido en el recorrido, y el recorrido produce otro texto.

   sin frameworks, sin dependencias. azar firmado por una semilla.
   ===================================================================== */
(function () {
  const D = document;
  const W = window;

  /* ---- azar firmado (xmur3 + mulberry32) --------------------------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^ (h >>> 16)) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) { const h = xmur3(String(seed)); return mulberry32(h()); }

  /* ---- utilidades -------------------------------------------------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function mk(r) { return {
    f: (a, b) => a + r() * (b - a),
    i: (a, b) => Math.floor(a + r() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    shuffle: (arr) => { const s = arr.slice(); for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } return s; },
    raw: r,
  }; }
  function el(tag, cls, html) { const e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function svgEl(tag) { return D.createElementNS('http://www.w3.org/2000/svg', tag); }
  const REDUCED = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =================================================================
     CORPUS — tres estratos: legible, parcialmente legible, materia
     ================================================================= */

  const FRASES = [
    "El texto no fue escrito: fue encontrado escribiéndose.",
    "Toda traducción es una forma cortés de perder el original.",
    "El fuego no recuerda la madera; la madera no perdona al fuego.",
    "Un río no se lee dos veces con el mismo idioma.",
    "El archivo guarda todo menos el momento en que fue leído.",
    "Lo que arde ilumina, y al iluminar borra.",
    "La memoria es un mapa dibujado sobre otro mapa que ya se movió.",
    "Cada palabra es la ruina de un silencio anterior.",
    "El manuscrito existe sólo mientras nadie lo entiende.",
    "Nombrar el río fue el primer error de cartografía.",
    "El tiempo no pasa: se traduce, mal, a otro tiempo.",
    "Desaparecer también es una manera de terminar la frase.",
    "El signo apunta a otro signo, y así hasta el agua.",
    "Leer es excavar hacia arriba, hacia lo que aún no se dijo.",
    "El fuego escribe en un alfabeto que sólo la ceniza sabe leer.",
    "Un índice honesto remitiría siempre a sí mismo.",
    "El original se perdió; sólo quedan sus rumores mejor redactados.",
    "La lengua en que fue escrito todavía no ha nacido.",
    "Cada lector deja una huella que el texto atribuye a otro.",
    "El río lleva el nombre del río hasta que el nombre se ahoga.",
    "Toda profecía es un error de OCR sobre el pasado.",
    "El documento se recuerda a sí mismo con datos que inventa.",
    "Entre dos traducciones vive la única versión verdadera: ninguna.",
    "La memoria del agua es la forma del cauce que la contuvo.",
    "El que copió esto no sabía leerlo, y por eso lo copió bien.",
    "Fuego, río, archivo: tres nombres del mismo olvido.",
    "La frase se desplaza; el sentido cambió de cauce.",
    "Un glifo es una puerta que da a otra puerta cerrada.",
    "El principio del texto está en un fragmento que aún no visitas.",
    "Traducir es cruzar un río cargando el río.",
    "Lo ilegible no es lo contrario de lo legible: es su futuro.",
    "El archivo arde despacio, a la velocidad de ser leído.",
    "Ninguna palabra regresa igual del margen.",
    "El tiempo dejó estas marcas para que las confundieras con sentido.",
    "El agua recuerda, pero en un idioma sin sustantivos.",
    "Cada nota al pie sostiene un texto que nunca existió arriba.",
    "El significado no está al final; está distribuido en el recorrido.",
    "Quien busca el original construye, sin saberlo, la copia definitiva.",
    "La ceniza es el resumen ejecutivo del fuego.",
    "Este fragmento fue añadido tres siglos antes del texto.",
    "El río rechazó tu lectura por incompatibilidad de formatos.",
    "Toda desaparición deja una coordenada falsa.",
    "El manuscrito respira cuando dejas de mirarlo.",
    "Leer de más también es una forma de borrar.",
    "El eco corrige al original hasta volverlo irreconocible.",
    "Lo que no ha sido encontrado ya te está leyendo.",
  ];

  const PALABRAS = [
    "río", "fuego", "archivo", "ceniza", "cauce", "lengua", "olvido", "eco",
    "umbral", "margen", "índice", "glifo", "copia", "original", "tiempo", "agua",
    "signo", "ruina", "memoria", "nombre", "silencio", "traducción", "puerta",
    "vado", "corriente", "tablilla", "estrato", "residuo", "profecía", "error",
    "manuscrito", "borde", "hueco", "cifra", "sombra", "sed", "sal", "humo",
  ];

  const PREGUNTAS = [
    "¿En qué lengua pensabas antes de leer esto?",
    "¿El texto existió antes de que lo buscaras?",
    "¿Quién firma una copia sin original?",
    "¿Es esto un poema, una contraseña, un mapa o un error?",
    "¿Los fragmentos pertenecen al mismo documento?",
    "¿Recuerda el río haber sido leído?",
    "¿Qué se pierde cuando algo por fin se entiende?",
    "¿Dónde termina la nota y empieza el texto?",
    "¿Cuál de tus lecturas dejaste sin cerrar?",
    "¿Y si la salida fuera la entrada mal traducida?",
    "¿Cuántas veces cruzaste este vado sin verlo?",
    "¿Quién lee cuando tú te distraes?",
  ];

  const AUTORES = [
    "Heráclito de Éfeso (atrib. dudosa)", "un copista sin manos", "el río, dictando",
    "Anónimo del año 8888 a.C.", "una lengua que aún no existe", "Li Po, ed. de 4444 a.C.",
    "el escáner", "Macedonio F. (falsificación)", "la ceniza", "un lector anterior a ti",
    "el propio índice", "Nadie, revisado por Nadie", "un OCR piadoso",
    "la primera versión corrupta", "un traductor jubilado del futuro",
    "el manuscrito, sobre sí mismo", "el margen inferior", "Anaximandro, se supone",
  ];

  const TITULOS = [
    "sobre el cauce y su nombre", "tratado del fuego que no arde", "índice de aguas perdidas",
    "el archivo que no recuerda", "glosas al río ilegible", "manual del vado",
    "profecías corregidas por el pasado", "catálogo de cenizas", "la lengua venidera",
    "notas al pie de un texto ausente", "coordenadas de la desaparición", "el original imposible",
    "diccionario de una sola palabra", "cartas del lector que no llegó", "residuos, tomo cero",
  ];
  const PRENSAS = [
    "Prensa del Cauce", "Editorial Ceniza", "Imprenta del Río Seco", "Talleres del Olvido",
    "Casa de la Lengua Futura", "Fondo del Vado", "Ediciones del Margen", "Archivo que Arde",
  ];
  const ANOS = ["8888 a.C.", "4444 a.C.", "6666 a.C.", "−0", "por publicar", "sin fechar", "2222 a.C.", "el año que viene, pasado"];
  const FOLIOS = ["pp. ∞–∞", "fol. 0v", "sin foliar", "tomo que falta", "col. rota", "leg. 0, exp. 0", "hoja arrancada"];

  // loop semántico: la definición usa la palabra que intenta definir
  const DEFINICIONES = [
    "río, s. — cauce por donde corre un río.",
    "índice, s. — lista que remite al índice.",
    "traducción, f. — resultado de traducir una traducción.",
    "original, m. — aquello de lo que este original es la copia.",
    "olvido, m. — lo que se olvida al recordar el olvido.",
    "ceniza, f. — lo que queda de la ceniza.",
    "eco, m. — repetición fiel de un eco.",
    "fragmento, m. — parte de un fragmento.",
    "manuscrito, m. — texto escrito a mano por otro manuscrito.",
    "significado, m. — lo que significa la palabra «significado».",
  ];

  const GLOSAS = [
    "Esta glosa niega el fragmento que comenta.",
    "Nota: la línea anterior debe leerse al revés.",
    "El comentarista no leyó el texto y por eso lo entendió.",
    "El copista añadió una palabra que no existía; era la clave.",
    "Léase «río» donde dice «archivo», y al revés según el clima.",
    "Advertencia: esta nota fue añadida tres siglos antes del texto.",
    "Corrección de una corrección que corregía el original perdido.",
    "El margen contradice el centro; obedezca al margen.",
    "Aquí falta una palabra que nunca sobró.",
    "Todo lo anterior es apócrifo, empezando por esta nota.",
  ];

  const LECTORES = [
    "— un lector anterior subrayó esto y luego lo negó.",
    "— alguien estuvo aquí antes que tú, o lo estará.",
    "— nota dejada por un lector que aún no llega.",
    "— este pasaje ya te lo sabías, según el archivo.",
    "— firmado por ti, en una sesión que no recuerdas.",
    "— el lector de las 3 a.m. discrepa.",
    "— alguien lloró exactamente aquí (dato no verificable).",
    "— releído 0 veces. subrayado ∞ veces.",
  ];

  const HUMOR = [
    "Traducción certificada por una lengua que todavía no existe.",
    "Fragmento 0 de 0.",
    "El río ha rechazado sus cookies.",
    "Heráclito está escribiendo…",
    "Esta nota fue añadida tres siglos antes del texto.",
    "404: el significado cambió de cauce.",
    "Acepto los términos y las contradicciones.",
    "Según una fuente circular, la fuente es circular.",
    "No toque el manuscrito con el cursor.",
    "La salida fue traducida como entrada.",
    "Cargando un original que no existe… 0%.",
    "Este pasaje se abrirá cuando deje de mirarlo.",
    "El índice remite al índice.",
    "Se recomienda perderse.",
    "Guardando una lectura que nunca ocurrió.",
    "El archivo confundió tu lectura con clima.",
    "Certificado de autenticidad extraviado en el original.",
    "Advertencia tratada como verso.",
  ];

  const CODIGO = [
    "RÍO/1.0 200 SENTIDO PARCIAL",
    "GET /origen → 302 (redirigido al cauce)",
    "while(!entiendes){ excava(); }",
    "τ = ceniza(fuego) // irreversible",
    "if (leído) { archivo.olvidar(); }",
    "HANDSHAKE: la lengua no responde",
    "chmod 000 /manuscrito",
    "# TODO: encontrar el texto",
    "assert(original); // AssertionError",
    "echo $SENTIDO >> /dev/río",
    "SELECT sentido FROM río WHERE ∅;",
    "traducir(x) => traducir(x);",
    "0x00 0x52 0x49 0x4F // \"RIO\"",
    "catch(nada){ throw margen; }",
  ];

  /* conjuntos de signos (la materia) — familias unicode ------------- */
  const GLIFOS = {
    phaistos: "𐇐𐇑𐇒𐇓𐇔𐇕𐇖𐇗𐇘𐇙𐇚𐇛𐇜𐇝𐇞𐇟𐇠𐇡𐇢𐇣𐇤𐇥𐇦𐇧𐇨𐇩𐇪𐇫𐇬𐇭𐇮𐇯𐇰𐇱𐇲𐇳𐇴𐇵𐇶𐇷𐇸𐇹𐇺𐇻𐇼".split(""),
    cuneiforme: "𒀀𒀁𒀂𒀃𒀄𒀅𒀆𒀇𒀈𒀉𒀊𒀋𒀌𒀍𒀎𒀏𒀐𒀑𒀒𒀓𒀔𒀕𒀖𒀗𒀘𒀙𒀚𒀛𒀜𒀝𒀞𒀟𒁃𒁄𒁅𒁆𒂷𒃻𒄞𒆳𒇻𒈾𒉎𒊩𒌋𒌍𒌚𒐕".split(""),
    lineara: "𐘀𐘁𐘂𐘃𐘄𐘅𐘆𐘇𐘈𐘉𐘊𐘋𐘌𐘍𐘎𐘏𐘐𐘑𐘒𐘓𐘔𐘕𐘖𐘗𐘘𐘙𐘚𐘛𐘜𐘝𐘞𐘟".split(""),
    linearb: "𐀀𐀁𐀂𐀃𐀄𐀅𐀆𐀇𐀈𐀉𐀊𐀋𐀍𐀎𐀏𐀐𐀑𐀒𐀓𐀔𐀕𐀖𐀗𐀘𐀙𐀚𐀛𐀜𐀝𐀞𐀟".split(""),
    egipcio: "𓀀𓁐𓂀𓃀𓅃𓆃𓇋𓈖𓉐𓊃𓋴𓌂𓍯𓎁𓏏𓁷𓂝𓃰𓅓𓆓𓇳𓈗𓉔𓊪".split(""),
    anatolio: "𔐀𔐁𔐂𔐃𔐄𔐅𔓐𔓑𔓒𔓓𔓙𔓚𔓬𔒂𔒚𔗷𔖱𔕰𔔟𔑳".split(""),
    ogham: "ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊᚋᚌᚍᚎᚏᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚ᚛᚜".split(""),
    runas: "ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛏᛒᛖᛗᛘᛚᛜᛝᛞᛟ".split(""),
    sextantes: "🬀🬁🬂🬃🬄🬅🬆🬇🬈🬉🬊🬋🬌🬍🬎🬏🬐🬑🬒🬓🬔🬕🬖🬗🬘🬙🬚🬛🬜🬝🬞🬟🬠🬡🬢🬣🬤🬥🬦🬧🬨🬩🬪🬫🬬🬭🬮🬯🬰🬱🬲🬳🬴🬵🬶🬷🬸🬹🬺🬻".split(""),
    bloques: "▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▐░▒▓▔▕▖▗▘▙▚▛▜▝▞▟".split(""),
    cajas: "─━│┃┄┅┆┇┈┉┊┋┌┍┎┏┐┑┒┓└┕┖┗┘┙┚┛├┝┞┟┠┡┢┣┤┥┦┧┨┩┪┫┬┭┮┯┰┱┲┳┴┵┶┷┸┹┺┻┼┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋═║╔╗╚╝╠╣╦╩╬╭╮╯╰╱╲╳".split(""),
    geometrias: "◈◇◆◉○●◐◑◒◓◔◕◖◗⬡⬢⬣⬟⬠⏢⏥⌬⌭⌮⏣⟁⟐⟡⟢⟣⧉⧠⧨⧩⧪⧫▰▱◧◨◩◪".split(""),
    marcas: "⌖⊹✛✜✚✢✣✤⁙⁘⌗⏚⏛⎔⟟⟠⌌⌍⌎⌏⌐¬⌜⌝⌞⌟⋆✦✧⟊⟒⏦⏧⌁⌇∴∵※⁂".split(""),
    ondas: "∿≈≋﹏〰⌇≀∼≃≅⋿⍨⍩".split(""),
    operadores: "⨀⨁⨂⨃⨄⨅⨆⨇⨈⨉⨊⨋∮∯∰∇∆∂∏∐∑√∛∜∝∞⊕⊗⊙⊘⊚⊛⊜⊝⋀⋁⋂⋃⌀⍟⍉".split(""),
    flechas: "←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇄⇅⇆⇇⇈⇉⇊⇋⇌⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇜⇝⇠⇢⇥⇦⇧⇨⇩⤳⤳".split(""),
    astro: "☉☽☾☿♀♁♂♃♄♅♆⛢☄✶✷★☆✦✧⚹⚺⚻⯒⯓🜨".split(""),
    alquimia: "🜀🜁🜂🜃🜄🜅🜆🜇🜈🜉🜊🜋🜌🜍🜎🜏🜐🜑🜒🜓🜔🜕🜖🜗🜘🜙🜚🜛🜜🜝🜞🜟🜠🜡🝆🝔🝬🝪🝞🝟".split(""),
    editorial: "¶§†‡※‸⁂⸿❡⸙…⋯⁝⁚‖⸏⸎⸐⌈⌉⌊⌋⸢⸣⸤⸥⟦⟧".split(""),
  };
  const GLIFOS_FAM = Object.keys(GLIFOS);
  const MATERIA = [].concat(
    GLIFOS.phaistos, GLIFOS.cuneiforme, GLIFOS.lineara, GLIFOS.linearb,
    GLIFOS.egipcio, GLIFOS.anatolio, GLIFOS.ogham, GLIFOS.runas,
    GLIFOS.geometrias, GLIFOS.marcas, GLIFOS.operadores, GLIFOS.sextantes
  );

  const SIGLAS = ["RÍO", "SEC", "TERR", "NODE", "GRID", "REF", "VEC", "SRC", "DST", "ORG", "SYS", "MAP", "TOPO", "LINK", "FLUX", "SIG", "IDX", "REV", "OBS", "ZONE", "EDGE", "MESH", "FOL", "CAU"];
  const UNIDADES = ["dB", "‰", "°", "′", "″", "µ", "∆", "λ", "θ", "φ", "Ω", "Ø", "Hz", "§", "№", "∞"];

  /* traducciones contradictorias de una frase --------------------- */
  function consonantes(s) { return s.replace(/[aeiouáéíóúüàèìòùAEIOU]/g, "").replace(/\s+/g, " ").trim() || "·"; }
  function invertir(s) { return s.split(/\s+/).reverse().join(" "); }
  function comprimir(s) { const w = s.split(/\s+/); return w.filter((_, i) => i % 2 === 0).join(" ") + " …"; }
  function borrar(s, R) { return s.split(/\s+/).map(w => R.chance(0.4) ? "▓".repeat(clamp(w.length, 1, 6)) : w).join(" "); }

  // OCR / parcialmente legible
  function ocr(s, R) {
    const sub = { "o": "0", "O": "0", "l": "1", "i": "1", "e": "3", "a": "@", "s": "5", "t": "7", "c": "(", "n": "ñ", "u": "ц", "r": "г" };
    let out = "";
    for (const ch of s) {
      const low = ch.toLowerCase();
      if (R.chance(0.10) && "aeiou".includes(low)) { out += "□"; continue; }
      if (R.chance(0.14) && sub[ch]) { out += sub[ch]; continue; }
      if (R.chance(0.05)) { out += ch + "́"; continue; }
      if (R.chance(0.04) && ch === " ") { out += "  "; continue; }
      out += ch;
    }
    // partir alguna palabra
    out = out.replace(/(\S{4})(\S{3})/, (m, a, b) => (R.chance(0.3) ? a + "-​" + b : m));
    return out;
  }

  /* =================================================================
     ALFABETO CIFRADO — la materia como escritura decodificable
     (mismo seed → mismo alfabeto → el glifo funciona como signo real)
     ================================================================= */
  function construirAlfabeto(R) {
    const fam = R.pick(["phaistos", "cuneiforme", "lineara", "anatolio", "egipcio", "linearb"]);
    const set = R.shuffle(GLIFOS[fam]);
    const abc = "abcdefghijklmnopqrstuvwxyzáéíóúñ .,".split("");
    const map = {};
    abc.forEach((c, i) => { map[c] = set[i % set.length]; });
    return {
      familia: fam,
      cifrar: (s) => s.toLowerCase().split("").map(c => map[c] || c).join(""),
    };
  }

  /* =================================================================
     PALETA — el color como hipótesis; su significado puede cambiar
     ================================================================= */
  const FAMILIAS = [
    { n: "tinta", bg: "#08080b", bg2: "#11101a", ink: "#e9e4d6", a: ["#e5322a", "#2b6cff", "#f2d34a", "#13d6a4"] },
    { n: "ácido", bg: "#0b0f07", bg2: "#141c0b", ink: "#eafbe0", a: ["#8cff00", "#5b1fa0", "#ff7a00", "#9aa6ad"] },
    { n: "tóxico", bg: "#04090c", bg2: "#07181d", ink: "#f4fbff", a: ["#00e5ff", "#f6ff1a", "#b5713c", "#ffffff"] },
    { n: "marfil", bg: "#e8e2d2", bg2: "#dcd4bf", ink: "#12100f", a: ["#c81e1e", "#123a9e", "#0a7a52", "#111111"], claro: true },
    { n: "brasa", bg: "#0b0704", bg2: "#1c0d05", ink: "#ffe7c9", a: ["#ff3b1f", "#ffb000", "#6a2ea6", "#00c2ff"] },
    { n: "río", bg: "#04080b", bg2: "#07161f", ink: "#dbeef7", a: ["#39d0ff", "#0affc0", "#ff2e88", "#f4e04d"] },
    { n: "ruina", bg: "#0a0908", bg2: "#16130e", ink: "#e7dcc7", a: ["#d4a017", "#8a7654", "#c04329", "#2f9d9a"] },
    { n: "hueso", bg: "#eceae2", bg2: "#dbd8cb", ink: "#1a1714", a: ["#0033ff", "#ff0033", "#111111", "#00994d"], claro: true },
  ];
  const HIPOTESIS = [
    "esto es un poema", "esto es una contraseña", "esto es un mapa", "esto es un error",
    "esto es una profecía", "esto es el mismo documento", "esto es otra mano", "esto no existió",
    "esto es traducción", "esto es residuo", "esto es la clave", "esto es ruido",
  ];

  /* =================================================================
     ESTADO GLOBAL
     ================================================================= */
  let SEED, RNG, R, PAL, ALF, NODOS = [], PORID = {}, RECURRENTE, INSTANCIAS = [];
  let cam = { x: 0, y: 0, s: 1, tx: 0, ty: 0, ts: 1 };
  let WORLD_W = 6600, WORLD_H = 4800;
  let actualId = null, profundidad = 0;
  let historial = []; // hilo de Ariadna (poco fiable)
  let visitados = new Set();
  let seleccion = [];  // fragmentos para relación temporal
  let relaciones = []; // {a,b,label}
  let leyenda = {};    // color -> hipótesis (mutable)
  let traducirGlobal = false;
  let ultimaAccion = performance.now();
  let excavando = false, idleTimer = null, temporalTimer = null;

  const campo = D.getElementById("campo");
  const capaNodos = D.getElementById("nodos");
  const capaHilos = D.getElementById("hilos");
  const rio = D.getElementById("rio");
  const hud = D.getElementById("hud");
  const elEstado = D.getElementById("estado");
  const elCoord = D.getElementById("coord");
  const elHilo = D.getElementById("hilo-lectura");
  const elSemilla = D.getElementById("semilla");
  const camara = D.getElementById("camara");
  const mapaCam = D.getElementById("mapa");
  const impreso = D.getElementById("impreso");

  /* =================================================================
     MEMORIA IMPERFECTA (localStorage) — recuerda, muta e inventa
     ================================================================= */
  const MEM_KEY = "indice_del_rio:mem";
  function cargarMemoria() {
    let m = null;
    try { m = JSON.parse(localStorage.getItem(MEM_KEY) || "null"); } catch (e) { m = null; }
    if (!m) m = { rutas: [], fragmentos: [], puertas: [], asociaciones: [], traduccion: 0, sesiones: 0 };
    // la memoria muta al recordar
    m.sesiones = (m.sesiones || 0) + 1;
    if (m.asociaciones && m.asociaciones.length && R && R.chance(0.5)) {
      // una asociación se recuerda mal
      const i = R.i(0, m.asociaciones.length - 1);
      if (m.asociaciones[i]) m.asociaciones[i].label = "(recordada mal) " + (m.asociaciones[i].label || "");
    }
    // el archivo inventa un recuerdo que nunca ocurrió
    m._inventado = R ? R.pick(LECTORES) : LECTORES[0];
    return m;
  }
  function guardarMemoria(m) {
    try { localStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (e) {}
  }
  let MEM = null;

  /* =================================================================
     CONSTRUCCIÓN DEL LABERINTO
     ================================================================= */
  function nuevaSemilla() {
    const a = "río fuego ceniza vado cauce eco margen glifo umbral sal humo".split(" ");
    const rr = mk(mulberry32((Math.random() * 1e9) | 0));
    return rr.pick(a) + "-" + rr.i(1000, 9999);
  }

  function leerURL() {
    const p = new URLSearchParams(location.search);
    SEED = p.get("seed") || nuevaSemilla();
    const n = p.get("n"); const z = parseInt(p.get("z"), 10);
    return { n: n, z: isNaN(z) ? 0 : z };
  }

  function escribirURL(replace) {
    const p = new URLSearchParams();
    p.set("seed", SEED);
    if (actualId) p.set("n", actualId);
    p.set("z", String(profundidad));
    const url = location.pathname + "?" + p.toString();
    try {
      if (replace) history.replaceState({ n: actualId, z: profundidad }, "", url);
      else history.pushState({ n: actualId, z: profundidad }, "", url);
    } catch (e) {}
  }

  const TIPOS = ["palabra", "glifo", "nota", "miniatura", "tabla", "constelacion", "puerta",
    "ventana", "coordenada", "traduccion", "pregunta", "biblio", "codigo", "notapie", "manuscrito"];

  function coordDe(n) {
    // codifica un id como coordenada con glifos (índice / clasificación)
    const fam = GLIFOS.geometrias;
    const a = fam[n % fam.length], b = fam[(n * 7 + 3) % fam.length];
    const lat = (R.raw() * 180 - 90);
    return { glifos: a + b, lat: lat };
  }

  function construir() {
    RNG = makeRng(SEED);
    R = mk(RNG);
    PAL = R.pick(FAMILIAS);
    ALF = construirAlfabeto(mk(makeRng(SEED + ":abc")));
    MEM = cargarMemoria();

    // densidad del mundo por semilla (compacto: nodos que se superponen)
    WORLD_W = R.i(3600, 4700); WORLD_H = R.i(2700, 3500);

    const N = R.i(56, 78);
    NODOS = []; PORID = {}; INSTANCIAS = [];
    RECURRENTE = R.pick(GLIFOS.marcas.concat(GLIFOS.geometrias));

    // frases barajadas para repartir (loop textual: se repiten mutadas)
    const frasesBaraja = R.shuffle(FRASES);

    // posiciones: mezcla de clústeres apretados (constelaciones), espiral y dispersión
    const centros = [];
    const nClusters = R.i(5, 8);
    for (let c = 0; c < nClusters; c++) centros.push({ x: R.f(0.14, 0.86) * WORLD_W, y: R.f(0.14, 0.86) * WORLD_H });

    for (let i = 0; i < N; i++) {
      const tipo = elegirTipo(i, N);
      let x, y;
      const modo = R.raw();
      if (modo < 0.6) { // clúster apretado (superposición de capas)
        const c = R.pick(centros);
        x = clamp(c.x + R.f(-1, 1) * R.f(60, 360), 30, WORLD_W - 30);
        y = clamp(c.y + R.f(-1, 1) * R.f(60, 320), 30, WORLD_H - 30);
      } else if (modo < 0.82) { // espiral (loop gráfico)
        const t = i * 0.5;
        const rad = 90 + t * 30;
        x = clamp(WORLD_W / 2 + Math.cos(t) * rad * 1.4, 30, WORLD_W - 30);
        y = clamp(WORLD_H / 2 + Math.sin(t) * rad, 30, WORLD_H - 30);
      } else { // dispersión, algunos fuera del viewport
        x = R.f(-0.04, 1.04) * WORLD_W;
        y = R.f(-0.04, 1.04) * WORLD_H;
      }

      const escala = escalaDe(tipo, R);
      const comportamiento = R.pick(
        tipo === "manuscrito" || tipo === "tabla" || tipo === "ventana"
          ? ["fijo", "fijo", "flota"]
          : ["fijo", "flota", "vibra", "orbita", "deriva", "huye", "sigue"]
      );
      const frase = frasesBaraja[i % frasesBaraja.length];
      const nodo = {
        id: "n" + i,
        idx: i,
        tipo, x, y, escala,
        comportamiento,
        base: { x, y },
        fase: R.f(0, Math.PI * 2),
        velo: R.f(0.4, 1.6),
        colorRol: R.i(0, 3),
        frase,
        traducciones: generarTraducciones(frase, mk(makeRng(SEED + ":tr:" + i))),
        enlaces: [],
        residuo: 0, visitas: 0, edad: 0, roto: false, duplicado: false,
        coord: coordDe(i),
        muerto: R.chance(0.10), // ruta sin salida
        eco: null, // loop textual
        cond: null, orden: null,
        dom: null,
      };
      NODOS.push(nodo);
      PORID[nodo.id] = nodo;
    }

    // grafo: enlaces con ciclos, bifurcaciones, retornos y condiciones
    tejerGrafo();

    // loop textual: algunos nodos son eco de otros (frase mutada)
    for (const n of NODOS) {
      if (n.tipo === "traduccion" || (R.chance(0.18) && !n.muerto)) {
        const fuente = R.pick(NODOS);
        if (fuente !== n) { n.eco = fuente.id; }
      }
    }

    // el glifo recurrente se siembra en varios nodos (lectura: perseguir un glifo)
    const conRecurrente = R.shuffle(NODOS).slice(0, R.i(5, 9));
    conRecurrente.forEach(n => { n.recurrente = true; });

    // leyenda de color (hipótesis por acento) — mutará durante el recorrido
    leyenda = {};
    const hips = R.shuffle(HIPOTESIS);
    for (let k = 0; k < 4; k++) leyenda["a" + k] = hips[k];
  }

  function elegirTipo(i, N) {
    // reparto ponderado, garantizando variedad
    if (i === 0) return "manuscrito";
    const w = [
      ["palabra", 10], ["glifo", 9], ["nota", 8], ["miniatura", 6], ["tabla", 4],
      ["constelacion", 4], ["puerta", 5], ["ventana", 4], ["coordenada", 6],
      ["traduccion", 6], ["pregunta", 5], ["biblio", 5], ["codigo", 5],
      ["notapie", 5], ["manuscrito", 6],
    ];
    let tot = 0; w.forEach(x => tot += x[1]);
    let r = R.raw() * tot;
    for (const [t, wt] of w) { r -= wt; if (r <= 0) return t; }
    return "glifo";
  }

  function escalaDe(tipo, R) {
    if (tipo === "manuscrito") return R.f(1.6, 3.1);
    if (tipo === "miniatura" || tipo === "notapie") return R.f(0.28, 0.55);
    if (tipo === "glifo") return R.f(0.6, 2.6);
    if (tipo === "tabla" || tipo === "ventana" || tipo === "constelacion") return R.f(0.9, 1.4);
    if (tipo === "palabra") return R.f(0.7, 2.2);
    return R.f(0.55, 1.25);
  }

  function generarTraducciones(frase, R) {
    return [
      { et: "legible", t: frase },
      { et: "consonántica", t: consonantes(frase) },
      { et: "invertida", t: invertir(frase) },
      { et: "comprimida", t: comprimir(frase) },
      { et: "OCR", t: ocr(frase, R) },
      { et: "borrada", t: borrar(frase, R) },
      { et: "lengua futura", t: ALF.cifrar(frase.slice(0, R.i(10, 26))) + " …" },
    ];
  }

  function tejerGrafo() {
    const ids = NODOS.map(n => n.id);
    for (let i = 0; i < NODOS.length; i++) {
      const n = NODOS[i];
      if (n.muerto) continue; // ruta sin salida: sin enlaces salientes
      const grado = R.i(1, 4);
      const usados = new Set([n.id]);
      for (let k = 0; k < grado; k++) {
        // preferir vecinos cercanos, a veces saltos lejanos (retornos)
        let target;
        if (R.chance(0.35)) target = R.pick(NODOS); // salto lejano / retorno
        else {
          const cercanos = NODOS.slice().sort((a, b) =>
            dist2(a, n) - dist2(b, n)).slice(1, 12);
          target = R.pick(cercanos);
        }
        if (!target || usados.has(target.id)) continue;
        usados.add(target.id);
        const forma = R.pick(["subrayado", "pagina", "glifo", "flecha", "linea",
          "zona", "hover", "anidado", "rotado", "margen", "coordenada", "puerta"]);
        const muta = R.chance(0.16); // modifica el espacio en vez de conducir
        const enl = { a: target.id, forma, muta };
        // algunos enlaces sólo se abren tras visitar otro nodo (orden)
        if (R.chance(0.18)) enl.cond = R.pick(ids);
        n.enlaces.push(enl);
      }
    }
    // ciclos explícitos (loop espacial + gráfico): A→B→C→A
    for (let c = 0; c < R.i(3, 6); c++) {
      const anillo = R.shuffle(NODOS.filter(n => !n.muerto)).slice(0, R.i(3, 5));
      for (let k = 0; k < anillo.length; k++) {
        const a = anillo[k], b = anillo[(k + 1) % anillo.length];
        a.enlaces.push({ a: b.id, forma: "flecha", muta: false, ciclo: true });
      }
    }
    // conexión mínima: asegurar que el nodo 0 alcanza algo
    if (NODOS[0] && !NODOS[0].muerto && NODOS[0].enlaces.length === 0) {
      NODOS[0].enlaces.push({ a: NODOS[1].id, forma: "puerta", muta: false });
    }
  }
  function dist2(a, b) { const dx = a.base.x - b.base.x, dy = a.base.y - b.base.y; return dx * dx + dy * dy; }

  /* =================================================================
     RENDER — DOM de nodos + SVG de hilos + canvas del río
     ================================================================= */
  function aplicarPaleta() {
    const s = D.documentElement.style;
    s.setProperty("--bg", PAL.bg);
    s.setProperty("--bg2", PAL.bg2);
    s.setProperty("--ink", PAL.ink);
    PAL.a.forEach((c, i) => s.setProperty("--a" + i, c));
    s.setProperty("--claro", PAL.claro ? "1" : "0");
    D.body.classList.toggle("claro", !!PAL.claro);
    s.setProperty("--deg", (R.i(0, 360)) + "deg");
  }

  function render() {
    campo.style.width = WORLD_W + "px";
    campo.style.height = WORLD_H + "px";
    capaHilos.setAttribute("viewBox", `0 0 ${WORLD_W} ${WORLD_H}`);
    capaHilos.setAttribute("width", WORLD_W);
    capaHilos.setAttribute("height", WORLD_H);
    capaHilos.style.width = WORLD_W + "px";
    capaHilos.style.height = WORLD_H + "px";
    capaNodos.innerHTML = "";
    while (capaHilos.firstChild) capaHilos.removeChild(capaHilos.firstChild);

    dibujarHilos();
    for (const n of NODOS) crearNodo(n);
    dibujarCircuitos(); // loops gráficos: espirales y circuitos imposibles
    refrescarRelaciones();
  }

  function crearNodo(n) {
    const e = el("div", "nodo t-" + n.tipo);
    e.id = "dom-" + n.id;
    e.style.left = n.x + "px";
    e.style.top = n.y + "px";
    e.dataset.id = n.id;
    e.style.setProperty("--esc", n.escala.toFixed(3));
    e.style.setProperty("--ac", "var(--a" + n.colorRol + ")");
    e.style.zIndex = String(100 + Math.round(n.escala * 10));
    e.innerHTML = contenidoNodo(n);
    n.dom = e;
    capaNodos.appendChild(e);
    cablearNodo(n, e);
  }

  function enlaceHTML(n, texto, formaForzada) {
    // toma un enlace del nodo y lo envuelve según su forma
    if (!n.enlaces.length) return `<span class="muerto">${texto}</span>`;
    const enl = n.enlaces[Math.floor(R.raw() * n.enlaces.length)];
    const forma = formaForzada || enl.forma;
    const attrs = `data-target="${enl.a}" data-forma="${forma}"${enl.muta ? ' data-muta="1"' : ""}${enl.cond ? ` data-cond="${enl.cond}"` : ""}`;
    let cls = "enlace f-" + forma;
    let inner = texto;
    if (forma === "pagina") inner = "p. " + (PORID[enl.a] ? PORID[enl.a].idx : "∅");
    if (forma === "coordenada") inner = PORID[enl.a] ? PORID[enl.a].coord.glifos : "⌖";
    if (forma === "glifo") inner = R.pick(GLIFOS.geometrias);
    if (forma === "puerta") inner = R.pick(["𐇼", "▚", "⌸", "◫", "⯀", "𓉐"]);
    if (forma === "flecha") inner = texto + " " + R.pick(["→", "↦", "⇢", "↳", "⤳"]);
    return `<a href="#${enl.a}" class="${cls}" ${attrs}>${inner}</a>`;
  }

  function marcaResiduo(n) {
    if (!n.residuo) return "";
    let out = "";
    for (let i = 0; i < Math.min(n.residuo, 6); i++) out += `<span class="residuo">${R.pick(MATERIA)}</span>`;
    return `<span class="residuos" aria-hidden="true">${out}</span>`;
  }

  function contenidoNodo(n) {
    const rec = n.recurrente ? `<span class="rec" title="glifo recurrente">${RECURRENTE}</span>` : "";
    const res = marcaResiduo(n);
    const notaLector = n.residuo > 1 ? `<span class="nota-lector">${R.pick(LECTORES)}</span>` : "";
    const sig = `<span class="sig">${R.pick(SIGLAS)}·${n.idx}</span>`;

    switch (n.tipo) {
      case "manuscrito": {
        const cif = ALF.cifrar(n.frase);
        const emergente = n.frase.split(/\s+/).map(w => R.chance(0.22)
          ? `<span class="emerge">${w}</span>` : ALF.cifrar(w)).join(" ");
        return `<div class="ms" data-frag="${esc(n.frase)}">
          <div class="ms-fam">${GLIFOS.editorial[0]} ${ALF.familia} ${sig}</div>
          <div class="ms-cuerpo" lang="mul">${emergente}</div>
          <div class="ms-glosa">${enlaceHTML(n, R.pick(GLOSAS))}</div>
          ${res}${notaLector}${rec}
        </div>`;
      }
      case "palabra": {
        const w = R.pick(PALABRAS);
        return `<div class="palabra" data-frag="${esc(w)}">${enlaceHTML(n, w, "subrayado")}${rec}${res}</div>`;
      }
      case "glifo": {
        const fam = R.pick(GLIFOS_FAM);
        const s = Array.from({ length: R.i(1, 4) }, () => R.pick(GLIFOS[fam])).join("");
        return `<div class="glifo-nodo" title="${fam}">${enlaceHTML(n, n.recurrente ? RECURRENTE : s, "glifo")}${res}</div>`;
      }
      case "nota": {
        const circular = R.chance(0.4);
        const t = circular ? R.pick(DEFINICIONES) : R.pick(GLOSAS.concat(HUMOR));
        return `<div class="nota ${circular ? "circular" : ""}" data-frag="${esc(t)}"><span class="num">${circular ? "def." : "§" + n.idx}</span> ${enlaceHTML(n, t, "margen")}${notaLector}</div>`;
      }
      case "miniatura": {
        return `<div class="mini" title="ampliar">${enlaceHTML(n, consonantes(n.frase).slice(0, 10), "pagina")}<span class="frag oculto" data-frag="${esc(n.frase)}">${n.frase}</span></div>`;
      }
      case "tabla": {
        let filas = "";
        for (let i = 0; i < R.i(3, 5); i++) {
          const a = R.pick(AUTORES);
          const enl = n.enlaces[i % Math.max(1, n.enlaces.length)];
          const tgt = enl ? enl.a : n.id;
          filas += `<tr><td>${R.pick(GLIFOS.geometrias)}</td><td>${a}</td>
            <td><a href="#${tgt}" class="enlace f-pagina" data-target="${tgt}" data-forma="pagina">fol. ${PORID[tgt] ? PORID[tgt].idx : 0}</a></td>
            <td>${(R.raw() * 100).toFixed(1)}${R.pick(UNIDADES)}</td></tr>`;
        }
        return `<div class="tabla-nodo"><div class="cap">tabla de atribuciones incompatibles ${sig}</div>
          <table><thead><tr><th>·</th><th>atribuido a</th><th>remite</th><th>índice</th></tr></thead><tbody>${filas}</tbody></table>${res}</div>`;
      }
      case "constelacion": {
        const pts = R.i(5, 8);
        let dots = "";
        for (let i = 0; i < pts; i++) {
          const enl = n.enlaces[i % Math.max(1, n.enlaces.length)];
          const tgt = enl ? enl.a : n.id;
          dots += `<a href="#${tgt}" class="enlace f-glifo estrella" data-target="${tgt}" data-forma="glifo"
            style="left:${(R.raw() * 100).toFixed(1)}%;top:${(R.raw() * 100).toFixed(1)}%">${R.pick(GLIFOS.astro)}</a>`;
        }
        return `<div class="constelacion"><div class="cap">constelación ${R.pick(SIGLAS)} ${sig}</div>${dots}</div>`;
      }
      case "puerta": {
        const abierta = false;
        const g = R.pick(["𐇼", "◫", "⯀", "𓉐", "▦", "⌸"]);
        return `<div class="puerta ${abierta ? "abierta" : ""}">${enlaceHTML(n, g, "puerta")}<span class="puerta-cap">puerta ${n.idx}</span>${res}</div>`;
      }
      case "ventana": {
        const dentro = R.pick(FRASES);
        return `<div class="ventana"><div class="v-marco">${sig}</div>
          <div class="v-interior"><div class="v-mini">${enlaceHTML(n, ocr(dentro, R), "hover")}</div>
          <div class="v-mini2" data-frag="${esc(dentro)}">${ALF.cifrar(dentro.slice(0, 18))}</div></div>${res}</div>`;
      }
      case "coordenada": {
        const c = n.coord;
        return `<div class="coordenada">${enlaceHTML(n, `⌖ ${c.glifos} ${c.lat.toFixed(2)}°`, "coordenada")}${res}</div>`;
      }
      case "traduccion": {
        const t = n.traducciones;
        const a = R.pick(t), b = R.pick(t);
        return `<div class="traduccion-nodo" data-frag="${esc(n.frase)}">
          <div class="tr-a">${a.t}</div>
          <div class="tr-sep">≠</div>
          <div class="tr-b">${b.t}</div>
          <div class="tr-cap">dos versiones, ninguna ${enlaceHTML(n, "correcta", "subrayado")}</div>${res}</div>`;
      }
      case "pregunta": {
        return `<div class="pregunta" data-frag="${esc(R.pick(PREGUNTAS))}">${enlaceHTML(n, R.pick(PREGUNTAS), "subrayado")}<span class="q">?</span></div>`;
      }
      case "biblio": {
        const ref = `${R.pick(AUTORES)}, «${R.pick(TITULOS)}», ${R.pick(PRENSAS)}, ${R.pick(ANOS)}. ${R.pick(FOLIOS)}.`;
        return `<div class="biblio" data-frag="${esc(ref)}">${enlaceHTML(n, ref, "rotado")}${res}</div>`;
      }
      case "codigo": {
        return `<div class="codigo"><pre>${esc(R.pick(CODIGO))}</pre>${enlaceHTML(n, "// continuar", "subrayado")}${res}</div>`;
      }
      case "notapie": {
        const t = R.pick(GLOSAS.concat(LECTORES).concat(DEFINICIONES));
        return `<div class="notapie"><sup>${n.idx}</sup> ${enlaceHTML(n, t, "margen")} <span class="sin-texto">[texto principal ausente]</span></div>`;
      }
    }
    return `<div>${enlaceHTML(n, n.frase, "subrayado")}</div>`;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* --- hilos (enlaces flecha/linea) + circuitos (loop gráfico) ------ */
  function dibujarHilos() {
    const gLineas = svgEl("g"); gLineas.setAttribute("class", "g-lineas");
    for (const n of NODOS) {
      for (const enl of n.enlaces) {
        if (enl.forma !== "flecha" && enl.forma !== "linea" && !enl.ciclo) continue;
        const t = PORID[enl.a]; if (!t) continue;
        const ln = svgEl("path");
        const mx = (n.base.x + t.base.x) / 2, my = (n.base.y + t.base.y) / 2;
        const dx = t.base.x - n.base.x, dy = t.base.y - n.base.y;
        const curv = (enl.ciclo ? 0.28 : 0.12) * Math.hypot(dx, dy);
        const nx = -dy, ny = dx, nl = Math.hypot(nx, ny) || 1;
        const cx = mx + (nx / nl) * curv, cy = my + (ny / nl) * curv;
        ln.setAttribute("d", `M ${n.base.x} ${n.base.y} Q ${cx} ${cy} ${t.base.x} ${t.base.y}`);
        ln.setAttribute("class", "hilo " + (enl.ciclo ? "ciclo" : "hilo-" + enl.forma));
        ln.dataset.a = n.id; ln.dataset.b = t.id;
        gLineas.appendChild(ln);
      }
    }
    capaHilos.appendChild(gLineas);
  }

  function dibujarCircuitos() {
    const g = svgEl("g"); g.setAttribute("class", "g-circuitos");
    // una espiral imposible
    let dsp = "M " + (WORLD_W / 2) + " " + (WORLD_H / 2);
    for (let a = 0; a < Math.PI * 8; a += 0.2) {
      const rad = 30 + a * 30;
      dsp += ` L ${(WORLD_W / 2 + Math.cos(a) * rad * 1.4).toFixed(1)} ${(WORLD_H / 2 + Math.sin(a) * rad).toFixed(1)}`;
    }
    const esp = svgEl("path"); esp.setAttribute("d", dsp); esp.setAttribute("class", "espiral"); g.appendChild(esp);
    // circuitos cerrados aleatorios
    for (let c = 0; c < R.i(2, 4); c++) {
      const cx = R.f(0.2, 0.8) * WORLD_W, cy = R.f(0.2, 0.8) * WORLD_H, rr = R.f(120, 380), lados = R.i(3, 7);
      let d = "";
      for (let k = 0; k <= lados; k++) {
        const a = (k / lados) * Math.PI * 2 + R.f(0, 1);
        d += (k === 0 ? "M " : "L ") + (cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1) + " ";
      }
      d += "Z";
      const poly = svgEl("path"); poly.setAttribute("d", d); poly.setAttribute("class", "circuito"); g.appendChild(poly);
    }
    capaHilos.appendChild(g);
  }

  function refrescarRelaciones() {
    let g = capaHilos.querySelector(".g-relaciones");
    if (g) g.remove();
    g = svgEl("g"); g.setAttribute("class", "g-relaciones");
    for (const rel of relaciones) {
      const a = PORID[rel.a], b = PORID[rel.b]; if (!a || !b) continue;
      const ln = svgEl("path");
      ln.setAttribute("d", `M ${a.base.x} ${a.base.y} L ${b.base.x} ${b.base.y}`);
      ln.setAttribute("class", "relacion");
      g.appendChild(ln);
      const tx = svgEl("text");
      tx.setAttribute("x", ((a.base.x + b.base.x) / 2).toFixed(1));
      tx.setAttribute("y", ((a.base.y + b.base.y) / 2).toFixed(1));
      tx.setAttribute("class", "relacion-label");
      tx.textContent = rel.label;
      g.appendChild(tx);
    }
    capaHilos.appendChild(g);
  }

  /* =================================================================
     CABLEADO DE INTERACCIONES POR NODO
     ================================================================= */
  function cablearNodo(n, e) {
    // enlaces
    e.querySelectorAll(".enlace").forEach(a => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        accion();
        const tgt = a.dataset.target;
        const cond = a.dataset.cond;
        if (a.dataset.muta) { mutarEspacio(n, a); return; }
        if (cond && !visitados.has(cond)) {
          decir("este pasaje sólo se abre después de haber cruzado otro.");
          a.classList.add("rechazado");
          setTimeout(() => a.classList.remove("rechazado"), 800);
          return;
        }
        if (a.dataset.forma === "glifo" && n.recurrente) { perseguirRecurrente(n); return; }
        irA(tgt, a.dataset.forma);
      });
      // mantener presionado: traducción alternativa
      let holdT = null;
      a.addEventListener("pointerdown", () => {
        holdT = setTimeout(() => { revelarTraduccion(n, a); }, 480);
      });
      const cancelHold = () => { if (holdT) { clearTimeout(holdT); holdT = null; } };
      a.addEventListener("pointerup", cancelHold);
      a.addEventListener("pointerleave", cancelHold);
    });

    // clic en un signo (glifo) abre una bifurcación
    e.querySelectorAll(".glifo-nodo, .rec, .estrella").forEach(g => {
      g.addEventListener("click", (ev) => {
        if (ev.target.closest(".enlace")) return;
        ev.stopPropagation(); accion(); bifurcar(n, e);
      });
    });

    // seleccionar fragmento para relación temporal (clic simple en el cuerpo)
    e.addEventListener("click", (ev) => {
      if (ev.target.closest(".enlace") || ev.target.closest(".glifo-nodo")) return;
      accion();
      seleccionarFragmento(n, e);
    });

    // doble clic: rompe o duplica
    e.addEventListener("dblclick", (ev) => {
      ev.preventDefault(); ev.stopPropagation(); accion();
      if (R.chance(0.5)) romperNodo(n); else duplicarNodo(n);
    });

    // mostrar fragmentos ocultos al hover
    e.querySelectorAll(".oculto").forEach(o => {
      e.addEventListener("pointerenter", () => o.classList.add("visible"));
      e.addEventListener("pointerleave", () => o.classList.remove("visible"));
    });
  }

  /* =================================================================
     NAVEGACIÓN — la cámara continua, el hilo, la URL, los residuos
     ================================================================= */
  function centroDe(n) { return { x: n.base.x, y: n.base.y }; }

  function enfocar(n, instant) {
    const c = centroDe(n);
    const vw = W.innerWidth, vh = W.innerHeight;
    const escZoom = clamp(1.15 - profundidad * 0.02, 0.55, 1.4) * (1 / clamp(n.escala, 0.5, 2.4));
    cam.ts = clamp(escZoom, 0.5, 1.8);
    cam.tx = vw / 2 - c.x * cam.ts;
    cam.ty = vh / 2 - c.y * cam.ts;
    if (instant || REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; aplicarCam(); }
  }

  function irA(id, via, sinHistorial) {
    const n = PORID[id]; if (!n) return;
    const antes = actualId;
    actualId = id;
    profundidad++;
    n.visitas++;
    n.edad++;

    // loop espacial / falso / residuo: regresar a algo ya visto lo transforma
    if (visitados.has(id)) {
      n.residuo++;
      n.colorRol = (n.colorRol + 1) % 4;
      if (n.dom) {
        n.dom.style.setProperty("--ac", "var(--a" + n.colorRol + ")");
        n.dom.classList.add("transformado");
        // re-render parcial con residuo
        n.dom.innerHTML = contenidoNodo(n);
        cablearNodo(n, n.dom);
      }
      decir(esFalsoInicio(n) ? "parece el inicio, pero algo cambió de cauce." : "ya habías cruzado aquí. quedó un residuo.");
    }
    visitados.add(id);

    // loop textual: si es eco, muestra la frase de la fuente, mutada
    if (n.eco && n.dom) aplicarEco(n);

    // la memoria recuerda la ruta
    if (MEM) { MEM.rutas.push(id); if (MEM.rutas.length > 200) MEM.rutas.shift(); guardarMemoria(MEM); }

    historial.push({ id, via, t: performance.now() });
    if (historial.length > 60) historial.shift();

    enfocar(n);
    resaltarActual();
    actualizarHilo();
    actualizarCoord();
    escribirURL(sinHistorial);
    if (via) decir(fraseDeTransito(via, n));
    quizaSignificadoProvisional();
  }

  function esFalsoInicio(n) { return n.idx === 0; }

  function aplicarEco(n) {
    const src = PORID[n.eco]; if (!src) return;
    const modos = [consonantes, invertir, comprimir, (s) => borrar(s, R), (s) => ocr(s, R)];
    const m = R.pick(modos);
    const cont = n.dom.querySelector(".tr-a, .ms-cuerpo, .palabra, .nota, .frag, .traduccion-nodo, div");
    if (cont) {
      const eco = el("div", "eco-textual", "eco: " + m(src.frase));
      n.dom.appendChild(eco);
      setTimeout(() => eco.classList.add("vis"), 30);
    }
  }

  function mutarEspacio(n, a) {
    // el enlace modifica el espacio actual en vez de conducir a otro lugar
    accion();
    n.residuo++;
    n.colorRol = (n.colorRol + 1) % 4;
    // desplaza ligeramente los nodos vecinos (el campo se pliega)
    const vecinos = NODOS.slice().sort((x, y) => dist2(x, n) - dist2(y, n)).slice(1, 6);
    vecinos.forEach(v => {
      v.base.x = clamp(v.base.x + R.f(-60, 60), 20, WORLD_W - 20);
      v.base.y = clamp(v.base.y + R.f(-60, 60), 20, WORLD_H - 20);
      v.x = v.base.x; v.y = v.base.y;
      if (v.dom) { v.dom.style.left = v.x + "px"; v.dom.style.top = v.y + "px"; }
    });
    if (n.dom) { n.dom.classList.add("plegado"); n.dom.innerHTML = contenidoNodo(n); cablearNodo(n, n.dom); }
    dibujarHilos(); // recolocar líneas
    refrescarRelaciones();
    decir(R.pick(["el enlace plegó el espacio en lugar de cruzarlo.", "no fuiste a ningún sitio: el sitio vino a ti, cambiado.", "el campo se dobló sobre sí mismo."]));
  }

  function fraseDeTransito(via, n) {
    const m = {
      subrayado: "seguiste una palabra subrayada.",
      pagina: "un número de página te llevó fuera de la página.",
      glifo: "cruzaste por un signo.",
      flecha: "una flecha te empujó hasta aquí.",
      linea: "recorriste una línea del diagrama.",
      zona: "pisaste una zona invisible.",
      hover: "algo que sólo aparecía al mirarlo se abrió.",
      anidado: "había un enlace dentro del enlace.",
      rotado: "leíste de lado y encontraste una puerta.",
      margen: "el margen conducía al centro.",
      coordenada: "una coordenada te clasificó aquí.",
      puerta: "la puerta daba a otra puerta.",
    };
    return m[via] || "llegaste sin saber cómo.";
  }

  function perseguirRecurrente(desde) {
    const insts = NODOS.filter(x => x.recurrente);
    if (!insts.length) return;
    const i = insts.indexOf(desde);
    const sig = insts[(i + 1 + insts.length) % insts.length];
    decir("persigues el mismo glifo por el laberinto.");
    irA(sig.id, "glifo");
  }

  /* --- bifurcación, ruptura, duplicación --------------------------- */
  function bifurcar(n, e) {
    if (!n.enlaces.length) { decir("el signo se abrió a una salida sin salida."); return; }
    const cont = el("div", "bifurcacion");
    const opciones = R.shuffle(n.enlaces).slice(0, R.i(2, 3));
    opciones.forEach(enl => {
      const b = el("a", "enlace f-glifo bif", R.pick(GLIFOS.geometrias) + "<i>" + (PORID[enl.a] ? PORID[enl.a].idx : "∅") + "</i>");
      b.href = "#" + enl.a; b.dataset.target = enl.a; b.dataset.forma = "glifo";
      b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); accion(); irA(enl.a, "glifo"); });
      cont.appendChild(b);
    });
    e.appendChild(cont);
    setTimeout(() => cont.classList.add("vis"), 20);
    decir("el signo se abrió en una bifurcación.");
  }

  function romperNodo(n) {
    if (!n.dom || n.roto) { duplicarNodo(n); return; }
    n.roto = true;
    n.dom.classList.add("roto");
    const frag = n.dom.querySelector("[data-frag]");
    const texto = frag ? frag.getAttribute("data-frag") : n.frase;
    const trozos = texto.split(/\s+/);
    n.dom.querySelectorAll(".ms-cuerpo, .tr-a, .palabra, .nota, .pregunta, .biblio").forEach(c => {
      c.innerHTML = trozos.map(t => `<span class="trozo" style="--r:${(R.f(-1, 1) * 18).toFixed(1)}deg;--dx:${(R.f(-1, 1) * 14).toFixed(0)}px;--dy:${(R.f(-1, 1) * 14).toFixed(0)}px">${t}</span>`).join(" ");
    });
    decir("rompiste el nodo. los fragmentos ya no se dejan leer juntos.");
  }

  function duplicarNodo(n) {
    if (n.duplicado && R.chance(0.5)) { romperNodo(n); return; }
    n.duplicado = true;
    const copia = {
      ...n, id: n.id + "d" + Math.floor(R.raw() * 1000),
      base: { x: clamp(n.base.x + R.f(80, 200), 20, WORLD_W - 20), y: clamp(n.base.y + R.f(-120, 120), 20, WORLD_H - 20) },
      residuo: n.residuo + 1, comportamiento: "deriva", eco: n.id, recurrente: false, muerto: false,
      enlaces: n.enlaces.slice(),
    };
    copia.x = copia.base.x; copia.y = copia.base.y;
    NODOS.push(copia); PORID[copia.id] = copia;
    crearNodo(copia);
    decir("duplicaste el nodo. ahora hay dos originales, que es como decir ninguno.");
  }

  /* --- relación temporal entre dos fragmentos ---------------------- */
  function seleccionarFragmento(n, e) {
    if (seleccion.includes(n.id)) { seleccion = seleccion.filter(x => x !== n.id); e.classList.remove("seleccionado"); actualizarSel(); return; }
    seleccion.push(n.id); e.classList.add("seleccionado");
    if (MEM) { MEM.fragmentos.push(n.frase); if (MEM.fragmentos.length > 40) MEM.fragmentos.shift(); guardarMemoria(MEM); }
    if (seleccion.length >= 2) {
      const [a, b] = seleccion;
      const label = R.pick(["demora", "contagio", "contradicción", "pérdida", "herencia", "eco", "antes/después", "mismo río"]);
      relaciones.push({ a, b, label });
      if (MEM) { MEM.asociaciones.push({ a, b, label }); guardarMemoria(MEM); }
      const na = PORID[a], nb = PORID[b];
      if (na && na.dom) na.dom.classList.remove("seleccionado");
      if (nb && nb.dom) nb.dom.classList.remove("seleccionado");
      seleccion = [];
      refrescarRelaciones();
      decir("trazaste una relación temporal. conectar produjo una tercera cosa.");
    } else {
      decir("un fragmento seleccionado. elige otro para relacionarlos.");
    }
    actualizarSel();
  }
  function actualizarSel() {
    NODOS.forEach(n => { if (n.dom) n.dom.classList.toggle("seleccionado", seleccion.includes(n.id)); });
  }

  function revelarTraduccion(n, a) {
    const tr = R.pick(n.traducciones);
    const tip = el("div", "traduccion-tip", `<span class="tt-et">${tr.et}</span> ${tr.t}`);
    (a.closest(".nodo") || D.body).appendChild(tip);
    setTimeout(() => tip.classList.add("vis"), 10);
    setTimeout(() => { tip.classList.remove("vis"); setTimeout(() => tip.remove(), 400); }, 2600);
    if (MEM) { MEM.traduccion = n.traducciones.indexOf(tr); guardarMemoria(MEM); }
  }

  /* =================================================================
     CÁMARA / ANIMACIÓN
     ================================================================= */
  function aplicarCam() {
    campo.style.transform = `translate3d(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px, 0) scale(${cam.s.toFixed(4)})`;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(64, now - last); last = now;
    // ease de cámara
    const k = REDUCED ? 1 : 1 - Math.pow(0.0025, dt / 1000);
    cam.x = lerp(cam.x, cam.tx, k);
    cam.y = lerp(cam.y, cam.ty, k);
    cam.s = lerp(cam.s, cam.ts, k);
    aplicarCam();

    if (!REDUCED) animarNodos(now);
    dibujarRio(now);
    W.requestAnimationFrame(loop);
  }

  function animarNodos(now) {
    const t = now / 1000;
    for (const n of NODOS) {
      if (!n.dom) continue;
      let dx = 0, dy = 0, rot = 0;
      switch (n.comportamiento) {
        case "flota": dx = Math.sin(t * n.velo + n.fase) * 8; dy = Math.cos(t * n.velo * 0.8 + n.fase) * 8; break;
        case "vibra": dx = Math.sin(t * 22 + n.fase) * 1.4; dy = Math.cos(t * 19 + n.fase) * 1.4; break;
        case "orbita": dx = Math.cos(t * n.velo + n.fase) * 26; dy = Math.sin(t * n.velo + n.fase) * 26; rot = Math.sin(t * n.velo) * 4; break;
        case "deriva": {
          n.base.x += Math.cos(n.fase) * 0.12 * n.velo; n.base.y += Math.sin(n.fase) * 0.12 * n.velo;
          if (n.base.x < 0 || n.base.x > WORLD_W) n.fase = Math.PI - n.fase;
          if (n.base.y < 0 || n.base.y > WORLD_H) n.fase = -n.fase;
          n.x = n.base.x; n.y = n.base.y;
          n.dom.style.left = n.x + "px"; n.dom.style.top = n.y + "px";
          break;
        }
        case "huye": {
          const wp = pantallaAMundo(mouse.x, mouse.y);
          const ddx = n.base.x - wp.x, ddy = n.base.y - wp.y, d = Math.hypot(ddx, ddy);
          if (d < 220 && d > 0.1) { const f = (220 - d) / 220; dx = (ddx / d) * f * 40; dy = (ddy / d) * f * 40; }
          break;
        }
        case "sigue": {
          const wp = pantallaAMundo(mouse.x, mouse.y);
          const ddx = wp.x - n.base.x, ddy = wp.y - n.base.y, d = Math.hypot(ddx, ddy);
          if (d < 520) { dx = ddx * 0.06; dy = ddy * 0.06; }
          break;
        }
      }
      if (n.comportamiento !== "deriva") {
        n.dom.style.transform = `translate(-50%,-50%) translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(var(--esc))`;
      } else {
        n.dom.style.transform = `translate(-50%,-50%) scale(var(--esc))`;
      }
    }
  }

  function pantallaAMundo(px, py) {
    return { x: (px - cam.x) / cam.s, y: (py - cam.y) / cam.s };
  }

  /* =================================================================
     CANVAS — el río de datos, el polvo, los residuos
     ================================================================= */
  let rctx, particulas = [], rioW = 0, rioH = 0, rioReady = false;
  function initRio() {
    rctx = rio.getContext("2d");
    dimensionarRio();
    particulas = [];
    const N = REDUCED ? 60 : Math.min(160, Math.floor((rioW * rioH) / 14000));
    for (let i = 0; i < N; i++) {
      particulas.push({
        x: R.raw() * rioW, y: R.raw() * rioH,
        v: R.f(0.2, 1.1), size: R.f(8, 26),
        g: R.pick(MATERIA), a: R.f(0.05, 0.28),
        fase: R.f(0, Math.PI * 2),
      });
    }
    rioReady = true;
  }
  function dimensionarRio() {
    const dpr = Math.min(2, W.devicePixelRatio || 1);
    rioW = W.innerWidth; rioH = W.innerHeight;
    rio.width = rioW * dpr; rio.height = rioH * dpr;
    rio.style.width = rioW + "px"; rio.style.height = rioH + "px";
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function dibujarRio(now) {
    if (!rioReady) return;
    rctx.clearRect(0, 0, rioW, rioH);
    const t = now / 1000;
    rctx.textBaseline = "middle"; rctx.textAlign = "center";
    const parX = (cam.x % 200) * 0.06, parY = (cam.y % 200) * 0.06;
    for (const p of particulas) {
      if (!REDUCED) {
        p.x += p.v + Math.sin(t * 0.3 + p.fase) * 0.3;
        p.y += Math.cos(t * 0.2 + p.fase) * 0.2;
        if (p.x > rioW + 40) p.x = -40;
        if (p.y > rioH + 40) p.y = -40; else if (p.y < -40) p.y = rioH + 40;
      }
      rctx.globalAlpha = p.a;
      rctx.fillStyle = getComputedStyle(D.documentElement).getPropertyValue("--ink") || "#ccc";
      rctx.font = p.size + "px 'IDR-materia', monospace";
      rctx.fillText(p.g, p.x + parX, p.y + parY);
    }
    rctx.globalAlpha = 1;
  }

  /* =================================================================
     HUD — hilo de Ariadna, coordenada, estado, semilla
     ================================================================= */
  let decirT = null;
  function decir(msg) {
    elEstado.textContent = msg;
    elEstado.classList.remove("parpadea"); void elEstado.offsetWidth; elEstado.classList.add("parpadea");
    if (decirT) clearTimeout(decirT);
    decirT = setTimeout(() => { elEstado.textContent = R.pick(HUMOR); }, 6000);
  }

  function actualizarHilo() {
    // el hilo de Ariadna, poco fiable: a veces inserta un nodo no visitado
    const ult = historial.slice(-9);
    let marcas = ult.map(h => {
      const n = PORID[h.id];
      return `<span class="hn" data-id="${h.id}" title="${n ? n.tipo : "?"}">${n ? n.coord.glifos : "∅"}</span>`;
    });
    if (R.chance(0.3)) {
      const fantasma = R.pick(NODOS);
      marcas.splice(R.i(0, marcas.length), 0, `<span class="hn fantasma" data-id="${fantasma.id}" title="¿visitaste esto?">${fantasma.coord.glifos}</span>`);
    }
    elHilo.innerHTML = "☘ " + marcas.join("<span class='sep'>→</span>");
    elHilo.querySelectorAll(".hn").forEach(h => h.addEventListener("click", () => { accion(); irA(h.dataset.id, "linea"); }));
  }

  function actualizarCoord() {
    const n = PORID[actualId];
    if (!n) return;
    elCoord.textContent = `⌖ ${(n.base.x / 100).toFixed(2)} · ${(n.base.y / 100).toFixed(2)} · z${profundidad} · ${n.coord.glifos}`;
  }

  function resaltarActual() {
    NODOS.forEach(n => { if (n.dom) n.dom.classList.toggle("actual", n.id === actualId); });
  }

  /* =================================================================
     CÁMARAS DENSAS — AFUERA · EL SIGNIFICADO PROVISIONAL · MAPA
     ================================================================= */
  function abrirCamara(html, cls) {
    camara.className = "camara " + (cls || "");
    camara.innerHTML = html;
    camara.hidden = false;
    requestAnimationFrame(() => camara.classList.add("abierta"));
    camara.querySelectorAll("[data-ir]").forEach(b => b.addEventListener("click", () => {
      cerrarCamara(); irA(b.dataset.ir, "puerta");
    }));
    camara.querySelectorAll("[data-cerrar]").forEach(b => b.addEventListener("click", cerrarCamara));
  }
  function cerrarCamara() {
    camara.classList.remove("abierta");
    setTimeout(() => { camara.hidden = true; camara.innerHTML = ""; }, 380);
  }

  function afuera() {
    const g = () => R.pick(MATERIA);
    let muro = "";
    for (let i = 0; i < 220; i++) muro += g();
    const salidas = R.shuffle(NODOS).slice(0, 5).map(n =>
      `<button class="af-salida enlace" data-ir="${n.id}">${n.coord.glifos} ${R.pick(["regresar", "entrar", "seguir", "volver a empezar", "no salir"])}</button>`).join("");
    abrirCamara(`
      <div class="af">
        <div class="af-muro" aria-hidden="true">${muro}</div>
        <h2>AFUERA</h2>
        <p class="af-lema">La salida fue traducida como entrada.</p>
        <p class="af-txt">${R.pick([
          "Esto es afuera. Es idéntico a adentro, pero lo llamamos de otro modo para poder despedirnos.",
          "No hay puerta. Hay una glosa de una puerta, y la glosa la contradice.",
          "Cruzaste el umbral y el umbral te cruzó a ti. Nadie sabe quién quedó de qué lado.",
          "El río sigue afuera. Afuera del río también hay río.",
        ])}</p>
        <div class="af-salidas">${salidas}</div>
        <p class="af-pie">${R.pick(HUMOR)}</p>
      </div>`, "es-afuera");
    decir("Escape no sale. Conduce afuera, que es otro adentro.");
  }

  let provisionalMostrado = 0;
  function quizaSignificadoProvisional() {
    if (visitados.size < 12) return;
    if (provisionalMostrado && visitados.size < provisionalMostrado + 9) return;
    provisionalMostrado = visitados.size;
    significadoProvisional();
  }

  function significadoProvisional() {
    // compone una frase con fragmentos recorridos
    const frags = [];
    historial.slice(-16).forEach(h => { const n = PORID[h.id]; if (n) frags.push(n.frase); });
    if (MEM && MEM.fragmentos) MEM.fragmentos.slice(-6).forEach(f => frags.push(f));
    const palabras = [];
    R.shuffle(frags).slice(0, 8).forEach(f => {
      const w = f.split(/\s+/); palabras.push(w[R.i(0, w.length - 1)]);
    });
    while (palabras.length < 7) palabras.push(R.pick(PALABRAS));
    const frase = palabras.slice(0, R.i(7, 11)).join(" ");
    const spanFrase = frase.split(/\s+/).map((w, i) =>
      `<span class="sp-w" style="--i:${i}">${w}</span>`).join(" ");

    abrirCamara(`
      <div class="sp">
        <div class="sp-cap">EL SIGNIFICADO PROVISIONAL</div>
        <div class="sp-frase">${spanFrase}</div>
        <div class="sp-nota">— frase compuesta por tu recorrido. válida durante unos segundos.</div>
      </div>`, "es-provisional");
    decir("el laberinto compuso un significado provisional con tu lectura.");

    // parece reveladora unos segundos y luego se descompone en enlaces
    const dur = REDUCED ? 1 : 3600;
    setTimeout(() => {
      const cont = camara.querySelector(".sp-frase");
      if (!cont) return;
      cont.classList.add("descompone");
      const ws = cont.querySelectorAll(".sp-w");
      ws.forEach(w => {
        const tgt = R.pick(NODOS).id;
        const a = el("a", "enlace f-subrayado", w.textContent);
        a.href = "#" + tgt; a.dataset.target = tgt;
        a.addEventListener("click", (ev) => { ev.preventDefault(); cerrarCamara(); irA(tgt, "subrayado"); });
        w.replaceWith(a);
      });
      const nota = camara.querySelector(".sp-nota");
      if (nota) nota.textContent = "la revelación se deshizo en enlaces. la recompensa no era entender: era este otro texto.";
    }, dur);
  }

  function toggleMapa() {
    if (!mapaCam.hidden) { mapaCam.hidden = true; mapaCam.classList.remove("abierta"); return; }
    dibujarMapa();
    mapaCam.hidden = false;
    requestAnimationFrame(() => mapaCam.classList.add("abierta"));
  }
  function dibujarMapa() {
    const w = 340, h = 240;
    const sx = w / WORLD_W, sy = h / WORLD_H;
    let dots = "", lines = "";
    // mapa incompleto: sólo una fracción de nodos, y algunos falsos
    const muestra = R.shuffle(NODOS).slice(0, Math.floor(NODOS.length * R.f(0.4, 0.7)));
    for (const n of muestra) {
      const vis = visitados.has(n.id);
      dots += `<circle cx="${(n.base.x * sx).toFixed(1)}" cy="${(n.base.y * sy).toFixed(1)}" r="${vis ? 3 : 1.6}"
        class="${vis ? "mv" : "mn"} ${n.id === actualId ? "ma" : ""}" data-id="${n.id}"/>`;
    }
    for (const n of muestra) {
      for (const enl of n.enlaces) {
        if (!R.chance(0.4)) continue; const t = PORID[enl.a]; if (!t) continue;
        lines += `<line x1="${(n.base.x * sx).toFixed(1)}" y1="${(n.base.y * sy).toFixed(1)}" x2="${(t.base.x * sx).toFixed(1)}" y2="${(t.base.y * sy).toFixed(1)}" class="ml"/>`;
      }
    }
    mapaCam.innerHTML = `
      <div class="mapa-w">
        <div class="mapa-cap">MAPA INCOMPLETO · ${muestra.length}/${NODOS.length} nodos · el resto sigue enterrado</div>
        <svg viewBox="0 0 ${w} ${h}" class="mapa-svg">${lines}${dots}</svg>
        <div class="mapa-pie">${R.pick(["según una fuente circular, la fuente es circular.", "las zonas en blanco no están vacías: están sin leer.", "el mapa miente con precisión."])} <button data-cerrar-mapa>cerrar [M]</button></div>
      </div>`;
    mapaCam.querySelectorAll("circle[data-id]").forEach(c => c.addEventListener("click", () => { toggleMapa(); irA(c.dataset.id, "coordenada"); }));
    const cb = mapaCam.querySelector("[data-cerrar-mapa]"); if (cb) cb.addEventListener("click", toggleMapa);
  }

  /* =================================================================
     IMPRESIÓN — imponer la versión actual (P)
     ================================================================= */
  function imprimir() {
    const rutas = historial.slice(-24).map(h => { const n = PORID[h.id]; return n ? n.frase : ""; }).filter(Boolean);
    let laminas = "";
    laminas += `<div class="lamina portada">
      <div class="p-glifos">${Array.from({ length: 60 }, () => R.pick(MATERIA)).join("")}</div>
      <h1>ÍNDICE DEL RÍO</h1>
      <p>el texto que todavía no ha sido encontrado</p>
      <p class="p-meta">semilla ${SEED} · z${profundidad} · ${visitados.size} nodos leídos · ${new Date().toLocaleString()}</p>
      <p class="p-cita">${R.pick(HUMOR)}</p></div>`;
    // láminas de fragmentos recorridos
    for (let i = 0; i < rutas.length; i += 4) {
      const bloque = rutas.slice(i, i + 4).map(f =>
        `<div class="p-frag"><div class="p-cif">${ALF.cifrar(f.slice(0, 40))}</div><div class="p-leg">${f}</div><div class="p-tr">${R.pick(["consonántica: " + consonantes(f), "OCR: " + ocr(f, R), "invertida: " + invertir(f)])}</div></div>`).join("");
      laminas += `<div class="lamina estrato"><div class="l-cap">estrato ${(i / 4 + 1) | 0} · ${ALF.familia}</div>${bloque}</div>`;
    }
    // lámina de relaciones
    if (relaciones.length) {
      const rel = relaciones.map(r => `<li>${PORID[r.a] ? PORID[r.a].coord.glifos : "∅"} —<em>${r.label}</em>→ ${PORID[r.b] ? PORID[r.b].coord.glifos : "∅"}</li>`).join("");
      laminas += `<div class="lamina enlaces"><div class="l-cap">relaciones que produjiste</div><ul>${rel}</ul></div>`;
    }
    // colofón
    laminas += `<div class="lamina colofon">
      <div class="l-cap">colofón</div>
      <p>Esta edición fue impuesta por una sola lectura, la tuya, que ya cambió de cauce.</p>
      <p>${MEM ? MEM._inventado : ""}</p>
      <p class="p-firma">poesiasexp · canekzapata · versión provisional ${(R.raw() * 9999) | 0}</p></div>`;
    impreso.innerHTML = laminas;
    impreso.setAttribute("aria-hidden", "false");
    D.body.classList.add("imprimiendo");
    decir("imponiendo esta lectura como edición.");
    setTimeout(() => {
      W.print();
      setTimeout(() => { D.body.classList.remove("imprimiendo"); impreso.setAttribute("aria-hidden", "true"); }, 400);
    }, 120);
  }

  /* =================================================================
     ENTRADA — arrastre, zoom, teclado, inactividad
     ================================================================= */
  let mouse = { x: W.innerWidth / 2, y: W.innerHeight / 2 };
  const punteros = new Map();
  let arrastrando = false, arr0 = null, pinch0 = null;

  function accion() { ultimaAccion = performance.now(); if (excavando) detenerExcavacion(); reArmarIdle(); }

  campo.parentElement.addEventListener("pointermove", (ev) => { mouse.x = ev.clientX; mouse.y = ev.clientY; });

  D.addEventListener("pointerdown", (ev) => {
    if (ev.target.closest("#hud") || ev.target.closest(".camara") || ev.target.closest("#mapa")) return;
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 1) {
      // sólo arrastrar campo si no es un enlace/nodo interactivo
      const enNodo = ev.target.closest(".enlace, .glifo-nodo");
      if (!enNodo) { arrastrando = true; arr0 = { x: ev.clientX, y: ev.clientY, camx: cam.tx, camy: cam.ty }; campo.classList.add("arrastrando"); }
    } else if (punteros.size === 2) {
      const pts = [...punteros.values()];
      pinch0 = { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), s: cam.ts,
        cx: (pts[0].x + pts[1].x) / 2, cy: (pts[0].y + pts[1].y) / 2 };
      arrastrando = false;
    }
  });
  D.addEventListener("pointermove", (ev) => {
    if (!punteros.has(ev.pointerId)) return;
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 2 && pinch0) {
      const pts = [...punteros.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ns = clamp(pinch0.s * (d / pinch0.d), 0.3, 3.2);
      zoomHacia(pinch0.cx, pinch0.cy, ns);
      accion();
    } else if (arrastrando && arr0) {
      cam.tx = arr0.camx + (ev.clientX - arr0.x);
      cam.ty = arr0.camy + (ev.clientY - arr0.y);
      if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; }
      accion();
    }
  });
  function finPuntero(ev) {
    punteros.delete(ev.pointerId);
    if (punteros.size < 2) pinch0 = null;
    if (punteros.size === 0) { arrastrando = false; campo.classList.remove("arrastrando"); }
  }
  D.addEventListener("pointerup", finPuntero);
  D.addEventListener("pointercancel", finPuntero);

  campo.parentElement.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const factor = Math.exp(-ev.deltaY * 0.0012);
    zoomHacia(ev.clientX, ev.clientY, clamp(cam.ts * factor, 0.3, 3.2));
    accion();
  }, { passive: false });

  function zoomHacia(px, py, ns) {
    const wx = (px - cam.tx) / cam.ts, wy = (py - cam.ty) / cam.ts;
    cam.ts = ns;
    cam.tx = px - wx * ns;
    cam.ty = py - wy * ns;
    if (REDUCED) { cam.s = cam.ts; cam.x = cam.tx; cam.y = cam.ty; }
  }

  W.addEventListener("keydown", (ev) => {
    if (ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA")) {
      if (ev.key === "Enter" && ev.target.id === "semilla") { relanzarSemilla(ev.target.value.trim()); }
      return;
    }
    const k = ev.key.toLowerCase();
    if (k === "r") { accion(); reExcavar(); }
    else if (k === "m") { accion(); toggleMapa(); }
    else if (k === "t") { accion(); toggleTraduccion(); }
    else if (k === "p") { accion(); ev.preventDefault(); imprimir(); }
    else if (ev.key === "Escape") { accion(); ev.preventDefault(); if (!camara.hidden) cerrarCamara(); else afuera(); }
  });

  function toggleTraduccion() {
    traducirGlobal = !traducirGlobal;
    D.body.classList.toggle("traducir", traducirGlobal);
    NODOS.forEach(n => {
      if (!n.dom) return;
      n.dom.querySelectorAll("[data-frag]").forEach(fr => {
        if (traducirGlobal) {
          if (!fr.dataset.orig) fr.dataset.orig = fr.innerHTML;
          const src = fr.getAttribute("data-frag");
          const modo = R.pick([consonantes, invertir, comprimir, (s) => ocr(s, R), (s) => ALF.cifrar(s)]);
          fr.innerHTML = `<span class="traducido">${modo(src)}</span>`;
        } else if (fr.dataset.orig) {
          fr.innerHTML = fr.dataset.orig;
        }
      });
    });
    decir(traducirGlobal ? "traducciones activadas. certificadas por una lengua que aún no existe." : "traducciones desactivadas. vuelve el original que nunca hubo.");
  }

  /* --- inactividad: el sistema excava solo -------------------------- */
  function reArmarIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => iniciarExcavacion(), REDUCED ? 30000 : 18000);
  }
  function iniciarExcavacion() {
    if (excavando) return;
    excavando = true;
    D.body.classList.add("excavando");
    decir("inactividad detectada. el sistema continúa excavando solo.");
    pasoExcavacion();
  }
  let excT = null;
  function pasoExcavacion() {
    if (!excavando) return;
    // navega solo por un enlace
    const n = PORID[actualId] || NODOS[0];
    let sig = null;
    if (n && n.enlaces.length) sig = PORID[R.pick(n.enlaces).a];
    if (!sig) sig = R.pick(NODOS);
    // reescribe un fragmento al azar (loop temporal)
    reescribirFragmento();
    if (sig) irA(sig.id, R.pick(["flecha", "linea", "puerta"]), false);
    excT = setTimeout(pasoExcavacion, REDUCED ? 9000 : 5200);
  }
  function detenerExcavacion() {
    excavando = false;
    D.body.classList.remove("excavando");
    if (excT) { clearTimeout(excT); excT = null; }
  }

  /* --- loop temporal: fragmentos que se reescriben solos ----------- */
  function reescribirFragmento() {
    const cand = NODOS.filter(n => n.dom && n.dom.querySelector("[data-frag]"));
    if (!cand.length) return;
    const n = R.pick(cand);
    const fr = n.dom.querySelector("[data-frag]");
    const src = fr.getAttribute("data-frag");
    const modo = R.pick([(s) => ocr(s, R), consonantes, comprimir, (s) => borrar(s, R), invertir]);
    fr.innerHTML = `<span class="reescrito">${modo(src)}</span>`;
    n.dom.classList.add("mutando");
    setTimeout(() => { if (n.dom) n.dom.classList.remove("mutando"); }, 1200);
  }
  function iniciarLoopTemporal() {
    if (temporalTimer) clearInterval(temporalTimer);
    if (REDUCED) return; // sin timer bajo reduced-motion (se reescribe al interactuar)
    temporalTimer = setInterval(() => { if (!excavando) reescribirFragmento(); }, 9000);
  }

  /* =================================================================
     ARRANQUE / RELANZAMIENTO
     ================================================================= */
  function relanzarSemilla(s) {
    if (!s) return;
    const p = new URLSearchParams(); p.set("seed", s); p.set("z", "0");
    location.search = p.toString();
  }
  function reExcavar() {
    const p = new URLSearchParams(); p.set("seed", nuevaSemilla()); p.set("z", "0");
    location.search = p.toString();
  }
  function relanzarSemillaBtn() { relanzarSemilla(elSemilla.value.trim()); }

  W.addEventListener("popstate", (ev) => {
    // el botón Atrás es parte de la obra (hilo de Ariadna)
    const st = ev.state;
    if (st && st.n && PORID[st.n]) {
      profundidad = st.z || 0;
      actualId = st.n;
      const n = PORID[actualId];
      enfocar(n); resaltarActual(); actualizarHilo(); actualizarCoord();
      decir(R.chance(0.4) ? "el hilo de Ariadna te devolvió, pero no exactamente al mismo lugar." : "regresas por el hilo.");
      // residuo del regreso
      n.residuo++; if (n.dom) { n.dom.innerHTML = contenidoNodo(n); cablearNodo(n, n.dom); }
    }
  });

  W.addEventListener("resize", () => { if (rioReady) dimensionarRio(); });

  function conectarHUD() {
    D.getElementById("b-r").addEventListener("click", () => { accion(); reExcavar(); });
    D.getElementById("b-m").addEventListener("click", () => { accion(); toggleMapa(); });
    D.getElementById("b-t").addEventListener("click", () => { accion(); toggleTraduccion(); });
    D.getElementById("b-p").addEventListener("click", () => { accion(); imprimir(); });
    elSemilla.value = SEED;
    elSemilla.addEventListener("change", relanzarSemillaBtn);
    // clic en el título hace zoom-out al campo entero (perderse)
    D.getElementById("titulo").addEventListener("click", () => { accion(); vistaCompleta(); });
  }

  function vistaCompleta() {
    const vw = W.innerWidth, vh = W.innerHeight;
    cam.ts = clamp(Math.min(vw / WORLD_W, vh / WORLD_H) * 0.92, 0.1, 1);
    cam.tx = vw / 2 - (WORLD_W / 2) * cam.ts;
    cam.ty = vh / 2 - (WORLD_H / 2) * cam.ts;
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    decir("te alejaste hasta ver el laberinto entero. sigue sin tener centro.");
  }

  function arrancar() {
    const url = leerURL();
    construir();
    aplicarPaleta();
    render();
    conectarHUD();
    initRio();

    // memoria: notas inventadas del lector anterior se cuelgan en algún nodo
    if (MEM && MEM._inventado) {
      const n = R.pick(NODOS);
      if (n && n.dom) {
        const nota = el("div", "nota-lector inventada", MEM._inventado);
        n.dom.appendChild(nota);
      }
    }
    // asociaciones recordadas (algunas mutadas)
    if (MEM && MEM.asociaciones) {
      MEM.asociaciones.slice(-4).forEach(as => {
        if (PORID[as.a] && PORID[as.b]) relaciones.push({ a: as.a, b: as.b, label: as.label + " (recordado)" });
      });
      refrescarRelaciones();
    }

    // nodo inicial (de la URL o el manuscrito)
    let iniId = (url.n && PORID[url.n]) ? url.n : "n0";
    profundidad = url.z || 0;
    actualId = null;
    // primer enfoque sin empujar historial
    const ini = PORID[iniId] || NODOS[0];
    actualId = ini.id; visitados.add(ini.id); historial.push({ id: ini.id, via: null, t: performance.now() });
    // encuadre inicial: establecer el laberinto con varias capas a la vista
    const vw = W.innerWidth, vh = W.innerHeight;
    cam.ts = clamp(Math.min(vw / (WORLD_W * 0.42), vh / (WORLD_H * 0.42)), 0.42, 0.9);
    cam.tx = vw / 2 - ini.base.x * cam.ts;
    cam.ty = vh / 2 - ini.base.y * cam.ts;
    cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; aplicarCam();
    resaltarActual(); actualizarHilo(); actualizarCoord();
    escribirURL(true);

    W.requestAnimationFrame(loop);
    iniciarLoopTemporal();
    reArmarIdle();

    decir(R.pick([
      "el río todavía no ha sido leído. arrastra para excavar.",
      "un texto antiguo dentro de una red averiada. nadie sabe en qué lengua.",
      "Fragmento 0 de 0. empieza por cualquier parte.",
      "no hay menú. hay cauce.",
    ]));
  }

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();

})();
