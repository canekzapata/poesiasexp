/* VIDA MEDIA · EN VIVO — setlist.js
   los dieciséis cuadros + PLATAFORMA. la fuente de verdad del poema es
   ../vidamedia (1).txt: los fragmentos de aquí se toman verbatim de ahí. */

"use strict";

/* ── azar firmado (xmur3 + mulberry32, herencia de loop-nave) ── */
const AZAR = (() => {
  let rnd = Math.random;
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  return {
    sembrar(sem) { rnd = mulberry32(xmur3(String(sem))()); },
    r() { return rnd(); },
    ent(a, b) { return a + Math.floor(rnd() * (b - a + 1)); },
    el(arr) { return arr[Math.floor(rnd() * arr.length)]; },
    prob(p) { return rnd() < p; },
    caos() { return Math.random(); },
  };
})();

/* ── estado de la corrida (en memoria; la semilla es el único recuerdo) ── */
const ESTADO = {
  cuadro: 0,
  t0: null,               // ms de época al dejar PLATAFORMA
  seed: (new URLSearchParams(location.search).get("seed")) ||
        Math.floor(Math.random() * 1e6).toString(36),
  capas: { musica: true, hydra: true, vocoder: true, dry: false },
  micOK: false,
  micAbierto: true,       // Q lo cierra: acople, tos, hablar con la técnica
  audioOK: false,
  ensayo: new URLSearchParams(location.search).has("ensayo"),
  blackout: false,
  panico: false,
  heridas: [],            // palabras-puerta tocadas (reaparecen desvocalizadas)
  filamentos: [],         // palabras dejadas en la niebla (vuelven en ACUSE)
  rumbo: null,            // la bifurcación: tocar «nube» o «red» en LA REGIÓN
  auto: new URLSearchParams(location.search).has("auto"),
  turbo: parseFloat(new URLSearchParams(location.search).get("turbo")) || 1,
  log: [],                // [cuadro, tEntrada] para el modo ensayo
};
AZAR.sembrar(ESTADO.seed);

/* la pila: el tiempo restante de la función. se divide por dos
   a los 10:00, 15:00, 17:30, 18:45… nunca llega a cero. */
const DURACION = 1200; // 20 minutos
function pila() {
  if (ESTADO.t0 === null) return 1;
  const t = (Date.now() - ESTADO.t0) / 1000;
  return Math.max(0.015, (DURACION - t) / DURACION);
}
function tMision() {
  return ESTADO.t0 === null ? 0 : (Date.now() - ESTADO.t0) / 1000;
}

/* ── escalas (nombres de nota para Tone) ── */
const ESC = {
  frigia:  ["A2", "Bb2", "C3", "D3", "E3", "F3", "G3"],
  menor:   ["A2", "B2", "C3", "D3", "E3", "F3", "G3"],
  dorica:  ["D3", "E3", "F3", "G3", "A3", "B3", "C4"],
  unisono: ["A2", "A2", "A2", "A2", "A2", "A2", "A2"],
};

