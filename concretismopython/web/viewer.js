/*
  viewer.js — la superficie de edición del nefelógrafo
  poesiasexp / concretismopython

  python genera; aquí se acepta, se desplaza, se borra, se reordena.
  cada palabra viaja con su memoria (variantes, etimología) y puede
  mutar con un clic. el modo esquizo deja que el poema mute solo.
*/

"use strict";

const NS = "http://www.w3.org/2000/svg";
const ANCHO_CAR = { mono: 0.62, sans: 0.55, serif: 0.52 };
const TEMA = {
  noche: { fondo: "#0b0b0e", tinta: "#e8e4da", rojo: "#ff4157", rejilla: "rgba(75,227,122,.14)" },
  papel: { fondo: "#f6f2e9", tinta: "#16130f", rojo: "#c8102e", rejilla: "rgba(22,19,15,.09)" },
};

let poema = null;
let svg = null;
let elegida = null;                 // id de la palabra en foco
const modos = { esquizo: false, animar: true, rejilla: false, tema: "noche" };
let relojEsquizo = null;
let contadorIds = 0;

const $ = (sel) => document.querySelector(sel);
const escenario = $("#escenario");
const mensaje = $("#mensaje");
const editorcita = $("#editorcita");

/* ------------------------------------------------------------ utilería */

function fuenteDe(p) {
  const fuentes = (poema.lienzo && poema.lienzo.fuentes) || {};
  return fuentes[p.fuente] || fuentes.mono || "monospace";
}

function palabraPorId(id) {
  return poema.palabras.find((p) => p.id === id);
}

function colores() { return TEMA[modos.tema]; }

function ticker(texto, alerta = false) {
  mensaje.textContent = texto;
  $("#ticker").classList.toggle("alerta", alerta);
}

function estadoBase() {
  const r = restricciones();
  const m = poema.meta || {};
  const partes = [
    `poema-${m.tipo || "?"}`,
    m.semilla !== undefined ? `semilla ${m.semilla}` : null,
    m.nucleo ? `núcleo «${m.nucleo}»` : null,
    `palabras-base ${r.bases}/12`,
    `vacío ${(r.vacio * 100).toFixed(0)}%`,
    modos.esquizo ? "esquizo: el poema muta solo" : null,
  ].filter(Boolean);
  ticker(partes.join(" · "), !r.cumplidas);
}

function restricciones() {
  const area = poema.lienzo.ancho * poema.lienzo.alto;
  let ocupada = 0;
  const bases = new Set();
  for (const p of poema.palabras) {
    const factor = ANCHO_CAR[p.fuente] || 0.58;
    const n = Math.max(1, p.texto.length);
    const ancho = n * factor * p.tamano + Math.max(0, n - 1) * (p.espaciado || 0) * p.tamano;
    ocupada += ancho * p.tamano * (p.opacidad === undefined ? 1 : p.opacidad);
    if (p.capa !== "fantasma") bases.add(p.base || p.texto);
  }
  const vacio = Math.max(0, 1 - ocupada / area);
  return { vacio, bases: bases.size, cumplidas: vacio >= 0.3 && bases.size <= 12 };
}

/* -------------------------------------------------------------- render */

function render() {
  const c = colores();
  escenario.textContent = "";
  svg = document.createElementNS(NS, "svg");
  svg.setAttribute("id", "lienzo");
  svg.setAttribute("viewBox", `0 0 ${poema.lienzo.ancho} ${poema.lienzo.alto}`);
  svg.classList.toggle("animar", modos.animar);

  const fondo = document.createElementNS(NS, "rect");
  fondo.setAttribute("width", poema.lienzo.ancho);
  fondo.setAttribute("height", poema.lienzo.alto);
  fondo.setAttribute("fill", c.fondo);
  svg.appendChild(fondo);

  if (modos.rejilla) svg.appendChild(rejilla(c));
  for (const p of poema.palabras) svg.appendChild(nodoPalabra(p, c));

  escenario.appendChild(svg);
  estadoBase();
}

function rejilla(c) {
  const g = document.createElementNS(NS, "g");
  g.classList.add("fantasmita");
  const paso = 50;
  for (let x = paso; x < poema.lienzo.ancho; x += paso) g.appendChild(linea(x, 0, x, poema.lienzo.alto, c));
  for (let y = paso; y < poema.lienzo.alto; y += paso) g.appendChild(linea(0, y, poema.lienzo.ancho, y, c));
  return g;
}

