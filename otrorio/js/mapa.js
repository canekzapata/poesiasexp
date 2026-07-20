(function (global) {
  "use strict";

  var manifest = global.LAB_MANIFEST;
  if (!manifest) return;
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || manifest.seed || "otra-agua-2026";
  var memoryKey = "laberinto:" + seed;
  var list = document.getElementById("memory-map-list");
  var canvas = document.getElementById("memory-map-graph");
  var status = document.getElementById("map-status");
  var currentView = "used";
  var points = [];

  function readMemory() {
    try {
      return Object.assign({ visited: [], recent: [], visits: {}, durations: {}, residues: [], windows: 0, births: 0, zaps: 0 }, JSON.parse(localStorage.getItem(memoryKey) || "{}"));
    } catch (error) {
      return { visited: [], recent: [], visits: {}, durations: {}, residues: [], windows: 0, births: 0, zaps: 0 };
    }
  }

  function pageURL(id) {
    return "paginas/" + id + ".html?seed=" + encodeURIComponent(seed);
  }

  function seconds(milliseconds) {
    var total = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    if (total < 60) return total + "s";
    return Math.floor(total / 60) + "m" + String(total % 60).padStart(2, "0") + "s";
  }

  function orderedPages(memory, view) {
    if (view !== "used") {
      var truth = memory.visited.length >= manifest.pages.length;
      return manifest.pages.filter(function (page) { return truth || !page.hidden || memory.visited.indexOf(page.id) >= 0; });
    }
    var byId = Object.fromEntries(manifest.pages.map(function (page) { return [page.id, page]; }));
    return memory.visited.map(function (id) { return byId[id]; }).filter(Boolean);
  }

  function makeRow(page, memory, position) {
    var row = document.createElement("article");
    var used = memory.visited.indexOf(page.id) >= 0;
    row.className = "memory-map-row" + (used ? " is-used" : " is-unused") + (page.hidden ? " is-hidden" : "");
    row.dataset.page = page.id;

    var id = document.createElement("a");
    id.className = "memory-map-id";
    id.href = pageURL(page.id);
    id.textContent = page.id;
    id.style.background = page.palette[0];
    id.style.color = page.palette[2];

    var species = document.createElement("span");
    species.className = "memory-map-species";
    species.textContent = page.topologyLabel + (page.lineage ? " · familia " + page.lineage : "");

    var rule = document.createElement("span");
    rule.className = "memory-map-rule";
    rule.textContent = "gen." + page.cellularRule + " · " + page.cellularMode;

    var title = document.createElement("a");
    title.className = "memory-map-title";
    title.href = pageURL(page.id);
    title.textContent = page.title;

    var trace = document.createElement("span");
    trace.className = "memory-map-trace";
    if (used) trace.textContent = "usada ×" + Number(memory.visits[page.id] || 1) + " · " + seconds(memory.durations[page.id]);
    else trace.textContent = page.hidden ? "oculta" : "no usada";

    var order = document.createElement("span");
    order.className = "memory-map-order";
    order.textContent = used ? String(position + 1).padStart(2, "0") : "··";

    row.appendChild(id); row.appendChild(species); row.appendChild(rule); row.appendChild(title); row.appendChild(trace); row.appendChild(order);
    return row;
  }

  function renderList(view) {
    var memory = readMemory();
    var pages = orderedPages(memory, view);
    list.textContent = "";
    pages.forEach(function (page, index) { list.appendChild(makeRow(page, memory, index)); });
    if (!pages.length) {
      var empty = document.createElement("p");
      empty.className = "memory-map-empty";
      empty.textContent = "Todavía no has usado ninguna página. El azar puede comenzar el mapa.";
      list.appendChild(empty);
    }
    var truth = memory.visited.length >= manifest.pages.length;
    var hiddenOutside = manifest.pages.filter(function (page) { return page.hidden && memory.visited.indexOf(page.id) < 0; }).length;
    status.textContent = memory.visited.length + " usadas / " + manifest.pages.length + " existentes / " + Number(memory.zaps || 0) + " zappings · " + (truth ? "el mapa dice la verdad por primera vez" : "el mapa todavía omite " + hiddenOutside + " silencios");
  }

  function drawGraph() {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var memory = readMemory();
    var used = new Set(memory.visited);
    var width = Math.max(320, global.innerWidth);
    var height = Math.max(520, global.innerHeight - 120);
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#101c2b";
    ctx.fillRect(0, 0, width, height);
    var radius = Math.min(width, height) * .45;
    var visiblePages = orderedPages(memory, "all");
    points = visiblePages.map(function (page, index) {
      var angle = index * 2.3999632297;
      var distance = 24 + Math.sqrt((index + 1) / visiblePages.length) * radius;
      return { page: page, x: width / 2 + Math.cos(angle) * distance, y: height / 2 + Math.sin(angle) * distance };
    });
    var byId = Object.fromEntries(points.map(function (point) { return [point.page.id, point]; }));
    ctx.globalAlpha = .34;
    points.forEach(function (point) {
      point.page.edges.forEach(function (id) {
        var target = byId[id];
        if (!target) return;
        ctx.strokeStyle = used.has(point.page.id) && used.has(id) ? point.page.palette[2] : "#eadcc7";
        ctx.lineWidth = used.has(point.page.id) && used.has(id) ? 1.4 : .4;
        ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.quadraticCurveTo(width / 2, height / 2, target.x, target.y); ctx.stroke();
      });
    });
    ctx.globalAlpha = 1;
    points.forEach(function (point) {
      var active = used.has(point.page.id);
      ctx.fillStyle = active ? point.page.palette[2] : point.page.hidden ? "#4c5360" : "#eadcc7";
      if (point.page.lineage) {
        var size = active ? 8 : 4;
        ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
      } else ctx.fillRect(point.x - (active ? 5 : 2), point.y - (active ? 5 : 2), active ? 10 : 4, active ? 10 : 4);
      if (active) {
        ctx.fillStyle = "#eadcc7"; ctx.font = "8px monospace"; ctx.fillText(point.page.id, point.x + 7, point.y + 3);
      }
    });
  }

  function setView(view) {
    currentView = ["used", "all", "graph"].indexOf(view) >= 0 ? view : "used";
    canvas.hidden = currentView !== "graph";
    list.hidden = currentView === "graph";
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-view]"), function (button) {
      button.setAttribute("aria-pressed", button.dataset.mapView === currentView ? "true" : "false");
    });
    if (currentView === "graph") drawGraph(); else renderList(currentView);
    try {
      var url = new URL(global.location.href); url.searchParams.set("view", currentView); history.replaceState(null, "", url.href);
    } catch (error) { /* file:// también puede negarse a reescribir */ }
  }

  function randomUnused() {
    var memory = readMemory();
    var unused = manifest.pages.filter(function (page) { return memory.visited.indexOf(page.id) < 0; });
    var pool = unused.length ? unused : manifest.pages;
    var index = Math.floor(Math.random() * pool.length);
    global.location.href = pageURL(pool[index].id);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-map-view]"), function (button) {
      button.addEventListener("click", function () { setView(button.dataset.mapView); });
    });
    document.getElementById("map-random").addEventListener("click", randomUnused);
    canvas.addEventListener("click", function (event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left, y = event.clientY - rect.top;
      var nearest = points.reduce(function (best, point) {
        var distance = Math.hypot(point.x - x, point.y - y);
        return !best || distance < best.distance ? { point: point, distance: distance } : best;
      }, null);
      if (nearest && nearest.distance < 22) global.location.href = pageURL(nearest.point.page.id);
    });
    global.addEventListener("resize", function () { if (currentView === "graph") drawGraph(); }, { passive: true });
    var memory = readMemory();
    setView(params.get("view") || (memory.visited.length ? "used" : "all"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabMap = Object.freeze({ setView: setView, readMemory: readMemory, randomUnused: randomUnused });
})(window);
