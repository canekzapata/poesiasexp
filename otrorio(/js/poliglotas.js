(function (global) {
  "use strict";

  var C = global.LAB_CORPUS || {};
  var P = C.poliglotas || {};
  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var serial = 0;
  var hoverTimer = 0;

  function carrySeed() {
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      try {
        var url = new URL(href, global.location.href);
        if (url.origin !== global.location.origin) return;
        url.searchParams.set("seed", seed);
        link.href = url.href;
      } catch (error) { /* una ruta externa conserva su idioma */ }
    });
  }

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(list, salt) { return list && list.length ? list[hash(seed + ":" + salt) % list.length] : ""; }
  function trimVoices() {
    var voices = document.querySelectorAll(".polyglot-voice");
    while (voices.length > 11) { voices[0].remove(); voices = document.querySelectorAll(".polyglot-voice"); }
  }
  function coordinates(event, salt) {
    var x = event && Number.isFinite(event.clientX) ? event.clientX : 30 + hash(salt) % Math.max(80, global.innerWidth - 260);
    var y = event && Number.isFinite(event.clientY) ? event.clientY : 30 + hash(salt + ":y") % Math.max(80, global.innerHeight - 180);
    return { x: Math.max(8, Math.min(global.innerWidth - 245, x + 12)), y: Math.max(8, Math.min(global.innerHeight - 130, y + 12)) };
  }
  function show(language, text, event, context) {
    if (!text || !document.body || document.body.classList.contains("relic-codex-page")) return null;
    serial += 1;
    var note = document.createElement("aside");
    var names = { en: "JOURNEY / UX·UI", fr: "LANGUE QUI TRÉBUCHE", pt: "CORRENTE SOUSANDRADIANA" };
    note.className = "polyglot-voice voice-" + language;
    note.lang = language;
    note.dataset.voiceSerial = serial;
    var point = coordinates(event, language + ":" + serial);
    note.style.setProperty("--voice-x", point.x + "px");
    note.style.setProperty("--voice-y", point.y + "px");
    note.style.setProperty("--voice-r", (-5 + hash(seed + ":r:" + serial) % 11) + "deg");
    var label = document.createElement("b"); label.textContent = names[language] || language;
    var paragraph = document.createElement("p"); paragraph.textContent = text;
    var small = document.createElement("small"); small.textContent = context || (config.id ? "page " + config.id : config.topology || "threshold");
    note.appendChild(label); note.appendChild(paragraph); note.appendChild(small);
    document.body.appendChild(note); trimVoices();
    global.setTimeout(function () { if (note.isConnected) note.classList.add("is-fading"); }, 8200);
    global.setTimeout(function () { if (note.isConnected) note.remove(); }, 10600);
    if (global.LabEvents) global.LabEvents.record("lengua", names[language] + ": " + text, "voz:" + (config.id || config.topology) + ":" + serial);
    return note;
  }
  function journeyContext(target) {
    var memory = global.LabRoutes && global.LabRoutes.readMemory ? global.LabRoutes.readMemory() : { visited: [] };
    var kind = target.closest("button") ? "button / feedback" : target.closest("a") ? "route / destination" : "surface / consequence";
    var destination = target.closest("a") && (target.closest("a").dataset.target || target.closest("a").getAttribute("href"));
    return kind + " · " + (memory.visited || []).length + " pages used" + (destination ? " · toward " + destination : "");
  }
  function clicked(event) {
    if (!event.target || !event.target.closest || event.target.closest(".polyglot-voice,.relic-toast,.zapping-warning")) return;
    var target = event.target.closest("a,button,[data-diagram-node],.generative-chart,.mortal,td,[data-mutable]");
    if (!target) return;
    var mode = hash(seed + ":clic:" + (config.id || config.topology) + ":" + serial + ":" + target.tagName) % 10;
    if (mode < 5) show("en", pick(P.inglesTrayecto, "en:" + serial + ":" + target.textContent), event, journeyContext(target));
    else if (mode < 7) show("fr", pick(P.francesTrabalenguas, "fr:" + serial + ":" + target.textContent), event, "le clic a mordu la phrase");
    else show("pt", pick(P.portuguesCorriente, "pt:" + serial + ":" + target.textContent), event, "viagem / margem / linguagem");
  }
  function hover(event) {
    var route = event.target && event.target.closest && event.target.closest("a.route");
    if (!route || route.dataset.englishObserved || event.target.closest(".polyglot-voice")) return;
    route.dataset.englishObserved = "1";
    global.clearTimeout(hoverTimer);
    hoverTimer = global.setTimeout(function () {
      if (!route.isConnected) return;
      show("en", pick(P.inglesTrayecto, "hover:" + route.textContent + ":" + serial), event, journeyContext(route));
    }, 620);
  }
  document.addEventListener("click", clicked);
  document.addEventListener("pointerover", hover, { passive: true });
  carrySeed();
  global.addEventListener("pagehide", function () { global.clearTimeout(hoverTimer); }, { once: true });
  global.LabPolyglot = Object.freeze({ show: show });
})(window);
