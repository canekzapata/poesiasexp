(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var genomes = global.LAB_PAGE_GENOMES || [];
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var memory = global.LabRoutes ? global.LabRoutes.memory : { visited: [] };
  var serial = 0;
  var donorCalls = 0;
  var interactions = 0;
  var lastScroll = 0;
  var timer = null;
  var budget = Math.min(14, Math.max(2, Math.ceil(Number(config.cannibalIntensity || 2) / 3)));
  var safeTags = ["div", "section", "article", "aside", "blockquote", "pre", "code", "span", "p", "figure", "figcaption", "ul", "ol", "li", "dl", "dt", "dd", "address", "mark", "small", "b", "i"];
  var forbiddenClasses = ["permanent-routes", "poem-button-field", "poem-button", "lab-meta", "ambient-noise-canvas", "route", "window-close", "chart-close"];

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

  function pick(rng, list, fallback) {
    return list && list.length ? list[Math.floor(rng() * list.length)] : fallback;
  }

  function signature() {
    var visited = memory && memory.visited || [];
    return [seed, config.id || "portal", visited.slice(-14).join("-"), serial, interactions].join(":");
  }

  function donorFor(rng) {
    var available = genomes.filter(function (genome) { return genome.id !== config.id; });
    if (!available.length) return null;
    var visited = memory && memory.visited || [];
    var recent = visited.slice().reverse().find(function (id) { return id !== config.id; });
    var remembered = available.filter(function (genome) { return visited.indexOf(genome.id) >= 0; });
    var firstDonor = donorCalls++ === 0;
    if (firstDonor && recent) {
      var last = remembered.find(function (genome) { return genome.id === recent; });
      if (last) return last;
    }
    if (remembered.length && rng() < .58) return pick(rng, remembered);
    var neighbors = available.filter(function (genome) { return (config.edges || []).indexOf(genome.id) >= 0; });
    if (neighbors.length && rng() < .67) return pick(rng, neighbors);
    return pick(rng, available);
  }

  function decode(text) {
    var area = document.createElement("textarea");
    area.innerHTML = String(text || "");
    return area.value;
  }

  function safeClass(name) {
    return name && forbiddenClasses.indexOf(name) < 0 && !/^topology-/.test(name) && !/^graft-/.test(name);
  }

  function sanitize(root) {
    Array.prototype.forEach.call(root.querySelectorAll("script, iframe, .permanent-routes, .poem-button-field"), function (node) { node.remove(); });
    if (root.id) root.removeAttribute("id");
    Array.prototype.forEach.call(root.querySelectorAll("[id]"), function (node) { node.removeAttribute("id"); });
    Array.prototype.forEach.call(root.querySelectorAll("a[href]"), function (link) {
      link.dataset.cannibalLink = "1";
      if (global.LabRoutes) link.href = global.LabRoutes.carrySeed(link.getAttribute("href"));
    });
    return root;
  }

  function chromatize(node, palette, index) {
    palette = palette && palette.length >= 6 ? palette : (config.palette || ["#000", "#fff", "#f0f", "#0ff", "#ff0", "#f60"]);
    node.dataset.chromatic = "1";
    node.style.setProperty("--chrom-0", palette[2 + (index % 4)]);
    node.style.setProperty("--chrom-1", palette[2 + ((index + 1) % 4)]);
    node.style.setProperty("--chrom-2", palette[2 + ((index + 2) % 4)]);
    node.style.setProperty("--chrom-fg", index % 2 ? palette[0] : palette[1]);
    node.style.setProperty("--chrom-speed", (5 + (hash32(signature() + index) % 1900) / 100) + "s");
    node.style.setProperty("--chrom-delay", (-index * .73) + "s");
  }

  function targets() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-mutable], main section, main article, main aside, main div, main pre, main p, main figure, main blockquote, main td, form fieldset, form output, form label")).filter(function (node) {
      if (!node.parentNode || node.closest(".permanent-routes, .poem-button-field, .lab-meta")) return false;
      if (node.matches(".cannibal-stage, .cannibal-source, .cannibal-title, canvas, iframe, script, a, button, input, textarea, select, option")) return false;
      if (node.querySelector("[data-indestructible]")) return false;
      return true;
    });
  }

  function copySkin(target, donor, rng) {
    var classes = (donor.classes || []).filter(safeClass);
    for (var i = 0; i < 1 + Math.floor(rng() * 2) && classes.length; i += 1) target.classList.add(pick(rng, classes));
    var style = pick(rng, donor.styles, "");
    if (style) {
      var probe = document.createElement("span");
      probe.setAttribute("style", style);
      var names = [];
      for (var p = 0; p < probe.style.length; p += 1) names.push(probe.style[p]);
      var name = pick(rng, names);
      var value = name && probe.style.getPropertyValue(name);
      if (name && value && value.indexOf("url(") < 0 && name !== "position" && name !== "z-index") target.style.setProperty(name, value);
    }
    target.dataset.cannibalSkin = donor.id;
    chromatize(target, donor.palette, serial);
    return target;
  }

  function changeTag(target, donor, rng) {
    if (target.matches("td, tr, tbody, table, form, fieldset, legend, nav") || target.closest("table")) return copySkin(target, donor, rng);
    var tag = pick(rng, (donor.tags || []).filter(function (name) { return safeTags.indexOf(name) >= 0; }), pick(rng, safeTags, "div"));
    var replacement = document.createElement(tag);
    Array.prototype.forEach.call(target.attributes || [], function (attr) {
      if (attr.name !== "id") replacement.setAttribute(attr.name, attr.value);
    });
    while (target.firstChild) replacement.appendChild(target.firstChild);
    replacement.dataset.cannibalTag = donor.id + ":" + target.tagName.toLowerCase() + "→" + tag;
    target.replaceWith(replacement);
    return copySkin(replacement, donor, rng);
  }

  function digestSnippet(target, donor, rng) {
    var snippet = pick(rng, donor.snippets, "");
    var template = document.createElement("template");
    template.innerHTML = snippet;
    var source = template.content.firstElementChild;
    if (!source) {
      target.appendChild(document.createTextNode(" " + decode(pick(rng, donor.texts, donor.id))));
      return target;
    }
    source = sanitize(source);
    copySkin(target, donor, rng);
    var pieces = Array.prototype.slice.call(source.childNodes).slice(0, 5);
    if (!pieces.length) pieces = [document.createTextNode(source.textContent || decode(pick(rng, donor.texts, donor.id)))];
    pieces.forEach(function (piece, i) {
      var clone = piece.cloneNode(true);
      if (clone.nodeType === 1) sanitize(clone);
      if (target.childNodes.length && (i + serial) % 2) target.insertBefore(clone, target.childNodes[Math.floor(rng() * target.childNodes.length)]);
      else target.appendChild(clone);
    });
    target.dataset.cannibalDigest = donor.id;
    return target;
  }

  function splitChildren(target, donor, rng) {
    var all = targets().filter(function (node) { return node !== target && !target.contains(node) && !node.contains(target); });
    var destination = pick(rng, all);
    if (!destination || target.childNodes.length < 2) return digestSnippet(target, donor, rng);
    Array.prototype.slice.call(target.childNodes).forEach(function (child, i) { if ((i + serial) % 2) destination.appendChild(child); });
    destination.dataset.cannibalReceiver = donor.id;
    copySkin(destination, donor, rng);
    return destination;
  }

  function becomeChart(target, donor, rng) {
    if (target.querySelector("a[href], button, input") || !global.LabCharts) return digestSnippet(target, donor, rng);
    var memoryText = (target.textContent || "").trim().slice(0, 140);
    target.textContent = "";
    target.className = "generative-chart cannibal-chart";
    target.dataset.chart = pick(rng, donor.charts && donor.charts.length ? donor.charts : global.LabCharts.modes, "scatter");
    target.dataset.cannibalChart = donor.id;
    var canvas = document.createElement("canvas");
    canvas.dataset.height = String(120 + Math.floor(rng() * 260));
    var caption = document.createElement("figcaption");
    caption.textContent = memoryText || "una zona digerida de " + donor.id;
    target.appendChild(canvas);
    target.appendChild(caption);
    global.LabCharts.hydrate(target.parentNode || document);
    chromatize(target, donor.palette, serial);
    return target;
  }

  function bite(reason) {
    if (!genomes.length || serial >= budget || document.documentElement.classList.contains("quiet")) return null;
    var rng = rngFrom(signature() + ":bite:" + serial);
    var donor = donorFor(rng);
    var pool = targets();
    var target = pick(rng, pool);
    if (!donor || !target) return null;
    var operations = ["skin", "tag", "digest", "split", "chart", "text"];
    var operation = operations[(hash32(donor.id + config.id + serial) + Math.floor(rng() * operations.length)) % operations.length];
    serial += 1;
    var result;
    if (operation === "skin") result = copySkin(target, donor, rng);
    else if (operation === "tag") result = changeTag(target, donor, rng);
    else if (operation === "digest") result = digestSnippet(target, donor, rng);
    else if (operation === "split") result = splitChildren(target, donor, rng);
    else if (operation === "chart") result = becomeChart(target, donor, rng);
    else {
      target.insertBefore(document.createTextNode(decode(pick(rng, donor.texts, donor.id)) + " "), target.firstChild);
      target.dataset.cannibalText = donor.id;
      result = copySkin(target, donor, rng);
    }
    var detail = { source: donor.id, operation: operation, reason: reason || "azar", target: result && result.tagName };
    if (global.LabEvents) global.LabEvents.record("canibal", donor.id + " / " + operation + " / " + (reason || "azar"));
    try { global.dispatchEvent(new CustomEvent("lab:canibal", { detail: detail })); } catch (error) { /* señal opcional */ }
    return detail;
  }

  function primitiveFrom(donor, rng, index) {
    var element;
    if (donor.snippets && donor.snippets.length && rng() < .46) {
      var template = document.createElement("template");
      template.innerHTML = pick(rng, donor.snippets);
      element = template.content.firstElementChild;
      if (element) element = sanitize(element);
    }
    if (!element || safeTags.indexOf(element.tagName.toLowerCase()) < 0) {
      var tag = pick(rng, (donor.tags || []).filter(function (name) { return safeTags.indexOf(name) >= 0; }), "div");
      element = document.createElement(tag);
      element.textContent = decode(rng() < .32 ? pick(rng, donor.code, donor.id) : pick(rng, donor.texts, donor.id));
    }
    element.classList.add("cannibal-primitive");
    element.dataset.cannibalSource = donor.id;
    element.style.setProperty("--primitive-col", String(2 + Math.floor(rng() * 8)));
    element.style.setProperty("--primitive-row", String(1 + Math.floor(rng() * 5)));
    element.style.setProperty("--primitive-r", (-9 + rng() * 18).toFixed(2) + "deg");
    element.style.setProperty("--primitive-size", (8 + rng() * (index % 7 === 0 ? 48 : 18)).toFixed(1) + "px");
    element.style.setProperty("--primitive-border", donor.palette[2 + (index % 4)]);
    if (index % 6 === 0) {
      element.classList.add("cannibal-absolute");
      element.style.setProperty("--primitive-x", (rng() * 78).toFixed(1) + "%");
      element.style.setProperty("--primitive-y", (rng() * 82).toFixed(1) + "%");
      element.style.setProperty("--primitive-w", (160 + rng() * 430).toFixed(0) + "px");
    }
    copySkin(element, donor, rng);
    return element;
  }

  function compose() {
    var stage = document.querySelector(".cannibal-stage");
    if (!stage || !genomes.length) return;
    var count = Math.max(16, Number(config.cannibalIntensity || 24));
    for (var i = 0; i < count; i += 1) {
      var rng = rngFrom(signature() + ":primitive:" + i);
      var donor = donorFor(rng);
      if (!donor) continue;
      if (i % 8 === 0 && global.LabCharts) {
        var figure = document.createElement("figure");
        figure.className = "generative-chart cannibal-primitive cannibal-chart";
        figure.dataset.chart = pick(rng, donor.charts && donor.charts.length ? donor.charts : global.LabCharts.modes, "stream");
        figure.dataset.cannibalSource = donor.id;
        figure.style.setProperty("--primitive-col", String(3 + Math.floor(rng() * 8)));
        figure.style.setProperty("--primitive-row", String(2 + Math.floor(rng() * 4)));
        figure.innerHTML = "<canvas></canvas><figcaption>código digerido de " + donor.id + "</figcaption>";
        chromatize(figure, donor.palette, i);
        stage.appendChild(figure);
      } else stage.appendChild(primitiveFrom(donor, rng, i));
    }
    if (global.LabCharts) global.LabCharts.hydrate(stage);
    if (global.LabEvents) global.LabEvents.record("canibal", count + " primitivos ensamblaron la página " + config.id, "canibal-compose:" + config.id);
  }

  function init() {
    if (!genomes.length || !config.id) return;
    if (config.topology === "cannibal") compose();
    else if (config.topology !== "empty" && rngFrom(signature() + ":initial")() < .64) bite("carga inicial");

    document.addEventListener("dblclick", function () { interactions += 1; bite("doble clic"); });
    document.addEventListener("pointerdown", function (event) {
      interactions += 1;
      if (interactions % 6 === 0 && !event.target.closest("a, button, input, textarea, select")) bite("seis gestos");
    });
    document.addEventListener("keydown", function (event) { if (event.key.toLowerCase() === "c") bite("tecla c"); });
    global.addEventListener("scroll", function () {
      var position = global.scrollX + global.scrollY;
      if (Math.abs(position - lastScroll) < 900) return;
      lastScroll = position;
      interactions += 1;
      bite("desplazamiento");
    }, { passive: true });
    if (!global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = global.setInterval(function () { bite("tiempo"); }, 11000 + hash32(signature()) % 13000);
    }
    global.addEventListener("pagehide", function () { if (timer) global.clearInterval(timer); }, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabCannibal = Object.freeze({ bite: bite, compose: compose, signature: signature, targets: targets });
})(window);
