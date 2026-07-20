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

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function empty() { return { version: 2, seed: seed, reliquias: [], perdidas: [], lastGesture: -1 }; }
  function read() {
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(key) || "{}")); }
    catch (error) { return empty(); }
  }
  function write(archive) {
    try { localStorage.setItem(key, JSON.stringify(archive)); } catch (error) { /* el códice puede quedar oral */ }
    return archive;
  }

  function rootHref() { return /\/paginas\//.test(global.location.pathname) ? "../reliquias.html" : "reliquias.html"; }
  function choice(list, salt) { return list.length ? list[hash(seed + ":" + salt) % list.length] : null; }
  function glyph(salt) {
    var pool = "✶✷✸✹✺✻✼✽✾✿❂❉⌬⟁⟡⊙⊚∿≋";
    return pool.charAt(hash(seed + ":glifo:" + salt) % pool.length);
  }

  function toast(relic, lost) {
    if (!document.body || document.body.classList.contains("relic-codex-page")) return;
    var old = document.querySelector(".relic-toast");
    if (old) old.remove();
    var note = document.createElement("aside");
    note.className = "relic-toast" + (lost ? " is-lost" : "");
    var a = document.createElement("a");
    a.href = rootHref() + "?seed=" + encodeURIComponent(seed);
    a.innerHTML = "<b>" + (lost ? "una reliquia fue sacrificada" : relic.glyph + " reliquia encontrada al tocar") + "</b><span class=\"toast-nah\" lang=\"nah\"></span><span class=\"toast-grc\" lang=\"grc\"></span><small></small>";
    a.querySelector(".toast-nah").textContent = relic.nah;
    a.querySelector(".toast-grc").textContent = relic.grc || "";
    a.querySelector("small").textContent = relic.es + (relic.grcEs ? " · " + relic.grcEs : "");
    note.appendChild(a);
    document.body.appendChild(note);
    global.setTimeout(function () { if (note.isConnected) note.remove(); }, 7200);
  }

  function discover(kind, detail, force) {
    var archive = read();
    if (!force && (!gestureAt || Date.now() - gestureAt > 1800)) return null;
    if (gestureSerial > 0 && Number(archive.lastGesture) === gestureSerial) return null;
    var salt = [kind, config.id || config.topology || "raíz", detail || "", archive.reliquias.length].join(":");
    if (!force && hash(seed + ":probabilidad:" + salt) % 100 > 27) return null;
    var pool = (hash(salt) % 4 === 0 ? N.parrafos : N.fragmentos) || [];
    var text = choice(pool, salt);
    var greek = choice(G.fragmentos || [], "griego:" + salt);
    if (!text) return null;
    var identity = kind + ":" + (config.id || "raíz") + ":" + text.nah;
    if (archive.reliquias.some(function (item) { return item.identity === identity; })) return null;
    var relic = {
      identity: identity, glyph: glyph(salt), kind: kind,
      page: config.id || config.topology || "raíz", topology: config.topology || "documento",
      nah: text.nah, es: text.es, source: text.fuente || "corpus nahua",
      grc: greek ? greek.grc : "", grcEs: greek ? greek.es : "", grcSource: greek ? greek.fuente : "",
      detail: String(detail || "una forma cambió"), at: new Date().toISOString()
    };
    archive.reliquias.push(relic);
    archive.reliquias = archive.reliquias.slice(-96);
    archive.lastGesture = gestureSerial;
    write(archive);
    toast(relic, false);
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
    toast(relic, true);
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
      return;
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
      root.appendChild(card);
    });
  }

  function gesture(event) {
    if (!event.target || !event.target.closest || document.body.classList.contains("relic-codex-page")) return;
    if (event.target.closest(".relic-toast,.zapping-warning")) return;
    gestureAt = Date.now(); gestureSerial += 1;
    var target = event.target.closest("a,button,[data-diagram-node],.mortal,.generative-chart,td,[data-mutable]") || event.target;
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

  global.LabRelics = Object.freeze({ read: read, discover: discover, sacrifice: sacrifice, render: render });
})(window);
