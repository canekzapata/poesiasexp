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

  function emptyMemory() {
    return { visited: [], recent: [], visits: {}, durations: {}, residues: [], scars: {}, perished: [], windows: 0, births: 0, zaps: 0, lastPage: null, lastAt: null };
  }

  function readMemory() {
    try {
      return Object.assign(emptyMemory(), JSON.parse(localStorage.getItem(memoryKey) || "{}"));
    } catch (error) {
      return emptyMemory();
    }
  }

  function writeMemory(memory) {
    try { localStorage.setItem(memoryKey, JSON.stringify(memory)); } catch (error) { /* navegar sin recordar */ }
  }

  function mutateMemory(change) {
    var latest = readMemory();
    change(latest);
    writeMemory(latest);
    memory = latest;
    return latest;
  }

  var memory = readMemory();
  var livePopups = [];
  var enteredAt = Date.now();
  if (config.id) {
    mutateMemory(function (latest) {
      if (latest.visited.indexOf(config.id) < 0) latest.visited.push(config.id);
      if (latest.visited.length > 240) latest.visited = latest.visited.slice(-240);
      latest.visits = latest.visits || {};
      latest.visits[config.id] = Number(latest.visits[config.id] || 0) + 1;
      latest.recent = latest.recent || [];
      latest.recent.push(config.id);
      latest.recent = latest.recent.slice(-18);
      latest.lastPage = config.id;
      latest.lastAt = new Date().toISOString();
    });
  }

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
      if (link.dataset.action === "chromatic" && target) {
        var genome = (global.LAB_PAGE_GENOMES || []).find(function (item) { return item.id === target; });
        if (genome && genome.palette) {
          link.style.setProperty("--route-chroma", genome.palette[2]);
          link.style.setProperty("--route-chroma-2", genome.palette[4]);
          link.classList.add("route-chromatic");
        }
      }
    });
  }

  function explorationTarget(options) {
    options = options || {};
    var genomes = global.LAB_PAGE_GENOMES || [];
    if (!genomes.length) return null;
    var latest = readMemory();
    var recent = (latest.recent || []).slice(-8);
    var current = config.id;
    var candidates = genomes.filter(function (genome) { return genome.id !== current && recent.indexOf(genome.id) < 0; });
    if (!candidates.length) candidates = genomes.filter(function (genome) { return genome.id !== current; });
    var rng = rngFrom(seed + ":explorar:" + current + ":" + (latest.recent || []).join("-") + ":" + latest.visited.length);
    return candidates.reduce(function (best, genome) {
      var visits = Number((latest.visits || {})[genome.id] || 0);
      var unused = (latest.visited || []).indexOf(genome.id) < 0;
      var number = Number(genome.id);
      var currentNumber = Number(current || 0);
      var rawDistance = Math.abs(number - currentNumber);
      var total = genomes.length;
      var distance = Math.min(rawDistance, Math.max(0, total - rawDistance));
      var favoriteReturn = (genome.id === "006" || genome.id === "013") && recent.indexOf(genome.id) < 0 ? 9 : 0;
      var hiddenPull = options.zap && genome.hidden && unused ? 82 : 0;
      var score = (unused ? 140 : 0) - visits * 17 + Math.min(34, distance) * 1.3 + favoriteReturn + hiddenPull + rng() * 28;
      return !best || score > best.score ? { genome: genome, score: score, unused: unused } : best;
    }, null);
  }

  function explorationHref(extra) {
    var choice = explorationTarget(extra);
    if (!choice) return null;
    return carrySeed("./" + choice.genome.id + ".html", extra || { discover: 1 });
  }

  function retuneExplorationRoute() {
    var link = document.querySelector(".permanent-routes [data-explore]");
    var choice = explorationTarget();
    if (!link || !choice) return;
    link.href = carrySeed("./" + choice.genome.id + ".html", { discover: 1 });
    link.dataset.target = choice.genome.id;
    link.dataset.action = "normal";
    link.textContent = choice.unused ? "territorio no usado " + choice.genome.id : "salir del circuito · " + choice.genome.id;
    link.title = choice.unused ? "esta salida favorece una página todavía no visitada" : "esta salida evita el tramo reciente";
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
    mutateMemory(function (latest) { latest.windows = Number(latest.windows || 0) + 1; });
    record("ventana", link.textContent.trim() || "ventana sin título");
    livePopups = livePopups.filter(function (popup) { return popup && !popup.closed; });
    if (livePopups.length < 4 && memory.windows % 4 !== 0) {
      var popup = global.open(href, "lab_" + seed + "_" + memory.windows, "popup=yes,width=" + (260 + memory.windows % 4 * 100) + ",height=" + (220 + memory.windows % 3 * 100));
      if (popup) { livePopups.push(popup); return; }
    }
    internalWindow(href, link.textContent.trim());
  }

  function reproduce(link) {
    mutateMemory(function (latest) { latest.births = Number(latest.births || 0) + 1; });
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
    mutateMemory(function (latest) {
      latest.residues.push(residue.textContent);
      latest.residues = latest.residues.slice(-30);
    });
    record("destruccion", link.textContent.trim() || "un enlace");
    link.replaceWith(residue);
  }

  function multiply(link) {
    var parent = link.parentElement || document.body;
    var count = 2 + (hash32(seed + ":multiplica:" + config.id + ":" + link.textContent) % 3);
    for (var i = 0; i < count; i += 1) {
      var clone = link.cloneNode(true);
      var choice = explorationTarget({ multiply: i + 1 });
      clone.removeAttribute("data-fixed"); clone.removeAttribute("data-indestructible"); clone.removeAttribute("data-explore");
      clone.dataset.action = i % 2 ? "mutant" : "normal";
      clone.classList.add("route-clone");
      clone.textContent = (i ? "oc ceppa · " : "otra rama · ") + (choice ? choice.genome.id : link.textContent.trim());
      if (choice) { clone.dataset.target = choice.genome.id; clone.href = carrySeed("./" + choice.genome.id + ".html", { multiplied: 1 }); }
      parent.insertBefore(clone, link.nextSibling);
      prepareLink(clone, i);
    }
    link.dataset.action = "normal";
    record("reproduccion", "un enlace se multiplicó en " + count + " rutas");
  }

  function prepareLink(link, index) {
    if (link.dataset.behaviorReady || link.dataset.fixed) return;
    link.dataset.behaviorReady = "1";
    var action = link.dataset.action;
    var signature = [config.id, index, link.textContent.trim(), link.dataset.target || ""].join(":");
    if (action === "perishable") {
      var dead = (readMemory().perished || []).indexOf(signature) >= 0;
      if (dead) {
        var ash = document.createElement("span"); ash.className = "residue route-ash"; ash.textContent = "nextli / aquí caducó una ruta"; link.replaceWith(ash); return;
      }
      link.classList.add("route-perishable"); link.dataset.signature = signature;
    }
    if (action === "mutant") {
      link.classList.add("route-mutant");
      var interval = global.setInterval(function () {
        if (!link.isConnected) { global.clearInterval(interval); return; }
        var choice = explorationTarget({ mutant: 1 });
        if (!choice) return;
        link.dataset.target = choice.genome.id;
        link.href = carrySeed("./" + choice.genome.id + ".html", { mutation: 1 });
        link.textContent = "tlahtolli mutante · " + choice.genome.id;
      }, 3200 + hash32(signature) % 3900);
      global.addEventListener("pagehide", function () { global.clearInterval(interval); }, { once: true });
    }
  }

  function rememberScar(id) {
    if (!id || !config.id) return;
    mutateMemory(function (latest) {
      latest.scars = latest.scars || {};
      latest.scars[config.id] = latest.scars[config.id] || [];
      if (latest.scars[config.id].indexOf(id) < 0) latest.scars[config.id].push(id);
      latest.scars[config.id] = latest.scars[config.id].slice(-128);
    });
  }

  function isScarred(id) { return Boolean(id && (readMemory().scars || {})[config.id] && readMemory().scars[config.id].indexOf(id) >= 0); }

  function attach() {
    retuneExplorationRoute();
    markVisited();
    Array.prototype.forEach.call(document.querySelectorAll("a.route"), prepareLink);
    document.addEventListener("click", function (event) {
      var mapButton = event.target.closest && event.target.closest("[data-open-used-map]");
      if (mapButton) {
        event.preventDefault();
        openMap();
        return;
      }
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
      } else if (action === "multiply") {
        event.preventDefault();
        multiply(link);
      } else if (action === "perishable") {
        mutateMemory(function (latest) {
          latest.perished = latest.perished || [];
          latest.perished.push(link.dataset.signature || link.textContent.trim());
          latest.perished = latest.perished.slice(-96);
        });
        record("destruccion", "una ruta perecedera cruzó una sola vez");
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

  function openMap() {
    record("mapa", "se abrió el mapa de páginas usadas");
    var href = carrySeed("../mapa.html", { view: "used" });
    try {
      if (global.top && global.top !== global.self) global.top.location.href = href;
      else global.location.href = href;
    } catch (error) { global.location.href = href; }
  }

  function incrementZap() {
    mutateMemory(function (latest) { latest.zaps = Number(latest.zaps || 0) + 1; });
  }

  function rememberDuration() {
    if (!config.id) return;
    var elapsed = Math.max(0, Math.min(30 * 60 * 1000, Date.now() - enteredAt));
    mutateMemory(function (latest) {
      latest.durations = latest.durations || {};
      latest.durations[config.id] = Number(latest.durations[config.id] || 0) + elapsed;
    });
  }

  global.addEventListener("pagehide", rememberDuration, { once: true });

  global.LabRoutes = Object.freeze({
    seed: seed,
    depth: depth,
    rngFrom: rngFrom,
    memory: memory,
    readMemory: readMemory,
    attach: attach,
    carrySeed: carrySeed,
    internalWindow: internalWindow,
    destinations: destinations,
    explorationTarget: explorationTarget,
    explorationHref: explorationHref,
    retuneExplorationRoute: retuneExplorationRoute,
    openMap: openMap,
    incrementZap: incrementZap
    ,rememberScar: rememberScar,
    isScarred: isScarred,
    multiply: multiply
  });
})(window);
