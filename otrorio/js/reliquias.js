(function (global) {
  "use strict";

  var params = new URLSearchParams(global.location.search);
  var config = global.LAB_PAGE || {};
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var key = "otrorio.reliquias." + seed;
  var C = global.LAB_CORPUS || {};
  var N = C.nahuatl || { fragmentos: [], parrafos: [] };

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function empty() { return { version: 1, seed: seed, reliquias: [], perdidas: [] }; }
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
    a.innerHTML = "<b>" + (lost ? "una reliquia fue sacrificada" : relic.glyph + " reliquia encontrada") + "</b><span lang=\"nah\"></span><small></small>";
    a.querySelector("span").textContent = relic.nah;
    a.querySelector("small").textContent = relic.es;
    note.appendChild(a);
    document.body.appendChild(note);
    global.setTimeout(function () { if (note.isConnected) note.remove(); }, 7200);
  }

  function discover(kind, detail, force) {
    var archive = read();
    var salt = [kind, config.id || config.topology || "raíz", detail || "", archive.reliquias.length].join(":");
    if (!force && hash(seed + ":probabilidad:" + salt) % 100 > 27) return null;
    var pool = (hash(salt) % 4 === 0 ? N.parrafos : N.fragmentos) || [];
    var text = choice(pool, salt);
    if (!text) return null;
    var identity = kind + ":" + (config.id || "raíz") + ":" + text.nah;
    if (archive.reliquias.some(function (item) { return item.identity === identity; })) return null;
    var relic = {
      identity: identity, glyph: glyph(salt), kind: kind,
      page: config.id || config.topology || "raíz", topology: config.topology || "documento",
      nah: text.nah, es: text.es, source: text.fuente || "corpus nahua",
      detail: String(detail || "una forma cambió"), at: new Date().toISOString()
    };
    archive.reliquias.push(relic);
    archive.reliquias = archive.reliquias.slice(-96);
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
      empty.innerHTML = "<span>∅</span><p>El amoxtli está abierto, pero todavía no conserva nada. Espera, destruye, cambia una gráfica, deja que otra página devore ésta.</p>";
      root.appendChild(empty);
      return;
    }
    archive.reliquias.slice().reverse().forEach(function (relic, index) {
      var card = document.createElement("article");
      card.className = "relic-card relic-kind-" + relic.kind;
      card.style.setProperty("--relic-index", index);
      card.innerHTML = "<span class=\"relic-glyph\"></span><p class=\"relic-nah\" lang=\"nah\"></p><p class=\"relic-es\"></p><footer><span></span><i></i></footer>";
      card.querySelector(".relic-glyph").textContent = relic.glyph;
      card.querySelector(".relic-nah").textContent = relic.nah;
      card.querySelector(".relic-es").textContent = relic.es;
      card.querySelector("footer span").textContent = relic.page + " · " + relic.kind + " · " + relic.detail;
      card.querySelector("footer i").textContent = relic.source;
      root.appendChild(card);
    });
  }

  global.addEventListener("lab:acontecimiento", function (event) {
    var d = event.detail || {};
    if (["enlace", "mapa", "sonido"].indexOf(d.type) >= 0) return;
    discover(d.type || "rareza", d.detail || d.text || "acontecimiento", d.type === "rareza" && hash(d.detail || d.text || "") % 3 === 0);
  });

  global.LabRelics = Object.freeze({ read: read, discover: discover, sacrifice: sacrifice, render: render });
})(window);
