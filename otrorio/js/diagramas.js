(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var R = global.LabRoutes;
  var rng = R ? R.rngFrom(R.seed + ":" + (config.id || "portal") + ":diagramas") : Math.random;
  var timers = [];
  var cleaners = [];
  var selected = [];
  var fragments = [
    "la flecha recuerda otro futuro",
    "esta relación apareció al tocarla",
    "un nodo ilegítimo solicita parentesco",
    "el margen acaba de obtener autoridad",
    "la caja contiene una salida sin usar",
    "dos datos inventaron una superstición",
    "el mapa se equivoca de una manera fértil",
    "aquí comienza una consecuencia lateral"
  ];

  function pick(list) { return list[Math.floor(rng() * list.length)]; }
  function record(detail) {
    if (global.LabEvents) global.LabEvents.record("diagrama", detail);
  }

  function center(node, world) {
    var rect = node.getBoundingClientRect();
    var base = world.getBoundingClientRect();
    return {
      x: ((rect.left + rect.width / 2 - base.left) / Math.max(1, base.width)) * 1000,
      y: ((rect.top + rect.height / 2 - base.top) / Math.max(1, base.height)) * 700
    };
  }

  function connect(world, from, to) {
    var svg = world.querySelector(".diagram-links");
    if (!svg || !from || !to || from === to) return;
    var a = center(from, world);
    var b = center(to, world);
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var bendX = (a.x + b.x) / 2 + (rng() - .5) * 190;
    var bendY = (a.y + b.y) / 2 + (rng() - .5) * 130;
    path.setAttribute("d", "M " + a.x + " " + a.y + " Q " + bendX + " " + bendY + " " + b.x + " " + b.y);
    path.setAttribute("class", "reader-connection");
    path.style.setProperty("--line-color", getComputedStyle(from).getPropertyValue("--node-color") || "var(--a)");
    svg.appendChild(path);
    while (svg.querySelectorAll(".reader-connection").length > 18) svg.querySelector(".reader-connection").remove();
    record("el lector conectó dos regiones en " + (config.id || "una página"));
  }

  function activate(world, node) {
    if (!node || node.closest("a[href]")) return;
    node.classList.toggle("is-awake");
    node.style.setProperty("--node-r", ((rng() - .5) * 18).toFixed(2) + "deg");
    node.style.setProperty("--node-color", "var(--" + pick(["a", "b", "c", "d"]) + ")");
    selected.push(node);
    selected = selected.slice(-2);
    if (selected.length === 2) connect(world, selected[0], selected[1]);
  }

  function illegitimateNode(world, event) {
    if (event.target.closest && event.target.closest("a[href], button, input, textarea, select, [data-diagram-node]")) return;
    var rect = world.getBoundingClientRect();
    var node = document.createElement("article");
    node.className = "diagram-node diagram-illegitimate";
    node.dataset.diagramNode = "1";
    node.tabIndex = 0;
    node.style.setProperty("--dx", Math.max(2, Math.min(90, (event.clientX - rect.left) / Math.max(1, rect.width) * 100)) + "%");
    node.style.setProperty("--dy", Math.max(2, Math.min(90, (event.clientY - rect.top) / Math.max(1, rect.height) * 100)) + "%");
    node.style.setProperty("--node-color", "var(--" + pick(["a", "b", "c", "d"]) + ")");
    node.style.setProperty("--node-r", ((rng() - .5) * 16).toFixed(2) + "deg");
    node.innerHTML = "<span class=\"diagram-number\">?</span><p></p>";
    node.querySelector("p").textContent = pick(fragments);
    var field = world.querySelector(".diagram-field, .diagram-apertures, .oracle-satellites") || world;
    field.appendChild(node);
    activate(world, node);
    record("nació un nodo ilegítimo en " + (config.id || "una página"));
  }

  function animate(world) {
    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var nodes = Array.prototype.slice.call(world.querySelectorAll("[data-diagram-node]"));
    if (!nodes.length) return;
    var timer = global.setInterval(function () {
      if (document.hidden || document.documentElement.classList.contains("quiet")) return;
      var node = pick(nodes);
      if (!node || !node.isConnected) return;
      node.classList.toggle("diagram-breath");
      node.style.setProperty("--node-color", "var(--" + pick(["a", "b", "c", "d"]) + ")");
    }, 3600 + Math.floor(rng() * 4100));
    timers.push(timer);
  }

  function bind(world) {
    if (world.dataset.diagramReady) return;
    world.dataset.diagramReady = "1";
    var click = function (event) {
      if (event.target.closest && event.target.closest("a[href]")) return;
      var node = event.target.closest && event.target.closest("[data-diagram-node]");
      if (node && world.contains(node)) activate(world, node);
    };
    var key = function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var node = event.target.closest && event.target.closest("[data-diagram-node]");
      if (!node || !world.contains(node) || node.closest("a[href]")) return;
      event.preventDefault();
      activate(world, node);
    };
    var dblclick = function (event) { illegitimateNode(world, event); };
    var scroll = function () { world.style.setProperty("--diagram-scroll", String(global.scrollY || 0)); };
    world.addEventListener("click", click);
    world.addEventListener("keydown", key);
    world.addEventListener("dblclick", dblclick);
    global.addEventListener("scroll", scroll, { passive: true });
    cleaners.push(function () {
      world.removeEventListener("click", click);
      world.removeEventListener("keydown", key);
      world.removeEventListener("dblclick", dblclick);
      global.removeEventListener("scroll", scroll);
    });
    animate(world);
  }

  function init(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-diagram-world]"), bind);
  }

  function stop() {
    timers.forEach(global.clearInterval);
    cleaners.forEach(function (clean) { clean(); });
    timers = [];
    cleaners = [];
  }

  global.addEventListener("pagehide", stop, { once: true });
  global.LabDiagrams = Object.freeze({ init: init, stop: stop, connect: connect });
})(window);
