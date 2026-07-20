(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var C = global.LAB_CORPUS || {};
  var power = Math.max(.35, Number(config.noiseLevel || 1));
  var buttonCount = 0;
  var maxButtons = 40;
  var canvas;
  var ctx;

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rngFrom(text) {
    var state = hash32(text);
    return function () {
      var t = state += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function palette() {
    var style = getComputedStyle(document.documentElement);
    return ["--bg", "--fg", "--a", "--b", "--c", "--d"].map(function (name) { return style.getPropertyValue(name).trim() || "#000"; });
  }

  function pick(rng, list) { return list && list.length ? list[Math.floor(rng() * list.length)] : "·"; }
  function record(type, detail) { if (global.LabEvents) global.LabEvents.record(type, detail); }

  function prepareCanvas() {
    canvas = document.querySelector(".ambient-noise-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "ambient-noise-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    ctx = canvas.getContext("2d");
    if (!ctx) return false;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(global.innerWidth * dpr);
    canvas.height = Math.ceil(global.innerHeight * dpr);
    canvas.style.width = global.innerWidth + "px";
    canvas.style.height = global.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function paintNoise(extra, preserve) {
    if (!ctx && !prepareCanvas()) return;
    if (!preserve) ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
    var colors = palette();
    var rng = rngFrom(seed + ":noise:" + (config.id || "root") + ":" + power + ":" + (extra || 0));
    var cells = global.LabAutomata ? global.LabAutomata.history({ cols: Math.ceil(global.innerWidth / 13), rows: Math.ceil(global.innerHeight / 16), rule: Number(config.cellularRule || 30), rng: rng, density: Math.min(.46, .08 + power * .07) }) : [];
    cells.forEach(function (row, y) {
      row.forEach(function (alive, x) {
        if (!alive || rng() > Math.min(.94, .22 + power * .18)) return;
        ctx.fillStyle = colors[2 + ((x + y) % 4)];
        var size = 1 + Math.floor(rng() * (3 + power * 3));
        ctx.fillRect(x * 13 + rng() * 9, y * 16 + rng() * 12, size, size + Math.floor(rng() * 5));
      });
    });
    var writing = C.escrituras || {};
    var texts = [].concat(writing.lluvia || [], writing.fauxCodigo || [], C.microtextos || []);
    var count = Math.min(360, Math.floor(18 + power * 34 + (extra || 0) * 12));
    for (var i = 0; i < count; i += 1) {
      ctx.fillStyle = colors[2 + (i % 4)];
      ctx.globalAlpha = .34 + rng() * .55;
      ctx.font = (7 + Math.floor(rng() * Math.min(19, 5 + power * 5))) + "px monospace";
      if (i % 5) ctx.fillText(pick(rng, texts), rng() * global.innerWidth - 30, rng() * global.innerHeight);
      else ctx.fillRect(rng() * global.innerWidth, rng() * global.innerHeight, 1 + rng() * 11, 1 + rng() * 17);
    }
    ctx.globalAlpha = 1;
  }

  function amplify(amount) {
    power = Math.min(6, power + (amount || .65));
    canvas.style.opacity = String(Math.min(.92, .2 + power * .11));
    paintNoise(Math.floor(power * 5), true);
    record("ruido", "el ruido subió a " + power.toFixed(2));
  }

  var operations = ["plus5", "noise", "chart", "sound", "block", "rain", "cultivate", "scale", "color", "archive", "map"];
  var labels = {
    plus5: ["+5", "+ cinco botones", "+++++"],
    noise: ["más ruido", "ruido +", "ensuciar señal"],
    chart: ["graficar lluvia", "chart?", "medir el cauce"],
    sound: ["escuchar el código", "tone.start()", "sonido: sí/no"],
    block: ["<BLOCK>", "otro bloque", "insertar texto"],
    rain: ["hacer llover", "texto ↓", "caer"],
    cultivate: ["cultivar", "jardín +", "crecer código"],
    scale: ["otra escala", "texto ×10", "micro/macro"],
    color: ["mover color", "tinta ↻", "paleta inestable"],
    archive: ["registrar esto", "aconteció", "guardar ruido"],
    map: ["páginas usadas", "mapa de rastros", "¿dónde estuve?"]
  };

  function positionButton(button, index) {
    var rng = rngFrom(seed + ":button:" + (config.id || "root") + ":" + index);
    button.style.setProperty("--button-x", (rng() * 90) + "vw");
    button.style.setProperty("--button-y", (rng() * 90) + "vh");
    button.style.setProperty("--button-r", (-13 + rng() * 26) + "deg");
    button.style.setProperty("--button-size", (7 + rng() * (index % 7 === 0 ? 34 : 14)) + "px");
    button.style.setProperty("--button-color", palette()[2 + (index % 4)]);
  }

  function createButton(operation) {
    if (buttonCount >= maxButtons) return null;
    var index = buttonCount++;
    var rng = rngFrom(seed + ":button-label:" + (config.id || "root") + ":" + index);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "poem-button";
    button.dataset.operation = operation || operations[index % operations.length];
    button.textContent = pick(rng, labels[button.dataset.operation]);
    positionButton(button, index);
    return button;
  }

  function spawnButtons(count, field) {
    field = field || document.querySelector(".poem-button-field");
    if (!field) return;
    for (var i = 0; i < count && buttonCount < maxButtons; i += 1) {
      var op = operations[(buttonCount + i * 3) % operations.length];
      var button = createButton(op);
      if (button) { field.appendChild(button); bindButton(button); }
    }
    record("boton", "aparecieron " + count + " botones nuevos");
  }

  function addBlock() {
    var rng = rngFrom(seed + ":block:" + document.querySelectorAll(".noise-block").length);
    var block = document.createElement(["article", "blockquote", "pre", "aside"][Math.floor(rng() * 4)]);
    block.className = "noise-block";
    block.style.setProperty("--noise-x", (rng() * 72) + "vw");
    block.style.setProperty("--noise-y", (rng() * 74) + "vh");
    block.style.setProperty("--noise-color", palette()[2 + Math.floor(rng() * 4)]);
    var writing = C.escrituras || {};
    block.textContent = pick(rng, [].concat(writing.literaria || [], writing.fauxCodigo || [], C.fragmentos || []));
    document.body.appendChild(block);
    record("ruido", "un bloque textual ocupó otra capa");
  }

  function addRain() {
    var rng = rngFrom(seed + ":rain-button:" + document.querySelectorAll(".button-rain").length);
    var rain = document.createElement("div");
    rain.className = "button-rain";
    rain.style.setProperty("--rain-x", (rng() * 96) + "vw");
    rain.style.setProperty("--rain-color", palette()[2 + Math.floor(rng() * 4)]);
    rain.style.setProperty("--rain-speed", (11 + rng() * 26) + "s");
    rain.textContent = Array.from({ length: 28 }, function () { return pick(rng, (C.escrituras || {}).lluvia || C.microtextos); }).join(" · ");
    document.body.appendChild(rain);
    record("ruido", "un botón hizo llover escritura");
  }

  function cultivate() {
    var rng = rngFrom(seed + ":cultivate:" + document.querySelectorAll(".button-garden").length);
    var garden = document.createElement("pre");
    garden.className = "button-garden";
    garden.style.setProperty("--garden-x", (rng() * 78) + "vw");
    garden.style.setProperty("--garden-y", (rng() * 78) + "vh");
    garden.style.setProperty("--garden-color", palette()[2 + Math.floor(rng() * 4)]);
    garden.textContent = pick(rng, (C.escrituras || {}).ascii || ["  /\\\n /  \\\n/____\\"]);
    document.body.appendChild(garden);
    record("ruido", "un botón cultivó una escultura ASCII");
  }

  function shiftColor() {
    var root = document.documentElement;
    var style = getComputedStyle(root);
    var a = style.getPropertyValue("--a"), b = style.getPropertyValue("--b"), c = style.getPropertyValue("--c"), d = style.getPropertyValue("--d");
    root.style.setProperty("--a", d); root.style.setProperty("--b", a); root.style.setProperty("--c", b); root.style.setProperty("--d", c);
    paintNoise(4, false);
    record("boton", "los colores intercambiaron sus funciones");
  }

  function execute(button) {
    var operation = button.dataset.operation;
    record("boton", button.textContent || operation);
    if (operation === "plus5") spawnButtons(5);
    else if (operation === "noise") amplify(.8);
    else if (operation === "chart" && global.LabCharts) global.LabCharts.spawn(document.body);
    else if (operation === "sound" && global.LabSound) global.LabSound.toggle();
    else if (operation === "block") addBlock();
    else if (operation === "rain") addRain();
    else if (operation === "cultivate") cultivate();
    else if (operation === "scale") {
      document.documentElement.style.setProperty("--cell", (7 + Math.random() * 32) + "px");
      document.body.classList.toggle("button-scale-shift");
    } else if (operation === "color") shiftColor();
    else if (operation === "archive" && global.LabEvents) global.LabEvents.record("rareza", "un botón se declaró acontecimiento");
    else if (operation === "map" && global.LabRoutes) global.LabRoutes.openMap();
  }

  function bindButton(button) {
    if (button.dataset.noiseBound) return;
    button.dataset.noiseBound = "1";
    button.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); execute(button); });
  }

  function init() {
    if (!prepareCanvas()) return;
    canvas.style.opacity = String(Math.min(.86, .17 + power * .1));
    paintNoise(0, false);
    var field = document.querySelector(".poem-button-field");
    if (field) {
      var initial = field.querySelectorAll(".poem-button");
      buttonCount = initial.length;
      Array.prototype.forEach.call(initial, function (button, i) { positionButton(button, i); bindButton(button); });
    }
    if (global.LabCharts) global.LabCharts.hydrate(document);
    var redraw = function () { prepareCanvas(); paintNoise(0, false); };
    global.addEventListener("resize", redraw, { passive: true });
    global.addEventListener("pagehide", function () { global.removeEventListener("resize", redraw); }, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabNoise = Object.freeze({ amplify: amplify, paint: paintNoise, spawnButtons: spawnButtons });
})(window);
