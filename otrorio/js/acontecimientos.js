(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var storageKey = "otrorio.acontecimientos." + seed;
  var C = global.LAB_CORPUS || {};

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) {
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function emptyArchive() {
    return { version: 1, seed: seed, startedAt: new Date().toISOString(), entries: [], discoveries: {} };
  }

  function read() {
    try {
      return Object.assign(emptyArchive(), JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch (error) {
      return emptyArchive();
    }
  }

  function write(archive) {
    try { localStorage.setItem(storageKey, JSON.stringify(archive)); } catch (error) { /* el archivo puede olvidar */ }
  }

  function fill(template, data) {
    return String(template).replace(/\{(\w+)\}/g, function (_, key) {
      return data[key] == null ? "∅" : String(data[key]);
    });
  }

  function templateFor(type, index) {
    var families = C.acontecimientos || {};
    var list = families[type] || families.rareza || ["Ocurrió {detail} en {page}."];
    return list[hash32(seed + ":" + type + ":" + index) % list.length];
  }

  function record(type, detail, dedupeKey) {
    var archive = read();
    if (dedupeKey && archive.discoveries[dedupeKey]) return null;
    var number = archive.entries.length + 1;
    var data = {
      page: config.id || "umbral",
      topology: config.topologyLabel || config.topology || "infraestructura",
      detail: detail == null ? "una variación sin nombre" : (typeof detail === "string" ? detail : detail.detail),
      rule: config.cellularRule || "∅"
    };
    var entry = {
      id: "a" + String(number).padStart(4, "0"),
      n: number,
      type: type,
      page: data.page,
      topology: data.topology,
      rule: data.rule,
      palette: config.palette || [],
      at: new Date().toISOString(),
      text: fill(templateFor(type, number), data)
    };
    archive.entries.push(entry);
    if (archive.entries.length > 240) archive.entries = archive.entries.slice(-240);
    if (dedupeKey) archive.discoveries[dedupeKey] = entry.id;
    write(archive);
    try { global.dispatchEvent(new CustomEvent("lab:acontecimiento", { detail: entry })); } catch (error) { /* evento opcional */ }
    return entry;
  }

  function clear() {
    try { localStorage.removeItem(storageKey); } catch (error) { /* nada que borrar */ }
  }

  function exportJSON() {
    var blob = new Blob([JSON.stringify(read(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "acontecimientos-" + seed.replace(/[^a-z0-9_-]+/gi, "-") + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1600);
  }

  function renderArchive(root) {
    if (!root) return;
    var archive = read();
    root.textContent = "";
    if (!archive.entries.length) {
      var empty = document.createElement("p");
      empty.className = "chronicle-empty";
      empty.textContent = "Todavía no ha ocurrido nada que el archivo pueda admitir.";
      root.appendChild(empty);
      return;
    }
    archive.entries.forEach(function (entry) {
      var article = document.createElement("article");
      article.className = "chronicle-entry chronicle-" + entry.type;
      article.style.setProperty("--event-color", entry.palette && entry.palette[2] || "#ff4fa3");
      var meta = document.createElement("div");
      meta.className = "chronicle-meta";
      meta.textContent = entry.id + " · " + entry.type + " · página " + entry.page + " · regla " + entry.rule;
      var text = document.createElement("p");
      text.textContent = entry.text;
      article.appendChild(meta);
      article.appendChild(text);
      root.appendChild(article);
    });
  }

  var api = Object.freeze({
    seed: seed,
    record: record,
    read: read,
    clear: clear,
    exportJSON: exportJSON,
    renderArchive: renderArchive
  });
  global.LabEvents = api;

  if (config.id) {
    record("visita", config.topologyLabel || config.topology, "visita:" + config.id);
    var waitTimer = setTimeout(function () {
      if (!document.hidden) record("espera", "doce segundos sin abandonar la página", "espera:" + config.id);
    }, 12000);
    global.addEventListener("pagehide", function () { clearTimeout(waitTimer); }, { once: true });
  }
})(window);
