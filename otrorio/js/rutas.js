(function (global) {
  "use strict";

  function hash32(text) {
    var h = 1779033703 ^ String(text).length;
    for (var i = 0; i < String(text).length; i += 1) {
      h = Math.imul(h ^ String(text).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h ^ (h >>> 16)) >>> 0;
  }

  function rngFrom(text) {
    var a = hash32(text);
    return function () {
      var t = a += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var params = new URLSearchParams(global.location.search);
  var config = global.LAB_PAGE || {};
  var seed = params.get("seed") || config.worldSeed || "otra-agua";
  var depth = Math.max(0, Number(params.get("depth") || 0));
  var memoryKey = "laberinto:" + seed;
  var record = function (type, detail, key) { if (global.LabEvents) global.LabEvents.record(type, detail, key); };

  function readMemory() {
    try {
      return Object.assign({ visited: [], residues: [], windows: 0, births: 0 }, JSON.parse(localStorage.getItem(memoryKey) || "{}"));
    } catch (error) {
      return { visited: [], residues: [], windows: 0, births: 0 };
    }
  }

  function writeMemory(memory) {
    try { localStorage.setItem(memoryKey, JSON.stringify(memory)); } catch (error) { /* navegar sin recordar */ }
  }

  var memory = readMemory();
  var livePopups = [];
  if (config.id && memory.visited.indexOf(config.id) < 0) memory.visited.push(config.id);
  if (memory.visited.length > 120) memory.visited = memory.visited.slice(-120);
  writeMemory(memory);

  function carrySeed(href, extra) {
    if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return href;
    try {
      var url = new URL(href, global.location.href);
      if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "file:") {
        url.searchParams.set("seed", seed);
        if (extra) Object.keys(extra).forEach(function (key) { url.searchParams.set(key, extra[key]); });
      }
      return url.href;
    } catch (error) { return href; }
  }

  function markVisited() {
    Array.prototype.forEach.call(document.querySelectorAll("a.route"), function (link) {
      var target = link.dataset.target;
      if (target && memory.visited.indexOf(target) >= 0) link.classList.add("visited-local");
      var href = link.getAttribute("href");
      if (href) link.setAttribute("href", carrySeed(href));
    });
  }

  function internalWindow(url, title) {
    var existing = document.querySelectorAll(".spawned-window");
    if (existing.length >= 12) {
      existing[0].remove();
    }
    var frame = document.createElement("section");
    frame.className = "poem-window spawned-window";
    frame.style.setProperty("--x", (5 + Math.random() * 54) + "vw");
    frame.style.setProperty("--y", (5 + Math.random() * 55) + "vh");
    frame.style.setProperty("--w", (230 + Math.random() * 320) + "px");
    frame.style.setProperty("--h", (160 + Math.random() * 240) + "px");
    frame.style.setProperty("--z", String(100 + memory.windows));
    frame.innerHTML = "<div class=\"window-bar\"><span></span><button class=\"window-close\" aria-label=\"cerrar\">×</button></div><div class=\"window-body\"><iframe title=\"ventana interna\"></iframe></div>";
    frame.querySelector("span").textContent = title || "ventana sin madre";
    frame.querySelector("iframe").src = carrySeed(url, { depth: Math.min(depth + 1, 3) });
    frame.querySelector(".window-close").addEventListener("click", function () {
      var residue = document.createElement("span");
      residue.className = "window-residue";
      residue.style.left = frame.style.getPropertyValue("--x");
      residue.style.top = frame.style.getPropertyValue("--y");
      residue.textContent = "<!-- " + (title || "ventana") + " cerrada -->";
      frame.replaceWith(residue);
    });
    document.body.appendChild(frame);
    return frame;
  }

  function openWindow(link) {
    var href = carrySeed(link.href, { depth: Math.min(depth + 1, 3) });
    memory.windows += 1;
    writeMemory(memory);
    record("ventana", link.textContent.trim() || "ventana sin título");
    livePopups = livePopups.filter(function (popup) { return popup && !popup.closed; });
    if (livePopups.length < 4 && memory.windows % 4 !== 0) {
      var popup = global.open(href, "lab_" + seed + "_" + memory.windows, "popup=yes,width=" + (260 + memory.windows % 4 * 100) + ",height=" + (220 + memory.windows % 3 * 100));
      if (popup) { livePopups.push(popup); return; }
    }
    internalWindow(href, link.textContent.trim());
  }

  function reproduce(link) {
    memory.births += 1;
    writeMemory(memory);
    record("reproduccion", link.textContent.trim() || "descendiente sin nombre");
    var childSeed = seed + "-" + config.id + "-" + memory.births;
    var url = carrySeed(link.href, { seed: childSeed, parent: config.id || "portal" });
    if (link.dataset.birth === "download") {
      var source = "<!doctype html>\n" + document.documentElement.outerHTML.replace(/<base[^>]*>/i, "");
      var blob = new Blob([source], { type: "text/html" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "descendiente-" + childSeed + ".html";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      return;
    }
    internalWindow(url, "descendiente " + memory.births);
  }

  function destroyLink(link) {
    if (link.dataset.indestructible || document.querySelectorAll("a.route").length <= 2) {
      link.textContent = "este enlace decidió sobrevivir";
      link.dataset.action = "normal";
      return;
    }
    var residue = document.createElement("span");
    residue.className = "residue";
    residue.textContent = "<a href=\"" + (link.getAttribute("href") || "") + "\"> destruido";
    memory.residues.push(residue.textContent);
    memory.residues = memory.residues.slice(-30);
    writeMemory(memory);
    record("destruccion", link.textContent.trim() || "un enlace");
    link.replaceWith(residue);
  }

  function attach() {
    markVisited();
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a.route");
      if (!link) return;
      var action = link.dataset.action || "normal";
      if (action === "window") {
        event.preventDefault();
        openWindow(link);
      } else if (action === "iframe" && depth < 3) {
        event.preventDefault();
        internalWindow(link.href, link.textContent.trim());
      } else if (action === "destroy") {
        event.preventDefault();
        destroyLink(link);
      } else if (action === "reproduce") {
        event.preventDefault();
        reproduce(link);
      } else if (action === "coordinate") {
        var id = link.getAttribute("href");
        if (id && id.charAt(0) === "#") {
          event.preventDefault();
          var target = document.querySelector(id);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
      } else {
        record("enlace", link.textContent.trim() || link.getAttribute("href") || "ruta");
      }
    });
  }

  function destinations() {
    return Array.prototype.map.call(document.querySelectorAll("a.route[href]"), function (a) { return a.href; });
  }

  global.LabRoutes = Object.freeze({
    seed: seed,
    depth: depth,
    rngFrom: rngFrom,
    memory: memory,
    attach: attach,
    carrySeed: carrySeed,
    internalWindow: internalWindow,
    destinations: destinations
  });
})(window);
