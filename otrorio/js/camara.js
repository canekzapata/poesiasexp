(function (global) {
  "use strict";
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || (global.LAB_PAGE && global.LAB_PAGE.worldSeed) || "otra-agua-2026";
  var corpus = global.LAB_CORPUS || {};
  var root;

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(list, salt) { return list && list.length ? list[hash(seed + ":" + salt) % list.length] : null; }
  function inscription(nah, greek, index, source) {
    var article = document.createElement("article");
    article.className = "epigraph";
    article.style.setProperty("--x", (12 + hash(seed + ":x:" + index) % 77) + "%");
    article.style.setProperty("--y", (8 + index * 16 + hash(seed + ":y:" + index) % 12) + "%");
    article.style.setProperty("--r", (-7 + hash(seed + ":r:" + index) % 15) + "deg");
    var n = document.createElement("p"); n.lang = "nah"; n.textContent = nah.nah;
    var ng = document.createElement("small"); ng.textContent = nah.es;
    var g = document.createElement("p"); g.lang = "grc"; g.textContent = greek.grc;
    var gg = document.createElement("small"); gg.textContent = greek.es;
    var origin = document.createElement("small"); origin.textContent = source || ((nah.fuente || "tradición nahua") + " × " + (greek.fuente || "poemario"));
    article.appendChild(n); article.appendChild(ng); article.appendChild(g); article.appendChild(gg); article.appendChild(origin);
    article.addEventListener("click", function (event) {
      event.stopPropagation();
      article.style.setProperty("--r", (-18 + hash(seed + ":turn:" + Date.now() + ":" + index) % 37) + "deg");
      article.style.setProperty("--x", (10 + hash(Date.now() + ":x") % 81) + "%");
      article.classList.toggle("is-rubbing");
    });
    return article;
  }
  function rubbing() {
    var canvas = document.createElement("canvas");
    canvas.className = "epigraphic-rubbing";
    canvas.width = Math.max(640, global.innerWidth || 640);
    canvas.height = Math.max(480, global.innerHeight || 480);
    var context = canvas.getContext("2d");
    if (context) {
      context.strokeStyle = "#d5ff4f"; context.globalAlpha = .34;
      for (var i = 0; i < 90; i += 1) {
        context.beginPath();
        context.moveTo(hash(seed + ":rx:" + i) % canvas.width, hash(seed + ":ry:" + i) % canvas.height);
        context.lineTo(hash(seed + ":qx:" + i) % canvas.width, hash(seed + ":qy:" + i) % canvas.height);
        context.stroke();
      }
    }
    document.body.appendChild(canvas);
  }
  function render() {
    root = document.getElementById("chamber-stone");
    if (!root || !global.LabRelics) return;
    var archive = global.LabRelics.read();
    if (!global.LabRelics.chamberOpen(archive)) {
      root.className = "chamber-sealed";
      root.innerHTML = "<div><b>ΛΙΘΟΣ / la cámara permanece debajo</b><p>El URL conoce la puerta, pero no puede fingir las tres resonancias. Regresa al códice y encuentra reliquias tocando la pieza.</p></div>";
      return;
    }
    var greek = (corpus.griegoAntiguo && corpus.griegoAntiguo.fragmentos) || [];
    var nahuatl = (corpus.nahuatl && corpus.nahuatl.fragmentos) || [];
    var relics = (archive.reliquias || []).filter(function (item) { return item.resonance; });
    var count = Math.max(7, relics.length + 4);
    for (var i = 0; i < count; i += 1) {
      var relic = relics[i % Math.max(1, relics.length)];
      var nah = relic ? { nah: relic.nah, es: relic.es, fuente: relic.source } : pick(nahuatl, "nah:" + i);
      var grc = relic ? { grc: relic.grc, es: relic.grcEs, fuente: relic.grcSource } : pick(greek, "grc:" + i);
      if (nah && grc) root.appendChild(inscription(nah, grc, i, relic && (relic.resonance + " · " + relic.page)));
    }
    root.addEventListener("click", function (event) {
      if (event.target !== root) return;
      var nah = pick(nahuatl, "carve-nah:" + Date.now());
      var grc = pick(greek, "carve-grc:" + Date.now());
      var node = inscription(nah, grc, root.children.length, "incisión producida por el lector");
      node.style.setProperty("--x", (event.clientX / Math.max(1, global.innerWidth) * 100) + "%");
      root.appendChild(node);
    });
    rubbing();
    if (global.LabEvents) global.LabEvents.record("camara", "Las resonancias abrieron la cámara epigráfica.", "camara-abierta:" + seed);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true }); else render();
})(window);