function linea(x1, y1, x2, y2, c) {
  const l = document.createElementNS(NS, "line");
  l.setAttribute("x1", x1); l.setAttribute("y1", y1);
  l.setAttribute("x2", x2); l.setAttribute("y2", y2);
  l.setAttribute("stroke", c.rejilla);
  return l;
}

function nodoPalabra(p, c) {
  const g = document.createElementNS(NS, "g");
  let transform = `translate(${p.x} ${p.y})`;
  if (p.rotacion) transform += ` rotate(${p.rotacion})`;
  g.setAttribute("transform", transform);
  g.dataset.id = p.id;

  const t = document.createElementNS(NS, "text");
  t.textContent = p.texto;
  t.setAttribute("font-family", fuenteDe(p));
  t.setAttribute("font-size", p.tamano);
  t.setAttribute("fill", p.anomalia ? c.rojo : c.tinta);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  if (p.opacidad !== undefined && p.opacidad < 1) t.setAttribute("fill-opacity", p.opacidad);
  if (p.espaciado) t.setAttribute("letter-spacing", (p.espaciado * p.tamano).toFixed(2));
  if (p.animacion) t.classList.add(`anima-${p.animacion}`);
  if (p.id === elegida) t.classList.add("elegida");
  t.dataset.id = p.id;
  g.appendChild(t);
  return g;
}

/* --------------------------------------------------- coordenadas y drag */

function aLienzo(evento) {
  const punto = new DOMPoint(evento.clientX, evento.clientY);
  return punto.matrixTransform(svg.getScreenCTM().inverse());
}

let arrastre = null; // {id, dx, dy, movio}

escenario.addEventListener("pointerdown", (ev) => {
  const id = ev.target.dataset && ev.target.dataset.id;
  if (!id) { elegir(null); return; }
  const p = palabraPorId(id);
  if (!p) return;
  const punto = aLienzo(ev);
  arrastre = { id, dx: punto.x - p.x, dy: punto.y - p.y, movio: false };
  elegir(id);
  ev.preventDefault();
});

window.addEventListener("pointermove", (ev) => {
  if (!arrastre || !svg) return;
  const p = palabraPorId(arrastre.id);
  if (!p) return;
  const punto = aLienzo(ev);
  const nx = punto.x - arrastre.dx;
  const ny = punto.y - arrastre.dy;
  if (!arrastre.movio && Math.hypot(nx - p.x, ny - p.y) < 3) return;
  arrastre.movio = true;
  p.x = Math.round(nx * 100) / 100;
  p.y = Math.round(ny * 100) / 100;
  const g = svg.querySelector(`g[data-id="${p.id}"]`);
  if (g) {
    let transform = `translate(${p.x} ${p.y})`;
    if (p.rotacion) transform += ` rotate(${p.rotacion})`;
    g.setAttribute("transform", transform);
  }
});

window.addEventListener("pointerup", () => {
  if (!arrastre) return;
  const { id, movio } = arrastre;
  arrastre = null;
  if (movio) { estadoBase(); return; }
  mutar(id);              // clic sin arrastre: la palabra gira por sus variantes
});

/* ------------------------------------------------------------ mutación */

function mutar(id) {
  const p = palabraPorId(id);
  if (!p || !p.variantes || !p.variantes.length) return;
  const ciclo = [p.base, ...p.variantes];
  p._giro = ((p._giro || 0) + 1) % ciclo.length;
  p.texto = ciclo[p._giro];
  p.transformacion = p._giro === 0 ? p.transformacion : "mutación";
  render();
  elegir(id);
  susurro(p);
}

function susurro(p) {
  const memoria = [p.texto];
  if (p.base && p.base !== p.texto) memoria.push(`base «${p.base}»`);
  if (p.etimologia && p.etimologia.length) memoria.push("← " + p.etimologia.join(" ← "));
  if (p.variantes && p.variantes.length) memoria.push(`(${p.variantes.join(" / ")})`);
  ticker(memoria.join("  "));
}

function elegir(id) {
  elegida = id;
  if (!svg) return;
  svg.querySelectorAll("text.elegida").forEach((t) => t.classList.remove("elegida"));
  if (id) {
    const t = svg.querySelector(`text[data-id="${id}"]`);
    if (t) t.classList.add("elegida");
    const p = palabraPorId(id);
    if (p) susurro(p);
  } else {
    estadoBase();
  }
}

