(function (global) {
  "use strict";

  var params = new URLSearchParams(global.location.search);
  var config = global.LAB_PAGE || {};
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var key = "otrorio.reliquias." + seed;
  var C = global.LAB_CORPUS || {};
  var N = C.nahuatl || { fragmentos: [], parrafos: [] };
  var G = C.griegoAntiguo || { fragmentos: [], palabras: [] };
  var gestureAt = 0;
  var gestureSerial = 0;
  var gestureTarget = null;

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  var resonantKeys = {
    tierra: ["rutas", "destino"], ruta: ["ruta", "rutas", "viaje"], verdad: ["oculto"],
    sueño: ["huella", "oculto"], retorno: ["retorno", "viaje"], escritura: ["escritura", "huella"],
    canto: ["escritura", "viaje"], lugar: ["rio", "rutas"]
  };
  function firstThreshold() { return 18 + hash(seed + ":primer-umbral") % 7; }
  function empty() {
    return {
      version: 4, seed: seed, reliquias: [], perdidas: [], lastGesture: -1, lastAttemptGesture: -1, chamberOpenedAt: "",
      pagesTouched: {}, meaningfulGestures: 0, attention: 0, nextThreshold: firstThreshold(), thresholdAttempts: 0
    };
  }
  function nahKeyFor(relic) {
    if (relic.nahKey) return relic.nahKey;
    var text = relic.nah || "";
    if (/tlalticpac/.test(text)) return "tierra";
    if (/Campa/.test(text)) return "ruta";
    if (/nel o tic/.test(text)) return "verdad";
    if (/temiqui|cochitlehuaco/.test(text)) return "sueño";
    if (/ceppa/.test(text)) return "retorno";
    if (/tlilli/.test(text)) return "escritura";
    if (/xochitl/.test(text)) return "canto";
    return "lugar";
  }
  function greekKeyFor(relic) {
    if (relic.grcKey) return relic.grcKey;
    var match = (G.fragmentos || []).filter(function (item) { return item.grc === relic.grc; })[0];
    return match && match.clave || "destino";
  }
  function resonanceFor(nahKey, grcKey) {
    return (resonantKeys[nahKey] || []).indexOf(grcKey) >= 0 ? nahKey + "↔" + grcKey : "";
  }
  function enrich(archive) {
    archive.reliquias = (archive.reliquias || []).map(function (relic) {
      relic.nahKey = nahKeyFor(relic); relic.grcKey = greekKeyFor(relic);
      relic.resonance = relic.resonance || resonanceFor(relic.nahKey, relic.grcKey);
      return relic;
    });
    if (!archive.chamberOpenedAt && resonances(archive).length >= 3) archive.chamberOpenedAt = new Date().toISOString();
    archive.pagesTouched = archive.pagesTouched || {};
    archive.meaningfulGestures = Number(archive.meaningfulGestures || 0);
    archive.attention = Number(archive.attention || 0);
    archive.nextThreshold = Number(archive.nextThreshold || firstThreshold());
    archive.thresholdAttempts = Number(archive.thresholdAttempts || 0);
    archive.version = 4;
    return archive;
  }
  function read() {
    try { return enrich(Object.assign(empty(), JSON.parse(localStorage.getItem(key) || "{}"))); }
    catch (error) { return empty(); }
  }
  function write(archive) {
    try { localStorage.setItem(key, JSON.stringify(archive)); } catch (error) { /* el códice puede quedar oral */ }
    return archive;
  }

  function rootHref() { return /\/paginas\//.test(global.location.pathname) ? "../reliquias.html" : "reliquias.html"; }
  function chamberHref() { return /\/paginas\//.test(global.location.pathname) ? "../camara.html" : "camara.html"; }
  function choice(list, salt) { return list.length ? list[hash(seed + ":" + salt) % list.length] : null; }
  function glyph(salt) {
    var pool = "✶✷✸✹✺✻✼✽✾✿❂❉⌬⟁⟡⊙⊚∿≋";
    return pool.charAt(hash(seed + ":glifo:" + salt) % pool.length);
  }

  function reveal(relic, lost) {
    if (!document.body || document.body.classList.contains("relic-codex-page")) return;
    var old = document.querySelector(".relic-discovery");
    if (old) old.remove();
    var note = document.createElement("span");
    note.className = "relic-discovery" + (lost ? " is-lost" : "");
    var a = document.createElement("a");
    a.href = rootHref() + "?seed=" + encodeURIComponent(seed);
    a.innerHTML = "<b></b><span lang=\"nah\"></span><small></small>";
    a.querySelector("b").textContent = lost ? "∅ una huella se perdió" : relic.glyph + " la superficie dejó una inscripción";
    a.querySelector("[lang=nah]").textContent = relic.nah;
    a.querySelector("small").textContent = lost ? relic.lostReason : "queda en el amoxtli" + (relic.resonance ? " · algo resonó" : "");
    note.appendChild(a);
    var anchor = gestureTarget && gestureTarget.isConnected ? gestureTarget : null;
    var host = anchor && anchor.parentNode ? anchor.parentNode : document.body;
    if (anchor && host) host.insertBefore(note, anchor.nextSibling); else host.appendChild(note);
  }

  function discover(kind, detail, force) {
    var archive = read();
    if (!force && (!gestureAt || Date.now() - gestureAt > 1800)) return null;
    if (gestureSerial > 0 && Number(archive.lastGesture) === gestureSerial) return null;
    if (!force && gestureSerial > 0 && Number(archive.lastAttemptGesture) === gestureSerial) return null;
    var pageCount = Object.keys(archive.pagesTouched || {}).length;
    if (!force && (archive.meaningfulGestures < 8 || pageCount < 2 || archive.attention < archive.nextThreshold)) return null;
    if (!force) {
      archive.lastAttemptGesture = gestureSerial;
      archive.thresholdAttempts += 1;
      var opens = archive.thresholdAttempts >= 4 || hash(seed + ":umbral:" + archive.meaningfulGestures + ":" + archive.thresholdAttempts) % 100 < 28;
      write(archive);
      if (!opens) return null;
    }
    var salt = [kind, config.id || config.topology || "raíz", detail || "", archive.reliquias.length].join(":");
    if (!force && hash(seed + ":probabilidad:" + salt) % 100 > 27) return null;
    var pool = (hash(salt) % 4 === 0 ? N.parrafos : N.fragmentos) || [];
    var text = choice(pool, salt);
    var allGreek = G.fragmentos || [];
    var preferredKeys = resonantKeys[text && text.clave] || [];
    var preferredGreek = allGreek.filter(function (item) { return preferredKeys.indexOf(item.clave) >= 0; });
    var greekPool = preferredGreek.length && hash(seed + ":resonancia:" + salt) % 4 !== 0 ? preferredGreek : allGreek;
    var greek = choice(greekPool, "griego:" + salt);
    if (!text) return null;
    var identity = kind + ":" + (config.id || "raíz") + ":" + text.nah;
    if (archive.reliquias.some(function (item) { return item.identity === identity; })) return null;
    var relic = {
      identity: identity, glyph: glyph(salt), kind: kind,
      page: config.id || config.topology || "raíz", topology: config.topology || "documento",
      nah: text.nah, es: text.es, source: text.fuente || "corpus nahua",
      grc: greek ? greek.grc : "", grcEs: greek ? greek.es : "", grcSource: greek ? greek.fuente : "",
      nahKey: text.clave || "", grcKey: greek ? greek.clave || "" : "",
      detail: String(detail || "una forma cambió"), at: new Date().toISOString()
    };
    relic.resonance = resonanceFor(relic.nahKey, relic.grcKey);
    archive.reliquias.push(relic);
    archive.reliquias = archive.reliquias.slice(-96);
    archive.lastGesture = gestureSerial;
    archive.thresholdAttempts = 0;
    archive.nextThreshold = archive.attention + 16 + hash(seed + ":siguiente-umbral:" + archive.reliquias.length) % 10;
    enrich(archive);
    write(archive);
    reveal(relic, false);
    try { global.dispatchEvent(new CustomEvent("lab:relic", { detail: relic })); } catch (error) { /* hallazgo local */ }
    return relic;
  }

  function sacrifice(reason) {
    var archive = read();
    var relic = archive.reliquias.pop();
    if (!relic) return null;
    relic.lostReason = reason || "la señal pidió una pérdida";
    relic.lostAt = new Date().toISOString();
    archive.perdidas.push(relic);
    archive.perdidas = archive.perdidas.slice(-48);
    write(archive);
    reveal(relic, true);
    return relic;
  }

  function render(root) {
    if (!root) return;
    var archive = read();
    root.textContent = "";
    if (!archive.reliquias.length) {
      var empty = document.createElement("article");
      empty.className = "relic-empty";
      empty.innerHTML = "<span>∅</span><p>El amoxtli está abierto, pero todavía no conserva nada. Toca, destruye, cambia una gráfica o deja que un botón haga algo imprevisto.</p>";
      root.appendChild(empty);
    }
    archive.reliquias.slice().reverse().forEach(function (relic, index) {
      var card = document.createElement("article");
      card.className = "relic-card relic-kind-" + relic.kind;
      card.style.setProperty("--relic-index", index);
      card.innerHTML = "<span class=\"relic-glyph\"></span><section class=\"relic-language relic-language-nah\"><b>NĀHUATL</b><p class=\"relic-nah\" lang=\"nah\"></p><p class=\"relic-es\"></p></section><section class=\"relic-language relic-language-grc\"><b>ἙΛΛΗΝΙΚΆ</b><p class=\"relic-grc\" lang=\"grc\"></p><p class=\"relic-grc-es\"></p></section><footer><span></span><i></i><em></em></footer>";
      card.querySelector(".relic-glyph").textContent = relic.glyph;
      card.querySelector(".relic-nah").textContent = relic.nah;
      card.querySelector(".relic-es").textContent = relic.es;
      card.querySelector(".relic-grc").textContent = relic.grc || "λείψανον";
      card.querySelector(".relic-grc-es").textContent = relic.grcEs || "resto / reliquia";
      card.querySelector("footer span").textContent = relic.page + " · " + relic.kind + " · " + relic.detail;
      card.querySelector("footer i").textContent = relic.source;
      card.querySelector("footer em").textContent = relic.grcSource || "griego antiguo";
      if (relic.resonance) card.dataset.resonance = relic.resonance;
      root.appendChild(card);
    });
    var seal = document.createElement("aside");
    var found = resonances(archive);
    seal.className = "chamber-seal" + (chamberOpen(archive) ? " is-open" : "");
    if (chamberOpen(archive)) {
      seal.innerHTML = "<span>𐇐 · ΛΙΘΟΣ · ⟁</span><p>Tres desacuerdos entre el náhuatl y el griego hicieron una grieta.</p><a class=\"route\">entrar a la cámara epigráfica</a>";
      seal.querySelector("a").href = chamberHref() + "?seed=" + encodeURIComponent(seed);
    } else {
      var phrases = ["La piedra todavía no reconoce una pareja.", "La piedra reconoce una pareja, pero no abre.", "Dos parejas discuten bajo la superficie; falta otra voz."];
      seal.innerHTML = "<span>𐇐 · ΛΙΘΟΣ · ⟁</span><p></p><small>Las parejas aparecen sólo cuando un gesto encuentra una reliquia.</small>";
      seal.querySelector("p").textContent = phrases[Math.min(found.length, 2)];
    }
    root.appendChild(seal);
  }

  function resonances(archive) {
    archive = archive || read();
    return (archive.reliquias || []).map(function (relic) { return relic.resonance; }).filter(Boolean).filter(function (item, index, all) { return all.indexOf(item) === index; });
  }
  function chamberOpen(archive) {
    archive = archive || read();
    return Boolean(archive.chamberOpenedAt || resonances(archive).length >= 3);
  }

  function gesture(event) {
    if (!event.target || !event.target.closest || document.body.classList.contains("relic-codex-page")) return;
    if (event.target.closest(".relic-toast,.relic-discovery,.zapping-warning,.language-apparition,.language-inlay")) return;
    var target = event.target.closest("a,button,[data-diagram-node],.mortal,.generative-chart,canvas,td,[data-mutable]");
    if (!target) return;
    gestureAt = Date.now(); gestureSerial += 1;
    gestureTarget = target;
    var archive = read();
    var weight = target.matches("button,[data-diagram-node],.generative-chart,canvas") ? 3 : target.matches(".mortal,[data-mutable],td") ? 2 : 1;
    archive.meaningfulGestures += 1;
    archive.attention += weight;
    archive.pagesTouched[config.id || config.topology || "raíz"] = true;
    write(archive);
    var detail = (target.textContent || target.getAttribute && target.getAttribute("aria-label") || target.tagName || "superficie").trim().replace(/\s+/g, " ").slice(0, 100);
    discover("gesto", detail || "la superficie respondió", false);
  }

  document.addEventListener("click", gesture, true);
  document.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") gesture(event); }, true);

  global.addEventListener("lab:acontecimiento", function (event) {
    var d = event.detail || {};
    if (!gestureAt || Date.now() - gestureAt > 1800 || ["mapa", "sonido", "espera", "poema", "tlahtolli"].indexOf(d.type) >= 0) return;
    discover(d.type || "rareza", d.detail || d.text || "acontecimiento", false);
  });

  (function markVisit() {
    var archive = read();
    archive.pagesTouched[config.id || config.topology || "raíz"] = true;
    write(archive);
  })();

  global.LabRelics = Object.freeze({ read: read, discover: discover, sacrifice: sacrifice, render: render, resonances: resonances, chamberOpen: chamberOpen, chamberHref: chamberHref });
})(window);
