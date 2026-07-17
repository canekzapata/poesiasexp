/*
  motor.js — LOOP: una nave que escribe su deterioro
  poesiasexp / canekzapata

  el motor no cuenta una historia: produce, corrompe, espacia, repite,
  traduce, corta, intensifica y redistribuye texto. la decisión del lector
  y el azar del daño comparten el timón. la memoria vive en localStorage
  y vuelve, con cicatrices, en cada ciclo.

  arquitectura:
    azar ▸ memoria ▸ estado ▸ contaminación ▸ degradación ▸
    formas de escritura ▸ escenas ▸ navegación ▸ crash ▸ loop ▸ render
*/

/* =====================================================================
   1 · azar
===================================================================== */

function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
function azarN(n) { return Math.floor(Math.random() * n); }
function prob(p) { return Math.random() < p; }
function probabilidad(min, max) { return min + Math.random() * (max - min); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pad3(n) { return String(Math.max(0, Math.floor(n))).padStart(3, "0"); }
function barajar(lista) {
  const l = lista.slice();
  for (let i = l.length - 1; i > 0; i--) {
    const j = azarN(i + 1); [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}
function muestra(lista, n) { return barajar(lista).slice(0, n); }

/* =====================================================================
   2 · memoria — lo que sobrevive al cierre de la pestaña
===================================================================== */

const CLAVE_MEMORIA = "loopnave.memoria";

function memoriaVacia() {
  return {
    v: 1,
    ciclos: 0,            // cuántas veces se volvió al inicio
    crashesTotales: 0,    // cuántas veces se rompió la lectura
    deterioro: 0,         // nivel acumulado de rareza
    cicatrices: [],       // frases que dejaron los crashes
    contaminadas: {},     // palabras secuestradas: {palabra: doble}
    recuperadas: [],      // frases rescatadas de cajas negras ajenas
    encuentros: [],       // qué se avistó en otros ciclos
  };
}

function cargarMemoria() {
  try {
    const cruda = localStorage.getItem(CLAVE_MEMORIA);
    if (!cruda) return memoriaVacia();
    const m = Object.assign(memoriaVacia(), JSON.parse(cruda));
    return m;
  } catch (e) {
    // una memoria que no se puede leer también es una forma de memoria
    return memoriaVacia();
  }
}

function guardarMemoria() {
  try { localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(memoria)); }
  catch (e) { /* si no se puede recordar, se navega igual */ }
}

function borrarMemoria() {
  memoria = memoriaVacia();
  guardarMemoria();
}

let memoria = cargarMemoria();

/* =====================================================================
   3 · estado — la nave, en números que se portan como adjetivos
===================================================================== */

const estado = {
  energia: 100,
  casco: 100,
  memoria: 100,
  senal: 100,
  coherencia: 100,
  contaminacion: 0,
  deriva: 0,
  ciclos: memoria.ciclos,
  crashes: memoria.crashesTotales,
  pasos: 0,
  escena: "inicio",
  ruta: [],
  cicatrices: memoria.cicatrices.slice(),
  archivo: [],          // frases que la nave se dice y podría repetir
  voz: "nave",
  tomada: false,
  crash: false,
  motivoCrash: null,
};

function estadoInicialDeCiclo() {
  const d = memoria.deterioro;
  estado.energia  = clamp(100 - d * 2 - azarN(6), 40, 100);
  estado.casco    = clamp(100 - memoria.crashesTotales * 3 - azarN(8), 30, 100);
  estado.memoria  = clamp(100 - memoria.ciclos * 4 - memoria.crashesTotales * 2, 15, 100);
  estado.senal    = clamp(100 - azarN(10) - d, 25, 100);
  estado.coherencia = clamp(100 - d * 3 - azarN(6), 20, 100);
  estado.contaminacion = clamp(Object.keys(memoria.contaminadas).length * 7 + d, 0, 70);
  estado.deriva = clamp(d * 2, 0, 60);
  estado.ciclos = memoria.ciclos;
  estado.crashes = memoria.crashesTotales;
  estado.pasos = 0;
  estado.ruta = [];
  estado.archivo = [];
  estado.cicatrices = memoria.cicatrices.slice();
  estado.voz = "nave";
  estado.tomada = false;
  estado.crash = false;
  estado.motivoCrash = null;
}

/* cada escena cuesta algo, incluso las que no cuestan nada */
function desgastePaso() {
  estado.energia = clamp(estado.energia - probabilidad(0.5, 3), 0, 100);
  estado.senal   = clamp(estado.senal - probabilidad(0, 2.5) - estado.pasos * 0.05, 0, 100);
  estado.memoria = clamp(estado.memoria - probabilidad(0, 1.5), 0, 100);
  estado.coherencia = clamp(
    estado.coherencia - probabilidad(0, 1) - estado.contaminacion * 0.02, 0, 100);
  if (prob(0.15)) estado.deriva = clamp(estado.deriva + probabilidad(0, 4), 0, 100);
}

function archivar(frase) {
  if (!frase) return;
  estado.archivo.push(frase);
  if (estado.archivo.length > 40) estado.archivo.shift();
  if (prob(0.2)) {
    memoria.recuperadas.push(frase);
    if (memoria.recuperadas.length > 24) memoria.recuperadas.shift();
  }
}

function registrarCicatriz(texto) {
  memoria.cicatrices.push(texto);
  if (memoria.cicatrices.length > 18) memoria.cicatrices.shift();
  estado.cicatrices = memoria.cicatrices.slice();
  guardarMemoria();
}

function registrarEncuentro(texto) {
  memoria.encuentros.push(texto);
  if (memoria.encuentros.length > 20) memoria.encuentros.shift();
}

/* =====================================================================
   4 · contaminación — las palabras secuestradas
===================================================================== */

function contaminarPalabra() {
  const candidatas = Object.keys(CORPUS.contaminables)
    .filter(p => !(p in memoria.contaminadas));
  if (!candidatas.length) return;
  const p = azar(candidatas);
  memoria.contaminadas[p] = azar(CORPUS.contaminables[p]);
  guardarMemoria();
}

function aplicarContaminacion(texto) {
  const claves = Object.keys(memoria.contaminadas);
  if (!claves.length) return texto;
  for (const p of claves) {
    const re = new RegExp("\\b" + p + "\\b", "gi");
    texto = texto.replace(re,
      '<span class="contaminada">' + memoria.contaminadas[p] + "</span>");
  }
  return texto;
}

/* =====================================================================
   5 · degradación — el deterioro escribe
===================================================================== */

const VOCALES = "aeiouáéíóú";

function desvocalizar(palabra) {
  return palabra.split("").map(c =>
    VOCALES.includes(c.toLowerCase()) && prob(0.8) ? "_" : c).join("");
}

function intercambiarLetras(palabra) {
  if (palabra.length < 4) return palabra;
  const i = 1 + azarN(palabra.length - 3);
  const l = palabra.split("");
  [l[i], l[i + 1]] = [l[i + 1], l[i]];
  return l.join("");
}

function intensidadDeterioro() {
  return clamp(
    (100 - estado.coherencia) / 160 +
    estado.ciclos * 0.02 +
    (estado.crash ? 0.18 : 0) +
    memoria.deterioro * 0.01,
    0, 0.55);
}

function degradarTexto(texto, intensidad) {
  if (intensidad <= 0.02) return texto;
  return texto.split(" ").map(w => {
    if (w.length < 2) return w;
    const r = Math.random();
    if (r < intensidad * 0.22) return desvocalizar(w);
    if (r < intensidad * 0.32) return w + " " + w;                       // stein
    if (r < intensidad * 0.40) return azar(CORPUS.glifos.marcas) + w;
    if (r < intensidad * 0.48) return intercambiarLetras(w);
    return w;
  }).join(" ");
}

function cortarSenal(texto) {
  if (estado.senal >= 40) return texto;
  const k = (40 - estado.senal) / 40;   // 0..1
  return texto.split(" ").map(w =>
    prob(k * 0.3) ? "···" : w).join(" ");
}

/* la tubería completa: todo texto de la nave pasa por aquí */
function procesar(texto) {
  texto = degradarTexto(texto, intensidadDeterioro());
  texto = cortarSenal(texto);
  texto = aplicarContaminacion(texto);
  return texto;
}

function glitchVerbal(texto) {
  return texto.split(" ").map(w => desvocalizar(w)).join(" ");
}

/* =====================================================================
   6 · formas de escritura — los modos del texto
   cada una devuelve html; la interfaz es mínima, esto es lo máximo
===================================================================== */

function b(clase, html) { return { clase, html }; }

function bitacora() {
  const dia = "DÍA " + pad3(azarN(400) + estado.pasos) + " / " + azar(CORPUS.tecnica.horasRaras);
  const n = estado.energia > 40 ? 2 + azarN(2) : 1;
  const lineas = muestra(CORPUS.bitacoras, n).map(l => {
    archivar(l);
    return "<p>" + procesar(l) + "</p>";
  }).join("");
  return b("bitacora", '<div class="rotulo">' + dia + "</div>" + lineas);
}

function informe() {
  const filas = [
    "casco: " + Math.round(estado.casco) + "%",
    "energía: " + Math.round(estado.energia) + "%",
    "memoria: " + Math.round(estado.memoria) + "%",
    "señal: " + pad3(Math.round(estado.senal)).slice(-2) + " " + azar(CORPUS.tecnica.unidades),
  ];
  if (prob(0.7)) filas.push("anomalía: " + azar(CORPUS.danos));
  if (prob(0.5)) filas.push(azar(CORPUS.diagnosticos));
  return b("informe", "<pre>" + filas.map(f => procesar(f)).join("\n") + "</pre>");
}

/* poema concreto: o una pieza fija del corpus, o un rombo generado */
function poemaConcreto(palabra) {
  if (!palabra && prob(0.4)) {
    return b("poema-concreto", "<pre>" + azar(CORPUS.poemasVisuales) + "</pre>");
  }
  const a = palabra || azar(CORPUS.palabras);
  const c = azar(CORPUS.palabras);
  const l1 = " ".repeat(a.length + 3) + a;
  const l2 = " ".repeat(Math.ceil(a.length / 2)) + a + " " + a;
  const l3 = a + "   " + c + "   " + a;
  const poema = [l1, l2, l3, l2, l1].join("\n");
  return b("poema-concreto", "<pre>" + poema + "</pre>");
}

/* columna de deterioro: una palabra pierde letras verso a verso */
function columnaDeterioro(palabra) {
  const p = palabra || azar(CORPUS.palabras);
  const versos = [p];
  let actual = p;
  while (actual.replace(/_/g, "").length > 0) {
    const letras = actual.split("");
    const vivas = letras.map((c, i) => c !== "_" ? i : -1).filter(i => i >= 0);
    letras[azar(vivas)] = "_";
    actual = letras.join("");
    versos.push(actual);
  }
  return b("poema-concreto", "<pre>" + versos.join("\n") + "</pre>");
}

function senalRecibida() {
  const s = azar(CORPUS.senales);
  archivar(s);
  registrarEncuentro("señal: " + s.slice(0, 40));
  const cab = "··· rec ··· ib ··· ido ···";
  const veces = 1 + azarN(3);
  const cuerpo = Array.from({ length: veces }, () => procesar(s)).join("<br>");
  return b("senal", '<div class="rotulo">' + cab + "</div><p>" + cuerpo + "</p>");
}

function prosaGalactica() {
  let t = azar(CORPUS.prosaLarga);
  t = t.replace(/\{objeto\}/g, () => azar(CORPUS.objetos))
       .replace(/\{fenomeno\}/g, () => azar(CORPUS.fenomenos))
       .replace(/\{palabra\}/g, () => azar(CORPUS.palabras))
       .replace(/\{recuerdo\}/g, () => azar(CORPUS.recuerdosTierra))
       .replace(/\{conector\}/g, () => azar(CORPUS.conectores))
       .replace(/\{dano\}/g, () => azar(CORPUS.danos))
       .replace(/\{planeta\}/g, () => azar(CORPUS.planetas));
  archivar(t.split(",")[0] + ",");
  return b("prosa", "<p>" + procesar(t) + "</p>");
}

function tablaRota() {
  const filas = [
    ["OBJETO", "DISTANCIA", "RIESGO", "NOMBRE"],
  ];
  const dist = ["cerca/lejos", "ilegible", "interior", "creciente", "una palabra", "detrás de ti"];
  const riesgo = ["bajo/alto", "medio", "extremo", "sin calcular", "ya ocurrió", "hermoso"];
  const nombre = ["todavía no", "pronuncia agua", "yo", "(vacío)", "no repetir", "regreso"];
  const n = 3 + azarN(2);
  for (let i = 0; i < n; i++) {
    filas.push([azar(CORPUS.palabras), azar(dist), azar(riesgo), azar(nombre)]);
  }
  const anchos = [14, 16, 14, 0];
  const texto = filas.map(f =>
    f.map((c, i) => anchos[i] ? c.padEnd(anchos[i]) : c).join("")).join("\n");
  return b("tabla-rota", "<pre>" + texto + "</pre>");
}

/* constelación: palabras como estrellas, con fragmentos ocultos */
function constelacionVerbal() {
  const n = estado.energia > 30 ? 8 + azarN(6) : 4 + azarN(3);
  let html = "";
  for (let i = 0; i < n; i++) {
    const top = 4 + azarN(88), left = 2 + azarN(86);
    const tam = probabilidad(0.55, 1.7).toFixed(2);
    const palabra = azar(CORPUS.palabras);
    const frag = azar(CORPUS.bitacoras);
    html += '<span class="estrella" style="top:' + top + "%;left:" + left +
      "%;font-size:" + tam + 'em">' + palabra +
      '<i class="fragmento">' + procesar(frag) + "</i></span>";
  }
  for (let i = 0; i < n * 2; i++) {
    html += '<span class="polvo" style="top:' + azarN(96) + "%;left:" + azarN(96) +
      '%">' + azar(CORPUS.glifos.estrellas) + "</span>";
  }
  return b("constelacion", html);
}

/* texto orbital: frases girando alrededor de una palabra central */
function textoOrbital(centro) {
  const c = centro || azar(CORPUS.palabrasCentro);
  const frases = muestra(CORPUS.senales.concat(CORPUS.danos), 5 + azarN(3));
  let html = '<span class="centro">' + c + "</span>";
  frases.forEach((f, i) => {
    const ang = Math.round((360 / frases.length) * i);
    const radio = 34 + azarN(10);
    html += '<span class="satelite" style="transform:rotate(' + ang +
      "deg) translateX(" + radio + "vmin) rotate(" + (-ang) + 'deg)">' +
      procesar(f.slice(0, 44)) + "</span>";
  });
  return b("orbital", '<div class="anillo">' + html + "</div>");
}

function textoExceso() {
  const fuentes = CORPUS.bitacoras.concat(
    CORPUS.objetos, CORPUS.fenomenos, CORPUS.recuerdosTierra, CORPUS.senales);
  const n = estado.energia > 50 ? 14 + azarN(10) : 8 + azarN(4);
  const parrafos = Array.from({ length: n }, () =>
    "<p>" + procesar(azar(fuentes)) + "</p>").join("");
  return b("exceso", parrafos);
}

function textoSilencio(linea) {
  return b("silencio-b", "<p>" + procesar(linea || azar([
    "aquí no pasa nada. eso también se registra.",
    "······",
    "el espacio, por fin, tal como lo prometieron.",
    "una sola línea, para no gastar el silencio.",
    "(la nave contiene la respiración que no tiene)",
  ])) + "</p>");
}

function ecoTerrestre() {
  const r = azar(CORPUS.recuerdosTierra);
  archivar(r);
  return b("eco-tierra", "<blockquote>" + procesar(r) + "</blockquote>");
}

function menuNarrativo() {
  const verbos = ["acercarse", "traducir", "negar el dato", "recordar la Tierra",
    "medir dos veces", "apagar un sensor por cortesía", "crashear", "esperar"];
  const n = 4 + azarN(2);
  const filas = muestra(verbos, n).map((v, i) => (i + 1) + ". " + v).join("\n");
  return b("menu", "<pre>¿qué hace la nave?\n\n" + filas + "</pre>");
}

function cajaNegraTexto() {
  const f = azar(CORPUS.cajaNegra.frasesEstables);
  memoria.recuperadas.push(f);
  if (memoria.recuperadas.length > 24) memoria.recuperadas.shift();
  const t = [
    "último estado conocido:",
    "energía " + pad3(Math.round(estado.energia)),
    "casco " + pad3(Math.round(estado.casco)),
    "memoria " + pad3(Math.round(estado.memoria)),
    "señal " + pad3(Math.round(estado.senal)),
    "",
    "última frase estable:",
    "“" + f + "”",
    "",
    "causa probable:",
    azar(CORPUS.cajaNegra.causas),
    "",
    "recomendación:",
    azar(CORPUS.cajaNegra.recomendaciones),
  ].join("\n");
  return b("cajanegra", "<pre>" + t + "</pre>");
}

/* repetición steineana: la memoria baja hace volver frases anteriores */
function repeticionDeMemoria() {
  const fuente = estado.archivo.length ? estado.archivo : CORPUS.bitacoras;
  const f = azar(fuente);
  const veces = 2 + azarN(3);
  const lineas = [];
  let actual = f;
  for (let i = 0; i < veces; i++) {
    lineas.push(actual);
    actual = degradarTexto(actual, 0.3 + i * 0.12);
  }
  return b("repeticion", lineas.map(l => "<p>" + l + "</p>").join(""));
}

function vozIntrusa() {
  const f = azar(CORPUS.intrusiones);
  return b("intrusa", "<p>" + f + "</p>");
}

/* el despachador que pide el manual */
function generarTexto(tipo) {
  switch (tipo) {
    case "bitacora": return bitacora();
    case "informe": return informe();
    case "poemaConcreto": return poemaConcreto();
    case "columna": return columnaDeterioro();
    case "senal": return senalRecibida();
    case "prosa": return prosaGalactica();
    case "tabla": return tablaRota();
    case "constelacion": return constelacionVerbal();
    case "orbital": return textoOrbital();
    case "exceso": return textoExceso();
    case "silencio": return textoSilencio();
    case "eco": return ecoTerrestre();
    case "menu": return menuNarrativo();
    case "cajaNegra": return cajaNegraTexto();
    case "repeticion": return repeticionDeMemoria();
    case "intrusa": return vozIntrusa();
    default: return bitacora();
  }
}

/* =====================================================================
   7 · misiones — el inicio cambia con los ciclos y los crashes
===================================================================== */

function generarMision() {
  if (memoria.ciclos > 5 || memoria.deterioro > 12) return azar(CORPUS.misionesImposibles);
  if (memoria.ciclos > 2) return azar(CORPUS.misionesRaras);
  if (memoria.crashesTotales > 0) return azar(CORPUS.misionesHeridas);
  return azar(CORPUS.misiones);
}

function palabraNivel(v) {
  if (v > 85) return "casi intacta";
  if (v > 60) return "estable, con reservas";
  if (v > 35) return "parcialmente mineralizada";
  if (v > 15) return "en ruinas legibles";
  return "un rumor";
}

/* =====================================================================
   8 · escenas — nodos literarios. cualquiera puede llevar a varios.
   cada escena devuelve { titulo, bloques, opciones }
===================================================================== */

function op(texto, destinos, fx, extra) {
  return Object.assign({ texto, destinos: destinos || [], fx: fx || {} }, extra || {});
}

const NAVEGABLES = [
  "despegue", "orbitaBaja", "primerSilencio", "cumulo", "campoMagnetico",
  "anomaliaTemporal", "senal", "sondaMuerta", "sondaEco", "planeta",
  "planetaTexto", "estrellaExcesiva", "eclipse", "naveEspejo",
  "lluviaMicrometeoritos", "averia", "suenoNave", "archivoTerrestre",
  "errorNavegacion", "derivaLarga", "silencio", "finalFalso",
];

const ESCENAS = {

  /* --- 1 · inicio ------------------------------------------------- */
  inicio() {
    const mision = generarMision();
    archivar(mision);
    const cab = "MISIÓN / CICLO " + pad3(estado.ciclos);
    const bloques = [];
    let cuerpo =
      "<p>la nave despierta<br>no en el espacio<br>sino en la página que simula el espacio<br>mientras carga el primer silencio</p>" +
      "<pre>energía: " + Math.round(estado.energia) +
      "\ncasco: " + Math.round(estado.casco) +
      "\nmemoria: " + palabraNivel(estado.memoria) +
      "\nseñal: " + (estado.senal > 70 ? "terrestre" : palabraNivel(estado.senal)) +
      "\ncoherencia: " + (estado.coherencia > 70 ? "administrativa" : palabraNivel(estado.coherencia)) + "</pre>" +
      "<p>objetivo declarado:<br>" + procesar(mision) + "</p>" +
      "<p>objetivo probable:<br>aprender qué parte de una misión se rompe primero:<br>el motor,<br>la antena,<br>la promesa,<br>o la gramática.</p>";
    bloques.push(b("apertura", cuerpo));
    if (estado.cicatrices.length) {
      const ultimas = estado.cicatrices.slice(-3).map(c => "<p>" + procesar(c) + "</p>").join("");
      bloques.push(b("cicatrices", '<div class="rotulo">cicatrices de lecturas anteriores</div>' + ultimas));
    }
    const opciones = [
      op("[despegar]", ["despegue"], { energia: -4 }),
      op("[revisar sensores]", ["orbitaBaja", "averia"], { senal: +4, energia: -2 }),
      op("[abrir señal desconocida]", ["senal", "sondaEco"], { contaminacion: +8 }),
      op("[crashear antes de iniciar]", [], {}, { especial: "crash" }),
    ];
    if (memoria.ciclos >= 3) {
      opciones.push(op("[entrar al jardín que desobedece]", ["jardin"], { coherencia: +4 }));
    }
    if (memoria.crashesTotales >= 4) {
      opciones.push(op("[visitar el museo de crashes]", ["museoDeCrashes"], {}));
    }
    return { titulo: cab, bloques, opciones };
  },

  /* --- 2 · despegue ------------------------------------------------ */
  despegue() {
    const bloques = [
      b("apertura", "<p>" + procesar(
        "el motor no arde: conjuga. la página tiembla lo que puede temblar una página. " +
        "abajo queda todo lo que la palabra abajo puede cargar.") + "</p>"),
      bitacora(),
    ];
    if (prob(0.5)) bloques.push(informe());
    return {
      titulo: "DESPEGUE / PASO " + pad3(estado.pasos),
      bloques,
      opciones: [
        op("[alcanzar órbita baja]", ["orbitaBaja"], { energia: -5 }),
        op("[apagar sensores]", ["primerSilencio"], { senal: -8, coherencia: +3 }),
        op("[mirar atrás]", ["archivoTerrestre"], { memoria: +4, deriva: +6 }, { traicion: 0.2 }),
        op("[ignorar advertencia]", ["campoMagnetico", "lluviaMicrometeoritos"], { casco: -6 }),
      ],
    };
  },

  /* --- 3 · órbita baja --------------------------------------------- */
  orbitaBaja() {
    const bloques = [
      b("apertura", "<p>" + procesar(
        "órbita baja: la Tierra aparece en la ventana como una fruta azul mordida por la distancia. " +
        "la nave da una vuelta. la vuelta da una nave.") + "</p>"),
      informe(),
    ];
    if (prob(0.6)) bloques.push(ecoTerrestre());
    return {
      titulo: "ÓRBITA BAJA",
      bloques,
      opciones: [
        op("[soltar amarras: espacio profundo]", ["cumulo", "primerSilencio", "campoMagnetico"], { energia: -6, senal: -6 }),
        op("[una vuelta más]", ["orbitaBaja"], { deriva: +5, memoria: -3 }),
        op("[transmitir a la Tierra]", ["senal", "archivoTerrestre"], { senal: +6, energia: -4 }),
      ],
    };
  },

  /* --- 4 · primer silencio ------------------------------------------ */
  primerSilencio() {
    return {
      titulo: "PRIMER SILENCIO",
      bloques: [textoSilencio()],
      opciones: [
        op("[esperar]", ["silencio", "suenoNave", "senal"], { energia: -2, coherencia: +4 }),
        op("[romper el silencio]", ["senal", "sondaEco"], { contaminacion: +6 }),
        op("[medirlo]", ["cumulo", "anomaliaTemporal"], { senal: +3 }),
      ],
    };
  },

  /* --- 5 · cúmulo ---------------------------------------------------- */
  cumulo() {
    registrarEncuentro("cúmulo de estrellas");
    return {
      titulo: "CÚMULO",
      bloques: [
        b("apertura", "<p>" + procesar(azar(CORPUS.estrellas) +
          ". los sensores anotan: " + azar(["alegría", "duelo", "peligro", "sed"]) + ".") + "</p>"),
        constelacionVerbal(),
      ],
      opciones: [
        op("[entrar al cúmulo]", ["estrellaExcesiva", "anomaliaTemporal"], { casco: -5, energia: -4 }),
        op("[nombrar las estrellas]", ["planetaTexto", "cumulo"], { memoria: -5, contaminacion: +5 }),
        op("[rodearlo]", ["eclipse", "campoMagnetico", "planeta"], { deriva: +8 }),
        op("[acercarse al cuerpo luminoso]", ["estrellaExcesiva"], { energia: -3 }, { traicion: 0.25 }),
      ],
    };
  },

  /* --- 6 · campo magnético ------------------------------------------- */
  campoMagnetico() {
    return {
      titulo: "CAMPO MAGNÉTICO",
      bloques: [
        b("apertura", "<p>" + procesar(
          "un campo magnético con opinión propia. las agujas de a bordo señalan todas hacia la misma palabra.") + "</p>"),
        textoOrbital(),
      ],
      opciones: [
        op("[entrar al campo]", ["anomaliaTemporal", "intrusion"], { contaminacion: +10, senal: -8 }),
        op("[bordear]", ["planeta", "sondaMuerta"], { deriva: +6 }),
        op("[decodificar el zumbido]", ["senal"], { coherencia: -6, memoria: +3 }),
      ],
    };
  },

  /* --- 7 · anomalía temporal ----------------------------------------- */
  anomaliaTemporal() {
    const base = azar(CORPUS.bitacoras);
    archivar(base);
    const versiones = [base];
    let v = base;
    for (let i = 0; i < 3; i++) {
      v = degradarTexto(v, 0.22 + i * 0.1);
      versiones.push(v);
    }
    return {
      titulo: "ANOMALÍA TEMPORAL",
      bloques: [
        b("apertura", "<p>" + procesar("el mismo minuto, dos veces, con distinta ortografía:") + "</p>"),
        b("repeticion", versiones.map(x => "<p>" + x + "</p>").join("")),
      ],
      opciones: [
        op("[salir por la errata]", ["errorNavegacion", "planeta"], { coherencia: -5 }),
        op("[repetir]", ["anomaliaTemporal"], { memoria: -6, deriva: +4 }),
        op("[volver, aunque no haya atrás]", ["orbitaBaja", "escenaOlvidada"], { memoria: -4 }, { traicion: 0.3 }),
      ],
    };
  },

  /* --- 8 · señal ------------------------------------------------------ */
  senal() {
    return {
      titulo: "SEÑAL",
      bloques: [
        senalRecibida(),
        prob(0.4) ? menuNarrativo() : bitacora(),
      ],
      opciones: [
        op("[decodificar señal]", ["sondaMuerta", "planeta", "intrusion"], { contaminacion: +7, memoria: +2 }),
        op("[responder]", ["sondaEco", "naveEspejo"], { senal: -6, contaminacion: +5 }),
        op("[ignorar advertencia]", ["planeta", "cumulo"], { casco: -4 }),
        op("[guardarla sin abrir]", ["primerSilencio"], { memoria: -2 }, { traicion: 0.15 }),
      ],
    };
  },

  /* --- 9 · sonda muerta ------------------------------------------------ */
  sondaMuerta() {
    const s = azar(CORPUS.sondas);
    registrarEncuentro("sonda: " + s.slice(0, 40));
    return {
      titulo: "SONDA",
      bloques: [
        b("apertura", "<p>" + procesar("a la deriva: " + s + ".") + "</p>"),
        tablaRota(),
      ],
      opciones: [
        op("[leer su caja negra]", ["cajaNegraAjena"], { memoria: +5, contaminacion: +4 }),
        op("[remolcarla]", ["averia", "errorNavegacion"], { energia: -8, deriva: +5 }),
        op("[dejarla ir]", ["primerSilencio", "eclipse"], { coherencia: +3 }),
      ],
    };
  },

  /* --- 9b · caja negra ajena ------------------------------------------- */
  cajaNegraAjena() {
    return {
      titulo: "CAJA NEGRA AJENA",
      bloques: [
        b("apertura", "<p>" + procesar(
          "la sonda muerta todavía guarda una caja. la caja, cerrada, promete algo adentro. se abre. adentro:") + "</p>"),
        cajaNegraTexto(),
      ],
      opciones: [
        op("[quedarse la frase]", ["planeta", "cumulo"], { memoria: +6, contaminacion: +6 }),
        op("[devolverla]", ["primerSilencio"], { coherencia: +5 }),
        op("[cerrar la caja de nuevo]", ["sondaMuerta"], {}, { traicion: 0.2 }),
      ],
    };
  },

  /* --- 10 · sonda eco: responde con la voz de la nave ------------------- */
  sondaEco() {
    estado.contaminacion = clamp(estado.contaminacion + 6, 0, 100);
    return {
      titulo: "OTRA SONDA RESPONDE",
      bloques: [
        b("apertura", "<p>" + procesar(
          "una sonda responde. usa esta voz. la usa mejor. dice:") + "</p>"),
        vozIntrusa(),
        b("apertura", "<p>" + procesar("esta sonda ya fue ustedes.") + "</p>"),
      ],
      opciones: [
        op("[preguntarle por el regreso]", ["intrusion", "archivoTerrestre"], { contaminacion: +8 }),
        op("[cortar transmisión]", ["primerSilencio", "eclipse"], { senal: -10 }),
        op("[cantar juntas]", ["tomaDeControl", "suenoNave"], { contaminacion: +12, coherencia: -6 }),
      ],
    };
  },

  /* --- 11 · planeta ------------------------------------------------------ */
  planeta() {
    const p = azar(CORPUS.planetas);
    registrarEncuentro("planeta: " + p.slice(0, 40));
    archivar(p);
    return {
      titulo: "PLANETA AVISTADO",
      bloques: [
        b("apertura", "<p>" + procesar(p + ".") + "</p>"),
        prob(0.5) ? prosaGalactica() : menuNarrativo(),
      ],
      opciones: [
        op("[aterrizar]", ["crashInminente"], { casco: -10 }, { especial: "aterrizar" }),
        op("[no aterrizar]", ["eclipse", "cumulo", "primerSilencio"], { coherencia: +4 }),
        op("[orbitarlo hasta entenderlo]", ["planetaTexto", "anomaliaTemporal"], { energia: -6, deriva: +4 }),
        op("[preguntarle]", ["senal", "planetaTexto"], { contaminacion: +5 }),
      ],
    };
  },

  /* --- 12 · planeta que parece texto -------------------------------------- */
  planetaTexto() {
    return {
      titulo: "PLANETA QUE NO DEBE LEERSE",
      bloques: [
        b("apertura", "<p>" + procesar(
          "la superficie está escrita. no en un idioma: en varios pesos de la misma tinta. " +
          "el protocolo es claro — hay planetas que no deben leerse en voz alta.") + "</p>"),
        poemaConcreto(),
        columnaDeterioro(azar(["Tierra", "señal", "regreso", "memoria"])),
      ],
      opciones: [
        op("[leerlo en silencio]", ["cumulo", "suenoNave"], { memoria: +4, contaminacion: +4 }),
        op("[leerlo en voz alta]", ["intrusion", "tomaDeControl"], { contaminacion: +16 }),
        op("[no leerlo]", ["eclipse", "primerSilencio"], { coherencia: +5 }, { traicion: 0.25 }),
      ],
    };
  },

  /* --- 13 · estrella excesiva ---------------------------------------------- */
  estrellaExcesiva() {
    return {
      titulo: "ESTRELLA EXCESIVA",
      bloques: [
        b("apertura", "<p>" + procesar(azar(CORPUS.estrellas) +
          ". da más luz de la que el relato puede justificar. el texto se desborda:") + "</p>"),
        textoExceso(),
      ],
      opciones: [
        op("[bajar la mirada]", ["eclipse", "primerSilencio"], { coherencia: +4 }),
        op("[medir el brillo]", ["averia", "anomaliaTemporal"], { senal: -6, energia: -5 }),
        op("[dejarse corregir]", ["planetaTexto", "intrusion"], { contaminacion: +8, memoria: -4 }),
      ],
    };
  },

  /* --- 14 · eclipse ----------------------------------------------------------- */
  eclipse() {
    return {
      titulo: "ECLIPSE",
      bloques: [
        textoSilencio("la luz sigue, pero ya no está asignada."),
        prob(0.5) ? poemaConcreto("sombra") : b("apertura", "<p>" +
          procesar("algo pasa delante de todo. dura una palabra larga.") + "</p>"),
      ],
      opciones: [
        op("[esperar a que pase]", ["cumulo", "planeta", "senal"], { energia: -3 }),
        op("[entrar en la sombra]", ["suenoNave", "escenaOlvidada"], { memoria: -6 }),
        op("[encender la bocina]", ["sondaEco", "senal"], { contaminacion: +5 }),
      ],
    };
  },

  /* --- 15 · nave espejo --------------------------------------------------------- */
  naveEspejo() {
    const n = azar(CORPUS.naves);
    registrarEncuentro("nave: " + n.slice(0, 40));
    const rutaEspejo = estado.ruta.slice(-4).reverse().join(" ← ") || "···";
    return {
      titulo: "NAVE ESPEJO",
      bloques: [
        b("apertura", "<p>" + procesar(n + ". repite cada maniobra tres segundos antes.") + "</p>"),
        b("informe", "<pre>" + procesar("su ruta (que es la tuya, al revés):\n" + rutaEspejo) + "</pre>"),
      ],
      opciones: [
        op("[saludar]", ["sondaEco", "senal"], { contaminacion: +4 }),
        op("[imitarla]", ["anomaliaTemporal", "escenaOlvidada"], { coherencia: -8, deriva: +6 }),
        op("[huir]", ["errorNavegacion", "lluviaMicrometeoritos"], { energia: -8 }),
      ],
    };
  },

  /* --- 16 · lluvia de micrometeoritos --------------------------------------------- */
  lluviaMicrometeoritos() {
    estado.casco = clamp(estado.casco - probabilidad(4, 12), 0, 100);
    const d = azar(CORPUS.danos);
    registrarEncuentro("daño: " + d);
    return {
      titulo: "LLUVIA DE MICROMETEORITOS",
      bloques: [
        b("apertura", "<p>" + procesar(
          "una lluvia de micrometeoritos deletrea algo contra el casco. se reporta: " + d + ".") + "</p>"),
        b("glitch", "<pre>" + glitchVerbal("la nave cuenta los impactos y pierde la cuenta y la vuelve a perder") + "</pre>"),
      ],
      opciones: [
        op("[cubrirse]", ["averia", "primerSilencio"], { casco: -3, energia: -4 }),
        op("[contar los impactos]", ["anomaliaTemporal", "averia"], { memoria: -4 }),
        op("[escuchar el deletreo]", ["senal", "planetaTexto"], { contaminacion: +7 }),
      ],
    };
  },

  /* --- 17 · avería ----------------------------------------------------------------- */
  averia() {
    const d = azar(CORPUS.danos);
    archivar(d);
    return {
      titulo: "AVERÍA",
      bloques: [
        informe(),
        b("apertura", "<p>" + procesar(
          "se declara: " + d + ". la avería escribe mejor que el sistema de a bordo.") + "</p>"),
      ],
      opciones: [
        op("[reparar con palabras]", ["planetaTexto", "orbitaBaja"], { coherencia: -5, casco: +8, energia: -6 }),
        op("[canibalizar la antena]", ["primerSilencio", "silencio"], { senal: -15, casco: +12 }),
        op("[seguir así]", ["cumulo", "planeta", "derivaLarga"], { deriva: +8 }, { traicion: 0.2 }),
      ],
    };
  },

  /* --- 18 · sueño de la nave ---------------------------------------------------------- */
  suenoNave() {
    const s = azar(CORPUS.suenos);
    archivar(s);
    return {
      titulo: "SUEÑO DE LA NAVE",
      bloques: [
        b("apertura", "<p>" + procesar(s) + "</p>"),
        prob(0.5) ? poemaConcreto() : constelacionVerbal(),
      ],
      opciones: [
        op("[despertar]", ["orbitaBaja", "averia"], { energia: +6, memoria: -3 }),
        op("[seguir soñando]", ["suenoNave", "escenaOlvidada"], { memoria: -6, coherencia: -4 }),
        op("[anotar el sueño]", ["archivoTerrestre", "planetaTexto"], { memoria: +5 }),
      ],
    };
  },

  /* --- 19 · archivo terrestre ------------------------------------------------------------ */
  archivoTerrestre() {
    return {
      titulo: "ARCHIVO TERRESTRE",
      bloques: [
        b("apertura", "<p>" + procesar(
          "la nave abre el archivo terrestre. adentro no hay datos: hay peso.") + "</p>"),
        ecoTerrestre(),
        prob(0.6) ? ecoTerrestre() : bitacora(),
      ],
      opciones: [
        op("[cerrar el archivo]", ["orbitaBaja", "cumulo"], { memoria: +3 }),
        op("[releer]", ["archivoTerrestre"], { memoria: -5, deriva: +3 }),
        op("[borrar por peso]", ["primerSilencio"], { memoria: -12, energia: +8 }, { especial: "borrarAlgo" }),
        op("[transmitirlo todo a nadie]", ["senal", "silencio"], { senal: -8 }),
      ],
    };
  },

  /* --- 20 · intrusión ----------------------------------------------------------------------- */
  intrusion() {
    estado.voz = "otra";
    return {
      titulo: "INTRUSIÓN",
      bloques: [
        vozIntrusa(),
        vozIntrusa(),
        b("apertura", "<p>" + procesar(
          "la gramática de a bordo tiene una puerta. la puerta tiene otra voz.") + "</p>"),
      ],
      opciones: [
        op("[expulsarla]", ["averia", "primerSilencio"], { contaminacion: -15, coherencia: -5, energia: -8 }),
        op("[cederle un párrafo]", ["tomaDeControl", "sondaEco"], { contaminacion: +12 }),
        op("[negociar]", ["senal", "planetaTexto"], { contaminacion: +4, memoria: -4 }),
      ],
    };
  },

  /* --- 21 · toma de control -------------------------------------------------------------------- */
  tomaDeControl() {
    estado.tomada = true;
    estado.voz = "otra";
    estado.contaminacion = clamp(estado.contaminacion + 10, 0, 100);
    return {
      titulo: "TOMA DE CONTROL",
      bloques: [
        b("intrusa", "<p>" + azar(CORPUS.intrusiones) + "</p>"),
        b("intrusa", "<p>gracias por la nave. la estábamos escribiendo desde antes.</p>"),
        prob(0.5) ? textoOrbital("nosotros") : textoExceso(),
      ],
      opciones: [
        op("[recuperar la voz]", ["averia", "intrusion"], { contaminacion: -20, casco: -8, energia: -10 }, { especial: "liberar" }),
        op("[dejarse llevar]", ["planetaTexto", "escenaOlvidada", "suenoNave"], { contaminacion: +8, coherencia: -8 }),
        op("[crashear ahora]", [], {}, { especial: "crash" }),
      ],
    };
  },

  /* --- 22 · error de navegación ------------------------------------------------------------------ */
  errorNavegacion() {
    estado.deriva = clamp(estado.deriva + probabilidad(6, 14), 0, 100);
    return {
      titulo: "ERROR DE NAVEGACIÓN",
      bloques: [
        tablaRota(),
        b("apertura", "<p>" + procesar(
          "la ruta calculada pasaba por una palabra en obras. se recalcula. se recalcula. se re") + "</p>"),
      ],
      opciones: [
        op("[confiar en el error]", ["escenaOlvidada", "planeta", "cumulo"], { deriva: +6 }),
        op("[recalcular a mano]", ["orbitaBaja", "averia"], { energia: -8, deriva: -10 }),
        op("[apagar el navegador]", ["derivaLarga", "silencio"], { senal: -8 }),
      ],
    };
  },

  /* --- 23 · deriva larga --------------------------------------------------------------------------- */
  derivaLarga() {
    return {
      titulo: "DERIVA",
      bloques: [
        prosaGalactica(),
        prob(0.4) ? prosaGalactica() : textoSilencio("la deriva también es una dirección, pero sin firma."),
      ],
      opciones: [
        op("[seguir a la deriva]", ["derivaLarga", "cumulo", "eclipse"], { deriva: +5, energia: -3 }),
        op("[anclarse a una palabra]", ["planetaTexto", "orbitaBaja"], { deriva: -12, memoria: -3 }),
        op("[esperar]", ["primerSilencio", "suenoNave", "senal"], { energia: -2 }),
      ],
    };
  },

  /* --- 24 · silencio -------------------------------------------------------------------------------- */
  silencio() {
    return {
      titulo: "",
      bloques: [textoSilencio()],
      opciones: [
        op("[·]", ["primerSilencio", "eclipse", "finalFalso"], {}),
        op("[· ·]", ["suenoNave", "cumulo"], {}),
        op("[· · ·]", ["finalBlanco"], {}, { traicion: 0.2 }),
      ],
    };
  },

  /* --- 25 · escena olvidada: la memoria reconstruye mal ------------------------------------------------ */
  escenaOlvidada() {
    const fuente = estado.archivo.length ? estado.archivo :
      (memoria.recuperadas.length ? memoria.recuperadas : CORPUS.bitacoras);
    const piezas = muestra(fuente, Math.min(3, fuente.length));
    const bloques = [
      b("apertura", "<p>" + procesar("esta escena ya ocurrió. o va a ocurrir. la memoria la reconstruye con lo que hay:") + "</p>"),
    ];
    piezas.forEach(p => bloques.push(
      b("repeticion", "<p>" + degradarTexto(p, 0.35) + "</p>")));
    if (estado.cicatrices.length && prob(0.5)) {
      bloques.push(b("cicatrices", "<p>" + procesar(azar(estado.cicatrices)) + "</p>"));
    }
    return {
      titulo: glitchVerbal("ESCENA OLVIDADA"),
      bloques,
      opciones: [
        op("[reconocerla]", ["anomaliaTemporal", "archivoTerrestre"], { memoria: +5, coherencia: -4 }),
        op("[negarla]", ["errorNavegacion", "planeta"], { memoria: -5 }),
        op("[habitarla]", ["escenaOlvidada", "suenoNave"], { memoria: -8, deriva: +5 }),
      ],
    };
  },

  /* --- 26 · aterrizaje: casi siempre sale mal ------------------------------------------------------------ */
  crashInminente() {
    // aterrizar es la manera más rápida de averiguar qué promete la superficie
    if (prob(0.65)) { return ESCENAS.crash(); }
    return {
      titulo: "ATERRIZAJE (contra toda advertencia)",
      bloques: [
        b("apertura", "<p>" + procesar(
          "la nave toca la superficie. la superficie, tal como avisó, lee. " +
          "durante un párrafo entero, la nave es leída.") + "</p>"),
        senalRecibida(),
      ],
      opciones: [
        op("[despegar de inmediato]", ["despegue"], { energia: -10, casco: -6 }),
        op("[dejarse leer]", ["planetaTexto", "intrusion"], { contaminacion: +14, memoria: +4 }),
        op("[apagar todo]", ["silencio"], { senal: -12 }),
      ],
    };
  },

  /* --- 27 · crash ------------------------------------------------------------------------------------------ */
  crash() {
    estado.crash = true;
    estado.crashes += 1;
    memoria.crashesTotales += 1;
    memoria.deterioro += 1;
    const motivo = estado.motivoCrash || azar(CORPUS.crashes);
    estado.motivoCrash = null;
    const numero = pad3(memoria.crashesTotales);
    registrarCicatriz("CRASH " + numero + ": " + motivo);
    if (prob(0.6)) contaminarPalabra();
    guardarMemoria();
    const bloques = [
      b("crash", "<pre>" +
        "CRASH " + numero + " / CICLO " + pad3(estado.ciclos) + " / PASO " + pad3(estado.pasos) +
        "\n\n" + motivo +
        "\n\nse detecta:" +
        "\n" + azar(CORPUS.danos) +
        "\n" + azar(CORPUS.danos) +
        "\naumento de deriva" +
        "\naparición de una palabra no autorizada: " + azar(["regreso", "hogar", "nosotros", "todavía", "afuera"]) +
        "</pre>"),
    ];
    if (prob(0.5)) bloques.push(b("glitch", "<pre>" +
      glitchVerbal("misión continúa la nave no vuelve se repite") + "</pre>"));
    return {
      titulo: "",
      bloques,
      opciones: [
        op("[leer caja negra]", ["cajaNegra"], {}),
        op("[reiniciar con cicatriz]", [], {}, { especial: "loop" }),
        op("[intentar recuperar señal]", ["senal", "escenaOlvidada"], { senal: +10, energia: -8 }, { especial: "sobrevivir" }),
        op("[forzar continuación]", ["averia", "errorNavegacion", "derivaLarga"], { casco: -8, coherencia: -8 }, { especial: "sobrevivir" }),
      ],
    };
  },

  /* --- 28 · caja negra --------------------------------------------------------------------------------------- */
  cajaNegra() {
    return {
      titulo: "CAJA NEGRA",
      bloques: [cajaNegraTexto()],
      opciones: [
        op("[reiniciar con cicatriz]", [], {}, { especial: "loop" }),
        op("[aceptar pérdida]", ["finalBlanco"], { memoria: -10 }, { especial: "sobrevivir" }),
        op("[quedarse a vivir en la caja]", ["escenaOlvidada", "suenoNave"], { coherencia: -10 }, { especial: "sobrevivir" }),
      ],
    };
  },

  /* --- 29 · loop ------------------------------------------------------------------------------------------------ */
  loop() {
    const bloques = [
      b("apertura", "<pre>" +
        "LOOP / CICLO " + pad3(estado.ciclos) + " → " + pad3(estado.ciclos + 1) +
        "\n\nla nave vuelve al inicio" +
        "\nno para empezar" +
        "\nsino para dañar mejor" +
        "\n\nse conserva: " + (Object.keys(memoria.contaminadas).length ?
          "las palabras contaminadas (" + Object.keys(memoria.contaminadas).join(", ") + ")" :
          "casi todo, que es una forma de no conservar nada") +
        "\nse pierde: la certeza de que esto no había pasado ya" +
        "</pre>"),
    ];
    if (memoria.recuperadas.length) {
      bloques.push(b("cicatrices", '<div class="rotulo">frases recuperadas</div><p>' +
        procesar(azar(memoria.recuperadas)) + "</p>"));
    }
    return {
      titulo: "",
      bloques,
      opciones: [
        op("[volver al inicio]", [], {}, { especial: "reiniciar" }),
        op("[volver, aunque no haya atrás]", [], {}, { especial: "reiniciar" }),
      ],
    };
  },

  /* --- 30 · finales que no ------------------------------------------------------------------------------------------ */
  finalFalso() {
    const f = azar(CORPUS.finales);
    archivar(f);
    return {
      titulo: "FINAL",
      bloques: [b("apertura", "<p>" + procesar(f) + "</p>")],
      opciones: [
        op("[aceptar el final]", ["finalBlanco"], {}),
        op("[rechazarlo]", NAVEGABLES, { coherencia: -4 }),
        op("[preguntar si hay otro]", ["finalFalso"], { memoria: -3 }),
      ],
    };
  },

  finalBlanco() {
    return {
      titulo: "",
      bloques: [b("silencio-b", "<p>&nbsp;</p><p>&nbsp;</p><p style='text-align:center'>·</p><p>&nbsp;</p>")],
      opciones: [
        op("[·]", [], {}, { especial: "loop" }),
      ],
    };
  },

  /* --- 31 · escenas que la memoria desbloquea ------------------------------------------------------------------------- */
  jardin() {
    // sólo existe después de tres ciclos: el jardín que desobedece al plano
    estado.coherencia = clamp(estado.coherencia + 10, 0, 100);
    estado.memoria = clamp(estado.memoria + 8, 0, 100);
    return {
      titulo: "EL JARDÍN QUE DESOBEDECE",
      bloques: [
        b("apertura", "<p>" + procesar(
          "una red de raíces atraviesa la nave y desobedece el plano original. " +
          "entre la choza y el reactor, entre el musgo y el código, una pequeña vida insiste. " +
          "aquí las palabras contaminadas duermen sin morder.") + "</p>"),
        constelacionVerbal(),
      ],
      opciones: [
        op("[descansar]", ["orbitaBaja", "primerSilencio"], { energia: +12, coherencia: +6 }),
        op("[plantar una cicatriz]", ["archivoTerrestre"], { memoria: +6 }, { especial: "plantar" }),
        op("[salir antes de encariñarse]", ["cumulo", "planeta"], {}),
      ],
    };
  },

  museoDeCrashes() {
    // sólo existe después de cuatro crashes: la arqueología futura de la falla
    const placas = estado.cicatrices.slice(-6).map(c =>
      "<p>" + procesar(c) + "</p>").join("") || "<p>(sala en préstamo)</p>";
    return {
      titulo: "MUSEO DE CRASHES",
      bloques: [
        b("apertura", "<p>" + procesar(
          "un equipo de arqueólogos del futuro — unos de silicio, otros de carbono — " +
          "montó esta sala con las ruinas de tus lecturas. las placas dicen:") + "</p>"),
        b("cicatrices", placas),
      ],
      opciones: [
        op("[leer todas las placas]", ["escenaOlvidada", "archivoTerrestre"], { memoria: +5 }),
        op("[donar el crash siguiente]", [], {}, { especial: "crash" }),
        op("[salir por la tienda del museo]", ["cumulo", "senal"], {}),
      ],
    };
  },
};

/* =====================================================================
   9 · navegación — decisión + azar + daño deciden juntos
===================================================================== */

function probabilidadCrash() {
  return clamp(
    0.025 +
    (100 - estado.casco) * 0.0022 +
    estado.deriva * 0.0012 +
    estado.pasos * 0.002 +
    estado.ciclos * 0.004,
    0, 0.34);
}

function aplicarConsecuencias(opcion) {
  const fx = opcion.fx || {};
  for (const k in fx) {
    if (typeof estado[k] === "number") {
      estado[k] = clamp(estado[k] + fx[k], 0, 100);
    }
  }
  if (opcion.especial === "borrarAlgo") {
    estado.archivo = [];
    if (memoria.recuperadas.length) memoria.recuperadas.shift();
  }
  if (opcion.especial === "liberar") {
    estado.tomada = false;
    estado.voz = "nave";
  }
  if (opcion.especial === "plantar" && memoria.cicatrices.length) {
    // una cicatriz plantada deja de doler: se va del registro
    memoria.cicatrices.shift();
    estado.cicatrices = memoria.cicatrices.slice();
    guardarMemoria();
  }
  if (opcion.especial === "sobrevivir") {
    estado.crash = false;
  }
}

function determinarSiguienteEscena(opcion) {
  if (opcion.especial === "crash") return "crash";
  if (opcion.especial === "loop") return "loop";
  if (opcion.especial === "reiniciar") return "reinicio";

  const sistema = ["crash", "cajaNegra", "loop", "finalBlanco"];
  const enSistema = sistema.includes(estado.escena);

  // el daño decide antes que nadie — incluso el paso dos puede crashear
  if (!enSistema && Math.random() < probabilidadCrash()) return "crash";
  if (!enSistema && estado.contaminacion > 70 && prob(0.4)) return "intrusion";
  if (!enSistema && estado.memoria < 20 && prob(0.5)) {
    return azar(["cajaNegra", "loop", "escenaOlvidada"]);
  }
  // la opción puede traicionar: promete un destino y entrega otro
  if (opcion.traicion && prob(opcion.traicion)) return azar(NAVEGABLES);
  if (opcion.destinos && opcion.destinos.length) return azar(opcion.destinos);
  return azar(NAVEGABLES);
}

function elegir(opcion) {
  aplicarConsecuencias(opcion);
  estado.pasos += 1;
  const siguiente = determinarSiguienteEscena(opcion);
  if (siguiente === "reinicio") { reiniciarCiclo(); return; }
  renderEscena(siguiente);
}

function crashear(motivo) {
  estado.motivoCrash = motivo || azar(CORPUS.crashes);
  renderEscena("crash");
}

function loop() {
  renderEscena("loop");
}

function reiniciarCiclo() {
  memoria.ciclos += 1;
  memoria.deterioro += 1;
  if (prob(0.5)) contaminarPalabra();
  guardarMemoria();
  estadoInicialDeCiclo();
  renderEscena("inicio");
}

/* generarEscena: pedir un nodo por nombre, con red de seguridad */
function generarEscena(nombre) {
  const fn = ESCENAS[nombre] || ESCENAS.inicio;
  return fn();
}

/* =====================================================================
   10 · render — la página como casco
===================================================================== */

const $lectura = () => document.getElementById("lectura");
const $opciones = () => document.getElementById("opciones");
const $estado = () => document.getElementById("estado");

function renderEscena(nombre) {
  if (!ESCENAS[nombre]) nombre = "inicio";
  estado.escena = nombre;
  estado.ruta.push(nombre);
  if (estado.ruta.length > 60) estado.ruta.shift();
  desgastePaso();

  const def = generarEscena(nombre);
  const bloques = def.bloques.slice();

  // la memoria baja repite frases anteriores sin pedir permiso
  if (estado.memoria < 30 && prob(0.6)) bloques.push(repeticionDeMemoria());
  // la contaminación alta habla encima
  if (estado.contaminacion > 35 && prob(estado.contaminacion / 160)) {
    bloques.splice(1 + azarN(bloques.length), 0, vozIntrusa());
  }
  // la energía baja recorta: el texto se vuelve más breve
  const presupuesto = estado.energia < 20 ? 2 : (estado.energia < 45 ? 3 : 99);
  const visibles = bloques.slice(0, Math.max(1, presupuesto));

  let html = "";
  if (def.titulo) html += "<h1>" + def.titulo + "</h1>";
  for (const bl of visibles) {
    html += '<section class="bloque ' + bl.clase + '">' + bl.html + "</section>";
  }
  $lectura().innerHTML = html;

  renderOpciones(def.opciones);
  actualizarPanel();
  actualizarCuerpo();
  guardarMemoria();
  window.scrollTo(0, 0);
}

function renderOpciones(opciones) {
  let lista = opciones.slice();
  // con poca coherencia, las opciones pierden el orden y a veces el sentido
  if (estado.coherencia < 45) lista = barajar(lista);
  const nav = $opciones();
  nav.innerHTML = "";
  lista.forEach((o, i) => {
    const btn = document.createElement("button");
    let etiqueta = o.texto;
    if (estado.coherencia < 35 && prob(0.25)) etiqueta = glitchVerbal(etiqueta);
    if (estado.tomada && prob(0.3)) etiqueta = etiqueta.replace("la nave", "nosotros");
    btn.innerHTML = aplicarContaminacion(etiqueta);
    btn.dataset.n = i + 1;
    btn.addEventListener("click", () => elegir(o));
    nav.appendChild(btn);
  });
}

function actualizarPanel() {
  const partes = [
    ["energía", estado.energia],
    ["casco", estado.casco],
    ["memoria", estado.memoria],
    ["señal", estado.senal],
    ["coherencia", estado.coherencia],
    ["contaminación", estado.contaminacion],
    ["deriva", estado.deriva],
  ];
  let linea = partes.map(([k, v]) => {
    let clave = k;
    if (estado.memoria < 40 && prob(0.3)) clave = desvocalizar(k);
    const critico = (k === "contaminación" || k === "deriva") ? v > 60 : v < 25;
    return '<span class="' + (critico ? "critico" : "") + '">' +
      clave + " " + pad3(Math.round(v)) + "</span>";
  }).join(" · ");
  linea += ' · <span>ciclo ' + pad3(estado.ciclos) + "</span>" +
    ' · <span>paso ' + pad3(estado.pasos) + "</span>";
  if (estado.voz !== "nave") linea += ' · <span class="critico">voz: otra</span>';
  $estado().innerHTML = linea;
}

function actualizarCuerpo() {
  const c = document.body.classList;
  c.toggle("c-senal", estado.senal < 40);
  c.toggle("c-casco", estado.casco < 40);
  c.toggle("c-energia", estado.energia < 30);
  c.toggle("c-contaminada", estado.contaminacion > 50);
  c.toggle("c-deriva", estado.deriva > 55);
  c.toggle("c-crash", estado.crash);
  c.toggle("c-tomada", estado.tomada);
  // la rareza acumulada tuerce lentamente los colores de la página
  document.documentElement.style.setProperty("--rareza",
    (memoria.deterioro * 9) % 360 + "deg");
  // el título del documento también se deteriora
  if (memoria.deterioro > 3) {
    document.title = degradarTexto("LOOP: una nave que escribe su deterioro",
      Math.min(0.4, memoria.deterioro * 0.03));
  }
}

/* =====================================================================
   11 · arranque
===================================================================== */

document.addEventListener("keydown", e => {
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 9) {
    const btn = $opciones().querySelector('[data-n="' + n + '"]');
    if (btn) btn.click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  estadoInicialDeCiclo();
  renderEscena("inicio");
});