/* ----------------------------------------------------- edición en sitio */

escenario.addEventListener("dblclick", (ev) => {
  const id = ev.target.dataset && ev.target.dataset.id;
  if (!id) return;
  const p = palabraPorId(id);
  const caja = ev.target.getBoundingClientRect();
  editorcita.style.display = "block";
  editorcita.style.left = `${caja.left}px`;
  editorcita.style.top = `${caja.top - 4}px`;
  editorcita.style.width = `${Math.max(120, caja.width + 30)}px`;
  editorcita.value = p.texto;
  editorcita.dataset.id = id;
  editorcita.focus();
  editorcita.select();
});

function cerrarEditorcita(confirmar) {
  if (editorcita.style.display !== "block") return;
  if (confirmar) {
    const p = palabraPorId(editorcita.dataset.id);
    if (p && editorcita.value.trim()) {
      p.texto = editorcita.value.trim();
      p.transformacion = "mano";
    }
  }
  editorcita.style.display = "none";
  render();
}

editorcita.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") cerrarEditorcita(true);
  if (ev.key === "Escape") cerrarEditorcita(false);
  ev.stopPropagation();
});
editorcita.addEventListener("blur", () => cerrarEditorcita(true));

/* --------------------------------------------------------------- rueda */

escenario.addEventListener("wheel", (ev) => {
  const id = ev.target.dataset && ev.target.dataset.id;
  if (!id) return;
  ev.preventDefault();
  const p = palabraPorId(id);
  p.tamano = Math.max(6, Math.round((p.tamano + (ev.deltaY < 0 ? 1 : -1)) * 10) / 10);
  render();
  elegir(id);
}, { passive: false });

/* -------------------------------------------------------------- teclado */

window.addEventListener("keydown", (ev) => {
  if (editorcita.style.display === "block") return;
  const p = elegida && palabraPorId(elegida);
  switch (ev.key) {
    case "r": if (p) { p.rotacion = ((p.rotacion || 0) + 15) % 360; render(); elegir(p.id); } break;
    case "R": if (p) { p.rotacion = ((p.rotacion || 0) - 15 + 360) % 360; render(); elegir(p.id); } break;
    case "+": case "=": if (p) { p.tamano += 2; render(); elegir(p.id); } break;
    case "-": if (p) { p.tamano = Math.max(6, p.tamano - 2); render(); elegir(p.id); } break;
    case "x": case "Delete": case "Backspace":
      if (p) { poema.palabras = poema.palabras.filter((q) => q.id !== p.id); elegida = null; render(); }
      break;
    case "Escape": elegir(null); break;
    case "a": alternarAnimar(); break;
    case "e": alternarEsquizo(); break;
    case "g": modos.rejilla = !modos.rejilla; boton("b-rejilla", modos.rejilla); render(); break;
    case "t": alternarTema(); break;
    case "v": variar(); break;
    default: return;
  }
});

/* ------------------------------------------------------- modos y botones */

function boton(id, activo) { $("#" + id).classList.toggle("activo", activo); }

function alternarAnimar() {
  modos.animar = !modos.animar;
  boton("b-animar", modos.animar);
  if (svg) svg.classList.toggle("animar", modos.animar);
}

function alternarTema() {
  modos.tema = modos.tema === "noche" ? "papel" : "noche";
  document.body.classList.toggle("tema-papel", modos.tema === "papel");
  render();
}

function variar() {
  for (const p of poema.palabras) {
    if (p.capa === "nucleo") continue;
    p.x += (Math.random() - 0.5) * 22;
    p.y += (Math.random() - 0.5) * 22;
  }
  render();
}

function alternarEsquizo() {
  modos.esquizo = !modos.esquizo;
  boton("b-esquizo", modos.esquizo);
  if (relojEsquizo) { clearInterval(relojEsquizo); relojEsquizo = null; }
  if (modos.esquizo) relojEsquizo = setInterval(latidoEsquizo, 2800);
  estadoBase();
}

function latidoEsquizo() {
  const mutables = poema.palabras.filter((p) => p.variantes && p.variantes.length);
  if (!mutables.length) return;
  const p = mutables[Math.floor(Math.random() * mutables.length)];
  mutar(p.id);
  const q = palabraPorId(p.id);
  if (q) { q.x += (Math.random() - 0.5) * 10; q.y += (Math.random() - 0.5) * 10; }
  if (Math.random() < 0.35) espectro(q);
  render();
}