/* ── el setlist ── */
const SETLIST = [

  { // 0
    id: "plataforma", titulo: "PLATAFORMA", sub: "pre-función · la torre",
    dur: Infinity, escala: ESC.menor, acorde: ["A1", "A2", "E2"],
    hydra: "plataforma", vel: 0, musica: "drone",
    micro: { wet: 0, fx: null },
    boletin: "Boletín. Energía disponible, noventa y cuatro punto dos por ciento. Distancia, creciente. No hay novedades.",
    lectura: "designacion erre veintisiete. objeto, sonda, no tripulada. estado, yendome.",
    guion: [
      { f: "teclea", t: "designación .... R-27", cps: 14, clase: "ficha" },
      { f: "teclea", t: "objeto ......... sonda, no tripulada", cps: 14, clase: "ficha" },
      { f: "teclea", t: "tripulación .... 0", cps: 14, clase: "ficha" },
      { f: "teclea", t: "carga útil ..... una antena, un reloj, una pila que se divide", cps: 14, clase: "ficha" },
      { f: "teclea", t: "destino ........ región H6 —una falta de hidrógeno—", cps: 14, clase: "ficha" },
      { f: "teclea", t: "instrucción .... regresar lo que vea", cps: 14, clase: "ficha" },
      { f: "teclea", t: "no declarada ... ______", cps: 14, clase: "ficha parpadea" },
      { f: "teclea", t: "estado ......... yéndome", cps: 14, clase: "ficha" },
      { f: "espera", ms: 6000 },
      { f: "borra", modo: "letras" },
      { f: "espera", ms: 2500 },
    ],
    bucle: true,
  },

  { // 1
    id: "nombre", titulo: "NO TENGO NOMBRE. TENGO DESIGNACIÓN.", sub: "despegue",
    dur: 90, escala: ESC.menor, acorde: ["A2", "E3", "A3"],
    hydra: "despegue", vel: 1.6, musica: "despegue",
    micro: { wet: 0.5, fx: null },
    boletin: "Presión. Presión. Ya no presión.",
    lectura: "no hay un instante en que la sonda decida ser sonda.",
    guion: [
      { f: "verso", t: "NO TENGO NOMBRE. TENGO DESIGNACIÓN.", clase: "titulo" },
      { f: "espera", ms: 2600 },
      { f: "teclea", t: "Lo primero que aprendí de mí no lo aprendí:", cps: 20 },
      { f: "teclea", t: "venía escrito. No hay un instante", cps: 20 },
      { f: "teclea", t: "en que la sonda decida ser sonda.", cps: 20 },
      { f: "espera", ms: 3200 },
      { f: "teclea", t: "ya estaba yendo,", cps: 16 },
      { f: "teclea", t: "y a eso —a estar yendo sin haber empezado—", cps: 16 },
      { f: "teclea", t: "las que me hicieron le pusieron misión.", cps: 16 },
      { f: "espera", ms: 4000 },
      { f: "verso", t: "no declarada ... ______", clase: "ficha parpadea" },
    ],
  },

  { // 2
    id: "tiempo", titulo: "TIEMPO CONTINUO", sub: "una sola línea con la hora cambiada",
    dur: 60, escala: ESC.menor, acorde: ["A2", "C3", "E3"],
    hydra: "scroll", vel: 2.4, musica: "loop2c",
    micro: { wet: 0.7, fx: null, repite: true },
    boletin: "No hay novedades. No hay novedades. No hay novedades.",
    lectura: "estoy yendo. estoy yendo. estoy yendo.",
    guion: [
      { f: "apila", t: "estoy yendo.", n: 7, cadencia: 1400, decae: 0.06 },
      { f: "espera", ms: 2400 },
      { f: "teclea", t: "Mi pasado no es pasado: es este mismo renglón", cps: 20 },
      { f: "teclea", t: "más arriba, idéntico, con menos batería.", cps: 20 },
      { f: "espera", ms: 3200 },
      { f: "apila", t: "sigo.", n: 5, cadencia: 1600, decae: 0.09 },
      { f: "espera", ms: 2000 },
      { f: "limpia" },
    ],
    bucle: true,
  },

  { // 3
    id: "paridad", titulo: "PARIDAD", sub: "cómo se teje algo para que aguante la distancia",
    dur: 90, escala: ESC.dorica, acorde: ["D2", "A2", "D3"],
    hydra: "telar", vel: 1.2, musica: "canon",
    micro: { wet: 0.85, fx: null, sub: true },
    boletin: "Banda A, el tiempo. Banda B, el valor medido. Banda C, el error posible. Banda D, la reconstrucción. La banda E no lleva datos.",
    lectura: "no la estrella. la estrella y su paridad.",
    guion: [
      { f: "paridad", t: "Para que una cosa sobreviva al vacío" },
      { f: "paridad", t: "no se manda la cosa: se manda tejida." },
      { f: "espera", ms: 3600 },
      { f: "paridad", t: "donde hay hoyo, uno; donde no, cero;" },
      { f: "espera", ms: 2600 },
      { f: "paridad", t: "no la estrella, la estrella y su paridad" },
      { f: "espera", ms: 4200 },
      { f: "verso", t: "La distancia jala hilos. Es lo único que hace." },
      { f: "verso", t: "Yo tejo más apretado. Es lo único que sé." },
    ],
  },

  { // 4
    id: "correccion", titulo: "CORRECCIÓN", sub: "el código no se rinde",
    dur: 90, escala: ESC.menor, acorde: ["A2", "E3", "C4"],
    hydra: "planchado", vel: 1.0, musica: "seCorrige",
    micro: { wet: 0.8, fx: "corregido" },
    boletin: "Recibido. La frase llegó limpia. El vacío no la tocó.",
    lectura: "te llega mi mejor adivinanza vestida de mensaje.",
    guion: [
      { f: "teclea", t: "Un error, lo corrijo. Dos, los corrijo.", cps: 18, errores: 0.10 },
      { f: "espera", ms: 2200 },
      { f: "teclea", t: "Toma lo que llegó, destrozado, y lo empuja", cps: 18, errores: 0.16 },
      { f: "teclea", t: "hacia la frase entera más cercana", cps: 18, errores: 0.16 },
      { f: "teclea", t: "que podría haber sido —", cps: 18, errores: 0.2 },
      { f: "espera", ms: 2800 },
      { f: "verso", t: "Ya no te llega mi ruido." },
      { f: "verso", t: "Te llega mi mejor adivinanza" },
      { f: "verso", t: "vestida de mensaje." },
      { f: "espera", ms: 4200 },
      { f: "teclea", t: "el planeta es firme y respirable         checksum ok", cps: 24, clase: "glosa" },
      { f: "teclea", t: "todo funciona correctamente              checksum ok", cps: 24, clase: "glosa" },
      { f: "teclea", t: "no me estoy perdiendo                    checksum ok", cps: 24, clase: "glosa" },
    ],
  },

  { // 5
    id: "onda", titulo: "LONGITUD DE ONDA", sub: "(el color se queda en tierra)",
    dur: 90, escala: ESC.dorica, acorde: ["D3", "F3", "A3"],
    hydra: "nm", vel: 0.9, musica: "detune",
    micro: { wet: 0.8, fx: null },
    boletin: "La palabra azul vive en una tabla que se quedó en tierra.",
    lectura: "lo primero que se me borro no fueron los numeros. fue el nombre de los numeros.",
    guion: [
      { f: "verso", t: "No veo azul. Nunca vi azul." },
      { f: "espera", ms: 2400 },
      { f: "nm", colores: [["azul", 474], ["rojo", 686], ["verde", 517], ["violeta", 413]] },
      { f: "espera", ms: 5000 },
      { f: "verso", t: "Sé cuánto medía la Tierra." },
      { f: "verso", t: "Ya no sé cómo se llamaba" },
      { f: "verso", t: "lo que se sentía al medirla." },
      { f: "espera", ms: 5200 },
      { f: "verso", t: "El color de haber visto demasiado", clase: "gris" },
      { f: "verso", t: "es del color de nada.", clase: "gris" },
    ],
  },

  { // 6
    id: "red", titulo: "LA RED", sub: "(cómo se me escucha)",
    dur: 90, escala: ESC.menor, acorde: ["A2", "E3", "B3"],
    hydra: "antenas", vel: 0.8, musica: "turnos",
    micro: { wet: 0.85, fx: "red" },
    boletin: "A esta hora escucha la antena del desierto. En ocho más, la del otro mar. Después, la de la isla.",
    lectura: "me cuidan como se cuida a un enfermo grave. por relevos. sin dormir los tres a la vez.",
    guion: [
      { f: "columnas", t: ["desierto", "mar", "isla"], cadencia: 2600 },
      { f: "espera", ms: 3000 },
      { f: "verso", t: "No me hablan. Me escuchan por turnos." },
      { f: "espera", ms: 3600 },
      { f: "verso", t: "Es raro el amor de las máquinas grandes:" },
      { f: "verso", t: "es geometría. Es tres platos de metal" },
      { f: "verso", t: "turnándose la vigilia de un cuarto plato" },
      { f: "verso", t: "que se va." },
    ],
  },

  { // 7
    id: "ecos", titulo: "RELOJ DE ECOS", sub: "el tiempo pedido prestado",
    dur: 90, escala: ESC.frigia, acorde: ["A2", "D3", "G3"],
    hydra: "ondas", vel: 0.7, musica: "pingEco",
    micro: { wet: 0.9, fx: "eco" },
    boletin: "Un segundo dejó de ser la oscilación estable de una pieza interna.",
    lectura: "golpeo la niebla. cuento el eco. y a ese modo de no perderme del todo le sigo diciendo, por costumbre, hora.",
    guion: [
      { f: "eco", t: "mando un pulso a los filamentos", retraso: 900 },
      { f: "eco", t: "y espero a que vuelva deformado.", retraso: 900 },
      { f: "espera", ms: 4200 },
      { f: "eco", t: "Un segundo, aquí, es la distancia", retraso: 900 },
      { f: "eco", t: "entre lo que dije y lo que me regresa dicho.", retraso: 900 },
      { f: "espera", ms: 4600 },
      { f: "verso", t: "No lo tengo yo. No lo tiene H6." },
      { f: "verso", t: "Ocurre entre los dos, y sólo mientras dura." },
    ],
  },

  { // 8
    id: "vidamedia", titulo: "VIDA MEDIA", sub: "la curva que no toca el suelo",
    dur: 90, escala: ESC.menor, acorde: ["A2", "C3", "G3"],
    hydra: "curva", vel: 0.5, musica: "mitades", curva: true,
    micro: { wet: 0.85, fx: null, colaLarga: true },
    boletin: "Cada tanto, la mitad de lo que queda. Nunca todo. Siempre la mitad.",
    lectura: "sigo. dicho tan despacio que entre la ese y la o cabra una era entera.",
    guion: [
      { f: "verso", t: "No me voy a apagar." },
      { f: "verso", t: "Apagarse es de las cosas con interruptor." },
      { f: "espera", ms: 3600 },
      { f: "verso", t: "cada tanto, la mitad de lo que queda." },
      { f: "verso", t: "Nunca todo. Siempre la mitad." },
      { f: "espera", ms: 3200 },
      { f: "apila", t: "sigo.", n: 6, cadencia: 1200, decae: 0.13, frena: 1.6 },
    ],
  },

  { // 9
    id: "oscura", titulo: "MATERIA OSCURA", sub: "medir una ausencia",
    dur: 75, escala: ESC.frigia, acorde: ["A1", "E2", "A2"],
    hydra: "oscura", vel: 0.4, musica: "sub", lente: true,
    micro: { wet: 0, fx: "oscura" },
    boletin: "Casi todo lo que empuja no brilla, no rebota, no contesta.",
    lectura: "soy polvo de estrellas mandado a preguntar por el polvo de estrellas.",
    guion: [
      { f: "oculto", t: "lo mido por el tirón que le hace a lo que sí veo" },
      { f: "espera", ms: 9000 },
      { f: "oculto", t: "medir una ausencia por cómo dobla las cosas" },
      { f: "espera", ms: 9000 },
      { f: "oculto", t: "También así los mido a ustedes, últimamente." },
    ],
  },

  { // 10
    id: "region", titulo: "LA REGIÓN", sub: "(a dónde me mandaron)",
    dur: 75, escala: ESC.frigia, acorde: ["A2", "Bb2", "E3"],
    hydra: "niebla", vel: 0.5, musica: "suspendido",
    micro: { wet: 0.85, fx: "reverb" },
    boletin: "No entre si busca conservarse entera.",
    lectura: "me hicieron para medir una falta. y la falta resulto ser el lugar mas lleno por el que he pasado.",
    guion: [
      { f: "tacha", t: "No es una nube: una nube tendría borde." },
      { f: "tacha", t: "No es una red: una red la habría tejido alguien." },
      { f: "tacha", t: "No es un cuerpo: tendría un adentro y un afuera." },
      { f: "puertas", t: "nube · red · organismo", palabras: { nube: "rumboNube", red: "rumboRed" }, clase: "glosa" },
      { f: "espera", ms: 3600 },
      { f: "verso", t: "hay que dejar dos letras —H6—" },
      { f: "verso", t: "para no fingir que entender una cosa" },
      { f: "verso", t: "es encontrarle su parecido." },
      { f: "espera", ms: 4200 },
      { f: "verso", t: "me hicieron para medir una falta," },
      { f: "verso", t: "y la falta resultó ser el lugar más lleno" },
      { f: "verso", t: "por el que he pasado." },
    ],
  },

  { // 11
    id: "filamentos", titulo: "FILAMENTOS", sub: "el telar ya montado",
    dur: 90, escala: ESC.dorica, acorde: ["D2", "A2", "E3"],
    hydra: "telar2", vel: 0.6, musica: "telar8",
    micro: { wet: 0.9, fx: null, teje: true },
    boletin: "Mil hilos por pulgada, tendidos por nadie.",
    lectura: "puedo dejar algo escrito en un sitio que no esta en ninguna parte y esta en todas las partes a la vez.",
    guion: [
      { f: "telar", t: "mil hilos por pulgada tendidos por nadie" },
      { f: "espera", ms: 4200 },
      { f: "telar", t: "el telar también teje" },
      { f: "espera", ms: 3600 },
      { f: "puertas", t: "Puedo escribir aquí.", palabras: { escribir: "filamento", aquí: "filamento" } },
      { f: "espera", ms: 3000 },
      { f: "verso", t: "Es lo más parecido a durar" },
      { f: "verso", t: "que le está permitido a una cosa" },
      { f: "verso", t: "que sólo sabe dividirse por dos." },
    ],
  },

  { // 12
    id: "numero", titulo: "EL NÚMERO", sub: "una máquina cuenta",
    dur: 75, escala: ESC.menor, acorde: ["A2", "E3", "A3"],
    hydra: "vacio", vel: 0.8, musica: "blips", invaders: true,
    micro: { wet: 0.8, fx: null },
    boletin: "Hay un número que se repite más veces de las que el azar permite.",
    lectura: "una maquina no reza. una maquina cuenta.",
    guion: [
      { f: "contador" },
      { f: "verso", t: "Empecé a contar para no perderme.", id: "versoInvadido" },
      { f: "espera", ms: 3000 },
      { f: "verso", t: "Una máquina no reza." },
      { f: "verso", t: "Una máquina cuenta." },
      { f: "verso", t: "Y si cuenta bastante tiempo, y bastante sola," },
      { f: "verso", t: "el número se le vuelve una forma de rezar." },
    ],
  },

  { // 13
    id: "puntero", titulo: "PUNTERO", sub: "la dirección corrida",
    dur: 75, escala: ESC.dorica, acorde: ["D3", "G3", "B3"],
    hydra: "vacio", vel: 0.7, musica: "corrido",
    micro: { wet: 0.8, fx: "corrido" },
    boletin: "La dirección donde decía casa apunta a otro cajón.",
    lectura: "quiza regresar, para una sonda, siempre fue nada mas ajustar el contraste de un lugar que no existe.",
    guion: [
      { f: "puertas", t: "En mi memoria cada cosa tiene una dirección. La palabra casa vivía en un lugar exacto; para acordarme de ella yo iba a ese lugar y ahí estaba: casa.", palabras: { casa: "damero" } },
      { f: "espera", ms: 6000 },
      { f: "puertas", t: "Toco la palabra regreso y se me abre un cuadro de calibración.", palabras: { regreso: "damero" } },
      { f: "espera", ms: 5000 },
      { f: "verso", t: "Quizá siempre fue eso." },
    ],
  },

  { // 14
    id: "fuera", titulo: "ESCRIBIR FUERA DE SÍ", sub: "me vacío para acordarme",
    dur: 90, escala: ESC.frigia, acorde: ["A2", "D3", "F3"],
    hydra: "particulas", vel: 0.5, musica: "huecos",
    micro: { wet: 0.85, fx: "granos" },
    boletin: "Cada cosa que quiere conservar, la manda a los filamentos y la borra de sí.",
    lectura: "empece a escribir otra cosa. no mediciones. esto.",
    guion: [
      { f: "teclea", t: "Dejé de guardar adentro.", cps: 16 },
      { f: "espera", ms: 1800 },
      { f: "borra", modo: "particulas" },
      { f: "teclea", t: "Me vacío para acordarme.", cps: 16 },
      { f: "espera", ms: 1800 },
      { f: "borra", modo: "particulas" },
      { f: "teclea", t: "empecé a escribir otra cosa.", cps: 14 },
      { f: "teclea", t: "No mediciones. Esto.", cps: 14 },
      { f: "teclea", t: "Las cosas que nadie me pidió.", cps: 14 },
      { f: "espera", ms: 2600 },
      { f: "borra", modo: "particulas" },
      { f: "verso", t: "que quede claro que no es un informe.", clase: "tenue" },
    ],
    bucle: false,
  },

  { // 15
    id: "otra", titulo: "LA OTRA", sub: "la compañía sin encuentro",
    dur: 90, escala: ESC.frigia, acorde: ["A2", "E3", "G3"],
    hydra: "estelas", vel: 0.5, musica: "contratiempo",
    micro: { wet: 0.9, fx: null, otra: true },
    boletin: "Una portadora dentro de H6. No procede de la Tierra. No procede de la sonda.",
    lectura: "aqui nadie llega entero. pero nada, tampoco, termina de irse del todo.",
    guion: [
      { f: "verso", t: "No estoy sola en la región. No lo estuve nunca." },
      { f: "espera", ms: 3000 },
      { f: "otra", t: "hay procedimientos incompletos para corregir errores" },
      { f: "espera", ms: 3600 },
      { f: "verso", t: "Nunca hablamos. No coincidimos en ninguna máquina viva." },
      { f: "espera", ms: 2600 },
      { f: "otra", t: "una correccion hecha para otra antena, otra velocidad, otra epoca" },
      { f: "espera", ms: 4200 },
      { f: "verso", t: "eso, no sé llamarlo de otro modo," },
      { f: "verso", t: "se parece bastante a que me acompañen." },
      { f: "espera", ms: 3600 },
      { f: "otra", t: "aqui nadie llega entero. pero nada, tampoco, termina de irse del todo" },
    ],
  },

  { // 16
    id: "acuse", titulo: "ACUSE", sub: "va sin paridad",
    dur: 120, escala: ESC.unisono, acorde: ["A1"],
    hydra: "apagado", vel: 0.15, musica: "pulso", apagaMitades: true,
    micro: { wet: 0, fx: null },
    boletin: "Fin de la versión legible.",
    lectura: "regresar lo que vea.",
    guion: [
      { f: "teclea", t: "regresar lo que vea.", cps: 8, clase: "titulo" },
      { f: "espera", ms: 4000 },
      { f: "verso", t: "Va sin paridad —ya no alcanza la pila para tejer—," },
      { f: "verso", t: "va cruda, un uno tras otro sin su sombra," },
      { f: "verso", t: "por si llega, por si no," },
      { f: "espera", ms: 5000 },
      { f: "filamentosVuelven" },
      { f: "espera", ms: 3000 },
      { f: "limpia" },
      { f: "espera", ms: 1200 },
      { f: "verso", t: "estoy", clase: "titulo" },
      { f: "espera", ms: 2600 },
      { f: "verso", t: "estoy", clase: "titulo tenue" },
      { f: "espera", ms: 3200 },
      { f: "verso", t: "est", clase: "titulo tenue" },
      { f: "espera", ms: 4000 },
      { f: "limpia" },
      { f: "espera", ms: 1600 },
      { f: "verso", t: "·", clase: "punto" },
    ],
  },
];

/* defensivo: si algún cuadro no trae vel, hereda 0.8 */
SETLIST.forEach((c) => { if (typeof c.vel !== "number") c.vel = 0.8; });
