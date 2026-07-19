(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var R = global.LabRoutes;
  var C = global.LAB_CORPUS || {};
  var rng = R ? R.rngFrom(R.seed + ":" + (config.id || "portal") + ":mutations") : Math.random;
  var timers = [];
  var paused = false;
  var mutationCount = 0;
  var pick = function (list) { return list && list.length ? list[Math.floor(rng() * list.length)] : "∅"; };
  var candidates = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-mutable], .mortal, .micro, .glyph, .route:not([data-fixed])")); };

  function one(list) { return list.length ? list[Math.floor(rng() * list.length)] : null; }
  function later(fn, delay) {
    var id = setTimeout(function () {
      timers = timers.filter(function (timer) { return timer !== id; });
      if (!paused) fn();
    }, delay);
    timers.push(id);
    return id;
  }

  function residueFor(node, reason) {
    var residue = document.createElement("span");
    residue.className = "residue";
    residue.textContent = "<" + node.tagName.toLowerCase() + " data-residuo=\"" + reason + "\">";
    return residue;
  }

  var operations = {
    display: function (node) { node.classList.toggle("mutated-display"); },
    position: function (node) {
      node.style.position = "relative";
      node.style.left = (-40 + rng() * 80) + "px";
      node.style.top = (-30 + rng() * 60) + "px";
      node.style.zIndex = String(10 + Math.floor(rng() * 200));
    },
    tag: function (node) {
      if (!node.parentNode || node.matches("html, body, iframe, canvas")) return;
      var replacement = document.createElement(rng() < .5 ? "aside" : "mark");
      Array.prototype.forEach.call(node.attributes || [], function (attr) { replacement.setAttribute(attr.name, attr.value); });
      replacement.innerHTML = node.innerHTML;
      node.replaceWith(replacement);
    },
    multiply: function (node) {
      if (!node.parentNode || document.querySelectorAll(".mutation-copy").length > 40) return;
      var copy = node.cloneNode(true);
      copy.classList.add("mutation-copy");
      copy.style.transform = "rotate(" + (-16 + rng() * 32) + "deg) scale(" + (.55 + rng() * 1.2) + ")";
      node.after(copy);
    },
    hierarchy: function (node) {
      if (!node.parentNode || node.children.length > 4) return;
      var wrapper = document.createElement("span");
      wrapper.className = "mutated-sideways";
      node.parentNode.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    },
    serialize: function (node) {
      var pre = document.createElement("code");
      pre.className = "comment-visible";
      pre.textContent = node.outerHTML.slice(0, 260);
      node.after(pre);
    },
    link: function (node) {
      if (node.closest("a") || !R) return;
      var destinations = R.destinations();
      if (!destinations.length) return;
      var link = document.createElement("a");
      link.className = "route mutated-link";
      link.href = pick(destinations);
      link.textContent = node.textContent.slice(0, 60) || pick(C.enlaces);
      node.replaceWith(link);
    },
    comment: function (node) {
      var visible = document.createElement("span");
      visible.className = "comment-visible";
      visible.textContent = pick(C.comentariosHTML);
      node.after(visible);
    },
    relocate: function (node) {
      var target = one(Array.prototype.slice.call(document.querySelectorAll("section, td, fieldset, .window-body")));
      if (target && !node.contains(target) && target !== node.parentNode) target.appendChild(node);
    },
    swap: function (node) {
      if (!node.matches("a[href]")) return;
      var other = one(Array.prototype.slice.call(document.querySelectorAll("a[href]")));
      if (!other || other === node) return;
      var href = node.href;
      node.href = other.href;
      other.href = href;
    },
    iframe: function (node) {
      if (document.querySelectorAll("iframe").length > 10 || node.matches("iframe, canvas") || node.closest("a")) return;
      var frame = document.createElement("iframe");
      frame.title = "fragmento convertido en documento";
      frame.style.cssText = "width:min(320px,80vw);height:140px;border:2px solid currentColor;background:var(--bg)";
      frame.srcdoc = "<!doctype html><meta charset=utf-8><style>body{margin:0;padding:8px;font:12px monospace;background:#eee;color:#111;overflow-wrap:anywhere}</style>" + node.outerHTML.replace(/<script[\s\S]*?<\/script>/gi, "");
      node.replaceWith(frame);
    },
    destroy: function (node) {
      if (!node.parentNode || node.matches("a.route") && document.querySelectorAll("a.route").length < 3) return;
      node.replaceWith(residueFor(node, "mutación-" + mutationCount));
    }
  };

  function mutate() {
    if (paused || document.hidden || mutationCount >= Number(config.mutationBudget || 22)) return;
    var node = one(candidates());
    if (!node) return;
    var allowed = config.operations || ["display", "position", "multiply", "comment"];
    var name = pick(allowed);
    if (operations[name]) {
      try { operations[name](node); mutationCount += 1; } catch (error) { /* el error también deja la página viva */ }
    }
  }

  function scheduleMutations() {
    var rates = { still: 0, slow: 9000, nervous: 2400, explosive: 900, click: 0, scroll: 0, cellular: 4200 };
    var rate = rates[config.rhythm] == null ? 5500 : rates[config.rhythm];
    if (!rate || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function cycle() {
      mutate();
      later(cycle, rate * (.55 + rng() * .9));
    }
    later(cycle, rate * (.4 + rng()));
  }

  function rareEvent() {
    var eventName = config.rareEvent;
    if (!eventName || rng() > Number(config.rareProbability || .42)) return;
    if (eventName === "monument") {
      var monument = document.createElement("div");
      monument.className = "rare-monument";
      monument.textContent = pick(C.monumentales);
      document.body.appendChild(monument);
      later(function () { monument.remove(); }, 5000);
    } else if (eventName === "same-text") {
      var word = pick(C.enlaces);
      Array.prototype.forEach.call(document.querySelectorAll("a.route"), function (a) { a.textContent = word; });
    } else if (eventName === "source") {
      var source = document.createElement("pre");
      source.className = "split-copy micro";
      source.style.left = "3vw";
      source.style.top = "10vh";
      source.textContent = document.documentElement.outerHTML.slice(0, 1800);
      document.body.appendChild(source);
    } else if (eventName === "glyph-only") {
      var glyphs = Object.keys(C.glifos || {}).reduce(function (all, key) { return all.concat(C.glifos[key]); }, []);
      Array.prototype.forEach.call(document.querySelectorAll("a, p, span"), function (node) {
        if (node.children.length === 0) node.textContent = Array.from({ length: Math.max(1, Math.min(12, node.textContent.length / 3)) }, function () { return pick(glyphs); }).join("");
      });
    } else if (eventName === "migration") {
      document.documentElement.style.setProperty("--migration", rng() < .5 ? -1 : 1);
      Array.prototype.forEach.call(candidates().slice(0, 50), function (node) { node.classList.add("mutated-migration"); });
    } else if (eventName === "css-shift") {
      document.documentElement.style.setProperty("--bg", getComputedStyle(document.documentElement).getPropertyValue("--b"));
      document.documentElement.style.setProperty("--fg", getComputedStyle(document.documentElement).getPropertyValue("--c"));
      document.body.classList.add("mutated-invert");
    } else if (eventName === "future-frame" && R && R.depth < 3) {
      var href = one(R.destinations());
      if (href) R.internalWindow(R.carrySeed(href, { future: mutationCount + 1, depth: R.depth + 1 }), "versión futura");
    }
  }

  function bindConditions() {
    if (config.rhythm === "click") document.addEventListener("click", function () { if (rng() < .72) mutate(); });
    if (config.rhythm === "scroll") {
      var last = 0;
      global.addEventListener("scroll", function () {
        if (Math.abs(global.scrollY + global.scrollX - last) > 320) {
          last = global.scrollY + global.scrollX;
          mutate();
        }
      }, { passive: true });
    }
    document.addEventListener("visibilitychange", function () { paused = document.hidden || document.documentElement.classList.contains("quiet"); });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      document.documentElement.classList.toggle("quiet");
      paused = document.documentElement.classList.contains("quiet");
      if (paused && typeof global.__stopAutomata === "function") global.__stopAutomata();
    });
    global.addEventListener("pagehide", function () {
      timers.forEach(clearTimeout);
      timers = [];
      if (typeof global.__stopAutomata === "function") global.__stopAutomata();
    }, { once: true });
  }

  function mutateTitle() {
    if (!C.titulosDePestana) return;
    var count = 0;
    function next() {
      if (paused || count > 7) return;
      document.title = pick(C.titulosDePestana);
      count += 1;
      later(next, 7800 + rng() * 9000);
    }
    later(next, 6000 + rng() * 8000);
  }

  function init() {
    if (R) R.attach();
    if (global.LabGrammars) global.LabGrammars.init();
    bindConditions();
    scheduleMutations();
    mutateTitle();
    if (config.rareEvent) later(rareEvent, 4200 + rng() * 9000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.LabMotor = Object.freeze({ mutate: mutate, operations: operations });
})(window);
