/*
  motor.js — LOOP: una nave que escribe su deterioro
  poesiasexp / canekzapata

  no un game engine: un MOTOR DE LECTURA.
  la nave viaja porque el texto cambia de régimen:
  bitácora → nota → señal → informe → poema concreto → crash →
  caja negra → loop → prosa larga → archivo → decisión → silencio.

  el texto es el sistema. un párrafo puede ser una escena.
  una palabra puede ser una puerta. una nota puede ser una trampa.
  un hipervínculo puede ser una avería. un crash puede ser un capítulo.

  arquitectura:
    semilla ▸ azar ▸ memoria ▸ estado ▸ contaminación ▸ degradación ▸
    hipertexto ▸ notas ▸ glosas ▸ formas de escritura ▸ escenas ▸
    navegación ▸ crash ▸ loop ▸ render ▸ caos ambiental
*/

/* =====================================================================
   0 · semilla — el azar está firmado: misma semilla, misma deriva
   (la memoria de localStorage y las decisiones del lector también
    conditionan la lectura: la semilla firma, no encadena)
===================================================================== */

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let SEMILLA = new URLSearchParams(location.search).get("seed");
if (!SEMILLA) {
  SEMILLA = Math.random().toString(36).slice(2, 8);
  try { history.replaceState(null, "", "?seed=" + SEMILLA); } catch (e) { /* file:// */ }
}

let rnd = Math.random; // se siembra en sembrar()

function sembrar() {
  rnd = mulberry32(xmur3(SEMILLA + ":" + memoria.ciclos + ":" + memoria.crashesTotales)());
}

function nuevaSemilla() {
  SEMILLA = Math.floor(Math.random() * 1e9).toString(36);
  try { history.replaceState(null, "", "?seed=" + SEMILLA); } catch (e) { }
  sembrar();
  estadoInicialDeCiclo();
  renderEscena("inicio");
}

/* =====================================================================
   1 · azar — narrativo (sembrado) y ambiental (libre)
===================================================================== */

function azar(lista) { return lista[Math.floor(rnd() * lista.length)]; }
function azarN(n) { return Math.floor(rnd() * n); }
function prob(p) { return rnd() < p; }
function probabilidad(min, max) { return min + rnd() * (max - min); }
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

/* el caos ambiental no gasta la semilla: respira por su cuenta */
function azarCaos(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
function azarCaosN(n) { return Math.floor(Math.random() * n); }
function probCaos(p) { return Math.random() < p; }

/* =====================================================================
   2 · memoria — lo que sobrevive al cierre de la pestaña
===================================================================== */

const CLAVE_MEMORIA = "loopnave.memoria";

function memoriaVacia() {
  return {
    v: 2,
    ciclos: 0,            // cuántas veces se volvió al inicio
    crashesTotales: 0,    // cuántas veces se rompió la lectura
    deterioro: 0,         // nivel acumulado de rareza
    cicatrices: [],       // frases que dejaron los crashes
    contaminadas: {},     // palabras secuestradas: {palabra: doble}
    recuperadas: [],      // frases rescatadas de cajas negras ajenas
    encuentros: [],       // qué se avistó en otros ciclos
    notasAbiertas: {},    // cuántas veces se abrió cada nota (las notas muerden)
    palabrasTocadas: 0,   // cuántas puertas tocó el lector
    bitacoraMision: [],   // lo que el sistema conserva para imprimir. o pierde.
  };
}

function cargarMemoria() {
  try {
    const cruda = localStorage.getItem(CLAVE_MEMORIA);
    if (!cruda) return memoriaVacia();
    return Object.assign(memoriaVacia(), JSON.parse(cruda));
  } catch (e) {
    // una memoria que no se puede leer también es una forma de memoria
    return memoriaVacia();
  }
}

function guardarMemoria() {
  try { localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(memoria)); }
  catch (e) { /* si no se puede recordar, se navega igual */ }
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
  // la memoria baja también agujerea la bitácora de misión
  if (estado.memoria < 30 && prob(0.15)) perderInformacion(1, "memoria baja");
}

