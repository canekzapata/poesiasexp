(function (global) {
  "use strict";

  var C = global.LAB_CORPUS || {};
  var R = global.LabRoutes;
  var config = global.LAB_PAGE || {};
  var rng = R ? R.rngFrom(R.seed + ":" + (config.id || "portal") + ":runtime") : Math.random;
  var pick = function (list) { return list && list.length ? list[Math.floor(rng() * list.length)] : "∅"; };

  function shuffleChildren(parent) {
    var children = Array.prototype.slice.call(parent.children);
    for (var i = children.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      parent.appendChild(children[j]);
      children.splice(j, 1);
    }
  }

  function dragWindows() {
    Array.prototype.forEach.call(document.querySelectorAll(".poem-window"), function (win) {
      var bar = win.querySelector(".window-bar");
      var close = win.querySelector(".window-close");
      if (close && !close.dataset.bound) {
        close.dataset.bound = "1";
        close.addEventListener("click", function () {
          var residue = document.createElement("span");
          residue.className = "window-residue comment-visible";
          residue.style.left = getComputedStyle(win).left;
          residue.style.top = getComputedStyle(win).top;
          residue.textContent = pick(C.comentariosHTML);
          win.replaceWith(residue);
        });
      }
      if (!bar || bar.dataset.bound) return;
      bar.dataset.bound = "1";
      bar.addEventListener("pointerdown", function (down) {
        if (down.target.closest("button")) return;
        var rect = win.getBoundingClientRect();
        var dx = down.clientX - rect.left;
        var dy = down.clientY - rect.top;
        bar.setPointerCapture(down.pointerId);
        function move(event) {
          win.style.left = Math.max(-rect.width + 30, Math.min(innerWidth - 30, event.clientX - dx)) + "px";
          win.style.top = Math.max(0, Math.min(innerHeight - 20, event.clientY - dy)) + "px";
          win.style.setProperty("--x", win.style.left);
          win.style.setProperty("--y", win.style.top);
        }
        function up() {
          bar.removeEventListener("pointermove", move);
          bar.removeEventListener("pointerup", up);
        }
        bar.addEventListener("pointermove", move);
        bar.addEventListener("pointerup", up);
      });
    });
  }

  function table() {
    var t = document.querySelector(".lab-table");
    if (!t) return;
    t.addEventListener("click", function (event) {
      var cell = event.target.closest("td");
      if (!cell || event.target.closest("a")) return;
      cell.classList.toggle("alive");
      if (rng() < .28 && cell.parentElement) shuffleChildren(cell.parentElement);
      if (rng() < .12) cell.remove();
    });
  }

  function field() {
    Array.prototype.forEach.call(document.querySelectorAll(".cursor-migrant"), function (node) {
      document.addEventListener("pointermove", function (event) {
        var rect = node.getBoundingClientRect();
        var dx = rect.left + rect.width / 2 - event.clientX;
        var dy = rect.top + rect.height / 2 - event.clientY;
        if (Math.hypot(dx, dy) < 160) {
          node.style.left = Math.max(0, parseFloat(node.style.left || 0) + Math.sign(dx) * 40) + "px";
          node.style.top = Math.max(0, parseFloat(node.style.top || 0) + Math.sign(dy) * 40) + "px";
        }
      }, { passive: true });
    });
  }

  function hydrateFrames() {
    Array.prototype.forEach.call(document.querySelectorAll("iframe[data-src]"), function (frame) {
      var maxDepth = Number(config.iframeDepth || 2);
      if (!R || R.depth >= maxDepth) {
        var label = document.createElement("div");
        label.className = "micro";
        label.textContent = pick(C.altText);
        frame.replaceWith(label);
        return;
      }
      frame.src = R.carrySeed(frame.dataset.src, { depth: R.depth + 1 });
      frame.removeAttribute("data-src");
    });
  }

  function windows() { hydrateFrames(); dragWindows(); }

  function iframes() {
    hydrateFrames();
  }

  function form() {
    var oracle = document.querySelector(".oracle-form");
    if (!oracle) return;
    var density = oracle.querySelector("input[type=range]");
    var textarea = oracle.querySelector("textarea");
    oracle.addEventListener("change", function (event) {
      if (event.target.matches("input[type=checkbox]")) {
        var node = document.createElement(event.target.checked ? "section" : "del");
        node.className = "mortal";
        node.textContent = event.target.checked ? pick(C.fragmentos) : pick(C.microtextos);
        oracle.appendChild(node);
      }
      if (event.target.matches("select")) {
        document.documentElement.style.setProperty("--bg", event.target.value);
      }
      if (event.target.matches("input[type=radio]")) {
        document.body.classList.toggle("mutated-invert");
      }
    });
    if (density) density.addEventListener("input", function () {
      var desired = Math.floor(Number(density.value) / 7);
      while (oracle.querySelectorAll(".oracle-spawn").length < desired) {
        var a = document.createElement("a");
        a.className = "route oracle-spawn";
        a.href = pick(R.destinations()) || "#";
        a.textContent = pick(C.enlaces);
        oracle.appendChild(a);
      }
    });
    if (textarea) textarea.addEventListener("input", function () {
      document.documentElement.style.setProperty("--cell", Math.max(7, Math.min(40, textarea.value.length)) + "px");
      document.title = textarea.value.slice(0, 40) || pick(C.titulosDePestana);
    });
  }

  function source() {
    document.addEventListener("click", function (event) {
      var token = event.target.closest(".code-token");
      if (!token) return;
      token.classList.toggle("executed");
      var op = token.dataset.op;
      if (op === "close") {
        var line = token.closest(".code-line");
        if (line) line.replaceWith(document.createComment("línea cerrada"));
      } else if (op === "href") {
        token.insertAdjacentHTML("afterend", " <a class=\"route\" href=\"../mapa.html\">" + pick(C.enlaces) + "</a>");
      } else if (op === "class") {
        document.body.classList.toggle("mutated-sideways");
      } else if (op === "div") {
        var div = document.createElement("div");
        div.className = "code-line";
        div.textContent = pick(C.comentariosHTML);
        token.closest(".code-line").after(div);
      }
    });
  }

  function cellular() {
    var canvas = document.querySelector(".cellular-canvas");
    if (!canvas || !global.LabAutomata) return;
    var style = getComputedStyle(document.documentElement);
    var palette = [style.getPropertyValue("--bg").trim(), style.getPropertyValue("--fg").trim(), style.getPropertyValue("--a").trim(), style.getPropertyValue("--b").trim(), style.getPropertyValue("--c").trim()];
    global.__stopAutomata = global.LabAutomata.paint(canvas, {
      rule: Number(config.cellularRule || 90),
      cell: Number(config.cellSize || 8),
      density: Number(config.cellDensity || .18),
      palette: palette,
      rng: rng,
      animated: !matchMedia("(prefers-reduced-motion: reduce)").matches && config.rhythm !== "still"
    });
  }

  function index() {
    var area = document.querySelector(".explosive-index");
    if (!area) return;
    area.addEventListener("click", function (event) {
      var a = event.target.closest("a.route");
      if (!a || a.dataset.action === "normal") return;
      if (a.dataset.action !== "multiply") return;
      event.preventDefault();
      var count = 2 + Math.floor(rng() * 7);
      for (var i = 0; i < count; i += 1) {
        var clone = a.cloneNode(true);
        clone.textContent = pick(C.enlaces);
        clone.style.setProperty("--r", (-20 + rng() * 40) + "deg");
        clone.style.setProperty("--s", (7 + rng() * 32) + "px");
        clone.dataset.action = rng() < .2 ? "destroy" : "multiply";
        area.insertBefore(clone, a.nextSibling);
      }
      if (area.querySelectorAll("a").length > 190) {
        area.innerHTML = "<div class=\"index-collapse\">" + pick(C.tablas) + "<br>" + pick(C.tablas) + "<br>" + pick(C.tablas) + "</div>";
      }
    });
  }

  function empty() {
    var world = document.querySelector(".empty-world");
    if (!world) return;
    var clue = world.querySelector(".micro");
    var timer = setTimeout(function () { if (clue) clue.style.color = "var(--a)"; }, 6500);
    global.addEventListener("pagehide", function () { clearTimeout(timer); }, { once: true });
  }

  function error() {
    var formNode = document.querySelector(".repair-form");
    if (!formNode) return;
    formNode.addEventListener("submit", function (event) {
      event.preventDefault();
      var body = document.querySelector(".error-body");
      if (body) body.insertAdjacentHTML("afterbegin", "<p class=\"comment-visible\">" + pick(C.comentariosHTML) + " " + pick(C.errores) + "</p>");
    });
  }

  function glyphs() {
    var layers = document.querySelectorAll(".glyph-layer");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var onScroll = function () {
      Array.prototype.forEach.call(layers, function (layer, i) {
        layer.style.transform = "translateX(" + ((global.scrollY * (i + 1) * .03) % 80 - 40) + "px)";
      });
    };
    global.addEventListener("scroll", onScroll, { passive: true });
  }

  function destruction() {
    var mortals = Array.prototype.slice.call(document.querySelectorAll(".mortal"));
    mortals.forEach(function (node, i) {
      var life = 1800 + i * 270 + rng() * 9000;
      var timer = setTimeout(function () {
        node.classList.add("dying");
        setTimeout(function () {
          if (!node.isConnected) return;
          var residue = document.createElement("span");
          residue.className = "residue";
          residue.textContent = "<" + node.tagName.toLowerCase() + " data-ausente=\"" + i + "\">";
          node.replaceWith(residue);
        }, 1050);
      }, life);
      global.addEventListener("pagehide", function () { clearTimeout(timer); }, { once: true });
    });
  }

  function reproducer() {
    var fieldNode = document.querySelector(".reproducer-field");
    if (!fieldNode) return;
    fieldNode.addEventListener("dblclick", function (event) {
      var existing = fieldNode.querySelectorAll(".descendant");
      if (existing.length >= 24) existing[0].remove();
      var child = document.createElement("section");
      child.className = "descendant";
      child.style.setProperty("--x", Math.max(0, event.clientX - 90) + "px");
      child.style.setProperty("--y", Math.max(0, event.clientY - 50) + "px");
      child.style.setProperty("--w", (140 + rng() * 240) + "px");
      child.style.setProperty("--h", (60 + rng() * 180) + "px");
      child.style.setProperty("--desc-bg", rng() < .5 ? "var(--a)" : "var(--c)");
      child.style.setProperty("--desc-fg", "#000");
      child.style.setProperty("--desc-shadow", "var(--b)");
      child.textContent = pick(C.fragmentos);
      fieldNode.appendChild(child);
    });
  }

  function init() {
    var topology = config.topology || document.body.dataset.topology;
    var handlers = {
      table: table, field: field, corridor: function () {}, vertical: function () {},
      windows: windows, iframes: iframes, form: form, source: source,
      cellular: cellular, index: index, empty: empty, error: error,
      glyphs: glyphs, destruction: destruction, reproducer: reproducer
    };
    if (handlers[topology]) handlers[topology]();
    dragWindows();
  }

  global.LabGrammars = Object.freeze({ init: init, dragWindows: dragWindows, pick: pick });
})(window);
