(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var seedText = params.get("seed") || ("canibal-" + Date.now().toString(36));
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var world = document.getElementById("cannibal-world");
  var windowsRoot = document.getElementById("windows");
  var spillRoot = document.getElementById("spill-field");
  var veinField = document.getElementById("vein-field");
  var veinsRoot = document.getElementById("veins");
  var field = document.getElementById("strata-field");
  var status = document.getElementById("status");
  var estratosFrame = document.getElementById("donor-estratos");
  var letrasFrame = document.getElementById("donor-letras");
  var fieldContext = field.getContext("2d", { alpha: false });
  var donorState = { estratos: false, letras: false, corpus: Boolean(window.LAB_CORPUS) };
  var tiles = [];
  var windowSerial = 0;
  var spillSerial = 0;
  var raf = 0;
  var lastFieldFrame = 0;
  var mutationTimer = 0;
  var spillTimer = 0;
  var zCounter = 100;
  var veinSerial = 0;
  var quiet = false;
  var palette = ["#f8f7f1", "#050505", "#ff4fa3", "#147bff", "#b7ff3c", "#ff652b", "#ffd400", "#5a2dff"];

  var sources = [
    { id: "estratos", title: "ESTRATOS / PAISAJE QUE PIENSA", href: "../estratos/index.html", kind: "canvas" },
    { id: "lasletras", title: "ESPACIO ESCULTÓRICO / SIGNOS", href: "../lasletras/index.html", kind: "svg" },
    { id: "otrorio", title: "OTRO RÍO / VENTANA MADRE", href: "../otrorio/index.html", kind: "text" },
    { id: "laberinto", title: "LABERINTO / REGLA LOCAL", href: "../laberinto/laberinto/index.html", kind: "text" },
    { id: "loop", title: "LOOP NAVE / TEXTO DAÑADO", href: "../poemario/loop-nave/index.html", kind: "text" },
    { id: "escape", title: "ESCAPE / CANDIDATE WINDOW", href: "../escape/index.html", kind: "text" }
  ];

  var fallbackTexts = [
    "la página recuerda otra página",
    "el archivo guarda todo menos el momento en que fue leído",
    "el fondo no proviene del fondo",
    "una ventana puede olvidar su pared",
    "la corriente piensa sin centro",
    "el texto no fue escrito: fue encontrado escribiéndose",
    "una célula contiene un cielo",
    "el sistema pregunta si deseo restaurar la escena",
    "otra agua en el mismo río",
    "la nave oyó llover dentro del monitor",
    "lo ilegible es su futuro",
    "el documento también navega",
    "cables como algas",
    "la forma duda de sí",
    "una esfera sueña la página que la contiene"
  ];

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) {
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeRng(text) {
    var state = hash32(text);
    return function () {
      var t = state += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var random = makeRng(seedText);

  function pick(list, fallback) {
    return list && list.length ? list[Math.floor(random() * list.length)] : fallback;
  }

  function between(min, max) {
    return min + random() * (max - min);
  }

  function corpusPools() {
    var corpus = window.LAB_CORPUS || {};
    var writing = corpus.escrituras || {};
    return []
      .concat(corpus.monumentales || [])
      .concat(corpus.fragmentos || [])
      .concat(corpus.microtextos || [])
      .concat(corpus.ventanas || [])
      .concat(writing.literaria || [])
      .concat(writing.visual || [])
      .concat(writing.fauxCodigo || [])
      .concat(fallbackTexts);
  }

  function textFor(salt) {
    var pool = corpusPools();
    return pool[hash32(seedText + ":" + salt + ":" + spillSerial) % pool.length] || "otra ventana";
  }

  function sourceFor(kind) {
    var pool = kind ? sources.filter(function (source) { return source.kind === kind; }) : sources;
    return pick(pool.length ? pool : sources, sources[0]);
  }

  function donorDocument(frame) {
    try {
      return frame.contentDocument || frame.contentWindow.document;
    } catch (error) {
      return null;
    }
  }

  function donorCanvas() {
    var doc = donorDocument(estratosFrame);
    return doc && doc.querySelector("#world");
  }

  function donorOverlay() {
    var doc = donorDocument(estratosFrame);
    return doc && doc.querySelector("#overlay");
  }

  function donorSvg() {
    var doc = donorDocument(letrasFrame);
    return doc && doc.querySelector("#lamina");
  }

  function loadDonors() {
    var estratosURL = new URL("../estratos/index.html", location.href);
    estratosURL.searchParams.set("seed", seedText + "-paisaje");
    var letrasURL = new URL("../lasletras/index.html", location.href);
    letrasURL.searchParams.set("seed", seedText + "-escultura");

    estratosFrame.addEventListener("load", function () {
      window.setTimeout(function () {
        donorState.estratos = Boolean(donorCanvas());
        updateStatus();
      }, 900);
    }, { once: true });
    letrasFrame.addEventListener("load", function () {
      window.setTimeout(function () {
        donorState.letras = Boolean(donorSvg());
        refreshSculptures();
        updateStatus();
      }, 1400);
    }, { once: true });

    estratosFrame.src = estratosURL.href;
    letrasFrame.src = letrasURL.href;
  }

  function updateStatus() {
    var active = Object.keys(donorState).filter(function (key) { return donorState[key]; });
    status.textContent = "seed " + seedText + " / órganos " + active.join("+");
  }

  function resizeField() {
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    var width = Math.max(1, innerWidth);
    var height = Math.max(1, innerHeight);
    field.width = Math.round(width * dpr);
    field.height = Math.round(height * dpr);
    field.style.width = width + "px";
    field.style.height = height + "px";
    fieldContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    veinField.setAttribute("viewBox", "0 0 " + width + " " + Math.max(height * 2.2, 1500));
    veinField.setAttribute("preserveAspectRatio", "none");
    makeTiles(width, height);
  }

  function veinPath(width, height, serial) {
    var side = serial % 4;
    var startX = side === 0 ? -40 : side === 1 ? width + 40 : between(0, width);
    var startY = side === 2 ? -30 : between(20, height * .28);
    var endX = side === 0 ? width + 80 : side === 1 ? -80 : between(0, width);
    var endY = between(height * .55, height + 80);
    var c1x = between(-width * .15, width * 1.15);
    var c1y = between(height * .08, height * .48);
    var c2x = between(-width * .15, width * 1.15);
    var c2y = between(height * .42, height * .92);
    return [
      "M", startX.toFixed(1), startY.toFixed(1),
      "C", c1x.toFixed(1), c1y.toFixed(1),
      c2x.toFixed(1), c2y.toFixed(1),
      endX.toFixed(1), endY.toFixed(1)
    ].join(" ");
  }

  function createVein(linked) {
    var ns = "http://www.w3.org/2000/svg";
    var source = sourceFor();
    veinSerial += 1;
    var serial = veinSerial;
    var width = Math.max(innerWidth, 320);
    var height = Math.max(innerHeight * 2.2, 1500);
    var group = document.createElementNS(ns, "g");
    group.classList.add("vein");
    group.style.setProperty("--vein-color", pick(palette, "#ff4fa3"));
    group.style.setProperty("--vein-width", between(.7, serial % 9 === 0 ? 9 : 3.2).toFixed(2) + "px");
    group.style.setProperty("--vein-type", between(8, serial % 7 === 0 ? 25 : 15).toFixed(1) + "px");
    group.style.setProperty("--vein-speed", between(9, 34).toFixed(1) + "s");
    group.style.setProperty("--vein-dash", [
      between(1, 8).toFixed(0),
      between(3, 20).toFixed(0),
      between(4, 34).toFixed(0),
      between(2, 13).toFixed(0)
    ].join(" "));

    var pathId = "vein-path-" + serial;
    var pathData = veinPath(width, height, serial);
    var shadow = document.createElementNS(ns, "path");
    shadow.setAttribute("class", "vein-shadow");
    shadow.setAttribute("d", pathData);

    var link = document.createElementNS(ns, "a");
    link.classList.add("vein-link");
    link.setAttribute("href", source.href);
    link.setAttribute("aria-label", "Seguir vena hacia " + source.title);

    var line = document.createElementNS(ns, "path");
    line.setAttribute("id", pathId);
    line.setAttribute("class", "vein-line");
    line.setAttribute("d", pathData);
    var hit = document.createElementNS(ns, "path");
    hit.setAttribute("class", "vein-hit");
    hit.setAttribute("d", pathData);

    var text = document.createElementNS(ns, "text");
    text.setAttribute("dy", serial % 2 ? "-7" : "16");
    var textPath = document.createElementNS(ns, "textPath");
    textPath.setAttribute("href", "#" + pathId);
    textPath.setAttribute("startOffset", between(0, 52).toFixed(1) + "%");
    var phrase = textFor("vein:" + serial);
    textPath.textContent = (
      phrase + "  ◇  " + source.title + "  ↗  " + phrase + "  ◇  "
    ).repeat(serial % 5 === 0 ? 3 : 2);
    text.appendChild(textPath);

    link.append(line, hit, text);
    group.append(shadow, link);
    veinsRoot.appendChild(group);

    if (!linked) {
      link.removeAttribute("href");
      link.removeAttribute("aria-label");
      link.style.pointerEvents = "none";
    }
    return group;
  }

  function buildVeins() {
    veinsRoot.replaceChildren();
    veinSerial = 0;
    var count = innerWidth < 720 ? 12 : 24;
    for (var i = 0; i < count; i += 1) createVein(i % 3 !== 1);
  }

  function makeTiles(width, height) {
    tiles = [];
    var targetCount = width < 720 ? 420 : 1000;
    var base = Math.max(7, Math.sqrt((width * height) / targetCount));
    for (var i = 0; i < targetCount; i += 1) {
      var size = base * between(.45, 2.4);
      tiles.push({
        x: between(-size, width),
        y: between(-size, height),
        w: size * between(.75, 2.7),
        h: size * between(.55, 2.25),
        sx: between(0, 660),
        sy: between(0, 930),
        sw: between(20, 180),
        sh: between(20, 210),
        alpha: between(.12, .82),
        mode: pick(["source-over", "screen", "difference", "multiply"], "source-over"),
        phase: between(0, Math.PI * 2),
        speed: between(.00008, .00045)
      });
    }
  }

  function drawFallbackTile(tile, time) {
    var pulse = Math.sin(time * tile.speed + tile.phase);
    fieldContext.strokeStyle = pick(palette, "#b7ff3c");
    fieldContext.globalAlpha = tile.alpha;
    fieldContext.beginPath();
    fieldContext.moveTo(tile.x, tile.y + tile.h * .5);
    fieldContext.lineTo(tile.x + tile.w * .25, tile.y + tile.h * (.25 + pulse * .2));
    fieldContext.lineTo(tile.x + tile.w * .55, tile.y + tile.h * (.7 - pulse * .15));
    fieldContext.lineTo(tile.x + tile.w, tile.y + tile.h * .4);
    fieldContext.stroke();
  }

  function drawField(time) {
    raf = requestAnimationFrame(drawField);
    if (quiet || time - lastFieldFrame < (reduceMotion ? 800 : 145)) return;
    lastFieldFrame = time;

    var width = innerWidth;
    var height = innerHeight;
    var source = donorCanvas();
    var overlay = donorOverlay();
    fieldContext.globalCompositeOperation = "source-over";
    fieldContext.globalAlpha = 1;
    fieldContext.fillStyle = "#050505";
    fieldContext.fillRect(0, 0, width, height);

    for (var i = 0; i < tiles.length; i += 1) {
      var tile = tiles[i];
      var pulse = Math.sin(time * tile.speed + tile.phase);
      fieldContext.save();
      fieldContext.globalAlpha = tile.alpha * (.78 + pulse * .2);
      fieldContext.globalCompositeOperation = tile.mode;
      fieldContext.translate(tile.x + tile.w / 2, tile.y + tile.h / 2);
      fieldContext.rotate(pulse * .055);
      if (source && source.width) {
        try {
          fieldContext.drawImage(
            source,
            tile.sx % Math.max(1, source.width - tile.sw),
            tile.sy % Math.max(1, source.height - tile.sh),
            tile.sw,
            tile.sh,
            -tile.w / 2,
            -tile.h / 2,
            tile.w,
            tile.h
          );
          if (overlay && i % 19 === 0) {
            fieldContext.drawImage(overlay, -tile.w / 2, -tile.h / 2, tile.w, tile.h);
          }
        } catch (error) {
          drawFallbackTile(tile, time);
        }
      } else {
        fieldContext.translate(-tile.w / 2, -tile.h / 2);
        drawFallbackTile(tile, time);
      }
      fieldContext.restore();
    }
    fieldContext.globalCompositeOperation = "source-over";
    fieldContext.globalAlpha = 1;
  }

  function sanitizeClone(node, prefix) {
    var all = [node].concat(Array.prototype.slice.call(node.querySelectorAll("*")));
    all.forEach(function (item, index) {
      if (item.removeAttribute) {
        item.removeAttribute("onclick");
        item.removeAttribute("tabindex");
        if (item.id) item.id = prefix + "-" + index;
      }
    });
    return node;
  }

  function makeFallbackSculpture(svg, serial) {
    var ns = "http://www.w3.org/2000/svg";
    var group = document.createElementNS(ns, "g");
    var glyphs = Array.from("𐀀░▒▓◯△⌇∿𓀀𔐀");
    for (var i = 0; i < 95; i += 1) {
      var text = document.createElementNS(ns, "text");
      var angle = (i / 95) * Math.PI * 2;
      var radius = 120 + Math.sin(i * .73 + serial) * 72;
      text.setAttribute("x", String(500 + Math.cos(angle) * radius));
      text.setAttribute("y", String(500 + Math.sin(angle) * radius));
      text.setAttribute("font-size", String(11 + (i % 7) * 3));
      text.textContent = glyphs[i % glyphs.length];
      group.appendChild(text);
    }
    svg.appendChild(group);
  }

  function fillSculpture(svg, serial) {
    svg.replaceChildren();
    var source = donorSvg();
    if (!source) {
      makeFallbackSculpture(svg, serial);
      return;
    }
    var candidates = Array.prototype.slice.call(source.children).filter(function (node) {
      return !/^(title|desc|style|script|defs)$/i.test(node.tagName);
    });
    if (!candidates.length) {
      makeFallbackSculpture(svg, serial);
      return;
    }
    var amount = Math.min(candidates.length, 2 + Math.floor(random() * 6));
    for (var i = 0; i < amount; i += 1) {
      var sourceNode = candidates[(hash32(seedText + ":" + serial + ":" + i) + i) % candidates.length];
      var clone = sanitizeClone(sourceNode.cloneNode(true), "graft-" + serial + "-" + i);
      svg.appendChild(clone);
    }
  }

  function makeSculpture(serial) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.classList.add("sculpture-fragment");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", pick(["xMidYMid meet", "xMidYMid slice", "xMinYMin slice"], "xMidYMid meet"));
    svg.style.setProperty("--breath", between(7, 22).toFixed(2) + "s");
    fillSculpture(svg, serial);
    return svg;
  }

  function refreshSculptures() {
    Array.prototype.forEach.call(document.querySelectorAll(".sculpture-fragment"), function (svg, index) {
      fillSculpture(svg, index + 1);
    });
  }

  function paintWindowCanvas(canvas, serial) {
    var context = canvas.getContext("2d");
    var source = donorCanvas();
    var width = Math.max(250, canvas.clientWidth || 400);
    var height = Math.max(140, canvas.clientHeight || 230);
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.fillStyle = pick(palette, "#050505");
    context.fillRect(0, 0, width, height);
    if (source && source.width) {
      for (var i = 0; i < 19; i += 1) {
        var dw = between(40, width * .72);
        var dh = between(35, height * .65);
        context.globalAlpha = between(.25, .9);
        context.globalCompositeOperation = pick(["source-over", "screen", "difference"], "source-over");
        try {
          context.drawImage(
            source,
            (hash32(seedText + serial + i) % Math.max(1, source.width - 140)),
            (hash32(serial + ":" + i) % Math.max(1, source.height - 180)),
            between(40, 180),
            between(50, 240),
            between(-30, width - 20),
            between(-20, height - 10),
            dw,
            dh
          );
        } catch (error) {}
      }
    } else {
      context.fillStyle = pick(palette, "#f8f7f1");
      context.font = "bold 28px monospace";
      context.fillText(textFor("canvas-" + serial).slice(0, 22), 12, 50);
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }

  function makeTextOrgan(source, serial) {
    var organ = document.createElement("div");
    organ.className = "text-organ";
    organ.textContent = textFor(source.id + ":" + serial);
    var note = document.createElement("small");
    note.textContent = "fragmento digerido de " + source.title + " / abrir pieza";
    organ.appendChild(note);
    return organ;
  }

  function makeContent(source, serial) {
    if (source.kind === "svg") return makeSculpture(serial);
    if (source.kind === "canvas") {
      var canvas = document.createElement("canvas");
      canvas.className = "window-canvas";
      requestAnimationFrame(function () { paintWindowCanvas(canvas, serial); });
      return canvas;
    }
    return makeTextOrgan(source, serial);
  }

  function makeBar(source, windowNode) {
    var bar = document.createElement("div");
    bar.className = "window-bar";
    var marker = document.createElement("span");
    marker.textContent = "□";
    var title = document.createElement("b");
    title.textContent = source.title;
    var buttons = document.createElement("span");
    buttons.className = "window-buttons";
    var multiply = document.createElement("button");
    multiply.type = "button";
    multiply.textContent = "+";
    multiply.title = "reproducir ventana";
    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.title = "cerrar ventana";
    buttons.append(multiply, close);
    bar.append(marker, title, buttons);

    multiply.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      createWindow(Math.min(2, Number(windowNode.dataset.depth || 0) + 1), windowNode.querySelector(".nested-slot"));
      emitSpill(windowNode, true);
    });
    close.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      windowNode.classList.add("is-closing");
      windowNode.animate(
        [{ transform: getComputedStyle(windowNode).transform, opacity: 1 }, { transform: "scale(.02) rotate(23deg)", opacity: 0 }],
        { duration: 420, easing: "steps(7,end)" }
      ).finished.then(function () { windowNode.remove(); });
    });
    makeDraggable(bar, windowNode);
    return bar;
  }

  function makeDraggable(handle, node) {
    var startX = 0;
    var startY = 0;
    var originX = 0;
    var originY = 0;
    function move(event) {
      node.style.left = (originX + event.clientX - startX) + "px";
      node.style.top = (originY + event.clientY - startY) + "px";
    }
    function up() {
      node.classList.remove("is-dragging");
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    }
    handle.addEventListener("pointerdown", function (event) {
      if (event.target.closest("button") || node.dataset.depth !== "0") return;
      event.preventDefault();
      var box = node.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      originX = box.left + scrollX;
      originY = box.top + scrollY;
      node.style.setProperty("--r", "0deg");
      node.style.left = originX + "px";
      node.style.top = originY + "px";
      node.classList.add("is-dragging");
      bringFront(node);
      addEventListener("pointermove", move);
      addEventListener("pointerup", up, { once: true });
    });
  }

  function bringFront(node) {
    zCounter += 1;
    node.style.setProperty("--z", String(zCounter));
  }

  function addOutsideDrawing(windowNode, serial) {
    if (random() > .74) return;
    var canvas = document.createElement("canvas");
    canvas.className = "outside-drawing";
    canvas.style.setProperty("--ow", between(110, 420).toFixed(0) + "px");
    canvas.style.setProperty("--oh", between(80, 270).toFixed(0) + "px");
    canvas.style.setProperty("--ox", between(-230, 260).toFixed(0) + "px");
    canvas.style.setProperty("--oy", between(-160, 220).toFixed(0) + "px");
    canvas.style.setProperty("--or", between(-25, 25).toFixed(2) + "deg");
    canvas.style.setProperty("--hue", between(-80, 100).toFixed(0) + "deg");
    windowNode.appendChild(canvas);
    requestAnimationFrame(function () { paintWindowCanvas(canvas, serial + 5000); });
  }

  function createWindow(depth, parent) {
    depth = Number(depth || 0);
    if (windowSerial > 58) return null;
    windowSerial += 1;
    var serial = windowSerial;
    var source = sourceFor();
    if (serial === 1) source = sourceFor("svg");
    if (serial === 2) source = sourceFor("canvas");

    var node = document.createElement("article");
    node.className = "cannibal-window";
    node.dataset.depth = String(depth);
    node.dataset.source = source.id;
    node.style.setProperty("--window-bg", pick(palette, "#f8f7f1"));
    node.style.setProperty("--window-fg", pick(palette, "#050505"));
    node.style.setProperty("--window-accent", pick(palette, "#ff4fa3"));
    node.style.setProperty("--r", between(-8, 8).toFixed(2) + "deg");
    node.style.setProperty("--z", String(20 + serial));
    node.style.setProperty("--nested-x", between(-24, 26).toFixed(0) + "px");
    node.style.setProperty("--nested-y", between(-8, 25).toFixed(0) + "px");

    if (depth === 0) {
      var worldHeight = Math.max(innerHeight * 2.1, 1500);
      node.style.setProperty("--x", between(-6, 82).toFixed(2) + "vw");
      node.style.setProperty("--y", between(3, worldHeight - 350).toFixed(0) + "px");
      node.style.setProperty("--w", between(220, Math.min(610, innerWidth * .66)).toFixed(0) + "px");
      node.style.setProperty("--h", between(170, 440).toFixed(0) + "px");
    } else {
      node.style.setProperty("--h", between(110, 300).toFixed(0) + "px");
    }

    node.appendChild(makeBar(source, node));
    var link = document.createElement("a");
    link.className = "window-source";
    link.href = source.href;
    link.title = "Abrir la pieza donante: " + source.title;
    link.setAttribute("aria-label", "Fragmento de " + source.title + ". Abrir pieza original.");
    link.appendChild(makeContent(source, serial));
    node.appendChild(link);

    var nested = document.createElement("div");
    nested.className = "nested-slot";
    node.appendChild(nested);
    (parent || windowsRoot).appendChild(node);
    addOutsideDrawing(node, serial);
    node.addEventListener("pointerdown", function () { bringFront(node); });

    if (depth < 2 && random() < (depth === 0 ? .48 : .24)) {
      createWindow(depth + 1, nested);
    }
    if (depth === 0 && random() < .78) emitSpill(node, random() < .38);
    return node;
  }

  function emitSpill(originNode, linked) {
    if (quiet || spillSerial > 180) return;
    spillSerial += 1;
    var source = sourceFor();
    var box = originNode && originNode.getBoundingClientRect
      ? originNode.getBoundingClientRect()
      : { left: between(0, innerWidth), top: between(0, innerHeight), width: 0, height: 0 };
    var node = document.createElement(linked ? "a" : "span");
    node.className = "spill" + (linked ? " is-link" : "");
    if (linked) {
      node.href = source.href;
      node.title = "Abrir " + source.title;
    }
    var text = textFor("spill:" + spillSerial);
    node.textContent = text;
    node.style.left = (box.left + scrollX + between(-90, Math.max(40, box.width))) + "px";
    node.style.top = (box.top + scrollY + between(-60, Math.max(60, box.height))) + "px";
    node.style.setProperty("--z", String(5 + spillSerial % 90));
    node.style.setProperty("--spill-fg", pick(palette, "#f8f7f1"));
    node.style.setProperty("--spill-bg", random() < .56 ? pick(palette, "#050505") : "transparent");
    node.style.setProperty("--spill-size", between(9, spillSerial % 13 === 0 ? 70 : 34).toFixed(1) + "px");
    node.style.setProperty("--spill-r", between(-25, 25).toFixed(2) + "deg");
    node.style.setProperty("--spill-dx", between(-420, 520).toFixed(0) + "px");
    node.style.setProperty("--spill-dy", between(150, 820).toFixed(0) + "px");
    node.style.setProperty("--duration", between(7, 25).toFixed(2) + "s");
    spillRoot.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 27000);
  }

  function mutate() {
    if (quiet) return;
    var windows = Array.prototype.slice.call(document.querySelectorAll('.cannibal-window[data-depth="0"]'));
    if (!windows.length || random() < .36) createWindow(0);
    var target = pick(windows);
    if (!target) return;
    if (random() < .4) emitSpill(target, random() < .2);
    if (random() < .12 && veinSerial < 42) createVein(true);
    if (random() < .22) addOutsideDrawing(target, windowSerial + spillSerial);
    if (random() < .18) {
      target.style.setProperty("--r", between(-18, 18).toFixed(2) + "deg");
      target.style.setProperty("--window-accent", pick(palette, "#ff4fa3"));
    }
  }

  function clearWorld() {
    windowsRoot.replaceChildren();
    spillRoot.replaceChildren();
    veinsRoot.replaceChildren();
    windowSerial = 0;
    spillSerial = 0;
    veinSerial = 0;
    random = makeRng(seedText + ":" + Date.now());
  }

  function digest() {
    clearWorld();
    buildVeins();
    var count = innerWidth < 720 ? 7 : 12;
    for (var i = 0; i < count; i += 1) createWindow(0);
    for (var s = 0; s < 18; s += 1) emitSpill(null, s % 5 === 0);
  }

  function toggleQuiet() {
    quiet = !quiet;
    document.body.classList.toggle("is-quiet", quiet);
    document.querySelector('[data-command="quiet"]').textContent = quiet ? "ruido" : "quiet";
  }

  function bindControls() {
    document.querySelector('[data-command="more"]').addEventListener("click", function () { createWindow(0); });
    document.querySelector('[data-command="digest"]').addEventListener("click", digest);
    document.querySelector('[data-command="quiet"]').addEventListener("click", toggleQuiet);
    document.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "c") createWindow(0);
      if (event.key.toLowerCase() === "r") digest();
      if (event.key.toLowerCase() === "q") toggleQuiet();
    });
    world.addEventListener("dblclick", function (event) {
      if (!event.target.closest(".cannibal-window, a, button")) createWindow(0);
    });
    addEventListener("resize", resizeField);
  }

  function init() {
    loadDonors();
    bindControls();
    resizeField();
    digest();
    raf = requestAnimationFrame(drawField);
    mutationTimer = window.setInterval(mutate, reduceMotion ? 12000 : 4300);
    spillTimer = window.setInterval(function () {
      var windows = document.querySelectorAll(".cannibal-window");
      emitSpill(windows.length ? windows[Math.floor(random() * windows.length)] : null, random() < .12);
    }, reduceMotion ? 15000 : 2100);
    updateStatus();
  }

  addEventListener("pagehide", function () {
    cancelAnimationFrame(raf);
    clearInterval(mutationTimer);
    clearInterval(spillTimer);
  }, { once: true });

  init();
})();