function alterarEstado(cambios) {
  for (const k in cambios) {
    if (typeof estado[k] === "number") estado[k] = clamp(estado[k] + cambios[k], 0, 100);
  }
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

/* toda lectura deja huella: clics, notas, puertas */
function registrarLectura(evento) {
  if (evento === "puerta") memoria.palabrasTocadas += 1;
  guardarMemoria();
}

/* --------------------------------------------------------------------
   la bitácora de misión: lo que el sistema conserva para imprimir.
   se compone de lo que se ve — y de lo que se pierde: la pérdida
   también escribe.
-------------------------------------------------------------------- */

function registrarBitacora(tipo, texto) {
  if (!memoria.bitacoraMision) memoria.bitacoraMision = [];
  memoria.bitacoraMision.push({
    c: estado.ciclos, p: estado.pasos, t: tipo,
    x: String(texto).slice(0, 150),
  });
  if (memoria.bitacoraMision.length > 150) memoria.bitacoraMision.shift();
}

/* la información también se pierde: entradas dañadas o borradas para siempre */
function perderInformacion(n, motivo) {
  const b = memoria.bitacoraMision || [];
  if (!b.length) return;
  let perdidas = 0;
  for (let i = 0; i < n; i++) {
    const e = b[azarN(b.length)];
    if (!e || e.t === "pérdida") continue;
    if (prob(0.5)) {
      e.x = glitchVerbal(e.x);
      e.t = "dañada";
    } else {
      e.x = "[entrada perdida" + (motivo ? ": " + motivo : "") + "]";
      e.t = "pérdida";
    }
    perdidas++;
  }
  if (perdidas) {
    registrarBitacora("sistema", "se perdieron " + perdidas +
      " entradas de la bitácora" + (motivo ? " (" + motivo + ")" : ""));
  }
  guardarMemoria();
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
    VOCALES.includes(c.toLowerCase()) && Math.random() < 0.8 ? "_" : c).join("");
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
    const r = rnd();
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

/* la tubería completa: todo texto de la nave pasa por aquí.
   orden: degradar (texto plano) → cortar → puertas → contaminar */
function procesar(texto) {
  texto = degradarTexto(texto, intensidadDeterioro());
  texto = cortarSenal(texto);
  texto = hipertextualizar(texto);
  texto = aplicarContaminacion(texto);
  return texto;
}

/* como procesar, pero sin puertas: para textos que ya traen enlaces */
function procesarPlano(texto) {
  texto = degradarTexto(texto, intensidadDeterioro());
  texto = cortarSenal(texto);
  texto = aplicarContaminacion(texto);
  return texto;
}

function glitchVerbal(texto) {
  return texto.split(" ").map(w => desvocalizar(w)).join(" ");
}

/* =====================================================================
   6 · hipertexto — la palabra como puerta
   un enlace no es navegación: es tocar una palabra que altera la lectura
===================================================================== */

/* construir un enlace explícito: hiper("señal antigua", {acc:"escena", arg:"senal", fx:"senal:-6"}) */
function hiper(texto, spec) {
  return '<a class="hiper" data-acc="' + spec.acc + '"' +
    (spec.arg !== undefined ? ' data-arg="' + spec.arg + '"' : "") +
    (spec.fx ? ' data-fx="' + spec.fx + '"' : "") + ">" + texto + "</a>";
}

/* una puerta improvisada para una palabra encontrada en el texto */
function puertaAleatoria(palabra) {
  const r = rnd();
  let spec;
  if (r < 0.38) {
    spec = { acc: "nota", arg: String(azarN(CORPUS.notas.length)) };
  } else if (r < 0.52) {
    spec = { acc: "glosa" };
  } else if (r < 0.66) {
    const campo = azar(["energia", "senal", "memoria", "casco", "coherencia", "contaminacion"]);
    const delta = (campo === "contaminacion" ? 1 : -1) * (2 + azarN(7));
    spec = { acc: "fx", fx: campo + ":" + delta };
  } else if (r < 0.78) {
    spec = { acc: "insertar", arg: azar(["eco", "archivo", "manual", "senal", "poemaConcreto", "error404", "enciclopedia", "letania", "interrogatorio", "xeno"]) };
  } else if (r < 0.88) {
    spec = { acc: "escena", arg: azar(NAVEGABLES), fx: "deriva:3" };
  } else if (r < 0.96) {
    spec = { acc: "recordar" };
  } else {
    spec = { acc: "crash" };
  }
  return hiper(palabra, spec);
}

/* siembra puertas en un texto plano, esquivando etiquetas ya presentes */
function hipertextualizar(html) {
  let cupo = 1 + azarN(2);
  return html.split(/(<[^>]+>)/).map(seg => {
    if (seg.startsWith("<") || cupo <= 0) return seg;
    for (const p of muestra(CORPUS.palabrasPuerta, 6)) {
      if (cupo <= 0) break;
      const re = new RegExp("(^|[\\s(¿¡—])(" + p + ")([\\s.,;:)!?…]|$)", "i");
      const m = seg.match(re);
      if (m && prob(0.5)) {
        cupo--;
        seg = seg.replace(re, (todo, antes, pal, despues) =>
          antes + puertaAleatoria(pal) + despues);
      }
    }
    return seg;
  }).join("");
}

/* seguir un hipervínculo: tocar la palabra tiene consecuencias */
function seguirHipervinculo(a) {
  registrarLectura("puerta");
  registrarBitacora("puerta", a.textContent);
  sonarPuerta();
  if (a.dataset.fx) {
    const cambios = {};
    a.dataset.fx.split(",").forEach(par => {
      const [campo, delta] = par.split(":");
      cambios[campo] = parseFloat(delta);
    });
    alterarEstado(cambios);
    actualizarPanel();
    actualizarCuerpo();
  }
  const yaHerida = a.classList.contains("herida");
  a.classList.add("herida");
  const acc = a.dataset.acc;
  const bloque = a.closest(".bloque");

  if (yaHerida) {
    // releer la herida: la palabra se degrada en el lugar
    a.textContent = desvocalizar(a.textContent);
    return;
  }
  switch (acc) {
    case "nota":
      abrirNota(CORPUS.notas[parseInt(a.dataset.arg, 10)] || azarCaos(CORPUS.notas), a.textContent);
      break;
    case "glosa":
      generarGlosa(bloque, a.textContent);
      break;
    case "fx":
      // el efecto ya se aplicó; la palabra paga el precio
      a.textContent = intercambiarLetras(a.textContent);
      generarGlosa(bloque, a.textContent);
      break;
    case "insertar":
      insertarTexto(a.dataset.arg, bloque);
      break;
    case "escena":
      estado.pasos += 1;
      renderEscena(a.dataset.arg);
      break;
    case "recordar":
      insertarBloque(repeticionDeMemoria(), bloque);
      break;
    case "crash":
      crashear("una palabra cedió bajo el peso del clic: " + a.textContent);
      break;
  }
}

/* insertar texto nuevo después de un bloque: la página crece al leerse */
function insertarBloque(bl, despuesDe) {
  const sec = document.createElement("section");
  sec.className = "bloque brote " + bl.clase;
  sec.innerHTML = bl.html;
  if (despuesDe && despuesDe.parentNode) {
    despuesDe.parentNode.insertBefore(sec, despuesDe.nextSibling);
  } else {
    $lectura().appendChild(sec);
  }
}

function insertarTexto(tipo, despuesDe) {
  insertarBloque(generarTexto(tipo), despuesDe);
}

/* =====================================================================
   7 · notas — la segunda navegación
   la nota expande, contradice o infecta. y a veces muerde.
===================================================================== */

let notasEscena = [];   // las notas colgadas de llamadas ¹ ² ³ en la escena actual

function fuenteDeNotas() {
  if (estado.contaminacion > 55 && prob(0.4)) return CORPUS.notasIntrusas;
  if (prob(0.18)) return CORPUS.notasEditor;
  return CORPUS.notas;
}

/* devuelve la marca ¹ que abre una nota; registra el texto */
function llamadaNota(textoNota) {
  notasEscena.push(textoNota || azar(fuenteDeNotas()));
  const n = notasEscena.length;
  return '<sup class="llamada" data-i="' + (n - 1) + '">' + n + "</sup>";
}

/* con probabilidad, cuelga una llamada al final de un html dado */
function anotar(html, p) {
  if (prob(p === undefined ? 0.3 : p)) return html + llamadaNota();
  return html;
}

function claveNota(t) { return t.slice(0, 28); }

function abrirNota(texto, desde) {
  const k = claveNota(texto);
  memoria.notasAbiertas[k] = (memoria.notasAbiertas[k] || 0) + 1;
  const veces = memoria.notasAbiertas[k];
  let mostrado = texto;
  let clase = "";
  if (veces === 3) {
    mostrado = claveNota(texto) + "…: no abrir esta nota otra vez.";
    clase = "advertida";
  } else if (veces >= 4) {
    // la nota contenía más memoria que el párrafo
    mostrado = degradarTexto(texto, 0.5);
    clase = "mordida";
    crashMenor("la nota contenía más memoria que el párrafo");
  }
  if (CORPUS.notasIntrusas.includes(texto)) clase += " de-otra-voz";
  pintarNota(mostrado, desde, clase);
  registrarLectura("nota");
  registrarBitacora("nota", texto.slice(0, 60));
  sonarNota();
}

function pintarNota(textoHtml, desde, clase) {
  const lista = document.getElementById("notas-lista");
  const div = document.createElement("div");
  div.className = "nota " + (clase || "");
  div.innerHTML = (desde ? '<span class="origen">' + desde + "</span> " : "") +
    aplicarContaminacion(textoHtml);
  lista.prepend(div);
  while (lista.children.length > 7) lista.removeChild(lista.lastChild);
}

/* un crash que no rompe la escena: sólo la lastima */
function crashMenor(motivo) {
  alterarEstado({ casco: -4, coherencia: -4 });
  const bl = b("glosa-crash", "<p>[CRASH MENOR: " + motivo + "]</p>");
  insertarBloque(bl, $lectura().firstElementChild);
  actualizarPanel();
  if (prob(0.18)) crashear(motivo);
}

/* =====================================================================
   8 · glosas de sistema — comentarios automáticos sobre el texto
===================================================================== */

function textoGlosa(palabra) {
  let g = azarCaos(CORPUS.glosas);
  g = g.replace("{palabra}", palabra || azarCaos(CORPUS.palabras))
       .replace("{n}", String(1 + (memoria.palabrasTocadas % 89)));
  return g;
}

function generarGlosa(cerca, palabra) {
  const div = document.createElement("div");
  div.className = "glosa";
  div.textContent = "[" + textoGlosa(palabra) + "]";
  if (cerca && cerca.parentNode) {
    cerca.parentNode.insertBefore(div, cerca.nextSibling);
  } else {
    $lectura().appendChild(div);
  }
}

/* =====================================================================
   9 · formas de escritura — los regímenes del texto
   cada una devuelve { clase, html }; la interfaz es mínima, esto es lo máximo
===================================================================== */

function b(clase, html) { return { clase, html }; }

function bitacora() {
  const dia = "BITÁCORA / DÍA " + pad3(azarN(400) + estado.pasos) + " / " + azar(CORPUS.tecnica.horasRaras);
  const n = estado.energia > 40 ? 2 + azarN(2) : 1;
  const lineas = muestra(CORPUS.bitacoras, n).map(l => {
    archivar(l);
    return "<p>" + anotar(procesar(l), 0.25) + "</p>";
  }).join("");
  return b("bitacora", '<div class="rotulo">' + dia + "</div>" + lineas);
}

function informe() {
  const filas = [
    "casco: " + Math.round(estado.casco) + "%",
    "energía: " + Math.round(estado.energia) + "%",
    "memoria: " + (estado.memoria > 60 ? Math.round(estado.memoria) + "%" : "fragmentada"),
    "señal: " + pad3(Math.round(estado.senal)).slice(-2) + " " + azar(CORPUS.tecnica.unidades),
  ];
  if (estado.contaminacion > 40) filas.push("antena: orientada hacia una voz no catalogada");
  if (prob(0.7)) filas.push("anomalía: " + azar(CORPUS.danos));
  if (prob(0.5)) filas.push(azar(CORPUS.diagnosticos));
  return b("informe", '<div class="rotulo">DIAGNÓSTICO</div><pre>' +
    filas.map(f => procesarPlano(f)).join("\n") + "</pre>");
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
  registrarBitacora("señal", s);
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
  return b("prosa", "<p>" + anotar(procesar(t), 0.4) + "</p>");
}

function tablaRota() {
  const filas = [
    ["OBJETO", "ESTADO", "DISTANCIA", "LECTURA"],
  ];
  const estados = ["excesivo", "repetido", "húmedo", "tímido", "leído", "en duda", "creciente"];
  const dist = ["cerca/lejos", "ilegible", "interior", "creciente", "una palabra", "detrás de ti", "imposible"];
  const lectura = ["prohibida", "probable yo", "no tocar", "pendiente", "en curso", "ya fue", "todavía no"];
  const n = 3 + azarN(2);
  for (let i = 0; i < n; i++) {
    filas.push([azar(CORPUS.palabras), azar(estados), azar(dist), azar(lectura)]);
  }
  const anchos = [14, 12, 15, 0];
  const texto = filas.map(f =>
    f.map((c, i) => anchos[i] ? c.padEnd(anchos[i]) : c).join("")).join("\n");
  return b("tabla-rota", "<pre>" + texto + "</pre>");
}

/* constelación: palabras como estrellas, con fragmentos ocultos */
function constelacionVerbal() {
  const n = estado.energia > 30 ? 8 + azarN(6) : 4 + azarN(3);
  let html = "";
  for (let i = 0; i < n; i++) {
    const top = 4 + azarN(84), left = 2 + azarN(80);
    const tam = probabilidad(0.55, 1.7).toFixed(2);
    const palabra = azar(CORPUS.palabras);
    const frag = azar(CORPUS.bitacoras);
    html += '<span class="estrella" style="top:' + top + "%;left:" + left +
      "%;font-size:" + tam + 'em">' + palabra +
      '<i class="fragmento">' + procesarPlano(frag) + "</i></span>";
  }
  for (let i = 0; i < n * 2; i++) {
    // parte del polvo estelar es escritura antigua sin catalogar
    const abc = prob(0.25) ? azar(["lineara", "linearb", "egipcio", "anatolio"]) : null;
    html += '<span class="polvo' + (abc ? " " + abc : "") + '" style="top:' +
      azarN(96) + "%;left:" + azarN(96) + '%">' +
      azar(abc ? CORPUS.glifos[abc] : CORPUS.glifos.estrellas) + "</span>";
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
    const radio = 26 + azarN(8);
    html += '<span class="satelite" style="transform:rotate(' + ang +
      "deg) translateX(" + radio + "vmin) rotate(" + (-ang) + 'deg)">' +
      procesarPlano(f.slice(0, 44)) + "</span>";
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
  return b("silencio-b", "<p>" + procesarPlano(linea || azar([
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
  return b("eco-tierra", "<blockquote>" + anotar(procesar(r), 0.35) + "</blockquote>");
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
  let x = "";
  // con la contaminación alta, la otra voz deja caer su propia escritura
  if (estado.contaminacion > 55 && prob(0.6)) {
    const abc = azar(["lineara", "linearb", "egipcio", "anatolio"]);
    let g = "";
    const l = 3 + azarN(5);
    for (let i = 0; i < l; i++) g += azar(CORPUS.glifos[abc]);
    x = '<span class="xenoglifo ' + abc + '">' + g + "</span> ";
  }
  return b("intrusa", "<p>" + x + f + "</p>");
}

/* --- letanía: la repetición como plegaria de a bordo --- */
function letania() {
  const n = 4 + azarN(3);
  const motivos = muestra(CORPUS.letaniaMotivos, n);
  const html = motivos.map(m =>
    "<p>" + procesarPlano(m) + "</p><p>" + azar(CORPUS.letaniaRespuestas) + "</p>").join("");
  return b("letania", html);
}

/* --- interrogatorio: preguntas de un sistema a otro --- */
function interrogatorio() {
  const n = 3 + azarN(3);
  const pares = muestra(CORPUS.interrogatorios, n);
  const html = pares.map(p =>
    '<p class="q">' + procesarPlano(p.q) + '</p>' +
    '<p class="a' + (p.evasiva ? " evasiva" : "") + '">' + procesar(p.a) + "</p>").join("");
  return b("interrogatorio", html);
}

/* --- voz no humana: las escrituras que la nave no descifra.
       lineal A, lineal B, jeroglífico egipcio, anatolio —
       las lenguas candidatas del espacio, con sus fuentes propias --- */
function vozNoHumana() {
  const lineas = 2 + azarN(3);
  let html = "";
  for (let i = 0; i < lineas; i++) {
    const abc = azar(["lineara", "linearb", "egipcio", "anatolio"]);
    const largo = 5 + azarN(9);
    let g = "";
    for (let j = 0; j < largo; j++) g += azar(CORPUS.glifos[abc]);
    html += '<p class="glifos ' + abc + '">' + g + "</p>" +
      '<p class="traduccion">[traducción fallida: ' +
      procesarPlano(azar(CORPUS.senales)) + "]</p>";
  }
  return b("xeno", html);
}

/* --- brindis: la letanía breve, con vaso --- */
function brindisTexto() {
  const n = 4 + azarN(4);
  return b("letania", muestra(CORPUS.brindis, n).map(x =>
    "<p>" + procesarPlano(x) + "</p>").join("") +
    "<p>— salud, dice la válvula con vocación de abuelo.</p>");
}

/* --- las formas nuevas: el libro se expande --- */

function archivoEncontrado() {
  const doc = azar(CORPUS.archivosEncontrados);
  archivar(doc.split("\n")[0]);
  return b("archivo", '<div class="rotulo">ARCHIVO RECUPERADO / FRAGMENTO ' +
    pad3(azarN(89) + 1) + "</div><pre>" + procesarPlano(doc) + "</pre>");
}

function enciclopediaFalsa() {
  const e = azar(CORPUS.enciclopedia);
  return b("enciclopedia", '<div class="termino">' + e.termino + "</div><p>" +
    anotar(procesar(e.cuerpo), 0.45) + "</p>");
}

function carta() {
  const c = azar(CORPUS.cartas);
  archivar(c.split("\n\n")[1] || c);
  return b("carta", c.split("\n\n").map(p =>
    "<p>" + procesar(p.replace(/\n/g, "<br>")) + "</p>").join(""));
}

function manualTexto() {
  return b("manual", "<pre>" + procesarPlano(azar(CORPUS.manuales)) + "</pre>");
}

function notaEditor() {
  return b("editor", "<p>" + azar(CORPUS.notasEditor) + "</p>");
}

function error404() {
  return b("error404", "<pre>" + azar(CORPUS.errores404) + "</pre>");
}

/* menú narrativo: las opciones reales, adentro del texto.
   cada línea es clicable — el texto mismo es el mando */
function menuNarrativo(opciones) {
  const filas = opciones.map((o, i) =>
    (i + 1) + ". " + '<a class="menu-op" data-i="' + i + '">' +
    o.texto.replace(/^\[|\]$/g, "") + "</a>").join("\n");
  return b("menu", "<pre>¿qué hace la nave?\n\n" + filas + "</pre>");
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
    case "cajaNegra": return cajaNegraTexto();
    case "repeticion": return repeticionDeMemoria();
    case "intrusa": return vozIntrusa();
    case "archivo": return archivoEncontrado();
    case "enciclopedia": return enciclopediaFalsa();
    case "carta": return carta();
    case "manual": return manualTexto();
    case "editor": return notaEditor();
    case "error404": return error404();
    case "letania": return letania();
    case "interrogatorio": return interrogatorio();
    case "xeno": return vozNoHumana();
    case "brindis": return brindisTexto();
    default: return bitacora();
  }
}

/* =====================================================================
   10 · misiones — el inicio cambia con los ciclos y los crashes
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
   11 · escenas — nodos literarios. cualquiera puede llevar a varios.
   cada escena devuelve { titulo, bloques, opciones, menu? }
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
  "archivoLateral", "enciclopedia", "cartaACentral",
  "heliopausa", "cementerioOrbital", "tabernaAsteroide",
  /* el lago de medusas no se lista: se llega por rumor */
];

const ESCENAS = {

  /* --- 1 · inicio ------------------------------------------------- */
  inicio() {
    const mision = generarMision();
    archivar(mision);
    registrarBitacora("misión", mision);
    const cab = "MISIÓN / CICLO " + pad3(estado.ciclos);
    const bloques = [];
    let cuerpo =
      "<p>la nave despierta<br>no en el " +
      hiper("espacio", { acc: "nota", arg: "2" }) +
      "<br>sino en la página que simula el espacio<br>mientras carga el " +
      hiper("primer silencio", { acc: "escena", arg: "primerSilencio" }) + "</p>" +
      "<pre>energía: " + Math.round(estado.energia) +
      "\ncasco: " + Math.round(estado.casco) +
      "\nmemoria: " + palabraNivel(estado.memoria) +
      "\nseñal: " + (estado.senal > 70 ? "terrestre" : palabraNivel(estado.senal)) +
      "\ncoherencia: " + (estado.coherencia > 70 ? "administrativa" : palabraNivel(estado.coherencia)) + "</pre>" +
      "<p>objetivo declarado:<br>" + procesar(mision) + "</p>" +
      "<p>objetivo probable:<br>aprender qué parte de una misión se rompe primero:<br>el motor,<br>la " +
      hiper("antena", { acc: "fx", fx: "senal:-4" }) + ",<br>la " +
      hiper("promesa", { acc: "insertar", arg: "manual" }) + ",<br>o la gramática." +
      llamadaNota() + "</p>" +
      "<p class='detecciones'>la nave detecta una " +
      hiper("señal antigua", { acc: "escena", arg: "senal", fx: "senal:-3" }) +
      " en el borde del cúmulo. también registra una " +
      hiper("zona de silencio", { acc: "escena", arg: "silencio" }) +
      " y un " + hiper("objeto sin sombra", { acc: "insertar", arg: "enciclopedia" }) + ".</p>";
    bloques.push(b("apertura", cuerpo));
    if (estado.cicatrices.length) {
      const ultimas = estado.cicatrices.slice(-3).map(c => "<p>" + procesarPlano(c) + "</p>").join("");
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
        op("[escribir a central]", ["cartaACentral"], { memoria: +3 }),
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
        prob(0.65) ? textoOrbital() : interrogatorio(),
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
        b("apertura", "<p>" + procesarPlano("el mismo minuto, dos veces, con distinta ortografía:") + "</p>"),
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
        prob(0.4) ? bitacora() : (prob(0.5) ? archivoEncontrado() : vozNoHumana()),
      ],
      menu: true,
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
        prob(0.5) ? tablaRota() : archivoEncontrado(),
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
        prob(0.4) ? notaEditor() : textoSilencio("(la promesa, al abrirse, se desvanece: queda el objeto a secas)"),
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
        b("apertura", "<p>" + procesarPlano("esta sonda ya fue ustedes.") + llamadaNota() + "</p>"),
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
        prob(0.5) ? prosaGalactica() : enciclopediaFalsa(),
      ],
      menu: true,
      opciones: [
        op("[aterrizar]", ["crashInminente"], { casco: -10 }),
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
        op("[esperar a que pase]", ["cumulo", "planeta", "senal", "cementerioOrbital"], { energia: -3 }),
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
        b("informe", "<pre>" + procesarPlano("su ruta (que es la tuya, al revés):\n" + rutaEspejo) + "</pre>"),
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
    registrarBitacora("daño", d);
    return {
      titulo: "AVERÍA",
      bloques: [
        informe(),
        b("apertura", "<p>" + procesar(
          "se declara: " + d + ". la avería escribe mejor que el sistema de a bordo.") + "</p>"),
        prob(0.4) ? manualTexto() : b("glitch", "<pre>" +
          glitchVerbal("reparar reparar reparar la palabra reparar") + "</pre>"),
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
        b("sueno", "<p>" + anotar(procesar(s), 0.4) + "</p>"),
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
        prob(0.6) ? ecoTerrestre() : carta(),
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
        op("[expulsarla]", ["averia", "primerSilencio"], { contaminacion: -15, coherencia: -5, energia: -8 }, { especial: "liberar" }),
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
        error404(),
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
        op("[seguir a la deriva]", ["derivaLarga", "cumulo", "eclipse", "heliopausa"], { deriva: +5, energia: -3 }),
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
      b("apertura", "<p>" + procesarPlano("esta escena ya ocurrió. o va a ocurrir. la memoria la reconstruye con lo que hay:") + "</p>"),
    ];
    piezas.forEach(p => bloques.push(
      b("repeticion", "<p>" + degradarTexto(p, 0.35) + "</p>")));
    if (estado.cicatrices.length && prob(0.5)) {
      bloques.push(b("cicatrices", "<p>" + procesarPlano(azar(estado.cicatrices)) + "</p>"));
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
    registrarBitacora("crash", "CRASH " + numero + ": " + motivo);
    perderInformacion(2 + azarN(3), "impacto");
    if (prob(0.6)) contaminarPalabra();
    guardarMemoria();
    // cada crash se imprime en un CRT distinto: la falla colecciona monitores
    const bloques = [
      b("crash crt-" + (memoria.crashesTotales % 6), "<pre>" +
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
    if (prob(0.35)) bloques.push(notaEditor());
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
      manualTexto(),
    ];
    if (memoria.recuperadas.length) {
      bloques.push(b("cicatrices", '<div class="rotulo">frases recuperadas</div><p>' +
        procesarPlano(azar(memoria.recuperadas)) + "</p>"));
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
      bloques: [
        b("apertura", "<p>" + procesar(f) + "</p>"),
        prob(0.3) ? notaEditor() : textoSilencio("(el final, como la caja, promete algo adentro)"),
      ],
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

  /* --- 31 · los documentos laterales ------------------------------------------------------------------------------- */
  archivoLateral() {
    return {
      titulo: "DOCUMENTOS LATERALES",
      bloques: [
        b("apertura", "<p>" + procesar(
          "en el margen de la ruta, la nave encuentra papeles que nadie archivó del lado de adentro.") + "</p>"),
        archivoEncontrado(),
        prob(0.5) ? manualTexto() : enciclopediaFalsa(),
      ],
      opciones: [
        op("[archivarlos]", ["orbitaBaja", "cumulo"], { memoria: +4 }),
        op("[seguir sus instrucciones]", ["errorNavegacion", "planeta", "senal"], { coherencia: -6 }, { traicion: 0.3 }),
        op("[corregirlos]", ["planetaTexto", "averia"], { contaminacion: +6 }),
      ],
    };
  },

  /* --- 32 · enciclopedia --------------------------------------------------------------------------------------------- */
  enciclopedia() {
    return {
      titulo: "ENCICLOPEDIA DE A BORDO (ED. DAÑADA)",
      bloques: [
        enciclopediaFalsa(),
        enciclopediaFalsa(),
        prob(0.4) ? notaEditor() : b("apertura", "<p>" +
          procesar("las entradas se consultan solas durante la noche. amanecen cambiadas.") + "</p>"),
      ],
      opciones: [
        op("[seguir la referencia]", ["planeta", "cajaNegraAjena", "senal"], { memoria: +3 }),
        op("[impugnar una entrada]", ["errorNavegacion", "intrusion"], { contaminacion: +7 }),
        op("[cerrar el tomo]", ["primerSilencio", "eclipse"], {}),
      ],
    };
  },

  /* --- 33 · carta a central --------------------------------------------------------------------------------------------- */
  cartaACentral() {
    return {
      titulo: "CARTA",
      bloques: [
        carta(),
        prob(0.4) ? b("apertura", "<p>" + procesar(
          "la carta espera en la bandeja de salida. la bandeja de salida es el espacio entero.") + "</p>") : informe(),
      ],
      opciones: [
        op("[enviarla]", ["senal", "silencio"], { senal: -6, memoria: +4 }),
        op("[no enviarla]", ["archivoTerrestre", "suenoNave"], { memoria: -4 }),
        op("[añadir posdata]", ["cartaACentral"], { energia: -3, contaminacion: +4 }),
      ],
    };
  },

  /* --- 34 · heliopausa: la frontera del idioma ------------------------------------------------------------------------ */
  heliopausa() {
    return {
      titulo: "HELIOPAUSA",
      bloques: [
        b("apertura", "<p>" + procesar(
          "hasta aquí corrige el sol. la heliopausa no es una frontera: es donde el idioma cambia de dueño. " +
          "del otro lado, cada palabra viaja por cuenta propia.") + "</p>"),
        prob(0.5) ? interrogatorio() : prosaGalactica(),
      ],
      opciones: [
        op("[cruzar]", ["derivaLarga", "lagoDeMedusas", "tabernaAsteroide"], { senal: -10, coherencia: -4 }),
        op("[quedarse del lado corregido]", ["orbitaBaja", "cumulo"], { coherencia: +5 }),
        op("[dejar que el idioma cambie de dueño]", ["intrusion", "sondaEco"], { contaminacion: +10 }),
        op("[preguntar en qué idioma duele]", ["senal", "escenaOlvidada"], { memoria: -4 }),
      ],
    };
  },

  /* --- 35 · cementerio orbital ----------------------------------------------------------------------------------------- */
  cementerioOrbital() {
    registrarEncuentro("cementerio orbital");
    return {
      titulo: "CEMENTERIO ORBITAL",
      bloques: [
        b("apertura", "<p>" + procesar(
          "flores impresas, órbitas dobladas, nombres en tres alfabetos. " +
          "bajo tres lunas, la primera tumba recibe flores de archivo y lágrimas verdaderas.") + "</p>"),
        letania(),
      ],
      opciones: [
        op("[dejar una flor impresa]", ["eclipse", "primerSilencio"], { memoria: +5 }, { especial: "plantar" }),
        op("[leer los nombres]", ["escenaOlvidada", "archivoTerrestre"], { memoria: -5, contaminacion: +4 }),
        op("[rezar la letanía completa]", ["suenoNave", "silencio"], { coherencia: +6, energia: -4 }),
        op("[seguir de largo]", ["cumulo", "planeta"], { deriva: +4 }),
      ],
    };
  },

  /* --- 36 · el lago de medusas (se llega por rumor) --------------------------------------------------------------------- */
  lagoDeMedusas() {
    registrarEncuentro("lago de medusas");
    const m = azar(CORPUS.medusas);
    archivar(m);
    return {
      titulo: "EL LAGO DE MEDUSAS",
      bloques: [
        b("apertura", "<p>" + procesar(m) + "</p>"),
        vozNoHumana(),
        prob(0.4) ? b("apertura", "<p>" + procesarPlano(
          "la nave entiende todo menos lo importante, que era el pulso.") + "</p>") : textoSilencio("(el lago también lee. despacio. con frío tibio.)"),
      ],
      opciones: [
        op("[escuchar el cuento]", ["suenoNave", "escenaOlvidada"], { memoria: +6, contaminacion: +6 }),
        op("[cantar con ellas]", ["sondaEco", "suenoNave"], { contaminacion: +8, coherencia: -4 }),
        op("[no traducir: bailar]", ["cumulo", "eclipse"], { coherencia: -6, energia: -4 }),
        op("[preguntar por el helecho]", ["archivoTerrestre"], { memoria: +8 }),
      ],
    };
  },

  /* --- 37 · la taberna del asteroide ------------------------------------------------------------------------------------- */
  tabernaAsteroide() {
    registrarEncuentro("taberna del asteroide");
    return {
      titulo: "TABERNA DEL ASTEROIDE",
      bloques: [
        b("apertura", "<p>" + procesar(
          "hay una taberna dentro de un asteroide. se paga con recuerdos; el cambio se da en brindis. " +
          "la nave pide silencio de barril. doble.") + "</p>"),
        brindisTexto(),
      ],
      menu: true,
      opciones: [
        op("[pagar con un recuerdo]", ["cumulo", "planeta"], { memoria: -8, energia: +12 }, { especial: "borrarAlgo" }),
        op("[brindar por la Tierra]", ["archivoTerrestre", "cartaACentral"], { memoria: +5, senal: +4 }),
        op("[preguntar por otras naves]", ["naveEspejo", "sondaMuerta"], { contaminacion: +4 }),
        op("[preguntar por el lago]", ["lagoDeMedusas"], { deriva: +5 }),
        op("[quedarse una ronda más]", ["tabernaAsteroide"], { deriva: +6, coherencia: -4 }),
      ],
    };
  },

  /* --- 38 · escenas que la memoria desbloquea ------------------------------------------------------------------------- */
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
      "<p>" + procesarPlano(c) + "</p>").join("") || "<p>(sala en préstamo)</p>";
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
   12 · navegación — decisión + azar + daño deciden juntos
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
  alterarEstado(opcion.fx || {});
  if (opcion.especial === "borrarAlgo") {
    estado.archivo = [];
    if (memoria.recuperadas.length) memoria.recuperadas.shift();
    perderInformacion(6 + azarN(4), "borrado voluntario");
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
  if (!enSistema && rnd() < probabilidadCrash()) return "crash";
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
  registrarBitacora("loop", "ciclo " + pad3(memoria.ciclos) + " cerrado. la nave vuelve con cicatriz.");
  memoria.ciclos += 1;
  memoria.deterioro += 1;
  if (prob(0.5)) contaminarPalabra();
  guardarMemoria();
  sembrar();
  estadoInicialDeCiclo();
  sonarLoop();
  renderEscena("inicio");
}

/* generarEscena: pedir un nodo por nombre, con red de seguridad */
function generarEscena(nombre) {
  const fn = ESCENAS[nombre] || ESCENAS.inicio;
  return fn();
}

/* =====================================================================
   13 · render — la página como casco. todo queda en pantalla:
   el texto scrollea en su región; las opciones no se van nunca.
===================================================================== */

const $lectura = () => document.getElementById("lectura");
const $opciones = () => document.getElementById("opciones");
const $estado = () => document.getElementById("estado");

let opcionesActuales = [];
let latidos = [];   // timeouts del caos ambiental, se limpian por escena

function renderEscena(nombre) {
  if (!ESCENAS[nombre]) nombre = "inicio";
  estado.escena = nombre;
  estado.ruta.push(nombre);
  if (estado.ruta.length > 60) estado.ruta.shift();
  desgastePaso();
  notasEscena = [];

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

  // el menú narrativo: las opciones también viven dentro del texto
  if (def.menu) visibles.push(menuNarrativo(def.opciones));

  let html = "";
  if (def.titulo) html += "<h1>" + def.titulo + "</h1>";
  for (const bl of visibles) {
    html += '<section class="bloque ' + bl.clase + '">' + bl.html + "</section>";
  }
  $lectura().innerHTML = html;
  $lectura().scrollTop = 0;

  renderOpciones(def.opciones);
  actualizarPanel();
  actualizarCuerpo();
  registrarBitacora("escena", (def.titulo || nombre).toLowerCase());
  guardarMemoria();
  programarCaos();
  sonarEscena(nombre);
  // a veces el texto llega tecleándose, como si alguien lo escribiera ahora
  tecleoOcasional();
}

function renderOpciones(opciones) {
  opcionesActuales = opciones;
  let orden = opciones.map((o, i) => i);
  // con poca coherencia, las opciones pierden el orden y a veces el sentido
  if (estado.coherencia < 45) orden = barajar(orden);
  const nav = $opciones();
  nav.innerHTML = "";
  orden.forEach((idx, i) => {
    const o = opciones[idx];
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
  const pie = document.getElementById("semilla");
  if (pie) pie.textContent = "semilla " + SEMILLA;
}

/* =====================================================================
   14 · caos ambiental — la página sigue escribiéndose sola.
   usa Math.random: no gasta la semilla narrativa.
===================================================================== */

function nodosDeTexto(raiz) {
  const lista = [];
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (n.textContent.trim().length > 24) lista.push(n);
  }
  return lista;
}

/* una palabra visible se deteriora en el lugar, sin recargar nada */
function latidoDeDeterioro() {
  const nodos = nodosDeTexto($lectura());
  if (!nodos.length) return;
  const nodo = azarCaos(nodos);
  const partes = nodo.textContent.split(" ");
  const vivas = partes.map((p, i) => p.length > 3 ? i : -1).filter(i => i >= 0);
  if (!vivas.length) return;
  const i = azarCaos(vivas);
  partes[i] = probCaos(0.5) ? desvocalizar(partes[i]) : intercambiarLetras(partes[i]);
  nodo.textContent = partes.join(" ");
}

function programarCaos() {
  latidos.forEach(clearTimeout);
  latidos = [];
  const nivel = memoria.deterioro + estado.contaminacion / 20;
  // el deterioro acumulado vuelve la página más inquieta
  const cuantos = nivel > 10 ? 3 : (nivel > 4 ? 2 : 1);
  for (let i = 0; i < cuantos; i++) {
    latidos.push(setTimeout(() => {
      if (document.hidden) return;
      if (probCaos(0.55)) latidoDeDeterioro();
      else if (probCaos(0.5)) generarGlosa(azarCaos(
        Array.from($lectura().querySelectorAll(".bloque")) || [null]));
    }, 9000 + Math.random() * 14000 * (i + 1)));
  }
}

/* =====================================================================
   15 · el mapa — una ventanita: dónde estamos en el universo.
   muy unicode: la Tierra, la nave, el polvo, la deriva.
===================================================================== */

function construirMapa() {
  const W = 46, H = 16;
  const g = Array.from({ length: H }, () => Array(W).fill(" "));

  // el polvo del fondo (caos: el mapa nunca se dibuja igual dos veces)
  for (let i = 0; i < 42; i++) {
    g[azarCaosN(H)][azarCaosN(W)] = azarCaos(["·", "·", "·", "✦", "✧", "⋆", "*"]);
  }
  // (la escritura antigua no entra al mapa: sus glifos son anchos
  //  y doblarían el marco. el mapa prefiere mentir con pulcritud.)

  // la Tierra, abajo a la izquierda; la nave, cada vez más lejos
  const tx = 2, ty = H - 3;
  const dist = clamp(Math.round(4 + estado.pasos * 1.1 + estado.ciclos * 4), 4, W - 5);
  const nx = clamp(tx + dist, 4, W - 3);
  const ny = clamp(2 + Math.round(estado.deriva / 9) + (estado.pasos % 4) - 1, 1, H - 5);

  // la estela: el camino recorrido, con los huecos de la memoria
  const tramos = 10;
  for (let i = 1; i < tramos; i++) {
    const x = Math.round(tx + (nx - tx) * i / tramos);
    const y = Math.round(ty + (ny - ty) * i / tramos);
    if (estado.memoria > 30 || probCaos(0.55)) g[y][x] = "·";
  }

  // la heliopausa, si la nave ya anda lejos: una cortina de ondas
  if (dist > W * 0.55) {
    const hx = Math.round(W * 0.62);
    for (let y = 1; y < H - 1; y += 1) {
      if (probCaos(0.6)) g[y][hx] = "∿";
    }
  }
  // los encuentros importantes dejan marca
  const enc = (memoria.encuentros || []).join(" ");
  if (enc.includes("lago")) g[2][W - 6] = "∿";
  if (enc.includes("taberna")) g[H - 4][Math.round(W * 0.7)] = "⌂";
  if (enc.includes("cementerio")) g[3][Math.round(W * 0.4)] = "✝";
  if (memoria.crashesTotales > 0) {
    for (let i = 0; i < Math.min(memoria.crashesTotales, 5); i++) {
      g[azarCaosN(H)][azarCaosN(W)] = "×";
    }
  }

  g[ty][tx] = "⊕";
  g[ny][nx] = "⌖";

  // el marco y las leyendas
  const cuerpo = g.map(f => "│" + f.join("") + "│");
  const arriba = "┌" + "─".repeat(W) + "┐";
  const abajo = "└" + "─".repeat(W) + "┘";
  const titulo = " MAPA DE MISIÓN / CICLO " + pad3(estado.ciclos) + " / PASO " + pad3(estado.pasos);
  const leyenda =
    " ⊕ tierra   ⌖ la nave   × crash   ∿ heliopausa\n" +
    " distancia: " + Math.round(dist * 7 + estado.deriva) + " unidades de relato" +
    (estado.memoria < 30 ? "\n (la estela tiene huecos: la memoria también)" : "");
  return titulo + "\n" + arriba + "\n" + cuerpo.join("\n") + "\n" + abajo + "\n" + leyenda;
}

function toggleMapa() {
  const m = document.getElementById("mapa");
  if (m.hidden) {
    document.getElementById("mapa-pre").textContent = construirMapa();
    m.hidden = false;
    registrarBitacora("mapa", "el lector consultó el mapa. la nave fingió saber dónde está.");
    guardarMemoria();
  } else {
    m.hidden = true;
  }
}

/* =====================================================================
   16 · la impresión — lo único que sale de la pantalla:
   la bitácora de misión, con todo lo que sobrevivió. y sus huecos.
===================================================================== */

function imprimirBitacora() {
  const b = memoria.bitacoraMision || [];
  const imp = document.getElementById("impresion");
  let html = "<h1>BITÁCORA DE MISIÓN</h1>" +
    '<p class="imp-meta">LOOP: una nave que escribe su deterioro · semilla ' + SEMILLA +
    " · ciclo " + pad3(estado.ciclos) + " · paso " + pad3(estado.pasos) +
    " · " + (memoria.crashesTotales || 0) + " crashes de por vida</p>";
  if (!b.length) {
    html += "<p>(la bitácora está vacía: o no pasó nada, o pasó y se perdió.)</p>";
  } else {
    const porCiclo = {};
    b.forEach(e => { (porCiclo[e.c] = porCiclo[e.c] || []).push(e); });
    Object.keys(porCiclo).sort((x, y) => x - y).forEach(c => {
      html += "<h2>CICLO " + pad3(c) + "</h2>";
      porCiclo[c].forEach(e => {
        const clase = e.t === "pérdida" ? "imp-perdida" : (e.t === "dañada" ? "imp-danada" : "imp-" + e.t);
        html += '<p class="' + clase + '"><span>' + e.t + "</span> " + e.x + "</p>";
      });
    });
  }
  const perdidas = b.filter(e => e.t === "pérdida" || e.t === "dañada").length;
  html += '<p class="imp-colofon">se imprime lo que sobrevivió (' + (b.length - perdidas) +
    " entradas legibles, " + perdidas + " perdidas o dañadas). lo demás también existió.</p>";
  imp.innerHTML = html;
  registrarBitacora("sistema", "el lector imprimió la bitácora. el papel no devuelve.");
  guardarMemoria();
  window.print();
}

/* =====================================================================
   17 · el sonido — la bocina rudimentaria (Tone.js, de lands/).
   apagada por defecto: la nave entiende el pudor. ruido y entropía.
===================================================================== */

const SONIDO = { activo: false, listo: false, sintes: {} };

function iniciarSonido() {
  if (typeof Tone === "undefined") return false;
  if (SONIDO.listo) return true;
  try {
    Tone.start();
    const s = SONIDO.sintes;
    s.pulso = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 },
    }).toDestination();
    s.pulso.volume.value = -20;
    s.ruido = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.004, decay: 0.5, sustain: 0 },
    }).toDestination();
    s.ruido.volume.value = -19;
    s.cuna = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.15, release: 0.6 },
    }).toDestination();
    s.cuna.volume.value = -17;
    SONIDO.listo = true;
    return true;
  } catch (e) { return false; }
}

function toggleSonido() {
  const btn = document.getElementById("btn-sonido");
  if (!SONIDO.activo) {
    if (!iniciarSonido()) { btn.classList.add("roto"); btn.title = "la bocina no cargó"; return; }
    SONIDO.activo = true;
    btn.classList.add("activo");
    registrarBitacora("sistema", "bocina rudimentaria encendida: ruido y entropía.");
    sonarSenal();
  } else {
    SONIDO.activo = false;
    btn.classList.remove("activo");
    registrarBitacora("sistema", "bocina apagada. el silencio también se transmite.");
  }
  guardarMemoria();
}

function puedeSonar() { return SONIDO.activo && SONIDO.listo && typeof Tone !== "undefined"; }

/* la señal: pulsos como morse defectuoso */
function sonarSenal() {
  if (!puedeSonar()) return;
  try {
    const t0 = Tone.now();
    const notas = ["D5", "A4", "D5", "F4", "A4", "D5", "G4"];
    let t = t0;
    const n = 4 + azarCaosN(5);
    for (let i = 0; i < n; i++) {
      SONIDO.sintes.pulso.triggerAttackRelease(azarCaos(notas), 0.04, t);
      t += 0.09 + Math.random() * 0.16;
    }
  } catch (e) { }
}

/* el crash: ruido rosa y una frecuencia que se cae */
function sonarCrash() {
  if (!puedeSonar()) return;
  try {
    const t0 = Tone.now();
    SONIDO.sintes.ruido.triggerAttackRelease(0.5, t0);
    SONIDO.sintes.pulso.triggerAttackRelease("A3", 0.4, t0);
    SONIDO.sintes.pulso.frequency.rampTo("A1", 0.5, t0);
  } catch (e) { }
}

/* la puerta: un clic mínimo, casi administrativo */
function sonarPuerta() {
  if (!puedeSonar()) return;
  try { SONIDO.sintes.pulso.triggerAttackRelease("C6", 0.02); } catch (e) { }
}

/* la nota al margen: un ping suave */
function sonarNota() {
  if (!puedeSonar()) return;
  try { SONIDO.sintes.pulso.triggerAttackRelease("E5", 0.06); } catch (e) { }
}

/* el earworm del loop: una canción de cuna que pierde notas con los ciclos */
function sonarLoop() {
  if (!puedeSonar()) return;
  try {
    const cuna = ["E4", "G4", "A4", "G4", "D4", "E4"];
    const quitar = memoria.ciclos % 4;
    const melodia = cuna.slice(0, Math.max(2, cuna.length - quitar));
    let t = Tone.now();
    melodia.forEach(nota => {
      SONIDO.sintes.cuna.triggerAttackRelease(nota, 0.28, t);
      t += 0.34;
    });
  } catch (e) { }
}

/* qué suena al entrar a cada escena */
function sonarEscena(nombre) {
  if (!puedeSonar()) return;
  if (nombre === "crash" || nombre === "crashInminente") { sonarCrash(); return; }
  if (nombre === "senal" || nombre === "sondaEco") { sonarSenal(); return; }
  if (nombre === "lagoDeMedusas") {
    // las medusas pulsan bajo y lento
    try {
      let t = Tone.now();
      for (let i = 0; i < 3; i++) {
        SONIDO.sintes.cuna.triggerAttackRelease(azarCaos(["D3", "F3", "A2"]), 0.5, t);
        t += 0.7;
      }
    } catch (e) { }
    return;
  }
  if (probCaos(0.2)) sonarPuerta();
}

/* =====================================================================
   18 · la máquina de escribir — a veces el texto llega tecleándose,
   como si alguien lo escribiera ahora, del otro lado del casco.
===================================================================== */

function maquinaDeEscribir(seccion) {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const nodos = [];
  let total = 0;
  const w = document.createTreeWalker(seccion, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (n.textContent.trim()) { nodos.push([n, n.textContent]); total += n.textContent.length; }
  }
  if (!nodos.length || total > 900) return;   // lo muy largo no se teclea: llega
  nodos.forEach(par => { par[0].textContent = ""; });
  seccion.classList.add("tecleando");
  let i = 0, j = 0;
  const paso = () => {
    if (i >= nodos.length) { seccion.classList.remove("tecleando"); return; }
    const [nodo, completo] = nodos[i];
    j += 1 + (probCaos(0.15) ? 1 : 0);          // a veces la tecla se traba y salen dos
    nodo.textContent = completo.slice(0, j);
    if (j >= completo.length) { i++; j = 0; }
    latidos.push(setTimeout(paso, 14 + Math.random() * 42));
  };
  paso();
}

function tecleoOcasional() {
  if (!probCaos(0.38)) return;
  const candidatas = $lectura().querySelectorAll(
    ".bloque.senal, .bloque.carta, .bloque.bitacora, .bloque.cajanegra, .bloque.sueno");
  if (!candidatas.length) return;
  maquinaDeEscribir(candidatas[azarCaosN(candidatas.length)]);
}

/* =====================================================================
   19 · arranque
===================================================================== */

document.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") {
    if (!e.metaKey && !e.ctrlKey) nuevaSemilla();
    return;
  }
  if (e.key === "m" || e.key === "M") { toggleMapa(); return; }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 9) {
    const btn = $opciones().querySelector('[data-n="' + n + '"]');
    if (btn) btn.click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // los enlaces del texto: una palabra puede ser una puerta
  $lectura().addEventListener("click", e => {
    const a = e.target.closest("a.hiper");
    if (a) { seguirHipervinculo(a); return; }
    const sup = e.target.closest("sup.llamada");
    if (sup) {
      const t = notasEscena[parseInt(sup.dataset.i, 10)];
      if (t) { sup.classList.add("herida"); abrirNota(t, "nota " + (parseInt(sup.dataset.i, 10) + 1)); }
      return;
    }
    const m = e.target.closest("a.menu-op");
    if (m) {
      const o = opcionesActuales[parseInt(m.dataset.i, 10)];
      if (o) elegir(o);
    }
  });
  // los útiles: sonido, mapa, impresión
  document.getElementById("btn-sonido").addEventListener("click", toggleSonido);
  document.getElementById("btn-mapa").addEventListener("click", toggleMapa);
  document.getElementById("btn-imprimir").addEventListener("click", imprimirBitacora);
  document.getElementById("mapa").addEventListener("click", toggleMapa);

  sembrar();
  estadoInicialDeCiclo();
  renderEscena("inicio");
});