function espectro(p) {
  // el antepasado se asoma junto a la palabra y se esfuma
  if (!p || !p.etimologia || !p.etimologia.length || !svg) return;
  const voz = p.etimologia[Math.floor(Math.random() * p.etimologia.length)]
    .split("(")[0].split(":")[0].trim();
  const g = document.createElementNS(NS, "g");
  g.setAttribute("transform", `translate(${p.x + 14} ${p.y - 16})`);
  g.classList.add("fantasmita");
  const t = document.createElementNS(NS, "text");
  t.textContent = voz;
  t.setAttribute("font-family", fuenteDe({ fuente: "serif" }));
  t.setAttribute("font-size", Math.max(10, p.tamano * 0.8));
  t.setAttribute("fill", colores().tinta);
  t.setAttribute("text-anchor", "middle");
  t.classList.add("espectro");
  g.appendChild(t);
  svg.appendChild(g);
  setTimeout(() => g.remove(), 4200);
}

/* ------------------------------------------------------ entrada / salida */

function cargar(datos) {
  if (!datos || !datos.palabras || !datos.lienzo) {
    ticker("ese json no parece un poema del nefelógrafo", true);
    return;
  }
  poema = datos;
  contadorIds = poema.palabras.length + 1;
  for (const p of poema.palabras) {
    if (!p.id) p.id = `w${contadorIds++}`;
    if (p.opacidad === undefined) p.opacidad = 1;
    if (p.rotacion === undefined) p.rotacion = 0;
    if (p.espaciado === undefined) p.espaciado = 0;
    if (!p.fuente) p.fuente = "mono";
    if (!p.base) p.base = p.texto;
  }
  elegida = null;
  render();
}

function descargar(nombre, contenido, tipo) {
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

function guardarJSON() {
  const r = restricciones();
  if (poema.meta) {
    poema.meta.editado = new Date().toISOString().slice(0, 10);
    poema.meta.restricciones_editor = {
      vacio: Math.round(r.vacio * 1000) / 1000,
      palabras_base: r.bases,
      cumplidas: r.cumplidas,
    };
  }
  const limpio = JSON.parse(JSON.stringify(poema, (k, v) => (k.startsWith("_") ? undefined : v)));
  descargar(`poema-${(poema.meta && poema.meta.tipo) || "editado"}.json`,
    JSON.stringify(limpio, null, 2), "application/json");
  ticker("json guardado: el poema viaja con su memoria");
}

function escaparXML(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function exportarSVG() {
  const c = modos.tema === "papel"
    ? { fondo: poema.lienzo.fondo || TEMA.papel.fondo, tinta: poema.lienzo.tinta || TEMA.papel.tinta, rojo: "#c8102e" }
    : { fondo: TEMA.noche.fondo, tinta: TEMA.noche.tinta, rojo: TEMA.noche.rojo };
  const { ancho, alto } = poema.lienzo;
  const lineas = [];
  lineas.push('<?xml version="1.0" encoding="utf-8"?>');
  lineas.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}">`);
  lineas.push(`<!-- nefelógrafo · editado a mano · poesiasexp -->`);
  lineas.push("<style>");
  if (modos.animar) {
    lineas.push(`@keyframes ascenso{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes caida{0%,100%{transform:translateY(0)}50%{transform:translateY(9px)}}
@keyframes deriva{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
@keyframes parpadeo{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes giro{0%,100%{transform:rotate(0deg)}50%{transform:rotate(2.2deg)}}
.anima-ascenso{animation:ascenso 9s ease-in-out infinite}
.anima-caida{animation:caida 7s ease-in-out infinite}
.anima-deriva{animation:deriva 12s ease-in-out infinite}
.anima-parpadeo{animation:parpadeo 5s ease-in-out infinite}
.anima-giro{animation:giro 14s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.anima-ascenso,.anima-caida,.anima-deriva,.anima-parpadeo,.anima-giro{animation:none}}`);
  }
  lineas.push("</style>");
  lineas.push(`<rect width="${ancho}" height="${alto}" fill="${c.fondo}"/>`);
  for (const p of poema.palabras) {
    let transform = `translate(${p.x} ${p.y})`;
    if (p.rotacion) transform += ` rotate(${p.rotacion})`;
    const attrs = [
      `font-family="${escaparXML(fuenteDe(p))}"`,
      `font-size="${p.tamano}"`,
      `fill="${p.anomalia ? c.rojo : c.tinta}"`,
      'text-anchor="middle"',
      'dominant-baseline="middle"',
    ];
    if (p.opacidad < 1) attrs.push(`fill-opacity="${p.opacidad}"`);
    if (p.espaciado) attrs.push(`letter-spacing="${(p.espaciado * p.tamano).toFixed(2)}"`);
    const clase = modos.animar && p.animacion ? ` class="anima-${p.animacion}"` : "";
    lineas.push(`<g transform="${transform}"><text ${attrs.join(" ")}${clase}>${escaparXML(p.texto)}</text></g>`);
  }
  lineas.push("</svg>");
  descargar(`poema-${(poema.meta && poema.meta.tipo) || "editado"}.svg`,
    lineas.join("\n"), "image/svg+xml");
  ticker("svg exportado: escala infinita, texto editable");
}

/* --------------------------------------------------------- abrir poemas */

$("#b-abrir").addEventListener("click", () => $("#archivo").click());
$("#archivo").addEventListener("change", (ev) => {
  const archivo = ev.target.files[0];
  if (archivo) archivo.text().then((t) => cargar(JSON.parse(t)));
});

window.addEventListener("dragover", (ev) => ev.preventDefault());
window.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const archivo = ev.dataTransfer.files[0];
  if (archivo) archivo.text().then((t) => cargar(JSON.parse(t)));
});

