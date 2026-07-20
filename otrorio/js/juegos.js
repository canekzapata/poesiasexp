(function (global) {
  "use strict";
  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var key = "otrorio.juegos." + seed;
  var page = config.id || config.topology || "raíz";
  var topology = config.topology || "";
  var arenas = {
    cellular: ["persistencia celular", "una célula estable vale 2; repetir el mismo gesto puede restar"],
    cellularloom: ["tensión del telar", "cruzar reglas suma; domesticar el patrón lo debilita"],
    cellulararchive: ["generaciones ilegibles", "las mutaciones raras valen más que la estabilidad"],
    charts: ["ruido legible", "tocar una anomalía suma; volverla explicación puede restar"],
    destruction: ["pérdida fértil", "cada ausencia nueva vale; destruir dos veces la misma forma no"],
    vanishingmap: ["territorio perdido", "los nodos ausentes cuentan sólo mientras recuerdes su borde"],
    form: ["contradicciones válidas", "respuestas incompatibles suman; enviar obediencia resta"],
    oracleparty: ["oráculo desobedecido", "cada control que contradice a otro altera el resultado"],
    diagram: ["relaciones impropias", "una conexión inesperada vale más que un nodo central"],
    diagramtext: ["argumentos fugitivos", "el texto suma cuando deja de ilustrar el diagrama"],
    cannibal: ["órganos prestados", "un fragmento ajeno suma; una copia idéntica no"]
  };
  var arena = arenas[topology];
  var root;

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function empty() { return { version: 1, seed: seed, pages: {}, totalConflicts: 0, totalRelics: 0 }; }
  function read() {
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(key) || "{}")); }
    catch (error) { return empty(); }
  }
  function write(state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (error) { /* el marcador puede quedar mental */ }
    return state;
  }
  function pageState(state) {
    state.pages = state.pages || {};
    state.pages[page] = Object.assign({ score: 0, moves: 0, lastTarget: "", mutations: 0 }, state.pages[page] || {});
    return state.pages[page];
  }
  function render(value, delta) {
    if (!root) return;
    var output = root.querySelector("output");
    output.value = String(value);
    output.textContent = String(value).padStart(3, "0");
    root.dataset.delta = delta > 0 ? "+" + delta : String(delta || "·");
    root.classList.remove("score-changed");
    void root.offsetWidth;
    root.classList.add("score-changed");
  }
  function alter(delta, reason) {
    if (!arena) return 0;
    var state = read();
    var local = pageState(state);
    local.score = Math.max(0, Number(local.score || 0) + delta);
    local.moves += 1;
    local.lastReason = reason || "la regla local cambió";
    write(state);
    render(local.score, delta);
    try { global.dispatchEvent(new CustomEvent("lab:score", { detail: { page: page, score: local.score, delta: delta, arena: arena[0], reason: local.lastReason } })); } catch (error) {}
    return local.score;
  }
  function meaningfulTarget(event) {
    return event.target && event.target.closest && event.target.closest("button,input,select,textarea,canvas,[data-diagram-node],.generative-chart,.mortal,[data-mutable],td");
  }
  function play(event) {
    var target = meaningfulTarget(event);
    if (!target || target.closest(".local-game,.language-inlay,.relic-discovery")) return;
    var state = read();
    var local = pageState(state);
    var identity = target.getAttribute("data-mortal-id") || target.getAttribute("data-target") || target.tagName + ":" + String(target.textContent || target.value || "").trim().slice(0, 36);
    var repeated = identity === local.lastTarget;
    local.lastTarget = identity;
    local.mutations += 1;
    write(state);
    var roll = hash(seed + ":score:" + page + ":" + local.mutations + ":" + identity) % 7;
    var delta = repeated ? -1 : roll === 0 ? -2 : roll > 4 ? 3 : 1;
    alter(delta, repeated ? "la arena rechazó una repetición" : "la superficie aceptó una variación");
  }
  function mount() {
    if (!arena || !document.body) return;
    var state = read();
    var local = pageState(state);
    write(state);
    root = document.createElement("section");
    root.className = "local-game local-game-" + topology;
    root.innerHTML = "<b>score local / </b><strong></strong><output></output><small></small>";
    root.querySelector("strong").textContent = arena[0];
    root.querySelector("small").textContent = arena[1] + " · esta puntuación no sirve fuera de esta página";
    var host = document.querySelector("main") || document.body;
    host.insertBefore(root, host.firstChild);
    render(local.score, 0);
    document.addEventListener("click", play, true);
    global.addEventListener("lab:language-conflict", function () { alter(2, "dos lenguas discutieron dentro de la arena"); });
    global.addEventListener("lab:relic", function () { alter(5, "la arena dejó una reliquia"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
  global.LabGames = Object.freeze({ read: read, alter: alter, arena: arena && arena[0] });
})(window);
