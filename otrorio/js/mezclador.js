(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var catalog = global.LAB_PAGE_FRAGMENTS || [];
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var memory = global.LabRoutes ? global.LabRoutes.memory : { visited: [] };
  var graftSerial = 0;
  var interactionCount = 0;
  var lastScroll = 0;
  var timer = null;
  var maxGrafts = 8;

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) {
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFrom(text) {
    var state = hash32(text);
    return function () {
      var t = state += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function readerSignature() {
    var visited = memory && memory.visited || [];
    var events = global.LabEvents ? global.LabEvents.read().entries.length : 0;
    return [seed, visited.slice(-12).join("-"), events, global.innerWidth, global.innerHeight, interactionCount].join(":");
  }

  function currentPalette() {
    var css = getComputedStyle(document.documentElement);
    return ["--bg", "--fg", "--a", "--b", "--c", "--d"].map(function (name) {
      return css.getPropertyValue(name).trim() || "#000";
    });
  }

  function animateOrgans(root, salt, palette) {
    root = root || document;
    palette = palette && palette.length >= 6 ? palette : currentPalette();
    var rng = rngFrom(readerSignature() + ":chroma:" + (salt || 0));
    var candidates = Array.prototype.slice.call(root.querySelectorAll("div, section, article, aside, fieldset, blockquote, figure, td"));
    var limit = Math.min(candidates.length, root === document ? 38 : 18);
    for (var i = 0, marked = 0; i < candidates.length && marked < limit; i += 1) {
      var node = candidates[(i * 7 + Math.floor(rng() * candidates.length)) % candidates.length];
      if (!node || node.closest(".permanent-routes, .poem-button-field, .lab-meta") || node.dataset.chromatic) continue;
      if (rng() < .28 && root === document) continue;
      node.dataset.chromatic = "1";
      node.style.setProperty("--chrom-0", palette[2 + (marked % 4)]);
      node.style.setProperty("--chrom-1", palette[2 + ((marked + 1) % 4)]);
      node.style.setProperty("--chrom-2", palette[2 + ((marked + 2) % 4)]);
      node.style.setProperty("--chrom-fg", marked % 3 ? palette[1] : palette[0]);
      node.style.setProperty("--chrom-speed", (4 + rng() * 21).toFixed(2) + "s");
      node.style.setProperty("--chrom-delay", (-rng() * 18).toFixed(2) + "s");
      marked += 1;
    }
  }

  function chooseDonor(rng) {
    var available = catalog.filter(function (entry) { return entry.id !== config.id; });
    if (!available.length) return null;
    var visited = memory && memory.visited || [];
    var remembered = available.filter(function (entry) { return visited.indexOf(entry.id) >= 0; });
    var neighbors = available.filter(function (entry) { return (config.edges || []).indexOf(entry.id) >= 0; });
    if (remembered.length && graftSerial <= 1) {
      var recent = visited.slice().reverse().find(function (id) { return id !== config.id; });
      return remembered.find(function (entry) { return entry.id === recent; }) || remembered[remembered.length - 1];
    }
    if (remembered.length && rng() < .62) return remembered[Math.floor(rng() * remembered.length)];
    if (neighbors.length && rng() < .72) return neighbors[Math.floor(rng() * neighbors.length)];
    return available[Math.floor(rng() * available.length)];
  }

  function candidateNodes(donor, rng) {
    var template = document.createElement("template");
    template.innerHTML = donor.html;
    var selector = [
      ".generative-chart", ".garden-note", ".poem-window", ".descendant",
      ".legible-island", ".ascii-plane", ".corridor-zone", ".depth-band",
      ".code-line", "fieldset", "blockquote", "article", "figure", "pre", "table", "section"
    ].join(",");
    var candidates = Array.prototype.slice.call(template.content.querySelectorAll(selector)).filter(function (node) {
      var size = node.outerHTML.length;
      var chart = node.classList.contains("generative-chart");
      return size > 30 && size < 18000 && (chart || !node.closest(".generative-chart"));
    });
    if (!candidates.length) candidates = Array.prototype.slice.call(template.content.children);

    var charts = candidates.filter(function (node) { return node.classList && node.classList.contains("generative-chart"); });
    if (charts.length && graftSerial % 4 === 0) candidates = charts;
    var count = 1 + Math.floor(rng() * 3);
    var chosen = [];
    for (var i = 0; i < count && candidates.length; i += 1) {
      var node = candidates.splice(Math.floor(rng() * candidates.length), 1)[0];
      if (chosen.some(function (other) { return other.contains(node) || node.contains(other); })) { i -= 1; continue; }
      chosen.push(node);
    }
    return chosen;
  }

  function sanitizeClone(clone, serial) {
    Array.prototype.forEach.call(clone.querySelectorAll("script, iframe"), function (node) { node.remove(); });
    if (clone.matches("iframe, script")) return null;
    var ids = [];
    if (clone.id) ids.push(clone);
    ids = ids.concat(Array.prototype.slice.call(clone.querySelectorAll("[id]")));
    ids.forEach(function (node, i) { node.id = "injerto-" + serial + "-" + i; });
    Array.prototype.forEach.call(clone.querySelectorAll("a[href]"), function (link) {
      link.dataset.grafted = "1";
      if (global.LabRoutes) link.href = global.LabRoutes.carrySeed(link.getAttribute("href"));
    });
    clone.classList.add("graft-organ");
    return clone;
  }

  function place(graft, rng, point) {
    var x = point ? Math.max(0, Math.min(82, point.x / Math.max(1, global.innerWidth) * 100 - 8)) : rng() * 78;
    var y = point ? Math.max(0, Math.min(82, point.y / Math.max(1, global.innerHeight) * 100 - 8)) : rng() * 78;
    graft.style.setProperty("--graft-x", x.toFixed(2) + "vw");
    graft.style.setProperty("--graft-y", y.toFixed(2) + "vh");
    graft.style.setProperty("--graft-w", (180 + rng() * 430).toFixed(0) + "px");
    graft.style.setProperty("--graft-r", (-13 + rng() * 26).toFixed(2) + "deg");
    graft.style.setProperty("--graft-z", String(8050 + Math.floor(rng() * 700)));
  }

  function recompose(graft, point) {
    graft = graft || document.querySelector(".page-graft");
    if (!graft) return null;
    interactionCount += 1;
    var rng = rngFrom(readerSignature() + ":recompose:" + graft.dataset.graftSerial);
    place(graft, rng, point);
    graft.dataset.recomposed = String(Number(graft.dataset.recomposed || 0) + 1);
    var organs = Array.prototype.slice.call(graft.children).filter(function (node) { return node.classList.contains("graft-organ"); });
    if (organs.length > 1 && rng() < .7) graft.insertBefore(organs[organs.length - 1], organs[0]);
    animateOrgans(graft, "again-" + interactionCount);
    if (global.LabEvents) global.LabEvents.record("injerto", "el injerto de la página " + graft.dataset.graftSource + " cambió de lugar");
    return graft;
  }

  function graft(point) {
    var existing = document.querySelectorAll(".page-graft");
    if (existing.length >= maxGrafts) return recompose(existing[graftSerial % existing.length], point);
    var serial = graftSerial++;
    var rng = rngFrom(readerSignature() + ":graft:" + serial);
    var donor = chooseDonor(rng);
    if (!donor) return null;
    var section = document.createElement("section");
    section.className = "page-graft graft-from-" + donor.topology;
    section.dataset.graftSource = donor.id;
    section.dataset.graftTopology = donor.topology;
    section.dataset.sourceFont = donor.fontMode;
    section.dataset.graftSerial = String(serial);
    section.style.setProperty("--graft-a", donor.palette[2]);
    section.style.setProperty("--graft-b", donor.palette[3]);
    section.style.setProperty("--graft-c", donor.palette[4]);
    place(section, rng, point);

    var label = document.createElement("div");
    label.className = "graft-label";
    var remembered = memory && memory.visited && memory.visited.indexOf(donor.id) >= 0;
    label.textContent = "injerto " + donor.id + " / " + donor.topology + (remembered ? " / recordado" : " / todavía no visitado");
    section.appendChild(label);

    var nodes = candidateNodes(donor, rng);
    nodes.forEach(function (node) {
      var clone = sanitizeClone(node.cloneNode(true), serial);
      if (clone) section.appendChild(clone);
    });
    if (!section.querySelector(".graft-organ")) {
      var fallback = document.createElement("blockquote");
      fallback.className = "graft-organ";
      fallback.textContent = "La página " + donor.id + " llegó sin cuerpo y ocupó el borde.";
      section.appendChild(fallback);
    }

    document.body.appendChild(section);
    animateOrgans(section, serial, donor.palette);
    if (global.LabCharts) global.LabCharts.hydrate(section);
    if (global.LabEvents) global.LabEvents.record("injerto", "la página " + donor.id + " dejó " + nodes.length + " órganos en " + (config.id || "el umbral"));
    return section;
  }

  function init() {
    if (!catalog.length || !config.id) return;
    animateOrgans(document, "initial");
    var remembered = Math.max(0, (memory.visited || []).length - 1);
    var initial = Math.min(maxGrafts, Math.max(1, Number(config.graftCount || 1)) + Math.min(2, remembered));
    for (var i = 0; i < initial; i += 1) graft();

    document.addEventListener("dblclick", function (event) {
      interactionCount += 1;
      graft({ x: event.clientX, y: event.clientY });
    });
    document.addEventListener("pointerdown", function (event) {
      interactionCount += 1;
      if (interactionCount % 7 === 0 && !event.target.closest("a, button, input, textarea, select")) graft({ x: event.clientX, y: event.clientY });
    });
    global.addEventListener("scroll", function () {
      var distance = Math.abs((global.scrollX + global.scrollY) - lastScroll);
      if (distance < 760) return;
      lastScroll = global.scrollX + global.scrollY;
      var first = document.querySelector(".page-graft");
      if (first) recompose(first);
    }, { passive: true });

    if (!global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = global.setInterval(function () {
        var grafts = document.querySelectorAll(".page-graft");
        if (grafts.length < maxGrafts && graftSerial % 3 === 0) graft();
        else if (grafts.length) recompose(grafts[graftSerial % grafts.length]);
      }, 9200 + hash32(readerSignature()) % 7800);
    }
    global.addEventListener("pagehide", function () { if (timer) global.clearInterval(timer); }, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabGrafts = Object.freeze({ graft: graft, recompose: recompose, animate: animateOrgans, signature: readerSignature });
})(window);