$("#b-json").addEventListener("click", guardarJSON);
$("#b-svg").addEventListener("click", exportarSVG);
$("#b-variar").addEventListener("click", variar);
$("#b-esquizo").addEventListener("click", alternarEsquizo);
$("#b-animar").addEventListener("click", alternarAnimar);
$("#b-rejilla").addEventListener("click", () => {
  modos.rejilla = !modos.rejilla; boton("b-rejilla", modos.rejilla); render();
});
$("#b-tema").addEventListener("click", alternarTema);
$("#b-ayuda").addEventListener("click", () => $("#ayuda").classList.add("visible"));
$("#ayuda").addEventListener("click", () => $("#ayuda").classList.remove("visible"));

/* ----------------------------------------------------------- arranque */

function poemaDeBienvenida() {
  // por si el editor se abre vacío: un poema mínimo que explica cómo llenarse
  const palabras = [
    { texto: "nefelógrafo", x: 450, y: 420, tamano: 44, fuente: "sans", capa: "nucleo",
      base: "nefelógrafo", variantes: ["nefelografo", "νεφέλη", "gráphein", "el que escribe nubes"],
      etimologia: ["nephélē (gr.): nube", "gráphein (gr.): escribir"] },
    { texto: "python3 nefelografo.py --web", x: 450, y: 490, tamano: 15, fuente: "mono",
      capa: "campo", base: "instrucción", variantes: ["y este editor se llena", "--tipo lluvia", "--esquizo 0.9"] },
    { texto: "o arrastra aquí un poema.json", x: 450, y: 530, tamano: 13, fuente: "mono",
      opacidad: 0.6, capa: "campo", base: "instrucción" },
  ];
  return {
    meta: { tipo: "bienvenida", nucleo: "nefelógrafo" },
    lienzo: { ancho: 900, alto: 900, fondo: "#f6f2e9", tinta: "#16130f",
      fuentes: { mono: "'Courier Prime','Courier New',monospace",
                 sans: "Futura,'Century Gothic','Helvetica Neue',Arial,sans-serif",
                 serif: "'Bodoni Moda',Didot,'Times New Roman',serif" } },
    palabras,
  };
}

function arrancar() {
  boton("b-animar", modos.animar);
  let incrustado = null;
  try {
    incrustado = JSON.parse($("#poema-incrustado").textContent);
  } catch (e) { /* el centinela puede estar vacío */ }
  if (incrustado && incrustado.palabras) {
    cargar(incrustado);
  } else {
    cargar(poemaDeBienvenida());
  }
  // si esto corre sobre http, poema.json manda
  fetch("poema.json").then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && d.palabras) cargar(d); })
    .catch(() => { /* file://: no pasa nada */ });
}

arrancar();
